import Link from "next/link";
import { Film, Plus } from "lucide-react";

import { DashboardLibraryStyle } from "@/components/dashboard-library-style";
import { SeedanceVideoCard } from "@/components/seedance-video-card";
import { normalizeLocale } from "@/lib/i18n";
import { cleanupExpiredSeedanceVideos } from "@/lib/seedance/cleanup";
import { requireCurrentWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SeedanceVideo = {
  id: string;
  status: string;
  progress: number;
  inputImageUrl: string;
  outputVideoUrl: string | null;
  resolution: string;
  motionInstructions: string | null;
  errorMessage: string | null;
  createdAt: Date;
  expiresAt: Date;
};

const myVideosCopy = {
  "pt-BR": {
    eyebrow: "Biblioteca de vídeos",
    title: "Seus flyers animados prontos para postar",
    description:
      "Acompanhe os vídeos gerados a partir dos seus flyers, baixe os arquivos finalizados e mantenha sua biblioteca limpa automaticamente por 24 horas.",
    newVideo: "Gerar novo vídeo",
    totalLabel: "Vídeos disponíveis",
    readyLabel: "Prontos para baixar",
    renderingLabel: "Em processamento",
    libraryTitle: "Últimos vídeos",
    libraryDescription: "Baixe seus vídeos finalizados ou acompanhe o progresso das renderizações em andamento.",
    emptyTitle: "Você ainda não gerou nenhum vídeo",
    emptyDescription:
      "Envie um flyer pronto e transforme sua arte em um vídeo animado com movimento, efeitos e trilha automática.",
    firstVideo: "Criar vídeo animado",
    retentionTitle: "Disponível por 24 horas",
    retentionDescription:
      "Após o prazo, o vídeo é removido automaticamente do storage e do banco para manter o sistema leve.",
  },
  en: {
    eyebrow: "Video library",
    title: "Your animated flyers ready to post",
    description:
      "Track the videos generated from your flyers, download completed files and keep your library automatically clean for 24 hours.",
    newVideo: "Generate new video",
    totalLabel: "Videos available",
    readyLabel: "Ready to download",
    renderingLabel: "Processing",
    libraryTitle: "Latest videos",
    libraryDescription: "Download finished videos or follow the progress of renders still in progress.",
    emptyTitle: "You have not generated any video yet",
    emptyDescription:
      "Upload a ready flyer and turn your artwork into an animated video with motion, effects and automatic music.",
    firstVideo: "Create animated video",
    retentionTitle: "Available for 24 hours",
    retentionDescription:
      "After that period, the video is automatically removed from storage and the database to keep the system clean.",
  },
  es: {
    eyebrow: "Biblioteca de videos",
    title: "Tus flyers animados listos para publicar",
    description:
      "Acompaña los videos generados a partir de tus flyers, descarga los archivos finalizados y mantén tu biblioteca limpia automáticamente por 24 horas.",
    newVideo: "Generar nuevo video",
    totalLabel: "Videos disponibles",
    readyLabel: "Listos para descargar",
    renderingLabel: "Procesando",
    libraryTitle: "Últimos videos",
    libraryDescription: "Descarga tus videos finalizados o sigue el progreso de las renderizaciones en curso.",
    emptyTitle: "Aún no has generado ningún video",
    emptyDescription:
      "Envía un flyer listo y convierte tu arte en un video animado con movimiento, efectos y música automática.",
    firstVideo: "Crear video animado",
    retentionTitle: "Disponible por 24 horas",
    retentionDescription:
      "Después del plazo, el video se elimina automáticamente del storage y de la base de datos para mantener el sistema ligero.",
  },
} as const;

export default async function MyVideosPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = myVideosCopy[locale] ?? myVideosCopy.en;

  await cleanupExpiredSeedanceVideos({ workspaceId: workspace.id }).catch(() => null);

  const videos = (await (prisma as any).seedanceVideo.findMany({
    where: {
      workspaceId: workspace.id,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      progress: true,
      inputImageUrl: true,
      outputVideoUrl: true,
      resolution: true,
      motionInstructions: true,
      errorMessage: true,
      createdAt: true,
      expiresAt: true,
    },
  })) as SeedanceVideo[];

  const readyCount = videos.filter((video) => video.status === "COMPLETED").length;
  const renderingCount = videos.filter((video) =>
    ["PENDING", "RENDERING"].includes(video.status),
  ).length;

  return (
    <main className="library-root relative min-h-screen overflow-hidden px-4 pb-10 pt-4 text-white sm:px-6 lg:px-8 lg:py-8">
      <DashboardLibraryStyle />
      <div className="pointer-events-none absolute inset-0 z-0 library-grid-bg" />
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] z-0 h-[320px] w-[320px] rounded-full bg-[rgba(0,245,255,0.16)] blur-[90px] library-glow-a" />
      <div className="pointer-events-none absolute right-[-160px] top-[24%] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(191,95,255,0.17)] blur-[100px] library-glow-b" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[18%] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(255,45,107,0.10)] blur-[110px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1320px]">
        <section id="videos" className="library-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="library-mono text-[9px] uppercase tracking-[0.24em] text-[rgba(0,245,255,0.52)]">
                {copy.libraryTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                {copy.libraryDescription}
              </p>
            </div>

            {videos.length > 0 ? (
              <Link
                href="/dashboard/flyer-animado"
                className="library-btn min-h-[44px] gap-2 px-4 text-[9px]"
              >
                <Plus className="h-3.5 w-3.5" />
                {copy.newVideo}
              </Link>
            ) : null}
          </div>

          {videos.length === 0 ? (
            <div className="mt-5 border border-dashed border-[rgba(0,245,255,0.18)] bg-[rgba(0,245,255,0.035)] p-6 text-center sm:p-10">
              <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center border border-[rgba(0,245,255,0.20)] bg-[rgba(0,245,255,0.07)] text-[var(--cx)] shadow-[inset_0_0_22px_rgba(0,245,255,0.06)]">
                <Film className="h-7 w-7" />
              </div>
              <p className="library-orb text-lg font-bold uppercase text-white sm:text-2xl">
                {copy.emptyTitle}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/58">
                {copy.emptyDescription}
              </p>

              <Link
                href="/dashboard/flyer-animado"
                className="library-btn-solid mt-6 inline-flex min-h-[48px] px-5 text-[10px]"
              >
                {copy.firstVideo}
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => (
                <SeedanceVideoCard
                  key={video.id}
                  locale={locale}
                  video={{
                    ...video,
                    createdAt: video.createdAt.toISOString(),
                    expiresAt: video.expiresAt.toISOString(),
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="library-panel library-hero relative overflow-hidden p-5 sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent opacity-70" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[rgba(0,245,255,0.12)] blur-3xl" />

            <div className="relative z-10">
              <div className="library-section-label">
                <span className="library-chip-v">● {copy.eyebrow}</span>
              </div>

              <h1 className="library-orb mt-5 max-w-4xl text-[30px] font-black uppercase leading-[0.96] tracking-[-0.05em] text-white sm:text-5xl lg:text-[62px]">
                {copy.title}
              </h1>

              <p className="mt-4 max-w-2xl text-[14px] leading-7 text-white/58 sm:text-[15px]">
                {copy.description}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard/flyer-animado"
                  className="library-btn-solid min-h-[50px] gap-2 px-5 text-[10px]"
                >
                  <Plus className="h-4 w-4" />
                  {copy.newVideo}
                </Link>
              </div>
            </div>
          </div>

          <aside className="library-panel relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[rgba(191,95,255,0.14)] blur-3xl" />
            <div className="relative z-10 grid gap-3">
              <VideoMetric label={copy.totalLabel} value={String(videos.length)} tone="cyan" />
              <VideoMetric label={copy.readyLabel} value={String(readyCount)} tone="green" />
              <VideoMetric label={copy.renderingLabel} value={String(renderingCount)} tone="violet" />

              <div className="library-soft-panel p-4">
                <p className="library-mono text-[9px] uppercase tracking-[0.2em] text-[rgba(255,210,138,0.9)]">
                  {copy.retentionTitle}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/56 sm:text-sm sm:leading-6">
                  {copy.retentionDescription}
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function VideoMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "violet" | "green";
}) {
  const toneClass =
    tone === "cyan"
      ? "text-[var(--cx)]"
      : tone === "violet"
        ? "text-[var(--cv)]"
        : "text-[var(--cg)]";

  return (
    <div className="library-soft-panel p-4">
      <p className={`library-mono text-[9px] uppercase tracking-[0.2em] ${toneClass}`}>
        {label}
      </p>
      <p className="library-orb mt-2 text-3xl font-black text-white sm:text-4xl">
        {value}
      </p>
    </div>
  );
}
