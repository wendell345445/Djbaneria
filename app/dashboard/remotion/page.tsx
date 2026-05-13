import { RemotionFlowCard } from "@/components/remotion-flow-card";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

const copyByLocale: Record<
  SupportedLocale,
  {
    mainCardEyebrow: string;
    mainCardTitle: string;
    uploadStep: string;
    libraryStep: string;
    editorStep: string;
    remotionTitle: string;
    remotionHint: string;
    fallbackTitle: string;
    noSelectionText: string;
  }
> = {
  "pt-BR": {
    mainCardEyebrow: "Fluxo Remotion",
    mainCardTitle: "Do flyer estático ao vídeo animado",
    uploadStep: "01 · Envie o flyer",
    libraryStep: "02 · Ou escolha um flyer da plataforma",
    editorStep: "03 · Configure o motion",
    remotionTitle: "Editor Remotion",
    remotionHint:
      "Depois de selecionar um flyer, envie a música, escolha o trecho mais forte e selecione o estilo de animação para criar seu vídeo.",
    fallbackTitle: "Imagem sem título",
    noSelectionText:
      "Envie um flyer pronto do seu dispositivo ou escolha um flyer gerado na plataforma. O editor será liberado logo depois.",
  },
  en: {
    mainCardEyebrow: "Remotion flow",
    mainCardTitle: "From static flyer to animated video",
    uploadStep: "01 · Upload the flyer",
    libraryStep: "02 · Or choose a platform flyer",
    editorStep: "03 · Configure the motion",
    remotionTitle: "Remotion editor",
    remotionHint:
      "After selecting a flyer, upload the track, pick the strongest clip and choose the motion style to create your video.",
    fallbackTitle: "Untitled image",
    noSelectionText:
      "Upload a finished flyer from your device or choose a flyer generated on the platform. The editor will unlock right after that.",
  },
  es: {
    mainCardEyebrow: "Flujo Remotion",
    mainCardTitle: "Del flyer estático al video animado",
    uploadStep: "01 · Sube el flyer",
    libraryStep: "02 · O elige un flyer de la plataforma",
    editorStep: "03 · Configura el motion",
    remotionTitle: "Editor Remotion",
    remotionHint:
      "Después de seleccionar un flyer, sube la música, elige el trecho más fuerte y selecciona el estilo de animación para crear tu video.",
    fallbackTitle: "Imagen sin título",
    noSelectionText:
      "Sube un flyer listo desde tu dispositivo o elige un flyer generado en la plataforma. El editor se libera justo después.",
  },
};

type SearchParams = {
  bannerId?: string;
  source?: string;
};

const REMOTION_UPLOAD_MODEL_NAME = "user-upload-remotion";

export default async function DashboardRemotionPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = copyByLocale[locale];
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialSourceType =
    resolvedSearchParams.source === "manual" ||
    resolvedSearchParams.source === "platform"
      ? resolvedSearchParams.source
      : null;

  const libraryBanners = await prisma.banner.findMany({
    where: {
      workspaceId: workspace.id,
      status: "COMPLETED",
      outputImageUrl: { not: null },
      NOT: {
        modelName: REMOTION_UPLOAD_MODEL_NAME,
      },
    },
    select: {
      id: true,
      title: true,
      djName: true,
      format: true,
      outputImageUrl: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  });

  const selectedBanner = resolvedSearchParams.bannerId
    ? await prisma.banner.findFirst({
        where: {
          id: resolvedSearchParams.bannerId,
          workspaceId: workspace.id,
          status: "COMPLETED",
          outputImageUrl: { not: null },
        },
        select: {
          id: true,
          title: true,
          djName: true,
          format: true,
          outputImageUrl: true,
          createdAt: true,
        },
      })
    : null;

  const motionRenders = selectedBanner
    ? await (prisma as any).bannerMotion.findMany({
        where: {
          bannerId: selectedBanner.id,
          workspaceId: workspace.id,
        },
        select: {
          id: true,
          preset: true,
          transitionVariant: true,
          status: true,
          renderProgress: true,
          outputVideoUrl: true,
          errorMessage: true,
          durationSeconds: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      })
    : [];

  const pickerBanners = libraryBanners.map((banner) => ({
    id: banner.id,
    title: banner.title || banner.djName || copy.fallbackTitle,
    format: banner.format,
    outputImageUrl: banner.outputImageUrl,
    createdAt: banner.createdAt.toISOString(),
  }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03040A] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(0,245,255,0.16),transparent_34%),radial-gradient(circle_at_86%_8%,rgba(191,95,255,0.17),transparent_34%),linear-gradient(180deg,#050712,#03040a_58%,#010208)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(0,245,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(191,95,255,0.045)_1px,transparent_1px)] [background-size:46px_46px]" />
      <div className="pointer-events-none absolute -left-56 top-28 -z-10 h-[520px] w-[520px] rounded-full bg-cyan-300/[0.075] blur-3xl" />
      <div className="pointer-events-none absolute -right-44 top-80 -z-10 h-[460px] w-[460px] rounded-full bg-violet-400/[0.075] blur-3xl" />

      <section className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden border border-cyan-300/14 bg-white/[0.035] shadow-[0_30px_110px_rgba(0,0,0,0.42)]">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/65 to-transparent" />
          <div className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 top-48 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:34px_34px]" />

          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-violet-100/55">
                  {copy.mainCardEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.045em] text-white sm:text-3xl">
                  {copy.mainCardTitle}
                </h2>
              </div>

              <div className="grid grid-cols-3 border border-white/10 bg-black/18 text-center font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white/42">
                <span className="border-r border-white/10 px-3 py-3 text-cyan-100/70">
                  Upload
                </span>
                <span className="border-r border-white/10 px-3 py-3 text-violet-100/70">
                  Audio
                </span>
                <span className="px-3 py-3 text-amber-100/70">MP4</span>
              </div>
            </div>

            <RemotionFlowCard
              locale={locale}
              copy={copy}
              pickerBanners={pickerBanners}
              initialSourceType={initialSourceType}
              initialSelectedBanner={
                selectedBanner
                  ? {
                      id: selectedBanner.id,
                      title: selectedBanner.title,
                      djName: selectedBanner.djName,
                      outputImageUrl: selectedBanner.outputImageUrl,
                    }
                  : null
              }
              initialMotions={motionRenders.map((motion: any) => ({
                ...motion,
                createdAt:
                  motion.createdAt instanceof Date
                    ? motion.createdAt.toISOString()
                    : motion.createdAt,
              }))}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
