/**
 * End-to-end test for the Android hardware back button policy in a
 * real headless Chrome.
 *
 * The shell plugin (ShellPlugin.java) hands every back press to the
 * web policy (js/app/backbutton.js), which walks the app's surface
 * stack one press at a time: the menu popover, the new-chat dialog,
 * the breathing overlay, the pending farewell bar (cancel and stay),
 * the active conversation (confirm before ending), the ended
 * conversation (back to the picker), and only on the picker does back
 * leave the app.
 *
 * The Capacitor bridge is faked with an init script that records the
 * back subscription and the exit calls, so the press itself is
 * simulated exactly where the native shell would deliver it.
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
 * Runs in the page before any app script: installs the fake Capacitor
 * bridge with a Shell plugin that records the back subscription and
 * every exitApp call, exactly where the native shell would deliver
 * the hardware press.
 */
const FAKE_NATIVE_BRIDGE = `
  (() => {
    window.__shellProbe = { subscribed: null, exits: 0 };
    window.Capacitor = {
      isNativePlatform: () => true,
      Plugins: {
        Shell: {
          addListener(event, handler) {
            window.__shellProbe.subscribed = event;
            window.__pressBack = handler;
          },
          exitApp() {
            window.__shellProbe.exits += 1;
          }
        }
      }
    };
  })();
`;

test(
  'hardware back unwinds the surface stack and leaves only from the picker',
  { timeout: 90000, skip: !findChromeBinary() },
  async () => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        throw new Error(
          'no Chrome/Chromium binary found; cannot run the backbutton e2e test'
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

      // The policy subscribes at boot.
      await page.waitForFunction(
        () => typeof window.__pressBack === 'function',
        null,
        { timeout: 20000 }
      );
      assert.equal(
        await page.evaluate(() => window.__shellProbe.subscribed),
        'backButton'
      );

      // 1. Back on the picker leaves the app.
      await page.waitForSelector('#picker-en', { timeout: 20000 });
      await page.evaluate(() => window.__pressBack());
      assert.equal(await page.evaluate(() => window.__shellProbe.exits), 1);

      // 2. Back during a conversation asks before ending it.
      await page.click('#picker-en');
      await page.waitForFunction(
        () => {
          const input = document.getElementById('composer-input');
          return input && !input.disabled;
        },
        null,
        { timeout: 20000 }
      );
      await page.evaluate(() => window.__pressBack());
      await page.waitForFunction(
        () => document.getElementById('exit-confirm-bar').hidden === false,
        null,
        { timeout: 10000 }
      );
      assert.equal(await page.evaluate(() => window.__shellProbe.exits), 1);

      // 3. Back again cancels the farewell bar and keeps the chat.
      await page.evaluate(() => window.__pressBack());
      await page.waitForFunction(
        () => document.getElementById('exit-confirm-bar').hidden === true,
        null,
        { timeout: 10000 }
      );
      assert.equal(await page.evaluate(() => window.__shellProbe.exits), 1);

      // 4. Back closes the open menu first.
      await page.click('#menu-trigger');
      await page.waitForFunction(
        () => document.getElementById('menu-popover').hidden === false,
        null,
        { timeout: 10000 }
      );
      await page.evaluate(() => window.__pressBack());
      await page.waitForFunction(
        () => document.getElementById('menu-popover').hidden === true,
        null,
        { timeout: 10000 }
      );
      assert.equal(await page.evaluate(() => window.__shellProbe.exits), 1);

      // 5. Back closes the breathing overlay.
      await page.evaluate(() => window.DaryaOverlays.showBreatheExercise());
      await page.waitForSelector('.breathe-overlay', { timeout: 10000 });
      await page.evaluate(() => window.__pressBack());
      await page.waitForFunction(
        () => document.querySelector('.breathe-overlay') === null,
        null,
        { timeout: 10000 }
      );
      assert.equal(await page.evaluate(() => window.__shellProbe.exits), 1);

      // 6. Back after the conversation ended returns to the picker.
      await page.evaluate(() => {
        window.DaryaUI.state.conversationEnded = true;
      });
      await page.evaluate(() => window.__pressBack());
      await page.waitForFunction(
        () => document.getElementById('picker').hidden === false,
        null,
        { timeout: 10000 }
      );
      assert.equal(await page.evaluate(() => window.__shellProbe.exits), 1);

      // 7. From the picker, back leaves once more.
      await page.evaluate(() => window.__pressBack());
      assert.equal(await page.evaluate(() => window.__shellProbe.exits), 2);

      assert.deepEqual(pageErrors, [], 'no uncaught errors in the browser');
    } finally {
      if (browser) {
        await browser.close();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  }
);
