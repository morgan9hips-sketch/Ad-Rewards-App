/**
 * Google Analytics 4 Integration
 * Initializes GA4 global site tag for tracking traffic, engagement, and geo metrics
 */

// Declare gtag types for TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

/**
 * Initializes Google Analytics 4 if a measurement ID is configured
 * This should be called once when the app loads, before any user interactions
 */
export function initializeGA4(): void {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

  // Only initialize if measurement ID is configured
  if (!measurementId || measurementId === '') {
    console.log('GA4: Measurement ID not configured, skipping initialization')
    return
  }

  // Prevent multiple initializations
  if (window.gtag) {
    console.log('GA4: Already initialized, skipping')
    return
  }

  // Create and append gtag.js script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }

  // Configure GA4
  window.gtag('js', new Date())
  window.gtag('config', measurementId)

  console.log('GA4: Initialized with measurement ID:', measurementId)
}
