import { Router } from 'express'
import { createHash } from 'node:crypto'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

function buildCpxUserHash(userId: string, secureHash: string): string {
  return createHash('md5')
    .update(`${userId}-${secureHash}`)
    .digest('hex')
    .toLowerCase()
}

function buildCpxOfferUrl(userId: string): string {
  const appId = process.env.CPX_APP_ID || '31893'
  const secureHash = process.env.CPX_SECURE_HASH

  if (!secureHash) {
    throw new Error('CPX_SECURE_HASH is not configured')
  }

  const secureUserHash = buildCpxUserHash(userId, secureHash)
  const params = new URLSearchParams({
    app_id: appId,
    ext_user_id: userId,
    secure_hash: secureUserHash,
  })

  return `https://offers.cpx-research.com/index.php?${params.toString()}`
}

router.get('/offer-url', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const offerUrl = buildCpxOfferUrl(userId)
    return res.json({ offerUrl })
  } catch (error) {
    console.error('Error generating CPX offer URL:', error)
    return res.status(500).json({ error: 'Failed to generate CPX offer URL' })
  }
})

export default router
