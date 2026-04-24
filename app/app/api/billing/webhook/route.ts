import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Este webhook legado foi desativado. Ative a integração da Stripe somente quando concluir o fluxo de pagamentos.",
    },
    { status: 410 },
  );
}