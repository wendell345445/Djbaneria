"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PaidPlan = "PRO" | "PROFESSIONAL" | "STUDIO";

type BillingCheckoutButtonProps = {
  plan?: PaidPlan;
  mode: "checkout" | "change" | "portal" | "disabled";
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isUnavailable = mode === "disabled";
  const isButtonDisabled = loading || isUnavailable;

  async function handleClick() {
    if (isButtonDisabled) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "checkout") {
        if (!plan) {
          throw new Error("Plano inválido para checkout.");
        }

        window.location.assign(`/dashboard/checkout?plan=${plan}`);
        return;
      }

      if (mode === "change") {
        if (!plan) {
          throw new Error("Plano inválido para troca.");
        }

        const response = await fetch("/api/billing/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível trocar o plano.");
        }

        setSuccess(data.message || "Plano atualizado com sucesso.");
        router.refresh();
        setLoading(false);
        return;
      }

      const response = await fetch("/api/billing/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível abrir a Stripe.");
      }

      if (!data.url) {
        throw new Error("A Stripe não retornou uma URL válida.");
      }

      window.location.assign(data.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar assinatura.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={handleClick}
        className={className}
      >
        {loading
          ? mode === "checkout"
            ? "Abrindo checkout..."
            : mode === "change"
              ? "Atualizando plano..."
              : "Abrindo Stripe..."
          : isUnavailable
            ? disabledLabel || label
            : label}
      </button>

      {success ? (
        <p className="text-xs leading-5 text-emerald-300">{success}</p>
      ) : null}
      {error ? <p className="text-xs leading-5 text-rose-300">{error}</p> : null}
    </div>
  );
}
