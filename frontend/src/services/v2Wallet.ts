import { API_BASE_URL } from '../config/api'

export interface V2WalletEntry {
  id: number
  type: string
  amountCoins: string
  description: string | null
  createdAt: string
}

export interface V2WalletResponse {
  ok?: boolean
  success?: boolean
  balance?: number
  balanceCoins?: string
  recentEntries?: V2WalletEntry[]
}

export async function fetchV2Wallet(token: string): Promise<V2WalletResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v2/wallet`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED')
  }

  if (!response.ok) {
    throw new Error(`V2_WALLET_HTTP_${response.status}`)
  }

  return response.json()
}

export function parseV2CoinBalance(payload: V2WalletResponse): number {
  return Number(payload.balance ?? payload.balanceCoins ?? 0)
}
