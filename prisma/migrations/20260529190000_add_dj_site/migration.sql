-- CreateTable
CREATE TABLE IF NOT EXISTS "DjSite" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "customDomain" TEXT,
  "artistName" TEXT NOT NULL,
  "headline" TEXT,
  "bio" TEXT,
  "location" TEXT,
  "profileImageUrl" TEXT,
  "coverImageUrl" TEXT,
  "instagramUrl" TEXT,
  "tiktokUrl" TEXT,
  "soundcloudUrl" TEXT,
  "spotifyUrl" TEXT,
  "youtubeUrl" TEXT,
  "whatsappUrl" TEXT,
  "bookingEmail" TEXT,
  "theme" TEXT NOT NULL DEFAULT 'NEON_DARK',
  "accentColor" TEXT DEFAULT '#00F5FF',
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DjSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DjSiteLink" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DjSiteLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DjSiteEvent" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "venue" TEXT,
  "city" TEXT,
  "eventDate" TIMESTAMP(3),
  "ticketUrl" TEXT,
  "flyerUrl" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DjSiteEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DjSite_workspaceId_key" ON "DjSite"("workspaceId");
CREATE UNIQUE INDEX IF NOT EXISTS "DjSite_slug_key" ON "DjSite"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "DjSite_customDomain_key" ON "DjSite"("customDomain");
CREATE INDEX IF NOT EXISTS "DjSite_slug_idx" ON "DjSite"("slug");
CREATE INDEX IF NOT EXISTS "DjSite_workspaceId_idx" ON "DjSite"("workspaceId");
CREATE INDEX IF NOT EXISTS "DjSite_isPublished_idx" ON "DjSite"("isPublished");
CREATE INDEX IF NOT EXISTS "DjSiteLink_siteId_position_idx" ON "DjSiteLink"("siteId", "position");
CREATE INDEX IF NOT EXISTS "DjSiteEvent_siteId_eventDate_idx" ON "DjSiteEvent"("siteId", "eventDate");
CREATE INDEX IF NOT EXISTS "DjSiteEvent_siteId_position_idx" ON "DjSiteEvent"("siteId", "position");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DjSite_workspaceId_fkey'
  ) THEN
    ALTER TABLE "DjSite" ADD CONSTRAINT "DjSite_workspaceId_fkey"
      FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DjSiteLink_siteId_fkey'
  ) THEN
    ALTER TABLE "DjSiteLink" ADD CONSTRAINT "DjSiteLink_siteId_fkey"
      FOREIGN KEY ("siteId") REFERENCES "DjSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DjSiteEvent_siteId_fkey'
  ) THEN
    ALTER TABLE "DjSiteEvent" ADD CONSTRAINT "DjSiteEvent_siteId_fkey"
      FOREIGN KEY ("siteId") REFERENCES "DjSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
