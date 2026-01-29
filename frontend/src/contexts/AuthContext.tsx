import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { API_BASE_URL } from '../config/api'

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

  const fetchUserRole = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        return data.role as UserRole
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error)
    }
    return 'USER' as UserRole
  }

  const resolveGeo = async (token: string) => {
    try {
      setGeoResolving(true)
      const response = await fetch(`${API_BASE_URL}/api/geo/resolve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setGeoResolved(data.resolved || false)
        return data.resolved || false
      } else {
        console.error('Geo resolution failed')
        setGeoResolved(false)
        return false
      }
    } catch (error) {
      console.error('Failed to resolve geo:', error)
      setGeoResolved(false)
      return false
    } finally {
      setGeoResolving(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const role = await fetchUserRole(session.access_token)
        setUser({ ...session.user, role })
        // Resolve geo after authentication
        await resolveGeo(session.access_token)
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
        const role = await fetchUserRole(session.access_token)
        setUser({ ...session.user, role })
        // Resolve geo after authentication
        await resolveGeo(session.access_token)
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
    <AuthContext.Provider value={{ user, session, loading, isAuthenticated: !!user, geoResolved, geoResolving, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
