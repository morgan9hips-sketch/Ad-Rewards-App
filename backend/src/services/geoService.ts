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
 * Detect country from coordinates using reverse geocoding
 * This is a basic implementation - in production you might use a service like Google Maps API
 */
export function detectCountryFromCoordinates(
  lat: number,
  lng: number,
): string | null {
  try {
    // Simple coordinate-to-country mapping for major regions
    // This is a basic implementation - for production use a proper reverse geocoding service

    // South Africa
    if (lat >= -35 && lat <= -22 && lng >= 16 && lng <= 33) {
      return 'ZA'
    }
    // United States
    if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) {
      return 'US'
    }
    // United Kingdom
    if (lat >= 49.5 && lat <= 61 && lng >= -8 && lng <= 2) {
      return 'GB'
    }
    // Canada
    if (lat >= 41 && lat <= 84 && lng >= -141 && lng <= -52) {
      return 'CA'
    }
    // Australia
    if (lat >= -44 && lat <= -10 && lng >= 113 && lng <= 154) {
      return 'AU'
    }
    // Germany
    if (lat >= 47 && lat <= 55 && lng >= 5 && lng <= 15) {
      return 'DE'
    }
    // France
    if (lat >= 41 && lat <= 51 && lng >= -5 && lng <= 10) {
      return 'FR'
    }
    // Nigeria
    if (lat >= 4 && lat <= 14 && lng >= 3 && lng <= 15) {
      return 'NG'
    }
    // Brazil
    if (lat >= -34 && lat <= 6 && lng >= -74 && lng <= -34) {
      return 'BR'
    }
    // India
    if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
      return 'IN'
    }

    // Default to null if no match
    return null
  } catch (error) {
    console.error('Error detecting country from coordinates:', error)
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
 * Get user location info from coordinates
 */
export function getUserLocationInfoFromCoordinates(
  lat: number,
  lng: number,
): {
  countryCode: string | null
  currency: string
} {
  const countryCode = detectCountryFromCoordinates(lat, lng)
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
