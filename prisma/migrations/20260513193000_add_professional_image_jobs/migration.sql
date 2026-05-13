-- CreateEnum
CREATE TYPE "ProfessionalImageJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ProfessionalImageJob" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "usageEventId" TEXT,
    "status" "ProfessionalImageJobStatus" NOT NULL DEFAULT 'PENDING',
    "inputImageUrl" TEXT,
    "inputImageStorageKey" TEXT,
    "inputMimeType" TEXT,
    "inputSizeBytes" INTEGER,
    "outputImageUrl" TEXT,
    "outputImageStorageKey" TEXT,
    "photoDirection" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "prompt" TEXT,
    "modelName" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 1,
    "width" INTEGER,
    "height" INTEGER,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalImageJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfessionalImageJob_workspaceId_createdAt_idx" ON "ProfessionalImageJob"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ProfessionalImageJob_status_createdAt_idx" ON "ProfessionalImageJob"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ProfessionalImageJob" ADD CONSTRAINT "ProfessionalImageJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
