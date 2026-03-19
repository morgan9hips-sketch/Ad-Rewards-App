import { ExternalLink, LayoutGrid, MoveLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { API_BASE_URL } from '../../config/api'

interface SurveyProvider {
  key: 'cpx-research' | 'theoremreach' | 'bitlabs' | 'provider-4' | 'provider-5'
  logoText: string
  name: string
  description: string
  earnRateHint: string
  comingSoon: boolean
}

const providers: SurveyProvider[] = [
  {
    key: 'cpx-research',
    logoText: 'CPX',
    name: 'CPX Research',
    description: 'Premium surveys tailored to your profile and location.',
    earnRateHint: 'Earn up to 500+ AD COINS per completion.',
    comingSoon: false,
  },
  {
    key: 'theoremreach',
    logoText: 'TR',
    name: 'TheoremReach',
    description: 'Reliable global survey inventory with frequent availability.',
    earnRateHint: 'Steady daily opportunities and instant coin credits.',
    comingSoon: false,
  },
  {
    key: 'bitlabs',
    logoText: 'BL',
    name: 'BitLabs',
    description: 'High-paying daily surveys with quick completion windows.',
    earnRateHint: 'High payout campaigns coming soon.',
    comingSoon: true,
  },
  {
    key: 'provider-4',
    logoText: 'P4',
    name: 'Provider 4',
    description: 'New survey inventory provider integration in progress.',
    earnRateHint: 'Additional payout options coming soon.',
    comingSoon: true,
  },
  {
    key: 'provider-5',
    logoText: 'P5',
    name: 'Provider 5',
    description: 'Expansion provider for wider regional survey access.',
    earnRateHint: 'More countries and offers coming soon.',
    comingSoon: true,
  },
]

export default function SurveysCategory() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [launching, setLaunching] = useState<string | null>(null)

  const handleCpxLaunch = async () => {
    const token = session?.access_token
    if (!token) {
      navigate('/login')
      return
    }

    setLaunching('cpx-research')
    try {
      const response = await fetch(`${API_BASE_URL}/api/cpx/offer-url`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch CPX survey URL: ${response.status}`)
      }

      const data = (await response.json()) as { offerUrl?: string }
      if (!data.offerUrl) {
        throw new Error('CPX survey URL missing from response')
      }

      window.open(data.offerUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to launch CPX surveys:', error)
      window.alert('Unable to open CPX Research right now. Please try again.')
    } finally {
      setLaunching(null)
    }
  }

  const handleTheoremReachLaunch = async () => {
    const token = session?.access_token
    if (!token) {
      navigate('/login')
      return
    }

    setLaunching('theoremreach')
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/theoremreach-launch/launch-url`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch TheoremReach launch URL: ${response.status}`,
        )
      }

      const data = (await response.json()) as { launchUrl?: string }
      if (!data.launchUrl) {
        throw new Error('TheoremReach launch URL missing from response')
      }

      window.open(data.launchUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to launch TheoremReach:', error)
      window.alert('Unable to open TheoremReach right now. Please try again.')
    } finally {
      setLaunching(null)
    }
  }

  const handleClick = (provider: SurveyProvider) => {
    if (provider.comingSoon) return
    if (provider.key === 'cpx-research') {
      void handleCpxLaunch()
      return
    }
    if (provider.key === 'theoremreach') {
      void handleTheoremReachLaunch()
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
            📋 Survey Center
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Complete partner surveys and earn AD COINS with trusted providers.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {providers.map((provider) => (
              <article
                key={provider.key}
                className={`group relative rounded-[16px] border border-slate-800 bg-slate-900/70 p-5 shadow-sm transition duration-200 ${provider.comingSoon ? 'opacity-50' : 'hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'}`}
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

                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  {provider.earnRateHint}
                </p>

                {provider.comingSoon ? (
                  <span className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/20 px-6 py-2 text-sm font-semibold text-amber-200">
                    Coming Soon
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleClick(provider)}
                    disabled={launching === provider.key}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {launching === provider.key
                      ? 'Opening...'
                      : 'Start Earning'}
                    <ExternalLink size={18} />
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
