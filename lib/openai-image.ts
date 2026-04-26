import sharp from "sharp";

import type { BannerImageQuality } from "@/lib/plans";

export type GenerateBannerInput = {
  prompt: string;
  size: string;
  quality?: BannerImageQuality;
  referenceImageUrl?: string | null;
};

export type EditBannerInput = {
  prompt: string;
  size: string;
  quality?: BannerImageQuality;
  sourceImageUrl: string;
};

const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2";
const OPENAI_DEFAULT_IMAGE_QUALITY =
  (process.env.OPENAI_IMAGE_QUALITY?.trim().toLowerCase() as BannerImageQuality | undefined) ||
  "medium";

function resolveImageQuality(quality?: BannerImageQuality) {
  if (quality === "low" || quality === "medium" || quality === "high") {
    return quality;
  }

  return OPENAI_DEFAULT_IMAGE_QUALITY;
}

export function buildBannerPrompt(params: {
  mainText: string;
  djName: string;
  secondaryText?: string;
  eventDate: string;
  eventLocation: string;
  stylePreset: string;
  format: string;
}) {
  return [
    "Crie um banner promocional premium para DJ, pronto para divulgação profissional.",
    `Estilo visual: ${params.stylePreset}.`,
    `Formato do banner: ${params.format}.`,
    "Use estética de flyer profissional premium, com aparência forte, sofisticada, visual de alto nível e acabamento publicitário.",
    "Renderize todos os textos diretamente na arte, com excelente legibilidade, hierarquia visual forte e composição refinada.",
    "REGRA PRINCIPAL: o texto principal do banner deve ser o TEXTO PRINCIPAL DO BANNER, e não o nome do DJ.",
    `Texto principal do banner: ${params.mainText}.`,
    "O texto principal deve ser o maior destaque da arte, com presença visual dominante, bonita, premium e muito bem integrada ao layout.",
    `Nome do DJ: ${params.djName}.`,
    "O nome do DJ deve aparecer como informação secundária, menor que o texto principal, com boa presença visual, porém sem competir com a manchete principal.",
    params.secondaryText ? `Chamada secundária: ${params.secondaryText}.` : null,
    `Data do evento: ${params.eventDate}.`,
    `Local do evento: ${params.eventLocation}.`,
    "Organize a chamada secundária, data e local em um bloco informativo menor, elegante, bem espaçado e profissional.",
    "Mantenha separação visual clara entre o texto principal, o nome do DJ e o bloco de informações.",
    "Se houver personagem ou foto de referência, mantenha enquadramento profissional, com o personagem um pouco menor na composição para sobrar espaço para a tipografia.",
    "Se houver imagem de referência, preserve ao máximo a identidade visual da pessoa, especialmente rosto, cabeça, cabelo e traços faciais.",
    "Não invente textos extras. Não altere informações. Não adicione marcas d'água.",
    "O resultado deve parecer um flyer profissional premium, bonito, impactante e pronto para postagem ou divulgação.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildBannerEditPrompt(params: {
  mainText: string;
  djName: string;
  secondaryText?: string;
  eventDate: string;
  eventLocation: string;
  stylePreset: string;
  format: string;
  instructions: string;
}) {
  return [
    "Edite este banner existente mantendo a mesma peça como base visual.",
    `Estilo visual base: ${params.stylePreset}.`,
    `Formato do banner: ${params.format}.`,
    `Texto principal do banner: ${params.mainText}.`,
    `Nome do DJ: ${params.djName}.`,
    params.secondaryText ? `Chamada secundária: ${params.secondaryText}.` : null,
    `Data do evento: ${params.eventDate}.`,
    `Local do evento: ${params.eventLocation}.`,
    "Mantenha os textos corretos e legíveis na arte.",
    "Preserve a estrutura profissional do flyer e melhore apenas o que foi solicitado.",
    "Se houver rosto ou personagem na arte, preserve ao máximo a identidade facial e o cabelo.",
    `Solicitação do cliente para alterar a arte: ${params.instructions}.`,
    "Não invente textos extras. Não troque as informações do evento. Não adicione marcas d'água.",
  ]
    .filter(Boolean)
    .join(" ");
}

async function prepareImage(imageBuffer: Buffer, size: string) {
  const [width, height] = size.split("x").map((v) => Number(v));
  const targetWidth = Number.isFinite(width) ? width : 1024;
  const targetHeight = Number.isFinite(height) ? height : 1536;

  return sharp(imageBuffer)
    .resize(targetWidth, targetHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
}

async function loadImageBufferFromInput(source: string) {
  if (source.startsWith("data:image/")) {
    const base64 = source.split(",")[1];
    if (!base64) {
      throw new Error("Imagem base inválida para edição.");
    }

    return Buffer.from(base64, "base64");
  }

  const sourceImageResponse = await fetch(source);
  if (!sourceImageResponse.ok) {
    throw new Error("Não foi possível baixar a imagem base para edição.");
  }

  return Buffer.from(await sourceImageResponse.arrayBuffer());
}

async function callImageEditApi(input: EditBannerInput) {
  const sourceImageBuffer = await loadImageBufferFromInput(input.sourceImageUrl);
  const preparedImage = await prepareImage(sourceImageBuffer, input.size);
  const quality = resolveImageQuality(input.quality);

  const formData = new FormData();
  formData.append("model", OPENAI_IMAGE_MODEL);
  formData.append("prompt", input.prompt);
  formData.append("size", input.size);
  formData.append("quality", quality);
  formData.append("n", "1");
  formData.append(
    "image",
    new File([Uint8Array.from(preparedImage)], "reference.png", {
      type: "image/png",
    }),
  );

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Falha ao editar banner.");
  }

  return {
    imageBase64: data.data?.[0]?.b64_json as string | undefined,
    revisedPrompt: data.data?.[0]?.revised_prompt as string | undefined,
    modelName: OPENAI_IMAGE_MODEL,
  };
}

export async function generateBannerImage(input: GenerateBannerInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  if (input.referenceImageUrl) {
    return callImageEditApi({
      prompt: input.prompt,
      size: input.size,
      quality: input.quality,
      sourceImageUrl: input.referenceImageUrl,
    });
  }

  const quality = resolveImageQuality(input.quality);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt: input.prompt,
      size: input.size,
      quality,
      n: 1,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Falha ao gerar banner.");
  }

  return {
    imageBase64: data.data?.[0]?.b64_json as string | undefined,
    revisedPrompt: data.data?.[0]?.revised_prompt as string | undefined,
    modelName: OPENAI_IMAGE_MODEL,
  };
}

export async function editBannerImage(input: EditBannerInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  return callImageEditApi(input);
}
