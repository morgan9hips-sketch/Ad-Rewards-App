import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'

interface RecentWithdrawal {
  userId: string
  coins: number
  amountLocal: number
  currencyCode: string
  countryCode: string
  rateMultiplier: number
  completedAt: string
}

const FLAG_EMOJIS: Record<string, string> = {
  ZA: '🇿🇦',
  US: '🇺🇸',
  GB: '🇬🇧',
  CA: '🇨🇦',
  AU: '🇦🇺',
  IN: '🇮🇳',
  NG: '🇳🇬',
  KE: '🇰🇪',
  GH: '🇬🇭',
}

export default function RecentWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<RecentWithdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWithdrawals()
    // Refresh every 30 seconds
    const interval = setInterval(fetchWithdrawals, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchWithdrawals = async () => {
    try {
      // This is a public endpoint - no auth required
      const res = await fetch(`${API_BASE_URL}/api/withdrawals/recent-public`)

      if (res.ok) {
        const data = await res.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch (error) {
      console.error('Error fetching recent withdrawals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-700 rounded mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (withdrawals.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center">
        🔥 RECENT PAYOUTS
      </h3>
      <div className="space-y-2">
        {withdrawals.slice(0, 5).map((withdrawal, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-lg p-3 border border-gray-700 hover:border-purple-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-xl">
                  {FLAG_EMOJIS[withdrawal.countryCode] || '🌍'}
                </span>
                <span className="text-white font-medium">
                  {withdrawal.userId}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {getRelativeTime(withdrawal.completedAt)}
              </span>
            </div>
            <div className="text-sm text-gray-300">
              {withdrawal.coins.toLocaleString()} AdCoins →{' '}
              <span className="text-green-400 font-semibold">
                {withdrawal.currencyCode} {withdrawal.amountLocal.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Rate: {withdrawal.rateMultiplier.toFixed(2)}x
              {withdrawal.rateMultiplier > 1.0 && (
                <span className="text-green-400 ml-1">🔥</span>
              )}
              {withdrawal.rateMultiplier < 0.95 && (
                <span className="text-yellow-400 ml-1">⚠️</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
