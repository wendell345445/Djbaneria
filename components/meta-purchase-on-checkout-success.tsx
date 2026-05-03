"use client";

import { useEffect } from "react";
import { trackMetaPurchase } from "@/lib/meta-pixel";

type MetaPurchaseOnCheckoutSuccessProps = {
  sessionId?: string | null;
};

type CheckoutSessionMeta = {
  plan?: string | null;
  value?: number | null;
  currency?: string | null;
};

async function getCheckoutSessionMeta(sessionId: string) {
  const response = await fetch(
    `/api/public/checkout-session?session_id=${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {} satisfies CheckoutSessionMeta;
  }

  return (await response.json().catch(() => ({}))) as CheckoutSessionMeta;
}

export function MetaPurchaseOnCheckoutSuccess({
  sessionId,
}: MetaPurchaseOnCheckoutSuccessProps) {
  useEffect(() => {
    if (!sessionId) return;

    const eventId = `purchase_${sessionId}`;
    const storageKey = `meta_purchase_sent_${eventId}`;

    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40;

    const timer = window.setInterval(async () => {
      attempts += 1;

      if (typeof window.fbq === "function") {
        window.clearInterval(timer);

        const sessionMeta = await getCheckoutSessionMeta(sessionId);

        if (cancelled) return;

        trackMetaPurchase({
          eventId,
          plan: sessionMeta.plan,
          value: sessionMeta.value,
          currency: sessionMeta.currency || "USD",
          contentName: sessionMeta.plan
            ? `${sessionMeta.plan} Subscription`
            : "DJ Pro AI Subscription",
        });

        window.sessionStorage.setItem(storageKey, "1");
      }

      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sessionId]);

  return null;
}
