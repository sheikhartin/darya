/**
 * Darya classic script.
 */

(function (global) {
  'use strict';

  // ========================================================================
  // Constants
  // ========================================================================

  /** Root path for all audio assets (relative to the project root). */
  const SOUND_BASE_PATH = 'assets/audio';

  /** Path to the manifest file listing available sounds per theme. */
  const MANIFEST_PATH = SOUND_BASE_PATH + '/manifest.json';

  /** Default ambient volume: 25% of max. Gentle and non-intrusive. */
  const DEFAULT_VOLUME = 0.25;

  /** Duration of the audio crossfade in milliseconds. */
  const FADE_DURATION_MS = 800;

  /** Number of discrete steps used to interpolate volume during fades. */
  const FADE_STEPS = 20;

  /**
   * Maximum number of consecutive play-attempt failures allowed before
   * the system automatically disables itself. Prevents infinite retry
   * loops when audio files cannot be loaded (e.g. network issues).
   */
  const MAX_FAILURES_BEFORE_DISABLE = 3;

  /**
   * Safety timeout (ms) for a single play attempt. If neither the play()
   * promise nor the audio 'error' event settles the attempt within this
   * window, the attempt fails so the toggle never hangs. Generous enough
   * for slow networks; the immediate play() call itself is never delayed
   * by this timer.
   */
  const PLAY_ATTEMPT_TIMEOUT_MS = 15000;

  /** Delay in ms between theme change and new sound start, allowing the
      visual transition to begin first. */
  const THEME_CHANGE_DELAY_MS = 200;

  /** Expected theme keys that must exist in a valid manifest. */
  const EXPECTED_MANIFEST_THEMES = ['beach', 'ocean'];

  // ========================================================================
  // Internal state
  // ========================================================================

  /** @type {Audio|null} The currently playing Audio element. */
  var currentAudio = null;

  /** @type {string|null} The theme ('ocean' or 'beach') of the current audio. */
  var currentTheme = null;

  /** @type {boolean} Whether ambient sound is currently enabled by the user. */
  var isEnabled = getSavedState() === true;

  /** @type {number} The target volume (0-1) for new audio playback. */
  var targetVolume = DEFAULT_VOLUME;

  /** @type {Object|null} Parsed manifest data: { theme: [filenames...] }. */
  var manifest = null;

  /** @type {number|null} Handle for the pending theme-change timer. */
  var pendingThemeTimer = null;

  /** @type {string|null} Path of the last successfully played audio file. */
  var lastPlayedPath = null;

  /** @type {number} Consecutive play-attempt failures since last success. */
  var consecutiveFailures = 0;

  /** @type {boolean} True while audio was playing when the tab hid. */
  var wasPlayingBeforeHidden = false;

  /** @type {SynthesizedAmbientController|null} Active Web Audio API fallback. */
  var synthesizedController = null;

  /** @type {boolean} True if fallback synthesis is active instead of file playback. */
  var isUsingFallback = false;

  // ========================================================================
  // Visibility change handler
  // ========================================================================

  /**
   * Pauses audio playback when the browser tab is hidden and resumes it
   * when the tab becomes visible again. This conserves bandwidth on mobile
   * and prevents unnecessary audio streaming for background tabs.
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      if (currentAudio && !currentAudio.paused) {
        wasPlayingBeforeHidden = true;
        currentAudio.pause();
      } else {
        wasPlayingBeforeHidden = false;
      }
    } else {
      // Tab became visible again; resume playback if it was playing
      // before the tab was hidden.
      if (isEnabled && wasPlayingBeforeHidden && currentAudio) {
        currentAudio.play().catch(function () {
          // If resume fails (unlikely but defensive), do nothing.
          // The user can re-enable via the toggle button.
        });
      }
      wasPlayingBeforeHidden = false;
    }
  }

  // Wire the visibility listener once at load time
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // ========================================================================
  // Manifest loader
  // ========================================================================

  /**
   * Fallback manifest file lists, used when the primary manifest.json
   * cannot be fetched (typically because the page was opened via the
   * file:// protocol, where browser CORS policies block fetch()).
   *
   * These lists should be kept in sync with assets/audio/manifest.json.
   * When adding new sound files, update both the manifest.json and this
   * object so the app works both from a local server and file://.
   */
  var FALLBACK_MANIFEST = {
    beach: ['sea-waves-with-birds-loop.mp3'],
    ocean: ['stormy-sea-waves-loop.mp3']
  };

  /**
   * Attempts to detect whether the page was opened via the file://
   * protocol, where fetch() calls fail due to CORS restrictions.
   * @returns {boolean}
   */
  function isFileProtocol() {
    return (
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol === 'file:'
    );
  }

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
    if (manifest) {
      return Promise.resolve(true);
    }

    // When opened from file:// protocol, skip fetch entirely and use
    // the fallback manifest to avoid CORS errors in the console.
    if (isFileProtocol()) {
      manifest = FALLBACK_MANIFEST;
      return Promise.resolve(true);
    }

    var fetchPromise;
    try {
      fetchPromise = fetch(MANIFEST_PATH);
    } catch (e) {
      // fetch() may throw in environments where it is not available
      // (e.g. certain testing environments or older browsers).
      return useFallbackManifest('fetch not available');
    }

    return fetchPromise
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ' for ' + MANIFEST_PATH);
        }
        return response.json();
      })
      .then(function (data) {
        // Validate that the manifest is a non-null object
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('Manifest is not a valid object');
        }
        // Validate that all expected theme keys exist and contain arrays
        for (var t = 0; t < EXPECTED_MANIFEST_THEMES.length; t += 1) {
          var themeKey = EXPECTED_MANIFEST_THEMES[t];
          if (!Array.isArray(data[themeKey])) {
            throw new Error(
              'Manifest missing array for theme "' + themeKey + '"'
            );
          }
        }
        manifest = data;
        consecutiveFailures = 0;
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
      if (!manifest) {
        console.warn(
          'Darya ambient sound: using fallback manifest (' + reason + ')'
        );
        manifest = {
          beach: FALLBACK_MANIFEST.beach.slice(),
          ocean: FALLBACK_MANIFEST.ocean.slice()
        };
      }
      return true;
    }
  }

  // ========================================================================
  // File selection
  // ========================================================================

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
    // load), fall back to the synchronous FALLBACK_MANIFEST so playback
    // can still start within the user-gesture window without waiting on
    // the network fetch.
    var files =
      manifest && Array.isArray(manifest[theme])
        ? manifest[theme]
        : FALLBACK_MANIFEST[theme];

    if (!Array.isArray(files) || files.length === 0) {
      return null;
    }

    var index = Math.floor(Math.random() * files.length);
    var file = files[index];
    var filePath = SOUND_BASE_PATH + '/' + theme + '/' + file;

    // If we'd play the same file as last time and there are alternatives,
    // pick the next one to add variety.
    if (filePath === lastPlayedPath && files.length > 1) {
      var nextIndex = (index + 1) % files.length;
      filePath = SOUND_BASE_PATH + '/' + theme + '/' + files[nextIndex];
    }

    return filePath;
  }

  // ========================================================================
  // Audio fade helpers
  // ========================================================================

  /**
   * Smoothly ramps the volume of an Audio element from its current level
   * to zero over the given duration. Resolves when the fade completes.
   * If the audio element is already paused or at zero volume, resolves
   * immediately without stepping.
   * @param {Audio} audio - The Audio element to fade out
   * @param {number} duration - Fade duration in milliseconds
   * @returns {Promise<void>}
   */
  function fadeOut(audio, duration) {
    return new Promise(function (resolve) {
      var startVol = audio.volume;
      var interval = Math.max(16, duration / FADE_STEPS);
      var step = 0;

      function tick() {
        step += 1;
        if (step >= FADE_STEPS || startVol <= 0.001) {
          audio.volume = 0;
          resolve();
          return;
        }
        audio.volume = Math.max(0, startVol * (1 - step / FADE_STEPS));
        setTimeout(tick, interval);
      }

      tick();
    });
  }

  /**
   * Smoothly ramps the volume of an Audio element from zero to the target
   * level over the given duration.
   * @param {Audio} audio - The Audio element to fade in
   * @param {number} target - Final volume (0-1)
   * @param {number} duration - Fade duration in milliseconds
   * @returns {Promise<void>}
   */
  function fadeIn(audio, target, duration) {
    return new Promise(function (resolve) {
      audio.volume = 0;
      var interval = Math.max(16, duration / FADE_STEPS);
      var step = 0;

      function tick() {
        step += 1;
        if (step >= FADE_STEPS) {
          audio.volume = target;
          resolve();
          return;
        }
        audio.volume = target * (step / FADE_STEPS);
        setTimeout(tick, interval);
      }

      tick();
    });
  }

  // ========================================================================
  // Synthesized ambient fallback (Web Audio API)
  // ========================================================================

  /**
   * Creates a gentle ambient sound using the Web Audio API as a fallback
   * when audio files cannot be loaded. Generates filtered white noise with
   * slow gain modulation to approximate a calm wave-like ambience.
   *
   * Uses different filter frequencies per theme:
   *   - 'ocean': lower cutoff (~300Hz) for a deeper, rumbling sound
   *   - 'beach': higher cutoff (~800Hz) for a lighter, brighter wash
   *
   * Returns a controller object with stop() and setVolume() methods.
   * Returns null if the Web Audio API is not available.
   *
   * @param {string} theme - 'ocean' or 'beach'
   * @returns {{stop: Function, setVolume: Function}|null}
   */
  function createSynthesizedAmbient(theme) {
    // Guard: Web Audio API not available
    if (
      typeof AudioContext === 'undefined' &&
      typeof webkitAudioContext === 'undefined'
    ) {
      return null;
    }

    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    var ctx;
    try {
      ctx = new AudioCtx();
    } catch (e) {
      return null;
    }

    // Resume the context if it was created in a suspended state (Chrome
    // defers AudioContext creation until a user gesture). Without this
    // resume call, the synthesized noise source would be connected but
    // completely silent.
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () {
        // Resume may be rejected if no user gesture has occurred.
        // Silently ignore; the synthesized sound is a last-resort
        // fallback, and silent failure to resume is acceptable.
      });
    }

    // Create 4 seconds of white noise in a buffer
    var bufferSize = Math.ceil(ctx.sampleRate * 4);
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var channelData = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i += 1) {
      channelData[i] = Math.random() * 2 - 1;
    }

    // Noise source (looping)
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Low-pass filter to soften noise into a wave-like wash
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = theme === 'ocean' ? 300 : 800;
    filter.Q.value = 0.7;

    // Main gain (very quiet)
    var mainGain = ctx.createGain();
    mainGain.gain.value = theme === 'ocean' ? 0.04 : 0.035;

    // Modulation gain for wave-like ebb-and-flow
    var modGain = ctx.createGain();
    modGain.gain.value = 1;

    // Connect: source -> filter -> mainGain -> modGain -> destination
    source.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(modGain);
    modGain.connect(ctx.destination);

    // Start playback
    source.start();

    // Slow gain oscillation for wave feel
    var modInterval = setInterval(function () {
      // Oscillate between 0.6 and 1.0 over 6 seconds
      var now = Date.now() / 1000;
      var osc = 0.8 + 0.2 * Math.sin(now * 0.25);
      try {
        modGain.gain.setTargetAtTime(osc, ctx.currentTime, 0.3);
      } catch (e) {
        // setTargetAtTime may throw if context is closed
      }
    }, 3000);

    return {
      /** @type {string} Tag to distinguish from file-based audio. */
      type: 'synthesized',

      /** Stops playback and closes the AudioContext. */
      stop: function () {
        clearInterval(modInterval);
        try {
          source.stop();
        } catch (e) {
          // May throw if already stopped
        }
        ctx.close();
      },

      /**
       * Adjusts the main gain level.
       * @param {number} level - Volume 0-1
       */
      setVolume: function (level) {
        mainGain.gain.value =
          (theme === 'ocean' ? 0.04 : 0.035) * Math.max(0, Math.min(1, level));
      }
    };
  }

  // ========================================================================
  // Audio lifecycle
  // ========================================================================

  /**
   * Cleanly releases all resources held by an Audio element.
   * Pauses playback, revokes the object URL (if any), and sets src to
   * an empty string to free memory. After calling this, the audio element
   * should be discarded.
   * @param {Audio} audio
   */
  function destroyAudio(audio) {
    try {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    } catch (e) {
      // If the audio element is already in a broken state, these calls
      // may throw. Silently ignore; the element will be garbage collected.
    }
  }

  /**
   * Stops the synthesized ambient controller if one is active.
   * Resets the fallback flag so the system can retry file playback.
   */
  function destroySynthesized() {
    if (synthesizedController) {
      try {
        synthesizedController.stop();
      } catch (e) {
        // AudioContext.close() may throw if already closed.
      }
      synthesizedController = null;
    }
    isUsingFallback = false;
  }

  /**
   * Stops the current audio with a quick fade (~300ms) and cleans up.
   * Resets the failure counter since the stop was intentional.
   * Also stops the synthesized fallback if one is active.
   * @returns {Promise<void>}
   */
  function stopCurrent() {
    // If using synthesized fallback, stop it instead of file audio
    if (isUsingFallback && synthesizedController) {
      destroySynthesized();
      currentTheme = null;
      consecutiveFailures = 0;
      return Promise.resolve();
    }

    if (!currentAudio) {
      return Promise.resolve();
    }

    var audio = currentAudio;
    currentAudio = null;
    currentTheme = null;
    consecutiveFailures = 0;

    // If the audio is already at zero volume or paused, skip the fade
    if (audio.volume <= 0.001 || audio.paused) {
      destroyAudio(audio);
      return Promise.resolve();
    }

    return fadeOut(audio, 300).then(function () {
      destroyAudio(audio);
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
    if (synthesizedController) {
      // Already using synthesized sound; do nothing
      return Promise.resolve();
    }

    var controller = createSynthesizedAmbient(theme);
    if (!controller) {
      // Web Audio API not available; disable completely
      console.warn('Darya ambient sound: cannot create synthesized fallback');
      isEnabled = false;
      currentTheme = null;
      return Promise.resolve();
    }

    synthesizedController = controller;
    isUsingFallback = true;
    currentTheme = theme;
    consecutiveFailures = 0;

    console.warn(
      'Darya ambient sound: using synthesized fallback for theme "' +
        theme +
        '"'
    );

    // Show a notification to the user via DaryaOverlays if available
    if (typeof global.DaryaOverlays !== 'undefined') {
      var fallbackMsg =
        'Ambient sound files could not be loaded. Using a generated ambient instead.';
      if (typeof global.DaryaLang !== 'undefined') {
        // Pick the notification message in the user's active language.
        // The active language is stored on the <html> element.
        var docLang =
          (typeof document !== 'undefined' &&
            document.documentElement.getAttribute('lang')) ||
          'en';
        var langPack =
          global.DaryaLang[docLang] ||
          global.DaryaLang.en ||
          global.DaryaLang.fa;
        if (langPack && langPack.ui && langPack.ui.soundFallbackMsg) {
          fallbackMsg = langPack.ui.soundFallbackMsg;
        }
      }
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
   * starts.
   *
   * Previously the code waited for a canplaythrough event (up to 15
   * seconds) before calling play(). By then Chrome's transient user
   * activation had expired, so play() rejected with NotAllowedError and
   * ambient sound never started. Starting playback right away also lets
   * the browser stream the file progressively instead of waiting for the
   * whole file to buffer.
   *
   * Load failures, decode errors, and autoplay-policy rejections are
   * caught and handled gracefully by falling back to a synthesized
   * ambient sound (Web Audio API). If both file playback and synthesis
   * fail, the system disables itself after MAX_FAILURES_BEFORE_DISABLE
   * consecutive failures.
   *
   * @param {string} theme - 'ocean' or 'beach'
   * @returns {Promise<void>}
   */
  function playThemeSound(theme) {
    if (!isEnabled) {
      return Promise.resolve();
    }

    // Check if we've hit the failure cap and should auto-disable
    if (consecutiveFailures >= MAX_FAILURES_BEFORE_DISABLE) {
      // Try using synthesized fallback before completely disabling
      if (!isUsingFallback && !synthesizedController) {
        return startSynthesizedFallback(theme);
      }
      console.warn('Darya ambient sound: too many load failures, disabling');
      isEnabled = false;
      return Promise.resolve();
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

    // Store references before the async play attempt so the module state
    // is consistent even if play() is rejected asynchronously.
    currentAudio = audio;
    currentTheme = theme;

    // Attempt playback. A promise executor is used so that both the
    // play() rejection and a raw 'error' event (fired for missing files
    // or unsupported formats, which some browsers do not surface through
    // the play() promise) funnel into one failure handler.
    return new Promise(function (resolve, reject) {
      var finished = false;

      // Defensive timeout: if neither the play() promise nor the audio
      // 'error' event settles the attempt (a hung load is rare but
      // possible), fail so the toggle never hangs. The timer never delays
      // the immediate play() call itself.
      var attemptTimer = setTimeout(function () {
        fail(new Error('play attempt timed out'));
      }, PLAY_ATTEMPT_TIMEOUT_MS);

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
        if (currentAudio === audio) {
          currentAudio = null;
          currentTheme = null;
        }
        destroyAudio(audio);
        consecutiveFailures += 1;
        console.warn(
          'Darya ambient sound: play failed for "' +
            filePath +
            '" (' +
            err.message +
            ')'
        );

        // Try synthesized fallback before disabling
        if (consecutiveFailures >= MAX_FAILURES_BEFORE_DISABLE) {
          startSynthesizedFallback(theme).then(resolve, resolve);
          return;
        }
        // Propagate the error so toggle() can roll back the enabled state
        reject(err);
      }

      /**
       * Handles the audio element's 'error' event (missing or unsupported
       * file) when the play() promise has not already settled.
       */
      function onError() {
        fail(new Error('audio load error'));
      }

      audio.addEventListener('error', onError);
      audio.play().then(
        function () {
          if (finished) {
            return;
          }
          finished = true;
          clearTimeout(attemptTimer);
          audio.removeEventListener('error', onError);

          // Ensure the audio element is still the active one (a theme
          // change or toggle-off may have swapped it out during
          // buffering).
          if (currentAudio !== audio) {
            destroyAudio(audio);
            resolve();
            return;
          }
          lastPlayedPath = filePath;
          consecutiveFailures = 0;
          fadeIn(audio, targetVolume, FADE_DURATION_MS).then(resolve, resolve);
        },
        function (err) {
          if (finished) {
            return;
          }
          finished = true;
          clearTimeout(attemptTimer);
          audio.removeEventListener('error', onError);
          fail(err);
        }
      );
    });
  }

  // ========================================================================
  // Public API
  // ========================================================================

  // Preload the sound manifest at module load so the first toggle can
  // start playback immediately within the user-gesture window. If the
  // manifest were only fetched on demand, the network round-trip would
  // delay audio.play() past Chrome's transient user activation and the
  // autoplay policy would reject playback (NotAllowedError).
  if (typeof document !== 'undefined') {
    loadManifest();
  }

  /** Name of the cookie used to persist the sound toggle state. */
  var SOUND_COOKIE_NAME = 'darya_sound';
  /** Number of days until the sound cookie expires. */
  var SOUND_COOKIE_MAX_AGE_DAYS = 365;

  /**
   * Saves the current sound enabled/disabled state to a persistent cookie
   * so the preference is remembered across visits.
   * Best-effort only; failures are silently ignored.
   */
  function saveCookieState() {
    try {
      var expires = new Date(
        Date.now() + SOUND_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
      ).toUTCString();
      document.cookie =
        SOUND_COOKIE_NAME +
        '=' +
        (isEnabled ? '1' : '0') +
        '; expires=' +
        expires +
        '; path=/; SameSite=Lax';
    } catch (e) {
      // Best-effort only; sound still works per-session.
    }
  }

  /**
   * Toggles ambient sound on/off.
   * - Off --> On: loads the manifest, picks a random sound for the current
   *   theme, and starts playback with a fade-in.
   * - On --> Off: fades out and stops playback, clearing all audio state.
   *
   * If playback fails (manifest load error, audio load failure, or browser
   * autoplay policy rejection), the enabled state is rolled back to false
   * so the UI always reflects the actual audio state.
   *
   * The current enabled/disabled state is saved to a cookie after each
   * successful toggle so it persists across sessions.
   *
   * @returns {Promise<boolean>} Resolves with the new enabled state.
   */
  function toggle() {
    if (isEnabled) {
      // Disable: clear any pending theme change, then stop current audio
      isEnabled = false;
      if (pendingThemeTimer) {
        clearTimeout(pendingThemeTimer);
        pendingThemeTimer = null;
      }
      consecutiveFailures = 0;
      return stopCurrent().then(function () {
        saveCookieState();
        return false;
      });
    }

    // Enable: load manifest first (already cached from the boot preload,
    // so this resolves immediately), then start playback. Because the
    // manifest is warm, playThemeSound calls audio.play() within the user
    // gesture, keeping Chrome's transient activation alive.
    return loadManifest().then(function (loaded) {
      if (!loaded) {
        return false;
      }
      var theme =
        document.documentElement.getAttribute('data-theme') || 'ocean';
      isEnabled = true;
      return playThemeSound(theme).then(
        function () {
          saveCookieState();
          // Report the ACTUAL enabled state: the synthesized fallback may
          // have disabled the system internally if it could not start.
          return isEnabled;
        },
        function () {
          // Playback rejected (autoplay policy, network error, decode
          // failure, or load error). Roll back the enabled state so the
          // UI correctly reports that no sound is playing.
          isEnabled = false;
          saveCookieState();
          return false;
        }
      );
    });
  }

  /**
   * Returns the saved sound state from the cookie, or null if no cookie
   * is found. Used during boot to restore the UI toggle state.
   * @returns {boolean|null} true if enabled, false if disabled, null if unknown
   */
  function getSavedState() {
    try {
      var match = document.cookie.match(
        new RegExp('(?:^|; )' + SOUND_COOKIE_NAME + '=([^;]*)')
      );
      if (match) {
        return match[1] === '1';
      }
    } catch (e) {
      // document.cookie may throw in restrictive environments
    }
    return null;
  }

  /**
   * Called when the theme changes. Crossfades from the current sound
   * (if any) to the new theme's random sound after a brief delay so
   * the visual transition can start first.
   * Safe to call multiple times in rapid succession: previous pending
   * timers are cleared.
   * @param {string} newTheme - 'ocean' or 'beach'
   */
  function onThemeChange(newTheme) {
    // Do nothing if sound is disabled or the theme hasn't actually changed
    if (!isEnabled || newTheme === currentTheme) {
      return;
    }

    // Cancel any pending theme-change transition
    if (pendingThemeTimer) {
      clearTimeout(pendingThemeTimer);
      pendingThemeTimer = null;
    }

    // Start fading out the current audio immediately
    if (currentAudio) {
      var oldAudio = currentAudio;
      currentAudio = null;
      currentTheme = null;
      fadeOut(oldAudio, FADE_DURATION_MS * 0.6).then(function () {
        destroyAudio(oldAudio);
      });
    }

    // Destroy any active synthesized fallback
    if (isUsingFallback || synthesizedController) {
      destroySynthesized();
      currentTheme = null;
    }

    // Schedule the new theme's sound to start after a short delay
    pendingThemeTimer = setTimeout(function () {
      pendingThemeTimer = null;
      playThemeSound(newTheme);
    }, THEME_CHANGE_DELAY_MS);
  }

  /**
   * Sets the target playback volume (0-1) and applies it to the currently
   * playing audio element if one exists.
   * Values outside the 0-1 range are clamped.
   * @param {number} level - Volume level between 0 (silent) and 1 (max)
   */
  function setVolume(level) {
    targetVolume = Math.max(0, Math.min(1, level));
    if (currentAudio) {
      currentAudio.volume = targetVolume;
    }
    if (
      synthesizedController &&
      typeof synthesizedController.setVolume === 'function'
    ) {
      synthesizedController.setVolume(targetVolume);
    }
  }

  /**
   * Returns true if ambient sound is currently playing (enabled, has an
   * active audio element, and the audio is not paused or stalled).
   * @returns {boolean}
   */
  function isPlaying() {
    if (!isEnabled) {
      return false;
    }
    // Synthesized fallback
    if (isUsingFallback && synthesizedController) {
      return true;
    }
    // File-based audio
    return (
      currentAudio !== null &&
      currentAudio.readyState >= 2 &&
      !currentAudio.paused
    );
  }

  /**
   * Automatically starts playback of the current theme sound if ambient
   * sound is enabled in the user's settings, utilizing a user-gesture context.
   * Safe to call multiple times; if already playing, does nothing.
   * @returns {Promise<void>}
   */
  function autoplayIfEnabled() {
    if (isEnabled && !isPlaying()) {
      var theme =
        document.documentElement.getAttribute('data-theme') || 'ocean';
      return playThemeSound(theme).catch(function () {
        /* fail-safe */
      });
    }
    return Promise.resolve();
  }

  const DaryaAmbientSound = {
    toggle,
    onThemeChange,
    setVolume,
    isPlaying,
    getSavedState,
    autoplayIfEnabled,
    get enabled() {
      return isEnabled;
    },
    get currentTheme() {
      return currentTheme;
    }
  };

  global.DaryaAmbientSound = DaryaAmbientSound;
})(typeof window !== 'undefined' ? window : globalThis);
