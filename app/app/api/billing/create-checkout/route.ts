import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Esta rota antiga foi desativada. Ative o checkout atual somente quando concluir a integração da Stripe.",
    },
    { status: 410 },
  );
}