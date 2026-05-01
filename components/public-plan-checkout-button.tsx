"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { trackMetaInitiateCheckout } from "@/lib/meta-pixel";

type PaidPlan = "PRO" | "PROFESSIONAL" | "STUDIO";

type PublicPlanCheckoutButtonProps = {
  plan: PaidPlan;
  label?: string;
  className?: string;
};

const defaultClassName =
  "group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-75";

export function PublicPlanCheckoutButton({
  plan,
  label = "Get started",
  className = defaultClassName,
}: PublicPlanCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      trackMetaInitiateCheckout(plan);

      const response = await fetch("/api/public/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Could not open checkout.");
      }

      if (!data.url) {
        throw new Error("Stripe did not return a valid checkout URL.");
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
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        <span>{loading ? "Opening checkout..." : label}</span>
        <ArrowRight
          size={16}
          className="transition duration-300 group-hover:translate-x-0.5"
        />
      </button>

      {error ? <p className="text-xs leading-5 text-rose-300">{error}</p> : null}
    </div>
  );
}
