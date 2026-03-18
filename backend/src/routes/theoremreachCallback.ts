/**
 * TheoremReach server-to-server reward callback
 *
 * TheoremReach sends a GET request to:
 *   /api/theoremreach/callback?user_id={user_id}&reward={coins}&currency={usd}&tx_id={tx_id}&hash={hash}
 *
 * Optional parameters:
 *   reversal=true  — deduct coins instead of crediting
 *   debug=true     — ignore completely, return 1
 *
 * Hash verification:
 *   HMAC-SHA1 of the full callback URL (excluding the hash param) with
 *   THEOREMREACH_SECRET_KEY, then base64-encoded with URL-safe chars:
 *     replace + → -,  / → _,  strip =
 *   Compare the result against the hash query parameter.
 *
 * TheoremReach expects plain-text "1" on success, "0" on failure.
 */

import { Router, Request, Response } from 'express'
import { createHmac } from 'node:crypto'
import { Prisma, PrismaClient } from '@prisma/client'
import { applyTaskWinStreakAndReferralShare } from '../services/retentionService.js'

const router = Router()
const prisma = new PrismaClient()
const THEOREM_USER_SHARE = 0.6

// ── Helpers ─────────────────────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.THEOREMREACH_SECRET_KEY
  if (!secret) throw new Error('THEOREMREACH_SECRET_KEY is not configured')
  return secret
}

/**
 * Reconstruct the canonical callback URL from the request, then compute the
 * HMAC-SHA1 signature (base64 URL-safe, no padding).
 *
 * The hash param itself is excluded so that the verification is not circular.
 */
function computeExpectedHash(req: Request): string {
  // Build full URL with the original host header so it matches what TheoremReach
  // signed when they dispatched the callback.
  const protocol =
    (req.headers['x-forwarded-proto'] as string | undefined)
      ?.split(',')[0]
      ?.trim() ?? (req.secure ? 'https' : 'http')

  const host =
    (req.headers['x-forwarded-host'] as string | undefined)
      ?.split(',')[0]
      ?.trim() ??
    req.get('host') ??
    ''

  // Rebuild query string without the hash parameter
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'hash') continue
    params.append(key, String(value ?? ''))
  }

  const qs = params.toString()
  const fullUrl = `${protocol}://${host}${req.path}${qs ? '?' + qs : ''}`

  return createHmac('sha1', getSecret())
    .update(fullUrl)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function plainSuccess(res: Response): Response {
  return res.status(200).type('text/plain').send('1')
}

function plainError(res: Response): Response {
  // Return HTTP 200 so TheoremReach doesn't retry on network errors;
  // the body "0" signals application-level failure.
  return res.status(200).type('text/plain').send('0')
}

// ── Route ────────────────────────────────────────────────────────────────────

/**
 * GET /callback
 * Full path when mounted: GET /api/theoremreach/callback
 */
router.get('/callback', async (req: Request, res: Response) => {
  // Disable caching so every callback reaches origin.
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0',
  )

  const { user_id, reward, currency, tx_id, hash, reversal, debug } =
    req.query as Record<string, string | undefined>

  console.log('[TheoremReach] Callback received', {
    user_id,
    reward,
    currency,
    tx_id,
    reversal,
    debug,
    hasHash: Boolean(hash),
  })

  // ── 1. Debug mode — acknowledge without processing ───────────────────────
  if (debug === 'true' || debug === '1') {
    console.info('[TheoremReach] Debug callback — ignored')
    return plainSuccess(res)
  }

  // ── 2. Parameter presence check ──────────────────────────────────────────
  if (!user_id || !reward || !tx_id || !hash) {
    console.warn('[TheoremReach] Missing required query parameters', req.query)
    return plainError(res)
  }

  // ── 3. Hash verification ──────────────────────────────────────────────────
  let expected = ''
  try {
    expected = computeExpectedHash(req)
  } catch (err) {
    console.error('[TheoremReach] Secret key not configured:', err)
    return plainError(res)
  }

  if (expected !== hash.trim()) {
    console.warn('[TheoremReach] Hash mismatch', {
      user_id,
      tx_id,
      received: hash,
      expected,
    })
    return plainError(res)
  }

  // ── 4. Parse reward coins ─────────────────────────────────────────────────
  const coinsRaw = Math.trunc(Number(reward))
  if (!Number.isFinite(coinsRaw) || coinsRaw <= 0) {
    console.warn('[TheoremReach] Invalid reward value', reward)
    return plainError(res)
  }

  const isReversal = reversal === 'true' || reversal === '1'

  // ── 5. Database transaction ───────────────────────────────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      const surveyHistory = (tx as any).surveyHistory

      // Insert survey_history — unique tx_id prevents duplicate processing
      await surveyHistory.create({
        data: {
          provider: 'theoremreach',
          transId: tx_id,
          userId: user_id,
          amount: coinsRaw,
          status: isReversal ? 2 : 1,
          hash: hash,
          hashValid: true,
          sourceIp:
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
            req.socket?.remoteAddress ??
            '',
          processed: false,
          notes: `currency=${currency ?? 'unknown'}, reversal=${isReversal}`,
        },
      })

      // Verify user exists
      const user = await tx.userProfile.findUnique({
        where: { userId: user_id },
        select: {
          userId: true,
          countryCode: true,
          preferredCurrency: true,
        },
      })

      if (!user) {
        await surveyHistory.update({
          where: { transId: tx_id },
          data: { processed: false, notes: 'User not found' },
        })
        throw new Error(`TheoremReach: user not found for user_id=${user_id}`)
      }

      if (isReversal) {
        // ── Reversal: deduct coins ─────────────────────────────────────────
        const updatedUser = await tx.userProfile.update({
          where: { userId: user_id },
          data: {
            coinsBalance: { decrement: BigInt(coinsRaw) },
            totalCoinsEarned: { decrement: BigInt(coinsRaw) },
          },
          select: { coinsBalance: true, cashBalanceUsd: true },
        })

        await tx.transaction.create({
          data: {
            userId: user_id,
            type: 'coin_earned',
            coinsChange: BigInt(-coinsRaw),
            cashChangeUsd: 0,
            coinsBalanceAfter: updatedUser.coinsBalance,
            cashBalanceAfterUsd: updatedUser.cashBalanceUsd,
            description: `TheoremReach reversal (${tx_id})`,
            referenceType: 'theoremreach_reversal',
          },
        })

        await surveyHistory.update({
          where: { transId: tx_id },
          data: {
            processed: true,
            processedAt: new Date(),
            notes: `Reversed ${coinsRaw} coins (currency=${currency ?? 'unknown'})`,
          },
        })

        console.log(
          `[TheoremReach] ↩️  Reversed ${coinsRaw} coins from user ${user_id} (txn: ${tx_id})`,
        )
      } else {
        // ── Normal: credit coins ───────────────────────────────────────────
        const updatedUser = await tx.userProfile.update({
          where: { userId: user_id },
          data: {
            coinsBalance: { increment: BigInt(coinsRaw) },
            totalCoinsEarned: { increment: BigInt(coinsRaw) },
          },
          select: { coinsBalance: true, cashBalanceUsd: true },
        })

        await tx.transaction.create({
          data: {
            userId: user_id,
            type: 'coin_earned',
            coinsChange: BigInt(coinsRaw),
            cashChangeUsd: 0,
            coinsBalanceAfter: updatedUser.coinsBalance,
            cashBalanceAfterUsd: updatedUser.cashBalanceUsd,
            description: `TheoremReach reward (${tx_id})`,
            referenceType: 'theoremreach_reward',
          },
        })

        await applyTaskWinStreakAndReferralShare(
          tx,
          user_id,
          coinsRaw,
          'theoremreach_reward',
        )

        const theoremreachHistory = (tx as any).theoremReachHistory
        const preferredCurrency = user.preferredCurrency || 'ZAR'
        const fxRate = await tx.fxRate.findUnique({
          where: { currency: preferredCurrency },
          select: { rateToZar: true },
        })
        const rateToZarSnapshot = fxRate ? Number(fxRate.rateToZar) : null
        const userShareUsd = Number((coinsRaw * 0.01).toFixed(6))
        const revenueUsd = Number(
          (userShareUsd / THEOREM_USER_SHARE).toFixed(6),
        )
        const platformShareUsd = Number(
          (revenueUsd * (1 - THEOREM_USER_SHARE)).toFixed(6),
        )
        const localValue =
          rateToZarSnapshot === null
            ? null
            : Number((coinsRaw * 0.01 * rateToZarSnapshot).toFixed(4))

        await theoremreachHistory.create({
          data: {
            provider: 'theoremreach',
            transId: tx_id,
            userId: user_id,
            amount: coinsRaw,
            status: 1,
            hashValid: true,
            sourceIp:
              (req.headers['x-forwarded-for'] as string)
                ?.split(',')[0]
                ?.trim() ??
              req.socket?.remoteAddress ??
              '',
            countryCode: user.countryCode,
            revenueUsd,
            userShareUsd,
            platformShareUsd,
            splitPercent: 60,
            rateToZarSnapshot,
            localValue,
            currency: preferredCurrency,
            processed: true,
            processedAt: new Date(),
            notes: `Credited ${coinsRaw} coins (currency=${currency ?? 'unknown'})`,
          },
        })

        await surveyHistory.update({
          where: { transId: tx_id },
          data: {
            processed: true,
            processedAt: new Date(),
            notes: `Credited ${coinsRaw} coins (currency=${currency ?? 'unknown'})`,
          },
        })

        console.log(
          `[TheoremReach] ✅ Credited ${coinsRaw} coins to user ${user_id} (txn: ${tx_id})`,
        )
      }
    })

    return plainSuccess(res)
  } catch (err) {
    // Duplicate tx_id → silently acknowledge so TheoremReach stops retrying
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      console.info(`[TheoremReach] Duplicate tx_id ignored: ${tx_id}`)
      return plainSuccess(res)
    }

    console.error('[TheoremReach] Callback processing error:', err)
    return plainError(res)
  }
})

export default router
