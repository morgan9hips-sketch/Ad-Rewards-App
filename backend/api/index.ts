import express from 'express'
import cors from 'cors'
import geoip from 'geoip-lite'

// Create Express app for Vercel
const app = express()

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

// Currency mapping for supported countries
const COUNTRY_TO_CURRENCY: Record<string, string> = {
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

  return {
    countryCode,
    currency,
    exchangeRate,
    formatting,
    countryName,
    detectedIP: ip,
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  const location = detectLocationAndCurrency(req)
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Geolocation-based Currency API is running',
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
    detectedFrom: 'geolocation',
  })
})

// User balance endpoint - Returns amounts in detected currency
app.get('/api/user/balance', (req, res) => {
  const location = detectLocationAndCurrency(req)
  const baseAmount = 5.0 // Base amount in USD
  const localAmount = (baseAmount * location.exchangeRate).toFixed(2)
  const formattedAmount =
    location.formatting.position === 'before'
      ? `${location.formatting.symbol}${localAmount}`
      : `${localAmount}${location.formatting.symbol}`

  res.json({
    coins: '2500',
    cashLocal: localAmount,
    cashLocalFormatted: formattedAmount,
    displayCurrency: location.currency,
    displayCountry: location.countryName,
    revenueCountry: location.countryCode,
    exchangeRate: location.exchangeRate.toString(),
    currencySymbol: location.formatting.symbol,
    currencyPosition: location.formatting.position,
  })
})

// User profile endpoint
app.get('/api/user/profile', (req, res) => {
  const location = detectLocationAndCurrency(req)
  res.json({
    userId: 'mock-user-123',
    email: 'user@example.com',
    displayName: 'User',
    avatarEmoji: '🎮',
    country: location.countryCode,
    preferredCurrency: location.currency,
    profileSetupCompleted: true,
    showOnLeaderboard: true,
    hideCountry: false,
  })
})

// Available videos endpoint
app.get('/api/videos/available', (req, res) => {
  const location = detectLocationAndCurrency(req)
  const baseReward1 = 0.05 // Base reward in USD
  const baseReward2 = 0.075 // Base reward in USD

  const reward1 = (baseReward1 * location.exchangeRate).toFixed(2)
  const reward2 = (baseReward2 * location.exchangeRate).toFixed(2)

  const formatted1 =
    location.formatting.position === 'before'
      ? `${location.formatting.symbol}${reward1}`
      : `${reward1}${location.formatting.symbol}`
  const formatted2 =
    location.formatting.position === 'before'
      ? `${location.formatting.symbol}${reward2}`
      : `${reward2}${location.formatting.symbol}`

  res.json({
    videos: [
      {
        id: 'vid1',
        title: 'Sample Video 1',
        rewardCoins: 50,
        rewardCashLocal: reward1,
        formattedReward: formatted1,
      },
      {
        id: 'vid2',
        title: 'Sample Video 2',
        rewardCoins: 75,
        rewardCashLocal: reward2,
        formattedReward: formatted2,
      },
    ],
  })
})

// Catch all other routes
app.use('*', (req, res) => {
  const location = detectLocationAndCurrency(req)
  res.status(404).json({
    error: 'Not Found',
    detectedLocation: location,
    message: 'API with automatic geolocation currency detection',
  })
})

export default app
