import { z } from "zod";

export const DJ_SITE_THEMES = ["NEON_DARK", "CLEAN_WHITE", "LUXURY_BLACK"] as const;

export const djSiteSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must have at least 3 characters.")
  .max(32, "Slug must have at most 32 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use only lowercase letters, numbers and hyphens.");

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || "");

function isSafeHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeMailtoUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "mailto:";
  } catch {
    return false;
  }
}

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(700)
  .optional()
  .nullable()
  .transform((value) => value || "")
  .refine((value) => !value || isSafeHttpsUrl(value), {
    message: "Use a valid HTTPS URL.",
  });

const optionalExternalLinkUrl = z
  .string()
  .trim()
  .max(700)
  .optional()
  .nullable()
  .transform((value) => value || "")
  .refine((value) => !value || isSafeHttpsUrl(value) || isSafeMailtoUrl(value), {
    message: "Use a valid HTTPS or mailto URL.",
  });

const optionalEmail = z
  .string()
  .trim()
  .max(160)
  .optional()
  .nullable()
  .transform((value) => value || "")
  .refine((value) => !value || z.string().email().safeParse(value).success, {
    message: "Use a valid email address.",
  });

const djSiteLinkSchema = z.object({
  label: z.string().trim().max(80).default(""),
  url: optionalExternalLinkUrl.default(""),
  position: z.number().int().min(0).max(200).optional(),
  isActive: z.boolean().default(true),
});

const djSiteEventSchema = z.object({
  title: z.string().trim().max(120).default(""),
  venue: optionalText(120).default(""),
  city: optionalText(80).default(""),
  eventDate: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => value || null),
  ticketUrl: optionalExternalLinkUrl.default(""),
  flyerUrl: optionalHttpsUrl.default(""),
  position: z.number().int().min(0).max(200).optional(),
  isActive: z.boolean().default(true),
});

export const djSiteUpdateSchema = z.object({
  slug: djSiteSlugSchema,
  artistName: z.string().trim().min(1, "Artist name is required.").max(80),
  headline: optionalText(120).default(""),
  bio: optionalText(800).default(""),
  location: optionalText(80).default(""),
  profileImageUrl: optionalHttpsUrl.default(""),
  coverImageUrl: optionalHttpsUrl.default(""),
  instagramUrl: optionalHttpsUrl.default(""),
  tiktokUrl: optionalHttpsUrl.default(""),
  soundcloudUrl: optionalHttpsUrl.default(""),
  spotifyUrl: optionalHttpsUrl.default(""),
  youtubeUrl: optionalHttpsUrl.default(""),
  whatsappUrl: optionalHttpsUrl.default(""),
  bookingEmail: optionalEmail.default(""),
  theme: z.enum(DJ_SITE_THEMES).default("NEON_DARK"),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a valid HEX color.")
    .default("#8B5CF6"),
  isPublished: z.boolean().default(false),
  showAgenda: z.boolean().default(true),
  links: z.array(djSiteLinkSchema).max(30).default([]),
  events: z.array(djSiteEventSchema).max(50).default([]),
});

function normalizeSlugValue(slug: string) {
  return slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
}

export function buildFallbackDjSitePublicPath(slug: string) {
  return `/s/${normalizeSlugValue(slug)}`;
}
