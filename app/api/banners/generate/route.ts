import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error: "Esta rota antiga foi desativada. Use /api/banners/generate.",
    },
    { status: 410 },
  );
}
