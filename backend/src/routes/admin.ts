import { Router } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { convertCoinsToUSD } from '../services/transactionService.js'
import { updateExchangeRates, getExchangeRate } from '../services/currencyService.js'

const router = Router()
const prisma = new PrismaClient()

const USER_REVENUE_SHARE = parseFloat(process.env.USER_REVENUE_SHARE || '0.85')

// Middleware to check admin access
// TODO: Implement proper admin role checking
// For now, this is a placeholder that should verify:
// 1. User is authenticated (already done by authenticate middleware)
// 2. User has admin role in database
// 3. Consider using a separate admin_users table or role field
async function requireAdmin(req: AuthRequest, res: any, next: any) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // TODO: Check if user has admin privileges
    // Example implementation:
    // const user = await prisma.userProfile.findUnique({
    //   where: { userId },
    //   select: { role: true }
    // })
    // 
    // if (user?.role !== 'admin') {
    //   return res.status(403).json({ error: 'Admin access required' })
    // }

    // TEMPORARY: Allow all authenticated users
    // SECURITY: Replace this with proper admin role checking before production
    console.warn('⚠️  WARNING: Admin routes are not properly secured. Implement role-based access control.')
    
    next()
  } catch (error) {
    console.error('Error in admin middleware:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Process monthly coin-to-cash conversion
 * This is the critical conversion endpoint that must be transactional
 */
router.post('/process-conversion', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { admobRevenue, month, notes } = req.body
    const adminUserId = req.user!.id

    // Validate input
    if (!admobRevenue || admobRevenue <= 0) {
      return res.status(400).json({ error: 'Invalid AdMob revenue amount' })
    }

    const admobRevenueUsd = parseFloat(admobRevenue)
    const conversionDate = month ? new Date(month) : new Date()
    
    // Calculate user payout (85% of AdMob revenue)
    const totalUserPayoutUsd = admobRevenueUsd * USER_REVENUE_SHARE

    // Start transaction - everything must succeed or rollback
    const result = await prisma.$transaction(async (tx) => {
      // Get all users with unconverted coins
      const usersWithCoins = await tx.userProfile.findMany({
        where: {
          coinsBalance: { gt: 0 },
        },
        select: {
          userId: true,
          coinsBalance: true,
        },
      })

      if (usersWithCoins.length === 0) {
        throw new Error('No users with coins to convert')
      }

      // Calculate total coins to convert
      const totalCoins = usersWithCoins.reduce(
        (sum, user) => sum + user.coinsBalance,
        BigInt(0)
      )

      if (totalCoins === BigInt(0)) {
        throw new Error('Total coins is zero')
      }

      // Calculate conversion rate (USD per coin)
      const conversionRate = totalUserPayoutUsd / Number(totalCoins)

      // Create conversion record
      const conversion = await tx.coinConversion.create({
        data: {
          conversionDate,
          admobRevenueUsd: admobRevenueUsd,
          userRevenueShare: USER_REVENUE_SHARE,
          totalUserPayoutUsd: totalUserPayoutUsd,
          totalCoinsConverted: totalCoins,
          conversionRateUsdPerCoin: conversionRate,
          usersAffected: usersWithCoins.length,
          status: 'processing',
          notes,
        },
      })

      // Convert coins for each user
      let totalCashDistributed = 0

      for (const user of usersWithCoins) {
        const coins = user.coinsBalance
        const cashUsd = Number(coins) * conversionRate

        // Convert user's coins to cash
        await convertCoinsToUSD(user.userId, coins, cashUsd, conversion.id, tx)

        // Create conversion detail record
        await tx.conversionDetail.create({
          data: {
            conversionId: conversion.id,
            userId: user.userId,
            coinsConverted: coins,
            cashReceivedUsd: cashUsd,
            conversionRateUsed: conversionRate,
          },
        })

        totalCashDistributed += cashUsd
      }

      // Mark all ad views as converted
      await tx.adView.updateMany({
        where: {
          converted: false,
          userId: { in: usersWithCoins.map(u => u.userId) },
        },
        data: {
          converted: true,
          conversionBatchId: conversion.id,
        },
      })

      // Update conversion status
      await tx.coinConversion.update({
        where: { id: conversion.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      })

      // Log admin action
      await tx.adminAction.create({
        data: {
          adminUserId,
          actionType: 'coin_conversion',
          details: {
            conversionId: conversion.id,
            admobRevenue: admobRevenueUsd,
            totalCoins: totalCoins.toString(),
            conversionRate,
            usersAffected: usersWithCoins.length,
            totalCashDistributed,
          },
        },
      })

      return {
        conversion,
        totalCashDistributed,
        usersAffected: usersWithCoins.length,
        totalCoinsConverted: totalCoins.toString(),
        conversionRate,
      }
    }, {
      timeout: 60000, // 60 second timeout for large conversions
    })

    res.json({
      success: true,
      message: 'Conversion completed successfully',
      data: result,
    })
  } catch (error) {
    console.error('Error processing conversion:', error)
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process conversion'
    })
  }
})

/**
 * Get conversion history
 */
router.get('/conversions', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const perPage = parseInt(req.query.perPage as string) || 20
    const skip = (page - 1) * perPage

    const [conversions, total] = await Promise.all([
      prisma.coinConversion.findMany({
        orderBy: { conversionDate: 'desc' },
        take: perPage,
        skip,
        include: {
          _count: {
            select: { conversionDetails: true },
          },
        },
      }),
      prisma.coinConversion.count(),
    ])

    res.json({
      conversions,
      total,
      pages: Math.ceil(total / perPage),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching conversions:', error)
    res.status(500).json({ error: 'Failed to fetch conversion history' })
  }
})

/**
 * Get conversion details for a specific conversion
 */
router.get('/conversions/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const conversionId = parseInt(req.params.id)

    const conversion = await prisma.coinConversion.findUnique({
      where: { id: conversionId },
      include: {
        conversionDetails: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!conversion) {
      return res.status(404).json({ error: 'Conversion not found' })
    }

    res.json(conversion)
  } catch (error) {
    console.error('Error fetching conversion details:', error)
    res.status(500).json({ error: 'Failed to fetch conversion details' })
  }
})

/**
 * Get platform statistics
 */
router.get('/stats', requireAdmin, async (req: AuthRequest, res) => {
  try {
    // Get pending coins across all users
    const pendingCoinsResult = await prisma.userProfile.aggregate({
      _sum: {
        coinsBalance: true,
      },
    })

    // Get total cash distributed
    const totalCashResult = await prisma.userProfile.aggregate({
      _sum: {
        totalCashEarnedUsd: true,
        totalWithdrawnUsd: true,
      },
    })

    // Get conversion stats
    const conversionStats = await prisma.coinConversion.aggregate({
      _sum: {
        admobRevenueUsd: true,
        totalUserPayoutUsd: true,
      },
      _count: true,
    })

    // Get users with pending coins
    const usersWithCoins = await prisma.userProfile.count({
      where: { coinsBalance: { gt: 0 } },
    })

    res.json({
      pendingCoins: pendingCoinsResult._sum.coinsBalance?.toString() || '0',
      totalCashEarned: totalCashResult._sum.totalCashEarnedUsd?.toString() || '0',
      totalWithdrawn: totalCashResult._sum.totalWithdrawnUsd?.toString() || '0',
      totalRevenue: conversionStats._sum.admobRevenueUsd?.toString() || '0',
      totalPayouts: conversionStats._sum.totalUserPayoutUsd?.toString() || '0',
      conversionsProcessed: conversionStats._count,
      usersWithPendingCoins: usersWithCoins,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

/**
 * Update exchange rates manually
 */
router.post('/update-exchange-rates', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const adminUserId = req.user!.id

    await updateExchangeRates()

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminUserId,
        actionType: 'update_exchange_rates',
        details: {
          timestamp: new Date().toISOString(),
        },
      },
    })

    res.json({
      success: true,
      message: 'Exchange rates updated successfully',
    })
  } catch (error) {
    console.error('Error updating exchange rates:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to update exchange rates' 
    })
  }
})

/**
 * Get exchange rate for a currency
 */
router.get('/exchange-rates/:currency', async (req: AuthRequest, res) => {
  try {
    const currency = req.params.currency.toUpperCase()
    const rate = await getExchangeRate(currency)

    res.json({
      currency,
      rate: rate.toFixed(6),
      base: 'USD',
    })
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    res.status(500).json({ error: 'Failed to fetch exchange rate' })
  }
})

export default router
