import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'

interface HUDData {
  rank: number | null
  coins: number
  avatarEmoji: string
}

export default function FloatingHUD() {
  const { session, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [hud, setHud] = useState<HUDData>({ rank: null, coins: 0, avatarEmoji: '👤' })

  const fetchHUDData = useCallback(async () => {
    try {
      const token = session?.access_token
      if (!token) return

      // Fetch leaderboard for rank + coins
      const res = await fetch(`${API_BASE_URL}/api/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        const currentUser = data.currentUser
        const myEntry = data.leaderboard?.find((e: { userId: string; avatarEmoji: string }) =>
          e.userId === session?.user?.id
        )
        setHud({
          rank: currentUser?.rank ?? null,
          coins: currentUser ? parseInt(currentUser.coins) : 0,
          avatarEmoji: myEntry?.avatarEmoji ?? '👤',
        })
      }
    } catch (error) {
      console.error('FloatingHUD fetch error:', error)
    }
  }, [session])

  useEffect(() => {
    if (!isAuthenticated) return

    fetchHUDData()

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchHUDData, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchHUDData])

  if (!isAuthenticated) return null

  return (
    <>
      {/* Left HUD — Avatar + Wallet */}
      <button
        onClick={() => navigate('/wallet')}
        className="fixed top-16 left-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900/90 backdrop-blur-sm border border-gray-700/60 shadow-lg hover:border-yellow-500/50 transition-all active:scale-95"
        aria-label="Open wallet"
      >
        <span className="text-lg leading-none">{hud.avatarEmoji}</span>
        <span className="text-yellow-400 font-bold text-xs">
          {hud.coins.toLocaleString()}
        </span>
        <img
          src="/images/branding/Adcoin small 128x128.png"
          alt="coins"
          className="w-4 h-4"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </button>

      {/* Right HUD — Live Rank */}
      <button
        onClick={() => navigate('/leaderboard')}
        className="fixed top-16 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900/90 backdrop-blur-sm border border-gray-700/60 shadow-lg hover:border-yellow-500/50 transition-all active:scale-95"
        aria-label="View leaderboard"
      >
        {/* Live pulse dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
        </span>
        <span className="text-sm">🏆</span>
        <span className="text-white font-bold text-xs">
          {hud.rank !== null ? `#${hud.rank}` : '—'}
        </span>
      </button>
    </>
  )
}
