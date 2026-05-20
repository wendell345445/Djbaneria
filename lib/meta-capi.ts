import crypto from "node:crypto";

export type MetaCapiEventName =
  | "CompleteRegistration"
  | "Lead"
  | "InitiateCheckout"
  | "Subscribe"
  | "Purchase";

type MetaConversionEventInput = {
  eventName: MetaCapiEventName;
  eventId?: string | null;
  email?: string | null;
  value?: number | null;
  currency?: string | null;
  contentName?: string | null;
  contentCategory?: string | null;
  eventSourceUrl?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  externalId?: string | null;
  customData?: Record<string, unknown>;
};

type MetaCapiResponse = {
  success: boolean;
  skipped?: boolean;
  error?: string;
};

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
const META_CAPI_ACCESS_TOKEN =
  process.env.META_CAPI_ACCESS_TOKEN?.trim() ||
  process.env.META_ACCESS_TOKEN?.trim();
const META_GRAPH_API_VERSION =
  process.env.META_GRAPH_API_VERSION?.trim() || "v25.0";
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE?.trim();

export async function sendMetaConversionEvent(
  input: MetaConversionEventInput,
): Promise<MetaCapiResponse> {
  if (!META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) {
    return {
      success: false,
      skipped: true,
      error: "Meta CAPI is not configured.",
    };
  }

  const eventId = input.eventId?.trim() || null;
  const eventTimeMs = Date.now();
  const eventTimeSeconds = Math.floor(eventTimeMs / 1000);
  const sanitizedFbp = sanitizeMetaBrowserId(input.fbp);
  const sanitizedFbc = sanitizeFbc(input.fbc, eventTimeMs);

  if (input.eventName === "CompleteRegistration" && !eventId) {
    console.warn(
      "Meta CAPI CompleteRegistration skipped: missing eventId for Pixel/CAPI deduplication.",
    );

    return {
      success: false,
      skipped: true,
      error: "CompleteRegistration requires eventId for Pixel/CAPI deduplication.",
    };
  }

  const customData: Record<string, unknown> = {
    ...input.customData,
  };

  if (typeof input.value === "number") customData.value = input.value;
  if (input.currency) customData.currency = input.currency;
  if (input.contentName) customData.content_name = input.contentName;
  if (input.contentCategory) {
    customData.content_category = input.contentCategory;
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: eventTimeSeconds,
        event_id: eventId || createServerMetaEventId(input.eventName),
        action_source: "website",
        event_source_url:
          input.eventSourceUrl || process.env.NEXT_PUBLIC_APP_URL || undefined,
        user_data: removeEmptyObjectValues({
          em: input.email ? [sha256(input.email)] : undefined,
          external_id: input.externalId ? [sha256(input.externalId)] : undefined,
          client_ip_address: input.clientIpAddress || undefined,
          client_user_agent: input.clientUserAgent || undefined,
          fbp: sanitizedFbp || undefined,
          fbc: sanitizedFbc || undefined,
        }),
        custom_data: removeEmptyObjectValues(customData),
      },
    ],
  };

  if (META_TEST_EVENT_CODE) {
    payload.test_event_code = META_TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_CAPI_ACCESS_TOKEN)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      console.error("Meta CAPI failed:", data || response.statusText);
      return {
        success: false,
        error:
          typeof data?.error?.message === "string"
            ? data.error.message
            : response.statusText,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Meta CAPI request error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Meta CAPI request failed.",
    };
  }
}

export type MetaBrowserTrackingInput = {
  fbp?: unknown;
  fbc?: unknown;
  fbclid?: unknown;
  eventSourceUrl?: unknown;
};

export function getMetaRequestContext(
  request: Request,
  browserFallback: MetaBrowserTrackingInput = {},
) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const fbclid =
    sanitizeFbclid(cookies.dj_fbclid) ||
    sanitizeFbclid(browserFallback.fbclid);
  const fbc =
    sanitizeFbc(cookies._fbc) ||
    sanitizeFbc(browserFallback.fbc) ||
    (fbclid ? buildFbcFromFbclid(fbclid) : null);

  return {
    eventSourceUrl:
      sanitizeMetaEventSourceUrl(browserFallback.eventSourceUrl, request) ||
      sanitizeMetaEventSourceUrl(request.headers.get("referer"), request) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      null,
    clientIpAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null,
    clientUserAgent: request.headers.get("user-agent"),
    fbp:
      sanitizeMetaBrowserId(cookies._fbp) ||
      sanitizeMetaBrowserId(browserFallback.fbp),
    fbc,
    fbclid,
    utmSource: safeCookieValue(cookies.dj_utm_source),
    utmMedium: safeCookieValue(cookies.dj_utm_medium),
    utmCampaign: safeCookieValue(cookies.dj_utm_campaign),
    utmContent: safeCookieValue(cookies.dj_utm_content),
    utmTerm: safeCookieValue(cookies.dj_utm_term),
    lastUtmSource: safeCookieValue(cookies.dj_last_utm_source),
    lastUtmMedium: safeCookieValue(cookies.dj_last_utm_medium),
    lastUtmCampaign: safeCookieValue(cookies.dj_last_utm_campaign),
    lastUtmContent: safeCookieValue(cookies.dj_last_utm_content),
    lastUtmTerm: safeCookieValue(cookies.dj_last_utm_term),
    landingPage: sanitizeMetaEventSourceUrl(cookies.dj_landing_page, request),
    referrer: sanitizeMetaEventSourceUrl(cookies.dj_referrer, request, {
      allowExternal: true,
    }),
  };
}

export function createServerMetaEventId(eventName: string) {
  return `${eventName.toLowerCase()}_${crypto.randomUUID()}`;
}

function sanitizeMetaBrowserId(value: unknown) {
  if (typeof value !== "string") return null;

  const clean = value.trim();
  if (!clean || clean.length > 250) return null;
  if (!/^[A-Za-z0-9._:-]+$/.test(clean)) return null;

  return clean;
}

function sanitizeFbclid(value: unknown) {
  if (typeof value !== "string") return null;

  const clean = value.trim();
  if (!clean || clean.length > 500) return null;
  if (["fbclid", "undefined", "null"].includes(clean.toLowerCase())) {
    return null;
  }
  if (!/^[A-Za-z0-9._-]+$/.test(clean)) return null;

  return clean;
}

function sanitizeFbc(value: unknown, referenceTimeMs = Date.now()) {
  if (typeof value !== "string") return null;

  const clean = value.trim();
  if (!clean || clean.length > 300) return null;

  const parts = clean.split(".");
  if (parts.length < 4) return null;
  if (parts[0] !== "fb" || parts[1] !== "1") return null;

  const rawCreationTime = Number(parts[2]);
  if (!Number.isFinite(rawCreationTime) || rawCreationTime <= 0) return null;

  const clickId = parts.slice(3).join(".");
  const fbclid = sanitizeFbclid(clickId);
  if (!fbclid) return null;

  const creationTimeMs =
    rawCreationTime < 10_000_000_000
      ? Math.round(rawCreationTime * 1000)
      : Math.round(rawCreationTime);

  const fiveMinutesMs = 5 * 60 * 1000;
  const oneHundredTwentyDaysMs = 120 * 24 * 60 * 60 * 1000;

  if (creationTimeMs > referenceTimeMs + fiveMinutesMs) return null;
  if (creationTimeMs < referenceTimeMs - oneHundredTwentyDaysMs) return null;

  return `fb.1.${creationTimeMs}.${fbclid}`;
}

function buildFbcFromFbclid(fbclid: string) {
  return `fb.1.${Date.now()}.${fbclid}`;
}

function sanitizeMetaEventSourceUrl(
  value: unknown,
  request: Request,
  options: { allowExternal?: boolean } = {},
) {
  if (typeof value !== "string") return null;

  const clean = value.trim();
  if (!clean || clean.length > 900) return null;

  try {
    const parsedUrl = new URL(clean);

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return null;
    }

    if (options.allowExternal) return parsedUrl.toString();

    const requestOrigin = new URL(request.url).origin;
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
      : requestOrigin;

    if (parsedUrl.origin !== requestOrigin && parsedUrl.origin !== appOrigin) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function safeCookieValue(value: unknown) {
  if (typeof value !== "string") return null;

  const clean = value.trim();
  if (!clean || clean.length > 480) return null;

  return clean;
}

function sha256(value: string) {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return {} as Record<string, string>;

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => {
        const [key, ...valueParts] = cookie.trim().split("=");
        try {
          return [key, decodeURIComponent(valueParts.join("="))];
        } catch {
          return [key, valueParts.join("=")];
        }
      })
      .filter(([key]) => Boolean(key)),
  ) as Record<string, string>;
}

function removeEmptyObjectValues<T extends Record<string, unknown>>(object: T) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );
}
