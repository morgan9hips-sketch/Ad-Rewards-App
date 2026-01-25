import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { API_BASE_URL } from '../config/api'
import Button from '../components/Button'
import PasswordInput from '../components/PasswordInput'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Signup() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrerName, setReferrerName] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    if (session) {
      navigate('/dashboard')
      return
    }

    // Detect referral code in URL
    const params = new URLSearchParams(window.location.search)
    const refCode = params.get('ref')

    if (refCode) {
      // Store in localStorage
      localStorage.setItem('referralCode', refCode)
      setReferralCode(refCode)

      // Optionally fetch referrer info
      fetchReferrerInfo(refCode)
    }
  }, [session, navigate])

  const fetchReferrerInfo = async (code: string) => {
    try {
      // This endpoint would need to be created in backend
      const res = await fetch(`${API_BASE_URL}/api/referrals/info/${code}`)
      if (res.ok) {
        const data = await res.json()
        setReferrerName(data.displayName || 'A friend')
      }
    } catch (error) {
      console.error('Error fetching referrer info:', error)
    }
  }

  const trackReferral = async (token: string, refCode: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/referrals/track`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralCode: refCode }),
      })
      localStorage.removeItem('referralCode')
    } catch (error) {
      console.error('Error tracking referral:', error)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      setLoading(true)

      // Sign up the user using Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // If signup successful and there's a referral code, track it
      if (data.session?.access_token && referralCode) {
        await trackReferral(data.session.access_token, referralCode)
      }

      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-400">
              Join Adify and start earning today!
            </p>
          </div>

          {referralCode && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
              <p className="text-green-300 text-center font-semibold">
                🎉 You were referred by {referrerName || 'a friend'}!
              </p>
              <p className="text-green-400 text-sm text-center mt-1">
                You'll both receive bonuses when you qualify
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="text-xs text-gray-400 text-center">
              By signing up, you agree to our{' '}
              <a href="/terms" className="text-blue-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </a>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
