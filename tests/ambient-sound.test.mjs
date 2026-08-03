/**
 * Ambient-sound module regression tests.
 *
 * The classic script initializes `isEnabled` from the saved cookie at
 * load time. This test loads the module into a sandboxed global with a
 * fake `document` (whose `cookie` holds the preference) and asserts the
 * initial state honors it.
 *
 * Historical bug this guards against: the cookie-name constant was
 * declared at the bottom of the module but referenced by the top-level
 * initializer. Due to `var` hoisting it was `undefined` at init time, so
 * the cookie regex looked for `undefined=`, never matched, and a
 * returning user's saved sound preference was silently lost on every
 * visit (the toggle always booted "off").
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = fs.readFileSync(
  path.join(ROOT, 'js/ui/ambient-sound.js'),
  'utf8'
);

/**
 * Loads the ambient-sound script into the shared global with a fake
 * document whose cookie contains the given value.
 * @param {string} cookie - The document.cookie string to expose
 */
function loadWithCookie(cookie) {
  const originalDocument = globalThis.document;
  const originalFetch = globalThis.fetch;
  try {
    globalThis.document = {
      cookie,
      addEventListener() {},
      removeEventListener() {}
    };
    // Stub fetch with a valid manifest so the module's load-time
    // manifest preload succeeds without emitting a fallback warning.
    globalThis.fetch = () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ beach: ['beach.mp3'], ocean: ['ocean.mp3'] })
      });
    vm.runInThisContext(SCRIPT, { filename: 'js/ui/ambient-sound.js' });
  } finally {
    globalThis.document = originalDocument;
    globalThis.fetch = originalFetch;
  }
}

test('saved sound preference is honored at module load', () => {
  try {
    loadWithCookie('darya_sound=1');
    assert.equal(globalThis.DaryaAmbientSound.enabled, true);
    assert.equal(globalThis.DaryaAmbientSound.isPlaying(), false);
  } finally {
    delete globalThis.DaryaAmbientSound;
  }
});

test('a disabled preference and an absent preference both boot off', () => {
  try {
    loadWithCookie('darya_sound=0');
    assert.equal(globalThis.DaryaAmbientSound.enabled, false);
    delete globalThis.DaryaAmbientSound;

    loadWithCookie('other=value');
    assert.equal(globalThis.DaryaAmbientSound.enabled, false);
  } finally {
    delete globalThis.DaryaAmbientSound;
  }
});

test('concurrent autoplay callers share one in-flight audio start', async () => {
  // The language-picker click and the first-gesture document listener can
  // both call autoplayIfEnabled() on the same click, before either
  // play() promise has settled. Each call must not create its own Audio
  // element (that would double-fetch the sound file on first visit); a
  // single in-flight attempt is shared, and an already-playing state
  // never restarts audio.
  const originalDocument = globalThis.document;
  const originalFetch = globalThis.fetch;
  const originalAudio = globalThis.Audio;
  try {
    const instances = [];
    class FakeAudio {
      constructor() {
        instances.push(this);
      }
      addEventListener() {}
      removeEventListener() {}
      play() {
        this.paused = false;
        this.readyState = 2;
        return Promise.resolve();
      }
      pause() {}
      removeAttribute() {}
      load() {}
    }
    globalThis.document = {
      cookie: 'darya_sound=1',
      documentElement: { getAttribute: () => 'ocean' },
      addEventListener() {},
      removeEventListener() {}
    };
    globalThis.fetch = () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ beach: ['beach.mp3'], ocean: ['ocean.mp3'] })
      });
    globalThis.Audio = FakeAudio;
    vm.runInThisContext(SCRIPT, { filename: 'js/ui/ambient-sound.js' });

    const ambient = globalThis.DaryaAmbientSound;
    const first = ambient.autoplayIfEnabled();
    const second = ambient.autoplayIfEnabled();
    const results = await Promise.all([first, second]);

    assert.equal(
      instances.length,
      1,
      'concurrent callers must share one Audio'
    );
    assert.deepEqual(results, [true, true]);

    // Once playing, a further autoplay request must be a no-op.
    const again = await ambient.autoplayIfEnabled();
    assert.equal(again, true);
    assert.equal(instances.length, 1, 'already playing must not restart audio');
  } finally {
    delete globalThis.DaryaAmbientSound;
    globalThis.document = originalDocument;
    globalThis.fetch = originalFetch;
    globalThis.Audio = originalAudio;
  }
});
