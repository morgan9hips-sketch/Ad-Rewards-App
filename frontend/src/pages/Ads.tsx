import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import VideoCapProgress from '../components/VideoCapProgress'
import InterstitialPrompt from '../components/InterstitialPrompt'
import RewardDisclosure from '../components/RewardDisclosure'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import admobService from '../services/admobService'

interface VideoCapStatus {
  tier: string
  dailyLimit: number
  videosWatched: number
  forcedAdsWatched: number
  remaining: number
  canWatchVideo: boolean
  needsInterstitial: boolean
  display: {
    currentProgress: string
    nextMilestone: string
    resetTime: string
  }
}

export default function Ads() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [videoCapStatus, setVideoCapStatus] = useState<VideoCapStatus | null>(
    null,
  )
  const [watching, setWatching] = useState(false)
  const [showingInterstitial, setShowingInterstitial] = useState(false)

  useEffect(() => {
    initializeAdMob()
    fetchVideoCapStatus()
  }, [])

  const initializeAdMob = async () => {
    try {
      await admobService.initialize()
    } catch (error) {
      console.error('Failed to initialize AdMob:', error)
    }
  }

  const fetchVideoCapStatus = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const API_URL = API_BASE_URL
      const res = await fetch(`${API_URL}/api/videos/daily-cap`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setVideoCapStatus(data)
      }
    } catch (error) {
      console.error('Error fetching video cap status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWatchRewardedVideo = async () => {
    if (!videoCapStatus?.canWatchVideo) return

    setWatching(true)
    try {
      // Load and show rewarded ad
      await admobService.loadRewardedAd()

      await admobService.showRewardedAd(
        async (reward) => {
          console.log('Rewarded:', reward)
          // Send impression data to backend
          await trackAdCompletion('rewarded')
        },
        () => {
          console.log('Ad closed')
          setWatching(false)
          // Refresh video cap status
          fetchVideoCapStatus()
        },
        (error) => {
          console.error('Ad failed:', error)
          setWatching(false)
        },
      )
    } catch (error) {
      console.error('Error showing rewarded video:', error)
      setWatching(false)
    }
  }

  const handleWatchInterstitial = async () => {
    setShowingInterstitial(true)
    try {
      // Load and show interstitial ad
      await admobService.loadInterstitialAd()

      await admobService.showInterstitialAd(
        async () => {
          console.log('Interstitial closed')
          // Record interstitial watch
          await recordInterstitialWatch()
          setShowingInterstitial(false)
          // Refresh video cap status
          fetchVideoCapStatus()
        },
        (error) => {
          console.error('Interstitial failed:', error)
          setShowingInterstitial(false)
        },
      )
    } catch (error) {
      console.error('Error showing interstitial:', error)
      setShowingInterstitial(false)
    }
  }

  const trackAdCompletion = async (adType: 'rewarded' | 'interstitial') => {
    try {
      const token = session?.access_token
      if (!token) return

      const API_URL = API_BASE_URL
      const impressionData = admobService.generateImpressionData(adType)

      // Track ad completion
      await fetch(`${API_URL}/api/ads/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adUnitId:
            adType === 'rewarded'
              ? import.meta.env.VITE_ADMOB_REWARDED_ID
              : import.meta.env.VITE_ADMOB_INTERSTITIAL_ID,
          watchedSeconds: adType === 'rewarded' ? 30 : 15,
          ...impressionData,
        }),
      })

      // Track impression for revenue tracking
      await fetch(`${API_URL}/api/ads/track-impression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adType,
          adUnitId:
            adType === 'rewarded'
              ? import.meta.env.VITE_ADMOB_REWARDED_ID
              : import.meta.env.VITE_ADMOB_INTERSTITIAL_ID,
          revenueUsd: impressionData.estimatedEarnings,
          country: impressionData.countryCode,
          currency: impressionData.currency,
        }),
      })

      // Record video watch
      await fetch(`${API_URL}/api/videos/watch-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adType }),
      })
    } catch (error) {
      console.error('Error tracking ad completion:', error)
    }
  }

  const recordInterstitialWatch = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const API_URL = API_BASE_URL
      await fetch(`${API_URL}/api/videos/watch-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adType: 'interstitial' }),
      })
    } catch (error) {
      console.error('Error recording interstitial watch:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!videoCapStatus) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <h1 className="text-3xl font-bold text-white mb-6">Watch Ads 📺</h1>
        <Card>
          <p className="text-gray-400">
            Unable to load video status. Please try again.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-32">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">
          Earn Rewards 💰
        </h1>
        <RewardDisclosure />
      </div>

      {/* Video cap progress */}
      <VideoCapProgress
        videosWatched={videoCapStatus.videosWatched}
        dailyLimit={videoCapStatus.dailyLimit}
        tier={videoCapStatus.tier}
        resetTime={videoCapStatus.display.resetTime}
        needsInterstitial={videoCapStatus.needsInterstitial}
      />

      {/* Interstitial prompt for Free tier */}
      {videoCapStatus.needsInterstitial && (
        <div className="mb-4">
          <InterstitialPrompt
            onWatchAd={handleWatchInterstitial}
            loading={showingInterstitial}
          />
        </div>
      )}

      {/* Rewarded video card */}
      <Card>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            High-Reward Session
          </h2>
          <p className="text-gray-400 mb-6">Earn up to 100 AdCoins by completing this session</p>

          <div className="bg-gray-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <img
                    src="/images/branding/Adcoin medium 256x256.png"
                    alt="AdCoins"
                    className="w-10 h-10"
                  />
                  <div className="text-yellow-400 font-bold text-2xl">100</div>
                </div>
                <div className="text-gray-400 text-sm">Coins</div>
              </div>
              <div className="text-gray-500 text-xl">+</div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-2xl">85%</div>
                <div className="text-gray-400 text-sm">Revenue Share</div>
              </div>
            </div>
          </div>

          {videoCapStatus.remaining === 0 ? (
            <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
              <p className="text-red-400">
                🚫 Daily limit reached. Come back tomorrow!
              </p>
            </div>
          ) : videoCapStatus.needsInterstitial ? (
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
              <p className="text-yellow-400">
                ⚠️ Watch the interstitial ad above first
              </p>
            </div>
          ) : (
            <Button
              onClick={handleWatchRewardedVideo}
              disabled={watching || !videoCapStatus.canWatchVideo}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {watching ? 'Loading Session...' : 'Start High-Reward Session'}
            </Button>
          )}
        </div>
      </Card>

      {/* Info card */}
      <Card className="mt-4">
        <h3 className="text-lg font-semibold text-white mb-3">How it works</h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">1.</span>
            <span>Start a high-reward session by clicking the button above</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">2.</span>
            <span>Complete the session activity (usually 15-30 seconds)</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">3.</span>
            <span>Earn up to 100 AdCoins for session completion</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">4.</span>
            <span>AdCoins convert to cash monthly based on platform revenue</span>
          </li>
        </ul>
      </Card>

      {/* Upgrade prompt for Bronze users */}
      {videoCapStatus.tier === 'Bronze' && (
        <Card className="mt-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-600/50">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              ⭐ Upgrade to Premium
            </h3>
            <p className="text-gray-300 mb-4">
              Remove forced interstitial ads and watch more videos per day!
            </p>
            <Button
              onClick={() => navigate('/subscriptions')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              View Plans
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
