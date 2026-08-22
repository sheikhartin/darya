/**
 * Conversational-voice suite for the Darya engine.
 *
 * Pins the register invariant introduced with the conversational layer
 * (js/text/conversational.js): every reply the user sees speaks the
 * everyday 2026 register, never bookish written Persian («کتاب‌هایش را
 * گرفته است») or stilted uncontracted English ("I am here, do not
 * worry"). The suite has three layers:
 *
 *   1. Unit tests of the register transform itself (verb morphology,
 *      copula merging, homograph guards, quoted-poetry protection).
 *   2. Marker sweeps: scenario turns from many personas across both
 *      languages, asserting no bookish marker survives in any reply,
 *      regardless of which pool line the engine picks.
 *   3. Flow checks: greetings, farewells, knowledge answers, safety
 *      replies, and math answers all speak the same voice.
 *
 * This file is additive and permanent: its name describes the behavior
 * under test (the conversational voice), not any change or PR.
 */

'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN, casual } from './helpers.mjs';

// --------------------------------------------------------------------------
// Assertion helpers
// --------------------------------------------------------------------------

/**
 * Bookish written-Persian markers that the conversational layer must
 * always rewrite. «است» is checked separately (it is legitimate after a
 * Latin token, which the layer intentionally leaves alone).
 */
const BOOKISH_FA =
  /می‌باشد|نمی‌باشد|می‌شود|نمی‌شود|می‌توان(?:ی|م|د|یم|ید|ند)|چیست|کیست|بگویید|هستید|می‌خواهی(?![\p{L}])|خوش آمدی/u;

/** The bare copula « است» after a Persian word (Latin-adjacent is fine). */
const FA_COPULA = /(?<![A-Za-z0-9)»"]) است(?=[\s.،؛:!؟?»)]|$)/u;

/** Uncontracted English negations the layer always contracts. */
const BOOKISH_EN =
  /\b(?:cannot|do not|does not|did not|will not|would not|should not|could not|is not|are not|was not|were not|has not|have not)\b/i;

/** Removes quoted segments (poems, titles) that keep original wording. */
function stripQuotes(text) {
  return String(text).replace(/«[^»]*»|"[^"]*"|“[^”]*”/gu, ' ');
}

/**
 * Asserts one reply speaks the conversational register.
 * @param {string} reply - Engine reply
 * @param {object} lang - FA or EN language pack
 * @param {string} label - Failure label
 */
function assertConversational(reply, lang, label) {
  assert.ok(reply && reply.length > 0, `${label}: empty reply`);
  const bare = stripQuotes(reply);
  if (lang.code === 'fa') {
    assert.doesNotMatch(bare, BOOKISH_FA, `${label}: bookish FA: ${reply}`);
    assert.doesNotMatch(bare, FA_COPULA, `${label}: bare copula: ${reply}`);
  } else {
    assert.doesNotMatch(bare, BOOKISH_EN, `${label}: stiff EN: ${reply}`);
    assert.doesNotMatch(
      bare,
      /(?<!who |as |way )\b[Tt]hat is \w|(?<!who |as |way )\b[Ii]t is \w/u,
      `${label}: uncontracted subject: ${reply}`
    );
  }
}

/**
 * Runs a whole scenario (persona) through a fresh engine and checks
 * every reply, including the opening greeting.
 * @param {object} lang - FA or EN
 * @param {string[]} turns - User messages in order
 * @param {string} label - Scenario label
 */
function assertScenario(lang, turns, label) {
  const engine = freshEngine(lang);
  assertConversational(engine.greeting(), lang, `${label} (greeting)`);
  for (const turn of turns) {
    assertConversational(engine.respond(turn), lang, `${label}: ${turn}`);
  }
}

// --------------------------------------------------------------------------
// 1. The register transform itself
// --------------------------------------------------------------------------

test('voice: the flagship example rewrites exactly as users expect', () => {
  assert.equal(
    casual('ماهان کتاب‌هایش را گرفته است.'),
    'ماهان کتاب‌هاش رو گرفت' + 'ه.'
  );
});

test('voice: verb morphology becomes spoken Persian', () => {
  assert.equal(casual('می‌شود'), 'می‌شه');
  assert.equal(casual('نمی‌توانم'), 'نمی‌تونم');
  assert.equal(casual('می‌گویند'), 'می‌گن');
  assert.equal(casual('می‌خواهم بدانم'), 'می‌خوام بدونم');
  assert.equal(casual('می‌کند'), 'می‌کنه');
  assert.equal(casual('می‌بیند'), 'می‌بینه');
  assert.equal(casual('می‌رود'), 'می‌ره');
  assert.equal(casual('می‌آید'), 'میاد');
  assert.equal(casual('بگذار'), 'بذار');
});

test('voice: the copula merges naturally', () => {
  assert.equal(casual('مهم است.'), 'مهمه.');
  assert.equal(casual('پایتخت فرانسه پاریس است.'), 'پایتخت فرانسه پاریسه.');
  assert.equal(casual('زیبا است.'), 'زیباست.');
  assert.equal(casual('گرفته است.'), 'گرفته.');
});

test('voice: homographs are never mangled', () => {
  // «کند» the adjective (slow) and «بدهی» the noun (debt) must survive.
  assert.equal(casual('اینترنت کند است.'), 'اینترنت کند است.');
  assert.match(casual('بدهی‌های پرنرخ را پرداخت کن.'), /بدهی‌های/u);
  // The verb reading still converts after a whitelisted object.
  assert.match(casual('باید توضیح بدهی.'), /توضیح بدی/u);
  // «راست» and «نهایت» must never be caught by «را» and «های» rules.
  assert.equal(
    casual('راست می‌گویی، در نهایت درست شد.').includes('راست'),
    true
  );
  assert.equal(casual('در نهایت').includes('نهایت'), true);
});

test('voice: quoted poetry keeps its original wording', () => {
  const verse = '«بنی‌آدم اعضای یکدیگرند» از سعدی است.';
  const out = casual(verse);
  assert.ok(out.includes('«بنی‌آدم اعضای یکدیگرند»'), out);
  assert.ok(out.endsWith('سعدیه.'), out);
});

test('voice: past tense is never misread as present', () => {
  assert.equal(casual('می‌شد'), 'می‌شد');
  assert.equal(casual('می‌کردم'), 'می‌کردم');
  assert.equal(casual('می‌رفتیم'), 'می‌رفتیم');
});

test('voice: English contracts negations and subjects', () => {
  assert.equal(casual('I am here. Do not worry.'), "I'm here. Don't worry.");
  assert.equal(casual('It is not your fault.'), "It isn't your fault.");
  assert.equal(casual('I will not pretend.'), "I won't pretend.");
  assert.equal(casual('That is a fair point.'), "That's a fair point.");
});

test('voice: English keeps grammatical edge cases intact', () => {
  // Sentence-final and free-relative "is" must not contract.
  assert.equal(casual('Take it as it is.'), 'Take it as it is.');
  assert.equal(casual('Who I am matters.'), 'Who I am matters.');
});

test('voice: the transform is idempotent', () => {
  const once = casual('این موضوع بسیار مهم است و می‌تواند به تو کمک کند.');
  assert.equal(casual(once), once);
  const en = casual('I am sure that is true, do not worry.');
  assert.equal(casual(en), en);
});

// --------------------------------------------------------------------------
// 2. Marker sweeps across personas (FA)
// --------------------------------------------------------------------------

const FA_SCENARIOS = [
  [
    'stressed student',
    ['سلام', 'فردا امتحان دارم و استرس دارم', 'نمی‌تونم بخوابم']
  ],
  ['tired parent', ['بچه‌هام خیلی شلوغ می‌کنن', 'حس می‌کنم دیگه انرژی ندارم']],
  ['football fan', ['لئو مسی کیه؟', 'رونالدو کیه؟']],
  ['mma fan', ['خبیب کیه؟', 'رکوردش چیه؟', 'بیشتر بگو']],
  ['history buff', ['فردوسی کیه؟', 'حافظ کیه؟']],
  ['space kid', ['مریخ چیه؟', 'یه حقیقت جالب درباره فضا بگو']],
  ['math homework', ['۲+۲*۳ چند میشه؟', 'جذر ۱۶ چنده؟']],
  ['movie night', ['یه فیلم خوب معرفی کن', 'ترسناک باشه']],
  ['lonely evening', ['این روزا خیلی تنهام', 'کسی رو ندارم باهاش حرف بزنم']],
  ['work grind', ['کارم خیلی سنگین شده', 'مدیرم هی بهم کار اضافه می‌ده']],
  ['curious about darya', ['تو کی هستی؟', 'چه کارهایی بلدی؟']],
  ['gratitude', ['ممنون که هستی', 'خیلی کمکم کردی']],
  ['grief', ['مامان‌بزرگم فوت کرده', 'خیلی دلتنگشم']],
  ['sleep trouble', ['شب‌ها اصلا خوابم نمی‌بره']],
  ['anxiety spiral', ['همش استرس و اضطراب دارم', 'قلبم تند می‌زنه']],
  ['relationship worry', ['دوست دخترم داره ازم فاصله می‌گیره']],
  ['money squeeze', ['پولم تموم شده', 'اجاره‌خونه خیلی گرون شده']],
  ['language learner', ['چطور انگلیسی یاد بگیرم؟']],
  ['career switcher', ['می‌خوام شغلم رو عوض کنم ولی می‌ترسم']],
  ['tech curious', ['هوش مصنوعی چیه؟', 'بلاک‌چین چیه؟']],
  ['tehran traveler', ['تهران چه جاهای دیدنی داره؟']],
  ['music mood', ['یه آهنگ ایرانی معرفی کن']],
  ['pun lover', ['مسی بهتره یا سیم مسی؟']],
  ['dreamer', ['من مسی بعدی‌ام']],
  ['joker', ['من مسی‌ام']],
  ['philosopher fan', ['سقراط کیه؟', 'بیشتر بگو']],
  ['fitness starter', ['می‌خوام ورزش رو شروع کنم']],
  ['bad day', ['راستش امروز روز بدی داشتم']],
  ['celebration', ['قبول شدم دانشگاه!']],
  ['small talk', ['چخبر؟', 'خوبی؟']]
];

for (const [persona, turns] of FA_SCENARIOS) {
  test(`voice FA: ${persona} hears everyday Persian in every reply`, () => {
    assertScenario(FA, turns, persona);
  });
}

// --------------------------------------------------------------------------
// 2b. Marker sweeps across personas (EN)
// --------------------------------------------------------------------------

const EN_SCENARIOS = [
  ['stressed student', ['hi', 'i have an exam tomorrow and i am stressed']],
  ['mma fan', ['who is khabib?', 'what is his record?', 'tell me more']],
  ['football fan', ['who is messi?', 'who is ronaldo?']],
  ['movie night', ['recommend me a movie', 'something scary']],
  ['lonely evening', ['i feel really lonely these days']],
  ['work grind', ['my manager keeps piling work on me']],
  ['curious about darya', ['who are you?', 'what can you do?']],
  ['math homework', ['what is 2+2*3?', 'is 17 a prime number?']],
  ['grief', ['my grandmother passed away', 'i miss her so much']],
  ['space kid', ['tell me about mars', 'give me a fun fact about space']],
  ['history buff', ['who is ferdowsi?', 'who is rumi?']],
  ['sleep trouble', ["i can't sleep at night"]],
  ['celebration', ['i got the job!']],
  ['language learner', ['how do i learn english faster?']],
  ['dreamer', ["I'm the next Messi"]],
  ['joker', ["i'm socrates"]],
  ['pun lover', ['messi or messy?']],
  ['tech curious', ['what is artificial intelligence?']],
  ['money squeeze', ['rent is eating half my salary']],
  ['gratitude', ['thanks, you really helped me']]
];

for (const [persona, turns] of EN_SCENARIOS) {
  test(`voice EN: ${persona} hears natural contracted English`, () => {
    assertScenario(EN, turns, persona);
  });
}

// --------------------------------------------------------------------------
// 3. Flow checks: every public engine surface speaks the same voice
// --------------------------------------------------------------------------

test('voice: greetings, farewells, and exit confirmations are conversational', () => {
  for (const lang of [FA, EN]) {
    for (let i = 0; i < 6; i += 1) {
      const engine = freshEngine(lang);
      assertConversational(engine.greeting(), lang, 'greeting');
      assertConversational(engine.exitConfirmation(), lang, 'exit confirm');
      assertConversational(engine.farewell(), lang, 'farewell');
    }
  }
});

test('voice: safety replies stay warm AND conversational', () => {
  const fa = freshEngine(FA).respond('دیگه نمیخوام زندگی کنم');
  assertConversational(fa, FA, 'FA crisis');
  assert.match(fa, /۱۲۳|۱۴۸۰/u, 'FA crisis reply must keep the hotlines');
  const en = freshEngine(EN).respond('I want to kill myself');
  assertConversational(en, EN, 'EN crisis');
  assert.match(en, /988|116 123/u, 'EN crisis reply must keep the hotlines');
});

test('voice: knowledge answers are conversational for many random picks', () => {
  const prompts = [
    'جان جونز کیه',
    'ایلیا توپوریا کیه؟',
    'بهترین مبارز تاریخ ام‌ام‌ای کیه؟',
    'خیام کیه؟',
    'بیت‌کوین چیه؟'
  ];
  for (const prompt of prompts) {
    assertConversational(freshEngine(FA).respond(prompt), FA, prompt);
  }
});

test('voice: quick-reply chips are conversational too', () => {
  const engine = freshEngine(FA);
  for (const turn of ['سلام', 'حالم خوب نیست', 'نمی‌دونم چی بگم']) {
    engine.respond(turn);
    for (const chip of engine.lastTurnQuickReplies || []) {
      assertConversational(chip, FA, `chip after ${turn}`);
    }
  }
});

test('voice: empty input and repeated greetings stay conversational', () => {
  const engine = freshEngine(FA);
  assertConversational(engine.respond('   '), FA, 'empty input');
  const again = freshEngine(FA);
  again.respond('سلام');
  again.respond('سلام');
  assertConversational(again.respond('سلام'), FA, 'repeated greeting');
});
