/**
 * Schema-safe types and helpers
 * 
 * This file provides type-safe wrappers and utilities to ensure
 * correct usage of Prisma schema fields throughout the codebase.
 */

import { UserProfile, Transaction, Withdrawal, ExchangeRate, LocationRevenuePool } from '@prisma/client'

/**
 * Type-safe user balance getters
 * Note: For precise monetary calculations, use the Decimal fields directly from Prisma
 * These helpers convert to number for display purposes only
 */
export interface SafeUserBalance {
  coinsBalance: bigint
  cashBalanceUsd: number
  preferredCurrency: string
  totalCoinsEarned: bigint
  totalCashEarnedUsd: number
  totalWithdrawnUsd: number
}

/**
 * Extract safe balance fields from UserProfile
 * WARNING: Converts Decimal to Number - use only for display, not calculations
 */
export function getUserBalance(user: UserProfile): SafeUserBalance {
  return {
    coinsBalance: user.coinsBalance,
    cashBalanceUsd: parseFloat(user.cashBalanceUsd.toString()),
    preferredCurrency: user.preferredCurrency,
    totalCoinsEarned: user.totalCoinsEarned,
    totalCashEarnedUsd: parseFloat(user.totalCashEarnedUsd.toString()),
    totalWithdrawnUsd: parseFloat(user.totalWithdrawnUsd.toString()),
  }
}

/**
 * Type-safe location fields
 */
export interface SafeLocationData {
  revenueCountry: string | null
  revenueCountries: string[]
  displayCountry: string | null
  lastDetectedCountry: string | null
}

/**
 * Extract safe location fields from UserProfile
 */
export function getUserLocation(user: UserProfile): SafeLocationData {
  return {
    revenueCountry: user.revenueCountry,
    revenueCountries: user.revenueCountries,
    displayCountry: user.displayCountry,
    lastDetectedCountry: user.lastDetectedCountry,
  }
}

/**
 * Type-safe transaction data
 */
export interface SafeTransactionData {
  type: string
  coinsChange?: bigint
  cashChangeUsd?: number
  coinsBalanceAfter?: bigint
  cashBalanceAfterUsd?: number
  description?: string
  referenceId?: number
  referenceType?: string
}

/**
 * Create type-safe transaction data
 */
export function createTransactionData(data: {
  type: string
  coinsChange?: bigint
  cashChangeUsd?: number | string
  coinsBalanceAfter?: bigint
  cashBalanceAfterUsd?: number | string
  description?: string
  referenceId?: number
  referenceType?: string
}): SafeTransactionData {
  return {
    type: data.type,
    coinsChange: data.coinsChange,
    cashChangeUsd: data.cashChangeUsd ? Number(data.cashChangeUsd) : undefined,
    coinsBalanceAfter: data.coinsBalanceAfter,
    cashBalanceAfterUsd: data.cashBalanceAfterUsd ? Number(data.cashBalanceAfterUsd) : undefined,
    description: data.description,
    referenceId: data.referenceId,
    referenceType: data.referenceType,
  }
}

/**
 * Type-safe withdrawal data
 */
export interface SafeWithdrawalData {
  amountUsd: number
  amountLocal?: number
  currencyCode?: string
  exchangeRate?: number
  paypalEmail: string
  method: string
  status: string
}

/**
 * Create type-safe withdrawal data
 */
export function createWithdrawalData(data: {
  amountUsd: number | string
  amountLocal?: number | string
  currencyCode?: string
  exchangeRate?: number | string
  paypalEmail: string
  method: string
  status: string
}): SafeWithdrawalData {
  return {
    amountUsd: Number(data.amountUsd),
    amountLocal: data.amountLocal ? Number(data.amountLocal) : undefined,
    currencyCode: data.currencyCode,
    exchangeRate: data.exchangeRate ? Number(data.exchangeRate) : undefined,
    paypalEmail: data.paypalEmail,
    method: data.method,
    status: data.status,
  }
}

/**
 * Type-safe exchange rate data
 */
export interface SafeExchangeRateData {
  baseCurrency: string
  targetCurrency: string
  rate: number
  date: Date
}

/**
 * Extract safe exchange rate data
 */
export function getExchangeRateData(rate: ExchangeRate): SafeExchangeRateData {
  return {
    baseCurrency: rate.baseCurrency,
    targetCurrency: rate.targetCurrency,
    rate: Number(rate.rate),
    date: rate.date,
  }
}

/**
 * Type-safe location pool data
 */
export interface SafeLocationPoolData {
  countryCode: string
  month: Date
  admobRevenueUsd: number
  userShareUsd: number
  platformRevenueUsd: number  // Calculated field
  totalVideosWatched: number
  totalCoinsIssued: bigint
  conversionRate: number
  status: string
}

/**
 * Extract safe location pool data with calculated fields
 */
export function getLocationPoolData(pool: LocationRevenuePool): SafeLocationPoolData {
  const admobRevenueUsd = Number(pool.admobRevenueUsd)
  const userShareUsd = Number(pool.userShareUsd)
  
  return {
    countryCode: pool.countryCode,
    month: pool.month,
    admobRevenueUsd,
    userShareUsd,
    platformRevenueUsd: admobRevenueUsd - userShareUsd,  // Calculated
    totalVideosWatched: pool.totalVideosWatched,
    totalCoinsIssued: pool.totalCoinsIssued,
    conversionRate: Number(pool.conversionRate),
    status: pool.status,
  }
}

/**
 * Deprecated field warnings
 * 
 * NOTE: These tables/fields don't exist in the schema:
 * - CashWallet table → Use UserProfile.cashBalanceUsd
 * - CoinWallet table → Use UserProfile.coinsBalance
 * - SecurityLog table → Use alternative logging
 * - user.currency field → Use user.preferredCurrency
 */

/**
 * Type guards for runtime validation
 */

export function isValidUserBalance(user: unknown): user is UserProfile {
  return (
    user !== null &&
    typeof user === 'object' &&
    'coinsBalance' in user &&
    'cashBalanceUsd' in user &&
    'preferredCurrency' in user &&
    typeof (user as any).preferredCurrency === 'string'
  )
}

export function isValidTransaction(tx: unknown): tx is Transaction {
  return (
    tx !== null &&
    typeof tx === 'object' &&
    'type' in tx &&
    typeof tx.type === 'string' &&
    ('coinsChange' in tx || 'cashChangeUsd' in tx)
  )
}

export function isValidWithdrawal(withdrawal: unknown): withdrawal is Withdrawal {
  return (
    withdrawal !== null &&
    typeof withdrawal === 'object' &&
    'amountUsd' in withdrawal &&
    'status' in withdrawal &&
    typeof withdrawal.status === 'string'
  )
}

export function isValidExchangeRate(rate: unknown): rate is ExchangeRate {
  return (
    rate !== null &&
    typeof rate === 'object' &&
    'baseCurrency' in rate &&
    'targetCurrency' in rate &&
    'rate' in rate &&
    typeof rate.baseCurrency === 'string' &&
    typeof rate.targetCurrency === 'string'
  )
}

export function isValidLocationPool(pool: unknown): pool is LocationRevenuePool {
  return (
    pool !== null &&
    typeof pool === 'object' &&
    'countryCode' in pool &&
    'admobRevenueUsd' in pool &&
    'userShareUsd' in pool &&
    'status' in pool &&
    typeof pool.countryCode === 'string' &&
    typeof pool.status === 'string'
  )
}

/**
 * Helper to ensure BigInt is properly handled
 * Throws error if value is not a valid number
 */
export function safeBigInt(value: bigint | number | string): bigint {
  if (typeof value === 'bigint') {
    return value
  }
  
  try {
    return BigInt(value)
  } catch (error) {
    throw new Error(`Invalid BigInt value: ${value}`)
  }
}

/**
 * Helper to safely convert Decimal to number
 * WARNING: Use only for display purposes, not for precise calculations
 * For precise calculations, work with Decimal values directly
 */
export function safeDecimalToNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }
  
  if (value === null || value === undefined) {
    return 0
  }
  
  // Handle Prisma Decimal type
  const str = value.toString()
  const num = parseFloat(str)
  
  if (isNaN(num)) {
    throw new Error(`Cannot convert to number: ${str}`)
  }
  
  return num
}
