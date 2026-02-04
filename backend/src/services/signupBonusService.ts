import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// --- CONSTANTS ---
// These are required for the functions below.
const SIGNUP_BONUS_LIMIT_PER_REGION = 10000
const SIGNUP_BONUS_COINS = 500
const SIGNUP_BONUS_VALUE_ZAR = 50.0
// --- END CONSTANTS ---

/**
 * Check if a user is eligible for signup bonus and credit it immediately.
 * Called during user registration.
 */
export async function checkSignupBonusEligibility(
  userId: string,
  countryCode: string
): Promise<boolean> {
  try {
    // Use a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
      // Count existing users in this region
      const existingUsersCount = await tx.signupBonus.count({
        where: { countryCode },
      });

      const userNumberInRegion = existingUsersCount + 1;
      const eligible = userNumberInRegion <= SIGNUP_BONUS_LIMIT_PER_REGION;

      let creditedAt: Date | null = null;

      // --- NEW LOGIC: If eligible, credit the bonus immediately ---
      if (eligible) {
        creditedAt = new Date(); // Mark as credited now

        // 1. Add coins to user's profile
        await tx.userProfile.update({
          where: { userId },
          data: {
            coinsBalance: { increment: SIGNUP_BONUS_COINS },
            totalCoinsEarned: { increment: SIGNUP_BONUS_COINS },
          },
        });

        // 2. Add cash value for backend tracking
        const bonusValueUsd = Number(SIGNUP_BONUS_VALUE_ZAR) / 18.5; // Consider making the exchange rate dynamic
        await tx.userProfile.update({
          where: { userId },
          data: {
            cashBalanceUsd: { increment: bonusValueUsd },
            totalCashEarnedUsd: { increment: bonusValueUsd },
          },
        });

        // 3. Create a transaction record for history
        await tx.transaction.create({
          data: {
            userId,
            type: 'signup_bonus',
            coinsChange: SIGNUP_BONUS_COINS,
            cashChangeUsd: bonusValueUsd,
            description: `Signup bonus - User #${userNumberInRegion} in ${countryCode}`,
          },
        });

        console.log(`✅ Immediately credited signup bonus for new user ${userId}`);
      }

      // Create the final signup bonus record
      await tx.signupBonus.create({
        data: {
          userId,
          countryCode,
          userNumberInRegion,
          bonusCoins: SIGNUP_BONUS_COINS,
          bonusValueZar: SIGNUP_BONUS_VALUE_ZAR,
          eligible,
          creditedAt, // This will be the date if eligible, null otherwise
        },
      });

      return eligible;
    });
  } catch (error) {
    console.error('Error during signup bonus eligibility check and credit:', error);
    return false;
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
    if (signupBonus.eligible) {
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