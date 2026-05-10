-- Add the first database layer for animated flyers / motion renders.
-- This migration is written defensively because this project already has
-- a few sync-style migrations using IF NOT EXISTS.

DO $$
BEGIN
  CREATE TYPE "MotionRenderStatus" AS ENUM ('PENDING', 'RENDERING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "MotionPreset" AS ENUM (
    'NEON_PULSE',
    'CLUB_FLASH',
    'CINEMATIC_ZOOM',
    'FESTIVAL_LIGHTS',
    'DARK_TECHNO_GLITCH'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "UsageEventType" ADD VALUE IF NOT EXISTS 'BANNER_MOTION_RENDER';

CREATE TABLE IF NOT EXISTS "BannerMotion" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "bannerId" TEXT NOT NULL,
  "preset" "MotionPreset" NOT NULL,
  "status" "MotionRenderStatus" NOT NULL DEFAULT 'PENDING',
  "inputImageUrl" TEXT NOT NULL,
  "inputAudioUrl" TEXT,
  "inputAudioStorageKey" TEXT,
  "audioOriginalName" TEXT,
  "audioMimeType" TEXT,
  "audioSizeBytes" INTEGER,
  "outputVideoUrl" TEXT,
  "outputVideoStorageKey" TEXT,
  "format" "BannerFormat" NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "durationSeconds" INTEGER NOT NULL DEFAULT 10,
  "renderProgress" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BannerMotion_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "BannerMotion"
    ADD CONSTRAINT "BannerMotion_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "BannerMotion"
    ADD CONSTRAINT "BannerMotion_bannerId_fkey"
    FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "BannerMotion_workspaceId_createdAt_idx" ON "BannerMotion"("workspaceId", "createdAt");
CREATE INDEX IF NOT EXISTS "BannerMotion_bannerId_idx" ON "BannerMotion"("bannerId");
CREATE INDEX IF NOT EXISTS "BannerMotion_status_createdAt_idx" ON "BannerMotion"("status", "createdAt");
