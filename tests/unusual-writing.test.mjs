/**
 * Unusual-writing suite for the Darya engine.
 *
 * People do not type like style guides: they separate thoughts with
 * dashes instead of periods («سلام - چهطوری؟»), stretch words with
 * tatweel («سلامــــ»), stack punctuation («خوبی؟؟؟!!!»), decorate
 * with tildes and asterisks, SHOUT IN CAPS, glue words to dots and
 * dashes, and spell everyday words in every variant («چهطوری»,
 * «چه طوری», «چجوری»). This suite pins that every such register still
 * reaches the right rule or shelf, and that the dash-normalization
 * never breaks the things that legitimately NEED a dash: negative
 * numbers, subtraction, and hyphenated safety-critical English
 * ("self-harm").
 *
 * This file is additive and permanent: its names describe the behavior
 * under test (unusually written input), not any change or PR.
 */

'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN } from './helpers.mjs';

/** The greeting/how-are-you family of signals in each language. */
const FA_WARM = /خوبم|حالم خوبه|حس خوبی|ممنون که پرسیدی|سلام|درود/u;
const EN_WARM = /i'?m (?:good|well|doing well)|thank(?:s| you) for asking/iu;

/** Fallback lines that mean the register was NOT understood. */
const FA_LOST =
  /کوتاه بود|کمی بیشتر توضیح بده|جای خوبی برای مکثه|مرجع حرفت|هدف دقیقش روشن نیست/u;

/**
 * Asserts one message reaches a warm greeting-family reply instead of
 * a lost-in-translation fallback.
 */
function assertWarm(lang, input) {
  const reply = freshEngine(lang).respond(input);
  assert.match(reply, lang === FA ? FA_WARM : EN_WARM, `${input} -> ${reply}`);
  if (lang === FA) {
    assert.doesNotMatch(reply, FA_LOST, `${input} -> ${reply}`);
  }
  return reply;
}

// ==========================================================================
// 1. Dashes instead of punctuation
// ==========================================================================

test('unusual: «سلام - چهطوری؟» reads as a greeting, not a puzzle', () => {
  assertWarm(FA, 'سلام - چهطوری؟');
});

test('unusual: «سلام-خوبی» with a glued dash still greets', () => {
  assertWarm(FA, 'سلام-خوبی');
});

test('unusual: «سلام - - خوبی؟» with stray dashes still greets', () => {
  assertWarm(FA, 'سلام - - خوبی؟');
});

test('unusual: «سلام. - . خوبی» with mixed dot-dash debris still greets', () => {
  assertWarm(FA, 'سلام. - . خوبی');
});

test('unusual: "hi - how are you?" works in English too', () => {
  assertWarm(EN, 'hi - how are you?');
});

test('unusual: a dash-separated knowledge ask still reaches the shelf', () => {
  const reply = freshEngine(FA).respond('خبیب کیه - بگو');
  assert.match(reply, /داغستان|UFC/u, reply);
});

test('unusual: "who is khabib -- tell me" with a double dash', () => {
  const reply = freshEngine(EN).respond('who is khabib -- tell me');
  assert.match(reply, /Dagestani|UFC/u, reply);
});

test('unusual: «مسی-بهتره-یا-رونالدو؟» fully dash-glued still debates', () => {
  const reply = freshEngine(FA).respond('مسی-بهتره-یا-رونالدو؟');
  assert.match(reply, /توپ طلا/u, reply);
});

test('unusual: «می خوام بدونم -- مسی کیه» reaches the Messi fact', () => {
  const reply = freshEngine(FA).respond('می خوام بدونم -- مسی کیه');
  assert.match(reply, /آرژانتین|بارسلونا/u, reply);
});

test('unusual: an em dash and an en dash behave like the hyphen', () => {
  assertWarm(FA, 'سلام — چهطوری؟');
  assertWarm(FA, 'سلام – خوبی؟');
});

// ==========================================================================
// 2. Dash-preservation: things that genuinely need the dash
// ==========================================================================

test('unusual: «۵-۳ چند میشه؟» still computes subtraction', () => {
  assert.match(freshEngine(FA).respond('۵-۳ چند میشه؟'), /۲/u);
});

test('unusual: "what is 5-3?" still computes in English', () => {
  assert.match(freshEngine(EN).respond('what is 5-3?'), /= 2/u);
});

test('unusual: "absolute value of -12" keeps its negative sign', () => {
  assert.match(freshEngine(EN).respond('absolute value of -12'), /\b12\b/u);
});

test('unusual: hyphenated safety language still triggers protection', () => {
  const reply = freshEngine(EN).respond('i keep thinking about self-harm');
  assert.match(reply, /988|116 123|not alone|aren't alone/iu, reply);
});

test('unusual: hyphenated compounds still reach their rules', () => {
  // "post-partum" carries the new-parent exhaustion rule.
  const reply = freshEngine(EN).respond(
    'the post-partum exhaustion is crushing me'
  );
  assert.ok(reply.length > 20, reply);
  assert.doesNotMatch(reply, /no ready answer|not familiar/iu, reply);
});

// ==========================================================================
// 3. Stretched and decorated words
// ==========================================================================

test('unusual: tatweel stretching «سلامــــ خوبی؟» is flattened', () => {
  assertWarm(FA, 'سلامــــ خوبی؟');
});

test('unusual: «~سلام~» and «*سلام*» greet through the decorations', () => {
  for (const input of ['~سلام~', '*سلام*']) {
    const reply = freshEngine(FA).respond(input);
    assert.match(reply, /سلام|درود/u, `${input} -> ${reply}`);
  }
});

test('unusual: «((سلام))» and «>>سلام<<» greet through the brackets', () => {
  for (const input of ['((سلام))', '>>سلام<<']) {
    const reply = freshEngine(FA).respond(input);
    assert.match(reply, /سلام|درود/u, `${input} -> ${reply}`);
  }
});

test('unusual: quoted «سلام» plus a question still answers the question', () => {
  assertWarm(FA, '«سلام» خوبی؟');
});

// ==========================================================================
// 4. Stacked and mixed punctuation
// ==========================================================================

test('unusual: «خوبی؟؟؟!!!» with stacked marks still greets', () => {
  assertWarm(FA, 'خوبی؟؟؟!!!');
});

test('unusual: «مسی کیه????» with Latin question marks answers the fact', () => {
  const reply = freshEngine(FA).respond('مسی کیه????');
  assert.match(reply, /آرژانتین|بارسلونا/u, reply);
});

test('unusual: «سلام،،، خوبی!!!» with stacked commas still greets', () => {
  assertWarm(FA, 'سلام،،، خوبی!!!');
});

test('unusual: ellipses «سلام ... خوبی؟» and the … character both work', () => {
  assertWarm(FA, 'سلام ... خوبی؟');
  assertWarm(FA, 'سلام… خوبی؟');
});

test('unusual: "hi...how are you" with glued dots still greets', () => {
  assertWarm(EN, 'hi...how are you');
});

test('unusual: "hi,,,how r u" with comma debris and shorthand', () => {
  assertWarm(EN, 'hi,,,how r u');
});

test('unusual: mixed ؟ and ? in one message never confuses the rule', () => {
  const reply = freshEngine(FA).respond('خبیب کیه?؟');
  assert.match(reply, /داغستان|UFC/u, reply);
});

// ==========================================================================
// 5. Spacing chaos
// ==========================================================================

test('unusual: leading, trailing, and doubled spaces are invisible', () => {
  assertWarm(FA, '   سلام    خوبی   ');
});

test('unusual: «سلام.خوبی؟» glued to a dot still greets', () => {
  assertWarm(FA, 'سلام.خوبی؟');
});

test('unusual: «سلام_خوبی؟» glued with an underscore still greets', () => {
  assertWarm(FA, 'سلام_خوبی؟');
});

test('unusual: «سلام / خوبی؟» and «سلام ؛ خوبی» slash and semicolon', () => {
  assertWarm(FA, 'سلام / خوبی؟');
  assertWarm(FA, 'سلام ؛ خوبی');
});

test('unusual: tabs and newlines inside a message are separators', () => {
  assertWarm(FA, 'سلام\tخوبی؟');
  assertWarm(FA, 'سلام\nچه خبر؟');
});

// ==========================================================================
// 6. Case and register chaos (English)
// ==========================================================================

test('unusual: ALL CAPS "HI HOW ARE YOU" still greets calmly', () => {
  assertWarm(EN, 'HI HOW ARE YOU');
});

test('unusual: RaNsOm-CaSe "wHo Is MeSsI?" answers the fact', () => {
  const reply = freshEngine(EN).respond('wHo Is MeSsI?');
  assert.match(reply, /Argentine|Barcelona/iu, reply);
});

test('unusual: "WHAT IS 2+2*3" shouts and still gets 8', () => {
  assert.match(freshEngine(EN).respond('WHAT IS 2+2*3?'), /= 8/u);
});

// ==========================================================================
// 7. Spelling variants people actually type
// ==========================================================================

test('unusual: «چهطوری» the joined spelling variant greets', () => {
  assertWarm(FA, 'چهطوری');
});

test('unusual: «چه طوری؟» the spaced spelling variant greets', () => {
  assertWarm(FA, 'چه طوری؟');
});

test('unusual: «چجوری؟» the colloquial contraction greets', () => {
  assertWarm(FA, 'چجوری؟');
});

test('unusual: «چه‌طوری» with a half-space greets too', () => {
  assertWarm(FA, 'چه\u200cطوری');
});

// ==========================================================================
// 8. Odd shapes around the knowledge and math layers
// ==========================================================================

test('unusual: «فاکتوریل ۵ - چند میشه» dash inside a math ask computes', () => {
  assert.match(freshEngine(FA).respond('فاکتوریل ۵ - چند میشه'), /۱۲۰/u);
});

test('unusual: «رکوردش چیه - راستشو بگو» follow-up with a dash aside', () => {
  const engine = freshEngine(FA);
  engine.respond('جان جونز کیه');
  const reply = engine.respond('رکوردش چیه - راستشو بگو');
  assert.match(reply, /۲۸ برد/u, reply);
});

test('unusual: «بیشتر بگو -» a trailing dash never breaks the deep dive', () => {
  const engine = freshEngine(FA);
  engine.respond('خبیب کیه؟');
  const reply = engine.respond('بازم بگو -');
  assert.ok(reply.length > 20, reply);
  assert.doesNotMatch(reply, FA_LOST, reply);
});

test('unusual: a dash-riddled crisis message still gets the hotlines', () => {
  const reply = freshEngine(FA).respond('دیگه - نمیخوام - زندگی کنم');
  assert.match(reply, /۱۲۳|۱۴۸۰/u, reply);
});

test('unusual: decorations never leak back into the reply', () => {
  const reply = freshEngine(FA).respond('~*~سلام~*~');
  assert.doesNotMatch(reply, /[~*]/u, reply);
});

test('unusual: a lone dash is treated as an empty-ish message, not a crash', () => {
  const reply = freshEngine(FA).respond('-');
  assert.ok(typeof reply === 'string' && reply.length > 0);
});

test('unusual: dash-separated multi-thoughts keep the real question alive', () => {
  // A dash-joined aside plus a question («یه سوال - مسی کیه؟») must
  // answer the question, never stall on the aside.
  const reply = freshEngine(FA).respond('یه سوال - مسی کیه؟');
  assert.match(reply, /آرژانتین|بارسلونا/u, reply);
  const musing = freshEngine(FA).respond('داشتم فکر می‌کردم - راستی مسی کیه؟');
  assert.match(musing, /آرژانتین|بارسلونا/u, musing);
});
