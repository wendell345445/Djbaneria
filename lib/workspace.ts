import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";

import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

async function buildUniqueWorkspaceSlug(baseName: string) {
  const baseSlug = slugify(baseName) || "workspace";
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const existing = await prisma.workspace.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    attempt += 1;
    slug = `${baseSlug}-${attempt}-${randomUUID().slice(0, 4)}`;
  }
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const existingWorkspace = await prisma.workspace.findFirst({
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

  if (existingWorkspace) {
    return existingWorkspace;
  }

  const workspaceName = user.name?.trim() || "Meu Workspace";
  const slug = await buildUniqueWorkspaceSlug(workspaceName);

  return prisma.workspace.create({
    data: {
      userId: user.id,
      name: workspaceName,
      slug,
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
}

export async function requireCurrentWorkspace() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login");
  }

  return workspace;
}

export type WorkspaceWithSubscription = Awaited<
  ReturnType<typeof getCurrentWorkspace>
>;
