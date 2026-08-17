/**
 * Darya - practical skills, office, career, and existential knowledge.
 * Static bilingual guidance for common beginner-to-intermediate questions.
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
      'existentialism_basics',
      [
        'what is existentialism',
        'existentialism explained',
        'اگزیستانسیالیسم چیست',
        'فلسفه اگزیستانسیالیسم'
      ],
      ['existentialism', 'اگزیستانسیالیسم', 'اصالت وجود'],
      'اگزیستانسیالیسم یک پاسخ واحد نیست، بلکه خانواده‌ای از دیدگاه‌هاست که می‌گوید انسان در جهانی بدون دستورالعمل کامل، با انتخاب‌هایش به زندگی شکل می‌دهد. آزادی با مسئولیت و اضطراب همراه است. کی‌یرکگور، نیچه، سارتر، دوبووار و کامو پاسخ‌های متفاوتی داشتند؛ سارتر بر انتخاب و مسئولیت، و کامو بر زیستن صادقانه در برابر پوچی تأکید می‌کردند.',
      'Existentialism is not one doctrine but a family of views about living without a complete preset script. We shape a life through choices, and freedom brings responsibility and anxiety. Kierkegaard, Nietzsche, Sartre, Beauvoir, and Camus disagreed in important ways: Sartre emphasized choice and responsibility, while Camus emphasized living honestly in the face of absurdity.'
    ),
    fact(
      'nihilism_absurdism',
      [
        'nihilism vs absurdism',
        'difference between nihilism and absurdism',
        'پوچ گرایی و ابزوردیسم',
        'فرق نیهیلیسم و ابزوردیسم'
      ],
      ['nihilism', 'absurdism', 'نیهیلیسم', 'ابزوردیسم', 'پوچ گرایی'],
      'نیهیلیسم معمولاً وجود معنای عینی یا ارزش ذاتی را انکار می‌کند. ابزوردیسمِ کامو از کشمکش میان نیاز انسان به معنا و سکوت جهان شروع می‌کند، اما نتیجه‌اش تسلیم نیست: با آگاهی، آزادی و زیستن کامل پاسخ می‌دهد. اگزیستانسیالیسم نیز اغلب می‌گوید معنا ساخته می‌شود، نه اینکه آماده کشف باشد.',
      'Nihilism generally denies objective meaning or inherent value. Camus-style absurdism starts with the clash between our demand for meaning and an indifferent universe, but does not end in surrender: its answer is lucid, free, fully lived experience. Existentialism often adds that meaning is made through commitments rather than found ready-made.'
    ),
    fact(
      'purpose_practice',
      [
        'how do i find purpose',
        'how to find meaning in life',
        'i have no purpose what do i do',
        'i have no purpose what practical thing should i do',
        'i cannot find meaning in my career',
        'چطور هدف زندگی پیدا کنم',
        'چطور معنای زندگی پیدا کنم'
      ],
      ['purpose', 'meaning in life', 'هدف زندگی', 'معنای زندگی'],
      'هدف معمولاً یک کشف ناگهانی نیست؛ از الگوهای کوچک ساخته می‌شود. سه فهرست بنویس: چه چیزی برایت مهم است، در چه کاری می‌توانی مفید باشی و چه کاری حاضری حتی بدون تشویق ادامه بدهی. یک تعهد دو هفته‌ای کوچک انتخاب کن و بعد بر اساس تجربه اصلاحش کن. هدف می‌تواند چندگانه و در طول زندگی متغیر باشد.',
      'Purpose is rarely one dramatic discovery; it is built from repeated commitments. List what you value, where you can be useful, and what you would keep doing without applause. Choose one small two-week commitment, then revise from experience. A person can have several purposes, and they can change across a lifetime.'
    ),
    fact(
      'death_anxiety',
      [
        'how to deal with fear of death',
        'how can i deal with fear of death',
        'why am i scared of death',
        'ترس از مرگ چیکار کنم',
        'چطور با ترس از مرگ کنار بیام'
      ],
      ['fear of death', 'death anxiety', 'ترس از مرگ'],
      'ترس از مرگ بخشی انسانی از آگاهی به محدودبودن زندگی است. کمک می‌کند آن را دقیق‌تر نام‌گذاری کنی: ترس از درد، نبودن، ازدست‌دادن عزیزان یا زندگی‌نکردن؟ بازگشت به کارهای قابل‌کنترل، گفتگو با یک فرد امن و ساختن زندگی همسو با ارزش‌ها می‌تواند شدت آن را کم کند. اگر ترس مداوم باعث حمله‌ی اضطرابی یا اختلال در زندگی شده، درمانگر می‌تواند کمک جدی‌تری بدهد.',
      'Fear of death is a human response to knowing life is finite. Make it more specific: is it fear of pain, nonexistence, losing people, or not having lived? Returning to controllable actions, talking with someone safe, and living closer to your values can reduce its grip. If the fear causes persistent panic or disrupts daily life, a mental health professional can help.'
    ),
    fact(
      'coding_roadmap',
      [
        'how do i start coding',
        'coding roadmap for beginners',
        'give me a realistic coding roadmap for beginners',
        'learn programming from zero',
        'چطور برنامه نویسی شروع کنم',
        'نقشه راه برنامه نویسی مبتدی'
      ],
      ['start coding', 'coding roadmap', 'برنامه نویسی', 'کدنویسی'],
      'برای شروع یک هدف انتخاب کن، نه ده زبان. برای وب، HTML و CSS و JavaScript؛ برای خودکارسازی و داده، Python مناسب است. مفاهیم متغیر، شرط، حلقه، تابع، ساختار داده و خطا را یاد بگیر. هر هفته یک پروژه‌ی کوچک بساز، کد را با Git ذخیره کن و مسئله‌ها را خودت توضیح بده. دوره‌دیدن بدون ساختن پروژه پیشرفت واقعی نیست.',
      'Start with one goal, not ten languages. For the web, learn HTML, CSS, and JavaScript; for automation or data, Python is a practical first choice. Learn variables, conditions, loops, functions, data structures, and errors. Build one small project each week, save it with Git, and explain your own decisions. Watching courses without building is not a roadmap.'
    ),
    fact(
      'debugging_method',
      [
        'how to debug code',
        'debugging steps',
        'my code does not work how do i debug',
        'چطور کد رو دیباگ کنم',
        'مراحل دیباگ کردن'
      ],
      ['debugging', 'debug code', 'دیباگ'],
      'دیباگ را با حدس تصادفی شروع نکن: خطا را بازتولید کن، ورودی و خروجی مورد انتظار را بنویس، پیام خطا و stack trace را کامل بخوان، مسئله را به کوچک‌ترین نمونه کاهش بده و با breakpoint یا log مرز درست و غلط را پیدا کن. سپس علت ریشه‌ای را اصلاح کن و یک تست بنویس که همان خطا دوباره برنگردد.',
      'Do not debug by random edits. Reproduce the failure, write expected versus actual behavior, read the full error and stack trace, reduce it to the smallest case, then use a debugging tool or targeted logs to find the boundary between correct and incorrect state. Fix the root cause and add a regression test that would catch it again.'
    ),
    fact(
      'git_workflow',
      [
        'basic git workflow',
        'how to use git branches',
        'git commit pull request workflow',
        'گردش کار گیت',
        'گردش کار گیت و pull request رو توضیح بده',
        'چطور از git استفاده کنم'
      ],
      ['git workflow', 'git branch', 'گیت'],
      'گردش کار ساده‌ی Git: شاخه‌ی اصلی را به‌روز کن، برای هر تغییر یک branch کوتاه بساز، تغییرهای مرتبط را commit کن، پیش از push تست و diff را ببین و سپس pull request باز کن. پیام commit باید بگوید چه چیزی و چرا تغییر کرده است. merge conflict را با فهم هر دو سمت حل کن، نه با انتخاب کورکورانه‌ی ours یا theirs.',
      'A clean Git workflow is: update the main branch, create a short-lived branch for one concern, make focused commits, inspect the diff and run tests before pushing, then open a pull request. A commit message should say what changed and why. Resolve merge conflicts by understanding both sides, never by blindly choosing ours or theirs.'
    ),
    fact(
      'api_basics',
      [
        'what is an api in simple terms',
        'how does rest api work',
        'api explained for beginners',
        'api چیست ساده',
        'rest api چطور کار میکند'
      ],
      ['api', 'rest api', 'ای پی آی'],
      'API قرارداد ارتباط میان نرم‌افزارهاست. در یک REST API معمولاً client یک درخواست HTTP به endpoint می‌فرستد: GET برای خواندن، POST برای ساختن، PUT یا PATCH برای تغییر و DELETE برای حذف. status code نتیجه را نشان می‌دهد و JSON قالب رایج داده است. احراز هویت، اعتبارسنجی ورودی، محدودیت نرخ و مدیریت خطا بخش‌های ضروری‌اند.',
      'An API is a contract that lets software communicate. In a REST API, a client sends an HTTP request to an endpoint: GET reads, POST creates, PUT or PATCH changes, and DELETE removes. Status codes describe the result, and JSON commonly carries data. Authentication, input validation, rate limits, and clear error handling are essential.'
    ),
    fact(
      'frontend_backend',
      [
        'frontend vs backend vs full stack',
        'difference between frontend and backend',
        'فرانت اند و بک اند چه فرقی دارند',
        'فول استک چیست'
      ],
      ['frontend', 'backend', 'full stack', 'فرانت اند', 'بک اند', 'فول استک'],
      'فرانت‌اند رابطی است که کاربر در مرورگر یا برنامه می‌بیند؛ بک‌اند منطق سرور، داده، مجوز و API را مدیریت می‌کند؛ فول‌استک یعنی توانایی کار در هر دو، نه تسلط کامل بر همه‌چیز. برای انتخاب، یک پروژه‌ی کوچک در هر سمت بساز و ببین از طراحی تعامل بیشتر لذت می‌بری یا از مدل‌سازی داده و منطق.',
      'Frontend is the interface people use in a browser or app. Backend handles server logic, data, authorization, and APIs. Full-stack means being able to work across both, not mastering everything. To choose, build one small project on each side and notice whether interaction design or data and logic holds your attention.'
    ),
    fact(
      'software_testing',
      [
        'unit test vs integration test',
        'how should i test software',
        'software testing basics',
        'تست واحد و یکپارچه چه فرقی دارند',
        'اصول تست نرم افزار'
      ],
      [
        'unit test',
        'integration test',
        'software testing',
        'تست واحد',
        'تست نرم افزار'
      ],
      'تست واحد یک تابع یا بخش کوچک را سریع و جدا بررسی می‌کند؛ تست یکپارچه همکاری چند بخش مثل API و پایگاه داده را می‌سنجد؛ تست سرتاسری مسیر واقعی کاربر را آزمایش می‌کند. بیشتر تست‌ها باید سریع و نزدیک منطق باشند و چند تست سرتاسری مسیرهای حیاتی را پوشش دهند. رفتار و مرزها را تست کن، نه جزئیات پیاده‌سازی را.',
      'A unit test checks a small function or module quickly and in isolation. An integration test checks components working together, such as an API and database. An end-to-end test follows a real user path. Keep most tests fast and close to business logic, with fewer E2E tests for critical journeys. Test behavior and boundaries, not implementation trivia.'
    ),
    fact(
      'code_review',
      [
        'how to do code review',
        'code review checklist',
        'give me a professional code review checklist',
        'what should i check in a pull request',
        'چک لیست کد ریویو',
        'چطور کد ریویو کنم'
      ],
      ['code review', 'pull request review', 'کد ریویو'],
      'در بازبینی کد اول هدف و محدوده را بفهم، سپس درستی، حالت‌های مرزی، امنیت، تست، نام‌گذاری و سادگی را بررسی کن. تفاوت میان مشکل ضروری و سلیقه را روشن بنویس. نظر خوب مشخص، محترمانه و همراه دلیل یا پیشنهاد است. تغییر بسیار بزرگ را به بخش‌های کوچک‌تر برگردان؛ بازبینی جای نمایش برتری نیست.',
      'In code review, understand the goal and scope first, then check correctness, edge cases, security, tests, naming, and simplicity. Distinguish required fixes from preferences. Good feedback is specific, respectful, and explains the reason or an alternative. Ask for oversized changes to be split; review is not a performance of superiority.'
    ),
    fact(
      'software_security',
      [
        'secure coding checklist',
        'software security basics',
        'owasp basics for developers',
        'اصول امنیت برنامه نویسی',
        'چک لیست کدنویسی امن'
      ],
      ['secure coding', 'owasp', 'کدنویسی امن'],
      'حداقل‌های کدنویسی امن: ورودی را در مرز اعتبارسنجی کن، خروجی را متناسب با محل escape کن، query پارامتری بنویس، احراز هویت و مجوز را جدا بررسی کن، secret را در کد نگذار، وابستگی‌ها را به‌روز نگه دار و خطاها را بدون افشای اطلاعات حساس ثبت کن. مدل تهدید و تست امنیت باید پیش از انتشار باشد، نه بعد از حادثه.',
      'Secure-coding basics: validate at boundaries, escape output for its context, use parameterized queries, check authentication and authorization separately, keep secrets out of source code, update dependencies, and log errors without leaking sensitive data. Threat modeling and security tests belong before release, not after an incident.'
    ),
    fact(
      'deployment_basics',
      [
        'how to deploy an app',
        'deployment pipeline for beginners',
        'ci cd explained',
        'چطور برنامه را دیپلوی کنم',
        'ci cd چیست'
      ],
      ['deployment', 'ci cd', 'deploy app', 'دیپلوی'],
      'مسیر انتشار ساده: build تکرارپذیر، تست خودکار، محیط staging شبیه production، migration قابل‌بازگشت، تنظیمات در متغیر محیطی، health check و logging. CI تغییرها را خودکار بررسی می‌کند و CD بسته را با کنترل منتشر می‌کند. انتشار خوب باید rollback روشن داشته باشد؛ deploy موفق فقط روشن‌شدن سرور نیست.',
      'A basic delivery path needs a reproducible build, automated tests, staging close to production, reversible migrations, environment-based configuration, health checks, and logs. CI checks every change; CD promotes a tested artifact in a controlled way. A good release has a clear rollback. A running server alone is not a successful deployment.'
    ),
    fact(
      'word_formatting',
      [
        'how to format a document in microsoft word',
        'how do i format a long report in microsoft word',
        'word styles and table of contents',
        'how do i create an automatic table of contents in word',
        'قالب بندی در word',
        'فهرست خودکار ورد'
      ],
      ['microsoft word', 'word styles', 'مایکروسافت ورد', 'ورد'],
      'در Word متن را با فاصله و اندازه‌ی دستی مدیریت نکن. از Styles برای Heading 1 و Heading 2 و متن عادی استفاده کن؛ سپس از References فهرست خودکار بساز. برای صفحه‌بندی از Page Break و Section Break، برای سربرگ از Header/Footer و برای همکاری از Track Changes و Comments استفاده کن. این روش سند را یکدست و قابل‌ویرایش نگه می‌دارد.',
      'In Microsoft Word, avoid formatting every line by hand. Use Styles for Heading 1, Heading 2, and normal text, then build an automatic table of contents from References. Use page and section breaks for layout, Header/Footer for repeating content, and Track Changes plus comments for collaboration. This keeps the document consistent and maintainable.'
    ),
    fact(
      'excel_formulas',
      [
        'basic excel formulas',
        'excel formulas for beginners',
        'sumif xlookup if formula',
        'فرمول های پایه اکسل',
        'فرمول های پایه اکسل رو بگو',
        'sumif و xlookup در اکسل'
      ],
      ['excel formula', 'xlookup', 'sumif', 'فرمول اکسل'],
      'فرمول‌های کاربردی Excel: SUM و AVERAGE برای جمع و میانگین، IF برای شرط، SUMIF/COUNTIF برای محاسبه‌ی شرطی، XLOOKUP برای پیدا کردن داده و IFERROR برای مدیریت خطا. داده را به Table تبدیل کن تا محدوده‌ها خودکار گسترش یابند. به‌جای حفظ‌کردن فرمول، ورودی، خروجی و حالت نبودن داده را مشخص کن.',
      'Useful Excel formulas include SUM and AVERAGE for totals, IF for conditions, SUMIF or COUNTIF for conditional calculations, XLOOKUP for matching records, and IFERROR for expected failures. Convert data to a Table so ranges expand automatically. Do not just memorize syntax: define the input, expected output, and missing-data behavior.'
    ),
    fact(
      'excel_pivot',
      [
        'how to make a pivot table',
        'how do i make a pivottable from sales data',
        'excel pivot table explained',
        'pivot table and chart',
        'چطور pivot table بسازم',
        'پیوت تیبل اکسل'
      ],
      ['pivot table', 'pivot chart', 'پیوت تیبل'],
      'برای PivotTable داده باید سطر عنوان، ستون‌های ثابت و بدون سلول ادغام‌شده داشته باشد. Insert > PivotTable را بزن، یک فیلد دسته‌ای را در Rows، عدد را در Values و تاریخ یا دسته را در Filters/Columns بگذار. نوع محاسبه را از Sum یا Count درست انتخاب کن، داده را Refresh کن و در صورت نیاز PivotChart بساز.',
      'For a PivotTable, start with one header row, consistent columns, and no merged cells. Choose Insert > PivotTable, place a category in Rows, a number in Values, and a date or category in Filters or Columns. Confirm whether Values should use Sum or Count, refresh after source changes, and add a PivotChart only when it clarifies the pattern.'
    ),
    fact(
      'powerpoint_basics',
      [
        'how to make a good powerpoint',
        'how can i make a powerpoint presentation look professional',
        'powerpoint presentation tips',
        'ساخت پاورپوینت خوب',
        'نکات ارائه پاورپوینت'
      ],
      ['powerpoint', 'presentation slides', 'پاورپوینت'],
      'ارائه‌ی خوب یک پیام در هر اسلاید دارد. متن را کوتاه، فونت را خوانا و کنتراست را بالا نگه دار؛ از تصویر برای توضیح استفاده کن، نه تزئین. Slide Master یکدستی را حفظ می‌کند و Presenter View یادداشت‌ها و زمان را نشان می‌دهد. انیمیشن را فقط وقتی به فهم ترتیب کمک می‌کند به‌کار ببر و ارائه را با صدای بلند تمرین کن.',
      'A good PowerPoint slide carries one message. Keep text short, type readable, and contrast high; use visuals to explain rather than decorate. Slide Master maintains consistency, and Presenter View shows notes and timing. Use animation only when it explains sequence, and rehearse aloud because slides support the talk rather than replace it.'
    ),
    fact(
      'outlook_productivity',
      [
        'outlook email rules and calendar',
        'how should i organize outlook email and calendar',
        'how to organize outlook',
        'قانون ایمیل و تقویم outlook',
        'مدیریت ایمیل در اوت لوک'
      ],
      ['outlook', 'email rules', 'اوت لوک'],
      'در Outlook پوشه‌های زیاد نساز؛ Inbox را محل تصمیم‌گیری نگه دار. با Rules پیام‌های خودکار را جدا کن، با Categories موضوع را علامت بزن و برای کار واقعی از Flag یا Task با موعد استفاده کن. Calendar را برای زمان متمرکز block کن و پیش از ارسال جلسه، هدف، دستور جلسه و منطقه‌ی زمانی را بررسی کن.',
      'In Outlook, avoid a maze of folders. Keep the inbox as a decision point, use Rules for predictable automated mail, Categories for context, and Flags or Tasks with dates for real actions. Block focus time on Calendar, and include a purpose, agenda, and correct time zone before sending a meeting.'
    ),
    fact(
      'google_docs_collaboration',
      [
        'how to use google docs suggestions',
        'google docs sharing and comments',
        'how do i share a google doc without exposing it publicly',
        'collaborate in google docs',
        'حالت پیشنهاد در google docs',
        'حالت پیشنهاد و کامنت در گوگل داکس چطوره',
        'اشتراک گذاری گوگل داکس'
      ],
      ['google docs', 'suggesting mode', 'گوگل داکس'],
      'در Google Docs سطح دسترسی Viewer، Commenter یا Editor را آگاهانه انتخاب کن و پیوند را عمومی نکن مگر لازم باشد. برای ویرایش قابل‌بررسی از Suggesting، برای گفتگو از Comment و @mention و برای بازگشت از Version history استفاده کن. کار حل‌شده را Resolve کن و مالکیت تصمیم نهایی را روشن نگه دار.',
      'In Google Docs, choose Viewer, Commenter, or Editor deliberately, and avoid public links unless necessary. Use Suggesting for reviewable edits, comments and @mentions for discussion, and Version history to inspect or restore changes. Resolve completed threads and keep ownership of final decisions clear.'
    ),
    fact(
      'google_sheets',
      [
        'google sheets formulas and filters',
        'how to use filter views in google sheets',
        'how should a team use filter views in google sheets',
        'what is the safest way to protect formulas in google sheets',
        'فرمول و فیلتر گوگل شیت',
        'filter view گوگل شیت'
      ],
      ['google sheets', 'filter view', 'گوگل شیت'],
      'Google Sheets بیشتر فرمول‌های اصلی Excel را دارد. برای همکاری، داده را با Data validation محدود کن، ردیف عنوان را Freeze کن و به‌جای تغییر فیلتر همه از Filter view استفاده کن. با Protect ranges از فرمول‌ها محافظت کن و از IMPORTRANGE فقط وقتی استفاده کن که وابستگی میان فایل‌ها واقعاً لازم است.',
      'Google Sheets supports most core Excel formulas. For collaboration, constrain input with Data validation, freeze the header row, and use Filter views instead of changing everyone’s filter. Protect formula ranges, and use IMPORTRANGE only when a cross-file dependency is truly worth maintaining.'
    ),
    fact(
      'resume_ats',
      [
        'how to make an ats friendly resume',
        'how do i make my resume ats friendly',
        'resume for software developer',
        'رزومه ats',
        'رزومه برنامه نویس چطور باشد'
      ],
      ['ats resume', 'developer resume', 'رزومه'],
      'رزومه‌ی مناسب ATS ساده و تک‌ستونه است: عنوان نقش، مهارت‌های مرتبط و تجربه با نتیجه‌ی قابل‌اندازه‌گیری. برای هر آگهی واژه‌های واقعی همان شغل را فقط در صورت صدق تطبیق بده. جدول، نمودار مهارت و ادعای مبهم را حذف کن. پروژه را با مسئله، کاری که انجام دادی، فناوری و نتیجه توضیح بده؛ رزومه معمولاً یک تا دو صفحه کافی است.',
      'An ATS-friendly resume is simple and usually single-column: target role, relevant skills, and experience expressed through measurable outcomes. Match genuine wording from each job description without keyword stuffing. Remove skill bars, tables, and vague claims. Describe projects through the problem, your action, technology, and result; one or two pages is normally enough.'
    ),
    fact(
      'portfolio_advice',
      [
        'how to build a software portfolio',
        'how do i build a software portfolio without work experience',
        'what projects should be in my portfolio',
        'what projects belong in a junior developer portfolio',
        'ساخت پورتفولیو برنامه نویسی',
        'چه پروژه ای در نمونه کار بگذارم'
      ],
      ['software portfolio', 'coding portfolio', 'پورتفولیو', 'نمونه کار'],
      'سه پروژه‌ی کامل بهتر از پانزده آموزش کپی‌شده است. هر پروژه باید مسئله، کاربران، تصمیم‌های فنی، trade-off، تست، روش اجرا و آنچه تغییر می‌دادی را نشان دهد. README روشن، نسخه‌ی قابل‌نمایش و commitهای قابل‌فهم مهم‌اند. پروژه‌ای انتخاب کن که یک نیاز واقعی کوچک را حل کند و بتوانی تمام کدش را توضیح بدهی.',
      'Three finished projects beat fifteen copied tutorials. Each should show the problem, users, technical decisions, tradeoffs, tests, setup, and what you would change. Include a clear README, a working demo where practical, and understandable commits. Solve a small real need and be able to explain every important part.'
    ),
    fact(
      'interview_practice',
      [
        'how to prepare for a software interview',
        'how should i prepare for a software engineering interview',
        'behavioral interview star method',
        'آمادگی مصاحبه برنامه نویسی',
        'روش star در مصاحبه'
      ],
      ['software interview', 'star method', 'مصاحبه برنامه نویسی'],
      'برای مصاحبه‌ی نرم‌افزار سه بخش را تمرین کن: توضیح پروژه‌های خودت، حل مسئله با صدای بلند و مثال‌های رفتاری. برای پاسخ رفتاری از STAR یعنی موقعیت، وظیفه، اقدام و نتیجه استفاده کن و سهم خودت را دقیق بگو. فقط جواب حفظ نکن؛ سؤال روشن‌کننده بپرس، فرض‌ها را بیان کن و بعد از تمرین بازخورد بگیر.',
      'Prepare for a software interview in three tracks: explaining your own projects, solving problems aloud, and behavioral examples. Use STAR: situation, task, action, result, with your contribution made explicit. Do not memorize only final answers; ask clarifying questions, state assumptions, and get feedback after mock interviews.'
    ),
    fact(
      'salary_negotiation',
      [
        'how to negotiate salary',
        'how can i negotiate salary after getting an offer',
        'how should i negotiate a job offer',
        'what to say in salary negotiation',
        'چطور حقوق مذاکره کنم',
        'مذاکره حقوق شغلی'
      ],
      ['salary negotiation', 'negotiate salary', 'مذاکره حقوق'],
      'پیش از مذاکره بازه‌ی بازار، حداقل قابل‌قبول و ارزش نقش را تحقیق کن. پس از پیشنهاد رسمی، با علاقه به نقش و دلیل مشخص درخواست بده: تجربه، مسئولیت یا داده‌ی بازار. یک عدد یا بازه‌ی منطقی بگو و سکوت را تحمل کن. کل بسته شامل بیمه، مرخصی، دورکاری، آموزش و زمان بازبینی حقوق را هم بسنج؛ درباره‌ی حقوق فعلی دروغ نگو.',
      'Before negotiating, research the market range, your minimum, and the role’s value. After a formal offer, express interest and make a specific case based on experience, responsibilities, or market data. Give a reasonable number or range and tolerate the pause. Evaluate the full package, including leave, remote work, learning budget, and review timing. Do not lie about current pay.'
    ),
    fact(
      'shopping_comparison',
      [
        'how to compare products before buying',
        'how do i compare products without getting overwhelmed',
        'smart shopping checklist',
        'give me a smart shopping checklist before i buy electronics',
        'چطور قبل خرید مقایسه کنم',
        'چک لیست خرید هوشمند'
      ],
      ['compare products', 'shopping checklist', 'مقایسه محصول', 'خرید هوشمند'],
      'پیش از خرید نیاز را به سه معیار ضروری و دو معیار ترجیحی تبدیل کن، سقف بودجه را با هزینه‌ی لوازم و نگهداری حساب کن و فقط دو یا سه گزینه را مقایسه کن. نقد حرفه‌ای، تجربه‌ی کاربر و سیاست مرجوعی را جداگانه ببین. امتیاز کلی بدون دانستن معیار تو مفید نیست و تخفیف روی چیزی که نیاز نداری صرفه‌جویی نیست.',
      'Before buying, translate the need into three must-haves and two preferences, set a budget including accessories and upkeep, and compare only two or three finalists. Check professional reviews, owner reports, and the return policy separately. A generic score cannot know your priorities, and a discount on something unnecessary is not a saving.'
    ),
    fact(
      'used_purchase',
      [
        'how to safely buy used electronics',
        'used laptop buying checklist',
        'how can i safely buy a used laptop online',
        'خرید امن کالای دست دوم',
        'برای خرید لپ تاپ دست دوم چی رو چک کنم',
        'چک لیست لپ تاپ دست دوم'
      ],
      ['used electronics', 'used laptop', 'کالای دست دوم', 'لپ تاپ دست دوم'],
      'برای کالای الکترونیکی دست‌دوم شماره‌سریال و قفل حساب را بررسی کن، ظاهر، پورت، باتری، صفحه، دوربین و شبکه را حضوری تست کن و رسید مالکیت بگیر. پیش‌پرداخت خارج از پلتفرم نده و از قیمت غیرعادی پایین دوری کن. برای لپ‌تاپ سلامت باتری و SSD، مشخصات واقعی و امکان تعمیر مهم‌تر از ظاهر تمیز است.',
      'For used electronics, verify the serial number and account locks, test the body, ports, battery, display, camera, and network in person, and get proof of sale. Do not pay deposits outside the marketplace, and distrust prices far below the market. For a laptop, battery and SSD health, actual specifications, and repairability matter more than a polished case.'
    ),
    fact(
      'return_warranty',
      [
        'warranty vs return policy',
        'what should i check in a warranty',
        'فرق گارانتی و مرجوعی',
        'در گارانتی چه چیزهایی را چک کنم'
      ],
      ['warranty', 'return policy', 'گارانتی', 'مرجوعی'],
      'مرجوعی اجازه می‌دهد در بازه‌ای کوتاه خرید را پس بدهی؛ گارانتی خرابی‌های تعریف‌شده را برای مدت مشخص پوشش می‌دهد. پیش از خرید مدت، استثناها، هزینه‌ی ارسال، تعمیر یا تعویض، اعتبار فروشنده و نیاز به فاکتور یا ثبت محصول را بخوان. عبارت «گارانتی دارد» بدون نام شرکت و شرایط کافی نیست.',
      'A return policy lets you send a purchase back during a short window; a warranty covers defined faults for a stated period. Before buying, read the duration, exclusions, shipping cost, repair versus replacement terms, provider reputation, and receipt or registration requirements. “Includes warranty” means little without the provider and terms.'
    ),
    fact(
      'ai_tool_choice',
      [
        'which ai tool should i use',
        'free vs paid ai tools',
        'compare free and paid ai tools for a beginner',
        'how do i choose an ai tool',
        'کدام ابزار هوش مصنوعی',
        'ابزار رایگان یا پولی هوش مصنوعی'
      ],
      ['ai tools', 'free ai', 'paid ai', 'ابزار هوش مصنوعی'],
      'اول کار را مشخص کن: نوشتن، تصویر، ویدیو، کدنویسی، صدا یا ارائه. ابزار رایگان را برای یادگیری و آزمایش شروع کن و فقط وقتی پول بده که محدودیت خروجی، سرعت، مجوز تجاری، حریم خصوصی یا همکاری واقعاً مانع شده است. شرایط و قیمت‌ها تغییر می‌کنند؛ پیش از بارگذاری اطلاعات شخصی، سیاست داده و محدودیت سنی را بررسی کن. نوجوان باید از حساب و نظارت مناسب سن استفاده کند و سالمند بهتر است با یک کار کوچک و قابل‌برگشت شروع کند.',
      'Choose the task first: writing, image, video, code, audio, or presentation. Start with a free tool for learning and prototypes; pay only when output limits, speed, commercial rights, privacy, or collaboration are a real blocker. Plans change, so verify current terms and data policies before uploading personal material. Young users need age-appropriate accounts and adult guidance; older beginners benefit from one small, reversible task at a time.'
    ),
    fact(
      'ai_image_tools',
      [
        'how to generate images with ai',
        'how do i generate an image with ai safely',
        'free and paid ai image generators',
        'best workflow for ai images',
        'ساخت عکس با هوش مصنوعی',
        'ابزار رایگان و پولی ساخت تصویر'
      ],
      ['ai image', 'image generator', 'ساخت تصویر', 'تولید عکس'],
      'برای تصویر، Microsoft Designer یا Image Creator و Adobe Firefly معمولاً اعتبار رایگان محدود دارند؛ Canva نسخه‌ی رایگان و Pro دارد و Midjourney معمولاً گزینه‌ای پولی است. وضعیت طرح‌ها را همان روز بررسی کن. پرامپت را با سوژه، محیط، نور، ترکیب و نسبت تصویر بنویس، چند نسخه بساز و نتیجه را ویرایش کن. عکس خصوصی، چهره‌ی کودک یا تصویر فرد واقعی را بدون رضایت بارگذاری یا جعل نکن و برای استفاده‌ی تجاری مجوز خروجی را بخوان.',
      'For images, Microsoft Designer or Image Creator and Adobe Firefly commonly offer limited free credits, Canva has free and paid tiers, and Midjourney is generally paid. Verify current plans. Prompt with subject, setting, light, composition, and aspect ratio, generate variations, then edit rather than expecting one perfect result. Never upload private photos, a child’s face, or imitate a real person without consent, and check commercial-use terms.'
    ),
    fact(
      'ai_video_tools',
      [
        'how to make an ai video',
        'how do i make a short ai video',
        'free and paid ai video tools',
        'generate a short video with ai',
        'ساخت ویدیو با هوش مصنوعی',
        'ابزار رایگان و پولی ویدیو',
        'ابزار رایگان و پولی ساخت ویدیو با هوش مصنوعی چیه'
      ],
      ['ai video', 'video generator', 'ساخت ویدیو', 'تولید ویدیو'],
      'برای شروع ویدیوی کوتاه، CapCut، Canva و Adobe Express ابزارهای رایگان با امکانات پولی دارند؛ Runway معمولاً اعتبار آزمایشی و طرح پولی ارائه می‌کند و دسترسی ابزارهایی مثل Sora به منطقه و اشتراک وابسته است. اول متن و shot list بنویس، کلیپ‌های ۵ تا ۱۰ ثانیه‌ای بساز، بعد تدوین، زیرنویس و صدا را جدا انجام بده. چهره و صدای واقعی را بدون رضایت شبیه‌سازی نکن و محتوای مصنوعی گمراه‌کننده را برچسب بزن.',
      'For a first short video, CapCut, Canva, and Adobe Express have free features plus paid upgrades; Runway commonly has trial credits and paid plans, while access to tools such as Sora depends on region and subscription. Verify current availability. Write a script and shot list, generate short clips, then edit, caption, and mix audio separately. Do not clone real faces or voices without consent, and label synthetic media when it could mislead.'
    ),
    fact(
      'ai_coding_tools',
      [
        'free and paid ai coding tools',
        'ai coding tools for a beginner',
        'which ai coding tools are good for a beginner',
        'what free ai coding option is suitable for a teenager',
        'now i want to learn coding with a free tool',
        'copilot vs free coding tools',
        'ابزار هوش مصنوعی برای کدنویسی',
        'ابزار رایگان کدنویسی با هوش مصنوعی'
      ],
      ['ai coding tools', 'copilot', 'replit', 'ابزار کدنویسی هوش مصنوعی'],
      'VS Code و افزونه‌های رایگان نقطه‌ی شروع خوبی‌اند؛ GitHub Copilot و Replit گزینه‌های رایگان محدود و طرح‌های پولی دارند و شرایطشان ممکن است عوض شود. برای نوجوان، Scratch و Code.org محیط‌های ساده‌تر و آموزشی‌اند. از ابزار بخواه کد را توضیح دهد و تست پیشنهاد کند، اما secret، رمز یا کد خصوصی را بدون مجوز نفرست. هر خط مهم را بخوان، اجرا و تست کن؛ کدی که نمی‌توانی توضیح بدهی هنوز مال تو نیست.',
      'VS Code and free extensions are a strong starting point; GitHub Copilot and Replit offer limited free options and paid plans whose terms can change. Scratch and Code.org are safer learning environments for younger beginners. Ask AI to explain code and suggest tests, but never paste secrets or private code without permission. Read, run, and test every important part; code you cannot explain is not ready to trust.'
    ),
    fact(
      'podcast_tools',
      [
        'how to make a podcast for free',
        'how can i make a podcast for free',
        'free and paid podcast tools',
        'podcast workflow for beginners',
        'ساخت پادکست رایگان',
        'چطور رایگان پادکست بسازم',
        'ابزار رایگان و پولی پادکست'
      ],
      ['podcast tools', 'make a podcast', 'ساخت پادکست'],
      'برای شروع رایگان، با میکروفن گوشی در اتاق نرم ضبط کن و در Audacity یا GarageBand ویرایش کن؛ Spotify for Creators معمولاً میزبانی رایگان دارد. Descript و Riverside امکانات رایگان محدود و طرح پولی برای متن‌محور، ضبط دور و همکاری دارند. طرح‌ها را بررسی کن. قالب، مخاطب و سه اپیزود آزمایشی را قبل از خرید تجهیزات بساز؛ موسیقی دارای حق نشر یا صدای شبیه‌سازی‌شده‌ی بدون رضایت استفاده نکن.',
      'For a free start, record with a phone in a soft room and edit in Audacity or GarageBand; Spotify for Creators commonly provides free hosting. Descript and Riverside offer limited free features and paid plans for transcript editing, remote recording, and collaboration. Verify current plans. Define the audience and make three pilot episodes before buying gear. Avoid copyrighted music and cloned voices without consent.'
    ),
    fact(
      'docs_slides_tools',
      [
        'free and paid tools for docs and slides',
        'what free and paid tools can make docs and slides',
        'how should i use ai to make documents and slides',
        'i want to make one simple slide for my family',
        'make documents and slides with ai',
        'google docs vs microsoft 365 vs libreoffice',
        'ابزار رایگان و پولی سند و اسلاید',
        'برای سند و اسلاید ابزار رایگان و پولی چی هست',
        'ساخت اسلاید با هوش مصنوعی'
      ],
      [
        'docs and slides',
        'google slides',
        'microsoft 365',
        'libreoffice',
        'سند و اسلاید'
      ],
      'Google Docs و Slides برای حساب شخصی معمولاً رایگان و مناسب همکاری‌اند؛ LibreOffice رایگان و آفلاین است؛ Microsoft 365 نسخه‌ی اشتراکی کامل و برنامه‌های وب محدودتر دارد؛ Canva نیز رایگان و Pro است. هوش مصنوعی را برای طرح کلی و بازنویسی به‌کار ببر، نه ساختن ادعای بی‌منبع. ابتدا ساختار، سپس محتوا و در آخر طراحی را انجام بده و دسترسی فایل را روی کمترین سطح لازم بگذار.',
      'Google Docs and Slides are generally free for personal accounts and strong for collaboration; LibreOffice is free and offline; Microsoft 365 provides full subscription apps with more limited web apps; Canva has free and Pro tiers. Use AI for outlines and revision, not unsupported claims. Build structure first, content second, design last, and grant the minimum file access needed.'
    ),
    fact(
      'young_ai_safety',
      [
        'how can a child use ai safely',
        'ai tools for a teenager',
        'which ai tools are appropriate for a teenager',
        'i am 14 how can i use ai to make an image safely',
        'how can a 14 year old use ai to make an image safely',
        'how can a 14-year-old use ai to make an image safely',
        'teach a young person to use ai',
        'استفاده امن نوجوان از هوش مصنوعی',
        'نوجوان چطور امن از هوش مصنوعی استفاده کنه',
        'ابزار هوش مصنوعی برای کودک'
      ],
      ['child ai safety', 'teen ai', 'هوش مصنوعی نوجوان', 'هوش مصنوعی کودک'],
      'برای کودک یا نوجوان، ابزار باید با شرط سنی، حساب خانواده یا مدرسه و نظارت بزرگسال سازگار باشد. نام کامل، مدرسه، نشانی، تصویر خصوصی و رمز نباید وارد شود. پاسخ هوش مصنوعی را با کتاب یا منبع آموزشی بررسی کنید و از آن برای توضیح و بازخورد استفاده کنید، نه انجام کامل تکلیف. برای تصویر و صدا، رضایت، کپی‌رایت و آزار همسالان را روشن آموزش دهید.',
      'For a child or teen, use tools compatible with their age, family or school accounts, and adult supervision. Never enter a full name, school, address, private image, or password. Verify answers with a book or educational source, and use AI for explanation and feedback rather than completing the assignment. Teach consent, copyright, deepfake risk, and peer safety for images and voices.'
    ),
    fact(
      'older_adult_ai_help',
      [
        'how can an older person learn ai',
        'how can an older person learn technology without getting scammed',
        'i am 72 and want to learn ai without being scammed',
        'how can a 72 year old learn ai without scams',
        'how can a 72-year-old learn ai without scams',
        'teach my elderly parent to use ai',
        'ai help for seniors',
        'آموزش هوش مصنوعی به سالمند',
        'چطور به یک سالمند استفاده از هوش مصنوعی یاد بدم',
        'کمک به سالمند برای استفاده از فناوری'
      ],
      [
        'older adult ai',
        'senior technology',
        'هوش مصنوعی سالمند',
        'فناوری سالمند'
      ],
      'برای سالمند از یک نیاز واقعی مثل نوشتن پیام، خلاصه‌کردن متن یا ساختن اسلاید شروع کنید. فونت و کنتراست را بالا ببرید، میان‌بر روی صفحه بگذارید و مراحل را روی کاغذ بنویسید. هر بار فقط یک کار و یک ابزار. تأکید کنید که هیچ پشتیبانی واقعی رمز، کد بانکی، نصب کنترل از راه دور یا پرداخت فوری نمی‌خواهد و پاسخ پزشکی یا مالی هوش مصنوعی باید با فرد متخصص بررسی شود.',
      'For an older adult, start with one real need such as drafting a message, summarizing a document, or making a slide. Increase text and contrast, add a home-screen shortcut, and print the steps. Teach one task and one tool at a time. Make clear that legitimate support never demands passwords, bank codes, remote-control software, or urgent payment, and verify medical or financial AI output with a qualified person.'
    )
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
