import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { API_BASE_URL } from '../config/api'
import {
  isHybridEnvironment,
  clearSessionFromNative,
} from '../utils/hybridBridge'

// TypeScript declaration for Android bridge
declare global {
  interface Window {
    Android?: {
      setAuthToken: (token: string) => void
      onUserSignedUp: () => void // Added for IP address capture
    }
  }
}

type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

interface UserWithRole extends User {
  role?: UserRole
}

interface AuthContextType {
  user: UserWithRole | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  geoResolved: boolean
  geoResolving: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [geoResolved, setGeoResolved] = useState(false)
  const [geoResolving, setGeoResolving] = useState(false)

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        return {
          role: data.role as UserRole,
          geoResolved: data.geoResolved || false,
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
    return { role: 'USER' as UserRole, geoResolved: false }
  }

  const resolveGeo = async (token: string, alreadyResolved: boolean) => {
    // Always allow user through immediately
    setGeoResolved(true)
    
    // Skip API call if user is already geo-resolved
    if (alreadyResolved) {
      return true
    }

    // Do geo resolution in background (non-blocking)
    setGeoResolving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/geo-resolve/resolve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Geo resolved:', data)
      }
    } catch (error) {
      console.error('Background geo resolution failed:', error)
    } finally {
      setGeoResolving(false)
    }
    
    return true
  }

  const sendTokenToAndroid = (token: string) => {
    // DEPRECATED: Old Android bridge method (kept for backwards compatibility)
    // TODO: Remove after verifying all users have migrated to HybridBridge
    // Check if running inside Android WebView
    if (window.Android && typeof window.Android.setAuthToken === 'function') {
      try {
        window.Android.setAuthToken(token)
        console.log('✅ Auth token sent to Android app (legacy bridge)')
      } catch (error) {
        console.error('❌ Failed to send token to Android:', error)
      }
    }
  }

  const triggerAndroidSignUp = () => {
    if (window.Android && typeof window.Android.onUserSignedUp === 'function') {
      console.log('🚀 New user detected. Triggering IP capture in Android app.')
      window.Android.onUserSignedUp()
    }
  }

  useEffect(() => {
    let subscription: ReturnType<
      typeof supabase.auth.onAuthStateChange
    >['data']['subscription'] | null = null

    const initialize = async () => {
      // Always clear session on app open - no session persistence
      await supabase.auth.signOut()
      if (isHybridEnvironment()) {
        clearSessionFromNative()
      }
      setUser(null)
      setSession(null)
      setLoading(false)

      // Handle auth events (SIGN_IN, SIGN_OUT) during current app runtime
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session)
        if (event === 'SIGNED_IN' && session?.user) {
          const { role, geoResolved: isGeoResolved } = await fetchUserProfile(
            session.access_token,
          )
          setUser({ ...session.user, role })
          await resolveGeo(session.access_token, isGeoResolved)

          // Legacy bridge support
          sendTokenToAndroid(session.access_token)

          // Heuristic to detect if this is a new sign-up vs. a regular sign-in.
          const user = session.user
          const creationTime = new Date(user.created_at).getTime()
          const lastSignInTime = user.last_sign_in_at
            ? new Date(user.last_sign_in_at).getTime()
            : creationTime

          // If account was created less than 10 seconds before this sign-in, treat as new user.
          if (Math.abs(creationTime - lastSignInTime) < 10000) {
            triggerAndroidSignUp()
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setGeoResolved(false)

          // Clear native storage on sign out
          if (isHybridEnvironment()) {
            clearSessionFromNative()
          }
        }
      })
      subscription = data.subscription
    }

    initialize()

    return () => subscription?.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setGeoResolved(false)

    // Clear native storage if in hybrid mode
    if (isHybridEnvironment()) {
      clearSessionFromNative()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        geoResolved,
        geoResolving,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

