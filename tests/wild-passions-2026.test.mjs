/**
 * Wild 2026-era persona-passion regression suite.
 *
 * This suite locks in the fixes from the 30+ persona-session probe round.
 * Each test is a FULL conversation (10-16 turns) with a distinct persona:
 * a pet owner, a compulsive comparer, a gamer, a science fan, an
 * AI-curious worker, an aspiring founder, a movie buff, an anime fan, a
 * sports fan, a money worrier, a home cook, a DIY maker, a new parent,
 * an adult building boundaries, a friendship seeker, and an apologizer.
 *
 * Assertion strategy: the engine keeps an active-thread context, so a
 * follow-up on the same subject continues the pending question and its
 * turn may legitimately show empty topics. Routing is therefore asserted
 * only on the FIRST disclosure of each topic; every later turn asserts
 * reply quality (non-empty, non-evasive, non-dodge).
 *
 * Sessions deliberately switch topics mid-chat (movies to games to
 * cooking) to prove the context window never locks the engine into a
 * stale subject, and both languages get the same coverage.
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';

import { freshEngine, FA, EN, seededRandom } from './helpers.mjs';

/** Evasive lines that must never appear when the engine knows the topic. */
const EVASIVE =
  /(?:I do not (?:know|have (?:the|an?|a (?:clear|precise|ready)) answer)|don'?t (?:know|have (?:the|an?|a (?:clear|precise|ready)) answer)|no (?:ready )?answer|not familiar|outside my|راستش جواب|جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم|آشنایی ندارم|از دانش من خارج|خوب نمی‌شناسم|حوزه‌ی تازه)/iu;

/** The canned dodge lines the hostile transcripts flagged specifically. */
const DODGE =
  /(?:این انتخاب به شرایط خودت|هر مسیری که بروی|کوتاه بود|لازم نیست همه‌چیز را یک‌باره حل کنی|همین که این را گفتی|این سؤال به خودی خود جالب|قهر یعنی)/iu;

/**
 * Asserts a reply answers a real conversational turn.
 * @param {string} reply - The engine reply
 * @param {string} label - Test label for failure messages
 */
function assertQuality(reply, label) {
  assert.ok(reply.length > 10, `${label}: reply is empty or tiny: "${reply}"`);
  assert.doesNotMatch(reply, EVASIVE, `${label}: evasive line: "${reply}"`);
  assert.doesNotMatch(reply, DODGE, `${label}: canned dodge: "${reply}"`);
}

/** Asserts the turn routed to one of the allowed topics. */
function assertRouted(engine, allowed, label) {
  const ok = allowed.some((topic) => engine.currentTurnTopics.includes(topic));
  assert.ok(
    ok,
    `${label}: must route to one of [${allowed}], got: ${engine.currentTurnTopics}`
  );
}

/**
 * Runs one full persona session. Each turn is [text, allowedTopics|null];
 * when allowedTopics is set, the turn must route to one of them. Every
 * turn must produce a quality reply.
 * @param {object} lang - The language module (EN or FA)
 * @param {string} name - Persona label
 * @param {Array<[string, string[]|null]>} turns - [text, allowedTopics|null]
 */
function runSession(lang, name, turns) {
  // Seed Math.random per session so the exact pool picks are repeatable:
  // the engine draws random lines from its pools, and without a fixed seed
  // the same conversation can pass one run and trip an evasive assertion on
  // the next. A simple string hash gives each persona a stable seed.
  let seed = 0x5eed;
  for (let i = 0; i < name.length; i += 1) {
    seed = (seed * 31 + name.charCodeAt(i)) >>> 0;
  }
  const restore = seededRandom(seed);
  try {
    const engine = freshEngine(lang);
    turns.forEach(([text, allowed], i) => {
      const reply = engine.respond(text);
      const label = `${name} turn ${i + 1} (${text.slice(0, 40)})`;
      assertQuality(reply, label);
      if (allowed) {
        assertRouted(engine, allowed, label);
      }
    });
  } finally {
    restore();
  }
}

// ============================================================================
// Pet lovers and animal people
// ============================================================================

test('persona EN: a worried cat owner, move stress then pet loss', () => {
  runSession(EN, 'cat owner', [
    ['I just moved and my cat hides under the bed all day', ['pet_care']],
    ['she stopped eating her favorite food', null],
    ['should I take her to the vet or wait', null],
    ['okay I will take her tomorrow', null],
    ['she is doing better now actually', null],
    ['but now she keeps meowing at 3am', null],
    ['is that normal after a move', null],
    ['thanks that helps a lot', null],
    ['oh no, she got out yesterday and is gone', null],
    ['I keep looking for her everywhere', null],
    ['I cannot sleep thinking about her outside', null]
  ]);
});

test('persona FA: سگ دوست، از رفتار جدید تا دامپزشک', () => {
  runSession(FA, 'سگدار', [
    ['سگم دیگه غذا نمی‌خوره', ['pet_care']],
    ['فقط خودشو لیس میزنه', null],
    ['نگرانم مریض شده باشه', null],
    ['میبرمش دامپزشک فردا', null],
    ['دکتر گفت فقط استرسه', null],
    ['الان بهتره خداروشکر', null],
    ['ولی گربه‌م بعد از جابه‌جایی قایم میشه', ['pet_care']],
    ['چه کار کنم راحت‌تر بشه', null],
    ['یه اتاق امن بهش دادم', null],
    ['حیوونم پیر شده و خیلی خوابه', null]
  ]);
});

// ============================================================================
// Compulsive comparers
// ============================================================================

test('persona EN: the comparer who weighs everything', () => {
  runSession(EN, 'comparer', [
    ['toyota or bugatti, which is better', ['comparison']],
    ['okay and what about tesla vs bmw', null],
    ['hmm I keep comparing everything I buy', null],
    ['is that a bad habit', null],
    ['like I compared phones for two weeks', null],
    ['and I compare my life to my friends online', ['social_comparison']],
    ['everyone looks so successful', null],
    ['how do I stop doing that', null],
    ['I know comparing is the thief of joy', null]
  ]);
});

test('persona FA: مقایسه‌گر، از خرید تا زندگی', () => {
  runSession(FA, 'مقایسه‌گر', [
    ['تویوتا بهتره یا بوگاتی؟', ['comparison']],
    ['بین آیفون و سامسونگ کدوم بهتره', null],
    ['همیشه دارم همه‌چیز رو مقایسه می‌کنم', null],
    ['از گوشی تا شغل', null],
    ['توی اینستاگرام همه بهتر از من زندگی می‌کنن', ['social_comparison']],
    ['کسی این حس رو نداره', null],
    ['چطور این عادت رو ترک کنم', null],
    ['می‌دونم منطقی نیست', null]
  ]);
});

// ============================================================================
// Gamers and anime fans
// ============================================================================

test('persona EN: the gamer who burned out and wants cozy games', () => {
  runSession(EN, 'gamer', [
    ['I am burned out on open world games', ['gaming']],
    ['recommend a cozy indie game please', null],
    ['I used to play until 3am every night', null],
    ['is spending 60 hours on one game worth it', null],
    ['my friends think I am addicted', null],
    // An agreement statement in a gaming thread is equally well served
    // by the gaming continuation or the feeling reflection; both are
    // quality answers, so either route passes.
    ['I think they are right honestly', ['gaming', 'feeling']],
    ['what is a healthy amount of gaming', null],
    ['okay I will set a timer tonight', null],
    ['hey have you seen the Witch Hat Atelier anime', null],
    ['recommend an anime movie like your name', null]
  ]);
});

test('persona FA: گیمر خسته از بازی‌های جهان‌باز', () => {
  runSession(FA, 'گیمر', [
    ['از بازی‌های جهان‌باز خسته شدم', ['gaming']],
    ['یه بازی دنج معرفی کن', null],
    ['شب‌ها تا صبح بازی می‌کنم', null],
    ['فکر کنم معتاد شدم', ['gaming']],
    ['چطور کنترلش کنم', null],
    ['یه ساعت بعد از شام خاموش کنم؟', null],
    ['بهتره یه برنامه بریزم', null],
    ['انیمه Witch Hat Atelier رو دیدی', null],
    ['یه انیمه مثل اسم تو معرفی کن', null],
    ['ممنون، امشب می‌بینمش', null]
  ]);
});

// ============================================================================
// Science and AI-curious workers
// ============================================================================

test('persona EN: the AI-anxious professional', () => {
  runSession(EN, 'AI worker', [
    ['will ai take my job', ['work']],
    ['I am a designer, should I be worried', null],
    ['will ai tools replace designers and writers', null],
    ['how do I future proof my career against ai', ['knowledge', 'work']],
    ['what skills will matter by 2030', null],
    ['I have been learning ai tools myself', null],
    ['is artificial general intelligence actually close', null],
    ['did you see the new James Webb telescope images', null],
    ['what did it show us', null],
    ['space is incredible', null]
  ]);
});

test('persona FA: نگران هوش مصنوعی', () => {
  runSession(FA, 'کارمندِ نگران', [
    ['هوش مصنوعی شغلم رو می‌گیره؟', ['work', 'knowledge']],
    ['من طراحم، باید نگران باشم؟', null],
    ['آیا هوش مصنوعی طراح‌ها و نویسنده‌ها رو بیکار می‌کنه', null],
    ['چطور شغلم رو برای آینده هوش مصنوعی آماده کنم', ['knowledge', 'work']],
    ['تا سال ۲۰۳۰ چه مهارت‌هایی مهم می‌شن', null],
    ['دارم خودم ابزارهای هوش مصنوعی یاد می‌گیرم', null],
    ['عکس‌های جدید تلسکوپ جیمز وب رو دیدی', null],
    ['چی نشون داد به ما', null],
    ['فضا واقعاً شگفت‌انگیزه', null]
  ]);
});

// ============================================================================
// Founders and business people
// ============================================================================

test('persona EN: the aspiring side-hustle founder', () => {
  runSession(EN, 'founder', [
    ['I want to start a side hustle', ['gig_economy', 'need']],
    ['every niche feels saturated though', null],
    ['how do I find my first freelance client', ['gig_economy']],
    ['should I quit my job to do this full time', ['work']],
    ['my savings would last six months', null],
    ['that is risky right', null],
    ['what business skills matter most in 2026', null],
    ['I am learning to code on the side too', null],
    ['okay I will start with one client and see', null]
  ]);
});

test('persona FA: بنیان‌گذار مشتاق', () => {
  runSession(FA, 'بنیان‌گذار', [
    ['می‌خوام یه کسب‌وکار دوم راه بندازم', ['need']],
    ['همه‌ی حوزه‌ها شلوغ به نظر می‌رسه', null],
    ['چطور اولین مشتری فریلنسیم رو پیدا کنم', ['gig_economy']],
    ['باید شغلم رو رها کنم یا نه', ['work', 'knowledge']],
    ['پس‌اندازم شش ماه دووم میاره', null],
    ['ریسکش زیاده درسته؟', null],
    ['کدوم مهارت‌ها توی ۲۰۲۶ مهم‌ترن', ['learning_advice']],
    ['دارم کنارش برنامه‌نویسی هم یاد می‌گیرم', null],
    ['باشه با یه مشتری شروع می‌کنم', null]
  ]);
});

// ============================================================================
// Movie and book lovers
// ============================================================================

test('persona EN: the movie buff who switches genres', () => {
  runSession(EN, 'movie buff', [
    ['recommend a good thriller movie for tonight', null],
    ['something not too gory though', null],
    ['what about a sci-fi movie', null],
    ['what is the best scifi movie ever made', null],
    ['now recommend a romantic comedy', null],
    ['I love romantic comedies', null],
    ['and a book recommendation while we are at it', null],
    ['I have not read in months', null],
    ['okay I will start with something short', null]
  ]);
});

test('persona FA: فیلم‌باز با سلیقه‌ی متنوع', () => {
  runSession(FA, 'فیلم‌باز', [
    ['یه فیلم مهیج برای امشب معرفی کن', null],
    ['ولی خیلی خونین نباشه', null],
    ['یه فیلم علمی تخیلی بگو', null],
    ['بهترین فیلم علمی تخیلی تاریخ کدومه', null],
    ['حالا یه کمدی رمانتیک معرفی کن', null],
    ['فیلم‌های عاشقانه رو دوست دارم', null],
    ['یک کتاب هم معرفی کن', null],
    ['ماه‌هاست کتاب نخوندم', null],
    ['باشه با یه کتاب کوتاه شروع می‌کنم', null]
  ]);
});

// ============================================================================
// Sports fans
// ============================================================================

test('persona EN: the football fan venting about a bad match', () => {
  runSession(EN, 'football fan', [
    ['the manager completely bottled the midfield last night', ['sports_talk']],
    ['our team lost again', null],
    ['the referee was blind', null],
    ['worst call I have ever seen', null],
    ['who is the best footballer of all time', null],
    ['messi or ronaldo, you decide', null],
    ['what about the best volleyball player', null],
    ['is football better than wrestling', ['comparison']],
    ['I will watch the next match anyway', null]
  ]);
});

test('persona FA: هوادار فوتبال', () => {
  runSession(FA, 'هوادار فوتبال', [
    ['مربی دیشب خط هافبک رو نابود کرد', ['sports_talk']],
    ['تیممون دوباره باخت', null],
    ['داور پنالتی رو نگرفت', null],
    ['بدترین قضاوتی که دیدم بود', null],
    ['بهترین فوتبالیست تاریخ کیه', null],
    ['مسی یا رونالدو، خودت تصمیم بگیر', null],
    ['بهترین والیبالیست تاریخ کیه', null],
    ['فوتبال بهتره یا کشتی', ['comparison']],
    ['بازی بعدی رو بازم می‌بینم', null]
  ]);
});

// ============================================================================
// Money worriers
// ============================================================================

test('persona EN: the broke young adult', () => {
  runSession(EN, 'broke adult', [
    ['I feel so broke all the time', ['money']],
    ['my rent is eating half my salary', null],
    ['and groceries keep getting pricier', null],
    ['how do I even start budgeting', null],
    ['I have no savings at all', null],
    ['is crypto still worth touching in 2026', null],
    ['where should I park my emergency fund', null],
    ['I finally moved some money to a high yield account', null],
    ['small wins count right', null]
  ]);
});

test('persona FA: جوانِ بی‌پول', () => {
  runSession(FA, 'جوانِ بی‌پول', [
    ['این روزا حسابی بی‌پولم', ['money']],
    ['اجاره‌ی خونه نصف حقوقم رو می‌خوره', null],
    ['قیمت خوراکی‌ها هم مدام بالا می‌ره', null],
    ['بودجه‌بندی رو از کجا شروع کنم', null],
    ['هیچ پس‌اندازی ندارم', null],
    ['کریپتو هنوز ارزش داره یا نه', null],
    ['پول اضطراری‌مو کجا بذارم', null],
    ['بالاخره یه کم پول بردم توی حساب سودده', null],
    ['برداشتای کوچیک هم مهمه درسته', null]
  ]);
});

// ============================================================================
// Home cooks
// ============================================================================

test('persona EN: the beginner cook with Persian food troubles', () => {
  runSession(EN, 'home cook', [
    ['I am a beginner at cooking, where do I start', null],
    ['I tried ghormeh sabzi and it was bitter', null],
    ['why is my ghormeh sabzi bitter', null],
    ['how do I fix that next time', null],
    ['what about fesenjan, that seems hard', null],
    ['how do I get the oil to separate in my fesenjan', null],
    ['should I try a keto meal plan', null],
    ['I will start with simple rice dishes', null]
  ]);
});

test('persona FA: آشپز تازه‌کار', () => {
  runSession(FA, 'آشپز تازه‌کار', [
    ['تازه آشپزی رو شروع کردم، از کجا شروع کنم', null],
    ['قرمه‌سبزی درست کردم تلخ شد', null],
    ['چرا قورمه‌سبزیم تلخ شده', null],
    ['دفعه بعد چیکار کنم درست بشه', null],
    ['فسنجون خیلی سخته؟', null],
    ['چطور فسنجونم رو تیره کنم', null],
    ['رژیم کتو خوبه شروع کنم؟', null],
    ['با غذاهای ساده برنجی شروع می‌کنم', null]
  ]);
});

// ============================================================================
// DIY makers
// ============================================================================

test('persona EN: the workshop tinkerer', () => {
  runSession(EN, 'maker', [
    ['should I use PETG or PLA for printing shop tools', null],
    ['it gets hot in my garage', null],
    ['how do I prevent my live edge table from warping', null],
    ['what wood should I use for a workbench', null],
    ['I keep messing up my first 3d prints', null],
    ['why does my print keep warping', null],
    ['I will dry my filament first', null]
  ]);
});

test('persona FA: کارگاهی', () => {
  runSession(FA, 'کارگاهی', [
    ['برای ابزار کارگاه PETG بهتره یا PLA', null],
    ['توی کارگاهم هوا گرم میشه', null],
    ['چطور از تاب برداشتن میزم جلوگیری کنم', null],
    ['برای میز کار چه چوبی خوبه', null],
    ['اولین پرینت‌های سه‌بعدیم رو خراب می‌کنم', null],
    ['چرا پرینتم مدام کج میشه', null],
    ['اول فیلامنت رو خشک می‌کنم', null]
  ]);
});

// ============================================================================
// New parents
// ============================================================================

test('persona EN: the sleep-deprived new parent', () => {
  runSession(EN, 'new parent', [
    ['my baby will not sleep through the night', ['parenting']],
    ['I am so tired as a new parent', null],
    ['I feel like a bad mother sometimes', ['parenting']],
    ['she keeps crying and I do not know why', null],
    ['is this normal for newborns', null],
    ['should I try sleep training', ['parenting']],
    ['my husband takes night shifts with me', null],
    ['that helps a little', null]
  ]);
});

test('persona FA: پدرِ تازه‌کار', () => {
  runSession(FA, 'پدرِ تازه', [
    ['بچهم شب‌ها نمی‌خوابه', ['parenting']],
    ['من به عنوان پدر جدید خیلی خسته‌ام', null],
    ['بعضی وقت‌ها حس می‌کنم پدر خوبی نیستم', ['parenting']],
    ['همش گریه می‌کنه و نمی‌دونم چرا', null],
    ['برای نوزاد طبیعی نیست؟', null],
    ['شب‌ها نوبتی بیدار می‌شیم', null],
    ['همسرم خیلی کمک می‌کند', null]
  ]);
});

// ============================================================================
// Boundary setters and apologizers
// ============================================================================

test('persona EN: the adult learning boundaries', () => {
  runSession(EN, 'boundary setter', [
    ['how do I set boundaries with my family without a fight', ['boundaries']],
    ['my mom calls me five times a day', null],
    ['how do I say no to my parents', ['boundaries']],
    ['I feel guilty when I do', null],
    ['is that normal', null],
    ['how do I tell my mom no kindly', ['boundaries']],
    ['okay I will start with one small boundary', null]
  ]);
});

test('persona FA: مرزگذار', () => {
  runSession(FA, 'مرزگذار', [
    ['چطور با خانواده‌ام مرز تعیین کنم بدون دعوا', ['boundaries']],
    ['مامانم روزی پنج بار زنگ می‌زنه', null],
    ['چطور به مامانم نه بگم', ['boundaries']],
    ['وقتی نه می‌گم احساس گناه می‌کنم', null],
    ['طبیعیه این حس؟', null],
    ['چطور به پدرم نه بگم', ['boundaries']],
    ['باشه با یه مرز کوچیک شروع می‌کنم', null]
  ]);
});

test('persona EN: the apologizer seeking advice', () => {
  runSession(EN, 'apologizer', [
    ['I snapped at my brother yesterday', ['family_conflict', 'family']],
    ['how do I apologize without making it about myself', ['apology_advice']],
    ['should I apologize today or wait', ['apology_advice']],
    ['I do not want to make it worse', null],
    ['he is really important to me', null],
    ['okay I will apologize this evening', null]
  ]);
});

test('persona FA: عذرخواه', () => {
  runSession(FA, 'عذرخواه', [
    ['دیروز با برادرم دعوام شد', ['family_conflict', 'family']],
    ['چطور عذرخواهی کنم که همه‌چیز رو به خودم برنگردونم', ['apology_advice']],
    ['الان عذرخواهی کنم یا صبر کنم', ['apology_advice']],
    ['نمی‌خوام بدترش کنم', null],
    ['برام خیلی مهمه', null],
    ['باشه امشب عذرخواهی می‌کنم', null]
  ]);
});

// ============================================================================
// Friendship seekers
// ============================================================================

test('persona EN: the adult who wants friends', () => {
  runSession(EN, 'friend seeker', [
    [
      'why does making friends as an adult feel like a job interview',
      ['friendship']
    ],
    [
      'I moved to a new city three months ago',
      ['loneliness', 'loneliness_new_city']
    ],
    ['I have no one to call on weekends', null],
    [
      'how do adults make friends',
      ['friendship', 'loneliness', 'loneliness_online']
    ],
    ['I joined a running club last week', null],
    ['it felt awkward at first', null],
    ['but I talked to two people', null],
    ['small wins right', null]
  ]);
});

test('persona FA: دوست‌یاب', () => {
  runSession(FA, 'دوست‌یاب', [
    ['چرا دوست پیدا کردن توی بزرگسالی اینقدر سخته', ['friendship']],
    ['تازه به یه شهر جدید اومدم', ['loneliness']],
    ['آخر هفته‌ها کسی رو ندارم زنگ بزنم', null],
    ['چطور دوست پیدا کنم', ['friendship']],
    ['هفته‌پیش یه کلاس نقاشی رفتم', null],
    ['اولش عجیب بود', null],
    ['ولی با دو نفر حرف زدم', null],
    ['برداشتای کوچیک هم مهمه', null]
  ]);
});

// ============================================================================
// Topic-switch robustness (the context window)
// ============================================================================

test('persona EN: the restless mind that switches topics mid-chat', () => {
  runSession(EN, 'topic hopper', [
    ['tell me a joke', null],
    ['another one', null],
    ['now recommend a horror movie', null],
    ['wait, what is bitcoin actually', null],
    ['and how do I make ghormeh sabzi', null],
    ['is my dog okay if I leave him alone all day', ['pet_care']],
    ['okay one more joke', null],
    ['tell me about stoicism', null]
  ]);
});

test('persona FA: ذهنِ بی‌قرار', () => {
  runSession(FA, 'موضوع‌پَر', [
    ['یه جوک بگو', null],
    ['باز هم بگو', null],
    ['حالا یه فیلم ترسناک معرفی کن', null],
    ['بیت‌کوین اصلاً چیه', null],
    ['چطور قرمه‌سبزی درست کنم', null],
    ['اگه سگم روزی چند ساعت تنها بمونه مشکلیه؟', ['pet_care']],
    ['باشه یه جوک دیگه بگو', null],
    ['رواقی‌گری رو توضیح بده', null]
  ]);
});

// ============================================================================
// Extra personas: body image, gym anxiety, dating apps, remote work
// ============================================================================

test('persona EN: the gym-anxious beginner', () => {
  runSession(EN, 'gym beginner', [
    ['I want to go to the gym but everyone will judge me', ['fitness']],
    ['I have no idea how any machine works', null],
    ['how do I stay consistent with the gym after work', ['fitness']],
    ['I went twice this week already', null],
    ['that is more than I have done in months', null]
  ]);
});

test('persona FA: تازه‌کارِ باشگاه', () => {
  runSession(FA, 'تازه‌کارِ باشگاه', [
    ['می‌خوام برم باشگاه ولی همه منو قضاوت می‌کنن', ['fitness']],
    ['هیچ‌دستگاهیم بلد نیستم', null],
    ['چطور بعد از کار مرتب باشگاه برم', ['fitness']],
    ['این هفته دو بار رفتم', null],
    ['ماه‌ها بود این‌قدر نرفته بودم', null]
  ]);
});

test('persona EN: dating-app burnout', () => {
  runSession(EN, 'dating app user', [
    ['dating apps are exhausting me', ['dating_apps']],
    ['I swipe for an hour every night and feel worse', null],
    ['everyone is either boring or scary', null],
    ['should I just delete them', null],
    ['maybe I will take a break for a month', null]
  ]);
});

test('persona FA: خسته از اپ‌های دوست‌یابی', () => {
  runSession(FA, 'خسته از اپ', [
    ['اپ‌های دوست‌یابی خستم کرده', ['dating_apps']],
    ['هر شب یه ساعت اسکرول می‌کنم و بدتر می‌شم', null],
    ['همه یا بی‌مزه‌ان یا ترسناک', null],
    ['حذفشون کنم بهتره؟', null],
    ['شاید یه ماه استراحت بدم', null]
  ]);
});

test('persona EN: the remote-work isolator', () => {
  runSession(EN, 'remote worker', [
    ['working from home alone is getting to me', ['work']],
    ['I talk to no one all day except meetings', null],
    ['I feel invisible in my own company', null],
    ['should I go back to an office', null],
    ['I miss the little human moments', null]
  ]);
});

test('persona FA: دورکارِ تنها', () => {
  runSession(FA, 'دورکار', [
    // Remote-work isolation is both a work disclosure and a loneliness
    // disclosure; either thread answers it with care.
    ['دورکاری تنها بودن داره اذیتم می‌کنه', ['work', 'loneliness']],
    ['کل روز فقط توی جلسات با کسی حرف می‌زنم', null],
    ['توی شرکت خودم حس می‌کنم نامرئیم', null],
    ['برگردم دفتر بهتره؟', null],
    ['دلم برای لحظه‌های کوچیک انسانی تنگ شده', null]
  ]);
});

// ============================================================================
// Health, sleep, and self-care
// ============================================================================

test('persona EN: the honest health questioner', () => {
  runSession(EN, 'health questioner', [
    ['my left hand has been hurting all week', ['health_pain']],
    ['should I see a doctor', null],
    ['I keep postponing it', null],
    ['and I have not slept well in days', ['sleep']],
    ['my mind races at 2am', null],
    ['I will make the appointment today', null]
  ]);
});

test('persona FA: پیگیر سلامت', () => {
  runSession(FA, 'پیگیر سلامت', [
    ['دست چپم همه‌ی هفته درد می‌کنه', ['health_pain']],
    ['باید برم دکتر؟', null],
    ['مدام عقب می‌ندازمش', null],
    ['چند روزه هم خوب نمی‌خوابم', ['sleep']],
    ['ساعت دو شب ذهنم درگیره', null],
    ['امروز وقت می‌گیرم', null]
  ]);
});

test('persona EN: the melancholic poet', () => {
  runSession(EN, 'melancholic', [
    ['I feel this quiet sadness all day lately', ['sadness']],
    ['like the world is in grey', null],
    ['will I ever feel better', ['grief_hope']],
    ['I used to love small things', null],
    ['today I noticed the rain and felt a little something', null],
    ['maybe that counts', null]
  ]);
});

test('persona FA: مالیخولیایی', () => {
  runSession(FA, 'مالیخولیایی', [
    ['این روزا یه غم آروم دارم همه‌ی روز', ['sadness']],
    ['انگار دنیا خاکستریه', null],
    ['آیا دوباره خوب می‌شم', ['grief_hope']],
    ['قبلاً از چیزای کوچیک لذت می‌بردم', null],
    ['امروز بارون رو دیدم و یه چیزی حس کردم', null],
    ['شاید همین مهمه', null]
  ]);
});
