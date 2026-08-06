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
   * Maximum number of consecutive genuine play-attempt failures (load or
   * decode errors; transient failures like autoplay policy, tab-hidden
   * aborts, and timeouts never count) allowed before the system prefers
   * the synthesized fallback and stops hammering broken files. The count
   * accumulates across clicks on purpose (so genuinely broken files
   * reach the cap) and self-heals when synthesis is unavailable, so
   * broken files can never permanently disable the toggle.
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

  /** Name of the cookie used to persist the sound toggle state. */
  const SOUND_COOKIE_NAME = 'darya_sound';

  /** Number of days until the sound cookie expires. */
  const SOUND_COOKIE_MAX_AGE_DAYS = 365;

  /**
   * Error names that describe playback being unavailable *right now*
   * rather than the sound files being broken: the autoplay policy wants
   * a user gesture, the load was aborted because the tab hid, or the
   * attempt timed out while the network was slow. Transient failures
   * never count toward the permanent-disable failure cap and never wipe
   * the user's saved sound preference.
   */
  var TRANSIENT_ERROR_NAMES = ['NotAllowedError', 'AbortError', 'TimeoutError'];

  /**
   * Returns true when the given error is a transient playback failure
   * (see TRANSIENT_ERROR_NAMES) rather than a genuine load or decode
   * error.
   * @param {*} err - The rejection reason
   * @returns {boolean}
   */
  function isTransientError(err) {
    return !!err && TRANSIENT_ERROR_NAMES.indexOf(err.name) !== -1;
  }

  /**
   * Creates an Error tagged as a transient playback failure. The name is
   * a real DOMException name so callers can rely on err.name alone.
   * @param {string} name - One of TRANSIENT_ERROR_NAMES
   * @returns {Error}
   */
  function makeTransientError(name) {
    var err = new Error(name + ': playback attempt unsettled');
    err.name = name;
    return err;
  }

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

  /**
   * @type {Promise<boolean>|null} In-flight start attempt, shared by
   * concurrent callers (the language-picker click, the first-gesture
   * document listener, the menu/picker toggle, and the theme-change
   * timer) so a single user gesture never starts two audio elements.
   */
  var pendingStart = null;

  /**
   * @type {Promise<boolean>|null} In-flight toggle operation. Rapid
   * clicks on either sound button join the running toggle instead of
   * starting a second, interleaved enable/disable cycle.
   */
  var pendingToggle = null;

  /**
   * @type {{audio: Audio, fail: Function}|null} The play attempt
   * currently awaiting its play() promise, so the visibility handler can
   * abort it promptly when the tab hides (a backgrounded tab throttles
   * media loading and would otherwise hang until the safety timeout).
   */
  var inFlightAttempt = null;

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
      // Abort any in-flight play attempt instead of letting it hang: a
      // hidden tab throttles media loading, so the attempt would only
      // sit until the safety timeout and then look like a failure. The
      // abort is transient: it keeps the user's intent so the tab
      // returning to focus can retry via autoplayIfEnabled.
      if (inFlightAttempt) {
        inFlightAttempt.fail(makeTransientError('AbortError'));
      }
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
      // The tab returning to focus is a fresh activation. If the user
      // wants sound (saved preference, or a just-aborted toggle kept the
      // intent) but nothing is actually playing, try to start it now.
      // Transient failures are handled safely inside autoplayIfEnabled,
      // so this never wipes the saved preference.
      if ((getSavedState() === true || isEnabled) && !isPlaying()) {
        autoplayIfEnabled();
      }
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
      // Web Audio API not available; disable completely. Self-heal the
      // failure counter so the next explicit toggle retries the files
      // instead of being stuck at the cap forever.
      console.warn('Darya ambient sound: cannot create synthesized fallback');
      isEnabled = false;
      currentTheme = null;
      consecutiveFailures = 0;
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
   * Previously the code waited for a canplaythrough event (up to 15
   * seconds) before calling play(). By then Chrome's transient user
   * activation had expired, so play() rejected with NotAllowedError and
   * ambient sound never started. Starting playback right away also lets
   * the browser stream the file progressively instead of waiting for the
   * whole file to buffer.
   *
   * Load failures and decode errors are counted as genuine failures and
   * handled gracefully by falling back to a synthesized ambient sound
   * (Web Audio API) once MAX_FAILURES_BEFORE_DISABLE is reached.
   * Transient failures (autoplay policy, tab-hidden abort, slow-network
   * timeout) never count and never wipe the user's preference, so a
   * backgrounded tab or a slow network cannot break the toggle. The
   * failure count self-heals when synthesis is unavailable, so broken
   * files can never permanently disable the toggle.
   *
   * @param {string} theme - 'ocean' or 'beach'
   * @returns {Promise<void>}
   */
  function playThemeSound(theme) {
    if (!isEnabled) {
      return Promise.resolve();
    }

    // Defensive net for the failure cap. In normal operation the only
    // place the counter can reach the cap is inside fail(), which funnels
    // the attempt straight into the synthesized fallback (and that
    // resets the counter on both success and failure), so this branch is
    // a belt-and-suspenders guard: keep any running synthesis, or try
    // the synthesized ambient, or clear the stale counter and retry the
    // files. It guarantees the toggle can never hard-disable forever.
    if (consecutiveFailures >= MAX_FAILURES_BEFORE_DISABLE) {
      if (isUsingFallback && synthesizedController) {
        return Promise.resolve();
      }
      if (!isUsingFallback && !synthesizedController) {
        return startSynthesizedFallback(theme);
      }
      consecutiveFailures = 0;
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
      if (currentAudio === audio) {
        audio.currentTime = 0;
        audio.play().catch(function () {});
      }
    });

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
      // possible), fail so the toggle never hangs. The timer never
      // delays the immediate play() call itself. Timeouts are transient:
      // the file may be fine while the network is slow, so they do not
      // count toward the failure cap or wipe the saved preference.
      var attemptTimer = setTimeout(function () {
        fail(makeTransientError('TimeoutError'));
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
        if (inFlightAttempt && inFlightAttempt.audio === audio) {
          inFlightAttempt = null;
        }
        if (currentAudio === audio) {
          currentAudio = null;
          currentTheme = null;
        }
        destroyAudio(audio);
        // An autoplay-policy rejection, an abort (tab hidden), or a
        // timeout is not a load or decode failure: the file is fine, the
        // browser or network was just not ready. Transient failures must
        // not count toward the failure cap, or repeated pre-gesture
        // autoplay attempts would wrongly disable the system.
        if (!isTransientError(err)) {
          consecutiveFailures += 1;
        }
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
      inFlightAttempt = { audio: audio, fail: fail };

      audio.addEventListener('error', onError);
      audio.play().then(
        function () {
          if (finished) {
            return;
          }
          finished = true;
          clearTimeout(attemptTimer);
          audio.removeEventListener('error', onError);
          if (inFlightAttempt && inFlightAttempt.audio === audio) {
            inFlightAttempt = null;
          }

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
          // Playback has genuinely begun now that play() resolved, so
          // resolve immediately: the toggle UI flips on the moment audio
          // truly starts instead of after the 800ms volume fade-in
          // completes. The fade keeps running in the background and only
          // shapes the volume ramp; nothing depends on its completion.
          resolve();
          fadeIn(audio, targetVolume, FADE_DURATION_MS);
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
   * Toggles ambient sound on/off, deduplicating rapid clicks: while a
   * toggle operation is in flight, or while a just-started file's
   * fade-in is still ramping, further clicks join it instead of
   * starting an interleaved second cycle. This keeps a double-click
   * (or the menu and picker buttons pressed close together) from
   * flipping the sound twice or spawning concurrent audio elements.
   * @returns {Promise<boolean>} Resolves with the new enabled state.
   */
  function toggle() {
    if (pendingToggle) {
      return pendingToggle;
    }
    pendingToggle = Promise.resolve()
      .then(performToggle)
      .then(
        function (enabled) {
          // The operation resolves as soon as playback starts (the
          // feedback-lag fix). Only file playback has a fade-in to
          // protect: keep the rapid-click dedup guard armed through the
          // volume ramp so a second click inside that window cannot
          // kill a sound that is still fading in. When the toggle
          // settled without playback (rolled back, or kept intent on a
          // transient failure) or the synthesized fallback is playing
          // (it starts instantly with no ramp), there is nothing to
          // protect, so clear the guard immediately and let the next
          // click act. A timer clears the guard without delaying the
          // promise returned to callers, so the UI sync still happens
          // at playback start.
          if (enabled && isPlaying() && !isUsingFallback) {
            setTimeout(function () {
              pendingToggle = null;
            }, FADE_DURATION_MS);
          } else {
            pendingToggle = null;
          }
          return enabled;
        },
        function () {
          // Defensive: performToggle should never reject, but if it does
          // (an unexpected internal error), settle as "off" and persist
          // it rather than leaving an unhandled rejection that could
          // freeze the toggle.
          pendingToggle = null;
          isEnabled = false;
          saveCookieState();
          return false;
        }
      );
    return pendingToggle;
  }

  /**
   * Performs the actual toggle work:
   * - Off --> On: loads the manifest, picks a random sound for the
   *   current theme, and starts playback with a fade-in. The failure
   *   counter is deliberately not reset here: it accumulates across
   *   clicks so genuinely broken files reach the cap and engage the
   *   synthesized fallback (the cap self-heals when synthesis is
   *   unavailable, so the toggle can never get stuck).
   * - On --> Off: fades out and stops playback, clearing all audio state.
   *
   * If playback fails with a genuine load or decode error, the enabled
   * state is rolled back to false so the UI always reflects the actual
   * audio state. Transient failures (autoplay policy, tab-hidden abort,
   * slow-network timeout) keep the user's intent instead.
   *
   * The current enabled/disabled state is saved to a cookie after each
   * successful toggle so it persists across sessions.
   *
   * @returns {Promise<boolean>} Resolves with the new enabled state.
   */
  function performToggle() {
    // The button reflects ACTUAL playback, so a click always does what
    // its visible state promises: stop when playing, start otherwise.
    // Keying off isPlaying() also recovers the edge case where the
    // module was left "enabled" but silent (e.g. an autoplay attempt
    // was blocked or a tab-resume failed): the next click restarts
    // within the gesture instead of toggling to a confusing "off".
    if (isPlaying()) {
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

    // Enable: load the manifest first (already cached from the boot
    // preload, so this resolves immediately), then start playback.
    // Because the manifest is warm, playThemeSound calls audio.play()
    // within the user gesture, keeping Chrome's transient activation
    // alive.
    return loadManifest().then(function (loaded) {
      if (!loaded) {
        // Nothing can play without a manifest; stay (or become) honestly
        // disabled so the toggle never reports an enabled state that no
        // sound could ever back up.
        isEnabled = false;
        saveCookieState();
        return false;
      }
      // The theme already switched (the toggle starts the current
      // theme's sound), so any scheduled theme-change start is stale.
      if (pendingThemeTimer) {
        clearTimeout(pendingThemeTimer);
        pendingThemeTimer = null;
      }
      var theme =
        document.documentElement.getAttribute('data-theme') || 'ocean';
      isEnabled = true;
      return startPlayback(theme);
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

    // Abort any in-flight load attempt: its theme is about to change, so
    // letting it resolve would either start the wrong theme or get
    // destroyed by the fade-out below. The abort is transient and keeps
    // the user's intent.
    if (inFlightAttempt) {
      inFlightAttempt.fail(makeTransientError('AbortError'));
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

    // Schedule the new theme's sound to start after a short delay. The
    // start can happen outside a user gesture, and an autoplay-policy
    // rejection on the first or second attempt must not surface as an
    // unhandled promise rejection. startPlayback shares any in-flight
    // start and never rejects: transient failures keep the user's
    // intent, and genuine failures roll back the enabled state
    // internally.
    pendingThemeTimer = setTimeout(function () {
      pendingThemeTimer = null;
      startPlayback(newTheme);
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
   * Starts playback for the given theme, sharing a single in-flight
   * attempt between concurrent callers (the toggle, the autoplay retry,
   * and the theme-change timer) so one gesture never starts two audio
   * elements. Resolves with the ACTUAL enabled state after the attempt
   * settles: genuine failures roll back to disabled, transient failures
   * (autoplay policy, tab-hidden abort, slow-network timeout) keep the
   * user's intent.
   * @param {string} theme - 'ocean' or 'beach'
   * @returns {Promise<boolean>}
   */
  function startPlayback(theme) {
    if (pendingStart) {
      return pendingStart;
    }
    pendingStart = playThemeSound(theme).then(
      function () {
        pendingStart = null;
        // Playback started (or the synthesized fallback took over):
        // persist the state so the preference survives the session.
        saveCookieState();
        // Report the ACTUAL enabled state: the synthesized fallback may
        // have disabled the system internally if it could not start.
        return isEnabled;
      },
      function (err) {
        pendingStart = null;
        // A transient failure (autoplay policy, tab-hidden abort, or
        // slow-network timeout) is not a playback failure: the file is
        // fine, the context was just not ready. Keep the saved intent so
        // a later gesture or tab return can retry. Genuine load/decode
        // errors still roll back honestly so the UI never claims sound
        // is enabled when it cannot play.
        if (isTransientError(err)) {
          return isEnabled;
        }
        // Playback rejected (network error, decode failure, or load
        // error). Roll back the enabled state so the UI correctly
        // reports that no sound is playing.
        isEnabled = false;
        saveCookieState();
        return false;
      }
    );
    return pendingStart;
  }

  /**
   * Automatically starts playback of the current theme sound if ambient
   * sound is enabled in the user's settings, utilizing a user-gesture context.
   * Safe to call multiple times; if already playing, does nothing.
   * Concurrent callers (the language-picker click and the first-gesture
   * document listener can fire on the same click) share one in-flight
   * attempt instead of each starting their own Audio element.
   * @returns {Promise<boolean>} Resolves with the ACTUAL enabled state.
   */
  function autoplayIfEnabled() {
    if (pendingStart) {
      return pendingStart;
    }
    if (isEnabled && !isPlaying()) {
      var theme =
        document.documentElement.getAttribute('data-theme') || 'ocean';
      return startPlayback(theme);
    }
    return Promise.resolve(isEnabled);
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
