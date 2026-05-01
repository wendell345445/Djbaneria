-- Add fields used by the paid signup flow.
-- After a Stripe Checkout payment, the webhook creates/updates the user
-- and sends a secure link for the customer to create a password.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "passwordSetupTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "passwordSetupExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "passwordSetupSentAt" TIMESTAMP(3);
