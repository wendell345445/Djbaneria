import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_DJ_SITE_ROOT_DOMAIN || "djvisuals.ai")
  .replace(/^https?:\/\//i, "")
  .replace(/^\*\./, "")
  .replace(/\/$/, "")
  .toLowerCase();

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
  "static",
  "assets",
  "cdn",
  "mail",
  "email",
  "support",
]);

function getDjSiteSubdomain(host: string) {
  const hostname = host.split(":")[0]?.toLowerCase();

  if (!hostname || !hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return null;
  }

  const subdomain = hostname.slice(0, -`.${ROOT_DOMAIN}`.length);

  if (!subdomain || subdomain.includes(".")) {
    return null;
  }

  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return null;
  }

  if (!/^[a-z0-9-]{3,32}$/.test(subdomain)) {
    return null;
  }

  return subdomain;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const subdomain = getDjSiteSubdomain(host);

  if (!subdomain) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  url.pathname = `/s/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
