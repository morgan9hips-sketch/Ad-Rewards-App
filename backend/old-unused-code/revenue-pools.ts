import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { revenuePoolService } from '../services/revenuePoolService.js'

const router = Router()

// Get all revenue pool statistics (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const analytics = await revenuePoolService.getRevenueAnalytics()
    res.json(analytics)
  } catch (error) {
    console.error('Error fetching revenue analytics:', error)
    res.status(500).json({ error: 'Failed to fetch revenue analytics' })
  }
})

// Get specific country revenue pool (Admin only)
router.get('/:countryCode', requireAdmin, async (req, res) => {
  try {
    const { countryCode } = req.params
    const stats = await revenuePoolService.getPoolStats(
      countryCode.toUpperCase()
    )

    if (!stats) {
      return res
        .status(404)
        .json({ error: 'Revenue pool not found for country' })
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching country revenue pool:', error)
    res.status(500).json({ error: 'Failed to fetch country revenue pool' })
  }
})

// Initialize revenue pools (Admin only)
router.post('/initialize', requireAdmin, async (req, res) => {
  try {
    await revenuePoolService.initializeRevenuePools()
    res.json({
      success: true,
      message: 'Revenue pools initialized successfully',
    })
  } catch (error) {
    console.error('Error initializing revenue pools:', error)
    res.status(500).json({ error: 'Failed to initialize revenue pools' })
  }
})

// Update exchange rates (Admin only)
router.post('/update-rates', requireAdmin, async (req, res) => {
  try {
    await revenuePoolService.updateExchangeRates()
    res.json({
      success: true,
      message: 'Exchange rates updated successfully',
    })
  } catch (error) {
    console.error('Error updating exchange rates:', error)
    res.status(500).json({ error: 'Failed to update exchange rates' })
  }
})

export default router
