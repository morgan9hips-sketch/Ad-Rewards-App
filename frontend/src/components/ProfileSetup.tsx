import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Card from './Card'
import Button from './Button'
import AvatarSelector from './AvatarSelector'
import CountrySelector from './CountrySelector'

interface ProfileSetupProps {
  onComplete: () => void
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user, session } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoDetectedCountry, setAutoDetectedCountry] = useState<string | null>(null)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null)
  const [countryBadge, setCountryBadge] = useState<string | null>(null)
  const [hideCountry, setHideCountry] = useState(false)
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true)

  useEffect(() => {
    // Set default display name from email
    if (user?.email) {
      setDisplayName(user.email.split('@')[0])
    }

    // Auto-detect country
    detectCountry()
  }, [user])

  const detectCountry = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch('http://localhost:4000/api/user/detect-country', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        if (data.countryCode) {
          setAutoDetectedCountry(data.countryCode)
          setCountryBadge(data.countryCode)
        }
      }
    } catch (err) {
      console.error('Error detecting country:', err)
    }
  }

  const validateDisplayName = (name: string): string | null => {
    if (name.length < 3) return 'Display name must be at least 3 characters'
    if (name.length > 20) return 'Display name must be at most 20 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return 'Display name can only contain letters, numbers, and underscores'
    }
    return null
  }

  const handleNext = () => {
    setError(null)

    if (step === 1) {
      // Validate display name
      const nameError = validateDisplayName(displayName)
      if (nameError) {
        setError(nameError)
        return
      }
    }

    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setError(null)
    }
  }

  const handleSkip = () => {
    // User can skip setup and complete in settings later
    onComplete()
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = session?.access_token
      if (!token) {
        setError('Not authenticated')
        return
      }

      const res = await fetch('http://localhost:4000/api/user/setup-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          avatarEmoji,
          countryBadge,
          hideCountry,
          showOnLeaderboard,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save profile')
        return
      }

      onComplete()
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('An error occurred while saving your profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full">
        <Card>
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {step === 1 && '👤 Create Your Profile'}
                {step === 2 && '🎨 Choose Your Avatar'}
                {step === 3 && '🌍 Set Your Badge'}
              </h2>
              <p className="text-gray-400 text-sm">Step {step} of 3</p>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Display Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    maxLength={20}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm text-blue-300">
                    💡 This is how you'll appear on the leaderboard and throughout the app
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Avatar */}
            {step === 2 && (
              <div>
                <AvatarSelector selected={avatarEmoji} onSelect={setAvatarEmoji} />
                {!avatarEmoji && (
                  <p className="text-gray-500 text-sm mt-3">
                    Select an avatar to represent you
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Country & Settings */}
            {step === 3 && (
              <div className="space-y-4">
                <CountrySelector
                  selected={countryBadge}
                  onSelect={setCountryBadge}
                  autoDetected={autoDetectedCountry}
                />

                <div className="border-t border-gray-800 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideCountry}
                      onChange={(e) => setHideCountry(e.target.checked)}
                      className="w-5 h-5 mt-1"
                    />
                    <div>
                      <span className="text-gray-300 block font-medium">Hide my country</span>
                      <span className="text-sm text-gray-500">
                        Show 🌍 instead of your country flag for privacy
                      </span>
                    </div>
                  </label>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnLeaderboard}
                      onChange={(e) => setShowOnLeaderboard(e.target.checked)}
                      className="w-5 h-5 mt-1"
                    />
                    <div>
                      <span className="text-gray-300 block font-medium">
                        Show me on the leaderboard
                      </span>
                      <span className="text-sm text-gray-500">
                        Compete with other users and show your earnings
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button variant="secondary" onClick={handleBack} disabled={loading}>
                  Back
                </Button>
              )}

              {step < 3 ? (
                <>
                  <Button onClick={handleNext} fullWidth>
                    Next
                  </Button>
                  <Button variant="secondary" onClick={handleSkip}>
                    Skip
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSave} fullWidth disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                  <Button variant="secondary" onClick={handleSkip} disabled={loading}>
                    Skip
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
