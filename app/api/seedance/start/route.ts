import { NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { reserveWorkspaceCredits } from "@/lib/credits";
import { cleanupExpiredSeedanceVideos } from "@/lib/seedance/cleanup";
import {
  buildBillingSummary,
  getCreditCycleUsageDateFilter,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { validateMutationOrigin } from "@/lib/request-security";
import {
  buildSeedancePrompt,
  createSeedancePrediction,
  getSeedanceDurationSeconds,
  getSeedanceModel,
  getSeedanceProvider,
  mapReplicateStatusToMotionStatus,
  type SeedanceResolution,
} from "@/lib/seedance";
import { deleteObjectFromR2, uploadBufferToR2 } from "@/lib/storage";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 18 * 1024 * 1024;
const VIDEO_EXPIRES_IN_HOURS = 24;
const STALE_ACTIVE_VIDEO_MINUTES = 20;

const PLAN_CREDIT_LIMITS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]: 2,
  [SubscriptionPlan.PRO]: 20,
  [SubscriptionPlan.PROFESSIONAL]: 40,
  [SubscriptionPlan.STUDIO]: 80,
};

const CREDIT_EVENT_TYPES = [
  UsageEventType.BANNER_GENERATION,
  UsageEventType.BANNER_EDIT,
  UsageEventType.BANNER_VARIATION,
  UsageEventType.BANNER_MOTION_RENDER,
] as const;

type MotionUsageEvent = {
  units: number | null;
  createdAt: Date | string;
  metadata: unknown;
};

const motionSchema = z.object({
  resolution: z.preprocess(
    (value) => String(value || "480").replace(/p$/i, ""),
    z.enum(["480", "720"]),
  ),
  motionInstructions: z.string().trim().max(900).optional().default(""),
});

function getResolutionCreditCost(resolution: SeedanceResolution) {
  return resolution === "720" ? 12 : 5;
}

async function releaseStaleActiveSeedanceVideos(workspaceId: string) {
  const staleBefore = new Date(
    Date.now() - STALE_ACTIVE_VIDEO_MINUTES * 60 * 1000,
  );

  const staleVideos = (await (prisma as any).seedanceVideo.findMany({
    where: {
      workspaceId,
      status: { in: ["PENDING", "RENDERING"] },
      createdAt: { lt: staleBefore },
    },
    select: {
      id: true,
      usageEventId: true,
    },
  })) as Array<{ id: string; usageEventId: string | null }>;

  if (staleVideos.length === 0) {
    return { released: 0, refunded: 0 };
  }

  await (prisma as any).seedanceVideo.updateMany({
    where: {
      id: { in: staleVideos.map((video) => video.id) },
    },
    data: {
      status: "FAILED",
      progress: 100,
      errorMessage:
        "A geração ficou travada por muito tempo e foi liberada automaticamente para permitir uma nova tentativa.",
    },
  });

  const usageEventIds = staleVideos
    .map((video) => video.usageEventId)
    .filter((id): id is string => Boolean(id));

  if (usageEventIds.length > 0) {
    await prisma.usageEvent
      .deleteMany({
        where: {
          id: { in: usageEventIds },
        },
      })
      .catch(() => null);
  }

  return { released: staleVideos.length, refunded: usageEventIds.length };
}

async function reserveSeedanceCredit(params: {
  workspaceId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  providerSubscriptionId?: string | null;
  currentPeriodStart?: Date | string | null;
  currentPeriodEnd?: Date | string | null;
  isAdmin: boolean;
  requiredUnits: number;
  resolution: SeedanceResolution;
  motionInstructions: string;
}) {
  const reservation = await reserveWorkspaceCredits({
    workspaceId: params.workspaceId,
    plan: params.plan,
    status: params.status,
    providerSubscriptionId: params.providerSubscriptionId,
    currentPeriodStart: params.currentPeriodStart,
    currentPeriodEnd: params.currentPeriodEnd,
    isAdmin: params.isAdmin,
    requiredUnits: params.requiredUnits,
    usageEventType: UsageEventType.BANNER_MOTION_RENDER,
    metadata: {
      flow: "standalone-seedance-flyer",
      engine: "seedance",
      provider: getSeedanceProvider(),
      model: getSeedanceModel(),
      resolution: `${params.resolution}p`,
      motionInstructions: params.motionInstructions || null,
    },
    insufficientCreditsMessage: ({ remainingCredits }) =>
      `Você precisa de ${params.requiredUnits} créditos para gerar vídeo em ${params.resolution}p. Créditos disponíveis: ${remainingCredits}.`,
  });

  return reservation.usageEventId;
}

async function readValidImage(file: File) {
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("O flyer precisa ter até 18 MB.");
  }

  const allowedImageTypes = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ]);

  if (file.type && !allowedImageTypes.has(file.type)) {
    throw new Error("Envie o flyer em PNG, JPG ou WEBP.");
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const cleanBuffer = await sharp(originalBuffer, { animated: false })
    .rotate()
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  const metadata = await sharp(cleanBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Não foi possível identificar as dimensões do flyer.");
  }

  return {
    buffer: cleanBuffer,
    width: metadata.width,
    height: metadata.height,
    contentType: "image/png",
    extension: "png",
  };
}

function isVideoProviderRateLimitError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("rate limit") ||
    normalized.includes("rate-limit") ||
    normalized.includes("too many requests") ||
    normalized.includes("requests per minute") ||
    normalized.includes("limited") ||
    normalized.includes("limite de taxa") ||
    normalized.includes("429")
  );
}

function buildSeedanceStartError(error: unknown) {
  const rawMessage =
    error instanceof Error
      ? error.message
      : "Não foi possível iniciar o vídeo no Seedance.";

  if (isVideoProviderRateLimitError(rawMessage)) {
    return {
      status: 429,
      message:
        "A geração foi limitada temporariamente pela AtlasCloud. Aguarde alguns segundos e tente novamente. Se isso acontecer com frequência, adicione mais crédito na AtlasCloud para aumentar o limite.",
    };
  }

  if (
    rawMessage.includes("E005") ||
    rawMessage.toLowerCase().includes("flagged as sensitive")
  ) {
    return {
      status: 400,
      message:
        "O Seedance recusou a geração por filtro de segurança. Tente um flyer mais neutro, deixe o complemento opcional vazio e gere novamente. O crédito desta tentativa não foi consumido.",
    };
  }

  if (rawMessage.includes("créditos")) {
    const requiredCredits = Number(
      rawMessage.match(/precisa de (\d+) créditos/i)?.[1] || 0,
    );
    const remainingCredits = Number(
      rawMessage.match(/Créditos disponíveis: (\d+)/i)?.[1] || 0,
    );

    return {
      status: 403,
      message: rawMessage,
      code: "INSUFFICIENT_CREDITS",
      requiredCredits: Number.isFinite(requiredCredits) ? requiredCredits : 0,
      remainingCredits: Number.isFinite(remainingCredits)
        ? remainingCredits
        : 0,
      billingUrl: "/dashboard/billing",
    };
  }

  if (
    rawMessage.includes("ATLASCLOUD_API_KEY") ||
    rawMessage.includes("ATLAS_API_KEY")
  ) {
    return { status: 503, message: rawMessage };
  }

  return { status: 500, message: rawMessage };
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await cleanupExpiredSeedanceVideos({ workspaceId: workspace.id }).catch(
    () => null,
  );
  await releaseStaleActiveSeedanceVideos(workspace.id).catch(() => null);

  const activeSeedanceVideo = await (prisma as any).seedanceVideo
    .findFirst({
      where: {
        workspaceId: workspace.id,
        status: { in: ["PENDING", "RENDERING"] },
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        status: true,
        progress: true,
        expiresAt: true,
        inputImageUrl: true,
        resolution: true,
        width: true,
        height: true,
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => null);

  if (activeSeedanceVideo) {
    return NextResponse.json(
      {
        error:
          "Já existe uma geração Seedance em andamento. Aguarde o vídeo atual terminar antes de iniciar outro.",
        videoId: activeSeedanceVideo.id,
        status: activeSeedanceVideo.status,
        renderProgress: activeSeedanceVideo.progress,
        inputImageUrl: activeSeedanceVideo.inputImageUrl,
        resolution: activeSeedanceVideo.resolution,
        width: activeSeedanceVideo.width,
        height: activeSeedanceVideo.height,
        expiresAt: activeSeedanceVideo.expiresAt,
      },
      { status: 409 },
    );
  }

  let usageEventId: string | null = null;
  let uploadedImageKey: string | null = null;

  try {
    const formData = await request.formData();
    const flyer = formData.get("flyer");

    if (!(flyer instanceof File)) {
      return NextResponse.json(
        { error: "Envie um flyer para animar." },
        { status: 400 },
      );
    }

    const parsed = motionSchema.safeParse({
      resolution: formData.get("resolution") || "480",
      motionInstructions: formData.get("motionInstructions") || "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 },
      );
    }

    const credits = getResolutionCreditCost(parsed.data.resolution);
    const image = await readValidImage(flyer);
    const expiresAt = new Date(
      Date.now() + VIDEO_EXPIRES_IN_HOURS * 60 * 60 * 1000,
    );

    usageEventId = await reserveSeedanceCredit({
      workspaceId: workspace.id,
      plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
      status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
      providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
      currentPeriodStart: workspace.subscription?.currentPeriodStart,
      currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
      isAdmin: isAdminEmail(workspace.user?.email),
      requiredUnits: credits,
      resolution: parsed.data.resolution,
      motionInstructions: parsed.data.motionInstructions,
    });

    const imageKey = `workspaces/${workspace.id}/seedance-inputs/flyer-${Date.now()}.${image.extension}`;

    const uploadedImage = await uploadBufferToR2({
      key: imageKey,
      body: image.buffer,
      contentType: image.contentType,
      cacheControl: "public, max-age=86400",
    });
    uploadedImageKey = uploadedImage.key;

    const prompt = buildSeedancePrompt({
      motionInstructions: parsed.data.motionInstructions,
    });

    const prediction = await createSeedancePrediction({
      imageUrl: uploadedImage.url,
      prompt,
      resolution: parsed.data.resolution,
    });

    const motionStatus = mapReplicateStatusToMotionStatus(prediction.status);

    if (motionStatus === "FAILED") {
      throw new Error(
        prediction.error
          ? String(prediction.error)
          : "O Seedance não conseguiu iniciar este vídeo.",
      );
    }

    const initialStatus = motionStatus === "PENDING" ? "PENDING" : "RENDERING";
    const initialProgress =
      motionStatus === "COMPLETED"
        ? 92
        : initialStatus === "RENDERING"
          ? 18
          : 5;

    const motion = await (prisma as any).seedanceVideo.create({
      data: {
        workspaceId: workspace.id,
        usageEventId,
        status: initialStatus,
        inputImageUrl: uploadedImage.url,
        inputImageStorageKey: uploadedImage.key,
        inputAudioUrl: null,
        inputAudioStorageKey: null,
        audioOriginalName: null,
        audioMimeType: null,
        audioSizeBytes: null,
        outputVideoUrl: null,
        outputVideoStorageKey: null,
        providerName: prediction.provider || getSeedanceProvider(),
        providerModel:
          prediction.model ||
          getSeedanceModel(prediction.provider || getSeedanceProvider()),
        providerJobId: prediction.id,
        providerOutputUrl: null,
        width: image.width,
        height: image.height,
        resolution: parsed.data.resolution,
        motionInstructions: parsed.data.motionInstructions || null,
        durationSeconds: getSeedanceDurationSeconds(),
        progress: initialProgress,
        errorMessage: prediction.error ? String(prediction.error) : null,
        prompt,
        creditsUsed: credits,
        expiresAt,
      },
      select: {
        id: true,
        status: true,
        progress: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json(
      {
        videoId: motion.id,
        status: motion.status,
        renderProgress: motion.progress,
        queuePosition: null,
        credits,
        provider: prediction.provider || getSeedanceProvider(),
        providerJobId: prediction.id,
        durationSeconds: getSeedanceDurationSeconds(),
        width: image.width,
        height: image.height,
        expiresAt: motion.expiresAt,
      },
      { status: 202 },
    );
  } catch (error) {
    if (usageEventId) {
      await prisma.usageEvent
        .delete({ where: { id: usageEventId } })
        .catch(() => null);
    }

    await Promise.all([
      uploadedImageKey
        ? deleteObjectFromR2(uploadedImageKey).catch(() => null)
        : null,
    ]);

    const friendlyError = buildSeedanceStartError(error);

    return NextResponse.json(
      {
        error: friendlyError.message,
        code: (friendlyError as any).code,
        requiredCredits: (friendlyError as any).requiredCredits,
        remainingCredits: (friendlyError as any).remainingCredits,
        billingUrl: (friendlyError as any).billingUrl,
      },
      { status: friendlyError.status },
    );
  }
}
