/**
 * End-to-end test for the app's behavior inside the native Android
 * shell, simulated in a real headless Chrome.
 *
 * The Android app serves this same web bundle in a Capacitor WebView,
 * where two browser assumptions break and must be compensated for by
 * the web layer (js/app/native.js):
 *
 *   1. A service worker registered by an earlier build keeps serving
 *      the previous app shell from Cache Storage after an app update,
 *      freezing the app on the old UI until the app data is cleared.
 *      In the shell the worker must never be registered, and leftover
 *      registrations and app-owned caches must be retired at boot.
 *
 *   2. The WebView has no download machinery, so the browser-style
 *      blob-anchor export is a silent no-op there. The export button
 *      must call the injected Capacitor Export plugin instead.
 *
 * The Capacitor bridge is faked with an init script that runs before
 * the app scripts: it provides window.Capacitor with the Export
 * plugin, a service-worker container whose register() would hit the
 * real network (and records that it was touched), a leftover fake
 * registration from an "earlier build", and fake Cache Storage holding
 * stale app caches plus a foreign cache that must survive.
 *
 * The test fails explicitly when no Chrome/Chromium binary is
 * available so the suite skips cleanly on machines without one.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
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
 * Runs in the page before any app script. Installs the fake Capacitor
 * bridge, the fake service-worker container, and fake Cache Storage,
 * with recorders on window.__nativeProbe for the assertions.
 */
const FAKE_NATIVE_BRIDGE = `
  (() => {
    const probe = {
      registerCalls: 0,
      unregistered: 0,
      deletedCaches: [],
      exportCalls: [],
      downloadAttributeClicks: 0
    };
    window.__nativeProbe = probe;

    // The injected Capacitor bridge, as MainActivity provides natively.
    window.Capacitor = {
      isNativePlatform: () => true,
      Plugins: {
        Export: {
          saveTranscript(options) {
            probe.exportCalls.push(options);
            return Promise.resolve({ uri: 'content://stub', location: 'downloads' });
          }
        }
      }
    };

    // A leftover registration from an "earlier build" of the app.
    navigator.serviceWorker.getRegistrations = () =>
      Promise.resolve([
        { unregister: () => { probe.unregistered += 1; return Promise.resolve(true); } }
      ]);
    navigator.serviceWorker.register = (...args) => {
      probe.registerCalls += 1;
      return Promise.reject(new Error('register must not be called in the shell'));
    };

    // Fake Cache Storage with stale app caches plus a foreign cache.
    const stores = new Map([
      ['darya-cache-v1.9.1', {}],
      ['darya-static-v3', {}],
      ['someone-elses-cache', {}]
    ]);
    const fakeCaches = {
      keys: () => Promise.resolve([...stores.keys()]),
      delete: (name) => { probe.deletedCaches.push(name); stores.delete(name); return Promise.resolve(true); }
    };
    Object.defineProperty(window, 'caches', {
      configurable: true,
      value: fakeCaches
    });

    // Detect a blob-anchor download attempt: the browser export path
    // must not run in the shell.
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) {
        probe.downloadAttributeClicks += 1;
      }
      return originalClick.call(this);
    };
  })();
`;

test(
  'in the native shell the app skips the service worker, retires stale caches, and exports through the plugin',
  { timeout: 90000, skip: !findChromeBinary() },
  async () => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        throw new Error(
          'no Chrome/Chromium binary found; cannot run the native-shell e2e test'
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
            '--force-prefers-reduced-motion'
          ]
        });
      } catch (err) {
        throw new Error('headless Chrome failed to launch: ' + err.message);
      }

      const page = await browser.newPage();
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));

      await page.addInitScript(FAKE_NATIVE_BRIDGE);

      const origin = `http://127.0.0.1:${server.address().port}`;
      await page.goto(`${origin}/`, { waitUntil: 'load' });

      // The picker is the landing screen; boot has happened by now, so
      // the retirement must already be observable.
      await page.waitForSelector('#picker-en', { timeout: 20000 });

      // The worker must never be registered in the shell...
      const registerCalls = await page.evaluate(
        () => window.__nativeProbe.registerCalls
      );
      assert.equal(
        registerCalls,
        0,
        'the service worker must not be registered in the native shell'
      );

      // ...and the leftover registration from the earlier build must be
      // retired together with the stale app caches (the foreign cache
      // survives).
      const retired = await page.waitForFunction(
        () =>
          window.__nativeProbe.unregistered >= 1 &&
          window.__nativeProbe.deletedCaches.length >= 2,
        null,
        { timeout: 20000 }
      );
      assert.ok(
        retired,
        'stale worker registrations and caches must be retired'
      );
      const probeState = await page.evaluate(() => ({
        unregistered: window.__nativeProbe.unregistered,
        deletedCaches: [...window.__nativeProbe.deletedCaches].sort()
      }));
      assert.equal(probeState.unregistered, 1);
      assert.deepEqual(probeState.deletedCaches, [
        'darya-cache-v1.9.1',
        'darya-static-v3'
      ]);

      // Start a conversation so the transcript has content, then use
      // the export menu item. The greeting has finished once the
      // composer enables (the established greeting-complete signal).
      await page.click('#picker-en');
      await page.waitForFunction(
        () => {
          const input = document.getElementById('composer-input');
          return input && !input.disabled;
        },
        null,
        { timeout: 20000 }
      );
      await page.waitForSelector('.bubble-row--bot', { timeout: 20000 });
      await page.click('#menu-trigger');
      await page.click('#menu-export-txt');
      await page.waitForFunction(
        () => window.__nativeProbe.exportCalls.length >= 1,
        null,
        { timeout: 20000 }
      );

      const exportCalls = await page.evaluate(() => [
        ...window.__nativeProbe.exportCalls
      ]);
      assert.equal(exportCalls.length, 1);
      assert.match(exportCalls[0].filename, /^darya-chat-en-/u);
      assert.ok(
        typeof exportCalls[0].content === 'string' &&
          exportCalls[0].content.length > 0,
        'the transcript content must be handed to the plugin'
      );

      // The browser blob-anchor path must not have run...
      const downloadClicks = await page.evaluate(
        () => window.__nativeProbe.downloadAttributeClicks
      );
      assert.equal(downloadClicks, 0);

      // ...and the saved-notification overlay must be visible.
      await page.waitForSelector('.notification-overlay', { timeout: 20000 });

      assert.deepEqual(pageErrors, [], 'no uncaught errors in the browser');
    } finally {
      if (browser) {
        await browser.close();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  }
);
