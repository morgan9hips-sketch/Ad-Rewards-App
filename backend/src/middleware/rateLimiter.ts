import { Request, Response, NextFunction } from 'express'

/**
 * Simple in-memory rate limiter
 * Tracks request counts per key (user ID or IP) within a window
 */
interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

function createRateLimiter(options: {
  windowMs: number
  max: number
  keyPrefix: string
  message?: string
}) {
  return (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
    const userId = req.user?.id
    const key = `${options.keyPrefix}:${userId || ip}`
    const now = Date.now()

    let entry = store.get(key)

    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + options.windowMs }
      store.set(key, entry)
    }

    entry.count++

    res.setHeader('X-RateLimit-Limit', options.max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - entry.count))
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000))

    if (entry.count > options.max) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: options.message || 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      })
    }

    next()
  }
}

/** 100 requests per minute per user */
export const userRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  keyPrefix: 'user',
  message: 'Too many requests. Please wait a moment before trying again.',
})

/** 200 requests per minute per IP */
export const ipRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 200,
  keyPrefix: 'ip',
  message: 'Too many requests from this IP address.',
})

/** 5 login attempts per 15 minutes */
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: 'login',
  message: 'Too many login attempts. Please wait 15 minutes before trying again.',
})

/** 10 withdrawal requests per hour */
export const withdrawalRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyPrefix: 'withdrawal',
  message: 'Too many withdrawal requests. Please wait before submitting another.',
})

/** 50 admin actions per hour */
export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  keyPrefix: 'admin',
  message: 'Admin rate limit exceeded. Please slow down.',
})
