"use client";

import { useState } from "react";
import { getMetaBrowserTrackingPayload } from "@/lib/meta-browser";
import { createMetaEventId, trackMetaInitiateCheckout } from "@/lib/meta-pixel";

type PaidPlan = "PRO" | "PROFESSIONAL" | "STUDIO";
type BillingCheckoutMode = "checkout" | "change" | "portal" | "disabled";

type BillingCheckoutButtonProps = {
  plan?: PaidPlan;
  mode: BillingCheckoutMode;
  label: string;
  disabledLabel?: string;
  className?: string;
};

const defaultButtonClassName =
  "inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-4 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60";

export function BillingCheckoutButton({
  plan,
  mode,
  label,
  disabledLabel,
  className = defaultButtonClassName,
}: BillingCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDisabledMode = mode === "disabled";
  const disabled = loading || isDisabledMode;

  async function handleClick() {
    if (disabled) return;

    setLoading(true);
    setError("");

    try {
      const metaEventId =
        (mode === "checkout" || mode === "change") && plan
          ? createMetaEventId("InitiateCheckout")
          : null;

      const endpoint =
        mode === "portal"
          ? "/api/billing/create-portal"
          : mode === "change"
            ? "/api/billing/change-plan"
            : "/api/billing/create-checkout";

      const body =
        mode === "checkout" || mode === "change"
          ? JSON.stringify({
              plan,
              metaEventId: metaEventId || undefined,
              source: `dashboard_billing_${mode}`,
              ...getMetaBrowserTrackingPayload(),
            })
          : undefined;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        metaEventId?: string;
        url?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Could not open checkout.");
      }

      if (!data.url) {
        throw new Error("Stripe did not return a valid URL.");
      }

      if ((mode === "checkout" || mode === "change") && plan) {
        trackMetaInitiateCheckout(plan, data.metaEventId || metaEventId);
      }

      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment error.");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className={className}
      >
        {loading
          ? "Opening checkout..."
          : isDisabledMode
            ? disabledLabel || label
            : label}
      </button>

      {error ? <p className="text-xs leading-5 text-rose-300">{error}</p> : null}
    </div>
  );
}
