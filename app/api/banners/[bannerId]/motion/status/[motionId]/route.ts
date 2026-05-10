import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

function getEstimatedPendingProgress(createdAt: Date) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / 1000),
  );

  return Math.min(94, 12 + Math.floor(elapsedSeconds * 2));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bannerId: string; motionId: string }> },
) {
  const { bannerId, motionId } = await params;
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
  }

  const motion = await prisma.bannerMotion.findFirst({
    where: {
      id: motionId,
      bannerId,
      workspaceId: workspace.id,
    },
    select: {
      id: true,
      bannerId: true,
      status: true,
      preset: true,
      inputImageUrl: true,
      inputAudioUrl: true,
      outputVideoUrl: true,
      format: true,
      width: true,
      height: true,
      durationSeconds: true,
      renderProgress: true,
      errorMessage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!motion) {
    return NextResponse.json({ error: "Motion flyer não encontrado." }, { status: 404 });
  }

  const progress =
    motion.status === "COMPLETED"
      ? 100
      : motion.status === "FAILED"
        ? 0
        : Math.max(motion.renderProgress, getEstimatedPendingProgress(motion.createdAt));

  return NextResponse.json({
    success: true,
    motionId: motion.id,
    bannerId: motion.bannerId,
    status: motion.status,
    preset: motion.preset,
    imageUrl: motion.inputImageUrl,
    audioUrl: motion.inputAudioUrl,
    videoUrl: motion.outputVideoUrl,
    format: motion.format,
    width: motion.width,
    height: motion.height,
    durationSeconds: motion.durationSeconds,
    progress,
    errorMessage: motion.errorMessage,
    updatedAt: motion.updatedAt,
  });
}
