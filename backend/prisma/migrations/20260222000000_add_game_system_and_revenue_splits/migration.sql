-- Migration: Add Game System and Revenue Splits
-- This migration only ADDS new fields, does NOT modify or delete existing data.

-- Add revenueCountryLocked to user_profiles
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "revenue_country_locked" BOOLEAN NOT NULL DEFAULT false;

-- Add new fields to ad_views for OGads revenue split tracking
ALTER TABLE "ad_views" ADD COLUMN IF NOT EXISTS "ad_network" TEXT NOT NULL DEFAULT 'ogads';
ALTER TABLE "ad_views" ADD COLUMN IF NOT EXISTS "user_share_usd" DECIMAL(12, 4);
ALTER TABLE "ad_views" ADD COLUMN IF NOT EXISTS "platform_share_usd" DECIMAL(12, 4);
ALTER TABLE "ad_views" ADD COLUMN IF NOT EXISTS "ogads_click_id" TEXT;

-- Add new indexes to ad_views
CREATE INDEX IF NOT EXISTS "ad_views_ad_type_idx" ON "ad_views"("ad_type");
CREATE INDEX IF NOT EXISTS "ad_views_ad_network_idx" ON "ad_views"("ad_network");

-- Add new session-based fields to game_sessions
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "initial_ad_id" TEXT;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "base_coins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "game_bonus" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "total_coins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "games_played" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "games_completed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "retry_ads_watched" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "last_game_at" TIMESTAMP(3);

-- Add status index to game_sessions
CREATE INDEX IF NOT EXISTS "game_sessions_status_idx" ON "game_sessions"("status");
