/**
 * Darya - languages barrel (classic script).
 * Exposes both language packs as global.DaryaLang so UI modules can pick
 * the active pack by code (e.g. ambient-sound.js).
 */
(function (global) {
  'use strict';

  global.DaryaLang = {
    fa: global.DaryaFa,
    en: global.DaryaEn
  };
})(typeof window !== 'undefined' ? window : globalThis);
