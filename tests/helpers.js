/**
 * Shared test helpers for the Darya test suite.
 *
 * Provides a single bootstrap point for loading the language packs and
 * engine modules into Node's global scope (simulating browser <script> tag
 * loading), plus convenience functions used across all three test files.
 *
 * Usage:
 *   const { freshEngine, read } = require('./helpers');
 */

'use strict';

const path = require('node:path');
const fs = require('node:fs');

// The language packs and engine attach themselves to a global `window`
// object (so they work unmodified as plain <script> tags in the browser).
// Node has no such global by default, so we provide one before loading them.
global.window = global;

const ROOT = path.join(__dirname, '..');

// Load order: halfspace -> entity-extractor -> knowledge shelf -> language packs -> engine
require(path.join(ROOT, 'js', 'languages', 'halfspace.js'));
require(path.join(ROOT, 'js', 'languages', 'entity-extractor.js'));
require(path.join(ROOT, 'js', 'data', 'knowledge-base.js'));
require(path.join(ROOT, 'js', 'languages', 'fa.js'));
require(path.join(ROOT, 'js', 'languages', 'en.js'));
require(path.join(ROOT, 'js', 'engine', 'utils.js'));
require(path.join(ROOT, 'js', 'engine', 'responder.js'));

const { DaryaResponseEngine, isValidScript, normalizeForMatching, scoreSentiment } = global.DaryaEngine;
const { fa: FA, en: EN } = global.DaryaLang;

/**
 * Create a fresh engine instance for the given language pack.
 * @param {object} lang - Language pack object (FA or EN)
 * @returns {DaryaResponseEngine}
 */
function freshEngine(lang) {
  return new DaryaResponseEngine(lang);
}

/**
 * Read a project-relative file and return its contents as a string.
 * @param {string} relativePath - Path relative to the project root
 * @returns {string}
 */
function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

/**
 * Simulate deterministic Math.random using a Linear Congruential Generator.
 * Returns a restore function that resets Math.random to its original value.
 * @param {number} [seed=0x12345678]
 * @returns {Function} Call to restore original Math.random
 */
function seededRandom(seed) {
  const oldRandom = Math.random;
  let state = seed || 0x12345678;
  Math.random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  return () => { Math.random = oldRandom; };
}

/**
 * Compute relative luminance from a hex color string.
 * @param {string} hex - e.g. '#0a2229'
 * @returns {number}
 */
function luminance(hex) {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

/**
 * Compute contrast ratio between two hex colors.
 * @param {string} foreground
 * @param {string} background
 * @returns {number}
 */
function contrastRatio(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

module.exports = {
  freshEngine,
  read,
  seededRandom,
  luminance,
  contrastRatio,
  // Re-export engine constants for convenience
  DaryaResponseEngine: global.DaryaEngine.DaryaResponseEngine,
  isValidScript: global.DaryaEngine.isValidScript,
  normalizeForMatching: global.DaryaEngine.normalizeForMatching,
  DaryaEngine: global.DaryaEngine,
  // Language packs
  FA,
  EN,
  // Entity extractor
  DaryaEntityExtractor: global.DaryaEntityExtractor,
  // Knowledge shelf
  DaryaKnowledge: global.DaryaKnowledge,
  // Root path
  ROOT,
};
