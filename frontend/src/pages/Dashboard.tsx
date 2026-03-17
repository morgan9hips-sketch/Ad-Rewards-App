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
  Lock,
  LogOut,
  Receipt,
  ShoppingBag,
  Store,
  Users,
  X,
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import ProfileSetup from '../components/ProfileSetup'
import TermsAcceptanceModal from '../components/TermsAcceptanceModal'
import RewardCard from '../components/RewardCard'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
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
  countryCode?: string | null
  adsWatched: number
  tier: string
  displayName: string | null
  profileSetupCompleted: boolean
  acceptedTermsAt: string | null
  loginStreak?: number
  taskWinStreak?: number
}

interface UserStats {
  pointsBalance: number
  dailyGoal: number
  dailyProgress: number
}

interface V2Task {
  id: number
  title: string
  description?: string | null
  type: string
  provider: string
  rewardCoins: number
}

interface ActivityFeedItem {
  id: string
  eventType: 'withdrawal' | 'earning'
  actor: string
  message: string
  coins?: string
  amountUsd?: number
  amountLocal?: number | null
  currencyCode?: string
  createdAt: string
}

const featuredOffers = [
  {
    title: 'Premium Shopping Cashback',
    description:
      'Activate this offer and unlock boosted earning multipliers on your next checkout.',
    rewardLabel: 'Earn AD COINS',
    imageSrc: '/images/branding/logo-full.png',
    imageAlt: 'Premium shopping cashback offer',
    actionLabel: 'Activate Offer',
    path: '/shop',
  },
  {
    title: 'Complete a Daily Task',
    description:
      'Complete active regional tasks and unlock accelerated AD COINS rewards.',
    rewardLabel: 'Earn AD COINS',
    imageSrc: '/images/branding/logo-icon.png',
    imageAlt: 'Daily task offer',
    actionLabel: 'Open Tasks',
    path: '/task-center',
  },
  {
    title: 'Weekend Play Bonus',
    description:
      'Hit high scores in mini games to claim a limited-time AD COINS bonus.',
    rewardLabel: 'Earn AD COINS',
    imageSrc: '/images/branding/Adcoin medium 256x256.png',
    imageAlt: 'Weekend play bonus offer',
    actionLabel: 'Play Now',
    path: '/mini-games',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, session, signOut } = useAuth()
  const { formatAmount } = useCurrency()

  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<V2Task[]>([])
  const [featuredTasks, setFeaturedTasks] = useState<V2Task[]>([])
  const [taskWinStreak, setTaskWinStreak] = useState(0)
  const [liveFeed, setLiveFeed] = useState<ActivityFeedItem[]>([])
  const [scarcityCountdown, setScarcityCountdown] = useState(90)
  const [scarcitySlots, setScarcitySlots] = useState(3)

  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(false)

  const [offerIndex, setOfferIndex] = useState(0)
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

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const [
        balanceRes,
        profileRes,
        txRes,
        tasksRes,
        featuredRes,
        activityRes,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/user/transactions?perPage=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v2/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/tasks/featured`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/activity/feed`, {
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

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      } else {
        setTasks([])
      }

      if (featuredRes.ok) {
        const featuredData = await featuredRes.json()
        setFeaturedTasks(featuredData.tasks || [])
        setTaskWinStreak(featuredData.taskWinStreak || 0)
      } else {
        setFeaturedTasks([])
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setLiveFeed(activityData.feed || [])
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

  useEffect(() => {
    const token = session?.access_token
    if (!token) return

    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/activity/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) return
        const data = await response.json()
        setLiveFeed(data.feed || [])
      } catch (error) {
        console.error('Error refreshing activity feed:', error)
      }
    }, 60000)

    return () => window.clearInterval(interval)
  }, [session?.access_token])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setScarcityCountdown((current) => {
        if (current <= 1) {
          setScarcitySlots(Math.max(1, Math.floor(Math.random() * 4) + 1))
          return 90
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const getDisplayName = () =>
    profile?.displayName || user?.email?.split('@')[0] || 'Member'

  const formatCoins = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '0'
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return '0'
    return parsed.toLocaleString()
  }

  const userStats: UserStats = useMemo(() => {
    const pointsBalance = Number(balance?.coins || 0)

    return {
      pointsBalance,
      dailyGoal: 30,
      dailyProgress: Math.max(0, Math.min(30, pointsBalance)),
    }
  }, [balance?.coins])

  const recommendedTasks = useMemo(
    () => (featuredTasks.length > 0 ? featuredTasks : tasks).slice(0, 3),
    [featuredTasks, tasks],
  )

  const activityRows = useMemo(() => {
    if (liveFeed.length > 0) {
      return liveFeed.map((entry) => {
        const isWithdrawal = entry.eventType === 'withdrawal'
        const amount = isWithdrawal
          ? entry.amountUsd
            ? formatAmount(entry.amountUsd)
            : 'Withdrawal'
          : `${entry.coins ? `+${formatCoins(entry.coins)} AD COINS` : 'Earning'}`

        return {
          id: entry.id,
          title: `${entry.actor} ${entry.message}`,
          amount,
          status: 'Posted',
          time: new Date(entry.createdAt).toLocaleString(),
        }
      })
    }

    if (transactions.length > 0) {
      return transactions.slice(0, 5).map((tx) => {
        const amount = Number(tx.coinsChange)
        const status =
          tx.type.toLowerCase().includes('pending') ||
          tx.description.toLowerCase().includes('pending')
            ? 'Pending'
            : 'Posted'

        return {
          id: tx.id,
          title: tx.description || tx.type,
          amount: `${amount > 0 ? '+' : ''}${formatCoins(tx.coinsChange)} AD COINS`,
          status,
          time: new Date(tx.createdAt).toLocaleDateString(),
        }
      })
    }

    return []
  }, [liveFeed, transactions, formatAmount])

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

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleQuickLink = (link: 'poll' | 'receipts' | 'refer' | 'gift') => {
    if (link === 'poll') {
      navigate('/task-center')
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
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-950 text-slate-100 antialiased dark">
        <LoadingSpinner
          size="large"
          withLogo={true}
          text="Loading your enterprise earning dashboard..."
        />
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-slate-950 pb-28 text-slate-100 antialiased xl:pb-10">
      {showTermsModal && <TermsAcceptanceModal onAccept={handleTermsAccept} />}
      {showProfileSetup && (
        <ProfileSetup onComplete={handleProfileSetupComplete} />
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="rounded-[12px] border border-slate-800 bg-slate-900/50 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="shrink-0 transition duration-200 hover:opacity-90"
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

            <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-300 transition duration-200 hover:text-emerald-400"
              >
                <Store size={18} />
                Shop
              </button>
              <button
                type="button"
                onClick={() => navigate('/task-center')}
                className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-300 transition duration-200 hover:text-emerald-400"
              >
                <ClipboardList size={18} />
                Tasks
              </button>
              <button
                type="button"
                onClick={() => navigate('/mini-games')}
                className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-300 transition duration-200 hover:text-emerald-400"
              >
                <Gamepad2 size={18} />
                Play
              </button>
              <button
                type="button"
                onClick={() => navigate('/task-center')}
                className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-300 transition duration-200 hover:text-emerald-400"
              >
                <Compass size={18} />
                Discover
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowActivityPanel(true)}
                className="inline-flex items-center rounded-full border border-white/10 bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400 sm:px-6"
              >
                <History size={18} />
                <span className="ml-2 hidden sm:inline">Recent Activity</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/wallet')}
                className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-5 py-2 text-left text-sm font-semibold text-emerald-300 shadow-lg shadow-emerald-500/20 transition duration-200 hover:border-emerald-300/40 hover:bg-emerald-500/15"
                aria-label="Open wallet"
              >
                <div>{formatCoins(userStats.pointsBalance)} AD COINS</div>
                <div className="text-[10px] font-medium text-emerald-200/90">
                  {formatAmount(userStats.pointsBalance / 100)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 transition duration-200 hover:border-slate-700 hover:bg-slate-800"
              >
                <CircleUserRound size={18} className="text-blue-400" />
                <span className="max-w-28 truncate text-sm font-semibold text-slate-200">
                  {getDisplayName()}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900 p-2 text-slate-400 transition duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto md:hidden">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
            >
              <Store size={18} /> Shop
            </button>
            <button
              type="button"
              onClick={() => navigate('/task-center')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
            >
              <ClipboardList size={18} /> Tasks
            </button>
            <button
              type="button"
              onClick={() => navigate('/mini-games')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
            >
              <Gamepad2 size={18} /> Play
            </button>
            <button
              type="button"
              onClick={() => navigate('/task-center')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
            >
              <Compass size={18} /> Discover
            </button>
          </div>
        </nav>

        <section className="mt-5 rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-1 lg:items-center">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-300">
                Daily Goal
              </p>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-emerald-400">
                Goal 1: 30 AD COINS
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full bg-blue-500 transition-all duration-200 ${goalWidthClass}`}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {userStats.dailyProgress} / {userStats.dailyGoal} AD COINS
                completed
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              <Flame size={16} /> Daily Streak
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {profile?.loginStreak || 0} days
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Daily streak check-in is rewarded once per day.
            </p>
          </div>

          <div className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
              Win Streak Bonus
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {taskWinStreak} tasks
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Every 5 completed tasks awards +50 AD COINS.
            </p>
          </div>

          <div className="rounded-[12px] border border-orange-500/30 bg-orange-500/10 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-200">
              Limited Featured Slots
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {scarcitySlots} left
            </p>
            <p className="mt-1 text-xs text-orange-100/80">
              Refreshing in {scarcityCountdown}s
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden xl:block">
            <div className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">
                Quick Links
              </h2>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => handleQuickLink('poll')}
                  className="flex w-full items-center justify-between rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
                >
                  <span className="inline-flex items-center gap-2">
                    <ClipboardList size={18} />
                    Daily Poll
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLink('receipts')}
                  className="flex w-full items-center justify-between rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
                >
                  <span className="inline-flex items-center gap-2">
                    <Receipt size={18} />
                    Magic Receipts
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLink('refer')}
                  className="flex w-full items-center justify-between rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
                >
                  <span className="inline-flex items-center gap-2">
                    <Users size={18} />
                    Refer & Earn
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLink('gift')}
                  className="flex w-full items-center justify-between rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
                >
                  <span className="inline-flex items-center gap-2">
                    <Gift size={18} />
                    Gift Card Store
                  </span>
                </button>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    Featured Offers
                  </h2>
                  <p className="text-sm text-slate-400">
                    Handpicked ways to maximize today’s AD COINS earnings.
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
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-200 transition duration-200 hover:bg-slate-700"
                    aria-label="Previous offer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOfferIndex((current) =>
                        current === featuredOffers.length - 1 ? 0 : current + 1,
                      )
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-200 transition duration-200 hover:bg-slate-700"
                    aria-label="Next offer"
                  >
                    <ChevronRight size={18} />
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
                  hero
                />
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                {featuredOffers.map((offer, index) => (
                  <button
                    key={offer.title}
                    type="button"
                    onClick={() => setOfferIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition duration-200 ${
                      index === offerIndex ? 'bg-blue-500' : 'bg-slate-700'
                    }`}
                    aria-label={`View offer ${index + 1}`}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <h2 className="text-lg font-bold text-slate-100">
                Recommended Tasks
              </h2>
              <p className="text-sm text-slate-400">
                Geo-filtered tasks selected for your profile.
              </p>

              <div className="mt-4 overflow-hidden rounded-[12px] border border-slate-800">
                <div className="hidden grid-cols-[1.2fr_0.7fr_0.6fr_0.45fr] bg-slate-950/70 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 md:grid">
                  <span>Task</span>
                  <span>Reward</span>
                  <span>Source</span>
                  <span className="text-right">Action</span>
                </div>

                {recommendedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid gap-3 border-t border-slate-800 px-4 py-2 md:grid-cols-[1.2fr_0.7fr_0.6fr_0.45fr] md:items-center md:h-16"
                  >
                    <p className="text-sm font-semibold text-slate-200">
                      {task.title}
                    </p>
                    <p className="text-sm font-bold text-emerald-400">
                      {formatCoins(task.rewardCoins)} AD COINS
                      <span className="ml-2 text-xs font-medium text-slate-400">
                        ({formatAmount(task.rewardCoins / 100)})
                      </span>
                    </p>
                    <p className="inline-flex items-center gap-2 text-sm text-slate-400">
                      <Clock3 size={18} /> {task.provider}
                    </p>
                    <div className="md:text-right">
                      <button
                        type="button"
                        onClick={() => navigate('/task-center')}
                        className="inline-flex items-center rounded-full border border-white/10 bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}

                {[0, 1].map((index) => (
                  <div
                    key={`coming-soon-task-${index}`}
                    className="grid gap-3 border-t border-slate-800 px-4 py-2 md:grid-cols-[1.2fr_0.7fr_0.6fr_0.45fr] md:items-center md:h-16"
                  >
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                      <Lock size={18} /> Coming Soon
                    </p>
                    <p className="text-sm text-slate-500">—</p>
                    <p className="text-sm text-slate-500">—</p>
                    <div className="md:text-right">
                      <span className="inline-flex items-center rounded-full border border-slate-700 px-6 py-2 text-sm font-semibold text-slate-500">
                        Locked
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <h2 className="text-lg font-bold text-slate-100">Shop & Earn</h2>
              <p className="text-sm text-slate-400">
                Stores shown are based on your region
                {profile?.countryCode ? ` (${profile.countryCode})` : ''}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[0, 1].map((index) => (
                  <div
                    key={`partner-store-${index}`}
                    className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-3 text-center shadow-sm backdrop-blur-sm"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <ShoppingBag size={18} />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-200">
                      Partner Store
                    </p>
                  </div>
                ))}

                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={`coming-soon-store-${index}`}
                    className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-3 text-center shadow-sm backdrop-blur-sm"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                      <Lock size={18} />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-400">
                      Coming Soon
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 px-4 py-2 backdrop-blur-sm xl:hidden">
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLink('poll')}
            className="flex flex-col items-center gap-1 rounded-full border border-white/10 bg-blue-500 px-2 py-2 text-[11px] font-semibold text-white transition duration-200 hover:bg-blue-400"
          >
            <ClipboardList size={18} />
            Daily Poll
          </button>
          <button
            type="button"
            onClick={() => handleQuickLink('receipts')}
            className="flex flex-col items-center gap-1 rounded-full border border-white/10 bg-blue-500 px-2 py-2 text-[11px] font-semibold text-white transition duration-200 hover:bg-blue-400"
          >
            <Receipt size={18} />
            Receipts
          </button>
          <button
            type="button"
            onClick={() => handleQuickLink('refer')}
            className="flex flex-col items-center gap-1 rounded-full border border-white/10 bg-blue-500 px-2 py-2 text-[11px] font-semibold text-white transition duration-200 hover:bg-blue-400"
          >
            <Users size={18} />
            Refer
          </button>
          <button
            type="button"
            onClick={() => handleQuickLink('gift')}
            className="flex flex-col items-center gap-1 rounded-full border border-white/10 bg-blue-500 px-2 py-2 text-[11px] font-semibold text-white transition duration-200 hover:bg-blue-400"
          >
            <Gift size={18} />
            Gift Store
          </button>
        </div>
      </div>

      {showActivityPanel && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setShowActivityPanel(false)}
            aria-label="Close activity panel"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-800 bg-slate-950 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">
                Recent Activity
              </h3>
              <button
                type="button"
                onClick={() => setShowActivityPanel(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-200 transition duration-200 hover:bg-slate-800"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 max-h-[calc(100vh-110px)] space-y-3 overflow-y-auto pr-1">
              {activityRows.length === 0 ? (
                <div className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-3 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-slate-300">
                    No recent activity yet
                  </p>
                </div>
              ) : (
                activityRows.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-3 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">
                          {row.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {row.time}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                          row.status === 'Posted'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {row.status === 'Posted' ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Hourglass size={18} />
                        )}
                        {row.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-bold text-emerald-400">
                      {row.amount}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {toastMessage && (
        <div className="fixed right-4 top-4 z-[60] rounded-[12px] border border-emerald-400/20 bg-slate-900 px-4 py-3 shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <CheckCircle2 size={18} />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  )
}
