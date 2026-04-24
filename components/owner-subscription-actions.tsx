"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PlanValue = "FREE" | "PRO" | "PROFESSIONAL" | "STUDIO";
type StatusValue =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export function OwnerSubscriptionActions({
  subscriptionId,
  currentPlan,
  currentStatus,
}: {
  subscriptionId: string;
  currentPlan: PlanValue;
  currentStatus: StatusValue;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanValue>(currentPlan);
  const [status, setStatus] = useState<StatusValue>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);

      const response = await fetch(`/api/owner/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          status,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível atualizar a assinatura.",
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a assinatura.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value as PlanValue)}
        className="min-h-[38px] rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-xs font-medium text-white outline-none"
      >
        <option value="FREE" className="bg-slate-950">FREE</option>
        <option value="PRO" className="bg-slate-950">PRO</option>
        <option value="PROFESSIONAL" className="bg-slate-950">PROFESSIONAL</option>
        <option value="STUDIO" className="bg-slate-950">STUDIO</option>
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as StatusValue)}
        className="min-h-[38px] rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-xs font-medium text-white outline-none"
      >
        <option value="TRIALING" className="bg-slate-950">TRIALING</option>
        <option value="ACTIVE" className="bg-slate-950">ACTIVE</option>
        <option value="PAST_DUE" className="bg-slate-950">PAST_DUE</option>
        <option value="CANCELED" className="bg-slate-950">CANCELED</option>
        <option value="EXPIRED" className="bg-slate-950">EXPIRED</option>
      </select>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="inline-flex min-h-[38px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-80"
      >
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}
