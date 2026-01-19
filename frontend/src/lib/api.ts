// API utility for making authenticated requests
import { supabase } from './supabase'
import { API_BASE_URL } from '../config/api'

class ApiClient {
  private async getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    return headers
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API Error: ${response.status}`)
    }

    return response.json()
  }
}

export const api = new ApiClient()

// API endpoints
export const endpoints = {
  ads: '/api/ads',
  user: {
    profile: '/api/user/profile',
    allowedCurrencies: '/api/user/allowed-currencies',
  },
  withdrawals: '/api/withdrawals',
  coins: {
    wallet: '/api/coins/wallet',
    transactions: '/api/coins/transactions',
    award: '/api/coins/award',
  },
  cash: {
    wallet: '/api/cash/wallet',
    transactions: '/api/cash/transactions',
    withdraw: '/api/cash/withdraw',
  },
  conversions: {
    rate: '/api/conversions/rate',
    pending: '/api/conversions/pending',
    history: '/api/conversions/history',
    preview: '/api/conversions/preview',
    processMonthly: '/api/conversions/process-monthly',
  },
}
