import Card from './Card'
import ProgressBar from './ProgressBar'

interface TierProgressProps {
  currentTier: string
  adsWatched: number
  nextTierRequirement: number
  nextTier: string
}

const tierEmojis: Record<string, string> = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
  Diamond: '👑',
}

export default function TierProgress({
  currentTier,
  adsWatched,
  nextTierRequirement,
  nextTier,
}: TierProgressProps) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{tierEmojis[currentTier] || '🏅'}</span>
        <div>
          <h3 className="text-lg font-semibold text-white">{currentTier} Tier</h3>
          <p className="text-sm text-gray-400">
            {nextTier ? `Next: ${nextTier}` : 'Max tier reached!'}
          </p>
        </div>
      </div>
      {nextTier && (
        <ProgressBar
          progress={adsWatched}
          max={nextTierRequirement}
          label={`Progress to ${nextTier}`}
          color="bg-gradient-to-r from-blue-500 to-purple-600"
        />
      )}
    </Card>
  )
}
