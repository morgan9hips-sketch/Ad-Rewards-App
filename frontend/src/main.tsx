import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGA4 } from './utils/analytics'

// Initialize Google Analytics 4 before React renders
// This ensures GA4 loads globally for all users (authenticated and unauthenticated)
initializeGA4()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Service worker control to prevent stale cached builds on web
const enableMonetagSw = import.meta.env.VITE_ENABLE_MONETAG_SW === 'true'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        if (!enableMonetagSw) {
          registrations.forEach((registration) => registration.unregister())
          if ('caches' in window) {
            caches
              .keys()
              .then((keys) => keys.forEach((key) => caches.delete(key)))
          }
          return
        }

        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Monetag SW registered:', registration)
          })
          .catch((error) => {
            console.log('Monetag SW registration failed:', error)
          })
      })
      .catch((error) => {
        console.log('Service worker registration check failed:', error)
      })
  })
}
