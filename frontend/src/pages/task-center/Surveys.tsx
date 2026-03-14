import { ExternalLink, LayoutGrid, MoveLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { API_BASE_URL } from '../../config/api'

interface Provider {
  key: string
  logoText: string
  name: string
  description: string
  comingSoon: boolean
}

const providers: Provider[] = [
  {
    key: 'cpx-research',
    logoText: 'CPX',
    name: 'CPX Research',
    description: 'Premium surveys tailored to your profile and location.',
    comingSoon: false,
  },
  {
    key: 'bitlabs',
    logoText: 'BL',
    name: 'BitLabs',
    description: 'High-paying daily surveys with quick completion windows.',
    comingSoon: true,
  },
]

export default function SurveysCategory() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [launching, setLaunching] = useState(false)

  const handleCPX = async () => {
    const token = session?.access_token
    if (!token) {
      navigate('/login')
      return
    }

    setLaunching(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/cpx/offer-url`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = (await res.json()) as { offerUrl?: string }
      if (!data.offerUrl) throw new Error('missing url')
      window.open(data.offerUrl, '_blank', 'noopener,noreferrer')
    } catch {
      window.alert('Unable to open CPX Research right now. Please try again.')
    } finally {
      setLaunching(false)
    }
  }

  const handleClick = (provider: Provider) => {
    if (provider.comingSoon) return
    if (provider.key === 'cpx-research') {
      void handleCPX()
    }
  }

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
              Surveys
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-100 sm:text-3xl">
            📋 Surveys
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Complete partner surveys and earn AD COINS with trusted providers.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {providers.map((provider) => (
              <article
                key={provider.key}
                className="group relative rounded-[16px] border border-slate-800 bg-slate-900/70 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                {provider.comingSoon && (
                  <span className="absolute right-4 top-4 rounded-full border border-amber-400/30 bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                    Coming Soon
                  </span>
                )}

                <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 text-sm font-bold tracking-wide text-emerald-300">
                  {provider.logoText}
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-100">
                  {provider.name}
                </h2>
                <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-slate-300">
                  {provider.description}
                </p>

                <button
                  type="button"
                  onClick={() => handleClick(provider)}
                  disabled={
                    provider.comingSoon ||
                    (provider.key === 'cpx-research' && launching)
                  }
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {provider.key === 'cpx-research' && launching
                    ? 'Opening...'
                    : provider.comingSoon
                      ? 'Coming Soon'
                      : 'Start Earning'}
                  {!provider.comingSoon && <ExternalLink size={18} />}
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
