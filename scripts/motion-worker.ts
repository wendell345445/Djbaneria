import "dotenv/config";

import { existsSync, mkdirSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

import { uploadBufferToR2 } from "../lib/storage";
import sharp from "sharp";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["error"] });

const WORKER_ID = process.env.MOTION_WORKER_ID || `motion-worker-${process.pid}`;
const POLL_INTERVAL_MS = Number(process.env.MOTION_WORKER_POLL_INTERVAL_MS || 5000);
const ROOT_DIR = process.cwd();
const TMP_DIR = resolve(ROOT_DIR, "tmp", "motion-renders");
const REMOTION_ENTRYPOINT = resolve(ROOT_DIR, "remotion", "index.ts");
const COMPOSITION_ID = "MotionFlyer";

// Performance tuning.
// With your upgraded 16GB VPS, start with 3.
// If the VPS has 8 vCPU and remains stable, test 4.
// If it becomes unstable, set MOTION_RENDER_CONCURRENCY=2 in PM2/env.
const RENDER_CONCURRENCY = Number(process.env.MOTION_RENDER_CONCURRENCY || 3);
const STALE_RENDER_MINUTES = Math.max(
  20,
  Number(process.env.MOTION_STALE_RENDER_MINUTES || 35),
);

const isRunOnce = process.argv.includes("--once");

function log(message: string, data?: unknown) {
  const suffix = data === undefined ? "" : ` ${JSON.stringify(data)}`;
  console.log(`[${new Date().toISOString()}] [${WORKER_ID}] ${message}${suffix}`);
}

function sanitizeForKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function releaseStaleRenderingJobs() {
  const resetCount = await (prisma as any).$executeRawUnsafe(`
    UPDATE "BannerMotion"
    SET
      status = 'PENDING',
      "renderProgress" = 0,
      "errorMessage" = 'Render interrompido. O job voltou para a fila automaticamente.',
      "updatedAt" = NOW()
    WHERE status = 'RENDERING'
      AND "updatedAt" < NOW() - INTERVAL '${STALE_RENDER_MINUTES} minutes'
  `);

  if (resetCount > 0) {
    log("stale render jobs returned to queue", { count: resetCount });
  }
}

async function getQueueSnapshot() {
  const rows = (await (prisma as any).$queryRawUnsafe(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PENDING') AS "pendingCount",
      COUNT(*) FILTER (WHERE status = 'RENDERING') AS "renderingCount"
    FROM "BannerMotion"
    WHERE status IN ('PENDING', 'RENDERING')
  `)) as Array<{ pendingCount: bigint | number; renderingCount: bigint | number }>;

  const snapshot = rows[0];

  return {
    pendingCount: Number(snapshot?.pendingCount || 0),
    renderingCount: Number(snapshot?.renderingCount || 0),
  };
}

async function claimNextJob() {
  // Important:
  // This raw SQL claim avoids Prisma enum decoding problems when the DB already has
  // newer preset strings than the generated Prisma client, and it is safe for multiple
  // worker VPS instances because of FOR UPDATE SKIP LOCKED.
  const rows = (await (prisma as any).$queryRawUnsafe(`
    WITH candidate AS (
      SELECT bm.id
      FROM "BannerMotion" bm
      WHERE bm.status = 'PENDING'
      ORDER BY bm."createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE "BannerMotion" bm
    SET
      status = 'RENDERING',
      "renderProgress" = 5,
      "errorMessage" = NULL,
      "updatedAt" = NOW()
    FROM candidate
    WHERE bm.id = candidate.id
    RETURNING
      bm.*,
      (
        SELECT b.title
        FROM "Banner" b
        WHERE b.id = bm."bannerId"
      ) AS "bannerTitle"
  `)) as Array<Record<string, any>>;

  const claimed = rows[0];
  if (!claimed) return null;

  return {
    ...claimed,
    banner: {
      title: claimed.bannerTitle || "motion-flyer",
    },
  };
}

function createProgressReporter(motionId: string) {
  let lastProgress = 0;
  let lastWriteAt = 0;
  let writeQueue = Promise.resolve();

  function setProgress(nextProgress: number, force = false) {
    const progress = clampProgress(nextProgress);
    const now = Date.now();

    if (!force && progress <= lastProgress) return;
    if (!force && now - lastWriteAt < 900 && progress - lastProgress < 3) return;

    lastProgress = progress;
    lastWriteAt = now;

    writeQueue = writeQueue
      .then(() =>
        (prisma as any).bannerMotion.update({
          where: { id: motionId },
          data: { renderProgress: progress },
        }),
      )
      .then(() => undefined)
      .catch((error) => {
        log("could not update render progress", {
          motionId,
          progress,
          error: String(error),
        });
      });
  }

  async function flush() {
    await writeQueue;
  }

  return { setProgress, flush };
}


async function getRemoteImageDimensions(imageUrl: string) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Não foi possível baixar a imagem do flyer para medir dimensões. HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Não foi possível identificar largura/altura reais do flyer.");
  }

  return {
    width: metadata.width,
    height: metadata.height,
  };
}

async function renderMotion(job: any) {
  mkdirSync(TMP_DIR, { recursive: true });

  const outputPath = join(TMP_DIR, `${job.id}.mp4`);
  const durationSeconds = Number(job.durationSeconds || 10);
  const imageDimensions = await getRemoteImageDimensions(job.inputImageUrl);

  log("detected flyer dimensions", {
    motionId: job.id,
    width: imageDimensions.width,
    height: imageDimensions.height,
    storedWidth: job.width,
    storedHeight: job.height,
    format: job.format,
  });

  const props = {
    imageUrl: job.inputImageUrl,
    audioUrl: job.inputAudioUrl || "",
    preset: job.preset || "FESTIVAL_LIGHTS",
    transitionVariant: job.transitionVariant || "AUTO",
    format: job.format || "STORY",
    width: imageDimensions.width,
    height: imageDimensions.height,
    durationSeconds,
  };

  await (prisma as any).bannerMotion
    .update({
      where: { id: job.id },
      data: {
        width: imageDimensions.width,
        height: imageDimensions.height,
      },
    })
    .catch(() => null);

  const progress = createProgressReporter(job.id);
  progress.setProgress(8, true);

  log("bundling remotion project", {
    motionId: job.id,
    renderConcurrency: RENDER_CONCURRENCY,
  });
  const serveUrl = await bundle({
    entryPoint: REMOTION_ENTRYPOINT,
    webpackOverride: (config) => config,
  });

  progress.setProgress(14, true);

  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    inputProps: props,
    timeoutInMilliseconds: 120000,
  });

  progress.setProgress(18, true);

  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    concurrency: RENDER_CONCURRENCY,
    outputLocation: outputPath,
    inputProps: props,
    overwrite: true,
    logLevel: "warn",
    timeoutInMilliseconds: 120000,
    chromiumOptions: {
      disableWebSecurity: true,
    },
    onStart: ({ frameCount, resolvedConcurrency }) => {
      log("render started", {
        motionId: job.id,
        frameCount,
        resolvedConcurrency,
      });
      progress.setProgress(22, true);
    },
    onDownload: (src) => {
      log("downloading media", { motionId: job.id, src });
      return ({ percent }) => {
        if (typeof percent === "number") {
          progress.setProgress(18 + percent * 4);
        }
      };
    },
    onProgress: ({ progress: renderProgress, renderedFrames, encodedFrames, stitchStage }) => {
      const mappedProgress = 22 + renderProgress * 66;
      progress.setProgress(mappedProgress);

      if (stitchStage === "encoding" || stitchStage === "muxing") {
        log("render progress", {
          motionId: job.id,
          percent: clampProgress(mappedProgress),
          renderedFrames,
          encodedFrames,
          stitchStage,
        });
      }
    },
  });

  await progress.flush();
  progress.setProgress(90, true);
  await progress.flush();

  if (!existsSync(outputPath)) {
    throw new Error("O arquivo MP4 não foi gerado pelo Remotion.");
  }

  const buffer = await readFile(outputPath);
  const bannerTitle = sanitizeForKey(job.banner?.title || "motion-flyer") || "motion-flyer";
  const key = `workspaces/${job.workspaceId}/motion-videos/${bannerTitle}-${job.id}.mp4`;

  progress.setProgress(94, true);
  await progress.flush();

  const uploaded = await uploadBufferToR2({
    key,
    body: buffer,
    contentType: "video/mp4",
    cacheControl: "public, max-age=31536000, immutable",
  });

  await (prisma as any).bannerMotion.update({
    where: { id: job.id },
    data: {
      status: "COMPLETED",
      renderProgress: 100,
      outputVideoUrl: uploaded.url,
      outputVideoStorageKey: uploaded.key,
      errorMessage: null,
    },
  });

  await rm(outputPath, { force: true }).catch(() => null);

  log("render completed", { motionId: job.id, outputVideoUrl: uploaded.url });
}

async function refundMotionCredit(job: any) {
  if (!job?.usageEventId) return;

  await prisma.usageEvent.delete({ where: { id: job.usageEventId } }).catch((error) => {
    log("could not refund usage event", {
      motionId: job.id,
      usageEventId: job.usageEventId,
      error: String(error),
    });
  });
}

async function handleJob(job: any) {
  log("claimed job", {
    motionId: job.id,
    preset: job.preset,
    transitionVariant: job.transitionVariant,
  });

  try {
    if (!job.inputImageUrl) {
      throw new Error("Job sem inputImageUrl.");
    }

    await renderMotion(job);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao renderizar vídeo.";
    console.error(error);

    await refundMotionCredit(job);

    await (prisma as any).bannerMotion.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        renderProgress: 100,
        errorMessage: message.slice(0, 1000),
      },
    });

    log("render failed", { motionId: job.id, error: message });
  }
}

async function tick() {
  await releaseStaleRenderingJobs();

  const job = await claimNextJob();

  if (!job) {
    const queue = await getQueueSnapshot();
    log("no pending jobs", queue);
    return;
  }

  await handleJob(job);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada.");
  }

  if (!process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_BASE_URL) {
    throw new Error("R2_BUCKET_NAME/R2_PUBLIC_BASE_URL não configurados.");
  }

  log("worker started", { runOnce: isRunOnce, pollIntervalMs: POLL_INTERVAL_MS });

  if (isRunOnce) {
    await tick();
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  while (true) {
    await tick().catch((error) => {
      console.error(error);
    });

    await sleep(POLL_INTERVAL_MS);
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect().catch(() => null);
  await pool.end().catch(() => null);
  process.exit(1);
});
