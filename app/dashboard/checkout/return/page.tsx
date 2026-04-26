import Link from "next/link";
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
import {
  getPlanFromPriceId,
  getSubscriptionPeriodDates,
  mapStripeSubscriptionStatus,
  stripe,
} from "@/lib/stripe";
import { requireCurrentWorkspace } from "@/lib/workspace";

type CheckoutReturnPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

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

function hasCarryoverKey(metadata: unknown, carryoverKey: string) {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "carryoverKey" in metadata &&
    (metadata as { carryoverKey?: unknown }).carryoverKey === carryoverKey
  );
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
  stripeSessionId: string;
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
        source: "checkout-return",
        stripeSessionId: params.stripeSessionId,
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
  source: "checkout-return" | "webhook";
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

async function syncCheckoutSessionWithWorkspace(params: {
  sessionId: string;
  workspaceId: string;
}) {
  const session = await stripe.checkout.sessions.retrieve(params.sessionId);

  if (session.mode !== "subscription") {
    throw new Error("Esta sessão Stripe não é uma assinatura.");
  }

  const sessionWorkspaceId =
    getMetadataValue(session.metadata?.workspaceId) ||
    getMetadataValue(session.client_reference_id);

  if (sessionWorkspaceId && sessionWorkspaceId !== params.workspaceId) {
    throw new Error("Esta sessão Stripe pertence a outro workspace.");
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;

  if (!subscriptionId) {
    throw new Error("A Stripe ainda não retornou a assinatura desta sessão.");
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  const firstItem = stripeSubscription.items.data[0];
  const priceId = firstItem?.price?.id || null;
  const plan =
    getPlanFromPriceId(priceId) ||
    getPlanFromMetadata(stripeSubscription.metadata?.plan) ||
    getPlanFromMetadata(session.metadata?.plan);

  if (!plan) {
    throw new Error(
      "Não foi possível identificar o plano pago. Confira se os STRIPE_PRICE_* são os mesmos price_ usados no modo teste.",
    );
  }

  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id ||
        (typeof session.customer === "string" ? session.customer : session.customer?.id || null);

  const existingSubscription = await prisma.subscription.findUnique({
    where: { workspaceId: params.workspaceId },
    select: {
      plan: true,
      providerSubscriptionId: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
    },
  });

  await applyPlanUpgradeCarryoverCredit({
    workspaceId: params.workspaceId,
    previousPlan: existingSubscription?.plan || SubscriptionPlan.FREE,
    newPlan: plan,
    previousSubscription: existingSubscription || null,
    stripeSubscriptionId: stripeSubscription.id,
    source: "checkout-return",
  });

  const { currentPeriodStart, currentPeriodEnd } =
    getSubscriptionPeriodDates(stripeSubscription);

  await prisma.subscription.upsert({
    where: { workspaceId: params.workspaceId },
    create: {
      workspaceId: params.workspaceId,
      plan,
      status: mapStripeSubscriptionStatus(stripeSubscription.status),
      provider: "stripe",
      providerCustomerId: customerId,
      providerSubscriptionId: stripeSubscription.id,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: Boolean(stripeSubscription.cancel_at_period_end),
    },
    update: {
      plan,
      status: mapStripeSubscriptionStatus(stripeSubscription.status),
      provider: "stripe",
      providerCustomerId: customerId,
      providerSubscriptionId: stripeSubscription.id,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: Boolean(stripeSubscription.cancel_at_period_end),
    },
  });

  if (session.payment_status === "paid") {
    await ensureCreditCyclePaymentConfirmed({
      workspaceId: params.workspaceId,
      stripeSubscriptionId: stripeSubscription.id,
      periodStart: currentPeriodStart,
      periodEnd: currentPeriodEnd,
      stripeSessionId: session.id,
    });
  }

  return {
    plan,
    status: mapStripeSubscriptionStatus(stripeSubscription.status),
  };
}

function getPlanDisplayName(plan?: SubscriptionPlan | null) {
  const labels: Record<SubscriptionPlan, string> = {
    FREE: "Free",
    PRO: "Pro",
    PROFESSIONAL: "Professional",
    STUDIO: "Studio",
  };

  return plan ? labels[plan] ?? plan : "Plano";
}

function getStatusLabel(status?: SubscriptionStatus | null) {
  const labels: Record<SubscriptionStatus, string> = {
    TRIALING: "Teste ativo",
    ACTIVE: "Ativo",
    PAST_DUE: "Pagamento pendente",
    CANCELED: "Cancelado",
    EXPIRED: "Expirado",
  };

  return status ? labels[status] ?? status : "Processando";
}

export default async function CheckoutReturnPage({
  searchParams,
}: CheckoutReturnPageProps) {
  const workspace = await requireCurrentWorkspace();
  const params = await searchParams;
  const sessionId = params?.session_id;

  let syncResult: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
  } | null = null;
  let syncError: string | null = null;

  if (sessionId) {
    try {
      syncResult = await syncCheckoutSessionWithWorkspace({
        sessionId,
        workspaceId: workspace.id,
      });
    } catch (error) {
      console.error("Erro ao sincronizar retorno do checkout Stripe:", error);
      syncError =
        error instanceof Error
          ? error.message
          : "Não foi possível sincronizar a assinatura agora.";
    }
  } else {
    syncError = "A sessão do checkout não foi informada pela Stripe.";
  }

  const isSuccess = Boolean(syncResult && !syncError);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[760px] items-center px-5 py-10">
      <section className="relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.3)] md:p-8">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/70 to-transparent" />

        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl ${
            isSuccess
              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
              : "border-amber-300/20 bg-amber-300/10 text-amber-100"
          }`}
        >
          {isSuccess ? "✓" : "!"}
        </div>

        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          Checkout finalizado
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white md:text-[34px]">
          {isSuccess
            ? `Plano ${getPlanDisplayName(syncResult?.plan)} ativado`
            : "Pagamento aprovado, sincronização pendente"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/68">
          {isSuccess
            ? `Sua assinatura está com status ${getStatusLabel(syncResult?.status)}. Os créditos do novo plano já podem aparecer no dashboard.`
            : syncError ||
              "A Stripe confirmou o retorno do checkout, mas ainda não conseguimos atualizar o plano no banco."}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/billing"
            className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
          >
            Ver assinatura
          </Link>
          <Link
            href="/dashboard/banners/new"
            className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.09]"
          >
            Criar banner
          </Link>
        </div>
      </section>
    </main>
  );
}
