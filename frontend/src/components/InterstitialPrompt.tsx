import Button from './Button'

interface InterstitialPromptProps {
  onWatchAd: () => void
  loading?: boolean
}

export default function InterstitialPrompt({ onWatchAd, loading = false }: InterstitialPromptProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-600/50 rounded-lg p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">📺</div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Unlock More Videos!
        </h3>
        <p className="text-gray-300 mb-4">
          Watch a quick ad to unlock 2 more rewarded videos
        </p>
        
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-lg">1</div>
              <div className="text-gray-400">Ad</div>
            </div>
            <div className="text-gray-500 text-2xl">→</div>
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">2</div>
              <div className="text-gray-400">Videos</div>
            </div>
          </div>
        </div>

        <Button
          onClick={onWatchAd}
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          {loading ? 'Loading Ad...' : 'Watch Ad Now'}
        </Button>

        <p className="text-xs text-gray-500 mt-3">
          Free tier users help support the platform by watching occasional ads
        </p>
      </div>
    </div>
  )
}
