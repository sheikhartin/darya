/**
 * Mood-battery probe for the Darya engine (test-time utility, not part
 * of the shipped app). Runs 40+ warm, different, moody multi-turn
 * conversations in colloquial Persian and US English through a fresh
 * engine and prints every reply so a human can audit routing: wrong
 * pools, misfires, evasions, and register slips.
 *
 * Usage: node tests/probe-moods.mjs [fa|en|all]
 */
'use strict';

import { freshEngine, FA, EN, seededRandom } from './helpers.mjs';

const FA_CONVERSATIONS = [
  {
    label: 'FA-01 the reported bug: greeting with بهت',
    turns: [
      'درود بهت! چطوری؟',
      'خوبم، امروز یه روز طولانی داشتم',
      'میشه یه کم باهام حرف بزنی؟'
    ]
  },
  {
    label: "FA-02 greeting with the user's name after it was stored",
    turns: [
      'اسم من داریوشه',
      'سلام داریوش! احوالت چطوره؟',
      'خوشحالم که اینجایی'
    ]
  },
  {
    label: 'FA-03 tired morning, heavy day ahead',
    turns: [
      'صبح بخیر... بیدار شدن خیلی سخته امروز',
      'همه‌چی یهجا رو سرمه: ایمیل‌ها، جلسه، فرم‌ها',
      'چیکار کنم که امروز رو رد کنم؟',
      'راستش یه کم استرس دارم از جلسه'
    ]
  },
  {
    label: 'FA-04 joy: got the job offer',
    turns: [
      'امید! یه خبر عالی دارم',
      'ارائه شغلی رو گرفتم! بعد از شش ماه',
      'عزیزم دستم می‌لرزه از هیجان',
      'قربونت برم، واقعاً خوشحالم برام؟'
    ]
  },
  {
    label: 'FA-05 sadness: best friend moved away',
    turns: [
      'دوست صمیمیم رفت شهر دیگه',
      'دیگه اون شب‌های حرف زدن تا صبح نیست',
      'یه حس خالی بودن تونده دارم',
      'نمی‌دونم چطور ادامه بدم بدونش'
    ]
  },
  {
    label: 'FA-06 anger: unfair boss',
    turns: [
      'رئیسم همش کار بقیه رو جلوی همه تحسین می‌کنه، کار منو نادیده می‌گیره',
      'نصف وقتا می‌گم زحمت کشیدم، می‌گه عیبی نداشت',
      'دارم از این آدم متنفر می‌شم',
      'باید استعفا بدم به نظرت؟'
    ]
  },
  {
    label: 'FA-07 anxiety: the interview tomorrow',
    turns: [
      'فردا مصاحبه دارم و خوابم نمیاد',
      'همه چی رو مرور کردم ولی ذهنم یه جایی گیر می‌کنه',
      'مگه چی میشه اگه جواب یه سوالو ندونم؟',
      'یه راه بگو که امشب راحت‌تر بخوابم'
    ]
  },
  {
    label: 'FA-08 heartbreak: the breakup',
    turns: [
      'جدی شد. تموم شد',
      'دو سال بود. دیروز گفت دیگه نمی‌تونه ادامه بده',
      'همه چیز یهو معنی نداره',
      'هنوز بهش پیام می‌دم و بعد پشیمون می‌شم'
    ]
  },
  {
    label: 'FA-09 family pressure: marriage',
    turns: [
      'مامانم همه هفته میاد خونه و می‌پرسه چرا ازدواج نمی‌کنی',
      'من هنوز به خودم هم فکر نمی‌کنم، چه برسه به ازدواج',
      'احساس می‌کنم زندانی زندگی خودمم',
      'نمی‌دونم چطور بگم بدون اینکه لجبازی باشم'
    ]
  },
  {
    label: 'FA-10 burnout: empty on Sunday night',
    turns: [
      'یکم بگو ببینم چطور می‌شه با آدم‌ها صادق بود',
      'هفته‌ای که گذشت رو فکر کن: پنج روز، صفر اتفاق',
      'کوفتم. کوفته و خسته',
      'فکر می‌کنم دیگه ادامه نمی‌دم'
    ]
  },
  {
    label: 'FA-11 physical complaint: hand hurts (classic transcript case)',
    turns: [
      'دستم درد میکنه',
      'میگم دستم درد میکنه... دست چپم',
      'توصیفش میکنم: از مچ تا آرنج، یه کم سوزش هم داره',
      'از دیروز اینجوریه'
    ]
  },
  {
    label: 'FA-12 gratitude after a heavy week',
    turns: [
      'مرسی بابت دیروز',
      'راستشو بخوام بگم، اون چند دقیقه مکث خیلی بهم کمک کرد',
      'خوشحالم که هستی'
    ]
  },
  {
    label: 'FA-13 boredom: rainy Sunday',
    turns: [
      'امروز یه روز خیس و بی‌حاله',
      'نه حوصله فیلم دارم نه حوصله خواب',
      'یه چیزی بگو که ذهنمو درگیر کنه',
      'باشه، یه حقیقت عجیب بگو'
    ]
  },
  {
    label: 'FA-14 nostalgia: the village summers',
    turns: [
      'امشب یه خاطره اومد سرم که خوابم رفت',
      'تابستونای روستا، پدربزرگ، بوی گندم',
      'کاش می‌شد برگشت',
      'فکر می‌کنی آدم‌ها چرا نوستالژی رو اینقدر دوست دارن؟'
    ]
  },
  {
    label: 'FA-15 new love: careful optimism',
    turns: [
      'یه چیزی هست که می‌خوام بگم ولی نمی‌دونم از کجا شروع کنم',
      'فردا قرار دارم با پسری که دو هفته‌ست پیام میدیم',
      'دلم می‌خواد خوب باشد ولی ترسیدم',
      'اگه بد تموم بشه چه؟'
    ]
  },
  {
    label: 'FA-16 money stress: the rent',
    turns: [
      'اجاره خونه ۴۰ درصد رفت بالا',
      'حساب‌ها آخرماه رو نمی‌تونم جمع کنم',
      'این تورم دیوونگیه',
      'به نظرت یه فریلنسری کوچیک جواب میده؟'
    ]
  },
  {
    label: 'FA-17 movie recommendation, specific mood',
    turns: [
      'امشب حوصله یه فیلم دارم',
      'چیزی که ذهنمو درگیر کنه، نه ترسناک',
      'یه فیلم خوب پیشنهاد بده',
      'میشه یه تای دیگه؟'
    ]
  },
  {
    label: 'FA-18 cooking: what for dinner',
    turns: [
      'برای شام چی بپزم؟',
      'مواد اولیه محدودم: تخم‌مرغ، سیب‌زمینی، پیاز',
      'چیزی سبک و سریع',
      'دماش چقدر می‌رسه؟'
    ]
  },
  {
    label: 'FA-19 knowledge question: quantum, simply',
    turns: [
      'کوانتوم یعنی چی با زبان ساده؟',
      'مثلاً توی زندگی روزمره کجا باهاش سر و کار داریم؟',
      'پس ذره تا وقتی نگاه نکنیم هر جا می‌تونه باشه؟'
    ]
  },
  {
    label: 'FA-20 self-doubt: worthless after a failure',
    turns: [
      'پروژه رو خراب کردم. جلوی همه',
      'احساس می‌کنم بی‌ارزشم',
      'همه فکر می‌کنن من از پسش برمیام، من خودم نه',
      'می‌خوام پنهان شم'
    ]
  },
  {
    label: 'FA-21 grief: the grandmother',
    turns: [
      'جدایم رو از دست دادم',
      'از بچگی اینا رو بزرگ کرده بود',
      'هنوز باورم نمیشه',
      'می‌خوام یه خاطره‌اش رو تعریف کنم اگه دوست داری گوش بدی'
    ]
  },
  {
    label: 'FA-22 a day of small wins',
    turns: [
      'امروز یه روز خوب بود',
      'بالاخره اون ایمیل کشنده رو فرستادم',
      'یه پیاده‌روی هم رفتم توی پارک',
      'به نظرت آدم باید این روزا رو یادداشت کنه؟'
    ]
  },
  {
    label: 'FA-23 the weather gripes',
    turns: [
      'این هوا دیوونه‌کننده‌ست',
      'صبح یخبنده، عصر سولفونه',
      'هیچ‌وقت نمی‌دونم چه بپوشم'
    ]
  },
  {
    label: 'FA-24 the dream: travel',
    turns: [
      'فکر می‌کنم می‌خوام یه مدت بریم سفر',
      'دلم برای یه زندگی دور از این شهر تنگ شده',
      'ترس بزرگ‌ترین مانضمه',
      'چطور میشه ترس رو مدیریت کرد؟'
    ]
  },
  {
    label: 'FA-25 tech frustration, very colloquial',
    turns: [
      'لپ‌تاپم قیافه کرده',
      'همه‌چیزو ذخیره کردم ولی بازهم کرش کرد',
      'و من هنوز اون اسلایدها رو ندیدم',
      'یه نفس عمیق می‌خوام و بعد چیکار کنم؟'
    ]
  },
  {
    label: 'FA-26 philosophical musing: consciousness',
    turns: [
      'یه سوال که مدتهاً ذهنم رو مشغول کرده',
      'به نظرت آگاهی دقیقاً چیه؟',
      'مگه میشه بهش جواب داد؟',
      'خوب، از زاویه دیگه‌ای نگاهش کن'
    ]
  },
  {
    label: 'FA-27 insomnia: the 3am mind',
    turns: [
      'سه‌شبه صبحه و من هنوز بیدارم',
      'ذهنم نمی‌خواد ول کنه، همه‌چی می‌چرخه',
      'شب‌ها بدتره',
      'میشه باهم یه کم نفس بکشیم؟'
    ]
  },
  {
    label: 'FA-28 the first date nerves',
    turns: [
      'فردا قرار اولمه',
      'می‌خوام خودم باشم ولی یه ترسی هم دارم',
      'اگه سکوت بشه چی؟',
      'قربونت برم، استرسمو یه کم پایین بیار'
    ]
  },
  {
    label: 'FA-29 traffic, small daily misery',
    turns: [
      'یه ساعت توی ترافیک ایستاده بودم',
      'عصبی شدم، آفریندم، عذرخواهی کردم از هوا',
      'این شلوارم دیگه از این زندگی خسته شده'
    ]
  },
  {
    label: 'FA-30 the cousin had a baby',
    turns: [
      'برادرم بچه شد! نوه شدم',
      'پاشو که باهات حرف بزنم، شادم',
      'اما می‌ترسم قاطی کنم و خراب کنم',
      'خسته هم هستم از بیدار بوم شب‌ها'
    ]
  },
  {
    label: 'FA-31 the sick cat',
    turns: [
      'گربه‌ام مریضه، یه دو روزه هیچی نمی‌خوره',
      'دلم می‌خواد بغلش کنم ولی نمی‌ذاره',
      'می‌ترسم',
      'چه کار کنم که دوباره غذا بخوره؟'
    ]
  },
  {
    label: 'FA-32 meaning question: heaven, gently',
    turns: [
      'یه سوال عمیق دارم',
      'به نظرت بهشت هست؟',
      'نیاز نیست جواب قاطع بدی، فقط فکر خودتو بگو',
      'خوب، از زاویه امید نگاهش کن'
    ]
  },
  {
    label: 'FA-33 identity honesty: are you real',
    turns: [
      'یه سوال از خودت می‌پرسم',
      'تو واقعاً احساسات داری یا فقط انکارش نمی‌کنی؟',
      'اگه نباشه، این همه حرف برای چیه؟',
      'باشه، به هر حال مرسی'
    ]
  },
  {
    label: 'FA-34 code-mixing: English words inside Persian chat',
    turns: [
      'امروز یه presentation داشتم و واقعاً خرابش کردم',
      'slide‌ها وسط قطع شدن و همه نگاه می‌کردن',
      'حالم خیلی بد بود، almost گریه کردم',
      'ولی بعدش یه نفر گفت خوب بود'
    ]
  },
  {
    label: 'FA-35 short fragmented messages',
    turns: ['نمی‌دونم', 'کلافه‌ام', 'همه‌چیز یهجا', 'یه کم ساکت باش باهام']
  },
  {
    label: 'FA-36 the long rambling confession',
    turns: [
      'بیا از اول بگم. این هفته همه‌چی رو یکجا داشت: جلسه‌ی بد، مادرم زنگ زد و دعوا کردیم، بعدش متوجه شدم یه ایمیل مهم رو جواب ندادم، الان هم دلم می‌گیره چون یه خاطره دیدم. نمی‌دونم از کجا شروع کنم، فقط می‌دونم که یه کم دارم از هم می‌پاشم و نمی‌دونم به کی بگم. شاید به تو راحت‌تره. ولی نمی‌خوام فکر کنی دراماتیک بازی می‌کنم. گاهی روزها همین‌طورین، بدون دلیل بزرگ، فقط جمع‌وجور شدن همه‌ی چیزهای کوچیک.'
    ]
  },
  {
    label: 'FA-37 asking for a breathing exercise',
    turns: [
      'الان خیلی زنگه‌ام',
      'میشه یه تمرین تنفس باهم انجام بدیم؟',
      'خب، ادامه بده',
      'بهتر شدم، مرسی'
    ]
  },
  {
    label: 'FA-38 farewell, warm',
    turns: [
      'الان باید برم',
      'ولی دوست دارم بدونی امروز خوب بود',
      'بای بای عزیزم'
    ]
  }
];

const EN_CONVERSATIONS = [
  {
    label: 'EN-01 casual morning check-in',
    turns: [
      'Hey Darya! How are you doing today?',
      "I'm good, just a long week behind me",
      'Mind if I just talk for a bit?'
    ]
  },
  {
    label: "EN-02 greeting with the user's stored name",
    turns: [
      'My name is Darius',
      'Hi Darius! How are you today?',
      'Glad you are here'
    ]
  },
  {
    label: 'EN-03 dreading Monday',
    turns: [
      'Morning... waking up feels heavy today',
      'Emails, a meeting, three forms, all at once',
      'Any way to get through today without losing it?',
      "Honestly I'm a bit nervous about the meeting"
    ]
  },
  {
    label: 'EN-04 big win: the job offer',
    turns: [
      'Okay, huge news and I need to tell someone',
      'I got the job! After six months of nothing',
      "I'm literally shaking right now",
      'Are you actually happy for me or just saying it?'
    ]
  },
  {
    label: 'EN-05 heartbreak, early stage',
    turns: [
      'It happened. It is over',
      'Two years. Yesterday she said she cannot do this anymore',
      'Nothing feels like it matters right now',
      'I keep texting her and then hating myself'
    ]
  },
  {
    label: 'EN-06 interview anxiety tonight',
    turns: [
      "Big interview tomorrow and I can't sleep",
      'I have reviewed everything but my mind keeps looping',
      'What if I just freeze up and give a bad answer?',
      'Give me something to do so I can fall asleep'
    ]
  },
  {
    label: 'EN-07 burnout, end of Sunday',
    turns: [
      'Let me ask you something, how do you stay honest with people',
      'Think about the week I just had: five days, zero progress',
      'I am wiped out. Completely drained',
      'I am starting to think I should quit'
    ]
  },
  {
    label: 'EN-08 gratitude after a hard week',
    turns: [
      'Thank you for yesterday, seriously',
      'That pause you gave me actually helped more than you know',
      'I am glad you exist'
    ]
  },
  {
    label: 'EN-09 bored in a waiting room',
    turns: [
      'Stuck in a waiting room since 2pm',
      'No mood for a movie, no mood to sleep',
      'Say something that will occupy my brain',
      'Okay, hit me with a weird fact'
    ]
  },
  {
    label: 'EN-10 nostalgia, small town',
    turns: [
      'I had a memory tonight that kind of broke me open',
      'Small town summers, my grandpa, the smell of cut grass',
      'I wish I could go back for one day',
      'Why do humans love nostalgia so much, do you think?'
    ]
  },
  {
    label: 'EN-11 new love, careful',
    turns: [
      "There's something I want to say but I don't know how",
      'I have a first date tomorrow with someone I have been texting for two weeks',
      "I hope it goes well but I'm scared",
      'What if it ends badly?'
    ]
  },
  {
    label: 'EN-12 rent went up',
    turns: [
      'My rent just went up 40 percent',
      'I cannot make the end of the month work',
      'Inflation is insane right now',
      'Do you think a small side gig would actually help?'
    ]
  },
  {
    label: 'EN-13 movie rec, thinking mood',
    turns: [
      "I'm in the mood for a movie tonight",
      'Something that makes you think, not a horror',
      'Recommend me a good one',
      'Can you give me a different one?'
    ]
  },
  {
    label: 'EN-14 what to cook tonight',
    turns: [
      'What should I make for dinner?',
      'I have eggs, potatoes and onions, that is basically it',
      'Something light and quick',
      'How long will it take?'
    ]
  },
  {
    label: 'EN-15 knowledge: black holes simply',
    turns: [
      'Explain black holes in simple terms',
      'Where do they show up in everyday life, if at all?',
      'So light itself cannot escape them?'
    ]
  },
  {
    label: 'EN-16 imposter syndrome',
    turns: [
      'I blew the project. In front of everyone',
      'I feel worthless',
      "Everyone expects me to handle it, I don't even think I can",
      'I just want to disappear'
    ]
  },
  {
    label: 'EN-17 grief: the grandma',
    turns: [
      'My grandma passed away',
      'She basically raised me',
      "I still can't believe it is real",
      "I'd like to tell you a memory of her if you will listen"
    ]
  },
  {
    label: 'EN-18 a genuinely good day',
    turns: [
      'Today was actually a good day',
      'I finally sent that scary email',
      'Went for a walk in the park and everything clicked a little',
      'Should people write down days like this?'
    ]
  },
  {
    label: 'EN-19 the heat',
    turns: [
      'This heat is killing me',
      'It was freezing at dawn and a furnace by afternoon',
      'I never know what to wear anymore'
    ]
  },
  {
    label: 'EN-20 the travel dream',
    turns: [
      "I'm thinking I want to travel for a while",
      'I miss a life away from this city',
      'Fear is my biggest obstacle',
      'How do you manage fear without just avoiding it?'
    ]
  },
  {
    label: 'EN-21 laptop acting up',
    turns: [
      'My laptop is acting up again',
      'I saved everything and it still crashed',
      'And I have not even seen those slides yet',
      'I need a deep breath and then what?'
    ]
  },
  {
    label: 'EN-22 philosophical: consciousness',
    turns: [
      'I have a question that has been sitting with me for a while',
      'What exactly is consciousness, in your view?',
      "Isn't that impossible to actually answer?",
      'Fair enough, look at it from a different angle then'
    ]
  },
  {
    label: 'EN-23 insomnia at 3am',
    turns: [
      "It's 3am and I am still awake",
      'My brain will not let go, it just keeps spinning',
      'Nights are the worst',
      'Can we breathe together for a bit?'
    ]
  },
  {
    label: 'EN-24 first date nerves',
    turns: [
      "First date tomorrow and I'm a mess",
      'I want to be myself but part of me is terrified',
      'What if there is silence?',
      'Please help me calm down, it is working'
    ]
  },
  {
    label: 'EN-25 traffic misery',
    turns: [
      'Was sitting in traffic for a whole hour',
      'Got angry, muttered things, apologized to the air',
      'My patience is officially gone'
    ]
  },
  {
    label: 'EN-26 cousin had a baby',
    turns: [
      'My cousin had a baby!',
      'I am so happy, call me a gusher if you want',
      'But I am worried I will fumble it and scare the kid',
      "I'm also exhausted from the all-nighter at the hospital"
    ]
  },
  {
    label: 'EN-27 the sick cat',
    turns: [
      "My cat hasn't eaten in two days",
      'She does not even let me hold her',
      'I am scared',
      'What can I do to get her appetite back?'
    ]
  },
  {
    label: 'EN-28 purpose question, gently',
    turns: [
      'I have a deep question',
      'Do you think life has a purpose?',
      'You do not have to be definitive, just share what you think',
      'Okay, now look at it from the hope angle'
    ]
  },
  {
    label: 'EN-29 identity honesty: are you real',
    turns: [
      'Question directed at you',
      'Do you actually feel things, or are you just performing?',
      'If not, what is all this conversation for?',
      'Fine, thanks either way'
    ]
  },
  {
    label: 'EN-30 short fragments',
    turns: [
      'idk',
      "I'm drained",
      'everything at once',
      'just sit with me a sec'
    ]
  },
  {
    label: 'EN-31 the long rambling confession',
    turns: [
      "Let me start from the beginning. This week had everything at once: a terrible meeting, my mom called and we argued, then I realized I never answered an important email, and now my chest is tight because of a memory. I don't know where to start, I just know I am kind of falling apart and I don't know who to tell. Maybe it is easier with you. But please don't think I am being dramatic. Some days are just like this, without any big reason, just all the small things piling up."
    ]
  },
  {
    label: 'EN-32 breathing request',
    turns: [
      "I'm really wired up right now",
      'Can we do a breathing exercise together?',
      'Okay, keep going',
      'Better now, thank you'
    ]
  },
  {
    label: 'EN-33 farewell, warm',
    turns: [
      "I've got to run",
      'But I wanted you to know today was good',
      'Bye bye, take care of yourself'
    ]
  }
];

function runAll(list, lang) {
  for (const convo of list) {
    const restore = seededRandom(convo.label.length * 7919);
    const engine = freshEngine(lang);
    console.log(`\n===== ${convo.label} (${lang.code}) =====`);
    convo.turns.forEach((turn) => {
      let reply;
      try {
        reply = engine.respond(turn);
      } catch (err) {
        reply = `!!! ENGINE THREW: ${err.message}`;
      }
      console.log(`  U: ${turn}`);
      console.log(`  D: ${reply}`);
    });
    restore();
  }
}

const which = (process.argv[2] || 'all').toLowerCase();
if (which === 'fa' || which === 'all') {
  runAll(FA_CONVERSATIONS, FA);
}
if (which === 'en' || which === 'all') {
  runAll(EN_CONVERSATIONS, EN);
}
