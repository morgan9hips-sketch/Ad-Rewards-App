import React from 'react'

declare global {
  interface Window {
    show_213853?: () => void
  }
}

export default function App() {
  const playAd = () => {
    if (window.show_213853) {
      window.show_213853()
    } else {
      alert('Ad not loaded yet. Refresh and try again.')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Rewarded Video Test</h1>
      <button
        onClick={playAd}
        style={{
          padding: '12px 24px',
          fontSize: '18px',
          cursor: 'pointer',
        }}
      >
        Watch Video Ad
      </button>
    </div>
  )
}
