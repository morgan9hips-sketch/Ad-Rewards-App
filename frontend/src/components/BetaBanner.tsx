import { useState, useEffect } from 'react'

export default function BetaBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('beta-banner-dismissed')
    if (!dismissed) {
      setVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('beta-banner-dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 text-center text-sm flex items-center justify-center gap-2">
      <span className="font-semibold">🚀 BETA</span> - This platform is in beta. Report issues to support.
      <button
        onClick={handleDismiss}
        className="ml-2 text-white hover:text-gray-200 text-xl leading-none"
        aria-label="Dismiss banner"
      >
        ×
      </button>
    </div>
  )
}
