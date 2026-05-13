-- Corrective migration for the isolated animated flyer flow.
-- It keeps the existing BannerMotion worker table, but allows standalone uploads
-- that are not tied to a generated Banner record.

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

CREATE INDEX IF NOT EXISTS "BannerMotion_workspaceId_expiresAt_idx" ON "BannerMotion"("workspaceId", "expiresAt");
