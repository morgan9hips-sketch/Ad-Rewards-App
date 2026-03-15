import { LayoutGrid, MoveLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function OffersCategory() {
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
              Offers
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-100 sm:text-3xl">
            🛍️ Offers
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Complete brand offers and sign-ups from top advertisers worldwide.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* BitLabs — Offers */}
            <article className="group relative rounded-[16px] border border-slate-800 bg-slate-900/70 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10">
              <span className="absolute right-4 top-4 rounded-full border border-amber-400/30 bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                Coming Soon
              </span>

              <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 text-sm font-bold tracking-wide text-emerald-300">
                BL
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-100">BitLabs</h2>
              <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-slate-300">
                Complete offers from leading brands and advertisers to earn AD
                COINS.
              </p>

              <button
                type="button"
                disabled
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Coming Soon
              </button>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
