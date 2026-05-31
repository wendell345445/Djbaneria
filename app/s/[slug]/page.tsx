import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Play,
  Quote,
  Share2,
  Star,
} from "lucide-react";
import {
  SiInstagram,
  SiSoundcloud,
  SiSpotify,
  SiTiktok,
  SiWhatsapp,
  SiYoutube,
} from "react-icons/si";

import { djSiteSlugSchema } from "@/lib/dj-site-validation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type PublicLink = {
  id?: string;
  label: string;
  url: string;
  duration?: string | null;
  subtitle?: string | null;
  position?: number | null;
  isActive?: boolean | null;
};

type PublicEvent = {
  id: string;
  title: string;
  venue?: string | null;
  city?: string | null;
  eventDate?: Date | string | null;
  timeLabel?: string | null;
  status?: string | null;
  attendees?: number | string | null;
  ticketUrl?: string | null;
  flyerUrl?: string | null;
  position?: number | null;
  isActive?: boolean | null;
};

type PublicTestimonial = {
  id?: string;
  name: string;
  role?: string | null;
  quote: string;
  rating?: number | null;
  avatarUrl?: string | null;
};

type PublishedDjSite = {
  id: string;
  slug: string;
  artistName: string;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  soundcloudUrl?: string | null;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  whatsappUrl?: string | null;
  bookingEmail?: string | null;
  theme?: string | null;
  accentColor?: string | null;
  genres?: string[] | null;
  eventsPlayed?: number | string | null;
  monthlyListeners?: number | string | null;
  yearsExperience?: number | string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  testimonials?: PublicTestimonial[] | null;
  links: PublicLink[];
  events: PublicEvent[];
};

type CompactLink = {
  label: string;
  url: string;
  duration?: string | null;
  subtitle?: string | null;
};

const socialFields = [
  ["instagramUrl", "Instagram"],
  ["tiktokUrl", "TikTok"],
  ["spotifyUrl", "Spotify"],
  ["soundcloudUrl", "SoundCloud"],
  ["youtubeUrl", "YouTube"],
  ["whatsappUrl", "WhatsApp"],
] as const;

const musicLabelPattern =
  /music|mix|listen|spotify|soundcloud|youtube|set|live|track|playlist/i;

async function getPublishedSite(slugValue: string) {
  const parsed = djSiteSlugSchema.safeParse(slugValue);

  if (!parsed.success) {
    return null;
  }

  return (prisma as any).djSite.findFirst({
    where: {
      slug: parsed.data,
      isPublished: true,
    },
    include: {
      links: {
        where: { isActive: true },
        orderBy: { position: "asc" },
      },
      events: {
        where: { isActive: true },
        orderBy: [{ eventDate: "asc" }, { position: "asc" }],
      },
    },
  }) as Promise<PublishedDjSite | null>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublishedSite(slug);

  if (!site) {
    return {
      title: "DJ profile not found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    site.headline ||
    site.bio ||
    `Official DJ profile and booking page for ${site.artistName}.`;
  const image = site.coverImageUrl || undefined;

  return {
    title: `${site.artistName} | Official DJ Profile`,
    description,
    openGraph: {
      title: `${site.artistName} | Official DJ Profile`,
      description,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${site.artistName} | Official DJ Profile`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

function getAccentColor(site: PublishedDjSite) {
  if (
    typeof site.accentColor === "string" &&
    /^#[0-9A-Fa-f]{6}$/.test(site.accentColor)
  ) {
    return site.accentColor;
  }

  if (site.theme === "LUXURY_BLACK") return "#111111";
  if (site.theme === "CLEAN_WHITE") return "#1B36FF";
  return "#FF4222";
}

function getPublicUrl(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://djproia.com";
  return `${base.replace(/\/$/, "")}/s/${slug}`;
}

function eventMonth(value: Date | string | null | undefined) {
  if (!value) return "TBA";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";
  return new Intl.DateTimeFormat("en", { month: "short" })
    .format(date)
    .toUpperCase();
}

function eventDay(value: Date | string | null | undefined) {
  if (!value) return "--";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
}

function eventYear(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
}

function getSocialLinks(site: PublishedDjSite): CompactLink[] {
  return socialFields.flatMap(([key, label]) => {
    const value = site[key];
    if (typeof value !== "string" || value.trim().length === 0) {
      return [];
    }
    return [{ label, url: value }];
  });
}

function getBookingUrl(site: PublishedDjSite) {
  if (site.whatsappUrl) return site.whatsappUrl;
  if (site.bookingEmail) return `mailto:${site.bookingEmail}`;
  return null;
}

function getMessageUrl(site: PublishedDjSite) {
  if (site.whatsappUrl) return site.whatsappUrl;
  if (site.bookingEmail) return `mailto:${site.bookingEmail}`;
  return null;
}

function getListenUrl(site: PublishedDjSite, links: PublicLink[]) {
  return (
    site.soundcloudUrl ||
    site.spotifyUrl ||
    site.youtubeUrl ||
    links.find((link) => musicLabelPattern.test(link.label))?.url ||
    null
  );
}

function getMusicLinks(
  site: PublishedDjSite,
  links: PublicLink[],
): CompactLink[] {
  const candidates: CompactLink[] = [
    ...getSocialLinks(site).filter((link) =>
      musicLabelPattern.test(link.label),
    ),
    ...links
      .filter((link) => musicLabelPattern.test(link.label))
      .map((link) => ({
        label: link.label,
        url: link.url,
        duration: link.duration,
        subtitle: link.subtitle,
      })),
  ];

  const seen = new Set<string>();
  return candidates
    .filter((link) => {
      if (!link.url || seen.has(link.url)) return false;
      seen.add(link.url);
      return true;
    })
    .slice(0, 6);
}

type ExternalMediaImage = {
  url: string;
  title: string;
  provider: "Spotify" | "SoundCloud";
};

function getExternalMusicSourceUrls(
  site: PublishedDjSite,
  links: PublicLink[],
) {
  const urls = [
    site.spotifyUrl,
    site.soundcloudUrl,
    ...links.map((link) => link.url),
  ].filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0,
  );

  const allowedHosts = new Set([
    "open.spotify.com",
    "spotify.link",
    "soundcloud.com",
  ]);

  const unique = new Set<string>();

  return urls.filter((url) => {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

      if (!allowedHosts.has(hostname)) {
        return false;
      }

      const normalizedUrl = parsedUrl.toString();

      if (unique.has(normalizedUrl)) {
        return false;
      }

      unique.add(normalizedUrl);
      return true;
    } catch {
      return false;
    }
  });
}

function isSafeExternalImageUrl(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchOEmbedImage(
  sourceUrl: string,
): Promise<ExternalMediaImage | null> {
  const parsedUrl = new URL(sourceUrl);
  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

  let endpoint: string | null = null;
  let provider: ExternalMediaImage["provider"] | null = null;

  if (hostname === "open.spotify.com" || hostname === "spotify.link") {
    endpoint = `https://open.spotify.com/oembed?url=${encodeURIComponent(sourceUrl)}`;
    provider = "Spotify";
  }

  if (hostname === "soundcloud.com") {
    endpoint = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(sourceUrl)}`;
    provider = "SoundCloud";
  }

  if (!endpoint || !provider) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(endpoint, {
      signal: controller.signal,
      next: {
        revalidate: 60 * 60 * 24,
      },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      title?: string;
      thumbnail_url?: string | null;
    };

    if (!isSafeExternalImageUrl(payload.thumbnail_url)) {
      return null;
    }

    return {
      url: payload.thumbnail_url!,
      title: payload.title || provider,
      provider,
    };
  } catch (error) {
    console.error("[dj-site] failed to fetch external music profile image", {
      sourceUrl,
      error,
    });

    return null;
  }
}

async function getExternalMusicImages(
  site: PublishedDjSite,
  links: PublicLink[],
) {
  const urls = getExternalMusicSourceUrls(site, links);

  if (urls.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    urls.slice(0, 6).map((url) => fetchOEmbedImage(url)),
  );
  const images: ExternalMediaImage[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled" || !result.value) {
      continue;
    }

    if (seen.has(result.value.url)) {
      continue;
    }

    seen.add(result.value.url);
    images.push(result.value);
  }

  return images;
}

function getFeaturedLinks(
  site: PublishedDjSite,
  links: PublicLink[],
): CompactLink[] {
  const combined: CompactLink[] = [...getSocialLinks(site), ...links].filter(
    (link) => typeof link.url === "string" && link.url.trim().length > 0,
  );

  const seen = new Set<string>();
  return combined
    .filter((link) => {
      const key = `${link.label}:${link.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function getGenres(site: PublishedDjSite): string[] {
  if (!Array.isArray(site.genres)) return [];
  return site.genres
    .filter((g) => typeof g === "string" && g.trim().length > 0)
    .slice(0, 6);
}

type Stat = { value: string; label: string };

function getStats(site: PublishedDjSite): Stat[] {
  const stats: Stat[] = [];
  const toStr = (v: number | string | null | undefined) =>
    v === null || v === undefined || `${v}`.trim() === "" ? null : `${v}`;

  const events = toStr(site.eventsPlayed);
  const listeners = toStr(site.monthlyListeners);
  const years = toStr(site.yearsExperience);

  if (events) stats.push({ value: events, label: "Events" });
  if (listeners) stats.push({ value: listeners, label: "Listeners" });
  if (years) stats.push({ value: years, label: "Years" });
  if (typeof site.rating === "number") {
    stats.push({
      value: site.rating.toFixed(1),
      label: site.reviewsCount ? `${site.reviewsCount} reviews` : "Rating",
    });
  }
  return stats;
}

function getTestimonials(site: PublishedDjSite): PublicTestimonial[] {
  if (!Array.isArray(site.testimonials)) return [];
  return site.testimonials.filter((t) => t && t.name && t.quote).slice(0, 5);
}

function getBookingTags() {
  return [
    "Clubs",
    "Festivals",
    "Private Events",
    "Brand Activations",
    "Corporate",
    "VIP",
  ];
}

/* ── UI atoms ───────────────────────────────────────────── */

function SectionHead({
  title,
  actionLabel,
  actionUrl,
}: {
  index?: string;
  title: string;
  actionLabel?: string;
  actionUrl?: string | null;
}) {
  return (
    <div className="mb-7 flex items-baseline justify-between gap-4 border-t border-[var(--line)] pt-4">
      <h2 className="dj-display flex-1 text-[34px] uppercase leading-[0.88] tracking-[-0.01em] text-[var(--ink)]">
        {title}
      </h2>
      {actionLabel && actionUrl ? (
        <a
          href={actionUrl}
          target="_blank"
          rel="noreferrer"
          className="dj-mono inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
        >
          {actionLabel}
          <ArrowUpRight size={13} />
        </a>
      ) : null}
    </div>
  );
}

function MixCard({
  link,
  imageUrl,
  index,
}: {
  link: CompactLink;
  imageUrl?: string | null;
  index: number;
}) {
  const subtitle = link.subtitle || (index === 0 ? "Live Set" : "Mix");

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group block min-w-[230px] max-w-[230px] shrink-0 snap-start"
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-[var(--ink)] bg-[var(--ink)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Mix cover"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--ink)]" />
        )}
        <span className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full border border-[var(--paper)] bg-black/30 text-[var(--paper)] backdrop-blur-sm transition group-hover:bg-[var(--paper)] group-hover:text-[var(--ink)]">
          <Play size={16} fill="currentColor" className="ml-0.5" />
        </span>
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2 border-t border-[var(--line)] pt-2">
        <h3 className="line-clamp-1 text-[15px] font-bold tracking-[-0.01em] text-[var(--ink)]">
          {link.label}
        </h3>
        <span className="dj-mono shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
          {link.duration || subtitle}
        </span>
      </div>
    </a>
  );
}

function GigRow({ event }: { event: PublicEvent }) {
  const place =
    [event.city, event.venue].filter(Boolean).join(" — ") || "Venue TBA";
  const meta = [event.timeLabel, event.status].filter(Boolean).join(" · ");

  return (
    <a
      href={event.ticketUrl || "#"}
      target={event.ticketUrl ? "_blank" : undefined}
      rel={event.ticketUrl ? "noreferrer" : undefined}
      className="dj-gig group grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-[var(--line)] py-5 transition-colors"
    >
      <div className="text-center leading-none">
        <p className="dj-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#000] transition-colors group-hover:text-[var(--paper)]">
          {eventMonth(event.eventDate)}
        </p>
        <p className="dj-display mt-1 text-[30px] leading-none text-[var(--ink)] transition-colors group-hover:text-[var(--paper)]">
          {eventDay(event.eventDate)}
        </p>
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-1 text-[19px] font-extrabold tracking-[-0.02em] text-[var(--ink)] transition-colors group-hover:text-[var(--paper)]">
          {event.title}
        </h3>
        <p className="dj-mono mt-1 line-clamp-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--ink-soft)] transition-colors group-hover:text-[var(--paper)]/70">
          <MapPin size={12} /> {place}
          {meta ? <span className="opacity-60">· {meta}</span> : null}
        </p>
      </div>

      <ArrowUpRight
        size={22}
        className="text-[var(--ink-soft)] transition-colors group-hover:text-[var(--paper)]"
      />
    </a>
  );
}

type BrandName =
  | "instagram"
  | "tiktok"
  | "spotify"
  | "soundcloud"
  | "youtube"
  | "whatsapp"
  | "website";

function normalizeHostFromUrl(url: string) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return url.toLowerCase();
  }
}

function getBrandName(link: CompactLink): BrandName {
  const host = normalizeHostFromUrl(link.url);
  const label = link.label.toLowerCase();

  // Domain detection has priority, so the correct icon appears even if the label is generic.
  if (host === "instagram.com" || host.endsWith(".instagram.com"))
    return "instagram";
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (host === "spotify.com" || host.endsWith(".spotify.com")) return "spotify";
  if (host === "soundcloud.com" || host.endsWith(".soundcloud.com"))
    return "soundcloud";
  if (
    host === "youtube.com" ||
    host.endsWith(".youtube.com") ||
    host === "youtu.be"
  )
    return "youtube";
  if (
    host === "wa.me" ||
    host === "whatsapp.com" ||
    host.endsWith(".whatsapp.com")
  )
    return "whatsapp";

  // Label fallback only when the domain is not recognized.
  if (/\binstagram\b|\binsta\b|\big\b/i.test(label)) return "instagram";
  if (/\btiktok\b|\btik tok\b/i.test(label)) return "tiktok";
  if (/\bspotify\b/i.test(label)) return "spotify";
  if (/\bsoundcloud\b/i.test(label)) return "soundcloud";
  if (/\byoutube\b|\byou tube\b/i.test(label)) return "youtube";
  if (/\bwhatsapp\b|\bwhats\b/i.test(label)) return "whatsapp";

  return "website";
}

function BrandIcon({ brand }: { brand: BrandName }) {
  const className = "h-[19px] w-[19px]";

  if (brand === "instagram")
    return <SiInstagram className={className} aria-hidden="true" />;
  if (brand === "tiktok")
    return <SiTiktok className={className} aria-hidden="true" />;
  if (brand === "spotify")
    return <SiSpotify className={className} aria-hidden="true" />;
  if (brand === "soundcloud")
    return <SiSoundcloud className={className} aria-hidden="true" />;
  if (brand === "youtube")
    return <SiYoutube className={className} aria-hidden="true" />;
  if (brand === "whatsapp")
    return <SiWhatsapp className={className} aria-hidden="true" />;

  return <ArrowUpRight size={18} />;
}

function LinkRow({ link }: { link: CompactLink }) {
  const brand = getBrandName(link);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="dj-gig group flex items-center justify-between gap-4 border-b border-[var(--line)] py-4 transition-colors"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center text-[var(--ink)] transition-colors group-hover:text-[var(--paper)]">
          <BrandIcon brand={brand} />
        </span>
        <span className="line-clamp-1 text-[16px] font-bold tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--paper)]">
          {link.label}
        </span>
      </span>
      <ArrowUpRight
        size={18}
        className="shrink-0 text-[var(--ink-soft)] transition-colors group-hover:text-[var(--paper)]"
      />
    </a>
  );
}

function TestimonialCard({ item }: { item: PublicTestimonial }) {
  return (
    <div className="flex h-full w-[82vw] max-w-[360px] shrink-0 snap-start flex-col border border-[var(--ink)] p-5 min-[480px]:w-[400px]">
      <Quote size={28} className="text-[var(--accent)]" fill="currentColor" />
      <p className="dj-display mt-3 flex-1 text-[20px] uppercase leading-[1.05] tracking-[-0.01em] text-[var(--ink)]">
        “{item.quote}”
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-[var(--line)] pt-4">
        <div className="h-9 w-9 shrink-0 overflow-hidden border border-[var(--ink)] grayscale">
          {item.avatarUrl ? (
            <img
              src={item.avatarUrl}
              alt={item.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[13px] font-bold text-[var(--ink)]">
              {item.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="dj-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--ink)]">
            {item.name}
          </p>
          {item.role ? (
            <p className="dj-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
              {item.role}
            </p>
          ) : null}
        </div>
        <span className="flex shrink-0 items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              size={11}
              className={
                i < Math.round(item.rating ?? 5)
                  ? "text-[var(--accent)]"
                  : "text-[var(--line)]"
              }
              fill="currentColor"
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export default async function PublicDjSitePage({ params }: PageProps) {
  const { slug } = await params;
  const site = await getPublishedSite(slug);

  if (!site) {
    notFound();
  }

  const accentColor = getAccentColor(site);
  const links = Array.isArray(site.links) ? site.links : [];
  const events = Array.isArray(site.events) ? site.events : [];
  const bookingUrl = getBookingUrl(site);
  const messageUrl = getMessageUrl(site);
  const listenUrl = getListenUrl(site, links);
  const publicUrl = getPublicUrl(site.slug);
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(publicUrl)}`;
  const musicLinks = getMusicLinks(site, links);
  const featuredLinks = getFeaturedLinks(site, links);
  const genres = getGenres(site);
  const stats = getStats(site);
  const testimonials = getTestimonials(site);
  const externalMusicImages = await getExternalMusicImages(site, links);
  const primaryMusicLinks =
    musicLinks.length > 0
      ? musicLinks
      : listenUrl
        ? [{ label: "Latest Mix", url: listenUrl }]
        : [];
  const coverForCards =
    externalMusicImages[0]?.url || site.coverImageUrl || null;
  const tickerItems = genres.length > 0 ? genres : getBookingTags();
  const ticker = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <main
      className="dj-profile-page min-h-screen overflow-x-hidden bg-[var(--paper)] text-[var(--ink)]"
      style={{ "--accent": accentColor } as CSSProperties}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

            .dj-profile-page {
              font-family: 'Archivo', system-ui, sans-serif;
              -webkit-font-smoothing: antialiased;
              --paper: #ECE8DF;
              --ink: #0C0C0C;
              --ink-soft: rgba(12,12,12,0.55);
              --line: rgba(12,12,12,0.16);
            }
            .dj-display { font-family: 'Anton', 'Archivo', sans-serif; font-weight: 400; }
            .dj-mono { font-family: 'Space Mono', monospace; }

            .dj-gig {
              margin-inline: -20px;
              padding-inline: 20px;
              -webkit-tap-highlight-color: transparent;
            }

            @media (hover: hover) and (pointer: fine) {
              .dj-gig:hover {
                background: var(--ink);
              }
            }

            @media (hover: none), (pointer: coarse) {
              .dj-gig:hover,
              .dj-gig:active,
              .dj-gig:focus {
                background: transparent !important;
              }

              .dj-gig:hover span,
              .dj-gig:active span,
              .dj-gig:focus span,
              .dj-gig:hover svg,
              .dj-gig:active svg,
              .dj-gig:focus svg {
                color: var(--ink) !important;
              }
            }

            .dj-ticker-track { animation: djTicker 32s linear infinite; }
            @keyframes djTicker { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-33.333%,0,0); } }

            .hide-scrollbar { scrollbar-width: none; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }

            .dj-reveal { animation: djReveal .8s cubic-bezier(.16,.84,.3,1) both; }
            @keyframes djReveal { 0% { opacity: 0; transform: translate3d(0,24px,0); } 100% { opacity: 1; transform: none; } }
            @supports (animation-timeline: view()) {
              .dj-scroll { animation: djReveal linear both; animation-timeline: view(); animation-range: entry 2% cover 18%; }
            }
            .dj-rule { transform-origin: left; animation: djRule .9s cubic-bezier(.16,.84,.3,1) both; }
            @keyframes djRule { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }

            @media (prefers-reduced-motion: reduce) {
              .dj-ticker-track, .dj-reveal, .dj-scroll, .dj-rule { animation: none !important; }
            }
          `,
        }}
      />

      <div className="relative mx-auto min-h-screen w-full max-w-none overflow-hidden pb-24 min-[480px]:max-w-[460px] md:my-6 md:max-w-[460px] md:border md:border-[var(--ink)] lg:max-w-[480px]">
        {/* ── TOP BAR ───────────────────────────────────────── */}
        <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-6 text-[var(--paper)] mix-blend-difference">
          <a
            href="/"
            aria-label="Back"
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span className="dj-mono text-[11px] font-bold uppercase tracking-[0.14em]">
              Index
            </span>
          </a>

          <div className="flex min-w-0 items-center justify-center">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-black/35 p-1 backdrop-blur-sm">
              {site.profileImageUrl ? (
                <img
                  src={site.profileImageUrl}
                  alt={`${site.artistName} logo`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="dj-display text-[18px] leading-none text-[var(--paper)]">
                  {site.artistName.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="dj-mono inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em]"
          >
            Share <ArrowUpRight size={13} />
          </a>
        </header>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="relative h-[68vh] min-h-[480px] max-h-[640px] overflow-hidden bg-[var(--ink)]">
          {site.coverImageUrl ? (
            <img
              src={site.coverImageUrl}
              alt={`${site.artistName} cover`}
              className="absolute inset-0 h-full w-full object-cover grayscale-[0.35]"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--ink)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-transparent to-[var(--ink)]/30" />

          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="dj-mono mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--paper)]/70">
              {site.headline || "Professional DJ"}
              {site.location ? `  /  ${site.location}` : ""}
            </p>
            <h1 className="dj-display text-[clamp(54px,17vw,86px)] uppercase leading-[0.84] tracking-[-0.02em] text-[var(--paper)]">
              {site.artistName}
            </h1>
          </div>
        </section>

        {/* ── TICKER ────────────────────────────────────────── */}
        <div className="overflow-hidden border-y border-[var(--ink)] bg-[var(--ink)] py-2.5">
          <div className="hide-scrollbar overflow-hidden">
            <div className="dj-ticker-track flex w-max items-center will-change-transform">
              {ticker.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="dj-mono flex items-center text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--paper)]"
                >
                  <span className="px-5 text-[var(--accent)]">✦</span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── INTRO + STATS ─────────────────────────────────── */}
        <section className="dj-reveal px-5 pt-8">
          <div className="dj-mono flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 48 48"
              aria-hidden="true"
              className="shrink-0"
            >
              <linearGradient
                id="verified-artist-badge-gradient"
                x1="24"
                x2="24"
                y1="41.994"
                y2="6.007"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#0064e1" />
                <stop offset=".994" stopColor="#26b7ff" />
              </linearGradient>
              <path
                fill="url(#verified-artist-badge-gradient)"
                d="M41.92 29.06c-.15.52-.48.94-.95 1.21l-3.22 1.8v3.68c0 1.1-.9 2-2 2h-3.69l-1.79 3.22c-.27.47-.69.8-1.21.95-.51.14-1.05.08-1.52-.18L24 39.76l-3.54 1.98c-.31.17-.64.25-.98.25-.18 0-.36-.02-.54-.07-.52-.15-.94-.48-1.21-.95l-1.79-3.22h-3.69c-1.1 0-2-.9-2-2v-3.68l-3.22-1.8c-.47-.27-.8-.69-.95-1.21-.14-.51-.08-1.05.18-1.52L8.24 24l-1.98-3.54c-.54-.97-.19-2.19.77-2.73l3.22-1.8v-3.68c0-1.1.9-2 2-2h3.69l1.79-3.22c.27-.47.69-.8 1.21-.95.51-.14 1.05-.08 1.52.18L24 8.24l3.54-1.98c.47-.26 1.01-.32 1.52-.18.52.15.94.48 1.21.95l1.79 3.22h3.69c1.1 0 2 .9 2 2v3.68l3.22 1.8c.96.54 1.31 1.76.77 2.73L39.76 24l1.98 3.54c.26.47.32 1.01.18 1.52z"
              />
              <path
                fill="#ffffff"
                d="M22 30a.997.997 0 0 1-.707-.293l-5-5a1 1 0 1 1 1.414-1.414L22 27.586l9.293-9.293a1 1 0 1 1 1.414 1.414l-10 10A.997.997 0 0 1 22 30z"
              />
            </svg>
            Verified Artist
          </div>

          {site.bio ? (
            <p className="mt-4 text-[18px] font-medium leading-[1.45] tracking-[-0.01em] text-[var(--ink)]">
              {site.bio}
            </p>
          ) : null}

          {stats.length > 0 ? (
            <div className="mt-7 grid grid-cols-2 border-t border-l border-[var(--line)] min-[400px]:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-b border-r border-[var(--line)] px-3 py-4"
                >
                  <p className="dj-display text-[28px] leading-none text-[var(--ink)]">
                    {stat.value}
                  </p>
                  <p className="dj-mono mt-2 text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {/* primary actions */}
          <div className="mt-7 flex flex-col gap-3">
            {bookingUrl ? (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex h-[58px] items-center justify-between border border-[var(--ink)] bg-[var(--ink)] px-5 text-[var(--paper)] transition hover:bg-[var(--accent)] hover:border-[var(--accent)]"
              >
                <span className="dj-mono text-[13px] font-bold uppercase tracking-[0.12em]">
                  Request Booking
                </span>
                <ArrowUpRight
                  size={20}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              {messageUrl ? (
                <a
                  href={messageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="dj-mono flex h-[52px] items-center justify-center gap-2 border border-[var(--ink)] text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 548.244 548.244"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M392.19 156.054 211.268 281.667 22.032 218.58C8.823 214.168-.076 201.775 0 187.852c.077-13.923 9.078-26.24 22.338-30.498L506.15 1.549c11.5-3.697 24.123-.663 32.666 7.88 8.542 8.543 11.577 21.165 7.879 32.666L390.89 525.906c-4.258 13.26-16.575 22.261-30.498 22.338-13.923.076-26.316-8.823-30.728-22.032l-63.393-190.153z"
                    />
                  </svg>
                  Message
                </a>
              ) : null}
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="dj-mono flex h-[52px] items-center justify-center gap-2 border border-[var(--ink)] text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]"
              >
                <Share2 size={15} />
                Share
              </a>
            </div>
          </div>
        </section>

        <div className="space-y-14 px-5 pt-14">
          {/* ── SELECTED SETS ───────────────────────────────── */}
          {primaryMusicLinks.length > 0 ? (
            <section className="dj-scroll">
              <SectionHead
                title="Selected Sets"
                actionLabel={listenUrl ? "All" : undefined}
                actionUrl={listenUrl}
              />
              <div className="hide-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-1">
                {primaryMusicLinks.map((link, index) => {
                  const externalImage =
                    externalMusicImages[
                      index % Math.max(externalMusicImages.length, 1)
                    ]?.url || coverForCards;

                  return (
                    <MixCard
                      key={`${link.label}-${link.url}`}
                      link={link}
                      imageUrl={externalImage}
                      index={index}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* ── LIVE DATES ──────────────────────────────────── */}
          <section className="dj-scroll">
            <SectionHead
              title="Live Dates"
              actionLabel={events.length > 2 ? "All" : undefined}
              actionUrl={bookingUrl}
            />
            {events.length > 0 ? (
              <div className="border-t border-[var(--line)]">
                {events.slice(0, 5).map((event) => (
                  <GigRow key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="dj-mono border-t border-[var(--line)] pt-5 text-[12px] font-bold uppercase leading-relaxed tracking-[0.06em] text-[var(--ink-soft)]">
                No public shows listed — available for private bookings.
              </p>
            )}
          </section>

          {/* ── PRESS / TESTIMONIALS ────────────────────────── */}
          {testimonials.length > 0 ? (
            <section className="dj-scroll">
              <SectionHead title="Press" />
              <div className="hide-scrollbar -mx-5 flex snap-x items-stretch gap-4 overflow-x-auto px-5 pb-1">
                {testimonials.map((item, index) => (
                  <TestimonialCard key={item.id || index} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          {/* ── CONNECT ─────────────────────────────────────── */}
          {featuredLinks.length > 0 ? (
            <section className="dj-scroll">
              <SectionHead title="Connect" />
              <div className="border-t border-[var(--line)]">
                {featuredLinks.slice(0, 8).map((link) => (
                  <LinkRow key={`${link.label}-${link.url}`} link={link} />
                ))}
              </div>
            </section>
          ) : null}

          {/* ── BOOKING CLOSER ──────────────────────────────── */}
          <section className="dj-scroll border-t border-[var(--line)] pt-6">
            <h2 className="dj-display mt-3 text-[clamp(40px,12vw,60px)] uppercase leading-[0.98] tracking-[-0.02em] text-[var(--ink)]">
              For Bookings
              <br />
              &amp; Press
            </h2>

            <div className="mt-7 space-y-4">
              {site.bookingEmail ? (
                <a
                  href={`mailto:${site.bookingEmail}`}
                  className="group flex items-center justify-between gap-4 border-b border-[var(--ink)] pb-3 text-[var(--ink)]"
                >
                  <span className="dj-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                    Email
                  </span>
                  <span className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em]">
                    {site.bookingEmail}
                    <ArrowUpRight
                      size={18}
                      className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </a>
              ) : null}
              {site.whatsappUrl ? (
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 border-b border-[var(--ink)] pb-3 text-[var(--ink)]"
                >
                  <span className="dj-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                    Direct
                  </span>
                  <span className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em]">
                    WhatsApp
                    <ArrowUpRight
                      size={18}
                      className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </a>
              ) : null}
            </div>
          </section>

          <footer className="border-t border-[var(--line)] pt-5">
            <p className="dj-mono flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              <span>{site.artistName}</span>
              <span>Powered by DJ Visuals AI</span>
            </p>
          </footer>
        </div>

        {/* ── STICKY BOOKING BAR ──────────────────────────────── */}
        {bookingUrl ? (
          <div className="sticky bottom-0 z-30 -mx-px border-t border-[var(--ink)] bg-[var(--paper)]/95 p-3 backdrop-blur">
            <a
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex h-[54px] items-center justify-between border border-[var(--ink)] bg-[var(--ink)] px-5 text-[var(--paper)] transition hover:bg-[var(--accent)] hover:border-[var(--accent)]"
            >
              <span className="dj-mono text-[13px] font-bold uppercase tracking-[0.12em]">
                Book {site.artistName}
              </span>
              <ArrowUpRight
                size={20}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        ) : null}
      </div>
    </main>
  );
}
