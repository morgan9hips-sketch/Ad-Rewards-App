import { useState } from 'react'
import Button from './Button'
import Card from './Card'

interface SubscriptionPlan {
  tier: 'Elite'
  name: string
  price: string
  priceLocal: number
  currency: string
  symbol: string
  features: string[]
}

interface SubscriptionPlansProps {
  currentTier: string
  onSubscribe: (tier: 'Elite') => Promise<void>
}

export default function SubscriptionPlans({ currentTier, onSubscribe }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<boolean>(false)

  // Elite tier plan (R49/month or equivalent)
  const plan: SubscriptionPlan = {
    tier: 'Elite',
    name: 'Elite',
    price: 'R49',
    priceLocal: 49,
    currency: 'ZAR',
    symbol: 'R',
    features: [
      '20 opt-in videos per day',
      'No forced interstitial ads',
      'Banner ads still visible',
      'Priority support',
      'Unlimited mini games',
      'Same coin rewards as Free tier',
    ],
  }

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      await onSubscribe('Elite')
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(false)
    }
  }

  const isCurrentTier = currentTier === 'Elite'
  const isFree = currentTier === 'Free' || currentTier === 'Bronze'

  return (
    <div className="max-w-md mx-auto">
      <Card className="relative border-2 border-purple-500">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold">
            ⭐ ELITE MEMBERSHIP
          </span>
        </div>

        <div className="text-center mb-6 mt-2">
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-1">
            {plan.symbol}{plan.priceLocal}
          </div>
          <div className="text-sm text-gray-400">per month</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-400 mb-2">What you get:</div>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start text-gray-300">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-blue-300">
            <strong>Note:</strong> Elite subscription removes forced interstitial
            ads but keeps banner ads. You still earn the same coin amounts as
            Free tier users!
          </div>
        </div>

        {isCurrentTier ? (
          <Button disabled className="w-full bg-gray-700">
            ✓ Current Plan
          </Button>
        ) : (
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {loading ? 'Processing...' : isFree ? '⭐ Upgrade to Elite' : 'Switch to Elite'}
          </Button>
        )}
      </Card>
    </div>
  )
}
