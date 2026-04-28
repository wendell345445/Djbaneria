import sharp from "sharp";

export type BannerImageQuality = "low" | "medium" | "high";

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

function getOpenAiQuality(quality?: BannerImageQuality) {
  return quality || "high";
}

export function getBannerStyleDirection(stylePreset: string) {
  switch (stylePreset) {
    case "NEON_CLUB":
      return [
        "Style direction: premium neon nightclub flyer.",
        "Visual atmosphere: dark club environment, cyan and magenta neon beams, glossy reflections, smoke haze, energetic nightlife mood.",
        "Typography direction: luminous 3D club lettering, strong glow, clean hierarchy, premium social media flyer finish.",
        "Avoid: cheap rainbow colors, messy text placement, childish neon effects.",
      ].join(" ");

    case "FESTIVAL_MAINSTAGE":
      return [
        "Style direction: massive EDM festival mainstage poster.",
        "Visual atmosphere: huge LED stage, lasers, crowd energy, pyrotechnics, dramatic spotlights, epic scale, international festival mood.",
        "Typography direction: bold headline like a major festival lineup poster, powerful cinematic lighting, high-impact commercial finish.",
        "Avoid: small local party look, empty background, weak stage presence.",
      ].join(" ");

    case "CYBER_RAVE":
      return [
        "Style direction: cyberpunk rave flyer.",
        "Visual atmosphere: futuristic warehouse rave, electric blue, violet, acid green and red accents, glitch particles, laser grids, digital distortion, high-energy underground mood.",
        "Typography direction: futuristic chrome/neon 3D text, glitch accents, sharp tech shapes, premium rave poster composition.",
        "Avoid: cartoon sci-fi, excessive clutter, unreadable text.",
      ].join(" ");

    case "DARK_TECHNO":
      return [
        "Style direction: dark techno and industrial club poster.",
        "Visual atmosphere: black concrete, red strobes, smoky underground warehouse, brutalist lighting, minimal but intense composition, European techno mood.",
        "Typography direction: strong condensed type, clean geometry, aggressive contrast, refined underground editorial finish.",
        "Avoid: colorful summer mood, luxury gold styling, commercial EDM festival look.",
      ].join(" ");

    case "CHROME_FUTURE":
      return [
        "Style direction: chrome futuristic premium artist poster.",
        "Visual atmosphere: black and silver palette, reflective metallic surfaces, holographic blue highlights, clean digital space, polished high-fashion club aesthetic.",
        "Typography direction: shiny chrome 3D lettering, futuristic premium spacing, glossy reflections, editorial sci-fi finish.",
        "Avoid: grunge texture, warm beach colors, overly busy neon background.",
      ].join(" ");

    case "AFRO_HOUSE_SUNSET":
      return [
        "Style direction: Afro house sunset and beach club flyer.",
        "Visual atmosphere: golden sunset, warm amber and terracotta tones, ocean or rooftop ambience, organic elegant lighting, premium Ibiza/Tulum/Miami nightlife mood.",
        "Typography direction: elegant modern lettering with warm glow, refined spacing, tasteful tropical luxury finish.",
        "Avoid: generic summer cartoon style, childish beach icons, excessive neon.",
      ].join(" ");

    case "Y2K_CLUB":
      return [
        "Style direction: Y2K club poster with premium 2000s energy.",
        "Visual atmosphere: glossy pink, blue and silver accents, lens flares, plastic chrome, digital stickers, fashion-club aesthetic, youthful nightlife mood.",
        "Typography direction: bold shiny 3D lettering, playful but polished, social media-ready Y2K flyer composition.",
        "Avoid: cheap retro template, unreadable bubble text, overcrowded sticker layout.",
      ].join(" ");

    case "PREMIUM_BLACK":
      return [
        "Style direction: luxury black editorial flyer.",
        "Visual atmosphere: deep black background, elegant low-key lighting, clean premium nightlife mood, subtle highlights, sophisticated event branding.",
        "Typography direction: refined modern type, strong contrast, minimal premium spacing, high-end club finish.",
        "Avoid: excessive neon, messy textures, casual party style.",
      ].join(" ");

    case "SUMMER_VIBES":
      return [
        "Style direction: vibrant summer party flyer.",
        "Visual atmosphere: warm sunlit energy, saturated colors, beach or rooftop nightlife, tropical highlights, upbeat social party mood.",
        "Typography direction: bold friendly headline, bright premium color accents, energetic but clean composition.",
        "Avoid: dark techno mood, heavy industrial textures, luxury black minimalism.",
      ].join(" ");

    case "MINIMAL_TECHNO":
      return [
        "Style direction: minimal techno poster.",
        "Visual atmosphere: refined dark tones, abstract geometric elements, clean underground layout, negative space, modern electronic mood.",
        "Typography direction: sharp minimal typography, precise alignment, editorial poster hierarchy, very clean premium finish.",
        "Avoid: busy festival lighting, excessive 3D effects, tropical palette.",
      ].join(" ");

    case "LUXURY_GOLD":
      return [
        "Style direction: black and gold luxury event flyer.",
        "Visual atmosphere: premium gold highlights, elegant dark background, champagne glow, exclusive VIP club mood, refined reflections.",
        "Typography direction: gold-accented premium lettering, sophisticated hierarchy, luxury nightlife finish.",
        "Avoid: cheap gold glitter, excessive ornaments, hard-to-read text.",
      ].join(" ");

    default:
      return "Style direction: professional premium DJ promotional flyer, clean hierarchy, strong visual impact, polished international event design.";
  }
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
    `Estilo visual selecionado: ${params.stylePreset}.`,
    getBannerStyleDirection(params.stylePreset),
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
    `Estilo visual base selecionado: ${params.stylePreset}.`,
    getBannerStyleDirection(params.stylePreset),
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

  const formData = new FormData();
  formData.append("model", OPENAI_IMAGE_MODEL);
  formData.append("prompt", input.prompt);
  formData.append("size", input.size);
  formData.append("quality", getOpenAiQuality(input.quality));
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
      quality: getOpenAiQuality(input.quality),
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
