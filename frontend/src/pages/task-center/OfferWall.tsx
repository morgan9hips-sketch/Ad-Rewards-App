import { ExternalLink, LayoutGrid, MoveLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { API_BASE_URL } from '../../config/api'

type OfferWallProviderKey =
  | 'cpx-offer-wall'
  | 'bitlabs-offer-wall'
  | 'provider-3'
  | 'provider-4'
  | 'provider-5'

interface OfferWallProvider {
  key: OfferWallProviderKey
  logoText: string
  name: string
  description: string
  earnRateHint: string
  comingSoon: boolean
}

const providers: OfferWallProvider[] = [
  {
    key: 'cpx-offer-wall',
    logoText: 'CPX',
    name: 'CPX Research Offer Wall',
    description:
      'Complete sponsored offers and campaigns with tracked rewards.',
    earnRateHint: 'Earn based on offer difficulty and completion depth.',
    comingSoon: false,
  },
  {
    key: 'bitlabs-offer-wall',
    logoText: 'BL',
    name: 'BitLabs Offer Wall',
    description: 'BitLabs offer inventory integration is in progress.',
    earnRateHint: 'High-conversion campaigns coming soon.',
    comingSoon: true,
  },
  {
    key: 'provider-3',
    logoText: 'P3',
    name: 'Provider 3',
    description: 'Additional offer wall partner onboarding in progress.',
    earnRateHint: 'More campaign categories coming soon.',
    comingSoon: true,
  },
  {
    key: 'provider-4',
    logoText: 'P4',
    name: 'Provider 4',
    description: 'Expanded global rewards inventory provider.',
    earnRateHint: 'More geos and higher payouts coming soon.',
    comingSoon: true,
  },
  {
    key: 'provider-5',
    logoText: 'P5',
    name: 'Provider 5',
    description: 'Performance marketing offer wall integration queue.',
    earnRateHint: 'New offer formats coming soon.',
    comingSoon: true,
  },
]

export default function OfferWallCategory() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [launching, setLaunching] = useState(false)

  const handleCpxOfferWallLaunch = async () => {
    const token = session?.access_token
    if (!token) {
      navigate('/login')
      return
    }

    setLaunching(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/cpx/offer-url`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch CPX offer URL: ${response.status}`)
      }

      const data = (await response.json()) as { offerUrl?: string }
      if (!data.offerUrl) {
        throw new Error('CPX offer URL missing from response')
      }

      window.open(data.offerUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to launch CPX offer wall:', error)
      window.alert('Unable to open CPX Offer Wall right now. Please try again.')
    } finally {
      setLaunching(false)
    }
  }

  const handleClick = (provider: OfferWallProvider) => {
    if (provider.comingSoon) return
    if (provider.key === 'cpx-offer-wall') {
      void handleCpxOfferWallLaunch()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
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
              Offer Wall Center
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-100 sm:text-3xl">
            🎁 Offer Wall Center
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Explore rewarded offer walls and earn AD COINS from completed tasks.
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
                    disabled={launching}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {launching ? 'Opening...' : 'Start Earning'}
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
