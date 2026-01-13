import { useState, useEffect } from 'react'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'

interface LeaderboardEntry {
  rank: number
  name: string
  earnings: number
  adsWatched: number
}

export default function Leaderboard() {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'alltime'>('week')

  useEffect(() => {
    setTimeout(() => {
      setEntries([
        { rank: 1, name: 'User123', earnings: 4520, adsWatched: 452 },
        { rank: 2, name: 'ProWatcher', earnings: 3980, adsWatched: 398 },
        { rank: 3, name: 'EarnMore', earnings: 3540, adsWatched: 354 },
        { rank: 4, name: 'AdKing', earnings: 3210, adsWatched: 321 },
        { rank: 5, name: 'RewardSeeker', earnings: 2890, adsWatched: 289 },
      ])
      setLoading(false)
    }, 1000)
  }, [timeframe])

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `${rank}.`
    }
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
      <h1 className="text-3xl font-bold text-white mb-6">Leaderboard 🏆</h1>

      <Card className="mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeframe === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('alltime')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeframe === 'alltime'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All Time
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.rank}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{getRankEmoji(entry.rank)}</span>
                <div>
                  <p className="text-white font-semibold">{entry.name}</p>
                  <p className="text-gray-400 text-sm">{entry.adsWatched} ads watched</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-500 font-bold text-lg">
                  ${(entry.earnings / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
