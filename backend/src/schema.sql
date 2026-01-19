-- Create Ad Rewards App Tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles
CREATE TABLE IF NOT EXISTS app_user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    country VARCHAR(10),
    "paypalEmail" VARCHAR(255),
    "walletBalance" INTEGER DEFAULT 0,
    "totalEarned" INTEGER DEFAULT 0,
    "adsWatched" INTEGER DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'Bronze',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Ads
CREATE TABLE IF NOT EXISTS app_ads (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "videoUrl" VARCHAR(500),
    "durationSeconds" INTEGER NOT NULL,
    "rewardCents" INTEGER NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Ad Views
CREATE TABLE IF NOT EXISTS app_ad_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(255) NOT NULL,
    "adId" INTEGER NOT NULL,
    "watchedSeconds" INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    "rewardCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES app_user_profiles("userId"),
    FOREIGN KEY ("adId") REFERENCES app_ads(id)
);

-- Withdrawals
CREATE TABLE IF NOT EXISTS app_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    "paypalEmail" VARCHAR(255) NOT NULL,
    "transactionId" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "completedAt" TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES app_user_profiles("userId")
);

-- Badges
CREATE TABLE IF NOT EXISTS app_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    requirement JSONB NOT NULL,
    "rewardCents" INTEGER NOT NULL
);

-- User Badges
CREATE TABLE IF NOT EXISTS app_user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(255) NOT NULL,
    "badgeId" UUID NOT NULL,
    "earnedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES app_user_profiles("userId"),
    FOREIGN KEY ("badgeId") REFERENCES app_badges(id),
    UNIQUE ("userId", "badgeId")
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_ad_views_user_id ON app_ad_views("userId");
CREATE INDEX IF NOT EXISTS idx_app_ad_views_ad_id ON app_ad_views("adId");
CREATE INDEX IF NOT EXISTS idx_app_withdrawals_user_id ON app_withdrawals("userId");

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
DROP TRIGGER IF EXISTS update_app_user_profiles_updated_at ON app_user_profiles;
CREATE TRIGGER update_app_user_profiles_updated_at BEFORE UPDATE ON app_user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_ads_updated_at ON app_ads;
CREATE TRIGGER update_app_ads_updated_at BEFORE UPDATE ON app_ads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();