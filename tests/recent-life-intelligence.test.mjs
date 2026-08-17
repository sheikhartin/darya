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
