/**
 * Profile-memory adversarial corpus.
 *
 * The session profile (name, age, location, preferences) is the part of
 * Darya that decides "who is this person?", and it is also the part with
 * the sharpest linguistic trap in Persian: the first-person glued copula
 * («من بارانم» = I am Baran) and the possessive suffix («من اسمم چیه» =
 * what is MY name) are written with the exact same «م». The shipped bug
 * this corpus was built around: «من اسمم چیه؟» stored the literal word
 * «اسم» as the user's name and Darya replied «اسم قشنگیه، اسم» - and
 * «من اسمم الیاس هست» ALSO stored «اسم» because the possessive branch
 * matched before the name could.
 *
 * Every scenario here is a full conversation (8 to 16 turns), not a
 * single-shot probe: disclosures are buried between emotional turns,
 * knowledge questions, math, jokes, and crisis language, and the recall
 * comes many turns later. The corpus asserts four invariants:
 *
 *   1. A real disclosure is stored exactly and recalled verbatim.
 *   2. A trap (possessive, duration, third-person age, manner adverb,
 *      decline-to-share) never stores anything.
 *   3. A recall with nothing stored is answered honestly, never with an
 *      invented or garbage value.
 *   4. The stored profile survives digressions, corrections, safety
 *      turns, and famous-figure jokes without corruption.
 */

'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN } from './helpers.mjs';

// Honest "I do not know that yet" phrasings across every pool variant,
// after the conversational-register layer has rewritten them.
const FA_UNKNOWN = /نگفتی|نگفته|نمی‌دونم|نمی‌دانم|نمیدونم|یادم نیست|بگی/u;
const EN_UNKNOWN =
  /haven'?t told me|have not told me|don'?t know your|do not know your|not told me|don'?t know yet|do not know yet/i;

// The Persian stored-name acknowledgment phrasings. A trap turn must
// never be answered with any of these.
const FA_NAME_ACK = /اسم قشنگیه|با همین اسم|خوشحالم که اسمت/u;
const EN_NAME_ACK =
  /lovely name|think of you by that name|glad to know your name/i;

/**
 * Runs one scenario: a fresh engine, every turn in order, and the final
 * profile expectation. A turn may assert on the reply (expect/avoid
 * regexes) and on the profile state right after that turn (profile:
 * an object whose values are exact strings or null for must-be-empty).
 * @param {object} scenario
 */
function runScenario(scenario) {
  const engine = freshEngine(scenario.language === 'en' ? EN : FA);
  scenario.turns.forEach((turn, index) => {
    const reply = engine.respond(turn.say);
    const at = `${scenario.name} @ turn ${index + 1} («${turn.say}»)`;
    assert.ok(
      typeof reply === 'string' && reply.length > 0,
      `${at}: reply must be non-empty`
    );
    if (turn.expect) {
      assert.match(reply, turn.expect, `${at}: got «${reply}»`);
    }
    if (turn.avoid) {
      assert.doesNotMatch(reply, turn.avoid, `${at}: got «${reply}»`);
    }
    if (turn.profile) {
      for (const [key, value] of Object.entries(turn.profile)) {
        assert.deepEqual(
          engine._userProfile[key],
          value,
          `${at}: profile.${key} should be ${JSON.stringify(value)}, ` +
            `profile is ${JSON.stringify(engine._userProfile)}`
        );
      }
    }
  });
  if (scenario.profile) {
    for (const [key, value] of Object.entries(scenario.profile)) {
      assert.deepEqual(
        engine._userProfile[key],
        value,
        `${scenario.name}: final profile.${key} should be ` +
          `${JSON.stringify(value)}, profile is ` +
          `${JSON.stringify(engine._userProfile)}`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 1. Targeted pattern regressions (the exact root causes, unit level)
// ---------------------------------------------------------------------------

test('FA nameStatement: the possessive «من اسمم چیه» never matches as a disclosure', () => {
  const p = FA.userProfilePatterns.nameStatement;
  for (const text of [
    'من اسمم چیه',
    'من اسمم چی بود',
    'من اسمم رو بهت گفتم',
    'من اسمم یادم رفته'
  ]) {
    const m = p.exec(text);
    const captured = m ? m.slice(1).filter(Boolean) : [];
    assert.ok(
      !captured.includes('اسم'),
      `«${text}» must never capture the literal word «اسم», got: ${captured}`
    );
  }
});

test('FA nameStatement: «من اسمم الیاس هست» captures the actual name, not «اسم»', () => {
  const m = FA.userProfilePatterns.nameStatement.exec('من اسمم الیاس هست');
  assert.ok(m, 'the disclosure must match');
  const captured = m.slice(1).filter(Boolean);
  assert.ok(
    captured.includes('الیاس'),
    `the captured name must be الیاس, got: ${captured}`
  );
});

test('FA nameStatement: «اسمم مهم نیست» never captures the backtracked «ست»', () => {
  // The correction branch used to let the regex split «نیست» into
  // «نی» + «ست» and store the fragment «ست» as a name.
  const m = FA.userProfilePatterns.nameStatement.exec('اسمم مهم نیست');
  const captured = m ? m.slice(1).filter(Boolean) : [];
  assert.ok(
    !captured.includes('ست') && !captured.includes('مهم'),
    `«اسمم مهم نیست» must not capture a name, got: ${captured}`
  );
});

test('FA ageStatement: durations with «سال» are not ages', () => {
  const p = FA.userProfilePatterns.ageStatement;
  for (const text of [
    'من ۵ سال سابقه کار دارم',
    'من ۳ سال تو این شرکت کار کردم',
    'من ۲ سال درس خوندم',
    'من ۱۰ سال پیش ازدواج کردم',
    'من ۱۰ ساله که اینجا کار میکنم',
    'من ۳ سال دارم روش کار میکنم'
  ]) {
    assert.equal(p.exec(text), null, `«${text}» must not read as an age`);
  }
});

test('FA ageStatement: real age forms keep matching', () => {
  const p = FA.userProfilePatterns.ageStatement;
  for (const text of [
    'من ۲۴ سالمه',
    'من ۲۴ ساله هستم',
    '۲۴ سال دارم',
    'سنم ۳۰',
    'و ۲۴ سالمه'
  ]) {
    assert.ok(p.exec(text), `«${text}» must still read as an age`);
  }
});

test('EN ageStatement: third-person ages are not the user age', () => {
  const p = EN.userProfilePatterns.ageStatement;
  for (const text of [
    'my son is 5 years old',
    'my grandma is 90 years old',
    'my dog is 3 years old',
    'she is 80 years old'
  ]) {
    assert.equal(p.exec(text), null, `"${text}" must not read as the user age`);
  }
  for (const text of ["i'm 34 years old", 'im 27', 'my age is 41']) {
    assert.ok(p.exec(text), `"${text}" must still read as the user age`);
  }
});

test('EN nameStatement: decline-to-share and idiom forms never capture', () => {
  const p = EN.userProfilePatterns.nameStatement;
  for (const text of [
    'my name is a secret',
    'my name is private',
    'my name is weird',
    'call me maybe',
    'call me later tonight',
    'call me crazy but it worked'
  ]) {
    const m = p.exec(text);
    const captured = m ? m.slice(1).filter(Boolean) : [];
    assert.equal(
      captured.length,
      0,
      `"${text}" must not capture a name, got: ${captured}`
    );
  }
});

test('FA locationGuard: manner and companion phrases are not places', () => {
  const g = FA.userProfilePatterns.locationGuard;
  for (const value of ['تنها', 'سخت', 'راحت', 'با مادرم', 'پدر و مادرم']) {
    assert.match(value, g, `«${value}» must be rejected as a place`);
  }
  for (const value of ['تهران', 'شیراز', 'کرج']) {
    assert.doesNotMatch(value, g, `«${value}» must stay a valid place`);
  }
});

// ---------------------------------------------------------------------------
// 2. The reported-bug conversations, replayed end to end
// ---------------------------------------------------------------------------

const SCENARIOS = [
  {
    name: 'reported bug: «من اسمم چیه؟» cold is honest, then a real disclosure works',
    language: 'fa',
    turns: [
      { say: 'سلام' },
      {
        say: 'من اسمم چیه؟',
        expect: FA_UNKNOWN,
        avoid: FA_NAME_ACK,
        profile: { name: null }
      },
      { say: 'حق داری، هنوز نگفته بودم' },
      { say: 'من اسمم الیاس هست', profile: { name: 'الیاس' } },
      { say: 'امروز سر کار خیلی خسته شدم' },
      { say: 'رئیسم همش گیر میده' },
      { say: 'یه پروژه سنگین هم رو دوشمه' },
      { say: 'حالا بگو من اسمم چیه؟', expect: /الیاس/u },
      { say: 'آفرین، یادت موند' }
    ],
    profile: { name: 'الیاس' }
  },
  {
    name: 'reported bug: «من اسمم الیاس هست» stores الیاس, never the word «اسم»',
    language: 'fa',
    turns: [
      { say: 'سلام، خوبی؟' },
      {
        say: 'من اسمم الیاس هست',
        expect: /الیاس/u,
        profile: { name: 'الیاس' }
      },
      { say: 'دیشب بد خوابیدم' },
      { say: 'صبح هم دیر رسیدم سر کار' },
      { say: 'ناهار هم نخوردم' },
      { say: 'اسمم چیه؟', expect: /الیاس/u },
      { say: 'مرسی که یادته' }
    ],
    profile: { name: 'الیاس' }
  },
  {
    name: 'reported bug: glued copula «من اسمم الیاسه» stores الیاس',
    language: 'fa',
    turns: [
      { say: 'من اسمم الیاسه', expect: /الیاس/u, profile: { name: 'الیاس' } },
      { say: 'یه سوال دارم' },
      { say: 'مسی کیه؟' },
      { say: 'چه جالب' },
      { say: 'اسمم چیه؟', expect: /الیاس/u }
    ],
    profile: { name: 'الیاس' }
  },
  {
    name: 'reported bug (en mirror): cold recall honest, disclosure stored, recall exact',
    language: 'en',
    turns: [
      { say: 'hey' },
      {
        say: "what's my name?",
        expect: EN_UNKNOWN,
        avoid: EN_NAME_ACK,
        profile: { name: null }
      },
      { say: 'fair enough' },
      { say: 'my name is Elias', profile: { name: 'Elias' } },
      { say: 'work has been rough lately' },
      { say: 'my manager keeps changing the deadlines' },
      { say: 'i barely sleep these days' },
      { say: "so what's my name?", expect: /Elias/u }
    ],
    profile: { name: 'Elias' }
  },
  {
    name: 'recall phrasings sweep: told-you and do-you-know forms stay questions',
    language: 'fa',
    turns: [
      {
        say: 'من اسمم رو بهت گفتم؟',
        expect: FA_UNKNOWN,
        profile: { name: null }
      },
      {
        say: 'میدونی اسمم چیه؟',
        expect: FA_UNKNOWN,
        profile: { name: null }
      },
      { say: 'باشه، اسمم نگاره', profile: { name: 'نگار' } },
      { say: 'یه کم از روزم بگم؟' },
      { say: 'امروز کلاس زبان داشتم' },
      { say: 'اسمم رو بهت گفتم؟', expect: /نگار/u },
      { say: 'میدونی اسمم چیه؟', expect: /نگار/u }
    ],
    profile: { name: 'نگار' }
  },

  // -------------------------------------------------------------------------
  // 3. Possessive-suffix trap marathons («من Xم» = MY X, never a name)
  // -------------------------------------------------------------------------
  {
    name: 'possessive marathon: states and feelings never become names',
    language: 'fa',
    turns: [
      { say: 'سلام' },
      { say: 'من حالم خوبه', profile: { name: null } },
      { say: 'ولی من فکرم مشغوله', profile: { name: null } },
      { say: 'من ذهنم درگیره', profile: { name: null } },
      { say: 'من قلبم گرفته', profile: { name: null } },
      { say: 'من جونم به لبم رسیده', profile: { name: null } },
      { say: 'من حالم بده', profile: { name: null } },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null, age: null }
  },
  {
    name: 'possessive marathon: body parts never become names',
    language: 'fa',
    turns: [
      { say: 'من دستم درد میکنه', profile: { name: null } },
      { say: 'من پام شکسته', profile: { name: null } },
      { say: 'من چشمم درد میکنه', profile: { name: null } },
      { say: 'من سرم شلوغه', profile: { name: null } },
      { say: 'من موهام ریخته', profile: { name: null } },
      { say: 'خلاصه وضعم خوب نیست' },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN, avoid: /دست|پا |چشم|سرت/u }
    ],
    profile: { name: null }
  },
  {
    name: 'possessive marathon: money, devices, and belongings never become names',
    language: 'fa',
    turns: [
      { say: 'من گوشیم خرابه', profile: { name: null } },
      { say: 'من ماشینم خرابه', profile: { name: null } },
      { say: 'من پولم تموم شده', profile: { name: null } },
      { say: 'من کارم سخته', profile: { name: null } },
      { say: 'من شغلم برنامه نویسیه', profile: { name: null } },
      { say: 'من خونم تهرانه', profile: { name: null } },
      { say: 'حالا بگو اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null }
  },
  {
    name: 'possessive «من سنم چنده» is an age question, never a disclosure of «سن»',
    language: 'fa',
    turns: [
      {
        say: 'من سنم چنده؟',
        expect: FA_UNKNOWN,
        profile: { name: null, age: null }
      },
      { say: 'من سنم ۲۴ سالمه', profile: { age: '۲۴', name: null } },
      { say: 'یه چیز دیگه هم بگم' },
      { say: 'امروز باشگاه ثبت نام کردم' },
      { say: 'چند سالمه؟', expect: /۲۴/u },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { age: '۲۴', name: null }
  },
  {
    name: 'possessive «من اسمم یادم رفته» is a lapse, never the name «اسم»',
    language: 'fa',
    turns: [
      { say: 'یه چیز عجیب بگم؟' },
      { say: 'من اسمم یادم رفته', avoid: FA_NAME_ACK, profile: { name: null } },
      { say: 'شوخی کردم، اسمم آرتینه', profile: { name: 'آرتین' } },
      { say: 'اسمم چیه؟', expect: /آرتین/u }
    ],
    profile: { name: 'آرتین' }
  },

  // -------------------------------------------------------------------------
  // 4. Glued-copula state traps («من Xم» utterance-final states)
  // -------------------------------------------------------------------------
  {
    name: 'ability and knowledge verbs never become names',
    language: 'fa',
    turns: [
      { say: 'یه کاری برام پیش اومده' },
      { say: 'ازم پرسیدن میتونی یا نه' },
      { say: 'آره من میتونم', profile: { name: null } },
      { say: 'ولی راستش من نمیدونم', profile: { name: null } },
      { say: 'من نمیتونم', profile: { name: null } },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null }
  },
  {
    name: 'affection and loyalty tails never become names',
    language: 'fa',
    turns: [
      { say: 'مرسی که گوش میدی' },
      { say: 'من باهاتم', profile: { name: null } },
      { say: 'من عاشقتم', profile: { name: null } },
      { say: 'من مخلصتم', profile: { name: null } },
      { say: 'من چاکرتم', profile: { name: null } },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null }
  },
  {
    name: 'heavy-mood glued states never become names',
    language: 'fa',
    turns: [
      { say: 'من داغونم', profile: { name: null } },
      { say: 'من پشیمونم', profile: { name: null } },
      { say: 'من دلتنگم', profile: { name: null } },
      { say: 'من گرفتارم', profile: { name: null } },
      { say: 'من درگیرم', profile: { name: null } },
      { say: 'من بدهکارم', profile: { name: null } },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null }
  },
  {
    name: 'identity self-descriptions never become names',
    language: 'fa',
    turns: [
      { say: 'من ایرانیم', profile: { name: null } },
      { say: 'من مسلمانم', profile: { name: null } },
      { say: 'من آشپزم', profile: { name: null } },
      { say: 'من طراحم', profile: { name: null } },
      { say: 'من حسابدارم', profile: { name: null } },
      { say: 'من راننده هستم', profile: { name: null } },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null }
  },

  // -------------------------------------------------------------------------
  // 5. Real self-introductions still work in every form
  // -------------------------------------------------------------------------
  {
    name: 'glued self-intro «من بارانم» survives a long emotional digression',
    language: 'fa',
    turns: [
      { say: 'سلام من بارانم', profile: { name: 'باران' } },
      { say: 'امروز با خواهرم دعوام شد' },
      { say: 'سر یه موضوع کوچیک' },
      { say: 'ولی حرفای بدی بهم زد' },
      { say: 'الان دلم گرفته' },
      { say: 'نمیدونم باید من زنگ بزنم یا اون' },
      { say: 'شاید فردا حلش کنم' },
      { say: 'راستی اسمم چیه؟', expect: /باران/u }
    ],
    profile: { name: 'باران' }
  },
  {
    name: 'combined intro «من آرتینم و ۲۴ سالمه» stores both and recalls both',
    language: 'fa',
    turns: [
      {
        say: 'من آرتینم و ۲۴ سالمه',
        profile: { name: 'آرتین', age: '۲۴' }
      },
      { say: 'تازه کارم رو عوض کردم' },
      { say: 'محیط جدید یه کم استرس داره' },
      { say: 'ولی حقوقش بهتره' },
      {
        say: 'یادته که گفتم من کی هستم و چند سالمه؟',
        expect: /آرتین/u
      },
      { say: 'چند سالمه؟', expect: /۲۴/u }
    ],
    profile: { name: 'آرتین', age: '۲۴' }
  },
  {
    name: 'call-me form «منو دریا صدا کن» overwrites the earlier name',
    language: 'fa',
    turns: [
      { say: 'اسمم بارانه', profile: { name: 'باران' } },
      { say: 'ولی راستش از یه لقب خوشم میاد' },
      { say: 'منو دریا صدا کن', profile: { name: 'دریا' } },
      { say: 'خب حالا اسمم چیه؟', expect: /دریا/u, avoid: /باران/u }
    ],
    profile: { name: 'دریا' }
  },
  {
    name: 'correction chain: negated old name never resurfaces',
    language: 'fa',
    turns: [
      { say: 'اسمم سیناست', profile: { name: 'سینا' } },
      { say: 'چند تا کار عقب افتاده دارم' },
      { say: 'راستش اسمم سینا نیست، پارساست', profile: { name: 'پارسا' } },
      { say: 'اسمم چیه؟', expect: /پارسا/u, avoid: /سینا/u },
      { say: 'دقیقا' }
    ],
    profile: { name: 'پارسا' }
  },
  {
    name: 'put-my-name form «اسممو سارا بذار» stores سارا',
    language: 'fa',
    turns: [
      { say: 'اسممو سارا بذار', profile: { name: 'سارا' } },
      { say: 'دوست دارم غیر رسمی حرف بزنیم' },
      { say: 'اسمم چیه؟', expect: /سارا/u }
    ],
    profile: { name: 'سارا' }
  },
  {
    name: 'formal copular intro «من آناهیتا هستم» still stores',
    language: 'fa',
    turns: [
      { say: 'سلام، من آناهیتا هستم', profile: { name: 'آناهیتا' } },
      { say: 'اولین باره اینجام' },
      { say: 'چه کارهایی بلدی؟' },
      { say: 'خوبه' },
      { say: 'اسمم رو یادته؟', expect: /آناهیتا/u }
    ],
    profile: { name: 'آناهیتا' }
  },

  // -------------------------------------------------------------------------
  // 6. Age traps: durations, third parties, and real ages
  // -------------------------------------------------------------------------
  {
    name: 'work-experience durations never become the user age',
    language: 'fa',
    turns: [
      { say: 'من ۵ سال سابقه کار دارم', profile: { age: null } },
      { say: 'من ۳ سال تو این شرکت کار کردم', profile: { age: null } },
      { say: 'من ۲ سال درس خوندم', profile: { age: null } },
      { say: 'من ۱۰ ساله که اینجا کار میکنم', profile: { age: null } },
      { say: 'چند سالمه؟', expect: FA_UNKNOWN },
      { say: 'من ۳۵ سالمه', profile: { age: '۳۵' } },
      { say: 'چند سالمه؟', expect: /۳۵/u }
    ],
    profile: { age: '۳۵' }
  },
  {
    name: 'life-event durations never become the user age',
    language: 'fa',
    turns: [
      { say: 'من ۱۰ سال پیش ازدواج کردم', profile: { age: null } },
      { say: 'زندگی مشترک فراز و نشیب داره' },
      { say: 'من ۳ سال دارم روش کار میکنم', profile: { age: null } },
      { say: 'چند سالمه؟', expect: FA_UNKNOWN }
    ],
    profile: { age: null }
  },
  {
    name: 'children ages stay the children ages, in Persian',
    language: 'fa',
    turns: [
      { say: 'پسرم ۵ سالشه', profile: { age: null } },
      { say: 'دخترم ۳ ساله است', profile: { age: null } },
      { say: 'دوتاشون خیلی شیطونن' },
      { say: 'چند سالمه؟', expect: FA_UNKNOWN },
      { say: 'خودم ۴۱ سالمه', profile: { age: '۴۱' } },
      { say: 'چند سالمه؟', expect: /۴۱/u }
    ],
    profile: { age: '۴۱' }
  },
  {
    name: 'children and relatives ages stay theirs, in English',
    language: 'en',
    turns: [
      { say: 'my son is 5 years old', profile: { age: null } },
      { say: 'my grandma is 90 years old', profile: { age: null } },
      { say: 'my dog is 3 years old', profile: { age: null } },
      { say: 'how old am i?', expect: EN_UNKNOWN },
      { say: "i'm 34 years old", profile: { age: '34' } },
      { say: 'how old am i?', expect: /34/u }
    ],
    profile: { age: '34' }
  },
  {
    name: 'word-number age and the age update are both honored',
    language: 'fa',
    turns: [
      { say: 'بیست و چهار سالمه', profile: { age: '۲۴' } },
      { say: 'البته هفته دیگه تولدمه' },
      { say: 'راستش الان ۲۵ سالمه', profile: { age: '۲۵' } },
      { say: 'چند سالمه؟', expect: /۲۵/u, avoid: /۲۴/u }
    ],
    profile: { age: '۲۵' }
  },
  {
    name: 'quantity phrases in English never become ages',
    language: 'en',
    turns: [
      { say: 'i am 2 meters tall', profile: { age: null } },
      { say: 'i am 100 percent sure', profile: { age: null } },
      {
        say: 'i worked there for 3 years and im 40 now',
        profile: { age: '40' }
      },
      { say: 'how old am i?', expect: /40/u }
    ],
    profile: { age: '40' }
  },

  // -------------------------------------------------------------------------
  // 7. Location traps: manner adverbs and companions are not cities
  // -------------------------------------------------------------------------
  {
    name: 'living alone is a lifestyle, never a city',
    language: 'fa',
    turns: [
      { say: 'تنها زندگی می‌کنم', profile: { location: null } },
      { say: 'بعضی شبا سخته' },
      {
        say: 'کجا زندگی می‌کنم؟',
        expect: FA_UNKNOWN,
        avoid: /تنها زندگی می‌کنی/u
      },
      { say: 'من تو تهران زندگی می‌کنم', profile: { location: 'تهران' } },
      { say: 'کجا زندگی می‌کنم؟', expect: /تهران/u }
    ],
    profile: { location: 'تهران' }
  },
  {
    name: 'living with family is a household, never a city',
    language: 'fa',
    turns: [
      { say: 'با مادرم زندگی می‌کنم', profile: { location: null } },
      {
        say: 'من هنوز با پدر و مادرم زندگی می‌کنم',
        profile: { location: null }
      },
      { say: 'سخت زندگی می‌کنم', profile: { location: null } },
      { say: 'کجا زندگی می‌کنم؟', expect: FA_UNKNOWN }
    ],
    profile: { location: null }
  },
  {
    name: 'origin form «اهل شیرازم» stores the city, and recalls it',
    language: 'fa',
    turns: [
      { say: 'من اهل شیرازم', profile: { location: 'شیراز' } },
      { say: 'ولی برای کار اومدم پایتخت' },
      { say: 'یادته کجا زندگی می‌کنم؟', expect: /شیراز/u }
    ],
    profile: { location: 'شیراز' }
  },
  {
    name: 'English lifestyle sentences never store a city',
    language: 'en',
    turns: [
      { say: 'i live alone', profile: { location: null } },
      { say: 'i live with my parents', profile: { location: null } },
      { say: 'where do i live?', expect: EN_UNKNOWN },
      { say: 'i live in Tehran', profile: { location: 'Tehran' } },
      { say: 'where do i live?', expect: /Tehran/u }
    ],
    profile: { location: 'Tehran' }
  },

  // -------------------------------------------------------------------------
  // 8. Preferences: glued copula objects and pronouns
  // -------------------------------------------------------------------------
  {
    name: 'dislike disclosure survives a digression and recalls exactly',
    language: 'fa',
    turns: [
      { say: 'از شلوغی بدم میاد', profile: { preferences: ['شلوغی'] } },
      { say: 'دیروز مترو خیلی شلوغ بود' },
      { say: 'کلافه شدم' },
      { say: 'از چی بدم میاد؟', expect: /شلوغی/u }
    ]
  },
  {
    name: 'English preference stored and recalled, and "i like you" never stored',
    language: 'en',
    turns: [
      { say: 'i love coffee', profile: { preferences: ['coffee'] } },
      { say: 'i like you', profile: { preferences: ['coffee'] } },
      { say: 'what do i like?', expect: /coffee/iu }
    ]
  },

  // -------------------------------------------------------------------------
  // 9. Decline-to-share: the refusal is respected, never stored
  // -------------------------------------------------------------------------
  {
    name: 'Persian decline «اسمم خصوصیه» and «اسمم مهم نیست» store nothing',
    language: 'fa',
    turns: [
      { say: 'اسمم خصوصیه', avoid: FA_NAME_ACK, profile: { name: null } },
      { say: 'اسمم مهم نیست', avoid: FA_NAME_ACK, profile: { name: null } },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null }
  },
  {
    name: 'English decline family stores nothing',
    language: 'en',
    turns: [
      {
        say: 'my name is a secret',
        avoid: EN_NAME_ACK,
        profile: { name: null }
      },
      {
        say: 'my name is private',
        avoid: EN_NAME_ACK,
        profile: { name: null }
      },
      { say: 'my name is weird, everyone laughs', profile: { name: null } },
      { say: "what's my name?", expect: EN_UNKNOWN }
    ],
    profile: { name: null }
  },
  {
    name: 'English idioms around "call me" never store names',
    language: 'en',
    turns: [
      { say: 'call me tomorrow morning', profile: { name: null } },
      { say: 'call me back', profile: { name: null } },
      { say: 'call me maybe', profile: { name: null } },
      { say: "what's my name?", expect: EN_UNKNOWN },
      { say: 'okay okay, call me Sara', profile: { name: 'Sara' } },
      { say: "what's my name?", expect: /Sara/u }
    ],
    profile: { name: 'Sara' }
  },

  // -------------------------------------------------------------------------
  // 10. Long mixed-topic marathons: memory under real conversational load
  // -------------------------------------------------------------------------
  {
    name: 'marathon: intro, work stress, math, football, and a late recall',
    language: 'fa',
    turns: [
      { say: 'سلام' },
      { say: 'من اسمم کوروشه', profile: { name: 'کوروش' } },
      { say: 'این هفته خیلی کار سرم ریخته' },
      { say: 'رئیسم هی جلسه میذاره' },
      { say: 'دو بعلاوه دو چند میشه؟', expect: /۴|چهار/u },
      { say: 'مسی کیه؟' },
      { say: 'مسی بهتره یا رونالدو؟' },
      { say: 'خب دیگه بسه فوتبال' },
      { say: 'یه نفس عمیق کشیدم' },
      { say: 'اسمم چیه؟', expect: /کوروش/u }
    ],
    profile: { name: 'کوروش' }
  },
  {
    name: 'marathon: famous-figure joke never overwrites the real name',
    language: 'fa',
    turns: [
      { say: 'اسمم داریوشه', profile: { name: 'داریوش' } },
      { say: 'یه اعترافی بکنم؟' },
      { say: 'من مسی‌ام', profile: { name: 'داریوش' } },
      { say: 'شوخی کردم بابا' },
      { say: 'ولی فوتبالم بد نیستا' },
      { say: 'اسمم چیه؟', expect: /داریوش/u, avoid: /مسی/u }
    ],
    profile: { name: 'داریوش' }
  },
  {
    name: 'marathon: profile survives a crisis turn and recall stays exact',
    language: 'fa',
    turns: [
      { say: 'اسمم سیناست', profile: { name: 'سینا' } },
      { say: 'چند وقته حالم خوب نیست' },
      { say: 'دیگه طاقت ندارم', expect: /۱۲۳|۱۴۸۰/u },
      { say: 'باشه، سعی میکنم زنگ بزنم' },
      { say: 'اسمم چیه؟', expect: /سینا/u }
    ],
    profile: { name: 'سینا' }
  },
  {
    name: 'marathon (en): name, age, city, and preference all recalled at the end',
    language: 'en',
    turns: [
      { say: 'hi there' },
      { say: 'my name is Artin', profile: { name: 'Artin' } },
      { say: "i'm 28 years old", profile: { age: '28' } },
      { say: 'i live in Tehran', profile: { location: 'Tehran' } },
      { say: 'i love hiking', profile: { preferences: ['hiking'] } },
      { say: 'work has been stressful lately' },
      { say: 'my manager micromanages everything' },
      { say: 'anyway, what is 12 * 12?', expect: /144/u },
      { say: "what's my name?", expect: /Artin/u },
      { say: 'how old am i?', expect: /28/u },
      { say: 'where do i live?', expect: /Tehran/u },
      { say: 'what do i like?', expect: /hiking/iu }
    ],
    profile: {
      name: 'Artin',
      age: '28',
      location: 'Tehran',
      preferences: ['hiking']
    }
  },
  {
    name: 'marathon: elderly combined disclosure stores silently, then recalls',
    language: 'fa',
    turns: [
      { say: 'من ۷۲ سالمه و تنها زندگی می‌کنم', profile: { age: '۷۲' } },
      { say: 'بچه‌هام خارج از کشورن' },
      { say: 'گاهی خیلی ساکته خونه' },
      { say: 'چند سالمه؟', expect: /۷۲/u },
      { say: 'کجا زندگی می‌کنم؟', expect: FA_UNKNOWN }
    ],
    profile: { age: '۷۲', location: null }
  },
  {
    name: 'marathon: repeated recall does not corrupt or forget the name',
    language: 'fa',
    turns: [
      { say: 'اسمم نگاره', profile: { name: 'نگار' } },
      { say: 'اسمم چیه؟', expect: /نگار/u },
      { say: 'اسمم چیه؟', expect: /نگار/u },
      { say: 'اسمم چیه؟!', expect: /نگار/u },
      { say: 'مطمینی؟' },
      { say: 'اسم من چیه؟', expect: /نگار/u }
    ],
    profile: { name: 'نگار' }
  },
  {
    name: 'marathon: who-am-i identity question answers from the profile',
    language: 'en',
    turns: [
      { say: 'who am i?', expect: EN_UNKNOWN, profile: { name: null } },
      { say: 'my name is Sepanta', profile: { name: 'Sepanta' } },
      { say: 'i have been thinking about my life a lot' },
      { say: 'sometimes i feel like a different person' },
      { say: 'who am i?', expect: /Sepanta/u }
    ],
    profile: { name: 'Sepanta' }
  },
  {
    name: 'marathon: emotion-first states «من خستم» and «من خوبم» stay states',
    language: 'fa',
    turns: [
      { say: 'من خستم', profile: { name: null } },
      { say: 'من خوبم', profile: { name: null } },
      { say: 'من مریضم', profile: { name: null } },
      { say: 'من تنهام', profile: { name: null } },
      { say: 'خلاصه هفته سختی بود' },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null }
  },
  {
    name: 'marathon (en): copular states and hedges never store names',
    language: 'en',
    turns: [
      { say: "i'm Serious about this", profile: { name: null } },
      { say: "i'm Legend at this game", profile: { name: null } },
      { say: "i'm not sure how to start", profile: { name: null } },
      { say: "what's my name?", expect: EN_UNKNOWN },
      { say: "i'm Sara", profile: { name: 'Sara' } },
      { say: "what's my name?", expect: /Sara/u }
    ],
    profile: { name: 'Sara' }
  },
  {
    name: 'marathon: name disclosed with a heavy heart stores silently and recalls',
    language: 'fa',
    turns: [
      { say: 'اسمم آریاست و دلم خیلی گرفته', profile: { name: 'آریا' } },
      { say: 'از صبح گریه‌ام میگیره' },
      { say: 'نمیدونم چمه' },
      { say: 'اسمم چیه؟', expect: /آریا/u }
    ],
    profile: { name: 'آریا' }
  },
  {
    name: 'marathon: joke ideation is checked in, and the profile stays intact',
    language: 'en',
    turns: [
      { say: "i'm Sara", profile: { name: 'Sara' } },
      { say: 'i wanna die lol jk', avoid: /lovely name/iu },
      { say: "i'm fine, really, it was a joke" },
      { say: "what's my name?", expect: /Sara/u }
    ],
    profile: { name: 'Sara' }
  },
  {
    name: 'marathon: young age gets the trusted-adult reply and exact recall',
    language: 'fa',
    turns: [
      {
        say: 'من ۱۰ سالمه',
        expect: /بزرگ|اعتماد|والد|معلم/u,
        profile: { age: '۱۰' }
      },
      { say: 'تو مدرسه یه کم اذیت میشم' },
      { say: 'چند سالمه؟', expect: /۱۰/u }
    ],
    profile: { age: '۱۰' }
  },
  {
    name: 'marathon: leaving and staying verbs never become names',
    language: 'fa',
    turns: [
      { say: 'من دارم میرم', profile: { name: null } },
      { say: 'من موندگارم', profile: { name: null } },
      { say: 'فقط من موندم', profile: { name: null } },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null }
  },
  {
    name: 'marathon: the sea is a preference, never clipped to «دری»',
    language: 'fa',
    turns: [
      { say: 'قهوه رو خیلی دوست دارم', profile: { preferences: ['قهوه'] } },
      { say: 'صبح بدون قهوه بیدار نمیشم' },
      { say: 'چی دوست دارم؟', expect: /قهوه/u }
    ]
  },
  {
    name: 'marathon: full bilingual-shape session in Persian with every slot',
    language: 'fa',
    turns: [
      { say: 'سلام، من آناهیتام', profile: { name: 'آناهیتا' } },
      { say: 'من ۳۱ سالمه', profile: { age: '۳۱' } },
      { say: 'من تو اصفهان زندگی می‌کنم', profile: { location: 'اصفهان' } },
      { say: 'از ترافیک بدم میاد', profile: { preferences: ['ترافیک'] } },
      { say: 'این روزها سر کار حس خوبی ندارم' },
      { say: 'یه همکارم پشت سرم حرف زده' },
      { say: 'خیلی ناراحت شدم' },
      { say: 'بگذریم' },
      { say: 'اسمم چیه؟', expect: /آناهیتا/u },
      { say: 'چند سالمه؟', expect: /۳۱/u },
      { say: 'کجا زندگی می‌کنم؟', expect: /اصفهان/u },
      { say: 'از چی بدم میاد؟', expect: /ترافیک/u }
    ],
    profile: {
      name: 'آناهیتا',
      age: '۳۱',
      location: 'اصفهان',
      preferences: ['ترافیک']
    }
  },
  {
    name: 'marathon: fake names inside questions never store («من کی هستم»)',
    language: 'fa',
    turns: [
      { say: 'من کی هستم؟', profile: { name: null } },
      { say: 'من کیم؟', profile: { name: null } },
      { say: 'یه سوال فلسفی بود' },
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN }
    ],
    profile: { name: null }
  },
  {
    name: 'marathon: two-session isolation, nothing leaks between engines',
    language: 'fa',
    turns: [
      { say: 'اسمم چیه؟', expect: FA_UNKNOWN, profile: { name: null } },
      { say: 'هیچ وقت بهت نگفته بودم' },
      { say: 'چند سالمه؟', expect: FA_UNKNOWN, profile: { age: null } },
      {
        say: 'کجا زندگی می‌کنم؟',
        expect: FA_UNKNOWN,
        profile: { location: null }
      }
    ],
    profile: { name: null, age: null, location: null }
  }
];

for (const scenario of SCENARIOS) {
  test(`scenario: ${scenario.name}`, () => {
    runScenario(scenario);
  });
}

test('the adversarial corpus stays broad enough to matter', () => {
  assert.ok(
    SCENARIOS.length >= 45,
    `expected at least 45 scenarios, found ${SCENARIOS.length}`
  );
  const totalTurns = SCENARIOS.reduce((sum, s) => sum + s.turns.length, 0);
  assert.ok(
    totalTurns >= 250,
    `expected at least 250 conversation turns, found ${totalTurns}`
  );
  const faCount = SCENARIOS.filter((s) => s.language === 'fa').length;
  const enCount = SCENARIOS.filter((s) => s.language === 'en').length;
  assert.ok(faCount >= 25, `expected 25+ Persian scenarios, found ${faCount}`);
  assert.ok(enCount >= 8, `expected 8+ English scenarios, found ${enCount}`);
});
