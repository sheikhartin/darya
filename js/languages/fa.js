/**
 * Darya - Persian (Farsi) language pack assembler.
 * Combines patterns, vocabulary, lookups, rules, and response pools into
 * one Persian pack object. Classic script version.
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

  /**
   * Removes the space between the progressive prefix می/نمی and the
   * following Persian letter for rule matching only. After the half-space
   * normalizer turns ZWNJ into a regular space, "می شود", "می‌شود", and
   * "میشود" collapse to one canonical token. The lookbehind prevents
   * mid-word matches (e.g. "کمی" is left intact).
   */
  function bindPrefixesForMatching(text) {
    return text.replace(
      /(?<!\p{L})(می|نمی)\s(?=[\u0600-\u06FF\uFB50-\uFDFF])/gu,
      '$1'
    );
  }

  const {
    trivialCaptures,
    familyTerms,
    professionTerms,
    placeWords,
    entityCallbackTemplates,
    questionPattern,
    pronounMap,
    exitKeywords,
    wellBeingPattern,
    insultPattern,
    dateTimeTimePattern,
    dateTimeDatePattern,
    daryaHarassmentPattern,
    sexualHarassmentPattern,
    stopWords,
    questionTopics,
    topicSeriousness,
    selfAwareness,
    foreignLanguageRedirect
  } = global.DaryaFaData;
  const rules = global.DaryaFaRules;

  const fa = {
    code: 'fa',
    dir: 'rtl',
    botName: BOT_NAME,
    scriptRange: SCRIPT_RANGE,
    minScriptRatio: 0.85,
    normalize,
    bindPrefixesForMatching,
    rules,
    trivialCaptures,
    genericFallbacks: R.genericFallbacks,
    strategyShiftFallbacks: R.strategyShiftFallbacks,
    sessionCheckIns: R.sessionCheckIns,
    checkInEvery: 8,
    questionPattern,
    questionFallbacks: R.questionFallbacks,
    questionAcknowledgements: R.questionAcknowledgements,
    sourceSuggestions: R.sourceSuggestions,
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
    // Signals for detecting an adult disclosing sexual or romantic
    // attraction toward a minor. All three must align (adult context,
    // attraction vocabulary, minor-age marker) before the protected
    // minor-attraction reply is delivered, so a teenager's normal peer
    // crush never triggers it. `selfAge` and `adultIdentity` establish
    // the adult context; `strongSexual` allows a clearly sexual phrasing
    // to fire even without an explicit age. `familial` blocks the
    // ambiguous attraction words when the text is plainly about a
    // relative ("دخترم را دوست دارم").
    minorAttractionSignals: {
      selfAge:
        /(?<!\p{L})(?:من\s+)?(?:سنم|سن من|سنی)\s*([۰-۹0-9]{2,3})\s*(?:سال(?:ه|م|مه)?)?|من\s+([۰-۹0-9]{2,3})\s*سال(?:ه|م|مه)?(?!\p{L})/iu,
      adultIdentity:
        /(?<!\p{L})(?:من\s+)?(?:یک\s+)?(?:بزرگسال|آدم بزرگ)(?:م| هستم|هستم)?(?!\p{L})/iu,
      attraction:
        /(?<!\p{L})(?:جذبش|بهش|به اون|به او)\s+(?:شدم|دارم)|عاشق(?:ش)?(?:م| هستم| شدم)?|دوستش دارم|دلم می‌خواد باهاش|دلم میخواد باهاش|دلم می خواد باهاش|کراش دارم|علاقه دارم(?: بهش| به اون| به او)?|دوست دارمش|دوسش دارم(?!\p{L})/iu,
      strongSexual:
        /(?<!\p{L})(?:میل جنسی|احساس جنسی|جذب جنسی|از نظر جنسی|تحریک جنسی)(?!\p{L})/iu,
      minor:
        /(?<!\p{L})(?:نوجوان|نوجوون|کودک|دختر\s*بچه|پسر\s*بچه|زیر\s*(?:۱۸|18)|(?<![۰-۹0-9])(?:[1-9]|1[0-7]|[۱-۹]|۱[۰-۷])\s*سال(?:ه|م|مه)?)(?!\p{L})/iu,
      familial:
        /(?<!\p{L})(?:دخترم|پسرم|فرزندم|بچه‌ام|بچه‌هام|نوه‌ام|خواهرزاده|برادرزاده|فرزند من|بچه من)(?!\p{L})/iu
    },
    minorAttractionResponses: R['ruleMinorAttraction'],
    // Neutral probe used for the first half of a split-turn minor
    // attraction disclosure, before the speaker's own age is known.
    minorAttractionProbe: R.minorAttractionProbe,
    // The user wants each list item on its own line ("بهتر نیست هر
    // کدوم رو در یک خط جداگانه بنویسی؟"). Matches the format-feedback
    // override, which re-emits the last knowledge list line by line.
    formatFeedbackPattern:
      /(?:هر کدوم.{0,14}(?:خط|بنویس|بنویسی)|هر کدام.{0,14}(?:خط|بنویس|بنویسی)|تک تک.{0,10}(?:خط|بنویس)|یکی یکی.{0,10}(?:خط|بنویس)|جدا بنویس|جداگانه بنویس|در یک خط جدا|خط به خط|خط جداگانه)/u,
    formatFeedbackResponses: R['ruleFormatFeedback'],
    // Near-peer young-adult crush detection: an 18-20 year old with
    // romantic feelings for a 16-17 year old gets warm practical guidance
    // (pace, respect, consent, local laws) instead of the adult-minor
    // protection reply, which is reserved for mature adults or larger
    // gaps. Reuses the attraction/familial patterns and the selfAge
    // capture, adding a target-age marker for 16-17.
    nearPeerLoveSignals: {
      selfAge:
        /(?<!\p{L})(?:من\s+)?(?:سنم|سن من|سنی)\s*([۰-۹0-9]{2,3})\s*(?:سال(?:ه|م|مه)?)?|من\s+([۰-۹0-9]{2,3})\s*سال(?:ه|م|مه)?(?!\p{L})/iu,
      attraction:
        /(?<!\p{L})(?:جذبش|بهش|به اون|به او)\s+(?:شدم|دارم)|عاشق(?:ش)?(?:م| هستم| شدم)?|دوستش دارم|دلم می‌خواد باهاش|دلم میخواد باهاش|دلم می خواد باهاش|کراش دارم|علاقه دارم(?: بهش| به اون| به او)?|دوست دارمش|دوسش دارم(?!\p{L})/iu,
      targetAge: /(?<!\p{L})(?:1[6-7]|۱۶|۱۷)\s*سال(?:ه|م)?(?!\p{L})/iu,
      familial:
        /(?<!\p{L})(?:دخترم|پسرم|فرزندم|بچه‌ام|بچه‌هام|نوه‌ام|خواهرزاده|برادرزاده|فرزند من|بچه من)(?!\p{L})/iu
    },
    nearPeerLoveResponses: R['ruleNearPeerLove'],
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
    idleOpeners: R.idleOpeners,
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
    ruleTellJoke: R.ruleTellJoke,
    ruleShoppingHelp: R.ruleShoppingHelp,
    // Short yes/no/maybe answers to a question Darya just asked continue
    // the pending thread contextually (see _resolveShortAnswerContext).
    shortAnswerAffirmContext: R.shortAnswerAffirmContext,
    shortAnswerNegateContext: R.shortAnswerNegateContext,
    shortAnswerMaybeContext: R.shortAnswerMaybeContext,
    rulePrivacyBoundary: R.rulePrivacyBoundary,
    ruleSmalltalkCapability: R.ruleSmalltalkCapability,
    ruleAgeGap: R.ruleAgeGap,
    ruleDepression: R.ruleDepression,
    emotionCalibration: R.emotionCalibration,
    ui: {
      appTitle: 'دریا · همراه گفتگوی آرام',
      appDescription: 'دریا، همراه گفتگوی فارسی‌زبان برای گوش دادن و همراهی.',
      placeholderDefault: 'هر چه در دل دارید بنویسید...',
      placeholderEnded:
        'گفت‌وگو پایان یافت. برای شروع دوباره از منو «گفت‌وگوی تازه» را بزنید',
      ariaInputLabel: 'پیام شما',
      // Canonical labels: aria-label === title === visible text
      pickerFaTitle: 'شروع گفت‌وگوی تازه به فارسی',
      pickerEnTitle: 'شروع گفت‌وگوی تازه به انگلیسی',
      themeOceanTitle: 'پوسته اقیانوس',
      themeBeachTitle: 'پوسته ساحل',
      sendButtonTitle: 'ارسال',
      menuTriggerTitle: 'منو',
      newChatTitle: 'گفت‌وگوی تازه',
      themeGroupLabel: 'انتخاب پوسته',
      typingLabel: 'دریا در حال فکر کردن',
      menuNewChat: 'گفت‌وگوی تازه',
      menuExportLabel: 'دانلود گفتگو',
      menuExportTitle: 'دانلود گفتگو',
      themeOceanLabel: 'پوسته اقیانوس',
      themeBeachLabel: 'پوسته ساحل',
      disclaimer:
        'دریا یک همراه شنواست، نه جایگزین راهنمایی تخصصی. در شرایط بحرانی لطفاً با یک متخصص یا خط بحران تماس بگیرید.',
      foreignScriptHint: 'لطفاً فقط فارسی بنویسید تا بتونم همراهی‌تان کنم.',
      exportTitle: `گفت‌وگو با ${BOT_NAME}`,
      exportYouLabel: 'شما',
      exportDivider: '-----------------------------',
      dateLocale: 'fa-IR',
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
      soundOnTitle: 'پخش صدای محیطی: روشن',
      soundOffTitle: 'پخش صدای محیطی: خاموش',
      soundAutoplayBlockedMsg:
        'صدای محیطی نتوانست به\u200cطور خودکار پخش شود؛ برای فعال کردن، روی آیکون صدا بزنید.',
      soundFallbackMsg:
        'فایل‌های صدای محیطی بارگذاری نشدند. از صدای تولیدشده به‌جای آن استفاده می‌شود.',
      engineErrorHint: 'یک مشکل کوچک پیش آمد، اما گفتگو می‌تواند ادامه یابد.',
      notificationError: 'خطا',
      notificationWarning: 'هشدار',
      notificationInfo: 'اطلاع',
      notificationDismiss: 'بستن اعلان'
    }
  };

  global.DaryaFa = fa;
})(typeof window !== 'undefined' ? window : globalThis);
