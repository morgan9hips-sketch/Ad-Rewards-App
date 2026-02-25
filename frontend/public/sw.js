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
  // Monetag ads will be handled by their service worker
})

// Monetag service worker integration
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')

