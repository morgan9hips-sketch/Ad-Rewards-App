import { AdMob, RewardedAdPluginEvents, InterstitialAdPluginEvents, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

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
          testingDevices: ['YOUR_TEST_DEVICE_ID'], // Add your test device ID
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
      await AdMob.prepareRewardedVideoAd({
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
    onAdFailedToShow: (error: string) => void
  ): Promise<void> {
    try {
      console.log('🎥 Showing rewarded ad...')
      
      if (this.isNative) {
        // Real AdMob: Show rewarded video ad
        
        // Set up reward listener
        AdMob.addListener(RewardedAdPluginEvents.Rewarded, (reward) => {
          console.log('💰 User earned reward:', reward)
          onRewarded({ amount: 100, type: 'coins' })
        })
        
        // Set up dismissed listener
        AdMob.addListener(RewardedAdPluginEvents.Dismissed, () => {
          console.log('✅ Rewarded ad closed')
          onAdClosed()
          // Clean up listeners
          AdMob.removeAllListeners()
        })
        
        // Set up failed listener
        AdMob.addListener(RewardedAdPluginEvents.FailedToShow, (error) => {
          console.error('❌ Failed to show rewarded ad:', error)
          onAdFailedToShow(error.message || 'Unknown error')
          AdMob.removeAllListeners()
        })
        
        // Show the ad
        await AdMob.showRewardedVideoAd()
        
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onAdFailedToShow(errorMessage)
      console.error('❌ Failed to show rewarded ad:', errorMessage)
    }
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
    onAdFailedToShow: (error: string) => void
  ): Promise<void> {
    try {
      console.log('🎥 Showing interstitial ad...')
      
      if (this.isNative) {
        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
          console.log('✅ Interstitial ad closed')
          onAdClosed()
          AdMob.removeAllListeners()
        })
        
        AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error) => {
          console.error('❌ Failed to show interstitial ad:', error)
          onAdFailedToShow(error.message || 'Unknown error')
          AdMob.removeAllListeners()
        })
        
        await AdMob.showInterstitial()
      } else {
        await this.simulateDelay(3000)
        onAdClosed()
        console.log('✅ Interstitial ad closed (mock)')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onAdFailedToShow(errorMessage)
      console.error('❌ Failed to show interstitial ad:', errorMessage)
    }
  }

  async showBannerAd(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AdMob not initialized. Call initialize() first.')
    }

    if (this.isNative) {
      console.log('📺 Showing banner ad...')
      await AdMob.showBanner({
        adId: this.config.bannerAdUnitId,
        adSize: AdMobBannerSize.BANNER,
        position: 'BOTTOM_CENTER',
        margin: 0,
      })
      console.log('✅ Banner ad shown')
    } else {
      console.log('⚠️ Banner ads only work in native app')
    }
  }

  async hideBannerAd(): Promise<void> {
    if (this.isNative) {
      await AdMob.hideBanner()
      console.log('✅ Banner ad hidden')
    }
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
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
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    
    return {
      admobImpressionId: `mock_${adType}_${uuid}`,
      countryCode: this.detectCountryCode(),
      estimatedEarnings: this.generateMockRevenue(adType),
      currency: 'USD',
    }
  }

  private detectCountryCode(): string {
    // In a real app, AdMob SDK provides this
    // For testing, we'll use a mock value
    return 'US' // Default to US for testing
  }

  private generateMockRevenue(adType: 'rewarded' | 'interstitial' | 'banner'): number {
    // Mock CPM rates (AdMob provides real values)
    const cpmRates = {
      rewarded: 2.50,    // $2.50 CPM
      interstitial: 3.00, // $3.00 CPM
      banner: 1.20,       // $1.20 CPM
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
      this.showBannerAd()
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

  hideBannerAdLegacy(containerId: string): void {
    if (this.isNative) {
      this.hideBannerAd()
    } else {
      const container = document.getElementById(containerId)
      if (container) {
        container.innerHTML = ''
      }
      console.log('👻 Banner ad hidden')
    }
  }
}

export const admobService = new AdMobService()
export default admobService
