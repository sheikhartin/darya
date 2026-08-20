/**
 * Darya - Iran-aware work, money pressure, migration, conscription,
 * relationships, and appearance literacy.
 *
 * Market prices, wages, visa rules, and military-service rules are live
 * information. This shelf gives decision frameworks and directs users to
 * current official sources instead of freezing a number into the app.
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
      'quick_start_jobs',
      [
        'what job can i start quickly with little money',
        'low cost jobs i can start now',
        'i need a job this week with no experience',
        'چه کاری را با پول کم زود شروع کنم',
        'شغل کم هزینه برای شروع سریع',
        'این هفته بدون سابقه کار میخوام'
      ],
      [
        'quick start job',
        'low cost job',
        'job with no experience',
        'شغل کم هزینه',
        'کار بدون سابقه',
        'شروع سریع کار'
      ],
      'برای شروع سریع، از چیزی که همین حالا داری فهرست بساز: زمان، توان جسمی، گوشی یا رایانه، وسیله‌ی رفت‌وآمد، زبان، درس، تعمیر، فروش یا مراقبت. مسیرهای کم‌هزینه می‌توانند نگهبانی، فروشندگی، انبار و بسته‌بندی، خدمات اداری، نظافت، شاگردی فنی، تدریس خصوصی، ترجمه، ورود داده، تولید محتوای ساده، همراهی سالمند یا انجام کار محلی باشند؛ شرایط و مجوز هرکدام را بررسی کن. سه گزینه را با چهار معیار بسنج: زمان تا اولین درآمد، هزینه‌ی شروع، ایمنی و امکان رشد. برای یک گزینه رزومه‌ی یک‌صفحه‌ای و نمونه‌ی کوچک بساز و همان روز به چند کارفرمای واقعی مراجعه کن. برای وعده‌ی استخدام پول نده.',
      'Start by inventorying what you already have: time, physical capacity, a phone or computer, transport, language, school subjects, repair, sales, or care skills. Low-entry paths can include guarding, retail, warehouse and packing work, office support, cleaning, trade apprenticeships, tutoring, translation, data entry, simple content work, elder support, or neighborhood services, subject to local rules and safeguarding. Compare three options by time to first income, startup burden, safety, and room to grow. Make a one-page resume and one small proof of work, then contact several real employers that day. Never pay for the promise of a job.',
      ['income', 'experience', 'start', 'درآمد', 'تجربه', 'شروع']
    ),
    fact(
      'security_guard_work',
      [
        'how do i become a security guard',
        'what does a security guard do',
        'is guarding a good starter job',
        'چطور نگهبان یا حراست شوم',
        'وظایف نگهبان چیست',
        'نگهبانی برای شروع کار خوبه'
      ],
      [
        'security guard job',
        'guarding job',
        'security officer work',
        'شغل نگهبانی',
        'کار حراست',
        'نگهبان'
      ],
      'کار نگهبانی معمولاً شامل کنترل ورود، گشت، بررسی دوربین یا هشدار، ثبت رویداد، ارتباط آرام با مراجعه‌کننده و خبرکردن مسئول یا خدمات اضطراری است؛ نگهبان جای پلیس یا امدادگر نیست. برای شروع، آگهی و هویت شرکت، قرارداد، بیمه، ساعت و محل شیفت، آموزش، رفت‌وآمد شبانه و مسئولیت دقیق را بررسی کن. گزارش‌نویسی، توجه، ارتباط بدون تنش و کمک‌های اولیه امتیازند. حمل سلاح، بازرسی، بازداشت یا استفاده از زور تابع قانون و مجوز روز است؛ بدون آموزش و اختیار روشن وارد آن نشو.',
      'Guard work commonly involves access control, patrols, alarm or camera monitoring, incident notes, calm communication with visitors, and calling supervisors or emergency services. A guard is not a substitute for police or medical responders. Before accepting a role, verify the company, contract, insurance, shift and site, training, safe night transport, and exact duties. Clear report writing, attention, de-escalation, and first aid are valuable. Weapons, searches, detention, and force depend on current law, licensing, and employer policy; never assume authority you were not trained and authorized to use.',
      ['patrol', 'shift', 'report', 'گشت', 'شیفت', 'گزارش']
    ),
    fact(
      'security_guard_shift_safety',
      [
        'security guard night shift safety',
        'how should a guard handle conflict',
        'guard incident report checklist',
        'ایمنی شیفت شب نگهبانی',
        'نگهبان چطور تنش را مدیریت کند',
        'چک لیست گزارش حادثه نگهبانی'
      ],
      [
        'guard safety',
        'night guard shift',
        'security incident report',
        'ایمنی نگهبان',
        'شیفت شب نگهبانی',
        'گزارش حادثه حراست'
      ],
      'پیش از شیفت، راه ارتباط، نقاط کور، خروج اضطراری، روشنایی، تجهیزات سالم و زمان تحویل را بشناس. در تنش فاصله‌ی امن را نگه دار، صدایت را پایین و دستورها را کوتاه کن، راه خروج را نبند و زود پشتیبانی بخواه؛ برای اثبات شجاعت خطر را بالا نبر. در گزارش فقط زمان، مکان، آنچه خودت دیدی یا شنیدی، اقدام و افراد مطلع را بنویس و حدس را از واقعیت جدا کن. خستگی شدید، شیفت تنها بدون ارتباط، دستور غیرقانونی یا نبود تجهیزات هشدارهای شغلی‌اند و باید با مسئول مربوط مطرح شوند.',
      'Before a shift, know communication channels, blind spots, emergency exits, lighting, working equipment, and handover procedure. During conflict, keep distance, lower your voice, use short clear directions, avoid blocking exits, and call support early; do not escalate danger to prove courage. In a report, separate facts from assumptions and record time, place, what you personally observed, actions taken, and witnesses. Severe fatigue, isolated work with no communication, unlawful instructions, or missing safety equipment are employment red flags to raise through the proper channel.',
      ['night', 'conflict', 'first aid', 'شب', 'تنش', 'کمک های اولیه']
    ),
    fact(
      'job_search_no_experience',
      [
        'how do i get a job with no experience',
        'resume when i have never worked',
        'entry level job search plan',
        'بدون سابقه چطور کار پیدا کنم',
        'رزومه وقتی هیچ جا کار نکردم',
        'برنامه پیدا کردن شغل سطح ابتدایی'
      ],
      [
        'no experience job',
        'entry level resume',
        'first job search',
        'کار بدون سابقه',
        'رزومه بدون تجربه',
        'اولین شغل'
      ],
      'نبود سابقه یعنی باید مدرک توانایی بسازی، نه اینکه چیزی برای گفتن نداری. رزومه را با مهارت، پروژه‌ی شخصی، کار داوطلبانه، مسئولیت خانوادگی قابل‌انتقال، درس مرتبط و نتیجه‌های کوچک پر کن. برای هر شغل یک نمونه بساز: فایل مرتب، پاسخ پشتیبانی، گزارش شیفت، صفحه‌ی ساده یا تعمیر مستند. درخواست را با واژه‌های همان شرح شغل تطبیق بده و از آدم‌های واقعی بازخورد بگیر. هدف هفته را روی تعداد اقدام قابل‌کنترل بگذار، نه تعداد قبولی؛ ردشدن داده‌ی مسیر است، نه حکم ارزش تو.',
      'No experience means you need evidence of ability, not that you have nothing to say. Build the resume around skills, personal projects, volunteering, transferable family responsibilities, relevant study, and small outcomes. Create one proof for each target role: an organized file, sample support reply, shift report, simple page, or documented repair. Tailor applications to the actual job description and ask real people for feedback. Set a weekly goal around actions you control rather than acceptances. Rejection is information about the process, not a verdict on your worth.',
      ['resume', 'portfolio', 'apply', 'رزومه', 'نمونه کار', 'درخواست']
    ),
    fact(
      'job_scam_defense',
      [
        'how do i spot a fake job offer',
        'remote job scam warning signs',
        'the employer asked me to pay for equipment',
        'چطور آگهی استخدام جعلی را بفهمم',
        'نشانه های کلاهبرداری کار آنلاین',
        'کارفرما گفته برای تجهیزات پول بدهم'
      ],
      [
        'fake job offer',
        'job scam',
        'employment scam',
        'استخدام جعلی',
        'کلاهبرداری کاری',
        'آگهی کار جعلی'
      ],
      'پیشنهاد شغلی مشکوک معمولاً بدون مصاحبه‌ی واقعی عجله می‌کند، فقط در پیام‌رسان ناشناس حرف می‌زند، اطلاعات بانکی یا هویتی را زود می‌خواهد، درآمد غیرواقعی وعده می‌دهد یا می‌گوید اول هزینه‌ی ثبت‌نام، آموزش، تجهیزات یا آزادکردن دستمزد را بده. شرکت و آگهی را از وب‌سایت و شماره‌ی رسمی مستقل بررسی کن؛ نشانی فرستنده و قرارداد را دقیق بخوان. چک، رسید یا واریز ظاهری را دلیل قطعی وصول ندان و پولی را برای «برگشت اضافه‌پرداخت» منتقل نکن. کارفرمای معتبر برای حق استخدام از متقاضی پول نمی‌گیرد.',
      'A suspicious offer often rushes without a real interview, communicates only through an unverified messenger, requests identity or bank data too early, promises implausible income, or asks you to pay for registration, training, equipment, or release of wages. Verify the company and vacancy independently through its official site and known contact details, and inspect the sender and contract. A check, receipt, or apparent deposit is not final proof of funds, and you should never return an alleged overpayment. A legitimate employer does not charge an applicant for the right to be hired.',
      ['pay upfront', 'equipment', 'verify', 'پیش پرداخت', 'تجهیزات', 'بررسی']
    ),
    fact(
      'microbusiness_validation',
      [
        'how do i start a tiny business with little money',
        'validate a business idea without much capital',
        'small service business first customer',
        'چطور با پول کم کسب و کار کوچک شروع کنم',
        'ایده کسب و کار را بدون سرمایه زیاد تست کنم',
        'اولین مشتری خدمات کوچک'
      ],
      [
        'tiny business',
        'low capital business',
        'validate business idea',
        'کسب و کار کوچک',
        'کسب و کار کم سرمایه',
        'اعتبارسنجی ایده'
      ],
      'برای شروع کم‌هزینه، خدمت را پیش از خرید ابزار بفروش. یک مشتری مشخص و یک مشکل تکراری انتخاب کن، با چند نفر صحبت کن و پیشنهاد کوچکی با نتیجه، زمان تحویل و مرز روشن بنویس. ابتدا با ابزار موجود و یک سفارش آزمایشی کار کن؛ بعد از دریافت بازخورد و پرداخت واقعی توسعه بده. هزینه‌ی مواد، رفت‌وآمد، زمان، خرابی و برگشت کار را ثبت کن. مجوز، مالیات، بهداشت، بیمه و قانون محلی را بررسی کن. وام پرریسک برای ایده‌ای که هنوز مشتری ندارد، سرمایه‌گذاری نیست.',
      'For a low-cost start, sell the service before buying equipment. Choose one specific customer and recurring problem, interview several people, and offer a small deliverable with clear outcome, timing, and boundaries. Use what you already have for a pilot, then expand only after real feedback and payment. Track materials, travel, time, rework, and refunds. Verify local licensing, tax, health, insurance, and employment rules. High-risk debt for an idea with no customer evidence is not validation.',
      ['customer', 'pilot', 'service', 'مشتری', 'آزمایشی', 'خدمت']
    ),
    fact(
      'inflation_household_plan',
      [
        'how do i cope with inflation in iran',
        'household plan for rising prices',
        'my salary loses value every month',
        'با تورم ایران چطور زندگی را مدیریت کنم',
        'برنامه خانوار برای گرانی',
        'حقوقم هر ماه ارزشش را از دست میدهد'
      ],
      [
        'cope with inflation',
        'rising prices plan',
        'income losing value',
        'مدیریت تورم',
        'گرانی و بودجه',
        'کاهش قدرت خرید'
      ],
      'تورم مزمن فقط مشکل «کم خرج‌کردن» نیست و تقصیر اخلاقی فرد هم نیست. یک برنامه‌ی دفاعی سه لایه بساز: اول خوراک، مسکن، دارو، رفت‌وآمد و قبض‌های حیاتی؛ دوم مذاکره‌ی زودهنگام درباره‌ی بدهی، اجاره یا مهلت؛ سوم افزایش تاب‌آوری درآمد با مهارت یا کار جانبی قابل‌دوام. هزینه‌ها را با مقدار و دفعات مصرف بسنج، جایگزین و خرید دست‌دوم را بررسی و قیمت روز را از چند منبع مقایسه کن؛ دریا رقم ثابت نمی‌دهد چون سریع بی‌اعتبار می‌شود. برای جبران تورم سراغ قرض، ترید اهرمی یا وعده‌ی سود تضمینی نرو و پول ضروری را در دارایی پرنوسان نگذار.',
      'Chronic inflation is not merely a failure to spend less, and it is not a moral fault. Build a three-layer defense: protect food, housing, medicine, transport, and essential bills; negotiate debt, rent, or deadlines early; then improve income resilience with a sustainable skill or side role. Compare costs by quantity and frequency, consider substitutes and used goods, and check live quotes from several sources. Darya does not freeze a product price into an offline answer because it becomes misleading quickly. Do not answer inflation with risky debt, leverage, guaranteed-return claims, or essential money in volatile assets.',
      ['iran', 'budget', 'essential', 'ایران', 'بودجه', 'ضروری']
    ),
    fact(
      'unstable_income_cashflow',
      [
        'how do i budget with irregular income',
        'freelance income changes every month',
        'cash flow plan for gig work',
        'با درآمد نامنظم چطور بودجه بندی کنم',
        'درآمد فریلنسری هر ماه فرق دارد',
        'برنامه نقدینگی کار پروژه ای'
      ],
      [
        'irregular income budget',
        'unstable income',
        'gig cash flow',
        'درآمد نامنظم',
        'بودجه فریلنسری',
        'نقدینگی پروژه ای'
      ],
      'با درآمد نامنظم، بودجه را روی ماه خوب نبند. میانگین چند ماه را ببین اما کف محافظه‌کارانه را مبنا بگیر. پول ورودی را به هزینه‌ی حیاتی، تعهد نزدیک، مالیات یا بیمه‌ی لازم، ذخیره‌ی کم‌کم و هزینه‌ی اختیاری تقسیم کن. برای مشتری تازه محدوده و تحویل را مکتوب کن و اگر قانونی و امن است پرداخت مرحله‌ای بخواه تا ریسک بی‌پرداختی کم شود. چند منبع درآمد کوچک می‌تواند نوسان را کم کند، اما پراکندگی زیاد هم زمان و تمرکز را می‌خورد. اگر عددها دیگر جواب نمی‌دهند، زودتر با طلبکار یا فرد متخصص مذاکره کن.',
      'With irregular income, do not build the budget around a good month. Review several months, but plan from a conservative floor. Split incoming money among essentials, near-term obligations, required tax or insurance, a gradually built buffer, and discretionary spending. Put scope and delivery in writing for a new client and use lawful staged payments when practical to reduce nonpayment risk. Several modest income sources can smooth volatility, but too many can consume all attention. If the numbers no longer work, speak with creditors or a qualified adviser early rather than hiding the problem.',
      ['freelance', 'gig', 'budget', 'فریلنس', 'پروژه', 'بودجه']
    ),
    fact(
      'unemployment_recovery_plan',
      [
        'i have no job what should i do first',
        'unemployment action plan',
        'i was laid off and have no hope',
        'بیکارم اول چه کار کنم',
        'برنامه عملی برای بیکاری',
        'اخراج شدم و امید ندارم'
      ],
      [
        'unemployment plan',
        'jobless plan',
        'laid off recovery',
        'برنامه بیکاری',
        'بیکارم',
        'بعد از اخراج'
      ],
      'بیکاری هم فشار مالی است و هم ضربه به هویت؛ شرم توصیف دقیقی از واقعیت نیست. اول وضعیت فوری را روشن کن: خوراک، مسکن، دارو، بدهی و هر حمایت قانونی یا خانوادگی. بعد روز را دو بخش کن: اقدام درآمدی نزدیک مثل تماس، معرفی و کار موقت؛ و ساختن مسیر بهتر مثل مهارت، نمونه‌کار و درخواست هدفمند. همه‌ی روز را به جست‌وجو تبدیل نکن؛ خواب، حرکت و تماس انسانی سوخت همین کارند. اگر چند هفته هیچ پاسخ نگرفتی، عنوان هدف، رزومه، کانال و نمونه‌کارت را با یک نفر بازبینی کن. اگر ناامیدی به فکر آسیب به خود رسید، جست‌وجوی کار را متوقف و همین حالا از یک انسان امن یا خدمات بحران کمک بگیر.',
      'Unemployment is both financial pressure and an identity shock; shame is not an accurate account of what happened. Clarify immediate needs first: food, housing, medicine, debt, and any lawful public or family support. Then split the day between near-income actions, such as calls, referrals, and temporary work, and path-building actions, such as a skill, proof of work, and targeted applications. Do not turn every waking hour into job search; sleep, movement, and human contact fuel it. If weeks bring no response, review the target role, resume, channel, and portfolio with another person. If hopelessness becomes self-harm thinking, pause the job plan and contact a trusted person or crisis service now.',
      ['jobless', 'laid off', 'hope', 'بیکاری', 'اخراج', 'امید']
    ),
    fact(
      'education_or_work',
      [
        'should i study or get a job',
        'education vs work decision',
        'university or vocational training',
        'درس بخوانم یا کار پیدا کنم',
        'تحصیل یا کار کدام بهتر است',
        'دانشگاه یا آموزش فنی'
      ],
      [
        'study or work',
        'education vs job',
        'university or trade',
        'درس یا کار',
        'تحصیل یا شغل',
        'دانشگاه یا فنی'
      ],
      'این تصمیم دوگانه‌ی کامل نیست. اول نقش هدف را بررسی کن: آیا مدرک یا مجوز قانونی می‌خواهد، یا نمونه‌کار و مهارت کافی است؟ سپس زمان، هزینه‌ی فرصت، درآمد فوری، کیفیت دوره، احتمال تکمیل و امکان کارآموزی را بسنج. سه مسیر را مقایسه کن: تحصیل تمام‌وقت، کار همراه آموزش پاره‌وقت، یا یک دوره‌ی فنی کوتاه با کارآموزی. پیش از تعهد بلند، با چند شاغل همان حوزه حرف بزن و یک تجربه‌ی کوچک واقعی بگیر. دانشگاه می‌تواند در پژوهش و حرفه‌های دارای مجوز ضروری باشد؛ برای بعضی کارها شاگردی و نمونه‌کار مسیر سریع‌تر و صادقانه‌تری است.',
      'This is not always a binary choice. Start with the target role: does it legally require a degree or license, or will skill and proof of work qualify you? Compare time, opportunity cost, immediate income, program quality, completion likelihood, and access to placements. Consider three paths: full-time study, work plus part-time learning, or short vocational training with apprenticeship. Before a long commitment, speak with several people doing the job and try a small real task. University can be essential for research and licensed professions; in other fields, apprenticeship and a portfolio may be the faster honest route.',
      ['degree', 'vocational', 'career', 'مدرک', 'فنی', 'شغل']
    ),
    fact(
      'vocational_training',
      [
        'which practical trade can i learn quickly',
        'vocational job path with low budget',
        'apprenticeship or online course',
        'چه مهارت فنی را زود یاد بگیرم',
        'مسیر شغل فنی با بودجه کم',
        'شاگردی یا دوره آنلاین'
      ],
      [
        'vocational training',
        'trade apprenticeship',
        'practical skill job',
        'آموزش فنی',
        'شاگردی',
        'مهارت عملی'
      ],
      'مهارت فنی را با بازار محلی و توان بدنی انتخاب کن، نه فقط فهرست شغل‌های پردرآمد. تعمیر لوازم و موبایل، برق و تأسیسات، جوشکاری، نجاری، دوخت، آرایش، آشپزی، پشتیبانی رایانه و نصب تجهیزات نمونه‌اند و هرکدام ایمنی، ابزار و مجوز متفاوت دارند. از مشاهده یا شاگردی کوتاه شروع کن، آموزش ایمنی را جلوتر از سرعت بگذار و پیش از خرید ابزار گران مطمئن شو کار روزمره را تحمل می‌کنی. مدرک تنها کافی نیست؛ عکس یا گزارش کار واقعی، نظر استادکار و نظم در تحویل اعتماد می‌سازد.',
      'Choose a trade from local demand and your physical fit, not only lists of high-paying jobs. Appliance or phone repair, electrical and HVAC work, welding, carpentry, sewing, hair services, cooking, computer support, and equipment installation are examples with different safety, tool, and licensing needs. Start with observation or a short apprenticeship, put safety training ahead of speed, and confirm that you tolerate the daily work before buying major equipment. A certificate alone is not proof; documented work, a supervisor reference, and reliable delivery build trust.',
      ['trade', 'apprentice', 'safety', 'فنی', 'استادکار', 'ایمنی']
    ),
    fact(
      'migration_decision',
      [
        'should i migrate or stay',
        'how do i decide whether to leave my country',
        'compare moving city and moving abroad',
        'مهاجرت کنم یا بمانم',
        'چطور تصمیم بگیرم از کشور بروم',
        'مهاجرت به شهر دیگر یا خارج'
      ],
      [
        'migrate or stay',
        'migration decision',
        'move abroad decision',
        'مهاجرت یا ماندن',
        'تصمیم مهاجرت',
        'رفتن یا ماندن'
      ],
      '«رفتن یا ماندن» را به چند مسئله جدا کن: امنیت و آزادی، کار و درآمد، خانواده و مراقبت، سلامت، زبان، وضعیت خدمت، امکان قانونی، تحمل غربت و برنامه‌ی برگشت. برای هر گزینه بهترین، معمولی‌ترین و بدترین سناریو را بنویس و ببین کدام ریسک برگشت‌پذیرتر است. جابه‌جایی به شهر یا استان دیگر، دوره‌ی آزمایشی، کار از راه دور یا درخواست از داخل می‌تواند بین ماندن کامل و مهاجرت خارجی پل بسازد. ویزا، مرز، انتقال پول و اقامت اطلاعات زنده‌اند؛ فقط منبع رسمی کشور مقصد و متخصص دارای مجوز را ملاک اقدام قرار بده. تبلیغ «تضمینی» تصمیم‌یار نیست.',
      'Break migrate or stay into separate questions: safety and freedom, work and income, family and care, health, language, conscription status, lawful eligibility, tolerance for isolation, and a return plan. For each option write the best, ordinary, and worst case, then compare which risks are more reversible. Moving to another city or province, a time-limited trial, remote work, or applying from home can bridge the false choice between staying forever and moving abroad. Visas, borders, money transfer, and residence rules are live facts; act only on current official destination sources and qualified licensed advice. Guaranteed migration advertising is not evidence.',
      ['country', 'city', 'legal', 'کشور', 'شهر', 'قانونی']
    ),
    fact(
      'migration_no_money',
      [
        'how can i migrate with no money',
        'i want to move abroad but i am broke',
        'migration plan on a very low budget',
        'بدون پول چطور مهاجرت کنم',
        'میخوام برم خارج ولی پول ندارم',
        'برنامه مهاجرت با بودجه خیلی کم'
      ],
      [
        'migrate with no money',
        'low budget migration',
        'broke and move abroad',
        'مهاجرت بدون پول',
        'مهاجرت کم هزینه',
        'پول مهاجرت ندارم'
      ],
      'مهاجرت بین‌المللی واقعاً بدون هزینه نیست؛ کسی که خلافش را تضمین می‌کند ممکن است از فشار تو سوءاستفاده کند. اگر پول نداری، هدف اول «آمادگی قابل‌انتقال» است: مدرک هویتی معتبر، زبان، رزومه و نمونه‌کار، سابقه‌ی قابل اثبات و بررسی مسیرهای رسمی بورسیه، معافیت هزینه، حمایت کارفرما یا خانواده. از داخل برای کار یا پذیرش اقدام کن و هزینه، حق کار، مسکن اولیه و برنامه‌ی شکست را پیش از حرکت روی کاغذ بیاور. قاچاق، مدرک جعلی، داستان ساختگی یا بدهی خطرناک راه امنی نیست. شاید جابه‌جایی داخلی یا ساختن درآمد ابتدا، مرحله‌ی واقع‌بینانه‌تر باشد.',
      'International migration is not literally cost-free; anyone guaranteeing that may be exploiting pressure. With no money, first build portable readiness: valid identity documents, language, a resume and portfolio, verifiable experience, and research into official scholarships, fee waivers, employer sponsorship, or lawful family routes. Apply from home where possible and map fees, work rights, initial housing, and a failure plan before travel. Smuggling, false documents, fabricated claims, or dangerous debt are not safe pathways. An internal move or income-building phase may be the more realistic first step.',
      ['scholarship', 'sponsor', 'documents', 'بورسیه', 'حامی', 'مدارک']
    ),
    fact(
      'move_city_first',
      [
        'should i move to another city for a better life',
        'how do i test a move before relocating',
        'move city with little money',
        'برای زندگی بهتر به شهر دیگری بروم',
        'قبل جابه جایی شهر چطور امتحان کنم',
        'با پول کم به شهر دیگری بروم'
      ],
      [
        'move to another city',
        'test relocation',
        'internal migration',
        'مهاجرت داخلی',
        'جابه جایی شهر',
        'رفتن به شهر دیگر'
      ],
      'جابه‌جایی داخلی معمولاً برگشت‌پذیرتر از مهاجرت خارجی است، اما بدون برنامه هم می‌تواند فشار را بیشتر کند. پیش از انتقال، کار و مسکن را از منبع مستقل بررسی کن، رفت‌وآمد و خدمات درمانی را بسنج و اگر شد یک اقامت کوتاه یا شروع با اتاق مشترک امن را امتحان کن. ذخیره‌ی برگشت، نسخه‌ی مدارک، تماس اضطراری و قرارداد روشن داشته باش. وعده‌ی شفاهی کار یا خانه را کافی ندان. اگر دلیل رفتن خشونت خانوادگی است، مقصد را از فرد آزارگر پنهان نگه‌داشتن یا خروج ناگهانی می‌تواند موضوع ایمنی تخصصی باشد و بهتر است با یک فرد امن یا مرکز حمایت برنامه‌ریزی شود.',
      'An internal move is often more reversible than international migration, but an unplanned move can deepen pressure. Verify work and housing independently, check transport and health services, and when possible test the city through a short stay or safe shared housing. Keep a return reserve, document copies, an emergency contact, and clear agreements. A verbal promise of a job or room is not enough. If the move is about family violence, secrecy and departure timing can be specialized safety issues; plan with a trusted person or local support service rather than confronting the abuser alone.',
      ['housing', 'job', 'trial', 'مسکن', 'کار', 'آزمایشی']
    ),
    fact(
      'migration_scam_safety',
      [
        'how do i avoid immigration scams',
        'an agent guarantees me a visa',
        'unhcr visa agent scam',
        'چطور از کلاهبرداری مهاجرتی دوری کنم',
        'موسسه ویزا را تضمین کرده',
        'واسطه ویزای unhcr'
      ],
      [
        'immigration scam',
        'guaranteed visa',
        'fake migration agent',
        'کلاهبرداری مهاجرتی',
        'ویزای تضمینی',
        'موسسه مهاجرتی جعلی'
      ],
      'هیچ واسطه‌ای نتیجه‌ی ویزا یا پرونده را تضمین نمی‌کند. نام و مجوز مشاور را در فهرست رسمی کشور مقصد بررسی کن، قرارداد و سیاست بازپرداخت را بخوان و پرداخت و مدرک را فقط از کانال قابل پیگیری بده. درخواست رمز، کد، اصل مدرک بدون رسید، داستان‌سازی، اطلاعات نادرست یا پول برای «ارتباط داخل سفارت» هشدار است. اطلاعات برنامه را مستقیماً در سایت دولت یا سفارت مقصد تطبیق بده. UNHCR اعلام می‌کند خدماتش رایگان است و با آژانس یا دلال برای ویزای کشور ثالث کار نمی‌کند؛ ادعای خلاف را گزارش کن و اطلاعات شخصی نده.',
      'No intermediary can guarantee a visa or case outcome. Verify an adviser and license in the destination’s official register, read the contract and refund policy, and send money or documents only through traceable channels. Requests for passwords, codes, original documents without receipts, fabricated stories, false information, or payment for an inside embassy contact are red flags. Match every program directly against the destination government or embassy site. UNHCR states that its services are free and it does not use travel agents or brokers to provide third-country visas; report contrary claims and do not share personal data.',
      ['agent', 'visa', 'unhcr', 'واسطه', 'ویزا', 'سفارت']
    ),
    fact(
      'iran_military_service_current',
      [
        'how long is military service in iran now',
        'current iran conscription rules',
        'iran military service exemptions',
        'الان سربازی ایران چند ماه است',
        'قانون فعلی خدمت وظیفه ایران',
        'شرایط معافیت سربازی ایران'
      ],
      [
        'iran military service',
        'iran conscription',
        'سربازی ایران',
        'خدمت وظیفه ایران',
        'نظام وظیفه'
      ],
      'در ایران خدمت وظیفه برای بسیاری از مردان مشمول اجباری است، اما مدت یک عدد ثابت برای همه نیست. اطلاعیه‌های رسمی سال‌های اخیر بازه‌هایی را بر اساس بومی یا غیربومی‌بودن، منطقه و نوع مأموریت گزارش کرده‌اند؛ دوره‌های عادی می‌توانند تا حدود ۲۱ ماه باشند، بعضی مناطق کوتاه‌تر و برخی امریه‌های غیرنظامی تا ۲۴ ماه. کاهش «میانگین» با مدت قطعی هر فرد یکی نیست. تحصیل، پزشکی، کفالت، تأهل، فرزند و طرح‌های مهارتی ممکن است اثر داشته باشند، اما شرایط و اجرا تغییر می‌کند. برای تصمیم حقوقی یا سفر، فقط آخرین اطلاعیه‌ی سازمان وظیفه عمومی فراجا، ستاد کل و مشاوره‌ی حقوقی معتبر را بررسی کن؛ دریا آفلاین است و وضعیت پرونده یا معافیت تو را تأیید نمی‌کند.',
      'Iran requires compulsory service from many eligible men, but duration is not one fixed number for everyone. Recent official announcements have described ranges based on local or nonlocal status, posting, and duty type: ordinary service can extend to roughly 21 months, some operational postings are shorter, and some nonmilitary amriye assignments can reach 24 months. A stated average is not an individual guarantee. Education, medical review, family-care status, marriage, children, and skill programs may affect a case, but implementation changes. For a legal, travel, or career decision, check the latest Public Conscription Organization and General Staff announcements and qualified Iranian legal guidance. Offline Darya cannot confirm your file or exemption.',
      ['duration', 'exemption', 'official', 'مدت', 'معافیت', 'رسمی']
    ),
    fact(
      'military_service_opportunity_plan',
      [
        'military service will waste my career',
        'how do i avoid losing skills during conscription',
        'plan career around iran military service',
        'سربازی فرصت های شغلیم را نابود میکند',
        'سربازی فرصت های شغلیم را نا بود میکند',
        'سربازی فرصت های شغلی',
        'در سربازی چطور مهارتم را از دست ندهم',
        'برنامه شغلی قبل و بعد سربازی'
      ],
      [
        'conscription career gap',
        'skills during military service',
        'سربازی و فرصت شغلی',
        'وقفه سربازی',
        'مهارت در سربازی'
      ],
      'این نگرانی واقعی است: وقفه‌ی خدمت می‌تواند زمان، درآمد، تحصیل و ارتباط حرفه‌ای را عقب بیندازد و گفتن «فقط مثبت فکر کن» منصفانه نیست. آنچه کنترل داری را سه بخش کن. پیش از اعزام، وضعیت قانونی و تاریخ‌ها را رسمی روشن، مدارک و نمونه‌کار را مرتب و ارتباط با کارفرما یا استاد را حفظ کن. حین خدمت فقط اگر مقررات و انرژی اجازه می‌دهد یک مهارت سبک، یادداشت پروژه یا مطالعه‌ی آفلاین را ادامه بده؛ امنیت و خواب اولویت دارند. نزدیک پایان، رزومه را با مهارت‌های واقعی مثل نظم، گزارش یا کار فنی به‌روز و از قبل شبکه را گرم کن. برای دورزدن خدمت یا جعل مدرک راهنمایی نمی‌دهم؛ درباره‌ی معافیت، امریه یا کسری فقط منبع رسمی و مشاور معتبر قابل اتکاست.',
      'The concern is real: service can interrupt income, study, professional momentum, and relationships, and simply saying stay positive is unfair. Divide what you can control into three phases. Before service, clarify status and dates officially, organize documents and portfolio, and keep contact with employers or teachers. During service, only when rules and energy allow, maintain one lightweight skill, project notebook, or offline study habit; safety and sleep come first. Near discharge, update the resume with genuine skills such as reporting, reliability, or technical work and reconnect before the gap ends. I will not advise evasion or false documents; exemptions, amriye, and reductions require current official information and qualified advice.',
      ['career', 'skills', 'gap', 'شغل', 'مهارت', 'وقفه']
    ),
    fact(
      'conscription_comparison',
      [
        'which countries have compulsory military service',
        'iran vs south korea military service',
        'is conscription rare around the world',
        'کدام کشورها سربازی اجباری دارند',
        'مقایسه سربازی ایران و کره جنوبی',
        'آیا خدمت اجباری در دنیا نادر است'
      ],
      [
        'countries with conscription',
        'south korea conscription',
        'compulsory service comparison',
        'کشورهای دارای سربازی',
        'سربازی کره جنوبی',
        'خدمت اجباری جهان'
      ],
      'خدمت اجباری فقط به ایران و کره‌ی جنوبی محدود نیست. کشورهایی مانند کره‌ی جنوبی، فنلاند، سنگاپور، سوئیس، اتریش، یونان، ترکیه، اسرائیل، نروژ و چند کشور دیگر شکل‌هایی از سربازی یا خدمت ملی دارند، اما جنسیت مشمول، گزینشی یا همگانی‌بودن، خدمت جایگزین، مدت و حقوق یکسان نیست. در کره‌ی جنوبی مدت به شاخه وابسته است و معمولاً حدود ۱۸ تا ۲۱ ماه گزارش می‌شود؛ این عدد هم باید از اداره‌ی رسمی نیروی انسانی نظامی همان روز بررسی شود. مقایسه‌ی منصفانه فقط ماه‌ها نیست: تهدید امنیتی ادعاشده، حقوق فردی، جبران مالی، آموزش، ایمنی، اثر بر کار و امکان خدمت غیرنظامی هم مهم‌اند.',
      'Compulsory service is not limited to Iran and South Korea. South Korea, Finland, Singapore, Switzerland, Austria, Greece, Turkey, Israel, Norway, and other states use different forms of conscription or national service. Eligibility by gender, selective versus broad intake, civilian alternatives, duration, and compensation differ sharply. South Korean active service is commonly reported at roughly 18 to 21 months depending on branch, but even that should be checked with its official Military Manpower Administration at the time. A fair comparison is not only months: claimed security needs, individual rights, compensation, training, safety, career impact, and civilian alternatives matter too.',
      ['south korea', 'finland', 'comparison', 'کره جنوبی', 'فنلاند', 'مقایسه']
    ),
    fact(
      'toxic_family_patterns',
      [
        'how do i know if my family is toxic',
        'signs of emotional abuse in a family',
        'my family constantly humiliates me',
        'از کجا بفهمم خانواده ام سمی است',
        'نشانه های آزار عاطفی خانواده',
        'خانواده ام مدام تحقیرم میکنند'
      ],
      [
        'toxic family',
        'emotionally abusive family',
        'family humiliation',
        'خانواده سمی',
        'آزار عاطفی خانواده',
        'تحقیر خانوادگی'
      ],
      'واژه‌ی «سمی» تشخیص پزشکی نیست؛ به الگوی تکراری نگاه کن. تحقیر، تهدید، کنترل پول و رفت‌وآمد، نقض حریم، انکار واقعیت تو، تنبیه با سکوت، وادارکردن به انتخاب میان اعضا یا ترساندن با خشونت نشانه‌های جدی‌اند. اختلاف و اشتباه گاه‌به‌گاه با الگوی قدرت و کنترل فرق دارد. رویدادها را برای خودت دقیق ثبت، یک مرز کوچک و پیامد قابل اجرا تعیین و یک آدم امن بیرون از چرخه پیدا کن. اگر احتمال خشونت هست، مرزبندی یا خروج ناگهانی می‌تواند خطر را بیشتر کند؛ اول برنامه‌ی ایمنی و حمایت محلی لازم است. تو مجبور نیستی برای اثبات وفاداری آزار را عادی بدانی.',
      'Toxic is not a clinical diagnosis; look for a repeated pattern. Humiliation, threats, control of money or movement, privacy violations, denial of your reality, silent punishment, forced alliances, or fear of violence are serious signs. Occasional conflict and mistakes differ from a pattern of power and control. Privately document concrete events, choose one enforceable boundary, and find a safe person outside the cycle. If violence is possible, confrontation or sudden departure can increase danger, so safety planning and local support come first. You do not have to normalize harm to prove family loyalty.',
      ['control', 'humiliation', 'safety', 'کنترل', 'تحقیر', 'ایمنی']
    ),
    fact(
      'family_boundaries_when_dependent',
      [
        'how do i set boundaries when i depend on my family',
        'i cannot move out of a toxic home',
        'boundaries with controlling parents while living together',
        'وقتی به خانواده وابسته ام چطور مرز بگذارم',
        'نمیتوانم از خانه سمی بروم',
        'با والدین کنترلگر زیر یک سقف چه کنم'
      ],
      [
        'dependent on toxic family',
        'boundaries while living at home',
        'family financial dependence',
        'وابسته به خانواده سمی',
        'مرز در خانه',
        'وابستگی مالی خانواده'
      ],
      'وقتی از نظر پول، مسکن یا مراقبت وابسته‌ای، مرز باید امن و قابل اجرا باشد، نه یک سخنرانی بزرگ. اطلاعات حساس را کمتر به اشتراک بگذار، زمان و موضوع گفتگو را محدود کن، برای توهین جمله‌ی کوتاه آماده داشته باش و اگر امن است گفتگو را ترک کن. هم‌زمان مدارک، مهارت، درآمد کوچک، شبکه‌ی امن و گزینه‌ی اقامت را آرام بساز. لازم نیست برنامه‌ات را به فرد کنترلگر اعلام کنی. اگر گوشی یا رفت‌وآمدت کنترل می‌شود یا تهدید وجود دارد، از دستگاه امن و مرکز حمایت محلی کمک بگیر. قطع رابطه تنها گزینه نیست و آشتی هم وظیفه نیست؛ شدت تماس باید با امنیت و توان تو هماهنگ باشد.',
      'When you depend on family for money, housing, or care, a boundary must be safe and enforceable rather than a dramatic speech. Share less sensitive information, limit the time or topic, prepare one short line for insults, and leave the conversation when safe. In parallel, slowly build documents, skills, modest income, a safe network, and housing options. You do not have to announce a plan to a controlling person. If your phone or movement is monitored or threats exist, use a safer device and local support. No-contact is not the only option, and reconciliation is not an obligation; contact level should fit your safety and capacity.',
      ['dependent', 'living together', 'plan', 'وابسته', 'هم خانه', 'برنامه']
    ),
    fact(
      'toxic_friendship',
      [
        'how do i know if a friendship is toxic',
        'my friend insults me and calls it a joke',
        'should i leave a one sided friendship',
        'از کجا بفهمم دوستم سمی است',
        'دوستم تحقیرم میکند و میگوید شوخی بود',
        'دوستی یک طرفه را تمام کنم'
      ],
      [
        'toxic friendship',
        'one sided friendship',
        'friend humiliates me',
        'دوست سمی',
        'دوستی یک طرفه',
        'تحقیر توسط دوست'
      ],
      'دوستی ناسالم معمولاً بعد از هر تماس تو را کوچک، مضطرب یا بدهکار نگه می‌دارد: شوخی تحقیرآمیز، افشای راز، حسادت همراه خرابکاری، تماس فقط هنگام نیاز، فشار برای کار خطرناک یا نپذیرفتن «نه». یک اتفاق را با الگوی تکراری اشتباه نگیر؛ یک مرز مشخص را بگو و واکنش را ببین. دوست سالم ممکن است ناراحت شود اما مسئولیت می‌پذیرد و اصلاح می‌کند. می‌توانی تماس را کم، موقعیت را محدود یا رابطه را تمام کنی. اگر تهدید، تعقیب یا اخاذی هست، تنها مذاکره نکن؛ مدرک را نگه دار و از آدم امن یا مرجع محلی کمک بگیر.',
      'An unhealthy friendship often leaves you consistently smaller, anxious, or indebted: humiliating jokes, exposed secrets, sabotaging envy, contact only when they need something, pressure toward danger, or refusal to accept no. Do not confuse one mistake with a repeated pattern; state one specific boundary and observe the response. A healthy friend may feel uncomfortable but can take responsibility and change. You may reduce contact, limit settings, or end the relationship. If there are threats, stalking, or blackmail, do not negotiate alone; preserve evidence and involve a safe person or appropriate local support.',
      ['friend', 'boundary', 'threat', 'دوست', 'مرز', 'تهدید']
    ),
    fact(
      'appearance_bias',
      [
        'does pretty privilege exist',
        'are attractive people treated better',
        'what is appearance bias',
        'آیا امتیاز زیبایی واقعی است',
        'با آدم های زیبا بهتر رفتار میشود',
        'سوگیری ظاهری چیست'
      ],
      [
        'pretty privilege',
        'appearance bias',
        'attractiveness bias',
        'امتیاز زیبایی',
        'سوگیری ظاهری',
        'تبعیض بر اساس چهره'
      ],
      'سوگیری ظاهری واقعی است: آدم‌ها گاهی از چهره یا بدن، بی‌دلیل درباره‌ی توانایی، اخلاق یا جایگاه نتیجه می‌گیرند و استاندارد زیبایی هم با فرهنگ و زمان عوض می‌شود. این به معنای آن نیست که زندگی هر فرد جذاب آسان است یا ارزش انسان‌ها واقعاً رتبه‌بندی می‌شود. در تصمیم خودت معیارهای مرتبط را جدا کن: رفتار، مهارت، سازگاری و اعتماد. اگر در مدرسه یا کار تبعیض مشخصی رخ داده، رویداد و اثرش را ثبت و سیاست شکایت را بررسی کن. برای خودت هم بهتر است تعریف و بازخورد را فقط روی ظاهر متمرکز نکنی.',
      'Appearance bias is real: people sometimes infer competence, morality, or status from a face or body without evidence, and beauty standards shift across cultures and time. That does not mean every conventionally attractive person has an easy life, or that human worth can actually be ranked. In your own decisions, use relevant criteria such as behavior, skill, fit, and trust. If concrete discrimination occurs at school or work, document the event and impact and check the complaint process. It also helps not to make appearance the only kind of praise or feedback you give.',
      ['bias', 'work', 'school', 'سوگیری', 'کار', 'مدرسه']
    ),
    fact(
      'body_dysmorphia_literacy',
      [
        'what is body dysmorphic disorder',
        'when does appearance worry become a disorder',
        'i keep checking my face in the mirror',
        'اختلال بدریخت انگاری چیست',
        'نگرانی ظاهر کی اختلال میشود',
        'مدام صورتم را در آینه چک میکنم'
      ],
      [
        'body dysmorphia',
        'bdd',
        'appearance obsession',
        'بدریخت انگاری',
        'وسواس ظاهر',
        'چک کردن آینه'
      ],
      'اختلال بدریخت‌انگاری یا BDD نگرانی شدید و وقت‌گیر درباره‌ی نقص ظاهری ادراک‌شده است که دیگران ممکن است آن را نبینند یا بسیار جزئی بدانند. مقایسه‌ی مداوم، چک‌کردن یا دوری از آینه، پنهان‌سازی، اطمینان‌خواهی و اجتناب از جمع می‌توانند نشانه باشند؛ اما تشخیص فقط با متخصص است. اگر نگرانی هر روز زمان زیادی می‌گیرد یا درس، کار، رابطه، غذا یا بیرون‌رفتن را مختل می‌کند، روانشناس یا روانپزشک آشنا با BDD می‌تواند کمک کند. هدف درمان بحث‌کردن درباره‌ی «واقعاً زیبا هستی یا نه» نیست؛ کم‌کردن اسارت ذهن و رفتارهای اجباری است.',
      'Body dysmorphic disorder, or BDD, involves intense time-consuming concern about a perceived appearance flaw that others may not see or may view as slight. Constant comparison, mirror checking or avoidance, concealment, reassurance seeking, and avoiding people can be signs, but only a qualified professional can diagnose it. If appearance worry consumes substantial daily time or disrupts school, work, relationships, eating, or leaving home, a clinician familiar with BDD can help. Treatment is not a debate about whether you are objectively attractive; it aims to reduce distress and compulsive behavior.',
      ['mirror', 'compare', 'clinician', 'آینه', 'مقایسه', 'متخصص']
    ),
    fact(
      'appearance_comparison',
      [
        'how do i stop comparing my face to others',
        'someone else is beautiful and i feel ugly',
        'i think i am prettier than everyone else',
        'چطور صورتم را با بقیه مقایسه نکنم',
        'اون خیلی خوشگله و من زشتم',
        'فکر میکنم از همه خوشگل ترم'
      ],
      [
        'face comparison',
        'compare looks',
        'prettier than others',
        'مقایسه چهره',
        'مقایسه زیبایی',
        'زشت و زیبا'
      ],
      'مقایسه‌ی چهره یک مسابقه با خط پایان متغیر می‌سازد: نور، زاویه، فیلتر، سن، فرهنگ و سلیقه داور را عوض می‌کنند. اگر خودت را پایین‌تر می‌بینی، احساس درد را انکار نکن اما آن را حکم واقعیت ندان؛ خوراک مقایسه را کم و ارزش‌ها، رابطه‌ها و مهارت‌هایی را که ظاهر اندازه نمی‌گیرد دوباره وارد تصویر کن. اگر خودت را «زیباتر» می‌دانی، ترجیح شخصی مجوز تحقیر یا نتیجه‌گیری درباره‌ی شخصیت دیگری نیست. زیبایی می‌تواند لذت‌بخش باشد، اما نه مدرک برتری و نه کل هویت. چک‌کردن و مقایسه‌ی اجباری که زندگی را می‌گیرد، ارزش بررسی حرفه‌ای دارد.',
      'Comparing faces creates a contest whose finish line keeps moving: lighting, angle, filters, age, culture, and taste change the judge. If you place yourself below someone, do not deny the pain, but do not turn the feeling into a factual verdict; reduce comparison triggers and bring values, relationships, and skills back into the picture. If you consider yourself prettier, personal preference is not permission to demean someone or infer their character. Beauty can be enjoyable, but it is neither proof of superiority nor a whole identity. Compulsive checking and comparison that take over daily life deserve professional attention.',
      ['face', 'beautiful', 'ugly', 'چهره', 'زیبا', 'زشت']
    ),
    fact(
      'hope_under_structural_pressure',
      [
        'how do i have hope when the future looks bad',
        'there is no bright future for me',
        'everything is unstable and i feel hopeless',
        'وقتی آینده تاریک است چطور امید داشته باشم',
        'هیچ آینده روشنی برای من نیست',
        'همه چیز بی ثبات است و ناامیدم'
      ],
      [
        'no bright future',
        'hope in hard times',
        'structural pressure',
        'آینده روشن ندارم',
        'امید در شرایط سخت',
        'فشار ساختاری'
      ],
      'امید لازم نیست پیش‌بینی خوش‌بینانه باشد. وقتی اقتصاد، جنگ، خانواده یا کار نامطمئن است، امید می‌تواند فقط توان ساختن یک گزینه‌ی بعدی باشد. دو ستون بنویس: چیزهایی که واقعاً خارج از کنترل توست و چیزهایی که این هفته می‌توانی جابه‌جا کنی؛ یک کار بقا، یک کار آینده و یک تماس انسانی انتخاب کن. خبر و مقایسه را در زمان محدود نگه دار تا تمام ذهن را اشغال نکنند. اگر ناامیدی هفته‌ها ادامه دارد، خواب و کارکرد را از بین برده یا به فکر نبودن و آسیب‌زدن رسیده، این دیگر پروژه‌ی انگیزشی نیست؛ همین حالا به یک انسان امن و کمک حرفه‌ای یا بحران نیاز دارد.',
      'Hope does not have to be an optimistic forecast. When the economy, conflict, family, or work is unstable, hope may simply mean building one next option. Make two columns: what is genuinely outside your control and what can move this week. Choose one survival action, one future-building action, and one human contact. Put news and comparison into a limited window so they do not occupy the whole mind. If hopelessness lasts for weeks, removes sleep or functioning, or becomes thoughts of not existing or self-harm, this is no longer a motivation project; contact a trusted person and professional or crisis support now.',
      ['future', 'hope', 'control', 'آینده', 'امید', 'کنترل']
    ),
    fact(
      'shopping_under_inflation',
      [
        'how do i shop wisely during inflation',
        'low budget shopping checklist in iran',
        'should i buy used or new',
        'در تورم چطور هوشمند خرید کنم',
        'چک لیست خرید با بودجه کم در ایران',
        'دست دوم بخرم یا نو'
      ],
      [
        'shopping during inflation',
        'low budget shopping',
        'used or new',
        'خرید در تورم',
        'خرید کم هزینه',
        'دست دوم یا نو'
      ],
      'در بازار تورمی، دریا قیمت ثابت کالا نمی‌گوید؛ همان رقم ممکن است خیلی زود گمراه‌کننده شود. نیاز را به سه الزام و دو ترجیح تبدیل کن، سقف بودجه را با تعمیر، لوازم، مصرف انرژی و رفت‌وآمد حساب کن و قیمت زنده را در چند فروشگاه مستقل مقایسه کن. کالای دست‌دوم برای وسیله‌ی قابل‌آزمایش و تعمیرپذیر می‌تواند منطقی باشد، اما شماره‌سریال، قفل حساب، سلامت، مالکیت و رسید را حضوری بررسی کن. تخفیف را با قیمت قبلی معتبر و نیاز واقعی بسنج. برای رزرو خارج از پلتفرم یا قیمت غیرعادی پایین پیش‌پرداخت نده.',
      'In an inflationary market, Darya does not quote a fixed product price; it can become misleading quickly. Convert the need into three requirements and two preferences, set a ceiling that includes repairs, accessories, energy use, and transport, and compare live quotes across independent sellers. Used goods can make sense when the item is testable and repairable, but verify serial number, account locks, condition, ownership, and a receipt in person. Judge a discount against a credible prior price and an actual need. Do not send an off-platform deposit for a reservation or an implausibly cheap listing.',
      ['price', 'used', 'warranty', 'قیمت', 'دست دوم', 'گارانتی']
    )
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
