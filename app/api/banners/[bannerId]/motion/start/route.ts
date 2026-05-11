import { NextResponse } from "next/server";
import { z } from "zod";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import {
  buildBillingSummary,
  getCreditCycleUsageDateFilter,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { validateMutationOrigin } from "@/lib/request-security";
import { uploadBufferToR2 } from "@/lib/storage";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_AUDIO_BYTES = 30 * 1024 * 1024;

const CREDIT_EVENT_TYPES = [
  UsageEventType.BANNER_GENERATION,
  UsageEventType.BANNER_EDIT,
  UsageEventType.BANNER_VARIATION,
  UsageEventType.BANNER_MOTION_RENDER,
] as const;

const motionSchema = z.object({
  preset: z.enum([
    "NEON_PULSE",
    "CLUB_FLASH",
    "CINEMATIC_ZOOM",
    "FESTIVAL_LIGHTS",
    "DARK_TECHNO_GLITCH",
    "FESTIVAL_DROP_PRO",
    "VIRAL_REELS_CUT",
    "DARK_TECHNO_RGB",
    "LUXURY_GOLD_CLUB",
    "CYBER_RAVE",
  ]),
  transitionVariant: z.enum([
    "AUTO",
    "ROTATE_ZOOM",
    "WHIP_ZOOM",
    "SPIN_BLUR",
    "FLASH_CUT",
    "GLITCH_ZOOM",
    "VIRAL_SHAKE",
  ]),
  durationSeconds: z.coerce.number().int().refine((value) => [6, 10, 15].includes(value), {
    message: "Escolha uma duração válida.",
  }),
});

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
}

function getExtensionFromMime(mimeType: string) {
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("aac")) return "aac";
  if (mimeType.includes("ogg")) return "ogg";
  return "mp3";
}

async function reserveMotionCredit(params: {
  workspaceId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  providerSubscriptionId?: string | null;
  currentPeriodStart?: Date | string | null;
  currentPeriodEnd?: Date | string | null;
  isAdmin: boolean;
}) {
  if (params.isAdmin) {
    return null;
  }

  const usageDateFilter = getCreditCycleUsageDateFilter({
    providerSubscriptionId: params.providerSubscriptionId,
    currentPeriodStart: params.currentPeriodStart,
    currentPeriodEnd: params.currentPeriodEnd,
  });

  const requiresPaymentConfirmation = requiresCreditCyclePaymentConfirmation({
    plan: params.plan,
    providerSubscriptionId: params.providerSubscriptionId,
    currentPeriodStart: params.currentPeriodStart,
    currentPeriodEnd: params.currentPeriodEnd,
  });

  const usageEvents = await prisma.usageEvent.findMany({
    where: {
      workspaceId: params.workspaceId,
      createdAt: usageDateFilter,
      type: { in: [...CREDIT_EVENT_TYPES] },
    },
    select: {
      units: true,
      createdAt: true,
      metadata: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const summary = buildBillingSummary({
    plan: params.plan,
    status: params.status,
    usageEvents,
    requiresPaymentConfirmation,
    creditCyclePaymentConfirmed: hasCreditCyclePaymentConfirmation(usageEvents),
  });

  if (!summary.canGenerateBanner) {
    throw new Error("Você usou todos os seus créditos deste ciclo.");
  }

  const usageEvent = await prisma.usageEvent.create({
    data: {
      workspaceId: params.workspaceId,
      type: UsageEventType.BANNER_MOTION_RENDER,
      units: 1,
      metadata: {
        status: "reserved",
        flow: "motion-flyer",
        reservedAt: new Date().toISOString(),
      },
    },
    select: { id: true },
  });

  return usageEvent.id;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bannerId: string }> },
) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { bannerId } = await params;
  const formData = await request.formData();
  const audio = formData.get("audio");
  const originalAudioNameValue = formData.get("originalAudioName");
  const trimStartValue = formData.get("audioTrimStartSeconds");
  const trimEndValue = formData.get("audioTrimEndSeconds");
  const wasTrimmedValue = formData.get("audioWasTrimmed");

  const originalAudioName =
    typeof originalAudioNameValue === "string" && originalAudioNameValue.trim()
      ? originalAudioNameValue.trim().slice(0, 180)
      : null;
  const audioTrimStartSeconds =
    typeof trimStartValue === "string" ? Number(trimStartValue) : null;
  const audioTrimEndSeconds =
    typeof trimEndValue === "string" ? Number(trimEndValue) : null;
  const audioWasTrimmed = wasTrimmedValue === "true";

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Envie uma música MP3, WAV, M4A, AAC ou OGG." }, { status: 400 });
  }

  if (audio.size <= 0 || audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "O áudio precisa ter até 30 MB." }, { status: 400 });
  }

  const allowedAudioTypes = new Set([
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/aac",
    "audio/mp4",
    "audio/m4a",
    "audio/ogg",
  ]);

  if (audio.type && !allowedAudioTypes.has(audio.type)) {
    return NextResponse.json({ error: "Formato de áudio não suportado." }, { status: 400 });
  }

  const parsed = motionSchema.safeParse({
    preset: formData.get("preset"),
    transitionVariant: formData.get("transitionVariant") || "AUTO",
    durationSeconds: formData.get("durationSeconds") || "10",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  }

  const banner = await prisma.banner.findFirst({
    where: {
      id: bannerId,
      workspaceId: workspace.id,
      status: "COMPLETED",
    },
    select: {
      id: true,
      workspaceId: true,
      outputImageUrl: true,
      format: true,
      width: true,
      height: true,
    },
  });

  if (!banner?.outputImageUrl) {
    return NextResponse.json({ error: "Banner não encontrado ou ainda sem imagem final." }, { status: 404 });
  }

  let usageEventId: string | null = null;

  try {
    usageEventId = await reserveMotionCredit({
      workspaceId: workspace.id,
      plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
      status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
      providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
      currentPeriodStart: workspace.subscription?.currentPeriodStart,
      currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
      isAdmin: isAdminEmail(workspace.user?.email),
    });

    if (usageEventId) {
      await prisma.usageEvent
        .update({
          where: { id: usageEventId },
          data: {
            metadata: {
              status: "reserved",
              flow: "motion-flyer",
              reservedAt: new Date().toISOString(),
              audioWasTrimmed,
              audioTrimStartSeconds: Number.isFinite(audioTrimStartSeconds)
                ? audioTrimStartSeconds
                : null,
              audioTrimEndSeconds: Number.isFinite(audioTrimEndSeconds)
                ? audioTrimEndSeconds
                : null,
              originalAudioName,
            },
          },
        })
        .catch(() => null);
    }

    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeOriginalName = sanitizeFileName(audio.name || `audio.${getExtensionFromMime(audio.type)}`);
    const extension = safeOriginalName.includes(".")
      ? safeOriginalName.split(".").pop() || getExtensionFromMime(audio.type)
      : getExtensionFromMime(audio.type);
    const key = `workspaces/${workspace.id}/motion-audio/${banner.id}-${Date.now()}.${extension}`;

    const uploadedAudio = await uploadBufferToR2({
      key,
      body: buffer,
      contentType: audio.type || "audio/mpeg",
      cacheControl: "public, max-age=86400",
    });

    const motion = await (prisma as any).bannerMotion.create({
      data: {
        workspaceId: workspace.id,
        bannerId: banner.id,
        usageEventId,
        preset: parsed.data.preset,
        transitionVariant: parsed.data.transitionVariant,
        status: "PENDING",
        inputImageUrl: banner.outputImageUrl,
        inputAudioUrl: uploadedAudio.url,
        inputAudioStorageKey: uploadedAudio.key,
        audioOriginalName: originalAudioName
          ? `${originalAudioName} → ${audio.name || safeOriginalName}`
          : audio.name || safeOriginalName,
        audioMimeType: audio.type || "audio/mpeg",
        audioSizeBytes: audio.size,
        format: banner.format,
        width: banner.width,
        height: banner.height,
        durationSeconds: parsed.data.durationSeconds,
        renderProgress: 0,
      },
      select: {
        id: true,
        status: true,
        renderProgress: true,
      },
    });

    return NextResponse.json({
      motionId: motion.id,
      status: motion.status,
      renderProgress: motion.renderProgress,
    }, { status: 202 });
  } catch (error) {
    if (usageEventId) {
      await prisma.usageEvent.delete({ where: { id: usageEventId } }).catch(() => null);
    }

    const message = error instanceof Error ? error.message : "Não foi possível iniciar o vídeo.";
    const status = message.includes("créditos") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
