import { NextResponse } from "next/server";

import { cleanupExpiredSeedanceVideos } from "@/lib/seedance/cleanup";
import { prisma } from "@/lib/prisma";
import {
  downloadSeedanceOutput,
  estimateSeedanceProgress,
  getSeedanceOutputUrl,
  getSeedancePrediction,
  mapReplicateStatusToMotionStatus,
} from "@/lib/seedance";
import { uploadBufferToR2 } from "@/lib/storage";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_RENDERING_MINUTES = 20;

type SeedanceVideoRecord = {
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
  motionInstructions: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeError(error: unknown) {
  if (!error) return "O Seedance não conseguiu gerar este vídeo.";
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "O Seedance não conseguiu gerar este vídeo.";
  }
}

function serializeSeedanceVideo(video: SeedanceVideoRecord) {
  return {
    id: video.id,
    status: video.status,
    progress: video.progress,
    inputImageUrl: video.inputImageUrl,
    outputVideoUrl: video.outputVideoUrl,
    errorMessage: video.errorMessage,
    durationSeconds: video.durationSeconds,
    resolution: video.resolution,
    motionInstructions: video.motionInstructions,
    expiresAt: video.expiresAt,
    queuePosition: null,
  };
}

async function refundUsageEventOnce(video: SeedanceVideoRecord) {
  if (!video.usageEventId) return;

  await prisma.usageEvent
    .delete({
      where: { id: video.usageEventId },
    })
    .catch(() => null);
}

async function markSeedanceVideoAsFailed(video: SeedanceVideoRecord, message: string) {
  const updated = (await (prisma as any).seedanceVideo.update({
    where: { id: video.id },
    data: {
      status: "FAILED",
      progress: 100,
      errorMessage: message,
    },
  })) as SeedanceVideoRecord;

  await refundUsageEventOnce(video);
  return updated;
}

function hasExceededRenderTimeout(video: SeedanceVideoRecord) {
  const createdAt = new Date(video.createdAt).getTime();
  const elapsedMinutes = (Date.now() - createdAt) / 1000 / 60;

  return elapsedMinutes > MAX_RENDERING_MINUTES;
}

async function syncSeedanceStatus(video: SeedanceVideoRecord) {
  if (!video.providerJobId) {
    return markSeedanceVideoAsFailed(
      video,
      "A geração não possui ID do job no provedor. Inicie uma nova tentativa.",
    );
  }

  if (video.status === "COMPLETED" || video.status === "FAILED") {
    return video;
  }

  if (hasExceededRenderTimeout(video)) {
    return markSeedanceVideoAsFailed(
      video,
      `A geração ficou em processamento por mais de ${MAX_RENDERING_MINUTES} minutos e foi encerrada automaticamente. Tente novamente.`,
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
  })) as SeedanceVideoRecord;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { videoId } = await params;

  await cleanupExpiredSeedanceVideos({ workspaceId: workspace.id, videoId }).catch(() => null);

  const video = (await (prisma as any).seedanceVideo.findFirst({
    where: {
      id: videoId,
      workspaceId: workspace.id,
      expiresAt: { gt: new Date() },
    },
    select: {
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
      motionInstructions: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })) as SeedanceVideoRecord | null;

  if (!video) {
    return NextResponse.json(
      { error: "Vídeo não encontrado ou já expirado." },
      { status: 404 },
    );
  }

  try {
    const syncedVideo = await syncSeedanceStatus(video);

    return NextResponse.json({
      video: serializeSeedanceVideo(syncedVideo),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível consultar o status do vídeo no provedor.";

    const failedVideo = await markSeedanceVideoAsFailed(
      video,
      message || "A geração falhou ao consultar o provedor.",
    ).catch(() => null);

    if (failedVideo) {
      return NextResponse.json({
        video: serializeSeedanceVideo(failedVideo),
      });
    }

    return NextResponse.json(
      {
        video: {
          ...serializeSeedanceVideo(video),
          status: "FAILED",
          progress: 100,
          errorMessage: message,
        },
      },
      { status: 200 },
    );
  }
}
