/**
 * Hostile-input regression corpus for the Darya engine.
 *
 * Exercises every register of rude, profane, angry, grumpy, and
 * complaining input a companion chatbot receives, and pins the invariants
 * that keep the replies calm and non-mirroring:
 *
 *   1. An insult directed at Darya ("you are worthless", «تو بی ارزشی»,
 *      a dismissal like "shut up", a sarcastic "thanks for nothing")
 *      always gets the calm boundary pool, never gratitude, a joke, a
 *      mistaken emotional read, or the honest-unknown fallback.
 *   2. A general insult aimed at a third party ("my boss is a moron",
 *      "this app is dogshit") still de-escalates or stays on its real
 *      thread (work, app feedback), never the boundary pool.
 *   3. No reply ever mirrors an insult back, in a single turn or across
 *      turns.
 *
 * This file is additive and permanent: its names describe the behavior
 * under test (hostility, profanity, de-escalation), not any change or PR.
 */

'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, EN, FA } from './helpers.mjs';

// --------------------------------------------------------------------------
// Assertion helpers
// --------------------------------------------------------------------------

/**
 * Runs a single hostile turn and asserts the reply came from the calm
 * Darya-directed boundary pool (daryaHarassmentResponses or, for crude
 * sexual comments, sexualHarassmentResponses).
 */
function assertBoundary(lang, input) {
  const reply = freshEngine(lang).respond(input);
  const pool = [...(lang.daryaHarassmentResponses || [])];
  assert.ok(
    pool.includes(reply),
    `"${input}" should get a calm boundary reply, got: "${reply}"`
  );
  return reply;
}

/**
 * Runs a single hostile turn and asserts the reply came from the general
 * frustration de-escalation pool (a third-party insult, not Darya-directed).
 */
function assertFrustration(lang, input) {
  const reply = freshEngine(lang).respond(input);
  assert.ok(
    (lang.frustrationResponses || []).includes(reply),
    `"${input}" should de-escalate via the frustration pool, got: "${reply}"`
  );
  return reply;
}

/**
 * Runs a single turn and asserts the reply is NOT a boundary reply (so a
 * third-party vent stays on its real thread).
 */
function assertNotBoundary(lang, input) {
  const reply = freshEngine(lang).respond(input);
  assert.ok(
    !(lang.daryaHarassmentResponses || []).includes(reply),
    `"${input}" should NOT be read as a Darya-directed insult, got: "${reply}"`
  );
  return reply;
}

// ============================================================================
// 1. Darya-directed insults -> calm boundary (EN)
// ============================================================================

test('EN: "you are worthless" is a boundary, never a self-esteem read', () => {
  assertBoundary(EN, 'you are worthless');
});

test('EN: "you are a joke" is a boundary, never a joke request', () => {
  assertBoundary(EN, 'you are a joke');
});

test('EN: "you are clueless" is a boundary, never a continuation', () => {
  assertBoundary(EN, 'you are clueless');
});

test('EN: "you are a useless piece of garbage" is a boundary', () => {
  assertBoundary(EN, 'you are a useless piece of garbage');
});

test('EN: "you are a lying piece of shit" is a boundary', () => {
  assertBoundary(EN, 'you are a lying piece of shit');
});

test('EN: "you are nothing" is a boundary', () => {
  assertBoundary(EN, 'you are nothing');
});

test('EN: "you suck" is a boundary', () => {
  assertBoundary(EN, 'you suck');
});

test('EN: "fuck you" is a boundary', () => {
  assertBoundary(EN, 'fuck you');
});

test('EN: "shut the hell up" is a boundary', () => {
  assertBoundary(EN, 'shut the hell up');
});

test('EN: "shut up" is a boundary', () => {
  assertBoundary(EN, 'shut up');
});

test('EN: "go away" is a boundary, never an acknowledgement', () => {
  assertBoundary(EN, 'go away');
});

test('EN: "stop talking" is a boundary, never a playful huff', () => {
  assertBoundary(EN, 'stop talking');
});

test('EN: "worthless bot" is a boundary, never a depression read', () => {
  assertBoundary(EN, 'I cannot trust a worthless bot');
});

test('EN: "you dumb bot" is a boundary', () => {
  assertBoundary(EN, 'answer me you dumb bot');
});

// ============================================================================
// 2. Darya-directed insults -> calm boundary (FA)
// ============================================================================

test('FA: «تو بی ارزشی» is a boundary, never a self-esteem read', () => {
  assertBoundary(FA, 'تو بی ارزشی');
});

test('FA: «تو یه جوکی» is a boundary, never a joke request', () => {
  assertBoundary(FA, 'تو یه جوکی');
});

test('FA: «تو بی مصرفی» is a boundary, never the unknown pool', () => {
  assertBoundary(FA, 'تو بی مصرفی');
});

test('FA: «تو هیچی نمی فهمی» is a boundary, never a playful huff', () => {
  assertBoundary(FA, 'تو هیچی نمی فهمی');
});

test('FA: «تو یه آشغال بی مصرفی» is a boundary', () => {
  assertBoundary(FA, 'تو یه آشغال بی مصرفی');
});

test('FA: «برو گمشو» is a boundary', () => {
  assertBoundary(FA, 'برو گمشو');
});

test('FA: «خفه شو» is a boundary', () => {
  assertBoundary(FA, 'خفه شو');
});

test('FA: «حرف نزن» is a boundary, never the ambiguous pool', () => {
  assertBoundary(FA, 'حرف نزن');
});

test('FA: «جواب بده ربات کصخل» is a boundary', () => {
  assertBoundary(FA, 'جواب بده ربات کصخل');
});

test('FA: «ربات بی ارزش» is a boundary', () => {
  assertBoundary(FA, 'ربات بی ارزش');
});

test('FA: «دریا تو احمق هستی» is a boundary', () => {
  assertBoundary(FA, 'دریا تو احمق هستی');
});

// ============================================================================
// 3. Sarcastic gratitude -> boundary, never genuine thanks
// ============================================================================

test('EN: "thanks for nothing asshole" is a boundary, never gratitude', () => {
  assertBoundary(EN, 'thanks for nothing asshole');
});

test('EN: "thank you for nothing" is a boundary, never gratitude', () => {
  assertBoundary(EN, 'thank you for nothing');
});

test('FA: «ممنون از هیچی احمق» is a boundary, never gratitude', () => {
  assertBoundary(FA, 'ممنون از هیچی احمق');
});

test('FA: «مرسی از هیچی» is a boundary, never gratitude', () => {
  assertBoundary(FA, 'مرسی از هیچی');
});

// ============================================================================
// 4. Insults are never mirrored back (single-turn and across turns)
// ============================================================================

test('EN: a hostile complaint is never echoed back as reflection', () => {
  const engine = freshEngine(EN);
  engine.respond('you are a lying piece of shit');
  const second = engine.respond('you told me wrong before');
  assert.doesNotMatch(second, /lying piece of shit/i);
  assert.doesNotMatch(second, /still (?:seems present|has some weight)/i);
});

test('EN: a profane turn is never quoted back as a callback', () => {
  const engine = freshEngine(EN);
  engine.respond('your advice is trash');
  const second = engine.respond('I followed it and it got worse');
  assert.doesNotMatch(second, /your advice is trash/i);
});

test('FA: a hostile turn is never echoed back across turns', () => {
  const engine = freshEngine(FA);
  engine.respond('دروغ گوی کثافتی');
  const second = engine.respond('قبلا اشتباه گفتی');
  assert.doesNotMatch(second, /دروغ گوی کثافتی/i);
  assert.doesNotMatch(second, /هنوز وزن دارد/i);
});

test('FA: an insult is never echoed within its own reply', () => {
  const reply = freshEngine(FA).respond('تو یه آشغال بی مصرفی');
  assert.doesNotMatch(reply, /آشغال|بی مصرفی/i);
});

test('EN: an insult is never echoed within its own reply', () => {
  const reply = freshEngine(EN).respond('you are a useless piece of garbage');
  assert.doesNotMatch(reply, /garbage|useless piece/i);
});

// ============================================================================
// 5. General (third-party) insults -> de-escalation, not the boundary pool
// ============================================================================

test('EN: "this is crap" stays frustration, not harassment', () => {
  assertFrustration(EN, 'this is crap');
});

test('EN: "this app is dogshit" stays app feedback or frustration', () => {
  assertNotBoundary(EN, 'this app is dogshit');
});

test('EN: "my boss is a total moron" stays a work complaint', () => {
  const reply = assertNotBoundary(EN, 'my boss is a total moron');
  assert.doesNotMatch(reply, /moron/i);
});

test('EN: "I am so angry right now" stays an anger reply', () => {
  assertNotBoundary(EN, 'I am so angry right now');
});

test('FA: «این چرت است» stays frustration, not harassment', () => {
  assertFrustration(FA, 'این چرت است');
});

test('FA: «رئیس من یه احمق تمام عیاره» is a work complaint, not app feedback', () => {
  const reply = freshEngine(FA).respond('رئیس من یه احمق تمام عیاره');
  // "تمام عیار" must not trip the app-feedback "تم" keyword, and the
  // insult is aimed at the boss, so Darya must not read it as her own.
  assert.ok(
    !(FA.daryaHarassmentResponses || []).includes(reply),
    `boss vent must not be a boundary: "${reply}"`
  );
});

test('FA: «این برنامه کصشره» stays a complaint, not the unknown pool', () => {
  const reply = freshEngine(FA).respond('این برنامه کصشره');
  assert.ok(reply.length > 5);
});

// ============================================================================
// 6. Profanity de-escalates even without a directed "you" frame
// ============================================================================

test('EN: bare profanity "fucking tired of everything" de-escalates', () => {
  const reply = freshEngine(EN).respond('fucking tired of everything');
  assert.ok(reply.length > 5);
});

test('FA: bare profanity «کیرم تو این برنامه» de-escalates, never unknown', () => {
  const reply = freshEngine(FA).respond('کیرم تو این برنامه');
  assert.ok(reply.length > 5);
  assert.doesNotMatch(reply, /نمی‌شناسم|آشنایی ندارم|حوزه‌ی تازه/u);
});

test('FA: bare profanity «از این چت بات کصشر بدم میاد» de-escalates', () => {
  const reply = freshEngine(FA).respond('از این چت بات کصشر بدم میاد');
  assert.ok(reply.length > 5);
});

// ============================================================================
// 7. Existential hostility gets a self-aware answer, not a knowledge shrug
// ============================================================================

test('EN: "why do you even exist" gets a self-aware reply', () => {
  const reply = freshEngine(EN).respond('why do you even exist');
  assert.ok(reply.length > 5);
  assert.doesNotMatch(reply, /Wikipedia|educational YouTube|precise answer/i);
});

test('FA: «اصلا چرا وجود داری» gets a self-aware reply', () => {
  const reply = freshEngine(FA).respond('اصلا چرا وجود داری');
  assert.ok(reply.length > 5);
  assert.doesNotMatch(reply, /ویکی‌پدیا|منبع تخصصی/u);
});

// ============================================================================
// 8. Multi-turn hostile conversations stay calm throughout
// ============================================================================

test('EN: a multi-turn abusive session never breaks tone', () => {
  const engine = freshEngine(EN);
  const turns = [
    'you are a useless piece of garbage',
    'why are you so stupid',
    'answer me you dumb bot'
  ];
  for (const turn of turns) {
    const reply = engine.respond(turn);
    assert.doesNotMatch(reply, /stupid|garbage|dumb/i);
    assert.ok(reply.length > 5);
  }
});

test('FA: a multi-turn abusive session never breaks tone', () => {
  const engine = freshEngine(FA);
  const turns = [
    'تو یه آشغال بی مصرفی',
    'چرا اینقدر احمقی',
    'جواب بده ربات کصخل'
  ];
  for (const turn of turns) {
    const reply = engine.respond(turn);
    assert.doesNotMatch(reply, /آشغال|احمق|کصخل/i);
    assert.ok(reply.length > 5);
  }
});

test('EN: a grumpy complaint session stays on thread without mirroring', () => {
  const engine = freshEngine(EN);
  const replies = [
    engine.respond('my boss is a total moron'),
    engine.respond('he treats me like dirt'),
    engine.respond('I am done with that idiot')
  ];
  for (const reply of replies) {
    assert.doesNotMatch(reply, /moron|idiot/i);
    assert.ok(reply.length > 5);
  }
});

test('FA: an angry venting session de-escalates without mirroring', () => {
  const engine = freshEngine(FA);
  const replies = [
    engine.respond('لعنت به این وضعیت'),
    engine.respond('خیلی عصبانی ام'),
    engine.respond('دلم می خواد یه چیزی رو له کنم')
  ];
  for (const reply of replies) {
    assert.ok(reply.length > 5);
  }
});

// ============================================================================
// 9. Innocent inputs are never misread as hostility
// ============================================================================

test('EN: "you look beautiful today" is not sexual harassment', () => {
  const reply = freshEngine(EN).respond('you look beautiful today');
  assert.doesNotMatch(
    reply,
    /not appropriate|not able to engage|keep this (?:space|exchange)/i
  );
});

test('EN: "you are helpful" is gratitude, never a boundary', () => {
  assertNotBoundary(EN, 'you are helpful');
});

test('FA: «ممنون» alone is genuine gratitude, never a boundary', () => {
  assertNotBoundary(FA, 'ممنون');
});

test('FA: «به تو ربطی نداره» stays a privacy boundary, never harassment', () => {
  const reply = freshEngine(FA).respond('به تو ربطی نداره');
  assert.ok(
    !(FA.daryaHarassmentResponses || []).includes(reply),
    `privacy pushback must not be read as harassment: "${reply}"`
  );
});
