import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import Button from './Button'

interface SignupBonusInfo {
  eligible: boolean
  userNumber: number
  countryCode: string
  bonusCoins: number
  bonusValue: number
  claimed: boolean
}

export default function SignupBonusBadge() {
  const { session } = useAuth()
  const [bonusInfo, setBonusInfo] = useState<SignupBonusInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetchBonusInfo()
  }, [session])

  const fetchBonusInfo = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/user/signup-bonus`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        if (data.eligible && !data.claimed) {
          setBonusInfo(data)
        }
      }
    } catch (error) {
      console.error('Error fetching signup bonus:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    // Store in localStorage to not show again this session
    localStorage.setItem('signupBonusDismissed', 'true')
  }

  if (loading || !bonusInfo || dismissed) {
    return null
  }

  // Check if already dismissed in this session
  if (localStorage.getItem('signupBonusDismissed') === 'true') {
    return null
  }

  const getCountryName = (code: string): string => {
    const countries: Record<string, string> = {
      ZA: 'South Africa',
      US: 'United States',
      GB: 'United Kingdom',
      CA: 'Canada',
      AU: 'Australia',
      IN: 'India',
      NG: 'Nigeria',
      KE: 'Kenya',
      GH: 'Ghana',
    }
    return countries[code] || code
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-yellow-900 to-orange-900 border-4 border-yellow-500 rounded-lg p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-yellow-300 mb-2">
            EARLY USER BONUS!
          </h2>
        </div>

        <div className="bg-black/30 rounded-lg p-4 mb-6 text-center">
          <p className="text-white text-lg mb-2">
            You're user <span className="text-yellow-300 font-bold">#{bonusInfo.userNumber.toLocaleString()}</span> in{' '}
            <span className="text-yellow-300 font-bold">{getCountryName(bonusInfo.countryCode)}</span>!
          </p>
          <p className="text-gray-300 text-sm mb-4">
            As an early supporter, you've received:
          </p>
          <div className="text-5xl font-bold text-yellow-400 mb-2">
            {bonusInfo.bonusCoins.toLocaleString()} AdCoins
          </div>
          <p className="text-gray-400 text-sm">
            (~{bonusInfo.bonusValue.toFixed(2)} in value)
          </p>
        </div>

        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm text-center">
            💡 This bonus unlocks when you reach the minimum withdrawal threshold (15,000 coins)
          </p>
        </div>

        <Button
          fullWidth
          onClick={handleDismiss}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          Got It! 🎉
        </Button>

        <p className="text-gray-400 text-xs text-center mt-3">
          Start earning by participating in sessions and playing games!
        </p>
      </div>
    </div>
  )
}
