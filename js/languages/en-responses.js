/**
 * Darya classic script - en response pool registrar.
 *
 * The response pools are split across three part files
 * (en-responses-pools-a/b/c.js) so each stays under the line limit.
 * This file only initializes the shared object; the part files fill it
 * in load order, so the pool object is complete before en-rules.js and
 * the en.js pack assembler read from it.
 */
(function (global) {
  'use strict';

  global.DaryaEnResponses = {};
})(typeof window !== 'undefined' ? window : globalThis);
