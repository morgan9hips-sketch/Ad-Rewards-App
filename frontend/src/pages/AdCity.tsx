import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'

interface Task {
  id: number
  title: string
  description: string | null
  type: string
  provider: string
  rewardCoins: number
  baseRewardUSD: number
}

export default function AdCity() {
  const { session } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [userCountry, setUserCountry] = useState('')
  const [submitting, setSubmitting] = useState<number | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/v2/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        setTasks(data.tasks)
        setUserCountry(data.userCountry)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskClick = async (taskId: number) => {
    try {
      const token = session?.access_token
      if (!token) return

      setSubmitting(taskId)

      const res = await fetch(`${API_BASE_URL}/api/v2/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providerReference: `web_${Date.now()}` }),
      })

      const data = await res.json()
      alert(data.message || (data.success ? 'Task submitted!' : data.error || 'Failed to submit task'))
      fetchTasks()
    } catch (error) {
      console.error('Error completing task:', error)
      alert('Failed to complete task')
    } finally {
      setSubmitting(null)
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">🏙️ Ad City</h1>
        <p className="text-gray-400">
          Complete tasks to earn coins • Your location: {userCountry || 'Unknown'}
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { type: 'Surveys', icon: '📋', color: 'blue' },
            { type: 'Offers', icon: '🎁', color: 'purple' },
            { type: 'Videos', icon: '📺', color: 'red' },
            { type: 'App Installs', icon: '📱', color: 'green' },
            { type: 'Shopping', icon: '🛒', color: 'yellow' },
            { type: 'Games', icon: '🎮', color: 'pink' },
          ].map((taskType) => (
            <Card key={taskType.type} className="opacity-60">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 bg-${taskType.color}-900 text-${taskType.color}-300 rounded`}>
                    {taskType.type.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">Partner Network</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">{taskType.icon}</span>
                  {taskType.type}
                </h3>
                <p className="text-sm text-gray-400">
                  Complete {taskType.type.toLowerCase()} from our partner networks to earn coins
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 font-bold text-lg">
                  Coming Soon
                </div>
                <div className="px-4 py-2 bg-gray-800 text-gray-500 rounded text-sm cursor-not-allowed">
                  Launching Soon
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:border-blue-500 transition-colors">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-1 bg-blue-900 text-blue-300 rounded">
                    {task.type.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-400">{task.provider}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-yellow-400 font-bold text-xl">
                  {task.rewardCoins} coins
                </div>
                <Button
                  onClick={() => handleTaskClick(task.id)}
                  size="sm"
                  loading={submitting === task.id}
                  disabled={submitting !== null}
                >
                  Start →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
