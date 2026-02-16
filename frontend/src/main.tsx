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

// Register Monetag service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Monetag SW registered:', registration);
      })
      .catch(error => {
        console.log('Monetag SW registration failed:', error);
      });
  });
}
