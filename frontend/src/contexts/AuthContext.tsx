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
  getStoredSessionFromNative,
  storeSessionToNative,
  clearSessionFromNative,
  setupSessionInjectionListener,
  type SessionData as NativeSessionData,
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
    // Skip API call if user is already geo-resolved
    if (alreadyResolved) {
      setGeoResolved(true)
      return true
    }

    try {
      setGeoResolving(true)
      const response = await fetch(`${API_BASE_URL}/api/geo/resolve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setGeoResolved(data.resolved || false)
        return data.resolved || false
      } else {
        console.error('Geo resolution failed')
        // Allow user to proceed even if geo-resolution fails (as per requirements)
        setGeoResolved(true)
        return true
      }
    } catch (error) {
      console.error('Failed to resolve geo:', error)
      // Allow user to proceed even if geo-resolution fails (as per requirements)
      setGeoResolved(true)
      return true
    } finally {
      setGeoResolving(false)
    }
  }

  const sendTokenToAndroid = (token: string) => {
    // DEPRECATED: Old Android bridge method (kept for backwards compatibility)
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

  /**
   * Store session to native hybrid bridge.
   * Only called in hybrid environment.
   */
  const storeSessionToHybridBridge = (session: Session) => {
    if (!isHybridEnvironment()) {
      return
    }

    try {
      // Calculate expiry timestamp (default to 1 hour from now if not provided)
      const expiryTimestamp = session.expires_at
        ? session.expires_at * 1000
        : Date.now() + 3600000

      storeSessionToNative(
        session.access_token,
        session.refresh_token || null,
        session.user?.id || null,
        expiryTimestamp
      )
    } catch (error) {
      console.error('❌ Critical: Failed to store session to native bridge:', error)
      // FAIL FAST: In hybrid environment, this is critical
      throw error
    }
  }

  /**
   * Restore session from native storage on boot.
   * Returns true if session was restored, false otherwise.
   */
  const restoreSessionFromNative = async (): Promise<boolean> => {
    if (!isHybridEnvironment()) {
      return false
    }

    const nativeSession = getStoredSessionFromNative()
    if (!nativeSession || !nativeSession.accessToken) {
      return false
    }

    try {
      // Set the session in Supabase
      const { data, error } = await supabase.auth.setSession({
        access_token: nativeSession.accessToken,
        refresh_token: nativeSession.refreshToken || '',
      })

      if (error) {
        console.error('❌ Failed to restore session from native storage:', error)
        // Clear invalid session
        clearSessionFromNative()
        return false
      }

      if (data.session && data.session.user) {
        console.log('✅ Session restored from native storage')
        setSession(data.session)

        // Fetch user profile and resolve geo
        const { role, geoResolved: isGeoResolved } = await fetchUserProfile(
          data.session.access_token
        )
        setUser({ ...data.session.user, role })
        await resolveGeo(data.session.access_token, isGeoResolved)

        return true
      }

      return false
    } catch (error) {
      console.error('❌ Error restoring session from native:', error)
      clearSessionFromNative()
      return false
    }
  }

  useEffect(() => {
    // Setup session injection listener for hybrid environment
    if (isHybridEnvironment()) {
      setupSessionInjectionListener(async (nativeSession: NativeSessionData) => {
        if (!nativeSession.accessToken) {
          return
        }

        try {
          // Set the session in Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: nativeSession.accessToken,
            refresh_token: nativeSession.refreshToken || '',
          })

          if (error) {
            console.error('❌ Failed to inject session from native:', error)
            return
          }

          if (data.session && data.session.user) {
            console.log('✅ Session injected successfully')
            setSession(data.session)

            // Fetch user profile and resolve geo
            const { role, geoResolved: isGeoResolved } = await fetchUserProfile(
              data.session.access_token
            )
            setUser({ ...data.session.user, role })
            await resolveGeo(data.session.access_token, isGeoResolved)
          }
        } catch (error) {
          console.error('❌ Error injecting session:', error)
        }
      })
    }

    // Initialize authentication
    const initAuth = async () => {
      // HYBRID MODE: Try to restore session from native storage first
      if (isHybridEnvironment()) {
        const restored = await restoreSessionFromNative()
        if (restored) {
          setLoading(false)
          return
        }
      }

      // STANDARD MODE: Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session?.user) {
        const { role, geoResolved: isGeoResolved } = await fetchUserProfile(
          session.access_token,
        )
        setUser({ ...session.user, role })
        await resolveGeo(session.access_token, isGeoResolved)
        
        // Store to native if in hybrid mode
        if (isHybridEnvironment()) {
          storeSessionToHybridBridge(session)
        }
        
        // Legacy bridge support
        sendTokenToAndroid(session.access_token)
      } else {
        setUser(null)
        setGeoResolved(false)
      }
      setLoading(false)
    }

    initAuth()

    // This handles subsequent auth events (SIGN_IN, SIGN_OUT)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN' && session?.user) {
        const { role, geoResolved: isGeoResolved } = await fetchUserProfile(
          session.access_token,
        )
        setUser({ ...session.user, role })
        await resolveGeo(session.access_token, isGeoResolved)
        
        // Store to native if in hybrid mode
        if (isHybridEnvironment()) {
          storeSessionToHybridBridge(session)
        }
        
        // Legacy bridge support
        sendTokenToAndroid(session.access_token)

        // --- 🚨 NEW LOGIC FOR SIGN-UP 🚨 ---
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
        // --- END OF NEW LOGIC ---
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setGeoResolved(false)
        
        // Clear native storage on sign out
        if (isHybridEnvironment()) {
          clearSessionFromNative()
        }
      }
      // We keep loading=false on initial load only to prevent UI flicker
    })

    return () => subscription.unsubscribe()
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
