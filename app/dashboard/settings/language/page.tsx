import { LanguageSelectionForm } from "@/components/language-selection-form";
import { getAppCopy, normalizeLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function LanguageSettingsPage() {
  const workspace = await requireCurrentWorkspace();

  const userLanguagePreference = await prisma.user.findUnique({
    where: {
      id: workspace.userId,
    },
    select: {
      preferredLocale: true,
    },
  });

  const currentLocale = normalizeLocale(
    userLanguagePreference?.preferredLocale ?? workspace.user?.preferredLocale,
  );
  const copy = getAppCopy(currentLocale);

  return (
    <main className="mx-auto max-w-[980px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          {copy.language.pageEyebrow}
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
          {copy.language.pageTitle}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-white/60">
          {copy.language.pageDescription}
        </p>
      </div>

      <LanguageSelectionForm
        initialLocale={currentLocale}
        variant="settings"
        returnTo="/dashboard/settings/language"
      />
    </main>
  );
}
