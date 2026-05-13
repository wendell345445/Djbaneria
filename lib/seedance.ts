export type SeedanceResolution = "480" | "720";
export type SeedanceProvider = "atlascloud";

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
  fallbackFrom?: null;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  raw?: unknown;
};

const ATLASCLOUD_API_BASE_URL =
  process.env.ATLASCLOUD_API_BASE_URL || "https://api.atlascloud.ai/api/v1";

const DEFAULT_ATLASCLOUD_SEEDANCE_MODEL =
  "bytedance/seedance-2.0-fast/image-to-video";
const DEFAULT_SEEDANCE_DURATION_SECONDS = 10;
const SEEDANCE_20_MAX_DURATION_SECONDS = 15;
const ATLASCLOUD_DEFAULT_FPS = 24;

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

export function getSeedanceModel(_provider: SeedanceProvider = "atlascloud") {
  return (
    process.env.ATLASCLOUD_SEEDANCE_MODEL ||
    process.env.SEEDANCE_MODEL ||
    DEFAULT_ATLASCLOUD_SEEDANCE_MODEL
  );
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

export const DEFAULT_SEEDANCE_MOTION_PROMPT = `Create a high-end animated DJ/event flyer video from [Image1], matching the level of a premium neon After Effects promo template: staged reveals, bold typography motion, layered light effects, cinematic depth, and a polished final hold.

ABSOLUTE PRESERVATION RULES:
- The output must remain the same flyer, only professionally animated.
- Preserve the original person/artist exactly: face, facial identity, hairstyle, clothing, pose, body shape, expression, lighting direction, and silhouette.
- Preserve all written text exactly as it appears in the flyer. Do not rewrite, correct, translate, remove, duplicate, invent, or replace any letters, numbers, dates, locations, names, logos, or brand elements.
- Preserve the original layout, composition, colors, typography style, logo placement, visual hierarchy, and event information.
- Do not generate a new poster. Do not redesign the flyer. Do not turn the subject into a live-action person.

CHARACTER LOCK RULES:
The artist/person must behave like a locked poster layer, not like a moving human video.
- Keep the character visually stable for the full clip.
- No dancing, walking, turning, head movement, arm movement, hand movement, body sway, dramatic leaning, speaking, blinking, facial expression changes, clothing changes, or pose changes.
- Allow only extremely subtle poster-layer parallax, tiny scale drift, and light/glow passing over the edges of the subject.
- Character motion intensity must stay below 2%. The animation energy should come from typography, lights, particles, frames, background, reflections, and camera/layer motion.

TARGET STYLE:
A premium animated flyer in the style of a professional DJ/nightclub promo made in After Effects:
- bold neon headline reveal
- secondary title/signature reveal
- lower event-details panel drawing on screen
- laser beams, glow sweeps, particles, reflections, haze, and atmospheric light movement
- layered parallax between background, subject, text, borders, foreground smoke, and light streaks
- glossy cyan, electric blue, magenta, pink, violet, gold, or colors matching the original flyer
- clean, controlled, expensive-looking motion, not chaotic AI morphing

10-SECOND MOTION STRUCTURE:
0.0s - 1.0s: Start with the flyer atmosphere alive. Background lights, lasers, haze, particles, and reflections move subtly. The subject is already present and locked, with only soft rim light movement.
1.0s - 2.4s: Reveal the main headline/title as the dominant visual element. Use a masked neon wipe, glow sweep, quick scale-in, soft slide, or light-flare reveal. The exact original text must remain unchanged and readable.
2.4s - 3.8s: Reveal the secondary title/name or supporting text with a more energetic accent: brush-like magenta sweep, electric outline, light streak, glow pulse, or small bounce. Do not warp or rewrite the letters.
3.8s - 5.8s: Build intensity around the flyer. Add moving neon beams, vertical light bars, reflections on the floor, subtle smoke/haze, spark particles, and independent micro-motion on decorative elements.
5.8s - 7.6s: Reveal the bottom event-information area. Draw the frame or border first, then reveal the event details line-by-line or with a clean type-on/mask effect. Keep all details sharp, stable, and legible.
7.6s - 10.0s: Final hero hold. The full flyer is visible, text is readable, subject is stable, lights continue pulsing, particles drift, reflections shimmer, and the camera performs a very subtle push-in or floating drift.

MOTION DESIGN RULES:
- Animate the flyer in layers, not as one flat image.
- The motion should feel designed, timed, and intentional, like a music-event promo template.
- Use microanimation on borders, icons, shapes, background lights, smoke, glow, particles, and reflections.
- Use cinematic parallax and depth, but keep the composition aligned with the original flyer.
- Important text should remain stable long enough to read.
- Avoid relying only on a basic zoom. Avoid boring static motion.

NEGATIVE RULES:
- No face deformation, no body deformation, no hand deformation, no melted text, no fake letters, no new logos, no changed event details, no new background replacing the flyer, no heavy camera spin, no chaotic shake, no extreme zoom, no live-action transformation, no character performance.
- Do not let visual effects cover or hide important text.
- Do not make the video look like a generic AI image-to-video clip. It must look like a professional animated flyer.

FINAL QUALITY TARGET:
The result should feel like a premium, high-converting animated DJ flyer: bold, polished, energetic, clean, neon, cinematic, and highly marketable for nightlife, club events, concerts, festivals, DJs, parties, and social media ads.

Generate a fitting event-promo soundtrack automatically when the provider supports generated audio. The soundtrack should match the neon reveals, headline impact, light pulses, build-up, and final hold while keeping the flyer message clear`;

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
    const errorMessage = normalizeErrorMessage(error);
    const debugPayload =
      process.env.SEEDANCE_DEBUG === "true"
        ? ` | input=${JSON.stringify(getSafeDebugInput(input))}`
        : "";

    throw new Error(`AtlasCloud error: ${errorMessage}${debugPayload}`);
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
  _options?: {
    providerName?: string | null;
    model?: string | null;
  },
) {
  return getAtlasPrediction(predictionId);
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
