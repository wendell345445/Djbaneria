function normalizeSlugValue(slug: string) {
  return slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
}

function getCleanRootDomain() {
  const raw = process.env.NEXT_PUBLIC_DJ_SITE_ROOT_DOMAIN?.trim();

  if (!raw) {
    return null;
  }

  return raw
    .replace(/^https?:\/\//i, "")
    .replace(/^\*\./, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function getCleanAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://djproia.com").replace(/\/$/, "");
}

export function buildDjSitePublicUrl(slug: string) {
  const normalizedSlug = normalizeSlugValue(slug);
  const rootDomain = getCleanRootDomain();

  if (rootDomain && normalizedSlug) {
    return `https://${normalizedSlug}.${rootDomain}`;
  }

  return `${getCleanAppUrl()}/s/${normalizedSlug}`;
}

export function buildFallbackDjSitePublicPath(slug: string) {
  return `/s/${normalizeSlugValue(slug)}`;
}

export function getDjSiteRootDomain() {
  return getCleanRootDomain();
}
