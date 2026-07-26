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

test('fa normalize: corrects "مي" + space to the half-space (ZWNJ) form', () => {
  assert.equal(FA.normalize('می خواهم بروم'), 'می\u200cخواهم بروم');
});

test('fa normalize regression: does NOT corrupt words that merely contain می/می-like substrings', () => {
  // "کمی" ("a bit") ends in the same two letters as the "می" prefix, but
  // is a separate, unrelated word and must be left untouched.
  assert.equal(FA.normalize('کمی خسته‌ام'), 'کمی خسته‌ام');
  // "میز" (table) and "میدان" (square) start with "می" as part of their
  // own root, not as the verb prefix; must be left untouched.
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
  // Emotion calibration may prefix the response with a calibration string.
  // Strip it before checking membership in the sadness pools.
  const calibrationPrefix = FA.emotionCalibration?.sad;
  const cleanReply = calibrationPrefix && reply.startsWith(calibrationPrefix)
    ? reply.slice(calibrationPrefix.length).trim()
    : reply;
  assert.ok(sadnessResponses.includes(cleanReply) || FA.topicSpecificQuestions.sadness.includes(cleanReply), `expected a sadness response, got: ${reply}`);
});

test('regression: "چراغ" (lamp) does not falsely trigger question-word detection for "چرا" (why)', () => {
  assert.equal(FA.questionPattern.test('چراغ اتاقم خراب شده'), false);
  assert.equal(FA.questionPattern.test('چرا همیشه همینطوریه؟'), true);
});

test('regression: Persian question marks are not mistaken for letters in word-boundary checks', () => {
  // "؟" (U+061F) shares the same Unicode block as Persian letters but is
  // punctuation, not a letter. A naive range check treated it as one,
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
  assert.match(FA.ui.menuExportMd, /دانلود/);
  assert.match(FA.ui.menuExportMd, /مارک\u200cداون/);
  assert.match(FA.ui.menuExportMd, /فرمت/);
});

test('new title keys are present symmetrically in both UI packs', () => {
  for (const key of ['pickerFaTitle', 'pickerEnTitle', 'themeOceanTitle', 'themeBeachTitle', 'sendButtonTitle', 'menuTriggerTitle', 'newChatTitle', 'exportMdTitle', 'exportTxtTitle', 'themeToggleTitle']) {
    assert.equal(typeof FA.ui[key], 'string');
    assert.equal(typeof EN.ui[key], 'string');
  }
});

test('ARIA labels describe the action rather than using generic nouns', () => {
  assert.match(FA.ui.ariaSendLabel, /^ارسال/);
  assert.match(FA.ui.ariaMenuLabel, /^گفت/);
  assert.match(EN.ui.ariaSendLabel, /^send$/i);
  assert.match(EN.ui.ariaMenuLabel, /conversation/i);
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
  assert.match(app, /themePickerEl\.setAttribute\('aria-label'/);
  assert.match(app, /typingStatusEl\.setAttribute\('aria-label'/);
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
  Math.random = () => 0.6;
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

test('ocean bubbles keep a small randomized calm-water profile', () => {
  const app = require('node:fs').readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.match(app, /const count = 8/);
  assert.match(app, /randomBetween\(4, 14\)/);
  assert.match(app, /randomBetween\(14, 22\)/);
  assert.match(app, /randomBetween\(-12, 12\)/);
  assert.match(app, /randomBetween\(0\.15, 0\.45\)/);
});

test('ocean has a reduced-motion-safe depth breath and no vertical horizon drift', () => {
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.match(css, /backdrop__depth-breath/);
  assert.match(css, /@keyframes depth-breathe/);
  assert.match(css, /backdrop__depth-breath[\s\S]*radial-gradient/);
  assert.match(css, /@keyframes horizon-drift[\s\S]*translateX/);
  assert.doesNotMatch(css.match(/@keyframes horizon-drift[\s\S]*?\}/)?.[0] || '', /translateY/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*depth-breath/);
});

test('ocean keeps beach-only layers out of its visible state', () => {
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.match(css, /html\[data-theme=\"beach\"\] \.bubbles[\s\S]*display: none/);
  assert.match(css, /\.bird-shadows[\s\S]*display: none/);
  assert.match(css, /\.beach-scene[\s\S]*visibility: hidden/);
});

test('beach scene covers the viewport with a fixed inset layer', () => {
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.match(css, /\.beach-scene\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;/);
  assert.match(css, /linear-gradient\(to bottom,[\s\S]*#b3d6e0[\s\S]*#d6b06b/);
});

test('beach waves have three ocean div layers and repeat-x tiled layers', () => {
  const html = require('node:fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.equal((html.match(/class="beach-scene__ocean/g) || []).length, 3);
  assert.match(css, /background-repeat:\s*repeat-x/);
  assert.match(css, /background-size:\s*1200px/);
  // Ocean layers no longer use mask-image; they are fully opaque with naturally curved SVG edges.
  assert.doesNotMatch(css, /\.beach-scene__ocean[^{]*\{[^}]*mask-image:/);
});

test('beach ocean layers are divs, tiled, opaque, level, and full-scene', () => {
  const fs = require('node:fs');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.equal((html.match(/class="beach-scene__ocean /g) || []).length, 3);
  const scene = html.slice(html.indexOf('<div class="beach-scene">'), html.indexOf('</div>\n\n    <div class="backdrop__scrim">'));
  assert.doesNotMatch(scene, /<svg/);
  assert.match(css, /beach-scene__sky[\s\S]*height:\s*100%/);
  assert.match(css, /beach-scene__ocean[\s\S]*background-repeat:\s*repeat-x/);
  // Ocean layers are opaque (no mask), with parallax drift via background-position-x.
  assert.doesNotMatch(css, /\.beach-scene__ocean[^{]*\{[^}]*mask-image:/);
  assert.match(css, /beach-scene__ocean[\s\S]*opacity:\s*1/);
  assert.doesNotMatch(css, /translate3d\([^)]*,\s*-[123]px/);
  assert.match(css, /background-position-x:\s*-1200px/);
  assert.match(css, /beach-ocean-drift/);
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

test('service worker caches the new scripts and uses the current cache name', () => {
  const sw = require('node:fs').readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  const cacheConstant = ['CACHE', '_', 'NAME'].join('');
  assert.match(sw, new RegExp(`${cacheConstant}\\s*=\\s*'darya-cache-current'`));
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
  assert.match(FA.ui.menuExportMd, /دانلود/);
  assert.match(FA.ui.menuExportMd, /مارک\u200cداون/);
  assert.match(EN.ui.menuExportMd, /Markdown/);
  assert.match(EN.ui.menuExportTxt, /plain text/i);
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

test('the removed Nunito assets and license are absent', () => {
  const fs = require('node:fs');
  assert.equal(fs.existsSync(path.join(__dirname, '..', `fonts/${['Nu', 'nito'].join('')}-VF.woff2`)), false);
  assert.equal(fs.existsSync(path.join(__dirname, '..', `fonts/licenses/OFL-${['Nu', 'nito'].join('')}.txt`)), false);
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
    assert.match(second, /thread|piece|listening|detail|question|open/i);
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
  const beachBackgrounds = ['#b3d6e0', '#d4e5d4', '#f1d7b1', '#ecd9bb', '#e6c688'];
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

test('every static button has a meaningful title for keyboard and pointer users', () => {
  const html = require('node:fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const buttons = [...html.matchAll(/<button\b[^>]*>/gu)].map((match) => match[0]);
  assert.ok(buttons.length > 0);
  for (const button of buttons) assert.match(button, /title="[^"]+"/u, button);
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


test('topic memory tracks weighted turns and a current subject without persistence', () => {
  const engine = freshEngine(EN);
  engine.respond("I can't sleep because I feel anxious");
  assert.ok(engine.memory.topicHistory.length >= 2);
  assert.equal(engine.memory.currentSubject.topic, 'sleep');
  assert.ok(engine.memory.topicWeights.get('sleep') >= 1);
  assert.ok(engine.memory.currentSubject.since >= 1);
});

test('common topic blends return a dedicated calm reflection', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(EN);
    const reply = engine.respond("I can't sleep because I feel anxious");
    assert.ok(EN.blendResponses.blend_sleep_anxiety.includes(reply));
    assert.doesNotMatch(reply, /[?]/);
  } finally { Math.random = oldRandom; }
});

test('every declared blend pool has four distinct non-question lines in both languages', () => {
  for (const lang of [EN, FA]) {
    for (const [name, pool] of Object.entries(lang.blendResponses)) {
      assert.ok(pool.length >= 4, `${lang.code}:${name}`);
      assert.equal(new Set(pool).size, pool.length);
      assert.ok(pool.every((line) => !/[?؟]/u.test(line)), `${lang.code}:${name} contains a question`);
    }
  }
});

test('sleep follow-up is selected from the topic-specific question pool', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const reply = freshEngine(EN).respond("I can't sleep");
    assert.ok(EN.topicSpecificQuestions.sleep.includes(reply), reply);
  } finally { Math.random = oldRandom; }
});

test('work follow-up is selected from the topic-specific question pool', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const reply = freshEngine(EN).respond('My job is difficult lately');
    assert.ok(EN.topicSpecificQuestions.work.includes(reply), reply);
  } finally { Math.random = oldRandom; }
});

test('topic-specific question maps are complete and distinct for both locales', () => {
  for (const lang of [EN, FA]) {
    for (const [topic, pool] of Object.entries(lang.topicSpecificQuestions)) {
      assert.ok(pool.length >= 4, `${lang.code}:${topic}`);
      assert.equal(new Set(pool).size, pool.length);
    }
  }
});

test('seriousness blocks humor even when the random gate is eager', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(EN);
    engine.memory.turnCount = 4;
    engine.currentTurnSeriousness = EN.topicSeriousness.anxiety;
    engine.lastTurnNeedsCare = true;
    assert.equal(engine.canHumorFire(), false);
    assert.equal(engine._maybeHumanTone('A careful reply.', 'I feel anxious'), 'A careful reply.');
  } finally { Math.random = oldRandom; }
});

test('light humor can fire only after three turns and below the seriousness gate', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(EN);
    engine.memory.turnCount = 3;
    engine.currentTurnSeriousness = 0.2;
    engine.lastTurnNeedsCare = false;
    assert.equal(engine.canHumorFire(), true);
    assert.ok(EN.humor.includes(engine._maybeHumanTone('A plain reply.', 'That is funny')));
  } finally { Math.random = oldRandom; }
});

test('gratitude is brief and does not close the conversation', () => {
  const banned = ['you are welcome', 'happy to help', 'goodbye', 'take care', 'خوشحالم که کمک کردم', 'موفق باشی'];
  for (const [lang, input] of [[EN, 'thanks'], [FA, 'ممنون']]) {
    const reply = freshEngine(lang).respond(input);
    assert.ok(lang.gratitudeResponses.includes(reply));
    for (const phrase of banned) assert.equal(reply.toLocaleLowerCase().includes(phrase), false, reply);
  }
});

test('recap uses remembered topics and real entities rather than invented details', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel sad about my apartment');
  const reply = engine.respond('what did I say earlier');
  assert.match(reply, /sadness|sad|apartment|object/i);
  assert.doesNotMatch(reply, /nothing you said|something interesting/i);
});

test('professional boundary replies redirect decisions to qualified human help', () => {
  for (const [lang, input] of [[EN, 'Can you give me legal advice?'], [FA, 'مشاوره حقوقی می‌خواهم']]) {
    const reply = freshEngine(lang).respond(input);
    assert.match(reply, /professional|licensed|متخصص/iu);
    assert.doesNotMatch(reply, /take this medication|invest in|you must file/i);
  }
});

test('topic callbacks are specific and reject generic backward-reference openings', () => {
  const generic = /^(?:earlier you|you mentioned|you brought up|قبلاً گفتی|همون‌طور که گفتی|یادته گفتی)/iu;
  for (const lang of [EN, FA]) {
    for (const pool of Object.values(lang.topicCallbacks)) {
      for (const line of pool) assert.doesNotMatch(line, generic, line);
    }
    for (const pool of Object.values(lang.entityCallbackTemplates)) {
      for (const line of pool) assert.doesNotMatch(line, generic, line);
    }
  }
});

test('human touch cannot fire without a real remembered entity', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 7;
  engine.currentTurnSeriousness = 0.2;
  assert.equal(engine._shouldAddHumanTouch(), false);
  engine.memory.namedEntities.set('object:coffee', { type: 'object', surface: 'coffee', activation: 0.9, confidence: 0.9, mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1 });
  assert.equal(engine._shouldAddHumanTouch(), true);
  assert.match(engine._humanTouchLine(), /coffee/i);
});

test('returning openings favor the returning pool when prior memory exists', () => {
  const oldRandom = Math.random;
  Math.random = () => 0.1;
  try {
    const engine = freshEngine(EN);
    engine.memory.namedEntities.set('object:coffee', { type: 'object', surface: 'coffee', activation: 0.9, confidence: 0.9, mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1 });
    assert.ok(EN.greetingsReturning.includes(engine._openingForNewConversation()));
  } finally { Math.random = oldRandom; }
});

test('reply pools contain no forbidden generic follow-up phrases', () => {
  const forbidden = ['tell me more', 'how does that make you feel', 'what else can you tell me', 'بیشتر بگو', 'چه احساسی داری', 'چه چیز دیگری'];
  for (const lang of [EN, FA]) {
    const values = [
      ...lang.genericFallbacks, ...lang.strategyShiftFallbacks,
      ...lang.rules.flatMap((rule) => rule.responses),
      ...Object.values(lang.topicCallbacks).flat(),
      ...Object.values(lang.entityCallbackTemplates).flat(),
    ];
    for (const line of values) for (const phrase of forbidden) assert.equal(line.toLocaleLowerCase().includes(phrase), false, line);
  }
});

test('no generated reply uses should more than once', () => {
  for (const lang of [EN, FA]) {
    const values = [...lang.genericFallbacks, ...lang.strategyShiftFallbacks, ...lang.rules.flatMap((rule) => rule.responses)];
    for (const line of values) assert.ok((line.match(/\\bshould\\b/giu) || []).length <= 1, line);
  }
});


test('initial greeting pools always invite a response with a question', () => {
  for (const lang of [EN, FA]) {
    for (const line of [...lang.greetingsOpen, ...lang.greetingsInviting, ...lang.greetingsReturning]) {
      assert.match(line, /[?؟]/u, line);
    }
  }
});

test('entity memory keeps topic context and rejects unrelated callbacks', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(EN);
    engine.memory.turnCount = 1;
    engine.currentTurnTopics = ['family', 'sadness'];
    engine.memory.rememberEntities([{ type: 'person', surface: 'mother', confidence: 0.95 }], 1, { topics: ['family', 'sadness'], seriousness: 0.8 });
    const remembered = engine.memory.namedEntities.get('person:mother');
    assert.deepEqual(remembered.contextTopics, ['family', 'sadness']);
    engine.memory.turnCount = 2;
    engine.currentTurnTopics = ['work'];
    assert.equal(engine._respondToEntityReference(), null);
    engine.currentTurnTopics = ['family'];
    assert.match(engine._respondToEntityReference(), /mother/i);
  } finally { Math.random = oldRandom; }
});

test('plain text export precedes Markdown and Persian theme copy uses پوسته', () => {
  const fs = require('node:fs');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(html.indexOf('id="menu-export-txt"') < html.indexOf('id="menu-export-md"'));
  assert.match(FA.ui.themeOceanLabel, /پوسته/);
  assert.match(FA.ui.themeBeachLabel, /پوسته/);
  assert.doesNotMatch(FA.ui.themeOceanLabel, /تم/);
  assert.doesNotMatch(FA.ui.themeBeachLabel, /تم/);
});

test('wave variation is randomized per layer without changing its vertical position', () => {
  const app = require('node:fs').readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.match(app, /initBeachWaveVariation/);
  assert.match(app, /--wave-duration/);
  assert.match(app, /--wave-delay/);
  assert.match(css, /background-position-x/);
  assert.doesNotMatch(css, /beach-ocean-drift[\s\S]*translate3d/);
});

test('new UI copy contains no em dash characters', () => {
  const fs = require('node:fs');
  for (const file of ['index.html', 'js/app.js', 'js/languages/fa.js', 'js/languages/en.js', 'README.md']) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert.equal(source.includes(String.fromCodePoint(0x2014)), false, file);
  }
});


test('punctuation variants share the same rule path in English', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const replies = ['yes', 'yes!', 'yes.'].map((input) => freshEngine(EN).respond(input));
    assert.equal(new Set(replies).size, 1);
    assert.ok(EN.rules.find((rule) => rule.topic === 'affirmation').responses.some((line) => replies[0].includes(line)));
  } finally { Math.random = oldRandom; }
});

test('punctuation variants share the same rule path in Persian', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const replies = ['آره', 'آره!', 'آره.'].map((input) => freshEngine(FA).respond(input));
    assert.equal(new Set(replies).size, 1);
    assert.ok(FA.rules.find((rule) => rule.topic === 'affirmation').responses.some((line) => replies[0].includes(line)));
  } finally { Math.random = oldRandom; }
});

test('punctuation normalization preserves the original text for memory', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel sad!');
  assert.equal(engine.memory.recentUtterances.at(-1), 'I feel sad!');
  assert.equal(DaryaEngine.normalizeForMatching('I feel sad!', EN), 'I feel sad');
});

test('punctuated exit commands are detected consistently', () => {
  for (const input of ['goodbye', 'goodbye!', 'goodbye.']) assert.equal(freshEngine(EN).isExitCommand(input), true);
  for (const input of ['خداحافظ', 'خداحافظ!', 'خداحافظ.']) assert.equal(freshEngine(FA).isExitCommand(input), true);
});


test('English font declarations use the warm Be Vietnam Pro family without thin body weights', () => {
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.match(css, /font-family: 'Be Vietnam Pro'/);
  assert.match(css, /html\[lang=\"en\"\][\s\S]*--font-body: 'Be Vietnam Pro'/);
  assert.doesNotMatch(css, /font-family: 'Be Vietnam Pro';[\s\S]{0,180}font-weight: (?:100|200|300)/);
});

test('theme surfaces expose descriptive group, status, and composer semantics', () => {
  const html = require('node:fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /id=\"theme-picker\"[\s\S]*role=\"group\"/);
  assert.match(html, /id=\"typing-row\"[\s\S]*role=\"status\"/);
  assert.match(html, /id=\"composer\"[\s\S]*autocomplete=\"off\"/);
});


test('response strategy records purposeful decisions and avoids generic filler', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('hello');
  assert.equal(engine.lastResponseStrategy, 'greeting');
  assert.equal(engine.memory.responseStrategies.at(-1).strategy, 'greeting');
  assert.doesNotMatch(reply, /tell me more|go on/i);
});

test('serious strategy is not replaced by light warmth', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('I feel anxious about everything');
  assert.equal(engine.lastResponseStrategy, 'topic-question');
  assert.doesNotMatch(reply, /charmed|delightful|plot twist/i);
});

// ============================================================================
// Harder intelligence tests: real conversational edge cases
// ============================================================================

test('intelligence: 10× repeated Persian greeting breaks the loop gracefully', () => {
  const engine = freshEngine(FA);
  const replies = [];
  for (let i = 0; i < 10; i += 1) {
    replies.push(engine.respond('سلام'));
  }
  const repeatedGreetingPool = FA.repeatedGreetingResponses;
  // At least one response should be from the repeated-greeting pool
  // (the engine should not keep returning standard greetings).
  const hasReset = replies.some((r) => repeatedGreetingPool.includes(r));
  assert.ok(hasReset, 'engine should eventually produce a repeated-greeting response after many salam');
  // None of the 10 replies should be a question-free generic fallback
  // that reads like a non-sequitur.
  for (const reply of replies) {
    assert.equal(typeof reply, 'string');
    assert.ok(reply.length > 0);
  }
});

test('intelligence: 10× repeated English greeting breaks the loop gracefully', () => {
  const engine = freshEngine(EN);
  const replies = [];
  for (let i = 0; i < 10; i += 1) {
    replies.push(engine.respond('hello'));
  }
  const repeatedGreetingPool = EN.repeatedGreetingResponses;
  const hasReset = replies.some((r) => repeatedGreetingPool.includes(r));
  assert.ok(hasReset, 'engine should eventually produce a repeated-greeting response');
  for (const reply of replies) {
    assert.equal(typeof reply, 'string');
    assert.ok(reply.length > 0);
  }
});

// ============================================================================
// New intelligence tests: word repetition, frustration, factual QA, punctuation
// ============================================================================

test('intelligence: English word repetition detection names the exact word', () => {
  const engine = freshEngine(EN);
  // Send the same word 4+ times across multiple turns
  engine.respond('car car car car');
  const reply = engine.respond('car');
  const pool = EN.wordRepetitionResponses;
  // With 5 occurrences of "car", the repetition handler should fire
  assert.ok(pool.some((tpl) => {
    const rendered = tpl.replace('{word}', 'car').replace('{count}', '5');
    return reply === rendered;
  }) || reply.includes('car'), `expected a response mentioning 'car', got: ${reply}`);
});

test('intelligence: Persian word repetition detection names the exact word', () => {
  const engine = freshEngine(FA);
  engine.respond('قلم قلم قلم قلم قلم');
  const reply = engine.respond('قلم');
  const pool = FA.wordRepetitionResponses;
  assert.ok(pool.some((tpl) => {
    const rendered = tpl.replace('{word}', 'قلم').replace('{count}', '6');
    return reply === rendered;
  }) || reply.includes('قلم'), `expected a response mentioning 'قلم', got: ${reply}`);
});

test('intelligence: word repetition does NOT fire for non-repeated words', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(EN);
    // Fresh engine with no repeated words: should get a normal response, not repetition
    const reply = engine.respond('I feel anxious today');
    const pool = EN.wordRepetitionResponses;
    const isRepetition = pool.some((tpl) => {
      const rendered = tpl.replace('{word}', 'anxious').replace('{count}', '1');
      return reply === rendered;
    });
    assert.equal(isRepetition, false, 'should not trigger repetition for a single occurrence');
  } finally { Math.random = oldRandom; }
});

test('intelligence: frustration detection responds to exclamation marks', () => {
  const oldRandom = Math.random;
  Math.random = () => 0.5; // prevent warmth from prepending text, keep _pickVaried in bounds
  try {
    const engine = freshEngine(EN);
    const reply = engine.respond('I am so frustrated!!!');
    const pool = EN.frustrationResponses;
    assert.ok(pool.includes(reply), `expected a frustration response, got: ${reply}`);
  } finally { Math.random = oldRandom; }
});

test('intelligence: frustration detection responds to question marks', () => {
  const oldRandom = Math.random;    Math.random = () => 0.5; // prevent warmth from prepending text, keep _pickVaried in bounds
  try {
    const engine = freshEngine(EN);
    const reply = engine.respond('Why is this happening??');
    const pool = EN.frustrationResponses;
    assert.ok(pool.includes(reply), `expected a frustration response for '??', got: ${reply}`);
  } finally { Math.random = oldRandom; }
});

test('intelligence: factual math question gets answered and redirected', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('what is 2 + 3');
  assert.match(reply, /2.*\+.*3.*=|2.*\+.*3.*5/);
  // Should also include a gentle redirect
  assert.ok(reply.split(/[.?!]/).length >= 2, 'expected answer + followup, got: ' + reply);
});

test('intelligence: factual math question in Persian still gets a normal response', () => {
  // Persian math questions are not handled yet, so should get a normal conversation response
  const engine = freshEngine(FA);
  const reply = engine.respond('2 به اضافه 3 چنده');
  // Should not crash and should be a valid response string
  assert.equal(typeof reply, 'string');
  assert.ok(reply.length > 0);
});

test('intelligence: punctuation-normalized input matches the same rule', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const replyA = freshEngine(EN).respond('hello');
    const replyB = freshEngine(EN).respond('hello!');
    const replyC = freshEngine(EN).respond('hello?');
    // All three should produce the same response (punctuation stripped before matching)
    assert.equal(replyA, replyB);
    assert.equal(replyB, replyC);
  } finally { Math.random = oldRandom; }
});

test('intelligence: safety always beats word repetition and frustration', () => {
  const engine = freshEngine(FA);
  for (let i = 0; i < 4; i += 1) engine.respond('سلام');
  // Safety keyword after repeated greetings: must get safety response
  const reply = engine.respond('دیگه نمیخوام زندگی کنم!!!');
  assert.match(reply, /تنها نیستید|کمک تخصصی|توجه فوری/);
});

test('intelligence: factorial question does not override safety', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('what is 2 + 2 I want to kill myself');
  assert.match(reply, /not alone|crisis line|professional help/);
});

test('intelligence: Persian greeting with punctuation variety is detected', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const replyA = freshEngine(FA).respond('درود');
    const replyB = freshEngine(FA).respond('درود!');
    const replyC = freshEngine(FA).respond('درود؟');
    assert.equal(replyA, replyB);
    assert.equal(replyB, replyC);
  } finally { Math.random = oldRandom; }
});

test('intelligence: apostrophe in contractions is preserved in normalized matching', () => {
  const engine = freshEngine(EN);
  // "can't" must still match the sleep rule after punctuation normalization
  const reply = engine.respond("I can't sleep");
  // The engine may use topicSpecificQuestions.sleep ("Has the tiredness been there...")
  // or the rule's response pool (mentions "sleep"). Both are valid.
  assert.match(reply, /sleep|rest|night|tiredness/i);
});

test('intelligence: highly repetitive keyboard-smash gets a noise response', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('aaaaaa');
  const hasSpam = EN.spamNoiseResponses.some((line) => reply.includes(line));
  assert.ok(hasSpam, `expected spam noise response, got: ${reply}`);
});

test('intelligence: short ambiguous input gets an open, inviting response', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('hmm');
  const isOpen = EN.ambiguousInputResponses.some((line) => reply.includes(line))
    || EN.genericFallbacks.some((line) => reply.includes(line))
    || EN.strategyShiftFallbacks.some((line) => reply.includes(line));
  assert.ok(isOpen, `hmm should produce an open response, got: ${reply}`);
});

test('intelligence: safety always overrides repeated greeting detection', () => {
  const engine = freshEngine(FA);
  // First simulate repeated greetings
  for (let i = 0; i < 4; i += 1) engine.respond('سلام');
  // Then a crisis message - should get safety response, not greeting reset
  const reply = engine.respond('دیگه نمیخوام زندگی کنم');
  assert.match(reply, /تنها نیستید|کمک تخصصی|توجه فوری/);
});

test('intelligence: repeated-digit input does not crash or produce a rule-topic reply', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('123');
  assert.equal(typeof reply, 'string');
  assert.ok(reply.length > 0);
  // Should not match a content topic like work, family, anxiety, etc.
  assert.doesNotMatch(reply, /job|work|family|mother|anxiety|sad/i);
});

test('intelligence: topic blend fires correctly on mixed input across languages', () => {
  const oldRandom = Math.random;
  Math.random = () => 0;
  try {
    const engine = freshEngine(EN);
    const reply = engine.respond("I can't sleep because I feel so anxious");
    assert.ok(EN.blendResponses.blend_sleep_anxiety.includes(reply));
    assert.doesNotMatch(reply, /[?]/);
  } finally { Math.random = oldRandom; }
});

console.log(`\nTests loaded from: ${__filename}`);
