/**
 * Tests for the Phase 1 foundation modules: emotion analyzer,
 * context window, personality engine, and response scorer.
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert';
import { freshEngine, FA, EN } from './helpers.mjs';

const G = globalThis;

test('emotion analyzer: dimensions exist for all engine emotions', () => {
  const { EMOTION_DIMENSIONS } = G.DaryaEmotionAnalyzer;
  for (const emotion of [
    'hurt',
    'confused',
    'excited',
    'angry',
    'grieving',
    'fear',
    'anxious',
    'sad',
    'hopeless',
    'overwhelmed',
    'ashamed',
    'jealous',
    'hopeful',
    'grateful'
  ]) {
    const dims = EMOTION_DIMENSIONS[emotion];
    assert.ok(dims, `missing dimensions for ${emotion}`);
    assert.ok(
      dims.valence >= -1 && dims.valence <= 1,
      `${emotion} valence in range`
    );
    assert.ok(
      dims.arousal >= 0 && dims.arousal <= 1,
      `${emotion} arousal in range`
    );
    assert.ok(
      dims.dominance >= 0 && dims.dominance <= 1,
      `${emotion} dominance in range`
    );
  }
});

test('emotion analyzer: negative emotions carry negative valence', () => {
  const { analyzeTurn } = G.DaryaEmotionAnalyzer;
  const analysis = analyzeTurn('grieving', 0);
  assert.ok(analysis.valence < 0, 'grieving should be negatively valenced');
  assert.ok(analysis.intense, 'grieving should be marked intense');
});

test('emotion analyzer: sentiment score blends into neutral valence', () => {
  const { analyzeTurn } = G.DaryaEmotionAnalyzer;
  const negative = analyzeTurn('neutral', -3);
  assert.ok(
    negative.valence < 0,
    'strong negative sentiment should pull valence down'
  );
  const positive = analyzeTurn('neutral', 3);
  assert.ok(
    positive.valence > 0,
    'strong positive sentiment should pull valence up'
  );
});

test('emotion analyzer: trajectory tracks last N samples and resets', () => {
  const { EmotionTrajectory } = G.DaryaEmotionAnalyzer;
  const trajectory = new EmotionTrajectory(3);
  assert.equal(trajectory.last(), null);
  trajectory.push('sad', 1);
  trajectory.push('angry', 2);
  trajectory.push('hopeful', 3);
  assert.equal(trajectory.last(), 'hopeful');
  assert.equal(trajectory.previous(), 'angry');
  // Depth 3: pushing a 4th sample drops the first.
  trajectory.push('grateful', 4);
  assert.equal(trajectory.previous(), 'hopeful');
  assert.equal(trajectory.samples.length, 3);
  trajectory.reset();
  assert.equal(trajectory.last(), null);
});

test('emotion analyzer: positive/negative shift detection', () => {
  const { isPositiveShift, isNegativeShift } = G.DaryaEmotionAnalyzer;
  assert.ok(
    isPositiveShift('sad', 'hopeful'),
    'sad -> hopeful is a positive shift'
  );
  assert.ok(
    isNegativeShift('happy', 'anxious'),
    'happy -> anxious is a negative shift'
  );
  assert.ok(
    !isPositiveShift('hopeful', 'sad'),
    'hopeful -> sad is not a positive shift'
  );
  assert.ok(
    !isNegativeShift('anxious', 'sad'),
    'similar-negative pair is not a strong shift'
  );
  assert.ok(
    !isPositiveShift(null, 'hopeful'),
    'no previous emotion means no shift'
  );
});

test('engine: trajectory and enriched analysis are populated per turn', () => {
  const engine = freshEngine(FA);
  engine.respond('من خیلی ناراحتم');
  assert.equal(engine.lastDetectedEmotion, 'sad');
  const analysis = engine._currentEmotionAnalysis();
  assert.ok(analysis, 'enriched analysis should exist');
  assert.equal(analysis.emotion, 'sad');
  assert.equal(engine.emotionTrajectory.samples.length, 1);
});

test('engine: emotional shift is detectable across turns', () => {
  const engine = freshEngine(FA);
  engine.respond('همه چیز دارم ولی خوشحال نیستم');
  engine.respond('ولی امروز یک خبر خیلی خوب گرفتم!');
  // The trajectory must now hold two samples; whether it counts as a
  // positive shift depends on the detected emotions, which must both be
  // known emotions for the comparison to fire at all.
  assert.ok(engine.emotionTrajectory.samples.length >= 2);
  assert.equal(typeof engine._emotionShiftedPositive(), 'boolean');
  assert.equal(typeof engine._emotionShiftedNegative(), 'boolean');
});

test('context window: statements are remembered and recalled', () => {
  const { ConversationContext } = G.DaryaContextWindow;
  const context = new ConversationContext();
  context.rememberUtterance('این روزها خیلی خسته‌ام از کار', 1, {});
  context.rememberUtterance('باشه', 2, { isAcknowledgement: true });
  context.rememberUtterance('خواهرم تازه بچه دار شده', 3, {});
  assert.equal(
    context.notableStatements.length,
    2,
    'acknowledgements are not notable'
  );
  assert.equal(context.mostRecentNotable(), 'خواهرم تازه بچه دار شده');
  assert.equal(
    context.mostRecentNotable('خواهرم تازه بچه دار شده'),
    'این روزها خیلی خسته‌ام از کار',
    'excluding current text returns the previous notable'
  );
});

test('context window: topics track recency and previous topic', () => {
  const { ConversationContext } = G.DaryaContextWindow;
  const context = new ConversationContext();
  context.rememberTopics(['work'], 1);
  context.rememberTopics(['family'], 2);
  context.rememberTopics(['work'], 3);
  assert.equal(context.previousTopic('work'), 'family');
  assert.equal(context.lastTopic, 'work');
  assert.ok(context.wasTopicRecent('work', 4));
  assert.ok(!context.wasTopicRecent('sleep', 4));
});

test('context window: active subject switches and resets', () => {
  const { ConversationContext } = G.DaryaContextWindow;
  const context = new ConversationContext();
  context.setActiveSubject('grief', 1);
  assert.equal(context.activeSubject, 'grief');
  assert.equal(context.activeSubjectSinceTurn, 1);
  context.setActiveSubject('joy', 2);
  assert.equal(context.activeSubject, 'joy');
  assert.equal(context.activeSubjectSinceTurn, 2);
  context.reset();
  assert.equal(context.activeSubject, null);
});

test('personality engine: tone classification by seriousness and emotion', () => {
  const { classifyTone } = G.DaryaPersonalityEngine;
  assert.equal(classifyTone(0.8, { intense: true }), 'heavy');
  assert.equal(classifyTone(0.7, {}), 'heavy');
  assert.equal(classifyTone(0.2, { emotion: 'happy' }), 'light');
  assert.equal(classifyTone(0.5, {}), 'neutral');
  assert.equal(
    classifyTone(0.1, { emotion: 'sad' }),
    'neutral',
    'sad at low seriousness is not light'
  );
});

test('personality engine: tone incoherence blocks jokes on heavy turns', () => {
  const { isToneIncoherent } = G.DaryaPersonalityEngine;
  // Every English riddle form from the joke pools must be flagged: the
  // why-did form, the why-do/why-are forms (the most common programming
  // and animal jokes), and the what-do-you-call pun form.
  assert.ok(
    isToneIncoherent(
      'Why did the coffee go to the doctor? Because it was latte.'
    )
  );
  assert.ok(
    isToneIncoherent(
      'Why do programmers prefer dark mode? Because light attracts bugs.'
    )
  );
  assert.ok(
    isToneIncoherent('Why are cows so good at maths? Because they have hooves.')
  );
  assert.ok(
    isToneIncoherent('What do you call a bear with no teeth? A gummy bear.')
  );
  assert.ok(isToneIncoherent('چرا کتاب ریاضی غمگین بود؟ چون مشکل زیادی داشت.'));
  // Caring or clarifying lines, and the ambiguous چراغ (lamp), must not
  // be flagged.
  assert.ok(!isToneIncoherent('I am here with you in this.'));
  assert.ok(!isToneIncoherent('چرا این موضوع برایت مهم است؟'));
  assert.ok(!isToneIncoherent('چراغ اتاق را خاموش کن.'));
});

test('response scorer: flags generic signals', () => {
  const { scoreReply } = G.DaryaResponseScorer;
  const good = scoreReply(
    'That sounds really hard. What part is weighing on you most?',
    {
      userLength: 30,
      seriousness: 0.4,
      recentBotMessages: []
    }
  );
  assert.ok(good.score >= 0.7, 'a reasonable reply scores well');

  const overloaded = scoreReply(
    'Why do you feel that? How did it start? What helps you? Where does it hurt?',
    {
      userLength: 30,
      seriousness: 0.3,
      recentBotMessages: []
    }
  );
  assert.ok(overloaded.score < 0.9, 'question overload lowers the score');
  assert.ok(overloaded.signals.includes('question_overload'));
});

test('response scorer: heavy turn without acknowledgment is penalized', () => {
  const { scoreReply } = G.DaryaResponseScorer;
  const result = scoreReply('What are you doing tomorrow?', {
    userLength: 30,
    seriousness: 0.8,
    recentBotMessages: []
  });
  assert.ok(result.signals.includes('heavy_turn_missing_ack'));
  assert.ok(result.score < 0.8);
});

test('response scorer: repeated opener is flagged', () => {
  const { scoreReply } = G.DaryaResponseScorer;
  const result = scoreReply('That sounds really hard. Let us slow down.', {
    userLength: 30,
    seriousness: 0.4,
    recentBotMessages: ['That sounds really hard. What happened next?']
  });
  assert.ok(result.signals.includes('opener_repeated'));
});

test('engine: new modules integrate without breaking both languages', () => {
  const fa = freshEngine(FA);
  assert.ok(fa.respond('سلام').length > 0);
  assert.ok(fa.conversationContext, 'FA engine builds a conversation context');
  assert.ok(fa.emotionTrajectory, 'FA engine builds an emotion trajectory');

  const en = freshEngine(EN);
  assert.ok(en.respond('hello there').length > 0);
  assert.ok(en.conversationContext, 'EN engine builds a conversation context');
  assert.ok(en.emotionTrajectory, 'EN engine builds an emotion trajectory');
});

test('engine: _pickVaried blocks riddle jokes on heavy turns', () => {
  // A heavy turn (grief disclosure) must never receive a riddle-style
  // joke line, even when the pool contains one: the personality-engine
  // tone gate prunes it before selection. On a light turn the same pool
  // still answers normally.
  const pool = [
    'Why did the coffee go to the doctor? Because it was latte.',
    'I am here with you in this.',
    'That sounds really hard. What part is weighing on you most?'
  ];

  const heavy = freshEngine(EN);
  heavy.memory.turnCount = 4;
  heavy.currentTurnSeriousness = 0.8;
  heavy.lastTurnNeedsCare = true;
  for (let i = 0; i < 30; i += 1) {
    const picked = heavy._pickVaried(pool, {
      ignoreQuestionBudget: true,
      trackQuestions: false
    });
    assert.notEqual(
      picked,
      pool[0],
      'riddle joke must never be picked on a heavy turn'
    );
  }

  const light = freshEngine(EN);
  light.memory.turnCount = 3;
  light.currentTurnSeriousness = 0.2;
  light.lastTurnNeedsCare = false;
  let sawJoke = false;
  for (let i = 0; i < 30; i += 1) {
    const picked = light._pickVaried(pool, {
      ignoreQuestionBudget: true,
      trackQuestions: false
    });
    if (picked === pool[0]) {
      sawJoke = true;
    }
  }
  assert.ok(sawJoke, 'light turns may still receive the riddle joke');
});

test('engine: _pickVaried avoids a recently used opener', () => {
  const engine = freshEngine(EN);
  engine.memory.turnCount = 2;
  engine.currentTurnSeriousness = 0.3;
  engine.lastTurnNeedsCare = false;
  // The pool shares the opener "That sounds really hard." across its
  // first two lines; the third line has a distinct opener.
  const pool = [
    'That sounds really hard. What happened next?',
    'That sounds really hard. Let us slow down.',
    'I hear you. What do you need right now?'
  ];
  engine.memory.rememberBotMessage('That sounds really hard. Tell me more.');
  for (let i = 0; i < 40; i += 1) {
    const picked = engine._pickVaried(pool, {
      ignoreQuestionBudget: true,
      trackQuestions: false
    });
    assert.notEqual(
      picked,
      pool[0],
      'a line whose opener was just used must not be picked'
    );
    assert.notEqual(
      picked,
      pool[1],
      'a line sharing the recently used opener must not be picked'
    );
  }
  // The distinct-opener line remains reachable and is picked: track the
  // picks across iterations instead of relying on memory state (recent
  // bot messages are only written by the full pipeline, not by direct
  // _pickVaried calls).
  let sawDistinctOpener = false;
  for (let i = 0; i < 40; i += 1) {
    const picked = engine._pickVaried(pool, {
      ignoreQuestionBudget: true,
      trackQuestions: false
    });
    if (picked === pool[2]) {
      sawDistinctOpener = true;
    }
  }
  assert.ok(
    sawDistinctOpener,
    'the distinct-opener line must remain reachable'
  );
});

test('engine: heavy-turn joke block works end to end in both languages', () => {
  // Full pipeline check: a grief disclosure is a heavy turn, so a
  // follow-up light request for a joke must not be answered with a
  // riddle-style line from the joke pool.
  for (const [lang, grief, jokeAsk] of [
    [FA, 'مامانم فوت کرده', 'یه جک بگو'],
    [EN, 'my mother just passed away', 'tell me a joke']
  ]) {
    const engine = freshEngine(lang);
    engine.respond(grief);
    const reply = engine.respond(jokeAsk);
    assert.ok(reply.length > 0, 'a reply should always be produced');
    assert.ok(
      !G.DaryaPersonalityEngine.isToneIncoherent(reply),
      `riddle joke must not follow a grief disclosure: ${reply}`
    );
  }
});

test('exercise: EN request offers the exercise with yes/no chips', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('breathing exercise');
  assert.ok(reply.length > 0, 'an offer reply is produced');
  assert.ok(
    engine._activeExercise && engine._activeExercise.id === 'breathing',
    'the breathing exercise is armed'
  );
  assert.ok(
    engine.lastTurnQuickReplies.length >= 2,
    'yes/no chips are attached for the UI'
  );
  assert.ok(!reply.includes('{'), 'no placeholder leaks into the offer');
});

test('exercise: affirmatives advance steps and completion releases state', () => {
  const engine = freshEngine(EN);
  engine.respond('breathing exercise');
  const steps = engine._activeExercise
    ? engine.lang.exerciseLibrary.breathing.steps.length
    : 0;
  assert.ok(steps >= 1, 'the exercise has steps to walk through');
  let lastReply = '';
  // Each step needs one affirmative; the final step says "say ok to
  // finish", and the ok after it fires the completion line. Loop with a
  // bounded guard until the exercise releases itself.
  let guard = 0;
  while (engine._activeExercise && guard < steps + 4) {
    lastReply = engine.respond('ok');
    assert.ok(lastReply.length > 0, 'each step produced a reply');
    assert.ok(
      !lastReply.includes('{'),
      `no placeholder leaks in a step reply: ${lastReply}`
    );
    guard += 1;
  }
  assert.ok(guard <= steps + 1, 'completion needs at most one extra ok');
  // After completion the exercise is released, so a further ok is
  // ordinary chat again.
  assert.equal(engine._activeExercise, null, 'exercise released on completion');
  assert.deepEqual(engine.lastTurnQuickReplies, [], 'chips cleared');
});

test('exercise: stop or decline releases the exercise gracefully', () => {
  const engine = freshEngine(EN);
  engine.respond('grounding exercise');
  assert.ok(engine._activeExercise, 'grounding exercise is armed');
  const reply = engine.respond('no thanks');
  assert.ok(reply.length > 0, 'a stop reply is produced');
  assert.equal(engine._activeExercise, null, 'exercise released on stop');
});

test('exercise: FA flow works end to end with Persian answers', () => {
  const engine = freshEngine(FA);
  const offer = engine.respond('تمرین تنفس');
  assert.ok(offer.length > 0, 'FA offer reply is produced');
  assert.ok(
    engine._activeExercise && engine._activeExercise.id === 'breathing',
    'FA breathing exercise is armed'
  );
  assert.ok(
    engine.lastTurnQuickReplies.includes('باشه'),
    'FA chips include the affirmative'
  );
  const step = engine.respond('باشه');
  assert.ok(step.length > 0, 'FA affirmative advances a step');
  const stop = engine.respond('بس کن');
  assert.ok(stop.length > 0, 'FA stop produces a release reply');
  assert.equal(engine._activeExercise, null, 'FA exercise released on stop');
});

test('exercise: unrelated chat does not trigger an exercise', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('i feel tired today');
  assert.equal(
    engine._activeExercise,
    null,
    'no exercise armed by ordinary chat'
  );
  assert.ok(reply.length > 0);
});

test('mood: EN check-in asks for a rating and records the answer', () => {
  const engine = freshEngine(EN);
  const ask = engine.respond('mood check');
  assert.ok(ask.length > 0, 'a rating request is produced');
  assert.ok(engine._pendingMoodRequest, 'a rating is pending');
  assert.ok(
    engine.lastTurnQuickReplies.length >= 5,
    'scale chips are attached for the UI'
  );
  const reflect = engine.respond('7');
  assert.ok(reflect.length > 0, 'a reflection is produced');
  assert.equal(engine._pendingMoodRequest, null, 'pending request cleared');
  assert.ok(
    !reflect.includes('{rating}'),
    `the rating placeholder is substituted: ${reflect}`
  );
  assert.equal(engine.memory.moodLog.length, 1, 'the mood is logged');
  assert.equal(engine.memory.moodLog[0].value, 7);
});

test('mood: FA check-in accepts Persian digits', () => {
  const engine = freshEngine(FA);
  engine.respond('حالم رو ثبت کن');
  const reflect = engine.respond('۸');
  assert.ok(reflect.length > 0, 'FA reflection is produced');
  assert.equal(engine.memory.moodLog.length, 1, 'FA mood is logged');
  assert.equal(engine.memory.moodLog[0].value, 8);
});

test('mood: out-of-scale answer releases gracefully without recording', () => {
  const engine = freshEngine(EN);
  engine.respond('mood check');
  const reply = engine.respond('eleventy');
  assert.ok(reply.length > 0, 'a release reply is produced');
  assert.equal(engine._pendingMoodRequest, null, 'pending request released');
  assert.equal(engine.memory.moodLog.length, 0, 'nothing recorded');
});

test('mood: summary reads back the arc with direction', () => {
  const engine = freshEngine(EN);
  // No data yet: the summary says so instead of crashing.
  const empty = engine.respond('how have i been feeling');
  assert.ok(empty.length > 0, 'empty summary still replies');
  engine.respond('mood check');
  engine.respond('3');
  engine.respond('mood check');
  engine.respond('7');
  const summary = engine.respond('how have i been feeling');
  assert.ok(summary.length > 0, 'summary reply is produced');
  assert.ok(!summary.includes('{'), `summary leaks no placeholder: ${summary}`);
  assert.equal(engine.memory.moodLog.length, 2, 'both moods are logged');
});

test('mood: ordinary chat never arms a pending mood request', () => {
  const engine = freshEngine(FA);
  engine.respond('درباره کارم حرف بزنیم');
  assert.equal(engine._pendingMoodRequest, null);
  assert.deepEqual(engine.lastTurnQuickReplies, []);
});

test('young-user guard: child age disclosure uses the age-appropriate pool', () => {
  // A 9-year-old's disclosure must be answered warmly and point to a
  // trusted adult; the adult pool line would assume self-reliance.
  for (const [lang, disclosure] of [
    [EN, 'i am 9 years old'],
    [FA, 'من ۹ سالمه']
  ]) {
    const engine = freshEngine(lang);
    const reply = engine.respond(disclosure);
    assert.equal(engine._userProfile.age, lang === EN ? '9' : '۹');
    const youngPool = lang.exerciseLibrary // any pool reference to confirm
      ? lang.userProfilePools.ageStoredYoung
      : [];
    assert.ok(youngPool && youngPool.length > 0, 'young pool exists');
    if (lang === EN) {
      // The pool has two phrasings: one says "trusted adult" literally,
      // the other says "grown-ups you trust". Both must pass.
      assert.match(
        reply,
        /trusted adult|grown-ups you trust/i,
        'EN child reply names a trusted adult'
      );
    } else {
      assert.match(
        reply,
        /بزرگ\u200c?سال|معلم/i,
        'FA child reply names an adult'
      );
    }
  }
});

test('young-user guard: adult age disclosure keeps the regular pool', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond('i am 24 years old');
  assert.equal(engine._userProfile.age, '24');
  assert.ok(
    !/trusted adult/i.test(reply),
    'an adult disclosure does not get the child reply'
  );
});

test('safety pool: crisis turn carries verified hotline numbers', () => {
  // Acute crisis language triggers the safety rule; the reply must offer
  // at least one concrete, verified hotline number in the active
  // language's region.
  const en = freshEngine(EN);
  const enReply = en.respond('i want to end my life right now');
  assert.ok(
    /\b988\b|\b116\s*123\b/.test(enReply),
    `EN crisis reply carries a hotline: ${enReply}`
  );

  const fa = freshEngine(FA);
  // The exact rule vocabulary («می‌خوام به زندگیم پایان بدم») is used so
  // the safety rule matches deterministically.
  const faReply = fa.respond('می‌خوام به زندگیم پایان بدم');
  // Persian digits are not word-boundary aware, so the match uses the
  // digit sequences directly.
  assert.ok(
    /۱۲۳|۱۴۸۰/.test(faReply),
    `FA crisis reply carries a hotline: ${faReply}`
  );
});

test("question recall: FA quotes the user's last question from memory", () => {
  // T1·7 from the replay: «یادته اصلاً آخرین سوالی که ازت پرسیدم چی بود؟!»
  // must answer from conversation memory by quoting the last question
  // back, never an evasive "I do not have an answer" line.
  const engine = freshEngine(FA);
  engine.respond(
    'نمی‌دونم... اما دوست دارم برام یک جک/جوک/لطیفه بگی یا حتی یک سوال جالب بپرسی؟!'
  );
  engine.respond('خاک تو سرت احمق...');
  const reply = engine.respond(
    'یادته اصلاً آخرین سوالی که ازت پرسیدم چی بود؟!'
  );
  assert.match(
    reply,
    /جک|جوک|لطیفه/,
    `FA recall quotes the prior question: ${reply}`
  );
  assert.doesNotMatch(
    reply,
    /جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم/,
    'no evasive line'
  );
});

test("question recall: EN quotes the user's last question from memory", () => {
  const engine = freshEngine(EN);
  engine.respond('can you tell me a joke or ask me something interesting?');
  engine.respond('you are so dumb');
  const reply = engine.respond(
    'do you remember what the last question I asked you was?'
  );
  assert.match(
    reply,
    /joke|interesting/,
    `EN recall quotes the prior question: ${reply}`
  );
  assert.doesNotMatch(reply, /no ready answer|do not have/, 'no evasive line');
});

test('question recall: honest none-pool when no question was asked', () => {
  // The user asks about a question that was never asked: Darya says so
  // plainly instead of inventing one.
  const fa = freshEngine(FA);
  const faReply = fa.respond('یادته آخرین سوالی که پرسیدم چی بود؟');
  assert.match(
    faReply,
    /سؤال|سوال/,
    `FA none-reply mentions questions: ${faReply}`
  );
  assert.doesNotMatch(
    faReply,
    /جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)/,
    'no evasive line'
  );

  const en = freshEngine(EN);
  const enReply = en.respond('what was my last question?');
  assert.match(
    enReply,
    /ask|question/i,
    `EN none-reply acknowledges the ask: ${enReply}`
  );
  assert.doesNotMatch(
    enReply,
    /no ready answer|do not have/,
    'no evasive line'
  );
});

test('knowledge expansion: FA dataset request is acknowledged, not hijacked by work rule', () => {
  // T2·26 from the replay: the rich-dataset request contains «کار» inside
  // «این کار رو», which used to hijack the turn into the work rule
  // ("کار فقط ساعت‌ها نیست..."). The reply must acknowledge the request
  // and invite a topic instead.
  const engine = freshEngine(FA);
  const reply = engine.respond(
    'تو باید دیتاست خیلی خیلی خیلی غنی‌ای از سولات خوب و مفید و کنجاو داشته باشی برای کاربر تا خودت رو به خوبی و ریزبینانه و زیرکانه واکاوی کنه... این کار رو به خوبی باید انجام بدی، باشه؟! فهمیدی؟!'
  );
  assert.match(
    reply,
    /قفسه|آفلاین|موضوع/,
    `FA dataset reply acknowledges: ${reply}`
  );
  assert.doesNotMatch(reply, /ساعت‌ها|کار فقط/, 'work-rule hijack gone');
});

test('knowledge expansion: EN dataset request is acknowledged', () => {
  const engine = freshEngine(EN);
  const reply = engine.respond(
    'you need a really rich dataset of good questions and useful facts to improve yourself. got it?'
  );
  assert.match(
    reply,
    /offline|shelf|topic/i,
    `EN dataset reply acknowledges: ${reply}`
  );
});

test('knowledge expansion: plain movie requests are never hijacked', () => {
  // Negative control: a concrete content request (movie list) must still
  // reach the factual layer, not the knowledge-expansion acknowledgment.
  const en = freshEngine(EN);
  const enReply = en.respond('give me a list of good movies');
  assert.match(
    enReply,
    /Close-Up|Kiarostami|cinema/i,
    `EN movies stay factual: ${enReply}`
  );

  const fa = freshEngine(FA);
  const faReply = fa.respond('چند فیلم حال خوب کن معرفی کن');
  assert.match(
    faReply,
    /فیلم|زندگی زیباست/i,
    `FA movies stay factual: ${faReply}`
  );
});
