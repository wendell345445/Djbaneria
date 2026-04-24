type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __djBannerRateLimitStore?: Map<string, Bucket>;
};

const store = globalStore.__djBannerRateLimitStore ?? new Map<string, Bucket>();
globalStore.__djBannerRateLimitStore = store;

function now() {
  return Date.now();
}

function cleanupExpiredBuckets(currentTime: number) {
  if (store.size < 500) return;

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= currentTime) {
      store.delete(key);
    }
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return "unknown";
}

export function consumeRateLimit(key: string, config: RateLimitConfig) {
  const currentTime = now();
  cleanupExpiredBuckets(currentTime);

  const existing = store.get(key);

  if (!existing || existing.resetAt <= currentTime) {
    const next: Bucket = {
      count: 1,
      resetAt: currentTime + config.windowMs,
    };
    store.set(key, next);

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
  store.set(key, existing);

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
