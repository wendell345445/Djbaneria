import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import sharp from "sharp";

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
import { normalizeLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import {
  getClientIp,
  consumeRateLimit,
  buildRateLimitHeaders,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";
import { uploadBannerBuffer } from "@/lib/storage";
import { requireCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

const professionalImageSchema = z.object({
  imageDataUrl: z
    .string()
    .trim()
    .min(50, "invalidImage")
    .refine((value) => value.startsWith("data:image/"), "invalidImage"),
  locale: z.enum(["pt-BR", "en", "es"]).optional(),
  photoDirection: z
    .enum([
      "artist_press",
      "studio_portrait",
      "profile_picture",
      "booking_promo",
      "editorial_artist",
      "lifestyle_dj",
    ])
    .optional()
    .default("artist_press"),
});

const apiCopy = {
  "pt-BR": {
    invalidImage: "Envie uma imagem válida.",
    rateLimit:
      "Muitas tentativas em sequência. Aguarde um pouco e tente novamente.",
    noCredits: "Você usou todos os seus créditos deste mês.",
    inactiveSubscription: "Sua assinatura não está ativa para gerar imagens.",
    missingOpenAi: "OPENAI_API_KEY não foi configurada.",
    invalidData: "Dados inválidos.",
    invalidFormat: "Formato da imagem inválido.",
    emptyImage: "A imagem enviada está vazia.",
    openAiFailed: "Falha ao gerar a imagem profissional.",
    openAiMissingImage: "A OpenAI não retornou a imagem profissional.",
    generic: "Não foi possível gerar a imagem profissional.",
  },
  en: {
    invalidImage: "Upload a valid image.",
    rateLimit: "Too many attempts. Wait a moment and try again.",
    noCredits: "You have used all your credits for this month.",
    inactiveSubscription: "Your subscription is not active for image generation.",
    missingOpenAi: "OPENAI_API_KEY was not configured.",
    invalidData: "Invalid data.",
    invalidFormat: "Invalid image format.",
    emptyImage: "The uploaded image is empty.",
    openAiFailed: "Failed to generate the professional image.",
    openAiMissingImage: "OpenAI did not return the professional image.",
    generic: "Could not generate the professional image.",
  },
  es: {
    invalidImage: "Sube una imagen válida.",
    rateLimit: "Demasiados intentos seguidos. Espera un momento e inténtalo de nuevo.",
    noCredits: "Has usado todos tus créditos de este mes.",
    inactiveSubscription: "Tu suscripción no está activa para generar imágenes.",
    missingOpenAi: "OPENAI_API_KEY no fue configurada.",
    invalidData: "Datos inválidos.",
    invalidFormat: "Formato de imagen inválido.",
    emptyImage: "La imagen enviada está vacía.",
    openAiFailed: "No fue posible generar la imagen profesional.",
    openAiMissingImage: "OpenAI no devolvió la imagen profesional.",
    generic: "No fue posible generar la imagen profesional.",
  },
} as const;

type ApiCopy = (typeof apiCopy)[keyof typeof apiCopy];
type ProfessionalPhotoDirection = z.infer<
  typeof professionalImageSchema
>["photoDirection"];

const professionalPhotoDirectionPrompts: Record<
  ProfessionalPhotoDirection,
  string
> = {
  artist_press:
    "Photo direction: professional artist press photo for official promotion, booking pages, press kits, artist profiles and social media. Use a clean modern background with subtle depth, polished lighting, realistic skin texture and a confident music artist presence.",
  studio_portrait:
    "Photo direction: premium studio portrait with clean professional lighting, soft shadows, balanced contrast and refined background. The image should feel like a real studio photo session for a music artist.",
  profile_picture:
    "Photo direction: strong social media profile picture, clear face visibility, centered framing, suitable for circular crops on Instagram, TikTok, Spotify, SoundCloud and other profiles. Premium, approachable and professional.",
  booking_promo:
    "Photo direction: professional booking promo photo designed to make the DJ look confident, trustworthy, premium and valuable for event organizers, booking pages, event announcements and promotional use.",
  editorial_artist:
    "Photo direction: editorial artist portrait with refined magazine-style lighting, cinematic shadows, sophisticated composition and high-end portfolio appearance. Keep the result realistic and elegant.",
  lifestyle_dj:
    "Photo direction: professional lifestyle DJ photo with a natural, modern, authentic social media feel. Tasteful background, realistic lighting and confident music artist presence without looking overly staged.",
};

function getApiCopy(locale?: string): ApiCopy {
  return apiCopy[normalizeLocale(locale)];
}

function sanitizeForFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
}

function dataUrlToFileParts(dataUrl: string, copy: ApiCopy) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error(copy.invalidFormat);
  }

  const mimeType = match[1] || "image/png";
  const base64 = match[2] || "";
  const buffer = Buffer.from(base64, "base64");

  if (!buffer.byteLength) {
    throw new Error(copy.emptyImage);
  }

  return {
    mimeType,
    buffer,
  };
}

async function getProfessionalImageBillingSummary(
  workspace: Awaited<ReturnType<typeof requireCurrentWorkspace>>,
) {
  const subscription = workspace.subscription;
  const plan = subscription?.plan ?? SubscriptionPlan.FREE;
  const status = subscription?.status ?? SubscriptionStatus.TRIALING;

  const usageDateFilter = getCreditCycleUsageDateFilter({
    providerSubscriptionId: subscription?.providerSubscriptionId,
    currentPeriodStart: subscription?.currentPeriodStart,
    currentPeriodEnd: subscription?.currentPeriodEnd,
  });

  const usageEvents = await prisma.usageEvent.findMany({
    where: {
      workspaceId: workspace.id,
      createdAt: usageDateFilter,
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

  const requiresPaymentConfirmation = requiresCreditCyclePaymentConfirmation({
    plan,
    providerSubscriptionId: subscription?.providerSubscriptionId,
    currentPeriodStart: subscription?.currentPeriodStart,
    currentPeriodEnd: subscription?.currentPeriodEnd,
  });

  const summary = buildBillingSummary({
    plan,
    status,
    usageEvents,
    requiresPaymentConfirmation,
    creditCyclePaymentConfirmed: hasCreditCyclePaymentConfirmation(usageEvents),
  });

  return {
    ...summary,
    isAdmin: isAdminEmail(workspace.user?.email),
  };
}

async function createProfessionalImageFromPhoto(input: {
  imageDataUrl: string;
  workspaceName?: string | null;
  locale?: string;
  photoDirection: ProfessionalPhotoDirection;
}) {
  const copy = getApiCopy(input.locale);
  const { buffer, mimeType } = dataUrlToFileParts(input.imageDataUrl, copy);

  const prompt = [
    "Use a foto enviada como base principal.",
    "Transforme essa foto comum em uma imagem profissional de portfólio para DJ.",
    "Preserve fielmente a identidade da pessoa, rosto, expressão, traços principais, cabelo e estrutura facial.",
    "Mantenha as características reais da foto original.",
    "Melhore iluminação, nitidez, contraste, composição e acabamento visual.",
    "A imagem final deve parecer premium, elegante, forte e pronta para divulgação artística.",
    professionalPhotoDirectionPrompts[input.photoDirection],
    "Prefira enquadramento profissional com rosto inteiro, cabeça inteira e margem de respiro ao redor.",
    "Não corte testa, cabelo, topo da cabeça, orelhas, laterais do rosto, queixo, pescoço ou ombros.",
    "Evite close excessivo e enquadramento apertado.",
    "Não escreva nenhum texto na imagem.",
    "Não adicione logos, marcas d'água, slogans, letras, datas ou elementos tipográficos.",
    input.workspaceName
      ? `Contexto: o workspace/artista se chama ${input.workspaceName}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const formData = new FormData();
  formData.append("model", process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2");
  formData.append("prompt", prompt);
  formData.append("size", "1024x1536");
  formData.append("quality", "medium");
  formData.append("n", "1");
  formData.append(
    "image",
    new Blob([buffer], {
      type: mimeType,
    }),
    "dj-reference-photo.png",
  );

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as {
    data?: Array<{
      b64_json?: string;
    }>;
    error?: {
      message?: string;
    };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || copy.openAiFailed);
  }

  const imageBase64 = data.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error(copy.openAiMissingImage);
  }

  return Buffer.from(imageBase64, "base64");
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit(`professional-image:${ip}`, {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  let locale = "en";
  let copy = getApiCopy(locale);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: copy.rateLimit,
      },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  try {
    const body = await request.json();
    const parsed = professionalImageSchema.safeParse(body);
    locale = parsed.success ? parsed.data.locale ?? "en" : "en";
    copy = getApiCopy(locale);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const message =
        firstIssue?.message === "invalidImage"
          ? copy.invalidImage
          : copy.invalidData;

      return NextResponse.json(
        {
          error: message,
        },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const workspace = await requireCurrentWorkspace();
    const billingSummary = await getProfessionalImageBillingSummary(workspace);

    if (!billingSummary.isAdmin && !billingSummary.canGenerateBanner) {
      return NextResponse.json(
        {
          error:
            billingSummary.remainingCredits <= 0
              ? copy.noCredits
              : copy.inactiveSubscription,
          code:
            billingSummary.remainingCredits <= 0
              ? "NO_CREDITS"
              : "SUBSCRIPTION_INACTIVE",
        },
        { status: 403, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: copy.missingOpenAi },
        { status: 500, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const generatedBuffer = await createProfessionalImageFromPhoto({
      imageDataUrl: parsed.data.imageDataUrl,
      workspaceName: workspace.name,
      locale,
      photoDirection: parsed.data.photoDirection,
    });

    const finalPng = await sharp(generatedBuffer).png().toBuffer();
    const meta = await sharp(finalPng).metadata();

    const filenameBase =
      sanitizeForFileName(`${workspace.name}-professional-photo`) ||
      `professional-photo-${Date.now()}`;
    const key = `workspaces/${workspace.id}/professional-images/${Date.now()}-${filenameBase}.png`;

    const uploaded = await uploadBannerBuffer({
      key,
      body: finalPng,
      contentType: "image/png",
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

    if (!billingSummary.isAdmin) {
      await prisma.usageEvent.create({
        data: {
          workspaceId: workspace.id,
          type: UsageEventType.BANNER_GENERATION,
          units: 1,
          metadata: {
            flow: "professional-image",
            source: "professional-photo-page",
            photoDirection: parsed.data.photoDirection,
            model: process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2",
            createdAt: new Date().toISOString(),
          },
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/imagem-profissional");
    revalidatePath("/dashboard/banners/new");

    return NextResponse.json(
      {
        success: true,
        imageUrl: uploaded.url,
        remainingCredits: billingSummary.isAdmin
          ? null
          : Math.max(billingSummary.remainingCredits - 1, 0),
      },
      { headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    console.error("Erro ao gerar imagem profissional:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : copy.generic,
      },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }
}
