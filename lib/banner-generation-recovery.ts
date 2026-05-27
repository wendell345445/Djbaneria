import { BannerStatus, UsageEventType } from "@/generated/prisma/enums";

import { logBannerGeneration } from "@/lib/banner-generation-log";
import { prisma } from "@/lib/prisma";

const DEFAULT_STALE_PENDING_MS = 20 * 60 * 1000;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const REFUNDABLE_BANNER_EVENT_TYPES = [
  UsageEventType.BANNER_GENERATION,
  UsageEventType.BANNER_EDIT,
  UsageEventType.BANNER_VARIATION,
] as const;

type MetadataRecord = Record<string, unknown>;

type RecoveryInput = {
  workspaceId?: string;
  bannerId?: string;
  userId?: string | null;
  olderThanMs?: number;
  limit?: number;
  reason?: string;
};

type RecoveryResult = {
  checked: number;
  recovered: number;
  refunded: number;
  errors: number;
  bannerIds: string[];
};

function getMetadataRecord(metadata: unknown): MetadataRecord {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata as MetadataRecord;
}

async function refundReservedCreditForBanner(params: {
  bannerId: string;
  workspaceId: string;
  userId?: string | null;
  reason: string;
}) {
  const usageEvents = await prisma.usageEvent.findMany({
    where: {
      workspaceId: params.workspaceId,
      type: { in: [...REFUNDABLE_BANNER_EVENT_TYPES] },
      units: { gt: 0 },
    },
    select: {
      id: true,
      units: true,
      type: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  const reservedEvent = usageEvents.find((event) => {
    const metadata = getMetadataRecord(event.metadata);
    const status = String(metadata.status || "");

    return (
      metadata.bannerId === params.bannerId &&
      (status === "reserved" || status === "processing")
    );
  });

  if (!reservedEvent) {
    await logBannerGeneration({
      bannerId: params.bannerId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      level: "warn",
      step: "RECOVERY_CREDIT_EVENT_NOT_FOUND",
      message: "Stale pending banner was recovered, but no refundable UsageEvent was found.",
      metadata: {
        reason: params.reason,
      },
    });

    return false;
  }

  const metadata = getMetadataRecord(reservedEvent.metadata);

  await prisma.usageEvent.update({
    where: { id: reservedEvent.id },
    data: {
      units: 0,
      metadata: {
        ...metadata,
        status: "refunded",
        originalUnits: reservedEvent.units,
        refundedAt: new Date().toISOString(),
        refundReason: params.reason,
        refundedBy: "automatic_stale_pending_recovery",
      },
    },
  });

  await logBannerGeneration({
    bannerId: params.bannerId,
    workspaceId: params.workspaceId,
    userId: params.userId,
    step: "RECOVERY_CREDIT_REFUNDED",
    message: "Reserved credit was refunded for stale pending banner.",
    metadata: {
      usageEventId: reservedEvent.id,
      usageEventType: reservedEvent.type,
      originalUnits: reservedEvent.units,
      reason: params.reason,
    },
  });

  return true;
}

export async function recoverStalePendingBanners(input: RecoveryInput = {}) {
  const olderThanMs = input.olderThanMs ?? DEFAULT_STALE_PENDING_MS;
  const limit = Math.max(1, Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT));
  const reason = input.reason || "stale_pending_banner_without_output_image";
  const staleBefore = new Date(Date.now() - olderThanMs);

  const banners = await prisma.banner.findMany({
    where: {
      ...(input.workspaceId ? { workspaceId: input.workspaceId } : {}),
      ...(input.bannerId ? { id: input.bannerId } : {}),
      status: BannerStatus.PENDING,
      outputImageUrl: null,
      createdAt: { lt: staleBefore },
    },
    select: {
      id: true,
      workspaceId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });

  const result: RecoveryResult = {
    checked: banners.length,
    recovered: 0,
    refunded: 0,
    errors: 0,
    bannerIds: [],
  };

  for (const banner of banners) {
    try {
      await logBannerGeneration({
        bannerId: banner.id,
        workspaceId: banner.workspaceId,
        userId: input.userId,
        level: "warn",
        step: "RECOVERY_STALE_PENDING_DETECTED",
        message: "Stale PENDING banner without output image detected.",
        metadata: {
          title: banner.title,
          createdAt: banner.createdAt.toISOString(),
          updatedAt: banner.updatedAt.toISOString(),
          reason,
        },
      });

      const updated = await prisma.banner.updateMany({
        where: {
          id: banner.id,
          workspaceId: banner.workspaceId,
          status: BannerStatus.PENDING,
          outputImageUrl: null,
        },
        data: {
          status: BannerStatus.FAILED,
          generationSeconds: Math.max(
            1,
            Math.round((Date.now() - banner.createdAt.getTime()) / 1000),
          ),
        },
      });

      if (updated.count === 0) continue;

      result.recovered += 1;
      result.bannerIds.push(banner.id);

      await logBannerGeneration({
        bannerId: banner.id,
        workspaceId: banner.workspaceId,
        userId: input.userId,
        level: "warn",
        step: "RECOVERY_MARKED_FAILED",
        message: "Stale pending banner was marked as FAILED.",
        metadata: {
          reason,
        },
      });

      const refunded = await refundReservedCreditForBanner({
        bannerId: banner.id,
        workspaceId: banner.workspaceId,
        userId: input.userId,
        reason,
      });

      if (refunded) result.refunded += 1;
    } catch (error) {
      result.errors += 1;
      console.error("[banner-generation-recovery] failed", {
        bannerId: banner.id,
        error,
      });

      await logBannerGeneration({
        bannerId: banner.id,
        workspaceId: banner.workspaceId,
        userId: input.userId,
        level: "error",
        step: "RECOVERY_FAILED",
        message: error instanceof Error ? error.message : "Unknown recovery error.",
        metadata: {
          reason,
        },
      });
    }
  }

  return result;
}
