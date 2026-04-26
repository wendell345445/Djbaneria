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
  getDefaultBannerQuality,
  isBannerQualityAllowed,
  type BannerImageQuality,
} from "@/lib/plans";
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
}) {
  const { workspaceId, plan, status, isAdmin } = params;

  if (isAdmin) {
    return {
      usageEventId: null as string | null,
      remainingCreditsAfterReserve: 999999,
      isAdminUnlimited: true,
    };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const usedThisMonthResult = await tx.usageEvent.aggregate({
            where: {
              workspaceId,
              createdAt: { gte: monthStart },
              type: { in: [...CREDIT_EVENT_TYPES] },
            },
            _sum: { units: true },
          });

          const summary = buildBillingSummary({
            plan,
            status,
            usedThisMonth: usedThisMonthResult._sum.units || 0,
          });

          if (!summary.canGenerateBanner) {
            throw new Error("Você usou todos os seus créditos deste mês.");
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

async function refundReservedCredit(usageEventId: string | null) {
  if (!usageEventId) return;

  try {
    await prisma.usageEvent.delete({ where: { id: usageEventId } });
  } catch (error) {
    console.error("Erro ao estornar crédito reservado na geração:", error);
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
    const generated = await generateBannerImage({
      prompt,
      size,
      quality,
      referenceImageUrl: payload.referenceImageUrl,
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
    const uploaded = await uploadBannerBuffer({
      key,
      body: finalPng,
      contentType: "image/png",
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

    await prisma.asset.create({
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
    });

    if (usageEventId) {
      await prisma.usageEvent.update({
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
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/banners/new");
    revalidatePath("/dashboard/banners");
    revalidatePath(`/dashboard/banners/${bannerId}`);
  } catch (error) {
    console.error("Erro ao processar geração do banner:", error);

    await prisma.banner.update({
      where: { id: bannerId },
      data: {
        status: BannerStatus.FAILED,
        generationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      },
    });

    await refundReservedCredit(usageEventId);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/banners/new");
    revalidatePath("/dashboard/banners");
  }
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit(`banners:generate:${ip}`, {
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

    if (!isAdmin && !workspace.user?.emailVerifiedAt) {
      return NextResponse.json(
        {
          error:
            "Confirme seu e-mail antes de gerar banners. Enviamos um código de verificação para sua caixa de entrada.",
          requiresEmailVerification: true,
          redirectTo: `/verify-email?email=${encodeURIComponent(
            workspace.user?.email || "",
          )}`,
        },
        { status: 403, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const subscriptionPlan = workspace.subscription?.plan || SubscriptionPlan.FREE;
    const requestedQuality =
      payload.quality || getDefaultBannerQuality(subscriptionPlan, isAdmin);

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
    await refundReservedCredit(reservedUsageEventId);

    console.error("Erro ao iniciar geração do banner:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno ao gerar banner.",
      },
      {
        status:
          error instanceof Error &&
          error.message === "Você usou todos os seus créditos deste mês."
            ? 403
            : 500,
        headers: buildRateLimitHeaders(rateLimit),
      },
    );
  }
}
