import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { API_BASE_URL } from '../config/api'

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
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>({
    displayCurrency: 'ZAR',
    revenueCountry: 'ZA',
    displayCountry: 'ZA',
    exchangeRate: 18.5, // Approximate USD to ZAR exchange rate
    formatting: {
      symbol: 'R',
      decimals: 2,
      position: 'before',
    },
    locationDetected: true,
    locationRequired: false,
  })
  const [loading, setLoading] = useState(false) // Set to false since we're providing default ZAR
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
      return false
    }
  }

  const loadCurrencyInfo = async (lat?: number, lng?: number) => {
    try {
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      let url = `${API_BASE_URL}/api/user/currency-info`
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}`
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Currency info loaded:', data)
        setCurrencyInfo({
          ...data,
          locationDetected: !!(lat && lng),
          locationRequired: false, // Always allow access with default ZAR
        })
        setLocationError(false)
      } else {
        console.warn('Currency API failed, using default ZAR')
        // Keep default ZAR if API fails
        setLocationError(false)
      }
    } catch (error) {
      console.error('Error loading currency info:', error)
      console.log('Using default ZAR currency')
      // Keep default ZAR on error
      setLocationError(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      // Always try to get location first
      requestLocationPermission()
    }
  }, [session])

  const formatAmount = (
    amountUsd: number,
    showBoth: boolean = false,
  ): string => {
    if (!currencyInfo) {
      return `$${amountUsd.toFixed(2)}`
    }

    const localAmount = amountUsd * currencyInfo.exchangeRate
    const formatted = localAmount.toFixed(currencyInfo.formatting.decimals)
    const withCommas = parseFloat(formatted).toLocaleString('en-US', {
      minimumFractionDigits: currencyInfo.formatting.decimals,
      maximumFractionDigits: currencyInfo.formatting.decimals,
    })

    let result =
      currencyInfo.formatting.position === 'before'
        ? `${currencyInfo.formatting.symbol}${withCommas}`
        : `${withCommas}${currencyInfo.formatting.symbol}`

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
