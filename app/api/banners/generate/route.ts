import { revalidatePath } from "next/cache";
import { after, NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import {
  BannerFormat,
  BannerStatus,
  BannerStylePreset,
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { buildBannerPrompt, generateBannerImage } from "@/lib/openai-image";
import {
  buildBillingSummary,
  getCreditCycleUsageDateFilter,
  getDefaultBannerQuality,
  hasCreditCyclePaymentConfirmation,
  isBannerQualityAllowed,
  requiresCreditCyclePaymentConfirmation,
  type BannerImageQuality,
} from "@/lib/plans";
import { isBannerStyleAllowedForPlan } from "@/lib/banner-style-access";
import { logBannerGeneration } from "@/lib/banner-generation-log";
import { prisma } from "@/lib/prisma";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";
import { uploadBannerBuffer } from "@/lib/storage";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const maxDuration = 120;

const SERIALIZABLE_ISOLATION_LEVEL = "Serializable" as never;

const CREDIT_EVENT_TYPES = [
  UsageEventType.BANNER_GENERATION,
  UsageEventType.BANNER_EDIT,
  UsageEventType.BANNER_VARIATION,
            UsageEventType.BANNER_MOTION_RENDER,
] as const;

const referenceImageField = z
  .union([
    z.string().trim().url("A URL da imagem de referência precisa ser válida."),
    z
      .string()
      .trim()
      .regex(
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
        "A imagem enviada precisa ser uma data URL válida.",
      ),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

const schema = z.object({
  mainText: z.string().trim().min(2, "Informe o texto principal do banner."),
  djName: z.string().trim().min(2, "Informe o nome do DJ."),
  secondaryText: z.string().trim().optional().default(""),
  eventDate: z.string().trim().min(2, "Informe a data do evento."),
  eventLocation: z.string().trim().min(2, "Informe o local do evento."),
  stylePreset: z.enum([
    "NEON_CLUB",
    "FESTIVAL_MAINSTAGE",
    "CYBER_RAVE",
    "DARK_TECHNO",
    "CHROME_FUTURE",
    "AFRO_HOUSE_SUNSET",
    "Y2K_CLUB",
    "PREMIUM_BLACK",
    "SUMMER_VIBES",
    "MINIMAL_TECHNO",
    "LUXURY_GOLD",
  ]),
  format: z.enum(["POST_FEED", "STORY"]),
  quality: z.enum(["low", "medium", "high"]).optional(),
  referenceImageUrl: referenceImageField,
});

type GeneratePayload = z.infer<typeof schema>;

type CreditReservation = {
  usageEventId: string | null;
  remainingCreditsAfterReserve: number;
  isAdminUnlimited: boolean;
};

function getSizeForFormat(format: GeneratePayload["format"]) {
  switch (format) {
    case "STORY":
      return "1024x1536";
    case "POST_FEED":
    default:
      return "1024x1280";
  }
}

function sanitizeForFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function hasPrismaCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

function getPendingModelName() {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2";
}

async function reserveGenerationCredit(params: {
  workspaceId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isAdmin: boolean;
  providerSubscriptionId?: string | null;
  currentPeriodStart?: Date | string | null;
  currentPeriodEnd?: Date | string | null;
}) {
  const {
    workspaceId,
    plan,
    status,
    isAdmin,
    providerSubscriptionId,
    currentPeriodStart,
    currentPeriodEnd,
  } = params;

  if (isAdmin) {
    return {
      usageEventId: null as string | null,
      remainingCreditsAfterReserve: 999999,
      isAdminUnlimited: true,
    };
  }

  const usageDateFilter = getCreditCycleUsageDateFilter({
    providerSubscriptionId,
    currentPeriodStart,
    currentPeriodEnd,
  });

  const requiresPaymentConfirmation = requiresCreditCyclePaymentConfirmation({
    plan,
    providerSubscriptionId,
    currentPeriodStart,
    currentPeriodEnd,
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const usageEvents = await tx.usageEvent.findMany({
            where: {
              workspaceId,
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
            plan,
            status,
            usageEvents,
            requiresPaymentConfirmation,
            creditCyclePaymentConfirmed:
              hasCreditCyclePaymentConfirmation(usageEvents),
          });

          if (!summary.canGenerateBanner) {
            throw new Error("Você usou todos os seus créditos deste ciclo.");
          }

          const usageEvent = await tx.usageEvent.create({
            data: {
              workspaceId,
              type: UsageEventType.BANNER_GENERATION,
              units: 1,
              metadata: {
                status: "reserved",
                reservedAt: new Date().toISOString(),
              },
            },
            select: { id: true },
          });

          return {
            usageEventId: usageEvent.id,
            remainingCreditsAfterReserve: Math.max(summary.remainingCredits - 1, 0),
            isAdminUnlimited: false,
          };
        },
        {
          isolationLevel: SERIALIZABLE_ISOLATION_LEVEL,
        },
      );
    } catch (error) {
      if (hasPrismaCode(error, "P2034") && attempt < 2) continue;
      throw error;
    }
  }

  throw new Error("Não foi possível reservar crédito no momento.");
}

function getMetadataRecord(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata as Record<string, unknown>;
}

async function refundReservedCredit(
  usageEventId: string | null,
  reason = "generation_failed",
) {
  if (!usageEventId) return;

  try {
    const usageEvent = await prisma.usageEvent.findUnique({
      where: { id: usageEventId },
      select: { units: true, metadata: true },
    });

    if (!usageEvent) return;

    await prisma.usageEvent.update({
      where: { id: usageEventId },
      data: {
        units: 0,
        metadata: {
          ...getMetadataRecord(usageEvent.metadata),
          status: "refunded",
          originalUnits: usageEvent.units,
          refundedAt: new Date().toISOString(),
          refundReason: reason,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao estornar crédito reservado na geração:", error);
  }
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function safeErrorName(error: unknown) {
  return error instanceof Error ? error.name : "UnknownError";
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch (error) {
    console.error("Erro ao revalidar path:", { path, error });
  }
}

async function processGenerationJob(params: {
  bannerId: string;
  workspaceId: string;
  usageEventId: string | null;
  reservation: CreditReservation;
  payload: GeneratePayload;
  prompt: string;
  size: string;
  quality: BannerImageQuality;
  isAdmin: boolean;
}) {
  const {
    bannerId,
    workspaceId,
    usageEventId,
    payload,
    prompt,
    size,
    quality,
    isAdmin,
  } = params;

  const startedAt = Date.now();

  try {
    await logBannerGeneration({
      bannerId,
      workspaceId,
      step: "JOB_STARTED",
      message: "Background generation job started.",
      metadata: {
        format: payload.format,
        stylePreset: payload.stylePreset,
        quality,
        size,
        hasReferenceImage: Boolean(payload.referenceImageUrl),
        referenceImageLength: payload.referenceImageUrl?.length || 0,
      },
    });

    await logBannerGeneration({
      bannerId,
      workspaceId,
      step: "OPENAI_REQUEST_STARTED",
      message: "Sending banner generation request to OpenAI.",
      metadata: {
        model: getPendingModelName(),
        quality,
        size,
        hasReferenceImage: Boolean(payload.referenceImageUrl),
      },
    });

    const generated = await generateBannerImage({
      prompt,
      size,
      quality,
      referenceImageUrl: payload.referenceImageUrl,
    });

    await logBannerGeneration({
      bannerId,
      workspaceId,
      step: "OPENAI_REQUEST_SUCCESS",
      message: "OpenAI returned a banner image.",
      metadata: {
        model: generated.modelName,
        hasImageBase64: Boolean(generated.imageBase64),
      },
    });

    if (!generated.imageBase64) {
      throw new Error("A OpenAI não retornou a imagem do banner.");
    }

    const imageBuffer = Buffer.from(generated.imageBase64, "base64");
    const finalPng = await sharp(imageBuffer).png().toBuffer();
    const meta = await sharp(finalPng).metadata();

    const filenameBase =
      sanitizeForFileName(`${payload.djName}-${payload.mainText}`) ||
      `banner-${Date.now()}`;
    const key = `workspaces/${workspaceId}/generated-banners/${Date.now()}-${filenameBase}.png`;

    await logBannerGeneration({
      bannerId,
      workspaceId,
      step: "R2_UPLOAD_STARTED",
      message: "Uploading generated banner to R2.",
      metadata: {
        storageKey: key,
        sizeBytes: finalPng.byteLength,
        width: meta.width || null,
        height: meta.height || null,
      },
    });

    const uploaded = await uploadBannerBuffer({
      key,
      body: finalPng,
      contentType: "image/png",
    });

    await logBannerGeneration({
      bannerId,
      workspaceId,
      step: "R2_UPLOAD_SUCCESS",
      message: "Generated banner uploaded to R2.",
      metadata: {
        storageKey: key,
        outputImageUrl: uploaded.url,
      },
    });

    await logBannerGeneration({
      bannerId,
      workspaceId,
      step: "DB_UPDATE_STARTED",
      message: "Updating banner as COMPLETED.",
    });

    await prisma.banner.update({
      where: { id: bannerId },
      data: {
        revisedPrompt: generated.revisedPrompt || null,
        modelName: generated.modelName,
        status: BannerStatus.COMPLETED,
        outputImageUrl: uploaded.url,
        width: meta.width || null,
        height: meta.height || null,
        generationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      },
    });

    await logBannerGeneration({
      bannerId,
      workspaceId,
      step: "DB_UPDATE_SUCCESS",
      message: "Banner updated as COMPLETED.",
      metadata: {
        outputImageUrl: uploaded.url,
      },
    });

    await prisma.asset
      .create({
        data: {
          workspaceId,
          url: uploaded.url,
          originalName: `${filenameBase}.png`,
          storageProvider: "cloudflare-r2",
          storageKey: key,
          mimeType: "image/png",
          sizeBytes: finalPng.byteLength,
          width: meta.width || null,
          height: meta.height || null,
        },
      })
      .catch(async (error) => {
        console.error("Erro ao registrar asset do banner:", error);
        await logBannerGeneration({
          bannerId,
          workspaceId,
          level: "warn",
          step: "ASSET_CREATE_FAILED",
          message: safeErrorMessage(error),
          metadata: {
            storageKey: key,
          },
        });
      });

    if (usageEventId) {
      await prisma.usageEvent
        .update({
          where: { id: usageEventId },
          data: {
            metadata: {
              status: "confirmed",
              confirmedAt: new Date().toISOString(),
              model: generated.modelName,
              stylePreset: payload.stylePreset,
              format: payload.format,
              quality,
              bannerId,
              isAdminBypass: isAdmin,
            },
          },
        })
        .catch(async (error) => {
          console.error("Erro ao confirmar crédito da geração:", error);
          await logBannerGeneration({
            bannerId,
            workspaceId,
            level: "warn",
            step: "CREDIT_CONFIRM_FAILED",
            message: safeErrorMessage(error),
            metadata: {
              usageEventId,
            },
          });
        });
    }

    await logBannerGeneration({
      bannerId,
      workspaceId,
      step: "JOB_COMPLETED",
      message: "Banner generation job completed successfully.",
      metadata: {
        generationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      },
    });

    safeRevalidate("/dashboard");
    safeRevalidate("/dashboard/billing");
    safeRevalidate("/dashboard/banners/new");
    safeRevalidate("/dashboard/banners");
    safeRevalidate(`/dashboard/banners/${bannerId}`);
  } catch (error) {
    console.error("Erro ao processar geração do banner:", error);

    await logBannerGeneration({
      bannerId,
      workspaceId,
      level: "error",
      step: "JOB_FAILED",
      message: safeErrorMessage(error),
      metadata: {
        errorName: safeErrorName(error),
        generationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      },
    });

    await prisma.banner
      .update({
        where: { id: bannerId },
        data: {
          status: BannerStatus.FAILED,
          generationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
        },
      })
      .catch(async (updateError) => {
        console.error("Erro ao marcar banner como FAILED:", updateError);
        await logBannerGeneration({
          bannerId,
          workspaceId,
          level: "error",
          step: "DB_FAILED_UPDATE_FAILED",
          message: safeErrorMessage(updateError),
        });
      });

    await refundReservedCredit(usageEventId, "generation_job_failed");

    safeRevalidate("/dashboard");
    safeRevalidate("/dashboard/billing");
    safeRevalidate("/dashboard/banners/new");
    safeRevalidate("/dashboard/banners");
  }
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const rateLimit = await consumeRateLimit(`banners:generate:${ip}`, {
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas gerações em sequência. Aguarde um pouco e tente novamente." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  let reservedUsageEventId: string | null = null;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const payload = parsed.data;
    const isAdmin = isAdminEmail(workspace.user?.email);
    const subscriptionPlan = workspace.subscription?.plan || SubscriptionPlan.FREE;
    const requestedQuality =
      payload.quality || getDefaultBannerQuality(subscriptionPlan, isAdmin);

    if (
      !isBannerStyleAllowedForPlan({
        stylePreset: payload.stylePreset,
        plan: subscriptionPlan,
        isAdmin,
      })
    ) {
      return NextResponse.json(
        {
          error:
            "Premium visual styles are available from the Pro plan and higher.",
        },
        { status: 403, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (!isBannerQualityAllowed(subscriptionPlan, requestedQuality, isAdmin)) {
      return NextResponse.json(
        {
          error:
            requestedQuality === "high"
              ? "Alta qualidade fica disponível apenas nos planos Professional e Studio."
              : "Essa qualidade não está disponível no seu plano atual.",
        },
        { status: 403, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const reservation = await reserveGenerationCredit({
      workspaceId: workspace.id,
      plan: subscriptionPlan,
      status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
      isAdmin,
      providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
      currentPeriodStart: workspace.subscription?.currentPeriodStart,
      currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
    });

    reservedUsageEventId = reservation.usageEventId;

    const size = getSizeForFormat(payload.format);
    const prompt = buildBannerPrompt({
      mainText: payload.mainText,
      djName: payload.djName,
      secondaryText: payload.secondaryText || "",
      eventDate: payload.eventDate,
      eventLocation: payload.eventLocation,
      stylePreset: payload.stylePreset,
      format: payload.format,
    });

    const pendingBanner = await prisma.banner.create({
      data: {
        workspaceId: workspace.id,
        title: payload.mainText,
        djName: payload.djName,
        eventName: payload.secondaryText || null,
        eventDate: payload.eventDate,
        eventLocation: payload.eventLocation,
        city: null,
        stylePreset: payload.stylePreset as BannerStylePreset,
        format: payload.format as BannerFormat,
        prompt,
        revisedPrompt: null,
        modelName: getPendingModelName(),
        status: BannerStatus.PENDING,
        referenceImageUrl: payload.referenceImageUrl,
        outputImageUrl: null,
        width: null,
        height: null,
        generationSeconds: null,
      },
      select: { id: true },
    });

    await logBannerGeneration({
      bannerId: pendingBanner.id,
      workspaceId: workspace.id,
      userId: workspace.user?.id,
      step: "BANNER_CREATED",
      message: "Banner record created as PENDING.",
      metadata: {
        format: payload.format,
        stylePreset: payload.stylePreset,
        quality: requestedQuality,
        hasReferenceImage: Boolean(payload.referenceImageUrl),
        referenceImageLength: payload.referenceImageUrl?.length || 0,
        modelName: getPendingModelName(),
      },
    });

    if (reservedUsageEventId) {
      await prisma.usageEvent.update({
        where: { id: reservedUsageEventId },
        data: {
          metadata: {
            status: "processing",
            reservedAt: new Date().toISOString(),
            bannerId: pendingBanner.id,
            stylePreset: payload.stylePreset,
            format: payload.format,
            quality: requestedQuality,
            isAdminBypass: isAdmin,
          },
        },
      });

      await logBannerGeneration({
        bannerId: pendingBanner.id,
        workspaceId: workspace.id,
        userId: workspace.user?.id,
        step: "CREDIT_PROCESSING",
        message: "Reserved credit linked to banner and marked as processing.",
        metadata: {
          usageEventId: reservedUsageEventId,
          quality: requestedQuality,
        },
      });
    }

    after(() =>
      processGenerationJob({
        bannerId: pendingBanner.id,
        workspaceId: workspace.id,
        usageEventId: reservation.usageEventId,
        reservation,
        payload,
        prompt,
        size,
        quality: requestedQuality,
        isAdmin,
      }),
    );

    return NextResponse.json(
      {
        success: true,
        status: BannerStatus.PENDING,
        bannerId: pendingBanner.id,
        bannerUrl: `/dashboard/banners/${pendingBanner.id}`,
        remainingCredits: reservation.remainingCreditsAfterReserve,
        isAdminUnlimited: reservation.isAdminUnlimited,
      },
      { status: 202, headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    await refundReservedCredit(reservedUsageEventId, "generation_start_failed");

    console.error("Erro ao iniciar geração do banner:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno ao gerar banner.",
      },
      {
        status:
          error instanceof Error && error.message.includes("créditos")
            ? 403
            : 500,
        headers: buildRateLimitHeaders(rateLimit),
      },
    );
  }
}
