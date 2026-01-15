import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@adrevtech.co.za'

  console.log('🌱 Seeding database...')

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
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
