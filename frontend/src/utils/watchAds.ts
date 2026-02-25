type AdEventResponse = {
  success: boolean
  event?: 'ad_requested' | 'ad_returned'
  rewardGranted?: boolean
  coinsEarned?: number
  error?: string
  reason?: string
}

async function postAdEvent(
  authToken: string,
  event: 'ad_requested' | 'ad_returned'
): Promise<AdEventResponse> {
  const response = await fetch('/api/reward/ad-event', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event, source: 'web' }),
  })

  const data = (await response.json()) as AdEventResponse
  if (!response.ok) {
    throw new Error(data.error || 'Failed to record ad event')
  }

  return data
}

export async function watchAd(authToken: string) {
  const adWindow = window.open(
    '/ad-bridge.html',
    '_blank',
    'width=480,height=800'
  )

  if (!adWindow) {
    return { success: false, error: 'Popup blocked. Please allow popups.' }
  }

  await postAdEvent(authToken, 'ad_requested')

  return await new Promise<AdEventResponse>((resolve) => {
    let resolved = false

    const finalize = async () => {
      if (resolved) return
      resolved = true

      try {
        const result = await postAdEvent(authToken, 'ad_returned')
        resolve(result)
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Ad event failed',
        })
      } finally {
        adWindow.close()
      }
    }

    window.addEventListener('focus', finalize, { once: true })

    const pollClosed = window.setInterval(() => {
      if (adWindow.closed) {
        window.clearInterval(pollClosed)
        finalize()
      }
    }, 500)
  })
}