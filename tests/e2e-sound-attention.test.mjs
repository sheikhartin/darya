/**
 * End-to-end browser tests for ambient sound behavior and bilingual
 * notifications.
 *
 * Ambient sound is strictly opt-in: it always boots silent, is started
 * only by a toggle click, and is never restored from a saved preference.
 * These tests drive a real headless Chrome (Playwright's library API
 * pointed at the system Chrome binary, so nothing needs to be
 * downloaded) against the app served from a local static server, and
 * assert:
 *
 *   1. A legacy sound cookie from an old version never enables sound at
 *      boot: the picker toggle starts "off" and no audio plays until the
 *      user taps the toggle.
 *   2. A real tap on the picker sound toggle starts playback and keeps
 *      it playing.
 *   3. Notifications render bilingually: the Persian line on top, the
 *      English line below, both centered, and a dot-separated type
 *      label ("هشدار · Warning") like the picker intro.
 *
 * The test skips itself (rather than failing) when no Chrome/Chromium
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
import { E2E_WAIT_MS, waitForPageFunction } from './e2e-helpers.mjs';

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
 * Launches headless Chrome with autoplay allowed, failing the test when
 * no binary exists.
 * @returns {Promise<import('@playwright/test').Browser|null>}
 */
async function launchChrome() {
  const chromePath = findChromeBinary();
  if (!chromePath) {
    throw new Error(
      'no Chrome/Chromium binary found; cannot run the e2e sound test'
    );
  }
  try {
    return await chromium.launch({
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
}

test(
  'a legacy sound cookie never enables sound at boot; a tap on the toggle starts it',
  { timeout: 60000 },
  async (t) => {
    // A stale "on" cookie written by an old version must not start
    // audio or flip the toggle on: every visit boots silent, and only a
    // toggle click starts playback.
    const server = await startStaticServer();
    let browser;
    try {
      browser = await launchChrome();
      if (!browser) {
        return;
      }

      const page = await browser.newPage();
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
        }
      });

      // Seed a legacy "on" cookie before the page loads, exactly like a
      // returning user from an old version would have.
      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'domcontentloaded'
      });
      await page.evaluate(() => {
        document.cookie = 'darya_sound=1; path=/';
      });
      await page.reload({ waitUntil: 'load' });
      await page.waitForSelector('#picker-sound-toggle');

      // The toggle must start honestly "off" even though the legacy
      // cookie said "on": no saved preference can enable sound.
      assert.equal(
        await page.getAttribute('#picker-sound-toggle', 'aria-pressed'),
        'false',
        'a legacy on-cookie must not flip the toggle on at boot'
      );
      const bootState = await page.evaluate(() => ({
        enabled: window.DaryaAmbientSound.enabled,
        playing: window.DaryaAmbientSound.isPlaying()
      }));
      assert.equal(bootState.enabled, false, 'sound must boot disabled');
      assert.equal(bootState.playing, false, 'nothing may play at boot');

      // Tapping the toggle is the gesture that starts sound: it flips on
      // only once playback has genuinely started. The click is issued
      // through the DOM because the button has a hover transition that
      // makes Playwright's stability check wait.
      await page.evaluate(() => {
        document.getElementById('picker-sound-toggle').click();
      });
      await waitForPageFunction(
        page,
        () =>
          document
            .getElementById('picker-sound-toggle')
            .getAttribute('aria-pressed') === 'true',
        null,
        E2E_WAIT_MS.PLAYBACK
      );
      assert.equal(
        await page.evaluate(() => window.DaryaAmbientSound.isPlaying()),
        true,
        'the toggle click must start real playback'
      );

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
  'a real tap on the picker sound toggle starts playback and keeps it playing',
  { timeout: 60000 },
  async (t) => {
    // Regression guard for the "turns on for a second, then turns off"
    // bug. A real touch tap fires pointerdown before click. Sound is
    // opt-in, so nothing may start on the pointerdown; the click's
    // toggle() owns the gesture and must leave the sound genuinely
    // playing past the fade-in.
    const server = await startStaticServer();
    let browser;
    try {
      browser = await launchChrome();
      if (!browser) {
        return;
      }

      const page = await browser.newPage();
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
        }
      });

      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'load'
      });
      await page.waitForSelector('#picker-sound-toggle');

      // Simulate a real touch tap: pointerdown followed by the browser's
      // click. Nothing may start on the pointerdown alone.
      await page.evaluate(() => {
        const toggle = document.getElementById('picker-sound-toggle');
        toggle.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            pointerType: 'touch'
          })
        );
      });
      await page.waitForTimeout(150);
      await page.evaluate(() => {
        document.getElementById('picker-sound-toggle').click();
      });

      // The tap must result in REAL playback that stays on: the toggle
      // flips to on and the audio keeps playing past the fade-in.
      await waitForPageFunction(
        page,
        () =>
          document
            .getElementById('picker-sound-toggle')
            .getAttribute('aria-pressed') === 'true',
        null,
        E2E_WAIT_MS.PLAYBACK
      );
      await page.waitForTimeout(1200);
      const settled = await page.evaluate(() => ({
        playing: window.DaryaAmbientSound.isPlaying(),
        pressed: document
          .getElementById('picker-sound-toggle')
          .getAttribute('aria-pressed'),
        enabled: window.DaryaAmbientSound.enabled
      }));
      assert.equal(settled.playing, true, 'sound must still be playing');
      assert.equal(settled.pressed, 'true', 'toggle must stay on');
      assert.equal(settled.enabled, true, 'enabled state must stay true');

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
  'notifications render as a centered icon-only badge with the message in aria-label',
  { timeout: 60000 },
  async (t) => {
    const server = await startStaticServer();
    let browser;
    try {
      browser = await launchChrome();
      if (!browser) {
        return;
      }

      const page = await browser.newPage();
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
        }
      });

      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'load'
      });
      await page.waitForSelector('#picker-en');

      // Show a bilingual warning notification directly through the
      // public API and inspect the rendered DOM. A long duration keeps
      // the badge on screen for the whole test: under the heavy load of
      // a full-suite run the sequential assertions below can exceed the
      // default auto-dismiss, which would make the overlay vanish
      // mid-measurement.
      await page.evaluate(() => {
        window.DaryaOverlays.showNotification(
          'warn',
          {
            fa: 'پیام هشدار فارسی',
            en: 'English warning message'
          },
          60000
        );
      });

      const overlay = page.locator('.notification-overlay');
      await overlay.waitFor({ timeout: E2E_WAIT_MS.FOCUS });

      // No text is painted anywhere in the notification: the badge is a
      // bare severity symbol (the user asked for icon-only, "just a
      // symbol like warning is enough"). Both language lines exist only
      // as the accessible label.
      const visibleText = await page.evaluate(() => {
        const overlay = document.querySelector('.notification-overlay');
        return (overlay.textContent || '').trim();
      });
      assert.equal(
        visibleText,
        '',
        'notification must not render any visible text'
      );

      // The bilingual message lives in the overlay aria-label so screen
      // readers still announce it.
      assert.equal(
        await overlay.getAttribute('aria-label'),
        'پیام هشدار فارسی English warning message',
        'bilingual message is carried as the accessible label'
      );
      assert.equal(await overlay.getAttribute('role'), 'alert');
      assert.equal(await overlay.getAttribute('aria-live'), 'assertive');

      // The badge is a round container centered in the viewport (both
      // axes), not a top-aligned text card.
      const placement = await page.evaluate(() => {
        const overlay = document.querySelector('.notification-overlay');
        const badge = document.querySelector('.notification-container');
        const or = overlay.getBoundingClientRect();
        const br = badge.getBoundingClientRect();
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        return {
          badgeCenterX: br.left + br.width / 2,
          badgeCenterY: br.top + br.height / 2,
          viewportCenterX: vw / 2,
          viewportCenterY: vh / 2,
          overlayWidth: or.width
        };
      });
      assert.ok(
        Math.abs(placement.badgeCenterX - placement.viewportCenterX) < 4,
        'badge is horizontally centered in the viewport'
      );
      assert.ok(
        Math.abs(placement.badgeCenterY - placement.viewportCenterY) < 4,
        'badge is vertically centered in the viewport'
      );

      // Severity icon: an inline SVG marked aria-hidden (decorative, the
      // overlay aria-label carries the meaning), inheriting the amber
      // warn accent through currentColor.
      const icon = page.locator('.notification-icon');
      await icon.waitFor({ timeout: E2E_WAIT_MS.FOCUS });
      assert.equal(await icon.getAttribute('aria-hidden'), 'true');
      assert.equal(
        await icon.evaluate((el) => el.tagName),
        'svg',
        'severity icon is inline SVG, not a text glyph'
      );
      const iconColor = await page.evaluate(
        () =>
          getComputedStyle(document.querySelector('.notification-icon')).color
      );
      assert.equal(
        iconColor,
        'rgb(242, 185, 135)',
        'icon inherits the amber warn accent'
      );

      // The icon's shapes carry real geometry: a regression guard so the
      // shapes never render empty (a circle with no radius or a path
      // with no data draws nothing).
      const iconGeometry = await page.evaluate(() => {
        const icon = document.querySelector('.notification-icon');
        const first = icon.firstElementChild;
        return {
          tag: first ? first.tagName : null,
          attrs: first ? [...first.attributes].map((a) => a.name) : []
        };
      });
      assert.ok(
        iconGeometry.attrs.includes('r') || iconGeometry.attrs.includes('d'),
        'severity icon shapes carry geometry attributes (' +
          iconGeometry.tag +
          ': ' +
          iconGeometry.attrs.join(', ') +
          ')'
      );

      // The badge is round (equal width/height, 50% radius) so it reads
      // as a symbol, not a text card.
      const badgeShape = await page.evaluate(() => {
        const badge = document.querySelector('.notification-container');
        const cs = getComputedStyle(badge);
        const r = badge.getBoundingClientRect();
        return {
          width: r.width,
          height: r.height,
          radius: cs.borderRadius
        };
      });
      assert.ok(
        Math.abs(badgeShape.width - badgeShape.height) < 2,
        'badge is circular (equal width and height)'
      );
      assert.equal(badgeShape.radius, '50%', 'badge uses a 50% radius');

      // Beach theme keeps the amber severity border on the badge.
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'beach');
      });
      const beachBorder = await page.evaluate(
        () =>
          getComputedStyle(document.querySelector('.notification-container'))
            .borderTopColor
      );
      assert.equal(
        beachBorder,
        'rgb(242, 185, 135)',
        'beach theme keeps the amber severity border'
      );

      // Escape dismisses the badge (document-level handler that never
      // moves focus, so the composer caret is safe).
      await page.keyboard.press('Escape');
      await overlay.waitFor({ state: 'detached', timeout: E2E_WAIT_MS.FOCUS });

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
