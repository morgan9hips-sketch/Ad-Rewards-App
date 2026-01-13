import { useState } from 'react'
import { auth } from '../lib/supabase'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await auth.signInWithGoogle()
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await auth.signInWithFacebook()
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6">Sign In</h1>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <Button fullWidth onClick={handleGoogleLogin} disabled={loading}>
            🔍 Continue with Google
          </Button>
          <Button fullWidth variant="secondary" onClick={handleFacebookLogin} disabled={loading}>
            📘 Continue with Facebook
          </Button>
        </div>
      </Card>
    </div>
  )
}
