import { useState, useEffect } from 'react'

interface CooldownTimerProps {
  endTime: Date
  onComplete: () => void
}

export default function CooldownTimer({ endTime, onComplete }: CooldownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const end = endTime.getTime()
      const remaining = Math.max(0, Math.floor((end - now) / 1000))

      setTimeRemaining(remaining)

      if (remaining === 0 && !completed) {
        setCompleted(true)
        onComplete()
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [endTime, onComplete, completed])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (completed) {
    return (
      <div className="text-center">
        <div className="text-3xl mb-4">✅</div>
        <div className="text-xl font-bold text-green-400 mb-2">
          Free Retry Granted!
        </div>
        <div className="text-gray-400">
          You can now continue playing
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="text-sm text-gray-400 mb-2">
        Free retry available in:
      </div>
      <div className="text-5xl font-bold text-white mb-4 font-mono">
        {formatTime(timeRemaining)}
      </div>
      <div className="bg-gray-700 rounded-full h-2 mb-4">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
          style={{
            width: `${100 - (timeRemaining / 300) * 100}%`,
          }}
        />
      </div>
      <div className="text-xs text-gray-500">
        Hang tight! Your free retry is almost ready.
      </div>
    </div>
  )
}
