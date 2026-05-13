import { NextResponse } from "next/server";

import { cleanupExpiredSeedanceVideos } from "@/lib/seedance/cleanup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  return scheme?.toLowerCase() === "bearer" ? token : null;
}

export async function GET(request: Request) {
  const cleanupSecret =
    process.env.SEEDANCE_CLEANUP_SECRET ||
    process.env.MOTION_CLEANUP_SECRET ||
    process.env.CRON_SECRET;

  if (!cleanupSecret) {
    return NextResponse.json(
      {
        error:
          "Configure SEEDANCE_CLEANUP_SECRET, MOTION_CLEANUP_SECRET ou CRON_SECRET para liberar a limpeza automática.",
      },
      { status: 503 },
    );
  }

  const token = getBearerToken(request) || new URL(request.url).searchParams.get("secret");

  if (token !== cleanupSecret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const result = await cleanupExpiredSeedanceVideos();

  return NextResponse.json({
    ok: true,
    message: "Vídeos Seedance expirados e arquivos relacionados removidos do R2.",
    ...result,
  });
}
