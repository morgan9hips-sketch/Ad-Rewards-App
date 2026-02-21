interface GameRewardProps {
  score: number
}

/**
 * Placeholder component for future coin reward animation.
 * Will be activated in Phase 2 (monetization PR) after OGAds approval.
 */
export default function GameReward({ score }: GameRewardProps) {
  return (
    <div className="text-center py-4">
      <p className="text-gray-400 text-sm">
        🎉 Great run! You scored <span className="text-yellow-400 font-bold">{score}</span> points.
      </p>
      <p className="text-gray-500 text-xs mt-1">
        💰 Coin rewards coming soon in Phase 2!
      </p>
    </div>
  )
}
