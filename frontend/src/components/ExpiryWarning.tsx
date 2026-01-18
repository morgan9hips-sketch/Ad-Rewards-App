import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import Card from './Card'

interface ExpiryStatus {
  coinsExpiring: boolean
  coinsDaysLeft: number
  coinsAmount: number
  cashExpiring: boolean
  cashDaysLeft: number
  cashAmount: number
}

export default function ExpiryWarning() {
  const { session } = useAuth()
  const [expiryStatus, setExpiryStatus] = useState<ExpiryStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkExpiryStatus()
  }, [])

  const checkExpiryStatus = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const profile = await res.json()
        const lastLogin = new Date(profile.lastLogin)
        const now = new Date()
        const daysSinceLogin = Math.floor(
          (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        )

        const coinsBalance = Number(profile.coinsBalance || 0)
        const cashBalance = Number(profile.cashBalanceUsd || 0)

        // Check coin expiry (30 days)
        const coinsDaysLeft = 30 - daysSinceLogin
        const coinsExpiring = coinsDaysLeft <= 7 && coinsDaysLeft > 0 && coinsBalance > 0

        // Check cash expiry (90 days)
        const cashDaysLeft = 90 - daysSinceLogin
        const cashExpiring = cashDaysLeft <= 14 && cashDaysLeft > 0 && cashBalance > 0

        if (coinsExpiring || cashExpiring) {
          setExpiryStatus({
            coinsExpiring,
            coinsDaysLeft,
            coinsAmount: coinsBalance,
            cashExpiring,
            cashDaysLeft,
            cashAmount: cashBalance,
          })
        }
      }
    } catch (error) {
      console.error('Error checking expiry status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !expiryStatus) return null

  return (
    <div className="mb-6">
      {/* Coin Expiry Warning */}
      {expiryStatus.coinsExpiring && (
        <Card className="border-2 border-yellow-500 bg-yellow-900/10">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-yellow-400 font-bold text-lg mb-2">
                  Your Coins Are Expiring Soon!
                </h3>
                <p className="text-gray-300 mb-3">
                  You have {expiryStatus.coinsAmount.toLocaleString()} coins that will expire in{' '}
                  <span className="font-bold text-yellow-400">
                    {expiryStatus.coinsDaysLeft} day{expiryStatus.coinsDaysLeft !== 1 ? 's' : ''}
                  </span>{' '}
                  due to inactivity.
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Watch an ad to reset the timer and keep your coins safe! 🎬
                </p>
                <a
                  href="/ads"
                  className="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Watch Ads Now
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cash Expiry Warning */}
      {expiryStatus.cashExpiring && (
        <Card className="border-2 border-red-500 bg-red-900/10 mt-4">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚨</span>
              <div className="flex-1">
                <h3 className="text-red-400 font-bold text-lg mb-2">
                  Your Cash Balance Is Expiring Soon!
                </h3>
                <p className="text-gray-300 mb-3">
                  You have ${expiryStatus.cashAmount.toFixed(2)} USD that will expire in{' '}
                  <span className="font-bold text-red-400">
                    {expiryStatus.cashDaysLeft} day{expiryStatus.cashDaysLeft !== 1 ? 's' : ''}
                  </span>{' '}
                  due to inactivity.
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Log in or watch an ad to reset the timer and preserve your balance! 💰
                </p>
                <div className="flex gap-3">
                  <a
                    href="/ads"
                    className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Watch Ads
                  </a>
                  {expiryStatus.cashAmount >= 10 && (
                    <a
                      href="/withdrawals"
                      className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Withdraw Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
