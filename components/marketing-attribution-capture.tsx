"use client";

import { useEffect } from "react";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;
const COOKIE_PREFIX = "dj_";

const ATTRIBUTION_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function setCookie(name: string, value: string) {
  const encodedValue = encodeURIComponent(value.slice(0, 900));
  const cookieParts = [
    `${name}=${encodedValue}`,
    "path=/",
    `max-age=${COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];

  if (window.location.protocol === "https:") {
    cookieParts.push("Secure");
  }

  document.cookie = cookieParts.join("; ");
}

function getCookie(name: string) {
  const value = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!value) return undefined;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function persistFirstTouch(name: string, value: string | null) {
  if (!value) return;

  const cookieName = `${COOKIE_PREFIX}${name}`;

  if (getCookie(cookieName)) return;

  setCookie(cookieName, value);
}

function persistLastTouch(name: string, value: string | null) {
  if (!value) return;

  setCookie(`${COOKIE_PREFIX}${name}`, value);
}

function isValidFbclid(value: string | undefined) {
  if (!value) return false;

  const clean = value.trim();
  if (!clean || clean.length > 500) return false;
  if (["fbclid", "undefined", "null"].includes(clean.toLowerCase())) {
    return false;
  }

  return /^[A-Za-z0-9._-]+$/.test(clean);
}

function isValidFbc(value: string | undefined) {
  if (!value) return false;

  const parts = value.trim().split(".");
  if (parts.length < 4) return false;
  if (parts[0] !== "fb" || parts[1] !== "1") return false;

  const creationTime = Number(parts[2]);
  if (!Number.isFinite(creationTime)) return false;

  // _fbc uses milliseconds. Reject old seconds-based cookies created by older code.
  if (creationTime < 10_000_000_000) return false;

  const now = Date.now();
  const maxAgeMs = COOKIE_MAX_AGE_SECONDS * 1000;
  if (creationTime > now + 5 * 60 * 1000) return false;
  if (creationTime < now - maxAgeMs) return false;

  return isValidFbclid(parts.slice(3).join("."));
}

function buildFbc(fbclid: string) {
  return `fb.1.${Date.now()}.${fbclid}`;
}

export function MarketingAttributionCapture() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const fbclid = searchParams.get("fbclid");

    if (isValidFbclid(fbclid || undefined)) {
      const cleanFbclid = fbclid as string;
      const storedFbclid = getCookie(`${COOKIE_PREFIX}fbclid`);

      if (!isValidFbclid(storedFbclid)) {
        setCookie(`${COOKIE_PREFIX}fbclid`, cleanFbclid);
      }

      const currentFbc = getCookie("_fbc");
      if (!isValidFbc(currentFbc)) {
        setCookie("_fbc", buildFbc(cleanFbclid));
      }
    }

    for (const param of ATTRIBUTION_PARAMS) {
      const value = searchParams.get(param);
      persistFirstTouch(param, value);
      persistLastTouch(`last_${param}`, value);
    }

    persistFirstTouch("landing_page", window.location.href);

    if (document.referrer) {
      persistFirstTouch("referrer", document.referrer);
    }
  }, []);

  return null;
}
