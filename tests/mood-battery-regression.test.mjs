/**
 * Regression tests for the warm-mood conversation battery (2026-08).
 *
 * The battery simulated 71 warm, moody, multi-turn conversations
 * (38 Persian, 33 English) through the rule engine and compared every
 * reply against how a natural native speaker would answer. Each test
 * here pins one class of failure that the battery surfaced: greeting
 * false drops, emotion misclassification, exit false positives,
 * longing misread as loneliness, opinion questions answered with a
 * source pointer, meal-planning cooking getting the troubleshooting
 * pool, and the new warm topic families (bored day, movie mood,
 * first date, topic setup, casual endearment, longing) in both
 * languages.
 *
 * Inputs are deliberately colloquial and noisy, the way real users
 * type, including the half-space and ZWNJ spellings the normalizer
 * must reconcile.
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  freshEngine,
  FA,
  EN,
  normalizeForMatching,
  seededRandom
} from './helpers.mjs';

/** Evasive lines that must never appear when the engine knows the topic. */
const EVASIVE =
  /(?:I do(?: not|n'?t) (?:know|have)|no (?:ready )?answer|not familiar|outside my|راستش جواب|جواب روشن|همین حالا (?:نمی‌دانم|نمی‌دونم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم|آشنایی ندارم|از دانش من خارج|خوب نمی‌شناسم)/iu;

/** The EN stopword guard that the name statement must never store. */
const NAME_STOPWORDS =
  /^(?:and|or|but|then|we|you|they|he|she|it|the|a|an|was|were|is|are|had|have|has|said|who|that|which|when|where|why|so)$/i;

/** Extracts the first list title from a numbered media reply. */
function firstTitle(reply) {
  const match = String(reply).match(/^[\d۰-۹۱-۹]+\.\s*([^(]+)/u);
  return match ? match[1].trim() : null;
}

test('FA: the "be to" greeting opens the how-are-you thread, not a fallback', () => {
  // «درود بهت! چطوری؟» used to fall to the question-acknowledgement or
  // source-suggestion pool because the vocative tail «بهت» was not in
  // the how-are-you pattern. The reported nonsense reply.
  const howAreYou = [
    'درود بهت! چطوری؟',
    'درود به تو چطوری؟',
    'سلام بهت چطوری',
    'درود به شما چطورید؟'
  ];
  for (const line of howAreYou) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
    assert.ok(
      engine.currentTurnTopics.includes('smalltalk_howareyou'),
      `${line}: must be a how-are-you check-in, got: ${engine.currentTurnTopics.join(',')} -> "${reply}"`
    );
  }
  // A greeting without the check-in stays a greeting.
  for (const line of ['درود بهت', 'درود به شما']) {
    const engine = freshEngine(FA);
    engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('greeting'),
      `${line}: must be a greeting, got: ${engine.currentTurnTopics.join(',')}`
    );
  }
  // A single name word between the greeting and the check-in is
  // swallowed by the name slot, so «سلام داریوش! احوالت چطوره؟» is a
  // how-are-you, not an unknown topic.
  const engine = freshEngine(FA);
  const reply = engine.respond('سلام داریوش! احوالت چطوره؟');
  assert.ok(
    engine.currentTurnTopics.includes('smalltalk_howareyou'),
    `named how-are-you: got ${engine.currentTurnTopics.join(',')}`
  );
  assert.doesNotMatch(reply, EVASIVE, `named how-are-you evasive: "${reply}"`);
});

test('EN: missing a place, fear, and grief classify correctly', () => {
  // «miss» used to count as grieving, sending «I miss a life away from
  // this city» into the bereavement pool; bare «fear» fell to neutral.
  const cases = [
    ['I miss a life away from this city', 'neutral'],
    ['Fear is my biggest obstacle', 'fear'],
    ['My mother passed away', 'grieving'],
    ['I am grieving for him', 'grieving'],
    // Sanity: the physical-fear phrasing stays anxious, not fear.
    ['I am scared of dogs', 'anxious']
  ];
  for (const [text, expected] of cases) {
    const engine = freshEngine(EN);
    const emotion = engine._computePrimaryEmotion(
      normalizeForMatching(text, EN)
    );
    assert.equal(emotion, expected, `"${text}" classified ${emotion}`);
  }
});

test('EN: real farewells exit; hedged quits and errands do not', () => {
  // The bare «quit» keyword hijacked habit and career sentences; the new
  // split-tile «got to run» keywords hijacked errand sentences. Only the
  // un-hedged farewell forms may trigger the two-step exit flow.
  const exits = [
    'I want to quit',
    'I quit',
    'goodbye',
    'i got to run',
    'gotta run',
    'gotta go',
    'I gotta go now',
    'I have to go now',
    'got to run, bye',
    'see you later',
    'take care',
    'take care of yourself'
  ];
  for (const text of exits) {
    assert.equal(
      freshEngine(EN).isExitCommand(text),
      true,
      `"${text}" must exit`
    );
  }
  const stays = [
    'I want to quit smoking',
    'I am thinking of quitting my job',
    'I should quit',
    'I am going to quit my job',
    'I might quit my job',
    'I am about to quit',
    'I am wondering if I should quit',
    'quit working here',
    'I take care of my mother',
    'I got to run late',
    'I got to run errands today',
    'gotta run to the store',
    'gotta go to the store',
    'I have to go to work',
    'I need to go to the doctor',
    'I said goodbye to my friend today'
  ];
  for (const text of stays) {
    assert.equal(
      freshEngine(EN).isExitCommand(text),
      false,
      `"${text}" must not exit`
    );
  }
});

test('FA: longing is wistfulness, not the loneliness essay', () => {
  // «دلم ... تنگ» used to hit the loneliness counseling pool because
  // the loneliness pattern carried the longing forms.
  for (const line of [
    'دلم برای یه زندگی دور از این شهر تنگ شده',
    'دلتنگ مادرمم',
    'دلم برات تنگ شده'
  ]) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('longing'),
      `${line}: must be longing, got: ${engine.currentTurnTopics.join(',')}`
    );
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
  }
  // True isolation stays with the loneliness thread.
  const engine = freshEngine(FA);
  engine.respond('تنهام و کسی نمی‌فهمه منو');
  assert.ok(
    engine.currentTurnTopics.includes('loneliness'),
    `isolation must stay loneliness, got: ${engine.currentTurnTopics.join(',')}`
  );
});

test('EN: the longing twin routes misses of places and periods', () => {
  for (const line of [
    'I miss those days',
    'I really miss home',
    'I have been missing the old days'
  ]) {
    const engine = freshEngine(EN);
    engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('longing'),
      `${line}: must be longing, got: ${engine.currentTurnTopics.join(',')}`
    );
  }
});

test('FA: the "sar o kar" idiom is not a work disclosure', () => {
  // «کجا باهاش سر و کار داریم؟» (where do we get involved with him?)
  // used to open the work-stress thread on the bare «کار» marker.
  const engine = freshEngine(FA);
  engine.respond('کجا باهاش سر و کار داریم؟');
  assert.ok(
    !engine.currentTurnTopics.includes('work'),
    `idiom must not be work, got: ${engine.currentTurnTopics.join(',')}`
  );
  // A real first-person work disclosure still opens the work thread.
  const workEngine = freshEngine(FA);
  workEngine.respond('امروز سر کارم خیلی خسته شدم');
  assert.ok(
    workEngine.currentTurnTopics.includes('work'),
    `real work disclosure must route work, got: ${workEngine.currentTurnTopics.join(',')}`
  );
});

test('FA and EN: meal-planning questions open the cooking thread', () => {
  const faCases = ['امشب شام چی بپزم؟', 'چه غذایی بپزم؟'];
  for (const line of faCases) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('cooking'),
      `${line}: must be cooking, got: ${engine.currentTurnTopics.join(',')}`
    );
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
  }
  const enCases = [
    'what should I make for dinner?',
    'what can I cook tonight?',
    'what should I make for breakfast'
  ];
  for (const line of enCases) {
    const engine = freshEngine(EN);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('cooking'),
      `${line}: must be cooking, got: ${engine.currentTurnTopics.join(',')}`
    );
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
  }
});

test('EN: the shared breathing request is met with the exercise invite', () => {
  for (const line of [
    'Can we breathe together for a bit?',
    "Let's do a breathing exercise",
    'can we do a breathing exercise together?'
  ]) {
    const engine = freshEngine(EN);
    const reply = engine.respond(line);
    assert.match(
      reply,
      /breathing|breathe/i,
      `${line}: must offer the exercise: "${reply}"`
    );
  }
});

test('FA: the endearment-wrapped stress request still gets the exercise', () => {
  // «قربونت برم، استرسمو یه کم پایین بیار» mixes the casual
  // endearment with a stress-lowering request; the exercise invite must
  // win over a bare endearment thank-you.
  const engine = freshEngine(FA);
  const reply = engine.respond('قربونت برم، استرسمو یه کم پایین بیار');
  assert.match(
    reply,
    /تنفس|تمرین/,
    `must offer the breathing exercise: "${reply}"`
  );
});

test('EN: the "do you feel things" self question stays on darya_self', () => {
  for (const line of [
    'do you actually feel things?',
    'are you just performing?'
  ]) {
    const engine = freshEngine(EN);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('darya_self'),
      `${line}: must be darya_self, got: ${engine.currentTurnTopics.join(',')}`
    );
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
  }
});

test('EN: a name statement needs the copula; "called and" stores nothing', () => {
  // «my mom called and we argued» used to store the name "and" and
  // answer with the broken «Got it, your mom is named and.»
  const engine = freshEngine(EN);
  const reply = engine.respond('my mom called and we argued all night');
  const values = [...engine._lifeFacts.values()].map((f) => f.value);
  assert.ok(
    values.every((value) => !NAME_STOPWORDS.test(value)),
    `no stopword may be stored as a name, stored: ${JSON.stringify(values)}`
  );
  assert.doesNotMatch(
    reply,
    /named (?:and|or|but|the|a)\b/i,
    `broken name acknowledgment: "${reply}"`
  );
  // The copula form still stores and recalls.
  const dog = freshEngine(EN);
  dog.respond('my dog is named Rex');
  assert.equal(
    dog._lifeFacts.get('name:dog')?.value,
    'Rex',
    'copula name statement must store the name'
  );
});

test('FA: the extended achievement forms are celebrations', () => {
  const lines = [
    'آفر شغلی گرفتم',
    'بالاخره پروژه رو فرستادم',
    'نوه شدم',
    'خواهرم بچه شد',
    'ارائه شغلی رو گرفتم'
  ];
  for (const line of lines) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('achievement'),
      `${line}: must be achievement, got: ${engine.currentTurnTopics.join(',')}`
    );
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
  }
  // The negation guard: a failed promotion is not a celebration.
  const guard = freshEngine(FA);
  guard.respond('ترفیع نگرفتم');
  assert.ok(
    !guard.currentTurnTopics.includes('achievement'),
    `negated achievement must not celebrate, got: ${guard.currentTurnTopics.join(',')}`
  );
});

test('FA and EN: "a different one" after a media list serves fresh titles', () => {
  // The follow-up used to repeat the same shelf; the per-category
  // excluded-titles state must serve titles the user has not seen.
  const runs = [
    [FA, 'یه فیلم خوب پیشنهاد بده', 'میشه یه تای دیگه؟'],
    [EN, 'suggest a good movie', 'Can you give me a different one?']
  ];
  for (const [lang, first, second] of runs) {
    const restore = seededRandom(7);
    try {
      const engine = freshEngine(lang);
      const firstReply = engine.respond(first);
      const secondReply = engine.respond(second);
      assert.doesNotMatch(
        firstReply,
        EVASIVE,
        `${first}: evasive: "${firstReply}"`
      );
      assert.doesNotMatch(
        secondReply,
        EVASIVE,
        `${second}: evasive: "${secondReply}"`
      );
      assert.notEqual(
        secondReply,
        firstReply,
        `${second}: repeated the same list`
      );
      const titleOne = firstTitle(firstReply);
      const titleTwo = firstTitle(secondReply);
      assert.ok(titleOne, `first reply must be a titled list: "${firstReply}"`);
      assert.ok(
        titleTwo,
        `second reply must be a titled list: "${secondReply}"`
      );
      assert.notEqual(
        titleTwo,
        titleOne,
        `second list must open with a fresh title: ${titleTwo}`
      );
    } finally {
      restore();
    }
  }
});

test('FA and EN: opinion questions get the opinion pool, not a source pointer', () => {
  // «به نظرت ...» used to answer with the Wikipedia/YouTube
  // source-suggestion line; the opinion pool holds the question open
  // instead. The EN pool lines must never contain a question mark
  // (quality invariant).
  // Replies pass through the conversational-register layer, so compare
  // the reply against the pool lines with the same transform applied.
  const faEngine = freshEngine(FA);
  const faReply = faEngine.respond('به نظرت زندگی اصلا معنی داره؟');
  const faPool = FA.opinionResponses.map((line) =>
    faEngine._conversational(line)
  );
  assert.ok(
    faPool.includes(faReply),
    `FA opinion reply must come from the opinion pool: "${faReply}"`
  );
  const enEngine = freshEngine(EN);
  const enReply = enEngine.respond('what do you think about this?');
  const enPool = EN.opinionResponses.map((line) =>
    enEngine._conversational(line)
  );
  assert.ok(
    enPool.includes(enReply),
    `EN opinion reply must come from the opinion pool: "${enReply}"`
  );
  assert.doesNotMatch(
    enReply,
    /[?]/u,
    `EN opinion line carries "?": "${enReply}"`
  );
  const enEngine2 = freshEngine(EN);
  const enReply2 = enEngine2.respond('do you think humans are basically good?');
  assert.ok(
    EN.opinionResponses
      .map((line) => enEngine2._conversational(line))
      .includes(enReply2),
    `EN opinion reply 2 must come from the opinion pool: "${enReply2}"`
  );
  // Pool invariant: no EN opinion line may ever carry a question mark.
  assert.ok(
    EN.opinionResponses.every((line) => !/[?]/u.test(line)),
    'an EN opinion line contains a question mark'
  );
});

test('FA: casual endearments are warmth, not the flirtation boundary', () => {
  // «قربونت برم» and friends used to trip the flirtation rule and
  // answer a thank-you with the romantic boundary line.
  for (const line of ['فدات شم', 'قربونت برم', 'فدایتم', 'قربونتم']) {
    const engine = freshEngine(FA);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes('casual_endearment'),
      `${line}: must be casual endearment, got: ${engine.currentTurnTopics.join(',')}`
    );
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
  }
});

test('FA and EN: the new warm topic families route to their own pools', () => {
  const cases = [
    [FA, 'امروز یه روز بی حاله', 'bored_day'],
    [EN, 'today is such a drag', 'bored_day'],
    [FA, 'امشب حوصله یه فیلم دارم', 'movie_mood'],
    [EN, 'I am in the mood for a movie', 'movie_mood'],
    [FA, 'فردا قرار اولمه', 'first_date'],
    [EN, 'I have a first date tomorrow', 'first_date'],
    [FA, 'سوالی هست که مدتها ذهنم رو درگیر کرده', 'topic_setup'],
    [EN, 'I have a question that has been on my mind', 'topic_setup']
  ];
  for (const [lang, line, topic] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(line);
    assert.ok(
      engine.currentTurnTopics.includes(topic),
      `${line}: must be ${topic}, got: ${engine.currentTurnTopics.join(',')}`
    );
    assert.doesNotMatch(reply, EVASIVE, `${line}: evasive: "${reply}"`);
  }
});

test('FA: every tech-frustration pool line names the technology', () => {
  // The senior-with-a-broken-app regression: the pool grew malfunction
  // lines («کرش», «قفل شد») that never mention the tech, so the reply
  // could stop answering the app frustration. Every line must keep a
  // tech signal word.
  const rule = FA.rules.find((r) => r.topic === 'tech_frustration');
  assert.ok(rule, 'tech_frustration rule must exist in the FA pack');
  for (const line of rule.responses) {
    assert.match(
      line,
      /تکنولوژی|برنامه|دیجیتال/u,
      `tech-frustration line lost its tech signal: "${line}"`
    );
  }
});

test('FA: a knowledge fact thread serves a different fact on "یکی دیگه"', () => {
  // Non-media knowledge threads: the different-one follow-up must return
  // a fresh, non-evasive fact, never a repeat and never the refusal.
  const restore = seededRandom(11);
  try {
    const engine = freshEngine(FA);
    const firstReply = engine.respond('یه چیز جالب بگو');
    const secondReply = engine.respond('یکی دیگه');
    assert.doesNotMatch(firstReply, EVASIVE, `fact 1 evasive: "${firstReply}"`);
    assert.doesNotMatch(
      secondReply,
      EVASIVE,
      `fact 2 evasive: "${secondReply}"`
    );
    assert.notEqual(secondReply, firstReply, 'fact 2 repeated fact 1');
  } finally {
    restore();
  }
});
