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
import { buildBannerEditPrompt, editBannerImage } from "@/lib/openai-image";
import { buildBillingSummary } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { uploadBannerBuffer } from "@/lib/storage";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

const TEST_PREVIEW_ONLY = process.env.BANNER_TEST_PREVIEW_ONLY === "true";

const sourceImageField = z
  .string()
  .trim()
  .min(1, "Não foi possível localizar a imagem atual do banner.")
  .refine(
    (value) => value.startsWith("data:image/") || /^https?:\/\//.test(value),
    "A imagem atual do banner é inválida para edição.",
  );

const schema = z.object({
  bannerId: z.string().trim().optional().nullable(),
  sourceImageUrl: sourceImageField,
  instructions: z.string().trim().min(4, "Descreva a alteração desejada com um pouco mais de detalhe."),
  mainText: z.string().trim().min(2, "Informe o texto principal do banner."),
  djName: z.string().trim().min(2, "Informe o nome do DJ."),
  secondaryText: z.string().trim().optional().default(""),
  eventDate: z.string().trim().min(2, "Informe a data do evento."),
  eventLocation: z.string().trim().min(2, "Informe o local do evento."),
  stylePreset: z.enum(["NEON_CLUB", "PREMIUM_BLACK", "SUMMER_VIBES", "MINIMAL_TECHNO", "LUXURY_GOLD"]),
  format: z.enum(["POST_FEED", "STORY", "SQUARE", "FLYER"]),
});

type EditPayload = z.infer<typeof schema>;

function getSizeForFormat(format: EditPayload["format"]) {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
    }

    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const usedThisMonthResult = await prisma.usageEvent.aggregate({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: monthStart },
        type: UsageEventType.BANNER_EDIT,
      },
      _sum: { units: true },
    });

    const summary = buildBillingSummary({
      plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
      status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
      usedThisMonth: usedThisMonthResult._sum.units || 0,
    });

    const isAdmin = isAdminEmail(workspace.user?.email);

    if (!summary.canGenerateBanner && !isAdmin) {
      return NextResponse.json({ error: "Você usou todos os seus créditos deste mês." }, { status: 403 });
    }

    const payload = parsed.data;
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

    const startedAt = Date.now();
    const generated = await editBannerImage({
      prompt,
      size,
      sourceImageUrl: payload.sourceImageUrl,
    });

    if (!generated.imageBase64) {
      return NextResponse.json({ error: "A OpenAI não retornou a nova imagem do banner." }, { status: 500 });
    }

    const imageBuffer = Buffer.from(generated.imageBase64, "base64");
    const finalPng = await sharp(imageBuffer).png().toBuffer();
    const meta = await sharp(finalPng).metadata();

    if (TEST_PREVIEW_ONLY) {
      const previewBase64 = finalPng.toString("base64");

      return NextResponse.json({
        success: true,
        saved: false,
        previewImageUrl: `data:image/png;base64,${previewBase64}`,
        remainingCredits: isAdmin ? 999999 : Math.max(summary.remainingCredits - 1, 0),
        isAdminUnlimited: isAdmin,
      });
    }

    const filenameBase = sanitizeForFileName(`${payload.djName}-${payload.mainText}-edit`) || `banner-edit-${Date.now()}`;
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
        referenceImageUrl: payload.sourceImageUrl,
        outputImageUrl: uploaded.url,
        width: meta.width || null,
        height: meta.height || null,
        generationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
        sourceBannerId: payload.bannerId || null,
        rootBannerId: payload.bannerId || null,
      },
      select: {
        id: true,
        outputImageUrl: true,
      },
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

    await prisma.usageEvent.create({
      data: {
        workspaceId: workspace.id,
        type: UsageEventType.BANNER_EDIT,
        units: 1,
        metadata: {
          model: generated.modelName,
          stylePreset: payload.stylePreset,
          format: payload.format,
          bannerId: banner.id,
          sourceBannerId: payload.bannerId || null,
          isAdminBypass: isAdmin,
        },
      },
    });

    return NextResponse.json({
      success: true,
      bannerId: banner.id,
      imageUrl: banner.outputImageUrl,
      bannerUrl: `/dashboard/banners/${banner.id}`,
      remainingCredits: isAdmin ? 999999 : Math.max(summary.remainingCredits - 1, 0),
      isAdminUnlimited: isAdmin,
    });
  } catch (error) {
    console.error("Erro ao editar banner:", error);

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Erro interno ao editar banner.",
    }, { status: 500 });
  }
}
