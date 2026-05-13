import { NextResponse } from "next/server";

import { cleanupExpiredSeedanceVideos } from "@/lib/seedance/cleanup";
import { prisma } from "@/lib/prisma";
import {
  seedanceVideoSelect,
  syncSeedanceVideoStatus,
  type SeedanceVideoRecord,
} from "@/lib/seedance/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 30;

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  return scheme?.toLowerCase() === "bearer" ? token : null;
}

export async function GET(request: Request) {
  const syncSecret =
    process.env.SEEDANCE_SYNC_SECRET ||
    process.env.SEEDANCE_CLEANUP_SECRET ||
    process.env.MOTION_CLEANUP_SECRET ||
    process.env.CRON_SECRET;

  if (!syncSecret) {
    return NextResponse.json(
      {
        error:
          "Configure SEEDANCE_SYNC_SECRET ou CRON_SECRET para liberar a sincronização automática.",
      },
      { status: 503 },
    );
  }

  const token =
    getBearerToken(request) || new URL(request.url).searchParams.get("secret");

  if (token !== syncSecret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") || DEFAULT_LIMIT);
  const limit = Math.max(1, Math.min(MAX_LIMIT, requestedLimit));

  await cleanupExpiredSeedanceVideos({ limit: 20 }).catch(() => null);

  const videos = (await (prisma as any).seedanceVideo.findMany({
    where: {
      status: { in: ["PENDING", "RENDERING"] },
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: seedanceVideoSelect,
  })) as SeedanceVideoRecord[];

  const result = {
    checked: videos.length,
    completed: 0,
    failed: 0,
    stillPending: 0,
    errors: 0,
    videoIds: [] as string[],
  };

  for (const video of videos) {
    try {
      const synced = await syncSeedanceVideoStatus(video);
      result.videoIds.push(synced.id);

      if (synced.status === "COMPLETED") {
        result.completed += 1;
      } else if (synced.status === "FAILED") {
        result.failed += 1;
      } else {
        result.stillPending += 1;
      }
    } catch (error) {
      result.errors += 1;
      console.error("[Seedance sync-pending] failed", {
        videoId: video.id,
        error,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
