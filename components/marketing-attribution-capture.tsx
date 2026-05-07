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

  document.cookie = [
    `${name}=${encodedValue}`,
    "path=/",
    `max-age=${COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ].join("; ");
}

function getCookie(name: string) {
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
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

function buildFbc(fbclid: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  return `fb.1.${timestamp}.${fbclid}`;
}

export function MarketingAttributionCapture() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const fbclid = searchParams.get("fbclid");

    if (fbclid) {
      persistFirstTouch("fbclid", fbclid);

      if (!getCookie("_fbc")) {
        setCookie("_fbc", buildFbc(fbclid));
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
