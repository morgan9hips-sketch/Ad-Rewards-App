import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient, UserRole } from '@prisma/client'
import { getClientIP, detectCountryFromIP } from '../services/geoService.js'
import { getCurrencyForCountry } from '../services/currencyService.js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// FIX: Prevent Prisma connection pooling issues in serverless
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role?: UserRole }
}

/**
 * Generate unique wallet ID in format: ADC-12345678
 */
function generateWalletId(): string {
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `ADC-${random}`
}

/**
 * Check if user should be marked as beta user
 * Beta users get 1.5x multiplier but only for signups before cutoff date
 */
function shouldBeBetaUser(): boolean {
  // Beta program cutoff date: March 1, 2026
  const betaCutoffDate = new Date('2026-03-01T00:00:00Z')
  const now = new Date()
  
  return now < betaCutoffDate
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // List of public routes that don't require authentication
    const publicRoutes = [
      '/api/withdrawals/recent-public',
      '/withdrawals/recent-public',
      '/api/referrals/lookup',
      '/referrals/lookup',
    ]
    
    // Check if this is a public route
    const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route))
    
    if (isPublicRoute) {
      return next()
    }

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('❌ Auth error:', error)
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Fetch or create user profile
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    })

    // Auto-create profile if missing
    if (!userProfile) {
      const ip = getClientIP(req)
      const countryCode = detectCountryFromIP(ip) || 'US'
      const currency = getCurrencyForCountry(countryCode)
      
      // Generate unique wallet ID
      let walletId = generateWalletId()
      
      // Ensure wallet ID is unique (max 10 attempts)
      let attempts = 0
      while (attempts < 10) {
        const existing = await prisma.userProfile.findUnique({
          where: { walletId: walletId }
        })
        if (!existing) break
        walletId = generateWalletId()
        attempts++
      }
      
      // If still not unique after 10 attempts, throw error
      if (attempts >= 10) {
        throw new Error('Failed to generate unique wallet ID after 10 attempts')
      }

      userProfile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          email: user.email!,
          signupIp: ip,
          signupCountry: countryCode,
          country: countryCode,
          preferredCurrency: currency,
          walletId: walletId,
          isBetaUser: shouldBeBetaUser(),
        },
      })
    }

    req.user = {
      id: user.id,
      email: user.email!,
      role: userProfile.role,
    }

    next()
  } catch (error) {
    console.error('❌ Authentication error:', error instanceof Error ? error.message : error)
    console.error('Stack:', error instanceof Error ? error.stack : null)
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' })
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' })
  }

  next()
}

export async function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Super Admin access required' })
  }

  next()
}