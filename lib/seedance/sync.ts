import { prisma } from "@/lib/prisma";
import {
  downloadSeedanceOutput,
  estimateSeedanceProgress,
  getSeedanceOutputUrl,
  getSeedancePrediction,
  mapReplicateStatusToMotionStatus,
} from "@/lib/seedance";
import { uploadBufferToR2 } from "@/lib/storage";

export const MAX_SEEDANCE_RENDERING_MINUTES = 20;

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
    .delete({
      where: { id: video.usageEventId },
      select: { id: true },
    })
    .catch(() => null);

  return Boolean(deleted);
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
  const createdAt = new Date(video.createdAt).getTime();
  const elapsedMinutes = (Date.now() - createdAt) / 1000 / 60;

  return elapsedMinutes > MAX_SEEDANCE_RENDERING_MINUTES;
}

export async function syncSeedanceVideoStatus(video: SeedanceVideoRecord) {
  if (!video.providerJobId) {
    return markSeedanceVideoAsFailed(
      video,
      "A geração não possui ID do job no provedor. Inicie uma nova tentativa.",
    );
  }

  if (video.status === "COMPLETED" || video.status === "FAILED") {
    return video;
  }

  if (hasExceededSeedanceRenderTimeout(video)) {
    return markSeedanceVideoAsFailed(
      video,
      `A geração ficou em processamento por mais de ${MAX_SEEDANCE_RENDERING_MINUTES} minutos e foi encerrada automaticamente. Tente novamente.`,
    );
  }

  const prediction = await getSeedancePrediction(video.providerJobId, {
    providerName: video.providerName,
    model: video.providerModel,
  });

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
      return markSeedanceVideoAsFailed(
        video,
        "O provedor terminou a geração, mas não retornou uma URL de vídeo válida.",
      );
    }

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
  }

  if (mappedStatus === "FAILED") {
    return markSeedanceVideoAsFailed(
      video,
      normalizeError(prediction.error || prediction.logs),
    );
  }

  return (await (prisma as any).seedanceVideo.update({
    where: { id: video.id },
    data: {
      status: mappedStatus,
      progress: estimateSeedanceProgress({
        status: prediction.status,
        createdAt: video.createdAt,
        currentProgress: video.progress,
      }),
      errorMessage: null,
    },
    select: seedanceVideoSelect,
  })) as SeedanceVideoRecord;
}
