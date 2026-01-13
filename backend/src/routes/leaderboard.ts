import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const timeframe = req.query.timeframe as string || 'week'
    
    let dateFilter = new Date()
    if (timeframe === 'week') {
      dateFilter.setDate(dateFilter.getDate() - 7)
    } else if (timeframe === 'month') {
      dateFilter.setMonth(dateFilter.getMonth() - 1)
    } else {
      // All time - no date filter
      dateFilter = new Date(0)
    }

    const profiles = await prisma.userProfile.findMany({
      where: {
        createdAt: timeframe === 'alltime' ? undefined : { gte: dateFilter },
      },
      orderBy: { totalEarned: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        totalEarned: true,
        adsWatched: true,
      },
    })

    const leaderboard = profiles.map((profile, index) => ({
      rank: index + 1,
      name: profile.name || profile.email.split('@')[0],
      earnings: profile.totalEarned,
      adsWatched: profile.adsWatched,
    }))

    res.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

export default router
