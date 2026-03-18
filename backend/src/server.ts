import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authenticate } from './middleware/auth.js'
import { updateExchangeRates } from './services/currencyService.js'

// Fix BigInt JSON serialization
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

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
import geoRoutes from './routes/geo.js'
import minigameRoutes from './routes/minigame.js'
import v2Routes from './routes/v2/index.js'
import cpxCallbackRoutes from './routes/cpxCallback.js'
import cpxOfferRoutes from './routes/cpxOffer.js'
import bitlabsCallbackRoutes from './routes/bitlabsCallback.js'
import theoremreachCallbackRoutes from './routes/theoremreachCallback.js'
import tasksRoutes from './routes/tasks.js'
import activityRoutes from './routes/activity.js'

dotenv.config()

updateExchangeRates().catch((err) =>
  console.error('[FX] Startup refresh failed:', err),
)
setInterval(
  () => {
    updateExchangeRates().catch((err) =>
      console.error('[FX] Scheduled refresh failed:', err),
    )
  },
  24 * 60 * 60 * 1000,
)

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://adify.adrevtechnologies.com',
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
app.use('/cpx-callback', cpxCallbackRoutes)
app.use('/bitlabs-callback', bitlabsCallbackRoutes)
app.use('/api/bitlabs', bitlabsCallbackRoutes)
app.use('/api/theoremreach', theoremreachCallbackRoutes)
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
app.use('/tasks', authenticate, tasksRoutes)
app.use('/api/tasks', authenticate, tasksRoutes)
app.use('/activity', authenticate, activityRoutes)
app.use('/api/activity', authenticate, activityRoutes)
app.use('/geo', authenticate, geoRoutes)
app.use('/api/geo', authenticate, geoRoutes)
app.use('/minigame', authenticate, minigameRoutes)
app.use('/api/minigame', authenticate, minigameRoutes)
app.use('/cpx', authenticate, cpxOfferRoutes)
app.use('/api/cpx', authenticate, cpxOfferRoutes)

// V2 API namespace (with feature flag)
app.use('/api/v2', v2Routes)

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
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

export default app
