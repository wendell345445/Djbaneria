import { NextResponse } from "next/server";
import { z } from "zod";

import {
  canResendVerificationCode,
  generateEmailVerificationCode,
  getEmailVerificationExpiresAt,
  getResendWaitSeconds,
  hashEmailVerificationCode,
  normalizeEmail,
} from "@/lib/email-verification";
import { sendVerificationCodeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit(`auth:resend-email:${ip}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many resend attempts. Wait a moment and try again." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const email = normalizeEmail(parsed.data.email);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerifiedAt: true,
        emailVerificationSentAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { success: true, alreadyVerified: true, redirectTo: "/login" },
        { headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (!canResendVerificationCode(user.emailVerificationSentAt)) {
      return NextResponse.json(
        {
          error: `Wait ${getResendWaitSeconds(
            user.emailVerificationSentAt,
          )}s before resending the code.`,
        },
        { status: 429, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const code = generateEmailVerificationCode();
    const codeHash = hashEmailVerificationCode(email, code);
    const expiresAt = getEmailVerificationExpiresAt();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCodeHash: codeHash,
        emailVerificationExpiresAt: expiresAt,
        emailVerificationSentAt: new Date(),
        emailVerificationAttempts: 0,
      },
    });

    const emailResult = await sendVerificationCodeEmail({
      to: user.email,
      name: user.name,
      code,
    });

    return NextResponse.json(
      {
        success: true,
        devVerificationCode: emailResult.devMode ? code : undefined,
      },
      { headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    console.error("Error resending verification code:", error);

    return NextResponse.json(
      { error: "We could not resend the code." },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }
}
