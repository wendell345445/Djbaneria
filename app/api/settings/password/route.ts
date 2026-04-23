import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "A confirmação da nova senha não confere.",
    path: ["confirmPassword"],
  });

export async function PATCH(request: Request) {
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

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Sua conta não possui senha configurada." },
        { status: 400 },
      );
    }

    const passwordIsValid = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      return NextResponse.json(
        { error: "A senha atual está incorreta." },
        { status: 400 },
      );
    }

    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return NextResponse.json(
        { error: "A nova senha precisa ser diferente da senha atual." },
        { status: 400 },
      );
    }

    const newPasswordHash = await hashPassword(parsed.data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);

    return NextResponse.json(
      { error: "Não foi possível alterar a senha." },
      { status: 500 },
    );
  }
}
