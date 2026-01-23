import { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { path } = req.query

  // Route to different endpoints based on path
  if (Array.isArray(path)) {
    const fullPath = path.join('/')

    switch (fullPath) {
      case 'user/profile':
        return handleUserProfile(req, res)
      case 'videos/available':
        return handleVideosAvailable(req, res)
      default:
        return res.status(404).json({ error: 'Endpoint not found' })
    }
  }

  res.status(404).json({ error: 'Invalid path' })
}

function handleUserProfile(req: VercelRequest, res: VercelResponse) {
  // Return mock user profile with ZAR currency
  res.json({
    id: 'user-' + Date.now(),
    email: 'user@example.com',
    country: 'ZA',
    preferredCurrency: 'ZAR',
    coinsBalance: 150,
    cashBalance: 2.25,
    displayName: 'Test User',
    avatarEmoji: '🚀',
    showOnLeaderboard: true,
    hideCountry: false,
  })
}

function handleVideosAvailable(req: VercelRequest, res: VercelResponse) {
  // Return available videos with ZAR currency
  res.json({
    available: true,
    videos: [
      {
        id: 1,
        title: 'Test Ad Video',
        duration: 30,
        reward: 100,
        currency: 'ZAR',
        thumbnailUrl: '/images/test-ad.jpg',
      },
      {
        id: 2,
        title: 'Another Test Ad',
        duration: 15,
        reward: 50,
        currency: 'ZAR',
        thumbnailUrl: '/images/test-ad-2.jpg',
      },
    ],
  })
}
