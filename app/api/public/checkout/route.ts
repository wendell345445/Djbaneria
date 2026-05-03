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
import { getMetaRequestContext } from "@/lib/meta-capi";
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

function normalizeStripeMetadataValue(value?: string | null) {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Stripe metadata values have a size limit. Keep this safely under the limit.
  return trimmed.slice(0, 480);
}

function removeEmptyStripeMetadata(
  metadata: Record<string, string | undefined>,
) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => Boolean(value)),
  ) as Record<string, string>;
}

function getMetaCheckoutMetadata(request: Request) {
  const metaContext = getMetaRequestContext(request);

  return removeEmptyStripeMetadata({
    metaEventSourceUrl: normalizeStripeMetadataValue(
      metaContext.eventSourceUrl,
    ),
    metaClientIpAddress: normalizeStripeMetadataValue(
      metaContext.clientIpAddress,
    ),
    metaClientUserAgent: normalizeStripeMetadataValue(
      metaContext.clientUserAgent,
    ),
    metaFbp: normalizeStripeMetadataValue(metaContext.fbp),
    metaFbc: normalizeStripeMetadataValue(metaContext.fbc),
  });
}

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
    const metaCheckoutMetadata = getMetaCheckoutMetadata(request);

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
        ...metaCheckoutMetadata,
      },
      subscription_data: {
        metadata: {
          checkoutFlow: "public_paid_signup",
          plan,
          ...metaCheckoutMetadata,
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
