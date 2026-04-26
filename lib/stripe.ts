import "server-only";

import Stripe from "stripe";
import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";

export type StripePaidPlan = "PRO" | "PROFESSIONAL" | "STUDIO";

const STRIPE_API_VERSION = "2025-08-27.basil";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} não configurado.`);
  }

  return value;
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || "sk_test_placeholder";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: STRIPE_API_VERSION,
});

export function assertStripeConfigured() {
  getRequiredEnv("STRIPE_SECRET_KEY");
}

export function getAppUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (value) {
    return value.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function isStripePaidPlan(plan: string): plan is StripePaidPlan {
  return plan === "PRO" || plan === "PROFESSIONAL" || plan === "STUDIO";
}

export function getPriceIdForPlan(plan: StripePaidPlan) {
  switch (plan) {
    case "PRO":
      return process.env.STRIPE_PRICE_PRO?.trim() || "";
    case "PROFESSIONAL":
      return process.env.STRIPE_PRICE_PROFESSIONAL?.trim() || "";
    case "STUDIO":
      return process.env.STRIPE_PRICE_STUDIO?.trim() || "";
    default: {
      const exhaustiveCheck: never = plan;
      throw new Error(`Plano Stripe não suportado: ${exhaustiveCheck}`);
    }
  }
}

export function isStripePriceConfigured(plan: StripePaidPlan) {
  return getPriceIdForPlan(plan).length > 0;
}

export function getPlanFromPriceId(priceId?: string | null): SubscriptionPlan | null {
  if (!priceId) return null;

  const planByPriceId: Array<[StripePaidPlan, string]> = [
    ["PRO", process.env.STRIPE_PRICE_PRO?.trim() || ""],
    ["PROFESSIONAL", process.env.STRIPE_PRICE_PROFESSIONAL?.trim() || ""],
    ["STUDIO", process.env.STRIPE_PRICE_STUDIO?.trim() || ""],
  ];

  const match = planByPriceId.find(([, configuredPriceId]) => configuredPriceId === priceId);

  if (!match) return null;

  return SubscriptionPlan[match[0]];
}

export function mapStripeSubscriptionStatus(status?: string | null): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.PAST_DUE;
  }
}

export function timestampToDate(value?: number | null) {
  if (!value || !Number.isFinite(value)) return null;
  return new Date(value * 1000);
}

export function getSubscriptionPeriodDates(subscription: Stripe.Subscription) {
  const subscriptionRecord = subscription as Stripe.Subscription & {
    current_period_start?: number | null;
    current_period_end?: number | null;
  };

  const firstItem = subscription.items.data[0] as
    | (Stripe.SubscriptionItem & {
        current_period_start?: number | null;
        current_period_end?: number | null;
      })
    | undefined;

  return {
    currentPeriodStart: timestampToDate(
      subscriptionRecord.current_period_start ?? firstItem?.current_period_start ?? null,
    ),
    currentPeriodEnd: timestampToDate(
      subscriptionRecord.current_period_end ?? firstItem?.current_period_end ?? null,
    ),
  };
}

export function getStripePublishableKey() {
  return getRequiredEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}
