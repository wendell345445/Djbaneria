// Optional future step: only add this after /s/[slug] is working and
// *.djvisuals.ai is configured in Vercel/DNS.
import { NextRequest, NextResponse } from "next/server";

const APP_DOMAINS = new Set([
  "djproia.com",
  "www.djproia.com",
  "localhost",
  "localhost:3000",
]);

const DJ_SITE_ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_DJ_SITE_ROOT_DOMAIN || "djvisuals.ai";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "owner",
  "dashboard",
  "login",
  "register",
  "checkout",
  "billing",
  "settings",
  "support",
  "help",
  "terms",
  "privacy",
]);

function getHostname(request: NextRequest) {
  return request.headers.get("host")?.toLowerCase().split(":")[0] || "";
}

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = getHostname(request);

  if (APP_DOMAINS.has(hostname)) return NextResponse.next();
  if (hostname === DJ_SITE_ROOT_DOMAIN || hostname === `www.${DJ_SITE_ROOT_DOMAIN}`) {
    return NextResponse.next();
  }

  const suffix = `.${DJ_SITE_ROOT_DOMAIN}`;

  if (hostname.endsWith(suffix)) {
    const slug = hostname.slice(0, -suffix.length);

    if (!isValidSlug(slug) || RESERVED_SUBDOMAINS.has(slug)) {
      return NextResponse.next();
    }

    url.pathname = `/s/${slug}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
