/**
 * Darya classic script.
 */

(function (global) {
  'use strict';

  // Long lines in this file are intentional (embedded response pools,
  // regex patterns, and knowledge entries).
  /* eslint-disable max-len */

  // Load response pools from the data file.
  var R = global.DaryaFaResponses;
  var halfSpace = global.DaryaHalfspace.halfSpace;

  const BOT_NAME = 'دریا';

  // Persian/Arabic Unicode blocks, including presentation-form supplements
  // some fonts/keyboards produce.
  const SCRIPT_RANGE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

  /**
   * Normalizes raw Persian input for reliable pattern matching: unifies
   * look-alike Arabic/Persian characters and collapses ASCII whitespace.
   * Zero-width non-joiners (half-spaces, e.g. "می‌خواهم") are intentionally
   * left intact since they are meaningful in Persian orthography.
   */
  // Arabic-Indic and Extended Arabic-Indic digits, mapped to their
  // Persian (Eastern Arabic) equivalents, so "1" written with a different
  // regional digit set still reads consistently.
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
   *      and "نمی" verb prefixes, e.g. "می خواهم" or "میخواهم" both
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
    return halfSpace(text);
  }

  function rule(topic, priority, pattern, responses) {
    return { topic, priority, pattern, responses };
  }

  // A curated set of common Persian pronominal/verb suffixes that attach
  // directly to a keyword with no space, e.g. "غمگین" -> "غمگینم" ("I am
  // sad"). Recognizing exactly these (rather than allowing *any* trailing
  // character) keeps matching accurate for real inflected forms while
  // still rejecting unrelated compounds, e.g. it correctly stops "پدر"
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
   * The boundary check uses `p{L}` (Unicode "is this a letter at all")
   * rather than a raw `[\u0600-\u06FF]` code-point range. That range
   * looks like it should mean "a Persian/Arabic letter", but the same
   * Unicode block also contains Arabic-script *punctuation*, notably
   * "؟" (U+061F, the Persian question mark), so a raw range check
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
    rule(
      'safety',
      100,
      pw(
        'خودکشی|خودزنی|آسیب زدن به خودم|دیگه نمیخوام زندگی کنم|دیگه نمی‌خوام زندگی کنم|دیگه نمی خوام زندگی کنم'
      ),
      R['ruleSafety']
    ),

    rule(
      'grief',
      55,
      pw(
        'فوت کرد|درگذشت|فقدان|از دست دادم|از دستش دادم|سوگ|داغداری|عزاداری|سوگواری'
      ),
      R['ruleGrief']
    ),

    rule(
      'smalltalk_howareyou',
      60,
      // The whole utterance must be a how-are-you question. Anchoring
      // prevents the bare word "خوبی" (goodness) from matching mid-sentence
      // in phrases like "جمله خوبی گفتی" (you said a good sentence) and
      // hijacking the turn with a how-are-you reply. The optional "است"
      // tail keeps the formal "حال شما چطور است؟" working.
      /^(?:سلام|درود|هی|خب|اوکی|باشه)?\s*(?:خوبی|تو خوبی|خوبی تو|حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|چطوری|حالت خوبه)(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?:\s*است)?[!.؟]*$/iu,
      R['ruleSmalltalkHowareyou']
    ),

    rule(
      'smalltalk_identity',
      60,
      pw(
        'تو کی هستی|تو چی هستی|اسمت چیه|تو ربات هستی|هوش مصنوعی هستی|تو واقعی هستی|انسان هستی'
      ),
      R['ruleSmalltalkIdentity']
    ),

    rule(
      'smalltalk_capability',
      60,
      pw(
        'چیکار می‌تونی بکنی|چیکار میتونی بکنی|چیکار می تونی بکنی|چه کمکی می‌تونی بکنی|چه کمکی میتونی بکنی|چه کمکی می تونی بکنی|چیکار میکنی|چه کاری بلدی|چطور میتونی کمکم کنی|چیکار می‌کنی|چیکار می کنی'
      ),
      R['ruleSmalltalkCapability']
    ),

    // Off-topic and non-serious questions ("Do you like pizza?", "How's the weather?")
    // Playful response, then a gentle return to the main topic.
    rule(
      'smalltalk_silly',
      55,
      pw(
        'دوست داری|نظرت در مورد|تا حالا|آیا تا به حال|می‌تونی بخوری|میتونی بخوری|می تونی بخوری|چند سالته|کجا زندگی می‌کنی|کجا زندگی میکنی|کجا زندگی می کنی|می‌خوابی|میخوابی|می خوابی|چیکار می‌کنی|چیکار میکنی|چیکار می کنی|چی کار می‌کنی|چی کار میکنی|چی کار می کنی'
      ),
      R['ruleSmalltalkSilly']
    ),

    // Greeting families mirror the user's greeting word back (درود ->
    // درود-based reply, سلام -> سلام-based reply). Each family also
    // accepts a short fixed tail (بر تو, بر شما, عزیز, دوست, جان, و درود)
    // so "درود بر تو" and "سلام علیکم" get a warm greeting instead of a
    // generic fallback. The tail is a fixed list, never free text, so
    // "درود چطوری؟" still falls through to the how-are-you rule.
    rule(
      'greeting',
      65,
      /^(?:درود)(?:\s+(?:بر تو|بر شما|عزیز|دوست|جان))?[!.؟]*$/iu,
      R['ruleGreetingDorud']
    ),

    rule(
      'greeting',
      65,
      /^(?:سلام)(?:\s+(?:علیکم|بر تو|بر شما|عزیز|دوست|جان|و درود))?[!.؟]*$|^(?:صبح بخیر|عصر بخیر|سلام صبح بخیر)[!.؟]*$/iu,
      R['ruleGreetingSalam']
    ),

    rule(
      'family',
      50,
      pw('پدربزرگ|مادربزرگ|پدر|مادر|خانواده|والدین|خواهر|برادر', '\\s*(.*)'),
      R['ruleFamily']
    ),

    rule(
      'work',
      50,
      pw('کار|شغل|رئیس|همکار|استخدام|اخراج', '\\s*(.*)'),
      R['ruleWork']
    ),

    rule(
      'sleep',
      50,
      pw('خواب|بی‌خوابی|بیخوابی|بی خوابی|کابوس|بیدار شدن|شب بیدار'),
      R['ruleSleep']
    ),

    rule(
      'sadness',
      40,
      pw('غمگین|ناراحت|افسرده|دلم گرفته|گریه'),
      R['ruleSadness']
    ),

    rule(
      'anxiety',
      40,
      pw('نگران|اضطراب|استرس|ترس|ترسیدم|می‌ترسم|میترسم'),
      R['ruleAnxiety']
    ),

    rule('anger', 40, pw('عصبانی|خشمگین|کفری|از دستش عصبانی'), R['ruleAnger']),

    rule(
      'joy',
      35,
      pw('خوشحال|شاد|هیجان‌زده|هیجانزده|هیجان زده'),
      R['ruleJoy']
    ),

    rule(
      'loneliness',
      40,
      pw('تنها|تنهایی|کسی رو ندارم|هیچ‌کس نیست|هیچکس نیست|هیچ کس نیست'),
      R['ruleLoneliness']
    ),

    rule(
      'self_esteem',
      40,
      pw(
        'بی‌ارزش|بیارزش|بی ارزش|اعتماد به نفس ندارم|از خودم بدم میاد|به اندازه کافی خوب نیستم'
      ),
      R['ruleSelfEsteem']
    ),

    rule(
      'motivation',
      35,
      pw(
        'انگیزه ندارم|بی‌حوصله|بیحوصله|بی حوصله|بیحوصلگی|نمی‌تونم شروع کنم|نمیتونم شروع کنم|نمی تونم شروع کنم|تعلل می‌کنم|تعلل میکنم|تعلل می کنم'
      ),
      R['ruleMotivation']
    ),

    rule(
      'relationship',
      40,
      pw(
        'دوست پسر|دوست دختر|همسر|نامزد|بهم زدیم|جدا شدیم|رابطه‌ام|رابطهام|رابطه ام'
      ),
      R['ruleRelationship']
    ),

    rule(
      'health',
      35,
      pw('مریض|بیمار|درد دارم|سلامتی|دکتر رفتم'),
      R['ruleHealth']
    ),

    rule(
      'mindfulness',
      40,
      pw(
        'ذهن آگاهی|ذهنآگاهی|مدیتیشن|مراقبه|حضور در لحظه|نفس عمیق|نفس می کشم|نفس میکشم|تمرین تنفس|آرامش|زمین‌سازی|زمینسازی|زمین سازی|آگاه بودن|تمرکز روی نفس|نظاره‌گر افکار|نظارهگر افکار|نظاره گر افکار|بدون قضاوت|اینجا و اکنون|لحظه حال|آرام کردن ذهن'
      ),
      R['ruleMindfulness']
    ),

    rule(
      'stress',
      40,
      pw(
        'overwhelmed|فرسودگی|تحت فشار|فشار زیاد|ظرفم تموم شده|دیگه طاقت ندارم|کم آوردم|از پا افتاده|خسته از کار|استرس زیاد|فشار روحی|حالم بده|ظرفیت ندارم|نمی‌تونم ادامه بدم|نمیتونم ادامه بدم|نمی تونم ادامه بدم|خالی شدم|دیگه نمی‌کشم|دیگه نمیکشم|دیگه نمی کشم|آخر خط'
      ),
      R['ruleStress']
    ),

    // The user asks Darya to say something more simply or more briefly
    // ("ساده‌تر بنویس", "کوتاه‌تر بگو"). Acknowledge warmly and commit to
    // a plainer register instead of falling through to a generic line.
    rule(
      'simplify',
      45,
      pw(
        'ساده‌تر بنویس|ساده تر بنویس|ساده‌تر بگو|ساده تر بگو|ساده‌تر بگویی|ساده تر بگویی|ساده‌تر بگویید|ساده تر بگویید|ساده‌تر توضیح بده|ساده تر توضیح بده|ساده‌تر توضیح بدی|ساده تر توضیح بدی|ساده‌تر توضیح بدهی|ساده تر توضیح بدهی|ساده‌تر توضیح بدهید|ساده تر توضیح بدهید|کوتاه‌تر بنویس|کوتاه تر بنویس|کوتاه‌تر بنویسی|کوتاه تر بنویسی|کوتاه‌تر بنویسید|کوتاه تر بنویسید|کوتاه‌تر بگو|کوتاه تر بگو|کوتاه‌تر بگویی|کوتاه تر بگویی|کوتاه‌تر بگویید|کوتاه تر بگویید|کوتاه‌تر توضیح بده|کوتاه تر توضیح بده|زیاد طولانی|خیلی طولانی|پیچیده نکن|ساده و کوتاه|کوتاه و ساده|ساده بگو|ساده صحبت کن|ساده صحبت کنی|ساده حرف بزن|ساده حرف بزنی|قالب ساده|شکل ساده|به زبان ساده|با زبان ساده|روون‌تر بنویس|روان‌تر بنویس|روان تر بنویس|روون تر بنویس|ساده‌ترش کن|ساده ترش کن|پیچیده داری توضیح میدی|پیچیده داری توضیح می‌دی|پیچیده داری توضیح میدی؟'
      ),
      R['ruleSimplify']
    ),

    // App and website feedback ("تم ساحل این وب‌سایت رو مشکل‌دار می‌دونم",
    // "the waves look too small"): acknowledge warmly and steer back to
    // the conversation. The pattern is highly specific (UI/website words),
    // so it outranks the generic feeling/reasoning rules but stays below
    // knowledge so genuine emotional disclosures always win.
    rule(
      'app_feedback',
      32,
      pw(
        'وب‌سایت|وبسایت|وب سایت|وب‌سایتم|وبسایتم|سایت|تم|پوسته|رابط کاربری|طراحی|دکمه|منو|فونت|آیکون|انیمیشن|موج|امواج|ساحل|موبایل|فرمت'
      ),
      R['ruleAppFeedback']
    ),

    rule(
      'gratitude',
      25,
      // The optional spaces ( ? ) accept both the joined form ('دستت')
      // and the half-space normalized form ('دست ت'), because the FA
      // half-space normalizer turns a ZWNJ (U+200C) into a plain space
      // in the matching text. 'دستت درد نکنه' is the most common Persian
      // way to thank someone for their help.
      pw(
        'ممنون|ممنونم|متشکرم|مرسی|سپاسگزار|قدردان|سپاس|تشکر|خوشحالم که هستی|دمت گرم|دستت گرم|خسته نباشی|قربانت|لطف داری|ممنون ازت|دست ?ت ?درد ?نکنه|دست ?شما ?درد ?نکنه'
      ),
      R['ruleGratitude']
    ),

    rule('school', 35, pw('امتحان|کنکور|دانشگاه|نمره|استاد'), R['ruleSchool']),

    rule(
      'money',
      35,
      pw('پول ندارم|مشکل مالی|بدهکار|قسط|هزینه‌ها|هزینهها|هزینه ها'),
      R['ruleMoney']
    ),

    rule(
      'feeling',
      30,
      /(?<!\p{L})(?:احساس می‌کنم|احساس میکنم|احساس می کنم|حس می‌کنم|حس میکنم|حس می کنم|فکر می‌کنم|فکر میکنم|فکر می کنم)(?!\p{L})\s*(.*)/iu,
      R['ruleFeeling']
    ),

    rule(
      'reasoning',
      25,
      /(?<!\p{L})(?:چونکه|چون)(?!\p{L})\s*(.*)/iu,
      R['ruleReasoning']
    ),

    rule(
      'need',
      25,
      /(?<!\p{L})(?:نیاز دارم|می‌خواهم|میخواهم|میخوام|می خواهم|دلم می‌خواد|دلم میخواد|دلم می خواد)(?!\p{L})\s*(.*)/iu,
      R['ruleNeed']
    ),

    // The user asks what a word or phrase means ("وداع کردن می‌دونی
    // یعنی چی؟!"). Answer warmly without pretending to be a dictionary:
    // name the word back and turn it into a conversation. "منظور..."
    // ("what do you mean") is deliberately excluded - that asks Darya
    // to clarify her own words, which needs a different response.
    rule(
      'word_meaning',
      58,
      /(?<!\p{L})(?!منظور(?:ت|تون| تو| شما)?|این|اون|آن|اینها|آنها)(.+?)\s*(?:می‌دونی|میدونی|می دونی|می‌دونید|میدونید|می دونید|می‌دانی|میدانی|می دانی|می‌دانید|میدانید|می دانید)?\s*(?:یعنی چی|یعنی چه|یعنی چیه|به چه معناست)[!?؟]*$/iu,
      R['ruleWordMeaning']
    ),

    // The user asks Darya to ask them a question ("یک سوال از من بپرس",
    // "سوال نمی‌پرسی؟!"). Darya complies with a real, gentle question.
    rule(
      'ask_me_question',
      58,
      pw(
        'سوال نمی‌پرسی|سوال نمیپرسی|سوال نمی پرسی|چرا سوال نمی‌پرسی|چرا سوال نمیپرسی|چرا سوال نمی پرسی|سوال بپرس|بپرس ببینم|از من بپرس|ازم بپرس|یک سوال از من بپرس|یه سوال از من بپرس|بپرس از من|بپرس ازم|سوال بپرس از من'
      ),
      R['ruleAskMeQuestion']
    ),

    // The user tells Darya to improve herself ("خودت رو بهتر کن",
    // "باهوش‌تر شو"). Acknowledge humbly instead of deflecting with
    // humor or a generic line.
    rule(
      'self_improvement',
      55,
      pw(
        'خودت رو بهتر|خودت را بهتر|خودتو بهتر|بهتر و عاقل|عاقل‌تر|عاقلتر|عاقل تر|هوشمندتر|باهوش‌تر بشی|باهوشتر بشی|باهوش تر بشی|باهوش‌تر شو|باهوشتر شو|باهوش تر شو|بهتر شو|بهتر بشو|ارتقا بده|ارتقا بدهی'
      ),
      R['ruleSelfImprovement']
    ),

    // "چی‌کار کنم؟!" (what should I do?) must answer the help-seeking
    // intent instead of tripping the work rule, whose bare "کار" matches
    // the normalized "چی کار کنم". This rule sits just above work so the
    // general what-to-do request wins over the work-topic reading.
    rule(
      'what_do_i_do',
      52,
      pw(
        'چی کار کنم|چیکار کنم|چه کار کنم|چی کار بکنم|چیکار بکنم|چه کاری بکنم|چی بکنم|چی کار باید بکنم|چیکار باید بکنم|چه کار باید بکنم|چه کاری باید بکنم|چه باید بکنم|راه‌حل نمی‌دی|راه حل نمی‌دی|راهکاری نداری|راهکار نمی‌دی'
      ),
      R['ruleWhatDoIDo']
    ),

    // The user answers "yes but I do not know which one" after Darya
    // offered several topics. Gently help them pick instead of falling
    // into the evasive deep-question pool.
    rule(
      'unsure_topic',
      52,
      pw(
        'نمی‌دونم روی کدوم|نمیدونم روی کدوم|نمی دونم روی کدوم|نمی‌دونم کدوم|نمیدونم کدوم|نمی دونم کدوم|مطمئن نیستم کدوم|کدومش رو انتخاب کنم|کدومش را انتخاب کنم|کدومش رو بگم'
      ),
      R['ruleUnsureTopic']
    ),

    rule(
      'knowledge',
      55,
      /(?<!\p{L})(?:سقراط|رواقی|رواقی‌گری|رواقی گری|رواقیگری|ارسطو|یونگ|نیچه|گاندی|ماندلا|چرچیل|زرتشت|فلسفه|تمرکز|تمرکز کنم|بهتر یاد بگیرم|بهتر درس بخوانم|ارتباط بهتر|خلاقیت|قفل خلاقیت|مدیریت استرس|استرس|فرسودگی|آرام‌شدن|آرام شدن|آرامشدن|خودشفقتی|مهربانی با خود|منتقد درونی|خودانتقادی|حل تعارض|اختلاف|ارتباط بدون خشونت|تصمیم‌گیری|تصمیم گیری|تصمیمگیری|تصمیم|انتخاب بین|تاب‌آوری|تاب آوری|تابآوری|بازگشت به زندگی|بازگشتن|بخشش|ببخشم|ببخش|بخشیدن|رها کردن|رها کنم|معنای زندگی|معنی زندگی|هدف در زندگی|پیدا کردن هدف|وجودی|معنادار|معنوی|روابط|رابطه|ارتباط عاطفی|شغل|حرفه|پیشرفت شغلی|رضایت شغلی|اضطراب|مدیریت اضطراب|نگرانی|فکر زیاد|ذهن\u200Cآگاهی|ذهن آگاهی|ذهنآگاهی|سوگ|فقدان)(?!\p{L})/iu,
      R['ruleKnowledge']
    ),

    rule(
      'professional_boundary',
      90,
      /(?<!\p{L})(?:مشاوره پزشکی|تشخیص|دارو|مشاوره حقوقی|وکیل|دادگاه|مشاوره مالی|سرمایه‌گذاری|سرمایهگذاری|مالیات|وام)(?!\p{L})/iu,
      R['ruleProfessionalBoundary']
    ),

    rule(
      'recap',
      80,
      /(?<!\p{L})(?:چی گفتم|چه چیزهایی گفتم|خلاصه کن|یادم نیست چی گفتم|مرور کن)(?!\p{L})/iu,
      R['ruleRecap']
    ),

    rule('affirmation', 15, /^(بله|آره|اره)\.?$/i, R['ruleAffirmation']),

    rule('negation', 15, /^(نه|خیر)\.?$/i, R['ruleNegation'])
  ];

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
    /[؟?]|(?<!\p{L})(چرا|چطور|چگونه|چیست|چیه|کجا|کیه|کیست|آیا|کدام|چقدر|چند)(?!\p{L})/u;

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
    'خدانگهدار',
    'خدافظ',
    'بای',
    'میخوام برم',
    'می‌خوام برم',
    'باید برم',
    'باید بروم',
    'بعدا می‌بینمت',
    'بعداً می‌بینمت',
    'بعدا میبینمت',
    'مرسی تا بعد',
    'تا بعد',
    'exit',
    'quit'
  ];

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
    /^(?:سلام|درود|هی|خب|اوکی|باشه)?\s*(?:خوبی|تو خوبی|خوبی تو|حالت خوبه|چطوری|چه خبر|حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|چیکار می‌کنی|چیکار میکنی|چیکار می کنی|چی کار می‌کنی|چی کار میکنی|چی کار می کنی|داری چیکار می‌کنی|داری چیکار میکنی|داری چیکار می کنی|چکار می‌کنی|چکار میکنی|چکار می کنی)(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?:\s*است)?[!.؟]*$/iu;

  const insultPattern =
    /(?<!\p{L})(?:احمق|احمقی|کودن|کودنی|دیوونه|دیوونی|بی‌عقل|بیعقل|نادان|نادانم|نادانی|نادون|نادونی|خاک (?:به|تو|بر)?سر(?:ت)?|خاک تو سرت|خاک بر سرت|برو گمشو|برو بمیر|برو جهنم|برو به درک|مردک|حرومزاده|حرامزاده|فضول|چرت|چرتی|مزخرف|هذیان|گوه|کثافت|کثیف|بی‌شعور|بیشعور|بی‌شرف|بیشرف|بی‌ادب|بیادب|خار|کون|کونی|دهن|کیری|گایید|کص|کس|مادرت|مادرجنده|خواهرت|خفه|جاکش|احمقانه|نفهم|نفهمی|ابله|ابلهی|مسخره|مسخرهای|بی‌سواد|بیسواد|خر|گاو|سگ|خوک|الاغ|گور|پدرسوخته|جنده|قحبه|فاحشه|دیوث|ملعون|لعنتی|نامرد|بی‌غیرت|بیغیرت|ننگ)(?!\p{L})/iu;

  // Date/time question patterns (Persian). Time queries: asking the
  // current time. Date queries: asking the current date.
  const dateTimeTimePattern =
    /(?<!\p{L})(?:ساعت (?:چنده|چند|چقدره|چقدر)|الان ساعت (?:چنده|چند)|ساعت الان چند|time|ساعت را می‌گویی|ساعت رو بگو|وقت چنده)(?!\p{L})/iu;

  const dateTimeDatePattern =
    /(?<!\p{L})(?:تاریخ (?:امروز|چنده|چیست|رو بگو|رو می‌گی)|امروز (?:چندمه|چه روزیه|چه تاریخی|چند شنبه)|چند شنبه ایم|تاریخ شمسی|تاریخ ایرانی|تاریخ امروز چنده|what('?s| is) the date in iran|jalali date|persian date)(?!\p{L})/iu;

  // Darya-targeted harassment (Persian): insults and bullying
  // specifically directed at Darya.
  const daryaHarassmentPattern =
    /(?<!\p{L})(?:دریا (?:تو|)(?:\s+)(?:احمق|کودن|دیوونه|بی‌عرضه|بی‌خاصیت|چرتی|مسخره|کصکش|کونی|بی‌شعور|بی‌سواد|نفهم|ابله|بد|کثیف|چقدر بدی|چقدر بی مصرفی|به دردم نمیخوری)|تو (?:یک )?(?:ربات )?(?:احمق|کودن|کونی|کصکش|مسخره|بدبخت|چرتی|بی‌خاصیت|بی‌شعور|نفهم|بی‌سواد))(?!\p{L})/iu;

  // Sexual or inappropriate comments (Persian). Only explicitly sexual
  // terms are listed: everyday words like "ببینم" (let me see), "ببینمت"
  // (see you), "داغ" (hot), "عشق" (love), "نشان بده" (show me), "بیا
  // بیرون" (come out) and "بکنم" (I will do it) are far too common in
  // innocent speech and must never trip the harassment gate.
  const sexualHarassmentPattern =
    /(?<!\p{L})(?:سکسی|بوس(?:یدن|ید)?|ببوس|بیا (?:بستر|تخت|پیشم|خونه)|بدنت(?:و| رو)|سینه(?: هات|ت)?|کون(?:ت)?|کس(?:ت)?|ساک(?: بزن| کن)|بکنمت|جنده|قحبه|بزن قدش|عریان|لخت|برهنه)(?!\p{L})/iu;

  const stopWords = new Set([
    // Persian verb prefixes
    'می',
    'نمی',
    'مى',
    'نمى',
    // Comparative and superlative suffixes become separate tokens when
    // ZWNJ is normalized to a space (ساده‌تر -> ساده تر) and would
    // otherwise false-trigger word-repetition detection.
    'تر',
    'ترین',
    // Pronouns and demonstratives
    'تو',
    'من',
    'او',
    'ما',
    'شما',
    'اون',
    'ای',
    'این',
    'آن',
    'ایشان',
    'خود',
    'خودم',
    'خودت',
    // Prepositions and conjunctions
    'با',
    'در',
    'به',
    'از',
    'که',
    'تا',
    'برای',
    'و',
    'یا',
    'نه',
    'بله',
    'آره',
    'باشه',
    'خب',
    'خوب',
    'نه',
    'بعد',
    'قبل',
    'فقط',
    'هم',
    'بر',
    'بدون',
    'درباره',
    'مثل',
    'مانند',
    'بین',
    'زیر',
    'روی',
    // Object markers: formal (را), colloquial (رو, ر) mark the definite
    // direct object and repeat constantly in everyday Persian; they must
    // never count toward word-repetition detection.
    'را',
    'رو',
    'ر',
    'بالا',
    'پایین',
    'کنار',
    'داخل',
    'بیرون',
    'جلوی',
    'پشت',
    'نزدیک',
    'دور',
    // Common verbs and auxiliaries
    'هست',
    'نیست',
    'هستم',
    'هستی',
    'هستیم',
    'هستید',
    'هستند',
    'نیستم',
    'نیستی',
    'است',
    'نیست',
    'بود',
    'بودم',
    'بودی',
    'بودیم',
    'بودید',
    'بودند',
    'دارد',
    'دارم',
    'داری',
    'داریم',
    'دارید',
    'دارند',
    'ندارم',
    'نداری',
    'ندارد',
    // Persian verb suffixes and light verbs that commonly appear as separate words
    'کن',
    'کنم',
    'کنی',
    'کند',
    'کنیم',
    'کنید',
    'کنند',
    'کنه',
    'کنی',
    'کنم',
    'کنند',
    'کرد',
    'کردم',
    'کردی',
    'کرده',
    'کردند',
    'ده',
    'دم',
    'دی',
    'دهد',
    'دهیم',
    'دهید',
    'دهند',
    'گیر',
    'گیرم',
    'گیری',
    'گیرد',
    'گیریم',
    'گیرید',
    'گیرند',
    'باش',
    'باشم',
    'باشی',
    'باشد',
    'باشیم',
    'باشید',
    'باشند',
    'شو',
    'شوم',
    'شوی',
    'شود',
    'شویم',
    'شوید',
    'شوند',
    'خور',
    'خورم',
    'خوری',
    'خورد',
    'خوریم',
    'خورید',
    'خورند',
    'زن',
    'زنم',
    'زنی',
    'زند',
    'زنیم',
    'زنید',
    'زنند',
    'بین',
    'بینم',
    'بینی',
    'بیند',
    'بینیم',
    'بینید',
    'بینند',
    'گو',
    'گویم',
    'گویی',
    'گوید',
    'گوییم',
    'گویید',
    'گویند',
    'دان',
    'دانم',
    'دانی',
    'داند',
    'دانیم',
    'دانید',
    'دانند',
    'باید',
    'شاید',
    'حتما',
    'حتماً',
    'ممکن',
    'می‌شود',
    'میشه',
    'خواهد',
    'خواهم',
    'خواهی',
    'خواهیم',
    'خواهید',
    'خواهند',
    'تواند',
    'توانم',
    'توانی',
    'توانیم',
    'توانید',
    'توانند',
    // Question words
    'چرا',
    'چطور',
    'چگونه',
    'چیست',
    'چیه',
    'کجا',
    'کیه',
    'کیست',
    'آیا',
    'کدام',
    'چقدر',
    'چند',
    'چه',
    'کی',
    'کِی',
    // Indefinite articles and demonstratives that appear constantly
    'یک',
    'یکی',
    'یه',
    'همین',
    'همون',
    'چی',
    // Common adverbs
    'الان',
    'الآن',
    'حالا',
    'هنوز',
    'دیگر',
    'دیگه',
    'باز',
    'دوباره',
    'خیلی',
    'بسیار',
    'کم',
    'اندکی',
    'تقریبا',
    'حدود',
    'همیشه',
    'گاهی',
    'بعضی',
    'برخی',
    'هیچ',
    'حتماً',
    'البتّه',
    'البته',
    'قطعاً',
    'قطعا',
    'واقعاً',
    'واقعا',
    // English function words (for mixed-language input)
    'is',
    'are',
    'am',
    'be',
    'been',
    'being',
    'the',
    'a',
    'an',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'and',
    'or',
    'but',
    'so',
    'if',
    'as',
    'it',
    'its',
    'i',
    'you',
    'he',
    'she',
    'they',
    'we',
    'my',
    'your',
    'his',
    'her',
    'its',
    'our',
    'their',
    'me',
    'him',
    'them',
    'us',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'can',
    'could',
    'shall',
    'should',
    'may',
    'might',
    'must',
    'not',
    'no',
    'nor',
    'this',
    'that',
    'these',
    'those',
    'up',
    'down',
    'out',
    'off',
    'over',
    'under',
    'just',
    'only',
    'very',
    'too',
    'also',
    'even',
    'still'
  ]);

  // Response to conversation staleness: when the conversation has been
  // shallow and superficial for several turns (e.g. short
  // acknowledgements with no emotional depth), Darya gently invites a
  // more substantive direction.

  // Response to being asked how Darya is: when the user checks in on
  // Darya after a heavy emotional conversation (e.g. "خوبی؟",
  // "حالت چطوره؟"), these responses acknowledge the care behind the
  // question and return attention to the user.

  /**
   * پاسخ جایگزینی که وقتی موتور گفتگو با خطای غیرمنتظره‌ای مواجه می‌شود
   * (مثلاً خطای مرجع یا خطای منطقی) نمایش داده می‌شود. بر خلاف
   * emptyInputReply: R.emptyInputReply، این پیام تأیید می‌کند که کاربر چیزی گفته اما دریا
   * نتوانسته آن را پردازش کند و کاربر را به تکرار دعوت می‌کند.
   */

  function foreignLanguageRedirect() {
    return `من ${BOT_NAME} هستم و تنها به زبان فارسی گفت‌وگو می‌کنم، تا بتوانم بهترین همراهی را داشته باشم. لطفاً پیام‌تان را به فارسی بنویسید تا ادامه دهیم.`;
  }

  const questionTopics = new Set([
    'family',
    'work',
    'sleep',
    'anxiety',
    'stress',
    'sadness',
    'anger',
    'joy',
    'loneliness',
    'self_esteem',
    'grief',
    'motivation',
    'mindfulness',
    'resilience',
    'forgiveness',
    'purpose',
    'relationship',
    'health',
    'school',
    'money',
    'feeling',
    'reasoning',
    'need'
  ]);

  const topicSeriousness = {
    safety: 1,
    professional_boundary: 0.9,
    grief: 0.9,
    health: 0.85,
    anxiety: 0.8,
    stress: 0.8,
    sadness: 0.8,
    anger: 0.75,
    loneliness: 0.75,
    family: 0.7,
    relationship: 0.7,
    sleep: 0.65,
    work: 0.65,
    money: 0.7,
    school: 0.6,
    self_esteem: 0.8,
    motivation: 0.6,
    mindfulness: 0.4,
    resilience: 0.7,
    forgiveness: 0.7,
    purpose: 0.65,
    feeling: 0.65,
    reasoning: 0.55,
    need: 0.55,
    joy: 0.25,
    gratitude: 0.2,
    greeting: 0.15,
    smalltalk_howareyou: 0.2,
    smalltalk_identity: 0.25,
    smalltalk_capability: 0.25,
    app_feedback: 0.15,
    recap: 0.35,
    knowledge: 0.25,
    word_meaning: 0.2,
    ask_me_question: 0.2,
    self_improvement: 0.2,
    what_do_i_do: 0.45,
    unsure_topic: 0.25
  };

  const selfAwareness = {
    approach:
      'من از الگوهای گفتگو، زمینه‌ی کوتاه‌مدت و انتخاب سنجیده‌ی پاسخ استفاده می‌کنم.',
    boundaries:
      'من از واقعیت‌های روز خبر ندارم مگر اینکه در قفسه‌ی آفلاینم باشند و به‌جای متخصص تصمیم حرفه‌ای نمی‌گیرم.',
    memory:
      'فقط در همین برگه جزئیات منتخب را به خاطر می‌سپارم و اگر اصلاحم کنی آن را تغییر می‌دهم.'
  };

  // Assemble the language pack object from top-level variables.

  const fa = {
    code: 'fa',
    dir: 'rtl',
    botName: BOT_NAME,
    scriptRange: SCRIPT_RANGE,
    minScriptRatio: 0.85,
    normalize,
    rules,
    trivialCaptures,
    genericFallbacks: R.genericFallbacks,
    strategyShiftFallbacks: R.strategyShiftFallbacks,
    sessionCheckIns: R.sessionCheckIns,
    checkInEvery: 8,
    questionPattern,
    questionFallbacks: R.questionFallbacks,
    questionAcknowledgements: R.questionAcknowledgements,
    topicCallbacks: R.topicCallbacks,
    quotedCallbackTemplates: R.quotedCallbackTemplates,
    distressNudges: R.distressNudges,
    sentimentLexicon: R.sentimentLexicon,
    pronounMap,
    familyTerms,
    professionTerms,
    placeWords,
    entityCallbackTemplates,
    topicSpecificQuestions: R.topicSpecificQuestions,
    questionTopics,
    blendResponses: R.blendResponses,
    topicSeriousness,
    humor: R.humor,
    warmth: R.warmth,
    smalltalk: R.smalltalk,
    emojiResponses: R.emojiResponses,
    gratitudeResponses: R.gratitudeResponses,
    topicShiftTemplates: R.topicShiftTemplates,
    recapTemplates: R.recapTemplates,
    humanTouch: R.humanTouch,
    professionalBoundary: R.professionalBoundary,
    selfAwareness,
    exitKeywords,
    exitConfirmMessages: R.exitConfirmMessages,
    greetings: R.greetings,
    greetingsPhase1: R.greetingsPhase1,
    greetingsPhase2: R.greetingsPhase2,
    greetingsOpen: R.greetingsOpen,
    greetingsInviting: R.greetingsInviting,
    greetingsReturning: R.greetingsReturning,
    // Keep the historical misspelling as a read-only compatibility alias;
    // old callers used greentings* before the pools were made explicit.
    greentingsOpen: R.greetingsOpen,
    greentingsInviting: R.greetingsInviting,
    greentingsReturning: R.greetingsReturning,
    farewells: R.farewells,
    emptyInputReply: R.emptyInputReply,
    engineErrorReply: R.engineErrorReply,
    foreignLanguageRedirect,
    repeatedGreetingResponses: R.repeatedGreetingResponses,
    wordRepetitionResponses: R.wordRepetitionResponses,
    frustrationResponses: R.frustrationResponses,
    factualQuestionFollowups: R.factualQuestionFollowups,
    spamNoiseResponses: R.spamNoiseResponses,
    ambiguousInputResponses: R.ambiguousInputResponses,
    acknowledgementResponses: R.acknowledgementResponses,
    correctionResponses: R.correctionResponses,
    topicChangeResponses: R.topicChangeResponses,
    teasingMockingResponses: R.teasingMockingResponses,
    stopWords,
    boredomResponses: R.boredomResponses,
    wellBeingPattern,
    insultPattern,
    wellBeingResponses: R.wellBeingResponses,
    testInputResponses: R.testInputResponses,
    mixedLanguageResponses: R.mixedLanguageResponses,
    topicRecoveryResponses: R.topicRecoveryResponses,
    dateTimeTimePattern,
    dateTimeDatePattern,
    daryaHarassmentPattern,
    sexualHarassmentPattern,
    // Persian test-input signals ("دارم تستت می‌کنم"). The English
    // TEST_INPUT_PATTERNS in the engine only knows Latin phrases, so
    // these phrases let the dialogue-act classifier recognize Persian
    // testing turns and route them to testInputResponses instead of
    // the frustration or harassment paths.
    testInputPattern:
      /(?:تستت می‌کنم|تستت میکنم|تستت کنم|امتحانت می‌کنم|امتحانت میکنم|امتحانت کنم|دارم تست|دارم امتحان|می‌خوام تستت کنم|میخوام تستت کنم|می‌خوام امتحانت کنم|میخوام امتحانت کنم|ببینم چقدر باهوش|ببینم چقدر هوشمند)/u,
    dateTimeFollowups: R.dateTimeFollowups,
    daryaHarassmentResponses: R.daryaHarassmentResponses,
    sexualHarassmentResponses: R.sexualHarassmentResponses,
    emotionCalibration: R.emotionCalibration,
    ui: {
      appTitle: 'دریا · همراه گفتگوی آرام',
      appDescription: 'دریا، همراه گفتگوی فارسی‌زبان برای گوش دادن و همراهی.',
      placeholderDefault: 'هر چه در دل دارید بنویسید...',
      placeholderEnded:
        'گفت‌وگو پایان یافت. برای شروع دوباره از منو «گفت‌وگوی تازه» را بزنید',
      ariaSendLabel: 'ارسال',
      ariaMenuLabel: 'گفت‌وگو',
      ariaInputLabel: 'پیام شما',
      ariaExportMdLabel: 'دانلود گفت‌وگو با فرمت مارک‌داون',
      ariaExportTxtLabel: 'دانلود گفت‌وگو با فرمت ساده',
      // Canonical labels: aria-label === title === visible text
      pickerFaTitle: 'شروع گفت‌وگوی تازه به فارسی',
      pickerEnTitle: 'شروع گفت‌وگوی تازه به انگلیسی',
      themeOceanTitle: 'پوسته اقیانوس',
      themeBeachTitle: 'پوسته ساحل',
      sendButtonTitle: 'ارسال',
      menuTriggerTitle: 'منو',
      newChatTitle: 'گفت‌وگوی تازه',
      exportMdTitle: 'دانلود با فرمت مارک‌داون',
      exportTxtTitle: 'دانلود با فرمت ساده',
      themeToggleTitle: 'تغییر پوسته',
      themeGroupLabel: 'انتخاب پوسته',
      typingLabel: 'دریا در حال فکر کردن',
      menuNewChat: 'گفت‌وگوی تازه',
      menuExportMd: 'دانلود گفتگو با فرمت مارک‌داون',
      menuExportTxt: 'دانلود گفتگو با فرمت ساده',
      themeOceanLabel: 'پوسته اقیانوس',
      themeBeachLabel: 'پوسته ساحل',
      disclaimer:
        'دریا یک همراه شنواست، نه جایگزین راهنمایی تخصصی. در شرایط بحرانی لطفاً با یک متخصص یا خط بحران تماس بگیرید.',
      foreignScriptHint: 'لطفاً فقط فارسی بنویسید تا بتونم همراهی‌تان کنم.',
      exportTitle: `گفت‌وگو با ${BOT_NAME}`,
      exportYouLabel: 'شما',
      exportDivider: '-----------------------------',
      dateLocale: 'fa-IR',
      connectionError:
        'در برقراری ارتباط مشکلی پیش آمد. لطفاً صفحه را دوباره بارگذاری کنید.',
      breatheTitle: 'تمرین تنفس',
      breatheIn: 'دم',
      breatheHold: 'نگه دار',
      breatheOut: 'بازدم',
      breatheDismiss: 'بستن',
      exitConfirmBarLabel: 'آیا می‌خواهی گفتگو را پایان دهی؟',
      exitConfirmBarYes: 'بله، پایان بده',
      exitConfirmBarNo: 'نه، ادامه بده',
      newChatConfirmTitle: 'آیا مطمئن هستی؟',
      newChatConfirmDesc:
        'با شروع گفت‌وگوی تازه، گفت‌وگوی فعلی برای همیشه حذف می‌شود و قابل بازیابی نیست.',
      newChatConfirmYes: 'بله، شروع کن',
      newChatConfirmNo: 'انصراف',
      breatheOffer: 'آیا دوست داری یک تمرین تنفس آرام‌بخش انجام بدی؟',
      breatheAccept: 'باشه، شروع کن',
      breatheDecline: 'نه، مرسی',
      chatTitlePrefix: 'گفت‌وگو: ',
      soundOnTitle: 'پخش صدای محیطی: روشن',
      soundOffTitle: 'پخش صدای محیطی: خاموش',
      soundFallbackMsg:
        'فایل‌های صدای محیطی بارگذاری نشدند. از صدای تولیدشده به‌جای آن استفاده می‌شود.',
      engineErrorHint: 'یک مشکل کوچک پیش آمد، اما گفتگو می‌تواند ادامه یابد.'
    }
  };

  global.DaryaFa = fa;
})(typeof window !== 'undefined' ? window : globalThis);
