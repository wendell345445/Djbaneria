import { NextResponse } from "next/server";

import { validateMutationOrigin } from "@/lib/request-security";
import { assertStripeConfigured, getAppUrl, stripe } from "@/lib/stripe";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  try {
    assertStripeConfigured();

    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const customerId = workspace.subscription?.providerCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { error: "Cliente Stripe ainda não encontrado para este workspace." },
        { status: 404 },
      );
    }

    const appUrl = getAppUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erro ao criar portal Stripe:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao abrir portal Stripe.",
      },
      { status: 500 },
    );
  }
}
