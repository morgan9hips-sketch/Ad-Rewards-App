import { ExternalLink, LayoutGrid, MoveLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type ProviderKey = 'bitlabs' | 'cpx-research' | 'theoremreach'

interface SurveyProvider {
  key: ProviderKey
  name: string
  logoText: string
  description: string
}

const surveyProviders: SurveyProvider[] = [
  {
    key: 'bitlabs',
    name: 'BitLabs',
    logoText: 'BL',
    description: 'High-paying daily surveys with quick completion windows.',
  },
  {
    key: 'cpx-research',
    name: 'CPX Research',
    logoText: 'CPX',
    description: 'Premium surveys tailored to your profile and location.',
  },
  {
    key: 'theoremreach',
    name: 'TheoremReach',
    logoText: 'TR',
    description: 'Reliable survey inventory with steady AD COINS payouts.',
  },
]

export default function SurveyCenter() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const cpxOfferUrl = useMemo(() => {
    const userId = user?.id || ''
    return `https://offers.cpx-research.com${encodeURIComponent(userId)}`
  }, [user?.id])

  const handleStartEarning = (provider: SurveyProvider) => {
    if (provider.key === 'cpx-research') {
      window.open(cpxOfferUrl, '_blank', 'noopener,noreferrer')
      return
    }

    navigate('/ad-city')
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
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
              Survey Center
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-100 sm:text-3xl">
            Survey Center
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Complete partner surveys and earn AD COINS with trusted providers.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {surveyProviders.map((provider) => (
              <article
                key={provider.key}
                className="group rounded-[16px] border border-slate-800 bg-slate-900/70 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
              >
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
                  onClick={() => handleStartEarning(provider)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-blue-400"
                >
                  Start Earning
                  <ExternalLink size={18} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
