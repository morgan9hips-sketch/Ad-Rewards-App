import { Router } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { getLatestCoinValuation } from '../services/coinValuationService.js'

const router = Router()

/**
 * GET /api/coin-valuation
 * Get current user's regional coin valuation
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    // Get user's revenue country (or default to US)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const user = await prisma.userProfile.findUnique({
      where: { userId },
      select: { revenueCountry: true, countryCode: true },
    })

    const countryCode = user?.revenueCountry || user?.countryCode || 'US'

    // Get latest valuation
    const valuation = await getLatestCoinValuation(countryCode)

    if (!valuation) {
      return res.status(404).json({
        success: false,
        error: 'Valuation not available for your region',
      })
    }

    res.json({
      success: true,
      valuePer100Coins: valuation.valuePer100Coins,
      currencyCode: valuation.currencyCode,
      currencySymbol: valuation.currencySymbol,
      trend: valuation.trend,
      changePercent: valuation.changePercent,
      lastUpdated: valuation.lastUpdated,
    })
  } catch (error: any) {
    console.error('Error getting coin valuation:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get coin valuation',
    })
  }
})

export default router
