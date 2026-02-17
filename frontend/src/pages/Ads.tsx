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
import monetagService from '../services/monetagService'

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

interface UserProfile {
  isBetaUser: boolean
  betaMultiplier: number
}

export default function Ads() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [videoCapStatus, setVideoCapStatus] = useState<VideoCapStatus | null>(
    null,
  )
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [watching, setWatching] = useState(false)
  const [showingInterstitial, setShowingInterstitial] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')

  useEffect(() => {
    fetchVideoCapStatus()
    fetchUserProfile()
  }, [])

  useEffect(() => {
    // Initialize Monetag OnClick after video cap status is loaded
    // This ensures the button is rendered
    if (session?.access_token && videoCapStatus) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        monetagService.initOnClickAd(
          'watch-ad-button',
          session.access_token!,
          (coins) => {
            setSuccessMessage(`🎉 You earned ${coins} coins!`)
            setTimeout(() => setSuccessMessage(''), 5000)
            fetchVideoCapStatus()
          },
          (error) => {
            console.error('OnClick error:', error)
          }
        )
      }, 100)
    }
  }, [session, videoCapStatus])

  const fetchUserProfile = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const API_URL = API_BASE_URL
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setUserProfile({
          isBetaUser: data.isBetaUser || false,
          betaMultiplier: data.betaMultiplier || 1.0,
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
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

  const handleWatchInterstitial = async () => {
    setShowingInterstitial(true)
    try {
      // For now, just simulate interstitial
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await recordInterstitialWatch()
      setShowingInterstitial(false)
      fetchVideoCapStatus()
    } catch (error) {
      console.error('Error showing interstitial:', error)
      setShowingInterstitial(false)
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

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 bg-green-900/30 border border-green-600/50 rounded-lg p-4">
          <p className="text-green-400 text-center font-semibold">
            {successMessage}
          </p>
        </div>
      )}

      {/* Video cap progress */}
      <VideoCapProgress
        videosWatched={videoCapStatus?.videosWatched || 0}
        dailyLimit={videoCapStatus?.dailyLimit || 0}
        tier={videoCapStatus?.tier || 'Free'}
        resetTime={videoCapStatus?.display.resetTime || ''}
        needsInterstitial={videoCapStatus?.needsInterstitial || false}
      />

      {/* Interstitial prompt for Free tier */}
      {videoCapStatus?.needsInterstitial && (
        <div className="mb-4">
          <InterstitialPrompt
            onWatchAd={handleWatchInterstitial}
            loading={showingInterstitial}
          />
        </div>
      )}

      {/* Rewarded video card - Monetag OnClick */}
      <Card>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            High-Reward Session
          </h2>
          <p className="text-gray-400 mb-6">Earn 100 AdCoins per session</p>

          {/* Beta bonus banner */}
          {userProfile?.isBetaUser && (
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-600/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🎉</span>
                <span className="text-xl font-bold text-purple-400">BETA BONUS</span>
              </div>
              <p className="text-gray-300 text-sm">
                You'll receive {userProfile.betaMultiplier}x cash value when revenue is distributed!
              </p>
            </div>
          )}

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

          {videoCapStatus?.remaining === 0 ? (
            <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
              <p className="text-red-400">
                🚫 Daily limit reached. Come back tomorrow!
              </p>
            </div>
          ) : videoCapStatus?.needsInterstitial ? (
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
              <p className="text-yellow-400">
                ⚠️ Watch the interstitial ad above first
              </p>
            </div>
          ) : (
            <Button
              id="watch-ad-button"
              disabled={watching || !videoCapStatus?.canWatchVideo}
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
            <span>Earn 100 AdCoins instantly for session completion</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">4.</span>
            <span>AdCoins convert to cash monthly based on platform revenue</span>
          </li>
          {userProfile?.isBetaUser && (
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">🎉</span>
              <span className="text-purple-400 font-semibold">
                As a beta user, your cash value will be multiplied by {userProfile.betaMultiplier}x!
              </span>
            </li>
          )}
        </ul>
      </Card>

      {/* Upgrade prompt for Bronze users */}
      {videoCapStatus?.tier === 'Bronze' && (
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
