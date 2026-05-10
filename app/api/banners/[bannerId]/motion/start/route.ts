import { NextResponse } from "next/server";
import { z } from "zod";
import { BannerStatus } from "@/generated/prisma/enums";

import { MOTION_PRESET_IDS, getMotionSizeForFormat } from "@/lib/motion/presets";
import { prisma } from "@/lib/prisma";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";
import { uploadBufferToR2 } from "@/lib/storage";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024;

const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/aac",
  "audio/mp4",
  "audio/ogg",
]);

const schema = z.object({
  preset: z.enum(MOTION_PRESET_IDS).default("NEON_PULSE"),
  durationSeconds: z.coerce.number().int().min(6).max(15).default(10),
});

function sanitizeForFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function getAudioExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;

  switch (file.type) {
    case "audio/wav":
    case "audio/x-wav":
    case "audio/wave":
      return "wav";
    case "audio/aac":
      return "aac";
    case "audio/mp4":
      return "m4a";
    case "audio/ogg":
      return "ogg";
    case "audio/mpeg":
    case "audio/mp3":
    default:
      return "mp3";
  }
}

function isAllowedAudioFile(file: File) {
  if (file.type && ALLOWED_AUDIO_MIME_TYPES.has(file.type)) {
    return true;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return ["mp3", "wav", "aac", "m4a", "ogg"].includes(extension || "");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bannerId: string }> },
) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit(`banner-motion:start:${ip}`, {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações de animação em sequência. Aguarde um pouco e tente novamente." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  try {
    const { bannerId } = await params;
    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const formData = await request.formData();
    const parsed = schema.safeParse({
      preset: formData.get("preset") || undefined,
      durationSeconds: formData.get("durationSeconds") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const audioFile = formData.get("audio");

    if (!(audioFile instanceof File)) {
      return NextResponse.json(
        { error: "Envie uma música em MP3, WAV, AAC, M4A ou OGG." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (!isAllowedAudioFile(audioFile)) {
      return NextResponse.json(
        { error: "Formato de áudio não suportado. Use MP3, WAV, AAC, M4A ou OGG." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (audioFile.size <= 0 || audioFile.size > MAX_AUDIO_SIZE_BYTES) {
      return NextResponse.json(
        { error: "A música precisa ter até 25 MB." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const banner = await prisma.banner.findFirst({
      where: {
        id: bannerId,
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        outputImageUrl: true,
        format: true,
      },
    });

    if (!banner) {
      return NextResponse.json(
        { error: "Banner não encontrado." },
        { status: 404, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (banner.status !== BannerStatus.COMPLETED || !banner.outputImageUrl) {
      return NextResponse.json(
        { error: "Só é possível animar um banner concluído." },
        { status: 409, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const extension = getAudioExtension(audioFile);
    const fileBase = sanitizeForFileName(audioFile.name.replace(/\.[^.]+$/, "")) || "audio";
    const storageKey = `workspaces/${workspace.id}/motion-audio/${Date.now()}-${fileBase}.${extension}`;

    const uploadedAudio = await uploadBufferToR2({
      key: storageKey,
      body: audioBuffer,
      contentType: audioFile.type || "audio/mpeg",
      cacheControl: "public, max-age=31536000, immutable",
    });

    const size = getMotionSizeForFormat(banner.format);

    const motion = await prisma.bannerMotion.create({
      data: {
        workspaceId: workspace.id,
        bannerId: banner.id,
        preset: parsed.data.preset as never,
        status: "PENDING" as never,
        inputImageUrl: banner.outputImageUrl,
        inputAudioUrl: uploadedAudio.url,
        inputAudioStorageKey: storageKey,
        audioOriginalName: audioFile.name || `${fileBase}.${extension}`,
        audioMimeType: audioFile.type || null,
        audioSizeBytes: audioFile.size,
        outputVideoUrl: null,
        outputVideoStorageKey: null,
        format: banner.format,
        width: size.width,
        height: size.height,
        durationSeconds: parsed.data.durationSeconds,
        renderProgress: 0,
        errorMessage: null,
      },
      select: {
        id: true,
        status: true,
        preset: true,
        durationSeconds: true,
        inputAudioUrl: true,
        width: true,
        height: true,
        renderProgress: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        motionId: motion.id,
        status: motion.status,
        preset: motion.preset,
        durationSeconds: motion.durationSeconds,
        audioUrl: motion.inputAudioUrl,
        width: motion.width,
        height: motion.height,
        progress: motion.renderProgress,
        message: "Música enviada. O motion flyer já pode ir para a etapa de renderização.",
      },
      { status: 201, headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    console.error("Erro ao iniciar motion flyer:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno ao iniciar motion flyer." },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }
}
