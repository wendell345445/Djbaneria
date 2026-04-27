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

type MetaEventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    fbq?: (
      command: "init" | "track" | "trackCustom",
      eventNameOrPixelId: string,
      params?: MetaEventParams,
      options?: { eventID?: string },
    ) => void;
    _fbq?: Window["fbq"];
  }
}

export function isMetaPixelEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim());
}

export function createMetaEventId(eventName: string) {
  const cryptoApi = globalThis.crypto;
  const randomPart =
    typeof cryptoApi?.randomUUID === "function"
      ? cryptoApi.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${eventName.toLowerCase()}_${randomPart}`;
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

export function trackMetaInitiateCheckout(plan?: string | null) {
  const normalizedPlan = plan || "unknown";

  trackMetaEvent("InitiateCheckout", {
    content_name: normalizedPlan,
    content_category: "subscription",
    currency: "USD",
    value: getMetaPlanValue(normalizedPlan),
  });
}

function getMetaPlanValue(plan: string) {
  const prices: Record<string, number> = {
    PRO: 12.99,
    PROFESSIONAL: 24.99,
    STUDIO: 39.99,
  };

  return prices[plan] ?? 0;
}

function removeEmptyMetaParams(params: MetaEventParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
  );
}
