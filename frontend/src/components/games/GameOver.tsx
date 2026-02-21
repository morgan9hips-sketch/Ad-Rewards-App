interface GameOverProps {
  score: number
  onPlayAgain: () => void
  onExit: () => void
}

export default function GameOver({ score, onPlayAgain, onExit }: GameOverProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/90 border border-gray-700 rounded-2xl p-8 text-center w-72 shadow-2xl">
        <div className="text-5xl mb-3">💀</div>
        <h2 className="text-2xl font-bold text-white mb-1">Game Over</h2>
        <p className="text-gray-400 mb-5 text-sm">Better luck next time!</p>

        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Score</p>
          <p className="text-4xl font-bold text-yellow-400">{score}</p>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl mb-3 transition-colors"
        >
          ▶ Play Again
        </button>
        <button
          onClick={onExit}
          className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Back to Minigames
        </button>
      </div>
    </div>
  )
}
