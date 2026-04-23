import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";

import { prisma } from "@/lib/prisma";

export async function getOrCreateDemoWorkspace() {
  const existingWorkspace = await prisma.workspace.findFirst({
    include: {
      subscription: true,
      user: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existingWorkspace) {
    return existingWorkspace;
  }

  const demoEmail = "demo@djbannerai.local";

  const workspace = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: {
        email: demoEmail,
      },
    });

    const user =
      existingUser ??
      (await tx.user.create({
        data: {
          email: demoEmail,
          name: "Demo User",
        },
      }));

    const existingUserWorkspace = await tx.workspace.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        subscription: true,
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (existingUserWorkspace) {
      return existingUserWorkspace;
    }

    return tx.workspace.create({
      data: {
        userId: user.id,
        name: "Meu Workspace",
        subscription: {
          create: {
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.TRIALING,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(
              new Date().setMonth(new Date().getMonth() + 1),
            ),
          },
        },
      },
      include: {
        subscription: true,
        user: true,
      },
    });
  });

  return workspace;
}

export type WorkspaceWithSubscription = Awaited<
  ReturnType<typeof getOrCreateDemoWorkspace>
>;
