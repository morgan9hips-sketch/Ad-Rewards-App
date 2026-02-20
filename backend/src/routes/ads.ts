import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getClientIP, detectCountryFromIP } from '../services/geoService.js'
import { awardCoins } from '../services/transactionService.js'
import {
  checkDailyAdLimit,
  checkRapidAdViewing,
  checkDuplicateImpression,
  detectVPNMismatch,
  trackUserRevenueCountry,
  updateUserLocation
} from '../services/fraudDetection.js'
import { trackMonetagImpression, getAdType } from '../services/monetagService.js'

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
    console.error('❌ Error fetching ads:', error instanceof Error ? error.message : error)
    res.status(500).json({ error: 'Failed to fetch ads', details: error instanceof Error ? error.message : 'Unknown error' })
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

// Complete ad view - NEW endpoint for coin-based system with regional revenue pools
router.post('/complete', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const {
      adUnitId,
      watchedSeconds,
      impressionId,  // From Monetag SDK
    } = req.body

    // Get user profile to access regional country/currency set at signup
    const profile = await prisma.userProfile.findUnique({
      where: { userId: userId },
      select: {
        signupCountry: true,
        countryCode: true,
        preferredCurrency: true,
      },
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      })
    }

    const countryCode = profile.countryCode || profile.signupCountry || 'US'
    const currency = profile.preferredCurrency || 'USD'

    // Validate minimum watch time (fraud prevention)
    const MIN_WATCH_SECONDS = 15  // Monetag ads must be watched for at least 15 seconds
    if (!watchedSeconds || watchedSeconds < MIN_WATCH_SECONDS) {
      return res.status(400).json({
        success: false,
        error: `Ad must be watched for at least ${MIN_WATCH_SECONDS} seconds`
      })
    }

    // Get client IP for fraud detection
    const ipAddress = getClientIP(req)
    const userAgent = req.headers['user-agent'] || ''
    const ipCountry = detectCountryFromIP(ipAddress)

    // 1. Check daily ad limit
    const dailyLimit = await checkDailyAdLimit(userId)
    if (!dailyLimit.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Daily ad limit reached',
        remaining: 0
      })
    }

    // 2. Check for rapid ad viewing (bot detection)
    const rapidCheck = await checkRapidAdViewing(userId)
    if (!rapidCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: rapidCheck.reason || 'Too many ads watched too quickly'
      })
    }

    // 3. Check for duplicate impression
    if (impressionId) {
      const duplicateCheck = await checkDuplicateImpression(impressionId)
      if (duplicateCheck.duplicate) {
        return res.status(409).json({
          success: false,
          error: 'Duplicate ad impression detected'
        })
      }
    }

    // 4. Create ad view record with user's regional data (from signup IP)
    const adView = await prisma.adView.create({
      data: {
        userId,
        adUnitId,
        watchedSeconds: watchedSeconds || 0,
        completed: true,
        rewardCents: 0, // Legacy field, not used in coin system
        coinsEarned: COINS_PER_AD,
        
        // User's regional data (SOURCE OF TRUTH from signup IP geolocation)
        admobImpressionId: impressionId || undefined,  // Monetag impression ID
        countryCode: countryCode,  // User's signup regional pool
        estimatedEarningsUsd: undefined,  // Monetag revenue data not available
        admobCurrency: currency || 'USD',  // User's signup currency
        
        // Audit trail
        ipAddress,
        ipCountry: ipCountry || undefined,
        userAgent,
        
        converted: false,
      },
    })

    // 6. Award coins to user (creates transaction record)
    await awardCoins(
      userId,
      COINS_PER_AD,
      `Earned ${COINS_PER_AD} coins for watching ad`,
      parseInt(adView.id),
      'ad_view'
    )

    // 7. Update user's ad watch count
    await prisma.userProfile.update({
      where: { userId },
      data: {
        adsWatched: { increment: 1 },
      },
    })

    // 8. Track user's revenue country
    await trackUserRevenueCountry(userId, countryCode)

    // 9. Update user's last known IP location
    await updateUserLocation(userId, ipAddress)

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
      remaining: dailyLimit.remaining - 1,
    })
  } catch (error) {
    console.error('Error completing ad view:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to complete ad view'
    })
  }
})

// Track ad impression with revenue data
router.post('/track-impression', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const {
      adType,  // 'rewarded', 'interstitial', 'banner'
      adUnitId,
      revenueUsd,
      country,
      currency,
    } = req.body

    // Validate required fields
    if (!adType || !adUnitId || !country) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: adType, adUnitId, country',
      })
    }

    // Calculate revenue split based on ad type
    let userEarningsUsd = 0
    let companyRevenueUsd = parseFloat(revenueUsd || '0')

    if (adType === 'rewarded') {
      // 85/15 split for rewarded ads
      const userShare = parseFloat(process.env.USER_REVENUE_SHARE || '0.85')
      userEarningsUsd = companyRevenueUsd * userShare
      companyRevenueUsd = companyRevenueUsd * (1 - userShare)
    }
    // For interstitial and banner: user gets 0%, company gets 100%

    // Create ad impression record
    const impression = await prisma.adImpression.create({
      data: {
        userId,
        adType,
        adUnitId,
        revenueUsd: parseFloat(revenueUsd || '0'),
        userEarningsUsd,
        companyRevenueUsd,
        country,
        currency: currency || 'USD',
      },
    })

    res.json({
      success: true,
      impressionId: impression.id,
      userEarningsUsd,
      companyRevenueUsd,
    })
  } catch (error) {
    console.error('Error tracking ad impression:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to track ad impression',
    })
  }
})

// Track Monetag ad impression (NEW for Monetag integration)
router.post('/track-monetag', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const {
      adZoneId,  // "10618699", "10618702", etc.
      adType,    // "rewarded", "push", "banner", etc.
      revenueUsd // Optional - for manual entry
    } = req.body

    // Validate required fields
    if (!adZoneId || !adType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: adZoneId, adType',
      })
    }

    // Track the impression and award coins if applicable
    const result = await trackMonetagImpression(
      userId,
      adZoneId,
      revenueUsd ? parseFloat(revenueUsd) : undefined
    )

    res.json({
      success: true,
      coinsAwarded: result.coinsAwarded,
      isBetaUser: result.isBetaUser,
      betaMultiplier: result.betaMultiplier,
      message: result.coinsAwarded > 0 
        ? `You earned ${result.coinsAwarded} coins!` 
        : 'Ad impression tracked',
    })
  } catch (error) {
    console.error('Error tracking Monetag impression:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to track ad impression',
    })
  }
})

export default router
