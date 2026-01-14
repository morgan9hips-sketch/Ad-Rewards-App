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

export default function AdminConversions() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
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
        <h2 className="text-xl font-bold text-white mb-4">Process Monthly Conversion</h2>
        <form onSubmit={handleProcessConversion} className="space-y-4">
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
