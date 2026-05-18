import { NextResponse } from "next/server";
import { z } from "zod";
import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";

import {
  createServerMetaEventId,
  getMetaRequestContext,
  sendMetaConversionEvent,
} from "@/lib/meta-capi";
import { prisma } from "@/lib/prisma";
import { validateMutationOrigin } from "@/lib/request-security";
import {
  assertStripeConfigured,
  getAppUrl,
  getPriceIdForPlan,
  isStripePaidPlan,
  type StripePaidPlan,
  stripe,
} from "@/lib/stripe";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

const metaBrowserTrackingSchema = z.object({
  fbp: z.string().trim().max(250).optional(),
  fbc: z.string().trim().max(250).optional(),
  fbclid: z.string().trim().max(500).optional(),
  eventSourceUrl: z.string().trim().max(900).optional(),
});

const schema = z.object({
  plan: z.enum(["PRO", "PROFESSIONAL", "STUDIO"]),
  metaEventId: z.string().trim().min(8).max(128).optional(),
  source: z.string().trim().max(120).optional(),
  ...metaBrowserTrackingSchema.shape,
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

function getMetaCheckoutMetadata(
  request: Request,
  browserFallback: z.infer<typeof metaBrowserTrackingSchema> = {},
) {
  const metaContext = getMetaRequestContext(request, browserFallback);

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
    workspaceId: string;
  },
) {
  return {
    content_type: "product",
    num_items: 1,
    plan: params.plan,
    checkout_flow: "dashboard_checkout",
    stripe_checkout_session_id: params.checkoutSessionId,
    workspace_id: params.workspaceId,

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

async function getOrCreateStripeCustomer(params: {
  workspaceId: string;
  workspaceName: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  existingCustomerId?: string | null;
}) {
  if (params.existingCustomerId) {
    return params.existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email: params.userEmail || undefined,
    name: params.userName || params.workspaceName,
    metadata: {
      userId: params.userId,
      workspaceId: params.workspaceId,
    },
  });

  await prisma.subscription.upsert({
    where: { workspaceId: params.workspaceId },
    create: {
      workspaceId: params.workspaceId,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.TRIALING,
      provider: "stripe",
      providerCustomerId: customer.id,
    },
    update: {
      provider: "stripe",
      providerCustomerId: customer.id,
    },
  });

  return customer.id;
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
        { error: parsed.error.issues[0]?.message || "Invalid plan." },
        { status: 400 },
      );
    }

    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json(
        { error: "User is not authenticated." },
        { status: 401 },
      );
    }

    const plan = parsed.data.plan;

    if (!isStripePaidPlan(plan)) {
      return NextResponse.json(
        { error: "Unsupported plan." },
        { status: 400 },
      );
    }

    const priceId = getPriceIdForPlan(plan as StripePaidPlan);

    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price is not configured for plan ${plan}.` },
        { status: 500 },
      );
    }

    const subscription = workspace.subscription;
    const hasActivePaidSubscription =
      subscription?.providerSubscriptionId &&
      subscription.plan !== SubscriptionPlan.FREE &&
      (subscription.status === SubscriptionStatus.ACTIVE ||
        subscription.status === SubscriptionStatus.TRIALING ||
        subscription.status === SubscriptionStatus.PAST_DUE);

    if (hasActivePaidSubscription) {
      return NextResponse.json(
        {
          error:
            "You already have a paid subscription. Use Manage subscription to change or cancel your plan.",
        },
        { status: 409 },
      );
    }

    const customerId = await getOrCreateStripeCustomer({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      userId: workspace.userId,
      userEmail: workspace.user?.email,
      userName: workspace.user?.name,
      existingCustomerId: subscription?.providerCustomerId,
    });

    const appUrl = getAppUrl();
    const metaCheckoutMetadata = getMetaCheckoutMetadata(request, parsed.data);
    const checkoutRequestMetadata = removeEmptyStripeMetadata({
      checkoutSource: normalizeStripeMetadataValue(parsed.data.source),
    });
    const metaContext = getMetaRequestContext(request, parsed.data);
    const initiateCheckoutEventId =
      parsed.data.metaEventId?.trim() ||
      createServerMetaEventId("InitiateCheckout");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing`,
      allow_promotion_codes: true,
      client_reference_id: workspace.id,
      metadata: {
        checkoutFlow: "dashboard_checkout",
        workspaceId: workspace.id,
        plan,
        initiateCheckoutEventId,
        ...checkoutRequestMetadata,
        ...metaCheckoutMetadata,
      },
      subscription_data: {
        metadata: {
          checkoutFlow: "dashboard_checkout",
          workspaceId: workspace.id,
          plan,
          initiateCheckoutEventId,
          ...checkoutRequestMetadata,
          ...metaCheckoutMetadata,
        },
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a valid checkout URL.");
    }

    const initiateCheckoutResult = await sendMetaConversionEvent({
      eventName: "InitiateCheckout",
      eventId: initiateCheckoutEventId,
      email: workspace.user?.email || null,
      value: getPlanValue(plan),
      currency: "USD",
      contentName: `${plan} Subscription`,
      contentCategory: "SaaS Subscription",
      eventSourceUrl: metaContext.eventSourceUrl,
      clientIpAddress: metaContext.clientIpAddress,
      clientUserAgent: metaContext.clientUserAgent,
      fbp: metaContext.fbp,
      fbc: metaContext.fbc,
      externalId: workspace.id,
      customData: getMetaCheckoutCustomData(metaCheckoutMetadata, {
        plan,
        checkoutSessionId: session.id,
        workspaceId: workspace.id,
      }),
    });

    if (!initiateCheckoutResult.success && !initiateCheckoutResult.skipped) {
      console.warn("Meta CAPI dashboard InitiateCheckout failed.", {
        checkoutSessionId: session.id,
        initiateCheckoutEventId,
        error: initiateCheckoutResult.error,
      });
    }

    return NextResponse.json({
      url: session.url,
      metaEventId: initiateCheckoutEventId,
    });
  } catch (error) {
    console.error("Error creating Stripe checkout:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal error while creating Stripe checkout.",
      },
      { status: 500 },
    );
  }
}
