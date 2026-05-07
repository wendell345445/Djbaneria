import { after, NextResponse } from "next/server";
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
  createServerMetaEventId,
  getMetaRequestContext,
  sendMetaConversionEvent,
} from "@/lib/meta-capi";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";
import { sendOwnerCheckoutStartedEmail } from "@/lib/owner-notifications";

export const runtime = "nodejs";

const schema = z.object({
  plan: z.enum(["PRO", "PROFESSIONAL", "STUDIO"]),
  metaEventId: z.string().trim().min(8).max(128).optional(),
});

function normalizeStripeMetadataValue(value?: string | null) {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  return trimmed.slice(0, 480);
}

function removeEmptyStripeMetadata(
  metadata: Record<string, string | undefined>,
) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => Boolean(value)),
  ) as Record<string, string>;
}

function getPlanValue(plan: StripePaidPlan) {
  const values: Record<StripePaidPlan, number> = {
    PRO: 12.99,
    PROFESSIONAL: 24.99,
    STUDIO: 39.99,
  };

  return values[plan];
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
    metaFbclid: normalizeStripeMetadataValue(metaContext.fbclid),

    utmSource: normalizeStripeMetadataValue(
      metaContext.lastUtmSource || metaContext.utmSource,
    ),
    utmMedium: normalizeStripeMetadataValue(
      metaContext.lastUtmMedium || metaContext.utmMedium,
    ),
    utmCampaign: normalizeStripeMetadataValue(
      metaContext.lastUtmCampaign || metaContext.utmCampaign,
    ),
    utmContent: normalizeStripeMetadataValue(
      metaContext.lastUtmContent || metaContext.utmContent,
    ),
    utmTerm: normalizeStripeMetadataValue(
      metaContext.lastUtmTerm || metaContext.utmTerm,
    ),

    firstUtmSource: normalizeStripeMetadataValue(metaContext.utmSource),
    firstUtmMedium: normalizeStripeMetadataValue(metaContext.utmMedium),
    firstUtmCampaign: normalizeStripeMetadataValue(metaContext.utmCampaign),
    firstUtmContent: normalizeStripeMetadataValue(metaContext.utmContent),
    firstUtmTerm: normalizeStripeMetadataValue(metaContext.utmTerm),

    landingPage: normalizeStripeMetadataValue(metaContext.landingPage),
    originalReferrer: normalizeStripeMetadataValue(metaContext.referrer),
  });
}

function getMetaCheckoutCustomData(
  metadata: Record<string, string>,
  params: {
    plan: StripePaidPlan;
    checkoutSessionId: string;
  },
) {
  return {
    content_type: "product",
    num_items: 1,
    plan: params.plan,
    checkout_flow: "public_paid_signup",
    stripe_checkout_session_id: params.checkoutSessionId,

    utm_source: metadata.utmSource,
    utm_medium: metadata.utmMedium,
    utm_campaign: metadata.utmCampaign,
    utm_content: metadata.utmContent,
    utm_term: metadata.utmTerm,

    first_utm_source: metadata.firstUtmSource,
    first_utm_medium: metadata.firstUtmMedium,
    first_utm_campaign: metadata.firstUtmCampaign,
    first_utm_content: metadata.firstUtmContent,
    first_utm_term: metadata.firstUtmTerm,

    landing_page: metadata.landingPage,
    original_referrer: metadata.originalReferrer,

    has_fbp: Boolean(metadata.metaFbp),
    has_fbc: Boolean(metadata.metaFbc),
    has_fbclid: Boolean(metadata.metaFbclid),
  };
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

    const initiateCheckoutEventId =
      parsed.data.metaEventId?.trim() ||
      createServerMetaEventId("InitiateCheckout");

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
        initiateCheckoutEventId,
        ...metaCheckoutMetadata,
      },
      subscription_data: {
        metadata: {
          checkoutFlow: "public_paid_signup",
          plan,
          initiateCheckoutEventId,
          ...metaCheckoutMetadata,
        },
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a valid checkout URL.");
    }

    const metaContext = getMetaRequestContext(request);

    after(async () => {
      await sendOwnerCheckoutStartedEmail({
        plan,
        amount: session.amount_total,
        currency: session.currency,
        stripeSessionId: session.id,
        checkoutUrl: session.url,
        ip: metaContext.clientIpAddress,
        userAgent: metaContext.clientUserAgent,
        eventSourceUrl: metaContext.eventSourceUrl,
        landingPage: metaCheckoutMetadata.landingPage,
        referrer: metaCheckoutMetadata.originalReferrer,
        utmSource: metaCheckoutMetadata.utmSource,
        utmMedium: metaCheckoutMetadata.utmMedium,
        utmCampaign: metaCheckoutMetadata.utmCampaign,
        utmContent: metaCheckoutMetadata.utmContent,
        utmTerm: metaCheckoutMetadata.utmTerm,
        fbp: metaCheckoutMetadata.metaFbp,
        fbc: metaCheckoutMetadata.metaFbc,
        fbclid: metaCheckoutMetadata.metaFbclid,
      });
    });

    const initiateCheckoutResult = await sendMetaConversionEvent({
      eventName: "InitiateCheckout",
      eventId: initiateCheckoutEventId,
      value: getPlanValue(plan),
      currency: "USD",
      contentName: `${plan} Subscription`,
      contentCategory: "SaaS Subscription",
      eventSourceUrl: metaContext.eventSourceUrl,
      clientIpAddress: metaContext.clientIpAddress,
      clientUserAgent: metaContext.clientUserAgent,
      fbp: metaContext.fbp,
      fbc: metaContext.fbc,
      customData: getMetaCheckoutCustomData(metaCheckoutMetadata, {
        plan,
        checkoutSessionId: session.id,
      }),
    });

    if (!initiateCheckoutResult.success && !initiateCheckoutResult.skipped) {
      console.warn("Meta CAPI InitiateCheckout failed.", {
        checkoutSessionId: session.id,
        initiateCheckoutEventId,
        error: initiateCheckoutResult.error,
      });
    }

    return NextResponse.json(
      { url: session.url, metaEventId: initiateCheckoutEventId },
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
