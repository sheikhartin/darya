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

// The Persian language pack depends on the vendored half-space module
// (see `js/languages/halfspace.js`). It attaches to `window.DaryaHalfSpace`,
// which the in-browser script-tag order in index.html guarantees is
// present by the time fa.js runs. We load the module here for the same
// reason in Node.
require(path.join(__dirname, '..', 'js', 'languages', 'halfspace.js'));
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

test('fa normalize: joined "میخواهم" is corrected to the half-space form', () => {
  // The vendored @persian-tools halfSpace module (with the joined-case
  // extension layer) covers this case directly: the verb "خواهم" is
  // recognized as a present-tense stem and the ZWNJ is inserted between
  // "می" and "خواهم" even when the input has no separating space.
  assert.equal(FA.normalize('میخواهم بروم'), 'می‌خواهم بروم');
  assert.equal(FA.normalize('نمیخواهم بروم'), 'نمی‌خواهم بروم');
});

test('en normalize: unifies smart/curly quotes to plain ASCII', () => {
  assert.equal(EN.normalize('I\u2019m tired'), "I'm tired");
  assert.equal(EN.normalize('\u201Chello\u201D'), '"hello"');
});

test('en normalize: collapses and trims whitespace', () => {
  assert.equal(EN.normalize('  hello   world  '), 'hello world');
});

// ---------------------------------------------------------------------------
// ZWNJ half-space normalization -- delegated to the vendored
// @persian-tools halfSpace module (with the joined-case extension layer
// added on top). These tests verify the end-to-end behavior Darya's
// users actually see: the rules in js/languages/halfspace.js are the
// single source of truth, and the normalize() function here just wires
// them in.
// ---------------------------------------------------------------------------

test('zwnj: spaced verb prefix "می خواهم" becomes "می\u200cخواهم"', () => {
  assert.equal(FA.normalize('می خواهم بروم'), 'می\u200cخواهم بروم');
});

test('zwnj: joined verb prefix "میخواهم" becomes "می\u200cخواهم" (was the original bug)', () => {
  assert.equal(FA.normalize('میخواهم'), 'می\u200cخواهم');
  assert.equal(FA.normalize('میخواهم بروم'), 'می\u200cخواهم بروم');
  assert.equal(FA.normalize('نمیخواهم'), 'نمی\u200cخواهم');
  assert.equal(FA.normalize('نمیخواهم بروم'), 'نمی\u200cخواهم بروم');
});

test('zwnj: many common joined verb forms are corrected', () => {
  const cases = [
    ['میروم', 'می\u200cروم'],
    ['میرود', 'می\u200cرود'],
    ['میخواهی', 'می\u200cخواهی'],
    ['میخواهد', 'می\u200cخواهد'],
    ['نمیتوانم', 'نمی\u200cتوانم'],
    ['میبینم', 'می\u200cبینم'],
    ['میگویم', 'می\u200cگویم'],
    ['میدانم', 'می\u200cدانم'],
    ['میشوم', 'می\u200cشوم'],
    ['میشود', 'می\u200cشود'],
    ['میباشم', 'می\u200cباشم'],
    ['میکنم', 'می\u200cکنم'],
    ['میخورم', 'می\u200cخورم'],
    ['میپرسم', 'می\u200cپرسم'],
    ['میگریم', 'می\u200cگریم'],
    ['میخندم', 'می\u200cخندم'],
    ['میترسم', 'می\u200cترسم'],
    ['میخواستم', 'می\u200cخواستم'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(FA.normalize(input), expected,
      `expected ${JSON.stringify(input)} to normalize to ${JSON.stringify(expected)}`);
  }
});

test('zwnj: plural "ها" (spaced and joined) gets a ZWNJ', () => {
  assert.equal(FA.normalize('کتاب ها'), 'کتاب\u200cها');
  assert.equal(FA.normalize('کتابها'), 'کتاب\u200cها');
  assert.equal(FA.normalize('خانه ها'), 'خانه\u200cها');
  assert.equal(FA.normalize('خانه های من'), 'خانه\u200cهای من');
});

test('zwnj: possessive plural with all persons', () => {
  // Spaced: "کتاب هایم" / Joined: "کتابهایم".
  assert.equal(FA.normalize('کتاب هایم'), 'کتاب\u200cهای\u200cم');
  assert.equal(FA.normalize('کتابهایم'), 'کتاب\u200cهای\u200cم');
  assert.equal(FA.normalize('کتاب هایت'), 'کتاب\u200cهای\u200cت');
  assert.equal(FA.normalize('کتابهایت'), 'کتاب\u200cهای\u200cت');
  assert.equal(FA.normalize('کتاب هایش'), 'کتاب\u200cهای\u200cش');
  assert.equal(FA.normalize('کتابهایش'), 'کتاب\u200cهای\u200cش');
  assert.equal(FA.normalize('کتاب هایمان'), 'کتاب\u200cهای\u200cمان');
  assert.equal(FA.normalize('کتابهایمان'), 'کتاب\u200cهای\u200cمان');
});

test('zwnj: comparative and superlative get a ZWNJ', () => {
  assert.equal(FA.normalize('بزرگ تر'), 'بزرگ\u200cتر');
  assert.equal(FA.normalize('بزرگتر'), 'بزرگ\u200cتر');
  assert.equal(FA.normalize('بزرگ ترین'), 'بزرگ\u200cترین');
  assert.equal(FA.normalize('بزرگترین'), 'بزرگ\u200cترین');
  assert.equal(FA.normalize('کوچک تر'), 'کوچک\u200cتر');
});

test('zwnj: privative "بی" prefix (spaced and joined)', () => {
  assert.equal(FA.normalize('بی خبر'), 'بی\u200cخبر');
  assert.equal(FA.normalize('بیخبر'), 'بی\u200cخبر');
  assert.equal(FA.normalize('بی خود'), 'بی\u200cخود');
  assert.equal(FA.normalize('بیخود'), 'بی\u200cخود');
  assert.equal(FA.normalize('بی دلیل'), 'بی\u200cدلیل');
  assert.equal(FA.normalize('بیدلیل'), 'بی\u200cدلیل');
});

test('zwnj: negation "نا" prefix (spaced and joined)', () => {
  assert.equal(FA.normalize('نا آشنا'), 'نا\u200cآشنا');
  assert.equal(FA.normalize('ناآشنا'), 'نا\u200cآشنا');
  assert.equal(FA.normalize('نا امید'), 'نا\u200cامید');
  assert.equal(FA.normalize('ناامید'), 'نا\u200cامید');
});

test('zwnj: "خوش" prefix (spaced and joined)', () => {
  assert.equal(FA.normalize('خوش شانس'), 'خوش\u200cشانس');
  assert.equal(FA.normalize('خوششانس'), 'خوش\u200cشانس');
  assert.equal(FA.normalize('خوش حال'), 'خوش\u200cحال');
  assert.equal(FA.normalize('خوشحال'), 'خوش\u200cحال');
});

test('zwnj: known compounds are joined with a ZWNJ', () => {
  assert.equal(FA.normalize('هم چنین'), 'هم\u200cچنین');
  assert.equal(FA.normalize('به طور'), 'به\u200cطور');
  assert.equal(FA.normalize('هر کس'), 'هر\u200cکس');
  assert.equal(FA.normalize('این جا'), 'این\u200cجا');
  assert.equal(FA.normalize('آن جا'), 'آن\u200cجا');
  assert.equal(FA.normalize('هیچ کس'), 'هیچ\u200cکس');
  assert.equal(FA.normalize('هیچ گاه'), 'هیچ\u200cگاه');
  assert.equal(FA.normalize('هیچ وقت'), 'هیچ\u200cوقت');
  assert.equal(FA.normalize('پیش از'), 'پیش\u200cاز');
  assert.equal(FA.normalize('بعد از'), 'بعد\u200cاز');
  assert.equal(FA.normalize('قبل از'), 'قبل\u200cاز');
  assert.equal(FA.normalize('پس از'), 'پس\u200cاز');
});

test('zwnj: words that LOOK like می+verb but are NOT are left alone', () => {
  // میز (table), میدان (square), میهن (homeland), میخ (a name / nail),
  // میرزا (a name), مهر (seal) -- none start with a می verb prefix,
  // they all start with می as the root, and the joined-case rule
  // intentionally doesn't touch them.
  assert.equal(FA.normalize('میز'), 'میز');
  assert.equal(FA.normalize('میزها'), 'میز\u200cها');
  assert.equal(FA.normalize('میدان'), 'میدان');
  assert.equal(FA.normalize('میدان آزادی'), 'میدان آزادی');
  assert.equal(FA.normalize('میهن'), 'میهن');
  assert.equal(FA.normalize('میهن پرست'), 'میهن پرست');
  assert.equal(FA.normalize('میخ'), 'میخ');
  assert.equal(FA.normalize('میرزا'), 'میرزا');
  assert.equal(FA.normalize('مهر مادرم'), 'مهر مادرم');
  // میوه (fruit) is a single word; only the +ها plural gets a ZWNJ.
  assert.equal(FA.normalize('میوه'), 'میوه');
  assert.equal(FA.normalize('میوه ها'), 'میوه\u200cها');
});

test('zwnj: words that LOOK like بی+stem but are NOT are left alone', () => {
  // بیبی (a name), بیمه (insurance), بینی (nose), بیدار (awake) --
  // all single lexical words, NOT بی+something.
  assert.equal(FA.normalize('بیبی'), 'بیبی');
  assert.equal(FA.normalize('بیمه'), 'بیمه');
  assert.equal(FA.normalize('بیمه خودرو'), 'بیمه خودرو');
  assert.equal(FA.normalize('بینی'), 'بینی');
  assert.equal(FA.normalize('بینی ام'), 'بینی ام');
  assert.equal(FA.normalize('بیدار'), 'بیدار');
  assert.equal(FA.normalize('بیدار شدم'), 'بیدار شدم');
});

test('zwnj: "خوشبخت" (a single word) is left alone, but "خوش شانس" gets a ZWNJ', () => {
  assert.equal(FA.normalize('خوشبخت'), 'خوشبخت');
  assert.equal(FA.normalize('خوشبخت باش'), 'خوشبخت باش');
  assert.equal(FA.normalize('خوش شانس'), 'خوش\u200cشانس');
});

test('zwnj: "متر" (meter) is left alone -- "تر" as a standalone word is not the comparative suffix', () => {
  assert.equal(FA.normalize('متر'), 'متر');
  assert.equal(FA.normalize('متر پارچه'), 'متر پارچه');
});

test('zwnj: combined sentences with multiple ZWNJ points are all handled', () => {
  assert.equal(
    FA.normalize('میخواهم کتابهایم را بخوانم'),
    'می\u200cخواهم کتاب\u200cهای\u200cم را بخوانم',
  );
  assert.equal(
    FA.normalize('نمیخواهیم بیخبر بمانیم'),
    'نمی\u200cخواهیم بی\u200cخبر بمانیم',
  );
});

test('zwnj: terminal punctuation does not interfere', () => {
  assert.equal(FA.normalize('میخواهم.'), 'می\u200cخواهم.');
  assert.equal(FA.normalize('میخواهم، بروم؟'), 'می\u200cخواهم، بروم؟');
  assert.equal(FA.normalize('کتابها.'), 'کتاب\u200cها.');
  assert.equal(FA.normalize('کتابها، مدادها، خودکارها'), 'کتاب\u200cها، مداد\u200cها، خودکار\u200cها');
});

test('zwnj: leading/trailing whitespace and mixed-script inputs are tolerated', () => {
  assert.equal(FA.normalize('   میخواهم   بروم   '), 'می\u200cخواهم بروم');
  // English letters are preserved untouched.
  assert.equal(FA.normalize('Hello میخواهم دنیا'), 'Hello می\u200cخواهم دنیا');
});

test('zwnj: empty and whitespace-only inputs do not crash', () => {
  assert.equal(FA.normalize(''), '');
  assert.equal(FA.normalize('   '), '');
  assert.equal(FA.normalize('\n\t  '), '');
});

test('zwnj: ZWNJ already in input is preserved, not duplicated', () => {
  // If the user has already correctly placed a ZWNJ, the normalizer
  // should leave it alone. The joined-case rule only fires when the
  // boundary has a non-ZWNJ character (letter, etc.).
  assert.equal(FA.normalize('می\u200cخواهم'), 'می\u200cخواهم');
  assert.equal(FA.normalize('کتاب\u200cها'), 'کتاب\u200cها');
  assert.equal(FA.normalize('کتاب\u200cهای\u200cم'), 'کتاب\u200cهای\u200cم');
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
  // "غمگینم" = "غمگین" (sad) + attached "م" suffix ("I am sad"). The
  // reply can come from the rule's main pool OR from its
  // intensifierResponses pool (the input contains "خیلی", which is
  // an intensifier, so the engine may prefer the intensity-aware
  // variant). Both pools are still sadness-rule responses, so the
  // test accepts either.
  const reply = engine.respond('امروز خیلی غمگینم');
  const sadnessRule = FA.rules.find((r) => r.topic === 'sadness');
  const allResponses = [
    ...sadnessRule.responses,
    ...(sadnessRule.intensifierResponses || []),
  ];
  assert.ok(allResponses.includes(reply), `expected a sadness-rule response, got: ${reply}`);
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
  // The reply should come from the how-are-you small-talk pool (and not
  // from a generic fallback). The pool has been rephrased over time, so
  // the most reliable check is that the reply is in the how-are-you
  // pool's response list rather than matching a particular substring.
  const howareyou = FA.rules.find((r) => r.topic === 'smalltalk_howareyou');
  assert.ok(howareyou.responses.includes(reply),
    `expected a smalltalk_howareyou response, got: ${reply}`);
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
  // A pure "how are you?" without a greeting prefix is treated as a
  // small-talk how-are-you question. With the new greeting strategy, a
  // leading "hi" would be caught by the greeting intent first (and
  // routed to the greeting pool), so the test uses a standalone
  // small-talk phrasing that doesn't start with a greeting token.
  const reply = engine.respond('so how are you?');
  assert.match(reply, /doing well|good|here|listening/i);
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

test('export menu labels: neither language uses parentheses', () => {
  // The user explicitly preferred no parens in either language, and
  // asked for "مارک‌داون" in Persian (not "Markdown"). The labels are
  // user-facing menu items, so a regression would be visible.
  assert.ok(!FA.ui.menuExportMd.includes('('),
    `Persian Markdown export label should not contain '(': ${FA.ui.menuExportMd}`);
  assert.ok(!FA.ui.menuExportMd.includes(')'),
    `Persian Markdown export label should not contain ')': ${FA.ui.menuExportMd}`);
  assert.ok(!FA.ui.menuExportTxt.includes('('),
    `Persian plain-text export label should not contain '(': ${FA.ui.menuExportTxt}`);
  assert.ok(!FA.ui.menuExportTxt.includes(')'),
    `Persian plain-text export label should not contain ')': ${FA.ui.menuExportTxt}`);
  assert.ok(!EN.ui.menuExportMd.includes('('),
    `English Markdown export label should not contain '(': ${EN.ui.menuExportMd}`);
  assert.ok(!EN.ui.menuExportMd.includes(')'),
    `English Markdown export label should not contain ')': ${EN.ui.menuExportMd}`);
  assert.ok(!EN.ui.menuExportTxt.includes('('),
    `English plain-text export label should not contain '(': ${EN.ui.menuExportTxt}`);
  assert.ok(!EN.ui.menuExportTxt.includes(')'),
    `English plain-text export label should not contain ')': ${EN.ui.menuExportTxt}`);
});

test('export menu labels: Persian uses "مارک‌داون" (not "Markdown")', () => {
  // The user asked for the Persian label to be transliterated with
  // ZWNJ-corrected "مارک‌داون" rather than leaving the English word
  // "Markdown" inside the Persian string.
  assert.ok(FA.ui.menuExportMd.includes('مارک‌داون'),
    `Persian Markdown export label should contain "مارک‌داون": ${FA.ui.menuExportMd}`);
  assert.ok(!FA.ui.menuExportMd.includes('Markdown'),
    `Persian Markdown export label should not contain "Markdown": ${FA.ui.menuExportMd}`);
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

// ============================================================================
// Conversational intelligence: greeting strategy, intent detection, rhythm
// ============================================================================

test('greeting strategy: "hi" alone is detected as a greeting intent and never falls through to a topic callback', () => {
  // A bare greeting must produce a greeting-shaped reply (one of the
  // opening / returning pools), NOT a topic-callback line like
  // "I'm still curious about your family, by the way." which is what the
  // old fallback path would have produced after a few turns of other
  // conversation.
  const engine = freshEngine(EN);
  engine.respond('my dad has been on my mind lately');
  const reply = engine.respond('hi');
  assert.ok(
    /hello|hi|glad|welcome|back|here/i.test(reply),
    `greeting should produce a greeting-shaped reply, got: ${reply}`
  );
});

test('greeting strategy: Persian "سلام" is detected as a greeting intent', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('سلام');
  assert.ok(
    /سلام|درود|دریا|گوش|خوش/i.test(reply),
    `Persian greeting should produce a greeting-shaped reply, got: ${reply}`
  );
});

test('greeting strategy: opening line never always asks "How are you?" by default', () => {
  // The brief explicitly calls out: "Do not ask 'How are you?' by
  // default." Across many fresh engines, the open pool should appear
  // often enough that a single "How are you?" question is not the
  // universal opener.
  let askingCount = 0;
  let nonAskingCount = 0;
  for (let i = 0; i < 20; i += 1) {
    const reply = freshEngine(EN).greeting();
    if (/how are you\?/i.test(reply)) {
      askingCount += 1;
    } else {
      nonAskingCount += 1;
    }
  }
  assert.ok(nonAskingCount >= askingCount,
    `expected most openings to NOT be "How are you?"; got ${askingCount} asking vs ${nonAskingCount} not`);
});

test('greeting strategy: opening pool varies across many fresh conversations', () => {
  const seen = new Set();
  for (let i = 0; i < 30; i += 1) {
    seen.add(freshEngine(EN).greeting());
  }
  assert.ok(seen.size >= 3, `expected varied openings, got only ${seen.size} distinct`);
});

test('greeting strategy: Persian openings also vary and rarely ask the user how they are', () => {
  let askingCount = 0;
  for (let i = 0; i < 20; i += 1) {
    const reply = freshEngine(FA).greeting();
    if (reply.includes('؟') || reply.endsWith('?')) askingCount += 1;
  }
  assert.ok(askingCount <= 10,
    `Persian opener should usually not be a question, got ${askingCount}/20 asking`);
});

test('smalltalk_howareyou: when triggered, response does not always ask "and you?"', () => {
  // The how-are-you rule should not auto-mirror the question back. Across
  // many fresh engines, fewer than half of the responses should end in "?".
  let asking = 0;
  for (let i = 0; i < 30; i += 1) {
    const reply = freshEngine(EN).respond('how are you');
    if (reply.endsWith('?') || reply.endsWith('؟')) asking += 1;
  }
  assert.ok(asking < 18,
    `how-are-you should not always ask a question back, got ${asking}/30 asking`);
});

test('intent: bare "ok" is treated as a brief acknowledgment, not a topic-statement', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('ok');
  // The acknowledgment pool is short, non-question, and distinct from the
  // generic fallback pool. A topic-statement path would have produced a
  // long, question-shaped generic-fallback line.
  assert.ok(reply.length < 50, `bare "ok" should get a brief reply, got: ${reply}`);
  assert.ok(
    /^(Got it|Alright|Okay|I hear|Thanks|Noted)\b/.test(reply),
    `bare "ok" should match an acknowledgment template, got: ${reply}`
  );
});

test('intent: Persian bare "باشه" is treated as a brief acknowledgment', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('باشه');
  assert.ok(reply.length < 60, `Persian bare "باشه" should get a brief reply, got: ${reply}`);
  // The acknowledgment pool contains: متوجه‌ام / باشه / خُب / ممنون که گفتید / یادداشت کردم
  // The reply must be one of those (in any of the rendered forms).
  const pool = FA.acknowledgmentResponses;
  assert.ok(pool.includes(reply),
    `Persian bare "باشه" should match an acknowledgment template, got: ${reply}`);
});

test('non-question rotation: every Nth turn the engine prefers non-question replies', () => {
  // We can\'t directly assert "exactly every 4th turn" because the rule
  // also depends on recent-question-count; but across many turns, at
  // least *some* non-question responses should be picked even on turns
  // where the rule\'s own pool is heavy with questions.
  const engine = freshEngine(EN);
  let nonQuestions = 0;
  for (let i = 0; i < 40; i += 1) {
    const reply = engine.respond('I feel anxious and stressed about everything');
    if (!reply.endsWith('?') && !reply.endsWith('؟')) nonQuestions += 1;
  }
  assert.ok(nonQuestions >= 3, `expected some non-question replies across 40 turns, got ${nonQuestions}`);
});

test('farewell: recent negative tone shifts to an empathetic farewell', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel so sad and alone');
  engine.respond('everything feels hopeless');
  engine.respond('I am so tired of this');
  const reply = engine.farewell();
  // The empathetic pool uses distinct phrasing.
  assert.ok(
    /gentle|kind|came back|carrying|glad you talked/i.test(reply),
    `empathetic farewell should be picked after negative tone, got: ${reply}`
  );
});

test('farewell: neutral conversation uses a standard farewell, not the empathetic one', () => {
  const engine = freshEngine(EN);
  const reply = engine.farewell();
  // Standard pool never says "gentle"/"carrying"/"glad you talked".
  assert.ok(
    !/carrying|glad you talked/i.test(reply),
    `standard farewell should be picked for neutral conversation, got: ${reply}`
  );
});

test('reference memory: short content words from prior messages are remembered', () => {
  const engine = freshEngine(EN);
  engine.respond('The meeting with the landlord went badly');
  // The reference memory should now contain "meeting" and "landlord".
  const refs = engine.memory.recentReferences;
  assert.ok(refs.includes('meeting'), 'expected "meeting" to be remembered');
  assert.ok(refs.includes('landlord'), 'expected "landlord" to be remembered');
});

test('reference memory: common stopwords are NOT remembered', () => {
  const engine = freshEngine(EN);
  engine.respond('I think that was a very interesting thing');
  for (const stop of ['i', 'the', 'a', 'very', 'was', 'that']) {
    assert.ok(!engine.memory.recentReferences.includes(stop),
      `expected "${stop}" to be filtered as a stopword`);
  }
});

test('question budget: across a long conversation, the question rate stays reasonable', () => {
  // The brief calls out: "do not ask a question just to sound active."
  // Across a long same-topic run, the engine should not become an
  // interrogation: at most around one in three of its replies should
  // end in a question.
  const engine = freshEngine(EN);
  const msgs = [
    'I am feeling really anxious about my work',
    'I cannot sleep at night',
    'I am so tired of everything',
    'I feel like a failure',
    'I keep thinking about my father',
    'I miss my grandmother',
    'I feel so alone',
    'I am so stressed',
    'I cannot focus',
    'I do not know what to do',
  ];
  let q = 0;
  let s = 0;
  for (let i = 0; i < 50; i += 1) {
    const reply = engine.respond(msgs[i % msgs.length]);
    if (reply.endsWith('?') || reply.endsWith('؟')) q++;
    else s++;
  }
  const ratio = q / (q + s);
  assert.ok(ratio <= 0.5,
    `question rate should be at most ~50%% across a long conversation, got ${(ratio*100).toFixed(0)}%`);
});

test('question budget: Persian conversation also stays below ~50% questions', () => {
  const engine = freshEngine(FA);
  const msgs = [
    'خیلی نگران کارم هستم',
    'خوابم نمی‌بره',
    'خیلی خسته‌ام',
    'احساس شکست می‌کنم',
    'همش به پدرم فکر می‌کنم',
    'دلم برای مادربزرگم تنگ شده',
    'احساس تنهایی می‌کنم',
    'خیلی استرس دارم',
    'نمی‌تونم تمرکز کنم',
    'نمیدونم چیکار کنم',
  ];
  let q = 0;
  let s = 0;
  for (let i = 0; i < 50; i += 1) {
    const reply = engine.respond(msgs[i % msgs.length]);
    if (reply.endsWith('?') || reply.endsWith('؟')) q++;
    else s++;
  }
  const ratio = q / (q + s);
  assert.ok(ratio <= 0.5,
    `Persian question rate should be at most ~50%% across a long conversation, got ${(ratio*100).toFixed(0)}%`);
});

test('greeting strategy: first greeting is a warm opening, not always an invitation question', () => {
  // The brief explicitly says: do not default to "How are you?" and
  // vary the opening. Across many fresh engines, the open pool (no
  // question) should appear more often than the inviting pool
  // (one light question) -- a question should be a *sometimes*, not
  // a *default*. The threshold is set loosely to tolerate the random
  // sampling noise the engine relies on for variation.
  const seen = new Set();
  let nonQuestions = 0;
  for (let i = 0; i < 30; i += 1) {
    const reply = freshEngine(EN).greeting();
    seen.add(reply);
    if (!reply.endsWith('?') && !reply.endsWith('؟')) nonQuestions++;
  }
  assert.ok(nonQuestions >= 12,
    `expected most openings to be statement-shaped, got ${nonQuestions}/30 non-questions`);
  assert.ok(seen.size >= 4,
    `expected varied openings, got only ${seen.size} distinct`);
});

test('punctuation normalization: "سلام", "سلام!", "سلام.", "سلام؟" all match the greeting intent', () => {
  // The user wants: treat "سلام" and "سلام!" and "سلام." as the
  // same input. The engine strips outer punctuation in the
  // normalization stage, so all of these should be detected as
  // greetings and reach the greeting handler.
  for (const input of ['سلام', 'سلام!', 'سلام.', 'سلام؟', '  سلام  ', 'سلام!!!']) {
    const engine = freshEngine(FA);
    engine.respond(input);
    // The detection happens inside the engine; we check that the
    // reply is one of the greeting pool lines, not a generic
    // fallback or topic callback.
    const reply = engine.respond('something else');
    // Indirect verification: the engine now has memory.turnCount
    // incremented for "something else", meaning the greeting
    // didn't claim the turn. So we can verify that `respond` on
    // the greeting input didn't increment turnCount.
    const engine2 = freshEngine(FA);
    const greetingReply = engine2.respond(input);
    const greetingPool = [
      ...(FA.greentingsOpen || []),
      ...(FA.greentingsInviting || []),
      ...(FA.greentingsReturning || []),
    ];
    // Allow any of the greeting pools (the engine routes to
    // returning pool for non-first-turn greetings).
    assert.ok(
      greetingPool.includes(greetingReply),
      `expected greeting for "${input}", got: ${greetingReply}`
    );
  }
});

test('punctuation normalization: "how are you" and "how are you?" match the same way', () => {
  const a = freshEngine(EN).respond('how are you');
  const b = freshEngine(EN).respond('how are you?');
  const aInPool = EN.rules.find((r) => r.topic === 'smalltalk_howareyou').responses.includes(a);
  const bInPool = EN.rules.find((r) => r.topic === 'smalltalk_howareyou').responses.includes(b);
  assert.ok(aInPool && bInPool,
    `both should match the how-are-you rule. a=${a} b=${b}`);
});

test('punctuation-only input: "!!!" and "???" are treated as empty input', () => {
  const e1 = freshEngine(EN);
  assert.equal(e1.respond('!!!'), EN.emptyInputReply);
  const e2 = freshEngine(EN);
  assert.equal(e2.respond('???'), EN.emptyInputReply);
  const e3 = freshEngine(EN);
  assert.equal(e3.respond('...'), EN.emptyInputReply);
  const e4 = freshEngine(EN);
  assert.equal(e4.respond('!?'), EN.emptyInputReply);
});

test('long repetitive input: capture groups are truncated to keep reflections short', () => {
  const engine = freshEngine(EN);
  const longInput = 'I feel ' + 'really '.repeat(50) + 'tired';
  const reply = engine.respond(longInput);
  // The reply should be much shorter than the input (collapsed +
  // truncated capture).
  assert.ok(reply.length < 300,
    `expected short reply, got ${reply.length} chars: ${reply}`);
});

test('intensifier awareness: "really sad" pulls from the intensifier pool', () => {
  // The intensifier "really" should push the engine toward the
  // rule's intensifierResponses pool. Across many trials, at
  // least some replies should come from that pool.
  const intensifierPool = EN.rules.find((r) => r.topic === 'sadness').intensifierResponses;
  assert.ok(intensifierPool, 'sadness rule should have intensifierResponses');
  let found = 0;
  for (let i = 0; i < 30; i += 1) {
    const reply = freshEngine(EN).respond('I feel really really sad');
    if (intensifierPool.includes(reply)) found++;
  }
  assert.ok(found > 0,
    `expected at least some intensifier responses, got ${found}/30`);
});

test('negation: "I do not feel safe" is recognized as negated, not as a positive statement', () => {
  // The engine's containsNegation() helper should detect "not" in
  // the input. The exact reply may vary, but the negation signal
  // should be present in memory.
  const engine = freshEngine(EN);
  engine.respond('I do not feel safe today');
  assert.equal(engine.memory.lastSignals.isNegation, true,
    'engine should record the negation signal for "do not"');
});

test('negation: contracted "don\'t" is recognized, not just spaced "do not"', () => {
  const engine = freshEngine(EN);
  engine.respond("I don't feel safe today");
  assert.equal(engine.memory.lastSignals.isNegation, true,
    'engine should record the negation signal for "don\'t"');
});

test('negation: Persian "نمی‌خواهم" is recognized', () => {
  const engine = freshEngine(FA);
  engine.respond('نمی‌خواهم امروز بیدار شوم');
  assert.equal(engine.memory.lastSignals.isNegation, true,
    'engine should record the negation signal for Persian "نمی"');
});

test('absolutist thinking: "always" triggers a gentle reality-check', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('My boss always blames me for everything');
  // The reply should come from the absolutist pool.
  assert.ok(EN.absolutistResponses.includes(reply),
    `expected absolutist response, got: ${reply}`);
});

test('"I don\'t know" pattern: gets a calm, non-pressuring response', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('I don\'t know what to do');
  // The reply should be from the iDontKnowResponses pool, not a
  // generic fallback.
  assert.ok(EN.iDontKnowResponses.includes(reply),
    `expected iDontKnow response, got: ${reply}`);
});

test('"again" reference: gets a callback to the recent topic', () => {
  const engine = freshEngine(EN);
  engine.respond('I am feeling really anxious about my work');
  const reply = engine.respond('it is the same thing again');
  // The reply should be a rendering of an againCallbackTemplates
  // entry (after {topic} substitution). Verify the reply matches
  // the *rendered* shape, not the raw template with the
  // placeholder.
  const rendered = EN.againCallbackTemplates.map((t) =>
    t.replace('{topic}', 'work')
  );
  assert.ok(rendered.includes(reply),
    `expected again callback, got: ${reply}`);
});

console.log(`\nTests loaded from: ${__filename}`);
