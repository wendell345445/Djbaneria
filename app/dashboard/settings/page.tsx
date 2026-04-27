import Link from "next/link";

import { SettingsPasswordForm } from "@/components/settings-password-form";
import { SettingsProfileForm } from "@/components/settings-profile-form";
import { getAppCopy, getLanguageLabel, normalizeLocale } from "@/lib/i18n";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function SettingsPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = getAppCopy(locale).settings;

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          {copy.eyebrow}
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
          {copy.title}
        </h1>
        <p className="max-w-2xl text-sm leading-5 text-white/60">
          {copy.description}
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                {copy.languageEyebrow}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {copy.languageTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {copy.currentLanguage}: {getLanguageLabel(locale)}.
              </p>
            </div>

            <Link
              href="/dashboard/settings/language"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              {copy.changeLanguage}
            </Link>
          </div>
        </div>

        <SettingsProfileForm
          locale={locale}
          initialData={{
            workspaceName: workspace.name ?? "",
            userName: workspace.user?.name ?? "",
            email: workspace.user?.email ?? "",
          }}
        />

        <SettingsPasswordForm locale={locale} />
      </div>
    </main>
  );
}
