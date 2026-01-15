import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

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
}

interface CurrencyContextType {
  currencyInfo: CurrencyInfo | null
  loading: boolean
  formatAmount: (amountUsd: number, showBoth?: boolean) => string
  refreshCurrencyInfo: () => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCurrencyInfo = async () => {
    try {
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:4000/api/user/currency-info', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setCurrencyInfo(data)
      }
    } catch (error) {
      console.error('Error loading currency info:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCurrencyInfo()
  }, [session])

  const formatAmount = (amountUsd: number, showBoth: boolean = false): string => {
    if (!currencyInfo) {
      return `$${amountUsd.toFixed(2)}`
    }

    const localAmount = amountUsd * currencyInfo.exchangeRate
    const formatted = localAmount.toFixed(currencyInfo.formatting.decimals)
    const withCommas = parseFloat(formatted).toLocaleString('en-US', {
      minimumFractionDigits: currencyInfo.formatting.decimals,
      maximumFractionDigits: currencyInfo.formatting.decimals
    })

    let result = currencyInfo.formatting.position === 'before'
      ? `${currencyInfo.formatting.symbol}${withCommas}`
      : `${withCommas}${currencyInfo.formatting.symbol}`

    if (showBoth && currencyInfo.displayCurrency !== 'USD') {
      result += ` (≈ $${amountUsd.toFixed(2)} USD)`
    }

    return result
  }

  const refreshCurrencyInfo = async () => {
    await loadCurrencyInfo()
  }

  return (
    <CurrencyContext.Provider value={{ currencyInfo, loading, formatAmount, refreshCurrencyInfo }}>
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
