"use client";

import { useState } from "react";

type Locale = "pt-BR" | "en" | "es";

type SettingsPasswordFormProps = {
  locale?: Locale;
};

const passwordCopy: Record<
  Locale,
  {
    changeError: string;
    genericError: string;
    success: string;
    securityEyebrow: string;
    closedTitle: string;
    closedDescription: string;
    openButton: string;
    changeTitle: string;
    cancel: string;
    currentPassword: string;
    currentPasswordPlaceholder: string;
    newPassword: string;
    newPasswordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    changing: string;
    save: string;
    rulesTitle: string;
    rulesItems: string[];
    securityTitle: string;
    securityItems: string[];
  }
> = {
  "pt-BR": {
    changeError: "Não foi possível alterar a senha.",
    genericError: "Erro ao alterar a senha.",
    success: "Senha alterada com sucesso.",
    securityEyebrow: "Segurança",
    closedTitle: "Senha e acesso",
    closedDescription:
      "A opção de alteração de senha fica oculta até você solicitar.",
    openButton: "Alterar senha",
    changeTitle: "Alterar senha",
    cancel: "Cancelar",
    currentPassword: "Senha atual",
    currentPasswordPlaceholder: "Digite sua senha atual",
    newPassword: "Nova senha",
    newPasswordPlaceholder: "Mínimo de 6 caracteres",
    confirmPassword: "Confirmar nova senha",
    confirmPasswordPlaceholder: "Repita a nova senha",
    changing: "Alterando senha...",
    save: "Salvar nova senha",
    rulesTitle: "Regras da senha",
    rulesItems: [
      "Informe a senha atual corretamente.",
      "Use pelo menos 6 caracteres.",
      "Confirme a nova senha antes de salvar.",
    ],
    securityTitle: "Segurança",
    securityItems: [
      "A nova senha substitui a anterior imediatamente.",
      "Depois podemos adicionar fluxo de recuperação por e-mail.",
    ],
  },
  en: {
    changeError: "We could not change your password.",
    genericError: "Error while changing the password.",
    success: "Password changed successfully.",
    securityEyebrow: "Security",
    closedTitle: "Password and access",
    closedDescription:
      "The password change option stays hidden until you request it.",
    openButton: "Change password",
    changeTitle: "Change password",
    cancel: "Cancel",
    currentPassword: "Current password",
    currentPasswordPlaceholder: "Enter your current password",
    newPassword: "New password",
    newPasswordPlaceholder: "Minimum of 6 characters",
    confirmPassword: "Confirm new password",
    confirmPasswordPlaceholder: "Repeat the new password",
    changing: "Changing password...",
    save: "Save new password",
    rulesTitle: "Password rules",
    rulesItems: [
      "Enter the current password correctly.",
      "Use at least 6 characters.",
      "Confirm the new password before saving.",
    ],
    securityTitle: "Security",
    securityItems: [
      "The new password replaces the previous one immediately.",
      "Later we can add an email recovery flow.",
    ],
  },
  es: {
    changeError: "No se pudo cambiar la contraseña.",
    genericError: "Error al cambiar la contraseña.",
    success: "Contraseña cambiada correctamente.",
    securityEyebrow: "Seguridad",
    closedTitle: "Contraseña y acceso",
    closedDescription:
      "La opción para cambiar la contraseña permanece oculta hasta que la solicites.",
    openButton: "Cambiar contraseña",
    changeTitle: "Cambiar contraseña",
    cancel: "Cancelar",
    currentPassword: "Contraseña actual",
    currentPasswordPlaceholder: "Ingresa tu contraseña actual",
    newPassword: "Nueva contraseña",
    newPasswordPlaceholder: "Mínimo de 6 caracteres",
    confirmPassword: "Confirmar nueva contraseña",
    confirmPasswordPlaceholder: "Repite la nueva contraseña",
    changing: "Cambiando contraseña...",
    save: "Guardar nueva contraseña",
    rulesTitle: "Reglas de la contraseña",
    rulesItems: [
      "Ingresa correctamente la contraseña actual.",
      "Usa al menos 6 caracteres.",
      "Confirma la nueva contraseña antes de guardar.",
    ],
    securityTitle: "Seguridad",
    securityItems: [
      "La nueva contraseña sustituye a la anterior inmediatamente.",
      "Después podemos agregar un flujo de recuperación por correo electrónico.",
    ],
  },
};

export function SettingsPasswordForm({ locale = "en" }: SettingsPasswordFormProps) {
  const copy = passwordCopy[locale] ?? passwordCopy.en;
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
        throw new Error(data.error || copy.changeError);
      }

      setSuccess(copy.success);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.genericError);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <section>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
              {copy.securityEyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {copy.closedTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {copy.closedDescription}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={openForm}
              className="inline-flex min-h-[42px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-6 py-3 text-sm font-bold text-slate-950 transition hover:opacity-95"
            >
              {copy.openButton}
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
                {copy.securityEyebrow}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {copy.changeTitle}
              </h2>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-1 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              {copy.cancel}
            </button>
          </div>

          <div className="grid gap-4">
            <Field label={copy.currentPassword}>
              <input
                type="password"
                className={inputClassName}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={copy.currentPasswordPlaceholder}
                autoComplete="current-password"
                required
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label={copy.newPassword}>
                <input
                  type="password"
                  className={inputClassName}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={copy.newPasswordPlaceholder}
                  autoComplete="new-password"
                  required
                />
              </Field>

              <Field label={copy.confirmPassword}>
                <input
                  type="password"
                  className={inputClassName}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={copy.confirmPasswordPlaceholder}
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
            {loading ? copy.changing : copy.save}
          </button>

          {success ? (
            <p className="text-sm text-emerald-300">{success}</p>
          ) : null}

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>

      <aside className="grid gap-4 xl:sticky xl:top-5 xl:h-fit">
        <InfoCard title={copy.rulesTitle} items={copy.rulesItems} />
        <InfoCard title={copy.securityTitle} items={copy.securityItems} />
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
