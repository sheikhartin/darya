/**
 * Darya - media recommendation pool.
 *
 * A large, bilingual pool of movies, TV series, games, anime, music,
 * podcasts, documentaries, and books used to build varied recommendation
 * replies. The pool deliberately mixes recent hits with older classics so
 * Darya never hands back the same boring top-ten list twice, and every
 * reply is a fresh random combination of recent and established titles.
 *
 * Items are structured (title + year + one-line reason in each language)
 * rather than a flat string, so the recommendation generator can shuffle
 * them, mix eras, and dedupe. Registered on global.DaryaMediaPool and
 * consumed by the knowledge layer (knowledge-base.js).
 *
 * Session/offline-only: this is static content shipped with the app; no
 * network calls are made.
 */
(function (global) {
  'use strict';

  // Each entry: { t: title, y: year, en: reason, fa: reason }
  const MOVIES = [
    {
      t: 'Papillon',
      y: 1973,
      en: 'a relentless escape epic about friendship and freedom',
      fa: 'حماسه‌ی گریز و دوستی و آزادی'
    },
    {
      t: 'The Shawshank Redemption',
      y: 1994,
      en: 'a soulful story of hope inside a prison',
      fa: 'داستانی امیدبخش در دل زندان'
    },
    {
      t: 'Parasite',
      y: 2019,
      en: 'a sharp class satire that keeps twisting',
      fa: 'طنزی تند درباره‌ی طبقه و اجتماع'
    },
    {
      t: 'Arrival',
      y: 2016,
      en: 'a thoughtful sci-fi about language and time',
      fa: 'علمی-تخیلی عمیق درباره‌ی زبان و زمان'
    },
    {
      t: 'Amélie',
      y: 2001,
      en: 'a whimsical, heartwarming Parisian tale',
      fa: 'داستانی لطیف و گرم از دل پاریس'
    },
    {
      t: 'The Prestige',
      y: 2006,
      en: 'a riveting rivalry about obsession and magic',
      fa: 'رقابتی نفس‌گیر درباره‌ی وسواس و شعبده'
    },
    {
      t: 'Everything Everywhere All at Once',
      y: 2022,
      en: 'a wild multiverse ride about family and kindness',
      fa: 'سفری پر از ماجرا درباره‌ی خانواده و مهربانی'
    },
    {
      t: 'Spirited Away',
      y: 2001,
      en: 'Miyazaki classic about courage in a strange world',
      fa: 'کلاسیک میازاکی درباره‌ی شجاعت'
    },
    {
      t: 'The Grand Budapest Hotel',
      y: 2014,
      en: 'a playful, stylish comedy-drama',
      fa: 'کمدی-درام شوخ و شیک'
    },
    {
      t: 'Soul',
      y: 2020,
      en: 'a warm Pixar meditation on purpose',
      fa: 'تأملی گرم درباره‌ی هدف زندگی'
    },
    {
      t: 'Oldboy',
      y: 2003,
      en: 'a brutal Korean revenge masterpiece',
      fa: 'شاهکار انتقام جنجالی کره‌ای'
    },
    {
      t: 'Fight Club',
      y: 1999,
      en: 'a cult classic about identity and rebellion',
      fa: 'کلاسیک کالت درباره‌ی هویت و عصیان'
    },
    {
      t: 'The Silence of the Lambs',
      y: 1991,
      en: 'a chilling psychological thriller',
      fa: 'تریلر روان‌شناختی و هولناک'
    },
    {
      t: 'Portrait of a Lady on Fire',
      y: 2019,
      en: 'a quiet, devastating romance',
      fa: 'عاشقانه‌ای آرام و تکان‌دهنده'
    },
    {
      t: 'Coco',
      y: 2017,
      en: 'a vibrant story about memory and family',
      fa: 'داستانی رنگارنگ درباره‌ی خاطره و خانواده'
    },
    {
      t: 'Whiplash',
      y: 2014,
      en: 'an intense tale of ambition and music',
      fa: 'داستانی پرشور درباره‌ی جاه‌طلبی و موسیقی'
    },
    {
      t: 'Her',
      y: 2013,
      en: 'a tender look at love and loneliness in a digital age',
      fa: 'نگاهی لطیف به عشق و تنهایی در عصر دیجیتال'
    },
    {
      t: 'The Lives of Others',
      y: 2006,
      en: 'a tense German drama about conscience',
      fa: 'درامی پرتنش آلمانی درباره‌ی وجدان'
    },
    {
      t: 'Interstellar',
      y: 2014,
      en: 'a sweeping space epic about love and time',
      fa: 'حماسه‌ای فضایی درباره‌ی عشق و زمان'
    },
    {
      t: 'The Truman Show',
      y: 1998,
      en: 'a smart look at reality and freedom',
      fa: 'نگاهی هوشمند به واقعیت و آزادی'
    },
    {
      t: 'La La Land',
      y: 2016,
      en: 'a dreamy musical about ambition and love',
      fa: 'موزیکال رویایی درباره‌ی آرزو و عشق'
    },
    {
      t: 'The Pursuit of Happyness',
      y: 2006,
      en: 'a moving true story of resilience',
      fa: 'داستان واقعی و تأثیرگذار درباره‌ی تاب‌آوری'
    },
    {
      t: 'Inception',
      y: 2010,
      en: 'a mind-bending heist through dreams',
      fa: 'سرقتی حیرت‌انگیز در دلِ رؤیاها'
    },
    {
      t: 'Eternal Sunshine of the Spotless Mind',
      y: 2004,
      en: 'a poetic tale about memory and love',
      fa: 'داستانی شاعرانه درباره‌ی خاطره و عشق'
    },
    {
      t: 'Zodiac',
      y: 2007,
      en: 'a gripping true-crime investigation',
      fa: 'بررسی جنایی واقعی و پرکشش'
    },
    {
      t: 'The Intouchables',
      y: 2011,
      en: 'an uplifting friendship across worlds',
      fa: 'دوستی امیدبخش میان دو دنیا'
    },
    {
      t: 'Memories of Murder',
      y: 2003,
      en: 'Bong Joon-ho early true-crime masterwork',
      fa: 'اثر اولیه‌ی بونگ جون-هو در ژانر جنایی'
    },
    {
      t: 'Ratatouille',
      y: 2007,
      en: 'a delightful tale about cooking and passion',
      fa: 'داستانی دلچسب درباره‌ی آشپزی و اشتیاق'
    },
    {
      t: 'The Matrix',
      y: 1999,
      en: 'a defining sci-fi about reality and choice',
      fa: 'علمی-تخیلی اثرگذار درباره‌ی واقعیت و انتخاب'
    },
    {
      t: 'Joker',
      y: 2019,
      en: 'a dark character study of a broken man',
      fa: 'مطالعه‌ای تاریک درباره‌ی یک انسان شکسته'
    },
    {
      t: 'Close-Up',
      y: 1990,
      en: 'Kiarostami blurs reality and cinema',
      fa: 'کیارستمی واقعیت و سینما را یکی می‌کند'
    },
    {
      t: 'A Separation',
      y: 2011,
      en: 'an Oscar-winning Iranian family drama',
      fa: 'درام خانوادگی ایرانی برنده‌ی اسکار'
    },
    {
      t: 'Children of Heaven',
      y: 1997,
      en: 'a beloved Iranian classic about a pair of shoes',
      fa: 'کلاسیک محبوب ایرانی درباره‌ی یک جفت کفش'
    },
    {
      t: 'About Elly',
      y: 2009,
      en: 'a tense, layered Iranian mystery',
      fa: 'معمایی ایرانی پرتنش و چندلایه'
    },
    {
      t: 'The Salesman',
      y: 2016,
      en: 'Farhadi probing drama about pride and guilt',
      fa: 'درام عمیق فرهادی درباره‌ی غرور و گناه'
    },
    {
      t: 'Leila',
      y: 1997,
      en: 'a tender Iranian film about marriage and sacrifice',
      fa: 'فیلمی لطیف ایرانی درباره‌ی ازدواج و فداکاری'
    }
  ];

  const SERIES = [
    {
      t: 'Breaking Bad',
      y: 2008,
      en: 'a teacher turned chemist, one of the best ever',
      fa: 'معلمی که شیمی‌دان می‌شود؛ یکی از بهترین‌ها'
    },
    {
      t: 'Succession',
      y: 2018,
      en: 'a vicious family power struggle',
      fa: 'نبرد بی‌رحم قدرت در یک خانواده'
    },
    {
      t: 'Severance',
      y: 2022,
      en: 'a surreal thriller about work and memory',
      fa: 'تریلری سوررئال درباره‌ی کار و خاطره'
    },
    {
      t: 'Dark',
      y: 2017,
      en: 'a layered German time-travel mystery',
      fa: 'معمای زمان آلمانی و چندلایه'
    },
    {
      t: 'Ted Lasso',
      y: 2020,
      en: 'a warm, uplifting comedy about kindness',
      fa: 'کمدی گرم و امیدبخش درباره‌ی مهربانی'
    },
    {
      t: 'The Bear',
      y: 2022,
      en: 'a raw, brilliant look at a kitchen',
      fa: 'نگاهی خام و درخشان به آشپزخانه'
    },
    {
      t: 'Fleabag',
      y: 2016,
      en: 'a sharp, funny, heartbroken monologue',
      fa: 'مونولوگی تند، خنده‌دار و دل‌شکسته'
    },
    {
      t: 'Station Eleven',
      y: 2021,
      en: 'art and humanity after a catastrophe',
      fa: 'هنر و انسانیت پس از یک فاجعه'
    },
    {
      t: 'Mr. Robot',
      y: 2015,
      en: 'a realistic look at hacking and mental health',
      fa: 'نگاهی واقعی به هک و سلامت روان'
    },
    {
      t: 'The Queen Gambit',
      y: 2020,
      en: 'a stylish story about chess and genius',
      fa: 'داستانی شیک درباره‌ی شطرنج و نبوغ'
    },
    {
      t: 'Chernobyl',
      y: 2019,
      en: 'a haunting retelling of a real disaster',
      fa: 'روایتی هولناک از یک فاجعه‌ی واقعی'
    },
    {
      t: 'Better Call Saul',
      y: 2015,
      en: 'a superb slow-burn prequel',
      fa: 'پیش‌درآمدی عالی و کم‌کم‌پیش'
    },
    {
      t: 'Arcane',
      y: 2021,
      en: 'a stunning animated series from the game universe',
      fa: 'سریال انیمیشنی خیره‌کننده از دنیای یک بازی'
    },
    {
      t: 'The Last of Us',
      y: 2023,
      en: 'a gripping adaptation about love and survival',
      fa: 'اقتباسی پرکشش درباره‌ی عشق و بقا'
    },
    {
      t: 'Money Heist',
      y: 2017,
      en: 'a stylish heist drama with a masked gang',
      fa: 'درام سرقت شیک با گروهی نقاب‌پوش'
    },
    {
      t: 'The Office (US)',
      y: 2005,
      en: 'a beloved workplace mockumentary',
      fa: 'موکومنتاری محبوب درباره‌ی محیط کار'
    },
    {
      t: 'Sherlock',
      y: 2010,
      en: 'a clever modern take on the detective',
      fa: 'برداشتی هوشمندانه و مدرن از کارآگاه'
    },
    {
      t: 'Avatar: The Last Airbender',
      y: 2005,
      en: 'a beloved animated epic of balance',
      fa: 'حماسه‌ی انیمیشنی محبوب درباره‌ی تعادل'
    },
    {
      t: 'The Handmaid Tale',
      y: 2017,
      en: 'a chilling dystopia about freedom',
      fa: 'داستانی هولناک درباره‌ی آزادی'
    },
    {
      t: 'Bojack Horseman',
      y: 2014,
      en: 'a darkly funny animated look at depression',
      fa: 'انیمیشنی تیره و خنده‌دار درباره‌ی افسردگی'
    },
    {
      t: 'Normal People',
      y: 2020,
      en: 'a tender, honest love story',
      fa: 'داستان عاشقانه‌ای صادق و لطیف'
    },
    {
      t: 'Mindhunter',
      y: 2017,
      en: 'a chilling study of criminal psychology',
      fa: 'مطالعه‌ای هولناک درباره‌ی روان‌شناسی جنایی'
    },
    {
      t: 'Hannibal',
      y: 2013,
      en: 'a gorgeous, disturbing psychological thriller',
      fa: 'تریلری زیبا و آزاردهنده'
    },
    {
      t: 'The Crown',
      y: 2016,
      en: 'a lavish drama of a royal family',
      fa: 'درامی پر از زرق و برق از خانواده‌ی سلطنتی'
    }
  ];

  const GAMES = [
    {
      t: 'The Witcher 3',
      y: 2015,
      en: 'an expansive open-world RPG with deep stories',
      fa: 'بازی نقش‌آفرینی جهان‌باز با داستان‌های عمیق'
    },
    {
      t: 'Cyberpunk 2077',
      y: 2020,
      en: 'a neon dystopian open world',
      fa: 'دنیای باز ویران‌شهری نئونی'
    },
    {
      t: 'Portal 2',
      y: 2011,
      en: 'a brilliant puzzle game with great humor',
      fa: 'بازی معمایی درخشان با طنزی عالی'
    },
    {
      t: 'Stardew Valley',
      y: 2016,
      en: 'a calm farming-life gem',
      fa: 'بازی آرام مزرعه‌داری'
    },
    {
      t: 'God of War',
      y: 2018,
      en: 'a cinematic action epic about fatherhood',
      fa: 'اکشن سینمایی درباره‌ی پدر بودن'
    },
    {
      t: 'The Last of Us',
      y: 2013,
      en: 'a heartbreaking survival story',
      fa: 'داستان بقای تکان‌دهنده'
    },
    {
      t: 'Shadow of the Colossus',
      y: 2005,
      en: 'a lonely, majestic adventure',
      fa: 'ماجرایی تنها و باشکوه'
    },
    {
      t: 'Zelda: Breath of the Wild',
      y: 2017,
      en: 'a masterful open-world adventure',
      fa: 'ماجراجویی جهان‌باز بی‌نقص'
    },
    {
      t: 'Hollow Knight',
      y: 2017,
      en: 'a gorgeous, hard Metroidvania',
      fa: 'بازی زیبا و دشوار مترویدوانیا'
    },
    {
      t: 'Celeste',
      y: 2018,
      en: 'a platformer about anxiety and growth',
      fa: 'بازی پرشی درباره‌ی اضطراب و رشد'
    },
    {
      t: 'Journey',
      y: 2012,
      en: 'a wordless, moving online journey',
      fa: 'سفری بی‌کلام و تأثیرگذار'
    },
    {
      t: 'Disco Elysium',
      y: 2019,
      en: 'a stunning detective RPG about ideas',
      fa: 'نقش‌آفرینی کارآگاهی درباره‌ی ایده‌ها'
    },
    {
      t: 'Hades',
      y: 2020,
      en: 'an addictive roguelike with great writing',
      fa: 'بازی روگ‌لایک اعتیادآور با نوشته‌ای عالی'
    },
    {
      t: 'Outer Wilds',
      y: 2019,
      en: 'a beautiful space mystery about a time loop',
      fa: 'معمای فضایی درباره‌ی حلقه‌ی زمان'
    },
    {
      t: 'Firewatch',
      y: 2016,
      en: 'a quiet story in the woods',
      fa: 'داستانی آرام در دل جنگل'
    },
    {
      t: 'Inside',
      y: 2016,
      en: 'a haunting minimal platformer',
      fa: 'بازی پرشی مینیمال و هولناک'
    },
    {
      t: 'Untitled Goose Game',
      y: 2019,
      en: 'a silly, hilarious mischief game',
      fa: 'بازی بامزه و شیطنت‌آمیز'
    },
    {
      t: 'Elden Ring',
      y: 2022,
      en: 'a vast, demanding open-world epic',
      fa: 'حماسه‌ی جهان‌باز و دشوار'
    },
    {
      t: 'Baldur Gate 3',
      y: 2023,
      en: 'a deep RPG full of choices',
      fa: 'نقش‌آفرینی عمیق و پر از انتخاب'
    },
    {
      t: 'It Takes Two',
      y: 2021,
      en: 'a wonderful co-op adventure about a couple',
      fa: 'ماجراجویی دونفره درباره‌ی یک زوج'
    },
    {
      t: 'A Short Hike',
      y: 2019,
      en: 'a cozy tiny adventure about connection',
      fa: 'ماجراجویی کوچک و دلچسب درباره‌ی ارتباط'
    },
    {
      t: 'Monument Valley',
      y: 2014,
      en: 'a beautiful puzzle about impossible geometry',
      fa: 'معمایی زیبا درباره‌ی هندسه‌ی ناممکن'
    },
    {
      t: 'Gris',
      y: 2018,
      en: 'a breathtaking artful game about grief',
      fa: 'بازی هنری نفس‌گیر درباره‌ی غم'
    }
  ];

  const ANIME = [
    {
      t: 'Fullmetal Alchemist: Brotherhood',
      y: 2009,
      en: 'a masterful story of sacrifice and redemption',
      fa: 'داستانی بی‌نقص درباره‌ی فداکاری و رستگاری'
    },
    {
      t: 'Attack on Titan',
      y: 2013,
      en: 'an epic, brutal tale of freedom',
      fa: 'حماسه‌ای خشن درباره‌ی آزادی'
    },
    {
      t: 'Death Note',
      y: 2006,
      en: 'a clever battle of wits',
      fa: 'جنگ نبوغی هوشمندانه'
    },
    {
      t: 'Your Name',
      y: 2016,
      en: 'a beautiful film about distance and longing',
      fa: 'فیلمی زیبا درباره‌ی فاصله و دلتنگ'
    },
    {
      t: 'Cowboy Bebop',
      y: 1998,
      en: 'a stylish space-noir classic',
      fa: 'کلاسیک فضایی-نوآر شیک'
    },
    {
      t: 'Violet Evergarden',
      y: 2018,
      en: 'a deeply moving story about grief and love',
      fa: 'داستانی عمیقاً تأثیرگذار درباره‌ی غم و عشق'
    },
    {
      t: 'A Silent Voice',
      y: 2016,
      en: 'a gentle film about forgiveness and bullying',
      fa: 'فیلمی لطیف درباره‌ی بخشش و زورگویی'
    },
    {
      t: 'Spy x Family',
      y: 2022,
      en: 'a warm, funny spy-family comedy',
      fa: 'کمدی گرم و بامزه‌ی خانواده‌ی جاسوسی'
    },
    {
      t: 'One Punch Man',
      y: 2015,
      en: 'a hilarious satire of superheroes',
      fa: 'طنزی بامزه درباره‌ی ابرقهرمان‌ها'
    },
    {
      t: 'Erased',
      y: 2016,
      en: 'a tense mystery about time and second chances',
      fa: 'معمایی پرتنش درباره‌ی زمان و فرصت دوباره'
    },
    {
      t: 'Mob Psycho 100',
      y: 2016,
      en: 'a funny, heartfelt story of growth',
      fa: 'داستانی بامزه و عمیق درباره‌ی رشد'
    },
    {
      t: 'Nausicaa of the Valley of the Wind',
      y: 1984,
      en: 'an environmental Miyazaki classic',
      fa: 'کلاسیک محیط‌زیستی میازاکی'
    }
  ];

  const MUSIC = [
    {
      t: 'Pink Floyd - The Dark Side of the Moon',
      y: 1973,
      en: 'an all-time progressive rock masterpiece',
      fa: 'شاهکار همیشگی راک پیشرو'
    },
    {
      t: 'Daft Punk - Random Access Memories',
      y: 2013,
      en: 'a lush electronic tribute to the past',
      fa: 'آلبوم الکترونیک غنی و نوستالژیک'
    },
    {
      t: 'Radiohead - In Rainbows',
      y: 2007,
      en: 'a warm, layered alt-rock gem',
      fa: 'آلبوم راک آلترناتیو گرم و چندلایه'
    },
    {
      t: 'Amy Winehouse - Back to Black',
      y: 2006,
      en: 'a raw, soulful classic',
      fa: 'آلبوم سول خام و کلاسیک'
    },
    {
      t: 'Hans Zimmer - Interstellar OST',
      y: 2014,
      en: 'a sweeping, emotional film score',
      fa: 'موسیقی متن گسترده و احساسی'
    },
    {
      t: 'Yann Tiersen - Amelie OST',
      y: 2001,
      en: 'a gentle, whimsical piano score',
      fa: 'موسیقی پیانویی لطیف و رؤیایی'
    },
    {
      t: 'Beethoven - Moonlight Sonata',
      y: 1801,
      en: 'a timeless piece of quiet power',
      fa: 'قطعه‌ای جاودانه از قدرت خاموش'
    },
    {
      t: 'The Weeknd - Dawn FM',
      y: 2022,
      en: 'a sleek modern pop concept album',
      fa: 'آلبوم پاپ مفهومی مدرن و شیک'
    },
    {
      t: 'Sade - Diamond Life',
      y: 1984,
      en: 'a smooth, soulful debut',
      fa: 'اولین آلبوم سول نرم و دلنشین'
    },
    {
      t: 'Vulfpeck - The Beautiful Game',
      y: 2016,
      en: 'funky, joyful instrumentals',
      fa: 'آهنگ‌های فانک و شاد'
    },
    {
      t: 'Erik Satie - Gymnopedies',
      y: 1888,
      en: 'calming, minimalist piano',
      fa: 'پیانوی مینیمال و آرام‌بخش'
    },
    {
      t: 'Jonas Blue - Blue (album)',
      y: 2018,
      en: 'bright, upbeat dance-pop',
      fa: 'دنس-پاپ شاد و پرانرژی'
    }
  ];

  const PODCASTS = [
    {
      t: 'Lex Fridman Podcast',
      en: 'long, deep conversations about science and AI',
      fa: 'گفتگوهای طولانی و عمیق درباره‌ی علم و هوش مصنوعی'
    },
    {
      t: 'The Daily (NYT)',
      en: 'a clear daily news explainer',
      fa: 'روایت روزانه‌ی خبری و روشن'
    },
    {
      t: 'Stuff You Should Know',
      en: 'curiosity-driven explainers on everything',
      fa: 'توضیح درباره‌ی همه‌چیز از روی کنجکاوی'
    },
    {
      t: '99% Invisible',
      en: 'the hidden design in everyday life',
      fa: 'طراحی پنهان در زندگی روزمره'
    },
    {
      t: 'The Moth',
      en: 'real people telling true stories live',
      fa: 'داستان‌های واقعی و بی‌واسطه'
    },
    {
      t: 'Science Vs',
      en: 'tackles myths with evidence',
      fa: 'افسانه‌ها را با شواهد می‌سنجد'
    },
    {
      t: 'Hidden Brain',
      en: 'the psychology behind our behavior',
      fa: 'روان‌شناسی پشت رفتار ما'
    },
    {
      t: 'Darknet Diaries',
      en: 'hacking and cybercrime stories',
      fa: 'داستان‌های هک و جرائم سایبری'
    }
  ];

  const BOOKS = [
    {
      t: 'The Midnight Library',
      y: 2020,
      en: 'Matt Haig on choices and meaning',
      fa: 'مت هیگ درباره‌ی انتخاب‌ها و معنا'
    },
    {
      t: 'Man Search for Meaning',
      y: 1946,
      en: 'Viktor Frankl on resilience',
      fa: 'ویکتور فرانکل درباره‌ی تاب‌آوری'
    },
    {
      t: 'The Alchemist',
      y: 1988,
      en: 'Coelho on following dreams',
      fa: 'کوئلیو درباره‌ی دنبال‌کردن رؤیا'
    },
    {
      t: 'Sapiens',
      y: 2011,
      en: 'Harari on the story of humankind',
      fa: 'هراری درباره‌ی داستان بشر'
    },
    {
      t: 'The Art of Loving',
      y: 1956,
      en: 'Fromm on love as a practice',
      fa: 'فروم درباره‌ی عشق به‌مثابه تمرین'
    },
    {
      t: 'Atomic Habits',
      y: 2018,
      en: 'Clear on building small habits',
      fa: 'کلیر درباره‌ی ساختن عادت‌های کوچک'
    }
  ];

  const DOCUMENTARIES = [
    {
      t: 'My Octopus Teacher',
      y: 2020,
      en: 'a bond with an octopus, tender and wise',
      fa: 'پیوندی لطیف و حکیمانه با یک اختاپوس'
    },
    {
      t: 'Free Solo',
      y: 2018,
      en: 'a breathtaking climb without ropes',
      fa: 'صعودی نفس‌گیر بدون طناب'
    },
    {
      t: 'Jiro Dreams of Sushi',
      y: 2011,
      en: 'obsession and mastery in a sushi shop',
      fa: 'وسواس و استادی در یک رستوران سوشی'
    },
    {
      t: 'Won the Ocean',
      y: 2020,
      en: 'life and loss at the Great Barrier Reef',
      fa: 'زندگی و ازدست‌دادن در دیواره‌ی بزرگ'
    },
    {
      t: 'Koyaanisqatsi',
      y: 1982,
      en: 'a wordless meditation on modern life',
      fa: 'تأملی بی‌کلام درباره‌ی زندگی مدرن'
    }
  ];

  global.DaryaMediaPool = {
    MOVIES,
    SERIES,
    GAMES,
    ANIME,
    MUSIC,
    PODCASTS,
    BOOKS,
    DOCUMENTARIES,
    // Every named category, so a randomized pick can draw a fresh mix.
    categories: {
      movie: MOVIES,
      series: SERIES,
      game: GAMES,
      anime: ANIME,
      music: MUSIC,
      podcast: PODCASTS,
      book: BOOKS,
      documentary: DOCUMENTARIES
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
