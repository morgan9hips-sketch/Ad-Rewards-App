import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FlappyBird from '../components/games/FlappyBird'
import Snake from '../components/games/Snake'
import Game2048 from '../components/games/Game2048'
import StackTower from '../components/games/StackTower'
import GameOver from '../components/games/GameOver'
import GameReward from '../components/games/GameReward'
import GameContainer from '../components/games/GameContainer'

type GameId = 'flappy' | 'snake' | '2048' | 'stacktower'
type GameState = 'menu' | 'playing' | 'gameover'

interface GameInfo {
  id: GameId
  title: string
  description: string
  icon: string
  tags: string[]
  previewBg: string
}

const GAMES: GameInfo[] = [
  {
    id: 'flappy',
    title: 'Flappy Bird',
    description: 'Tap to flap and dodge pipes!',
    icon: '🐦',
    tags: ['Arcade', 'High Score'],
    previewBg: 'from-sky-400 to-blue-600',
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'Eat apples and grow longer!',
    icon: '🐍',
    tags: ['Classic', 'High Score'],
    previewBg: 'from-green-800 to-gray-900',
  },
  {
    id: '2048',
    title: '2048',
    description: 'Merge tiles to reach 2048!',
    icon: '🔢',
    tags: ['Puzzle', 'Strategy'],
    previewBg: 'from-yellow-600 to-orange-700',
  },
  {
    id: 'stacktower',
    title: 'Stack Tower',
    description: 'Stack blocks as high as you can!',
    icon: '🏗️',
    tags: ['Arcade', 'Reflex'],
    previewBg: 'from-blue-900 to-indigo-950',
  },
]

export default function MiniGames() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState<GameState>('menu')
  const [activeGame, setActiveGame] = useState<GameId | null>(null)
  const [score, setScore] = useState(0)
  const [gameKey, setGameKey] = useState(0)

  const handlePlay = (id: GameId) => {
    setScore(0)
    setGameKey((k) => k + 1)
    setActiveGame(id)
    setGameState('playing')
  }

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore)
    setGameState('gameover')
  }, [])

  const handlePlayAgain = () => {
    if (!activeGame) return
    setScore(0)
    setGameKey((k) => k + 1)
    setGameState('playing')
  }

  const handleExit = () => {
    setActiveGame(null)
    setGameState('menu')
  }

  const activeGameInfo = GAMES.find((g) => g.id === activeGame)

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

            {/* Game grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GAMES.map((game) => (
                <div
                  key={game.id}
                  className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-2xl overflow-hidden shadow-xl hover:scale-[1.02] transition-transform"
                >
                  {/* Thumbnail */}
                  <div
                    className={`relative h-32 bg-gradient-to-br ${game.previewBg} flex items-center justify-center select-none`}
                  >
                    <span className="text-5xl">{game.icon}</span>
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      FREE
                    </div>
                  </div>

                  <div className="p-4">
                    <h2 className="text-lg font-bold text-white">{game.title}</h2>
                    <p className="text-gray-400 text-xs mt-0.5 mb-3">{game.description}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {game.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        Free to Play
                      </span>
                    </div>

                    {/* Phase 2 placeholder */}
                    <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-2 mb-3 text-center">
                      <p className="text-gray-400 text-xs">
                        👀 <span className="text-gray-300 font-medium">Watch Ad to Play</span> — Coming in Phase 2
                      </p>
                    </div>

                    <button
                      onClick={() => handlePlay(game.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/40 active:scale-95 text-sm"
                    >
                      ▶ Play Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {gameState === 'playing' && activeGame && (
          <GameContainer
            title={activeGameInfo?.title ?? 'Game'}
            onClose={handleExit}
          >
            {activeGame === 'flappy' && (
              <FlappyBird key={gameKey} onGameOver={handleGameOver} />
            )}
            {activeGame === 'snake' && (
              <Snake key={gameKey} onGameOver={handleGameOver} />
            )}
            {activeGame === '2048' && (
              <Game2048 key={gameKey} onGameOver={handleGameOver} />
            )}
            {activeGame === 'stacktower' && (
              <StackTower key={gameKey} onGameOver={handleGameOver} />
            )}
          </GameContainer>
        )}

        {gameState === 'gameover' && (
          <>
            <GameReward score={score} />
            <GameOver
              score={score}
              gameTitle={activeGameInfo?.title}
              onPlayAgain={handlePlayAgain}
              onExit={handleExit}
            />
          </>
        )}
      </div>
    </div>
  )
}
