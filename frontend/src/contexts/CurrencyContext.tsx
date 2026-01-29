import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
// import { useAuth } from './AuthContext'  // Unused for now
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
  // const { session } = useAuth()  // Unused for now
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState(false)

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        console.error('Geolocation not supported')
        setLocationError(true)
        return false
      }

      // Request location permission
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log(
              'Location detected:',
              position.coords.latitude,
              position.coords.longitude,
            )
            setLocationError(false)
            loadCurrencyInfo(
              position.coords.latitude,
              position.coords.longitude,
            )
            resolve(true)
          },
          (error) => {
            console.error('Location error:', error.message)
            setLocationError(true)
            // Still load currency based on IP if location is denied
            loadCurrencyInfo()
            resolve(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // Cache for 5 minutes
          },
        )
      })
    } catch (error) {
      console.error('Error requesting location:', error)
      setLocationError(true)
      // DO NOT fallback to IP - location is MANDATORY
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
        console.log('No authentication session - waiting for login')
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
    // Also try to get precise location
    requestLocationPermission()
  }, [])

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
