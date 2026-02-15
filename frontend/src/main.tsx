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
