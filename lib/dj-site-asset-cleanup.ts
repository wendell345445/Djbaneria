import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { prisma } from "@/lib/prisma";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials:
    process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        }
      : undefined,
});

type CleanupAsset = {
  id: string;
  workspaceId: string;
  url: string | null;
  storageKey: string | null;
};

function normalizeUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getPublicBaseUrl() {
  return process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") || null;
}

function isDjSiteStorageKey(workspaceId: string, key: string | null | undefined) {
  return typeof key === "string" && key.startsWith(`workspaces/${workspaceId}/dj-sites/`);
}

function storageKeyFromUrl(url: string | null | undefined) {
  if (!url) return null;

  const publicBaseUrl = getPublicBaseUrl();

  if (publicBaseUrl && url.startsWith(`${publicBaseUrl}/`)) {
    return decodeURIComponent(url.slice(publicBaseUrl.length + 1));
  }

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/+/, "");
    return path.length > 0 ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}

function getAssetStorageKey(workspaceId: string, asset: CleanupAsset) {
  if (isDjSiteStorageKey(workspaceId, asset.storageKey)) {
    return asset.storageKey;
  }

  const keyFromUrl = storageKeyFromUrl(asset.url);

  return isDjSiteStorageKey(workspaceId, keyFromUrl) ? keyFromUrl : null;
}

async function deleteR2Object(key: string) {
  const bucket = process.env.R2_BUCKET_NAME;

  if (!bucket) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

async function getUsedDjSiteImageUrls(workspaceId: string) {
  const usedUrls = new Set<string>();

  const sites = await (prisma as any).djSite.findMany({
    where: { workspaceId },
    select: {
      profileImageUrl: true,
      coverImageUrl: true,
      events: {
        select: {
          flyerUrl: true,
        },
      },
    },
  });

  for (const site of sites) {
    const profileImageUrl = normalizeUrl(site.profileImageUrl);
    const coverImageUrl = normalizeUrl(site.coverImageUrl);

    if (profileImageUrl) usedUrls.add(profileImageUrl);
    if (coverImageUrl) usedUrls.add(coverImageUrl);

    if (Array.isArray(site.events)) {
      for (const event of site.events) {
        const flyerUrl = normalizeUrl(event.flyerUrl);
        if (flyerUrl) usedUrls.add(flyerUrl);
      }
    }
  }

  return usedUrls;
}

export async function cleanupUnusedDjSiteAssets(
  workspaceId: string,
  options?: {
    olderThan?: Date;
    maxDelete?: number;
    keepUrls?: Array<string | null | undefined>;
  },
) {
  const usedUrls = await getUsedDjSiteImageUrls(workspaceId);

  for (const url of options?.keepUrls || []) {
    const normalized = normalizeUrl(url);
    if (normalized) usedUrls.add(normalized);
  }

  const assets = (await (prisma as any).asset.findMany({
    where: {
      workspaceId,
      storageProvider: "r2",
      ...(options?.olderThan ? { createdAt: { lt: options.olderThan } } : {}),
      OR: [
        { storageKey: { startsWith: `workspaces/${workspaceId}/dj-sites/` } },
        { url: { contains: `/workspaces/${workspaceId}/dj-sites/` } },
      ],
    },
    select: {
      id: true,
      workspaceId: true,
      url: true,
      storageKey: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: options?.maxDelete || 50,
  })) as CleanupAsset[];

  const unusedAssets = assets.filter((asset) => {
    const assetUrl = normalizeUrl(asset.url);
    return !assetUrl || !usedUrls.has(assetUrl);
  });

  let deleted = 0;
  let failed = 0;
  const errors: Array<{ assetId: string; error: string }> = [];

  for (const asset of unusedAssets) {
    const storageKey = getAssetStorageKey(workspaceId, asset);

    if (!storageKey) {
      failed += 1;
      errors.push({
        assetId: asset.id,
        error: "Missing safe DJ site storage key.",
      });
      continue;
    }

    try {
      await deleteR2Object(storageKey);

      await (prisma as any).asset
        .delete({
          where: { id: asset.id },
        })
        .catch((error: unknown) => {
          console.error("[dj-site-assets] failed to delete asset row", {
            assetId: asset.id,
            error,
          });
        });

      deleted += 1;
    } catch (error) {
      failed += 1;
      errors.push({
        assetId: asset.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    checked: assets.length,
    unused: unusedAssets.length,
    deleted,
    failed,
    errors,
  };
}

export async function cleanupStaleUnusedDjSiteAssets(options?: {
  olderThanHours?: number;
  maxWorkspaces?: number;
  maxDeletePerWorkspace?: number;
}) {
  const olderThan = new Date(
    Date.now() - (options?.olderThanHours || 24) * 60 * 60 * 1000,
  );

  const assets = (await (prisma as any).asset.findMany({
    where: {
      storageProvider: "r2",
      createdAt: { lt: olderThan },
      storageKey: { contains: "/dj-sites/" },
    },
    select: {
      workspaceId: true,
    },
    distinct: ["workspaceId"],
    take: options?.maxWorkspaces || 50,
  })) as Array<{ workspaceId: string }>;

  const results = [];

  for (const asset of assets) {
    const result = await cleanupUnusedDjSiteAssets(asset.workspaceId, {
      olderThan,
      maxDelete: options?.maxDeletePerWorkspace || 50,
    });

    results.push({
      workspaceId: asset.workspaceId,
      ...result,
    });
  }

  return {
    olderThan: olderThan.toISOString(),
    workspaces: results.length,
    checked: results.reduce((sum, item) => sum + item.checked, 0),
    unused: results.reduce((sum, item) => sum + item.unused, 0),
    deleted: results.reduce((sum, item) => sum + item.deleted, 0),
    failed: results.reduce((sum, item) => sum + item.failed, 0),
    results,
  };
}
