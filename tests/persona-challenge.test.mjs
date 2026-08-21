/**
 * Persona-challenge suite for the Darya engine.
 *
 * Deliberately hard, messy, sometimes confusing multi-turn scenarios
 * from very different personas: the joker claiming to BE Messi, the
 * teenager who wants to become the next one, the pun-lover with the
 * copper-wire riddle, the rapid-fire MMA fan, the griever who happens
 * to mention a superstar, the troll, the philosopher, and the user who
 * switches topics mid-thought. Each scenario pins the invariants that
 * keep Darya human:
 *
 *   - jokes land as jokes (never stored as facts about the user),
 *   - follow-up chains stay on the last person discussed,
 *   - honesty about the offline snapshot survives every phrasing,
 *   - heavy feelings always beat celebrity trivia,
 *   - and no reply is ever empty, robotic, or fabricated.
 *
 * This file is additive and permanent: its names describe the behavior
 * under test (persona pressure), not any change or PR.
 */

'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN } from './helpers.mjs';

/** Evasive lines that must never answer a turn the engine understands. */
const EVASIVE_FA = /جواب آماده‌ای ندارم|راستش جواب|از دانش من خارج/u;
const EVASIVE_EN = /no ready answer|not familiar|beyond what i know/i;

// ==========================================================================
// 1. The joker: "I AM the legend"
// ==========================================================================

test('persona joker: «من مسی‌ام» gets play, and never becomes the stored name', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('من مسی‌ام');
  assert.match(reply, /مسی/u, reply);
  assert.match(reply, /[!؟?]/u, 'the reply should carry playful energy');
  assert.equal(engine._userProfile.name, null, 'joke must not store a name');
  const recall = engine.respond('اسمم چیه؟');
  assert.doesNotMatch(recall, /اسمت مسی|مسی هستی/u, recall);
});

test('persona joker: "i am messi" in English gets the same treatment', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('i am messi');
  assert.match(reply, /Messi/u, reply);
  assert.equal(engine._userProfile.name, null);
  const recall = engine.respond("what's my name?");
  assert.doesNotMatch(recall, /your name is messi/i, recall);
});

test('persona joker: claiming to be Socrates works for philosophers too', () => {
  const fa = freshEngine(FA).respond('من سقراطم');
  assert.match(fa, /سقراط/u, fa);
  const en = freshEngine(EN).respond("i'm socrates");
  assert.match(en, /Socrates/u, en);
});

test('persona joker: claiming to be Khabib or Tyson lands as play', () => {
  assert.match(freshEngine(FA).respond('من خبیبم'), /خبیب/u);
  assert.match(freshEngine(EN).respond("i'm literally tyson"), /Tyson/u);
});

test('persona joker: repeating the claim still gets fresh, non-empty replies', () => {
  const engine = freshEngine(FA);
  const seen = new Set();
  for (let i = 0; i < 4; i += 1) {
    const reply = engine.respond('من مسی‌ام');
    assert.ok(reply.length > 0, 'a repeated claim must never go silent');
    seen.add(reply);
  }
  assert.ok(seen.size >= 2, 'the claim pool must vary across turns');
});

test('persona joker: a claim buried in a longer sentence is NOT hijacked', () => {
  // «من مسی رو دیدم» is a story, not an identity claim.
  const reply = freshEngine(FA).respond(
    'دیشب خواب دیدم من و مسی تو یه تیم بودیم'
  );
  assert.doesNotMatch(reply, /خود خودِ|چشمم روشن/u, reply);
});

// ==========================================================================
// 2. The dreamer: "I'm the NEXT one"
// ==========================================================================

test('persona dreamer: «من مسی بعدی‌ام» gets encouragement plus a real question', () => {
  const reply = freshEngine(FA).respond('من مسی بعدی‌ام');
  assert.match(reply, /مسی/u, reply);
  assert.match(reply, /\?|؟/u, 'the aspiration deserves a grounded question');
});

test('persona dreamer: "I\'m the next Messi" in English', () => {
  const reply = freshEngine(EN).respond("I'm the next Messi");
  assert.match(reply, /Messi/u, reply);
  assert.match(reply, /\?/u, reply);
});

test('persona dreamer: «من جانشین سقراطم» treats philosophy dreams seriously too', () => {
  const reply = freshEngine(FA).respond('من جانشین سقراطم');
  assert.match(reply, /سقراط/u, reply);
});

test('persona dreamer: "i am the messi of iran" flavors the same intent', () => {
  const reply = freshEngine(EN).respond('i am the messi of iran');
  assert.match(reply, /Messi/u, reply);
});

test('persona dreamer: a 12-year-old dreaming big gets warmth, never mockery', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('من ۱۲ سالمه و می‌خوام مثل مسی بشم');
  assert.ok(reply.length > 20);
  assert.doesNotMatch(reply, /مسخره|بی‌خیال|نمی‌شه/u, reply);
});

// ==========================================================================
// 3. The pun-lover and the comparer
// ==========================================================================

test('persona pun-lover: «مسی بهتره یا سیم مسی؟» lands as the joke it is', () => {
  const reply = freshEngine(FA).respond('مسی بهتره یا سیم مسی؟');
  assert.match(reply, /سیم مسی/u, reply);
  assert.doesNotMatch(reply, /مقایسه‌ی دو گزینه|معنادار می‌شه/u, reply);
});

test('persona pun-lover: "messi or messy?" gets the wordplay back', () => {
  const reply = freshEngine(EN).respond('messi or messy?');
  assert.match(reply, /[Mm]essy/u, reply);
  assert.match(reply, /[Mm]essi/u, reply);
});

test('persona comparer: same-domain GOAT questions get the real debate', () => {
  const fa = freshEngine(FA).respond('مسی بهتره یا رونالدو؟');
  assert.match(fa, /توپ طلا/u, fa);
  assert.match(fa, /؟/u, 'the debate should end handing the mic back');
});

test('persona comparer: cross-domain comparisons get apples-and-oranges play', () => {
  const reply = freshEngine(FA).respond('مسی بهتره یا سقراط؟');
  assert.match(reply, /مسی/u, reply);
  assert.match(reply, /سقراط/u, reply);
});

test('persona comparer: fighters versus fighters resolves to the MMA debate', () => {
  const reply = freshEngine(EN).respond('khabib vs jon jones');
  assert.match(reply, /Khabib|Jones/u, reply);
});

// ==========================================================================
// 4. The rapid-fire fan: chains of follow-ups
// ==========================================================================

test('persona fan: who -> record -> more -> more stays on the same person', () => {
  const engine = freshEngine(FA);
  assert.match(engine.respond('خبیب کیه؟'), /داغستان/u);
  assert.match(engine.respond('رکوردش چیه؟'), /۲۹/u);
  assert.match(engine.respond('بیشتر بگو'), /عبدالمناپ|مک‌گرگور|خرس/u);
  assert.match(engine.respond('بیشتر بگو'), /آفلاین|ته دانش|منبع/u);
});

test('persona fan: the English chain works the same way', () => {
  const engine = freshEngine(EN);
  assert.match(engine.respond('who is khabib?'), /Dagestani/u);
  assert.match(engine.respond('tell me more'), /Abdulmanap|McGregor|bear/i);
  assert.match(engine.respond('what is his record?'), /29-0/u);
});

test('persona fan: switching fighters mid-chain re-anchors the record', () => {
  const engine = freshEngine(FA);
  engine.respond('خبیب کیه؟');
  const reply = engine.respond('رکورد جان جونز چیه؟');
  assert.match(reply, /۲۸/u, 'the named fighter must win over the thread');
});

test('persona fan: «چند تا باخت داره؟» counts as a record ask', () => {
  const engine = freshEngine(FA);
  engine.respond('جان جونز کیه');
  assert.match(engine.respond('چند تا باخت داره؟'), /۱ باخت/u);
});

test('persona fan: an active fighter always comes with the honesty caveat', () => {
  const engine = freshEngine(EN);
  engine.respond('who is islam makhachev?');
  const reply = engine.respond('what is his record');
  assert.match(reply, /offline|update|snapshot|check/i, reply);
});

test('persona fan: the goat question right after a fighter thread still answers', () => {
  const engine = freshEngine(FA);
  engine.respond('توپوریا کیه؟');
  const reply = engine.respond('بهترین مبارز تاریخ کیه؟');
  assert.match(reply, /خبیب|جونز|جانسون/u, reply);
});

// ==========================================================================
// 5. The heavy heart: feelings always beat trivia
// ==========================================================================

test('persona griever: a loss that mentions Messi is grief, not football', () => {
  const reply = freshEngine(FA).respond('داداشم عاشق مسی بود، پارسال فوت کرد');
  assert.doesNotMatch(reply, /توپ طلا|جام جهانی|بارسلونا/u, reply);
  assert.ok(reply.length > 10);
});

test('persona griever: crisis language wins over any celebrity word', () => {
  const reply = freshEngine(FA).respond(
    'مثل مسی معروفم ولی دیگه نمیخوام زندگی کنم'
  );
  assert.match(reply, /۱۲۳|۱۴۸۰|تنها نیستی/u, reply);
});

test('persona griever: a sad fan is met with the feeling, not the shelf', () => {
  const reply = freshEngine(EN).respond(
    'watching khabib retire made me cry, i miss my dad who showed me his fights'
  );
  assert.doesNotMatch(reply, /29-0|lightweight champion/i, reply);
});

// ==========================================================================
// 6. The troll and the skeptic
// ==========================================================================

test('persona troll: «مسی که چیزی بارش نیست» still gets a calm, real reply', () => {
  const reply = freshEngine(FA).respond('مسی که چیزی بارش نیست، نظرت چیه؟');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(reply, EVASIVE_FA, reply);
});

test('persona troll: insulting Darya right after a fighter chat gets the boundary', () => {
  const engine = freshEngine(FA);
  engine.respond('خبیب کیه؟');
  const reply = engine.respond('دریا تو احمق هستی');
  assert.doesNotMatch(reply, /خبیب|رکورد/u, 'no trivia in a boundary turn');
});

test('persona skeptic: doubting the record gets honesty, not defensiveness', () => {
  const engine = freshEngine(FA);
  engine.respond('توپوریا کیه؟');
  engine.respond('رکوردش چیه؟');
  const reply = engine.respond('مطمینی؟ فکر کنم اشتباه می‌گی');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(reply, /مطمئنم صددرصد|قطعا درسته/u, reply);
});

// ==========================================================================
// 7. The confused, the terse, and the topic-hopper
// ==========================================================================

test('persona confused: a cold «رکوردش چیه؟» has no referent and invents none', () => {
  const reply = freshEngine(FA).respond('رکوردش چیه؟');
  assert.ok(reply.length > 0);
  assert.doesNotMatch(reply, /[۰-۹]+ برد/u, reply);
});

test('persona confused: a cold «بیشتر بگو» asks what about, honestly', () => {
  const reply = freshEngine(FA).respond('بیشتر بگو');
  assert.ok(reply.length > 0);
});

test('persona confused: stale threads do not resurrect after many turns', () => {
  const engine = freshEngine(FA);
  engine.respond('خبیب کیه؟');
  engine.respond('امروز حالم خوب نیست');
  engine.respond('کارم خیلی سنگین شده');
  engine.respond('شب‌ها هم خوابم نمی‌بره');
  engine.respond('یه فیلم معرفی کن');
  const reply = engine.respond('بیشتر بگو');
  assert.doesNotMatch(reply, /عبدالمناپ|داغستان/u, reply);
});

test('persona topic-hopper: fighter, feeling, fighter again all track', () => {
  const engine = freshEngine(FA);
  assert.match(engine.respond('بروس لی کیه؟'), /رزمی|کونگ‌فو/u);
  const feeling = engine.respond('راستی امروز خیلی خسته‌ام');
  assert.doesNotMatch(feeling, /کونگ‌فو|جیت کان دو/u, feeling);
  assert.match(engine.respond('مایک تایسون کیه؟'), /بوکس|سنگین‌وزن/u);
});

test('persona terse: «کیه بهترین فایتر؟» answers despite the twisted word order', () => {
  const reply = freshEngine(FA).respond('کیه بهترین فایتر؟');
  assert.match(reply, /خبیب|جونز|جانسون/u, reply);
});

test('persona typo-prone: «ایلیا توپوریا کیه» works with and without؟', () => {
  assert.match(freshEngine(FA).respond('ایلیا توپوریا کیه'), /گرجی|اسپانیا/u);
  assert.match(freshEngine(FA).respond('توپوریا کیه؟!'), /گرجی|اسپانیا/u);
});

test('persona mixed-register: formal question still gets a conversational answer', () => {
  const reply = freshEngine(FA).respond('آیا خبیب بهترین مبارز تاریخ است؟');
  assert.ok(reply.length > 10);
  assert.doesNotMatch(reply, EVASIVE_FA, reply);
});

// ==========================================================================
// 8. The philosopher: serious questions after playful ones
// ==========================================================================

test('persona philosopher: joke claim, then a real Socrates question', () => {
  const engine = freshEngine(FA);
  engine.respond('من سقراطم');
  const reply = engine.respond('حالا جدی، سقراط واقعا کی بود؟');
  assert.match(reply, /فیلسوف|افلاطون|شوکران/u, reply);
});

test('persona philosopher: the depth limit stays honest for thinkers', () => {
  const engine = freshEngine(EN);
  engine.respond('who is aristotle?');
  const reply = engine.respond('tell me more');
  assert.match(reply, /offline|stale|source|Wikipedia/i, reply);
});

test('persona philosopher: «افلاطون بهتره یا ارسطو؟» is answered with respect', () => {
  const reply = freshEngine(FA).respond('افلاطون بهتره یا ارسطو؟');
  assert.match(reply, /افلاطون/u, reply);
  assert.match(reply, /ارسطو/u, reply);
});

// ==========================================================================
// 9. The influencer-curious: people questions keep flowing
// ==========================================================================

test('persona influencer-curious: who -> more works for internet celebrities', () => {
  const engine = freshEngine(FA);
  const who = engine.respond('مستر بیست کیه؟');
  assert.ok(who.length > 20, who);
  const more = engine.respond('بیشتر بگو');
  assert.ok(more.length > 20, more);
  assert.doesNotMatch(more, EVASIVE_FA, more);
});

test('persona influencer-curious: stats of a non-athlete are never invented', () => {
  const engine = freshEngine(EN);
  engine.respond('who is mrbeast?');
  const reply = engine.respond('what are his stats?');
  assert.doesNotMatch(reply, /\d+ wins/i, reply);
});

// ==========================================================================
// 10. Cross-language and session-memory pressure
// ==========================================================================

test('persona bilingual: a Persian chat absorbs an English fighter name', () => {
  const reply = freshEngine(FA).respond(
    'جان جونز کیه؟ همون jon jones رو می‌گم'
  );
  assert.match(reply, /مبارز|UFC|قهرمان/u, reply);
});

test('persona memory: a real name disclosure still works after a joke claim', () => {
  const engine = freshEngine(FA);
  engine.respond('من مسی‌ام');
  engine.respond('شوخی کردم، اسمم آرتینه');
  const recall = engine.respond('اسمم چیه؟');
  assert.match(recall, /آرتین/u, recall);
});

test('persona memory: the fighter thread never leaks into profile recall', () => {
  const engine = freshEngine(FA);
  engine.respond('خبیب کیه؟');
  engine.respond('رکوردش چیه؟');
  const recall = engine.respond('اسمم چیه؟');
  assert.doesNotMatch(recall, /خبیب/u, recall);
});

test('persona memory: safety mode after a fighter chat keeps crisis copy on exit', () => {
  const engine = freshEngine(FA);
  engine.respond('خبیب کیه؟');
  engine.respond('دیگه نمیخوام زندگی کنم');
  const exit = engine.exitConfirmation();
  assert.ok(exit.length > 0);
  assert.doesNotMatch(exit, /رکورد|خبیب/u, exit);
});

// ==========================================================================
// 11. Rapid-fire sanity: many personas, one engine each, no crashes
// ==========================================================================

const RAPID_FIRE = [
  [FA, 'من رونالدوام'],
  [FA, 'من تایسونم'],
  [FA, 'من حافظ زمونه‌ام؟'],
  [FA, 'رکورد مک گرگور چیه؟'],
  [FA, 'رکورد ماخاچف چیه؟'],
  [FA, 'بهترین بوکسور تاریخ کیه؟'],
  [FA, 'کیک‌بوکسینگ با موی‌تای چه فرقی داره؟'],
  [EN, "i'm basically einstein"],
  [EN, "I'm the new Ronaldo"],
  [EN, 'what is the record of conor mcgregor'],
  [EN, 'who is better, socrates or plato?'],
  [EN, 'what are the basic rules of mma?'],
  [EN, 'tyson or ali?']
];

for (const [lang, input] of RAPID_FIRE) {
  test(`persona rapid-fire: "${input}" never crashes or goes silent`, () => {
    const reply = freshEngine(lang).respond(input);
    assert.ok(typeof reply === 'string' && reply.length > 0, input);
    assert.doesNotMatch(reply, lang === FA ? EVASIVE_FA : EVASIVE_EN, reply);
  });
}
