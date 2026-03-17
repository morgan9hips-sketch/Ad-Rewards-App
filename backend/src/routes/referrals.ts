import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { nanoid } from 'nanoid'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /api/referrals/my-code
 * Get user's unique referral code
 */
router.get('/my-code', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    let profile = await prisma.userProfile.findUnique({
      where: { userId: userId },
      select: { referralCode: true, email: true },
    })

    // Generate referral code if not exists
    if (!profile?.referralCode) {
      const referralCode = nanoid(10).toUpperCase()
      profile = await prisma.userProfile.update({
        where: { userId: userId },
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

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        referralEarnRate: true,
      },
    })

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referee: {
          select: {
            email: true,
            displayName: true,
            createdAt: true,
            totalCoinsEarned: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalReferrals = referrals.length
    const pendingReferrals = referrals.filter(
      (r) => r.status === 'pending',
    ).length
    const activeReferrals = referrals.filter((r) =>
      ['active', 'qualified', 'paid'].includes(r.status),
    ).length
    const qualifiedReferrals = referrals.filter(
      (r) => r.status === 'qualified',
    ).length
    const paidReferrals = referrals.filter((r) => r.status === 'paid').length

    const referralShare = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'referral_share',
      },
      _sum: {
        coinsChange: true,
      },
    })

    const totalCoinsEarned = Number(referralShare._sum.coinsChange || 0)

    const currentEarnRate = Number(profile?.referralEarnRate || 0.1)
    const nextMilestoneTarget =
      activeReferrals < 3 ? 3 : activeReferrals < 10 ? 10 : null
    const nextMilestoneRate =
      activeReferrals < 3 ? 0.12 : activeReferrals < 10 ? 0.15 : null

    res.json({
      success: true,
      stats: {
        totalReferrals,
        pendingReferrals,
        activeReferrals,
        qualifiedReferrals,
        paidReferrals,
        totalCoinsEarned,
        currentEarnRate,
        nextMilestoneTarget,
        nextMilestoneRate,
      },
      referrals: referrals.map((r) => ({
        id: r.id,
        refereeName: r.referee.displayName || r.referee.email,
        status: r.status,
        createdAt: r.createdAt,
        qualifiedAt: r.qualifiedAt,
        paidAt: r.paidAt,
        refereeTotalCoins: r.referee.totalCoinsEarned.toString(),
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
      where: { referralCode: referralCode },
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
      where: { userId: userId },
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

    // Validate referral code format (alphanumeric, max 20 chars)
    if (!code || !/^[A-Za-z0-9_-]+$/.test(code) || code.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Invalid referral code format',
      })
    }

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

export default router
