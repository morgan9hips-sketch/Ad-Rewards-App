-- Phase 2: Complete Schema & Environment Variable Setup
-- This migration adds all missing fields as per business requirements

-- Create UserTier enum
CREATE TYPE "UserTier" AS ENUM ('Free', 'Elite');

-- Add missing fields to UserProfile table

-- Timezone tracking
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(50) DEFAULT 'UTC';

-- Interstitial ad tracking
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "actions_since_last_interstitial" INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "total_forced_interstitials_watched" INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "last_forced_interstitial_at" TIMESTAMP;

-- Update tier field from String to UserTier enum (requires careful migration)
-- First, add a new column
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "tier_new" "UserTier" DEFAULT 'Free';

-- Update existing values (map old tier names to new enum values)
-- Assuming current values might be 'Bronze', 'Silver', 'Gold', 'Elite', etc.
UPDATE "user_profiles" 
SET "tier_new" = CASE 
  WHEN "tier" ILIKE '%elite%' OR "tier" ILIKE '%gold%' OR "tier" ILIKE '%premium%' THEN 'Elite'::"UserTier"
  ELSE 'Free'::"UserTier"
END;

-- Drop old tier column and rename new one
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "tier";
ALTER TABLE "user_profiles" RENAME COLUMN "tier_new" TO "tier";

-- Earnings breakdown by ad type
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "rewarded_ad_earnings_usd" DECIMAL(12,4) DEFAULT 0.0000 NOT NULL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "retry_ad_earnings_usd" DECIMAL(12,4) DEFAULT 0.0000 NOT NULL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "sign_up_bonus_usd" DECIMAL(12,4) DEFAULT 0.0000 NOT NULL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "total_earnings_usd" DECIMAL(12,4) DEFAULT 0.0000 NOT NULL;

-- Cash wallet fields
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "cash_wallet_usd" DECIMAL(12,4) DEFAULT 0.0000 NOT NULL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "cash_wallet_activated_at" TIMESTAMP;

-- Location tracking
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "signup_country" CHAR(2);

-- Activity tracking
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP DEFAULT NOW() NOT NULL;

-- Signup bonus eligibility
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "is_eligible_for_signup_bonus" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "has_redeemed_signup_bonus" BOOLEAN DEFAULT FALSE NOT NULL;

-- Subscription fields
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "subscription_currency" VARCHAR(3);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "subscription_amount" DECIMAL(10,2);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "subscription_started_at" TIMESTAMP;

-- Update referral_code to have max length constraint
ALTER TABLE "user_profiles" ALTER COLUMN "referral_code" TYPE VARCHAR(8);

-- Add gameSessionId to AdView table
ALTER TABLE "ad_views" ADD COLUMN IF NOT EXISTS "game_session_id" VARCHAR;

-- Add foreign key constraint for game_session_id (if game_sessions table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_sessions') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'ad_views_game_session_id_fkey'
    ) THEN
      ALTER TABLE "ad_views" 
        ADD CONSTRAINT "ad_views_game_session_id_fkey" 
        FOREIGN KEY ("game_session_id") 
        REFERENCES "game_sessions"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;

-- Create indexes for performance

-- UserProfile indexes
CREATE INDEX IF NOT EXISTS "user_profiles_revenue_country_idx" ON "user_profiles"("revenue_country");
CREATE INDEX IF NOT EXISTS "user_profiles_last_login_at_idx" ON "user_profiles"("last_login_at");
CREATE INDEX IF NOT EXISTS "user_profiles_tier_idx" ON "user_profiles"("tier");
CREATE INDEX IF NOT EXISTS "user_profiles_referral_code_idx" ON "user_profiles"("referral_code");

-- AdView indexes
CREATE INDEX IF NOT EXISTS "ad_views_country_code_created_at_idx" ON "ad_views"("country_code", "created_at");
CREATE INDEX IF NOT EXISTS "ad_views_user_id_converted_idx" ON "ad_views"("user_id", "converted");
CREATE INDEX IF NOT EXISTS "ad_views_game_session_id_idx" ON "ad_views"("game_session_id");

-- LocationRevenuePool indexes
CREATE INDEX IF NOT EXISTS "location_revenue_pools_country_code_month_idx" ON "location_revenue_pools"("country_code", "month");

-- Add comments to document the changes
COMMENT ON COLUMN "user_profiles"."timezone" IS 'User timezone for daily video cap resets';
COMMENT ON COLUMN "user_profiles"."actions_since_last_interstitial" IS 'Counter for triggering forced interstitial ads';
COMMENT ON COLUMN "user_profiles"."total_forced_interstitials_watched" IS 'Total forced interstitial ads watched';
COMMENT ON COLUMN "user_profiles"."rewarded_ad_earnings_usd" IS 'Total earnings from opt-in rewarded ads';
COMMENT ON COLUMN "user_profiles"."retry_ad_earnings_usd" IS 'Total earnings from retry rewarded ads';
COMMENT ON COLUMN "user_profiles"."sign_up_bonus_usd" IS 'Total signup bonus earned';
COMMENT ON COLUMN "user_profiles"."total_earnings_usd" IS 'Total lifetime earnings in USD';
COMMENT ON COLUMN "user_profiles"."cash_wallet_usd" IS 'Separate cash wallet balance (if different from cashBalanceUsd)';
COMMENT ON COLUMN "user_profiles"."signup_country" IS 'Country code at time of signup';
COMMENT ON COLUMN "user_profiles"."is_eligible_for_signup_bonus" IS 'Whether user is eligible for signup bonus (first 10K per country)';
COMMENT ON COLUMN "user_profiles"."has_redeemed_signup_bonus" IS 'Whether user has redeemed their signup bonus';
COMMENT ON COLUMN "ad_views"."game_session_id" IS 'Reference to game session if ad was watched during gameplay';
