import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";
import { getPriceIdForPlan, stripe, type StripePaidPlan } from "@/lib/stripe";
import { getCurrentWorkspace } from "@/lib/workspace";

const schema = z.object({
  plan: z.enum(["PRO", "PROFESSIONAL", "STUDIO"]),
});

function getBaseAppUrl(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  const origin = request.headers.get("origin")?.trim();

  if (origin) {
    return origin.replace(/\/+$/, "");
  }

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";

  if (!host) {
    throw new Error("Não foi possível determinar a URL base da aplicação.");
  }

  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) {
    return originError;
  }

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit(`billing:create-checkout:${ip}`, {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas para abrir o checkout. Tente novamente em instantes." },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateLimit),
      },
    );
  }

  try {
    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        {
          status: 401,
          headers: buildRateLimitHeaders(rateLimit),
        },
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];

      return NextResponse.json(
        { error: firstIssue?.message ?? "Plano inválido." },
        {
          status: 400,
          headers: buildRateLimitHeaders(rateLimit),
        },
      );
    }

    const plan = parsed.data.plan as StripePaidPlan;
    const priceId = getPriceIdForPlan(plan);
    const baseUrl = getBaseAppUrl(request);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${baseUrl}/dashboard/billing?checkout=success`,
      cancel_url: `${baseUrl}/dashboard/billing?checkout=cancelled`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      customer_email: workspace.user?.email || undefined,
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
      return NextResponse.json(
        { error: "A Stripe não retornou a URL do checkout." },
        {
          status: 500,
          headers: buildRateLimitHeaders(rateLimit),
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        url: session.url,
      },
      {
        headers: buildRateLimitHeaders(rateLimit),
      },
    );
  } catch (error) {
    console.error("Erro ao criar checkout da Stripe:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível iniciar o checkout agora.",
      },
      {
        status: 500,
        headers: buildRateLimitHeaders(rateLimit),
      },
    );
  }
}
