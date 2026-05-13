import { NextResponse } from "next/server";
import sharp from "sharp";
import {
  BannerFormat,
  BannerStatus,
  BannerStylePreset,
} from "@/generated/prisma/enums";

import { prisma } from "@/lib/prisma";
import { validateMutationOrigin } from "@/lib/request-security";
import { cleanupExpiredRemotionAssets } from "@/lib/remotion/cleanup";
import { uploadBufferToR2 } from "@/lib/storage";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_IMAGE_BYTES = 18 * 1024 * 1024;

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function sanitizeFileName(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 80) || "uploaded-image"
  );
}

function inferBannerFormat(width?: number | null, height?: number | null): BannerFormat {
  if (!width || !height) return BannerFormat.FLYER;

  const ratio = width / height;

  if (ratio > 1.15) return BannerFormat.POST_FEED;
  if (ratio < 0.72) return BannerFormat.STORY;
  if (Math.abs(ratio - 1) < 0.08) return BannerFormat.SQUARE;

  return BannerFormat.FLYER;
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await cleanupExpiredRemotionAssets({ workspaceId: workspace.id, limit: 20 }).catch(() => null);

  const formData = await request.formData();
  const image = formData.get("image");
  const titleValue = formData.get("title");

  if (!(image instanceof File)) {
    return NextResponse.json(
      { error: "Envie uma imagem PNG, JPG ou WEBP." },
      { status: 400 },
    );
  }

  if (image.size <= 0 || image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "A imagem precisa ter até 18 MB." },
      { status: 400 },
    );
  }

  if (image.type && !allowedImageTypes.has(image.type)) {
    return NextResponse.json(
      { error: "Formato de imagem não suportado. Use PNG, JPG ou WEBP." },
      { status: 400 },
    );
  }

  try {
    const sourceBuffer = Buffer.from(await image.arrayBuffer());
    const processed = sharp(sourceBuffer, { failOn: "none" }).rotate();
    const metadata = await processed.metadata();
    const width = metadata.width || null;
    const height = metadata.height || null;
    const pngBuffer = await processed.png({ compressionLevel: 9 }).toBuffer();
    const safeName = sanitizeFileName(image.name || "uploaded-image");
    const storageKey = `workspaces/${workspace.id}/remotion-uploads/${Date.now()}-${safeName}.png`;

    const uploaded = await uploadBufferToR2({
      key: storageKey,
      body: pngBuffer,
      contentType: "image/png",
      cacheControl: "public, max-age=31536000, immutable",
    });

    const title =
      typeof titleValue === "string" && titleValue.trim()
        ? titleValue.trim().slice(0, 120)
        : `Remotion upload · ${safeName.replace(/-/g, " ")}`;

    const banner = await prisma.banner.create({
      data: {
        workspaceId: workspace.id,
        title,
        djName: null,
        eventName: null,
        eventDate: null,
        eventLocation: null,
        city: null,
        stylePreset: BannerStylePreset.NEON_CLUB,
        format: inferBannerFormat(width, height),
        prompt: "User uploaded this image directly for Remotion Studio.",
        revisedPrompt: null,
        modelName: "user-upload-remotion",
        status: BannerStatus.COMPLETED,
        referenceImageUrl: uploaded.url,
        outputImageUrl: uploaded.url,
        width,
        height,
        generationSeconds: 0,
      },
      select: {
        id: true,
        title: true,
        outputImageUrl: true,
        format: true,
      },
    });

    await prisma.asset
      .create({
        data: {
          workspaceId: workspace.id,
          url: uploaded.url,
          originalName: image.name || `${safeName}.png`,
          storageProvider: "r2",
          storageKey: uploaded.key,
          mimeType: "image/png",
          sizeBytes: pngBuffer.length,
          width,
          height,
        },
      })
      .catch(() => null);

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível enviar a imagem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
