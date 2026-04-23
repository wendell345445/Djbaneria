"use client";

import { useState } from "react";

export function SettingsPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function openForm() {
    setOpen(true);
    setSuccess("");
    setError("");
  }

  function closeForm() {
    setOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível alterar a senha.");
      }

      setSuccess("Senha alterada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar a senha.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
              Segurança
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Senha e acesso
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              A opção de alteração de senha fica oculta até você solicitar.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={openForm}
              className="inline-flex min-h-[42px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-6 py-3 text-sm font-bold text-slate-950 transition hover:opacity-95"
            >
              Alterar senha
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="grid gap-5">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                Segurança
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Alterar senha
              </h2>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-1 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Cancelar
            </button>
          </div>

          <div className="grid gap-4">
            <Field label="Senha atual">
              <input
                type="password"
                className={inputClassName}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                autoComplete="current-password"
                required
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nova senha">
                <input
                  type="password"
                  className={inputClassName}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  required
                />
              </Field>

              <Field label="Confirmar nova senha">
                <input
                  type="password"
                  className={inputClassName}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  required
                />
              </Field>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-80"
          >
            {loading ? "Alterando senha..." : "Salvar nova senha"}
          </button>

          {success ? (
            <p className="text-sm text-emerald-300">{success}</p>
          ) : null}

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>

      <aside className="grid gap-4 xl:sticky xl:top-5 xl:h-fit">
        <InfoCard
          title="Regras da senha"
          items={[
            "Informe a senha atual corretamente.",
            "Use pelo menos 6 caracteres.",
            "Confirme a nova senha antes de salvar.",
          ]}
        />

        <InfoCard
          title="Segurança"
          items={[
            "A nova senha substitui a anterior imediatamente.",
            "Depois podemos adicionar fluxo de recuperação por e-mail.",
          ]}
        />
      </aside>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3">
      <label className="text-sm font-medium text-white/90">{label}</label>
      {children}
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {title}
      </p>

      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/75"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 placeholder:text-white/35";
