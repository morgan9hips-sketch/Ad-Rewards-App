import { useState, useEffect } from 'react'

export default function FirstVisitModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem('first-visit-complete')
    if (!hasVisited) {
      // Show modal after splash screen completes
      const timer = setTimeout(() => {
        setVisible(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('first-visit-complete', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md mx-4 border border-blue-500/30 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Adify!</h2>
          <p className="text-gray-400 text-sm">Earn AdCoins by watching ads and playing games</p>
        </div>

        <div className="space-y-3 mb-6 text-sm">
          <div className="flex items-start gap-2 text-gray-300">
            <span className="text-yellow-400">⚠️</span>
            <p><strong className="text-white">Beta Notice:</strong> This app is under active development. Features may change.</p>
          </div>
          <div className="flex items-start gap-2 text-gray-300">
            <span className="text-blue-400">🍪</span>
            <p><strong className="text-white">Cookies:</strong> We use cookies to improve your experience.</p>
          </div>
          <div className="flex items-start gap-2 text-gray-300">
            <span className="text-green-400">✓</span>
            <p>By continuing, you agree to our <a href="/legal/terms" className="text-blue-400 underline">Terms</a> and <a href="/legal/privacy" className="text-blue-400 underline">Privacy Policy</a>.</p>
          </div>
        </div>

        <button
          onClick={handleAccept}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}
