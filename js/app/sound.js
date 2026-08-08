/**
 * Darya - ambient sound integration (part file).
 * Provides the sound toggle UI sync, the picker attention nudge, the
 * blocked-autoplay toast, and the one-time first-gesture autoplay
 * listener as a factory bound to the shared controller object created
 * by index.js.
 */
(function (global) {
  'use strict';

  /**
   * Creates the sound-integration functions.
   * @param {object} ctrl - Shared controller state (see app.js)
   * @returns {object} Functions for ambient sound UI integration
   */
  function createSound(ctrl) {
    const { el, st } = ctrl;

    /**
     * Syncs both the menu and picker sound toggles' visible state with the
     * ACTUAL ambient playback state, so neither icon ever shows "on" while
     * silence plays. Falls back to hardcoded Persian when no language pack
     * is active yet (the app shell defaults to Persian).
     * @param {boolean} enabled - True when ambient sound is really playing.
     */
    function syncSoundToggleUI(enabled) {
      // Sound is genuinely playing now; the picker nudge has served its
      // purpose and must not keep pulsing.
      if (enabled) {
        clearSoundAttention();
      }
      if (el.menuSoundToggle) {
        var onLabel = st.lang
          ? st.lang.ui.soundOnTitle
          : '\u067e\u062e\u0634 \u0635\u062f\u0627\u06cc \u062d\u0636\u0648\u0637\u06cc: \u0631\u0648\u0634\u0646';
        var offLabel = st.lang
          ? st.lang.ui.soundOffTitle
          : '\u067e\u062e\u0634 \u0635\u062f\u0627\u06cc \u062d\u0636\u0648\u0637\u06cc: \u062e\u0627\u0645\u0648\u0634';
        var label = enabled ? onLabel : offLabel;
        el.menuSoundToggle.setAttribute('aria-pressed', String(enabled));
        el.menuSoundToggle.setAttribute('title', label);
        if (el.menuSoundLabel) {
          el.menuSoundLabel.textContent = label;
        }
      }
      if (el.pickerSoundToggle) {
        el.pickerSoundToggle.setAttribute('aria-pressed', String(enabled));
        // The picker toggle used to show only a static English title, so its
        // accessible name stayed English even in Farsi. Reuse the same
        // localized label the menu item shows. `label` is computed in the
        // menu branch above; guard in case that element ever goes missing.
        if (typeof label !== 'undefined') {
          el.pickerSoundToggle.setAttribute('aria-label', label);
          el.pickerSoundToggle.setAttribute('title', label);
        }
      }
    }

    /**
     * Draws attention to the picker (welcome screen) sound toggle a few
     * seconds after it appears when the user's saved preference wants
     * sound but nothing is actually playing yet (browsers block autoplay
     * until a user gesture). A smooth fade/pulse invites the user to tap
     * the toggle, and that tap is the gesture that starts the sound.
     *
     * The effect is armed only while the picker is visible and the intent
     * is "on" but silent; it is cleared by the first real interaction
     * (toggling, selecting a language, or sound starting).
     */
    function armSoundAttention() {
      clearSoundAttention();
      if (
        el.picker.hidden ||
        typeof ctrl.DaryaAmbientSound === 'undefined' ||
        ctrl.DaryaAmbientSound.getSavedState() !== true ||
        ctrl.DaryaAmbientSound.isPlaying()
      ) {
        return;
      }
      ctrl.soundAttentionTimer = setTimeout(function () {
        ctrl.soundAttentionTimer = null;
        // Re-check at fire time: the user may have started sound or
        // navigated away while the timer was pending.
        if (
          el.picker.hidden ||
          typeof ctrl.DaryaAmbientSound === 'undefined' ||
          ctrl.DaryaAmbientSound.isPlaying()
        ) {
          return;
        }
        el.pickerSoundToggle.classList.add('picker__sound-toggle--attention');
      }, ctrl.SOUND_ATTENTION_DELAY_MS);
    }

    /**
     * Cancels any pending sound-attention timer and removes the attention
     * styling from the picker sound toggle.
     */
    function clearSoundAttention() {
      if (ctrl.soundAttentionTimer !== null) {
        clearTimeout(ctrl.soundAttentionTimer);
        ctrl.soundAttentionTimer = null;
      }
      if (el.pickerSoundToggle) {
        el.pickerSoundToggle.classList.remove(
          'picker__sound-toggle--attention'
        );
      }
    }

    /**
     * Returns the UI string for the given key from both language packs as
     * a bilingual pair { fa, en }. Notifications always show Persian on
     * top and English below, so both strings are needed regardless of the
     * active conversation language. Falls back to the English fallback
     * text when a pack is missing.
     * @param {string} key - UI string key (e.g. 'soundAutoplayBlockedMsg')
     * @param {string} fallbackEn - English fallback text
     * @returns {{fa: string, en: string}}
     */
    function getBilingualUiText(key, fallbackEn) {
      var faText = fallbackEn;
      var enText = fallbackEn;
      if (
        ctrl.DaryaLang &&
        ctrl.DaryaLang.fa &&
        ctrl.DaryaLang.fa.ui &&
        ctrl.DaryaLang.fa.ui[key]
      ) {
        faText = ctrl.DaryaLang.fa.ui[key];
      } else if (st.lang && st.lang.ui && st.lang.ui[key]) {
        faText = st.lang.ui[key];
      }
      if (
        ctrl.DaryaLang &&
        ctrl.DaryaLang.en &&
        ctrl.DaryaLang.en.ui &&
        ctrl.DaryaLang.en.ui[key]
      ) {
        enText = ctrl.DaryaLang.en.ui[key];
      } else if (st.lang && st.lang.ui && st.lang.ui[key]) {
        enText = st.lang.ui[key];
      }
      return { fa: faText, en: enText };
    }

    /**
     * Explains, once per session, that ambient sound could not start
     * automatically and points to the menu toggle. Called by both autoplay
     * paths - the language picker and the global first-gesture listener -
     * with a one-shot flag so a single click that triggers both never
     * shows the toast twice. The message is bilingual (FA on top, EN
     * below) because the notification system renders both languages.
     */
    function notifySoundAutoplayBlocked() {
      if (ctrl.soundBlockedToastShown) {
        return;
      }
      ctrl.soundBlockedToastShown = true;
      var blockedMsg = ctrl.getBilingualUiText(
        'soundAutoplayBlockedMsg',
        'Ambient sound could not start automatically.'
      );
      ctrl.DaryaOverlays.showNotification('warn', blockedMsg, 6000);
    }

    /**
     * Initializes a one-time global user gesture listener. The very first
     * interaction anywhere on the screen (click, tap, or key) will trigger
     * ambient sound playback if the user has it enabled in their settings.
     */
    function initAutoplayGesture() {
      /**
       * Detaches the one-time first-gesture listeners.
       */
      function disarmStartSound() {
        document.removeEventListener('click', startSound);
        document.removeEventListener('keydown', startSound);
        document.removeEventListener('touchstart', startSound);
        document.removeEventListener('pointerdown', startSound);
      }

      var startSound = function (event) {
        // If the first interaction lands on one of the sound toggles
        // themselves, the toggle's own click handler owns that gesture: it
        // starts or stops playback based on its visible state. Firing the
        // first-gesture autoplay here as well would start the sound and
        // then let the toggle's toggle() flip it right back off (the
        // reported "turns on for a second and turns off" bug). Consume
        // the gesture either way so a later click cannot double-start.
        if (
          event.target &&
          typeof event.target.closest === 'function' &&
          event.target.closest('#picker-sound-toggle, #menu-sound-toggle')
        ) {
          disarmStartSound();
          return;
        }
        if (
          typeof ctrl.DaryaAmbientSound !== 'undefined' &&
          ctrl.DaryaAmbientSound.getSavedState() === true
        ) {
          ctrl.DaryaAmbientSound.autoplayIfEnabled().then(function () {
            var actuallyPlaying = ctrl.DaryaAmbientSound.isPlaying();
            ctrl.syncSoundToggleUI(actuallyPlaying);
            if (!actuallyPlaying) {
              ctrl.notifySoundAutoplayBlocked();
            }
          });
        }
        disarmStartSound();
      };
      document.addEventListener('click', startSound, { passive: true });
      document.addEventListener('keydown', startSound, { passive: true });
      document.addEventListener('touchstart', startSound, { passive: true });
      document.addEventListener('pointerdown', startSound, { passive: true });
    }

    return {
      syncSoundToggleUI,
      armSoundAttention,
      clearSoundAttention,
      getBilingualUiText,
      notifySoundAutoplayBlocked,
      initAutoplayGesture
    };
  }

  global.DaryaAppSound = {
    create: createSound
  };
})(typeof window !== 'undefined' ? window : globalThis);
