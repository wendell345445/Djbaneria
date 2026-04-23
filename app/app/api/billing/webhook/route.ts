import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/generated/prisma/enums";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "unpaid":
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.EXPIRED;
  }
}

function mapPlanFromPrice(priceId?: string | null): SubscriptionPlan {
  if (priceId && priceId === process.env.STRIPE_PRICE_STUDIO) return SubscriptionPlan.STUDIO;
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return SubscriptionPlan.PRO;
  return SubscriptionPlan.FREE;
}

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook do Stripe não configurado." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Assinatura inválida." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      if (workspaceId && session.customer) {
        await prisma.subscription.upsert({
          where: { workspaceId },
          create: {
            workspaceId,
            plan: session.metadata?.plan === "STUDIO" ? SubscriptionPlan.STUDIO : SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            provider: "stripe",
            providerCustomerId: String(session.customer),
            providerSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
          },
          update: {
            plan: session.metadata?.plan === "STUDIO" ? SubscriptionPlan.STUDIO : SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            providerCustomerId: String(session.customer),
            providerSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
          },
        });
      }
    }

    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "invoice.paid", "invoice.payment_failed"].includes(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      const item = subscription.items.data[0];
      const priceId = item?.price?.id || null;

      await prisma.subscription.updateMany({
        where: { providerSubscriptionId: subscription.id },
        data: {
          plan: mapPlanFromPrice(priceId),
          status: mapStripeStatus(subscription.status),
          currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
          cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao processar webhook." }, { status: 500 });
  }
}
