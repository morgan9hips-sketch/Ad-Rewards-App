import express from 'express'
import cors from 'cors'

// Create Express app for Vercel
const app = express()

// Middleware
app.use(cors({
  origin: ['https://adify.adrevtechnologies.com', 'https://ad-rewards-app.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'ZAR Currency API is running',
    currency: 'ZAR'
  })
})

// Currency info endpoint - ALWAYS returns ZAR
app.get('/api/user/currency-info', (req, res) => {
  res.json({
    displayCurrency: 'ZAR',
    displayCountry: 'South Africa',
    revenueCountry: 'ZA',
    exchangeRate: 18.5,
    formatting: {
      symbol: 'R',
      decimals: 2,
      position: 'before'
    }
  })
})

// User balance endpoint - Returns ZAR amounts  
app.get('/api/user/balance', (req, res) => {
  res.json({
    coins: '2500',
    cashLocal: '92.50', // R92.50 in ZAR
    cashLocalFormatted: 'R92.50',
    displayCurrency: 'ZAR',
    displayCountry: 'South Africa',
    revenueCountry: 'ZA',
    exchangeRate: '18.500000',
    currencySymbol: 'R',
    currencyPosition: 'before'
  })
})

// User profile endpoint
app.get('/api/user/profile', (req, res) => {
  res.json({
    userId: 'mock-user-123',
    email: 'user@example.com',
    displayName: 'User',
    avatarEmoji: '🎮',
    country: 'ZA',
    preferredCurrency: 'ZAR',
    profileSetupCompleted: true,
    showOnLeaderboard: true,
    hideCountry: false
  })
})

// Available videos endpoint
app.get('/api/videos/available', (req, res) => {
  res.json({
    videos: [
      {
        id: 'vid1',
        title: 'Sample Video 1',
        rewardCoins: 50,
        rewardCashZAR: '0.93', // R0.93 in ZAR
        formattedReward: 'R0.93'
      },
      {
        id: 'vid2', 
        title: 'Sample Video 2',
        rewardCoins: 75,
        rewardCashZAR: '1.39', // R1.39 in ZAR
        formattedReward: 'R1.39'
      }
    ]
  })
})

// Catch all other routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    currency: 'ZAR',
    message: 'This API uses ZAR currency only'
  })
})

export default app
