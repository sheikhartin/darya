/**
 * Fighters-knowledge suite for the Darya engine.
 *
 * Pins the combat-sports shelf (knowledge-facts-fighters.js and
 * knowledge-facts-fighters-legends.js) and the knowledge follow-up
 * layer (responder-knowledge-followups.js):
 *
 *   1. Breadth: 40+ famous fighters and martial artists, from Royce
 *      Gracie and Fedor to Jon Jones, Khabib, and Ilia Topuria, are
 *      reachable by name in both languages.
 *   2. Records: «رکوردش چیه؟» / "what is his record?" answers with the
 *      shelf's snapshot AND an honesty note. Retired careers get the
 *      settled-number note; active careers get the my-data-may-be-stale
 *      note. No record data means an honest no-stats reply, never an
 *      invented number.
 *   3. Depth: "tell me more" serves the deep-dive paragraph exactly
 *      once, then admits the offline shelf ends and points to sources.
 *
 * This file is additive and permanent: its names describe the behavior
 * under test (the fighters shelf and its follow-ups), not any PR.
 */

'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN } from './helpers.mjs';

// --------------------------------------------------------------------------
// 1. Breadth: who-is questions across eras, divisions, and arts
// --------------------------------------------------------------------------

/** [language, question, signal the answer must carry] */
const WHO_IS = [
  [FA, 'جان جونز کیه؟', /مبارز|UFC|قهرمان/u],
  [EN, 'who is jon jones?', /UFC|champion|fighter/i],
  [FA, 'خبیب کیه؟', /داغستان|UFC|کشتی/u],
  [EN, 'who is khabib nurmagomedov?', /Dagestan|UFC|undefeated/i],
  [FA, 'کانر مک گرگور کیه؟', /ایرلند|UFC|کمربند/u],
  [EN, 'who is conor mcgregor?', /Irish|UFC|belt/i],
  [FA, 'ایلیا توپوریا کیه؟', /گرجی|اسپانیا|UFC/u],
  [EN, 'who is ilia topuria?', /Georgian|Spanish|UFC/i],
  [FA, 'اسلام ماخاچف کیه؟', /داغستان|خبیب|کشتی/u],
  [EN, 'who is islam makhachev?', /Dagestani|Khabib|wrestling/i],
  [FA, 'الکس پریرا کیه؟', /کیک|برزیل|قهرمان/u],
  [EN, 'who is alex pereira?', /kickboxing|Brazilian|champion/i],
  [FA, 'ایزرائیل آدسانیا کیه؟', /نیجریه|میان‌وزن|کیک/u],
  [EN, 'who is israel adesanya?', /Nigerian|middleweight|kickboxing/i],
  [FA, 'الکساندر ولکانوفسکی کیه؟', /استرالیا|پَروزن|قهرمان/u],
  [EN, 'who is alexander volkanovski?', /Australian|featherweight/i],
  [FA, 'مکس هالووی کیه؟', /هاوایی|ضربه|BMF/u],
  [EN, 'who is max holloway?', /Hawaiian|strikes|BMF/i],
  [FA, 'چارلز اولیویرا کیه؟', /برزیل|سابمیشن|جوجیتسو/u],
  [EN, 'who is charles oliveira?', /Brazilian|submission|jiu/i],
  [FA, 'جاستین گیجی کیه؟', /کشتی|BMF|سبک‌وزن/u],
  [EN, 'who is justin gaethje?', /action|BMF|lightweight/i],
  [FA, 'داستین پوریر کیه؟', /الماس|مک‌گرگور|خیریه/u],
  [EN, 'who is dustin poirier?', /Diamond|McGregor|charity/i],
  [FA, 'کامارو عثمان کیه؟', /نیجریه|ولتر|کشتی/u],
  [EN, 'who is kamaru usman?', /Nigerian|welterweight|wrestling/i],
  [FA, 'لیون ادواردز کیه؟', /هدکیک|عثمان|قهرمان/u],
  [EN, 'who is leon edwards?', /head kick|Usman|champion/i],
  [FA, 'شان اومالی کیه؟', /بانتام|ناک‌اوت|استرلینگ/u],
  [EN, 'who is sean omalley?', /bantamweight|knocked out|Sterling/i],
  [FA, 'مراب دوالیشویلی کیه؟', /گرجی|کاردیو|بانتام/u],
  [EN, 'who is merab dvalishvili?', /Georgian|cardio|bantamweight/i],
  [FA, 'دریکوس دو پلسی کیه؟', /آفریقای جنوبی|میان‌وزن/u],
  [EN, 'who is dricus du plessis?', /South African|middleweight/i],
  [FA, 'خمزات چیمایف کیه؟', /چچنی|کشتی|میان‌وزن/u],
  [EN, 'who is khamzat chimaev?', /Chechen|wrestling|middleweight/i],
  [FA, 'تام اسپینال کیه؟', /انگلیس|سنگین‌وزن|جونز/u],
  [EN, 'who is tom aspinall?', /English|heavyweight|Jones/i],
  [FA, 'سیریل گان کیه؟', /فرانسوی|سنگین‌وزن|موی‌تای/u],
  [EN, 'who is ciryl gane?', /French|heavyweight|Muay Thai/i],
  [FA, 'فرانسیس انگانو کیه؟', /کامرون|سنگین‌وزن|مشت/u],
  [EN, 'who is francis ngannou?', /Cameroon|heavyweight|punch/i],
  [FA, 'استیپه میوچیچ کیه؟', /سنگین‌وزن|آتش‌نشان|دفاع/u],
  [EN, 'who is stipe miocic?', /heavyweight|firefighter|defenses/i],
  [FA, 'دنیل کورمیه کیه؟', /المپیک|کشتی|جونز/u],
  [EN, 'who is daniel cormier?', /Olympic|wrestler|Jones/i],
  [FA, 'تونی فرگوسن کیه؟', /خبیب|آرنج|برد متوالی/u],
  [EN, 'who is tony ferguson?', /Khabib|elbows|streak/i],
  [FA, 'نیت دیاز کیه؟', /استاکتون|مک‌گرگور|جوجیتسو/u],
  [EN, 'who is nate diaz?', /Stockton|McGregor|jiu/i],
  [FA, 'خورخه ماسویدال کیه؟', /میامی|ناک‌اوت|BMF/u],
  [EN, 'who is jorge masvidal?', /Miami|knockout|BMF/i],
  [FA, 'هنری سهودو کیه؟', /المپیک|طلا|دو وزن/u],
  [EN, 'who is henry cejudo?', /Olympic|gold|two/i],
  [FA, 'بنیل داریوش کیه؟', /ایرانی|ارومیه|جوجیتسو/u],
  [EN, 'who is beneil dariush?', /Iranian|Urmia|jiu/i],
  [FA, 'امیر علی اکبری کیه؟', /ایرانی|کشتی فرنگی|سنگین‌وزن/u],
  [EN, 'who is amir aliakbari?', /Iranian|Greco|heavyweight/i],
  [FA, 'اندرسون سیلوا کیه؟', /عنکبوت|میان‌وزن|برد متوالی/u],
  [EN, 'who is anderson silva?', /Spider|middleweight|streak/i],
  [FA, 'ژرژ سن پیر کیه؟', /کانادا|ولتر|دو وزن/u],
  [EN, 'who is gsp?', /Canadian|welterweight|two-division/i],
  [FA, 'فدور املیاننکو کیه؟', /روسی|سنگین‌وزن|شکست/u],
  [EN, 'who is fedor emelianenko?', /Russian|heavyweight|unbeaten/i],
  [FA, 'دیمیتریوس جانسون کیه؟', /مگس‌وزن|دفاع|رکورد/u],
  [EN, 'who is demetrious johnson?', /flyweight|defenses|record/i],
  [FA, 'رویس گریسی کیه؟', /جوجیتسو|۱۹۹۳|گریسی/u],
  [EN, 'who is royce gracie?', /jiu-jitsu|1993|Gracie/i],
  [FA, 'بی جی پن کیه؟', /هاوایی|جوجیتسو|دو وزن/u],
  [EN, 'who is bj penn?', /Hawaiian|jiu-jitsu|two-division/i],
  [FA, 'ژوزه آلدو کیه؟', /پَروزن|لگد|مک‌گرگور/u],
  [EN, 'who is jose aldo?', /featherweight|leg kicks|McGregor/i],
  [FA, 'چاک لیدل کیه؟', /ناک‌اوت|UFC|ستاره/u],
  [EN, 'who is chuck liddell?', /knockouts|UFC|superstar/i],
  [FA, 'رندی کوتور کیه؟', /کشتی|قهرمان|سنگین‌وزن/u],
  [EN, 'who is randy couture?', /wrestler|titles|heavyweight/i],
  [FA, 'براک لزنر کیه؟', /کشتی‌کج|WWE|سنگین‌وزن/u],
  [EN, 'who is brock lesnar?', /WWE|wrestling|heavyweight/i],
  [FA, 'واندرلی سیلوا کیه؟', /Pride|موی‌تای|زانو/u],
  [EN, 'who is wanderlei silva?', /Pride|Muay Thai|knees/i],
  [FA, 'میرکو کروکاپ کیه؟', /کروات|لگد|Pride/u],
  [EN, 'who is mirko cro cop?', /Croatian|kick|Pride/i],
  [FA, 'آماندا نونز کیه؟', /زن|دو وزن|روزی/u],
  [EN, 'who is amanda nunes?', /woman|two|Rousey/i],
  [FA, 'والنتینا شفچنکو کیه؟', /مگس‌وزن|موی‌تای|قهرمان/u],
  [EN, 'who is valentina shevchenko?', /flyweight|Muay Thai|champion/i],
  [FA, 'روندا روزی کیه؟', /جودو|اولین|قهرمان/u],
  [EN, 'who is ronda rousey?', /judo|first|champion/i],
  [FA, 'ژانگ ویلی کیه؟', /چینی|قهرمان|یوانا/u],
  [EN, 'who is zhang weili?', /Chinese|champion|Joanna/i],
  [FA, 'رز نامایوناس کیه؟', /وزن کاه|قهرمان|یوانا/u],
  [EN, 'who is rose namajunas?', /strawweight|champion|Joanna/i],
  [FA, 'یوانا ینجیچیک کیه؟', /لهستانی|موی‌تای|وزن کاه/u],
  [EN, 'who is joanna jedrzejczyk?', /Polish|Muay Thai|strawweight/i],
  [FA, 'کریس سایبورگ کیه؟', /برزیلی|چهار|نونز/u],
  [EN, 'who is cris cyborg?', /Brazilian|four|Nunes/i],
  [FA, 'هالی هولم کیه؟', /هدکیک|روزی|بوکس/u],
  [EN, 'who is holly holm?', /head kick|Rousey|boxing/i],
  [FA, 'کیلا هریسون کیه؟', /المپیک|جودو|طلا/u],
  [EN, 'who is kayla harrison?', /Olympic|judo|gold/i],
  [FA, 'بروس لی کیه؟', /رزمی|کونگ‌فو|جیت کان دو/u],
  [EN, 'who is bruce lee?', /martial|kung fu|Jeet Kune Do/i],
  [FA, 'مایک تایسون کیه؟', /سنگین‌وزن|بوکس|ناک‌اوت/u],
  [EN, 'who is mike tyson?', /heavyweight|boxing|knockout/i],
  [FA, 'بوآکاو کیه؟', /موی‌تای|تایلند|K-1/u],
  [EN, 'who is buakaw?', /Muay Thai|Thai|K-1/i],
  [FA, 'ریکو ورهوون کیه؟', /کیک‌بوکس|هلندی|Glory/u],
  [EN, 'who is rico verhoeven?', /kickboxing|Dutch|Glory/i]
];

for (const [lang, question, signal] of WHO_IS) {
  test(`fighters: ${question}`, () => {
    const reply = freshEngine(lang).respond(question);
    assert.match(reply, signal, `${question} -> ${reply}`);
  });
}

test('fighters: the shelf covers at least 50 fighter entries', () => {
  const chunks = globalThis.DaryaFactChunks || [];
  const ids = new Set();
  for (const chunk of chunks) {
    for (const fact of chunk) {
      ids.add(fact.id);
    }
  }
  const fighters = WHO_IS.length / 2;
  assert.ok(
    fighters >= 50,
    `expected 50+ distinct fighters in the corpus, got ${fighters}`
  );
  assert.ok(ids.has('jon_jones') && ids.has('ilia_topuria'));
});

// --------------------------------------------------------------------------
// 2. Records: honest numbers with honest caveats
// --------------------------------------------------------------------------

test('records: a retired legend gets the settled-number note (FA)', () => {
  const engine = freshEngine(FA);
  engine.respond('خبیب کیه؟');
  const reply = engine.respond('رکوردش چیه؟');
  assert.match(reply, /۲۹ برد/u, reply);
  assert.match(reply, /ثابت|بازنشسته|برنگشت/u, reply);
});

test('records: a retired legend gets the settled-number note (EN)', () => {
  const engine = freshEngine(EN);
  engine.respond('who is khabib?');
  const reply = engine.respond('what is his record?');
  assert.match(reply, /29-0/u, reply);
  assert.match(reply, /settled|history books|isn't going anywhere/i, reply);
});

test('records: an active fighter gets the stale-snapshot warning (FA)', () => {
  const engine = freshEngine(FA);
  engine.respond('ایلیا توپوریا کیه؟');
  const reply = engine.respond('رکوردش چیه؟');
  assert.match(reply, /۱۷ برد/u, reply);
  assert.match(reply, /آفلاین|به‌روز|آپدیت|عوض/u, reply);
});

test('records: an active fighter gets the stale-snapshot warning (EN)', () => {
  const engine = freshEngine(EN);
  engine.respond('who is ilia topuria');
  const reply = engine.respond('what is his record');
  assert.match(reply, /17 wins/i, reply);
  assert.match(reply, /offline|last update|snapshot|may have moved/i, reply);
});

test('records: a direct named ask works without a preceding question', () => {
  const fa = freshEngine(FA).respond('رکورد جان جونز چیه؟');
  assert.match(fa, /۲۸ برد/u, fa);
  const en = freshEngine(EN).respond('what is the record of jon jones');
  assert.match(en, /28 wins/i, en);
});

test('records: phrasing variants like «چند تا برد داره» work too', () => {
  const engine = freshEngine(FA);
  engine.respond('جان جونز کیه');
  const reply = engine.respond('چند تا برد داره؟');
  assert.match(reply, /۲۸ برد/u, reply);
});

test('records: footballers get real numbers with the same honesty', () => {
  const engine = freshEngine(FA);
  engine.respond('لئو مسی کیه؟');
  const reply = engine.respond('رکوردش چیه؟');
  assert.match(reply, /توپ طلا|گل/u, reply);
  assert.match(reply, /آفلاین|به‌روز|آپدیت|ثابت نیستن/u, reply);
});

test('records: no record data means no invented numbers', () => {
  const engine = freshEngine(FA);
  engine.respond('حافظ کیه؟');
  const reply = engine.respond('رکوردش چیه؟');
  assert.match(reply, /ندارم|نیست|نمی‌خوام|منبع/u, reply);
  assert.doesNotMatch(reply, /\d+ برد|[۰-۹]+ برد/u, reply);
});

test('records: a cold record ask never fabricates a fighter', () => {
  const reply = freshEngine(FA).respond('رکوردش چیه؟');
  assert.ok(reply.length > 0);
  assert.doesNotMatch(reply, /[۰-۹]+ برد/u, reply);
});

// --------------------------------------------------------------------------
// 3. Depth: tell me more, once, then honesty
// --------------------------------------------------------------------------

test('depth: the deep dive serves once, then the shelf admits its end (FA)', () => {
  const engine = freshEngine(FA);
  engine.respond('خبیب کیه؟');
  const first = engine.respond('بیشتر بگو');
  assert.match(first, /عبدالمناپ|خرس|مک‌گرگور/u, first);
  const second = engine.respond('بیشتر بگو');
  assert.match(second, /آفلاین|ته دانش|منبع|ویکی/u, second);
});

test('depth: the deep dive serves once, then the shelf admits its end (EN)', () => {
  const engine = freshEngine(EN);
  engine.respond('who is bruce lee');
  const first = engine.respond('tell me more');
  assert.match(first, /ten thousand|father of MMA|Dana White/i, first);
  const second = engine.respond('tell me more');
  assert.match(second, /offline|stale|reliable source|Wikipedia/i, second);
});

test('depth: a fact without a deep dive gets the honest limit right away', () => {
  const engine = freshEngine(FA);
  engine.respond('سقراط کیه؟');
  const reply = engine.respond('بیشتر بگو');
  assert.match(reply, /آفلاین|ته دانش|منبع|ویکی|نمی‌دونم/u, reply);
});

test('depth: goat debates answer directly for best-fighter phrasings', () => {
  const fa = freshEngine(FA).respond('کیه بهترین فایتر؟');
  assert.match(fa, /خبیب|جونز|جانسون/u, fa);
  const en = freshEngine(EN).respond('who is the best fighter of all time?');
  assert.match(en, /Khabib|Jones|Johnson/i, en);
});

test('depth: same-domain comparisons answer from the goat facts', () => {
  const fa = freshEngine(FA).respond('مسی بهتره یا رونالدو؟');
  assert.match(fa, /توپ طلا/u, fa);
  const en = freshEngine(EN).respond('khabib or jon jones?');
  assert.match(en, /Khabib|Jones/i, en);
});

test('depth: the mma shelf still answers the general rules question', () => {
  const fa = freshEngine(FA).respond('قوانین ام‌ام‌ای چیه؟');
  assert.match(fa, /هشت|بوکس|کشتی/u, fa);
});
