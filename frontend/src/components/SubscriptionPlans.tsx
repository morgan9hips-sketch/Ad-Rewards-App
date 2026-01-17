import { useState } from 'react'
import Button from './Button'
import Card from './Card'

interface SubscriptionPlan {
  tier: 'Silver' | 'Gold'
  name: string
  price: string
  priceLocal: number
  currency: string
  symbol: string
  features: string[]
  popular?: boolean
}

interface SubscriptionPlansProps {
  currentTier: string
  onSubscribe: (tier: 'Silver' | 'Gold') => Promise<void>
}

export default function SubscriptionPlans({ currentTier, onSubscribe }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)

  // In a real app, these prices would come from the backend based on user location
  const plans: SubscriptionPlan[] = [
    {
      tier: 'Silver',
      name: 'Silver',
      price: '$4.99',
      priceLocal: 4.99,
      currency: 'USD',
      symbol: '$',
      features: [
        '30 videos per day',
        'No forced interstitial ads',
        'Priority support',
        'Earn coins faster',
      ],
    },
    {
      tier: 'Gold',
      name: 'Gold',
      price: '$9.99',
      priceLocal: 9.99,
      currency: 'USD',
      symbol: '$',
      popular: true,
      features: [
        '40 videos per day',
        'No forced interstitial ads',
        'Premium support',
        'Earn coins faster',
        'Exclusive badges',
      ],
    },
  ]

  const handleSubscribe = async (tier: 'Silver' | 'Gold') => {
    setLoading(tier)
    try {
      await onSubscribe(tier)
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => {
        const isCurrentTier = currentTier === plan.tier
        const isBronze = currentTier === 'Bronze'

        return (
          <Card key={plan.tier} className={`relative ${plan.popular ? 'border-2 border-yellow-500' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-bold">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-white mb-1">
                {plan.symbol}{plan.priceLocal.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">per month</div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-gray-300">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isCurrentTier ? (
              <Button disabled className="w-full bg-gray-700">
                Current Plan
              </Button>
            ) : (
              <Button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={loading !== null}
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {loading === plan.tier ? 'Processing...' : isBronze ? 'Upgrade Now' : 'Switch Plan'}
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}
