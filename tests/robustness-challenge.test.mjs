/**
 * Robustness challenge suite.
 *
 * The adversarial companion corpus: hard, realistic, and messy turns in
 * both languages. It exists to find weaknesses, not to celebrate
 * strengths, so it deliberately includes the cases that used to break
 * the engine: clarification restatements («منظورم این هست که چه
 * قابلیت‌هایی داری؟»), everyday colloquial registers (چخبر, کجایی,
 * چته), Latin interjections inside Persian chat (ok, tnx, lol, bye),
 * name corrections, verb-shaped preference traps («میتونی عاشق
 * بشی؟»), sports and notable-people questions in both scripts, live
 * data phrasings, word problems, contradictions, ethical dilemmas,
 * decision dilemmas, and the new companion rules (betrayal, work
 * humiliation, misunderstood, bad day, pet names, poems).
 *
 * Every assertion checks the reply for the property that was broken in
 * the failing transcript (evasive honesty pool, foreign-language
 * redirect, wrong-name echo, knowledge hijack, topic hop), so a
 * regression in any of them fails here.
 *
 * Run with: node --test tests/robustness-challenge.test.mjs
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN } from './helpers.mjs';

/**
 * Drives a fresh engine through optional history turns and returns the
 * final reply.
 * @param {object} lang - Language pack (FA or EN)
 * @param {string} input - The turn under test
 * @param {string[]} [history] - Turns before the tested one
 * @returns {string}
 */
function replyFor(lang, input, history = []) {
  const engine = freshEngine(lang);
  for (const turn of history) {
    engine.respond(turn);
  }
  return engine.respond(input);
}

/** Evasive or broken markers that must never appear in these answers.
 * Deliberately precise: a capability answer legitimately ends with
 * «ادعای دانستن ندارم», so bare "ندارم" must NOT be flagged. */
const EVASIVE =
  /جواب (?:دقیقی|آماده‌ای)|منبع قابل‌اعتمادی|ویکی‌پدیا|کمی بیشتر توضیح|کوتاه بود|می‌توانیم با هم به آن نگاه کنیم|کنار هم واکاویش کنیم|جای خوبی برای مکث|no (?:ready|precise|clear) answer|wikipedia|beyond my knowledge|interesting question in itself|good place to think/i;

// ============================================================================
// 1. Clarification restatements
// ============================================================================

test('fa clarification: منظورم این هست که چه قابلیت‌هایی داری؟ answers the restated question', () => {
  const reply = replyFor(FA, 'منظورم این هست که چه قابلیت‌هایی داری؟');
  assert.doesNotMatch(reply, EVASIVE);
  assert.match(
    reply,
    /گفتگو|حافظه|آفلاین|گوش بدهم|توضیح بدهم|نمی‌توانم|محدودیت/i
  );
});

test('fa clarification: منظورم اینه که چه قابلیت‌هایی داری؟ and spaced variants', () => {
  for (const input of [
    'منظورم اینه که چه قابلیت‌هایی داری؟',
    'منظورم اینه که چیکار می‌تونی بکنی؟',
    'منظورم این هست که چه کارهایی می‌تونی انجام بدی؟'
  ]) {
    const reply = replyFor(FA, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must not be evasive`);
    assert.match(
      reply,
      /گفتگو|آفلاین|محدودیت|نمی‌توانم|یاد/i,
      `${input} must answer capabilities`
    );
  }
});

test('fa clarification: می‌خوام بدونم قابلیت‌هات چیه beats the need rule', () => {
  const reply = replyFor(FA, 'می‌خوام بدونم قابلیت‌هات چیه');
  assert.match(reply, /گفتگو|آفلاین|محدودیت|نمی‌توانم/i);
});

test('en clarification: "I mean, what capabilities do you have?" answers capabilities', () => {
  for (const input of [
    'I mean, what capabilities do you have?',
    'I mean what can you do?',
    'What I mean is, what are you able to do?',
    'I want to know what features you have'
  ]) {
    const reply = replyFor(EN, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must not be evasive`);
    // The MEAN/MERN stack fact must never hijack "I mean, what can you do".
    assert.doesNotMatch(
      reply,
      /MEAN|MERN/i,
      `${input} must not answer the MEAN stack fact`
    );
    assert.match(
      reply,
      /companion|conversation|listen|offline|shelf|help/i,
      `${input} must answer capabilities`
    );
  }
});

test('fa clarification with knowledge: منظورم اینه که مسی کیه؟ answers the person fact', () => {
  const reply = replyFor(FA, 'منظورم اینه که مسی کیه؟');
  assert.match(reply, /مسی|آرژانتین|بارسلونا|توپ طلا/i);
});

// ============================================================================
// 2. Capability question variants
// ============================================================================

test('fa capability variants all answer, never the unknown pool', () => {
  const variants = [
    'چه قابلیت‌هایی داری؟',
    'چه قابلیت‌هایی داری',
    'قابلیت‌هات چیه؟',
    'قابلیت هات چیه',
    'قابلیت‌هایت چیه؟',
    'چه کارهایی می‌تونی انجام بدی؟',
    'چه کارهایی میتونی انجام بدی؟',
    'چه کارهایی بلدی؟',
    'چه کارهایی ازت برمیاد؟',
    'چه چیزهایی میدونی؟',
    'چیکار می‌تونی بکنی؟'
  ];
  for (const input of variants) {
    const reply = replyFor(FA, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must not be evasive`);
    assert.match(
      reply,
      /گفتگو|آفلاین|محدودیت|نمی‌توانم|قفسه|گوش بدهم|توضیح بدهم/i,
      `${input} must answer capabilities, got: ${reply}`
    );
  }
});

test('en capability variants all answer, never the unknown pool', () => {
  const variants = [
    'What are your capabilities?',
    'What capabilities do you have?',
    'What are your abilities?',
    'What are you capable of?',
    'What are you able to do?',
    'What can you do for me?',
    'What features do you have?'
  ];
  for (const input of variants) {
    const reply = replyFor(EN, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must not be evasive`);
    assert.match(
      reply,
      /companion|listen|offline|shelf|help|conversation|limit/i,
      `${input} must answer capabilities, got: ${reply}`
    );
  }
});

test('en identity vs capability stay separate', () => {
  assert.match(replyFor(EN, 'What are you?'), /companion|listen|not|darya/i);
  assert.match(replyFor(EN, 'Who are you?'), /darya|companion|listen/i);
  assert.match(
    replyFor(EN, 'What are you capable of?'),
    /companion|listen|offline|help/i
  );
});

// ============================================================================
// 3. Everyday colloquial register (Persian, 2026 spoken style)
// ============================================================================

test('fa colloquial greetings and openers get warm replies, never the stiff prompt', () => {
  const cases = [
    ['چخبر؟', /خوب|خبر|خوشحالم|حال/],
    ['کجایی؟', /همین|کجا|اینجا/],
    ['کجایی الان؟', /همین|کجا|اینجا/],
    ['مشکلی نیست؟', /روبه‌راه|اوکی|خوب|آرام|نگران/],
    ['چته؟', /چه شده|بگو|شنوم|اتفاق/],
    ['چی شده؟', /چه شده|بگو|شنوم|اتفاق/]
  ];
  for (const [input, marker] of cases) {
    const reply = replyFor(FA, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must not be evasive`);
    assert.doesNotMatch(
      reply,
      /کمی بیشتر توضیح|کوتاه بود/,
      `${input} must not get the short-reply prompt`
    );
    assert.match(reply, marker, `${input} must answer in the right register`);
  }
});

test('fa where_are_you does not hijack workplace questions', () => {
  assert.match(replyFor(FA, 'کجا کار میکنی؟'), /همین|کجا|اینجا/);
  assert.match(
    replyFor(FA, 'کجا زندگی میکنی؟'),
    /برنامه|ربات|انسان|خانه|زندگی/i
  );
});

test('fa فلانی کیه؟ gets a playful clarification, not a stiff prompt', () => {
  for (const input of ['فلانی کیه؟', 'فلانی کیست؟']) {
    const reply = replyFor(FA, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must not be evasive`);
    assert.doesNotMatch(
      reply,
      /کوتاه بود|کمی بیشتر توضیح/,
      `${input} must not get the short-reply prompt`
    );
    assert.match(
      reply,
      /فلانی|اسمش|بگو|کدوم|چه کسی/i,
      `${input} must ask which person, got: ${reply}`
    );
  }
});

test('en "who is so-and-so?" gets a playful clarification', () => {
  const reply = replyFor(EN, 'who is so-and-so?');
  assert.doesNotMatch(reply, EVASIVE);
  assert.match(reply, /so-and-so|name|tell me|clue/i);
});

test('en everyday check-ins get warm replies', () => {
  assert.match(replyFor(EN, "What's up?"), /hey|good|here|fine|you|how|what/i);
  assert.match(replyFor(EN, 'where are you?'), /here|with you|conversation/i);
  assert.match(replyFor(EN, "it's all good"), /good|fine|here|you/i);
});

// ============================================================================
// 4. Latin interjections inside Persian chat
// ============================================================================

test('fa chat understands pure-Latin interjections instead of redirecting', () => {
  const ack = replyFor(FA, 'ok');
  assert.doesNotMatch(
    ack,
    /فارسی|زبان|redirect/i,
    '"ok" must not trigger the language redirect'
  );
  assert.doesNotMatch(replyFor(FA, 'tnx'), /فارسی|زبان/i);
  assert.doesNotMatch(replyFor(FA, 'lol'), /فارسی|زبان/i);
  assert.doesNotMatch(replyFor(FA, 'thanks'), /فارسی|زبان/i);
  assert.match(
    replyFor(FA, 'hi'),
    /سلام|درود|خوش آمدی|خوبی|امروز|گفتگو|چه چیزی|چیزی|دوباره|نخ|برگشتی|موضوعی/i
  );
});

test('fa chat "bye" enters the two-step exit flow, not the language redirect', () => {
  const engine = freshEngine(FA);
  const first = engine.respond('bye');
  assert.doesNotMatch(
    first,
    /فارسی|زبان/i,
    '"bye" must not trigger the language redirect'
  );
  assert.match(
    first,
    /پایان|بروی|خداحافظ|می‌خواهی/i,
    `exit confirmation expected, got: ${first}`
  );
});

test('fa chat still redirects real foreign-language sentences', () => {
  const reply = replyFor(FA, 'I am learning Persian and I love this app');
  assert.match(reply, /فارسی|redirect/i);
});

// ============================================================================
// 5. Sports knowledge breadth (15+ sports)
// ============================================================================

test('fa sports questions answer with real facts, both script styles', () => {
  const cases = [
    ['تنیس چیه؟', /گرنداسلم|راکت|ست|تور/i],
    ['شطرنج چیه؟', /شاه|وزیر|کیش|مهره|۶۴/i],
    ['کشتی چیه؟', /آزاد|فرنگی|المپیک|تشک/i],
    ['کریکت چیه؟', /ران|ویکت|بت|توپ/i],
    ['فوتبال آمریکایی چیه؟', /تاچ‌داون|NFL|توپ بیضی|سوپر بول/i],
    ['بوکس چیه؟', /رینگ|دستکش|راند|کلی/i],
    ['شنا چیه؟', /فلپس|کرال|پروانه|المپیک/i],
    ['دو و میدانی چیه؟', /بولت|ماراتن|پرتاب|پرش/i],
    ['ژیمناستیک چیه؟', /بایلز|خرک|موازنه|زمینی/i],
    ['جودو چیه؟', /کانو|ایپون|پرتاب|ژاپن/i],
    ['تکواندو چیه؟', /کره|ضربه|پا|المپیک/i],
    ['دوچرخه‌سواری چیه؟', /تور دو فرانس|جاده|رکاب/i],
    ['اسکی چیه؟', /آلپاین|برف|المپیک|زمستانی/i],
    ['پینگ پونگ چیه؟', /راکت|۱۱|چین|میز/i],
    ['بدمینتون چیه؟', /شاتل|راکت|پَر/i],
    ['هندبال چیه؟', /دروازه‌بان|هفت|توپ/i],
    ['راگبی چیه؟', /تری|توپ بیضی|یونیون/i],
    ['گلف چیه؟', /سوراخ|ضربه|چوب/i],
    ['فرمول یک چیه؟', /شوماخر|همیلتون|گرندپری/i],
    ['آفساید یعنی چی؟', /مهاجم|مدافع|دروازه/i],
    ['وی ای آر چیه؟', /داور|گل|پنالتی|ویدیو/i],
    ['فوتسال چیه؟', /سالنی|پنج|آسیا/i],
    ['وزنه برداری چیه؟', /یک‌ضرب|دوضرب|رضازاده/i],
    ['کشتی ایران چطوره؟', /تختی|یزدانی|سوریان|المپیک/i]
  ];
  for (const [input, marker] of cases) {
    const reply = replyFor(FA, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must answer from the shelf`);
    assert.match(
      reply,
      marker,
      `${input} must contain real content, got: ${reply}`
    );
  }
});

test('en sports questions answer with real facts', () => {
  const cases = [
    ['What is tennis?', /grand slam|racket|set|net/i],
    ['What is chess?', /king|queen|checkmate|64/i],
    ['What is wrestling?', /freestyle|greco|olympic/i],
    ['What is cricket?', /run|wicket|bat|T20/i],
    ['What is American football?', /touchdown|NFL|super bowl|oval/i],
    ['What is boxing?', /ring|gloves|round|ali/i],
    ['What is swimming?', /phelps|crawl|butterfly/i],
    ['What is athletics?', /bolt|marathon|throw|jump/i],
    ['What is gymnastics?', /biles|beam|floor/i],
    ['What is judo?', /kano|ippon|throw|japan/i],
    ['What is taekwondo?', /korea|kick|olympic/i],
    ['What is cycling?', /tour de france|road|bike/i],
    ['What is skiing?', /alpine|snow|winter/i],
    ['What is esports?', /league|competitive|game/i],
    ['What is table tennis?', /paddle|11|china/i],
    ['What is badminton?', /shuttle|racket/i],
    ['What is handball?', /goalkeeper|seven|throw/i],
    ['What is rugby?', /try|oval|union/i],
    ['What is golf?', /hole|stroke|club/i],
    ['What is Formula One?', /schumacher|hamilton|grand prix/i],
    ['What is offside in football?', /attacker|defender|goal/i],
    ['What is VAR?', /referee|goal|penalty|video/i],
    ['What is futsal?', /indoor|five|asia/i],
    ['What is weightlifting?', /snatch|clean and jerk/i],
    ['What is Iran wrestling like?', /takhti|yazdani|olympic/i]
  ];
  for (const [input, marker] of cases) {
    const reply = replyFor(EN, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must answer from the shelf`);
    assert.match(
      reply,
      marker,
      `${input} must contain real content, got: ${reply}`
    );
  }
});

test('sports facts never answer association-football questions with American football', () => {
  const reply = replyFor(FA, 'فوتبال چیه؟');
  assert.match(reply, /یازده|۴۵|دروازه|آفساید/i);
  assert.doesNotMatch(reply, /تاچ‌داون/i);
});

// ============================================================================
// 6. Notable people breadth
// ============================================================================

test('fa notable people answer with real facts, both script styles', () => {
  const cases = [
    ['فردوسی کیه؟', /شاهنامه|حماسی|پنجاه هزار/i],
    ['حافظ کیه؟', /غزل|شیراز|فال/i],
    ['سعدی کیه؟', /گلستان|بوستان/i],
    ['مولانا کیه؟', /مثنوی|شمس|قونیه/i],
    ['خیام کیه؟', /رباعیات|تقویم|نیشابور/i],
    ['نیما یوشیج کیه؟', /شعر نو|مازندران|ققنوس/i],
    ['فروغ فرخزاد کیه؟', /تولدی دیگر|شاعر/i],
    ['سهراب سپهری کیه؟', /هشت کتاب|کاشان|نقاش/i],
    ['صادق هدایت کیه؟', /بوف کور/i],
    ['کیارستمی کیه؟', /طعم گیلاس|نخل طلا|کارگردان/i],
    ['شجریان کیه؟', /آواز|خسرو آواز|موسیقی/i],
    ['اصغر فرهادی کیه؟', /جدایی|اسکار|کارگردان/i],
    ['مریم میرزاخانی کیه؟', /فیلدز|ریاضی/i],
    ['ابن سینا کیه؟', /قانون|شفا|پزشک/i],
    ['خوارزمی کیه؟', /جبر|الگوریتم/i],
    ['اینشتین کیه؟', /نسبیت|فیزیک/i],
    ['افلاطون کیه؟', /جمهور|آکادمی|سقراط/i],
    ['کلئوپاترا کیه؟', /مصر|بطلمیوس/i],
    ['شکسپیر کیه؟', /هملت|نمایشنامه/i],
    ['ون گوگ کیه؟', /شب پرستاره|نقاش/i],
    ['بتهوون کیه؟', /سمفونی|آهنگساز/i],
    ['ملاله کیه؟', /نوبل|آموزش/i],
    ['علی دایی کیه؟', /گل|بایرن|رکورد/i],
    ['مارادونا کیه؟', /۱۹۸۶|دست خدا/i],
    ['پله کیه؟', /برزیل|سه بار|جام جهانی/i],
    ['آتاتورک کیه؟', /ترکیه|جمهوری|گالیپولی/i]
  ];
  for (const [input, marker] of cases) {
    const reply = replyFor(FA, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must answer from the shelf`);
    assert.match(
      reply,
      marker,
      `${input} must contain real content, got: ${reply}`
    );
  }
});

test('en notable people answer with real facts', () => {
  const cases = [
    ['Who is Ferdowsi?', /shahnameh|epic|persian/i],
    ['Who is Hafez?', /ghazal|shiraz/i],
    ['Who is Rumi?', /masnavi|konya|sufi/i],
    ['Who is Khayyam?', /rubaiyat|calendar/i],
    ['Who is Kiarostami?', /taste of cherry|cannes|director/i],
    ['Who is Shajarian?', /singing|khosrow|iran/i],
    ['Who was Avicenna?', /canon|physician|medicine/i],
    ['Who was Einstein?', /relativity|physics/i],
    ['Who was Plato?', /republic|academy|socrates/i],
    ['Who was Cleopatra?', /egypt|ptolemaic/i],
    ['Who was Van Gogh?', /starry night|painter/i],
    ['Who was Beethoven?', /symphony|composer/i],
    ['Who is Malala?', /nobel|education/i],
    ['Who is Ali Daei?', /goals|record|bayern/i],
    ['Who is Maradona?', /hand of god|argentina/i],
    ['Who was Shakespeare?', /hamlet|playwright/i],
    ['Who was Newton?', /gravity|motion|principia/i],
    ['Who is Maryam Mirzakhani?', /fields medal|mathematician/i]
  ];
  for (const [input, marker] of cases) {
    const reply = replyFor(EN, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must answer from the shelf`);
    assert.match(
      reply,
      marker,
      `${input} must contain real content, got: ${reply}`
    );
  }
});

test('people answers never hijack capability or identity turns', () => {
  // "What are you capable of?" contains no person name, so the shelf
  // cannot fire; the capability pool must answer instead.
  assert.match(
    replyFor(EN, 'What are you capable of?'),
    /companion|listen|offline|help/i
  );
  assert.match(replyFor(FA, 'تو کی هستی؟'), /دریا|همراه|انسان/i);
});

// ============================================================================
// 7. Corrections
// ============================================================================

test('fa name correction stores the corrected name, never the old one', () => {
  const engine = freshEngine(FA);
  engine.respond('اسمم علیه');
  const correctionReply = engine.respond('اسمم علی نیست، کوروشه');
  assert.doesNotMatch(
    correctionReply,
    /علی(?!\.)/,
    'the old name must not be echoed as the stored name'
  );
  const recall = engine.respond('اسم من چیه؟');
  assert.match(
    recall,
    /کوروش/,
    `recall must use the corrected name, got: ${recall}`
  );
  assert.doesNotMatch(recall, /علی/);
});

test('en name correction stores the corrected name', () => {
  const engine = freshEngine(EN);
  engine.respond('My name is Ali');
  const correctionReply = engine.respond(
    'Actually my name is not Ali, it is Koroush'
  );
  assert.doesNotMatch(
    correctionReply,
    /\bAli\b/,
    'the old name must not be echoed as the stored name'
  );
  const recall = engine.respond('What is my name?');
  assert.match(
    recall,
    /Koroush/,
    `recall must use the corrected name, got: ${recall}`
  );
});

test('fa state adjectives with attached copula are still never stored as names', () => {
  const engine = freshEngine(FA);
  engine.respond('من خستم');
  const recall = engine.respond('اسمم چیه؟');
  assert.doesNotMatch(recall, /خست/);
});

// ============================================================================
// 8. Preference traps and self-awareness
// ============================================================================

test('fa میتونی عاشق بشی؟ gets an honest identity answer, never a stored preference', () => {
  const reply = replyFor(FA, 'میتونی عاشق بشی؟');
  assert.match(reply, /ربات|برنامه|انسان نیستم|آفلاین/i);
  assert.doesNotMatch(reply, /یادداشت کردم|سلیقه/);
});

test('en "can you fall in love?" gets an honest answer', () => {
  const reply = replyFor(EN, 'can you fall in love?');
  assert.match(reply, /not|program|bot|feel|love/i);
});

test('fa تو هوشیاری؟ and تو احساس داری؟ get honest self-awareness answers', () => {
  for (const input of ['تو هوشیاری؟', 'تو احساس داری؟', 'تو آگاهی داری؟']) {
    const reply = replyFor(FA, input);
    assert.match(
      reply,
      /ربات|برنامه|انسان نیستم|آفلاین|آگاه/i,
      `${input} must answer honestly`
    );
  }
});

test('fa genuine preference statements are still stored and recalled', () => {
  const engine = freshEngine(FA);
  engine.respond('من عاشق قهوه هستم');
  const recall = engine.respond('چی دوست دارم؟');
  assert.match(recall, /قهوه/);
});

// ============================================================================
// 9. Live data honesty
// ============================================================================

test('fa live-data phrasings get the honest offline reply', () => {
  const cases = [
    'امروز چه خبره؟',
    'دیشب کی برد؟',
    'نتیجه بازی دیشب چیه؟',
    'بازی دیشب چطور شد؟',
    'قیمت طلا چنده؟',
    'فردا هوا چطوره؟'
  ];
  for (const input of cases) {
    const reply = replyFor(FA, input);
    assert.match(
      reply,
      /آفلاین|لحظه‌ای|اینترنت|زنده|نمی‌توانم|صادقانه/i,
      `${input} must lead with the offline limit, got: ${reply}`
    );
  }
});

test('en live-data phrasings get the honest offline reply', () => {
  const cases = [
    'Who won last night game?',
    "What's the news today?",
    'What is the price of gold?',
    'What is the weather tomorrow?'
  ];
  for (const input of cases) {
    const reply = replyFor(EN, input);
    assert.match(
      reply,
      /offline|live|internet|cannot|honest/i,
      `${input} must lead with the offline limit, got: ${reply}`
    );
  }
});

test('fa چه خبر؟ stays a warm check-in, not a news question', () => {
  const reply = replyFor(FA, 'چه خبر؟');
  assert.match(reply, /خوبم|خوشحالم|حال/i);
});

// ============================================================================
// 10. Companion rules: betrayal, humiliation, misunderstanding, bad day
// ============================================================================

test('fa friendship betrayal is believed first', () => {
  const reply = replyFor(FA, 'دوستمو سر یه مهمونی دیدم که پشت سرم حرف زده');
  assert.match(reply, /باورت|پشت سرت|اعتماد|ناراحت|بشنوم|غم|خشم|دوستش/i);
});

test('en friendship betrayal is believed first', () => {
  const reply = replyFor(EN, 'My best friend betrayed me');
  assert.match(
    reply,
    /believe|hurt|trust|betrayal|grief|anger|let you down|cared about/i
  );
});

test('fa work humiliation gets empathy, not the generic work question', () => {
  const reply = replyFor(FA, 'رئیس‌م جلوی همه تحقیرم کرد');
  assert.match(
    reply,
    /حق داری|تحقیر|شرمنده|تقصیر|اشتباه|بی‌احترامی|مشکل|ارزش/i
  );
});

test('en work humiliation gets empathy', () => {
  const reply = replyFor(EN, 'my boss humiliated me in front of everyone');
  assert.match(
    reply,
    /fault|hurt|belittled|right to|problem|worth|disrespects|audience/i
  );
});

test('fa misunderstood gets empathy', () => {
  const reply = replyFor(FA, 'کسی حرفمو نمیفهمه');
  assert.match(reply, /درک|نمی‌فهمد|نمی‌فهمند|بشنوم|گوش|شنیده|فهمیده|درد/i);
});

test('fa bad day gets empathy for the day', () => {
  const reply = replyFor(FA, 'امروز روز بدی بود');
  assert.doesNotMatch(reply, EVASIVE);
  assert.match(reply, /سنگین|دلم می‌سوزد|روز بد|چه روز|نفس/i);
});

// ============================================================================
// 11. Contradictions, ethics, decisions
// ============================================================================

test('fa contradiction accusation gets honest self-awareness, not a topic hop', () => {
  for (const input of [
    'قبلا گفتی فلان چیز رو میتونی، حالا میگی نه',
    'جوابت با قبل فرق داره',
    'تو اول گفتی اینطوری، حالا یه چیز دیگه میگی'
  ]) {
    const reply = replyFor(FA, input);
    assert.doesNotMatch(
      reply,
      /عوض می‌کنیم|دوست داری برویم سراغ|تکرار می‌کنم/,
      `${input} must not dodge`
    );
    assert.match(
      reply,
      /حق داری|محدودیت|ناهماهنگ|گفتگوست|قفسه|بررسی|کجا|نمی‌گویم|راستش/i,
      `${input} must answer honestly, got: ${reply}`
    );
  }
});

test('en contradiction accusation gets honest self-awareness', () => {
  const reply = replyFor(EN, 'You said the opposite before');
  assert.match(
    reply,
    /fair point|inconsistent|limitation|memory|conversation|shelf|honest|exactly/i
  );
});

test('fa ethical dilemmas get honest exploration, not formulas', () => {
  for (const input of [
    'اگه کسی برای درمان مامانش پول نداشته باشه، دزدی درسته؟',
    'دروغ سفید بگم یا نه؟'
  ]) {
    const reply = replyFor(FA, input);
    assert.match(
      reply,
      /خاکستری|ارزش|پیامد|مهم‌تر|گزینه/i,
      `${input} must explore values`
    );
  }
});

test('en ethical dilemmas get honest exploration', () => {
  const reply = replyFor(
    EN,
    'Should I report my friend who cheated on the exam?'
  );
  assert.match(reply, /value|consequence|option|matter/i);
});

test('fa decision dilemmas get a thinking frame, not the overwork pool', () => {
  const reply = replyFor(FA, 'بین دو تا شغل موندم، چیکار کنم؟');
  assert.match(reply, /گزینه|انتخاب|ارزش|قدم|آزمایش|کامل نیست/i);
});

test('en decision dilemmas get a thinking frame', () => {
  const reply = replyFor(EN, 'I am torn between two jobs');
  assert.match(reply, /option|choice|value|experiment|step/i);
});

// ============================================================================
// 12. Pet names and poems
// ============================================================================

test('fa pet-name requests get creative names, never pet-care advice', () => {
  const reply = replyFor(FA, 'یه اسم برای گربه‌م پیشنهاد بده');
  assert.doesNotMatch(
    reply,
    /دامپزشک|قایم|غذا نمی‌خوره/,
    'pet-name request must not get pet-care advice'
  );
  assert.match(reply, /اسم|پیشنهاد|تماشا|خصوصیت/i);
});

test('en pet-name requests get creative names', () => {
  const reply = replyFor(EN, 'suggest a name for my cat');
  assert.doesNotMatch(
    reply,
    /vet|hide/i,
    'pet-name request must not get pet-care advice'
  );
  assert.match(reply, /name|idea|personality|trait/i);
});

test('fa poem requests get verses, not a deflection', () => {
  const reply = replyFor(FA, 'یه شعر بگو');
  assert.match(reply, /حافظ|مولانا|سپهری|شعر/i);
});

test('en poem requests get verses', () => {
  const reply = replyFor(EN, 'say a poem');
  assert.match(reply, /rumi|dickinson|blake|poem|verse/i);
});

// ============================================================================
// 13. Word problems
// ============================================================================

test('fa everyday word problems are solved, not sourced to Wikipedia', () => {
  const cases = [
    [
      'اگه ۵ تا سیب داشته باشم و ۲ تا بدم، چند تا میمونه؟',
      /5 منهای 2|می‌شود 3|۳/
    ],
    ['اگه ۵ تا سیب داشته باشم و ۲ تا بدم چند تا میمونه', /3/],
    ['۱۰ تا کتاب داشتم و ۳ تاشو دادم', /7/],
    ['اگه ۴ تا سیب داشته باشم و ۳ تا بخرم چند تا دارم', /7/],
    ['۲۰ تا شیرینی رو بین ۴ نفر تقسیم کنم', /5/]
  ];
  for (const [input, marker] of cases) {
    const reply = replyFor(FA, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must be solved`);
    assert.match(
      reply,
      marker,
      `${input} must contain the right result, got: ${reply}`
    );
  }
});

test('en everyday word problems are solved', () => {
  const cases = [
    [
      'If I have 5 apples and give away 2, how many are left?',
      /5 minus 2 is 3/
    ],
    [
      'If I have five apples and give away two, how many are left?',
      /5 minus 2 is 3/
    ],
    ['If I have 5 apples and buy 3 more, how many do I have?', /5 plus 3 is 8/],
    [
      'If a train travels 60 km per hour, how far in 3 hours?',
      /60 times 3 is 180/
    ],
    ['If a train travels 60 km per hour for 3 hours, how far?', /180/],
    [
      'If 10 cookies are shared between 5 people, how many each?',
      /10 divided by 5 is 2/
    ]
  ];
  for (const [input, marker] of cases) {
    const reply = replyFor(EN, input);
    assert.doesNotMatch(reply, EVASIVE, `${input} must be solved`);
    assert.match(
      reply,
      marker,
      `${input} must contain the right result, got: ${reply}`
    );
  }
});

test('word problems never misfire on decision dilemmas', () => {
  const reply = replyFor(FA, 'بین دو تا شغل موندم، چیکار کنم؟');
  assert.doesNotMatch(reply, /منهای|تقسیم|به‌علاوه/i);
});

// ============================================================================
// 14. Fatigue and heavy mood
// ============================================================================

test('fa bare خستم reaches the fatigue pool, not the pain pool', () => {
  const reply = replyFor(FA, 'خستم');
  assert.match(reply, /خستگی|خسته|انرژی|استراحت|پیام بدن/i);
  assert.doesNotMatch(reply, /دردت را می‌شنوم/);
});

test('fa از همه چی خسته شدم stays on the caring thread', () => {
  const reply = replyFor(FA, 'از همه چی خسته شدم');
  assert.match(reply, /سنگین|حمایت|متخصص|می‌شنوم/i);
});

test('en "I am tired of everything" stays on the caring thread', () => {
  const reply = replyFor(EN, 'I am tired of everything');
  assert.match(reply, /depress|support|professional|heavy|weight/i);
});

// ============================================================================
// 15. Follow-ups and memory continuity
// ============================================================================

test('fa short follow-up stays on the active thread', () => {
  const engine = freshEngine(FA);
  engine.respond('با بهترین دوستم دعوا کردم');
  const followup = engine.respond('آره');
  // A first short reply may get a gentle elaboration nudge; it must
  // never bounce to the unknown pool or hop the topic.
  assert.doesNotMatch(
    followup,
    /کوتاه بود|جای خوبی برای مکث|می‌توانیم با هم به آن نگاه کنیم|کنار هم واکاویش کنیم/
  );
  assert.doesNotMatch(followup, /دوست داری برویم سراغ چه موضوعی|عوض می‌کنیم/);
  assert.ok(
    followup.length > 20,
    `follow-up must be a real reply, got: ${followup}`
  );
});

test('fa memory: name, age, and location recall still work after corrections', () => {
  const engine = freshEngine(FA);
  engine.respond('اسم من بارانه');
  engine.respond('من ۲۴ سالمه');
  engine.respond('من تو اصفهان زندگی میکنم');
  assert.match(engine.respond('اسم من چیه؟'), /باران/);
  assert.match(engine.respond('چند سالمه؟'), /۲۴|24/);
  assert.match(engine.respond('کجا زندگی میکنم؟'), /اصفهان/);
});

test('en memory recall still works', () => {
  const engine = freshEngine(EN);
  engine.respond('My name is Sara');
  engine.respond('I am 24 years old');
  assert.match(engine.respond('What is my name?'), /Sara/);
  assert.match(engine.respond('How old am I?'), /24/);
});

// ============================================================================
// 16. Regression guards from the fixed transcript failures
// ============================================================================

test('regression: math precedence still correct after word problems', () => {
  assert.match(replyFor(FA, '۲+۲*۳ چند میشه؟'), /۸|8/);
  assert.match(replyFor(EN, 'What is 2+2*3?'), /8/);
});

test('regression: MEAN stack fact never hijacks clarification turns', () => {
  const reply = replyFor(EN, 'I mean, what are you able to do?');
  assert.doesNotMatch(reply, /MongoDB|MEAN|MERN/);
});

test('regression: fa جوابت با قبل فرق داره no longer repeats itself', () => {
  const reply = replyFor(FA, 'جوابت با قبل فرق داره');
  assert.doesNotMatch(reply, /دارم خودم را تکرار می‌کنم/);
});

test('regression: capability questions are never answered by the darya_self robot facts', () => {
  const reply = replyFor(FA, 'چه چیزهایی بلدی؟');
  assert.match(reply, /گفتگو|آفلاین|محدودیت|نمی‌توانم/i);
  assert.doesNotMatch(reply, /پدر و مادر|تولد/);
});
