-- Add a dedicated usage event type for onboarding tour completion.
-- This avoids storing tour completion as BANNER_EDIT with units 0.

ALTER TYPE "UsageEventType" ADD VALUE IF NOT EXISTS 'ONBOARDING_TOUR_COMPLETED';
