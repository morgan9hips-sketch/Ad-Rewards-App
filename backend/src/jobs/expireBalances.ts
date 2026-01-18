import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'

const prisma = new PrismaClient()

/**
 * Expire coin balances after 30 days of inactivity
 */
async function expireCoins() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    // Find users with coins and inactive for 30+ days
    const inactiveUsers = await prisma.userProfile.findMany({
      where: {
        lastLogin: {
          lt: thirtyDaysAgo,
        },
        coinsBalance: {
          gt: 0,
        },
      },
      select: {
        userId: true,
        email: true,
        coinsBalance: true,
      },
    })

    let totalExpired = 0
    let totalValue = 0

    for (const user of inactiveUsers) {
      const coins = Number(user.coinsBalance)
      // Using 1000 coins = R1 (ZAR) conversion rate
      const cashValue = coins / 1000

      // Log expiry
      await prisma.expiredBalance.create({
        data: {
          userId: user.userId,
          expiryType: 'coins',
          amount: coins,
          cashValue: cashValue,
          reason: 'coin_inactivity',
        },
      })

      // Reset coin balance
      await prisma.userProfile.update({
        where: { userId: user.userId },
        data: { coinsBalance: 0 },
      })

      totalExpired += coins
      totalValue += cashValue

      console.log(
        `Expired ${coins} coins (R${cashValue.toFixed(2)}) from user ${user.email}`
      )
    }

    console.log(
      `✅ Coin expiry complete: ${inactiveUsers.length} users, ${totalExpired} coins (R${totalValue.toFixed(2)})`
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
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  try {
    // Find users with cash and inactive for 90+ days
    const inactiveUsers = await prisma.userProfile.findMany({
      where: {
        lastLogin: {
          lt: ninetyDaysAgo,
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
      `✅ Cash expiry complete: ${inactiveUsers.length} users, $${totalExpired.toFixed(2)} USD`
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
if (require.main === module) {
  runExpiryJob()
    .then(() => {
      console.log('Manual run complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Manual run failed:', error)
      process.exit(1)
    })
}
