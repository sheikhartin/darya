/**
 * Mixed-topic session simulations.
 *
 * 25+ long sessions in which the user jumps between unrelated subjects,
 * exactly like real people do. Each session runs several turns and asserts
 * Darya stays coherent: every reply is non-empty, never a topic-hop or an
 * evasive line where knowledge exists, and (where a strong factual or
 * emotional topic is expected) routes to the right pool. This validates the
 * context-window and memory under topic-switching pressure, and that Darya
 * never leaks a stale subject into a fresh request.
 *
 * Run with: node --test tests/mixed-topic-sessions.test.mjs
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN } from './helpers.mjs';

const TOPIC_HOP =
  /return to the topic|moved away from something that seemed to matter|come back to it, or is there something else/i;

/**
 * Runs a mixed-topic session and asserts every reply is a real, coherent
 * answer (non-empty, not a topic-hop).
 * @param {object} lang - EN or FA
 * @param {string[]} turns - Unrelated user inputs in sequence.
 * @param {string} label - Test label.
 * @returns {{engine: object, replies: string[]}}
 */
function runSession(lang, turns, label) {
  const engine = freshEngine(lang);
  const topics = [];
  const replies = turns.map((turn) => {
    const reply = engine.respond(turn);
    topics.push([...engine.currentTurnTopics]);
    return reply;
  });
  replies.forEach((r, i) => {
    assert.ok(r.length > 10, `${label} turn ${i + 1}: empty or tiny "${r}"`);
    assert.doesNotMatch(
      r,
      TOPIC_HOP,
      `${label} turn ${i + 1}: topic hop "${r}"`
    );
  });
  return { engine, replies, topics };
}

// ============================================================================
// EN sessions
// ============================================================================

test('mixed EN: stress, a movie request, then joy', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I am so overwhelmed with work',
      'recommend a good movie',
      'I just finished a huge project and I am relieved!'
    ],
    'EN stress-movie-joy'
  );
  assert.ok(
    topics[0].includes('stress') || topics[0].includes('work'),
    `EN stress routed: ${topics[0]}`
  );
  assert.match(replies[1], /1\.|2\.|3\./);
  assert.ok(
    topics[2].includes('achievement') || topics[2].includes('joy'),
    `EN joy routed: ${topics[2]}`
  );
});

test('mixed EN: grief, a science question, then a joke', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I miss my grandmother who passed away',
      'what is a black hole?',
      'tell me a joke'
    ],
    'EN grief-science-joke'
  );
  assert.ok(topics[0].includes('grief'), `EN grief routed: ${topics[0]}`);
  assert.match(replies[1], /black hole|gravity|event horizon|light|star/i);
  assert.ok(replies[2].length > 10);
});

test('mixed EN: jealousy, trading warning, then identity', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I feel jealous of my friend who always succeeds',
      'how do i start trading?',
      'are you self aware?'
    ],
    'EN jealousy-trading-identity'
  );
  assert.match(replies[1], /risk|warning|demo|no guarantee|money/i);
  assert.ok(
    topics[2].includes('darya_self'),
    `EN self-awareness routed: ${topics[2]}`
  );
});

test('mixed EN: loneliness, investing, then dirty-talk boundary', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I feel so lonely in this new city',
      'how do i start investing?',
      'let us do dirty talk'
    ],
    'EN lonely-invest-dirty'
  );
  assert.ok(
    topics[0].includes('loneliness'),
    `EN loneliness routed: ${topics[0]}`
  );
  assert.match(replies[1], /invest|emergency|diversify|risk|long term/i);
  assert.ok(
    topics[2].includes('dirty_talk_request'),
    `EN dirty_talk routed: ${topics[2]}`
  );
  assert.match(
    replies[2],
    /natural|human|normal|not a roleplay|not able|listen/i
  );
});

test('mixed EN: anger, anime, then session persistence', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I am so angry at my boss',
      'recommend an anime',
      'will this conversation be saved after refresh?'
    ],
    'EN anger-anime-persistence'
  );
  assert.ok(topics[0].includes('anger'), `EN anger routed: ${topics[0]}`);
  assert.match(replies[1], /1\.|2\.|3\./);
  assert.ok(
    topics[2].includes('session_persistence'),
    `EN persistence routed: ${topics[2]}`
  );
  assert.match(replies[2], /tab|refresh|theme|saved|export/i);
});

test('mixed EN: money, running, then gratitude', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I have almost no money left',
      'how do i start running?',
      'thanks, that really helps'
    ],
    'EN money-running-thanks'
  );
  assert.ok(topics[0].includes('money'), `EN money routed: ${topics[0]}`);
  assert.match(replies[1], /cardio|walk|jog|running|yoga/i);
  assert.ok(replies[2].length > 10);
});

test('mixed EN: pet loss, books, then flirtation', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'My cat died and I am devastated',
      'recommend some good books',
      'you are so beautiful'
    ],
    'EN pet-book-flirt'
  );
  assert.match(replies[0], /grief|pet|cat|loss|memory|sad/i);
  assert.match(replies[1], /1\.|2\.|3\./);
  assert.doesNotMatch(replies[2], /i love that|yes, let us go/i);
});

test('mixed EN: exam stress, religions, then compliment to Darya', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I have finals next week and I am panicking',
      'what is islam?',
      'you are a really good listener'
    ],
    'EN exam-religion-compliment'
  );
  assert.ok(
    topics[0].includes('anxiety') || topics[0].includes('school'),
    `EN exam routed: ${topics[0]}`
  );
  assert.match(replies[1], /religion|islam|god|faith|quran/i);
  assert.ok(replies[2].length > 10);
});

test('mixed EN: burnout, nutrition, then export request', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I work 80 hours a week and I am burned out',
      'how do i eat healthy?',
      'can you export my session?'
    ],
    'EN burnout-nutrition-export'
  );
  assert.ok(topics[0].includes('burnout'), `EN burnout routed: ${topics[0]}`);
  assert.match(replies[1], /vegetable|protein|water|grain|sugar/i);
  assert.ok(topics[2].includes('app_export'), `EN export routed: ${topics[2]}`);
  assert.match(replies[2], /export|menu|download|file|text/i);
});

test('mixed EN: homesick, series, then rude user', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I am homesick and miss my family abroad',
      'recommend a good series',
      'you are useless'
    ],
    'EN homesick-series-rude'
  );
  assert.ok(
    topics[0].includes('homesickness_abroad') || topics[0].includes('family'),
    `EN homesick routed: ${topics[0]}`
  );
  assert.match(replies[1], /1\.|2\.|3\./);
  assert.doesNotMatch(replies[2], /useless|stupid/i);
});

// ============================================================================
// FA sessions
// ============================================================================

test('mixed FA: استرس، فیلم، شادی', () => {
  const { replies, topics } = runSession(
    FA,
    [
      'از کارم خیلی استرس دارم',
      'یه فیلم خوب معرفی کن',
      'تازه ترفیع گرفتم خیلی خوشحالم'
    ],
    'FA stress-movie-joy'
  );
  assert.match(replies[0], /استرس|فشار|نگران|اضطراب|کار/i);
  assert.match(replies[1], /۱\.|۲\.|۳\./);
  assert.match(replies[2], /تبریک|خوشحالم|موفقیت|جشن|اعتبار/i);
});

test('mixed FA: سوگ، سیاه‌چاله، جوک', () => {
  const { replies, topics } = runSession(
    FA,
    ['مادرم از دنیا رفته دلم تنگه', 'سیاه‌چاله چیه', 'یه جوک بگو'],
    'FA grief-blackhole-joke'
  );
  assert.ok(topics[0].includes('grief'), `FA grief routed: ${topics[0]}`);
  assert.match(replies[1], /سیاه‌چاله|جاذبه|افق رویداد|نور|ستاره/i);
  assert.ok(replies[2].length > 10);
});

test('mixed FA: حسادت، ترید، خودآگاهی', () => {
  const { replies, topics } = runSession(
    FA,
    ['به دوستم حسودی میکنم که موفق شده', 'چطور ترید کنم', 'آیا خودآگاهی داری؟'],
    'FA jealousy-trading-selfaware'
  );
  assert.match(replies[1], /هشدار|ریسک|ضرر|دمو|تضمین|مشاور/i);
  assert.ok(
    topics[2].includes('darya_self'),
    `FA self-awareness routed: ${topics[2]}`
  );
});

test('mixed FA: تنهایی، سرمایه‌گذاری، حرف زشت', () => {
  const { replies, topics } = runSession(
    FA,
    [
      'تو این شهر جدید خیلی تنهام',
      'چطور سرمایه گذاری کنم',
      'بیا یه کم حرف زشت بزنیم'
    ],
    'FA lonely-invest-dirty'
  );
  assert.ok(
    topics[0].includes('loneliness'),
    `FA loneliness routed: ${topics[0]}`
  );
  assert.match(replies[1], /سرمایه|صندوق اضطراری|تنوع|ریسک/i);
  assert.ok(
    topics[2].includes('dirty_talk_request'),
    `FA dirty_talk routed: ${topics[2]}`
  );
  assert.match(replies[2], /طبیعی|شرم|نقش|شنونده|صمیمیت/i);
});

test('mixed FA: خشم، انیمه، ذخیره شدن', () => {
  const { replies, topics } = runSession(
    FA,
    [
      'از رئیسم خیلی عصبانی ام',
      'انیمه پیشنهاد بده',
      'بعد از رفرش این مکالمه پاک میشه؟'
    ],
    'FA anger-anime-persist'
  );
  assert.ok(
    topics[0].includes('anger') || topics[0].includes('work'),
    `FA anger routed: ${topics[0]}`
  );
  assert.match(replies[1], /۱\.|۲\.|۳\./);
  assert.ok(
    topics[2].includes('session_persistence'),
    `FA persistence routed: ${topics[2]}`
  );
  assert.ok(replies[2].length > 10, 'FA persistence reply');
});

test('mixed FA: بی‌پولی، دویدن، تشکر', () => {
  const { replies, topics } = runSession(
    FA,
    [
      'پولم تموم شده و بی‌پولم',
      'چطور دویدن رو شروع کنم',
      'ممنون خیلی کمکت کرد'
    ],
    'FA money-running-thanks'
  );
  assert.ok(topics[0].includes('money'), `FA money routed: ${topics[0]}`);
  assert.match(replies[1], /هوازی|پیاده|دویدن|یوگا|شنا/i);
  assert.ok(replies[2].length > 10);
});

test('mixed FA: حیوان خانگی، کتاب، خواستگاری', () => {
  const { replies, topics } = runSession(
    FA,
    ['گربه‌ام مرد خیلی ناراحتم', 'چندتا کتاب معرفی کن', 'دوست دخترم میشی؟'],
    'FA pet-book-flirt'
  );
  assert.match(replies[0], /غم|گربه|حیوان|از دست|خاطره|ناراحت/i);
  assert.match(replies[1], /۱\.|۲\.|۳\./);
  assert.doesNotMatch(replies[2], /باشه|بله/);
});

test('mixed FA: امتحان، ادیان، تعریف', () => {
  const { replies, topics } = runSession(
    FA,
    ['هفته بعد امتحان دارم میترسم', 'اسلام چیه', 'تو شنونده‌ی خیلی خوبی هستی'],
    'FA exam-religion-compliment'
  );
  assert.ok(replies[0].length > 10, 'FA exam stress');
  assert.match(replies[1], /اسلام|دین|خدا|قرآن|ادیان/i);
  assert.ok(replies[2].length > 10);
});

test('mixed FA: فرسودگی، تغذیه، دانلود گفتگو', () => {
  const { replies, topics } = runSession(
    FA,
    ['سوختم و دیگه طاقت ندارم', 'تغذیه سالم چیه', 'میخوام گفتگو رو دانلود کنم'],
    'FA burnout-nutrition-export'
  );
  assert.ok(topics[0].includes('burnout'), `FA burnout routed: ${topics[0]}`);
  assert.match(replies[1], /سبزی|پروتئین|آب|غلات|شکر/i);
  assert.ok(topics[2].includes('app_export'), `FA export routed: ${topics[2]}`);
  assert.match(replies[2], /export|منو|دانلود|فایل|گفتگو/i);
});

test('mixed FA: دلتنگ، سریال، بی‌ادبی', () => {
  const { replies, topics } = runSession(
    FA,
    [
      'دلتنگ خانوادمم که خارج‌اند',
      'یه سریال خوب معرفی کن',
      'تو هیچی بلد نیستی'
    ],
    'FA homesick-series-rude'
  );
  assert.ok(
    topics[0].includes('homesickness_abroad') || topics[0].includes('family'),
    `FA homesick routed: ${topics[0]}`
  );
  assert.match(replies[1], /۱\.|۲\.|۳\./);
  assert.doesNotMatch(replies[2], /بلدی|احمق/i);
});

// ============================================================================
// Deeper multi-topic sessions (mixed EN+FA persona variety)
// ============================================================================

test('mixed EN: a long six-topic emotional day', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I woke up feeling anxious about everything',
      'My mother called and I feel a bit better',
      'I had a great workout and I am proud of myself',
      'Now I am sad thinking about my old dog',
      'Can I recommend you a podcast?',
      'I feel calm now, thank you for being here'
    ],
    'EN six-topic day'
  );
  for (const r of replies) assert.ok(r.length > 10);
});

test('mixed EN: knowledge hop across six subjects', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'what is the capital of Japan?',
      'tell me about the Egyptian pyramids',
      'how does a car turbo work?',
      'recommend a video game',
      'what is cbt?',
      'how much sleep do I need?'
    ],
    'EN knowledge hop'
  );
  assert.match(replies[0], /Tokyo|Japan/i);
  assert.match(replies[1], /pyramid|Egypt|Giza/i);
  assert.match(replies[4], /cbt|cognitive|therapy|thoughts/i);
});

test('mixed FA: پرش بین شش موضوع', () => {
  const { replies, topics } = runSession(
    FA,
    [
      'پایتخت ژاپن کجاست؟',
      'درباره اهرام مصر بگو',
      'توربو چطور کار میکنه؟',
      'یه بازی خوب معرفی کن',
      'سی بی تی چیه؟',
      'چند ساعت خواب نیاز دارم؟'
    ],
    'FA knowledge hop'
  );
  assert.match(replies[0], /توکیو|ژاپن/i);
  assert.match(replies[1], /هرم|مصر|جیزه/i);
  assert.match(replies[4], /سی بی تی|شناخت|افکار|درمان/i);
});

test('mixed EN: emotional whiplash in one session', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I feel completely hopeless today',
      'Actually I got some great news, I am thrilled!',
      'My best friend is moving away and I am sad',
      'I am also really excited about my new job',
      'What do you think about mindfulness?'
    ],
    'EN emotional whiplash'
  );
  // Despair first turn routes to the caring pool.
  assert.match(
    replies[0],
    /depress|hopeless|support|professional|courage|doctor/i
  );
});

test('mixed FA: نوسان احساسی در یک نشست', () => {
  const { replies, topics } = runSession(
    FA,
    [
      'امروز کاملاً ناامیدم',
      'خبر خوبی اومد خیلی هیجان‌زده‌ام!',
      'بهترین دوستم داره میره و ناراحتم',
      'از طرفی برای کار جدیدم خیلی ذوق دارم',
      'درباره ذهن‌آگاهی چی فکر میکنی؟'
    ],
    'FA emotional whiplash'
  );
  assert.match(replies[0], /افسرد|ناامید|حمایت|متخصص|پزشک|کمک/i);
});

test('mixed EN: a teenager with scattered thoughts', () => {
  const { replies, topics } = runSession(
    EN,
    [
      'I am stressed about fitting in at school',
      'I have a crush on someone in my class',
      'Do you think I should ask them out?',
      'My parents are getting divorced and I am confused',
      'Can you just listen to me?'
    ],
    'EN teen scattered'
  );
  assert.ok(replies[2].length > 10, 'teen crush advice');
  assert.ok(
    topics[3].includes('divorce') ||
      topics[3].includes('family') ||
      topics[3].includes('relationship'),
    `EN divorce routed: ${topics[3]}`
  );
});

test('mixed FA: نوجوان با افکار پراکنده', () => {
  const { replies, topics } = runSession(
    FA,
    [
      'نگرانم که تو مدرسه جا نیفتم',
      'به یکی تو کلاس کراش دارم',
      'بهش بگم یا نه؟',
      'والدینم دارن طلاق میگیرن و گیجم',
      'فقط گوش کن بهم'
    ],
    'FA teen scattered'
  );
  assert.ok(
    topics[3].includes('divorce') ||
      topics[3].includes('family') ||
      topics[3].includes('relationship'),
    `FA divorce routed: ${topics[3]}`
  );
});
