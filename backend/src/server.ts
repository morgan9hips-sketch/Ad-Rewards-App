import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { authenticate } from './middleware/auth.js'
import { scheduleExpiryJob } from './jobs/expireBalances.js'
import { scheduleCoinValuationJob } from './jobs/updateCoinValuations.js'

// Import routes
import userRoutes from './routes/user.js'
import adsRoutes from './routes/ads.js'
import withdrawalRoutes from './routes/withdrawals.js'
import leaderboardRoutes from './routes/leaderboard.js'
import badgesRoutes from './routes/badges.js'
import adminRoutes from './routes/admin.js'
import videosRoutes from './routes/videos.js'
import subscriptionsRoutes from './routes/subscriptions.js'
import payoutsRoutes from './routes/payouts.js'
import gameRoutes from './routes/game.js'
import referralsRoutes from './routes/referrals.js'
import coinValuationRoutes from './routes/coinValuation.js'
import platformRoutes from './routes/platform.js'
import legalRoutes from './routes/legal.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const prisma = new PrismaClient()

// Exchange rate defaults (can be overridden via environment variables)
const USD_TO_ZAR_RATE = parseFloat(process.env.USD_TO_ZAR_RATE || '18.50')
const ZAR_TO_USD_RATE = parseFloat(process.env.ZAR_TO_USD_RATE || '0.054')

// Initialize exchange rates on startup
async function initializeExchangeRates() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.exchangeRate.upsert({
      where: {
        targetCurrency_date: {
          targetCurrency: 'ZAR',
          date: today,
        },
      },
      update: {
        rate: USD_TO_ZAR_RATE,
      },
      create: {
        baseCurrency: 'USD',
        targetCurrency: 'ZAR',
        rate: USD_TO_ZAR_RATE,
        date: today,
      },
    })

    await prisma.exchangeRate.upsert({
      where: {
        targetCurrency_date: {
          targetCurrency: 'USD',
          date: today,
        },
      },
      update: {
        rate: ZAR_TO_USD_RATE,
      },
      create: {
        baseCurrency: 'ZAR',
        targetCurrency: 'USD',
        rate: ZAR_TO_USD_RATE,
        date: today,
      },
    })

    console.log('✅ Exchange rates initialized')
  } catch (error) {
    console.error('⚠️  Warning: Failed to initialize exchange rates:', error)
  }
}

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())

// Health check - both root and /health for different deployment scenarios
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Ad Rewards API is running',
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public routes
app.use('/leaderboard', leaderboardRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/subscriptions/webhook', subscriptionsRoutes) // Webhook should be public
app.use('/api/subscriptions/webhook', subscriptionsRoutes) // Webhook should be public
app.use('/legal', legalRoutes) // Legal documents are public
app.use('/api/legal', legalRoutes) // Legal documents are public

// Protected routes
app.use('/user', authenticate, userRoutes)
app.use('/api/user', authenticate, userRoutes)
app.use('/ads', authenticate, adsRoutes)
app.use('/api/ads', authenticate, adsRoutes)
app.use('/withdrawals', authenticate, withdrawalRoutes)
app.use('/api/withdrawals', authenticate, withdrawalRoutes)
app.use('/badges', authenticate, badgesRoutes)
app.use('/api/badges', authenticate, badgesRoutes)
app.use('/admin', authenticate, adminRoutes)
app.use('/api/admin', authenticate, adminRoutes)
app.use('/videos', authenticate, videosRoutes)
app.use('/api/videos', authenticate, videosRoutes)
app.use('/subscriptions', authenticate, subscriptionsRoutes)
app.use('/api/subscriptions', authenticate, subscriptionsRoutes)
app.use('/payouts', authenticate, payoutsRoutes)
app.use('/api/payouts', authenticate, payoutsRoutes)
app.use('/game', authenticate, gameRoutes)
app.use('/api/game', authenticate, gameRoutes)
app.use('/referrals', authenticate, referralsRoutes)
app.use('/api/referrals', authenticate, referralsRoutes)
app.use('/coin-valuation', authenticate, coinValuationRoutes)
app.use('/api/coin-valuation', authenticate, coinValuationRoutes)
app.use('/platform', authenticate, platformRoutes)
app.use('/api/platform', authenticate, platformRoutes)

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    })
  },
)

// Only start server if not in Vercel (Vercel handles this automatically)
if (process.env.VERCEL !== '1') {
  app.listen(Number(PORT), async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)

    // Initialize exchange rates on startup
    await initializeExchangeRates()

    // Start balance expiry cron job
    // NOTE: This will not run in Vercel's serverless environment
    // For Vercel, you'll need to create a separate Vercel Cron Job endpoint
    scheduleExpiryJob()
    
    // Start coin valuation update job (every 6 hours)
    scheduleCoinValuationJob()
  })
} else {
  // Initialize exchange rates for serverless environments on first request
  // Note: This is called asynchronously on module load to avoid blocking
  // Exchange rate queries should handle the case where rates may not be available yet
  initializeExchangeRates().catch(err => {
    console.error('Failed to initialize exchange rates:', err)
  })
}

export default app
