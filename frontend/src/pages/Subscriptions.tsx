import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import SubscriptionPlans from '../components/SubscriptionPlans'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'

interface SubscriptionStatus {
  tier: string
  subscriptionId?: string
  subscriptionStatus?: string
  subscriptionStartDate?: string
  subscriptionEndDate?: string
}

export default function Subscriptions() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const API_URL = API_BASE_URL
      const res = await fetch(`${API_URL}/api/subscriptions/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setSubscriptionStatus(data)
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (tier: 'Elite') => {
    try {
      const token = session?.access_token
      if (!token) return

      const API_URL = API_BASE_URL
      const res = await fetch(`${API_URL}/api/subscriptions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      })

      if (res.ok) {
        const data = await res.json()
        // Redirect to PayPal approval URL
        if (data.approvalUrl) {
          window.location.href = data.approvalUrl
        }
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create subscription')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Failed to create subscription. Please try again.')
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    try {
      const token = session?.access_token
      if (!token) return

      const API_URL = import.meta.env.VITE_API_URL || 'https://api.adrevtechnologies.com'
      const res = await fetch(`${API_URL}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'User requested cancellation' }),
      })

      if (res.ok) {
        alert('Subscription cancelled successfully')
        fetchSubscriptionStatus()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const currentTier = subscriptionStatus?.tier || 'Bronze'

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-2">Subscription Plans</h1>
      <p className="text-gray-400 mb-6">
        Upgrade to premium and unlock more videos without forced ads
      </p>

      {/* Current subscription status */}
      {subscriptionStatus && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Current Plan:{' '}
                <span className="text-purple-400">{currentTier}</span>
              </h3>
              {subscriptionStatus.subscriptionStatus && (
                <p className="text-sm text-gray-400">
                  Status: {subscriptionStatus.subscriptionStatus}
                </p>
              )}
            </div>
            {currentTier !== 'Bronze' &&
              subscriptionStatus.subscriptionStatus === 'ACTIVE' && (
                <Button
                  onClick={handleCancelSubscription}
                  variant="secondary"
                  size="sm"
                >
                  Cancel Subscription
                </Button>
              )}
          </div>
        </Card>
      )}

      {/* Benefits comparison */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Plan Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-400">Feature</th>
                <th className="py-3 px-4 text-center">Bronze (Free)</th>
                <th className="py-3 px-4 text-center">Silver</th>
                <th className="py-3 px-4 text-center">Gold</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4">Videos per day</td>
                <td className="py-3 px-4 text-center">30</td>
                <td className="py-3 px-4 text-center">30</td>
                <td className="py-3 px-4 text-center text-green-400 font-bold">
                  40
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4">Forced interstitial ads</td>
                <td className="py-3 px-4 text-center text-red-400">Yes</td>
                <td className="py-3 px-4 text-center text-green-400">No</td>
                <td className="py-3 px-4 text-center text-green-400">No</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4">Revenue share</td>
                <td className="py-3 px-4 text-center">85%</td>
                <td className="py-3 px-4 text-center">85%</td>
                <td className="py-3 px-4 text-center">85%</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4">Priority support</td>
                <td className="py-3 px-4 text-center text-red-400">No</td>
                <td className="py-3 px-4 text-center text-green-400">Yes</td>
                <td className="py-3 px-4 text-center text-green-400">Yes</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Exclusive badges</td>
                <td className="py-3 px-4 text-center text-red-400">No</td>
                <td className="py-3 px-4 text-center text-red-400">No</td>
                <td className="py-3 px-4 text-center text-green-400">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Subscription plans */}
      <SubscriptionPlans
        currentTier={currentTier}
        onSubscribe={handleSubscribe}
      />

      {/* FAQ */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-1">
              How does billing work?
            </h4>
            <p className="text-gray-400 text-sm">
              Subscriptions are billed monthly through PayPal. You can cancel
              anytime.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">
              Can I change plans?
            </h4>
            <p className="text-gray-400 text-sm">
              Yes! You can upgrade or downgrade at any time. Changes take effect
              immediately.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">
              What happens if I cancel?
            </h4>
            <p className="text-gray-400 text-sm">
              You'll be downgraded to the Bronze (Free) tier at the end of your
              billing period.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">
              Do I still earn coins with a subscription?
            </h4>
            <p className="text-gray-400 text-sm">
              Absolutely! You earn the same 85% revenue share on all rewarded
              videos you watch.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
