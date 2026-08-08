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
  } = global.DaryaEnData;
  const rules = global.DaryaEnRules;

  const en = {
    code: 'en',
    dir: 'ltr',
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
    // Neutral probe used for the first half of a split-turn minor
    // attraction disclosure, before the speaker's own age is known.
    minorAttractionProbe: R.minorAttractionProbe,
    // User asks for each list item on its own line ("write each on a
    // separate line", "one per line"). Matches the format-feedback
    // override, which re-emits the last knowledge list line by line.
    formatFeedbackPattern:
      /(?:each (?:one|item|movie|series) (?:on|in) (?:a |its own |separate )?lines?|one per line|separate lines?|line by line|write (?:each|them) (?:on|in|as) (?:a |separate )?lines?|put (?:each|them) on (?:a |their own |separate )?lines?|list (?:them|it) separately)/i,
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
    // Compatibility aliases for the earlier misspelled pool names.
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
    // English test-input signals beyond the engine's built-in
    // TEST_INPUT_PATTERNS (which already covers "test", "hello bot",
    // "ping" etc.). Catches explicit "I am just testing you" phrasing.
    testInputPattern:
      /(?:i am just testing|i'?m just testing|just testing you|testing the bot|are you testing me)/iu,
    dateTimeFollowups: R.dateTimeFollowups,
    daryaHarassmentResponses: R.daryaHarassmentResponses,
    sexualHarassmentResponses: R.sexualHarassmentResponses,
    emotionCalibration: R.emotionCalibration,
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
      menuNewChat: 'New chat',
      menuExportLabel: 'Download conversation',
      menuExportTitle: 'Download conversation',
      themeOceanLabel: 'Ocean theme',
      themeBeachLabel: 'Beach theme',
      disclaimer:
        'Darya is a listening companion, not a substitute for professional help. In a crisis, please contact a professional or a crisis line.',
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
      soundAutoplayBlockedMsg:
        'Ambient sound could not start automatically. Tap the sound icon to enable it.',
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
