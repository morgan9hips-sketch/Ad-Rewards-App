import { API_BASE_URL } from '../config/api'

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
  event: 'ad_requested' | 'ad_returned',
): Promise<AdEventResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reward/ad-event`, {
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

async function postWatchAd(authToken: string): Promise<AdEventResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reward/watch-ad`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  })

  const data = (await response.json()) as AdEventResponse
  if (!response.ok) {
    throw new Error(data.error || 'Failed to process ad reward')
  }

  return data
}

export async function watchAd(authToken: string) {
  try {
    await postAdEvent(authToken, 'ad_requested')
    return await postWatchAd(authToken)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ad event failed',
    }
  }
}
