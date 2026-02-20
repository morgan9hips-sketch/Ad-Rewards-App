import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getClientIP } from '../services/geoService.js'
import geoip from 'geoip-lite'

const router = Router()
const prisma = new PrismaClient()

// Static country to currency mapping (as specified in requirements)
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  ZA: 'ZAR',
  // Additional mappings for broader coverage
  CA: 'CAD',
  AU: 'AUD',
  IN: 'INR',
  NG: 'NGN',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BR: 'BRL',
  MX: 'MXN',
}

// Country code to country name mapping
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  ZA: 'South Africa',
  CA: 'Canada',
  AU: 'Australia',
  IN: 'India',
  NG: 'Nigeria',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  BR: 'Brazil',
  MX: 'Mexico',
}

/**
 * POST /api/geo/resolve
 * 
 * Idempotent geo-resolution endpoint.
 * Assigns country + currency to user on first call.
 * Subsequent calls return stored data.
 */
router.post('/resolve', async (req: any, res) => {
  try {
    const userId = req.user?.id || req.body?.userId

    // Check if user is already geo-resolved
    const profile = await prisma.userProfile.findUnique({
      where: { userId: userId },
      select: {
        geoResolved: true,
        countryCode: true,
        countryName: true,
        currencyCode: true,
      },
    })

    // If profile doesn't exist, can't geo-resolve
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found. Please sign in first.',
        resolved: false,
      })
    }

    // If already resolved, return stored data immediately (idempotent)
    if (profile.geoResolved) {
      return res.json({
        country: profile.countryCode,
        countryName: profile.countryName,
        currency: profile.currencyCode,
        resolved: true,
      })
    }

    // Extract client IP from headers
    const clientIP = getClientIP(req)

    // Perform geo lookup using geoip-lite (IP-based, no browser APIs)
    const geo = geoip.lookup(clientIP)
    const countryCode = geo?.country || 'US' // Default to US if detection fails
    const currency = COUNTRY_TO_CURRENCY[countryCode] || 'USD'
    const countryName = COUNTRY_NAMES[countryCode] || 'United States'

    // Persist to database (first resolution only)
    await prisma.userProfile.update({
      where: { userId: userId },
      data: {
        countryCode,
        countryName,
        currencyCode: currency,
        ipAddress: clientIP,
        geoResolved: true,
        geoSource: 'geoip-lite',
        geoResolvedAt: new Date(),
      },
    })

    // Return resolution result
    res.json({
      country: countryCode,
      countryName,
      currency,
      resolved: true,
    })
  } catch (error) {
    console.error('❌ Error resolving geo:', error instanceof Error ? error.message : error)
    if (error instanceof Error) console.error('Stack:', error.stack)
    res.status(500).json({ 
      error: 'Failed to resolve geo location',
      details: error instanceof Error ? error.message : 'Unknown error',
      resolved: false,
    })
  }
})

export default router
