/**
 * Service worker for Darya. Precaches the entire app shell on install so
 * the app works fully offline after the first successful load -- no
 * network is needed for any subsequent visit, including the fonts,
 * which are self-hosted specifically so this can be true offline
 * caching rather than depending on a CDN staying reachable.
 *
 * Cache-first strategy: once cached, an asset is served from the cache
 * without touching the network at all. To ship an update, bump
 * CACHE_NAME below -- that creates a new cache name, so the install
 * step re-fetches everything fresh, and the old cache is cleared out on
 * activate.
 */

'use strict';

const CACHE_NAME = 'darya-cache-current';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/darya-engine.js',
  './js/knowledge-base.js',
  './js/languages/halfspace.js',
  './js/languages/entity-extractor.js',
  './js/languages/fa.js',
  './js/languages/en.js',
  './fonts/BeVietnamPro-Regular.woff2',
  './fonts/BeVietnamPro-Medium.woff2',
  './fonts/BeVietnamPro-SemiBold.woff2',
  './fonts/BeVietnamPro-Bold.woff2',
  './fonts/BeVietnamPro-Italic.woff2',
  './fonts/Vazirmatn-Regular.woff2',
  './fonts/Vazirmatn-Medium.woff2',
  './fonts/Vazirmatn-SemiBold.woff2',
  './fonts/Vazirmatn-Bold.woff2',
  './fonts/Lalezar-Regular.woff2',
  './fonts/Quicksand-VF.woff2',
  './favicon.ico',
  './assets/favicon.svg',
  './assets/favicon.ico',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-192.png',
  './assets/icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests; anything else (e.g. a
  // cross-origin request some future addition might make) falls through
  // to the network exactly as it normally would.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          // Opportunistically cache anything fetched that wasn't in the
          // precache list, so a second visit to any same-origin URL this
          // app ever requests is offline-capable too.
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
