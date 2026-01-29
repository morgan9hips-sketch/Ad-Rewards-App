import { useState } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import Button from './Button'

export default function LocationBanner() {
  const { currencyInfo, requestLocationPermission } = useCurrency()
  const [requesting, setRequesting] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Don't show if location already detected or banner dismissed
  if (currencyInfo?.locationDetected || dismissed) {
    return null
  }

  const handleEnableLocation = async () => {
    setRequesting(true)
    try {
      await requestLocationPermission()
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-700/50 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">📍</div>
        <div className="flex-1">
          <h3 className="text-yellow-300 font-semibold mb-1">
            Enable GPS for Better Accuracy
          </h3>
          <p className="text-yellow-200/80 text-sm mb-3">
            We're currently using your IP address for location. Enable GPS for
            more accurate currency conversion and earnings.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleEnableLocation}
              loading={requesting}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {requesting ? 'Detecting...' : 'Enable GPS'}
            </Button>
            <Button
              onClick={() => setDismissed(true)}
              size="sm"
              variant="secondary"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
