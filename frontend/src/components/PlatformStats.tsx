import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import { useCurrency } from '../contexts/CurrencyContext'

interface PlatformStatsData {
  totalWithdrawals: number
  totalPaidOut: number
  currency: string
  avgPayout: number
}

export default function PlatformStats() {
  const { session } = useAuth()
  const [stats, setStats] = useState<PlatformStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { currencyInfo, formatAmount } = useCurrency()

  const formatPossiblyLocal = (amount: number): string => {
    // `formatAmount` expects an amount in USD and converts using exchangeRate.
    // The platform stats endpoint may already return an amount in a local currency.
    if (!currencyInfo) return amount.toLocaleString()

    if (stats?.currency === 'USD') {
      return formatAmount(amount)
    }

    if (stats?.currency && stats.currency === currencyInfo.displayCurrency) {
      const decimals = currencyInfo.formatting.decimals
      const formatted = amount.toFixed(decimals)
      const withCommas = parseFloat(formatted).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })

      if (currencyInfo.formatting.position === 'before') {
        return `${currencyInfo.formatting.symbol}${withCommas}`
      }
      return `${withCommas}${currencyInfo.formatting.symbol}`
    }

    return `${stats?.currency || ''} ${amount.toLocaleString()}`
  }

  useEffect(() => {
    fetchStats()
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 300000)
    return () => clearInterval(interval)
  }, [session])

  const fetchStats = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/platform/stats/24h`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-700 rounded mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center">
        💰 LAST 24 HOURS
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Withdrawals Processed</span>
          <span className="text-lg font-bold text-white">
            {stats.totalWithdrawals.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Total Paid Out</span>
          <span className="text-lg font-bold text-green-500">
            {formatPossiblyLocal(stats.totalPaidOut)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Average Payout</span>
          <span className="text-lg font-bold text-blue-500">
            {formatPossiblyLocal(stats.avgPayout)}
          </span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          ✨ Join thousands earning daily
        </p>
      </div>
    </div>
  )
}
