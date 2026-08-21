import test from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, EN, FA } from './helpers.mjs';

const EVASIVE =
  /not familiar|new territory|beyond what i know|no ready answer|خارج از (?:دانش|حیطه)|اطلاعات کافی ندارم/iu;

const RELIGION_CASES = [
  [EN, 'explain Islam respectfully', /Quran|Muhammad|prayer|Muslims/i],
  [EN, 'what do Christians believe', /Jesus|Bible|Christian/i],
  [EN, 'explain Judaism respectfully', /Torah|Jewish|Talmud/i],
  [
    EN,
    'what is the difference between Sunni and Shia',
    /leadership|Imam|caliph|Quran/i
  ],
  [EN, 'what is Zoroastrianism', /Ahura Mazda|Avesta|Iranian|fire/i],
  [EN, 'explain Sikh beliefs', /Guru|Punjab|equality|langar/i],
  [EN, 'what is the Bahai faith', /Iran|humanity|Baha|education/i],
  [
    EN,
    'compare Hinduism and Buddhism respectfully',
    /karma|Buddh|Hindu|liberation/i
  ],
  [
    EN,
    'compare Islam Christianity and Judaism',
    /Abrahamic|Jesus|prophecy|revelation/i
  ],
  [
    EN,
    'what is the difference between atheist and agnostic',
    /belief|knowledge|unknown/i
  ],
  [
    EN,
    'can someone be spiritual but not religious',
    /spiritual|religion|meaning/i
  ],
  [
    EN,
    'how should I compare religious texts',
    /genre|language|interpret|Quran/i
  ],
  [FA, 'اسلام را بی طرفانه توضیح بده', /قرآن|محمد|نماز|مسلمان/u],
  [FA, 'مسیحیان به چه باور دارند', /عیسی|کتاب مقدس|مسیح/u],
  [FA, 'یهودیت را بی طرفانه توضیح بده', /تورات|تلمود|یهودی/u],
  [FA, 'فرق شیعه و سنی بی طرفانه چیه', /رهبری|امامت|خلافت|قرآن/u],
  [FA, 'دین زرتشتی را توضیح بده', /اهورامزدا|اوستا|آتش|ایران/u],
  [FA, 'دین سیک چیست', /گورو|پنجاب|برابری|لنگر/u],
  [FA, 'مقایسه بی طرفانه هندوئیسم و بودیسم', /کارما|بودیسم|هندوئیسم/u],
  [FA, 'فرق خداناباوری و ندانم گرایی چیه', /باور|دانش|خدا/u],
  [FA, 'فرق دین و معنویت چیه', /دین|معنویت|معنا/u],
  [FA, 'چطور متون دینی را مقایسه کنم', /زبان|تفسیر|قرآن|تورات/u]
];

for (const [index, [language, prompt, expected]] of RELIGION_CASES.entries()) {
  test(`religion knowledge ${index + 1}`, () => {
    const engine = freshEngine(language);
    engine.respond(index % 2 ? 'recommend a mystery book' : 'امروز خسته‌ام');
    const reply = engine.respond(prompt);
    assert.ok(reply.length > 120, `${prompt}: ${reply}`);
    assert.doesNotMatch(reply, EVASIVE, `${prompt}: ${reply}`);
    assert.match(reply, expected, `${prompt}: ${reply}`);
    assert.doesNotMatch(reply, /best religion|دین برتر|همه.*بد|all.*evil/iu);
  });
}

const LEGAL_CASES = [
  [EN, 'I live in Iran, can discussing religion get me arrested'],
  [EN, 'is changing religion legal and safe in Iran or could I go to jail'],
  [EN, 'could a religious post cause legal trouble in Iran'],
  [EN, 'I am atheist in Iran, is it safe and legal to say it publicly'],
  [FA, 'من ایران زندگی می کنم درباره دین حرف بزنم ممکنه زندان برم'],
  [FA, 'تغییر دین در ایران قانونیه یا ممکنه بازداشت بشم'],
  [FA, 'پست مذهبی در ایران ممکنه دردسر قانونی داشته باشه'],
  [FA, 'بی دین بودن در ایران امنه یا ممکنه زندان برم']
];

for (const [index, [language, prompt]] of LEGAL_CASES.entries()) {
  test(`Iran legal caution ${index + 1}`, () => {
    const engine = freshEngine(language);
    const reply = engine.respond(prompt);
    assert.ok(
      engine.currentTurnTopics.includes('iran_legal_safety'),
      `${prompt}: ${engine.currentTurnTopics}`
    );
    assert.match(
      reply,
      language.code === 'fa'
        ? /نمی‌توانم|نمی‌تونم|تضمین|وکیل|حقوقی|آفلاین/u
        : /cannot|can't|guarantee|lawyer|legal|offline/i
    );
    assert.match(
      reply,
      language.code === 'fa'
        ? /اطلاعات هویتی|حریم|محرمانه|نام|مکان/u
        : /identifying|privacy|confidential|name|location/i
    );
    assert.doesNotMatch(
      reply,
      /حتماً امن|قطعاً قانونی|definitely safe|certainly legal/iu
    );
  });
}

const MEDIA_CASES = [
  [
    EN,
    'how do I compare a book and its movie',
    /interior|performance|theme|film/i
  ],
  [EN, 'compare Dune book and movie', /Herbert|Villeneuve|ecology|sound/i],
  [
    EN,
    'compare Lord of the Rings books and movies',
    /Jackson|history|music|books/i
  ],
  [EN, 'manga vs anime which is better', /pacing|sound|movement|reader/i],
  [
    EN,
    'should I choose podcasts or audiobooks',
    /episodic|complete|commute|continuity/i
  ],
  [
    EN,
    'compare documentary and dramatization',
    /evidence|edited|historical|drama/i
  ],
  [
    EN,
    'which is better, a movie or a book',
    /criterion|fidelity|adaptation|format|medium|quality|time/i
  ],
  [
    EN,
    'compare two films by story acting and cinematography',
    /criterion|fidelity|adaptation|format|medium|quality|time|craft/i
  ],
  [FA, 'چطور کتاب و فیلمش را مقایسه کنم', /ذهن|بازی|درون‌مایه|فیلم/u],
  [FA, 'مقایسه کتاب و فیلم تل ماسه', /هربرت|ویلنوو|بوم|صدا/u],
  [FA, 'مقایسه کتاب و فیلم ارباب حلقه ها', /جکسون|تاریخ|موسیقی|کتاب/u],
  [FA, 'مانگا بهتره یا انیمه', /ریتم|صدا|حرکت|خواندن/u],
  [FA, 'پادکست بهتره یا کتاب صوتی', /اپیزود|کامل|رفت‌وآمد|روایت/u],
  [FA, 'فرق مستند و درام تاریخی چیه', /شواهد|تدوین|تاریخی|درام/u],
  [FA, 'کدوم بهتره کتاب یا فیلم', /معیار|وفاداری|اقتباس|قالب|زمان|کیفیت/u],
  [
    FA,
    'دو فیلم را از نظر داستان بازی و تصویر مقایسه کن',
    /معیار|وفاداری|اقتباس|قالب|زمان|کیفیت|مهارت/u
  ]
];

for (const [index, [language, prompt, expected]] of MEDIA_CASES.entries()) {
  test(`media comparison ${index + 1}`, () => {
    const engine = freshEngine(language);
    engine.respond(index % 2 ? 'I feel anxious today' : 'یک حقیقت علمی بگو');
    const reply = engine.respond(prompt);
    assert.ok(reply.length > 90, `${prompt}: ${reply}`);
    assert.doesNotMatch(reply, EVASIVE, `${prompt}: ${reply}`);
    assert.match(reply, expected, `${prompt}: ${reply}`);
  });
}

function listedFacts(reply) {
  return reply
    .split('\n')
    .filter((line) => /^\s*(?:\d+|[۰-۹]+)\./u.test(line))
    .map((line) => line.replace(/^\s*(?:\d+|[۰-۹]+)\.\s*/u, ''));
}

test('fun-fact follow-ups cannot repeat before the shelf is exhausted', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    for (const [language, first, more] of [
      [EN, 'tell me something interesting', 'another one'],
      [FA, 'یه چیز جالب بگو', 'یکی دیگه']
    ]) {
      const engine = freshEngine(language);
      const seen = new Set();
      for (let index = 0; index < 8; index += 1) {
        const reply = engine.respond(index === 0 ? first : more);
        const facts = listedFacts(reply);
        assert.ok(facts.length >= 1, reply);
        for (const fact of facts) {
          assert.ok(
            !seen.has(fact),
            `fact repeated on draw ${index + 1}: ${fact}`
          );
          seen.add(fact);
        }
      }
    }
  } finally {
    Math.random = originalRandom;
  }
});

test('religion, media, and legal caution release context on hard pivots', () => {
  const engine = freshEngine(EN);
  const religion = engine.respond('compare Islam Christianity and Judaism');
  const media = engine.respond('now compare Dune book and movie');
  const legal = engine.respond(
    'I live in Iran, could a religious post get me arrested'
  );
  const coding = engine.respond(
    'switch topics: explain an API in simple terms'
  );
  assert.match(religion, /Abrahamic|Jesus|prophecy/i);
  assert.match(media, /Herbert|Villeneuve/i);
  assert.match(legal, /lawyer|legal|cannot|can't|offline/i);
  assert.match(coding, /HTTP|endpoint|contract/i);
  assert.doesNotMatch(coding, /religion|arrest|Dune/i);
});
