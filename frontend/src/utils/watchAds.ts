export async function watchAd() {
  // 1️⃣ Open a controlled popup (user gesture = required)
  const adWindow = window.open(
    '/ad-bridge.html',
    '_blank',
    'width=480,height=800'
  )

  // 2️⃣ Fail-safe: popup blocked
  if (!adWindow) {
    alert('Please allow popups to watch ads.')
    return
  }

  // 3️⃣ Wait fixed time (Monetag video/interstitial duration)
  setTimeout(async () => {
    try {
      const response = await fetch('/api/reward/watch-ad', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ You earned 100 coins!')
        // TODO: Refresh user balance in UI
      } else {
        alert(`❌ ${data.error || 'Failed to claim reward'}`)
      }
    } catch (error) {
      console.error('Reward claim failed:', error)
      alert('❌ Network error. Please try again.')
    } finally {
      adWindow.close()
    }
  }, 35000) // 30s ad + 5s buffer
}