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
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || createServerMetaEventId(input.eventName),
        action_source: "website",
        event_source_url:
          input.eventSourceUrl || process.env.NEXT_PUBLIC_APP_URL || undefined,
        user_data: removeEmptyObjectValues({
          em: input.email ? [sha256(input.email)] : undefined,
          external_id: input.externalId ? [sha256(input.externalId)] : undefined,
          client_ip_address: input.clientIpAddress || undefined,
          client_user_agent: input.clientUserAgent || undefined,
          fbp: input.fbp || undefined,
          fbc: input.fbc || undefined,
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

export function getMetaRequestContext(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));

  return {
    eventSourceUrl:
      request.headers.get("referer") || process.env.NEXT_PUBLIC_APP_URL || null,
    clientIpAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null,
    clientUserAgent: request.headers.get("user-agent"),
    fbp: cookies._fbp || null,
    fbc: cookies._fbc || null,
    fbclid: cookies.dj_fbclid || null,
    utmSource: cookies.dj_utm_source || null,
    utmMedium: cookies.dj_utm_medium || null,
    utmCampaign: cookies.dj_utm_campaign || null,
    utmContent: cookies.dj_utm_content || null,
    utmTerm: cookies.dj_utm_term || null,
    lastUtmSource: cookies.dj_last_utm_source || null,
    lastUtmMedium: cookies.dj_last_utm_medium || null,
    lastUtmCampaign: cookies.dj_last_utm_campaign || null,
    lastUtmContent: cookies.dj_last_utm_content || null,
    lastUtmTerm: cookies.dj_last_utm_term || null,
    landingPage: cookies.dj_landing_page || null,
    referrer: cookies.dj_referrer || null,
  };
}

export function createServerMetaEventId(eventName: string) {
  return `${eventName.toLowerCase()}_${crypto.randomUUID()}`;
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
        return [key, decodeURIComponent(valueParts.join("="))];
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
