import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'

interface ExpiryReport {
  thisMonth: {
    expiredCoins: {
      amount: number
      value: number
      count: number
    }
    expiredCash: {
      amount: number
      value: number
      count: number
    }
    total: number
    usersAffected: number
  }
  allTime: {
    total: number
    recordCount: number
  }
}

interface ExpiredBalance {
  id: number
  userId: string
  userEmail: string
  displayName: string
  type: string
  amount: string
  cashValue: string
  reason: string
  expiredAt: string
}

export default function AdminExpiryIncome() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<ExpiryReport | null>(null)
  const [balances, setBalances] = useState<ExpiredBalance[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchReport()
    fetchBalances()
  }, [page])

  const fetchReport = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/admin/expiry-report`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setReport(data)
      }
    } catch (error) {
      console.error('Error fetching expiry report:', error)
    }
  }

  const fetchBalances = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(
        `${API_BASE_URL}/api/admin/expired-balances?page=${page}&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (res.ok) {
        const data = await res.json()
        setBalances(data.balances)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching expired balances:', error)
    } finally {
      setLoading(false)
    }
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
      <h1 className="text-3xl font-bold text-white mb-6">💰 Expiry Income Dashboard</h1>

      {report && (
        <>
          {/* This Month Summary */}
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">📅 This Month</h2>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Expired Coins</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {report.thisMonth.expiredCoins.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  R{report.thisMonth.expiredCoins.value.toFixed(2)} ({report.thisMonth.expiredCoins.count} users)
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Expired Cash</p>
                <p className="text-2xl font-bold text-red-500">
                  ${report.thisMonth.expiredCash.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  ({report.thisMonth.expiredCash.count} users)
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Total Recovered</p>
                <p className="text-2xl font-bold text-green-500">
                  R{report.thisMonth.total.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Users Affected</p>
                <p className="text-2xl font-bold text-blue-500">
                  {report.thisMonth.usersAffected}
                </p>
              </div>
            </div>
          </Card>

          {/* All Time Summary */}
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">📊 All Time</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Total Recovered Value</p>
                <p className="text-3xl font-bold text-green-500">
                  R{report.allTime.total.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Total Expiry Events</p>
                <p className="text-3xl font-bold text-purple-500">
                  {report.allTime.recordCount.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Expiry History Table */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">📋 Recent Expiries</h2>
        
        {balances.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No expired balances yet</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-2 text-gray-400 font-semibold">Date</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-semibold">User</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-semibold">Type</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">Amount</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">Cash Value</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((balance) => (
                    <tr key={balance.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                      <td className="py-3 px-2 text-gray-300 text-sm">
                        {new Date(balance.expiredAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-gray-300 text-sm">
                        <div>
                          <p className="font-semibold">{balance.displayName}</p>
                          <p className="text-xs text-gray-500">{balance.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                            balance.type === 'coins'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {balance.type === 'coins' ? (
                            <>
                              <img 
                                src="/images/branding/Adcoin tiny 64x64.png" 
                                alt="AdCoin" 
                                className="w-4 h-4"
                              />
                              <span>Coins</span>
                            </>
                          ) : (
                            '💵 Cash'
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-300">
                        {balance.type === 'coins'
                          ? `${parseFloat(balance.amount).toLocaleString()} coins`
                          : `$${parseFloat(balance.amount).toFixed(2)}`}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-green-400">
                        R{parseFloat(balance.cashValue).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-sm">
                        {balance.reason === 'coin_inactivity' && '30 days inactive'}
                        {balance.reason === 'cash_inactivity' && '90 days inactive'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
