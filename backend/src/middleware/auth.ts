import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient, UserRole } from '@prisma/client'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const prisma = new PrismaClient()

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role?: UserRole }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Fetch user role from database
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { role: true },
    })

    req.user = { 
      id: user.id, 
      email: user.email!,
      role: userProfile?.role || UserRole.USER
    }
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}

