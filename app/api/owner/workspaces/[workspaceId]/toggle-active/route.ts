import { NextResponse } from "next/server";

import { canAccessOwnerArea } from "@/lib/owner-access";
import { prisma } from "@/lib/prisma";
import { validateMutationOrigin } from "@/lib/request-security";

type Params = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const originError = validateMutationOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const access = await canAccessOwnerArea();

    if (!access.ok) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const { workspaceId } = await params;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace inválido." },
        { status: 400 },
      );
    }

    const existing = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Workspace não encontrado." },
        { status: 404 },
      );
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        isActive: !existing.isActive,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      action: updated.isActive ? "activated" : "deactivated",
      workspace: updated,
    });
  } catch (error) {
    console.error("Erro ao atualizar workspace no owner:", error);

    return NextResponse.json(
      { error: "Não foi possível atualizar o workspace." },
      { status: 500 },
    );
  }
}
