import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SplashScreen from './components/SplashScreen'
import './index.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

function AppWithSplash() {
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} minDisplayMs={3000} />
  }

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithSplash />
  </React.StrictMode>,
)
