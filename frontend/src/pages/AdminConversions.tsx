import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'

interface Conversion {
  id: number
  conversionDate: string
  admobRevenueUsd: string
  totalUserPayoutUsd: string
  totalCoinsConverted: string
  conversionRateUsdPerCoin: string
  usersAffected: number
  status: string
  processedAt: string | null
}

interface Stats {
  pendingCoins: string
  totalCashEarned: string
  totalWithdrawn: string
  totalRevenue: string
  totalPayouts: string
  conversionsProcessed: number
  usersWithPendingCoins: number
}

interface LocationRevenue {
  countryCode: string
  admobRevenueUsd: string
}

const COUNTRIES = [
  { code: 'US', name: '🇺🇸 United States', flag: '🇺🇸' },
  { code: 'ZA', name: '🇿🇦 South Africa', flag: '🇿🇦' },
  { code: 'GB', name: '🇬🇧 United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: '🇨🇦 Canada', flag: '🇨🇦' },
  { code: 'AU', name: '🇦🇺 Australia', flag: '🇦🇺' },
  { code: 'IN', name: '🇮🇳 India', flag: '🇮🇳' },
  { code: 'DE', name: '🇩🇪 Germany', flag: '🇩🇪' },
  { code: 'FR', name: '🇫🇷 France', flag: '🇫🇷' },
  { code: 'NG', name: '🇳🇬 Nigeria', flag: '🇳🇬' },
  { code: 'BR', name: '🇧🇷 Brazil', flag: '🇧🇷' },
  { code: 'MX', name: '🇲🇽 Mexico', flag: '🇲🇽' },
]

export default function AdminConversions() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [useLocationBased, setUseLocationBased] = useState(true)
  
  // Location-based form
  const [revenues, setRevenues] = useState<LocationRevenue[]>([
    { countryCode: 'US', admobRevenueUsd: '' },
  ])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [notes, setNotes] = useState('')
  
  // Legacy global form
  const [formData, setFormData] = useState({
    admobRevenue: '',
    month: new Date().toISOString().slice(0, 7),
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = session?.access_token
      if (!token) return

      // Fetch conversions
      const conversionsRes = await fetch('http://localhost:4000/api/admin/conversions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (conversionsRes.ok) {
        const data = await conversionsRes.json()
        setConversions(data.conversions || [])
      }

      // Fetch stats
      const statsRes = await fetch('http://localhost:4000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addLocationRevenue = () => {
    setRevenues([...revenues, { countryCode: 'US', admobRevenueUsd: '' }])
  }

  const removeLocationRevenue = (index: number) => {
    setRevenues(revenues.filter((_, i) => i !== index))
  }

  const updateLocationRevenue = (index: number, field: keyof LocationRevenue, value: string) => {
    const updated = [...revenues]
    updated[index] = { ...updated[index], [field]: value }
    setRevenues(updated)
  }

  const handleProcessLocationConversion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const validRevenues = revenues.filter(r => r.admobRevenueUsd && parseFloat(r.admobRevenueUsd) > 0)
    
    if (validRevenues.length === 0) {
      alert('Please enter at least one valid revenue amount')
      return
    }

    const totalRevenue = validRevenues.reduce((sum, r) => sum + parseFloat(r.admobRevenueUsd), 0)
    
    if (!confirm(`Process location-based conversion for ${month}?\n\n${validRevenues.length} locations, Total Revenue: $${totalRevenue.toFixed(2)}\n\nThis will convert all pending coins to cash for users. This action cannot be undone.`)) {
      return
    }

    try {
      setProcessing(true)
      const token = session?.access_token
      if (!token) return

      const res = await fetch('http://localhost:4000/api/admin/process-location-conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          revenues: validRevenues,
          month,
          notes,
        }),
      })

      const result = await res.json()

      if (result.success) {
        const summary = result.results.map((r: any) => 
          `${r.countryCode}: ${r.usersAffected} users, ${r.totalCoins} coins, rate $${parseFloat(r.conversionRate).toFixed(8)}/coin`
        ).join('\n')
        
        alert(`Location-based conversion completed successfully!\n\n${summary}`)
        
        // Reset form
        setRevenues([{ countryCode: 'US', admobRevenueUsd: '' }])
        setMonth(new Date().toISOString().slice(0, 7))
        setNotes('')
        
        // Refresh data
        fetchData()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error processing location conversion:', error)
      alert('Failed to process conversion. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleProcessConversion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.admobRevenue || parseFloat(formData.admobRevenue) <= 0) {
      alert('Please enter a valid AdMob revenue amount')
      return
    }

    if (!confirm(`Process conversion for ${formData.month}?\n\nAdMob Revenue: $${formData.admobRevenue}\n\nThis will convert all pending coins to cash for users. This action cannot be undone.`)) {
      return
    }

    try {
      setProcessing(true)
      const token = session?.access_token
      if (!token) return

      const res = await fetch('http://localhost:4000/api/admin/process-conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          admobRevenue: parseFloat(formData.admobRevenue),
          month: formData.month,
          notes: formData.notes,
        }),
      })

      const result = await res.json()

      if (result.success) {
        alert(`Conversion completed successfully!\n\nUsers affected: ${result.data.usersAffected}\nTotal coins converted: ${result.data.totalCoinsConverted}\nConversion rate: $${parseFloat(result.data.conversionRate).toFixed(8)} per coin`)
        
        // Reset form
        setFormData({
          admobRevenue: '',
          month: new Date().toISOString().slice(0, 7),
          notes: '',
        })
        
        // Refresh data
        fetchData()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error processing conversion:', error)
      alert('Failed to process conversion. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">💰 Coin Conversions</h1>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Pending Coins</p>
              <p className="text-2xl font-bold text-yellow-500">
                {parseInt(stats.pendingCoins).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.usersWithPendingCoins} users
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-500">
                ${parseFloat(stats.totalRevenue).toFixed(2)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Total Payouts</p>
              <p className="text-2xl font-bold text-green-500">
                ${parseFloat(stats.totalPayouts).toFixed(2)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Withdrawn</p>
              <p className="text-2xl font-bold text-purple-500">
                ${parseFloat(stats.totalWithdrawn).toFixed(2)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Conversion Form */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Process Monthly Conversion</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUseLocationBased(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                useLocationBased 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              📍 Location-Based
            </button>
            <button
              type="button"
              onClick={() => setUseLocationBased(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !useLocationBased 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🌐 Global (Legacy)
            </button>
          </div>
        </div>

        {useLocationBased ? (
          // Location-Based Form
          <form onSubmit={handleProcessLocationConversion} className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-300">
                <strong>📍 Location-Based Conversion:</strong> Process revenue separately per country.
                Each location gets its own conversion rate based on its revenue pool.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Month *</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Revenue by Location *
                </label>
                <button
                  type="button"
                  onClick={addLocationRevenue}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  + Add Location
                </button>
              </div>

              <div className="space-y-3">
                {revenues.map((rev, index) => (
                  <div key={index} className="flex gap-3 items-start bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex-1">
                      <select
                        value={rev.countryCode}
                        onChange={(e) => updateLocationRevenue(index, 'countryCode', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                      >
                        {COUNTRIES.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rev.admobRevenueUsd}
                        onChange={(e) => updateLocationRevenue(index, 'admobRevenueUsd', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="Revenue (USD)"
                      />
                      {rev.admobRevenueUsd && (
                        <p className="text-xs text-gray-400 mt-1">
                          User share (85%): ${(parseFloat(rev.admobRevenueUsd) * 0.85).toFixed(2)}
                        </p>
                      )}
                    </div>
                    {revenues.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocationRevenue(index)}
                        className="px-3 py-2 text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2 text-sm text-gray-400">
                Total Revenue: ${revenues.reduce((sum, r) => sum + (parseFloat(r.admobRevenueUsd) || 0), 0).toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder="Optional notes about this conversion"
              />
            </div>

            <Button type="submit" fullWidth disabled={processing}>
              {processing ? 'Processing...' : 'Process Location-Based Conversion'}
            </Button>
          </form>
        ) : (
          // Legacy Global Form
          <form onSubmit={handleProcessConversion} className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-300">
                <strong>⚠️ Legacy Mode:</strong> Global conversion pools all users together.
                Consider using Location-Based for more accurate payouts.
              </p>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              AdMob Revenue (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.admobRevenue}
              onChange={(e) => setFormData({ ...formData, admobRevenue: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Enter AdMob revenue amount"
              required
            />
            {formData.admobRevenue && (
              <p className="text-sm text-gray-400 mt-1">
                User payout (85%): ${(parseFloat(formData.admobRevenue) * 0.85).toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Month *</label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Optional notes about this conversion"
            />
          </div>

          <Button type="submit" fullWidth disabled={processing}>
            {processing ? 'Processing...' : 'Process Global Conversion'}
          </Button>
        </form>
        )}
      </Card>
          </div>

          <Button type="submit" fullWidth disabled={processing}>
            {processing ? 'Processing...' : 'Process Conversion'}
          </Button>
        </form>
      </Card>

      {/* Conversion History */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Conversion History</h2>
        {conversions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No conversions processed yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-2 text-gray-400">Date</th>
                  <th className="text-right py-2 px-2 text-gray-400">Revenue</th>
                  <th className="text-right py-2 px-2 text-gray-400">Payout (85%)</th>
                  <th className="text-right py-2 px-2 text-gray-400">Coins</th>
                  <th className="text-right py-2 px-2 text-gray-400">Rate</th>
                  <th className="text-right py-2 px-2 text-gray-400">Users</th>
                  <th className="text-center py-2 px-2 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((conv) => (
                  <tr key={conv.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="py-2 px-2 text-white">
                      {new Date(conv.conversionDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 text-right text-white">
                      ${parseFloat(conv.admobRevenueUsd).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-green-500">
                      ${parseFloat(conv.totalUserPayoutUsd).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-yellow-500">
                      {parseInt(conv.totalCoinsConverted).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right text-blue-500">
                      ${parseFloat(conv.conversionRateUsdPerCoin).toFixed(8)}
                    </td>
                    <td className="py-2 px-2 text-right text-white">{conv.usersAffected}</td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          conv.status === 'completed'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-yellow-900 text-yellow-300'
                        }`}
                      >
                        {conv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
