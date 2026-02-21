import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import { getClientIP } from '../services/geoService.js'
import geoip from 'geoip-lite'

const router = Router()
const prisma = new PrismaClient()

// Default fallback values when geo detection fails
const DEFAULT_COUNTRY_CODE = 'US'
const DEFAULT_COUNTRY_NAME = 'United States'
const DEFAULT_CURRENCY = 'USD'

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

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required.',
        resolved: false,
      })
    }

    // Check if user is already geo-resolved
    let profile = null
    try {
      profile = await prisma.userProfile.findUnique({
        where: { userId: userId },
        select: {
          geoResolved: true,
          countryCode: true,
          countryName: true,
          currencyCode: true,
        },
      })
    } catch (dbError) {
      console.error('❌ DB error during geo-resolve lookup:', dbError instanceof Error ? dbError.message : dbError)
      // Fall through to IP-based detection as fallback
    }

    // If profile doesn't exist, can't geo-resolve against DB — return IP-based fallback
    if (!profile) {
      const clientIP = getClientIP(req)
      let geo = null
      try {
        geo = geoip.lookup(clientIP)
      } catch (geoError) {
        console.error('❌ Geo lookup error:', geoError instanceof Error ? geoError.message : geoError)
      }
      const countryCode = geo?.country || DEFAULT_COUNTRY_CODE
      const currency = COUNTRY_TO_CURRENCY[countryCode] || DEFAULT_CURRENCY
      const countryName = COUNTRY_NAMES[countryCode] || DEFAULT_COUNTRY_NAME

      return res.json({
        country: countryCode,
        countryName,
        currency,
        resolved: true,
        source: 'ip-fallback',
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
    let geo = null
    try {
      geo = geoip.lookup(clientIP)
    } catch (geoError) {
      console.error('❌ Geo lookup failed, using defaults:', geoError instanceof Error ? geoError.message : geoError)
    }

    const countryCode = geo?.country || DEFAULT_COUNTRY_CODE // Default if detection fails
    const currency = COUNTRY_TO_CURRENCY[countryCode] || DEFAULT_CURRENCY
    const countryName = COUNTRY_NAMES[countryCode] || DEFAULT_COUNTRY_NAME

    // Persist to database (first resolution only)
    try {
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
    } catch (updateError) {
      console.error('❌ Failed to persist geo data:', updateError instanceof Error ? updateError.message : updateError)
      // Still return the resolved data even if persistence fails
    }

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
    // Graceful fallback — return defaults rather than crashing
    res.json({ 
      country: DEFAULT_COUNTRY_CODE,
      countryName: DEFAULT_COUNTRY_NAME,
      currency: DEFAULT_CURRENCY,
      resolved: true,
      source: 'error-fallback',
    })
  }
})

export default router
