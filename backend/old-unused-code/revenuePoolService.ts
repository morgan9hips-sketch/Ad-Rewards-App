import { PrismaClient } from '@prisma/client'
import { locationService } from './locationService.js'

const prisma = new PrismaClient()

interface RevenuePoolStats {
  countryCode: string
  currency: string
  totalRevenue: bigint
  userRevenue: bigint
  platformRevenue: bigint
  totalUsers: number
  totalAdViews: number
  averageRewardPerAd: number
  exchangeRateToUSD: number
}

interface AdRevenueData {
  countryCode: string
  userId: string
  adRevenue: number // in currency cents
  rewardAmount: number // in currency cents (85% of adRevenue)
}

class RevenuePoolService {
  /**
   * Initialize revenue pools for all supported countries
   */
  async initializeRevenuePools(): Promise<void> {
    const supportedCountries = [
      { countryCode: 'ZA', currency: 'ZAR' },
      { countryCode: 'US', currency: 'USD' },
      { countryCode: 'CA', currency: 'CAD' },
      { countryCode: 'GB', currency: 'GBP' },
      { countryCode: 'AU', currency: 'AUD' },
      { countryCode: 'DE', currency: 'EUR' },
      { countryCode: 'FR', currency: 'EUR' },
      { countryCode: 'ES', currency: 'EUR' },
      { countryCode: 'IT', currency: 'EUR' },
      { countryCode: 'NL', currency: 'EUR' },
      { countryCode: 'JP', currency: 'JPY' },
      { countryCode: 'CH', currency: 'CHF' },
      { countryCode: 'SE', currency: 'SEK' },
    ]

    for (const { countryCode, currency } of supportedCountries) {
      await prisma.locationRevenuePool.upsert({
        where: { countryCode },
        create: {
          countryCode,
          currency,
          totalRevenue: 0n,
          userRevenue: 0n,
          platformRevenue: 0n,
          totalUsers: 0,
          totalAdViews: 0,
          averageRewardPerAd: 0,
          exchangeRateToUSD: 1.0,
          isActive: true,
        },
        update: {
          currency,
          isActive: true,
          lastUpdated: new Date(),
        },
      })
    }

    console.log('✅ Revenue pools initialized for all supported countries')
  }

  /**
   * Process ad revenue and distribute to pools
   */
  async processAdRevenue(data: AdRevenueData): Promise<void> {
    const { countryCode, userId, adRevenue, rewardAmount } = data
    const currency = locationService.getCurrencyForCountry(countryCode)

    // Platform takes 15%, user gets 85%
    const platformRevenue = Math.round(adRevenue * 0.15)
    const userActualRevenue = adRevenue - platformRevenue

    // Update revenue pool
    await prisma.locationRevenuePool.update({
      where: { countryCode },
      data: {
        totalRevenue: {
          increment: BigInt(adRevenue),
        },
        userRevenue: {
          increment: BigInt(userActualRevenue),
        },
        platformRevenue: {
          increment: BigInt(platformRevenue),
        },
        totalAdViews: {
          increment: 1,
        },
        lastUpdated: new Date(),
      },
    })

    // Calculate new average reward per ad
    await this.updateAverageReward(countryCode)

    console.log(
      `💰 Revenue processed for ${countryCode}: ${adRevenue} ${currency} cents`
    )
  }

  /**
   * Update average reward per ad for a country
   */
  private async updateAverageReward(countryCode: string): Promise<void> {
    const pool = await prisma.locationRevenuePool.findUnique({
      where: { countryCode },
    })

    if (pool && pool.totalAdViews > 0) {
      const averageReward = Number(pool.userRevenue) / pool.totalAdViews
      await prisma.locationRevenuePool.update({
        where: { countryCode },
        data: {
          averageRewardPerAd: Math.round(averageReward),
        },
      })
    }
  }

  /**
   * Get revenue pool statistics for a country
   */
  async getPoolStats(countryCode: string): Promise<RevenuePoolStats | null> {
    const pool = await prisma.locationRevenuePool.findUnique({
      where: { countryCode },
    })

    if (!pool) return null

    return {
      countryCode: pool.countryCode,
      currency: pool.currency,
      totalRevenue: pool.totalRevenue,
      userRevenue: pool.userRevenue,
      platformRevenue: pool.platformRevenue,
      totalUsers: pool.totalUsers,
      totalAdViews: pool.totalAdViews,
      averageRewardPerAd: pool.averageRewardPerAd,
      exchangeRateToUSD: Number(pool.exchangeRateToUSD),
    }
  }

  /**
   * Get all revenue pools for admin dashboard
   */
  async getAllPoolStats(): Promise<RevenuePoolStats[]> {
    const pools = await prisma.locationRevenuePool.findMany({
      where: { isActive: true },
      orderBy: { totalRevenue: 'desc' },
    })

    return pools.map((pool) => ({
      countryCode: pool.countryCode,
      currency: pool.currency,
      totalRevenue: pool.totalRevenue,
      userRevenue: pool.userRevenue,
      platformRevenue: pool.platformRevenue,
      totalUsers: pool.totalUsers,
      totalAdViews: pool.totalAdViews,
      averageRewardPerAd: pool.averageRewardPerAd,
      exchangeRateToUSD: Number(pool.exchangeRateToUSD),
    }))
  }

  /**
   * Update user count for a country (called when user profile is updated)
   */
  async updateUserCount(countryCode: string): Promise<void> {
    const userCount = await prisma.userProfile.count({
      where: {
        country: countryCode,
        locationLocked: true,
      },
    })

    await prisma.locationRevenuePool.update({
      where: { countryCode },
      data: {
        totalUsers: userCount,
        lastUpdated: new Date(),
      },
    })
  }

  /**
   * Update exchange rates for reporting (called periodically)
   */
  async updateExchangeRates(): Promise<void> {
    try {
      // In a real app, you'd call an exchange rate API
      // For now, we'll use mock rates
      const exchangeRates = {
        ZAR: 18.5, // ZAR to USD
        USD: 1.0, // USD to USD
        CAD: 1.35, // CAD to USD
        GBP: 0.75, // GBP to USD
        EUR: 0.85, // EUR to USD
        AUD: 1.45, // AUD to USD
        JPY: 150.0, // JPY to USD
        CHF: 0.9, // CHF to USD
        SEK: 10.5, // SEK to USD
      }

      for (const [currency, rate] of Object.entries(exchangeRates)) {
        await prisma.locationRevenuePool.updateMany({
          where: { currency },
          data: {
            exchangeRateToUSD: rate,
            lastUpdated: new Date(),
          },
        })
      }

      console.log('✅ Exchange rates updated for all revenue pools')
    } catch (error) {
      console.error('❌ Error updating exchange rates:', error)
    }
  }

  /**
   * Get revenue analytics for admin dashboard
   */
  async getRevenueAnalytics() {
    const pools = await this.getAllPoolStats()

    const totalRevenueUSD = pools.reduce((sum, pool) => {
      return sum + Number(pool.totalRevenue) / 100 / pool.exchangeRateToUSD
    }, 0)

    const totalUsers = pools.reduce((sum, pool) => sum + pool.totalUsers, 0)
    const totalAdViews = pools.reduce((sum, pool) => sum + pool.totalAdViews, 0)

    return {
      totalRevenueUSD: Math.round(totalRevenueUSD * 100) / 100, // Round to 2 decimal places
      totalUsers,
      totalAdViews,
      poolCount: pools.length,
      topCountries: pools.slice(0, 5).map((pool) => ({
        country: pool.countryCode,
        revenue: Number(pool.totalRevenue),
        currency: pool.currency,
        users: pool.totalUsers,
      })),
      revenueByCountry: pools,
    }
  }
}

export const revenuePoolService = new RevenuePoolService()
