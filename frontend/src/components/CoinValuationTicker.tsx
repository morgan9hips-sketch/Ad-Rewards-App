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

  // Calculate rate multiplier
  const baselineValue = 1.0 // R1 per 100 coins at 1.0x
  const multiplier = valuation.valuePer100Coins / baselineValue

  const getMultiplierDisplay = () => {
    if (multiplier > 1.0) {
      return {
        emoji: '🔥',
        color: 'text-green-500',
        bgColor: 'from-green-50 to-green-100',
        borderColor: 'border-green-200',
        title: 'Regional Performance',
        message: `Ad revenue is ${((multiplier - 1) * 100).toFixed(0)}% above average!`,
      }
    } else if (multiplier < 1.0) {
      return {
        emoji: '⚠️',
        color: 'text-yellow-500',
        bgColor: 'from-yellow-50 to-yellow-100',
        borderColor: 'border-yellow-200',
        title: 'Regional Performance',
        message: `Ad revenue is ${((1 - multiplier) * 100).toFixed(0)}% below average`,
      }
    } else {
      return {
        emoji: '⚡',
        color: 'text-gray-500',
        bgColor: 'from-gray-50 to-gray-100',
        borderColor: 'border-gray-200',
        title: 'Regional Performance',
        message: 'Stable',
      }
    }
  }

  const display = getMultiplierDisplay()

  return (
    <div className={`bg-gradient-to-r ${display.bgColor} border ${display.borderColor} rounded-lg p-4 mb-6 animate-pulse-subtle`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{display.emoji}</div>
          <div>
            <div className="text-sm text-gray-600 font-medium">
              {display.title}
            </div>
            <div className={`text-lg font-bold ${display.color}`}>
              {multiplier.toFixed(1)}x
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {display.message}
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Updates every 6 hours • Last updated:{' '}
        {new Date(valuation.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  )
}
