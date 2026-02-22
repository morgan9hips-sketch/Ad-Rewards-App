import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getCountryFlag, getCountryName } from '../utils/countries.js'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /api/leaderboard  (legacy - global view)
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id

    const leaderboard = await prisma.userProfile.findMany({
      where: { showOnLeaderboard: true },
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
        revenueCountry: true,
      },
      orderBy: { totalCoinsEarned: 'desc' },
      take: 100,
    })

    const formattedLeaderboard = leaderboard.map((profile, index) => ({
      rank: index + 1,
      userId: profile.userId,
      displayName: profile.displayName || profile.email.split('@')[0],
      avatarEmoji: profile.avatarEmoji || '👤',
      countryBadge: profile.hideCountry ? '🌍' : profile.countryBadge || null,
      coins: profile.totalCoinsEarned.toString(),
      countryFlag: profile.hideCountry
        ? '🌍'
        : getCountryFlag(profile.revenueCountry || profile.countryBadge || ''),
    }))

    let currentUserRank = null
    if (userId) {
      const currentUser = await prisma.userProfile.findUnique({
        where: { userId },
        select: { totalCoinsEarned: true, showOnLeaderboard: true },
      })

      if (currentUser?.showOnLeaderboard) {
        const rank = await prisma.userProfile.count({
          where: {
            showOnLeaderboard: true,
            totalCoinsEarned: { gt: currentUser.totalCoinsEarned },
          },
        })
        currentUserRank = { rank: rank + 1, coins: currentUser.totalCoinsEarned.toString() }
      }
    }

    res.json({ leaderboard: formattedLeaderboard, currentUser: currentUserRank })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

/**
 * GET /api/leaderboard/regional
 * Get leaderboard for the current user's revenue country, with pool stats.
 */
router.get('/regional', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id

    let userCountry: string | null = null
    if (userId) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { revenueCountry: true, countryCode: true, signupCountry: true },
      })
      userCountry =
        profile?.revenueCountry ||
        profile?.countryCode ||
        profile?.signupCountry ||
        null
    }

    const whereClause: any = { showOnLeaderboard: true }
    if (userCountry) {
      whereClause.revenueCountry = userCountry
    }

    const leaderboard = await prisma.userProfile.findMany({
      where: whereClause,
      select: {
        userId: true,
        displayName: true,
        email: true,
        avatarEmoji: true,
        countryBadge: true,
        hideCountry: true,
        totalCoinsEarned: true,
        revenueCountry: true,
      },
      orderBy: { totalCoinsEarned: 'desc' },
      take: 100,
    })

    const formattedLeaderboard = leaderboard.map((profile, index) => ({
      rank: index + 1,
      userId: profile.userId,
      displayName: profile.displayName || profile.email.split('@')[0],
      avatarEmoji: profile.avatarEmoji || '👤',
      countryFlag: profile.hideCountry
        ? '🌍'
        : getCountryFlag(profile.revenueCountry || profile.countryBadge || ''),
      coins: profile.totalCoinsEarned.toString(),
      isCurrentUser: profile.userId === userId,
    }))

    const poolStats = userCountry ? await getRegionalPoolStats(userCountry) : null

    let currentUserRank = null
    if (userId) {
      const idx = formattedLeaderboard.findIndex((e) => e.userId === userId)
      if (idx >= 0) {
        currentUserRank = { rank: idx + 1, coins: formattedLeaderboard[idx].coins }
      }
    }

    res.json({
      country: userCountry,
      countryName: userCountry ? getCountryName(userCountry) : null,
      countryFlag: userCountry ? getCountryFlag(userCountry) : '🌍',
      leaderboard: formattedLeaderboard,
      currentUser: currentUserRank,
      poolStats,
    })
  } catch (error) {
    console.error('Error fetching regional leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch regional leaderboard' })
  }
})

/**
 * GET /api/leaderboard/global
 * Get global leaderboard with country flags and pagination.
 */
router.get('/global', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const perPage = Math.min(100, parseInt(req.query.perPage as string) || 50)
    const skip = (page - 1) * perPage

    const [leaderboard, total] = await Promise.all([
      prisma.userProfile.findMany({
        where: { showOnLeaderboard: true },
        select: {
          userId: true,
          displayName: true,
          email: true,
          avatarEmoji: true,
          countryBadge: true,
          hideCountry: true,
          totalCoinsEarned: true,
          revenueCountry: true,
        },
        orderBy: { totalCoinsEarned: 'desc' },
        take: perPage,
        skip,
      }),
      prisma.userProfile.count({ where: { showOnLeaderboard: true } }),
    ])

    const formattedLeaderboard = leaderboard.map((profile, index) => ({
      rank: skip + index + 1,
      userId: profile.userId,
      displayName: profile.displayName || profile.email.split('@')[0],
      avatarEmoji: profile.avatarEmoji || '👤',
      countryCode: profile.hideCountry ? null : (profile.revenueCountry || profile.countryBadge),
      countryFlag: profile.hideCountry
        ? '🌍'
        : getCountryFlag(profile.revenueCountry || profile.countryBadge || ''),
      countryName: profile.hideCountry
        ? null
        : getCountryName(profile.revenueCountry || profile.countryBadge || ''),
      coins: profile.totalCoinsEarned.toString(),
      isCurrentUser: profile.userId === userId,
    }))

    let currentUserRank = null
    if (userId) {
      const currentUser = await prisma.userProfile.findUnique({
        where: { userId },
        select: { totalCoinsEarned: true, showOnLeaderboard: true },
      })
      if (currentUser?.showOnLeaderboard) {
        const rank = await prisma.userProfile.count({
          where: { showOnLeaderboard: true, totalCoinsEarned: { gt: currentUser.totalCoinsEarned } },
        })
        currentUserRank = { rank: rank + 1, coins: currentUser.totalCoinsEarned.toString() }
      }
    }

    res.json({
      leaderboard: formattedLeaderboard,
      currentUser: currentUserRank,
      pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    })
  } catch (error) {
    console.error('Error fetching global leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch global leaderboard' })
  }
})

/**
 * GET /api/leaderboard/country-stats
 * Get all countries comparison with pool stats.
 */
router.get('/country-stats', async (req: AuthRequest, res) => {
  try {
    const countryGroups = await prisma.userProfile.groupBy({
      by: ['revenueCountry'],
      where: { revenueCountry: { not: null } },
      _count: { userId: true },
      _sum: { totalCoinsEarned: true },
    })

    const stats = countryGroups
      .filter((g) => g.revenueCountry)
      .map((g) => ({
        countryCode: g.revenueCountry!,
        countryName: getCountryName(g.revenueCountry!),
        countryFlag: getCountryFlag(g.revenueCountry!),
        userCount: g._count.userId,
        totalCoins: g._sum.totalCoinsEarned?.toString() || '0',
      }))
      .sort((a, b) => b.userCount - a.userCount)

    res.json({ countries: stats })
  } catch (error) {
    console.error('Error fetching country stats:', error)
    res.status(500).json({ error: 'Failed to fetch country stats' })
  }
})

async function getRegionalPoolStats(countryCode: string) {
  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const poolAds = await prisma.adView.findMany({
      where: {
        countryCode,
        adType: { in: ['OPT_IN_REWARDED', 'RETRY_REWARDED'] as any[] },
        createdAt: { gte: startOfMonth },
      },
      select: {
        userShareUsd: true,
        platformShareUsd: true,
        coinsEarned: true,
        estimatedEarningsUsd: true,
      },
    })

    const totalRevenueUsd = poolAds.reduce(
      (sum, v) => sum + parseFloat(v.estimatedEarningsUsd?.toString() || '0'),
      0
    )
    const totalUserShareUsd = poolAds.reduce(
      (sum, v) => sum + parseFloat(v.userShareUsd?.toString() || '0'),
      0
    )
    const totalCoinsIssued = poolAds.reduce((sum, v) => sum + v.coinsEarned, 0)
    const conversionRate = totalCoinsIssued > 0 ? totalUserShareUsd / totalCoinsIssued : 0

    return {
      countryCode,
      month: startOfMonth.toISOString().substring(0, 7),
      totalRevenueUsd: totalRevenueUsd.toFixed(4),
      totalUserShareUsd: totalUserShareUsd.toFixed(4),
      totalCoinsIssued,
      conversionRate: conversionRate.toFixed(8),
      adCount: poolAds.length,
    }
  } catch {
    return null
  }
}

export default router
