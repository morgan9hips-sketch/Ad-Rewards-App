import {
  AdMob,
  RewardAdPluginEvents,
  InterstitialAdPluginEvents,
  BannerAdSize,
  BannerAdPosition,
} from '@capacitor-community/admob'
import { Capacitor, PluginListenerHandle } from '@capacitor/core'

interface AdMobConfig {
  appId: string
  rewardedAdUnitId: string
  interstitialAdUnitId: string
  bannerAdUnitId: string
}

class AdMobService {
  private config: AdMobConfig
  private initialized: boolean = false
  private isNative: boolean = false
  private rewardedAdListeners: PluginListenerHandle[] = []
  private interstitialAdListeners: PluginListenerHandle[] = []

  constructor() {
    this.config = {
      appId: import.meta.env.VITE_ADMOB_APP_ID || '',
      rewardedAdUnitId: import.meta.env.VITE_ADMOB_REWARDED_ID || '',
      interstitialAdUnitId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || '',
      bannerAdUnitId: import.meta.env.VITE_ADMOB_BANNER_ID || '',
    }

    // Check if running in native Capacitor app
    this.isNative = Capacitor.isNativePlatform()
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🎬 Initializing AdMob SDK...')
    console.log('Platform:', this.isNative ? 'Native (Android/iOS)' : 'Web')
    console.log('App ID:', this.config.appId)

    if (this.isNative) {
      // Real AdMob initialization for native app
      try {
        await AdMob.initialize({
          testingDevices:
            import.meta.env.VITE_ADMOB_TEST_DEVICE_IDS?.split(',') || [],
          initializeForTesting: import.meta.env.DEV, // Use test ads in development
        })
        console.log('✅ Real AdMob SDK initialized')
      } catch (error) {
        console.error('❌ AdMob initialization failed:', error)
        throw error
      }
    } else {
      // Mock for web browser testing
      await this.simulateDelay(500)
      console.log('✅ Mock AdMob initialized (web browser)')
    }

    this.initialized = true
  }

  async loadRewardedAd(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AdMob not initialized. Call initialize() first.')
    }

    console.log('📥 Loading rewarded ad...')

    if (this.isNative) {
      // Real AdMob: Prepare rewarded ad
      await AdMob.prepareRewardVideoAd({
        adId: this.config.rewardedAdUnitId,
      })
    } else {
      // Mock: Simulate loading
      await this.simulateDelay(1000)
    }

    console.log('✅ Rewarded ad loaded')
  }

  async showRewardedAd(
    onRewarded: (reward: { amount: number; type: string }) => void,
    onAdClosed: () => void,
    onAdFailedToShow: (error: string) => void,
  ): Promise<void> {
    try {
      console.log('🎥 Showing rewarded ad...')

      if (this.isNative) {
        // Clean up any existing listeners
        await this.cleanupRewardedAdListeners()

        // Real AdMob: Show rewarded video ad

        // Set up reward listener
        const rewardedListener = await AdMob.addListener(
          RewardAdPluginEvents.Rewarded,
          (reward) => {
            console.log('💰 User earned reward:', reward)
            onRewarded({ amount: 100, type: 'coins' })
          },
        )
        this.rewardedAdListeners.push(rewardedListener)

        // Set up dismissed listener
        const dismissedListener = await AdMob.addListener(
          RewardAdPluginEvents.Dismissed,
          async () => {
            console.log('✅ Rewarded ad closed')
            onAdClosed()
            // Clean up listeners after ad is dismissed
            await this.cleanupRewardedAdListeners()
          },
        )
        this.rewardedAdListeners.push(dismissedListener)

        // Set up failed listener
        const failedListener = await AdMob.addListener(
          RewardAdPluginEvents.FailedToShow,
          async (error) => {
            console.error('❌ Failed to show rewarded ad:', error)
            onAdFailedToShow(error.message || 'Unknown error')
            // Clean up listeners on failure
            await this.cleanupRewardedAdListeners()
          },
        )
        this.rewardedAdListeners.push(failedListener)

        // Show the ad
        await AdMob.showRewardVideoAd()
      } else {
        // Mock: Simulate ad display
        await this.simulateDelay(2000)

        const reward = { amount: 100, type: 'coins' }
        onRewarded(reward)
        console.log('💰 User earned reward (mock):', reward)

        await this.simulateDelay(500)
        onAdClosed()
        console.log('✅ Rewarded ad closed (mock)')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      onAdFailedToShow(errorMessage)
      console.error('❌ Failed to show rewarded ad:', errorMessage)
      // Clean up listeners on error
      if (this.isNative) {
        await this.cleanupRewardedAdListeners()
      }
    }
  }

  private async cleanupRewardedAdListeners(): Promise<void> {
    for (const listener of this.rewardedAdListeners) {
      await listener.remove()
    }
    this.rewardedAdListeners = []
  }

  async loadInterstitialAd(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AdMob not initialized. Call initialize() first.')
    }

    console.log('📥 Loading interstitial ad...')

    if (this.isNative) {
      await AdMob.prepareInterstitial({
        adId: this.config.interstitialAdUnitId,
      })
    } else {
      await this.simulateDelay(1000)
    }

    console.log('✅ Interstitial ad loaded')
  }

  async showInterstitialAd(
    onAdClosed: () => void,
    onAdFailedToShow: (error: string) => void,
  ): Promise<void> {
    try {
      console.log('🎥 Showing interstitial ad...')

      if (this.isNative) {
        // Clean up any existing listeners
        await this.cleanupInterstitialAdListeners()

        const dismissedListener = await AdMob.addListener(
          InterstitialAdPluginEvents.Dismissed,
          async () => {
            console.log('✅ Interstitial ad closed')
            onAdClosed()
            // Clean up listeners after ad is dismissed
            await this.cleanupInterstitialAdListeners()
          },
        )
        this.interstitialAdListeners.push(dismissedListener)

        const failedListener = await AdMob.addListener(
          InterstitialAdPluginEvents.FailedToShow,
          async (error) => {
            console.error('❌ Failed to show interstitial ad:', error)
            onAdFailedToShow(error.message || 'Unknown error')
            // Clean up listeners on failure
            await this.cleanupInterstitialAdListeners()
          },
        )
        this.interstitialAdListeners.push(failedListener)

        await AdMob.showInterstitial()
      } else {
        await this.simulateDelay(3000)
        onAdClosed()
        console.log('✅ Interstitial ad closed (mock)')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      onAdFailedToShow(errorMessage)
      console.error('❌ Failed to show interstitial ad:', errorMessage)
      // Clean up listeners on error
      if (this.isNative) {
        await this.cleanupInterstitialAdListeners()
      }
    }
  }

  private async cleanupInterstitialAdListeners(): Promise<void> {
    for (const listener of this.interstitialAdListeners) {
      await listener.remove()
    }
    this.interstitialAdListeners = []
  }

  async showBannerAd(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AdMob not initialized. Call initialize() first.')
    }

    if (this.isNative) {
      console.log('📺 Showing banner ad...')
      await AdMob.showBanner({
        adId: this.config.bannerAdUnitId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      })
      console.log('✅ Banner ad shown')
    } else {
      console.log('⚠️ Banner ads only work in native app')
    }
  }

  // Can be called with or without containerId for backward compatibility
  hideBannerAd(containerId?: string): void {
    if (containerId && !this.isNative) {
      // Legacy web behavior: clear DOM container
      const container = document.getElementById(containerId)
      if (container) {
        container.innerHTML = ''
      }
      console.log('👻 Banner ad hidden')
    } else if (this.isNative) {
      // Native behavior: hide banner through SDK
      AdMob.hideBanner()
      console.log('✅ Banner ad hidden')
    }
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Helper to generate mock AdMob impression data
  generateImpressionData(adType: 'rewarded' | 'interstitial' | 'banner'): {
    admobImpressionId: string
    countryCode: string
    estimatedEarnings: number
    currency: string
  } {
    // In a real app, this data would come from AdMob SDK
    // Using crypto.randomUUID() for more robust ID generation
    const uuid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    return {
      admobImpressionId: `mock_${adType}_${uuid}`,
      countryCode: this.detectCountryCode(),
      estimatedEarnings: this.generateMockRevenue(adType),
      currency: 'AUTO',
    }
  }

  private detectCountryCode(): string {
    // In a real app, AdMob SDK provides this
    // For testing, we'll use a mock value
    return 'XX' // Let backend handle detection
  }

  private generateMockRevenue(
    adType: 'rewarded' | 'interstitial' | 'banner',
  ): number {
    // Base CPM rates in USD (will be converted by backend)
    const cpmRates = {
      rewarded: 2.5, // $2.50 CPM base rate
      interstitial: 3.0, // $3.00 CPM base rate
      banner: 1.2, // $1.20 CPM base rate
    }

    // Calculate revenue (CPM / 1000)
    return cpmRates[adType] / 1000
  }

  // Legacy methods for backward compatibility with existing code
  loadBannerAd(containerId: string): void {
    if (!this.initialized) {
      throw new Error('AdMob not initialized. Call initialize() first.')
    }

    console.log('📥 Loading banner ad in container:', containerId)

    if (this.isNative) {
      // For native, use showBannerAd() instead
      // Fire and forget - caller doesn't expect a promise from this legacy method
      this.showBannerAd().catch((error) => {
        console.error('Failed to show banner ad:', error)
      })
    } else {
      // In a real app, you would load the banner ad here
      // For web simulation, we'll create a placeholder banner
      const container = document.getElementById(containerId)
      if (container) {
        container.innerHTML = `
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            border-radius: 4px;
          ">
            📱 AdMob Banner (${this.config.bannerAdUnitId.substring(0, 20)}...)
          </div>
        `
      }
    }

    console.log('✅ Banner ad loaded')
  }
}

export const admobService = new AdMobService()
export default admobService
