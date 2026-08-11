/**
 * Darya - ambient sound integration (part file).
 * Provides the sound toggle UI sync and bilingual UI text lookup as a
 * factory bound to the shared controller object created by index.js.
 * Ambient sound is strictly opt-in: it starts silent and only ever
 * plays after the user clicks a toggle button.
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
     * Returns the UI string for the given key from both language packs as
     * a bilingual pair { fa, en }. Notifications always show Persian on
     * top and English below, so both strings are needed regardless of the
     * active conversation language. Falls back to the English fallback
     * text when a pack is missing.
     * @param {string} key - UI string key (e.g. 'engineErrorHint')
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

    return {
      syncSoundToggleUI,
      getBilingualUiText
    };
  }

  global.DaryaAppSound = {
    create: createSound
  };
})(typeof window !== 'undefined' ? window : globalThis);
