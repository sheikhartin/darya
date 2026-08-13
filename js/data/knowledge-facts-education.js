/**
 * Darya - curated factual entries (education domain).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'college_major',
      keywords: [
        'چه رشته ای انتخاب کنم',
        'چه رشته‌ای انتخاب کنم',
        'انتخاب رشته تحصیلی',
        'رشته دانشگاهی انتخاب کنم',
        'what major should i choose',
        'how to choose a major',
        'which major is right for me',
        'choosing a college major'
      ],
      weak: ['رشته', 'major', 'دانشگاه', 'تحصیل'],
      weakSafe: true,
      hints: [
        'انتخاب',
        'آینده',
        'شغل',
        'کار',
        'درس',
        'choose',
        'future',
        'career',
        'study'
      ],
      fa: 'برای انتخاب رشته‌ی دانشگاهی، به‌جای فکر کردن فقط به «کدام رشته پول بیشتری دارد»، از سه زاویه نگاه کن: چه چیزی برایت واقعاً جالب است و می‌توانی ساعت‌ها رویش وقت بگذاری؟ در چه کاری خوب هستی و دیگران برای چه چیزی به تو مراجعه می‌کنند؟ و بازار کار آن رشته در جایی که می‌خواهی زندگی کنی چه شکلی است؟ اشکال ندارد اگر هنوز مطمئن نیستی؛ خیلی از دانشجوها سال اول رشته‌شان را عوض می‌کنند. یک آزمایش ساده: با استادها و دانشجوهای همان رشته صحبت کن و چند پروژه‌ی کوچک واقعی انجام بده تا طعم کار را بچشی. یادت باشد مهارت عملی معمولاً از اسم رشته مهم‌تر است.',
      en: 'When choosing a college major, instead of only asking which field pays more, look at it from three angles: what genuinely interests you enough to spend hours on it, what you are good at and people come to you for, and what the job market looks like where you want to live. It is fine if you are not sure yet; many students switch majors in their first year. A simple experiment: talk to professors and students in that field, and try a few small real projects to taste the actual work. Remember that practical skill usually matters more than the name of the degree.'
    },
    {
      id: 'konkur_iran',
      keywords: [
        'کنکور',
        'کنکور سراسری',
        'آزمون سراسری',
        'چطور کنکور بدم',
        'آمادگی کنکور',
        'iran university entrance exam',
        'konkur',
        'how to prepare for konkur'
      ],
      weak: ['کنکور', 'konkur', 'سازمان سنجش', 'انتخاب رشته کنکور'],
      weakSafe: true,
      hints: [
        'دانشگاه',
        'پذیرش',
        'آزمون',
        'درس',
        'university',
        'exam',
        'admission',
        'study'
      ],
      fa: 'کنکور سراسری ایران از سال‌های اخیر تغییرات مهمی کرده: دروس عمومی دیگر در جلسه‌ی کنکور نمی‌آیند و فقط در امتحانات نهایی سنجیده می‌شوند، و نمره‌ی نهایی ترکیبی است از حدود ۶۰ درصد سوابق تحصیلی (معدل امتحانات نهایی) و ۴۰ درصد آزمون کنکور. پنج گروه آزمایشی وجود دارد: ریاضی‌فیزیک، علوم تجربی، علوم انسانی، هنر و زبان‌های خارجی. برای انتخاب رشته، تا ۱۵۰ کد رشته‌محل می‌توانی انتخاب کنی و سهمیه‌های منطقه‌ای و ایثارگری هم اعمال می‌شود. مهم‌ترین نکته: معدل امتحانات نهایی الآن از کنکور هم وزن بیشتری دارد، پس در طول سال درس‌های مدرسه را جدی بگیر، نه فقط شب‌های قبل از آزمون. برای پسرها، پذیرش در دانشگاه معافیت تحصیلی سربازی هم می‌آورد.',
      en: 'Irans university entrance exam, the konkur, has changed a lot in recent years: general subjects no longer appear on the exam day and are tested only through final high school exams, and the final score combines about 60 percent academic record (final exam grades) with 40 percent konkur score. There are five test groups: math and physics, experimental sciences, humanities, art, and foreign languages. When choosing a major you can list up to 150 program and location combinations, with regional and veterans quotas applied. The most important point: your final exam grades now weigh more than the konkur itself, so take school seriously all year, not just the nights before the test.'
    },
    {
      id: 'career_exploration_teen',
      keywords: [
        'چطور شغل آینده ام را پیدا کنم',
        'چطور شغل آینده‌ام را پیدا کنم',
        'نوجوان چه شغلی انتخاب کند',
        'آینده شغلی نوجوان',
        'how to find my future career',
        'career ideas for teens',
        'what job should a teenager choose',
        'how to explore careers'
      ],
      weak: [
        'شغل',
        'آینده',
        'نوجوان',
        'کاری که دوست دارم',
        'career',
        'future',
        'teen'
      ],
      weakSafe: true,
      hints: [
        'انتخاب',
        'رشته',
        'مهارت',
        'کار',
        'درس',
        'choose',
        'skill',
        'work',
        'study'
      ],
      fa: 'برای پیدا کردن مسیر شغلی در سن نوجوانی، به‌جای ترس از «اشتباه انتخاب کردن»، آن را مثل یک آزمایش ببین: چند مسیر را امتحان کن، نه یکی را. کار داوطلبانه، کلاس‌های کوتاه، تماشای ویدیوهای آموزشی و گفتگو با آدم‌هایی که واقعاً در آن شغل‌اند، همه راه‌های کم‌هزینه برای تست هستند. دو مهارت در دنیای امروز تقریباً در هر شغلی به کار می‌آیند: کار با کامپیوتر (حتی سطح پایه) و ارتباط مؤثر. همچنین به‌جای انتخاب یک شغل، به «مجموعه‌ای از مهارت‌ها» فکر کن که بین چند شغل قابل انتقال باشند. و یادت باشد: در نوجوانی «نمی‌دانم چه می‌خواهم» طبیعی است، نه نقص.',
      en: 'To find a career path as a teenager, treat it like an experiment instead of fearing the wrong choice: try several paths, not just one. Volunteering, short classes, educational videos, and talking to people who actually work in the field are all low-cost ways to test. Two skills matter in nearly every job today: basic computer literacy and clear communication. Also, instead of picking one job, think in terms of a set of transferable skills that work across several jobs. And remember: not knowing what you want as a teenager is normal, not a flaw.'
    },
    {
      id: 'profession_carpentry',
      keywords: [
        'نجاری',
        'شغل نجاری',
        'چطور نجار شوم',
        'carpentry',
        'how to become a carpenter',
        'carpenter job'
      ],
      weak: ['نجار', 'carpenter', 'چوب'],
      weakSafe: true,
      hints: ['شغل', 'کار', 'مهارت', 'صنعت', 'job', 'work', 'skill', 'wood'],
      fa: 'نجاری یکی از قدیمی‌ترین و کاربردی‌ترین مهارت‌های دستی است: از ساخت مبلمان و کابینت تا سازه‌های چوبی. برای شروع، دوره‌های فنی‌وحرفه‌ای یا کارآموزی نزد یک نجار باتجربه خیلی بهتر از فقط تماشای ویدیو است؛ چون ایمنی ابزار و دقت در اندازه‌گیری را فقط با تمرین واقعی یاد می‌گیری. با رشد ساخت‌وساز و تقاضا برای دکوراسیون چوبی، نجاری مهارتی است که هم در ایران و هم خارج از آن بازار دارد. درآمدش به مهارت و سرعت تو بستگی دارد و خیلی از نجارها بعد از چند سال کارآموزی، کارگاه خودشان را راه می‌اندازند.',
      en: 'Carpentry is one of the oldest and most practical hands-on skills, covering everything from furniture and cabinets to wooden structures. To start, vocational courses or an apprenticeship with an experienced carpenter beat just watching videos, because tool safety and measurement precision only come from real practice. With construction and wooden interior work in demand, carpentry has a market both in Iran and abroad. Income depends on your skill and speed, and many carpenters open their own workshop after a few years of apprenticeship.'
    },
    {
      id: 'hobby_woodworking',
      keywords: [
        'میز کار',
        'میز کار چه چوبی',
        'چه چوبی',
        'تاب برداشتن',
        'workbench',
        'what wood',
        'live edge',
        'woodworking',
        'wood project'
      ],
      weak: ['چوب', 'wood', 'workbench'],
      weakSafe: true,
      hints: [
        'میز',
        'چوب',
        'کارگاه',
        'table',
        'wood',
        'workbench',
        'woodworking'
      ],
      fa: 'برای میز کار، چوب‌های سخت مثل راش، بلوط یا افرا برای سطح دوام بیشتری دارند و ضربه و خراش را بهتر تحمل می‌کنند؛ چوب‌های نرم‌تر مثل کاج ارزان‌ترند و برای قاب و پایه خوبند. برای صفحه‌ی میز کار، تخته‌ی چندلایه (پلای‌وود) یا ام‌دی‌اف روکش‌شده هم گزینه‌ی مطمئن و کم‌هزینه است. اگر با یک تخته‌ی زنده (live edge) کار می‌کنی، اجازه بده چوب کاملاً خشک شود (رطوبت حدود ۸ تا ۱۰ درصد) و ترک‌ها را قبل از کار با گوه‌های پروانه‌ای مهار کن؛ در غیر این صورت بعد از مونتاژ تاب برمی‌دارد.',
      en: 'For a workbench, hardwoods like maple, oak, or beech make a durable surface that handles dings and scratches better; softer woods like pine are cheaper and work well for the frame and legs. For the top, baltic birch plywood or a laminated bench top is a reliable, budget-friendly choice. If you are working with a live edge slab, let it dry to around 8-10% moisture and stabilize any cracks with bow-tie inlays before you build, or it will warp after assembly.'
    },
    {
      id: 'hobby_3d_printing',
      keywords: [
        'پرینت سه بعدی',
        'پرینت سه‌بعدی',
        'پرینت',
        'پرینتم',
        'فیلامنت',
        '3d print',
        '3d printing',
        '3d printer',
        'pla',
        'petg',
        'filament'
      ],
      weak: ['فیلامنت', 'filament', 'pla', 'petg'],
      weakSafe: true,
      hints: ['پرینت', 'print', 'printing', 'printer', 'filament'],
      fa: 'تفاوت اصلی PETG و PLA در دما و انعطاف است: PLA ساده‌تر چاپ می‌شود و برای قطعات غیرفعال عالی است، اما نزدیک گرما (مثلاً داخل ماشین یا کارگاه گرم) تاب می‌آورد؛ PETG مقاومت حرارتی و ضربه‌ای بهتری دارد و برای ابزارهای کارگاه انتخاب مطمئن‌تری است. پیچش لایه‌ها (warping) معمولاً از رطوبت فیلامنت یا اختلاف دمای بستر می‌آید: فیلامنت را خشک نگه دار، بستر را خوب تمیز و چسبنده کن و دمای محیط را ثابت نگه دار.',
      en: 'The key difference between PETG and PLA is heat and flexibility: PLA prints more easily and is great for non-structural parts, but it softens near heat (like a hot garage), while PETG handles heat and impact better and is the safer pick for workshop tools. Layer warping usually comes from damp filament or a temperature difference across the bed: keep your filament dry, clean the bed and make it tacky, and keep the room temperature steady.'
    },
    {
      id: 'profession_mechanical_engineering',
      keywords: [
        'مهندسی مکانیک',
        'شغل مهندس مکانیک',
        'mechanical engineering',
        'mechanical engineer job'
      ],
      weak: ['مکانیک', 'mechanical'],
      weakSafe: true,
      hints: [
        'مهندسی',
        'شغل',
        'کار',
        'طراحی',
        'صنعت',
        'engineering',
        'job',
        'design',
        'industry'
      ],
      fa: 'مهندسی مکانیک درباره‌ی طراحی، ساخت و نگهداری ماشین‌ها و سیستم‌های مکانیکی است؛ از خودرو و هواپیما تا تجهیزات صنعتی و سیستم‌های انرژی. در ایران این رشته در دانشگاه‌های خوب جایگاه محکمی دارد و فرصت‌های کار در صنایع خودروسازی، نفت و انرژی و شرکت‌های تولیدی هست، اما بازارش نسبت به قبل رقابتی‌تر شده. مهم‌ترین مهارت‌های مکمل: نرم‌افزارهای طراحی (مانند سالیدورکس و کتیا)، برنامه‌نویسی پایه، و تسلط بر زبان انگلیسی برای دسترسی به منابع جهانی و کار ریموت.',
      en: 'Mechanical engineering is about designing, building, and maintaining machines and mechanical systems, from cars and aircraft to industrial equipment and energy systems. In Iran it holds a strong place at good universities, with work opportunities in automotive, oil and gas, and manufacturing, though the market has become more competitive than before. The most valuable complementary skills: CAD software, basic programming, and solid English for global resources and remote work.'
    },
    {
      id: 'profession_iot',
      keywords: [
        'اینترنت اشیا',
        'اینترنت اشیاء',
        'شغل اینترنت اشیا',
        'internet of things',
        'iot job',
        'what is iot'
      ],
      weak: ['iot', 'سنسور', 'متصل'],
      weakSafe: true,
      hints: [
        'فناوری',
        'برنامه نویسی',
        'سخت افزار',
        'شغل',
        'technology',
        'programming',
        'hardware',
        'smart'
      ],
      fa: 'اینترنت اشیا (IoT) یعنی متصل کردن دستگاه‌های فیزیکی به اینترنت تا داده جمع کنند و با هم ارتباط برقرار کنند؛ از خانه‌های هوشمند و حسگرهای صنعتی تا شهرهای هوشمند. این حوزه بین سخت‌افزار، شبکه و نرم‌افزار قرار دارد، پس یادگیری الکترونیک پایه، برنامه‌نویسی (مثل پایتون یا C) و آشنایی با پروتکل‌های ارتباطی مثل Wi-Fi و LoRa شروع خوبی است. اینترنت اشیا یکی از حوزه‌های رو به رشد دنیاست و در ایران هم پروژه‌های صنعتی و کشاورزی هوشمند رو به افزایش است.',
      en: 'The Internet of Things (IoT) means connecting physical devices to the internet so they collect data and communicate with each other, from smart homes and industrial sensors to smart cities. The field sits between hardware, networking, and software, so learning basic electronics, programming (like Python or C), and communication protocols such as Wi-Fi and LoRa is a good start. IoT is one of the fastest growing fields in the world, and smart industrial and agricultural projects are increasing in Iran too.'
    },
    {
      id: 'profession_sculpture',
      keywords: [
        'مجسمه سازی',
        'مجسمه‌سازی',
        'شغل مجسمه ساز',
        'مجسمه‌ساز شوم',
        'مجسمه ساز شوم',
        'چطور مجسمه‌ساز',
        'sculpture',
        'how to become a sculptor',
        'sculptor job'
      ],
      weak: ['مجسمه', 'sculptor', 'سنگ', 'گِل'],
      weakSafe: true,
      hints: ['هنر', 'خلاقیت', 'شغل', 'کار', 'art', 'creative', 'career'],
      fa: 'مجسمه‌سازی هنر ساختن فرم‌های سه‌بعدی از موادی مثل سنگ، چوب، فلز، گِل یا مواد مدرن است. مسیرش ترکیبی از آموزش آکادمیک (هنرستان یا دانشگاه هنر) و تمرین مداوم است؛ مشاهده‌ی دقیق و صبر دو مهارت اصلی این کارند. از نظر شغلی، مجسمه‌سازها در کنار کار هنری مستقل، در پروژه‌های شهری، دکوراسیون، فیلم و بازی‌سازی هم فرصت دارند. درآمدش ناپایدارتر از مشاغل اداری است، پس داشتن چند جریان درآمد (آموزش، سفارش، فروش اثر) عاقلانه است.',
      en: 'Sculpture is the art of making three-dimensional forms from materials like stone, wood, metal, clay, or modern media. The path combines academic training (art school or university) with constant practice; careful observation and patience are the two core skills. Professionally, sculptors work not only as independent artists but also on urban projects, decoration, film, and game design. Income is less stable than office jobs, so keeping several income streams (teaching, commissions, selling work) is wise.'
    },
    {
      id: 'profession_music',
      keywords: [
        'موسیقی',
        'خوانندگی',
        'آواز',
        'شغل موسیقی',
        'چطور خواننده شوم',
        'music career',
        'how to become a singer',
        'singing as a job'
      ],
      weak: ['خواننده', 'نوازنده', 'singer', 'musician', 'آهنگ'],
      weakSafe: true,
      hints: [
        'هنر',
        'شغل',
        'آموزش',
        'ساز',
        'art',
        'career',
        'practice',
        'instrument'
      ],
      fa: 'موسیقی هم هنر است و هم حرفه. اگر به خوانندگی یا نوازندگی علاقه داری، شروع با آموزش اصولی (معلم خصوصی یا هنرستان) خیلی مهم است؛ گوش دادن فعال، تئوری موسیقی و تمرین روزانه پایه‌های اصلی‌اند. برای حرفه‌ای شدن به جز استعداد، نظم و حضور مداوم لازم است: اجرا در جمع‌های کوچک، ضبط دمو و ساخت شبکه با آدم‌های این حوزه. درآمد موسیقی معمولاً ترکیبی از اجرا، آموزش، آهنگسازی و حضور دیجیتال است و در ابتدا ناپایدار؛ پس صبر و چند جریان درآمد لازم است.',
      en: 'Music is both an art and a profession. If you love singing or playing an instrument, start with proper training (a teacher or music school); active listening, music theory, and daily practice are the foundations. Going professional requires discipline and constant presence on top of talent: performing in small venues, recording demos, and building a network in the field. Music income usually mixes performance, teaching, composition, and a digital presence, and is unstable at first, so patience and multiple income streams are essential.'
    },
    {
      id: 'profession_acting',
      keywords: [
        'بازیگری',
        // Dual spelling: the normalizer maps «تئاتر» to «تیاتر».
        'تئاتر',
        'تیاتر',
        'بازیگری در سینما',
        'چطور بازیگر شوم',
        'acting career',
        'how to become an actor',
        'theater acting'
      ],
      weak: ['بازیگر', 'actor', 'نمایش', 'صحنه'],
      weakSafe: true,
      hints: ['هنر', 'سینما', 'فیلم', 'شغل', 'art', 'film', 'stage', 'career'],
      fa: 'بازیگری هنر نقش‌پذیرفتن در تئاتر، سینما یا سریال است. مسیر حرفه‌ای معمولاً با کلاس‌های بازیگری، تمرین مداوم و اجرای تئاترهای کوچک شروع می‌شود؛ تئاتر بهترین آزمایشگاه بازیگر است چون بدون تدوین، هر اشتباه دیده می‌شود. حضور در تست‌ها، ساختن رزومه و نمونه‌کار و شبکه‌سازی با کارگردان‌ها مهم است. بازیگری شغلی پررقابت و ناپایدار است، پس خیلی از بازیگرها تا سال‌ها شغل دوم دارند. صداقت احساسی و توانایی کار تیمی، مهارت‌های کلیدی‌اند.',
      en: 'Acting is the art of taking on roles in theater, film, or series. The professional path usually starts with acting classes, constant practice, and performing in small theater productions; theater is the actors best laboratory because there is no editing and every mistake is visible. Attending auditions, building a resume and showreel, and networking with directors all matter. Acting is a highly competitive and unstable career, so many actors keep a second job for years. Emotional honesty and teamwork are the key skills.'
    },
    {
      id: 'profession_mathematics',
      keywords: [
        'ریاضیات',
        'شغل ریاضیات',
        'ریاضی',
        'رشته ریاضی',
        'mathematics career',
        'what can i do with a math degree',
        'mathematician job'
      ],
      weak: ['ریاضی', 'math', 'mathematician'],
      weakSafe: true,
      hints: [
        'دانشگاه',
        'شغل',
        'دانش',
        'علم',
        'university',
        'career',
        'science',
        'data'
      ],
      fa: 'ریاضیات نه فقط یک رشته‌ی دانشگاهی، بلکه یک طرز فکر است؛ و برخلاف تصور رایج، مدرک ریاضی شغل‌های زیادی دارد. ریاضی‌دان‌ها در حوزه‌های داده و هوش مصنوعی، بیمه و بانک، رمزنگاری، آمار و تحقیق در عملیات حضور دارند. اگر به ریاضی علاقه داری، مهارت برنامه‌نویسی را کنارش بگذار؛ ترکیب ریاضی + برنامه‌نویسی یکی از قوی‌ترین ترکیب‌های بازار کار امروز است. ریاضی محض برای خودش ارزش دارد، اما برای آینده‌ی شغلی، ریاضی کاربردی و آماری بیشتر باز می‌شود.',
      en: 'Mathematics is not just a university subject but a way of thinking, and contrary to common belief, a math degree opens many doors. Mathematicians work in data and AI, insurance and banking, cryptography, statistics, and operations research. If you love math, pair it with programming; the combination of math plus coding is one of the strongest in today job market. Pure math is valuable for its own sake, but for career prospects, applied math and statistics open more doors.'
    },
    {
      id: 'profession_diving',
      keywords: [
        'غواصی',
        'شغل غواصی',
        'چطور غواص شوم',
        'diving',
        'how to become a diver',
        'scuba diving as a job'
      ],
      weak: ['غواص', 'diver', 'زیر آب'],
      weakSafe: true,
      hints: [
        'دریا',
        'شغل',
        'مهارت',
        'آموزش',
        'sea',
        'ocean',
        'career',
        'training'
      ],
      fa: 'غواصی هم ورزش است و هم حرفه‌ای تخصصی. برای شروع، دوره‌های استاندارد غواصی (مثل PADI یا CMAS) از سطح مبتدی تا پیشرفته وجود دارد و ایمنی در آن‌ها حرف اول را می‌زند؛ هیچ‌وقت بدون مربی معتبر و تجهیزات سالم غواصی نکن. از نظر شغلی، غواصان حرفه‌ای در کارهای زیر آب مثل تعمیرات، عکاسی زیر آب، نجات و توریسم دریایی کار می‌کنند و در ایران در حوزه‌های نفت، بنادر و جزایر جنوبی فرصت‌هایی هست. سلامت جسمی و گواهینامه‌های معتبر پیش‌نیازهای اصلی‌اند.',
      en: 'Diving is both a sport and a specialized profession. To start, standardized courses (like PADI or CMAS) go from beginner to advanced levels, and safety comes first in all of them; never dive without a certified instructor and proper equipment. Professionally, divers work underwater on repairs, underwater photography, rescue, and marine tourism, with opportunities in Iran in oil, ports, and southern islands. Physical fitness and valid certifications are the main prerequisites.'
    },
    {
      id: 'profession_firefighter',
      keywords: [
        'آتش نشانی',
        'آتش‌نشانی',
        'شغل آتش نشان',
        'چطور آتش نشان شوم',
        'آتش نشان شوم',
        'firefighter',
        'how to become a firefighter',
        'firefighting job'
      ],
      weak: ['آتش نشان', 'fire', 'نجات'],
      weakSafe: true,
      hints: [
        'شغل',
        'خدمات',
        'امداد',
        'شجاعت',
        'job',
        'emergency',
        'rescue',
        'service'
      ],
      fa: 'آتش‌نشانی یک شغل خدماتی و امدادی است که هم شجاعت می‌خواهد و هم آموزش فنی جدی. استخدام معمولاً از طریق آزمون‌های سازمان آتش‌نشانی انجام می‌شود و شامل آزمون آمادگی جسمانی، پزشکی و آموزش‌های تخصصی اطفای حریق و امداد است. کار آتش‌نشان فقط خاموش‌کردن آتش نیست؛ شامل امداد در تصادفات، حوادث طبیعی و آموزش ایمنی به مردم هم می‌شود. این شغل شیفت‌های سنگین و استرس دارد، اما از نظر اجتماعی یکی از محترم‌ترین شغل‌هاست.',
      en: 'Firefighting is a service and emergency career that requires both courage and serious technical training. Hiring usually goes through the fire department recruitment process, including physical fitness tests, medical checks, and specialized firefighting and rescue training. A firefighters work is not only putting out fires; it includes rescue in accidents and natural disasters and teaching the public about safety. The job has heavy shifts and stress, but it is one of the most respected professions socially.'
    },
    {
      id: 'learning_english',
      keywords: [
        'انگلیسی یاد بگیرم',
        'چطور انگلیسی یاد بگیرم',
        'چطوری انگلیسی یاد بگیرم',
        'یادگیری زبان انگلیسی',
        'زبان انگلیسی یاد بگیرم',
        'how to learn english',
        'how can i learn english',
        'learn english',
        'english learning tips',
        'best way to learn english'
      ],
      weak: ['انگلیسی', 'english', 'زبان', 'language'],
      weakSafe: true,
      hints: [
        'یاد',
        'یاد بگیرم',
        'یادگیری',
        'آموزش',
        'صحبت',
        'learn',
        'study',
        'speak',
        'fluent',
        'vocabulary'
      ],
      fa: 'برای یادگیری انگلیسی، به‌جای غرق شدن در گرامر، سراغ «ورودیِ قابل‌فهم» برو: محتوای واقعی (پادکست، سریال با زیرنویس انگلیسی، متن‌های ساده) در سطحی کمی بالاتر از سطح فعلی‌ات. تکرارِ فاصله‌دار برای واژگان (مثلاً فلش‌کارت) خیلی مؤثرتر از حفظ یک‌شبه است، و بلند حرف زدن، حتی با خودت یا با یک پارتنر زبانی، بهترین تمرین گفتار است. قانون ساده: هر روز بیست دقیقه بهتر از هفته‌ای یک‌بار دو ساعت است. اشتباه کردن بخشی از مسیر است، نه نشانه‌ی شکست.',
      en: 'To learn English, do not lead with grammar drills; go for comprehensible input: real content (podcasts, series with English subtitles, simple texts) at a level slightly above your current one. Spaced repetition for vocabulary (flashcards) beats last-minute cramming, and speaking out loud, even alone or with a language partner, is the best speaking practice. The simple rule: 20 minutes every day beats two hours once a week. Making mistakes is part of the path, not a sign of failure.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
