/**
 * Darya - shell update delivery (part file).
 *
 * The service worker is cache-first, so a returning visitor keeps the
 * previously precached shell until the browser notices a changed
 * sw.js, reinstalls the worker, and the page loads again. Browsers
 * only re-check the worker on navigation (and may throttle even
 * those), which left long-lived tabs and embedded previews serving a
 * stale shell long after a deploy.
 *
 * This part closes the delivery gap from the page side: whenever the
 * tab becomes visible it asks the browser to re-check the worker
 * immediately, and when a freshly installed worker takes control the
 * page reloads itself at a safe moment (the start picker, never in
 * the middle of a conversation, and at most once per tab session), so
 * the user lands on the new shell without a manual double reload.
 */
(function (global) {
  'use strict';

  /** sessionStorage key guarding against reload loops: written right
   * before an update reload so a later controllerchange in the same
   * tab session can never trigger a second one. */
  var UPDATE_RELOAD_KEY = 'darya_update_reload';

  /**
   * Creates the update-delivery functions.
   * @param {object} ctrl - Shared controller state (see index.js)
   * @returns {object} Update-check functions
   */
  function createUpdate(ctrl) {
    var st = ctrl.st;

    /** True when this page load was already controlled by a worker,
     * which distinguishes a real update (old worker replaced) from a
     * first-ever install; only the former ever warrants a reload. */
    var hadController =
      'serviceWorker' in global.navigator &&
      Boolean(global.navigator.serviceWorker.controller);

    /**
     * A reload is safe only before a conversation starts (the picker
     * holds no user state) and at most once per tab session.
     * @returns {boolean}
     */
    function safeToReload() {
      var alreadyReloaded = false;
      try {
        alreadyReloaded =
          global.sessionStorage.getItem(UPDATE_RELOAD_KEY) === '1';
      } catch (e) {
        /* storage blocked: the guard is best-effort */
      }
      return !st.chatActive && !alreadyReloaded;
    }

    /**
     * Asks the browser to re-check sw.js right now instead of waiting
     * for the next navigation. Silent no-op where workers are
     * unsupported (file://, older browsers).
     */
    function checkForUpdate() {
      if (!('serviceWorker' in global.navigator)) {
        return;
      }
      global.navigator.serviceWorker
        .getRegistration()
        .then(function (registration) {
          if (registration) {
            registration.update().catch(function () {
              /* offline or blocked: the next navigation retries */
            });
          }
        })
        .catch(function () {
          /* no registration yet: nothing to update */
        });
    }

    if ('serviceWorker' in global.navigator) {
      global.navigator.serviceWorker.addEventListener(
        'controllerchange',
        function () {
          if (hadController && safeToReload()) {
            try {
              global.sessionStorage.setItem(UPDATE_RELOAD_KEY, '1');
            } catch (e) {
              /* best-effort guard */
            }
            global.location.reload();
          }
        }
      );

      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
          checkForUpdate();
        }
      });
    }

    return { checkForUpdate: checkForUpdate };
  }

  global.DaryaAppUpdate = {
    create: createUpdate
  };
})(window);
