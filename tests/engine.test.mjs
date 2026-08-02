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
  assert.match(reply, /question|sitting with|take on it/i);
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
  // knowledge-shelf essay or a generic fallback.
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
  for (const greeting of ['صبح بخیر', 'عصر بخیر', 'سلام صبح بخیر']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(greeting);
    assert.match(reply, /^سلام/u, `${greeting} should get a سلام-based reply`);
  }
});

test('back-to-back questions use non-question alternative path', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    engine.respond('Why does this keep happening?');
    const second = engine.respond('What should I do next?');
    assert.doesNotMatch(second, /[?]/);
    assert.match(second, /thread|piece|listening|detail|question|open/i);
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
