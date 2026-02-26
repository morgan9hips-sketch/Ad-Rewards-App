import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../src/middleware/auth.js'
import { errorLogger } from '../src/middleware/errorLogger.js'
import { securityHeaders, xssSanitize } from '../src/middleware/xss.js'
import { sanitizeBody } from '../src/middleware/validation.js'
import { ipRateLimiter } from '../src/middleware/rateLimiter.js'

// Fix BigInt JSON serialization
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

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
import migrateRoutes from '../src/routes/migrate.js'
import rewardRoutes from '../src/routes/reward.js'

// Create Express app for Vercel
const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(
  cors({
    origin: [
      'https://adify.adrevtechnologies.com',
      'https://ad-rewards-app.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-CSRF-Token'],
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(securityHeaders)
app.use(xssSanitize)
app.use(sanitizeBody)
app.use(ipRateLimiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount routes with /api prefix (with authentication where needed)
app.use('/api/user', authenticate, userRoutes)
app.use('/api/ads', authenticate, adsRoutes)
app.use('/api/withdrawals', authenticate, withdrawalRoutes)
app.use('/api/leaderboard', leaderboardRoutes) // Public
app.use('/api/badges', authenticate, badgesRoutes)
app.use('/api/admin', authenticate, adminRoutes)
app.use('/api/videos', authenticate, videosRoutes)
app.use('/api/subscriptions', authenticate, subscriptionsRoutes)
app.use('/api/payouts', authenticate, payoutsRoutes)
app.use('/api/game', authenticate, gameRoutes)
app.use('/api/referrals', referralsRoutes) // Has public routes, uses middleware internally
app.use('/api/coin-valuation', authenticate, coinValuationRoutes)
app.use('/api/platform', platformRoutes) // Public
app.use('/api/legal', legalRoutes) // Public
app.use('/api/geo-resolve', authenticate, geoRoutes) // Requires auth for user context
app.use('/api/migrate', migrateRoutes) // One-time migration endpoint
app.use('/api/reward', authenticate, rewardRoutes)

// Error handling middleware (must be last)
app.use(errorLogger)

// 404 handler (must be last)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'AdRewards Production API - Endpoint not found',
    path: req.originalUrl,
  })
})

export default app