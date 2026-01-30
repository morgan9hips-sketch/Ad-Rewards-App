-- Add geo-resolution fields to user_profiles table
-- These fields enable one-time IP-based geo-resolution for currency and payout attribution

ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "country_name" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "currency_code" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "ip_address" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "geo_resolved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "geo_source" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "geo_resolved_at" TIMESTAMP(3);
