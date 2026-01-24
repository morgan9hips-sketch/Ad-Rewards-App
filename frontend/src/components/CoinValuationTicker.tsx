import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../contexts/AuthContext'

interface CoinValuation {
  valuePer100Coins: number
  currencyCode: string
  currencySymbol: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
  lastUpdated: string
}

export default function CoinValuationTicker() {
  const { session } = useAuth()
  const [valuation, setValuation] = useState<CoinValuation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchValuation()
    // Refresh every 30 seconds
    const interval = setInterval(fetchValuation, 30000)
    return () => clearInterval(interval)
  }, [session])

  const fetchValuation = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/coin-valuation`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setValuation(data)
      }
    } catch (error) {
      console.error('Error fetching coin valuation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !valuation) {
    return null
  }

  const getTrendColor = () => {
    if (valuation.trend === 'up') return 'text-green-600'
    if (valuation.trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = () => {
    if (valuation.trend === 'up') return '↑'
    if (valuation.trend === 'down') return '↓'
    return '→'
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6 animate-pulse-subtle">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">💰</div>
          <div>
            <div className="text-sm text-gray-600 font-medium">
              Live Coin Value
            </div>
            <div className="text-lg font-bold text-gray-900">
              100 coins ≈{' '}
              <span className={getTrendColor()}>
                {valuation.currencySymbol}
                {valuation.valuePer100Coins.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          <span className="text-2xl">{getTrendIcon()}</span>
          <span className="font-bold">
            {Math.abs(valuation.changePercent).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Updates every 6 hours • Last updated:{' '}
        {new Date(valuation.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  )
}
