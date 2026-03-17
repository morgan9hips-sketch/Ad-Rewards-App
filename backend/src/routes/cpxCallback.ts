import { Router, Request, Response } from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import { createHash } from 'node:crypto'
import { applyTaskWinStreakAndReferralShare } from '../services/retentionService.js'

const router = Router()
const prisma = new PrismaClient()

const ALLOWED_IPS = new Set([
  '188.40.3.73',
  '2a01:4f8:d0a:30ff::2',
  '157.90.97.92',
])

interface CallbackPayload {
  transId: string
  userId: string
  amount: number
  status: number
  hash: string
}

const CALLBACK_FIELDS = [
  'trans_id',
  'transId',
  'user_id',
  'userId',
  'amount_local',
  'amount',
  'coins',
  'status',
  'hash',
] as const

function getCallbackSource(req: Request): Record<string, unknown> {
  return {
    ...(req.query || {}),
    ...(req.body || {}),
  } as Record<string, unknown>
}

function hasAnyCallbackField(source: Record<string, unknown>): boolean {
  return CALLBACK_FIELDS.some((field) => source[field] !== undefined)
}

function normalizeIp(rawIp: string): string {
  let ip = rawIp.trim().toLowerCase()

  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7)
  }

  if (ip.startsWith('[') && ip.endsWith(']')) {
    ip = ip.slice(1, -1)
  }

  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.split(':')[0]
  }

  return ip
}

function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return normalizeIp(first)
  }

  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.length > 0) {
    return normalizeIp(realIp)
  }

  return normalizeIp(req.socket?.remoteAddress || req.ip || '')
}

function parsePayload(req: Request): CallbackPayload | null {
  const source = getCallbackSource(req)

  const transId = String(source.trans_id ?? source.transId ?? '').trim()
  const userId = String(source.user_id ?? source.userId ?? '').trim()
  const hash = String(source.hash ?? '')
    .trim()
    .toLowerCase()

  const amountRaw = source.amount_local ?? source.amount ?? source.coins
  const statusRaw = source.status

  if (
    !transId ||
    !userId ||
    !hash ||
    amountRaw === undefined ||
    statusRaw === undefined
  ) {
    return null
  }

  const amount = Math.trunc(Number(amountRaw))
  const status = Number(statusRaw)

  if (!Number.isFinite(amount) || amount < 0) {
    return null
  }

  if (![1, 2].includes(status)) {
    return null
  }

  return {
    transId,
    userId,
    amount,
    status,
    hash,
  }
}

function buildExpectedHash(transId: string, secureHash: string): string {
  return createHash('md5')
    .update(`${transId}-${secureHash}`)
    .digest('hex')
    .toLowerCase()
}

async function processCallback(
  payload: CallbackPayload,
  sourceIp: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const surveyHistory = (tx as any).surveyHistory

    await surveyHistory.create({
      data: {
        provider: 'cpx_research',
        transId: payload.transId,
        userId: payload.userId,
        amount: payload.amount,
        status: payload.status,
        hash: payload.hash,
        hashValid: true,
        sourceIp,
        processed: false,
      },
    })

    if (payload.status === 2) {
      await surveyHistory.update({
        where: { transId: payload.transId },
        data: {
          processed: true,
          processedAt: new Date(),
          notes: 'Reversed/Screenout callback received',
        },
      })
      return
    }

    const user = await tx.userProfile.findUnique({
      where: { userId: payload.userId },
      select: { userId: true },
    })

    if (!user) {
      await surveyHistory.update({
        where: { transId: payload.transId },
        data: {
          processed: false,
          notes: 'User not found',
        },
      })
      return
    }

    const updatedUser = await tx.userProfile.update({
      where: { userId: payload.userId },
      data: {
        coinsBalance: { increment: BigInt(payload.amount) },
        totalCoinsEarned: { increment: BigInt(payload.amount) },
      },
      select: { coinsBalance: true, cashBalanceUsd: true },
    })

    await tx.transaction.create({
      data: {
        userId: payload.userId,
        type: 'coin_earned',
        coinsChange: BigInt(payload.amount),
        cashChangeUsd: 0,
        coinsBalanceAfter: updatedUser.coinsBalance,
        cashBalanceAfterUsd: updatedUser.cashBalanceUsd,
        description: `CPX Research survey completion (${payload.transId})`,
        referenceType: 'cpx_survey',
      },
    })

    await applyTaskWinStreakAndReferralShare(
      tx,
      payload.userId,
      payload.amount,
      'cpx_survey',
    )

    await surveyHistory.update({
      where: { transId: payload.transId },
      data: {
        processed: true,
        processedAt: new Date(),
        notes: 'Completion credited',
      },
    })
  })
}

async function callbackHandler(req: Request, res: Response) {
  const sourceIp = extractClientIp(req)
  const source = getCallbackSource(req)
  const payload = parsePayload(req)

  if (!payload) {
    if (hasAnyCallbackField(source)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid callback payload' })
    }

    return res
      .status(200)
      .json({ status: 'ok', message: 'CPX callback endpoint active' })
  }

  if (!ALLOWED_IPS.has(sourceIp)) {
    return res.status(403).json({ success: false, error: 'Forbidden IP' })
  }

  const secureHash = process.env.CPX_SECURE_HASH
  if (!secureHash) {
    console.error('CPX_SECURE_HASH is not configured')
    return res
      .status(500)
      .json({ success: false, error: 'Server misconfiguration' })
  }

  const expectedHash = buildExpectedHash(payload.transId, secureHash)
  if (payload.hash !== expectedHash) {
    return res.status(403).json({ success: false, error: 'Invalid hash' })
  }

  try {
    await processCallback(payload, sourceIp)
    return res.status(200).json({ success: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res
        .status(200)
        .json({ success: true, message: 'Duplicate trans_id ignored' })
    }

    console.error('CPX callback processing error:', error)
    return res
      .status(500)
      .json({ success: false, error: 'Failed to process callback' })
  }
}

router.get('/', callbackHandler)
router.post('/', callbackHandler)

export default router
