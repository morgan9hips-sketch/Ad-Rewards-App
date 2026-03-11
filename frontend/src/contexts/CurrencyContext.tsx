import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { API_BASE_URL } from '../config/api'
import { supabase } from '../lib/supabase'

interface CurrencyInfo {
  displayCurrency: string
  revenueCountry: string | null
  displayCountry: string | null
  exchangeRate: number
  formatting: {
    symbol: string
    decimals: number
    position: 'before' | 'after'
  }
  locationDetected: boolean
  locationRequired: boolean
}

const CURRENCY_CACHE_KEY = 'adify_currency_info_v1'

const buildUsdFallbackCurrencyInfo = (): CurrencyInfo => ({
  displayCurrency: 'USD',
  revenueCountry: null,
  displayCountry: null,
  exchangeRate: 1,
  formatting: { symbol: '$', decimals: 2, position: 'before' },
  locationDetected: false,
  locationRequired: false,
})

const readCachedCurrencyInfo = (): CurrencyInfo | null => {
  try {
    const raw = localStorage.getItem(CURRENCY_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: CurrencyInfo; cachedAt?: number }
    if (!parsed?.value) return null
    return parsed.value
  } catch {
    return null
  }
}

const writeCachedCurrencyInfo = (value: CurrencyInfo) => {
  try {
    localStorage.setItem(
      CURRENCY_CACHE_KEY,
      JSON.stringify({ value, cachedAt: Date.now() }),
    )
  } catch {
    // ignore cache write failures
  }
}

interface CurrencyContextType {
  currencyInfo: CurrencyInfo | null
  loading: boolean
  locationError: boolean
  formatAmount: (amountUsd: number, showBoth?: boolean) => string
  refreshCurrencyInfo: () => Promise<void>
  requestLocationPermission: () => Promise<boolean>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState(false)

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      // DISABLE geolocation prompts - use IP-based detection only
      console.log('Using IP-based location detection (no browser prompt)')
      localStorage.setItem('location_prompted', 'true')
      loadCurrencyInfo()
      return false
    } catch (error) {
      console.error('Error loading location:', error)
      setLocationError(true)
      loadCurrencyInfo()
      return false
    }
  }

  const loadCurrencyInfo = async (lat?: number, lng?: number) => {
    try {
      setLoading(true)

      // If we have a recent cached currency, show it immediately while refreshing.
      // This prevents "flashing" to USD during brief backend hiccups.
      const cached = readCachedCurrencyInfo()
      if (cached && !currencyInfo) {
        setCurrencyInfo(cached)
      }

      // Get the current user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.log('No authentication session - using cached or fallback currency')
        // Set fallback IMMEDIATELY - don't block UI
        setCurrencyInfo(cached || buildUsdFallbackCurrencyInfo())
        setLoading(false)
        return
      }

      let url = `${API_BASE_URL}/api/user/currency-info`
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Currency info loaded:', data)
        const next: CurrencyInfo = {
          ...data,
          locationDetected: data.locationDetected || false,
          locationRequired: data.locationRequired || false,
        }
        setCurrencyInfo(next)
        writeCachedCurrencyInfo(next)
        setLocationError(false)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Currency API failed:', errorData)
        // Don't block - allow IP-based fallback
        setLocationError(false)

        // Prefer cached geo-currency; otherwise USD fallback
        setCurrencyInfo(cached || buildUsdFallbackCurrencyInfo())
      }
    } catch (error) {
      console.error('Error loading currency info:', error)
      // Don't block - allow access with fallback
      setLocationError(false)

      // Prefer cached geo-currency; otherwise USD fallback
      const cached = readCachedCurrencyInfo()
      setCurrencyInfo(cached || buildUsdFallbackCurrencyInfo())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Always load currency info immediately when component mounts
    loadCurrencyInfo()
  }, [])

  // Reload currency info ONCE when session becomes available (removed to prevent loop)
  // Currency info is loaded on mount and will use the session if available

  const formatAmount = (
    amountUsd: number,
    showBoth: boolean = false,
  ): string => {
    if (!currencyInfo) {
      return 'Loading...'
    }

    const localAmount = amountUsd * currencyInfo.exchangeRate
    const formatted = localAmount.toFixed(currencyInfo.formatting.decimals)
    const withCommas = parseFloat(formatted).toLocaleString('en-US', {
      minimumFractionDigits: currencyInfo.formatting.decimals,
      maximumFractionDigits: currencyInfo.formatting.decimals,
    })

    let result: string
    if (currencyInfo.formatting.position === 'before') {
      result = `${currencyInfo.formatting.symbol}${withCommas}`
    } else {
      result = `${withCommas}${currencyInfo.formatting.symbol}`
    }

    if (showBoth && currencyInfo.displayCurrency !== 'USD') {
      result += ` (≈ $${amountUsd.toFixed(2)} USD)`
    }

    return result
  }

  const refreshCurrencyInfo = async () => {
    setLoading(true)
    await requestLocationPermission()
  }

  return (
    <CurrencyContext.Provider
      value={{
        currencyInfo,
        loading,
        locationError,
        formatAmount,
        refreshCurrencyInfo,
        requestLocationPermission,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
