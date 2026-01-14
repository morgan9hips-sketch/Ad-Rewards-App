import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import EarningsChart from '../components/EarningsChart'
import TierProgress from '../components/TierProgress'
import { useAuth } from '../contexts/AuthContext'

interface UserBalance {
  coins: string
  cashUSD: string
  cashLocal: string
  currency: string
  exchangeRate: string
}

interface Transaction {
  id: number
  type: string
  coinsChange: string
  cashChangeUsd: string
  description: string
  createdAt: string
}

export default function Dashboard() {
  const { user, session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [profile, setProfile] = useState({
    walletBalance: 0,
    totalEarned: 0,
    adsWatched: 0,
    tier: 'Bronze',
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      // Fetch balance
      const balanceRes = await fetch('http://localhost:4000/api/user/balance', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData)
      }

      // Fetch profile
      const profileRes = await fetch('http://localhost:4000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      }

      // Fetch recent transactions
      const txRes = await fetch('http://localhost:4000/api/user/transactions?perPage=5', {
        headers: { Authorization: `Bearer ${token}` },
      })
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

  const earningsData = [
    { date: 'Mon', amount: 2.5 },
    { date: 'Tue', amount: 3.2 },
    { date: 'Wed', amount: 4.1 },
    { date: 'Thu', amount: 3.8 },
    { date: 'Fri', amount: 5.2 },
    { date: 'Sat', amount: 4.5 },
    { date: 'Sun', amount: 3.9 },
  ]

  const formatCurrency = (amount: string, currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      ZAR: 'R',
      CAD: 'C$',
      AUD: 'A$',
      INR: '₹',
      NGN: '₦',
    }
    return `${symbols[currency] || currency} ${parseFloat(amount).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">
        Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
      </h1>

      {/* Two Wallet System */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Coins Wallet */}
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-3">🪙 Coins Wallet</h2>
            <p className="text-4xl font-bold text-yellow-500 mb-3">
              {balance ? parseInt(balance.coins).toLocaleString() : '0'} Coins
            </p>
            <p className="text-sm text-gray-400 mb-2">(Pending)</p>
            
            <div className="bg-gray-800 p-3 rounded-lg mt-4">
              <p className="text-xs text-gray-300 mb-2">
                💡 Coins convert to cash when we receive ad revenue (monthly, around the 25th)
              </p>
              <p className="text-xs text-green-400 font-semibold">
                You always receive 85% of ad revenue!
              </p>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Next conversion: Feb 25-28, 2026
            </p>
          </div>
        </Card>

        {/* Cash Wallet */}
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-3">💵 Cash Wallet</h2>
            <p className="text-4xl font-bold text-green-500 mb-1">
              {balance ? formatCurrency(balance.cashLocal, balance.currency) : '$0.00'}
            </p>
            <p className="text-sm text-gray-400 mb-3">
              ({balance ? `$${parseFloat(balance.cashUSD).toFixed(2)} USD` : '$0.00 USD'})
            </p>
            
            <div className="bg-gray-800 p-3 rounded-lg mt-4 mb-4">
              <p className="text-xs text-gray-300 mb-1">Available to withdraw</p>
              <p className="text-xs text-gray-500">Minimum withdrawal: $10 USD</p>
            </div>
            
            <Button 
              fullWidth 
              onClick={() => navigate('/withdrawals')}
              disabled={balance ? parseFloat(balance.cashUSD) < 10 : true}
            >
              Withdraw via PayPal →
            </Button>
          </div>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Ads Watched</p>
            <p className="text-3xl font-bold text-purple-500">{profile.adsWatched}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Total Coins Earned</p>
            <p className="text-3xl font-bold text-yellow-500">
              {balance ? parseInt(balance.coins).toLocaleString() : '0'}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Current Tier</p>
            <p className="text-3xl font-bold text-blue-500">{profile.tier}</p>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <TierProgress
          currentTier={profile.tier}
          adsWatched={profile.adsWatched}
          nextTierRequirement={50}
          nextTier="Silver"
        />
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
          <div className="space-y-2">
            {transactions.map((tx) => {
              const coinsChange = BigInt(tx.coinsChange)
              const cashChange = parseFloat(tx.cashChangeUsd)
              
              return (
              <div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-800">
                <div>
                  <p className="text-white text-sm">{tx.description || tx.type}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {coinsChange !== BigInt(0) && (
                    <p className={`text-sm font-semibold ${coinsChange > 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                      {coinsChange > 0 ? '+' : ''}{tx.coinsChange} coins
                    </p>
                  )}
                  {cashChange !== 0 && (
                    <p className={`text-sm font-semibold ${cashChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {cashChange > 0 ? '+' : ''}${Math.abs(cashChange).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )})}
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

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Earnings This Week</h2>
        <EarningsChart data={earningsData} />
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Button fullWidth onClick={() => navigate('/ads')}>
            Watch Ads & Earn Coins
          </Button>
          <Button 
            fullWidth 
            variant="secondary"
            onClick={() => navigate('/withdrawals')}
          >
            Withdraw Earnings
          </Button>
        </div>
      </Card>
    </div>
  )
}
