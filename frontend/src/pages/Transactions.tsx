import { useState, useEffect } from 'react'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import CurrencyDisplay from '../components/CurrencyDisplay'
import { useAuth } from '../contexts/AuthContext'

interface Transaction {
  id: number
  type: string
  coinsChange: string
  cashChangeUsd: string
  coinsBalanceAfter: string | null
  cashBalanceAfterUsd: string | null
  description: string
  createdAt: string
}

export default function Transactions() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTransactions()
  }, [page, filter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const token = session?.access_token
      if (!token) return

      const filterParam = filter !== 'all' ? `&type=${filter}` : ''
      const res = await fetch(
        `http://localhost:4000/api/user/transactions?page=${page}&perPage=20${filterParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions || [])
        setTotalPages(data.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      coin_earned: '🪙 Coins Earned',
      coin_conversion: '💱 Coin Conversion',
      withdrawal: '💸 Withdrawal',
      admin_adjustment: '⚙️ Admin Adjustment',
      badge_reward: '🏆 Badge Reward',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      coin_earned: 'text-yellow-500',
      coin_conversion: 'text-blue-500',
      withdrawal: 'text-red-500',
      admin_adjustment: 'text-purple-500',
      badge_reward: 'text-green-500',
    }
    return colors[type] || 'text-gray-400'
  }

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">
        Transaction History
      </h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'coin_earned', 'coin_conversion', 'withdrawal'].map(
          (filterType) => (
            <button
              key={filterType}
              onClick={() => {
                setFilter(filterType)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {filterType === 'all'
                ? 'All'
                : getTypeLabel(filterType)
                    .replace(/[🪙💱💸⚙️🏆]/g, '')
                    .trim()}
            </button>
          ),
        )}
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No transactions yet"
          description="Start watching ads to earn coins and build your transaction history!"
        />
      ) : (
        <>
          <Card className="mb-6">
            <div className="space-y-3">
              {transactions.map((tx) => {
                const coinsChange = BigInt(tx.coinsChange)
                const cashChange = parseFloat(tx.cashChangeUsd)

                return (
                  <div
                    key={tx.id}
                    className="flex justify-between items-start p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className={`font-semibold ${getTypeColor(tx.type)}`}>
                        {getTypeLabel(tx.type)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {tx.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      {coinsChange !== BigInt(0) && (
                        <p
                          className={`text-sm font-bold ${
                            coinsChange > 0
                              ? 'text-yellow-500'
                              : 'text-gray-400'
                          }`}
                        >
                          {coinsChange > 0 ? '+' : ''}
                          {tx.coinsChange} 🪙
                        </p>
                      )}
                      {cashChange !== 0 && (
                        <CurrencyDisplay
                          amountUsd={Math.abs(cashChange)}
                          showBoth={false}
                          size="sm"
                          className={`font-bold ${
                            cashChange > 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        />
                      )}
                      {tx.coinsBalanceAfter && (
                        <p className="text-xs text-gray-500 mt-1">
                          Balance: {tx.coinsBalanceAfter} 🪙
                        </p>
                      )}
                      {tx.cashBalanceAfterUsd &&
                        parseFloat(tx.cashBalanceAfterUsd) > 0 && (
                          <CurrencyDisplay
                            amountUsd={parseFloat(tx.cashBalanceAfterUsd)}
                            showBoth={false}
                            size="sm"
                            className="text-xs text-gray-500"
                          />
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
