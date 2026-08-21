/**
 * Darya - curated factual entries (major sporting events and history).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'fifa_world_cup',
      keywords: [
        'جام جهانی فوتبال',
        'فیفا',
        'جام جهانی چیه',
        'fifa world cup',
        'what is the world cup'
      ],
      weak: ['جام جهانی', 'فیفا', 'world cup', 'fifa'],
      weakSafe: true,
      hints: ['فوتبال', 'چیه', 'چیست', 'football', 'what', 'soccer'],
      fa: 'جام جهانی فوتبال مهم‌ترین تورنمنت ملی فوتبال است که فیفا هر چهار سال برگزار می‌کند. اولین دوره در ۱۹۳۰ در اروگوئه برگزار شد و میزبان قهرمان شد. برزیل با پنج قهرمانی رکورددار است و بعد از آن آلمان و ایتالیا با چهار. این رویداد پربیننده‌ترین مسابقه‌ی ورزشی جهان است.',
      en: 'The FIFA World Cup is the most important national football tournament, held by FIFA every four years. The first edition was in 1930 in Uruguay, and the host won. Brazil holds the record with five titles, followed by Germany and Italy with four. It is the most-watched sporting event in the world.'
    },
    {
      id: 'world_cup_history',
      keywords: [
        'تاریخچه جام جهانی',
        'قهرمان های جام جهانی',
        'فینال ۲۰۲۲',
        'world cup winners',
        'world cup history',
        '2022 world cup final',
        'who has won the most world cups',
        'most world cups',
        'world cup champions',
        'قهرمانان جام جهانی'
      ],
      weak: [
        'قهرمان جام جهانی',
        'تاریخچه جام جهانی',
        'world cup history',
        'world cup winners',
        'world cups',
        'world cup'
      ],
      weakSafe: true,
      hints: ['فوتبال', 'قهرمان', 'آرژانتین', 'football', 'champion', 'final'],
      fa: 'نکته‌های تاریخ جام جهانی: اروگوئه ۱۹۳۰ نخستین قهرمان بود؛ برزیل با پنج قهرمانی (۱۹۵۸ تا ۲۰۰۲) رکورددار است؛ فینال ۲۰۲۲ قطر با قهرمانی آرژانتین و ستاره شدن لیونل مسی در ضربات پنالتی برابر فرانسه تمام شد؛ و دوره‌ی ۲۰۲۶ با ۴۸ تیم و میزبانی مشترک آمریکا، کانادا و مکزیک، بزرگ‌ترین جام جهانی تاریخ خواهد بود.',
      en: 'World Cup history notes: Uruguay was the first champion in 1930; Brazil leads with five titles (1958 to 2002); the 2022 final in Qatar ended with Argentina beating France on penalties and Lionel Messi completing his legacy; and the 2026 edition, with 48 teams co-hosted by the USA, Canada, and Mexico, will be the largest World Cup ever.'
    },
    {
      id: 'volleyball_history',
      keywords: [
        'تاریخچه والیبال',
        'والیبال چیه',
        'مخترع والیبال',
        'volleyball history',
        'who invented volleyball',
        'what is volleyball'
      ],
      weak: ['والیبال', 'volleyball'],
      weakSafe: true,
      hints: ['تاریخچه', 'چیه', 'اختراع', 'history', 'what', 'invented'],
      fa: 'والیبال را ویلیام جی. مورگان در ۱۸۹۵ در آمریکا اختراع کرد؛ اول اسمش «مینتونت» بود و به‌عنوان ورزشی کم‌برخورد برای داخل سالن طراحی شد. فدراسیون جهانی آن (FIVB) در ۱۹۴۷ شکل گرفت و از المپیک ۱۹۶۴ توکیو وارد بازی‌های المپیک شد. امروز برزیل، ایتالیا، لهستان و آمریکا از قدرت‌های کلاسیک آن هستند.',
      en: 'Volleyball was invented by William G. Morgan in 1895 in the United States; it was first called "mintonette" and designed as a low-contact indoor sport. Its world federation (FIVB) formed in 1947, and it entered the Olympics at Tokyo 1964. Today Brazil, Italy, Poland, and the USA are among its classic powers.'
    },
    {
      id: 'volleyball_iran',
      keywords: [
        'والیبال ایران',
        'تیم ملی والیبال ایران',
        'قهرمانی والیبال آسیا',
        'iran volleyball',
        'iran national volleyball team',
        'iran asian champions'
      ],
      weak: ['والیبال ایران', 'تیم ملی والیبال', 'iran volleyball'],
      weakSafe: true,
      hints: ['ایران', 'قهرمانی', 'آسیا', 'iran', 'champion', 'asia'],
      fa: 'تیم ملی والیبال ایران در سال‌های ۲۰۱۰ تا ۲۰۲۰ به یکی از قدرت‌های آسیا و جهان تبدیل شد و چندین بار قهرمان آسیا شد. نسل طلایی‌اش (سعید معروف، سید محمد موسوی و دیگران) در لیگ جهانی و المپیک هم درخشیدند. والیبال در ایران از محبوب‌ترین ورزش‌های تیمی بعد از فوتبال است.',
      en: 'Iran’s national volleyball team became one of Asia’s and the world’s powers between 2010 and 2020, winning the Asian championship several times. Its golden generation (Saeid Marouf, Seyed Mohammad Mousavi, and others) also shone in the World League and Olympics. In Iran, volleyball is among the most popular team sports after football.'
    },
    {
      id: 'olympics_overview',
      keywords: [
        'المپیک چیه',
        'تاریخچه المپیک',
        'المپیک تابستانی',
        'olympics',
        'history of the olympics',
        'what are the olympics'
      ],
      weak: ['المپیک', 'olympics', 'olympic'],
      weakSafe: true,
      hints: ['تاریخچه', 'چیه', 'ورزش', 'history', 'what', 'sport'],
      fa: 'بازی‌های المپیک ریشه در یونان باستان دارند و نسخه‌ی مدرنش در ۱۸۹۶ در آتن دوباره شروع شد. هر چهار سال یک بار بین شهرهای جهان جابه‌جا می‌شود و ورزشکاران در رشته‌های تابستانی و زمستانی رقابت می‌کنند. المپیک نماد رقابت مسالمت‌آمیز ملت‌هاست و مراسم افتتاحیه و مشعل آن شهرت جهانی دارد.',
      en: 'The Olympic Games have roots in ancient Greece, and the modern version restarted in Athens in 1896. They rotate between world cities every four years, with athletes competing in summer and winter sports. The Olympics symbolize peaceful competition among nations, and their opening ceremony and torch are globally famous.'
    },
    {
      id: 'tennis_overview',
      keywords: [
        'تنیس چیه',
        'قوانین تنیس',
        'گرند اسلم',
        'ویمبلدون',
        'what is tennis',
        'tennis rules',
        'grand slam tennis',
        'what is wimbledon'
      ],
      weak: ['تنیس', 'tennis', 'wimbledon'],
      weakSafe: true,
      hints: ['ورزش', 'راکت', 'چیه', 'کیست', 'sport', 'what', 'racket'],
      fa: 'تنیس ورزشی راکتی است که روی زمین خاکی، چمن یا سخت بازی می‌شود. چهار گرند اسلم اصلی استرالیا اوپن، رولان گاروس، ویمبلدون و یواس اوپن هستند. ست‌ها معمولاً تا شش گیم‌اند و تای‌بریک اختلاف را تمام می‌کند. ویمبلدون قدیمی‌ترین تورنمنت است و هنوز روی چمن برگزار می‌شود.',
      en: 'Tennis is a racket sport played on clay, grass, or hard courts. The four Grand Slams are the Australian Open, Roland Garros, Wimbledon, and the US Open. Sets are usually first to six games, with a tiebreak to finish a 6-6 set. Wimbledon is the oldest tournament and is still played on grass.'
    },
    {
      id: 'cricket_overview',
      keywords: [
        'کریکت چیه',
        'قوانین کریکت',
        'what is cricket',
        'cricket rules',
        'how does cricket work'
      ],
      weak: ['کریکت', 'cricket'],
      weakSafe: true,
      hints: ['ورزش', 'چیه', 'هند', 'sport', 'what', 'india', 'bat'],
      fa: 'کریکت ورزشی با بت و توپ است که در هند، پاکستان، استرالیا و انگلستان محبوبیت عظیمی دارد. سه شکل رایج دارد: تست (چندروزه)، یک‌روزه، و تی۲۰. جام جهانی کریکت پربیننده‌ترین رویداد این ورزش است. قوانینش برای تازه‌کار پیچیده به نظر می‌رسد، اما هسته‌اش دویدن بین دو ویکت بعد از ضربه‌ی توپ است.',
      en: 'Cricket is a bat-and-ball sport with huge followings in India, Pakistan, Australia, and England. The three common forms are Test (multi-day), one-day, and T20. The Cricket World Cup is its most-watched event. The laws look dense to a newcomer, but the core is running between two wickets after hitting the ball.'
    },
    {
      id: 'baseball_overview',
      keywords: [
        'بیسبال چیه',
        'قوانین بیسبال',
        'what is baseball',
        'baseball rules',
        'what is the world series'
      ],
      weak: ['بیسبال', 'baseball'],
      weakSafe: true,
      hints: ['ورزش', 'چیه', 'آمریکا', 'sport', 'what', 'mlb'],
      fa: 'بیسبال ورزش ملی آمریکاست: پرتاب‌کننده توپ را می‌فرستد و ضربه‌زن سعی می‌کند آن را بزند و روی پایگاه‌ها بدود. نه اینینگ دارد و هر تیم در هر اینینگ تا سه اوت فرصت دارد. سری جهانی فینال لیگ MLB است. ژاپن و چند کشور آمریکای لاتین هم لیگ‌های قوی دارند.',
      en: 'Baseball is the national sport of the United States: a pitcher throws, a batter tries to hit, and runners advance around the bases. Games have nine innings, and each side gets three outs per inning. The World Series is the MLB final. Japan and several Latin American countries also have strong leagues.'
    },
    {
      id: 'hockey_overview',
      keywords: [
        'هاکی روی یخ',
        'هاکی چیه',
        'what is ice hockey',
        'hockey rules',
        'what is the stanley cup'
      ],
      weak: ['هاکی', 'hockey'],
      weakSafe: true,
      hints: ['یخ', 'ورزش', 'چیه', 'ice', 'sport', 'what', 'nhl'],
      fa: 'هاکی روی یخ ورزشی سریع با استیک و پاک است که روی یخ بازی می‌شود. شش بازیکن در هر سمت، از جمله دروازه‌بان، و سه دوره بیست‌دقیقه‌ای. جام استنلی قدیمی‌ترین جام حرفه‌ای آمریکای شمالی است و قهرمانی NHL را مشخص می‌کند. کانادا و چند کشور اروپای شمالی قدرت‌های کلاسیک آن‌اند.',
      en: 'Ice hockey is a fast sport played with sticks and a puck on ice. Each side has six players including a goalie, across three twenty-minute periods. The Stanley Cup is the oldest professional trophy in North America and marks the NHL champion. Canada and several northern European countries are classic powers.'
    },
    {
      id: 'golf_overview',
      keywords: [
        'گلف چیه',
        'قوانین گلف',
        'what is golf',
        'golf rules',
        'what is the masters'
      ],
      weak: ['گلف', 'golf'],
      weakSafe: true,
      hints: ['ورزش', 'چیه', 'چوب', 'sport', 'what', 'major'],
      fa: 'گلف ورزشی انفرادی است که با چوب، توپ را در سوراخ‌های زمین می‌اندازند؛ معمولاً ۱۸ سوراخ. امتیاز کمتر بهتر است. چهار میجر مردان مسترز، پی‌جی‌ای، یواس اوپن و اوپن بریتانیا هستند. تمرکز، تکرار و مدیریت فشار بخش بزرگی از بازی است، نه فقط قدرت ضربه.',
      en: 'Golf is an individual sport of hitting a ball into holes with clubs, usually 18 holes. Lower scores are better. The four men’s majors are the Masters, the PGA Championship, the US Open, and The Open. Focus, repetition, and pressure management are as large a part of the game as raw power.'
    },
    {
      id: 'gymnastics_overview',
      keywords: [
        'ژیمناستیک چیه',
        'ژیمناستیک هنری',
        'what is gymnastics',
        'artistic gymnastics'
      ],
      weak: ['ژیمناستیک', 'gymnastics'],
      weakSafe: true,
      hints: ['ورزش', 'چیه', 'المپیک', 'sport', 'what', 'olympic'],
      fa: 'ژیمناستیک هنری ترکیبی از قدرت، تعادل و اجرای حرکات روی اسباب‌هایی مثل بارفیکس، پارالل، پرش خرک و حرکات زمینی است. در المپیک هم تیمی و هم انفرادی برگزار می‌شود. نمره‌ها سختی حرکت و اجرای تمیز را با هم می‌سنجند.',
      en: 'Artistic gymnastics mixes strength, balance, and skill on apparatus such as bars, beam, vault, and floor. The Olympics include both team and individual events. Scores combine difficulty with clean execution.'
    },
    {
      id: 'swimming_overview',
      keywords: [
        'شنا چیه',
        'مواد شنا',
        'what is competitive swimming',
        'swimming strokes'
      ],
      weak: ['شنا', 'swimming'],
      weakSafe: true,
      hints: ['ورزش', 'چیه', 'استخر', 'sport', 'what', 'pool', 'olympic'],
      fa: 'شنای رقابتی چهار حرکت اصلی دارد: آزاد، قورباغه، پروانه و کرال پشت. مسافت‌های المپیک از ۵۰ تا ۱۵۰۰ متر است و مختلط چند حرکت را در یک مسابقه ترکیب می‌کند. تکنیک نفس و برگشت به اندازه‌ی قدرت دست مهم است.',
      en: 'Competitive swimming has four main strokes: freestyle, breaststroke, butterfly, and backstroke. Olympic distances run from 50 to 1500 metres, and medley events combine strokes in one race. Breathing and turns matter as much as arm power.'
    },
    {
      id: 'athletics_overview',
      keywords: [
        'دوومیدانی چیه',
        'دو و میدانی',
        'what is athletics',
        'track and field'
      ],
      weak: ['دوومیدانی', 'athletics', 'track and field'],
      weakSafe: true,
      hints: ['ورزش', 'چیه', 'دو', 'sport', 'what', 'running', 'olympic'],
      fa: 'دوومیدانی مادر ورزش‌های المپیک است: دو سرعت و استقامت، پرش‌ها، پرتاب‌ها و مواد ترکیبی مثل دهگانه. المپیک و قهرمانی جهان مهم‌ترین صحنه‌های آن‌اند. دو ۱۰۰ متر کوتاه‌ترین و پربیننده‌ترین ماده است.',
      en: 'Athletics, or track and field, is the parent sport of the Olympics: sprints and distance running, jumps, throws, and combined events such as the decathlon. The Olympics and world championships are its biggest stages. The 100 metres is the shortest and most-watched event.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
