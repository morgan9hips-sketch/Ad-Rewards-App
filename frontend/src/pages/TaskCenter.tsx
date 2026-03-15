import { LayoutGrid, MoveLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Category {
  key: string
  icon: string
  label: string
  description: string
  path: string
}

const categories: Category[] = [
  {
    key: 'surveys',
    icon: '📋',
    label: 'Surveys',
    description:
      'Complete partner surveys tailored to your profile and earn AD COINS.',
    path: '/task-center/surveys',
  },
  {
    key: 'gaming',
    icon: '🎮',
    label: 'Gaming',
    description: 'Play games, try new titles, and get rewarded for your time.',
    path: '/task-center/gaming',
  },
  {
    key: 'offers',
    icon: '🛍️',
    label: 'Offers',
    description:
      'Complete brand offers and sign-ups from top advertisers worldwide.',
    path: '/task-center/offers',
  },
  {
    key: 'videos',
    icon: '📺',
    label: 'Videos',
    description: 'Watch short video ads and earn AD COINS instantly.',
    path: '/task-center/videos',
  },
  {
    key: 'cashback',
    icon: '💰',
    label: 'Cashback',
    description: 'Shop your favourite brands and earn cashback in AD COINS.',
    path: '/task-center/cashback',
  },
]

export default function TaskCenter() {
  const navigate = useNavigate()

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

          {/* Category grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => navigate(cat.path)}
                className="group rounded-[16px] border border-slate-800 bg-slate-900/70 p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span className="text-4xl" aria-hidden="true">
                  {cat.icon}
                </span>
                <h2 className="mt-4 text-xl font-bold text-slate-100">
                  {cat.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {cat.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors group-hover:text-emerald-300">
                  Browse {cat.label} →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
