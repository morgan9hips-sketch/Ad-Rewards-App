import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@adrevtech.co.za'

  console.log('🌱 Seeding database...')

  // Seed exchange rates
  console.log('💱 Seeding exchange rates...')
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.exchangeRate.upsert({
      where: {
        targetCurrency_date: {
          targetCurrency: 'ZAR',
          date: today,
        },
      },
      update: {
        rate: 18.50,
      },
      create: {
        baseCurrency: 'USD',
        targetCurrency: 'ZAR',
        rate: 18.50,
        date: today,
      },
    })

    await prisma.exchangeRate.upsert({
      where: {
        targetCurrency_date: {
          targetCurrency: 'USD',
          date: today,
        },
      },
      update: {
        rate: 0.054,
      },
      create: {
        baseCurrency: 'ZAR',
        targetCurrency: 'USD',
        rate: 0.054,
        date: today,
      },
    })

    console.log('✅ Exchange rates seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding exchange rates:', error)
  }

  // Check if admin user already exists
  const existingAdmin = await prisma.userProfile.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    // Update existing user to admin role
    await prisma.userProfile.update({
      where: { email: adminEmail },
      data: { role: UserRole.ADMIN },
    })
    console.log('✅ Existing user upgraded to admin:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Role: ADMIN`)
  } else {
    console.log('⚠️  No user found with email:', adminEmail)
    console.log('   Please create a user account first via the application, then run this seed script.')
    console.log('   Alternatively, manually update a user\'s role in the database:')
    console.log(`   UPDATE "user_profiles" SET role = 'ADMIN' WHERE email = 'your-email@example.com';`)
  }

  console.log('')
  console.log('⚠️  IMPORTANT: Ensure admin users have strong passwords and access is properly secured!')

  // ── V2 Reward Catalog seed ──────────────────────────────────────────────────
  console.log('')
  console.log('🎁 Seeding V2 reward catalog...')
  try {
    const v2Rewards = [
      {
        title: '$5 PayPal Cash',
        description: 'Redeem your coins for $5 USD sent to your PayPal account.',
        costCoins: 5000,
        isActive: true,
      },
      {
        title: '$10 Amazon Gift Card',
        description: 'Redeem your coins for a $10 Amazon digital gift card.',
        costCoins: 9500,
        isActive: true,
      },
    ]

    for (const reward of v2Rewards) {
      const existing = await prisma.v2Reward.findFirst({
        where: { title: reward.title },
      })
      if (!existing) {
        await prisma.v2Reward.create({ data: reward })
        console.log(`   ✅ Created V2 reward: ${reward.title}`)
      } else {
        console.log(`   ⏭️  V2 reward already exists: ${reward.title}`)
      }
    }
  } catch (error) {
    console.error('❌ Error seeding V2 reward catalog:', error)
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
