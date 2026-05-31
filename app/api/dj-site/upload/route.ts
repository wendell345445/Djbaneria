import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";
import { uploadBufferToR2 } from "@/lib/storage";
import { getCurrentWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_PURPOSES = new Set(["profile", "cover"]);

const MIME_TO_EXTENSION = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function sanitizeFileName(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "dj-site-image"
  );
}

function isAllowedImageSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit(
    `dj-site:image-upload:${workspace.id}:${getClientIp(request)}`,
    { limit: 15, windowMs: 60_000 },
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please try again shortly." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = formData.get("file");
  const purposeValue = String(formData.get("purpose") || "");

  if (!ALLOWED_PURPOSES.has(purposeValue)) {
    return NextResponse.json({ error: "Invalid upload purpose." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  if (!MIME_TO_EXTENSION.has(file.type)) {
    return NextResponse.json(
      { error: "Invalid image type. Use JPG, PNG, or WebP." },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Upload a JPG, PNG, or WebP file up to 5 MB." },
      { status: 413 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!isAllowedImageSignature(buffer, file.type)) {
    return NextResponse.json(
      { error: "Invalid image content. Upload a real JPG, PNG, or WebP image." },
      { status: 400 },
    );
  }

  const extension = MIME_TO_EXTENSION.get(file.type)!;
  const safeName = sanitizeFileName(file.name || "dj-site-image");
  const storageKey = [
    "workspaces",
    workspace.id,
    "dj-sites",
    purposeValue,
    `${Date.now()}-${randomUUID()}-${safeName}.${extension}`,
  ].join("/");

  const uploaded = await uploadBufferToR2({
    key: storageKey,
    body: buffer,
    contentType: file.type,
    cacheControl: "public, max-age=31536000, immutable",
  });

  await (prisma as any).asset
    .create({
      data: {
        workspaceId: workspace.id,
        url: uploaded.url,
        originalName: file.name || `${purposeValue}.${extension}`,
        storageProvider: "r2",
        storageKey: uploaded.key,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    })
    .catch((error: unknown) => {
      console.error("[dj-site-upload] failed to register uploaded asset", error);
    });

  return NextResponse.json({
    ok: true,
    url: uploaded.url,
    publicUrl: uploaded.url,
    storageKey: uploaded.key,
    purpose: purposeValue,
  });
}
