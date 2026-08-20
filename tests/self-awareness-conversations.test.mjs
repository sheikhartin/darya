/**
 * Self-awareness, context-awareness, memory, and response-variety suite.
 *
 * This suite locks in the transcript-audit fixes for Darya:
 *
 * 1. Self-awareness: repository, download, version, memory, and purpose
 *    questions are answered with the real project facts instead of an
 *    evasive source pointer or a random reflective question.
 *
 * 2. Context-awareness: a compliment plus "one more" after a joke keeps
 *    telling jokes, "shocked" is read as surprise not fear, and a bare
 *    "another" continues the remembered entertainment kind.
 *
 * 3. Memory: name, age, preference, and life-fact disclosures are stored
 *    and recalled within the session, including after a topic shift.
 *
 * 4. Response variety: greetings and coding questions rotate and the
 *    starter-path and best-language questions no longer share one canned
 *    answer.
 *
 * 5. Meaningful bilingual output: every scenario produces a real, on-topic
 *    reply in Persian or English, never an evasive or canned dodge.
 *
 * The scenario fixtures under tests/scenarios/{self,context,memory,
 * variety,knowledge,affection,wild}-*.json carry per-turn `topic` and
 * `mustMatch` expectations that this runner enforces.
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';

import { freshEngine, read, seededRandom, FA, EN } from './helpers.mjs';

/** Evasive lines that must never appear when the engine knows the topic. */
const EVASIVE =
  /(?:I do not (?:know|have)|don'?t (?:know|have)|no (?:ready )?answer|not familiar|outside my|راستش جواب|جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم|آشنایی ندارم|از دانش من خارج|خوب نمی‌شناسم)/iu;

/** The canned dodge lines the transcript flagged specifically. */
const DODGE =
  /(?:این انتخاب به شرایط خودت|هر مسیری که بروی|کوتاه بود|لازم نیست همه‌چیز را یک‌باره حل کنی|همین که این را گفتی|این سؤال به خودی خود جالب)/iu;

/** Self/knowledge/memory scenarios must never fall to an evasive line. */
const FACTUAL_PREFIX =
  /^(?:self-|fa-self-|knowledge-|fa-knowledge-|memory-|fa-memory-)/u;

/** The exact new fixtures exercised by this suite. */
const SCENARIOS = [
  'affection-petname.json',
  'context-joke-chain.json',
  'context-praise-and-another.json',
  'context-reference.json',
  'context-topic-switch.json',
  'fa-affection-petname.json',
  'fa-context-joke-chain.json',
  'fa-context-praise-and-another.json',
  'fa-context-reference.json',
  'fa-context-topic-switch.json',
  'fa-knowledge-javascript.json',
  'fa-knowledge-python.json',
  'fa-memory-age-after-shift.json',
  'fa-memory-lifefact.json',
  'fa-memory-name-age.json',
  'fa-memory-preference.json',
  'fa-self-download.json',
  'fa-self-memory.json',
  'fa-self-purpose.json',
  'fa-self-repo.json',
  'fa-self-version.json',
  'fa-variety-coding.json',
  'fa-variety-greeting.json',
  'fa-wild-download-store.json',
  'fa-wild-insult-apology.json',
  'fa-wild-misread-correction.json',
  'fa-wild-mixed-session.json',
  'fa-wild-shock-not-fear.json',
  'knowledge-javascript.json',
  'knowledge-python.json',
  'memory-age-after-shift.json',
  'memory-lifefact.json',
  'memory-name-age.json',
  'memory-preference.json',
  'self-download.json',
  'self-memory.json',
  'self-purpose.json',
  'self-repo.json',
  'self-version.json',
  'variety-coding.json',
  'variety-greeting.json',
  'wild-download-store.json',
  'wild-insult-apology.json',
  'wild-misread-correction.json',
  'wild-mixed-session.json',
  'wild-shock-not-fear.json'
];

test('scenario fixtures carry full metadata and multiple turns', () => {
  for (const file of SCENARIOS) {
    const scenario = JSON.parse(read(`tests/scenarios/${file}`));
    assert.ok(scenario.name, `${file}: missing name`);
    assert.ok(scenario.language, `${file}: missing language`);
    assert.ok(scenario.turns.length >= 2, `${file}: has fewer than 2 turns`);
    assert.ok(
      scenario.turns.every(
        (turn) => turn.dialogueAct && turn.text && turn.intent
      ),
      `${file}: every turn must have dialogueAct, text, and intent`
    );
    assert.ok(scenario.expected, `${file}: missing expected`);
    assert.ok(scenario.expected.finalTurn, `${file}: missing finalTurn`);
    assert.ok(scenario.expected.behavior, `${file}: missing behavior`);
  }
});

test('scenario fixtures route correctly and answer meaningfully', () => {
  const restore = seededRandom(0x5eed);
  try {
    for (const file of SCENARIOS) {
      const scenario = JSON.parse(read(`tests/scenarios/${file}`));
      const lang = scenario.language === 'fa' ? FA : EN;
      const engine = freshEngine(lang);
      const factual = FACTUAL_PREFIX.test(file);
      const routed = [];
      const replies = scenario.turns.map((turn) => {
        const reply = engine.respond(turn.text);
        routed.push([...engine.currentTurnTopics]);
        return reply;
      });
      scenario.turns.forEach((turn, i) => {
        const label = `${file}:${turn.text}`;
        assert.ok(replies[i].length > 4, `${label}: empty reply`);
        if (factual) {
          assert.doesNotMatch(replies[i], EVASIVE, `${label}: evasive`);
          assert.doesNotMatch(replies[i], DODGE, `${label}: dodge`);
        }
        if (turn.mustMatch) {
          assert.match(
            replies[i],
            new RegExp(turn.mustMatch, 'iu'),
            `${label}: "${replies[i].split('\n')[0]}"`
          );
        }
        if (turn.topic) {
          assert.ok(
            routed[i].includes(turn.topic),
            `${label}: expected topic ${turn.topic}, got [${routed[i]}]`
          );
        }
      });
      if (scenario.avoid) {
        replies.forEach((reply, i) => {
          assert.doesNotMatch(
            reply,
            new RegExp(scenario.avoid, 'iu'),
            `${file}:${scenario.turns[i].text}: must avoid /${scenario.avoid}/`
          );
        });
      }
    }
  } finally {
    restore();
  }
});

test('repository question answers with the real GitHub URL', () => {
  for (const [text, lang] of [
    ['مخزن کدت کجاست؟', FA],
    ['از کجا دانلودت کنم؟', FA],
    ['where is your code repo?', EN],
    ['where can i download you?', EN]
  ]) {
    const engine = freshEngine(lang);
    const reply = engine.respond(text);
    assert.match(reply, /github\.com\/sheikhartin\/darya/iu, text);
  }
});

test('version question answers from the shipped version constant', () => {
  for (const [text, lang] of [
    ['نسخه تو چنده؟', FA],
    ['what version are you?', EN]
  ]) {
    const engine = freshEngine(lang);
    const reply = engine.respond(text);
    assert.match(reply, /\d+\.\d+\.\d+/u, text);
    assert.doesNotMatch(reply, EVASIVE, text);
  }
});

test('javascript and python questions answer factually, not with starter advice', () => {
  const cases = [
    ['جاوااسکریپت چیه؟', FA, /(?:مرورگر|وب|تعاملی)/u],
    ['پایتون چیه؟', FA, /(?:زبان|داده|هوش مصنوعی)/u],
    ['what is javascript?', EN, /(?:browser|web|interactive)/iu],
    ['what is python?', EN, /(?:language|data|ai)/iu]
  ];
  for (const [text, lang, must] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(text);
    assert.match(reply, must, text);
    assert.doesNotMatch(reply, EVASIVE, text);
  }
});

test('coding advice varies: starter path and best language differ', () => {
  for (const lang of [FA, EN]) {
    const engine = freshEngine(lang);
    const starter = engine.respond(
      lang.code === 'fa'
        ? 'چطور برنامه‌نویسی رو شروع کنم؟'
        : 'how do i start programming?'
    );
    const best = engine.respond(
      lang.code === 'fa'
        ? 'بهترین زبان برنامه‌نویسی چیه؟'
        : 'what is the best programming language?'
    );
    assert.notEqual(starter, best, `${lang.code}: answers must differ`);
    assert.doesNotMatch(starter, EVASIVE, `${lang.code} starter`);
    assert.doesNotMatch(best, EVASIVE, `${lang.code} best`);
  }
});

test('greeting pool rotates instead of repeating verbatim', () => {
  for (const [texts, lang] of [
    [['سلام', 'سلام دوباره', 'درود'], FA],
    [['hello there', 'hello again', 'hi'], EN]
  ]) {
    const engine = freshEngine(lang);
    const replies = texts.map((text) => engine.respond(text));
    assert.ok(
      new Set(replies).size >= 2,
      `${lang.code}: greetings must vary, got all identical`
    );
  }
});

test('sequential joke requests keep telling fresh jokes', () => {
  for (const [texts, lang] of [
    [['یه جوک بگو', 'یکی دیگه', 'بازم'], FA],
    [['tell me a joke', 'another one', 'one more'], EN]
  ]) {
    const engine = freshEngine(lang);
    const replies = texts.map((text) => engine.respond(text));
    assert.ok(
      new Set(replies).size === 3,
      `${lang.code}: jokes must differ across turns`
    );
  }
});

test('a compliment plus one more after a joke still delivers a joke', () => {
  const faEngine = freshEngine(FA);
  faEngine.respond('یه جوک بگو');
  const faReply = faEngine.respond('آفرین به هوشت! شوکه شدم! یکی دیگه بگو');
  assert.doesNotMatch(faReply, /(?:ترس|می‌شنوم که|نگران)/iu);
  assert.doesNotMatch(faReply, /بازخورد/u);

  const enEngine = freshEngine(EN);
  enEngine.respond('tell me a joke');
  const enReply = enEngine.respond('nice one! tell me another');
  assert.doesNotMatch(enReply, /(?:scared|afraid|feedback)/iu);
});

test('shocked is read as surprise, not a fear disclosure', () => {
  const faEngine = freshEngine(FA);
  const faReply = faEngine.respond('وای شوکه شدم که اینو بلدی!');
  assert.notEqual(faEngine.lastDetectedEmotion, 'fear');
  assert.doesNotMatch(faReply, /(?:ترس|وحشت|می‌ترس|نگران|اضطراب)/iu);

  const enEngine = freshEngine(EN);
  const enReply = enEngine.respond('i am shook that you knew that!');
  assert.doesNotMatch(enReply, /(?:scared|terrified|afraid|fear|anxious)/iu);
});

test('pet-name affection is acknowledged warmly, not read as work', () => {
  for (const [text, lang] of [
    ['تو عسل منی', FA],
    ['تو عشق منی', FA],
    ['you are my honey', EN],
    ['you are mine', EN]
  ]) {
    const engine = freshEngine(lang);
    engine.respond(text);
    assert.ok(
      engine.currentTurnTopics.includes('affection'),
      `${text}: routed to [${engine.currentTurnTopics}]`
    );
  }
});

test('memory recalls survive a topic shift and a misread correction is accepted', () => {
  const engine = freshEngine(FA);
  engine.respond('من ۳۱ سالمه');
  engine.respond('یه فیلم خوب معرفی کن');
  const age = engine.respond('من چند سالمه؟');
  assert.match(age, /۳۱|31/u);

  const engine2 = freshEngine(EN);
  engine2.respond('what do you think about python?');
  const correction = engine2.respond('you misunderstood me');
  assert.ok(engine2.currentTurnTopics.includes('misread_correction'));
  assert.ok(correction.length > 4);
});
