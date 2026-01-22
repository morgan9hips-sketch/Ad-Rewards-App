import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Currency mapping for supported countries
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  ZA: 'ZAR',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  IN: 'INR',
  NG: 'NGN',
  // Eurozone countries
  AT: 'EUR',
  BE: 'EUR',
  CY: 'EUR',
  EE: 'EUR',
  FI: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  GR: 'EUR',
  IE: 'EUR',
  IT: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  LU: 'EUR',
  MT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  ES: 'EUR',
}

// Supported currencies with their full names
// USD - US Dollar, ZAR - South African Rand, EUR - Euro,
// GBP - British Pound, CAD - Canadian Dollar, AUD - Australian Dollar,
// INR - Indian Rupee, NGN - Nigerian Naira, BRL - Brazilian Real, MXN - Mexican Peso
export const SUPPORTED_CURRENCIES = [
  'USD',
  'ZAR',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'INR',
  'NGN',
  'BRL',
  'MXN',
]

// Currency formatting configuration with subscription pricing
// Note: Subscription prices are defined here per currency for easy management
// Update these values to change subscription pricing globally
// For more dynamic pricing, consider moving to environment variables or database
export const CURRENCY_FORMATS: Record<
  string,
  {
    symbol: string
    decimals: number
    position: 'before' | 'after'
    silverPrice: number
    goldPrice: number
    minWithdrawal: number
  }
> = {
  USD: {
    symbol: '$',
    decimals: 2,
    position: 'before',
    silverPrice: 4.99,
    goldPrice: 9.99,
    minWithdrawal: 10,
  },
  ZAR: {
    symbol: 'R',
    decimals: 2,
    position: 'before',
    silverPrice: 89,
    goldPrice: 179,
    minWithdrawal: 180,
  },
  EUR: {
    symbol: '€',
    decimals: 2,
    position: 'before',
    silverPrice: 4.99,
    goldPrice: 9.99,
    minWithdrawal: 10,
  },
  GBP: {
    symbol: '£',
    decimals: 2,
    position: 'before',
    silverPrice: 4.49,
    goldPrice: 8.99,
    minWithdrawal: 8,
  },
  NGN: {
    symbol: '₦',
    decimals: 2,
    position: 'before',
    silverPrice: 3500,
    goldPrice: 7000,
    minWithdrawal: 7000,
  },
  CAD: {
    symbol: 'C$',
    decimals: 2,
    position: 'before',
    silverPrice: 6.99,
    goldPrice: 13.99,
    minWithdrawal: 15,
  },
  AUD: {
    symbol: 'A$',
    decimals: 2,
    position: 'before',
    silverPrice: 7.99,
    goldPrice: 15.99,
    minWithdrawal: 15,
  },
  INR: {
    symbol: '₹',
    decimals: 2,
    position: 'before',
    silverPrice: 399,
    goldPrice: 799,
    minWithdrawal: 800,
  },
  BRL: {
    symbol: 'R$',
    decimals: 2,
    position: 'before',
    silverPrice: 24.99,
    goldPrice: 49.99,
    minWithdrawal: 50,
  },
  MXN: {
    symbol: 'MX$',
    decimals: 2,
    position: 'before',
    silverPrice: 89.99,
    goldPrice: 179.99,
    minWithdrawal: 180,
  },
}

export interface UserCurrencyInfo {
  displayCurrency: string // ZAR, USD, GBP
  revenueCountry: string | null // Where they earn (AdMob)
  displayCountry: string | null // Display preference
  exchangeRate: number
  formatting: {
    symbol: string
    decimals: number
    position: 'before' | 'after'
  }
}

/**
 * Get currency code for a country
 */
export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'USD'
}

/**
 * Fetch latest exchange rates from API and update database
 */
export async function updateExchangeRates(): Promise<void> {
  try {
    const apiUrl =
      process.env.EXCHANGE_RATE_API_URL ||
      'https://api.exchangerate-api.com/v4/latest/USD'
    const response = await axios.get(apiUrl)

    if (!response.data || !response.data.rates) {
      throw new Error('Invalid response from exchange rate API')
    }

    const rates = response.data.rates
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Update rates for each supported currency
    for (const currency of SUPPORTED_CURRENCIES) {
      if (currency === 'USD') continue // Skip base currency

      const rate = rates[currency]
      if (rate) {
        await prisma.exchangeRate.upsert({
          where: {
            targetCurrency_date: {
              targetCurrency: currency,
              date: today,
            },
          },
          create: {
            baseCurrency: 'USD',
            targetCurrency: currency,
            rate: rate,
            date: today,
          },
          update: {
            rate: rate,
          },
        })
      }
    }

    console.log(
      `✅ Exchange rates updated successfully for ${today.toISOString().split('T')[0]}`,
    )
  } catch (error) {
    console.error('❌ Failed to update exchange rates:', error)
    throw error
  }
}

/**
 * Get current exchange rate for a currency
 * Falls back to previous day's rate if today's rate is not available
 */
export async function getExchangeRate(targetCurrency: string): Promise<number> {
  if (targetCurrency === 'USD') {
    return 1.0
  }

  try {
    // Try to get today's rate
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let rate = await prisma.exchangeRate.findFirst({
      where: {
        targetCurrency: targetCurrency,
        date: today,
      },
      orderBy: {
        date: 'desc',
      },
    })

    // If not found, get the most recent rate
    if (!rate) {
      rate = await prisma.exchangeRate.findFirst({
        where: {
          targetCurrency: targetCurrency,
        },
        orderBy: {
          date: 'desc',
        },
      })
    }

    if (!rate) {
      console.warn(`No exchange rate found for ${targetCurrency}, using 1.0`)
      return 1.0
    }

    return parseFloat(rate.rate.toString())
  } catch (error) {
    console.error(`Error fetching exchange rate for ${targetCurrency}:`, error)
    return 1.0
  }
}

/**
 * Convert USD amount to target currency
 */
export async function convertFromUSD(
  amountUSD: number,
  targetCurrency: string,
): Promise<number> {
  if (targetCurrency === 'USD') {
    return amountUSD
  }

  const rate = await getExchangeRate(targetCurrency)
  return amountUSD * rate
}

/**
 * Convert amount from target currency to USD
 */
export async function convertToUSD(
  amount: number,
  sourceCurrency: string,
): Promise<number> {
  if (sourceCurrency === 'USD') {
    return amount
  }

  const rate = await getExchangeRate(sourceCurrency)
  return amount / rate
}

/**
 * Get comprehensive currency info for a user
 * Includes display currency, revenue country, exchange rate, and formatting
 */
export async function getUserCurrencyInfo(
  userId: string,
  method: string = 'ip',
  detectedCountry?: string,
): Promise<UserCurrencyInfo> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      revenueCountry: true,
      displayCountry: true,
      lastDetectedCountry: true,
    },
  })

  if (!profile) {
    throw new Error('User profile not found')
  }

  let displayCurrency: string

  // Always use location-based detection - no manual currency selection allowed
  if (method === 'coordinates' && detectedCountry) {
    // Use country detected from coordinates (most accurate)
    displayCurrency = getCurrencyForCountry(detectedCountry)

    // Update the user's detected country in the database
    await prisma.userProfile.update({
      where: { userId },
      data: {
        lastDetectedCountry: detectedCountry,
        displayCountry: detectedCountry,
        // Set revenue country to detected country if not already set
        revenueCountry: profile.revenueCountry || detectedCountry,
      },
    })
  } else {
    // Fallback to previously detected country or USD
    const fallbackCountry =
      profile.lastDetectedCountry || profile.displayCountry || 'US'
    displayCurrency = getCurrencyForCountry(fallbackCountry)
  }

  const exchangeRate = await getExchangeRate(displayCurrency)
  const formatting =
    CURRENCY_FORMATS[displayCurrency] || CURRENCY_FORMATS['USD']

  return {
    displayCurrency,
    revenueCountry: profile.revenueCountry,
    displayCountry: detectedCountry || profile.displayCountry,
    exchangeRate,
    formatting,
  }
}

/**
 * Format amount in user's display currency
 */
export function formatCurrency(
  amountUsd: number,
  currencyInfo: UserCurrencyInfo,
): string {
  const localAmount = amountUsd * currencyInfo.exchangeRate
  const formatted = localAmount.toFixed(currencyInfo.formatting.decimals)
  const withCommas = parseFloat(formatted).toLocaleString('en-US', {
    minimumFractionDigits: currencyInfo.formatting.decimals,
    maximumFractionDigits: currencyInfo.formatting.decimals,
  })

  return currencyInfo.formatting.position === 'before'
    ? `${currencyInfo.formatting.symbol}${withCommas}`
    : `${withCommas}${currencyInfo.formatting.symbol}`
}
