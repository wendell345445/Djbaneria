import { NextResponse } from "next/server";

import { canAccessOwnerArea } from "@/lib/owner-access";
import { prisma } from "@/lib/prisma";
import { validateMutationOrigin } from "@/lib/request-security";

type Params = {
  params: Promise<{
    userId: string;
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

    const { userId } = await params;

    if (access.user?.id === userId) {
      return NextResponse.json(
        { error: "Não é permitido inativar a própria conta por esta área." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
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
      user: updated,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário no owner:", error);

    return NextResponse.json(
      { error: "Não foi possível atualizar o usuário." },
      { status: 500 },
    );
  }
}
