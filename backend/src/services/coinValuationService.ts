import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Calculate live coin valuation based on recent AdMob revenue performance
 * 
 * Formula:
 * - Get last 30 days of AdMob revenue for country
 * - Calculate average revenue per video
 * - Multiply by 0.85 (user share for opt-in videos)
 * - Scale to per-100-coins rate
 * - Convert to local currency
 */
export async function calculateCoinValuation(countryCode: string): Promise<{
  valuePer100Coins: number
  currencyCode: string
  currencySymbol: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}> {
  try {
    // Get last 30 days of ad views for this country
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get ad views with revenue data for opt-in videos
    const adViews = await prisma.adView.findMany({
      where: {
        countryCode,
        createdAt: { gte: thirtyDaysAgo },
        adType: 'OPT_IN_REWARDED',
        completed: true,
      },
      select: {
        revenueUsd: true,
        coinsAwarded: true,
      },
    })

    if (adViews.length === 0) {
      // No data yet, use default valuation
      return getDefaultValuation(countryCode)
    }

    // Calculate total revenue and coins
    const totalRevenueUsd = adViews.reduce(
      (sum, view) => sum + Number(view.revenueUsd),
      0
    )
    const totalCoins = adViews.reduce(
      (sum, view) => sum + view.coinsAwarded,
      0
    )

    // Calculate value per coin (in USD)
    const valuePerCoin = totalRevenueUsd / totalCoins

    // Scale to per-100-coins
    const valuePer100Coins = valuePerCoin * 100

    // Get currency for country
    const { currencyCode, currencySymbol } = getCurrencyForCountry(countryCode)

    // Convert to local currency (simplified - in production, use real exchange rates)
    const exchangeRate = await getExchangeRate('USD', currencyCode)
    const valuePer100CoinsLocal = valuePer100Coins * exchangeRate

    // Calculate trend (compare with previous period)
    const { trend, changePercent } = await calculateTrend(
      countryCode,
      valuePer100CoinsLocal
    )

    return {
      valuePer100Coins: Number(valuePer100CoinsLocal.toFixed(4)),
      currencyCode,
      currencySymbol,
      trend,
      changePercent,
    }
  } catch (error) {
    console.error('Error calculating coin valuation:', error)
    return getDefaultValuation(countryCode)
  }
}

/**
 * Update all coin valuations (run via cron job every 6 hours)
 */
export async function updateAllCoinValuations(): Promise<void> {
  try {
    // Get all unique countries with ad views
    const countries = await prisma.adView.groupBy({
      by: ['countryCode'],
      where: {
        countryCode: { not: null },
      },
    })

    // Calculate and store valuation for each country
    for (const { countryCode } of countries) {
      if (!countryCode) continue

      const valuation = await calculateCoinValuation(countryCode)

      // Store in database
      await prisma.coinValuation.create({
        data: {
          countryCode,
          valuePer100Coins: valuation.valuePer100Coins,
          currencyCode: valuation.currencyCode,
          calculatedAt: new Date(),
        },
      })
    }

    console.log(`Updated coin valuations for ${countries.length} countries`)
  } catch (error) {
    console.error('Error updating coin valuations:', error)
    throw error
  }
}

/**
 * Get the latest coin valuation for a country
 */
export async function getLatestCoinValuation(countryCode: string): Promise<{
  valuePer100Coins: number
  currencyCode: string
  currencySymbol: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
  lastUpdated: Date
} | null> {
  try {
    // Get the latest valuation
    const latest = await prisma.coinValuation.findFirst({
      where: { countryCode },
      orderBy: { calculatedAt: 'desc' },
    })

    if (!latest) {
      // Calculate fresh valuation if none exists
      const valuation = await calculateCoinValuation(countryCode)
      return {
        ...valuation,
        lastUpdated: new Date(),
      }
    }

    // Get previous valuation for trend
    const previous = await prisma.coinValuation.findFirst({
      where: {
        countryCode,
        calculatedAt: { lt: latest.calculatedAt },
      },
      orderBy: { calculatedAt: 'desc' },
    })

    const { trend, changePercent } = calculateTrendFromValues(
      previous ? Number(previous.valuePer100Coins) : null,
      Number(latest.valuePer100Coins)
    )

    const { currencySymbol } = getCurrencyForCountry(countryCode)

    return {
      valuePer100Coins: Number(latest.valuePer100Coins),
      currencyCode: latest.currencyCode,
      currencySymbol,
      trend,
      changePercent,
      lastUpdated: latest.calculatedAt,
    }
  } catch (error) {
    console.error('Error getting latest coin valuation:', error)
    return null
  }
}

/**
 * Get default valuation for countries with no data
 */
function getDefaultValuation(countryCode: string): {
  valuePer100Coins: number
  currencyCode: string
  currencySymbol: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
} {
  const { currencyCode, currencySymbol } = getCurrencyForCountry(countryCode)

  // Default: assume $1.00 USD per 100 coins
  const defaultUsdValue = 1.0

  // Convert to local currency
  const exchangeRate = getDefaultExchangeRate('USD', currencyCode)
  const valuePer100Coins = defaultUsdValue * exchangeRate

  return {
    valuePer100Coins: Number(valuePer100Coins.toFixed(4)),
    currencyCode,
    currencySymbol,
    trend: 'stable',
    changePercent: 0,
  }
}

/**
 * Calculate trend compared to previous period
 */
async function calculateTrend(
  countryCode: string,
  currentValue: number
): Promise<{ trend: 'up' | 'down' | 'stable'; changePercent: number }> {
  try {
    // Get previous valuation (most recent before current calculation)
    const previous = await prisma.coinValuation.findFirst({
      where: { countryCode },
      orderBy: { calculatedAt: 'desc' },
    })

    if (!previous) {
      return { trend: 'stable', changePercent: 0 }
    }

    return calculateTrendFromValues(Number(previous.valuePer100Coins), currentValue)
  } catch (error) {
    return { trend: 'stable', changePercent: 0 }
  }
}

/**
 * Calculate trend from two values
 */
function calculateTrendFromValues(
  previousValue: number | null,
  currentValue: number
): { trend: 'up' | 'down' | 'stable'; changePercent: number } {
  if (!previousValue) {
    return { trend: 'stable', changePercent: 0 }
  }

  const change = currentValue - previousValue
  const changePercent = (change / previousValue) * 100

  let trend: 'up' | 'down' | 'stable'
  if (Math.abs(changePercent) < 1) {
    trend = 'stable'
  } else if (changePercent > 0) {
    trend = 'up'
  } else {
    trend = 'down'
  }

  return { trend, changePercent: Number(changePercent.toFixed(2)) }
}

/**
 * Get currency code and symbol for a country
 */
function getCurrencyForCountry(countryCode: string): {
  currencyCode: string
  currencySymbol: string
} {
  // Map of country codes to currencies
  const currencyMap: Record<string, { code: string; symbol: string }> = {
    ZA: { code: 'ZAR', symbol: 'R' },
    US: { code: 'USD', symbol: '$' },
    GB: { code: 'GBP', symbol: '£' },
    EU: { code: 'EUR', symbol: '€' },
    IN: { code: 'INR', symbol: '₹' },
    BR: { code: 'BRL', symbol: 'R$' },
    // Add more countries as needed
  }

  const currency = currencyMap[countryCode] || { code: 'USD', symbol: '$' }
  return { currencyCode: currency.code, currencySymbol: currency.symbol }
}

/**
 * Get exchange rate (simplified - in production, use real API)
 */
async function getExchangeRate(
  from: string,
  to: string
): Promise<number> {
  try {
    // Try to get from database first
    const rate = await prisma.exchangeRate.findFirst({
      where: {
        baseCurrency: from,
        targetCurrency: to,
      },
      orderBy: { date: 'desc' },
    })

    if (rate) {
      return Number(rate.rate)
    }

    // Fallback to default rates
    return getDefaultExchangeRate(from, to)
  } catch (error) {
    return getDefaultExchangeRate(from, to)
  }
}

/**
 * Get default exchange rates (fallback)
 * TODO: Integrate with real-time exchange rate API (e.g., exchangerate-api.com)
 * These rates are approximate and should be updated regularly
 */
function getDefaultExchangeRate(from: string, to: string): number {
  if (from === to) return 1

  // Default exchange rates (approximate, as of implementation date)
  // TODO: Update these rates regularly or fetch from external API
  const rates: Record<string, number> = {
    'USD-ZAR': 18.5,
    'USD-GBP': 0.79,
    'USD-EUR': 0.92,
    'USD-INR': 83.0,
    'USD-BRL': 5.0,
  }

  const key = `${from}-${to}`
  return rates[key] || 1
}
