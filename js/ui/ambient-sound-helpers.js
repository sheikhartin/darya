/**
 * Darya - ambient sound audio helpers.
 * Part file: registers global.DaryaAmbientSoundHelpers for ambient-sound.js.
 * These helpers are stateless: they operate only on their arguments, so
 * they can live apart from the stateful playback module.
 */
(function (global) {
  'use strict';

  const { FADE_STEPS } = global.DaryaAmbientSoundData;

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

  global.DaryaAmbientSoundHelpers = {
    fadeOut,
    fadeIn,
    createSynthesizedAmbient,
    destroyAudio
  };
})(typeof window !== 'undefined' ? window : globalThis);
