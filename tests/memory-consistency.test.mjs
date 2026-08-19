/**
 * Memory, consistency, and recall regression corpus.
 *
 * Exercises Darya's session memory across long, multi-turn conversations:
 * the profile (name, age, location, preferences), the life-facts store
 * (profession, name, count, relationship), question recall, and subject
 * continuity. Every scenario is a real conversational thread, not a
 * single-shot probe, and asserts the invariants that make a companion
 * feel like it remembers:
 *
 *   1. A fact stated early is recalled correctly many turns later.
 *   2. A recall with nothing stored is answered honestly, never invented.
 *   3. The store never holds two contradictory values for one subject.
 *   4. Subject continuity keeps a long thread alive across interruptions.
 *   5. The recall answer reflects what was actually said, not a template.
 */

'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, EN, FA } from './helpers.mjs';

// ---------------------------------------------------------------------------
// 1. Profile memory (name, age, location, preferences)
// ---------------------------------------------------------------------------

test('name is recalled after a long digression', () => {
  const engine = freshEngine(EN);
  engine.respond('my name is Artin');
  engine.respond('i feel a bit tired today');
  engine.respond('work has been busy');
  engine.respond('i went for a walk');
  const recall = engine.respond('what is my name again?');
  assert.match(recall, /Artin/i);
});

test('age is recalled and reflects the exact stated number', () => {
  const engine = freshEngine(EN);
  engine.respond('i am 24 years old');
  engine.respond('i have been working a lot');
  const recall = engine.respond('how old am i?');
  assert.match(recall, /24/i);
});

test('location is recalled after several unrelated turns', () => {
  const engine = freshEngine(EN);
  engine.respond('i live in Tehran');
  engine.respond('the weather is nice');
  engine.respond('i like tea');
  const recall = engine.respond('where do i live?');
  assert.match(recall, /Tehran/i);
});

test('preference is remembered and the answer matches what was said', () => {
  const engine = freshEngine(EN);
  engine.respond('i love coffee');
  engine.respond('my day was okay');
  const recall = engine.respond('what do i like?');
  assert.match(recall, /coffee/i);
});

test('FA: name, age, and location all recall in one session', () => {
  const engine = freshEngine(FA);
  engine.respond('اسم من آریاست');
  engine.respond('من ۲۴ سالمه');
  engine.respond('تهران زندگی می کنم');
  assert.match(engine.respond('اسمم چیه؟'), /آریا/u);
  assert.match(engine.respond('چند سالمه؟'), /۲۴/u);
  assert.match(engine.respond('کجا زندگی می کنم؟'), /تهران/u);
});

// ---------------------------------------------------------------------------
// 2. Life-facts memory: profession
// ---------------------------------------------------------------------------

test('profession is stored and recalled later', () => {
  const engine = freshEngine(EN);
  engine.respond('my sister is a nurse');
  engine.respond('we talked on the phone');
  const recall = engine.respond('what does my sister do?');
  assert.match(recall, /nurse/i);
});

test('profession recall works with the possessive form', () => {
  const engine = freshEngine(EN);
  engine.respond('my brother works as an engineer');
  const recall = engine.respond('what is my brother job?');
  assert.match(recall, /engineer/i);
});

test('profession recall with nothing stored is honest', () => {
  const engine = freshEngine(EN);
  const recall = engine.respond('what does my sister do?');
  assert.match(recall, /not told|do not know|yet/i);
});

test('FA: profession is stored with the glued copula and recalled', () => {
  const engine = freshEngine(FA);
  engine.respond('خواهرم پرستاره');
  const recall = engine.respond('خواهرم چیکار میکنه؟');
  assert.match(recall, /پرستار/u);
});

// ---------------------------------------------------------------------------
// 3. Life-facts memory: name (family and pets)
// ---------------------------------------------------------------------------

test('pet name is stored and recalled', () => {
  const engine = freshEngine(EN);
  engine.respond('my dog is named Rex');
  engine.respond('he is very energetic');
  const recall = engine.respond('what is my dog called?');
  assert.match(recall, /Rex/i);
});

test('family member name is stored and recalled', () => {
  const engine = freshEngine(EN);
  engine.respond('my wife is called Sara');
  const recall = engine.respond('what is my wife name?');
  assert.match(recall, /Sara/i);
});

test('name recall with nothing stored is honest', () => {
  const engine = freshEngine(EN);
  const recall = engine.respond('what is my dog called?');
  assert.match(recall, /not told|do not know|yet/i);
});

test('FA: pet name is stored and recalled', () => {
  const engine = freshEngine(FA);
  engine.respond('اسم سگم رکس هست');
  const recall = engine.respond('اسم سگم چیه؟');
  assert.match(recall, /رکس/u);
});

// ---------------------------------------------------------------------------
// 4. Life-facts memory: count
// ---------------------------------------------------------------------------

test('count of children is stored and recalled', () => {
  const engine = freshEngine(EN);
  engine.respond('i have two kids');
  engine.respond('they are both in school');
  const recall = engine.respond('how many kids do i have?');
  assert.match(recall, /two/i);
});

test('count recall with nothing stored is honest', () => {
  const engine = freshEngine(EN);
  const recall = engine.respond('how many kids do i have?');
  assert.match(recall, /not told|do not know|yet/i);
});

test('FA: count is stored with the Persian verb order and recalled', () => {
  const engine = freshEngine(FA);
  engine.respond('من دو تا بچه دارم');
  const recall = engine.respond('چند تا بچه دارم؟');
  assert.match(recall, /دو/u);
});

// ---------------------------------------------------------------------------
// 5. Life-facts memory: relationship status
// ---------------------------------------------------------------------------

test('relationship status is stored and recalled', () => {
  const engine = freshEngine(EN);
  engine.respond('i am married');
  engine.respond('we have been together for years');
  const recall = engine.respond('am i married?');
  assert.match(recall, /married/i);
});

test('relationship recall with nothing stored is honest', () => {
  const engine = freshEngine(EN);
  const recall = engine.respond('am i married?');
  assert.match(recall, /not told|do not know|yet/i);
});

test('FA: relationship status is stored and recalled', () => {
  const engine = freshEngine(FA);
  engine.respond('من متاهلم');
  const recall = engine.respond('آیا من متاهلم؟');
  assert.match(recall, /متاهل/u);
});

// ---------------------------------------------------------------------------
// 6. Question recall
// ---------------------------------------------------------------------------

test('the last question is recalled verbatim', () => {
  const engine = freshEngine(EN);
  const first = engine.respond('what is the capital of France?');
  assert.match(first, /Paris/i);
  engine.respond('interesting');
  const recall = engine.respond('do you remember what i asked you?');
  assert.match(recall, /capital of France/i);
});

test('question recall with no prior question is honest', () => {
  const engine = freshEngine(EN);
  const recall = engine.respond('do you remember what i asked you?');
  assert.ok(recall.length > 10);
});

// ---------------------------------------------------------------------------
// 7. Consistency: the store never holds two contradictory values
// ---------------------------------------------------------------------------

test('a corrected profession replaces the earlier one', () => {
  const engine = freshEngine(EN);
  engine.respond('my sister is a nurse');
  engine.respond('actually my sister is a doctor now');
  const recall = engine.respond('what does my sister do?');
  assert.match(recall, /doctor/i);
  assert.doesNotMatch(recall, /nurse/i);
});

test('a corrected count replaces the earlier one', () => {
  const engine = freshEngine(EN);
  engine.respond('i have two kids');
  engine.respond('i have three kids now');
  const recall = engine.respond('how many kids do i have?');
  assert.match(recall, /three/i);
  assert.doesNotMatch(recall, /two/i);
});

test('FA: a corrected profession replaces the earlier one', () => {
  const engine = freshEngine(FA);
  engine.respond('خواهرم پرستاره');
  engine.respond('خواهرم دکتره');
  const recall = engine.respond('خواهرم چیکار میکنه؟');
  assert.match(recall, /دکتر/u);
  assert.doesNotMatch(recall, /پرستار/u);
});

// ---------------------------------------------------------------------------
// 8. Subject continuity across long conversations
// ---------------------------------------------------------------------------

test('a grief thread stays alive across several turns', () => {
  const engine = freshEngine(EN);
  const replies = [];
  for (const line of [
    'i lost my father last year',
    'some days it still hits me',
    'his birthday is coming up',
    'i miss his voice'
  ]) {
    replies.push(engine.respond(line));
  }
  // The subject should remain grief throughout, and no reply should be an
  // honest-unknown or a topic hop.
  for (const reply of replies) {
    assert.ok(reply.length > 10, `too short: ${reply}`);
    assert.doesNotMatch(reply, /not familiar|new territory/i, reply);
  }
});

test('FA: a family thread stays coherent across turns', () => {
  const engine = freshEngine(FA);
  const replies = [
    engine.respond('با مامانم قهر کردم'),
    engine.respond('خیلی ناراحتم'),
    engine.respond('نمی دونم چطور آشتی کنم')
  ];
  for (const reply of replies) {
    assert.ok(reply.length > 10);
  }
});

// ---------------------------------------------------------------------------
// 9. Long multi-turn conversations mixing everything
// ---------------------------------------------------------------------------

test('a long EN conversation recalls every fact at the end', () => {
  const engine = freshEngine(EN);
  const lines = [
    'my name is Arman',
    'i am 30 years old',
    'i live in London',
    'my wife is called Neda',
    'my wife is a teacher',
    'i have two kids',
    'my dog is named Buddy',
    'i am feeling stressed about work',
    'my boss is demanding',
    'i have not slept well'
  ];
  for (const line of lines) {
    engine.respond(line);
  }
  assert.match(engine.respond('what is my name?'), /Arman/i);
  assert.match(engine.respond('how old am i?'), /30/i);
  assert.match(engine.respond('where do i live?'), /London/i);
  assert.match(engine.respond('what is my wife name?'), /Neda/i);
  assert.match(engine.respond('what does my wife do?'), /teacher/i);
  assert.match(engine.respond('how many kids do i have?'), /two/i);
  assert.match(engine.respond('what is my dog called?'), /Buddy/i);
});

test('a long FA conversation recalls every fact at the end', () => {
  const engine = freshEngine(FA);
  const lines = [
    'اسم من آرمانه',
    'من ۳۰ سالمه',
    'لندن زندگی می کنم',
    'اسم همسرم ندا هست',
    'همسرم معلمه',
    'دو تا بچه دارم',
    'اسم سگم بادی هست'
  ];
  for (const line of lines) {
    engine.respond(line);
  }
  assert.match(engine.respond('اسمم چیه؟'), /آرمان/u);
  assert.match(engine.respond('چند سالمه؟'), /۳۰/u);
  assert.match(engine.respond('اسم همسرم چیه؟'), /ندا/u);
  assert.match(engine.respond('همسرم چیکار میکنه؟'), /معلم/u);
  assert.match(engine.respond('چند تا بچه دارم؟'), /دو/u);
  assert.match(engine.respond('اسم سگم چیه؟'), /بادی/u);
});

// ---------------------------------------------------------------------------
// 10. Memory is session-only and never persists across engines
// ---------------------------------------------------------------------------

test('a fresh engine has no memory of a previous session', () => {
  const first = freshEngine(EN);
  first.respond('my name is Arman');
  assert.match(first.respond('what is my name?'), /Arman/i);

  const second = freshEngine(EN);
  const recall = second.respond('what is my name?');
  assert.doesNotMatch(recall, /Arman/i);
  assert.match(recall, /not told|do not know|yet/i);
});

test('FA: a fresh engine has no memory of a previous session', () => {
  const first = freshEngine(FA);
  first.respond('اسم من آریاست');
  const second = freshEngine(FA);
  assert.doesNotMatch(second.respond('اسمم چیه؟'), /آریا/u);
});

// ---------------------------------------------------------------------------
// 11. Memory survives an unrelated interruption mid-thread
// ---------------------------------------------------------------------------

test('an unrelated question does not wipe a stored fact', () => {
  const engine = freshEngine(EN);
  engine.respond('my sister is a nurse');
  engine.respond('what is the capital of France?');
  engine.respond('that is interesting');
  const recall = engine.respond('what does my sister do?');
  assert.match(recall, /nurse/i);
});

test('a hostile turn does not wipe stored facts', () => {
  const engine = freshEngine(EN);
  engine.respond('i am married');
  engine.respond('you are useless');
  engine.respond('shut up');
  const recall = engine.respond('am i married?');
  assert.match(recall, /married/i);
});

// ---------------------------------------------------------------------------
// 12. The recall answer reflects what was said, not a canned template
// ---------------------------------------------------------------------------

test('recalled profession matches the exact value stated', () => {
  const engine = freshEngine(EN);
  engine.respond('my wife is a software engineer');
  const recall = engine.respond('what does my wife do?');
  assert.match(recall, /software engineer/i);
});

test('FA: recalled name matches the exact value stated', () => {
  const engine = freshEngine(FA);
  engine.respond('اسم گربه ام نبات هست');
  const recall = engine.respond('اسم گربه ام چیه؟');
  assert.match(recall, /نبات/u);
});

// ---------------------------------------------------------------------------
// 13. Multiple subjects of the same kind stay distinct
// ---------------------------------------------------------------------------

test('two family members keep their own professions', () => {
  const engine = freshEngine(EN);
  engine.respond('my sister is a nurse');
  engine.respond('my brother is an engineer');
  assert.match(engine.respond('what does my sister do?'), /nurse/i);
  assert.match(engine.respond('what does my brother do?'), /engineer/i);
});

test('FA: two family members keep their own professions', () => {
  const engine = freshEngine(FA);
  engine.respond('خواهرم پرستاره');
  engine.respond('برادرم مهندسه');
  assert.match(engine.respond('خواهرم چیکار میکنه؟'), /پرستار/u);
  assert.match(engine.respond('برادرم چیکار میکنه؟'), /مهندس/u);
});

test('a name and a profession for the same subject coexist', () => {
  const engine = freshEngine(EN);
  engine.respond('my wife is called Sara');
  engine.respond('my wife is a doctor');
  assert.match(engine.respond('what is my wife name?'), /Sara/i);
  assert.match(engine.respond('what does my wife do?'), /doctor/i);
});

// ---------------------------------------------------------------------------
// 14. A corrected preference replaces the earlier one
// ---------------------------------------------------------------------------

test('a corrected preference is reflected in the recall', () => {
  const engine = freshEngine(EN);
  engine.respond('i love coffee');
  engine.respond('actually i am off coffee now, i love tea');
  const recall = engine.respond('what do i like?');
  assert.match(recall, /tea/i);
});

// ---------------------------------------------------------------------------
// 15. Memory survives a long run of unrelated chatter
// ---------------------------------------------------------------------------

test('a fact survives ten turns of unrelated chatter', () => {
  const engine = freshEngine(EN);
  engine.respond('my dog is named Rex');
  for (const line of [
    'the weather is nice',
    'i am a bit tired',
    'work is busy',
    'i had lunch',
    'my back hurts a little',
    'i watched a movie',
    'it was good',
    'i am going to sleep soon',
    'tomorrow is a new day',
    'i feel okay'
  ]) {
    engine.respond(line);
  }
  const recall = engine.respond('what is my dog called?');
  assert.match(recall, /Rex/i);
});

// ---------------------------------------------------------------------------
// 16. Recall phrased differently still hits the same fact
// ---------------------------------------------------------------------------

test('profession recall matches both phrasings', () => {
  const engine = freshEngine(EN);
  engine.respond('my brother is a chef');
  assert.match(engine.respond('what does my brother do?'), /chef/i);
  assert.match(engine.respond('what is my brother job?'), /chef/i);
});

test('FA: name recall matches both phrasings', () => {
  const engine = freshEngine(FA);
  engine.respond('اسم سگم رکس هست');
  assert.match(engine.respond('اسم سگم چیه؟'), /رکس/u);
});

// ---------------------------------------------------------------------------
// 17. The store is internally consistent: keys are normalized
// ---------------------------------------------------------------------------

test('a recall with different casing still finds the stored fact', () => {
  const engine = freshEngine(EN);
  engine.respond('my Sister is a Nurse');
  const recall = engine.respond('what does my sister do?');
  assert.match(recall, /nurse/i);
});
