export type SeedanceResolution = "480" | "720";
export type SeedanceProvider = "atlascloud" | "atlascloud-kling";

export type SeedancePrediction = {
  id: string;
  status: string;
  output?: unknown;
  error?: unknown;
  logs?: string | null;
  urls?: {
    get?: string;
    cancel?: string;
  };
  provider?: SeedanceProvider;
  model?: string;
  fallbackFrom?: SeedanceProvider | null;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  raw?: unknown;
};

const ATLASCLOUD_API_BASE_URL =
  process.env.ATLASCLOUD_API_BASE_URL || "https://api.atlascloud.ai/api/v1";

const DEFAULT_ATLASCLOUD_SEEDANCE_MODEL =
  "bytedance/seedance-2.0-fast/image-to-video";
const DEFAULT_ATLASCLOUD_KLING_MODEL =
  "kwaivgi/kling-video-o3-pro/image-to-video";
const DEFAULT_SEEDANCE_DURATION_SECONDS = 10;
const DEFAULT_ATLASCLOUD_KLING_DURATION_SECONDS = 10;
const SEEDANCE_20_MAX_DURATION_SECONDS = 15;
const ATLASCLOUD_DEFAULT_FPS = 24;
const ATLAS_KLING_PROMPT_MAX_CHARS = 2450;


function normalizeAtlasCloudToken(value?: string | null) {
  if (!value) return "";

  return value
    .trim()
    .replace(/^Bearer\s+/i, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

function getAtlasCloudToken() {
  return normalizeAtlasCloudToken(
    process.env.ATLASCLOUD_API_KEY ||
      process.env.ATLASCLOUD_TOKEN ||
      process.env.ATLAS_API_KEY ||
      "",
  );
}

export function getSeedanceProvider(): SeedanceProvider {
  return "atlascloud";
}

export function getSeedanceModel(provider: SeedanceProvider = "atlascloud") {
  if (provider === "atlascloud-kling") {
    return (
      process.env.ATLASCLOUD_KLING_MODEL ||
      process.env.KLING_MODEL ||
      DEFAULT_ATLASCLOUD_KLING_MODEL
    );
  }

  return (
    process.env.ATLASCLOUD_SEEDANCE_MODEL ||
    process.env.SEEDANCE_MODEL ||
    DEFAULT_ATLASCLOUD_SEEDANCE_MODEL
  );
}

export function isAtlasKlingFallbackConfigured() {
  const enabled = boolFromEnv(process.env.SEEDANCE_KLING_FALLBACK, true);
  return enabled && Boolean(getAtlasCloudToken());
}

export function supportsSeedanceAudioReference(
  _provider: SeedanceProvider = "atlascloud",
) {
  return false;
}

function readNumberEnv(names: string[], fallback: number) {
  for (const name of names) {
    const value = process.env[name];
    if (value === undefined || value === null || value === "") continue;

    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

export function getSeedanceDurationSeconds(
  overrideSeconds?: number | string | null,
) {
  const parsed =
    typeof overrideSeconds === "number"
      ? overrideSeconds
      : readNumberEnv(
          ["ATLASCLOUD_SEEDANCE_DURATION_SECONDS", "SEEDANCE_DURATION_SECONDS"],
          DEFAULT_SEEDANCE_DURATION_SECONDS,
        );

  if (!Number.isFinite(parsed)) return DEFAULT_SEEDANCE_DURATION_SECONDS;

  return Math.max(
    4,
    Math.min(SEEDANCE_20_MAX_DURATION_SECONDS, Math.round(parsed)),
  );
}

function getAtlasKlingDurationSeconds() {
  const parsed = readNumberEnv(
    ["ATLASCLOUD_KLING_DURATION_SECONDS", "KLING_DURATION_SECONDS"],
    DEFAULT_ATLASCLOUD_KLING_DURATION_SECONDS,
  );

  if (!Number.isFinite(parsed)) return DEFAULT_ATLASCLOUD_KLING_DURATION_SECONDS;

  return Math.max(3, Math.min(15, Math.round(parsed)));
}

function boolFromEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === "true" || value === "1" || value.toLowerCase() === "yes";
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const maybeResponse = error as Error & {
      status?: number;
      body?: unknown;
      response?: { status?: number; statusText?: string; body?: unknown };
    };

    const status = maybeResponse.status || maybeResponse.response?.status;
    const body = maybeResponse.body || maybeResponse.response?.body;

    if (status || body) {
      return `${error.message}${status ? ` (status ${status})` : ""}${
        body
          ? ` | ${typeof body === "string" ? body : JSON.stringify(body)}`
          : ""
      }`;
    }

    return error.message;
  }

  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown provider error";
  }
}

function makeAtlasCompatiblePrompt(prompt: string) {
  return prompt
    .replaceAll("[Image1]", "the uploaded flyer image")
    .replaceAll("@Image1", "the uploaded flyer image")
    .replaceAll("[Audio1]", "")
    .replaceAll("@Audio1", "")
    .split("\n")
    .filter((line) => !line.includes("Audio1"))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}


function compactPromptText(value: string) {
  return value
    .replace(/[\t ]+/g, " ")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function limitAtlasKlingPrompt(prompt: string) {
  const compatiblePrompt = compactPromptText(makeAtlasCompatiblePrompt(prompt));

  if (compatiblePrompt.length <= ATLAS_KLING_PROMPT_MAX_CHARS) {
    return compatiblePrompt;
  }

  const compactBase = compactPromptText(`
Create a premium animated DJ/event flyer video from the uploaded image, inspired by a high-end After Effects promo reveal.
Preserve the original flyer exactly: same person/artist, face, hairstyle, clothing, pose, expression, body proportions, logo, colors, typography, written text, layout, composition, and event information. Do not redesign the flyer, rewrite text, replace elements, invent new details, distort the face/body/hands/logo/typography, or create new artwork.
Keep the person stable and anchored in the same original position. Do not make the person walk, dance, turn, jump, change pose, change expression, move arms/hands, or perform new actions. Only allow subtle light interaction and gentle depth around the subject. The face must remain sharp, stable, recognizable, and consistent.
Camera movement: use a smooth cinematic dolly-in. The camera should slowly approach the flyer from a slightly wider view to a closer premium hero view. Make it feel like a real camera moving forward, not a basic digital zoom. Use controlled forward push-in, subtle depth drift, soft parallax, and gentle perspective energy. No shaking, fast zooming, sudden reframing, rotation, or aggressive perspective changes.
Animate the flyer like a premium layered motion poster. Use smooth parallax, glow sweeps, light streaks, particles, laser beams, haze, reflections, subtle neon pulses, and polished atmosphere. Background, lights, decorative elements, text accents, and effects can move, but the subject should stay mostly fixed.
Use adaptive colors based on the uploaded flyer. Analyze the flyer palette and use dominant colors for lighting and accent colors for glow, particles, lasers, borders, reflections, haze, rim lights, and highlight sweeps. Do not force random neon blue, purple, or gold if they clash.
Reveal the main headline with a clean glow sweep, masked light wipe, subtle slide, or light flare. Animate secondary text with small energetic accents and reveal lower event details with soft border glow or line-by-line motion. Keep all text sharp, readable, correctly positioned, and unchanged.
Treat the video as one continuous shot. No hard cuts, scene changes, background swaps, abrupt transitions, aggressive zoom, fast rotation, face changes, body deformation, text distortion, or chaotic motion.
Final result: cinematic, glossy, modern, high-energy, for DJs, nightlife, concerts, festivals, Reels, TikTok, Stories, and paid ads.
`);

  const optionalMarker = "Optional user complement. Apply only if it is safe and does not conflict with the preservation rules above:";
  const optionalIndex = compatiblePrompt.indexOf(optionalMarker);
  const optionalComplement =
    optionalIndex >= 0
      ? compatiblePrompt.slice(optionalIndex + optionalMarker.length).trim()
      : "";

  const prefix = compactBase + (optionalComplement ? " User motion complement: " : "");
  const remaining = ATLAS_KLING_PROMPT_MAX_CHARS - prefix.length;

  if (remaining > 80 && optionalComplement) {
    return (prefix + optionalComplement.slice(0, remaining)).slice(
      0,
      ATLAS_KLING_PROMPT_MAX_CHARS,
    );
  }

  return compactBase.slice(0, ATLAS_KLING_PROMPT_MAX_CHARS);
}

function requireAtlasCloudToken() {
  const token = getAtlasCloudToken();

  if (!token) {
    throw new Error(
      "Configure ATLASCLOUD_API_KEY para usar Seedance pela AtlasCloud.",
    );
  }

  return token;
}

async function readAtlasJson(response: Response, label: string) {
  const rawText = await response.text();
  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    const bodyText =
      data === null || data === undefined
        ? "sem corpo de resposta"
        : typeof data === "string"
          ? data.slice(0, 1000)
          : JSON.stringify(data);

    if (response.status === 401 && label.startsWith("AtlasCloud")) {
      throw new Error(
        `${label} retornou erro 401 Unauthorized. A AtlasCloud rejeitou a autenticação. Verifique se ATLASCLOUD_API_KEY está configurada com uma chave válida, sem aspas, sem espaços e sem o prefixo Bearer. Resposta: ${bodyText}`,
      );
    }

    throw new Error(`${label} retornou erro ${response.status}: ${bodyText}`);
  }

  return data;
}

function ensureJsonObject(value: unknown, providerLabel: string) {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }

  if (typeof value === "string") {
    throw new Error(
      `${providerLabel} retornou uma resposta não-JSON: ${value.slice(0, 500)}`,
    );
  }

  throw new Error(`${providerLabel} retornou uma resposta vazia ou inválida.`);
}

async function fetchPublicFileAsFile(params: {
  url: string;
  defaultFileName: string;
  contentTypeHint?: string | null;
}) {
  const response = await fetch(params.url, {
    cache: "no-store",
    headers: {
      "user-agent": "Mozilla/5.0 SeedanceUploader",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Não foi possível baixar o arquivo do R2 para enviar à AtlasCloud (${response.status}).`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType =
    response.headers.get("content-type") ||
    params.contentTypeHint ||
    "application/octet-stream";

  return new File([arrayBuffer], params.defaultFileName, {
    type: contentType,
  });
}

function getImageFileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const fileName = pathname.split("/").pop() || "flyer.png";
    return /\./.test(fileName) ? fileName : `${fileName}.png`;
  } catch {
    return "flyer.png";
  }
}

function extractAtlasUploadedUrl(data: unknown) {
  const record = ensureJsonObject(data, "AtlasCloud uploadMedia");
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : null;

  const candidates = [
    nested?.download_url,
    nested?.url,
    nested?.file_url,
    record.download_url,
    record.url,
    record.file_url,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.startsWith("http")) {
      return candidate;
    }
  }

  throw new Error(
    `A AtlasCloud não retornou uma URL de upload válida. Resposta: ${JSON.stringify(record).slice(0, 500)}`,
  );
}

async function uploadR2FileToAtlasStorage(params: {
  sourceUrl: string;
  fileName: string;
  contentTypeHint?: string | null;
}) {
  const token = requireAtlasCloudToken();
  const file = await fetchPublicFileAsFile({
    url: params.sourceUrl,
    defaultFileName: params.fileName,
    contentTypeHint: params.contentTypeHint,
  });

  const formData = new FormData();
  formData.append("file", file, params.fileName);

  const response = await fetch(`${ATLASCLOUD_API_BASE_URL}/model/uploadMedia`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return extractAtlasUploadedUrl(
    await readAtlasJson(response, "AtlasCloud uploadMedia"),
  );
}

export const DEFAULT_SEEDANCE_MOTION_PROMPT = `Create a premium animated DJ/event flyer video from [Image1], inspired by a high-end neon After Effects promo reveal.

Core preservation rules:
- Keep the original flyer identity intact.
- Preserve the same person/artist, face, hairstyle, clothing, pose, expression, logo, colors, typography, written text, layout, composition, and visual hierarchy.
- Do not redesign the flyer, do not rewrite any text, do not replace elements, and do not invent new event information.
- Do not distort the face, body, hands, logo, typography, or important flyer details.

Animation style direction:
The result should not look like a static image with only a basic zoom. Make it feel like the flyer was professionally animated in layers, similar to a modern DJ/event promo made in After Effects.

Use a staged neon flyer reveal when possible:
1. Start with the background, artist/subject, stage lights, neon beams, smoke/haze, and reflective floor already alive with subtle motion.
2. Bring the main headline/title forward with a strong but clean reveal: slight slide, scale, glow sweep, light flare, or masked neon wipe. Keep the exact same text readable and unchanged.
3. Animate the secondary title/name/text group with a quick energetic accent: brush-style sweep, glow pulse, small bounce, or light streak, without warping the letters.
4. Reveal the lower event-information area with a neon frame draw, soft border glow, line-by-line appearance, or subtle type-on feel. Keep all details stable and legible.
5. End with the complete flyer fully visible, with a polished final hold, breathing neon glow, floating particles, and subtle camera drift.

Add independent micro-motion across the design:
- subtle floating movement on decorative elements
- soft pulsing neon glows around titles, borders, lights, and highlights
- animated light streaks, sparkles, particles, laser beams, reflections, and atmospheric haze
- gentle parallax between background, subject, text groups, and foreground elements
- small rhythmic flashes and glow intensity changes that match a DJ/nightclub promo feel
- cinematic push-in or very light camera drift, but never rely only on zoom

Motion quality rules:
- Keep the animation premium, smooth, energetic, and controlled.
- Make the flyer feel alive and dynamic, not fixed or frozen.
- Important text must remain sharp, stable, readable, and unchanged.
- The person/subject must remain recognizable and visually stable.
- Avoid chaotic shaking, excessive morphing, aggressive zoom, face changes, body deformation, text melting, typography glitches, or composition changes.
- Avoid generating a completely new artwork. The final video must look like the same flyer enhanced with professional layered motion design.

Visual target:
A bold neon club/festival promo look with cyan, blue, purple, magenta, pink, gold, or matching flyer colors when appropriate. The animation should feel modern, cinematic, glossy, high-energy, and highly marketable for DJs, nightlife, concerts, parties, and music events.

Generate a fitting event-promo soundtrack automatically when the provider supports generated audio. The soundtrack should match the rhythm of the neon reveals, light pulses, and final hold while keeping the visual message clear.`;

export function buildSeedancePrompt(params: {
  motionInstructions?: string | null;
}) {
  const customInstructions = params.motionInstructions?.trim();

  return [
    DEFAULT_SEEDANCE_MOTION_PROMPT,
    "Output format: keep the same aspect ratio and orientation as the uploaded flyer image. Do not convert Feed to Story or Story to Feed. Do not crop, stretch, expand, add borders, or change the original frame ratio. Animate the uploaded flyer exactly in its native composition.",
    "No external audio reference is provided. Let the AI choose or generate a suitable event-promo soundtrack. Align the motion rhythm with the staged reveal, headline entrance, neon pulses, light sweeps, event-details reveal, and final hold.",
    customInstructions
      ? `Optional user complement. Apply only if it is safe and does not conflict with the preservation rules above: ${customInstructions}`
      : "No extra user complement was provided. Follow only the default motion direction above.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function getAtlasRequestId(data: unknown) {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : null;

  const id =
    nested?.id ||
    nested?.request_id ||
    nested?.requestId ||
    record.id ||
    record.request_id ||
    record.requestId;

  return typeof id === "string" ? id : null;
}

function getAtlasStatus(data: unknown) {
  if (!data || typeof data !== "object") return "processing";
  const record = data as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : null;
  const status = nested?.status || record.status || record.state;

  return typeof status === "string" ? status : "processing";
}

function getAtlasData(data: unknown) {
  if (!data || typeof data !== "object") return data;
  const record = data as Record<string, unknown>;

  return record.data && typeof record.data === "object" ? record.data : record;
}

function getAtlasLogs(data: unknown) {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : null;
  const logs = nested?.logs || record.logs;

  if (typeof logs === "string") return logs;
  if (Array.isArray(logs)) {
    return logs
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "message" in item) {
          const message = (item as { message?: unknown }).message;
          return typeof message === "string" ? message : null;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");
  }

  return null;
}

async function buildAtlasPredictionInput(params: {
  imageUrl: string;
  prompt: string;
  resolution: SeedanceResolution;
  durationSeconds?: number | null;
}) {
  const uploadedImageUrl = await uploadR2FileToAtlasStorage({
    sourceUrl: params.imageUrl,
    fileName: getImageFileNameFromUrl(params.imageUrl),
    contentTypeHint: "image/png",
  });

  const duration = getSeedanceDurationSeconds(params.durationSeconds);
  const prompt = makeAtlasCompatiblePrompt(params.prompt);
  const generateAudio = boolFromEnv(
    process.env.ATLASCLOUD_SEEDANCE_GENERATE_AUDIO,
    true,
  );

  const durationString = String(duration);
  const fpsString = String(
    readNumberEnv(["ATLASCLOUD_SEEDANCE_FPS"], ATLASCLOUD_DEFAULT_FPS),
  );

  return {
    // AtlasCloud's Seedance 2.0 adapter currently requires `content`.
    // Keep `prompt` too because several AtlasCloud docs/examples still show it.
    content: prompt,
    prompt,

    // Keep multiple common image fields because AtlasCloud's public examples are
    // inconsistent across model pages. The required one for I2V is usually
    // `image_url`; `images` helps the multimodal/reference adapter.
    image_url: uploadedImageUrl,
    image: uploadedImageUrl,
    img_url: uploadedImageUrl,
    image_urls: [uploadedImageUrl],
    img_urls: [uploadedImageUrl],
    images: [uploadedImageUrl],

    duration,
    duration_seconds: duration,
    durationString,
    fps: readNumberEnv(["ATLASCLOUD_SEEDANCE_FPS"], ATLASCLOUD_DEFAULT_FPS),
    fpsString,
    resolution: `${params.resolution}p`,
    generate_audio: generateAudio,
    audio: generateAudio,
  };
}

async function buildAtlasKlingPredictionInput(params: {
  imageUrl: string;
  prompt: string;
  resolution: SeedanceResolution;
  durationSeconds?: number | null;
}) {
  const uploadedImageUrl = await uploadR2FileToAtlasStorage({
    sourceUrl: params.imageUrl,
    fileName: getImageFileNameFromUrl(params.imageUrl),
    contentTypeHint: "image/png",
  });

  const prompt = limitAtlasKlingPrompt(params.prompt);
  const duration = getAtlasKlingDurationSeconds();
  const fps = readNumberEnv(
    ["ATLASCLOUD_KLING_FPS", "KLING_FPS"],
    ATLASCLOUD_DEFAULT_FPS,
  );
  const sound = boolFromEnv(process.env.ATLASCLOUD_KLING_SOUND, true);
  const cfgScale = readNumberEnv(
    ["ATLASCLOUD_KLING_CFG_SCALE", "KLING_CFG_SCALE"],
    0.5,
  );
  const negativePrompt =
    process.env.ATLASCLOUD_KLING_NEGATIVE_PROMPT ||
    process.env.KLING_NEGATIVE_PROMPT ||
    "sudden camera shake, aggressive zoom, distorted face, changed identity, warped typography, unreadable text, redesigned flyer, extra text, deformed body, flicker, blur, low quality";

  return {
    prompt,
    content: prompt,
    image: uploadedImageUrl,
    image_url: uploadedImageUrl,
    img_url: uploadedImageUrl,
    image_urls: [uploadedImageUrl],
    img_urls: [uploadedImageUrl],
    images: [uploadedImageUrl],
    duration,
    duration_seconds: duration,
    durationString: String(duration),
    fps,
    fpsString: String(fps),
    resolution: `${params.resolution}p`,
    sound,
    generate_audio: sound,
    audio: sound,
    cfg_scale: cfgScale,
    negative_prompt: negativePrompt,
  };
}

function getSafeDebugInput(input: Record<string, unknown>) {
  return {
    ...input,
    image_url:
      typeof input.image_url === "string"
        ? "uploaded image URL"
        : input.image_url,
    image: typeof input.image === "string" ? "uploaded image URL" : input.image,
    img_url:
      typeof input.img_url === "string" ? "uploaded image URL" : input.img_url,
    image_urls: Array.isArray(input.image_urls)
      ? [`${input.image_urls.length} image URL(s)`]
      : input.image_urls,
    img_urls: Array.isArray(input.img_urls)
      ? [`${input.img_urls.length} image URL(s)`]
      : input.img_urls,
    images: Array.isArray(input.images)
      ? [`${input.images.length} image URL(s)`]
      : input.images,
    content:
      typeof input.content === "string"
        ? `${input.content.slice(0, 600)}${input.content.length > 600 ? "..." : ""}`
        : input.content,
    prompt:
      typeof input.prompt === "string"
        ? `${input.prompt.slice(0, 600)}${input.prompt.length > 600 ? "..." : ""}`
        : input.prompt,
  };
}

async function callAtlasGenerateVideo(params: {
  model: string;
  input: Record<string, unknown>;
}) {
  const token = requireAtlasCloudToken();

  // AtlasCloud's public docs are inconsistent for Seedance models: some
  // examples send fields at the top level, while the model page also shows
  // an `input` object. The runtime error from Seedance indicates the inner
  // adapter requires `content`, so we intentionally send both shapes. This
  // keeps the request compatible even if ATLASCLOUD_PAYLOAD_STYLE was left in
  // the environment from an older test.
  const body = {
    model: params.model,
    ...params.input,
    input: {
      ...params.input,
    },
  };

  const response = await fetch(
    `${ATLASCLOUD_API_BASE_URL}/model/generateVideo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  return readAtlasJson(response, "AtlasCloud generateVideo");
}

async function createAtlasKlingPrediction(params: {
  imageUrl: string;
  prompt: string;
  resolution: SeedanceResolution;
  durationSeconds?: number | null;
  fallbackFrom?: SeedanceProvider | null;
}) {
  const model = getSeedanceModel("atlascloud-kling");
  const input = await buildAtlasKlingPredictionInput(params);

  if (process.env.SEEDANCE_DEBUG === "true") {
    console.log("[Kling/AtlasCloud image-to-video input]", {
      model,
      fallbackFrom: params.fallbackFrom || null,
      sound: Boolean(input.sound),
      durationSeconds: input.duration,
      payloadStyle: "dual-flat-and-input",
      input: getSafeDebugInput(input),
    });
  }

  const submitResult = await callAtlasGenerateVideo({ model, input });
  const data = ensureJsonObject(submitResult, "AtlasCloud Kling");
  const requestId = getAtlasRequestId(data);

  if (!requestId) {
    throw new Error(
      `A AtlasCloud não retornou ID para acompanhar o fallback Kling. Resposta: ${JSON.stringify(data).slice(0, 500)}`,
    );
  }

  return {
    id: requestId,
    status: getAtlasStatus(data),
    output: null,
    error: null,
    logs: getAtlasLogs(data),
    provider: "atlascloud-kling" as const,
    model,
    fallbackFrom: params.fallbackFrom || "atlascloud",
    raw: data,
  } satisfies SeedancePrediction;
}

export async function createKlingFallbackPrediction(params: {
  imageUrl: string;
  prompt: string;
  resolution: SeedanceResolution;
  durationSeconds?: number | null;
  fallbackFrom?: SeedanceProvider | null;
}) {
  if (!isAtlasKlingFallbackConfigured()) {
    throw new Error(
      "Fallback Kling desativado ou ATLASCLOUD_API_KEY ausente. Configure SEEDANCE_KLING_FALLBACK=true e ATLASCLOUD_API_KEY.",
    );
  }

  try {
    return await createAtlasKlingPrediction(params);
  } catch (error) {
    throw new Error(
      `AtlasCloud Kling fallback error: ${normalizeErrorMessage(error)}`,
    );
  }
}

export async function createSeedancePrediction(params: {
  imageUrl: string;
  prompt: string;
  resolution: SeedanceResolution;
  durationSeconds?: number | null;
}) {
  const model = getSeedanceModel("atlascloud");
  const input = await buildAtlasPredictionInput(params);

  if (process.env.SEEDANCE_DEBUG === "true") {
    console.log("[Seedance/AtlasCloud image-to-video input]", {
      model,
      generateAudio: Boolean(input.generate_audio),
      durationSeconds: getSeedanceDurationSeconds(params.durationSeconds),
      payloadStyle: "dual-flat-and-input",
      input: getSafeDebugInput(input),
    });
  }

  try {
    const submitResult = await callAtlasGenerateVideo({ model, input });
    const data = ensureJsonObject(submitResult, "AtlasCloud");
    const requestId = getAtlasRequestId(data);

    if (!requestId) {
      throw new Error(
        `A AtlasCloud não retornou ID para acompanhar a geração. Resposta: ${JSON.stringify(data).slice(0, 500)}`,
      );
    }

    return {
      id: requestId,
      status: getAtlasStatus(data),
      output: null,
      error: null,
      logs: getAtlasLogs(data),
      provider: "atlascloud" as const,
      model,
      fallbackFrom: null,
      raw: data,
    } satisfies SeedancePrediction;
  } catch (error) {
    const seedanceError = normalizeErrorMessage(error);
    const debugPayload =
      process.env.SEEDANCE_DEBUG === "true"
        ? ` | input=${JSON.stringify(getSafeDebugInput(input))}`
        : "";

    if (isAtlasKlingFallbackConfigured()) {
      try {
        const fallbackPrediction = await createAtlasKlingPrediction({
          ...params,
          fallbackFrom: "atlascloud",
        });

        if (process.env.SEEDANCE_DEBUG === "true") {
          console.log(
            "[Seedance fallback] AtlasCloud Seedance failed; started AtlasCloud Kling",
            {
              seedanceError,
              fallbackJobId: fallbackPrediction.id,
              fallbackModel: fallbackPrediction.model,
            },
          );
        }

        return fallbackPrediction;
      } catch (fallbackError) {
        throw new Error(
          `AtlasCloud Seedance error: ${seedanceError}${debugPayload} | AtlasCloud Kling fallback error: ${normalizeErrorMessage(fallbackError)}`,
        );
      }
    }

    throw new Error(`AtlasCloud error: ${seedanceError}${debugPayload}`);
  }
}

async function getAtlasPrediction(requestId: string) {
  const token = requireAtlasCloudToken();
  const predictionUrl = `${ATLASCLOUD_API_BASE_URL}/model/prediction/${encodeURIComponent(
    requestId,
  )}`;

  const response = await fetch(predictionUrl, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let rawData = await readAtlasJson(response, "AtlasCloud prediction");

  const data = getAtlasData(rawData);
  const status = getAtlasStatus(rawData);

  return {
    id: requestId,
    status,
    output: data,
    error:
      data && typeof data === "object"
        ? (data as Record<string, unknown>).error ||
          (data as Record<string, unknown>).message ||
          null
        : null,
    logs: getAtlasLogs(rawData),
    provider: "atlascloud" as const,
    model:
      data &&
      typeof data === "object" &&
      typeof (data as Record<string, unknown>).model === "string"
        ? ((data as Record<string, unknown>).model as string)
        : getSeedanceModel("atlascloud"),
    fallbackFrom: null,
    created_at:
      data &&
      typeof data === "object" &&
      typeof (data as Record<string, unknown>).created_at === "string"
        ? ((data as Record<string, unknown>).created_at as string)
        : undefined,
    completed_at:
      data &&
      typeof data === "object" &&
      typeof (data as Record<string, unknown>).completed_at === "string"
        ? ((data as Record<string, unknown>).completed_at as string)
        : undefined,
    raw: rawData,
  } satisfies SeedancePrediction;
}

export async function getSeedancePrediction(
  predictionId: string,
  options?: {
    providerName?: string | null;
    model?: string | null;
  },
) {
  const prediction = await getAtlasPrediction(predictionId);
  const providerName =
    options?.providerName === "atlascloud-kling"
      ? "atlascloud-kling"
      : "atlascloud";

  return {
    ...prediction,
    provider: providerName,
    model: options?.model || prediction.model || getSeedanceModel(providerName),
  } satisfies SeedancePrediction;
}

function findUrlDeep(value: unknown): string | null {
  if (typeof value === "string" && value.startsWith("http")) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = findUrlDeep(item);
      if (url) return url;
    }

    return null;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const priorityKeys = [
      "outputs",
      "output",
      "url",
      "video_url",
      "video",
      "download_url",
      "uri",
      "data",
    ];

    for (const key of priorityKeys) {
      const url = findUrlDeep(record[key]);
      if (url) return url;
    }

    for (const item of Object.values(record)) {
      const url = findUrlDeep(item);
      if (url) return url;
    }
  }

  return null;
}

export function getSeedanceOutputUrl(output: unknown): string | null {
  return findUrlDeep(output);
}

export function mapReplicateStatusToMotionStatus(status?: string | null) {
  const normalized = status?.toLowerCase();

  switch (normalized) {
    case "succeeded":
    case "completed":
    case "complete":
      return "COMPLETED";
    case "failed":
    case "error":
    case "canceled":
    case "cancelled":
      return "FAILED";
    case "processing":
    case "running":
    case "rendering":
    case "starting":
    case "in_progress":
      return "RENDERING";
    case "in_queue":
    case "queued":
    case "pending":
      return "PENDING";
    default:
      return "PENDING";
  }
}

export function estimateSeedanceProgress(params: {
  status?: string | null;
  createdAt?: Date | string | null;
  currentProgress?: number | null;
}) {
  const normalized = params.status?.toLowerCase();

  if (
    normalized === "succeeded" ||
    normalized === "completed" ||
    normalized === "complete"
  )
    return 100;
  if (
    normalized === "failed" ||
    normalized === "error" ||
    normalized === "canceled" ||
    normalized === "cancelled"
  )
    return 100;

  const current = Number(params.currentProgress || 0);
  const createdAt = params.createdAt
    ? new Date(params.createdAt).getTime()
    : Date.now();
  const elapsedSeconds = Math.max(0, (Date.now() - createdAt) / 1000);

  if (
    normalized === "starting" ||
    normalized === "in_queue" ||
    normalized === "queued" ||
    normalized === "pending"
  ) {
    return Math.max(
      current,
      Math.min(18, Math.round(8 + elapsedSeconds * 0.5)),
    );
  }

  if (
    normalized === "processing" ||
    normalized === "running" ||
    normalized === "rendering" ||
    normalized === "in_progress"
  ) {
    return Math.max(
      current,
      Math.min(92, Math.round(24 + elapsedSeconds * 0.55)),
    );
  }

  return Math.max(current, Math.min(12, Math.round(6 + elapsedSeconds * 0.25)));
}

export async function downloadSeedanceOutput(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Não foi possível baixar o vídeo do Seedance (${response.status}).`,
    );
  }

  const contentType = response.headers.get("content-type") || "video/mp4";
  const arrayBuffer = await response.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
  };
}
