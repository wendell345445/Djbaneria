import "server-only";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "dj_saas_session";

export type SessionPayload = {
  userId: string;
  email?: string;
  workspaceId?: string | null;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET não definido.");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    if (typeof payload.userId !== "string") {
      return null;
    }

    return {
      userId: payload.userId,
      email: typeof payload.email === "string" ? payload.email : undefined,
      workspaceId:
        typeof payload.workspaceId === "string" ? payload.workspaceId : null,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
