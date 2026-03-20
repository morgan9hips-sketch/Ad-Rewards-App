import { Router } from 'express'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

function buildTheoremReachUrl(userId: string): string {
  const apiKey =
    process.env.THEOREMREACH_API_KEY || 'c2b9890bf508c3d76d7faba2361b'
  const params = new URLSearchParams({
    api_key: apiKey,
    user_id: userId,
    transaction_id: `launch-${userId}-${Date.now()}`,
  })
  return `https://theoremreach.com/respondent_entry/direct?${params.toString()}`
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
