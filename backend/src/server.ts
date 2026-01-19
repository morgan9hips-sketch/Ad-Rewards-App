import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authenticate } from './middleware/auth.js'
import { scheduleExpiryJob } from './jobs/expireBalances.js'

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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

app.listen(Number(PORT), () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  
  // Start balance expiry cron job
  scheduleExpiryJob()
})
