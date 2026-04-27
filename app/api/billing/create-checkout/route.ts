import { NextResponse } from "next/server";
import { z } from "zod";
import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";

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

const schema = z.object({
  plan: z.enum(["PRO", "PROFESSIONAL", "STUDIO"]),
});

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
        workspaceId: workspace.id,
        plan,
      },
      subscription_data: {
        metadata: {
          workspaceId: workspace.id,
          plan,
        },
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a valid checkout URL.");
    }

    return NextResponse.json({
      url: session.url,
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
