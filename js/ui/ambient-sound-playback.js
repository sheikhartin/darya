/**
 * Darya - ambient sound playback engine.
 * Part file: provides the stateful playback functions (manifest loading,
 * file selection, synthesized fallback, and theme playback) as a factory
 * bound to the shared state object created by ambient-sound.js.
 *
 * The functions here are the only ones that mutate the module's playback
 * state, so they live apart from the state declarations and the public
 * API. Everything they need comes from three places:
 *   - `state`: the shared state object passed in by the main module
 *   - D (global.DaryaAmbientSoundData): constants and stateless utilities
 *   - H (global.DaryaAmbientSoundHelpers): stateless audio helpers
 */
(function (global) {
  'use strict';

  const D = global.DaryaAmbientSoundData;
  const H = global.DaryaAmbientSoundHelpers;

  /**
   * Binds the playback functions to a shared state object. The main
   * module owns the object, so both modules read and write the same
   * module-level values (current audio, theme, failure counters, etc.).
   * @param {object} state - Shared module state (see ambient-sound.js)
   * @returns {{loadManifest: Function, getRandomSound: Function,
   *   destroySynthesized: Function, stopCurrent: Function,
   *   startSynthesizedFallback: Function, playThemeSound: Function}}
   */
  function createPlayback(state) {
    // ====================================================================
    // Manifest loader
    // ====================================================================

    /**
     * Fetches and caches the sound manifest. When the primary manifest
     * cannot be fetched (CORS error from file:// protocol, network issue,
     * or missing file), the fallback manifest is used instead so ambient
     * sounds remain functional even when the page is opened directly from
     * the filesystem.
     *
     * Validates that the manifest is a well-formed object with the expected
     * theme keys before accepting it.
     * Returns true on success, false on failure.
     * @returns {Promise<boolean>}
     */
    function loadManifest() {
      // Return cached manifest if already loaded successfully
      if (state.manifest) {
        return Promise.resolve(true);
      }

      // When opened from file:// protocol, skip fetch entirely and use
      // the fallback manifest to avoid CORS errors in the console.
      if (D.isFileProtocol()) {
        state.manifest = D.FALLBACK_MANIFEST;
        return Promise.resolve(true);
      }

      var fetchPromise;
      try {
        fetchPromise = fetch(D.MANIFEST_PATH);
      } catch (e) {
        // fetch() may throw in environments where it is not available
        // (e.g. certain testing environments or older browsers).
        return useFallbackManifest('fetch not available');
      }

      return fetchPromise
        .then(function (response) {
          if (!response.ok) {
            throw new Error(
              'HTTP ' + response.status + ' for ' + D.MANIFEST_PATH
            );
          }
          return response.json();
        })
        .then(function (data) {
          // Validate that the manifest is a non-null object
          if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Manifest is not a valid object');
          }
          // Validate that all expected theme keys exist and contain arrays
          for (var t = 0; t < D.EXPECTED_MANIFEST_THEMES.length; t += 1) {
            var themeKey = D.EXPECTED_MANIFEST_THEMES[t];
            if (!Array.isArray(data[themeKey])) {
              throw new Error(
                'Manifest missing array for theme "' + themeKey + '"'
              );
            }
          }
          state.manifest = data;
          state.consecutiveFailures = 0;
          return true;
        })
        .catch(function (err) {
          // Fetch failed (CORS, network error, HTTP error, or invalid format)
          return useFallbackManifest(err.message);
        });

      /**
       * Falls back to the inline manifest when fetching fails.
       * Logs a single informative warning on the first failure.
       * @param {string} reason - The error message from the failed fetch
       * @returns {boolean} Always returns true (fallback is always valid)
       */
      function useFallbackManifest(reason) {
        if (!state.manifest) {
          console.warn(
            'Darya ambient sound: using fallback manifest (' + reason + ')'
          );
          state.manifest = {
            beach: D.FALLBACK_MANIFEST.beach.slice(),
            ocean: D.FALLBACK_MANIFEST.ocean.slice()
          };
        }
        return true;
      }
    }

    // ====================================================================
    // File selection
    // ====================================================================

    /**
     * Returns a random sound file path for the given theme, or null if none
     * are available. Uses the manifest for discovery so no filenames are
     * hardcoded. Avoids replaying the same file consecutively when there
     * are alternative files available.
     * @param {string} theme - 'ocean' or 'beach'
     * @returns {string|null}
     */
    function getRandomSound(theme) {
      // Resolve the file list for the theme. Prefer the loaded manifest;
      // if it is not ready yet (rare: a toggle within milliseconds of page
      // load), fall back to the synchronous fallback manifest so playback
      // can still start within the user-gesture window without waiting on
      // the network fetch.
      var files =
        state.manifest && Array.isArray(state.manifest[theme])
          ? state.manifest[theme]
          : D.FALLBACK_MANIFEST[theme];

      if (!Array.isArray(files) || files.length === 0) {
        return null;
      }

      var index = Math.floor(Math.random() * files.length);
      var file = files[index];
      var filePath = D.SOUND_BASE_PATH + '/' + theme + '/' + file;

      // If we'd play the same file as last time and there are alternatives,
      // pick the next one to add variety.
      if (filePath === state.lastPlayedPath && files.length > 1) {
        var nextIndex = (index + 1) % files.length;
        filePath = D.SOUND_BASE_PATH + '/' + theme + '/' + files[nextIndex];
      }

      return filePath;
    }

    // ====================================================================
    // Audio lifecycle
    // ====================================================================

    /**
     * Stops the synthesized ambient controller if one is active.
     * Resets the fallback flag so the system can retry file playback.
     */
    function destroySynthesized() {
      if (state.synthesizedController) {
        try {
          state.synthesizedController.stop();
        } catch (e) {
          // AudioContext.close() may throw if already closed.
        }
        state.synthesizedController = null;
      }
      state.isUsingFallback = false;
    }

    /**
     * Stops the current audio with a quick fade (~300ms) and cleans up.
     * Resets the failure counter since the stop was intentional.
     * Also stops the synthesized fallback if one is active.
     * @returns {Promise<void>}
     */
    function stopCurrent() {
      // If using synthesized fallback, stop it instead of file audio
      if (state.isUsingFallback && state.synthesizedController) {
        destroySynthesized();
        state.currentTheme = null;
        state.consecutiveFailures = 0;
        return Promise.resolve();
      }

      if (!state.currentAudio) {
        return Promise.resolve();
      }

      var audio = state.currentAudio;
      state.currentAudio = null;
      state.currentTheme = null;
      state.consecutiveFailures = 0;

      // If the audio is already at zero volume or paused, skip the fade
      if (audio.volume <= 0.001 || audio.paused) {
        H.destroyAudio(audio);
        return Promise.resolve();
      }

      return H.fadeOut(audio, 300).then(function () {
        H.destroyAudio(audio);
      });
    }

    /**
     * Starts the synthesized ambient fallback sound when file-based playback
     * fails. Shows a notification to the user explaining that their sound
     * files could not be loaded and a generated ambient is playing instead.
     *
     * Falls through to complete disable if synthesis is also unavailable.
     * @param {string} theme - 'ocean' or 'beach'
     * @returns {Promise<void>}
     */
    function startSynthesizedFallback(theme) {
      if (state.synthesizedController) {
        // Already using synthesized sound; do nothing
        return Promise.resolve();
      }

      var controller = H.createSynthesizedAmbient(theme);
      if (!controller) {
        // Web Audio API not available; disable completely. Self-heal the
        // failure counter so the next explicit toggle retries the files
        // instead of being stuck at the cap forever.
        console.warn('Darya ambient sound: cannot create synthesized fallback');
        state.isEnabled = false;
        state.currentTheme = null;
        state.consecutiveFailures = 0;
        return Promise.resolve();
      }

      state.synthesizedController = controller;
      state.isUsingFallback = true;
      state.currentTheme = theme;
      state.consecutiveFailures = 0;

      console.warn(
        'Darya ambient sound: using synthesized fallback for theme "' +
          theme +
          '"'
      );

      // Show a bilingual notification to the user via DaryaOverlays if
      // available: Persian on top, English below (the notification system
      // renders both, so both packs are consulted regardless of the active
      // conversation language). Falls back to English when a pack is
      // missing.
      if (typeof global.DaryaOverlays !== 'undefined') {
        var fallbackEn =
          'Ambient sound files could not be loaded. Using a generated ambient instead.';
        var faPack =
          global.DaryaLang && global.DaryaLang.fa ? global.DaryaLang.fa : null;
        var enPack =
          global.DaryaLang && global.DaryaLang.en ? global.DaryaLang.en : null;
        var fallbackMsg = {
          fa: (faPack && faPack.ui && faPack.ui.soundFallbackMsg) || fallbackEn,
          en: (enPack && enPack.ui && enPack.ui.soundFallbackMsg) || fallbackEn
        };
        try {
          global.DaryaOverlays.showNotification('warn', fallbackMsg, 6000);
        } catch (e) {
          // Notification overlay may not be ready; log is sufficient.
        }
      }

      return Promise.resolve();
    }

    /**
     * Starts playing a random sound for the given theme with a fade-in.
     *
     * Playback begins by calling audio.play() immediately. This keeps the
     * call inside the user-gesture window that satisfies browser autoplay
     * policies: the menu click that toggled sound on is still active, so
     * Chrome accepts the play() call. The browser buffers the file in the
     * background and the returned promise resolves once real playback
     * starts, which is exactly when play() succeeds (not after the volume
     * fade-in completes), so callers like the toggle UI sync reflect the
     * on-state immediately instead of waiting out the 800ms ramp.
     *
     * Load failures and decode errors are counted as genuine failures and
     * handled gracefully by falling back to a synthesized ambient sound
     * (Web Audio API) once the failure cap is reached. Transient failures
     * (autoplay policy, tab-hidden abort, slow-network timeout) never count
     * and never wipe the user's preference, so a backgrounded tab or a slow
     * network cannot break the toggle. The failure count self-heals when
     * synthesis is unavailable, so broken files can never permanently
     * disable the toggle.
     *
     * @param {string} theme - 'ocean' or 'beach'
     * @returns {Promise<void>}
     */
    function playThemeSound(theme) {
      if (!state.isEnabled) {
        return Promise.resolve();
      }

      // Defensive net for the failure cap. In normal operation the only
      // place the counter can reach the cap is inside fail(), which funnels
      // the attempt straight into the synthesized fallback (and that
      // resets the counter on both success and failure), so this branch is
      // a belt-and-suspenders guard: keep any running synthesis, or try
      // the synthesized ambient, or clear the stale counter and retry the
      // files. It guarantees the toggle can never hard-disable forever.
      if (state.consecutiveFailures >= D.MAX_FAILURES_BEFORE_DISABLE) {
        if (state.isUsingFallback && state.synthesizedController) {
          return Promise.resolve();
        }
        if (!state.isUsingFallback && !state.synthesizedController) {
          return startSynthesizedFallback(theme);
        }
        state.consecutiveFailures = 0;
      }

      var filePath = getRandomSound(theme);
      if (!filePath) {
        console.warn(
          'Darya ambient sound: no files available for theme "' + theme + '"'
        );
        return Promise.resolve();
      }

      var audio = new Audio(filePath);
      audio.loop = true;
      audio.volume = 0; // Start silent for fade-in

      // Safety net: if the browser's native loop fails (e.g. the file has a
      // gap at the end, or the element enters an error state at the loop
      // boundary), restart playback manually. The guard prevents a stale
      // handler from restarting an audio element that was replaced by a
      // theme change or toggle-off.
      audio.addEventListener('ended', function () {
        if (state.currentAudio === audio) {
          audio.currentTime = 0;
          audio.play().catch(function () {});
        }
      });

      // Store references before the async play attempt so the module state
      // is consistent even if play() is rejected asynchronously.
      state.currentAudio = audio;
      state.currentTheme = theme;

      // Attempt playback. A promise executor is used so that both the
      // play() rejection and a raw 'error' event (fired for missing files
      // or unsupported formats, which some browsers do not surface through
      // the play() promise) funnel into one failure handler.
      return new Promise(function (resolve, reject) {
        var finished = false;

        // Defensive timeout: if neither the play() promise nor the audio
        // 'error' event settles the attempt (a hung load is rare but
        // possible), fail so the toggle never hangs. The timer never
        // delays the immediate play() call itself. Timeouts are transient:
        // the file may be fine while the network is slow, so they do not
        // count toward the failure cap or wipe the saved preference.
        var attemptTimer = setTimeout(function () {
          fail(D.makeTransientError('TimeoutError'));
        }, D.PLAY_ATTEMPT_TIMEOUT_MS);

        /**
         * Common failure path: clears the audio, counts the failure, and
         * either falls back to the synthesized ambient or rejects so the
         * caller (toggle) can roll back the enabled state.
         * @param {Error} err - The reason playback failed
         */
        function fail(err) {
          if (finished) {
            return;
          }
          finished = true;
          clearTimeout(attemptTimer);
          audio.removeEventListener('error', onError);
          if (state.inFlightAttempt && state.inFlightAttempt.audio === audio) {
            state.inFlightAttempt = null;
          }
          if (state.currentAudio === audio) {
            state.currentAudio = null;
            state.currentTheme = null;
          }
          H.destroyAudio(audio);
          // An autoplay-policy rejection, an abort (tab hidden), or a
          // timeout is not a load or decode failure: the file is fine, the
          // browser or network was just not ready. Transient failures must
          // not count toward the failure cap, or repeated pre-gesture
          // autoplay attempts would wrongly disable the system.
          if (!D.isTransientError(err)) {
            state.consecutiveFailures += 1;
          }
          console.warn(
            'Darya ambient sound: play failed for "' +
              filePath +
              '" (' +
              err.message +
              ')'
          );

          // Try synthesized fallback before disabling
          if (state.consecutiveFailures >= D.MAX_FAILURES_BEFORE_DISABLE) {
            startSynthesizedFallback(theme).then(resolve, resolve);
            return;
          }
          // Propagate the error so the caller can roll back the enabled
          // state (transient errors keep the user's intent instead).
          reject(err);
        }

        /**
         * Handles the audio element's 'error' event (missing or unsupported
         * file) when the play() promise has not already settled. A missing
         * file is a genuine failure, so this is not tagged transient.
         */
        function onError() {
          fail(new Error('audio load error'));
        }

        // Register the in-flight attempt so the visibility handler can
        // abort it when the tab hides.
        state.inFlightAttempt = { audio: audio, fail: fail };

        audio.addEventListener('error', onError);
        audio.play().then(
          function () {
            if (finished) {
              return;
            }
            finished = true;
            clearTimeout(attemptTimer);
            audio.removeEventListener('error', onError);
            if (
              state.inFlightAttempt &&
              state.inFlightAttempt.audio === audio
            ) {
              state.inFlightAttempt = null;
            }

            // Ensure the audio element is still the active one (a theme
            // change or toggle-off may have swapped it out during
            // buffering).
            if (state.currentAudio !== audio) {
              H.destroyAudio(audio);
              resolve();
              return;
            }
            state.lastPlayedPath = filePath;
            state.consecutiveFailures = 0;
            // Playback has genuinely begun now that play() resolved, so
            // resolve immediately: the toggle UI flips on the moment audio
            // truly starts instead of after the 800ms volume fade-in
            // completes. The fade keeps running in the background and only
            // shapes the volume ramp; nothing depends on its completion.
            resolve();
            H.fadeIn(audio, state.targetVolume, D.FADE_DURATION_MS);
          },
          function (err) {
            if (finished) {
              return;
            }
            // Delegate to fail() without pre-setting `finished`: fail() owns
            // that flag plus the timer/error-listener cleanup and the final
            // reject. Pre-setting it here made the fail() call a no-op and
            // the attempt promise never settled on an autoplay-policy
            // rejection, hanging the toggle.
            fail(err);
          }
        );
      });
    }

    return {
      loadManifest,
      getRandomSound,
      destroySynthesized,
      stopCurrent,
      startSynthesizedFallback,
      playThemeSound
    };
  }

  global.DaryaAmbientSoundPlayback = {
    create: createPlayback
  };
})(typeof window !== 'undefined' ? window : globalThis);
