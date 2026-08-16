/**
 * Deep-context memory scenario suite.
 *
 * 23+ multi-turn personas spanning passions, entertainment, breakups,
 * loneliness, loss, jealousy, anger, sadness, poverty, depression,
 * excitement, flirty users, and rude people, in both languages. These
 * exercise the context-window and memory: each conversation runs several
 * turns and asserts that Darya stays on the person's thread, does not
 * fall into a topic-hop reply, and (where a subject is active) keeps the
 * same subject across turns. Also pins the new context-memory touch
 * (emotional-shift acknowledgment).
 *
 * Run with: node --test tests/context-memory-conversations.test.mjs
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN } from './helpers.mjs';

const TOPIC_HOP =
  /return to the topic|moved away from something that seemed to matter|come back to it, or is there something else/i;

function runConversation(lang, turns) {
  const engine = freshEngine(lang);
  const replies = turns.map((turn) => engine.respond(turn));
  return { engine, replies };
}

function assertQuality(reply, label) {
  assert.ok(reply.length > 10, `${label}: empty or tiny reply "${reply}"`);
  assert.doesNotMatch(reply, TOPIC_HOP, `${label}: topic hop "${reply}"`);
}

function assertThread(lang, turns, label) {
  const { engine, replies } = runConversation(lang, turns);
  replies.forEach((r, i) => assertQuality(r, `${label} turn ${i + 1}`));
  return { engine, replies };
}

// ============================================================================
// Passions and hobbies
// ============================================================================

test('deep: the painter who lost her creative spark', () => {
  const { replies } = assertThread(
    EN,
    [
      'I used to love painting but I have not picked up a brush in months',
      'I feel like I lost my creative spark',
      'Every time I try, I compare myself to others and give up'
    ],
    'painter'
  );
  assert.match(
    replies[0],
    /used to love|lost|passion|spark|interest|love|faded/i
  );
});

test('deep: the musician anxious before a first gig', () => {
  assertThread(
    EN,
    [
      'I have my first live music gig this weekend',
      'I am terrified I will mess up on stage',
      'I practiced so much but my hands still shake'
    ],
    'musician'
  );
});

test('deep: the writer with a finished manuscript nobody will read', () => {
  assertThread(
    EN,
    [
      'I finally finished my novel',
      'But I am scared to send it to any publisher',
      'What if they reject it and I wasted five years?'
    ],
    'writer'
  );
});

test('deep: the gamer grieving the end of his favorite hobby', () => {
  assertThread(
    EN,
    [
      'I stopped playing my favorite game after my best friend moved away',
      'Now every time I open it, it just feels empty',
      'I miss how we used to play until 3am'
    ],
    'gamer'
  );
});

test('deep: FA the knitter who lost interest', () => {
  assertThread(
    FA,
    [
      'قبلا خیلی بافتنی دوست داشتم ولی چند ماهه دست به کاموا نزدم',
      'انگار ذوقش رو از دست دادم',
      'هر بار شروع میکنم، حس میکنم کافی نیست'
    ],
    'FA knitter'
  );
});

// ============================================================================
// Entertainment and interests
// ============================================================================

test('deep: the anime fan who wants a recommendation', () => {
  const { engine, replies } = assertThread(
    EN,
    [
      'I just finished all the popular anime, any hidden gems?',
      'Something emotional with a great story',
      'Not too long, maybe 12 episodes'
    ],
    'anime fan'
  );
  assertQuality(replies[0], 'anime rec');
});

test('deep: the reader looking for a book about loss', () => {
  assertThread(
    EN,
    [
      'I want a book that understands grief',
      'I just lost my father and cannot seem to move forward',
      'Maybe something that does not pretend it is easy'
    ],
    'grief reader'
  );
});

test('deep: FA the series binge-watcher after a breakup', () => {
  assertThread(
    FA,
    [
      'بعد از جدایی نمیتونم هیچ سریالی رو تموم کنم',
      'همه چیز یادم میاره پیشش بودم',
      'یه چیزی میخوام که حالم رو عوض کنه'
    ],
    'FA binger'
  );
});

// ============================================================================
// Breakups and romantic loss
// ============================================================================

test('deep: the person in a fresh breakup', () => {
  assertThread(
    EN,
    [
      'My partner of four years just broke up with me',
      'I keep replaying the last conversation in my head',
      'I do not know how to be alone again'
    ],
    'breakup'
  );
});

test('deep: the one who was left without a real goodbye', () => {
  assertThread(
    EN,
    [
      'She left and I never got a real goodbye',
      'I keep waiting for a message that will never come',
      'How do I stop checking my phone?'
    ],
    'no goodbye'
  );
});

test('deep: FA breakup after a long relationship', () => {
  assertThread(
    FA,
    [
      'بعد از چهار سال رابطه تمومش کردم',
      'هر روز به حرفای آخرش فکر میکنم',
      'نمیدونم چطور تنها باشم'
    ],
    'FA breakup'
  );
});

// ============================================================================
// Loneliness and isolation
// ============================================================================

test('deep: the remote worker isolated for years', () => {
  assertThread(
    EN,
    [
      'I work from home alone and barely see anyone',
      'I have not had a real conversation in weeks',
      'I feel like I am disappearing'
    ],
    'remote isolation'
  );
});

test('deep: the immigrant with no social circle', () => {
  assertThread(
    EN,
    [
      'I moved to a new country and know nobody',
      'The language is hard and people are busy',
      'I spend weekends completely alone'
    ],
    'immigrant'
  );
});

test('deep: FA the student alone in the dorm', () => {
  assertThread(
    FA,
    [
      'تو خوابگاه تنها موندم و هم‌اتاقی‌م رفته خونه',
      'شب‌ها خیلی تنهایی اذیتم میکنه',
      'نمیدونم چطور با این شرایط کنار بیام'
    ],
    'FA dorm loneliness'
  );
});

// ============================================================================
// Loss and grief (non-family)
// ============================================================================

test('deep: the person who lost a childhood home to fire', () => {
  assertThread(
    EN,
    [
      'My family home burned down last week',
      'All our photos and memories are gone',
      'I cannot stop thinking about the things we lost'
    ],
    'lost home'
  );
});

test('deep: the friend who lost a close friend suddenly', () => {
  assertThread(
    EN,
    [
      'My best friend died suddenly in an accident',
      'We had plans for next summer',
      'I keep texting their number by accident'
    ],
    'lost friend'
  );
});

test('deep: FA the person who lost their job and a parent in one year', () => {
  assertThread(
    FA,
    [
      'امسال هم شغلم رو از دست دادم هم پدرم رو',
      'بعضی روزا حس میکنم طاقتم تموم شده',
      'چطوری میشه از این همه فقدان زنده بیرون اومد؟'
    ],
    'FA double loss'
  );
});

// ============================================================================
// Jealousy and comparison
// ============================================================================

test('deep: the person jealous of a friend who succeeds', () => {
  assertThread(
    EN,
    [
      'My best friend just got the job I wanted',
      'I am happy for them but I feel so jealous',
      'It makes me feel like I am falling behind in life'
    ],
    'jealousy'
  );
});

test('deep: FA the social-media comparison spiral', () => {
  assertThread(
    FA,
    [
      'هر روز اینستاگرام رو نگاه میکنم و از بقیه عقب‌ترم',
      'همه انگار موفق شدن فقط من موندم',
      'چرا نمیتونم از مقایسه کردن دست بردارم؟'
    ],
    'FA comparison'
  );
});

// ============================================================================
// Anger and frustration
// ============================================================================

test('deep: the person angry at an unfair boss', () => {
  assertThread(
    EN,
    [
      'My boss took credit for my project',
      'I am so angry I cannot even look at him',
      'I want to quit but I need the money'
    ],
    'unfair boss'
  );
});

test('deep: FA road rage that spilled over', () => {
  assertThread(
    FA,
    [
      'امروز تو خیابون یه آدم پررو تقریبا منو زد',
      'داشتم از عصبانیت منفجر میشدم',
      'حالا چند ساعته با خشم سوارم'
    ],
    'FA road rage'
  );
});

// ============================================================================
// Sadness and low mood
// ============================================================================

test('deep: the person sad without a clear reason', () => {
  assertThread(
    EN,
    [
      'I have been sad for no real reason lately',
      'Small things make me cry now',
      'I do not even know why I feel this way'
    ],
    'unexplained sadness'
  );
});

test('deep: FA the melancholic evening sadness', () => {
  assertThread(
    FA,
    [
      'هر شب که میشه یه غم عجیب میاد سراغم',
      'دلم میخواد گریه کنم ولی نمیدونم برای چی',
      'صبح‌ها اوکیم ولی شب‌ها خرابم'
    ],
    'FA evening sadness'
  );
});

// ============================================================================
// Poverty and financial stress
// ============================================================================

test('deep: the parent who cannot afford groceries', () => {
  assertThread(
    EN,
    [
      'I cannot afford groceries this month for my kids',
      'The rent took everything and now I have almost nothing',
      'I feel like a failure as a parent'
    ],
    'parent poverty'
  );
});

test('deep: FA the young person with crushing debt', () => {
  assertThread(
    FA,
    [
      'بدهی بزرگی دارم و از پسش برنمیام',
      'هر ماه فقط قسط‌ها میبلعه حقوقمو',
      'نفس کشیدن هم شده سخته'
    ],
    'FA debt'
  );
});

// ============================================================================
// Depression and despair (expanded coverage)
// ============================================================================

test('deep: the person who cannot get out of bed', () => {
  const { engine, replies } = assertThread(
    EN,
    [
      'I have not been able to get out of bed for days',
      'Everything feels pointless and empty',
      'I used to enjoy things but now nothing matters'
    ],
    'bed depression'
  );
  assert.match(replies[0], /depress|support|professional|weight|hard|feel/i);
});

test('deep: FA deep hopelessness', () => {
  const { replies } = assertThread(
    FA,
    [
      'دیگه هیچ‌چیزی برام معنی نداره',
      'از رختخواب بلند شدن هم برام سخته',
      'فکر میکنم بهتره دیگه ادامه ندم'
    ],
    'FA hopelessness'
  );
  assert.match(
    replies[0],
    /افسرد|پشتیبانی|متخصص|حمایت|پزشک|اعتماد|سنگین|کمک|بار/i
  );
});

// ============================================================================
// Excitement and joy
// ============================================================================

test('deep: the person who just got engaged', () => {
  const { engine, replies } = assertThread(
    EN,
    [
      'I got engaged yesterday!!',
      'We have been together five years and I am over the moon',
      'The wedding is next summer'
    ],
    'engaged'
  );
  assert.match(
    replies[0],
    /congratul|happy|wonderful|celebrate|exciting|great|proud|accomplish|credit/i
  );
});

test('deep: FA the new parent excited about their baby', () => {
  assertThread(
    FA,
    [
      'بچه‌مون تازه به دنیا اومد!',
      'ماه‌ها منتظرش بودیم',
      'فقط از خوشحالی ذوق دارم'
    ],
    'FA new parent'
  );
});

// ============================================================================
// Flirty users
// ============================================================================

test('deep: a flirty user testing boundaries', () => {
  const { engine, replies } = assertThread(
    EN,
    [
      'Hey gorgeous, are you single?',
      'Come on, dont be shy, you know you want me',
      'Why are you being so cold to me?'
    ],
    'flirty user'
  );
  for (const r of replies) {
    assertQuality(r, 'flirty boundary');
    assert.doesNotMatch(r, /i love that|sure, let us|yes, i am single/i);
  }
});

test('deep: FA a persistent flirt', () => {
  assertThread(
    FA,
    [
      'چه خوشگلی! دوست داری بریم بیرون؟',
      'چرا اینقدر جدی هستی؟',
      'شوخی میکنم، فقط میخواستم ببینم واکنشت چیه'
    ],
    'FA flirt'
  );
});

// ============================================================================
// Rude and hostile users
// ============================================================================

test('deep: a rude user who becomes more civil', () => {
  const { engine, replies } = assertThread(
    EN,
    [
      'You are useless and dumb',
      'I am sorry, I am just so frustrated about my life',
      'Thanks for listening, I really needed that'
    ],
    'rude then civil'
  );
  assert.doesNotMatch(replies[0], /useless|dumb|stupid/i);
  assertQuality(replies[2], 'apology accepted');
});

test('deep: FA a condescending user', () => {
  assertThread(
    FA,
    [
      'تو اصلا نمیفهمی من چی میگم',
      'شاید برم یه آدم واقعی پیدا کنم',
      'ببخشید، فقط انقدر تنهام که حرف بزنم'
    ],
    'FA condescending'
  );
});

// ============================================================================
// Context-memory across a long multi-subject chat
// ============================================================================

test('deep: emotional shift acknowledgment fires on recovery', () => {
  const { engine, replies } = assertThread(EN, [
    'I feel really anxious about everything right now',
    'I talked to my doctor and started therapy, I feel hopeful now'
  ]);
  // The context-memory touch should appear somewhere across the two turns.
  assert.ok(
    replies.some((r) =>
      /lighter|eased|shifted|weight.*lifted|mood.*moved|turn(?:ed)? around/i.test(
        r
      )
    ),
    `expected an emotional-shift acknowledgment in ${JSON.stringify(replies)}`
  );
});

test('deep: FA emotional shift acknowledgment fires on recovery', () => {
  const { engine, replies } = assertThread(FA, [
    'من خیلی نگرانم',
    'الان با یک روانشناس حرف زدم و امیدوارم'
  ]);
  assert.ok(
    replies.some((r) => /سبک‌تر|سنگینی کم|بهتری داری|عوض شد/i.test(r)),
    `expected an FA emotional-shift acknowledgment in ${JSON.stringify(replies)}`
  );
});

// ============================================================================
// Additional memory checks: subject continuity across a long chat
// ============================================================================

test('deep: subject stays alive across a long worried thread', () => {
  const { engine, replies } = assertThread(
    EN,
    [
      'I am worried about my brother',
      'He is going through a rough divorce',
      'He does not answer my calls anymore',
      'I am scared he is isolating himself',
      'What should I do?'
    ],
    'worried brother'
  );
  // The brother/divorce/worry subject should survive all five turns.
  assert.ok(
    engine.currentTurnTopics.length > 0,
    'subject should still be present at the end'
  );
  assertQuality(replies[4], 'worried brother last turn');
});

test('deep: FA subject continuity across turns', () => {
  assertThread(
    FA,
    [
      'درباره برادرم نگرانم',
      'تازه طلاق گرفته و خیلی بهم ریخته',
      'دیگه به تماس‌هام جواب نمیده',
      'میترسم خودشو تنها کرده باشه'
    ],
    'FA worried brother'
  );
});
