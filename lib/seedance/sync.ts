import { prisma } from "@/lib/prisma";
import {
  buildSeedancePrompt,
  createKlingFallbackPrediction,
  downloadSeedanceOutput,
  estimateSeedanceProgress,
  getSeedanceDurationSeconds,
  getSeedanceModel,
  getSeedanceOutputUrl,
  getSeedancePrediction,
  isAtlasKlingFallbackConfigured,
  mapReplicateStatusToMotionStatus,
  type SeedanceResolution,
} from "@/lib/seedance";
import { uploadBufferToR2 } from "@/lib/storage";

export const MAX_SEEDANCE_RENDERING_MINUTES = 20;
const MAX_PROVIDER_STARTING_SECONDS = 120;

export type SeedanceVideoRecord = {
  id: string;
  workspaceId: string;
  usageEventId: string | null;
  status: string;
  progress: number;
  inputImageUrl: string;
  outputVideoUrl: string | null;
  outputVideoStorageKey: string | null;
  providerName: string | null;
  providerModel: string | null;
  providerJobId: string | null;
  providerOutputUrl: string | null;
  errorMessage: string | null;
  durationSeconds: number;
  resolution: string;
  width: number | null;
  height: number | null;
  motionInstructions: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export const seedanceVideoSelect = {
  id: true,
  workspaceId: true,
  usageEventId: true,
  status: true,
  progress: true,
  inputImageUrl: true,
  outputVideoUrl: true,
  outputVideoStorageKey: true,
  providerName: true,
  providerModel: true,
  providerJobId: true,
  providerOutputUrl: true,
  errorMessage: true,
  durationSeconds: true,
  resolution: true,
  width: true,
  height: true,
  motionInstructions: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

function normalizeError(error: unknown) {
  if (!error) return "O Seedance não conseguiu gerar este vídeo.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return "O Seedance não conseguiu gerar este vídeo.";
  }
}

export function serializeSeedanceVideo(video: SeedanceVideoRecord) {
  return {
    id: video.id,
    videoId: video.id,
    status: video.status,
    progress: video.progress,
    renderProgress: video.progress,
    inputImageUrl: video.inputImageUrl,
    outputVideoUrl: video.outputVideoUrl,
    errorMessage: video.errorMessage,
    durationSeconds: video.durationSeconds,
    resolution: video.resolution,
    width: video.width,
    height: video.height,
    motionInstructions: video.motionInstructions,
    expiresAt: video.expiresAt,
    queuePosition: null,
  };
}

export async function refundSeedanceUsageEventOnce(video: SeedanceVideoRecord) {
  if (!video.usageEventId) return false;

  const deleted = await prisma.usageEvent
    .deleteMany({
      where: {
        id: video.usageEventId,
        workspaceId: video.workspaceId,
      },
    })
    .catch(() => null);

  return Boolean(deleted?.count);
}

export async function markSeedanceVideoAsFailed(
  video: SeedanceVideoRecord,
  message: string,
) {
  const updated = (await (prisma as any).seedanceVideo.update({
    where: { id: video.id },
    data: {
      status: "FAILED",
      progress: 100,
      errorMessage: message,
    },
    select: seedanceVideoSelect,
  })) as SeedanceVideoRecord;

  await refundSeedanceUsageEventOnce(video);
  return updated;
}

export function hasExceededSeedanceRenderTimeout(video: SeedanceVideoRecord) {
  const timeoutAnchor =
    video.providerName === "atlascloud-kling"
      ? video.updatedAt
      : video.createdAt;
  const startedAt = new Date(timeoutAnchor).getTime();
  const elapsedMinutes = (Date.now() - startedAt) / 1000 / 60;

  return elapsedMinutes > MAX_SEEDANCE_RENDERING_MINUTES;
}

function isAtlasKlingVideo(video: SeedanceVideoRecord) {
  return video.providerName === "atlascloud-kling";
}

function canFallbackToAtlasKling(video: SeedanceVideoRecord) {
  return !isAtlasKlingVideo(video) && isAtlasKlingFallbackConfigured();
}

async function hasActiveSeedanceUsageReservation(video: SeedanceVideoRecord) {
  // Admin/unlimited workspaces do not create a UsageEvent reservation.
  if (!video.usageEventId) return true;

  const usageEvent = await prisma.usageEvent.findFirst({
    where: {
      id: video.usageEventId,
      workspaceId: video.workspaceId,
    },
    select: { id: true },
  });

  return Boolean(usageEvent);
}

async function startAtlasKlingFallbackForVideo(
  video: SeedanceVideoRecord,
  reason: string,
) {
  if (!canFallbackToAtlasKling(video)) {
    return null;
  }

  const hasReservation = await hasActiveSeedanceUsageReservation(video);
  if (!hasReservation) {
    if (process.env.SEEDANCE_DEBUG === "true") {
      console.warn("[Seedance fallback] Skipping Kling fallback because the credit reservation was already refunded", {
        videoId: video.id,
        usageEventId: video.usageEventId,
        reason,
      });
    }

    return null;
  }

  const prediction = await createKlingFallbackPrediction({
    imageUrl: video.inputImageUrl,
    prompt: buildSeedancePrompt({
      motionInstructions: video.motionInstructions,
    }),
    resolution: (video.resolution === "720"
      ? "720"
      : "480") as SeedanceResolution,
    durationSeconds: video.durationSeconds || getSeedanceDurationSeconds(),
    fallbackFrom: video.providerName === "fal" ? "fal" : "atlascloud",
  });

  const mappedStatus = mapReplicateStatusToMotionStatus(prediction.status);

  if (mappedStatus === "FAILED") {
    return null;
  }

  const nextStatus = mappedStatus === "PENDING" ? "PENDING" : "RENDERING";

  return (await (prisma as any).seedanceVideo.update({
    where: { id: video.id },
    data: {
      status: nextStatus,
      progress: Math.max(
        video.progress || 0,
        nextStatus === "RENDERING" ? 22 : 12,
      ),
      providerName: prediction.provider || "atlascloud-kling",
      providerModel: prediction.model || getSeedanceModel("atlascloud-kling"),
      providerJobId: prediction.id,
      providerOutputUrl: null,
      errorMessage: reason
        ? `Seedance falhou; fallback Kling iniciado. Motivo original: ${reason}`.slice(0, 1800)
        : null,
      prompt: buildSeedancePrompt({
        motionInstructions: video.motionInstructions,
      }),
    },
    select: seedanceVideoSelect,
  })) as SeedanceVideoRecord;
}

export async function syncSeedanceVideoStatus(video: SeedanceVideoRecord) {
  if (!video.providerJobId) {
    const startingForSeconds =
      (Date.now() - new Date(video.createdAt).getTime()) / 1000;

    if (
      ["PENDING", "RENDERING"].includes(video.status) &&
      startingForSeconds <= MAX_PROVIDER_STARTING_SECONDS
    ) {
      return video;
    }

    return markSeedanceVideoAsFailed(
      video,
      "A geração não recebeu ID do job no provedor dentro do tempo esperado. O crédito foi reembolsado automaticamente.",
    );
  }

  if (video.status === "COMPLETED") {
    return video;
  }

  if (video.status === "FAILED") {
    // Do not start provider work from a persisted FAILED row. A FAILED row may
    // already have had its UsageEvent refunded by a previous request or cleanup.
    // Fallback must happen while the original Seedance job is still active.
    return video;
  }

  if (hasExceededSeedanceRenderTimeout(video)) {
    const fallbackVideo = await startAtlasKlingFallbackForVideo(
      video,
      `Seedance ficou em processamento por mais de ${MAX_SEEDANCE_RENDERING_MINUTES} minutos.`,
    ).catch(() => null);

    if (fallbackVideo) return fallbackVideo;

    return markSeedanceVideoAsFailed(
      video,
      `A geração ficou em processamento por mais de ${MAX_SEEDANCE_RENDERING_MINUTES} minutos e foi encerrada automaticamente. Tente novamente.`,
    );
  }

  let prediction: Awaited<ReturnType<typeof getSeedancePrediction>>;

  try {
    prediction = await getSeedancePrediction(video.providerJobId, {
      providerName: video.providerName,
      model: video.providerModel,
    });
  } catch (error) {
    const errorMessage = normalizeError(error);

    const fallbackVideo = await startAtlasKlingFallbackForVideo(
      video,
      errorMessage,
    ).catch((fallbackError) => {
      if (process.env.SEEDANCE_DEBUG === "true") {
        console.error("[Seedance fallback] Failed to start AtlasCloud Kling after prediction error", {
          videoId: video.id,
          providerName: video.providerName,
          providerJobId: video.providerJobId,
          seedanceError: errorMessage,
          fallbackError: normalizeError(fallbackError),
        });
      }

      return null;
    });

    if (fallbackVideo) return fallbackVideo;

    return markSeedanceVideoAsFailed(video, errorMessage);
  }

  const mappedStatus = mapReplicateStatusToMotionStatus(prediction.status);

  if (process.env.SEEDANCE_DEBUG === "true") {
    console.log("[Seedance status]", {
      videoId: video.id,
      providerName: video.providerName,
      providerModel: video.providerModel,
      providerJobId: video.providerJobId,
      providerStatus: prediction.status,
      mappedStatus,
      hasOutput: Boolean(prediction.output),
      outputUrl: getSeedanceOutputUrl(prediction.output),
      error: prediction.error || null,
      logs: prediction.logs || null,
    });
  }

  if (mappedStatus === "COMPLETED") {
    const outputUrl = getSeedanceOutputUrl(prediction.output);

    if (!outputUrl) {
      const fallbackVideo = await startAtlasKlingFallbackForVideo(
        video,
        "O provedor terminou a geração, mas não retornou uma URL de vídeo válida.",
      ).catch(() => null);

      if (fallbackVideo) return fallbackVideo;

      return markSeedanceVideoAsFailed(
        video,
        "O provedor terminou a geração, mas não retornou uma URL de vídeo válida.",
      );
    }

    try {
      const downloaded = await downloadSeedanceOutput(outputUrl);
      const storageKey = `workspaces/${video.workspaceId}/seedance-videos/${video.id}-${Date.now()}.mp4`;
      const uploadedVideo = await uploadBufferToR2({
        key: storageKey,
        body: downloaded.buffer,
        contentType: downloaded.contentType || "video/mp4",
        cacheControl: "public, max-age=86400",
      });

      return (await (prisma as any).seedanceVideo.update({
        where: { id: video.id },
        data: {
          status: "COMPLETED",
          progress: 100,
          outputVideoUrl: uploadedVideo.url,
          outputVideoStorageKey: uploadedVideo.key,
          providerOutputUrl: outputUrl,
          errorMessage: null,
        },
        select: seedanceVideoSelect,
      })) as SeedanceVideoRecord;
    } catch (error) {
      const errorMessage = normalizeError(error);
      const fallbackVideo = await startAtlasKlingFallbackForVideo(
        video,
        errorMessage,
      ).catch(() => null);

      if (fallbackVideo) return fallbackVideo;

      return markSeedanceVideoAsFailed(video, errorMessage);
    }
  }

  if (mappedStatus === "FAILED") {
    const errorMessage = normalizeError(prediction.error || prediction.logs);
    const fallbackVideo = await startAtlasKlingFallbackForVideo(
      video,
      errorMessage,
    ).catch(() => null);

    if (fallbackVideo) return fallbackVideo;

    return markSeedanceVideoAsFailed(video, errorMessage);
  }

  return (await (prisma as any).seedanceVideo.update({
    where: { id: video.id },
    data: {
      status: mappedStatus,
      progress: estimateSeedanceProgress({
        status: prediction.status,
        createdAt: isAtlasKlingVideo(video) ? video.updatedAt : video.createdAt,
        currentProgress: video.progress,
      }),
      errorMessage: null,
    },
    select: seedanceVideoSelect,
  })) as SeedanceVideoRecord;
}
