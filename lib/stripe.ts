import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

export function getPriceIdForPlan(plan: "PRO" | "STUDIO") {
  if (plan === "PRO") return process.env.STRIPE_PRICE_PRO || "";
  return process.env.STRIPE_PRICE_STUDIO || "";
}
