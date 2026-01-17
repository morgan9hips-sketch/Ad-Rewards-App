import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get leaderboard
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    
    // Fetch top users ranked by coins
    const leaderboard = await prisma.userProfile.findMany({
      where: {
        showOnLeaderboard: true,
      },
      select: {
        userId: true,
        displayName: true,
        email: true,
        avatarEmoji: true,
        avatarUrl: true,
        countryBadge: true,
        hideCountry: true,
        coinsBalance: true,
        totalCoinsEarned: true,
      },
      orderBy: {
        totalCoinsEarned: 'desc',
      },
      take: 100,
    })

    // Format leaderboard with rank
    const formattedLeaderboard = leaderboard.map((profile, index) => ({
      rank: index + 1,
      userId: profile.userId,
      displayName: profile.displayName || profile.email.split('@')[0],
      avatarEmoji: profile.avatarEmoji || '👤',
      countryBadge: profile.hideCountry ? '🌍' : profile.countryBadge || null,
      coins: profile.totalCoinsEarned.toString(),
    }))

    // Get current user's rank if authenticated
    let currentUserRank = null
    if (userId) {
      const currentUser = await prisma.userProfile.findUnique({
        where: { userId },
        select: {
          totalCoinsEarned: true,
          showOnLeaderboard: true,
        },
      })

      if (currentUser && currentUser.showOnLeaderboard) {
        // Count users with more coins
        const rank = await prisma.userProfile.count({
          where: {
            showOnLeaderboard: true,
            totalCoinsEarned: {
              gt: currentUser.totalCoinsEarned,
            },
          },
        })
        
        currentUserRank = {
          rank: rank + 1,
          coins: currentUser.totalCoinsEarned.toString(),
        }
      }
    }

    res.json({
      leaderboard: formattedLeaderboard,
      currentUser: currentUserRank,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

export default router
