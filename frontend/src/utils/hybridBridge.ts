/**
 * Hybrid Bridge Interface for Native ↔ Web Communication
 * 
 * This module provides a typed interface to the native Android bridge
 * and handles session synchronization between native storage and web app.
 */

// TypeScript interface for the native bridge
interface NativeHybridBridge {
  getStoredSession: () => string
  storeSession: (
    accessToken: string,
    refreshToken: string | null,
    userId: string | null,
    expiryTimestamp: number
  ) => void
  clearSession: () => void
  hasValidSession: () => string
}

// Extended window interface
declare global {
  interface Window {
    HybridBridge?: NativeHybridBridge
    HybridAuthBridge?: {
      onSessionInjected?: (session: SessionData) => void
    }
  }
}

export interface SessionData {
  accessToken: string
  refreshToken?: string | null
  userId?: string | null
  expiryTimestamp?: number | null
  success?: boolean
}

/**
 * Check if app is running in hybrid (native WebView) context.
 */
export function isHybridEnvironment(): boolean {
  return typeof window !== 'undefined' && window.HybridBridge !== undefined
}

/**
 * Get stored session from native storage.
 * Returns null if not in hybrid environment or no session exists.
 */
export function getStoredSessionFromNative(): SessionData | null {
  if (!isHybridEnvironment() || !window.HybridBridge) {
    return null
  }

  try {
    const result = window.HybridBridge.getStoredSession()
    const parsed = JSON.parse(result) as SessionData

    if (parsed.success && parsed.accessToken) {
      console.log('✅ Retrieved session from native storage')
      return parsed
    }

    console.log('ℹ️ No session found in native storage')
    return null
  } catch (error) {
    console.error('❌ Failed to retrieve session from native:', error)
    return null
  }
}

/**
 * Store session data to native storage.
 * Only works in hybrid environment.
 */
export function storeSessionToNative(
  accessToken: string,
  refreshToken: string | null,
  userId: string | null,
  expiryTimestamp: number
): void {
  if (!isHybridEnvironment() || !window.HybridBridge) {
    console.log('ℹ️ Not in hybrid environment, skipping native storage')
    return
  }

  try {
    window.HybridBridge.storeSession(
      accessToken,
      refreshToken,
      userId,
      expiryTimestamp
    )
    console.log('✅ Session stored to native storage')
  } catch (error) {
    console.error('❌ Failed to store session to native:', error)
    // FAIL FAST: In hybrid environment, storage failure is critical
    throw new Error('Hybrid bridge storage failure - cannot continue')
  }
}

/**
 * Clear session from native storage.
 * Only works in hybrid environment.
 */
export function clearSessionFromNative(): void {
  if (!isHybridEnvironment() || !window.HybridBridge) {
    console.log('ℹ️ Not in hybrid environment, skipping native clear')
    return
  }

  try {
    window.HybridBridge.clearSession()
    console.log('✅ Session cleared from native storage')
  } catch (error) {
    console.error('❌ Failed to clear session from native:', error)
  }
}

/**
 * Check if native storage has a valid session.
 */
export function hasValidNativeSession(): boolean {
  if (!isHybridEnvironment() || !window.HybridBridge) {
    return false
  }

  try {
    const result = window.HybridBridge.hasValidSession()
    return result === 'true'
  } catch (error) {
    console.error('❌ Failed to check native session validity:', error)
    return false
  }
}

/**
 * Setup listener for session injection from native.
 * This is called by the native app after page load.
 */
export function setupSessionInjectionListener(
  callback: (session: SessionData) => void
): void {
  if (!isHybridEnvironment()) {
    return
  }

  // Create the callback handler
  if (!window.HybridAuthBridge) {
    window.HybridAuthBridge = {}
  }

  window.HybridAuthBridge.onSessionInjected = (session: SessionData) => {
    console.log('✅ Session injected from native app')
    callback(session)
  }
}
