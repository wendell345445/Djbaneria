import { DjSiteEditor } from "@/components/dj-site-editor";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

function buildDefaultSite(workspace: Awaited<ReturnType<typeof requireCurrentWorkspace>>) {
  const artistName = workspace.name || workspace.user?.name || "DJ Artist";
  const slug = slugify(workspace.slug || artistName) || "dj-artist";

  return {
    slug,
    artistName,
    headline: "Official DJ profile, booking and events.",
    bio: "Add your short artist bio, music style, city and booking information.",
    location: null,
    profileImageUrl: null,
    coverImageUrl: null,
    instagramUrl: null,
    tiktokUrl: null,
    soundcloudUrl: null,
    spotifyUrl: null,
    youtubeUrl: null,
    whatsappUrl: null,
    bookingEmail: workspace.user?.email || null,
    theme: "NEON_DARK",
    accentColor: "#00F5FF",
    isPublished: false,
    links: [],
    events: [],
  };
}

function serializeSite(site: any) {
  return {
    slug: site.slug,
    artistName: site.artistName,
    headline: site.headline,
    bio: site.bio,
    location: site.location,
    profileImageUrl: site.profileImageUrl,
    coverImageUrl: site.coverImageUrl,
    instagramUrl: site.instagramUrl,
    tiktokUrl: site.tiktokUrl,
    soundcloudUrl: site.soundcloudUrl,
    spotifyUrl: site.spotifyUrl,
    youtubeUrl: site.youtubeUrl,
    whatsappUrl: site.whatsappUrl,
    bookingEmail: site.bookingEmail,
    theme: site.theme,
    accentColor: site.accentColor,
    isPublished: site.isPublished,
    links: (site.links || []).map((link: any) => ({
      label: link.label,
      url: link.url,
      position: link.position,
      isActive: link.isActive,
    })),
    events: (site.events || []).map((event: any) => ({
      title: event.title,
      venue: event.venue,
      city: event.city,
      eventDate: event.eventDate ? event.eventDate.toISOString() : null,
      ticketUrl: event.ticketUrl,
      flyerUrl: event.flyerUrl,
      position: event.position,
      isActive: event.isActive,
    })),
  };
}

export default async function DjSiteDashboardPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(
    workspace.user?.preferredLocale || "en",
  ) as SupportedLocale;

  const site = await (prisma as any).djSite.findUnique({
    where: { workspaceId: workspace.id },
    include: {
      links: { orderBy: { position: "asc" } },
      events: { orderBy: [{ eventDate: "asc" }, { position: "asc" }] },
    },
  });

  return (
    <DjSiteEditor
      locale={locale}
      initialSite={site ? serializeSite(site) : buildDefaultSite(workspace)}
    />
  );
}
