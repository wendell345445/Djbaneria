import "server-only";

import { createHash, randomInt } from "node:crypto";

const VERIFICATION_CODE_TTL_MINUTES = 15;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generateEmailVerificationCode() {
  return String(randomInt(100000, 1000000));
}

export function getEmailVerificationExpiresAt() {
  return new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);
}

export function hashEmailVerificationCode(email: string, code: string) {
  const secret = process.env.AUTH_SECRET || "dev-email-verification-secret";

  return createHash("sha256")
    .update(`${normalizeEmail(email)}:${code}:${secret}`)
    .digest("hex");
}

export function isEmailVerificationExpired(expiresAt: Date | null | undefined) {
  if (!expiresAt) return true;
  return expiresAt.getTime() < Date.now();
}

export function canResendVerificationCode(sentAt: Date | null | undefined) {
  if (!sentAt) return true;
  return Date.now() - sentAt.getTime() >= 60 * 1000;
}

export function getResendWaitSeconds(sentAt: Date | null | undefined) {
  if (!sentAt) return 0;
  const remainingMs = 60 * 1000 - (Date.now() - sentAt.getTime());
  return Math.max(0, Math.ceil(remainingMs / 1000));
}
