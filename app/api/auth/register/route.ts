import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  artistName: z.string().trim().optional(),
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

    const { name, email, password, artistName } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe uma conta com esse e-mail." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    await prisma.workspace.create({
      data: {
        name: artistName?.trim() || name,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      redirectTo: "/login",
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);

    return NextResponse.json(
      { error: "Não foi possível criar sua conta." },
      { status: 500 },
    );
  }
}
