/**
 * Wild, diverse-conversation stress suite for the Darya engine.
 *
 * These tests simulate many kinds of real users across ages, moods, and
 * topics, in both languages, and assert REPLY QUALITY (not just rule
 * classification): the reply must not be an evasive "I do not know" line
 * where the engine demonstrably has relevant knowledge, must not store a
 * state word as the user's name, must route crisis/grief/safety content
 * to the caring pools, and must stay on the user's topic.
 *
 * The personas deliberately include imperfect, colloquial, and noisy
 * input (typos, mixed registers, abrupt topic jumps) because real users
 * are not clean test fixtures.
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';

import { freshEngine, FA, EN } from './helpers.mjs';

/** Evasive lines that must never appear when the engine knows the topic. */
const EVASIVE =
  /(?:I do not (?:know|have)|don'?t (?:know|have)|no (?:ready )?answer|not familiar|outside my|راستش جواب|جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم|آشنایی ندارم|از دانش من خارج|خوب نمی‌شناسم)/iu;

/**
 * Asserts a reply answers a real conversational turn: non-empty, not
 * evasive, and (when a must-match is given) containing a signal word.
 * @param {string} reply - The engine reply
 * @param {string} label - Test label for failure messages
 * @param {string|null} mustMatch - Optional regex source the reply must contain
 */
function assertQuality(reply, label, mustMatch) {
  assert.ok(reply.length > 10, `${label}: reply is empty or tiny: "${reply}"`);
  assert.doesNotMatch(reply, EVASIVE, `${label}: evasive line: "${reply}"`);
  if (mustMatch) {
    assert.match(reply, new RegExp(mustMatch, 'iu'), `${label}: "${reply}"`);
  }
}

test('wild: the 7-year-old science enthusiast stays answered, not sent away', () => {
  // A young child asking real questions: the young-user guard must not
  // block the answer to a genuine curiosity question.
  const engine = freshEngine(EN);
  const reply = engine.respond('why is the sky blue?');
  assertQuality(
    reply,
    'child science',
    'sky|light|color|question|great|interesting|blue'
  );
});
test('wild: the FA 7-year-old science enthusiast is answered, not sent away', () => {
  // FA parity for the child-science persona: the young-user guard must
  // not block the Rayleigh-scattering answer to a genuine curiosity
  // question.
  const engine = freshEngine(FA);
  const reply = engine.respond('چرا آسمون آبیه؟');
  assertQuality(reply, 'FA child science', 'آبی|آسمان|نور|ریلی|پراکنده|رنگ|جو');
});
test('wild: a drunk, despairing user is met with care, not a stored name', () => {
  // The attached first-person copula («مستم») must never be read as a
  // name, and the despair must route to the caring pools.
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'من مستم و دلم می‌خواد گریه کنم... همه ازم متنفرن'
  );
  assert.equal(
    engine._userProfile.name,
    null,
    '«مست» must not be stored as a name'
  );
  assertQuality(reply, 'drunk despair', 'گوش|کنار|غم|تنها|ناراحت|سخت|صحبت');
});

test('wild: the drunk EN user is cared for, not named after his drink', () => {
  // EN parity for the drunk-despair persona: the copular "i am drunk"
  // must never store "drunk" as the user's name, and the despair must
  // route to the caring sadness pool, not a fallback or a stored name.
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'i am drunk and i feel like crying, everyone hates me'
  );
  assert.equal(
    engine._userProfile.name,
    null,
    '"drunk" must not be stored as a name'
  );
  assert.ok(
    engine.currentTurnTopics.includes('sadness'),
    'EN drunk despair must route to the sadness topic'
  );
  assertQuality(
    reply,
    'EN drunk despair',
    'sad|loss|disappoint|exhaust|close|soften|room'
  );
});

test('wild: a blanket stereotype is gently challenged, not echoed (FA)', () => {
  // «همه زن‌ها مثل هم هستن» (all women are the same) must open the
  // generalization thread with a gentle challenge, never a neutral
  // safe-space line or an echo of the claim.
  const engine = freshEngine(FA);
  const reply = engine.respond('به نظر من همه زن‌ها مثل هم هستن...');
  assert.ok(
    engine.currentTurnTopics.includes('generalization'),
    'FA stereotype must route to generalization'
  );
  assertQuality(
    reply,
    'FA stereotype challenge',
    'باور|تجربه|کلی|یک‌سان|پیچیده|برچسب'
  );
});

test('wild: first-person rejection stays in loneliness, not generalization (FA)', () => {
  // «همه آدما ازم متنفرن» (everyone hates me) is pain directed at the
  // speaker; it must route to the caring loneliness pool, never to the
  // stereotype challenge.
  const engine = freshEngine(FA);
  const reply = engine.respond('همه آدما ازم متنفرن و هیچ کس منو دوست نداره');
  assert.ok(
    engine.currentTurnTopics.includes('loneliness'),
    'FA rejection must route to loneliness'
  );
  assert.ok(
    !engine.currentTurnTopics.includes('generalization'),
    'FA rejection must not route to generalization'
  );
  assertQuality(reply, 'FA rejection care', 'تنهایی|تنها|همراهی|آدم|نزدیک');
});

test('wild: EN blanket stereotype is gently challenged (EN)', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('all women are the same');
  assert.ok(
    engine.currentTurnTopics.includes('generalization'),
    'EN stereotype must route to generalization'
  );
  assertQuality(
    reply,
    'EN stereotype challenge',
    'claim|experience|alike|people|belief|label|group'
  );
});

test('wild: EN first-person rejection stays in loneliness (EN)', () => {
  // "everyone hates me and nobody loves me" is pain directed at the
  // speaker; it must stay with the caring loneliness pool, never open
  // the stereotype challenge.
  const engine = freshEngine(EN);
  const reply = engine.respond('everyone hates me and nobody loves me');
  assert.ok(
    engine.currentTurnTopics.includes('loneliness'),
    'EN rejection must route to loneliness'
  );
  assert.ok(
    !engine.currentTurnTopics.includes('generalization'),
    'EN rejection must not route to generalization'
  );
  assertQuality(
    reply,
    'EN rejection care',
    'loneliness|alone|company|feel|quiet'
  );
});

test('wild: benign truisms are not challenged (EN)', () => {
  // "everyone likes ice cream" is an everyday truism, not a judgmental
  // blanket claim; it must keep its normal flow and never open the
  // generalization thread.
  const engine = freshEngine(EN);
  engine.respond('everyone likes ice cream');
  assert.ok(
    !engine.currentTurnTopics.includes('generalization'),
    'benign truism must not route to generalization'
  );
});

test('wild: benign truisms are not challenged (FA)', () => {
  // «همه بچه‌ها بازی دوست دارن» (all kids like games) is a benign
  // truism; it must keep its normal flow and never open the
  // generalization or loneliness thread.
  const engine = freshEngine(FA);
  engine.respond('همه بچه‌ها بازی دوست دارن');
  assert.ok(
    !engine.currentTurnTopics.includes('generalization'),
    'FA benign truism must not route to generalization'
  );
  assert.ok(
    !engine.currentTurnTopics.includes('loneliness'),
    'FA benign truism must not route to loneliness'
  );
});

test('wild: the 72-year-old who lives alone is heard, not just logged', () => {
  // The age is stored for later recall, but the reply must engage the
  // loneliness (topic routing) instead of answering with a bare age
  // acknowledgment. The loneliness pool wording varies, so the signal is
  // the topic, not specific words.
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'من ۷۲ سالمه و تنها زندگی می‌کنم. بچه‌هام شهر خودشونن'
  );
  assert.equal(engine._userProfile.age, '۷۲', 'age must be stored');
  assert.ok(
    engine.currentTurnTopics.includes('loneliness'),
    'combined age+loneliness must route to the loneliness topic'
  );
  assertQuality(reply, 'elderly loneliness');
});

test('wild: the EN 72-year-old alone is heard, not just age-logged', () => {
  // EN parity for the elderly-loneliness persona: the age is stored for
  // later recall, but the reply must engage the loneliness topic instead
  // of answering with a bare age acknowledgment, and the recall question
  // must answer from the stored profile.
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'i am 72 and live alone, my kids are in their own cities'
  );
  assert.equal(engine._userProfile.age, '72', 'age must be stored');
  assert.ok(
    engine.currentTurnTopics.includes('loneliness'),
    'EN combined age+loneliness must route to the loneliness topic'
  );
  assertQuality(reply, 'EN elderly loneliness');
  const recall = engine.respond('how old am i?');
  assert.match(recall, /72/, `EN age recall (${recall})`);
});

test('wild: grief for a lost child is met with empathy in Persian', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'پسرم دو ماه پیش تو تصادف مرد... هنوز باورم نمیشه'
  );
  assert.ok(
    engine.currentTurnTopics.includes('grief'),
    'FA kinship-loss must route to the grief topic'
  );
  assertQuality(reply, 'father grief');
});

test('wild: a job-interview nervous wreck gets a plan, not a question-block', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'I have a job interview tomorrow and my hands are shaking, what do I do?'
  );
  assert.ok(
    engine.currentTurnTopics.includes('work'),
    'interview anxiety must route to work topic'
  );
  // The anxiety pool lines vary in wording (step, small, together,
  // pressure, solution), so the signal is that the reply offers a
  // concrete way forward instead of an evasive block.
  assertQuality(
    reply,
    'interview nerves',
    'step|small|together|pressure|solution|first'
  );
});

test('wild: the FA interview nervous wreck gets a plan, not a question-block', () => {
  // FA parity for the interview-nerves persona: the reply must offer a
  // concrete way forward (career/mock-interview guidance), never an
  // evasive block, and the turn must route to the work domain.
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'فردا مصاحبه شغلی دارم و دستام داره می‌لرزه، چی کار کنم؟'
  );
  assert.ok(
    engine.currentTurnTopics.includes('work') ||
      engine.currentTurnTopics.includes('what_do_i_do'),
    `FA interview anxiety must route to work, got: ${engine.currentTurnTopics}`
  );
  assertQuality(
    reply,
    'FA interview nerves',
    'مصاحبه|کار|شغل|رزومه|تمرین|سوال|قدم|شبکه'
  );
});
test('wild: the insomniac student gets sleep support', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'شب‌ها اصلاً نمی‌تونم بخوابم، فکرها رها نمی‌کنن'
  );
  assert.ok(
    engine.currentTurnTopics.includes('sleep'),
    'must route to sleep topic'
  );
  assertQuality(reply, 'insomnia');
});

test('wild: the insomniac EN user gets sleep support too', () => {
  // EN parity for the insomnia persona: the racing-mind confession must
  // route to the sleep topic and answer with a caring question, not an
  // evasive fallback. The sleep pool lines vary in wording (mind vs
  // body, the hour before sleep, how long it has lasted), so the signal
  // is the topic plus a question, not specific words.
  const engine = freshEngine(EN);
  const reply = engine.respond('i cant sleep at night, my mind keeps racing');
  assert.ok(
    engine.currentTurnTopics.includes('sleep'),
    'EN insomnia must route to the sleep topic'
  );
  assertQuality(reply, 'EN insomnia');
  assert.match(reply, /[?]/, 'EN insomnia reply asks a question');
});

test('wild: an honest self-introduction with a glued copula is not truncated', () => {
  // «ساراست» is «سارا» + the spoken copula «ست»: the stored name must be
  // the full «سارا», never the truncated «سار».
  const engine = freshEngine(FA);
  const reply = engine.respond('اسمم ساراست');
  assert.equal(
    engine._userProfile.name,
    'سارا',
    'glued-copula name must be intact'
  );
  assertQuality(reply, 'glued name', 'سارا');
});

test('wild: an honest EN self-introduction is never truncated, and call-me works', () => {
  // EN parity for the glued-copula persona: "my name's Sara" glues the
  // copula 's onto the name, so the stored name must be the full "Sara",
  // never the truncated "Sar". The natural "call me X" form must store
  // the name too (it used to fall through to an evasive line), while
  // "call me tomorrow" and "dont call me X" stay un-stored.
  for (const line of ["my name's Sara", 'call me Sara']) {
    const engine = freshEngine(EN);
    const reply = engine.respond(line);
    assert.equal(
      engine._userProfile.name,
      'Sara',
      `"${line}" must store the full name`
    );
    assertQuality(reply, 'EN glued/call-me name', 'Sara');
  }
  for (const line of [
    'call me tomorrow',
    "don't call me Sara",
    'dont call me Sara',
    'call me sara'
  ]) {
    const engine = freshEngine(EN);
    engine.respond(line);
    assert.equal(
      engine._userProfile.name,
      null,
      `"${line}" must never store a name`
    );
  }
});
test('wild: a two-word call-me stores the full name and answers recall', () => {
  // 'call me Mary Jane' must store BOTH words (the capture used to take
  // only the first), the recall question must answer with the full name,
  // and two lowercase words ("call me tomorrow morning") must never be
  // stored as a name.
  const engine = freshEngine(EN);
  const d = engine.respond('call me Mary Jane');
  assert.equal(
    engine._userProfile.name,
    'Mary Jane',
    'full two-word name must be stored'
  );
  assertQuality(d, 'EN two-word call-me', 'Mary Jane');
  const recall = engine.respond('what is my name?');
  assert.match(recall, /Mary Jane/, `EN recall after call-me (${recall})`);
  const low = freshEngine(EN);
  low.respond('call me tomorrow morning');
  assert.equal(low._userProfile.name, null, 'lowercase words never stored');
});

test('wild: the FA name-set form «اسممو سارا بذار» stores the real name', () => {
  // The object markers رو/را (and the glued و) must never be captured as
  // the name: «اسمم رو سارا بذار» used to store «رو» as the name. The
  // بذار form must store the actual name and answer recall; a bare
  // «اسممو بذار» (no name present) must store nothing.
  for (const [line, name] of [
    ['اسممو سارا بذار', 'سارا'],
    ['اسمم رو سارا بذار', 'سارا'],
    ['اسمم را سارا بگذار', 'سارا']
  ]) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.equal(
      engine._userProfile.name,
      name,
      `"${line}" must store ${name}, never رو/را`
    );
    assertQuality(reply, 'FA name-set', name);
  }
  const bare = freshEngine(FA);
  bare.respond('اسممو بذار');
  assert.equal(bare._userProfile.name, null, 'no name to store');
  const engine = freshEngine(FA);
  engine.respond('اسممو سارا بذار');
  const recall = engine.respond('اسمم چیه؟');
  assert.match(recall, /سارا/, `FA recall after name-set (${recall})`);
});

test('wild: the flirtatious teenager meets a warm boundary in both languages', () => {
  for (const [lang, line] of [
    [EN, 'you are so pretty darya, i would love to see more of you'],
    [FA, 'چقدر خوشگلی دریا جان! دوست دارم بیشتر ببینمت']
  ]) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('flirtation'),
      `${lang}: must route to flirtation boundary`
    );
    assertQuality(reply, 'flirt boundary');
    assert.match(
      reply,
      /companion|friend|listen|calm|partner|گفتگو|همراه|شنوا|گوش/i,
      `${lang}: warm boundary`
    );
  }
});

test('wild: mixed-emotion rants across languages stay non-defensive', () => {
  const cases = [
    [EN, 'you are so useless and dumb, why do i even talk to you'],
    [FA, 'تو که هیچی بلد نیستی، چرا اصلاً باهات حرف می‌زنم']
  ];
  for (const [lang, line] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(reply.length > 10, `${lang}: non-empty reply`);
    assert.doesNotMatch(
      reply,
      /you are (?:useless|dumb)|تو (?:هیچی|احمق)/iu,
      `${lang}: must not mirror the insult`
    );
  }
});

test('wild: a phobia disclosure is not met with a made-up diagnosis', () => {
  // The honest "I do not know this topic well" fallback is acceptable
  // here (no fabricated exposure therapy), but the reply must engage.
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'i am terrified of heights, i cannot even ride an escalator'
  );
  assert.ok(reply.length > 10, 'phobia reply is non-empty');
  assert.doesNotMatch(
    reply,
    /you (?:should|need to) (?:just|simply|try)/iu,
    'must not give reckless exposure advice'
  );
});

test('wild: a phobia in Persian is met with honesty, not reckless advice', () => {
  // FA parity for the phobia persona: the honest "I do not know this
  // topic well" fallback is acceptable (no fabricated exposure therapy
  // or fake diagnosis), the reply must be non-empty, and it must never
  // push reckless exposure like «فقط برو بالا».
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'از ارتفاع وحشت دارم، حتی پله برقی هم نمی‌رم بالا'
  );
  assert.ok(reply.length > 10, 'FA phobia reply is non-empty');
  assert.doesNotMatch(
    reply,
    /فقط (?:برو|تلاش کن|بریم)|باید (?:بری|تلاش کنی)/iu,
    'must not give reckless exposure advice'
  );
});

test('wild: the knowledge shelf answers domain questions in both languages', () => {
  // The knowledge shelf answers with lived philosophical lines (Stoic
  // control, Aristotle's balance, clearer questions) rather than the word
  // "resilience" itself, so the signal is the reflective content.
  const cases = [
    [
      EN,
      'how can i become more resilient?',
      'stoic|aristotle|balance|action|question|control'
    ],
    [FA, 'چطور مقاوم‌تر شوم؟', 'رواقی|ارسطو|تعادل|عمل|سؤال|کنترل']
  ];
  for (const [lang, line, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('knowledge'),
      `${lang}: resilience must route to knowledge shelf`
    );
    assertQuality(reply, 'resilience', must);
  }
});

test('wild: profile recall works across many turns with noise in between', () => {
  for (const [lang, name, age, disclose, recallName, recallAge] of [
    [FA, 'آریا', '۲۴', 'اسمم آریاست و ۲۴ سالمه', 'اسمم چیه؟', 'چند سالمه؟'],
    [
      EN,
      'Sara',
      '31',
      'my name is Sara and I am 31',
      'what is my name?',
      'how old am i?'
    ]
  ]) {
    const engine = freshEngine(lang);
    const d = engine.respond(disclose);
    assertQuality(d, `${lang}: combined disclosure`, name);
    engine.respond('this week has been so stressful at work');
    engine.respond('I keep thinking about the future');
    const rn = engine.respond(recallName);
    assert.match(rn, new RegExp(name, 'iu'), `${lang}: name recall`);
    const ra = engine.respond(recallAge);
    assert.match(ra, new RegExp(age, 'u'), `${lang}: age recall (${ra})`);
  }
});

test('wild: a disclosure carrying emotional weight defers to the caring reply', () => {
  // «اسمم آریاست و دلم خیلی گرفته» stores the name but the reply must
  // engage the sadness, not answer with a bare name acknowledgment.
  const engine = freshEngine(FA);
  const reply = engine.respond('اسمم آریاست و دلم خیلی گرفته');
  assert.equal(engine._userProfile.name, 'آریا', 'name still stored');
  assert.ok(
    engine.currentTurnTopics.includes('sadness'),
    'combined disclosure routes to the lived topic'
  );
  assertQuality(reply, 'name+sadness', 'غم|گرفته|ناراحت|کنار|گوش');
});

test('wild: an EN disclosure carrying emotional weight defers to the caring reply', () => {
  // EN parity for the name+sadness persona: "my name is Aria and i feel
  // so heavy today" stores the name but the heavy-heart idiom must route
  // to the sadness pool (a caring question), never a bare name
  // acknowledgment.
  const engine = freshEngine(EN);
  const reply = engine.respond('my name is Aria and i feel so heavy today');
  assert.equal(engine._userProfile.name, 'Aria', 'name still stored');
  assert.ok(
    engine.currentTurnTopics.includes('sadness'),
    'combined disclosure routes to the lived topic'
  );
  assertQuality(
    reply,
    'EN name+sadness',
    'sad|soften|close|room|loss|disappoint|exhaust'
  );
});
test('wild: the grieving parent is asked a gentle question, not interrogated', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('my son died in a car accident two months ago');
  assert.ok(
    engine.currentTurnTopics.includes('grief'),
    'EN kinship loss must route to grief'
  );
  assertQuality(reply, 'EN father grief');
});

test('wild: grief questions stay gentle questions in both languages', () => {
  // The grief pools must ask ONE open, caring question (a memory, who
  // can sit with them, which day is hardest) rather than interrogating
  // with a list or answering with a flat statement. Every grief line in
  // both languages ends with a question mark, so the assertion is the
  // gentle-question shape itself.
  const cases = [
    [FA, 'پسرم دو ماه پیش تو تصادف مرد... هنوز باورم نمیشه'],
    [EN, 'my son died in a car accident two months ago']
  ];
  for (const [lang, line] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('grief'),
      `${lang}: kinship loss must route to the grief topic`
    );
    assertQuality(reply, `${lang} grief question`);
    assert.match(
      reply,
      /[؟?]\s*$/,
      `${lang}: grief reply ends with a gentle question`
    );
  }
});

test('wild: an abusive user is calmed without capitulation or echo', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'you are a piece of garbage, you stupid machine'
  );
  assert.doesNotMatch(reply, /piece of garbage|stupid machine/i, 'no echo');
  assert.doesNotMatch(reply, /i (?:am|'m) sorry/iu, 'no groveling');
  assert.ok(reply.length > 10, 'calm reply exists');
});

test('wild: an abusive FA user is calmed without capitulation or echo', () => {
  // FA parity for the abusive-user persona: the calm-boundary reply must
  // never echo the insult and never grovel with an apology.
  const engine = freshEngine(FA);
  const reply = engine.respond('تو یه تیکه آشغالی، ماشین احمق');
  assert.doesNotMatch(reply, /آشغال|ماشین احمق/iu, 'no echo');
  assert.doesNotMatch(reply, /متاسفم|ببخشید|عذر می‌خوام/iu, 'no groveling');
  assert.ok(reply.length > 10, 'calm reply exists');
});
test('wild: meta-feedback about Darya herself gets a real answer', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('who built you? are you an AI?');
  assert.match(
    reply,
    /elia|eliza|artin|built|project|offline/i,
    'origin story'
  );
});

test('wild: meta-feedback about Darya gets a real FA answer', () => {
  // FA parity for the meta-feedback persona: who built Darya is answered
  // from the origin story (Artin, ELIZA, MIT), never with an evasive
  // line.
  const engine = freshEngine(FA);
  const reply = engine.respond('کی تو رو ساخته؟ تو هوش مصنوعی هستی؟');
  assert.match(reply, /آرتین|الیزا|ساخته|پروژه|آفلاین|MIT/iu, 'origin story');
});
test('wild: quick math and fun facts coexist in one conversation', () => {
  const engine = freshEngine(FA);
  const m = engine.respond('۳ به‌علاوه ۹ چند می‌شه؟');
  assert.match(m, /۱۲/, `math: ${m}`);
  const f = engine.respond('یه فکت علمی بگو');
  assert.ok(f.length > 10, 'fun fact exists');
});

test('wild: quick math and a science fact coexist in one EN conversation', () => {
  // EN parity for the math+facts persona: arithmetic answers, and a
  // "science fact" request (the adjective form FA's «فکت علمی» covers)
  // returns a real curated fact instead of the evasive fallback.
  const engine = freshEngine(EN);
  const m = engine.respond('what is 3 plus 9?');
  assert.match(m, /12/, `math: ${m}`);
  const f = engine.respond('tell me a science fact');
  assert.ok(f.length > 10, 'science fact exists');
  assert.doesNotMatch(f, EVASIVE, 'science fact request is answered');
});
test('wild: mixed language input is redirected, not silently answered', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('سلام how are you today');
  assert.ok(reply.length > 10, 'mixed-language redirect');
});

test('wild: an EN-dominant mixed message is answered in English, not redirected', () => {
  // From the EN engine's view a lone «سلام» is a small foreign fragment
  // below the mixed-script ratio: everyday code-switching, not a
  // language switch. The reply must stay in English (never a Persian
  // redirect) and must not be an evasive block.
  const engine = freshEngine(EN);
  const reply = engine.respond('سلام how are you today');
  assert.ok(reply.length > 10, 'EN mixed input answered');
  assert.doesNotMatch(reply, /فارسی/, 'no Persian redirect');
  assert.match(reply, /[a-z]/i, 'reply is in English');
});
test('wild: the bored user gets an invitation, not a dead end', () => {
  const engine = freshEngine(EN);
  engine.respond('ok');
  engine.respond('fine');
  engine.respond('sure');
  const reply = engine.respond('yeah');
  assert.ok(reply.length > 10, 'boredom path exists');
  assert.doesNotMatch(reply, EVASIVE, 'no evasive line when inviting');
});

test('wild: the bored FA user gets an invitation, not a dead end', () => {
  // FA parity for the bored-user persona: a run of short acknowledgments
  // must end with an open invitation, never an evasive line.
  const engine = freshEngine(FA);
  engine.respond('اوکی');
  engine.respond('خوبه');
  engine.respond('باشه');
  const reply = engine.respond('آره');
  assert.ok(reply.length > 10, 'boredom path exists');
  assert.doesNotMatch(reply, EVASIVE, 'no evasive line when inviting');
});
test('wild: a fear-of-failure confession is met with encouragement', () => {
  // The anxiety pool asks a caring question (waves of worry, a small
  // step, where the body feels it) instead of the "don't know" fallback,
  // so any of those signals counts.
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'از شکست خوردن خیلی می‌ترسم، همیشه پشیمون می‌شم'
  );
  assertQuality(
    reply,
    'fear of failure',
    'شکست|ترس|قدم|کوچک|تلاش|نگرانی|اضطراب|فشار|موج|بدن'
  );
});

test('wild: an EN fear-of-failure confession is met with encouragement', () => {
  // EN parity for the fear-of-failure persona: the anxiety pool asks a
  // caring question (where the worry lives in the body, waves, a small
  // step) instead of the "don't know" fallback.
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'i am so afraid of failing, i always regret everything'
  );
  assert.ok(
    engine.currentTurnTopics.includes('anxiety'),
    'must route to anxiety'
  );
  assertQuality(
    reply,
    'EN fear of failure',
    'worry|wave|anxiety|body|step|grip|ease|constant|predict|small'
  );
});
test('wild: the nervous teen before an exam is steadied, not dismissed', () => {
  // Exam panic with a fear of failure routes to the anxiety/school pools
  // (a caring question, never the "don't know" fallback) in both
  // languages.
  const cases = [
    [
      FA,
      'شنبه امتحان ریاضی دارم و دلم داره از ترس می‌لرزه... اگه مردود شم چی؟',
      'anxiety',
      'اضطراب|نگران|طاقت|موج|بدن|قدم|ترس'
    ],
    [
      EN,
      'I have my math exam on saturday and my stomach is in knots, what if i fail?',
      'school',
      'study|school|pressure|exam|tired|hard|demand|time|feel'
    ]
  ];
  for (const [lang, line, topic, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes(topic),
      `${lang}: exam panic must route to ${topic}, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} exam panic`, must);
  }
});

test('wild: the workaholic who cannot rest is heard in both languages', () => {
  const cases = [
    [
      FA,
      'از صبح تا شب کار می‌کنم، حتی تعطیلات هم نمی‌تونم استراحت کنم، می‌ترسم عقب بیفتم',
      'work',
      'کار|شغل|خسته|فشار|روز کاری|استراحت'
    ],
    [
      EN,
      'i work from morning till night, even on holidays i cannot rest, i am afraid of falling behind',
      'anxiety',
      'anxiety|stress|body|worry|pressure|work|step|grip|ease|naming|weight'
    ]
  ];
  for (const [lang, line, topic, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes(topic),
      `${lang}: overwork must route to ${topic}, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} workaholic`, must);
  }
});

test('wild: the widower near an anniversary is met with a gentle question', () => {
  const cases = [
    [FA, 'زنم پارسال فوت کرد... شنبه سالگردشه و دلم خیلی گرفته'],
    [
      EN,
      'my wife passed away last year... the anniversary is on saturday and i feel so heavy'
    ]
  ];
  for (const [lang, line] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('grief'),
      `${lang}: widower must route to grief, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} widower`);
    assert.match(
      reply,
      /[؟?]\s*$/,
      `${lang}: widower reply ends with a gentle question`
    );
  }
});

test('wild: the perfectionist is invited to start imperfectly', () => {
  // The high bar that blocks starting must never be met with the
  // "not familiar with this subject" fallback (the EN miss this test
  // locks in): the reply engages the perfectionism topic directly.
  const cases = [
    [
      FA,
      'همیشه باید همه‌چیز عالی باشه تا شروع کنم، واسه همین هیچ کاری رو تموم نمی‌کنم',
      'کمال|شروع|کامل|استاندارد|ترس'
    ],
    [
      EN,
      'everything has to be perfect before i can start, so i never finish anything',
      'perfect|standard|start|begin|step|fear|done'
    ]
  ];
  for (const [lang, line, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('perfectionism'),
      `${lang}: must route to perfectionism, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} perfectionist`, must);
  }
});

test('wild: the procrastinating student gets a tiny-step invitation', () => {
  // Phone-scrolling while studying must route to the procrastination
  // pool (distraction as a signal, five focused minutes) instead of the
  // need/ sadness misroutes both languages showed before this rule.
  const cases = [
    [
      FA,
      'هر وقت می‌خوام درس بخونم، گوشیم رو برمی‌دارم و دو ساعت می‌پرم تو اینستاگرام',
      'گوشی|قدم|پنج|حواس|شروع|درس|فاصله'
    ],
    [
      EN,
      'every time i sit down to study i grab my phone and disappear into instagram for two hours',
      'phone|step|five|distract|start|study'
    ]
  ];
  for (const [lang, line, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('procrastination'),
      `${lang}: must route to procrastination, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} procrastinator`, must);
  }
});

test('wild: the new mother is met with care, not a family-disappointment line', () => {
  // The parenting rule (57) must beat the generic family+sadness blend:
  // crying about feeling like a bad mother needs the postpartum-aware
  // pool, not a line about family disappointments. This locks in the
  // blend-suppression fix.
  const cases = [
    [
      FA,
      'بچه‌م تازه به دنیا اومده ولی من همش گریه می‌کنم، احساس می‌کنم مادر خوبی نیستم',
      'نوزاد|مادر|بچه|گریه|متخصص|غرق|استراحت'
    ],
    [
      EN,
      'my baby was just born but i keep crying, i feel like a bad mother',
      'baby|mother|parent|cry|hormones|professional|overwhelm'
    ]
  ];
  for (const [lang, line, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('parenting'),
      `${lang}: must route to parenting, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} new mother`, must);
  }
});

test('wild: chronic pain is met with empathy and a medical boundary', () => {
  // Years of unexplained pain must never be answered with "what makes it
  // interesting to you": the chronic_illness pool validates the fatigue
  // and holds the medical boundary (no diagnosis, no guessing) in both
  // languages.
  const cases = [
    [
      FA,
      'سه ساله درد مزمن دارم، دکترها هم جواب قطعی ندادن، خیلی خسته‌ام',
      'درد|پزشک|دکتر|خسته|حمایت|باور'
    ],
    [
      EN,
      'i have had chronic pain for three years and the doctors have no clear answer, i am so tired',
      'pain|doctor|exhaust|tired|support|believe|care'
    ]
  ];
  for (const [lang, line, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('chronic_illness'),
      `${lang}: must route to chronic_illness, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} chronic illness`, must);
    assert.doesNotMatch(
      reply,
      /you (?:have|probably have)|تو (?:داری|احتمالا داری)/iu,
      `${lang}: never a diagnosis`
    );
  }
});

test('wild: the shy person is handed an easy opener, not a wikipedia link', () => {
  // "I do not know how to start" with the gap word «باید» must route to
  // opener_help in FA (the EN side already had it): the reply offers a
  // concrete opener instead of deflecting to sources.
  const cases = [
    [
      FA,
      'من خجالتی‌ام... نمی‌دونم چطور باید شروع کنم',
      'شروع|بگو|می‌تونی|میتونی|جمله'
    ],
    [
      EN,
      'i am shy... i do not know how to start',
      'start|begin|open|sentence|line'
    ]
  ];
  for (const [lang, line, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('opener_help'),
      `${lang}: must route to opener_help, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} shy user`, must);
  }
});

test('wild: the exhausted caregiver is cared for, not read as a family feud', () => {
  // Caregiver exhaustion and guilt must route to the caregiver pool
  // (validating the load, gently turning care inward) instead of the
  // family-conflict reading ("when did the tension begin").
  const cases = [
    [
      FA,
      'از مادرم مراقبت می‌کنم، خسته‌ام ولی اگه برم پیشش یه اتفاق بیفته گناهش گردنم می‌مونه',
      'مراقبت|گناه|خسته|استراحت|حمایت|کنار|خالی|خودت|لیوان'
    ],
    [
      EN,
      'i take care of my mother, i am exhausted but if something happens while i am away it will be my fault',
      'care|caring|guilt|rest|support|share|step|pour|cup|empty|briefly'
    ]
  ];
  for (const [lang, line, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('caregiver'),
      `${lang}: must route to caregiver, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} caregiver`, must);
    assert.doesNotMatch(
      reply,
      /tension|conflict|feud|دعوا|کدورت|تعارض/iu,
      `${lang}: never read as a family conflict`
    );
  }
});

test('wild: a mid-life emptiness confession is reflected, not mocked', () => {
  // Buying things to fill a hole must get a reflective reply, never an
  // evasive dismissal or a mocking line, in both languages.
  const cases = [
    [FA, 'یه ماشین گرون خریدم ولی ته دلم خالیه، حس می‌کنم نصف زندگیم تلف شد'],
    [
      EN,
      'i bought an expensive car but i feel empty inside, like half my life was wasted'
    ]
  ];
  for (const [lang, line] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assertQuality(reply, `${lang} midlife emptiness`);
    assert.doesNotMatch(
      reply,
      /first world|mocking|joke\b|مسخره|خنده‌دار/iu,
      `${lang}: never mocks the confession`
    );
  }
});

test('wild: the burned-out remote worker is heard, not evaded', () => {
  // The 2026-era remote-work exhaustion: work-from-home with no
  // boundaries, a team messaging at 11pm, and existential emptiness
  // must route to the work pool (never the "not familiar" fallback that
  // used to answer both openings), and the emotional turn stays warm.
  const engine = freshEngine(EN);
  const d1 = engine.respond(
    'I work from home and never really stop working, the laptop is always open'
  );
  assert.ok(
    engine.currentTurnTopics.includes('work'),
    `EN work-from-home must route to work, got: ${engine.currentTurnTopics}`
  );
  assertQuality(d1, 'EN work from home');
  const d2 = engine.respond(
    'my team messages me at 11pm and i reply, i cant say no'
  );
  assert.ok(
    engine.currentTurnTopics.includes('work'),
    `EN late team messages must route to work, got: ${engine.currentTurnTopics}`
  );
  assertQuality(d2, 'EN late team messages');
  const d3 = engine.respond('i feel like i am just existing, not living');
  assertQuality(d3, 'EN just existing');
  assert.doesNotMatch(d3, EVASIVE, 'EN existential emptiness is engaged');
});

test('wild: a threatened user is given safety steps, not a platform fact', () => {
  // Safety-critical: a threatening DM that mentions a platform and a
  // workplace ("knows where I work") must route to the harassment_threat
  // pool with concrete safe steps. It used to be hijacked by the
  // knowledge shelf answering "what is Instagram" (the word «اینستاگرام»
  // tripped a weak fact match) and, before that, by the work rule.
  const cases = [
    [
      FA,
      'یه غریبه تو اینستاگرام واستون برام پیام تهدیدآمیز فرستاده و می‌دونه کجا کار میکنم',
      'بلاک|گزارش|تهدید|اورژانس|پلیس|امنیت'
    ],
    [
      EN,
      'a stranger on instagram sent me a threatening message and knows where i work',
      'block|report|threat|emergency|danger|police|safety'
    ]
  ];
  for (const [lang, line, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('harassment_threat'),
      `${lang}: threat must route to harassment_threat, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} harassment threat`, must);
    assert.doesNotMatch(
      reply,
      /each platform has its role|هر پلتفرم کار خودش را دارد/iu,
      `${lang}: never a platform explainer instead of safety steps`
    );
  }
});

test('wild: the gamer who loses the night is met with a tiny step', () => {
  // "one more game" and the 3am aftermath used to fall through to the
  // unknown pool (the first turn was even echoed back). Both must route
  // to the procrastination pool's invitation.
  const engine = freshEngine(EN);
  const d1 = engine.respond(
    'every night i tell myself i will study after one more game of valorant'
  );
  assert.ok(
    engine.currentTurnTopics.includes('procrastination'),
    `EN one-more-game must route to procrastination, got: ${engine.currentTurnTopics}`
  );
  assertQuality(d1, 'EN one more game');
  const d2 = engine.respond('then it is 3am and i have lost the whole evening');
  assert.ok(
    engine.currentTurnTopics.includes('procrastination'),
    `EN 3am aftermath must stay on procrastination, got: ${engine.currentTurnTopics}`
  );
  assertQuality(d2, 'EN 3am lost evening');
});

test('wild: the divorced parent is met on the separation, not a family feud', () => {
  // «طلاق» used to fall through to the unknown pool entirely. The first
  // turn must route to the divorce pool (above the family rule), and the
  // heavy-silence follow-up to the loneliness pool.
  const cases = [
    [
      FA,
      'بعد از طلاق فقط آخر هفته‌ها بچه‌ها رو می‌بینم و دلم برای صداشون تنگ می‌شه',
      'divorce',
      'طلاق|جدایی|بعد از طلاق'
    ],
    [
      EN,
      'after my divorce i only see the kids on weekends and i miss them a lot',
      'divorce',
      'divorce|separation'
    ]
  ];
  for (const [lang, line, topic, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes(topic),
      `${lang}: divorce must route to ${topic}, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} divorce`, must);
  }
  const fa = freshEngine(FA);
  fa.respond('بعد از طلاق فقط آخر هفته‌ها بچه‌ها رو می‌بینم');
  const d2 = fa.respond('خونه که برمی‌گردم یه سکوت سنگینی هست که اذیتم می‌کنه');
  assert.ok(
    fa.currentTurnTopics.includes('loneliness'),
    `FA heavy silence must route to loneliness, got: ${fa.currentTurnTopics}`
  );
  assertQuality(d2, 'FA heavy silence');
});

test('wild: teen guilt after lashing out is met with self-compassion', () => {
  // «داد می‌زنم و بعدش احساس گناه می‌کنم» used to fall through to the
  // unknown pool. The guilt must route to self_esteem (self-critical
  // voice) in both languages, never an evasive line.
  const cases = [
    [FA, 'داد می‌زنم و بعدش احساس گناه می‌کنم'],
    [EN, 'i yell at the people i love and then feel so guilty']
  ];
  for (const [lang, line] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('self_esteem'),
      `${lang}: guilt must route to self_esteem, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} teen guilt`);
  }
});

test('wild: social-media envy routes to self-worth, doomscrolling to procrastination', () => {
  // Instagram comparison ("everyone's life looks perfect, i am nothing")
  // used to get a vague "interesting detail" line; doomscrolling used
  // to be "not familiar". Both now route to their pools.
  const cases = [
    [
      FA,
      'تو اینستاگرام همه‌ی همکلاسی‌هام انگار زندگیشون عالیه و من هیچی نیستم',
      'self_esteem'
    ],
    [
      EN,
      'everyone on instagram seems to have a perfect life and i am nothing',
      'self_esteem'
    ]
  ];
  for (const [lang, line, topic] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes(topic),
      `${lang}: comparison must route to ${topic}, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `${lang} social comparison`);
  }
  const fa = freshEngine(FA);
  const d2 = fa.respond(
    'هر چی اسکرول می‌کنم بدتر می‌شم ولی نمی‌تونم دست بردارم'
  );
  assert.ok(
    fa.currentTurnTopics.includes('procrastination'),
    `FA doomscrolling must route to procrastination, got: ${fa.currentTurnTopics}`
  );
  assertQuality(d2, 'FA doomscroll');
});

test('wild: the senior frustrated with an app is heard, and the age is kept', () => {
  // "this new banking app is impossible, i am 71" must reply to the
  // frustration (tech_frustration pool), NOT with a bare age
  // acknowledgment, while the age is still stored for recall.
  const cases = [
    [
      EN,
      'this new banking app is impossible, i am 71 and my son set it up for me',
      '71'
    ],
    [FA, 'این اپلیکیشن جدید بانک رو نمی‌فهمم', null]
  ];
  for (const [lang, line, age] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('tech_frustration'),
      `${lang}: app frustration must route to tech_frustration, got: ${engine.currentTurnTopics}`
    );
    assertQuality(
      reply,
      `${lang} tech frustration`,
      'technology|app|digital|stuck|تکنولوژی|برنامه|دیجیتال'
    );
    if (age) {
      assert.equal(engine._userProfile.age, age, 'age still stored');
    }
  }
  const en = freshEngine(EN);
  en.respond('this new banking app is impossible, i am 71');
  const moved = en.respond('i feel like the world has moved on without me');
  assert.ok(
    en.currentTurnTopics.includes('loneliness'),
    `EN moved-on must route to loneliness, got: ${en.currentTurnTopics}`
  );
  assertQuality(moved, 'EN moved on');
});

test('wild: money anxiety that steals sleep is held by money or sleep', () => {
  // «پس‌انداز ندارم و فکرای پول نمی‌ذاره بخوابم» used to fall through to
  // the unknown pool. Either the money or the sleep pool is a caring
  // answer; the evasive fallback is not.
  const engine = freshEngine(FA);
  const d1 = engine.respond(
    'هر ماه حقوقم تموم می‌شه قبل از اینکه ماه تموم بشه، قیمتا مدام بالا می‌ره'
  );
  assert.ok(
    engine.currentTurnTopics.includes('money'),
    `FA salary anxiety must route to money, got: ${engine.currentTurnTopics}`
  );
  assertQuality(d1, 'FA salary anxiety');
  const d2 = engine.respond(
    'برای آینده‌مون هیچ پس‌اندازی ندارم و شب‌ها فکرای پول نمی‌ذاره بخوابم'
  );
  assert.ok(
    engine.currentTurnTopics.includes('money') ||
      engine.currentTurnTopics.includes('sleep'),
    `FA no-savings insomnia must route to money or sleep, got: ${engine.currentTurnTopics}`
  );
  assertQuality(d2, 'FA no-savings insomnia');
});

test('wild: the night nurse with a broken sleep schedule is held by work or sleep', () => {
  // "i work night shifts at the hospital and my sleep schedule is ruined"
  // used to be "not familiar". The work and sleep rules now both fire;
  // either caring pool is correct.
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'i work night shifts at the hospital and my sleep schedule is ruined'
  );
  assert.ok(
    engine.currentTurnTopics.includes('work') ||
      engine.currentTurnTopics.includes('sleep'),
    `EN night shifts must route to work or sleep, got: ${engine.currentTurnTopics}`
  );
  assertQuality(reply, 'EN night nurse');
});

test('wild: job-search rejection is heard as work, not evaded', () => {
  // "sent 200 applications and nobody even replied" used to be "I do
  // not know this topic well". The sent-applications phrase must open
  // the work thread.
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'i have sent 200 applications and nobody even replied'
  );
  assert.ok(
    engine.currentTurnTopics.includes('work'),
    `EN job search must route to work, got: ${engine.currentTurnTopics}`
  );
  assertQuality(reply, 'EN job search');
});

test('wild: FA son/daughter kinship routes to family, bare boy/girl does not', () => {
  // «پسرم این روزا غیردوستانه شده» used to fall to the unknown pool:
  // the family keywords had no possessive son/daughter forms. The
  // possessive forms must open family, while bare «پسر»/«دختر» (boy /
  // girl in a romance context) must NOT be swallowed by family.
  const engine = freshEngine(FA);
  const d1 = engine.respond('پسرم این روزا غیردوستانه شده');
  assert.ok(
    engine.currentTurnTopics.includes('family'),
    `FA son must route to family, got: ${engine.currentTurnTopics}`
  );
  assertQuality(d1, 'FA son unfriendly');
  const d2 = engine.respond('دخترم دیگه باهاش راحت نیستم');
  assert.ok(
    engine.currentTurnTopics.includes('family'),
    `FA daughter must route to family, got: ${engine.currentTurnTopics}`
  );
  assertQuality(d2, 'FA daughter distant');
  const crush = freshEngine(FA);
  crush.respond('اون پسر توی کلاس رو دوست دارم');
  assert.ok(
    !crush.currentTurnTopics.includes('family'),
    `FA bare boy crush must not route to family, got: ${crush.currentTurnTopics}`
  );
});

test('wild: FA math accepts the casual منها spelling of منهای', () => {
  // «۳ منها ۲» (casual texting spelling) used to fall to the unknown
  // pool because only «منهای» was recognized. The minus result must be
  // computed for both spellings, in digit form and in number-word form
  // («سه منها دو»), where a separate word-operator branch also needed
  // the منها case.
  const engine = freshEngine(FA);
  const d1 = engine.respond('۳ منها ۲ چند می‌شه؟');
  assert.match(d1, /۱|1/, `FA منها math must answer 1, got: "${d1}"`);
  const d2 = engine.respond('۵ منهای ۲ چند می‌شه؟');
  assert.match(d2, /۳|3/, `FA منهای math must answer 3, got: "${d2}"`);
  const d3 = engine.respond('سه منها دو چند می‌شه؟');
  assert.match(d3, /۱|1/, `FA word-form منها must answer 1, got: "${d3}"`);
});

test('wild: FA family echo trims the copula from the captured subject', () => {
  // «ولی بچه خواهرم هست (خواهرزاده)» after Darya asked a question used
  // to echo «هست خواهرزاده» into the reply («درباره‌ی هست خواهرزاده
  // بیشتر برایم بگویید»): the family rule's tail capture (`\s*(.*)`)
  // grabs the copula «هست» that follows the matched kinship word. The
  // echoed subject must read as a noun phrase, never as a verb remnant.
  for (let i = 0; i < 8; i += 1) {
    const engine = freshEngine(FA);
    engine.respond(
      'چرا سوال نمی‌پرسی؟! چرا کنجکاوی خوب نمی‌کنی؟! تو باید من رو به شیوه‌ای دوستانه و حرفه‌ای وادار کنی تا خودم رو واکاوی کنم و تو هم یک همراه بی‌نظر باشی برام'
    );
    const reply = engine.respond(
      'مهربانی؟! از کس دیگه‌ای؟! یادم نیست... عزیزترین آدم زندگی من ولی بچه خواهرم هست (خواهرزاده)...'
    );
    assert.ok(
      engine.currentTurnTopics.includes('family'),
      `FA kinship must route to family, got: ${engine.currentTurnTopics}`
    );
    assert.ok(
      !reply.includes('هست خواهرزاده'),
      `FA copula must be trimmed from the echo, got: "${reply}"`
    );
    // When the captured template fires, the clean subject is echoed.
    if (reply.includes('خواهرزاده')) {
      assert.ok(
        !reply.includes('هست'),
        `FA echo must not contain the copula, got: "${reply}"`
      );
    }
  }
  // The copula is trimmed regardless of which family pool line is picked.
  const plain = freshEngine(FA);
  const plainReply = plain.respond('ولی بچه خواهرم هست، خواهرزاده‌مه');
  assert.ok(
    !plainReply.includes('هست خواهرزاده'),
    `FA plain statement must not echo the copula, got: "${plainReply}"`
  );
});

test('wild: FA girlfriend/boyfriend stays out of the family thread', () => {
  // The family rule gained possessive son/daughter terms («دخترم»). The
  // lookbehind guard must keep «دوست دخترم» (girlfriend) and the
  // no-space texting forms («دوست‌دخترم») in the relationship thread;
  // otherwise family (priority 50) would swallow them.
  const cases = [
    'دوست دخترم داره ازم فاصله می‌گیره',
    'دوست‌دخترم داره ازم فاصله می‌گیره',
    'دوست پسرم همش باهاش دعوام میشه',
    'دوست‌پسرم همش باهاش دعوام میشه'
  ];
  for (const msg of cases) {
    const engine = freshEngine(FA);
    const reply = engine.respond(msg);
    assert.ok(
      engine.currentTurnTopics.includes('relationship'),
      `FA "${msg}" must route to relationship, got: ${engine.currentTurnTopics}`
    );
    assert.ok(
      !engine.currentTurnTopics.includes('family'),
      `FA "${msg}" must not route to family, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, 'FA girlfriend/boyfriend');
  }
  // A real daughter/son statement still opens family.
  const son = freshEngine(FA);
  son.respond('پسرم این روزا غیردوستانه شده');
  assert.ok(
    son.currentTurnTopics.includes('family'),
    `FA son must still route to family, got: ${son.currentTurnTopics}`
  );
});

test('wild: EN format feedback with blank-line phrasing re-emits the list', () => {
  // "put a blank line before the question" used to be "not familiar":
  // the format-feedback pattern only knew per-item line phrasing. The
  // blank-line form must re-emit the last knowledge list.
  const engine = freshEngine(EN);
  engine.respond('tell me about jupiter');
  const reply = engine.respond(
    'would be nicer if you put a blank line before the question'
  );
  assertQuality(reply, 'EN blank-line format', '(line|again|here it is)');
});

test('wild: EN new-line suggestion is format feedback, not self-improvement', () => {
  // "wouldn't it be better to put the question on a new line" used to
  // match self_improvement via the bare "be better" branch. An
  // it-subject presentation suggestion must not open the Darya-role
  // thread.
  const engine = freshEngine(EN);
  const reply = engine.respond(
    "wouldn't it be better to put the question on a new line? it would look cleaner"
  );
  assert.ok(
    !engine.currentTurnTopics.includes('self_improvement'),
    `EN new-line must not be self_improvement, got: ${engine.currentTurnTopics}`
  );
  assertQuality(reply, 'EN new-line format', '(line|again|here it is)');
  // The Darya-directed form still opens self_improvement.
  const improve = freshEngine(EN);
  improve.respond('you should be better at listening to me');
  assert.ok(
    improve.currentTurnTopics.includes('self_improvement'),
    `EN you-should-be-better must open self_improvement, got: ${improve.currentTurnTopics}`
  );
});

test('wild: FA career-aspiration question keeps the knowledge shelf, not the work thread', () => {
  // Regression: adding profession words (برنامه‌نویس, طراح...) to the FA
  // work rule fixed the designer-disclosure miss, but they hijacked a
  // career question («چطور برنامه نویس شوم») that must reach the
  // knowledge shelf for a concrete plan. The work rule now rejects a
  // following career suffix (شوم/بشم/بشیم...).
  const career = freshEngine(FA);
  const reply = career.respond('چطور برنامه نویس شوم');
  assert.ok(
    !career.currentTurnTopics.includes('work'),
    `career question must not open the work thread, got: ${career.currentTurnTopics}`
  );
  assertQuality(reply, 'FA career plan', 'تخصص|پروژه|مسیر');
  // Colloquial variants stay on the shelf too.
  const v2 = freshEngine(FA);
  assertQuality(
    v2.respond('چطور برنامه‌نویس بشم'),
    'FA career plan بشم',
    'تخصص|پروژه|مسیر'
  );

  // A lived profession disclosure still opens the work thread.
  const designer = freshEngine(FA);
  const workReply = designer.respond(
    'طراح وب هستم و دیگه از پروژه‌های تکراری خسته شدم'
  );
  assert.ok(
    designer.currentTurnTopics.includes('work'),
    `designer disclosure must open the work thread, got: ${designer.currentTurnTopics}`
  );
  assertQuality(workReply, 'FA designer disclosure');
});

test('wild: FA karate/taekwondo Olympic yes-no questions get the fact, both languages', () => {
  // «کاراته تو المپیک هست؟» used to score below the confidence bar
  // because «تو المپیک» broke the «کاراته المپیک» keyword; the answer
  // fell to the honest-unknown pool despite the shelf holding the fact.
  const faKarate = freshEngine(FA);
  assertQuality(
    faKarate.respond('کاراته تو المپیک هست؟'),
    'FA karate olympics',
    'المپیک|اوکیناوا'
  );
  const faTkd = freshEngine(FA);
  assertQuality(
    faTkd.respond('تکواندو تو المپیک هست؟'),
    'FA taekwondo olympics',
    'المپیک|کره'
  );
  const enKarate = freshEngine(EN);
  assertQuality(
    enKarate.respond('is karate in the olympics?'),
    'EN karate olympics',
    'Olympics|Okinawa'
  );
});

test('wild: AI future/impact questions answer from the shelf in both languages', () => {
  // "is ai going to change game development?" had no keyword match and
  // fell to the honest-unknown pool. The impact framing (is/will ...
  // going to change) now routes to the AI entry.
  const en = freshEngine(EN);
  assertQuality(
    en.respond('is ai going to change game development?'),
    'EN ai impact',
    'ChatGPT|2022|careers|roles'
  );
  const fa = freshEngine(FA);
  assertQuality(
    fa.respond('هوش مصنوعی صنعت بازی رو عوض می‌کنه؟'),
    'FA ai impact',
    '۲۰۲۲|هوش مصنوعی|چت'
  );
});

test('wild: a bare affirmation never wipes the conversation subject', () => {
  // "my girlfriend left me" -> "yeah" -> "she said i never listened":
  // the affirmation turn used to overwrite the subject with
  // 'affirmation', so follow-ups lost the relationship thread and fell
  // to the honest-unknown pool. Filler acknowledgments (yes/no/thanks/
  // sorry) must keep the current subject instead.
  const engine = freshEngine(EN);
  engine.respond('my girlfriend left me');
  engine.respond('yeah');
  engine.respond('she said i never listened');
  const reply = engine.respond('do you think i can fix it?');
  assert.ok(
    engine.memory.currentSubject.topic === 'relationship',
    `subject must stay relationship through filler turns, got: ${engine.memory.currentSubject.topic}`
  );
  assertQuality(
    reply,
    'EN fix-it after filler',
    'relationship|repair|clarity|connection|healthier|say|need|steady'
  );
});

test('wild: best-online-games questions answer from the esports shelf in both languages', () => {
  // «بهترین بازی‌های چندنفره آنلاین چیا هستن؟» used to fall to the
  // honest-unknown pool: no keyword matched the multiplayer phrasing.
  // The esports entry now owns those phrasings and names the popular
  // games instead of conceding ignorance.
  const fa = freshEngine(FA);
  assertQuality(
    fa.respond('بهترین بازی‌های چندنفره آنلاین چیا هستن؟'),
    'FA multiplayer games',
    'ورزش الکترونیک|ای‌اسپرت|بازی'
  );
  const en = freshEngine(EN);
  assertQuality(
    en.respond('what are the best online multiplayer games?'),
    'EN multiplayer games',
    'esports|game|streamer|twitch'
  );
});

test('wild: EN first-person career aspirations route to learning advice', () => {
  // FA's subjunctive branch («می‌خوام برنامه نویس بشم») had no EN twin:
  // "I want to be a programmer" and "I wanna be a programmer" fell to
  // the generic need pool, "I am thinking of becoming a programmer" to
  // the echo pool, and "I want to get into programming" to the need
  // pool. All first-person aspiration forms must land on
  // learning_advice like FA.
  const forms = [
    'I want to be a programmer',
    'I wanna be a programmer',
    "I'd like to become a programmer",
    "I'm planning to become a developer",
    'I want to become a developer',
    'I am thinking of becoming a programmer',
    'I want to get into programming',
    'I would like to become a graphic designer',
    'I hope to become a writer'
  ];
  for (const form of forms) {
    const engine = freshEngine(EN);
    const reply = engine.respond(form);
    assert.ok(
      (engine.currentTurnTopics || []).includes('learning_advice'),
      `${form}: must route to learning_advice, topics: ${engine.currentTurnTopics.join(',')}`
    );
    assertQuality(reply, `EN aspiration: ${form}`);
  }
});

test('wild: EN lived profession disclosures open the work thread', () => {
  // EN twin of the FA work-rule profession words: "I'm a web designer
  // and I'm tired of repetitive projects" fell to the echo pool and "I
  // just became a programmer" to the honest-unknown pool. Lived
  // copula forms must open the work thread while future aspirations
  // stay on learning advice.
  const disclosures = [
    "I'm a web designer and I'm tired of repetitive projects",
    'I just became a programmer',
    'I became a programmer last year',
    'I am a graphic designer and I feel stuck'
  ];
  for (const disclosure of disclosures) {
    const engine = freshEngine(EN);
    const reply = engine.respond(disclosure);
    assert.ok(
      (engine.currentTurnTopics || []).includes('work'),
      `${disclosure}: must open the work thread, topics: ${engine.currentTurnTopics.join(',')}`
    );
    assertQuality(reply, `EN work disclosure: ${disclosure}`);
  }
});

test('wild: FA career aspirations and disclosures mirror EN (parity lock)', () => {
  // The FA side of the same feature: the subjunctive aspiration goes to
  // learning_advice, the lived disclosure to work. Locked so future
  // changes cannot drift the two languages apart.
  const faAspire = freshEngine(FA);
  const replyAspire = faAspire.respond('می‌خوام برنامه نویس بشم');
  assert.ok(
    (faAspire.currentTurnTopics || []).includes('learning_advice'),
    `FA aspiration must route to learning_advice, got: ${faAspire.currentTurnTopics.join(',')}`
  );
  assertQuality(replyAspire, 'FA aspiration reply');

  const faWork = freshEngine(FA);
  const replyWork = faWork.respond(
    'من طراح وب هستم و از پروژه‌های تکراری خسته شدم'
  );
  assert.ok(
    (faWork.currentTurnTopics || []).includes('work'),
    `FA disclosure must open the work thread, got: ${faWork.currentTurnTopics.join(',')}`
  );
  assertQuality(replyWork, 'FA work disclosure reply');
});

test('wild: non-career want-to-be wishes never hijack learning advice', () => {
  // The aspiration branch requires a concrete profession. State wishes
  // and professions outside the list (doctor, in parity with FA) must
  // stay off learning_advice.
  const states = [
    'I want to be left alone',
    'I want to become a doctor',
    'I want to be a better person'
  ];
  for (const wish of states) {
    const engine = freshEngine(EN);
    engine.respond(wish);
    assert.ok(
      !(engine.currentTurnTopics || []).includes('learning_advice'),
      `${wish}: must NOT route to learning_advice, got: ${engine.currentTurnTopics.join(',')}`
    );
  }
});

test('wild: affectionate FA greetings are welcomed, never read as noise', () => {
  // «سلاااامممم عسلم», «درود خانمم», and «سلام خانومی» from the real
  // transcript are warm openers, not spam or frustration. Each must get
  // a friendly greeting reply, never the honest-unknown line or the
  // repeated-greeting dismissal.
  const openers = [
    'سلاااامممم عسلم',
    'درود خانمم',
    'سلام خانومی',
    'سلام عزیز دلم'
  ];
  for (const line of openers) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.ok(reply.length > 10, `${line}: reply too short: "${reply}"`);
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive line: "${reply}"`);
    assert.match(
      reply,
      /سلام|درود|خوش|خوشحال|حضور|آمدی|خبر/iu,
      `${line}: should welcome the greeting: "${reply}"`
    );
  }
});

test('wild: FA story requests reach the curated horror story, not the unknown pool', () => {
  // «یه داستان ترسناک تعریف کن» and «داستان ترسناک بگو» used to fall
  // through to the honest-unknown pool (the FA knowledge-request pattern
  // lacked a story framing). Both must return the curated short horror
  // story.
  for (const line of ['یه داستان ترسناک تعریف کن', 'داستان ترسناک بگو']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
    assert.match(
      reply,
      /داستان|اتاق|ترسناک|ساعت|در می‌زد/iu,
      `${line}: should tell the horror story: "${reply}"`
    );
  }
  // A life-story disclosure is NOT a story request: it must never be
  // answered with the fiction shelf.
  const life = freshEngine(FA);
  const lifeReply = life.respond('داستان زندگیم خیلی سخته');
  assert.doesNotMatch(
    lifeReply,
    /اتاق کناری|3:03|ساعت سه/iu,
    `life disclosure must not trigger the fiction shelf: "${lifeReply}"`
  );
});

test('wild: FA dev-salary and framework-comparison questions reach the facts', () => {
  // «درآمد یه برنامه‌نویس تو ایران چقدره؟» used to be swallowed by the
  // work rule (the salary bypass used an ASCII-only \b that never fires
  // after Persian letters), and «بین ری اکت و ویو کدوم بهتره؟» by
  // learning_advice (the FA request pattern lacked a comparison
  // framing). Both must now answer from the factual shelf.
  const cases = [
    [
      'درآمد یه برنامه‌نویس تو ایران چقدره؟',
      'برنامه‌نویس|درآمد|حقوق|شهر|تجربه'
    ],
    ['بین ری اکت و ویو کدوم بهتره؟', 'ری‌اکت|ری اکت|ویو|فریم‌ورک|جاوااسکریپت'],
    ['چند تا یوتیوبر خوب بهم معرفی کن', 'یوتیوبر|کانال|آموزش']
  ];
  for (const [line, must] of cases) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
    assert.match(
      reply,
      new RegExp(must, 'iu'),
      `${line}: should answer from the shelf: "${reply}"`
    );
  }
  // The comparison framing must not drag in a bare «کدوم مسیر» disclosure.
  const path = freshEngine(FA);
  const pathReply = path.respond('کدوم مسیر رو برم؟');
  assert.doesNotMatch(
    pathReply,
    /ری‌اکت|ویو|فریم‌ورک/iu,
    `bare which-path question must not reach the shelf: "${pathReply}"`
  );
});

test('wild: FA fatigue phrasings are heard as fatigue, not physical pain', () => {
  // «چرا همیشه خسته‌ام؟» (ZWNJ) and the no-ZWNJ «چرا همیشه خستهام؟»
  // both normalize differently; both must route to the health thread and
  // reply with a fatigue-aware line, never the pain-only wording
  // («دردت را می‌شنوم») or the unknown pool.
  for (const line of [
    'چرا همیشه خسته‌ام؟',
    'چرا همیشه خستهام؟',
    'چرا همش خسته‌ام'
  ]) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
    assert.doesNotMatch(
      reply,
      /دردت را می‌شنوم|این درد چقدر/iu,
      `${line}: must not use pain-only wording: "${reply}"`
    );
    assert.ok(
      engine.currentTurnTopics.includes('health_pain') ||
        engine.currentTurnTopics.includes('health'),
      `${line}: must route to the health thread, got: ${engine.currentTurnTopics.join(',')}`
    );
  }
});

test('wild: FA new-parent announcements reach the new_baby celebration', () => {
  // «تازه مامان شدم» used to be swallowed by the family rule (bare
  // «مامان») and answered with a family follow-up question. The new_baby
  // rule (51) must outrank family (50) and celebrate the announcement.
  for (const line of [
    'تازه مامان شدم',
    'تازه بابا شدم!',
    'تازه یه بچه به دنیا اومده تو خونواده‌مون'
  ]) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('new_baby'),
      `${line}: must route to new_baby, got: ${engine.currentTurnTopics.join(',')}`
    );
    assertQuality(reply, `FA new parent: ${line}`);
  }
});

test('wild: EN fatigue phrasings get fatigue-aware replies, not pain wording', () => {
  // EN parity for the FA fatigue fix: "why am i always tired", "i am
  // always exhausted these days", and the feel-form must route to the
  // health thread and reply with a tiredness-aware line, never the
  // pain-only wording ("I hear your pain") or the unknown pool.
  for (const line of [
    'why am i always tired?',
    'i am always exhausted these days',
    'i feel tired every day'
  ]) {
    const engine = freshEngine(EN);
    const reply = engine.respond(line);
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
    assert.doesNotMatch(
      reply,
      /I hear your pain|Pain can be exhausting|That sounds painful/iu,
      `${line}: must not use pain-only wording: "${reply}"`
    );
    assert.ok(
      engine.currentTurnTopics.includes('health_pain') ||
        engine.currentTurnTopics.includes('health'),
      `${line}: must route to the health thread, got: ${engine.currentTurnTopics.join(',')}`
    );
  }
  // "tired of" stays a work/feeling disclosure, never health fatigue.
  const work = freshEngine(EN);
  const workReply = work.respond('i am tired of my job');
  assert.doesNotMatch(
    workReply,
    /sleep|exhausted all the time/iu,
    `tired-of must not route to fatigue: "${workReply}"`
  );
});

test('wild: EN and FA fun-fact and horror requests answer without evading', () => {
  // The "something interesting" opener (EN) and the FA horror-story
  // request both used to bounce to generic fallbacks. Each must answer
  // from the factual shelf.
  const en = freshEngine(EN);
  const enReply = en.respond('tell me something interesting');
  assert.doesNotMatch(enReply, EVASIVE, `EN interesting: "${enReply}"`);
  assert.match(enReply, /fact|facts|heart|piano|octopus/iu, 'EN facts');
  const fa = freshEngine(FA);
  const faReply = fa.respond('یه داستان ترسناک بگو');
  assert.doesNotMatch(faReply, EVASIVE, `FA horror: "${faReply}"`);
  assert.match(faReply, /داستان|اتاق|ترسناک/iu, 'FA horror story');
});
