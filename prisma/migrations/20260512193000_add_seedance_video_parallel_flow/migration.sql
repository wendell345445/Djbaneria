-- Adds an isolated Seedance video flow without changing the existing Remotion BannerMotion flow.

DO $$
BEGIN
  CREATE TYPE "SeedanceVideoStatus" AS ENUM ('PENDING', 'RENDERING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "SeedanceVideo" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "usageEventId" TEXT,
  "providerName" TEXT NOT NULL DEFAULT 'seedance',
  "providerModel" TEXT,
  "providerJobId" TEXT,
  "providerOutputUrl" TEXT,
  "status" "SeedanceVideoStatus" NOT NULL DEFAULT 'PENDING',
  "inputImageUrl" TEXT NOT NULL,
  "inputImageStorageKey" TEXT,
  "inputAudioUrl" TEXT,
  "inputAudioStorageKey" TEXT,
  "audioOriginalName" TEXT,
  "audioMimeType" TEXT,
  "audioSizeBytes" INTEGER,
  "outputVideoUrl" TEXT,
  "outputVideoStorageKey" TEXT,
  "resolution" TEXT NOT NULL,
  "motionInstructions" TEXT,
  "prompt" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "creditsUsed" INTEGER NOT NULL DEFAULT 0,
  "durationSeconds" INTEGER NOT NULL DEFAULT 10,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SeedanceVideo_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "usageEventId" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "providerName" TEXT NOT NULL DEFAULT 'seedance';
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "providerModel" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "providerJobId" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "providerOutputUrl" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "inputImageStorageKey" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "inputAudioUrl" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "inputAudioStorageKey" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "audioOriginalName" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "audioMimeType" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "audioSizeBytes" INTEGER;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "outputVideoUrl" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "outputVideoStorageKey" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "resolution" TEXT NOT NULL DEFAULT '480';
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "motionInstructions" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "prompt" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "width" INTEGER;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "height" INTEGER;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "creditsUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "durationSeconds" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SeedanceVideo" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  ALTER TABLE "SeedanceVideo"
  ADD CONSTRAINT "SeedanceVideo_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "SeedanceVideo_providerJobId_key" ON "SeedanceVideo"("providerJobId");
CREATE INDEX IF NOT EXISTS "SeedanceVideo_workspaceId_createdAt_idx" ON "SeedanceVideo"("workspaceId", "createdAt");
CREATE INDEX IF NOT EXISTS "SeedanceVideo_status_createdAt_idx" ON "SeedanceVideo"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "SeedanceVideo_expiresAt_idx" ON "SeedanceVideo"("expiresAt");
