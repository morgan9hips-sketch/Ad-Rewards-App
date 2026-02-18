import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, auth } from '../lib/supabase'
import { API_BASE_URL } from '../config/api'
import Button from '../components/Button'
import PasswordInput from '../components/PasswordInput'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  isHybridEnvironment,
  requestAuthFromNative,
} from '../utils/hybridBridge'

type SignupMode = 'oauth' | 'email'

export default function Signup() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [mode, setMode] = useState<SignupMode>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrerName, setReferrerName] = useState<string | null>(null)
  const [clearingSession, setClearingSession] = useState(false)
  const isHybrid = isHybridEnvironment()

  const clearSupabaseStorage = () => {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL || ''
      const ref = url.replace(/^https?:\/\//, '').split('.')[0]
      if (ref) {
        localStorage.removeItem(`sb-${ref}-auth-token`)
        localStorage.removeItem(`sb-${ref}-auth-token-code-verifier`)
      }
    } catch (error) {
      console.warn('Failed to clear Supabase storage:', error)
    }
  }

  useEffect(() => {
    const clearOldSession = async () => {
      // CRITICAL: Fully sign out any existing session before showing signup
      if (session) {
        setClearingSession(true)
        try {
          await supabase.auth.signOut({ scope: 'local' })
        } catch (error) {
          console.warn('Supabase signOut failed:', error)
        }
        clearSupabaseStorage()
        // Wait for session to fully clear
        await new Promise((resolve) => setTimeout(resolve, 500))
        setClearingSession(false)
      }
    }
    clearOldSession()

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
  }, [session])

  const fetchReferrerInfo = async (code: string) => {
    try {
      // Use the new public lookup endpoint
      const res = await fetch(`${API_BASE_URL}/api/referrals/lookup/${code}`)
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralCode: refCode }),
      })
      localStorage.removeItem('referralCode')
    } catch (error) {
      console.error('Error tracking referral:', error)
    }
  }

  const handleGoogleSignup = async () => {
    setError('')
    setLoading(true)
    try {
      if (isHybrid) {
        console.log(
          '🔐 Hybrid environment detected - requesting auth from native',
        )
        requestAuthFromNative()
        return
      }

      const { error } = await auth.signUpWithGoogle()
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google signup failed')
      setLoading(false)
    }
  }

  const handleFacebookSignup = async () => {
    setError('')
    setLoading(true)
    try {
      if (isHybrid) {
        console.log(
          '🔐 Hybrid environment detected - requesting auth from native',
        )
        requestAuthFromNative()
        return
      }

      const { error } = await auth.signUpWithFacebook()
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Facebook signup failed')
      setLoading(false)
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
        options: {
          emailRedirectTo: undefined, // CRITICAL: Don't redirect for email signup
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (!data.session) {
        // Email confirmation required - show message
        setError(
          'Please check your email to confirm your account before signing in.',
        )
        setTimeout(() => navigate('/login'), 3000)
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

  // Show loading while clearing old session
  if (clearingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-gray-400 mt-4">Preparing signup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-400">Join Adify and start earning today!</p>
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

          {/* Mode toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              fullWidth
              variant={mode === 'oauth' ? 'primary' : 'secondary'}
              onClick={() => setMode('oauth')}
            >
              Social Signup
            </Button>
            <Button
              fullWidth
              variant={mode === 'email' ? 'primary' : 'secondary'}
              onClick={() => setMode('email')}
            >
              Email Signup
            </Button>
          </div>

          {mode === 'oauth' ? (
            <div className="space-y-3">
              <Button fullWidth onClick={handleGoogleSignup} disabled={loading}>
                🔍 Sign up with Google
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={handleFacebookSignup}
                disabled={loading}
              >
                📘 Sign up with Facebook
              </Button>
            </div>
          ) : (
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

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? <LoadingSpinner size="small" /> : 'Create Account'}
              </Button>
            </form>
          )}

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
