import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

function estimateProgress(job: {
  status: string;
  progress?: number | null;
  createdAt: Date;
}) {
  if (job.status === "COMPLETED") return 100;
  if (job.status === "FAILED") return 100;

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(job.createdAt).getTime()) / 1000),
  );

  const simulated = Math.min(92, 12 + Math.floor(elapsedSeconds * 0.75));
  return Math.max(job.progress || 0, simulated);
}

export async function GET() {
  try {
    const workspace = await requireCurrentWorkspace();
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const professionalImageJob = (prisma as typeof prisma & {
      professionalImageJob: {
        findFirst: (args: unknown) => Promise<any>;
      };
    }).professionalImageJob;

    const job = await professionalImageJob.findFirst({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: sixHoursAgo },
        status: { in: ["PENDING", "PROCESSING", "COMPLETED"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        progress: true,
        outputImageUrl: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!job) {
      return NextResponse.json({ success: true, job: null });
    }

    return NextResponse.json({
      success: true,
      job: {
        jobId: job.id,
        status: job.status,
        progress: estimateProgress(job),
        imageUrl: job.outputImageUrl,
        error: job.errorMessage,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar job atual de imagem profissional:", error);

    return NextResponse.json(
      { error: "Could not read current professional image job." },
      { status: 500 },
    );
  }
}
