const CACHE_NAME = 'pttstar-v1';
const OFFLINE_URL = '/offline.html';

// Core assets to cache for offline functionality
const CORE_ASSETS = [
  '/',
  '/offline.html',
  '/assets/generated/pttstar-logo.dim_512x512.png',
  '/assets/generated/pttstar-pwa-icon.dim_192x192.png',
  '/assets/generated/pttstar-pwa-icon.dim_512x512.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache, then offline page
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Internet Identity and canister requests
  if (
    event.request.url.includes('identity.ic0.app') ||
    event.request.url.includes('icp-api.io') ||
    event.request.url.includes('icp0.io') ||
    event.request.url.includes('.raw.icp0.io')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        // Cache successful responses for static assets
        if (response.status === 200 && event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|woff2?)$/)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Try to serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // For navigation requests, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          
          // For other requests, return a basic response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});
