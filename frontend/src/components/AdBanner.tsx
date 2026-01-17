import { useEffect, useRef } from 'react'
import admobService from '../services/admobService'

export default function AdBanner() {
  const bannerRef = useRef<HTMLDivElement>(null)
  const containerId = 'admob-banner-container'

  useEffect(() => {
    // Initialize AdMob if not already done
    admobService.initialize().then(() => {
      // Load banner ad
      admobService.loadBannerAd(containerId)
    }).catch(error => {
      console.error('Failed to initialize AdMob:', error)
    })

    // Cleanup on unmount
    return () => {
      admobService.hideBannerAd(containerId)
    }
  }, [])

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700">
      <div id={containerId} ref={bannerRef} className="w-full" />
    </div>
  )
}
