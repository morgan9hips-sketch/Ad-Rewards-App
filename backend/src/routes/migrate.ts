import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
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

    // Run Prisma migrate deploy
    const { stdout, stderr } = await execAsync(
      'npx prisma migrate deploy',
      {
        env: {
          ...process.env,
          DATABASE_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
        cwd: process.cwd(),
      },
    )

    console.log('Migration output:', stdout)
    if (stderr) console.error('Migration warnings:', stderr)

    res.json({
      success: true,
      message: 'Database migration completed successfully',
      output: stdout,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    res.status(500).json({
      error: 'Migration failed',
      message: error.message,
      details: error.stderr || error.stdout,
    })
  }
})

export default router
