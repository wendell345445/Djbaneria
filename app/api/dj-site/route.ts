import { NextResponse } from "next/server";

import { cleanupUnusedDjSiteAssets } from "@/lib/dj-site-asset-cleanup";
import { djSiteUpdateSchema } from "@/lib/dj-site-validation";
import { prisma } from "@/lib/prisma";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getApiErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export async function GET() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = await (prisma as any).djSite.findUnique({
    where: { workspaceId: workspace.id },
    include: {
      links: { orderBy: { position: "asc" } },
      events: { orderBy: [{ eventDate: "asc" }, { position: "asc" }] },
    },
  });

  return NextResponse.json({ site });
}

export async function PUT(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit(
    `dj-site:update:${workspace.id}:${getClientIp(request)}`,
    { limit: 25, windowMs: 60_000 },
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many update attempts. Please try again shortly." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  try {
    const payload = await request.json();
    const parsed = djSiteUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message || "Invalid DJ site payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const existingSlug = await (prisma as any).djSite.findFirst({
      where: {
        slug: data.slug,
        workspaceId: { not: workspace.id },
      },
      select: { id: true },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "This slug is already taken." },
        { status: 409 },
      );
    }

    const savedSite = await prisma.$transaction(async (tx) => {
      const site = await (tx as any).djSite.upsert({
        where: { workspaceId: workspace.id },
        create: {
          workspaceId: workspace.id,
          slug: data.slug,
          artistName: data.artistName,
          headline: data.headline,
          bio: data.bio,
          location: data.location,
          profileImageUrl: data.profileImageUrl,
          coverImageUrl: data.coverImageUrl,
          instagramUrl: data.instagramUrl,
          tiktokUrl: data.tiktokUrl,
          soundcloudUrl: data.soundcloudUrl,
          spotifyUrl: data.spotifyUrl,
          youtubeUrl: data.youtubeUrl,
          whatsappUrl: data.whatsappUrl,
          bookingEmail: data.bookingEmail,
          theme: data.theme,
          accentColor: data.accentColor,
          isPublished: data.isPublished,
          showAgenda: data.showAgenda ?? true,
        },
        update: {
          slug: data.slug,
          artistName: data.artistName,
          headline: data.headline,
          bio: data.bio,
          location: data.location,
          profileImageUrl: data.profileImageUrl,
          coverImageUrl: data.coverImageUrl,
          instagramUrl: data.instagramUrl,
          tiktokUrl: data.tiktokUrl,
          soundcloudUrl: data.soundcloudUrl,
          spotifyUrl: data.spotifyUrl,
          youtubeUrl: data.youtubeUrl,
          whatsappUrl: data.whatsappUrl,
          bookingEmail: data.bookingEmail,
          theme: data.theme,
          accentColor: data.accentColor,
          isPublished: data.isPublished,
          showAgenda: data.showAgenda ?? true,
        },
      });

      await (tx as any).djSiteLink.deleteMany({
        where: { siteId: site.id },
      });

      if (data.links.length > 0) {
        await (tx as any).djSiteLink.createMany({
          data: data.links.map((link, index) => ({
            siteId: site.id,
            label: link.label,
            url: link.url || "",
            position: link.position ?? index,
            isActive: link.isActive,
          })),
        });
      }

      await (tx as any).djSiteEvent.deleteMany({
        where: { siteId: site.id },
      });

      if (data.events.length > 0) {
        await (tx as any).djSiteEvent.createMany({
          data: data.events.map((event, index) => ({
            siteId: site.id,
            title: event.title,
            venue: event.venue,
            city: event.city,
            eventDate: event.eventDate,
            ticketUrl: event.ticketUrl,
            flyerUrl: event.flyerUrl,
            position: event.position ?? index,
            isActive: event.isActive,
          })),
        });
      }

      return (tx as any).djSite.findUnique({
        where: { id: site.id },
        include: {
          links: { orderBy: { position: "asc" } },
          events: { orderBy: [{ eventDate: "asc" }, { position: "asc" }] },
        },
      });
    });

    let assetCleanup:
      | Awaited<ReturnType<typeof cleanupUnusedDjSiteAssets>>
      | null = null;

    try {
      assetCleanup = await cleanupUnusedDjSiteAssets(workspace.id, {
        keepUrls: [data.profileImageUrl, data.coverImageUrl],
        maxDelete: 50,
      });
    } catch (cleanupError) {
      console.error("[dj-site] failed to cleanup unused DJ site assets", cleanupError);
    }

    return NextResponse.json({ ok: true, site: savedSite, assetCleanup });
  } catch (error) {
    console.error("[dj-site] failed to save DJ site", error);

    return NextResponse.json(
      {
        error: "Could not save DJ site.",
        details:
          process.env.NODE_ENV === "development"
            ? getApiErrorMessage(error)
            : undefined,
      },
      { status: 500 },
    );
  }
}
