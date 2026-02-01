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

// TypeScript declaration for Android bridge
declare global {
  interface Window {
    Android?: {
      setAuthToken: (token: string) => void
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
    // Check if running inside Android WebView
    if (window.Android && typeof window.Android.setAuthToken === 'function') {
      try {
        window.Android.setAuthToken(token)
        console.log('✅ Auth token sent to Android app')
      } catch (error) {
        console.error('❌ Failed to send token to Android:', error)
      }
    } else {
      console.log('ℹ️ Not running in Android WebView, skipping token bridge')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const { role, geoResolved: isGeoResolved } = await fetchUserProfile(
          session.access_token,
        )
        setUser({ ...session.user, role })
        // Only call geo-resolution API if user is not already geo-resolved
        await resolveGeo(session.access_token, isGeoResolved)

        // 🚨 NEW: Send auth token to Android app
        sendTokenToAndroid(session.access_token)
      } else {
        setUser(null)
        setGeoResolved(false)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        const { role, geoResolved: isGeoResolved } = await fetchUserProfile(
          session.access_token,
        )
        setUser({ ...session.user, role })
        // Only call geo-resolution API if user is not already geo-resolved
        await resolveGeo(session.access_token, isGeoResolved)

        // 🚨 NEW: Send auth token to Android app on auth state change
        sendTokenToAndroid(session.access_token)
      } else {
        setUser(null)
        setGeoResolved(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setGeoResolved(false)
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
