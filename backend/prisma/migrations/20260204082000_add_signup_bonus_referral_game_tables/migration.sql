-- CreateTable: Create SignupBonus table for tracking first 10K users per region
CREATE TABLE IF NOT EXISTS "signup_bonuses" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "user_number_in_region" INTEGER NOT NULL,
    "bonus_coins" INTEGER NOT NULL DEFAULT 500,
    "bonus_value_zar" DECIMAL(10,4) NOT NULL DEFAULT 50.00,
    "eligible" BOOLEAN NOT NULL DEFAULT true,
    "credited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signup_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Create Referral table for referral tracking
CREATE TABLE IF NOT EXISTS "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referee_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "qualified_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "bonus_coins" INTEGER NOT NULL DEFAULT 1000,
    "bonus_value_zar" DECIMAL(10,4) NOT NULL DEFAULT 10.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Create GameSession table for mini game tracking
CREATE TABLE IF NOT EXISTS "game_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "game_type" TEXT NOT NULL DEFAULT 'bubble_shooter',
    "score" INTEGER NOT NULL DEFAULT 0,
    "lives_used" INTEGER NOT NULL DEFAULT 1,
    "retries_with_video" INTEGER NOT NULL DEFAULT 0,
    "retries_with_wait" INTEGER NOT NULL DEFAULT 0,
    "coins_earned" INTEGER NOT NULL DEFAULT 0,
    "last_game_over_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex: Ensure one signup bonus per user
CREATE UNIQUE INDEX IF NOT EXISTS "signup_bonuses_user_id_key" ON "signup_bonuses"("user_id");

-- CreateIndex: Index for country-based queries
CREATE INDEX IF NOT EXISTS "signup_bonuses_country_code_idx" ON "signup_bonuses"("country_code");

-- CreateIndex: Index for eligibility queries
CREATE INDEX IF NOT EXISTS "signup_bonuses_eligible_idx" ON "signup_bonuses"("eligible");

-- CreateUniqueIndex: Ensure one referral code per referral
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_referral_code_key" ON "referrals"("referral_code");

-- CreateIndex: Index for referrer queries
CREATE INDEX IF NOT EXISTS "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex: Index for referee queries
CREATE INDEX IF NOT EXISTS "referrals_referee_id_idx" ON "referrals"("referee_id");

-- CreateIndex: Index for status queries
CREATE INDEX IF NOT EXISTS "referrals_status_idx" ON "referrals"("status");

-- CreateIndex: Index for user queries
CREATE INDEX IF NOT EXISTS "game_sessions_user_id_idx" ON "game_sessions"("user_id");

-- CreateIndex: Index for created_at queries
CREATE INDEX IF NOT EXISTS "game_sessions_created_at_idx" ON "game_sessions"("created_at");

-- AddForeignKey: Link signup bonus to user
ALTER TABLE "signup_bonuses" ADD CONSTRAINT "signup_bonuses_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "user_profiles"("userId") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Link referral referrer to user
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" 
    FOREIGN KEY ("referrer_id") REFERENCES "user_profiles"("userId") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Link referral referee to user
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referee_id_fkey" 
    FOREIGN KEY ("referee_id") REFERENCES "user_profiles"("userId") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Link game session to user
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "user_profiles"("userId") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Comments for documentation
COMMENT ON TABLE "signup_bonuses" IS 'Tracks first 10K users per region eligible for 500 coin signup bonus';
COMMENT ON TABLE "referrals" IS 'Referral tracking system - 1000 coins per qualified referral';
COMMENT ON TABLE "game_sessions" IS 'Mini game sessions with retry mechanics';

COMMENT ON COLUMN "signup_bonuses"."user_number_in_region" IS 'Position in regional signup queue (1-10000)';
COMMENT ON COLUMN "signup_bonuses"."eligible" IS 'True if user is within first 10K for their region';
COMMENT ON COLUMN "signup_bonuses"."credited_at" IS 'When bonus was credited (null if not yet credited)';
