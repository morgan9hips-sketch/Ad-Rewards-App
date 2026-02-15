import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/branding/logo-full.png"
                alt="Adify - Watch Ads, Earn Real Money"
                className="h-16 w-auto mb-4"
              />
              <h1 className="text-5xl font-bold text-white">Adify</h1>
            </div>
          </div>
          <p className="text-2xl text-gray-300 mb-2 font-semibold">
            Press Play to Earn Real Money
          </p>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Turn your time into rewards. Watch video ads, complete tasks, and
            get paid through PayPal.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')}>
              Get Started
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <div className="text-center">
              <div className="text-5xl mb-4">📺</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Complete Sessions
              </h3>
              <p className="text-gray-400">
                Participate in rewarded sessions from our partners and earn rewards
                for every completion.
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Earn Rewards
              </h3>
              <p className="text-gray-400">
                Build your balance through active participation. Track your
                earnings in real-time.
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">Get Paid</h3>
              <p className="text-gray-400">
                Withdraw your earnings via PayPal once you reach the minimum
                threshold.
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Safe, secure, and transparent. No hidden fees.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <button
              onClick={() => navigate('/terms')}
              className="hover:text-gray-400 transition-colors underline"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/privacy')}
              className="hover:text-gray-400 transition-colors underline"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <a
              href="mailto:admin@adrevtechnologies.com"
              className="hover:text-gray-400 transition-colors underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
