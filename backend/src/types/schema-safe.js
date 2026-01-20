"use strict";
/**
 * Schema-safe types and helpers
 *
 * This file provides type-safe wrappers and utilities to ensure
 * correct usage of Prisma schema fields throughout the codebase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBalance = getUserBalance;
exports.getUserLocation = getUserLocation;
exports.createTransactionData = createTransactionData;
exports.createWithdrawalData = createWithdrawalData;
exports.getExchangeRateData = getExchangeRateData;
exports.getLocationPoolData = getLocationPoolData;
exports.isValidUserBalance = isValidUserBalance;
exports.isValidTransaction = isValidTransaction;
exports.isValidWithdrawal = isValidWithdrawal;
exports.isValidExchangeRate = isValidExchangeRate;
exports.isValidLocationPool = isValidLocationPool;
exports.safeBigInt = safeBigInt;
exports.safeDecimalToNumber = safeDecimalToNumber;
/**
 * Extract safe balance fields from UserProfile
 * WARNING: Converts Decimal to Number - use only for display, not calculations
 */
function getUserBalance(user) {
    return {
        coinsBalance: user.coinsBalance,
        cashBalanceUsd: parseFloat(user.cashBalanceUsd.toString()),
        preferredCurrency: user.preferredCurrency,
        totalCoinsEarned: user.totalCoinsEarned,
        totalCashEarnedUsd: parseFloat(user.totalCashEarnedUsd.toString()),
        totalWithdrawnUsd: parseFloat(user.totalWithdrawnUsd.toString()),
    };
}
/**
 * Extract safe location fields from UserProfile
 */
function getUserLocation(user) {
    return {
        revenueCountry: user.revenueCountry,
        revenueCountries: user.revenueCountries,
        displayCountry: user.displayCountry,
        lastDetectedCountry: user.lastDetectedCountry,
    };
}
/**
 * Create type-safe transaction data
 */
function createTransactionData(data) {
    return {
        type: data.type,
        coinsChange: data.coinsChange,
        cashChangeUsd: data.cashChangeUsd ? Number(data.cashChangeUsd) : undefined,
        coinsBalanceAfter: data.coinsBalanceAfter,
        cashBalanceAfterUsd: data.cashBalanceAfterUsd ? Number(data.cashBalanceAfterUsd) : undefined,
        description: data.description,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
    };
}
/**
 * Create type-safe withdrawal data
 */
function createWithdrawalData(data) {
    return {
        amountUsd: Number(data.amountUsd),
        amountLocal: data.amountLocal ? Number(data.amountLocal) : undefined,
        currencyCode: data.currencyCode,
        exchangeRate: data.exchangeRate ? Number(data.exchangeRate) : undefined,
        paypalEmail: data.paypalEmail,
        method: data.method,
        status: data.status,
    };
}
/**
 * Extract safe exchange rate data
 */
function getExchangeRateData(rate) {
    return {
        baseCurrency: rate.baseCurrency,
        targetCurrency: rate.targetCurrency,
        rate: Number(rate.rate),
        date: rate.date,
    };
}
/**
 * Extract safe location pool data with calculated fields
 */
function getLocationPoolData(pool) {
    var admobRevenueUsd = Number(pool.admobRevenueUsd);
    var userShareUsd = Number(pool.userShareUsd);
    return {
        countryCode: pool.countryCode,
        month: pool.month,
        admobRevenueUsd: admobRevenueUsd,
        userShareUsd: userShareUsd,
        platformRevenueUsd: admobRevenueUsd - userShareUsd, // Calculated
        totalVideosWatched: pool.totalVideosWatched,
        totalCoinsIssued: pool.totalCoinsIssued,
        conversionRate: Number(pool.conversionRate),
        status: pool.status,
    };
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
function isValidUserBalance(user) {
    if (user === null || typeof user !== 'object')
        return false;
    var obj = user;
    return ('coinsBalance' in obj &&
        'cashBalanceUsd' in obj &&
        'preferredCurrency' in obj &&
        typeof obj.preferredCurrency === 'string');
}
function isValidTransaction(tx) {
    if (tx === null || typeof tx !== 'object')
        return false;
    var obj = tx;
    return ('type' in obj &&
        typeof obj.type === 'string' &&
        ('coinsChange' in obj || 'cashChangeUsd' in obj));
}
function isValidWithdrawal(withdrawal) {
    if (withdrawal === null || typeof withdrawal !== 'object')
        return false;
    var obj = withdrawal;
    return ('amountUsd' in obj &&
        'status' in obj &&
        typeof obj.status === 'string');
}
function isValidExchangeRate(rate) {
    if (rate === null || typeof rate !== 'object')
        return false;
    var obj = rate;
    return ('baseCurrency' in obj &&
        'targetCurrency' in obj &&
        'rate' in obj &&
        typeof obj.baseCurrency === 'string' &&
        typeof obj.targetCurrency === 'string');
}
function isValidLocationPool(pool) {
    if (pool === null || typeof pool !== 'object')
        return false;
    var obj = pool;
    return ('countryCode' in obj &&
        'admobRevenueUsd' in obj &&
        'userShareUsd' in obj &&
        'status' in obj &&
        typeof obj.countryCode === 'string' &&
        typeof obj.status === 'string');
}
/**
 * Helper to ensure BigInt is properly handled
 * Throws error if value is not a valid number
 */
function safeBigInt(value) {
    if (typeof value === 'bigint') {
        return value;
    }
    try {
        return BigInt(value);
    }
    catch (error) {
        throw new Error("Invalid BigInt value: ".concat(value));
    }
}
/**
 * Helper to safely convert Decimal to number
 * WARNING: Use only for display purposes, not for precise calculations
 * For precise calculations, work with Decimal values directly
 */
function safeDecimalToNumber(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (value === null || value === undefined) {
        return 0;
    }
    // Handle Prisma Decimal type
    var str = value.toString();
    var num = parseFloat(str);
    if (isNaN(num)) {
        throw new Error("Cannot convert to number: ".concat(str));
    }
    return num;
}
