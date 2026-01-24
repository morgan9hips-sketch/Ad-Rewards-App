import { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'AdiFy Backend API is operational',
    environment: process.env.NODE_ENV || 'development',
    currency: 'ZAR',
    database: process.env.DATABASE_URL ? 'connected' : 'missing'
  })
}
