import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import {
  buildBillingSummary,
  CREDIT_CYCLE_PAYMENT_CONFIRMED_KIND,
  getBillingPeriodRange,
  getMonthlyLimitForPlan,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { sendMetaConversionEvent } from "@/lib/meta-capi";
import { prisma } from "@/lib/prisma";
import {
  getPlanFromPriceId,
  getSubscriptionPeriodDates,
  mapStripeSubscriptionStatus,
  stripe,
} from "@/lib/stripe";

export const runtime = "nodejs";

function getWebhookSecret() {
  const value = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!value) {
    throw new Error("STRIPE_WEBHOOK_SECRET não configurado.");
  }

  return value;
}

const CREDIT_EVENT_TYPES = [
  UsageEventType.BANNER_GENERATION,
  UsageEventType.BANNER_EDIT,
  UsageEventType.BANNER_VARIATION,
] as const;

type PreviousSubscriptionForCarryover = {
  providerSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
} | null;

type SyncedStripeSubscription = {
  workspaceId: string;
  plan: SubscriptionPlan;
  stripeSubscriptionId: string;
  providerCustomerId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
};

function getMetadataValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getPlanFromMetadata(value: unknown) {
  const plan = getMetadataValue(value);

  if (!plan || !(plan in SubscriptionPlan)) {
    return null;
  }

  return SubscriptionPlan[plan as keyof typeof SubscriptionPlan];
}

function getCurrentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getCarryoverKey(params: {
  stripeSubscriptionId: string;
  previousPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
}) {
  const monthStart = getCurrentMonthStart();
  const monthKey = `${monthStart.getFullYear()}-${String(
    monthStart.getMonth() + 1,
  ).padStart(2, "0")}`;

  return [
    "stripe-plan-carryover",
    params.stripeSubscriptionId,
    params.previousPlan,
    params.newPlan,
    monthKey,
  ].join(":");
}

function getPaymentConfirmationKey(params: {
  stripeSubscriptionId: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  return [
    "stripe-credit-cycle-confirmed",
    params.stripeSubscriptionId,
    params.periodStart.toISOString(),
    params.periodEnd.toISOString(),
  ].join(":");
}

function hasCarryoverKey(metadata: unknown, carryoverKey: string) {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "carryoverKey" in metadata &&
    (metadata as { carryoverKey?: unknown }).carryoverKey === carryoverKey
  );
}

function hasPaymentConfirmationKey(metadata: unknown, paymentConfirmationKey: string) {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "paymentConfirmationKey" in metadata &&
    (metadata as { paymentConfirmationKey?: unknown }).paymentConfirmationKey ===
      paymentConfirmationKey
  );
}

async function ensureCreditCyclePaymentConfirmed(params: {
  workspaceId: string;
  stripeSubscriptionId: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  source: "checkout.session.completed" | "invoice.payment_succeeded" | "change-plan";
  stripeEventId?: string;
  stripeInvoiceId?: string | null;
}) {
  if (!params.periodStart || !params.periodEnd) return;

  const paymentConfirmationKey = getPaymentConfirmationKey({
    stripeSubscriptionId: params.stripeSubscriptionId,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
  });

  const existingConfirmations = await prisma.usageEvent.findMany({
    where: {
      workspaceId: params.workspaceId,
      createdAt: { gte: params.periodStart, lt: params.periodEnd },
      units: 0,
    },
    select: { metadata: true },
  });

  const alreadyConfirmed = existingConfirmations.some((event) =>
    hasPaymentConfirmationKey(event.metadata, paymentConfirmationKey),
  );

  if (alreadyConfirmed) return;

  await prisma.usageEvent.create({
    data: {
      workspaceId: params.workspaceId,
      type: UsageEventType.BANNER_VARIATION,
      units: 0,
      metadata: {
        kind: CREDIT_CYCLE_PAYMENT_CONFIRMED_KIND,
        paymentConfirmationKey,
        source: params.source,
        stripeEventId: params.stripeEventId || null,
        stripeInvoiceId: params.stripeInvoiceId || null,
        stripeSubscriptionId: params.stripeSubscriptionId,
        periodStart: params.periodStart.toISOString(),
        periodEnd: params.periodEnd.toISOString(),
        confirmedAt: new Date().toISOString(),
      },
    },
  });
}

async function getRemainingCreditsForPreviousPlan(params: {
  workspaceId: string;
  previousPlan: SubscriptionPlan;
  previousSubscription: PreviousSubscriptionForCarryover;
}) {
  const period = getBillingPeriodRange({
    providerSubscriptionId: params.previousSubscription?.providerSubscriptionId,
    currentPeriodStart: params.previousSubscription?.currentPeriodStart,
    currentPeriodEnd: params.previousSubscription?.currentPeriodEnd,
  });

  const usageEvents = await prisma.usageEvent.findMany({
    where: {
      workspaceId: params.workspaceId,
      createdAt: { gte: period.start, lt: period.end },
      type: { in: [...CREDIT_EVENT_TYPES] },
    },
    select: {
      units: true,
      createdAt: true,
      metadata: true,
    },
  });

  const requiresPaymentConfirmation = requiresCreditCyclePaymentConfirmation({
    plan: params.previousPlan,
    providerSubscriptionId: params.previousSubscription?.providerSubscriptionId,
    currentPeriodStart: params.previousSubscription?.currentPeriodStart,
    currentPeriodEnd: params.previousSubscription?.currentPeriodEnd,
  });

  const summary = buildBillingSummary({
    plan: params.previousPlan,
    status: SubscriptionStatus.ACTIVE,
    usageEvents,
    requiresPaymentConfirmation,
    creditCyclePaymentConfirmed: hasCreditCyclePaymentConfirmation(usageEvents),
  });

  return summary.remainingCredits;
}

async function applyPlanUpgradeCarryoverCredit(params: {
  workspaceId: string;
  previousPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  previousSubscription: PreviousSubscriptionForCarryover;
  stripeSubscriptionId: string;
  source: "webhook" | "checkout-return";
}) {
  if (params.previousPlan === params.newPlan) return;

  const previousLimit = getMonthlyLimitForPlan(params.previousPlan);
  const newLimit = getMonthlyLimitForPlan(params.newPlan);

  if (newLimit <= previousLimit) return;

  const remainingCreditsToCarry = await getRemainingCreditsForPreviousPlan({
    workspaceId: params.workspaceId,
    previousPlan: params.previousPlan,
    previousSubscription: params.previousSubscription,
  });

  if (remainingCreditsToCarry <= 0) return;

  const carryoverKey = getCarryoverKey({
    stripeSubscriptionId: params.stripeSubscriptionId,
    previousPlan: params.previousPlan,
    newPlan: params.newPlan,
  });

  const monthStart = getCurrentMonthStart();
  const existingAdjustments = await prisma.usageEvent.findMany({
    where: {
      workspaceId: params.workspaceId,
      createdAt: { gte: monthStart },
      units: { lt: 0 },
    },
    select: { metadata: true },
  });

  const alreadyApplied = existingAdjustments.some((event) =>
    hasCarryoverKey(event.metadata, carryoverKey),
  );

  if (alreadyApplied) return;

  await prisma.usageEvent.create({
    data: {
      workspaceId: params.workspaceId,
      type: UsageEventType.BANNER_VARIATION,
      units: -remainingCreditsToCarry,
      metadata: {
        kind: "PLAN_UPGRADE_CARRYOVER",
        carryoverKey,
        source: params.source,
        previousPlan: params.previousPlan,
        newPlan: params.newPlan,
        previousLimit,
        newLimit,
        previousRemainingCredits: remainingCreditsToCarry,
        stripeSubscriptionId: params.stripeSubscriptionId,
        createdAt: new Date().toISOString(),
      },
    },
  });
}

async function syncStripeSubscription(
  subscriptionId: string,
  fallback?: {
    workspaceId?: string | null;
    plan?: SubscriptionPlan | null;
  },
  options?: {
    paymentConfirmed?: boolean;
    source?: "checkout.session.completed" | "invoice.payment_succeeded";
    stripeEventId?: string;
    stripeInvoiceId?: string | null;
  },
) {
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  const firstItem = stripeSubscription.items.data[0];
  const priceId = firstItem?.price?.id || null;
  const plan =
    getPlanFromPriceId(priceId) ||
    getPlanFromMetadata(stripeSubscription.metadata?.plan) ||
    fallback?.plan ||
    null;

  const workspaceId =
    getMetadataValue(stripeSubscription.metadata?.workspaceId) ||
    fallback?.workspaceId ||
    null;

  if (!workspaceId) {
    console.warn("Webhook Stripe ignorado: subscription sem workspaceId.", subscriptionId);
    return null;
  }

  if (!plan) {
    console.warn(
      "Webhook Stripe ignorado: priceId sem plano mapeado.",
      priceId,
    );
    return null;
  }

  const existingSubscription = await prisma.subscription.findUnique({
    where: { workspaceId },
    select: {
      plan: true,
      providerSubscriptionId: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
    },
  });

  await applyPlanUpgradeCarryoverCredit({
    workspaceId,
    previousPlan: existingSubscription?.plan || SubscriptionPlan.FREE,
    newPlan: plan,
    previousSubscription: existingSubscription || null,
    stripeSubscriptionId: stripeSubscription.id,
    source: "webhook",
  });

  const { currentPeriodStart, currentPeriodEnd } =
    getSubscriptionPeriodDates(stripeSubscription);

  await prisma.subscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      plan,
      status: mapStripeSubscriptionStatus(stripeSubscription.status),
      provider: "stripe",
      providerCustomerId:
        typeof stripeSubscription.customer === "string"
          ? stripeSubscription.customer
          : stripeSubscription.customer?.id || null,
      providerSubscriptionId: stripeSubscription.id,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: Boolean(stripeSubscription.cancel_at_period_end),
    },
    update: {
      plan,
      status: mapStripeSubscriptionStatus(stripeSubscription.status),
      provider: "stripe",
      providerCustomerId:
        typeof stripeSubscription.customer === "string"
          ? stripeSubscription.customer
          : stripeSubscription.customer?.id || null,
      providerSubscriptionId: stripeSubscription.id,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: Boolean(stripeSubscription.cancel_at_period_end),
    },
  });

  if (options?.paymentConfirmed) {
    await ensureCreditCyclePaymentConfirmed({
      workspaceId,
      stripeSubscriptionId: stripeSubscription.id,
      periodStart: currentPeriodStart,
      periodEnd: currentPeriodEnd,
      source: options.source || "invoice.payment_succeeded",
      stripeEventId: options.stripeEventId,
      stripeInvoiceId: options.stripeInvoiceId,
    });
  }

  return {
    workspaceId,
    plan,
    stripeSubscriptionId: stripeSubscription.id,
    providerCustomerId:
      typeof stripeSubscription.customer === "string"
        ? stripeSubscription.customer
        : stripeSubscription.customer?.id || null,
    currentPeriodStart,
    currentPeriodEnd,
  } satisfies SyncedStripeSubscription;
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripeEventId: string,
) {
  const workspaceId =
    getMetadataValue(session.metadata?.workspaceId) ||
    getMetadataValue(session.client_reference_id);
  const planFromMetadata = getPlanFromMetadata(session.metadata?.plan);
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id || null;

  if (!workspaceId) {
    console.warn("Checkout concluído sem workspaceId.", session.id);
    return;
  }

  if (subscriptionId) {
    await syncStripeSubscription(
      subscriptionId,
      {
        workspaceId,
        plan: planFromMetadata,
      },
      {
        paymentConfirmed: session.payment_status === "paid",
        source: "checkout.session.completed",
        stripeEventId,
      },
    );
    return;
  }

  await prisma.subscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      plan: planFromMetadata || SubscriptionPlan.FREE,
      status: SubscriptionStatus.TRIALING,
      provider: "stripe",
      providerCustomerId: customerId,
      providerSubscriptionId: null,
    },
    update: {
      plan: planFromMetadata || SubscriptionPlan.FREE,
      status: SubscriptionStatus.TRIALING,
      provider: "stripe",
      providerCustomerId: customerId,
      providerSubscriptionId: null,
    },
  });
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice) {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };

  if (typeof invoiceWithSubscription.subscription === "string") {
    return invoiceWithSubscription.subscription;
  }

  if (invoiceWithSubscription.subscription?.id) {
    return invoiceWithSubscription.subscription.id;
  }

  const firstLine = invoice.lines?.data?.[0] as
    | (Stripe.InvoiceLineItem & {
        subscription?: string | null;
        parent?: {
          subscription_item_details?: {
            subscription?: string | null;
          } | null;
        } | null;
      })
    | undefined;

  return (
    firstLine?.subscription ||
    firstLine?.parent?.subscription_item_details?.subscription ||
    null
  );
}


function getPlanDisplayNameForMeta(plan: SubscriptionPlan) {
  const labels: Record<SubscriptionPlan, string> = {
    FREE: "Free",
    PRO: "Pro",
    PROFESSIONAL: "Professional",
    STUDIO: "Studio",
  };

  return labels[plan] ?? plan;
}

function getPlanFallbackValue(plan: SubscriptionPlan) {
  const values: Record<SubscriptionPlan, number> = {
    FREE: 0,
    PRO: 12.99,
    PROFESSIONAL: 24.99,
    STUDIO: 39.99,
  };

  return values[plan] ?? 0;
}

function getInvoicePaidValue(invoice: Stripe.Invoice, plan: SubscriptionPlan) {
  const amountPaid = typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0;
  const value = amountPaid > 0 ? amountPaid / 100 : getPlanFallbackValue(plan);

  return Math.round(value * 100) / 100;
}

function getInvoiceCurrency(invoice: Stripe.Invoice) {
  return (invoice.currency || "usd").toUpperCase();
}

async function sendMetaBillingEventsForPaidInvoice(params: {
  invoice: Stripe.Invoice;
  syncedSubscription: SyncedStripeSubscription;
  stripeEventId: string;
}) {
  const { invoice, syncedSubscription, stripeEventId } = params;
  const value = getInvoicePaidValue(invoice, syncedSubscription.plan);

  if (value <= 0) {
    console.info("Meta CAPI Purchase ignorado: invoice sem valor pago.", invoice.id);
    return;
  }

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: syncedSubscription.workspaceId },
      select: {
        id: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const planName = getPlanDisplayNameForMeta(syncedSubscription.plan);
    const currency = getInvoiceCurrency(invoice);
    const eventSourceUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://djproia.com"}/dashboard/billing`;
    const invoiceId = invoice.id || stripeEventId;

    const baseCustomData = {
      content_type: "product",
      num_items: 1,
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: syncedSubscription.stripeSubscriptionId,
      stripe_customer_id: syncedSubscription.providerCustomerId,
      workspace_id: workspace?.id || syncedSubscription.workspaceId,
      plan: syncedSubscription.plan,
    };

    const purchaseResult = await sendMetaConversionEvent({
      eventName: "Purchase",
      eventId: `purchase_${invoiceId}`,
      email: workspace?.user?.email || null,
      value,
      currency,
      contentName: `${planName} Subscription`,
      contentCategory: "SaaS Subscription",
      eventSourceUrl,
      clientUserAgent: "stripe-webhook",
      customData: baseCustomData,
    });

    const subscribeResult = await sendMetaConversionEvent({
      eventName: "Subscribe",
      eventId: `subscribe_${invoiceId}`,
      email: workspace?.user?.email || null,
      value,
      currency,
      contentName: `${planName} Subscription`,
      contentCategory: "SaaS Subscription",
      eventSourceUrl,
      clientUserAgent: "stripe-webhook",
      customData: {
        ...baseCustomData,
        predicted_ltv: value,
      },
    });

    console.info("Meta CAPI billing events processed.", {
      invoiceId: invoice.id,
      plan: syncedSubscription.plan,
      value,
      currency,
      purchase: purchaseResult,
      subscribe: subscribeResult,
    });
  } catch (error) {
    console.error("Erro ao enviar eventos Meta CAPI de billing:", error);
  }
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  stripeEventId: string,
) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!subscriptionId) {
    return;
  }

  const syncedSubscription = await syncStripeSubscription(subscriptionId, undefined, {
    paymentConfirmed: true,
    source: "invoice.payment_succeeded",
    stripeEventId,
    stripeInvoiceId: invoice.id,
  });

  if (syncedSubscription) {
    await sendMetaBillingEventsForPaidInvoice({
      invoice,
      syncedSubscription,
      stripeEventId,
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!subscriptionId) {
    return;
  }

  await syncStripeSubscription(subscriptionId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const workspaceId = getMetadataValue(subscription.metadata?.workspaceId);

  if (!workspaceId) {
    console.warn("Cancelamento Stripe ignorado: subscription sem workspaceId.", subscription.id);
    return;
  }

  await prisma.subscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      provider: "stripe",
      providerCustomerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id || null,
      providerSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
    update: {
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      provider: "stripe",
      providerSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Assinatura Stripe ausente." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret());
  } catch (error) {
    console.error("Falha ao validar webhook Stripe:", error);
    return NextResponse.json({ error: "Webhook inválido." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          event.id,
        );
        break;

      case "invoice.payment_succeeded":
      case "invoice.paid":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, event.id);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncStripeSubscription((event.data.object as Stripe.Subscription).id);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook Stripe:", error);
    return NextResponse.json({ error: "Erro ao processar webhook." }, { status: 500 });
  }
}
