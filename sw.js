const CACHE_NAME = 'wedding-pwa-v1';
const ASSETS_TO_CACHE = [
  './admin_dashboard.html',
  './manifest.json',
  './Romdoul.png',
  './B03.jpg'
];

// ១. Install Event - ទាញយក File សំខាន់ៗមកទុកក្នុង Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ២. Activate Event - សម្អាត Cache ចាស់ៗ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ៣. Fetch Event - ដំណើរការ Network មុន បើគ្មានអ៊ីនធឺណិតទាញពី Cache មកប្រើ
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./admin_dashboard.html');
          }
        });
      })
  );
});