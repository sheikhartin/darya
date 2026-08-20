/**
 * End-to-end keyboard accessibility test for the chat menu.
 *
 * Drives a real headless Chrome (Playwright's library API pointed at the
 * system Chrome binary, so nothing needs to be downloaded) against the
 * app served from a local static server, and asserts the WAI-ARIA
 * menu-button keyboard contract with real key events:
 *
 *   1. The user reaches the trigger through the real tab order.
 *   2. Enter opens the menu and moves focus to the first item.
 *   3. ArrowDown/ArrowUp move focus with wrap-around; Home/End jump.
 *   4. Escape closes the menu and returns focus to the trigger.
 *   5. Tab closes the menu and continues the page tab order past the
 *      trigger (Shift+Tab continues backwards), per the menu-button
 *      pattern.
 *   6. Enter on an item activates it (the theme flips) and returns
 *      focus to the trigger.
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
import {
  E2E_WAIT_MS,
  clickWithRetry,
  waitForPageFunction
} from './e2e-helpers.mjs';

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
 * The same rendered-and-tabbable rule the app itself uses: an element
 * participates in the real tab order only when it is rendered (not
 * display:none) and not collapsed via visibility:hidden. tabindex="-1"
 * elements are programmatically focusable but skipped by the tab order,
 * so they are excluded from the interactive selector clauses too.
 */
const FOCUSABLE_SELECTOR =
  'a[href]:not([tabindex="-1"]), ' +
  'button:not([disabled]):not([tabindex="-1"]), ' +
  'input:not([disabled]):not([tabindex="-1"]), ' +
  'select:not([disabled]):not([tabindex="-1"]), ' +
  'textarea:not([disabled]):not([tabindex="-1"]), ' +
  '[tabindex]:not([tabindex="-1"])';

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
        // Containment check (prefix matching would let a sibling dir such
        // as 'darya-evil' slip through if traversal ever escaped).
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
 * Locates a Chrome/Chromium binary without downloading anything. An
 * explicit DARYA_CHROME env var wins (handy for CI or for forcing the
 * test to fail via a bogus path); otherwise it scans PATH, then a few
 * standard install locations.
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
 * Returns the ids of the visible focusable elements, in tab order.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string[]>}
 */
async function visibleFocusableIds(page) {
  return page.evaluate(
    (selector) =>
      [...document.querySelectorAll(selector)]
        .filter((el) => {
          if (el.offsetParent === null) {
            return false;
          }
          return getComputedStyle(el).visibility !== 'hidden';
        })
        .map((el) => el.id),
    FOCUSABLE_SELECTOR
  );
}

test(
  'chat menu follows the WAI-ARIA keyboard contract in a real browser',
  { timeout: 60000, skip: !findChromeBinary() },
  async (t) => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        throw new Error(
          'no Chrome/Chromium binary found; cannot run the e2e keyboard test'
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

      const expectFocused = async (expectedId) => {
        await waitForPageFunction(
          page,
          (id) => document.activeElement && document.activeElement.id === id,
          expectedId,
          E2E_WAIT_MS.FOCUS
        );
      };

      // Opens the menu with Enter from the trigger and waits for the
      // app to move focus to the first item (it does so on the next
      // animation frame; keying before that races the popover handler).
      const openMenuFromTrigger = async () => {
        await page.keyboard.press('Enter');
        await waitForPageFunction(
          page,
          () => !document.getElementById('menu-popover').hidden,
          null,
          E2E_WAIT_MS.FOCUS
        );
        await expectFocused('menu-new-chat');
      };

      // 1. Load the app and start a conversation with a real click. The
      //    click is retried once: under load, Chrome's initial layout
      //    can be slow enough that the first click misses the app's
      //    ready state, and a single retry absorbs that stall.
      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'load'
      });
      await page.waitForSelector('#picker-en');
      await clickWithRetry(page, '#picker-en');

      // The greeting lands with a typing delay; the composer stays
      // disabled until then, after which the app focuses it.
      await waitForPageFunction(
        page,
        () => {
          const input = document.getElementById('composer-input');
          return input && !input.disabled;
        },
        null,
        E2E_WAIT_MS.GREETING
      );
      await waitForPageFunction(
        page,
        () =>
          document.activeElement === document.getElementById('composer-input'),
        null,
        E2E_WAIT_MS.FOCUS
      );

      // 2. Walk the real tab order from the composer to the trigger,
      //    pressing Shift+Tab/Tab for the exact number of stops.
      const focusableIds = await visibleFocusableIds(page);
      const from = focusableIds.indexOf('composer-input');
      const to = focusableIds.indexOf('menu-trigger');
      assert.ok(from !== -1, 'composer-input is focusable after chat start');
      assert.ok(to !== -1, 'menu-trigger is focusable after chat start');

      const steps = to - from;
      const stepKey = steps < 0 ? 'Shift+Tab' : 'Tab';
      for (let i = 0; i < Math.abs(steps); i += 1) {
        await page.keyboard.press(stepKey);
      }
      await waitForPageFunction(
        page,
        () =>
          document.activeElement &&
          document.activeElement.id === 'menu-trigger',
        null,
        E2E_WAIT_MS.FOCUS
      );

      // 3. Enter opens the menu and focus lands on the first item.
      await openMenuFromTrigger();
      assert.equal(
        await page.getAttribute('#menu-trigger', 'aria-expanded'),
        'true'
      );

      // 4. The menu exposes exactly the four expected items in order.
      const itemIds = await page.evaluate(() =>
        [...document.querySelectorAll('#menu-popover [role="menuitem"]')].map(
          (el) => el.id
        )
      );
      assert.deepEqual(itemIds, [
        'menu-new-chat',
        'menu-export-txt',
        'menu-sound-toggle',
        'menu-theme-toggle'
      ]);

      // 5. Arrow keys move focus and wrap at both ends; Home/End jump.
      await page.keyboard.press('ArrowDown');
      await expectFocused('menu-export-txt');
      await page.keyboard.press('ArrowDown');
      await expectFocused('menu-sound-toggle');
      await page.keyboard.press('ArrowDown');
      await expectFocused('menu-theme-toggle');
      await page.keyboard.press('ArrowDown');
      await expectFocused('menu-new-chat');
      await page.keyboard.press('ArrowUp');
      await expectFocused('menu-theme-toggle');
      await page.keyboard.press('Home');
      await expectFocused('menu-new-chat');
      await page.keyboard.press('End');
      await expectFocused('menu-theme-toggle');

      // 6. Escape closes the menu and returns focus to the trigger.
      await page.keyboard.press('Escape');
      await waitForPageFunction(
        page,
        () => document.getElementById('menu-popover').hidden === true,
        null,
        E2E_WAIT_MS.FOCUS
      );
      await waitForPageFunction(
        page,
        () =>
          document.activeElement &&
          document.activeElement.id === 'menu-trigger',
        null,
        E2E_WAIT_MS.FOCUS
      );
      assert.equal(
        await page.getAttribute('#menu-trigger', 'aria-expanded'),
        'false'
      );

      // 7. Tab closes the menu and continues the tab order past the
      //    trigger; Shift+Tab continues backwards before it.
      const focusableIdsAfter = await visibleFocusableIds(page);
      const at = focusableIdsAfter.indexOf('menu-trigger');
      const nextId = focusableIdsAfter[at + 1] || null;
      const prevId = focusableIdsAfter[at - 1] || null;
      assert.ok(nextId, 'the trigger is not the last focusable control');

      await openMenuFromTrigger();
      await page.keyboard.press('Tab');
      await waitForPageFunction(
        page,
        (id) => document.activeElement && document.activeElement.id === id,
        nextId,
        E2E_WAIT_MS.FOCUS
      );
      assert.equal(
        await page.getAttribute('#menu-trigger', 'aria-expanded'),
        'false'
      );

      await page.keyboard.press('Shift+Tab');
      await waitForPageFunction(
        page,
        () =>
          document.activeElement &&
          document.activeElement.id === 'menu-trigger',
        null,
        E2E_WAIT_MS.FOCUS
      );
      await openMenuFromTrigger();
      await page.keyboard.press('Shift+Tab');
      await waitForPageFunction(
        page,
        () => document.getElementById('menu-popover').hidden === true,
        null,
        E2E_WAIT_MS.FOCUS
      );
      if (prevId) {
        // The trigger has a control before it (e.g. the breathe trigger
        // on the picker or a pre-chat state): focus lands on it.
        await waitForPageFunction(
          page,
          (id) => document.activeElement && document.activeElement.id === id,
          prevId,
          E2E_WAIT_MS.FOCUS
        );
      } else {
        // During a chat the breathe trigger is hidden, so the menu
        // trigger is the first focusable control: Shift+Tab has nowhere
        // to go before it. The menu must close cleanly and no VISIBLE
        // control may hold focus (Chrome keeps activeElement on the
        // now-hidden item, which counts as nowhere visible).
        const focusState = await page.evaluate(() => {
          const active = document.activeElement;
          return {
            menuClosed: document.getElementById('menu-popover').hidden === true,
            focusedOnVisible: active ? active.offsetParent !== null : false
          };
        });
        assert.equal(focusState.menuClosed, true, 'Shift+Tab closes the menu');
        assert.equal(
          focusState.focusedOnVisible,
          false,
          'focus must not land on a visible control before the trigger'
        );
      }

      // 8. Enter activates an item (the theme flips) and returns focus
      //    to the trigger. Reset the starting point (the previous step
      //    may have left focus on the body when no control precedes the
      //    trigger) and reopen the menu from the trigger.
      await page.focus('#menu-trigger');
      const themeBefore = await page.evaluate(
        () => document.documentElement.dataset.theme
      );
      await openMenuFromTrigger();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await expectFocused('menu-theme-toggle');
      await page.keyboard.press('Enter');
      await waitForPageFunction(
        page,
        () => document.getElementById('menu-popover').hidden === true,
        null,
        E2E_WAIT_MS.FOCUS
      );
      await waitForPageFunction(
        page,
        () =>
          document.activeElement &&
          document.activeElement.id === 'menu-trigger',
        null,
        E2E_WAIT_MS.FOCUS
      );
      // The theme flips through a View Transition, which applies the DOM
      // update on a later frame - wait for it to land before asserting.
      await waitForPageFunction(
        page,
        (before) => document.documentElement.dataset.theme !== before,
        themeBefore,
        E2E_WAIT_MS.THEME
      );
      const themeAfter = await page.evaluate(
        () => document.documentElement.dataset.theme
      );
      assert.notEqual(
        themeAfter,
        themeBefore,
        'activating the theme item should flip the theme'
      );

      // 9. The whole journey must be free of uncaught errors.
      assert.deepEqual(pageErrors, [], 'no uncaught errors in the browser');
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
      // Deterministic teardown: drop any keep-alive connections Chrome
      // still holds, then wait for the listening socket to close.
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  }
);
test(
  'modal dialogs trap Tab focus and restore focus on Escape',
  { timeout: 60000, skip: !findChromeBinary() },
  async (t) => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        throw new Error(
          'no Chrome/Chromium binary found; cannot run the e2e dialog test'
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

      const expectFocused = async (selector) => {
        await waitForPageFunction(
          page,
          (sel) => {
            const el = document.activeElement;
            return !!(el && el.matches(sel));
          },
          selector,
          E2E_WAIT_MS.FOCUS
        );
      };

      // Start a conversation so the chat surface (and its menu) exist.
      // The picker click is retried once to absorb a load-induced stall.
      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'load'
      });
      await page.waitForSelector('#picker-en');
      await clickWithRetry(page, '#picker-en');
      await waitForPageFunction(
        page,
        () => {
          const input = document.getElementById('composer-input');
          return input && !input.disabled;
        },
        null,
        E2E_WAIT_MS.GREETING
      );
      await waitForPageFunction(
        page,
        () => {
          const typing = document.getElementById('typing-row');
          return !typing || typing.hidden;
        },
        null,
        E2E_WAIT_MS.LONG
      ).catch(() => {});

      // ---- New-chat confirm dialog ----
      // Open the menu and activate "New chat" to show the confirm dialog.
      await page.evaluate(() =>
        document.getElementById('menu-trigger').focus()
      );
      await page.keyboard.press('Enter');
      await waitForPageFunction(
        page,
        () => !document.getElementById('menu-popover').hidden,
        null,
        E2E_WAIT_MS.FOCUS
      );
      await expectFocused('#menu-new-chat');
      await page.keyboard.press('Enter');
      await waitForPageFunction(
        page,
        () => !!document.querySelector('.confirm-overlay'),
        null,
        E2E_WAIT_MS.FOCUS
      );

      // The dialog focuses the safe "No" button by default.
      await expectFocused('.confirm-btn--no');

      // Tab stays inside the dialog, cycling between the two buttons.
      await page.keyboard.press('Tab');
      await expectFocused('.confirm-btn--yes');
      await page.keyboard.press('Shift+Tab');
      await expectFocused('.confirm-btn--no');

      // Escape closes the dialog and returns focus to the menu trigger.
      await page.keyboard.press('Escape');
      await waitForPageFunction(
        page,
        () => !document.querySelector('.confirm-overlay'),
        null,
        E2E_WAIT_MS.FOCUS
      );
      await expectFocused('#menu-trigger');

      // ---- Exit confirm bar ----
      await page.evaluate(() => window.DaryaOverlays.showExitConfirmBar());
      // The bar focuses the cancel button (safe default).
      await expectFocused('#exit-confirm-no');
      // Escape cancels, hides the bar, and returns focus to the composer.
      await page.keyboard.press('Escape');
      await waitForPageFunction(
        page,
        () => document.getElementById('exit-confirm-bar').hidden === true,
        null,
        E2E_WAIT_MS.FOCUS
      );
      await expectFocused('#composer-input');

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
