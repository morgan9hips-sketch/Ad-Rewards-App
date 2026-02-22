/**
 * OGads Service for Web Platform
 *
 * Handles integration with OGads rewarded video and interstitial ads.
 * Uses environment variables:
 *   VITE_OGADS_PUBLISHER_ID
 *   VITE_OGADS_REWARDED_ZONE_ID
 *   VITE_OGADS_INTERSTITIAL_ZONE_ID
 *
 * If OGads is not yet configured, all functions gracefully return an error
 * message instead of showing a fake/mock ad.
 */

const PUBLISHER_ID = import.meta.env.VITE_OGADS_PUBLISHER_ID as string | undefined
const REWARDED_ZONE_ID = import.meta.env.VITE_OGADS_REWARDED_ZONE_ID as string | undefined
const INTERSTITIAL_ZONE_ID = import.meta.env.VITE_OGADS_INTERSTITIAL_ZONE_ID as string | undefined

const ACTIVATION_PENDING_MSG = 'Ad platform activation pending. Check back soon!'

interface OGadsRewardedOptions {
  publisherId: string
  zoneId: string
  onComplete: () => void
  onError: (err: string) => void
}

interface OGadsInterstitialOptions {
  publisherId: string
  zoneId: string
  onComplete: () => void
  onError: (err: string) => void
}

interface OGadsSDK {
  showRewardedVideo: (opts: OGadsRewardedOptions) => void
  showInterstitial: (opts: OGadsInterstitialOptions) => void
}

declare global {
  interface Window {
    ogads?: OGadsSDK
  }
}

function isConfigured(): boolean {
  return (
    !!PUBLISHER_ID &&
    PUBLISHER_ID !== 'placeholder' &&
    !!REWARDED_ZONE_ID &&
    REWARDED_ZONE_ID !== 'placeholder'
  )
}

/**
 * Load an OGads rewarded video ad.
 * Calls onComplete when the user has finished watching.
 * Calls onError if OGads is not configured or an error occurs.
 */
export function loadOGadsRewardedVideo(
  onComplete: () => void,
  onError: (message: string) => void
): void {
  if (!isConfigured()) {
    onError(ACTIVATION_PENDING_MSG)
    return
  }

  try {
    if (!window.ogads) {
      injectOGadsScript(() => {
        loadOGadsRewardedVideo(onComplete, onError)
      }, onError)
      return
    }

    window.ogads.showRewardedVideo({
      publisherId: PUBLISHER_ID!,
      zoneId: REWARDED_ZONE_ID!,
      onComplete: () => {
        console.log('OGads rewarded video completed')
        onComplete()
      },
      onError: (err: string) => {
        console.error('OGads rewarded video error:', err)
        onError(err || 'Ad failed to load. Please try again.')
      },
    })
  } catch (err) {
    console.error('OGads SDK error:', err)
    onError('Ad platform error. Please try again.')
  }
}

/**
 * Load an OGads interstitial ad.
 * Calls onComplete when dismissed.
 * Silently completes if OGads is not yet configured.
 */
export function loadOGadsInterstitial(
  onComplete: () => void,
  onError?: (message: string) => void
): void {
  if (!isConfigured() || !INTERSTITIAL_ZONE_ID || INTERSTITIAL_ZONE_ID === 'placeholder') {
    onComplete()
    return
  }

  try {
    if (!window.ogads) {
      injectOGadsScript(() => {
        loadOGadsInterstitial(onComplete, onError)
      }, onError ?? (() => onComplete()))
      return
    }

    window.ogads.showInterstitial({
      publisherId: PUBLISHER_ID!,
      zoneId: INTERSTITIAL_ZONE_ID,
      onComplete: () => {
        console.log('OGads interstitial completed')
        onComplete()
      },
      onError: (err: string) => {
        console.error('OGads interstitial error:', err)
        onComplete()
      },
    })
  } catch (err) {
    console.error('OGads interstitial SDK error:', err)
    onComplete()
  }
}

/**
 * Inject the OGads SDK script tag if not already present.
 */
function injectOGadsScript(onLoad: () => void, onError: (msg: string) => void): void {
  const existingScript = document.querySelector('script[data-ogads]')
  if (existingScript) {
    const checkInterval = setInterval(() => {
      if (window.ogads) {
        clearInterval(checkInterval)
        onLoad()
      }
    }, 200)
    setTimeout(() => {
      clearInterval(checkInterval)
      onError('Ad platform took too long to load. Please try again.')
    }, 10000)
    return
  }

  const script = document.createElement('script')
  script.src = `https://cdn.ogads.com/sdk/v1/ogads.min.js?pub=${PUBLISHER_ID ?? ''}`
  script.async = true
  script.setAttribute('data-ogads', 'true')
  script.onload = () => {
    console.log('OGads SDK loaded')
    onLoad()
  }
  script.onerror = () => {
    console.error('Failed to load OGads SDK')
    onError(ACTIVATION_PENDING_MSG)
  }
  document.head.appendChild(script)
}

export default { loadOGadsRewardedVideo, loadOGadsInterstitial, isConfigured }
