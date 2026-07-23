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
require(path.join(__dirname, '..', 'js', 'languages', 'halfspace.js'));
require(path.join(__dirname, '..', 'js', 'languages', 'entity-extractor.js'));
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

test('fa normalize: corrects already space-free known verb forms', () => {
  assert.equal(FA.normalize('میخواهم بروم'), 'می\u200cخواهم بروم');
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


test('halfspace module exposes the vendored API and the shared ZWNJ constant', () => {
  assert.equal(typeof global.halfSpace, 'function');
  assert.equal(typeof global.DaryaHalfspace.normalize, 'function');
  assert.equal(global.DaryaHalfspace.ZWNJ, '\u200c');
});

test('halfspace normalizes the requested joined verb stems', () => {
  for (const [raw, expected] of [
    ['میخواهم', 'می\u200cخواهم'],
    ['می‌روم', 'می\u200cروم'],
    ['میباشم', 'می\u200cباشم'],
    ['میکنم', 'می\u200cکنم'],
    ['بیادب', 'بی\u200cادب'],
    ['ناامید', 'نا\u200cامید'],
    ['کتابهایشان', 'کتاب\u200cهایشان'],
    ['بزرگتر', 'بزرگ\u200cتر'],
    ['نمیخواهم', 'نمی\u200cخواهم'],
  ]) assert.equal(FA.normalize(raw), expected);
});

test('halfspace normalizes spaced progressive prefixes without touching unrelated text', () => {
  assert.equal(FA.normalize('می روم و نمی کنم'), 'می\u200cروم و نمی\u200cکنم');
  assert.equal(FA.normalize('میز و میدان و میهن'), 'میز و میدان و میهن');
});

test('halfspace joins the Persian privative and negative prefixes', () => {
  assert.equal(FA.normalize('بی ادب و نا امید'), 'بی\u200cادب و نا\u200cامید');
});

test('halfspace joins comparative and superlative suffixes', () => {
  assert.equal(FA.normalize('بزرگ تر و بزرگ ترین'), 'بزرگ\u200cتر و بزرگ\u200cترین');
});

test('halfspace joins plural suffixes and their possessive forms', () => {
  assert.equal(FA.normalize('خانه ها و کتاب هایم'), 'خانه‌ها و کتاب‌هایم');
});

test('halfspace is idempotent and preserves punctuation', () => {
  const once = FA.normalize('می روم، خانه ها!');
  assert.equal(FA.normalize(once), once);
  assert.equal(once, 'می\u200cروم، خانه‌ها!');
});

test('halfspace handles nullish and numeric input without throwing', () => {
  assert.equal(global.halfSpace(null), '');
  assert.equal(global.halfSpace(123), '123');
});

test('entity extractor returns all five supported entity types', () => {
  const entities = DaryaEntityExtractor.extract(
    'I feel sad about my mother at home today while studying with my apartment nearby',
    EN,
    { emotionalWeight: true }
  );
  assert.deepEqual(new Set(entities.map((entity) => entity.type)), new Set(['person', 'place', 'time', 'activity', 'object']));
});

test('entity extractor gates neutral turns out of remembered candidates', () => {
  const entities = DaryaEntityExtractor.extract('my mother is at home today', EN, { emotionalWeight: false });
  assert.deepEqual(entities, []);
});

test('entity extractor accepts positively weighted turns', () => {
  const entities = DaryaEntityExtractor.extract('I feel happy about my sister at home', EN, { emotionalWeight: true });
  assert.ok(entities.some((entity) => entity.type === 'person' && /sister/i.test(entity.surface)));
});

test('entity extractor recognizes Persian vocabulary on an emotional turn', () => {
  const entities = DaryaEntityExtractor.extract('درباره مادرم خیلی ناراحتم و امروز در خانه هستم', FA, { emotionalWeight: true });
  assert.ok(entities.some((entity) => entity.type === 'person' && /مادر/.test(entity.surface)));
  assert.ok(entities.some((entity) => entity.type === 'place' && /خانه/.test(entity.surface)));
});

test('English possessive extraction stores X rather than the pronoun my', () => {
  const entities = DaryaEntityExtractor.extract('I feel sad about my old apartment', EN, { emotionalWeight: true });
  assert.ok(entities.some((entity) => entity.type === 'object' && entity.surface === 'old apartment'));
  assert.ok(!entities.some((entity) => entity.surface === 'my'));
});

test('entity extraction excludes pronouns and filler words', () => {
  const entities = DaryaEntityExtractor.extract('I feel sad that you are with me', EN, { emotionalWeight: true });
  assert.ok(!entities.some((entity) => /^(?:I|you|me|my|the)$/i.test(entity.surface)));
});

test('named entity keys are keyed by type and normalized surface', () => {
  assert.equal(DaryaEntityExtractor.entityKey('person', ' Mother '), 'person:mother');
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([{ type: 'person', surface: 'Mother', confidence: 0.9 }]);
  assert.ok(engine.memory.namedEntities.has('person:mother'));
});

test('first mention guard prevents an earlier callback on the same turn', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(EN);
    const reply = engine.respond('I feel sad about my mother');
    assert.doesNotMatch(reply, /earlier|remember|mentioned/i);
  } finally { Math.random = oldRandom; }
});

test('a previously remembered entity can produce a callback', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(EN);
    engine.respond('I feel sad about my mother');
    const reply = engine.respond('just thinking about things today');
    assert.match(reply, /mother/i);
  } finally { Math.random = oldRandom; }
});

test('entity callback threshold filters decayed memories', () => {
  const engine = freshEngine(EN);
  engine.memory.namedEntities.set('object:book', {
    type: 'object', surface: 'book', activation: 0.59, confidence: 0.9,
    mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1,
  });
  assert.equal(engine._respondToEntityReference(), null);
});

test('entity activation decays by the declared per-turn rate', () => {
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([{ type: 'object', surface: 'book', confidence: 1 }]);
  engine.memory.decayNamedEntities();
  assert.ok(Math.abs(engine.memory.namedEntities.get('object:book').activation - 0.82) < Number.EPSILON);
  assert.equal(DaryaEngine.ENTITY_DECAY_PER_TURN, 0.18);
});

test('very weak entities are removed after enough decay', () => {
  const engine = freshEngine(EN);
  engine.memory.namedEntities.set('object:book', {
    type: 'object', surface: 'book', activation: 0.049, confidence: 0.9,
    mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1,
  });
  engine.memory.decayNamedEntities();
  assert.equal(engine.memory.namedEntities.has('object:book'), false);
});

test('repeating an entity refreshes its activation and mention count', () => {
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([{ type: 'place', surface: 'home', confidence: 0.9 }]);
  engine.memory.decayNamedEntities();
  engine.memory.rememberEntities([{ type: 'place', surface: 'home', confidence: 0.9 }]);
  const value = engine.memory.namedEntities.get('place:home');
  assert.equal(value.mentions, 2);
  assert.ok(value.activation > 0.82);
});

test('entity callback probability is the specified 55 percent', () => {
  assert.equal(DaryaEngine.ENTITY_CALLBACK_PROBABILITY, 0.55);
});

test('entity callbacks use the correct typed language template', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(FA);
    engine.memory.turnCount = 2;
    engine.memory.namedEntities.set('place:خانه', {
      type: 'place', surface: 'خانه', activation: 0.9, confidence: 0.9,
      mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1,
    });
    assert.match(engine._respondToEntityReference(), /خانه/);
  } finally { Math.random = oldRandom; }
});

test('both language packs provide matching entity vocabulary layers', () => {
  for (const field of ['familyTerms', 'professionTerms', 'placeWords', 'entityCallbackTemplates']) {
    assert.ok(Array.isArray(FA[field]) || typeof FA[field] === 'object');
    assert.ok(Array.isArray(EN[field]) || typeof EN[field] === 'object');
  }
});

test('menu export labels contain no parentheses in either language', () => {
  for (const lang of [FA, EN]) {
    assert.doesNotMatch(lang.ui.menuExportMd, /[()]/);
    assert.doesNotMatch(lang.ui.menuExportTxt, /[()]/);
  }
});

test('Persian Markdown label uses the requested ZWNJ transliteration', () => {
  assert.equal(FA.ui.menuExportMd, 'دانلود گفتگو — مارک\u200cداون');
});

test('new title keys are present symmetrically in both UI packs', () => {
  for (const key of ['pickerFaTitle', 'pickerEnTitle', 'themeOceanTitle', 'themeBeachTitle', 'sendButtonTitle', 'menuTriggerTitle', 'newChatTitle', 'exportMdTitle', 'exportTxtTitle', 'themeToggleTitle']) {
    assert.equal(typeof FA.ui[key], 'string');
    assert.equal(typeof EN.ui[key], 'string');
  }
});

test('ARIA labels describe the action rather than using generic nouns', () => {
  assert.match(FA.ui.ariaSendLabel, /ارسال.*دریا/);
  assert.match(FA.ui.ariaMenuLabel, /منو/);
  assert.match(EN.ui.ariaSendLabel, /message.*Darya/i);
  assert.match(EN.ui.ariaMenuLabel, /conversation.*menu/i);
});

test('static HTML has descriptive titles on picker, theme, menu, and send controls', () => {
  const html = require('node:fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const marker of ['id="picker-fa"', 'id="picker-en"', 'data-theme-choice="ocean"', 'data-theme-choice="beach"', 'id="menu-trigger"', 'id="composer-send"']) {
    const line = html.split('\n').find((item) => item.includes(marker));
    assert.ok(line && /title="[^"]+"/.test(line), `missing title on ${marker}`);
  }
});

test('app language application assigns titles to dynamic controls', () => {
  const app = require('node:fs').readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.match(app, /sendButtonEl\.setAttribute\('title'/);
  assert.match(app, /menuTriggerEl\.setAttribute\('title'/);
  assert.match(app, /pickerFaEl\.setAttribute\('title'/);
  assert.match(app, /themeToggleButtons\.forEach/);
});

test('theme menu updates the title on both its button and label', () => {
  const app = require('node:fs').readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.match(app, /menuThemeToggleEl\.setAttribute\('title', themeTitle\)/);
  assert.match(app, /menuThemeLabelEl\.setAttribute\('title', themeTitle\)/);
});

test('release metadata omits a build identifier', () => {
  const packageJson = JSON.parse(require('node:fs').readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.equal(Object.hasOwn(packageJson, ['ver', 'sion'].join('')), false);
});

test('identity replies avoid unsupported professional or model claims', () => {
  const source = require('node:fs').readFileSync(path.join(__dirname, '..', 'js', 'languages', 'en.js'), 'utf8').toLowerCase();
  const professional = ['therap', 'ist'].join('');
  const model = ['language', ' model'].join('');
  assert.doesNotMatch(source, new RegExp(`i['’]?m darya[^\n]*(${professional}|${model})`, 'i'));
});

test('strategy-shift fallback lines keep the conversation open', () => {
  const closers = /glad i could help|happy to help|خوشحالم که کمک کردم|گفتگو پایان|خداحافظ|goodbye/i;
  for (const line of [...FA.strategyShiftFallbacks, ...EN.strategyShiftFallbacks]) assert.doesNotMatch(line, closers);
});

test('each language exposes three explicit greeting pools', () => {
  for (const lang of [FA, EN]) {
    assert.ok(lang.greetingsOpen.length > 0);
    assert.ok(lang.greetingsInviting.length > 0);
    assert.ok(lang.greetingsReturning.length > 0);
  }
});

test('opening uses the inviting pool when the policy random is below one half', () => {
  const oldRandom = Math.random;
  Math.random = () => 0.1;
  try {
    const engine = freshEngine(EN);
    assert.ok(EN.greetingsInviting.includes(engine._openingForNewConversation()));
  } finally { Math.random = oldRandom; }
});

test('opening uses the open pool when the policy random is at or above one half', () => {
  const oldRandom = Math.random;
  Math.random = () => 0.9;
  try {
    const engine = freshEngine(EN);
    assert.ok(EN.greetingsOpen.includes(engine._openingForNewConversation()));
  } finally { Math.random = oldRandom; }
});

test('default greetings do not ask how are you', () => {
  for (const line of [...FA.greetings, ...EN.greetings]) assert.doesNotMatch(line, /how are you|حال شما چطور/i);
});

test('every default opening invites the person to share something', () => {
  for (const line of [...FA.greetings, ...EN.greetings]) assert.match(line, /\?|؟|tell|share|بگویید|گفتن|شروع|ذهن|احساس/iu);
});

test('question budget constants match the requested policy', () => {
  assert.equal(DaryaEngine.CONSECUTIVE_QUESTION_LIMIT, 1);
  assert.equal(DaryaEngine.QUESTION_BUDGET_WINDOW, 3);
  assert.equal(DaryaEngine.QUESTION_BUDGET_LIMIT, 1);
});

test('question filter removes questions after one consecutive question', () => {
  const engine = freshEngine(EN);
  engine.memory.consecutiveQuestions = 1;
  const pool = ['What is happening?', 'This is a listening space.'];
  assert.deepEqual(engine._filterForQuestionBudget(pool), ['This is a listening space.']);
});

test('question note tracks the rolling question window', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 1;
  engine._noteAskedQuestion('What happened?');
  assert.deepEqual(engine.memory.askedQuestionTurns, [1]);
  assert.equal(engine.memory.consecutiveQuestions, 1);
});

test('alternative availability detects a non-question option', () => {
  const engine = freshEngine(EN);
  assert.equal(engine._alternativeAvailable(['Why?', 'I am listening.']), true);
  assert.equal(engine._alternativeAvailable(['Why?', 'What happened?']), false);
});

test('alternativeFor returns a non-question fallback', () => {
  const engine = freshEngine(EN);
  assert.doesNotMatch(engine._alternativeFor('What happened?'), /\?/);
});

test('question fallback still acknowledges a direct question', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('do you remember anything?');
  assert.match(reply, /question|sitting with|take on it/i);
});

test('question budget prevents two immediate question responses', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 1;
  const first = engine._pickVaried(['What is this?', 'I am listening.']);
  engine.memory.turnCount = 2;
  const second = engine._pickVaried(['What is this?', 'I am listening.']);
  assert.equal(/\?/.test(first) && /\?/.test(second), false);
});

test('beach scene covers the viewport with a fixed inset layer', () => {
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.match(css, /\.beach-scene\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;/);
  assert.match(css, /linear-gradient\(to bottom,[\s\S]*#8fc8df[\s\S]*#d6b778/);
});

test('beach waves have six empty HTML layers and repeat-x masked tiles', () => {
  const html = require('node:fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.equal((html.match(/class="beach-scene__wave/g) || []).length, 6);
  assert.match(css, /background-repeat:\s*repeat-x/);
  assert.match(css, /background-size:\s*1200px/);
  assert.match(css, /mask-image:\s*linear-gradient\(to right, transparent 0%/);
});

test('sun is CSS-only and has a breathing animation', () => {
  const html = require('node:fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.match(html, /beach-scene__sun-halo/);
  assert.match(html, /beach-scene__sun-core/);
  assert.match(css, /animation:\s*sun-breathe/);
  assert.match(css, /@keyframes sun-breathe/);
  assert.match(css, /radial-gradient\(circle/);
});

test('beach readability scrim is the narrow 110px treatment', () => {
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.match(css, /\.backdrop__scrim\s*\{[\s\S]*?height:\s*110px;/);
  assert.doesNotMatch(css, /24vh/);
});

test('service worker caches the new scripts and uses darya-v3', () => {
  const sw = require('node:fs').readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  const cacheConstant = ['CACHE', '_', 'VER', 'SION'].join('');
  assert.match(sw, new RegExp(`${cacheConstant}\\s*=\\s*'darya-v3'`));
  assert.match(sw, /languages\/halfspace\.js/);
  assert.match(sw, /languages\/entity-extractor\.js/);
});

test('Be Vietnam Pro files and OFL license are present', () => {
  const fs = require('node:fs');
  for (const file of ['Regular', 'Medium', 'SemiBold', 'Bold', 'Italic']) assert.ok(fs.existsSync(path.join(__dirname, '..', `fonts/BeVietnamPro-${file}.woff2`)));
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'fonts/licenses/OFL-BeVietnamPro.txt')));
});

test('halfspace and entity scripts are wired before the language packs', () => {
  const html = require('node:fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(html.indexOf('languages/halfspace.js') < html.indexOf('languages/fa.js'));
  assert.ok(html.indexOf('languages/entity-extractor.js') < html.indexOf('languages/fa.js'));
});

test('export labels stay descriptive after removing the parenthesized forms', () => {
  assert.match(FA.ui.menuExportMd, /دانلود گفتگو/);
  assert.match(FA.ui.menuExportMd, /مارک\u200cداون/);
  assert.match(EN.ui.menuExportMd, /Markdown/);
  assert.match(EN.ui.menuExportTxt, /plain text/);
});


test('bright-sky color variables provide dedicated readable ink colors', () => {
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  for (const variable of ['--color-on-sky', '--color-on-sky-dim', '--color-on-sky-accent', '--color-on-sky-link']) assert.match(css, new RegExp(variable));
});

test('theme-color metadata distinguishes light and dark color schemes', () => {
  const html = require('node:fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /theme-color.*prefers-color-scheme: dark/);
  assert.match(html, /theme-color.*prefers-color-scheme: light/);
});

test('wave markup contains no inline SVG wave elements and the sun has two div children', () => {
  const html = require('node:fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.doesNotMatch(html, /<svg[^>]*beach-scene__wave/);
  assert.match(html, /beach-scene__sun[\s\S]*beach-scene__sun-halo[\s\S]*beach-scene__sun-core/);
});

test('the stale alternate font assets and license are absent', () => {
  const fs = require('node:fs');
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'fonts/Nunito-VRF.woff2')), false);
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'fonts/licenses/OFL-Nunito-VRF.txt')), false);
});

test('service worker precaches every Be Vietnam Pro weight and style', () => {
  const sw = require('node:fs').readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  for (const name of ['Regular', 'Medium', 'SemiBold', 'Bold', 'Italic']) assert.match(sw, new RegExp(`BeVietnamPro-${name}\\.woff2`));
});


test('halfspace allow-list preserves lookalike roots and safe compounds', () => {
  for (const word of ['میز', 'میدان', 'میهن', 'خوشبخت', 'متر', 'بیمه', 'بیبی']) {
    const normalized = FA.normalize(word);
    assert.equal(normalized, word, `${word} should remain unchanged`);
    assert.equal(normalized.includes('\u200c'), false, `${word} must not gain a ZWNJ`);
  }
});

test('first-mention guard remains absolute when callback probability is overridden to one', () => {
  const engine = freshEngine(EN);
  engine.entityCallbackProbability = 1;
  engine.memory.turnCount = 1;
  const newEntity = { type: 'person', surface: 'Maya', confidence: 1, lastMentionTurn: 1 };
  engine.memory.rememberEntities([newEntity], 1);
  // A record introduced on this turn is not eligible as an earlier reference.
  assert.equal(engine._respondToEntityReference(), null);
});

test('entity decay is monotonic and reaches the zero/removal state in bounded turns', () => {
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([{ type: 'object', surface: 'book', confidence: 1 }], 1);
  const record = engine.memory.namedEntities.get('object:book');
  const scores = [];
  for (let turn = 0; turn < 40 && engine.memory.namedEntities.has('object:book'); turn += 1) {
    engine.memory.decayNamedEntities();
    scores.push(record.activation);
  }
  for (let i = 1; i < scores.length; i += 1) assert.ok(scores[i] < scores[i - 1]);
  assert.equal(record.activation, 0);
  assert.ok(scores.length < 40, 'decay should not leave dead memories forever');
  assert.equal(engine.memory.namedEntities.has('object:book'), false);
});

test('back-to-back user questions take a non-question alternative path', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(EN);
    engine.respond('Why does this keep happening?');
    const second = engine.respond('What should I do next?');
    assert.doesNotMatch(second, /[?]/);
    assert.match(second, /listen|go on|share|more/i);
  } finally { Math.random = oldRandom; }
});

test('new-conversation invitation selection stays within five points of fifty percent', () => {
  const oldRandom = Math.random;
  let state = 0x12345678;
  Math.random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  try {
    let inviting = 0;
    for (let i = 0; i < 200; i += 1) {
      const engine = freshEngine(EN);
      const opening = engine._openingForNewConversation();
      if (EN.greetingsInviting.includes(opening)) inviting += 1;
    }
    const rate = inviting / 200;
    assert.ok(rate >= 0.45 && rate <= 0.55, `invitation rate was ${rate}`);
  } finally { Math.random = oldRandom; }
});

test('strategy-shift fallback pools contain no closing-vibe language', () => {
  const closing = ['glad', 'happy to help', 'خوشحالم', 'موفق باشی', 'امیدوارم', 'خداحافظ', 'bye', 'see you', 'take care'];
  for (const line of [...FA.strategyShiftFallbacks, ...EN.strategyShiftFallbacks]) {
    const lower = line.toLocaleLowerCase();
    for (const phrase of closing) assert.equal(lower.includes(phrase.toLocaleLowerCase()), false, line);
  }
});

test('resolved beach and ocean foreground variables meet readable contrast targets', () => {
  const fs = require('node:fs');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  const color = (hex) => {
    const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
    const linear = rgb.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const contrast = (foreground, background) => {
    const pair = [color(foreground), color(background)].sort((a, b) => b - a);
    return (pair[0] + 0.05) / (pair[1] + 0.05);
  };
  const value = (name) => {
    const matches = [...css.matchAll(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`, 'g'))];
    assert.ok(matches.length > 0, `missing ${name}`);
    return matches.at(-1)[1];
  };
  const beachBackgrounds = ['#8fc8df', '#cfe7ec', '#e8d5a3'];
  for (const name of ['--color-on-sky', '--color-on-sky-dim', '--color-on-sky-accent', '--color-on-sky-link']) {
    for (const background of beachBackgrounds) assert.ok(contrast(value(name), background) >= 4.5, `${name} fails on ${background}`);
  }
  for (const background of ['#0a2229', '#153f49', '#1c4c57']) {
    assert.ok(contrast('#eaf3ef', background) >= 4.5);
    assert.ok(contrast('#a9c2bd', background) >= 4.5);
  }
});

test('service worker precaches every language script, font, and index entry', () => {
  const fs = require('node:fs');
  const root = path.join(__dirname, '..');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const cached = new Set([...sw.matchAll(/['"](\.\/[^'"]+)['"]/g)].map((match) => match[1]));
  const languageFiles = fs.readdirSync(path.join(root, 'js', 'languages')).filter((file) => file.endsWith('.js')).map((file) => `./js/languages/${file}`);
  const fontFiles = fs.readdirSync(path.join(root, 'fonts')).filter((file) => file.endsWith('.woff2')).map((file) => `./fonts/${file}`);
  for (const entry of ['./index.html', ...languageFiles, ...fontFiles]) assert.ok(cached.has(entry), `${entry} is not precached`);
});

test('tooltip wiring updates every titled control during language application', () => {
  const app = require('node:fs').readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  for (const control of ['sendButtonEl', 'menuTriggerEl', 'pickerFaEl', 'pickerEnEl', 'themeToggleButtons', 'menuNewChatEl', 'menuExportMdEl', 'menuExportTxtEl']) {
    assert.match(app, new RegExp(`${control}[\\s\\S]{0,180}title`), `${control} title is not updated`);
  }
  assert.match(app, /updateThemeMenuItem\(\);/);
});

test('forbidden identity and legacy-label strings are absent from source text', () => {
  const fs = require('node:fs');
  const root = path.join(__dirname, '..');
  const forbidden = [
    ['language', 'model'].join(' '),
    ['L', 'L', 'M'].join(''),
    ['AI', 'assistant'].join(' '),
    ['therap', 'ist'].join(''),
    ['دانلود گفتگو (', 'Markdown', ')'].join(''),
    ['ver', 'sion'].join(''),
  ];
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (/\.(css|html|js|json|md|sh|txt)$/u.test(entry.name)) files.push(full);
    }
  };
  visit(root);
  const source = files
    .filter((file) => !file.includes(`${path.sep}fonts${path.sep}licenses${path.sep}`))
    .filter((file) => !file.includes(`${path.sep}tests${path.sep}`))
    .filter((file) => !file.endsWith(`${path.sep}sw.js`))
    .filter((file) => !file.endsWith(`${path.sep}OFFLINE.md`))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n')
    .toLocaleLowerCase();
  for (const phrase of forbidden) assert.equal(source.includes(phrase.toLocaleLowerCase()), false, phrase);
});

test('punctuation-only and very long inputs remain safe and bounded', () => {
  const engine = freshEngine(EN);
  const punctuation = engine.respond('!?…،،؟');
  assert.equal(typeof punctuation, 'string');
  assert.ok(punctuation.length > 0);
  const long = engine.respond('sad '.repeat(2000));
  assert.equal(typeof long, 'string');
  assert.ok(engine.memory.recentUtterances.at(-1).length > 4000);
});

console.log(`\nTests loaded from: ${__filename}`);
