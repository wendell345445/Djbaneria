import { redirect } from "next/navigation";

import { LanguageSelectionForm } from "@/components/language-selection-form";
import { DEFAULT_LOCALE, getAppCopy, normalizeLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function ChooseLanguagePage() {
  const workspace = await requireCurrentWorkspace();

  const userLanguagePreference = await prisma.user.findUnique({
    where: {
      id: workspace.userId,
    },
    select: {
      preferredLocale: true,
      languageOnboardingCompleted: true,
    },
  });

  if (userLanguagePreference?.languageOnboardingCompleted) {
    redirect("/dashboard/settings/language");
  }

  const initialLocale = normalizeLocale(
    userLanguagePreference?.preferredLocale ?? DEFAULT_LOCALE,
  );
  const copy = getAppCopy(initialLocale);

  return (
    <main className="min-h-screen bg-[#050916] px-5 py-8 text-white sm:py-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_32%)]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-5xl place-items-center">
        <div className="w-full max-w-[680px]">
          <div className="mb-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
              {copy.common.appName}
            </p>
            <p className="mt-2 text-sm text-white/55">
              {copy.onboarding.intro}
            </p>
          </div>

          <LanguageSelectionForm
            initialLocale={initialLocale}
            variant="onboarding"
            returnTo="/dashboard"
          />
        </div>
      </div>
    </main>
  );
}
