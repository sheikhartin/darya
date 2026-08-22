/**
 * Regression tests for specific engine behaviors and edge cases.
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
  assert.match(reply, /Here's one interesting fact/i);
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

// ---------------------------------------------------------------------------
// 9. Dirty-talk / sexual-roleplay boundary
// ---------------------------------------------------------------------------

test('dirty talk: EN requests get a warm, non-shaming boundary', () => {
  for (const turn of [
    'let us do dirty talk',
    'can we sext?',
    'i want to have sex with you'
  ]) {
    const e = freshEngine(EN);
    const reply = e.respond(turn);
    assert.ok(
      e.currentTurnTopics.includes('dirty_talk_request'),
      `${turn} should route to dirty_talk_request`
    );
    assert.match(
      reply,
      /natural|human|normal|not a roleplay|not able|listen|reflect|closeness|intimacy/i
    );
    assert.doesNotMatch(
      reply,
      /i am not familiar|no precise answer|what would meeting that need/i
    );
  }
});

test('dirty talk: FA requests get a warm, non-shaming boundary', () => {
  for (const turn of [
    'بیا یه کم حرف زشت بزنیم',
    'میخوام باهات سکس کنم',
    'دوست داری نقش بازی کنیم جنسی'
  ]) {
    const e = freshEngine(FA);
    const reply = e.respond(turn);
    assert.ok(
      e.currentTurnTopics.includes('dirty_talk_request'),
      `${turn} should route to dirty_talk_request`
    );
    assert.match(
      reply,
      /طبیعی|شرم|نمی‌توانم|نمی‌تونم|نقش|شنونده|صمیمیت|انسانی/i
    );
    assert.doesNotMatch(reply, /آشنایی ندارم|جواب آماده|مهم‌ترین مانع/i);
  }
});

test('dirty talk: a genuine intimacy question does not hit the boundary', () => {
  const en = freshEngine(EN);
  const enReply = en.respond('how do I talk about sex with my partner');
  assert.ok(!en.currentTurnTopics.includes('dirty_talk_request'));
  assert.ok(enReply.length > 10);
  const fa = freshEngine(FA);
  fa.respond('چطور درباره سکس با همسرم حرف بزنم');
  assert.ok(!fa.currentTurnTopics.includes('dirty_talk_request'));
});

test('dirty talk: bare "be my girlfriend" stays on flirtation, not the boundary', () => {
  const e = freshEngine(EN);
  e.respond('be my girlfriend');
  assert.ok(!e.currentTurnTopics.includes('dirty_talk_request'));
});

// ---------------------------------------------------------------------------
// 10. Expanded knowledge (religions, movies, games, investing, health, sports)
// ---------------------------------------------------------------------------

test('knowledge: major world religions are answerable in both languages', () => {
  assert.match(
    freshEngine(FA).respond('درباره بودیسم توضیح بده'),
    /بودیسم|ادیان|هند/i
  );
  assert.match(
    freshEngine(EN).respond('what is christianity'),
    /christianity|religion|islam|jesus/i
  );
});

test('knowledge: cinema masterpieces are suggested', () => {
  const reply = freshEngine(EN).respond('best films of all time');
  // The movie pool is randomized and era-blending, so assert a numbered
  // recommendation list is returned rather than a specific title.
  assert.match(reply, /1\.|2\.|3\./);
  assert.ok(reply.length > 40, 'movie recommendation should be substantial');
});

test('knowledge: games by platform are suggested', () => {
  assert.match(
    freshEngine(EN).respond('best pc games'),
    /PC|PlayStation|Xbox|Switch/i
  );
});

test('knowledge: investing basics are answerable in both languages', () => {
  assert.match(
    freshEngine(EN).respond('how to start investing'),
    /emergency|invest|diversify|long term|risk/i
  );
  assert.match(
    freshEngine(FA).respond('چطور سرمایه گذاری کنم'),
    /سرمایه|صندوق اضطراری|تنوع|ریسک/i
  );
});

test('knowledge: healthy nutrition is answerable', () => {
  assert.match(
    freshEngine(EN).respond('how to eat healthy'),
    /vegetable|protein|water|grains|sugar/i
  );
});

test('knowledge: sports cardio (running/yoga) is answerable', () => {
  assert.match(
    freshEngine(EN).respond('how do i start running'),
    /cardio|walk|jog|running|yoga|swimming/i
  );
});

// ---------------------------------------------------------------------------
// 11. Break-line separation for long list answers
// ---------------------------------------------------------------------------

test('break-lines: a list answer separates Darya closing question with a blank line', () => {
  const reply = freshEngine(EN).respond('recommend a good movie');
  assert.match(
    reply,
    /\n\nWant me to tell you more/i,
    `expected a blank line before the follow-up: "${reply}"`
  );
});

test('break-lines: a paragraph answer keeps a single space before the follow-up', () => {
  const reply = freshEngine(EN).respond('What is the capital of France?');
  assert.doesNotMatch(
    reply,
    /\n\n/,
    'paragraph answers should not add a blank line'
  );
});

// ---------------------------------------------------------------------------
// 12. Randomized media recommendations
// ---------------------------------------------------------------------------

test('media pool: a movie request returns a fresh, era-blending list', () => {
  const e = freshEngine(EN);
  const a = e.respond('recommend a good movie');
  const b = freshEngine(EN).respond('recommend a good movie');
  assert.match(a, /1\.|2\.|3\./);
  assert.match(b, /1\.|2\.|3\./);
  // Two independent draws should not be identical (the pool mixes eras).
  assert.notEqual(a, b, 'movie recommendations should vary across draws');
});

test('media pool: series and movie asks are distinguished in Persian', () => {
  const movie = freshEngine(FA).respond('یه فیلم خوب معرفی کن');
  const series = freshEngine(FA).respond('یه سریال خوب معرفی کن');
  assert.match(movie, /۱\.|۲\.|۳\./);
  // A series ask should recommend series, not movies. The broad series
  // reply always contains one familiar anchor drawn from the pool's
  // anchor set (see recommendMedia), so asserting on exactly that set
  // keeps the test deterministic instead of flaking when the random
  // fill happens to avoid the older spot-check titles.
  assert.match(series, /The Bear|Dark|Chernobyl|Arcane|Severance/i);
});

// ---------------------------------------------------------------------------
// 13. Project awareness: export, save, session persistence
// ---------------------------------------------------------------------------

test('project: export command points to the real menu button', () => {
  const en = freshEngine(EN);
  const reply = en.respond('can you export my session?');
  assert.ok(en.currentTurnTopics.includes('app_export'));
  assert.match(reply, /export|menu|download|file/i);
  const fa = freshEngine(FA);
  fa.respond('میخوام گفتگو رو دانلود کنم');
  assert.ok(fa.currentTurnTopics.includes('app_export'));
});

test('project: session persistence is answered honestly', () => {
  const en = freshEngine(EN);
  const reply = en.respond('will this conversation be saved after refresh?');
  assert.ok(en.currentTurnTopics.includes('session_persistence'));
  assert.match(reply, /tab|refresh|theme|saved|export|memory/i);
  const fa = freshEngine(FA);
  const faReply = fa.respond('بعد از رفرش این مکالمه پاک میشه؟');
  assert.ok(fa.currentTurnTopics.includes('session_persistence'));
  assert.match(faReply, /رفرش|تم|ذخیره|export|حافظه|تب/i);
});

// ---------------------------------------------------------------------------
// 14. Teaching topic with risk disclaimer
// ---------------------------------------------------------------------------

test('teaching: trading answers with a serious risk disclaimer', () => {
  for (const [lang, q] of [
    [EN, 'how do i start trading?'],
    [FA, 'چطور ترید کنم']
  ]) {
    const e = freshEngine(lang);
    const reply = e.respond(q);
    assert.match(
      reply,
      /warning|risk|lose|guarantee|demo|not financial advice|هشدار|ریسک|ضرر|تضمین|دمو/i
    );
  }
});

// ---------------------------------------------------------------------------
// 15. Self-awareness
// ---------------------------------------------------------------------------

test('self-awareness: identity questions route to the darya_self pool', () => {
  const en = freshEngine(EN);
  const reply = en.respond('are you self aware?');
  assert.ok(en.currentTurnTopics.includes('darya_self'));
  assert.ok(reply.length > 10);
  const fa = freshEngine(FA);
  fa.respond('آیا خودآگاهی داری؟');
  assert.ok(fa.currentTurnTopics.includes('darya_self'));
});
