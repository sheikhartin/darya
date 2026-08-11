/**
 * Ambient-sound module regression tests.
 *
 * Ambient sound is strictly opt-in: the module always boots silent, is
 * started only by a toggle click, and never persists its state. A legacy
 * cookie written by versions before 1.2.0 (darya_sound) is expired once
 * at load so a stale "on" preference can never start audio by itself.
 *
 * These tests load the module into a sandboxed global with a fake
 * `document` and fake `Audio`, and assert the boot state, the toggle
 * lifecycle, the failure-cap behavior, the synthesized fallback, and the
 * visibility handling all match that contract.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The ambient-sound module was split into part files that share one
// global namespace: constants/stateless utils (data), audio helpers
// (helpers), stateful playback bound to the shared state (playback),
// and the main module that owns the state and public API. They must
// load in this order.
const SCRIPTS = [
  'js/ui/ambient-sound-data.js',
  'js/ui/ambient-sound-helpers.js',
  'js/ui/ambient-sound-playback.js',
  'js/ui/ambient-sound.js'
].map((relative) => ({
  filename: relative,
  code: fs.readFileSync(path.join(ROOT, relative), 'utf8')
}));

/**
 * Loads the ambient-sound scripts into the shared global with a fake
 * document whose cookie contains the given value. The cookie simulates
 * a legacy leftover from an older version; the module never reads it
 * for state and must expire it at load.
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
    for (const { filename, code } of SCRIPTS) {
      vm.runInThisContext(code, { filename });
    }
  } finally {
    globalThis.document = originalDocument;
    globalThis.fetch = originalFetch;
  }
}

test('ambient sound always boots silent, even with a legacy on-cookie', () => {
  try {
    loadWithCookie('darya_sound=1');
    // The stale "on" cookie from an old version must never enable sound:
    // every visit starts silent, and only a toggle click starts audio.
    assert.equal(globalThis.DaryaAmbientSound.enabled, false);
    assert.equal(globalThis.DaryaAmbientSound.isPlaying(), false);
  } finally {
    delete globalThis.DaryaAmbientSound;
  }
});

test('a legacy disabled or absent cookie also boots off', () => {
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

test('the legacy sound cookie is expired at load', () => {
  const box = loadSandbox('darya_sound=1', () => Promise.resolve());
  try {
    // The module must remove the old persistence cookie so the stale
    // value cannot linger and confuse a later reinstall.
    assert.ok(
      !box.fakeDocument.cookie.includes('darya_sound=1'),
      `legacy cookie should be expired, got: ${box.fakeDocument.cookie}`
    );
    assert.equal(box.ambient.enabled, false);
  } finally {
    box.restore();
  }
});

test('an absent legacy cookie is left untouched at load', () => {
  const box = loadSandbox('theme=ocean', () => Promise.resolve());
  try {
    // Expiry must not fabricate the cookie: without a legacy sound
    // cookie present, the cookie string is left exactly as it was.
    assert.equal(box.fakeDocument.cookie, 'theme=ocean');
    assert.equal(box.ambient.enabled, false);
  } finally {
    box.restore();
  }
});

/**
 * Loads the module with a fake document and a fake Audio whose play()
 * behaves according to the given behavior.
 * @param {string} cookie - A legacy document.cookie to expose (unused for state)
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
  for (const { filename, code } of SCRIPTS) {
    vm.runInThisContext(code, { filename });
  }
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

test('a toggle click starts playback', async () => {
  const box = loadSandbox('', function (audio) {
    audio.paused = false;
    audio.readyState = 4;
    return Promise.resolve();
  });
  try {
    const result = await box.ambient.toggle();
    assert.equal(result, true);
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), true);
  } finally {
    box.restore();
  }
});

test('a second toggle click stops playback', async () => {
  const box = loadSandbox('', function (audio) {
    audio.paused = false;
    audio.readyState = 4;
    return Promise.resolve();
  });
  try {
    assert.equal(await box.ambient.toggle(), true);
    // Wait out the rapid-click guard (armed through the volume fade-in)
    // so the second click is a fresh toggle instead of joining the first.
    await new Promise((resolve) => setTimeout(resolve, 850));
    const stopped = await box.ambient.toggle();
    assert.equal(stopped, false);
    assert.equal(box.ambient.enabled, false);
    assert.equal(box.ambient.isPlaying(), false);
  } finally {
    box.restore();
  }
});

test('toggle keeps in-memory intent when playback is policy-blocked', async () => {
  const box = loadSandbox('', () => Promise.reject(notAllowedError()));
  try {
    const result = await box.ambient.toggle();
    // A NotAllowedError is not a load failure: the module keeps its
    // enabled intent for the session (a later toggle click can retry)
    // and never writes any persistence state.
    assert.equal(result, true);
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), false);
    assert.ok(
      !box.fakeDocument.cookie.includes('darya_sound=1') &&
        !box.fakeDocument.cookie.includes('darya_sound=0'),
      'no state cookie may be written'
    );
  } finally {
    box.restore();
  }
});

test('a genuine load failure rolls back to disabled without persisting', async () => {
  const box = loadSandbox('', () =>
    Promise.reject(
      Object.assign(new Error('decode failed'), { name: 'TypeError' })
    )
  );
  try {
    const result = await box.ambient.toggle();
    assert.equal(result, false);
    assert.equal(box.ambient.enabled, false);
    assert.ok(
      !box.fakeDocument.cookie.includes('darya_sound=1') &&
        !box.fakeDocument.cookie.includes('darya_sound=0'),
      'no state cookie may be written'
    );
  } finally {
    box.restore();
  }
});

test('tab hiding aborts an in-flight play attempt promptly', async () => {
  // If play() never settles (a throttled media load in a hidden tab),
  // the visibility handler must abort the attempt right away instead of
  // waiting for the 15s safety timeout. The abort is transient: the
  // user's in-memory intent is kept.
  const box = loadSandbox('', () => new Promise(() => {}));
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
    assert.equal(box.instances.length, 1);
  } finally {
    box.restore();
  }
});

test('tab becoming visible resumes audio that was playing before hiding', async () => {
  // Pausing on hide and resuming on show only continues audio the user
  // already started with a toggle click; it never starts new audio.
  const box = loadSandbox('', function (audio) {
    audio.paused = false;
    audio.readyState = 4;
    return Promise.resolve();
  });
  try {
    await box.ambient.toggle();
    assert.equal(box.ambient.isPlaying(), true);

    box.fakeDocument.hidden = true;
    box.handlers.visibilitychange();
    assert.equal(
      box.instances[0].paused,
      true,
      'audio pauses when the tab hides'
    );

    box.fakeDocument.hidden = false;
    box.handlers.visibilitychange();
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(
      box.ambient.isPlaying(),
      true,
      'audio resumes when the tab returns'
    );
    assert.equal(box.instances.length, 1, 'no second Audio element spawned');
  } finally {
    box.restore();
  }
});

test('tab becoming visible never auto-starts silent sound', async () => {
  // If a transient failure left the intent enabled but nothing playing,
  // returning to the tab must NOT retry playback on its own: sound only
  // starts after a toggle click.
  const box = loadSandbox('', () => Promise.reject(notAllowedError()));
  try {
    const result = await box.ambient.toggle();
    assert.equal(result, true);
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), false);
    assert.equal(box.instances.length, 1);

    box.fakeDocument.hidden = false;
    box.handlers.visibilitychange();
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.equal(
      box.instances.length,
      1,
      'tab return must not auto-start playback'
    );
    assert.equal(box.ambient.enabled, true);
    assert.equal(box.ambient.isPlaying(), false);
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
  const box = loadSandbox('', function (audio) {
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
  } finally {
    box.restore();
  }
});

test('rapid toggle clicks share one in-flight start', async () => {
  // A double-click (or the picker and menu buttons pressed together)
  // must collapse into one toggle operation: the pendingToggle guard
  // joins the running start instead of spawning a second Audio element
  // and interleaving an enable/disable cycle.
  const box = loadSandbox('', function (audio) {
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
  const box = loadSandbox('', function (audio) {
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
  const box = loadSandbox('', function (audio) {
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

test('transient failures never count toward the failure cap', async () => {
  // Timeouts, tab-hidden aborts, and autoplay-policy rejections are not
  // file problems: they must not accumulate into the permanent-disable
  // cap, or a slow network could brick the toggle after a few tries.
  let failuresLeft = 5;
  const box = loadSandbox('', function (audio) {
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
  const box = loadSandbox('', () => new Promise(() => {}));
  try {
    const toggling = box.ambient.toggle();
    // Let the microtask chain reach playThemeSound and register the
    // in-flight attempt before switching the theme.
    await new Promise((resolve) => setTimeout(resolve, 5));
    box.ambient.onThemeChange('beach');
    const result = await toggling;
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

test('the third consecutive failed toggle engages the synthesized fallback', async () => {
  // Genuine failures accumulate across toggles (the counter is not reset
  // on every click). On the third failure the module must switch to the
  // synthesized ambient instead of silently rolling back, and a further
  // toggle-off must stop it cleanly.
  const originalAudioContext = globalThis.AudioContext;
  const originalWindow = globalThis.window;
  let failuresLeft = 3;
  try {
    const box = loadSandbox('', function (audio) {
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
