import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  { params }: { params: Promise<{ videoId: string }> },
) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { videoId } = await params;

  const video = (await (prisma as any).seedanceVideo.findFirst({
    where: {
      id: videoId,
      workspaceId: workspace.id,
      status: "COMPLETED",
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      outputVideoUrl: true,
      resolution: true,
      createdAt: true,
    },
  })) as {
    id: string;
    outputVideoUrl: string | null;
    resolution: string | null;
    createdAt: Date;
  } | null;

  if (!video?.outputVideoUrl) {
    return NextResponse.json(
      { error: "Vídeo não encontrado, ainda não finalizado ou já expirado." },
      { status: 404 },
    );
  }

  const response = await fetch(video.outputVideoUrl, { cache: "no-store" });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Não foi possível baixar o vídeo." },
      { status: 502 },
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const createdAt = new Date(video.createdAt).toISOString().slice(0, 10);
  const resolution = video.resolution ? `${video.resolution}p` : "video";
  const filename = `${safeFilename(`flyer-animado-${resolution}-${createdAt}-${video.id}`)}.mp4`;

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": response.headers.get("content-type") || "video/mp4",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
