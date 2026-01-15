import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'

export default function Settings() {
  const { user, session } = useAuth()
  const { currencyInfo, refreshCurrencyInfo } = useCurrency()
  const [paypalEmail, setPaypalEmail] = useState('')
  const [country, setCountry] = useState('US')
  const [preferredCurrency, setPreferredCurrency] = useState('USD')
  const [autoDetectCurrency, setAutoDetectCurrency] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch('http://localhost:4000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setPaypalEmail(data.paypalEmail || '')
        setCountry(data.country || 'US')
        setPreferredCurrency(data.preferredCurrency || 'USD')
        setAutoDetectCurrency(data.autoDetectCurrency !== false)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSave = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch('http://localhost:4000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paypalEmail,
          country,
          preferredCurrency,
          autoDetectCurrency
        })
      })

      if (res.ok) {
        setSaved(true)
        await refreshCurrencyInfo() // Refresh currency context
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Settings ⚙️</h1>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
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
        <h2 className="text-xl font-bold text-white mb-4">💱 Currency Display</h2>
        <div className="space-y-4">
          <label className="flex items-start gap-3">
            <input 
              type="checkbox"
              className="w-5 h-5 mt-1"
              checked={autoDetectCurrency}
              onChange={(e) => setAutoDetectCurrency(e.target.checked)}
            />
            <div>
              <span className="text-gray-300 block font-medium">Auto-detect currency from location</span>
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
              ℹ️ <strong>Display only.</strong> Earnings are based on ads watched in{' '}
              {currencyInfo?.revenueCountry || 'your location'}. All payouts are in USD.
            </p>
          </div>
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
