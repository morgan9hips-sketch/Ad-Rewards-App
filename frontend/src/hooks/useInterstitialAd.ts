import { useEffect, useCallback } from 'react'

declare global {
  interface Window {
    monetag?: {
      push: (config: Record<string, unknown>) => void
    }
  }
}

const CLICK_THRESHOLD = 8 // Show ad every 8 clicks
const STORAGE_KEY = 'interstitial_click_count'

export function useInterstitialAd() {
  const incrementClickCount = useCallback(() => {
    const currentCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
    const newCount = currentCount + 1

    if (newCount >= CLICK_THRESHOLD) {
      // Trigger interstitial ad
      triggerInterstitialAd()
      // Reset counter
      localStorage.setItem(STORAGE_KEY, '0')
    } else {
      // Increment counter
      localStorage.setItem(STORAGE_KEY, newCount.toString())
    }
  }, [])

  const triggerInterstitialAd = () => {
    if (window.monetag) {
      try {
        console.log('🎯 Triggering interstitial ad (8 clicks reached)')
        window.monetag.push({
          interstitial: {
            key: "YOUR_INTERSTITIAL_KEY_HERE", // Replace with actual MonetTag interstitial key
            onComplete: () => {
              console.log('✅ Interstitial ad completed')
            },
            onSkip: () => {
              console.log('⏭️ Interstitial ad skipped')
            },
            onError: (err: Error) => {
              console.error('❌ Interstitial ad error:', err)
            }
          }
        })
      } catch (err) {
        console.error('Error triggering interstitial ad:', err)
      }
    } else {
      console.warn('MonetTag not loaded - skipping interstitial ad')
    }
  }

  useEffect(() => {
    // Track clicks globally
    const handleClick = () => {
      incrementClickCount()
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [incrementClickCount])

  return { incrementClickCount }
}