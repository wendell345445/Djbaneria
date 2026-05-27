import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";

type BannerGenerationLogLevel = "info" | "warn" | "error";

type BannerGenerationLogInput = {
  bannerId: string;
  workspaceId: string;
  userId?: string | null;
  level?: BannerGenerationLogLevel;
  step: string;
  message: string;
  metadata?: Record<string, unknown> | null;
};

const BLOCKED_METADATA_KEYS = new Set([
  "referenceImageUrl",
  "sourceImageUrl",
  "image",
  "imageBase64",
  "base64",
  "dataUrl",
  "password",
  "token",
  "secret",
  "apiKey",
  "authorization",
]);

function safeString(value: string) {
  if (value.startsWith("data:image/")) return "[data-url-omitted]";
  if (value.length > 600) return `${value.slice(0, 600)}...[truncated]`;
  return value;
}

function safeMetadata(metadata?: Record<string, unknown> | null) {
  if (!metadata) return {};

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => {
      if (BLOCKED_METADATA_KEYS.has(key)) {
        return [key, "[omitted]"];
      }

      if (typeof value === "string") {
        return [key, safeString(value)];
      }

      return [key, value];
    }),
  );
}

export async function logBannerGeneration(input: BannerGenerationLogInput) {
  try {
    await prisma.$executeRaw`
      INSERT INTO "BannerGenerationLog" (
        "id",
        "bannerId",
        "workspaceId",
        "userId",
        "level",
        "step",
        "message",
        "metadata",
        "createdAt"
      )
      VALUES (
        ${randomUUID()},
        ${input.bannerId},
        ${input.workspaceId},
        ${input.userId ?? null},
        ${input.level ?? "info"},
        ${input.step},
        ${input.message},
        ${JSON.stringify(safeMetadata(input.metadata))}::jsonb,
        NOW()
      )
    `;
  } catch (error) {
    // Logging must never break flyer generation.
    console.error("[banner-generation-log] failed to write log", error);
  }
}
