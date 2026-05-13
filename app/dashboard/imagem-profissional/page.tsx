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
    <main className="relative isolate min-h-screen overflow-hidden bg-[#03040a] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(rgba(34,211,238,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute left-[-18%] top-[-18%] -z-10 h-[420px] w-[420px] rounded-full bg-cyan-400/14 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-16%] -z-10 h-[520px] w-[520px] rounded-full bg-violet-500/14 blur-[140px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

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
