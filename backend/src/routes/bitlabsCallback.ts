/**
 * BitLabs server-to-server reward callback
 *
 * BitLabs sends a GET request to:
 *   /api/bitlabs/callback?uid={user_id}&currency={currency}&amount={amount}&transaction_id={transaction_id}&signature={signature}
 *
 * Signature verification:
 *   HMAC-SHA1(uid + ":" + amount, BITLABS_SECRET_KEY) === signature
 *
 * Coin calculation:
 *   amount is in USD cents. User receives 60%.
 *   coins = Math.floor(amount * 0.60)   e.g. 150 cents → 90 coins
 *
 * BitLabs expects plain-text "OK" on success, "ERROR" on any failure.
 */

import { Router, Request, Response } from 'express'
import { createHmac } from 'node:crypto'
import { Prisma, PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// 60/40 split – user receives this fraction of the BitLabs payout
const USER_SHARE = 0.6

function getSecret(): string {
  const secret = process.env.BITLABS_SECRET_KEY
  if (!secret) throw new Error('BITLABS_SECRET_KEY is not configured')
  return secret
}

function computeSignature(uid: string, amount: string): string {
  return createHmac('sha1', getSecret())
    .update(`${uid}:${amount}`)
    .digest('hex')
    .toLowerCase()
}

function plainError(res: Response, status = 200): Response {
  // BitLabs reads the body text and expects "ERROR"; still return HTTP 200
  // so the callback infrastructure doesn't retry endlessly.
  return res.status(status).type('text/plain').send('ERROR')
}

/**
 * GET /callback
 * Full path when mounted: GET /api/bitlabs/callback
 */
router.get('/callback', async (req: Request, res: Response) => {
  const { uid, currency, amount, transaction_id } = req.query as Record<
    string,
    string | undefined
  >
  const providedSignature = (req.query.signature ?? req.query.hash) as
    | string
    | undefined

  // Disable caching for callback responses so every callback reaches origin.
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0',
  )

  console.log('[BitLabs] Callback received', {
    uid,
    amount,
    transaction_id,
    hasSignature: Boolean(providedSignature),
    source: req.query.signature
      ? 'signature'
      : req.query.hash
        ? 'hash'
        : 'none',
  })

  // ── 1. Parameter presence check ─────────────────────────────────────────
  if (!uid || !amount || !transaction_id || !providedSignature) {
    console.warn('[BitLabs] Missing required query parameters', req.query)
    return plainError(res)
  }

  // ── 2. Signature verification ────────────────────────────────────────────
  let secretConfigured = true
  let expected = ''
  try {
    expected = computeSignature(uid, amount)
  } catch {
    secretConfigured = false
  }

  if (
    !secretConfigured ||
    expected !== providedSignature.toLowerCase().trim()
  ) {
    console.warn('[BitLabs] Signature mismatch', {
      uid,
      amount,
      transaction_id,
      got: providedSignature,
      expected,
    })
    return plainError(res)
  }

  // ── 3. Parse numeric amount ──────────────────────────────────────────────
  const amountCents = Math.trunc(Number(amount))
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    console.warn('[BitLabs] Invalid amount', amount)
    return plainError(res)
  }

  // ── 4. Calculate coins ───────────────────────────────────────────────────
  // amount is in USD cents; 100 coins = $1 = 100 cents
  // user_coins = floor(amount_cents * USER_SHARE)
  const coinsToAward = Math.floor(amountCents * USER_SHARE)

  try {
    await prisma.$transaction(async (tx) => {
      const surveyHistory = (tx as any).surveyHistory

      // ── 5. Insert survey_history — unique transId prevents duplicates ────
      // If this throws P2002, the catch block below silently ignores the dup.
      await surveyHistory.create({
        data: {
          provider: 'bitlabs',
          transId: transaction_id,
          userId: uid,
          amount: amountCents,
          status: 1,
          hash: providedSignature,
          hashValid: true,
          sourceIp:
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
            req.socket?.remoteAddress ??
            '',
          processed: false,
          notes: `currency=${currency ?? 'unknown'}, coins=${coinsToAward}`,
        },
      })

      // ── 6. Verify user exists ────────────────────────────────────────────
      const user = await tx.userProfile.findUnique({
        where: { userId: uid },
        select: { userId: true },
      })

      if (!user) {
        await surveyHistory.update({
          where: { transId: transaction_id },
          data: { processed: false, notes: 'User not found' },
        })
        // Intentionally throw so the outer handler returns ERROR
        throw new Error(`BitLabs: user not found for uid=${uid}`)
      }

      // ── 7. Credit coins ──────────────────────────────────────────────────
      const updatedUser = await tx.userProfile.update({
        where: { userId: uid },
        data: {
          coinsBalance: { increment: BigInt(coinsToAward) },
          totalCoinsEarned: { increment: BigInt(coinsToAward) },
        },
        select: { coinsBalance: true, cashBalanceUsd: true },
      })

      await tx.transaction.create({
        data: {
          userId: uid,
          type: 'coin_earned',
          coinsChange: BigInt(coinsToAward),
          cashChangeUsd: 0,
          coinsBalanceAfter: updatedUser.coinsBalance,
          cashBalanceAfterUsd: updatedUser.cashBalanceUsd,
          description: `BitLabs reward (${transaction_id})`,
          referenceType: 'bitlabs_reward',
        },
      })

      // ── 8. Mark processed ────────────────────────────────────────────────
      await surveyHistory.update({
        where: { transId: transaction_id },
        data: {
          processed: true,
          processedAt: new Date(),
          notes: `Credited ${coinsToAward} coins (${amountCents} cents × ${USER_SHARE}; currency=${currency ?? 'unknown'})`,
        },
      })
    })

    console.log(
      `[BitLabs] ✅ Credited ${coinsToAward} coins to user ${uid} (txn: ${transaction_id})`,
    )
    return res.status(200).type('text/plain').send('OK')
  } catch (err) {
    // Duplicate transaction_id → silently acknowledge so BitLabs stops retrying
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      console.info(
        `[BitLabs] Duplicate transaction_id ignored: ${transaction_id}`,
      )
      return res.status(200).type('text/plain').send('OK')
    }

    console.error('[BitLabs] Callback processing error:', err)
    return plainError(res)
  }
})

export default router
