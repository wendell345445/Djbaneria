"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OwnerUserActions({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    try {
      setLoading(true);

      const response = await fetch(`/api/owner/users/${userId}/toggle-active`, {
        method: "PATCH",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível atualizar o usuário.");
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o usuário.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex min-h-[38px] items-center justify-center rounded-2xl px-4 text-xs font-semibold uppercase tracking-[0.14em] transition ${
        isActive
          ? "border border-rose-300/15 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15"
          : "border border-emerald-300/15 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/15"
      } disabled:cursor-wait disabled:opacity-80`}
    >
      {loading ? "Salvando..." : isActive ? "Inativar" : "Ativar"}
    </button>
  );
}
