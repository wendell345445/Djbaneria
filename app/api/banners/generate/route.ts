import { NextResponse } from "next/server";
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
import { buildBillingSummary } from "@/lib/plans";
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

const SERIALIZABLE_ISOLATION_LEVEL = "Serializable" as never;

const CREDIT_EVENT_TYPES = [
  UsageEventType.BANNER_GENERATION,
  UsageEventType.BANNER_EDIT,
  UsageEventType.BANNER_VARIATION,
] as const;

const referenceImageField = z
  .union([
    z.string().trim().url("A URL da imagem de referência precisa ser válida."),
    z.string()
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
  format: z.enum(["POST_FEED", "STORY", "SQUARE", "FLYER"]),
  referenceImageUrl: referenceImageField,
});

type GeneratePayload = z.infer<typeof schema>;

function getSizeForFormat(format: GeneratePayload["format"]) {
  switch (format) {
    case "STORY":
      return "1024x1536";
    case "SQUARE":
      return "1024x1024";
    case "FLYER":
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

    const isAdmin = isAdminEmail(workspace.user?.email);

    const reservation = await reserveGenerationCredit({
      workspaceId: workspace.id,
      plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
      status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
      isAdmin,
    });

    reservedUsageEventId = reservation.usageEventId;

    const payload = parsed.data;
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

    const startedAt = Date.now();
    const generated = await generateBannerImage({
      prompt,
      size,
      referenceImageUrl: payload.referenceImageUrl,
    });

    if (!generated.imageBase64) throw new Error("A OpenAI não retornou a imagem do banner.");

    const imageBuffer = Buffer.from(generated.imageBase64, "base64");
    const finalPng = await sharp(imageBuffer).png().toBuffer();
    const meta = await sharp(finalPng).metadata();

    const filenameBase =
      sanitizeForFileName(`${payload.djName}-${payload.mainText}`) || `banner-${Date.now()}`;
    const key = `workspaces/${workspace.id}/generated-banners/${Date.now()}-${filenameBase}.png`;
    const uploaded = await uploadBannerBuffer({
      key,
      body: finalPng,
      contentType: "image/png",
    });

    const banner = await prisma.banner.create({
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
        revisedPrompt: generated.revisedPrompt || null,
        modelName: generated.modelName,
        status: BannerStatus.COMPLETED,
        referenceImageUrl: payload.referenceImageUrl,
        outputImageUrl: uploaded.url,
        width: meta.width || null,
        height: meta.height || null,
        generationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      },
      select: { id: true, outputImageUrl: true },
    });

    await prisma.asset.create({
      data: {
        workspaceId: workspace.id,
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

    if (reservedUsageEventId) {
      await prisma.usageEvent.update({
        where: { id: reservedUsageEventId },
        data: {
          metadata: {
            status: "confirmed",
            confirmedAt: new Date().toISOString(),
            model: generated.modelName,
            stylePreset: payload.stylePreset,
            format: payload.format,
            bannerId: banner.id,
            isAdminBypass: isAdmin,
          },
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        bannerId: banner.id,
        imageUrl: banner.outputImageUrl,
        bannerUrl: `/dashboard/banners/${banner.id}`,
        remainingCredits: reservation.remainingCreditsAfterReserve,
        isAdminUnlimited: reservation.isAdminUnlimited,
      },
      { headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    if (reservedUsageEventId) {
      try {
        await prisma.usageEvent.delete({ where: { id: reservedUsageEventId } });
      } catch (rollbackError) {
        console.error("Erro ao estornar crédito reservado na geração:", rollbackError);
      }
    }

    console.error("Erro ao gerar banner:", error);

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
