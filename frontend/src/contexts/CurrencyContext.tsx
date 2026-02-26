import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
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
  const { session } = useAuth()
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

      // Get the current user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.log('No authentication session - using fallback currency')
        // Set fallback IMMEDIATELY - don't block UI
        setCurrencyInfo({
          displayCurrency: 'USD',
          revenueCountry: null,
          displayCountry: null,
          exchangeRate: 1,
          formatting: { symbol: '$', decimals: 2, position: 'before' },
          locationDetected: false,
          locationRequired: false,
        })
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
        setCurrencyInfo({
          ...data,
          locationDetected: data.locationDetected || false,
          locationRequired: data.locationRequired || false,
        })
        setLocationError(false)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Currency API failed:', errorData)
        // Don't block - allow IP-based fallback
        setLocationError(false)

        // Set basic fallback currency info
        setCurrencyInfo({
          displayCurrency: 'USD',
          revenueCountry: null,
          displayCountry: null,
          exchangeRate: 1,
          formatting: { symbol: '$', decimals: 2, position: 'before' },
          locationDetected: false,
          locationRequired: false,
        })
      }
    } catch (error) {
      console.error('Error loading currency info:', error)
      // Don't block - allow access with fallback
      setLocationError(false)

      // Set basic fallback currency info
      setCurrencyInfo({
        displayCurrency: 'USD',
        revenueCountry: null,
        displayCountry: null,
        exchangeRate: 1,
        formatting: { symbol: '$', decimals: 2, position: 'before' },
        locationDetected: false,
        locationRequired: false,
      })
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
