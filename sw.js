/**
 * Service worker for Darya. Precaches the entire app shell on install so
 * the app works fully offline after the first successful load; no
 * network is needed for any subsequent visit, including the fonts,
 * which are self-hosted specifically so this can be true offline
 * caching rather than depending on a CDN staying reachable.
 *
 * Cache-first strategy: once cached, an asset is served from the cache
 * without touching the network at all. To ship an update, bump the
 * version in package.json; that creates a new cache name, so the
 * install step re-fetches everything fresh, and old caches are cleared
 * out on activate, but only after the install has fully succeeded.
 */

'use strict';

let CACHE_NAME = 'darya-cache-fallback';

// Set to true only after the current install has fully precached the
// new app shell. The activate handler uses this to avoid purging old
// caches after a failed or interrupted install.
let installSucceeded = false;

const PRECACHE_URLS = [
  './',
  './index.html',
  './package.json',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/engine/index.js',
  './js/engine/utils.js',
  './js/engine/factual.js',
  './js/engine/recap.js',
  './js/engine/responder.js',
  './js/ui/core.js',
  './js/ui/ambient.js',
  './js/ui/ambient-sound.js',
  './js/ui/export.js',
  './js/ui/overlays.js',
  './js/ui/logger.js',
  './js/data/knowledge-base.js',
  './js/languages/index.js',
  './js/languages/halfspace.js',
  './js/languages/entity-extractor.js',
  './js/languages/fa.js',
  './js/languages/en.js',
  './js/languages/fa-responses.js',
  './js/languages/en-responses.js',
  './js/engine/time-utils.js',
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
  './assets/favicon.ico',
  './assets/icons/favicon-16x16.png',
  './assets/icons/favicon-32x32.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/android-chrome-192x192.png',
  './assets/icons/android-chrome-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('./package.json')
      .then(function (r) {
        return r.json();
      })
      .then(function (pkg) {
        CACHE_NAME = 'darya-cache-v' + (pkg.version || '0.0.0');
      })
      .catch(function () {
        // Fallback: use a stable name so offline-first load still works
        CACHE_NAME = 'darya-cache-fallback';
      })
      .then(function () {
        return caches.open(CACHE_NAME);
      })
      .then(function (cache) {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function () {
        // The new app shell is fully precached. Only now is it safe to
        // consider the install successful. If addAll threw (for example
        // the user went offline in the middle of the update), this flag
        // stays false, the browser discards this worker, and the last
        // known-good cache is never touched.
        installSucceeded = true;
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        // Retire old caches only when the current install fully
        // succeeded. A failed or interrupted install (for example the
        // user going offline during the update window) leaves the flag
        // false, so the last known-good cache survives and the app
        // keeps working offline. As a second safeguard, caches are only
        // purged when the install produced a versioned cache name; a
        // fallback-name install never deletes anything, because its
        // contents may be stale relative to the previous versioned
        // cache. Deletion is also scoped to caches this app owns.
        const versionedInstall = CACHE_NAME.startsWith('darya-cache-v');
        if (!installSucceeded || !versionedInstall) {
          return Promise.resolve();
        }
        return Promise.all(
          keys
            .filter(
              (key) => key !== CACHE_NAME && key.startsWith('darya-cache-')
            )
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests; anything else (e.g. a
  // cross-origin request some future addition might make) falls through
  // to the network exactly as it normally would.
  if (
    request.method !== 'GET' ||
    new URL(request.url).origin !== self.location.origin
  ) {
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
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Only return the app shell for HTML navigations. Returning
          // index.html for a failed CSS/JS/font fetch would cause the
          // browser to silently accept invalid content and break the
          // page silently.
          var accept = request.headers.get('Accept');
          if (accept && accept.indexOf('text/html') !== -1) {
            return caches.match('./index.html');
          }
          // For non-HTML subresources (CSS, JS, fonts, images), return
          // a minimal error response matching the request's content type
          // so the browser degrades gracefully.
          const destination = request.destination || '';
          const mimeTypes = {
            style: 'text/css;charset=utf-8',
            script: 'application/javascript;charset=utf-8',
            font: 'font/woff2',
            image: 'image/png'
          };
          return new Response('', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
              'Content-Type':
                mimeTypes[destination] || 'text/plain;charset=utf-8'
            }
          });
        });
    })
  );
});
