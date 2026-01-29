import { useState } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import Button from './Button'

export default function LocationBanner() {
  const { currencyInfo, requestLocationPermission } = useCurrency()
  const [requesting, setRequesting] = useState(false)
  const [showModal, setShowModal] = useState(true)

  // Don't show if location already detected
  if (currencyInfo?.locationDetected || !showModal) {
    return null
  }

  const handleEnableLocation = async () => {
    setRequesting(true)
    try {
      await requestLocationPermission()
      setShowModal(false)
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-yellow-500/30 rounded-lg p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <span className="text-5xl">📍</span>
        </div>
        <h3 className="font-bold text-yellow-200 mb-3 text-xl text-center">
          Location Permission Required
        </h3>
        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
          Per our <span className="text-yellow-400 font-semibold">Application Policy</span>, location services must be enabled to use this app.
        </p>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          We use your location to:
        </p>
        <ul className="text-sm text-gray-300 mb-6 space-y-2 list-disc list-inside">
          <li>Provide accurate currency conversion</li>
          <li>Show localized content and offers</li>
          <li>Comply with regional regulations</li>
          <li>Prevent fraud and abuse</li>
        </ul>
        <Button
          className="w-full"
          onClick={handleEnableLocation}
          loading={requesting}
        >
          Enable Location
        </Button>
      </div>
    </div>
  )
}
