import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth";
import {
  generateEmailVerificationCode,
  getEmailVerificationExpiresAt,
  hashEmailVerificationCode,
  normalizeEmail,
} from "@/lib/email-verification";
import { sendVerificationCodeEmail } from "@/lib/email";
import { validateSignupEmailDomain } from "@/lib/disposable-email";
import { prisma } from "@/lib/prisma";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";
import { validateTurnstileToken } from "@/lib/turnstile";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  artistName: z.string().trim().optional(),
  turnstileToken: z.string().trim().optional().default(""),
});

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit(`auth:register:${ip}`, {
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas contas criadas em sequência. Aguarde um pouco e tente novamente." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Dados inválidos." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const turnstileResult = await validateTurnstileToken({
      token: parsed.data.turnstileToken,
      ip,
    });

    if (!turnstileResult.success) {
      return NextResponse.json(
        {
          error:
            turnstileResult.error ||
            "Confirme que você não é um robô para continuar.",
        },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const { name, password, artistName } = parsed.data;
    const email = normalizeEmail(parsed.data.email);

    const emailDomainValidation = validateSignupEmailDomain(email);

    if (!emailDomainValidation.allowed) {
      return NextResponse.json(
        { error: emailDomainValidation.error },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerifiedAt: true },
    });

    if (existingUser?.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Já existe uma conta verificada com esse e-mail." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const passwordHash = await hashPassword(password);
    const code = generateEmailVerificationCode();
    const codeHash = hashEmailVerificationCode(email, code);
    const expiresAt = getEmailVerificationExpiresAt();

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        name,
        email,
        passwordHash,
        emailVerificationCodeHash: codeHash,
        emailVerificationExpiresAt: expiresAt,
        emailVerificationSentAt: new Date(),
        emailVerificationAttempts: 0,
        workspaces: {
          create: {
            name: artistName?.trim() || name,
          },
        },
      },
      update: {
        name,
        passwordHash,
        emailVerificationCodeHash: codeHash,
        emailVerificationExpiresAt: expiresAt,
        emailVerificationSentAt: new Date(),
        emailVerificationAttempts: 0,
      },
      select: { name: true, email: true },
    });

    const emailResult = await sendVerificationCodeEmail({
      to: user.email,
      name: user.name,
      code,
    });

    return NextResponse.json(
      {
        success: true,
        redirectTo: `/verify-email?email=${encodeURIComponent(email)}`,
        devVerificationCode: emailResult.devMode ? code : undefined,
      },
      { headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);

    return NextResponse.json(
      { error: "Não foi possível criar sua conta." },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }
}
