import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get all active ads
router.get('/', async (req: AuthRequest, res) => {
  try {
    const ads = await prisma.ad.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json(ads)
  } catch (error) {
    console.error('Error fetching ads:', error)
    res.status(500).json({ error: 'Failed to fetch ads' })
  }
})

// Get specific ad
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const adId = parseInt(req.params.id)

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
    })

    if (!ad || !ad.isActive) {
      return res.status(404).json({ error: 'Ad not found' })
    }

    res.json(ad)
  } catch (error) {
    console.error('Error fetching ad:', error)
    res.status(500).json({ error: 'Failed to fetch ad' })
  }
})

// Record ad view
router.post('/:id/watch', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const adId = parseInt(req.params.id)
    const { watchedSeconds, completed } = req.body

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
    })

    if (!ad || !ad.isActive) {
      return res.status(404).json({ error: 'Ad not found' })
    }

    // Calculate reward
    const rewardCents = completed ? ad.rewardCents : 0

    // Create ad view record
    const adView = await prisma.adView.create({
      data: {
        userId,
        adId,
        watchedSeconds,
        completed,
        rewardCents,
      },
    })

    // Update user profile if completed
    if (completed) {
      await prisma.userProfile.update({
        where: { userId },
        data: {
          walletBalance: { increment: rewardCents },
          totalEarned: { increment: rewardCents },
          adsWatched: { increment: 1 },
        },
      })
    }

    res.json({ adView, rewardCents })
  } catch (error) {
    console.error('Error recording ad view:', error)
    res.status(500).json({ error: 'Failed to record ad view' })
  }
})

export default router
