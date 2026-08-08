/**
 * Darya - ambient sound module (main file).
 *
 * Owns the module state and the public API. The constants and stateless
 * helpers live in ambient-sound-data.js / ambient-sound-helpers.js, and
 * the stateful playback functions (manifest loading, file selection,
 * synthesized fallback, theme playback) live in ambient-sound-playback.js
 * and are bound to the shared state object below.
 *
 * Load order: ambient-sound-data.js, ambient-sound-helpers.js,
 * ambient-sound-playback.js, then this file.
 */

(function (global) {
  'use strict';

  const D = global.DaryaAmbientSoundData;
  const H = global.DaryaAmbientSoundHelpers;

  // ========================================================================
  // Internal state
  // ========================================================================

  /**
   * Shared mutable state between this module and the playback module.
   * The playback factory binds to this object, so both modules read and
   * write the same values.
   */
  var state = {
    /** @type {Audio|null} The currently playing Audio element. */
    currentAudio: null,

    /** @type {string|null} The theme ('ocean' or 'beach') of the current audio. */
    currentTheme: null,

    /** @type {boolean} Whether ambient sound is currently enabled by the user. */
    isEnabled: getSavedState() === true,

    /** @type {number} The target volume (0-1) for new audio playback. */
    targetVolume: D.DEFAULT_VOLUME,

    /** @type {Object|null} Parsed manifest data: { theme: [filenames...] }. */
    manifest: null,

    /** @type {number|null} Handle for the pending theme-change timer. */
    pendingThemeTimer: null,

    /** @type {string|null} Path of the last successfully played audio file. */
    lastPlayedPath: null,

    /** @type {number} Consecutive play-attempt failures since last success. */
    consecutiveFailures: 0,

    /** @type {boolean} True while audio was playing when the tab hid. */
    wasPlayingBeforeHidden: false,

    /** @type {SynthesizedAmbientController|null} Active Web Audio API fallback. */
    synthesizedController: null,

    /** @type {boolean} True if fallback synthesis is active instead of file playback. */
    isUsingFallback: false,

    /**
     * @type {Promise<boolean>|null} In-flight start attempt, shared by
     * concurrent callers (the language-picker click, the first-gesture
     * document listener, the menu/picker toggle, and the theme-change
     * timer) so a single user gesture never starts two audio elements.
     */
    pendingStart: null,

    /**
     * @type {Promise<boolean>|null} In-flight toggle operation. Rapid
     * clicks on either sound button join the running toggle instead of
     * starting a second, interleaved enable/disable cycle.
     */
    pendingToggle: null,

    /**
     * @type {{audio: Audio, fail: Function}|null} The play attempt
     * currently awaiting its play() promise, so the visibility handler can
     * abort it promptly when the tab hides (a backgrounded tab throttles
     * media loading and would otherwise hang until the safety timeout).
     */
    inFlightAttempt: null
  };

  // Bind the playback functions (manifest loading, file selection,
  // synthesized fallback, theme playback) to the shared state object.
  // This must come after the state declaration: the factory captures the
  // object by reference, so both modules read and write the same values.
  const P = global.DaryaAmbientSoundPlayback.create(state);

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
      if (state.inFlightAttempt) {
        state.inFlightAttempt.fail(D.makeTransientError('AbortError'));
      }
      if (state.currentAudio && !state.currentAudio.paused) {
        state.wasPlayingBeforeHidden = true;
        state.currentAudio.pause();
      } else {
        state.wasPlayingBeforeHidden = false;
      }
    } else {
      // Tab became visible again; resume playback if it was playing
      // before the tab was hidden.
      if (
        state.isEnabled &&
        state.wasPlayingBeforeHidden &&
        state.currentAudio
      ) {
        state.currentAudio.play().catch(function () {
          // If resume fails (unlikely but defensive), do nothing.
          // The user can re-enable via the toggle button.
        });
      }
      state.wasPlayingBeforeHidden = false;
      // The tab returning to focus is a fresh activation. If the user
      // wants sound (saved preference, or a just-aborted toggle kept the
      // intent) but nothing is actually playing, try to start it now.
      // Transient failures are handled safely inside autoplayIfEnabled,
      // so this never wipes the saved preference.
      if ((getSavedState() === true || state.isEnabled) && !isPlaying()) {
        autoplayIfEnabled();
      }
    }
  }

  // Wire the visibility listener once at load time
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // ========================================================================
  // Persistence
  // ========================================================================

  /**
   * Saves the current sound enabled/disabled state to a persistent cookie
   * so the preference is remembered across visits.
   * Best-effort only; failures are silently ignored.
   */
  function saveCookieState() {
    try {
      var expires = new Date(
        Date.now() + D.SOUND_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
      ).toUTCString();
      document.cookie =
        D.SOUND_COOKIE_NAME +
        '=' +
        (state.isEnabled ? '1' : '0') +
        '; expires=' +
        expires +
        '; path=/; SameSite=Lax';
    } catch (e) {
      // Best-effort only; sound still works per-session.
    }
  }

  /**
   * Returns the saved sound state from the cookie, or null if no cookie
   * is found. Used during boot to restore the UI toggle state.
   * @returns {boolean|null} true if enabled, false if disabled, null if unknown
   */
  function getSavedState() {
    try {
      var match = document.cookie.match(
        new RegExp('(?:^|; )' + D.SOUND_COOKIE_NAME + '=([^;]*)')
      );
      if (match) {
        return match[1] === '1';
      }
    } catch (e) {
      // document.cookie may throw in restrictive environments
    }
    return null;
  }

  // ========================================================================
  // Toggle
  // ========================================================================

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
    if (state.pendingToggle) {
      return state.pendingToggle;
    }
    state.pendingToggle = Promise.resolve()
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
          if (enabled && isPlaying() && !state.isUsingFallback) {
            setTimeout(function () {
              state.pendingToggle = null;
            }, D.FADE_DURATION_MS);
          } else {
            state.pendingToggle = null;
          }
          return enabled;
        },
        function () {
          // Defensive: performToggle should never reject, but if it does
          // (an unexpected internal error), settle as "off" and persist
          // it rather than leaving an unhandled rejection that could
          // freeze the toggle.
          state.pendingToggle = null;
          state.isEnabled = false;
          saveCookieState();
          return false;
        }
      );
    return state.pendingToggle;
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
      state.isEnabled = false;
      if (state.pendingThemeTimer) {
        clearTimeout(state.pendingThemeTimer);
        state.pendingThemeTimer = null;
      }
      state.consecutiveFailures = 0;
      return P.stopCurrent().then(function () {
        saveCookieState();
        return false;
      });
    }

    // Enable: load the manifest first (already cached from the boot
    // preload, so this resolves immediately), then start playback.
    // Because the manifest is warm, playThemeSound calls audio.play()
    // within the user gesture, keeping Chrome's transient activation
    // alive.
    return P.loadManifest().then(function (loaded) {
      if (!loaded) {
        // Nothing can play without a manifest; stay (or become) honestly
        // disabled so the toggle never reports an enabled state that no
        // sound could ever back up.
        state.isEnabled = false;
        saveCookieState();
        return false;
      }
      // The theme already switched (the toggle starts the current
      // theme's sound), so any scheduled theme-change start is stale.
      if (state.pendingThemeTimer) {
        clearTimeout(state.pendingThemeTimer);
        state.pendingThemeTimer = null;
      }
      var theme =
        document.documentElement.getAttribute('data-theme') || 'ocean';
      state.isEnabled = true;
      return startPlayback(theme);
    });
  }

  // ========================================================================
  // Theme change
  // ========================================================================

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
    if (!state.isEnabled || newTheme === state.currentTheme) {
      return;
    }

    // Cancel any pending theme-change transition
    if (state.pendingThemeTimer) {
      clearTimeout(state.pendingThemeTimer);
      state.pendingThemeTimer = null;
    }

    // Abort any in-flight load attempt: its theme is about to change, so
    // letting it resolve would either start the wrong theme or get
    // destroyed by the fade-out below. The abort is transient and keeps
    // the user's intent.
    if (state.inFlightAttempt) {
      state.inFlightAttempt.fail(D.makeTransientError('AbortError'));
    }

    // Start fading out the current audio immediately
    if (state.currentAudio) {
      var oldAudio = state.currentAudio;
      state.currentAudio = null;
      state.currentTheme = null;
      H.fadeOut(oldAudio, D.FADE_DURATION_MS * 0.6).then(function () {
        H.destroyAudio(oldAudio);
      });
    }

    // Destroy any active synthesized fallback
    if (state.isUsingFallback || state.synthesizedController) {
      P.destroySynthesized();
      state.currentTheme = null;
    }

    // Schedule the new theme's sound to start after a short delay. The
    // start can happen outside a user gesture, and an autoplay-policy
    // rejection on the first or second attempt must not surface as an
    // unhandled promise rejection. startPlayback shares any in-flight
    // start and never rejects: transient failures keep the user's
    // intent, and genuine failures roll back the enabled state
    // internally.
    state.pendingThemeTimer = setTimeout(function () {
      state.pendingThemeTimer = null;
      startPlayback(newTheme);
    }, D.THEME_CHANGE_DELAY_MS);
  }

  // ========================================================================
  // Volume and status
  // ========================================================================

  /**
   * Sets the target playback volume (0-1) and applies it to the currently
   * playing audio element if one exists.
   * Values outside the 0-1 range are clamped.
   * @param {number} level - Volume level between 0 (silent) and 1 (max)
   */
  function setVolume(level) {
    state.targetVolume = Math.max(0, Math.min(1, level));
    if (state.currentAudio) {
      state.currentAudio.volume = state.targetVolume;
    }
    if (
      state.synthesizedController &&
      typeof state.synthesizedController.setVolume === 'function'
    ) {
      state.synthesizedController.setVolume(state.targetVolume);
    }
  }

  /**
   * Returns true if ambient sound is currently playing (enabled, has an
   * active audio element, and the audio is not paused or stalled).
   * @returns {boolean}
   */
  function isPlaying() {
    if (!state.isEnabled) {
      return false;
    }
    // Synthesized fallback
    if (state.isUsingFallback && state.synthesizedController) {
      return true;
    }
    // File-based audio
    return (
      state.currentAudio !== null &&
      state.currentAudio.readyState >= 2 &&
      !state.currentAudio.paused
    );
  }

  // ========================================================================
  // Playback orchestration
  // ========================================================================

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
    if (state.pendingStart) {
      return state.pendingStart;
    }
    state.pendingStart = P.playThemeSound(theme).then(
      function () {
        state.pendingStart = null;
        // Playback started (or the synthesized fallback took over):
        // persist the state so the preference survives the session.
        saveCookieState();
        // Report the ACTUAL enabled state: the synthesized fallback may
        // have disabled the system internally if it could not start.
        return state.isEnabled;
      },
      function (err) {
        state.pendingStart = null;
        // A transient failure (autoplay policy, tab-hidden abort, or
        // slow-network timeout) is not a playback failure: the file is
        // fine, the context was just not ready. Keep the saved intent so
        // a later gesture or tab return can retry. Genuine load/decode
        // errors still roll back honestly so the UI never claims sound
        // is enabled when it cannot play.
        if (D.isTransientError(err)) {
          return state.isEnabled;
        }
        // Playback rejected (network error, decode failure, or load
        // error). Roll back the enabled state so the UI correctly
        // reports that no sound is playing.
        state.isEnabled = false;
        saveCookieState();
        return false;
      }
    );
    return state.pendingStart;
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
    if (state.pendingStart) {
      return state.pendingStart;
    }
    if (state.isEnabled && !isPlaying()) {
      var theme =
        document.documentElement.getAttribute('data-theme') || 'ocean';
      return startPlayback(theme);
    }
    return Promise.resolve(state.isEnabled);
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
    P.loadManifest();
  }

  const DaryaAmbientSound = {
    toggle,
    onThemeChange,
    setVolume,
    isPlaying,
    getSavedState,
    autoplayIfEnabled,
    get enabled() {
      return state.isEnabled;
    },
    get currentTheme() {
      return state.currentTheme;
    }
  };

  global.DaryaAmbientSound = DaryaAmbientSound;
})(typeof window !== 'undefined' ? window : globalThis);
