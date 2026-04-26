import { NextResponse } from "next/server";
import { z } from "zod";

import {
  hashEmailVerificationCode,
  isEmailVerificationExpired,
  normalizeEmail,
} from "@/lib/email-verification";
import { prisma } from "@/lib/prisma";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  code: z.string().trim().regex(/^\d{6}$/, "Informe o código de 6 dígitos."),
});

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit(`auth:verify-email:${ip}`, {
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um pouco e tente novamente." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const code = parsed.data.code;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerifiedAt: true,
        emailVerificationCodeHash: true,
        emailVerificationExpiresAt: true,
        emailVerificationAttempts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Conta não encontrada." },
        { status: 404, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { success: true, redirectTo: "/login" },
        { headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (user.emailVerificationAttempts >= 5) {
      return NextResponse.json(
        { error: "Muitas tentativas incorretas. Solicite um novo código." },
        { status: 429, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (
      !user.emailVerificationCodeHash ||
      isEmailVerificationExpired(user.emailVerificationExpiresAt)
    ) {
      return NextResponse.json(
        { error: "Código expirado. Solicite um novo código." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const codeHash = hashEmailVerificationCode(email, code);

    if (codeHash !== user.emailVerificationCodeHash) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationAttempts: { increment: 1 },
        },
      });

      return NextResponse.json(
        { error: "Código inválido." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationCodeHash: null,
        emailVerificationExpiresAt: null,
        emailVerificationAttempts: 0,
      },
    });

    return NextResponse.json(
      { success: true, redirectTo: "/login?verified=1" },
      { headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    console.error("Erro ao verificar e-mail:", error);

    return NextResponse.json(
      { error: "Não foi possível verificar seu e-mail." },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }
}
