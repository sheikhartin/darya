/**
 * Darya - curated factual entries (tech domain).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'tech_stack_2026',
      keywords: [
        'بهترین تک استک',
        'بهترین تکنولوژی وب',
        'تکنولوژی های وب',
        'بهترین فریمورک وب',
        'تک استک برای توسعه وب',
        'best tech stack',
        'best web stack',
        'best web development stack',
        'what framework should i learn'
      ],
      weak: [
        'تک استک',
        'tech stack',
        'فریمورک',
        'framework',
        'فرانت اند',
        'frontend',
        'بک اند',
        'backend'
      ],
      weakSafe: true,
      hints: [
        'وب',
        'web',
        'توسعه',
        'development',
        'برنامه نویسی',
        'programming',
        'کدنویسی',
        'coding'
      ],
      fa: 'پاسخ درست «بستگی دارد» است، اما یک ترکیب پرطرفدار در سال‌های اخیر این است: React یا Next.js با TypeScript برای رابط کاربری، Tailwind برای استایل، و در سمت سرور Node.js، Go یا Python با یک دیتابیس رابطه‌ای مثل PostgreSQL. مهم‌تر از انتخاب قابلیت‌ها این است که یک پروژه‌ی واقعی را با همان ترکیب کامل کنی؛ کارفرماها دنبال نمونه‌کار می‌گردند نه دنبال فهرست فریمورک. اگر به هوش مصنوعی علاقه داری، کار با API های مدل‌های زبانی و دیتابیس‌های برداری هم یک مهارت رو به رشد است.',
      en: 'The honest answer is "it depends," but a popular combination in recent years is React or Next.js with TypeScript on the frontend, Tailwind for styling, and Node.js, Go, or Python with a relational database like PostgreSQL on the backend. More important than the choice is finishing one real project with a single stack; employers look for a portfolio, not a list of frameworks. If you are into AI, working with the APIs of modern AI tools and vector databases is a growing skill too.'
    },
    {
      id: 'ai_2026',
      keywords: [
        'هوش مصنوعی چیه',
        'هوش مصنوعی چیست',
        'هوش مصنوعی چطور کار می‌کنه',
        'chatgpt چیه',
        'what is artificial intelligence',
        'how does chatgpt work',
        'what is ai'
      ],
      weak: [
        'هوش مصنوعی',
        'chatgpt',
        'artificial intelligence',
        'ai model',
        'neural net'
      ],
      weakSafe: true,
      hints: [
        'یادگیری',
        'مدل',
        'ماشین',
        'ربات',
        'machine',
        'learning',
        'model',
        'bot'
      ],
      fa: 'هوش مصنوعی یعنی ساختن سیستم‌هایی که کارهایی شبیه به فکر کردن انسان انجام می‌دهند: تشخیص تصویر، ترجمه، پاسخ به سؤال. مدل‌های زبانی بزرگ مثل ChatGPT بر اساس میلیاردها متن آموزش می‌بینند و یاد می‌گیرند که کلمه‌ی بعدی را با احتمال پیش‌بینی کنند؛ به همین دلیل پاسخ‌هایشان روان به نظر می‌رسد اما ممکن است خطا کنند. از سال ۲۰۲۲ به بعد این ابزارها در کار، درس و خلاقیت همه‌گیر شده‌اند.',
      en: 'Artificial intelligence means building systems that do things resembling human thinking: recognizing images, translating, answering questions. Modern AI chatbots like ChatGPT train on billions of texts and learn to predict the next word, which is why their replies sound fluent but can still be wrong. Since 2022 these tools have become mainstream in work, study, and creativity.'
    },
    {
      id: 'programming_start',
      keywords: [
        'برنامه نویسی رو از کجا شروع کنم',
        'اولین زبان برنامه نویسی',
        'چطور برنامه نویس بشم',
        'how to start programming',
        'first programming language',
        'how do i learn to code'
      ],
      weak: [
        'برنامه نویسی',
        'programming',
        'کدنویسی',
        'coding',
        'پایتون',
        'python',
        'جاوااسکریپت',
        'javascript'
      ],
      weakSafe: true,
      hints: ['شروع', 'یادگیری', 'یاد بگیرم', 'start', 'learn', 'اول', 'first'],
      fa: 'یک مسیر پرطرفدار این است: با پایتون یا جاوااسکریپت شروع کن، چون ساده‌اند و کتابخانه و جامعه‌ی بزرگی دارند. اصل مهم، ساختن است: به جای تماشای دوره‌های بی‌پایان، هر درس را با یک پروژه‌ی کوچک همراه کن. برنامه‌نویسی مثل رانندگی است، از تمرین یاد گرفته می‌شود، نه از خواندن کتاب راهنما.',
      en: 'A popular path is to start with Python or JavaScript: both are approachable and have huge libraries and communities. The key principle is building: instead of watching endless courses, pair every lesson with a small project. Coding is like driving: you learn it by practice, not by reading the manual.'
    },
    {
      id: 'backend_frontend',
      keywords: [
        'فرق بک اند و فرانت اند',
        'بک اند یعنی چی',
        'فرانت اند یعنی چی',
        'frontend vs backend',
        'what is a backend developer',
        'what does a frontend developer do'
      ],
      weak: [
        'بک اند',
        'فرانت اند',
        'frontend',
        'backend',
        'بک‌اند',
        'فرانت‌اند'
      ],
      weakSafe: true,
      hints: ['برنامه نویس', 'توسعه', 'developer', 'development', 'وب', 'web'],
      fa: 'فرانت‌اند همان چیزی است که کاربر می‌بیند و با آن کار می‌کند: ظاهر، دکمه‌ها و تعاملات صفحه که با HTML، CSS و جاوااسکریپت ساخته می‌شود. بک‌اند سمت سرور است: منطق، دیتابیس، احراز هویت و API ها که با زبان‌هایی مثل Node.js، Python یا Go نوشته می‌شود. فول‌استک یعنی توانایی کار در هر دو طرف.',
      en: 'The frontend is what the user sees and interacts with: the layout, buttons, and page behavior built with HTML, CSS, and JavaScript. The backend is the server side: logic, databases, authentication, and APIs, written in languages like Node.js, Python, or Go. A full-stack developer works on both sides.'
    },
    {
      id: 'data_science',
      keywords: [
        'مسیر دیتاساینس',
        'دیتاساینس چیه',
        'علم داده چیه',
        'یادگیری ماشین رو از کجا شروع کنم',
        'data science career',
        'machine learning path',
        'how to become a data scientist'
      ],
      weak: [
        'دیتاساینس',
        'علم داده',
        'یادگیری ماشین',
        'data science',
        'machine learning'
      ],
      weakSafe: true,
      hints: [
        'شروع',
        'مسیر',
        'یادگیری',
        'راه',
        'start',
        'path',
        'career',
        'learn'
      ],
      fa: 'مسیر معمول دیتاساینس: اول ریاضی و آمار پایه (احتمال، رگرسیون)، بعد کار با پایتون و کتابخانه‌های pandas و numpy، بعد یادگیری ماشین با scikit-learn و در نهایت شبکه‌های عصبی با PyTorch یا TensorFlow. تمرین با پروژه‌های واقعی روی داده‌های عمومی خیلی مهم‌تر از مدرک است؛ کارفرماها به دنبال کسی می‌گردند که بتواند از داده سؤال درست بپرسد و جوابش را تفسیر کند.',
      en: 'A typical data science path: solid basics in math and statistics (probability, regression), then Python with pandas and numpy, then machine learning with scikit-learn, and finally neural networks with PyTorch or TensorFlow. Practicing on real projects with public datasets matters far more than a certificate; employers want someone who can ask a good question of data and interpret the answer.'
    },
    {
      id: 'coding_agents',
      keywords: [
        'دستیار کدنویسی',
        'کدنویسی با هوش مصنوعی',
        'claude code',
        'cursor چیه',
        'github copilot',
        'ai coding assistant',
        'coding with ai'
      ],
      weak: ['copilot', 'cursor', 'کدنویس', 'coding assistant'],
      weakSafe: true,
      hints: ['هوش مصنوعی', 'برنامه نویسی', 'ai', 'code', 'کد'],
      fa: 'دستیارهای کدنویسی هوش مصنوعی مثل GitHub Copilot، Cursor و Claude Code به برنامه‌نویس کمک می‌کنند کد را سریع‌تر بنویسد، باگ پیدا کند و کد تکراری تولید نکند. اما آن‌ها جای تفکر برنامه‌نویس را نمی‌گیرند: کدی که تولید می‌کنند را باید بخوانی، بفهمی و تست کنی. در سال‌های اخیر این ابزارها از یک افزونه به بخش اصلی جریان کار توسعه‌دهنده‌ها تبدیل شده‌اند.',
      en: 'AI coding assistants such as GitHub Copilot, Cursor, and Claude Code help developers write code faster, find bugs, and avoid boilerplate. But they do not replace the developer’s thinking: you still need to read, understand, and test the code they generate. In recent years these tools have moved from a nice plugin to a core part of many developers’ workflow.'
    },
    {
      id: 'make_money',
      keywords: [
        'چطور پول دربیارم',
        'چطور پول در بیارم',
        'راه کسب درآمد',
        'کسب درآمد از برنامه نویسی',
        'درآمد از اینترنت',
        'پول دربیارم',
        'پول در بیارم',
        'پول درآرم',
        'پول در بیارم از اینترنت',
        'از اینترنت پول دربیارم',
        'how to make money online',
        'side income for developers',
        'how to earn money as a programmer',
        'how to make money as a programmer',
        'how to make money programming'
      ],
      weak: [
        'کسب درآمد',
        'درآمد',
        'make money',
        'earn money',
        'side income',
        'فریلنس'
      ],
      weakSafe: true,
      hints: [
        'برنامه نویسی',
        'کار',
        'شغل',
        'اینترنت',
        'پروژه',
        'programming',
        'work',
        'freelance',
        'remote'
      ],
      fa: 'چند مسیر واقعی برای یک توسعه‌دهنده: اول، فریلنسری روی پلتفرم‌های بین‌المللی مثل Upwork و Fiverr که به رزومه و نمونه‌کار نیاز دارد؛ دوم، کار راه دور (ریموت) برای شرکت‌های خارجی که این روزها برای توسعه‌دهنده‌های باتجربه رایج است؛ سوم، ساختن محصول کوچک خودت مثل یک سرویس یا اپ که در طول زمان درآمد غیرفعال بسازد. قدم اول مشترک همه‌ی این‌ها یک چیز است: یک نمونه‌کار قوی از پروژه‌های واقعی.',
      en: 'Several real paths exist for a developer: freelance on international platforms like Upwork and Fiverr, which requires a strong portfolio; remote work for companies abroad, increasingly common for experienced developers; or building your own small product such as a service or app that can generate passive income over time. The shared first step is one thing: a solid portfolio of real projects.'
    },
    {
      id: 'career_advice',
      keywords: [
        'مشاوره شغلی',
        'تغییر مسیر شغلی',
        'چطور شغل پیدا کنم',
        'رزومه چطور بنویسم',
        'مصاحبه کاری',
        'career advice',
        'how to get a job',
        'how to write a resume',
        'job interview tips'
      ],
      weak: [
        'رزومه',
        'مصاحبه کاری',
        'رزومه',
        'resume',
        'interview',
        'career',
        'شغلی'
      ],
      weakSafe: true,
      hints: ['کار', 'شغل', 'برنامه نویس', 'job', 'work', 'developer'],
      fa: 'برای پیدا کردن کار، اول جای درست را هدف بگیر: شغلی که از مهارت فعلی‌ات استفاده کند و رشد تدریجی بدهد، نه فقط حقوق بیشتر. رزومه باید نتیجه‌محور باشد: به جای «مسئول فلان کار بودم» بنویس «فلان پروژه را با فلان ابزار ساختم و نتیجه فلان شد». برای مصاحبه، چند پروژه‌ی کوچک را خودت تمرین کن و درباره‌ی سوال‌های رفتاری از قبل فکر کن. شبکه‌سازی (حتی در شبکه‌های اجتماعی فنی) معمولاً از ارسال رزومه‌ی کور مؤثرتر است.',
      en: 'To land a job, first target the right position: one that uses your current skills and offers gradual growth, not just a higher salary. Make your resume result-oriented: instead of "responsible for X," write "built X with Y and the outcome was Z." For interviews, practice a few small projects yourself and think through behavioral questions in advance. Networking, even in technical online communities, usually beats cold applications.'
    },
    {
      id: 'master_degree',
      keywords: [
        'ارزش کارشناسی ارشد',
        'ارشد بخونم یا نه',
        'کارشناسی ارشد می‌ارزه',
        'is a master degree worth it',
        'should i do a masters'
      ],
      weak: ['کارشناسی ارشد', 'master degree', 'masters', 'ارشد'],
      weakSafe: true,
      hints: ['تحصیل', 'دانشگاه', 'شغل', 'university', 'career', 'study'],
      fa: 'ارزش کارشناسی ارشد به حوزه و هدف تو بستگی دارد. در برنامه‌نویسی و مهندسی نرم‌افزار، نمونه‌کار و تجربه معمولاً از مدرک مهم‌ترند و خیلی از شرکت‌های خارجی مدرک را شرط نمی‌دانند. در حوزه‌هایی مثل علم داده، تحقیق و برخی مشاغل دولتی یا دانشگاهی، مدرک ارشد و دکتری وزن واقعی دارد. اگر ارشد را فقط برای «فرار از بیکاری» شروع می‌کنی، اول ببین آیا همان دو سال را می‌توانی صرف مهارت و نمونه‌کار کنی.',
      en: 'A master’s degree is worth what it buys in your field and for your goal. In software engineering, a portfolio and experience usually outweigh the degree, and many international companies do not require one. In fields like data science, research, and some government or academic roles, the degree carries real weight. If you are starting a master’s only to escape unemployment, ask whether those two years could instead go into skills and a portfolio.'
    },
    {
      id: 'freelance_iran',
      keywords: [
        'فریلنسری از ایران',
        'دریافت پول از خارج',
        'فریلنسری چیه',
        'freelancing from iran',
        'freelance work'
      ],
      weak: ['فریلنسری', 'freelancing', 'freelance'],
      weakSafe: true,
      hints: [
        'ایران',
        'پول',
        'درآمد',
        'کار',
        'iran',
        'money',
        'work',
        'remote'
      ],
      fa: 'فریلنسری یعنی فروش مهارت به صورت پروژه‌ای به کارفرماهای مختلف به جای استخدام ثابت. برای شروع از ایران، چند نکته‌ی عملی: نمونه‌کار انگلیسی و رزومه‌ی حرفه‌ای بساز، روی پلتفرم‌های بین‌المللی که با شرایط ایرانی‌ها سازگارند حساب باز کن، و از پروژه‌های کوچک شروع کن تا امتیاز و نظر مثبت بگیری. نکته‌ی مهم: همیشه شرایط دریافت وجه و قوانین کشورت را بررسی کن و درباره‌ی مسائل مالی، نظر یک متخصص را هم داشته باش.',
      en: 'Freelancing means selling your skill project by project to different clients instead of holding one job. To start, build a strong English portfolio and professional resume, open accounts on international platforms that work in your region, and begin with small projects to earn ratings and reviews. Always check the payment options and the regulations in your country, and treat financial questions with professional advice.'
    },
    {
      id: 'remote_work',
      keywords: [
        'کار راه دور',
        'ریموت ورک',
        'کار از راه دور',
        'remote work',
        'working from home',
        'work from home'
      ],
      weak: ['ریموت', 'دورکاری', 'دور کاری', 'remote', 'home office'],
      weakSafe: true,
      hints: ['کار', 'شغل', 'work', 'job', 'شرکت'],
      fa: 'کار راه دور (ریموت) یعنی کار برای یک شرکت یا کارفرما بدون حضور فیزیکی در دفتر. از سال ۲۰۲۰ به این سو این سبک کار کاملاً رایج شده و برای توسعه‌دهنده‌ها فرصت کار با شرکت‌های خارجی را باز کرده است. موفقیت در آن به نظم شخصی، ارتباط نوشتاری واضح و جلسه‌های منظم بستگی دارد؛ ولی خیلی از شرکت‌ها حالا انتظار حضور ترکیبی (هیبرید) دارند.',
      en: 'Remote work means working for an employer without being physically in an office. Since 2020 it has become completely mainstream and opened international opportunities for developers. Success depends on personal discipline, clear written communication, and regular check-ins, though many companies now expect a hybrid model.'
    },
    {
      id: 'iran_economy',
      keywords: [
        'اقتصاد ایران چرا',
        'تورم یعنی چی',
        'تورم ایران',
        'چرا گرونی',
        'irans economy',
        'inflation in iran',
        'why is everything expensive'
      ],
      weak: ['تورم', 'گرونی', 'اقتصاد', 'inflation', 'economy', 'قیمت'],
      weakSafe: true,
      hints: ['ایران', 'پول', 'بازار', 'iran', 'money'],
      fa: 'تورم یعنی بالا رفتن عمومی و مداوم قیمت‌ها که قدرت خرید پول را کم می‌کند. در ایران، ترکیبی از عوامل ساختاری مثل وابستگی به نفت، تحریم‌ها، کسری بودجه و انتظارات تورمی باعث شده تورم بالا و مزمن شود. این یک بحث پیچیده‌ی اقتصادی است و تحلیل دقیق آن تخصص می‌خواهد؛ اما برای زندگی روزمره، مدیریت هزینه، پس‌انداز به ارز یا دارایی‌های ضد تورم و بالا بردن درآمد، ابزارهای معمول مردم است.',
      en: 'Inflation is a general, sustained rise in prices that erodes the purchasing power of money. In Iran, a combination of structural factors such as oil dependence, sanctions, budget deficits, and inflation expectations has produced high and persistent inflation. It is a complex economic issue that needs expert analysis; in daily life, people typically respond with tighter budgeting, savings in inflation-resistant assets, and higher income.'
    },
    {
      id: 'emigration',
      keywords: [
        'مهاجرت چطور',
        'راه های مهاجرت',
        'مهاجرت به کانادا',
        'مهاجرت کاری',
        'emigration from iran',
        'how to immigrate',
        'study abroad'
      ],
      weak: ['مهاجرت', 'مهاجر', 'emigrat', 'immigrat', 'ویزا', 'visa'],
      weakSafe: true,
      hints: [
        'ایران',
        'خارج',
        'کانادا',
        'آلمان',
        'تحصیل',
        'کار',
        'iran',
        'abroad',
        'study',
        'work'
      ],
      fa: 'مهاجرت موضوعی است که ذهن خیلی از جوانان ایرانی را درگیر کرده. مسیرهای اصلی: تحصیلی (با ویزای دانشجویی)، کاری (با جاب‌آفر از یک شرکت خارجی)، سرمایه‌گذاری و خانوادگی. برای توسعه‌دهنده‌ها مسیر کاری واقعی‌تر است: رزومه و نمونه‌کار انگلیسی، یادگیری زبان مقصد، و جست‌وجوی مستقیم در سایت‌های کاریابی بین‌المللی. هر مسیری هزینه، زمان و ریسک خودش را دارد؛ تصمیم را با تحقیق و نه با تبلیغ بگیر.',
      en: 'Emigration is a topic on many young Iranians’ minds. The main routes are study (student visa), work (a job offer from an employer abroad), investment, and family sponsorship. For developers the work route is the most realistic: an English resume and portfolio, learning the destination language, and applying directly on international job boards. Every path has its own cost, time, and risk; decide from research, not from hype.'
    },
    {
      id: 'military_service',
      keywords: [
        'سربازی',
        'معافیت سربازی',
        'خرید سربازی',
        'سربازی چیه',
        'military service iran'
      ],
      weak: ['سربازی', 'سرباز', 'معافیت', 'endorsement'],
      weakSafe: true,
      hints: ['ایران', 'پسر', 'دانشگاه', 'iran', 'service'],
      fa: 'سربازی (خدمت سربازی) برای مردان ایرانی معمولاً دو سال تعهد نظامی است که در سن‌های مشخص باید انجام شود. راه‌های معافیت و کوتاه‌شدن دوره (مثل تحصیل، شرایط پزشکی، کفالت و برخی شرایط خاص) وجود دارد، اما قوانینش مرتب تغییر می‌کند و جزئیاتش تخصصی است. برای اطلاعات دقیق و به‌روز باید به منابع رسمی و کارشناسان مراجعه کنی؛ من نمی‌توانم جایگزین آن‌ها باشم.',
      en: 'Military service in Iran is a roughly two-year obligation for young men that must be completed at the designated age. Exemptions and shortened terms exist for reasons such as education, medical conditions, family support, and special cases, but the rules change often and the details are specialized. For accurate, current information you need official sources and experts; I cannot stand in for them.'
    },
    {
      id: 'iran_internet',
      keywords: [
        'فیلترینگ',
        'وی پی ان',
        'اینترنت ایران',
        'اینترنت نسل جدید',
        'vpn iran',
        'internet filtering iran'
      ],
      weak: ['فیلترینگ', 'وی پی ان', 'vpn', 'فیلتر'],
      weakSafe: true,
      hints: ['ایران', 'اینترنت', 'تلگرام', 'اینستاگرام', 'iran', 'internet'],
      fa: 'اینترنت در ایران تحت فیلترینگ است: پلتفرم‌های بزرگی مثل اینستاگرام، ایکس (توییتر)، تلگرام و یوتیوب سال‌هاست غیرقابل دسترس مستقیم هستند و بیشتر کاربران با ابزارهای عبور از فیلتر مثل وی‌پی‌ان و پراکسی به آن‌ها دسترسی پیدا می‌کنند. این وضعیت بحث‌های زیادی درباره‌ی آزادی اطلاعات و تأثیرش روی کسب‌وکارها دارد. برای استفاده از ابزارهای دور زدن فیلتر، حتماً شرایط قانونی و ریسک‌هایش را بسنج.',
      en: 'The internet in Iran is filtered: major platforms such as Instagram, X (Twitter), Telegram, and YouTube have been blocked for years, and most users reach them through circumvention tools like VPNs and proxies. This situation fuels ongoing debate about information freedom and its effect on businesses. If you use circumvention tools, be aware of the legal context and the risks in your situation.'
    },
    {
      id: 'buying_headphones',
      keywords: [
        'هندزفری بخرم',
        'کدوم هندزفری',
        'هدفون بخرم',
        'بهترین هدفون',
        'بهترین هندزفری',
        'buy headphones',
        'which headphones',
        'which earbuds',
        'best earbuds'
      ],
      weak: ['هندزفری', 'هدفون', 'هندزفری', 'earbuds', 'headphones', 'headset'],
      weakSafe: true,
      hints: ['خرید', 'قیمت', 'بخر', 'بودجه', 'buy', 'price', 'budget'],
      fa: 'راهنمای خرید هندزفری بر اساس بودجه:\n۱) اول نیازت را مشخص کن: برای مکالمه و تماس، گوش دادن به موسیقی، یا بازی؟ هر کدام اولویت متفاوتی دارد.\n۲) بی‌سیم یا باسیم: بی‌سیم راحتی دارد ولی باتری و تأخیر (لاتنسی) مهم است؛ باسیم در همین بودجه صدای بهتر و بدون شارژ می‌دهد.\n۳) در هر بودجه‌ای سه چیز را مقایسه کن: کیفیت صدا و میکروفون، دوام و گارانتی، و پشتیبانی در ایران.\n۴) نظر کاربران واقعی را در چند فروشگاه معتبر ببین، نه فقط مشخصات روی جعبه.\n۵) اگر بودجه‌ات محدود است، برندهای پرفروش میان‌رده در همان رنج قیمت را با هم مقایسه کن؛ تفاوت اصلی در میکروفون و دوام است نه برچسب قیمت.',
      en: 'Headphone buying guide by budget:\n1) Define your need first: calls and voice, music listening, or gaming? Each has different priorities.\n2) Wireless or wired: wireless is convenient but battery and latency matter; wired gives better sound for the same budget and never needs charging.\n3) At any budget compare three things: sound and microphone quality, build and warranty, and local support.\n4) Read real user reviews on a few trusted stores, not just the specs on the box.\n5) With a tight budget, compare the best-selling mid-range brands in the same price band; the real differences are microphone and durability, not the price tag.'
    },
    {
      id: 'buying_guide',
      keywords: [
        'راهنمایی خرید',
        'راهنمای خرید',
        'چطور خرید کنم',
        'چجوری خرید کنم',
        'buying guide',
        'buying advice',
        'how to buy'
      ],
      weak: ['خرید', 'خریدم', 'قیمت', 'buy', 'shopping', 'price'],
      weakSafe: true,
      hints: ['خرید', 'بودجه', 'قیمت', 'buy', 'budget', 'price'],
      fa: 'یک روش ساده و حرفه‌ای برای هر خریدی:\n۱) نیاز را مشخص کن: این کالا برای چه کاری است و هر روز چقدر استفاده می‌شود؟\n۲) بودجه‌ی واقعی تعیین کن و یک سقف ثابت بگذار؛ قبل از دیدن گزینه‌ها، نه بعد از آن.\n۳) دو یا سه گزینه در رنج بودجه انتخاب کن و فقط همان‌ها را مقایسه کن؛ مقایسه‌ی بی‌نهایت گیج می‌کند.\n۴) نظرات کاربران واقعی و تجربه‌های خرید را بخوان، مخصوصاً درباره‌ی دوام و خدمات پس از فروش.\n۵) گارانتی و پشتیبانی در ایران را جدی بگیر؛ گاهی ارزان‌ترین گزینه بعداً گران‌تر تمام می‌شود.\n۶) قیمت‌ها در ایران سریع تغییر می‌کنند؛ به‌جای تکیه به یک رقم ثابت (مثلاً «زیر ۲۰ میلیون»)، قیمت لحظه‌ای را در چند فروشگاه معتبر مقایسه کن تا تصمیمت از روز اول درست باشد.',
      en: 'A simple, professional method for any purchase:\n1) Define the need: what is this item for and how often will it be used daily?\n2) Set a realistic budget and fix a hard ceiling before you look at options, not after.\n3) Pick two or three candidates in the budget band and compare only those; endless comparison causes confusion.\n4) Read real user reviews and purchase experiences, especially about durability and after-sales service.\n5) Take warranty and local support seriously; sometimes the cheapest option ends up costing more later.\n6) Prices change quickly in Iran; instead of trusting one fixed figure, compare live prices across a few trusted stores so your decision holds up.'
    },
    {
      id: 'vpn_choices',
      keywords: [
        'فیلترشکن خوب',
        'بهترین فیلترشکن',
        'کدوم فیلترشکن',
        'وی پی ان خوب',
        'بهترین وی پی ان',
        'best vpn',
        'which vpn',
        'vpn recommendation',
        'good vpn',
        'recommend a vpn'
      ],
      weak: ['فیلترشکن', 'وی پی ان', 'vpn', 'فیلتر'],
      weakSafe: true,
      hints: ['اینترنت', 'فیلتر', 'vpn', 'اینستاگرام', 'تلگرام'],
      fa: 'برای انتخاب یک ابزار عبور از فیلتر، چند چیز را حتماً بسنج:\n۱) سرعت و پایداری در زمان‌های شلوغ؛ یک ابزار ارزان که مدام قطع می‌شود ارزش ندارد.\n۲) سیاست حفظ حریم خصوصی: آیا لاگ (گزارش) فعالیت‌هایت نگه می‌دارد یا نه؟\n۳) قیمت و روش پرداخت: خیلی از سرویس‌های رایگان با داده‌های کاربران تأمین مالی می‌شوند.\n۴) پشتیبانی و به‌روزرسانی: ابزاری که فعالانه نگهداری می‌شود، در بلندمدت جواب می‌دهد.\n۵) توجه کن استفاده از ابزارهای دور زدن فیلتر در ایران ریسک حقوقی دارد؛ شرایط و قوانین را خودت بسنج. نمی‌توانم برند خاصی را تضمین کنم چون وضعیت هر ابزار سریع عوض می‌شود.',
      en: 'When choosing a circumvention tool, weigh these carefully:\n1) Speed and stability at peak hours; a cheap tool that keeps dropping out is not worth it.\n2) Privacy policy: does it keep logs of your activity or not?\n3) Price and payment method: many free services are funded by user data.\n4) Support and updates: a tool that is actively maintained lasts longer.\n5) Note that using circumvention tools in Iran carries legal risk; assess the rules yourself. I cannot guarantee a specific brand because each tool situation changes quickly.'
    },
    {
      id: 'buying_laptop',
      keywords: [
        'لپ تاپ بخرم',
        'لپ‌تاپ بخرم',
        'کدوم لپ تاپ',
        'کدوم لپ‌تاپ',
        'بهترین لپ تاپ',
        'بهترین لپ‌تاپ',
        'laptop to buy',
        'which laptop',
        'best laptop',
        'buy a laptop'
      ],
      weak: ['لپ تاپ', 'لپ‌تاپ', 'لپتاپ', 'laptop', 'notebook'],
      weakSafe: true,
      hints: ['خرید', 'قیمت', 'بخر', 'بودجه', 'buy', 'price', 'budget'],
      fa: 'راهنمای خرید لپ‌تاپ بر اساس کاربرد:\n۱) اول مشخص کن برای چه می‌خواهی: کارهای اداری و وب، برنامه‌نویسی، طراحی، یا بازی؟ وزن و باتری برای جابجایی، و توان پردازشی برای کار سنگین مهم است.\n۲) رم و حافظه را دست کم نگیر: حداقل ۸ گیگ رم و ۲۵۶ گیگ SSD برای کار روزمره، و ۱۶ گیگ رم برای برنامه‌نویسی و طراحی.\n۳) پردازنده و کارت گرافیک: برای کارهای سبک نسل جدید i5 یا Ryzen 5 کافی است؛ برای بازی و رندر، کارت گرافیک مجزا لازم داری.\n۴) وزن و باتری: اگر هر روز جابجا می‌شود، زیر ۱.۵ کیلوگرم و باتری ۸+ ساعت را ببین.\n۵) گارانتی و خدمات پس از فروش در ایران را جدی بگیر؛ صفحه‌کلید فارسی و پشتیبانی قطعات هم مهم است.',
      en: 'Laptop buying guide by use case:\n1) Define the need first: office work and web, programming, design, or gaming? Weight and battery matter for portability, processing power for heavy work.\n2) Do not undersell RAM and storage: at least 8 GB RAM and a 256 GB SSD for daily work, 16 GB RAM for programming and design.\n3) CPU and GPU: a current-gen i5 or Ryzen 5 is enough for light work; gaming and rendering need a dedicated graphics card.\n4) Weight and battery: if you carry it daily, look for under 1.5 kg and 8+ hours of battery.\n5) Take warranty and after-sales service in Iran seriously; a Persian keyboard layout and parts support also matter.'
    },
    {
      id: 'buying_phone',
      keywords: [
        'گوشی بخرم',
        'کدوم گوشی',
        'بهترین گوشی',
        'موبایل بخرم',
        'phone to buy',
        'which phone',
        'best phone',
        'buy a phone',
        'which smartphone'
      ],
      weak: ['گوشی', 'موبایل', 'phone', 'smartphone'],
      weakSafe: true,
      hints: ['خرید', 'قیمت', 'بخر', 'بودجه', 'buy', 'price', 'budget'],
      fa: 'راهنمای خرید گوشی بر اساس بودجه:\n۱) نیازت را مشخص کن: دوربین، بازی، کار روزمره یا باتری قوی؟ هیچ گوشی‌ای در همه چیز بهترین نیست.\n۲) در رنج قیمت‌ات دو یا سه گزینه را با هم مقایسه کن؛ تفاوت واقعی معمولاً در دوربین، باتری و به‌روزرسانی نرم‌افزار است.\n۳) رم و حافظه: ۸ گیگ رم و ۱۲۸ گیگ حافظه برای استفاده معمولی کافی است؛ اگر فیلم و بازی زیاد داری، ۲۵۶ گیگ بگیر.\n۴) گارانتی و قطعات در ایران را جدی بگیر؛ گوشی ارزان بدون گارانتی ممکن است بعداً گران تمام شود.\n۵) نظر کاربران واقعی را بخوان، نه فقط مشخصات روی جعبه؛ باتری و دوربین در تجربه واقعی با تبلیغات فرق دارد.',
      en: 'Phone buying guide by budget:\n1) Define your need: camera, gaming, daily use, or strong battery? No phone is best at everything.\n2) Compare two or three options in your price band; the real differences are usually camera, battery, and software updates.\n3) RAM and storage: 8 GB RAM and 128 GB storage are enough for normal use; go 256 GB if you store lots of media.\n4) Take warranty and parts availability in Iran seriously; a cheap phone without warranty can cost more later.\n5) Read real user reviews, not just the specs on the box; battery and camera differ from the ads in real use.'
    },
    {
      id: 'buying_camera',
      keywords: [
        'دوربین بخرم',
        'کدوم دوربین',
        'بهترین دوربین',
        'دوربین عکاسی بخرم',
        'camera to buy',
        'which camera',
        'best camera',
        'buy a camera'
      ],
      weak: ['دوربین', 'عکاسی', 'camera', 'mirrorless', 'dslr'],
      weakSafe: true,
      hints: [
        'خرید',
        'قیمت',
        'بخر',
        'بودجه',
        'عکاسی',
        'buy',
        'price',
        'budget'
      ],
      fa: 'راهنمای خرید دوربین بر اساس سطح:\n۱) اول سطحت را مشخص کن: گوشی فعلاً کافی است یا جدی عکاسی می‌کنی؟ برای شروع، دوربین‌های بدون آینه (میرورلس) میان‌رده انتخاب متعادلی است.\n۲) لنز از بدنه مهم‌تر است: یک بدنه ساده با لنز خوب، از بدنه گران با لنز ضعیف بهتر عکس می‌گیرد.\n۳) به حسگر و ویدیو توجه کن: اگر ویدیو هم می‌گیری، به رزولوشن و لرزشگیر داخلی نگاه کن.\n۴) وزن و سیستم: دوربینی که هر روز با خودت ببری، همان است که واقعاً استفاده می‌کنی؛ سنگین و حرفه‌ای همیشه بهتر نیست.\n۵) لوازم جانبی و لنزهای موجود در بازار ایران را بررسی کن؛ پشتیبانی لنز و باتری در انتخاب نهایی مهم است.',
      en: 'Camera buying guide by skill level:\n1) Decide your level first: is your phone enough for now, or are you serious about photography? For a start, a mid-range mirrorless camera is a balanced choice.\n2) The lens matters more than the body: a simple body with a good lens beats an expensive body with a weak lens.\n3) Pay attention to the sensor and video: if you also shoot video, check resolution and in-body stabilization.\n4) Weight and system: the camera you carry daily is the one you actually use; heavier and more professional is not always better.\n5) Check which lenses and accessories are available in the Iranian market; lens and battery support matters in the final choice.'
    },
    {
      id: 'buying_marketplaces',
      keywords: [
        'کجا بخرم',
        'از کجا بخرم',
        'کدوم سایت بخرم',
        'کجا خرید کنم',
        'کجا قیمت',
        'قیمت ها رو مقایسه',
        'قیمتها رو مقایسه',
        'مقایسه قیمت',
        'where to buy',
        'which site should i buy from',
        'compare prices',
        'price comparison',
        'best price'
      ],
      weak: [
        'دیجی کالا',
        'digikala',
        'ترب',
        'torob',
        'divar',
        'دیوار',
        'sheypoor',
        'شیپور'
      ],
      weakSafe: true,
      hints: [
        'خرید',
        'قیمت',
        'فروشگاه',
        'سایت',
        'buy',
        'price',
        'store',
        'online'
      ],
      fa: 'برای خرید در ایران چند مسیر اصلی هست: دیجی‌کالا و ترب برای کالای نو و مقایسه‌ی قیمت، دیوار و شیپور برای خرید دست‌دوم با بودجه‌ی کمتر، و آمازون برای کالاهای خارجی اگر ارسالش به ایران ممکن باشد. قیمت‌ها در ایران سریع تغییر می‌کنند؛ پس به‌جای تکیه به یک رقم ثابت، قیمت لحظه‌ای را در دو یا سه فروشگاه مقایسه کن. اگر بودجه‌ات محدود است، جست‌وجوی دست‌دوم در دیوار و شیپور گاهی تا نصف قیمت نو می‌رسد.',
      en: 'For buying in Iran there are a few main routes: Digikala and Torob for new goods and price comparison, Divar and Sheypoor for used items on a tighter budget, and Amazon for foreign goods when shipping to Iran is possible. Prices in Iran change quickly, so instead of trusting one fixed figure, compare live prices across two or three stores. If your budget is tight, searching used listings on Divar or Sheypoor can sometimes reach half the price of new.'
    },
    {
      id: 'app_stores_iran',
      keywords: [
        'کافه بازار',
        'مایکت',
        'اپ استور',
        'فروشگاه اپ',
        'دانلود اپ',
        'نصب اپ',
        'کجا دانلود',
        'از کجا دانلود',
        'cafe bazaar',
        'myket',
        'app store',
        'download apps',
        'install apps',
        'where to download apps'
      ],
      weak: ['اندروید', 'android', 'گوگل پلی', 'google play'],
      weakSafe: true,
      hints: ['دانلود', 'نصب', 'اپ', 'برنامه', 'download', 'install', 'app'],
      fa: 'برای دانلود اپ روی اندروید در ایران چند گزینه هست: گوگل‌پلی برای اپ‌های بین‌المللی (در صورت دسترسی)، و برای کاربران ایرانی کافه بازار و مایکت که بدون نیاز به فیلترشکن کار می‌کنند و نسخه‌های داخلی اپ‌ها را دارند. خیلی از اپ‌های ایرانی فقط در کافه بازار یا مایکت منتشر می‌شوند، پس اگر اپی را در گوگل‌پلی پیدا نکردی، حتماً همان‌جا را ببین.',
      en: 'For downloading apps on Android in Iran there are a few options: Google Play for international apps (when accessible), and for Iranian users Cafe Bazaar and Myket, which work without any VPN and carry local versions of apps. Many Iranian apps are only published on Cafe Bazaar or Myket, so if you cannot find an app on Google Play, check there.'
    },
    {
      id: 'eliza_chatbot',
      keywords: [
        'الیزا',
        'ایلیزا',
        'چت بات الیزا',
        'الیزا چیه',
        'الیزا چی بود',
        'اولین چت بات',
        'eliza',
        'elyza',
        'eliza chatbot',
        'who created eliza',
        'who made eliza',
        'first chatbot',
        'joseph weizenbaum',
        'weizenbaum'
      ],
      weak: ['وایزنبام', 'weizenbaum', 'doctor script', 'mit'],
      weakSafe: true,
      hints: [
        'چت بات',
        'هوش مصنوعی',
        'ربات',
        'تاریخچه',
        'chatbot',
        'ai',
        'history',
        'origin'
      ],
      fa: 'الیزا (ELIZA) نخستین چت‌بات تاریخ است که جوزف وایزنبام در سال ۱۹۶۶ در آزمایشگاه هوش مصنوعی MIT ساخت. الیزا با الگوهای ساده کار می‌کرد: برنامه‌ی DOCTOR جمله‌ی کاربر را با جابه‌جایی ضمیرها به یک سؤال بازمی‌گرداند، مثلاً «غمگینم» به «چرا غمگینی؟» تبدیل می‌شد. نکته‌ی جالب تاریخ: خود وایزنبام از اینکه خیلی از کاربران به الیزا وابسته می‌شدند و با آن مثل یک درمانگر واقعی حرف می‌زدند شگفت‌زده شد. همان دلیلی است که دریا هم با روش بازتاباندن حرف‌های تو طراحی شده است.',
      en: 'ELIZA was the first chatbot in history, built by Joseph Weizenbaum at the MIT AI lab in 1966. It worked with simple pattern matching: the DOCTOR script turned the user sentence into a question by swapping pronouns, so "I am sad" became "Why are you sad?". The fascinating part of the story is that Weizenbaum was genuinely surprised how emotionally attached users became, opening up to ELIZA about their lives. That is exactly why Darya is designed around reflecting your own words back to you.'
    },
    {
      id: 'developer_salary',
      keywords: [
        'درآمد برنامه‌نویس',
        'درآمد برنامه نویس',
        'حقوق برنامه‌نویس',
        'حقوق برنامه نویس',
        'درآمد برنامه نویسی',
        'برنامه‌نویس تو ایران چقدر',
        'برنامه نویس تو ایران چقدر',
        'developer salary',
        'developer salary in iran',
        'programmer salary',
        'how much do developers earn',
        'how much do programmers earn',
        'how much does a developer earn',
        'how much does a programmer earn'
      ],
      weak: ['برنامه‌نویس', 'برنامه نویس', 'developer', 'programmer'],
      weakSafe: false,
      hints: ['درآمد', 'حقوق', 'دستمزد', 'salary', 'income', 'earning', 'چقدر'],
      fa: 'درآمد برنامه‌نویس‌ها در ایران خیلی متفاوت است و به شهر، سطح تجربه و نوع همکاری بستگی دارد: کارمند حقوق‌بگیر (شرکت‌های داخلی)، دورکاری با شرکت‌های خارجی (که معمولاً بیشترین درآمد را دارد) و فریلنسری. به‌جای عدد ثابت، بهتر است به دو اصل نگاه کنی: اول، حقوق دلاری و ریموت برای توسعه‌دهنده‌های باتجربه می‌تواند چند برابر حقوق داخلی باشد؛ دوم، در هر مسیری، نمونه‌کار و سابقه‌ی پروژه واقعی تعیین‌کننده‌ی پیشنهاد مالی است، نه فقط مدرک.',
      en: 'Developer salaries in Iran vary widely depending on the city, experience level, and type of engagement: salaried roles at local companies, remote work for foreign companies (usually the highest earning path), and freelancing. Instead of one fixed number, two principles matter more: remote USD-paying roles for experienced developers can be several times local salaries, and in every path a portfolio of real projects, not just a degree, determines the offer.'
    },
    {
      id: 'react_vs_vue',
      keywords: [
        'ری اکت یا ویو',
        'ری‌اکت یا ویو',
        'ری اکت و ویو',
        'ری‌اکت و ویو',
        'بین ری اکت و ویو',
        'بین ری‌اکت و ویو',
        'react or vue',
        'react vs vue',
        'vue or react',
        'vue vs react',
        'react and vue',
        'which is better react or vue'
      ],
      weak: ['ری‌اکت', 'ری اکت', 'react', 'vue', 'ویو'],
      weakSafe: false,
      hints: [
        'کدوم بهتره',
        'کدام بهتر',
        'بهتره',
        'یاد بگیرم',
        'فریم‌ورک',
        'framework'
      ],
      fa: 'ری‌اکت و ویو هر دو فریم‌ورک‌های جاوااسکریپتی قدرتمند برای رابط کاربری‌اند و «بهتر» به هدف تو بستگی دارد. ری‌اکت اکوسیستم بزرگ‌تری دارد، شغل‌های بیشتری برایش هست و انعطاف بالا می‌دهد (خودت کتابخانه‌ها را انتخاب می‌کنی). ویو یادگیری آسان‌تری دارد، مستندات روان‌تری دارد و برای شروع سریع و پروژه‌های متوسط عالی است. اگر هدف‌ات استخدام سریع است: ری‌اکت. اگر تازه‌کاری و می‌خواهی سریع نتیجه ببینی: ویو. هر دو مسیر درستی‌اند و هیچ‌کدام اشتباه نیست.',
      en: 'React and Vue are both powerful JavaScript frameworks for building user interfaces, and better depends on your goal. React has a larger ecosystem and more job openings, with high flexibility since you pick the libraries yourself. Vue is easier to learn, has friendlier documentation, and is excellent for a quick start and medium projects. If your goal is fast hiring: React. If you are a beginner who wants to see results quickly: Vue. Both are valid paths, and neither is a wrong choice.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
