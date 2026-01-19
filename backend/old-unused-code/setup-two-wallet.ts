import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupTwoWalletSystem() {
  try {
    console.log('🔧 Setting up Two-Wallet System...')

    // Create initial exchange rates
    const exchangeRates = [
      {
        fromCurrency: 'COINS',
        toCurrency: 'USD',
        rate: 1000, // 1000 coins = 1 cent
        revenueShare: 0.85, // 85% revenue share
      },
      {
        fromCurrency: 'COINS',
        toCurrency: 'EUR',
        rate: 1100, // 1100 coins = 1 cent EUR
        revenueShare: 0.85,
      },
      {
        fromCurrency: 'COINS',
        toCurrency: 'GBP',
        rate: 1200, // 1200 coins = 1 cent GBP
        revenueShare: 0.85,
      },
    ]

    for (const rate of exchangeRates) {
      const existing = await prisma.exchangeRate.findFirst({
        where: {
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
          isActive: true,
        },
      })

      if (!existing) {
        await prisma.exchangeRate.create({
          data: rate,
        })
        console.log(
          `✅ Created exchange rate: ${rate.fromCurrency} -> ${rate.toCurrency}`
        )
      } else {
        console.log(
          `⏭️  Exchange rate already exists: ${rate.fromCurrency} -> ${rate.toCurrency}`
        )
      }
    }

    // Create default ads with coin rewards
    const defaultAds = [
      {
        title: 'AdMob Rewarded Video',
        description: 'Watch this ad to earn 100 coins!',
        durationSeconds: 30,
        rewardCents: 5, // Legacy
        rewardCoins: BigInt(100),
        isActive: true,
        adMobUnitId: process.env.ADMOB_REWARDED_AD_UNIT_ID,
      },
      {
        title: 'Premium Rewarded Ad',
        description: 'Higher value ad with more coins!',
        durationSeconds: 45,
        rewardCents: 8, // Legacy
        rewardCoins: BigInt(150),
        isActive: true,
      },
    ]

    for (const ad of defaultAds) {
      const existing = await prisma.ad.findFirst({
        where: { title: ad.title },
      })

      if (!existing) {
        await prisma.ad.create({
          data: ad,
        })
        console.log(`✅ Created ad: ${ad.title}`)
      } else {
        console.log(`⏭️  Ad already exists: ${ad.title}`)
      }
    }

    console.log('🎉 Two-Wallet System setup complete!')
  } catch (error) {
    console.error('❌ Setup failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run setup
setupTwoWalletSystem()

export default setupTwoWalletSystem
