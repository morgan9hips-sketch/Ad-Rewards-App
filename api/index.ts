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

  // Health check
  if (req.url === '/health' || req.url === '/api/health') {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'AdiFy API is operational',
      currency: 'ZAR',
    })
    return
  }

  // Currency info endpoint
  if (req.url?.includes('currency-info')) {
    res.json({
      displayCurrency: 'ZAR',
      revenueCountry: 'ZA',
      displayCountry: 'ZA',
      exchangeRate: 18.5,
      formatting: {
        symbol: 'R',
        decimals: 2,
        position: 'before',
      },
      locationDetected: true,
      locationRequired: false,
    })
    return
  }

  // User balance endpoint
  if (req.url?.includes('user/balance')) {
    const cashUSD = 2.25
    const exchangeRate = 18.5
    const cashZAR = cashUSD * exchangeRate

    res.json({
      coins: '150',
      cashUsd: cashUSD.toFixed(4),
      cashLocal: cashZAR.toFixed(2),
      cashLocalFormatted: `R${cashZAR.toFixed(2)}`,
      displayCurrency: 'ZAR',
      displayCountry: 'ZA',
      revenueCountry: 'ZA',
      exchangeRate: exchangeRate.toFixed(6),
      currencySymbol: 'R',
      currencyPosition: 'before',
    })
    return
  }

  // User profile endpoint
  if (req.url?.includes('user/profile')) {
    res.json({
      id: 'user-' + Date.now(),
      email: 'user@example.com',
      country: 'ZA',
      preferredCurrency: 'ZAR',
      coinsBalance: 150,
      cashBalance: 2.25,
      displayName: 'South African User',
      avatarEmoji: '🇿🇦',
      showOnLeaderboard: true,
      hideCountry: false,
      profileSetupCompleted: true,
    })
    return
  }

  // Videos available endpoint
  if (req.url?.includes('videos/available')) {
    res.json({
      available: true,
      videos: [
        {
          id: 1,
          title: 'South Africa Tourism Ad',
          duration: 30,
          reward: {
            coins: 100,
            cashUSD: 0.1,
            cashZAR: 1.85,
            formatted: 'R1.85',
          },
          currency: 'ZAR',
          thumbnailUrl: '/images/test-ad.jpg',
        },
        {
          id: 2,
          title: 'Local Business Promotion',
          duration: 15,
          reward: {
            coins: 50,
            cashUSD: 0.05,
            cashZAR: 0.93,
            formatted: 'R0.93',
          },
          currency: 'ZAR',
          thumbnailUrl: '/images/test-ad-2.jpg',
        },
      ],
    })
    return
  }

  // Default response
  res.json({
    message: 'AdiFy API - ZAR Currency System',
    currency: 'ZAR',
    symbol: 'R',
    exchangeRate: 18.5,
    endpoints: [
      '/api/user/currency-info',
      '/api/user/balance',
      '/api/user/profile',
      '/api/videos/available',
      '/api/health',
    ],
  })
}
