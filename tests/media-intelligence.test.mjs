import test from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, EN, FA, DaryaKnowledge } from './helpers.mjs';

const numberedLines = (reply) =>
  reply.split('\n').filter((line) => /^\s*(?:\d+|[۰-۹]+)\.\s/u.test(line));
const titles = (reply) =>
  numberedLines(reply).map((line) =>
    line
      .replace(/^\s*(?:\d+|[۰-۹]+)\.\s*/u, '')
      .split(/ \(|:/u)[0]
      .trim()
  );

test('media catalog covers eight types and seven substantial genres each', () => {
  const catalog = globalThis.DaryaMediaPool;
  assert.equal(Object.keys(catalog.categories).length, 8);
  for (const [category, genres] of Object.entries(catalog.genres)) {
    assert.ok(
      Object.keys(genres).length >= 7,
      `${category} needs seven genres`
    );
    for (const [genre, items] of Object.entries(genres)) {
      assert.ok(items.length >= 5, `${category}/${genre} needs five choices`);
      assert.equal(new Set(items.map((item) => item.t)).size, items.length);
    }
  }
});

test('media defaults to five but honors an explicit count', () => {
  const engine = freshEngine(EN);
  assert.equal(numberedLines(engine.respond('recommend podcasts')).length, 5);
  assert.equal(
    numberedLines(engine.respond('suggest exactly 3 history books')).length,
    3
  );
});

test('Persian media defaults to five and honors Persian counts', () => {
  const engine = freshEngine(FA);
  assert.equal(
    numberedLines(engine.respond('چند پادکست پیشنهاد بده')).length,
    5
  );
  assert.equal(
    numberedLines(engine.respond('سه کتاب تاریخی معرفی کن')).length,
    3
  );
});

test('more keeps the category and never repeats a title', () => {
  const engine = freshEngine(EN);
  const first = titles(engine.respond('recommend anime'));
  const second = titles(engine.respond('tell me more'));
  const third = titles(engine.respond('suggest 3 more'));
  assert.equal(first.length, 5);
  assert.equal(second.length, 5);
  assert.equal(third.length, 3);
  assert.equal(new Set([...first, ...second, ...third]).size, 13);
});

test('Persian more keeps genre context and reaches a clear ending', () => {
  const engine = freshEngine(FA);
  const first = engine.respond('پنج پادکست علمی پیشنهاد بده');
  const second = engine.respond('بیشتر');
  assert.equal(numberedLines(first).length, 5);
  assert.equal(numberedLines(second).length, 0);
  assert.match(second, /همه|آخر|موضوع|ژانر/u);
});

test('a topic switch replaces media context rather than sticking', () => {
  const engine = freshEngine(EN);
  engine.respond('recommend horror games');
  const books = engine.respond('now suggest literary books');
  const more = engine.respond('more');
  assert.equal(numberedLines(books).length, 5);
  assert.match(books, /literary fiction/i);
  assert.match(more, /end|catalog|genre|media/i);
});

test('all broad media categories use the recommendation engine', () => {
  const requests = [
    'recommend movies',
    'recommend series',
    'recommend games',
    'recommend anime',
    'recommend music',
    'recommend podcasts',
    'recommend books',
    'recommend documentaries'
  ];
  for (const request of requests) {
    assert.equal(numberedLines(freshEngine(EN).respond(request)).length, 5);
  }
});

test('each full genre shelf can be exhausted without duplicate output', () => {
  const engine = freshEngine(EN);
  const first = titles(engine.respond('recommend science podcasts'));
  const ending = engine.respond('more');
  assert.equal(new Set(first).size, 5);
  assert.equal(numberedLines(ending).length, 0);
  assert.match(ending, /end|catalog/i);
});

test('independent recommendation draws are varied', () => {
  const replies = new Set();
  for (let index = 0; index < 6; index += 1) {
    replies.add(freshEngine(EN).respond('recommend movies'));
  }
  assert.ok(replies.size >= 3);
});

test('the public selector excludes supplied titles', () => {
  const excludedTitles = new Set(['Stoner', 'The Door']);
  const result = DaryaKnowledge.recommendMedia('book', 'en', 5, {
    genre: 'literary',
    excludedTitles
  });
  assert.ok(result);
  assert.equal(result.titles.length, 3);
  assert.ok(result.titles.every((title) => !excludedTitles.has(title)));
});

const SWITCH_SCENARIOS = [
  ['recommend a drama movie', 'I feel lonely today', /.{10}/i],
  [
    'I am angry with my boss',
    'recommend science podcasts',
    /Ologies|Science|Monkey|Unexplainable/i
  ],
  ['recommend horror anime', 'what is the capital of France', /Paris/i],
  ['tell me about Saturn', 'recommend jazz music', /jazz/i],
  ['recommend fantasy books', 'how do I start running', /run|walk|cardio|jog/i],
  [
    'I cannot sleep',
    'recommend nature documentaries',
    /nature|world|filmmaking/i
  ],
  ['recommend comedy series', 'I miss my old friend', /.{10}/i],
  ['I feel broke', 'recommend puzzle games', /puzzle/i],
  [
    'recommend history podcasts',
    'what is neuroplasticity',
    /brain|neuroplastic/i
  ],
  ['I am stressed', 'recommend romance movies', /romance/i],
  [
    'recommend electronic music',
    'how can I eat healthier',
    /vegetable|protein|water|food/i
  ],
  ['what is CBT', 'recommend memoir books', /memoir/i],
  ['recommend crime series', 'I am grieving my cat', /.{10}/i],
  ['I hate my job', 'recommend ambient music', /ambient/i],
  [
    'recommend sports documentaries',
    'tell me about Buddhism',
    /Buddh|religion/i
  ],
  [
    'how do I invest',
    'recommend slice of life anime',
    /everyday storytelling/i
  ],
  ['recommend literary books', 'I had a panic attack', /.{10}/i],
  ['I feel jealous of my friend', 'recommend strategy games', /strategy/i],
  ['recommend sci-fi movies', 'what is the solar system', /solar|Sun|planet/i],
  ['I argued with my family', 'recommend culture podcasts', /cultur/i],
  ['recommend folk music', 'I am exhausted from work', /.{10}/i],
  ['tell me about the Olympics', 'recommend mystery books', /mystery/i],
  [
    'recommend animation movies',
    'how do adults make friends',
    /friend|connection|people/i
  ],
  [
    'I am scared about the future',
    'recommend technology podcasts',
    /technology|tech/i
  ],
  ['recommend historical series', 'what is saffron', /saffron|spice/i],
  ['I feel unmotivated', 'recommend RPG games', /RPG|role-playing/i],
  ['recommend true crime podcasts', 'how can I improve my sleep', /.{10}/i],
  ['what was the Berlin Wall', 'recommend classical music', /classical music/i],
  [
    'recommend fantasy anime',
    'I feel sad for no reason',
    /sad|heavy|with you|feeling/i
  ],
  ['I am bored', 'recommend art documentaries', /art documentary/i],
  [
    'recommend platformer games',
    'what is neuroplasticity',
    /brain|neuroplastic/i
  ],
  ['my relationship ended', 'recommend comedy movies', /comedy/i],
  [
    'recommend business podcasts',
    'I am worried about AI taking jobs',
    /.{10}/i
  ],
  ['I feel ashamed', 'recommend science fiction books', /science fiction/i],
  [
    'recommend thriller movies',
    'how should I begin yoga',
    /yoga|breath|pose|cardio/i
  ],
  ['tell me about Mars', 'recommend storytelling podcasts', /storytelling/i],
  [
    'recommend simulation games',
    'I feel homesick',
    /home|miss|belong|homesick/i
  ],
  ['I am procrastinating', 'recommend drama series', /drama/i],
  ['recommend hip hop music', 'what are the pyramids', /pyramid|Egypt/i],
  ['I feel anxious about money', 'recommend history books', /history/i]
];

for (const [prior, target, expected] of SWITCH_SCENARIOS) {
  test(`mixed context releases “${prior}” for “${target}”`, () => {
    const engine = freshEngine(EN);
    engine.respond(prior);
    const reply = engine.respond(target);
    assert.ok(reply.length > 20, reply);
    assert.doesNotMatch(
      reply,
      new RegExp(prior.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    );
    assert.match(reply, expected);
  });
}
