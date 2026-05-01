import { NextResponse } from "next/server";
import { z } from "zod";

import {
  assertStripeConfigured,
  getAppUrl,
  getPriceIdForPlan,
  isStripePaidPlan,
  type StripePaidPlan,
  stripe,
} from "@/lib/stripe";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

const schema = z.object({
  plan: z.enum(["PRO", "PROFESSIONAL", "STUDIO"]),
});

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit(`public-checkout:${ip}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Wait a moment and try again." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  try {
    assertStripeConfigured();

    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid plan." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const plan = parsed.data.plan;

    if (!isStripePaidPlan(plan)) {
      return NextResponse.json(
        { error: "Unsupported plan." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const priceId = getPriceIdForPlan(plan as StripePaidPlan);

    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price is not configured for plan ${plan}.` },
        { status: 500, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/`,
      allow_promotion_codes: true,
      metadata: {
        checkoutFlow: "public_paid_signup",
        plan,
      },
      subscription_data: {
        metadata: {
          checkoutFlow: "public_paid_signup",
          plan,
        },
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a valid checkout URL.");
    }

    return NextResponse.json(
      { url: session.url },
      { headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    console.error("Error creating public Stripe checkout:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal error while creating checkout.",
      },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }
}
