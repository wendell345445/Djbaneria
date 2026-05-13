import { prisma } from "@/lib/prisma";
import { deleteObjectFromR2 } from "@/lib/storage";

const COMPLETED_STATUS = "COMPLETED";
const REMOTION_UPLOAD_MODEL = "user-upload-remotion";
const DEFAULT_RETENTION_HOURS = 24;

function shouldRefundCredits(status?: string | null) {
  return status !== COMPLETED_STATUS;
}

function getCutoffDate(params?: { now?: Date; retentionHours?: number }) {
  const now = params?.now ?? new Date();
  const retentionHours = Math.max(1, params?.retentionHours ?? DEFAULT_RETENTION_HOURS);

  return new Date(now.getTime() - retentionHours * 60 * 60 * 1000);
}

function uniqueKeys(keys: Array<string | null | undefined>) {
  return Array.from(new Set(keys.filter((key): key is string => Boolean(key))));
}

function getStorageKeyFromPublicUrl(url?: string | null) {
  if (!url) return null;

  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!publicBaseUrl) return null;

  if (!url.startsWith(`${publicBaseUrl}/`)) return null;

  return decodeURIComponent(url.slice(publicBaseUrl.length + 1));
}

export async function cleanupExpiredRemotionAssets(params?: {
  workspaceId?: string;
  motionId?: string;
  now?: Date;
  retentionHours?: number;
  limit?: number;
}) {
  const cutoffDate = getCutoffDate({
    now: params?.now,
    retentionHours: params?.retentionHours,
  });
  const limit = Math.min(Math.max(params?.limit ?? 50, 1), 200);

  const expiredMotions = await (prisma as any).bannerMotion.findMany({
    where: {
      ...(params?.workspaceId ? { workspaceId: params.workspaceId } : {}),
      ...(params?.motionId ? { id: params.motionId } : {}),
      createdAt: { lte: cutoffDate },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      status: true,
      usageEventId: true,
      inputAudioStorageKey: true,
      outputVideoStorageKey: true,
    },
  });

  let checkedMotionRows = expiredMotions.length;
  let deletedMotionRows = 0;
  let skippedMotionRows = 0;
  let attemptedObjects = 0;
  let deletedObjects = 0;
  let failedObjects = 0;
  let refundedUsageEvents = 0;
  let alreadyRefundedUsageEvents = 0;
  let failedRefunds = 0;
  let completedVideosKeptCharged = 0;
  const failedMotionIds: string[] = [];
  const failedRefundMotionIds: string[] = [];

  for (const motion of expiredMotions) {
    const motionNeedsRefund = shouldRefundCredits(motion.status);

    if (motionNeedsRefund && motion.usageEventId) {
      try {
        const refundResult = await prisma.usageEvent.deleteMany({
          where: { id: motion.usageEventId },
        });

        if (refundResult.count > 0) {
          refundedUsageEvents += refundResult.count;
        } else {
          alreadyRefundedUsageEvents += 1;
        }
      } catch {
        failedRefunds += 1;
        failedRefundMotionIds.push(motion.id);
        skippedMotionRows += 1;
        continue;
      }
    } else if (!motionNeedsRefund) {
      completedVideosKeptCharged += 1;
    }

    const storageKeys = uniqueKeys([
      motion.inputAudioStorageKey,
      motion.outputVideoStorageKey,
    ]);

    attemptedObjects += storageKeys.length;

    if (storageKeys.length > 0) {
      const deleteResults = await Promise.allSettled(
        storageKeys.map((key) => deleteObjectFromR2(key)),
      );

      const successfulDeletes = deleteResults.filter(
        (result) => result.status === "fulfilled",
      ).length;
      const failedDeletes = deleteResults.length - successfulDeletes;

      deletedObjects += successfulDeletes;
      failedObjects += failedDeletes;

      if (failedDeletes > 0) {
        failedMotionIds.push(motion.id);
        skippedMotionRows += 1;
        continue;
      }
    }

    const deleted = await (prisma as any).bannerMotion.deleteMany({
      where: { id: motion.id },
    });
    deletedMotionRows += deleted.count;
  }

  const expiredUploadBanners = await prisma.banner.findMany({
    where: {
      ...(params?.workspaceId ? { workspaceId: params.workspaceId } : {}),
      modelName: REMOTION_UPLOAD_MODEL,
      createdAt: { lte: cutoffDate },
      motionRenders: {
        none: {},
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      workspaceId: true,
      referenceImageUrl: true,
      outputImageUrl: true,
    },
  });

  let checkedUploadRows = expiredUploadBanners.length;
  let deletedUploadRows = 0;
  let skippedUploadRows = 0;
  const failedUploadBannerIds: string[] = [];

  for (const banner of expiredUploadBanners) {
    const assetUrls = uniqueKeys([banner.outputImageUrl, banner.referenceImageUrl]);
    const relatedAssets = assetUrls.length
      ? await prisma.asset.findMany({
          where: {
            workspaceId: banner.workspaceId,
            url: { in: assetUrls },
          },
          select: {
            id: true,
            storageKey: true,
            url: true,
          },
        })
      : [];

    const storageKeys = uniqueKeys([
      ...relatedAssets.map((asset) => asset.storageKey),
      getStorageKeyFromPublicUrl(banner.outputImageUrl),
      getStorageKeyFromPublicUrl(banner.referenceImageUrl),
    ]);

    attemptedObjects += storageKeys.length;

    if (storageKeys.length > 0) {
      const deleteResults = await Promise.allSettled(
        storageKeys.map((key) => deleteObjectFromR2(key)),
      );

      const successfulDeletes = deleteResults.filter(
        (result) => result.status === "fulfilled",
      ).length;
      const failedDeletes = deleteResults.length - successfulDeletes;

      deletedObjects += successfulDeletes;
      failedObjects += failedDeletes;

      if (failedDeletes > 0) {
        failedUploadBannerIds.push(banner.id);
        skippedUploadRows += 1;
        continue;
      }
    }

    if (relatedAssets.length > 0) {
      await prisma.asset.deleteMany({
        where: { id: { in: relatedAssets.map((asset) => asset.id) } },
      });
    }

    const deleted = await prisma.banner.deleteMany({
      where: {
        id: banner.id,
        modelName: REMOTION_UPLOAD_MODEL,
      },
    });
    deletedUploadRows += deleted.count;
  }

  return {
    retentionHours: params?.retentionHours ?? DEFAULT_RETENTION_HOURS,
    cutoffDate: cutoffDate.toISOString(),
    checkedMotionRows,
    deletedMotionRows,
    skippedMotionRows,
    checkedUploadRows,
    deletedUploadRows,
    skippedUploadRows,
    attemptedObjects,
    deletedObjects,
    failedObjects,
    refundedUsageEvents,
    alreadyRefundedUsageEvents,
    failedRefunds,
    completedVideosKeptCharged,
    failedMotionIds,
    failedRefundMotionIds,
    failedUploadBannerIds,
  };
}
