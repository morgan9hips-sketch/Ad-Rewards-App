import { useEffect, useRef, useState } from 'react'
import { LayoutGrid, MoveLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CenterTile {
  key: string
  icon: string
  label: string
  description: string
  path: string
  status: 'LIVE' | 'COMING_SOON'
}

const centerTiles: CenterTile[] = [
  {
    key: 'surveys',
    icon: '📋',
    label: 'Survey Center',
    description: 'Complete surveys and earn AD COINS from top providers.',
    path: '/task-center/surveys',
    status: 'LIVE',
  },
  {
    key: 'offer-wall',
    icon: '🎁',
    label: 'Offer Wall Center',
    description: 'Browse rewarded offers and unlock more ways to earn.',
    path: '/task-center/offer-wall',
    status: 'LIVE',
  },
  {
    key: 'gaming',
    icon: '🎮',
    label: 'Game Center',
    description: 'Play-to-earn experiences and game rewards are on the way.',
    path: '/task-center/gaming',
    status: 'COMING_SOON',
  },
  {
    key: 'shopping',
    icon: '🛒',
    label: 'Shopping Center',
    description: 'Shop partner brands and earn AD COINS cashback soon.',
    path: '/task-center/shopping',
    status: 'COMING_SOON',
  },
  {
    key: 'ads',
    icon: '📺',
    label: 'Ad Center',
    description: 'A dedicated ad earning hub is coming soon.',
    path: '/task-center/ads',
    status: 'COMING_SOON',
  },
]

export default function TaskCenter() {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState('')
  const toastTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const showComingSoonToast = () => {
    setToastMessage('Coming soon — stay tuned!')
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage('')
    }, 2200)
  }

  const handleTileClick = (tile: CenterTile) => {
    if (tile.status === 'COMING_SOON') {
      showComingSoonToast()
      return
    }
    navigate(tile.path)
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
            >
              <MoveLeft size={18} />
              Dashboard
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              <LayoutGrid size={18} />
              Task Center
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-100 sm:text-3xl">
            Task Center
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Browse earning opportunities by category and start earning AD COINS.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {centerTiles.map((tile, index) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => handleTileClick(tile)}
                className={`group rounded-[16px] border border-slate-800 bg-slate-900/70 p-6 text-left shadow-sm transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  tile.status === 'COMING_SOON'
                    ? 'opacity-50 hover:border-slate-700'
                    : 'hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'
                } ${index === centerTiles.length - 1 && centerTiles.length % 2 === 1 ? 'sm:col-span-2' : ''}`}
              >
                <span className="text-4xl" aria-hidden="true">
                  {tile.icon}
                </span>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-slate-100">{tile.label}</h2>
                  {tile.status === 'COMING_SOON' && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                      Coming Soon
                    </span>
                  )}
                  {tile.status === 'LIVE' && (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                      Live
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {tile.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors group-hover:text-emerald-300">
                  {tile.status === 'LIVE' ? 'Open Center →' : 'Stay Tuned'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-28 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
