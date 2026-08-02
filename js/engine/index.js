/**
 * Darya - engine barrel (classic script).
 * Bundles the engine class together with its shared utilities so
 * consumers can import from a single namespace (mainly the test suite).
 */
(function (global) {
  'use strict';

  global.DaryaEngine = Object.assign(
    { DaryaResponseEngine: global.DaryaResponseEngine },
    global.DaryaUtils
  );
})(typeof window !== 'undefined' ? window : globalThis);
