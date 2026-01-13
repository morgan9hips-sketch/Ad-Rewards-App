import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [paypalEmail, setPaypalEmail] = useState('')
  const [country, setCountry] = useState('US')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Save settings
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
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
