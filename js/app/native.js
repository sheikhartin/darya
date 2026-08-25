/**
 * Darya - native shell integration (part file).
 *
 * The Android app ships this same web bundle inside a Capacitor
 * WebView, and that environment differs from a browser in two ways
 * this module encapsulates:
 *
 *   - Saving files. The Android WebView has no download machinery at
 *     all: an anchor with a blob URL and a download attribute (the
 *     website's export path) is a silent no-op there. The Export
 *     plugin registered by the Android project
 *     (android/app/src/main/java/com/darya/companion/ExportPlugin.java)
 *     writes the transcript into the system Downloads folder through
 *     MediaStore instead, which needs no storage permission.
 *
 *   - The service worker. Inside the APK every asset already ships in
 *     the package, so the worker adds nothing but risk: a registration
 *     left behind by an earlier build keeps serving the previous app
 *     shell from Cache Storage after an app update, freezing the UI on
 *     the old version until the whole app data is cleared. In the
 *     native shell the worker is therefore never registered, and any
 *     leftovers from an earlier build are retired instead.
 *
 * Capacitor injects window.Capacitor (with isNativePlatform and a
 * Plugins namespace of callable method proxies) into every page before
 * app scripts run, so detection needs no extra script or plugin on the
 * web side.
 */
(function (global) {
  'use strict';

  /** Capacitor plugin id of the Android-side export plugin. */
  var EXPORT_PLUGIN_NAME = 'Export';

  /** Capacitor plugin id of the Android shell plugin (back button). */
  var SHELL_PLUGIN_NAME = 'Shell';

  /** Event the shell plugin emits when back is pressed or swiped. */
  var BACK_BUTTON_EVENT = 'backButton';

  /** Save locations reported by the plugin (see ExportPlugin.java). */
  var SAVE_LOCATION_DOWNLOADS = 'downloads';
  var SAVE_LOCATION_APP_FILES = 'app-files';

  /**
   * How long to wait for the export plugin before treating the call as
   * lost and letting the web layer fall back to the clipboard. The
   * plugin settles in milliseconds; the guard only covers a wedged
   * bridge (an interrupted page transition, a dropped response) so the
   * export button can never hang silently.
   */
  var SAVE_TIMEOUT_MS = 20000;

  /**
   * Cache name prefixes owned by this app's service worker (see
   * sw.js). MainActivity.java injects its own retirement snippet for
   * stuck builds; the prefixes there must match these.
   */
  var SHELL_CACHE_PREFIX = 'darya-cache-';
  var STATIC_CACHE_PREFIX = 'darya-static-';

  /**
   * True when the page runs inside the native Android shell rather
   * than a browser. Defensive against the injected bridge not being
   * present yet (or at all, on the website).
   * @returns {boolean}
   */
  function isNativeApp() {
    var cap = global.Capacitor;
    return Boolean(
      cap &&
      typeof cap.isNativePlatform === 'function' &&
      cap.isNativePlatform()
    );
  }

  /**
   * The export plugin's method proxies, or null when unavailable (a
   * browser, or an APK built before the plugin existed).
   * @returns {object|null}
   */
  function exportPlugin() {
    if (!isNativeApp()) {
      return null;
    }
    var plugins = global.Capacitor.Plugins;
    return plugins && plugins[EXPORT_PLUGIN_NAME]
      ? plugins[EXPORT_PLUGIN_NAME]
      : null;
  }

  /**
   * Saves a text file through the native export plugin.
   * @param {string} filename - Download filename
   * @param {string} content - UTF-8 text to save
   * @param {object} [options] - { timeout: milliseconds to wait for the
   * plugin before rejecting (defaults to SAVE_TIMEOUT_MS). Tests pass a
   * short value to exercise the timeout path without sleeping.
   * @returns {Promise<string>} Where the file landed: 'downloads' (the
   * system Downloads folder) or 'app-files' (an app-owned folder).
   * Rejects when the plugin is unavailable, the write fails, or the
   * call does not settle within the timeout.
   */
  function saveTextFile(filename, content, options) {
    var plugin = exportPlugin();
    if (!plugin || typeof plugin.saveTranscript !== 'function') {
      return Promise.reject(new Error('Export plugin unavailable'));
    }
    var timeout =
      options && typeof options.timeout === 'number' && options.timeout > 0
        ? options.timeout
        : SAVE_TIMEOUT_MS;
    var timer = null;
    var guard = new Promise(function (resolve, reject) {
      timer = setTimeout(function () {
        reject(new Error('Timed out waiting for the export plugin'));
      }, timeout);
    });
    // Promise.resolve().then keeps a synchronous throw from the plugin
    // proxy (a torn-down bridge) inside the promise chain, so every
    // failure shape reaches the caller as a rejection.
    var pluginCall = Promise.resolve().then(function () {
      return plugin.saveTranscript({ filename: filename, content: content });
    });
    return Promise.race([pluginCall, guard]).then(
      function (result) {
        clearTimeout(timer);
        return result && result.location === SAVE_LOCATION_APP_FILES
          ? SAVE_LOCATION_APP_FILES
          : SAVE_LOCATION_DOWNLOADS;
      },
      function (error) {
        clearTimeout(timer);
        throw error;
      }
    );
  }

  /**
   * The shell plugin's method proxies, or null when unavailable (a
   * browser, or an APK built before the plugin existed).
   * @returns {object|null}
   */
  function shellPlugin() {
    if (!isNativeApp()) {
      return null;
    }
    var plugins = global.Capacitor.Plugins;
    return plugins && plugins[SHELL_PLUGIN_NAME]
      ? plugins[SHELL_PLUGIN_NAME]
      : null;
  }

  /**
   * Subscribes to the hardware back button inside the native shell.
   * The web layer then owns the press: back dismisses the topmost
   * surface before ever considering leaving the app. Silent no-op in a
   * browser, where the platform back semantics stay untouched.
   * @param {function(): void} handler - Runs on every back press
   */
  function onHardwareBack(handler) {
    var plugin = shellPlugin();
    if (plugin && typeof plugin.addListener === 'function') {
      plugin.addListener(BACK_BUTTON_EVENT, handler);
    }
  }

  /**
   * Leaves the native app the way the platform back gesture does on a
   * top screen: back to the user's home screen. No-op in a browser.
   */
  function leaveApp() {
    var plugin = shellPlugin();
    if (plugin && typeof plugin.exitApp === 'function') {
      plugin.exitApp();
    }
  }

  /**
   * Retires the web app's service worker and shell caches. Used in the
   * native shell, where the APK serves the whole app and a leftover
   * worker from an earlier build could keep showing the previous
   * version. Silent no-op where the relevant APIs are unavailable.
   * @returns {Promise<void>}
   */
  function retireWebCaches() {
    var jobs = [];
    if ('serviceWorker' in global.navigator) {
      jobs.push(
        global.navigator.serviceWorker
          .getRegistrations()
          .then(function (registrations) {
            return Promise.all(
              registrations.map(function (registration) {
                return registration.unregister();
              })
            );
          })
      );
    }
    if (global.caches) {
      jobs.push(
        global.caches.keys().then(function (keys) {
          return Promise.all(
            keys
              .filter(function (key) {
                return (
                  key.indexOf(SHELL_CACHE_PREFIX) === 0 ||
                  key.indexOf(STATIC_CACHE_PREFIX) === 0
                );
              })
              .map(function (key) {
                return global.caches.delete(key);
              })
          );
        })
      );
    }
    return Promise.all(jobs).then(function () {
      /* nothing to return; the retirement is best-effort */
    });
  }

  const DaryaNative = {
    isNativeApp,
    saveTextFile,
    onHardwareBack,
    leaveApp,
    retireWebCaches
  };

  global.DaryaNative = DaryaNative;
})(typeof window !== 'undefined' ? window : globalThis);
