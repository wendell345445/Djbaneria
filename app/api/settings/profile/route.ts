import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getOrCreateDemoWorkspace } from "@/lib/workspace";

const schema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, "Informe o nome do workspace.")
    .max(80, "Nome do workspace muito longo."),
  userName: z
    .string()
    .trim()
    .min(2, "Informe o nome do usuário.")
    .max(80, "Nome do usuário muito longo."),
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

    const workspace = await getOrCreateDemoWorkspace();
    const userId = workspace.userId ?? workspace.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário do workspace não encontrado." },
        { status: 404 },
      );
    }

    const { workspaceName, userName } = parsed.data;

    await prisma.$transaction([
      prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          name: workspaceName,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          name: userName,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Informações atualizadas com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao salvar perfil/configurações:", error);

    return NextResponse.json(
      {
        error: "Não foi possível salvar as configurações.",
      },
      { status: 500 },
    );
  }
}
