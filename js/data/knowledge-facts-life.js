/**
 * Darya - curated factual entries (life domain).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'crush_confession',
      keywords: [
        'کراش چیه',
        // Persian ی here (not Arabic ي): user input is normalized to the
        // Persian letter, so the Arabic form would never match.
        'کراش چیست',
        'کراش یعنی',
        'کراش',
        'اعتراف به علاقه',
        'ابراز علاقه',
        'به کسی بگم دوستش دارم',
        'crush',
        'confess to my crush',
        'how to tell someone i like them'
      ],
      weak: ['کراش', 'crush', 'اعتراف', 'ابراز احساسات'],
      weakSafe: true,
      hints: [
        'دختر',
        'پسر',
        'دوست',
        'علاقه',
        'رابطه',
        'girl',
        'boy',
        'like',
        'love',
        'relationship'
      ],
      fa: 'برای ابراز علاقه، ساده و بی‌واسطه باش: یک جمله‌ی صادقانه مثل «راستش مدتی‌ست به تو فکر می‌کنم و دوست دارم بیشتر هم‌دیگر را بشناسیم» از پیام‌های طولانی و سنگین بهتر است. زمان و مکان آرام انتخاب کن (مثلاً قدم زدن، نه وسط شلوغی)، به واکنشش احترام بگذار و اگر جوابش نه بود، خودت را مقصر ندان؛ شجاعتت ارزشمند بود، نه نتیجه‌اش. اعتماد به نفست را هم قبل از جواب او بساز، نه فقط بعد از بله گرفتن.',
      en: 'To confess your feelings, be simple and direct: an honest line like "I have been thinking about you lately and I would like to get to know you better" beats a long, heavy message. Pick a calm moment and place, respect whatever reaction you get, and if the answer is no, do not blame yourself; your courage was the valuable part, not the outcome. Build your confidence before their answer, not only after a yes.'
    },
    {
      id: 'relationship_advice',
      keywords: [
        'مشاوره رابطه',
        'رابطه ام',
        'دعوای عشقی',
        'relationship advice',
        'how to fix a relationship'
      ],
      weak: ['رابطه', 'عشقی', 'relationship'],
      weakSafe: false,
      hints: [
        'دوست پسر',
        'دوست دختر',
        'همسر',
        'نامزد',
        'ازدواج',
        'دعوا',
        'girlfriend',
        'boyfriend',
        'partner',
        'marriage',
        'fight'
      ],
      fa: 'پایه‌ی یک رابطه‌ی سالم، شنیدن واقعی و مرزهای شفاف است. وقتی دعوا پیش می‌آید، به جای «تو همیشه...» از «وقتی فلان اتفاق افتاد، من فلان حس را گرفتم» استفاده کن. اگر در رابطه‌ات مدام حس می‌کنی نادیده گرفته می‌شوی یا باید خودت را کوچک کنی، این علامت مهمی است. هیچ رابطه‌ای بدون احترام دوطرفه نمی‌تواند سالم بماند؛ و اگر این احترام نیست، سؤال بزرگ‌تر این است که چرا آنجا مانده‌ای.',
      en: 'The foundation of a healthy relationship is real listening and clear boundaries. When a fight happens, use "when this happened, I felt that" instead of "you always." If you constantly feel ignored or have to shrink yourself in a relationship, that is an important signal. No relationship can stay healthy without mutual respect; and if respect is missing, the bigger question is why you are still there.'
    },
    {
      id: 'breakup_healing',
      keywords: [
        'بعد از جدایی',
        'دلشکستگی',
        'ترک شدیم',
        'heartbreak',
        'getting over a breakup',
        'after a breakup'
      ],
      weak: ['جدایی', 'دلشکسته', 'دل شکسته', 'heartbreak', 'breakup'],
      weakSafe: true,
      hints: ['رابطه', 'عشق', 'غم', 'رابطه', 'love', 'sad'],
      fa: 'بعد از جدایی، غمگین بودن طبیعی است، نه ضعف. دلشکستگی یک فرآیند است، نه یک کلید که یک‌شبه خاموش شود؛ بدن و ذهن باید زمان بگذرانند. سه چیز کمک می‌کند: تماس با دوستان، ساختار روزانه (ورزش، کار، خواب منظم) و یادآوری اینکه ارزش تو به آن رابطه وابسته نبود. اگر با دوست قبلی‌ات تماس بگیری، معمولاً روند ترمیم را طولانی‌تر می‌کند.',
      en: 'After a breakup, feeling sad is normal, not weak. A broken heart is a process, not a switch you can flip; your body and mind need time. Three things help: staying close to friends, keeping daily structure (exercise, work, regular sleep), and remembering that your worth was never tied to that relationship. Contacting your ex usually just makes the healing take longer.'
    },
    {
      id: 'sleep_tips',
      keywords: [
        'خواب خوب',
        'چطور زود خوابم ببره',
        'بهبود خواب',
        'how to sleep better',
        'how to fall asleep fast',
        'sleep hygiene'
      ],
      weak: ['خواب', 'sleep', 'بی‌خوابی', 'insomnia'],
      weakSafe: true,
      hints: ['شب', 'بهبود', 'راه', 'چطور', 'night', 'better'],
      fa: 'قوانین طلایی خواب: ساعت خواب و بیداری را تقریباً ثابت نگه دار (حتی آخر هفته)، یک ساعت قبل از خواب از گوشی و نمایشگر فاصله بگیر، اتاق را تاریک و خنک نگه دار و کافئین بعدازظهر را کم کن. اگر خوابت نمی‌برد، به‌جای غلت زدن در رختخواب، بلند شو و یک کار آرام بدون نور انجام بده تا چرخه‌ی خواب دوباره بیفتد.',
      en: 'The golden rules of sleep: keep a fairly fixed sleep and wake time (even on weekends), step away from screens an hour before bed, keep the room dark and cool, and cut afternoon caffeine. If you cannot fall asleep, instead of tossing in bed, get up and do something calm without bright light until your sleep cycle resets.'
    },
    {
      id: 'study_technique',
      keywords: [
        'تکنیک مطالعه',
        'پومودورو',
        'مطالعه موثر',
        'بهتر درس بخونم',
        'study technique',
        'pomodoro',
        'how to study effectively'
      ],
      weak: ['پومودورو', 'مطالعه', 'pomodoro', 'study'],
      weakSafe: true,
      hints: ['درس', 'امتحان', 'کنکور', 'یادگیری', 'exam', 'test', 'learn'],
      fa: 'دو تکنیک که واقعاً جواب می‌دهند: «پومودورو» یعنی ۲۵ دقیقه تمرکز کامل و ۵ دقیقه استراحت، و «تکرار فاصله‌دار» یعنی مرور مطلب در روزهای بعد به‌جای یک‌جا خوندن شب امتحان. مهم‌تر از همه، مرور فعال است: به‌جای دوباره خواندن، مطلب را از حفظ برای خودت توضیح بده و سؤال بساز. مغز چیزهایی را که «بیرون می‌کشی» بهتر نگه می‌دارد تا چیزهایی را که فقط می‌بینی.',
      en: 'Two techniques that genuinely work: the Pomodoro method, 25 minutes of deep focus followed by a 5 minute break, and spaced repetition, reviewing material across days instead of cramming the night before. Most important is active recall: instead of rereading, explain the material to yourself from memory and make your own questions. The brain keeps what you pull out better than what you merely look at.'
    },
    {
      id: 'money_management',
      keywords: [
        'مدیریت مالی',
        'بودجه بندی',
        'پس انداز',
        'مدیریت پول',
        'money management',
        'manage my money',
        'manage money',
        'how to budget',
        'how to save money'
      ],
      weak: ['بودجه', 'پس انداز', 'پس‌انداز', 'budget', 'saving'],
      weakSafe: true,
      hints: ['پول', 'خرج', 'درآمد', 'money', 'spend', 'income'],
      fa: 'مدیریت مالی ساده شروع می‌شود: بدان هر ماه چقدر درمی‌آوری و چقدر خرج می‌کنی. یک قانون ساده «۵۰-۳۰-۲۰» است: پنجاه درصد برای نیازها، سی درصد برای خواسته‌ها و بیست درصد برای پس‌انداز. اول پول را برای پس‌انداز کنار بگذار، بعد خرج کن، نه برعکس؛ و هزینه‌های کوچک تکراری (کافه، اشتراک، خوراکی) معمولاً بیشتر از خریدهای بزرگ بودجه را می‌خورند.',
      en: 'Money management starts simply: know what you earn and what you spend each month. A simple rule is the 50-30-20 split: fifty percent for needs, thirty for wants, and twenty for savings. Save first, then spend, not the other way around; and small repeated costs (coffee, subscriptions, snacks) usually eat the budget more than big purchases do.'
    },
    {
      id: 'stress_quick',
      keywords: [
        'استرس فوری',
        'الان مضطربم',
        'چطور سریع اروم شم',
        'کمک فوری استرس',
        'how to calm down fast',
        'panic attack help',
        'how to reduce stress quickly'
      ],
      weak: ['آروم شدن', 'آرام شدن', 'calm down', 'فوری آروم'],
      weakSafe: true,
      hints: ['استرس', 'اضطراب', 'نفس', 'stress', 'anxiety', 'breath', 'panic'],
      fa: 'برای آرام‌شدن سریع در لحظه: نفس ۴-۴-۴ بکش (۴ ثانیه دم، ۴ ثانیه نگه‌دار، ۴ ثانیه بازدم) و این را ۵ بار تکرار کن؛ نام پنج چیزی که می‌بینی، چهار چیزی که می‌شنوی و سه چیزی که لمس می‌کنی را بگو. اگر ضربان قلبت تند است، یک لیوان آب خنک و قدم زدن هم کمک می‌کند. این‌ها آرامش فوری است، نه درمان؛ اگر اضطراب مداوم است، حتماً با یک متخصص صحبت کن.',
      en: 'To calm down fast in the moment: breathe in a 4-4-4 pattern (4 seconds in, 4 seconds hold, 4 seconds out) repeated five times, then name five things you see, four you hear, and three you touch. If your heart is racing, cool water and a short walk also help. These are quick reliefs, not treatment; if anxiety is ongoing, please talk to a professional.'
    },
    {
      id: 'imposter_syndrome',
      keywords: [
        'سندرم ایمپاستر',
        'ایمپاستر',
        'امپاستر',
        'imposter syndrome',
        'imposter',
        'fake it till you make it'
      ],
      weak: ['تقلبی', 'بلوف', 'fake', 'fraud', 'صلاحیت'],
      weakSafe: true,
      hints: [
        'کار',
        'شغل',
        'برنامه نویسی',
        'دانشجو',
        'دانشگاه',
        'کارشناسی ارشد',
        'work',
        'job',
        'career',
        'developer',
        'student'
      ],
      fa: 'سندرم ایمپاستر یعنی حس می‌کنی به‌جای شایستگی‌ات، با شانس یا بلوف به این‌جا رسیده‌ای و هر لحظه لو می‌روی، حتی وقتی شواهد خلافش را نشان می‌دهند. این حس در دانشجوها و تازه‌کارها خیلی رایج است، مخصوصاً در برنامه‌نویسی و کارشناسی ارشد. یادت باشد: «نمی‌دانم» با «بی‌صلاحیت‌ام» فرق دارد؛ اینکه جایگاهی رسیده‌ای که دیگران به آن نرسیده‌اند، خودش مدرک است. اگر مدام به خودت شک داری، تجربه‌های موفق گذشته‌ات را بنویس و در لحظه‌ی شک به آن‌ها برگرد.',
      en: 'Imposter syndrome is the feeling that you reached your position by luck or bluff rather than competence, and that you will be exposed at any moment, even when evidence says otherwise. It is very common among students and early-career people, especially in programming and grad school. Remember: "I do not know" is not the same as "I am unqualified"; getting somewhere others have not is itself evidence. If you constantly doubt yourself, write down your past wins and return to them when the doubt hits.'
    },
    {
      id: 'marriage_children',
      keywords: [
        'ازدواج خوبه',
        'آیا ازدواج به صرفه است',
        'ازدواج کنم یا نه',
        'بچه دار شوم یا نه',
        'تردید در بچه دار شدن',
        'is marriage worth it',
        'should i get married',
        'should i have children',
        'hesitant about having kids',
        'is marriage beneficial'
      ],
      weak: [
        'ازدواج',
        'بچه دار شدن',
        'فرزند',
        'marriage',
        'married',
        'children',
        'kids'
      ],
      weakSafe: true,
      hints: [
        'تردید',
        'تصمیم',
        'زندگی',
        'همسر',
        'doubt',
        'decision',
        'partner'
      ],
      fa: 'ازدواج و بچه‌دارشدن دو تصمیم شخصی هستند که جواب «بله یا نه»ی جهانی ندارند؛ آنچه برای یکی درست است، برای دیگری ممکن است نباشد. برای تصمیم آگاهانه، به‌جای مقایسه با دیگران، به این‌ها فکر کن: با چه کسی و در چه شرایطی ازدواج می‌کنی (کیفیت رابطه مهم‌تر از فشار اجتماعی است)، و آیا واقعاً بچه می‌خواهی یا فقط انتظار جامعه است. گفتگوی صادقانه با همسر آینده درباره‌ی پول، بچه، کار و محل زندگی، قبل از ازدواج خیلی مهم است. تردید داشتن طبیعی است؛ عجله نکن، ولی از تصمیم‌نگرفتن هم به‌عنوان فرار استفاده نکن.',
      en: 'Marriage and having children are two deeply personal decisions with no universal yes or no; what is right for one person may not be for another. To decide consciously, instead of comparing with others, think about these: who you would marry and under what conditions (relationship quality matters more than social pressure), and whether you truly want children or are just following societal expectation. An honest conversation with a future partner about money, children, work, and where to live matters a lot before marriage. Having doubts is normal; do not rush, but also do not use indecision as an escape.'
    },
    {
      id: 'religion_respect',
      keywords: [
        'بهترین دین',
        'کدام دین بهتر است',
        'بهترین مذهب',
        'کدام دین درست است',
        'which religion is best',
        'best religion',
        'which religion is right'
      ],
      weak: ['دین', 'مذهب', 'religion'],
      weakSafe: true,
      hints: ['بهترین', 'کدام', 'مقایسه', 'اعتقاد', 'best', 'which', 'faith'],
      fa: 'هیچ پاسخی برای «کدام دین بهترین است» وجود ندارد که همگان بپذیرند؛ ادیان بزرگ هرکدام مجموعه‌ای از باورها، آیین‌ها و ارزش‌ها هستند و میلیون‌ها نفر در هرکدام معنا و آرامش پیدا می‌کنند. بهترین کار این است که به‌جای داوری درباره‌ی برتری، هر دینی را با احترام و ذهن باز مطالعه کنی: متونش را بخوانی، با پیروانش گفتگو کنی و ببینی آیا ارزش‌هایش با ارزش‌های تو هم‌خوانی دارد. انتخاب دین (یا نداشتن دین) یک حق شخصی است؛ هیچ‌کس نباید به‌خاطرش تحت فشار باشد. احترام به باور دیگران، در هر دینی، خودش یک ارزش والاست.',
      en: 'There is no answer to which religion is best that everyone would accept; the major religions are each a set of beliefs, practices, and values, and millions of people find meaning and peace in each one. The best approach is to study any religion with respect and an open mind instead of judging superiority: read its texts, talk to its followers, and see whether its values align with yours. Choosing a religion (or none) is a personal right; no one should be pressured about it. Respecting others beliefs is itself a high value in every faith.'
    },
    {
      id: 'homesickness_abroad',
      keywords: [
        'دلم برای خانواده تنگه',
        'دلتنگ خانواده ام',
        'خانواده ام را نمی بینم',
        'خانواده‌ام را نمی‌بینم',
        'دلتنگ خانه هستم',
        'دلم برای وطنم تنگه',
        'homesick',
        'missing my family abroad',
        'i miss my family',
        'homesick abroad'
      ],
      weak: ['دلتنگ', 'تنگی', 'missing', 'homesick'],
      weakSafe: true,
      hints: [
        'خانواده',
        'خارج',
        'غربت',
        'وطن',
        'family',
        'abroad',
        'home',
        'far'
      ],
      fa: 'دلتنگ شدن برای خانواده و وطن وقتی دوری، یکی از طبیعی‌ترین حس‌های دنیاست؛ یعنی به چیزی که برایت ارزشمند است وصل هستی، نه اینکه ضعیف باشی. برای کنار آمدن: با خانواده تماس منظم (حتی کوتاه) داشته باش، برای خودت در شهر جدید آیین‌های کوچک بساز (غذای خانگی، موسیقی، جشن‌های ایرانی)، و با آدم‌های هم‌دل ارتباط بگیر. غربت در ماه‌های اول سخت‌ترین است؛ اگر این حس به افسردگی یا انزوا رسید، حتماً با مشاور یا آدم‌های قابل‌اعتماد صحبت کن.',
      en: 'Missing your family and homeland when you are far away is one of the most natural feelings in the world; it means you are connected to what matters to you, not that you are weak. To cope: keep regular contact with family (even short calls), build small rituals for yourself in the new city (home cooking, music, familiar celebrations), and connect with understanding people. The first months abroad are usually the hardest; if the feeling turns into depression or isolation, definitely talk to a mental health professional or trusted people.'
    },
    {
      id: 'economic_despair',
      keywords: [
        'از وضعیت اقتصادی ناامیدم',
        'پول ندارم و ناامیدم',
        'اقتصاد داره منو می‌کشه',
        'اقتصاد داره منو میکشه',
        'از زندگی اقتصادی خسته شدم',
        'economic despair',
        'hopeless about money',
        'the economy is crushing me',
        'tired of financial struggle'
      ],
      weak: [
        'ناامید',
        'خسته شدم',
        'پول ندارم',
        'اقتصاد',
        'hopeless',
        'despair',
        'struggling financially'
      ],
      weakSafe: true,
      hints: [
        'زندگی',
        'آینده',
        'کار',
        'بدهی',
        'life',
        'future',
        'work',
        'debt'
      ],
      fa: 'وقتی فشار اقتصادی آن‌قدر زیاد می‌شود که ناامیدی می‌آید، اول بدان که این حس تقصیر شخصی تو نیست؛ شرایط اقتصادی روی میلیون‌ها نفر همین اثر را دارد. نفس عمیق بکش و مشکل را کوچک کن: به‌جای «همه‌چیز خراب است»، بنویس دقیقاً چه چیزی فوری است (اجاره؟ قسط؟ خوراک؟) و یک قدم کوچک برای همان یکی بردار. کمک خواستن شرم ندارد: از خانواده، دوستان، نهادهای حمایتی یا مشاور. اگر ناامیدی به فکر آسیب‌زدن به خودت رسید، این یک وضعیت فوری است و باید همین حالا با یک خط بحران یا آدم قابل‌اعتماد تماس بگیری؛ من اینجام تا بشنوم، اما جای کمک حرفه‌ای را نمی‌گیرم.',
      en: 'When financial pressure grows so heavy that hopelessness sets in, first know that this feeling is not your personal fault; economic conditions affect millions of people the same way. Take a deep breath and shrink the problem: instead of everything is ruined, write down exactly what is urgent (rent, a payment, food) and take one small step for that single item. Asking for help is not shameful: reach out to family, friends, support organizations, or a mental health professional. If hopelessness turns into thoughts of harming yourself, that is an urgent situation and you should contact a crisis line or a trusted person right now; I am here to listen, but I do not replace professional help.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
