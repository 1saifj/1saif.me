const CACHE_NAME = 'saif-aljanahi-portfolio-v2'
const urlsToCache = [
  '/',
  '/sj.png',
  '/manifest.json',
  '/robots.txt'
]

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache files individually to handle failures gracefully
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.log('Failed to cache:', url, error)
              return null
            })
          )
        )
      })
      .then(() => {
        console.log('Service worker installed successfully')
        self.skipWaiting()
      })
  )
})

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-GET requests and external URLs
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response
        }
        
        // Fetch from network with error handling
        return fetch(event.request).catch(error => {
          console.log('Fetch failed for:', event.request.url, error)
          // Return a fallback response for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/')
          }
          // For other requests, just fail silently
          return new Response('', { status: 404 })
        })
      })
  )
})

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})