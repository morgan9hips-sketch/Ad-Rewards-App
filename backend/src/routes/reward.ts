import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

const cooldowns = new Map<string, number>()

router.post('/watch-ad', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const lastClaim = cooldowns.get(userId)
    const now = Date.now()
    
    if (lastClaim && (now - lastClaim) < 60000) {
      const remainingSeconds = Math.ceil((60000 - (now - lastClaim)) / 1000)
      return res.status(429).json({
        success: false,
        error: `Please wait ${remainingSeconds}s before watching another ad`,
      })
    }

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        coinsBalance: { increment: 100 },
        totalCoinsEarned: { increment: 100 },
      },
    })

    await prisma.transaction.create({
      data: {
        userId,
        type: 'ad_view',
        coinsChange: 100,
        coinsBalanceAfter: profile.coinsBalance,
        description: 'Watched Monetag video ad',
      },
    })

    cooldowns.set(userId, now)

    res.json({
      success: true,
      coinsEarned: 100,
      newBalance: profile.coinsBalance,
    })
  } catch (error) {
    console.error('Error granting ad reward:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to grant reward',
    })
  }
})

export default router