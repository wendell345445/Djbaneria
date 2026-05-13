import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { cleanupExpiredRemotionAssets } from "@/lib/remotion/cleanup";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RETENTION_HOURS = 24;

function getCutoffDate() {
  return new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);
}

function safeFilename(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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

  const motion = (await (prisma as any).bannerMotion.findFirst({
    where: {
      id: motionId,
      workspaceId: workspace.id,
      status: "COMPLETED",
      createdAt: { gt: getCutoffDate() },
    },
    select: {
      id: true,
      outputVideoUrl: true,
      durationSeconds: true,
      createdAt: true,
    },
  })) as {
    id: string;
    outputVideoUrl: string | null;
    durationSeconds: number | null;
    createdAt: Date;
  } | null;

  if (!motion?.outputVideoUrl) {
    return NextResponse.json(
      { error: "Vídeo não encontrado, ainda não finalizado ou já expirado." },
      { status: 404 },
    );
  }

  const response = await fetch(motion.outputVideoUrl, { cache: "no-store" });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Não foi possível baixar o vídeo." },
      { status: 502 },
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const createdAt = new Date(motion.createdAt).toISOString().slice(0, 10);
  const duration = motion.durationSeconds ? `${motion.durationSeconds}s` : "video";
  const filename = `${safeFilename(`remotion-flyer-${duration}-${createdAt}-${motion.id}`)}.mp4`;

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": response.headers.get("content-type") || "video/mp4",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
