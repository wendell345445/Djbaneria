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
import { setSessionCookie, signSessionToken } from "@/lib/session";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
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
      { error: "Too many attempts. Wait a moment and try again." },
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
    const code = parsed.data.code;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isActive: true,
        emailVerifiedAt: true,
        emailVerificationCodeHash: true,
        emailVerificationExpiresAt: true,
        emailVerificationAttempts: true,
        workspaces: {
          select: {
            id: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Your account is disabled." },
        { status: 403, headers: buildRateLimitHeaders(rateLimit) },
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
        { error: "Too many incorrect attempts. Request a new code." },
        { status: 429, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    if (
      !user.emailVerificationCodeHash ||
      isEmailVerificationExpired(user.emailVerificationExpiresAt)
    ) {
      return NextResponse.json(
        { error: "Code expired. Request a new code." },
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
        { error: "Invalid code." },
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

    const activeWorkspace =
      user.workspaces.find((workspace) => workspace.isActive !== false) ??
      user.workspaces[0] ??
      null;

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      workspaceId: activeWorkspace?.id ?? null,
    });

    await setSessionCookie(token, true);

    return NextResponse.json(
      { success: true, redirectTo: "/dashboard" },
      { headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    console.error("Error verifying email:", error);

    return NextResponse.json(
      { error: "We could not verify your email." },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }
}
