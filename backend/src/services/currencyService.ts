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
  AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR',
  FR: 'EUR', DE: 'EUR', GR: 'EUR', IE: 'EUR', IT: 'EUR',
  LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', NL: 'EUR',
  PT: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR',
}

export const SUPPORTED_CURRENCIES = ['USD', 'ZAR', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'NGN']

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
    const apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest/USD'
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

    console.log(`✅ Exchange rates updated successfully for ${today.toISOString().split('T')[0]}`)
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
export async function convertFromUSD(amountUSD: number, targetCurrency: string): Promise<number> {
  if (targetCurrency === 'USD') {
    return amountUSD
  }

  const rate = await getExchangeRate(targetCurrency)
  return amountUSD * rate
}

/**
 * Convert amount from target currency to USD
 */
export async function convertToUSD(amount: number, sourceCurrency: string): Promise<number> {
  if (sourceCurrency === 'USD') {
    return amount
  }

  const rate = await getExchangeRate(sourceCurrency)
  return amount / rate
}
