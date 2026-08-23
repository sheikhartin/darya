/**
 * End-to-end test for the quiet chat scrollbar in a real headless
 * Chrome.
 *
 * The chat scrollbar is hidden entirely on touch devices and invisible
 * at rest on pointer devices, appearing only while the reader is
 * actually scrolling (the .chat--scrolling modifier from
 * js/app/scrollbar.js) and hiding again after a short idle. The app's
 * own autoscroll while following the live edge must never reveal it.
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
 * Loads the app, starts an English chat, and grows a transcript long
 * enough to overflow the chat viewport, so the scrollbar is real.
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function growOverflowingChat(page, origin) {
  await page.goto(`${origin}/`, { waitUntil: 'load' });
  await page.waitForSelector('#picker-en', { timeout: 20000 });
  await page.click('#picker-en');
  await page.waitForFunction(
    () => {
      const input = document.getElementById('composer-input');
      return input && !input.disabled;
    },
    null,
    { timeout: 20000 }
  );
  await page.evaluate(() => {
    for (let i = 0; i < 36; i += 1) {
      window.DaryaUI.utils.appendMessage(
        'bot',
        `Scroll test message ${i + 1}: enough text to wrap onto another line.`
      );
    }
  });
  await page.waitForFunction(
    () => {
      const chat = document.getElementById('chat');
      return chat && chat.scrollHeight > chat.clientHeight;
    },
    null,
    { timeout: 20000 }
  );
}

test(
  'the chat scrollbar is quiet: hidden on touch, revealed only by reader scrolling on pointer devices',
  { timeout: 90000, skip: !findChromeBinary() },
  async () => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        throw new Error(
          'no Chrome/Chromium binary found; cannot run the scrollbar e2e test'
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

      const origin = `http://127.0.0.1:${server.address().port}`;

      // Pointer-device behavior: the bar occupies no visual footprint
      // at rest, appears on reader wheel input, and hides again.
      const desktopPage = await browser.newPage({
        viewport: { width: 390, height: 700 }
      });
      await growOverflowingChat(desktopPage, origin);

      const restState = await desktopPage.evaluate(() => {
        const chat = document.getElementById('chat');
        return {
          scrollingClass: chat.classList.contains('chat--scrolling'),
          scrollbarWidth: getComputedStyle(chat).scrollbarWidth,
          scrollbarColor: getComputedStyle(chat).scrollbarColor
        };
      });
      assert.equal(restState.scrollingClass, false, 'quiet after autoscroll');
      assert.match(
        restState.scrollbarWidth,
        /^(thin|auto)$/u,
        'pointer devices keep a (thin) scrollbar'
      );
      assert.ok(
        restState.scrollbarColor.includes('rgba(0, 0, 0, 0)'),
        `the resting thumb color is transparent (got ${restState.scrollbarColor})`
      );

      // Reader wheel input over the chat reveals the bar...
      const chatBox = await desktopPage.locator('#chat').boundingBox();
      await desktopPage.mouse.move(
        chatBox.x + chatBox.width / 2,
        chatBox.y + chatBox.height / 2
      );
      await desktopPage.mouse.wheel(0, -60);
      await desktopPage.waitForFunction(
        () =>
          document.getElementById('chat').classList.contains('chat--scrolling'),
        null,
        { timeout: 10000 }
      );
      const whileScrolling = await desktopPage.evaluate(
        () => getComputedStyle(document.getElementById('chat')).scrollbarColor
      );
      assert.ok(
        !whileScrolling.includes('rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)'),
        `the scrolling thumb color is visible (got ${whileScrolling})`
      );

      // ...and it hides again after the input stops.
      await desktopPage.waitForFunction(
        () =>
          !document
            .getElementById('chat')
            .classList.contains('chat--scrolling'),
        null,
        { timeout: 10000 }
      );

      // Touch-device behavior: the scrollbar is fully hidden.
      const touchContext = await browser.newContext({
        viewport: { width: 390, height: 700 },
        isMobile: true,
        hasTouch: true
      });
      const touchPage = await touchContext.newPage();
      await growOverflowingChat(touchPage, origin);
      const touchState = await touchPage.evaluate(() => {
        const chat = document.getElementById('chat');
        return {
          coarsePointer: window.matchMedia('(pointer: coarse)').matches,
          scrollbarWidth: getComputedStyle(chat).scrollbarWidth
        };
      });
      assert.equal(
        touchState.coarsePointer,
        true,
        'mobile emulation is active'
      );
      assert.equal(
        touchState.scrollbarWidth,
        'none',
        'touch devices hide the scrollbar entirely'
      );
      await touchContext.close();
      await desktopPage.close();
    } finally {
      if (browser) {
        await browser.close();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  }
);
