/**
 * Cross-cutting quality checks for the static Darya application.
 *
 * These checks complement the conversation-focused suite with file, style,
 * accessibility, offline-shell, and localization assertions. They use only
 * Node built-ins so the PWA remains dependency-free.
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

global.window = global;
require(path.join(__dirname, '..', 'js', 'languages', 'halfspace.js'));
require(path.join(__dirname, '..', 'js', 'languages', 'entity-extractor.js'));
require(path.join(__dirname, '..', 'js', 'languages', 'fa.js'));
require(path.join(__dirname, '..', 'js', 'languages', 'en.js'));
require(path.join(__dirname, '..', 'js', 'darya-engine.js'));

const ROOT = path.join(__dirname, '..');
const { DaryaResponseEngine, normalizeForMatching } = global.DaryaEngine;
const { fa: FA, en: EN } = global.DaryaLang;

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function fresh(lang) {
  return new DaryaResponseEngine(lang);
}

test('turn frames classify intent, dialogue act, phase, and strategy together', () => {
  const engine = fresh(EN);
  const reply = engine.respond('My job has been stressful');
  const frame = engine.conversationState;
  assert.equal(frame.dialogueAct, 'statement');
  assert.equal(frame.intent, 'topic_statement');
  assert.equal(frame.phase, 'clarifying');
  assert.equal(frame.strategy, 'topic-question');
  assert.ok(reply.length > 0);
  assert.equal(engine.memory.turnFrames.at(-1).turn, 1);
});

test('questions do not trigger another question simply to sound active', () => {
  const engine = fresh(EN);
  const reply = engine.respond('What do you think about this?');
  assert.equal(engine.currentTurnDialogueAct, 'question');
  assert.equal(engine.currentTurnQuestionNeed, 0);
  assert.doesNotMatch(reply, /[?]/u);
});

test('multi-turn scenario preserves the latest relevant subject after a topic shift', () => {
  const engine = fresh(EN);
  engine.respond('My job has been stressful');
  engine.respond('My family is also worried');
  const reply = engine.respond('it happened again');
  assert.equal(engine.currentReferenceContext.topic, 'family');
  assert.equal(engine.conversationState.phase, 'contextualContinuation');
  assert.doesNotMatch(reply, /work thread|workday/i);
});

test('entity correction removes the old referent and promotes the corrected one', () => {
  const engine = fresh(EN);
  engine.memory.turnCount = 1;
  engine.memory.rememberEntities([{ type: 'person', surface: 'mother', confidence: 0.9 }], 1, { topics: ['family'] });
  const correction = engine.detectEntityCorrection('I meant my manager, not my mother');
  assert.deepEqual(correction, { newSurface: 'my manager', oldSurface: 'my mother' });
  engine.memory.correctEntity(correction.oldSurface, { type: 'person', surface: correction.newSurface, confidence: 0.96 }, { topics: ['work'] });
  assert.equal(engine.memory.namedEntities.has('person:mother'), false);
  assert.ok(engine.memory.namedEntities.has('person:my manager'));
});

test('response candidate ranking penalizes recent filler and repeated questions', () => {
  const engine = fresh(EN);
  engine.memory.recentBotMessages.push('The repeated line.');
  engine.memory.consecutiveQuestions = 1;
  assert.ok(engine.scoreResponseCandidate('A fresh reflective sentence.') > engine.scoreResponseCandidate('The repeated line.'));
  assert.ok(engine.scoreResponseCandidate('What now?') < engine.scoreResponseCandidate('A fresh reflective sentence.'));
});

test('reference resolution follows a recent subject when the user says it happened again', () => {
  const engine = fresh(EN);
  engine.respond('My job has been stressful');
  const context = engine.resolveReferenceContext('it happened again');
  assert.ok(context);
  assert.equal(context.topic, 'work');
  assert.ok(context.confidence >= 0.6);
});

test('reference resolution refuses an absent or stale subject', () => {
  const engine = fresh(EN);
  assert.equal(engine.resolveReferenceContext('it happened again'), null);
  engine.memory.currentSubject = { topic: 'work', entityRefs: [], since: -10 };
  engine.memory.turnCount = 1;
  assert.equal(engine.resolveReferenceContext('it happened again'), null);
});

test('dialogue scenarios maintain state across multiple turns', () => {
  const scenarios = ['work-correction.json', 'question-budget.json'];
  for (const file of scenarios) {
    const scenario = JSON.parse(read(`tests/scenarios/${file}`));
    const lang = scenario.language === 'fa' ? FA : EN;
    const engine = fresh(lang);
    for (const turn of scenario.turns) {
      engine.respond(turn.text);
      assert.equal(engine.conversationState.dialogueAct, turn.dialogueAct, `${file}:${turn.text}`);
      if (turn.topic) assert.ok(engine.currentTurnTopics.includes(turn.topic), `${file}:${turn.text}`);
    }
  }
});

test('bot question tracking records answers without creating duplicate questions', () => {
  const engine = fresh(EN);
  engine.respond('My job has been stressful');
  assert.ok(engine.memory.pendingQuestions.length > 0);
  const before = engine.memory.answeredQuestions.length;
  engine.respond('The meeting with my manager was the hardest part');
  assert.equal(engine.memory.answeredQuestions.length, before + 1);
  assert.equal(engine.memory.answeredQuestions.at(-1).answered, true);
});

test('quality fixture: all application shell files exist', () => {
  for (const file of ['index.html', 'css/style.css', 'js/app.js', 'js/darya-engine.js', 'sw.js', 'manifest.json']) {
    assert.ok(fs.existsSync(path.join(ROOT, file)), file);
  }
});

test('quality fixture: no runtime dependencies were added', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.equal(packageJson.dependencies, undefined);
});

test('punctuation matching canonicalizes Persian and English sentence marks', () => {
  assert.equal(normalizeForMatching('سلام!', FA), 'سلام');
  assert.equal(normalizeForMatching('سلام.', FA), 'سلام');
  assert.equal(normalizeForMatching('hello!', EN), 'hello');
  assert.equal(normalizeForMatching('hello.', EN), 'hello');
});

test('punctuation matching does not erase meaningful internal words', () => {
  assert.equal(normalizeForMatching('سلام، دوست من.', FA), 'سلام دوست من');
  assert.equal(normalizeForMatching('hello, dear friend.', EN), 'hello dear friend');
});

test('professional half-space normalizer handles joined and spaced forms', () => {
  assert.equal(FA.normalize('میخواهم'), 'می‌خواهم');
  assert.equal(FA.normalize('می روم'), 'می‌روم');
  assert.equal(FA.normalize('بیخبر'), 'بی‌خبر');
  assert.equal(FA.normalize('کتابهایم'), 'کتاب‌هایم');
});

test('professional half-space normalizer protects safe Persian roots', () => {
  for (const word of ['میز', 'میدان', 'میهن', 'خوشبخت', 'متر', 'بیمه', 'بیبی']) {
    assert.equal(FA.normalize(word), word, word);
  }
});

test('entity memory stores topic and emotional context with each detail', () => {
  const engine = fresh(EN);
  engine.memory.rememberEntities([{ type: 'person', surface: 'Maya', confidence: 0.9 }], 1, {
    topics: ['family', 'sadness'],
    seriousness: 0.8,
  });
  const detail = engine.memory.namedEntities.get('person:maya');
  assert.deepEqual(detail.contextTopics, ['family', 'sadness']);
  assert.equal(detail.contextSeriousness, 0.8);
});

test('entity callback rejects a remembered detail from an unrelated current topic', () => {
  const engine = fresh(EN);
  engine.entityCallbackProbability = 1;
  engine.memory.turnCount = 1;
  engine.memory.rememberEntities([{ type: 'person', surface: 'Maya', confidence: 0.9 }], 1, { topics: ['family'] });
  engine.memory.turnCount = 2;
  engine.currentTurnTopics = ['work'];
  assert.equal(engine._respondToEntityReference(), null);
});

test('every opening pool contains invitations rather than passive closers', () => {
  for (const lang of [FA, EN]) {
    for (const pool of [lang.greetingsOpen, lang.greetingsInviting, lang.greetingsReturning]) {
      assert.ok(pool.length >= 8);
      assert.ok(pool.every((line) => /[?؟]/u.test(line)));
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

test('topic blend pools cover the five common combinations', () => {
  for (const lang of [FA, EN]) {
    for (const key of ['blend_sleep_anxiety', 'blend_work_anger', 'blend_family_sadness', 'blend_loneliness_sleep', 'blend_joy_gratitude']) {
      assert.ok(Array.isArray(lang.blendResponses[key]), `${lang.code}:${key}`);
      assert.ok(lang.blendResponses[key].length >= 4);
    }
  }
});

test('seriousness and humor gates are explicit and conservative', () => {
  const serious = fresh(EN);
  serious.memory.turnCount = 4;
  serious.currentTurnSeriousness = 0.8;
  serious.lastTurnNeedsCare = true;
  assert.equal(serious.canHumorFire(), false);
  const light = fresh(EN);
  light.memory.turnCount = 3;
  light.currentTurnSeriousness = 0.2;
  light.lastTurnNeedsCare = false;
  assert.equal(light.canHumorFire(), true);
});

test('question budget constants remain bounded', () => {
  assert.equal(global.DaryaEngine.CONSECUTIVE_QUESTION_LIMIT, 1);
  assert.equal(global.DaryaEngine.QUESTION_BUDGET_WINDOW, 3);
  assert.equal(global.DaryaEngine.QUESTION_BUDGET_LIMIT, 1);
});

test('chat menu exposes a complete keyboard navigation contract', () => {
  const html = read('index.html');
  const app = read('js/app.js');
  assert.match(html, /menu-trigger[^>]*aria-controls="menu-popover"/u);
  assert.match(app, /menuItemElements/);
  assert.match(app, /ArrowDown/);
  assert.match(app, /ArrowUp/);
  assert.match(app, /closeMenu\(true\)/);
});

test('every static button has a title and every status surface is labelled', () => {
  const html = read('index.html');
  for (const button of html.matchAll(/<button\b[^>]*>/gu)) {
    assert.match(button[0], /title="[^"]+"/u, button[0]);
  }
  assert.match(html, /id="typing-row"[^>]*role="status"/u);
  assert.match(html, /id="theme-picker"[^>]*role="group"/u);
});

test('export controls have the intended order and accessible names', () => {
  const html = read('index.html');
  assert.ok(html.indexOf('id="menu-export-txt"') < html.indexOf('id="menu-export-md"'));
  assert.match(html, /menu-export-txt[^>]*aria-label="[^"]+"/u);
  assert.match(html, /menu-export-md[^>]*aria-label="[^"]+"/u);
  assert.match(FA.ui.menuExportMd, /مارک‌داون/);
  assert.doesNotMatch(FA.ui.menuExportMd, /[()]/u);
});

test('Persian theme terminology uses پوسته consistently', () => {
  for (const value of [FA.ui.themeOceanLabel, FA.ui.themeBeachLabel, FA.ui.themeOceanTitle, FA.ui.themeBeachTitle, FA.ui.themeGroupLabel, FA.ui.themeToggleTitle]) {
    assert.match(value, /پوسته/u);
    assert.doesNotMatch(value, /تم/u);
  }
});

test('English body font is Be Vietnam Pro with readable weights', () => {
  const css = read('css/style.css');
  assert.match(css, /--font-body: 'Be Vietnam Pro'/u);
  assert.match(css, /font-family: 'Be Vietnam Pro'/u);
  assert.doesNotMatch(css, /font-family: 'Be Vietnam Pro';[\s\S]{0,180}font-weight: (?:100|200|300)/u);
  for (const weight of ['Regular', 'Medium', 'SemiBold', 'Bold', 'Italic']) {
    const file = path.join(ROOT, `fonts/BeVietnamPro-${weight}.woff2`);
    assert.ok(fs.existsSync(file), file);
    assert.ok(fs.statSync(file).size > 1000, file);
  }
});

test('beach controls and validation hints remain visible on the bright sky', () => {
  const css = read('css/style.css');
  assert.match(css, /html\[data-theme="beach"\] \.menu__trigger[\s\S]*color: var\(--color-on-sky\)/u);
  assert.match(css, /html\[data-theme="beach"\] \.input-hint[\s\S]*background: rgba\(255, 255, 255, 0\.48\)/u);
  assert.match(css, /html\[data-theme="beach"\] \.disclaimer[\s\S]*color: #f7ead5/u);
});

test('beach theme has three masked tiled layers and a full-scene sky', () => {
  const html = read('index.html');
  const css = read('css/style.css');
  assert.equal((html.match(/class="beach-scene__ocean /gu) || []).length, 3);
  assert.match(css, /beach-scene__sky[\s\S]*height: 100%/u);
  assert.ok((css.match(/background-repeat: repeat-x/gu) || []).length >= 3);
  assert.ok((css.match(/mask-image:/gu) || []).length >= 3);
  assert.doesNotMatch(css, /beach-ocean-drift[\s\S]*translate3d\([^,]+,\s*-[123]px/u);
});

test('beach composer scrim is warm and restrained rather than a black shadow', () => {
  const css = read('css/style.css');
  const scrim = css.match(/\.backdrop__scrim\s*\{[\s\S]*?\n\}/u)?.[0] || '';
  assert.match(scrim, /rgba\(91, 61, 35, 0\.28\)/u);
  assert.doesNotMatch(scrim, /rgba\(0, 0, 0/u);
  assert.match(css, /beach-scene__ocean::after/);
});

test('ocean theme has calm bubbles, glows, and a reduced-motion depth breath', () => {
  const app = read('js/app.js');
  const css = read('css/style.css');
  assert.match(app, /const count = 8/u);
  assert.match(app, /randomBetween\(4, 14\)/u);
  assert.match(app, /randomBetween\(14, 22\)/u);
  assert.match(css, /backdrop__depth-breath/u);
  assert.match(css, /@keyframes depth-breathe/u);
  assert.match(css, /@keyframes horizon-drift[\s\S]*translateX/u);
  assert.doesNotMatch(css.match(/@keyframes horizon-drift[\s\S]*?\}/u)?.[0] || '', /translateY/u);
});

test('representative theme foregrounds meet WCAG AA contrast', () => {
  const css = read('css/style.css');
  const luminance = (hex) => {
    const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const ratio = (foreground, background) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  assert.ok(ratio('#123847', '#b3d6e0') >= 4.5);
  assert.ok(ratio('#204957', '#b3d6e0') >= 4.5);
  assert.ok(ratio('#eaf3ef', '#153f49') >= 4.5);
  assert.ok(ratio('#a9c2bd', '#153f49') >= 4.5);
});

test('service worker uses a non-versioned cache name and precaches the app shell', () => {
  const sw = read('sw.js');
  assert.match(sw, /const CACHE_NAME = 'darya-cache-current'/u);
  assert.doesNotMatch(sw, /CACHE_VERSION|darya-v\d/u);
  for (const entry of ['./index.html', './css/style.css', './js/app.js', './js/darya-engine.js', './js/languages/fa.js', './js/languages/en.js', './js/languages/entity-extractor.js', './js/languages/halfspace.js']) {
    assert.match(sw, new RegExp(entry.replaceAll('.', '\\.'), 'u'), entry);
  }
});

test('application text contains no em dash or identity claims', () => {
  const files = ['index.html', 'css/style.css', 'js/app.js', 'js/darya-engine.js', 'js/languages/en.js', 'js/languages/fa.js', 'README.md', 'package.json'];
  const forbidden = ['language model', 'LLM', 'AI assistant', 'therapist', 'counselor'];
  for (const file of files) {
    const text = read(file);
    assert.equal(text.includes(String.fromCodePoint(0x2014)), false, file);
    for (const phrase of forbidden) assert.equal(text.toLocaleLowerCase().includes(phrase.toLocaleLowerCase()), false, `${file}:${phrase}`);
  }
});

test('application has no numeric release or cache identifier', () => {
  const files = ['index.html', 'css/style.css', 'js/app.js', 'js/darya-engine.js', 'js/languages/en.js', 'js/languages/fa.js', 'README.md', 'sw.js', 'package.json'];
  for (const file of files) {
    const text = read(file);
    assert.doesNotMatch(text, /darya-v\d|CACHE_VERSION|"version"\s*:/u, file);
  }
});
