/**
 * Darya - public API and classification methods.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  const {
    EXIT_SCAN_WINDOW,
    EXIT_SCAN_TRIGGER_LENGTH,
    SERIOUSNESS_TOPIC_FLOOR,
    SERIOUSNESS_WEIGHT,
    SERIOUSNESS_CAP,
    SERIOUSNESS_LIGHT_TOPIC,
    ENTITY_CONFIDENCE_THRESHOLD,
    ENTITY_CONFIDENCE_DECAY_RECENT_BASE,
    ENTITY_CONFIDENCE_DECAY_RECENT_RATE,
    ENTITY_CONFIDENCE_DECAY_STALE_BASE,
    ENTITY_CONFIDENCE_DECAY_STALE_RATE,
    TEST_INPUT_PATTERNS,
    normalizeForMatching
  } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    /**
     * Checks whether the (normalized) input signals the user wants to leave.
     * @param {string} rawText
     * @returns {boolean}
     */
    isExitCommand(rawText) {
      // Check each exit keyword against the normalized words array using
      // exact whole-token matching to prevent substring false positives
      // ("exitement" must not match "exit", and "برمیگردم" must not match
      // "برم"). Both single-word and multi-word keywords are matched as
      // token sequences, which works for Latin and Persian script alike:
      // the old \b-anchored regex approach only understood ASCII word
      // characters, so Persian phrases like "باید برم" never matched.
      // Capture the language pack before the plain-function callback below:
      // inside a `function (keyword) {}`, `this` is not bound to the engine,
      // so `this.lang` would be undefined.
      const lang = this.lang;
      const normalized = normalizeForMatching(rawText, lang).toLowerCase();
      const words = normalized.split(/\s+/u).filter(Boolean);
      // For long inputs, only the first and last few tokens matter for
      // exit detection (e.g. a closing "gotta go" after a long message).
      // The window must be at least as wide as the longest multi-word
      // keyword, otherwise keywords like "i should get going" (4 tokens)
      // could never fit inside it.
      const longestKeyword = Math.max(
        ...lang.exitKeywords.map(
          (k) =>
            normalizeForMatching(k, lang)
              .toLowerCase()
              .split(/\s+/u)
              .filter(Boolean).length
        ),
        EXIT_SCAN_WINDOW
      );
      const windows =
        words.length > EXIT_SCAN_TRIGGER_LENGTH
          ? [words.slice(0, longestKeyword), words.slice(-longestKeyword)]
          : [words];
      return lang.exitKeywords.some(function (keyword) {
        // Normalize the keyword through the exact same pipeline as the
        // user input (including half-space handling), so both sides are
        // tokenized identically. The Persian half-space normalizer turns a
        // ZWNJ (U+200C) into a regular space, so "می‌بینمت" becomes the two
        // tokens ["می", "بینمت"]. Only when the keyword goes through the
        // same normalization can its tokens equal the input tokens.
        const kwWords = normalizeForMatching(keyword, lang)
          .toLowerCase()
          .split(/\s+/u)
          .filter(Boolean);
        if (kwWords.length === 1) {
          // Single-word keyword: exact token match against the full word
          // list, so "exitement" never matches the keyword "exit".
          return words.includes(kwWords[0]);
        }
        // Multi-word keyword: check that the keyword tokens appear as a
        // contiguous sequence inside one of the search windows. Token
        // matching (not a \b regex) works for both Latin and Persian
        // script, because \b only recognizes ASCII word characters.
        return windows.some(function (window) {
          for (let i = 0; i + kwWords.length <= window.length; i += 1) {
            let match = true;
            for (let j = 0; j < kwWords.length; j += 1) {
              if (window[i + j] !== kwWords[j]) {
                match = false;
                break;
              }
            }
            if (match) {
              return true;
            }
          }
          return false;
        });
      });
    },

    /**
     * Returns a varied opening greeting.
     * Uses phase-aware greeting pools.
     * @returns {string}
     */
    greeting() {
      const text = this._phaseGreeting();
      this.memory.rememberBotMessage(text);
      return text;
    },

    /**
     * Returns a varied farewell.
     * @returns {string}
     */
    farewell() {
      const text = this._pickVaried(this.lang.farewells);
      this.memory.rememberBotMessage(text);
      return text;
    },

    /**
     * Returns a neutral confirmation message asking if the user really
     * wants to end the conversation.
     * @returns {string}
     */
    exitConfirmation() {
      const text = this._pickVaried(this.lang.exitConfirmMessages);
      this.memory.rememberBotMessage(text);
      return text;
    },

    detectEntityCorrection(normalizedText) {
      const match =
        this.lang.code === 'fa'
          ? normalizedText.match(
              /(?:منظورم|منظورم اینه)\s+(.+?)\s+(?:بود،|بود|نه)\s+(.+?)(?:[.!؟]|$)/iu
            )
          : normalizedText.match(
              /\bI meant\s+(.+?)\s+(?:not|rather than)\s+(.+?)(?:[.!?]|$)/iu
            );
      if (!match) {
        return null;
      }
      return {
        newSurface: match[1].trim().replace(/^[,،\s]+|[,،\s]+$/gu, ''),
        oldSurface: match[2].trim().replace(/^[,،\s]+|[,،\s]+$/gu, '')
      };
    },

    // ======================================================================
    // Response strategy selection
    //
    // Determines the conversational strategy for the current turn based on
    // the matched rule, topic blend, reference context, and signal detections.
    // The strategy influences which response pool is used and how the reply
    // is framed. Strategies include: safety, professional-boundary, recap,
    // topic-blend, context-reference, topic-question, topic-reflection,
    // greeting, question-acknowledgement, light-warmth, and contextual-fallback.
    // ======================================================================

    selectResponseStrategy({ matchedRule, blendKey, matchingText }) {
      if (matchedRule?.topic === 'safety') {
        return 'safety';
      }
      if (matchedRule?.topic === 'professional_boundary') {
        return 'professional-boundary';
      }
      if (matchedRule?.topic === 'recap') {
        return 'recap';
      }
      if (blendKey) {
        return 'topic-blend';
      }
      if (!matchedRule && this.currentReferenceContext) {
        return 'context-reference';
      }
      if (matchedRule && this._canAskTopicQuestion(matchedRule.topic)) {
        return 'topic-question';
      }
      if (matchedRule) {
        return matchedRule.topic === 'greeting'
          ? 'greeting'
          : 'topic-reflection';
      }
      if (matchingText && this.lang.questionPattern.test(matchingText)) {
        return 'question-acknowledgement';
      }
      if (this.canHumorFire()) {
        return 'light-warmth';
      }
      return 'contextual-fallback';
    },

    describeSelf() {
      return {
        name: this.lang.botName,
        approach: this.lang.selfAwareness.approach,
        boundaries: this.lang.selfAwareness.boundaries,
        memory: this.lang.selfAwareness.memory
      };
    },

    // ======================================================================
    // Dialogue act classification
    //
    // The classify* methods convert the raw user input and matched rules into
    // structured metadata about what the user is doing (dialogue act) and what
    // they want (intent). This metadata drives strategy selection, question
    // budget enforcement, and conversational phase tracking.
    //
    // Dialogue acts include: greeting, question, statement, emotional_statement,
    // acknowledgement, correction, gratitude, affirmation, negation, safety,
    // test_input.
    // ======================================================================

    classifyDialogueAct(text, matchedRule = null, rawText = '') {
      if (
        TEST_INPUT_PATTERNS.test(text.trim()) ||
        (this.lang.testInputPattern && this.lang.testInputPattern.test(text))
      ) {
        return 'test_input';
      }
      if (this._lastTurnCorrection) {
        return 'correction';
      }
      if (matchedRule?.topic === 'greeting') {
        return 'greeting';
      }
      if (matchedRule?.topic === 'gratitude') {
        return 'gratitude';
      }
      if (matchedRule?.topic === 'affirmation') {
        return 'affirmation';
      }
      if (matchedRule?.topic === 'negation') {
        return 'negation';
      }
      if (matchedRule?.topic === 'safety') {
        return 'safety';
      }
      if (this._isAcknowledgement(text)) {
        return 'acknowledgement';
      }
      if (this._isEmotionalStatement(text) && !matchedRule) {
        return 'emotional_statement';
      }
      if (
        this.lang.questionPattern?.test(text) ||
        /[?؟]/u.test(rawText || text)
      ) {
        return 'question';
      }
      return 'statement';
    },

    classifyIntent(dialogueAct, matchedRule, topics) {
      if (dialogueAct === 'greeting') {
        return 'greeting';
      }
      if (dialogueAct === 'safety') {
        return 'safety_support';
      }
      if (matchedRule?.topic === 'professional_boundary') {
        return 'professional_boundary';
      }
      if (matchedRule?.topic === 'recap') {
        return 'recap_request';
      }
      if (dialogueAct === 'gratitude') {
        return 'gratitude';
      }
      if (dialogueAct === 'acknowledgement') {
        return 'acknowledgement';
      }
      if (dialogueAct === 'correction') {
        return 'correction';
      }
      if (dialogueAct === 'test_input') {
        return 'test_input';
      }
      if (dialogueAct === 'emotional_statement') {
        return 'emotional_expression';
      }
      if (dialogueAct === 'question') {
        return 'information_or_reflection';
      }
      if (topics.length) {
        return 'topic_statement';
      }
      return 'open_statement';
    },

    questionNeedScore(dialogueAct, topics) {
      if (
        dialogueAct === 'question' ||
        dialogueAct === 'gratitude' ||
        dialogueAct === 'greeting'
      ) {
        return 0;
      }
      if (!topics.length) {
        return SERIOUSNESS_LIGHT_TOPIC;
      }
      const seriousness = Math.max(
        ...topics.map(
          (topic) =>
            this.lang.topicSeriousness?.[topic] ?? SERIOUSNESS_TOPIC_FLOOR
        )
      );
      return Math.min(
        SERIOUSNESS_CAP,
        SERIOUSNESS_TOPIC_FLOOR + seriousness * SERIOUSNESS_WEIGHT
      );
    },

    // ======================================================================
    // Reference resolution
    //
    // When the user says "it happened again" or "I need to find a better
    // way to engage with that", Darya must determine what "it" and "that"
    // refer to. Reference resolution checks the current subject (topic +
    // entity references) from recent turns and returns a resolved context
    // if the subject is recent enough and the reference indicators match.
    //
    // This is a heuristic approach: it works reliably for the most common
    // conversational patterns (referring back to the immediately preceding
    // topic) and gracefully degrades (returns null) when the reference is
    // ambiguous or the subject has aged out of the short-term memory window.
    // ======================================================================

    resolveReferenceContext(normalizedText) {
      const referencePattern =
        this.lang.code === 'fa'
          ? /(?<!\p{L})(?:این|آن|اون|همین|همون|دوباره|همان مشکل|همون مشکل|همان موضوع|همون موضوع|چیزی که گفتم)(?!\p{L})/u
          : /\b(?:it|that|this|again|same problem|the meeting|the thing i mentioned before)\b/iu;
      if (!referencePattern.test(normalizedText)) {
        return null;
      }
      const subject = this.memory.currentSubject;
      if (!subject?.topic || this.memory.turnCount - subject.since > 5) {
        return null;
      }
      const age = this.memory.turnCount - subject.since;
      const confidence = subject.entityRefs.length
        ? ENTITY_CONFIDENCE_DECAY_RECENT_BASE -
          age * ENTITY_CONFIDENCE_DECAY_RECENT_RATE
        : ENTITY_CONFIDENCE_DECAY_STALE_BASE -
          age * ENTITY_CONFIDENCE_DECAY_STALE_RATE;
      if (confidence < ENTITY_CONFIDENCE_THRESHOLD) {
        return null;
      }
      return {
        topic: subject.topic,
        entityRefs: [...subject.entityRefs],
        confidence
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
