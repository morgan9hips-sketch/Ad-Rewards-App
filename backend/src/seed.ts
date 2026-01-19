import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Create sample ads
    const ads = await prisma.ad.createMany({
      data: [
        {
          title: 'Product Demo - New Tech Gadget',
          description:
            'Watch our latest product demonstration and earn rewards',
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
      ],
    })

    // Create sample badges
    const badges = await prisma.badge.createMany({
      data: [
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
      ],
    })

    console.log(`✅ Created ${ads.count} sample ads`)
    console.log(`✅ Created ${badges.count} badges`)
    console.log('🎉 Database seed completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
