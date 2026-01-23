import { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors({
  origin: true,
  credentials: true,
}))

app.use(express.json())

// Health check  
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Ad Rewards API Gateway'
  })
})

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  })
})

// Test user endpoint - return ZAR currency
app.get('/api/user/profile', async (req, res) => {
  try {
    // Mock user profile for testing with ZAR currency
    res.json({
      id: 'test-user',
      email: 'test@example.com', 
      country: 'ZA',
      preferredCurrency: 'ZAR',
      coinsBalance: 100,
      cashBalance: 1.50,
      displayName: 'Test User'
    })
  } catch (error) {
    res.status(500).json({ error: 'Profile fetch failed' })
  }
})

// Test ads endpoint
app.get('/api/videos/available', (req, res) => {
  res.json({
    available: true,
    videos: [
      { 
        id: 1, 
        title: 'Test Ad Video', 
        duration: 30, 
        reward: 100,
        currency: 'ZAR'
      }
    ],
  })
})

// Export as Vercel function
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res)
}
