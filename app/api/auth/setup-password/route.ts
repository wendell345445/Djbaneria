import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth";
import { hashPasswordSetupToken } from "@/lib/paid-signup";
import { prisma } from "@/lib/prisma";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";
import { setSessionCookie, signSessionToken } from "@/lib/session";

const schema = z.object({
  token: z.string().trim().min(20, "Invalid setup link."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit(`auth:setup-password:${ip}`, {
    limit: 12,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a moment and try again." },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const tokenHash = hashPasswordSetupToken(parsed.data.token);
    const now = new Date();

    const user = await prisma.user.findFirst({
      where: {
        passwordSetupTokenHash: tokenHash,
        passwordSetupExpiresAt: {
          gt: now,
        },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
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
        { error: "This setup link is invalid or expired." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerifiedAt: now,
        passwordSetupTokenHash: null,
        passwordSetupExpiresAt: null,
        passwordSetupSentAt: null,
      },
    });

    const activeWorkspace =
      user.workspaces.find((workspace) => workspace.isActive !== false) ??
      user.workspaces[0] ??
      null;

    const sessionToken = await signSessionToken({
      userId: user.id,
      email: user.email,
      workspaceId: activeWorkspace?.id ?? null,
    });

    await setSessionCookie(sessionToken, true);

    return NextResponse.json(
      {
        success: true,
        redirectTo: "/dashboard/banners/new?tour=1",
      },
      { headers: buildRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    console.error("Setup password error:", error);

    return NextResponse.json(
      { error: "We could not create your password." },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }
}
