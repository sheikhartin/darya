/**
 * Service worker for Darya. Precaches the entire app shell on install so
 * the app works fully offline after the first successful load; no
 * network is needed for any subsequent visit, including the fonts,
 * which are self-hosted specifically so this can be true offline
 * caching rather than depending on a CDN staying reachable.
 *
 * Two-tier cache strategy:
 *
 *   - The app shell (HTML, CSS, JS, data, manifest) lives in a
 *     versioned cache named after the package.json version. Shipping an
 *     update bumps that version, so the install re-fetches exactly the
 *     code that changed and old shell caches are cleared on activate.
 *
 *   - Immutable static assets (fonts, icons, ambient audio) live in a
 *     separate, long-lived cache that is filled on the FIRST install
 *     only. Version bumps never re-download them: fonts and audio are
 *     content-stable across releases, so keeping them in the same
 *     versioned cache as the code would waste ~2MB of bandwidth on
 *     every update for no benefit.
 *
 * Cache-first strategy: once cached, an asset is served from the cache
 * without touching the network at all. The runtime fetch handler also
 * opportunistically caches any same-origin GET that was not precached,
 * so a second visit to any URL this app ever requests is offline-ready.
 *
 * Refresh note: a browser re-installs this worker only when its bytes
 * change, so any release that modifies precached shell content must
 * also change something in this file (a comment note like this one is
 * enough); the install then re-runs and re-fetches the changed shell
 * into the versioned cache. Shell refresh: 1.9.0 (conversational
 * register layer, the combat-sports shelf, and knowledge follow-ups).
 */

'use strict';

let CACHE_NAME = 'darya-cache-fallback';

// Long-lived cache for immutable assets (fonts, icons, audio). The
// name is reused across app versions and bumped only when supposedly
// immutable content actually changes (icon artwork, fonts); the
// activate handler retires the predecessor so caches never stack.
const STATIC_CACHE_NAME = 'darya-static-v3';

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
  './js/app/index.js',
  './js/app/composer.js',
  './js/app/language.js',
  './js/app/conversation.js',
  './js/app/menu.js',
  './js/app/sound.js',
  './js/app/update.js',
  './js/engine/index.js',
  './js/engine/utils-constants.js',
  './js/engine/utils-text.js',
  './js/engine/utils.js',
  './js/engine/factual-math.js',
  './js/engine/factual-datetime.js',
  './js/engine/factual-fun-facts.js',
  './js/engine/factual.js',
  './js/engine/recap.js',
  './js/engine/emotion-analyzer.js',
  './js/engine/context-window.js',
  './js/engine/personality-engine.js',
  './js/engine/response-scorer.js',
  './js/engine/responder.js',
  './js/engine/responder-public.js',
  './js/engine/responder-detect.js',
  './js/engine/responder-safety.js',
  './js/engine/responder-emotion.js',
  './js/engine/responder-cultural.js',
  './js/engine/responder-phase.js',
  './js/engine/responder-rules.js',
  './js/engine/responder-entity.js',
  './js/engine/responder-overrides.js',
  './js/engine/responder-recall.js',
  './js/engine/responder-knowledge-followups.js',
  './js/engine/responder-lifefacts.js',
  './js/engine/responder-profile.js',
  './js/engine/responder-promise.js',
  './js/engine/responder-exercises.js',
  './js/engine/responder-mood.js',
  './js/ui/core.js',
  './js/ui/glint.js',
  './js/ui/ambient-visuals.js',
  './js/ui/ambient-sound-data.js',
  './js/ui/ambient-sound-helpers.js',
  './js/ui/ambient-sound-playback.js',
  './js/ui/ambient-sound.js',
  './js/ui/export.js',
  './js/ui/overlays-breathe.js',
  './js/ui/overlays-confirm.js',
  './js/ui/overlays-notify.js',
  './js/ui/overlays.js',
  './js/ui/logger.js',
  './js/data/knowledge-reflections.js',
  './js/data/knowledge-facts-science.js',
  './js/data/knowledge-facts-tech.js',
  './js/data/knowledge-facts-culture.js',
  './js/data/knowledge-facts-life.js',
  './js/data/knowledge-facts-education.js',
  './js/data/knowledge-facts-entertainment.js',
  './js/data/knowledge-facts-project.js',
  './js/data/knowledge-facts-domains.js',
  './js/data/knowledge-facts-daily.js',
  './js/data/knowledge-facts-career.js',
  './js/data/knowledge-facts-work-life.js',
  './js/data/knowledge-facts-skills.js',
  './js/data/knowledge-facts-software-security.js',
  './js/data/knowledge-facts-beliefs-media.js',
  './js/data/knowledge-facts-languages.js',
  './js/data/knowledge-facts-language-compare.js',
  './js/data/knowledge-facts-arts.js',
  './js/data/knowledge-facts-platforms.js',
  './js/data/knowledge-facts-companies.js',
  './js/data/knowledge-facts-techstacks.js',
  './js/data/knowledge-facts-generations.js',
  './js/data/knowledge-facts-foods.js',
  './js/data/knowledge-facts-supplements.js',
  './js/data/knowledge-facts-ides.js',
  './js/data/knowledge-facts-fonts.js',
  './js/data/knowledge-facts-influencers.js',
  './js/data/knowledge-facts-sport-events.js',
  './js/data/knowledge-facts-investing.js',
  './js/data/knowledge-facts-sexuality.js',
  './js/data/knowledge-facts-universities.js',
  './js/data/knowledge-facts-fastfood.js',
  './js/data/knowledge-facts-ai-jobs.js',
  './js/data/knowledge-facts-language-learning.js',
  './js/data/knowledge-facts-mindsets.js',
  './js/data/knowledge-facts-world.js',
  './js/data/knowledge-facts-history-conflict.js',
  './js/data/knowledge-facts-society.js',
  './js/data/knowledge-facts-travel.js',
  './js/data/knowledge-facts-sports.js',
  './js/data/knowledge-facts-fighters.js',
  './js/data/knowledge-facts-fighters-legends.js',
  './js/data/knowledge-facts-people.js',
  './js/data/knowledge-fun-facts.js',
  './js/data/knowledge-lists.js',
  './js/data/media-pool.js',
  './js/data/knowledge-base.js',
  './js/languages/index.js',
  './js/text/halfspace-data.js',
  './js/text/halfspace.js',
  './js/text/conversational.js',
  './js/text/entity-extractor-data.js',
  './js/text/entity-extractor.js',
  './js/languages/fa.js',
  './js/languages/en.js',
  './js/languages/fa-responses-base.js',
  './js/languages/fa-responses-topics.js',
  './js/languages/fa-responses-rules.js',
  './js/languages/fa-responses-contexts.js',
  './js/languages/fa-responses-features.js',
  './js/languages/fa-rules.js',
  './js/languages/fa-vocabulary.js',
  './js/languages/fa-maps.js',
  './js/languages/fa-culture.js',
  './js/languages/fa-society.js',
  './js/languages/en-responses-base.js',
  './js/languages/en-responses-topics.js',
  './js/languages/en-responses-rules.js',
  './js/languages/en-responses-contexts.js',
  './js/languages/en-responses-features.js',
  './js/languages/en-rules.js',
  './js/languages/en-vocabulary.js',
  './js/languages/en-maps.js',
  './js/languages/en-culture.js',
  './js/languages/en-society.js',
  './js/engine/time-utils.js',
  './assets/favicon.ico',
  './assets/icons/favicon-16x16.png',
  './assets/icons/favicon-32x32.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/android-chrome-192x192.png',
  './assets/icons/android-chrome-512x512.png'
];

// Immutable assets that never change between app versions: fonts (the
// self-hosted typefaces), and the ambient sound files (both themes,
// together about 2MB, a deliberate trade for true offline parity with
// the bundled APK). Icons are also immutable but tiny; they stay here
// so the shell list only carries code that can actually change.
const STATIC_URLS = [
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
  './assets/audio/manifest.json',
  './assets/audio/ocean/stormy-sea-waves-loop.mp3',
  './assets/audio/beach/sea-waves-with-birds-loop.mp3'
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
        return Promise.all([
          cache.addAll(PRECACHE_URLS),
          // Fill the static-assets cache on the first install only:
          // re-adding ~2MB of fonts and audio on every version bump
          // would waste bandwidth for content that never changes.
          caches.has(STATIC_CACHE_NAME).then(function (exists) {
            if (exists) {
              return Promise.resolve();
            }
            return caches.open(STATIC_CACHE_NAME).then(function (staticCache) {
              return staticCache.addAll(STATIC_URLS);
            });
          })
        ]);
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
            .filter((key) => {
              // Purge old versioned app-shell caches...
              if (key !== CACHE_NAME && key.startsWith('darya-cache-')) {
                return true;
              }
              // ...and old static-assets caches (kept across versions,
              // but a future bump of STATIC_CACHE_NAME must still retire
              // its predecessor instead of stacking caches forever).
              return (
                key !== STATIC_CACHE_NAME && key.startsWith('darya-static-')
              );
            })
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
