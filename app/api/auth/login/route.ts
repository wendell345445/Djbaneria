import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionCookie, signSessionToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email-verification";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
  rememberSession: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Dados inválidos." },
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
        emailVerifiedAt: true,
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
        { error: "E-mail ou senha inválidos." },
        { status: 400 },
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Sua conta está desativada." },
        { status: 403 },
      );
    }

    const passwordIsValid = await verifyPassword(password, user.passwordHash);

    if (!passwordIsValid) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 400 },
      );
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json({
        success: true,
        requiresEmailVerification: true,
        redirectTo: `/verify-email?email=${encodeURIComponent(user.email)}`,
      });
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
    console.error("Erro ao efetuar login:", error);

    return NextResponse.json(
      { error: "Não foi possível entrar." },
      { status: 500 },
    );
  }
}
