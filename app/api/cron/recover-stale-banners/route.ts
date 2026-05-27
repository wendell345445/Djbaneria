import { NextResponse } from "next/server";

import { recoverStalePendingBanners } from "@/lib/banner-generation-recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  return scheme?.toLowerCase() === "bearer" ? token : null;
}

export async function GET(request: Request) {
  const recoverySecret = process.env.BANNER_RECOVERY_SECRET || process.env.CRON_SECRET;

  if (!recoverySecret) {
    return NextResponse.json(
      {
        error:
          "Configure BANNER_RECOVERY_SECRET ou CRON_SECRET para liberar a recuperação automática de flyers.",
      },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const token = getBearerToken(request) || url.searchParams.get("secret");

  if (token !== recoverySecret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const requestedLimit = Number(url.searchParams.get("limit") || 50);
  const limit = Math.max(1, Math.min(requestedLimit, 100));

  const result = await recoverStalePendingBanners({
    limit,
    reason: "cron_stale_pending_recovery",
  });

  return NextResponse.json({
    ok: true,
    message: "Recuperação de flyers pendentes concluída.",
    ...result,
  });
}
