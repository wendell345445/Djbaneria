import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { cleanupExpiredRemotionAssets } from "@/lib/remotion/cleanup";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETENTION_HOURS = 24;

function getCutoffDate() {
  return new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ motionId: string }> },
) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { motionId } = await params;

  await cleanupExpiredRemotionAssets({
    workspaceId: workspace.id,
    motionId,
  }).catch(() => null);

  const motion = await (prisma as any).bannerMotion.findFirst({
    where: {
      id: motionId,
      workspaceId: workspace.id,
      createdAt: { gt: getCutoffDate() },
    },
    select: {
      id: true,
      status: true,
      renderProgress: true,
      outputVideoUrl: true,
      errorMessage: true,
      durationSeconds: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!motion) {
    return NextResponse.json(
      { error: "Vídeo não encontrado ou já expirado." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    video: {
      id: motion.id,
      status: motion.status,
      progress: Number(motion.renderProgress || 0),
      renderProgress: Number(motion.renderProgress || 0),
      outputVideoUrl: motion.outputVideoUrl,
      errorMessage: motion.errorMessage,
      durationSeconds: motion.durationSeconds,
      createdAt: motion.createdAt,
      updatedAt: motion.updatedAt,
    },
  });
}
