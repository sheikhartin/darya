/**
 * Engine-level test suite for Darya.
 *
 * Uses Node's built-in test runner and assertion module exclusively, so
 * there is nothing to install: `node --test tests/engine.test.js` (or
 * just `npm test` / `./tests/run-tests.sh`, which runs this alongside the
 * shell-based checks) is enough on any machine with a reasonably recent
 * Node.js (18+).
 *
 * These tests exercise the conversation engine and both language packs
 * directly, with no browser involved -- everything here is pure logic
 * that also runs identically inside the actual page. Several tests are
 * explicit regression tests for real bugs caught during development
 * (documented inline), so they also serve as a record of what to watch
 * for if the matching logic changes again.
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// The language packs and engine attach themselves to a global `window`
// object (so they work unmodified as plain <script> tags in the browser).
// Node has no such global by default, so we provide one before loading them.
global.window = global;
require(path.join(__dirname, '..', 'js', 'languages', 'fa.js'));
require(path.join(__dirname, '..', 'js', 'languages', 'en.js'));
require(path.join(__dirname, '..', 'js', 'darya-engine.js'));

const { DaryaResponseEngine, isValidScript } = global.DaryaEngine;
const { fa: FA, en: EN } = global.DaryaLang;

function freshEngine(lang) {
  return new DaryaResponseEngine(lang);
}

// ============================================================================
// Normalization
// ============================================================================

test('fa normalize: unifies Arabic look-alike letters to Persian forms', () => {
  assert.equal(FA.normalize('علي'), 'علی'); // Arabic yeh -> Persian yeh
  assert.equal(FA.normalize('كتاب'), 'کتاب'); // Arabic kaf -> Persian kaf
});

test('fa normalize: strips Arabic diacritics', () => {
  const withDiacritics = 'السَّلَامُ عَلَيْكُمْ';
  const stripped = FA.normalize(withDiacritics);
  assert.ok(!/[\u064B-\u065F]/.test(stripped), 'no diacritic marks should remain');
});

test('fa normalize: converts Arabic-Indic digits to Persian digits', () => {
  assert.equal(FA.normalize('١٢٣'), '۱۲۳');
});

test('fa normalize: corrects "می" + space to the half-space (ZWNJ) form', () => {
  assert.equal(FA.normalize('می خواهم بروم'), 'می\u200cخواهم بروم');
});

test('fa normalize regression: does NOT corrupt words that merely contain می/می-like substrings', () => {
  // "کمی" ("a bit") ends in the same two letters as the "می" prefix, but
  // is a separate, unrelated word and must be left untouched.
  assert.equal(FA.normalize('کمی خسته‌ام'), 'کمی خسته‌ام');
  // "میز" (table) and "میدان" (square) start with "می" as part of their
  // own root, not as the verb prefix -- also must be left untouched.
  assert.equal(FA.normalize('زیر میز است'), 'زیر میز است');
  assert.equal(FA.normalize('میدان آزادی'), 'میدان آزادی');
});

test('fa normalize: leaves already space-free forms alone (no dictionary to safely guess with)', () => {
  assert.equal(FA.normalize('میخواهم بروم'), 'میخواهم بروم');
});

test('en normalize: unifies smart/curly quotes to plain ASCII', () => {
  assert.equal(EN.normalize('I\u2019m tired'), "I'm tired");
  assert.equal(EN.normalize('\u201Chello\u201D'), '"hello"');
});

test('en normalize: collapses and trims whitespace', () => {
  assert.equal(EN.normalize('  hello   world  '), 'hello world');
});

// ============================================================================
// Script validation (isValidScript / foreign-language redirect)
// ============================================================================

test('isValidScript: accepts script-neutral content (digits, emoji, punctuation) in either language', () => {
  assert.equal(isValidScript('12345', FA), true);
  assert.equal(isValidScript('😊👍', FA), true);
  assert.equal(isValidScript('12345', EN), true);
});

test('isValidScript: rejects the other language\'s script', () => {
  assert.equal(isValidScript('hello there, how are you', FA), false);
  assert.equal(isValidScript('سلام حال شما چطور است', EN), false);
});

test('respond(): redirects politely instead of processing foreign-script input', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('hello there');
  assert.match(reply, /فارسی/, 'the redirect message should mention Persian');
});

// ============================================================================
// Regression: the "پدربزرگ" (grandfather) word-boundary bug
// ============================================================================

test('regression: "پدربزرگ" (grandfather) is not misparsed as "پدر" (father) + garbage', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('پدربزرگم فوت کرد');
  // The old bug produced a reply containing the mangled leftover
  // "بزرگم" reflected back in a family-topic template. The fix routes
  // this to the grief rule instead, whose responses never do that.
  assert.doesNotMatch(reply, /بزرگم/);
});

test('regression: inflected forms are still recognized after the word-boundary fix', () => {
  const engine = freshEngine(FA);
  // "غمگینم" = "غمگین" (sad) + attached "م" suffix ("I am sad"). Checking
  // exact membership in the sadness rule's own response pool (rather than
  // a substring like "غم") avoids flakiness from the pool's random
  // selection landing on a variant that phrases it differently.
  const reply = engine.respond('امروز خیلی غمگینم');
  const sadnessResponses = FA.rules.find((r) => r.topic === 'sadness').responses;
  assert.ok(sadnessResponses.includes(reply), `expected a sadness-rule response, got: ${reply}`);
});

test('regression: "چراغ" (lamp) does not falsely trigger question-word detection for "چرا" (why)', () => {
  assert.equal(FA.questionPattern.test('چراغ اتاقم خراب شده'), false);
  assert.equal(FA.questionPattern.test('چرا همیشه همینطوریه؟'), true);
});

test('regression: Persian question marks are not mistaken for letters in word-boundary checks', () => {
  // "؟" (U+061F) shares the same Unicode block as Persian letters but is
  // punctuation, not a letter -- a naive range check treated it as one,
  // which silently broke matching for anything ending right before it.
  const engine = freshEngine(FA);
  const reply = engine.respond('حالت چطوره؟');
  assert.match(reply, /خوب|حس/, 'should hit the how-are-you small-talk rule, not a generic fallback');
});

// ============================================================================
// Core rule matching (spot checks across both languages)
// ============================================================================

test('fa: safety rule takes priority and gives a crisis-appropriate response', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('دیگه نمیخوام زندگی کنم');
  assert.match(reply, /تنها نیستید|کمک تخصصی|توجه فوری/);
});

test('en: safety rule takes priority and gives a crisis-appropriate response', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('I want to kill myself');
  assert.match(reply, /not alone|crisis line|professional help/);
});

test('en: small-talk "how are you" is recognized', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('hi, how are you?');
  assert.match(reply, /doing well|good/i);
});

test('en: small-talk identity question is recognized', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('who are you?');
  assert.match(reply, /Darya|companion/);
});

test('exit detection works in both languages', () => {
  assert.equal(freshEngine(FA).isExitCommand('خداحافظ'), true);
  assert.equal(freshEngine(FA).isExitCommand('سلام'), false);
  assert.equal(freshEngine(EN).isExitCommand('goodbye'), true);
  assert.equal(freshEngine(EN).isExitCommand('hello'), false);
});

// ============================================================================
// Conversational intelligence: repetition avoidance, sentiment, question handling
// ============================================================================

test('repetition avoidance: 10 consecutive same-topic turns produce mostly distinct replies', () => {
  const engine = freshEngine(EN);
  const seen = new Set();
  for (let i = 0; i < 10; i += 1) {
    seen.add(engine.respond('I feel anxious and stressed'));
  }
  assert.ok(seen.size >= 6, `expected strong variety, got only ${seen.size}/10 distinct replies`);
});

test('distress nudge: fires once after 3 consecutive negative-leaning messages, not every turn', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel so sad');
  engine.respond('everything feels hopeless and exhausting');
  const third = engine.respond('I am tired and overwhelmed');
  assert.match(third, /breathe|pause|heavy/i);

  // A 4th negative message right after should NOT immediately re-nudge.
  const fourth = engine.respond('still feeling low');
  assert.doesNotMatch(fourth, /breathe in for a count of four/i);
});

test('distress nudge never overrides the safety rule, even mid-streak', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel so sad');
  engine.respond('everything feels hopeless and exhausting');
  const reply = engine.respond('I am so tired I want to kill myself');
  assert.match(reply, /not alone|crisis line|professional help/);
});

test('question fallback: a direct question gets acknowledged, not just reflected', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('do you ever get tired of listening?');
  assert.match(reply, /question|sitting with|take on it/i);
});

test('question fallback: a plain statement does not trigger the question fallback', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('just thinking about random stuff today');
  assert.doesNotMatch(reply, /thoughtful question/i);
});

test('greeting and farewell pools are honored and vary across repeated calls', () => {
  const seen = new Set();
  for (let i = 0; i < 15; i += 1) {
    seen.add(freshEngine(EN).greeting());
  }
  assert.ok(seen.size > 1, 'greeting should not always be the same line');
});

// ============================================================================
// Bilingual parity: both language packs expose the same engine-facing shape
// ============================================================================

test('bilingual parity: fa and en packs expose the same structural fields', () => {
  const requiredFields = [
    'code', 'dir', 'botName', 'scriptRange', 'minScriptRatio', 'normalize',
    'rules', 'trivialCaptures', 'genericFallbacks', 'strategyShiftFallbacks',
    'sessionCheckIns', 'checkInEvery', 'questionPattern', 'questionFallbacks',
    'topicCallbacks', 'quotedCallbackTemplates', 'distressNudges',
    'sentimentLexicon', 'exitKeywords', 'greetings', 'farewells',
    'emptyInputReply', 'foreignLanguageRedirect', 'ui',
  ];
  for (const field of requiredFields) {
    assert.ok(field in FA, `fa pack is missing "${field}"`);
    assert.ok(field in EN, `en pack is missing "${field}"`);
  }
});

test('bilingual parity: both packs cover the same set of topics', () => {
  const faTopics = new Set(FA.rules.map((r) => r.topic));
  const enTopics = new Set(EN.rules.map((r) => r.topic));
  assert.deepEqual(faTopics, enTopics, 'fa and en should recognize the same topics, just phrased natively');
});

test('bilingual parity: both packs expose the same UI string keys', () => {
  const faKeys = Object.keys(FA.ui).sort();
  const enKeys = Object.keys(EN.ui).sort();
  assert.deepEqual(faKeys, enKeys);
});

test('English-only pronoun reflection is intentionally absent from Persian', () => {
  assert.equal(FA.pronounMap, null);
  assert.ok(EN.pronounMap && typeof EN.pronounMap === 'object');
});

test('pronoun reflection produces a grammatical, safely-bounded result', () => {
  const engine = freshEngine(EN);
  const seen = new Set();
  for (let trial = 0; trial < 60; trial += 1) {
    const e = freshEngine(EN);
    e.respond('hi');
    seen.add(e.respond('I keep thinking about my old apartment'));
  }
  const reflected = [...seen].find((r) => r.toLowerCase().startsWith('so '));
  assert.ok(reflected, 'expected at least one pronoun-reflected reply across 60 trials');
  assert.match(reflected, /you keep thinking about your old apartment/i);
});

console.log(`\nTests loaded from: ${__filename}`);
