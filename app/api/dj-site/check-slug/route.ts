import { NextResponse } from "next/server";

import { djSiteSlugSchema } from "@/lib/dj-site-validation";
import { prisma } from "@/lib/prisma";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit(
    `dj-site:check-slug:${workspace.id}:${getClientIp(request)}`,
    { limit: 60, windowMs: 60_000 },
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many slug checks. Please try again shortly." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const url = new URL(request.url);
  const parsed = djSiteSlugSchema.safeParse(url.searchParams.get("slug") || "");

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        available: false,
        error: firstIssue?.message || "Invalid slug.",
      },
      { status: 400 },
    );
  }

  const slug = parsed.data;
  const existing = await (prisma as any).djSite.findFirst({
    where: {
      slug,
      workspaceId: { not: workspace.id },
    },
    select: { id: true },
  });

  return NextResponse.json({
    slug,
    available: !existing,
  });
}
