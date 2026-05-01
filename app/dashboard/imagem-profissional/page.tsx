import { ProfessionalImageStudio } from "@/components/professional-image-studio";
import { normalizeLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function ProfessionalImagePage() {
  const workspace = await requireCurrentWorkspace();

  const userLanguage = await prisma.user.findUnique({
    where: { id: workspace.userId },
    select: { preferredLocale: true },
  });

  const locale = normalizeLocale(
    userLanguage?.preferredLocale ?? workspace.user?.preferredLocale,
  );

  return (
    <main className="min-h-screen bg-[#07070b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <ProfessionalImageStudio
          key={locale}
          workspaceName={workspace.name}
          locale={locale}
        />
      </div>
    </main>
  );
}
