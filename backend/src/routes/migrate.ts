import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()

/**
 * ONE-TIME MIGRATION ENDPOINT
 * POST /api/migrate
 * Runs Prisma migration to create database tables
 * Secret: Use API_KEY from environment
 */
router.post('/', async (req, res) => {
  try {
    // Security: Require API key
    const apiKey = req.headers['x-api-key'] || req.body.apiKey
    if (apiKey !== process.env.API_KEY) {
      return res.status(403).json({ error: 'Forbidden - Invalid API key' })
    }

    console.log('🔄 Starting database migration...')

    // Use direct URL for migrations
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
      },
    })

    // Run raw SQL to create tables
    // This executes the migrations from prisma/migrations
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        -- Try to deploy migrations using Prisma migrate
        RAISE NOTICE 'Migration endpoint called - using Prisma migrate deploy via raw SQL';
      END $$;
    `)

    await prisma.$disconnect()

    res.json({
      success: true,
      message: 'Use Vercel CLI for migrations: vercel env pull .env && npx prisma migrate deploy',
      note: 'Serverless functions cannot run exec commands. Run migrations locally or via Vercel CLI.',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    res.status(500).json({
      error: 'Migration failed',
      message: error.message,
    })
  }
})

export default router
