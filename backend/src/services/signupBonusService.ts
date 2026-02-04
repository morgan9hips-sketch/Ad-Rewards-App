import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SIGNUP_BONUS_LIMIT_PER_REGION = 10000
const SIGNUP_BONUS_COINS = 500
const SIGNUP_BONUS_VALUE_ZAR = 50.0

/**
 * Check if a user is eligible for signup bonus
 * Called during user registration
 */
export async function checkSignupBonusEligibility(
  userId: string,
  countryCode: string
): Promise<boolean> {
  console.info('[SIGNUP_BONUS] Entry: checkSignupBonusEligibility', {
    userId,
    countryCode,
    timestamp: new Date().toISOString(),
  })

  try {
    // Count existing users in this region
    const existingUsersCount = await prisma.signupBonus.count({
      where: { countryCode },
    })

    const userNumberInRegion = existingUsersCount + 1
    const eligible = userNumberInRegion <= SIGNUP_BONUS_LIMIT_PER_REGION

    console.info('[SIGNUP_BONUS] Eligibility check', {
      userId,
      countryCode,
      userNumberInRegion,
      eligible,
      limit: SIGNUP_BONUS_LIMIT_PER_REGION,
    })

    // Create signup bonus record
    await prisma.signupBonus.create({
      data: {
        userId,
        countryCode,
        userNumberInRegion,
        bonusCoins: SIGNUP_BONUS_COINS,
        bonusValueZar: SIGNUP_BONUS_VALUE_ZAR,
        eligible,
      },
    })

    if (eligible) {
      console.info('[SIGNUP_BONUS] Bonus awarded', {
        userId,
        countryCode,
        userNumberInRegion,
        bonusCoins: SIGNUP_BONUS_COINS,
        bonusValueZar: SIGNUP_BONUS_VALUE_ZAR,
      })
    } else {
      console.info('[SIGNUP_BONUS] Bonus skipped - limit reached', {
        userId,
        countryCode,
        userNumberInRegion,
        limit: SIGNUP_BONUS_LIMIT_PER_REGION,
      })
    }

    return eligible
  } catch (error) {
    console.error('[SIGNUP_BONUS] Error checking signup bonus eligibility:', {
      userId,
      countryCode,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return false
  }
}

/**
 * Credit signup bonus when user reaches minimum withdrawal threshold
 */
export async function creditSignupBonus(userId: string): Promise<boolean> {
  console.info('[SIGNUP_BONUS] Credit attempt', {
    userId,
    timestamp: new Date().toISOString(),
  })

  try {
    const signupBonus = await prisma.signupBonus.findUnique({
      where: { userId },
    })

    if (!signupBonus) {
      console.info('[SIGNUP_BONUS] Credit skipped - no bonus record', { userId })
      return false
    }

    // Check if already credited
    if (signupBonus.creditedAt) {
      console.info('[SIGNUP_BONUS] Credit skipped - already credited', {
        userId,
        creditedAt: signupBonus.creditedAt,
      })
      return false
    }

    // Check if eligible
    if (!signupBonus.eligible) {
      console.info('[SIGNUP_BONUS] Credit skipped - not eligible', {
        userId,
        userNumberInRegion: signupBonus.userNumberInRegion,
        countryCode: signupBonus.countryCode,
      })
      return false
    }

    // Credit the bonus
    await prisma.$transaction(async (tx) => {
      // Add coins to user balance
      await tx.userProfile.update({
        where: { userId },
        data: {
          coinsBalance: { increment: signupBonus.bonusCoins },
          totalCoinsEarned: { increment: signupBonus.bonusCoins },
        },
      })

      // Add cash value to backend tracking
      const bonusValueUsd = Number(signupBonus.bonusValueZar) / 18.5
      await tx.userProfile.update({
        where: { userId },
        data: {
          cashBalanceUsd: {
            increment: bonusValueUsd,
          },
          totalCashEarnedUsd: {
            increment: bonusValueUsd,
          },
        },
      })

      // Mark as credited
      await tx.signupBonus.update({
        where: { userId },
        data: { creditedAt: new Date() },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: 'signup_bonus',
          coinsChange: signupBonus.bonusCoins,
          cashChangeUsd: bonusValueUsd,
          description: `Signup bonus - User #${signupBonus.userNumberInRegion} in ${signupBonus.countryCode}`,
        },
      })
    })

    console.info('[SIGNUP_BONUS] Bonus credited successfully', {
      userId,
      bonusCoins: signupBonus.bonusCoins,
      bonusValueZar: signupBonus.bonusValueZar,
      userNumberInRegion: signupBonus.userNumberInRegion,
      countryCode: signupBonus.countryCode,
    })
    return true
  } catch (error) {
    console.error('[SIGNUP_BONUS] Error crediting signup bonus:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return false
  }
}

/**
 * Get signup bonus info for a user
 */
export async function getSignupBonusInfo(userId: string): Promise<{
  eligible: boolean
  userNumber: number | null
  credited: boolean
  bonusCoins: number
  countryCode: string | null
  spotsRemaining: number | null
} | null> {
  try {
    const signupBonus = await prisma.signupBonus.findUnique({
      where: { userId },
    })

    if (!signupBonus) {
      return null
    }

    // Calculate spots remaining in region
    let spotsRemaining = null
    if (signupBonus.eligible && !signupBonus.creditedAt) {
      const totalInRegion = await prisma.signupBonus.count({
        where: { countryCode: signupBonus.countryCode },
      })
      spotsRemaining = Math.max(0, SIGNUP_BONUS_LIMIT_PER_REGION - totalInRegion)
    }

    return {
      eligible: signupBonus.eligible,
      userNumber: signupBonus.userNumberInRegion,
      credited: !!signupBonus.creditedAt,
      bonusCoins: signupBonus.bonusCoins,
      countryCode: signupBonus.countryCode,
      spotsRemaining,
    }
  } catch (error) {
    console.error('Error getting signup bonus info:', error)
    return null
  }
}

/**
 * Get stats for a specific region
 */
export async function getRegionSignupBonusStats(countryCode: string): Promise<{
  totalUsers: number
  eligibleUsers: number
  creditedUsers: number
  spotsRemaining: number
}> {
  try {
    const totalUsers = await prisma.signupBonus.count({
      where: { countryCode },
    })

    const eligibleUsers = await prisma.signupBonus.count({
      where: { countryCode, eligible: true },
    })

    const creditedUsers = await prisma.signupBonus.count({
      where: { countryCode, creditedAt: { not: null } },
    })

    const spotsRemaining = Math.max(0, SIGNUP_BONUS_LIMIT_PER_REGION - totalUsers)

    return {
      totalUsers,
      eligibleUsers,
      creditedUsers,
      spotsRemaining,
    }
  } catch (error) {
    console.error('Error getting region signup bonus stats:', error)
    return {
      totalUsers: 0,
      eligibleUsers: 0,
      creditedUsers: 0,
      spotsRemaining: SIGNUP_BONUS_LIMIT_PER_REGION,
    }
  }
}
