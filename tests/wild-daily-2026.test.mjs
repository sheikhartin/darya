/**
 * Wild 2026-era daily-life and hostile-transcript regression suite.
 *
 * This suite locks in the fixes from the wild-conversation probe rounds:
 *
 * 1. The hostile Persian transcript: recommendation requests that used to
 *    get "unfamiliar topic" replies («چندتا فیلم بهم معرفی کن», «چندتا
 *    بازی بهم معرفی کن», «چندتا کتاب بهم معرفی کن»), the «گاوی مگه»
 *    boredom misroute, the «فوتبال بهتره یا کشتی» grieving-prefix bug,
 *    the «باهوش‌تر بودی» tease, the app-feedback hijacks of focus and
 *    phone complaints, and the «الان چه سالیه» datetime gap.
 *
 * 2. The 2026-era wild phrasings: AI-job anxiety, gig economy, housing
 *    costs, young-adult loneliness, dating-app burnout, and feeling
 *    broke must all route to a real pool, never the evasive fallback.
 *
 * 3. The context window: sequential joke requests must stay on jokes
 *    and vary, topic switches (films to books to games) must answer
 *    each fresh request, and a comparison question must never lock the
 *    engine into a stale topic.
 *
 * The persona is deliberately noisy: everyday Persian texting forms
 * (مو, ت, بهم, وقتم رو) and modern English idioms.
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';

import { freshEngine, FA, EN } from './helpers.mjs';

/** Evasive lines that must never appear when the engine knows the topic. */
const EVASIVE =
  /(?:I do not (?:know|have)|don'?t (?:know|have)|no (?:ready )?answer|not familiar|outside my|راستش جواب|جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم|آشنایی ندارم|از دانش من خارج|خوب نمی‌شناسم)/iu;

/** The canned dodge lines the hostile transcript flagged specifically. */
const DODGE =
  /(?:این انتخاب به شرایط خودت|هر مسیری که بروی|کوتاه بود|لازم نیست همه‌چیز را یک‌باره حل کنی|همین که این را گفتی|این سؤال به خودی خود جالب)/iu;

/**
 * Asserts a reply answers a real conversational turn: non-empty, not
 * evasive, not a canned dodge, and (when a must-match is given)
 * containing a signal word.
 * @param {string} reply - The engine reply
 * @param {string} label - Test label for failure messages
 * @param {string|null} mustMatch - Optional regex source the reply must contain
 */
function assertQuality(reply, label, mustMatch) {
  assert.ok(reply.length > 10, `${label}: reply is empty or tiny: "${reply}"`);
  assert.doesNotMatch(reply, EVASIVE, `${label}: evasive line: "${reply}"`);
  assert.doesNotMatch(reply, DODGE, `${label}: canned dodge: "${reply}"`);
  if (mustMatch) {
    assert.match(reply, new RegExp(mustMatch, 'iu'), `${label}: "${reply}"`);
  }
}

/** Asserts the turn routed to one of the allowed topics. */
function assertRouted(engine, allowed, label) {
  const ok = allowed.some((topic) => engine.currentTurnTopics.includes(topic));
  assert.ok(
    ok,
    `${label}: must route to one of [${allowed}], got: ${engine.currentTurnTopics}`
  );
}

test('daily: FA movie and game and book requests answer, never unfamiliar', () => {
  const cases = [
    ['چندتا فیلم سینمایی بگو', /سینما|فیلم/],
    ['چندتا فیلم بهم معرفی کن', /سینما|فیلم/],
    ['فیلم سینمایی بهم معرفی کن', /سینما|فیلم/],
    ['چندتا بازی بهم معرفی کن', /بازی|گیم/],
    ['یه بازی آروم معرفی کن', /بازی|گیم/],
    ['چندتا کتاب بهم معرفی کن', /کتاب/],
    ['بهترین فیلم تاریخ چیه', /سینما|فیلم/]
  ];
  for (const [line, must] of cases) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assertQuality(reply, `FA ${line}`, must);
  }
});

test('daily: EN film and book and game requests answer, never unfamiliar', () => {
  const cases = [
    ['suggest a few films please', /film|cinema|movie/i],
    ['recommend a relaxing game', /game/i],
    ['recommend me some books', /book/i],
    ['best movie of all time', /film|cinema|movie/i],
    ['top 10 games to play', /game/i]
  ];
  for (const [line, must] of cases) {
    const engine = freshEngine(EN);
    const reply = engine.respond(line);
    assertQuality(reply, `EN ${line}`, must);
  }
});

test('daily: FA sports and science facts answer from the shelf', () => {
  const cases = [
    ['بهترین فوتبالیست کیه', /مسی|رونالدو|توپ طلا/],
    ['بهترین والیبالیست تاریخ جهان کیه', /کرالی|والیبال|مورگان/],
    ['قلب دوم بدن چیه', /قلب|ساق/],
    ['قورمه سبزی چطور درست میشه', /قرمه|قورمه|برنج/],
    ['طرز تهیه فسنجون چیه', /فسنج|گردو/]
  ];
  for (const [line, must] of cases) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assertQuality(reply, `FA ${line}`, must);
  }
});

test('daily: FA year and date questions answer the calendar', () => {
  for (const line of ['الان چه سالیه؟', 'امسال چه سالیه', 'چه سالی هستیم']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assertQuality(reply, `FA ${line}`, /۱۴۰|۲۰\d\d|سال/);
  }
});

test('daily: جیگرم and عسلم greetings are greeted, never echoed or scolded', () => {
  // «جیگرم»/«عسلم» are friendly flirt-teasing greetings. The reply must
  // open the greeting thread (or a warm boundary), never echo the word,
  // never call it an insult, and never open the boredom line.
  for (const line of [
    'جیگرم چه خبر',
    'سلام جیگرم',
    'سلام عسلم',
    'درود خانومی'
  ]) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.ok(reply.length > 10, `FA ${line}: non-empty reply`);
    assert.doesNotMatch(reply, /کوتاه بود/, `FA ${line}: boredom misroute`);
    assert.doesNotMatch(reply, /جیگرم|عسلم/, `FA ${line}: must not echo`);
    assert.doesNotMatch(reply, EVASIVE, `FA ${line}: evasive`);
  }
});

test('daily: FA insults de-escalate, never the boredom or echo lines', () => {
  for (const line of ['گاوی مگه؟!', 'خاک تو سرت', 'احمق']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.ok(reply.length > 10, `FA ${line}: non-empty reply`);
    assert.doesNotMatch(reply, /کوتاه بود/, `FA ${line}: boredom misroute`);
    assert.doesNotMatch(
      reply,
      /بیشتر از این بخش بگو/,
      `FA ${line}: echo misroute`
    );
    assert.doesNotMatch(reply, EVASIVE, `FA ${line}: evasive`);
    // The de-escalation wording varies (بشنوم / دلخوری / خشم / ناامیدی
    // / تند حرف), so the guard is that it engages the feeling instead
    // of a canned dodge.
    assert.doesNotMatch(reply, DODGE, `FA ${line}: canned dodge`);
  }
});

test('daily: FA past-decline tease opens meta_feedback, not a fallback', () => {
  for (const line of [
    'قبلاً خیلی باهوش‌تر بودی انگار',
    'تو که قبلاً باهوش‌تر بودی'
  ]) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assertRouted(engine, ['meta_feedback'], `FA ${line}`);
    assertQuality(
      reply,
      `FA ${line}`,
      /سعی|متوجه|دقت|اصلاح|بشنوم|بازخورد|بهتر|تلاش|توجه|جزئیات|حق با/
    );
  }
});

test('daily: EN past-decline tease opens meta_feedback, never knowledge-miss', () => {
  for (const line of [
    'you used to be so much smarter',
    'you were way smarter before',
    'you used to be much smarter'
  ]) {
    const engine = freshEngine(EN);
    const reply = engine.respond(line);
    assertRouted(engine, ['meta_feedback'], `EN ${line}`);
    assertQuality(reply, `EN ${line}`);
  }
});

test('daily: comparisons get the criterion question, never the shopping dodge', () => {
  const cases = [
    [FA, 'تویوتا بهتره یا بوگاتی؟', /مقایسه|بهتر|معیار|گزینه/],
    [FA, 'فوتبال بهتره یا کشتی؟', /مقایسه|بهتر|معیار|گزینه/],
    [
      EN,
      'which is better toyota or bugatti',
      // Every ruleComparison pool variant must pass: some lines use
      // "criterion"/"compare", others ask about the deciding factor
      // between two options.
      /compar|criteri|better|choice|align|deciding|option|paper/i
    ],
    // The EN football comparison is legitimately answered by the sports
    // fact (football is the world's most popular sport); either the
    // criterion question or the factual answer is a good reply.
    [
      EN,
      'which is better football or wrestling',
      /compare|better|criterion|choice|align|deciding|option|football|soccer|eleven/i
    ]
  ];
  for (const [lang, line, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assertQuality(reply, `${lang} ${line}`, must);
    assert.doesNotMatch(
      reply,
      /من اینجا با تو هستم\./,
      `${lang} ${line}: grieving prefix must never appear on a comparison`
    );
  }
});

test('daily: focus and phone-complaints route to procrastination, not app_feedback', () => {
  const cases = [
    [
      'چطور تمرکزمو برگردونم',
      'procrastination',
      /تمرکز|حواس|قدم|گوشی|درس|شروع|سبک|پنج/
    ],
    [
      'چطور تمرکزم رو برگردونم',
      'procrastination',
      /تمرکز|حواس|قدم|گوشی|درس|شروع|سبک|پنج/
    ],
    [
      'موبایل خیلی وقتم رو می‌گیره',
      'procrastination',
      /گوشی|حواس|قدم|موبایل|تمرکز|شروع|پنج|درس|سبک/
    ],
    [
      'موبایلم دستم نمیمونه',
      'procrastination',
      /گوشی|حواس|قدم|موبایل|تمرکز|شروع|پنج|درس|سبک/
    ]
  ];
  for (const [line, topic, must] of cases) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assertRouted(engine, [topic], `FA ${line}`);
    assert.ok(
      !engine.currentTurnTopics.includes('app_feedback'),
      `FA ${line}: must not be app_feedback, got: ${engine.currentTurnTopics}`
    );
    assertQuality(reply, `FA ${line}`, must);
  }
});

test('daily: heartbreak opens the relationship thread, not the echo pool', () => {
  for (const line of ['دلشکستم', 'دلم شکست', 'قلبم شکسته']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assertRouted(engine, ['relationship'], `FA ${line}`);
    assertQuality(reply, `FA ${line}`);
  }
});

test('daily: Darya answers honestly about herself', () => {
  const cases = [
    ['چند سالته دریا؟', /ربات|الیزا|سن|تولد|آفلاین|ساخته|هدفم|بلدم|دانسته/],
    ['تو چیکاره هستی؟', /همراه|گوش|شنونده|ربات|فضا|آرام|کلمه|فکر|گفتگو|مکالمه/],
    ['اسمت چیه؟', /دریا|همراه|گفتگو|گوش|ربات|انسان/]
  ];
  for (const [line, must] of cases) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assertQuality(reply, `FA ${line}`, must);
  }
});

test('daily: AI-job anxiety is engaged, never a canned fact or fallback', () => {
  const en = freshEngine(EN);
  const enReply = en.respond('will ai take my job?');
  assertRouted(en, ['work', 'knowledge'], 'EN ai take my job');
  assertQuality(enReply, 'EN ai take my job');

  const fa = freshEngine(FA);
  const faReply = fa.respond('هوش مصنوعی شغلم رو می‌گیره');
  assertRouted(fa, ['work', 'knowledge'], 'FA ai take my job');
  assertQuality(faReply, 'FA ai take my job');
});

test('daily: gig economy and housing worries route to real pools', () => {
  const en = freshEngine(EN);
  const gig = en.respond('should i quit my gig job?');
  assertRouted(
    en,
    ['work', 'gig_worker', 'gig_economy', 'money'],
    'EN gig job'
  );
  assertQuality(gig, 'EN gig job');

  const en2 = freshEngine(EN);
  const rent = en2.respond('rent is eating half my salary');
  assertRouted(en2, ['housing', 'money'], 'EN rent');
  assertQuality(rent, 'EN rent');

  const fa = freshEngine(FA);
  const faRent = fa.respond('اجاره نصف حقوقمو می‌بره');
  assertRouted(fa, ['housing', 'money'], 'FA rent');
  assertQuality(faRent, 'FA rent');
});

test('daily: young-adult loneliness routes to the caring pool, both languages', () => {
  const cases = [
    [EN, 'i am 26 and have no close friends', ['loneliness']],
    [EN, 'i moved to a new city and have no friends', ['loneliness']],
    [
      EN,
      'i have 200 followers but no one to call',
      ['loneliness', 'loneliness_online']
    ],
    [FA, '۲۶ سالمه و هیچ دوست صمیمی ندارم', ['loneliness']],
    [
      FA,
      '۲۰۰ تا فالوور دارم ولی کسی رو ندارم صدا کنم',
      ['loneliness', 'loneliness_online']
    ]
  ];
  for (const [lang, line, topics] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assertRouted(engine, topics, `${lang} ${line}`);
    assertQuality(reply, `${lang} ${line}`);
  }
});

test('daily: dating-app burnout is held, never the evasive fallback', () => {
  const cases = [
    [EN, 'dating apps are exhausting, no one replies', 'dating_apps'],
    [FA, 'توی اپلیکیشن دوستیابی کسی جوابم نمیده', 'dating_apps']
  ];
  for (const [lang, line, topic] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assertRouted(engine, [topic], `${lang} ${line}`);
    assertQuality(reply, `${lang} ${line}`);
  }
});

test('daily: feeling broke opens money, and comparing opens social_comparison', () => {
  const cases = [
    [EN, 'i feel broke all the time', 'money'],
    [EN, 'i am feeling so broke', 'money'],
    [FA, 'پول ندارم', 'money'],
    [EN, 'i keep comparing myself to others', 'social_comparison'],
    [FA, 'خانوادم همش مقایسه‌م می‌کنن', 'social_comparison', 'family']
  ];
  for (const [lang, line, topic, extra] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assertRouted(engine, [topic, ...(extra ? [extra] : [])], `${lang} ${line}`);
    assertQuality(reply, `${lang} ${line}`);
  }
});

test('context: sequential joke requests stay on jokes and vary', () => {
  const engine = freshEngine(EN);
  const replies = [];
  for (const line of ['tell me a joke', 'another one', 'one more']) {
    const reply = engine.respond(line);
    assert.ok(reply.length > 10, `EN ${line}: non-empty`);
    assert.doesNotMatch(reply, EVASIVE, `EN ${line}: evasive`);
    replies.push(reply);
  }
  assert.ok(
    new Set(replies).size >= 2,
    `EN sequential jokes must vary, got: ${JSON.stringify(replies)}`
  );
});

test('context: FA sequential joke requests stay on jokes and vary', () => {
  const engine = freshEngine(FA);
  const replies = [];
  for (const line of ['یه جوک بگو', 'یه جوک دیگه', 'باز هم بگو']) {
    const reply = engine.respond(line);
    assert.ok(reply.length > 10, `FA ${line}: non-empty`);
    assert.doesNotMatch(reply, EVASIVE, `FA ${line}: evasive`);
    replies.push(reply);
  }
  assert.ok(
    new Set(replies).size >= 2,
    `FA sequential jokes must vary, got: ${JSON.stringify(replies)}`
  );
});

test('context: topic switches answer each fresh request, no stale topic', () => {
  const engine = freshEngine(EN);
  assertQuality(
    engine.respond('suggest a few films please'),
    'EN films',
    /film|cinema|movie/i
  );
  assertQuality(engine.respond('recommend me some books'), 'EN books', /book/i);
  assertQuality(engine.respond('suggest some games'), 'EN games', /game/i);
  // A heavy disclosure right after light requests still routes to the
  // lived topic: the engine must never bounce into a stale shelf.
  const heavy = engine.respond('i am so lonely tonight');
  assertRouted(engine, ['loneliness'], 'EN lonely after light talk');
  assertQuality(heavy, 'EN lonely after light talk');
});

test('context: FA topic switches stay fresh across the transcript', () => {
  const engine = freshEngine(FA);
  assertQuality(
    engine.respond('چندتا فیلم بهم معرفی کن'),
    'FA films',
    /سینما|فیلم/
  );
  assertQuality(engine.respond('یه جوک بگو'), 'FA joke');
  assertQuality(engine.respond('چندتا کتاب بهم معرفی کن'), 'FA books', /کتاب/);
  const hurt = engine.respond('دلم گرفته');
  assertRouted(engine, ['sadness'], 'FA sadness after light talk');
  assertQuality(hurt, 'FA sadness after light talk');
});

test('context: a short follow-up keeps refining the remembered shelf', () => {
  // After a knowledge answer, a one-word follow-up must stay on the same
  // shelf and refine it, never fall to the unknown pool.
  const en = freshEngine(EN);
  en.respond('tell me about jupiter');
  const saturn = en.respond('and saturn?');
  assertQuality(saturn, 'EN saturn follow-up', /saturn/i);
  const fa = freshEngine(FA);
  fa.respond('سیاره مشتری چیه');
  const zohal = fa.respond('زحل چطور؟');
  assertQuality(zohal, 'FA زحل follow-up', /زحل|ششمین|سیاره/);
});

test('context: comparison and emotion do not bleed into each other', () => {
  const engine = freshEngine(FA);
  engine.respond('فوتبال بهتره یا کشتی؟');
  // The follow-up must never re-answer the comparison or prepend the
  // grieving calibration to a neutral question.
  const again = engine.respond('تویوتا چطور؟');
  assert.doesNotMatch(
    again,
    /من اینجا با تو هستم\./,
    'FA follow-up comparison'
  );
  assert.ok(again.length > 10, 'FA follow-up non-empty');
  const sad = engine.respond('دلم خیلی گرفته');
  assertRouted(engine, ['sadness'], 'FA sadness after comparison');
  assertQuality(sad, 'FA sadness after comparison');
});

test('daily: FA بهم and برام request forms never trip the repetition detector', () => {
  // «بهم»/«برام» are everyday "to me" pronouns; the word-repetition
  // detector must not flag «چندتا کتاب بهم معرفی کن» as repetitive noise.
  const engine = freshEngine(FA);
  const reply = engine.respond('چندتا کتاب بهم معرفی کن');
  assertQuality(reply, 'FA بهم book request', /کتاب/);
});
