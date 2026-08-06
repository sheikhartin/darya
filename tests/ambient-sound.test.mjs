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

/**
 * Loads the module with a fake document and a fake Audio whose play()
 * behaves according to the given behavior.
 * @param {string} cookie - The document.cookie to expose
 * @param {Function} play - play() implementation returning a promise
 * @returns {object} the sandbox surface (ambient, instances, handlers)
 */
function loadSandbox(cookie, play) {
  const originalDocument = globalThis.document;
  const originalFetch = globalThis.fetch;
  const originalAudio = globalThis.Audio;
  const instances = [];
  const handlers = {};
  class FakeAudio {
    constructor() {
      instances.push(this);
      this.paused = true;
      this.readyState = 0;
    }
    addEventListener() {}
    removeEventListener() {}
    play() {
      return play(this);
    }
    pause() {
      this.paused = true;
    }
    removeAttribute() {}
    load() {}
  }
  const fakeDocument = {
    cookie,
    hidden: true,
    documentElement: { getAttribute: () => 'ocean' },
    addEventListener(name, handler) {
      handlers[name] = handler;
    },
    removeEventListener() {}
  };
  globalThis.document = fakeDocument;
  globalThis.fetch = () =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ beach: ['beach.mp3'], ocean: ['ocean.mp3'] })
    });
  globalThis.Audio = FakeAudio;
  vm.runInThisContext(SCRIPT, { filename: 'js/ui/ambient-sound.js' });
  return {
    ambient: globalThis.DaryaAmbientSound,
    instances,
    handlers,
    fakeDocument,
    restore() {
      delete globalThis.DaryaAmbientSound;
      globalThis.document = originalDocument;
      globalThis.fetch = originalFetch;
      globalThis.Audio = originalAudio;
    }
  };
}

function notAllowedError() {
  const err = new Error('autoplay policy');
  err.name = 'NotAllowedError';
  return err;
}

function abortError() {
  const err = new Error('load aborted');
  err.name = 'AbortError';
  return err;
}

test('autoplay blocked by autoplay policy keeps the saved preference', async () => {
  const box = loadSandbox('darya_sound=1', () =>
    Promise.reject(notAllowedError())
  );
  try {
    const result = await box.ambient.autoplayIfEnabled();
    // A NotAllowedError is not a load failure: the module must keep its
    // enabled intent and the saved cookie so a later gesture can retry.
    assert.equal(result, true);
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), false);
    assert.equal(box.fakeDocument.cookie, 'darya_sound=1');
  } finally {
    box.restore();
  }
});

test('a genuine load failure still rolls back and wipes the preference', async () => {
  const box = loadSandbox('darya_sound=1', () =>
    Promise.reject(
      Object.assign(new Error('decode failed'), { name: 'TypeError' })
    )
  );
  try {
    const result = await box.ambient.autoplayIfEnabled();
    assert.equal(result, false);
    assert.equal(box.ambient.enabled, false);
    assert.ok(
      box.fakeDocument.cookie.startsWith('darya_sound=0'),
      `cookie should record the disabled state, got: ${box.fakeDocument.cookie}`
    );
  } finally {
    box.restore();
  }
});

test('toggle keeps user intent when playback is policy-blocked', async () => {
  const box = loadSandbox('darya_sound=0', () =>
    Promise.reject(notAllowedError())
  );
  try {
    const result = await box.ambient.toggle();
    // The user asked to enable sound; a NotAllowedError must not silently
    // convert that into a disabled preference. The module keeps its
    // enabled intent for the session (a later gesture or tab return can
    // retry) without writing a "playing" cookie that no sound backs up.
    assert.equal(result, true);
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.fakeDocument.cookie, 'darya_sound=0');
  } finally {
    box.restore();
  }
});

test('tab becoming visible retries autoplay without wiping preference', async () => {
  const box = loadSandbox('darya_sound=1', () =>
    Promise.reject(notAllowedError())
  );
  try {
    // Simulate an initial autoplay attempt that was policy-blocked.
    await box.ambient.autoplayIfEnabled();
    assert.equal(box.fakeDocument.cookie, 'darya_sound=1');

    // Tab returns to the foreground: the visibility handler must retry
    // autoplay rather than silently staying silent, and the retry must
    // remain preference-safe.
    box.fakeDocument.hidden = false;
    box.handlers.visibilitychange();

    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.fakeDocument.cookie, 'darya_sound=1');
  } finally {
    box.restore();
  }
});

test('toggle recovers after the failure cap is reached', async () => {
  // After three genuine load failures the module hits its failure cap.
  // A fourth explicit toggle-on must reset the counter and try the files
  // once more instead of short-circuiting into a permanent no-op (the
  // reported "not toggling anymore" bug).
  let failuresLeft = 3;
  const box = loadSandbox('darya_sound=0', function (audio) {
    if (failuresLeft > 0) {
      failuresLeft -= 1;
      return Promise.reject(
        Object.assign(new Error('decode failed'), { name: 'TypeError' })
      );
    }
    audio.paused = false;
    audio.readyState = 4;
    return Promise.resolve();
  });
  try {
    for (let i = 0; i < 3; i += 1) {
      const result = await box.ambient.toggle();
      assert.equal(result, false, 'toggle ' + (i + 1) + ' must roll back');
      assert.equal(box.ambient.enabled, false);
    }
    // The cap is reached and synthesis is unavailable in this sandbox;
    // the toggle must still respond to a fresh click.
    const recovered = await box.ambient.toggle();
    assert.equal(recovered, true, 'fresh toggle must start playback');
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), true);
    assert.ok(box.fakeDocument.cookie.startsWith('darya_sound=1'));
  } finally {
    box.restore();
  }
});

test('rapid toggle clicks share one in-flight start', async () => {
  // A double-click (or the picker and menu buttons pressed together)
  // must collapse into one toggle operation: the pendingToggle guard
  // joins the running start instead of spawning a second Audio element
  // and interleaving an enable/disable cycle.
  const box = loadSandbox('darya_sound=0', function (audio) {
    audio.paused = false;
    audio.readyState = 4;
    return new Promise((resolve) => setTimeout(resolve, 30));
  });
  try {
    const first = box.ambient.toggle();
    const second = box.ambient.toggle();
    const third = box.ambient.toggle();
    const results = await Promise.all([first, second, third]);
    assert.deepEqual(results, [true, true, true]);
    assert.equal(box.instances.length, 1, 'rapid toggles share one Audio');
    assert.equal(box.ambient.enabled, true);
  } finally {
    box.restore();
  }
});

test('toggle reflects playback as soon as play() succeeds, before the fade-in finishes', async () => {
  // The on-state must flip the moment audio genuinely starts, not after
  // the 800ms volume fade-in completes: the volume ramp is cosmetic and
  // must never delay the toggle UI (the feedback-lag fix).
  const box = loadSandbox('darya_sound=0', function (audio) {
    audio.paused = false;
    audio.readyState = 4;
    return Promise.resolve();
  });
  try {
    await box.ambient.toggle();
    assert.equal(box.ambient.isPlaying(), true);
    // The promise resolved at playback start, so the volume ramp has not
    // reached its target yet (the old behavior resolved at 0.25, the
    // full fade).
    assert.ok(
      box.instances[0].volume < 0.25,
      'toggle resolved before the volume fade-in completed'
    );
    assert.ok(box.fakeDocument.cookie.startsWith('darya_sound=1'));
  } finally {
    box.restore();
  }
});

test('a toggle inside the fade-in window joins the first instead of flipping', async () => {
  // The toggle promise resolves at playback start (the feedback-lag
  // fix), but the rapid-click guard must stay armed through the volume
  // fade-in: a second toggle that lands after play() succeeded but
  // before the fade finished must join the running operation (same
  // result), never start an enable/disable cycle that ends silent.
  const box = loadSandbox('darya_sound=0', function (audio) {
    audio.paused = false;
    audio.readyState = 4;
    return Promise.resolve();
  });
  try {
    const first = await box.ambient.toggle();
    assert.equal(first, true);
    assert.equal(box.ambient.isPlaying(), true);

    // The first toggle has settled, but its guard timer is still armed
    // (it clears only after the fade-in elapses). This second call must
    // join that operation rather than disable the freshly started audio.
    const second = await box.ambient.toggle();
    assert.equal(second, true, 'second toggle joins, does not flip');
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), true, 'audio keeps playing');
    assert.equal(box.instances.length, 1, 'no second Audio element spawned');
  } finally {
    box.restore();
  }
});

test('tab hiding aborts an in-flight play attempt promptly', async () => {
  // If play() never settles (a throttled media load in a hidden tab),
  // the visibility handler must abort the attempt right away instead of
  // waiting for the 15s safety timeout. The abort is transient: the
  // user's intent is kept and no preference is wiped.
  const box = loadSandbox('darya_sound=0', () => new Promise(() => {}));
  try {
    const toggling = box.ambient.toggle();
    // Let the microtask chain reach playThemeSound and register the
    // in-flight attempt before hiding the tab.
    await new Promise((resolve) => setTimeout(resolve, 5));
    box.fakeDocument.hidden = true;
    box.handlers.visibilitychange();
    const result = await toggling;
    assert.equal(result, true, 'abort keeps the user intent to enable');
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), false);
    assert.equal(box.fakeDocument.cookie, 'darya_sound=0');
    assert.equal(box.instances.length, 1);
  } finally {
    box.restore();
  }
});

test('transient failures never count toward the failure cap', async () => {
  // Timeouts, tab-hidden aborts, and autoplay-policy rejections are not
  // file problems: they must not accumulate into the permanent-disable
  // cap, or a slow network could brick the toggle after a few tries.
  let failuresLeft = 5;
  const box = loadSandbox('darya_sound=0', function (audio) {
    if (failuresLeft > 0) {
      failuresLeft -= 1;
      return Promise.reject(abortError());
    }
    audio.paused = false;
    audio.readyState = 4;
    return Promise.resolve();
  });
  try {
    for (let i = 0; i < 5; i += 1) {
      const result = await box.ambient.toggle();
      assert.equal(result, true, 'transient failure keeps the intent');
      assert.equal(box.ambient.enabled, true);
      assert.equal(box.ambient.isPlaying(), false);
      assert.equal(box.fakeDocument.cookie, 'darya_sound=0');
    }
    // A subsequent working file still starts normally: five transient
    // failures never poisoned the counter.
    const ok = await box.ambient.toggle();
    assert.equal(ok, true);
    assert.equal(box.ambient.isPlaying(), true);
  } finally {
    box.restore();
  }
});

/**
 * Minimal Web Audio API stand-in so createSynthesizedAmbient() can run
 * in the sandbox. The noise graph is not real; only the objects and
 * method names the module touches need to exist.
 */
class FakeAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 8000;
    this.destination = {};
    this.currentTime = 0;
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createBuffer(channels, length) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return { buffer: null, loop: false, start() {}, stop() {}, connect() {} };
  }
  createBiquadFilter() {
    return {
      type: '',
      frequency: { value: 0 },
      Q: { value: 0 },
      connect() {}
    };
  }
  createGain() {
    return {
      gain: { value: 0, setTargetAtTime() {} },
      connect() {}
    };
  }
}

test('theme change aborts an in-flight play attempt', async () => {
  // When the theme changes while a load is still in flight, the stale
  // attempt must be aborted promptly (transient, intent kept) so it can
  // never resolve into the wrong theme or linger until the timeout.
  const box = loadSandbox('darya_sound=1', () => new Promise(() => {}));
  try {
    const starting = box.ambient.autoplayIfEnabled();
    // Let the microtask chain reach playThemeSound and register the
    // in-flight attempt before switching the theme.
    await new Promise((resolve) => setTimeout(resolve, 5));
    box.ambient.onThemeChange('beach');
    const result = await starting;
    assert.equal(result, true, 'abort keeps the user intent');
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), false);
    assert.equal(box.ambient.currentTheme, null);
    assert.equal(box.instances.length, 1);

    // The scheduled theme start fires shortly after; let it register,
    // then hide the tab so its (never-settling) attempt is aborted and
    // cleaned up instead of lingering until the safety timeout.
    await new Promise((resolve) => setTimeout(resolve, 260));
    assert.equal(box.instances.length, 2, 'theme change schedules a start');
    box.fakeDocument.hidden = true;
    box.handlers.visibilitychange();
    await new Promise((resolve) => setTimeout(resolve, 5));
  } finally {
    box.restore();
  }
});

test('tab return retries when a transient failure kept the intent', async () => {
  // A transient failure (e.g. the tab hid mid-load) keeps the in-memory
  // intent even when no cookie was written yet. Returning to the tab
  // must retry based on that intent, not only on the saved cookie.
  const box = loadSandbox('darya_sound=0', () => Promise.reject(abortError()));
  try {
    const result = await box.ambient.toggle();
    assert.equal(result, true);
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), false);
    assert.equal(box.fakeDocument.cookie, 'darya_sound=0');
    assert.equal(box.instances.length, 1);

    box.fakeDocument.hidden = false;
    box.handlers.visibilitychange();
    await new Promise((resolve) => setTimeout(resolve, 10));

    // The visibility retry started a second attempt even though the
    // cookie says "off", because the intent is held in memory.
    assert.equal(box.instances.length, 2);
    assert.equal(box.ambient.enabled, true);
  } finally {
    box.restore();
  }
});

test('the third consecutive failed toggle engages the synthesized fallback', async () => {
  // Genuine failures accumulate across toggles (the counter is not reset
  // on every click). On the third failure the module must switch to the
  // synthesized ambient instead of silently rolling back, and a further
  // toggle-off must stop it cleanly.
  const originalAudioContext = globalThis.AudioContext;
  const originalWindow = globalThis.window;
  let failuresLeft = 3;
  try {
    const box = loadSandbox('darya_sound=0', function (audio) {
      if (failuresLeft > 0) {
        failuresLeft -= 1;
        return Promise.reject(
          Object.assign(new Error('decode failed'), { name: 'TypeError' })
        );
      }
      audio.paused = false;
      audio.readyState = 4;
      return Promise.resolve();
    });
    try {
      assert.equal(await box.ambient.toggle(), false);
      assert.equal(await box.ambient.toggle(), false);

      // Web Audio becomes available before the third click: the cap now
      // routes to the synthesized fallback.
      globalThis.window = { AudioContext: FakeAudioContext };
      globalThis.AudioContext = FakeAudioContext;

      const third = await box.ambient.toggle();
      assert.equal(third, true, 'synthesized fallback takes over');
      assert.equal(box.ambient.enabled, true);
      assert.equal(box.ambient.isPlaying(), true);
      assert.equal(box.instances.length, 3, 'files tried 3 times, then synth');

      // Toggle-off must stop the synthesized ambient cleanly.
      const fourth = await box.ambient.toggle();
      assert.equal(fourth, false);
      assert.equal(box.ambient.enabled, false);
      assert.equal(box.ambient.isPlaying(), false);
    } finally {
      box.restore();
    }
  } finally {
    globalThis.AudioContext = originalAudioContext;
    globalThis.window = originalWindow;
  }
});
