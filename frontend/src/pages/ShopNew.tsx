import { useState } from 'react'
import Card from '../components/Card'
import { useNavigate } from 'react-router-dom'
import { useCurrency } from '../contexts/CurrencyContext'

interface RedemptionItem {
  id: string
  name: string
  icon: string
  description: string
  category: 'airtime' | 'giftcard' | 'voucher'
  coinCost: number
  value: string
  comingSoon?: boolean
}

const redemptionItems: RedemptionItem[] = [
  // Airtime
  { id: 'airtime-r10', name: 'R10 Airtime', icon: '📱', description: 'Valid on all SA networks (MTN, Vodacom, Cell C, Telkom)', category: 'airtime', coinCost: 10000, value: 'R10', comingSoon: false },
  { id: 'airtime-r20', name: 'R20 Airtime', icon: '📱', description: 'Valid on all SA networks (MTN, Vodacom, Cell C, Telkom)', category: 'airtime', coinCost: 20000, value: 'R20', comingSoon: false },
  { id: 'airtime-r50', name: 'R50 Airtime', icon: '📱', description: 'Valid on all SA networks (MTN, Vodacom, Cell C, Telkom)', category: 'airtime', coinCost: 50000, value: 'R50', comingSoon: false },
  // Gift Cards
  { id: 'gc-takealot-r50', name: 'Takealot Gift Card', icon: '🎁', description: 'R50 Takealot voucher — shop anything online', category: 'giftcard', coinCost: 50000, value: 'R50', comingSoon: true },
  { id: 'gc-woolworths-r50', name: 'Woolworths Gift Card', icon: '🛒', description: 'R50 Woolworths gift card — food & fashion', category: 'giftcard', coinCost: 50000, value: 'R50', comingSoon: true },
  { id: 'gc-netflix', name: 'Netflix Voucher', icon: '🎬', description: '1-month Netflix Standard subscription', category: 'giftcard', coinCost: 160000, value: 'R159', comingSoon: true },
  // Vouchers
  { id: 'voucher-uber-r50', name: 'Uber Voucher', icon: '🚗', description: 'R50 credit valid on Uber rides', category: 'voucher', coinCost: 50000, value: 'R50', comingSoon: true },
  { id: 'voucher-electricity', name: 'Electricity Token', icon: '⚡', description: 'R20 prepaid electricity token', category: 'voucher', coinCost: 20000, value: 'R20', comingSoon: true },
]

const categoryLabels = {
  airtime: '📱 Airtime',
  giftcard: '🎁 Gift Cards',
  voucher: '🏷️ Vouchers',
}

export default function ShopNew() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'airtime' | 'giftcard' | 'voucher'>('all')
  const navigate = useNavigate()
  const { formatAmount } = useCurrency()

  const minimumShopCoins = 10000
  const minimumShopValue = 'R10'
  const minimumWithdrawalUsd = 10

  const filteredItems = activeCategory === 'all'
    ? redemptionItems
    : redemptionItems.filter(item => item.category === activeCategory)

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">🛒 Shop</h1>
        <p className="text-gray-400">Redeem your coins for airtime, gift cards & vouchers</p>
      </div>

      {/* Coin balance reminder */}
      <Card className="mb-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-400 font-semibold text-sm">Minimum shop item</p>
            <p className="text-white text-2xl font-bold">{minimumShopCoins.toLocaleString()} coins = {minimumShopValue}</p>
            <p className="text-xs text-gray-300 mt-1">
              Withdrawal unlocks only after {formatAmount(minimumWithdrawalUsd)} ({minimumWithdrawalUsd.toFixed(2)} USD equivalent).
            </p>
          </div>
          <div className="text-5xl">🪙</div>
        </div>
      </Card>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'airtime', 'giftcard', 'voucher'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {cat === 'all' ? '🌟 All' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => (
          <Card key={item.id} className={item.comingSoon ? 'opacity-70' : 'hover:border-blue-500/50 transition-colors'}>
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{item.icon}</span>
                {item.comingSoon && (
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded-full">Coming Soon</span>
                )}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1">{item.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-yellow-400 font-bold">{item.coinCost.toLocaleString()} coins</p>
                  <p className="text-green-400 text-sm font-medium">{item.value} value</p>
                </div>
                <button
                  disabled={item.comingSoon}
                  onClick={() => !item.comingSoon && navigate('/wallet')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    item.comingSoon
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {item.comingSoon ? 'Soon' : 'Redeem'}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-white mb-3">How Redemption Works</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="font-semibold text-white">Earn Coins</p>
              <p className="text-gray-400">Watch ads, complete tasks, and play games to earn coins</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="font-semibold text-white">Reach 10,000 Coins</p>
              <p className="text-gray-400">Use coins for entry-level shop items starting at {minimumShopValue}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="font-semibold text-white">Withdraw After Threshold</p>
              <p className="text-gray-400">Cash withdrawal requires at least {minimumWithdrawalUsd.toFixed(2)} USD equivalent</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
