import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import {
  isHybridEnvironment,
  requestAuthFromNative,
} from '../utils/hybridBridge'
import Button from '../components/Button'
import Card from '../components/Card'

type LoginMode = 'oauth' | 'email'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<LoginMode>('email') // Default to email instead of oauth
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  // Detect if running in native hybrid environment
  const isHybrid = isHybridEnvironment()

  const handleGoogleLogin = async () => {
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue')
      return
    }

    setLoading(true)
    setError('')
    try {
      // NATIVE-FIRST AUTH: If hybrid, let native handle OAuth
      if (isHybrid) {
        console.log(
          '🔐 Hybrid environment detected - requesting auth from native',
        )
        requestAuthFromNative()
        // Native will handle OAuth and inject token
        // No need to wait - native controls the flow
        return
      }

      // WEB FALLBACK: Standard web OAuth flow
      const { error } = await auth.signInWithGoogle()
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue')
      return
    }

    setLoading(true)
    setError('')
    try {
      // NATIVE-FIRST AUTH: If hybrid, let native handle OAuth
      if (isHybrid) {
        console.log(
          '🔐 Hybrid environment detected - requesting auth from native',
        )
        requestAuthFromNative()
        // Native will handle OAuth and inject token
        return
      }

      // WEB FALLBACK: Standard web OAuth flow
      const { error } = await auth.signInWithFacebook()
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue')
      return
    }

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    setError('')
    try {
      const { data, error } = await auth.signInWithPassword({ email, password })
      if (error) throw error

      // If no session, email might need confirmation
      if (!data.session) {
        setError('Please confirm your email address before signing in.')
        setLoading(false)
        return
      }

      // Success - navigate to dashboard
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue')
      return
    }

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    try {
      const { error } = await auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      })
      if (error) throw error
      setMagicLinkSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
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

        {magicLinkSent ? (
          <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded mb-4">
            <p className="font-semibold mb-2">✓ Magic link sent!</p>
            <p className="text-sm">
              Check your email ({email}) for a login link. Click the link to
              sign in.
            </p>
          </div>
        ) : (
          <>
            {/* Mode toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                fullWidth
                variant={mode === 'oauth' ? 'primary' : 'secondary'}
                onClick={() => setMode('oauth')}
              >
                Social Login
              </Button>
              <Button
                fullWidth
                variant={mode === 'email' ? 'primary' : 'secondary'}
                onClick={() => setMode('email')}
              >
                Email Login
              </Button>
            </div>

            {mode === 'oauth' ? (
              <div className="space-y-3">
                <Button
                  fullWidth
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  🔍 Continue with Google
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={handleFacebookLogin}
                  disabled={loading}
                >
                  📘 Continue with Facebook
                </Button>
              </div>
            ) : (
              {/* Email/Password Login */}
            <div className="space-y-4">
              <form onSubmit={handleEmailPasswordLogin} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in with Password'}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">or</span>
                </div>
              </div>

              <form onSubmit={handleMagicLinkLogin}>
                <Button
                  type="submit"
                  fullWidth
                  variant="secondary"
                  disabled={loading || !email}
                >
                  ✨ Send Magic Link
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center">
                Magic links let you sign in without a password. Just click the
                link in your email!
              </p>
            </div>
            )}
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-700">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
            />
            <span className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
              I agree to the{' '}
              <Link
                to="/terms"
                className="text-blue-400 hover:text-blue-300 underline"
                target="_blank"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-blue-400 hover:text-blue-300 underline"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          By signing in, you acknowledge that you are at least 18 years old or
          have parental consent.
        </p>
      </Card>
    </div>
  )
}
