import { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { isHybridEnvironment, requestAuthFromNative } from '../utils/hybridBridge'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Detect if running in native hybrid environment
  const isHybrid = isHybridEnvironment()
  
  // DEBUG: Log detection at component mount
  console.log('ðŸ” LOGIN COMPONENT DEBUG:')
  console.log('  - isHybrid:', isHybrid)
  console.log('  - window.HybridBridge exists:', typeof window !== 'undefined' && (window as any).HybridBridge !== undefined)
  console.log('  - User-Agent:', typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A')
  console.log('  - HybridBridge methods:', typeof window !== 'undefined' && (window as any).HybridBridge ? Object.keys((window as any).HybridBridge) : 'N/A')

  const handleGoogleLogin = async () => {
    console.log('ðŸš€ handleGoogleLogin clicked')
    
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue')
      return
    }

    setLoading(true)
    setError('')
    try {
      // NATIVE-FIRST AUTH: If hybrid, let native handle OAuth
      if (isHybrid) {
        console.log('ðŸ” Hybrid environment detected - requesting auth from native')
        console.log('ðŸ” Calling requestAuthFromNative()...')
        requestAuthFromNative()
        console.log('âœ… requestAuthFromNative() called successfully')
        // Native will handle OAuth and inject token
        // No need to wait - native controls the flow
        return
      }
      
      console.log('ðŸŒ Web environment - using standard OAuth')
      
      // WEB FALLBACK: Standard web OAuth flow
      const { error } = await auth.signInWithGoogle()
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () {
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue')
      return
    }

    setLoading(true)
    setError('')
    try {
      // NATIVE-FIRST AUTH: If hybrid, let native handle OAuth
      if (isHybrid) {
        console.log('ðŸ” Hybrid environment detected - requesting auth from native')
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
            ðŸ” Continue with Google
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={handleFacebookLogin}
            disabled={loading}
          >
            ðŸ“˜ Continue with Facebook
          </Button>
        </div>

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

