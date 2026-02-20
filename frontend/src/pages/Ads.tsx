import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Card'

declare global {
  interface Window {
    monetag?: {
      push: (config: Record<string, unknown>) => void
    }
  }
}

export default function WatchAd() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const [stage, setStage] = useState<'opt-in' | 'loading' | 'complete'>(
    'opt-in',
  )
  const [adCompleted, setAdCompleted] = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [error, setError] = useState('')

  // DEBUG LOGGING
  useEffect(() => {
    console.log('🔍 WatchAd - User:', user)
    console.log('🔍 WatchAd - Session:', session)
    console.log('🔍 WatchAd - Access Token:', session?.access_token)
  }, [user, session])

  const handleAdComplete = useCallback(async () => {
    if (adCompleted) return

    setAdCompleted(true)

    try {
      const token = session?.access_token

      console.log('🔍 DEBUG - Session:', session)
      console.log('🔍 DEBUG - Token:', token)
      console.log('🔍 DEBUG - User:', user)

      if (!token) {
        setError('Not authenticated')
        setStage('complete')
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ads/complete`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adUnitId: `monetag-vignette-${id}`,
            watchedSeconds: 30,
            admobImpressionId: `monetag-${Date.now()}`,
          }),
        },
      )

      if (response.ok) {
        const data = await response.json()
        setCoinsEarned(data.coinsEarned || 100)
        setStage('complete')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to process ad completion')
        setStage('complete')
      }
    } catch (err) {
      console.error('Error completing ad:', err)
      setError('Network error. Please try again.')
      setStage('complete')
    }
  }, [adCompleted, id, session, user])

  useEffect(() => {
    let timeout: number
    if (stage === 'loading') {
      timeout = window.setTimeout(() => {
        if (!adCompleted) {
          handleAdComplete()
        }
      }, 35000)
    }
    return () => {
      if (timeout) window.clearTimeout(timeout)
    }
  }, [stage, adCompleted, handleAdComplete])

  const handleOptIn = async () => {
    setStage('loading')

    if (window.monetag) {
      try {
        window.monetag.push({
          vignette: {
            key: 'YOUR_VIGNETTE_KEY_HERE',
            onComplete: () => {
              console.log('MonetTag ad completed')
              handleAdComplete()
            },
            onSkip: () => {
              console.log('MonetTag ad skipped')
              handleAdComplete()
            },
            onError: (err: Error) => {
              console.error('MonetTag ad error:', err)
              handleAdComplete()
            },
          },
        })
      } catch (err) {
        console.error('Error triggering MonetTag:', err)
        window.setTimeout(() => handleAdComplete(), 5000)
      }
    } else {
      window.setTimeout(() => handleAdComplete(), 5000)
    }
  }

  const handleMaybeLater = () => {
    navigate('/ads')
  }

  const handleBackToAds = () => {
    navigate('/ads')
  }

  const currentBalance = (user as { coinsBalance?: number })?.coinsBalance || 0

  if (stage === 'opt-in') {
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
                  <span className="text-5xl font-bold text-yellow-400">
                    100
                  </span>
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
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (stage === 'loading') {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50">
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📺</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ad is loading...
              </h2>
              <p className="text-gray-300 mb-8">
                This may open in a new window
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
              <p className="text-gray-400 text-sm mt-6">
                If the ad doesn't load, you'll be redirected automatically
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {error ? (
          <Card className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border-2 border-red-500/50">
            <div className="text-center py-12">
              <div className="text-6xl mb-6">⚠️</div>
              <h2 className="text-3xl font-bold text-red-400 mb-4">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-300 mb-8">{error}</p>
              <button
                onClick={handleBackToAds}
                className="px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-500 transition-all"
              >
                Back to Ads
              </button>
            </div>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50">
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-green-400 mb-4">
                Congratulations!
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                You've earned{' '}
                <span className="text-yellow-400 font-bold text-2xl">
                  {coinsEarned}
                </span>{' '}
                AdCoins!
              </p>

              <div className="bg-green-900/30 rounded-lg p-6 mb-8 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3">
                  <img
                    src="/images/branding/Adcoin-large-512x512.png"
                    alt="AdCoin"
                    className="w-16 h-16 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce"
                  />
                  <span className="text-5xl font-bold text-yellow-400">
                    +{coinsEarned}
                  </span>
                </div>
              </div>

              <p className="text-gray-400 mb-8">
                Your new balance:{' '}
                <span className="text-white font-semibold">
                  {currentBalance + coinsEarned}
                </span>{' '}
                AdCoins
              </p>

              <button
                onClick={handleBackToAds}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg"
              >
                Watch Another Ad
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
