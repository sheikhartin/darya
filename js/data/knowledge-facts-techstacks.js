/**
 * Darya - curated factual entries (tech stacks across eras).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'web_stack_history',
      keywords: [
        'تاریخچه استک وب',
        'تکامل توسعه وب',
        'تک استک در طول زمان',
        'history of web stacks',
        'evolution of web development',
        'web stack history'
      ],
      weak: ['تک استک', 'استک وب', 'web stack', 'tech stack'],
      weakSafe: true,
      hints: ['تاریخچه', 'تکامل', 'history', 'evolution', 'چطور'],
      fa: 'توسعه‌ی وب در چند نسل پیش رفت: اول صفحات استاتیک HTML و اسکریپت‌های CGI، بعد دوران LAMP (لینوکس، آپاچی، مای‌اس‌کیوال، پی‌اچ‌پی) که سایت‌های داینامیک را ارزان کرد، سپس اپ‌های تک‌صفحه‌ای جاوااسکریپتی (SPA) و استک‌های MEAN/MERN، و بعد از آن جَم‌استک و معماری بدون سرور و لبه. هر نسل یک مشکل نسل قبل (سرعت، مقیاس، نگهداری) را حل کرد و پیچیدگی جدیدی اضافه کرد.',
      en: 'Web development moved through several generations: first static HTML pages and CGI scripts, then the LAMP era (Linux, Apache, MySQL, PHP) that made dynamic sites cheap, then JavaScript single-page apps (SPAs) and the MEAN/MERN stacks, and after that Jamstack and serverless or edge architecture. Each generation solved the previous one’s problem (speed, scale, maintenance) while adding new complexity.'
    },
    {
      id: 'lamp_stack',
      keywords: ['استک لمپ', 'لمپ چیه', 'lamp stack', 'what is lamp stack'],
      weak: ['لمپ', 'lamp', 'آپاچی', 'apache'],
      weakSafe: true,
      hints: ['استک', 'چیه', 'چیست', 'stack', 'what', 'php'],
      fa: 'لمپ یعنی لینوکس (سیستم‌عامل) + آپاچی (وب سرور) + مای‌اس‌کیوال (دیتابیس) + پی‌اچ‌پی (زبان). در دهه‌ی ۲۰۰۰ استاندارد ساخت سایت‌های داینامیک بود چون همه‌ی اجزایش رایگان، ساده و ارزان برای میزبانی بود و هنوز پایه‌ی وردپرس و بخش بزرگی از وب است. نقطه ضعفش این بود که همه‌چیز روی یک سرور بود و مقیاس‌پذیری و تعامل بلادرنگ سخت می‌شد.',
      en: 'LAMP means Linux (operating system) plus Apache (web server), MySQL (database), and PHP (language). In the 2000s it was the standard for dynamic sites because every part was free, simple, and cheap to host, and it still underpins WordPress and much of the web. Its weakness was that everything lived on one server, making scaling and real-time interactivity harder.'
    },
    {
      id: 'mean_mern_stack',
      keywords: [
        'استک مرن',
        'استک مین',
        'مرن یا مین',
        'mern stack',
        'mean stack',
        'what is mern'
      ],
      weak: ['مرن', 'مین', 'mern', 'mean'],
      weakSafe: true,
      hints: ['استک', 'چیه', 'چیست', 'stack', 'what', 'javascript'],
      fa: 'مین و مرن دو استک تمام‌جاوااسکریپتی‌اند: مین یعنی مونگو دی‌بی + اکسپرس + انگولار + نود؛ مرن همان است ولی ری‌اکت به‌جای انگولار. ایده این بود که با یک زبان (جاوااسکریپت) هم سمت کاربر و هم سمت سرور را بسازی. این استک‌ها اپ‌های تک‌صفحه‌ای و تعاملی را آسان کردند و در دهه‌ی ۲۰۱۰ بین استارتاپ‌ها خیلی محبوب شدند.',
      en: 'MEAN and MERN are all-JavaScript stacks: MEAN means MongoDB, Express, Angular, and Node; MERN is the same but with React instead of Angular. The idea was to build both the client and server with one language, JavaScript. These stacks made interactive single-page apps easier and were very popular with startups in the 2010s.'
    },
    {
      id: 'jamstack',
      keywords: ['جم استک', 'جَم استک', 'jamstack', 'what is jamstack'],
      weak: ['جم استک', 'جَم استک', 'jamstack'],
      weakSafe: true,
      hints: ['استک', 'چیه', 'چیست', 'stack', 'what', 'static'],
      fa: 'جَم‌استک یعنی جاوااسکریپت + API + مارک‌آپ: سایت از قبل ساخته و روی CDN قرار می‌گیرد و بخش‌های داینامیک از طریق API صدا زده می‌شود. نتیجه، سرعت بالا، هزینه‌ی کم و سطح حمله‌ی کوچک‌تر است. از ۲۰۱۶ رایج شد، اما به‌مرور چارچوب‌های هیبریدی (نکست، نواست، استرو) رندر سمت سرور را هم اضافه کردند و امروز این ایده‌ها در «معماری هدلس و کامپوزبل» جذب شده‌اند.',
      en: 'Jamstack means JavaScript, APIs, and Markup: the site is prebuilt and served from a CDN, and dynamic parts are called through APIs. The result is high speed, low cost, and a smaller attack surface. It became common after 2016, but hybrid frameworks (Next, Nuxt, Astro) later added server rendering, and today these ideas live inside "headless and composable" architecture.'
    },
    {
      id: 'serverless',
      keywords: ['بدون سرور', 'سرورلس', 'serverless', 'what is serverless'],
      weak: ['سرورلس', 'بدون سرور', 'serverless'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'ابر', 'what', 'cloud', 'function'],
      fa: 'سرورلس یعنی تو فقط تابع را می‌نویسی و زیرساخت (سرور، مقیاس‌دهی) را ابر خودکار مدیریت می‌کند؛ هزینه بر اساس اجرای واقعی محاسبه می‌شود، نه سرور همیشه‌روشن. برای کارهای رویدادی و APIهای سبک عالی است، ولی برای کار طولانی و نیاز به کنترل دقیق، سرور معمولی یا کانتینر بهتر است. سرویس‌هایی مثل AWS Lambda و Cloudflare Workers نمونه‌های معروف‌اند.',
      en: 'Serverless means you write only the function while the cloud manages the servers and scaling automatically; you pay for actual execution, not an always-on server. It is great for event-driven work and lightweight APIs, but for long-running jobs or precise control, a regular server or container is better. AWS Lambda and Cloudflare Workers are well-known examples.'
    },
    {
      id: 'microservices_monolith',
      keywords: [
        'میکروسرویس یا مونولیت',
        'میکروسرویس چیه',
        'مونولیت چیه',
        'microservices vs monolith',
        'what are microservices',
        'what is a monolith'
      ],
      weak: ['میکروسرویس', 'مونولیت', 'microservices', 'monolith'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'فرق', 'what', 'architecture', 'vs'],
      fa: 'مونولیت یعنی کل برنامه یک واحد بزرگ است که با هم توسعه و استقرار می‌یابد؛ ساده و برای شروع عالی است، اما با بزرگ‌شدن تیم نگهداری‌اش سخت می‌شود. میکروسرویس برنامه را به سرویس‌های کوچک مستقل تقسیم می‌کند که جدا استقرار و مقیاس می‌شوند، ولی پیچیدگی شبکه و هماهنگی زیاد می‌آورد. قاعده‌ی عملی: با مونولیت شروع کن و فقط وقتی واقعاً لازم شد خردش کن.',
      en: 'A monolith means the whole application is one large unit, developed and deployed together; it is simple and great to start with, but harder to maintain as the team grows. Microservices split the app into small independent services that deploy and scale separately, but they add network and coordination complexity. The practical rule: start with a monolith and split it only when you genuinely need to.'
    },
    {
      id: 'mobile_app_stacks',
      keywords: [
        'استک اپ موبایل',
        'ساخت اپ موبایل',
        'نیتیو یا هیبریدی',
        'mobile app stack',
        'how mobile apps are built',
        'how are mobile apps built',
        'how to build a mobile app',
        'native hybrid webview'
      ],
      weak: ['استک موبایل', 'هیبریدی', 'mobile stack', 'hybrid app'],
      weakSafe: true,
      hints: ['اپ', 'اندروید', 'ios', 'app', 'android', 'چطور'],
      fa: 'اپ موبایل به سه شکل اصلی ساخته می‌شود: نیتیو (کاتلین برای اندروید، سویفت برای iOS؛ بهترین کارایی و دسترسی کامل)، کراس‌پلتفرم (فلاتر با دارت یا ری‌اکت نیتیو با جاوااسکریپت؛ یک کد برای دو پلتفرم)، و هیبریدی یا WebView (کوردوا/کاپاسیتور؛ صفحه‌ی وب داخل پوسته‌ی اپ؛ ارزان‌ترین). انتخاب بستگی به بودجه، تیم و نیاز به کارایی دارد.',
      en: 'Mobile apps are built three main ways: native (Kotlin for Android, Swift for iOS; best performance and full access), cross-platform (Flutter with Dart or React Native with JavaScript; one codebase for both platforms), and hybrid or WebView (Cordova/Capacitor; a web page inside an app shell; the cheapest). The choice depends on budget, team, and how much performance you need.'
    },
    {
      id: 'flutter_reactnative',
      keywords: [
        'فلاتر یا ری اکت نیتیو',
        'فرق فلاتر و ری اکت نیتیو',
        'فلاتر چیه',
        'ری اکت نیتیو چیه',
        'flutter vs react native',
        'flutter or react native',
        'react native or flutter',
        'difference between flutter and react native',
        'what is flutter',
        'what is react native'
      ],
      weak: [
        'فلاتر',
        'ری اکت نیتیو',
        'ری‌اکت نیتیو',
        'flutter',
        'react native'
      ],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'فرق', 'کراس', 'what', 'vs', 'cross'],
      fa: 'فلاتر و ری‌اکت نیتیو دو راه اصلی ساخت اپ کراس‌پلتفرم‌اند. فلاتر (گوگل) با دارت همه‌چیز را خودش رسم می‌کند، پس ظاهر در همه‌جا یکدست است؛ ری‌اکت نیتیو (متا) با جاوااسکریپت کار می‌کند و از اجزای نیتیو استفاده می‌کند، پس برای تیم‌هایی که وب بلدند راحت‌تر است. هر دو بالغ و پرکاربردند و انتخاب بیشتر به زبان و سلیقه‌ی تیم برمی‌گردد.',
      en: 'Flutter and React Native are the two main ways to build cross-platform apps. Flutter (Google) draws everything itself with Dart, so the look is consistent everywhere; React Native (Meta) uses JavaScript and native components, so it is easier for teams who already know the web. Both are mature and widely used, and the choice mostly comes down to language and team taste.'
    },
    {
      id: 'desktop_apps',
      keywords: [
        'اپ دسکتاپ',
        'الکترون',
        'توری',
        'desktop app frameworks',
        'electron',
        'tauri'
      ],
      weak: ['الکترون', 'توری', 'دسکتاپ', 'electron', 'tauri'],
      weakSafe: true,
      hints: ['اپ', 'چیه', 'فریمورک', 'app', 'what', 'framework', 'desktop'],
      fa: 'برای اپ دسکتاپ چند مسیر هست: نیتیو (ویندوز با C#/.NET یا C++، مک با سوئیفت، لینوکس با Qt/GTK؛ سبک و سریع)، وب‌محور (الکترون با جاوااسکریپت که کرومیوم را همراه دارد و سنگین‌تر است ولی توسعه سریع دارد)، و توری که از مرورگر سیستم استفاده می‌کند و حجم و مصرف حافظه‌اش خیلی کمتر است. انتخاب بین سرعت توسعه و سبکی اپ است.',
      en: 'Desktop apps have a few paths: native (Windows with C#/.NET or C++, macOS with Swift, Linux with Qt/GTK; light and fast), web-based (Electron with JavaScript, which bundles Chromium and is heavier but fast to develop), and Tauri, which uses the system browser and has much smaller size and memory use. It is a trade between development speed and app lightness.'
    },
    {
      id: 'saas_stack',
      keywords: [
        'استک ساس',
        'ساخت ساس',
        'معماری sass',
        'saas stack',
        'how to build a saas',
        'saas architecture'
      ],
      weak: ['ساس', 'saas', 'اشتراکی'],
      weakSafe: true,
      hints: ['استک', 'چیه', 'چطور', 'stack', 'what', 'how', 'subscription'],
      fa: 'SaaS یعنی نرم‌افزار به‌صورت اشتراکی روی وب. یک استک معمول ساس: فرانت‌اند (ری‌اکت/نکست)، بک‌اند (نود، پایتون یا گو)، دیتابیس (پستگرس)، احراز هویت، درگاه پرداخت اشتراکی (استرایپ) و زیرساخت ابری. مهم‌تر از انتخاب ابزار، مدل کسب‌وکار است: قیمت‌گذاری، حفظ مشتری و کاهش ریزش (churn). یک MVP کوچک را سریع بساز و با مشتری واقعی تست کن.',
      en: 'SaaS means software delivered on the web as a subscription. A typical SaaS stack: frontend (React/Next), backend (Node, Python, or Go), database (Postgres), authentication, a subscription payment gateway (Stripe), and cloud infrastructure. More important than the tools is the business model: pricing, retention, and reducing churn. Build a small MVP fast and test it with real customers.'
    },
    {
      id: 'backend_frameworks',
      keywords: [
        'فریمورک بک اند',
        'جنگو یا ریلز',
        'اسپرینگ یا اکسپرس',
        'backend frameworks',
        'backend framework',
        'which backend framework',
        'best backend framework',
        'django vs rails',
        'express vs spring'
      ],
      weak: [
        'جنگو',
        'ریلز',
        'اسپرینگ',
        'اکسپرس',
        'django',
        'rails',
        'spring',
        'express'
      ],
      weakSafe: true,
      hints: [
        'فریمورک',
        'بک اند',
        'کدوم',
        'framework',
        'backend',
        'vs',
        'better'
      ],
      fa: 'فریم‌ورک‌های بک‌اند محبوب: جنگو (پایتون، کامل و سریع برای توسعه)، ریلز (روبی، مناسب استارتاپ)، اسپرینگ بوت (جاوا، استاندارد سازمانی)، اکسپرس/نست (نود و جاوااسکریپت)، لاراول (پی‌اچ‌پی) و FastAPI (پایتون، سریع و مدرن برای API). «بهترین» وجود ندارد؛ انتخاب معمولاً دنبال زبان و اکوسیستمی است که تیمت بلد است.',
      en: 'Popular backend frameworks: Django (Python, complete and fast to develop), Rails (Ruby, startup-friendly), Spring Boot (Java, the enterprise standard), Express/Nest (Node and JavaScript), Laravel (PHP), and FastAPI (Python, fast and modern for APIs). There is no best; the choice usually follows the language and ecosystem your team already knows.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
