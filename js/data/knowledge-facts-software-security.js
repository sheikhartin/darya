/**
 * Darya - software engineering and defensive cybersecurity knowledge.
 *
 * The security entries teach work on systems the user owns or has explicit
 * written permission to test. They do not provide intrusion, persistence,
 * credential theft, destructive payload, or evasion instructions.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];

  const fact = (id, keywords, weak, fa, en, hints = []) => ({
    id,
    keywords,
    weak,
    weakSafe: true,
    hints,
    fa,
    en
  });

  global.DaryaFactChunks.push([
    fact(
      'software_architecture',
      [
        'how do i design software architecture',
        'software architecture for beginners',
        'monolith vs microservices architecture',
        'چطور معماری نرم افزار طراحی کنم',
        'معماری نرم افزار برای مبتدی',
        'مونولیت یا میکروسرویس'
      ],
      [
        'software architecture',
        'system design',
        'monolith',
        'microservices',
        'معماری نرم افزار',
        'طراحی سیستم',
        'میکروسرویس'
      ],
      'معماری نرم‌افزار یعنی مشخص‌کردن مرز مسئولیت‌ها، جریان داده و تصمیم‌های پرهزینه برای تغییر. از نیازهای واقعی شروع کن: کاربر، بار، امنیت، دسترس‌پذیری و تیم. برای بیشتر محصولات تازه، یک مونولیت ماژولار با رابط‌های روشن ساده‌تر از میکروسرویس است. نمودار کوتاه، قرارداد API، مدل داده، حالت‌های خطا و دلیل هر تصمیم را ثبت کن. فقط وقتی بخش‌ها واقعاً مقیاس، مالک یا چرخه‌ی انتشار جدا دارند آن‌ها را جدا کن؛ معماری خوب پیچیدگی را جابه‌جا نمی‌کند، کم می‌کند.',
      'Software architecture defines responsibility boundaries, data flow, and decisions that are expensive to reverse. Start from real constraints: users, load, security, availability, and team size. For most new products, a modular monolith with clear interfaces is safer than premature microservices. Record a small diagram, API contracts, the data model, failure modes, and the reason for each decision. Split services only when parts genuinely need separate scale, ownership, or release cycles. Good architecture reduces complexity rather than moving it around.',
      ['design', 'scale', 'api', 'طراحی', 'مقیاس', 'تیم']
    ),
    fact(
      'database_choice',
      [
        'sql vs nosql database',
        'how do i choose a database',
        'postgresql or mongodb',
        'کدام دیتابیس را انتخاب کنم',
        'sql یا nosql',
        'پستگرس یا مونگو'
      ],
      [
        'database choice',
        'sql database',
        'nosql database',
        'postgresql',
        'mongodb',
        'انتخاب دیتابیس',
        'پایگاه داده'
      ],
      'دیتابیس را از روی شکل داده و تضمین لازم انتخاب کن، نه مد روز. اگر رابطه، تراکنش، گزارش و سازگاری مهم است، PostgreSQL یا یک دیتابیس رابطه‌ای انتخاب پیش‌فرض خوبی است. پایگاه سندی وقتی مفید است که ساختار رکوردها متغیر و الگوی دسترسی روشن باشد. پیش از انتخاب، چند پرس‌وجوی اصلی، حجم و رشد داده، نیاز پشتیبان‌گیری، مهاجرت و بازیابی را روی کاغذ بنویس. NoSQL به معنای بدون ساختار یا بدون طراحی نیست و اضافه‌کردن چند دیتابیس هزینه‌ی عملیاتی واقعی دارد.',
      'Choose a database from the shape of the data and the guarantees you need, not fashion. If relationships, transactions, reporting, and consistency matter, PostgreSQL or another relational database is a strong default. A document store helps when records vary and access patterns are well understood. Before choosing, write the core queries, expected growth, backup, migration, and recovery needs. NoSQL does not mean no structure or no design, and every additional database adds real operational cost.',
      ['data', 'transaction', 'query', 'داده', 'تراکنش', 'پرس و جو']
    ),
    fact(
      'web_networking_basics',
      [
        'how does a web request work',
        'dns tcp tls http explained',
        'networking basics for developers',
        'درخواست وب چطور کار میکند',
        'dns و tcp و tls را توضیح بده',
        'شبکه برای برنامه نویس'
      ],
      [
        'web request',
        'dns tcp',
        'tls http',
        'networking basics',
        'درخواست وب',
        'مبانی شبکه'
      ],
      'وقتی آدرسی را باز می‌کنی، معمولاً DNS نام دامنه را به نشانی شبکه تبدیل می‌کند، اتصال برقرار می‌شود، TLS هویت سرور و رمزنگاری مسیر را فراهم می‌کند و HTTP درخواست و پاسخ را جابه‌جا می‌کند. مرورگر سپس HTML، CSS، جاوااسکریپت و دارایی‌ها را پردازش می‌کند. برای عیب‌یابی به ترتیب نگاه کن: نام و DNS، اتصال و گواهی، status code و header، زمان پاسخ، payload و در آخر رفتار رابط. این ترتیب جلوی حدس‌های پراکنده را می‌گیرد.',
      'When you open an address, DNS usually maps the domain to a network address, a connection is established, TLS authenticates the server and encrypts transport, and HTTP carries the request and response. The browser then processes HTML, CSS, JavaScript, and assets. Debug in layers: name and DNS, connection and certificate, status code and headers, timing, payload, then interface behavior. This order prevents random guessing.',
      ['http', 'dns', 'tls', 'browser', 'مرورگر', 'شبکه']
    ),
    fact(
      'async_concurrency',
      [
        'async vs parallel programming',
        'explain race conditions',
        'how do i avoid race conditions',
        'برنامه نویسی همزمان چیست',
        'race condition یعنی چی',
        'چطور خطای همزمانی را پیدا کنم'
      ],
      [
        'async programming',
        'concurrency',
        'race condition',
        'همزمانی',
        'برنامه نویسی ناهمگام'
      ],
      'ناهمگام‌بودن یعنی هنگام انتظار برای ورودی و خروجی کار دیگری پیش برود؛ موازی‌بودن یعنی چند کار واقعاً هم‌زمان اجرا شوند. race condition وقتی رخ می‌دهد که نتیجه به ترتیب زمان‌بندی وابسته باشد. حالت مشترک را کم کن، مالکیت داده را روشن نگه دار، عملیات حساس را اتمیک یا صف‌بندی کن و timeout، لغو و تکرار درخواست را طراحی کن. برای بازتولید، زمان‌بندی را کنترل کن و تستی بنویس که چند اجرای هم‌پوشان و پاسخ خارج از ترتیب را بررسی کند.',
      'Asynchronous work lets other tasks progress while one waits for input or output; parallel work actually runs tasks at the same time. A race condition makes the result depend on timing. Minimize shared mutable state, make ownership clear, serialize or make critical operations atomic, and design timeouts, cancellation, and retries. To reproduce a race, control timing and add a test with overlapping operations and out-of-order responses.',
      ['async', 'parallel', 'thread', 'race', 'ترد', 'ناهمگام']
    ),
    fact(
      'performance_profiling',
      [
        'how do i make my app faster',
        'software performance profiling',
        'website performance checklist',
        'چطور برنامه را سریع تر کنم',
        'پروفایل عملکرد نرم افزار',
        'چک لیست سرعت سایت'
      ],
      [
        'performance profiling',
        'app performance',
        'website speed',
        'پروفایلینگ',
        'سرعت برنامه',
        'عملکرد نرم افزار'
      ],
      'بهینه‌سازی را با اندازه‌گیری شروع کن، نه بازنویسی. یک سناریوی واقعی و بودجه‌ی عملکرد تعریف کن، سپس زمان CPU، حافظه، شبکه، پرس‌وجوی دیتابیس و رندر را پروفایل کن. بزرگ‌ترین گلوگاه را اصلاح و دوباره همان سناریو را اندازه بگیر. cache فقط وقتی مفید است که سیاست تازگی و حذفش روشن باشد. برای وب، حجم و تعداد درخواست، تصویر، فونت، کار اصلی thread و معیارهای تجربه‌ی کاربر را جدا ببین. بهبود بدون سنجه ممکن است فقط پیچیدگی اضافه کند.',
      'Optimize from measurements, not rewrites. Define a real user scenario and a performance budget, then profile CPU time, memory, network, database queries, and rendering. Fix the largest bottleneck and measure the same scenario again. A cache helps only when freshness and invalidation are clear. On the web, inspect payload size, request count, images, fonts, main-thread work, and user-experience metrics separately. An unmeasured improvement may only add complexity.',
      ['profile', 'slow', 'latency', 'cache', 'کند', 'سرعت']
    ),
    fact(
      'observability_debugging',
      [
        'what should i log in production',
        'logs metrics traces explained',
        'how do i debug a production incident',
        'در پروداکشن چه چیزهایی لاگ کنم',
        'لاگ متریک و trace چیست',
        'خطای محیط واقعی را چطور بررسی کنم'
      ],
      [
        'observability',
        'production logs',
        'metrics and traces',
        'مشاهده پذیری',
        'لاگ پروداکشن',
        'متریک و تریس'
      ],
      'مشاهده‌پذیری سه پرسش را پاسخ می‌دهد: چه چیزی خراب است، از چه زمانی و در کدام مسیر. log باید رویداد ساختاریافته و شناسه‌ی هم‌بستگی داشته باشد، metric روند و هشدار را نشان دهد و trace مسیر درخواست بین بخش‌ها را وصل کند. رمز، token، متن خصوصی و داده‌ی حساس را ثبت نکن. در حادثه اول اثر را محدود کن، خط زمانی بساز، تغییر اخیر را بررسی کن، شواهد را نگه دار و فقط بعد از بازیابی علت ریشه‌ای و اقدام پیشگیرانه را بنویس.',
      'Observability answers what is failing, since when, and along which path. Logs should be structured events with correlation identifiers, metrics should expose trends and alerts, and traces should connect a request across components. Never log passwords, tokens, private text, or unnecessary sensitive data. During an incident, contain impact first, build a timeline, inspect recent changes, preserve evidence, restore service, then document the root cause and preventive action.',
      ['logs', 'metrics', 'traces', 'incident', 'لاگ', 'حادثه']
    ),
    fact(
      'refactoring_technical_debt',
      [
        'when should i refactor code',
        'how to manage technical debt',
        'rewrite vs refactor',
        'کی کد را ریفکتور کنم',
        'بدهی فنی را چطور مدیریت کنم',
        'بازنویسی یا ریفکتور'
      ],
      [
        'technical debt',
        'refactoring',
        'rewrite code',
        'بدهی فنی',
        'ریفکتور',
        'بازنویسی کد'
      ],
      'ریفکتور باید رفتار را حفظ کند و ساختار را بهتر کند. اول با تست یا نمونه‌ی قابل‌بازتولید رفتار فعلی را قفل کن، بعد تغییر کوچک انجام بده و diff را بازبینی کن. بدهی فنی را با اثرش ثبت کن: کندی توسعه، خطا، ریسک امنیت یا هزینه‌ی عملیات. بازنویسی کامل وقتی منطقی است که مرز کوچک، معیار موفقیت و مسیر مهاجرت تدریجی داشته باشد؛ «کد قدیمی زشت است» به‌تنهایی دلیل کافی برای دورریختن دانش انباشته نیست.',
      'Refactoring preserves behavior while improving structure. First pin current behavior with tests or a reproducible example, then make small changes and review the diff. Track technical debt by its consequence: slower delivery, defects, security risk, or operational cost. A rewrite is defensible only with a bounded scope, success measures, and an incremental migration path. Old code looking unpleasant is not enough reason to discard accumulated knowledge.',
      ['legacy', 'maintain', 'test', 'کد قدیمی', 'نگهداری', 'تست']
    ),
    fact(
      'accessibility_development',
      [
        'web accessibility checklist for developers',
        'how do i make an app accessible',
        'wcag basics',
        'چک لیست دسترس پذیری وب',
        'چطور اپ را دسترس پذیر کنم',
        'مبانی wcag'
      ],
      [
        'web accessibility',
        'accessible app',
        'wcag',
        'دسترس پذیری',
        'دسترسی پذیری'
      ],
      'دسترس‌پذیری یک مرحله‌ی آخر نیست. از HTML معنایی، label روشن، ترتیب heading، کار کامل با صفحه‌کلید، focus قابل‌دیدن، متن جایگزین مفید، کنتراست کافی و خطای قابل‌فهم شروع کن. جهت RTL، بزرگ‌نمایی متن، حالت کاهش حرکت و screen reader را نیز امتحان کن. ARIA جای عنصر درست HTML را نمی‌گیرد. تست خودکار خطاهای ساده را می‌گیرد، اما مسیر واقعی با صفحه‌کلید و فناوری کمکی باید دستی هم بررسی شود.',
      'Accessibility is not a final polish step. Start with semantic HTML, clear labels, ordered headings, complete keyboard operation, visible focus, useful alternative text, sufficient contrast, and understandable errors. Test RTL, text zoom, reduced motion, and a screen reader as well. ARIA does not replace the correct HTML element. Automation catches simple failures, but real keyboard and assistive-technology journeys still need manual review.',
      ['keyboard', 'screen reader', 'contrast', 'کیبورد', 'کنتراست']
    ),
    fact(
      'offline_first_pwa',
      [
        'how do i build an offline first pwa',
        'service worker caching strategy',
        'offline web app architecture',
        'چطور pwa آفلاین بسازم',
        'استراتژی کش service worker',
        'معماری برنامه آفلاین'
      ],
      [
        'offline first',
        'service worker cache',
        'offline pwa',
        'آفلاین فرست',
        'سرویس ورکر',
        'کش آفلاین'
      ],
      'در PWA آفلاین، shell ضروری را هنگام نصب service worker ذخیره کن و نصب را فقط پس از کامل‌شدن cache موفق بدان. برای فایل‌های نسخه‌دار cache-first مناسب است؛ برای داده‌ی زنده باید سیاست تازگی و fallback روشن باشد. همه‌ی دارایی‌های لازم، فونت و صفحه‌ی شروع را واقعاً در حالت قطع شبکه آزمایش کن. به‌روزرسانی باید atomic باشد تا cache نیمه‌کاره نسخه‌ی سالم قبلی را پاک نکند. رابط هم باید فرق «آفلاین ولی قابل استفاده» و «نیازمند داده‌ی روز» را صادقانه بگوید.',
      'For an offline PWA, cache the essential shell during service-worker installation and treat installation as successful only after the cache is complete. Cache-first fits versioned assets; live data needs an explicit freshness and fallback policy. Test every required asset, font, and launch path with the network actually disabled. Updates should be atomic so a partial cache never removes the last known-good version. The interface must also distinguish usable offline features from requests that require current data.',
      ['pwa', 'service worker', 'cache', 'offline', 'کش', 'آفلاین']
    ),
    fact(
      'open_source_contribution',
      [
        'how do i contribute to open source',
        'first open source pull request',
        'open source contribution workflow',
        'چطور در متن باز مشارکت کنم',
        'اولین pull request متن باز',
        'مشارکت در پروژه اوپن سورس'
      ],
      [
        'open source contribution',
        'first pull request',
        'مشارکت متن باز',
        'اوپن سورس'
      ],
      'برای اولین مشارکت، راهنمای CONTRIBUTING و issueهای کوچک را بخوان، پروژه را محلی اجرا کن و پیش از کدنویسی محدوده را با نگهدارنده هماهنگ کن. یک مشکل مشخص را با commit متمرکز، تست و توضیح «چه چیزی و چرا» حل کن. در pull request مراحل بازتولید، اثر تغییر و محدودیت را بنویس و بازخورد را بحث شخصی تلقی نکن. اطلاعات خصوصی، secret یا فایل تولیدشده را commit نکن و مجوز پروژه را رعایت کن.',
      'For a first open-source contribution, read CONTRIBUTING, find a bounded issue, run the project locally, and confirm scope with maintainers before coding. Solve one concrete problem with a focused commit, tests, and a clear explanation of what changed and why. In the pull request, include reproduction steps, impact, and limitations, and treat review as collaboration rather than a personal verdict. Never commit private data, secrets, or generated clutter, and respect the project license.',
      ['github', 'pull request', 'issue', 'گیت هاب', 'پول ریکوئست']
    ),
    fact(
      'cybersecurity_career',
      [
        'how do i start a cybersecurity career',
        'cybersecurity jobs explained',
        'is cybersecurity a good career',
        'چطور وارد شغل امنیت سایبری شوم',
        'شغل های امنیت سایبری چیست',
        'امنیت سایبری شغل خوبیه'
      ],
      [
        'cybersecurity career',
        'security analyst career',
        'شغل امنیت سایبری',
        'کارشناس امنیت'
      ],
      'امنیت سایبری یک شغل واحد نیست: عملیات دفاعی و SOC، پاسخ به حادثه، امنیت برنامه، مهندسی ابر، مدیریت ریسک، حریم خصوصی، جرم‌یابی دیجیتال و آزمون نفوذ مجاز نقش‌های متفاوت‌اند. ابتدا شبکه، Linux، وب، اسکریپت‌نویسی و ثبت رویداد را یاد بگیر؛ سپس یک مسیر انتخاب کن و در آزمایشگاه قانونی نمونه‌کار بساز. گزارش‌نویسی، ارتباط و قضاوت ریسک به اندازه‌ی ابزار مهم‌اند. عنوان «هکر» به‌تنهایی رزومه نیست؛ کارفرما دنبال شواهد دفاع، تحلیل و رفتار مسئولانه است.',
      'Cybersecurity is not one job. Defensive operations and SOC work, incident response, application security, cloud engineering, risk and governance, privacy, digital forensics, and authorized penetration testing require different skills. Start with networking, Linux, the web, scripting, and logs, then choose one path and build evidence in legal labs. Reporting, communication, and risk judgment matter as much as tools. The label hacker is not a portfolio; employers need proof of defense, analysis, and responsible conduct.',
      ['soc', 'incident response', 'career', 'linux', 'شغل', 'لینوکس']
    ),
    fact(
      'ethical_hacking_path',
      [
        'how do i learn ethical hacking legally',
        'ethical hacking roadmap for beginners',
        'safe hacking practice labs',
        'how can i practice hacking a website legally in a lab',
        'how to hack a website legally in a lab',
        'چطور هک اخلاقی را قانونی یاد بگیرم',
        'چطور هک سایت را قانونی در آزمایشگاه تمرین کنم',
        'نقشه راه هک اخلاقی',
        'آزمایشگاه امن هک'
      ],
      [
        'ethical hacking',
        'legal hacking',
        'penetration testing roadmap',
        'هک اخلاقی',
        'هک قانونی',
        'تست نفوذ مجاز'
      ],
      'هک اخلاقی فقط با مجوز روشن، محدوده‌ی مکتوب و قانون محل معنا دارد. مسیر امن: شبکه و HTTP، Linux، یک زبان اسکریپت، احراز هویت و مجوز، سپس آسیب‌پذیری‌های رایج و گزارش‌نویسی. تمرین را فقط روی CTF، ماشین محلی، آزمایشگاه آموزشی یا سامانه‌ای انجام بده که صریحاً اجازه داده است. پیش از هر آزمون، دامنه، زمان، داده‌ی مجاز، توقف اضطراری و روش گزارش را مشخص کن. دیدن یک سامانه در اینترنت یا مالک‌بودن یک حساب، اجازه‌ی آزمودن کل آن سامانه نیست.',
      'Ethical hacking exists only with clear authorization, written scope, and compliance with local law. A safe path is networking and HTTP, Linux, one scripting language, authentication and authorization, common vulnerability classes, then reporting. Practice only in CTFs, local machines, educational labs, or systems that explicitly permit testing. Before any assessment, define targets, time, allowed data, emergency stop, and reporting channel. Finding a system online, or owning one account on it, is not permission to test the whole system.',
      ['permission', 'lab', 'ctf', 'scope', 'مجوز', 'آزمایشگاه', 'محدوده']
    ),
    fact(
      'security_testing_authorization',
      [
        'can i test a website for vulnerabilities',
        'what permission do i need for penetration testing',
        'rules of engagement for a security test',
        'آیا میتوانم امنیت یک سایت را تست کنم',
        'برای تست نفوذ چه مجوزی لازم است',
        'قواعد تست امنیت چیست'
      ],
      [
        'security testing permission',
        'penetration test scope',
        'rules of engagement',
        'مجوز تست امنیت',
        'محدوده تست نفوذ'
      ],
      'پیش از تست امنیت، اجازه‌ی مکتوب از مالک دارای اختیار بگیر. سند باید دامنه و IPهای مجاز، روش‌های ممنوع، ساعت آزمون، سقف بار، نوع داده، حساب آزمایشی، تماس اضطراری، توقف و پاک‌کردن داده را روشن کند. سرویس شخص ثالث، کاربر واقعی و زیرساخت خارج از محدوده را لمس نکن. اگر مجوز مبهم است، آزمون را متوقف و روشنش کن. در ایران یا هر کشور دیگر، قانون و قرارداد روز اهمیت دارد؛ این توضیح جای مشاوره‌ی حقوقی را نمی‌گیرد.',
      'Before security testing, get written permission from an owner with authority. The agreement should define allowed domains and addresses, prohibited methods, timing, load limits, data handling, test accounts, emergency contact, stop conditions, and cleanup. Do not touch third-party services, real users, or infrastructure outside scope. If permission is ambiguous, stop and clarify it. Current local law and contracts matter in Iran and everywhere else; this general explanation is not legal advice.',
      ['written permission', 'scope', 'law', 'اجازه کتبی', 'قانون']
    ),
    fact(
      'threat_modeling',
      [
        'how do i threat model an app',
        'threat modeling for developers',
        'security design review checklist',
        'چطور برای اپ threat model بسازم',
        'مدل تهدید برای برنامه نویس',
        'چک لیست طراحی امنیتی'
      ],
      ['threat model', 'security design review', 'مدل تهدید', 'طراحی امنیتی'],
      'مدل تهدید را با چهار سؤال بساز: چه چیزی می‌سازیم، چه دارایی و داده‌ای مهم است، چه چیزی ممکن است اشتباه شود و چه کنترلی ارزش دارد. جریان داده، مرز اعتماد، نقش‌ها، سرویس بیرونی و عملیات حساس را رسم کن. سوءاستفاده‌هایی مثل دسترسی بدون مجوز، جعل هویت، نشت secret، تغییر داده و ازکارافتادن سرویس را بر اساس اثر و احتمال اولویت بده. خروجی باید چند اقدام مالک‌دار و قابل‌آزمایش باشد، نه فقط نمودار یا فهرست ترس‌ها.',
      'Build a threat model around four questions: what are we building, which assets and data matter, what can go wrong, and which controls are worthwhile. Draw data flows, trust boundaries, roles, third parties, and sensitive operations. Prioritize abuse such as unauthorized access, spoofing, secret exposure, tampering, and loss of availability by impact and likelihood. The output should be a small set of owned, testable actions, not merely a diagram or list of fears.',
      ['risk', 'data flow', 'trust boundary', 'ریسک', 'جریان داده']
    ),
    fact(
      'sql_injection_defense',
      [
        'what is sql injection and how do i prevent it',
        'sql injection prevention for developers',
        'parameterized queries explained',
        'sql injection چیه و چطور جلوش رو بگیرم',
        'جلوگیری از تزریق sql برای برنامه نویس',
        'query پارامتری را توضیح بده'
      ],
      [
        'sql injection defense',
        'prevent sql injection',
        'parameterized query',
        'جلوگیری از sql injection',
        'تزریق sql',
        'query پارامتری'
      ],
      'تزریق SQL وقتی رخ می‌دهد که ورودی نامطمئن بخشی از دستور دیتابیس شود و ساختار query را تغییر دهد. دفاع اصلی این است که مقدارها را با query پارامتری یا prepared statement از ساختار دستور جدا کنی؛ اتصال رشته با ورودی کاربر و فهرست سیاه کاراکترها دفاع قابل‌اعتماد نیست. اعتبارسنجی سمت سرور، دسترسی حداقلی حساب دیتابیس، پیام خطای بدون جزئیات حساس و تست منفی هم لازم‌اند. نام جدول یا ستون را از ورودی آزاد نساز؛ اگر انتخاب پویا لازم است از allowlist محدود استفاده کن. آزمون را فقط روی برنامه‌ی خودت یا محیط دارای مجوز انجام بده.',
      'SQL injection happens when untrusted input becomes part of a database command and changes query structure. The primary defense is separating values from code with parameterized queries or prepared statements; string concatenation and character denylists are not reliable protection. Add server-side validation, least-privilege database accounts, errors that do not leak sensitive detail, and negative tests. Do not build table or column names from free-form input; when dynamic selection is necessary, use a strict allowlist. Test only your own application or an explicitly authorized environment.',
      ['database', 'query', 'input', 'دیتابیس', 'ورودی', 'پارامتری']
    ),
    fact(
      'secure_web_review',
      [
        'how do i security test my own web app',
        'web application security review checklist',
        'owasp review for my app',
        'چطور امنیت وب اپ خودم را تست کنم',
        'چک لیست بررسی امنیت وب',
        'بررسی owasp برای برنامه خودم'
      ],
      [
        'web security review',
        'security test my app',
        'بررسی امنیت وب',
        'تست امنیت اپ خودم'
      ],
      'برای برنامه‌ی خودت یا سامانه‌ی دارای مجوز، اول نسخه‌ی آزمایشی و داده‌ی ساختگی بساز. احراز هویت و بازیابی حساب، مجوز هر شیء و نقش، اعتبارسنجی سمت سرور، query پارامتری، encode خروجی، cookie و session، بارگذاری فایل، secret، dependency و تنظیمات استقرار را بررسی کن. تست منفی بنویس: کاربر عادی نباید داده یا عمل نقش دیگر را ببیند. روی تولید بدون برنامه‌ی توقف و پشتیبان آزمایش نکن و یافته را با اثر، گام بازتولید امن و اصلاح پیشنهادی ثبت کن.',
      'For your own application or an explicitly authorized system, start with a test environment and synthetic data. Review authentication and recovery, authorization for every object and role, server-side validation, parameterized queries, contextual output encoding, cookies and sessions, uploads, secrets, dependencies, and deployment configuration. Add negative tests: an ordinary user must not see or perform another role’s data or action. Never probe production without stop and recovery plans, and record each finding with impact, safe reproduction, and a proposed fix.',
      ['own app', 'owasp', 'authorization', 'اپ خودم', 'مجوز دسترسی']
    ),
    fact(
      'vulnerability_disclosure',
      [
        'i found a vulnerability what should i do',
        'responsible vulnerability disclosure',
        'how do i report a security bug',
        'یک آسیب پذیری پیدا کردم چه کنم',
        'افشای مسئولانه آسیب پذیری',
        'باگ امنیتی را چطور گزارش کنم'
      ],
      [
        'vulnerability disclosure',
        'report security bug',
        'افشای آسیب پذیری',
        'گزارش باگ امنیتی'
      ],
      'اگر آسیب‌پذیری دیدی، پس از حداقل اثبات لازم متوقف شو: داده‌ی واقعی را دانلود نکن، دسترسی را گسترش نده، ماندگاری نساز و چیزی را خراب نکن. سیاست security.txt، برنامه‌ی باگ‌بانتی یا کانال رسمی مالک را پیدا کن و زمان، دامنه، اثر و بازتولید کم‌خطر را خصوصی گزارش بده. مدرک حساس را عمومی نکن و با تهدید یا درخواست پول اجباری فشار نیاور. اگر محدوده یا قانون نامشخص است، پیش از اقدام بیشتر از متخصص حقوقی آشنا با حوزه‌ی قضایی خودت کمک بگیر.',
      'If you notice a vulnerability, stop after the minimum proof needed: do not download real data, expand access, create persistence, or damage anything. Find the owner’s security.txt, bug-bounty policy, or official channel and privately report the time, scope, impact, and a low-risk reproduction. Do not publish sensitive evidence or pressure the owner with threats or coercive payment demands. If scope or law is unclear, get advice from a qualified professional familiar with your jurisdiction before doing more.',
      ['security.txt', 'bug bounty', 'report', 'گزارش', 'باگ بانتی']
    ),
    fact(
      'incident_response_basics',
      [
        'cyber incident response steps',
        'what do i do after a data breach',
        'how do i handle ransomware safely',
        'مراحل پاسخ به حادثه سایبری',
        'بعد از نشت داده چه کنم',
        'با باج افزار چطور برخورد کنم'
      ],
      [
        'incident response',
        'data breach response',
        'ransomware response',
        'پاسخ به حادثه',
        'نشت داده',
        'باج افزار'
      ],
      'در حادثه‌ی سایبری، شتاب بدون ثبت شواهد می‌تواند اوضاع را بدتر کند. اول ایمنی و اثر را بسنج، سامانه‌ی آلوده را با هماهنگی تیم جدا کن، حساب و token در معرض خطر را از دستگاه سالم باطل کن و log و زمان‌بندی را نگه دار. سپس محدوده را تعیین، مسیر ورود را ببند، از نسخه‌ی سالم بازیابی و پایش را تقویت کن. تعهد اطلاع‌رسانی به کاربر، بیمه، نهاد ناظر یا پلیس به قانون و قرارداد بستگی دارد؛ مسئول امنیت و مشاور حقوقی روز باید تصمیم بگیرند. فایل ناشناس را اجرا یا با مهاجم مذاکره‌ی شخصی نکن.',
      'In a cyber incident, speed without evidence can make things worse. Assess safety and impact, isolate affected systems with the response team, revoke exposed accounts and tokens from a known-clean device, and preserve logs and a timeline. Then determine scope, close the entry path, restore from known-good backups, and strengthen monitoring. Duties to notify users, insurers, regulators, or police depend on current law and contracts, so security leadership and qualified counsel should decide. Do not run unknown files or negotiate personally with an attacker.',
      ['breach', 'contain', 'recover', 'نشت', 'مهار', 'بازیابی']
    ),
    fact(
      'account_compromise',
      [
        'my account was hacked what should i do',
        'someone stole my online account',
        'recover a compromised account',
        'اکانتم هک شده چه کنم',
        'حسابم را دزدیده اند',
        'بازیابی حساب هک شده'
      ],
      [
        'hacked account recovery',
        'compromised account',
        'اکانت هک شده',
        'حساب هک شده'
      ],
      'از یک دستگاه مطمئن وارد مسیر رسمی بازیابی همان سرویس شو؛ لینک پیام ناشناس را باز نکن. رمز را به یک رمز بلند و یکتا تغییر بده، نشست‌ها و برنامه‌های متصل را ببند، احراز هویت دومرحله‌ای را فعال و ایمیل و شماره‌ی بازیابی را بررسی کن. اگر همان رمز جای دیگری بوده، آن حساب‌ها را هم عوض کن. از پیام، زمان و اعلان‌ها مدرک نگه دار. برای حساب مالی با بانک و برای احتمال تعویض سیم‌کارت با اپراتور رسمی فوراً تماس بگیر. دریا نمی‌تواند وارد حساب شود یا هویت فرد مهاجم را تأیید کند.',
      'From a known-clean device, use the service’s official recovery path rather than links in unexpected messages. Change to a long unique password, revoke sessions and connected apps, enable multifactor authentication, and inspect recovery email and phone details. If that password was reused, change the other accounts too. Preserve messages, timestamps, and alerts. For financial accounts contact the bank, and for possible SIM swapping contact the official carrier immediately. Darya cannot access the account or identify the attacker.',
      ['recovery', 'password', 'mfa', 'رمز', 'بازیابی', 'دو مرحله ای']
    ),
    fact(
      'phishing_defense',
      [
        'how do i recognize phishing',
        'what should i do with a phishing message',
        'phishing prevention checklist',
        'چطور فیشینگ را تشخیص بدهم',
        'با پیام فیشینگ چه کنم',
        'چک لیست جلوگیری از فیشینگ'
      ],
      [
        'recognize phishing',
        'phishing defense',
        'تشخیص فیشینگ',
        'دفاع در برابر فیشینگ'
      ],
      'پیام فیشینگ معمولاً عجله، ترس یا جایزه می‌سازد و می‌خواهد روی لینک بروی، فایل باز کنی یا رمز و کد بدهی. نام نمایشی را کافی ندان؛ دامنه، نشانی کامل و درخواست را از کانال جداگانه‌ی رسمی بررسی کن. لینک را از خود پیام دنبال نکن و کد یک‌بارمصرف، رمز یا دسترسی راه دور نده. اگر کلیک کردی، اتصال مشکوک را قطع کن، از دستگاه سالم رمز را تغییر بده، نشست‌ها را ببند و به سرویس یا سازمان مربوط گزارش کن. صرف غلط املایی نبودن، پیام را معتبر نمی‌کند.',
      'Phishing often creates urgency, fear, or a prize and asks you to follow a link, open a file, or provide a password or code. A display name proves nothing; verify the full domain and request through a separate official channel. Do not follow the message link or share one-time codes, passwords, or remote access. If you clicked, stop suspicious interaction, change credentials from a clean device, revoke sessions, and report it to the relevant service or organization. Perfect spelling does not make a message legitimate.',
      ['email', 'link', 'code', 'پیام', 'لینک', 'کد']
    ),
    fact(
      'personal_account_security',
      [
        'how should i use a password manager',
        'personal account security checklist',
        'passwords and multifactor authentication',
        'چطور از مدیر رمز استفاده کنم',
        'چک لیست امنیت حساب شخصی',
        'رمز و احراز هویت دو مرحله ای'
      ],
      [
        'password manager',
        'account security',
        'multifactor authentication',
        'مدیر رمز',
        'امنیت حساب',
        'احراز هویت دو مرحله ای'
      ],
      'برای هر حساب رمز بلند و یکتا بساز و آن‌ها را در مدیر رمز معتبر نگه دار؛ یک رمز را میان سرویس‌ها تکرار نکن. برای خود مدیر رمز یک عبارت اصلی قوی و احراز هویت دومرحله‌ای بگذار و کدهای بازیابی را آفلاین در جای امن نگه دار. هرجا ممکن است passkey یا برنامه‌ی تولید کد از پیامک مقاوم‌تر است، اما روش بازیابی را هم آزمایش کن. اعلان ورود، نشست‌ها و برنامه‌های متصل را دوره‌ای ببین و نرم‌افزار را به‌روز نگه دار. هیچ پشتیبانی واقعی رمز اصلی یا کد یک‌بارمصرف را از تو نمی‌خواهد.',
      'Use a long unique password for every account and keep them in a reputable password manager rather than reusing one secret. Protect the manager with a strong master passphrase and multifactor authentication, and store recovery codes offline in a safe place. Where available, passkeys or an authenticator app can be stronger than text messages, but test account recovery too. Review login alerts, active sessions, and connected apps periodically, and keep software updated. Legitimate support will not ask for your master password or one-time code.',
      ['password', 'mfa', 'recovery', 'رمز', 'بازیابی', 'دو مرحله ای']
    ),
    fact(
      'home_wifi_security',
      [
        'how do i secure my home wifi',
        'home router security checklist',
        'make my wireless network safer',
        'چطور وای فای خونه را امن کنم',
        'چک لیست امنیت مودم خانه',
        'شبکه بی سیم خانه را امن کنم',
        'wpa2 یا wpa3 برای وای فای خونه بهتره',
        'wpa2 یا wpa3 برای وای فای خانه بهتره'
      ],
      [
        'secure home wifi',
        'router security',
        'wireless network safety',
        'امنیت وای فای خانه',
        'امنیت مودم',
        'شبکه بی سیم امن'
      ],
      'برای شبکه‌ی خانه، رمز مدیریت پیش‌فرض مودم را عوض کن، firmware را فقط از سازنده به‌روز نگه دار و از WPA2-AES یا WPA3 با رمز یکتای بلند استفاده کن. WPS و مدیریت از راه دور را اگر لازم نداری خاموش کن و نام شبکه را طوری نگذار که هویت یا نشانی تو را آشکار کند. برای مهمان و وسایل هوشمند کم‌اعتماد شبکه‌ی جدا بساز، فهرست دستگاه‌های متصل را ببین و تنظیمات را از راهنمای رسمی مدل خودت تطبیق بده. پنهان‌کردن نام شبکه یا فیلتر MAC به‌تنهایی دفاع قوی نیست.',
      'For a home network, change the router’s default administrator password, update firmware only from the manufacturer, and use WPA2-AES or WPA3 with a long unique Wi-Fi password. Disable WPS and remote administration when you do not need them, and avoid a network name that exposes identity or address. Put guests and less-trusted smart devices on a separate network, review connected devices, and confirm settings in the official manual for your model. Hiding the network name or using MAC filtering alone is not strong protection.',
      ['router', 'wpa', 'firmware', 'مودم', 'رمز', 'به روز']
    ),
    fact(
      'backup_recovery_strategy',
      [
        'what backup strategy protects against ransomware',
        'how do i make reliable backups',
        'test a disaster recovery plan',
        'چه راهبرد پشتیبان گیری در برابر باج افزار خوب است',
        'چه راهبرد پشتیبان‌گیری در برابر باج افزار خوب است',
        'چطور پشتیبان مطمئن بگیرم',
        'برنامه بازیابی بحران را تست کنم'
      ],
      [
        'ransomware backup',
        'backup strategy',
        'disaster recovery test',
        'پشتیبان باج افزار',
        'راهبرد پشتیبان',
        'تست بازیابی'
      ],
      'پشتیبان وقتی واقعی است که بتوانی آن را بازیابی کنی. الگوی ۳-۲-۱ نقطه‌ی شروع خوبی است: چند نسخه، روی بیش از یک نوع رسانه و دست‌کم یک نسخه‌ی جدا یا خارج از محل. برای داده‌ی مهم، versioning یا نسخه‌ی تغییرناپذیر کمک می‌کند تا باج‌افزار نتواند همه‌ی تاریخچه را هم رمز کند. زمان‌بندی خودکار، رمزنگاری، کنترل دسترسی و هشدار شکست را تنظیم کن، اما مهم‌تر از همه بازیابی نمونه را دوره‌ای آزمایش و زمان و وابستگی‌هایش را ثبت کن. هنگام حادثه، پشتیبان سالم را پیش از مهار آلودگی به سامانه‌ی مشکوک وصل نکن.',
      'A backup is real only when it can be restored. The 3-2-1 pattern is a useful baseline: multiple copies, on more than one medium, with at least one separated or offsite. For important data, versioning or immutable copies help prevent ransomware from encrypting all history too. Automate the schedule, encryption, access control, and failure alerts, but most importantly test a sample restore periodically and record its time and dependencies. During an incident, do not connect a known-good backup to a suspect system before containment.',
      ['restore', 'offline', 'versioning', 'بازیابی', 'آفلاین', 'نسخه']
    ),
    fact(
      'security_portfolio',
      [
        'how do i build a cybersecurity portfolio',
        'cybersecurity projects for beginners',
        'security analyst portfolio ideas',
        'چطور نمونه کار امنیت سایبری بسازم',
        'پروژه امنیت برای مبتدی',
        'نمونه کار کارشناس امنیت'
      ],
      [
        'cybersecurity portfolio',
        'security projects',
        'نمونه کار امنیت',
        'پروژه امنیتی'
      ],
      'نمونه‌کار امنیتی امن می‌تواند شامل مدل تهدید یک اپ فرضی، سخت‌سازی Linux در ماشین محلی، تحلیل log ساختگی، گزارش یک CTF، بررسی dependency یک پروژه‌ی آزمایشی و playbook پاسخ به فیشینگ باشد. برای هر مورد مسئله، محدوده‌ی قانونی، شواهد، تصمیم، اصلاح و چیزی که یاد گرفتی را بنویس. داده‌ی واقعی، credential، تصویر قربانی یا جزئیات قابل سوءاستفاده را منتشر نکن. یک گزارش روشن و بازتولیدپذیر بهتر از ده تصویر ابزار بدون توضیح است.',
      'A safe security portfolio can include a threat model for a sample app, Linux hardening in a local virtual machine, synthetic-log analysis, a CTF write-up, dependency review for a demo project, and a phishing-response playbook. For each, document the problem, legal scope, evidence, decisions, remediation, and what you learned. Never publish real data, credentials, victim screenshots, or details that expose an unpatched target. One clear reproducible report is stronger than ten unexplained tool screenshots.',
      ['portfolio', 'project', 'report', 'نمونه کار', 'گزارش']
    )
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
