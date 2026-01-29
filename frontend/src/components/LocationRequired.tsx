import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Card from './Card'
import { useCurrency } from '../contexts/CurrencyContext'

export default function LocationRequired() {
  const { requestLocationPermission } = useCurrency()
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleEnableLocation = async () => {
    setRequesting(true)
    setError('')
    try {
      const success = await requestLocationPermission()
      if (success) {
        navigate('/dashboard')
      } else {
        setError(
          'Location access denied. Please enable it in your browser settings.',
        )
      }
    } catch (error) {
      console.error('Failed to enable location:', error)
      setError('Failed to detect location. Please try again.')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🌍</div>

        <h1 className="text-2xl font-bold text-white mb-4">
          Location Access Required
        </h1>

        <p className="text-gray-300 mb-6">
          <strong>Location access is MANDATORY.</strong> The app cannot function
          without detecting your location for accurate currency conversion and
          compliance with regional regulations.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-blue-300 font-semibold mb-2">
            Why we need this:
          </h3>
          <ul className="text-sm text-blue-200 space-y-1 text-left">
            <li>• Automatic currency conversion to your local currency</li>
            <li>• Accurate ad revenue calculation</li>
            <li>• Compliance with regional regulations</li>
            <li>• Prevention of location-based abuse</li>
          </ul>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
          <p className="text-yellow-300 text-sm">
            <strong>Privacy:</strong> Your location is only used for currency
            detection and is not stored or shared with third parties.
          </p>
        </div>

        <Button
          onClick={handleEnableLocation}
          loading={requesting}
          fullWidth
          className="bg-green-600 hover:bg-green-700"
        >
          {requesting ? 'Detecting Location...' : 'Enable Location & Continue'}
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          You may see a browser prompt asking for location permission. Please
          click "Allow" to continue.
        </p>
      </Card>
    </div>
  )
}
