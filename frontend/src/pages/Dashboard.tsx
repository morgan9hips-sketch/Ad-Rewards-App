import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import EarningsChart from '../components/EarningsChart'
import TierProgress from '../components/TierProgress'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile] = useState({
    walletBalance: 0,
    totalEarned: 0,
    adsWatched: 0,
    tier: 'Bronze',
  })

  useEffect(() => {
    // Simulate loading user profile
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

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
      <h1 className="text-3xl font-bold text-white mb-6">
        Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Wallet Balance</p>
            <p className="text-3xl font-bold text-green-500">
              ${(profile.walletBalance / 100).toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Total Earned</p>
            <p className="text-3xl font-bold text-blue-500">
              ${(profile.totalEarned / 100).toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Ads Watched</p>
            <p className="text-3xl font-bold text-purple-500">{profile.adsWatched}</p>
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

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Earnings This Week</h2>
        <EarningsChart data={earningsData} />
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Button fullWidth>Watch Ads</Button>
          <Button fullWidth variant="secondary">
            Withdraw Earnings
          </Button>
        </div>
      </Card>
    </div>
  )
}
