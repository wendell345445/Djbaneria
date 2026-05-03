import { NextResponse } from "next/server";

import { getPlanFromPriceId, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getMetadataValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeCurrency(value?: string | null) {
  return (value || "usd").toUpperCase();
}

function normalizeAmount(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round((value / 100) * 100) / 100;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Invalid checkout session." },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    const firstLineItem = session.line_items?.data?.[0];
    const priceId = firstLineItem?.price?.id || null;
    const planFromPrice = getPlanFromPriceId(priceId);
    const plan =
      getMetadataValue(session.metadata?.plan) ||
      (planFromPrice ? String(planFromPrice) : null);

    return NextResponse.json({
      plan,
      value: normalizeAmount(session.amount_total),
      currency: normalizeCurrency(session.currency),
    });
  } catch (error) {
    console.error("Error reading public checkout session:", error);

    return NextResponse.json(
      { error: "Could not read checkout session." },
      { status: 500 },
    );
  }
}
