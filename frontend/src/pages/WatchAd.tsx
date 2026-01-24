import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import ProgressBar from '../components/ProgressBar'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'

export default function WatchAd() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [watching, setWatching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)

  const ad = {
    id: Number(id),
    title: 'AdiFy Video Content',
    videoUrl: 'https://example.com/video.mp4',
    durationSeconds: 30,
    rewardCents: 5,
  }

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  const startWatching = () => {
    setWatching(true)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= ad.durationSeconds) {
          clearInterval(interval)
          completeAdView()
          return ad.durationSeconds
        }
        return prev + 1
      })
    }, 1000)
  }

  const completeAdView = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/ads/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adUnitId: 'prod-ad-unit',
          watchedSeconds: ad.durationSeconds,
          admobImpressionId: `adify-${Date.now()}`,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCoinsEarned(data.coinsEarned)
        setTotalCoins(parseInt(data.totalCoins))
      }
    } catch (error) {
      console.error('Error completing ad:', error)
    } finally {
      setCompleted(true)
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
      <h1 className="text-3xl font-bold text-white mb-6">{ad.title}</h1>

      <Card className="mb-6">
        <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
          {!watching && !completed && (
            <div className="text-center">
              <div className="text-6xl mb-4">▶️</div>
              <Button onClick={startWatching}>Start Watching</Button>
            </div>
          )}
          {watching && !completed && (
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">📺</div>
              <p className="text-white text-lg">Ad is playing...</p>
            </div>
          )}
          {completed && (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-white text-lg">Ad completed!</p>
            </div>
          )}
        </div>

        {watching && (
          <ProgressBar
            progress={progress}
            max={ad.durationSeconds}
            label="Progress"
            showLabel={true}
          />
        )}
      </Card>

      {completed && (
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              🎉 You earned {coinsEarned} Coins!
            </h2>
            <div className="bg-gray-800 p-4 rounded-lg my-4">
              <p className="text-gray-400 text-sm mb-2">Total Coins:</p>
              <p className="text-4xl font-bold text-yellow-500">
                {totalCoins.toLocaleString()} 🪙
              </p>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              💡 Your coins will convert to cash when we receive ad revenue
              (monthly)
            </p>
            <Button onClick={claimReward}>Continue to Dashboard</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
