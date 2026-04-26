import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
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
import { prisma } from "@/lib/prisma";
import { validateMutationOrigin } from "@/lib/request-security";
import {
  assertStripeConfigured,
  getPriceIdForPlan,
  getSubscriptionPeriodDates,
  isStripePaidPlan,
  mapStripeSubscriptionStatus,
  stripe,
  type StripePaidPlan,
} from "@/lib/stripe";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

const schema = z.object({
  plan: z.enum(["PRO", "PROFESSIONAL", "STUDIO"]),
});

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
  source: "change-plan";
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
        source: "change-plan-route",
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

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  try {
    assertStripeConfigured();

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Plano inválido." },
        { status: 400 },
      );
    }

    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    const targetPlan = parsed.data.plan;

    if (!isStripePaidPlan(targetPlan)) {
      return NextResponse.json(
        { error: "Plano não suportado para troca." },
        { status: 400 },
      );
    }

    const currentSubscription = workspace.subscription;
    const providerSubscriptionId = currentSubscription?.providerSubscriptionId;

    if (!providerSubscriptionId) {
      return NextResponse.json(
        {
          error:
            "Nenhuma assinatura Stripe ativa foi encontrada. Assine um plano primeiro.",
        },
        { status: 409 },
      );
    }

    const currentPlan = currentSubscription.plan || SubscriptionPlan.FREE;
    const targetSubscriptionPlan = SubscriptionPlan[targetPlan];
    const isUpgrade =
      getMonthlyLimitForPlan(targetSubscriptionPlan) > getMonthlyLimitForPlan(currentPlan);

    if (currentPlan === targetSubscriptionPlan) {
      return NextResponse.json({
        success: true,
        plan: targetPlan,
        message: "Este plano já está ativo.",
      });
    }

    const priceId = getPriceIdForPlan(targetPlan as StripePaidPlan);

    if (!priceId) {
      return NextResponse.json(
        { error: `Preço Stripe não configurado para o plano ${targetPlan}.` },
        { status: 500 },
      );
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      providerSubscriptionId,
      { expand: ["items.data.price"] },
    );

    const firstItem = stripeSubscription.items.data[0];

    if (!firstItem) {
      return NextResponse.json(
        { error: "A assinatura Stripe não possui item de plano para atualizar." },
        { status: 409 },
      );
    }

    const previousSubscriptionForCarryover = currentSubscription
      ? {
          providerSubscriptionId: currentSubscription.providerSubscriptionId,
          currentPeriodStart: currentSubscription.currentPeriodStart,
          currentPeriodEnd: currentSubscription.currentPeriodEnd,
        }
      : null;

    const updatedSubscription = await stripe.subscriptions.update(
      providerSubscriptionId,
      {
        items: [
          {
            id: firstItem.id,
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          ...(stripeSubscription.metadata || {}),
          workspaceId: workspace.id,
          plan: targetPlan,
        },
        ...(isUpgrade
          ? {
              billing_cycle_anchor: "now" as const,
              proration_behavior: "none" as const,
              payment_behavior: "error_if_incomplete" as const,
            }
          : {
              proration_behavior: "create_prorations" as const,
              payment_behavior: "allow_incomplete" as const,
            }),
        expand: ["items.data.price", "latest_invoice"],
      },
    );

    const { currentPeriodStart, currentPeriodEnd } =
      getSubscriptionPeriodDates(updatedSubscription);

    await applyPlanUpgradeCarryoverCredit({
      workspaceId: workspace.id,
      previousPlan: currentPlan,
      newPlan: targetSubscriptionPlan,
      previousSubscription: previousSubscriptionForCarryover,
      stripeSubscriptionId: updatedSubscription.id,
    });

    await prisma.subscription.upsert({
      where: { workspaceId: workspace.id },
      create: {
        workspaceId: workspace.id,
        plan: targetSubscriptionPlan,
        status: mapStripeSubscriptionStatus(updatedSubscription.status),
        provider: "stripe",
        providerCustomerId:
          typeof updatedSubscription.customer === "string"
            ? updatedSubscription.customer
            : updatedSubscription.customer?.id || null,
        providerSubscriptionId: updatedSubscription.id,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: Boolean(updatedSubscription.cancel_at_period_end),
      },
      update: {
        plan: targetSubscriptionPlan,
        status: mapStripeSubscriptionStatus(updatedSubscription.status),
        provider: "stripe",
        providerCustomerId:
          typeof updatedSubscription.customer === "string"
            ? updatedSubscription.customer
            : updatedSubscription.customer?.id || null,
        providerSubscriptionId: updatedSubscription.id,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: Boolean(updatedSubscription.cancel_at_period_end),
      },
    });

    if (isUpgrade && mapStripeSubscriptionStatus(updatedSubscription.status) === SubscriptionStatus.ACTIVE) {
      await ensureCreditCyclePaymentConfirmed({
        workspaceId: workspace.id,
        stripeSubscriptionId: updatedSubscription.id,
        periodStart: currentPeriodStart,
        periodEnd: currentPeriodEnd,
        source: "change-plan",
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/banners/new");

    return NextResponse.json({
      success: true,
      plan: targetPlan,
      message: isUpgrade
        ? `Plano alterado para ${targetPlan}, ciclo reiniciado e cobrança cheia realizada.`
        : `Plano alterado para ${targetPlan}.`,
    });
  } catch (error) {
    console.error("Erro ao alterar plano Stripe:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao alterar plano.",
      },
      { status: 500 },
    );
  }
}
