import { useState, useEffect } from 'react'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency } from '../lib/currency'
import { api } from '../lib/api'

interface RevenuePoolStats {
  countryCode: string
  currency: string
  totalRevenue: bigint
  userRevenue: bigint
  platformRevenue: bigint
  totalUsers: number
  totalAdViews: number
  averageRewardPerAd: number
  exchangeRateToUSD: number
}

interface RevenueAnalytics {
  totalRevenueUSD: number
  totalUsers: number
  totalAdViews: number
  poolCount: number
  topCountries: Array<{
    country: string
    revenue: number
    currency: string
    users: number
  }>
  revenueByCountry: RevenuePoolStats[]
}

export default function AdminRevenuePools() {
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/revenue-pools')
      setAnalytics(response)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch revenue analytics')
      console.error('Revenue analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  const initializePools = async () => {
    try {
      setActionLoading('initialize')
      await api.post('/api/admin/revenue-pools/initialize', {})
      await fetchAnalytics()
      alert('Revenue pools initialized successfully!')
    } catch (err: any) {
      alert(
        'Failed to initialize revenue pools: ' +
          (err.message || 'Unknown error'),
      )
    } finally {
      setActionLoading(null)
    }
  }

  const updateExchangeRates = async () => {
    try {
      setActionLoading('rates')
      await api.post('/api/admin/revenue-pools/update-rates', {})
      await fetchAnalytics()
      alert('Exchange rates updated successfully!')
    } catch (err: any) {
      alert(
        'Failed to update exchange rates: ' + (err.message || 'Unknown error'),
      )
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <Card>
          <div className="text-center py-8">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Error Loading Revenue Analytics
            </h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    )
  }

  const formatCountryName = (countryCode: string) => {
    const countries: Record<string, string> = {
      ZA: '🇿🇦 South Africa',
      US: '🇺🇸 United States',
      CA: '🇨🇦 Canada',
      GB: '🇬🇧 United Kingdom',
      AU: '🇦🇺 Australia',
      DE: '🇩🇪 Germany',
      FR: '🇫🇷 France',
      ES: '🇪🇸 Spain',
      IT: '🇮🇹 Italy',
      NL: '🇳🇱 Netherlands',
      JP: '🇯🇵 Japan',
      CH: '🇨🇭 Switzerland',
      SE: '🇸🇪 Sweden',
    }
    return countries[countryCode] || `${countryCode} Unknown`
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">
          Revenue Pools Analytics 📊
        </h1>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Global Overview */}
      {analytics && (
        <>
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Global Overview
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">
                  Total Revenue (USD)
                </p>
                <p className="text-2xl font-bold text-green-400">
                  ${analytics.totalRevenueUSD.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Users</p>
                <p className="text-2xl font-bold text-blue-400">
                  {analytics.totalUsers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Ad Views</p>
                <p className="text-2xl font-bold text-purple-400">
                  {analytics.totalAdViews.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Pools</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {analytics.poolCount}
                </p>
              </div>
            </div>
          </Card>

          {/* Top Countries */}
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Top Performing Countries
            </h2>
            <div className="space-y-3">
              {analytics.topCountries.map((country, index) => (
                <div
                  key={country.country}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">
                        {formatCountryName(country.country)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {country.users} users
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">
                      {formatCurrency(country.revenue, country.currency)}
                    </p>
                    <p className="text-sm text-gray-400">{country.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Country Breakdown */}
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Revenue Pool Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400">Country</th>
                    <th className="text-left py-3 text-gray-400">Currency</th>
                    <th className="text-right py-3 text-gray-400">
                      Total Revenue
                    </th>
                    <th className="text-right py-3 text-gray-400">
                      User Revenue (85%)
                    </th>
                    <th className="text-right py-3 text-gray-400">
                      Platform (15%)
                    </th>
                    <th className="text-right py-3 text-gray-400">Users</th>
                    <th className="text-right py-3 text-gray-400">Ad Views</th>
                    <th className="text-right py-3 text-gray-400">Avg/Ad</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.revenueByCountry.map((pool) => (
                    <tr
                      key={pool.countryCode}
                      className="border-b border-gray-800"
                    >
                      <td className="py-3 text-white font-medium">
                        {formatCountryName(pool.countryCode)}
                      </td>
                      <td className="py-3 text-gray-300">{pool.currency}</td>
                      <td className="py-3 text-right text-green-400 font-medium">
                        {formatCurrency(
                          Number(pool.totalRevenue),
                          pool.currency,
                        )}
                      </td>
                      <td className="py-3 text-right text-blue-400">
                        {formatCurrency(
                          Number(pool.userRevenue),
                          pool.currency,
                        )}
                      </td>
                      <td className="py-3 text-right text-yellow-400">
                        {formatCurrency(
                          Number(pool.platformRevenue),
                          pool.currency,
                        )}
                      </td>
                      <td className="py-3 text-right text-gray-300">
                        {pool.totalUsers.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-gray-300">
                        {pool.totalAdViews.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-gray-300">
                        {formatCurrency(pool.averageRewardPerAd, pool.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Admin Actions */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Admin Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={initializePools}
                disabled={actionLoading === 'initialize'}
                className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏗️</span>
                  <div>
                    <p className="font-medium">Initialize Revenue Pools</p>
                    <p className="text-sm text-blue-200">
                      Set up pools for all supported countries
                    </p>
                  </div>
                </div>
                {actionLoading === 'initialize' && (
                  <div className="mt-2 text-sm text-blue-200">
                    Initializing...
                  </div>
                )}
              </button>

              <button
                onClick={updateExchangeRates}
                disabled={actionLoading === 'rates'}
                className="p-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💱</span>
                  <div>
                    <p className="font-medium">Update Exchange Rates</p>
                    <p className="text-sm text-green-200">
                      Refresh currency conversion rates
                    </p>
                  </div>
                </div>
                {actionLoading === 'rates' && (
                  <div className="mt-2 text-sm text-green-200">Updating...</div>
                )}
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
