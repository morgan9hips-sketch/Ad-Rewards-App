import { Router } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { logAdminAction } from '../middleware/logAdminAction.js'
import { convertCoinsToUSD } from '../services/transactionService.js'
import { updateExchangeRates, getExchangeRate } from '../services/currencyService.js'

const router = Router()
const prisma = new PrismaClient()

const USER_REVENUE_SHARE = parseFloat(process.env.USER_REVENUE_SHARE || '0.85')

// Apply admin middleware to ALL admin routes
router.use(requireAdmin)

/**
 * Process monthly coin-to-cash conversion with LOCATION-BASED pools
 * New endpoint that processes revenue separately per country
 */
router.post('/process-location-conversion', logAdminAction('PROCESS_LOCATION_CONVERSION'), async (req: AuthRequest, res) => {
  try {
    const { revenues, month, notes } = req.body
    const adminUserId = req.user!.id

    // Validate input
    if (!revenues || !Array.isArray(revenues) || revenues.length === 0) {
      return res.status(400).json({ error: 'Invalid revenues array' })
    }

    // Validate each revenue entry
    for (const rev of revenues) {
      if (!rev.countryCode || !rev.admobRevenueUsd || rev.admobRevenueUsd <= 0) {
        return res.status(400).json({ error: 'Each revenue must have countryCode and valid admobRevenueUsd' })
      }
    }

    const conversionDate = month ? new Date(month) : new Date()
    conversionDate.setDate(1) // Set to first day of month

    // Process each location separately in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const locationResults = []

      for (const revenue of revenues) {
        const { countryCode, admobRevenueUsd } = revenue
        const admobRevenueUsdNum = parseFloat(admobRevenueUsd)

        // Get users with coins from THIS location only
        const usersInLocation = await tx.adView.groupBy({
          by: ['userId'],
          where: {
            countryCode: countryCode,
            converted: false,
            completed: true
          },
          _sum: {
            coinsEarned: true
          }
        })

        if (usersInLocation.length === 0) {
          console.log(`⚠️  No users with unconverted coins in ${countryCode}, skipping...`)
          continue
        }

        // Calculate total coins for THIS location
        const totalCoins = usersInLocation.reduce(
          (sum, user) => sum + BigInt(user._sum.coinsEarned || 0),
          BigInt(0)
        )

        if (totalCoins === BigInt(0)) {
          console.log(`⚠️  Total coins is zero for ${countryCode}, skipping...`)
          continue
        }

        // Calculate THIS location's conversion rate
        const userShareUsd = admobRevenueUsdNum * USER_REVENUE_SHARE
        const conversionRate = userShareUsd / Number(totalCoins)

        // Count total videos watched
        const totalVideos = await tx.adView.count({
          where: {
            countryCode: countryCode,
            converted: false,
            completed: true
          }
        })

        // Create location revenue pool
        const pool = await tx.locationRevenuePool.create({
          data: {
            countryCode,
            month: conversionDate,
            admobRevenueUsd: admobRevenueUsdNum,
            totalVideosWatched: totalVideos,
            totalCoinsIssued: totalCoins,
            userShareUsd,
            conversionRate,
            status: 'processing',
          }
        })

        // Convert coins for users in THIS location only
        let totalCashDistributed = 0
        const userIds = []

        for (const user of usersInLocation) {
          const coins = BigInt(user._sum.coinsEarned || 0)
          const cashUsd = Number(coins) * conversionRate

          // Get user profile
          const profile = await tx.userProfile.findUnique({
            where: { userId: user.userId }
          })

          if (!profile) continue

          userIds.push(user.userId)

          // Convert user's coins to cash
          await convertCoinsToUSD(user.userId, coins, cashUsd, pool.id, tx)

          // Create location conversion detail record
          await tx.locationConversion.create({
            data: {
              poolId: pool.id,
              userId: user.userId,
              coinsConverted: coins,
              cashReceivedUsd: cashUsd,
              conversionRate,
            }
          })

          totalCashDistributed += cashUsd
        }

        // Mark ad views from THIS location as converted and link to pool
        await tx.adView.updateMany({
          where: {
            countryCode: countryCode,
            converted: false,
            userId: { in: userIds }
          },
          data: {
            converted: true,
            poolId: pool.id
          }
        })

        // Update pool status
        await tx.locationRevenuePool.update({
          where: { id: pool.id },
          data: {
            status: 'completed',
            processedAt: new Date()
          }
        })

        locationResults.push({
          countryCode,
          poolId: pool.id,
          admobRevenue: admobRevenueUsdNum,
          totalCoins: totalCoins.toString(),
          conversionRate,
          usersAffected: usersInLocation.length,
          totalCashDistributed
        })

        console.log(`✅ Processed ${countryCode}: ${usersInLocation.length} users, ${totalCoins} coins, rate $${conversionRate.toFixed(8)}/coin`)
      }

      // Log admin action
      await tx.adminAction.create({
        data: {
          adminId: adminUserId,
          action: 'location_conversion',
          targetType: 'LOCATION_POOL',
          metadata: {
            month: month,
            locationResults,
            notes
          }
        }
      })

      return locationResults
    }, {
      timeout: 120000, // 2 minute timeout for large conversions
    })

    res.json({
      success: true,
      message: 'Location-based conversion completed successfully',
      results
    })
  } catch (error) {
    console.error('Error processing location conversion:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process location conversion'
    })
  }
})

/**
 * Process monthly coin-to-cash conversion (LEGACY - global pool)
 * This is the critical conversion endpoint that must be transactional
 */
router.post('/process-conversion', logAdminAction('PROCESS_CONVERSION'), async (req: AuthRequest, res) => {
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
          adminId: adminUserId,
          action: 'coin_conversion',
          targetType: 'CONVERSION',
          targetId: conversion.id,
          metadata: {
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
router.get('/conversions', logAdminAction('VIEW_CONVERSION_HISTORY'), async (req: AuthRequest, res) => {
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
router.get('/conversions/:id', logAdminAction('VIEW_CONVERSION_DETAILS'), async (req: AuthRequest, res) => {
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
router.get('/stats', logAdminAction('VIEW_STATS'), async (req: AuthRequest, res) => {
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
 * Get location-based statistics (per-country breakdown)
 */
router.get('/stats/by-location', logAdminAction('VIEW_LOCATION_STATS'), async (req: AuthRequest, res) => {
  try {
    // Get all countries with ad views
    const countries = await prisma.adView.groupBy({
      by: ['countryCode'],
      where: {
        countryCode: { not: null }
      },
      _count: true
    })

    const locationStats = []

    for (const country of countries) {
      if (!country.countryCode) continue

      // Pending coins for this location
      const pendingCoins = await prisma.adView.groupBy({
        by: ['userId'],
        where: {
          countryCode: country.countryCode,
          converted: false,
          completed: true
        },
        _sum: {
          coinsEarned: true
        }
      })

      const totalPendingCoins = pendingCoins.reduce(
        (sum, user) => sum + BigInt(user._sum.coinsEarned || 0),
        BigInt(0)
      )

      // Converted coins for this location
      const convertedViews = await prisma.adView.groupBy({
        by: ['userId'],
        where: {
          countryCode: country.countryCode,
          converted: true
        },
        _sum: {
          coinsEarned: true
        }
      })

      const totalConvertedCoins = convertedViews.reduce(
        (sum, user) => sum + BigInt(user._sum.coinsEarned || 0),
        BigInt(0)
      )

      // Revenue from location pools
      const poolStats = await prisma.locationRevenuePool.aggregate({
        where: {
          countryCode: country.countryCode
        },
        _sum: {
          admobRevenueUsd: true,
          userShareUsd: true
        },
        _avg: {
          conversionRate: true
        }
      })

      // Active users in this location
      const activeUsers = await prisma.adView.groupBy({
        by: ['userId'],
        where: {
          countryCode: country.countryCode
        }
      })

      locationStats.push({
        country: country.countryCode,
        pendingCoins: totalPendingCoins.toString(),
        convertedCoins: totalConvertedCoins.toString(),
        totalRevenue: poolStats._sum.admobRevenueUsd?.toString() || '0',
        totalUserPayout: poolStats._sum.userShareUsd?.toString() || '0',
        averageConversionRate: poolStats._avg.conversionRate?.toString() || '0',
        usersActive: activeUsers.length
      })
    }

    // Sort by revenue descending
    locationStats.sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue))

    // Global totals
    const globalPending = locationStats.reduce(
      (sum, loc) => sum + BigInt(loc.pendingCoins),
      BigInt(0)
    )
    const globalRevenue = locationStats.reduce(
      (sum, loc) => sum + parseFloat(loc.totalRevenue),
      0
    )

    res.json({
      global: {
        totalPendingCoins: globalPending.toString(),
        totalRevenue: globalRevenue.toFixed(2)
      },
      byLocation: locationStats
    })
  } catch (error) {
    console.error('Error fetching location stats:', error)
    res.status(500).json({ error: 'Failed to fetch location statistics' })
  }
})

/**
 * Get fraud detection stats and suspicious users
 */
router.get('/fraud-stats', logAdminAction('VIEW_FRAUD_STATS'), async (req: AuthRequest, res) => {
  try {
    const { getFraudStats, getSuspiciousUsers, getVPNDetections } = await import('../services/fraudDetection.js')

    const stats = await getFraudStats()
    const suspiciousUsers = await getSuspiciousUsers(1, 20)

    res.json({
      stats,
      suspiciousUsers: suspiciousUsers.users,
      total: suspiciousUsers.total
    })
  } catch (error) {
    console.error('Error fetching fraud stats:', error)
    res.status(500).json({ error: 'Failed to fetch fraud statistics' })
  }
})

/**
 * Get VPN detections for a specific user
 */
router.get('/fraud/user/:userId', logAdminAction('VIEW_USER_FRAUD'), async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params
    const { getVPNDetections } = await import('../services/fraudDetection.js')

    const detections = await getVPNDetections(userId)

    res.json({
      userId,
      detections
    })
  } catch (error) {
    console.error('Error fetching user fraud data:', error)
    res.status(500).json({ error: 'Failed to fetch user fraud data' })
  }
})

/**
 * Update exchange rates manually
 */
router.post('/update-exchange-rates', logAdminAction('UPDATE_EXCHANGE_RATES'), async (req: AuthRequest, res) => {
  try {
    const adminUserId = req.user!.id

    await updateExchangeRates()

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

/**
 * Get admin action logs
 */
router.get('/logs', async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 50, action, adminId } = req.query

    const where: any = {}
    if (action) where.action = action
    if (adminId) where.adminId = adminId as string

    const logs = await prisma.adminAction.findMany({
      where,
      include: {
        admin: {
          select: {
            userId: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    })

    const total = await prisma.adminAction.count({ where })

    res.json({
      logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error) {
    console.error('Error fetching admin logs:', error)
    res.status(500).json({ error: 'Failed to fetch admin logs' })
  }
})

export default router
