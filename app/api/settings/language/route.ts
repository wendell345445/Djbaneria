import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { normalizeLocale, SUPPORTED_LOCALES } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  completeOnboarding: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Idioma inválido." },
        { status: 400 },
      );
    }

    const locale = normalizeLocale(parsed.data.locale);

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        preferredLocale: locale,
        languageOnboardingCompleted: true,
      },
      select: {
        preferredLocale: true,
        languageOnboardingCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      locale: updatedUser.preferredLocale,
      languageOnboardingCompleted: updatedUser.languageOnboardingCompleted,
      message: "Idioma atualizado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar idioma:", error);

    return NextResponse.json(
      { error: "Não foi possível salvar o idioma." },
      { status: 500 },
    );
  }
}
