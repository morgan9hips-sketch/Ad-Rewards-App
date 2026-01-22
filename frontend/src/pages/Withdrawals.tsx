import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import CurrencyDisplay from '../components/CurrencyDisplay'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'

interface Withdrawal {
  id: string
  amountUsd: string
  amountLocal: string
  currencyCode: string
  paypalEmail: string
  status: string
  requestedAt: string
  completedAt: string | null
}

interface UserBalance {
  coins: string
  cashUSD: string
  cashLocal: string
  currency: string
  exchangeRate: string
}

export default function Withdrawals() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [paypalEmail, setPaypalEmail] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [session?.access_token])

  const fetchData = async () => {
    try {
      setLoading(true)
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

      // Fetch withdrawal history
      const withdrawalsRes = await fetch(
        `${API_BASE_URL}/api/withdrawals/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paypalEmail || !paypalEmail.includes('@')) {
      alert('Please enter a valid PayPal email address')
      return
    }

    if (!balance || parseFloat(balance.cashUSD) < 10) {
      alert('Minimum withdrawal amount is $10 USD')
      return
    }

    if (
      !confirm(
        `Request withdrawal of ${balance.cashLocal} ${balance.currency} ($${balance.cashUSD} USD) to ${paypalEmail}?`,
      )
    ) {
      return
    }

    try {
      setProcessing(true)
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/withdrawals/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paypalEmail }),
      })

      const result = await res.json()

      if (result.success) {
        alert(
          `Withdrawal request submitted successfully!\n\nAmount: ${result.amountLocal} ${result.currency} ($${result.amountUSD} USD)\n\nYou will receive payment within 5-7 business days.`,
        )
        setShowForm(false)
        setPaypalEmail('')
        fetchData() // Refresh data
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error)
      alert('Failed to request withdrawal. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-900 text-yellow-300',
      processing: 'bg-blue-900 text-blue-300',
      completed: 'bg-green-900 text-green-300',
      failed: 'bg-red-900 text-red-300',
    }
    return colors[status] || 'bg-gray-900 text-gray-300'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const canWithdraw = balance && parseFloat(balance.cashUSD) >= 10

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">💸 Withdrawals</h1>

      {/* Balance Card */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Available Balance</h2>
        <div className="text-center py-4">
          <CurrencyDisplay
            amountUsd={balance ? parseFloat(balance.cashUSD) : 0}
            showBoth={true}
            size="lg"
            className="text-green-500"
          />
        </div>

        {!canWithdraw && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mt-4">
            <p className="text-yellow-300 text-sm text-center">
              ⚠️ Minimum withdrawal amount is $10 USD
            </p>
          </div>
        )}

        {!showForm && canWithdraw && (
          <Button fullWidth className="mt-4" onClick={() => setShowForm(true)}>
            Request Withdrawal
          </Button>
        )}

        {!canWithdraw && (
          <Button
            fullWidth
            variant="secondary"
            className="mt-4"
            onClick={() => navigate('/ads')}
          >
            Watch Ads to Earn More
          </Button>
        )}
      </Card>

      {/* Withdrawal Form */}
      {showForm && canWithdraw && (
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Request Withdrawal
          </h2>
          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                PayPal Email Address *
              </label>
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                placeholder="your-email@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Make sure this email is connected to your PayPal account
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-semibold">
                  <CurrencyDisplay
                    amountUsd={balance ? parseFloat(balance.cashUSD) : 0}
                    showBoth={true}
                    size="sm"
                  />
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowForm(false)
                  setPaypalEmail('')
                }}
              >
                Cancel
              </Button>
              <Button type="submit" fullWidth disabled={processing}>
                {processing ? 'Processing...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Withdrawal History */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">
          Withdrawal History
        </h2>
        {withdrawals.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No withdrawals yet"
            description="Your withdrawal history will appear here once you make your first withdrawal request."
          />
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CurrencyDisplay
                      amountUsd={parseFloat(withdrawal.amountUsd)}
                      showBoth={true}
                      size="sm"
                      className="text-white font-semibold"
                    />
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(withdrawal.status)}`}
                  >
                    {withdrawal.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  To: {withdrawal.paypalEmail}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Requested: {new Date(withdrawal.requestedAt).toLocaleString()}
                </p>
                {withdrawal.completedAt && (
                  <p className="text-xs text-gray-600">
                    Completed:{' '}
                    {new Date(withdrawal.completedAt).toLocaleString()}
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
