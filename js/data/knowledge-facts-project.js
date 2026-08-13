/**
 * Darya - curated factual entries (project domain).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'darya_project',
      keywords: [
        'سورس کد',
        'ریپازیتوری',
        'گیت هاب',
        'گیت‌هاب',
        'گیتهاب',
        'کد منبع',
        'منبع پروژه',
        'متن باز',
        'source code',
        'repository',
        'repositories',
        'repo',
        'project repo',
        'your repo',
        'the repo',
        'github',
        'open source',
        'where is your code',
        'where is the code',
        'where is the repo',
        'where is the source',
        'is darya open source'
      ],
      weak: ['سورس', 'کد پروژه', 'project source'],
      weakSafe: true,
      hints: ['دریا', 'darya', 'پروژه', 'project', 'کد', 'code'],
      fa: 'دریا یک همراه گفتگوی متن‌باز و کاملاً آفلاین است؛ همه‌چیز داخل مرورگر خودت اجرا می‌شود و هیچ داده‌ای جمع نمی‌کند. سورس‌کد پروژه در گیت‌هاب و در آدرس github.com/sheikhartin/darya قرار دارد. پروژه بدون فریم‌ورک و با جاوااسکریپت و CSS خالص ساخته شده و به‌صورت PWA نصب می‌شود؛ یعنی بعد از اولین بار، حتی بدون اینترنت هم کار می‌کند.',
      en: 'Darya is an open-source, fully offline conversation companion: everything runs inside your browser and no data is collected. The source code lives on GitHub at github.com/sheikhartin/darya. The project is built with plain JavaScript and CSS, no frameworks, and installs as a PWA, so after the first load it works even without the internet.'
    },
    {
      id: 'career_plan_tech',
      keywords: [
        'برنامه شغلی',
        'پلن شغلی',
        'مسیر شغلی برنامه نویسی',
        'برنامه یادگیری برنامه نویسی',
        'چطور برنامه نویس شوم',
        'چطور توسعه دهنده شوم',
        'چطور کارشناس داده شوم',
        'چطور دیتاساینتیست شوم',
        'چطور طراح یوآی شوم',
        'career plan',
        'career roadmap',
        'learning path',
        'how to become a developer',
        'how to become a programmer',
        'how to become a data scientist',
        'how to become a ui designer'
      ],
      weak: [
        'برنامه نویس',
        'برنامه‌نویس',
        'توسعه دهنده',
        'توسعه‌دهنده',
        'علم داده',
        'دیتا ساینس',
        'طراح یوآی',
        'طراح ui',
        'developer',
        'programmer',
        'data science',
        'ui design',
        'roadmap'
      ],
      weakSafe: true,
      hints: ['شغل', 'مسیر', 'یادگیری', 'برنامه', 'career', 'learn', 'plan'],
      fa: 'چند مسیر رایج با برنامه‌ی عملی:\n\nبرنامه‌نویسی و توسعه‌ی وب: ۱) یک تخصص انتخاب کن (مثلاً بک‌اند با جاوااسکریپت/Node.js یا پایتون) و فقط همان را جلو ببر. ۲) سه پروژه‌ی واقعی بساز: یک وب‌اپ با دیتابیس، یک API، و یک اپلیکیشن کامل با دپلوی. ۳) گیت و گیت‌هاب، تست و مستندسازی را یاد بگیر. ۴) نمونه‌کار را در گیت‌هاب و یک رزومه‌ی نتیجه‌محور آماده کن. ۵) بعد از ۶ تا ۱۲ ماه، برای کارآموزی و موقعیت‌های سطح ابتدایی اقدام کن.\n\nعلم داده و هوش مصنوعی: ۱) مبانی ریاضی (آمار و احتمال) و پایتون را محکم کن. ۲) یادگیری ماشین را با کتابخانه‌های اصلی (pandas، scikit-learn و بعداً PyTorch) یاد بگیر. ۳) هر هفته یک پروژه‌ی کوچک از سایت‌های مسابقات داده انجام بده. ۴) سه پروژه‌ی کامل با تحلیل و گزارش درست کن. ۵) برای نقش‌های جونیور یا کارآموزی داده اقدام کن؛ مدرک خوب است اما نمونه‌کار حرف اول را می‌زند.\n\nطراحی محصول و رابط کاربری: ۱) اصول طراحی، تایپوگرافی و رنگ را یاد بگیر. ۲) ابزار اصلی (مثل Figma) را مسلط شو. ۳) سه اپ یا وب‌سایت واقعی را دوباره‌طراحی کن و فرایند را مستند کن. ۴) نمونه‌کار بساز و در شبکه‌های طراحی منتشر کن. ۵) با پروژه‌های کوچک فریلنس شروع کن تا نمونه‌کار و اعتمادبه‌نفس جمع کنی.',
      en: 'Concrete plans for common tech paths:\n\nSoftware development: 1) Pick one specialty (for example backend with JavaScript/Node.js or Python) and go deep on only that. 2) Build three real projects: a web app with a database, an API, and a full app with deployment. 3) Learn Git and GitHub, testing, and documentation. 4) Prepare a portfolio on GitHub and a result-oriented resume. 5) After 6 to 12 months, apply for internships and entry-level roles.\n\nData science and AI: 1) Solidify math basics (statistics and probability) and Python. 2) Learn machine learning with the main libraries (pandas, scikit-learn, later PyTorch). 3) Do one small project from data-competition sites every week. 4) Build three complete projects with analysis and write-ups. 5) Apply for junior or intern data roles; a degree helps, but a portfolio speaks first.\n\nProduct and UI design: 1) Learn design fundamentals, typography, and color. 2) Master the main tool (for example Figma). 3) Redesign three real apps or websites and document the process. 4) Build a portfolio and share it in design communities. 5) Start with small freelance projects to gather portfolio pieces and confidence.'
    },
    {
      id: 'career_plan_common',
      keywords: [
        'چطور معلم شوم',
        'چطور بازاریاب شوم',
        'چطور کارآفرین شوم',
        'چطور بیزینس راه بندازم',
        'چطور استارتاپ بزنم',
        'how to become a teacher',
        'how to become a marketer',
        'how to start a business',
        'how to start a startup',
        'business plan'
      ],
      weak: [
        'معلم',
        'بازاریابی',
        'کارآفرینی',
        'کارآفرین',
        'استارتاپ',
        'بیزینس',
        'teacher',
        'marketing',
        'entrepreneur',
        'startup',
        'business'
      ],
      weakSafe: true,
      hints: ['شغل', 'کار', 'برنامه', 'شروع', 'plan', 'career', 'start'],
      fa: 'چند مسیر دیگر با برنامه‌ی عملی:\n\nتدریس و آموزش: ۱) روی یک درس یا مهارت مسلط شو. ۲) روش تدریس ساده‌سازی و تمرین‌محور را یاد بگیر. ۳) با تدریس خصوصی به چند دانش‌آموز شروع کن تا بازخورد واقعی بگیری. ۴) در پلتفرم‌های آموزش آنلاین یا کلاس‌های گروهی ادامه بده. ۵) با گذشت زمان، محتوای آموزشی خودت (ویدیو، جزوه، دوره) را بساز.\n\nبازاریابی دیجیتال: ۱) اصول بازاریابی، محتوا و شبکه‌های اجتماعی را یاد بگیر. ۲) یک یا دو کانال را عمیق یاد بگیر (مثلاً سئو یا تبلیغات). ۳) برای یک کسب‌وکار کوچک (خودت یا یک آشنا) کمپین واقعی اجرا کن و نتیجه را اندازه بگیر. ۴) نتایج را به نمونه‌کار تبدیل کن. ۵) به‌عنوان فریلنسر یا کارمند شروع کن و بعداً می‌توانی آژانس خودت را راه بیندازی.\n\nکارآفرینی و کسب‌وکار شخصی: ۱) به‌جای ایده‌ی بزرگ، یک مشکل کوچک و مشخص را انتخاب کن. ۲) قبل از ساختن، با ده تا بیست نفر از مشتری‌های احتمالی صحبت کن. ۳) یک نسخه‌ی کوچک و سریع (MVP) بساز و به چند نفر واقعی بفروش. ۴) بر اساس بازخورد تکرار کن و از اولین مشتری پول واقعی بگیر. ۵) رشد تدریجی بهتر از شتاب بی‌پشتوانه است: روی نقدینگی و رضایت مشتری تمرکز کن.',
      en: 'More paths with concrete plans:\n\nTeaching and tutoring: 1) Master one subject or skill. 2) Learn simple, practice-first teaching methods. 3) Start with a few private students to get real feedback. 4) Move on to online platforms or small classes. 5) Over time, build your own teaching content (videos, notes, courses).\n\nDigital marketing: 1) Learn the fundamentals of marketing, content, and social media. 2) Go deep on one or two channels (for example SEO or ads). 3) Run a real campaign for a small business (yours or a friend of the family) and measure the results. 4) Turn the results into portfolio pieces. 5) Start as a freelancer or employee; later you can build your own agency.\n\nEntrepreneurship: 1) Instead of a big idea, pick one small, concrete problem. 2) Before building, talk to ten to twenty potential customers. 3) Build a small, fast version (MVP) and sell it to a few real people. 4) Iterate on feedback and charge real money from the first customer. 5) Steady growth beats unsupported speed: focus on cash flow and customer satisfaction.'
    },
    {
      id: 'games_classic',
      keywords: [
        'بازی کلاسیک',
        'بازی های کلاسیک',
        'بازی قدیمی',
        'بازی های قدیمی',
        'پلی استیشن ۱',
        'پلی استیشن ۲',
        'پلی استیشن 1',
        'پلی استیشن 2',
        'ps1',
        'ps2',
        'psx',
        'classic games',
        'old games',
        'retro games',
        'playstation 1',
        'playstation 2',
        'ps one'
      ],
      weak: ['کنسول', 'ps1', 'ps2', 'console'],
      weakSafe: true,
      hints: [
        'بازی',
        'گیم',
        'کنسول',
        'پلی استیشن',
        'game',
        'console',
        'playstation'
      ],
      fa: 'بازی‌های کلاسیک که هنوز ارزش تجربه دارند:\n۱. «متال گیر سالید» (PS1، ۱۹۹۸): زادگاه مخفی‌کاری مدرن؛ سینما، داستان و گیم‌پلی با هم.\n۲. «فاینال فانتزی ۷» (PS1، ۱۹۹۷): نقش‌آفرینی که استاندارد ژانر را جابه‌جا کرد.\n۳. «سایه‌ی کلوسوس» (PS2، ۲۰۰۵): سفر حماسی و تنهای شوالیه‌ای که غول‌ها را شکست می‌دهد.\n۴. «رزیدنت ایول ۴» (PS2، ۲۰۰۵): ترس و اکشن را با هم به اوج رساند.\n۵. «گرن توریسمو ۴» (PS2، ۲۰۰۴): شبیه‌ساز مسابقه‌ای که استاندارد تعیین کرد.',
      en: 'Classic games still worth playing:\n1. Metal Gear Solid (PS1, 1998): the birthplace of modern stealth; cinema, story, and gameplay in one.\n2. Final Fantasy VII (PS1, 1997): the RPG that moved the whole genre forward.\n3. Shadow of the Colossus (PS2, 2005): a lonely, epic quest to bring down giants.\n4. Resident Evil 4 (PS2, 2005): the genre-defining pivot of survival horror into action.\n5. Gran Turismo 4 (PS2, 2004): a racing sim that set the standard.'
    },
    {
      id: 'games_modern',
      keywords: [
        'بازی جدید',
        'بازی ویدئویی',
        'بازی ویدیویی',
        'بازی های جدید',
        'بازی های روز',
        'پلی استیشن ۵',
        'پلی استیشن 5',
        'ایکس باکس',
        'نینتندو سوییچ',
        'ps5',
        'xbox',
        // Recommendation framings: «چندتا بازی بهم معرفی کن» and
        // «یه بازی آروم معرفی کن» used to fall to the unfamiliar-topic
        // pool because no keyword matched the colloquial request form.
        'چندتا بازی',
        'بازی بهم معرفی کن',
        'بازی به من معرفی کن',
        'بازی معرفی کن',
        'یه بازی معرفی',
        'یک بازی معرفی',
        'بازی پیشنهاد',
        'بازی آروم',
        'بازی آرام',
        'modern games',
        'new games',
        'playstation 5',
        'xbox series',
        'nintendo switch',
        'pc games',
        'best games',
        'top games',
        'top 10 games',
        'video game',
        'video games',
        'recommend me a game',
        'recommend a game',
        'recommend some games',
        'suggest some games',
        'suggest a game',
        'game recommendations',
        'relaxing game',
        'calm game'
      ],
      // 'بازی' (Persian) stays: it is the only path for bare FA requests
      // like «بازی خوب چیه». The English 'game'/'games' weak words were
      // removed on purpose: they made 'suggest some classic ps1 games'
      // score the modern shelf (via framing + hints) and outrank the
      // classic-games fact (the "video game recommendations by era"
      // test pins this). English bare requests still hit this fact
      // through the explicit 'recommend a game'/'suggest a game'
      // keywords.
      weak: ['کنسول', 'ps5', 'xbox', 'console', 'بازی'],
      weakSafe: true,
      hints: [
        'بازی',
        'کنسول',
        'پلی استیشن',
        'کامپیوتر',
        'گیم',
        'game',
        'console',
        'pc',
        'ps5',
        'معرفی',
        'پیشنهاد',
        'recommend',
        'suggest'
      ],
      fa: 'بازی‌های مدرن و ارزشمند (کنسول‌ها و رایانه):\n۱. «الدن رینگ» (۲۰۲۲): دنیای باز و چالش‌برانگیزی که استاندارد تازه‌ای برای اکشن نقش‌آفرینی ساخت.\n۲. «بولدور گیت ۳» (۲۰۲۳): نقش‌آفرینی عمیق با آزادی واقعی در تصمیم‌گیری و داستان.\n۳. «افسانه زلدا: اشک‌های پادشاهی» (۲۰۲۳): خلاقیت بی‌پایان در دنیایی که می‌توانی هر چیزش را امتحان کنی.\n۴. «هدز» (۲۰۲۰): روگ‌لایکی اسطوره‌ای یونانی با روایت و موسیقی فوق‌العاده.\n۵. «دسکو الیزیوم» (۲۰۱۹): بازی کارآگاهی بدون مبارزه؛ فقط گفتگو، فکر و انتخاب.',
      en: 'Modern games worth your time (consoles and PC):\n1. Elden Ring (2022): an open world that set a new standard for action RPGs.\n2. Baldur’s Gate 3 (2023): deep role-playing with real freedom in story and choices.\n3. The Legend of Zelda: Tears of the Kingdom (2023): endless creativity in a world you can experiment with.\n4. Hades (2020): a mythic Greek roguelike with brilliant storytelling and music.\n5. Disco Elysium (2019): a detective game with no combat, only dialogue, thought, and choices.'
    },
    {
      id: 'games_mobile',
      keywords: [
        'بازی موبایل',
        'بازی های موبایل',
        'بازی اندروید',
        'بازی گوشی',
        'بهترین بازی موبایل',
        'mobile games',
        'android games',
        'iphone games',
        'best mobile games'
      ],
      weak: [],
      weakSafe: true,
      hints: ['بازی', 'گیم', 'game', 'phone'],
      fa: 'بازی‌های موبایلی که ارزش نصب دارند:\n۱. «مانومنت ولی» (پازل معماری): دنیایی کوچک، آرام و پر از جادو؛ ایده‌آل برای چند دقیقه.\n۲. «استاردو ولی» (شبیه‌ساز زندگی): مزرعه‌داری، دوستی و آرامش در یک بازی بی‌پایان.\n۳. «جینشین ایمپکت» (اکشن نقش‌آفرینی): دنیای باز زیبا با آپدیت‌های منظم.\n۴. «آلتو ادویچر» (دونده‌ی بی‌پایان): هنر و موسیقی بی‌نظیر با حال‌وهوای آرام.\n۵. «بالاترو» (روگ‌لایک پوکر): یک دست بازی ورق که به ساعت‌ها وقت تبدیل می‌شود.',
      en: 'Mobile games worth installing:\n1. Monument Valley (architectural puzzle): a small, calm, magical world; perfect in short sessions.\n2. Stardew Valley (life sim): farming, friendship, and peace in an endless game.\n3. Genshin Impact (action RPG): a beautiful open world with regular updates.\n4. Alto Adventure (endless runner): stunning art and music with a calm mood.\n5. Balatro (poker roguelike): one hand of cards that turns into hours.'
    },
    {
      id: 'games_by_genre',
      keywords: [
        'بازی ترسناک',
        'بازی ورزشی',
        'بازی مسابقه',
        'بازی مسابقه ای',
        'بازی نقش آفرینی',
        'بازی نقش‌آفرینی',
        'بازی معمایی',
        'بازی استراتژی',
        'بازی تیراندازی',
        'بهترین بازی ترسناک',
        'horror game',
        'horror games',
        'racing game',
        'racing games',
        'sports game',
        'sports games',
        'rpg game',
        'rpg games',
        'puzzle game',
        'puzzle games',
        'strategy game',
        'strategy games',
        'shooter game',
        'shooter games'
      ],
      weak: [
        'ترسناک',
        'ورزشی',
        'مسابقه ای',
        'نقش آفرینی',
        'معمایی',
        'استراتژی',
        'تیراندازی',
        'horror',
        'racing',
        'sports',
        'rpg',
        'puzzle',
        'strategy',
        'shooter'
      ],
      weakSafe: true,
      hints: ['بازی', 'گیم', 'game', 'games'],
      fa: 'پیشنهاد بازی بر اساس ژانر:\nترسناک: «سایلنت هیل ۲» (PS2، ۲۰۰۱) و «اوت‌لاست» (۲۰۱۳) برای وحشت روانی و بقا.\nمسابقه‌ای: «نید فور اسپید: آندرگراند ۲» (۲۰۰۴) برای سرگرمی و «گرن توریسمو ۷» (۲۰۲۲) برای واقع‌گرایی.\nنقش‌آفرینی: «ویچر ۳» (۲۰۱۵) و «اسکایریم» (۲۰۱۱)؛ دو دنیای بی‌پایان.\nمعمایی: «پورتال ۲» (۲۰۱۱) و «تتریس افکت» (۲۰۱۸)؛ برای ذهن و آرامش.\nاستراتژی: «سیویلایزیشن ۶» (۲۰۱۶) و «استارکرفت ۲» (۲۰۱۰)؛ برنامه‌ریزی و فکر.\nتیراندازی: «هلف‌لایف ۲» (۲۰۰۴) برای تاریخ و «تیتان‌فال ۲» (۲۰۱۶) برای داستان اکشن.',
      en: 'Game picks by genre:\nHorror: Silent Hill 2 (PS2, 2001) and Outlast (2013) for psychological dread and survival.\nRacing: Need for Speed Underground 2 (2004) for fun and Gran Turismo 7 (2022) for realism.\nRPG: The Witcher 3 (2015) and Skyrim (2011), two endless worlds.\nPuzzle: Portal 2 (2011) and Tetris Effect (2018) for mind and calm.\nStrategy: Civilization 6 (2016) and StarCraft 2 (2010) for planning.\nShooter: Half-Life 2 (2004) for history and Titanfall 2 (2016) for a great action story.'
    },
    {
      id: 'diy_making',
      keywords: [
        'پرینتر سه بعدی',
        'پرینتم',
        'پرینتم مدام',
        'پرینت سه بعدی',
        'چاپ سه بعدی',
        'سه‌بعدی',
        'فیلامنت',
        'petg',
        'pla',
        '3d print',
        '3d printing',
        'filament',
        'woodworking',
        'live edge',
        'warping',
        'warp',
        // Persian woodworking/warping phrasings: «تاب برداشتن» (to
        // warp), «تاب می‌خوره», and «کج شدن» all describe the same
        // moisture-driven problem; the gate opens on «چطور», so the
        // keyword does the routing.
        'تاب برداشتن',
        'تاب برداره',
        'تاب میخوره',
        'تاب می‌خوره',
        'کج شدن میز',
        'میز چوبی تاب'
      ],
      weak: [
        'پرینتر',
        'پرینت',
        'چاپ',
        'ابزار',
        'میخکوب',
        'میز چوبی',
        'wood',
        'table',
        'print',
        'printer',
        'tool',
        'workshop'
      ],
      weakSafe: true,
      hints: [
        'سه بعدی',
        'سه‌بعدی',
        'نجاری',
        'کارگاه',
        'چوب',
        'جیگ',
        '3d',
        'wood',
        'woodshop',
        'jig',
        'warp'
      ],
      fa: 'برای ابزارهای کمکی کارگاه، PETG انتخاب بهتری از PLA است: در برابر حرارت و ضربه مقاوم‌تر است و در فضای باز تاب نمی‌آورد، در حالی که PLA برای نمونه‌های اولیه و قطعات تزئینی عالی است. فیلامنت را خشک نگه دار (رطوبت باعث حباب و ضعف چسبندگی می‌شود) و برای میزهای چوبی لبه‌ی طبیعی، قبل از ساخت چوب را خشک و پایدار کن؛ میز را از نزدیک منبع گرما و نور مستقیم دور نگه دار و دو طرفش را روغن بزن تا رطوبت متعادل بماند. با ابزار ایمنی (عینک، دستکش) و تهویه کار کن؛ اشتباه در ساخت بخشی از یادگیری است.',
      en: 'For workshop helper prints, PETG is a better choice than PLA: it resists heat and impact better and holds up outdoors, while PLA is perfect for prototypes and decorative parts. Keep your filament dry (moisture causes bubbles and weak layer adhesion), and for live-edge wooden tables, dry and stabilize the wood before building; keep the table away from heat sources and direct sun, and oil both sides so moisture stays balanced. Work with safety gear (glasses, gloves) and ventilation; mistakes in making are part of learning.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
