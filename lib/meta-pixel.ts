"use client";

export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "CompleteRegistration"
  | "InitiateCheckout"
  | "StartTrial"
  | "Subscribe"
  | "Purchase";

type MetaEventOptions = {
  eventId?: string;
};

type MetaEventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type MetaAdvancedMatchingParams = {
  em?: string | null;
  ph?: string | null;
  fn?: string | null;
  ln?: string | null;
  ct?: string | null;
  st?: string | null;
  zp?: string | null;
  country?: string | null;
  external_id?: string | null;
};

type MetaPurchaseParams = {
  eventId: string;
  plan?: string | null;
  value?: number | null;
  currency?: string | null;
  contentName?: string | null;
};

declare global {
  interface Window {
    fbq?: (
      command: "init" | "track" | "trackCustom",
      eventNameOrPixelId: string,
      params?: MetaEventParams | MetaAdvancedMatchingParams,
      options?: { eventID?: string },
    ) => void;
    _fbq?: Window["fbq"];
  }
}

export function isMetaPixelEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim());
}

export function getMetaPixelId() {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";
}

export function createMetaEventId(eventName: string) {
  const cryptoApi = globalThis.crypto;
  const randomPart =
    typeof cryptoApi?.randomUUID === "function"
      ? cryptoApi.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${eventName.toLowerCase()}_${randomPart}`;
}

export function initMetaPixel(
  pixelId: string,
  advancedMatching: MetaAdvancedMatchingParams = {},
) {
  if (
    !pixelId ||
    typeof window === "undefined" ||
    typeof window.fbq !== "function"
  ) {
    return;
  }

  const cleanAdvancedMatching = removeEmptyMetaParams(
    normalizeAdvancedMatchingParams(advancedMatching),
  );

  if (Object.keys(cleanAdvancedMatching).length > 0) {
    window.fbq("init", pixelId, cleanAdvancedMatching);
    return;
  }

  window.fbq("init", pixelId);
}

export function trackMetaEvent(
  eventName: MetaStandardEvent,
  params: MetaEventParams = {},
  options: MetaEventOptions = {},
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq(
    "track",
    eventName,
    removeEmptyMetaParams(params),
    options.eventId ? { eventID: options.eventId } : undefined,
  );
}

export function trackMetaPageView() {
  trackMetaEvent("PageView");
}

export function trackMetaViewContent(params: MetaEventParams = {}) {
  trackMetaEvent("ViewContent", params);
}

export function trackMetaLead(params: MetaEventParams = {}, eventId?: string) {
  trackMetaEvent("Lead", params, { eventId });
}

export function trackMetaCompleteRegistration(
  params: MetaEventParams = {},
  eventId?: string,
) {
  trackMetaEvent("CompleteRegistration", params, { eventId });
}

export function trackMetaInitiateCheckout(
  plan?: string | null,
  eventId?: string | null,
) {
  const normalizedPlan = plan || "unknown";

  trackMetaEvent(
    "InitiateCheckout",
    {
      content_name: `${normalizedPlan} Subscription`,
      content_category: "SaaS Subscription",
      content_type: "product",
      currency: "USD",
      value: getMetaPlanValue(normalizedPlan),
      plan: normalizedPlan,
      num_items: 1,
    },
    eventId ? { eventId } : undefined,
  );
}

export function trackMetaPurchase({
  eventId,
  plan,
  value,
  currency = "USD",
  contentName,
}: MetaPurchaseParams) {
  const normalizedPlan = plan || "unknown";
  const purchaseValue =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : getMetaPlanValue(normalizedPlan);

  trackMetaEvent(
    "Purchase",
    {
      content_name: contentName || `${normalizedPlan} Subscription`,
      content_category: "SaaS Subscription",
      content_type: "product",
      currency,
      value: purchaseValue,
      plan: normalizedPlan,
      num_items: 1,
    },
    { eventId },
  );
}

export function getMetaNameParts(name?: string | null) {
  const normalized = normalizeMetaValue(name);
  if (!normalized) {
    return {
      firstName: undefined,
      lastName: undefined,
    };
  }

  const parts = normalized.split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
  };
}

function getMetaPlanValue(plan: string) {
  const prices: Record<string, number> = {
    PRO: 12.99,
    PROFESSIONAL: 24.99,
    STUDIO: 39.99,
  };

  return prices[plan] ?? 0;
}

function removeEmptyMetaParams<
  T extends Record<string, string | number | boolean | null | undefined>,
>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        String(value).trim().length > 0,
    ),
  );
}

function normalizeAdvancedMatchingParams(
  params: MetaAdvancedMatchingParams,
): MetaAdvancedMatchingParams {
  return {
    em: normalizeMetaValue(params.em),
    ph: normalizePhone(params.ph),
    fn: normalizeMetaValue(params.fn),
    ln: normalizeMetaValue(params.ln),
    ct: normalizeMetaValue(params.ct),
    st: normalizeMetaValue(params.st),
    zp: normalizeMetaValue(params.zp),
    country: normalizeMetaValue(params.country),
    external_id: normalizeMetaValue(params.external_id),
  };
}

function normalizeMetaValue(value?: string | null) {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return normalized || undefined;
}

function normalizePhone(value?: string | null) {
  if (!value) return undefined;

  const normalized = value.replace(/\D/g, "");
  return normalized || undefined;
}
