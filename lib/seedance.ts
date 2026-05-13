export type SeedanceResolution = "480" | "720";
export type SeedanceProvider = "fal";

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

const DEFAULT_FAL_SEEDANCE_MODEL =
  "fal-ai/bytedance/seedance/v1.5/pro/image-to-video";
const DEFAULT_SEEDANCE_DURATION_SECONDS = 10;
const SEEDANCE_15_MAX_DURATION_SECONDS = 12;
const SEEDANCE_20_MAX_DURATION_SECONDS = 15;

function getFalToken() {
  return process.env.FAL_KEY || process.env.FAL_API_KEY || "";
}

export function getSeedanceProvider(): SeedanceProvider {
  return "fal";
}

export function getSeedanceModel(_provider: SeedanceProvider = "fal") {
  return process.env.FAL_SEEDANCE_MODEL || DEFAULT_FAL_SEEDANCE_MODEL;
}

function isSeedance15Model(model?: string | null) {
  return Boolean(model?.includes("seedance/v1.5"));
}

function getSeedanceMaxDurationSeconds(model = getSeedanceModel()) {
  return isSeedance15Model(model)
    ? SEEDANCE_15_MAX_DURATION_SECONDS
    : SEEDANCE_20_MAX_DURATION_SECONDS;
}

export function supportsSeedanceAudioReference(
  _provider: SeedanceProvider = "fal",
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
  model = getSeedanceModel(),
) {
  const parsed =
    typeof overrideSeconds === "number"
      ? overrideSeconds
      : readNumberEnv(
          ["FAL_SEEDANCE_DURATION_SECONDS", "SEEDANCE_DURATION_SECONDS"],
          DEFAULT_SEEDANCE_DURATION_SECONDS,
        );

  if (!Number.isFinite(parsed)) return DEFAULT_SEEDANCE_DURATION_SECONDS;

  return Math.max(
    4,
    Math.min(getSeedanceMaxDurationSeconds(model), Math.round(parsed)),
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

function makeFalCompatiblePrompt(prompt: string, model = getSeedanceModel()) {
  const withoutAudioReference = prompt
    .replaceAll("[Audio1]", "")
    .split("\n")
    .filter((line) => !line.includes("@Audio1"))
    .join("\n");

  const normalized = isSeedance15Model(model)
    ? withoutAudioReference
        .replaceAll("[Image1]", "the provided flyer image")
        .replaceAll("@Image1", "the provided flyer image")
    : withoutAudioReference.replaceAll("[Image1]", "@Image1");

  return normalized.replace(/\n{3,}/g, "\n\n").trim();
}

async function getFalClient() {
  const token = getFalToken();

  if (!token) {
    throw new Error("Configure FAL_KEY para usar Seedance pela Fal.ai.");
  }

  try {
    const module = (await import("@fal-ai/client")) as {
      fal: {
        config: (options: { credentials: string }) => void;
        queue: {
          submit: (
            endpointId: string,
            options: { input: Record<string, unknown> },
          ) => Promise<unknown>;
          status: (
            endpointId: string,
            options: { requestId: string; logs?: boolean },
          ) => Promise<unknown>;
          result: (
            endpointId: string,
            options: { requestId: string },
          ) => Promise<unknown>;
        };
        storage: {
          upload: (file: File | Blob) => Promise<string>;
        };
      };
    };

    module.fal.config({ credentials: token });
    return module.fal;
  } catch (error) {
    if (error instanceof Error && error.message.includes("@fal-ai/client")) {
      throw new Error(
        "Instale o pacote @fal-ai/client: npm install @fal-ai/client",
      );
    }

    throw error;
  }
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
    "No external audio reference is provided. Let the AI choose or generate a suitable event-promo soundtrack. Align the motion rhythm with the staged reveal, headline entrance, neon pulses, light sweeps, event-details reveal, and final hold.",
    customInstructions
      ? `Optional user complement. Apply only if it is safe and does not conflict with the preservation rules above: ${customInstructions}`
      : "No extra user complement was provided. Follow only the default motion direction above.",
  ]
    .filter(Boolean)
    .join("\n\n");
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
      `Não foi possível baixar o arquivo do R2 para enviar à Fal (${response.status}).`,
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

async function uploadR2FileToFalStorage(params: {
  sourceUrl: string;
  fileName: string;
  contentTypeHint?: string | null;
}) {
  const fal = await getFalClient();
  const file = await fetchPublicFileAsFile({
    url: params.sourceUrl,
    defaultFileName: params.fileName,
    contentTypeHint: params.contentTypeHint,
  });

  return fal.storage.upload(file);
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

async function buildFalPredictionInput(params: {
  imageUrl: string;
  prompt: string;
  resolution: SeedanceResolution;
  durationSeconds?: number | null;
  model: string;
}) {
  const falImageUrl = await uploadR2FileToFalStorage({
    sourceUrl: params.imageUrl,
    fileName: getImageFileNameFromUrl(params.imageUrl),
    contentTypeHint: "image/png",
  });

  const input: Record<string, unknown> = {
    prompt: makeFalCompatiblePrompt(params.prompt, params.model),
    aspect_ratio: process.env.FAL_SEEDANCE_ASPECT_RATIO || "auto",
    resolution: `${params.resolution}p`,
    duration: String(
      getSeedanceDurationSeconds(params.durationSeconds, params.model),
    ),
    generate_audio: boolFromEnv(process.env.FAL_SEEDANCE_GENERATE_AUDIO, true),
  };

  if (isSeedance15Model(params.model)) {
    input.image_url = falImageUrl;
    input.camera_fixed = boolFromEnv(
      process.env.FAL_SEEDANCE_CAMERA_FIXED,
      false,
    );
    input.enable_safety_checker = boolFromEnv(
      process.env.FAL_SEEDANCE_ENABLE_SAFETY_CHECKER,
      true,
    );
  } else {
    input.image_urls = [falImageUrl];
  }

  const seed = process.env.FAL_SEEDANCE_SEED;
  if (seed !== undefined && seed !== "") {
    input.seed = Number(seed);
  }

  return input;
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

function getFalRequestId(data: unknown) {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  const id = record.request_id || record.requestId || record.id;
  return typeof id === "string" ? id : null;
}

function getFalStatus(data: unknown) {
  if (!data || typeof data !== "object") return "IN_QUEUE";
  const record = data as Record<string, unknown>;
  const status = record.status || record.state;

  return typeof status === "string" ? status : "IN_QUEUE";
}

function getFalLogs(data: unknown) {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const logs = record.logs;

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

function getSafeDebugInput(input: Record<string, unknown>) {
  return {
    ...input,
    image_urls: Array.isArray(input.image_urls)
      ? [`${input.image_urls.length} image URL(s)`]
      : input.image_urls,
    image_url:
      typeof input.image_url === "string" ? "1 image URL" : input.image_url,
    prompt:
      typeof input.prompt === "string"
        ? `${input.prompt.slice(0, 600)}${input.prompt.length > 600 ? "..." : ""}`
        : input.prompt,
  };
}

export async function createSeedancePrediction(params: {
  imageUrl: string;
  prompt: string;
  resolution: SeedanceResolution;
  durationSeconds?: number | null;
}) {
  const model = getSeedanceModel("fal");
  const fal = await getFalClient();
  const input = await buildFalPredictionInput({ ...params, model });

  if (process.env.SEEDANCE_DEBUG === "true") {
    console.log("[Seedance/Fal video input]", {
      model,
      generateAudio: Boolean(input.generate_audio),
      durationSeconds: getSeedanceDurationSeconds(
        params.durationSeconds,
        model,
      ),
      input: getSafeDebugInput(input),
    });
  }

  try {
    const submitResult = await fal.queue.submit(model, {
      input,
    });

    const data = ensureJsonObject(submitResult, "Fal.ai");
    const requestId = getFalRequestId(data);

    if (!requestId) {
      throw new Error(
        `A Fal.ai não retornou request_id para acompanhar a geração. Resposta: ${JSON.stringify(data).slice(0, 500)}`,
      );
    }

    return {
      id: requestId,
      status: getFalStatus(data),
      output: null,
      error: null,
      logs: getFalLogs(data),
      provider: "fal" as const,
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

    throw new Error(`Fal.ai error: ${errorMessage}${debugPayload}`);
  }
}

async function getFalPrediction(requestId: string, model?: string | null) {
  const falModel = model || getSeedanceModel("fal");
  const fal = await getFalClient();

  const statusData = ensureJsonObject(
    await fal.queue.status(falModel, {
      requestId,
      logs: true,
    }),
    "Fal.ai",
  );

  const status = getFalStatus(statusData);

  if (status === "COMPLETED") {
    const resultData = ensureJsonObject(
      await fal.queue.result(falModel, {
        requestId,
      }),
      "Fal.ai",
    );

    return {
      id: requestId,
      status: "COMPLETED",
      output: resultData?.data || resultData,
      error: null,
      logs: getFalLogs(resultData) || getFalLogs(statusData),
      provider: "fal" as const,
      model: falModel,
      fallbackFrom: null,
      raw: resultData,
    } satisfies SeedancePrediction;
  }

  return {
    id: requestId,
    status,
    output: null,
    error: statusData?.error || statusData?.message || null,
    logs: getFalLogs(statusData),
    provider: "fal" as const,
    model: falModel,
    fallbackFrom: null,
    raw: statusData,
  } satisfies SeedancePrediction;
}

export async function getSeedancePrediction(
  predictionId: string,
  options?: {
    providerName?: string | null;
    model?: string | null;
  },
) {
  return getFalPrediction(
    predictionId,
    options?.model || getSeedanceModel("fal"),
  );
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
    const priorityKeys = ["url", "video", "output", "uri", "data"];

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
      return "COMPLETED";
    case "failed":
    case "canceled":
    case "cancelled":
      return "FAILED";
    case "processing":
    case "starting":
    case "in_progress":
      return "RENDERING";
    case "in_queue":
    case "queued":
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

  if (normalized === "succeeded" || normalized === "completed") return 100;
  if (
    normalized === "failed" ||
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
    normalized === "queued"
  ) {
    return Math.max(
      current,
      Math.min(18, Math.round(8 + elapsedSeconds * 0.5)),
    );
  }

  if (normalized === "processing" || normalized === "in_progress") {
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
