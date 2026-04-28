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
import { buildBannerEditPrompt, editBannerImage } from "@/lib/openai-image";
import {
  buildBillingSummary,
  getDefaultBannerQuality,
  isBannerQualityAllowed,
  type BannerImageQuality,
} from "@/lib/plans";
import { isBannerStyleAllowedForPlan } from "@/lib/banner-style-access";
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
  bannerId: z.string().trim().min(1, "Informe o banner que será alterado."),
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
  instructions: z.string().trim().min(2, "Descreva o ajuste desejado."),
  sourceImageUrl: referenceImageField,
});

type EditPayload = z.infer<typeof schema>;

type CreditReservation = {
  usageEventId: string | null;
  remainingCreditsAfterReserve: number;
  isAdminUnlimited: boolean;
};

function getSizeForFormat(format: EditPayload["format"]) {
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

function getPendingModelName() {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2";
}

function getAllowedStorageBaseUrl() {
  const value = process.env.R2_PUBLIC_BASE_URL?.trim();
  return value ? value.replace(/\/+$/, "") : null;
}

function isAllowedSourceUrl(value: string, bannerOutputUrl?: string | null) {
  if (value.startsWith("data:image/")) return true;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;

  const allowedBaseUrl = getAllowedStorageBaseUrl();
  if (allowedBaseUrl && value.startsWith(`${allowedBaseUrl}/`)) return true;
  if (bannerOutputUrl && value === bannerOutputUrl) return true;

  return false;
}

function hasPrismaCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

async function reserveEditCredit(params: {
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
              type: UsageEventType.BANNER_EDIT,
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
    console.error("Erro ao estornar crédito reservado na edição:", error);
  }
}

async function processEditJob(params: {
  bannerId: string;
  sourceBannerId: string;
  workspaceId: string;
  usageEventId: string | null;
  reservation: CreditReservation;
  payload: EditPayload;
  prompt: string;
  size: string;
  quality: BannerImageQuality;
  sourceImageUrl: string;
  isAdmin: boolean;
}) {
  const {
    bannerId,
    sourceBannerId,
    workspaceId,
    usageEventId,
    payload,
    prompt,
    size,
    quality,
    sourceImageUrl,
    isAdmin,
  } = params;

  const startedAt = Date.now();

  try {
    const generated = await editBannerImage({
      prompt,
      size,
      quality,
      sourceImageUrl,
    });

    if (!generated.imageBase64) {
      throw new Error("A OpenAI não retornou a nova imagem do banner.");
    }

    const imageBuffer = Buffer.from(generated.imageBase64, "base64");
    const finalPng = await sharp(imageBuffer).png().toBuffer();
    const meta = await sharp(finalPng).metadata();

    const filenameBase =
      sanitizeForFileName(`${payload.djName}-${payload.mainText}-edit`) ||
      `banner-edit-${Date.now()}`;
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
            sourceBannerId,
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
    console.error("Erro ao processar edição do banner:", error);

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
  const rateLimit = consumeRateLimit(`banners:edit:${ip}`, {
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas edições em sequência. Aguarde um pouco e tente novamente." },
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

    const sourceBanner = await prisma.banner.findFirst({
      where: {
        id: payload.bannerId,
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        outputImageUrl: true,
      },
    });

    if (!sourceBanner) {
      return NextResponse.json(
        { error: "Banner não encontrado." },
        { status: 404, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

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

    const effectiveSourceImageUrl =
      payload.sourceImageUrl || sourceBanner.outputImageUrl || null;

    if (!effectiveSourceImageUrl) {
      throw new Error("Imagem base do banner não encontrada.");
    }

    if (!isAllowedSourceUrl(effectiveSourceImageUrl, sourceBanner.outputImageUrl)) {
      throw new Error("A imagem base informada não é permitida.");
    }

    const reservation = await reserveEditCredit({
      workspaceId: workspace.id,
      plan: subscriptionPlan,
      status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
      isAdmin,
    });

    reservedUsageEventId = reservation.usageEventId;

    const size = getSizeForFormat(payload.format);
    const prompt = buildBannerEditPrompt({
      mainText: payload.mainText,
      djName: payload.djName,
      secondaryText: payload.secondaryText || "",
      eventDate: payload.eventDate,
      eventLocation: payload.eventLocation,
      stylePreset: payload.stylePreset,
      format: payload.format,
      instructions: payload.instructions,
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
        referenceImageUrl: effectiveSourceImageUrl,
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
            sourceBannerId: payload.bannerId,
            stylePreset: payload.stylePreset,
            format: payload.format,
            quality: requestedQuality,
            isAdminBypass: isAdmin,
          },
        },
      });
    }

    after(() =>
      processEditJob({
        bannerId: pendingBanner.id,
        sourceBannerId: payload.bannerId,
        workspaceId: workspace.id,
        usageEventId: reservation.usageEventId,
        reservation,
        payload,
        prompt,
        size,
        quality: requestedQuality,
        sourceImageUrl: effectiveSourceImageUrl,
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

    const creditExhausted =
      error instanceof Error &&
      error.message === "Você usou todos os seus créditos deste mês.";

    if (!creditExhausted) {
      console.error("Erro ao iniciar edição do banner:", error);
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno ao editar banner.",
      },
      {
        status: creditExhausted ? 403 : 500,
        headers: buildRateLimitHeaders(rateLimit),
      },
    );
  }
}
