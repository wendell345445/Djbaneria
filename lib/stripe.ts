import "server-only";

import Stripe from "stripe";

export type StripePaidPlan = "PRO" | "PROFESSIONAL" | "STUDIO";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} não configurado.`);
  }

  return value;
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || "sk_test_placeholder";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-08-27.basil",
});

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

export function getStripePublishableKey() {
  return getRequiredEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}
