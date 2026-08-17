/**
 * Darya - English language pack assembler.
 * Combines patterns, vocabulary, lookups, rules, and response pools into
 * one English pack object. Classic script version.
 */

(function (global) {
  'use strict';

  // Long lines in this file are intentional (embedded response pools,
  // regex patterns, and knowledge entries).
  /* eslint-disable max-len */

  // Load response pools from the data file.
  var R = global.DaryaEnResponses;

  const BOT_NAME = 'Darya';

  // Basic Latin plus the Latin-1/Extended-A accented range, which covers
  // the vast majority of everyday English (and common loanwords/names).
  const SCRIPT_RANGE = /[A-Za-z\u00C0-\u017F]/;

  /**
   * Normalizes raw English input: lowercase-insensitive matching is
   * handled by the rule patterns themselves (case-insensitive flag), so
   * normalization here is limited to trimming and whitespace collapsing.
   */
  /**
   * Normalizes raw English input: Unicode NFKC normalization folds
   * compatibility characters (full-width letters, certain ligatures) to
   * their standard form, smart/curly quotes are unified to plain ASCII
   * ones so contraction patterns like "i'm" still match text pasted from
   * word processors, and whitespace is trimmed and collapsed.
   */
  function normalize(text) {
    return String(text)
      .normalize('NFKC')
      .replace(/[\u2018\u2019\u02BC]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .trim()
      .replace(/\s+/g, ' ');
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
  } = global.DaryaEnData;
  const rules = global.DaryaEnRules;

  const en = {
    code: 'en',
    dir: 'ltr',
    botName: BOT_NAME,
    scriptRange: SCRIPT_RANGE,
    // A sentence stays English as long as the majority of its letters
    // are Latin: one borrowed Arabic-script word in an English sentence
    // is code-switching, not a language switch, and only a mostly
    // foreign-script message gets the polite redirect.
    minScriptRatio: 0.6,
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
    // "today/now/current/latest/right now/at the moment" + a volatile
    // noun, or the volatile noun with an explicit price/result framing.
    liveDataPattern:
      /\b(?:(?:price|worth|value|rate|cost) of .{0,24}(?:today|right now|now|currently|at the moment)|(?:today'?s?|current|latest|live|real.?time) (?:price|weather|news|headlines|score|scores|rate|exchange rate|temperature)|what(?:'?s| is) the (?:weather|news|temperature|score)(?: like)?(?: today| now| outside| tomorrow)?|weather (?:today|now|tomorrow|forecast|like today|like now)|(?:bitcoin|btc|ethereum|gold|dollar|euro|stock|oil) (?:price|rate|worth|value)(?: today| now| right now)?|price of (?:bitcoin|btc|ethereum|gold|dollar|euro|oil)|news (?:today|right now|update)|who (?:won|is winning) (?:the game|the match|today|tonight)|exchange rate)\b/i,
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
    // relative ("I love my daughter").
    minorAttractionSignals: {
      selfAge: /\b(?:i'?m|i am|im|my age is)\s+(?:a\s+)?(\d{2,3})\b/i,
      adultIdentity:
        /\b(?:i'?m an adult|i am an adult|i'?m a grown (?:man|woman|guy)|i am a grown (?:man|woman|guy)|as an adult)\b/i,
      attraction:
        /\b(?:attracted to|attraction to|feelings for|in love with|crush on|fancy|want to (?:date|be with|marry)|in a relationship with)\b/i,
      strongSexual:
        /\b(?:sexual(?:ly)?\s*(?:attracted|feelings|desire)|sexual desire|sexually interested)\b/i,
      minor:
        /\b(?:teen(?:ager)?s?|minor|under\s*18|child(?:ren)?|kid(?:s)?|(?:[1-9]|1[0-7])\s*-?\s*years?\s*old|(?:[1-9]|1[0-7])-year-old|(?:[1-9]|1[0-7])\s*yo)\b/i,
      familial:
        /\b(?:my (?:daughter|son|child|kid|niece|nephew)|daughter's|son's)\b/i
    },
    minorAttractionResponses: R['ruleMinorAttraction'],
    // Joking softener attached to ideation ("lol jk", "just kidding"):
    // routes the safety turn to the gentle check-in pool instead of the
    // full hotline reply (see responder-overrides.js).
    jokeSoftenerPattern:
      /\b(?:lol jk|jk|just kidding|just joking|kidding|joking|not really(?:\s*(?:though|tho))?|haha (?:kidding|joking)|only (?:kidding|joking))\b\s*[.!]?\s*$/i,
    safetySoftenedResponses: R.safetySoftenedResponses,
    // Neutral probe used for the first half of a split-turn minor
    // attraction disclosure, before the speaker's own age is known.
    minorAttractionProbe: R.minorAttractionProbe,
    // User asks for each list item on its own line ("write each on a
    // separate line", "one per line"). Matches the format-feedback
    // override, which re-emits the last knowledge list line by line.
    formatFeedbackPattern:
      /(?:each (?:one|item|movie|series) (?:on|in) (?:a |its own |separate )?lines?|one per line|separate lines?|line by line|write (?:each|them) (?:on|in|as) (?:a |separate )?lines?|put (?:each|them) on (?:a |their own |separate )?lines?|list (?:them|it) separately|on (?:a |its own |a separate |a new |their own )line\b|space between|line spacing|(?:add|put|leave|insert) (?:a |an )?blank line\b|blank line (?:between|before|after))/i,
    formatFeedbackResponses: R['ruleFormatFeedback'],
    // Near-peer young-adult crush detection: an 18-20 year old with
    // romantic feelings for a 16-17 year old gets warm practical guidance
    // (pace, respect, consent, local laws) instead of the adult-minor
    // protection reply, which is reserved for mature adults or larger
    // gaps. Reuses the attraction/familial patterns and the selfAge
    // capture, adding a target-age marker for 16-17.
    nearPeerLoveSignals: {
      selfAge: /\b(?:i'?m|i am|im|my age is)\s+(?:a\s+)?(\d{2,3})\b/i,
      attraction:
        /\b(?:attracted to|attraction to|feelings for|in love with|crush on|fancy|want to (?:date|be with|marry)|in a relationship with)\b/i,
      targetAge: /\b(?:1[6-7])\s*-?\s*(?:year-old|years?\s*old|yo)\b/i,
      familial:
        /\b(?:my (?:daughter|son|child|kid|niece|nephew)|daughter's|son's)\b/i
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
    exitConfirmCaring: R.exitConfirmCaring,
    greetings: R.greetings,
    greetingsPhase1: R.greetingsPhase1,
    greetingsPhase2: R.greetingsPhase2,
    greetingsOpen: R.greetingsOpen,
    greetingsInviting: R.greetingsInviting,
    greetingsReturning: R.greetingsReturning,
    idleOpeners: R.idleOpeners,
    // Compatibility aliases for the earlier misspelled pool names.
    greentingsOpen: R.greetingsOpen,
    greentingsInviting: R.greetingsInviting,
    greentingsReturning: R.greetingsReturning,
    farewells: R.farewells,
    farewellsCaring: R.farewellsCaring,
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
    ruleTellJoke: R.ruleTellJoke,
    ruleTellStory: R.ruleTellStory,
    ruleTellStoryHorror: R.ruleTellStoryHorror,
    ruleTellStoryComedy: R.ruleTellStoryComedy,
    ruleShoppingHelp: R.ruleShoppingHelp,
    // Recommendation follow-ups ("anything similar but darker?") continue
    // the same shelf warmly when the follow-up names no genre word (see
    // the sequential-refinement block).
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
    // English test-input signals beyond the engine's built-in
    // TEST_INPUT_PATTERNS (which already covers "test", "hello bot",
    // "ping" etc.). Catches explicit "I am just testing you" phrasing.
    testInputPattern:
      /(?:i am just testing|i'?m just testing|just testing you|testing the bot|are you testing me)/iu,
    dateTimeFollowups: R.dateTimeFollowups,
    daryaHarassmentResponses: R.daryaHarassmentResponses,
    sexualHarassmentResponses: R.sexualHarassmentResponses,
    ruleDirtyTalkRequest: R['ruleDirtyTalkRequest'],
    emotionCalibration: R.emotionCalibration,
    // Question recall (see responder-recall.js): "do you remember what
    // the last question I asked you was?" answers from conversation
    // memory by quoting the user's last question back, never an evasive
    // "I do not have an answer" line. questionRecallFoundResponses
    // carries the {question} placeholder; questionRecallNoneResponses is
    // the honest reply when no question has been asked yet.
    questionRecallPattern:
      /\b(?:do you (?:even )?remember (?:what|the last question)|what was (?:my|the) last question|what did i (?:ask|ask you)(?: last| before| earlier)?|last question i asked|remember (?:the question|what) i asked)\b/i,
    questionRecallFoundResponses: R.questionRecallFoundResponses,
    questionRecallNoneResponses: R.questionRecallNoneResponses,
    // Knowledge-expansion request (see responder-recall.js): the long
    // transcript turn asking Darya to build a richer dataset (good
    // questions, movies, games, books, anime, traditional medicine,
    // study help, general knowledge, fun facts). The strong signal
    // (dataset) is enough on its own; otherwise content words must
    // co-occur with a build/learn/expand framing so a plain movie or
    // fact request is never hijacked.
    knowledgeExpansionSignals: {
      strong: /\b(?:dataset|knowledge base|knowledgebase)\b/i,
      content:
        /\b(?:movies|films|games|books|anime|animation|traditional medicine|study help|general knowledge|fun facts|questions|facts)\b/i,
      framing:
        /\b(?:you should|you need|you must|have to|learn|improve|build|add|expand|grow|make yourself|understand|got it)\b/i
    },
    knowledgeExpansionResponses: R.knowledgeExpansionResponses,
    // Session user profile: patterns that detect age/name disclosures
    // ("I'm 24 years old", "my name is Sara") and recall questions
    // ("how old am I?", "what is my name?"), plus the reply pools.
    // Values live only on the engine instance and are never persisted
    // (see _handleUserProfileTurn). The age statement rejects common
    // non-age quantity phrases ("i am 2 hours late", "100 percent").
    userProfilePatterns: {
      ageStatement:
        /\b(?:(?:i'?m|i am|im|my age is)\s+(?:a\s+)?(\d{1,3})\s*(?:years?|yrs?|yo)?|(?:and\s+)?(\d{1,3})\s+years?\s+old)\b(?!\s*(?:hours?|minutes?|days?|weeks?|months?|times|o'clock|percent|dollars|miles|meters?))/i,
      ageQuestion:
        // "do you remember how old i am" (with the subject between the
        // recall cue and the age phrase) was missed, so the transcript
        // recall probe fell to the evasive unknown pool.
        /\b(?:how old am i|what is my age|what about my age|and my age|do you (?:remember|know) my age|do you remember how old i am|remember how old i am|how old did i say i was)\b/i,
      // At most two words (a first name, or first plus last name), so a
      // disclosure that continues into a sentence ("my name is Sara and
      // I am sad") never stores "Sara and I am" as the name. The plain
      // "I'm X" copular form ("I'm Artin") is also matched: it is a
      // natural English self-introduction. The guard list keeps common
      // non-name continuations (states, negations, hedges, intentions)
      // from being stored, and nameRequiresCapital additionally demands
      // a capital initial for the copular capture, because the pattern
      // is case-insensitive: without it, "i'm not sure how to start"
      // would store the word "not" as a name. The explicit forms
      // ("my name is x") accept any case. The "call me x" form requires
      // a capital initial too, so "call me tomorrow" and "call me sara"
      // are never stored as names. The capture takes up to two words
      // ("call me Mary Jane"), mirroring the explicit-form branch.
      nameStatement:
        /\b(?:my name(?: is|'?s)|i'?m called|i am called)\s+([A-Za-z][A-Za-z']*(?:\s+(?!and\b|or\b)[A-Za-z][A-Za-z']*)?)\b|\b(?:i'?m|i am)\s+(?!(?:a\s+)?(?:ok\b|fine\b|good\b|great\b|tired\b|sad\b|happy\b|angry\b|excited\b|busy\b|bored\b|hungry\b|scared\b|worried\b|confused\b|sorry\b|sure\b|ready\b|here\b|back\b|home\b|not\b|just\b|so\b|really\b|actually\b|kinda\b|sort of|kind of|gonna\b|going\b|trying\b|starting\b|beginning\b|hoping\b|wondering\b|feeling\b|thinking\b|looking\b|done\b|finished\b|almost\b|basically\b|honestly\b|serious\b|kidding\b|joking\b|doing\b|new\b|single\b|alone\b|lost\b|stuck\b|fine\b|better\b|well\b))([A-Z][a-z]+)\b|\b(?:please\s+)?(?<!don'?t\s+)call me\s+([A-Z][a-z]+(?:\s+(?!and\b|or\b)[A-Z][a-z]+)?)\b/i,
      nameRequiresCapital: true,
      // Group 3 (the "call me x" branch) must also clear the capital
      // check: the pattern is case-insensitive, so without it the
      // lowercase "tomorrow" in "call me tomorrow" would be stored.
      nameCapitalGroups: [3],
      // Non-name words that follow "I am" / "I'm" in everyday speech:
      // states, negations, hedges, intentions, genders, roles, and common
      // professions. The handler rejects any captured candidate on this
      // list (case-insensitively), so "I am a Doctor" and "I am a man"
      // never store a profession or gender as a name.
      nameStopwords: [
        'not',
        'just',
        'so',
        'really',
        'actually',
        'kind',
        'sort',
        'gonna',
        'going',
        'trying',
        'starting',
        'beginning',
        'hoping',
        'wondering',
        'feeling',
        'thinking',
        'looking',
        'doing',
        'fine',
        'good',
        'great',
        'ok',
        'okay',
        'tired',
        'sad',
        'happy',
        'angry',
        'excited',
        'busy',
        'bored',
        'hungry',
        'scared',
        'worried',
        'confused',
        'sorry',
        'sure',
        'ready',
        'here',
        'back',
        'home',
        'man',
        'woman',
        'guy',
        'girl',
        'boy',
        'human',
        'person',
        'adult',
        'kid',
        'father',
        'mother',
        'brother',
        'sister',
        'son',
        'daughter',
        'friend',
        'doctor',
        'teacher',
        'student',
        'engineer',
        'nurse',
        'lawyer',
        'artist',
        'writer',
        'programmer',
        'manager',
        'musician',
        'singer',
        'player',
        'new',
        'single',
        'alone',
        'lost',
        'stuck',
        // Question/identity words that must never be stored as names:
        // "who am i" and "what am i" are self-identity questions, not
        // disclosures.
        'who',
        'what',
        'where',
        'when',
        'why',
        'someone',
        'somebody',
        'nobody',
        'anyone',
        'anybody',
        'everyone',
        'no one'
      ],
      nameQuestion:
        /\b(?:what('?s| is) my name|do you (?:remember|know) my name|who am i|what did i say my name was)\b/i,
      // Location disclosure ("I live in Tehran", "I'm from Paris").
      // The capture requires a capital initial so "i live in fear"
      // never stores an emotion as a city.
      locationStatement:
        /\b(?:[Ii] live in|[Ii]'?m living in|[Ii] am living in|[Ii]'?m from|[Ii] am from|[Ii] moved to|[Mm]y city is)\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/,
      locationQuestion:
        /\b(?:where do i live|where am i from|what(?:'?s| is) my city|do you (?:remember|know) where i (?:live|am from))\b/i
    },
    userProfilePools: R.userProfilePools,
    // Deferred-topic promise memory (see responder-promise.js): the
    // user says "I'll tell you later" (or releases a pending promise
    // with "never mind"), and Darya circles back a few turns later
    // instead of letting the thread die.
    promiseLaterPattern:
      /(?:i'?ll (?:tell|talk|show|explain) you[^.!?]{0,60}(?:later|another time|some other time|when i (?:get|come) back|tomorrow|next time)|we'?ll (?:talk|do it|pick this up) later|talk about (?:it|this) later|some other time\b|later ok|later okay|not now\b|let'?s talk about (?:it|this) later)/iu,
    promiseForgetPattern:
      /(?<!(?:don'?t|dont|do not)\s)(?:never mind|forget (?:it|about it|that)|forget what i said|skip it|scratch that)/iu,
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
      appTitle: 'Darya · A Calm Conversation Companion',
      appDescription:
        'Darya, an English-language conversation companion for listening and support.',
      placeholderDefault: "Write whatever's on your mind…",
      placeholderEnded:
        'This conversation has ended. Choose "New chat" from the menu to start again.',
      ariaInputLabel: 'Your message',
      // Canonical labels: aria-label === title === visible text
      pickerFaTitle: 'New Persian conversation',
      pickerEnTitle: 'New English conversation',
      themeOceanTitle: 'Ocean theme',
      themeBeachTitle: 'Beach theme',
      sendButtonTitle: 'Send',
      menuTriggerTitle: 'Menu',
      newChatTitle: 'New chat',
      themeGroupLabel: 'Choose a theme',
      typingLabel: 'Darya is thinking',
      quickRepliesLabel: 'Quick replies',
      menuNewChat: 'New chat',
      menuExportLabel: 'Download conversation',
      menuExportTitle: 'Download conversation',
      themeOceanLabel: 'Ocean theme',
      themeBeachLabel: 'Beach theme',
      disclaimer:
        'Darya is a listening companion, not a substitute for professional help. In a crisis, call or text 988 (US/Canada) or 116 123 (Europe), free and 24/7.',
      foreignScriptHint:
        'Please write in English so I can understand and support you.',
      exportTitle: `Conversation with ${BOT_NAME}`,
      exportYouLabel: 'You',
      exportDivider: '-----------------------------',
      dateLocale: 'en-US',
      breatheTitle: 'Breathing exercise',
      breatheIn: 'Breathe in',
      breatheHold: 'Hold',
      breatheOut: 'Breathe out',
      breatheDismiss: 'Close',
      exitConfirmBarLabel: 'Do you want to end this conversation?',
      exitConfirmBarYes: 'Yes, end it',
      exitConfirmBarNo: 'No, continue',
      newChatConfirmTitle: 'Are you sure?',
      newChatConfirmDesc:
        'Starting a new conversation will permanently delete the current one. It cannot be recovered.',
      newChatConfirmYes: 'Yes, start new',
      newChatConfirmNo: 'Cancel',
      soundOnTitle: 'Ambient sound: on',
      soundOffTitle: 'Ambient sound: off',
      soundFallbackMsg:
        'Ambient sound files could not be loaded. Using a generated ambient instead.',
      engineErrorHint: 'A minor issue occurred. The conversation can continue.',
      notificationError: 'Error',
      notificationWarning: 'Warning',
      notificationInfo: 'Info',
      notificationDismiss: 'Dismiss notification'
    }
  };

  global.DaryaEn = en;
})(typeof window !== 'undefined' ? window : globalThis);
