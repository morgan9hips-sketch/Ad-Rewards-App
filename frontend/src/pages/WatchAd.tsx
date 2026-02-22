import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Card'
import GameCanvas from '../components/GameCanvas'
import { loadOGadsRewardedVideo } from '../services/ogadsService'
import { API_BASE_URL } from '../config/api'

type Stage =
  | 'opt-in'        // Show "Watch Ad" button
  | 'loading'       // Ad is loading/playing
  | 'playing-game'  // Mini game active
  | 'game-over'     // Choice screen (Complete vs Retry)
  | 'retry-ad'      // Watching retry ad
  | 'complete'      // Session finished, show results

interface SessionState {
  sessionId: string
  baseCoins: number
  gameBonus: number
  gamesPlayed: number
  gamesCompleted: number
  retryAdsWatched: number
}

interface StatusState {
  cooldownActive: boolean
  cooldownEndsAt: string | null
  sessionsToday: number
  remainingSessions: number
  waitSeconds: number
}

export default function WatchAd() {
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const [stage, setStage] = useState<Stage>('opt-in')
  const [gameState, setGameState] = useState<SessionState | null>(null)
  const [score, setScore] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [totalAwarded, setTotalAwarded] = useState(0)
  const [error, setError] = useState('')
  const [statusInfo, setStatusInfo] = useState<StatusState | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const adInProgress = useRef(false)

  const token = session?.access_token

  // Load daily cap / cooldown status on mount
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    if (!token) { setStatusLoading(false); return }
    try {
      const res = await fetch(`${API_BASE_URL}/api/game/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setStatusInfo({
          cooldownActive: data.cooldownActive,
          cooldownEndsAt: data.cooldownEndsAt,
          sessionsToday: data.sessionsToday,
          remainingSessions: data.remainingSessions,
          waitSeconds: data.waitSeconds,
        })
      }
    } catch {
      console.error('Error fetching status')
    } finally {
      setStatusLoading(false)
    }
  }

  // Start the session (check cap/cooldown on backend)
  const handleStartSession = async (): Promise<string | null> => {
    if (!token) { setError('Not authenticated'); return null }
    try {
      const res = await fetch(`${API_BASE_URL}/api/game/start-session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429) {
          await fetchStatus()
          return null
        }
        setError(data.error || 'Failed to start session')
        return null
      }
      return data.sessionId
    } catch {
      setError('Network error. Please try again.')
      return null
    }
  }

  // Record ad completion on the backend
  const recordAdCompletion = async (sessionId: string, adType: 'OPT_IN_REWARDED' | 'RETRY_REWARDED') => {
    if (!token) return
    try {
      await fetch(`${API_BASE_URL}/api/game/complete-ad`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, adType }),
      })
    } catch {
      console.error('Error recording ad completion')
    }
  }

  // User clicks "Watch Ad" opt-in button
  const handleOptIn = async () => {
    if (adInProgress.current) return
    adInProgress.current = true
    setError('')
    setStage('loading')

    // Start session (validates cap + cooldown)
    const sessionId = await handleStartSession()
    if (!sessionId) {
      adInProgress.current = false
      setStage('opt-in')
      return
    }

    // Launch OGads rewarded video
    loadOGadsRewardedVideo(
      async () => {
        // Ad completed successfully
        await recordAdCompletion(sessionId, 'OPT_IN_REWARDED')
        adInProgress.current = false
        setGameState({
          sessionId,
          baseCoins: 100,
          gameBonus: 0,
          gamesPlayed: 0,
          gamesCompleted: 0,
          retryAdsWatched: 0,
        })
        setScore(0)
        setGameCompleted(false)
        setStage('playing-game')
      },
      (errMsg) => {
        adInProgress.current = false
        setError(errMsg)
        setStage('opt-in')
        // Abandon session since ad didn't play
        if (sessionId && token) {
          fetch(`${API_BASE_URL}/api/game/finish-session`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, abandon: true }),
          }).catch(() => {})
        }
      }
    )
  }

  // Game ended (die or complete)
  const handleGameOver = async (finalScore: number, completed: boolean) => {
    setScore(finalScore)
    setGameCompleted(completed)

    if (!gameState || !token) {
      setStage('game-over')
      return
    }

    const result = completed ? 'completed' : 'died'
    try {
      const res = await fetch(`${API_BASE_URL}/api/game/attempt`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: gameState.sessionId, result, score: finalScore }),
      })
      if (res.ok && completed) {
        setGameState((prev) =>
          prev ? { ...prev, gameBonus: prev.gameBonus + 10, gamesCompleted: prev.gamesCompleted + 1 } : prev
        )
      }
    } catch {
      console.error('Error recording attempt')
    }

    setStage('game-over')
  }

  // User chooses to complete the session and collect coins
  const handleCompleteReward = async () => {
    if (!gameState || !token) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/game/finish-session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: gameState.sessionId }),
      })
      const data = await res.json()
      if (res.ok) {
        setTotalAwarded(data.totalCoins || 0)
        await fetchStatus()
        setStage('complete')
      } else {
        setError(data.error || 'Failed to complete session')
        setStage('complete')
      }
    } catch {
      setError('Network error. Please try again.')
      setStage('complete')
    }
  }

  // User chooses to watch retry ad and play again
  const handleRetry = () => {
    if (!gameState || adInProgress.current) return
    adInProgress.current = true
    setStage('retry-ad')

    loadOGadsRewardedVideo(
      async () => {
        // Retry ad completed
        await recordAdCompletion(gameState.sessionId, 'RETRY_REWARDED')
        adInProgress.current = false
        setGameState((prev) =>
          prev ? { ...prev, retryAdsWatched: prev.retryAdsWatched + 1 } : prev
        )
        setScore(0)
        setGameCompleted(false)
        setStage('playing-game')
      },
      (errMsg) => {
        adInProgress.current = false
        setError(errMsg)
        setStage('game-over')
      }
    )
  }

  const currentBalance = (user as { coinsBalance?: number })?.coinsBalance || 0

  // ─── COOLDOWN / CAP SCREEN ────────────────────────────────────────────────
  if (!statusLoading && statusInfo) {
    if (statusInfo.remainingSessions === 0 && stage === 'opt-in') {
      return (
        <div className="container mx-auto px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 border-orange-500/50">
              <div className="text-center py-12">
                <div className="text-6xl mb-6">📅</div>
                <h2 className="text-3xl font-bold text-orange-400 mb-4">Daily Cap Reached</h2>
                <p className="text-gray-300 mb-4">
                  You've watched all <strong>20 sessions</strong> for today. Come back tomorrow!
                </p>
                <div className="bg-orange-900/30 rounded-lg p-4 mb-8">
                  <p className="text-sm text-orange-300">
                    Sessions today: <strong>{statusInfo.sessionsToday} / 20</strong>
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-500 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </Card>
          </div>
        </div>
      )
    }

    if (statusInfo.cooldownActive && stage === 'opt-in') {
      return (
        <div className="container mx-auto px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50">
              <div className="text-center py-12">
                <div className="text-6xl mb-6">⏰</div>
                <h2 className="text-3xl font-bold text-blue-400 mb-4">Cooldown Active</h2>
                <p className="text-gray-300 mb-4">
                  Wait <strong>{Math.ceil(statusInfo.waitSeconds / 60)} minutes</strong> before your next session.
                </p>
                <div className="bg-blue-900/30 rounded-lg p-4 mb-6">
                  <CooldownDisplay waitSeconds={statusInfo.waitSeconds} onExpire={fetchStatus} />
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Sessions today: {statusInfo.sessionsToday} / 20
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 bg-gray-700 text-gray-300 text-lg font-semibold rounded-lg hover:bg-gray-600 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </Card>
          </div>
        </div>
      )
    }
  }

  // ─── OPT-IN SCREEN ────────────────────────────────────────────────────────
  if (stage === 'opt-in') {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎬</div>
            <h1 className="text-4xl font-bold text-white mb-3">Earn 100 AdCoins!</h1>
            <p className="text-gray-300 text-lg">Watch a short ad, play a mini game, earn real rewards</p>
          </div>

          {error && (
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 mb-4">
              <div className="text-center py-4">
                <p className="text-yellow-300">{error}</p>
              </div>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50">
            <div className="text-center py-8">
              <div className="bg-purple-900/50 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img
                    src="/images/branding/Adcoin-large-512x512.png"
                    alt="AdCoin"
                    className="w-20 h-20 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                  />
                  <span className="text-5xl font-bold text-yellow-400">100</span>
                </div>
                <p className="text-lg font-semibold text-purple-200">AdCoins Guaranteed</p>
              </div>

              <div className="space-y-3 text-left max-w-md mx-auto mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Watch ~30 second ad → get 100 coins</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Play mini game → earn +10 bonus coins</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Retry with ad for more attempts</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>15 min cooldown between sessions</span>
                </div>
              </div>

              {statusInfo && (
                <p className="text-gray-500 text-sm mb-6">
                  Sessions today: {statusInfo.sessionsToday} / 20
                </p>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleOptIn}
                  className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/50"
                >
                  Yes, Show Me the Ad!
                </button>
                <button
                  onClick={() => navigate('/ads')}
                  className="w-full max-w-md px-8 py-3 bg-gray-700 text-gray-300 text-lg font-semibold rounded-lg hover:bg-gray-600 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ─── LOADING / AD PLAYING SCREEN ─────────────────────────────────────────
  if (stage === 'loading' || stage === 'retry-ad') {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50">
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📺</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {stage === 'retry-ad' ? 'Loading retry ad...' : 'Ad is loading...'}
              </h2>
              <p className="text-gray-300 mb-8">Please wait while the ad loads</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ─── MINI GAME SCREEN ─────────────────────────────────────────────────────
  if (stage === 'playing-game' && gameState) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-400">Base: </span>
                <span className="text-yellow-400 font-bold">
                  {gameState.baseCoins}
                </span>
                <img src="/images/branding/Adcoin tiny 64x64.png" alt="coins" className="w-4 h-4 inline ml-1" />
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Bonus: </span>
                <span className="text-green-400 font-bold">+{gameState.gameBonus}</span>
                <img src="/images/branding/Adcoin tiny 64x64.png" alt="coins" className="w-4 h-4 inline ml-1" />
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Retries: {gameState.retryAdsWatched}
            </div>
          </div>

          <GameCanvas onGameOver={handleGameOver} onScoreChange={setScore} lives={1} />
        </div>
      </div>
    )
  }

  // ─── GAME OVER / CHOICE SCREEN ────────────────────────────────────────────
  if (stage === 'game-over' && gameState) {
    const currentTotal = gameState.baseCoins + gameState.gameBonus
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-gray-600">
            <div className="text-center py-8 px-4">
              <div className="text-5xl mb-4">{gameCompleted ? '🎉' : '💀'}</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {gameCompleted ? 'Game Complete!' : 'Game Over!'}
              </h2>
              <p className="text-gray-400 mb-6">Score: <span className="text-yellow-400 font-bold">{score}</span></p>

              {/* Earnings Breakdown */}
              <div className="bg-gray-800/60 rounded-lg p-4 mb-6 text-left max-w-sm mx-auto space-y-2">
                <h3 className="text-white font-semibold mb-2">💰 Session Earnings</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ad reward:</span>
                  <span className="text-yellow-400">{gameState.baseCoins} coins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Game bonus:</span>
                  <span className="text-green-400">+{gameState.gameBonus} coins</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-yellow-400 font-bold">{currentTotal} coins</span>
                </div>
                <div className="text-xs text-gray-500 pt-1">
                  Retries used: {gameState.retryAdsWatched} | Games played: {gameState.gamesPlayed + 1}
                </div>
              </div>

              <div className="space-y-3 max-w-sm mx-auto">
                {/* Complete Reward */}
                <button
                  onClick={handleCompleteReward}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg"
                >
                  <div>✅ Complete Reward</div>
                  <div className="text-sm font-normal opacity-90">
                    Collect {currentTotal} coins + start 15 min cooldown
                  </div>
                </button>

                {/* Watch Ad & Try Again */}
                <button
                  onClick={handleRetry}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg"
                >
                  <div>📺 Watch Ad & Try Again</div>
                  <div className="text-sm font-normal opacity-90">
                    Keep your {gameState.baseCoins} coins + earn +10 bonus if you complete
                  </div>
                </button>

                {error && (
                  <p className="text-yellow-400 text-sm text-center">{error}</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ─── COMPLETE SCREEN ──────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {error ? (
          <Card className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border-2 border-red-500/50">
            <div className="text-center py-12">
              <div className="text-6xl mb-6">⚠️</div>
              <h2 className="text-3xl font-bold text-red-400 mb-4">Oops! Something went wrong</h2>
              <p className="text-gray-300 mb-8">{error}</p>
              <button
                onClick={() => navigate('/ads')}
                className="px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-500 transition-all"
              >
                Back to Ads
              </button>
            </div>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50">
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-green-400 mb-4">Congratulations!</h2>
              <p className="text-gray-300 text-lg mb-8">
                You earned{' '}
                <span className="text-yellow-400 font-bold text-2xl">{totalAwarded}</span>{' '}
                AdCoins!
              </p>

              <div className="bg-green-900/30 rounded-lg p-6 mb-8 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3">
                  <img
                    src="/images/branding/Adcoin-large-512x512.png"
                    alt="AdCoin"
                    className="w-16 h-16 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce"
                  />
                  <span className="text-5xl font-bold text-yellow-400">+{totalAwarded}</span>
                </div>
              </div>

              <p className="text-gray-400 mb-4">
                New balance:{' '}
                <span className="text-white font-semibold">
                  {currentBalance + totalAwarded}
                </span>{' '}
                AdCoins
              </p>

              {statusInfo && (
                <p className="text-gray-500 text-sm mb-8">
                  Sessions today: {statusInfo.sessionsToday} / 20
                  {statusInfo.cooldownActive && ` · Next in ${Math.ceil(statusInfo.waitSeconds / 60)} min`}
                </p>
              )}

              <button
                onClick={() => navigate('/ads')}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg"
              >
                {statusInfo?.cooldownActive ? 'Back to Ads' : 'Watch Another Ad'}
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// Inline cooldown countdown component
function CooldownDisplay({ waitSeconds, onExpire }: { waitSeconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(waitSeconds)

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, onExpire])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <p className="text-2xl font-bold text-blue-300">
      {mins}:{secs.toString().padStart(2, '0')}
    </p>
  )
}
