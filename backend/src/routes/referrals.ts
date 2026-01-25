import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { nanoid } from 'nanoid'

const router = Router()
const prisma = new PrismaClient()

const REFERRAL_BONUS_COINS = 1000
const REFERRAL_BONUS_VALUE_ZAR = 10.0
// TODO: Get min threshold from config or exchange rate service
// For now using approximate R150 = $8.11 USD (at R18.5 per USD)
const MIN_THRESHOLD_USD = 8.11

/**
 * GET /api/referrals/my-code
 * Get user's unique referral code
 */
router.get('/my-code', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    let profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { referralCode: true, email: true },
    })

    // Generate referral code if not exists
    if (!profile?.referralCode) {
      const referralCode = nanoid(10).toUpperCase()
      profile = await prisma.userProfile.update({
        where: { userId },
        data: { referralCode },
        select: { referralCode: true, email: true },
      })
    }

    const baseUrl = process.env.FRONTEND_URL || 'https://adify.com'
    const referralLink = `${baseUrl}/signup?ref=${profile.referralCode}`

    res.json({
      success: true,
      referralCode: profile.referralCode,
      referralLink,
    })
  } catch (error: any) {
    console.error('Error getting referral code:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get referral code',
    })
  }
})

/**
 * GET /api/referrals/stats
 * Get user's referral statistics
 */
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referee: {
          select: {
            email: true,
            displayName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalReferrals = referrals.length
    const pendingReferrals = referrals.filter((r) => r.status === 'pending').length
    const qualifiedReferrals = referrals.filter((r) => r.status === 'qualified').length
    const paidReferrals = referrals.filter((r) => r.status === 'paid').length
    const totalCoinsEarned = paidReferrals * REFERRAL_BONUS_COINS

    res.json({
      success: true,
      stats: {
        totalReferrals,
        pendingReferrals,
        qualifiedReferrals,
        paidReferrals,
        totalCoinsEarned,
      },
      referrals: referrals.map((r) => ({
        id: r.id,
        refereeName: r.referee.displayName || r.referee.email,
        status: r.status,
        createdAt: r.createdAt,
        qualifiedAt: r.qualifiedAt,
        paidAt: r.paidAt,
      })),
    })
  } catch (error: any) {
    console.error('Error getting referral stats:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get referral stats',
    })
  }
})

/**
 * POST /api/referrals/track
 * Track when new user signs up with referral code
 */
router.post('/track', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { referralCode } = req.body

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        error: 'Referral code is required',
      })
    }

    // Find referrer by code
    const referrer = await prisma.userProfile.findUnique({
      where: { referralCode },
    })

    if (!referrer) {
      return res.status(404).json({
        success: false,
        error: 'Invalid referral code',
      })
    }

    // Can't refer yourself
    if (referrer.userId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot use your own referral code',
      })
    }

    // Check if user was already referred
    const existingReferral = await prisma.referral.findFirst({
      where: { refereeId: userId },
    })

    if (existingReferral) {
      return res.status(400).json({
        success: false,
        error: 'You have already been referred',
      })
    }

    // Create referral record
    await prisma.referral.create({
      data: {
        referrerId: referrer.userId,
        refereeId: userId,
        referralCode,
        status: 'pending',
      },
    })

    // Update user's referredBy field
    await prisma.userProfile.update({
      where: { userId },
      data: { referredBy: referralCode },
    })

    res.json({
      success: true,
      message: 'Referral tracked successfully',
      referrerName: referrer.displayName || referrer.email,
    })
  } catch (error: any) {
    console.error('Error tracking referral:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track referral',
    })
  }
})

/**
 * GET /api/referrals/info/:code
 * Get referrer information by referral code (public endpoint for signup page)
 */
router.get('/info/:code', async (req: AuthRequest, res) => {
  try {
    const { code } = req.params

    // Find user with this referral code
    const referrer = await prisma.userProfile.findUnique({
      where: { referralCode: code },
      select: {
        displayName: true,
        email: true,
      },
    })

    if (!referrer) {
      return res.status(404).json({
        success: false,
        error: 'Invalid referral code',
      })
    }

    res.json({
      success: true,
      displayName: referrer.displayName || 'A friend',
      // Don't expose email for privacy
    })
  } catch (error: any) {
    console.error('Error getting referrer info:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get referrer info',
    })
  }
})

/**
 * GET /api/referrals/lookup/:code
 * Get referrer display name by referral code
 * PUBLIC endpoint (no auth required)
 */
router.get('/lookup/:code', async (req, res) => {
  try {
    const { code } = req.params

    const profile = await prisma.userProfile.findUnique({
      where: { referralCode: code },
      select: {
        displayName: true,
        email: true,
      },
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Invalid referral code',
      })
    }

    res.json({
      success: true,
      displayName: profile.displayName || profile.email.split('@')[0],
    })
  } catch (error: any) {
    console.error('Error looking up referral code:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * Check if user qualifies for referral bonus
 * Called automatically when user reaches threshold
 */
export async function checkReferralQualification(userId: string): Promise<void> {
  try {
    // Check if user was referred
    const referral = await prisma.referral.findFirst({
      where: {
        refereeId: userId,
        status: 'pending',
      },
    })

    if (!referral) {
      return
    }

    // Get user's cash balance
    const user = await prisma.userProfile.findUnique({
      where: { userId },
      select: { cashBalanceUsd: true },
    })

    if (!user || Number(user.cashBalanceUsd) < MIN_THRESHOLD_USD) {
      return
    }

    // Mark referral as qualified
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'qualified',
        qualifiedAt: new Date(),
      },
    })

    // Credit referrer with bonus
    await prisma.$transaction(async (tx) => {
      // Add coins to referrer
      await tx.userProfile.update({
        where: { userId: referral.referrerId },
        data: {
          coinsBalance: { increment: REFERRAL_BONUS_COINS },
          totalCoinsEarned: { increment: REFERRAL_BONUS_COINS },
        },
      })

      // Add cash value to referrer
      await tx.userProfile.update({
        where: { userId: referral.referrerId },
        data: {
          cashBalanceUsd: {
            increment: REFERRAL_BONUS_VALUE_ZAR / 18.5,
          },
          totalCashEarnedUsd: {
            increment: REFERRAL_BONUS_VALUE_ZAR / 18.5,
          },
        },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: referral.referrerId,
          type: 'referral_bonus',
          coinsChange: REFERRAL_BONUS_COINS,
          cashChangeUsd: REFERRAL_BONUS_VALUE_ZAR / 18.5,
          description: `Referral bonus - Friend reached threshold`,
        },
      })

      // Mark as paid
      await tx.referral.update({
        where: { id: referral.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      })
    })

    console.log(`Referral bonus paid for referral ${referral.id}`)
  } catch (error) {
    console.error('Error checking referral qualification:', error)
  }
}

export default router
