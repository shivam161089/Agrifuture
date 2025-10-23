const CACHE_NAME = 'agrifuture-india-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Note: Dynamically loaded JS/CSS from CDNs will not be cached by this list.
  // The fetch event handler will cache them upon first request.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then(networkResponse => {
          // Check if we received a valid response
          if (networkResponse && networkResponse.status === 200) {
            // Clone the response because it's a stream and can only be consumed once.
            const responseToCache = networkResponse.clone();
            cache.put(event.request, responseToCache);
          }
          return networkResponse;
        }).catch(() => {
          // If the network request fails (e.g., offline),
          // return the offline fallback page.
          // Check if it's a navigation request before returning the offline page.
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      });
    })
  );
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});