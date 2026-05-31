import { z } from "zod";

export const DJ_SITE_RESERVED_SLUGS = new Set([
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
  "public",
  "static",
  "assets",
  "cdn",
  "mail",
  "email",
  "ftp",
  "blog",
  "docs",
  "status",
  "security",
  "sitemap",
  "robots",
]);

export const DJ_SITE_THEMES = [
  "NEON_DARK",
  "LUXURY_BLACK",
  "CLEAN_WHITE",
] as const;

const MAX_LINKS = 12;
const MAX_EVENTS = 8;

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isSafeHttpsUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export const djSiteSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must have at least 3 characters.")
  .max(32, "Slug must have at most 32 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Use lowercase letters, numbers and hyphens only.",
  })
  .refine((slug) => !DJ_SITE_RESERVED_SLUGS.has(slug), {
    message: "This slug is reserved.",
  });

export const optionalCleanStringSchema = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform(normalizeOptionalString)
    .refine((value) => !value || value.length <= max, {
      message: `Maximum ${max} characters allowed.`,
    });

export const optionalSafeUrlSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform(normalizeOptionalString)
  .refine((value) => !value || value.length <= 500, {
    message: "URL is too long.",
  })
  .refine((value) => !value || isSafeHttpsUrl(value), {
    message: "Only public HTTPS URLs are allowed.",
  });

const optionalEmailSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform(normalizeOptionalString)
  .refine((value) => !value || value.length <= 120, {
    message: "Email is too long.",
  })
  .refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    { message: "Invalid email." },
  );

export const djSiteLinkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: optionalSafeUrlSchema.refine((value) => Boolean(value), {
    message: "URL is required.",
  }),
  position: z.coerce.number().int().min(0).max(999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const djSiteEventSchema = z.object({
  title: z.string().trim().min(1).max(80),
  venue: optionalCleanStringSchema(80),
  city: optionalCleanStringSchema(80),
  eventDate: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      const normalized = normalizeOptionalString(value);
      if (!normalized) return null;
      const parsed = new Date(normalized);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }),
  ticketUrl: optionalSafeUrlSchema,
  flyerUrl: optionalSafeUrlSchema,
  position: z.coerce.number().int().min(0).max(999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const djSiteUpdateSchema = z.object({
  slug: djSiteSlugSchema,
  artistName: z.string().trim().min(2).max(80),
  headline: optionalCleanStringSchema(120),
  bio: optionalCleanStringSchema(800),
  location: optionalCleanStringSchema(80),
  profileImageUrl: optionalSafeUrlSchema,
  coverImageUrl: optionalSafeUrlSchema,
  instagramUrl: optionalSafeUrlSchema,
  tiktokUrl: optionalSafeUrlSchema,
  soundcloudUrl: optionalSafeUrlSchema,
  spotifyUrl: optionalSafeUrlSchema,
  youtubeUrl: optionalSafeUrlSchema,
  whatsappUrl: optionalSafeUrlSchema,
  bookingEmail: optionalEmailSchema,
  theme: z.enum(DJ_SITE_THEMES).default("NEON_DARK"),
  accentColor: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => normalizeOptionalString(value) || "#00F5FF")
    .refine((value) => /^#[0-9A-Fa-f]{6}$/.test(value), {
      message: "Use a valid hex color like #00F5FF.",
    }),
  isPublished: z.boolean().default(false),
  links: z.array(djSiteLinkSchema).max(MAX_LINKS).default([]),
  events: z.array(djSiteEventSchema).max(MAX_EVENTS).default([]),
});

export type DjSiteUpdateInput = z.infer<typeof djSiteUpdateSchema>;

export function buildDjSitePublicUrl(slug: string) {
  const rootDomain =
    process.env.NEXT_PUBLIC_DJ_SITE_ROOT_DOMAIN?.trim() || "djvisuals.ai";

  return `https://${slug}.${rootDomain}`;
}

export function buildFallbackDjSitePublicPath(slug: string) {
  return `/s/${slug}`;
}
