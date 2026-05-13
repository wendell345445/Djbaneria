"use client";

import { useEffect, useState } from "react";
import { Clock, Download, Sparkles } from "lucide-react";

import type { AppLocale } from "@/lib/i18n";

export type SeedanceVideoCardData = {
  id: string;
  status: string;
  progress: number;
  inputImageUrl: string;
  outputVideoUrl: string | null;
  resolution: string;
  motionInstructions: string | null;
  errorMessage: string | null;
  createdAt: string | Date;
  expiresAt: string | Date;
};

const videoCardCopy = {
  "pt-BR": {
    generatedVideo: "Flyer animado",
    sentFlyer: "Flyer enviado",
    createdAt: "Criado em",
    download: "Baixar vídeo",
    availableUntil: "Disponível até",
    status: {
      PENDING: "Na fila",
      RENDERING: "Renderizando",
      COMPLETED: "Pronto",
      FAILED: "Falhou",
    },
  },
  en: {
    generatedVideo: "Animated flyer",
    sentFlyer: "Uploaded flyer",
    createdAt: "Created on",
    download: "Download video",
    availableUntil: "Available until",
    status: {
      PENDING: "Queued",
      RENDERING: "Rendering",
      COMPLETED: "Ready",
      FAILED: "Failed",
    },
  },
  es: {
    generatedVideo: "Flyer animado",
    sentFlyer: "Flyer enviado",
    createdAt: "Creado el",
    download: "Descargar video",
    availableUntil: "Disponible hasta",
    status: {
      PENDING: "En cola",
      RENDERING: "Renderizando",
      COMPLETED: "Listo",
      FAILED: "Falló",
    },
  },
} as const;

function formatDate(value: string | Date, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getResolutionLabel(value: string | null) {
  if (value === "480" || value === "720") return `${value}p`;
  return value || "";
}

function getStatusLabel(status: string, locale: AppLocale) {
  const copy = videoCardCopy[locale] ?? videoCardCopy.en;
  return copy.status[status as keyof typeof copy.status] ?? status;
}

export function SeedanceVideoCard({
  video,
  locale = "pt-BR",
}: {
  video: SeedanceVideoCardData;
  locale?: AppLocale;
}) {
  const [currentVideo, setCurrentVideo] = useState(video);
  const copy = videoCardCopy[locale] ?? videoCardCopy.en;
  const isWorking = ["PENDING", "RENDERING"].includes(currentVideo.status);

  useEffect(() => {
    if (!isWorking) return;

    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(`/api/seedance/status/${currentVideo.id}`, {
          cache: "no-store",
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.video || cancelled) return;

        setCurrentVideo((previous) => ({
          ...previous,
          ...data.video,
          progress: Number(data.video.progress ?? previous.progress ?? 0),
        }));
      } catch {
        // Keep the last known state in the card.
      }
    }

    poll();
    const interval = window.setInterval(poll, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [currentVideo.id, isWorking]);

  const progress = Math.max(0, Math.min(100, currentVideo.progress || 0));
  const statusLabel = getStatusLabel(currentVideo.status, locale);
  const isComplete = currentVideo.status === "COMPLETED" && currentVideo.outputVideoUrl;

  return (
    <article className="library-card group block active:scale-[0.99]">
      <div className="library-media relative aspect-[4/5] overflow-hidden bg-black">
        {isComplete ? (
          <video
            src={currentVideo.outputVideoUrl || undefined}
            controls
            playsInline
            preload="metadata"
            className="relative z-[1] h-full w-full object-contain"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentVideo.inputImageUrl}
              alt={copy.sentFlyer}
              className="h-full w-full object-contain opacity-75 transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 z-[2] grid place-items-center bg-black/52 p-6 text-center backdrop-blur-[2px]">
              <div className="w-full max-w-[210px]">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center border border-[rgba(0,245,255,0.20)] bg-[rgba(0,245,255,0.08)] text-[var(--cx)] shadow-[inset_0_0_22px_rgba(0,245,255,0.06)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="library-orb text-sm font-bold uppercase text-white">
                  {statusLabel}
                </p>
                <div className="library-progress-track mt-4">
                  <div
                    className="library-progress-bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="library-mono mt-2 text-[9px] uppercase tracking-[0.12em] text-white/48">
                  {progress}%
                </p>
              </div>
            </div>
          </>
        )}

        <span className="library-chip-v absolute left-3 top-3 z-10 bg-black/55 backdrop-blur">
          {getResolutionLabel(currentVideo.resolution)}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">
              {copy.generatedVideo} {getResolutionLabel(currentVideo.resolution)}
            </h2>
            <p className="library-mono mt-1 text-[9px] uppercase tracking-[0.12em] text-white/36">
              {copy.createdAt} {formatDate(currentVideo.createdAt, locale)}
            </p>
          </div>
          <span className="library-status-chip shrink-0">
            {statusLabel}
          </span>
        </div>

        {currentVideo.motionInstructions ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/58">
            {currentVideo.motionInstructions}
          </p>
        ) : null}

        {currentVideo.errorMessage ? (
          <p className="mt-4 border border-red-300/20 bg-red-400/10 p-3 text-xs leading-5 text-red-100">
            {currentVideo.errorMessage}
          </p>
        ) : null}

        {isComplete ? (
          <a
            href={`/api/seedance/download/${currentVideo.id}`}
            download
            className="library-btn-solid mt-4 flex min-h-[44px] w-full gap-2 px-4 text-[10px]"
          >
            <Download className="h-4 w-4" />
            {copy.download}
          </a>
        ) : null}

        <div className="library-soft-panel mt-4 flex items-center gap-2 px-3 py-2 text-xs text-white/54">
          <Clock className="h-3.5 w-3.5 text-[var(--cx)]" />
          <span>
            {copy.availableUntil} {formatDate(currentVideo.expiresAt, locale)}
          </span>
        </div>
      </div>
    </article>
  );
}
