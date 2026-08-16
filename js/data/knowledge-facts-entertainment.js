/**
 * Darya - curated factual entries (entertainment domain).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'movies_recommendations',
      keywords: [
        'فیلم خوب معرفی کن',
        'فیلم پیشنهاد بده',
        'سریال خوب معرفی کن',
        'ده فیلم خوب',
        'فیلم های خوب',
        // Colloquial recommendation framings with «بهم» (to me):
        // «چندتا فیلم بهم معرفی کن» and «فیلم سینمایی بهم معرفی کن`
        // used to score as weak-only hits below the confidence floor
        // and fell to the "unfamiliar topic" pool.
        'فیلم بهم معرفی کن',
        'فیلم به من معرفی کن',
        'فیلم سینمایی',
        'فیلم معرفی',
        'چندتا فیلم',
        // "best film" requests (بهترین فیلم تاریخ) used to fall below
        // the confidence floor and hit the "check Wikipedia" line.
        'بهترین فیلم',
        'بهترین فیلم تاریخ',
        'فیلم تاریخ',
        'یه فیلم معرفی',
        'یک فیلم معرفی',
        'فیلم پیشنهاد',
        'فیلم بگو',
        'recommend a good movie',
        'suggest movies',
        'good series to watch',
        'best movies you recommend',
        'what should i watch',
        // Multi-word generic phrases like 'recommend a movie' or 'movie
        // recommendations' are deliberately NOT here: they embed inside
        // genre queries ("recommend a movie based on true events",
        // "horror movie recommendations") and outscore the genre facts,
        // so the general shelf swallowed them (the "expanded genre
        // lists" test pins this). Bare requests still reach this fact
        // through the weak 'movie'/'films' words plus framing.
        'films to watch',
        'good movies',
        'best film',
        'best movie',
        'best movie of all time',
        'top movies'
      ],
      weak: ['فیلم', 'سریال', 'سینما', 'movie', 'movies', 'series', 'films'],
      weakSafe: true,
      hints: [
        'پیشنهاد',
        'معرفی',
        'تماشا',
        'recommend',
        'watch',
        'suggest',
        'good'
      ],
      fa: 'چند پیشنهاد غیرتکراری، از سینمای ایران و جهان:\n۱. «نمای نزدیک» (کیارستمی، ۱۹۹۰): مرز میان واقعیت و فیلم را جابه‌جا می‌کند.\n۲. «طعم گیلاس» (کیارستمی، ۱۹۹۷): برنده‌ی نخل طلا؛ تأملی عمیق درباره‌ی ارزش زندگی.\n۳. «جدایی نادر از سیمین» (اصغر فرهادی، ۲۰۱۱): درام خانوادگی برنده‌ی اسکار.\n۴. «بچه‌های آسمان» (مجید مجیدی، ۱۹۹۷): یکی از محبوب‌ترین فیلم‌های کودکانه‌ی ایرانی.\n۵. «پاترسون» (جیم جارموش، ۲۰۱۶): شاعری آرام درباره‌ی زندگی روزمره.\n۶. «لویاتان» (آندری زویاگینتسف، ۲۰۱۴): درام پرتنش درباره‌ی قدرت و فساد.\n۷. «شلاق» یا Whiplash (دیمین شزل، ۲۰۱۴): درباره‌ی موسیقی و کمال‌گرایی؛ برای علاقه‌مندان به موسیقی.\n۸. «زندگی دیگران» (آلمان، ۲۰۰۶): درباره‌ی وجدان و اخلاق.\n۹. «خانواده‌ی دزدها» یا Shoplifters (ژاپن، ۲۰۱۸، ساخته‌ی هیروکازو کورئدا): درباره‌ی معنای خانواده.\n۱۰. سریال «آقای ربات» (Mr. Robot): نگاه واقعی به امنیت سایبری و فناوری.\n۱۱. سریال «خرس» یا The Bear: دنیای واقعی آشپزخانه‌های حرفه‌ای.\n۱۲. سریال «ایستگاه یازده» (Station Eleven): هنر و انسانیت پس از یک فاجعه.',
      en: 'A few non-mainstream picks, from Iranian and world cinema:\n1. Close-Up (Kiarostami, 1990): blurs the line between reality and film.\n2. Taste of Cherry (Kiarostami, 1997): Palme d Or winner, a deep meditation on the value of life.\n3. A Separation (Asghar Farhadi, 2011): Oscar-winning family drama.\n4. Children of Heaven (Majid Majidi, 1997): one of the most beloved Iranian films.\n5. Paterson (Jim Jarmusch, 2016): a quiet ode to everyday life.\n6. Leviathan (Andrey Zvyagintsev, 2014): a tense drama about power and corruption.\n7. Whiplash (Damien Chazelle, 2014): about music and perfectionism; great for music lovers.\n8. The Lives of Others (Germany, 2006): about conscience and ethics.\n9. Shoplifters (Japan, 2018): about the meaning of family.\n10. Mr. Robot (series): a realistic look at cybersecurity and technology.\n11. The Bear (series): the real world of professional kitchens.\n12. Station Eleven (series): art and humanity after a catastrophe.'
    },
    {
      id: 'movies_horror',
      keywords: [
        'فیلم ترسناک',
        'سریال ترسناک',
        'فیلم وحشت',
        'horror movie',
        'horror film',
        'horror series',
        'scary movie'
      ],
      weak: ['ترسناک', 'وحشت', 'horror', 'scary'],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای ترسناک غیرتکراری:\n۱. «دختری شب‌ها تنها به خانه می‌رود» (آنا لیلی امیرپور، ۲۰۱۴): اولین «وسترن خون‌آشامی» ایرانی؛ سیاه‌وسفید و پر از تنهایی.\n۲. «زیر سایه» (بابک انوری، ۲۰۱۶): وحشت روان‌شناختی در تهرانِ دوران جنگ؛ جن و دلهره سیاسی کنار هم.\n۳. «ربان سفید» (میشائل هانکه، ۲۰۰۹): برنده نخل طلا؛ ریشه‌های سرد و جمعی شرارت.\n۴. «یک آواز تاریک» (لیام گوین، ۲۰۱۶): آیین‌های جادویی واقع‌گرایانه و طاقت‌فرسا.\n۵. «تام‌باد» (راهی آنیل باروه، ۲۰۱۸): افسانه‌ای هندی درباره طلای نفرین‌شده و موجودی کهنه.',
      en: 'Non-obvious horror picks:\n1. A Girl Walks Home Alone at Night (Ana Lily Amirpour, 2014): the first Iranian vampire western; monochrome and lonely.\n2. Under the Shadow (Babak Anvari, 2016): psychological horror in war-era Tehran, fusing djinns with political dread.\n3. The White Ribbon (Michael Haneke, 2009): Palme d Or winner about the cold roots of collective evil.\n4. A Dark Song (Liam Gavin, 2016): a grueling, realistic occult ritual.\n5. Tumbbad (Rahi Anil Barve, 2018): an Indian folk-horror about cursed gold and an ancient creature.'
    },
    {
      id: 'movies_romantic',
      keywords: [
        'فیلم عاشقانه',
        'سریال عاشقانه',
        'romantic movie',
        'romance movie',
        'romantic film',
        // Colloquial forms: "romantic comedies" and «فیلم کمدی عاشقانه»
        // are how the request actually arrives; the bare «عاشقانه» weak
        // word alone would not unlock the list without a hint.
        'romantic comed',
        'romcom',
        'فیلم کمدی عاشقانه',
        'کمدی عاشقانه'
      ],
      weak: ['عاشقانه', 'رمانتیک', 'romantic', 'romance'],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای عاشقانه غیرتکراری:\n۱. «در حال و هوای عشق» (وانگ کار-وای، ۲۰۰۰): دلتنگی و اشتیاقِ مهارشده در نئون‌های هنگ‌کنگ.\n۲. «پیش از طلوع» (ریچارد لینکلیتر، ۱۹۹۵): جادوی یک شب گفتگو در وین.\n۳. «بدترین آدم دنیا» (یواخیم ترییر، ۲۰۲۱): روایتی انسانی از جستجوی عشق و هویت در سی‌سالگی.\n۴. «پرتره بانویی در آتش» (سلین سیاما، ۲۰۱۹): عشقی آرام و سوزان میان دو زن.\n۵. «زندگی‌های گذشته» (سلین سونگ، ۲۰۲۳): دو عشق در دو برهه از زندگی و پرسش «چه می‌شد اگر».',
      en: 'Non-obvious romantic picks:\n1. In the Mood for Love (Wong Kar-wai, 2000): longing and restraint bathed in neon.\n2. Before Sunrise (Richard Linklater, 1995): the magic of one night of conversation in Vienna.\n3. The Worst Person in the World (Joachim Trier, 2021): a humane, messy search for love and identity.\n4. Portrait of a Lady on Fire (Celine Sciamma, 2019): a quiet, burning romance between two women.\n5. Past Lives (Celine Song, 2023): two loves across two lifetimes and the what-ifs between them.'
    },
    {
      id: 'movies_comedy',
      keywords: [
        'فیلم کمدی',
        'سریال کمدی',
        'comedy movie',
        'comedy film',
        'comedy series'
      ],
      weak: ['کمدی', 'comedy', 'funny'],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای کمدی غیرتکراری:\n۱. «ما در سایه چه می‌کنیم» (جیمین کلمنت و تایکا وایتیتی، ۲۰۱۴): مستندنمایی درباره سه خون‌آشامِ هم‌خانه.\n۲. «سفر» (مایکل وینترباتم، ۲۰۱۰): بداهه‌گویی‌های تیزبینانه استیو کوگان و راب برایدون سر شام.\n۳. «ارکستر» (ایران کولیرین، ۲۰۰۷): گروه موسیقی مصری که در شهری دورافتاده سرگردان می‌شوند؛ کمدیِ خشک و مهربان.\n۴. «تونی اردمن» (مارن آده، ۲۰۱۶): طنزِ شرم‌آور و گرم درباره پدر و دختری.\n۵. «مرگ استالین» (آرماندو یانوچی، ۲۰۱۷): کمدی سیاسی درباره جانشینی پوچ پس از مرگ دیکتاتور.',
      en: 'Non-obvious comedy picks:\n1. What We Do in the Shadows (Clement and Waititi, 2014): a mockumentary about flat-sharing vampires.\n2. The Trip (Michael Winterbottom, 2010): razor-sharp improvised banter over fine dining.\n3. The Band Visit (Eran Kolirin, 2007): a deadpan, gentle comedy about a stranded Egyptian band.\n4. Toni Erdmann (Maren Ade, 2016): a warm, cringe-funny father-daughter story.\n5. The Death of Stalin (Armando Iannucci, 2017): a political farce about the absurd power scramble after a dictator dies.'
    },
    {
      id: 'movies_dark_comedy',
      keywords: ['کمدی سیاه', 'فیلم کمدی سیاه', 'dark comedy', 'black comedy'],
      weak: ['کمدی سیاه', 'dark comedy', 'black comedy'],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای کمدی سیاه:\n۱. «در بروژ» (مارتین مک‌دونا، ۲۰۰۸): دو آدم‌کش در شهری نقاشی‌وار؛ طنزی تلخ و وجودی.\n۲. «قصه‌های وحشی» (دامیان سیفرون، ۲۰۱۴): شش روایت خشم و انتقام، هرکدام خنده‌دارتر از قبلی.\n۳. «همستر» (یورگوس لانتیموس، ۲۰۱۵): طنز سورئال درباره اجبارِ عشق‌ورزی.\n۴. «چهار شیر» (کریس موریس، ۲۰۱۰): طنزی بی‌پروا درباره چهار تروریستِ ناشی.\n۵. «میدان» (روبن اوستلوند، ۲۰۱۷): نخل طلای کن؛ طنزی تلخ درباره دنیای هنر و رفتار انسانی.',
      en: 'Non-obvious dark comedy picks:\n1. In Bruges (Martin McDonagh, 2008): two hitmen and pitch-black humor in a storybook town.\n2. Wild Tales (Damian Szifron, 2014): six vignettes of rage and revenge, each funnier than the last.\n3. The Lobster (Yorgos Lanthimos, 2015): a surreal satire on the pressure to couple up.\n4. Four Lions (Chris Morris, 2010): fearless comedy about four bumbling wannabe terrorists.\n5. The Square (Ruben Ostlund, 2017): Palme d Or winner; a biting satire on the art world and human behavior.'
    },
    {
      id: 'movies_fantasy',
      keywords: [
        'فیلم فانتزی',
        'سریال فانتزی',
        'fantasy movie',
        'fantasy film',
        'fantasy series'
      ],
      weak: ['فانتزی', 'خیالی', 'fantasy', 'magical'],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای فانتزی غیرتکراری:\n۱. «ماز پن» (گیرمو دل تورو، ۲۰۰۶): پل میان دنیای واقعی و افسانه‌ها، تاریک و خیره‌کننده.\n۲. «شهر بچه‌های گمشده» (ژان-پیر ژونه، ۱۹۹۵): کابوسی سورئال درباره دزدیدن خوابِ کودکان.\n۳. «پرسپولیس» (مرجان ساتراپی، ۲۰۰۷): انیمیشنی درباره انقلاب ایران با طعم جادوی واقع‌گرایی.\n۴. «قصه قصه‌ها» (ماتئو گارونه، ۲۰۱۵): افسانه‌های کهن ایتالیایی با جادوی بزرگ‌سالانه.\n۵. «شوالیه سبز» (دیوید لاوری، ۲۰۲۱): بازگویی اسطوره آرتوری با فضایی رویایی و پرسش‌برانگیز.',
      en: 'Non-obvious fantasy picks:\n1. Pan Labyrinth (Guillermo del Toro, 2006): a dark, breathtaking bridge between reality and myth.\n2. The City of Lost Children (Jeunet and Caro, 1995): a surreal dream about stolen childhood.\n3. Persepolis (Marjane Satrapi, 2007): an animated memoir of the Iranian revolution, magical and real.\n4. Tale of Tales (Matteo Garrone, 2015): old Italian fairy tales with grown-up magic restored.\n5. The Green Knight (David Lowery, 2021): an Arthurian legend retold with a dreamlike, questioning tone.'
    },
    {
      id: 'movies_short_comedy_series',
      keywords: [
        'سریال کوتاه طنز',
        'سریال طنز کوتاه',
        'سریال کمدی کوتاه',
        'کمدی کوتاه',
        'short comedy series',
        'comedy mini series',
        'funny short series'
      ],
      weak: [
        'سریال کوتاه طنز',
        'کمدی کوتاه',
        'short comedy',
        'funny short series'
      ],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'طنز',
        'کمدی',
        'پیشنهاد',
        'معرفی',
        'series',
        'comedy',
        'recommend',
        'suggest'
      ],
      fa: 'سریال‌های کوتاه طنز غیرتکراری (غیرایرانی):\n۱. «فلیبگ» (Fleabag، ۲۰۱۶، ۱۲ قسمت): طنز تند و صادقانه درباره یک زن لندنی.\n۲. «آفیس» نسخه بریتانیایی (The Office UK، ۲۰۰۱، ۱۴ قسمت): مستندنمای خنده‌دار از یک اداره.\n۳. «پس از زندگی» (After Life، ۲۰۱۹، ۱۸ قسمت): طنز تلخ و مهربان ریکی جرویز.\n۴. «کرَشینگ» (Crashing، ۲۰۱۶، ۶ قسمت): سیتکام اولیه فوبی والر-بریج.\n۵. «استیجد» (Staged، ۲۰۲۰، ۶ قسمت): دیوید تننت و مایکل شین در یک زوم.\n۶. «اکسترا» (Extras، ۲۰۰۵، ۱۲ قسمت): کمدی ریکی جرویز درباره آدم‌های فرعی سینما.',
      en: 'Non-obvious short comedy series (non-Iranian):\n1. Fleabag (2016, 12 episodes): sharp, honest comedy about a London woman.\n2. The Office UK (2001, 14 episodes): the hilarious mockumentary sitcom.\n3. After Life (2019, 18 episodes): Ricky Gervais dark, warm comedy about grief.\n4. Crashing (2016, 6 episodes): Phoebe Waller-Bridge early sitcom.\n5. Staged (2020, 6 episodes): David Tennant and Michael Sheen stuck on Zoom.\n6. Extras (2005, 12 episodes): Gervais comedy about background actors.'
    },
    {
      id: 'movies_short_series',
      keywords: [
        'سریال کوتاه',
        'مینی سریال',
        'مینی‌سریال',
        'short series',
        'mini series',
        'miniseries',
        'limited series'
      ],
      weak: [
        'سریال کوتاه',
        'مینی‌سریال',
        'short series',
        'miniseries',
        'limited series'
      ],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای سریال کوتاه (۵ تا ۱۰ قسمت):\n۱. «چرنوبیل» (۲۰۱۹، ۵ قسمت): بازسازی تکان‌دهنده فاجعه هسته‌ای و دروغ‌های نهادها.\n۲. «ایستگاه یازده» (۲۰۲۱، ۱۰ قسمت): هنر و انسانیت پس از فروپاشی جهان.\n۳. «زن طبل‌زن کوچک» (پارک چان-ووک، ۲۰۱۸، ۶ قسمت): اقتباسی چشم‌نواز از جاسوسی‌های جان لوکاره.\n۴. «صحنه‌هایی از یک ازدواج» (اینگمار برگمان، ۱۹۷۳، ۶ قسمت): کالبدشکافی عشق و جدایی.\n۵. «غیرارتدوکس» (۲۰۲۰، ۴ قسمت): زنی جوان از جامعه اولترا-ارتدوکس بروکلین به برلین می‌گریزد.',
      en: 'Short-series picks (5-10 episodes):\n1. Chernobyl (2019, 5 episodes): a gripping dramatization of the nuclear disaster and institutional lies.\n2. Station Eleven (2021, 10 episodes): art and humanity after a pandemic collapse.\n3. The Little Drummer Girl (Park Chan-wook, 2018, 6 episodes): a hypnotic le Carre adaptation.\n4. Scenes from a Marriage (Ingmar Bergman, 1973, 6 episodes): the definitive anatomy of love and divorce.\n5. Unorthodox (2020, 4 episodes): a young woman flees her ultra-Orthodox Brooklyn community for Berlin.'
    },
    {
      id: 'movies_true_story',
      keywords: [
        'بر اساس واقعیت',
        'بر اساس داستان واقعی',
        'فیلم بر اساس واقعیت',
        'true story',
        'based on true events',
        'based on a true story',
        'real story movie'
      ],
      weak: ['بر اساس واقعیت', 'داستان واقعی', 'true story', 'true events'],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'true',
        'real'
      ],
      fa: 'پیشنهادهای بر اساس داستان واقعی:\n۱. «منطقه مورد علاقه» (جاناتان گلیزر، ۲۰۲۳): زندگی روزمره فرمانده اردوگاه آشویتس و خانواده‌اش.\n۲. «آتش‌ها» (دنی ویلنوو، ۲۰۱۰): معمایی ویرانگر الهام‌گرفته از جنگ داخلی لبنان.\n۳. «پنهان» (میشائل هانکه، ۲۰۰۵): زخم تاریخی پنهان یک ملت از خلال یک خانواده پاریسی.\n۴. «عمل کشتن» (جاشوا اوپنهایمر، ۲۰۱۲): مستندی سورئال درباره جلادان اندونزی.\n۵. «زودیاک» (دیوید فینچر، ۲۰۰۷): تعقیب قاتل زنجیره‌ای واقعی و وسواس روزنامه‌نگاران.',
      en: 'Picks based on true events:\n1. The Zone of Interest (Jonathan Glazer, 2023): the ordinary family life of an Auschwitz commandant.\n2. Incendies (Denis Villeneuve, 2010): a gut-wrenching mystery inspired by the Lebanese civil war.\n3. Caché (Michael Haneke, 2005): a nations hidden trauma seen through one Parisian family.\n4. The Act of Killing (Joshua Oppenheimer, 2012): a surreal documentary about Indonesian death-squad leaders.\n5. Zodiac (David Fincher, 2007): the real Zodiac killer case and the obsession of those who chased him.'
    },
    {
      id: 'movies_thriller',
      keywords: [
        'فیلم هیجانی',
        'فیلم دلهره‌آور',
        'فیلم دلهرهآور',
        'فیلم دلهره آور',
        'فیلم تریلر',
        'thriller movie',
        'thriller film',
        'psychological thriller'
      ],
      weak: [
        'هیجانی',
        'دلهره‌آور',
        'دلهرهآور',
        'دلهره آور',
        'thriller',
        'suspense'
      ],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای هیجانی غیرتکراری:\n۱. «خاطرات قتل» (بونگ جون‌هو، ۲۰۰۳): نخستین پرونده قتل‌های زنجیره‌ای کره جنوبی؛ ترکیب جنایی و طنز تلخ.\n۲. «اولدبوی» (پارک چان-ووک، ۲۰۰۳): انتقامی اسطوره‌ای که ذهن را درگیر می‌کند.\n۳. «زندانی‌ها» (دنی ویلنوو، ۲۰۱۳): معمای اخلاقی پدری که قانون را زیر پا می‌گذارد.\n۴. «راز چشم‌هایشان» (خوان خوزه کامپانلا، ۲۰۰۹): اسکار بهترین فیلم خارجی؛ عشق، خشونت و حافظه.\n۵. «شکارچی سر» (مورتن تیلدام، ۲۰۱۱): دزدی هنری در نروژ که به تعقیب‌وگریز تبدیل می‌شود.',
      en: 'Non-obvious thriller picks:\n1. Memories of Murder (Bong Joon-ho, 2003): the first serial-killer case in South Korea, mixing crime with bitter humor.\n2. Oldboy (Park Chan-wook, 2003): a mythic revenge story that gets under your skin.\n3. Prisoners (Denis Villeneuve, 2013): a moral thriller about a father who crosses the line.\n4. The Secret in Their Eyes (Juan Jose Campanella, 2009): an Oscar-winning Argentine mix of love, violence, and memory.\n5. Headhunters (Morten Tyldum, 2011): a Norwegian art heist that turns into a manhunt.'
    },
    {
      id: 'movies_sci_fi',
      keywords: [
        'فیلم علمی تخیلی',
        'فیلم علمی-تخیلی',
        'سریال علمی تخیلی',
        'science fiction movie',
        'sci fi movie',
        'sci-fi film'
      ],
      weak: [
        'علمی تخیلی',
        'علمی-تخیلی',
        'science fiction',
        'sci fi',
        'sci-fi',
        'scifi'
      ],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای علمی-تخیلی هوشمند:\n۱. «ورود» (دنی ویلنوو، ۲۰۱۶): تماس با بیگانگان از دریچه زبان‌شناسی.\n۲. «اگزماشینا» (الکس گارلند، ۲۰۱۴): هوش مصنوعی در خانه‌ای شیشه‌ای.\n۳. «گاتاکا» (اندرو نیکول، ۱۹۹۷): آینده‌ای که در آن ژن‌ها سرنوشت را می‌سازند.\n۴. «ماه» (دانکن جونز، ۲۰۰۹): کارگری تنها در ایستگاه ماه و رازی درباره خودش.\n۵. «او» (اسپایک جونز، ۲۰۱۳): عشقی میان مردی تنها و سیستم‌عاملش.',
      en: 'Smart sci-fi picks:\n1. Arrival (Denis Villeneuve, 2016): alien contact told through linguistics.\n2. Ex Machina (Alex Garland, 2014): artificial intelligence in a glass house.\n3. Gattaca (Andrew Niccol, 1997): a future where genes decide your fate.\n4. Moon (Duncan Jones, 2009): a lonely lunar worker uncovers a secret about himself.\n5. Her (Spike Jonze, 2013): a lonely man falls for his operating system.'
    },
    {
      id: 'movies_documentary',
      keywords: [
        'فیلم مستند',
        'مستند خوب',
        'مستند ببینم',
        'documentary movie',
        'documentary film',
        'watch a documentary'
      ],
      weak: ['مستند', 'documentary', 'documentaries'],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای مستند ماندگار:\n۱. «برای ساما» (وعد الخاطب، ۲۰۱۹): زندگی در حلب جنگ‌زده از چشم یک مادر.\n۲. «معلم هشت‌پای من» (پیپا ارلیش، ۲۰۲۰): پیوندی غیرمنتظره میان یک غواص و هشت‌پا.\n۳. «بیست روز در ماریوپل» (مستیسلاو چرنوف، ۲۰۲۳): روزهای محاصره از درون اوکراین.\n۴. «فری سولو» (الیزابت چای واساره‌لی و جیمی چین، ۲۰۱۸): صعود بدون طناب از ال کاپیتان.\n۵. «والس با بشیر» (آری فولمن، ۲۰۰۸): انیمیشن مستند درباره جنگ و حافظه.',
      en: 'Documentaries that stay with you:\n1. For Sama (Waad al-Kateab, 2019): a young mother filming war-torn Aleppo.\n2. My Octopus Teacher (Pippa Ehrlich, 2020): an unexpected bond between a diver and an octopus.\n3. 20 Days in Mariupol (Mstyslav Chernov, 2023): the siege of Mariupol from inside.\n4. Free Solo (Elizabeth Chai Vasarhelyi and Jimmy Chin, 2018): climbing El Capitan without a rope.\n5. Waltz with Bashir (Ari Folman, 2008): an animated documentary about war and memory.'
    },
    {
      id: 'movies_animation',
      keywords: [
        'فیلم انیمیشن',
        'انیمیشن خوب',
        'انیمیشن ببینم',
        'animated movie',
        'animation movie',
        'animated film',
        'cartoon movie'
      ],
      weak: ['انیمیشن', 'انیمیشنی', 'animation', 'animated', 'cartoon'],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'پیشنهادهای انیمیشن فراتر از دیزنی:\n۱. «شهر اشباح» (هایائو میازاکی، ۲۰۰۱): اسکار بهترین انیمیشن؛ دختری در سرزمین ارواح.\n۲. «غول آهنی» (برد برد، ۱۹۹۹): رباتی مهربان در آمریکای دهه ۱۹۵۰.\n۳. «ترانه دریا» (تام مور، ۲۰۱۴): افسانه‌های سلتی و موسیقی چشم‌نواز.\n۴. «آنومالیسا» (چارلی کافمن، ۲۰۱۵): استاپ‌موشن بزرگ‌سالانه درباره تنهایی.\n۵. «آقای فاکس شگفت‌انگیز» (وس اندرسون، ۲۰۰۹): طنز خانوادگی بامزه با سبک خاص اندرسون.',
      en: 'Animation beyond Disney:\n1. Spirited Away (Hayao Miyazaki, 2001): Oscar-winning journey of a girl in the spirit world.\n2. The Iron Giant (Brad Bird, 1999): a gentle robot in 1950s America.\n3. Song of the Sea (Tomm Moore, 2014): Celtic myth and breathtaking music.\n4. Anomalisa (Charlie Kaufman, 2015): an adult stop-motion film about loneliness.\n5. Fantastic Mr. Fox (Wes Anderson, 2009): signature Anderson charm in stop-motion.'
    },
    {
      id: 'movies_feel_good',
      keywords: [
        'فیلم حال خوب کن',
        'فیلم حال‌خوب‌کن',
        'فیلم شاد',
        'فیلم روحیه‌بخش',
        'فیلمی که حالمو خوب کنه',
        'feel good movie',
        'feel-good movie',
        'uplifting movie',
        'heartwarming movie',
        'a movie to cheer me up'
      ],
      weak: [
        'حال خوب',
        'حال‌خوب',
        'شاد',
        'روحیه',
        'feel good',
        'uplifting',
        'cheerful'
      ],
      weakSafe: true,
      hints: [
        'فیلم',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'movie',
        'series',
        'recommend',
        'suggest',
        'genre'
      ],
      fa: 'فیلم‌هایی که حال را خوب می‌کنند:\n۱. «زندگی زیباست» (روبرتو بنینی، ۱۹۹۷): پدری که با بازی و مهربانی، وحشت را از کودکی دور می‌کند.\n۲. «آملی» (ژان-پیر ژونه، ۲۰۰۱): دختری که بی‌سروصدا زندگی دیگران را روشن می‌کند.\n۳. «آپستریت» یا «به بالا» (پیکسار، ۲۰۰۹): تلخ‌وشیرین، امیدبخش و سرشار از مهربانی.\n۴. «فارست گامپ» (رابرت زمکیس، ۱۹۹۴): سفری ساده که دل را گرم می‌کند.\n۵. «سفر به ایتالیا» یا «روزهای به یادماندنی» (مایکل وینترباتم، ۲۰۱۰): طنزی آرام درباره دو رفیق و غذا.\n۶. «دنیای بچه‌ها» یا Little Miss Sunshine (۲۰۰۶): خانواده‌ای به‌هم‌ریخته که در راه رسیدن به یک مسابقه، هم‌دیگر را پیدا می‌کنند.\n۷. «روح» یا Soul (پیکسار، ۲۰۲۰): درباره معنا و لذت‌های کوچک زندگی.\n۸. «جریان» یا Flow (۲۰۲۴): گربه‌ای تنها در جهانی پس از سیل؛ بدون دیالوگ و عمیقاً انسانی.',
      en: 'Feel-good films that lift the mood:\n1. Life Is Beautiful (Roberto Benigni, 1997): a father shields his son from horror with play and love.\n2. Amelie (Jean-Pierre Jeunet, 2001): a girl quietly brightening the lives of others.\n3. Up (Pixar, 2009): bittersweet, hopeful, and full of kindness.\n4. Forrest Gump (Robert Zemeckis, 1994): a simple journey that warms the heart.\n5. The Trip (Michael Winterbottom, 2010): gentle comedy about two friends and fine food.\n6. Little Miss Sunshine (2006): a chaotic family finding each other on the road to a pageant.\n7. Soul (Pixar, 2020): about meaning and the small joys of everyday life.\n8. Flow (2024): a lone cat in a world after a flood; dialogue-free and deeply human.'
    },
    {
      id: 'movies_tv_series',
      keywords: [
        'سریال پیشنهاد بده',
        'چه سریالی ببینم',
        'سریال چی ببینم',
        'سریال معرفی کن',
        'سریال خوب ببینم',
        'سریال خوب برای تماشا',
        'سریال جذاب معرفی کن',
        'سریال دیدن',
        'recommend a tv series',
        'recommend a good series',
        'recommend me a good series',
        'what series should i watch',
        'best series to watch',
        'binge worthy series',
        'tv series suggestions',
        'series suggestions',
        'series recommendation'
      ],
      weak: ['سریال', 'series', 'shows'],
      weakSafe: true,
      hints: [
        'پیشنهاد',
        'معرفی',
        'تماشا',
        'ببینم',
        'recommend',
        'watch',
        'suggest',
        'binge'
      ],
      fa: 'پیشنهادهای سریال، از محبوب تا زیرزمینی‌تر:\n۱. «بریکینگ بد» (Breaking Bad): استاد شیمی که به‌تدریج وارد دنیای جنایت می‌شود؛ یکی از بهترین درام‌های تاریخ تلویزیون.\n۲. «وراثت» (Succession): نبرد قدرت در خانواده‌ای رسانه‌ای؛ طنزی تلخ و دیالوگ‌های درخشان.\n۳. «سِوِرنس» (Severance): کارمندانی که حافظه‌ی کار و زندگی‌شان جدا شده؛ علمی-تخیلی معمایی و اعتیادآور.\n۴. «دارک» (Dark): معمای سفر در زمان در شهری کوچک آلمانی؛ هوشمند و لایه‌لایه.\n۵. «تد لاسو» (Ted Lasso): مربی فوتبال آمریکایی در انگلیس؛ مهربان، خنده‌دار و حال‌خوب‌کن.\n۶. «بازی مرکب» (Squid Game): بازی‌های مرگبار برای فقیرها؛ نقدی تند بر نابرابری و سرگرم‌کننده.',
      en: 'Series picks, from beloved to more underground:\n1. Breaking Bad: a chemistry teacher slowly drawn into the criminal world; one of the greatest dramas ever on television.\n2. Succession: a power struggle inside a media dynasty, with vicious wit and brilliant dialogue.\n3. Severance: employees whose work and home memories are surgically split; an addictive sci-fi puzzle.\n4. Dark: a time-travel mystery in a small German town; clever and layered.\n5. Ted Lasso: an American football coach in England; kind, funny, and uplifting.\n6. Squid Game: deadly games for the desperate; a sharp critique of inequality that is also wildly entertaining.'
    },
    {
      id: 'movies_anime',
      keywords: [
        'انیمه',
        'انیمه ببینم',
        'انیمه چی ببینم',
        'انیمه چه ببینم',
        'انیمه چی خوبه',
        'سریال انیمه',
        'انیمه پیشنهاد',
        'انیمه ژاپنی',
        'انیمیشن ژاپنی',
        'anime',
        'anime series',
        'anime to watch',
        'japanese anime',
        'recommend anime',
        'anime recommendations',
        'best anime'
      ],
      weak: ['انیمه', 'anime'],
      weakSafe: true,
      hints: [
        'ژاپنی',
        'سریال',
        'پیشنهاد',
        'معرفی',
        'تماشا',
        'japanese',
        'series',
        'watch',
        'recommend'
      ],
      fa: 'پیشنهادهای انیمه برای تازه‌کارها و علاقه‌مندان:\n۱. «نام تو» (Your Name، ۲۰۱۶): عاشقانه‌ای خیال‌انگیز درباره دو نوجوان که خواب‌هایشان را عوض می‌کنند.\n۲. «صدای خاموش» (A Silent Voice، ۲۰۱۶): درباره‌ی قلدری، بخشش و بازگشت به زندگی.\n۳. «فولمتال آلکمیست: برادرهود»: داستانی حماسی درباره برادرانی که قانون تبادل را شکستند.\n۴. «اسپای ایکس فمیلی» (Spy x Family): جاسوس، قاتل و تله‌پات که یک خانواده‌ی نمایشی می‌سازند؛ کمدی گرم و خانوادگی.\n۵. «وایولت اورگاردن» (Violet Evergarden): نامه‌نویسی که احساسات را از خلال نامه‌های دیگران می‌فهمد؛ درخشان و اشک‌آور.\n۶. «شکارچی شیطان» (Demon Slayer): نبرد نوجوانی برای نجات خواهرش؛ انیمیشن فوق‌العاده و هیجانی.',
      en: 'Anime picks for newcomers and fans alike:\n1. Your Name (2016): a dreamlike romance about two teenagers who swap places in their sleep.\n2. A Silent Voice (2016): about bullying, forgiveness, and finding a way back to life.\n3. Fullmetal Alchemist: Brotherhood: an epic story of two brothers who broke the rules of alchemy.\n4. Spy x Family: a spy, an assassin, and a telepath building a fake family; warm, funny, and wholesome.\n5. Violet Evergarden: a letter-writer who learns feelings through the letters of others; gorgeous and tearful.\n6. Demon Slayer: a teenage battle to save a sister, with stunning animation and edge-of-seat action.'
    },
    {
      id: 'youtubers_recommendation',
      keywords: [
        'یوتیوبر',
        'یوتیوبر خوب',
        'یوتیوبرهای خوب',
        'یوتیوبر ایرانی',
        'کانال یوتیوب',
        'youtuber',
        'youtubers',
        'good youtubers',
        'best youtubers',
        'youtube channels',
        'recommend some youtubers',
        'name some youtubers',
        'name some good youtubers',
        'good youtube channels',
        'best youtube channels'
      ],
      weak: ['یوتیوب', 'youtube'],
      weakSafe: false,
      hints: ['پیشنهاد', 'معرفی', 'اسم', 'recommend', 'name', 'کانال'],
      fa: 'چند یوتیوبر خوب بر اساس حوزه (سلایق شخصی متفاوت است، پس این‌ها نقطه‌ی شروع‌اند):\nآموزش و تکنولوژی: فیل‌ایکس (فلکس)، مایکل ریوز و خرسندبلاگ.\nعلم: ورشو و دکتر محسن داوری (علمی و پزشکی ساده).\nتاریخ و فرهنگ: کانال‌های مستندسازی مثل نیم‌روز و سرنخ.\nسرگرمی و لایف‌استایل: پین‌کست و راد.\nسفر و تجربه: کانال‌های ویدیویی مثل سفرنامه‌ی مستند. اگر ژانر مورد علاقه‌ات را بگویی، دقیق‌تر پیشنهاد می‌دهم.',
      en: 'A few good YouTubers by area (tastes differ, so treat these as starting points):\nEducation and tech: Fireship, Michael Reeves, and NetworkChuck.\nScience: Kurzgesagt and Veritasium.\nHistory and culture: OverSimplified and Vox.\nEntertainment and lifestyle: MrBeast and Yes Theory.\nTravel and documentary: Drew Binsky and Bald and Bankrupt. Tell me a genre you like and I can be more specific.'
    },
    {
      id: 'song_recommendations',
      keywords: [
        'آهنگ پیشنهاد',
        'یه آهنگ پیشنهاد',
        'یک آهنگ پیشنهاد',
        'آهنگ خوب',
        'آهنگ پیشنهاد بده',
        'موسیقی پیشنهاد',
        'song recommendation',
        'recommend a song',
        'recommend some songs',
        'good songs to listen',
        'suggest a song',
        'suggest some music'
      ],
      weak: ['آهنگ', 'موسیقی', 'song', 'music'],
      weakSafe: false,
      hints: ['پیشنهاد', 'بده', 'بگو', 'recommend', 'suggest', 'listen'],
      fa: 'چند آهنگ ماندگار از فرهنگ‌های مختلف (سلیقه شخصی است، پس این‌ها نقطه‌ی شروع‌اند):\nفارسی کلاسیک: «مرغ سحر» با صدای قمرالملوک وزیری یا اجراهای ارکسترال.\nفارسی مدرن: قطعه‌های ماندگار محسن نامجو مثل «آهای مردم».\nدنیا: «بوهمین رپسودی» ملکه (Queen)، «ایمرجین» پینک‌فلوی (Pink Floyd)، «هتل کالیفرنیا» ایگلز (Eagles) و «تایم» هانس زیمر. اگر حال‌وهوای امروزت را بگویی، دقیق‌تر پیشنهاد می‌دهم.',
      en: 'A few timeless songs from different cultures (taste is personal, so treat these as starting points):\nClassics: Bohemian Rhapsody by Queen and Hotel California by the Eagles.\nAmbient and deep: Time by Hans Zimmer and Shine On You Crazy Diamond by Pink Floyd.\nModern: Blinding Lights by The Weeknd and Viva La Vida by Coldplay. Tell me your current mood and I can be more specific.'
    },
    {
      id: 'horror_story',
      keywords: [
        'داستان ترسناک',
        'داستان وحشت',
        'داستان ترسناک تعریف کن',
        'یه داستان ترسناک',
        'یک داستان ترسناک',
        'داستان ترسناک بگو',
        'horror story',
        'scary story',
        'tell me a horror story',
        'tell me a scary story'
      ],
      weak: ['ترسناک', 'وحشت', 'scary', 'creepy'],
      weakSafe: false,
      hints: ['داستان', 'تعریف', 'بگو', 'story', 'tell'],
      fa: 'یک داستان کوتاه ترسناک:\nاتاق کناری هر شب ساعت سه دقیقه بامداد، در می‌زد: سه ضربه‌ی آرام و منظم. ماه‌ها بود که آن اتاق خالی بود و کلیدش را مادرم زیر فرش پنهان کرده بود. دیشب به جای صدای در، یک صدای زنانه از پشت دیوار گفت: «این بار کلید را تو پنهان کردی؟» من هنوز جواب ندادم، چون مطمئن نیستم مادرم این جمله را شنیده یا نه. دوست داری همین‌جا تمامش کنم یا ادامه بدهم؟',
      en: 'A short horror story:\nEvery night at exactly 3:03 AM, the door of the spare room knocked: three soft, steady taps. The room had been empty for months, and my mother had hidden its key under the rug. Last night, instead of the knock, a woman voice whispered through the wall: Did you hide the key this time? I have not answered yet, because I am not sure whether my mother heard it too. Do you want me to end it here, or keep going?'
    },
    {
      id: 'books_recommendations',
      keywords: [
        'کتاب معرفی کن',
        'کتاب بهم معرفی کن',
        'کتاب به من معرفی کن',
        'چندتا کتاب',
        'یه کتاب معرفی',
        'یک کتاب معرفی',
        'کتاب پیشنهاد',
        'کتاب خوب',
        'recommend a book',
        'recommend me a book',
        'recommend some books',
        'recommend me some books',
        'suggest some books',
        'suggest a book',
        'book recommendations',
        'book recommendation',
        'recommendation while',
        'good books',
        'books to read'
      ],
      weak: ['کتاب', 'book', 'books', 'novel', 'novels'],
      weakSafe: true,
      hints: [
        'پیشنهاد',
        'معرفی',
        'بخونم',
        'خواندن',
        'recommend',
        'suggest',
        'read'
      ],
      fa: 'چند کتاب خوب و غیرتکراری، از ادبیات ایران و جهان:\n۱. «بوف کور» (صادق هدایت): رمانی تاریک و تأمل‌برانگیز درباره‌ی تنهایی و کابوس.\n۲. «کلیدر» (محمود دولت‌آبادی): حماسه‌ای بلند از زندگی روستایی ایران.\n۳. «سووشون» (سیمین دانشور): روایت خانواده‌ای شیرازی در سال‌های جنگ و تغییر.\n۴. «کیمیاگر» (پائولو کوئلیو): داستانی ساده و الهام‌بخش درباره‌ی دنبال‌کردن رؤیاها.\n۵. «صد سال تنهایی» (گابریل گارسیا مارکز): شاهکار رئالیسم جادویی.\n۶. «1984» (جورج اورول): هشداری تند درباره‌ی قدرت و نظارت.\n۷. «کتابخانه‌ی نیمه‌شب» (مت هیگ): رمانی گرم درباره‌ی انتخاب‌ها و معنا.\n۸. «کوه جادو» (توماس مان): رمانی عمیق درباره‌ی زمان و بیماری.',
      en: 'A few good, less-obvious books from Persian and world literature:\n1. The Blind Owl (Sadegh Hedayat): a dark, brooding novel about solitude and nightmare.\n2. Kelidar (Mahmoud Dowlatabadi): an epic of rural Iranian life.\n3. Savushun (Simin Daneshvar): a Shirazi family during years of war and change.\n4. The Alchemist (Paulo Coelho): a simple, inspiring tale about following dreams.\n5. One Hundred Years of Solitude (Gabriel Garcia Marquez): a masterpiece of magical realism.\n6. 1984 (George Orwell): a sharp warning about power and surveillance.\n7. The Midnight Library (Matt Haig): a warm novel about choices and meaning.\n8. The Magic Mountain (Thomas Mann): a deep novel about time and illness.'
    }
  ]);
  // Literature facts: Hafez of Shiraz and the author of 1984. Kept in the
  // entertainment part file with the other books and culture entries.
  global.DaryaFactChunks.push([
    {
      id: 'hafez',
      keywords: [
        'درباره حافظ',
        'حافظ کیست',
        'شمس الدین محمد حافظ',
        'شمس‌الدین محمد حافظ',
        'حافظ شیرازی',
        'شعر حافظ',
        'غزل های حافظ',
        'who is hafez',
        'hafez of shiraz',
        'persian poet hafez',
        'tell me about hafez',
        'hafez biography'
      ],
      weak: ['حافظ', 'hafez'],
      weakSafe: true,
      hints: [
        'شاعر',
        'شعر',
        'فارسی',
        'شیراز',
        'poet',
        'poetry',
        'ghazal',
        'دیوان'
      ],
      fa: 'خواجه شمس‌الدین محمد حافظ شیرازی، شاعر بزرگ فارسی‌زبان سده‌ی هشتم هجری (قرن چهاردهم میلادی)، از شیراز است. «دیوان حافظ» شامل حدود ۵۰۰ غزل است و او را «لسان‌الغیب» (زبانِ نهان) می‌خوانند؛ در ایران فال حافظ بخشی از فرهنگ عامه است. حافظ در غزل به عشق، نقد ریا و زهدِ ظاهری، و آزادگی می‌پردازد و هم‌پایه‌ی سعدی از ستون‌های ادبیات فارسی شمرده می‌شود.',
      en: 'Hafez of Shiraz (Khwaja Shams-ud-Din Muhammad Hafez, 14th century CE) is one of the greatest Persian poets. His Divan contains roughly 500 ghazals, and Iranians still read his poetry in a tradition called "fal-e Hafez" (bibliomancy), treating a random verse as guidance. His work is famous for its celebration of love and wine as metaphors, its critique of hypocritical piety, and its deep spiritual insight. Alongside Saadi, he is a pillar of Persian literature and his tomb in Shiraz remains a beloved pilgrimage site.'
    },
    {
      id: 'orwell_1984',
      keywords: [
        'who wrote 1984',
        'author of 1984',
        '1984 by george orwell',
        '1984 written by',
        'who is george orwell',
        'جورج اورول',
        '1984 نوشته',
        'نویسنده 1984',
        '1984 اثر'
      ],
      weak: ['orwell', 'اورول', '1984'],
      weakSafe: true,
      hints: [
        'نویسنده',
        'نوشته',
        'اثر',
        'کتاب',
        'رمان',
        'novel',
        'author',
        'wrote',
        'dystopia',
        'داستان'
      ],
      fa: 'رمان «۱۹۸۴» را جورج اورول، نویسنده‌ی انگلیسی، نوشت و در ۱۹۴۹ منتشر کرد. این رمان ضدآرمان‌شهری درباره‌ی نظارت همه‌جانبه‌ی یک حکومت تمامیت‌خواه، «برادر بزرگ»، و کنترل حقیقت و زبان است؛ اصطلاحاتی مثل «برادر بزرگ» و «فکرنوازی» از همین کتاب وارد زبان روزمره شدند. اورول همچنین نویسنده‌ی رمان «مزرعه‌ی حیوانات» است.',
      en: 'George Orwell (Eric Arthur Blair), the English writer, wrote Nineteen Eighty-Four (1949). This dystopian novel portrays an all-powerful totalitarian state, the figure of Big Brother, and the control of truth and language. It introduced the ideas of "Big Brother is watching you" and "newspeak" into everyday speech. Orwell is also the author of Animal Farm, and his essays, including "Politics and the English Language", remain widely studied.'
    }
  ]);

  // Curated factual entries appended by the knowledge-expansion pass.
  global.DaryaFactChunks.push([
    {
      id: 'movies_masterpieces',
      keywords: [
        'شاهکارهای سینما',
        'بهترین فیلم های تاریخ',
        'فیلم های ماندگار',
        'فیلم کلاسیک سینما',
        'cinema masterpieces',
        'best films of all time',
        'greatest movies ever',
        'classic masterpiece films',
        'iconic films'
      ],
      weak: [
        'شاهکار',
        'ماندگار',
        'masterpiece',
        'masterpieces',
        'iconic',
        'classic'
      ],
      weakSafe: true,
      hints: [
        'فیلم',
        'سینما',
        'پیشنهاد',
        'بهترین',
        'movie',
        'film',
        'cinema',
        'best'
      ],
      fa: 'چند شاهکار ماندگار سینما که تقریباً همه‌ی منتقدان تحسینشان می‌کنند:\n۱. «پدرخوانده» (فرانسیس فورد کوپولا، ۱۹۷۲): حماسه‌ای درباره‌ی خانواده و قدرت.\n۲. «همشهری کین» (اورسن ولز، ۱۹۴۱): روایتی پیشرو درباره‌ی جاه‌طلبی و تنهایی.\n۳. «شهر خدا» (فرناندو میرلس، ۲۰۰۲): واقع‌گرایی خشن از دل فقر.\n۴. «هفت‌سامورایی» (آکیرا کوروساوا، ۱۹۵۴): تأثیرگذارترین فیلم‌های اکشن تاریخ.\n۵. «درخشش» (استنلی کوبریک، ۱۹۸۰): شاهکاری در ژانر وحشت روانی.\n۶. «باشگاه مبارزه» (دیوید فینچر، ۱۹۹۹): نقدی تند بر مصرف‌گرایی.\n۷. «پالت‌دوگِر» (کریستوفر نولان، ۲۰۱۰): درباره‌ی خاطره و هویت.\n۸. «روشنایی‌های شهر» (چارلی چاپلین، ۱۹۳۱): کلاسیک بی‌کلام و عمیق.',
      en: 'A few enduring cinema masterpieces almost every critic admires:\n1. The Godfather (Francis Ford Coppola, 1972): an epic of family and power.\n2. Citizen Kane (Orson Welles, 1941): a pioneering tale of ambition and loneliness.\n3. City of God (Fernando Meirelles, 2002): raw realism from within poverty.\n4. Seven Samurai (Akira Kurosawa, 1954): among the most influential action films ever.\n5. The Shining (Stanley Kubrick, 1980): a masterpiece of psychological horror.\n6. Fight Club (David Fincher, 1999): a sharp critique of consumerism.\n7. Inception (Christopher Nolan, 2010): about memory and identity.\n8. City Lights (Charlie Chaplin, 1931): a deep silent classic.'
    }
  ]);

  // Curated factual entries appended by the knowledge-expansion pass.
  global.DaryaFactChunks.push([
    {
      id: 'anime_by_genre',
      keywords: [
        'انیمه پیشنهاد',
        'بهترین انیمه',
        'انیمه معرفی کن',
        'انیمه جدید',
        'anime recommendations',
        'best anime',
        'recommend anime',
        'good anime to watch'
      ],
      weak: ['انیمه', 'anime'],
      weakSafe: true,
      hints: [
        'پیشنهاد',
        'بهترین',
        'معرفی',
        'تماشا',
        'recommend',
        'best',
        'watch'
      ],
      fa: 'چند انیمه‌ی محبوب به تفکیک ژانر:\nهیجان و ماجراجویی: «حمله به تایتان» و «وان پیس».\nفانتزی و دنیای جادویی: «فول‌مِتال آکمیست: برادرهود» و «سوسومه».\nروان‌شناختی و معمایی: «دِث‌نوت» و «شبح درون پوسته».\nکمدی و روزمره: «مُب سایکو ۱۰۰» و «هرگونه کارگردانی ماکوتو شینکای».\nاحساسی و عاشقانه: «نام تو» و «قلعه‌ی متحرک هاول».\nبرای شروع، «برادرهود» و «نام تو» تقریباً برای همه‌ی سلیقه‌ها انتخاب امنی‌اند.',
      en: 'A few popular anime picks by genre:\nAction and adventure: Attack on Titan and One Piece.\nFantasy and magical worlds: Fullmetal Alchemist: Brotherhood and Mushishi.\nPsychological and mystery: Death Note and Ghost in the Shell.\nComedy and slice of life: Mob Psycho 100 and anything directed by Makoto Shinkai.\nEmotional and romantic: Your Name and Howl Moving Castle.\nTo start, Brotherhood and Your Name are safe choices for almost any taste.'
    }
  ]);

  // Curated factual entries appended by the knowledge-expansion pass.
  global.DaryaFactChunks.push([
    {
      id: 'books_by_genre',
      keywords: [
        'کتاب پیشنهاد',
        'بهترین کتاب',
        'کتاب معرفی کن',
        'کتاب خوب بخونم',
        'book recommendations',
        'best books to read',
        'recommend a book',
        'good books'
      ],
      weak: ['کتاب', 'رمان', 'book', 'books', 'novel'],
      weakSafe: true,
      hints: [
        'پیشنهاد',
        'بهترین',
        'معرفی',
        'بخونم',
        'recommend',
        'best',
        'read'
      ],
      fa: 'چند کتاب عالی به تفکیک ژانر:\nعلمی-تخیلی: «باشگاه کتاب‌بازها» و «بلندی‌های بادگیر».\nراز و معمایی: «قتل در قطار سریع‌السیر شرق» (آگاتا کریستی).\nفانتزی: «ارباب حلقه‌ها» (جی. آر. آر. تالکین).\nرئالیسم جادویی: «صد سال تنهایی» (گابریل گارسیا مارکز).\nروان‌شناختی: «جنایت و مکافات» (داستایوفسکی).\nادبیات فارسی: «بوف کور» (صادق هدایت) و «سووشون» (سیمین دانشور).\nغیرداستانی و الهام‌بخش: «انسان در جست‌وجوی معنا» (ویکتور فرانکل).',
      en: 'A few excellent books by genre:\nScience fiction: Dune and Nineteen Eighty-Four.\nMystery: Murder on the Orient Express (Agatha Christie).\nFantasy: The Lord of the Rings (J. R. R. Tolkien).\nMagical realism: One Hundred Years of Solitude (Gabriel Garcia Marquez).\nPsychological: Crime and Punishment (Dostoevsky).\nPersian literature: The Blind Owl (Sadegh Hedayat) and Savushun (Simin Daneshvar).\nNonfiction and inspiring: Man Search for Meaning (Viktor Frankl).'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
