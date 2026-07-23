/**
 * Darya (دریا) — Persian language pack.
 *
 * Everything language-specific lives here: normalization rules, the
 * conversation rule set, fallback pools, a small sentiment lexicon, and
 * every piece of UI copy. `js/darya-engine.js` is entirely generic and
 * just consumes whichever pack is handed to it, so Persian and English
 * get identical engine capabilities with zero compromises on either side.
 */

(function (global) {
  'use strict';

  const BOT_NAME = 'دریا';

  // Persian/Arabic Unicode blocks, including presentation-form supplements
  // some fonts/keyboards produce.
  const SCRIPT_RANGE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

  const FALLBACK_SUBSTITUTIONS = [
    ['ي', 'ی'], // Arabic yeh -> Persian yeh
    ['ك', 'ک'], // Arabic kaf -> Persian kaf
    ['ة', 'ه'], // teh marbuta -> heh
    ['ۀ', 'ه'],
  ];

  /**
   * Normalizes raw Persian input for reliable pattern matching: unifies
   * look-alike Arabic/Persian characters and collapses ASCII whitespace.
   * Zero-width non-joiners (half-spaces, e.g. "می‌خواهم") are intentionally
   * left intact since they are meaningful in Persian orthography.
   */
  // Arabic diacritics (harakat/tashkil): fatha, damma, kasra, sukun,
  // shadda, tanwin, and the superscript alef. These are combining marks
  // that occasionally show up from certain keyboards or copy-pasted text
  // (e.g. Quranic-style input methods) and, left in place, would prevent
  // an otherwise-identical word from matching a rule's literal keyword.
  const DIACRITICS_PATTERN = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0670]/g;

  // Arabic-Indic and Extended Arabic-Indic digits, mapped to their
  // Persian (Eastern Arabic) equivalents, so "1" written with a different
  // regional digit set still reads consistently.
  const ARABIC_TO_PERSIAN_DIGITS = {
    '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴', '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹',
  };

  /**
   * Normalizes raw Persian input for reliable pattern matching. This goes
   * a fair bit further than a plain character swap:
   *
   *   1. Unicode NFKC normalization: folds Arabic-script presentation
   *      forms and ligatures (the kind some keyboards/fonts produce for
   *      joined letter shapes) down to their standard, decomposed form,
   *      so a word typed with those glyphs still matches a rule written
   *      with ordinary letters. This is a single built-in JS method, no
   *      library required.
   *   2. Character unification for known Arabic/Persian look-alikes
   *      (yeh, kaf, teh marbuta) that NFKC alone doesn't merge, since
   *      they're distinct letters, not alternate forms of the same one.
   *   3. Diacritic stripping, so vocalized text still matches plain text.
   *   4. Digit unification (Arabic-Indic -> Persian digits).
   *   5. Half-space (ZWNJ) correction for the most common cases where
   *      people type a full space, or no space at all, around the "می"
   *      and "نمی" verb prefixes -- e.g. "می خواهم" or "میخواهم" both
   *      become "می‌خواهم", matching how the rules themselves are written.
   *   6. Whitespace collapsing.
   *
   * This is a genuinely more capable normalizer than a single character
   * swap, but it is not a replacement for a real Persian NLP toolkit like
   * `hazm` (which the original Python implementation used): it
   * doesn't stem, lemmatize, tokenize, or tag parts of speech. Matching
   * still relies on the curated suffix list in `SUFFIX` below rather than
   * true morphological analysis, since that's what's achievable without
   * a server or a large model running in the browser.
   */
  function normalize(text) {
    return global.DaryaHalfspace.normalize(text);
  }

  function rule(topic, priority, pattern, responses) {
    return { topic, priority, pattern, responses };
  }

  // A curated set of common Persian pronominal/verb suffixes that attach
  // directly to a keyword with no space, e.g. "غمگین" -> "غمگینم" ("I am
  // sad"). Recognizing exactly these (rather than allowing *any* trailing
  // character) keeps matching accurate for real inflected forms while
  // still rejecting unrelated compounds -- e.g. it correctly stops "پدر"
  // ("father") from falsely matching inside "پدربزرگ" ("grandfather"),
  // since "بزرگ" isn't one of these suffixes.
  const SUFFIX = '(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?';

  /**
   * Builds a Persian-script-aware "whole word" pattern. `\b` doesn't work
   * for Persian text in JavaScript regex (it's defined in terms of ASCII
   * word characters), so this uses explicit lookaround instead: the
   * keyword (plus an optional common suffix) must not be directly
   * preceded or followed by another letter.
   *
   * The boundary check uses `\p{L}` (Unicode "is this a letter at all")
   * rather than a raw `[\u0600-\u06FF]` code-point range. That range
   * looks like it should mean "a Persian/Arabic letter", but the same
   * Unicode block also contains Arabic-script *punctuation* -- notably
   * "؟" (U+061F, the Persian question mark) -- so a raw range check
   * would treat "حالت چطور؟" as if "چطور" were followed by another
   * letter and incorrectly refuse to match. By the time this pattern
   * runs, the message has already passed the engine's overall
   * Persian-script check, so "any letter" is an accurate enough proxy
   * for "a Persian letter" here.
   * @param {string} alternatives - A `|`-joined list of keyword forms.
   * @param {string} [tail] - Extra pattern appended after the boundary
   *   check, e.g. `\s*(.*)` for rules that capture the rest of the
   *   sentence.
   * @returns {RegExp}
   */
  function pw(alternatives, tail) {
    return new RegExp(
      `(?<!\\p{L})(${alternatives})${SUFFIX}(?!\\p{L})${tail || ''}`,
      'iu'
    );
  }

  const rules = [
    rule('safety', 100, pw('خودکشی|خودزنی|آسیب زدن به خودم|دیگه نمیخوام زندگی کنم|دیگه نمی‌خوام زندگی کنم'), [
      'شنیدن این حرف از شما برایم بسیار مهم است و می‌خواهم بدانید که تنها نیستید. آیا در همین نزدیکی کسی هست که بتوانید همین حالا با او تماس بگیرید یا به او سر بزنید؟',
      'این احساس بسیار سنگینی است و شایسته‌ی توجه فوری است. لطفاً با یک خط بحران یا فرد قابل‌اعتمادی در همین لحظه تماس بگیرید؛ من در کنار شما هستم اما جای کمک تخصصی و فوری را نمی‌گیرم.',
    ]),

    rule('grief', 55, pw('فوت کرد|درگذشت|فقدان|از دست دادم|از دستش دادم'), [
      'از دست دادن، از سخت‌ترین تجربه‌های زندگی است. می‌خواهید کمی درباره‌اش بگویید؟',
      'برای این فقدان، هر حسی که دارید طبیعی است. این روزها چطور با آن کنار می‌آیید؟',
      'دوست دارید درباره‌اش برایم بگویید؟',
    ]),

    rule('smalltalk_howareyou', 60, pw('حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|چطوری|حالت خوبه'), [
      'خوبم، ممنون که پرسیدید! خوشحالم که اینجا کنار شما هستم. حال شما چطور است؟',
      'حس خوبی دارم، ممنون! دوست دارم بدانم حال شما چطور است.',
    ]),

    rule('smalltalk_identity', 60, pw('تو کی هستی|تو چی هستی|اسمت چیه|تو ربات هستی|هوش مصنوعی هستی|تو واقعی هستی|انسان هستی'), [
      'من دریا هستم، همراهی که اینجاست تا به حرف‌هایتان گوش بدهد. یک درمانگر یا انسان واقعی نیستم، فقط یک فضای آرام برای فکر کردن با صدای بلند.',
      'من یک همراه گفتگوی ساده‌ام، نه یک انسان واقعی؛ اما همین‌جا هستم تا با تمام وجود گوش بدهم.',
    ]),

    rule('smalltalk_capability', 60, pw('چیکار می‌تونی بکنی|چه کمکی می‌تونی بکنی|چیکار میکنی|چه کاری بلدی|چطور میتونی کمکم کنی|چیکار می‌کنی'), [
      'من اینجا هستم تا به حرف‌هایتان گوش بدهم، سؤال بپرسم، و کنارتان باشم وقتی چیزی ذهن‌تان را درگیر کرده. جای یک متخصص را نمی‌گیرم، اما یک شنونده‌ی صبور هستم.',
      'می‌توانم همراه خوبی برای فکر کردن با صدای بلند باشم؛ گوش می‌دهم و سؤال‌هایی می‌پرسم که کمک کند احساس‌تان برایتان روشن‌تر شود.',
    ]),

    rule('family', 50, pw('پدربزرگ|مادربزرگ|پدر|مادر|خانواده|والدین|خواهر|برادر', '\\s*(.*)'), [
      'درباره‌ی {captured} بیشتر برایم بگویید.',
      'رابطه‌ی شما با خانواده‌تان چه حسی در شما ایجاد می‌کند؟',
      'وقتی به {captured} فکر می‌کنید، چه احساسی سراغتان می‌آید؟',
      'چه چیزی باعث شد الآن یاد {captured} بیفتید؟',
    ]),

    rule('work', 50, pw('کار|شغل|رئیس|همکار|استخدام|اخراج', '\\s*(.*)'), [
      'کار و شغل گاهی بار سنگینی روی دوش‌مان می‌گذارد. {captured} چطور بر شما اثر گذاشته؟',
      'درباره‌ی شرایط کاری‌تان بیشتر بگویید؛ چه چیزی بیش از همه آزارتان می‌دهد؟',
      'اگر شرایط کاری‌تان بهتر بود، چه چیزی فرق می‌کرد؟',
    ]),

    rule('sleep', 50, pw('خواب|بی‌خوابی|بیخوابی|کابوس'), [
      'به نظر می‌رسد خواب‌تان این روزها آرام نیست. از کِی این‌طور شده؟',
      'بی‌خوابی می‌تواند نشانه‌ی نگرانی‌های پنهانی باشد. این روزها چه چیزی ذهن‌تان را مشغول کرده؟',
      'وقتی نمی‌توانید بخوابید، ذهن‌تان معمولاً کجا می‌رود؟',
    ]),

    rule('sadness', 40, pw('غمگین|ناراحت|افسرده|دلم گرفته|گریه'), [
      'می‌شنوم که این روزها غم زیادی همراه‌تان است. دوست دارید بیشتر درباره‌اش صحبت کنیم؟',
      'غمگین بودن سخت است. چه چیزی این حس را در شما به وجود آورده؟',
      'اجازه بدهید کمی بیشتر در این احساس بمانیم؛ از کِی این‌طور احساس می‌کنید؟',
      'این غم را کجای بدن‌تان بیشتر حس می‌کنید؟',
    ]),

    rule('anxiety', 40, pw('نگران|اضطراب|استرس|ترسیدم|می‌ترسم|میترسم'), [
      'اضطراب می‌تواند خیلی خسته‌کننده باشد. دقیقاً چه چیزی نگران‌تان کرده؟',
      'وقتی این استرس سراغتان می‌آید، در بدن‌تان چه احساسی دارید؟',
      'از ۱ تا ۱۰، الآن این نگرانی چقدر شدید است؟',
    ]),

    rule('anger', 40, pw('عصبانی|خشمگین|کفری|از دستش عصبانی'), [
      'به نظر می‌رسد خشم زیادی در شما جمع شده. چه چیزی باعث این خشم شده؟',
      'عصبانیت شما قابل‌درک است. مایلید بگویید دقیقاً چه اتفاقی افتاد؟',
      'این خشم را در کدام قسمت از بدن‌تان بیشتر حس می‌کنید؟',
    ]),

    rule('joy', 35, pw('خوشحال|شاد|هیجان‌زده|هیجان زده'), [
      'خوشحالم که این حس خوب را تجربه می‌کنید! چه چیزی باعثش شده؟',
      'شنیدن این خبر خوب است. دوست دارید بیشتر درباره‌اش بگویید؟',
      'این حس خوب را در بدنتان کجا حس می‌کنید؟',
    ]),

    rule('loneliness', 40, pw('تنها|تنهایی|کسی رو ندارم|هیچ‌کس نیست'), [
      'تنهایی می‌تواند حس سنگینی باشد. این حس از کِی همراه‌تان است؟',
      'وقتی می‌گویید تنها هستید، منظورتان بیشتر نبود کسی برای صحبت است یا حسی عمیق‌تر از جدا بودن؟',
      'در این روزها، چه کسی نزدیک‌ترین فرد به شماست، حتی اگر کم می‌بینیدش؟',
    ]),

    rule('self_esteem', 40, pw('بی‌ارزش|بی ارزش|اعتماد به نفس ندارم|از خودم بدم میاد|به اندازه کافی خوب نیستم'), [
      'این حرف‌ها درباره‌ی خودتان سنگین‌اند. این باور از کجا شکل گرفته؟',
      'وقتی این فکرها می‌آیند، چه چیزی معمولاً باعثشان می‌شود؟',
      'اگر یک دوست همین حرف را درباره‌ی خودش می‌زد، به او چه می‌گفتید؟',
    ]),

    rule('motivation', 35, pw('انگیزه ندارم|بی‌حوصله|بیحوصلگی|نمی‌تونم شروع کنم|تعلل می‌کنم'), [
      'وقتی انگیزه نیست، حتی کارهای کوچک هم سنگین می‌شوند. این حس از کِی شروع شده؟',
      'اگر یک قدم خیلی کوچک بردارید، چه چیزی می‌تواند باشد؟',
      'چه چیزی معمولاً کمک می‌کند دوباره شروع کنید، حتی کمی؟',
    ]),

    rule('relationship', 40, pw('دوست پسر|دوست دختر|همسر|نامزد|بهم زدیم|جدا شدیم|رابطه‌ام'), [
      'روابط می‌توانند هم عمیق‌ترین شادی‌ها و هم سخت‌ترین لحظات را بسازند. چه اتفاقی افتاده؟',
      'الآن بیشتر دنبال این هستید که با من درد دل کنید یا به راه‌حلی فکر کنید؟',
      'این رابطه چه جایگاهی در زندگی‌تان دارد؟',
    ]),

    rule('health', 35, pw('مریض|بیمار|درد دارم|سلامتی|دکتر رفتم'), [
      'نگرانی درباره‌ی سلامتی می‌تواند خیلی ذهن را درگیر کند. چه چیزی بیشتر نگران‌تان کرده؟',
      'آیا با پزشک درباره‌اش صحبت کرده‌اید؟',
      'این موضوع چقدر روی روزهای اخیرتان اثر گذاشته؟',
    ]),

    rule('gratitude', 25, pw('ممنون|سپاسگزار|قدردان|خوشحالم که هستی'), [
      'شنیدن این حرف برایم دلگرم‌کننده است، ممنون که گفتید.',
      'خوشحالم که این گفتگو براتون مفید بوده.',
      'حضور شما هم برای من ارزشمند است.',
    ]),

    rule('school', 35, pw('امتحان|کنکور|دانشگاه|نمره|استاد'), [
      'فشار درس و امتحان می‌تواند واقعاً خسته‌کننده باشد. الآن دقیقاً چه چیزی فشار می‌آورد؟',
      'چقدر به این امتحان یا دوره مانده؟ و چه حسی نسبت بهش دارید؟',
      'چه چیزی می‌تواند کمی از این فشار کم کند؟',
    ]),

    rule('money', 35, pw('پول ندارم|مشکل مالی|بدهکار|قسط|هزینه‌ها'), [
      'نگرانی مالی می‌تواند روی خیلی چیزهای دیگر هم سایه بیندازد. چقدر این موضوع این روزها ذهن‌تان را درگیر کرده؟',
      'این نگرانی مالی از کِی شروع شده؟',
      'آیا کسی هست که بتوانید درباره‌ی این موضوع با او مشورت کنید؟',
    ]),

    rule('feeling', 30, /(?<!\p{L})(?:احساس می‌کنم|حس می‌کنم|فکر می‌کنم)(?!\p{L})\s*(.*)/iu, [
      'چرا فکر می‌کنید که {captured}؟',
      'از کِی این‌طور احساس می‌کنید که {captured}؟',
      'بیشتر توضیح می‌دهید که چرا {captured}؟',
      'اگر این احساس نبود، چه چیزی جایش را می‌گرفت؟',
    ]),

    rule('reasoning', 25, /(?<!\p{L})(?:چونکه|چون)(?!\p{L})\s*(.*)/iu, [
      'آیا این تنها دلیل آن است؟',
      'و آیا فکر می‌کنید این دلیل، همه‌ی ماجراست؟',
      'چه دلیل دیگری هم می‌تواند در کار باشد؟',
    ]),

    rule('need', 25, /(?<!\p{L})(?:نیاز دارم|می‌خواهم|میخوام|دلم می‌خواد)(?!\p{L})\s*(.*)/iu, [
      'اگر {captured} داشتید، چه چیزی در زندگی‌تان تغییر می‌کرد؟',
      'چه چیزی مانع رسیدن شما به {captured} شده؟',
      'اولین قدم کوچک به سمت {captured} چه می‌تواند باشد؟',
    ]),

    rule('affirmation', 15, /^(بله|آره|اره)\.?$/i, [
      'متوجه شدم. کمی بیشتر توضیح می‌دهید؟',
      'خب. چه چیز دیگری در این‌باره به ذهنتان می‌رسد؟',
    ]),

    rule('negation', 15, /^(نه|خیر)\.?$/i, [
      'باشه، اشکالی نداره. پس چه چیزی به ذهنتان می‌رسد؟',
      'متوجه‌ام. مایلید موضوع دیگری را مطرح کنید؟',
    ]),
  ];

  const trivialCaptures = new Set([
    'هستم', 'هستی', 'هست', 'هستیم', 'هستید', 'هستند', 'است', 'بود',
    'بودم', 'بودی', 'بودیم', 'بودید', 'بودند', 'شد', 'شدم', 'شدی', 'ام',
  ]);

  const genericFallbacks = [
    'بیشتر برایم توضیح می‌دهید؟',
    'این موضوع برایتان چه اهمیتی دارد؟',
    'لطفاً کمی بیشتر درباره‌اش بگویید.',
    'متوجه شدم. و بعدش چه شد؟',
    'چه چیزی باعث شد این را با من در میان بگذارید؟',
  ];


  // Vocabulary consumed by the language-neutral named-entity extractor.
  // These are deliberately short, emotionally salient surfaces rather than
  // an attempt to enumerate every Persian noun.
  const familyTerms = [
    'پدر', 'پدرم', 'مادر', 'مادرم', 'پدربزرگ', 'مادربزرگ', 'خواهر', 'خواهرم', 'برادر', 'برادرم', 'همسر',
    'نامزد', 'دوست', 'خانواده', 'والدین', 'فرزند', 'دخترم', 'پسرم',
  ];
  const professionTerms = [
    'کار', 'شغل', 'رئیس', 'همکار', 'دانشگاه', 'مدرسه', 'امتحان', 'کنکور',
    'پروژه', 'جلسه', 'پزشک', 'دکتر', 'درمانگر', 'استاد', 'دانشجو',
  ];
  const placeWords = [
    'خانه', 'اتاق', 'مدرسه', 'دانشگاه', 'محل کار', 'دفتر', 'تهران', 'شیراز',
    'شهر', 'روستا', 'پارک', 'بیمارستان', 'اینجا', 'آنجا',
  ];

  const entityCallbackTemplates = {
    person: ['کمی قبل‌تر از {surface} گفتید؛ دوست دارید بیشتر درباره‌اش بگویید؟'],
    place: ['آن جایی که گفتید، یعنی {surface}، هنوز در ذهن‌تان هست؟'],
    time: ['به {surface} اشاره کردید. این زمان چه حسی برایتان دارد؟'],
    activity: ['درباره‌ی {surface} گفتید؛ الآن بیشتر کدام بخشش ذهن‌تان را درگیر کرده؟'],
    object: ['یادم هست از {surface} گفتید. دوست دارید کمی بیشتر روی آن مکث کنیم؟'],
  };

  const strategyShiftFallbacks = [
    'بیایید از زاویه‌ای تازه نگاه کنیم؛ کدام بخش این موضوع برایتان پررنگ‌تر است؟',
    'اگر این حس را برای یک دوست توصیف کنید، از کجا شروع می‌کنید؟',
    'در کنار این موضوع، چه چیز دیگری این روزها در ذهن‌تان جا گرفته است؟',
    'چه چیزی می‌تواند همین لحظه را کمی قابل‌تحمل‌تر کند؟',
  ];

  const sessionCheckIns = [
    'در این گفتگو درباره‌ی چند موضوع مختلف صحبت کردیم. کدام‌شان الآن بیشتر ذهن‌تان را درگیر کرده؟',
    'تا اینجا چیزهای زیادی گفتید. مایلید روی یکی‌شان بیشتر مکث کنیم؟',
  ];

  // Matches Persian question marks and the most common question words, so
  // the engine can tell an interrogative sentence apart from a statement
  // even when a specific rule doesn't cover what's being asked.
  const questionPattern = /[؟?]|(?<!\p{L})(چرا|چطور|چگونه|چیست|چیه|کجا|کیه|کیست|آیا|کدام|چقدر|چند)(?!\p{L})/u;

  const questionFallbacks = [
    'سؤال خوبی پرسیدید. جواب دقیقی براش ندارم، اما کنجکاوم بدونم چی باعث شده این سؤال براتون پیش بیاد؟',
    'این سؤالی است که ارزش فکر کردن دارد. خودتان چه فکری درباره‌اش دارید؟',
  ];

  const topicCallbacks = {
    family: ['راستی، هنوز درباره‌ی خانواده‌تان کنجکاوم؛ می‌خواهید ادامه دهیم؟'],
    work: ['پیش‌تر درباره‌ی کارتان صحبت می‌کردیم؛ دوست دارید به آن برگردیم؟'],
    sleep: ['وضعیت خواب‌تان این روزها چطور است؟'],
    sadness: ['هنوز هم آن حس غم همراه‌تان است؟'],
    anxiety: ['آن نگرانی که گفته بودید، هنوز پابرجاست؟'],
    anger: ['آیا آن خشم هنوز در شماست؟'],
    loneliness: ['آن حس تنهایی که گفته بودید، هنوز همراه‌تان است؟'],
    self_esteem: ['آن فکرهای سخت درباره‌ی خودتان، هنوز سراغتان می‌آیند؟'],
    grief: ['دوست دارید بازهم درباره‌ی آن فقدان صحبت کنیم؟'],
    motivation: ['هنوز هم پیدا کردن انگیزه سخت است؟'],
    relationship: ['وضعیت آن رابطه چطور پیش می‌رود؟'],
    health: ['حال‌تان از نظر جسمی چطور است؟'],
    school: ['وضعیت درس و امتحان‌ها چطور پیش می‌رود؟'],
    money: ['نگرانی مالی‌ای که گفته بودید، هنوز هست؟'],
  };

  // A safe, language-agnostic-in-spirit callback: quoting the person's own
  // earlier words back to them is a core reflective-listening technique
  // and carries no grammar risk (their words are inserted verbatim).
  const quotedCallbackTemplates = [
    'کمی قبل‌تر گفتید: «{excerpt}». دوست دارید بیشتر درباره‌اش بگوییم؟',
    'یادم است گفتید: «{excerpt}». هنوز ذهن‌تان درگیر آن است؟',
  ];

  // Gentle, optional coping offer shown when several consecutive messages
  // read as emotionally heavy. Not a diagnosis, not a substitute for
  // professional support -- just a caring pause and a well-known,
  // low-risk grounding technique (paced breathing).
  const distressNudges = [
    'به نظر می‌رسد چند پیام اخیرتان نسبتاً سنگین بوده‌اند. اگر دوست دارید، یک لحظه مکث کنیم: چهار شماره نفس بکشید، چهار شماره نگه دارید، چهار شماره بازدم بدهید. اگر این احساس‌ها ادامه داشت یا شدت گرفت، صحبت با یک متخصص یا فرد مورد اعتمادتان می‌تواند خیلی کمک‌کننده باشد.',
    'می‌بینم این بخش از گفتگو برایتان سنگین بوده. لازم نیست همین الآن حلش کنیم؛ اگر خواستید، می‌توانیم چند لحظه فقط مکث کنیم. و اگر این حس‌ها ادامه داشتند، صحبت با یک متخصص یا فردی که به او اعتماد دارید می‌تواند کمک بزرگی باشد.',
  ];

  const sentimentLexicon = {
    negative: [
      'غمگین', 'ناراحت', 'افسرده', 'خسته', 'نگران', 'اضطراب', 'استرس', 'تنها',
      'ترسیده', 'می‌ترسم', 'میترسم', 'عصبانی', 'خشمگین', 'ناامید', 'بی‌حوصله',
      'گریه', 'درد', 'دلتنگ', 'بی‌ارزش', 'داغون', 'وحشتناک', 'بد', 'سخت‌ترین',
    ],
    positive: [
      'خوشحال', 'شاد', 'عالی', 'ممنون', 'سپاسگزار', 'آرام', 'امیدوار', 'راحت',
      'خوب', 'عاشق', 'قدردان', 'سبک', 'خوشایند', 'دوست‌داشتنی', 'رضایت',
    ],
  };

  // Pronoun-swap reflection is intentionally NOT enabled for Persian: verb
  // conjugation carries person/number in the verb ending itself (not just
  // a separate pronoun), so a naive word-swap would frequently produce
  // ungrammatical sentences. English's simpler pronoun morphology makes
  // that technique reliable there instead (see en.js).
  const pronounMap = null;

  const exitKeywords = [
    'بدرود', 'خداحافظ', 'خدانگهدار', 'میخوام برم', 'می‌خوام برم', 'exit', 'quit',
  ];

  const greetingsOpen = [
    `درود! من ${BOT_NAME} هستم. دوست دارید امروز درباره‌ی چه چیزی برایم بگویید؟`,
    `سلام، من ${BOT_NAME} هستم و گوش می‌دهم. چه چیزی این روزها در ذهن‌تان مانده است؟`,
  ];
  const greetingsInviting = [
    `سلام! من ${BOT_NAME} هستم. هر چیزی که این روزها سنگین‌تان کرده، می‌توانید با من در میان بگذارید و برایم بگویید.`,
    `درود بر شما. من ${BOT_NAME}‌ام؛ از هر چیزی که دوست دارید شروع کنید و برایم بگویید.`,
  ];
  const greetingsReturning = [
    `خوش آمدید. من ${BOT_NAME} هستم؛ این بار دوست دارید از کدام فکر یا احساس شروع کنیم؟`,
    `سلام دوباره. چه چیزی اکنون بیشتر از همه دوست دارد شنیده شود؟`,
  ];
  const greetings = [...greetingsOpen, ...greetingsInviting, ...greetingsReturning];

  const farewells = [
    'بدرود، مراقب خودتان باشید. هر وقت خواستید صحبت کنیم، اینجا هستم.',
    'بدرود عزیز. امیدوارم امروز کمی سبک‌تر شده باشید.',
    'به امید دیدار دوباره. بدرود و مراقب دل خودتان باشید.',
  ];

  const emptyInputReply = 'می‌شنوم که سکوت کرده‌اید. هر وقت آماده بودید، صحبت کنید.';

  function foreignLanguageRedirect() {
    return `من ${BOT_NAME} هستم و تنها به زبان فارسی گفت‌وگو می‌کنم، تا بتوانم بهترین همراهی را داشته باشم. لطفاً پیام‌تان را به فارسی بنویسید تا ادامه دهیم.`;
  }

  global.DaryaLang = global.DaryaLang || {};
  global.DaryaLang.fa = {
    code: 'fa',
    dir: 'rtl',
    botName: BOT_NAME,
    scriptRange: SCRIPT_RANGE,
    minScriptRatio: 0.85,
    normalize,
    rules,
    trivialCaptures,
    genericFallbacks,
    strategyShiftFallbacks,
    sessionCheckIns,
    checkInEvery: 8,
    questionPattern,
    questionFallbacks,
    topicCallbacks,
    quotedCallbackTemplates,
    distressNudges,
    sentimentLexicon,
    pronounMap,
    familyTerms,
    professionTerms,
    placeWords,
    entityCallbackTemplates,
    exitKeywords,
    greetings,
    greetingsOpen,
    greetingsInviting,
    greetingsReturning,
    // Keep the historical misspelling as a read-only compatibility alias;
    // old callers used greentings* before the pools were made explicit.
    greentingsOpen: greetingsOpen,
    greentingsInviting: greetingsInviting,
    greentingsReturning: greetingsReturning,
    farewells,
    emptyInputReply,
    foreignLanguageRedirect,
    ui: {
      appTitle: 'دریا · همراه گفتگوی آرام',
      appDescription: 'دریا، همراه گفتگوی فارسی‌زبان برای گوش دادن و همراهی.',
      placeholderDefault: 'هر چه در دل دارید بنویسید…',
      placeholderEnded: 'گفتگو پایان یافت. برای شروع دوباره، از منو «گفتگوی تازه» را بزنید',
      ariaSendLabel: 'ارسال پیام به دریا',
      ariaMenuLabel: 'باز کردن منوی گزینه‌های گفتگو',
      ariaInputLabel: 'پیام شما به دریا',
      pickerFaTitle: 'شروع گفتگوی تازه به زبان فارسی',
      pickerEnTitle: 'شروع گفتگوی تازه به زبان انگلیسی',
      themeOceanTitle: 'انتخاب تم اقیانوس',
      themeBeachTitle: 'انتخاب تم ساحل',
      sendButtonTitle: 'ارسال پیام فعلی',
      menuTriggerTitle: 'باز کردن منوی گزینه‌های گفتگو',
      newChatTitle: 'شروع گفتگوی تازه',
      exportMdTitle: 'دانلود گفتگو با قالب مارک‌داون',
      exportTxtTitle: 'دانلود گفتگو به صورت متن ساده',
      themeToggleTitle: 'تغییر تم گفتگو',
      menuNewChat: 'گفتگوی تازه',
      menuExportMd: 'دانلود گفتگو — مارک‌داون',
      menuExportTxt: 'دانلود گفتگو — متن ساده',
      themeOceanLabel: 'تم اقیانوس',
      themeBeachLabel: 'تم ساحل',
      disclaimer: 'دریا یک همراه شنونده است، نه جایگزین کمک تخصصی. در شرایط بحرانی، لطفاً با یک متخصص یا خط بحران تماس بگیرید.',
      foreignScriptHint: 'لطفاً فقط به زبان فارسی بنویسید تا بتوانم همراهی‌تان کنم.',
      exportTitle: `گفت‌وگو با ${BOT_NAME}`,
      exportYouLabel: 'شما',
      exportDivider: '-----------------------------',
      dateLocale: 'fa-IR',
      connectionError: 'در برقراری ارتباط مشکلی پیش آمد. لطفاً صفحه را دوباره بارگذاری کنید.',
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
