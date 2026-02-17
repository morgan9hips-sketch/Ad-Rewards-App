-- Migration for Monetag Integration
-- Adds new fields to UserProfile and creates new tables

-- Add new fields to user_profiles table
ALTER TABLE "user_profiles" ADD COLUMN "signup_ip" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN "wallet_id" TEXT UNIQUE;
ALTER TABLE "user_profiles" ADD COLUMN "currency" TEXT DEFAULT 'USD';
ALTER TABLE "user_profiles" ADD COLUMN "is_beta_user" BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE "user_profiles" ADD COLUMN "beta_multiplier" DOUBLE PRECISION DEFAULT 1.5 NOT NULL;

-- Create monetag_impressions table
CREATE TABLE "monetag_impressions" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "ad_type" TEXT NOT NULL,
    "ad_zone_id" TEXT NOT NULL,
    "user_share_percent" INTEGER NOT NULL,
    "platform_share_percent" INTEGER NOT NULL,
    "estimated_revenue_usd" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "country_code" TEXT NOT NULL,
    "is_beta_mode" BOOLEAN NOT NULL,
    "beta_multiplier" DOUBLE PRECISION NOT NULL,
    "coins_awarded" INTEGER DEFAULT 0 NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT "monetag_impressions_user_id_fkey" FOREIGN KEY ("user_id") 
        REFERENCES "user_profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "monetag_impressions_user_id_created_at_idx" ON "monetag_impressions"("user_id", "created_at");
CREATE INDEX "monetag_impressions_country_code_ad_type_idx" ON "monetag_impressions"("country_code", "ad_type");

-- Create revenue_pools table
CREATE TABLE "revenue_pools" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "total_revenue_usd" DOUBLE PRECISION NOT NULL,
    "user_share_usd" DOUBLE PRECISION NOT NULL,
    "platform_share_usd" DOUBLE PRECISION NOT NULL,
    "total_coins_issued" BIGINT NOT NULL,
    "conversion_rate" DOUBLE PRECISION NOT NULL,
    "impression_count" INTEGER NOT NULL,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "distributed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT "revenue_pools_month_country_code_key" UNIQUE ("month", "country_code")
);

CREATE INDEX "revenue_pools_status_idx" ON "revenue_pools"("status");

-- Create beta_debts table
CREATE TABLE "beta_debts" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL UNIQUE,
    "total_coins_earned" BIGINT DEFAULT 0 NOT NULL,
    "estimated_debt_usd" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "multiplier" DOUBLE PRECISION DEFAULT 1.5 NOT NULL,
    "is_paid" BOOLEAN DEFAULT false NOT NULL,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "beta_debts_user_id_fkey" FOREIGN KEY ("user_id") 
        REFERENCES "user_profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
