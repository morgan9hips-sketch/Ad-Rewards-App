// API configuration
// Priority:
// 1) Explicit VITE_API_URL from environment
// 2) Production API for adrevtechnologies domains
// 3) Local backend for development
const envApiUrl = import.meta.env.VITE_API_URL?.trim()
const isAdrevHost =
  typeof window !== 'undefined' &&
  window.location.hostname.endsWith('adrevtechnologies.com')

const API_BASE_URL =
  envApiUrl ||
  (isAdrevHost ? 'https://api.adrevtechnologies.com' : 'http://localhost:4000')

export { API_BASE_URL }
