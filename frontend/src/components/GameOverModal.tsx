import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import CooldownTimer from './CooldownTimer'
import Button from './Button'

interface GameOverModalProps {
  sessionId: string
  score: number
  completed: boolean
  onRetryWithVideo: () => void
  onRetryWithWait: () => void
  onExit: () => void
}

export default function GameOverModal({
  sessionId,
  score,
  completed,
  onRetryWithVideo, // eslint-disable-line @typescript-eslint/no-unused-vars
  onRetryWithWait,
  onExit,
}: GameOverModalProps) {
  const { session } = useAuth()
  const [showWaitTimer, setShowWaitTimer] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Note: onRetryWithVideo is defined for future AdMob integration
  // @ts-ignore - Will be used when AdMob is integrated
  const _onRetryWithVideo = onRetryWithVideo

  const handleWatchVideo = async () => {
    try {
      setProcessing(true)

      // TODO: Integrate AdMob Rewarded Ad here
      // You need to:
      // 1. Import AdMob from Capacitor: import { AdMob } from '@capacitor-community/admob'
      // 2. Call AdMob.showRewardedVideo()
      // 3. Get the real admobImpressionId from the ad callback
      // For now, this will fail on backend validation without real AdMob integration

      const token = session?.access_token
      if (!token) {
        console.error('No authentication token')
        setProcessing(false)
        return
      }

      // This requires real AdMob integration - see ADMOB_IMPLEMENTATION_COMPLETE.md
      console.error('AdMob integration required for retry video feature')
      alert(
        'Ad viewing feature requires AdMob setup. Please complete mobile app integration.',
      )
      setProcessing(false)
      return

      // UNCOMMENT AFTER ADMOB INTEGRATION:
      // const adResult = await AdMob.showRewardedVideo({ adUnitId: 'your-ad-unit-id' })
      // const admobImpressionId = adResult.impressionId
      //
      // const res = await fetch(`${API_BASE_URL}/api/game/retry-video`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     sessionId,
      //     admobImpressionId,
      //   }),
      // })
      //
      // if (res.ok) {
      //   const data = await res.json()
      //   alert(`Success! You earned ${data.coinsEarned} coins! You can continue playing.`)
      //   onRetryWithVideo()
      // } else {
      //   const error = await res.json()
      //   alert(`Failed to process video: ${error.error}`)
      // }
    } catch (error) {
      console.error('Error processing video:', error)
      alert('Failed to process video. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleWaitOption = () => {
    setShowWaitTimer(true)
  }

  const handleCooldownComplete = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/game/retry-wait`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      if (res.ok) {
        alert('Free retry granted! Continue playing.')
        onRetryWithWait()
      } else {
        const error = await res.json()
        alert(`Failed to grant retry: ${error.error}`)
      }
    } catch (error) {
      console.error('Error granting retry:', error)
      alert('Failed to grant retry. Please try again.')
    }
  }

  if (showWaitTimer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            ⏰ Waiting Period
          </h2>
          <CooldownTimer
            endTime={new Date(Date.now() + 5 * 60 * 1000)}
            onComplete={handleCooldownComplete}
          />
          <div className="mt-6">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowWaitTimer(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {completed ? '🎉 GAME COMPLETE!' : '💀 GAME OVER!'}
          </h2>
          <div className="text-gray-300 text-lg">
            Your Score:{' '}
            <span className="text-yellow-500 font-bold">
              {score.toLocaleString()}
            </span>
          </div>
          {completed && (
            <div className="mt-2 text-green-400 font-semibold flex items-center justify-center gap-2">
              <span>You earned</span>
              <img
                src="/images/branding/Adcoin small 128x128.png"
                alt="10 AdCoins earned"
                className="w-6 h-6 inline"
              />
              <span>10!</span>
            </div>
          )}
        </div>

        {!completed && (
          <div className="space-y-4">
            <div className="text-center text-gray-400 mb-4">
              Choose to continue:
            </div>

            {/* Watch Video Option */}
            <button
              onClick={handleWatchVideo}
              disabled={processing}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span className="text-xl">📺</span>
                <span>Watch Video (Get 10 Coins)</span>
              </div>
              <div className="text-sm opacity-90">
                Instant retry + earn coins
              </div>
            </button>

            {/* Wait 5 Minutes Option */}
            <button
              onClick={handleWaitOption}
              disabled={processing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span className="text-xl">⏰</span>
                <span>Wait 5 Minutes (Free)</span>
              </div>
              <div className="text-sm opacity-90">No coins, just patience</div>
            </button>

            <div className="border-t border-gray-700 pt-4">
              <Button variant="secondary" fullWidth onClick={onExit}>
                Exit Game
              </Button>
            </div>
          </div>
        )}

        {completed && (
          <div className="mt-6">
            <Button fullWidth onClick={onExit}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
