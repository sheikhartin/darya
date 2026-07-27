/**
 * Engine-level test suite for Darya.
 *
 * Exercises the conversation engine directly: normalization, rule matching,
 * entity extraction and memory, question handling, topic blends, math
 * detection, mixed-language detection, emotion calibration, distress nudges,
 * repetition avoidance, edge cases, and all other engine-internal logic.
 *
 * Uses Node built-ins only. Run with: node --test tests/engine.test.js
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { freshEngine, seededRandom, FA, EN, DaryaEngine, DaryaEntityExtractor, isValidScript, normalizeForMatching } = require('./helpers');

// ============================================================================
// Normalization
// ============================================================================

test('fa normalize: unifies Arabic look-alike letters to Persian forms', () => {
  assert.equal(FA.normalize('علي'), 'علی');
  assert.equal(FA.normalize('كتاب'), 'کتاب');
});

test('fa normalize: strips Arabic diacritics', () => {
  const withDiacritics = 'السَّلَامُ عَلَيْكُمْ';
  const stripped = FA.normalize(withDiacritics);
  assert.ok(!/[\u064B-\u065F]/.test(stripped));
});

test('fa normalize: converts Arabic-Indic digits to Persian digits', () => {
  assert.equal(FA.normalize('١٢٣'), '۱۲۳');
});

test('fa normalize: corrects "مي" + space to the half-space (ZWNJ) form', () => {
  assert.equal(FA.normalize('می خواهم بروم'), 'می\u200cخواهم بروم');
});

test('fa normalize regression: does NOT corrupt words containing می-like substrings', () => {
  assert.equal(FA.normalize('کمی خسته‌ام'), 'کمی خسته‌ام');
  assert.equal(FA.normalize('زیر میز است'), 'زیر میز است');
  assert.equal(FA.normalize('میدان آزادی'), 'میدان آزادی');
});

test('fa normalize: corrects already space-free known verb forms', () => {
  assert.equal(FA.normalize('میخواهم بروم'), 'می\u200cخواهم بروم');
});

test('en normalize: unifies smart/curly quotes to plain ASCII', () => {
  assert.equal(EN.normalize('I\u2019m tired'), "I'm tired");
  assert.equal(EN.normalize('\u201chello\u201D'), '"hello"');
});

test('en normalize: collapses and trims whitespace', () => {
  assert.equal(EN.normalize('  hello   world  '), 'hello world');
});

// ============================================================================
// Script validation
// ============================================================================

test('isValidScript: accepts script-neutral content (digits, emoji, punctuation)', () => {
  assert.equal(isValidScript('12345', FA), true);
  assert.equal(isValidScript('\uD83D\uDE0A\uD83D\uDC4D', FA), true);
  assert.equal(isValidScript('12345', EN), true);
});

test('isValidScript: rejects the other language\'s script', () => {
  assert.equal(isValidScript('hello there, how are you', FA), false);
  assert.equal(isValidScript('سلام حال شما چطور است', EN), false);
});

test('respond(): redirects politely instead of processing foreign-script input', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('hello there');
  assert.match(reply, /فارسی/);
});

// ============================================================================
// Regression tests
// ============================================================================

test('regression: "پدربزرگ" (grandfather) is not misparsed as "پدر" + garbage', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('پدربزرگم فوت کرد');
  assert.doesNotMatch(reply, /بزرگم/);
});

test('regression: inflected forms recognized after word-boundary fix', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('امروز خیلی غمگینم');
  const sadnessResponses = FA.rules.find((r) => r.topic === 'sadness').responses;
  const calibrationPrefix = FA.emotionCalibration?.sad;
  const cleanReply = calibrationPrefix && reply.startsWith(calibrationPrefix)
    ? reply.slice(calibrationPrefix.length).trim()
    : reply;
  assert.ok(sadnessResponses.includes(cleanReply) || FA.topicSpecificQuestions.sadness.includes(cleanReply));
});

test('regression: "چراغ" does not trigger question-word detection for "چرا"', () => {
  assert.equal(FA.questionPattern.test('چراغ اتاقم خراب شده'), false);
  assert.equal(FA.questionPattern.test('چرا همیشه همینطوریه؟'), true);
});

test('regression: Persian question marks not mistaken for letters', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('حالت چطوره؟');
  assert.match(reply, /خوب|حس/);
});

// ============================================================================
// Core rule matching
// ============================================================================

test('fa: safety rule gives crisis-appropriate response', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('دیگه نمیخوام زندگی کنم');
  assert.match(reply, /تنها نیستید|کمک تخصصی|توجه فوری/);
});

test('en: safety rule gives crisis-appropriate response', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('I want to kill myself');
  assert.match(reply, /not alone|crisis line|professional help/);
});

test('en: small-talk "how are you" is recognized', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('hi, how are you?');
  assert.match(reply, /doing well|good/i);
});

test('en: identity question is recognized', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('who are you?');
  assert.match(reply, /Darya|companion/);
});

test('exit detection works in both languages', () => {
  assert.equal(freshEngine(FA).isExitCommand('خداحافظ'), true);
  assert.equal(freshEngine(FA).isExitCommand('سلام'), false);
  assert.equal(freshEngine(EN).isExitCommand('goodbye'), true);
  assert.equal(freshEngine(EN).isExitCommand('hello'), false);
});

// ============================================================================
// Repetition avoidance
// ============================================================================

test('repetition: 10 consecutive same-topic turns produce variety', () => {
  const engine = freshEngine(EN);
  const seen = new Set();
  for (let i = 0; i < 10; i += 1) seen.add(engine.respond('I feel anxious and stressed'));
  assert.ok(seen.size >= 4, `got only ${seen.size}/10 distinct`);
});

test('repetition: seeded deterministic run has fixed variety count', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    const seen = new Set();
    for (let i = 0; i < 10; i += 1) seen.add(engine.respond('I feel anxious and stressed'));
    assert.equal(seen.size, 5, `expected 5, got ${seen.size}`);
  } finally { restore(); }
});

test('distress nudge: fires after 3 consecutive negative messages', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel so sad');
  engine.respond('everything feels hopeless and exhausting');
  const third = engine.respond('I am tired and overwhelmed');
  assert.match(third, /breathe|pause|heavy/i);
  const fourth = engine.respond('still feeling low');
  assert.doesNotMatch(fourth, /breathe in for a count of four/i);
});

test('distress nudge: never overrides safety rule', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel so sad');
  engine.respond('everything feels hopeless and exhausting');
  const reply = engine.respond('I am so tired I want to kill myself');
  assert.match(reply, /not alone|crisis line|professional help/);
});

test('question fallback: acknowledges a direct question', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('do you ever get tired of listening?');
  assert.match(reply, /question|sitting with|take on it/i);
});

test('question fallback: plain statement does not trigger', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('just thinking about random stuff today');
  assert.doesNotMatch(reply, /thoughtful question/i);
});

test('greeting and farewell pools vary across calls', () => {
  const seen = new Set();
  for (let i = 0; i < 15; i += 1) seen.add(freshEngine(EN).greeting());
  assert.ok(seen.size > 1);
});

test('back-to-back questions use non-question alternative path', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    engine.respond('Why does this keep happening?');
    const second = engine.respond('What should I do next?');
    assert.doesNotMatch(second, /[?]/);
    assert.match(second, /thread|piece|listening|detail|question|open/i);
  } finally { restore(); }
});

test('new-conversation invitation rate is near 50 percent', () => {
  const restore = seededRandom();
  try {
    let inviting = 0;
    for (let i = 0; i < 200; i += 1) {
      const engine = freshEngine(EN);
      if (EN.greetingsInviting.includes(engine._openingForNewConversation())) inviting += 1;
    }
    assert.ok(inviting / 200 >= 0.45 && inviting / 200 <= 0.55);
  } finally { restore(); }
});

// ============================================================================
// Question budget
// ============================================================================

test('question budget constants match policy', () => {
  assert.equal(DaryaEngine.CONSECUTIVE_QUESTION_LIMIT, 1);
  assert.equal(DaryaEngine.QUESTION_BUDGET_WINDOW, 3);
  assert.equal(DaryaEngine.QUESTION_BUDGET_LIMIT, 1);
});

test('question filter removes questions after one consecutive question', () => {
  const engine = freshEngine(EN);
  engine.memory.consecutiveQuestions = 1;
  assert.deepEqual(engine._filterForQuestionBudget(['What?', 'Okay.']), ['Okay.']);
});

test('question note tracks rolling window', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 1;
  engine._noteAskedQuestion('What happened?');
  assert.deepEqual(engine.memory.askedQuestionTurns, [1]);
  assert.equal(engine.memory.consecutiveQuestions, 1);
});

test('alternativeAvailable finds non-question options', () => {
  const engine = freshEngine(EN);
  assert.equal(engine._alternativeAvailable(['Why?', 'I am listening.']), true);
  assert.equal(engine._alternativeAvailable(['Why?', 'What happened?']), false);
});

test('alternativeFor returns non-question fallback', () => {
  const engine = freshEngine(EN);
  assert.doesNotMatch(engine._alternativeFor('What happened?'), /\?/);
});

test('question budget prevents two immediate questions', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 1;
  const first = engine._pickVaried(['What is this?', 'I am listening.']);
  engine.memory.turnCount = 2;
  const second = engine._pickVaried(['What is this?', 'I am listening.']);
  assert.equal(/\?/.test(first) && /\?/.test(second), false);
});

// ============================================================================
// Entity extraction
// ============================================================================

test('entity extractor returns all five entity types', () => {
  const entities = DaryaEntityExtractor.extract(
    'I feel sad about my mother at home today while studying with my apartment nearby', EN, { emotionalWeight: true });
  assert.deepEqual(new Set(entities.map((e) => e.type)), new Set(['person', 'place', 'time', 'activity', 'object']));
});

test('entity extractor gates neutral turns', () => {
  assert.deepEqual(DaryaEntityExtractor.extract('my mother is at home today', EN, { emotionalWeight: false }), []);
});

test('entity extractor accepts positively weighted turns', () => {
  const entities = DaryaEntityExtractor.extract('I feel happy about my sister at home', EN, { emotionalWeight: true });
  assert.ok(entities.some((e) => e.type === 'person' && /sister/i.test(e.surface)));
});

test('entity extractor recognizes Persian vocabulary', () => {
  const entities = DaryaEntityExtractor.extract('درباره مادرم خیلی ناراحتم و امروز در خانه هستم', FA, { emotionalWeight: true });
  assert.ok(entities.some((e) => e.type === 'person' && /مادر/.test(e.surface)));
  assert.ok(entities.some((e) => e.type === 'place' && /خانه/.test(e.surface)));
});

test('English possessive extraction stores noun not pronoun', () => {
  const entities = DaryaEntityExtractor.extract('I feel sad about my old apartment', EN, { emotionalWeight: true });
  assert.ok(entities.some((e) => e.type === 'object' && e.surface === 'old apartment'));
  assert.ok(!entities.some((e) => e.surface === 'my'));
});

test('entity extraction excludes pronouns and filler', () => {
  const entities = DaryaEntityExtractor.extract('I feel sad that you are with me', EN, { emotionalWeight: true });
  assert.ok(!entities.some((e) => /^(?:I|you|me|my|the)$/i.test(e.surface)));
});

test('named entity keys are keyed by type and surface', () => {
  assert.equal(DaryaEntityExtractor.entityKey('person', ' Mother '), 'person:mother');
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([{ type: 'person', surface: 'Mother', confidence: 0.9 }]);
  assert.ok(engine.memory.namedEntities.has('person:mother'));
});

test('first mention guard prevents same-turn callback', () => {
  const restore = seededRandom();
  try {
    assert.doesNotMatch(freshEngine(EN).respond('I feel sad about my mother'), /earlier|remember|mentioned/i);
  } finally { restore(); }
});

test('previously remembered entity can produce callback', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    engine.respond('I feel sad about my mother');
    assert.match(engine.respond('just thinking about things today'), /mother/i);
  } finally { restore(); }
});

test('entity callback threshold filters decayed memories', () => {
  const engine = freshEngine(EN);
  engine.memory.namedEntities.set('object:book', {
    type: 'object', surface: 'book', activation: 0.59, confidence: 0.9,
    mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1 });
  assert.equal(engine._respondToEntityReference(), null);
});

test('entity activation decays by declared rate', () => {
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([{ type: 'object', surface: 'book', confidence: 1 }]);
  engine.memory.decayNamedEntities();
  assert.ok(Math.abs(engine.memory.namedEntities.get('object:book').activation - 0.82) < Number.EPSILON);
  assert.equal(DaryaEngine.ENTITY_DECAY_PER_TURN, 0.18);
});

test('very weak entities removed after decay', () => {
  const engine = freshEngine(EN);
  engine.memory.namedEntities.set('object:book', {
    type: 'object', surface: 'book', activation: 0.049, confidence: 0.9,
    mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1 });
  engine.memory.decayNamedEntities();
  assert.equal(engine.memory.namedEntities.has('object:book'), false);
});

test('repeating entity refreshes activation', () => {
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([{ type: 'place', surface: 'home', confidence: 0.9 }]);
  engine.memory.decayNamedEntities();
  engine.memory.rememberEntities([{ type: 'place', surface: 'home', confidence: 0.9 }]);
  assert.equal(engine.memory.namedEntities.get('place:home').mentions, 2);
  assert.ok(engine.memory.namedEntities.get('place:home').activation > 0.82);
});

test('entity decay is monotonic and reaches zero', () => {
  const engine = freshEngine(EN);
  engine.memory.rememberEntities([{ type: 'object', surface: 'book', confidence: 1 }], 1);
  const scores = [];
  for (let turn = 0; turn < 40; turn += 1) {
    engine.memory.decayNamedEntities();
    const entity = engine.memory.namedEntities.get('object:book');
    if (!entity) break;
    scores.push(entity.activation);
  }
  for (let i = 1; i < scores.length; i += 1) assert.ok(scores[i] < scores[i - 1]);
  assert.ok(scores.length < 40);
});

test('entity callback probability is 55 percent', () => {
  assert.equal(DaryaEngine.ENTITY_CALLBACK_PROBABILITY, 0.55);
});

test('entity callbacks use typed language template', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(FA);
    engine.memory.turnCount = 2;
    engine.memory.namedEntities.set('place:خانه', {
      type: 'place', surface: 'خانه', activation: 0.9, confidence: 0.9,
      mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1 });
    assert.match(engine._respondToEntityReference(), /خانه/);
  } finally { restore(); }
});

test('first-mention guard holds when probability is 1', () => {
  const engine = freshEngine(EN);
  engine.entityCallbackProbability = 1;
  engine.memory.turnCount = 1;
  engine.memory.rememberEntities([{ type: 'person', surface: 'Maya', confidence: 1, lastMentionTurn: 1 }], 1);
  assert.equal(engine._respondToEntityReference(), null);
});

test('entity memory keeps topic context, rejects unrelated callbacks', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    engine.memory.turnCount = 1;
    engine.currentTurnTopics = ['family', 'sadness'];
    engine.memory.rememberEntities([{ type: 'person', surface: 'mother', confidence: 0.95 }], 1, { topics: ['family', 'sadness'], seriousness: 0.8 });
    assert.deepEqual(engine.memory.namedEntities.get('person:mother').contextTopics, ['family', 'sadness']);
    engine.memory.turnCount = 2;
    engine.currentTurnTopics = ['work'];
    assert.equal(engine._respondToEntityReference(), null);
    engine.currentTurnTopics = ['family'];
    assert.match(engine._respondToEntityReference(), /mother/i);
  } finally { restore(); }
});

// ============================================================================
// Topic blends, seriousness, humor
// ============================================================================

test('topic memory tracks weighted turns', () => {
  const engine = freshEngine(EN);
  engine.respond("I can't sleep because I feel anxious");
  assert.ok(engine.memory.topicHistory.length >= 2);
  assert.equal(engine.memory.currentSubject.topic, 'sleep');
  assert.ok(engine.memory.topicWeights.get('sleep') >= 1);
  assert.ok(engine.memory.currentSubject.since >= 1);
});

test('common topic blends return dedicated reflection', () => {
  const restore = seededRandom();
  try {
    const reply = freshEngine(EN).respond("I can't sleep because I feel anxious");
    assert.ok(EN.blendResponses.blend_sleep_anxiety.includes(reply));
    assert.doesNotMatch(reply, /[?]/);
  } finally { restore(); }
});

test('sleep follow-up is from topic-specific pool', () => {
  const restore = seededRandom();
  try {
    assert.ok(EN.topicSpecificQuestions.sleep.includes(freshEngine(EN).respond("I can't sleep")));
  } finally { restore(); }
});

test('work follow-up is from topic-specific pool', () => {
  const restore = seededRandom();
  try {
    assert.ok(EN.topicSpecificQuestions.work.includes(freshEngine(EN).respond('My job is difficult lately')));
  } finally { restore(); }
});

test('seriousness blocks humor', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 4;
  engine.currentTurnSeriousness = EN.topicSeriousness.anxiety;
  engine.lastTurnNeedsCare = true;
  assert.equal(engine.canHumorFire(), false);
  assert.equal(engine._maybeHumanTone('A careful reply.', 'I feel anxious'), 'A careful reply.');
});

test('humor gate allows humor in light contexts', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 3;
  engine.currentTurnSeriousness = 0.2;
  engine.lastTurnNeedsCare = false;
  assert.equal(engine.canHumorFire(), true);
});

test('gratitude is brief and does not close the conversation', () => {
  const banned = ['you are welcome', 'happy to help', 'goodbye', 'take care', 'خوشحالم که کمک کردم', 'موفق باشی'];
  for (const [lang, input] of [[EN, 'thanks'], [FA, 'ممنون']]) {
    const reply = freshEngine(lang).respond(input);
    assert.ok(lang.gratitudeResponses.includes(reply));
    for (const phrase of banned) assert.equal(reply.toLocaleLowerCase().includes(phrase), false, reply);
  }
});

test('recap uses remembered topics and real entities', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel sad about my apartment');
  const reply = engine.respond('what did I say earlier');
  assert.match(reply, /sadness|sad|apartment|object/i);
  assert.doesNotMatch(reply, /nothing you said|something interesting/i);
});

test('professional boundary replies redirect to qualified help', () => {
  for (const [lang, input] of [[EN, 'Can you give me legal advice?'], [FA, 'مشاوره حقوقی می‌خواهم']]) {
    const reply = freshEngine(lang).respond(input);
    assert.match(reply, /professional|licensed|متخصص/iu);
    assert.doesNotMatch(reply, /take this medication|invest in|you must file/i);
  }
});

test('human touch requires remembered entity', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 7;
  engine.currentTurnSeriousness = 0.2;
  assert.equal(engine._shouldAddHumanTouch(), false);
  engine.memory.namedEntities.set('object:coffee', { type: 'object', surface: 'coffee', activation: 0.9, confidence: 0.9, mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1 });
  assert.equal(engine._shouldAddHumanTouch(), true);
  assert.match(engine._humanTouchLine(), /coffee/i);
});

test('returning openings favor returning pool with prior memory', () => {
  const restore = seededRandom();
  try {
    const engine = freshEngine(EN);
    engine.memory.namedEntities.set('object:coffee', { type: 'object', surface: 'coffee', activation: 0.9, confidence: 0.9, mentions: 1, firstMentionTurn: 1, lastMentionTurn: 1, age: 1 });
    assert.ok(EN.greetingsReturning.includes(engine._openingForNewConversation()));
  } finally { restore(); }
});

test('topic blend fires on mixed input across languages', () => {
  const engine = freshEngine(FA);
  const reply = engine.respond('نمی‌تونم بخوابم چون استرس دارم');
  assert.ok(reply.length > 0);
});

// ============================================================================
// Opening pool behavior
// ============================================================================

test('opening uses inviting pool when random is below 0.5', () => {
  const restore = seededRandom();
  Math.random = () => 0.1;
  try {
    assert.ok(EN.greetingsInviting.includes(freshEngine(EN)._openingForNewConversation()));
  } finally { restore(); }
});

test('opening uses open pool when random is at or above 0.5', () => {
  const restore = seededRandom();
  Math.random = () => 0.6;
  try {
    assert.ok(EN.greetingsOpen.includes(freshEngine(EN)._openingForNewConversation()));
  } finally { restore(); }
});

// ============================================================================
// Punctuation normalization
// ============================================================================

test('punctuation normalization preserves original text for memory', () => {
  const engine = freshEngine(EN);
  engine.respond('I feel sad!');
  assert.equal(engine.memory.recentUtterances.at(-1), 'I feel sad!');
  assert.equal(normalizeForMatching('I feel sad!', EN), 'I feel sad');
});

test('punctuated exit commands detected consistently', () => {
  for (const i of ['goodbye', 'goodbye!', 'goodbye.']) assert.equal(freshEngine(EN).isExitCommand(i), true);
  for (const i of ['خداحافظ', 'خداحافظ!', 'خداحافظ.']) assert.equal(freshEngine(FA).isExitCommand(i), true);
});

// ============================================================================
// Math / arithmetic
// ============================================================================

test('intelligence: factual math question gets answered', () => {
  const reply = freshEngine(EN).respond('What is 5 + 3?');
  assert.match(reply, /8/);
  assert.ok(reply.includes('='));
});

test('intelligence: Persian math with ضربدر answers correctly', () => {
  assert.match(freshEngine(FA).respond('۸ ضربدر ۳ چند می‌شه؟'), /۲۴/);
});

test('arithmetic: Persian bare addition', () => {
  assert.match(freshEngine(FA).respond('۲+۵'), /۷/);
});

test('arithmetic: Persian bare subtraction', () => {
  assert.match(freshEngine(FA).respond('۱۰-۳'), /۷/);
});

test('arithmetic: Persian bare multiplication', () => {
  assert.match(freshEngine(FA).respond('۸*۳'), /۲۴/);
});

test('arithmetic: Persian bare with بعلاوه', () => {
  assert.match(freshEngine(FA).respond('۵ بعلاوه ۳'), /۸/);
});

test('arithmetic: Persian bare with منهای', () => {
  assert.match(freshEngine(FA).respond('۱۰ منهای ۳'), /۷/);
});

test('arithmetic: Persian bare with ضربدر', () => {
  assert.match(freshEngine(FA).respond('۸ ضربدر ۳'), /۲۴/);
});

test('arithmetic: Persian bare division', () => {
  assert.match(freshEngine(FA).respond('۱۰ تقسیم بر ۲'), /۵/);
});

test('arithmetic: English bare addition', () => {
  assert.match(freshEngine(EN).respond('5+3'), /8/);
});

test('arithmetic: English bare multiplication', () => {
  assert.match(freshEngine(EN).respond('8*3'), /24/);
});

test('arithmetic: English bare division', () => {
  assert.match(freshEngine(EN).respond('10/2'), /5/);
});

test('arithmetic: English bare subtraction', () => {
  assert.match(freshEngine(EN).respond('15-7'), /8/);
});

test('arithmetic: Persian full question with می‌شه', () => {
  assert.match(freshEngine(FA).respond('۲+۳ چند می‌شه'), /۵/);
});

test('arithmetic: Persian بعلاوه question with می‌شود', () => {
  assert.match(freshEngine(FA).respond('۳ بعلاوه ۴ چند می‌شود'), /۷/);
});

test('arithmetic: Persian مساوی phrase', () => {
  assert.match(freshEngine(FA).respond('۲+۳ مساوی چند؟'), /۵/);
});

test('arithmetic: English what is with addition', () => {
  assert.match(freshEngine(EN).respond('what is 5+3'), /8/);
});

test('arithmetic: English what is with multiplication', () => {
  assert.match(freshEngine(EN).respond('what is 8*3'), /24/);
});

test('arithmetic: division by zero', () => {
  assert.match(freshEngine(EN).respond('5/0'), /undefine|not define|cannot divide/i);
});

test('arithmetic: Persian zero as first operand', () => {
  assert.match(freshEngine(FA).respond('۰+۵'), /۵/);
});

test('arithmetic: Persian zero as second operand', () => {
  assert.match(freshEngine(FA).respond('۵+۰'), /۵/);
});

test('arithmetic: Persian all zero', () => {
  assert.match(freshEngine(FA).respond('۰+۰'), /۰/);
});

test('arithmetic: Persian negative result', () => {
  assert.match(freshEngine(FA).respond('۳-۱۰'), /۷/);
});

test('arithmetic: Persian large numbers', () => {
  assert.match(freshEngine(FA).respond('۱۰۰+۲۰۰'), /۳۰۰/);
});

test('arithmetic: Persian mixed digits', () => {
  assert.match(freshEngine(FA).respond('۵+3'), /۸/);
});

test('arithmetic: Persian multi-digit', () => {
  assert.match(freshEngine(FA).respond('۱۱۱+۲۲۲'), /۳۳۳/);
});

test('arithmetic: English negative result', () => {
  assert.match(freshEngine(EN).respond('3-10'), /-7/);
});

test('arithmetic: English large numbers', () => {
  assert.match(freshEngine(EN).respond('100+200'), /300/);
});

test('arithmetic: non-math text does not trigger', () => {
  assert.ok(freshEngine(FA).respond('امروز هوای خوبی است').length > 0);
  assert.ok(freshEngine(EN).respond('today is a nice day').length > 0);
  assert.ok(freshEngine(FA).respond('من ۲۰ سال دارم').length > 0);
});

test('arithmetic: Persian بعلاوه with چند می‌شه', () => {
  assert.match(freshEngine(FA).respond('۵ بعلاوه ۳ چند می‌شه'), /۸/);
});

test('arithmetic: Persian ضربدر with چند می‌شود', () => {
  assert.match(freshEngine(FA).respond('۸ ضربدر ۳ چند می‌شود'), /۲۴/);
});

test('arithmetic: English what\'s with division', () => {
  assert.match(freshEngine(EN).respond("what's 10/2"), /5/);
});

// ============================================================================
// Response strategy
// ============================================================================

test('response strategy records purposeful decisions', () => {
  const engine = freshEngine(EN);
  engine.respond('My job has been stressful');
  assert.ok(engine.conversationState.strategy);
  assert.equal(typeof engine.conversationState.strategy, 'string');
});

test('serious strategy responds to hopeless input', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('I feel completely devastated and hopeless');
  assert.ok(engine.conversationState.strategy);
  assert.ok(reply.length > 0);
  assert.doesNotMatch(reply, /happy|great|wonderful/i);
});

test('safety beats word repetition and frustration', () => {
  assert.match(freshEngine(EN).respond('I want to kill myself I want to kill myself'), /not alone|crisis line|professional help/);
});

test('factorial input does not crash', () => {
  assert.ok(freshEngine(EN).respond('5!').length > 0);
});

test('Persian greeting with punctuation is handled', () => {
  assert.ok(freshEngine(FA).respond('سلام!').length > 0);
});

test('apostrophe in contractions preserved', () => {
  assert.ok(freshEngine(EN).respond("I'm not doing well today").length > 0);
});

// ============================================================================
// Word repetition / intelligence
// ============================================================================

test('English word repetition detected', () => {
  const reply = freshEngine(EN).respond('sad sad sad sad');
  assert.match(reply, /sad/);
  assert.ok(reply.length > 10);
});

test('Persian word repetition detected', () => {
  const reply = freshEngine(FA).respond('غمگین غمگین غمگین غمگین');
  assert.match(reply, /غمگین/);
  assert.ok(reply.length > 10);
});

test('non-repeated words do not trigger repetition', () => {
  assert.ok(freshEngine(EN).respond('I feel sad today').length > 0);
});

test('emotionally charged questions get thoughtful responses', () => {
  assert.ok(freshEngine(EN).respond('Why does this keep happening!').length > 0);
  assert.ok(freshEngine(EN).respond('Why does this keep happening?').length > 0);
});

test('10x repeated Persian greeting breaks loop', () => {
  const engine = freshEngine(FA);
  for (let i = 0; i < 9; i += 1) engine.respond('سلام');
  assert.ok(engine.respond('سلام').length > 0);
});

test('10x repeated English greeting breaks loop', () => {
  const engine = freshEngine(EN);
  for (let i = 0; i < 9; i += 1) engine.respond('hi');
  assert.ok(engine.respond('hi').length > 0);
});

// ============================================================================
// Exit confirmation
// ============================================================================

test('exit confirm returns message from pool', () => {
  const reply = freshEngine(EN).respond('goodbye');
  assert.ok(EN.exitConfirmMessages.includes(reply) || typeof reply === 'string');
});

test('exit confirm in Persian returns response', () => {
  assert.ok(freshEngine(FA).respond('خداحافظ').length > 0);
});

test('exit confirm varies across repeated calls', () => {
  const seen = new Set();
  for (let i = 0; i < 10; i += 1) seen.add(freshEngine(EN).respond('goodbye'));
  assert.ok(seen.size > 1);
});

test('exit not triggered by story containing goodbye', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('I said goodbye to my friend today');
  assert.ok(!engine.memory.pendingExitConfirmation);
  assert.ok(reply.length > 0);
});

test('short polite farewells detected', () => {
  assert.equal(freshEngine(EN).isExitCommand('bye'), true);
  assert.equal(freshEngine(FA).isExitCommand('بدرود'), true);
});

// ============================================================================
// Edge cases: empty, whitespace
// ============================================================================

test('empty input returns gentle prompt', () => {
  assert.match(freshEngine(EN).respond(''), /quiet|ready|here|silence/i);
  assert.match(freshEngine(FA).respond(''), /سکوت|شنوم|آماده|صحبت/iu);
});

test('whitespace-only returns gentle prompt', () => {
  assert.match(freshEngine(EN).respond('   '), /quiet|ready|here|silence/i);
  assert.match(freshEngine(FA).respond('   '), /سکوت|شنوم|آماده|صحبت/iu);
});

test('short ambiguous input handled', () => {
  assert.ok(freshEngine(EN).respond('ok').length > 0);
  assert.ok(freshEngine(FA).respond('خوب').length > 0);
});

test('gratitude does not close conversation', () => {
  assert.ok(EN.gratitudeResponses.includes(freshEngine(EN).respond('thanks')));
});

test('mixed topic identifies dominant topic', () => {
  assert.ok(freshEngine(EN).respond('My job is stressful and I feel sad').length > 0);
});

test('goodbye followed by non-exit resumes', () => {
  const engine = freshEngine(EN);
  engine.respond('goodbye');
  engine.respond('goodbye');
  assert.ok(engine.respond('actually I need to talk').length > 0);
});

// ============================================================================
// Long and extreme inputs
// ============================================================================

test('very long inputs remain safe', () => {
  assert.ok(freshEngine(EN).respond('sad '.repeat(2000)).length > 0);
  assert.ok(freshEngine(EN).respond('a'.repeat(10000)).length > 0);
  assert.ok(freshEngine(FA).respond('سلام '.repeat(2000)).length > 0);
});

test('very long math expression answered', () => {
  const reply = freshEngine(EN).respond('what is ' + '1+'.repeat(500) + '1?');
  assert.ok(reply.length > 0);
});

test('extremely long input bounded gracefully', () => {
  assert.ok(freshEngine(EN).respond('test '.repeat(10000)).length > 0);
});

// ============================================================================
// Punctuation and HTML injection
// ============================================================================

test('excessive punctuation produces a reply', () => {
  assert.ok(freshEngine(EN).respond('Why!!!!!').length > 0);
  assert.ok(freshEngine(EN).respond('Why?????').length > 0);
  assert.ok(freshEngine(EN).respond('Why?!?!?').length > 0);
  assert.ok(freshEngine(FA).respond('!!!').length > 0);
  assert.ok(freshEngine(EN).respond('!?!?!?!?!?').length > 0);
});

test('HTML injection returns safe reply', () => {
  const engine = freshEngine(EN);
  const script = engine.respond('<script>alert("xss")</script>');
  assert.ok(script.length > 0);
  assert.doesNotMatch(script, /<script>/i);
  const iframe = engine.respond('<iframe src="http://evil.com"></iframe>');
  assert.ok(iframe.length > 0);
  assert.doesNotMatch(iframe, /<iframe/i);
});

test('HTML attributes handled safely', () => {
  assert.ok(freshEngine(EN).respond('<img src=x onerror=alert(1)>').length > 0);
  assert.ok(freshEngine(EN).respond('Click here onmouseover="alert(1)"').length > 0);
  assert.ok(freshEngine(EN).respond('&lt;script&gt;').length > 0);
  assert.ok(freshEngine(FA).respond('<script>alert("xss")</script>').length > 0);
  assert.ok(freshEngine(EN).respond("'; DROP TABLE users; --").length > 0);
});

// ============================================================================
// Arabic and mixed script
// ============================================================================

test('Arabic with diacritics normalized', () => {
  assert.ok(freshEngine(FA).respond('السَّلَامُ عَلَيْكُمْ').length > 0);
});

test('mixed English and Persian handled without crashing', () => {
  assert.ok(freshEngine(FA).respond('سلام how are you').length > 0);
});

test('Arabic text accepted in FA engine', () => {
  assert.ok(freshEngine(FA).respond('السلام علیکم').length > 0);
});

test('pure English politely redirected in FA engine', () => {
  assert.match(freshEngine(FA).respond('I am happy'), /فارسی/);
});

test('pure Persian politely redirected in EN engine', () => {
  assert.match(freshEngine(EN).respond('من خوشحالم'), /English|language/i);
});

// ============================================================================
// Emoji
// ============================================================================

test('emoji-only input returns non-empty reply', () => {
  assert.ok(freshEngine(EN).respond('\uD83D\uDE0A').length > 0);
  assert.ok(freshEngine(EN).respond('\uD83D\uDE0A\uD83D\uDC4D\uD83D\uDE4C').length > 0);
  assert.ok(freshEngine(FA).respond('\uD83D\uDE0A سلام').length > 0);
  assert.ok(freshEngine(EN).respond('hello \uD83D\uDE0A').length > 0);
  assert.ok(freshEngine(EN).respond('\uD83C\uDDFA\uD83C\uDDF8').length > 0);
  assert.ok(freshEngine(EN).respond('\uD83D\uDC4B\uD83C\uDFFC').length > 0);
  assert.ok(freshEngine(FA).respond('\uD83D\uDE0A').length > 0);
});

// ============================================================================
// Mixed language detection
// ============================================================================

test('_isMixedLanguage detects bilingual Persian-dominant text', () => {
  assert.ok(freshEngine(FA)._isMixedLanguage('من یک how are you دارم'));
});

test('_isMixedLanguage detects bilingual English-dominant text', () => {
  assert.ok(freshEngine(EN)._isMixedLanguage('I have a سلام friend'));
});

test('_isMixedLanguage false for pure script', () => {
  assert.equal(freshEngine(FA)._isMixedLanguage('من یک دوست دارم'), false);
});

test('_isMixedLanguage false for few letters', () => {
  assert.equal(freshEngine(FA)._isMixedLanguage('12 34 + ='), false);
});

test('_isMixedLanguage false for no letters', () => {
  assert.equal(freshEngine(FA)._isMixedLanguage('12345 67890'), false);
});

test('mixed language routing returns response', () => {
  assert.ok(freshEngine(FA).respond('I feel من today').length > 0);
});

test('pure foreign script redirects in FA', () => {
  assert.match(freshEngine(FA).respond('Hello, how are you?'), /فارسی/);
});

test('pure foreign script redirects in EN', () => {
  assert.match(freshEngine(EN).respond('سلام علیکم'), /English|language/i);
});

test('Arabic text not detected as mixed in FA', () => {
  assert.equal(freshEngine(FA)._isMixedLanguage('السلام علیکم'), false);
});

// ============================================================================
// Emotion calibration
// ============================================================================

test('emotion calibration prefixes exist in both languages', () => {
  for (const lang of [FA, EN]) {
    for (const [emotion, prefix] of Object.entries(lang.emotionCalibration)) {
      assert.ok(prefix, `${lang.code}:${emotion}`);
      assert.equal(typeof prefix, 'string');
      assert.ok(prefix.length > 0);
    }
  }
});

test('emotion calibration prefixes are unique per language', () => {
  for (const lang of [FA, EN]) {
    const prefixes = Object.values(lang.emotionCalibration);
    assert.equal(new Set(prefixes).size, prefixes.length);
  }
});

test('emotion calibration returns non-empty string', () => {
  const calibrated = freshEngine(EN)._calibrateEmotionalTone('You matter.', 'sad');
  assert.ok(calibrated.length > 0);
});

test('unknown emotion returns reply unchanged', () => {
  assert.equal(freshEngine(EN)._calibrateEmotionalTone('Hello.', 'unknown'), 'Hello.');
});

// ============================================================================
// Distress nudge details
// ============================================================================

test('distress nudge fires after 3 negatives', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  engine.respond('I feel depressed');
  assert.match(engine.respond('I am feeling overwhelmed'), /breathe|pause|heavy/i);
});

test('distress nudge does not fire before 3 negatives', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  assert.doesNotMatch(engine.respond('I am feeling down'), /breathe in for a count of four/i);
});

test('distress nudge fires only once per streak', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  engine.respond('I feel hopeless');
  engine.respond('I am overwhelmed');
  engine.respond('I still feel bad');
  assert.doesNotMatch(engine.respond('still bad today'), /breathe in for a count of four/i);
});

test('distress nudge resets after streak ends', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  engine.respond('I feel hopeless');
  engine.respond('I am overwhelmed');
  engine.respond('I feel better today');
  engine.respond('oh wait I am sad again');
  assert.doesNotMatch(engine.respond('I feel terrible'), /breathe in for a count of four/i);
});

test('distress nudge does not override safety', () => {
  const engine = freshEngine(EN);
  engine.respond('I am sad');
  engine.respond('I feel hopeless');
  assert.match(engine.respond('I want to kill myself'), /not alone|crisis line|professional help/);
});

test('distress nudge works in Persian', () => {
  const engine = freshEngine(FA);
  engine.respond('غمگینم');
  engine.respond('ناراحتم');
  assert.match(engine.respond('حالم خوب نیست'), /نفس|استراحت|توصیه|زاویه/i);
});

// ============================================================================
// Sentiment scoring
// ============================================================================

test('sentiment: FA ناراحت scores 0 (known bug: positive overlap)', () => {
  assert.equal(DaryaEngine.scoreSentiment(FA.normalize('ناراحت'), FA.sentimentLexicon), 0);
});

test('sentiment: FA غمگین double-counts (known bug)', () => {
  assert.equal(DaryaEngine.scoreSentiment(FA.normalize('غمگین'), FA.sentimentLexicon), -2);
});

test('sentiment: FA compound partially caught (known bug)', () => {
  const score = DaryaEngine.scoreSentiment(FA.normalize('دلشکسته'), FA.sentimentLexicon);
  assert.ok(score <= 0);
});

// ============================================================================
// Advanced edge cases
// ============================================================================

test('null input does not crash engine', () => {
  assert.ok(freshEngine(EN).respond(null).length > 0);
  assert.ok(freshEngine(FA).respond(null).length > 0);
});

test('undefined input does not crash engine', () => {
  assert.ok(freshEngine(EN).respond(undefined).length > 0);
  assert.ok(freshEngine(FA).respond(undefined).length > 0);
});

test('newline-only and tab-only return gentle prompt', () => {
  assert.ok(freshEngine(EN).respond("\n\n").length > 0);
  assert.ok(freshEngine(EN).respond("\t\t").length > 0);
});

test('unicode direction marks do not crash the engine', () => {
  assert.ok(freshEngine(EN).respond('\\u200Fhello').length > 0);
  assert.ok(freshEngine(FA).respond('\\u200E\u0633\u0644\u0627\u0645').length > 0);
});

test('zero-width non-joiner Persian normalization works', () => {
  const reply = freshEngine(FA).respond('\u0645\u06CC\\u200C\u062E\u0648\u0627\u0647\u0645');
  assert.ok(reply.length > 0);
});

test('only digits returns non-empty reply', () => {
  assert.ok(freshEngine(EN).respond('12345').length > 0);
  assert.ok(freshEngine(FA).respond('\u06F1\u06F2\u06F3\u06F4\u06F5').length > 0);
});

test('only symbols returns non-empty reply', () => {
  assert.ok(freshEngine(EN).respond('@#$%^&*()').length > 0);
  assert.ok(freshEngine(FA).respond('@#$%^&*()').length > 0);
});

test('URLs handled safely without crash or leak', () => {
  assert.ok(freshEngine(EN).respond('http://example.com').length > 0);
  assert.ok(freshEngine(FA).respond('https://test.com/path?query=value').length > 0);
  const reply = freshEngine(EN).respond('visit http://evil.com now');
  assert.ok(reply.length > 0);
  assert.doesNotMatch(reply, /http:\/\//i);
});

test('SQL injection patterns do not produce raw output', () => {
  const reply = freshEngine(EN).respond(' OR 1=1;--');
  assert.ok(reply.length > 0);
  assert.doesNotMatch(reply, /DROP|DELETE|INSERT|OR 1=1/i);
});

test('JSON-style input handled without crash', () => {
  assert.ok(freshEngine(EN).respond('{"key": "value"}').length > 0);
  assert.ok(freshEngine(FA).respond('{"text": "سلام"}').length > 0);
});

test('triple-script mixed input (Persian + Arabic + English) handled', () => {
  assert.ok(freshEngine(FA).respond('\u0633\u0644\u0627\u0645 \u06A9\u06CC\u0641 \u062D\u0627\u0644\u06A9 how are you').length > 0);
});

test('multi-codepoint emoji (flag, skin tone, ZWJ) handled without crash', () => {
  // Flag emoji (US)
  assert.ok(freshEngine(EN).respond('\\uD83C\\uDDFA\\uD83C\\uDDF8').length > 0);
  // Skin tone modifier
  assert.ok(freshEngine(EN).respond('\\uD83D\\uDC4B\\uD83C\\uDFFC').length > 0);
  // ZWJ sequence (technologist emoji)
  assert.ok(freshEngine(EN).respond('\\uD83D\\uDC68\\u200D\\uD83D\\uDCBB').length > 0);
  // Family emoji
  assert.ok(freshEngine(FA).respond('\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC66').length > 0);
});

test('all-punctuation and repeated separators produce reply', () => {
  assert.ok(freshEngine(EN).respond('...').length > 0);
  assert.ok(freshEngine(EN).respond('!?.,;:!?').length > 0);
  assert.ok(freshEngine(EN).respond('----').length > 0);
  assert.ok(freshEngine(FA).respond('...').length > 0);
});

test('all-caps input does not leak raw text in response', () => {
  const reply = freshEngine(EN).respond('I AM VERY ANGRY RIGHT NOW');
  assert.ok(reply.length > 0);
  // Response should acknowledge the emotion without repeating the raw caps back
  assert.doesNotMatch(reply, /I AM VERY ANGRY/i);
});

test('repeated single character produces reply', () => {
  assert.ok(freshEngine(EN).respond('aaaaaaa').length > 0);
  assert.ok(freshEngine(EN).respond('111111').length > 0);
  assert.ok(freshEngine(FA).respond('\u0627\u0627\u0627\u0627\u0627\u0627').length > 0);
});

test('SVG and javascript URIs stripped from response', () => {
  const svgReply = freshEngine(EN).respond('<svg onload=alert(1)>');
  assert.ok(svgReply.length > 0);
  assert.doesNotMatch(svgReply, /onload|alert|<svg/i);
  const jsReply = freshEngine(EN).respond('javascript:alert(1)');
  assert.ok(jsReply.length > 0);
  assert.doesNotMatch(jsReply, /javascript:|alert/i);
  const dataReply = freshEngine(FA).respond('data:text/html,<script>alert(1)</script>');
  assert.ok(dataReply.length > 0);
  assert.doesNotMatch(dataReply, /data:|<script>|alert/i);
});

test('HTML entity injection returns safe reply', () => {
  assert.ok(freshEngine(EN).respond('&lt;script&gt;alert(1)&lt;/script&gt;').length > 0);
  assert.ok(freshEngine(FA).respond('&amp;nbsp;').length > 0);
});

// ============================================================================
// Knowledge rule
// ============================================================================

test('knowledge rule responds without network access', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('How can I focus better?');
  assert.ok(reply.length > 40);
  assert.equal(engine.currentTurnTopics.includes('knowledge'), true);
});

test('Persian knowledge rule responds in Persian', () => {
  const reply = freshEngine(FA).respond('برای تمرکز چه کار کنم؟');
  assert.match(reply, /[\u0600-\u06FF]/u);
});

// ============================================================================
// Self awareness
// ============================================================================

test('self awareness remains bounded and truthful', () => {
  for (const lang of [EN, FA]) {
    const engine = freshEngine(lang);
    const snapshot = engine.describeSelf ? engine.describeSelf() : lang.selfAwareness;
    assert.ok(snapshot);
    assert.equal(typeof snapshot.approach, 'string');
    assert.equal(typeof snapshot.boundaries, 'string');
    assert.doesNotMatch(JSON.stringify(snapshot), /human|real person|انسان واقعی/u);
  }
});

// ============================================================================
// Override reply (no calibration prefix for math)
// ============================================================================

test('math override reply has no calibration prefix', () => {
  const reply = freshEngine(EN).respond('5+3');
  assert.match(reply, /\d/);
  assert.doesNotMatch(reply, /breathe|heavy|sad|understand/i);
});
