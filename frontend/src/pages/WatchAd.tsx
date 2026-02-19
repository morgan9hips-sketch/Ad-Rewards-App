import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import MonetTagAd from '../components/MonetTagAd'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'

export default function WatchAd() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [optedIn, setOptedIn] = useState(false)
  const [watching, setWatching] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)

  const MONETAG_ZONES = {
    vignette: '10618701',
    onclick: '10618699',
  }

  const handleOptIn = () => {
    setOptedIn(true)
    startWatching()
  }

  const startWatching = () => {
    setWatching(true)
  }

  const handleAdComplete = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      setLoading(true)

      const res = await fetch(`${API_BASE_URL}/api/ads/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adUnitId: 'monetag-vignette',
          watchedSeconds: 30,
          admobImpressionId: `monetag-${Date.now()}`,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCoinsEarned(data.coinsEarned)
        setTotalCoins(parseInt(data.totalCoins))
        setCompleted(true)
      }
    } catch (error) {
      console.error('Error completing ad:', error)
    } finally {
      setLoading(false)
      setWatching(false)
    }
  }

  const claimReward = () => {
    navigate('/dashboard')
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
      <h1 className="text-3xl font-bold text-white mb-6">Watch Ads 📺</h1>

      {!optedIn && !completed && (
        <Card>
          <div className="text-center p-8">
            <div className="text-6xl mb-6">🎁</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Earn 100 AdCoins!
            </h2>
            <p className="text-gray-400 mb-6 text-lg">
              Watch a short ad and earn instant rewards
            </p>

            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <img
                  src="/images/branding/Adcoin large 512x512.png"
                  alt="100 AdCoins"
                  className="w-16 h-16"
                />
                <p className="text-5xl font-bold text-yellow-500">100</p>
              </div>
              <p className="text-white font-semibold">AdCoins Reward</p>
            </div>

            <div className="space-y-3 text-left mb-8 max-w-sm mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <p className="text-gray-300">Ad duration: ~30 seconds</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <p className="text-gray-300">Instant coin reward</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <p className="text-gray-300">Converts to real cash monthly</p>
              </div>
            </div>

            <Button
              onClick={handleOptIn}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-xl py-4 mb-3"
            >
              Yes, Show Me the Ad!
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </Card>
      )}

      {watching && !completed && (
        <Card className="mb-6">
          <div className="aspect-video bg-gray-900 rounded-lg mb-4">
            <MonetTagAd
              zoneId={MONETAG_ZONES.vignette}
              onAdComplete={handleAdComplete}
            />
          </div>
          <p className="text-gray-400 text-center text-sm mb-4">
            Please wait while the ad loads... This may open in a new window.
          </p>
          <Button
            onClick={handleAdComplete}
            variant="secondary"
            className="w-full"
          >
            I watched the ad - Claim Reward
          </Button>
        </Card>
      )}

      {completed && (
        <Card>
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Congratulations!
            </h2>

            <div className="flex items-center justify-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">You earned</h3>
              <img
                src="/images/branding/Adcoin large 512x512.png"
                alt={`${coinsEarned} AdCoins earned`}
                className="w-20 h-20"
              />
              <h3 className="text-2xl font-bold text-yellow-500">
                {coinsEarned}!
              </h3>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg my-6">
              <p className="text-gray-400 text-sm mb-2">Total Balance:</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-5xl font-bold text-yellow-500">
                  {totalCoins.toLocaleString()}
                </p>
                <img
                  src="/images/branding/Adcoin medium 256x256.png"
                  alt="Total AdCoins balance"
                  className="w-14 h-14"
                />
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              💡 Your coins will convert to cash when we receive ad revenue
              (monthly)
            </p>

            <Button onClick={claimReward} className="w-full text-lg py-4">
              Continue to Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
