import { Router, Request, Response } from 'express'
import { Prisma, PrismaClient, V2LedgerEntryType } from '@prisma/client'
import { createHash } from 'node:crypto'

const router = Router()
const prisma = new PrismaClient()
const CPX_USER_SHARE = 0.6

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
  revenueUsd?: number
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
  const revenueRaw = source.revenue_usd ?? source.revenue

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
  const parsedRevenueUsd =
    revenueRaw === undefined ||
    revenueRaw === null ||
    String(revenueRaw).trim() === ''
      ? undefined
      : Number(revenueRaw)
  const revenueUsd = Number.isFinite(parsedRevenueUsd)
    ? parsedRevenueUsd
    : undefined

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
    revenueUsd,
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
      select: {
        userId: true,
        countryCode: true,
        preferredCurrency: true,
      },
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

    if (payload.revenueUsd !== undefined) {
      const expectedCoins = Math.floor(
        (payload.revenueUsd * CPX_USER_SHARE) / 0.01,
      )
      if (Math.abs(expectedCoins - payload.amount) > 2) {
        console.warn('[CPX] Coin mismatch', {
          transId: payload.transId,
          userId: payload.userId,
          revenueUsd: payload.revenueUsd,
          expectedCoins,
          callbackAmount: payload.amount,
        })
      }
    }

    await tx.v2LedgerEntry.create({
      data: {
        userId: payload.userId,
        type: V2LedgerEntryType.EARN,
        amountCoins: BigInt(payload.amount),
        idempotencyKey: `cpx:${payload.transId}:reward`,
        referenceId: payload.transId,
        referenceType: 'cpx_survey',
        description: `CPX Research survey completion (${payload.transId})`,
        metadata: {
          provider: 'cpx_research',
          revenueUsd: payload.revenueUsd ?? null,
        },
      },
    })

    const preferredCurrency = user.preferredCurrency || 'ZAR'
    const fxRateRows = await tx.$queryRaw<
      Array<{ rate_to_zar: Prisma.Decimal }>
    >(
      Prisma.sql`SELECT rate_to_zar FROM fx_rates WHERE currency = ${preferredCurrency} LIMIT 1`,
    )
    const rateToZarSnapshot = fxRateRows[0]
      ? Number(fxRateRows[0].rate_to_zar)
      : null
    const localValue =
      rateToZarSnapshot === null
        ? null
        : Number((payload.amount * 0.01 * rateToZarSnapshot).toFixed(4))
    const revenueUsd =
      payload.revenueUsd === undefined
        ? null
        : Number(payload.revenueUsd.toFixed(6))
    const userShareUsd =
      revenueUsd === null
        ? null
        : Number((revenueUsd * CPX_USER_SHARE).toFixed(6))
    const platformShareUsd =
      revenueUsd === null
        ? null
        : Number((revenueUsd * (1 - CPX_USER_SHARE)).toFixed(6))

    await surveyHistory.update({
      where: { transId: payload.transId },
      data: {
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
