import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import Card from './Card'
import Button from './Button'

export default function LocationPermissionModal() {
  const { session } = useAuth()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user has already been asked
    const hasAsked = localStorage.getItem('locationPermissionAsked')
    if (!hasAsked && session) {
      setShow(true)
    }
  }, [session])

  const handleAllowLocation = async () => {
    setLoading(true)
    setError('')

    try {
      // Request geolocation permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      // Send coordinates to backend
      const response = await fetch(`${API_BASE_URL}/api/user/update-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      })

      if (response.ok) {
        localStorage.setItem('locationPermissionAsked', 'true')
        localStorage.setItem('locationPermissionGranted', 'true')
        setShow(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update location')
      }
    } catch (err: unknown) {
      console.error('Location error:', err)
      // Fallback to IP detection
      localStorage.setItem('locationPermissionAsked', 'true')
      localStorage.setItem('locationPermissionGranted', 'false')
      setShow(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDenyLocation = () => {
    // Store that user was asked and denied
    localStorage.setItem('locationPermissionAsked', 'true')
    localStorage.setItem('locationPermissionGranted', 'false')
    setShow(false)
  }

  if (!show) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <div className="text-5xl mb-4">📍</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Verify Your Location
          </h2>
          <p className="text-gray-400 mb-6">
            To ensure accurate revenue distribution and comply with regional
            regulations, we need to verify your location. This helps us:
          </p>

          <ul className="text-left text-gray-400 text-sm space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Assign you to the correct revenue pool for your country</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Ensure accurate currency and payment processing</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Comply with local advertising regulations</span>
            </li>
          </ul>

          {error && (
            <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              fullWidth
              onClick={handleAllowLocation}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? 'Verifying...' : 'Allow Location Access'}
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={handleDenyLocation}
              disabled={loading}
            >
              Use IP Detection Instead
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            If you deny location access, we'll use your IP address to determine
            your country. Location data is only used for revenue distribution
            and is never shared with third parties.
          </p>
        </div>
      </Card>
    </div>
  )
}
