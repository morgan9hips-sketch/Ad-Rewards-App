import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'

interface ReferralStats {
  totalReferrals: number
  pendingReferrals: number
  qualifiedReferrals: number
  paidReferrals: number
  totalCoinsEarned: number
}

interface Referral {
  id: string
  refereeName: string
  status: string
  createdAt: string
  qualifiedAt: string | null
  paidAt: string | null
}

export default function Referrals() {
  const { session } = useAuth()
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
    const message = `Join me on Adify and earn coins! Use my referral code: ${referralCode}\n${referralLink}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank'
    )
  }

  const shareViaTwitter = () => {
    const message = `Join me on Adify and earn coins! Use my referral code: ${referralCode}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`,
      '_blank'
    )
  }

  const shareViaEmail = () => {
    const subject = 'Join Adify with my referral!'
    const body = `Hi!\n\nI'm using Adify to earn coins by watching ads. Join me using my referral code: ${referralCode}\n\n${referralLink}\n\nYou'll get a bonus when you sign up!`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🎁 Referral Program</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-400">Total Referrals</div>
            <div className="text-2xl font-bold text-white">
              {stats?.totalReferrals || 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-400">Qualified</div>
            <div className="text-2xl font-bold text-green-500">
              {stats?.qualifiedReferrals || 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-400">Paid Out</div>
            <div className="text-2xl font-bold text-blue-500">
              {stats?.paidReferrals || 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-400">Coins Earned</div>
            <div className="text-2xl font-bold text-yellow-500">
              {stats?.totalCoinsEarned.toLocaleString() || 0}
            </div>
          </Card>
        </div>

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
            <div className="text-sm font-mono text-blue-400">{referralLink}</div>
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
                <div className="font-bold">They reach threshold</div>
                <div className="text-sm text-gray-400">
                  When they reach minimum withdrawal threshold, you both benefit
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">4️⃣</div>
              <div>
                <div className="font-bold">You earn 1000 coins!</div>
                <div className="text-sm text-gray-400">
                  Automatically credited to your account
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
                  </div>
                  <div>
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
