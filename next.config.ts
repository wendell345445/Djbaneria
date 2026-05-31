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

const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://www.google-analytics.com https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://player.vimeo.com https://open.spotify.com https://w.soundcloud.com https://www.youtube.com https://www.paypal.com",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  images: {
    remotePatterns: buildRemoteImagePatterns(),
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspReportOnly,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
