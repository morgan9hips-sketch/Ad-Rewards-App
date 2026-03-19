import { Router } from 'express'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

function buildTheoremReachUrl(userId: string): string {
  const appId = process.env.THEOREMREACH_APP_ID || '24755'
  return `https://theoremreach.com/respondent_entry/${appId}?user_id=${encodeURIComponent(userId)}`
}

router.get('/launch-url', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const launchUrl = buildTheoremReachUrl(userId)
    return res.json({ launchUrl })
  } catch (error) {
    console.error('Error generating TheoremReach launch URL:', error)
    return res
      .status(500)
      .json({ error: 'Failed to generate TheoremReach launch URL' })
  }
})

export default router
