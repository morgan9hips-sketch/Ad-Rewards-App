# Prisma Schema Field Reference

This document serves as the **source of truth** for all database field names in the Ad Rewards App backend. Always refer to this guide when writing code that interacts with the database.

## ⚠️ Critical: Always Use These Field Names

### UserProfile Model

**Correct Field Names:**
- ✅ `preferredCurrency` (NOT `currency`)
- ✅ `cashBalanceUsd` (NOT `cashWallet.balance`)
- ✅ `coinsBalance` (NOT `coinWallet.balance`)
- ✅ `totalCoinsEarned`
- ✅ `totalCashEarnedUsd`
- ✅ `totalWithdrawnUsd`
- ✅ `revenueCountry` (primary earning country from AdMob)
- ✅ `revenueCountries` (all countries earned from)
- ✅ `displayCountry` (user-facing display preference)
- ✅ `lastIpAddress`
- ✅ `lastDetectedCountry`
- ✅ `vpnSuspicionScore`
- ✅ `suspiciousActivity`

**Legacy Fields (backward compatibility only):**
- `walletBalance` (deprecated, use `coinsBalance`)
- `totalEarned` (deprecated, use `totalCoinsEarned`)

**Fields That Don't Exist:**
- ❌ `currency` → Use `preferredCurrency`
- ❌ `locationLocked` → Removed (use other logic)
- ❌ `verificationData` → Removed (doesn't exist)
- ❌ `cashWallet` → Use `cashBalanceUsd` directly
- ❌ `coinWallet` → Use `coinsBalance` directly

### Transaction Model

**Correct Field Names:**
- ✅ `coinsChange` (for coin transactions, can be positive or negative)
- ✅ `cashChangeUsd` (for cash transactions, can be positive or negative)
- ✅ `coinsBalanceAfter` (snapshot of coins balance after transaction)
- ✅ `cashBalanceAfterUsd` (snapshot of cash balance after transaction)
- ✅ `type` (transaction type: 'ad_view', 'conversion', 'withdrawal', etc.)
- ✅ `description` (human-readable description)
- ✅ `referenceId` (optional reference to related entity)
- ✅ `referenceType` (type of referenced entity)

**Fields That Don't Exist:**
- ❌ `amount` → Use `coinsChange` or `cashChangeUsd` depending on context

### Withdrawal Model

**Correct Field Names:**
- ✅ `amountUsd` (amount in USD - NOT `amount`)
- ✅ `amountLocal` (amount in local currency)
- ✅ `currencyCode` (currency code like 'USD', 'ZAR', 'GBP')
- ✅ `exchangeRate` (conversion rate used)
- ✅ `paypalEmail`
- ✅ `paypalTransactionId`
- ✅ `requestedAt`
- ✅ `processedAt`
- ✅ `completedAt`

**Fields That Don't Exist:**
- ❌ `amount` → Use `amountUsd`

### ExchangeRate Model

**Correct Field Names:**
- ✅ `baseCurrency` (default "USD" - NOT `fromCurrency`)
- ✅ `targetCurrency` (target currency code - NOT `toCurrency`)
- ✅ `rate` (exchange rate value)
- ✅ `date` (date of rate - NOT `effectiveFrom`)

**Fields That Don't Exist:**
- ❌ `fromCurrency` → Use `baseCurrency`
- ❌ `toCurrency` → Use `targetCurrency`
- ❌ `effectiveFrom` → Use `date`
- ❌ `revenueShare` → Doesn't exist

### LocationRevenuePool Model

**Correct Field Names:**
- ✅ `countryCode` (ISO country code: 'US', 'ZA', 'GB', etc.)
- ✅ `month` (first day of the month)
- ✅ `admobRevenueUsd` (total AdMob revenue - source of truth)
- ✅ `userShareUsd` (85% of admobRevenueUsd for users)
- ✅ `totalVideosWatched` (NOT `totalAdViews`)
- ✅ `totalCoinsIssued`
- ✅ `conversionRate` (USD per coin: userShareUsd / totalCoinsIssued)
- ✅ `status` ('pending', 'processing', 'completed')
- ✅ `processedAt`

**Fields That Don't Exist:**
- ❌ `currency` → Always USD
- ❌ `totalRevenue` → Use `admobRevenueUsd`
- ❌ `userRevenue` → Use `userShareUsd`
- ❌ `platformRevenue` → Calculate as `admobRevenueUsd - userShareUsd`
- ❌ `totalUsers` → Calculate on the fly from conversions
- ❌ `totalAdViews` → Use `totalVideosWatched`
- ❌ `averageRewardPerAd` → Calculate on the fly
- ❌ `exchangeRateToUSD` → Always 1.0 for USD
- ❌ `isActive` → Use `status` field

### AdView Model

**Correct Field Names:**
- ✅ `admobImpressionId` (unique AdMob impression ID)
- ✅ `countryCode` (from AdMob SDK - VPN-proof)
- ✅ `estimatedEarningsUsd` (AdMob's estimate)
- ✅ `admobCurrency`
- ✅ `coinsEarned`
- ✅ `ipAddress` (for audit, not primary location)
- ✅ `ipCountry` (for comparison, not primary location)
- ✅ `poolId` (reference to LocationRevenuePool)
- ✅ `converted` (boolean: whether coins converted to cash)

## 🚫 Tables That Don't Exist

### CashWallet
**❌ This table does NOT exist!**
- Use `UserProfile.cashBalanceUsd` instead
- All cash balance operations should update the user profile directly

### CoinWallet
**❌ This table does NOT exist!**
- Use `UserProfile.coinsBalance` instead
- All coin balance operations should update the user profile directly

### SecurityLog
**❌ This table does NOT exist!**
- Use alternative logging mechanisms
- Consider using `AdminAction` for admin-related security events
- Use standard application logging for other security events

## 📋 Common Patterns

### Getting User Balances

```typescript
// ✅ Correct
const user = await prisma.userProfile.findUnique({
  where: { userId },
  select: {
    coinsBalance: true,
    cashBalanceUsd: true,
    preferredCurrency: true,
  }
})

// ❌ Wrong - these don't exist
const user = await prisma.userProfile.findUnique({
  where: { userId },
  include: {
    cashWallet: true,  // ERROR: doesn't exist
    coinWallet: true,  // ERROR: doesn't exist
  }
})
```

### Creating Transactions

```typescript
// ✅ Correct - for coin transaction
await prisma.transaction.create({
  data: {
    userId,
    type: 'ad_view',
    coinsChange: 100n,
    coinsBalanceAfter: newBalance,
    description: 'Earned from watching ad',
  }
})

// ✅ Correct - for cash transaction
await prisma.transaction.create({
  data: {
    userId,
    type: 'conversion',
    cashChangeUsd: 5.50,
    cashBalanceAfterUsd: newCashBalance,
    description: 'Coins converted to cash',
  }
})

// ❌ Wrong - 'amount' doesn't exist
await prisma.transaction.create({
  data: {
    userId,
    type: 'ad_view',
    amount: 100,  // ERROR: use coinsChange or cashChangeUsd
  }
})
```

### Working with Withdrawals

```typescript
// ✅ Correct
const withdrawal = await prisma.withdrawal.create({
  data: {
    userId,
    amountUsd: 20.00,
    amountLocal: 380.00,
    currencyCode: 'ZAR',
    exchangeRate: 19.0,
    method: 'paypal',
    paypalEmail: 'user@example.com',
    status: 'pending',
  }
})

// ❌ Wrong - 'amount' doesn't exist
const withdrawal = await prisma.withdrawal.create({
  data: {
    userId,
    amount: 20.00,  // ERROR: use amountUsd
  }
})
```

### Working with Exchange Rates

```typescript
// ✅ Correct
const rate = await prisma.exchangeRate.findFirst({
  where: {
    targetCurrency: 'ZAR',
    date: today,
  },
  select: {
    baseCurrency: true,  // 'USD'
    targetCurrency: true,  // 'ZAR'
    rate: true,
  }
})

// ❌ Wrong - these fields don't exist
const rate = await prisma.exchangeRate.findFirst({
  where: {
    toCurrency: 'ZAR',  // ERROR: use targetCurrency
    effectiveFrom: today,  // ERROR: use date
  }
})
```

### Working with Location Revenue Pools

```typescript
// ✅ Correct
const pool = await prisma.locationRevenuePool.create({
  data: {
    countryCode: 'US',
    month: new Date('2024-01-01'),
    admobRevenueUsd: 1000.00,
    totalVideosWatched: 5000,
    totalCoinsIssued: 500000n,
    userShareUsd: 850.00,  // 85% of admobRevenueUsd
    conversionRate: 0.0017,  // userShareUsd / totalCoinsIssued
    status: 'processing',
  }
})

// ✅ Calculate platform revenue
const platformRevenue = pool.admobRevenueUsd - pool.userShareUsd

// ❌ Wrong - these fields don't exist
const pool = await prisma.locationRevenuePool.findFirst({
  where: {
    isActive: true,  // ERROR: use status
  },
  select: {
    totalRevenue: true,  // ERROR: use admobRevenueUsd
    platformRevenue: true,  // ERROR: calculate from admobRevenueUsd - userShareUsd
    totalAdViews: true,  // ERROR: use totalVideosWatched
  }
})
```

## 🔒 Business Logic Preservation

**CRITICAL: These must NOT change:**
- ✅ Two-wallet system (coins + cash)
- ✅ 85/15 revenue split (85% users, 15% platform)
- ✅ Geolocation-based revenue pools per country
- ✅ Currency conversion logic
- ✅ AdMob integration (VPN-proof location from AdMob SDK)
- ✅ All business rules and validation

**Only field names have changed to match the actual database schema!**

## 📚 Quick Reference

| Old Name | New Name | Model |
|----------|----------|-------|
| `user.currency` | `user.preferredCurrency` | UserProfile |
| `user.cashWallet.balance` | `user.cashBalanceUsd` | UserProfile |
| `user.coinWallet.balance` | `user.coinsBalance` | UserProfile |
| `transaction.amount` | `transaction.coinsChange` or `transaction.cashChangeUsd` | Transaction |
| `withdrawal.amount` | `withdrawal.amountUsd` | Withdrawal |
| `exchangeRate.fromCurrency` | `exchangeRate.baseCurrency` | ExchangeRate |
| `exchangeRate.toCurrency` | `exchangeRate.targetCurrency` | ExchangeRate |
| `exchangeRate.effectiveFrom` | `exchangeRate.date` | ExchangeRate |
| `pool.totalRevenue` | `pool.admobRevenueUsd` | LocationRevenuePool |
| `pool.userRevenue` | `pool.userShareUsd` | LocationRevenuePool |
| `pool.totalAdViews` | `pool.totalVideosWatched` | LocationRevenuePool |
| `pool.isActive` | `pool.status` | LocationRevenuePool |

## 🎯 Source of Truth

The **only** source of truth for field names is:
```
backend/prisma/schema.prisma
```

When in doubt, always check the Prisma schema file!
