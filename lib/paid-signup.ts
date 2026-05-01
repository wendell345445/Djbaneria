import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import Stripe from "stripe";

import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email-verification";
import { sendAccountSetupEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/stripe";

const PASSWORD_SETUP_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

function getTokenSecret() {
  return process.env.AUTH_SECRET || process.env.STRIPE_SECRET_KEY || "dev-secret";
}

export function hashPasswordSetupToken(token: string) {
  return createHash("sha256")
    .update(`${token}:${getTokenSecret()}`)
    .digest("hex");
}

function createPasswordSetupToken() {
  return randomBytes(32).toString("base64url");
}

function getPasswordSetupExpiresAt() {
  return new Date(Date.now() + PASSWORD_SETUP_TOKEN_TTL_MS);
}

function tokenWasRecentlySent(sentAt?: Date | string | null) {
  if (!sentAt) return false;

  const date = sentAt instanceof Date ? sentAt : new Date(sentAt);
  if (!Number.isFinite(date.getTime())) return false;

  return Date.now() - date.getTime() < 1000 * 60 * 10;
}

function tokenIsStillValid(expiresAt?: Date | string | null) {
  if (!expiresAt) return false;

  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (!Number.isFinite(date.getTime())) return false;

  return date.getTime() > Date.now();
}

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

    if (!existing) return slug;

    attempt += 1;
    slug = `${baseSlug}-${attempt}-${randomUUID().slice(0, 4)}`;
  }
}

function getPlanLabel(plan: SubscriptionPlan | string) {
  const labels: Record<string, string> = {
    FREE: "Free",
    PRO: "Pro",
    PROFESSIONAL: "Professional",
    STUDIO: "Studio",
  };

  return labels[String(plan)] || String(plan);
}

function getEmailFromCheckoutSession(session: Stripe.Checkout.Session) {
  return (
    session.customer_details?.email ||
    session.customer_email ||
    null
  );
}

function getNameFromCheckoutSession(session: Stripe.Checkout.Session, email: string) {
  return (
    session.customer_details?.name ||
    email.split("@")[0]?.replace(/[._-]+/g, " ").trim() ||
    "DJ"
  );
}

export async function ensurePaidSignupAccountFromCheckoutSession(params: {
  session: Stripe.Checkout.Session;
  plan: SubscriptionPlan;
  stripeCustomerId?: string | null;
}) {
  const emailFromStripe = getEmailFromCheckoutSession(params.session);

  if (!emailFromStripe) {
    throw new Error("Stripe checkout session does not include a customer email.");
  }

  const email = normalizeEmail(emailFromStripe);
  const name = getNameFromCheckoutSession(params.session, email);
  const workspaceName = name || "DJ Workspace";

  let user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      passwordSetupTokenHash: true,
      passwordSetupExpiresAt: true,
      passwordSetupSentAt: true,
      workspaces: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          subscription: {
            select: {
              id: true,
              providerCustomerId: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!user) {
    const temporaryPasswordHash = await hashPassword(randomBytes(24).toString("base64url"));
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: temporaryPasswordHash,
        isActive: true,
        emailVerifiedAt: new Date(),
        preferredLocale: "en",
        languageOnboardingCompleted: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        passwordSetupTokenHash: true,
        passwordSetupExpiresAt: true,
        passwordSetupSentAt: true,
        workspaces: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            subscription: {
              select: {
                id: true,
                providerCustomerId: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  } else if (!user.email || user.email !== email) {
    throw new Error("Invalid paid signup user state.");
  }

  let workspace = user.workspaces[0] ?? null;

  if (!workspace) {
    const slug = await buildUniqueWorkspaceSlug(workspaceName);

    workspace = await prisma.workspace.create({
      data: {
        userId: user.id,
        name: workspaceName,
        slug,
        isActive: true,
        subscription: {
          create: {
            plan: params.plan,
            status: SubscriptionStatus.TRIALING,
            provider: "stripe",
            providerCustomerId: params.stripeCustomerId || null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            providerCustomerId: true,
          },
        },
      },
    });
  }

  const shouldReuseExistingToken =
    tokenIsStillValid(user.passwordSetupExpiresAt) &&
    tokenWasRecentlySent(user.passwordSetupSentAt);

  let setupEmailSent = false;
  let setupEmailDevMode = false;

  if (!shouldReuseExistingToken) {
    const token = createPasswordSetupToken();
    const tokenHash = hashPasswordSetupToken(token);
    const expiresAt = getPasswordSetupExpiresAt();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        passwordSetupTokenHash: tokenHash,
        passwordSetupExpiresAt: expiresAt,
        passwordSetupSentAt: new Date(),
      },
    });

    const setupUrl = `${getAppUrl()}/setup-password?token=${encodeURIComponent(token)}`;
    const emailResult = await sendAccountSetupEmail({
      to: email,
      name: user.name || name,
      setupUrl,
      plan: getPlanLabel(params.plan),
    });

    setupEmailSent = emailResult.sent;
    setupEmailDevMode = emailResult.devMode;
  }

  return {
    userId: user.id,
    userEmail: email,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    setupEmailSent,
    setupEmailDevMode,
  };
}
