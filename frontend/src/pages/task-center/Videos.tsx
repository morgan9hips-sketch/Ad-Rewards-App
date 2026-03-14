import { LayoutGrid, MoveLeft, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function VideosCategory() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/task-center')}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
            >
              <MoveLeft size={18} />
              Task Center
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              <LayoutGrid size={18} />
              Videos
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-100 sm:text-3xl">
            📺 Videos
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Watch short video ads and earn AD COINS instantly.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* Watch Ads */}
            <article className="group rounded-[16px] border border-slate-800 bg-slate-900/70 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 text-sm font-bold tracking-wide text-emerald-300">
                ADS
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-100">
                Watch Ads
              </h2>
              <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-slate-300">
                Watch rewarded video ads and earn AD COINS for every ad you
                complete. New ads available daily.
              </p>

              <button
                type="button"
                onClick={() => navigate('/ads')}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-blue-400"
              >
                Watch Now
                <Play size={18} />
              </button>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
