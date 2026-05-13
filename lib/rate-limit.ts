import { prisma } from "@/lib/prisma";

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const globalStore = globalThis as typeof globalThis & {
  __djBannerRateLimitStore?: Map<string, Bucket>;
  __djBannerRateLimitDbWarningShown?: boolean;
  __djBannerRateLimitDbLastCleanupAt?: number;
};

const memoryStore = globalStore.__djBannerRateLimitStore ?? new Map<string, Bucket>();
globalStore.__djBannerRateLimitStore = memoryStore;

function now() {
  return Date.now();
}

function cleanupExpiredMemoryBuckets(currentTime: number) {
  if (memoryStore.size < 500) return;

  for (const [key, bucket] of memoryStore.entries()) {
    if (bucket.resetAt <= currentTime) {
      memoryStore.delete(key);
    }
  }
}

function consumeMemoryRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const currentTime = now();
  cleanupExpiredMemoryBuckets(currentTime);

  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= currentTime) {
    const next: Bucket = {
      count: 1,
      resetAt: currentTime + config.windowMs,
    };
    memoryStore.set(key, next);

    return {
      allowed: true,
      remaining: Math.max(config.limit - 1, 0),
      resetAt: next.resetAt,
      retryAfterSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  if (existing.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - currentTime) / 1000),
      ),
    };
  }

  existing.count += 1;
  memoryStore.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(config.limit - existing.count, 0),
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((existing.resetAt - currentTime) / 1000),
    ),
  };
}

function shouldUseDatabaseRateLimit() {
  return process.env.RATE_LIMIT_BACKEND !== "memory";
}

async function cleanupExpiredDatabaseBuckets(currentTime: number) {
  const lastCleanup = globalStore.__djBannerRateLimitDbLastCleanupAt || 0;
  if (currentTime - lastCleanup < 60_000) return;

  globalStore.__djBannerRateLimitDbLastCleanupAt = currentTime;

  await (prisma as any).rateLimitBucket
    .deleteMany({
      where: {
        resetAt: { lte: new Date(currentTime) },
      },
    })
    .catch(() => null);
}

async function consumeDatabaseRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const currentTime = now();
  const resetAt = new Date(currentTime + config.windowMs);

  await cleanupExpiredDatabaseBuckets(currentTime);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const existing = (await (prisma as any).rateLimitBucket.findUnique({
      where: { key },
      select: { key: true, count: true, resetAt: true },
    })) as { key: string; count: number; resetAt: Date } | null;

    if (!existing || existing.resetAt.getTime() <= currentTime) {
      await (prisma as any).rateLimitBucket.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          resetAt,
        },
        update: {
          count: 1,
          resetAt,
        },
      });

      return {
        allowed: true,
        remaining: Math.max(config.limit - 1, 0),
        resetAt: resetAt.getTime(),
        retryAfterSeconds: Math.ceil(config.windowMs / 1000),
      };
    }

    const existingResetAt = existing.resetAt.getTime();
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existingResetAt - currentTime) / 1000),
    );

    if (existing.count >= config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existingResetAt,
        retryAfterSeconds,
      };
    }

    const updated = await (prisma as any).rateLimitBucket.updateMany({
      where: {
        key,
        count: existing.count,
        resetAt: existing.resetAt,
      },
      data: {
        count: { increment: 1 },
      },
    });

    if (updated.count === 1) {
      const nextCount = existing.count + 1;

      return {
        allowed: true,
        remaining: Math.max(config.limit - nextCount, 0),
        resetAt: existingResetAt,
        retryAfterSeconds,
      };
    }
  }

  return consumeMemoryRateLimit(key, config);
}

export function getClientIp(request: Request) {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export async function consumeRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  if (!shouldUseDatabaseRateLimit()) {
    return consumeMemoryRateLimit(key, config);
  }

  try {
    return await consumeDatabaseRateLimit(key, config);
  } catch (error) {
    if (!globalStore.__djBannerRateLimitDbWarningShown) {
      globalStore.__djBannerRateLimitDbWarningShown = true;
      console.warn(
        "Database rate limit unavailable. Falling back to in-memory rate limit. Run the RateLimitBucket migration in production.",
        error,
      );
    }

    return consumeMemoryRateLimit(key, config);
  }
}

export function buildRateLimitHeaders(result: {
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}) {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
    "Retry-After": String(result.retryAfterSeconds),
  };
}
