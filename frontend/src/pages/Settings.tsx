import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import AvatarSelector from '../components/AvatarSelector'
import CountrySelector from '../components/CountrySelector'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { API_BASE_URL } from '../config/api'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const { currencyInfo, refreshCurrencyInfo } = useCurrency()
  const [paypalEmail, setPaypalEmail] = useState('')
  const [country, setCountry] = useState('US')
  const [preferredCurrency, setPreferredCurrency] = useState('USD')
  const [autoDetectCurrency, setAutoDetectCurrency] = useState(true)

  // Profile fields
  const [displayName, setDisplayName] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null)
  const [countryBadge, setCountryBadge] = useState<string | null>(null)
  const [hideCountry, setHideCountry] = useState(false)
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true)

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setPaypalEmail(data.paypalEmail || '')
        setCountry(data.country || 'US')
        setPreferredCurrency(data.preferredCurrency || 'USD')
        setAutoDetectCurrency(data.autoDetectCurrency !== false)
        setDisplayName(data.displayName || '')
        setAvatarEmoji(data.avatarEmoji || null)
        setCountryBadge(data.countryBadge || null)
        setHideCountry(data.hideCountry || false)
        setShowOnLeaderboard(data.showOnLeaderboard !== false)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const validateDisplayName = (name: string): string | null => {
    if (!name) return null // Allow empty
    if (name.length < 3) return 'Display name must be at least 3 characters'
    if (name.length > 20) return 'Display name must be at most 20 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return 'Display name can only contain letters, numbers, and underscores'
    }
    return null
  }

  const handleSave = async () => {
    setError(null)

    // Validate display name
    const nameError = validateDisplayName(displayName)
    if (nameError) {
      setError(nameError)
      return
    }

    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paypalEmail,
          country,
          preferredCurrency,
          autoDetectCurrency,
          displayName: displayName || null,
          avatarEmoji,
          countryBadge,
          hideCountry,
          showOnLeaderboard,
        }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)

        // Refresh currency info if currency-related settings changed
        await refreshCurrencyInfo()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('Failed to save settings')
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setError(null)

    try {
      const token = session?.access_token
      if (!token) {
        setError('Not authenticated')
        setDeleting(false)
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/user/account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        // Sign out from Supabase
        await supabase.auth.signOut()
        
        // Redirect to home with success message
        navigate('/', { state: { message: 'Your account has been permanently deleted.' } })
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete account')
        setDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setError('Failed to delete account. Please try again or contact support.')
      setDeleting(false)
    }
  }

      if (res.ok) {
        setSaved(true)
        await refreshCurrencyInfo() // Refresh currency context
        setTimeout(() => setSaved(false), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('An error occurred while saving settings')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Settings ⚙️</h1>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">👤 Profile</h2>
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
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              maxLength={20}
            />
            <p className="text-gray-500 text-xs mt-1">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div className="pt-4">
            <AvatarSelector selected={avatarEmoji} onSelect={setAvatarEmoji} />
          </div>

          <div className="pt-4">
            <CountrySelector
              selected={countryBadge}
              onSelect={setCountryBadge}
            />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hideCountry}
                onChange={(e) => setHideCountry(e.target.checked)}
                className="w-5 h-5 mt-1"
              />
              <div>
                <span className="text-gray-300 block font-medium">
                  Hide my country
                </span>
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
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-400"
            />
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Payment Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PayPal Email
            </label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="your-paypal@email.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="ZA">South Africa</option>
              <option value="IN">India</option>
              <option value="NG">Nigeria</option>
              <option value="BR">Brazil</option>
              <option value="MX">Mexico</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">
          💱 Currency Display
        </h2>
        <div className="space-y-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="w-5 h-5 mt-1"
              checked={autoDetectCurrency}
              onChange={(e) => setAutoDetectCurrency(e.target.checked)}
            />
            <div>
              <span className="text-gray-300 block font-medium">
                Auto-detect currency from location
              </span>
              <span className="text-sm text-gray-500">
                We'll automatically display amounts in your local currency
              </span>
            </div>
          </label>

          {!autoDetectCurrency && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Display Currency
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="USD">🇺🇸 US Dollar (USD)</option>
                <option value="ZAR">🇿🇦 South African Rand (ZAR)</option>
                <option value="EUR">🇪🇺 Euro (EUR)</option>
                <option value="GBP">🇬🇧 British Pound (GBP)</option>
                <option value="CAD">🇨🇦 Canadian Dollar (CAD)</option>
                <option value="AUD">🇦🇺 Australian Dollar (AUD)</option>
                <option value="INR">🇮🇳 Indian Rupee (INR)</option>
                <option value="NGN">🇳🇬 Nigerian Naira (NGN)</option>
                <option value="BRL">🇧🇷 Brazilian Real (BRL)</option>
                <option value="MXN">🇲🇽 Mexican Peso (MXN)</option>
              </select>
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              ℹ️ <strong>Display only.</strong> Earnings are based on ads
              watched in {currencyInfo?.revenueCountry || 'your location'}. All
              payouts are in USD.
            </p>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">
          📄 Legal Documents
        </h2>
        <div className="space-y-3">
          <a
            href="/terms"
            className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-white"
          >
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium">Terms of Service</p>
              <p className="text-sm text-gray-400">
                Review our terms and conditions
              </p>
            </div>
          </a>
          <a
            href="/privacy"
            className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-white"
          >
            <span className="text-xl">🔒</span>
            <div>
              <p className="font-medium">Privacy Policy</p>
              <p className="text-sm text-gray-400">How we protect your data</p>
            </div>
          </a>
        </div>
      </Card>

      <Card className="mb-6 border border-red-500/30">
        <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Danger Zone</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-300 text-sm mb-3">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <a
              href="/legal/delete-account"
              className="text-blue-400 hover:text-blue-300 text-sm underline mb-3 inline-block"
            >
              Learn more about account deletion
            </a>
          </div>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete My Account
            </Button>
          ) : (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 font-bold mb-3">
                Are you absolutely sure?
              </p>
              <p className="text-gray-300 text-sm mb-4">
                This will permanently delete:
              </p>
              <ul className="text-gray-400 text-sm list-disc list-inside mb-4 space-y-1">
                <li>Your profile and account data</li>
                <li>All earned coins and rewards</li>
                <li>Transaction and withdrawal history</li>
                <li>Badges and leaderboard rankings</li>
                <li>All other personal information</li>
              </ul>
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Forever'}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-5 h-5" defaultChecked />
            <span className="text-gray-300">Email notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-5 h-5" defaultChecked />
            <span className="text-gray-300">New ads available</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-5 h-5" />
            <span className="text-gray-300">Weekly earnings summary</span>
          </label>
        </div>
      </Card>

      {error && (
        <div className="mb-6 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {saved && (
        <div className="bg-green-600 text-white p-3 rounded-lg mb-6">
          ✓ Settings saved successfully!
        </div>
      )}

      <Button fullWidth onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  )
}
