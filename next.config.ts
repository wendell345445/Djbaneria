import type { NextConfig } from "next";

type RemotePattern = NonNullable<NextConfig["images"]>["remotePatterns"] extends
  | Array<infer Pattern>
  | undefined
  ? Pattern
  : never;

function normalizeRemoteImagePattern(value?: string | null): RemotePattern | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = trimmed.includes("://")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);

    if (parsed.protocol !== "https:") return null;

    return {
      protocol: "https",
      hostname: parsed.hostname,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

function buildRemoteImagePatterns() {
  const configuredHosts = [
    process.env.R2_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL,
    "https://i.vimeocdn.com",
    "https://f.vimeocdn.com",
    ...(process.env.NEXT_IMAGE_REMOTE_HOSTS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ];

  const patterns = configuredHosts
    .map((value) => normalizeRemoteImagePattern(value))
    .filter((pattern): pattern is RemotePattern => Boolean(pattern));

  return patterns.filter(
    (pattern, index, list) =>
      list.findIndex(
        (current) =>
          current.protocol === pattern.protocol &&
          current.hostname === pattern.hostname &&
          current.pathname === pattern.pathname,
      ) === index,
  );
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: buildRemoteImagePatterns(),
  },
};

export default nextConfig;
