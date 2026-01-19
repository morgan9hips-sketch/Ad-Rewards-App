import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from './auth.js'
import { locationService, LocationData } from '../services/locationService.js'

const prisma = new PrismaClient()

// Extend AuthRequest to include location data
export interface LocationAuthRequest extends AuthRequest {
  location?: LocationData
  isLocationValid?: boolean
}

/**
 * Location verification middleware - CRITICAL for AdMob compliance
 * This middleware must run on every request that involves money/ads
 */
export const locationVerification = async (
  req: LocationAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get comprehensive location data
    const locationData = await locationService.getLocationData(req)
    req.location = locationData

    // Check if location is valid (not VPN, high confidence)
    req.isLocationValid = locationService.isLocationValid(locationData)

    // Log suspicious activity if detected
    if (req.user?.id) {
      await locationService.logSuspiciousActivity(
        locationData,
        req.user.id,
        `${req.method} ${req.path}`
      )
    }

    // For ad watching and withdrawals, enforce strict location requirements
    const isMonetaryAction =
      req.path.includes('/ads/') ||
      req.path.includes('/withdraw') ||
      req.path.includes('/coins/award') ||
      req.path.includes('/conversions')

    if (isMonetaryAction && !req.isLocationValid) {
      return res.status(403).json({
        error: 'Access denied',
        message:
          'Location verification failed. VPN/Proxy usage is not permitted.',
        code: 'LOCATION_VERIFICATION_FAILED',
        details: {
          country: locationData.country,
          confidence: locationData.confidence,
          isVPN: locationData.isVPN,
        },
      })
    }

    next()
  } catch (error) {
    console.error('Location verification error:', error)

    // In case of service failure, deny access to monetary actions for safety
    const isMonetaryAction =
      req.path.includes('/ads/') ||
      req.path.includes('/withdraw') ||
      req.path.includes('/coins/award')

    if (isMonetaryAction) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Location verification service is currently unavailable.',
        code: 'LOCATION_SERVICE_ERROR',
      })
    }

    next() // Allow non-monetary actions to proceed
  }
}

/**
 * Enforce currency restrictions based on location
 */
export const currencyEnforcement = async (
  req: LocationAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id || !req.location) {
      return next()
    }

    const userId = req.user.id
    const userCountry = req.location.country
    const requiredCurrency = locationService.getCurrencyForCountry(userCountry)

    // Get or update user profile with location-locked currency
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!userProfile) {
      // Create new profile with location-locked currency
      userProfile = await prisma.userProfile.create({
        data: {
          userId,
          email: req.user.email,
          country: userCountry,
          currency: requiredCurrency,
          locationLocked: true, // Critical: prevent currency changes
          verificationData: {
            ipAddress: req.location.ipAddress,
            detectedCountry: userCountry,
            confidence: req.location.confidence,
            timestamp: new Date().toISOString(),
          },
        },
      })
    } else {
      // Check if user's currency matches their location
      if (userProfile.currency !== requiredCurrency) {
        // CRITICAL: Currency mismatch detected
        console.error('🚨 CURRENCY VIOLATION DETECTED:', {
          userId,
          profileCurrency: userProfile.currency,
          locationCurrency: requiredCurrency,
          country: userCountry,
          ip: req.location.ipAddress,
          timestamp: new Date().toISOString(),
        })

        // For South African users trying to use USD - strict denial
        if (userCountry === 'ZA' && userProfile.currency === 'USD') {
          return res.status(403).json({
            error: 'Currency restriction violation',
            message:
              'USD currency is not available in your region due to regulatory requirements.',
            code: 'USD_NOT_AVAILABLE_IN_REGION',
            requiredCurrency: 'ZAR',
          })
        }

        // Force update to location-appropriate currency
        await prisma.userProfile.update({
          where: { userId },
          data: {
            currency: requiredCurrency,
            country: userCountry,
            locationLocked: true,
            verificationData: {
              ipAddress: req.location.ipAddress,
              detectedCountry: userCountry,
              confidence: req.location.confidence,
              timestamp: new Date().toISOString(),
              previousCurrency: userProfile.currency, // Track the change
            },
          },
        })

        // Update associated cash wallet currency
        await prisma.cashWallet.updateMany({
          where: { userId },
          data: { currency: requiredCurrency },
        })
      }
    }

    // Special enforcement for USD-prohibited countries (like South Africa)
    if (userCountry === 'ZA' && requiredCurrency !== 'ZAR') {
      return res.status(403).json({
        error: 'Currency not available',
        message:
          'Due to local regulations, only ZAR (South African Rand) is available in South Africa.',
        code: 'USD_PROHIBITED_ZA',
      })
    }

    next()
  } catch (error) {
    console.error('Currency enforcement error:', error)
    res.status(500).json({
      error: 'Currency enforcement failed',
      message: 'Unable to verify currency requirements.',
    })
  }
}

/**
 * Middleware to block any request with USD for South African users
 */
export const blockUSDForSouthAfrica = (
  req: LocationAuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.location?.country === 'ZA') {
    // Check if request body contains USD currency
    if (
      req.body &&
      (req.body.currency === 'USD' || req.body.currency === 'usd')
    ) {
      return res.status(403).json({
        error: 'Currency not permitted',
        message:
          'USD transactions are not permitted from South Africa due to AdMob policy compliance.',
        code: 'USD_BLOCKED_ZA',
        allowedCurrency: 'ZAR',
      })
    }

    // Check query parameters
    if (
      req.query &&
      (req.query.currency === 'USD' || req.query.currency === 'usd')
    ) {
      return res.status(403).json({
        error: 'Currency not permitted',
        message: 'USD queries are not permitted from South Africa.',
        code: 'USD_BLOCKED_ZA',
        allowedCurrency: 'ZAR',
      })
    }
  }

  next()
}

/**
 * Generate location compliance report for auditing
 */
export const generateComplianceReport = async (userId: string) => {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      cashWallet: true,
      transactions: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!userProfile) return null

  return {
    userId,
    country: userProfile.country,
    currency: userProfile.currency,
    locationLocked: userProfile.locationLocked,
    verificationData: userProfile.verificationData,
    cashWalletCurrency: userProfile.cashWallet?.currency,
    recentTransactions: userProfile.transactions.length,
    complianceStatus:
      userProfile.locationLocked &&
      userProfile.currency === userProfile.cashWallet?.currency &&
      (userProfile.country !== 'ZA' || userProfile.currency === 'ZAR')
        ? 'COMPLIANT'
        : 'NON_COMPLIANT',
    generatedAt: new Date().toISOString(),
  }
}
