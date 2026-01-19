import geoip from 'geoip-lite'
import fetch from 'node-fetch'
import { Request } from 'express'

// Supported countries and their currencies
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  ZA: 'ZAR', // South Africa - Rand (no USD allowed)
  US: 'USD', // United States - Dollar
  CA: 'CAD', // Canada - Dollar
  GB: 'GBP', // United Kingdom - Pound
  AU: 'AUD', // Australia - Dollar
  DE: 'EUR', // Germany - Euro
  FR: 'EUR', // France - Euro
  ES: 'EUR', // Spain - Euro
  IT: 'EUR', // Italy - Euro
  NL: 'EUR', // Netherlands - Euro
  JP: 'JPY', // Japan - Yen
  CH: 'CHF', // Switzerland - Franc
  SE: 'SEK', // Sweden - Krona
}

// Countries where USD is strictly prohibited (AdMob compliance)
const USD_PROHIBITED_COUNTRIES = ['ZA'] // South Africa

// VPN/Proxy detection indicators
const SUSPICIOUS_INDICATORS = [
  'tor-exit',
  'proxy',
  'vpn',
  'anonymizer',
  'datacenter',
  'hosting',
]

export interface LocationData {
  country: string
  countryName: string
  currency: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
  timezone?: string
  isVPN: boolean
  isSuspicious: boolean
  confidence: number
  ipAddress: string
}

class LocationService {
  private vpnApiKey?: string

  constructor() {
    this.vpnApiKey = process.env.VPN_DETECTION_API_KEY
  }

  /**
   * Get real IP address from request (handles proxies and load balancers)
   */
  private getRealIP(req: Request): string {
    return (
      (req.headers['cf-connecting-ip'] as string) || // Cloudflare
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] || // Proxy
      (req.headers['x-real-ip'] as string) || // Nginx
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '127.0.0.1'
    )
  }

  /**
   * Detect VPN/Proxy using multiple methods
   */
  private async detectVPN(
    ip: string
  ): Promise<{ isVPN: boolean; confidence: number }> {
    try {
      // Method 1: Check against known VPN/hosting ranges in geoip data
      const geo = geoip.lookup(ip)
      if (!geo) {
        return { isVPN: false, confidence: 0.1 } // No data = low confidence
      }

      let vpnScore = 0
      let confidence = 0.5

      // Method 2: ASN-based detection (hosting providers often indicate VPN)
      if (
        geo.region &&
        SUSPICIOUS_INDICATORS.some((indicator) =>
          geo.region.toLowerCase().includes(indicator)
        )
      ) {
        vpnScore += 0.4
      }

      // Method 3: External VPN detection API (if available)
      if (this.vpnApiKey) {
        try {
          const response = await fetch(
            `https://vpnapi.io/api/${ip}?key=${this.vpnApiKey}`,
            { timeout: 3000 }
          )
          const data = await response.json()

          if (
            data.security?.vpn ||
            data.security?.proxy ||
            data.security?.tor
          ) {
            vpnScore += 0.6
            confidence = 0.9
          }
        } catch (error) {
          console.warn('VPN detection API failed:', error)
        }
      }

      // Method 4: IP range analysis (common hosting/VPN ranges)
      const ipParts = ip.split('.').map(Number)
      const isPrivate =
        ipParts[0] === 10 ||
        (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) ||
        (ipParts[0] === 192 && ipParts[1] === 168)

      if (isPrivate) {
        vpnScore += 0.3
      }

      return {
        isVPN: vpnScore > 0.5,
        confidence: Math.min(confidence + vpnScore * 0.2, 1.0),
      }
    } catch (error) {
      console.error('VPN detection failed:', error)
      return { isVPN: false, confidence: 0.1 }
    }
  }

  /**
   * Get comprehensive location data with VPN detection
   */
  async getLocationData(req: Request): Promise<LocationData> {
    const ip = this.getRealIP(req)
    const geo = geoip.lookup(ip)

    // Detect VPN/Proxy
    const vpnDetection = await this.detectVPN(ip)

    // Default to South Africa if no geo data (conservative approach for AdMob compliance)
    const country = geo?.country || 'ZA'
    const countryName = this.getCountryName(country)
    const currency = this.getCurrencyForCountry(country)

    // Additional suspicious activity detection
    const userAgent = req.headers['user-agent'] || ''
    const isSuspicious =
      vpnDetection.isVPN ||
      !userAgent ||
      userAgent.length < 20 || // Too short user agent
      userAgent.includes('bot') ||
      userAgent.includes('crawler')

    // Confidence calculation
    let confidence = vpnDetection.confidence
    if (!geo) confidence *= 0.3 // No geo data reduces confidence
    if (isSuspicious) confidence *= 0.5 // Suspicious activity reduces confidence

    return {
      country,
      countryName,
      currency,
      city: geo?.city,
      region: geo?.region,
      latitude: geo?.ll?.[0],
      longitude: geo?.ll?.[1],
      timezone: geo?.timezone,
      isVPN: vpnDetection.isVPN,
      isSuspicious,
      confidence: Math.max(confidence, 0.1), // Minimum 10% confidence
      ipAddress: ip,
    }
  }

  /**
   * Validate if user can use USD currency (AdMob compliance)
   */
  canUseUSD(country: string): boolean {
    return !USD_PROHIBITED_COUNTRIES.includes(country.toUpperCase())
  }

  /**
   * Get currency for country (strict mapping)
   */
  getCurrencyForCountry(country: string): string {
    return COUNTRY_CURRENCY_MAP[country.toUpperCase()] || 'ZAR' // Default to ZAR for safety
  }

  /**
   * Validate location data meets minimum requirements
   */
  isLocationValid(locationData: LocationData): boolean {
    return (
      !locationData.isVPN &&
      !locationData.isSuspicious &&
      locationData.confidence > 0.6 && // Minimum 60% confidence
      locationData.country in COUNTRY_CURRENCY_MAP
    )
  }

  /**
   * Get human-readable country name
   */
  private getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
      ZA: 'South Africa',
      US: 'United States',
      CA: 'Canada',
      GB: 'United Kingdom',
      AU: 'Australia',
      DE: 'Germany',
      FR: 'France',
      ES: 'Spain',
      IT: 'Italy',
      NL: 'Netherlands',
      JP: 'Japan',
      CH: 'Switzerland',
      SE: 'Sweden',
    }

    return countryNames[countryCode.toUpperCase()] || 'Unknown Country'
  }

  /**
   * Log suspicious activity for monitoring
   */
  async logSuspiciousActivity(
    locationData: LocationData,
    userId: string,
    action: string
  ): Promise<void> {
    if (locationData.isSuspicious || locationData.isVPN) {
      console.warn('🚨 SUSPICIOUS ACTIVITY DETECTED:', {
        userId,
        action,
        ip: locationData.ipAddress,
        country: locationData.country,
        isVPN: locationData.isVPN,
        confidence: locationData.confidence,
        timestamp: new Date().toISOString(),
      })

      // Store in database security_logs table for monitoring
      try {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()

        await prisma.securityLog.create({
          data: {
            userId,
            ipAddress: locationData.ipAddress,
            action,
            country: locationData.country,
            currency: this.getCurrencyForCountry(locationData.country),
            isVPN: locationData.isVPN,
            confidence: locationData.confidence,
            suspicious: locationData.isSuspicious,
            details: {
              city: locationData.city,
              region: locationData.region,
              timezone: locationData.timezone,
              userAgent: '', // Will be added from request if needed
            },
          },
        })

        await prisma.$disconnect()
      } catch (error) {
        console.error('Failed to log security event:', error)
      }
    }
  }
}

export const locationService = new LocationService()
