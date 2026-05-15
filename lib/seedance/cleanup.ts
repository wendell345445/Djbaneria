import { prisma } from "@/lib/prisma";
import { deleteObjectFromR2 } from "@/lib/storage";

const COMPLETED_STATUS = "COMPLETED";

function shouldRefundCredits(status?: string | null) {
  return status !== COMPLETED_STATUS;
}

export async function cleanupExpiredSeedanceVideos(params?: {
  workspaceId?: string;
  videoId?: string;
  now?: Date;
  limit?: number;
}) {
  const now = params?.now ?? new Date();
  const limit = Math.min(Math.max(params?.limit ?? 50, 1), 200);

  const expiredVideos = await (prisma as any).seedanceVideo.findMany({
    where: {
      ...(params?.workspaceId ? { workspaceId: params.workspaceId } : {}),
      ...(params?.videoId ? { id: params.videoId } : {}),
      expiresAt: {
        lte: now,
      },
    },
    orderBy: {
      expiresAt: "asc",
    },
    take: limit,
    select: {
      id: true,
      status: true,
      usageEventId: true,
      workspaceId: true,
      inputImageStorageKey: true,
      inputAudioStorageKey: true,
      outputVideoStorageKey: true,
    },
  });

  if (expiredVideos.length === 0) {
    return {
      checkedRows: 0,
      deletedRows: 0,
      skippedRows: 0,
      attemptedObjects: 0,
      deletedObjects: 0,
      failedObjects: 0,
      refundedUsageEvents: 0,
      alreadyRefundedUsageEvents: 0,
      failedRefunds: 0,
      completedVideosKeptCharged: 0,
      failedVideoIds: [] as string[],
      failedRefundVideoIds: [] as string[],
    };
  }

  let attemptedObjects = 0;
  let deletedObjects = 0;
  let failedObjects = 0;
  let refundedUsageEvents = 0;
  let alreadyRefundedUsageEvents = 0;
  let failedRefunds = 0;
  let completedVideosKeptCharged = 0;
  const deletableVideoIds: string[] = [];
  const failedVideoIds: string[] = [];
  const failedRefundVideoIds: string[] = [];

  for (const video of expiredVideos) {
    const videoNeedsRefund = shouldRefundCredits(video.status);

    if (videoNeedsRefund && video.usageEventId) {
      try {
        const refundResult = await prisma.usageEvent.deleteMany({
          where: {
            id: video.usageEventId,
            workspaceId: video.workspaceId,
          },
        });

        if (refundResult.count > 0) {
          refundedUsageEvents += refundResult.count;
        } else {
          alreadyRefundedUsageEvents += 1;
        }
      } catch {
        failedRefunds += 1;
        failedRefundVideoIds.push(video.id);
        continue;
      }
    } else if (!videoNeedsRefund) {
      completedVideosKeptCharged += 1;
    }

    const storageKeys = [
      video.inputImageStorageKey,
      video.inputAudioStorageKey,
      video.outputVideoStorageKey,
    ].filter((key): key is string => Boolean(key));

    const uniqueStorageKeys = Array.from(new Set(storageKeys));
    attemptedObjects += uniqueStorageKeys.length;

    if (uniqueStorageKeys.length === 0) {
      deletableVideoIds.push(video.id);
      continue;
    }

    const deleteResults = await Promise.allSettled(
      uniqueStorageKeys.map((key) => deleteObjectFromR2(key)),
    );

    const successfulDeletes = deleteResults.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const failedDeletes = deleteResults.length - successfulDeletes;

    deletedObjects += successfulDeletes;
    failedObjects += failedDeletes;

    if (failedDeletes === 0) {
      deletableVideoIds.push(video.id);
    } else {
      failedVideoIds.push(video.id);
    }
  }

  const deleted =
    deletableVideoIds.length > 0
      ? await (prisma as any).seedanceVideo.deleteMany({
          where: {
            id: {
              in: deletableVideoIds,
            },
          },
        })
      : { count: 0 };

  return {
    checkedRows: expiredVideos.length,
    deletedRows: deleted.count,
    skippedRows: expiredVideos.length - deleted.count,
    attemptedObjects,
    deletedObjects,
    failedObjects,
    refundedUsageEvents,
    alreadyRefundedUsageEvents,
    failedRefunds,
    completedVideosKeptCharged,
    failedVideoIds,
    failedRefundVideoIds,
  };
}
