import { NextResponse } from "next/server";

function getExpectedOriginFromRequest(request: Request) {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";

  if (!host) return null;

  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

export function validateMutationOrigin(request: Request) {
  const method = request.method.toUpperCase();

  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return null;
  }

  const origin = request.headers.get("origin");
  const expectedOrigin = getExpectedOriginFromRequest(request);

  if (!expectedOrigin) {
    return NextResponse.json(
      { error: "Não foi possível validar a origem da requisição." },
      { status: 403 },
    );
  }

  if (!origin) {
    return NextResponse.json(
      { error: "Requisição sem origem válida." },
      { status: 403 },
    );
  }

  try {
    const normalizedOrigin = new URL(origin).origin;
    const normalizedExpected = new URL(expectedOrigin).origin;

    if (normalizedOrigin !== normalizedExpected) {
      return NextResponse.json(
        { error: "Origem da requisição não permitida." },
        { status: 403 },
      );
    }

    return null;
  } catch {
    return NextResponse.json(
      { error: "Origem da requisição inválida." },
      { status: 403 },
    );
  }
}
