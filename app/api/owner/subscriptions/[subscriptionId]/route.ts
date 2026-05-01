import { NextResponse } from "next/server";

import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/generated/prisma/enums";
import { canAccessOwnerArea } from "@/lib/owner-access";
import { prisma } from "@/lib/prisma";
import { validateMutationOrigin } from "@/lib/request-security";

type Params = {
  params: Promise<{
    subscriptionId: string;
  }>;
};

const allowedPlans = new Set<string>([
  SubscriptionPlan.FREE,
  SubscriptionPlan.PRO,
  SubscriptionPlan.PROFESSIONAL,
  SubscriptionPlan.STUDIO,
]);

const allowedStatuses = new Set<string>([
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
  SubscriptionStatus.CANCELED,
  SubscriptionStatus.EXPIRED,
]);

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

    const { subscriptionId } = await params;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Assinatura inválida." },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      plan?: string;
      status?: string;
    } | null;

    const plan = body?.plan;
    const status = body?.status;

    if (!plan || !allowedPlans.has(plan)) {
      return NextResponse.json(
        { error: "Plano inválido." },
        { status: 400 },
      );
    }

    if (!status || !allowedStatuses.has(status)) {
      return NextResponse.json(
        { error: "Status inválido." },
        { status: 400 },
      );
    }

    const existing = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Assinatura não encontrada." },
        { status: 404 },
      );
    }

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        plan: plan as SubscriptionPlan,
        status: status as SubscriptionStatus,
      },
      select: {
        id: true,
        plan: true,
        status: true,
        workspaceId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updated,
    });
  } catch (error) {
    console.error("Erro ao atualizar assinatura no owner:", error);

    return NextResponse.json(
      { error: "Não foi possível atualizar a assinatura." },
      { status: 500 },
    );
  }
}
