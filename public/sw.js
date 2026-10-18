// The site no longer uses a service worker. Browsers that installed the old caching one
// fetch this file on their next visit, then drop its caches and unregister it.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key)
    await self.registration.unregister()

    for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url)
  })())
})
