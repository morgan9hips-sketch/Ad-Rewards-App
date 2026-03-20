import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock3, Lock } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import ProfileSetup from '../components/ProfileSetup'
import TermsAcceptanceModal from '../components/TermsAcceptanceModal'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { API_BASE_URL } from '../config/api'
import { fetchV2Wallet, parseV2CoinBalance } from '../services/v2Wallet'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const { formatAmount } = useCurrency()

  const [loading, setLoading] = useState(true)
  const [v2Balance, setV2Balance] = useState(0)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<V2Task[]>([])

  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

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

      const [walletRes, profileRes, txRes, tasksRes] = await Promise.all([
        fetchV2Wallet(token),
        fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/user/transactions?perPage=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v2/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setV2Balance(parseV2CoinBalance(walletRes))

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
        await txRes.json()
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      } else {
        setTasks([])
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
    const pointsBalance = Number(v2Balance || 0)

    return {
      pointsBalance,
      dailyGoal: 30,
      dailyProgress: Math.max(0, Math.min(30, pointsBalance)),
    }
  }, [v2Balance])

  const recommendedTasks = useMemo(() => tasks.slice(0, 3), [tasks])

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

  const goalPercent = Math.min(
    100,
    Math.round((userStats.dailyProgress / userStats.dailyGoal) * 100),
  )
  const goalPercentIndex = Math.max(
    0,
    Math.min(20, Math.round(goalPercent / 5)),
  )
  const goalWidthClass = goalWidthClasses[goalPercentIndex]

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
    <div className="dark min-h-screen bg-slate-950 pb-24 text-slate-100 antialiased xl:pb-10">
      {showTermsModal && <TermsAcceptanceModal onAccept={handleTermsAccept} />}
      {showProfileSetup && (
        <ProfileSetup onComplete={handleProfileSetupComplete} />
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/images/branding/logo-full.png"
              alt="Adify"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-400">
              {formatCoins(userStats.pointsBalance)} AD COINS
            </p>
            <p className="text-xs text-slate-400">{getDisplayName()}</p>
          </div>
        </div>

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

        <main className="space-y-6">
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
        </main>
      </div>

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
