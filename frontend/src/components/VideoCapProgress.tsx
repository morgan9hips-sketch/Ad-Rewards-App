interface VideoCapProgressProps {
  videosWatched: number
  dailyLimit: number
  tier: string
  resetTime: string
  needsInterstitial: boolean
}

export default function VideoCapProgress({
  videosWatched,
  dailyLimit,
  tier,
  resetTime,
  needsInterstitial,
}: VideoCapProgressProps) {
  const percentage = Math.min((videosWatched / dailyLimit) * 100, 100)
  const remaining = Math.max(0, dailyLimit - videosWatched)

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-white">Daily Progress</h3>
        <span className="text-sm text-gray-400">{tier} Tier</span>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="text-gray-300">
          Videos watched: <span className="font-bold text-white">{videosWatched}/{dailyLimit}</span>
        </span>
        <span className="text-gray-400">{resetTime}</span>
      </div>

      {/* Status message */}
      {needsInterstitial ? (
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 mt-2">
          <p className="text-yellow-400 text-sm flex items-center">
            <span className="mr-2">⚠️</span>
            Watch 1 ad to unlock 2 more videos
          </p>
        </div>
      ) : remaining > 0 ? (
        <p className="text-green-400 text-sm mt-2">
          🎉 {remaining} videos remaining today
        </p>
      ) : (
        <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3 mt-2">
          <p className="text-red-400 text-sm flex items-center">
            <span className="mr-2">🚫</span>
            Daily limit reached. Come back tomorrow!
          </p>
        </div>
      )}
    </div>
  )
}
