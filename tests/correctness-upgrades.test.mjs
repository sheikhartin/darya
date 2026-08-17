/**
 * Regression tests for the 2026-08 correctness and intelligence
 * upgrade: the full expression evaluator, single-capital extraction,
 * live-data honesty, media nationality/era filters, location profile
 * memory, mood single-sample summaries, the no-verbatim-question
 * repeat guarantee, the advice bridge, gibberish detection, and the
 * caring unknown pool.
 */

'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, EN, FA } from './helpers.mjs';

// ==========================================================================
// Full expression evaluator: multi-operator math is never answered by
// a fragment.
// ==========================================================================

test('math: multi-operator expressions use correct precedence', () => {
  const cases = [
    ['2+2*3', '= 8'],
    ['10-4/2', '= 8'],
    ['(2+3)*4', '= 20'],
    ['1+2+3+4+5', '= 15'],
    ['-(3+4)*2', '= -14'],
    ['(2+3*(4-1))^2', '= 121'],
    ['what is 2+2*3?', '= 8']
  ];
  for (const [input, expected] of cases) {
    const reply = freshEngine(EN).respond(input);
    assert.ok(
      reply.includes(expected),
      `${input} should contain "${expected}", got: ${reply}`
    );
  }
});

test('math: FA multi-operator expressions answer in Persian digits', () => {
  const reply = freshEngine(FA).respond('۲+۲*۳');
  assert.match(reply, /۸/u, `۲+۲*۳ should equal ۸, got: ${reply}`);
  const paren = freshEngine(FA).respond('(۲+۳)*۴');
  assert.match(paren, /۲۰/u, `(۲+۳)*۴ should equal ۲۰, got: ${paren}`);
});

test('math: expressions embedded in prose are not hijacked', () => {
  const reply = freshEngine(EN).respond('my code returned 2+2*0 somehow');
  assert.doesNotMatch(
    reply,
    /= 2\./,
    `prose with an expression must not be answered as math: ${reply}`
  );
});

test('math: negative square root is answered honestly', () => {
  const reply = freshEngine(EN).respond('sqrt of -4');
  assert.match(reply, /no real square root/i, reply);
  const fa = freshEngine(FA).respond('جذر -۴');
  assert.match(fa, /جذر حقیقی ندارد/u, fa);
});

test('math: single-operator legacy path still works', () => {
  assert.match(freshEngine(EN).respond('2+2'), /2 \+ 2 = 4/);
  assert.match(freshEngine(EN).respond('what is 15% of 80'), /12/);
  assert.match(freshEngine(EN).respond('100/0'), /undefined/i);
});

// ==========================================================================
// Capitals: a specific country gets a one-sentence answer.
// ==========================================================================

test('capitals: a named country gets its single capital', () => {
  const cases = [
    ['what is the capital of France?', /capital of France is Paris/],
    ['capital of japan', /capital of Japan is Tokyo/],
    ['what is the capital of the UK?', /capital of the UK is London/]
  ];
  for (const [input, expected] of cases) {
    const reply = freshEngine(EN).respond(input);
    assert.match(reply, expected, `${input} got: ${reply}`);
  }
});

test('capitals: FA named country gets its single capital', () => {
  const reply = freshEngine(FA).respond('پایتخت فرانسه کجاست');
  assert.match(reply, /پایتخت فرانسه پاریس است/u, reply);
  const jp = freshEngine(FA).respond('پایتخت ژاپن چیه');
  assert.match(jp, /توکیو/u, jp);
});

// ==========================================================================
// Live-data honesty: current prices/weather/news lead with the offline
// limitation, while background questions keep the knowledge shelf.
// ==========================================================================

test('live data: current-price and weather asks get the honest limitation', () => {
  const liveAsks = [
    'what is bitcoin price today?',
    'what is the weather like today?'
  ];
  for (const input of liveAsks) {
    const reply = freshEngine(EN).respond(input);
    assert.match(
      reply,
      /offline|never touch the network/i,
      `${input} should lead with the limitation, got: ${reply}`
    );
  }
});

test('live data: FA current-price and weather asks get the honest limitation', () => {
  for (const input of ['قیمت دلار چنده', 'هوا چطوره امروز؟']) {
    const reply = freshEngine(FA).respond(input);
    assert.match(
      reply,
      /آفلاین|اینترنت وصل نمی‌شوم/u,
      `${input} should lead with the limitation, got: ${reply}`
    );
  }
});

test('live data: background questions still reach the knowledge shelf', () => {
  const reply = freshEngine(EN).respond('what is bitcoin?');
  assert.match(reply, /cryptocurrency|blockchain/i, reply);
  const fa = freshEngine(FA).respond('بیت کوین چیه');
  assert.match(fa, /ارز دیجیتال|بلاکچین|بلاک‌چین/u, fa);
});

// ==========================================================================
// Media: nationality and era filters actually filter.
// ==========================================================================

test('media: persian music ask returns Persian artists', () => {
  const reply = freshEngine(EN).respond('recommend some persian music');
  assert.match(
    reply,
    /Googoosh|Shajarian|Namjoo|Ebi|Dariush|Farhad|Hayedeh|Kalhor|Viguen/,
    `persian music ask returned non-Persian picks: ${reply}`
  );
});

test('media: FA «آهنگ ایرانی» returns Persian artists', () => {
  const reply = freshEngine(FA).respond('یه آهنگ ایرانی معرفی کن');
  assert.match(
    reply,
    /Googoosh|Shajarian|Namjoo|Ebi|Dariush|Farhad|Hayedeh|Kalhor|Viguen/,
    `FA persian music ask returned non-Persian picks: ${reply}`
  );
});

test('media: iranian movie ask returns Iranian cinema', () => {
  for (const [lang, input] of [
    [EN, 'recommend an iranian movie'],
    [FA, 'یه فیلم ایرانی معرفی کن']
  ]) {
    const reply = freshEngine(lang).respond(input);
    assert.match(
      reply,
      /Farhadi|Kiarostami|Majidi|Panahi/,
      `${input} returned non-Iranian picks: ${reply}`
    );
  }
});

test('media: an 80s horror ask returns only 1980s titles', () => {
  const reply = freshEngine(EN).respond('suggest a horror movie from the 80s');
  const years = [...reply.matchAll(/\((\d{4})\)/g)].map((m) => Number(m[1]));
  assert.ok(years.length > 0, `no year-tagged titles in: ${reply}`);
  for (const year of years) {
    assert.ok(
      year >= 1980 && year <= 1989,
      `off-era title (${year}) in an 80s ask: ${reply}`
    );
  }
});

test('media: an impossible era ask gets an honest scoping reply', () => {
  const reply = freshEngine(EN).respond(
    'recommend an ambient music album from the 40s'
  );
  assert.doesNotMatch(
    reply,
    /\((?:19[5-9]\d|20\d\d)\)/,
    `off-era titles served for an impossible era ask: ${reply}`
  );
});

// ==========================================================================
// Profile memory: location disclosure and recall.
// ==========================================================================

test('profile: EN location disclosure is stored and recalled', () => {
  const engine = freshEngine(EN);
  const stored = engine.respond('I live in Tehran');
  assert.match(stored, /Tehran/, stored);
  const recall = engine.respond('where do I live?');
  assert.match(recall, /Tehran/, recall);
});

test('profile: EN location recall without disclosure is honest', () => {
  const reply = freshEngine(EN).respond('where do I live?');
  assert.match(reply, /have not told me|do not know/i, reply);
});

test('profile: EN emotional "i live in fear" is never stored as a city', () => {
  const engine = freshEngine(EN);
  engine.respond('i live in fear');
  assert.equal(engine._userProfile.location, null);
});

test('profile: FA location disclosure is stored and recalled', () => {
  const engine = freshEngine(FA);
  const stored = engine.respond('من تو اصفهان زندگی میکنم');
  assert.match(stored, /اصفهان/u, stored);
  const recall = engine.respond('یادته کجا زندگی میکنم؟');
  assert.match(recall, /اصفهان/u, recall);
});

test('profile: FA «اهل شیرازم» stores the city', () => {
  const engine = freshEngine(FA);
  const stored = engine.respond('اهل شیرازم');
  assert.match(stored, /شیراز/u, stored);
});

test('profile: FA location recall question is never parsed as disclosure', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('یادته کجا زندگی میکنم؟');
  assert.match(reply, /نگفته‌ای|نمی‌دانم/u, reply);
  assert.equal(engine._userProfile.location, null);
});

// ==========================================================================
// Mood: a single sample gets no trend language.
// ==========================================================================

test('mood: single check-in summary has no direction language', () => {
  const engine = freshEngine(EN);
  engine.respond('mood check');
  engine.respond('7');
  const summary = engine.respond('how have I been feeling?');
  // "read back a real direction" (future tense) is fine; a present
  // trend claim (steady/upward/downward) about one sample is not.
  assert.doesNotMatch(
    summary,
    /steady|upward|downward|the direction is/i,
    `n=1 summary used trend language: ${summary}`
  );
  assert.match(summary, /one mood check-in|one check-in/i, summary);
});

test('mood: two check-ins still read back a direction', () => {
  const engine = freshEngine(EN);
  engine.respond('mood check');
  engine.respond('3');
  engine.respond('mood check');
  engine.respond('7');
  const summary = engine.respond('how have I been feeling?');
  assert.match(summary, /upward|downward|steady/i, summary);
});

// ==========================================================================
// Conversation quality: no verbatim question repeats in a session.
// ==========================================================================

test('quality: no question is asked twice verbatim in a session', () => {
  const engine = freshEngine(EN);
  const convo = [
    'I have been really stressed about my job',
    'my boss keeps criticizing everything I do',
    'yesterday he yelled at me in front of everyone',
    'I froze and could not say anything',
    'ok',
    'ok',
    'ok',
    'ok',
    'ok',
    'ok'
  ];
  const askedQuestions = new Set();
  for (const prompt of convo) {
    const reply = engine.respond(prompt);
    if (/[?]/.test(reply)) {
      assert.ok(
        !askedQuestions.has(reply),
        `question repeated verbatim: ${reply}`
      );
      askedQuestions.add(reply);
    }
  }
});

test('quality: sustained topic + "what should I do" gets the advice bridge', () => {
  const engine = freshEngine(EN);
  for (const prompt of [
    'I have been really stressed about my job',
    'my boss keeps criticizing everything I do',
    'yesterday he yelled at me in front of everyone',
    'I froze and could not say anything'
  ]) {
    engine.respond(prompt);
  }
  const reply = engine.respond('what should I do?');
  assert.ok(
    (EN.adviceBridgeResponses || []).includes(reply),
    `expected the advice bridge after a sustained topic, got: ${reply}`
  );
});

test('quality: early "what should I do" keeps the normal reflective pool', () => {
  const engine = freshEngine(EN);
  engine.respond(
    'why does making friends as an adult feel like a job interview'
  );
  const reply = engine.respond('what should I do');
  assert.ok(
    !(EN.adviceBridgeResponses || []).includes(reply),
    `advice bridge fired too early: ${reply}`
  );
});

// ==========================================================================
// Gibberish and the caring unknown pool.
// ==========================================================================

test('quality: keyboard mash is detected as noise', () => {
  const engine = freshEngine(EN);
  assert.equal(engine._isSpamOrNoise('asdkjhaskdjh'), true);
  assert.equal(engine._isSpamOrNoise('sdjkfhskjdfh'), true);
  // Real words with heavy consonant clusters stay valid.
  assert.equal(engine._isSpamOrNoise('strengths'), false);
  assert.equal(engine._isSpamOrNoise('catchphrase'), false);
});

test('quality: heavy unmatched turns get the caring unknown pool', () => {
  // A negative-sentiment statement no rule matches must never get the
  // curiosity fallback ("What makes it interesting to you?").
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'the dark thing from my childhood resurfaced and i feel awful about it'
  );
  assert.doesNotMatch(
    reply,
    /interesting to you/i,
    `heavy unmatched turn got the curiosity fallback: ${reply}`
  );
});

// ==========================================================================
// Exit copy without a safety event stays unchanged.
// ==========================================================================

test('exit: ordinary sessions keep the normal exit copy', () => {
  const engine = freshEngine(EN);
  engine.respond('hello');
  const confirm = engine.respond('goodbye');
  assert.ok(
    (EN.exitConfirmMessages || []).includes(confirm),
    `ordinary exit should use the normal pool, got: ${confirm}`
  );
});
