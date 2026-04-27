import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionCookie, signSessionToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email-verification";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  rememberSession: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
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
