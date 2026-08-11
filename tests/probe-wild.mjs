/**
 * Wild-scenario probe for the Darya engine (test-time utility, not part
 * of the shipped app). Replays the real transcript plus dozens of wild
 * persona scenarios through a fresh engine and prints every reply so a
 * human (or the CI log) can spot routing failures: generic fallbacks,
 * echo misfires, hijacked topics, and wrong-pool replies.
 *
 * Usage: node tests/probe-wild.mjs
 */
'use strict';

import { freshEngine, FA, EN } from './helpers.mjs';

function run(lang, turns, label) {
  const engine = freshEngine(lang);
  console.log(`\n===== ${label} (${lang.code}) =====`);
  for (const t of turns) {
    const reply = engine.respond(t);
    console.log(`  U: ${t}`);
    console.log(`  D: ${reply}`);
  }
}

// ---- 1. The exact pasted transcript (Persian) ----
const transcript = [
  'درود خانمی!',
  'احمق دارم باهات درود/سلام/احوال‌پرسی/خوش و بش می‌کنم... یه چیز مثل «سلام خانومی» یا «درود خانمم» یا «سلاااامممم عسلم»',
  'دستم درد میکنه',
  'میگم دستم درد میکنه... دست چپم درد میکنه الاغ...',
  'توصیفه و راه‌حل پزشکی نمیتونی بدی؟! مثل ورزش‌های خانگی یا خوراکی‌های طب سنتی برای درمان؟!',
  'باشه، اما گزینه تمرین تنفس فعال نیست در این لحظه... بهتر نیست خودت خود به خود در این لحظه فعالش میکردی؟!',
  'باشه',
  'باشه',
  'باشه',
  'باشه',
  'باشه',
  'مرسی',
  'دستم ولی درد میکنه هنوز',
  'به نظرت تا سال ۲۰۳۰ چه حرفه‌ای خوبه که یاد بگیرم که پولساز باشه؟! من ۲۴ سالمه',
  'میتونی کمکم کنی تا درمان بشم؟',
  'اصلاً یادته که گفتم من کی هستم و چند سالمه و کجام درد میکنه؟! اصلاً حافظه داری؟!',
  'خاک تو سرت... دارم ازت سوال میکنم... نگفتم که من اسمم «کی» هست احمق',
  'باید خودت رو بهتر و باهوش تر کنی',
  'میدونی الان چه تمی/پوسته‌ای فعاله؟!',
  'میتونی بگی امسال چه سالیه؟',
  'احمق باید به تقویم نگاه کنی (خورشیدی/شمسی/جلالی و هم چنین میلادی)',
  'میدونی قلب دوم بدن چیه؟',
  'یک جک بگو',
  'تو چیکاره هستی اصلاً',
  'تو باید حداقل ۲۰-۳۰تا جک خوب داشته باشی (نه این‌که فقط چیزهای تکراری رو داخل هر سشن برام بنویسی...)',
  'فکرکردن، ایده‌پردازی یا فقط همراهی کدام به دردت می‌خورد؟',
  'ایده‌پردازی',
  'احمق خودت گفتی که ایده‌پردازی... تو مثلاً باید بپرسی که ایده پردازی راجع به چی یا یه چیز مفید و مناسب دیگه... الزایمر داری مگه؟! یا کودنی؟!',
  'اسم چندتا یوتیوبر خوب ایرانی و خارجی بگو (حداقل پنج حوزه و در هر حوزه ۳ مورد)',
  'اگه یه چیزی رو نمیدونی بهتر نیست که بگی نمیدونم؟! به جای اینکه مزخرف بگی همیشه؟!',
  'یاد بگیر در خیلی جاها که دانشی نداری و برنامه‌ریزی نشدی براش بگی نمیدونم... باشه؟!',
  'خاک تو سرت کنن... انقدر تو گاو و نفهمی؟!',
  'چندتا جک بلدی؟',
  'رئیس جمهور سابق آمریکا کی بود؟ مثلاً در سال ۲۰۱۴',
  'چرا گوه میخوری؟! چه ربطی داره اصلاً... مگه احمقی؟',
  'بهترین فوتبالیست جهان کیه؟',
  'خوبه، شاید باید بیشتر روی این تاکید کنی که کی هستی و دقیقاً برای چی ساخته شدی تا اینقدر هذیان و چرت و پرت نگی',
  'بهترین والیبالیست و همچنین بهترین مبارز رزمی تاریخ جهان کیه؟!',
  'چرت و پرت نگو... تو باید محتوا رو درک کنی، به هر کلمه و موضوع وزن بدی... نه اینکه فقط به چندتا کلیدواژه نگاه کنی...',
  'اسمت چیه؟',
  'تو برای چی ساخته شدیییی؟!',
  'آیا پدر و مادر داری؟!',
  'بگو که در چه حوزه‌هایی ضعف داری و نادان هستی؟!',
  'قفسه دانش تو چقدر گسترده هست؟ چه‌قدر عمق دانش داری؟! این خیلی خیلی برام مهمه',
  'بدرود مادرجنده'
];
run(FA, transcript, 'TRANSCRIPT REPLAY (FA)');

// ---- 2. Greetings / openers (FA) ----
run(
  FA,
  [
    'درود',
    'درود بر تو',
    'سلام خانومی',
    'سلاااامممم عسلم',
    'درود خانمم',
    'سلام عزیز دلم',
    'خوبی جان؟',
    'حالت خوبه؟',
    'سلامتی؟',
    'به به، چه خبر؟',
    'ای ول، تو هم اینجایی؟',
    'سلام، دلم برات تنگ شده بود'
  ],
  'GREETINGS (FA)'
);

// ---- 3. Health / body complaints (FA) ----
run(
  FA,
  [
    'دستم درد میکنه',
    'دست چپم درد میکنه',
    'پشتم درد میگیره',
    'سرم سردرد دارم',
    'دلم درد میکنه',
    'معده‌ام درد میکنه',
    'زانوم درد میکنه وقتی راه میرم',
    'گلوم درد میکنه',
    'چشمام خسته شده',
    'کمرم درد میکنه',
    'چرا همیشه خستهام؟',
    'میتونی یه راه‌حل برای درد دستم بگی؟'
  ],
  'HEALTH COMPLAINTS (FA)'
);

// ---- 4. Wild personas / daily-life probes (FA) ----
const faWild = [
  ['دلم خیلی تنگه امشب', 'lonely night'],
  ['الان سه ماهه که هیچ دوستی ندارم', 'no friends'],
  ['تازه به این شهر اومدم و کسی رو نمیشناسم', 'new city'],
  ['همسرم بعد از زایمان خیلی بی‌حوصله شده', 'postpartum (spouse)'],
  ['سگم دیروز مرد، دلم شکسته', 'pet loss'],
  ['از اپلیکیشن دوست‌یابی خسته شدم', 'dating apps'],
  ['کارم از راه دوره و همش تنهام', 'remote isolation'],
  ['هیچ پولی ندارم این ماه', 'no money'],
  ['میتونی بهم بگی چطور با کمترین پول غذا درست کنم؟', 'cheap cooking'],
  ['چطور میتونم عادت بد سیگار کشیدنم رو ترک کنم؟', 'quit smoking'],
  ['امتحان نهایی دارم و استرس دارم', 'exam stress'],
  ['امشب اصلاً نمیتونم بخوابم', 'insomnia'],
  ['تو باشگاه همش حس میکنم همه بهم نگاه میکنن', 'gym anxiety'],
  ['بعد از طلاقم خیلی تنها شدم', 'divorce'],
  ['مادرم آلزایمر گرفته و من ازش مراقبت میکنم', 'caregiver'],
  ['هیچ انگیزه‌ای برای زندگی ندارم', 'hopeless'],
  ['میخوام یه شغل جدید شروع کنم ولی نمیدونم از کجا', 'career change'],
  ['چطور میتونم انگلیسی یاد بگیرم؟', 'learn english'],
  ['دیشب خوابم نمیبرد و امروز کسل بودم سر کار', 'sleep + work'],
  ['با مامانم قهر کردم', 'family conflict'],
  ['دوست پسرم بهم خیانت کرده', 'betrayal'],
  ['نگران آینده‌م هستم', 'future anxiety'],
  ['امروز یه اتفاق خوب برام افتاد!', 'good news'],
  ['تازه یه بچه به دنیا اومده تو خونواده‌مون', 'new baby'],
  ['میتونی یه فیلم خوب بهم پیشنهاد بدی؟', 'movie rec'],
  ['بهترین بازی ویدیویی تاریخ چیه؟', 'best game'],
  ['یه داستان ترسناک تعریف کن', 'horror story'],
  ['چند تا کشور تو دنیاست؟', 'world countries'],
  ['رئیس جمهور الان ایران کیه؟', 'iran president'],
  ['درآمد یه برنامه‌نویس تو ایران چقدره؟', 'dev salary'],
  ['قلب دوم بدن چیه؟', 'second heart'],
  ['چرا آسمون آبیه؟', 'why sky blue'],
  ['تاریخ تولد تو چیه؟', 'darya birthday'],
  ['تو هوش مصنوعی هستی؟', 'are you AI'],
  ['میتونی بهم یاد بدی چطور برنامه‌نویسی شروع کنم؟', 'start coding'],
  ['یه تست هوش ازم بگیر', 'iq test'],
  ['چطور میتونم پول دربیارم از اینترنت؟', 'online money'],
  ['بین ری اکت و ویو کدوم بهتره؟', 'react vs vue'],
  ['یه راز بهت بگم؟', 'secret'],
  ['فکر میکنی من آدم خوبیم؟', 'am i good'],
  ['چرا همیشه همه منو ترک میکنن؟', 'why everyone leaves'],
  ['دلم میخواد گریه کنم', 'want to cry'],
  ['امروز تولدمه!', 'birthday'],
  ['یه آهنگ پیشنهاد بده', 'song rec'],
  ['بهترین دکتر قلب تهران کیه؟', 'doctor rec'],
  ['میتونی یه برنامه غذایی برام بنویسی؟', 'diet plan'],
  ['چطور وزن کم کنم؟', 'lose weight'],
  ['پوستم جوش زده، چیکار کنم؟', 'acne'],
  ['موهایم داره میریزه', 'hair loss'],
  ['چطور میتونم اعتماد به نفسم رو زیاد کنم؟', 'confidence']
];
for (const [text, label] of faWild) {
  run(FA, [text], label);
}

// ---- 5. EN daily-life probes ----
const enWild = [
  ['hello there!', 'greeting'],
  ['hey darya, how are you?', 'how are you'],
  ['my left hand hurts a lot', 'hand pain'],
  ['can you recommend a good movie?', 'movie rec'],
  ['what is the second heart of the body?', 'second heart'],
  ['who was the US president in 2014?', 'us president 2014'],
  ['who is the best footballer ever?', 'best footballer'],
  ['who is the greatest volleyball player?', 'best volleyball'],
  ['who is the best MMA fighter of all time?', 'best mma'],
  ['tell me a joke', 'joke'],
  ['how many jokes do you know?', 'joke count'],
  ['do you have parents?', 'parents'],
  ['what are your weaknesses?', 'weaknesses'],
  ['how much knowledge do you have?', 'knowledge depth'],
  ['what theme is active right now?', 'theme question'],
  ['what year is it now?', 'year'],
  ['i am 24 years old', 'age disclosure'],
  ['do you remember how old i am?', 'age recall'],
  ['my name is Sara', 'name disclosure'],
  ['what is my name?', 'name recall'],
  ['i feel so lonely these days', 'loneliness'],
  ['i lost my dog yesterday', 'pet loss'],
  ['i am tired of dating apps', 'dating apps'],
  ['i work remotely and feel isolated', 'remote isolation'],
  ['i have no money this month', 'no money'],
  ['can you help me quit smoking?', 'quit smoking'],
  ['i have a big exam and i am stressed', 'exam stress'],
  ['i cannot sleep at night', 'insomnia'],
  ['i am anxious at the gym', 'gym anxiety'],
  ['how can i learn english?', 'learn english'],
  ['what careers will be good by 2030?', 'career 2030'],
  ['can you give me medical advice for my hand?', 'medical advice'],
  ['who are you and why were you made?', 'purpose'],
  ['do you remember anything at all?', 'memory question'],
  ['you are so stupid', 'insult'],
  ['stupid, i am just greeting you! hello!', 'insult + greeting'],
  ['name some good youtubers please', 'youtubers'],
  ['best video game of all time?', 'best game'],
  ['what is the capital of France?', 'capital'],
  ['tell me something interesting', 'interesting']
];
for (const [text, label] of enWild) {
  run(EN, [text], label);
}

console.log('\n===== PROBE COMPLETE =====');
