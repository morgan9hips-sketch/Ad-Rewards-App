import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'

interface RevenuePool {
  id: number
  month: string
  countryCode: string
  totalRevenueUsd: number
  userShareUsd: number
  platformShareUsd: number
  totalCoinsIssued: string
  conversionRate: number
  impressionCount: number
  status: string
  distributedAt: string | null
  createdAt: string
}

export default function AdminRevenue() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [pools, setPools] = useState<RevenuePool[]>([])
  const [betaDebt, setBetaDebt] = useState(0)
  const [createPoolLoading, setCreatePoolLoading] = useState(false)
  const [month, setMonth] = useState('')
  const [revenue, setRevenue] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchRevenuePools()
    fetchBetaDebt()
  }, [])

  const fetchRevenuePools = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/admin/revenue/pools`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setPools(data.pools || [])
      }
    } catch (error) {
      console.error('Error fetching pools:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBetaDebt = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats/beta-debt`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setBetaDebt(data.totalBetaDebtUsd || 0)
      }
    } catch (error) {
      console.error('Error fetching beta debt:', error)
    }
  }

  const handleCreatePools = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatePoolLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/revenue/create-pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          month,
          monetagRevenueUsd: parseFloat(revenue),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Revenue pools created successfully!' })
        setMonth('')
        setRevenue('')
        fetchRevenuePools()
        fetchBetaDebt()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create pools' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setCreatePoolLoading(false)
    }
  }

  const handleDistributePool = async (poolId: number) => {
    if (!confirm('Are you sure you want to distribute this pool? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/revenue/distribute/${poolId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Revenue distributed successfully!' })
        fetchRevenuePools()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to distribute revenue' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Monetag Revenue Management 💰</h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/30 border border-green-600/50 text-green-400'
              : 'bg-red-900/30 border border-red-600/50 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Beta Debt Card */}
      <Card className="mb-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-600/50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Total Beta Debt</h2>
          <p className="text-4xl font-bold text-purple-400">${betaDebt.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-2">
            Estimated amount owed to beta users with 1.5x multiplier
          </p>
        </div>
      </Card>

      {/* Create Revenue Pools */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Create Monthly Revenue Pools</h2>
        <p className="text-gray-400 text-sm mb-4">
          Enter the total Monetag revenue for the month to create revenue pools by country.
        </p>

        <form onSubmit={handleCreatePools} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Month (YYYY-MM)
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Total Monetag Revenue (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <Button type="submit" fullWidth disabled={createPoolLoading}>
            {createPoolLoading ? 'Creating Pools...' : 'Create Revenue Pools'}
          </Button>
        </form>
      </Card>

      {/* Revenue Pools List */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Revenue Pools</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : pools.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No revenue pools yet. Create one above to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {pools.map((pool) => (
              <div
                key={pool.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {pool.month} - {pool.countryCode}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Created {new Date(pool.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pool.status === 'completed'
                        ? 'bg-green-900/50 text-green-400'
                        : pool.status === 'distributing'
                          ? 'bg-yellow-900/50 text-yellow-400'
                          : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {pool.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="text-white font-semibold">
                      ${pool.totalRevenueUsd.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User Share (85%)</p>
                    <p className="text-green-400 font-semibold">
                      ${pool.userShareUsd.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Platform Share (15%)</p>
                    <p className="text-purple-400 font-semibold">
                      ${pool.platformShareUsd.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Coins Issued</p>
                    <p className="text-yellow-400 font-semibold">
                      {pool.totalCoinsIssued}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Conversion Rate</p>
                    <p className="text-white">
                      ${pool.conversionRate.toFixed(8)} per coin
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Impressions</p>
                    <p className="text-white">{pool.impressionCount}</p>
                  </div>
                </div>

                {pool.status === 'pending' && (
                  <Button
                    onClick={() => handleDistributePool(pool.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Distribute to Users
                  </Button>
                )}

                {pool.status === 'completed' && pool.distributedAt && (
                  <p className="text-sm text-gray-400 text-center">
                    Distributed on {new Date(pool.distributedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
