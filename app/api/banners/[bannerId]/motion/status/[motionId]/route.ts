import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bannerId: string; motionId: string }> },
) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { bannerId, motionId } = await params;

  const motion = await (prisma as any).bannerMotion.findFirst({
    where: {
      id: motionId,
      bannerId,
      workspaceId: workspace.id,
    },
    select: {
      id: true,
      preset: true,
      transitionVariant: true,
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
    return NextResponse.json({ error: "Vídeo não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ motion });
}
