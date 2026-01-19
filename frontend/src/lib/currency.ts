// Currency formatting utilities for location-specific display

export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  minWithdrawal: number // in cents
  format: (amount: number) => string
}

export const CURRENCY_CONFIG: Record<string, CurrencyInfo> = {
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    minWithdrawal: 15000, // R150.00 in cents
    format: (amount: number) => `R${(amount / 100).toFixed(2)}`,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    minWithdrawal: 1000, // $10.00 in cents
    format: (amount: number) => `$${(amount / 100).toFixed(2)}`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    minWithdrawal: 1000, // €10.00 in cents
    format: (amount: number) => `€${(amount / 100).toFixed(2)}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    minWithdrawal: 800, // £8.00 in cents
    format: (amount: number) => `£${(amount / 100).toFixed(2)}`,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    minWithdrawal: 1300, // C$13.00 in cents
    format: (amount: number) => `C$${(amount / 100).toFixed(2)}`,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    minWithdrawal: 1500, // A$15.00 in cents
    format: (amount: number) => `A$${(amount / 100).toFixed(2)}`,
  },
}

export const formatCurrency = (
  amount: number,
  currencyCode: string
): string => {
  const currency = CURRENCY_CONFIG[currencyCode]
  if (currency) {
    return currency.format(amount)
  }

  // Fallback formatting
  return `${(amount / 100).toFixed(2)} ${currencyCode}`
}

export const getCurrencyInfo = (currencyCode: string): CurrencyInfo => {
  return CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.ZAR // Default to ZAR for safety
}

export const getMinWithdrawalText = (currencyCode: string): string => {
  const currency = getCurrencyInfo(currencyCode)
  return `Minimum withdrawal: ${currency.format(currency.minWithdrawal)}`
}

export const validateWithdrawalAmount = (
  amount: number,
  currencyCode: string
): {
  isValid: boolean
  error?: string
} => {
  const currency = getCurrencyInfo(currencyCode)
  const amountInCents = Math.round(amount * 100)

  if (amountInCents < currency.minWithdrawal) {
    return {
      isValid: false,
      error: `Minimum withdrawal amount is ${currency.format(
        currency.minWithdrawal
      )}`,
    }
  }

  return { isValid: true }
}
