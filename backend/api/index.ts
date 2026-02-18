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
app.use('/api/geo-resolve', geoRoutes) // Public

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('API Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.originalUrl,
  })
})

// 404 handler (must be last)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'AdRewards Production API - Endpoint not found',
    path: req.originalUrl,
  })
})

export default app
