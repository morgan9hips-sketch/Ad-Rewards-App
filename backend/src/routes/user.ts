import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get user profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          email: req.user!.email,
        },
      })
    }

    res.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update user profile
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { name, country, paypalEmail } = req.body

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        name,
        country,
        paypalEmail,
      },
    })

    res.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
