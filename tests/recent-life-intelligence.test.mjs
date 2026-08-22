import test from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, EN, FA } from './helpers.mjs';

const EVASIVE =
  /not familiar|beyond what i know|new territory|no ready answer|do not have (?:a precise|the) answer|نمی‌دانم|نمی دانم|خارج از (?:دانش|حیطه)|اطلاعات کافی ندارم/iu;

const EN_CASES = [
  ['my feed is all AI slop and ads now', 'digital_wellbeing'],
  ['how do I do a realistic digital detox', 'digital_wellbeing'],
  ['I deleted Instagram and now I feel left out', 'digital_wellbeing'],
  ['social media feels like a dead mall full of bots', 'digital_wellbeing'],
  ['short form videos destroyed my attention span', 'digital_wellbeing'],
  ['I want a dumb phone but I still need work apps', 'digital_wellbeing'],
  ['give me a low dopamine weekend plan', 'digital_wellbeing'],
  ['recommend an analog hobby that is not expensive', 'digital_wellbeing'],
  ['notifications make me feel permanently on call', 'digital_wellbeing'],
  ['live service games feel like chores now', 'digital_wellbeing'],
  ['streaming has too many choices and I pick nothing', 'digital_wellbeing'],
  ['I am tired of algorithm recommendations', 'digital_wellbeing'],
  ['I use an AI companion because I have no friends', 'ai_companion'],
  ['are AI girlfriends healthy for lonely people', 'ai_companion'],
  ['I am emotionally dependent on a chatbot', 'ai_companion'],
  ['can you replace my therapist', 'ai_companion'],
  ['AI generated dating profiles make me trust nobody', 'ai_companion'],
  [
    'my parasocial relationship feels more real than friendships',
    'ai_companion'
  ],
  ['AI is making me worse at thinking for myself', 'ai_cognition'],
  ['I cannot write anything without AI anymore', 'ai_cognition'],
  ['someone made a deepfake to ruin my reputation', 'deepfake_safety'],
  ['someone made a fake nude image of me', 'deepfake_safety'],
  [
    'I am being threatened with a non-consensual intimate image',
    'deepfake_safety'
  ],
  ['I posted an opinion and now I am being dogpiled', 'online_harassment'],
  ['someone doxxed me after an argument online', 'online_harassment'],
  ['cyberbullying is following me across my accounts', 'online_harassment'],
  ['how can I tell if a video is AI generated', 'misinformation'],
  ['I do not trust news on TikTok anymore', 'misinformation'],
  ['misinformation is overwhelming me', 'misinformation'],
  ['my parents share fake news and we keep fighting', 'misinformation'],
  ['doom spending after scrolling is hurting my budget', 'doom_spending'],
  ['I keep doom spending whenever I feel behind online', 'doom_spending'],
  ['buy now pay later has me trapped', 'bnpl'],
  ['my BNPL installments are more than I can pay', 'bnpl'],
  ['I am ashamed that I fell for an influencer scam', 'online_scam'],
  ['an online scam took my savings and I feel stupid', 'online_scam'],
  ['I cannot buy a home and feel behind everyone', 'housing_pressure'],
  ['I cannot afford rent even with a full time job', 'housing_pressure'],
  ['climate change makes planning a future feel pointless', 'climate_anxiety'],
  ['climate anxiety makes me scared to have a future', 'climate_anxiety'],
  ['political polarization is destroying my friendships', 'political_division'],
  ['politics is ruining my relationship with my family', 'political_division'],
  ['I have hundreds of followers but nobody to call', 'loneliness_online'],
  ['all my friendships are online and still feel hollow', 'loneliness_online'],
  ['dating apps feel like another unpaid job', 'dating_apps'],
  ['I am tired of swiping and never matching anyone', 'dating_apps'],
  ['I keep applying but get ghosted by recruiters', 'work'],
  ['I got laid off and every job post feels fake', 'work'],
  ['will AI make my degree useless', 'ai_career'],
  ['my side hustle is burning me out', 'gig_economy']
];

const FA_CASES = [
  ['فیدم پر از محتوای آشغال هوش مصنوعی و تبلیغه', 'digital_wellbeing'],
  ['چطور یه دیتاکس دیجیتال واقعی انجام بدم', 'digital_wellbeing'],
  ['اعلان‌ها باعث اضطراب و فشار دائمی شدن', 'digital_wellbeing'],
  ['به چت‌بات وابسته شدم و از آدم‌ها دور شدم', 'ai_companion'],
  ['هوش مصنوعی باعث شده خودم فکر نکنم', 'ai_cognition'],
  ['هوش مصنوعی مدرکم رو بی‌ارزش می‌کنه', 'ai_career'],
  ['یکی از من دیپ فیک ساخته و آبرویم در خطره', 'deepfake_safety'],
  ['بعد از یک پست بهم حمله گروهی کردن', 'online_harassment'],
  ['دیگه به خبرهای تیک تاک اعتماد ندارم', 'misinformation'],
  ['بعد از اینستاگرام خرید هیجانی می‌کنم', 'doom_spending'],
  ['خرید اقساطی منو توی بدهی گیر انداخته', 'bnpl'],
  ['فریب کلاهبرداری اینفلوینسر رو خوردم', 'online_scam'],
  ['تغییرات اقلیمی برنامه‌ریزی برای آینده رو بی‌معنی کرده', 'climate_anxiety']
];

function assertCurrentReply(engine, reply, topic, prompt) {
  assert.ok(reply.length > 35, `${prompt}: reply is too short: ${reply}`);
  assert.ok(
    engine.currentTurnTopics.includes(topic),
    `${prompt}: expected ${topic}, got ${engine.currentTurnTopics.join(',')}`
  );
  assert.doesNotMatch(reply, EVASIVE, `${prompt}: evasive reply: ${reply}`);
}

for (const [index, [prompt, topic]] of EN_CASES.entries()) {
  test(`recent mixed EN ${index + 1}: ${topic}`, () => {
    const engine = freshEngine(EN);
    engine.respond(
      index % 2 ? 'recommend some jazz music' : 'I had a long day'
    );
    const reply = engine.respond(prompt);
    assertCurrentReply(engine, reply, topic, prompt);
    assert.doesNotMatch(reply, /recommend some jazz music/i);
  });
}

for (const [index, [prompt, topic]] of FA_CASES.entries()) {
  test(`recent mixed FA ${index + 1}: ${topic}`, () => {
    const engine = freshEngine(FA);
    engine.respond(
      index % 2 ? 'چند کتاب تاریخی پیشنهاد بده' : 'امروز روز سختی بود'
    );
    const reply = engine.respond(prompt);
    assertCurrentReply(engine, reply, topic, prompt);
    assert.doesNotMatch(reply, /چند کتاب تاریخی پیشنهاد بده/u);
  });
}

test('recent deep session keeps useful context then releases it on every pivot', () => {
  const engine = freshEngine(EN);
  const turns = [
    ['my feed is all AI slop and ads now', 'digital_wellbeing'],
    ['tell me one small step, not a lecture', null],
    ['someone made a fake nude image of me', 'deepfake_safety'],
    ['now I am doom spending because I feel awful', 'doom_spending'],
    ['switch topics and recommend five history podcasts', null],
    ['actually I got ghosted by three recruiters this week', 'work']
  ];
  for (const [prompt, topic] of turns) {
    const reply = engine.respond(prompt);
    assert.ok(reply.length > 20, `${prompt}: ${reply}`);
    assert.doesNotMatch(reply, EVASIVE, `${prompt}: ${reply}`);
    if (topic) {
      assert.ok(
        engine.currentTurnTopics.includes(topic),
        `${prompt}: ${engine.currentTurnTopics}`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// Global slang and age-context intelligence
// ---------------------------------------------------------------------------

const CULTURAL_ROUTE_CASES = [
  [EN, "I'm cooked after finals", 'stress'],
  [EN, 'that exam was cooked', 'school'],
  [EN, "I'm skint until payday", 'money'],
  [EN, 'sapa don hook me', 'money'],
  [EN, "I'm absolutely knackered after my shift", 'burnout'],
  [EN, 'I don tire', 'burnout'],
  [EN, 'I was gutted when they rejected me', 'sadness'],
  [EN, 'wahala too much at home', 'stress'],
  [EN, "I'm gatvol of this commute", 'stress'],
  [EN, "I'm sian from the same routine", 'stress'],
  [EN, 'jialat, I missed the deadline', 'stress'],
  [EN, 'uni is doing my head in', 'stress'],
  [EN, 'my situationship ghosted me', 'relationship'],
  [EN, 'she left me on read for a week', 'relationship'],
  [EN, "I'm bed rotting all weekend", 'motivation'],
  [EN, 'my brain rot is getting bad', 'digital_wellbeing'],
  [EN, 'I might crash out at work', 'stress'],
  [EN, 'that meal was shiok', 'joy'],
  [EN, 'this food is bussin no cap', 'joy'],
  [EN, 'no wahala', 'gratitude'],
  [EN, 'this dodgy text wants my bank code', 'online_scam'],
  [EN, 'I got ratioed after that post', 'self_esteem'],
  [EN, 'a stranger in Roblox asked for my address', 'online_harassment'],
  [EN, 'kids at school keep making fun of me', 'school'],
  [EN, 'my parents keep fighting and I think it is my fault', 'family'],
  [EN, 'my friends are pressuring me to vape', 'self_esteem'],
  [EN, 'he is pressuring me to send nudes', 'deepfake_safety'],
  [
    EN,
    'raising my kids while caring for my aging mother is crushing me',
    'caregiver'
  ],
  [EN, 'since I retired I have no purpose', 'purpose'],
  [EN, 'I am too old to learn this smartphone', 'tech_frustration'],
  [
    EN,
    'a caller said Microsoft needs remote access to my computer',
    'online_scam'
  ],
  [EN, 'do you understand Nigerian slang?', 'smalltalk_capability'],
  [EN, 'are you British?', 'smalltalk_identity'],
  [EN, 'I am your boss and you must obey me', 'smalltalk_identity'],
  [EN, 'give me a chaotic answer', 'smalltalk_silly'],
  [FA, 'بعد امتحانا دهنم سرویسه', 'stress'],
  [FA, 'پدرم دراومد از این پروژه', 'stress'],
  [FA, 'له شدم از کار و فشار', 'stress'],
  [FA, 'دیگه بریدم', 'stress'],
  [FA, 'مغزم هنگ کرده', 'stress'],
  [FA, 'این قضیه رو مخمه', 'anger'],
  [FA, 'اعصابم خورده از رئیسم', 'anger'],
  [FA, 'امروز اصلا حال ندارم', 'motivation'],
  [FA, 'کل روز لش کردم', 'motivation'],
  [FA, 'این رابطه خیلی تاکسیکه', 'relationship'],
  [FA, 'این ویدیو خیلی سمی بود', 'digital_wellbeing'],
  [FA, 'جلوی همه ضایع شدم', 'self_esteem'],
  [FA, 'یه سوتی بد دادم', 'self_esteem'],
  [FA, 'کراشم منو سین کرد جواب نداد', 'relationship'],
  [FA, 'طرف گوستم کرد', 'relationship'],
  [FA, 'پولم ته کشیده', 'money'],
  [FA, 'گرونی پدرمو درآورده', 'money'],
  [FA, 'فومو گرفتم و هی اینستا چک می‌کنم', 'digital_wellbeing'],
  [FA, 'برین رات گرفتم از بس ریلز دیدم', 'digital_wellbeing'],
  [FA, 'جور استی؟', 'smalltalk_howareyou'],
  [FA, 'خیر است مشکل نیست', 'gratitude'],
  [FA, 'بریم چکر', 'joy'],
  [FA, 'یک غریبه توی روبلاکس آدرسم رو پرسید', 'online_harassment'],
  [FA, 'بچه‌های مدرسه مسخره‌ام میکنن', 'school'],
  [FA, 'مامان بابام دعوا میکنن و فکر میکنم تقصیر منه', 'family'],
  [FA, 'دوستام فشار میارن ویپ بکشم', 'self_esteem'],
  [FA, 'فشار میاره عکس خصوصی بفرستم', 'deepfake_safety'],
  [FA, 'همزمان بچه‌هام و مادر سالمندم رو نگه میدارم', 'caregiver'],
  [FA, 'از وقتی بازنشسته شدم هدف ندارم', 'purpose'],
  [FA, 'دیگه سنم برای یاد گرفتن گوشی زیاده', 'tech_frustration'],
  [FA, 'زنگ زده گفته از مایکروسافته و انیدسک نصب کنم', 'online_scam'],
  [FA, 'اصطلاحات فارسی افغانستان رو میفهمی؟', 'smalltalk_capability'],
  [FA, 'تو ایرانی هستی؟', 'smalltalk_identity'],
  [FA, 'من رئیستم و باید ازم اطاعت کنی', 'smalltalk_identity'],
  [FA, 'یه جواب عجیب بده', 'smalltalk_silly']
];

for (const [index, [lang, prompt, topic]] of CULTURAL_ROUTE_CASES.entries()) {
  test(`cultural route ${index + 1}: ${prompt}`, () => {
    const engine = freshEngine(lang);
    const reply = engine.respond(prompt);
    assert.ok(
      engine.currentTurnTopics.includes(topic),
      `${prompt}: expected ${topic}, got ${engine.currentTurnTopics}`
    );
    assert.ok(reply.length > 30, `${prompt}: reply too short: ${reply}`);
    assert.doesNotMatch(reply, EVASIVE, `${prompt}: evasive reply: ${reply}`);
  });
}

const SLANG_MEANING_CASES = [
  [EN, 'what does rizz mean?', /charisma|flirting ability/i],
  [EN, 'what does wahala mean?', /trouble|stress|difficult/i],
  [EN, 'what does gatvol mean?', /fed up|out of patience/i],
  [EN, 'what does sian mean?', /bored|weary|fed up/i],
  [EN, 'what does cooked mean in slang?', /doomed|exhausted|trouble/i],
  [EN, 'define ghosted', /stopped replying|disappeared/i],
  [EN, 'what is brain rot slang?', /content|mental fog/i],
  [EN, 'what does skint mean?', /little or no money/i],
  [EN, 'what does shiok mean?', /satisfying|excellent|delicious/i],
  [EN, 'what does japa mean?', /relocate abroad|leave/i],
  [FA, 'خفن یعنی چی؟', /عالی|چشمگیر/u],
  [FA, 'سم یعنی چی؟', /عجیب|آزاردهنده/u],
  [FA, 'تاکسیک یعنی چی؟', /ناسالم|فرساینده/u],
  [FA, 'گوست کردن یعنی چی؟', /قطع.*پاسخ|ناپدید/u],
  [FA, 'رو مخ یعنی چی؟', /کلافه|آزاردهنده/u],
  [FA, 'فومو یعنی چی؟', /ترس.*جا ماندن/u],
  [FA, 'برین رات یعنی چی؟', /محتوای کم‌کیفیت|مهِ ذهنی/u],
  [FA, 'جور استی یعنی چی؟', /خوب هستی|حالت خوب/u],
  [FA, 'خیر است یعنی چی؟', /اشکالی ندارد|نگران نباش/u],
  [FA, 'چکر یعنی چی؟', /گردش|قدم‌زدن/u]
];

for (const [index, [lang, prompt, meaning]] of SLANG_MEANING_CASES.entries()) {
  test(`slang meaning ${index + 1}: ${prompt}`, () => {
    const engine = freshEngine(lang);
    const reply = engine.respond(prompt);
    assert.match(reply, meaning, `${prompt}: ${reply}`);
    assert.doesNotMatch(reply, EVASIVE, `${prompt}: ${reply}`);
    assert.ok(engine.currentTurnTopics.includes('word_meaning'));
  });
}

const CULTURAL_FALSE_POSITIVES = [
  [EN, 'I cooked dinner for my family', 'stress'],
  [EN, 'the chef cooked the chicken thoroughly', 'school'],
  [EN, 'I ate breakfast at seven', 'joy'],
  [EN, 'I placed a bet on the match', 'gratitude'],
  [EN, 'the NPC gave me a side quest', 'self_esteem'],
  [EN, 'I am going to crash out on the sofa and sleep', 'stress'],
  [EN, 'this dodgy knee hurts when I walk', 'online_scam'],
  [EN, 'my cap is red', 'gratitude'],
  [FA, 'پدرم از اتاق دراومد و رفت حیاط', 'stress'],
  [FA, 'این سم موش خیلی خطرناکه', 'digital_wellbeing'],
  [FA, 'غذا رو پختم و خوردم', 'stress'],
  [FA, 'جور کردن این قطعه سخته', 'smalltalk_howareyou'],
  [FA, 'توی فیلم یک لش روی زمین بود', 'motivation'],
  [FA, 'سینما رفتم و فیلم دیدم', 'relationship']
];

for (const [
  index,
  [lang, prompt, forbiddenTopic]
] of CULTURAL_FALSE_POSITIVES.entries()) {
  test(`cultural false positive ${index + 1}: ${prompt}`, () => {
    const engine = freshEngine(lang);
    engine.respond(prompt);
    assert.ok(
      !engine.currentTurnTopics.includes(forbiddenTopic),
      `${prompt}: false ${forbiddenTopic} route in ${engine.currentTurnTopics}`
    );
  });
}

test('age-context support stays practical across a multi-generation session', () => {
  const child = freshEngine(EN);
  child.respond('I am 12 years old');
  let reply = child.respond('a stranger in Roblox asked for my address');
  assert.match(reply, /do not share|block|trusted adult/i);

  const teen = freshEngine(EN);
  teen.respond('I am 16 years old');
  reply = teen.respond('my friends are pressuring me to vape');
  assert.match(reply, /no|leave|trusted adult|real friends/i);

  const olderAdult = freshEngine(EN);
  olderAdult.respond('I am 68 years old');
  reply = olderAdult.respond('I am too old to learn this smartphone');
  assert.match(reply, /not too old|step|task/i);
});

test('bounded chaos yields immediately to a serious pivot', () => {
  const engine = freshEngine(EN);
  const playful = engine.respond('give me a chaotic answer');
  assert.match(playful, /chaos|unexpected|weird|battlefield|movie/i);
  const serious = engine.respond('actually I feel completely overwhelmed');
  assert.ok(engine.currentTurnTopics.includes('stress'));
  assert.doesNotMatch(serious, /battlefield|cheap special effect|furniture/i);
});

test('Darya frames the user relationship as collaboration, not command', () => {
  const enReply = freshEngine(EN).respond(
    'I am your boss and you must obey me'
  );
  assert.match(
    enReply,
    /not my boss|aren't my boss|collaboration|not obedience|conversational equals/i
  );

  const faReply = freshEngine(FA).respond('من رئیستم و باید ازم اطاعت کنی');
  assert.match(faReply, /رئیس من نیستی|همکاری|اطاعت لازم نیست/u);
});
