export async function watchAd(authToken: string) {
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
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ You earned ${data.coinsEarned} coins!`)
        window.location.reload() // Refresh to show new balance
      } else {
        alert(`❌ ${data.error || 'Failed to claim reward'}`)
      }
    } catch (error) {
      console.error('Reward claim failed:', error)
      alert('❌ Network error. Please try again.')
    } finally {
      adWindow.close()
    }
  }, 35000) // 35 seconds = 30s ad + 5s buffer
}