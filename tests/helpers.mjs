/**
 * Shared test helpers for the Darya test suite.
 *
 * The application source is written as classic scripts that attach to the
 * global namespace (so the PWA works from file:// without a server). This
 * helper loads every engine/language/data module in dependency order into
 * the Node global scope, then re-exports the public API for the test files.
 *
 * Usage:
 *   import { freshEngine, read, FA, EN } from './helpers.mjs';
 */

'use strict';

import path from 'node:path';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Classic scripts must load in dependency order so each module's
// `var X = global.DaryaY` lookups resolve before that module runs.
// Do not reorder these entries without checking each module's imports.
// Exported so the quality suite can assert this order stays in sync
// with the <script> tags in index.html (the load-order invariant).
const SCRIPT_ORDER = [
  'js/text/halfspace-data.js',
  'js/text/halfspace.js',
  'js/text/conversational.js',
  'js/text/entity-extractor-data.js',
  'js/text/entity-extractor.js',
  // The knowledge layer is split across domain part files that register
  // globals; the assembly file (knowledge-base.js) must load last.
  'js/data/knowledge-reflections.js',
  'js/data/knowledge-facts-science.js',
  'js/data/knowledge-facts-tech.js',
  'js/data/knowledge-facts-culture.js',
  'js/data/knowledge-facts-life.js',
  'js/data/knowledge-facts-education.js',
  'js/data/knowledge-facts-entertainment.js',
  'js/data/knowledge-facts-project.js',
  'js/data/knowledge-facts-domains.js',
  'js/data/knowledge-facts-daily.js',
  'js/data/knowledge-facts-career.js',
  'js/data/knowledge-facts-work-life.js',
  'js/data/knowledge-facts-skills.js',
  'js/data/knowledge-facts-software-security.js',
  'js/data/knowledge-facts-beliefs-media.js',
  'js/data/knowledge-facts-languages.js',
  'js/data/knowledge-facts-language-compare.js',
  'js/data/knowledge-facts-arts.js',
  'js/data/knowledge-facts-platforms.js',
  'js/data/knowledge-facts-companies.js',
  'js/data/knowledge-facts-techstacks.js',
  'js/data/knowledge-facts-generations.js',
  'js/data/knowledge-facts-foods.js',
  'js/data/knowledge-facts-supplements.js',
  'js/data/knowledge-facts-ides.js',
  'js/data/knowledge-facts-fonts.js',
  'js/data/knowledge-facts-influencers.js',
  'js/data/knowledge-facts-sport-events.js',
  'js/data/knowledge-facts-investing.js',
  'js/data/knowledge-facts-sexuality.js',
  'js/data/knowledge-facts-universities.js',
  'js/data/knowledge-facts-fastfood.js',
  'js/data/knowledge-facts-ai-jobs.js',
  'js/data/knowledge-facts-language-learning.js',
  'js/data/knowledge-facts-mindsets.js',
  'js/data/knowledge-facts-world.js',
  'js/data/knowledge-facts-history-conflict.js',
  'js/data/knowledge-facts-society.js',
  'js/data/knowledge-facts-travel.js',
  'js/data/knowledge-facts-sports.js',
  'js/data/knowledge-facts-fighters.js',
  'js/data/knowledge-facts-fighters-legends.js',
  'js/data/knowledge-facts-people.js',
  'js/data/knowledge-fun-facts.js',
  'js/data/knowledge-lists.js',
  'js/data/media-pool.js',
  'js/data/knowledge-base.js',
  'js/engine/utils-constants.js',
  'js/engine/utils-text.js',
  'js/engine/utils.js',
  'js/engine/emotion-analyzer.js',
  'js/engine/context-window.js',
  'js/engine/personality-engine.js',
  'js/engine/response-scorer.js',
  'js/engine/time-utils.js',
  'js/engine/recap.js',
  'js/engine/factual-math.js',
  'js/engine/factual-datetime.js',
  'js/engine/factual-fun-facts.js',
  'js/engine/factual.js',
  'js/languages/en-responses-base.js',
  'js/languages/en-responses-topics.js',
  'js/languages/en-responses-rules.js',
  'js/languages/en-responses-contexts.js',
  'js/languages/en-responses-features.js',
  'js/languages/en-rules.js',
  'js/languages/en-vocabulary.js',
  'js/languages/en-maps.js',
  'js/languages/en-culture.js',
  'js/languages/en-society.js',
  'js/languages/en.js',
  'js/languages/fa-responses-base.js',
  'js/languages/fa-responses-topics.js',
  'js/languages/fa-responses-rules.js',
  'js/languages/fa-responses-contexts.js',
  'js/languages/fa-responses-features.js',
  'js/languages/fa-rules.js',
  'js/languages/fa-vocabulary.js',
  'js/languages/fa-maps.js',
  'js/languages/fa-culture.js',
  'js/languages/fa-society.js',
  'js/languages/fa.js',
  'js/languages/index.js',
  'js/engine/responder.js',
  'js/engine/responder-public.js',
  'js/engine/responder-detect.js',
  'js/engine/responder-safety.js',
  'js/engine/responder-emotion.js',
  'js/engine/responder-cultural.js',
  'js/engine/responder-phase.js',
  'js/engine/responder-rules.js',
  'js/engine/responder-entity.js',
  'js/engine/responder-profile.js',
  'js/engine/responder-lifefacts.js',
  'js/engine/responder-overrides.js',
  'js/engine/responder-recall.js',
  'js/engine/responder-knowledge-followups.js',
  'js/engine/responder-promise.js',
  'js/engine/responder-exercises.js',
  'js/engine/responder-mood.js',
  'js/engine/index.js'
];

for (const relative of SCRIPT_ORDER) {
  const code = fs.readFileSync(path.join(ROOT, relative), 'utf8');
  // Execute in the shared global scope so modules can see each other's
  // Darya.* attachments. Every module body lives inside an IIFE, so no
  // top-level declarations leak between scripts.
  vm.runInThisContext(code, { filename: relative });
}

const G = globalThis;

/** Engine class plus shared utilities (mirrors the engine barrel). */
const DaryaEngine = G.DaryaEngine;
const DaryaResponseEngine = G.DaryaResponseEngine;
const DaryaKnowledge = G.DaryaKnowledge;
const DaryaEntityExtractor = G.DaryaEntityExtractor;
const U = G.DaryaUtils;
const FA = G.DaryaLang.fa;
const EN = G.DaryaLang.en;
const { halfSpace, ZWNJ } = G.DaryaHalfspace;
const { TimeFetcher } = G.DaryaTimeUtils;
const { isValidScript, normalizeForMatching } = U;

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
  return () => {
    Math.random = oldRandom;
  };
}

/**
 * Compute relative luminance from a hex color string.
 * @param {string} hex - e.g. '#0a2229'
 * @returns {number}
 */
function luminance(hex) {
  const channels = [1, 3, 5].map(
    (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255
  );
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
  const values = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}

/**
 * Convert one bot-facing pool string into the conversational register
 * the engine now emits (see js/text/conversational.js). The language is
 * inferred from the script, so mixed FA/EN test tables can share one
 * helper. Idempotent: already-conversational text passes through.
 * @param {string} text
 * @returns {string}
 */
function casual(text) {
  const langCode = /[\u0600-\u06FF]/u.test(text) ? 'fa' : 'en';
  return G.DaryaConversational.toConversational(text, langCode);
}

/**
 * Map a raw response pool to conversational register, for comparing
 * engine replies against source pools.
 * @param {string[]} pool
 * @returns {string[]}
 */
function casualPool(pool) {
  return (pool || []).map(casual);
}

/**
 * Same as casualPool but returns a Set for membership checks.
 * @param {string[]} pool
 * @returns {Set<string>}
 */
function casualSet(pool) {
  return new Set(casualPool(pool));
}

export {
  DaryaEngine,
  freshEngine,
  read,
  seededRandom,
  luminance,
  contrastRatio,
  DaryaResponseEngine,
  isValidScript,
  normalizeForMatching,
  FA,
  EN,
  DaryaEntityExtractor,
  DaryaKnowledge,
  halfSpace,
  ZWNJ,
  TimeFetcher,
  SCRIPT_ORDER,
  ROOT,
  casual,
  casualPool,
  casualSet
};
