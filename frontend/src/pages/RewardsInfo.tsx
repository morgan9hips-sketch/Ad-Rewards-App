import Card from '../components/Card'

export default function RewardsInfo() {
  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">
        How Ad Rewards Works
      </h1>

      <Card>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-4">Last updated: January 15, 2026</p>
          <p className="text-blue-400 mb-6 text-sm font-medium">
            🎯 Complete guide to earning money with Ad Rewards - everything you
            need to know!
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            💡 The Basics
          </h2>

          <p className="text-gray-300 mb-4">
            Ad Rewards is a legitimate way to earn real money by watching
            advertisements. We partner with advertising networks to show you
            quality ads, and you get paid for your time and attention.
          </p>

          <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg mb-6">
            <h3 className="text-green-400 font-semibold mb-2">
              ✨ Why This Works
            </h3>
            <ul className="text-gray-300 space-y-1">
              <li>• Advertisers pay to show their ads to real people</li>
              <li>• We share this advertising revenue with you</li>
              <li>• You earn money for your time and engagement</li>
              <li>• Everyone wins - advertisers get views, you get paid!</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            🎮 How to Earn
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
                📺 Watch Video Ads
              </h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Click "Watch Ad" to start earning</li>
                <li>• Watch the full advertisement</li>
                <li>• Earn coins/cash for each completed view</li>
                <li>• No skipping - watch the entire ad</li>
              </ul>
              <div className="mt-3 p-2 bg-green-900/30 rounded text-center">
                <span className="text-green-400 font-bold">
                  Earn coins for every completed ad
                </span>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-purple-400 font-semibold mb-3 flex items-center">
                🎯 Complete Tasks (Coming Soon)
              </h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Download and try new apps</li>
                <li>• Complete surveys</li>
                <li>• Sign up for services</li>
                <li>• Refer friends to the platform</li>
              </ul>
              <div className="mt-3 p-2 bg-purple-900/30 rounded text-center">
                <span className="text-purple-400 font-bold">
                  Earn bonus coins per completed task
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            💰 Earnings Breakdown
          </h2>

          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h4 className="text-white font-semibold mb-4">
              Revenue Sharing Model
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-green-900/20 rounded">
                <span className="text-gray-300">Your Share (You):</span>
                <span className="text-green-400 font-bold text-lg">85%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-900/20 rounded">
                <span className="text-gray-300">Platform Operations:</span>
                <span className="text-blue-400 font-bold">15%</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              We keep only what's needed to run the platform - you get the vast
              majority!
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            ⏱️ Earning Potential
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <h4 className="text-green-400 font-semibold mb-2">Casual User</h4>
              <div className="text-lg font-bold text-white mb-2">
                Varies by location
              </div>
              <p className="text-gray-400 text-sm">5-10 ads per day</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg text-center border border-blue-500/30">
              <h4 className="text-blue-400 font-semibold mb-2">Regular User</h4>
              <div className="text-lg font-bold text-white mb-2">
                Varies by location
              </div>
              <p className="text-gray-400 text-sm">15-30 ads per day</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <h4 className="text-purple-400 font-semibold mb-2">Power User</h4>
              <div className="text-lg font-bold text-white mb-2">
                Varies by location
              </div>
              <p className="text-gray-400 text-sm">30+ ads + tasks</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm text-center mb-6">
            Earning potential depends on your location's currency value and
            local advertising rates.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            🏆 Tier System & Bonuses
          </h2>

          <p className="text-gray-300 mb-4">
            Level up your account to unlock better earning rates and exclusive
            bonuses:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🥉</span>
                <div>
                  <span className="text-white font-semibold">
                    Bronze (0-100 ads)
                  </span>
                  <p className="text-gray-400 text-sm">Standard rates</p>
                </div>
              </div>
              <span className="text-green-400 font-bold">1.0x multiplier</span>
            </div>

            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🥈</span>
                <div>
                  <span className="text-white font-semibold">
                    Silver (101-500 ads)
                  </span>
                  <p className="text-gray-400 text-sm">5% bonus</p>
                </div>
              </div>
              <span className="text-blue-400 font-bold">1.05x multiplier</span>
            </div>

            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🥇</span>
                <div>
                  <span className="text-white font-semibold">
                    Gold (501-1500 ads)
                  </span>
                  <p className="text-gray-400 text-sm">10% bonus</p>
                </div>
              </div>
              <span className="text-yellow-400 font-bold">
                1.10x multiplier
              </span>
            </div>

            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-purple-500/30">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💎</span>
                <div>
                  <span className="text-white font-semibold">
                    Diamond (1501+ ads)
                  </span>
                  <p className="text-gray-400 text-sm">
                    20% bonus + exclusive perks
                  </p>
                </div>
              </div>
              <span className="text-purple-400 font-bold">
                1.20x multiplier
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            💳 Getting Paid
          </h2>

          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6">
            <h3 className="text-blue-400 font-semibold mb-3">
              Payment Process
            </h3>
            <ul className="text-gray-300 space-y-2">
              <li>
                • <strong>Minimum Withdrawal:</strong> Equivalent of $10 in your
                local currency
              </li>
              <li>
                • <strong>Payment Method:</strong> PayPal only (more methods
                coming soon)
              </li>
              <li>
                • <strong>Processing Time:</strong> 1-3 business days
              </li>
              <li>
                • <strong>Fees:</strong> No fees from us - PayPal may charge
                standard fees
              </li>
              <li>
                • <strong>Currency:</strong> Automatically set based on your
                verified location
              </li>
            </ul>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg mb-6">
            <h3 className="text-yellow-400 font-semibold mb-2">
              ⚠️ Important Payment Notes
            </h3>
            <ul className="text-gray-300 space-y-1">
              <li>• Must verify PayPal email before first withdrawal</li>
              <li>
                • Currency is locked to your geographic location (compliance
                requirement)
              </li>
              <li>
                • VPN users will be blocked to prevent currency circumvention
              </li>
              <li>• All payments subject to tax regulations in your country</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            🎮 Pro Tips for Maximum Earnings
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-green-400 font-semibold mb-3">
                💡 Smart Strategies
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Watch ads during peak times (evenings, weekends)</li>
                <li>• Complete your daily ad limit for consistency bonus</li>
                <li>• Focus on video ads - they pay the most</li>
                <li>• Check for special bonus campaigns</li>
                <li>• Refer friends for ongoing bonus income</li>
              </ul>
            </div>

            <div>
              <h4 className="text-red-400 font-semibold mb-3">
                ❌ Avoid These Mistakes
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Don't use VPNs or proxies (will get you banned)</li>
                <li>• Don't try to skip or fast-forward ads</li>
                <li>• Don't create multiple accounts (one per person)</li>
                <li>• Don't click ads randomly without watching</li>
                <li>• Don't withdraw tiny amounts (fees eat profits)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            📊 Track Your Progress
          </h2>

          <p className="text-gray-300 mb-4">
            Your dashboard shows everything you need to track your earnings:
          </p>

          <ul className="text-gray-300 ml-6 mb-6 space-y-1">
            <li>
              • <strong>Total Balance:</strong> Your current earnings ready to
              withdraw
            </li>
            <li>
              • <strong>Today's Earnings:</strong> How much you've made today
            </li>
            <li>
              • <strong>Ads Watched:</strong> Your total ad count and tier
              progress
            </li>
            <li>
              • <strong>Transaction History:</strong> All your earnings and
              withdrawals
            </li>
            <li>
              • <strong>Current Tier:</strong> Your earning multiplier level
            </li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            🤝 Fair Play & Rules
          </h2>

          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-6">
            <h3 className="text-red-400 font-semibold mb-2">
              🚫 Prohibited Activities
            </h3>
            <ul className="text-gray-300 space-y-1">
              <li>• Using bots or automated tools</li>
              <li>• Creating multiple accounts</li>
              <li>• Using VPNs to fake location</li>
              <li>• Sharing accounts with others</li>
              <li>• Attempting to manipulate the system</li>
            </ul>
            <p className="text-red-400 text-sm mt-2 font-medium">
              Violations result in immediate account suspension and forfeiture
              of earnings.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            📞 Need Help?
          </h2>

          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h4 className="text-white font-semibold mb-3">Contact Support</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-blue-400 font-medium mb-2">
                  General Questions:
                </h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Email: support@adrewards.com</li>
                  <li>• Response time: 24-48 hours</li>
                  <li>• Available: Mon-Fri 9AM-5PM EST</li>
                </ul>
              </div>
              <div>
                <h5 className="text-green-400 font-medium mb-2">
                  Payment Issues:
                </h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Email: payments@adrewards.com</li>
                  <li>• Response time: 24 hours</li>
                  <li>• Include: Transaction ID, PayPal email</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 p-6 rounded-lg">
            <h3 className="text-white font-bold mb-3">
              🎉 Ready to Start Earning?
            </h3>
            <p className="text-gray-300 mb-3">
              Join thousands of users who are already earning real money with Ad
              Rewards. Start watching ads today and see your balance grow!
            </p>
            <p className="text-green-400 text-sm font-medium">
              Remember: This is real money for real work. Treat it seriously and
              follow the rules for best results.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
