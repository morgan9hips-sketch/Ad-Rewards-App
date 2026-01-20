import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authenticate } from './middleware/auth'
import { scheduleExpiryJob } from './jobs/expireBalances'

// Import routes
import userRoutes from './routes/user'
import adsRoutes from './routes/ads'
import withdrawalRoutes from './routes/withdrawals'
import leaderboardRoutes from './routes/leaderboard'
import badgesRoutes from './routes/badges'
import adminRoutes from './routes/admin'
import videosRoutes from './routes/videos'
import subscriptionsRoutes from './routes/subscriptions'
import payoutsRoutes from './routes/payouts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://192.168.1.61:4000',
      'capacitor://localhost',
      'http://localhost',
    ],
    credentials: true,
  }),
)
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public routes
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/subscriptions/webhook', subscriptionsRoutes) // Webhook should be public

// Protected routes
app.use('/api/user', authenticate, userRoutes)
app.use('/api/ads', authenticate, adsRoutes)
app.use('/api/withdrawals', authenticate, withdrawalRoutes)
app.use('/api/badges', authenticate, badgesRoutes)
app.use('/api/admin', authenticate, adminRoutes)
app.use('/api/videos', authenticate, videosRoutes)
app.use('/api/subscriptions', authenticate, subscriptionsRoutes)
app.use('/api/payouts', authenticate, payoutsRoutes)

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
  })
}

export default app
