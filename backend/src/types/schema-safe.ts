/**
 * Schema-safe types and helpers
 * 
 * This file provides type-safe wrappers and utilities to ensure
 * correct usage of Prisma schema fields throughout the codebase.
 */

import { UserProfile, Transaction, Withdrawal, ExchangeRate, LocationRevenuePool } from '@prisma/client'

/**
 * Type-safe user balance getters
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
 */
export function getUserBalance(user: UserProfile): SafeUserBalance {
  return {
    coinsBalance: user.coinsBalance,
    cashBalanceUsd: Number(user.cashBalanceUsd),
    preferredCurrency: user.preferredCurrency,
    totalCoinsEarned: user.totalCoinsEarned,
    totalCashEarnedUsd: Number(user.totalCashEarnedUsd),
    totalWithdrawnUsd: Number(user.totalWithdrawnUsd),
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

export function isValidUserBalance(user: any): user is UserProfile {
  return (
    user &&
    typeof user.coinsBalance !== 'undefined' &&
    typeof user.cashBalanceUsd !== 'undefined' &&
    typeof user.preferredCurrency === 'string'
  )
}

export function isValidTransaction(tx: any): tx is Transaction {
  return (
    tx &&
    typeof tx.type === 'string' &&
    (typeof tx.coinsChange !== 'undefined' || typeof tx.cashChangeUsd !== 'undefined')
  )
}

export function isValidWithdrawal(withdrawal: any): withdrawal is Withdrawal {
  return (
    withdrawal &&
    typeof withdrawal.amountUsd !== 'undefined' &&
    typeof withdrawal.status === 'string'
  )
}

export function isValidExchangeRate(rate: any): rate is ExchangeRate {
  return (
    rate &&
    typeof rate.baseCurrency === 'string' &&
    typeof rate.targetCurrency === 'string' &&
    typeof rate.rate !== 'undefined'
  )
}

export function isValidLocationPool(pool: any): pool is LocationRevenuePool {
  return (
    pool &&
    typeof pool.countryCode === 'string' &&
    typeof pool.admobRevenueUsd !== 'undefined' &&
    typeof pool.userShareUsd !== 'undefined' &&
    typeof pool.status === 'string'
  )
}

/**
 * Helper to ensure BigInt is properly handled
 */
export function safeBigInt(value: bigint | number | string): bigint {
  if (typeof value === 'bigint') {
    return value
  }
  return BigInt(value)
}

/**
 * Helper to safely convert Decimal to number
 */
export function safeDecimalToNumber(value: any): number {
  if (typeof value === 'number') {
    return value
  }
  return Number(value.toString())
}
