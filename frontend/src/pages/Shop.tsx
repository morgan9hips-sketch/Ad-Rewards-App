import Card from '../components/Card'

export default function Shop() {
  const affiliateCategories = [
    { name: 'Electronics', icon: '💻', count: 0 },
    { name: 'Fashion', icon: '👕', count: 0 },
    { name: 'Home & Garden', icon: '🏡', count: 0 },
    { name: 'Beauty', icon: '💄', count: 0 },
    { name: 'Sports', icon: '⚽', count: 0 },
    { name: 'Travel', icon: '✈️', count: 0 },
    { name: 'Food & Dining', icon: '🍔', count: 0 },
    { name: 'Entertainment', icon: '🎬', count: 0 },
  ]

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">🛒 Shop & Earn</h1>
        <p className="text-gray-400">
          Earn extra coins when you shop through our affiliate partners
        </p>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Shopping Rewards Coming Soon!
          </h2>
          <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
            We're partnering with top retailers to bring you cashback and bonus coins on your purchases.
            Shop your favorite brands and earn rewards automatically.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg">
            <span className="animate-pulse">●</span>
            <span className="font-semibold">Launching Q2 2026</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {affiliateCategories.map((category) => (
          <Card key={category.name} className="opacity-60 hover:opacity-80 transition-opacity">
            <div className="text-center py-6">
              <div className="text-5xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                {category.count} partners
              </p>
              <div className="text-xs px-3 py-1 bg-gray-800 text-gray-500 rounded-full inline-block">
                Coming Soon
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h3 className="text-lg font-bold text-white mb-3">
          How Shop & Earn Works
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="font-semibold text-white">Browse Offers</p>
              <p className="text-gray-400">
                Find deals from your favorite stores and brands
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="font-semibold text-white">Shop Normally</p>
              <p className="text-gray-400">
                Click through to the store and complete your purchase
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="font-semibold text-white">Earn Coins</p>
              <p className="text-gray-400">
                Get bonus coins credited to your account automatically
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
