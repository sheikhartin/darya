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

  // Load response pools and the curated cultural-language layer.
  var R = global.DaryaFaResponses;
  var culture = global.DaryaFaCulture;
  var society = global.DaryaFaSociety;
  var halfSpace = global.DaryaHalfspace.halfSpace;

  const BOT_NAME = 'دریا';

  // Persian/Arabic Unicode blocks, including presentation-form supplements
  // some fonts/keyboards produce.
  const SCRIPT_RANGE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

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
   * Applies a final display-only code-point guard without changing spacing,
   * punctuation, or the user's own text. Iranian Persian output uses Farsi
   * Yeh and Keheh, never their Arabic look-alikes.
   * @param {string} text - Generated Persian response
   * @returns {string}
   */
  function normalizeOutput(text) {
    return String(text)
      .replace(/[\u064a\u0649]/gu, 'ی')
      .replace(/\u0643/gu, 'ک');
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
    exitStoryPattern,
    exitFalsePositivePattern,
    wellBeingPattern,
    insultPattern,
    dateTimeTimePattern,
    dateTimeDatePattern,
    dateTimeYearPattern,
    daryaHarassmentPattern,
    sexualHarassmentPattern,
    stopWords,
    questionTopics,
    topicSeriousness,
    selfAwareness,
    foreignLanguageRedirect
  } = global.DaryaFaData;
  const rules = [
    ...global.DaryaFaRules,
    ...((culture && culture.rules) || []),
    ...((society && society.rules) || [])
  ];

  const fa = {
    code: 'fa',
    dir: 'rtl',
    botName: BOT_NAME,
    scriptRange: SCRIPT_RANGE,
    // A sentence stays Persian as long as the majority of its letters are
    // Persian: everyday speech freely borrows English words ("tired",
    // "ok", "باشه"), so only a message that is mostly foreign script
    // gets the polite redirect to write in Persian.
    minScriptRatio: 0.6,
    // Technical identifiers are normal inside Persian software questions and
    // do not count as a foreign-language switch for script validation.
    scriptExemptPattern:
      /\b(?:API|BDD|CD|CI|CSS|CTF|DNS|Git|GitHub|HTML|HTTP|HTTPS|JSON|Linux|MFA|MongoDB|Node\.js|NoSQL|OWASP|PostgreSQL|PWA|Python|REST|SIEM|SOC|SQL injection|SQL|TCP|TLS|TypeScript|UNHCR|WCAG|Wi-Fi|WiFi|WPA2|WPA3|race condition|service worker|threat model|pull request)\b/giu,
    normalize,
    normalizeOutput,
    bindPrefixesForMatching,
    rules,
    culture,
    society,
    trivialCaptures,
    genericFallbacks: R.genericFallbacks,
    strategyShiftFallbacks: R.strategyShiftFallbacks,
    sessionCheckIns: R.sessionCheckIns,
    checkInEvery: 8,
    questionPattern,
    questionFallbacks: R.questionFallbacks,
    questionAcknowledgements: R.questionAcknowledgements,
    sourceSuggestions: R.sourceSuggestions,
    unknownTopicResponses: R.unknownTopicResponses,
    unknownTopicCaringResponses: R.unknownTopicCaringResponses,
    adviceBridgeResponses: R.adviceBridgeResponses,
    promiseAcknowledgedResponses: R.promiseAcknowledgedResponses,
    promiseCircleBackResponses: R.promiseCircleBackResponses,
    promiseReleasedResponses: R.promiseReleasedResponses,
    topicCallbacks: R.topicCallbacks,
    quotedCallbackTemplates: R.quotedCallbackTemplates,
    distressNudges: R.distressNudges,
    // Live-data questions (current price/weather/news/score/rate).
    liveDataPattern:
      /(?:قیمت (?:امروز|الان|لحظه‌ای|لحظه ای|روز)|قیمت (?:دلار|یورو|طلا|سکه|بیت کوین|بیتکوین|ارز|بنزین|خودرو)(?:\s|$|چنده|چقدره|چیه)|(?:دلار|یورو|طلا|سکه|بیت کوین|بیتکوین) (?:چنده|چقدره|چند شده|چنده امروز)|هوا (?:چطوره|چطور است|چه جوریه|چجوریه|خوبه)|آب و هوا|آب‌وهوا|وضع هوا|دمای (?:هوا|امروز|الان)|اخبار (?:امروز|روز|جدید|تازه)|خبر (?:جدید|تازه|روز)|نتیجه (?:بازی|مسابقه|فوتبال)|کی برد|نرخ (?:ارز|دلار|بهره|تورم امروز))/u,
    liveDataResponses: R.liveDataResponses,
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
    // Joking softener attached to ideation («شوخی کردم», «شوخی بود»):
    // routes the safety turn to the gentle check-in pool instead of the
    // full hotline reply (see responder-overrides.js).
    jokeSoftenerPattern:
      /(?:شوخی (?:کردم|بود|میکنم|می‌کنم)|مزاح کردم|جدی نگفتم|جدی نبود)\s*[.!؟]?\s*$/u,
    safetySoftenedResponses: R.safetySoftenedResponses,
    // Neutral probe used for the first half of a split-turn minor
    // attraction disclosure, before the speaker's own age is known.
    minorAttractionProbe: R.minorAttractionProbe,
    // The user wants each list item on its own line ("بهتر نیست هر
    // کدوم رو در یک خط جداگانه بنویسی؟"). Matches the format-feedback
    // override, which re-emits the last knowledge list line by line.
    formatFeedbackPattern:
      /(?:هر کدوم.{0,14}(?:خط|بنویس|بنویسی)|هر کدام.{0,14}(?:خط|بنویس|بنویسی)|تک تک.{0,10}(?:خط|بنویس)|یکی یکی.{0,10}(?:خط|بنویس)|جدا بنویس|جداگانه بنویس|در یک خط جدا|خط به خط|خط جداگانه|خط فاصله|بهتر نبود.{0,30}(?:خط|فاصله)|فاصله.{0,8}(?:بنویسی|نوشتی|بذاری|بگذاری))/u,
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
    fatigueResponses: R['ruleFatigue'],
    topicShiftTemplates: R.topicShiftTemplates,
    recapTemplates: R.recapTemplates,
    humanTouch: R.humanTouch,
    emotionShiftLines: R.emotionShiftLines,
    playfulHuff: R.playfulHuff,
    professionalBoundary: R.professionalBoundary,
    selfAwareness,
    exitKeywords,
    exitStoryPattern,
    exitFalsePositivePattern,
    exitConfirmMessages: R.exitConfirmMessages,
    exitConfirmCaringMessages: R.exitConfirmCaringMessages,
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
    caringFarewells: R.caringFarewells,
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
    dateTimeYearPattern,
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
    ruleDirtyTalkRequest: R['ruleDirtyTalkRequest'],
    ruleTellJoke: R.ruleTellJoke,
    ruleTellStory: R.ruleTellStory,
    ruleTellStoryHorror: R.ruleTellStoryHorror,
    ruleTellStoryComedy: R.ruleTellStoryComedy,
    ruleShoppingHelp: R.ruleShoppingHelp,
    // Recommendation follow-ups ("anything similar but darker?", «بهتره
    // انیمیشن هم باشه») continue the same shelf warmly when the follow-up
    // names no genre word (see the sequential-refinement block).
    recFollowupResponses: R.ruleRecFollowup,
    // Pronoun-referencing follow-ups on the last knowledge topic (see
    // the sequential-refinement block).
    knowledgeFollowupResponses: R.ruleKnowledgeFollowup,
    // Short yes/no/maybe answers to a question Darya just asked continue
    // the pending thread contextually (see _resolveShortAnswerContext).
    shortAnswerAffirmContext: R.shortAnswerAffirmContext,
    shortAnswerNegateContext: R.shortAnswerNegateContext,
    shortAnswerMaybeContext: R.shortAnswerMaybeContext,
    echoAnswerResponses: R.echoAnswerResponses,
    rulePrivacyBoundary: R.rulePrivacyBoundary,
    ruleSmalltalkCapability: R.ruleSmalltalkCapability,
    ruleAgeGap: R.ruleAgeGap,
    ruleDepression: R.ruleDepression,
    emotionCalibration: R.emotionCalibration,
    // Question recall (see responder-recall.js): «یادته آخرین سوالی که
    // ازت پرسیدم چی بود؟!» answers from conversation memory by quoting
    // the user's last question back, never an evasive "I do not have an
    // answer" line. questionRecallFoundResponses carries the {question}
    // placeholder; questionRecallNoneResponses is the honest reply when
    // no question has been asked yet. Recall questions end with ؟/؟! in
    // everyday typing, so the pattern deliberately ignores the trailing
    // punctuation (the normalizer strips it for matching anyway).
    questionRecallPattern:
      /(?<![\p{L}۰-۹])(?:یادت(?:ه| میاد| می‌آد| هست| هستش| میمونه| می‌مونه)?\s*(?:اصلا|اصلاً)?\s*(?:آخرین|اخرین)\s*سوالی|آخرین\s*سوالی\s*که\s*(?:ازت|از تو|تو)\s*پرسیدم|آخرین\s*سوالم|آخرین\s*سوال\s*من|سوالی\s*که\s*(?:ازت|از تو|تو)\s*پرسیدم|چی\s*پرسیدم|چی\s*ازت\s*پرسیدم|چی\s*از\s*تو\s*پرسیدم)(?![\p{L}۰-۹])/iu,
    questionRecallFoundResponses: R.questionRecallFoundResponses,
    questionRecallNoneResponses: R.questionRecallNoneResponses,
    // Knowledge-expansion request (see responder-recall.js): the long
    // transcript turn asking Darya to build a richer dataset (good
    // questions, movies, games, books, anime, traditional medicine, study
    // help, general knowledge, fun facts). The strong signal (دیتاست) is
    // enough on its own; otherwise content words must co-occur with a
    // build/learn/expand framing so a plain movie or fact request is
    // never hijacked. All variants are the normalized forms (ئ to ی,
    // ZWNJ to space) so both spellings match.
    knowledgeExpansionSignals: {
      strong: /(?<![\p{L}۰-۹])(?:دیتاست|دیتاستی|دانش عمومی)(?![\p{L}۰-۹])/u,
      content:
        /(?<![\p{L}۰-۹])(?:فکت|فیلم|فیلم های|کتاب|کتاب های|بازی|بازی های|انیمه|انیمیشن|طب سنتی|کمک تحصیلی|دانش)(?![\p{L}۰-۹])/u,
      framing:
        // «باشه» stays OUT: an agreement particle like «بهتره انیمیشن
        // هم باشه» is a recommendation follow-up, not a dataset request.
        /(?<![\p{L}۰-۹])(?:داشته باشی|داشته باشم|یاد بگیری|اضافه کنی|بسازی|بسازم|بسازیم|انجام بدی|گسترش|بیشتر کنی|فهمیدی)(?![\p{L}۰-۹])/u
    },
    knowledgeExpansionResponses: R.knowledgeExpansionResponses,
    // Session user profile: patterns that detect age/name disclosures
    // ("من ۲۴ سالمه", "اسمم آریاه") and recall questions ("چند سالمه؟",
    // "اسمم چیه؟"), plus the reply pools. Values live only on the
    // engine instance and are never persisted (see _handleUserProfileTurn).
    // The name statement rejects question words (چیه/چیست/کیه) so a
    // recall question is never misread as a disclosure. nameCopulaStrip
    // removes the attached spoken copula ("آریاه" -> "آریا").
    userProfilePatterns: {
      ageStatement:
        // The colloquial «۲۴ سالمه» carries its own copula (سال + م + ه)
        // and «سالم» (سال + م) does too, so both are matched alongside the
        // longer «N ساله هستم» / «N سال دارم» forms. Without them, the
        // combined disclosure «اسمم آریاست و ۲۴ سالمه» stored the name but
        // silently dropped the age. Note: «سالم» also means "healthy", so
        // a bare «سالم» without a preceding number can never match (the
        // pattern always requires the digits first); a digit + «سالم» is
        // read as the age form, which is the natural reading.
        /(?<!\p{L})(?:(?:من\s+)?(?:سنم|سن من|سنی)\s*([۰-۹0-9]{1,3})\s*(?:سالمه|سالم|سال(?:ه|م|مه)?)?|من\s+([۰-۹0-9]{1,3})\s*(?:سالمه|سالم|سال(?:ه|م|مه)?)|(?:و\s*)?([۰-۹0-9]{1,3})\s*(?:(?:سال(?:ه|م|مه)?)\s*(?:دارم|هستم|ام)|سالمه|سالم))(?![\p{L}۰-۹])/iu,
      ageQuestion:
        // «یادته که گفتم ... چند سالمه» (with up to 30 chars between the
        // recall cue and the age phrase) was missed by the old 10-char
        // gap, so the transcript recall fell through to the name capture.
        /(?<!\p{L})(?:چند سالمه|سنم چنده|سنم چند|چند ساله‌ام|چند ساله ام|یادت.{0,30}?(?:چند سالمه|سنم|سن من|چند ساله)|یادت.{0,30}?سالم)(?!\p{L})/iu,
      // Both the "اسمم X" form and the copular "من X هستم" form are
      // matched. The copular form is the natural Persian self-introduction
      // ("من آرتین هستم") and is deliberately constrained to letters
      // only, so "من خسته هستم" (I am tired) can never store an emotion
      // as a name: nameStopwords lists the common adjectives that follow
      // the copula, and the handler rejects any captured candidate on it.
      // The third branch catches the attached first-person copula
      // («من بارانم», «من کوروشم») where the final «م» glues to the name
      // with no space, the most common informal self-introduction.
      nameStatement:
        // Recall fragments after «اسمم» («رو یادته», «رو گفتم», «چی بود»,
        // «یادت رفته») must not be captured as names: they mark a
        // question about the stored name, which nameQuestion handles.
        // Only «اسمم»/«اسم من» carries these fragments; the copular
        // branches have no recall ambiguity. The «اسممو سارا بذار»
        // branch covers the preposed form only (name before بذار); the
        // postposed «اسممو بذار سارا» is deliberately out of scope.
        // Question words (کی/کسی/آدم/آد) are also rejected up front so a
        // recall like «من کی هستم» can never store «کی» as a name (the
        // transcript's worst failure); the nameStopwords list below is
        // the belt-and-suspenders second guard.
        /(?<!\p{L})(?:اسمم|اسم من)\s+(?!چیه|چیست|چی|کیه|کیست|کی|کسی|آدم|آد|چی\s*بود|رو\s*(?:یادت|گف)|را\s*(?:یادت|گف)|رو\s+|را\s+|یادت)([\p{L}]{2,20})\s*(?:است|هست|ه)?|من\s+(?!چیه|چیست|چی|کیه|کیست|کی|کسی|آدم|آد)([\p{L}]{2,20})\s+هستم(?!\p{L})|من\s+(?!چیه|چیست|چی|کیه|کیست|کی|کسی|آدم|آد)([\p{L}]{2,12})م(?!\p{L})|(?<!\p{L})(?:منو|من رو|من را|مرا)\s+([\p{L}]{2,20})\s+صدا(?:م)?\s*کن(?!\p{L})|(?<!\p{L})(?:اسممو|اسمم رو|اسمم را|اسم من رو|اسم من را|اسم منو)\s+(?!چیه|چیست|چی|کیه|کیست|کی|کسی|آدم|آد|چی\s*بود|یادت)([\p{L}]{2,20})\s+(?:بذار|بگذار|بزار)(?!\p{L})/iu,
      // Group 3 of nameStatement is the glued first-person copula
      // («من بارانم»); the handler reads this flag instead of hardcoding
      // the group index (see responder-profile.js).
      nameAttachedGroup: 3,
      nameStopwords: [
        // States and emotions: "من خسته هستم" is a feeling, not a name.
        // The ئ to ی normalizer turns «مطمئن» into «مطمین», so the
        // normalized form must be listed too or «اسمم مطمینه» would be
        // captured as a name.
        'خسته',
        'مطمئن',
        'مطمین',
        'آماده',
        'خوشحال',
        'ناراحت',
        'عصبانی',
        'نگران',
        'موافق',
        'مخالف',
        'حاضر',
        'منتظر',
        'تنها',
        'متاسف',
        'شرمنده',
        'راضی',
        'مقصر',
        'بیگناه',
        'مشتاق',
        'سردرگم',
        'گیج',
        'غمگین',
        'افسرده',
        'مضطرب',
        'دلخور',
        'معتقد',
        'امیدوار',
        'ممنون',
        'آرام',
        'راحت',
        'قوی',
        'ضعیف',
        'سالم',
        'مریض',
        'بیمار',
        'گرسنه',
        'تشنه',
        // Gender and role self-descriptions: "من مرد هستم" is a
        // disclosure of identity, never a name.
        'مرد',
        'زن',
        'خانم',
        'آقا',
        'پسر',
        'دختر',
        'بچه',
        'پدر',
        'مادر',
        'برادر',
        'خواهر',
        'پدربزرگ',
        'مادربزرگ',
        'عمو',
        'دایی',
        'خاله',
        'عمه',
        'دوست',
        'رفیق',
        'همکار',
        'همسایه',
        // Professions: "من دکتر هستم" states a job, not a name.
        'دکتر',
        'مهندس',
        'معلم',
        'دبیر',
        'استاد',
        'دانشجو',
        'دانشآموز',
        'کارمند',
        'پرستار',
        'بیکار',
        'بازنشسته',
        'مدیر',
        'نویسنده',
        'هنرمند',
        'نقاش',
        'خواننده',
        'فوتبالیست',
        'ورزشکار',
        'تاجر',
        'کشاورز',
        'سرباز',
        'وکیل',
        'قاضی',
        'محقق',
        'پژوهشگر',
        'روانشناس',
        'مشاور',
        'پزشک',
        // Relationship status self-descriptions: «من متاهلم», «من مجردم»,
        // «من طلاق گرفتم» state a life fact, never a name.
        'متاهل',
        'متأهل',
        'مجرد',
        'مطلقه',
        'نامزد',
        'بیوه',
        // Everyday self-descriptions that glue to the attached first-person
        // copula: «من خوبم», «من بدم», «من جوانم» state how the speaker
        // is, never who they are.
        'خوب',
        'بد',
        'بزرگ',
        'کوچک',
        'جوان',
        'پیر',
        'شجاع',
        'ترسو',
        // Pronouns and reflexives: «من خودم رو واکاوی کنم» is "myself",
        // never a name. «خود» is what the attached-copula branch captures
        // from «من خودم».
        'خود',
        // Question/identity words that must never be stored as names:
        // «من کی هستم» captured «کی», and «فکر میکنی من آدم خوبیم؟»
        // captured «آد» (the attached copula ate the tail). Both were
        // top transcript failures.
        'کی',
        'کیه',
        'کیست',
        'کیا',
        'کسی',
        'آد',
        'آدم',
        'انسان',
        'بشر',
        'خوبیم',
        'آدم خوب',
        'آدم خوبی',
        'آدم‌خوب',
        // First-person verb stems that glue to the attached copula:
        // «من میرم», «من میخوام», «من هستم» say what the speaker does or
        // is, never who they are. The stems are the forms captured before
        // the final «م» (میخوام -> میخوا, میرم -> میر). The normalizer
        // maps ئ to یی, so «مطمئنم» arrives as «مطمینم» and needs its
        // normalized stem here.
        'میخوا',
        'میگ',
        'میر',
        'میدون',
        'میا',
        'میفهم',
        'میبین',
        'میخون',
        'میخوان',
        // Past-tense first-person verb stems that glue to the attached
        // copula: «من موندم» (I stayed), «من رفتم» (I went), «من شدم»
        // (I became) state an action or state, never a name. The attached
        // «م» branch captures the stem before it (موندم -> موند). Without
        // these, «فقط من موندم» (I was the only one left) stored «موند»
        // as a name.
        'موند',
        'موندم',
        'رفت',
        'رفتم',
        'اومد',
        'امد',
        'اومدم',
        'امدم',
        'آمد',
        'آمدم',
        'شد',
        'شدم',
        'گفت',
        'گفتم',
        'کرد',
        'کردم',
        'دید',
        'دیدم',
        'شنید',
        'شنیدم',
        'بود',
        'بودم',
        'خواست',
        'خواستم',
        'توانست',
        'توانستم',
        'تونست',
        'تونستم',
        'آورد',
        'آوردم',
        'برد',
        'بردم',
        'داد',
        'دادم',
        'گرفت',
        'گرفتم',
        'خورد',
        'خوردم',
        'زد',
        'زدم',
        'خواند',
        'خواندم',
        'نوشت',
        'نوشتم',
        'پرسید',
        'پرسیدم',
        'فهمید',
        'فهمیدم',
        'دونست',
        'دونستم',
        'جا موند',
        'جواموند',
        // More attached-copula states from the wild persona probes: «من
        // مستم» (I am drunk), «من سیرم» (I am full), «من کسلم» (I am
        // bored/lazy), «من خوابم» (I am sleepy), «من آرومم» (I am calm,
        // colloquial), «من پریشانم» (I am distressed), «من آشفتم» (I am
        // upset, the ه drops before the copula), «من ترسیدم» (I got
        // scared), «من گرمم/سردم» (I am hot/cold), «من دلم گرفته» (my
        // heart is heavy, captures «دل»), «من خمارم» (I am hungover).
        // Each is a state, never a name, and each glued form the probe
        // stored as a false name is listed here in its captured stem.
        'مست',
        'خمار',
        'سیر',
        'کسل',
        'خواب',
        'آروم',
        'پریشان',
        'آشفت',
        'آشفته',
        'ترسید',
        'ترسیده',
        'گرم',
        'سرد',
        'دل',
        'هست',
        'دار',
        'کن',
        'بگ',
        'بر',
        'بیا',
        'بذار',
        'بزار',
        'بدون',
        'ببین',
        'بفهم',
        'بخوا',
        'بکن',
        'بده',
        'بگیر',
        'بزن',
        'بنداز',
        'ببر',
        'بیار',
        'رفت',
        'اومد',
        'گفت',
        'دید',
        'شنید',
        'کرد',
        'گرفت',
        'خواست',
        'گذاشت',
        'فهمید',
        'مطمین',
        'مطمئن'
      ],
      // The spoken copula after a name: «آریاه» -> «آریا» (the ه of the
      // colloquial copula), and the glued «ست» form that drops the «ا»
      // of «است» after a vowel-final name («ساراست» -> «سارا» + «ست»,
      // «آریاست» -> «آریا», «میناست» -> «مینا»). Stripping the bare
      // «است» would wrongly eat the name's own final «ا» («ساراست» ->
      // «سار»), so «ست» must be stripped instead, and «هستم»/«هست» are
      // handled before «ه» so «مهندس هستم» strips the full copula.
      nameCopulaStrip: /(?:هستم|هست|ست|ه)$/u,
      nameQuestion:
        // «من کی هستم» and «من کی بودم» are self-identity questions, not
        // disclosures; combined with the recall cues they must answer from
        // the stored profile (or honestly admit nothing is stored), never
        // capture «کی» as a name.
        /(?<!\p{L})(?:اسمم چیه|اسم من چیه|اسمم چی بود|اسمم رو یادته|اسمم را یادته|اسمم یادته|اسمم رو یادت میاد|اسمم را یادت میاد|اسمم یادت میمونه|اسمم یادت می‌مونه|اسمم رو گفتم|اسمم را گفتم|اسمم رو گفتی|اسمم را گفتی|اسمم یادت رفته|اسمم یادت رفت|اسمم یادت بره|اسم من یادت رفته|یادت.{0,30}?اسمم|یادت.{0,30}?اسم من|یادت میمونه اسمم|یادت می‌مونه اسمم|من کی هستم|من کیستم|من کیستم|من کی بودم|من کیم|من کی ام|یادت.{0,30}?من کی)(?!\p{L})/iu,
      // Location disclosure («تهران زندگی می‌کنم», «اهل شیرازم», «تو
      // اصفهان زندگی می‌کنم»). The place capture is a single Persian
      // word or two, before the living/from marker.
      locationStatement:
        /(?:من )?(?:تو |توی |در )?([\u0600-\u06FF\u200c]{2,20}(?:\s[\u0600-\u06FF\u200c]{2,20})?)\s*(?:زندگی (?:میکنم|می‌کنم|می کنم)|ساکنم|ساکن هستم)|اهل\s+([\u0600-\u06FF\u200c]{2,20})(?:م| هستم| ام)(?!\p{L})/u,
      locationQuestion:
        /(?:کجا زندگی (?:میکنم|می‌کنم|می کنم)|من کجا زندگیم|شهرم (?:چیه|کجاست|چی بود)|اهل کجام|من اهل کجام|یادته کجا زندگی|میدونی کجا زندگی|می‌دونی کجا زندگی)/u,
      // Preference disclosure («دوست دارم قهوه», «از شلوغی بدم میاد»):
      // the liked/disliked object is captured after the like/dislike verb
      // (or after «بدم میاد از»/«متنفرم از»). The capture is bounded and
      // trimmed, so it stores a noun phrase, never a full sentence.
      preferenceStatement:
        /(?<!\p{L})(?:من )?(?:عاشق|بدم میاد از|بدم می‌آد از|متنفرم از|علاقه دارم به)\s+([\u0600-\u06FF\u200c\s0-9]{2,28}?)\s*(?:[.!؟]|$)|(?<!\p{L})(?:از)\s+([\u0600-\u06FF\u200c\s0-9]{2,28}?)\s+(?:بدم میاد|بدم می‌آد|متنفرم)/iu,
      // Preference recall («چی دوست دارم؟», «از چی بدم میاد؟»): answered
      // from the most recently stored preference, never invented.
      preferenceQuestion:
        /(?<!\p{L})(?:چی (?:دوست دارم|دوس دارم|بدم میاد|بدم می‌آد|متنفرم)|از چی (?:خوشم میاد|خوشم می‌آد|بدم میاد|متنفرم)|یادته چی (?:دوست دارم|دوس دارم|بدم میاد)|یادت هست چی دوست دارم|سلیقه‌ام چیه|سلیقه ام چیه)/u
    },
    // Life-facts memory (see responder-lifefacts.js): statements and
    // recalls for the kinds of facts people state about their lives, so a
    // later recall question answers from memory. Subject nouns stay in a
    // fixed list (family, pets, possessions) so a stray sentence never
    // stores noise. Capture layout matches the handler: profession/name
    // statements put the subject in group 1 and the value in group 2;
    // count puts the number (value) in group 1 and the noun (subject) in
    // group 2; relationship puts the status (value) in group 1. Recalls
    // capture only the subject in group 1 (relationship has none).
    lifeFacts: {
      statements: {
        profession:
          /(?<!\p{L})(خواهرم|برادرم|مادرم|پدرم|بابام|مامانم|همسرم|شوهرم|زنم|پسرم|دخترم|رفیقم|رئیسم|رییسم|دوست پسرم|دوست دخترم)\s+(?:(?:یک|یه)\s+)?([\u0600-\u06FF\u200c]{2,24}?)(?:ه\s*$|ه[.!؟]|(?:\s+(?:هست|هستم|است|کار میکنه|کار می‌کنه|کار می کند)))/u,
        name: /(?<!\p{L})اسم\s+(سگم|سگ ام|گربه ام|گربهام|خواهرم|برادرم|مادرم|پدرم|همسرم|شوهرم|زنم|پسرم|دخترم|رفیقم)\s+([\u0600-\u06FF\u200c]{2,20}?)(?=\s+(?:هست|هستش|است)|$)/u,
        count:
          /(?<!\p{L})(?:من\s+)?(یک|یه|دو|سه|چهار|پنج|شش|هفت|هشت|نه|ده|[۰-۹0-9]+)\s+(?:تا\s+)?(بچه|فرزند|خواهر|برادر|گربه|سگ|نوه|بچه خواهر|بچه برادر)\s+دارم/u,
        relationship:
          /(?<!\p{L})(?:من\s+)?(متاهلم|متاهل ام|متأهلم|مجردم|طلاق گرفته‌ام|طلاق گرفته ام|ازدواج کرده‌ام|ازدواج کرده ام|در رابطه‌ام|در رابطه ام|نامزد دارم)(?!\p{L})/u
      },
      recalls: {
        profession:
          /(?<!\p{L})(خواهرم|برادرم|مادرم|پدرم|بابام|مامانم|همسرم|شوهرم|زنم|پسرم|دخترم|رفیقم|رئیسم|رییسم|دوست پسرم|دوست دخترم)\s+(?:چیکار میکنه|چیکار می‌کنه|چه کاره است|چه کاره‌ست|شغلش چیه|کارش چیه)/u,
        name: /(?<!\p{L})اسم\s+(سگم|سگ ام|گربه ام|گربهام|خواهرم|برادرم|مادرم|پدرم|همسرم|شوهرم|زنم|پسرم|دخترم|رفیقم)\s+(?:چیه|چی بود|چیه؟)\s*(?:\?|؟|$)/u,
        count:
          /(?<!\p{L})چند(?:\s+تا)?\s+(بچه|فرزند|خواهر|برادر|گربه|سگ|نوه)\s+دارم/u,
        relationship:
          /(?<!\p{L})آیا\s+(?:من\s+)?(متاهلم|متاهل ام|متأهلم|مجردم|طلاق گرفته‌ام|ازدواج کرده‌ام|در رابطه‌ام|در رابطه ام)\s*\??/u
      }
    },
    lifeFactPools: R.lifeFactPools,
    userProfilePools: R.userProfilePools,
    // Deferred-topic promise memory (see responder-promise.js): the
    // user says «بعداً می‌گم» (or releases a pending promise with
    // «ولش کن»), and Darya circles back a few turns later instead of
    // letting the thread die. Both spaced and half-spaced verb forms
    // are matched because the normalizer inserts the ZWNJ.
    promiseLaterPattern:
      /(?:بعداً|بعدا|بعدن)[^.!؟]{0,40}(?:میگم|می‌گم|بهت میگم|بهت می‌گم|برات میگم|برات می‌گم|حرف میزنیم|حرف می‌زنیم|میگیم|می‌گیم|بگویم|میگویم|می‌گویم)|یه وقت دیگه|یک وقت دیگر|وقت دیگه|فعلاً نه|فعلا نه|الان نه|بذار بعداً|بذار بعدا|بگذار بعداً|بگذار بعدا/u,
    promiseForgetPattern:
      /(?:ولش کن|ولش کن دیگه|فراموش کن|فراموشش کن|بی‌خیال|بیخیال|بی خیال|بذار بگذریم|بگذار بگذریم|رهایش کن)/u,
    // Guided therapeutic exercises (see responder-exercises.js): request
    // detection, the step libraries, the stop phrasing, and the tappable
    // yes/no chips shown between steps. All session-only.
    exerciseRequestPattern: R.exerciseRequestPattern,
    exerciseStopPattern: R.exerciseStopPattern,
    exerciseLibrary: R.exerciseLibrary,
    exerciseYesNoChips: R.exerciseYesNoChips,
    // Session mood tracker (see responder-mood.js): request/summary
    // patterns, the 1..10 scale, reflection pools per band, and the
    // summary/release lines. All session-only.
    moodRequestPattern: R.moodRequestPattern,
    moodSummaryPattern: R.moodSummaryPattern,
    moodAskResponses: R.moodAskResponses,
    moodReflectionPools: R.moodReflectionPools,
    moodSummaryResponses: R.moodSummaryResponses,
    moodSingleSummaryResponses: R.moodSingleSummaryResponses,
    moodNoDataResponse: R.moodNoDataResponse,
    moodReleaseResponses: R.moodReleaseResponses,
    moodScaleChips: R.moodScaleChips,
    moodDirectionUp: R.moodDirectionUp,
    moodDirectionDown: R.moodDirectionDown,
    moodDirectionSame: R.moodDirectionSame,
    moodLogSize: R.moodLogSize,
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
      quickRepliesLabel: 'پاسخ‌های سریع',
      menuNewChat: 'گفت‌وگوی تازه',
      menuExportLabel: 'دانلود گفتگو',
      menuExportTitle: 'دانلود گفتگو',
      themeOceanLabel: 'پوسته اقیانوس',
      themeBeachLabel: 'پوسته ساحل',
      footerTagline: 'دریا یک همراه شنواست، نه جایگزین راهنمایی تخصصی.',
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
      jumpToLatestLabel: 'پرش به آخرین پیام',
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
