import { PrismaClient } from '@prisma/client'
import { awardCoins } from './transactionService.js'

const prisma = new PrismaClient()

/**
 * Monetag Ad Zone Configuration
 * 
 * Passive Ads (100% Platform Revenue):
 * - Zone 10618702: Push Notifications
 * - Zone 211854: Banner Multitag
 * - Zone 10618701: Vignette Banner
 * - Zone 10618700: In-Page Push
 * 
 * Rewarded Ads (85% User / 15% Platform):
 * - Zone 10618699: OnClick Popunder
 */

interface AdZoneConfig {
  type: 'push' | 'banner' | 'vignette' | 'inpage' | 'rewarded'
  userShare: number // 0 or 85
  platformShare: number // 100 or 15
  coins: number // 0 or 100
}

export const AD_ZONES: Record<string, AdZoneConfig> = {
  '10618702': { type: 'push', userShare: 0, platformShare: 100, coins: 0 },
  '211854': { type: 'banner', userShare: 0, platformShare: 100, coins: 0 },
  '10618701': { type: 'vignette', userShare: 0, platformShare: 100, coins: 0 },
  '10618700': { type: 'inpage', userShare: 0, platformShare: 100, coins: 0 },
  '10618699': { type: 'rewarded', userShare: 85, platformShare: 15, coins: 100 },
}

/**
 * Track Monetag ad impression and award coins if applicable
 */
export async function trackMonetagImpression(
  userId: string,
  adZoneId: string,
  revenueUsd?: number
): Promise<{
  success: boolean
  coinsAwarded: number
  isBetaUser: boolean
  betaMultiplier: number
}> {
  // Get zone config
  const config = AD_ZONES[adZoneId]
  if (!config) {
    throw new Error(`Unknown ad zone: ${adZoneId}`)
  }

  // Get user profile for beta status and country
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      revenueCountry: true,
      isBetaUser: true,
      betaMultiplier: true,
    },
  })

  if (!profile) {
    throw new Error('User profile not found')
  }

  const isBetaUser = profile.isBetaUser || false
  const betaMultiplier = profile.betaMultiplier || 1.0
  const countryCode = profile.revenueCountry || 'US'

  // Create Monetag impression record
  await prisma.montagImpression.create({
    data: {
      userId,
      adType: config.type,
      adZoneId,
      userSharePercent: config.userShare,
      platformSharePercent: config.platformShare,
      estimatedRevenueUsd: revenueUsd || 0,
      countryCode,
      isBetaMode: isBetaUser,
      betaMultiplier,
      coinsAwarded: config.coins,
    },
  })

  // Award coins if this is a rewarded ad
  if (config.coins > 0) {
    await awardCoins(userId, config.coins, `Watched ${config.type} ad`)

    // Track beta debt for future 1.5x payout
    if (isBetaUser) {
      const debtIncrease = config.coins * 0.01 * 0.85 * betaMultiplier

      await prisma.betaDebt.upsert({
        where: { userId },
        update: {
          totalCoinsEarned: { increment: config.coins },
          estimatedDebtUsd: { increment: debtIncrease },
        },
        create: {
          userId,
          totalCoinsEarned: config.coins,
          estimatedDebtUsd: debtIncrease,
          multiplier: betaMultiplier,
        },
      })
    }
  }

  return {
    success: true,
    coinsAwarded: config.coins,
    isBetaUser,
    betaMultiplier,
  }
}

/**
 * Get ad type from zone ID
 */
export function getAdType(zoneId: string): string {
  const config = AD_ZONES[zoneId]
  return config?.type || 'unknown'
}
