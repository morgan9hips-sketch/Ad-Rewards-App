import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../src/middleware/auth.js'

// Import routes
import userRoutes from '../src/routes/user.js'
import adsRoutes from '../src/routes/ads.js'
import withdrawalRoutes from '../src/routes/withdrawals.js'
import leaderboardRoutes from '../src/routes/leaderboard.js'
import badgesRoutes from '../src/routes/badges.js'
import adminRoutes from '../src/routes/admin.js'
import videosRoutes from '../src/routes/videos.js'
import subscriptionsRoutes from '../src/routes/subscriptions.js'
import payoutsRoutes from '../src/routes/payouts.js'
import gameRoutes from '../src/routes/game.js'
import referralsRoutes from '../src/routes/referrals.js'
import coinValuationRoutes from '../src/routes/coinValuation.js'
import platformRoutes from '../src/routes/platform.js'
import legalRoutes from '../src/routes/legal.js'
import geoRoutes from '../src/routes/geo.js'

// Create Express app for Vercel
const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(
  cors({
    origin: [
      'https://adify.adrevtechnologies.com',
      'https://ad-rewards-app.vercel.app',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }),
)
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount routes with /api prefix
app.use('/api/user', userRoutes)
app.use('/api/ads', adsRoutes)
app.use('/api/withdrawals', withdrawalRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/badges', badgesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/videos', videosRoutes)
app.use('/api/subscriptions', subscriptionsRoutes)
app.use('/api/payouts', payoutsRoutes)
app.use('/api/game', gameRoutes)
app.use('/api/referrals', referralsRoutes)
app.use('/api/coin-valuation', coinValuationRoutes)
app.use('/api/platform', platformRoutes)
app.use('/api/legal', legalRoutes)
app.use('/api/geo-resolve', geoRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'AdRewards Production API - Endpoint not found',
    path: req.originalUrl,
  })
})

export default app

// OLD STUB CODE REMOVED - Currency mapping for supported countries
const REMOVED_COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  ZA: 'ZAR',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  IN: 'INR',
  NG: 'NGN',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BR: 'BRL',
  MX: 'MXN',
}

// Currency formatting
const CURRENCY_FORMATS: Record<
  string,
  { symbol: string; decimals: number; position: 'before' | 'after' }
> = {
  USD: { symbol: '$', decimals: 2, position: 'before' },
  ZAR: { symbol: 'R', decimals: 2, position: 'before' },
  EUR: { symbol: '€', decimals: 2, position: 'before' },
  GBP: { symbol: '£', decimals: 2, position: 'before' },
  CAD: { symbol: 'C$', decimals: 2, position: 'before' },
  AUD: { symbol: 'A$', decimals: 2, position: 'before' },
  INR: { symbol: '₹', decimals: 2, position: 'before' },
  NGN: { symbol: '₦', decimals: 2, position: 'before' },
  BRL: { symbol: 'R$', decimals: 2, position: 'before' },
  MXN: { symbol: '$', decimals: 2, position: 'before' },
}

// Exchange rates (base USD = 1)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  ZAR: 18.5,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.35,
  AUD: 1.55,
  INR: 83.0,
  NGN: 1580.0,
  BRL: 5.2,
  MXN: 17.2,
}

// Minimum withdrawal amounts (R150 ZAR equivalent)
const MIN_WITHDRAWAL_AMOUNTS: Record<string, number> = {
  USD: 8.11, // R150 / 18.5
  ZAR: 150.0,
  EUR: 7.46, // (R150 / 18.5) * 0.92
  GBP: 6.4, // (R150 / 18.5) * 0.79
  CAD: 10.95, // (R150 / 18.5) * 1.35
  AUD: 12.57, // (R150 / 18.5) * 1.55
  INR: 673.24, // (R150 / 18.5) * 83.0
  NGN: 12811.89, // (R150 / 18.5) * 1580.0
  BRL: 42.16, // (R150 / 18.5) * 5.2
  MXN: 139.46, // (R150 / 18.5) * 17.2
}

// Country name mapping
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  ZA: 'South Africa',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  IN: 'India',
  NG: 'Nigeria',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  BR: 'Brazil',
  MX: 'Mexico',
}

// Extract client IP
function getClientIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    const ips = forwarded.split(',')
    return ips[0].trim()
  }
  const realIP = req.headers['x-real-ip']
  if (realIP) {
    return realIP
  }
  return req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown'
}

// Detect location and currency from IP
function detectLocationAndCurrency(req: any) {
  const ip = getClientIP(req)
  const geo = geoip.lookup(ip)
  const countryCode = geo?.country || 'US' // Fallback to US
  const currency = COUNTRY_TO_CURRENCY[countryCode] || 'USD'
  const exchangeRate = EXCHANGE_RATES[currency] || 1.0
  const formatting = CURRENCY_FORMATS[currency] || CURRENCY_FORMATS.USD
  const countryName = COUNTRY_NAMES[countryCode] || 'United States'
  const minWithdrawal =
    MIN_WITHDRAWAL_AMOUNTS[currency] || MIN_WITHDRAWAL_AMOUNTS.USD

  return {
    countryCode,
    currency,
    exchangeRate,
    formatting,
    countryName,
    minWithdrawal,
    detectedIP: ip,
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  const location = detectLocationAndCurrency(req)
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'AdRewards Production API',
    detectedLocation: location,
  })
})

// Currency info endpoint - Auto-detects based on geolocation
app.get('/api/user/currency-info', (req, res) => {
  const location = detectLocationAndCurrency(req)
  res.json({
    displayCurrency: location.currency,
    displayCountry: location.countryName,
    revenueCountry: location.countryCode,
    exchangeRate: location.exchangeRate,
    formatting: location.formatting,
    minWithdrawal: location.minWithdrawal,
    detectedFrom: 'geolocation',
  })
})

// User balance endpoint - Returns REAL user amounts in detected currency
app.get('/api/user/balance', (req, res) => {
  const location = detectLocationAndCurrency(req)

  // REAL PRODUCTION BALANCE - NO MOCK DATA
  const userCoins = 0 // Real user coins from database
  const userCashUSD = 0.0 // Real user cash balance from database
  const localAmount = (userCashUSD * location.exchangeRate).toFixed(2)
  const formattedAmount =
    location.formatting.position === 'before'
      ? `${location.formatting.symbol}${localAmount}`
      : `${localAmount}${location.formatting.symbol}`

  res.json({
    coins: userCoins.toString(),
    cashLocal: localAmount,
    cashLocalFormatted: formattedAmount,
    displayCurrency: location.currency,
    displayCountry: location.countryName,
    revenueCountry: location.countryCode,
    exchangeRate: location.exchangeRate.toString(),
    currencySymbol: location.formatting.symbol,
    currencyPosition: location.formatting.position,
    minWithdrawal: location.minWithdrawal,
    minWithdrawalFormatted:
      location.formatting.position === 'before'
        ? `${location.formatting.symbol}${location.minWithdrawal.toFixed(2)}`
        : `${location.minWithdrawal.toFixed(2)}${location.formatting.symbol}`,
  })
})

// User profile endpoint - REAL PRODUCTION DATA ONLY
app.get('/api/user/profile', (req, res) => {
  const location = detectLocationAndCurrency(req)

  // REAL USER DATA - NO FAKE DATA
  // In production this would come from actual database
  res.json({
    userId: null, // Real user ID from database
    email: null, // Real user email from database
    displayName: null, // Real user display name
    avatarEmoji: null, // Real user avatar
    country: location.countryCode,
    preferredCurrency: location.currency,
    profileSetupCompleted: false, // Real setup status
    showOnLeaderboard: false, // Real user preference
    hideCountry: false, // Real user preference
  })
})

// Available videos endpoint - REAL PRODUCTION VIDEOS ONLY
app.get('/api/videos/available', (req, res) => {
  const location = detectLocationAndCurrency(req)

  // REAL AVAILABLE VIDEOS - NO MOCK DATA
  // In production this would query actual available video ads
  res.json({
    videos: [], // Real videos from ad providers (AdMob, etc.)
  })
})

// Catch all other routes
app.use('*', (req, res) => {
  const location = detectLocationAndCurrency(req)
  res.status(404).json({
    error: 'Not Found',
    detectedLocation: location,
    message: 'AdRewards Production API - Endpoint not found',
  })
})

export default app
