import { NextResponse } from "next/server";

import { cleanupExpiredRemotionAssets } from "@/lib/remotion/cleanup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  return scheme?.toLowerCase() === "bearer" ? token : null;
}

export async function GET(request: Request) {
  const cleanupSecret =
    process.env.REMOTION_CLEANUP_SECRET ||
    process.env.MOTION_CLEANUP_SECRET ||
    process.env.CRON_SECRET;

  if (!cleanupSecret) {
    return NextResponse.json(
      {
        error:
          "Configure REMOTION_CLEANUP_SECRET, MOTION_CLEANUP_SECRET ou CRON_SECRET para liberar a limpeza automática.",
      },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const token = getBearerToken(request) || url.searchParams.get("secret");

  if (token !== cleanupSecret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const retentionHoursValue = Number(url.searchParams.get("retentionHours") || "24");
  const retentionHours = Number.isFinite(retentionHoursValue)
    ? Math.max(1, Math.min(168, retentionHoursValue))
    : 24;

  const result = await cleanupExpiredRemotionAssets({ retentionHours });

  return NextResponse.json({
    ok: true,
    message:
      "Vídeos, músicas e uploads manuais expirados do Remotion foram removidos do R2 e do banco.",
    ...result,
  });
}
