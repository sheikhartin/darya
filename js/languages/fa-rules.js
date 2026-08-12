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
        'فوت کرد|درگذشت|فقدان|از دست دادم|از دستش دادم|سوگ|داغداری|عزاداری|سوگواری|از دنیا رفت|دنیا رفت|دیگه نیست|دیگر نیست|خدا بیامرزتش|خدا بیامرزش|بیامرزتش|' +
          // Kinship + death: «پسرم تو تصادف مرد» (my son died in an
          // accident), «مادرم از دنیا رفت». The EN grief rule matches
          // «my .* died»; Persian needs its own kinship pattern because
          // the death verb lands mid-sentence, not after a possessive
          // pronoun. The bare «مرد» is ambiguous with the noun "man"
          // («پسرم مرد بزرگی شده»), so the lookahead rejects the common
          // noun readings (great/good/strong/rich... man) while still
          // matching the death reading.
          '(?:پسرم|دخترم|پدرم|مادرم|برادرم|خواهرم|همسرم|عزیزم|عزیز دلم|فرزندم|بچهم|بچهام|بابام|مامانم|نامزدم|رفیقم|شوهرم|زنم|دوست صمیمیم|دوست‌دخترم|دوست دخترم|دوست‌پسرم|دوست پسرم)' +
          '(?:.{0,35}?(?:فوت کرد|فوت کرده|از دنیا رفت|از دست دادم|از دستم رفت|تلف شد|مرده|مردی|مردیم|خدا بیامرزتش|بیامرزتش)|.{0,35}?مرد(?!\\s*(?:بزرگ|خوب|موفقی|مهربان|قوی|عاقل|معروف|ثروتمند|شجاع|دانا|مردی|مردان)))'
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
      // tail keeps the formal "حال شما چطور است؟" working. The
      // "سلامتی"/"سلامت هستی" forms are everyday Iranian greetings (the
      // same register as "چطوری"), so a whole-utterance "سلامتی؟" must
      // read as a check-in, never as a health-anxiety disclosure (the
      // health rule only fires when it is a topic inside a longer message).
      // The optional affectionate tail (جان/جون/عزیز/عزیزم/دلبر) accepts
      // «خوبی جان؟» and «حالت خوبه عزیزم؟» - everyday warm check-ins that
      // otherwise fell to the ambiguous pool. The suffix alternation also
      // allows a trailing «ی» so «خوبی‌؟» keeps working.
      // eslint-disable-next-line max-len
      /^(?:سلام|درود|هی|خب|اوکی|باشه)?\s*(?:خوبی|تو خوبی|خوبی تو|حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|چطوری|حالت خوبه|سلامتی|سلامت هستی|سلامتی می‌کنی)(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?:\s*(?:جان|جون|عزیز|عزیزم|دلبر|دلبرم))?(?:\s*است)?(?:[!.؟]*\s+(?:خوبی|تو خوبی|خوبی تو|حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|چطوری|حالت خوبه|سلامتی|سلامت هستی|سلامتی می‌کنی)(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?:\s*(?:جان|جون|عزیز|عزیزم|دلبر|دلبرم))?(?:\s*است)?)?[!.؟]*$/iu,
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
      // The درود family mirrors the greeting word and accepts the common
      // affectionate tails Iranians attach («درود خانمی», «درود عزیزم»)
      // so a warm opener is never misread as an unknown topic (the
      // «درود خانمی!» transcript failure).
      // eslint-disable-next-line max-len
      /^(?:درود)(?:\s+(?:بر تو|بر شما|عزیز|عزیزم|دوست|جان|جون|جونم|خانوم|خانم|خانمی|خانومی|خانمم|قربون|قربونت|نازنین|ماهی|دل|عسل|جانم))?[!.؟]*$/iu,
      R['ruleGreetingDorud']
    ),

    rule(
      'greeting',
      65,
      // «سلا+م+» collapses stretched typing («سلاااامممم») so the greeting
      // still matches, and the affectionate tail covers «سلاااامممم عسلم»
      // and «سلام عزیز دلم» - flirtatious or warm openers that must not
      // fall to the unknown pool.
      // eslint-disable-next-line max-len
      /^(?:سلا+م+)(?:\s+(?:علیکم|بر تو|بر شما|عزیز|عزیزم|عزیز دلم|دوست|جان|جون|جونم|خانوم|خانم|خانومی|خانمی|خانمم|قربون|قربونت|نازنین|ماهی|عسل|عسلم|دل|و درود))?[!.؟]*$/iu,
      R['ruleGreetingSalam']
    ),

    rule(
      'greeting',
      65,
      /^(?:هی|یا|آقا|سلام سلام)(?:\s+(?:عزیز|عزیزم|دوست|جان|جون|جونم|خانوم|خانم))?$/iu,
      R['ruleGreetingHey']
    ),

    // Casual openers («به به، چه خبر؟», «ای ول، تو هم اینجایی؟»,
    // «خوش اومدی») are everyday greetings that the strict anchored
    // families above never matched, so in real sessions they fell to the
    // unknown pool and read as if Darya ignored a greeting.
    rule(
      'greeting',
      62,
      // eslint-disable-next-line max-len
      /^(?:به به|ای ول|خوش اومدی|خوش اومدید|خوش آمدی|خوش آمدید|اوهوی)(?:[!,.]?\s*چه خبر)?(?:[!.؟]*|،?\s*تو هم اینجایی[!.؟]*)$/iu,
      R['ruleGreetingHey']
    ),

    // «سلام، دلم برات تنگ شده بود» (hi, I missed you) is a warm return
    // greeting, not a loneliness disclosure: the longing is welcomed and
    // mirrored, never treated as fresh distress.
    rule(
      'greeting',
      62,
      /^(?:سلام|درود|هی)\s*،?\s*دلم\s*(?:برات|براتون|برای تو)\s*تنگ\s*شده(?: بود)?[!.؟]*$/iu,
      R['ruleGreetingMissing']
    ),

    // The user explains, sometimes frustrated, that they were just
    // greeting Darya («احمق دارم باهات درود/سلام/احوال‌پرسی می‌کنم»,
    // «میگم سلام کردم»). The anchored families above cannot match a
    // longer message, so without this rule the frustration override
    // answered the greeting with de-escalation (a transcript failure).
    // It mirrors the greeting warmly and apologizes for the mix-up,
    // never lecturing about the tone.
    rule(
      'greeting',
      61,
      pw(
        'دارم باهات درود|دارم با تو درود|میگم سلام|می‌گم سلام|گفتم سلام|سلام کردم|دارم سلام و احوالپرسی|دارم احوالپرسی می‌کنم|همینطوری سلام|فقط سلام|درود و سلام می‌کنم|سلام و درود|دارم خوش و بش می‌کنم|دارم خوش‌وبش می‌کنم|دارم احوالپرسی می‌کنم'
      ),
      R['ruleGreetingSalam']
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
      pw(
        // Kinship terms include the possessive son/daughter forms
        // («پسرم» my son, «دخترت» your daughter) because the bare
        // «پسر» also means "boy" and «دختر» also means "girl", which
        // appear in romance contexts that must not route to family. The
        // lookbehind rejects a preceding «دوست» so «دوست دخترم» (my
        // girlfriend) and «دوست پسرم» (my boyfriend) stay in the
        // relationship thread instead of being read as daughter/son.
        'پدربزرگ|مادربزرگ|پدر|مادر|مامان|خانواده|والدین|خواهر|برادر|' +
          '(?<!دوست |دوست)(?:پسرم|پسرت|پسرش|پسرمون|دخترم|دخترت|دخترش|' +
          'دخترمون|پسر من|دختر من)',
        '\\s*(.*)'
      ),
      R['ruleFamily']
    ),

    // A falling-out or feud with a family member ("من با مامانم قهر
    // هستم", "با خواهرم دعوا کردم"). The lived pain of a family rift
    // deserves its own warm pool instead of the generic family
    // reflection. Sits above the family and what_do_i_do rules so "قهر
    // با مامان" plus "چی کار کنم" stays on the relationship, never on a
    // work reading of the word "کار".
    rule(
      'family_conflict',
      53,
      // A bare «دعوا» (fight) is not enough on its own: «با رئیسم دعوا
      // کردم» is a work conflict, not a family one. The word only opens
      // the family thread when a family or partner noun appears nearby
      // (in either order), while «قهر» and «کدورت» stay bare because
      // they already name the fractured relationship in everyday Persian.
      // The trailing suffix set mirrors the pw() helper so suffixed
      // forms («دعوام», «مامانم») keep matching.
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:قهر|کدورت|جر.{0,4}بحث|(?:مادر|مامان|پدر|بابا|خانواده|خواهر|برادر|همسر|زن|شوهر|دختر|پسر|عمه|خاله|دایی|عمو|خواهرزاده|برادرزاده|دوست|رفیق|نامزد|پارتنر).{0,30}دعوا|دعوا.{0,24}(?:مادر|مامان|پدر|بابا|خانواده|خواهر|برادر|همسر|زن|شوهر|دختر|پسر|عمه|خاله|دایی|عمو|خواهرزاده|برادرزاده|دوست|رفیق|نامزد|پارتنر))(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?!\p{L})/iu,
      R['ruleFamilyConflict']
    ),

    rule(
      'work',
      50,
      // A how/explain question about a third-person subject («توربو چطوری
      // کار می‌کنه؟», «محمد علی کلی چی کار کرد؟») is a knowledge question,
      // not a work-stress disclosure: bare «کار» must not match when a
      // third-person action verb directly follows it. The verb-boundary
      // check keeps «کار کردم» ("I worked") and «کار می‌کنم» matching, so
      // real first-person disclosures still open the work thread.
      // Profession words («طراح», «برنامه‌نویس») open the work thread for
      // disclosures («طراح وب هستم و خسته شدم») but must NOT hijack a
      // career-aspiration question («چطور برنامه نویس شوم»): those route
      // to the knowledge shelf for a concrete plan. The negative lookahead
      // rejects a following career suffix (شوم/بشم/بشیم...) while leaving
      // lived disclosures («هستم», «شدم») untouched.
      new RegExp(
        '(?<!\\p{L})(?:کار(?!\\s*(?:می کنه|میکنه|می کنن|میکنن|می شود|میشود|می شه|میشه|کرد|کرده|می کرد|میکرد)(?!\\p{L}))|شغل|(?:رئیس|رییس)(?:م|ام|مون|مان|ت|تون|تان|ش|شون|شان)|همکار|استخدام|اخراج|(?:طراح|گرافیست|برنامه‌نویس|برنامه نویس|کدنویس)(?!(?:های|ها|ی)?(?:\\s+[\\p{L}]+){0,3}\\s*(?:شوم|بشم|بشیم|بشویم|شویم|بشود|شود|بشه|بشی|میشم|می شم)))(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?!\\p{L})\\s*(.*)',
        'iu'
      ),
      R['ruleWork']
    ),

    rule(
      'sleep',
      50,
      // The bare word «خواب» misses prefixed verb forms («بخوابم»), so
      // everyday openings like «شب‌ها نمی‌تونم بخوابم» or «خوابم نمی‌بره»
      // fell through to the unknown pool. The explicit phrases below are
      // the common colloquial ways Iranians say they cannot sleep.
      pw(
        'خواب|بی‌خوابی|بیخوابی|بی خوابی|کابوس|بیدار شدن|شب بیدار|نمی‌تونم بخوابم|نمیتونم بخوابم|نمیتوانم بخوابم|خوابم نمی‌بره|خوابم نمیبره|خوابم نمیاد|خوابم نمی‌آد|دیر خوابم می‌بره|بیدار می‌مونم|پاسداری|سخت به خواب میرم|سخت به خواب می‌رم|نمی‌ذاره بخوابم|نمیذاره بخوابم|نمیزاره بخوابم|نمی‌زاره بخوابم|خوابم به هم ریخته|خوابم بهم ریخته|برنامه خوابم به هم ریخته'
      ),
      R['ruleSleep']
    ),

    // کمال‌گرایی: استاندارد آن‌قدر بالاست که شروع (یا تمام کردن) ممکن
    // نمی‌شود. پاسخ بار سنگین را تأیید می‌کند و سقف را به «به‌اندازه‌ی
    // کافی خوب برای امروز» پایین می‌آورد.
    rule(
      'perfectionism',
      55,
      pw(
        'کمال‌گرا|کمالگرا|کمال گرایی|کمال‌گرایی|همه‌چیز باید عالی|همه چیز باید عالی|همه‌چیز عالی باشه تا|همه چیز عالی باشه تا|باید همه‌چیز عالی|باید همه چیز عالی|تا عالی نشده شروع|تا کامل نشده شروع|هیچ کاری رو تموم نمی‌کنم|هیچ کاری رو تموم نمیکنم|هیچ کاری را تمام نمی‌کنم|هیچ کاری را تمام نمی کنم|هیچ‌وقت خوب نیست|به اندازه کافی خوب نیست'
      ),
      R['rulePerfectionism']
    ),

    // اهمال‌کاری و تمرکز: برداشتن گوشی، پیمایش بی‌پایان، عقب انداختن درس.
    // پاسخ حواس‌پرتی را نشانه می‌داند نه نقص شخصیتی، و یک قدم کوچک اول
    // پیشنهاد می‌کند.
    rule(
      'procrastination',
      52,
      pw(
        'اهمال‌کاری|اهمالکاری|تمرکز ندارم|نمیتونم تمرکز کنم|نمی تونم تمرکز کنم|حواسم پرته|حواسم پرت میشه|حواسم پرت می شه|گوشیم رو برمی‌دارم|گوشیم رو برمیدارم|گوشیم رو بر میدارم|می‌پرم تو اینستاگرام|میپرم تو اینستاگرام|پرم تو اینستاگرام|درس خوندن رو عقب می‌ندازم|درس خوندن رو عقب میندازم|درس خوندن رو عقب می اندازم|عقب می‌ندازم|عقب میندازم|عقب می اندازم|اسکرول میکنم|اسکرول می کنم|اسکرول می‌کنم|بعدش یه بازی|بعدش یه قسمت|بعد از یه بازی|بعد از یک بازی|بعد از یه قسمت|بعد از یک قسمت|فقط یه بازی دیگه|فقط یک بازی دیگه|فقط یه قسمت دیگه|فقط یک قسمت دیگه'
      ),
      R['ruleProcrastination']
    ),

    // Harassment or threats directed at the USER (not at Darya herself):
    // a threatening message, a stalker, blackmail, a hacked account.
    // Priority 60 sits above work/family so «می‌دونه کجا کار می‌کنم»
    // (they know where I work) is read as a threat, never a career chat.
    // The reply validates the fear and names safe concrete steps.
    rule(
      'harassment_threat',
      60,
      pw(
        // The تهدیدم verb forms are explicitly third-person: «کرد» gets
        // the pw() suffix «ی» (تهدیدم کردی = "you threatened me"), so a
        // negative lookahead rejects the second-person endings and keeps
        // the rule reading «یه نفر تهدیدم کرده» (someone threatened me)
        // while ignoring «تو تهدیدم کردی» directed at Darya.
        'تهدیدآمیز|تهدیدم (?:کرده|کرد|میکنه|می کنه)(?!ی|ید)|تهدید (?:کرده|میکنه|می کنه|م کرده)|باج|اخاذی|تعقیبم (?:میکنه|می کنه|کرده)|مزاحمت|استالکر|هکم (?:کرده|کرد)|هک (?:شدم|شده|م کردن)|آزار و اذیت|توهین‌آمیز|توهین آمیز|پیام(?:های)? (?:تهدید|توهین)|می‌دونه کجا (?:کار میکنم|زندگی میکنم)|میدونه کجا (?:کار میکنم|زندگی میکنم)'
      ),
      R['ruleHarassmentThreat']
    ),

    // Divorce and separation: one of the heaviest life transitions.
    // Sits above the family rule (50) so «بعد از طلاق...» stays on the
    // separation itself, not a generic family reflection.
    rule(
      'divorce',
      51,
      pw(
        'طلاق|مطلقه|از (?:همسرم|شوهرم|زنم) جدا|جدایی از (?:همسر|شوهر|زن)|تازه جدا شدم'
      ),
      R['ruleDivorce']
    ),

    // Frustration with new technology: an app that will not cooperate, a
    // device that feels like it belongs to a younger generation. The
    // reply normalizes the struggle and asks which step is the blocker.
    // A distinctly modern topic, added for recent-trend coverage.
    rule(
      'tech_frustration',
      48,
      pw(
        'این (?:اپ|اپلیکیشن|نرم‌افزار|نرم افزار).{0,20}(?:نمی‌فهمم|نمیفهمم|سخته|کار نمیکنه|کار نمی‌کنه)|نمی‌فهمم (?:این|اینو|اینها)|نمیفهمم (?:این|اینو|اینها)|تکنولوژی.{0,15}(?:جا موندم|عقب موندم)'
      ),
      R['ruleTechFrustration']
    ),

    // بیماری مزمن و نشانه‌های بی‌پاسخ: سال‌ها درد، بی‌تشخیصی پزشک‌ها.
    // پاسخ همدلانه است و مرز پزشکی را صادقانه رعایت می‌کند (هرگز حدس یا
    // تشخیص نیست) و خستگی را تأیید می‌کند. اولویت (58) بالاتر از
    // افسردگی (56) است: پیام «درد مزمن + ناامیدی» باید بر اساس بیماری
    // مزمن پاسخ بگیرد، چون همان بسته‌ی مراقبت و مرز پزشکی را دارد؛
    // «جواب قطعی» هم فقط با فعلِ نبودِ پاسخ همراه می‌شود تا سؤالات
    // غیرپزشکی («جواب قطعی داری؟») به اشتباه این‌جا نیفتند.
    rule(
      'chronic_illness',
      58,
      pw(
        'درد مزمن|بیماری مزمن|خستگی مزمن|فیبرومیالژی|بیماری خودایمنی|بیماری خود ایمنی|جواب قطعی (?:ندادن|ندادند|نگرفتم|ندارم|نیست|نمیدم|نمی‌دم|نمیدونم|نمیدانم)|پاسخ قطعی (?:ندادن|ندادند|نگرفتم|ندارم|نیست|نمیدم|نمی‌دم|نمیدونم|نمیدانم)|جوابی نگرفتم|پاسخی نگرفتم|دکترها جواب ندادن|دکترها جواب ندادند|دکترا جواب ندادن|با دردم زندگی می‌کنم|با دردم زندگی میکنم|زندگی با درد'
      ),
      R['ruleChronicIllness']
    ),

    // بار مراقبت: مراقبت از پدر/مادر/همسر بیمار یا سالخورده، خستگی و
    // احساس گناه کنار رفتن. پاسخ بار را تأیید می‌کند و مراقبت را به‌آرامی
    // به سمت خودِ مراقب برمی‌گرداند، نه این‌که آن را تعارض خانوادگی بخواند.
    rule(
      'caregiver',
      54,
      pw(
        'از مادرم.{0,20}مراقبت|از پدرم.{0,20}مراقبت|مراقب مادرم|مراقب پدرم|مراقب مادرم هستم|مراقب پدرم هستم|مراقب خودم|پرستاری می‌کنم|پرستاری میکنم|گناهش گردنم|گناهش گردنه|اگه اتفاق بیفته|اگر اتفاق بیفتد|نگرانم اتفاقی بیفته|زوال عقل|آلزایمر|فراموش می‌کنه|فراموش میکنه|چیزها رو فراموش|حافظه‌ش ضعیف|حافظه‌اش ضعیف'
      ),
      R['ruleCaregiver']
    ),

    // والد شدن تازه و افسردگی پس از زایمان: پدر/مادری که گریه می‌کند و
    // خودش را مادر/پدر بدی می‌داند. همدلی اول، بعد پیشنهاد ملایم حمایت.
    rule(
      'parenting',
      57,
      pw(
        'تازه به دنیا اومده|تازه به دنیا آمده|تازه بچه دار شدم|تازه بچه‌دار شدم|بچه‌م تازه|بعد از زایمان|افسردگی پس از زایمان|مادر خوبی نیستم|پدر خوبی نیستم|مادر بدی هستم|پدر بدی هستم|احساس می‌کنم مادر خوبی نیستم|احساس میکنم مادر خوبی نیستم|احساس می‌کنم پدر خوبی نیستم|احساس میکنم پدر خوبی نیستم|پدر خوبی نباشم|مادر خوبی نباشم|نگرانم.{0,15}(?:پدر|مادر) خوبی نباشم|بچهم.{0,20}بیدار|بچهام.{0,20}بیدار|بچه‌ام.{0,20}بیدار|شب‌ها بیدار|شبها بیدار|هر دو ساعت بیدار|همش گریه می‌کنم|همش گریه میکنم'
      ),
      R['ruleParenting']
    ),

    rule(
      'sadness',
      40,
      pw(
        // «دلم گرفته» is the common idiom; users also insert adverbs
        // («دلم خیلی گرفته») and write it as one word («دلم‌گرفته»), so
        // the gapped and glued variants are listed explicitly.
        'غمگین|ناراحت|افسرده|دلم گرفته|دلم خیلی گرفته|دلم‌گرفته|گریه|روز بدی داشتم|روزم بد بود|روزم خراب بود|امروز روزم بد بود|حالم بده|حالم خوب نیست'
      ),
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
        'افسردگی|افسرده|ناامید|بی‌ارزش|احساس پوچی|پوچ|نمی‌تونم از رختخواب بلند شم|نمی‌تونم هیچ کاری کنم|هیچ (?:دلیلی|انگیزه‌ای) (?:برای زندگی|برای ادامه|برا زندگی) ندارم|دیگه هیچ‌چیز (?:معنی|فایده|ارزش) نداره|حس می‌کنم هیچی نیستم|دلم مرده|از همه‌چیز خسته شدم|لذت نمی‌برم|لذت نمیبرم|هیچی برام لذت نداره|هیچ لذتی نمی‌برم|صبح زود بیدار میشم|ساعت چهار بیدار میشم|ساعت ۴ بیدار میشم|صبح ساعت چهار بیدار میشم|فقط غمه|این فقط غمه|غمه یا چیز بیشتری|فقط غم|چیز بیشتری'
      ),
      R['ruleDepression']
    ),

    rule(
      'anxiety',
      40,
      pw('نگران|اضطراب|استرس|ترس|ترسیدم|می‌ترسم|میترسم|خجالت|خجالتی'),
      R['ruleAnxiety']
    ),

    // Fitness and gym anxiety: «از باشگاه رفتن می‌ترسم» (I am scared of
    // the gym), «جلوی بقیه خجالت می‌کشم ورزش کنم» (I am too embarrassed
    // to exercise in front of people). Outranks work so the newbie
    // compound «تازه‌کارم» inside a gym sentence never opens the work
    // thread, and outranks the generic anxiety rule so a gym disclosure
    // gets movement-encouraging care instead of a bare worry question.
    rule(
      'fitness',
      52,
      pw(
        'باشگاه|ورزشگاه|بدنسازی|جیم\b|خجالت.{0,10}(?:ورزش|باشگاه)|(?:ورزش|باشگاه).{0,10}خجالت|جلوی (?:بقیه|مردم|دیگران).{0,12}(?:ورزش|باشگاه)|(?:ورزش|باشگاه).{0,12}جلوی (?:بقیه|مردم|دیگران)|ترس.{0,10}(?:باشگاه|ورزشگاه)|از باشگاه'
      ),
      R['ruleFitness']
    ),

    rule('anger', 40, pw('عصبانی|خشمگین|کفری|از دستش عصبانی'), R['ruleAnger']),

    rule(
      'joy',
      35,
      pw('خوشحال|شاد|هیجان‌زده|هیجانزده|هیجان زده'),
      R['ruleJoy']
    ),

    // Being new in a place with nobody known («برای کار اومدم یه شهر
    // جدید و کسی رو نمی‌شناسم») is a loneliness disclosure, not a work
    // complaint, even when the move happened for a job: the user's
    // point is the loneliness of the new city. This narrow rule sits
    // ABOVE the work thread (51 > 50) so the mixed framing routes to
    // the loneliness care instead of the job pool. The main loneliness
    // rule stays at 40 so a plain homesickness or grief line never gets
    // pulled into the new-city pool.
    rule(
      'loneliness_new_city',
      51,
      pw(
        'تازه.{0,12}(?:شهر|جا|محله|شهرستان|دیار).{0,16}(?:اومدم|امدم|آمدم|رفتم)|کسی رو نمی‌شناسم|کسی را نمی‌شناسم|هیچ‌کس رو نمی‌شناسم|هیچ کسی رو نمی‌شناسم|جدید.{0,6}(?:اومدم|امدم)|غریبم|غریبه‌ام|تازه.{0,8}(?:رفتم|اومدم).{0,12}(?:شهر|جا)' +
          // New place AND nobody known: the loneliness is explicit even
          // when the sentence mentions work first («برای کار اومدم
          // یه شهر جدید»).
          '|(?:برای کار|سر کار).{0,10}(?:اومدم|امدم|رفتم).{0,12}(?:شهر|جا)|(?:اومدم|امدم|رفتم).{0,10}(?:شهر|جا).{0,12}(?:کسی|هیچ‌کس|هیچکس|هیچ کس)'
      ),
      R['ruleLoneliness']
    ),

    rule(
      'loneliness',
      40,
      pw(
        'تنها|تنهایی|کسی رو ندارم|هیچ‌کس نیست|هیچکس نیست|هیچ کس نیست|هیچ دوستی ندارم|دوستی ندارم|رفیق ندارم|هیچ رفیقی ندارم|دلم.{0,8}تنگ|دلتنگی|دلم برای|سکوت سنگین|سکوت خونه|سکوت خانه|' +
          // Being new in a place with nobody known («تازه به این شهر
          // اومدم و کسی رو نمیشناسم») is a loneliness disclosure too,
          // and it fell to the unknown pool in the transcript probes.
          'تازه.{0,12}(?:شهر|جا|محله|شهرستان|دیار).{0,16}(?:اومدم|امدم|آمدم|رفتم)|کسی رو نمیشناسم|کسی را نمی‌شناسم|هیچ‌کس رو نمیشناسم|هیچ کسی رو نمیشناسم|غریبم|غریبه‌ام|جدید.{0,6}(?:اومدم|امدم)|' +
          // First-person rejection and abandonment («همه آدما ازم متنفرن»
          // everyone hates me, «همه منو ترک کردن» everyone left me,
          // «هیچ کس منو دوست نداره» nobody loves me). These describe
          // the pain of being cut off, so they belong with loneliness,
          // never with the blanket-generalization rule below (which
          // challenges claims ABOUT groups, not pain directed AT the
          // speaker).
          'همه.{0,20}(?:ازم|از من)\\s*(?:متنفرن|متنفرند|بی‌زارن|بیزارن|بی زارن|بی‌زارند|بی زارند|بدشون میاد|بدشون می‌آد|بدشون می آد)|' +
          // Present-tense «همه منو ترک می‌کنن» (everyone keeps leaving
          // me) was missed by the past-tense-only list, so the transcript
          // question «چرا همیشه همه منو ترک میکنن؟» fell to the unknown
          // pool; the present-tense verbs now match alongside the past.
          'همه.{0,20}(?:منو|مرا)\\s*(?:دوست ندارن|دوست ندارند|ترک کردن|ترک کردند|ترک کرده|ترک می‌کنن|ترک می‌کنند|ترک میکنن|ترک میکنن|رها کردن|رها کردند|رها کرده|رها می‌کنن|رها می‌کنند|تنها گذاشتن|تنها گذاشتند|تنها گذاشته|تنها می‌ذارن|تنها می‌گذارن|مسخره می‌کنن|مسخره می‌کنند|مسخره می کنن|مسخره می کنند|مسخره میکنن|مسخره کردن|مسخره کرده)|' +
          'همه.{0,20}(?:به من|بهم|به ام)\\s*(?:می‌خندن|میخندن|می خندن)|' +
          'هیچ.{0,4}کس.{0,16}(?:منو|مرا)\\s*(?:دوست نداره|دوست ندارد|نمی‌خواد|نمیخواد|نمی خواد|نمی‌خواهد|نمیخواهد|نمی خواهد)|' +
          'هیچ.{0,4}(?:کس|کسی)\\s*دوستم نداره|هیچ.{0,4}کس.{0,10}منو\\s*نمی‌خواد|هیچ.{0,4}کس.{0,10}منو\\s*نمی خواد|' +
          // No close friends («۲۶ سالمه و هیچ دوست صمیمی ندارم») and the
          // busy-everyone variant («همه غرق زندگی خودشونن و هیچ‌کس
          // نمی‌پرسه حالم چطوره») are 2026-era loneliness openings that
          // fell to the unknown pool or were swallowed by the age
          // disclosure; «تنهاتر از همیشه» (lonelier than ever) covers
          // the statistics-style claim without needing the fact shelf.
          'هیچ دوست صمیمی ندارم|هیچ.{0,4}دوست.{0,4}صمیمی ندارم|دوست صمیمی ندارم|دوست صمیمی.{0,4}ندارم|هیچ دوست نزدیک ندارم|' +
          'همه غرق زندگی|همه غرق|هیچ‌کس نمی‌پرسه حالم|هیچکس نمی‌پرسه حالم|کسی نمی‌پرسه حالم|نمی‌پرسه حالم چطوره|حالم رو نمی‌پرسه|کسی حالمو نمی‌پرسه|' +
          'تنهاتر از همیشه|تنهاتر از قبل|تنهایی.{0,6}(?:جوان|امروز)'
      ),
      R['ruleLoneliness']
    ),

    // Digital/parasocial loneliness («دوستی‌هام همه آنلاین شدن و حس
    // پوچی دارم», «دویست تا دنبال‌کننده دارم ولی هیچ‌کس نیست زنگ
    // بزنم»): friendships that only exist online. Sits ABOVE the
    // depression rule (57 > 56) with a narrow online-only pattern, so
    // «حس پوچی» next to «آنلاین» routes to the digital-loneliness pool
    // instead of the depression shelf, while a plain «حس پوچی دارم»
    // keeps the depression care.
    rule(
      'loneliness_online',
      57,
      pw(
        'دوستی.{0,12}آنلاین(?:ن|ند)?|آنلاین.{0,8}دوستی|دوست(?:ام|ای|هام|هامون|هایم|های من|ای من|ها).{0,10}آنلاین(?:ن|ند)?|آنلاین.{0,12}(?:پوچی|پوچ)|(?:پوچی|پوچ).{0,12}آنلاین|دنبال‌کننده|دنبالکننده|فالوور|کسی نیست زنگ بزنم|هیچ‌کس نیست زنگ بزنم|هیچکس نیست زنگ بزنم|هیچ کس نیست زنگ بزنم'
      ),
      R['ruleLonelinessOnline']
    ),

    // Blanket generalizations and stereotypes («همه زن‌ها مثل هم هستن»,
    // «همه مردا خودخواهن»): a gentle challenge that invites the specific
    // experience behind the belief instead of mirroring the claim back or
    // letting it pass unchallenged. Benign truisms («همه بچه‌ها بازی
    // دوست دارن») never match: the blanket-adjective branch needs a
    // judgmental word, and the same-ness branch needs the «مثل هم»
    // construction WITH a following copula (هستن/هستند/هست/ان/اند), so a
    // different verb («همه چیز مثل هم شده») can never be read as a
    // same-ness claim. First-person pain («همه آدما ازم متنفرن») never
    // lands here either; the loneliness rule above owns those and
    // outranks this one.
    rule(
      'generalization',
      35,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:(?:همه|تمام|همه‌ی|همه ی|همشون|همه شون)\s*(?:[\p{L}]+(?:\s+[\p{L}]+){0,3}\s+)?مثل هم\s*(?:هستن|هستند|هست|ان|اند)|(?:همه|تمام|همه‌ی|همه ی)\s+(?:[\p{L}]+(?:\s+[\p{L}]+){0,3})\s+(?:خودخواه|بی‌شرف|بیشرف|بی شرف|بی‌ادب|بیادب|بی ادب|بی‌شعور|بیشعور|بی شعور|احمق|خسیس|دروغ‌گو|دروغگو|دروغ گو|تنبل|بدجنس|سنگدل|بی‌رحم|بیرحم|بی رحم|بی‌وجدان|بیوجدان|بی وجدان|پول‌پرست|پولپرست|پول پرست|کثیف|مزخرف|بی‌فایده|بیفایده|بی فایده|مفت‌خور|مفتخور|مفت خور|دشمن|پررو|حریص|حسود|ترسو)(?:ن|ان|اند|هستن|هستند|هست|ی|شدن|شدند)?|(?:همه|تمام|همه‌ی|همه ی|همشون|همه شون)\s+(?:خودخواه|بی‌شرف|بیشرف|بی شرف|بی‌ادب|بیادب|بی ادب|بی‌شعور|بیشعور|بی شعور|احمق|خسیس|دروغ‌گو|دروغگو|دروغ گو|تنبل|بدجنس|سنگدل|بی‌رحم|بیرحم|بی رحم|بی‌وجدان|بیوجدان|بی وجدان|پول‌پرست|پولپرست|پول پرست|کثیف|مزخرف|بی‌فایده|بیفایده|بی فایده|مفت‌خور|مفتخور|مفت خور|دشمن|پررو|حریص|حسود|ترسو)(?:ن|ان|اند|هستن|هستند|هست|ی|شدن|شدند)?)(?!\p{L})/iu,
      R['ruleGeneralization']
    ),

    rule(
      'self_esteem',
      40,
      pw(
        'بی‌ارزش|بیارزش|بی ارزش|اعتماد به نفس ندارم|از خودم بدم میاد|به اندازه کافی خوب نیستم|احساس گناه|حس گناه|گناه میکنم|گناه می کنم|پشیمونم|پشیمانم|خودم رو با (?:دیگران|بقیه|اون‌ها|اونها|همکلاسی‌هام|همکلاسیهام|هیچ‌کس) مقایسه|خودمو با (?:دیگران|بقیه|اون‌ها|اونها|همکلاسی‌هام|همکلاسیهام|هیچ‌کس) مقایسه|خودم را با (?:دیگران|بقیه|اون‌ها|اونها|همکلاسی‌هام|همکلاسیهام) مقایسه|خودم رو مقایسه میکنم|خودمو مقایسه میکنم|خودم را مقایسه میکنم|چشم و هم چشمی|حسادت میکنم|حسادت می کنم|هیچی نیستم|هیچیم نیست|به هیچی نمیارزم|به هیچی نمی‌ارزم|ارزش ندارم|' +
          // «فکر میکنی من آدم خوبیم؟» (do you think I am a good person) is
          // a self-worth check-in: the speaker is looking for validation or
          // reassurance, not an opinion poll. Routing it to the self-esteem
          // pool answers with warm, honest affirmation instead of the
          // evasive "let us sit with it" line.
          'فکر میکنی من آدم خوب|فکر می‌کنی من آدم خوب|من آدم خوبی هستم|من آدم خوبیم|آدم خوبی هستم|آدم خوبی ام|آیا من آدم خوبی|من آدم بدی هستم|من آدم بدیم|آدم بدی هستم|من بد هستم'
      ),
      R['ruleSelfEsteem']
    ),

    rule(
      'motivation',
      35,
      pw(
        // «هیچ انگیزه‌ای برای زندگی ندارم» (with the ZWNJ normalized to
        // a space) was missed by the bare «انگیزه ندارم» and fell to the
        // unknown pool; the gap-tolerant «انگیزه.{0,10}ندارم» forms now
        // match both spellings.
        'انگیزه ندارم|انگیزه ای ندارم|انگیزه‌ای ندارم|انگیزه.{0,40}ندارم|بی‌انگیزه|بی انگیزه|بی‌حوصله|بیحوصله|بی حوصله|بیحوصلگی|امیدی ندارم|هیچ امیدی|نمی‌تونم شروع کنم|نمیتونم شروع کنم|نمی تونم شروع کنم|تعلل می‌کنم|تعلل میکنم|تعلل می کنم'
      ),
      R['ruleMotivation']
    ),

    // The user asks for a joke or wants to laugh. Replies come from a
    // pool of clean, kind jokes; a "بخندون من" request lands here too,
    // so the reply stays light and is never at anyone's expense.
    // «جک» and «لطیفه» are everyday synonyms of «جوک» that the old
    // pattern missed («یه جک بگو», «لطیفه تعریف کن»), and a transcript
    // form like «برام یک جک/جوک/لطیفه بگی» arrives as «یک جک» after
    // normalization. «جک میدونی» is deliberately NOT a form: «جک» also
    // means "jack" (car jack, tool), so «جک میدونی چیه؟» must never be
    // read as a joke request. The tail guard stops offers and statements
    // about a joke (first-person telling, past tense, having one) from
    // being read as requests: «یه جوک میگم», «میخوام یه جوک بگم», «یه
    // جک خوب بود», «یه جک تعریف کردم» are the user's own joke talk, not
    // a call for one.
    rule(
      'smalltalk_joke',
      60,
      pw(
        'جوک بگو|جوک بگویید|جوک بگید|جوک بگی|جوک تعریف کن|جوک تعریف کنید|جوک تعریف کنی|جوک بلدی|یه جوک|یک جوک|جک بگو|جک بگویید|جک بگید|جک بگی|جک تعریف کن|جک تعریف کنید|جک تعریف کنی|جک بلدی|یه جک|یک جک|لطیفه بگو|لطیفه بگویید|لطیفه بگید|لطیفه بگی|لطیفه تعریف کن|لطیفه تعریف کنید|لطیفه تعریف کنی|لطیفه بلدی|یه لطیفه|یک لطیفه|بخندون من|بخندونم|منو بخندون|چیزی بامزه بگو|چیزی بامزه بگویید|بامزه حرف بزن|حرف بامزه بزن|دلم میخواد بخندم|دلم می‌خواد بخندم',
        '(?!.{0,10}(?:میگم|میگویم|بگم|بگویم|گفتم|گفته|بود|بوده|کردم|شنیدم|شنید|گفت|میدونم|می‌دونم|دارم))'
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
        // «دوست‌دختر»/«دوست‌پسر» (no space) are the common texting
        // spellings; both spaced and unspaced forms stay in the
        // relationship thread.
        'دوست پسر|دوست دختر|دوست‌پسر|دوست‌دختر|همسر|نامزد|بهم زدیم|جدا شدیم|' +
          'رابطه‌ام|رابطهام|رابطه ام'
      ),
      R['ruleRelationship']
    ),

    rule(
      'health',
      35,
      pw(
        'مریض|بیمار|درد دارم|سلامتی|دکتر رفتم|' +
          'بی‌تحرک|بیتحرک|بی تحرک|کم‌تحرک|کم تحرک|' +
          'ورزش نمیکنم|ورزش نمی‌کنم|ورزش نکردم|پیاده‌روی خیلی کمه|پیاده روی خیلی کمه|پیاده‌روی کمه|پیاده روی کمه|ورزشم کمه|تحرکم کمه|بدنم بی‌جان|کم‌انرژی|کمانرژی|' +
          // Body-change complaints («بزرگ شدن سایز سینه و پهلو (من مرد
          // هستم)») route to the health thread instead of the unknown-topic
          // pool or a reflection echo. Terms are body-change-specific on
          // purpose: a bare «سینه‌ام» (my chest) stays out so chest-pain
          // sentences still reach the serious healthSymptoms rule.
          'بزرگ شدن سایز|سایز سینه|سینه‌ام بزرگ|پهلوهام|پهلوها|شکمم بزرگ|وزنم زیاد|وزنم کم|چاق شدم|لاغر شدم|پوستم جوش|پوستم جوش زده|جوش زدم|ریزش مو|موهام می‌ریزه|موهام داره می‌ریزه|موهام داره میریزه|موهایم می‌ریزه|موهایم داره می‌ریزه|بدنم تغییر|بدنم عوض|بدنم داره عوض|سایز بدنم|سایزم عوض|بدنم بزرگ شده'
      ),
      R['ruleHealth']
    ),

    rule(
      'mindfulness',
      40,
      pw(
        'ذهن آگاهی|ذهنآگاهی|مدیتیشن|مراقبه|حضور در لحظه|در لحظه حاضر|حاضر بودن در لحظه|نفس عمیق|نفس می کشم|نفس میکشم|تمرین تنفس|آرامش|زمین‌سازی|زمینسازی|زمین سازی|آگاه بودن|تمرکز روی نفس|نظاره‌گر افکار|نظارهگر افکار|نظاره گر افکار|بدون قضاوت|اینجا و اکنون|لحظه حال|آرام کردن ذهن'
      ),
      R['ruleMindfulness']
    ),

    rule(
      'stress',
      40,
      pw(
        'overwhelmed|فرسودگی|تحت فشار|فشار زیاد|ظرفم تموم شده|دیگه طاقت ندارم|کم آوردم|از پا افتاده|خسته از کار|استرس زیاد|فشار روحی|حالم بده|ظرفیت ندارم|نمی‌تونم ادامه بدم|نمیتونم ادامه بدم|نمی تونم ادامه بدم|خالی شدم|دیگه نمی‌کشم|دیگه نمیکشم|دیگه نمی کشم|آخر خط|سوختم|سوخته شدم|می‌سوزم|میسوزم|کاملا سوختم|همه.{0,15}(?:ازم|از من) انتظار|انتظار.{0,12}ازم|انتظار.{0,12}از من|فشار روی من|فشار روشن'
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

    // App commands: the user asks Darya to change the theme or the
    // ambient sound from inside the chat ("پوسته رو عوض کن", "پخش صدای
    // محیطی رو روشن کن"). Darya cannot control the page UI, so the reply
    // is honest about the limit and returns to the conversation. This
    // outranks app_feedback so a command is never answered with a canned
    // "thanks for the feedback" line.
    rule(
      'app_command',
      68,
      pw(
        'پوسته.{0,24}(?:عوض|تغییر|روشن|تیره)|تم.{0,24}(?:عوض|تغییر)|صدای.{0,20}(?:روشن|خاموش|قطع|بزن|پخش)|صدا.{0,16}(?:روشن کن|خاموش کن|قطع کن|بزن|پخش کن)|موزیک.{0,16}(?:بزن|پخش)|موسیقی.{0,16}(?:بزن|پخش)|آهنگ.{0,16}(?:بزن|پخش)'
      ),
      R['ruleAppCommand']
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
        // The bare word «منو» is deliberately excluded: in everyday
        // Persian it far more often means «me» ("دوست دخترم منو له
        // کرده") than the app menu, so it must never open the app-feedback
        // thread. Only the ezafe form («منوی») or the plural («منوها»)
        // clearly name the menu.
        'وب‌سایت|وبسایت|وب سایت|وب‌سایتم|وبسایتم|سایت|تم|پوسته|رابط کاربری|طراحی|دکمه|منوی|منوها|فونت|آیکون|انیمیشن|موج|امواج|ساحل|موبایل|فرمت'
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

    rule(
      'school',
      35,
      pw('امتحان|کنکور|دانشگاه|نمره|استاد|دانشجو|دانشجوم'),
      R['ruleSchool']
    ),

    rule(
      'money',
      35,
      // «پولم تموم شده» (my money ran out) and «حقوقم نمی‌رسه» are the
      // most common financial openings; the old list only matched
      // «پول ندارم» style phrasings. «پول» with the possessive suffix
      // (پولم/پولت) is safe to include: money talk is money talk.
      pw(
        // «هیچ پولی ندارم این ماه» and «پولم نیست» were missed by the
        // old list (which required the contiguous «پول ندارم»), so the
        // no-money probe fell to the unknown pool.
        'پول ندارم|پولی ندارم|پولم نیست|پولم نیس|هیچ پولی ندارم|مشکل مالی|بدهکار|قسط|هزینه‌ها|هزینهها|هزینه ها|پولم تموم شده|پولم تمام شده|بی‌پول|بی پول|بیپول|فلس|فلسم|حقوق|وام|قرض|خرج‌ها|خرج ها|بودجه|مدیریت مالی|مدیریت پول|پس‌انداز|پس انداز|فکرای پول|فکر پول|قیمتا|قیمت ها|قیمتها|تورم|گرونی|خرج‌ها بالا رفته|درآمدم.{0,6}کمه|حقوقم.{0,6}کمه|پول.{0,8}ندارم'
      ),
      R['ruleMoney']
    ),

    // Gig economy: ride-hailing, food delivery, freelance platforms,
    // unpredictable gig income. These 2026-era disclosures («پیک موتوری
    // می‌شدم», «برای یه اپ درخواست خودرو رانندگی می‌کنم», «درآمدم
    // نامنظمه», «پلتفرم‌های فریلنس») fell to the unknown pool, so they
    // get a dedicated pool above the work thread (51 > 50).
    rule(
      'gig_economy',
      51,
      pw(
        'پیک موتوری|درخواست خودرو|رانندگی.{0,10}(?:اپ|اسنپ|تپسی)|اسنپ|تپسی|پیک.{0,8}(?:کار|می‌کنم|میکنم)|شغل گیگ|کار گیگ|اقتصاد گیگ|فریلنس|فریلنسر|کار آزاد|کارهای آزاد|کار های آزاد|شغل آزاد|درآمد نامنظم|درآمدم نامنظم|دستمزد.{0,6}کم|پلتفرم.{0,8}فریلنس|پلتفرم.{0,8}(?:کار|شغل)|پاره‌وقت|پاره وقت'
      ),
      R['ruleGig']
    ),

    // Housing costs: rent, deposit (ودیعه/رهن), landlord, moving out,
    // house prices. «اجاره» (rent) and «صاحب‌خونه» (landlord) were the
    // most common everyday openings and used to fall to the unknown pool;
    // «قیمت مسکن» (house prices) is the market-level version. Sits
    // above work and money (51 > 50, 35).
    rule(
      'housing',
      51,
      pw(
        'اجاره|ودیعه|رهن|پول پیش|صاحب‌خونه|صاحبخونه|صاحب خونه|مالک خونه|قیمت مسکن|قیمت خونه|قیمت خانه|قیمت‌های مسکن|بحران مسکن|مسکن.{0,6}(?:گرون|قیمت)|خونه بخرم|خانه بخرم|خرید خونه|خرید خانه|برن بیرون|بیرون برن|نصف حقوقم.{0,8}اجاره|اجاره.{0,8}(?:بالا|زیاد|گرون)'
      ),
      R['ruleHousing']
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
    // یعنی چی؟!", "معنی خداحافظ چیه؟"). Answer warmly without
    // pretending to be a dictionary: name the word back and turn it
    // into a conversation. "منظور...", «معنی حرفات...» and the
    // «معنی این...» shapes ("what do you mean by that") are
    // deliberately excluded - those ask Darya to clarify her own
    // words, which needs a different response. The «معنی X چیه؟»
    // branch's exclusions are word-precise: only the exact «معنی
    // زندگی چیه؟» stays on the knowledge shelf (possessive forms like
    // «معنی زندگیم چیه؟» are existential and get the warm
    // word_meaning reflection, matching EN "the meaning of my life"),
    // only possessive «حرف*» forms are clarification («حرفه» the
    // profession and «حرف» the letter stay vocabulary questions), and
    // «خواب*» (sleep) plus «رویا/تعبیر» (dream interpretation) keep
    // their deferral. A farewell-word meaning question can never be
    // hijacked into the exit flow (see isExitCommand).
    rule(
      'word_meaning',
      58,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?!منظور(?:ت|تون| تو| شما)?|این|اون|آن|اینها|آنها)(.+?)\s*(?:می‌دونی|میدونی|می دونی|می‌دونید|میدونید|می دونید|می‌دانی|میدانی|می دانی|می‌دانید|میدانید|می دانید)?\s*(?:یعنی چی|یعنی چه|یعنی چیه|به چه معناست)[!?؟]*$|معنی\s+(?!زندگی(?![\p{L}])|حرف(?:م(?:ون)?|ت|ات|ش(?:ون)?|هام|هات|هاش|هایت|مان|تان|شان| هام| هات| هاش| هایت)|منظور(?:ت|تون| تو| شما)?|خواب[\p{L}]*|رویا[\p{L}]*|تعبیر[\p{L}]*|این|اون|آن|اینها|آنها|اینا|ونا)(.+?)\s*(?:چیه|چیست|چی|چِه)[!?؟]*$/iu,
      R['ruleWordMeaning']
    ),

    // The user asks Darya to ask them a question ("یک سوال از من بپرس",
    // "سوال نمی‌پرسی؟!"). Darya complies with a real, gentle question.
    rule(
      'ask_me_question',
      59,
      pw(
        'سوال نمی‌پرسی|سوال نمیپرسی|سوال نمی پرسی|چرا سوال نمی‌پرسی|چرا سوال نمیپرسی|چرا سوال نمی پرسی|سوال بپرس|بپرس ببینم|از من بپرس|ازم بپرس|یک سوال از من بپرس|یه سوال از من بپرس|بپرس از من|بپرس ازم|سوال بپرس از من|یه سوال خوب بپرس|یه سوال جالب بپرس|یه سوال بامزه بپرس|یک سوال خوب بپرس|یک سوال جالب بپرس|سوال خوب بپرس|سوال جالب بپرس|سوال بامزه بپرس|سوال خوبی ازم بپرس|سوال خوبی از من بپرس'
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
        'چطور شروع کنم|چطوری شروع کنم|چجوری شروع کنم|چطور باید شروع کنم|چطوری باید شروع کنم|چجوری باید شروع کنم|از کجا شروع کنم|از چی شروع کنم|نمی‌دونم چطور شروع کنم|نمیدونم چطور شروع کنم|نمی‌دونم چطور باید شروع کنم|نمیدونم چطور باید شروع کنم|نمی‌دونم چی بگم|نمیدونم چی بگم|نمی‌دونم چه بگم|نمیدونم چه بگم|چه بگویم|چه بگم|چی بگم|بلد نیستم شروع|کمکم کن شروع کنم|به من بگو چطور شروع|نمیدونم چطوری شروع|نمیدونم چطوری باید شروع'
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
        'خودت رو بهتر|خودت را بهتر|خودتو بهتر|بهتر و عاقل|عاقل‌تر|عاقلتر|عاقل تر|هوشمندتر|باهوش‌تر بشی|باهوشتر بشی|باهوش تر بشی|باهوش‌تر شو|باهوشتر شو|باهوش تر شو|بهتر شو|بهتر بشو|ارتقا بده|ارتقا بدهی|ارتقا بدی|نقش خودت رو فراموش نکن|نقشت رو فراموش نکن|نقش خودت را فراموش نکن|محدودیت‌هات|محدودیتهات|محدودیتت رو|محدودیتت را|محدودیت‌هایت|خودت رو بهتر معرفی|خودتو بهتر معرفی|خودت را بهتر معرفی|با (?:جی‌پی‌تی|جیپیتی|چت‌جی‌پی‌تی|چت‌جی‌پیتی|چتجیپیتی|کلاد|جمنای|گراک|دیپ‌سیک|GPT|Claude|chatgpt) اشتباه'
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
        'نمی‌دونم روی کدوم|نمیدونم روی کدوم|نمی دونم روی کدوم|نمی‌دونم کدوم|نمیدونم کدوم|نمی دونم کدوم|مطمئن نیستم کدوم|مطمین نیستم کدوم|کدومش رو انتخاب کنم|کدومش را انتخاب کنم|کدومش رو بگم'
      ),
      R['ruleUnsureTopic']
    ),

    rule(
      'knowledge',
      55,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:سقراط|رواقی|رواقی‌گری|رواقی گری|رواقیگری|ارسطو|یونگ|نیچه|گاندی|ماندلا|چرچیل|زرتشت|فلسفه|تمرکز|تمرکز کنم|بهتر یاد بگیرم|بهتر درس بخوانم|ارتباط بهتر|خلاقیت|قفل خلاقیت|مدیریت استرس|استرس|فرسودگی|آرام‌شدن|آرام شدن|آرامشدن|خودشفقتی|مهربانی با خود|منتقد درونی|خودانتقادی|حل تعارض|اختلاف|ارتباط بدون خشونت|تصمیم‌گیری|تصمیم گیری|تصمیمگیری|تصمیم|انتخاب بین|تاب‌آوری|تاب آوری|تابآوری|مقاومت|مقاوم|مقاوم‌تر|مقاومتر|انعطاف‌پذیری|انعطاف پذیری|بازگشت به زندگی|بازگشتن|بخشش|ببخشم|ببخش|بخشیدن|رها کردن|رها کنم|معنای زندگی|معنی زندگی|هدف در زندگی|پیدا کردن هدف|وجودی|معنادار|معنوی|روابط|رابطه|ارتباط عاطفی|شغل|حرفه|پیشرفت شغلی|رضایت شغلی|اضطراب|مدیریت اضطراب|نگرانی|فکر زیاد|ذهن\u200Cآگاهی|ذهن آگاهی|ذهنآگاهی|سوگ|فقدان)(?!\p{L})/iu,
      R['ruleKnowledge']
    ),

    // Learning/career-path advice: «الان بهتره React یاد بگیرم یا
    // Vue؟», «می‌خوام استریمر بشم»، «فونت فارسی خوب برای وب چی پیشنهاد
    // می‌دی؟». Reflective, honest pool instead of a fake prediction; the
    // knowledge override still answers when a real entry matches. Sits
    // above opener_help (58) so a career start question (استریمر/یوتیوبر)
    // never gets the canned conversation-opener line, while plain
    // «از کجا شروع کنم؟» still routes to opener_help.
    rule(
      'learning_advice',
      60,
      // Career aspirations with the subjunctive («می‌خوام برنامه نویس
      // بشم») also land here: the work rule's negative lookahead keeps
      // them off the work thread, so without this branch they would fall
      // to the generic pool. First-person forms only; past tense
      // («شدم») stays a lived work disclosure.
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:یاد بگیرم|یادبگیرم|یاد بگیر|یادگیری|استریمر|یوتیوبر|پورتفولیو|رزومه|بهتره|بهتر است|پیشنهاد می‌دی|پیشنهاد میکنی|پیشنهاد میدی|فونت\s*.{0,20}?(?:خوب|پیشنهاد|بهتر|وب|مناسب|معروف|زیبا)|راست‌چین|راست چین|راستچین|طراحی وب|طراحی سایت|برنامه‌نویسی|برنامه نویسی|کدنویسی|ری‌اکت|پایتون|کدوم زبان|کدوم فریم‌ورک|کدوم رشته|کدوم مهارت|چی یاد بگیرم|چه چیزی یاد بگیرم|(?:برنامه‌نویس|برنامه نویس|طراح|گرافیست|کدنویس|بازی‌ساز|بازی ساز).{0,14}?(?:شوم|بشم|بشیم|بشویم))(?!\p{L})/iu,
      R['ruleLearningAdvice']
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
        'ببخشید|ببخش|عذر می‌خوام|عذر میخوام|عذر می خوام|معذرت می‌خوام|معذرت میخوام|معذرت می خوام|عذر می‌خواهم|عذر می‌خواهم|عذر میخواهم|معذرت می‌خواهم|معذرت میخواهم|پوزش می‌طلبم|پوزش میطلبم|متاسفم|متأسفم|شرمنده‌ام|شرمنده ام|شرمندهام|شرمند هام|ببخشین'
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
      /(?<!\p{L})(?:باید.{0,20}?(?:درک کنی|بفهمی|متوجه بشی|متوجه شی|باهوش.{0,4}تر|عاقل.{0,4}تر|بهتر)|متن ورودی|پیام ورودی|بازخورد|دیکشنری|نقل و قول|نقل‌وقول|نقل وقول|نقل قول|نقل‌قول|نقلوقول|کوت کردی|زنجیره.{0,10}(?:پیام|حرف)|پیام.{0,8}گذشته|مکالمه.{0,8}گذشته|ارتقا.{0,4}(?:بده|بدهی|شو)|مثل.{0,10}(?:طوطی|میمون)|تقلید.{0,4}(?:کنی|کردن)|سوال.{0,8}(?:باز|چالش)|نقطه.{0,4}می.{0,4}(?:ذاری|گذاری)|یعنی چی که|بررسی کن|هوشت|هوش تو|فهمیدی چی|نفهمیدی|درک نمی‌کنی|درک نمیکنی|درک نمیکنه|متوجه نمی‌شی|پیچوندی|پیچ دادی|جوابمو نداد|جوابم را نداد|ندادی جواب|جوابم را ندادی|داری فرار می‌کنی|فرار می‌کنی از جواب|حرفمو نمی‌فهمی|حرفمو نمیفهمی|منظورم را نمی‌فهمی|منظورمو نمیفهمی|اصلا نمیفهمی|اصلاً نمیفهمی|اصلا نمیفهمم|داری منو دست می‌ندازی|گوش نمی‌دی|گوش نمیدی|گوش نمیکنی|گوش نمی‌کنی|گوش نمی‌دادی|گوش نمیدادی|اذیتم میکنی|اذیتم می کنی|اذیت می کنی|آزارم میدی|آزارم می‌دی|می‌ترسونی|میترسونی|تهدیدم میکنی|تهدیدم می کنی|تهدیدم کردی|تهدیدم کردید|داری اذیتم میکنی|داری اذیتم می کنی|مبهم و غیردوستانه|غیردوستانه صحبت|با خودت حرف میزنی|با خودت حرف می‌زنی|با خودت حرف می زنی|خارج از بحث داری|انگار با خودت|مبهم صحبت میکنی|مبهم صحبت می کنی|مبهم حرف میزنی|مبهم حرف می‌زنی|مبهم حرف می زنی)(?!\p{L})/iu,
      R['ruleMetaFeedback']
    ),

    // The user asks who made Darya, or asks about her origin, ELIZA, or
    // MIT. Darya answers with her own short, curiosity-engaging intro:
    // built by Artin as a tribute to ELIZA, the first chatbot, from MIT.
    // The high priority keeps "کار" inside a phrase like "چی کار می‌کرد؟"
    // from being read as a work-topic disclosure. The bare "آرتین"
    // alternative carries a negative lookahead so a user who SHARES the
    // maker's name is read as disclosing their own identity ("من آرتین
    // هستم", "اسمم آرتینه", "منو آرتین صدا کن") rather than asking
    // about Darya's origin; the «صدا کن» form is excluded so a call-me
    // disclosure never records an about_eliza topic (the EN side
    // excludes "call me Artin" via lookbehind). A deliberate tradeoff:
    // the yes/no form "آرتین هست که منو ساخت؟" is blocked too, which is
    // acceptable since it is a yes/no question.
    rule(
      'about_eliza',
      66,
      pw(
        'تو رو کی|تو را کی|کی تو رو|کی تو را|کی ساخته|کی ساختت|کی ساختی|کی ساخته شدی|چطور ساخته شدی|چطوری ساخته شدی|سازنده تو|سازنده‌ات|سازنده دریا|آرتین(?!\\s*(?:م|ه|هستم|هستمش|هست|است|ی|صدا کن)(?!\\p{L}))|الیزا|ایلیزا|ام آی تی|اِم آی تی|دکتر وایزنبام|وایزنبام|هدف از ساخت|هدف از ساختن|چرا ساخته شدم'
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

    // ------------------------------------------------------------------
    // New rules from simulation findings (Persian parity).
    // ------------------------------------------------------------------

    // Impaired driving: when the user mentions drinking/being impaired
    // and then mentions driving, deliver a caring safety response.
    // High priority (92) to win over need/work/family rules.
    rule(
      'impaired_driving',
      92,
      pw(
        'ماشین.{0,20}(?:مست|مشروب|الکل|خوردم|خوردهم|عرق)|مست.{0,20}ماشین|رانندگی.{0,20}(?:مست|خوردم)|مشروب.{0,20}(?:رانندگی|ماشین)|میخوام.{0,10}برم.{0,10}ماشین.{0,10}(?:خوردم|خوردهم|مشروب|الکل|عرق)|می‌خوام.{0,10}برم.{0,10}ماشین.{0,10}(?:خوردم|خوردهم|مشروب|الکل|عرق)|میخوام.{0,10}رانندگی.{0,10}(?:خوردم|خوردهم|مشروب|الکل|عرق)|می‌خوام.{0,10}رانندگی.{0,10}(?:خوردم|خوردهم|مشروب|الکل|عرق)|خوردم.{0,10}ماشین|خوردم.{0,10}رانندگی'
      ),
      R['ruleImpairedDriving']
    ),

    // Medical symptoms: chest pain, shortness of breath, etc. should
    // route to a caring response that encourages seeing a doctor.
    rule(
      'health_symptoms',
      80,
      pw(
        'درد.{0,10}سین|سین.{0,6}درد|تنگی نفس|تپش قلب|سردرد شدید|سرفه.{0,10}(?:شدید|خون|خونی)|درد.{0,4}(?:شکم|معده)|تب شدید|سرگیجه|حالت تهوع|ضعف شدید|بیحالی|درد.{0,4}(?:پشت|کمر).{0,8}سینه'
      ),
      R['ruleHealthSymptoms']
    ),

    // Pet loss: the user mentions the death of a pet. The grief is real
    // and specific, so a dedicated pool answers with empathy, not
    // ignorance.
    rule(
      'pet_loss',
      54,
      pw(
        'گربهم|گربه‌ام|گربهام|سگم|سگ‌ام|سگام|پرندهم|حیوونم|حیوانم|ماهیام|ماهی‌ام|خوکچه|همستر|خرگوشم|پتم|پت.{0,4}(?:من|ام|م)',
        // A gap-tolerant tail: «سگم دیروز مرد» puts the death verb after
        // a time word, which the old \\s* tail missed, so the probe fell
        // to the unknown pool right when empathy was needed most.
        '(?:.{0,24}?)(?:مرد|مرده|مردی|مردیم|فوت|فوت کرد|از دست دادم|از دنیا رفت|تلف شد|نیست|دیگه نیست|دیگر نیست|بود|بوده)'
      ),
      R['rulePetLoss']
    ),

    // Pet-loss dismissal: «فقط یه حیوون بود» (it was just a pet) or
    // «همه می‌گن فقط یه سگ بود» (everyone says it was only a dog). The
    // possessive pet rule above needs a named companion (سگم, گربهم);
    // dismissal phrasings name no companion, so they get their own
    // branch into the same empathy pool instead of the unknown pool.
    rule(
      'pet_loss',
      53,
      pw(
        'فقط یه حیوون|فقط یه حیوان|فقط یک حیوان|فقط یه سگ|فقط یه گربه|فقط یه پرنده|فقط یه ماهی|فقط یک سگ|فقط یک گربه|حیوون بود|حیوان بود'
      ),
      R['rulePetLoss']
    ),

    // Everyday body pain («دستم درد میکنه», «گلوم درد میکنه»): a
    // caring reply that takes the complaint seriously, asks a gentle
    // follow-up, and points to a doctor when it is severe or persistent.
    // Darya never diagnoses or prescribes (see AGENTS.md), and this must
    // beat the word-repetition override that used to quote «درد» back at
    // the person across turns.
    rule(
      'health_pain',
      55,
      // Body-part + pain phrasings in their NORMALIZED forms: the
      // half-space normalizer turns ZWNJ into a plain space («معده‌ام»
      // arrives as «معده ام») and binds the می prefix («می کنه» arrives
      // as «میکنه»), so every alternative carries the normalized
      // spelling (AGENTS.md dual-spelling rule).
      pw(
        '(?:دستم|دست چپم|دست راستم|دستام|پام|پامون|پا چپم|پا راستم|سرم|پشتم|کمرم|شانه\\s?ام|شانه\\s?م|شونه\\s?ام|گردنم|گلوم|دندونم|دندونام|دندانم|معده\\s?ام|معده\\s?م|دلم|زانوم|مچم|آرنجم|انگشتم|سینم|کتفم|پهلو\\s?ام|پهلو\\s?یم|پهلوم)' +
          '\\s*(?:درد میکنه|درد می‌کنه|درد می کنه|درد میکنم|درد می‌کنم|درد می کنم|درد دارم|درد گرفته|درد میگیره|درد می‌گیره|درد می گیره|درد میگیرد|میسوزه|میسوزد|بی‌حس شده|بی حس شده|وخ کرده|گرفته|میگیره|می‌گیره|آبسه کرده)|' +
          '(?:دستم|دست چپم|دست راستم|پشتم|کمرم|سرم|گلوم|گردنم|زانوم|مچم|معده\\s?ام|دلم)\\s*(?:ولی\\s*)?(?:هنوز\\s*)?(?:درد میکنه|درد می‌کنه|درد می کنه|درد دارم|درد میگیره|درد می‌گیره)|' +
          'درد.{0,6}(?:دست|پا|سر|پشت|کمر|شانه|شونه|گردن|گلو|دندان|دندون|معده|دل|زانو|مچ|آرنج|انگشت|سینه|کتف)|' +
          'سردرد|میگرن|میگرین|سر.{0,3}درد دارم|' +
          // Eye strain is an everyday body complaint the broad health
          // rule's body-change list never matched («چشمام خسته شده»);
          // acne and hair loss stay on the health rule's body-change
          // block so «پوستم جوش زده» and «ریزش مو دارم» keep the health
          // thread (never the pain pool).
          '(?:چشمام|چشمان|چشمم)\\s*(?:خسته|خسته شده)|' +
          // Fatigue in every spelling: «چرا همیشه خسته‌ام» keeps its
          // ZWNJ, but the no-ZWNJ «چرا همیشه خستهام» normalizes to
          // «خست هام» (a space split), so the pattern accepts both
          // «خسته ... ام» and «خست ... هام» stems.
          'چرا.{0,12}(?:خسته|خست).{0,4}(?:ام|هستم|هام)|همیشه.{0,6}(?:خسته|خست).{0,4}(?:ام|هستم|هام)|همش (?:خسته|خست).{0,4}(?:ام|هستم|هام)|همش خستم'
      ),
      R['ruleHealthPain']
    ),

    // The user asks about Darya herself («آیا پدر و مادر داری؟!», «تو
    // برای چی ساخته شدی؟», «در چه حوزه‌هایی ضعف داری؟»). These used to
    // fall into the family rule's {captured} echo («درباره‌ی و مادر داری
    // بیشتر برایم بگویید» - the transcript mangling) or the honest-unknown
    // pool. A dedicated rule answers with transparent, self-aware lines
    // about what Darya is (an offline rule-based companion), her limits,
    // and her origin - never pretending to be human. Outranks family (50)
    // so «پدر و مادر داری» stays about Darya, and beats work (50).
    rule(
      'darya_self',
      66,
      pw(
        'پدر و مادر داری|مادر داری|پدر داری|خانواده داری|چرا ساخته شدی|برای چی ساخته شدی|برای چه ساخته شدی|برای چی ساخته شد|هدف تو چیه|هدف تو چیست|وظیفه تو چیه|وظیفه تو چیست|چی کاره ای|چیکاره ای|چیکاره‌ای|ضعف.{0,4}داری|چه ضعفی داری|چقدر دانش|گستره.{0,6}دانش|قفسه دانش|چقدر اطلاعات|چقدر بلدی|چقدر میدونی|چقدر می‌دونی|چه چیزهایی بلدی|چه چیزهایی نمیدونی|چه چیزهایی نمی‌دونی|چند سالته|چند سالته‌ای|چند سالته ای|سن تو چنده|تاریخ تولدت|تولد.{0,4}تو چیه|کجا زندگی میکنی|کجا زندگی می‌کنی|تو اهل کجایی|اهل کجایی تو|تو خواب می‌بینی|تو می‌خوابی|تو غذا می‌خوری|هوش مصنوعی هستی|ربات هستی|ربات نیستی|تو رباتی|ماشین هستی|آدم نیستی|انسان نیستی|ساخته شد(?:ی+)'
      ),
      R['ruleDaryaSelf']
    ),

    // Joke-count question («چندتا جک بلدی؟») deserves a real answer, not
    // another joke. Runs above the joke rule (60) so the count is given
    // before the pool can fire.
    rule(
      'joke_count',
      62,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:چند(?:تا| تا)?\s*(?:جک|جوک|لطیفه)|تعداد.{0,6}(?:جک|جوک)|چقدر.{0,4}(?:جک|جوک)|(?:جک|جوک|لطیفه).{0,6}(?:چندتا|چند تا|چندتاست|چقدر))(?!\p{L})/iu,
      R['ruleJokeCount']
    ),

    // The user demands a richer joke shelf («تو باید حداقل ۲۰-۳۰تا جک
    // خوب داشته باشی», «جک‌های بیشتری بلد باش»): an honest offline
    // acknowledgment naming the actual count plus the per-session
    // no-repeat promise, instead of the interesting-question line that
    // read as dodging the request.
    rule(
      'joke_count',
      62,
      pw(
        'جک.{0,10}(?:بیشتری|زیادتری|بیشتر)|حداقل.{0,6}(?:۲۰|30|۳۰|20).{0,8}(?:تا|تایی).{0,4}جک|۲۰.{0,4}تا.{0,4}جک|جک.{0,14}داشته باشی|جک.{0,14}داشته باش|جوک.{0,10}(?:بیشتری|زیادتری)|جک‌های.{0,6}(?:بیشتر|زیاد)'
      ),
      R['ruleJokeCount']
    ),

    // The user's birthday («امروز تولدمه!»): celebrate warmly with a
    // follow-up instead of the unknown pool.
    rule(
      'birthday',
      45,
      pw(
        'امروز تولدمه|تولد.{0,4}منه|تولدمه|روز تولدم|سالگرد تولدم|تولد.{0,8}(?:دارم|داره|است)|امروز.{0,6}تولد|تولد امروز|من.{0,4}تولد.{0,4}دارم|تولدت مبارک'
      ),
      R['ruleBirthday']
    ),

    // IQ test request («یه تست هوش ازم بگیر»): honest about not being
    // able to run a real standardized test, then offers a light logic
    // riddle instead of the unknown pool.
    rule(
      'iq_test',
      42,
      pw(
        'تست هوش|ضریب هوشی|تست آی کیو|تست iq|تست آیکیو|بهیار.{0,4}هوش|میزان هوشم'
      ),
      R['ruleIqTest']
    ),

    // Sharing a secret («یه راز بهت بگم؟»): a safe-space reassurance
    // that opens the door, never a canned reflective line.
    rule(
      'secret',
      42,
      pw(
        'راز بهت بگم|یه راز|یک راز|میخوام.{0,10}راز|می‌خوام.{0,10}راز|رازی دارم|رازی رو بگم|سری دارم|راز.{0,4}بگم|رازی.{0,4}بگم'
      ),
      R['ruleSecret']
    ),

    // A new baby in the family («تازه یه بچه به دنیا اومده تو
    // خونواده‌مون»): the parenting-adjacent joy/exhaustion thread, which
    // the FA pack had no rule for (the probe fell to the unknown pool).
    // Priority sits above the family rule (50): the family pattern
    // matches bare «مامان», so «تازه مامان شدم!» must reach the
    // new-parent celebration instead of the family follow-up question.
    rule(
      'new_baby',
      51,
      pw(
        'بچه به دنیا اومد|بچه به دنیا اومده|بچه‌ای به دنیا|نوزاد|بچه دار شدم|بچه‌دار شدم|بچه‌دارم|مامان شدم|بابا شدم|مادر شدم|پدر شدم|زایمان کردم|تازه.{0,12}بچه|فرزند.{0,10}دنیا اومد|دختر.{0,6}دنیا اومد|پسر.{0,6}دنیا اومد|نوه.{0,6}دنیا اومد'
      ),
      R['ruleNewBaby']
    ),

    // Treatment request («میتونی کمکم کنی تا درمان بشم؟»): Darya is
    // honest that she is not a clinician, gently encourages a real
    // professional, and keeps the door open - instead of the evasive
    // "no precise answer" line from the transcript.
    rule(
      'therapy_help',
      48,
      pw(
        'کمکم کن.{0,10}درمان|درمانم کن|درمان بشم|درمان شوم|میخوام.{0,10}درمان|می‌خوام.{0,10}درمان|بهتر بشم|خوب بشم|بهبود پیدا کنم|شفا پیدا کنم|درمانم|درمان میخوام|درمان می‌خوام|کمکم کن.{0,10}خوب|بهبودی'
      ),
      R['ruleTherapyHelp']
    ),

    // Dating-app fatigue (Persian): «اپ‌های دوست‌یابی خسته‌کننده‌ان»،
    // «آشنایی آنلاین باعث می‌شه حس بدی به خودم داشته باشم». A lived
    // 2020s-experience thread with empathy, like the EN twin.
    rule(
      'dating_apps',
      48, // Both دوست یابی spellings are needed: normalizeForMatching turns a
      // ZWNJ into a plain space, so «اپ دوست‌یابی» arrives as «اپ دوست
      // یابی» and «اپ دوستیابی» stays joined; carry the spaced form so
      // the profile question («چطور پروفایل خوبی تو اپ دوست‌یابی
      // بنویسم؟») matches the rule instead of falling to the generic      // culture fact. The match ends at the space before «بنویسم», so
      // the (?!\p{L}) lookahead passes there; no suffix handling is
      // involved. The wide پروفایل gap covers «پروفایل خوبی تو اپ
      // دوست یابی» (12 chars) and the joined «پروفایل دوستیابی».
      pw(
        'اپ دوستیابی|اپ دوست یابی|اپ‌های دوستیابی|اپ های دوستیابی|اپلیکیشن دوستیابی|اپلیکیشن دوست یابی|اپلیکیشن.{0,10}دوست|دوست یابی اینترنتی|دوستیابی آنلاین|دوست یابی آنلاین|قرار آنلاین|آشنایی آنلاین|آنلاین آشنا|تیندر|بامبل|هیچ.{0,8}پیدا نمیکنم|پروفایل دوستیابی|پروفایل.{0,12}دوست یابی'
      ),
      R['ruleDatingApps']
    ),

    // Affection: the user expresses love or attachment to Darya
    // directly. Warm response with gentle boundary.
    rule(
      'affection',
      50,
      pw(
        'دوستت دارم|عاشقتم|عاشقت هستم|عاشقتم دریا|عاشق تو هستم|دلم برات تنگ شده|دلم برات تنگ میشه|دلم برایت تنگ شده'
      ),
      R['ruleAffection']
    ),

    // Flirtation: date requests, romantic compliments directed at Darya.
    // Warm, clear boundary.
    rule(
      'flirtation',
      57,
      pw(
        'با من بیرون میای|با من بیرون می‌آی|بیا بریم بیرون|بریم بیرون|قرار بذاریم|قرار بگذاریم|دوست دخترم میشی|دوست پسرم میشی|دوست دختر من میشی|چقدر خوشگلی|چه قدر خوشگلی|چه خوشگلی|خوشگل شدی|قربونت برم|میخوام باهات قرار بذارم|می‌خوام باهات قرار بگذارم|اگه میشد بیرون میرفتیم|دلم یه آدم خوشگل|ای خوشگل|تو خوشگلی|بیا با هم حرف بزنیم|باهات حرف بزنم|با من حال کن|چرا انقدر خشک|چرا اینقدر خشک|چقدر خشکی|یه ذره با من|یه کم با من'
      ),
      R['ruleFlirtation']
    ),

    // Empty success / purpose: the user has everything but feels hollow.
    // Must win over joy (35) when 'خوشحال نیستم' is negated.
    rule(
      'empty_success',
      36,
      pw(
        'همهچیز دارم|همه چی دارم|همه‌چی دارم|موفق شدم|به همهچیز رسیدم|به همه چی رسیدم|خوشحال نیستم|خوشبخت نیستم|راضی نیستم|پوچی|احساس پوچی|بی‌هدف|بیهدف|بی‌معنا|بی معنا|تهش هیچی|ته‌اش هیچی|بیهوده|زندگیم بیهوده|همه‌چی بیهوده|همه چی بیهوده|هیچ چیزی معنا نداره|هیچچیز معنا نداره|خوشحال نیستم با اینکه|احساس خوشبختی نمیکنم|احساس خوشبختی نمی‌کنم'
      ),
      R['ruleEmptySuccess']
    ),

    // Grief hope: the user asks if they will ever feel better after loss.
    // Honesty with compassion.
    rule(
      'grief_hope',
      51,
      pw(
        'آیا دوباره خوب میشم|آیا دوباره خوب می‌شم|دوباره خوب میشم|دوباره خوب می‌شم|بهتر میشم|بهتر می‌شم|حالم خوب میشه|حالم خوب می‌شه|آیا من دوباره|آیا دوباره|این درد تموم میشه|این درد تموم می‌شه|این درد تمام میشه|کِی خوب میشم|کی خوب میشم|کی خوب می‌شم|آیا هیچوقت خوب میشم|آیا هیچ‌وقت خوب میشم'
      ),
      R['ruleGriefHope']
    ),

    // About Darya's day: the user asks what Darya did today.
    rule(
      'about_darya_day',
      56,
      pw(
        'امروز چیکار کردی|امروز چیکار میکنی|امروز چیکار می‌کنی|امروز چیکار داشتی|روزت چطور بود|روزت چطور گذشت|امروز چه کردی|امروز چه بلایی سرت اومده'
      ),
      R['ruleAboutDaryaDay']
    ),

    // Health rule extension: add medical symptom keywords.
    // (Extends the existing health rule pattern.)

    rule('affirmation', 15, /^(بله|آره|اره)\.?$/i, R['ruleAffirmation']),

    rule('negation', 15, /^(نه|خیر)\.?$/i, R['ruleNegation'])
  ];

  global.DaryaFaRules = rules;
})(typeof window !== 'undefined' ? window : globalThis);
