import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

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
  app.listen(Number(PORT), () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)

    // Start balance expiry cron job
    // NOTE: This will not run in Vercel's serverless environment
    // For Vercel, you'll need to create a separate Vercel Cron Job endpoint
    scheduleExpiryJob()
    
    // Start coin valuation update job (every 6 hours)
    scheduleCoinValuationJob()
  })
}

export default app
