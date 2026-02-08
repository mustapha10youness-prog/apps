const CACHE_NAME = 'madrassa-app-cache-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/assets/arabesque.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache fetched files for future offline use
        return caches.open(CACHE_NAME).then(cache => {
          try { cache.put(event.request, response.clone()); } catch (e) {}
          return response;
        });
      }).catch(() => {
        // fallback to shell
        return caches.match('/index.html');
      });
    })
  );
});
