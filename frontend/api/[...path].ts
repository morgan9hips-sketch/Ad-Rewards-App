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
      case 'user/currency-info':
        return handleCurrencyInfo(req, res)
      case 'user/balance':
        return handleUserBalance(req, res)
      case 'videos/available':
        return handleVideosAvailable(req, res)
      case 'ads/watch':
        return handleAdsWatch(req, res)
      case 'withdrawals/calculate':
        return handleWithdrawalCalculate(req, res)
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

function handleCurrencyInfo(req: VercelRequest, res: VercelResponse) {
  // Always return South African ZAR currency info
  res.json({
    displayCurrency: 'ZAR',
    revenueCountry: 'ZA',
    displayCountry: 'ZA',
    exchangeRate: 18.5,
    formatting: {
      symbol: 'R',
      decimals: 2,
      position: 'before'
    },
    locationDetected: true,
    locationRequired: false,
    coordinates: {
      lat: req.query.lat || -26.2041,
      lng: req.query.lng || 28.0473
    },
    detectedCountry: 'ZA'
  })
}

function handleUserBalance(req: VercelRequest, res: VercelResponse) {
  // Return balance in ZAR currency
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
    currencyPosition: 'before'
  })
}

function handleAdsWatch(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Mock ad watch completion with ZAR rewards
    res.json({
      success: true,
      reward: {
        coins: 100,
        cashUSD: 0.10,
        cashZAR: 1.85,
        formatted: 'R1.85'
      },
      newBalance: {
        coins: 250,
        cashUSD: 2.35,
        cashZAR: 43.48,
        formatted: 'R43.48'
      }
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

function handleWithdrawalCalculate(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { amount } = req.body
    const exchangeRate = 18.5
    const amountUSD = amount / exchangeRate
    
    res.json({
      amountLocal: amount,
      amountUSD: amountUSD.toFixed(2),
      exchangeRate: exchangeRate,
      currency: 'ZAR',
      symbol: 'R',
      fees: {
        paypalFee: amountUSD * 0.03,
        platformFee: amountUSD * 0.02
      }
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
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
