import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { API_BASE_URL } from '../config/api'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'

const progressWidthClasses = [
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

interface ReferralStats {
  totalReferrals: number
  pendingReferrals: number
  activeReferrals: number
  qualifiedReferrals: number
  paidReferrals: number
  totalCoinsEarned: number
  currentEarnRate: number
  nextMilestoneTarget: number | null
  nextMilestoneRate: number | null
}

interface Referral {
  id: string
  refereeName: string
  status: string
  createdAt: string
  qualifiedAt: string | null
  paidAt: string | null
  refereeTotalCoins: string
}

export default function Referrals() {
  const { session } = useAuth()
  const { formatAmount } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      // Fetch referral code
      const codeRes = await fetch(`${API_BASE_URL}/api/referrals/my-code`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (codeRes.ok) {
        const codeData = await codeRes.json()
        setReferralCode(codeData.referralCode)
        setReferralLink(codeData.referralLink)
      }

      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/api/referrals/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
        setReferrals(statsData.referrals)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareViaWhatsApp = () => {
    const message = `Join me on Adify and earn coins! ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const shareViaTwitter = () => {
    const message = `Join me on Adify and earn coins! Use my referral code: ${referralCode}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`,
      '_blank',
    )
  }

  const shareViaEmail = () => {
    const subject = 'Join Adify with my referral!'
    const body = `Hi!\n\nI'm using Adify to earn coins by completing tasks and offers. Join me with my referral link:\n\n${referralLink}\n\nI earn a share of your task earnings, and you keep 100% of your rewards.`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const formatCoins = (coins: number | string) => {
    const value = Number(coins || 0)
    return Number.isFinite(value) ? value.toLocaleString() : '0'
  }

  const formatCoinsWithLocal = (coins: number | string) => {
    const numericCoins = Number(coins || 0)
    return `${formatCoins(numericCoins)} AD COINS (${formatAmount(numericCoins / 100)})`
  }

  const progressTarget = stats?.nextMilestoneTarget
  const activeReferrals = stats?.activeReferrals || 0
  const milestoneProgress = progressTarget
    ? Math.min(100, Math.round((activeReferrals / progressTarget) * 100))
    : 100
  const milestoneProgressClass =
    progressWidthClasses[
      Math.max(0, Math.min(20, Math.round(milestoneProgress / 5)))
    ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner
          size="large"
          withLogo={true}
          text="Loading Referrals..."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🎁 Referral Program</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-400">Total Referrals</div>
            <div className="text-2xl font-bold text-white">
              {stats?.totalReferrals || 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-400">Active Referrals</div>
            <div className="text-2xl font-bold text-green-500">
              {stats?.activeReferrals || 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-400">Current Earn Rate</div>
            <div className="text-2xl font-bold text-blue-500">
              {Math.round((stats?.currentEarnRate || 0.1) * 100)}%
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-orange-500">
              {stats?.pendingReferrals || 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-400">Referral Share Earned</div>
            <div className="text-2xl font-bold text-yellow-500">
              {formatCoins(stats?.totalCoinsEarned || 0)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {formatAmount((stats?.totalCoinsEarned || 0) / 100)}
            </div>
          </Card>
        </div>

        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Milestone Boost</h2>
          {progressTarget ? (
            <>
              <p className="text-sm text-gray-300 mb-3">
                {activeReferrals}/{progressTarget} active referrals to unlock{' '}
                <span className="text-blue-400 font-semibold">
                  {Math.round((stats?.nextMilestoneRate || 0) * 100)}%
                </span>{' '}
                referral share.
              </p>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full bg-blue-500 transition-all duration-300 ${milestoneProgressClass}`}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-green-400">
              Maximum referral tier unlocked at 15% share.
            </p>
          )}
        </Card>

        {/* Referral Link */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-400 mb-2">Referral Code</div>
            <div className="text-lg font-mono font-bold text-yellow-500">
              {referralCode}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 mb-4 break-all">
            <div className="text-sm text-gray-400 mb-2">Referral Link</div>
            <div className="text-sm font-mono text-blue-400">
              {referralLink}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => copyToClipboard(referralLink)}
              variant="primary"
            >
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </Button>
            <Button onClick={shareViaWhatsApp} variant="secondary">
              📱 WhatsApp
            </Button>
            <Button onClick={shareViaTwitter} variant="secondary">
              🐦 Twitter
            </Button>
            <Button onClick={shareViaEmail} variant="secondary">
              📧 Email
            </Button>
          </div>
        </Card>

        {/* How it Works */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">1️⃣</div>
              <div>
                <div className="font-bold">Share your link</div>
                <div className="text-sm text-gray-400">
                  Send your referral link to friends and family
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">2️⃣</div>
              <div>
                <div className="font-bold">They sign up</div>
                <div className="text-sm text-gray-400">
                  Your friend creates an account using your referral code
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">3️⃣</div>
              <div>
                <div className="font-bold">They complete tasks</div>
                <div className="text-sm text-gray-400">
                  You earn an ongoing percentage of eligible referral task
                  rewards
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">4️⃣</div>
              <div>
                <div className="font-bold">Hit milestones for higher rates</div>
                <div className="text-sm text-gray-400">
                  3 active referrals = 12%, 10 active referrals = 15%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Your Referrals</h2>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">👥</div>
              <div>No referrals yet. Start sharing your link!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-white">
                      {referral.refereeName}
                    </div>
                    <div className="text-sm text-gray-400">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Lifetime earned:{' '}
                      {formatCoinsWithLocal(referral.refereeTotalCoins)}
                    </div>
                  </div>
                  <div>
                    {referral.status === 'active' && (
                      <span className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-full">
                        🔥 Active
                      </span>
                    )}
                    {referral.status === 'paid' && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                        ✓ Paid
                      </span>
                    )}
                    {referral.status === 'qualified' && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                        ⏳ Qualified
                      </span>
                    )}
                    {referral.status === 'pending' && (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-full">
                        ⏱️ Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
