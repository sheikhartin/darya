/**
 * Darya classic script - fa response pool registrar.
 *
 * The response pools are split across three part files
 * (fa-responses-pools-a/b/c.js) so each stays under the line limit.
 * This file only initializes the shared object; the part files fill it
 * in load order, so the pool object is complete before fa-rules.js and
 * the fa.js pack assembler read from it.
 */
(function (global) {
  'use strict';

  global.DaryaFaResponses = {};
})(typeof window !== 'undefined' ? window : globalThis);
