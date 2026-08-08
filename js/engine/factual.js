/**
 * Darya - Factual question handling (assembler).
 *
 * The handlers live in three part files (factual-math.js,
 * factual-datetime.js, factual-fun-facts.js); this file assembles them
 * onto DaryaFactual for the responder, keeping every file under the
 * line limit.
 */
(function (global) {
  'use strict';

  const { handleFactualQuestion } = global.DaryaFactualMath;
  const { handleDateTimeQuestion } = global.DaryaFactualDateTime;
  const { handleFunFactsRequest } = global.DaryaFactualFunFacts;

  global.DaryaFactual = {
    handleFactualQuestion,
    handleDateTimeQuestion,
    handleFunFactsRequest
  };
})(typeof window !== 'undefined' ? window : globalThis);
