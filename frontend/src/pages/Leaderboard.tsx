import { useState, useEffect } from 'react'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'

interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarEmoji: string
  countryBadge?: string | null
  countryFlag?: string
  countryName?: string | null
  coins: string
  isCurrentUser?: boolean
}

interface CurrentUser {
  rank: number
  coins: string
}

interface PoolStats {
  countryCode: string
  month: string
  totalRevenueUsd: string
  totalUserShareUsd: string
  totalCoinsIssued: number
  conversionRate: string
  adCount: number
}

interface RegionalData {
  country: string | null
  countryName: string | null
  countryFlag: string
  leaderboard: LeaderboardEntry[]
  currentUser: CurrentUser | null
  poolStats: PoolStats | null
}

interface GlobalData {
  leaderboard: LeaderboardEntry[]
  currentUser: CurrentUser | null
  pagination: { page: number; perPage: number; total: number; totalPages: number }
}

type ViewMode = 'regional' | 'global'

export default function Leaderboard() {
  const { session, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('regional')
  const [regionalData, setRegionalData] = useState<RegionalData | null>(null)
  const [globalData, setGlobalData] = useState<GlobalData | null>(null)

  useEffect(() => {
    fetchLeaderboard(view)
  }, [view])

  const fetchLeaderboard = async (mode: ViewMode) => {
    setLoading(true)
    try {
      const token = session?.access_token
      if (!token) { setLoading(false); return }

      const endpoint =
        mode === 'regional'
          ? `${API_BASE_URL}/api/leaderboard/regional`
          : `${API_BASE_URL}/api/leaderboard/global`

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        if (mode === 'regional') setRegionalData(data)
        else setGlobalData(data)
      } else {
        // Fallback to legacy endpoint
        const legacyRes = await fetch(`${API_BASE_URL}/api/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (legacyRes.ok) {
          const data = await legacyRes.json()
          if (mode === 'regional') {
            setRegionalData({
              country: null,
              countryName: null,
              countryFlag: '🌍',
              leaderboard: data.leaderboard,
              currentUser: data.currentUser,
              poolStats: null,
            })
          } else {
            setGlobalData({
              leaderboard: data.leaderboard,
              currentUser: data.currentUser,
              pagination: { page: 1, perPage: 100, total: data.leaderboard.length, totalPages: 1 },
            })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}.`
  }

  const formatCoins = (coins: string) => parseInt(coins).toLocaleString()

  const currentUserId = (user as { id?: string })?.id || ''

  const entries = view === 'regional'
    ? (regionalData?.leaderboard ?? [])
    : (globalData?.leaderboard ?? [])
  const currentUser = view === 'regional' ? regionalData?.currentUser : globalData?.currentUser

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-4">🏆 TOP EARNERS</h1>

      {/* Regional / Global toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('regional')}
          className={`px-5 py-2 rounded-full font-semibold transition-all ${
            view === 'regional'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {regionalData?.countryFlag || '🌍'} Regional
        </button>
        <button
          onClick={() => setView('global')}
          className={`px-5 py-2 rounded-full font-semibold transition-all ${
            view === 'global'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🌐 Global
        </button>
      </div>

      {/* Regional header */}
      {view === 'regional' && regionalData?.countryName && (
        <Card className="mb-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-gray-400 text-sm">Regional Leaderboard</p>
              <p className="text-white font-bold text-lg">
                {regionalData.countryFlag} {regionalData.countryName}
              </p>
            </div>
            {regionalData.poolStats && (
              <div className="text-right text-sm">
                <p className="text-gray-400">
                  Pool (this month):{' '}
                  <span className="text-green-400 font-semibold">
                    ${parseFloat(regionalData.poolStats.totalUserShareUsd).toFixed(2)} USD
                  </span>
                </p>
                <p className="text-gray-500">
                  Rate: {parseFloat(regionalData.poolStats.conversionRate).toExponential(2)} USD/coin
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner size="large" />
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-xl text-white mb-2">Be the first to earn coins!</p>
            <p className="text-gray-400">Start watching ads to appear on the leaderboard</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {entries.map((entry) => {
              const isMe = entry.isCurrentUser || entry.userId === currentUserId
              return (
                <Card
                  key={entry.userId}
                  className={isMe ? 'border-2 border-yellow-500/70 bg-yellow-900/10' : ''}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold min-w-[60px]">
                        {getRankEmoji(entry.rank)}
                      </span>
                      <span className="text-2xl">{entry.avatarEmoji}</span>
                      <div>
                        <p className="text-white font-semibold flex items-center gap-2">
                          {entry.displayName}
                          {isMe && (
                            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">
                              You
                            </span>
                          )}
                        </p>
                        {(entry.countryFlag || entry.countryBadge) && (
                          <p className="text-gray-400 text-xs">
                            {entry.countryFlag || entry.countryBadge}
                            {entry.countryName && ` ${entry.countryName}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <p className="text-yellow-500 font-bold text-lg">{formatCoins(entry.coins)}</p>
                        <img
                          src="/images/branding/Adcoin small 128x128.png"
                          alt="AdCoins"
                          className="w-6 h-6 inline"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {currentUser && (
            <Card className="border-2 border-blue-500">
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-1">Your Rank</p>
                <p className="text-white text-2xl font-bold">#{currentUser.rank}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-yellow-500 text-lg">{formatCoins(currentUser.coins)}</p>
                  <img
                    src="/images/branding/Adcoin medium 256x256.png"
                    alt="Your AdCoins balance"
                    className="w-8 h-8"
                  />
                </div>
                <p className="text-green-400 text-sm mt-2">Keep going! 💪</p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
