import geoip from 'geoip-lite'
import { getCurrencyForCountry } from './currencyService.js'

/**
 * Detect country from IP address
 */
export function detectCountryFromIP(ipAddress: string): string | null {
  try {
    const geo = geoip.lookup(ipAddress)
    return geo?.country || null
  } catch (error) {
    console.error('Error detecting country from IP:', error)
    return null
  }
}

/**
 * Get user location info from IP
 */
export function getUserLocationInfo(ipAddress: string): {
  countryCode: string | null
  currency: string
} {
  const countryCode = detectCountryFromIP(ipAddress)
  const currency = countryCode ? getCurrencyForCountry(countryCode) : 'USD'
  
  return {
    countryCode,
    currency,
  }
}

/**
 * Extract IP address from request
 * Handles proxy headers (X-Forwarded-For, X-Real-IP)
 */
export function getClientIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    const ips = forwarded.split(',')
    return ips[0].trim()
  }
  
  const realIP = req.headers['x-real-ip']
  if (realIP) {
    return realIP
  }
  
  return req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown'
}
