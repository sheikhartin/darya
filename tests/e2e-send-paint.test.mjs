/**
 * End-to-end test for send responsiveness in a real headless Chrome.
 *
 * The human-like delay before Darya's reply is intentional; lag when
 * sending the reader's own message is not. sendMessage used to run the
 * user bubble insert, the composer clear, and the whole engine
 * respond() computation in one synchronous task, so the reader's
 * message and the typing indicator painted only after the engine
 * finished (tens of milliseconds on desktop for knowledge questions,
 * several times that on mid-range phones). sendMessage now paints
 * first: it shows the typing indicator, yields to the browser until
 * the frame with the reader's bubble is painted, and only then runs
 * engine work (js/app/conversation.js, yieldToPaint).
 *
 * The test makes any pre-paint engine work impossible to miss by
 * wrapping engine.respond in a 400ms synchronous busy-wait, then
 * measures when the reader's bubble and the typing indicator actually
 * paint after pressing send. Pre-fix the measurement lands at 400ms
 * or worse; post-fix it lands within a couple of frames. The reply
 * must still arrive afterwards.
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

/** Artificial synchronous engine cost that any pre-paint work pays. */
const ENGINE_STALL_MS = 400;

/** Paint budget well under the stall, generous toward slow machines. */
const PAINT_BUDGET_MS = 250;

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
  'sending paints the reader message immediately even while the engine is slow',
  { timeout: 90000, skip: !findChromeBinary() },
  async () => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        throw new Error(
          'no Chrome/Chromium binary found; cannot run the send-paint e2e test'
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

      const origin = `http://127.0.0.1:${server.address().port}`;
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

      // Punish any engine work that runs before the reader's message
      // paints: every respond() call blocks the main thread for 400ms.
      await page.evaluate((stallMs) => {
        const engine = window.DaryaUI.state.engine;
        const original = engine.respond.bind(engine);
        engine.respond = (text) => {
          const until = performance.now() + stallMs;
          while (performance.now() < until) {
            /* deliberate synchronous stall */
          }
          return original(text);
        };
        window.__respondCalls = 0;
        const counting = engine.respond.bind(engine);
        engine.respond = (text) => {
          window.__respondCalls += 1;
          return counting(text);
        };
      }, ENGINE_STALL_MS);

      // Press send and measure when the reader's bubble and the typing
      // indicator first paint (the frame after they exist in the DOM).
      await page.fill(
        '#composer-input',
        'what do you know about the deep sea?'
      );
      const elapsed = await page.evaluate(() => {
        return new Promise((resolve) => {
          const startedAt = performance.now();
          const composerForm = document.getElementById('composer');
          composerForm.requestSubmit();
          const check = () => {
            const userBubble = document.querySelector('.bubble-row--user');
            const typingVisible =
              document.getElementById('typing-row').hidden === false;
            if (userBubble && typingVisible) {
              resolve(performance.now() - startedAt);
              return;
            }
            requestAnimationFrame(check);
          };
          requestAnimationFrame(check);
        });
      });

      assert.ok(
        elapsed < PAINT_BUDGET_MS,
        `the reader's message and the typing indicator painted in ${elapsed.toFixed(
          0
        )}ms despite a ${ENGINE_STALL_MS}ms synchronous engine stall ` +
          `(budget ${PAINT_BUDGET_MS}ms; the engine must run after the paint, not before it)`
      );
      assert.equal(await page.evaluate(() => window.__respondCalls), 1);

      // The reply must still arrive: the stall hides inside Darya's
      // intentional thinking window, and the typing indicator clears.
      await page.waitForFunction(
        () =>
          document.getElementById('typing-row').hidden === true &&
          document.querySelectorAll('.bubble-row--bot').length >= 2,
        null,
        { timeout: 25000 }
      );
      const lastBubble = await page.evaluate(() => {
        const bubbles = document.querySelectorAll('.bubble-row--bot');
        return bubbles[bubbles.length - 1].textContent;
      });
      assert.ok(
        lastBubble.length > 0,
        'the stalled engine reply was still delivered'
      );

      assert.deepEqual(pageErrors, [], 'no uncaught errors in the browser');
    } finally {
      if (browser) {
        await browser.close();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  }
);
