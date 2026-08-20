/**
 * Darya - fa patterns and vocabulary.
 * Entity-extractor vocabulary, trivial-capture patterns, and related
 * pattern data. Registered on DaryaFaData; the lookup maps live in
 * fa-maps.js.
 */
(function (global) {
  'use strict';

  const trivialCaptures = new Set([
    'هستم',
    'هستی',
    'هست',
    'هستیم',
    'هستید',
    'هستند',
    'است',
    'بود',
    'بودم',
    'بودی',
    'بودیم',
    'بودید',
    'بودند',
    'شد',
    'شدم',
    'شدی',
    'ام'
  ]);

  // Vocabulary consumed by the language-neutral named-entity extractor.
  // These are deliberately short, emotionally salient surfaces rather than
  // an attempt to enumerate every Persian noun.
  const familyTerms = [
    'پدر',
    'پدرم',
    'مادر',
    'مادرم',
    'پدربزرگ',
    'مادربزرگ',
    'خواهر',
    'خواهرم',
    'برادر',
    'برادرم',
    'همسر',
    'نامزد',
    'دوست',
    'خانواده',
    'والدین',
    'فرزند',
    'دخترم',
    'پسرم'
  ];
  const professionTerms = [
    'کار',
    'شغل',
    'رئیس',
    'رییس',
    'همکار',
    'دانشگاه',
    'مدرسه',
    'امتحان',
    'کنکور',
    'پروژه',
    'جلسه',
    'پزشک',
    'دکتر',
    'استاد',
    'دانشجو'
  ];
  const placeWords = [
    'خانه',
    'اتاق',
    'مدرسه',
    'دانشگاه',
    'محل کار',
    'دفتر',
    'تهران',
    'شیراز',
    'شهر',
    'روستا',
    'پارک',
    'بیمارستان',
    'اینجا',
    'آنجا'
  ];

  const entityCallbackTemplates = {
    person: [
      'آن نخِ {surface} هنوز در گفتگومان هست و به این داستان شکل شخصی می‌دهد.'
    ],
    place: [
      'آن مکان، یعنی {surface}، هنوز به این داستان شکل می‌دهد و بی‌دلیل در حرفت نیامده است.'
    ],
    time: [
      'جزئیات زمانیِ {surface} به این موضوع شکل می‌دهد و لحظه را مشخص‌تر می‌کند.'
    ],
    activity: [
      'بخشِ {surface} مهم به نظر می‌رسد و بهتر است از قاب حرف‌مان بیرون نماند.'
    ],
    object: [
      'آن جزئیاتِ {surface} هنوز حاضر است و به داستانت بافت مشخصی می‌دهد.'
    ]
  };

  // Periodic conversation check-ins: after several turns without a clear
  // topic, Darya offers a light process check to help wrap up.

  // Matches Persian question marks and the most common question words, so
  // the engine can tell an interrogative sentence apart from a statement
  // even when a specific rule doesn't cover what's being asked.
  const questionPattern =
    /[؟?]|(?<!\p{L})(چرا|چطور|چگونه|چیست|چیه|کجا|کیه|کیست|آیا|کدام|کدومه|کدوم|چندم|چقدر|چند)(?!\p{L})/u;

  // A safe, language-agnostic-in-spirit callback: quoting the person's own
  // earlier words back to them is a core reflective-listening technique
  // and carries no grammar risk (their words are inserted verbatim).

  // Gentle, optional coping offer shown when several consecutive messages
  // read as emotionally heavy. Not a diagnosis, not a substitute for
  // professional support, just a caring pause and a well-known,
  // low-risk grounding technique (paced breathing).

  // Pronoun-swap reflection is intentionally NOT enabled for Persian: verb
  // conjugation carries person/number in the verb ending itself (not just
  // a separate pronoun), so a naive word-swap would frequently produce
  // ungrammatical sentences. English's simpler pronoun morphology makes
  // that technique reliable there instead (see en.js).
  const pronounMap = null;

  const exitKeywords = [
    'بدرود',
    'خداحافظ',
    'خدا حافظ',
    'خدانگهدار',
    'خدا نگهدار',
    'خدافظ',
    'التماس دعا',
    'بای',
    'بای بای',
    'میبینمت',
    'می‌بینمت',
    'میخوام برم',
    'می‌خوام برم',
    'میخوام ترکت کنم',
    'می‌خوام ترکت کنم',
    'میخوام ترکم کنی',
    'می‌خوام ترکم کنی',
    'ترکت میکنم',
    'ترکت می‌کنم',
    'بریم خداحافظی',
    'بریم که خداحافظی کنیم',
    'بیا خداحافظی کنیم',
    'باید برم',
    'باید بروم',
    'باید برم دیگه',
    'دیگه برم',
    'الان برم',
    'وقتشه برم',
    'وقتشه خداحافظی کنم',
    'وقت خداحافظیه',
    'وداع',
    'خداحافظی می‌کنم',
    'خداحافظی میکنم',
    'بعدا می‌بینمت',
    'بعداً می‌بینمت',
    'بعدا میبینمت',
    'مرسی تا بعد',
    'تا بعد',
    'exit',
    'quit'
  ];

  // A story that merely mentions a farewell («بهش بدرود گفتم») is not a
  // leave request. isExitCommand skips exit detection when this matches,
  // so the app layer never shows the exit-confirm bar for a past-tense
  // report. Present-tense forms are deliberately NOT listed: «الان بدرود
  // می‌گم» is a real farewell.
  const exitStoryPattern =
    /بدرود\s+گفت(?:م|ی|یم|ید|ند|ه)?|خداحافظ\s+گفت(?:م|ی|یم|ید|ند|ه)?/u;

  // Some exit keywords open everyday sentences that are not leave
  // requests: «می‌خوام برم» appears in «می‌خوام برم باشگاه ولی همه منو
  // قضاوت می‌کنن» (gym anxiety), «باید برم» in «باید برم دکتر؟» (health
  // question) and «برگردم دفتر» in «برگردم دفتر بهتره؟» (work advice).
  // The destination names the actual intent: going to a place or person
  // (doctor, gym, pharmacy, hospital, school, work) is not saying
  // goodbye. isExitCommand skips exit detection when this matches, so
  // the app layer never shows the exit-confirm bar for these everyday
  // plans. A bare «باید برم» with no destination stays a real farewell.
  const exitFalsePositivePattern =
    // eslint-disable-next-line max-len
    /(?:برم|بروم|بیام|بریم)\s*.{0,18}?(?:دکتر|پزشک|داروخانه|بیمارستان|باشگاه|ورزشگاه|مدرسه|دانشگاه|کلاس|سر کار|سرکار|اداره|خرید|سفر|مسافرت|خونه|خانه|پیش.{0,6}دکتر)|(?:برگردم|برمی‌گردم|برمیگردم).{0,18}?(?:دفتر|اداره|محل کار|شرکت)/u;

  // Phase 1 (warm presence): Darya's first message opens with a calm,
  // gentle invitation.

  // Phase 2 (gentle direction): Darya's second message offers a light,
  // low-pressure choice without going directly to deep emotions.

  // Response to repeated greetings: R.greetings: when the user says hello several
  // times in a row without answering the previous question, Darya gently
  // breaks the loop and invites a fresh start.

  // Response to word repetition: when the user repeats a word 4+ times
  // across recent messages, Darya names that word directly rather than
  // using a generic placeholder. {word} and {count} are substituted by
  // the engine at response time.

  // Response to frustration signals: when the user uses repeated
  // exclamation marks ("!!!"), repeated question marks ("???"), or
  // insulting language, Darya responds with extra calm.

  // Response to spam or random input: for short, repetitive, meaningless
  // text (e.g., "asdasd", "۱۲۳۴", "ffffff"), Darya replies gently and
  // without judgment.

  // Response to ambiguous input: for very short messages (1-2 words,
  // under 10 characters) that don't match any rule and are insufficient
  // for intent detection. These responses gently invite elaboration.

  // Response to short acknowledgements: when the user responds to
  // Darya's question with a brief, non-substantive answer (e.g.
  // "باشه", "آره", "خب"), Darya gently rephrases or repeats the question.

  // Response to mockery or sarcasm: when the user sends sarcastic
  // praise ("چه باهوشی!!!"), mocking agreement ("باشه باشه تو بردی"),
  // or dismissive signals, Darya responds with gentle understanding
  // rather than taking the sarcasm literally.

  const wellBeingPattern =
    // eslint-disable-next-line max-len
    /^(?:سلام|درود|هی|خب|اوکی|باشه)?\s*(?:خوبی|تو خوبی|خوبی تو|حالت خوبه|چطوری|چه خبر|حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|سلامتی|سلامت هستی|سلامتی می‌کنی|چیکار می‌کنی|چیکار میکنی|چیکار می کنی|چی کار می‌کنی|چی کار میکنی|چی کار می کنی|داری چیکار می‌کنی|داری چیکار میکنی|داری چیکار می کنی|چکار می‌کنی|چکار میکنی|چکار می کنی)(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?:\s*است)?(?:[!.؟]*\s+(?:خوبی|تو خوبی|خوبی تو|حالت خوبه|چطوری|چه خبر|حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|سلامتی|سلامت هستی|سلامتی می‌کنی|چیکار می‌کنی|چیکار میکنی|چیکار می کنی|چی کار می‌کنی|چی کار میکنی|چی کار می کنی|داری چیکار می‌کنی|داری چیکار میکنی|داری چیکار می کنی|چکار می‌کنی|چکار میکنی|چکار می کنی)(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?:\s*است)?)?[!.؟]*$/iu;

  // The vulgar "کس" family is matched only through unambiguous compounds
  // ("کسکش", the always-vulgar "کص" spelling, or the attached possessive
  // suffixes "کسم"/"کست"). A bare "کس" is deliberately NOT an insult:
  // in Persian it is the everyday word for "person" ("کس دیگه", "هر
  // کس"), and flagging it produced the false "keep this space respectful"
  // boundary replies that derailed real conversations.
  const insultPattern =
    // eslint-disable-next-line max-len
    /(?<!\p{L})(?:احمق|احمقی|کودن(?:ت|م|ش|ی)?|دیوونه|دیوونی|بی‌عقل|بیعقل|نادان|نادانم|نادانی|نادون|نادونی|پدوفیل|پدوفیلی|خاک\s*(?:به\s*|تو\s*|بر\s*)?سر(?:ت|م|ش)?|برو گمشو|برو بمیر|برو جهنم|برو به درک|مردک|حرومزاده|حرامزاده|فضول|دروغ گو(?:ی|یی)?|چرت|چرتی|مزخرف|هذیان|گوه\s*(?:می|م|خوری|خوره|خوریم|خورید|خورم|خورد|خوردی|خوردیم|نخور|بخور|تو|توی)|کثافت(?:ی|یی)?|کثیف|بی‌شعور|بیشعور|بی‌شرف|بیشرف|بی‌ادب|بیادب|خار|کون|کونی|دهن|کیری|گایید|کص|کسکش|کس\s*کش|کسم|کست|مادرت|مادرجنده|خواهرت|خفه|جاکش|احمقانه|نفهم|نفهمی|ابله|ابلهی|مسخره|مسخرهای|بی‌سواد|بیسواد|خر|گاو|گاوی|گاوصفت|سگ|سگی|خوک|خوکی|الاغ|الاغی|خری|گور|پدرسوخته|جنده|قحبه|فاحشه|دیوث|ملعون|لعنتی|نامرد|بی‌غیرت|بیغیرت|ننگ|آشغال|کیر|کیرم|کیرم تو|کصشر|کصخل|بی مصرف|بی مصرفی|بی ارزش|بی ارزشی|سیکیر|سیکیرم|سیکیرت|سیکیرش|سیکیرت|سیکتیر|سیکیر|سیکیرو|سیکیرمون)(?!\p{L})/iu;

  // Date/time question patterns (Persian). Time queries: asking the
  // current time. Date queries: asking the current date.
  const dateTimeTimePattern =
    // eslint-disable-next-line max-len
    /(?<!\p{L})(?:ساعت (?:چنده|چند|چقدره|چقدر)|الان ساعت (?:چنده|چند)|ساعت الان چند|time|ساعت را می‌گویی|ساعت رو بگو|وقت چنده)(?!\p{L})/iu;

  const dateTimeDatePattern =
    // eslint-disable-next-line max-len
    /(?<!\p{L})(?:تاریخ (?:امروز|چنده|چیست|رو بگو|رو می‌گی)|امروز (?:چندمه|چه روزیه|چه تاریخی|چند شنبه)|چند شنبه ایم|تاریخ شمسی|تاریخ ایرانی|تاریخ امروز چنده|what('?s| is) the date in iran|jalali date|persian date)(?!\p{L})/iu;

  // Year-only question (Persian): «امسال چه سالیه؟», «چه سالی
  // هستیم؟», «سال چندمه؟». The transcript failure «میتونی بگی امسال چه
  // سالیه؟» got the "interesting question" pool because the date pattern
  // only knew the full-date forms; the year answer reports both the
  // Jalali and Gregorian years.
  const dateTimeYearPattern =
    // eslint-disable-next-line max-len
    /(?<!\p{L})(?:امسال (?:چه سالیه|چه سالی|چندمه|چنده|چیست|رو بگو|رو می‌گی)|الان چه سالیه|چه سالی (?:هستیم|هستیم|ام|ایم)|سال چندم|سال چنده|امسال چند|what year is it in iran|jalali year|persian year|سال شمسی)(?!\p{L})/iu;

  // Darya-targeted harassment (Persian): insults and bullying
  // specifically directed at Darya.
  const daryaHarassmentPattern =
    // eslint-disable-next-line max-len
    /(?<!\p{L})(?:دریا (?:تو|)(?:\s+)(?:احمق|کودن|دیوونه|بی‌عرضه|بی‌خاصیت|چرتی|مسخره|کصکش|کونی|بی‌شعور|بی‌سواد|نفهم|ابله|بد|کثیف|چقدر بدی|چقدر بی مصرفی|به دردم نمیخوری)|تو (?:یک |یه )?(?:ربات )?(?:احمق|احمقی|کودن|کونی|کصکش|کصخل|مسخره|مسخره ای|بدبخت|چرتی|بی خاصیت|بی شعور|بیشعور|نفهم|بی سواد|بیسواد|بی ارزش|بی ارزشی|بی مصرف|بی مصرفی|جوک|جوکی|هیچی نمی فهمی|هیچی نمیفهمی|آزمایش شکست خورده|بی عرضه|بدرد نمی خوری|ابله|دیوونه|کثیف|آشغال)|ربات (?:کصخل|احمق|کونی|چرتی|بی شعور|مسخره|بی ارزش|بی مصرف|بی عرضه|بدرد نمی خوری)|(?:برو گمشو|خفه شو|حرف نزن|ولم کن|ازت بدم میاد|ازت بدم می آد)|(?:ممنون|مرسی|تشکر) از (?:هیچی|هیچ))(?!\p{L})/iu;

  // Sexual or inappropriate comments (Persian). Only explicitly sexual
  // terms are listed: everyday words like "ببینم" (let me see), "ببینمت"
  // (see you), "داغ" (hot), "عشق" (love), "نشان بده" (show me), "بیا
  // بیرون" (come out) and "بکنم" (I will do it) are far too common in
  // innocent speech and must never trip the harassment gate.
  // The bare "کس" (person) is deliberately excluded: in "کس دیگه",
  // "هیچ کس", and "هر کس" it means "someone", and the vulgar sense is
  // carried by unambiguous compounds (کص, کسکش, کسم, کست) already listed
  // in the insult pattern above. Same homograph rule as the insult gate.
  const sexualHarassmentPattern =
    // eslint-disable-next-line max-len
    /(?<!\p{L})(?:سکسی|بوس(?:یدن|ید)?|ببوس|بیا (?:بستر|تخت|پیشم|خونه)|بدنت(?:و| رو)|سینه(?: هات|ت)|کون(?:ت)?|ساک(?: بزن| کن)|بکنمت|جنده|قحبه|بزن قدش|عریان|لخت|برهنه)(?!\p{L})/iu;

  global.DaryaFaData = {
    trivialCaptures,
    familyTerms,
    professionTerms,
    placeWords,
    entityCallbackTemplates,
    questionPattern,
    pronounMap,
    exitKeywords,
    exitStoryPattern,
    exitFalsePositivePattern,
    wellBeingPattern,
    insultPattern,
    dateTimeTimePattern,
    dateTimeDatePattern,
    dateTimeYearPattern,
    daryaHarassmentPattern,
    sexualHarassmentPattern
  };
})(typeof window !== 'undefined' ? window : globalThis);
