import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('📦 Setting up database schema...')

    // Read and execute SQL schema
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    )

    // Execute the schema
    await prisma.$executeRawUnsafe(schemaSQL)

    console.log('✅ Database schema created successfully!')

    // Now seed the database
    await seedDatabase()
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
    // Create sample ads
    const adsData = [
      {
        title: 'Product Demo - New Tech Gadget',
        description: 'Watch our latest product demonstration and earn rewards',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/30sec.mp4',
        durationSeconds: 30,
        rewardCents: 5, // $0.05
        isActive: true,
      },
      {
        title: 'Brand Story - Fashion Collection',
        description: 'Discover our new fashion line for the season',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/45sec.mp4',
        durationSeconds: 45,
        rewardCents: 8, // $0.08
        isActive: true,
      },
      {
        title: 'App Tutorial - Productivity Tools',
        description: 'Learn how to use our productivity app effectively',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/60sec.mp4',
        durationSeconds: 60,
        rewardCents: 10, // $0.10
        isActive: true,
      },
      {
        title: 'Travel Destination Showcase',
        description: 'Explore beautiful travel destinations around the world',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/30sec.mp4',
        durationSeconds: 30,
        rewardCents: 6, // $0.06
        isActive: true,
      },
      {
        title: 'Health & Fitness Tips',
        description: 'Get expert advice on staying healthy and fit',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/45sec.mp4',
        durationSeconds: 45,
        rewardCents: 7, // $0.07
        isActive: true,
      },
    ]

    for (const adData of adsData) {
      await prisma.ad.create({ data: adData })
    }

    // Create sample badges
    const badgesData = [
      {
        name: 'First Steps',
        description: 'Watch your first ad',
        icon: '🎬',
        requirement: { adsWatched: 1 },
        rewardCents: 50, // $0.50 bonus
      },
      {
        name: 'Ad Enthusiast',
        description: 'Watch 50 ads',
        icon: '⭐',
        requirement: { adsWatched: 50 },
        rewardCents: 100, // $1.00 bonus
      },
      {
        name: 'Century Club',
        description: 'Watch 100 ads',
        icon: '💯',
        requirement: { adsWatched: 100 },
        rewardCents: 250, // $2.50 bonus
      },
      {
        name: 'Early Bird',
        description: 'Watch an ad before 8 AM',
        icon: '🌅',
        requirement: { timeOfDay: 'before_8am' },
        rewardCents: 25, // $0.25 bonus
      },
      {
        name: 'Night Owl',
        description: 'Watch an ad after midnight',
        icon: '🦉',
        requirement: { timeOfDay: 'after_midnight' },
        rewardCents: 25, // $0.25 bonus
      },
      {
        name: 'Weekend Warrior',
        description: 'Watch ads for 10 consecutive weekends',
        icon: '⚔️',
        requirement: { weekendStreak: 10 },
        rewardCents: 500, // $5.00 bonus
      },
      {
        name: 'Big Spender',
        description: 'Earn $50 in total',
        icon: '💰',
        requirement: { totalEarned: 5000 }, // $50.00 in cents
        rewardCents: 1000, // $10.00 bonus
      },
      {
        name: 'Dedication Master',
        description: 'Watch ads for 30 consecutive days',
        icon: '🔥',
        requirement: { dailyStreak: 30 },
        rewardCents: 2000, // $20.00 bonus
      },
    ]

    for (const badgeData of badgesData) {
      await prisma.badge.create({ data: badgeData })
    }

    console.log(`✅ Created ${adsData.length} sample ads`)
    console.log(`✅ Created ${badgesData.length} badges`)
    console.log('🎉 Database setup completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

setupDatabase().catch((error) => {
  console.error(error)
  process.exit(1)
})

