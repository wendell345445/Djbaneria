import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";

type BillingSummaryInput = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  usedThisMonth: number;
};

type BillingSummary = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyLimit: number;
  usedThisMonth: number;
  remainingCredits: number;
  canGenerateBanner: boolean;
};

const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
  FREE: 2,
  PRO: 20,
  PROFESSIONAL: 40,
  STUDIO: 80,
};

export function getMonthlyLimitForPlan(plan: SubscriptionPlan) {
  return PLAN_LIMITS[plan] ?? 2;
}

export function buildBillingSummary({
  plan,
  status,
  usedThisMonth,
}: BillingSummaryInput): BillingSummary {
  const monthlyLimit = getMonthlyLimitForPlan(plan);
  const remainingCredits = Math.max(monthlyLimit - usedThisMonth, 0);

  const activeStatuses: SubscriptionStatus[] = [
    SubscriptionStatus.TRIALING,
    SubscriptionStatus.ACTIVE,
  ];

  const canUsePlan = activeStatuses.includes(status);

  return {
    plan,
    status,
    monthlyLimit,
    usedThisMonth,
    remainingCredits,
    canGenerateBanner: canUsePlan && remainingCredits > 0,
  };
}
