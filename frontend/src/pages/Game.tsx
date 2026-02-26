import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import GameCanvas from '../components/GameCanvas'
import GameOverModal from '../components/GameOverModal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Game() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [lives, setLives] = useState(1)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)

  useEffect(() => {
    startGame()
  }, [])

  const startGame = async () => {
    try {
      setLoading(true)
      const token = session?.access_token
      if (!token) {
        navigate('/login')
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/game/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        const data = await res.json()
        setSessionId(data.sessionId)
        setLives(1)
        setScore(0)
        setGameOver(false)
        setGameCompleted(false)
      } else {
        alert('Failed to start game. Please try again.')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error starting game:', error)
      alert('Failed to start game. Please try again.')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleGameOver = async (finalScore: number, completed: boolean) => {
    if (!sessionId) return

    setScore(finalScore)
    setGameCompleted(completed)
    setGameOver(true)

    try {
      const token = session?.access_token
      if (!token) return

      await fetch(`${API_BASE_URL}/api/game/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          score: finalScore,
          completed,
        }),
      })
    } catch (error) {
      console.error('Error ending game:', error)
    }
  }

  const handleRetryWithVideo = () => {
    // This will be handled in GameOverModal
    setGameOver(false)
    setLives(1)
  }

  const handleRetryWithWait = () => {
    // This will be handled in GameOverModal
    setGameOver(false)
    setLives(1)
  }

  const handleExit = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <LoadingSpinner size="large" withLogo={true} text="Loading Game..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-4 bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-sm text-gray-400">Lives</div>
              <div className="text-2xl font-bold text-red-500">❤️ {lives}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Score</div>
              <div className="text-2xl font-bold text-yellow-500">{score}</div>
            </div>
          </div>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            Exit Game
          </button>
        </div>

        {/* Game Canvas */}
        <GameCanvas
          onGameOver={handleGameOver}
          onScoreChange={setScore}
          lives={lives}
        />

        {/* Game Over Modal */}
        {gameOver && sessionId && (
          <GameOverModal
            sessionId={sessionId}
            score={score}
            completed={gameCompleted}
            onRetryWithVideo={handleRetryWithVideo}
            onRetryWithWait={handleRetryWithWait}
            onExit={handleExit}
          />
        )}
      </div>
    </div>
  )
}
