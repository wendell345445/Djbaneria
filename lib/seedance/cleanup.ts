import { prisma } from "@/lib/prisma";
import { deleteObjectFromR2 } from "@/lib/storage";

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
      failedVideoIds: [] as string[],
    };
  }

  let attemptedObjects = 0;
  let deletedObjects = 0;
  let failedObjects = 0;
  const deletableVideoIds: string[] = [];
  const failedVideoIds: string[] = [];

  for (const video of expiredVideos) {
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
    failedVideoIds,
  };
}
