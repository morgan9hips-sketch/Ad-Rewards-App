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

export default function Leaderboard() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<LeaderboardResponse>({ leaderboard: [], currentUser: null })

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

      const res = await fetch(`${API_BASE_URL}/api/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const leaderboardData = await res.json()
        setData(leaderboardData)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `${rank}.`
    }
  }

  const formatCoins = (coins: string) => {
    return parseInt(coins).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">🏆 TOP EARNERS</h1>

      {data.leaderboard.length === 0 ? (
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
                        {entry.displayName} {entry.countryBadge && entry.countryBadge}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-500 font-bold text-lg">
                      {formatCoins(entry.coins)} coins
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
                <p className="text-yellow-500 text-lg mt-2">
                  {formatCoins(data.currentUser.coins)} coins
                </p>
                <p className="text-green-400 text-sm mt-2">
                  Keep going! 💪
                </p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
