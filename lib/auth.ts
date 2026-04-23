import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  type SessionPayload,
  verifySessionToken,
} from "@/lib/session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      workspaces: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user.workspaces[0] ?? null;
}

export async function requireWorkspace() {
  const user = await requireUser();
  const workspace = user.workspaces[0] ?? null;

  if (!workspace) {
    redirect("/dashboard");
  }

  return workspace;
}
