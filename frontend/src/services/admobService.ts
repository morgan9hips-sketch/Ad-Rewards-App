// AdMob Service for Web
// Note: For production mobile apps, use native AdMob SDKs
// This is a mock implementation for web testing

interface AdMobConfig {
  appId: string
  rewardedAdUnitId: string
  interstitialAdUnitId: string
  bannerAdUnitId: string
}

class AdMobService {
  private config: AdMobConfig
  private initialized: boolean = false

  constructor() {
    this.config = {
      appId: import.meta.env.VITE_ADMOB_APP_ID || '',
      rewardedAdUnitId: import.meta.env.VITE_ADMOB_REWARDED_ID || '',
      interstitialAdUnitId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || '',
      bannerAdUnitId: import.meta.env.VITE_ADMOB_BANNER_ID || '',
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🎬 Initializing AdMob SDK...')
    console.log('App ID:', this.config.appId)
    
    // In a real mobile app, you would initialize the AdMob SDK here
    // For web, we'll simulate the initialization
    await this.simulateDelay(500)
    
    this.initialized = true
    console.log('✅ AdMob SDK initialized')
  }

  async loadRewardedAd(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AdMob not initialized. Call initialize() first.')
    }

    console.log('📥 Loading rewarded ad...')
    await this.simulateDelay(1000)
    console.log('✅ Rewarded ad loaded')
  }

  async showRewardedAd(
    onRewarded: (reward: { amount: number; type: string }) => void,
    onAdClosed: () => void,
    onAdFailedToShow: (error: string) => void
  ): Promise<void> {
    try {
      console.log('🎥 Showing rewarded ad...')
      
      // Simulate ad display
      await this.simulateDelay(2000)
      
      // Simulate ad completion and reward
      const reward = { amount: 100, type: 'coins' }
      onRewarded(reward)
      console.log('💰 User earned reward:', reward)
      
      // Simulate ad closed
      await this.simulateDelay(500)
      onAdClosed()
      console.log('✅ Rewarded ad closed')
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
    await this.simulateDelay(1000)
    console.log('✅ Interstitial ad loaded')
  }

  async showInterstitialAd(
    onAdClosed: () => void,
    onAdFailedToShow: (error: string) => void
  ): Promise<void> {
    try {
      console.log('🎥 Showing interstitial ad...')
      
      // Simulate ad display
      await this.simulateDelay(3000)
      
      // Simulate ad closed
      onAdClosed()
      console.log('✅ Interstitial ad closed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onAdFailedToShow(errorMessage)
      console.error('❌ Failed to show interstitial ad:', errorMessage)
    }
  }

  loadBannerAd(containerId: string): void {
    if (!this.initialized) {
      throw new Error('AdMob not initialized. Call initialize() first.')
    }

    console.log('📥 Loading banner ad in container:', containerId)
    
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
    
    console.log('✅ Banner ad loaded')
  }

  hideBannerAd(containerId: string): void {
    const container = document.getElementById(containerId)
    if (container) {
      container.innerHTML = ''
    }
    console.log('👻 Banner ad hidden')
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
}

export const admobService = new AdMobService()
export default admobService
