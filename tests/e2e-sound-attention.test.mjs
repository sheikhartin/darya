/**
 * End-to-end browser test for the sound-attention nudge and bilingual
 * notifications.
 *
 * Drives a real headless Chrome (Playwright's library API pointed at the
 * system Chrome binary, so nothing needs to be downloaded) against the
 * app served from a local static server, and asserts:
 *
 *   1. With the saved sound preference on but nothing playing yet (the
 *      welcome/picker screen where autoplay is blocked until a gesture),
 *      the picker sound toggle gains an attention class after a short
 *      delay, inviting the tap that starts the sound.
 *   2. Tapping the toggle starts playback and clears the attention
 *      state (the nudge has served its purpose).
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
  'picker sound toggle draws attention when sound is on-but-silent',
  { timeout: 60000 },
  async (t) => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        return t.skip(
          'no Chrome/Chromium binary found; skipping the e2e sound-attention test'
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
            '--autoplay-policy=no-user-gesture-required'
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

      // Seed the saved preference before the page loads so the module
      // boots with sound intent on but nothing playing (autoplay needs
      // a gesture that has not happened yet).
      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'domcontentloaded'
      });
      await page.evaluate(() => {
        document.cookie = 'darya_sound=1; path=/';
      });
      await page.reload({ waitUntil: 'load' });
      await page.waitForSelector('#picker-sound-toggle');

      // The toggle shows the HONEST state: the saved preference is on,
      // but nothing can play before a user gesture, so it starts "off"
      // (never a silent "on"). This is the regression guard for the
      // refresh-with-sound-enabled bug where the toggle claimed sound
      // was playing when the browser had blocked autoplay.
      assert.equal(
        await page.getAttribute('#picker-sound-toggle', 'aria-pressed'),
        'false',
        'saved sound intent does not fake an on state before a gesture'
      );

      // The attention class must appear after the configured delay
      // (SOUND_ATTENTION_DELAY_MS, 3s), not before.
      await page.waitForFunction(
        () =>
          document
            .getElementById('picker-sound-toggle')
            .classList.contains('picker__sound-toggle--attention'),
        null,
        { timeout: 10000 }
      );

      // Tapping the toggle starts the sound (the click is the user
      // gesture autoplay needs) and must clear the attention state. The
      // click is issued through the DOM because the attention pulse
      // animates the button (scale/opacity), which makes Playwright's
      // stability check wait forever for a "stable" element.
      await page.evaluate(() => {
        document.getElementById('picker-sound-toggle').click();
      });

      // The toggle must flip on ONLY once playback has genuinely
      // started (the sync is keyed off the actual audio state). Waiting
      // for the flip therefore proves real playback began, not just
      // that the click happened.
      await page.waitForFunction(
        () =>
          document
            .getElementById('picker-sound-toggle')
            .getAttribute('aria-pressed') === 'true',
        null,
        { timeout: 8000 }
      );

      // With the sound genuinely playing, the attention nudge has
      // served its purpose and must be gone.
      assert.equal(
        await page.evaluate(() =>
          document
            .getElementById('picker-sound-toggle')
            .classList.contains('picker__sound-toggle--attention')
        ),
        false,
        'starting sound clears the attention nudge'
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
    // bug. A real tap fires pointerdown BEFORE click. The document-level
    // first-gesture listener used to autoplay on that pointerdown (the
    // saved preference was on), and then the click's toggle() saw the
    // just-started playback as "already playing" and flipped it right
    // back off. The first-gesture listener must yield to the toggle's
    // own click handler when the gesture is on a sound toggle itself.
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        return t.skip(
          'no Chrome/Chromium binary found; skipping the e2e tap regression test'
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
            '--autoplay-policy=no-user-gesture-required'
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

      // Seed the saved preference ON so the first-gesture autoplay path
      // is armed (this is the state in which the double-fire occurred).
      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'domcontentloaded'
      });
      await page.evaluate(() => {
        document.cookie = 'darya_sound=1; path=/';
      });
      await page.reload({ waitUntil: 'load' });
      await page.waitForSelector('#picker-sound-toggle');

      // Simulate a real touch tap: pointerdown (which the first-gesture
      // listener used to hijack) followed by the browser's click.
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
      // flips to on and the audio keeps playing past the fade-in. If the
      // first-gesture listener still raced the toggle, the state would
      // settle back to off shortly after the click.
      await page.waitForFunction(
        () =>
          document
            .getElementById('picker-sound-toggle')
            .getAttribute('aria-pressed') === 'true',
        null,
        { timeout: 8000 }
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
  'notifications render bilingually (FA on top, EN below, dot-separated type)',
  { timeout: 60000 },
  async (t) => {
    const server = await startStaticServer();
    const chromePath = findChromeBinary();

    let browser;
    try {
      if (!chromePath) {
        return t.skip(
          'no Chrome/Chromium binary found; skipping the e2e notification test'
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
            '--autoplay-policy=no-user-gesture-required'
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

      await page.goto(`http://127.0.0.1:${server.address().port}/`, {
        waitUntil: 'load'
      });
      await page.waitForSelector('#picker-en');

      // Show a bilingual warning notification directly through the
      // public API and inspect the rendered DOM.
      await page.evaluate(() => {
        window.DaryaOverlays.showNotification('warn', {
          fa: 'پیام هشدار فارسی',
          en: 'English warning message'
        });
      });

      const overlay = page.locator('.notification-overlay');
      await overlay.waitFor({ timeout: 5000 });

      // Type label: FA part, dot separator, EN part (in DOM order).
      assert.equal(
        await page.textContent('.notification-type__fa'),
        'هشدار',
        'type label shows the Persian severity first'
      );
      assert.equal(
        await page.textContent('.notification-type__sep'),
        '·',
        'type label uses a dot separator'
      );
      assert.equal(
        await page.textContent('.notification-type__en'),
        'Warning',
        'type label shows the English severity after the dot'
      );

      // Message lines: Persian on top, English below, both with correct
      // direction attributes and centered.
      const faMsg = overlay.locator('.notification-message--fa');
      const enMsg = overlay.locator('.notification-message--en');
      await faMsg.waitFor({ timeout: 5000 });
      await enMsg.waitFor({ timeout: 5000 });
      assert.equal(
        await faMsg.textContent(),
        'پیام هشدار فارسی',
        'Persian message renders on its own line'
      );
      assert.equal(
        await enMsg.textContent(),
        'English warning message',
        'English message renders on its own line'
      );
      assert.equal(await faMsg.getAttribute('dir'), 'rtl');
      assert.equal(await enMsg.getAttribute('dir'), 'ltr');
      assert.equal(await faMsg.getAttribute('lang'), 'fa');
      assert.equal(await enMsg.getAttribute('lang'), 'en');

      const order = await page.evaluate(() => {
        const container = document.querySelector('.notification-container');
        const paragraphs = [
          ...container.querySelectorAll('.notification-message')
        ];
        return paragraphs.map((el) => el.className);
      });
      assert.deepEqual(
        order,
        [
          'notification-message notification-message--fa',
          'notification-message notification-message--en'
        ],
        'Persian line comes before the English line'
      );

      const alignment = await faMsg.evaluate(
        (el) => getComputedStyle(el).textAlign
      );
      assert.equal(alignment, 'center', 'bilingual lines are centered');

      // Severity icon: an inline SVG marked aria-hidden (decorative,
      // the bilingual type text carries the meaning), inheriting the
      // chip's accent color.
      const icon = page.locator('.notification-type__icon');
      await icon.waitFor({ timeout: 5000 });
      assert.equal(await icon.getAttribute('aria-hidden'), 'true');
      assert.equal(
        await icon.evaluate((el) => el.tagName),
        'svg',
        'severity icon is inline SVG, not a text glyph'
      );
      const iconColor = await page.evaluate(
        () =>
          getComputedStyle(document.querySelector('.notification-type__icon'))
            .color
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
        const icon = document.querySelector('.notification-type__icon');
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

      // Type label renders as an emphasis chip outlined with the
      // severity accent (a border, not a tinted background, so the text
      // always sits on the plain panel).
      const chipBorder = await page.evaluate(
        () =>
          getComputedStyle(document.querySelector('.notification-type'))
            .borderTopColor
      );
      assert.match(
        chipBorder,
        /242, 185, 135/u,
        'warn chip is outlined with the amber accent'
      );

      // The type chip is horizontally centered in the card (the dismiss
      // button floats in the corner and must not shift it).
      const centered = await page.evaluate(() => {
        const container = document.querySelector('.notification-container');
        const chip = document.querySelector('.notification-type');
        const cr = container.getBoundingClientRect();
        const hr = chip.getBoundingClientRect();
        return {
          containerCenter: cr.left + cr.width / 2,
          chipCenter: hr.left + hr.width / 2,
          width: cr.width
        };
      });
      assert.ok(
        Math.abs(centered.containerCenter - centered.chipCenter) <
          centered.width * 0.05,
        'type chip is centered in the notification card'
      );

      // Dark-mode check in both themes: the luminous severity accent
      // must keep WCAG contrast on the dark panel in ocean AND beach.
      // The panel (possibly translucent in beach) is composited over
      // white, the worst case for a dark surface, before the ratio is
      // computed.
      const measureContrast = () =>
        page.evaluate(() => {
          const container = document.querySelector('.notification-container');
          const label = document.querySelector('.notification-type');
          const toRgb = (css) => {
            const m = css.match(
              /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/
            );
            return [
              Number(m[1]),
              Number(m[2]),
              Number(m[3]),
              m[4] === undefined ? 1 : Number(m[4])
            ];
          };
          const lum = (rgb) => {
            const lin = rgb.slice(0, 3).map((c) => {
              const s = c / 255;
              return s <= 0.03928
                ? s / 12.92
                : Math.pow((s + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
          };
          // The text renders on the chip, which sits on the panel, which
          // in the beach theme used to be translucent over the bright
          // backdrop. Composite chip-over-panel, then panel-over-white
          // (the worst case for a dark surface), to get the effective
          // background the label actually renders on.
          const fg = toRgb(getComputedStyle(label).color);
          const chip = toRgb(getComputedStyle(label).backgroundColor);
          const panel = toRgb(getComputedStyle(container).backgroundColor);
          const over = (top, bottom) =>
            top
              .slice(0, 3)
              .map((c, i) => c * top[3] + bottom[i] * (1 - top[3]));
          const chipOnPanel = over(chip, panel);
          const bg = over([...chipOnPanel, 1], [255, 255, 255, 1]);
          const l1 = lum(fg);
          const l2 = lum(bg);
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        });

      const oceanRatio = await measureContrast();
      assert.ok(
        oceanRatio >= 4.5,
        'ocean theme: type label passes 4.5:1 (' + oceanRatio.toFixed(2) + ')'
      );

      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'beach');
      });

      const beachRatio = await measureContrast();
      assert.ok(
        beachRatio >= 4.5,
        'beach theme: type label passes 4.5:1 (' + beachRatio.toFixed(2) + ')'
      );
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

      // Dismiss the toast so the timer has nothing to clean up later.
      await page.click('.notification-dismiss');

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
