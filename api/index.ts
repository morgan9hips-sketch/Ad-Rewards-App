import { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Test endpoint for ads
app.get('/api/videos/available', (req, res) => {
  res.json({ 
    available: true, 
    videos: [
      { id: 1, title: 'Test Ad', duration: 30, reward: 100 }
    ]
  })
})

// Export for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res)
}