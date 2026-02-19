import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Card'

export default function Ads() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dailyLimit, setDailyLimit] = useState({
    watched: 0,
    limit: 50,
    remaining: 50,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDailyLimit()
  }, [])

  const fetchDailyLimit = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ads/daily-limit`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setDailyLimit(data)
      }
    } catch (error) {
      console.error('Error fetching daily limit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWatchAd = () => {
    if (dailyLimit.remaining > 0) {
      navigate('/watch/1')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <h1 className="text-3xl font-bold text-white mb-6">Watch Ads 📺</h1>
        <Card>
          <p className="text-gray-400">Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Watch Ads 📺</h1>

      {/* Daily Limit Card */}
      <Card className="mb-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Daily Ad Limit
            </h3>
            <p className="text-gray-300">
              {dailyLimit.watched} / {dailyLimit.limit} ads watched today
            </p>
          </div>
          <div className="text-4xl font-bold text-purple-400">
            {dailyLimit.remaining}
          </div>
        </div>
        <div className="mt-4 bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
            style={{
              width: `${(dailyLimit.watched / dailyLimit.limit) * 100}%`,
            }}
          />
        </div>
      </Card>

      {/* Opt-In Ad Card */}
      {dailyLimit.remaining > 0 ? (
        <Card
          className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 hover:border-purple-400/70 transition-all cursor-pointer"
          onClick={handleWatchAd}
        >
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Earn 100 AdCoins!
            </h2>
            <p className="text-gray-300 mb-6">
              Watch a short ad and earn instant rewards
            </p>

            <div className="bg-purple-900/50 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-5xl">▶️</span>
                <span className="text-5xl font-bold text-yellow-400">100</span>
              </div>
              <p className="text-lg font-semibold text-purple-200">
                AdCoins Reward
              </p>
            </div>

            <div className="space-y-3 text-left max-w-md mx-auto mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Ad duration: ~30 seconds</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Instant coin reward</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Converts to real cash monthly</span>
              </div>
            </div>

            <button className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/50">
              Yes, Show Me the Ad!
            </button>
          </div>
        </Card>
      ) : (
        <Card className="bg-orange-900/20 border-orange-500/30">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-orange-400 mb-3">
              Daily Limit Reached
            </h2>
            <p className="text-gray-300">
              You've watched all {dailyLimit.limit} ads for today. Come back
              tomorrow!
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
