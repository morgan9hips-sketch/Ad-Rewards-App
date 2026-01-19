import { useState, useEffect } from 'react'
import { api, endpoints } from '../lib/api'
import {
  formatCurrency,
  getCurrencyInfo,
  validateWithdrawalAmount,
} from '../lib/currency'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

interface Transaction {
  id: number
  type: 'earning' | 'withdrawal'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
}

interface WalletStats {
  totalEarned: number
  currentBalance: number
  totalWithdrawn: number
  pendingWithdrawals: number
  currency: string
}

export default function Wallet() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<WalletStats>({
    totalEarned: 0,
    currentBalance: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    currency: 'ZAR', // Default to ZAR for AdMob compliance
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      setLoading(true)

      // Fetch user profile with wallet data
      const profile = await api.get(endpoints.user.profile)

      // Fetch withdrawals
      const withdrawals = await api.get(endpoints.withdrawals)

      // Get user's currency (defaults to ZAR for South African users)
      const userCurrency = profile.currency || 'ZAR'

      // Calculate stats from real data
      const totalWithdrawn = withdrawals
        .filter((w: any) => w.status === 'completed')
        .reduce((sum: number, w: any) => sum + w.amount, 0)

      const pendingWithdrawals = withdrawals
        .filter((w: any) => w.status === 'pending')
        .reduce((sum: number, w: any) => sum + w.amount, 0)

      setStats({
        totalEarned: (profile.totalEarned || 0) / 100, // Convert cents to currency units
        currentBalance: (profile.walletBalance || 0) / 100,
        totalWithdrawn: totalWithdrawn / 100,
        pendingWithdrawals: pendingWithdrawals / 100,
        currency: userCurrency,
      })

      // Convert withdrawals to transaction format
      const transactionHistory = withdrawals.map((w: any) => ({
        id: w.id,
        type: 'withdrawal' as const,
        amount: -(w.amount / 100),
        description: `PayPal withdrawal to ${w.paypalEmail}`,
        status: w.status,
        createdAt: w.createdAt,
      }))

      setTransactions(transactionHistory)
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
      // Set empty state on error
      setStats({
        totalEarned: 0,
        currentBalance: 0,
        totalWithdrawn: 0,
        pendingWithdrawals: 0,
        currency: 'ZAR', // Default to ZAR for safety
      })
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || !paypalEmail) return

    const amount = parseFloat(withdrawAmount)
    const validation = validateWithdrawalAmount(amount, stats.currency)

    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    if (amount > stats.currentBalance) {
      alert('Insufficient balance')
      return
    }

    setWithdrawing(true)
    try {
      await api.post(endpoints.withdrawals, {
        amount: Math.round(amount * 100), // Convert to cents
        method: 'paypal',
        paypalEmail,
        currency: stats.currency, // Include currency in request
      })

      // Refresh wallet data
      await fetchWalletData()

      setWithdrawAmount('')
      setPaypalEmail('')
      setShowWithdrawForm(false)
    } catch (error: any) {
      console.error('Withdrawal failed:', error)
      alert(error.message || 'Withdrawal failed. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionIcon = (type: string, status: string) => {
    if (type === 'earning') return '💰'
    if (status === 'pending') return '⏳'
    if (status === 'failed') return '❌'
    return '💸'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">💳 My Wallet</h1>

      {/* Wallet Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <h3 className="text-sm text-gray-400 mb-1">Current Balance</h3>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(
                Math.round(stats.currentBalance * 100),
                stats.currency,
              )}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <h3 className="text-sm text-gray-400 mb-1">Total Earned</h3>
            <p className="text-2xl font-bold text-blue-400">
              {formatCurrency(
                Math.round(stats.totalEarned * 100),
                stats.currency,
              )}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <h3 className="text-sm text-gray-400 mb-1">Total Withdrawn</h3>
            <p className="text-2xl font-bold text-purple-400">
              {formatCurrency(
                Math.round(stats.totalWithdrawn * 100),
                stats.currency,
              )}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <h3 className="text-sm text-gray-400 mb-1">Pending</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {formatCurrency(
                Math.round(stats.pendingWithdrawals * 100),
                stats.currency,
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Withdraw Section */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">💸 Withdraw Earnings</h2>
          {!showWithdrawForm && (
            <Button
              onClick={() => setShowWithdrawForm(true)}
              disabled={
                getCurrencyInfo(stats.currency).minWithdrawal >
                Math.round(stats.currentBalance * 100)
              }
            >
              Withdraw
            </Button>
          )}
        </div>

        {getCurrencyInfo(stats.currency).minWithdrawal >
          Math.round(stats.currentBalance * 100) && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 p-3 rounded mb-4">
            {`Minimum withdrawal amount is ${formatCurrency(
              getCurrencyInfo(stats.currency).minWithdrawal,
              stats.currency,
            )}. Keep watching ads to reach the minimum!`}
          </div>
        )}

        {showWithdrawForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Withdrawal Amount ({stats.currency})
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder={`Enter amount (min ${formatCurrency(
                  getCurrencyInfo(stats.currency).minWithdrawal,
                  stats.currency,
                )})`}
                min={getCurrencyInfo(stats.currency).minWithdrawal / 100}
                max={stats.currentBalance}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                PayPal Email
              </label>
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="your-paypal@email.com"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !paypalEmail || withdrawing}
                className="flex-1"
              >
                {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowWithdrawForm(false)
                  setWithdrawAmount('')
                  setPaypalEmail('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Transaction History */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">
          📊 Transaction History
        </h2>

        {transactions.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No transactions yet"
            description="Start watching ads to see your earning history"
          />
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getTransactionIcon(transaction.type, transaction.status)}
                  </span>
                  <div>
                    <p className="text-white font-medium">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                    {transaction.status !== 'completed' && (
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                          transaction.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`font-bold text-lg ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
