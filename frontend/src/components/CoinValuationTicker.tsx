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
    // Refresh every 60 seconds
    const interval = setInterval(fetchValuation, 60000)
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
        setValuation(data.valuation || data)
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

  const getColorClass = (): string => {
    if (multiplier >= 1.05) return 'from-green-600 to-green-700'
    if (multiplier <= 0.95) return 'from-yellow-600 to-yellow-700'
    return 'from-blue-600 to-blue-700'
  }

  const getEmoji = (): string => {
    if (multiplier >= 1.05) return '🔥'
    if (multiplier <= 0.95) return '⚠️'
    return '⚡'
  }

  const getMessage = (): string => {
    if (multiplier >= 1.05) {
      const percent = ((multiplier - 1) * 100).toFixed(0)
      return `Regional ad revenue is ${percent}% above average!`
    } else if (multiplier <= 0.95) {
      const percent = ((1 - multiplier) * 100).toFixed(0)
      return `Regional ad revenue is ${percent}% below average this month`
    } else {
      return 'Stable regional ad performance'
    }
  }

  return (
    <div className={`bg-gradient-to-r ${getColorClass()} rounded-lg p-4 mb-4 shadow-lg border-2 border-opacity-50`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl animate-pulse">{getEmoji()}</span>
          <div>
            <div className="text-white font-bold text-lg">
              Regional Performance: {multiplier.toFixed(1)}x
            </div>
            <div className="text-white text-sm opacity-90">
              {getMessage()}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white opacity-75">
            Updated: {new Date(valuation.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
