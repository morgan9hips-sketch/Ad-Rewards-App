import { useState, useEffect } from 'react'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { API_BASE_URL } from '../config/api'

interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarEmoji: string
  countryBadge: string | null
  coins: string
}

interface CurrentUser {
  rank: number
  coins: string
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  currentUser: CurrentUser | null
}

interface MonthlyPrize {
  rank: number
  coins: number
}

interface MonthlyLeaderboardResponse {
  month: string
  leaderboard: LeaderboardEntry[]
  prizes: MonthlyPrize[]
  countdownMs: number
}

export default function Leaderboard() {
  const { session, user } = useAuth()
  const { formatAmount } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{
    countryCode?: string | null
  } | null>(null)
  const [data, setData] = useState<LeaderboardResponse>({
    leaderboard: [],
    currentUser: null,
  })
  const [monthly, setMonthly] = useState<MonthlyLeaderboardResponse | null>(
    null,
  )
  const [countdownMs, setCountdownMs] = useState(0)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const token = session?.access_token
      if (!token) {
        setLoading(false)
        return
      }

      const [res, monthlyRes, profileRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${API_BASE_URL}/api/leaderboard/monthly?userId=${encodeURIComponent(user?.id || '')}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (res.ok) {
        const leaderboardData = await res.json()
        setData(leaderboardData)
      }

      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json()
        setMonthly(monthlyData)
        setCountdownMs(monthlyData.countdownMs || 0)
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdownMs((value) => (value > 0 ? Math.max(0, value - 1000) : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const formatCountdown = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `${rank}.`
    }
  }

  const formatCoins = (coins: string) => {
    return parseInt(coins).toLocaleString()
  }

  const formatCoinsLocal = (coins: string) => {
    const numeric = Number(coins || 0)
    return formatAmount(numeric / 100)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner
          size="large"
          withLogo={true}
          text="Loading Leaderboard..."
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
      <p className="text-sm text-gray-400 mb-6">
        Showing rankings for your region:{' '}
        {profile?.countryCode ? profile.countryCode : 'Global'}
      </p>

      {monthly && (
        <Card className="mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">
                Monthly Competition ({monthly.month})
              </p>
              <p className="text-white font-semibold">
                Time left: {formatCountdown(countdownMs)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {monthly.prizes.map((prize) => (
                <div
                  key={prize.rank}
                  className="rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-3"
                >
                  <p className="text-xs text-gray-400">
                    Rank #{prize.rank} Prize
                  </p>
                  <p className="text-yellow-400 font-bold">
                    {prize.coins.toLocaleString()} AD COINS
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatAmount(prize.coins / 100)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {data.leaderboard.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-xl text-white mb-2">
              Be the first to earn coins!
            </p>
            <p className="text-gray-400">
              Start watching ads to appear on the leaderboard
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {data.leaderboard.map((entry) => (
              <Card key={entry.userId}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold min-w-[60px]">
                      {getRankEmoji(entry.rank)}
                    </span>
                    <span className="text-2xl">{entry.avatarEmoji}</span>
                    <div>
                      <p className="text-white font-semibold">
                        {entry.displayName}{' '}
                        {entry.countryBadge && entry.countryBadge}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <p className="text-yellow-500 font-bold text-lg">
                        {formatCoins(entry.coins)}
                      </p>
                      <img
                        src="/images/branding/Adcoin small 128x128.png"
                        alt="AdCoins"
                        className="w-6 h-6 inline"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatCoinsLocal(entry.coins)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {data.currentUser && (
            <Card className="border-2 border-blue-500">
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-1">Your Rank</p>
                <p className="text-white text-2xl font-bold">
                  #{data.currentUser.rank}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-yellow-500 text-lg">
                    {formatCoins(data.currentUser.coins)}
                  </p>
                  <img
                    src="/images/branding/Adcoin medium 256x256.png"
                    alt="Your AdCoins balance"
                    className="w-8 h-8"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatCoinsLocal(data.currentUser.coins)}
                </p>
                <p className="text-green-400 text-sm mt-2">Keep going! 💪</p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
