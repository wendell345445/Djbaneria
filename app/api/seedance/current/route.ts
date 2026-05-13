import { NextResponse } from "next/server";

import { cleanupExpiredSeedanceVideos } from "@/lib/seedance/cleanup";
import { prisma } from "@/lib/prisma";
import {
  markSeedanceVideoAsFailed,
  seedanceVideoSelect,
  serializeSeedanceVideo,
  syncSeedanceVideoStatus,
  type SeedanceVideoRecord,
} from "@/lib/seedance/sync";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await cleanupExpiredSeedanceVideos({ workspaceId: workspace.id }).catch(
    () => null,
  );

  const video = (await (prisma as any).seedanceVideo.findFirst({
    where: {
      workspaceId: workspace.id,
      status: { in: ["PENDING", "RENDERING"] },
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: seedanceVideoSelect,
  })) as SeedanceVideoRecord | null;

  if (!video) {
    return NextResponse.json({ video: null });
  }

  try {
    const syncedVideo = await syncSeedanceVideoStatus(video);

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

    return NextResponse.json({
      video: failedVideo ? serializeSeedanceVideo(failedVideo) : null,
    });
  }
}
