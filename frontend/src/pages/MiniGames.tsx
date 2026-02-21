import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FlappyBird from '../components/games/FlappyBird'
import GameOver from '../components/games/GameOver'
import GameReward from '../components/games/GameReward'

type GameState = 'menu' | 'playing' | 'gameover'

export default function MiniGames() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState<GameState>('menu')
  const [score, setScore] = useState(0)
  const [gameKey, setGameKey] = useState(0)

  const handlePlay = () => {
    setScore(0)
    setGameKey((k) => k + 1)
    setGameState('playing')
  }

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore)
    setGameState('gameover')
  }, [])

  const handlePlayAgain = () => {
    handlePlay()
  }

  const handleExit = () => {
    setGameState('menu')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎮 Play &amp; Earn
          </h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {gameState === 'menu' && (
          <>
            {/* Coming soon banner */}
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-3 mb-6 text-center">
              <p className="text-yellow-400 text-sm font-medium">
                🚧 Phase 2 Coming Soon: Watch Ads to earn coins while playing!
              </p>
            </div>

            {/* Game card */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-2xl overflow-hidden shadow-xl">
              {/* Thumbnail */}
              <div className="relative h-44 bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center select-none">
                {/* Decorative pipes */}
                <div className="absolute left-8 top-0 w-12 h-20 bg-green-600 border-2 border-green-800 rounded-b-sm" />
                <div className="absolute left-8 bottom-0 w-12 h-16 bg-green-600 border-2 border-green-800 rounded-t-sm" />
                <div className="absolute right-16 top-0 w-12 h-28 bg-green-600 border-2 border-green-800 rounded-b-sm" />
                <div className="absolute right-16 bottom-0 w-12 h-10 bg-green-600 border-2 border-green-800 rounded-t-sm" />
                {/* Bird */}
                <div className="relative z-10 text-6xl animate-bounce">🐦</div>
                {/* Badge */}
                <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  FREE
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">Flappy Bird</h2>
                    <p className="text-gray-400 text-sm mt-0.5">
                      Tap to flap, avoid the pipes!
                    </p>
                  </div>
                  <span className="text-2xl">🐦</span>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded-full">
                    Arcade
                  </span>
                  <span className="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded-full">
                    High Score
                  </span>
                  <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                    Free to Play
                  </span>
                </div>

                {/* Phase 2 placeholder */}
                <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 mb-4 text-center">
                  <p className="text-gray-400 text-xs">
                    👀 <span className="text-gray-300 font-medium">Watch Ad to Play</span> — Coming in Phase 2
                  </p>
                </div>

                <button
                  onClick={handlePlay}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/40 active:scale-95"
                >
                  ▶ Play Now
                </button>
              </div>
            </div>
          </>
        )}

        {gameState === 'playing' && (
          <div className="relative">
            <FlappyBird
              key={gameKey}
              onGameOver={handleGameOver}
            />
          </div>
        )}

        {gameState === 'gameover' && (
          <>
            <GameReward score={score} />
            <GameOver score={score} onPlayAgain={handlePlayAgain} onExit={handleExit} />
          </>
        )}
      </div>
    </div>
  )
}
