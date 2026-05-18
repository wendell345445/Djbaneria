import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionCookie, signSessionToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email-verification";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  rememberSession: z.boolean().optional().default(true),
});

const LOGIN_IP_RATE_LIMIT = {
  limit: 30,
  windowMs: 10 * 60 * 1000,
};

const LOGIN_EMAIL_RATE_LIMIT = {
  limit: 8,
  windowMs: 10 * 60 * 1000,
};

function rateLimitResponse(result: {
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}) {
  return NextResponse.json(
    {
      error:
        "Too many login attempts. Please wait a few minutes and try again.",
    },
    {
      status: 429,
      headers: buildRateLimitHeaders(result),
    },
  );
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const ipRateLimit = await consumeRateLimit(
      `auth:login:ip:${clientIp}`,
      LOGIN_IP_RATE_LIMIT,
    );

    if (!ipRateLimit.allowed) {
      return rateLimitResponse(ipRateLimit);
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Invalid data." },
        { status: 400 },
      );
    }

    const { password, rememberSession } = parsed.data;
    const email = normalizeEmail(parsed.data.email);

    const emailRateLimit = await consumeRateLimit(
      `auth:login:email:${email}`,
      LOGIN_EMAIL_RATE_LIMIT,
    );

    if (!emailRateLimit.allowed) {
      return rateLimitResponse(emailRateLimit);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        passwordHash: true,
        workspaces: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 },
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Your account is disabled." },
        { status: 403 },
      );
    }

    const passwordIsValid = await verifyPassword(password, user.passwordHash);

    if (!passwordIsValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 },
      );
    }

    const activeWorkspace =
      user.workspaces.find((workspace) => workspace.isActive !== false) ??
      user.workspaces[0] ??
      null;

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      workspaceId: activeWorkspace?.id ?? null,
    });

    await setSessionCookie(token, rememberSession);

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "We could not sign you in." },
      { status: 500 },
    );
  }
}
