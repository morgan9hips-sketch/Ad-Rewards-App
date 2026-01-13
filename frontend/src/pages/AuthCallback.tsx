import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message)
        setTimeout(() => navigate('/login'), 3000)
        return
      }
      if (session) {
        navigate('/dashboard')
      } else {
        setError('No session found')
        setTimeout(() => navigate('/login'), 3000)
      }
    })
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Authentication Error</div>
          <p className="text-gray-400">{error}</p>
          <p className="text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="text-gray-400 mt-4">Completing sign in...</p>
      </div>
    </div>
  )
}
