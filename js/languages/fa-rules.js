/**
 * Darya - fa rule definitions.
 * Registers the compiled rule array on the global for the pack assembler
 * (fa.js). Pools come from DaryaFaResponses.
 */
(function (global) {
  'use strict';

  var R = global.DaryaFaResponses;

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
        'خودکشی|خودزنی|آسیب زدن به خودم|دیگه نمیخوام زندگی کنم|دیگه نمی‌خوام زندگی کنم|دیگه نمی خوام زندگی کنم|دلیلی برای زندگی ندارم|دلیلی برای زنده موندن ندارم|دلیلی برای زنده‌ماندن ندارم|دلم میخواد بمیرم|دلم می‌خواد بمیرم|نمیخوام دیگه باشم|نمی‌خوام دیگه باشم|میخوام به زندگیم پایان بدم|می‌خوام به زندگیم پایان بدم|به زندگیم پایان بدم|به زندگیم خاتمه بدم|دیگه طاقت ندارم زندگی کنم'
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
      // eslint-disable-next-line max-len
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
        'چیکار می‌تونی بکنی|چیکار میتونی بکنی|چیکار می تونی بکنی|چه کمکی می‌تونی بکنی|چه کمکی میتونی بکنی|چه کمکی می تونی بکنی|چیکار میکنی|چه کاری بلدی|چطور میتونی کمکم کنی|چیکار می‌کنی|چیکار می کنی|چیکاره هستی|تو چیکاره هستی|چیکاره ای|چیکاره‌ای'
      ),
      R['ruleSmalltalkCapability']
    ),

    // The user is annoyed by Darya's question or follow-up ("به تو ربطی
    // نداره", "نظرت رو نگو"). The reply respectfully accepts the
    // boundary and hands the direction of the conversation back to the
    // user, instead of reflective lines that read like dodging the
    // annoyance.
    rule(
      'privacy_boundary',
      70,
      pw(
        'به تو ربطی نداره|بهت ربطی نداره|به تو مربوط نیست|بهت مربوط نیست|نظرت رو نگو|نظرت رو نده|برو به کارت|برو دنبال کارت|فضای خصوصیه|فضای خصوصی منه|نمی‌خوام بگم|نمیخوام بگم|نمی خوام بگم|نمی‌خوام جواب بدم|نمیخوام جواب بدم|ولم کن'
      ),
      R['rulePrivacyBoundary']
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
      /^(?:سلام)(?:\s+(?:علیکم|بر تو|بر شما|عزیز|دوست|جان|و درود))?[!.؟]*$/iu,
      R['ruleGreetingSalam']
    ),

    rule(
      'greeting',
      65,
      /^(?:هی|یا|آقا|سلام سلام)(?:\s+(?:عزیز|دوست|جان))?$/iu,
      R['ruleGreetingHey']
    ),

    rule(
      'greeting',
      65,
      /^(?:سلام صبح بخیر|صبح بخیر)(?:\s+(?:عزیز|دوست|جان))?[!.؟]*$/iu,
      R['ruleGreetingGoodMorning']
    ),

    rule(
      'greeting',
      65,
      /^(?:شب بخیر)(?:\s+(?:عزیز|دوست|جان))?[!.؟]*$/iu,
      R['ruleGreetingGoodEvening']
    ),

    rule(
      'greeting',
      65,
      /^(?:عصر بخیر)(?:\s+(?:عزیز|دوست|جان))?[!.؟]*$/iu,
      R['ruleGreetingGoodAfternoon']
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

    // Depression goes beyond sadness: a heavy, persistent mood
    // (hopelessness, worthlessness, emptiness, being unable to get out
    // of bed). First empathy, then a calm, real mention of professional
    // support.
    rule(
      'depression',
      56,
      pw(
        'افسردگی|افسرده|ناامید|بی‌ارزش|احساس پوچی|پوچ|نمی‌تونم از رختخواب بلند شم|نمی‌تونم هیچ کاری کنم|هیچ (?:دلیلی|انگیزه‌ای) (?:برای زندگی|برای ادامه|برا زندگی) ندارم|دیگه هیچ‌چیز (?:معنی|فایده|ارزش) نداره|حس می‌کنم هیچی نیستم|دلم مرده|از همه‌چیز خسته شدم'
      ),
      R['ruleDepression']
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

    // The user asks for a joke or wants to laugh. Replies come from a
    // pool of clean, kind jokes; a "بخندون من" request lands here too,
    // so the reply stays light and is never at anyone's expense.
    rule(
      'smalltalk_joke',
      60,
      pw(
        'جوک بگو|جوک بگویید|یه جوک|یک جوک|بخندون من|بخندونم|منو بخندون|چیزی بامزه بگو|چیزی بامزه بگویید|بامزه حرف بزن|حرف بامزه بزن|جوک بلدی|جوک تعریف کن|دلم میخواد بخندم|دلم می‌خواد بخندم'
      ),
      R['ruleTellJoke']
    ),

    // The user asks Darya to buy something ("برام لپ‌تاپ بخر", "کجا
    // می‌تونم بخرم؟"). Darya cannot make purchases, so the reply first
    // states the limit honestly and then helps think the purchase
    // through.
    rule(
      'shopping',
      50,
      pw(
        'برام.{0,16}(?:بخر|بگیر|بخریم|بگیری)|میخوام.{0,16}(?:بخرم|بگیرم|بخرمش)|میخواهم.{0,16}(?:بخرم|بگیرم)|کجا.{0,16}(?:بخرم|بگیرم|بخریم)|کجا می‌تونم.{0,16}(?:بخرم|بگیرم)|کجا میتونم.{0,16}(?:بخرم|بگیرم)|ارزش خرید داره|ارزش خرید دارد|باید بخرم|باید.{0,20}(?:بخرم|بگیرم)|کدوم.{0,20}(?:بخرم|بگیرم)|کدام.{0,20}(?:بخرم|بگیرم)|راهنمایی خرید|راهنمای خرید|چی بخرم|چیزی بخرم|قیمتش چنده|خرید کنم|بخرمش'
      ),
      R['ruleShoppingHelp']
    ),

    // A crush on someone much older (thirty years or more). Balanced,
    // non-judgmental guidance: life stage, power balance, and mutual
    // respect matter more than the number itself.
    rule(
      'age_gap',
      45,
      pw(
        'فاصله سنی|فاصله‌ی سنی|سی سال.{0,10}(?:بزرگتر|کوچکتر)|خیلی (?:بزرگتر|کوچکتر) از منه|خیلی (?:بزرگتر|کوچکتر) از من|۳۰ سال.{0,10}(?:بزرگتر|کوچکتر)|۳۰ سال.{0,10}بزرگتره|بیست سال.{0,10}(?:بزرگتر|کوچکتر)'
      ),
      R['ruleAgeGap']
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
        'ساده‌تر بنویس|ساده تر بنویس|ساده‌تر بگو|ساده تر بگو|ساده‌تر بگویی|ساده تر بگویی|ساده‌تر بگویید|ساده تر بگویید|ساده‌تر توضیح بده|ساده تر توضیح بده|ساده‌تر توضیح بدی|ساده تر توضیح بدی|ساده‌تر توضیح بدهی|ساده تر توضیح بدهی|ساده‌تر توضیح بدهید|ساده تر توضیح بدهید|کوتاه‌تر بنویس|کوتاه تر بنویس|کوتاه‌تر بنویسی|کوتاه تر بنویسی|کوتاه‌تر بنویسید|کوتاه تر بنویسید|کوتاه‌تر بگو|کوتاه تر بگو|کوتاه‌تر بگویی|کوتاه تر بگویی|کوتاه‌تر بگویید|کوتاه تر بگویید|کوتاه‌تر توضیح بده|کوتاه تر توضیح بده|زیاد طولانی|خیلی طولانی|پیچیده نکن|ساده و کوتاه|کوتاه و ساده|ساده بگو|ساده صحبت کن|ساده صحبت کنی|ساده حرف بزن|ساده حرف بزنی|قالب ساده|شکل ساده|به زبان ساده|با زبان ساده|روون‌تر بنویس|روان‌تر بنویس|روان تر بنویس|روون تر بنویس|ساده‌ترش کن|ساده ترش کن|پیچیده داری توضیح میدی|پیچیده داری توضیح می‌دی|پیچیده داری توضیح میدی؟|ساده‌تر بنویس|ساده تر بنویس|سادهتر بنویس|سادهتر بگو|سادهتر بگویی|سادهتر بگویید|سادهتر توضیح بده|سادهتر توضیح بدی|سادهتر توضیح بدهی|سادهتر توضیح بدهید|کوتاهتر بنویس|کوتاهتر بنویسی|کوتاهتر بنویسید|کوتاهتر بگو|کوتاهتر بگویی|کوتاهتر بگویید|کوتاهتر توضیح بده|روونتر بنویس|روانتر بنویس|روونتر بگو|سادهترش کن|روونترش کن'
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
      // eslint-disable-next-line max-len
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
      // eslint-disable-next-line max-len
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

    // The user does not know how to begin ("چطور شروع کنم؟",
    // "نمی‌دونم چی بگم"). Darya lowers the bar and offers easy openers
    // instead of mirroring the uncertainty back.
    rule(
      'opener_help',
      58,
      pw(
        'چطور شروع کنم|چطوری شروع کنم|چجوری شروع کنم|از کجا شروع کنم|از چی شروع کنم|نمی‌دونم چطور شروع کنم|نمیدونم چطور شروع کنم|نمی‌دونم چی بگم|نمیدونم چی بگم|نمی‌دونم چه بگم|نمیدونم چه بگم|چه بگویم|چه بگم|چی بگم|بلد نیستم شروع|کمکم کن شروع کنم|به من بگو چطور شروع|نمیدونم چطوری شروع'
      ),
      R['ruleOpenerHelp']
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
        'چی کار کنم|چیکار کنم|چه کار کنم|چی کار بکنم|چیکار بکنم|چه کاری بکنم|چی بکنم|چی کار باید بکنم|چیکار باید بکنم|چه کار باید بکنم|چه کاری باید بکنم|چه باید بکنم|راه‌حل نمی‌دی|راه حل نمی‌دی|راه حل نمیدی|راه‌حل نمیدی|راهحل نمیدی|راهکاری نداری|راهکار نمی‌دی|راهکار نمیدی|راهکارنمیدی'
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
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:سقراط|رواقی|رواقی‌گری|رواقی گری|رواقیگری|ارسطو|یونگ|نیچه|گاندی|ماندلا|چرچیل|زرتشت|فلسفه|تمرکز|تمرکز کنم|بهتر یاد بگیرم|بهتر درس بخوانم|ارتباط بهتر|خلاقیت|قفل خلاقیت|مدیریت استرس|استرس|فرسودگی|آرام‌شدن|آرام شدن|آرامشدن|خودشفقتی|مهربانی با خود|منتقد درونی|خودانتقادی|حل تعارض|اختلاف|ارتباط بدون خشونت|تصمیم‌گیری|تصمیم گیری|تصمیمگیری|تصمیم|انتخاب بین|تاب‌آوری|تاب آوری|تابآوری|بازگشت به زندگی|بازگشتن|بخشش|ببخشم|ببخش|بخشیدن|رها کردن|رها کنم|معنای زندگی|معنی زندگی|هدف در زندگی|پیدا کردن هدف|وجودی|معنادار|معنوی|روابط|رابطه|ارتباط عاطفی|شغل|حرفه|پیشرفت شغلی|رضایت شغلی|اضطراب|مدیریت اضطراب|نگرانی|فکر زیاد|ذهن\u200Cآگاهی|ذهن آگاهی|ذهنآگاهی|سوگ|فقدان)(?!\p{L})/iu,
      R['ruleKnowledge']
    ),

    rule(
      'professional_boundary',
      90,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:مشاوره پزشکی|تشخیص|دارو|مشاوره حقوقی|وکیل|دادگاه|مشاوره مالی|سرمایه‌گذاری|سرمایهگذاری|مالیات|وام)(?!\p{L})/iu,
      R['ruleProfessionalBoundary']
    ),

    rule(
      'recap',
      80,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:چی گفتم|چه چیزهایی گفتم|خلاصه کن|یادم نیست چی گفتم|مرور کن|امروز.{0,12}(?:چی|چه).{0,4}(?:صحبت|گفتیم)|راجع.{0,4}چی.{0,4}(?:صحبت|گفتیم)|درباره.{0,4}چی.{0,4}(?:صحبت|گفتیم)|چه چیزهایی.{0,4}(?:گفتیم|صحبت کردیم)|از کجا شروع.{0,4}(?:کردیم|شده)|کجا بودیم)(?!\p{L})/iu,
      R['ruleRecap']
    ),

    // The user asks to change the subject ("بیا راجع به یه چیز دیگه
    // صحبت کنیم", "بحث رو عوض کن", "بریم سراغ یه موضوع دیگه"). Darya
    // follows the lead with a light bridge instead of treating the
    // request as a topic disclosure or falling through to a fallback.
    rule(
      'topic_change',
      62,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:بحث.{0,4}(?:عوض|تغییر)|موضوع.{0,4}(?:عوض|تغییر|دیگه|دیگر)|بریم.{0,6}(?:یه|یک).{0,4}(?:چیز|موضوع|بحث)|چیز دیگه|چیزه دیگه|موضوع دیگه|یه بحث دیگه|یک بحث دیگر|صحبت.{0,4}(?:عوض|تغییر)|بریم سراغ|برویم سراغ|عوض کنیم|عوض کن)(?!\p{L})/iu,
      R['ruleTopicChange']
    ),

    // The user apologizes ("ببخشید", "عذر می‌خوام", "متاسفم"). A warm
    // acceptance beats the "too short to understand" ambiguous-input
    // fallback, so a bare "ببخشید" is never answered with "کمی بیشتر
    // توضیح بده". The pool stays brief and moves on instead of dwelling
    // on the apology.
    rule(
      'apology',
      64,
      pw(
        'ببخشید|ببخش|عذر می‌خوام|عذر میخوام|عذر می خوام|معذرت می‌خوام|معذرت میخوام|معذرت می خوام|عذر می‌خواهم|عذر می‌خواهم|عذر میخواهم|معذرت می‌خواهم|معذرت میخواهم|پوزش می‌طلبم|پوزش میطلبم|متاسفم|متأسفم|شرمنده‌ام|شرمنده ام|شرمندهام|شرمند هام|خجالت می‌کشم|خجالت میکشم|ببخشین'
      ),
      R['ruleApology']
    ),

    // Feedback aimed at Darya herself: how she quotes words, how well she
    // understands the message chain, how "smart" she is, requests for a
    // swear-word dictionary, open-question style, and so on. These turns
    // deserve a humble acknowledgement even when worded harshly, so this
    // topic is also excluded from the frustration/harassment override in
    // the engine.
    rule(
      'meta_feedback',
      62,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:باید.{0,20}?(?:درک کنی|بفهمی|متوجه بشی|متوجه شی|باهوش.{0,4}تر|عاقل.{0,4}تر|بهتر)|متن ورودی|پیام ورودی|بازخورد|دیکشنری|نقل و قول|نقل‌وقول|نقل وقول|نقل قول|نقل‌قول|نقلوقول|کوت کردی|زنجیره.{0,10}(?:پیام|حرف)|پیام.{0,8}گذشته|مکالمه.{0,8}گذشته|ارتقا.{0,4}(?:بده|بدهی|شو)|مثل.{0,10}(?:طوطی|میمون)|تقلید.{0,4}(?:کنی|کردن)|سوال.{0,8}(?:باز|چالش)|نقطه.{0,4}می.{0,4}(?:ذاری|گذاری)|یعنی چی که|بررسی کن|هوشت|هوش تو|فهمیدی چی|نفهمیدی|درک نمی‌کنی|درک نمیکنی|درک نمیکنه|متوجه نمی‌شی|پیچوندی|پیچ دادی|جوابمو نداد|جوابم را نداد|ندادی جواب|جوابم را ندادی|داری فرار می‌کنی|فرار می‌کنی از جواب|حرفمو نمی‌فهمی|منظورم را نمی‌فهمی|داری منو دست می‌ندازی)(?!\p{L})/iu,
      R['ruleMetaFeedback']
    ),

    // The user asks who made Darya, or asks about her origin, ELIZA, or
    // MIT. Darya answers with her own short, curiosity-engaging intro:
    // built by Artin as a tribute to ELIZA, the first chatbot, from MIT.
    // The high priority keeps "کار" inside a phrase like "چی کار می‌کرد؟"
    // from being read as a work-topic disclosure.
    rule(
      'about_eliza',
      66,
      pw(
        'تو رو کی|تو را کی|کی تو رو|کی تو را|کی ساخته|کی ساختت|کی ساختی|کی ساخته شدی|چطور ساخته شدی|چطوری ساخته شدی|سازنده تو|سازنده‌ات|سازنده دریا|آرتین|الیزا|ایلیزا|ام آی تی|اِم آی تی|دکتر وایزنبام|وایزنبام|هدف از ساخت|هدف از ساختن|چرا ساخته شدم'
      ),
      R['ruleAboutEliza']
    ),

    // The user compliments something Darya said or did ("قشنگ گفتی",
    // "آفرین", "سوال خوبی بود", "از این عبارت خوشم می‌آد"). Warm
    // acknowledgement instead of a topic fallback. Kept below about_eliza
    // so a compliment about Darya's self-introduction still routes to the
    // origin story.
    rule(
      'compliment_darya',
      58,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:خوشم (?:میاد|می‌آد|میآد|اومد|آمد)|قشنگ (?:گفتی|جواب دادی|بود|شد)|این (?:جمله|حرف|جواب|پاسخ|عبارت) (?:عالی|قشنگ|خوب|خوبه|عالیه) بود|جوابت.{0,8}(?:عالی|خوب)ه|خوب گفتی|حرف قشنگی زدی|این که گفتی (?:عالی|خوب|قشنگ) بود|حرفت به دلم نشست|این حرف خیلی به دلم نشست|آفرین|احسنت|دمت گرم|سوال.{0,4}(?:خوبی|خوبه|عالیه) بود|سوال خوبی پرسیدی|جواب خوبی دادی|خوب جواب دادی|باهوشی|هوشت بالاست)(?!\p{L})/iu,
      R['ruleComplimentDarya']
    ),

    // The user corrects Darya's misreading ("مگه من راجع به کار صحبت
    // کردم؟!", "منظورم این نبود"). Acknowledge and invite a restated
    // version instead of re-triggering the same topic rule.
    rule(
      'misread_correction',
      56,
      pw(
        'مگه من راجع|مگه من درباره|مگه من گفتم|مگه من صحبت کردم|من گفتم درباره|من گفتم راجع|من صحبت نکردم|من نگفتم|منظورم نبود|منظور من نبود|منظورم این نبود|منظورم این نیست|کجای حرفم|کجای حرف من|بد فهمیدی|بدفهمیدی|اشتباه گرفتی|درست نفهمیدی'
      ),
      R['ruleMisreadCorrection']
    ),

    rule('affirmation', 15, /^(بله|آره|اره)\.?$/i, R['ruleAffirmation']),

    rule('negation', 15, /^(نه|خیر)\.?$/i, R['ruleNegation'])
  ];

  global.DaryaFaRules = rules;
})(typeof window !== 'undefined' ? window : globalThis);
