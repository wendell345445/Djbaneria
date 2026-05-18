"use client";

export type MetaBrowserTrackingPayload = {
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  eventSourceUrl?: string;
};

export function getMetaBrowserTrackingPayload(): MetaBrowserTrackingPayload {
  if (typeof window === "undefined") return {};

  const cookies = getBrowserCookies();
  const params = new URLSearchParams(window.location.search);
  const fbclid = sanitizeTrackingValue(
    params.get("fbclid") || cookies.dj_fbclid,
    500,
    /^[A-Za-z0-9._-]+$/,
  );
  const fbc =
    sanitizeTrackingValue(cookies._fbc, 250, /^[A-Za-z0-9._:-]+$/) ||
    (fbclid ? buildFbcFromFbclid(fbclid) : undefined);

  return removeEmptyPayload({
    fbp: sanitizeTrackingValue(cookies._fbp, 250, /^[A-Za-z0-9._:-]+$/),
    fbc,
    fbclid,
    eventSourceUrl: sanitizeEventSourceUrl(window.location.href),
  });
}

function getBrowserCookies() {
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, cookie) => {
      const [key, ...valueParts] = cookie.split("=");
      if (!key) return acc;

      try {
        acc[key] = decodeURIComponent(valueParts.join("="));
      } catch {
        acc[key] = valueParts.join("=");
      }

      return acc;
    }, {});
}

function sanitizeTrackingValue(
  value: string | null | undefined,
  maxLength: number,
  allowedPattern: RegExp,
) {
  const clean = value?.trim();

  if (!clean || clean.length > maxLength) return undefined;
  if (!allowedPattern.test(clean)) return undefined;

  return clean;
}

function sanitizeEventSourceUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }

    return url.toString().slice(0, 900);
  } catch {
    return undefined;
  }
}

function buildFbcFromFbclid(fbclid: string) {
  return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
}

function removeEmptyPayload(payload: MetaBrowserTrackingPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => Boolean(value)),
  ) as MetaBrowserTrackingPayload;
}
