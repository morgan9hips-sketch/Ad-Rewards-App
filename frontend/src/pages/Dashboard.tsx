import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import EarningsChart from '../components/EarningsChart'
import TierProgress from '../components/TierProgress'
import ProfileSetup from '../components/ProfileSetup'
import ExpiryWarning from '../components/ExpiryWarning'
import CoinValuationTicker from '../components/CoinValuationTicker'
import RecentWithdrawals from '../components/RecentWithdrawals'
import PlatformStats from '../components/PlatformStats'
import TermsAcceptanceModal from '../components/TermsAcceptanceModal'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'

// UI configuration constants
const NEW_USER_THRESHOLD_HOURS = 24
const CONVERSION_THRESHOLD_COINS = 150000

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
  createdAt: string
}

export default function Dashboard() {
  const { user, session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      // Fetch balance
      const balanceRes = await fetch(`${API_BASE_URL}/api/user/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData)
      }

      // Fetch profile
      const profileRes = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)

        // Show profile setup if not completed
        if (!profileData.profileSetupCompleted) {
          setShowProfileSetup(true)
        }

        // Show terms acceptance modal if not accepted
        if (!profileData.acceptedTermsAt) {
          setShowTermsModal(true)
        }
      }

      // Fetch recent transactions
      const txRes = await fetch(
        `${API_BASE_URL}/api/user/transactions?perPage=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    if (!profile) return 'Welcome!'

    const displayName =
      profile.displayName || user?.email?.split('@')[0] || 'User'
    const hoursSinceCreation = Math.floor(
      (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60),
    )

    // New user check
    if (hoursSinceCreation < NEW_USER_THRESHOLD_HOURS) {
      return `Welcome, ${displayName}! 🎉`
    }

    return `Welcome back, ${displayName}! 👋`
  }

  const getSubGreeting = () => {
    if (!profile) return ''

    const hoursSinceCreation = Math.floor(
      (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60),
    )

    // New user sub-greeting
    if (hoursSinceCreation < NEW_USER_THRESHOLD_HOURS) {
      return 'Ready to start earning? Watch your first ad below!'
    }

    return ''
  }

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false)
    // Refresh profile data
    fetchDashboardData()
  }

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
        // Refresh profile data
        fetchDashboardData()
      } else {
        console.error('Failed to accept terms')
      }
    } catch (error) {
      console.error('Error accepting terms:', error)
    }
  }

  const earningsData = [
    { date: 'Mon', amount: 2.5 },
    { date: 'Tue', amount: 3.2 },
    { date: 'Wed', amount: 4.1 },
    { date: 'Thu', amount: 3.8 },
    { date: 'Fri', amount: 5.2 },
    { date: 'Sat', amount: 4.5 },
    { date: 'Sun', amount: 3.9 },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      {/* Terms Acceptance Modal */}
      {showTermsModal && <TermsAcceptanceModal onAccept={handleTermsAccept} />}

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <ProfileSetup onComplete={handleProfileSetupComplete} />
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{getGreeting()}</h1>
        {getSubGreeting() && (
          <p className="text-gray-400 mt-2">{getSubGreeting()}</p>
        )}
      </div>

      {/* Expiry Warnings */}
      <ExpiryWarning />

      {/* Live Coin Valuation Ticker */}
      <CoinValuationTicker />

      {/* Main Layout with Sidebar */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Coins Balance */}
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/images/branding/Adcoin medium 256x256.png"
                  alt="AdCoins balance"
                  className="w-8 h-8"
                />
                <h2 className="text-xl font-bold text-white">Your Balance</h2>
              </div>
              <p className="text-4xl font-bold text-yellow-500 mb-3">
                {balance ? parseInt(balance.coins).toLocaleString() : '0'} Coins
              </p>

              {/* Progress to conversion threshold */}
              {balance &&
                parseInt(balance.coins) < CONVERSION_THRESHOLD_COINS && (
                  <div className="bg-gray-800 p-3 rounded-lg mt-4 mb-4">
                    <p className="text-xs text-gray-300 mb-2">
                      📊 Progress to monthly conversion
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (parseInt(balance.coins) / CONVERSION_THRESHOLD_COINS) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {parseInt(balance.coins).toLocaleString()} /{' '}
                      {CONVERSION_THRESHOLD_COINS.toLocaleString()} coins (
                      {Math.floor(
                        (parseInt(balance.coins) / CONVERSION_THRESHOLD_COINS) *
                          100,
                      )}
                      %)
                    </p>
                  </div>
                )}

              <div className="bg-gray-800 p-3 rounded-lg mt-4 mb-4">
                <p className="text-xs text-gray-300 mb-2">
                  💡 Coins convert to cash when we receive ad revenue (monthly,
                  around the 25th)
                </p>
                <p className="text-xs text-green-400 font-semibold">
                  You always receive 85% of ad revenue!
                </p>
              </div>

              <Button fullWidth onClick={() => navigate('/withdrawals')}>
                Withdraw
              </Button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Next conversion: Feb 25-28, 2026
              </p>
            </div>
          </Card>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Total Coins</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {balance ? parseInt(balance.coins).toLocaleString() : '0'}
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Ads Watched</p>
                <p className="text-3xl font-bold text-purple-500">
                  {profile?.adsWatched || 0}
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Current Tier</p>
                <p className="text-3xl font-bold text-blue-500">
                  {profile?.tier || 'Bronze'}
                </p>
              </div>
            </Card>
          </div>

          <TierProgress
            currentTier={profile?.tier || 'Bronze'}
            adsWatched={profile?.adsWatched || 0}
            nextTierRequirement={50}
            nextTier="Silver"
          />

          {/* Quick Actions */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button fullWidth onClick={() => navigate('/ads')}>
                <span className="flex items-center justify-center gap-2">
                  <span>📺 Watch Videos</span>
                  <span className="flex items-center gap-1">
                    <img
                      src="/images/branding/Adcoin tiny 64x64.png"
                      alt="AdCoin"
                      className="w-5 h-5 inline"
                    />
                    <span>100</span>
                  </span>
                </span>
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => navigate('/game')}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🎮 Play Game</span>
                  <span className="flex items-center gap-1">
                    <img
                      src="/images/branding/Adcoin tiny 64x64.png"
                      alt="AdCoin"
                      className="w-5 h-5 inline"
                    />
                    <span>10</span>
                  </span>
                </span>
              </Button>
            </div>
          </Card>

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">
                Recent Transactions
              </h2>
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const coinsChange = BigInt(tx.coinsChange)

                  return (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center py-2 border-b border-gray-800"
                    >
                      <div>
                        <p className="text-white text-sm">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold flex items-center gap-1 justify-end ${coinsChange > 0 ? 'text-yellow-500' : 'text-gray-400'}`}
                        >
                          <span>
                            {coinsChange > 0 ? '+' : ''}
                            {tx.coinsChange}
                          </span>
                          <img
                            src="/images/branding/Adcoin tiny 64x64.png"
                            alt="AdCoins"
                            className="w-4 h-4 inline"
                          />
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button
                fullWidth
                variant="secondary"
                className="mt-4"
                onClick={() => navigate('/transactions')}
              >
                View All Transactions
              </Button>
            </Card>
          )}

          <Card>
            <h2 className="text-xl font-bold text-white mb-4">
              Earnings This Week
            </h2>
            <EarningsChart data={earningsData} />
          </Card>
        </div>

        {/* Social Proof Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <RecentWithdrawals />
          <PlatformStats />
        </div>
      </div>
    </div>
  )
}
