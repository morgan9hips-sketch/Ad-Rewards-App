import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Card'

export default function WatchAd() {
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const [error, setError] = useState('')

  const handleOptIn = async () => {
    const token = session?.access_token
    if (!token) {
      setError('Not authenticated. Please log in.')
      return
    }

    try {
      const { watchAd } = await import('../utils/watchAds')
      await watchAd(token)
    } catch (err) {
      console.error('Error triggering ad:', err)
      setError('Failed to load ad. Please try again.')
    }
  }

  const handleMaybeLater = () => {
    navigate('/ads')
  }

  const currentBalance = (user as { coinsBalance?: number })?.coinsBalance || 0

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Earn 100 AdCoins!
          </h1>
          <p className="text-gray-300 text-lg">
            Watch a short ad and earn instant rewards
          </p>
        </div>

        <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50">
          <div className="text-center py-8">
            <div className="bg-purple-900/50 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <img
                    src="/images/branding/Adcoin-large-512x512.png"
                    alt="AdCoin"
                    className="w-20 h-20 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl">▶️</span>
                  </div>
                </div>
                <span className="text-5xl font-bold text-yellow-400">100</span>
              </div>
              <p className="text-lg font-semibold text-purple-200">
                AdCoins Reward
              </p>
            </div>

            <div className="space-y-3 text-left max-w-md mx-auto mb-8">
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

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleOptIn}
                className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/50"
              >
                Yes, Show Me the Ad!
              </button>
              <button
                onClick={handleMaybeLater}
                className="w-full max-w-md px-8 py-3 bg-gray-700 text-gray-300 text-lg font-semibold rounded-lg hover:bg-gray-600 transition-all"
              >
                Maybe Later
              </button>
            </div>

            <div className="mt-6 text-gray-400">
              <p>
                Current balance:{' '}
                <span className="text-white font-semibold">
                  {currentBalance}
                </span>{' '}
                AdCoins
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
