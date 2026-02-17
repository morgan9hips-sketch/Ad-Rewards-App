import { API_BASE_URL } from '../config/api'

/**
 * Monetag Service for Web Platform
 * 
 * Handles integration with Monetag ad zones:
 * - Push Notifications (10618702)
 * - Banner Multitag (211854)
 * - Vignette Banner (10618701)
 * - In-Page Push (10618700)
 * - OnClick Popunder (10618699) - REWARDED
 */

const MONETAG_ZONES = {
  PUSH: '10618702',
  BANNER: '211854',
  VIGNETTE: '10618701',
  INPAGE: '10618700',
  REWARDED_ONCLICK: '10618699',
} as const

/**
 * Get ad type from zone ID
 */
function getAdType(zoneId: string): string {
  const zoneMap: Record<string, string> = {
    [MONETAG_ZONES.PUSH]: 'push',
    [MONETAG_ZONES.BANNER]: 'banner',
    [MONETAG_ZONES.VIGNETTE]: 'vignette',
    [MONETAG_ZONES.INPAGE]: 'inpage',
    [MONETAG_ZONES.REWARDED_ONCLICK]: 'rewarded',
  }
  return zoneMap[zoneId] || 'unknown'
}

export const monetagService = {
  zones: MONETAG_ZONES,

  /**
   * Track passive impression (no user action required)
   * Used for push, banner, vignette, inpage ads
   */
  async trackPassiveImpression(zoneId: string, token: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/ads/track-monetag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adZoneId: zoneId,
          adType: getAdType(zoneId),
        }),
      })
    } catch (error) {
      console.error('Error tracking passive impression:', error)
    }
  },

  /**
   * Initialize Vignette Banner Ad
   * Displays a banner that appears on page load
   */
  initVignetteBanner(): void {
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://alwingulla.com/88/tag.min.js'
    script.dataset.zone = MONETAG_ZONES.VIGNETTE
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    document.head.appendChild(script)

    console.log('✅ Monetag Vignette Banner initialized')
  },

  /**
   * Initialize In-Page Push Ad
   * Displays push notification-style ads within the page
   */
  initInPagePush(): void {
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://alwingulla.com/88/tag.min.js'
    script.dataset.zone = MONETAG_ZONES.INPAGE
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    document.head.appendChild(script)

    console.log('✅ Monetag In-Page Push initialized')
  },

  /**
   * Initialize OnClick Rewarded Ad
   * User clicks button to trigger popunder and earn coins
   */
  initOnClickAd(
    buttonId: string,
    token: string,
    onSuccess?: (coins: number) => void,
    onError?: (error: string) => void
  ): void {
    if (typeof window === 'undefined') return

    // Load Monetag OnClick script
    const existingScript = document.querySelector(
      `script[data-zone="${MONETAG_ZONES.REWARDED_ONCLICK}"]`
    )
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://alwingulla.com/88/tag.min.js'
      script.dataset.zone = MONETAG_ZONES.REWARDED_ONCLICK
      script.async = true
      script.setAttribute('data-cfasync', 'false')
      document.head.appendChild(script)
    }

    // Attach click handler to button
    const button = document.getElementById(buttonId)
    if (button) {
      button.addEventListener('click', async () => {
        try {
          // Track impression and award coins
          const res = await fetch(`${API_BASE_URL}/api/ads/track-monetag`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              adZoneId: MONETAG_ZONES.REWARDED_ONCLICK,
              adType: 'rewarded',
            }),
          })

          const data = await res.json()
          if (data.success && data.coinsAwarded > 0) {
            console.log(`💰 Earned ${data.coinsAwarded} coins!`)
            onSuccess?.(data.coinsAwarded)
          }
        } catch (error) {
          console.error('Error tracking OnClick:', error)
          onError?.(error instanceof Error ? error.message : 'Unknown error')
        }
      })

      console.log('✅ Monetag OnClick initialized for button:', buttonId)
    }
  },

  /**
   * Initialize all passive ad zones
   */
  initPassiveAds(): void {
    this.initVignetteBanner()
    this.initInPagePush()
    console.log('✅ All passive Monetag ads initialized')
  },
}

export default monetagService
