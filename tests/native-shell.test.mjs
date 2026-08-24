/**
 * Tests for the native shell integration layer (js/app/native.js) and
 * the export flow's native branch (js/ui/export.js).
 *
 * Background: the Android app bundles the same web bundle in a
 * Capacitor WebView, where two browser assumptions break.
 *   1. The WebView has no download machinery, so the blob-anchor
 *      export is a silent no-op; the native Export plugin must be used
 *      instead, with a clipboard fallback so the button never does
 *      nothing.
 *   2. A service worker registration left by an earlier build keeps
 *      serving the previous app shell after an app update, freezing
 *      the app on the old UI until the app data is cleared. In the
 *      native shell the worker must never be registered, and leftover
 *      registrations and caches must be retired.
 *
 * Both classic scripts are loaded into a fresh vm context with stubbed
 * globals, mirroring how the website loads them in a browser.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const read = (file) => readFileSync(path.join(ROOT, file), 'utf8');
const load = (file) => read(file);

/** Lets vm-context promise chains settle before assertions. */
const flushMicrotasks = async () => {
  for (let i = 0; i < 5; i += 1) {
    await new Promise((resolve) => {
      setTimeout(resolve, 5);
    });
  }
};

/**
 * Builds a sandbox with the browser globals the modules touch, plus
 * recorders for the interactions under test.
 * @param {object} overrides - Extra or replaced sandbox properties
 * @returns {{ sandbox: object, records: object }}
 */
function buildSandbox(overrides = {}) {
  const records = {
    exportCalls: [],
    notifications: [],
    unregistered: [],
    deletedCaches: [],
    createdObjectUrls: [],
    anchorClicks: [],
    clipboardWrites: [],
    execCommands: []
  };
  const sandbox = {
    console,
    // The native layer arms and disarms a timeout around the plugin
    // call, so both timers must be present like in a real WebView.
    setTimeout,
    clearTimeout,
    Intl,
    Blob,
    navigator: {},
    URL: {
      createObjectURL(blob) {
        records.createdObjectUrls.push(blob);
        return 'blob:stub-' + records.createdObjectUrls.length;
      },
      revokeObjectURL() {
        /* recorder not needed: revocation is best-effort cleanup */
      }
    },
    document: {
      createElement() {
        const node = {
          style: {},
          parentNode: null,
          value: '',
          // The clipboard fallback's hidden textarea calls select();
          // the stub answers so the path runs instead of throwing.
          select() {
            /* selection is a no-op in the sandbox */
          },
          click() {
            records.anchorClicks.push({
              href: node.href,
              download: node.download
            });
          }
        };
        return node;
      },
      // The legacy clipboard path's success/failure switch. It fails by
      // default (the "both fail" case); a test that wants the fallback
      // to succeed overrides it to return true.
      execCommand(command) {
        records.execCommands.push(command);
        return false;
      },
      body: {
        appendChild(node) {
          node.parentNode = this;
        },
        removeChild(node) {
          node.parentNode = null;
        }
      }
    },
    Capacitor: {
      isNativePlatform: () => true,
      Plugins: {
        Export: {
          saveTranscript(options) {
            records.exportCalls.push(options);
            return Promise.resolve({
              uri: 'content://stub',
              location: 'downloads'
            });
          }
        }
      }
    },
    DaryaUI: {
      state: {
        lang: {
          code: 'en',
          botName: 'Darya',
          ui: {
            exportTitle: 'Conversation with Darya',
            exportYouLabel: 'You',
            exportDivider: '-----------------------------',
            exportSavedNotice: 'saved-to-downloads-notice',
            exportSavedAppFilesNotice: 'saved-to-app-files-notice',
            exportCopiedNotice: 'copied-notice',
            exportFailedNotice: 'failed-notice',
            dateLocale: 'en-US'
          }
        },
        transcript: [
          { sender: 'user', time: '10:00', text: 'hello there' },
          { sender: 'bot', time: '10:01', text: 'hi, I am Darya' }
        ]
      }
    },
    DaryaOverlays: {
      showNotification(severity, message) {
        records.notifications.push({ severity, message });
      }
    },
    ...overrides
  };
  sandbox.records = records;
  return { sandbox, records };
}

/**
 * Loads native.js and export.js into the given sandbox.
 * @param {object} sandbox - vm sandbox from buildSandbox
 */
function loadExportModules(sandbox) {
  const context = vm.createContext(sandbox);
  vm.runInContext(load('js/app/native.js'), context, {
    filename: 'js/app/native.js'
  });
  vm.runInContext(load('js/ui/export.js'), context, {
    filename: 'js/ui/export.js'
  });
  return context;
}

// ======================================================================
// Native detection
// ======================================================================

test('isNativeApp is false without the Capacitor bridge', () => {
  const { sandbox } = buildSandbox();
  delete sandbox.Capacitor;
  const context = vm.createContext(sandbox);
  vm.runInContext(load('js/app/native.js'), context, {
    filename: 'js/app/native.js'
  });
  assert.equal(sandbox.DaryaNative.isNativeApp(), false);
});

test('isNativeApp is true when the injected bridge says so', () => {
  const { sandbox } = buildSandbox();
  const context = vm.createContext(sandbox);
  vm.runInContext(load('js/app/native.js'), context, {
    filename: 'js/app/native.js'
  });
  assert.equal(sandbox.DaryaNative.isNativeApp(), true);
});

// ======================================================================
// Saving through the native plugin
// ======================================================================

test('saveTextFile routes the transcript through the Export plugin', async () => {
  const { sandbox, records } = buildSandbox();
  loadExportModules(sandbox);
  await sandbox.DaryaNative.saveTextFile('chat.txt', 'hello');
  assert.equal(records.exportCalls.length, 1);
  // Compared field by field: the options object was created inside the
  // vm context, so its prototype differs from the host's.
  assert.equal(records.exportCalls[0].filename, 'chat.txt');
  assert.equal(records.exportCalls[0].content, 'hello');
});

test('saveTextFile reports the app-files location on older devices', async () => {
  const { sandbox } = buildSandbox();
  sandbox.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      Export: {
        saveTranscript: () =>
          Promise.resolve({ uri: 'file:///stub', location: 'app-files' })
      }
    }
  };
  loadExportModules(sandbox);
  const location = await sandbox.DaryaNative.saveTextFile('a.txt', 'x');
  assert.equal(location, 'app-files');
});

test('saveTextFile rejects when the plugin is unavailable', async () => {
  const { sandbox } = buildSandbox();
  sandbox.Capacitor = { isNativePlatform: () => true, Plugins: {} };
  loadExportModules(sandbox);
  await assert.rejects(
    () => sandbox.DaryaNative.saveTextFile('a.txt', 'x'),
    /Export plugin unavailable/u
  );
});

test('saveTextFile rejects when the plugin call never settles', async () => {
  const { sandbox } = buildSandbox();
  sandbox.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      Export: {
        // A wedged bridge (interrupted page transition, dropped
        // response): the promise never settles. Without the timeout
        // guard the export button would hang forever with no feedback.
        saveTranscript: () => new Promise(() => {})
      }
    }
  };
  loadExportModules(sandbox);
  await assert.rejects(
    () => sandbox.DaryaNative.saveTextFile('a.txt', 'x', { timeout: 20 }),
    /Timed out waiting for the export plugin/u
  );
});

// ======================================================================
// Retiring the service worker and shell caches natively
// ======================================================================

test('retireWebCaches unregisters workers and deletes only darya caches', async () => {
  const { sandbox, records } = buildSandbox();
  const unregister = () => {
    records.unregistered.push(true);
    return Promise.resolve(true);
  };
  const deleted = new Set();
  sandbox.navigator = {
    serviceWorker: {
      getRegistrations: () => Promise.resolve([{ unregister }, { unregister }])
    }
  };
  sandbox.caches = {
    keys: () =>
      Promise.resolve([
        'darya-cache-v1.9.1',
        'darya-static-v3',
        'someone-elses-cache'
      ]),
    delete(name) {
      deleted.add(name);
      return Promise.resolve(true);
    }
  };
  const context = vm.createContext(sandbox);
  vm.runInContext(load('js/app/native.js'), context, {
    filename: 'js/app/native.js'
  });
  await sandbox.DaryaNative.retireWebCaches();
  assert.equal(records.unregistered.length, 2);
  assert.deepEqual([...deleted].sort(), [
    'darya-cache-v1.9.1',
    'darya-static-v3'
  ]);
});

test('retireWebCaches is a no-op without worker or cache APIs', async () => {
  const { sandbox } = buildSandbox({ navigator: {}, caches: undefined });
  const context = vm.createContext(sandbox);
  vm.runInContext(load('js/app/native.js'), context, {
    filename: 'js/app/native.js'
  });
  await sandbox.DaryaNative.retireWebCaches();
});

// ======================================================================
// The export flow in the native shell
// ======================================================================

test('export in the native shell saves via the plugin and notifies', async () => {
  const { sandbox, records } = buildSandbox();
  loadExportModules(sandbox);
  sandbox.DaryaExport.exportPlainText();
  await flushMicrotasks();
  assert.equal(records.exportCalls.length, 1);
  assert.match(records.exportCalls[0].filename, /^darya-chat-en-/u);
  assert.ok(
    records.exportCalls[0].content.includes('hello there'),
    'the transcript text must be exported'
  );
  // The blob-anchor path must not run in the native shell.
  assert.equal(records.createdObjectUrls.length, 0);
  assert.equal(records.anchorClicks.length, 0);
  assert.deepEqual(records.notifications, [
    { severity: 'info', message: 'saved-to-downloads-notice' }
  ]);
});

test('export in the native shell notifies the app-files location', async () => {
  const { sandbox, records } = buildSandbox();
  sandbox.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      Export: {
        saveTranscript: () =>
          Promise.resolve({ uri: 'file:///stub', location: 'app-files' })
      }
    }
  };
  loadExportModules(sandbox);
  sandbox.DaryaExport.exportPlainText();
  await flushMicrotasks();
  assert.deepEqual(records.notifications, [
    { severity: 'info', message: 'saved-to-app-files-notice' }
  ]);
});

test('export falls back to the clipboard when the plugin write fails', async () => {
  const { sandbox, records } = buildSandbox();
  sandbox.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      Export: {
        saveTranscript: () => Promise.reject(new Error('disk full'))
      }
    }
  };
  sandbox.navigator = {
    clipboard: {
      writeText(text) {
        records.clipboardWrites.push(text);
        return Promise.resolve();
      }
    }
  };
  loadExportModules(sandbox);
  sandbox.DaryaExport.exportPlainText();
  await flushMicrotasks();
  assert.equal(records.exportCalls.length, 0);
  assert.equal(records.clipboardWrites.length, 1);
  assert.ok(records.clipboardWrites[0].includes('hello there'));
  assert.deepEqual(records.notifications, [
    { severity: 'info', message: 'copied-notice' }
  ]);
});

test('export copies via execCommand when the async clipboard API rejects', async () => {
  const { sandbox, records } = buildSandbox();
  sandbox.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      Export: {
        saveTranscript: () => Promise.reject(new Error('disk full'))
      }
    }
  };
  // The Android WebView shape of the bug: the async Clipboard API is
  // present but its writeText rejects (focus or permission quirk). The
  // legacy execCommand path must still get its turn.
  sandbox.navigator = {
    clipboard: {
      writeText: () => Promise.reject(new Error('clipboard blocked'))
    }
  };
  sandbox.document.execCommand = function (command) {
    records.execCommands.push(command);
    return true;
  };
  loadExportModules(sandbox);
  sandbox.DaryaExport.exportPlainText();
  await flushMicrotasks();
  assert.deepEqual(records.execCommands, ['copy']);
  assert.deepEqual(records.notifications, [
    { severity: 'info', message: 'copied-notice' }
  ]);
});

test('export reports failure when saving and copying both fail', async () => {
  const { sandbox, records } = buildSandbox();
  sandbox.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      Export: {
        saveTranscript: () => Promise.reject(new Error('disk full'))
      }
    }
  };
  sandbox.navigator = {
    clipboard: {
      writeText: () => Promise.reject(new Error('clipboard blocked'))
    }
  };
  loadExportModules(sandbox);
  sandbox.DaryaExport.exportPlainText();
  await flushMicrotasks();
  assert.deepEqual(records.notifications, [
    { severity: 'error', message: 'failed-notice' }
  ]);
});

// ======================================================================
// The export flow in a plain browser stays on the blob-anchor path
// ======================================================================

test('export in a browser keeps the blob-anchor download', async () => {
  const { sandbox, records } = buildSandbox();
  delete sandbox.Capacitor;
  loadExportModules(sandbox);
  sandbox.DaryaExport.exportPlainText();
  await flushMicrotasks();
  assert.equal(records.exportCalls.length, 0);
  assert.equal(records.createdObjectUrls.length, 1);
  assert.equal(records.anchorClicks.length, 1);
  assert.match(records.anchorClicks[0].download, /^darya-chat-en-/u);
  assert.match(records.anchorClicks[0].href, /^blob:stub-/u);
});

// ======================================================================
// The native shell and the app sources stay wired together
// ======================================================================

test('MainActivity registers the export plugin and retires stale caches', () => {
  const main = read(
    'android/app/src/main/java/com/darya/companion/MainActivity.java'
  );
  assert.match(main, /registerPlugin\(ExportPlugin\.class\)/u);
  assert.match(main, /evaluateJavascript\(RETIRE_WEB_CACHES_SCRIPT/u);
  // The injected snippet must target the app-owned cache name prefixes
  // from sw.js and drop leftover worker registrations.
  const snippet = main.match(/RETIRE_WEB_CACHES_SCRIPT =[\s\S]*?";/u);
  assert.ok(snippet, 'the retirement script constant must exist');
  assert.match(snippet[0], /darya-cache-/u);
  assert.match(snippet[0], /darya-static-/u);
  assert.match(snippet[0], /unregister\(\)/u);
});

test('ExportPlugin writes to MediaStore downloads without a storage permission', () => {
  const plugin = read(
    'android/app/src/main/java/com/darya/companion/ExportPlugin.java'
  );
  assert.match(plugin, /MediaStore\.Downloads\.EXTERNAL_CONTENT_URI/u);
  assert.match(plugin, /DIRECTORY_DOWNLOADS/u);
  assert.match(plugin, /@CapacitorPlugin\(name = "Export"\)/u);
  assert.doesNotMatch(
    plugin,
    /WRITE_EXTERNAL_STORAGE/u,
    'the plugin must not depend on the legacy storage permission'
  );
});

test('ExportPlugin falls back to the app directory and logs when MediaStore fails', () => {
  const plugin = read(
    'android/app/src/main/java/com/darya/companion/ExportPlugin.java'
  );
  // The app-owned directory is the second-chance target on every API
  // level, so a flaky Downloads provider cannot make the export fail.
  assert.match(
    plugin,
    /getExternalFilesDir\(Environment\.DIRECTORY_DOWNLOADS\)/u
  );
  // The fallback and the final failure must be observable in logcat
  // (adb logcat -s DaryaExport) so a misbehaving device can be
  // diagnosed without guessing. Whitespace is allowed between the call
  // and the tag because the formatter wraps long argument lists.
  assert.match(plugin, /Log\.w\(\s*LOG_TAG/u);
  assert.match(plugin, /Log\.e\(\s*LOG_TAG/u);
  // The final catch must be broad enough that no unexpected exception
  // escapes the task thread, where it would crash the app and leave the
  // web promise hanging forever.
  assert.match(plugin, /catch \(Exception e\)/u);
});

test('app boot never registers the service worker in the native shell', () => {
  const boot = read('js/app/index.js');
  // The native check must gate the registration branch: in the shell
  // the APK serves the app itself, and a registered worker from an
  // earlier build would freeze the app on the old shell.
  const gate = boot.match(
    /if \(\s*DaryaNative &&[\s\S]*?DaryaNative\.isNativeApp\(\)\s*\) \{\s*DaryaNative\.retireWebCaches\(\);/
  );
  assert.ok(
    gate,
    'boot must retire web caches instead of registering the worker natively'
  );
  const gateEnd = boot.indexOf(gate[0]) + gate[0].length;
  const registerIndex = boot.indexOf(
    'navigator.serviceWorker.register',
    gateEnd
  );
  const gateElse = boot.indexOf('} else if (', gateEnd);
  assert.ok(
    registerIndex > gateElse && gateElse !== -1,
    'worker registration must live in the non-native else branch'
  );
});
