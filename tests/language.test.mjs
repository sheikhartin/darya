/**
 * Language pack validation for Darya.
 *
 * Verifies that both Persian (fa) and English (en) language packs expose
 * the same structural shape, cover the same topics, provide matching UI
 * string keys, and follow content conventions (no forbidden phrases,
 * correct greeting pools, proper entity vocabulary, etc.).
 *
 * These tests are purely about language pack content, not engine behavior.
 * Run with: node --test tests/language.test.mjs
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { freshEngine, FA, EN, halfSpace, ZWNJ } from './helpers.mjs';

// ============================================================================
// Bilingual parity: structural shape
// ============================================================================

test('bilingual parity: fa and en packs expose the same structural fields', () => {
  const requiredFields = [
    'code',
    'dir',
    'botName',
    'scriptRange',
    'minScriptRatio',
    'normalize',
    'rules',
    'trivialCaptures',
    'genericFallbacks',
    'strategyShiftFallbacks',
    'sessionCheckIns',
    'checkInEvery',
    'questionPattern',
    'questionFallbacks',
    'topicCallbacks',
    'quotedCallbackTemplates',
    'distressNudges',
    'sentimentLexicon',
    'exitKeywords',
    'exitConfirmMessages',
    'greetings',
    'farewells',
    'emptyInputReply',
    'foreignLanguageRedirect',
    'ui'
  ];
  for (const field of requiredFields) {
    assert.ok(field in FA, `fa pack is missing "${field}"`);
    assert.ok(field in EN, `en pack is missing "${field}"`);
  }
});

test('bilingual parity: both packs cover the same set of topics', () => {
  const faTopics = new Set(FA.rules.map((r) => r.topic));
  const enTopics = new Set(EN.rules.map((r) => r.topic));
  assert.deepEqual(
    faTopics,
    enTopics,
    'fa and en should recognize the same topics, just phrased natively'
  );
});

test('bilingual parity: both packs expose the same UI string keys', () => {
  const faKeys = Object.keys(FA.ui).sort();
  const enKeys = Object.keys(EN.ui).sort();
  assert.deepEqual(faKeys, enKeys);
});

test('notification chrome is localized in both packs', () => {
  for (const lang of [FA, EN]) {
    assert.equal(typeof lang.ui.notificationError, 'string');
    assert.equal(typeof lang.ui.notificationWarning, 'string');
    assert.equal(typeof lang.ui.notificationInfo, 'string');
    assert.ok(lang.ui.notificationDismiss.trim().length > 0);
  }
  assert.match(FA.ui.notificationDismiss, /بستن/);
  assert.match(EN.ui.notificationDismiss, /dismiss/i);
});

test('English-only pronoun reflection is intentionally absent from Persian', () => {
  assert.equal(FA.pronounMap, null);
  assert.ok(EN.pronounMap && typeof EN.pronounMap === 'object');
});

test('pronoun reflection produces a grammatical, safely-bounded result', () => {
  const seen = new Set();
  for (let trial = 0; trial < 60; trial += 1) {
    const e = freshEngine(EN);
    e.respond('hi');
    seen.add(e.respond('I keep thinking about my old apartment'));
  }
  const reflected = [...seen].find((r) => r.toLowerCase().startsWith('so '));
  assert.ok(
    reflected,
    'expected at least one pronoun-reflected reply across 60 trials'
  );
  assert.match(reflected, /you keep thinking about your old apartment/i);
});

// ============================================================================
// Halfspace / ZWNJ
// ============================================================================

test('halfspace module exposes the normalizer function and the shared ZWNJ constant', () => {
  assert.equal(typeof halfSpace, 'function');
  assert.equal(ZWNJ, '\u200c');
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
    ['نمیخواهم', 'نمی\u200cخواهم']
  ]) {
    assert.equal(FA.normalize(raw), expected);
  }
});

test('halfspace normalizes spaced progressive prefixes without touching unrelated text', () => {
  assert.equal(FA.normalize('می روم و نمی کنم'), 'می\u200cروم و نمی\u200cکنم');
  assert.equal(FA.normalize('میز و میدان و میهن'), 'میز و میدان و میهن');
});

test('halfspace joins the Persian privative and negative prefixes', () => {
  assert.equal(FA.normalize('بی ادب و نا امید'), 'بی\u200cادب و نا\u200cامید');
});

test('halfspace joins comparative and superlative suffixes', () => {
  assert.equal(
    FA.normalize('بزرگ تر و بزرگ ترین'),
    'بزرگ\u200cتر و بزرگ\u200cترین'
  );
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
  assert.equal(halfSpace(null), '');
  assert.equal(halfSpace(123), '123');
});

test('halfspace allow-list preserves lookalike roots and safe compounds', () => {
  for (const word of [
    'میز',
    'میدان',
    'میهن',
    'خوشبخت',
    'متر',
    'بیمه',
    'بیبی'
  ]) {
    const normalized = FA.normalize(word);
    assert.equal(normalized, word, `${word} should remain unchanged`);
    assert.equal(
      normalized.includes('\u200c'),
      false,
      `${word} must not gain a ZWNJ`
    );
  }
});

// ============================================================================
// UI string keys and ARIA labels
// ============================================================================

test('new title keys are present symmetrically in both UI packs', () => {
  for (const key of [
    'pickerFaTitle',
    'pickerEnTitle',
    'themeOceanTitle',
    'themeBeachTitle',
    'sendButtonTitle',
    'menuTriggerTitle',
    'newChatTitle',
    'menuExportTitle'
  ]) {
    assert.equal(typeof FA.ui[key], 'string');
    assert.equal(typeof EN.ui[key], 'string');
  }
});

test('ARIA labels describe the action rather than using generic nouns', () => {
  // These are the keys actually wired to the controls in app.js (the
  // send button and the menu trigger both use them as aria-label).
  assert.match(FA.ui.sendButtonTitle, /^ارسال/);
  assert.match(FA.ui.menuTriggerTitle, /^منو/);
  assert.match(EN.ui.sendButtonTitle, /^send$/i);
  assert.match(EN.ui.menuTriggerTitle, /menu/i);
});

test('menu export labels contain no parentheses in either language', () => {
  for (const lang of [FA, EN]) {
    assert.doesNotMatch(lang.ui.menuExportLabel, /[()]/);
    assert.doesNotMatch(lang.ui.menuExportTitle, /[()]/);
  }
});

test('the single export label names the action without the format', () => {
  assert.match(FA.ui.menuExportLabel, /دانلود/);
  assert.match(EN.ui.menuExportLabel, /conversation/i);
  for (const lang of [FA, EN]) {
    assert.doesNotMatch(lang.ui.menuExportLabel, /مارک|فرمت|Markdown|plain/i);
    assert.doesNotMatch(lang.ui.menuExportTitle, /مارک|فرمت|Markdown|plain/i);
  }
});

test('Persian theme terminology uses پوسته consistently', () => {
  for (const value of [
    FA.ui.themeOceanLabel,
    FA.ui.themeBeachLabel,
    FA.ui.themeOceanTitle,
    FA.ui.themeBeachTitle,
    FA.ui.themeGroupLabel
  ]) {
    assert.match(value, /پوسته/u);
    assert.doesNotMatch(value, /تم/u);
  }
});

// ============================================================================
// Greeting pools
// ============================================================================

test('each language exposes three explicit greeting pools', () => {
  for (const lang of [FA, EN]) {
    assert.ok(lang.greetingsOpen.length > 0);
    assert.ok(lang.greetingsInviting.length > 0);
    assert.ok(lang.greetingsReturning.length > 0);
  }
});

test('default greetings do not ask how are you', () => {
  for (const line of [...FA.greetings, ...EN.greetings]) {
    assert.doesNotMatch(line, /how are you|حال شما چطور/i);
  }
});

test('every default opening invites the person to share something', () => {
  for (const line of [...FA.greetings, ...EN.greetings]) {
    assert.match(line, /\?|؟|tell|share|بگویید|گفتن|شروع|ذهن|احساس/iu);
  }
});

test('initial greeting pools always invite a response with a question', () => {
  for (const lang of [EN, FA]) {
    for (const line of [
      ...lang.greetingsOpen,
      ...lang.greetingsInviting,
      ...lang.greetingsReturning
    ]) {
      assert.match(line, /[?؟]/u, line);
    }
  }
});

test('every opening pool contains invitations rather than passive closers', () => {
  for (const lang of [FA, EN]) {
    for (const pool of [
      lang.greetingsOpen,
      lang.greetingsInviting,
      lang.greetingsReturning
    ]) {
      assert.ok(pool.length >= 8);
      assert.ok(pool.every((line) => /[?؟]/u.test(line)));
    }
  }
});

// ============================================================================
// Strategy-shift fallback validation
// ============================================================================

test('strategy-shift fallback lines keep the conversation open', () => {
  const closers =
    /glad i could help|happy to help|خوشحالم که کمک کردم|گفتگو پایان|خداحافظ|goodbye/i;
  for (const line of [
    ...FA.strategyShiftFallbacks,
    ...EN.strategyShiftFallbacks
  ]) {
    assert.doesNotMatch(line, closers);
  }
});

test('strategy-shift fallback pools contain no closing-vibe language', () => {
  const closing = [
    'glad',
    'happy to help',
    'خوشحالم',
    'موفق باشی',
    'امیدوارم',
    'خداحافظ',
    'bye',
    'see you',
    'take care'
  ];
  for (const line of [
    ...FA.strategyShiftFallbacks,
    ...EN.strategyShiftFallbacks
  ]) {
    const lower = line.toLocaleLowerCase();
    for (const phrase of closing) {
      assert.equal(lower.includes(phrase.toLocaleLowerCase()), false, line);
    }
  }
});

// ============================================================================
// Entity vocabulary layers
// ============================================================================

test('both language packs provide matching entity vocabulary layers', () => {
  for (const field of [
    'familyTerms',
    'professionTerms',
    'placeWords',
    'entityCallbackTemplates'
  ]) {
    assert.ok(Array.isArray(FA[field]) || typeof FA[field] === 'object');
    assert.ok(Array.isArray(EN[field]) || typeof EN[field] === 'object');
  }
});

test('all entity callback templates are context-specific and nonempty', () => {
  for (const lang of [EN, FA]) {
    for (const [type, pool] of Object.entries(lang.entityCallbackTemplates)) {
      assert.ok(pool.length > 0, `${lang.code}:${type}`);
      assert.ok(pool.every((line) => line.includes('{surface}')));
    }
  }
});

// ============================================================================
// Topic/question pool completeness
// ============================================================================

test('topic-specific question maps are complete and distinct for both locales', () => {
  for (const lang of [EN, FA]) {
    for (const [topic, pool] of Object.entries(lang.topicSpecificQuestions)) {
      assert.ok(pool.length >= 4, `${lang.code}:${topic}`);
      assert.equal(new Set(pool).size, pool.length);
    }
  }
});

test('every declared blend pool has four distinct non-question lines in both languages', () => {
  for (const lang of [EN, FA]) {
    for (const [name, pool] of Object.entries(lang.blendResponses)) {
      assert.ok(pool.length >= 4, `${lang.code}:${name}`);
      assert.equal(new Set(pool).size, pool.length);
      assert.ok(
        pool.every((line) => !/[?؟]/u.test(line)),
        `${lang.code}:${name} contains a question`
      );
    }
  }
});

test('topic blend pools cover every declared combination in both languages', () => {
  for (const lang of [FA, EN]) {
    const keys = Object.keys(lang.blendResponses);
    assert.ok(
      keys.length >= 5,
      `${lang.code}: expected at least 5 blend pools, got ${keys.length}`
    );
    for (const key of keys) {
      assert.ok(Array.isArray(lang.blendResponses[key]), `${lang.code}:${key}`);
      assert.ok(lang.blendResponses[key].length >= 4);
    }
  }
});

test('topic question pools are present for every declared topic', () => {
  for (const lang of [FA, EN]) {
    for (const [topic, pool] of Object.entries(lang.topicSpecificQuestions)) {
      assert.ok(pool.length >= 4, `${lang.code}:${topic}`);
      assert.equal(new Set(pool).size, pool.length);
    }
  }
});

// ============================================================================
// Reply pool content conventions
// ============================================================================

test('reply pools contain no forbidden generic follow-up phrases', () => {
  const forbidden = [
    'tell me more',
    'how does that make you feel',
    'what else can you tell me',
    'بیشتر بگو',
    'چه احساسی داری',
    'چه چیز دیگری'
  ];
  for (const lang of [EN, FA]) {
    const values = [
      ...lang.genericFallbacks,
      ...lang.strategyShiftFallbacks,
      ...lang.rules.flatMap((rule) => rule.responses),
      ...Object.values(lang.topicCallbacks).flat(),
      ...Object.values(lang.entityCallbackTemplates).flat()
    ];
    for (const line of values) {
      for (const phrase of forbidden) {
        assert.equal(line.toLocaleLowerCase().includes(phrase), false, line);
      }
    }
  }
});

test('no generated reply uses should more than once', () => {
  for (const lang of [EN, FA]) {
    const values = [
      ...lang.genericFallbacks,
      ...lang.strategyShiftFallbacks,
      ...lang.rules.flatMap((rule) => rule.responses)
    ];
    for (const line of values) {
      assert.ok((line.match(/\bshould\b/giu) || []).length <= 1, line);
    }
  }
});

test('topic callbacks are specific and reject generic backward-reference openings', () => {
  const generic =
    /^(?:earlier you|you mentioned|you brought up|قبلاً گفتی|همون‌طور که گفتی|یادته گفتی)/iu;
  for (const lang of [EN, FA]) {
    for (const pool of Object.values(lang.topicCallbacks)) {
      for (const line of pool) {
        assert.doesNotMatch(line, generic, line);
      }
    }
    for (const pool of Object.values(lang.entityCallbackTemplates)) {
      for (const line of pool) {
        assert.doesNotMatch(line, generic, line);
      }
    }
  }
});

test('all language rules expose response arrays', () => {
  for (const lang of [EN, FA]) {
    for (const rule of lang.rules) {
      assert.ok(Array.isArray(rule.responses), `${lang.code}:${rule.topic}`);
    }
  }
});

test('identity replies avoid unsupported professional or model claims', () => {
  const source = fs
    .readFileSync(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '..',
        'js',
        'languages',
        'en.js'
      ),
      'utf8'
    )
    .toLowerCase();
  const professional = ['therap', 'ist'].join('');
  const model = ['language', ' model'].join('');
  assert.doesNotMatch(
    source,
    new RegExp(`i['\u2019]?m darya[^\\n]*(${professional}|${model})`, 'i')
  );
});

test('new UI copy contains no em dash characters in files', () => {
  for (const file of [
    'index.html',
    'js/app.js',
    'js/languages/fa.js',
    'js/languages/en.js',
    'README.md'
  ]) {
    const source = fs.readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '..', file),
      'utf8'
    );
    assert.equal(source.includes(String.fromCodePoint(0x2014)), false, file);
  }
});

// ============================================================================
// Seriousness and humor gates (language-level metadata)
// ============================================================================

test('seriousness and humor gates are explicit and conservative', () => {
  const serious = freshEngine(EN);
  serious.memory.turnCount = 4;
  serious.currentTurnSeriousness = 0.8;
  serious.lastTurnNeedsCare = true;
  assert.equal(serious.canHumorFire(), false);
  const light = freshEngine(EN);
  light.memory.turnCount = 3;
  light.currentTurnSeriousness = 0.2;
  light.lastTurnNeedsCare = false;
  assert.equal(light.canHumorFire(), true);
});
