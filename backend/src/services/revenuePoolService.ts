import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Revenue sharing constants
const USER_REVENUE_SHARE = 0.85 // 85% of revenue goes to users
const PLATFORM_REVENUE_SHARE = 0.15 // 15% of revenue goes to platform

/**
 * Create monthly revenue pools by country
 */
export async function createMonthlyRevenuePools(
  month: string,
  monetagRevenueUsd: number
): Promise<void> {
  const startOfMonth = new Date(month + '-01')
  const endOfMonth = new Date(startOfMonth)
  endOfMonth.setMonth(endOfMonth.getMonth() + 1)

  // Get impressions grouped by country (only rewarded ads count)
  const countries = await prisma.montagImpression.groupBy({
    by: ['countryCode'],
    where: {
      createdAt: { gte: startOfMonth, lt: endOfMonth },
      adType: 'rewarded', // Only count rewarded ads
    },
    _sum: { estimatedRevenueUsd: true },
    _count: { id: true },
  })

  for (const country of countries) {
    const countryRevenue = country._sum.estimatedRevenueUsd || 0
    const userShare = countryRevenue * USER_REVENUE_SHARE
    const platformShare = countryRevenue * PLATFORM_REVENUE_SHARE

    // Get total coins earned in this country
    const totalCoins = await prisma.montagImpression.aggregate({
      where: {
        countryCode: country.countryCode,
        adType: 'rewarded',
        createdAt: { gte: startOfMonth, lt: endOfMonth },
      },
      _sum: { coinsAwarded: true },
    })

    const coinsSum = Number(totalCoins._sum.coinsAwarded || 0)
    const conversionRate = coinsSum > 0 ? userShare / coinsSum : 0

    await prisma.revenuePool.create({
      data: {
        month,
        countryCode: country.countryCode,
        totalRevenueUsd: countryRevenue,
        userShareUsd: userShare,
        platformShareUsd: platformShare,
        totalCoinsIssued: BigInt(coinsSum),
        conversionRate,
        impressionCount: country._count.id,
        status: 'pending',
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
    })
  }
}

/**
 * Distribute revenue to users from a specific pool
 */
export async function distributeRevenueToUsers(poolId: number): Promise<void> {
  const pool = await prisma.revenuePool.findUnique({ where: { id: poolId } })

  if (!pool) {
    throw new Error('Revenue pool not found')
  }

  if (pool.status === 'completed') {
    throw new Error('Pool already distributed')
  }

  // Mark pool as distributing
  await prisma.revenuePool.update({
    where: { id: poolId },
    data: { status: 'distributing' },
  })

  // Get all users who earned in this pool
  const users = await prisma.montagImpression.groupBy({
    by: ['userId'],
    where: {
      countryCode: pool.countryCode,
      adType: 'rewarded',
      createdAt: { gte: pool.startDate, lt: pool.endDate },
    },
    _sum: { coinsAwarded: true },
  })

  for (const user of users) {
    const userCoins = Number(user._sum.coinsAwarded || 0)
    const userCashUsd = userCoins * pool.conversionRate

    // Check if beta user → apply 1.5x multiplier
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.userId },
      select: { isBetaUser: true, betaMultiplier: true },
    })

    const finalCash = profile?.isBetaUser
      ? userCashUsd * (profile.betaMultiplier || 1.5)
      : userCashUsd

    // Convert coins to cash
    await convertCoinsToUSD(user.userId, BigInt(userCoins), finalCash, poolId)
  }

  // Mark pool as completed
  await prisma.revenuePool.update({
    where: { id: poolId },
    data: { status: 'completed', distributedAt: new Date() },
  })
}

/**
 * Convert user coins to USD cash balance
 */
async function convertCoinsToUSD(
  userId: string,
  coins: bigint,
  cashUsd: number,
  poolId: number
): Promise<void> {
  // Deduct coins from user balance
  await prisma.userProfile.update({
    where: { userId },
    data: {
      coinsBalance: { decrement: coins },
      cashBalanceUsd: { increment: cashUsd },
      totalCashEarnedUsd: { increment: cashUsd },
    },
  })

  // Create transaction record
  await prisma.transaction.create({
    data: {
      userId,
      type: 'coins_to_cash_conversion',
      coinsChange: -coins,
      cashChangeUsd: cashUsd,
      description: `Converted ${coins} coins to $${cashUsd.toFixed(4)} USD (Pool ${poolId})`,
      referenceId: poolId,
      referenceType: 'revenue_pool',
    },
  })
}

/**
 * Get total beta debt across all users
 */
export async function getTotalBetaDebt(): Promise<number> {
  const result = await prisma.betaDebt.aggregate({
    _sum: { estimatedDebtUsd: true },
  })

  return result._sum.estimatedDebtUsd || 0
}

/**
 * Get revenue pools by status
 */
export async function getRevenuePools(status?: string) {
  return await prisma.revenuePool.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}
