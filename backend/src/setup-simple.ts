import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupTables() {
  console.log('📦 Setting up database tables...')

  try {
    // Create tables using individual SQL commands
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    // User Profiles
    await prisma.$executeRaw`
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
      )
    `

    // Ads
    await prisma.$executeRaw`
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
      )
    `

    // Ad Views
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS app_ad_views (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" VARCHAR(255) NOT NULL,
        "adId" INTEGER NOT NULL,
        "watchedSeconds" INTEGER NOT NULL,
        completed BOOLEAN DEFAULT false,
        "rewardCents" INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `

    // Withdrawals
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS app_withdrawals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        method VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        "paypalEmail" VARCHAR(255) NOT NULL,
        "transactionId" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "completedAt" TIMESTAMP
      )
    `

    // Badges
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS app_badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(10) NOT NULL,
        requirement JSONB NOT NULL,
        "rewardCents" INTEGER NOT NULL
      )
    `

    // User Badges
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS app_user_badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" VARCHAR(255) NOT NULL,
        "badgeId" UUID NOT NULL,
        "earnedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE ("userId", "badgeId")
      )
    `

    console.log('✅ Database tables created successfully!')
    return true
  } catch (error) {
    console.error('❌ Error creating tables:', error)
    return false
  }
}

async function seedData() {
  console.log('🌱 Seeding sample data...')

  try {
    // Insert sample ads
    await prisma.$executeRaw`
      INSERT INTO app_ads (title, description, "videoUrl", "durationSeconds", "rewardCents", "isActive")
      VALUES 
        ('Product Demo - New Tech Gadget', 'Watch our latest product demonstration', 'https://sample-videos.com/demo.mp4', 30, 5, true),
        ('Brand Story - Fashion Collection', 'Discover our new fashion line', 'https://sample-videos.com/fashion.mp4', 45, 8, true),
        ('App Tutorial - Productivity Tools', 'Learn productivity tips', 'https://sample-videos.com/tutorial.mp4', 60, 10, true),
        ('Travel Destination Showcase', 'Explore beautiful destinations', 'https://sample-videos.com/travel.mp4', 30, 6, true),
        ('Health & Fitness Tips', 'Get expert health advice', 'https://sample-videos.com/health.mp4', 45, 7, true)
      ON CONFLICT DO NOTHING
    `

    // Insert badges
    await prisma.$executeRaw`
      INSERT INTO app_badges (name, description, icon, requirement, "rewardCents")
      VALUES 
        ('First Steps', 'Watch your first ad', '🎬', '{"adsWatched": 1}', 50),
        ('Ad Enthusiast', 'Watch 50 ads', '⭐', '{"adsWatched": 50}', 100),
        ('Century Club', 'Watch 100 ads', '💯', '{"adsWatched": 100}', 250),
        ('Early Bird', 'Watch an ad before 8 AM', '🌅', '{"timeOfDay": "before_8am"}', 25),
        ('Night Owl', 'Watch an ad after midnight', '🦉', '{"timeOfDay": "after_midnight"}', 25),
        ('Weekend Warrior', 'Watch ads for 10 consecutive weekends', '⚔️', '{"weekendStreak": 10}', 500),
        ('Big Spender', 'Earn $50 in total', '💰', '{"totalEarned": 5000}', 1000),
        ('Dedication Master', 'Watch ads for 30 consecutive days', '🔥', '{"dailyStreak": 30}', 2000)
      ON CONFLICT (name) DO NOTHING
    `

    console.log('✅ Sample data inserted successfully!')
    return true
  } catch (error) {
    console.error('❌ Error inserting sample data:', error)
    return false
  }
}

async function main() {
  try {
    const tablesCreated = await setupTables()
    if (tablesCreated) {
      await seedData()
      console.log('🎉 Database setup completed successfully!')
    }
  } catch (error) {
    console.error('❌ Setup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

