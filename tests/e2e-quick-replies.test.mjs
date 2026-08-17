/**
 * End-to-end test for quick-reply chips (guided exercises and mood
 * tracker) in a real headless Chrome.
 *
 * The engine attaches `lastTurnQuickReplies` to certain replies (the
 * mood scale 1..10, exercise yes/no). The app renders them as tappable
 * buttons under the bot message, and tapping one re-sends the label
 * through the normal message path so the engine's state machines see a
 * real user turn. This test drives the real UI:
 *
 *   1. Start an English conversation and ask for a mood check.
 *   2. The scale chips 1..10 appear under Darya's reply.
 *   3. Tapping the "7" chip records the mood, produces a reflection,
 *      and dismisses the chips.
 *
 * The test fails explicitly when no Chrome/Chromium
 * binary is available, so the suite stays green on machines without one.
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

test(
  'quick-reply chips render and route a chip tap back through the engine',
  { timeout: 90000 },
  async (t) => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        throw new Error(
          'no Chrome/Chromium binary found; cannot run the quick-replies e2e test'
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
        throw new Error('headless Chrome failed to launch: ' + err.message);
      }

      const page = await browser.newPage();
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
        }
      });

      // 1. Load the app and start an English conversation.
      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'load'
      });
      await page.waitForSelector('#picker-en');
      await page.click('#picker-en');
      await page.waitForFunction(
        () => {
          const input = document.getElementById('composer-input');
          return input && !input.disabled;
        },
        null,
        { timeout: 15000 }
      );

      // 2. Ask for a mood check and wait for the reply to land.
      await page.fill('#composer-input', 'mood check');
      await page.keyboard.press('Enter');

      // The scale chips (1..10) must appear under Darya's reply.
      await page.waitForSelector('.quick-replies', { timeout: 15000 });
      const chipLabels = await page.evaluate(() =>
        [...document.querySelectorAll('.quick-reply')].map(
          (chip) => chip.textContent
        )
      );
      assert.ok(
        chipLabels.includes('1') && chipLabels.includes('10'),
        `the mood scale chips render (got ${chipLabels.join(', ')})`
      );

      // 3. Tap the "7" chip: it routes through sendMessage as a user
      //    turn, Darya reflects, and the chips are dismissed.
      await page.click('.quick-reply:has-text("7")');
      await page.waitForFunction(
        () => {
          const rows = document.querySelectorAll('.bubble-row--user');
          const last = rows[rows.length - 1];
          return !!last && last.textContent.includes('7');
        },
        null,
        { timeout: 10000 }
      );
      // Darya's reflection lands and the chip row is gone. The typing
      // indicator also carries the .bubble--bot class while it is in the
      // DOM, so it is excluded explicitly.
      await page.waitForFunction(
        () => {
          const botBubbles = [...document.querySelectorAll('.bubble--bot')];
          const real = botBubbles.filter(
            (b) => !b.classList.contains('bubble--typing')
          );
          const last = real[real.length - 1];
          const hasReflection = !!last && last.textContent.trim().length > 0;
          const chipsGone = !document.querySelector('.quick-replies');
          return hasReflection && chipsGone;
        },
        null,
        { timeout: 15000 }
      );

      // 4. The whole journey must be free of uncaught errors.
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

test(
  'exercise chips advance the guided breathing flow in a real browser',
  { timeout: 90000 },
  async (t) => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        throw new Error(
          'no Chrome/Chromium binary found; cannot run the exercise e2e test'
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
        throw new Error('headless Chrome failed to launch: ' + err.message);
      }

      const page = await browser.newPage();
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
        }
      });

      // 1. Load the app and start an English conversation.
      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'load'
      });
      await page.waitForSelector('#picker-en');
      await page.click('#picker-en');
      await page.waitForFunction(
        () => {
          const input = document.getElementById('composer-input');
          return input && !input.disabled;
        },
        null,
        { timeout: 15000 }
      );

      // 2. Request the breathing exercise.
      await page.fill('#composer-input', 'breathing exercise');
      await page.keyboard.press('Enter');
      await page.waitForSelector('.quick-replies', { timeout: 15000 });
      const firstChips = await page.evaluate(() =>
        [...document.querySelectorAll('.quick-reply')].map(
          (chip) => chip.textContent
        )
      );
      assert.ok(
        firstChips.includes('Ok') && firstChips.includes('Stop'),
        `exercise yes/no chips render (got ${firstChips.join(', ')})`
      );

      // 3. Tap Ok once: a step instruction lands and chips persist. The
      //    typing indicator also carries the .bubble--bot class while it
      //    is in the DOM, so it is excluded explicitly.
      await page.click('.quick-reply:has-text("Ok")');
      await page.waitForFunction(
        () => {
          const botBubbles = [...document.querySelectorAll('.bubble--bot')];
          const real = botBubbles.filter(
            (b) => !b.classList.contains('bubble--typing')
          );
          const last = real[real.length - 1];
          return !!last && /breathe|shoulders|sit/i.test(last.textContent);
        },
        null,
        { timeout: 15000 }
      );
      assert.ok(
        await page.$('.quick-replies'),
        'chips persist between exercise steps'
      );

      // 4. Tap Stop: the exercise releases and chips disappear.
      await page.click('.quick-reply:has-text("Stop")');
      await page.waitForFunction(
        () => !document.querySelector('.quick-replies'),
        null,
        { timeout: 15000 }
      );

      // 5. No uncaught errors.
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
