/**
 * Regression tests for the 1.3 intelligence-upgrade fixes.
 *
 * Covers the concrete weaknesses found during the upgrade audit:
 *  1. Square root of a number with the English "of" wording
 *  2. Short-topic knowledge queries (rizz, cbt, aura) clearing the
 *     confidence floor
 *  3. New knowledge entries: Hafez of Shiraz and George Orwell / 1984
 *  4. Depression-rule coverage for despair phrases (tired of life, done
 *     with everything, life feels pointless) in both languages
 *  5. The same-rule streak guard no longer degrades repeated heavy
 *     disclosures to an incoherent "return to the topic" reply
 *  6. Positive achievements are celebrated instead of read as work stress
 *  7. Fun-fact topic filter resolves astronomy/نجوم to the space pool
 *  8. Identity questions stay on the identity pools in both languages
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN, DaryaKnowledge } from './helpers.mjs';

// ---------------------------------------------------------------------------
// 1. Square root with "of"
// ---------------------------------------------------------------------------

test('math sqrt: answers "square root of 144" via the English of-connector', () => {
  const e = freshEngine(EN);
  const reply = e.respond('What is the square root of 144?');
  assert.match(reply, /12\b/);
});

test('math sqrt: does not double-handle a sum containing a sqrt', () => {
  const e = freshEngine(EN);
  const reply = e.respond('5 + sqrt(4)');
  assert.doesNotMatch(reply, /square root of 4/i);
});

test('math sqrt: keeps the Persian از genitive working', () => {
  const e = freshEngine(FA);
  const reply = e.respond('جذر ۱۶ چند میشه');
  assert.match(reply, /۴/);
});

// ---------------------------------------------------------------------------
// 2. Short-topic knowledge queries
// ---------------------------------------------------------------------------

test('knowledge lookup: framed short topic word rizz clears the confidence floor', () => {
  const hit = DaryaKnowledge.lookup('what is rizz?', 'en');
  assert.ok(hit, 'rizz should match a fact');
  assert.ok(hit.confidence >= 0.35, `confidence ${hit.confidence} below floor`);
  assert.equal(hit.topic, 'genz_slang');
});

test('knowledge lookup: framed short topic word cbt clears the confidence floor', () => {
  const hit = DaryaKnowledge.lookup('explain cbt to me', 'en');
  assert.ok(hit, 'cbt should match a fact');
  assert.ok(hit.confidence >= 0.35, `confidence ${hit.confidence} below floor`);
  assert.equal(hit.topic, 'cbt');
});

test('engine: what is rizz answers from the slang fact, not the unknown pool', () => {
  const e = freshEngine(EN);
  const reply = e.respond('What is rizz?');
  assert.match(reply, /charm or charisma/i);
});

test('engine: explain cbt answers from the therapy fact, not a work question', () => {
  const e = freshEngine(EN);
  const reply = e.respond('Explain CBT to me');
  assert.match(reply, /cognitive behavioral therapy/i);
  assert.doesNotMatch(reply, /work/i);
});

// ---------------------------------------------------------------------------
// 3. New knowledge entries
// ---------------------------------------------------------------------------

test('knowledge lookup: Hafez of Shiraz is answerable in English', () => {
  const e = freshEngine(EN);
  const reply = e.respond('Tell me about the Persian poet Hafez');
  assert.match(reply, /Hafez of Shiraz/i);
});

test('knowledge lookup: Hafez of Shiraz is answerable in Persian', () => {
  const e = freshEngine(FA);
  const reply = e.respond('درباره حافظ توضیح بده');
  assert.match(reply, /حافظ/);
  assert.match(reply, /شیراز/);
});

test('knowledge lookup: who wrote 1984 answers George Orwell in both languages', () => {
  const en = freshEngine(EN);
  assert.match(en.respond('Who wrote 1984?'), /George Orwell/i);
  const fa = freshEngine(FA);
  assert.match(fa.respond('1984 نوشته کیه'), /اورول/);
});

// ---------------------------------------------------------------------------
// 4. Depression-rule coverage for despair phrases
// ---------------------------------------------------------------------------

test('depression rule: "tired of life" routes to depression support in English', () => {
  const e = freshEngine(EN);
  const reply = e.respond('I am tired of life');
  assert.ok(e.currentTurnTopics.includes('depression'));
  assert.doesNotMatch(reply, /relationship/i);
});

test('depression rule: "done with everything" routes to depression support', () => {
  const e = freshEngine(EN);
  const reply = e.respond('I am so done with everything');
  assert.ok(e.currentTurnTopics.includes('depression'));
});

test('depression rule: despair phrases route to depression in Persian', () => {
  const e = freshEngine(FA);
  for (const turn of ['من از زندگی خسته شدم', 'زندگی بی معنی شده']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(turn);
    assert.ok(
      engine.currentTurnTopics.includes('depression'),
      `${turn} should route to depression`
    );
    assert.doesNotMatch(reply, /شکایت شغلی/i);
  }
});

test('depression rule: does not over-trigger on ordinary work fatigue', () => {
  const e = freshEngine(EN);
  const reply = e.respond('I am tired of my job');
  assert.ok(e.currentTurnTopics.includes('work'));
  assert.ok(!e.currentTurnTopics.includes('depression'));
  const fa = freshEngine(FA);
  fa.respond('از کارم خسته شدم');
  assert.ok(!fa.currentTurnTopics.includes('depression'));
});

// ---------------------------------------------------------------------------
// 5. Same-rule streak guard does not degrade heavy disclosures
// ---------------------------------------------------------------------------

test('streak guard: three consecutive depression disclosures all get caring support', () => {
  const e = freshEngine(EN);
  const replies = [
    e.respond('I am tired of life'),
    e.respond('I am so done with everything'),
    e.respond('Life feels pointless')
  ];
  for (const r of replies) {
    assert.match(
      r,
      /(?:depress|professional|courage|support|qualified|doctor)/i
    );
    assert.doesNotMatch(r, /return to the topic|moved away from something/i);
  }
});

// ---------------------------------------------------------------------------
// 6. Achievement celebration
// ---------------------------------------------------------------------------

test('achievement rule: a promotion is celebrated, not read as work stress', () => {
  const e = freshEngine(EN);
  const reply = e.respond('I just got promoted at work!');
  assert.ok(e.currentTurnTopics.includes('achievement'));
  assert.match(
    reply,
    /congratul|celebrate|happy for you|wonderful|accomplish|proud|credit|great/i
  );
});

test('achievement rule: good news does not fire on failures', () => {
  const e = freshEngine(EN);
  e.respond('I did not get the promotion');
  assert.ok(!e.currentTurnTopics.includes('achievement'));
  const fa = freshEngine(FA);
  fa.respond('ترفیع نگرفتم');
  assert.ok(!fa.currentTurnTopics.includes('achievement'));
});

test('achievement rule: Persian promotion and job-success are celebrated', () => {
  const e = freshEngine(FA);
  for (const turn of ['تازه تو کارم ترفیع گرفتم', 'کار قبول شدم']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(turn);
    assert.ok(engine.currentTurnTopics.includes('achievement'), `${turn}`);
    assert.match(reply, /خوشحالم|تبریک|موفقیت|جشن/i);
  }
});

test('achievement rule: getting fired stays on the work-stress pool', () => {
  const e = freshEngine(EN);
  const reply = e.respond('I got fired');
  assert.ok(!e.currentTurnTopics.includes('achievement'));
  assert.ok(e.currentTurnTopics.includes('work'));
});

// ---------------------------------------------------------------------------
// 7. Fun-fact space category filter
// ---------------------------------------------------------------------------

test('fun facts: an astronomy request draws from the space pool in English', () => {
  const e = freshEngine(EN);
  const reply = e.respond('Tell me a fun fact about astronomy');
  assert.match(reply, /Here is one interesting fact/i);
  assert.doesNotMatch(reply, /Olympic|athletes|sports/i);
});

test('fun facts: a نجوم request draws from the space pool in Persian', () => {
  const e = freshEngine(FA);
  const reply = e.respond('درباره نجوم یه حقیقت بگو');
  assert.match(reply, /حقیقت جالب/i);
  assert.doesNotMatch(reply, /المپیک|ورزشکار/i);
});

// ---------------------------------------------------------------------------
// 8. Identity questions stay on the identity pools
// ---------------------------------------------------------------------------

test('identity: English name and AI questions answer from identity pools', () => {
  const e = freshEngine(EN);
  const nameReply = e.respond('What is your name?');
  assert.match(nameReply, /Darya/i);
  const aiReply = freshEngine(EN).respond('Are you a real AI?');
  assert.doesNotMatch(aiReply, /ChatGPT/i);
});

test('identity: Persian "are you a real AI" is not hijacked by the AI-history fact', () => {
  const e = freshEngine(FA);
  const reply = e.respond('تو هوش مصنوعی واقعی هستی؟');
  assert.match(reply, /دریا|گفتگو|همراه/i);
  assert.doesNotMatch(reply, /ChatGPT|GPT-4|جمنای|آبان|نوامبر/i);
});
