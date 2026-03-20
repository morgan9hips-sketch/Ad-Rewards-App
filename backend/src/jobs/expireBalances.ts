import { PrismaClient, V2LedgerEntryType } from '@prisma/client'
import cron from 'node-cron'

const prisma = new PrismaClient()

// Expiry configuration constants
const COIN_EXPIRY_DAYS = 30
const CASH_EXPIRY_DAYS = 90

/**
 * Expire coin balances after 30 days of inactivity
 */
async function expireCoins() {
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() - COIN_EXPIRY_DAYS)
  const expiryKeyDate = expiryDate.toISOString().slice(0, 10)

  try {
    // Find inactive users; coin balances are derived from V2 ledger
    const inactiveUsers = await prisma.userProfile.findMany({
      where: {
        lastLogin: {
          lt: expiryDate,
        },
      },
      select: {
        userId: true,
        email: true,
      },
    })

    let totalExpired = 0
    let totalValue = 0

    for (const user of inactiveUsers) {
      const balanceResult = await prisma.v2LedgerEntry.aggregate({
        where: { userId: user.userId },
        _sum: { amountCoins: true },
      })

      const currentCoins = balanceResult._sum.amountCoins ?? 0n
      if (currentCoins <= 0n) {
        continue
      }

      const coins = Number(currentCoins)
      // Coins that expire before conversion have no cash value (not yet converted)
      const cashValue = 0

      // Log expiry
      // @ts-ignore // Legacy - scheduled for removal post-launch
      await prisma.expiredBalance.create({
        data: {
          userId: user.userId,
          expiryType: 'coins',
          amount: coins,
          cashValue: cashValue,
          reason: 'coin_inactivity',
        },
      })

      await prisma.v2LedgerEntry.create({
        data: {
          userId: user.userId,
          type: V2LedgerEntryType.REDEEM,
          amountCoins: -currentCoins,
          idempotencyKey: `coin_expiry:${expiryKeyDate}:${user.userId}`,
          referenceType: 'coin_inactivity',
          description: `Coin expiry after ${COIN_EXPIRY_DAYS} days inactivity`,
          metadata: {
            expiredCoins: coins,
          },
        },
      })

      totalExpired += coins
      totalValue += cashValue

      console.log(
        `Expired ${coins} coins (unconverted) from user ${user.email}`,
      )
    }

    console.log(
      `✅ Coin expiry complete: ${inactiveUsers.length} users, ${totalExpired} coins expired (unconverted)`,
    )

    return {
      usersAffected: inactiveUsers.length,
      totalCoinsExpired: totalExpired,
      totalValue: totalValue,
    }
  } catch (error) {
    console.error('❌ Error expiring coins:', error)
    throw error
  }
}

/**
 * Expire cash balances after 90 days of inactivity
 */
async function expireCash() {
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() - CASH_EXPIRY_DAYS)

  try {
    // Find users with cash and inactive for 90+ days
    const inactiveUsers = await prisma.userProfile.findMany({
      where: {
        lastLogin: {
          lt: expiryDate,
        },
        cashBalanceUsd: {
          gt: 0,
        },
      },
      select: {
        userId: true,
        email: true,
        cashBalanceUsd: true,
      },
    })

    let totalExpired = 0

    for (const user of inactiveUsers) {
      const cashUsd = Number(user.cashBalanceUsd)

      // Log expiry
      // @ts-ignore // Legacy - scheduled for removal post-launch
      await prisma.expiredBalance.create({
        data: {
          userId: user.userId,
          expiryType: 'cash',
          amount: cashUsd,
          cashValue: cashUsd,
          reason: 'cash_inactivity',
        },
      })

      // Reset cash balance
      await prisma.userProfile.update({
        where: { userId: user.userId },
        data: { cashBalanceUsd: 0 },
      })

      totalExpired += cashUsd

      console.log(`Expired $${cashUsd.toFixed(2)} USD from user ${user.email}`)
    }

    console.log(
      `✅ Cash expiry complete: ${inactiveUsers.length} users, $${totalExpired.toFixed(2)} USD`,
    )

    return {
      usersAffected: inactiveUsers.length,
      totalCashExpired: totalExpired,
    }
  } catch (error) {
    console.error('❌ Error expiring cash:', error)
    throw error
  }
}

/**
 * Main expiry job that runs both coin and cash expiry
 */
export async function runExpiryJob() {
  console.log('🕐 Starting balance expiry job...', new Date().toISOString())

  try {
    const coinResults = await expireCoins()
    const cashResults = await expireCash()

    console.log('✅ Balance expiry job completed successfully')
    console.log('Summary:', {
      coins: coinResults,
      cash: cashResults,
    })

    return {
      success: true,
      coins: coinResults,
      cash: cashResults,
    }
  } catch (error) {
    console.error('❌ Balance expiry job failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Schedule the job to run daily at 2:00 AM
 * Cron format: minute hour day month dayOfWeek
 * '0 2 * * *' = At 2:00 AM every day
 */
export function scheduleExpiryJob() {
  // Run at 2:00 AM every day
  cron.schedule('0 2 * * *', async () => {
    await runExpiryJob()
  })

  console.log('⏰ Balance expiry job scheduled (daily at 2:00 AM)')
}

// For manual testing
