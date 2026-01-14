import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getClientIP, getUserLocationInfo } from '../services/geoService.js'
import { awardCoins } from '../services/transactionService.js'

const router = Router()
const prisma = new PrismaClient()

const COINS_PER_AD = parseInt(process.env.COINS_PER_AD || '100')

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

// Record ad view (legacy endpoint - kept for backward compatibility)
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

// Complete ad view - NEW endpoint for coin-based system
router.post('/complete', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { adUnitId, watchedSeconds, admobImpressionId } = req.body

    // Get client IP and detect country
    const ipAddress = getClientIP(req)
    const userAgent = req.headers['user-agent'] || ''
    const locationInfo = getUserLocationInfo(ipAddress)

    // Create ad view record with coin earnings
    const adView = await prisma.adView.create({
      data: {
        userId,
        adUnitId,
        watchedSeconds: watchedSeconds || 0,
        completed: true,
        rewardCents: 0, // Legacy field, not used in coin system
        coinsEarned: COINS_PER_AD,
        countryCode: locationInfo.countryCode,
        ipAddress,
        userAgent,
        admobImpressionId,
        converted: false,
      },
    })

    // Award coins to user (this also creates a transaction record)
    await awardCoins(
      userId,
      COINS_PER_AD,
      `Earned ${COINS_PER_AD} coins for watching ad`,
      parseInt(adView.id),
      'ad_view'
    )

    // Update user's ad watch count
    await prisma.userProfile.update({
      where: { userId },
      data: {
        adsWatched: { increment: 1 },
      },
    })

    // Get updated user profile to return current balance
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { coinsBalance: true },
    })

    res.json({
      success: true,
      coinsEarned: COINS_PER_AD,
      totalCoins: userProfile?.coinsBalance.toString() || '0',
      message: `You earned ${COINS_PER_AD} coins!`,
    })
  } catch (error) {
    console.error('Error completing ad view:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to complete ad view' 
    })
  }
})

export default router
