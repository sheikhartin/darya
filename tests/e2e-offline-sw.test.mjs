/**
 * End-to-end test for the service worker's offline guarantee in a real
 * headless Chrome.
 *
 * The app registers `sw.js` on window load; the worker precaches the
 * whole app shell (HTML, CSS, JS, data, manifest) into a versioned
 * cache named after package.json's version, and the immutable static
 * assets (fonts, icons, audio) into a separate long-lived cache. After
 * that first load the app must work with the network fully gone: this
 * test proves it by
 *
 *   1. Loading the app once online and waiting until the service worker
 *      has finished installing and precaching.
 *   2. Reading the worker's real caches from the page and asserting the
 *      shell cache holds every URL listed in sw.js, plus the static
 *      cache holds the fonts and audio.
 *   3. Killing the HTTP server completely (all connections closed, port
 *      released) and reloading the page: the worker must serve the app
 *      from cache, the picker must render, and a fetch of a precached
 *      script must still return 200.
 *
 * The test skips itself (rather than failing) when no Chrome/Chromium
 * binary is available, so the suite stays green on machines without one.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

/**
 * Serves the static project on an ephemeral port so the test never
 * collides with a running dev server.
 * @returns {Promise<import('node:http').Server>}
 */
function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') {
          pathname = '/index.html';
        }
        const filePath = path.join(PROJECT_ROOT, pathname);
        const relative = path.relative(PROJECT_ROOT, filePath);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
          res.writeHead(403);
          res.end('forbidden');
          return;
        }
        const body = await readFile(filePath);
        res.writeHead(200, {
          'Content-Type':
            MIME_TYPES[path.extname(filePath)] || 'application/octet-stream'
        });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/**
 * Locates a Chrome/Chromium binary without downloading anything.
 * @returns {string|null}
 */
function findChromeBinary() {
  if (process.env.DARYA_CHROME) {
    return process.env.DARYA_CHROME;
  }
  const names = [
    'google-chrome-stable',
    'google-chrome',
    'chromium',
    'chromium-browser'
  ];
  const pathDirs = (process.env.PATH || '')
    .split(path.delimiter)
    .filter(Boolean);
  for (const name of names) {
    for (const dir of pathDirs) {
      const candidate = path.join(dir, name);
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }
  const fallbacks = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/snap/bin/chromium'
  ];
  for (const candidate of fallbacks) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Parses the URLs the service worker precaches from sw.js itself, so
 * the test asserts against the worker's real list and fails loudly if
 * sw.js and the cache ever drift apart. The worker uses relative paths
 * ("./js/engine/responder.js"); the in-browser Cache API keys them as
 * absolute URLs, so the parsed list is compared after stripping origins.
 * @returns {{ shell: string[], static: string[] }}
 */
function parsePrecacheLists() {
  const source = readFileSync(path.join(PROJECT_ROOT, 'sw.js'), 'utf8');
  const shell = extractQuotedStrings(source, 'PRECACHE_URLS');
  const statics = extractQuotedStrings(source, 'STATIC_URLS');
  return { shell, static: statics };
}

/**
 * Reads the app version from package.json so the test asserts against
 * the exact versioned cache name the worker derives at install time
 * ("darya-cache-v" + pkg.version).
 * @returns {string}
 */
function readPackageVersion() {
  const pkg = JSON.parse(
    readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
  );
  return String(pkg.version);
}

/**
 * Extracts the string literals of an array declaration from sw.js.
 * @param {string} source - sw.js source
 * @param {string} arrayName - the const name (PRECACHE_URLS / STATIC_URLS)
 * @returns {string[]}
 */
function extractQuotedStrings(source, arrayName) {
  const re = new RegExp(
    'const ' + arrayName + ' = \\[([\\s\\S]*?)\\n\\];',
    'm'
  );
  const match = source.match(re);
  if (!match) {
    return [];
  }
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

test(
  'service worker precaches the full shell and static assets, and the app loads fully offline',
  { timeout: 90000 },
  async (t) => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        return t.skip(
          'no Chrome/Chromium binary found; skipping the offline-sw e2e test'
        );
      }
      try {
        browser = await chromium.launch({
          executablePath: chromePath,
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-gpu',
            '--mute-audio',
            '--disable-dev-shm-usage',
            '--autoplay-policy=no-user-gesture-required',
            '--force-prefers-reduced-motion'
          ]
        });
      } catch (err) {
        return t.skip('headless Chrome failed to launch: ' + err.message);
      }

      const page = await browser.newPage();
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
        }
      });

      const origin = `http://127.0.0.1:${server.address().port}`;

      // 1. Load the app once, online, and wait for the worker install.
      await page.goto(`${origin}/`, { waitUntil: 'load' });
      // The worker activates asynchronously after install; ready resolves
      // only once an active worker is controlling the page.
      await page.evaluate(() => navigator.serviceWorker.ready);

      // 2. Read the worker's real caches from inside the page and wait
      //    until the versioned shell cache holds everything the worker
      //    was asked to precache (addAll is atomic but asynchronous).
      const { shell, static: statics } = parsePrecacheLists();
      assert.ok(
        shell.length > 50 && statics.length >= 10,
        `sw.js must list a full shell and static set (shell=${shell.length}, static=${statics.length})`
      );

      const version = readPackageVersion();
      const shellCacheName = `darya-cache-v${version}`;
      const staticCacheName = 'darya-static-v1';

      // The worker's cache keys are absolute URLs; sw.js lists relative
      // paths ("./js/..."). Normalize both sides to URL pathnames so
      // the comparison is exact: "./" -> "/", "./index.html" ->
      // "/index.html".
      const expectedShell = shell.map((p) =>
        p === './' ? '/' : '/' + p.slice(2)
      );
      const cachedPaths = await page.evaluate(
        async ({ cacheName, expected }) => {
          // Poll until the cache holds every expected entry: addAll fills
          // the cache after install, and a slow disk can lag the evaluate.
          const deadline = Date.now() + 20000;
          while (Date.now() < deadline) {
            const cache = await caches.open(cacheName);
            const pathnames = (await cache.keys()).map(
              (r) => new URL(r.url).pathname
            );
            const missing = expected.filter((p) => !pathnames.includes(p));
            if (missing.length === 0) {
              return { pathnames, missing: [] };
            }
            await new Promise((resolve) => setTimeout(resolve, 250));
          }
          return { pathnames: [], missing: expected };
        },
        { cacheName: shellCacheName, expected: expectedShell }
      );

      assert.deepEqual(
        cachedPaths.missing,
        [],
        `the versioned shell cache must hold every sw.js PRECACHE_URLS entry (${shellCacheName})`
      );
      assert.ok(
        cachedPaths.pathnames.length >= shell.length,
        `shell cache holds ${cachedPaths.pathnames.length} entries, expected >= ${shell.length}`
      );

      // The static cache (fonts, icons, audio) must be populated too.
      const expectedStatics = statics.map((p) => '/' + p.slice(2));
      const staticCached = await page.evaluate(async (cacheName) => {
        const cache = await caches.open(cacheName);
        return (await cache.keys()).map((r) => new URL(r.url).pathname);
      }, staticCacheName);
      for (const asset of expectedStatics) {
        assert.ok(
          staticCached.includes(asset),
          `static cache must hold ${asset} (${staticCacheName})`
        );
      }

      // The worker must actually be controlling the page before the
      // server dies, otherwise the offline reload would hit the network
      // and fail instead of proving the cache path.
      const controlled = await page.evaluate(async () => {
        if (navigator.serviceWorker.controller) {
          return true;
        }
        // claim() runs on activate; give it one online reload to attach.
        await navigator.serviceWorker.ready;
        return !!navigator.serviceWorker.controller;
      });
      if (!controlled) {
        await page.reload({ waitUntil: 'load' });
        const nowControlled = await page.evaluate(
          () => !!navigator.serviceWorker.controller
        );
        assert.ok(nowControlled, 'the service worker must control the page');
      }

      // 3. Kill the server entirely and prove the app still works. The
      //    port must be truly unreachable before the reload: otherwise a
      //    stale listener could serve the navigation from the network
      //    and the test would pass for the wrong reason.
      const port = server.address().port;
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      const portOpen = await new Promise((resolve) => {
        const probe = net.connect(port, '127.0.0.1');
        probe.once('connect', () => {
          probe.destroy();
          resolve(true);
        });
        probe.once('error', () => resolve(false));
      });
      assert.equal(portOpen, false, 'the test server port must be closed');

      // A navigation with the server gone can only succeed if the worker
      // serves the app shell from cache.
      await page.reload({ waitUntil: 'load' });
      await page.waitForSelector('#picker-en', { timeout: 15000 });
      assert.ok(
        await page.$('#picker-en'),
        'the language picker still renders after the server is gone'
      );

      // A precached script must still fetch with status 200 from the
      // worker cache, not a network error.
      const fetchResult = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url);
          return { status: res.status, ok: res.ok };
        } catch (err) {
          return { status: 0, ok: false, error: String(err) };
        }
      }, `${origin}/js/engine/responder.js`);
      assert.equal(
        fetchResult.status,
        200,
        `precached script must fetch from cache offline (got ${fetchResult.status})`
      );

      // The whole journey must be free of uncaught errors.
      assert.deepEqual(pageErrors, [], 'no uncaught errors in the browser');
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  }
);
