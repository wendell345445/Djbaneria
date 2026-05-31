import { NextResponse } from "next/server";

import { cleanupStaleUnusedDjSiteAssets } from "@/lib/dj-site-asset-cleanup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret =
    process.env.CRON_SECRET ||
    process.env.INTERNAL_CRON_SECRET ||
    process.env.DJ_SITE_CLEANUP_SECRET;

  if (!secret) return false;

  const url = new URL(request.url);
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
  const querySecret = url.searchParams.get("secret");

  return bearer === secret || querySecret === secret;
}

async function runCleanup(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const hours = Number(url.searchParams.get("hours") || "24");
  const olderThanHours = Number.isFinite(hours) && hours >= 1 ? hours : 24;

  const result = await cleanupStaleUnusedDjSiteAssets({
    olderThanHours,
    maxWorkspaces: 50,
    maxDeletePerWorkspace: 50,
  });

  return NextResponse.json({
    ok: true,
    message: "Limpeza de imagens não usadas do DJ Site concluída.",
    ...result,
  });
}

export async function GET(request: Request) {
  return runCleanup(request);
}

export async function POST(request: Request) {
  return runCleanup(request);
}
