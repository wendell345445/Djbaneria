"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

type PaidPlan = "PRO" | "PROFESSIONAL" | "STUDIO";

type EmbeddedCheckoutInstance = {
  mount: (selector: string) => void;
  destroy: () => void;
};

type StripeWithEmbeddedCheckout = {
  initEmbeddedCheckout?: (options: {
    fetchClientSecret: () => Promise<string>;
  }) => Promise<EmbeddedCheckoutInstance>;
  createEmbeddedCheckoutPage?: (options: {
    fetchClientSecret: () => Promise<string>;
  }) => Promise<EmbeddedCheckoutInstance>;
};

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const planLabels: Record<PaidPlan, string> = {
  PRO: "Pro",
  PROFESSIONAL: "Professional",
  STUDIO: "Studio",
};

export function EmbeddedCheckoutForm({ plan }: { plan: PaidPlan }) {
  const checkoutRef = useRef<EmbeddedCheckoutInstance | null>(null);
  const mountedRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function mountCheckout() {
      setError("");

      if (!stripePromise) {
        setError("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não configurada.");
        return;
      }

      try {
        const stripe = await stripePromise;

        if (!stripe || cancelled) {
          throw new Error("Não foi possível carregar a Stripe.");
        }

        const fetchClientSecret = async () => {
          const response = await fetch("/api/billing/create-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Não foi possível iniciar o checkout.");
          }

          if (!data.clientSecret) {
            throw new Error("A Stripe não retornou o client secret.");
          }

          return data.clientSecret as string;
        };

        const stripeWithEmbedded = stripe as unknown as StripeWithEmbeddedCheckout;
        const createEmbeddedCheckout =
          stripeWithEmbedded.createEmbeddedCheckoutPage ||
          stripeWithEmbedded.initEmbeddedCheckout;

        if (!createEmbeddedCheckout) {
          throw new Error(
            "Sua versão do @stripe/stripe-js não suporta Embedded Checkout. Atualize para a versão mais recente.",
          );
        }

        if (mountedRef.current) return;

        const checkout = await createEmbeddedCheckout({ fetchClientSecret });

        if (cancelled) {
          checkout.destroy();
          return;
        }

        checkoutRef.current = checkout;
        mountedRef.current = true;
        checkout.mount("#stripe-embedded-checkout");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar checkout embutido.",
        );
      }
    }

    mountCheckout();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      checkoutRef.current?.destroy();
      checkoutRef.current = null;
    };
  }, [plan]);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.3)] backdrop-blur md:p-6">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/70 to-transparent" />
      <div className="relative z-10 mb-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          Checkout seguro
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white md:text-[34px]">
          Assinar plano {planLabels[plan]}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
          Finalize sua assinatura com segurança sem sair do painel.
        </p>
      </div>

      {error ? (
        <div className="relative z-10 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">
          {error}
        </div>
      ) : (
        <div className="relative z-10 min-h-[620px] overflow-hidden rounded-[24px] border border-white/10 bg-white p-2">
          <div id="stripe-embedded-checkout" />
        </div>
      )}
    </section>
  );
}
