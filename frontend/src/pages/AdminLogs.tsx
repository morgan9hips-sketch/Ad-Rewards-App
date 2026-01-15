import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'

interface AdminLog {
  id: number
  action: string
  targetType: string | null
  targetId: number | null
  ipAddress: string | null
  createdAt: string
  admin: {
    userId: string
    email: string
    name: string | null
  }
  metadata: any
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminLogs() {
  const { session } = useAuth()
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    fetchLogs()
  }, [pagination.page])

  async function fetchLogs() {
    try {
      setLoading(true)
      const token = session?.access_token
      if (!token) return

      const response = await fetch(
        `http://localhost:4000/api/admin/logs?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      } else if (response.status === 403) {
        alert('Access denied: You do not have admin privileges')
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      alert('Failed to fetch admin logs')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">📋 Admin Action Log</h1>

      <Card className="mb-6">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-400">
            Total actions: <span className="text-white font-semibold">{pagination.total}</span>
          </p>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No admin actions logged yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-white">{log.admin.email}</div>
                      {log.admin.name && (
                        <div className="text-xs text-gray-400">{log.admin.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {log.targetType && log.targetId ? (
                        <span>
                          {log.targetType} #{log.targetId}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                      {log.ipAddress || <span className="text-gray-600">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-white">
            Page <span className="font-semibold">{pagination.page}</span> of{' '}
            <span className="font-semibold">{pagination.pages}</span>
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
