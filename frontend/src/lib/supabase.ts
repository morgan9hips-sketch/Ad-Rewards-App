import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Detect if running in hybrid native app
const isHybrid = typeof window !== 'undefined' && 
  window.navigator.userAgent.includes('AdifyHybrid')

// Use production URL for redirects, fallback to current origin for dev
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin

// CRITICAL: Use custom scheme for native app OAuth
const redirectUri = isHybrid 
  ? 'adify://oauth/callback' 
  : `${appUrl}/auth/callback`

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const auth = {
  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
      },
    }),

  signUpWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
      },
    }),

  signInWithFacebook: () =>
    supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUri,
      },
    }),

  signUpWithFacebook: () =>
    supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUri,
      },
    }),

  signInWithPassword: ({ email, password }: { email: string; password: string }) =>
    supabase.auth.signInWithPassword({ email, password }),

  signInWithOtp: ({ email, options }: { email: string; options?: any }) =>
    supabase.auth.signInWithOtp({ email, options }),

  signOut: () => supabase.auth.signOut(),

  getUser: () => supabase.auth.getUser(),

  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
}
