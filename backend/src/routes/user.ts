import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import {
  getExchangeRate,
  convertFromUSD,
  getUserCurrencyInfo,
  getCurrencyForCountry,
} from '../services/currencyService.js'
import { getUserTransactions } from '../services/transactionService.js'
import {
  getClientIP,
  detectCountryFromIP,
  getUserLocationInfoFromCoordinates,
  getUserLocationInfo,
} from '../services/geoService.js'
import { checkSignupBonusEligibility } from '../services/signupBonusService.js'

const router = Router()
const prisma = new PrismaClient()

// Setup user profile (first-time setup)
router.post('/setup-profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const {
      displayName,
      avatarEmoji,
      avatarUrl,
      countryBadge,
      hideCountry,
      showOnLeaderboard,
    } = req.body

    // Validate display name
    if (displayName) {
      if (displayName.length < 3 || displayName.length > 20) {
        return res
          .status(400)
          .json({ error: 'Display name must be between 3 and 20 characters' })
      }
      if (!/^[a-zA-Z0-9_]+$/.test(displayName)) {
        return res.status(400).json({
          error:
            'Display name can only contain letters, numbers, and underscores',
        })
      }

      // Check if display name is already taken
      const existingUser = await prisma.userProfile.findUnique({
        where: { displayName },
      })
      if (existingUser && existingUser.userId !== userId) {
        return res.status(400).json({ error: 'Display name is already taken' })
      }
    }

    // Update profile
    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        displayName: displayName || undefined,
        avatarEmoji: avatarEmoji || undefined,
        avatarUrl: avatarUrl || undefined,
        countryBadge: countryBadge || undefined,
        hideCountry: hideCountry !== undefined ? hideCountry : false,
        showOnLeaderboard:
          showOnLeaderboard !== undefined ? showOnLeaderboard : true,
        profileSetupCompleted: true,
      },
    })

    res.json(profile)
  } catch (error) {
    console.error('Error setting up profile:', error)
    res.status(500).json({ error: 'Failed to setup profile' })
  }
})

// Get user profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    // Create profile if it doesn't exist
    if (!profile) {
      // Get user's country from IP automatically
      const clientIP = getClientIP(req)
      const { countryCode, currency } = getUserLocationInfo(clientIP)

      profile = await prisma.userProfile.create({
        data: {
          userId,
          email: req.user!.email,
          country: countryCode || 'ZA', // Default to ZA if detection fails
          preferredCurrency: currency || 'ZAR', // Default to ZAR
        },
      })

      // NEW: Check signup bonus eligibility for new users
      await checkSignupBonusEligibility(userId, countryCode || 'ZA')
    } else {
      // Update lastLogin
      await prisma.userProfile.update({
        where: { userId },
        data: { lastLogin: new Date() },
      })
    }

    // Convert BigInt and Decimal fields to strings before sending
    const profileData = {
      ...profile,
      // BigInt fields
      coinsBalance: profile.coinsBalance.toString(),
      totalCoinsEarned: profile.totalCoinsEarned.toString(),
      // Decimal fields
      cashBalanceUsd: profile.cashBalanceUsd.toString(),
      totalCashEarnedUsd: profile.totalCashEarnedUsd.toString(),
      totalWithdrawnUsd: profile.totalWithdrawnUsd.toString(),
      totalEarningsUsd: profile.totalEarningsUsd.toString(),
      rewardedAdEarningsUsd: profile.rewardedAdEarningsUsd.toString(),
      retryAdEarningsUsd: profile.retryAdEarningsUsd.toString(),
      signUpBonusUsd: profile.signUpBonusUsd.toString(),
      cashWalletUsd: profile.cashWalletUsd.toString(),
      // Legacy fields (keep as is for backwards compatibility)
      walletBalance: profile.walletBalance,
      totalEarned: profile.totalEarned,
    }

    res.json(profileData)
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update user profile
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const {
      name,
      country,
      paypalEmail,
      preferredCurrency,
      autoDetectCurrency,
      displayName,
      avatarEmoji,
      avatarUrl,
      countryBadge,
      hideCountry,
      showOnLeaderboard,
    } = req.body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (country !== undefined) updateData.country = country
    if (paypalEmail !== undefined) updateData.paypalEmail = paypalEmail
    if (preferredCurrency !== undefined)
      updateData.preferredCurrency = preferredCurrency
    if (autoDetectCurrency !== undefined)
      updateData.autoDetectCurrency = autoDetectCurrency

    // Validate and update display name
    if (displayName !== undefined) {
      if (displayName && (displayName.length < 3 || displayName.length > 20)) {
        return res
          .status(400)
          .json({ error: 'Display name must be between 3 and 20 characters' })
      }
      if (displayName && !/^[a-zA-Z0-9_]+$/.test(displayName)) {
        return res.status(400).json({
          error:
            'Display name can only contain letters, numbers, and underscores',
        })
      }

      // Check if display name is already taken
      if (displayName) {
        const existingUser = await prisma.userProfile.findUnique({
          where: { displayName },
        })
        if (existingUser && existingUser.userId !== userId) {
          return res
            .status(400)
            .json({ error: 'Display name is already taken' })
        }
      }

      updateData.displayName = displayName || null
    }

    if (avatarEmoji !== undefined) updateData.avatarEmoji = avatarEmoji
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (countryBadge !== undefined) updateData.countryBadge = countryBadge
    if (hideCountry !== undefined) updateData.hideCountry = hideCountry
    if (showOnLeaderboard !== undefined)
      updateData.showOnLeaderboard = showOnLeaderboard

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: updateData,
    })

    res.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Get user balance in local currency
router.get('/balance', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const ipAddress = getClientIP(req)

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        coinsBalance: true,
        cashBalanceUsd: true,
        preferredCurrency: true,
      },
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    const cashUSD = parseFloat(profile.cashBalanceUsd.toString())

    // Get user's currency info
    const currencyInfo = await getUserCurrencyInfo(userId, ipAddress)
    const cashLocal = cashUSD * currencyInfo.exchangeRate

    // Format the local amount
    const cashLocalFormatted = `${currencyInfo.formatting.symbol}${cashLocal.toFixed(currencyInfo.formatting.decimals)}`

    res.json({
      coins: profile.coinsBalance.toString(),
      cashUsd: cashUSD.toFixed(4),
      cashLocal: cashLocal.toFixed(2),
      cashLocalFormatted,
      displayCurrency: currencyInfo.displayCurrency,
      displayCountry: currencyInfo.displayCountry,
      revenueCountry: currencyInfo.revenueCountry,
      exchangeRate: currencyInfo.exchangeRate.toFixed(6),
      currencySymbol: currencyInfo.formatting.symbol,
      currencyPosition: currencyInfo.formatting.position,
    })
  } catch (error) {
    console.error('Error fetching balance:', error)
    res.status(500).json({ error: 'Failed to fetch balance' })
  }
})

// Get user's currency info
router.get('/currency-info', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { lat, lng } = req.query
    const ipAddress = getClientIP(req)

    // Try GPS coordinates first, fallback to IP
    let currencyInfo
    let locationDetected = false
    let detectedCountry: string | undefined

    if (lat && lng) {
      const latitude = parseFloat(lat as string)
      const longitude = parseFloat(lng as string)

      // Validate coordinates
      if (
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      ) {
        // Get location info from coordinates
        const locationInfo = getUserLocationInfoFromCoordinates(
          latitude,
          longitude,
        )

        if (locationInfo.countryCode) {
          // Use GPS-based location
          currencyInfo = await getUserCurrencyInfo(
            userId,
            'coordinates',
            locationInfo.countryCode,
          )
          locationDetected = true
          detectedCountry = locationInfo.countryCode
        }
      }
    }

    // Fallback to IP-based detection
    if (!currencyInfo) {
      currencyInfo = await getUserCurrencyInfo(userId, ipAddress)
      locationDetected = false
    }

    res.json({
      ...currencyInfo,
      locationDetected,
      coordinates:
        lat && lng
          ? { lat: parseFloat(lat as string), lng: parseFloat(lng as string) }
          : null,
      detectedCountry: detectedCountry || currencyInfo.displayCountry,
      locationRequired: false, // Not strictly required, just preferred
    })
  } catch (error) {
    console.error('Error fetching currency info:', error)
    res.status(500).json({ error: 'Failed to fetch currency info' })
  }
})

// Get user transaction history
router.get('/transactions', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const perPage = parseInt(req.query.perPage as string) || 20
    const type = req.query.type as string | undefined

    const result = await getUserTransactions(userId, page, perPage, type)

    res.json(result)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// Detect country from IP
router.get('/detect-country', async (req: AuthRequest, res) => {
  try {
    const ipAddress = getClientIP(req)
    const countryCode = detectCountryFromIP(ipAddress)

    res.json({
      countryCode,
      ipAddress: ipAddress !== 'unknown' ? ipAddress : null,
    })
  } catch (error) {
    console.error('Error detecting country:', error)
    res.status(500).json({ error: 'Failed to detect country' })
  }
})

// Get user signup bonus information
router.get('/signup-bonus', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    // Check if user has a signup bonus
    const signupBonus = await prisma.signupBonus.findUnique({
      where: { userId },
    })

    if (!signupBonus) {
      return res.json({
        eligible: false,
      })
    }

    // Get user profile for country info
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { country: true },
    })

    res.json({
      eligible: true,
      userNumber: signupBonus.userNumberInRegion,
      countryCode: profile?.country || signupBonus.countryCode,
      bonusCoins: signupBonus.bonusCoins,
      bonusValue: parseFloat(signupBonus.bonusValueZar.toString()),
      claimed: !!signupBonus.creditedAt,
    })
  } catch (error) {
    console.error('Error fetching signup bonus:', error)
    res.status(500).json({ error: 'Failed to fetch signup bonus information' })
  }
})

// Accept terms and conditions
router.post('/accept-terms', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    // Update user profile with terms acceptance timestamp
    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        acceptedTermsAt: new Date(),
      },
    })

    res.json({
      success: true,
      acceptedAt: profile.acceptedTermsAt,
    })
  } catch (error) {
    console.error('Error accepting terms:', error)
    res.status(500).json({ error: 'Failed to record terms acceptance' })
  }
})

export default router
