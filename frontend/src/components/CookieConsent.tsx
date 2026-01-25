import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    localStorage.setItem('cookiePreferences', JSON.stringify({
      essential: true,
      analytics: true,
      advertising: true,
      timestamp: new Date().toISOString()
    }))
    setShowBanner(false)
  }

  const acceptEssentialOnly = () => {
    localStorage.setItem('cookieConsent', 'essential')
    localStorage.setItem('cookiePreferences', JSON.stringify({
      essential: true,
      analytics: false,
      advertising: true, // Required for service to function
      timestamp: new Date().toISOString()
    }))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50 mb-16 sm:mb-0">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-white font-semibold mb-2">🍪 Cookie Notice</h3>
            <p className="text-sm text-gray-300 mb-2">
              We use cookies to enhance your experience and provide our rewards service. Essential cookies and advertising cookies (via Google AdMob) are required for the service to function. Analytics cookies are optional.
            </p>
            <p className="text-xs text-gray-400">
              By continuing to use this site, you agree to our use of cookies. Learn more in our{' '}
              <Link to="/legal/cookies" className="text-blue-400 hover:text-blue-300 underline">
                Cookie Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              size="sm" 
              onClick={acceptCookies} 
              className="whitespace-nowrap flex-1"
            >
              Accept All Cookies
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={acceptEssentialOnly} 
              className="whitespace-nowrap flex-1"
            >
              Essential Only
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
