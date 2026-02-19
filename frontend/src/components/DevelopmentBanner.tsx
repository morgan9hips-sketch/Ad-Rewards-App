import { useState, useEffect } from 'react'

export default function DevelopmentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('dev-banner-dismissed')
    if (!dismissed) {
      setVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('dev-banner-dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-900/95 backdrop-blur-sm border-b border-yellow-500/50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-yellow-400 text-xl">⚠️</span>
            <p className="text-yellow-100 text-sm">
              <strong>Beta Notice:</strong> This app is under active
              development. All features, earnings, and functionality are subject
              to change during the testing phase.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-yellow-400 hover:text-yellow-200 text-2xl leading-none px-2"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
