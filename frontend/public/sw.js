// Service worker for app caching and offline support
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Allow fetch to proceed normally
})
