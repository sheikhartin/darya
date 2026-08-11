/**
 * Darya - ambient sound constants and stateless helpers.
 * Part file: registers global.DaryaAmbientSoundData for ambient-sound.js.
 */
(function (global) {
  'use strict';

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

  /**
   * Name of the cookie that versions before 1.2.0 used to persist the
   * sound toggle state. Kept only so the module can expire it once at
   * load: ambient sound now always boots silent and is started only by
   * the toggle buttons, so a stale "on" cookie must not linger.
   */
  const LEGACY_SOUND_COOKIE_NAME = 'darya_sound';

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

  global.DaryaAmbientSoundData = {
    SOUND_BASE_PATH,
    MANIFEST_PATH,
    DEFAULT_VOLUME,
    FADE_DURATION_MS,
    FADE_STEPS,
    MAX_FAILURES_BEFORE_DISABLE,
    PLAY_ATTEMPT_TIMEOUT_MS,
    THEME_CHANGE_DELAY_MS,
    EXPECTED_MANIFEST_THEMES,
    LEGACY_SOUND_COOKIE_NAME,
    FALLBACK_MANIFEST,
    isFileProtocol,
    isTransientError,
    makeTransientError
  };
})(typeof window !== 'undefined' ? window : globalThis);
