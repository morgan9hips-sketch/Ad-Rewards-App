import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetSchema() {
  console.log('🔄 Resetting database schema...')

  try {
    // Drop all tables related to our app
    await prisma.$executeRaw`DROP TABLE IF EXISTS user_badges CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS badges CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS withdrawals CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS ad_views CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS ads CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS user_profiles CASCADE`

    console.log('✅ Dropped existing tables')

    // Use the schema push to recreate tables
    console.log('📝 Recreating schema...')

    console.log(
      '🎉 Schema reset completed! Run "npm run prisma:push" to create tables.'
    )
  } catch (error) {
    console.error('❌ Error resetting schema:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetSchema().catch((error) => {
  console.error(error)
  process.exit(1)
})
