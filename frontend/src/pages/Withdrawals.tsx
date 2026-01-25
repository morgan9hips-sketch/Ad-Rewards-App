import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import WithdrawalSuccessModal from '../components/WithdrawalSuccessModal'
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
  coinsWithdrawn?: number
  rateMultiplier?: number
}

interface UserBalance {
  coins: string
  cashLocal: string
  cashLocalFormatted: string
  displayCurrency: string
  currencySymbol: string
  exchangeRate: string
  minWithdrawal: number
  minWithdrawalFormatted: string
}

interface CoinValuation {
  valuePer100Coins: number
  currencyCode: string
  currencySymbol: string
}

interface WithdrawalResult {
  success: boolean
  withdrawalId: string
  amountLocal: number
  currency: string
  coinsWithdrawn: number
  rateMultiplier: number
  transactionId: string
  paypalEmail: string
}

export default function Withdrawals() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [coinValuation, setCoinValuation] = useState<CoinValuation | null>(null)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [paypalEmail, setPaypalEmail] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [withdrawalResult, setWithdrawalResult] = useState<WithdrawalResult | null>(null)

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

      // Fetch coin valuation
      const valuationRes = await fetch(`${API_BASE_URL}/api/coin-valuation`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (valuationRes.ok) {
        const valuationData = await valuationRes.json()
        setCoinValuation(valuationData)
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

  const calculateEstimate = () => {
    if (!balance || !coinValuation) return null

    const coins = parseInt(balance.coins)
    const baselineValue = 1.0
    const valuePer100Coins = coinValuation.valuePer100Coins
    const currentMultiplier = valuePer100Coins / baselineValue

    // Calculate estimated value
    const estimatedValue = (coins / 100) * valuePer100Coins

    // Calculate range (±10% variance)
    const lowEstimate = estimatedValue * 0.9
    const highEstimate = estimatedValue * 1.1

    return {
      low: Math.round(lowEstimate),
      high: Math.round(highEstimate),
      multiplier: currentMultiplier,
      symbol: coinValuation.currencySymbol,
    }
  }

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paypalEmail || !paypalEmail.includes('@')) {
      alert('Please enter a valid PayPal email address')
      return
    }

    const coins = balance ? parseInt(balance.coins) : 0
    const estimate = calculateEstimate()
    
    if (!estimate) {
      alert('Unable to calculate withdrawal estimate')
      return
    }

    if (
      !confirm(
        `Request withdrawal of ${coins.toLocaleString()} coins?\n\nEstimated payout: ${estimate.symbol}${estimate.low} - ${estimate.symbol}${estimate.high}\n\nActual amount will be calculated at processing time based on current regional ad performance.`,
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
        // Show success modal with withdrawal details
        setWithdrawalResult({
          success: true,
          withdrawalId: result.withdrawalId,
          amountLocal: parseFloat(result.amountLocal),
          currency: result.currency,
          coinsWithdrawn: coins,
          rateMultiplier: estimate.multiplier,
          transactionId: result.withdrawalId,
          paypalEmail,
        })
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

  const coins = balance ? parseInt(balance.coins) : 0
  const estimate = calculateEstimate()

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">💸 Withdrawals</h1>

      {/* Withdrawal Success Modal */}
      {withdrawalResult && (
        <WithdrawalSuccessModal
          coinsWithdrawn={withdrawalResult.coinsWithdrawn}
          amountReceived={withdrawalResult.amountLocal}
          currencyCode={withdrawalResult.currency}
          rateMultiplier={withdrawalResult.rateMultiplier}
          transactionId={withdrawalResult.transactionId}
          paypalEmail={withdrawalResult.paypalEmail}
          onClose={() => {
            setWithdrawalResult(null)
            navigate('/transactions')
          }}
        />
      )}

      {/* Balance Card with Estimate */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Ready to Withdraw?</h2>
        
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <div className="text-center py-2">
            <div className="text-sm text-gray-400 mb-1">Your Balance</div>
            <div className="text-3xl font-bold text-yellow-500 mb-3">
              {coins.toLocaleString()} AdCoins
            </div>
          </div>

          {estimate && coins > 0 && (
            <>
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="text-sm text-gray-400 mb-2">
                  Estimated Payout:
                </div>
                <div className="text-2xl font-bold text-green-500 mb-2">
                  {estimate.symbol}{estimate.low} - {estimate.symbol}{estimate.high}
                </div>
                <div className="text-xs text-gray-500">
                  Based on current regional ad performance
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Regional Performance:</span>
                  <span className={`font-semibold ${
                    estimate.multiplier > 1.0 ? 'text-green-500' : 
                    estimate.multiplier < 1.0 ? 'text-yellow-500' : 
                    'text-gray-400'
                  }`}>
                    {estimate.multiplier.toFixed(2)}x
                    {estimate.multiplier > 1.0 && ' 🔥'}
                    {estimate.multiplier < 1.0 && ' ⚠️'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {estimate.multiplier > 1.0 && 
                    `${((estimate.multiplier - 1) * 100).toFixed(0)}% above average this month`
                  }
                  {estimate.multiplier < 1.0 && 
                    `${((1 - estimate.multiplier) * 100).toFixed(0)}% below average this month`
                  }
                  {estimate.multiplier === 1.0 && 'Stable'}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mb-4">
          <p className="text-yellow-300 text-sm text-center">
            ⚠️ Actual amount calculated at processing time
          </p>
        </div>

        {coins > 0 && !showForm && (
          <Button fullWidth className="mt-4" onClick={() => setShowForm(true)}>
            Confirm Withdrawal
          </Button>
        )}

        {coins === 0 && (
          <Button
            fullWidth
            variant="secondary"
            className="mt-4"
            onClick={() => navigate('/ads')}
          >
            Watch Ads to Earn Coins
          </Button>
        )}
      </Card>

      {/* Withdrawal Form */}
      {showForm && coins > 0 && (
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Enter PayPal Details
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

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowForm(false)
                  setPaypalEmail('')
                }}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Submit Request'}
              </button>
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
                    <span className="text-white font-semibold">
                      {withdrawal.amountLocal} {withdrawal.currencyCode}
                    </span>
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
