import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bannerId: string }> },
) {
  const { bannerId } = await params;

  const banner = await prisma.banner.findUnique({
    where: { id: bannerId },
    select: {
      id: true,
      title: true,
      outputImageUrl: true,
    },
  });

  if (!banner?.outputImageUrl) {
    return NextResponse.json({ error: "Banner não encontrado." }, { status: 404 });
  }

  const response = await fetch(banner.outputImageUrl);
  if (!response.ok) {
    return NextResponse.json({ error: "Não foi possível baixar a imagem." }, { status: 502 });
  }

  const arrayBuffer = await response.arrayBuffer();
  const filenameBase = (banner.title || `banner-${banner.id}`).replace(/[^a-zA-Z0-9-_]+/g, "-");

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": response.headers.get("content-type") || "image/png",
      "Content-Disposition": `attachment; filename="${filenameBase}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
