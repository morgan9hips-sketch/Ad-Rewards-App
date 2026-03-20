import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  fetchV2Wallet,
  parseV2CoinBalance,
  type V2WalletEntry,
} from '../services/v2Wallet'

export default function WalletV2() {
  const { session, signOut } = useAuth()
  const [balance, setBalance] = useState(0)
  const [entries, setEntries] = useState<V2WalletEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWallet = useCallback(async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const data = await fetchV2Wallet(token)

      if (data.success || data.ok) {
        setBalance(parseV2CoinBalance(data))
        setEntries(data.recentEntries ?? [])
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        await signOut()
        return
      }
      console.error('Error fetching wallet:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.access_token, signOut])

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false)
      return
    }

    fetchWallet()
  }, [session?.access_token, fetchWallet])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">💰 Wallet</h1>

      <Card className="mb-6">
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">Available Balance</p>
          <p className="text-5xl font-bold text-yellow-400">
            {balance.toLocaleString()}
          </p>
          <p className="text-gray-400 mt-1">coins</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        {entries.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">
                    {entry.description || entry.type}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`font-bold ${
                    Number(entry.amountCoins) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {Number(entry.amountCoins) >= 0 ? '+' : ''}
                  {entry.amountCoins}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
