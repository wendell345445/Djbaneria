import "dotenv/config";

import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

import { uploadBufferToR2 } from "../lib/storage";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["error"] });

const WORKER_ID = process.env.MOTION_WORKER_ID || `motion-worker-${process.pid}`;
const POLL_INTERVAL_MS = Number(process.env.MOTION_WORKER_POLL_INTERVAL_MS || 5000);
const ROOT_DIR = process.cwd();
const TMP_DIR = resolve(ROOT_DIR, "tmp", "motion-renders");

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

async function claimNextJob() {
  const pending = await (prisma as any).bannerMotion.findFirst({
    where: { status: "PENDING" },
    include: {
      banner: {
        select: {
          id: true,
          title: true,
          outputImageUrl: true,
          format: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!pending) return null;

  const claimed = await (prisma as any).bannerMotion.updateMany({
    where: {
      id: pending.id,
      status: "PENDING",
    },
    data: {
      status: "RENDERING",
      renderProgress: 8,
      errorMessage: null,
    },
  });

  if (claimed.count !== 1) return null;

  return (prisma as any).bannerMotion.findUnique({
    where: { id: pending.id },
    include: {
      banner: {
        select: {
          id: true,
          title: true,
          outputImageUrl: true,
          format: true,
        },
      },
    },
  });
}

function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolvePromise, rejectPromise) => {
    log(`running command: ${command} ${args.join(" ")}`);

    const child = spawn(command, args, {
      cwd: ROOT_DIR,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`Command failed with exit code ${code}`));
    });
  });
}

async function renderMotion(job: any) {
  mkdirSync(TMP_DIR, { recursive: true });

  const outputPath = join(TMP_DIR, `${job.id}.mp4`);
  const propsPath = join(TMP_DIR, `${job.id}.json`);

  const durationSeconds = Number(job.durationSeconds || 10);
  const props = {
    imageUrl: job.inputImageUrl,
    audioUrl: job.inputAudioUrl || "",
    preset: job.preset || "FESTIVAL_LIGHTS",
    transitionVariant: job.transitionVariant || "AUTO",
    format: job.format || "STORY",
    durationSeconds,
  };

  await writeFile(propsPath, JSON.stringify(props, null, 2), "utf8");

  await (prisma as any).bannerMotion.update({
    where: { id: job.id },
    data: { renderProgress: 18 },
  });

  await runCommand("npx", [
    "remotion",
    "render",
    "remotion/index.ts",
    "MotionFlyer",
    outputPath,
    `--props=${propsPath}`,
    "--overwrite",
    "--log=warn",
  ]);

  await (prisma as any).bannerMotion.update({
    where: { id: job.id },
    data: { renderProgress: 82 },
  });

  if (!existsSync(outputPath)) {
    throw new Error("O arquivo MP4 não foi gerado pelo Remotion.");
  }

  const buffer = await readFile(outputPath);
  const bannerTitle = sanitizeForKey(job.banner?.title || "motion-flyer") || "motion-flyer";
  const key = `workspaces/${job.workspaceId}/motion-videos/${bannerTitle}-${job.id}.mp4`;

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
  await rm(propsPath, { force: true }).catch(() => null);

  log("render completed", { motionId: job.id, outputVideoUrl: uploaded.url });
}

async function refundMotionCredit(job: any) {
  if (!job?.usageEventId) return;

  await prisma.usageEvent.delete({ where: { id: job.usageEventId } }).catch((error) => {
    log("could not refund usage event", { motionId: job.id, usageEventId: job.usageEventId, error: String(error) });
  });
}

async function handleJob(job: any) {
  log("claimed job", { motionId: job.id, preset: job.preset, transitionVariant: job.transitionVariant });

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
  const job = await claimNextJob();

  if (!job) {
    log("no pending jobs");
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
