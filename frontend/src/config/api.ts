// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://api.adrevtechnologies.com' 
    : 'http://localhost:4000')

export const FRONTEND_URL = import.meta.env.VITE_APP_URL ||
  (import.meta.env.PROD
    ? 'https://adify.adrevtechnologies.com'
    : 'http://localhost:5173')
