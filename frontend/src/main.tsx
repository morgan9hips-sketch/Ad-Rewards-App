import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeGA4 } from './utils/analytics'

// Initialize Google Analytics 4 before React renders
initializeGA4()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// --------------------------------------------------
// Monetag Service Worker (Apollo 11 – FINAL VERSION)
// --------------------------------------------------

const enableMonetagSw = import.meta.env.VITE_ENABLE_MONETAG_SW === 'true'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Only ever touch the Monetag SW
      const existingRegistration =
        await navigator.serviceWorker.getRegistration('/sw.js')

      // If disabled → unregister Monetag SW only
      if (!enableMonetagSw) {
        if (existingRegistration) {
          await existingRegistration.unregister()
          console.log('🧹 Monetag service worker unregistered')
        }
        return
      }

      // If already registered → do nothing
      if (existingRegistration) {
        console.log('✅ Monetag service worker already registered')
        return
      }

      // Register Monetag service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('🚀 Monetag service worker registered:', registration.scope)
    } catch (error) {
      console.error('❌ Monetag service worker error:', error)
    }
  })
}
