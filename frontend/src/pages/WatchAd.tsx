import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import ProgressBar from '../components/ProgressBar'
import LoadingSpinner from '../components/LoadingSpinner'

export default function WatchAd() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [watching, setWatching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)

  const ad = {
    id: Number(id),
    title: 'Product Demo - New Tech Gadget',
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
          setCompleted(true)
          return ad.durationSeconds
        }
        return prev + 1
      })
    }, 1000)
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
              Congratulations! 🎉
            </h2>
            <p className="text-gray-400 mb-4">
              You've earned <span className="text-green-500 font-bold">${(ad.rewardCents / 100).toFixed(2)}</span>
            </p>
            <Button onClick={claimReward}>Claim Reward</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
