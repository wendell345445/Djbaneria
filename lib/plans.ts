import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";

export type BannerImageQuality = "low" | "medium" | "high";

export const CREDIT_CYCLE_PAYMENT_CONFIRMED_KIND =
  "STRIPE_CREDIT_CYCLE_PAYMENT_CONFIRMED";

type BillingUsageEvent = {
  units: number | null;
  createdAt: Date | string;
  metadata?: unknown;
};

type BillingSummaryInput = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  usedThisMonth?: number;
  usageEvents?: BillingUsageEvent[];
  requiresPaymentConfirmation?: boolean;
  creditCyclePaymentConfirmed?: boolean;
};

type BillingSummary = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyLimit: number;
  baseMonthlyLimit: number;
  usedThisMonth: number;
  netUsedThisMonth: number;
  remainingCredits: number;
  canGenerateBanner: boolean;
  creditCyclePaymentConfirmed: boolean;
  creditCyclePaymentPending: boolean;
};

const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
  FREE: 2,
  PRO: 20,
  PROFESSIONAL: 40,
  STUDIO: 80,
};

const PLAN_QUALITY_ACCESS: Record<SubscriptionPlan, BannerImageQuality[]> = {
  FREE: ["low"],
  PRO: ["low", "medium"],
  PROFESSIONAL: ["low", "medium", "high"],
  STUDIO: ["low", "medium", "high"],
};

export type BillingPeriodSource = "stripe" | "calendar";

export type BillingPeriodRange = {
  start: Date;
  end: Date;
  source: BillingPeriodSource;
};

export type BillingPeriodInput = {
  providerSubscriptionId?: string | null;
  currentPeriodStart?: Date | string | null;
  currentPeriodEnd?: Date | string | null;
  now?: Date;
};

function getCalendarMonthRange(now = new Date()): BillingPeriodRange {
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    source: "calendar",
  };
}

export function getBillingPeriodRange({
  providerSubscriptionId,
  currentPeriodStart,
  currentPeriodEnd,
  now = new Date(),
}: BillingPeriodInput): BillingPeriodRange {
  if (providerSubscriptionId && currentPeriodStart && currentPeriodEnd) {
    const start = toDate(currentPeriodStart);
    const end = toDate(currentPeriodEnd);

    if (
      Number.isFinite(start.getTime()) &&
      Number.isFinite(end.getTime()) &&
      end.getTime() > start.getTime()
    ) {
      return {
        start,
        end,
        source: "stripe",
      };
    }
  }

  return getCalendarMonthRange(now);
}

export function getCreditCycleUsageDateFilter(input?: BillingPeriodInput | null) {
  const period = getBillingPeriodRange({
    providerSubscriptionId: input?.providerSubscriptionId,
    currentPeriodStart: input?.currentPeriodStart,
    currentPeriodEnd: input?.currentPeriodEnd,
    now: input?.now,
  });

  return {
    gte: period.start,
    lt: period.end,
  };
}

export function getMonthlyLimitForPlan(plan: SubscriptionPlan) {
  return PLAN_LIMITS[plan] ?? 2;
}

export function getAllowedBannerQualities(
  plan: SubscriptionPlan,
  isAdmin = false,
): BannerImageQuality[] {
  if (isAdmin) {
    return ["low", "medium", "high"];
  }

  return PLAN_QUALITY_ACCESS[plan] ?? ["low"];
}

export function isBannerQualityAllowed(
  plan: SubscriptionPlan,
  quality: BannerImageQuality,
  isAdmin = false,
) {
  return getAllowedBannerQualities(plan, isAdmin).includes(quality);
}

export function getDefaultBannerQuality(
  plan: SubscriptionPlan,
  isAdmin = false,
): BannerImageQuality {
  const allowed = getAllowedBannerQualities(plan, isAdmin);

  if (allowed.includes("medium")) {
    return "medium";
  }

  return allowed[0] ?? "low";
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function requiresCreditCyclePaymentConfirmation(params: {
  plan: SubscriptionPlan;
  providerSubscriptionId?: string | null;
  currentPeriodStart?: Date | string | null;
  currentPeriodEnd?: Date | string | null;
}) {
  return Boolean(
    params.plan !== SubscriptionPlan.FREE &&
      params.providerSubscriptionId &&
      params.currentPeriodStart &&
      params.currentPeriodEnd,
  );
}

function isCreditCyclePaymentConfirmationEvent(event: BillingUsageEvent) {
  if (!isObject(event.metadata)) return false;
  return event.metadata.kind === CREDIT_CYCLE_PAYMENT_CONFIRMED_KIND;
}

export function hasCreditCyclePaymentConfirmation(
  usageEvents: BillingUsageEvent[] | undefined,
) {
  return Boolean(usageEvents?.some(isCreditCyclePaymentConfirmationEvent));
}

function isPlanCarryoverEvent(event: BillingUsageEvent) {
  const units = event.units || 0;

  if (units >= 0) return false;

  if (!isObject(event.metadata)) {
    return true;
  }

  const kind = event.metadata.kind;
  return kind === "PLAN_UPGRADE_CARRYOVER" || kind === undefined;
}

function buildUsageNumbers(usageEvents: BillingUsageEvent[] | undefined) {
  if (!usageEvents?.length) {
    return null;
  }

  const netUsedThisMonth = usageEvents.reduce(
    (total, event) => total + (event.units || 0),
    0,
  );

  const carryoverEvents = usageEvents
    .filter(isPlanCarryoverEvent)
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime());

  const latestCarryover = carryoverEvents[0] || null;
  const latestCarryoverAt = latestCarryover
    ? toDate(latestCarryover.createdAt).getTime()
    : null;

  const displayedUsedThisMonth = usageEvents.reduce((total, event) => {
    const units = event.units || 0;
    if (units <= 0) return total;

    if (latestCarryoverAt === null) {
      return total + units;
    }

    const eventTime = toDate(event.createdAt).getTime();
    return eventTime > latestCarryoverAt ? total + units : total;
  }, 0);

  return {
    netUsedThisMonth,
    displayedUsedThisMonth,
  };
}

export function buildBillingSummary({
  plan,
  status,
  usedThisMonth = 0,
  usageEvents,
  requiresPaymentConfirmation = false,
  creditCyclePaymentConfirmed,
}: BillingSummaryInput): BillingSummary {
  const baseMonthlyLimit = getMonthlyLimitForPlan(plan);
  const usageNumbers = buildUsageNumbers(usageEvents);
  const netUsedThisMonth = usageNumbers?.netUsedThisMonth ?? usedThisMonth;
  const displayedUsedThisMonth = Math.max(
    usageNumbers?.displayedUsedThisMonth ?? Math.max(netUsedThisMonth, 0),
    0,
  );
  const effectivePaymentConfirmed = requiresPaymentConfirmation
    ? (creditCyclePaymentConfirmed ?? hasCreditCyclePaymentConfirmation(usageEvents))
    : true;
  const creditCyclePaymentPending =
    requiresPaymentConfirmation && !effectivePaymentConfirmed;

  const remainingCredits = creditCyclePaymentPending
    ? 0
    : Math.max(baseMonthlyLimit - netUsedThisMonth, 0);
  const displayedCreditLimit = creditCyclePaymentPending
    ? baseMonthlyLimit
    : Math.max(remainingCredits + displayedUsedThisMonth, baseMonthlyLimit);

  const activeStatuses: SubscriptionStatus[] = [
    SubscriptionStatus.TRIALING,
    SubscriptionStatus.ACTIVE,
  ];

  const canUsePlan = activeStatuses.includes(status) && !creditCyclePaymentPending;

  return {
    plan,
    status,
    monthlyLimit: displayedCreditLimit,
    baseMonthlyLimit,
    usedThisMonth: displayedUsedThisMonth,
    netUsedThisMonth,
    remainingCredits,
    canGenerateBanner: canUsePlan && remainingCredits > 0,
    creditCyclePaymentConfirmed: effectivePaymentConfirmed,
    creditCyclePaymentPending,
  };
}
