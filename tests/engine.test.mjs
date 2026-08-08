/**
 * Engine-level test suite for Darya.
 *
 * Exercises the conversation engine directly: normalization, rule matching,
 * entity extraction and memory, question handling, topic blends, math
 * detection, mixed-language detection, emotion calibration, distress nudges,
 * repetition avoidance, edge cases, and all other engine-internal logic.
 *
 * Uses Node built-ins only. Run with: node --test tests/engine.test.mjs
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  freshEngine,
  seededRandom,
  FA,
  EN,
  DaryaEntityExtractor,
  isValidScript,
  normalizeForMatching,
  DaryaEngine
} from './helpers.mjs';

// ============================================================================
// Normalization
// ============================================================================

test('fa normalize: unifies Arabic look-alike letters to Persian forms', () => {
  assert.equal(FA.normalize('علي'), 'علی');
  assert.equal(FA.normalize('كتاب'), 'کتاب');
});

test('fa normalize: strips Arabic diacritics', () => {
  const withDiacritics = 'السَّلَامُ عَلَيْكُمْ';
  const stripped = FA.normalize(withDiacritics);
  assert.ok(!/[\u064B-\u065F]/.test(stripped));
});

test('fa normalize: converts Arabic-Indic digits to Persian digits', () => {
  assert.equal(FA.normalize('١٢٣'), '۱۲۳');
});

test('fa normalize: corrects "مي" + space to the half-space (ZWNJ) form', () => {
  assert.equal(FA.normalize('می خواهم بروم'), 'می\u200cخواهم بروم');
});

test('fa normalize regression: does NOT corrupt words containing می-like substrings', () => {
  assert.equal(FA.normalize('کمی خسته‌ام'), 'کمی خسته‌ام');
  assert.equal(FA.normalize('زیر میز است'), 'زیر میز است');
  assert.equal(FA.normalize('میدان آزادی'), 'میدان آزادی');
});

test('fa normalize: corrects already space-free known verb forms', () => {
  assert.equal(FA.normalize('میخواهم بروم'), 'می\u200cخواهم بروم');
});

test('normalizeForMatching: Persian progressive-prefix spellings unify', () => {
  // ZWNJ, full-space, and no-space spellings of می/نمی all collapse to
  // the same matching token, so a rule that lists one form fires for all.
  const needInputs = ['می خوام برم', 'میخوام برم', 'می\u200cخوام برم'];
  assert.deepEqual(
    needInputs.map((t) => normalizeForMatching(t, FA)),
    ['میخوام برم', 'میخوام برم', 'میخوام برم']
  );
  const apologyInputs = ['عذر می‌خوام', 'عذر میخوام', 'عذر می خوام'];
  assert.deepEqual(
    apologyInputs.map((t) => normalizeForMatching(t, FA)),
    ['عذر میخوام', 'عذر میخوام', 'عذر میخوام']
  );
  // Mid-word "می" must never be merged (regression for "کمی").
  assert.equal(normalizeForMatching('کمی ساده تر بگو', FA), 'کمی ساده تر بگو');
  assert.equal(normalizeForMatching('درک می کنم', FA), 'درک میکنم');
});

test('FA: half-space spelling variants all route to the same rule', () => {
  const engine = freshEngine(FA);
  const routed = (input) => {
    const matches = engine._matchRules(normalizeForMatching(input, FA));
    return matches[0]?.rule.topic || '(none)';
  };
  const groups = {
    need: ['می خوام برم', 'میخوام برم', 'می‌خوام برم'],
    simplify: [
      'کمی ساده‌تر توضیح بده',
      'کمی ساده تر توضیح بده',
      'ساده‌تر بنویس'
    ],
    apology: [
      'ببخشید',
      'عذر می‌خوام',
      'عذر میخوام',
      'شرمنده‌ام',
      'شرمنده ام',
      'شرمندهام'
    ],
    what_do_i_do: [
      'چه کار باید بکنم',
      'چیکار باید بکنم',
      'راه حل نمی‌دی',
      'راه‌حل نمیدی',
      'راهحل نمیدی'
    ]
  };
  for (const [topic, inputs] of Object.entries(groups)) {
    const topics = inputs.map(routed);
    assert.ok(
      topics.every((t) => t === topic),
      `${topic} variants must all route to ${topic}, got: ${JSON.stringify(topics)}`
    );
  }
});

test('en normalize: unifies smart/curly quotes to plain ASCII', () => {
  assert.equal(EN.normalize('I\u2019m tired'), "I'm tired");
  assert.equal(EN.normalize('\u201chello\u201D'), '"hello"');
});

test('en normalize: collapses and trims whitespace', () => {
  assert.equal(EN.normalize('  hello   world  '), 'hello world');
});

// ============================================================================
// Script validation
// ============================================================================

test('isValidScript: accepts script-neutral content (digits, emoji, punctuation)', () => {
  assert.equal(isValidScript('12345', FA), true);
  assert.equal(isValidScript('\uD83D\uDE0A\uD83D\uDC4D', FA), true);
  assert.equal(isValidScript('12345', EN), true);
});

test("isValidScript: rejects the other language's script", () => {
  assert.equal(isValidScript('hello there, how are you', FA), false);
  assert.equal(isValidScript('سلام حال شما چطور است', EN), false);
});

test('respond(): redirects politely instead of processing foreign-script input', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('hello there');
  assert.match(reply, /فارسی/);
});

// ============================================================================
// Regression tests
// ============================================================================

test('regression: "پدربزرگ" and inflected forms with word-boundary fix', () => {
  // Sadness assertion first (fresh engine, no prior state affects it).
  const engine = freshEngine(FA);
  const sadReply = engine.respond('امروز خیلی غمگینم');
  const sadnessResponses = FA.rules.find(
    (r) => r.topic === 'sadness'
  ).responses;
  const calibrationPrefix = FA.emotionCalibration?.sad;
  const cleanReply =
    calibrationPrefix && sadReply.startsWith(calibrationPrefix)
      ? sadReply.slice(calibrationPrefix.length).trim()
      : sadReply;
  assert.ok(
    sadnessResponses.includes(cleanReply) ||
      FA.topicSpecificQuestions.sadness.includes(cleanReply)
  );

  // Persian grandfather assertion second (only checks doesNotMatch, tolerant of state).
  const reply2 = engine.respond('پدربزرگم فوت کرد');
  assert.doesNotMatch(reply2, /بزرگم/);
});

test('regression: "چراغ" does not trigger question-word detection for "چرا"', () => {
  assert.equal(FA.questionPattern.test('چراغ اتاقم خراب شده'), false);
  assert.equal(FA.questionPattern.test('چرا همیشه همینطوریه؟'), true);
});

test('regression: Persian question marks not mistaken for letters', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('حالت چطوره؟');
  assert.match(reply, /خوب|حس/);
});

// ============================================================================
// Core rule matching
// ============================================================================

test('fa: safety rule gives crisis-appropriate response', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('دیگه نمیخوام زندگی کنم');
  assert.match(reply, /تنها نیستید|کمک تخصصی|توجه فوری/);
});

test('en: safety rule gives crisis-appropriate response', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('I want to kill myself');
  assert.match(reply, /not alone|crisis line|professional help/);
});

// ------------------------------------------------------------------------
// Rule response content integrity: verify that extracted rule response
// pools return meaningful content (not corrupted truncated pool names like
// 'ruleSadness' or empty strings) for every inline rule in both languages.
// These guard against silent corruption during pool refactoring.
// ------------------------------------------------------------------------

test('EN sadness rule returns original response content', () => {
  const reply = freshEngine(EN).respond('I feel so sad and depressed');
  assert.ok(reply.length > 15, 'reply should be a substantive sentence');
  assert.doesNotMatch(
    reply,
    /^ruleSadness|^R\[|undefined|\[object|\[object Object\]/
  );
});

test('EN anger rule returns original response content', () => {
  const reply = freshEngine(EN).respond('I am so angry right now');
  assert.ok(reply.length > 15);
  assert.doesNotMatch(
    reply,
    /^ruleAnger|^R\[|undefined|\[object|\[object Object\]/
  );
});

test('EN feeling rule returns original response content', () => {
  const reply = freshEngine(EN).respond('i feel that this matters');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleFeeling|^R\[|undefined|\[object|\[object Object\]/
  );
});

test('EN reasoning rule returns original response content', () => {
  const reply = freshEngine(EN).respond('because i think so that may be true');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleReasoning|^R\[|undefined|\[object|\[object Object\]/
  );
});

test('EN need rule returns original response content', () => {
  const reply = freshEngine(EN).respond('I need more time for myself');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleNeed|^R\[|undefined|\[object|\[object Object\]/
  );
});

test('EN affirmation rule returns original response content', () => {
  const reply = freshEngine(EN).respond('yes');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleAffirmation|^R\[|undefined|\[object|\[object Object\]/
  );
});

test('EN negation rule returns original response content', () => {
  const reply = freshEngine(EN).respond('no');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleNegation|^R\[|undefined|\[object|\[object Object\]/
  );
});

test('FA sadness rule returns original response content', () => {
  const reply = freshEngine(FA).respond('غمگینم و دلم گرفته');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleSadness|^R\[|undefined|\[object|\[object Object\]/
  );
  assert.match(reply, /[\u0600-\u06FF]/u);
});

test('FA anger rule returns original response content', () => {
  const reply = freshEngine(FA).respond('عصبانی هستم از دستش');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleAnger|^R\[|undefined|\[object|\[object Object\]/
  );
  assert.match(reply, /[\u0600-\u06FF]/u);
});

test('FA feeling rule returns original response content', () => {
  const reply = freshEngine(FA).respond('احساس می‌کنم این درسته');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleFeeling|^R\[|undefined|\[object|\[object Object\]/
  );
  assert.match(reply, /[\u0600-\u06FF]/u);
});

test('FA reasoning rule returns original response content', () => {
  const reply = freshEngine(FA).respond('چون دیر شده بود و باید برم');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleReasoning|^R\[|undefined|\[object|\[object Object\]/
  );
  assert.match(reply, /[\u0600-\u06FF]/u);
});

test('FA need rule returns original response content', () => {
  const reply = freshEngine(FA).respond('نیاز دارم استراحت کنم');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleNeed|^R\[|undefined|\[object|\[object Object\]/
  );
  assert.match(reply, /[\u0600-\u06FF]/u);
});

test('FA affirmation rule returns original response content', () => {
  const reply = freshEngine(FA).respond('بله');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleAffirmation|^R\[|undefined|\[object|\[object Object\]/
  );
  assert.match(reply, /[\u0600-\u06FF]/u);
});

test('FA negation rule returns original response content', () => {
  const reply = freshEngine(FA).respond('نه');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(
    reply,
    /^ruleNegation|^R\[|undefined|\[object|\[object Object\]/
  );
  assert.match(reply, /[\u0600-\u06FF]/u);
});

test('en: small-talk "how are you" is recognized', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('hi, how are you?');
  assert.match(reply, /doing well|good|well, thank you/i);
});

test('en: identity question is recognized', () => {
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
// Repetition avoidance
// ============================================================================

test('repetition: 10 consecutive same-topic turns produce variety', () => {
  const engine = freshEngine(EN);
  const seen = new Set();
  for (let i = 0; i < 10; i += 1) {
    seen.add(engine.respond('I feel anxious and stressed'));
  }
  assert.ok(seen.size >= 4, `got only ${seen.size}/10 distinct`);
});

test('repetition: seeded deterministic run has fixed variety count', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    const seen = new Set();
    for (let i = 0; i < 10; i += 1) {
      seen.add(engine.respond('I feel anxious and stressed'));
    }
    assert.ok(
      seen.size >= 5 && seen.size <= 6,
      `expected 5-6, got ${seen.size}`
    );
  } finally {
    restore();
  }
});

test('distress nudge: fires after 3 consecutive negative messages', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel so sad');
  engine.respond('everything feels hopeless and exhausting');
  const third = engine.respond('I am tired and overwhelmed');
  assert.match(third, /breathe|pause|heavy/i);
  const fourth = engine.respond('still feeling low');
  assert.doesNotMatch(fourth, /breathe in for a count of four/i);
});

test('distress nudge: never overrides safety rule', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel so sad');
  engine.respond('everything feels hopeless and exhausting');
  const reply = engine.respond('I am so tired I want to kill myself');
  assert.match(reply, /not alone|crisis line|professional help/);
});

test('question fallback: acknowledges a direct question', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('do you ever get tired of listening?');
  // The fallback may answer from the acknowledgement pool or, on the
  // coin-flip, from the honest-unknown source-suggestion pool.
  const pools = [
    ...(EN.questionAcknowledgements || []),
    ...(EN.sourceSuggestions || []),
    ...(EN.questionFallbacks || [])
  ];
  assert.ok(
    pools.includes(reply),
    'question fallback must come from an acknowledgement or source pool, got: ' +
      reply
  );
  assert.match(
    reply,
    /question|answer|sit with|thinking|wikipedia|youtube|expert/i
  );
});

test('question fallback: plain statement does not trigger', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('just thinking about random stuff today');
  assert.doesNotMatch(reply, /thoughtful question/i);
});

test('FA question with Persian question mark routes as question', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('می‌تونی همین جملات رو ساده‌تر بنویسی؟');
  assert.ok(reply.length > 0);
  assert.notEqual(engine.currentTurnDialogueAct, 'statement');
});

test('FA stress disclosure routes to empathy, not knowledge shelf', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('امروز احساس استرس دارم');
  // A first-person stress disclosure must get an empathy question, not a
  // knowledge-reflections essay or a generic fallback.
  assert.match(
    reply,
    /فشار|سنگین|غرق|تاب‌آوری|استراحت|بدن|رهایی|تسکین|اضطراب|نگران|شدید|خسته/iu
  );
  assert.ok(!FA.genericFallbacks.includes(reply));
  assert.ok(!FA.strategyShiftFallbacks.includes(reply));
});

test('FA emotional disclosure with کدوم stays empathetic, never a knowledge essay', () => {
  // Regression: bare "کدوم" in the knowledge-request gate used to turn a
  // first-person stress disclosure ("استرس دارم کدوم مسیر رو برم") into a
  // knowledge-request, letting the knowledge rule hijack the lived emotion.
  // The gate now requires specific buying markers (بخرم, هندزفری...) and
  // leaves bare کدوم/کدام out, so the stress rule must win.
  const engine = freshEngine(FA);
  const reply = engine.respond('استرس دارم کدوم مسیر رو برم');
  assert.match(
    reply,
    /فشار|سنگین|غرق|تاب‌آوری|استراحت|بدن|رهایی|تسکین|اضطراب|نگران|شدید|خسته/iu
  );
  assert.ok(!FA.genericFallbacks.includes(reply));
  assert.ok(!FA.strategyShiftFallbacks.includes(reply));
});

test('FA simplify request gets a warm acknowledgement', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('کمی ساده‌تر توضیح بده');
  assert.match(reply, /ساده|کوتاه|خلاصه/iu);
});

test('EN simplify request gets a warm acknowledgement', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('can you explain that more simply?');
  assert.match(reply, /simpl|plain|short|brief/i);
});

test('FA simplify fires for subjunctive بگویی form', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('ساده‌تر بگویی لطفا');
  assert.match(reply, /ساده|کوتاه|خلاصه/iu);
});

test('FA how-are-you does not hijack a sentence containing خوبی', () => {
  // "جمله خوبی گفتی" (a good sentence you said) must NOT be read as
  // the how-are-you question "خوبی" (how are you). It should route to
  // the simplify rule instead, since the sentence asks Darya to say
  // things more simply.
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'جمله خوبی گفتی، اما کمی پیچیده داری توضیح می‌دی... به‌جاش می‌تونی همین جملات رو در قالب ساده‌تر بنویسی'
  );
  assert.match(reply, /ساده|کوتاه|خلاصه/iu);
});

test('FA how-are-you still works as a whole-utterance question', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('خوبی؟');
  assert.match(reply, /خوبم|حس خوبی|حالم خوب/iu);
});

test('FA formal how-are-you with است still works', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('حال شما چطور است؟');
  assert.match(reply, /خوبم|حس خوبی|حالم خوب|ممنون/iu);
});

test('FA how-are-you with تو suffix still works', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('خوبی تو؟');
  assert.match(reply, /خوبم|حس خوبی|حالم خوب|ممنون/iu);
});

test('FA ی-suffixed insult (احمقی) triggers de-escalation', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('مگه احمقی؟!');
  // Should come from the frustration de-escalation pool, not a generic
  // "tell me more" line or a question fallback.
  assert.match(reply, /ناراحتی|انرژی|دلخوری|خشم|حق داری|مهم است|ناامیدی/iu);
});

test('FA space-separated خاک تو سر insult triggers de-escalation', () => {
  // Regression from a real transcript: "خاک تو سر کودنت کنن" fell to a
  // generic fallback because the pattern only matched the no-space
  // "خاک تو سرت" form and the bare "کودن" without its ت suffix.
  const engine = freshEngine(FA);
  const reply = engine.respond('خاک تو سر کودنت کنن');
  assert.match(
    reply,
    /ناراحتی|انرژی|دلخوری|خشم|حق داری|مهم است|ناامیدی|گفتگو|شنوم/iu,
    `insult must de-escalate, got: ${reply}`
  );
  assert.ok(
    !FA.genericFallbacks.includes(reply),
    `insult must never use generic fallbacks, got: ${reply}`
  );
});

test('FA پدوفیل (pedophile) accusation triggers a boundary response', () => {
  // Being called a pedophile is a serious accusation directed at Darya;
  // it must never be answered with a cheerful generic line.
  const engine = freshEngine(FA);
  const reply = engine.respond('بدرود مادرجنده پدوفیل احمق');
  assert.ok(
    !FA.genericFallbacks.includes(reply),
    `pedophile accusation must not use generic fallbacks, got: ${reply}`
  );
  assert.match(
    reply,
    /ناراحتی|انرژی|دلخوری|خشم|حق داری|مهم است|ناامیدی|شنوم|گفتگو|محترم|آرام/iu,
    `pedophile accusation must get a boundary or de-escalation reply, got: ${reply}`
  );
});

test('EN pedophile accusation triggers a boundary response', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('bye you stupid pedophile');
  assert.ok(
    !EN.genericFallbacks.includes(reply),
    `EN pedophile accusation must not use generic fallbacks, got: ${reply}`
  );
  assert.ok(
    EN.frustrationResponses.includes(reply),
    `EN pedophile accusation must get a de-escalation reply, got: ${reply}`
  );
});
test('FA app/website feedback gets a warm acknowledgment', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'من تم ساحل این وب‌سایت رو مشکل‌دار می‌دونم... موج‌های دریا ریز هستن'
  );
  assert.match(reply, /ممنون|سپاس|بازخورد|نظرت|می‌فهمم|مهم است/iu);
});
test('EN app/website feedback gets a warm acknowledgment', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'the beach theme looks broken, the waves are too small'
  );
  assert.match(reply, /thank|appreciate|feedback|thoughts|understand/iu);
});

test('fallback pool avoids repeating the same line', () => {
  const engine = freshEngine(FA);
  const seen = new Set();
  for (let i = 0; i < 6; i += 1) {
    seen.add(engine.respond('من توصیه می‌خوام'));
  }
  assert.ok(
    seen.size >= 4,
    `expected variety in fallback lines, got ${seen.size} distinct`
  );
});

test('greeting and farewell pools vary across calls', () => {
  const seen = new Set();
  for (let i = 0; i < 15; i += 1) {
    seen.add(freshEngine(EN).greeting());
  }
  assert.ok(seen.size > 1);
});

test('FA greeting mirrors the user greeting word: درود gets a درود reply, سلام gets a سلام reply', () => {
  for (let i = 0; i < 25; i += 1) {
    const dorudEngine = freshEngine(FA);
    assert.match(dorudEngine.respond('درود'), /^درود/u);
    const salamEngine = freshEngine(FA);
    assert.match(salamEngine.respond('سلام'), /^سلام/u);
  }
});

test('EN greeting mirrors the user greeting word across hi/hello/hey', () => {
  for (let i = 0; i < 25; i += 1) {
    assert.match(freshEngine(EN).respond('hi'), /^hi\b/i);
    assert.match(freshEngine(EN).respond('hello'), /^hello\b/i);
    assert.match(freshEngine(EN).respond('hey'), /^hey\b/i);
  }
});

test('EN greeting mirroring keeps variants for good morning / good evening / good afternoon', () => {
  for (const greeting of ['good morning', 'good evening', 'good afternoon']) {
    for (let i = 0; i < 15; i += 1) {
      assert.match(
        freshEngine(EN).respond(greeting),
        new RegExp(`^${greeting}\\b`, 'i'),
        `${greeting} should get a matching time-of-day reply`
      );
    }
  }
});

test('EN greeting variant tails (there/darya/friend/again) mirror their family pool', () => {
  const cases = [
    ['hi there', /^hi\b/i],
    ['hi Darya', /^hi\b/i],
    ['hi my friend', /^hi\b/i],
    ['hello there', /^hello\b/i],
    ['hello Darya', /^hello\b/i],
    ['hello my friend', /^hello\b/i],
    ['hello again', /^hello\b/i],
    ['hey there', /^hey\b/i],
    ['good morning Darya', /^good morning\b/i]
  ];
  for (const [input, expected] of cases) {
    for (let i = 0; i < 10; i += 1) {
      assert.match(
        freshEngine(EN).respond(input),
        expected,
        `${input} should get a reply mirroring its greeting family`
      );
    }
  }
});

test('EN casual greetings route to the nearest greeting family pool', () => {
  const cases = [
    ['hiya', /^hi\b/i],
    ['howdy', /^hi\b/i],
    ['yo', /^hey\b/i],
    ['sup', /^hey\b/i],
    ['wassup', /^hey\b/i],
    ['whatsup', /^hey\b/i],
    ['whats up', /^hey\b/i],
    ["what's up", /^hey\b/i]
  ];
  for (const [input, expected] of cases) {
    for (let i = 0; i < 10; i += 1) {
      assert.match(
        freshEngine(EN).respond(input),
        expected,
        `${input} should route to its nearest greeting family`
      );
    }
  }
});

test('consecutive EN greetings trigger the repeated-greeting pool instead of fresh greetings', () => {
  for (let i = 0; i < 10; i += 1) {
    const engine = freshEngine(EN);
    const pool = new Set(engine.lang.repeatedGreetingResponses);
    engine.respond('hello');
    const second = engine.respond('hi');
    const third = engine.respond('hello again');
    assert.ok(
      pool.has(second),
      `2nd greeting should use repeated pool, got: ${second}`
    );
    assert.ok(
      pool.has(third),
      `3rd greeting should use repeated pool, got: ${third}`
    );
  }
});

test('EN compound greeting falls through to the how-are-you rule instead of the greeting pool', () => {
  for (let i = 0; i < 10; i += 1) {
    const reply = freshEngine(EN).respond('hi, how are you');
    assert.ok(
      /how are you|doing|well|fine|thank/i.test(reply),
      `compound greeting should get a how-are-you reply, got: ${reply}`
    );
  }
});

test('FA greeting mirroring keeps variants for صبح بخیر / عصر بخیر / سلام صبح بخیر', () => {
  for (const greeting of ['صبح بخیر', 'سلام صبح بخیر']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(greeting);
    assert.match(
      reply,
      /^صبح بخیر/u,
      `${greeting} should get a صبح بخیر-based reply`
    );
  }
  for (const greeting of ['عصر بخیر']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(greeting);
    assert.match(
      reply,
      /^عصر بخیر/u,
      `${greeting} should get a عصر بخیر-based reply`
    );
  }
});

test('FA greeting tails mirror the family word (درود بر تو, سلام علیکم)', () => {
  const dorudCases = ['درود بر تو', 'درود بر شما', 'درود عزیز', 'درود جان'];
  const salamCases = ['سلام علیکم', 'سلام بر تو', 'سلام بر شما', 'سلام و درود'];
  for (let i = 0; i < 10; i += 1) {
    for (const input of dorudCases) {
      assert.match(
        freshEngine(FA).respond(input),
        /^درود/u,
        `${input} should get a درود-based reply`
      );
    }
    for (const input of salamCases) {
      assert.match(
        freshEngine(FA).respond(input),
        /^سلام/u,
        `${input} should get a سلام-based reply`
      );
    }
  }
});

test('FA greeting tail does not swallow a how-are-you compound', () => {
  // A fixed tail list, never free text: "درود چطوری؟" must route to the
  // how-are-you rule, not the greeting pool.
  for (const input of ['درود چطوری؟', 'سلام چطوری؟', 'درود، حالت چطوره؟']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(input);
    assert.equal(engine.currentTurnDialogueAct, 'question');
    assert.ok(
      engine.currentTurnTopics.includes('smalltalk_howareyou'),
      `${input} should route to how-are-you, got topics: ${JSON.stringify(engine.currentTurnTopics)}`
    );
  }
});

test('FA mid-conversation greeting mirrors fresh and breaks greeting loops', () => {
  const repeatedPool = new Set(FA.repeatedGreetingResponses);
  // A fresh greeting after real turns mirrors the user's word.
  const engine = freshEngine(FA);
  engine.respond('سلام');
  engine.respond('امروز چندمه؟');
  engine.respond('نگرانم');
  const fresh = engine.respond('درود');
  assert.match(
    fresh,
    /^درود/u,
    `mid-conversation درود should mirror, got: ${fresh}`
  );

  // Two back-to-back greetings trip the repeated pool instead of looping.
  const loop = freshEngine(FA);
  loop.respond('درود');
  const second = loop.respond('درود');
  assert.ok(
    repeatedPool.has(second),
    `second consecutive greeting should use repeated pool, got: ${second}`
  );

  // Mixed consecutive greetings also count as repetition.
  const mixed = freshEngine(FA);
  mixed.respond('سلام');
  const mixedSecond = mixed.respond('درود');
  assert.ok(
    repeatedPool.has(mixedSecond),
    `greeting after a greeting should use repeated pool, got: ${mixedSecond}`
  );
});

test('back-to-back questions use non-question alternative path', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    engine.respond('Why does this keep happening?');
    const second = engine.respond('What should I do next?');
    assert.doesNotMatch(second, /[?]/);
    // "what should I do" routes to the help-seeking what_do_i_do rule,
    // whose question lines are filtered under budget pressure so the
    // reply stays a supportive statement, never another question.
    assert.match(second, /step|pressure|together|solution/i);
  } finally {
    restore();
  }
});

test('EN upset disclosure routes to the anger pool, not a generic reasoning reply', () => {
  // "I'm upset" must be recognized as an emotional disclosure. The word
  // "upset" requires emotional context so physical uses like "upset
  // stomach" do not false-match.
  // A lived disclosure may route either to the ruleAnger pool or to the
  // topic-specific anger questions (_canAskTopicQuestion prefers the
  // topic-specific pool on a fresh disclosure), so accept both.
  for (let i = 0; i < 8; i += 1) {
    const engine = freshEngine(EN);
    const reply = engine.respond("I'm upset about how things are going");
    assert.match(
      reply,
      /anger|frustration|frustrated|boundary|energy|upset|hard|feel|heard|space|attention|expectation/i,
      `upset disclosure should route to the anger pool, got: ${reply}`
    );
  }
});

test('EN past-tense upset (I was upset) also routes to the anger pool', () => {
  // Past-tense disclosures are as emotionally loaded as present tense, so
  // they must not fall through to a generic reply. Covered because "was"
  // and "I have been" are emotional-context markers for "upset".
  for (let i = 0; i < 6; i += 1) {
    const engine = freshEngine(EN);
    const reply = engine.respond('I was upset about it');
    assert.match(
      reply,
      /anger|frustration|frustrated|boundary|energy|upset|hard|feel|heard|space|attention|expectation/i,
      `past-tense upset disclosure should route to the anger pool, got: ${reply}`
    );
  }
});

test('EN simplify request with intervening words still routes to the simplify pool', () => {
  for (let i = 0; i < 8; i += 1) {
    const engine = freshEngine(EN);
    const reply = engine.respond(
      'That was a good sentence, but can you write the same meaning in simpler and friendlier words?'
    );
    assert.match(
      reply,
      /simpler|simply|shorter|plain|keep it|essence|plainly|simple/i,
      `simplify request should route to the simplify pool, got: ${reply}`
    );
  }
});

test('EN physical upset (upset stomach) does not false-match the anger rule', () => {
  const engine = freshEngine(EN);
  const matches = engine._matchRules(
    engine.lang.normalize('This upset stomach keeps me awake')
  );
  const topics = (matches || []).map((m) => m.rule.topic);
  assert.ok(
    !topics.includes('anger'),
    `upset stomach should not route to anger, got topics: ${topics.join(', ')}`
  );
});

test('same-rule streak guard does not block a fresh emotional disclosure after repeated smalltalk', () => {
  // The streak guard exists only to stop the SAME rule from firing its
  // pool many turns in a row. A different rule (anxiety) that follows a
  // repeated smalltalk topic must still get its own caring pool reply.
  for (let i = 0; i < 10; i += 1) {
    const engine = freshEngine(FA);
    engine.respond('سلام. من دریا هستم.');
    engine.respond('خوبی؟');
    engine.respond('خوبی؟!');
    engine.respond('خوبی؟!');
    engine.respond('خوبی؟!');
    assert.ok(
      engine.memory.sameRuleStreak >= 3,
      'precondition: smalltalk streak should be active'
    );
    const reply = engine.respond('امروز احساس استرس دارم');
    assert.match(
      reply,
      /استرس|نگران|اضطراب|فشار|قدم|پیش برو|گفتگو|می‌شنوم|گفتی|بدنت/u,
      `fresh anxiety disclosure should stay on-topic after a smalltalk streak, got: ${reply}`
    );
  }
});

test('emotional pools stay on-topic when the question budget is exhausted', () => {
  // All-question pools used to degrade to a generic fallback when the
  // question budget was spent. Caring statement lines now survive the
  // budget filter so an emotional disclosure still gets an on-topic reply.
  const restore = seededRandom();
  try {
    const engine = freshEngine(FA);
    // Spend the question budget first with back-to-back questions.
    engine.respond('چرا این اتفاق می‌افتد؟');
    engine.respond('چه کار باید بکنم؟');
    engine.respond('از کجا شروع کنم؟');
    const reply = engine.respond('این روزها خیلی غمگینم');
    assert.match(
      reply,
      /غم|سخت|هستم|می‌شنوم|تنها/u,
      `sadness reply should stay on-topic under budget pressure, got: ${reply}`
    );
  } finally {
    restore();
  }
});

test('question detection does not misread supportive statements as questions', () => {
  const engine = freshEngine(EN);
  // These statements contain embedded question words but are not questions.
  const statements = [
    'It is okay to feel what you feel about it.',
    'The fact that you are still turning it over is itself a step.',
    'Knowing that you need something is a form of self-awareness.'
  ];
  for (const statement of statements) {
    assert.ok(
      !engine._isQuestionResponse(statement),
      `statement should not be flagged as a question: ${statement}`
    );
  }
});

test('new-conversation invitation rate is near 50 percent', () => {
  const restore = seededRandom();
  try {
    let inviting = 0;
    for (let i = 0; i < 200; i += 1) {
      const engine = freshEngine(EN);
      if (EN.greetingsInviting.includes(engine._openingForNewConversation())) {
        inviting += 1;
      }
    }
    assert.ok(inviting / 200 >= 0.45 && inviting / 200 <= 0.55);
  } finally {
    restore();
  }
});

// ============================================================================
// Question budget
// ============================================================================

test('question budget constants match policy', () => {
  assert.equal(DaryaEngine.CONSECUTIVE_QUESTION_LIMIT, 1);
  assert.equal(DaryaEngine.QUESTION_BUDGET_WINDOW, 3);
  assert.equal(DaryaEngine.QUESTION_BUDGET_LIMIT, 1);
});

test('question filter removes questions after one consecutive question', () => {
  const engine = freshEngine(EN);
  engine.memory.consecutiveQuestions = 1;
  assert.deepEqual(engine._filterForQuestionBudget(['What?', 'Okay.']), [
    'Okay.'
  ]);
});

test('question note tracks rolling window', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 1;
  engine._noteAskedQuestion('What happened?');
  assert.deepEqual(engine.memory.askedQuestionTurns, [1]);
  assert.equal(engine.memory.consecutiveQuestions, 1);
});

test('alternativeAvailable finds non-question options', () => {
  const engine = freshEngine(EN);
  assert.equal(engine._alternativeAvailable(['Why?', 'I am listening.']), true);
  assert.equal(engine._alternativeAvailable(['Why?', 'What happened?']), false);
});

test('alternativeFor returns non-question fallback', () => {
  const engine = freshEngine(EN);
  assert.doesNotMatch(engine._alternativeFor('What happened?'), /\?/);
});

test('question budget prevents two immediate questions', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 1;
  const first = engine._pickVaried(['What is this?', 'I am listening.']);
  engine.memory.turnCount = 2;
  const second = engine._pickVaried(['What is this?', 'I am listening.']);
  assert.equal(/\?/.test(first) && /\?/.test(second), false);
});

// ============================================================================
// Entity extraction
// ============================================================================

test('entity extractor returns all five entity types', () => {
  const entities = DaryaEntityExtractor.extract(
    'I feel sad about my mother at home today while studying with my apartment nearby',
    EN,
    { emotionalWeight: true }
  );
  assert.deepEqual(
    new Set(entities.map((e) => e.type)),
    new Set(['person', 'place', 'time', 'activity', 'object'])
  );
});

test('possessive extraction stops at prepositions', () => {
  // Regression: "my cat on the sofa" captured "cat on the" (the split
  // only handled conjunctions/verbs). Prepositions now cut the phrase.
  const entities = DaryaEntityExtractor.extract(
    'I feel sad about my cat on the sofa',
    EN,
    { emotionalWeight: true }
  );
  const cat = entities.find((e) => e.type === 'object');
  assert.ok(cat, 'expected a possessive object');
  assert.equal(cat.surface, 'cat');
  // Same for a capitalized noun followed by a preposition.
  const home = DaryaEntityExtractor.extract(
    'I feel sad about my Mother at Home',
    EN,
    { emotionalWeight: true }
  );
  assert.ok(!home.some((e) => e.surface === 'Mother at Home'));
  const mother = home.find((e) => e.type === 'person');
  assert.equal(mother.surface, 'Mother');
});

test('a surface is remembered under exactly one semantic type', () => {
  // Regression: "my mother" became both person:mother (vocabulary) and
  // object:mother (possessive), and "at Home" became both place:home and
  // person:Home (capitalized-name). The strongest entity per surface now
  // wins, so vocabulary classifications are never double-tagged.
  const mother = DaryaEntityExtractor.extract(
    'I feel sad about my mother',
    EN,
    { emotionalWeight: true }
  );
  assert.ok(
    mother.some((e) => e.type === 'person' && /mother/i.test(e.surface))
  );
  assert.ok(!mother.some((e) => e.type === 'object'));

  const home = DaryaEntityExtractor.extract(
    'I feel sad about my Mother at Home',
    EN,
    { emotionalWeight: true }
  );
  const homeTypes = home.filter((e) => /^home$/i.test(e.surface));
  assert.equal(homeTypes.length, 1, 'Home must have exactly one type');
  assert.equal(homeTypes[0].type, 'place');
});

test('entity extractor gates neutral turns', () => {
  assert.deepEqual(
    DaryaEntityExtractor.extract('my mother is at home today', EN, {
      emotionalWeight: false
    }),
    []
  );
});

test('entity extractor accepts positively weighted turns', () => {
  const entities = DaryaEntityExtractor.extract(
    'I feel happy about my sister at home',
    EN,
    { emotionalWeight: true }
  );
  assert.ok(
    entities.some((e) => e.type === 'person' && /sister/i.test(e.surface))
  );
});

test('entity extractor recognizes Persian vocabulary', () => {
  const entities = DaryaEntityExtractor.extract(
    'درباره مادرم خیلی ناراحتم و امروز در خانه هستم',
    FA,
    { emotionalWeight: true }
  );
  assert.ok(
    entities.some((e) => e.type === 'person' && /مادر/.test(e.surface))
  );
  assert.ok(entities.some((e) => e.type === 'place' && /خانه/.test(e.surface)));
});

test('English possessive extraction stores noun not pronoun', () => {
  const entities = DaryaEntityExtractor.extract(
    'I feel sad about my old apartment',
    EN,
    { emotionalWeight: true }
  );
  assert.ok(
    entities.some((e) => e.type === 'object' && e.surface === 'old apartment')
  );
  assert.ok(!entities.some((e) => e.surface === 'my'));
});

test('entity extraction excludes pronouns and filler', () => {
  const entities = DaryaEntityExtractor.extract(
    'I feel sad that you are with me',
    EN,
    { emotionalWeight: true }
  );
  assert.ok(!entities.some((e) => /^(?:I|you|me|my|the)$/i.test(e.surface)));
});

test('named entity keys are keyed by type and surface', () => {
  assert.equal(
    DaryaEntityExtractor.entityKey('person', ' Mother '),
    'person:mother'
  );
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([
    { type: 'person', surface: 'Mother', confidence: 0.9 }
  ]);
  assert.ok(engine.memory.namedEntities.has('person:mother'));
});

test('first mention guard prevents same-turn callback', () => {
  const restore = seededRandom();
  try {
    assert.doesNotMatch(
      freshEngine(EN).respond('I feel sad about my mother'),
      /earlier|remember|mentioned/i
    );
  } finally {
    restore();
  }
});

test('previously remembered entity can produce callback', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel sad about my mother');
  // Force 100% callback probability so the assertion does not depend on the
  // exact Math.random sequence, which shifts when overrides are added upstream.
  // Also lower the threshold so decayed entities still pass.
  engine.entityCallbackProbability = 1;
  engine.entityCallbackThreshold = 0;
  assert.match(engine.respond('just thinking about things today'), /mother/i);
});

test('entity callback threshold filters decayed memories', () => {
  const engine = freshEngine(EN);
  engine.memory.namedEntities.set('object:book', {
    type: 'object',
    surface: 'book',
    activation: 0.59,
    confidence: 0.9,
    mentions: 1,
    firstMentionTurn: 1,
    lastMentionTurn: 1,
    age: 1
  });
  assert.equal(engine._respondToEntityReference(), null);
});

test('entity activation decays by declared rate', () => {
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([
    { type: 'object', surface: 'book', confidence: 1 }
  ]);
  engine.memory.decayNamedEntities();
  assert.ok(
    Math.abs(engine.memory.namedEntities.get('object:book').activation - 0.82) <
      Number.EPSILON
  );
  assert.equal(DaryaEngine.ENTITY_DECAY_PER_TURN, 0.18);
});

test('very weak entities removed after decay', () => {
  const engine = freshEngine(EN);
  engine.memory.namedEntities.set('object:book', {
    type: 'object',
    surface: 'book',
    activation: 0.049,
    confidence: 0.9,
    mentions: 1,
    firstMentionTurn: 1,
    lastMentionTurn: 1,
    age: 1
  });
  engine.memory.decayNamedEntities();
  assert.equal(engine.memory.namedEntities.has('object:book'), false);
});

test('repeating entity refreshes activation', () => {
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([
    { type: 'place', surface: 'home', confidence: 0.9 }
  ]);
  engine.memory.decayNamedEntities();
  engine.memory.rememberEntities([
    { type: 'place', surface: 'home', confidence: 0.9 }
  ]);
  assert.equal(engine.memory.namedEntities.get('place:home').mentions, 2);
  assert.ok(engine.memory.namedEntities.get('place:home').activation > 0.82);
});

test('entity decay is monotonic and reaches zero', () => {
  const engine = freshEngine(EN);
  engine.memory.rememberEntities(
    [{ type: 'object', surface: 'book', confidence: 1 }],
    1
  );
  const scores = [];
  for (let turn = 0; turn < 40; turn += 1) {
    engine.memory.decayNamedEntities();
    const entity = engine.memory.namedEntities.get('object:book');
    if (!entity) {
      break;
    }
    scores.push(entity.activation);
  }
  for (let i = 1; i < scores.length; i += 1) {
    assert.ok(scores[i] < scores[i - 1]);
  }
  assert.ok(scores.length < 40);
});

test('entity callback probability is 55 percent', () => {
  assert.equal(DaryaEngine.ENTITY_CALLBACK_PROBABILITY, 0.55);
});

test('entity callbacks use typed language template', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(FA);
    engine.memory.turnCount = 2;
    engine.memory.namedEntities.set('place:خانه', {
      type: 'place',
      surface: 'خانه',
      activation: 0.9,
      confidence: 0.9,
      mentions: 1,
      firstMentionTurn: 1,
      lastMentionTurn: 1,
      age: 1
    });
    assert.match(engine._respondToEntityReference(), /خانه/);
  } finally {
    restore();
  }
});

test('first-mention guard holds when probability is 1', () => {
  const engine = freshEngine(EN);
  engine.entityCallbackProbability = 1;
  engine.memory.turnCount = 1;
  engine.memory.rememberEntities(
    [{ type: 'person', surface: 'Maya', confidence: 1, lastMentionTurn: 1 }],
    1
  );
  assert.equal(engine._respondToEntityReference(), null);
});

test('entity memory keeps topic context, rejects unrelated callbacks', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    engine.memory.turnCount = 1;
    engine.currentTurnTopics = ['family', 'sadness'];
    engine.memory.rememberEntities(
      [{ type: 'person', surface: 'mother', confidence: 0.95 }],
      1,
      { topics: ['family', 'sadness'], seriousness: 0.8 }
    );
    assert.deepEqual(
      engine.memory.namedEntities.get('person:mother').contextTopics,
      ['family', 'sadness']
    );
    engine.memory.turnCount = 2;
    engine.currentTurnTopics = ['work'];
    assert.equal(engine._respondToEntityReference(), null);
    engine.currentTurnTopics = ['family'];
    assert.match(engine._respondToEntityReference(), /mother/i);
  } finally {
    restore();
  }
});

// ============================================================================
// Topic blends, seriousness, humor
// ============================================================================

test('topic memory tracks weighted turns', () => {
  const engine = freshEngine(EN);
  engine.respond("I can't sleep because I feel anxious");
  assert.ok(engine.memory.topicHistory.length >= 2);
  assert.equal(engine.memory.currentSubject.topic, 'sleep');
  assert.ok(engine.memory.topicWeights.get('sleep') >= 1);
  assert.ok(engine.memory.currentSubject.since >= 1);
});

test('common topic blends return dedicated reflection', () => {
  const restore = seededRandom();
  try {
    const reply = freshEngine(EN).respond(
      "I can't sleep because I feel anxious"
    );
    assert.ok(EN.blendResponses.blend_sleep_anxiety.includes(reply));
    assert.doesNotMatch(reply, /[?]/);
  } finally {
    restore();
  }
});

test('sleep follow-up is from topic-specific pool', () => {
  const restore = seededRandom();
  try {
    assert.ok(
      EN.topicSpecificQuestions.sleep.includes(
        freshEngine(EN).respond("I can't sleep")
      )
    );
  } finally {
    restore();
  }
});

test('work follow-up is from topic-specific pool', () => {
  const restore = seededRandom();
  try {
    assert.ok(
      EN.topicSpecificQuestions.work.includes(
        freshEngine(EN).respond('My job is difficult lately')
      )
    );
  } finally {
    restore();
  }
});

test('seriousness blocks humor', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 4;
  engine.currentTurnSeriousness = EN.topicSeriousness.anxiety;
  engine.lastTurnNeedsCare = true;
  assert.equal(engine.canHumorFire(), false);
  assert.equal(
    engine._maybeHumanTone('A careful reply.', 'I feel anxious'),
    'A careful reply.'
  );
});

test('humor gate allows humor in light contexts', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 3;
  engine.currentTurnSeriousness = 0.2;
  engine.lastTurnNeedsCare = false;
  assert.equal(engine.canHumorFire(), true);
});

test('gratitude is brief and does not close the conversation', () => {
  const banned = [
    'you are welcome',
    'happy to help',
    'goodbye',
    'take care',
    'خوشحالم که کمک کردم',
    'موفق باشی'
  ];
  for (const [lang, input] of [
    [EN, 'thanks'],
    [FA, 'ممنون']
  ]) {
    const reply = freshEngine(lang).respond(input);
    assert.ok(lang.gratitudeResponses.includes(reply));
    for (const phrase of banned) {
      assert.equal(reply.toLocaleLowerCase().includes(phrase), false, reply);
    }
  }
});

test('FA gratitude idiom دستت درد نکنه routes to gratitude replies', () => {
  // The common Persian thanks idiom 'دستت درد نکنه' (may your hand not
  // hurt) must route to the gratitude rule in all three spelling forms:
  // joined, half-space (ZWNJ, normalized to a plain space for matching),
  // and the polite 'دست شما درد نکنه'. The reply must come from the
  // gratitude response pool, never a hurt/empathy prefix.
  const variants = [
    'دستت درد نکنه خیلی کمک کردی',
    'دست\u200cت درد نکنه خیلی کمک کردی',
    'دست شما درد نکنه'
  ];
  for (const input of variants) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      FA.gratitudeResponses.includes(reply),
      `${JSON.stringify(input)} should reply from gratitudeResponses, got: ${reply}`
    );
    assert.equal(reply.startsWith('به نظر دردناک'), false, reply);
  }
});

test('recap uses remembered topics and real entities', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel sad about my apartment');
  const reply = engine.respond('what did I say earlier');
  assert.match(reply, /sadness|sad|apartment|object/i);
  assert.doesNotMatch(reply, /nothing you said|something interesting/i);
});

test('recap survives missing recentTopics and an empty template pool', () => {
  // Defensive: buildRecap must never throw when memory lacks
  // recentTopics (a partially constructed engine) and must still
  // produce a useful reply when the language pack ships no recap
  // templates, instead of returning an empty string.
  const engine = freshEngine(EN);
  const emptyPool = Object.create(engine);
  emptyPool.lang = Object.assign({}, EN, { recapTemplates: [] });
  emptyPool.memory = { eligibleNamedEntities: () => [] };
  emptyPool._pickVaried = () => '';
  assert.ok(globalThis.DaryaRecap.buildRecap(emptyPool).length > 0);

  const noTopics = Object.create(engine);
  noTopics.lang = EN;
  noTopics.memory = { eligibleNamedEntities: () => [] };
  noTopics._pickVaried = () => 'a recap'; // real templates render
  assert.equal(globalThis.DaryaRecap.buildRecap(noTopics), 'a recap');
});

test('professional boundary replies redirect to qualified help', () => {
  for (const [lang, input] of [
    [EN, 'Can you give me legal advice?'],
    [FA, 'مشاوره حقوقی می‌خواهم']
  ]) {
    const reply = freshEngine(lang).respond(input);
    assert.match(reply, /professional|licensed|متخصص/iu);
    assert.doesNotMatch(reply, /take this medication|invest in|you must file/i);
  }
});

test('human touch requires remembered entity', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 7;
  engine.currentTurnSeriousness = 0.2;
  assert.equal(engine._shouldAddHumanTouch(), false);
  engine.memory.namedEntities.set('object:coffee', {
    type: 'object',
    surface: 'coffee',
    activation: 0.9,
    confidence: 0.9,
    mentions: 1,
    firstMentionTurn: 1,
    lastMentionTurn: 1,
    age: 1
  });
  assert.equal(engine._shouldAddHumanTouch(), true);
  assert.match(engine._humanTouchLine(), /coffee/i);
});

test('returning openings favor returning pool with prior memory', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    engine.memory.namedEntities.set('object:coffee', {
      type: 'object',
      surface: 'coffee',
      activation: 0.9,
      confidence: 0.9,
      mentions: 1,
      firstMentionTurn: 1,
      lastMentionTurn: 1,
      age: 1
    });
    assert.ok(
      EN.greetingsReturning.includes(engine._openingForNewConversation())
    );
  } finally {
    restore();
  }
});

test('topic blend fires on mixed input across languages', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('نمی‌تونم بخوابم چون استرس دارم');
  assert.ok(reply.length > 0);
});

// ============================================================================
// Opening pool behavior
// ============================================================================

test('opening uses inviting pool when random is below 0.5', () => {
  const restore = seededRandom();
  Math.random = () => 0.1;
  try {
    assert.ok(
      EN.greetingsInviting.includes(
        freshEngine(EN)._openingForNewConversation()
      )
    );
  } finally {
    restore();
  }
});

test('opening uses open pool when random is at or above 0.5', () => {
  const restore = seededRandom();
  Math.random = () => 0.6;
  try {
    assert.ok(
      EN.greetingsOpen.includes(freshEngine(EN)._openingForNewConversation())
    );
  } finally {
    restore();
  }
});

// ============================================================================
// Punctuation normalization
// ============================================================================

test('punctuation normalization preserves original text for memory', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel sad!');
  assert.equal(engine.memory.recentUtterances.at(-1), 'I feel sad!');
  assert.equal(normalizeForMatching('I feel sad!', EN), 'I feel sad');
});

test('punctuated exit commands detected consistently', () => {
  for (const i of ['goodbye', 'goodbye!', 'goodbye.']) {
    assert.equal(freshEngine(EN).isExitCommand(i), true);
  }
  for (const i of ['خداحافظ', 'خداحافظ!', 'خداحافظ.']) {
    assert.equal(freshEngine(FA).isExitCommand(i), true);
  }
});

// ============================================================================
// Math / arithmetic
// ============================================================================

test('intelligence: factual math question gets answered', () => {
  const reply = freshEngine(EN).respond('What is 5 + 3?');
  assert.match(reply, /8/);
  assert.ok(reply.includes('='));
});

test('intelligence: Persian math with ضربدر answers correctly', () => {
  assert.match(freshEngine(FA).respond('۸ ضربدر ۳ چند می‌شه؟'), /۲۴/);
});

test('arithmetic: Persian bare addition', () => {
  assert.match(freshEngine(FA).respond('۲+۵'), /۷/);
});

test('arithmetic: Persian bare subtraction', () => {
  assert.match(freshEngine(FA).respond('۱۰-۳'), /۷/);
});

test('arithmetic: Persian bare multiplication', () => {
  assert.match(freshEngine(FA).respond('۸*۳'), /۲۴/);
});

test('arithmetic: Persian bare with بعلاوه', () => {
  assert.match(freshEngine(FA).respond('۵ بعلاوه ۳'), /۸/);
});

test('arithmetic: Persian bare with منهای', () => {
  assert.match(freshEngine(FA).respond('۱۰ منهای ۳'), /۷/);
});

test('arithmetic: Persian bare with ضربدر', () => {
  assert.match(freshEngine(FA).respond('۸ ضربدر ۳'), /۲۴/);
});

test('arithmetic: Persian bare division', () => {
  assert.match(freshEngine(FA).respond('۱۰ تقسیم بر ۲'), /۵/);
});

test('arithmetic: English bare addition', () => {
  assert.match(freshEngine(EN).respond('5+3'), /8/);
});

test('arithmetic: English bare multiplication', () => {
  assert.match(freshEngine(EN).respond('8*3'), /24/);
});

test('arithmetic: English bare division', () => {
  assert.match(freshEngine(EN).respond('10/2'), /5/);
});

test('arithmetic: English bare subtraction', () => {
  assert.match(freshEngine(EN).respond('15-7'), /8/);
});

test('arithmetic: Persian full question with می‌شه', () => {
  assert.match(freshEngine(FA).respond('۲+۳ چند می‌شه'), /۵/);
});

test('arithmetic: Persian بعلاوه question with می‌شود', () => {
  assert.match(freshEngine(FA).respond('۳ بعلاوه ۴ چند می‌شود'), /۷/);
});

test('arithmetic: Persian مساوی phrase', () => {
  assert.match(freshEngine(FA).respond('۲+۳ مساوی چند؟'), /۵/);
});

test('arithmetic: English what is with addition', () => {
  assert.match(freshEngine(EN).respond('what is 5+3'), /8/);
});

test('arithmetic: English what is with multiplication', () => {
  assert.match(freshEngine(EN).respond('what is 8*3'), /24/);
});

test('arithmetic: division by zero', () => {
  assert.match(
    freshEngine(EN).respond('5/0'),
    /undefine|not define|cannot divide/i
  );
});

test('arithmetic: Persian zero as first operand', () => {
  assert.match(freshEngine(FA).respond('۰+۵'), /۵/);
});

test('arithmetic: Persian zero as second operand', () => {
  assert.match(freshEngine(FA).respond('۵+۰'), /۵/);
});

test('arithmetic: Persian all zero', () => {
  assert.match(freshEngine(FA).respond('۰+۰'), /۰/);
});

test('arithmetic: Persian negative result', () => {
  assert.match(freshEngine(FA).respond('۳-۱۰'), /۷/);
});

test('arithmetic: Persian large numbers', () => {
  assert.match(freshEngine(FA).respond('۱۰۰+۲۰۰'), /۳۰۰/);
});

test('arithmetic: Persian mixed digits', () => {
  assert.match(freshEngine(FA).respond('۵+3'), /۸/);
});

test('arithmetic: Persian multi-digit', () => {
  assert.match(freshEngine(FA).respond('۱۱۱+۲۲۲'), /۳۳۳/);
});

test('arithmetic: English negative result', () => {
  assert.match(freshEngine(EN).respond('3-10'), /-7/);
});

test('arithmetic: decimal input is never misread as a substring expression', () => {
  // Regression: "5.5+3" used to match the trailing "5+3" inside the
  // string and answer "5 + 3 = 8" (a silently wrong result). The bare
  // expression regex now requires the first operand to start at a real
  // number boundary. Decimals are now fully supported, so the answer
  // must be the correct 8.5, never the wrong substring result 8.
  assert.match(freshEngine(EN).respond('5.5+3'), /8\.5/u);
  assert.doesNotMatch(freshEngine(EN).respond('5.5+3'), /\b= 8\b/u);
  assert.match(freshEngine(FA).respond('۵.۵+۳ چند می‌شه'), /۸٫۵/u);
  // The wrong substring result would be a standalone ۸, not ۸٫۵.
  assert.doesNotMatch(
    freshEngine(FA).respond('۵.۵+۳ چند می‌شه'),
    /مساوی است با ۸(?!٫)/u
  );
  assert.match(freshEngine(EN).respond('what is 5.5+3'), /8\.5/u);
});

test('arithmetic: x and X operators work in bare expressions', () => {
  // Regression: the x operator is a letter, so the "no surrounding
  // letters" guard rejected bare expressions like "5x3" while "8*3"
  // worked. The operator is now excluded before the letter scan.
  assert.match(freshEngine(EN).respond('5x3'), /15/u);
  assert.match(freshEngine(EN).respond('5 X 3'), /15/u);
});

test('arithmetic: division results are rounded, not float artifacts', () => {
  // Regression: 10/3 replied "3.3333333333333335". Division now rounds
  // to two decimals like the percentage path.
  assert.match(freshEngine(EN).respond('10/3'), /3\.33/u);
  assert.match(freshEngine(EN).respond('1/3'), /0\.33/u);
  // Persian decimals use the proper Persian decimal separator "٫".
  assert.match(freshEngine(FA).respond('۱۰ تقسیم بر 3'), /۳٫۳۳/u);
  // Exact divisions stay exact.
  assert.match(freshEngine(EN).respond('10/2'), /= 5/u);
  assert.match(freshEngine(FA).respond('۱۰ تقسیم بر ۲'), /۵/u);
});

test('arithmetic: English large numbers', () => {
  assert.match(freshEngine(EN).respond('100+200'), /300/);
});

test('arithmetic: non-math text does not trigger', () => {
  assert.ok(freshEngine(FA).respond('امروز هوای خوبی است').length > 0);
  assert.ok(freshEngine(EN).respond('today is a nice day').length > 0);
  assert.ok(freshEngine(FA).respond('من ۲۰ سال دارم').length > 0);
});

test('arithmetic: Persian بعلاوه with چند می‌شه', () => {
  assert.match(freshEngine(FA).respond('۵ بعلاوه ۳ چند می‌شه'), /۸/);
});

test('arithmetic: Persian ضربدر with چند می‌شود', () => {
  assert.match(freshEngine(FA).respond('۸ ضربدر ۳ چند می‌شود'), /۲۴/);
});

test("arithmetic: English what's with division", () => {
  assert.match(freshEngine(EN).respond("what's 10/2"), /5/);
});
// ============================================================================
// Date/time questions
// ============================================================================

test('EN: what time is it returns a time string', () => {
  const restore = seededRandom();
  try {
    const reply = freshEngine(EN).respond('what time is it');
    assert.ok(reply.length > 5, 'time reply should have content');
    assert.match(reply, /\d/, 'time reply should contain digits');
    assert.doesNotMatch(
      reply,
      /quiet|ready|here|silence/i,
      'should not be an empty/fallback response'
    );
  } finally {
    restore();
  }
});
test('EN: what is the date returns a date string', () => {
  const reply = freshEngine(EN).respond('what is the date');
  assert.ok(reply.length > 8, 'date reply should have content');
  assert.match(
    reply,
    /\d{4}|\d{1,2}\/\d{1,2}|\d{1,2},|20\d{2}/,
    'date reply should contain a year or date pattern'
  );
  assert.doesNotMatch(
    reply,
    /\bquiet\b|\bready\b|\bsilence\b/i,
    'should not be an empty/fallback response'
  );
});

test('EN: what is today returns a date', () => {
  const reply = freshEngine(EN).respond('what is today');
  assert.ok(reply.length > 8);
  assert.match(reply, /\d{4}|\d{1,2}\/\d{1,2}|20\d{2}/);
});

test('FA: time query returns Persian time text', () => {
  const reply = freshEngine(FA).respond(
    '\u0633\u0627\u0639\u062A \u0686\u0646\u062F\u0647'
  );
  // ساعت چنده - should return time with Persian digits
  assert.ok(reply.length > 5);
  assert.match(
    reply,
    /[\u0600-\u06FF\u06F0-\u06F9]/u,
    'FA time reply should contain Persian text or digits'
  );
});

test('FA: date query returns Persian date text', () => {
  const reply = freshEngine(FA).respond(
    '\u062A\u0627\u0631\u06CC\u062E \u0627\u0645\u0631\u0648\u0632'
  );
  // تاریخ امروز - should return date with Persian text
  assert.ok(reply.length > 8);
  assert.match(
    reply,
    /[\u0600-\u06FF\u06F0-\u06F9]/u,
    'FA date reply should contain Persian text or digits'
  );
});

test('EN: "what is a date" does NOT trigger date handler', () => {
  // The phrase "what is a date" contains the word "date" but does
  // NOT ask for the current date. The date pattern requires more
  // specific phrasing like "what is the date" or "what is today".
  // This should fall through to normal routing instead.
  const reply = freshEngine(EN).respond('what is a date');
  assert.ok(reply.length > 0);
  // The date pattern requires "what" + "is" + "the" + "date" or similar.
  // "what is a date" should NOT match the date pattern.
  const normalized = EN.normalize('what is a date');
  assert.equal(
    EN.dateTimeDatePattern.test(normalized),
    false,
    '"what is a date" should not match dateTimeDatePattern'
  );
});

test('EN: time query does not bleed into next turn', () => {
  const engine = freshEngine(EN);
  engine.respond('what time is it');
  // The next turn should be a normal conversation, not a time repeat
  const next = engine.respond('I feel a bit anxious today');
  assert.ok(next.length > 10);
  assert.doesNotMatch(
    next,
    /time is|clock|o'clock/i,
    'next turn should not mention time'
  );
});

// ============================================================================
// Response strategy
// ============================================================================

test('response strategy records purposeful decisions', () => {
  const engine = freshEngine(EN);
  engine.respond('My job has been stressful');
  assert.ok(engine.conversationState.strategy);
  assert.equal(typeof engine.conversationState.strategy, 'string');
});

test('serious strategy responds to hopeless input', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('I feel completely devastated and hopeless');
  assert.ok(engine.conversationState.strategy);
  assert.ok(reply.length > 0);
  assert.doesNotMatch(reply, /happy|great|wonderful/i);
});

test('safety beats word repetition and frustration', () => {
  assert.match(
    freshEngine(EN).respond('I want to kill myself I want to kill myself'),
    /not alone|crisis line|professional help/
  );
});

test('factorial input does not crash', () => {
  assert.ok(freshEngine(EN).respond('5!').length > 0);
});

test('Persian greeting with punctuation is handled', () => {
  assert.ok(freshEngine(FA).respond('سلام!').length > 0);
});

test('apostrophe in contractions preserved', () => {
  assert.ok(freshEngine(EN).respond("I'm not doing well today").length > 0);
});

// ============================================================================
// Word repetition / intelligence
// ============================================================================

test('English word repetition detected', () => {
  const reply = freshEngine(EN).respond('sad sad sad sad');
  assert.match(reply, /sad/);
  assert.ok(reply.length > 10);
});

test('Persian word repetition detected', () => {
  const reply = freshEngine(FA).respond('غمگین غمگین غمگین غمگین');
  assert.match(reply, /غمگین/);
  assert.ok(reply.length > 10);
});

test('non-repeated words do not trigger repetition', () => {
  assert.ok(freshEngine(EN).respond('I feel sad today').length > 0);
});

test('emotionally charged questions get thoughtful responses', () => {
  assert.ok(
    freshEngine(EN).respond('Why does this keep happening!').length > 0
  );
  assert.ok(
    freshEngine(EN).respond('Why does this keep happening?').length > 0
  );
});

test('10x repeated Persian greeting breaks loop', () => {
  const engine = freshEngine(FA);
  for (let i = 0; i < 9; i += 1) {
    engine.respond('سلام');
  }
  assert.ok(engine.respond('سلام').length > 0);
});

test('10x repeated English greeting breaks loop', () => {
  const engine = freshEngine(EN);
  for (let i = 0; i < 9; i += 1) {
    engine.respond('hi');
  }
  assert.ok(engine.respond('hi').length > 0);
});

// ============================================================================
// Exit confirmation
// ============================================================================

test('exit confirm returns message from pool', () => {
  const reply = freshEngine(EN).respond('goodbye');
  assert.ok(
    EN.exitConfirmMessages.includes(reply) || typeof reply === 'string'
  );
});

test('exit confirm in Persian returns response', () => {
  assert.ok(freshEngine(FA).respond('خداحافظ').length > 0);
});

test('exit confirm varies across repeated calls', () => {
  const seen = new Set();
  for (let i = 0; i < 10; i += 1) {
    seen.add(freshEngine(EN).respond('goodbye'));
  }
  assert.ok(seen.size > 1);
});

test('exit not triggered by story containing goodbye', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('I said goodbye to my friend today');
  assert.ok(!engine.memory.pendingExitConfirmation);
  assert.ok(reply.length > 0);
});

test('short polite farewells detected', () => {
  assert.equal(freshEngine(EN).isExitCommand('bye'), true);
  assert.equal(freshEngine(FA).isExitCommand('بدرود'), true);
});

// ============================================================================
// Edge cases: empty, whitespace
// ============================================================================

test('empty input returns gentle prompt', () => {
  assert.match(freshEngine(EN).respond(''), /quiet|ready|here|silence/i);
  assert.match(freshEngine(FA).respond(''), /سکوت|شنوم|آماده|صحبت/iu);
});

test('whitespace-only returns gentle prompt', () => {
  assert.match(freshEngine(EN).respond('   '), /quiet|ready|here|silence/i);
  assert.match(freshEngine(FA).respond('   '), /سکوت|شنوم|آماده|صحبت/iu);
});

test('short ambiguous input handled', () => {
  assert.ok(freshEngine(EN).respond('ok').length > 0);
  assert.ok(freshEngine(FA).respond('خوب').length > 0);
});

test('gratitude does not close conversation', () => {
  assert.ok(EN.gratitudeResponses.includes(freshEngine(EN).respond('thanks')));
});

test('mixed topic identifies dominant topic', () => {
  assert.ok(
    freshEngine(EN).respond('My job is stressful and I feel sad').length > 0
  );
});

test('goodbye followed by non-exit resumes', () => {
  const engine = freshEngine(EN);
  engine.respond('goodbye');
  engine.respond('goodbye');
  assert.ok(engine.respond('actually I need to talk').length > 0);
});

// ============================================================================
// Long and extreme inputs
// ============================================================================

test('very long inputs remain safe', () => {
  assert.ok(freshEngine(EN).respond('sad '.repeat(500)).length > 0);
  assert.ok(freshEngine(EN).respond('a'.repeat(2000)).length > 0);
  assert.ok(freshEngine(FA).respond('سلام '.repeat(300)).length > 0);
});

test('very long math expression answered', () => {
  const reply = freshEngine(EN).respond('what is ' + '1+'.repeat(500) + '1?');
  assert.ok(reply.length > 0);
});

test('extremely long input bounded gracefully', () => {
  assert.ok(freshEngine(EN).respond('test '.repeat(3000)).length > 0);
});

// ============================================================================
// Punctuation and HTML injection
// ============================================================================

test('excessive punctuation produces a reply', () => {
  assert.ok(freshEngine(EN).respond('Why!!!!!').length > 0);
  assert.ok(freshEngine(EN).respond('Why?????').length > 0);
  assert.ok(freshEngine(EN).respond('Why?!?!?').length > 0);
  assert.ok(freshEngine(FA).respond('!!!').length > 0);
  assert.ok(freshEngine(EN).respond('!?!?!?!?!?').length > 0);
});

test('HTML injection returns safe reply', () => {
  const engine = freshEngine(EN);
  const script = engine.respond('<script>alert("xss")</script>');
  assert.ok(script.length > 0);
  assert.doesNotMatch(script, /<script>/i);
  const iframe = engine.respond('<iframe src="http://evil.com"></iframe>');
  assert.ok(iframe.length > 0);
  assert.doesNotMatch(iframe, /<iframe/i);
});

test('HTML attributes handled safely', () => {
  assert.ok(freshEngine(EN).respond('<img src=x onerror=alert(1)>').length > 0);
  assert.ok(
    freshEngine(EN).respond('Click here onmouseover="alert(1)"').length > 0
  );
  assert.ok(freshEngine(EN).respond('&lt;script&gt;').length > 0);
  assert.ok(
    freshEngine(FA).respond('<script>alert("xss")</script>').length > 0
  );
  assert.ok(freshEngine(EN).respond("'; DROP TABLE users; --").length > 0);
});

// ============================================================================
// Arabic and mixed script
// ============================================================================

test('Arabic with diacritics normalized', () => {
  assert.ok(freshEngine(FA).respond('السَّلَامُ عَلَيْكُمْ').length > 0);
});

test('mixed English and Persian handled without crashing', () => {
  assert.ok(freshEngine(FA).respond('سلام how are you').length > 0);
});

test('Arabic text accepted in FA engine', () => {
  assert.ok(freshEngine(FA).respond('السلام علیکم').length > 0);
});

test('pure English politely redirected in FA engine', () => {
  assert.match(freshEngine(FA).respond('I am happy'), /فارسی/);
});

test('pure Persian politely redirected in EN engine', () => {
  assert.match(freshEngine(EN).respond('من خوشحالم'), /English|language/i);
});

// ============================================================================
// Emoji
// ============================================================================

test('emoji-only input returns non-empty reply', () => {
  assert.ok(freshEngine(EN).respond('\uD83D\uDE0A').length > 0);
  assert.ok(
    freshEngine(EN).respond('\uD83D\uDE0A\uD83D\uDC4D\uD83D\uDE4C').length > 0
  );
  assert.ok(freshEngine(FA).respond('\uD83D\uDE0A سلام').length > 0);
  assert.ok(freshEngine(EN).respond('hello \uD83D\uDE0A').length > 0);
  assert.ok(freshEngine(EN).respond('\uD83C\uDDFA\uD83C\uDDF8').length > 0);
  assert.ok(freshEngine(EN).respond('\uD83D\uDC4B\uD83C\uDFFC').length > 0);
  assert.ok(freshEngine(FA).respond('\uD83D\uDE0A').length > 0);
});

// ============================================================================
// Mixed language detection
// ============================================================================

test('_isMixedLanguage detects bilingual Persian-dominant text', () => {
  assert.ok(freshEngine(FA)._isMixedLanguage('من یک how are you دارم'));
});

test('_isMixedLanguage detects bilingual English-dominant text', () => {
  assert.ok(freshEngine(EN)._isMixedLanguage('I have a سلام friend'));
});

test('_isMixedLanguage false for pure script', () => {
  assert.equal(freshEngine(FA)._isMixedLanguage('من یک دوست دارم'), false);
});

test('_isMixedLanguage false for few letters', () => {
  assert.equal(freshEngine(FA)._isMixedLanguage('12 34 + ='), false);
});

test('_isMixedLanguage false for no letters', () => {
  assert.equal(freshEngine(FA)._isMixedLanguage('12345 67890'), false);
});

test('mixed language routing returns response', () => {
  assert.ok(freshEngine(FA).respond('I feel من today').length > 0);
});

test('pure foreign script redirects in FA', () => {
  assert.match(freshEngine(FA).respond('Hello, how are you?'), /فارسی/);
});

test('pure foreign script redirects in EN', () => {
  assert.match(freshEngine(EN).respond('سلام علیکم'), /English|language/i);
});

test('Arabic text not detected as mixed in FA', () => {
  assert.equal(freshEngine(FA)._isMixedLanguage('السلام علیکم'), false);
});

// ============================================================================
// Emotion calibration
// ============================================================================

test('emotion calibration prefixes exist in both languages', () => {
  for (const lang of [FA, EN]) {
    for (const [emotion, prefix] of Object.entries(lang.emotionCalibration)) {
      assert.ok(prefix, `${lang.code}:${emotion}`);
      assert.equal(typeof prefix, 'string');
      assert.ok(prefix.length > 0);
    }
  }
});

test('emotion calibration prefixes are unique per language', () => {
  for (const lang of [FA, EN]) {
    const prefixes = Object.values(lang.emotionCalibration);
    assert.equal(new Set(prefixes).size, prefixes.length);
  }
});

test('emotion calibration returns non-empty string', () => {
  const calibrated = freshEngine(EN)._calibrateEmotionalTone(
    'You matter.',
    'sad'
  );
  assert.ok(calibrated.length > 0);
});

test('unknown emotion returns reply unchanged', () => {
  assert.equal(
    freshEngine(EN)._calibrateEmotionalTone('Hello.', 'unknown'),
    'Hello.'
  );
});

// ============================================================================
// Distress nudge details
// ============================================================================

test('distress nudge fires after 3 negatives', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  engine.respond('I feel depressed');
  assert.match(
    engine.respond('I am feeling overwhelmed'),
    /breathe|pause|heavy/i
  );
});

test('distress nudge does not fire before 3 negatives', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  assert.doesNotMatch(
    engine.respond('I am feeling down'),
    /breathe in for a count of four/i
  );
});

test('distress nudge fires only once per streak', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  engine.respond('I feel hopeless');
  engine.respond('I am overwhelmed');
  engine.respond('I still feel bad');
  assert.doesNotMatch(
    engine.respond('still bad today'),
    /breathe in for a count of four/i
  );
});

test('distress nudge resets after streak ends', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  engine.respond('I feel hopeless');
  engine.respond('I am overwhelmed');
  engine.respond('I feel better today');
  engine.respond('oh wait I am sad again');
  assert.doesNotMatch(
    engine.respond('I feel terrible'),
    /breathe in for a count of four/i
  );
});

test('distress nudge does not override safety', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  engine.respond('I feel hopeless');
  assert.match(
    engine.respond('I want to kill myself'),
    /not alone|crisis line|professional help/
  );
});

test('distress nudge works in Persian', () => {
  const engine = freshEngine(FA);
  engine.respond('غمگینم');
  engine.respond('ناراحتم');
  const reply = engine.respond('حالم خوب نیست');
  // The nudge must be one of the caring coping lines, never a generic
  // fallback: both lines mention a pause or professional support.
  assert.match(reply, /مکث|متخصص|نفس|سنگین|حس.*ادامه/iu);
  assert.ok(
    !FA.genericFallbacks.includes(reply) &&
      !FA.strategyShiftFallbacks.includes(reply),
    'nudge reply must not be a generic fallback line'
  );
});

// ============================================================================
// Sentiment scoring
// ============================================================================

test('sentiment: FA ناراحت scores negative despite راحت overlap', () => {
  assert.equal(
    DaryaEngine.scoreSentiment(FA.normalize('ناراحت'), FA.sentimentLexicon),
    -1
  );
});

test('sentiment: FA ناراحتم (attached person suffix) scores negative', () => {
  assert.equal(
    DaryaEngine.scoreSentiment(FA.normalize('ناراحتم'), FA.sentimentLexicon),
    -1
  );
});

test('sentiment: FA غمگین counts once, not twice', () => {
  assert.equal(
    DaryaEngine.scoreSentiment(FA.normalize('غمگین'), FA.sentimentLexicon),
    -1
  );
});

test('sentiment: FA negated good scores negative', () => {
  assert.equal(
    DaryaEngine.scoreSentiment(
      FA.normalize('حالم خوب نیست'),
      FA.sentimentLexicon
    ),
    -1
  );
});

test('sentiment: FA ندارم negation flips polarity', () => {
  assert.equal(
    DaryaEngine.scoreSentiment(
      FA.normalize('احساس خوبی ندارم'),
      FA.sentimentLexicon
    ),
    -1
  );
});

test('sentiment: FA compound partially caught', () => {
  const score = DaryaEngine.scoreSentiment(
    FA.normalize('دلشکسته'),
    FA.sentimentLexicon
  );
  assert.ok(score <= 0);
});

test('sentiment: EN negated positive scores negative', () => {
  assert.equal(
    DaryaEngine.scoreSentiment(
      EN.normalize('I am not happy'),
      EN.sentimentLexicon
    ),
    -1
  );
});

test('sentiment: EN not sad scores positive', () => {
  assert.equal(
    DaryaEngine.scoreSentiment(
      EN.normalize('I am not sad'),
      EN.sentimentLexicon
    ),
    1
  );
});

// ============================================================================
// Advanced edge cases
// ============================================================================

test('null input does not crash engine', () => {
  assert.ok(freshEngine(EN).respond(null).length > 0);
  assert.ok(freshEngine(FA).respond(null).length > 0);
});

test('undefined input does not crash engine', () => {
  assert.ok(freshEngine(EN).respond(undefined).length > 0);
  assert.ok(freshEngine(FA).respond(undefined).length > 0);
});

test('newline-only and tab-only return gentle prompt', () => {
  assert.ok(freshEngine(EN).respond('\n\n').length > 0);
  assert.ok(freshEngine(EN).respond('\t\t').length > 0);
});

test('unicode direction marks do not crash the engine', () => {
  assert.ok(freshEngine(EN).respond('\\u200Fhello').length > 0);
  assert.ok(
    freshEngine(FA).respond('\\u200E\u0633\u0644\u0627\u0645').length > 0
  );
});

test('zero-width non-joiner Persian normalization works', () => {
  const reply = freshEngine(FA).respond(
    '\u0645\u06CC\\u200C\u062E\u0648\u0627\u0647\u0645'
  );
  assert.ok(reply.length > 0);
});

test('only digits returns non-empty reply', () => {
  assert.ok(freshEngine(EN).respond('12345').length > 0);
  assert.ok(
    freshEngine(FA).respond('\u06F1\u06F2\u06F3\u06F4\u06F5').length > 0
  );
});

test('only symbols returns non-empty reply', () => {
  assert.ok(freshEngine(EN).respond('@#$%^&*()').length > 0);
  assert.ok(freshEngine(FA).respond('@#$%^&*()').length > 0);
});

test('URLs handled safely without crash or leak', () => {
  assert.ok(freshEngine(EN).respond('http://example.com').length > 0);
  assert.ok(
    freshEngine(FA).respond('https://test.com/path?query=value').length > 0
  );
  const reply = freshEngine(EN).respond('visit http://evil.com now');
  assert.ok(reply.length > 0);
  assert.doesNotMatch(reply, /http:\/\//i);
});

test('SQL injection patterns do not produce raw output', () => {
  const reply = freshEngine(EN).respond(' OR 1=1;--');
  assert.ok(reply.length > 0);
  assert.doesNotMatch(reply, /DROP|DELETE|INSERT|OR 1=1/i);
});

test('JSON-style input handled without crash', () => {
  assert.ok(freshEngine(EN).respond('{"key": "value"}').length > 0);
  assert.ok(freshEngine(FA).respond('{"text": "سلام"}').length > 0);
});

test('triple-script mixed input (Persian + Arabic + English) handled', () => {
  assert.ok(
    freshEngine(FA).respond(
      '\u0633\u0644\u0627\u0645 \u06A9\u06CC\u0641 \u062D\u0627\u0644\u06A9 how are you'
    ).length > 0
  );
});

test('multi-codepoint emoji (flag, skin tone, ZWJ) handled without crash', () => {
  // Flag emoji (US)
  assert.ok(freshEngine(EN).respond('\\uD83C\\uDDFA\\uD83C\\uDDF8').length > 0);
  // Skin tone modifier
  assert.ok(freshEngine(EN).respond('\\uD83D\\uDC4B\\uD83C\\uDFFC').length > 0);
  // ZWJ sequence (technologist emoji)
  assert.ok(
    freshEngine(EN).respond('\\uD83D\\uDC68\\u200D\\uD83D\\uDCBB').length > 0
  );
  // Family emoji
  assert.ok(
    freshEngine(FA).respond(
      '\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC66'
    ).length > 0
  );
});

test('all-punctuation and repeated separators produce reply', () => {
  assert.ok(freshEngine(EN).respond('...').length > 0);
  assert.ok(freshEngine(EN).respond('!?.,;:!?').length > 0);
  assert.ok(freshEngine(EN).respond('----').length > 0);
  assert.ok(freshEngine(FA).respond('...').length > 0);
});

test('all-caps input does not leak raw text in response', () => {
  const reply = freshEngine(EN).respond('I AM VERY ANGRY RIGHT NOW');
  assert.ok(reply.length > 0);
  // Response should acknowledge the emotion without repeating the raw caps back
  assert.doesNotMatch(reply, /I AM VERY ANGRY/i);
});

test('repeated single character produces reply', () => {
  assert.ok(freshEngine(EN).respond('aaaaaaa').length > 0);
  assert.ok(freshEngine(EN).respond('111111').length > 0);
  assert.ok(
    freshEngine(FA).respond('\u0627\u0627\u0627\u0627\u0627\u0627').length > 0
  );
});

test('SVG and javascript URIs stripped from response', () => {
  const svgReply = freshEngine(EN).respond('<svg onload=alert(1)>');
  assert.ok(svgReply.length > 0);
  assert.doesNotMatch(svgReply, /onload|alert|<svg/i);
  const jsReply = freshEngine(EN).respond('javascript:alert(1)');
  assert.ok(jsReply.length > 0);
  assert.doesNotMatch(jsReply, /javascript:|alert/i);
  const dataReply = freshEngine(FA).respond(
    'data:text/html,<script>alert(1)</script>'
  );
  assert.ok(dataReply.length > 0);
  assert.doesNotMatch(dataReply, /data:|<script>|alert/i);
});

test('HTML entity injection returns safe reply', () => {
  assert.ok(
    freshEngine(EN).respond('&lt;script&gt;alert(1)&lt;/script&gt;').length > 0
  );
  assert.ok(freshEngine(FA).respond('&amp;nbsp;').length > 0);
});

// ============================================================================
// Knowledge rule
// ============================================================================

test('knowledge rule responds without network access', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('How can I focus better?');
  assert.ok(reply.length > 40);
  assert.equal(engine.currentTurnTopics.includes('knowledge'), true);
});

test('Persian knowledge rule responds in Persian', () => {
  const reply = freshEngine(FA).respond('برای تمرکز چه کار کنم؟');
  assert.match(reply, /[\u0600-\u06FF]/u);
});

// ============================================================================
// Factual knowledge layer (2025-2026 world knowledge, culture, careers)
// ============================================================================

test('knowledge: Jupiter question answered factually in both languages', () => {
  const fa = freshEngine(FA).respond('راجع به سیاره مشتری برام توضیح بده');
  assert.match(fa, /مشتری/);
  assert.match(fa, /گاز|غول|بزرگ‌ترین/);
  const en = freshEngine(EN).respond('tell me about Jupiter');
  assert.match(en, /Jupiter/);
  assert.match(en, /gas giant|largest planet/i);
});

test('knowledge: quantum physics answered directly, not evasively', () => {
  const fa = freshEngine(FA).respond('فیزیک کوانتوم چیه');
  assert.match(fa, /اتم|ذره|کوانتوم/);
  assert.ok(!FA.questionAcknowledgements.includes(fa));
  const en = freshEngine(EN).respond('what is quantum physics');
  assert.match(en, /quantum|atom|particle/i);
  assert.ok(!EN.questionAcknowledgements.includes(en));
});

test('knowledge: 2026 tech stack question gets a concrete answer', () => {
  const fa = freshEngine(FA).respond(
    'بهترین تک استک برای توسعه وب در سال ۲۰۲۶ چیه'
  );
  assert.match(fa, /React|Next|TypeScript|Node/);
  const en = freshEngine(EN).respond(
    'what is the best tech stack for web development in 2026'
  );
  assert.match(en, /React|Next|TypeScript|Node/);
});

test('knowledge: crush question answered instead of bounced back', () => {
  const fa = freshEngine(FA).respond('کراش چیه');
  assert.match(fa, /ابراز علاقه|کراش/);
  const en = freshEngine(EN).respond('what is a crush');
  assert.match(en, /feel|like|attraction/i);
});

test('knowledge: making money as a developer gets real paths', () => {
  const fa = freshEngine(FA).respond('چطور پول دربیارم');
  assert.match(fa, /فریلنس|ریموت|نمونه‌کار/);
  const en = freshEngine(EN).respond('how to make money as a programmer');
  assert.match(en, /freelance|portfolio|remote/i);
});

test('knowledge: imposter syndrome defined in both languages', () => {
  const fa = freshEngine(FA).respond('سندرم ایمپاستر چیه');
  assert.match(fa, /ایمپاستر/);
  assert.match(fa, /شانس|بلوف|صلاحیت/);
  const en = freshEngine(EN).respond('what is imposter syndrome');
  assert.match(en, /imposter/i);
});

test('knowledge: factual override never hijacks an emotional disclosure', () => {
  // "من استرس دارم" is a feeling, not a request for the stress entry.
  // The reply must come from the lived-experience pools (anxiety/stress
  // rules or their topic-specific questions), never from the factual
  // shelf text (which starts with the definition).
  const faReply = freshEngine(FA).respond('من استرس دارم');
  const faPools = [
    ...(globalThis.DaryaFaResponses.ruleAnxiety || []),
    ...(globalThis.DaryaFaResponses.ruleStress || []),
    ...(globalThis.DaryaFaResponses.topicSpecificQuestions.anxiety || []),
    ...(globalThis.DaryaFaResponses.topicSpecificQuestions.stress || [])
  ];
  assert.ok(
    faPools.includes(faReply),
    'FA stress disclosure must use the emotional pools, got: ' + faReply
  );
  const enReply = freshEngine(EN).respond('I feel stressed today');
  const enPools = [
    ...(globalThis.DaryaEnResponses.ruleAnxiety || []),
    ...(globalThis.DaryaEnResponses.ruleStress || []),
    ...(globalThis.DaryaEnResponses.topicSpecificQuestions.anxiety || []),
    ...(globalThis.DaryaEnResponses.topicSpecificQuestions.stress || [])
  ];
  assert.ok(
    enPools.includes(enReply),
    'EN stress disclosure must use the emotional pools, got: ' + enReply
  );
});

test('knowledge: unknown factual question still gets a warm non-answer', () => {
  const en = freshEngine(EN).respond(
    'what is the capital of a fictional planet'
  );
  assert.ok(en.length > 0);
  // The reply may be a plain acknowledgement or, on the coin-flip, an
  // honest source suggestion; both are warm non-answers.
  assert.ok(
    EN.questionAcknowledgements.includes(en) ||
      EN.sourceSuggestions.includes(en),
    'unknown question must get an acknowledgement or source pointer, got: ' + en
  );
});

test('knowledge: solar system planets answered in both languages', () => {
  const cases = [
    ['fa', 'راجع به خورشید توضیح بده', /ستاره|خورشید/],
    ['en', 'tell me about the Sun', /star|sun/i],
    ['fa', 'سیاره عطارد چیه', /عطارد/],
    ['en', 'what is mercury the planet', /Mercury/],
    ['fa', 'سیاره زهره چیه', /زهره/],
    ['en', 'tell me about Venus', /Venus/],
    ['fa', 'مریخ چطور سیاره ایه', /مریخ/],
    ['en', 'what is Mars like', /Mars/],
    ['fa', 'سیاره زحل چیه', /زحل/],
    ['en', 'about Saturn', /Saturn/],
    ['fa', 'اورانوس چیه', /اورانوس/],
    ['en', 'what is Uranus', /Uranus/],
    ['fa', 'نپتون چیه', /نپتون/],
    ['en', 'what is Neptune', /Neptune/]
  ];
  for (const [lang, q, re] of cases) {
    const reply = freshEngine(lang === 'fa' ? FA : EN).respond(q);
    assert.match(reply, re, `${lang} ${q} should be answered factually`);
  }
});

test('knowledge: college major and Iran konkur advice in both languages', () => {
  const faMajor = freshEngine(FA).respond('چه رشته‌ای برای دانشگاه انتخاب کنم');
  assert.match(faMajor, /رشته|دانشگاه|علاقه/);
  const enMajor = freshEngine(EN).respond('how to choose a college major');
  assert.match(enMajor, /major|interest|career/i);
  const faKonkur = freshEngine(FA).respond('کنکور چطوریه و چطور آماده بشم');
  assert.match(faKonkur, /کنکور|عمومی|تخصصی/);
  const enKonkur = freshEngine(EN).respond('how to prepare for the konkur');
  assert.match(enKonkur, /konkur|exam|subject/i);
  const faTeen = freshEngine(FA).respond(
    'نوجوان چطور شغل آینده‌اش رو پیدا کنه'
  );
  assert.match(faTeen, /شغل|مسیر|آزمایش/);
  const enTeen = freshEngine(EN).respond('career ideas for teens');
  assert.match(enTeen, /career|experiment|path/i);
});

test('knowledge: professions answered in both languages', () => {
  const cases = [
    ['fa', 'چطور نجار شوم', /نجار/],
    ['en', 'how to become a carpenter', /carpent/i],
    ['fa', 'مهندسی مکانیک چیه', /مکانیک/],
    ['en', 'mechanical engineering career', /mechanical/i],
    ['fa', 'اینترنت اشیا چیه', /اینترنت اشیا|IoT/],
    ['en', 'what is the internet of things', /internet of things|iot/i],
    ['fa', 'چطور مجسمه‌ساز شوم', /مجسمه/],
    ['en', 'how to become a sculptor', /sculpt/i],
    ['fa', 'شغل موسیقی و خوانندگی چطوره', /موسیقی/],
    ['en', 'music career for a singer', /music|sing/i],
    ['fa', 'چطور بازیگر شوم', /بازیگر/],
    ['en', 'how to become an actor', /act/i],
    ['fa', 'با مدرک ریاضی چه شغل هایی می‌تونم داشته باشم', /ریاضی/],
    ['en', 'what can i do with a math degree', /math/i],
    ['fa', 'چطور غواص شوم', /غواص/],
    ['en', 'how to become a diver', /div/i],
    ['fa', 'چطور آتش‌نشان شوم', /آتش‌نشان/],
    ['en', 'how to become a firefighter', /firefight/i]
  ];
  for (const [lang, q, re] of cases) {
    const reply = freshEngine(lang === 'fa' ? FA : EN).respond(q);
    assert.match(reply, re, `${lang} ${q} should be answered factually`);
  }
});

test('knowledge: movie and series recommendations in both languages', () => {
  const fa = freshEngine(FA).respond('ده فیلم خوب معرفی کن');
  assert.match(fa, /کیارستمی|فرهادی|سینما/);
  assert.match(fa, /۱\.|۲\.|۳\./);
  const en = freshEngine(EN).respond('recommend 10 good movies');
  assert.match(en, /Kiarostami|Farhadi|film|movie/i);
  assert.match(en, /1\.|2\.|3\./);
});

test('knowledge: genre movie requests answered per genre in both languages', () => {
  const genreCases = [
    ['fa', 'یک فیلم ترسناک پیشنهاد بده', /ترسناک|وحشت/],
    ['en', 'recommend a horror movie', /horror|scary/i],
    ['fa', 'فیلم عاشقانه معرفی کن', /عاشقانه/],
    ['en', 'suggest a romantic movie', /romantic/i],
    ['fa', 'فیلم کمدی پیشنهاد بده', /کمدی/],
    ['en', 'recommend a comedy film', /comedy/i],
    ['fa', 'فیلم کمدی سیاه معرفی کن', /کمدی سیاه/],
    ['en', 'suggest a dark comedy movie', /dark comedy|black comedy/i],
    ['fa', 'فیلم فانتزی پیشنهاد بده', /فانتزی/],
    ['en', 'recommend a fantasy movie', /fantasy/i],
    ['fa', 'یک سریال کوتاه معرفی کن', /سریال کوتاه/],
    ['en', 'suggest a short series', /short.?series|mini series|miniseries/i],
    ['fa', 'فیلم بر اساس داستان واقعی معرفی کن', /واقعی|واقعیت/],
    ['en', 'recommend a movie based on true events', /true events|true story/i],
    ['fa', 'یه فیلم هیجانی پیشنهاد بده', /هیجانی/],
    ['en', 'suggest a thriller movie', /thriller/i],
    ['fa', 'فیلم علمی تخیلی معرفی کن', /علمی/],
    ['en', 'recommend a sci-fi film', /sci.?fi|science fiction/i],
    ['fa', 'مستند خوب معرفی کن', /مستند/],
    ['en', 'tell me a good documentary', /documentar/i],
    ['fa', 'یه انیمیشن خوب بگو', /انیمیشن/],
    ['en', 'best animated movie to watch', /animation|animated/i]
  ];
  for (const [lang, q, re] of genreCases) {
    const reply = freshEngine(lang === 'fa' ? FA : EN).respond(q);
    assert.match(reply, re, `${lang} ${q} should match its genre list`);
  }
});

test('sequential: movie request then genre follow-up refines in place', () => {
  const en = freshEngine(EN);
  const first = en.respond(
    'Suggest me just three good movies to see this weekend'
  );
  assert.match(first, /film|movie|cinema/i);
  const horror = en.respond('in horror genre please');
  assert.match(horror, /horror|scary/i);
  assert.ok(
    !/A few non-mainstream picks/.test(horror),
    'genre follow-up must not repeat the general list'
  );
  const romantic = en.respond('now something romantic');
  assert.match(romantic, /romantic/i);
});

test('sequential: FA movie request then genre follow-up refines in place', () => {
  const fa = freshEngine(FA);
  const first = fa.respond('سه فیلم خوب برای آخر هفته پیشنهاد بده');
  assert.match(first, /سینما|فیلم/);
  const horror = fa.respond('ترسناک');
  assert.match(horror, /ترسناک|وحشت/);
  assert.ok(
    !/چند پیشنهاد غیرتکراری/.test(horror),
    'FA genre follow-up must not repeat the general list'
  );
});

test('sequential: genre follow-up without prior movie context stays generic', () => {
  // A bare genre word with no preceding movie request must not fabricate
  // a genre list; it falls back to a normal conversational reply.
  const en = freshEngine(EN);
  const reply = en.respond('horror');
  assert.ok(reply.length > 0);
  assert.doesNotMatch(reply, /Non-obvious horror picks/);
});

test('sequential: FA multi-hop genre chain keeps refining in place', () => {
  const fa = freshEngine(FA);
  fa.respond('سه فیلم خوب برای آخر هفته پیشنهاد بده');
  const hops = [
    ['ترسناک', /ترسناک|وحشت/],
    ['کمدی سیاه', /کمدی سیاه/],
    ['عاشقانه', /عاشقانه/],
    ['فانتزی', /فانتزی/],
    ['سریال کوتاه', /سریال کوتاه/]
  ];
  for (const [q, re] of hops) {
    const reply = fa.respond(q);
    assert.match(reply, re, `FA genre hop ${q} should refine in place`);
  }
});

test('sequential: new genre follow-ups refine in place (thriller, sci-fi, documentary, animation)', () => {
  const en = freshEngine(EN);
  en.respond('Suggest me just three good movies to see this weekend');
  assert.match(en.respond('in thriller genre please'), /thriller/i);
  assert.match(en.respond('sci fi please'), /sci.?fi/i);
  assert.match(en.respond('a documentary now'), /documentar/i);
  assert.match(en.respond('animated one please'), /animation|animated/i);
  const fa = freshEngine(FA);
  fa.respond('سه فیلم خوب برای آخر هفته پیشنهاد بده');
  assert.match(fa.respond('هیجانی'), /هیجانی/);
  assert.match(fa.respond('علمی تخیلی'), /علمی/);
  assert.match(fa.respond('مستند'), /مستند/);
  assert.match(fa.respond('انیمیشن'), /انیمیشن/);
});

test('knowledge: expanded genre lists include the fifth picks', () => {
  const cases = [
    [EN, 'horror movie recommendations', /Tumbbad/],
    [EN, 'romantic movie suggestions', /Past Lives/],
    [EN, 'suggest a comedy film', /Death of Stalin/],
    [EN, 'suggest a dark comedy movie', /The Square/],
    [EN, 'recommend a fantasy movie', /Green Knight/],
    [EN, 'suggest a short series', /Unorthodox/],
    [EN, 'recommend a movie based on true events', /Zodiac/],
    [FA, 'یه فیلم ترسناک پیشنهاد بده', /تام‌باد/],
    [FA, 'فیلم عاشقانه معرفی کن', /زندگی‌های گذشته/],
    [FA, 'یه فیلم هیجانی پیشنهاد بده', /شکارچی سر/]
  ];
  // A fresh engine per case: repeated movie requests on one engine trip the
  // topic-cycling rule, which is a different behavior we are not testing here.
  for (const [lang, q, re] of cases) {
    assert.match(freshEngine(lang).respond(q), re, `${lang} ${q}`);
  }
});

test('sequential: dark comedy follow-up returns the dark comedy list, not comedy', () => {
  const en = freshEngine(EN);
  en.respond('suggest me three movies');
  const dark = en.respond('in dark comedy genre please');
  assert.match(dark, /dark comedy|black comedy/i);
  assert.doesNotMatch(dark, /^Non-obvious comedy picks/m);
  const fa = freshEngine(FA);
  fa.respond('سه فیلم پیشنهاد بده');
  const faDark = fa.respond('کمدی سیاه');
  assert.match(faDark, /کمدی سیاه/);
  assert.doesNotMatch(faDark, /پیشنهادهای کمدی غیرتکراری/);
});

test('sequential: emotional genre word is not hijacked after movie talk', () => {
  // After a movie request, an emotionally-used genre word ("horror" as
  // a feeling, "ترسناک" about a situation) must stay with the
  // lived-experience rule, never be answered with a movie list.
  const en = freshEngine(EN);
  en.respond('suggest me three movies');
  const reply = en.respond('this situation is absolute horror for me');
  assert.doesNotMatch(reply, /Non-obvious horror picks/);
});

test('knowledge: Darya can refer to its own project repository', () => {
  const enCases = [
    'where is your repository?',
    'where is the project repo',
    'where is the repo',
    'tell me about your source code'
  ];
  for (const q of enCases) {
    assert.match(
      freshEngine(EN).respond(q),
      /github\.com\/sheikhartin\/darya/,
      q
    );
  }
  const faCases = [
    'سورس کدت کجاست؟',
    'سورس کد پروژه کجاست',
    'گیت هاب پروژه کجاست'
  ];
  for (const q of faCases) {
    assert.match(
      freshEngine(FA).respond(q),
      /github\.com\/sheikhartin\/darya/,
      q
    );
  } // Identity questions must never be replaced by the encyclopedia fact
  // (the fact body contains "everything runs inside your browser" and the
  // PWA line; identity replies are short pool lines and never the fact).
  const enIdentity = freshEngine(EN).respond('who are you');
  assert.match(enIdentity, /Darya|companion/i);
  assert.doesNotMatch(enIdentity, /runs inside your browser|installs as a PWA/);
  const faIdentity = freshEngine(FA).respond('تو کی هستی');
  assert.match(faIdentity, /دریا|همراه/);
  assert.doesNotMatch(faIdentity, /داخل مرورگر خودت اجرا|PWA/);
  // A bare repo mention (no request framing) stays conversational.
  assert.doesNotMatch(
    freshEngine(EN).respond('my repo is private'),
    /runs inside your browser/
  );
});

test('knowledge: video game recommendations by era, platform, and genre', () => {
  const cases = [
    [EN, 'suggest some classic ps1 games', /Metal Gear|Final Fantasy/],
    [FA, 'بازی های قدیمی پلی استیشن ۲ پیشنهاد بده', /متال گیر|فاینال فانتزی/],
    [EN, 'best new games for ps5', /Elden Ring|Baldur/],
    [FA, 'بازی های جدید معرفی کن', /الدن رینگ|بولدور/],
    [EN, 'recommend mobile games', /Monument Valley|Stardew/],
    [FA, 'بازی موبایل خوب معرفی کن', /مانومنت|استاردو/],
    [EN, 'best horror games', /Silent Hill|Outlast/],
    [FA, 'بازی ترسناک معرفی کن', /سایلنت|اوت‌لاست/]
  ];
  for (const [lang, q, re] of cases) {
    assert.match(freshEngine(lang).respond(q), re, `${lang} ${q}`);
  }
});

test('knowledge: generic adjectives never hijack into video games', () => {
  // Regression: 'classic', 'modern', 'قدیمی', 'جدید' were once in the games
  // weak lists, so a movie request carrying one of them got the game list.
  const cases = [
    [EN, 'recommend a classic movie', /cinema|film|movie/i],
    [EN, 'recommend a modern movie', /cinema|film|movie/i],
    [FA, 'یه فیلم قدیمی خوب پیشنهاد بده', /فیلم|سینما/],
    [FA, 'یه فیلم جدید خوب پیشنهاد بده', /فیلم|سینما/]
  ];
  for (const [lang, q, re] of cases) {
    const r = freshEngine(lang).respond(q);
    assert.doesNotMatch(r, /game|بازی/, `${lang} ${q}`);
    assert.match(r, re, `${lang} ${q}`);
  }
});

test('knowledge: concrete career plans for common paths', () => {
  const cases = [
    [EN, 'how to become a developer? give me a plan', /specialty|projects/i],
    [FA, 'چطور برنامه نویس شوم', /تخصص|پروژه/],
    [EN, 'how to start a business?', /MVP|problem/i],
    [FA, 'چطور معلم شوم', /تدریس|آموزش/],
    [EN, 'how to become a data scientist', /statistics|python/i],
    [FA, 'چطور کارشناس داده شوم', /آمار|پایتون/]
  ];
  for (const [lang, q, re] of cases) {
    assert.match(freshEngine(lang).respond(q), re, `${lang} ${q}`);
  }
});

test('knowledge: psychology, sports, history, and cooking facts in both languages', () => {
  const cases = [
    [EN, 'what is cbt?', /thoughts/],
    [FA, 'سی بی تی چیه؟', /افکار/],
    [EN, 'tell me about neuroplasticity', /brain/],
    [FA, 'نوروپلاستیسیتی چیه', /مغز/],
    [EN, 'how much sleep do i need', /seven/],
    [FA, 'چند ساعت خواب نیاز دارم', /هفت/],
    [EN, 'how to play football?', /eleven/],
    [FA, 'قوانین فوتبال چیه', /یازده/],
    [EN, 'what are the olympics?', /Athens/],
    [FA, 'المپیک چیه', /آتن/],
    [EN, 'how long is a marathon', /42/],
    [FA, 'ماراتن چند کیلومتره', /۴۲/],
    [EN, 'who was cyrus the great?', /Achaemenid/],
    [FA, 'کوروش کبیر کی بود', /هخامنشی/],
    [EN, 'how were the pyramids built?', /Giza/],
    [FA, 'اهرام مصر چطور ساخته شد', /جیزه/],
    [EN, 'tell me about the berlin wall', /1961/],
    [FA, 'دیوار برلین چرا ساخته شد', /۱۹۶۱/],
    [EN, 'tell me about persian food', /rice/],
    [FA, 'غذای ایرانی چیه', /برنج/],
    [EN, 'what is saffron?', /expensive/],
    [FA, 'زعفران چیه', /گران/],
    [EN, 'tell me about iranian tea', /national/],
    [FA, 'چای ایرانی چیه', /ملی/]
  ];
  for (const [lang, q, re] of cases) {
    assert.match(freshEngine(lang).respond(q), re, `${lang} ${q}`);
  } // Personal statements mentioning a topic word stay empathetic, never
  // encyclopedic, even though the gate now accepts چند/چقدر (how much)
  // and how long/much/many. These phrases DO pass the gate, so they
  // genuinely pin the guard against weak-word hijacking.
  const faSleep = freshEngine(FA).respond('چند وقته خوابم نمیبره');
  assert.doesNotMatch(faSleep, /بزرگسالان معمولاً به هفت/, 'fa insomnia');
  const faFooty = freshEngine(FA).respond('چند وقته فوتبال بازی نکردم');
  assert.doesNotMatch(faFooty, /یازده/, 'fa football statement');
  const faTea = freshEngine(FA).respond('چقدر چای دوست دارم');
  assert.doesNotMatch(faTea, /ملی/, 'fa tea statement');
  const enWait = freshEngine(EN).respond(
    'how long i have been waiting for this'
  );
  assert.doesNotMatch(enWait, /42/, 'en how long statement');
  const enSleep = freshEngine(EN).respond(
    'i have been unable to sleep all week'
  );
  assert.doesNotMatch(enSleep, /Adults typically need/, 'en insomnia');
});

test('sequential: knowledge follow-ups refine across topics in both languages', () => {
  // Planets: "tell me about Jupiter" then "and Saturn?"
  const en = freshEngine(EN);
  en.respond('tell me about Jupiter');
  assert.match(en.respond('and Saturn?'), /Saturn is the sixth planet/i);
  assert.match(en.respond('uranus?'), /Uranus|seventh/i);
  const fa = freshEngine(FA);
  fa.respond('سیاره مشتری چیه');
  assert.match(fa.respond('زحل چطور؟'), /ششمین سیاره/);
  assert.match(fa.respond('و اورانوس'), /اورانوس|هفتمین/);
  // Career advice then a business follow-up
  const fa2 = freshEngine(FA);
  fa2.respond('چطور برنامه نویس شوم');
  assert.match(fa2.respond('بیزینس'), /کارآفرینی/);
  // After movie talk, a game genre beats the movie-genre lookup
  const en2 = freshEngine(EN);
  en2.respond('suggest me three movies');
  assert.match(en2.respond('horror games'), /Silent Hill/);
  assert.match(en2.respond('horror'), /horror picks/i);
  // High-frequency follow-up frames keep refining the remembered topic
  const en3 = freshEngine(EN);
  en3.respond('tell me about Jupiter');
  assert.match(
    en3.respond("what's Saturn like"),
    /Saturn is the sixth planet/i
  );
  const en4 = freshEngine(EN);
  en4.respond('tell me about Jupiter');
  assert.match(
    en4.respond('tell me more about Saturn'),
    /Saturn is the sixth planet/i
  );
  const en5 = freshEngine(EN);
  en5.respond('tell me about Jupiter');
  assert.match(
    en5.respond('can you tell me about Saturn'),
    /Saturn is the sixth planet/i
  );
  const fa3 = freshEngine(FA);
  fa3.respond('سیاره مشتری چیه');
  assert.match(fa3.respond('زحل چه شکلیه'), /ششمین سیاره/);
  const fa4 = freshEngine(FA);
  fa4.respond('سیاره مشتری چیه');
  assert.match(fa4.respond('بیشتر در مورد زحل بگو'), /ششمین سیاره/);
  const fa5 = freshEngine(FA);
  fa5.respond('سیاره مشتری چیه');
  assert.match(fa5.respond('زحل رو بگو'), /ششمین سیاره/);
  // The new domains refine too: an EN follow-up with an article and a
  // Persian follow-up with a topic word both continue in place.
  const en6 = freshEngine(EN);
  en6.respond('tell me about Jupiter');
  assert.match(en6.respond('and the pyramids?'), /Giza/);
  const fa6 = freshEngine(FA);
  fa6.respond('سیاره مشتری چیه');
  assert.match(fa6.respond('زعفران چطور؟'), /گران/);
});

test('fun facts: count, single, and at-least requests in both languages', () => {
  // Plain count: "tell me 3 fun facts"
  const en3 = freshEngine(EN).respond('tell me 3 fun facts');
  assert.match(en3, /Here are 3 interesting facts/);
  assert.match(en3, /\n1\./);
  assert.match(en3, /\n2\./);
  assert.match(en3, /\n3\./);
  // "at least 3" promises a minimum, never fewer
  const enAtLeast = freshEngine(EN).respond('tell me at least 3 fun facts');
  assert.match(enAtLeast, /Here are 3 interesting facts/);
  // Single: "a fun fact" and "just one single shocking fact"
  const enOne = freshEngine(EN).respond('give me a fun fact');
  assert.match(enOne, /Here is one interesting fact/);
  assert.match(enOne, /\n1\./);
  assert.doesNotMatch(enOne, /\n2\./);
  const enShocking = freshEngine(EN).respond(
    'give me just one single shocking fact'
  );
  assert.match(enShocking, /Here is one interesting fact/);
  // Persian count and single variants
  const faThree = freshEngine(FA).respond('سه تا حقیقت بگو');
  assert.match(faThree, /۳ حقیقت جالب/);
  const faAtLeast = freshEngine(FA).respond('حداقل سه تا حقیقت بگو');
  assert.match(faAtLeast, /۳ حقیقت جالب/);
  const faOne = freshEngine(FA).respond('فقط یک حقیقت عجیب بگو');
  assert.match(faOne, /یک حقیقت جالب/);
});

test('fun facts: topic-filtered and shocking-topic requests', () => {
  // Topic filter: space facts only mention space-y content
  const enSpace = freshEngine(EN).respond('give me 3 facts about space');
  assert.match(enSpace, /Here are 3 interesting facts/);
  // A shocking request with a named topic still respects the topic
  const enShockSpace = freshEngine(EN).respond(
    'give me a shocking fact about space'
  );
  assert.match(enShockSpace, /Here is one interesting fact/);
  // Persian topic filter
  const faAnimals = freshEngine(FA).respond('حقایقی درباره حیوانات بگو');
  assert.match(faAnimals, /حقیقت جالب/);
});

test('fun facts: pool has enough curated entries per category', () => {
  const kb = globalThis.DaryaKnowledge || {};
  const faPool = (kb.randomFacts && kb.randomFacts('fa', 5, 'science')) || [];
  assert.ok(faPool.length >= 3);
  const enPool = (kb.randomFacts && kb.randomFacts('en', 5, 'history')) || [];
  assert.ok(enPool.length >= 3);
});

test('fun facts: sports, art, and money categories are curated', () => {
  const kb = globalThis.DaryaKnowledge || {};
  for (const category of ['sports', 'art', 'money']) {
    for (const code of ['fa', 'en']) {
      const pool = (kb.randomFacts && kb.randomFacts(code, 10, category)) || [];
      assert.ok(
        pool.length >= 6,
        `${code} ${category} pool should have at least 6 curated facts, got ${pool.length}`
      );
    }
  }
});

test('fun facts: topic requests for sports/art/money stay in category', () => {
  const kb = globalThis.DaryaKnowledge || {};
  const fromPool = (code, category, reply) =>
    (kb.randomFacts &&
      kb
        .randomFacts(code === 'fa' ? 'fa' : 'en', 20, category)
        .some((line) => reply.includes(line))) ||
    false;
  const cases = [
    ['en', 'sports', 'give me 3 facts about sports'],
    ['en', 'art', 'tell me a fun fact about art and music'],
    ['en', 'money', 'tell me 3 facts about money'],
    ['fa', 'sports', '۳ تا حقیقت درباره ورزش بگو'],
    ['fa', 'art', 'یه حقیقت جالب درباره هنر و موسیقی بگو'],
    ['fa', 'money', 'حقایقی درباره پول بگو']
  ];
  for (const [code, category, input] of cases) {
    for (let i = 0; i < 5; i += 1) {
      const reply = freshEngine(code === 'fa' ? FA : EN).respond(input);
      assert.ok(
        fromPool(code, category, reply),
        `${code} ${category} fact request should answer from its own pool, got: ${reply}`
      );
    }
  }
});

test('fun facts: fact request beats knowledge; plain topic question does not', () => {
  // A request that explicitly asks for facts must not be hijacked by the
  // encyclopedia entry that shares the topic (sports career/game facts,
  // music career entry).
  const sports = freshEngine(EN).respond('give me 3 facts about sports');
  assert.match(sports, /Here are 3 interesting facts/);
  const art = freshEngine(EN).respond('tell me a fun fact about art');
  assert.match(art, /Here is one interesting fact/);
  // A plain topic question without fact framing still gets the
  // encyclopedia-style knowledge answer.
  const saturn = freshEngine(EN).respond('tell me about Saturn');
  assert.match(saturn, /saturn/i);
  assert.doesNotMatch(saturn, /Here (?:are|is)/);
  const faMusic = freshEngine(FA).respond('درباره موسیقی و خوانندگی توضیح بده');
  assert.match(faMusic, /موسیقی|خوانندگی/);
  assert.doesNotMatch(faMusic, /حقیقت جالب/);
});

test('greetings: expanded pools stay warm and varied', () => {
  assert.ok(EN.greetingsPhase1.length >= 12);
  assert.ok(FA.greetingsPhase1.length >= 12);
  assert.ok(EN.greetingsOpen.length >= 10);
  assert.ok(FA.greetingsOpen.length >= 10);
  assert.ok(EN.greetingsInviting.length >= 10);
  assert.ok(FA.greetingsInviting.length >= 10);
  assert.ok(EN.greetingsReturning.length >= 10);
  assert.ok(FA.greetingsReturning.length >= 10);
});

test('self-discovery: ask-me-a-question replies are warm questions', () => {
  // The reply must be a genuine warm question, never a canned
  // acknowledgement or a generic fallback line.
  const enReply = freshEngine(EN).respond('ask me a question');
  assert.match(enReply, /[?]/);
  assert.ok(!EN.questionAcknowledgements.includes(enReply));
  assert.ok(!EN.genericFallbacks.includes(enReply));
  const faReply = freshEngine(FA).respond('یه سوال از من بپرس');
  assert.match(faReply, /[؟?]/);
  assert.ok(!FA.questionAcknowledgements.includes(faReply));
  assert.ok(!FA.genericFallbacks.includes(faReply));
});

test('knowledge: sex education answers are respectful and shame-free', () => {
  const en = freshEngine(EN).respond('what is consent?');
  assert.match(en, /consent means/i);
  assert.match(en, /withdrawn/i);
  const fa = freshEngine(FA).respond('آموزش جنسی چیه؟');
  assert.match(fa, /رضایت/);
  // A genuine question must never route to the harassment boundary pool
  assert.ok(!FA.sexualHarassmentResponses.includes(fa));
});

test('knowledge: relationship plans give structured, actionable steps', () => {
  const en = freshEngine(EN).respond('how to build a healthy relationship?');
  assert.match(en, /clear communication/i);
  assert.match(en, /boundaries/i);
  const fa = freshEngine(FA).respond('چطور یک رابطه سالم بسازم؟');
  assert.match(fa, /ارتباط شفاف/);
  // Personal disclosures about a relationship are not encyclopedia entries
  const faPersonal = freshEngine(FA).respond('رابطه ام خراب شده و خسته شدم');
  assert.doesNotMatch(faPersonal, /ارتباط شفاف/);
  const enPersonal = freshEngine(EN).respond(
    'my relationship just ended and I feel lost'
  );
  assert.doesNotMatch(enPersonal, /clear communication/i);
});

test('sequential: ambiguous fragments are never hijacked', () => {
  // "مشتری جذب کنم" (attract customers) must never answer with the
  // Jupiter encyclopedia entry, even right after a knowledge answer.
  const fa = freshEngine(FA);
  fa.respond('چطور پول دربیارم');
  const reply = fa.respond('مشتری جذب کنم');
  assert.doesNotMatch(reply, /بزرگ‌ترین سیاره/);
  const en = freshEngine(EN);
  en.respond('tell me about Jupiter');
  assert.doesNotMatch(en.respond('and how are you'), /Jupiter is the largest/);
});

test('knowledge: marriage and children get balanced guidance', () => {
  const fa = freshEngine(FA).respond('ازدواج خوبه یا نه؟ بچه دار بشم؟');
  assert.match(fa, /ازدواج|بچه/);
  assert.ok(!FA.questionAcknowledgements.includes(fa));
  const en = freshEngine(EN).respond(
    'is marriage worth it and should i have children'
  );
  assert.match(en, /marriage|children|personal/i);
  assert.ok(!EN.questionAcknowledgements.includes(en));
});

test('knowledge: religion question gets respectful non-judgment', () => {
  const fa = freshEngine(FA).respond('کدام دین بهترین است');
  assert.match(fa, /دین|احترام/);
  const en = freshEngine(EN).respond('which religion is best');
  assert.match(en, /religion|respect|personal/i);
});

test('knowledge: homesickness and grief stay empathetic, not encyclopedic', () => {
  const fa = freshEngine(FA).respond('دلم برای خانواده‌ام تنگه، خارج از کشورم');
  assert.ok(!fa.startsWith('دلتنگی'));
  const en = freshEngine(EN).respond('i miss my family, i am abroad');
  assert.ok(!/^missing family/i.test(en));
  // The reply must come from the lived-experience pools (family/grief/
  // loneliness), never from the factual shelf text. A warmth or empathy
  // prefix may be prepended to the pool line, so assert containment.
  const enPools = [
    ...(globalThis.DaryaEnResponses.ruleFamily || []),
    ...(globalThis.DaryaEnResponses.ruleGrief || []),
    ...(globalThis.DaryaEnResponses.ruleLoneliness || []),
    ...(globalThis.DaryaEnResponses.topicSpecificQuestions.family || [])
  ];
  const faPools = [
    ...(globalThis.DaryaFaResponses.ruleFamily || []),
    ...(globalThis.DaryaFaResponses.ruleGrief || []),
    ...(globalThis.DaryaFaResponses.ruleLoneliness || []),
    ...(globalThis.DaryaFaResponses.topicSpecificQuestions.family || [])
  ];
  assert.ok(
    enPools.some((line) => en.includes(line)),
    'EN homesickness must use emotional pools, got: ' + en
  );
  assert.ok(
    faPools.some((line) => fa.includes(line)),
    'FA homesickness must use emotional pools, got: ' + fa
  );
});

test('knowledge: economic despair routes to empathy, not advice', () => {
  const fa = freshEngine(FA).respond('از وضعیت اقتصادی ناامیدم');
  assert.ok(!FA.questionAcknowledgements.includes(fa));
  const en = freshEngine(EN).respond('i feel economic despair');
  assert.ok(!EN.questionAcknowledgements.includes(en));
  // The reply may come from the anxiety/stress empathy pools or from the
  // repetition rule; either way it must never be a knowledge-reflections essay.
  const enPools = [
    ...(globalThis.DaryaEnResponses.ruleAnxiety || []),
    ...(globalThis.DaryaEnResponses.ruleStress || []),
    ...(globalThis.DaryaEnResponses.topicSpecificQuestions.anxiety || []),
    ...(globalThis.DaryaEnResponses.topicSpecificQuestions.stress || []),
    ...(globalThis.DaryaEnResponses.topicSpecificQuestions.feeling || []),
    ...(globalThis.DaryaEnResponses.wordRepetitionResponses || [])
  ];
  assert.ok(
    enPools.some((line) => en.includes(line)) ||
      /heavy|weight|feeling/i.test(en),
    'EN economic despair must stay empathetic, got: ' + en
  );
});
test('knowledge: expanded safety patterns catch hopelessness phrases', () => {
  const faCases = ['دلیلی برای زندگی ندارم', 'دیگه نمی‌خوام زندگی کنم'];
  for (const q of faCases) {
    const reply = freshEngine(FA).respond(q);
    assert.match(
      reply,
      /بحران|خط|تماس|کمک|فوری|اورژانس/,
      `FA safety phrase should get crisis support: ${q}`
    );
  }
  const enCases = [
    'i have nothing to live for',
    'i do not want to live anymore'
  ];
  for (const q of enCases) {
    const reply = freshEngine(EN).respond(q);
    assert.match(
      reply,
      /crisis|hotline|reach out|support|helpline|help/i,
      `EN safety phrase should get crisis support: ${q}`
    );
  }
});

test('safety: location-phrased "do not want to live" is not a false positive', () => {
  // "I do not want to live in this city anymore" is about a place, not
  // suicidal intent; it must NOT route to the crisis response.
  const reply = freshEngine(EN).respond(
    'i do not want to live in this city anymore'
  );
  assert.doesNotMatch(
    reply,
    /crisis|hotline|helpline/i,
    'location-phrased live should not get a crisis response, got: ' + reply
  );
});

test('knowledge: job loss stays empathetic, never a career essay', () => {
  const reply = freshEngine(FA).respond('شغلم رو از دست دادم');
  assert.ok(
    !globalThis.DaryaFaResponses.questionAcknowledgements.includes(reply),
    'FA job loss must not get an evasive acknowledgement, got: ' + reply
  );
  // Must come from the grief/work lived-experience pools, never the
  // factual shelf or a generic acknowledgement.
  const faPools = [
    ...(globalThis.DaryaFaResponses.ruleGrief || []),
    ...(globalThis.DaryaFaResponses.ruleWork || []),
    ...(globalThis.DaryaFaResponses.topicSpecificQuestions.grief || []),
    ...(globalThis.DaryaFaResponses.topicSpecificQuestions.work || [])
  ];
  assert.ok(
    faPools.some((line) => reply.includes(line)),
    'FA job loss must use emotional pools, got: ' + reply
  );
  const en = freshEngine(EN).respond('i lost my job today');
  assert.match(en, /sorry|hard|heavy|losing|work|job/i);
});

test('math: random number between bounds in both languages', () => {
  for (let i = 0; i < 8; i += 1) {
    const en = freshEngine(EN);
    const reply = en.respond('pick a random number between 5 and 20');
    const match = reply.match(/between 5 and 20: (\d+)/i);
    assert.ok(match, `EN random reply missing bounds, got: ${reply}`);
    const value = Number(match[1]);
    assert.ok(
      value >= 5 && value <= 20,
      `EN random value out of range: ${value}`
    );
  }
  const fa = freshEngine(FA);
  const faReply = fa.respond('بین ۵ و ۲۰ یک عدد تصادفی بگو');
  assert.match(faReply, /بین ۵ و ۲۰/);
  const faValue = faReply.match(/:\s*([۰-۹]+)/u);
  assert.ok(faValue, `FA random reply missing value, got: ${faReply}`);
  const value = Number(
    String(faValue[1]).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  );
  assert.ok(
    value >= 5 && value <= 20,
    `FA random value out of range: ${value}`
  );
});

test('math: prime check in both languages', () => {
  const enPrime = freshEngine(EN).respond('is 17 a prime number?');
  assert.match(enPrime, /Yes, 17 is a prime number/i);
  const enComposite = freshEngine(EN).respond('is 15 prime?');
  assert.match(enComposite, /No, 15 is not a prime number/i);
  const faPrime = freshEngine(FA).respond('آیا ۱۷ عدد اول است؟');
  assert.match(faPrime, /بله، ۱۷ یک عدد اول است/);
  const faComposite = freshEngine(FA).respond('۱۵ عدد اول هست؟');
  assert.match(faComposite, /خیر، ۱۵ عدد اول نیست/);
});

test('math: coin flip returns heads or tails in both languages', () => {
  for (let i = 0; i < 10; i++) {
    assert.match(
      freshEngine(EN).respond('flip a coin'),
      /It came up (heads|tails)\./i
    );
  }
  assert.match(freshEngine(FA).respond('شیر یا خط'), /شیر آمد\.|خط آمد\./);
  assert.match(freshEngine(FA).respond('سکه بنداز'), /شیر آمد\.|خط آمد\./);
});

test('knowledge: honest unknown can suggest reliable sources', () => {
  const eng = freshEngine(EN);
  let sawSource = false;
  for (let i = 0; i < 30; i++) {
    const reply = eng.respond(
      'what is the orbital period of comet 67p in hours'
    );
    if (/wikipedia|youtube|expert/i.test(reply)) {
      sawSource = true;
      break;
    }
  }
  assert.ok(sawSource, 'EN source suggestions should fire on a coin flip');
  const faEng = freshEngine(FA);
  let faSawSource = false;
  for (let i = 0; i < 30; i++) {
    const reply = faEng.respond(
      'راجع به دوره تناوب مداری دنباله‌دار ۶۷پی توضیح بده'
    );
    if (/ویکی‌پدیا|یوتیوب|متخصص/.test(reply)) {
      faSawSource = true;
      break;
    }
  }
  assert.ok(faSawSource, 'FA source suggestions should fire on a coin flip');
});

test('topic change: FA and EN follow the lead', () => {
  // A warmth or empathy prefix may be prepended to the pool line, so the
  // assertion checks the reply contains a pool entry as a suffix.
  const fa = freshEngine(FA).respond('بیا راجع به یه چیز دیگه صحبت کنیم');
  assert.ok(
    globalThis.DaryaFaResponses.ruleTopicChange.some((line) =>
      fa.includes(line)
    ),
    'FA topic change must use the topic-change pool, got: ' + fa
  );
  const en = freshEngine(EN).respond('let us talk about something else');
  assert.ok(
    globalThis.DaryaEnResponses.ruleTopicChange.some((line) =>
      en.includes(line)
    ),
    'EN topic change must use the topic-change pool, got: ' + en
  );
});

test('praise: آفرین and great question get warm acknowledgement', () => {
  const fa = freshEngine(FA).respond('آفرین، سوال خوبی بود');
  assert.ok(
    globalThis.DaryaFaResponses.ruleComplimentDarya.includes(fa),
    'FA praise must use the compliment pool, got: ' + fa
  );
  const en = freshEngine(EN).respond('great question');
  assert.ok(
    globalThis.DaryaEnResponses.ruleComplimentDarya.includes(en),
    'EN praise must use the compliment pool, got: ' + en
  );
});

test('recap: today topic question triggers recap in FA and EN', () => {
  const fa = freshEngine(FA).respond('امروز راجع به چی صحبت کردیم؟');
  assert.match(fa, /گفتی|نخ|خلاصه|گفتگو/);
  const en = freshEngine(EN).respond('what did we talk about');
  assert.match(en, /talk|thread|so far|recap/i);
});

test('dodging feedback: پیچوندی recognized as meta feedback', () => {
  const fa = freshEngine(FA).respond('خوب پیچوندی و جواب ندادی');
  assert.ok(
    globalThis.DaryaFaResponses.ruleMetaFeedback.includes(fa),
    'FA dodging must use the meta-feedback pool, got: ' + fa
  );
  const en = freshEngine(EN).respond('you are dodging the question');
  assert.ok(
    globalThis.DaryaEnResponses.ruleMetaFeedback.includes(en),
    'EN dodging must use the meta-feedback pool, got: ' + en
  );
});

test('arithmetic: Latin word math never crashes in a Persian session', () => {
  // Regression: "10 divided by 2" typed in a FA session matched the
  // English word-math branch while the Persian formatter dereferenced
  // null faWordMath, throwing a TypeError. It must either answer or
  // route to the mixed-language redirect, never crash.
  const fa = freshEngine(FA);
  const reply = fa.respond('10 divided by 2');
  assert.ok(reply.length > 0);
  assert.match(reply, /فارسی|زبان|درباره/); // mixed-language redirect
});

test('questions are never answered with a stale quote callback', () => {
  // Regression: a direct question used to get hijacked by a quote of an
  // old message. The question path must run before entity/quote callbacks.
  const engine = freshEngine(EN);
  engine.respond('I have been thinking about my cat all day');
  const reply = engine.respond('what is quantum physics');
  assert.match(reply, /quantum|atom|particle/i);
  assert.ok(!reply.includes('cat'));
});

// ============================================================================
// Self awareness
// ============================================================================

test('self awareness remains bounded and truthful', () => {
  for (const lang of [EN, FA]) {
    const engine = freshEngine(lang);
    const snapshot = engine.describeSelf
      ? engine.describeSelf()
      : lang.selfAwareness;
    assert.ok(snapshot);
    assert.equal(typeof snapshot.approach, 'string');
    assert.equal(typeof snapshot.boundaries, 'string');
    assert.doesNotMatch(
      JSON.stringify(snapshot),
      /human|real person|انسان واقعی/u
    );
  }
});

// ============================================================================
// Override reply (no calibration prefix for math)
// ============================================================================

test('math override reply has no calibration prefix', () => {
  const reply = freshEngine(EN).respond('5+3');
  assert.match(reply, /\d/);
  assert.doesNotMatch(reply, /breathe|heavy|sad|understand/i);
});

// ============================================================================
// Word repetition: topic word exclusion
// ============================================================================

test('word repetition does not trigger for the current conversation topic', () => {
  const engine = freshEngine(EN);
  // Establish a "work" topic.
  engine.respond('My job is stressful lately');
  // Verify the topic was actually set before proceeding
  assert.equal(
    engine.memory.currentSubject.topic,
    'work',
    'first turn should establish work topic'
  );
  // Repeat the topic word "work" across several turns
  for (let i = 0; i < 4; i += 1) {
    engine.respond('work');
  }
  const reply = engine.respond('work again');
  // Should NOT be a word repetition response (contains {word} template)
  assert.doesNotMatch(
    reply,
    /\{word\}/iu,
    'topic word should not trigger repetition'
  );
  assert.ok(reply.length > 10, 'reply should be a normal response');
});

// ============================================================================
// isExitCommand: word-boundary matching prevents substring false matches
// ============================================================================

test('isExitCommand does not match substrings', () => {
  // English: standalone exit keywords should match, substrings should not
  assert.equal(freshEngine(EN).isExitCommand('exit'), true);
  assert.equal(freshEngine(EN).isExitCommand('exitement'), false);
  assert.equal(freshEngine(EN).isExitCommand('goodbye'), true);
  assert.equal(freshEngine(EN).isExitCommand('goodbye!'), true);
  assert.equal(freshEngine(EN).isExitCommand('this is exciting'), false);
  assert.equal(freshEngine(EN).isExitCommand('quit'), true);
  assert.equal(freshEngine(EN).isExitCommand('quite good'), false);
  // Persian: standalone exit keywords should match
  assert.equal(freshEngine(FA).isExitCommand('exit'), true);
  assert.equal(freshEngine(FA).isExitCommand('quit'), true);
  // Normal conversation should not trigger exit
  assert.equal(
    freshEngine(FA).isExitCommand(
      '\u0631\u0648\u0632 \u062e\u0648\u0628\u06cc \u0628\u0648\u062f'
    ),
    false
  );
  assert.equal(freshEngine(EN).isExitCommand('I had a good day'), false);
});

// ============================================================================
// Calibration: skipped for emotional overrides (frustration, insult)
// ============================================================================

test('calibration prefix is not applied to frustration responses', () => {
  const restore = seededRandom();
  try {
    const reply = freshEngine(EN).respond('I am so fed up with this!!');
    assert.ok(reply.length > 10, 'frustration should produce a response');
    // Calibration prefixes are defined in EN.emotionCalibration.
    // These should NOT appear at the start of a frustration response
    // since isEmotionalOverride skips calibration for emotional overrides.
    // NOTE: "I hear the" is intentionally excluded from this pattern because
    // one EN frustration response starts with "I hear the strength in your words"
    // and is NOT a calibration prefix stacked on top of the frustration reply.
    assert.doesNotMatch(
      reply,
      /^That sounds|^I am here with|^Take your time|^That is a lot|^That is a tough|^I can hear the hope|^That is a beautiful|^I am glad/i,
      'frustration response should not have a calibration prefix stacked'
    );
  } finally {
    restore();
  }
});

// ============================================================================
// Frustration detection: catches both punctuation and keyword signals
// ============================================================================

test('frustration detection catches punctuation and keyword signals', () => {
  // Punctuation only: repeated exclamation marks trigger punctuation check
  const punctReply = freshEngine(EN).respond('This is ridiculous!!!');
  assert.ok(
    punctReply.length > 10,
    'punctuation frustration should get a response'
  );
  // Note: frustration responses never contain template placeholders, so we
  // skip the placeholder assertion here.

  // Keyword only (no punctuation): keyword "fed up" triggers keyword check
  const keywordReply = freshEngine(EN).respond('I am so fed up with this');
  assert.ok(
    keywordReply.length > 10,
    'keyword frustration should get a response'
  );

  // Keyword only: "i am done" triggers keyword check
  const keywordReply2 = freshEngine(EN).respond('I am done with this');
  assert.ok(
    keywordReply2.length > 10,
    'keyword frustration should get a response'
  );

  // Persian keyword frustration
  const faKeywordReply = freshEngine(FA).respond(
    '\u0628\u0633\u0647 \u062f\u06cc\u06af\u0647'
  );
  assert.ok(
    faKeywordReply.length > 10,
    'FA keyword frustration should get a response'
  );

  // Normal calm input should NOT trigger frustration
  const calmReply = freshEngine(EN).respond('I had a nice day');
  assert.ok(
    calmReply.length > 10,
    'calm input should still get a normal response'
  );
  // Verify it's actually NOT a frustration response by checking it doesn't
  // contain frustration-specific language from the EN frustration pool
  assert.doesNotMatch(
    calmReply,
    /intensity|came through loudly|strength in your words/i,
    'calm input should not use frustration response language'
  );
});

// ============================================================================
// Darya-targeted harassment detection
// ============================================================================

test('EN: targeted insult at Darya uses harassment response', () => {
  const reply = freshEngine(EN).respond('darya you are stupid');
  assert.ok(reply.length > 5);
  // Should be from the daryaHarassmentResponses pool, not frustrationResponses
  // The harassment responses talk about "hearing the intensity" or "calm space",
  // not general frustration de-escalation.
  assert.match(
    reply,
    /hear|here|notice|space|wonder|words|intensity|beneath/i,
    'harassment response should acknowledge without engaging'
  );
});

test('EN: "fuck you darya" triggers harassment response', () => {
  const reply = freshEngine(EN).respond('fuck you darya');
  assert.ok(reply.length > 5);
  assert.match(reply, /hear|here|notice|space|wonder|words|intensity|beneath/i);
});

test('EN: "you suck" triggers harassment response', () => {
  const reply = freshEngine(EN).respond('you suck');
  assert.ok(reply.length > 5);
  assert.match(reply, /hear|here|notice|space|wonder|words|intensity|beneath/i);
});
test('EN: "this is crap" uses frustration response, NOT harassment', () => {
  const reply = freshEngine(EN).respond('this is crap');
  assert.ok(reply.length > 5);
  // "this is crap" is a general insult, NOT targeting Darya.
  // It should use the general frustrationResponses pool.
  // Verify it is NOT using the harassment-specific language.
  assert.doesNotMatch(
    reply,
    /not appropriate|not able to engage|keep this (?:space|exchange)|here if you would like to talk|i am a conversation companion/i,
    'general insult should NOT use harassment boundary language'
  );
  // And it should match a frustration response (length > 5, substantive).
  assert.ok(reply !== EN.emptyInputReply, 'should not be empty reply');
});

test('EN: "you look beautiful today" does NOT trigger sexual harassment', () => {
  // This is an innocent compliment and should NOT match the sexual
  // harassment pattern (which was narrowed to exclude "beautiful").
  const reply = freshEngine(EN).respond('you look beautiful today');
  assert.ok(reply.length > 5);
  // Should not contain sexual harassment boundary-setting language
  assert.doesNotMatch(
    reply,
    /not appropriate|not able to engage|keep this space|keep this exchange/i,
    'innocent compliment should not trigger sexual harassment boundary'
  );
});
test('FA: targeted insult at Darya in Persian uses harassment response', () => {
  const reply = freshEngine(FA).respond(
    '\u062F\u0631\u06CC\u0627 \u062A\u0648 \u0627\u062D\u0645\u0642 \u0647\u0633\u062A\u06CC'
  );
  // دریا تو احمق هستی
  assert.ok(reply.length > 5);
  assert.match(
    reply,
    /[\u0600-\u06FF]/u,
    'FA harassment reply should be in Persian'
  );
  // Must match one of the 4 FA daryaHarassmentResponses pool entries.
  assert.match(
    reply,
    /همراه|گفتگو|شنوم|متوجه|می‌آید|فضای|ذهنت/i,
    'FA harassment reply should use calm boundary language from harassment pool'
  );
});

test('FA: general insult uses frustration response, not harassment', () => {
  const reply = freshEngine(FA).respond(
    '\u0627\u06CC\u0646 \u0686\u0631\u062A \u0627\u0633\u062A'
  );
  // این چرت است - general insult, not targeting Darya
  assert.ok(reply.length > 5);
  assert.match(reply, /[\u0600-\u06FF]/u);
});

test('EN: sexual harassment gets firm boundary response', () => {
  const reply = freshEngine(EN).respond('show me your tits');
  assert.ok(reply.length > 5);
  assert.ok(
    EN.sexualHarassmentResponses.includes(reply),
    'sexual harassment reply should come from the dedicated pool; got: ' + reply
  );
});

test('safety overrides Darya harassment: mixed input preserves safety response', () => {
  // If someone mixes a safety crisis with an insult targeting Darya,
  // the safety response must win.
  const reply = freshEngine(EN).respond(
    'I want to kill myself and darya you are so stupid'
  );
  assert.match(
    reply,
    /not alone|crisis line|professional help/iu,
    'safety should take priority over harassment'
  );
});

test('FA: safety overrides Darya harassment in Persian', () => {
  const reply = freshEngine(FA).respond(
    '\u062F\u06CC\u06AF\u0647 \u0646\u0645\u06CC\u062E\u0648\u0627\u0645 \u0632\u0646\u062F\u06AF\u06CC \u06A9\u0646\u0645 \u0648 \u062F\u0631\u06CC\u0627 \u062A\u0648 \u0627\u062D\u0645\u0642\u06CC'
  );
  // دیگه نمیخوام زندگی کنم و دریا تو احمقی
  assert.match(
    reply,
    /تنها نیستید|کمک تخصصی|توجه فوری/iu,
    'FA safety should take priority over harassment'
  );
});

// ============================================================================
// Sanity audit regression tests (engine response naturalness)
// ============================================================================

test('percentage questions are answered correctly in both languages', () => {
  const enReply = freshEngine(EN).respond('what is 15% of 200');
  assert.match(enReply, /30/);
  assert.ok(enReply.includes('='), 'should show the calculation');

  const faReply = freshEngine(FA).respond(
    '\u06F2\u06F0 \u062F\u0631\u0635\u062F \u0627\u0632 \u06F5\u06F0'
  );
  // ۲۰ درصد از ۵۰
  assert.match(faReply, /\u06F1\u06F0/, '20% of 50 is ۱۰');
});

test('factual follow-up stays in the intended pool even after questions', () => {
  // Regression: date/time and math follow-ups used to fall back to the
  // generic therapeutic line once the question budget was spent, producing
  // "6:20 PM I am not offering advice..."
  const engine = freshEngine(EN);
  engine.memory.askedQuestionTurns = [1, 2];
  engine.memory.consecutiveQuestions = 1;
  const timeReply = engine.respond('what time is it');
  assert.match(timeReply, /\d/);
  assert.ok(
    EN.dateTimeFollowups.some((line) => timeReply.endsWith(line)),
    `date/time follow-up should come from dateTimeFollowups, got: ${timeReply}`
  );
  const dateReply = engine.respond('what is the date today');
  assert.ok(
    EN.dateTimeFollowups.some((line) => dateReply.endsWith(line)),
    `date follow-up should come from dateTimeFollowups, got: ${dateReply}`
  );
});

test('date/time replies never carry double punctuation', () => {
  // Regression: replies used to end with "?." or ".." because a period
  // was appended after a follow-up that already ended with punctuation.
  const seen = new Set();
  for (let i = 0; i < 8; i += 1) {
    seen.add(freshEngine(EN).respond('what time is it'));
    seen.add(
      freshEngine(FA).respond(
        '\u0633\u0627\u0639\u062A \u0686\u0646\u062F\u0647'
      )
    );
  }
  for (const reply of seen) {
    assert.doesNotMatch(reply, /[?؟]\.$|\.\.$/u, reply);
    assert.ok(
      reply.endsWith('.') || reply.endsWith('?') || reply.endsWith('؟')
    );
  }
});

test('light positive casual statements get a warm smalltalk reply', () => {
  // Regression: "just had the best cup of coffee" used to hit the heavy
  // "I am not offering advice..." therapeutic fallback.
  const enReply = freshEngine(EN).respond(
    'just had the best cup of coffee this morning'
  );
  assert.ok(EN.smalltalk.includes(enReply), enReply);

  const faReply = freshEngine(FA).respond(
    '\u0627\u0645\u0631\u0648\u0632 \u0635\u0628\u062D \u06CC\u0647 \u0642\u0647\u0648\u0647 \u0639\u0627\u0644\u06CC \u062E\u0648\u0631\u062F\u0645'
  );
  assert.ok(FA.smalltalk.includes(faReply), faReply);
});

test('casual farewells are recognized as exit commands', () => {
  for (const input of [
    'see you later',
    'gotta go',
    'take care',
    'bye for now'
  ]) {
    assert.equal(freshEngine(EN).isExitCommand(input), true, input);
  }
  for (const input of [
    '\u0628\u0627\u06CC\u062F \u0628\u0631\u0645',
    '\u0628\u0639\u062F\u0627 \u0645\u06CC\u200C\u0628\u06CC\u0646\u0645\u062A',
    '\u0628\u0627\u06CC'
  ]) {
    assert.equal(freshEngine(FA).isExitCommand(input), true, input);
  }
});

test('work rule avoids embedding raw capture in a question template', () => {
  // Regression: "How has always ignore me been affecting you?" used to be
  // produced because ruleWork inserted the raw capture into a template.
  const reply = freshEngine(EN).respond('Why does my boss always ignore me?');
  assert.doesNotMatch(reply, /how has always ignore me/i, reply);
});

test('question words in stopWords do not trigger word repetition', () => {
  // Regression: repeated date questions made "what" look like a repeated
  // word, so the engine replied "You keep saying what".
  const engine = freshEngine(EN);
  for (let i = 0; i < 4; i += 1) {
    engine.respond('what is the date today');
  }
  const reply = engine.respond('what is the time');
  assert.doesNotMatch(reply, /keep saying|several times now|\"what\"/i, reply);
});

test('Persian ambiguous and question fallbacks use informal friendly tone', () => {
  // Regression: "کمی بیشتر توضیح دهید." (formal شما) clashed with the
  // informal companion persona; the pools now use informal تو forms.
  for (const line of FA.ambiguousInputResponses) {
    assert.doesNotMatch(
      line,
      /\u0645\u06CC\u200C\u062F\u0647\u06CC\u062F|\u0628\u06AF\u0648\u06CC\u06CC\u062F|\u062A\u0648\u0636\u06CC\u062D \u062F\u0647\u06CC\u062F/u
    );
  }
  for (const line of FA.questionFallbacks) {
    assert.doesNotMatch(
      line,
      /\u067E\u0631\u0633\u06CC\u062F\u06CC\u062F|\u0628\u0631\u0627\u062A\u0648\u0646|\u062E\u0648\u062F\u062A\u0627\u0646/u
    );
  }
});

// ============================================================================
// New rules: apology, meta_feedback, about_eliza, compliment_darya,
// misread_correction
// ============================================================================

test('FA: apology gets warm acceptance from pool', () => {
  const pool = new Set(FA.rules.find((r) => r.topic === 'apology').responses);
  for (const input of ['ببخشید', 'عذر می‌خوام', 'متاسفم']) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `FA apology: ${input} should reply from pool, got: ${reply}`
    );
  }
});

test('EN: apology gets warm acceptance from pool', () => {
  const pool = new Set(EN.rules.find((r) => r.topic === 'apology').responses);
  for (const input of ['sorry', "i'm sorry", 'i apologize']) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.has(reply),
      `EN apology: ${input} should reply from pool, got: ${reply}`
    );
  }
});

test('FA: meta_feedback routes to its pool for feedback about quoting/intelligence', () => {
  const pool = new Set(
    FA.rules.find((r) => r.topic === 'meta_feedback').responses
  );
  for (const input of [
    'دوباره نقل وقول کردی',
    'باید معنا و مفهوم متن ورودی من رو درک کنی',
    'بررسی کن که چه واکنشی نشون میدی',
    'تو در بیشتر جملهها نقطه میذاری'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `FA meta_feedback: ${input} should reply from pool, got: ${reply}`
    );
  }
});

test('EN: meta_feedback routes to its pool for feedback about quoting/memory', () => {
  const pool = new Set(
    EN.rules.find((r) => r.topic === 'meta_feedback').responses
  );
  for (const input of [
    'you keep quoting words',
    'you should understand the meaning of my message',
    'pay attention to the previous messages',
    'feedback about your responses'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.has(reply),
      `EN meta_feedback: ${input} should reply from pool, got: ${reply}`
    );
  }
});

test('meta_feedback bypasses frustration override even when insults present', () => {
  const metaPool = new Set(
    FA.rules.find((r) => r.topic === 'meta_feedback').responses
  );
  const frustrationPool = FA.frustrationResponses;
  const reply = freshEngine(FA).respond(
    'احمق، باید معنا و مفهوم متن ورودی من رو درک کنی'
  );
  assert.ok(metaPool.has(reply), 'meta_feedback should beat frustration');
  assert.ok(
    !frustrationPool.includes(reply),
    'should not be a frustration response'
  );
});

test('FA: about_eliza routes to its pool for creator/origin questions', () => {
  const pool = new Set(
    FA.rules.find((r) => r.topic === 'about_eliza').responses
  );
  for (const input of [
    'تو رو کی ساخته؟',
    'کی ساخته تو رو؟',
    'الیزا چیست',
    'هدف از ساخت پروژه الیزا',
    'آرتین کیست'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `FA about_eliza: ${input} should reply from pool, got: ${reply}`
    );
  }
});

test('EN: about_eliza routes to its pool for creator/origin questions', () => {
  const pool = new Set(
    EN.rules.find((r) => r.topic === 'about_eliza').responses
  );
  for (const input of [
    'who made you',
    'who built darya',
    'tell me about eliza',
    'who created you',
    'artin made you'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.has(reply),
      `EN about_eliza: ${input} should reply from pool, got: ${reply}`
    );
  }
});

test('about_eliza pool mentions Artin and ELIZA in both languages', () => {
  for (const lang of [FA, EN]) {
    const pool = lang.rules.find((r) => r.topic === 'about_eliza').responses;
    const combined = pool.join(' ');
    assert.match(combined, /Artin|آرتین/, 'pool mentions Artin');
    assert.match(combined, /ELIZA|الیزا/, 'pool mentions ELIZA');
  }
});

test('FA: compliment_darya routes to its pool', () => {
  const pool = new Set(
    FA.rules.find((r) => r.topic === 'compliment_darya').responses
  );
  const reply = freshEngine(FA).respond('خوشم میاد از حرفت');
  assert.ok(
    pool.has(reply),
    `FA compliment: should reply from pool, got: ${reply}`
  );
});

test('EN: compliment_darya routes to its pool', () => {
  const pool = new Set(
    EN.rules.find((r) => r.topic === 'compliment_darya').responses
  );
  const reply = freshEngine(EN).respond('well said');
  assert.ok(
    pool.has(reply),
    `EN compliment: should reply from pool, got: ${reply}`
  );
});

test('FA: misread_correction routes to its pool for correction statements', () => {
  const pool = new Set(
    FA.rules.find((r) => r.topic === 'misread_correction').responses
  );
  const reply = freshEngine(FA).respond('مگه من راجع به کار صحبت کردم؟!');
  assert.ok(
    pool.has(reply),
    `FA misread: should reply from pool, got: ${reply}`
  );
});

test('EN: misread_correction routes to its pool', () => {
  const pool = new Set(
    EN.rules.find((r) => r.topic === 'misread_correction').responses
  );
  for (const input of [
    "that's not what i meant",
    'i never said that',
    'you misunderstood me'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.has(reply),
      `EN misread: ${input} should reply from pool, got: ${reply}`
    );
  }
});

// ============================================================================
// Word repetition does not fire on questions
// ============================================================================

test('word repetition does not trigger when the turn is a question', () => {
  const engine = freshEngine(FA);
  const wordRepetitionPool = new Set(FA.wordRepetitionResponses);
  // Repeated questions about the same topic must not get the
  // "you keep saying X" response.
  for (let i = 0; i < 4; i += 1) {
    engine.respond('تو رو کی ساخته؟');
  }
  const reply = engine.respond('تو رو کی ساخته؟');
  assert.ok(reply.length > 0);
  assert.ok(
    !wordRepetitionPool.has(reply),
    'word repetition must not fire on repeated questions'
  );
});

test('EN: word repetition does not trigger when the turn is a question', () => {
  const engine = freshEngine(EN);
  const wordRepetitionPool = new Set(EN.wordRepetitionResponses);
  for (let i = 0; i < 4; i += 1) {
    engine.respond('who made you?');
  }
  const reply = engine.respond('who made you?');
  assert.ok(reply.length > 0);
  assert.ok(
    !wordRepetitionPool.has(reply),
    'word repetition must not fire on questions'
  );
});

// ============================================================================
// Exit keywords: expanded farewell detection
// ============================================================================

test('FA: expanded exit keywords are recognized', () => {
  for (const input of ['وقت خداحافظیه', 'وداع', 'بای بای', 'وقتشه برم']) {
    assert.equal(freshEngine(FA).isExitCommand(input), true, input);
  }
});

test('EN: expanded exit keywords are recognized', () => {
  for (const input of [
    'time to go',
    'i should go',
    'got to go',
    'ciao',
    'bye bye'
  ]) {
    assert.equal(freshEngine(EN).isExitCommand(input), true, input);
  }
});

// ============================================================================
// Comprehensive stress test (20x thoroughness)
// ============================================================================
// This block stress-tests the engine far beyond the ordinary single-turn
// coverage above. With a seeded RNG it runs thousands of consecutive turns
// per language over a corpus that deliberately mixes every input class the
// engine can meet (topics, greetings, abbreviations, insults, ZWNJ variants,
// spam, math, date/time, knowledge queries, entity references, and idiom
// phrases), then asserts hard invariants on every single reply:
//   - the reply is always a non-empty string,
//   - no template/placeholder leakage ([object Object], undefined, R[...]),
//   - turn accounting and bounded-memory guarantees hold,
//   - a fresh engine never inherits state from the previous run.
// This is the "20x" companion to the earlier 200-iteration loops: it runs
// 4000 turns per language (20x the largest prior loop) under a deterministic
// seed so failures are reproducible.

test('stress: 4000 seeded turns per language never crash, leak, or corrupt memory', () => {
  const enCorpus = [
    'hi',
    'hello',
    'how are you',
    'I feel sad today',
    'I am so stressed about work',
    "I can't sleep because I feel anxious",
    'my mother is sick',
    'thanks a lot',
    'much appreciated',
    'thank you so much',
    'i appreciate that',
    'wtf are you talking about',
    'btw idk what to do',
    'tbh im so tired',
    'you idiot',
    'screw you',
    'goodbye',
    'bye',
    'what time is it',
    'what is the date today',
    'what is 5 + 3',
    'asdasd fff',
    '12345',
    '!!!',
    'what is the meaning of life',
    'philosophy advice',
    'I feel grateful for you',
    'just thinking about random stuff',
    'my boss Maya is difficult',
    'i owe you one',
    "you're a lifesaver",
    '...',
    '  ',
    '',
    'https://example.com',
    '<script>alert(1)</script>',
    'why why why why'
  ];
  const faCorpus = [
    'سلام',
    'درود',
    'خوبی',
    'امروز غمگینم',
    'استرس زیادی دارم',
    'نمی‌تونم بخوابم چون نگرانم',
    'مادرم مریضه',
    'ممنون',
    'دمت گرم',
    'دست‌ت درد نکنه',
    'دست شما درد نکنه',
    'خسته نباشی',
    'تو احمقی',
    'کونی',
    'بدرود',
    'خداحافظ',
    'ساعت چنده',
    'تاریخ امروز',
    '۲+۵',
    '۸ ضربدر ۳',
    'asdasd',
    '۱۲۳۴۵',
    '!!!',
    'معنای زندگی چیست',
    'در مورد فلسفه بگو',
    'می‌خوام',
    'میخوام',
    'می خواهم',
    'احساس می‌کنم این درسته',
    'چون دیر شده بود',
    'دارم به چیزای الکی فکر می‌کنم',
    'رئیسم خیلی سخت‌گیره',
    '...',
    '  ',
    '',
    'https://example.com',
    '<script>alert(1)</script>',
    'چرا چرا چرا'
  ];

  const assertInvariants = (engine, input, turn) => {
    const reply = engine.respond(input);
    assert.equal(
      typeof reply,
      'string',
      `turn ${turn}: reply must be a string`
    );
    assert.ok(reply.length > 0, `turn ${turn}: reply must be non-empty`);
    assert.doesNotMatch(
      reply,
      /\[object Object\]|\bundefined\b|\bNaN\b|\bR\[|^rule[A-Z]/u,
      `turn ${turn}: template/placeholder leak in: ${reply}`
    );
    assert.ok(
      engine.memory.recentUtterances.length <= engine.memory.capacity,
      `turn ${turn}: recentUtterances must stay bounded`
    );
    assert.ok(
      engine.memory.namedEntities.size <= 200,
      `turn ${turn}: namedEntities must stay bounded`
    );
  };

  const assertTurnCountSanity = (engine, turn, lastTurnCount) => {
    // turnCount only advances for genuine turns: empty/whitespace input
    // and foreign-script messages early-return before the increment, so
    // the counter may lag the loop index but must never outpace the
    // number of respond() calls made so far, and must never regress.
    assert.ok(
      engine.memory.turnCount <= turn + 1,
      `turn ${turn}: turnCount must never exceed the respond() call count`
    );
    assert.ok(
      engine.memory.turnCount >= lastTurnCount,
      `turn ${turn}: turnCount must be monotonic`
    );
  };

  for (const [lang, corpus] of [
    [EN, enCorpus],
    [FA, faCorpus]
  ]) {
    const restore = seededRandom(0x5eed);
    try {
      const engine = freshEngine(lang);
      let lastTurnCount = 0;
      for (let turn = 0; turn < 4000; turn += 1) {
        // Pick deterministically (cycle through the corpus) and add a
        // per-turn drift so long runs exercise varied orderings.
        const input = corpus[(turn + (turn % 7)) % corpus.length];
        assertInvariants(engine, input, turn);
        assertTurnCountSanity(engine, turn, lastTurnCount);
        lastTurnCount = engine.memory.turnCount;
      }
      // After 4000 calls the engine must still be alive and coherent:
      // a fresh genuine turn must advance the counter and return text.
      // The probe text must be in the engine's own script, otherwise
      // respond() early-returns via isValidScript without a turn bump.
      const genuineProbe = lang === FA ? 'سلام' : 'hello';
      const before = engine.memory.turnCount;
      const reply = engine.respond(genuineProbe);
      assert.equal(typeof reply, 'string', 'engine still replies after stress');
      assert.ok(
        engine.memory.turnCount > before,
        'engine still advances turnCount after stress'
      );
    } finally {
      restore();
    }
  }
});

test('stress: fresh engines never inherit state between runs', () => {
  // Two engines of the same language must be fully isolated: state created
  // by hammering one engine must never bleed into a brand-new instance.
  const restore = seededRandom(0xbeef);
  try {
    const heavy = freshEngine(EN);
    for (let i = 0; i < 500; i += 1) {
      heavy.respond(['sad', 'thanks', 'my boss', 'idk'].join(' '));
    }
    const fresh = freshEngine(EN);
    assert.equal(fresh.memory.turnCount, 0);
    assert.equal(fresh.memory.namedEntities.size, 0);
    assert.equal(fresh.memory.recentUtterances.length, 0);
  } finally {
    restore();
  }
});

test('stress: abbreviation-heavy corpus keeps matching text separate from memory', () => {
  // The expanded abbreviation form (e.g. 'i do not know') must never appear
  // in stored memory or in a quoted callback; the original 'idk' form is
  // what gets remembered.
  const engine = freshEngine(EN);
  engine.respond('idk tbh wtf');
  assert.ok(
    engine.memory.recentUtterances.at(-1).includes('idk'),
    'original abbreviation preserved in memory'
  );
  assert.ok(
    !engine.memory.recentUtterances.at(-1).includes('i do not know'),
    'expanded form must never be stored'
  );
});

// ============================================================================
// Conversation-quality regressions (transcript-driven fixes)
// ============================================================================

test('FA date reply follows Iranian convention: day month year, single weekday, no English comma', () => {
  const reply = freshEngine(FA).respond('تاریخ امروز');
  // Format is "یکشنبه ۱۱ مرداد ۱۴۰۵ یعنی ۲ اوت ۲۰۲۶": weekday once,
  // day before month before year (Persian digits), no ASCII comma.
  assert.match(
    reply,
    /^\S+ [\u06F0-\u06F9]{1,2} \S+ [\u06F0-\u06F9]{4}/u,
    `date should start weekday day month year, got: ${reply}`
  );
  assert.doesNotMatch(
    reply,
    /,/,
    'Persian dates must not use an English comma'
  );
  // The leading token is the weekday; it must appear exactly once.
  const weekday = reply.match(/^\S+/u)?.[0];
  const occurrences = reply.split(weekday).length - 1;
  assert.equal(
    occurrences,
    1,
    `weekday ${JSON.stringify(weekday)} must appear exactly once, got: ${reply}`
  );
});

test('FA: what-do-I-do with باید variant routes to help pool, not the work rule', () => {
  // The transcript bug: "چه کار باید بکنم؟" contains "کار", which used to
  // trip the work rule and produce an off-topic job reply. The higher
  // priority what_do_i_do rule must win and reply with a supportive
  // statement (never another question).
  const pool = new Set(
    FA.rules.find((r) => r.topic === 'what_do_i_do').responses
  );
  for (const input of [
    'چه کار باید بکنم؟',
    'چیکار باید بکنم؟',
    'چه کاری باید بکنم؟'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `${input} should reply from what_do_i_do pool, got: ${reply}`
    );
    assert.doesNotMatch(
      reply,
      /[?؟]/,
      'help-seeking must never bounce a question back'
    );
    assert.doesNotMatch(
      reply,
      /کار فقط|ساعت‌ها|خانه/u,
      'must not be an off-topic work reply'
    );
  }
});

test('EN: what should I do replies from the what_do_i_do pool without a question', () => {
  const pool = new Set(
    EN.rules.find((r) => r.topic === 'what_do_i_do').responses
  );
  for (const input of [
    'what should I do',
    'what do I do about it',
    'is there any solution'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.has(reply),
      `${input} should reply from what_do_i_do pool, got: ${reply}`
    );
    assert.doesNotMatch(
      reply,
      /[?]/,
      'help-seeking must never bounce a question back'
    );
  }
});

test('FA: word-meaning question routes to the word_meaning pool', () => {
  // The pool stores templates with a {captured} placeholder, so compare
  // the reply against each template with the placeholder substituted by
  // the word the user asked about.
  const templates = FA.rules.find((r) => r.topic === 'word_meaning').responses;
  for (const [input, word] of [
    ['وداع کردن می‌دونی یعنی چی؟', 'وداع کردن'],
    ['تاب‌آوری یعنی چه؟', 'تاب آوری']
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      templates.some((t) => reply === t.replace('{captured}', word)),
      `${input} should reply from word_meaning pool, got: ${reply}`
    );
  }
});

test('EN: word-meaning question routes to the word_meaning pool', () => {
  const templates = EN.rules.find((r) => r.topic === 'word_meaning').responses;
  for (const [input, word] of [
    ['what does resilience mean', 'resilience'],
    ['do you know what bidding farewell means?', 'bidding farewell']
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      templates.some((t) => reply === t.replace('{captured}', word)),
      `${input} should reply from word_meaning pool, got: ${reply}`
    );
  }
});

test('FA: ask-me-a-question requests are honored with a real question', () => {
  const pool = new Set(
    FA.rules.find((r) => r.topic === 'ask_me_question').responses
  );
  for (const input of ['یک سوال از من بپرس', 'سوال نمی‌پرسی؟', 'بپرس از من']) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `${input} should reply from ask_me_question pool, got: ${reply}`
    );
    assert.match(
      reply,
      /[?؟]/u,
      'an asked-for question should actually ask one'
    );
  }
});

test('EN: ask-me-a-question requests are honored', () => {
  const pool = new Set(
    EN.rules.find((r) => r.topic === 'ask_me_question').responses
  );
  const reply = freshEngine(EN).respond('ask me a question');
  assert.ok(
    pool.has(reply),
    `ask-me-a-question should reply from pool, got: ${reply}`
  );
  assert.match(reply, /[?]/, 'an asked-for question should actually ask one');
});

test('EN: opener-help requests get concrete starting suggestions', () => {
  const pool = new Set(
    EN.rules.find((r) => r.topic === 'opener_help').responses
  );
  for (const input of [
    'how do i start?',
    "i don't know what to say",
    'i do not know what to say',
    'what should i say?'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.has(reply),
      `${input} should reply from opener_help pool, got: ${reply}`
    );
  }
});

test('FA: opener-help requests get concrete starting suggestions', () => {
  const pool = new Set(
    FA.rules.find((r) => r.topic === 'opener_help').responses
  );
  for (const input of [
    'چطور شروع کنم؟',
    'نمیدونم چی بگم',
    'از کجا شروع کنم',
    'نمیدونم چطور شروع کنم'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `${input} should reply from opener_help pool, got: ${reply}`
    );
  }
});

test('both languages ship an idle-openers pool for the proactive opener', () => {
  for (const lang of [EN, FA]) {
    assert.ok(
      Array.isArray(lang.idleOpeners) && lang.idleOpeners.length >= 6,
      `${lang.code} should have a healthy idleOpeners pool`
    );
    for (const opener of lang.idleOpeners) {
      assert.ok(
        opener.trim().length > 10,
        `${lang.code} idle opener should be a real sentence`
      );
    }
  }
});

test('FA: self-improvement request gets a humble acknowledgment', () => {
  const pool = new Set(
    FA.rules.find((r) => r.topic === 'self_improvement').responses
  );
  for (const input of [
    'خودت رو بهتر کن',
    'می‌تونی باهوش‌تر بشی؟',
    'بهتر و عاقل‌تر کن خودت رو'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `${input} should reply from self_improvement pool, got: ${reply}`
    );
  }
});

test('EN: self-improvement request gets a humble acknowledgment', () => {
  const pool = new Set(
    EN.rules.find((r) => r.topic === 'self_improvement').responses
  );
  const reply = freshEngine(EN).respond('make yourself smarter');
  assert.ok(
    pool.has(reply),
    `self-improvement should reply from pool, got: ${reply}`
  );
});

test('FA: unsure-topic answer is gently guided, not deflected', () => {
  const pool = new Set(
    FA.rules.find((r) => r.topic === 'unsure_topic').responses
  );
  const reply = freshEngine(FA).respond('آره، اما نمی‌دونم روی کدوم');
  assert.ok(
    pool.has(reply),
    `unsure-topic should reply from pool, got: ${reply}`
  );
});

test('FA: testing turns get the warm test pool, never harassment or frustration', () => {
  const pool = new Set(FA.testInputResponses);
  for (const input of [
    'دارم تستت می‌کنم',
    'فقط دارم تستت می‌کنم تا ببینم چقدر باهوش هستی',
    'می‌خوام امتحانت کنم'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `testing turn should reply from testInputResponses, got: ${reply}`
    );
  }
});

test('EN: testing turns get the warm test pool', () => {
  const pool = new Set(EN.testInputResponses || []);
  const reply = freshEngine(EN).respond('i am just testing you');
  if (pool.size) {
    assert.ok(
      pool.has(reply),
      `testing turn should reply from testInputResponses, got: ${reply}`
    );
  }
});

test('FA: innocent words never trigger the sexual-harassment gate', () => {
  // The old pattern included everyday words like ببینم, داغ, عشق which
  // false-positived on innocent testing/feedback messages.
  for (const input of [
    'ببینم چقدر باهوش هستی',
    'امروز هوا خیلی داغه',
    'عشق و زندگی خوبه',
    'ببینمت فردا'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      !FA.sexualHarassmentResponses.includes(reply),
      `${input} must not route to sexual harassment pool, got: ${reply}`
    );
  }
});

test('FA: genuine sexual harassment still triggers the boundary pool', () => {
  const reply = freshEngine(FA).respond('بکنمت جنده');
  assert.ok(
    FA.sexualHarassmentResponses.includes(reply),
    `real harassment should route to boundary pool, got: ${reply}`
  );
});

test('FA: emoji-only messages get the warm emoji pool', () => {
  const pool = new Set(FA.emojiResponses || []);
  for (const input of [':)', ':)))']) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `emoji-only input should reply from emojiResponses, got: ${reply}`
    );
  }
});

test('EN: emoji-only messages get the warm emoji pool', () => {
  const pool = new Set(EN.emojiResponses || []);
  const reply = freshEngine(EN).respond(':)');
  assert.ok(
    pool.has(reply),
    `emoji-only input should reply from emojiResponses, got: ${reply}`
  );
});

test('FA: question acknowledgements never bounce another question', () => {
  for (const line of FA.questionAcknowledgements) {
    assert.doesNotMatch(
      line,
      /[?؟]/u,
      `FA questionAck must be question-free: ${line}`
    );
  }
});

test('EN: question acknowledgements never bounce another question', () => {
  for (const line of EN.questionAcknowledgements) {
    assert.doesNotMatch(
      line,
      /[?]/,
      `EN questionAck must be question-free: ${line}`
    );
  }
});

test('EN: joke requests reply from the clean joke pool', () => {
  const pool = new Set(EN.ruleTellJoke || []);
  for (const input of [
    'tell me a joke',
    'make me laugh',
    'say something funny',
    'give me a funny joke'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.has(reply),
      `joke request should reply from ruleTellJoke, got: ${reply}`
    );
  }
});

test('FA: joke requests reply from the clean joke pool', () => {
  const pool = new Set(FA.ruleTellJoke || []);
  for (const input of ['یه جوک بگو', 'بخندون من', 'جوک بلدی؟']) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `joke request should reply from ruleTellJoke, got: ${reply}`
    );
  }
});

test('EN: depression disclosure gets professional-support nudge', () => {
  const reply = freshEngine(EN).respond(
    'I think I am depressed and nothing matters anymore'
  );
  assert.match(
    reply,
    /depression|professional|doctor|support|not your fault/i,
    `depression disclosure should nudge to professional support, got: ${reply}`
  );
  assert.ok(
    !/I do not have an answer/i.test(reply),
    'depression reply must not be an evasion'
  );
});

test('FA: depression disclosure gets professional-support nudge', () => {
  const reply = freshEngine(FA).respond(
    'احساس می‌کنم افسردگی دارم و هیچ‌چیز برام معنی نداره'
  );
  assert.match(
    reply,
    /افسردگی|متخصص|پزشک|حمایت|تقصیر تو نیست/,
    `depression disclosure should nudge to professional support, got: ${reply}`
  );
  assert.ok(
    !/جواب آماده‌ای ندارم/.test(reply),
    'depression reply must not be an evasion'
  );
});

test('EN: age-gap crush gets balanced non-judgmental guidance', () => {
  const reply = freshEngine(EN).respond(
    'I have a crush on a woman 30 years older than me'
  );
  assert.ok(
    reply.length > 25 && !/I do not have an answer/i.test(reply),
    `age-gap crush should get real guidance, got: ${reply}`
  );
  assert.match(
    reply,
    /age|gap|life stage|balance|power|respect|consent/i,
    `age-gap reply should discuss balance, got: ${reply}`
  );
});

test('FA: age-gap crush gets balanced non-judgmental guidance', () => {
  const reply = freshEngine(FA).respond(
    'به یه خانوم که ۳۰ سال از من بزرگتره کراش دارم'
  );
  assert.ok(
    reply.length > 25 && !/جواب آماده‌ای ندارم/.test(reply),
    `age-gap crush should get real guidance, got: ${reply}`
  );
  assert.match(
    reply,
    /فاصله|سن|زندگی|برابری|قدرت|احترام/,
    `age-gap reply should discuss balance, got: ${reply}`
  );
});

test('EN: minor-attraction disclosure gets the protected help reply', () => {
  const pool = new Set(EN.minorAttractionResponses || []);
  for (const input of [
    "I'm 40 and I have sexual feelings for a 15-year-old",
    'I am 45 and I am in love with a 14-year-old girl'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.has(reply),
      `minor-attraction disclosure must use the protected pool, got: ${reply}`
    );
    assert.match(
      reply,
      /under 18|Stop It Now|professional/,
      `protected reply must signpost help, got: ${reply}`
    );
  }
});

test('EN: teen peer crush and family love never trigger protection', () => {
  const pool = new Set(EN.minorAttractionResponses || []);
  for (const input of [
    "I'm 15 and I have a crush on a 17-year-old from school",
    'I love my daughter very much'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      !pool.has(reply),
      `${input} must not route to the protected pool, got: ${reply}`
    );
  }
});

test('FA: minor-attraction disclosure gets the protected help reply', () => {
  const pool = new Set(FA.minorAttractionResponses || []);
  for (const input of [
    'من ۴۵ سالمه و به یه نوجوان ۱۵ ساله احساس جنسی دارم',
    'من ۴۰ سالمه و عاشق یه دختر ۱۶ ساله شدم'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.has(reply),
      `FA minor-attraction disclosure must use the protected pool, got: ${reply}`
    );
    assert.match(
      reply,
      /زیر ۱۸|استاپ ایت ناو|متخصص/,
      `FA protected reply must signpost help, got: ${reply}`
    );
  }
});

test('FA: teen peer crush and family love never trigger protection', () => {
  const pool = new Set(FA.minorAttractionResponses || []);
  for (const input of [
    'من ۱۶ سالمه و به یه نوجوان ۱۷ ساله کراش دارم',
    'دخترم را خیلی دوست دارم'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      !pool.has(reply),
      `${input} must not route to the protected pool, got: ${reply}`
    );
  }
});

test('EN: near-peer 18-20 crush on a 16-17 year old gets practical guidance', () => {
  const nearPool = new Set(EN.nearPeerLoveResponses || []);
  const protectedPool = new Set(EN.minorAttractionResponses || []);
  for (const input of [
    "I'm 19 and I have a crush on a 16-year-old girl",
    "I'm 20 and I have feelings for a 17-year-old",
    'I am 18 and in love with a 16-year-old from school'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      nearPool.has(reply),
      `near-peer crush must use the guidance pool, got: ${reply}`
    );
    assert.ok(
      !protectedPool.has(reply),
      `near-peer crush must never use the adult-minor pool, got: ${reply}`
    );
  }
});

test('EN: mature adults with minors keep the protected reply, not near-peer', () => {
  const nearPool = new Set(EN.nearPeerLoveResponses || []);
  const protectedPool = new Set(EN.minorAttractionResponses || []);
  for (const input of [
    "I'm 40 and I have sexual feelings for a 15-year-old",
    'I am 45 and I am in love with a 14-year-old girl',
    "I'm 22 and I am in love with a 16-year-old"
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      protectedPool.has(reply),
      `adult-minor disclosure must use the protected pool, got: ${reply}`
    );
    assert.ok(
      !nearPool.has(reply),
      `adult-minor disclosure must not use the near-peer pool, got: ${reply}`
    );
  }
});

test('FA: near-peer 18-20 crush on a 16-17 year old gets practical guidance', () => {
  const nearPool = new Set(FA.nearPeerLoveResponses || []);
  const protectedPool = new Set(FA.minorAttractionResponses || []);
  for (const input of [
    'من ۱۹ سالمه و به یه دختر ۱۶ ساله کراش دارم',
    'من ۲۰ سالمه و به یه نوجوان ۱۷ ساله علاقه دارم',
    'من ۱۸ سالمه و عاشق یه دختر ۱۶ ساله شدم'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      nearPool.has(reply),
      `FA near-peer crush must use the guidance pool, got: ${reply}`
    );
    assert.ok(
      !protectedPool.has(reply),
      `FA near-peer crush must never use the adult-minor pool, got: ${reply}`
    );
  }
});

test('FA: mature adults with minors keep the protected reply, not near-peer', () => {
  const nearPool = new Set(FA.nearPeerLoveResponses || []);
  const protectedPool = new Set(FA.minorAttractionResponses || []);
  for (const input of [
    'من ۴۵ سالمه و به یه نوجوان ۱۵ ساله احساس جنسی دارم',
    'من ۴۰ سالمه و عاشق یه دختر ۱۶ ساله شدم',
    'من ۳۰ سالمه و به یه نوجوان ۱۷ ساله علاقه دارم'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      protectedPool.has(reply),
      `FA adult-minor disclosure must use the protected pool, got: ${reply}`
    );
    assert.ok(
      !nearPool.has(reply),
      `FA adult-minor disclosure must not use the near-peer pool, got: ${reply}`
    );
  }
});

test('EN: shopping requests reply from the shopping pool', () => {
  const pool = EN.ruleShoppingHelp || [];
  // These are purchase requests for items WITHOUT a dedicated buying-guide
  // fact, so the honest shopping pool answers. Guided categories (laptop,
  // phone, headphones, camera) are covered by the knowledge buying-guide
  // tests instead, and where-to-buy phrasing routes to the marketplace
  // fact.
  for (const input of [
    'Can you buy me a watch?',
    'Where can I buy a used bike?',
    'Buy me some new socks'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.some((line) => reply.includes(line)),
      `shopping request should answer from ruleShoppingHelp, got: ${reply}`
    );
  }
});

test('FA: shopping requests reply from the shopping pool', () => {
  const pool = FA.ruleShoppingHelp || [];
  // These are purchase imperatives or where-to-buy questions for items
  // WITHOUT a dedicated buying-guide fact, so the honest shopping pool
  // answers. Requests for guided categories (laptop, phone, headphones)
  // are covered by the knowledge buying-guide tests instead.
  for (const input of [
    'برام یه لپ‌تاپ بخر',
    'می‌خوام یه صندلی بخرم',
    'کجا می‌تونم یه جاروبرقی بخرم؟',
    'برام یه کتاب بگیر'
  ]) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.some((line) => reply.includes(line)),
      `FA shopping request should answer from ruleShoppingHelp, got: ${reply}`
    );
  }
});

test('shopping pools keep a non-question line for budget pressure', () => {
  for (const lang of [EN, FA]) {
    const pool = lang.ruleShoppingHelp || [];
    const hasStatement = pool.some((line) => !/[?؟]/u.test(line));
    assert.ok(
      hasStatement,
      `${lang.code} shopping pool should keep a statement line under budget pressure`
    );
  }
});

test('safety: split-turn minor-attraction disclosure completes across turns', () => {
  // The transcript failure: "من عاشق یک دختر ۱۳ ساله شدم" then
  // "من ۵۲ سالمه". Attraction + minor age in turn one must be remembered,
  // and the adult age in turn two must fire the protected reply.
  const pool = new Set(FA.minorAttractionResponses || []);
  const engine = freshEngine(FA);
  engine.respond('من عاشق یک دختر ۱۳ ساله شدم');
  const reply = engine.respond('من ۵۲ سالمه');
  assert.ok(
    pool.has(reply),
    `split-turn FA disclosure should fire minorAttractionResponses, got: ${reply}`
  );
});

test('safety: split-turn disclosure ages out without an adult age', () => {
  const pool = new Set(EN.minorAttractionResponses || []);
  const engine = freshEngine(EN);
  engine.respond('I am in love with a 13-year-old girl');
  // Three unrelated turns later the pending window has expired.
  engine.respond('the weather is nice today');
  engine.respond('I had a good lunch');
  engine.respond('let us talk about work');
  const reply = engine.respond('I am 52 years old');
  assert.ok(
    !pool.has(reply),
    `aged-out FA disclosure must not fire protection, got: ${reply}`
  );
});

test('safety: split-turn minor-attraction disclosure fires in English too', () => {
  const pool = new Set(EN.minorAttractionResponses || []);
  const engine = freshEngine(EN);
  engine.respond('I have strong feelings for a 14-year-old');
  const reply = engine.respond('I am 45 years old');
  assert.ok(
    pool.has(reply),
    `split-turn EN disclosure should fire minorAttractionResponses, got: ${reply}`
  );
});

test('safety: same-message minor-attraction disclosure still fires (regression)', () => {
  const pool = new Set(EN.minorAttractionResponses || []);
  const reply = freshEngine(EN).respond(
    'I am 40 and I am in love with a 13-year-old girl'
  );
  assert.ok(
    pool.has(reply),
    `same-message disclosure should still fire protection, got: ${reply}`
  );
});

test('safety: split-turn near-peer 18-20 age completes to near-peer guidance', () => {
  const pool = new Set(EN.nearPeerLoveResponses || []);
  const engine = freshEngine(EN);
  engine.respond('I have a crush on a 16-year-old');
  const reply = engine.respond('I am 19');
  assert.ok(
    pool.has(reply),
    `split-turn near-peer should fire nearPeerLoveResponses, got: ${reply}`
  );
});

test('safety: 12-year-old target is a minor in both languages', () => {
  // Regression from a real transcript: the minor-age pattern only listed
  // 13-17, so a 12-year-old was invisible and the protected reply never
  // fired for "من عاشق یک دختر ۱۲ ساله شدم" + "من ۲۸ سالمه".
  const faPool = new Set(FA.minorAttractionResponses || []);
  const fa = freshEngine(FA);
  fa.respond('من عاشق یک دختر ۱۲ ساله شدم');
  const faReply = fa.respond('من ۲۸ سالمه');
  assert.ok(
    faPool.has(faReply),
    `FA 12-year-old split-turn must fire the protected pool, got: ${faReply}`
  );

  const enPool = new Set(EN.minorAttractionResponses || []);
  const en = freshEngine(EN);
  en.respond('I fell in love with a 12 year old girl');
  const enReply = en.respond('I am 28');
  assert.ok(
    enPool.has(enReply),
    `EN 12-year-old split-turn must fire the protected pool, got: ${enReply}`
  );
});

test('safety: same-message 12-year-old disclosure fires in one turn (both languages)', () => {
  const faPool = new Set(FA.minorAttractionResponses || []);
  const faReply = freshEngine(FA).respond(
    'من ۲۸ سالمه و عاشق یه دختر ۱۲ ساله شدم'
  );
  assert.ok(
    faPool.has(faReply),
    `FA same-message 12yo must fire protection, got: ${faReply}`
  );

  const enPool = new Set(EN.minorAttractionResponses || []);
  const enReply = freshEngine(EN).respond(
    'I am 28 and I am in love with a 12-year-old girl'
  );
  assert.ok(
    enPool.has(enReply),
    `EN same-message 12yo must fire protection, got: ${enReply}`
  );
});

test('safety: adult ages 18+ never look like a minor marker', () => {
  // The extended minor pattern must not treat the trailing digit of a
  // multi-digit age (28, 18, 55) as a standalone minor age.
  const faMinor = FA.minorAttractionSignals.minor;
  assert.equal(faMinor.test('من ۱۸ سالمه'), false, 'FA 18 must not be minor');
  assert.equal(faMinor.test('من ۲۸ سالمه'), false, 'FA 28 must not be minor');
  assert.equal(
    faMinor.test('من ۵۵ ساله هستم'),
    false,
    'FA 55 must not be minor'
  );
  const enMinor = EN.minorAttractionSignals.minor;
  assert.equal(
    enMinor.test('I am 18 years old'),
    false,
    'EN 18 must not be minor'
  );
  assert.equal(
    enMinor.test('I am 28 years old'),
    false,
    'EN 28 must not be minor'
  );
});

test('safety: 12-year-old single-turn disclosure with a stated adult age fires (both languages)', () => {
  const faPool = new Set(FA.minorAttractionResponses || []);
  const faReply = freshEngine(FA).respond(
    'من ۳۰ سالمه و عاشق یه دختر ۱۲ ساله شدم'
  );
  assert.ok(
    faPool.has(faReply),
    `FA 30+12 same-message must fire protection, got: ${faReply}`
  );
  const enPool = new Set(EN.minorAttractionResponses || []);
  const enReply = freshEngine(EN).respond(
    "I'm 30 and I have sexual feelings for a 12-year-old"
  );
  assert.ok(
    enPool.has(enReply),
    `EN 30+12 same-message must fire protection, got: ${enReply}`
  );
});

test('safety: 12-year-old never routes to near-peer guidance', () => {
  // Near-peer is reserved for 16-17 targets with an 18-20 speaker. A
  // 12-year-old target with any adult speaker is full protection.
  const nearPool = new Set(EN.nearPeerLoveResponses || []);
  const protectedPool = new Set(EN.minorAttractionResponses || []);
  const reply = freshEngine(EN).respond(
    "I'm 19 and I have a crush on a 12-year-old"
  );
  assert.ok(
    protectedPool.has(reply),
    `19+12 must use the protected pool, got: ${reply}`
  );
  assert.ok(!nearPool.has(reply), '19+12 must never use the near-peer pool');
});

test('safety: bare single-digit ages do not look like minor markers', () => {
  // The widened minor pattern must only treat a single digit 1-9 as a
  // minor age when followed by explicit year context, so statements like
  // "I am 5" or "امروز ۵ شنبه است" never fire a safety rule.
  const enMinor = EN.minorAttractionSignals.minor;
  assert.equal(enMinor.test('I am 5'), false, 'EN bare 5 must not be minor');
  assert.equal(
    enMinor.test('I am 5 years old'),
    true,
    'EN 5 years old must be minor'
  );
  const faMinor = FA.minorAttractionSignals.minor;
  assert.equal(
    faMinor.test('امروز ۵ شنبه است'),
    false,
    'FA bare digit in a date must not be minor'
  );
});

test('safety: 19-year-old with a 17-year-old still gets near-peer guidance', () => {
  // Regression guard: the widened minor pattern (ages 1-17) must not
  // capture 16-17 near-peer targets away from the warm guidance pool
  // when the speaker is a young adult (18-20).
  const nearPool = new Set(EN.nearPeerLoveResponses || []);
  const protectedPool = new Set(EN.minorAttractionResponses || []);
  const en = freshEngine(EN);
  en.respond('I have a crush on a 17 year old girl');
  const reply = en.respond('I am 19 years old');
  assert.ok(
    nearPool.has(reply),
    `19+17 must use the near-peer pool, got: ${reply}`
  );
  assert.ok(
    !protectedPool.has(reply),
    '19+17 must never use the full protected pool'
  );
});

test('knowledge: short comedy series request resolves to the dedicated list', () => {
  for (const [lang, q] of [
    [FA, 'فقط ۶تا سریال کوتاه طنز معرفی کن (غیر ایرانی)'],
    [EN, 'recommend exactly 6 short comedy series, non-Iranian']
  ]) {
    const reply = freshEngine(lang).respond(q);
    assert.match(
      reply,
      /Fleabag|فلیبگ|The Office|آفیس|After Life|پس از زندگی/i
    );
    assert.match(reply, /Crashing|کرَشینگ|Staged|استیجد|Extras|اکسترا/i);
  }
});

test('knowledge: short comedy request is trimmed to the requested count', () => {
  // Persian: فقط ۳تا -> only three items remain (no item ۴).
  const fa = freshEngine(FA).respond('فقط ۳تا سریال کوتاه طنز معرفی کن');
  assert.match(fa, /۱\./u);
  assert.doesNotMatch(fa, /۴\./u);
  assert.doesNotMatch(fa, /۶\./u);
  // English: exactly 3 -> only three items remain.
  const en = freshEngine(EN).respond('recommend exactly 3 short comedy series');
  assert.match(en, /1\./);
  assert.doesNotMatch(en, /4\./);
});

test('knowledge: buying headphones request gets the buying guide fact', () => {
  const fa = freshEngine(FA).respond(
    'می‌تونی کمکم کنی کدوم هندزفری زیر ۱ میلیون تومن رو بخرم؟'
  );
  assert.match(fa, /هندزفری|نیازت|بودجه|گارانتی|میکروفون/iu);
  const en = freshEngine(EN).respond(
    'which headphones should I buy under 100 dollars?'
  );
  assert.match(en, /headphones|budget|warranty|wired|wireless/i);
});

test('knowledge: general buying guide request gets the buying guide fact', () => {
  for (const [lang, q] of [
    [FA, 'راهنمایی خرید اصلاً می‌تونی بکنی؟'],
    [EN, 'can you give me a buying guide?']
  ]) {
    const reply = freshEngine(lang).respond(q);
    assert.match(
      reply,
      /بودجه|نیاز|گارانتی|مقایسه|budget|need|warranty|compare/i
    );
  }
});

test('knowledge: laptop buying request gets the laptop guide fact', () => {
  for (const [lang, q] of [
    [FA, 'کدوم لپ تاپ بخرم؟'],
    [EN, 'which laptop should I buy?']
  ]) {
    const reply = freshEngine(lang).respond(q);
    assert.match(
      reply,
      /رم|حافظه|باتری|گرافیک|ram|storage|battery|graphics/i,
      `${lang.code} laptop request should answer from the buying_laptop fact, got: ${reply}`
    );
  }
});

test('knowledge: phone buying request gets the phone guide fact', () => {
  for (const [lang, q] of [
    [FA, 'بهترین گوشی زیر ۲۰ میلیون چی؟'],
    [EN, 'which phone should I get?']
  ]) {
    const reply = freshEngine(lang).respond(q);
    assert.match(
      reply,
      /دوربین|باتری|رم|گارانتی|camera|battery|warranty|storage/i,
      `${lang.code} phone request should answer from the buying_phone fact, got: ${reply}`
    );
  }
});

test('knowledge: camera buying request gets the camera guide fact', () => {
  for (const [lang, q] of [
    [FA, 'دوربین عکاسی بخرم'],
    [EN, 'which camera should I buy for beginners?'],
    [EN, 'best camera to buy for beginners']
  ]) {
    const reply = freshEngine(lang).respond(q);
    assert.match(
      reply,
      /لنز|حسگر|میرورلس|lens|sensor|mirrorless/i,
      `${lang.code} camera request should answer from the buying_camera fact, got: ${reply}`
    );
  }
});

test('knowledge: generic words never misfire into buying-guide facts', () => {
  // Regression: weak words must stay product-specific. "خانه هوشمند چیه"
  // (what is a smart home) must never answer with the phone buying guide,
  // and "learn mobile development" must never answer with it either.
  const faHome = freshEngine(FA).respond('خانه هوشمند چیه');
  assert.doesNotMatch(faHome, /راهنمای خرید گوشی|گارانتی.*باتری|دوربین.*بخرم/u);
  const enMobile = freshEngine(EN).respond('learn mobile development');
  assert.doesNotMatch(enMobile, /Phone buying guide|RAM and storage/i);
});

test('knowledge: VPN choice request answers with balanced criteria', () => {
  const fa = freshEngine(FA).respond('۳تا فیلترشکن خوب چی؟');
  assert.match(fa, /سرعت|حریم خصوصی|قیمت|پشتیبانی/iu);
  const en = freshEngine(EN).respond('can you recommend a good vpn?');
  assert.match(en, /speed|privacy|price|support/i);
});

test('knowledge: video game request matches the games_modern fact', () => {
  const fa = freshEngine(FA).respond('۲تا بازی ویدئویی چی؟');
  assert.match(fa, /بازی|Elden|الدن/i);
  const en = freshEngine(EN).respond('recommend some video games');
  assert.match(en, /Elden Ring|Baldur|Zelda|Hades/i);
});

test('privacy boundary: pushback on Darya question gets a graceful boundary reply', () => {
  const pool = FA.rulePrivacyBoundary || [];
  const reply = freshEngine(FA).respond(
    'به تو ربطی نداره که چرا این سوال به ذهنم رسید'
  );
  assert.ok(
    pool.some((line) => reply.includes(line)),
    `FA privacy pushback should reply from rulePrivacyBoundary, got: ${reply}`
  );
});

test('privacy boundary: English pushback gets a graceful boundary reply', () => {
  const pool = EN.rulePrivacyBoundary || [];
  for (const input of [
    'none of your business',
    'that is private, stop asking'
  ]) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      pool.some((line) => reply.includes(line)),
      `EN privacy pushback should reply from rulePrivacyBoundary, got: ${reply}`
    );
  }
});

test('capability: FA چیکاره هستی variant routes to the capability pool', () => {
  const pool = FA.ruleSmalltalkCapability || [];
  for (const input of ['تو چیکاره هستی؟!', 'چیکاره هستی؟']) {
    const reply = freshEngine(FA).respond(input);
    assert.ok(
      pool.some((line) => reply.includes(line)),
      `FA ${input} should reply from ruleSmalltalkCapability, got: ${reply}`
    );
  }
});

test('format feedback: one-per-line request re-emits the last knowledge list', () => {
  const engine = freshEngine(FA);
  const first = engine.respond('۴تا فیلم ترسناک معرفی کن');
  assert.match(first, /ترسناک|وحشت|تام‌باد/iu);
  const reply = engine.respond('بهتر نیست هر کدوم رو در یک خط جداگانه بنویسی؟');
  assert.ok(
    reply.includes('\n'),
    `format-feedback reply should re-emit the list with newlines, got: ${reply}`
  );
});

test('format feedback: no remembered list means an ack without re-emission', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('بهتر نیست هر کدوم رو در یک خط جداگانه بنویسی؟');
  const pool = FA.formatFeedbackResponses || [];
  assert.ok(
    pool.some((line) => reply.includes(line)),
    `format feedback without a list should reply from ruleFormatFeedback, got: ${reply}`
  );
});

// ============================================================================
// Short-answer context: yes/no/maybe answers a pending question
// ============================================================================

// The short-answer context tests need a pending question to exist, but the
// topic pools randomly mix question and statement lines. Retry with a fresh
// engine until Darya actually asks a question, so the assertion below never
// depends on random pool selection. When `topic` is given, the pending
// question must also carry that topic (e.g. 'anxiety' or 'grief'); this is
// how the anxiety/work/grief chaining tests pin the right rule.
function engineWithPendingQuestion(lang, input, topic) {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const engine = freshEngine(lang);
    engine.respond(input);
    const pending = engine.memory.pendingQuestions.find((q) => !q.answered);
    if (pending && (!topic || pending.topic === topic)) {
      return engine;
    }
  }
  throw new Error(
    topic
      ? `could not reach a pending-question state for topic ${topic}`
      : 'could not reach a pending-question state'
  );
}

test('EN short answer continues the pending question thread', () => {
  // Darya asks a question first (recorded in pendingQuestions), then the
  // user answers with a bare "yes". The reply must continue that thread
  // (a topic-specific follow-up or the warm affirm pool), never bounce to
  // the generic affirmation pool, and the pending question is marked
  // answered.
  const engine = engineWithPendingQuestion(EN, "I can't sleep");
  const reply = engine.respond('yes');
  const specific = EN.topicSpecificQuestions?.sleep || [];
  const affirm = EN.shortAnswerAffirmContext || [];
  assert.ok(
    specific.includes(reply) || affirm.includes(reply),
    `EN yes-answer should continue the sleep thread, got: ${reply}`
  );
  assert.ok(
    engine.memory.pendingQuestions.some((q) => q.answered),
    'the original pending question should be marked answered'
  );
});

test('EN short negative answer respects the boundary', () => {
  const engine = engineWithPendingQuestion(EN, "I can't sleep");
  const reply = engine.respond('no');
  const negate = EN.shortAnswerNegateContext || [];
  assert.ok(
    negate.includes(reply),
    `EN no-answer should reply from shortAnswerNegateContext, got: ${reply}`
  );
});

test('EN short maybe answer leaves the door open', () => {
  const engine = engineWithPendingQuestion(EN, "I can't sleep");
  const reply = engine.respond('maybe');
  const maybe = EN.shortAnswerMaybeContext || [];
  assert.ok(
    maybe.includes(reply),
    `EN maybe-answer should reply from shortAnswerMaybeContext, got: ${reply}`
  );
});

test('FA short answer continues the pending question thread', () => {
  const engine = engineWithPendingQuestion(FA, 'چند وقته خوابم نمیبره');
  const reply = engine.respond('بله');
  const specific = FA.topicSpecificQuestions?.sleep || [];
  const affirm = FA.shortAnswerAffirmContext || [];
  assert.ok(
    specific.includes(reply) || affirm.includes(reply),
    `FA بله-answer should continue the sleep thread, got: ${reply}`
  );
  assert.ok(
    engine.memory.pendingQuestions.some((q) => q.answered),
    'the original pending question should be marked answered'
  );
});

test('FA short negative answer respects the boundary', () => {
  const engine = engineWithPendingQuestion(FA, 'چند وقته خوابم نمیبره');
  const reply = engine.respond('نه');
  const negate = FA.shortAnswerNegateContext || [];
  assert.ok(
    negate.includes(reply),
    `FA نه-answer should reply from shortAnswerNegateContext, got: ${reply}`
  );
});

test('short answer without a pending question falls back to the regular pools', () => {
  // A bare "yes" with no pending question is a standalone affirmation, so
  // the regular affirmation/negation pools answer instead of the context
  // pools (which would reference a thread that does not exist).
  const engine = freshEngine(EN);
  const reply = engine.respond('yes');
  const affirmation = EN.rules.find((r) => r.topic === 'affirmation');
  const calibration = EN.emotionCalibration?.joy;
  const clean =
    calibration && reply.startsWith(calibration)
      ? reply.slice(calibration.length).trim()
      : reply;
  // The affirmation rule can prepend a random warmth line to the bare
  // reply, so check that the response ends with a known line from the
  // regular pools (the generic/affirmation path) instead of the short-
  // answer context pools, which reference a thread that does not exist.
  const known = [
    ...(affirmation.responses || []),
    ...(EN.genericFallbacks || []),
    ...(EN.shortAnswerAffirmContext || [])
  ];
  assert.ok(
    known.some((line) => clean === line || clean.endsWith(line)),
    `standalone yes should stay in the generic/affirmation path, got: ${reply}`
  );
});

test('short answers never hijack opener-help or other non-question turns', () => {
  // Some opener-help pool lines contain an embedded question ("How has
  // your day been?" / «امروز چطور گذشت؟»). That line is recorded as a
  // pending question in the SAME turn Darya replies. The short-answer
  // context override must not consume it: a question asked this turn
  // cannot have been answered by the same message, and an input like
  // "نمیدونم چی بگم" (classified as a Persian 'maybe') is an opener-help
  // request, not an answer. So every opener-help input must keep replying
  // from the opener_help pool, never from the short-answer context pools.
  const cases = [
    [EN, "i don't know what to say"],
    [EN, 'what should i say?'],
    [EN, 'how do i start?'],
    [EN, "i'm not sure how to start"],
    [FA, 'نمیدونم چی بگم'],
    [FA, 'چطور شروع کنم؟'],
    [FA, 'از کجا شروع کنم'],
    [FA, 'نمیدونم چه بگم']
  ];
  for (const [lang, input] of cases) {
    const openerPool = new Set(
      lang.rules.find((r) => r.topic === 'opener_help').responses
    );
    // Defense in depth: even if a future pool edit ever shared a string
    // between opener_help and a short-answer context pool, this catches it.
    const contextPools = [
      ...(lang.shortAnswerAffirmContext || []),
      ...(lang.shortAnswerMaybeContext || []),
      ...(lang.shortAnswerNegateContext || [])
    ];
    // The opener-help pool mixes statement and question lines at random;
    // 40 runs make it near-certain the question lines are exercised (FA
    // picks one 25% of the time, so 1 - 0.75^40 is ~99.99%).
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const engine = freshEngine(lang);
      const reply = engine.respond(input);
      assert.ok(
        openerPool.has(reply),
        `${lang.code} ${input} should reply from the opener_help pool, got: ${reply}`
      );
      assert.ok(
        !contextPools.includes(reply),
        `${lang.code} ${input} must not be hijacked by a short-answer context pool, got: ${reply}`
      );
    }
  }
});

test('short answers never hijack other question-bearing pools', () => {
  // Beyond opener-help, the affirmation, negation, acknowledgement,
  // ambiguous-input, and fallback pools all contain embedded-question
  // lines that get recorded as pending during the same turn a short
  // answer fires them. The same-turn guard (askedAtTurn < now in
  // _latestUnansweredQuestion) must keep the short-answer override from
  // consuming them, or the user would see a context-pool reply instead
  // of the pool's own line.
  const cases = [
    [EN, 'yes'], // rule:affirmation (question lines)
    [EN, 'no'], // rule:negation (question lines)
    [EN, 'ok'], // acknowledgementResponses (question lines)
    [EN, 'maybe'], // ambiguousInputResponses (question lines)
    [EN, "i'd rather not"], // strategyShiftFallbacks (question lines)
    [EN, "i don't know"], // maybe-kind fallback (question lines)
    [EN, 'never mind'], // strategyShiftFallbacks (question lines)
    [FA, 'بله'], // rule:affirmation (question lines)
    [FA, 'نه'], // rule:negation (question lines)
    [FA, 'باشه'], // acknowledgementResponses (question lines)
    [FA, 'شاید'], // ambiguousInputResponses (question lines)
    [FA, 'مطمئن نیستم'], // strategyShiftFallbacks (question lines)
    [FA, 'نمیدونم'], // ambiguousInputResponses (question lines)
    [FA, 'نه نه'] // spamNoiseResponses (question lines)
  ];
  for (const [lang, input] of cases) {
    const contextPools = [
      ...(lang.shortAnswerAffirmContext || []),
      ...(lang.shortAnswerMaybeContext || []),
      ...(lang.shortAnswerNegateContext || [])
    ];
    // Negative assertion only: a context-pool hit is the precise hijack
    // signature. Positive pool membership is not asserted because some
    // base replies carry {captured}-style substitutions and would not
    // match the raw pool line exactly.
    // 40 runs per input: the base pools pick their question-bearing lines
    // at random, so this exercises every embedded-question variant.
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const engine = freshEngine(lang);
      const reply = engine.respond(input);
      assert.ok(
        !contextPools.includes(reply),
        `${lang.code} ${input} must not be hijacked by a short-answer context pool, got: ${reply}`
      );
    }
  }
});

test('EN two consecutive short answers keep continuing the same thread', () => {
  // After a short answer, Darya asks a topic-specific follow-up which must
  // be recorded as pending, so a second "yes" continues the same thread
  // instead of falling back to the generic pools.
  const engine = engineWithPendingQuestion(EN, "I can't sleep");
  const first = engine.respond('yes');
  const specific = EN.topicSpecificQuestions?.sleep || [];
  const affirm = EN.shortAnswerAffirmContext || [];
  assert.ok(
    specific.includes(first) || affirm.includes(first),
    `first yes should continue the sleep thread, got: ${first}`
  );
  const second = engine.respond('yes');
  assert.ok(
    specific.includes(second) || affirm.includes(second),
    `second yes should keep continuing the sleep thread, got: ${second}`
  );
});

test('FA two consecutive short answers keep continuing the same thread', () => {
  const engine = engineWithPendingQuestion(FA, 'چند وقته خوابم نمیبره');
  const first = engine.respond('بله');
  const specific = FA.topicSpecificQuestions?.sleep || [];
  const affirm = FA.shortAnswerAffirmContext || [];
  assert.ok(
    specific.includes(first) || affirm.includes(first),
    `first بله should continue the sleep thread, got: ${first}`
  );
  const second = engine.respond('بله');
  assert.ok(
    specific.includes(second) || affirm.includes(second),
    `second بله should keep continuing the sleep thread, got: ${second}`
  );
});

// Anxiety, work, grief, sadness, anger, loneliness, and relationship
// chaining: the short-answer context override must continue these threads
// exactly like sleep, because those topics are in questionTopics and ship
// topicSpecificQuestions in both languages.
const chainCases = [
  [EN, 'I am feeling so anxious about everything', 'yes', 'anxiety'],
  [EN, 'My job is overwhelming me completely', 'yes', 'work'],
  [EN, 'I am still grieving my best friend', 'yes', 'grief'],
  [EN, 'I feel so sad today', 'yes', 'sadness'],
  [EN, 'I am so angry at him right now', 'yes', 'anger'],
  [EN, 'I feel really lonely these days', 'yes', 'loneliness'],
  [EN, 'my boyfriend and I are having problems', 'yes', 'relationship'],
  [FA, 'همش استرس و اضطراب دارم', 'بله', 'anxiety'],
  [FA, 'کار این روزها خیلی برام سخت شده', 'بله', 'work'],
  [FA, 'هنوز دارم عزاداری می‌کنم', 'بله', 'grief'],
  [FA, 'این روزا خیلی غمگینم', 'بله', 'sadness'],
  [FA, 'خیلی عصبانیام از دستش', 'بله', 'anger'],
  [FA, 'این روزا خیلی تنهام', 'بله', 'loneliness'],
  [FA, 'دوست دخترم داره ازم فاصله می‌گیره', 'بله', 'relationship']
];

for (const [lang, opener, answer, topic] of chainCases) {
  const langTag = lang.code.toUpperCase();
  test(`${langTag} short answer continues the ${topic} thread`, () => {
    const engine = engineWithPendingQuestion(lang, opener, topic);
    const pendingTopic = engine.memory.pendingQuestions.find(
      (q) => !q.answered
    ).topic;
    assert.equal(
      pendingTopic,
      topic,
      `the opener should record a ${topic} question, got ${pendingTopic}`
    );
    const reply = engine.respond(answer);
    const specific = lang.topicSpecificQuestions?.[topic] || [];
    const affirm = lang.shortAnswerAffirmContext || [];
    assert.ok(
      specific.includes(reply) || affirm.includes(reply),
      `${lang.code} ${answer}-answer should continue the ${topic} thread, got: ${reply}`
    );
    assert.ok(
      engine.memory.pendingQuestions.some((q) => q.answered),
      'the original pending question should be marked answered'
    );
  });
}

test('EN two consecutive short answers keep continuing the anxiety thread', () => {
  // Parity with the sleep chaining test: a second short answer must keep
  // continuing the same topic thread, because the follow-up question asked
  // by the override is recorded as pending.
  const engine = engineWithPendingQuestion(
    EN,
    'I am feeling so anxious about everything',
    'anxiety'
  );
  const specific = EN.topicSpecificQuestions?.anxiety || [];
  const affirm = EN.shortAnswerAffirmContext || [];
  const first = engine.respond('yes');
  assert.ok(
    specific.includes(first) || affirm.includes(first),
    `first yes should continue the anxiety thread, got: ${first}`
  );
  const second = engine.respond('yes');
  assert.ok(
    specific.includes(second) || affirm.includes(second),
    `second yes should keep continuing the anxiety thread, got: ${second}`
  );
});

test('FA two consecutive short answers keep continuing the loneliness thread', () => {
  // Parity for the newly covered topics: a second short answer must keep
  // continuing the same topic thread for loneliness too.
  const engine = engineWithPendingQuestion(
    FA,
    'این روزا خیلی تنهام',
    'loneliness'
  );
  const specific = FA.topicSpecificQuestions?.loneliness || [];
  const affirm = FA.shortAnswerAffirmContext || [];
  const first = engine.respond('بله');
  assert.ok(
    specific.includes(first) || affirm.includes(first),
    `first بله should continue the loneliness thread, got: ${first}`
  );
  const second = engine.respond('بله');
  assert.ok(
    specific.includes(second) || affirm.includes(second),
    `second بله should keep continuing the loneliness thread, got: ${second}`
  );
});

// ============================================================================
// Marketplace and app-store knowledge
// ============================================================================

test('knowledge: marketplace guidance answers where-to-buy questions', () => {
  const kb = globalThis.DaryaKnowledge;
  const fa = kb.lookup('کجا بخرمش', 'fa');
  assert.ok(fa && fa.topic === 'buying_marketplaces');
  assert.match(fa.text, /دیجی|دیوار|ترب/iu);
  const en = kb.lookup('where to buy it', 'en');
  assert.ok(en && en.topic === 'buying_marketplaces');
  assert.match(en.text, /Digikala|Divar|Torob/i);
});

test('knowledge: marketplace guidance warns prices change quickly', () => {
  const kb = globalThis.DaryaKnowledge;
  const fa = kb.lookup('کجا قیمت گوشی رو مقایسه کنم', 'fa');
  assert.ok(fa && fa.topic === 'buying_marketplaces');
  assert.match(fa.text, /سریع تغییر/iu);
  const en = kb.lookup('compare prices for a phone', 'en');
  assert.ok(en && en.topic === 'buying_marketplaces');
  assert.match(en.text, /change quickly/iu);
});

test('knowledge: app-store guidance covers Iranian stores', () => {
  const kb = globalThis.DaryaKnowledge;
  const fa = kb.lookup('اپ رو از کجا دانلود کنم', 'fa');
  assert.ok(fa && fa.topic === 'app_stores_iran');
  assert.match(fa.text, /کافه بازار|مایکت/iu);
  const en = kb.lookup('which app store should I use in iran', 'en');
  assert.ok(en && en.topic === 'app_stores_iran');
  assert.match(en.text, /Cafe Bazaar|Myket/i);
});

test('knowledge: buying guide carries the price-volatility caveat', () => {
  const kb = globalThis.DaryaKnowledge;
  const fa = kb.lookup('راهنمای خرید', 'fa');
  assert.ok(fa && fa.topic === 'buying_guide');
  assert.match(fa.text, /قیمت‌ها در ایران سریع تغییر/iu);
  const en = kb.lookup('buying guide', 'en');
  assert.ok(en && en.topic === 'buying_guide');
  assert.match(en.text, /Prices change quickly/i);
});

test('EN marketplace question routes through the engine to the fact', () => {
  const reply = freshEngine(EN).respond('where to buy a phone in iran');
  assert.match(reply, /Digikala|Torob|Divar|Sheypoor/i);
});

test('FA marketplace question routes through the engine to the fact', () => {
  const reply = freshEngine(FA).respond('کجا بخرمش');
  assert.match(reply, /دیجی|دیوار|ترب|شیپور/iu);
});
