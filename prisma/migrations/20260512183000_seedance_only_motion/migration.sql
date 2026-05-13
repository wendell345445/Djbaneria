-- Seedance-only standalone animated flyer flow.
-- This migration removes the need for the Remotion worker in the isolated
-- /dashboard/flyer-animado flow by storing the external Seedance/Replicate job id.

ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "providerName" TEXT DEFAULT 'seedance';
ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "providerModel" TEXT;
ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "providerJobId" TEXT;
ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "providerOutputUrl" TEXT;

-- Keep the standalone fields safe even if the earlier patch was not executed yet.
ALTER TYPE "MotionPreset" ADD VALUE IF NOT EXISTS 'FESTIVAL_DROP_PRO';
ALTER TYPE "MotionPreset" ADD VALUE IF NOT EXISTS 'VIRAL_REELS_CUT';
ALTER TYPE "MotionPreset" ADD VALUE IF NOT EXISTS 'DARK_TECHNO_RGB';
ALTER TYPE "MotionPreset" ADD VALUE IF NOT EXISTS 'LUXURY_GOLD_CLUB';
ALTER TYPE "MotionPreset" ADD VALUE IF NOT EXISTS 'CYBER_RAVE';

ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "usageEventId" TEXT;
ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "transitionVariant" TEXT NOT NULL DEFAULT 'AUTO';
ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "inputImageStorageKey" TEXT;
ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "resolution" TEXT;
ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "motionInstructions" TEXT;
ALTER TABLE "BannerMotion" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

ALTER TABLE "BannerMotion" ALTER COLUMN "bannerId" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "BannerMotion_providerJobId_key" ON "BannerMotion"("providerJobId");
CREATE INDEX IF NOT EXISTS "BannerMotion_workspaceId_expiresAt_idx" ON "BannerMotion"("workspaceId", "expiresAt");
