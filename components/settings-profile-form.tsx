"use client";

import { useState } from "react";

type Locale = "pt-BR" | "en" | "es";

type SettingsProfileFormProps = {
  initialData: {
    workspaceName: string;
    userName: string;
    email: string;
  };
  locale?: Locale;
};

const profileCopy: Record<
  Locale,
  {
    saveError: string;
    genericError: string;
    success: string;
    profileEyebrow: string;
    profileTitle: string;
    userName: string;
    userNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    workspaceEyebrow: string;
    workspaceTitle: string;
    workspaceName: string;
    workspacePlaceholder: string;
    saving: string;
    save: string;
    editableTitle: string;
    editableItems: string[];
    noteTitle: string;
    noteItems: string[];
  }
> = {
  "pt-BR": {
    saveError: "Não foi possível salvar as configurações.",
    genericError: "Erro ao salvar.",
    success: "Informações atualizadas com sucesso.",
    profileEyebrow: "Perfil principal",
    profileTitle: "Informações da conta",
    userName: "Nome do usuário",
    userNamePlaceholder: "Ex.: João Pedro",
    email: "E-mail",
    emailPlaceholder: "Seu e-mail",
    workspaceEyebrow: "Workspace",
    workspaceTitle: "Identidade do workspace",
    workspaceName: "Nome do workspace",
    workspacePlaceholder: "Ex.: Meu Workspace",
    saving: "Salvando...",
    save: "Salvar alterações",
    editableTitle: "O que você pode editar",
    editableItems: [
      "Nome do usuário",
      "Nome do workspace",
      "Consulta do e-mail atual",
    ],
    noteTitle: "Observação",
    noteItems: [
      "Nesta etapa o e-mail está apenas para visualização.",
      "A senha pode ser alterada no bloco logo abaixo.",
    ],
  },
  en: {
    saveError: "We could not save your settings.",
    genericError: "Error while saving.",
    success: "Information updated successfully.",
    profileEyebrow: "Main profile",
    profileTitle: "Account information",
    userName: "User name",
    userNamePlaceholder: "Ex.: John Smith",
    email: "Email",
    emailPlaceholder: "Your email",
    workspaceEyebrow: "Workspace",
    workspaceTitle: "Workspace identity",
    workspaceName: "Workspace name",
    workspacePlaceholder: "Ex.: My Workspace",
    saving: "Saving...",
    save: "Save changes",
    editableTitle: "What you can edit",
    editableItems: [
      "User name",
      "Workspace name",
      "View current email",
    ],
    noteTitle: "Note",
    noteItems: [
      "At this stage, the email is view-only.",
      "The password can be changed in the block below.",
    ],
  },
  es: {
    saveError: "No se pudieron guardar las configuraciones.",
    genericError: "Error al guardar.",
    success: "Información actualizada correctamente.",
    profileEyebrow: "Perfil principal",
    profileTitle: "Información de la cuenta",
    userName: "Nombre del usuario",
    userNamePlaceholder: "Ej.: Juan Pérez",
    email: "Correo electrónico",
    emailPlaceholder: "Tu correo electrónico",
    workspaceEyebrow: "Workspace",
    workspaceTitle: "Identidad del workspace",
    workspaceName: "Nombre del workspace",
    workspacePlaceholder: "Ej.: Mi Workspace",
    saving: "Guardando...",
    save: "Guardar cambios",
    editableTitle: "Qué puedes editar",
    editableItems: [
      "Nombre del usuario",
      "Nombre del workspace",
      "Consulta del correo actual",
    ],
    noteTitle: "Observación",
    noteItems: [
      "En esta etapa el correo solo está disponible para visualización.",
      "La contraseña se puede cambiar en el bloque de abajo.",
    ],
  },
};

export function SettingsProfileForm({
  initialData,
  locale = "en",
}: SettingsProfileFormProps) {
  const copy = profileCopy[locale] ?? profileCopy.en;
  const [workspaceName, setWorkspaceName] = useState(initialData.workspaceName);
  const [userName, setUserName] = useState(initialData.userName);
  const [email] = useState(initialData.email);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceName,
          userName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || copy.saveError);
      }

      setSuccess(copy.success);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="grid gap-5">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
              {copy.profileEyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {copy.profileTitle}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={copy.userName}>
              <input
                className={inputClassName}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={copy.userNamePlaceholder}
              />
            </Field>

            <Field label={copy.email}>
              <input
                className={`${inputClassName} opacity-80`}
                value={email}
                readOnly
                placeholder={copy.emailPlaceholder}
              />
            </Field>
          </div>
        </section>

        <section className="p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
              {copy.workspaceEyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {copy.workspaceTitle}
            </h2>
          </div>

          <div className="grid gap-4">
            <Field label={copy.workspaceName}>
              <input
                className={inputClassName}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder={copy.workspacePlaceholder}
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-80"
          >
            {loading ? copy.saving : copy.save}
          </button>

          {success ? (
            <p className="text-sm text-emerald-300">{success}</p>
          ) : null}

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>

      <aside className="grid gap-4 xl:sticky xl:top-5 xl:h-fit">
        <InfoCard title={copy.editableTitle} items={copy.editableItems} />
        <InfoCard title={copy.noteTitle} items={copy.noteItems} />
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
