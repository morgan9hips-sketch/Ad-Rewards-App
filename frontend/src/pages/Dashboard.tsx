import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Clock3,
  Compass,
  Flame,
  Gamepad2,
  Gift,
  History,
  Hourglass,
  Receipt,
  Store,
  Users,
  X,
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import ProfileSetup from '../components/ProfileSetup'
import TermsAcceptanceModal from '../components/TermsAcceptanceModal'
import RewardCard from '../components/RewardCard'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'

interface UserBalance {
  coins: string
  minWithdrawal: number
}

interface Transaction {
  id: number
  type: string
  coinsChange: string
  description: string
  createdAt: string
}

interface UserProfile {
  walletBalance: number
  totalEarned: number
  adsWatched: number
  tier: string
  displayName: string | null
  profileSetupCompleted: boolean
  acceptedTermsAt: string | null
}

interface UserStats {
  pointsBalance: number
  dailyGoal: number
  dailyProgress: number
  dailyStreak: number
}

const featuredOffers = [
  {
    title: 'Premium Shopping Cashback',
    description:
      'Activate this offer and earn boosted cashback on your next checkout.',
    rewardLabel: 'Earn 30 SB',
    imageSrc: '/images/branding/logo-full.png',
    imageAlt: 'Premium shopping cashback offer',
    actionLabel: 'Activate Offer',
    path: '/shop',
  },
  {
    title: 'Complete a Daily Survey',
    description:
      'Answer today’s survey set and unlock bonus points after completion.',
    rewardLabel: 'Earn 24 SB',
    imageSrc: '/images/branding/logo-icon.png',
    imageAlt: 'Daily survey offer',
    actionLabel: 'Take Survey',
    path: '/ad-city',
  },
  {
    title: 'Weekend Play Bonus',
    description:
      'Hit high scores in mini games to claim a limited-time weekend boost.',
    rewardLabel: 'Earn 18 SB',
    imageSrc: '/images/branding/Adcoin medium 256x256.png',
    imageAlt: 'Weekend play bonus offer',
    actionLabel: 'Play Now',
    path: '/mini-games',
  },
]

const surveyRows = [
  { topic: 'Streaming Habits', reward: '12 SB', estTime: '6 min' },
  { topic: 'Mobile Gaming Trends', reward: '16 SB', estTime: '8 min' },
  { topic: 'Smart Shopping Preferences', reward: '20 SB', estTime: '11 min' },
  { topic: 'Travel and Lifestyle', reward: '15 SB', estTime: '7 min' },
]

const shopTiles = [
  { name: 'Amazon', payout: 'Up to 5% Back' },
  { name: 'Nike', payout: 'Up to 4% Back' },
  { name: 'Walmart', payout: 'Up to 3% Back' },
  { name: 'Target', payout: 'Up to 5% Back' },
  { name: 'eBay', payout: 'Up to 2% Back' },
  { name: 'AliExpress', payout: 'Up to 5% Back' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(false)

  const [offerIndex, setOfferIndex] = useState(0)
  const [pollCompleted, setPollCompleted] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const goalWidthClasses = [
    'w-0',
    'w-[5%]',
    'w-[10%]',
    'w-[15%]',
    'w-[20%]',
    'w-[25%]',
    'w-[30%]',
    'w-[35%]',
    'w-[40%]',
    'w-[45%]',
    'w-[50%]',
    'w-[55%]',
    'w-[60%]',
    'w-[65%]',
    'w-[70%]',
    'w-[75%]',
    'w-[80%]',
    'w-[85%]',
    'w-[90%]',
    'w-[95%]',
    'w-full',
  ]

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const [balanceRes, profileRes, txRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/user/transactions?perPage=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData)
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)

        if (!profileData.profileSetupCompleted) {
          setShowProfileSetup(true)
        }

        if (!profileData.acceptedTermsAt) {
          setShowTermsModal(true)
        }
      }

      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getDisplayName = () =>
    profile?.displayName || user?.email?.split('@')[0] || 'Member'

  const formatPoints = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '0'
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return '0'
    return parsed.toLocaleString()
  }

  const userStats: UserStats = useMemo(() => {
    const pointsBalance = Number(balance?.coins || 0)
    const positiveToday = transactions.reduce((acc, tx) => {
      const isToday =
        new Date(tx.createdAt).toDateString() === new Date().toDateString()
      const points = Number(tx.coinsChange)
      if (!isToday || Number.isNaN(points) || points <= 0) return acc
      return acc + Math.min(10, Math.round(points / 25))
    }, 0)

    const dailyProgress = pollCompleted
      ? 30
      : Math.max(6, Math.min(30, positiveToday + 8))

    return {
      pointsBalance,
      dailyGoal: 30,
      dailyProgress,
      dailyStreak: Math.max(
        1,
        Math.min(14, Math.floor((profile?.adsWatched || 12) / 4)),
      ),
    }
  }, [balance?.coins, pollCompleted, profile?.adsWatched, transactions])

  const activityRows = useMemo(() => {
    if (transactions.length > 0) {
      return transactions.slice(0, 8).map((tx) => {
        const amount = Number(tx.coinsChange)
        const status =
          tx.type.toLowerCase().includes('pending') ||
          tx.description.toLowerCase().includes('pending')
            ? 'Pending'
            : 'Posted'

        return {
          id: tx.id,
          title: tx.description || tx.type,
          amount: `${amount > 0 ? '+' : ''}${formatPoints(tx.coinsChange)} SB`,
          status,
          time: new Date(tx.createdAt).toLocaleDateString(),
        }
      })
    }

    return [
      {
        id: 1,
        title: 'Daily Survey Completed',
        amount: '+12 SB',
        status: 'Posted',
        time: 'Today',
      },
      {
        id: 2,
        title: 'Featured Offer Validation',
        amount: '+18 SB',
        status: 'Pending',
        time: 'Today',
      },
    ]
  }, [transactions])

  const handleTermsAccept = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/user/accept-terms`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setShowTermsModal(false)
      }
    } catch (error) {
      console.error('Error accepting terms:', error)
    }
  }

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false)
    fetchDashboardData()
  }

  const handleDailyPoll = () => {
    setPollCompleted(true)
    setToastMessage("Daily Poll completed! +5 SB added to today's goal.")
  }

  const handleQuickLink = (link: 'poll' | 'receipts' | 'refer' | 'gift') => {
    if (link === 'poll') {
      handleDailyPoll()
      return
    }

    if (link === 'receipts') {
      navigate('/shop')
      return
    }

    if (link === 'refer') {
      navigate('/referrals')
      return
    }

    navigate('/shop')
  }

  const goalPercent = Math.min(
    100,
    Math.round((userStats.dailyProgress / userStats.dailyGoal) * 100),
  )
  const goalPercentIndex = Math.max(
    0,
    Math.min(20, Math.round(goalPercent / 5)),
  )
  const goalWidthClass = goalWidthClasses[goalPercentIndex]

  const currentOffer = featuredOffers[offerIndex]

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-100">
        <LoadingSpinner
          size="large"
          withLogo={true}
          text="Loading your member home..."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-28 xl:pb-10 text-slate-900">
      {showTermsModal && <TermsAcceptanceModal onAccept={handleTermsAccept} />}
      {showProfileSetup && (
        <ProfileSetup onComplete={handleProfileSetupComplete} />
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="rounded-[12px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="shrink-0"
              aria-label="Go to member home"
            >
              <img
                src="/images/branding/logo-full.png"
                alt="Adify"
                className="hidden h-10 w-auto sm:block"
              />
              <img
                src="/images/branding/logo-icon.png"
                alt="Adify"
                className="h-10 w-10 sm:hidden"
              />
            </button>

            <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Store size={16} />
                Shop
              </button>
              <button
                type="button"
                onClick={() => navigate('/ad-city')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ClipboardList size={16} />
                Answer
              </button>
              <button
                type="button"
                onClick={() => navigate('/mini-games')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Gamepad2 size={16} />
                Play
              </button>
              <button
                type="button"
                onClick={() => navigate('/ad-city')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Compass size={16} />
                Discover
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowActivityPanel(true)}
                className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:inline-flex"
              >
                <History size={16} />
                Recent Activity
              </button>

              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-[#f5af02] transition hover:animate-pulse">
                {formatPoints(userStats.pointsBalance)} SB
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                <CircleUserRound size={18} className="text-[#005da4]" />
                <span className="max-w-28 truncate text-sm font-semibold text-slate-700">
                  {getDisplayName()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto md:hidden">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              <Store size={14} /> Shop
            </button>
            <button
              type="button"
              onClick={() => navigate('/ad-city')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              <ClipboardList size={14} /> Answer
            </button>
            <button
              type="button"
              onClick={() => navigate('/mini-games')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              <Gamepad2 size={14} /> Play
            </button>
            <button
              type="button"
              onClick={() => navigate('/ad-city')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              <Compass size={14} /> Discover
            </button>
          </div>
        </nav>

        <section className="mt-5 rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#005da4]">Daily Goal</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Goal 1: 30 SB
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full bg-[#005da4] transition-all ${goalWidthClass}`}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {userStats.dailyProgress} / {userStats.dailyGoal} SB completed
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
              <Flame size={16} />
              Daily Streak: {userStats.dailyStreak} days
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden xl:block">
            <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#005da4]">
                Quick Links
              </h2>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => handleQuickLink('poll')}
                  className="flex w-full items-center justify-between rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <ClipboardList size={15} className="text-[#005da4]" />
                    Daily Poll
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLink('receipts')}
                  className="flex w-full items-center justify-between rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Receipt size={15} className="text-[#005da4]" />
                    Magic Receipts
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLink('refer')}
                  className="flex w-full items-center justify-between rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Users size={15} className="text-[#005da4]" />
                    Refer & Earn
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLink('gift')}
                  className="flex w-full items-center justify-between rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Gift size={15} className="text-[#005da4]" />
                    Gift Card Store
                  </span>
                </button>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Featured Offers
                  </h2>
                  <p className="text-sm text-slate-500">
                    Handpicked ways to maximize today’s earnings.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOfferIndex((current) =>
                        current === 0 ? featuredOffers.length - 1 : current - 1,
                      )
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                    aria-label="Previous offer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOfferIndex((current) =>
                        current === featuredOffers.length - 1 ? 0 : current + 1,
                      )
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                    aria-label="Next offer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <RewardCard
                  title={currentOffer.title}
                  description={currentOffer.description}
                  rewardLabel={currentOffer.rewardLabel}
                  imageSrc={currentOffer.imageSrc}
                  imageAlt={currentOffer.imageAlt}
                  actionLabel={currentOffer.actionLabel}
                  onAction={() => navigate(currentOffer.path)}
                />
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                {featuredOffers.map((offer, index) => (
                  <button
                    key={offer.title}
                    type="button"
                    onClick={() => setOfferIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      index === offerIndex ? 'bg-[#005da4]' : 'bg-slate-300'
                    }`}
                    aria-label={`View offer ${index + 1}`}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Recommended Surveys
              </h2>
              <p className="text-sm text-slate-500">
                Fast-start surveys selected for your profile.
              </p>

              <div className="mt-4 overflow-hidden rounded-[12px] border border-slate-200">
                <div className="hidden grid-cols-[1.2fr_0.5fr_0.5fr_0.45fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
                  <span>Topic</span>
                  <span>Reward</span>
                  <span>Est. Time</span>
                  <span className="text-right">Action</span>
                </div>

                {surveyRows.map((survey) => (
                  <div
                    key={survey.topic}
                    className="grid gap-3 border-t border-slate-200 px-4 py-3 md:grid-cols-[1.2fr_0.5fr_0.5fr_0.45fr] md:items-center"
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {survey.topic}
                    </p>
                    <p className="text-sm font-bold text-[#f5af02]">
                      {survey.reward}
                    </p>
                    <p className="inline-flex items-center gap-1 text-sm text-slate-500">
                      <Clock3 size={14} /> {survey.estTime}
                    </p>
                    <div className="md:text-right">
                      <button
                        type="button"
                        onClick={() => navigate('/ad-city')}
                        className="inline-flex items-center rounded-full bg-[#005da4] px-4 py-2 text-xs font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-bold text-slate-900">Shop & Earn</h2>
              <p className="text-sm text-slate-500">
                Earn cashback rewards from top partner stores.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {shopTiles.map((brand) => (
                  <div
                    key={brand.name}
                    className="rounded-[12px] border border-slate-200 bg-white p-3 text-center shadow-sm"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#005da4]/10 text-sm font-bold text-[#005da4]">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {brand.name}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#f5af02]">
                      {brand.payout}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white px-4 py-2 shadow-[0_-2px_10px_rgba(15,23,42,0.08)] xl:hidden">
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLink('poll')}
            className="flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold text-slate-700"
          >
            <ClipboardList size={16} className="text-[#005da4]" />
            Daily Poll
          </button>
          <button
            type="button"
            onClick={() => handleQuickLink('receipts')}
            className="flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold text-slate-700"
          >
            <Receipt size={16} className="text-[#005da4]" />
            Receipts
          </button>
          <button
            type="button"
            onClick={() => handleQuickLink('refer')}
            className="flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold text-slate-700"
          >
            <Users size={16} className="text-[#005da4]" />
            Refer
          </button>
          <button
            type="button"
            onClick={() => handleQuickLink('gift')}
            className="flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold text-slate-700"
          >
            <Gift size={16} className="text-[#005da4]" />
            Gift Store
          </button>
        </div>
      </div>

      {showActivityPanel && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45"
            onClick={() => setShowActivityPanel(false)}
            aria-label="Close activity panel"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Recent Activity
              </h3>
              <button
                type="button"
                onClick={() => setShowActivityPanel(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 max-h-[calc(100vh-110px)] space-y-3 overflow-y-auto pr-1">
              {activityRows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-[12px] border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {row.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{row.time}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        row.status === 'Posted'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {row.status === 'Posted' ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Hourglass size={12} />
                      )}
                      {row.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-[#f5af02]">
                    {row.amount}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {toastMessage && (
        <div className="fixed right-4 top-4 z-[60] rounded-[12px] border border-[#005da4]/20 bg-white px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#005da4]">
            <CheckCircle2 size={16} />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  )
}
