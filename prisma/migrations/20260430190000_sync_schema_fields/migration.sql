-- Sync Prisma schema fields that exist in schema.prisma but were missing from older migrations.
-- Safe to run on PostgreSQL/Neon. Uses IF NOT EXISTS where possible.

-- BannerStylePreset enum values added after the initial migration.
ALTER TYPE "BannerStylePreset" ADD VALUE IF NOT EXISTS 'FESTIVAL_MAINSTAGE';
ALTER TYPE "BannerStylePreset" ADD VALUE IF NOT EXISTS 'CYBER_RAVE';
ALTER TYPE "BannerStylePreset" ADD VALUE IF NOT EXISTS 'DARK_TECHNO';
ALTER TYPE "BannerStylePreset" ADD VALUE IF NOT EXISTS 'CHROME_FUTURE';
ALTER TYPE "BannerStylePreset" ADD VALUE IF NOT EXISTS 'AFRO_HOUSE_SUNSET';
ALTER TYPE "BannerStylePreset" ADD VALUE IF NOT EXISTS 'Y2K_CLUB';

-- User fields used by auth, owner access, language settings and onboarding.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "preferredLocale" TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS "languageOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Workspace fields used by owner/admin access and workspace creation.
ALTER TABLE "Workspace"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Unique index for optional Workspace.slug. PostgreSQL allows multiple NULL values in a unique index.
CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_slug_key" ON "Workspace"("slug");
