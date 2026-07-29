/**
 * Darya - Rogerian conversation engine responder.
 *
 * The DaryaResponseEngine class: combines normalization, rule matching,
 * topic tracking, sentiment-aware check-ins, quoted-memory callbacks,
 * repetition-aware response selection, and graceful fallbacks into a
 * single `respond` entry point, plus `greeting`/`farewell` helpers for
 * the UI layer.
 *
 * This module depends on DaryaEngineUtils (loaded via utils.js) for
 * constants, text helpers, and the ConversationMemory class. It must be
 * loaded AFTER utils.js.
 */
(function (global) {
  'use strict';

  const U = global.DaryaEngineUtils;

  const {
    PRONOUN_REFLECTION_PROBABILITY,
    PRONOUN_REFLECTION_MIN_WORDS,
    PRONOUN_REFLECTION_MAX_WORDS,
    EXCERPT_MAX_LENGTH,
    ENTITY_DECAY_PER_TURN,
    ENTITY_CALLBACK_PROBABILITY,
    CONSECUTIVE_QUESTION_LIMIT,
    QUESTION_BUDGET_WINDOW,
    QUESTION_BUDGET_LIMIT,
    REPEATED_GREETING_THRESHOLD,
    WORD_REPETITION_THRESHOLD,
    SPAM_MIN_LENGTH,
    SPAM_MAX_UNIQUE_RATIO,
    ACKNOWLEDGEMENT_THRESHOLD,
    TEST_INPUT_PATTERNS,
    SUBSTANTIVE_ANSWER_MIN_WORDS,
    TEASING_MOCK_THRESHOLD,
    WELLBEING_CHECK_TURNS,
    BOREDOM_CHECK_INTERVAL,
    BOREDOM_MIN_TURNS,
    MIXED_SCRIPT_FOREIGN_MIN,
    MIXED_SCRIPT_FOREIGN_RATIO,
    MAX_CONSECUTIVE_SAME_RULE,
    QUOTED_CALLBACK_PROBABILITY,
    normalizeForMatching,
    isValidScript,
    scoreSentiment,
    truncateExcerpt,
    reflectPronouns,
    ConversationMemory,
  } = U;

  // ========================================================================
  // Response engine
  // ========================================================================

  /**
   * Core Rogerian response engine for the Darya companion. Combines
   * normalization, rule matching, topic tracking, sentiment-aware
   * check-ins, quoted-memory callbacks, repetition-aware response
   * selection, and graceful fallbacks into a single `respond` entry
   * point, plus `greeting`/`farewell` helpers for the UI layer.
   *
   * The engine follows a deterministic pipeline per turn:
   *   1. Validate input (empty, wrong script, mixed language)
   *   2. Normalize and match rules (sorted by priority descending)
   *   3. Classify dialogue act and intent
   *   4. Detect signal patterns (repeated greetings, spam, frustration, etc.)
   *   5. Select response strategy and pick a varied response
   *   6. Apply smart overrides (math, word repetition, distress nudge)
   *   7. Calibrate emotional tone and add human-touch coloring
   *   8. Record the turn in conversation memory and return the reply
   *
   * All language-specific content (rules, pools, patterns) comes from
   * the language pack passed at construction, keeping the engine itself
   * entirely language-agnostic.
   */
  class DaryaResponseEngine {
    /** @param {object} lang - A language pack, e.g. window.DaryaLang.fa */
    constructor(lang) {
      this.lang = lang;
      this.rules = [...lang.rules].sort((a, b) => b.priority - a.priority);
      this.memory = new ConversationMemory();
      this._fallbackToggle = false;
      this.entityCallbackThreshold = 0.6;
      this.entityCallbackProbability = ENTITY_CALLBACK_PROBABILITY;
      this.currentTurnTopics = [];
      this.currentTurnSeriousness = 0;
      this.lastTurnNeedsCare = false;
      this.currentTurnDialogueAct = 'statement';
      this.currentTurnIntent = 'unknown';
      this.currentTurnQuestionNeed = 0;
      this._lastTurnCorrection = false;
      this.conversationState = {
        phase: 'new',
        dialogueAct: null,
        intent: null,
        topics: [],
        seriousness: 0,
        strategy: null,
        referenceConfidence: 0,
      };
      this.conversationPhase = 'new';
    }

    // ======================================================================
    // Public API - called from app.js and the test suite
    //
    // These methods form the stable interface between the engine and the
    // UI layer. They handle the full conversation lifecycle: greeting,
    // responding to user input, detecting exit intent, confirming exit,
    // and producing farewell messages.
    // ======================================================================

    /**
     * Produces Darya's reply to a single user utterance.
     *
     * The reply pipeline (in order):
     * 1. Early exits: blank input, wrong script, mixed language
     * 2. Core routing: repeated greetings, spam, acknowledgements, corrections,
     *    topic blends, matched rules, ambiguous input, generic fallback
     * 3. Smart overrides: factual math questions, word repetition detection,
     *    frustration/insult detection, teasing/mocking, wellbeing checks
     * 4. Emotional calibration: tone prefix based on detected primary emotion
     * 5. Conversation management: boredom check, distress nudge, human touch
     * 6. Final recording: strategy tracking, entity memory, phase advancement
     *
     * @param {string} rawText - The user's raw input, before normalization
     * @returns {string} Darya's reply text, ready for display
     */
    respond(rawText) {
      if (!String(rawText).trim()) {
        return this.lang.emptyInputReply;
      }
      if (!isValidScript(rawText, this.lang)) {
        return this.lang.foreignLanguageRedirect();
      }

      const normalized = this.lang.normalize(rawText);
      const matchingText = normalizeForMatching(rawText, this.lang);
      this._currentNormalizedInput = matchingText;
      const sentimentScore = scoreSentiment(normalized, this.lang.sentimentLexicon);
      this.memory.rememberUtterance(normalized);
      this.memory.rememberSentiment(sentimentScore);
      this.memory.turnCount += 1;
      this.memory.decayNamedEntities();

      const entities = global.DaryaEntityExtractor
        ? global.DaryaEntityExtractor.extract(normalized, this.lang, {
          emotionalWeight: sentimentScore !== 0,
        })
        : [];
      this._turnEntities = entities;
      const correction = this.detectEntityCorrection(matchingText);
      this._lastTurnCorrection = !!correction;
      if (correction) {
        const oldEntity = [...this.memory.namedEntities.values()]
          .find((entity) => correction.oldSurface.toLocaleLowerCase().includes(entity.surface.toLocaleLowerCase()));
        if (oldEntity) {
          this.memory.correctEntity(correction.oldSurface, {
            type: oldEntity.type,
            surface: correction.newSurface,
            confidence: 0.96,
          }, { topics: this.currentTurnTopics, seriousness: this.currentTurnSeriousness });
        }
      }

      const isRepeatedGreeting = this._isRepeatedGreeting(matchingText);
      const isSpamNoise = this._isSpamOrNoise(matchingText);
      const isAmbiguous = !isRepeatedGreeting && !isSpamNoise && this._isAmbiguousInput(matchingText);

      const matches = this._matchRules(matchingText);
      const matchedRule = matches[0]?.rule || null;
      const captured = matches[0]?.captured || '';
      const matchedTopics = matches.map((match) => match.rule.topic);
      this.currentTurnTopics = [...new Set(matchedTopics)];
      this.currentReferenceContext = this.resolveReferenceContext(matchingText);
      if (this.currentTurnTopics.length === 0 && this.currentReferenceContext) {
        this.currentTurnTopics = [this.currentReferenceContext.topic];
      }
      this.currentTurnDialogueAct = this.classifyDialogueAct(matchingText, matchedRule);
      if (this.currentTurnTopics.length === 0 && this.currentTurnDialogueAct === 'question'
        && matchingText.split(/\s+/u).length <= 6
        && this.memory.currentSubject.topic
        && this.memory.turnCount - this.memory.currentSubject.since <= 3) {
        this.currentTurnTopics = [this.memory.currentSubject.topic];
        this.currentReferenceContext = {
          topic: this.memory.currentSubject.topic,
          entityRefs: [...this.memory.currentSubject.entityRefs],
          confidence: 0.64,
        };
      }
      this.currentTurnIntent = this.classifyIntent(this.currentTurnDialogueAct, matchedRule, this.currentTurnTopics);
      this.currentTurnQuestionNeed = this.questionNeedScore(this.currentTurnDialogueAct, this.currentTurnTopics);
      this.currentTurnSeriousness = this._seriousnessForTurn(this.currentTurnTopics);
      this.lastTurnNeedsCare = this.currentTurnSeriousness >= 0.5
        || /\b(?:help|advice|problem|crisis|difficult|hard|worried|angry|mad|frustrated|annoyed|pissed)\b/iu.test(normalized)
        || /(?<!\p{L})(?:کمک|مشورت|مشکل|سخت|نگران|بحران|عصبانی|خشمگین|کفری|عصبی|ناراحت|ناراحتم)(?!\p{L})/u.test(normalized);
      this.memory.rememberSeriousness(this.currentTurnSeriousness);
      this.memory.rememberTopics(this.currentTurnTopics);
      this.memory.updateSubject(this.currentTurnTopics, entities);

      const blendKey = this._blendKey(this.currentTurnTopics);
      const strategy = this.selectResponseStrategy({ matchedRule, blendKey, matchingText });
      this.lastResponseStrategy = strategy;
      this.memory.rememberStrategy(strategy);
      this.conversationState = {
        phase: this._phaseForTurn(strategy, this.currentTurnSeriousness),
        dialogueAct: this.currentTurnDialogueAct,
        intent: this.currentTurnIntent,
        topics: [...this.currentTurnTopics],
        seriousness: this.currentTurnSeriousness,
        strategy,
        referenceConfidence: this.currentReferenceContext?.confidence || 0,
      };
      this.memory.rememberTurnFrame({ ...this.conversationState, turn: this.memory.turnCount });

      const _substantiveCache = this._isSubstantiveAnswer(matchingText);
      const isSubstantive = !isRepeatedGreeting && !isSpamNoise
        && this.currentTurnDialogueAct !== 'acknowledgement'
        && this.currentTurnDialogueAct !== 'test_input'
        && _substantiveCache;
      if (isSubstantive) {
        this.memory.markLatestQuestionAnswered(normalized, this.memory.turnCount);
      }

      let reply;

      const mixedLangReply = this._handleMixedLanguage(matchingText);
      if (mixedLangReply) {
        reply = mixedLangReply;
      } else if (isRepeatedGreeting && this.lang.repeatedGreetingResponses) {
        reply = this._pickVaried(this.lang.repeatedGreetingResponses);
      } else if (isSpamNoise && this.lang.spamNoiseResponses) {
        reply = this._pickVaried(this.lang.spamNoiseResponses);
      } else if (this.currentTurnDialogueAct === 'test_input' && this.lang.testInputResponses) {
        reply = this._pickVaried(this.lang.testInputResponses);
      } else if (this.currentTurnDialogueAct === 'acknowledgement' && this.lang.acknowledgementResponses) {
        if (!_substantiveCache && this.memory.pendingQuestions.some((q) => !q.answered)) {
          this.memory.consecutiveAcknowledgements += 1;
          if (this.memory.consecutiveAcknowledgements >= 2) {
            reply = this._pickVaried(this.lang.acknowledgementResponses);
            this.memory.consecutiveAcknowledgements = 0;
          } else {
            reply = this._fallbackResponse(null, normalized);
          }
        } else {
          reply = this._fallbackResponse(null, normalized);
        }
      } else if (this.currentTurnDialogueAct === 'correction' && this.lang.correctionResponses) {
        reply = this._pickVaried(this.lang.correctionResponses);
      } else if (blendKey && this.lang.blendResponses?.[blendKey]) {
        reply = this._pickVaried(this.lang.blendResponses[blendKey]);
      } else if (matchedRule) {
        reply = this._respondWithRule(matchedRule, captured);
      } else if (isAmbiguous && this.lang.ambiguousInputResponses) {
        reply = this._pickVaried(this.lang.ambiguousInputResponses);
      } else {
        reply = this._fallbackResponse(null, normalized);
      }

      // --- Smart overrides that run after normal routing ---------------
      const _safetyTurn = matchedRule && matchedRule.topic === 'safety';
      let _overrideFired = false;

      if (!_safetyTurn && !isRepeatedGreeting && !isSpamNoise && matchedRule?.topic !== 'knowledge') {
        const factualReply = this._handleFactualQuestion(normalized);
        if (factualReply) {
          reply = factualReply;
          _overrideFired = true;
        }
      }

      if (!_safetyTurn && !isRepeatedGreeting && !isSpamNoise && this.lang.wordRepetitionResponses) {
        const repetition = this._detectWordRepetition(matchingText);
        if (repetition) {
          const pool = this.lang.wordRepetitionResponses;
          const template = this._pickVaried(pool);
          reply = template.replace(/\{word\}/gu, repetition.word)
            .replace(/\{count\}/gu, String(repetition.count));
          _overrideFired = true;
        }
      }

      if (!_safetyTurn && this.lang.frustrationResponses) {
        const frustrationType = this._detectFrustration(rawText);
        const hasInsult = this.lang.insultPattern
          ? this.lang.insultPattern.test(matchingText)
          : false;
        if (frustrationType || hasInsult) {
          reply = this._pickVaried(this.lang.frustrationResponses);
          _overrideFired = true;
        }
      }

      if (!_safetyTurn && !isRepeatedGreeting && !isSpamNoise
        && this.memory.turnCount >= 3 && this.lang.teasingMockingResponses) {
        if (this._detectTeasingOrMocking(rawText, matchingText)) {
          reply = this._pickVaried(this.lang.teasingMockingResponses);
          _overrideFired = true;
        }
      }

      if (!_safetyTurn && !isRepeatedGreeting && !isSpamNoise
        && this.memory.turnCount >= WELLBEING_CHECK_TURNS
        && this.lang.wellBeingResponses) {
        if (this._detectWellBeingCheck(matchingText)) {
          reply = this._pickVaried(this.lang.wellBeingResponses);
          _overrideFired = true;
        }
      }

      const primaryEmotion = this._detectPrimaryEmotion(matchingText);
      if (!_overrideFired && primaryEmotion !== 'neutral'
        && this.currentTurnDialogueAct !== 'safety'
        && !blendKey && !isRepeatedGreeting && !isSpamNoise) {
        reply = this._calibrateEmotionalTone(reply, primaryEmotion);
      }

      if (!_safetyTurn && !isRepeatedGreeting && !isSpamNoise
        && this.memory.turnCount >= BOREDOM_MIN_TURNS
        && this.memory.turnCount % BOREDOM_CHECK_INTERVAL === 0
        && this.lang.boredomResponses
        && this.currentTurnSeriousness < 0.4) {
        const recentUtterances = this.memory.recentUtterances.slice(-3);
        const allBrief = recentUtterances.every((u) => u.split(/\s+/u).filter(Boolean).length <= 3);
        if (allBrief && Math.random() < 0.4) {
          reply = this._pickVaried(this.lang.boredomResponses);
          _overrideFired = true;
        }
      }

      if (this.currentTurnDialogueAct !== 'acknowledgement') {
        this.memory.consecutiveAcknowledgements = 0;
      }

      this.memory.rememberEntities(entities, this.memory.turnCount, { topics: this.currentTurnTopics, seriousness: this.currentTurnSeriousness });

      const isSafetyTurn = matchedRule && matchedRule.topic === 'safety';
      if (!isSafetyTurn && this.memory.isInDistressStreak() && !this.memory.distressNudgeGiven) {
        this.memory.distressNudgeGiven = true;
        reply = this._pickVaried(this.lang.distressNudges);
        _overrideFired = true;
      } else if (!this.memory.isInDistressStreak()) {
        this.memory.distressNudgeGiven = false;
      }

      if (!isSafetyTurn && _overrideFired) {
        // Smart override already set a precise reply. Skip human-tone coloring.
      } else if (!isSafetyTurn) {
        reply = this._maybeHumanTone(reply, normalized);
      }
      if (!isSafetyTurn && !_overrideFired && this._shouldAddHumanTouch()) {
        const touchLine = this._humanTouchLine();
        if (touchLine) {
          reply = `${reply} ${touchLine}`.trim();
        }
      }

      this._advanceConversationPhase(normalized);

      this.memory.rememberBotMessage(reply);
      return reply;
    }

    /**
     * Checks whether the (normalized) input signals the user wants to leave.
     * @param {string} rawText
     * @returns {boolean}
     */
    isExitCommand(rawText) {
      const normalized = normalizeForMatching(rawText, this.lang).toLowerCase();
      const words = normalized.split(/\s+/u).filter(Boolean);
      if (words.length <= 5) {
        return this.lang.exitKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
      }
      const prefix = words.slice(0, 3).join(' ');
      const suffix = words.slice(-3).join(' ');
      return this.lang.exitKeywords.some((keyword) =>
        prefix.includes(keyword.toLowerCase()) || suffix.includes(keyword.toLowerCase())
      );
    }

    /**
     * Returns a varied opening greeting.
     * Uses phase-aware greeting pools.
     * @returns {string}
     */
    greeting() {
      const text = this._phaseGreeting();
      this.memory.rememberBotMessage(text);
      return text;
    }

    /**
     * Returns a varied farewell.
     * @returns {string}
     */
    farewell() {
      const text = this._pickVaried(this.lang.farewells);
      this.memory.rememberBotMessage(text);
      return text;
    }

    /**
     * Returns a neutral confirmation message asking if the user really
     * wants to end the conversation.
     * @returns {string}
     */
    exitConfirmation() {
      const text = this._pickVaried(this.lang.exitConfirmMessages);
      this.memory.rememberBotMessage(text);
      return text;
    }

    detectEntityCorrection(normalizedText) {
      const match = this.lang.code === 'fa'
        ? normalizedText.match(/(?:منظورم|منظورم اینه)\s+(.+?)\s+(?:بود،|بود|نه)\s+(.+?)(?:[.!؟]|$)/iu)
        : normalizedText.match(/\bI meant\s+(.+?)\s+(?:not|rather than)\s+(.+?)(?:[.!?]|$)/iu);
      if (!match) return null;
      return {
        newSurface: match[1].trim().replace(/^[,،\s]+|[,،\s]+$/gu, ''),
        oldSurface: match[2].trim().replace(/^[,،\s]+|[,،\s]+$/gu, ''),
      };
    }

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
      if (matchedRule?.topic === 'safety') return 'safety';
      if (matchedRule?.topic === 'professional_boundary') return 'professional-boundary';
      if (matchedRule?.topic === 'recap') return 'recap';
      if (blendKey) return 'topic-blend';
      if (!matchedRule && this.currentReferenceContext) return 'context-reference';
      if (matchedRule && this._canAskTopicQuestion(matchedRule.topic)) return 'topic-question';
      if (matchedRule) return matchedRule.topic === 'greeting' ? 'greeting' : 'topic-reflection';
      if (matchingText && this.lang.questionPattern.test(matchingText)) return 'question-acknowledgement';
      if (this.canHumorFire()) return 'light-warmth';
      return 'contextual-fallback';
    }

    describeSelf() {
      return {
        name: this.lang.botName,
        approach: this.lang.selfAwareness.approach,
        boundaries: this.lang.selfAwareness.boundaries,
        memory: this.lang.selfAwareness.memory,
      };
    }

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

    classifyDialogueAct(text, matchedRule = null) {
      if (TEST_INPUT_PATTERNS.test(text.trim())) return 'test_input';
      if (this._lastTurnCorrection) return 'correction';
      if (matchedRule?.topic === 'greeting') return 'greeting';
      if (matchedRule?.topic === 'gratitude') return 'gratitude';
      if (matchedRule?.topic === 'affirmation') return 'affirmation';
      if (matchedRule?.topic === 'negation') return 'negation';
      if (matchedRule?.topic === 'safety') return 'safety';
      if (this._isAcknowledgement(text)) return 'acknowledgement';
      if (this._isEmotionalStatement(text) && !matchedRule) return 'emotional_statement';
      if (this.lang.questionPattern?.test(text) || /[?؟]/u.test(text)) return 'question';
      return 'statement';
    }

    classifyIntent(dialogueAct, matchedRule, topics) {
      if (dialogueAct === 'greeting') return 'greeting';
      if (dialogueAct === 'safety') return 'safety_support';
      if (matchedRule?.topic === 'professional_boundary') return 'professional_boundary';
      if (matchedRule?.topic === 'recap') return 'recap_request';
      if (dialogueAct === 'gratitude') return 'gratitude';
      if (dialogueAct === 'acknowledgement') return 'acknowledgement';
      if (dialogueAct === 'correction') return 'correction';
      if (dialogueAct === 'test_input') return 'test_input';
      if (dialogueAct === 'emotional_statement') return 'emotional_expression';
      if (dialogueAct === 'question') return 'information_or_reflection';
      if (topics.length) return 'topic_statement';
      return 'open_statement';
    }

    questionNeedScore(dialogueAct, topics) {
      if (dialogueAct === 'question' || dialogueAct === 'gratitude' || dialogueAct === 'greeting') return 0;
      if (!topics.length) return 0.25;
      const seriousness = Math.max(...topics.map((topic) => this.lang.topicSeriousness?.[topic] ?? 0.45));
      return Math.min(0.9, 0.45 + seriousness * 0.35);
    }

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
      const referencePattern = this.lang.code === 'fa'
        ? /(?<!\p{L})(?:این|آن|اون|همین|همون|دوباره|همان مشکل|همون مشکل|همان موضوع|همون موضوع|چیزی که گفتم)(?!\p{L})/u
        : /\b(?:it|that|this|again|same problem|the meeting|the thing i mentioned before)\b/iu;
      if (!referencePattern.test(normalizedText)) return null;
      const subject = this.memory.currentSubject;
      if (!subject?.topic || this.memory.turnCount - subject.since > 5) return null;
      const age = this.memory.turnCount - subject.since;
      const confidence = subject.entityRefs.length ? 0.94 - age * 0.06 : 0.76 - age * 0.04;
      if (confidence < 0.6) return null;
      return { topic: subject.topic, entityRefs: [...subject.entityRefs], confidence };
    }

    // ======================================================================
    // Signal detection methods
    //
    // These private methods analyze the user's input for specific patterns
    // that require special handling: repeated greetings (user keeps saying
    // "hello" without substance), spam/keyboard-mash input, ambiguous short
    // inputs, word repetition (same word used 4+ times), frustration signals
    // (multiple exclamation marks), teasing or sarcasm, wellbeing checks
    // ("how are you?"), acknowledgements ("ok", "k", "باشه"), emotional
    // statements (strong sentiment), substantive content checks, and
    // mixed-language indicators.
    //
    // Each method returns a boolean or structured detection result that
    // the main `respond` pipeline uses to select the appropriate response
    // strategy and pool.
    // ======================================================================

    _isRepeatedGreeting(normalizedText) {
      const recentUtterances = this.memory.recentUtterances;
      if (recentUtterances.length < REPEATED_GREETING_THRESHOLD) return false;
      const greetingPatterns = this.lang.rules
        .filter((r) => r.topic === 'greeting')
        .map((r) => r.pattern);
      if (!greetingPatterns.length) return false;
      let greetingCount = 0;
      const currentIsGreeting = greetingPatterns.some((p) => {
        p.lastIndex = 0;
        return p.test(normalizedText);
      });
      if (!currentIsGreeting) return false;
      for (let i = recentUtterances.length - 1; i >= 0; i -= 1) {
        const isGreeting = greetingPatterns.some((p) => {
          p.lastIndex = 0;
          return p.test(recentUtterances[i]);
        });
        if (isGreeting) {
          greetingCount += 1;
        } else {
          break;
        }
      }
      return greetingCount >= REPEATED_GREETING_THRESHOLD;
    }

    _isSpamOrNoise(normalizedText) {
      const text = normalizedText.trim();
      if (text.length < SPAM_MIN_LENGTH) return false;
      if (/^\d+$/u.test(text) && text.length < 5) return true;
      const chars = [...text].filter((ch) => /\p{L}/u.test(ch));
      if (chars.length < 3) return false;
      const uniqueChars = new Set(chars.map((c) => c.toLowerCase()));
      const uniqueRatio = uniqueChars.size / chars.length;
      if (uniqueRatio < SPAM_MAX_UNIQUE_RATIO && text.length < 12) return true;
      if (uniqueChars.size <= 2 && text.length > 4) return true;
      const words = text.split(/\s+/u).filter(Boolean);
      if (words.length <= 2 && this.lang.stopWords
        && words.every((w) => this.lang.stopWords.has(w.toLowerCase()))) {
        return false;
      }
      return false;
    }

    _isAmbiguousInput(normalizedText) {
      const wordCount = normalizedText.split(/\s+/u).filter(Boolean).length;
      return wordCount <= 2 && normalizedText.length < 10;
    }

    _detectWordRepetition(normalizedText) {
      const recent = [...this.memory.recentUtterances];
      const stopWords = this.lang.stopWords
        || new Set([
          'is', 'are', 'am', 'be', 'the', 'a', 'an', 'in', 'on', 'at',
          'to', 'for', 'of', 'and', 'or', 'but', 'it', 'its', 'i', 'you',
          'he', 'she', 'they', 'we', 'my', 'your', 'his', 'her', 'its',
        ]);
      const pastWordCounts = new Map();
      for (const utterance of recent) {
        const clean = String(utterance).replace(/[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu, ' ');
        const words = clean.toLowerCase().split(/\s+/u).filter(Boolean);
        for (const word of words) {
          if (word.length < 2 || stopWords.has(word)) continue;
          pastWordCounts.set(word, (pastWordCounts.get(word) || 0) + 1);
        }
      }
      const currentClean = String(normalizedText || '').replace(/[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu, ' ');
      const currentWords = currentClean.toLowerCase().split(/\s+/u).filter(Boolean);
      const currentWordSet = new Set(currentWords);
      let mostRepeated = null;
      let maxCount = 0;
      for (const [word, count] of pastWordCounts) {
        if (count > maxCount && count >= WORD_REPETITION_THRESHOLD && currentWordSet.has(word)) {
          mostRepeated = word;
          maxCount = count;
        }
      }
      return mostRepeated ? { word: mostRepeated, count: maxCount } : null;
    }

    _detectFrustration(rawText) {
      if (/!{3,}/.test(rawText)) return 'exclamation';
      if (/\?{2,}/.test(rawText)) return 'question';
      if (/[!?]{3,}/.test(rawText)) return 'exclamation';
      return null;
    }

    _detectTeasingOrMocking(rawText, matchingText) {
      const sarcasticPraise = /(?:you'?re\s+(?:so|very|really)\s+(?:smart|clever|funny|helpful|wise|useful|intelligent|brilliant|genius)|what a genius|wow\s+(?:you'?re|so)|such a genius|great advice|very helpful|thanks a lot)\b/i;
      const mockAgree = /\b(?:yeah right|sure (?:you are|you do|bot)|whatever you say|if you say so|right ok|ok sure|as if|oh please)\b/i;
      const dismissSignal = /(?:pfft|meh|tch|pshaw|bah|hmph)/i;
      const faSarcasm = /(?:چه (?:باهوش|خوب|عاقل|دانا|مهربان|صبور|باحال|بامزه|باحوصله|باهوشی|باهوشید)،|آفرین به (?:خودت|شما|خودتون)|به به|احسنت|مرسی که اینقدر (?:باهوشی|کمک کردی|به دردم خوردی)|به درک|هر چی تو بگی|چشم منتظر|خوب خوب تو راست میگی|باشه باشه تو بردی)/iu;
      const hasExcessivePunct = /!{3,}|\?{3,}|!\?|\?!|([.!?]){3,}/.test(rawText);
      const hasSarcasticPraise = sarcasticPraise.test(rawText) && hasExcessivePunct;
      const hasMockAgree = mockAgree.test(matchingText);
      const hasDismissSignal = dismissSignal.test(rawText);
      const hasFaSarcasm = faSarcasm.test(rawText);
      const hasSarcasticPraiseBare = sarcasticPraise.test(matchingText)
        && this.memory.turnCount >= 2
        && this.memory.recentTopics.slice(-2).some(
          (topic) => (this.lang.topicSeriousness?.[topic] || 0.5) >= 0.5
        );
      let signals = 0;
      if (hasSarcasticPraise) signals += 1;
      if (hasMockAgree) signals += 1;
      if (hasDismissSignal) signals += 1;
      if (hasSarcasticPraiseBare) signals += 1;
      if (hasFaSarcasm) signals += 2;
      return signals >= TEASING_MOCK_THRESHOLD;
    }

    _detectWellBeingCheck(matchingText) {
      const wellBeingPattern = this.lang.wellBeingPattern
        || /\b(?:how (?:are you|are you doing|you doing|have you been)|you (?:ok|alright|good)|what about you)\b/i;
      const isWellBeingQ = wellBeingPattern.test(matchingText);
      if (!isWellBeingQ) return false;
      if (this.memory.turnCount < WELLBEING_CHECK_TURNS) return false;
      const recentSeriousness = this.memory.seriousnessHistory.slice(-WELLBEING_CHECK_TURNS);
      const avgSeriousness = recentSeriousness.length
        ? recentSeriousness.reduce((a, b) => a + b, 0) / recentSeriousness.length
        : 0;
      return avgSeriousness >= 0.4 || this.lastTurnNeedsCare;
    }

    _isAcknowledgement(text) {
      const words = text.trim().split(/\s+/u).filter(Boolean);
      if (words.length > ACKNOWLEDGEMENT_THRESHOLD) return false;
      const enAck = /^(?:ok|okay|k|sure|right|yeah|yep|i see|got it|understood|makes sense|noted|cool|fine|alright)$/iu;
      const faAck = /^(?:باشه|خب|خوب|متوجه|آره|اره|درست|چشم|بله|شه|اوه|آها|آحم)$/iu;
      return enAck.test(text.trim()) || faAck.test(text.trim());
    }

    _isEmotionalStatement(text) {
      const score = scoreSentiment(text, this.lang.sentimentLexicon);
      return Math.abs(score) >= 2;
    }

    _isSubstantiveAnswer(text) {
      const words = text.trim().split(/\s+/u).filter(Boolean);
      if (words.length < SUBSTANTIVE_ANSWER_MIN_WORDS) return false;
      if (this._isAcknowledgement(text)) return false;
      if (this._isSpamOrNoise(text)) return false;
      return true;
    }

    _isMixedLanguage(text) {
      const letters = [...String(text)].filter((ch) => /\p{L}/u.test(ch));
      if (letters.length < 4) return false;
      const foreignLetters = letters.filter((ch) => !this.lang.scriptRange.test(ch));        return foreignLetters.length >= MIXED_SCRIPT_FOREIGN_MIN
        && foreignLetters.length / letters.length >= MIXED_SCRIPT_FOREIGN_RATIO;
    }

    // ======================================================================
    // Factual question handling
    //
    // Detects and answers simple arithmetic expressions in both Latin and
    // Persian numeral systems: addition (+ / بعلاوه), subtraction (- / منهای),
    // multiplication (* / x / ضربدر), and division (/ / تقسیم بر).
    //
    // Three input forms are handled:
    //   1. Full English question: "What is 5 + 3?"
    //   2. Full Persian question: "۲+۳ چند می‌شه؟"
    //   3. Bare expression: "5+3" or "۲+۵" (no question framing)
    //
    // Division by zero returns an explicit "undefined" message. Non-math
    // text passes through without triggering. After answering, a follow-up
    // question gently steers back to the user's emotional context.
    // ======================================================================

    _handleFactualQuestion(text) {
      const enMatch = text.match(/(?:what\s+is|what'?s)\s*(\d+)\s*([+\-*xX\/])\s*(\d+)/i);
      const faMatch = this.lang.code === 'fa'
        ? text.match(/([۰-۹0-9]+)\s*([+\-*xX\/\u00D7]|تقسیم\s+بر|ضربدر|بعلاوه|منهای)\s*([۰-۹0-9]+).*(?:چند|چقدر|چیست|چیه|می‌شه|میشه|می‌شود|مساوی)/u)
        : null;
      const bareMath = text.match(/([\d۰-۹]+)\s*([+\-*xX\/\u00D7]|بعلاوه|منهای|ضربدر|تقسیم\s+بر)\s*([\d۰-۹]+)(?:\s*[=:]?\s*)?$/u);
      let isBareExpression = false;
      if (bareMath) {
        const matchText = text.slice(0, bareMath.index + bareMath[0].length);
        const hasPersianWordOp = /(?:بعلاوه|منهای|ضربدر|تقسیم\s+بر)/u.test(String(bareMath[2] || ''));
        const hasNoSurroundingLetters = !/[\p{L}]/u.test(matchText);
        isBareExpression = hasNoSurroundingLetters || hasPersianWordOp;
      }
      const mathMatch = enMatch || faMatch || (isBareExpression ? bareMath : null);
      const isBareMatch = !!isBareExpression && !enMatch && !faMatch;
      if (mathMatch) {
        const a = parseInt(
          String(mathMatch[1]).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))),
          10
        );
        const b = parseInt(
          String(mathMatch[3]).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))),
          10
        );
        const opRaw = mathMatch[2];
        let result;
        let op;
        if (opRaw === 'x' || opRaw === 'X' || opRaw === '×' || opRaw === 'ضربدر') {
          op = '*';
        } else if (opRaw === 'تقسیم' || opRaw === 'تقسیم بر' || opRaw.toLowerCase() === '/') {
          op = '/';
        } else if (opRaw === 'بعلاوه' || opRaw === '+') {
          op = '+';
        } else if (opRaw === 'منهای' || opRaw === '-') {
          op = '-';
        } else {
          op = opRaw;
        }
        switch (op) {
          case '+': result = a + b; break;
          case '-': result = a - b; break;
          case '*': result = a * b; break;
          case '/': result = b !== 0 ? a / b : null; break;
          default: result = null;
        }
        if (result !== null && Number.isFinite(result)) {
          const isPersian = this.lang.code === 'fa';
          const answerOp = isPersian
            ? opRaw.replace(/[+\-*\/xX]/g, (m) => ({ '+': ' به‌علاوه', '-': ' منهای', '*': ' ضربدر', '/': ' تقسیم بر', 'x': ' ضربدر', 'X': ' ضربدر' })[m] || m)
            : opRaw;
          const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
          const toPersian = (n) => String(n).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
          const answer = isPersian
            ? `${toPersian(a)} ${answerOp} ${toPersian(b)} مساوی است با ${toPersian(result)}.`
            : `${a} ${answerOp} ${b} = ${result}.`;
          if (isBareMatch) {
            return answer;
          }
          const followup = this.lang.factualQuestionFollowups && this.lang.factualQuestionFollowups.length
            ? ` ${this._pickVaried(this.lang.factualQuestionFollowups)}`
            : '';
          return answer + followup;
        }
        if (op === '/' && b === 0) {
          const answer = this.lang.code === 'fa'
            ? 'تقسیم بر صفر تعریف‌نشده است.'
            : 'Dividing by zero is undefined.';
          const followup = this.lang.factualQuestionFollowups && this.lang.factualQuestionFollowups.length
            ? ` ${this._pickVaried(this.lang.factualQuestionFollowups)}`
            : '';
          return answer + followup;
        }
      }
      return null;
    }

    // ======================================================================
    // Emotion detection and calibration
    //
    // Uses keyword pattern matching to identify the user's primary emotion
    // from their input. The emotion vocabulary covers 14 categories: hurt,
    // confused, excited, angry, grieving, fear, anxious (with physical
    // symptom sub-patterns), sad, hopeless, overwhelmed, ashamed, jealous,
    // hopeful, and grateful.
    //
    // When a clear emotion is detected and the reply is not overridden by
    // a safety or factual path, the engine prepends a calibrated prefix
    // (e.g., "That sounds painful." for hurt) at a 40% probability to
    // acknowledge the emotional tone before delivering the main response.
    // ======================================================================

    _computePrimaryEmotion(text) {
      const emotions = [
        { name: 'hurt', patterns: /(?:hurt|pain|broken|wounded|شکسته|آسیب|درد)/iu },
        { name: 'confused', patterns: /(?:confused|lost|don'?t understand|don'?t know|گیج|گم شدم|نمی‌فهمم|نمی‌دونم|سرگردان|نامشخص)/iu },
        { name: 'excited', patterns: /(?:excited|thrilled|amazing|awesome|great news|هیجان|عالی|فوق‌العاده|خارق‌العاده)/iu },
        { name: 'angry', patterns: /(?:angry|furious|pissed|hate|mad|annoyed|عصبانی|خشم|نفرت|کفری|عصبی)/iu },
        { name: 'grieving', patterns: /(?:grief|loss|died|passed away|gone|miss|mourn|فقدان|فوت|از دست دادن|داغ|سوگ)/iu },
        { name: 'fear', patterns: /(?:terrified|frightened|scared\s+(?:to\s+death|stiff|shitless|witless)|panic\s+(?:attack|mode)|phobia|horror|shook|لرزیدن|هراس|فوبیا|ترس\s+مرگ|شوکه|دلهره)/iu },
        { name: 'anxious', patterns: /(?:anxious|worry|panic|scared|afraid|nervous|نگران|اضطراب|ترس|دلشوره|وحشت)/iu },
        { name: 'anxious', patterns: /(?:heart\s+(?:racing|pounding|beating)|sweating|shaking|trembling|chest\s+(?:tight|heavy)|short\s+of\s+(?:breath|breathe)|palpitations|dizzy|nausea)/iu },
        { name: 'sad', patterns: /(?:sad|depressed|down|unhappy|miserable|empty|numb|غمگین|ناراحت|افسرده|بی‌حال)/iu },
        { name: 'hopeless', patterns: /(?:hopeless|despair|giving up|can'?t go on|no point|ناشاد|ناامید|بی‌امید)/iu },
        { name: 'overwhelmed', patterns: /(?:overwhelmed|drowning|can'?t cope|too much|suffocating|درمانده|غرق|طاقت فرسا)/iu },
        { name: 'ashamed', patterns: /(?:ashamed|embarrassed|guilty|humiliated|شرمنده|خجالت|گناهکار)/iu },
        { name: 'jealous', patterns: /(?:jealous|envious|resentful|حسود|حسرت)/iu },
        { name: 'hopeful', patterns: /(?:hopeful|optimistic|encouraged|امیدوار|خوشبین)/iu },
        { name: 'grateful', patterns: /(?:grateful|thankful|blessed|appreciative|سپاسگزار|قدردان|شکرگزار)/iu },
      ];
      for (const emotion of emotions) {
        if (emotion.patterns.test(text)) return emotion.name;
      }
      const score = scoreSentiment(text, this.lang.sentimentLexicon);
      if (score <= -2) return 'sad';
      if (score >= 2) return 'happy';
      return 'neutral';
    }

    _detectPrimaryEmotion(text) {
      this.lastDetectedEmotion = this._computePrimaryEmotion(text);
      return this.lastDetectedEmotion;
    }

    _calibrateEmotionalTone(reply, detectedEmotion) {
      const calibration = this.lang.emotionCalibration;
      if (!calibration || !calibration[detectedEmotion]) return reply;
      if (Math.random() > 0.4) return reply;
      const prefix = calibration[detectedEmotion];
      return `${prefix} ${reply}`.trim();
    }

    // ======================================================================
    // Mixed language detection and conversation phase management
    //
    // Mixed-language detection: checks whether the user's input contains
    // a meaningful proportion of characters outside the active language
    // pack's script range, which suggests bilingual input. When detected,
    // with 60% probability the engine returns a language-pool redirect
    // asking the user to stick to one language.
    //
    // Phase management: advances the conversation through four stages:
    //   - new: No interaction yet
    //   - orienting: First few turns, establishing presence
    //   - engaging: User has shared substantive content
    //   - deepening: Extended conversation with established topics
    // The phase determines which greeting pool is used for openings and
    // which response strategies are available.
    // ======================================================================

    _handleMixedLanguage(text) {
      if (!this._isMixedLanguage(text)) return null;
      if (Math.random() > 0.6) return null;
      const pool = Array.isArray(this.lang.mixedLanguageResponses)
        ? this.lang.mixedLanguageResponses : null;
      return pool && pool.length ? this._pickVaried(pool) : null;
    }

    _phaseForTurn(strategy, seriousness) {
      if (strategy === 'safety') return 'safetySupport';
      if (strategy === 'context-reference') return 'contextualContinuation';
      if (strategy === 'topic-question' || strategy === 'question-acknowledgement') return 'clarifying';
      if (seriousness >= 0.5) return 'reflecting';
      return this.memory.turnCount <= 1 ? 'greeting' : 'listening';
    }

    _seriousnessForTurn(topics) {
      const values = (topics || []).map((topic) => this.lang.topicSeriousness?.[topic] ?? 0.45);
      const current = values.length ? Math.max(...values) : 0.35;
      const recent = this.memory.seriousnessHistory.slice(-2);
      const average = recent.length ? recent.reduce((sum, v) => sum + v, 0) / recent.length : 0;
      return Math.max(current, average);
    }

    _blendKey(topics) {
      if (!topics || topics.length < 2) return null;
      const pairs = [
        ['sleep', 'anxiety'], ['work', 'anger'], ['family', 'sadness'],
        ['loneliness', 'sleep'], ['joy', 'gratitude'],
        ['anxiety', 'loneliness'], ['health', 'anxiety'], ['grief', 'anger'],
      ];
      const found = pairs.find((pair) => pair.every((topic) => topics.includes(topic)));
      return found ? `blend_${found.join('_')}` : null;
    }

    canHumorFire() {
      return this.memory.turnCount >= 3
        && this.currentTurnSeriousness < 0.5
        && !this.lastTurnNeedsCare;
    }

    _canAskTopicQuestion(topic) {
      const pool = this.lang.topicSpecificQuestions?.[topic];
      if (!pool || !this.lang.questionTopics?.has(topic)) return false;
      if (this.currentTurnDialogueAct === 'question' || this.currentTurnQuestionNeed < 0.4) return false;
      const recent = this.memory.askedQuestionTurns.filter(
        (turn) => this.memory.turnCount - turn < QUESTION_BUDGET_WINDOW
      );
      return recent.length < QUESTION_BUDGET_LIMIT && this.memory.consecutiveQuestions < CONSECUTIVE_QUESTION_LIMIT;
    }

    // ======================================================================
    // Human-tone coloring
    // ======================================================================

    _maybeHumanTone(reply, normalized) {
      if (this.canHumorFire() && Math.random() < 0.2) {
        return this._pickVaried(this.lang.humor || [reply]);
      }
      if (this.currentTurnSeriousness >= 0.3 && this.currentTurnSeriousness < 0.6
        && this.memory.turnCount - this.memory.lastWarmthTurn >= 3
        && Math.random() < 0.3) {
        this.memory.lastWarmthTurn = this.memory.turnCount;
        return `${this._pickVaried(this.lang.warmth || [])} ${reply}`.trim();
      }
      if (this.memory.lightStreak >= 2 && !this.lastTurnNeedsCare
        && this.memory.turnCount % 3 === 0 && Math.random() < 0.35
        && normalized && !this.lang.questionPattern.test(normalized)) {
        return this._pickVaried(this.lang.smalltalk || [reply]);
      }
      return reply;
    }

    _shouldAddHumanTouch() {
      return this.memory.turnCount > 0 && this.memory.turnCount % 7 === 0
        && this.currentTurnSeriousness < 0.5
        && this.memory.eligibleNamedEntities(this.entityCallbackThreshold)
          .some((entity) => entity.lastMentionTurn < this.memory.turnCount);
    }

    _humanTouchLine() {
      const entity = this.memory.eligibleNamedEntities(this.entityCallbackThreshold)
        .find((item) => item.lastMentionTurn < this.memory.turnCount);
      const pool = this.lang.humanTouch || [];
      return entity && pool.length
        ? this._pickVaried(pool).replace(/\{surface\}/gu, entity.surface)
        : '';
    }

    // ======================================================================
    // Greeting selection and phase advancement
    //
    // Opening greetings are selected from four distinct pools based on
    // the current conversation phase and whether the user has returned
    // (has remembered entities):
    //   - greetingsPhase1: Warm, establishing presence ("I am Darya...")
    //   - greetingsPhase2: Gentle orientation, low-pressure binary choice
    //   - greetingsOpen: Neutral invitation to share (returning or new)
    //   - greetingsInviting: Warm invitation (higher engagement tone)
    //   - greetingsReturning: Acknowledging a return visit
    //
    // Phase advancement (_advanceConversationPhase) is called after every
    // turn. It transitions through new -> orienting -> engaging -> deepening
    // based on turn count and input substance.
    // ======================================================================

    _openingForNewConversation() {
      const returning = this.memory.namedEntities.size > 0;
      const roll = Math.random();
      let pool;
      if (returning) {
        pool = roll < 0.6
          ? (this.lang.greetingsReturning || this.lang.greentingsReturning)
          : roll < 0.85
            ? (this.lang.greetingsInviting || this.lang.greentingsInviting)
            : (this.lang.greetingsOpen || this.lang.greentingsOpen);
      } else {
        pool = roll < 0.5
          ? (this.lang.greetingsInviting || this.lang.greentingsInviting)
          : roll < 0.85
            ? (this.lang.greetingsOpen || this.lang.greentingsOpen)
            : (this.lang.greetingsReturning || this.lang.greentingsReturning);
      }
      return this._pickVaried(pool || this.lang.greetings, { trackQuestions: false });
    }

    _advanceConversationPhase(userInput) {
      const wordCount = String(userInput || '').trim().split(/\s+/u).filter(Boolean).length;
      const turnCount = this.memory.turnCount;

      if (this.conversationPhase === 'new') {
        this.conversationPhase = 'orienting';
      } else if (this.conversationPhase === 'orienting' && turnCount >= 2) {
        if (wordCount >= 5 || this.currentTurnTopics.length > 0) {
          this.conversationPhase = 'engaging';
        } else if (turnCount >= 4) {
          this.conversationPhase = 'engaging';
        }
      } else if (this.conversationPhase === 'engaging' && turnCount >= 6) {
        this.conversationPhase = 'deepening';
      }
    }

    _phaseGreeting() {
      if (this.conversationPhase === 'new' && this.lang.greetingsPhase1 && this.lang.greetingsPhase1.length) {
        return this._pickVaried(this.lang.greetingsPhase1, { trackQuestions: false });
      }
      if (this.conversationPhase === 'orienting' && this.lang.greetingsPhase2 && this.lang.greetingsPhase2.length) {
        return this._pickVaried(this.lang.greetingsPhase2, { trackQuestions: false });
      }
      return this._openingForNewConversation();
    }

    // ======================================================================
    // Rule matching and response selection
    //
    // _matchRules: Iterates the priority-sorted rule list and returns all
    // matches with their capture groups. Rules are tried in descending
    // priority order; the first match has the highest priority, but all
    // matches are returned for topic blend detection.
    //
    // _respondWithRule: Given a matched rule and its capture string,
    // selects the appropriate response. Special-cases gratitude,
    // professional_boundary, recap, and knowledge rules. Falls back
    // gracefully when a capture is expected but missing.
    //
    // _fallbackResponse: The last-resort response generator when no rule
    // matches. Tries entity callback, session check-in, question fallback,
    // quoted callback (echoing user's own words), and pronoun reflection
    // before falling through to generic/strategy-shift fallback pools.
    // Alternates between genericFallbacks and strategyShiftFallbacks to
    // provide natural variety.
    // ======================================================================

    _matchRules(normalizedText) {
      const matches = [];
      for (const currentRule of this.rules) {
        const match = currentRule.pattern.exec(normalizedText);
        if (!match) continue;

        let captured = '';
        for (let i = match.length - 1; i >= 1; i -= 1) {
          const group = match[i];
          if (group) {
            const candidate = group.trim().replace(/^[.,،!؟\s]+|[.,،!؟\s]+$/g, '');
            if (candidate && !this.lang.trivialCaptures.has(candidate.toLowerCase())) {
              captured = candidate;
            }
            break;
          }
        }
        matches.push({ rule: currentRule, captured });
      }
      return matches;
    }

    _matchRule(normalizedText) {
      return this._matchRules(normalizedText)[0] || { rule: null, captured: '' };
    }

    _respondWithRule(matchedRule, captured) {
      if (matchedRule.topic === 'gratitude' && this.lang.gratitudeResponses) {
        return this._pickVaried(this.lang.gratitudeResponses);
      }
      if (matchedRule.topic === 'professional_boundary' && this.lang.professionalBoundary) {
        return this._pickVaried(this.lang.professionalBoundary);
      }
      if (matchedRule.topic === 'recap') {
        return this._buildRecap();
      }
      if (matchedRule.topic === 'knowledge' && global.DaryaKnowledge) {
        const knowledgeText = this._currentNormalizedInput || captured || '';
        const domainHints = this.lang.code === 'fa'
          ? {
            thinkers: ['سقراط', 'رواقی', 'ارسطو', 'یونگ', 'نیچه', 'گاندی', 'ماندلا', 'چرچیل', 'زرتشت'],
            philosophy: ['فلسفه', 'فلسفی'],
            focus: ['تمرکز'],
            learning: ['یاد'],
            communication: ['ارتباط'],
            creativity: ['خلاق'],
            mindfulness: ['ذهن‌آگاهی', 'مدیتیشن', 'مراقبه', 'حضور', 'نفس', 'آرامش'],
            stress: ['استرس', 'فشار', 'فرسودگی', 'آرام‌شدن', 'مدیریت استرس'],
            self_compassion: ['خودشفقتی', 'مهربانی با خود', 'خودانتقادی', 'منتقد درونی'],
            conflict: ['تعارض', 'حل اختلاف', 'بحث', 'ارتباط بدون خشونت', 'صلح'],
            decision_making: ['تصمیم', 'تصمیم‌گیری', 'انتخاب', 'بین دو گزینه'],
            grief: ['سوگ', 'فقدان', 'از دست دادن', 'داغ', 'مرگ', 'غم از دست'],
          }
          : {
            thinkers: ['socrates', 'stoic', 'aristotle', 'jung', 'nietzsche', 'gandhi', 'mandela', 'churchill', 'zarathustra'],
            philosophy: ['philosophy'],
            focus: ['focus', 'concentrate'],
            learning: ['study', 'learn'],
            communication: ['communicate'],
            creativity: ['creative'],
            mindfulness: ['mindfulness', 'meditation', 'mindful', 'present moment', 'breathing exercise', 'calm mind'],
            stress: ['stress', 'burnout', 'overwhelmed', 'calm down', 'stress management', 'anxiety management'],
            self_compassion: ['self compassion', 'self-compassion', 'self kindness', 'inner critic', 'be kind to myself', 'self care'],
            conflict: ['conflict resolution', 'argument', 'disagreement', 'resolve conflict', 'nonviolent communication', 'nvc'],
            decision_making: ['decision', 'make a choice', 'deciding', 'choose between', 'important decision', 'decision making'],
            grief: ['grief', 'grieving', 'loss', 'cope with loss', 'mourning', 'grief support', 'bereavement'],
          };
        const domain = Object.entries(domainHints)
          .find(([, hints]) => hints.some((hint) => knowledgeText.toLocaleLowerCase().includes(hint)))?.[0] || 'philosophy';
        return this._pickVaried(global.DaryaKnowledge.answer(this.lang.code, domain));
      }

      if (this.memory.sameRuleStreak > MAX_CONSECUTIVE_SAME_RULE) {
        return this._fallbackResponse(matchedRule.topic, '');
      }

      if (this._canAskTopicQuestion(matchedRule.topic)) {
        const question = this._pickVaried(this.lang.topicSpecificQuestions[matchedRule.topic]);
        if (this.lang.topicSpecificQuestions[matchedRule.topic].includes(question)) return question;
      }

      const needsCapture = matchedRule.responses.some((r) => r.includes('{captured}'));
      if (!needsCapture) {
        return this._pickVaried(matchedRule.responses);
      }

      if (captured) {
        const withCapture = matchedRule.responses.filter((r) => r.includes('{captured}'));
        const template = this._pickVaried(withCapture);
        return template.replace('{captured}', captured);
      }

      const captureFree = matchedRule.responses.filter((r) => !r.includes('{captured}'));
      if (captureFree.length > 0) return this._pickVaried(captureFree);
      return this._pickVaried(this.lang.genericFallbacks);
    }

    _buildRecap() {
      const topics = [...new Set(this.memory.recentTopics.slice(-7))].slice(-4);
      const entities = this.memory.eligibleNamedEntities(0)
        .slice(0, 3)
        .map((entity) => entity.surface);
      const topicText = topics.length ? topics.join(this.lang.code === 'fa' ? '، ' : ', ') : (this.lang.code === 'fa' ? 'چند موضوع مختلف' : 'a few threads');
      const entityText = entities.length ? entities.join(this.lang.code === 'fa' ? '، ' : ', ') : (this.lang.code === 'fa' ? 'چند جزئیات شخصی' : 'a few personal details');
      const pool = this.lang.recapTemplates || [];
      return this._pickVaried(pool, { ignoreQuestionBudget: true, trackQuestions: false })
        .replace(/\{topics\}/gu, topicText)
        .replace(/\{entities\}/gu, entityText);
    }

    _fallbackResponse(preferTopic, normalizedUserText) {
      const entityCallback = this._respondToEntityReference();
      if (entityCallback) return entityCallback;

      if (this.memory.turnCount > 0 && this.memory.turnCount % this.lang.checkInEvery === 0) {
        return this._pickVaried(this.lang.sessionCheckIns);
      }

      if (normalizedUserText && this.lang.questionPattern.test(normalizedUserText)) {
        if (this.currentTurnDialogueAct === 'question') {
          return this._pickVaried(this.lang.questionAcknowledgements || this.lang.genericFallbacks);
        }
        return this._pickVaried(this.lang.questionFallbacks);
      }

      if (normalizedUserText && Math.random() < QUOTED_CALLBACK_PROBABILITY) {
        const excerpt = this.memory.randomRecentUtterance(normalizedUserText);
        if (excerpt) {
          const template = this._pickVaried(this.lang.quotedCallbackTemplates);
          return template.replace('{excerpt}', truncateExcerpt(excerpt, EXCERPT_MAX_LENGTH));
        }
      }

      if (this.lang.pronounMap && normalizedUserText && Math.random() < PRONOUN_REFLECTION_PROBABILITY) {
        const reflected = reflectPronouns(normalizedUserText, this.lang.pronounMap);
        if (reflected) {
          return `So ${reflected}. What's that like for you?`;
        }
      }

      this._fallbackToggle = !this._fallbackToggle;
      const pool = this._fallbackToggle ? this.lang.strategyShiftFallbacks : this.lang.genericFallbacks;
      return this._pickVaried(pool);
    }

    // ======================================================================
    // Entity callback logic
    //
    // When the user has previously mentioned a person, place, object, or
    // activity on an emotionally-weighted turn, and that entity is still
    // active (activation above threshold) and contextually relevant
    // (current topics overlap with the entity's contextTopics), the
    // engine can produce a callback referencing the entity by name.
    //
    // Callbacks fire at ENTITY_CALLBACK_PROBABILITY (55%) per eligible
    // turn. The first-mention guard prevents a callback on the same turn
    // the entity was introduced. Context confidence is computed from the
    // overlap between the entity's stored contextTopics and the current
    // turn's detected topics, with a minimum threshold of 0.6.
    // ======================================================================

    _entityContextConfidence(entity) {
      const activeTopics = new Set(this.currentTurnTopics.length
        ? this.currentTurnTopics
        : [this.memory.currentSubject.topic].filter(Boolean));
      const rememberedTopics = new Set(entity.contextTopics || []);
      if (activeTopics.size === 0 || rememberedTopics.size === 0) {
        return entity.age <= 4 ? 0.72 : 0.45;
      }
      const overlap = [...activeTopics].some((topic) => rememberedTopics.has(topic));
      if (overlap) return 1;
      const recentTopic = this.memory.topicHistory.slice(-4).some((entry) => rememberedTopics.has(entry.topic));
      return recentTopic ? 0.64 : 0.22;
    }

    _respondToEntityReference() {
      const threshold = Number.isFinite(this.entityCallbackThreshold)
        ? Math.max(0, Math.min(1, this.entityCallbackThreshold))
        : 0.6;
      const probability = Number.isFinite(this.entityCallbackProbability)
        ? Math.max(0, Math.min(1, this.entityCallbackProbability))
        : ENTITY_CALLBACK_PROBABILITY;
      const candidates = this.memory.eligibleNamedEntities(threshold)
        .filter((entity) => entity.lastMentionTurn < this.memory.turnCount)
        .map((entity) => ({ entity, context: this._entityContextConfidence(entity) }))
        .filter((entry) => entry.context >= 0.6)
        .sort((a, b) => (b.entity.activation * b.context) - (a.entity.activation * a.context));
      if (candidates.length === 0 || Math.random() >= probability) return null;

      const entity = candidates[0].entity;
      const templates = this.lang.entityCallbackTemplates || {};
      const pool = templates[entity.type] || templates.object || [];
      if (pool.length === 0) return null;
      const template = this._pickVaried(pool);
      return template.replace(/\{surface\}/gu, entity.surface);
    }

    // ======================================================================
    // Question budget management
    //
    // Prevents the engine from asking too many questions in succession,
    // which would make the conversation feel interrogative rather than
    // supportive. Two complementary mechanisms:
    //
    // 1. Consecutive question limit (CONSECUTIVE_QUESTION_LIMIT = 1):
    //    After the engine asks one question, the next response cannot
    //    also be a question.
    //
    // 2. Rolling window budget (QUESTION_BUDGET_WINDOW = 3 turns,
    //    QUESTION_BUDGET_LIMIT = 1): Only one question response is
    //    allowed within any 3-turn window.
    //
    // When the budget is exhausted, _filterForQuestionBudget removes
    // question-type responses from the pool. _alternativeFor provides
    // a non-question fallback (topic-specific or generic).
    // ======================================================================

    _isQuestionResponse(text) {
      if (/[?؟]/u.test(text)) return true;
      if (this.lang.questionPattern && this.lang.questionPattern.test(text)) return true;
      return /\b(?:what|why|how|who|when|where|which)\b/iu.test(text)
        || /(?<!\p{L})(?:چرا|چطور|چگونه|چیست|چیه|کجا|کیست|کیه|آیا)(?!\p{L})/u.test(text);
    }

    _filterForQuestionBudget(pool) {
      const options = Array.isArray(pool) ? pool : [];
      const now = this.memory.turnCount;
      this.memory.askedQuestionTurns = this.memory.askedQuestionTurns.filter(
        (turn) => now - turn < QUESTION_BUDGET_WINDOW
      );
      const budgetUsed = this.memory.askedQuestionTurns.length >= QUESTION_BUDGET_LIMIT;
      const consecutiveUsed = this.memory.consecutiveQuestions >= CONSECUTIVE_QUESTION_LIMIT;
      if (!budgetUsed && !consecutiveUsed) return options;
      const alternatives = options.filter((option) => !this._isQuestionResponse(option));
      return alternatives;
    }

    _noteAskedQuestion(response) {
      if (this._isQuestionResponse(response)) {
        this.memory.consecutiveQuestions += 1;
        this.memory.askedQuestionTurns.push(this.memory.turnCount);
        this.memory.noteBotQuestion(response, this.currentTurnTopics[0] || this.memory.currentSubject.topic);
      } else {
        this.memory.consecutiveQuestions = 0;
      }
    }

    _alternativeAvailable(pool) {
      return Array.isArray(pool) && pool.some((option) => !this._isQuestionResponse(option));
    }

    _alternativeFor(response) {
      const topic = this.currentTurnTopics[0] || this.memory.currentSubject.topic;
      if (topic && this._canAskTopicQuestion(topic)) {
        const specific = this.lang.topicSpecificQuestions?.[topic] || [];
        if (specific.length) return this._pickVaried(specific, { ignoreQuestionBudget: true, trackQuestions: false });
      }
      const pools = [this.lang.genericFallbacks, this.lang.strategyShiftFallbacks];
      for (const pool of pools) {
        const candidates = pool.filter((line) => !this._isQuestionResponse(line) && line !== response);
        if (candidates.length > 0) {
          return candidates[Math.floor(Math.random() * candidates.length)];
        }
      }
      const anyNonQuestion = this.lang.genericFallbacks.find((line) => !this._isQuestionResponse(line));
      return anyNonQuestion || this.lang.genericFallbacks[0] || '';
    }

    // ======================================================================
    // Response scoring and selection
    //
    // _pickVaried: The central response selection method. Filters the
    // pool through the question budget, removes recently-used responses
    // from consideration, scores remaining candidates with
    // scoreResponseCandidate, and randomly selects from among the
    // top-scoring options to provide natural variety.
    //
    // scoreResponseCandidate: Ranks a response candidate on a 0-1 scale,
    // penalizing:
    //   - Recently used responses (-0.9, strong avoidance of repetition)
    //   - Question-type responses when consecutiveQuestions is high (-0.25 * n)
    //   - Very long responses (-0.08 over 220 chars)
    //   - Generic filler like "I see" or "Okay" (-0.12)
    // ======================================================================

    scoreResponseCandidate(candidate) {
      let score = 1;
      if (this.memory.recentBotMessages.includes(candidate)) score -= 0.9;
      if (this._isQuestionResponse(candidate)) score -= this.memory.consecutiveQuestions * 0.25;
      if (candidate.length > 220) score -= 0.08;
      if (/^(?:I see|Okay|Understood|متوجه شدم|باشه)[.!،؟]?$/iu.test(candidate)) score -= 0.12;
      return score;
    }

    _pickVaried(pool, options = {}) {
      const original = Array.isArray(pool) ? pool : [];
      if (original.length === 0) return '';
      let budgeted = options.ignoreQuestionBudget
        ? original
        : this._filterForQuestionBudget(original);
      if (budgeted.length === 0) budgeted = [this._alternativeFor(original[0])];
      if (budgeted.length === 1) {
        const only = budgeted[0];
        if (options.trackQuestions !== false) this._noteAskedQuestion(only);
        return only;
      }

      const recent = this.memory.recentBotMessages;
      let candidates = budgeted.filter((item) => !recent.includes(item));

      if (candidates.length === 0) {
        const last = recent[recent.length - 1];
        candidates = budgeted.filter((item) => item !== last);
      }
      if (candidates.length === 0) candidates = budgeted;

      const ranked = candidates.map((candidate) => ({ candidate, score: this.scoreResponseCandidate(candidate) }));
      const bestScore = Math.max(...ranked.map((item) => item.score));
      const best = ranked.filter((item) => item.score >= bestScore - 0.12).map((item) => item.candidate);
      const picked = best[Math.floor(Math.random() * best.length)];
      if (options.trackQuestions !== false) this._noteAskedQuestion(picked);
      return picked;
    }
  }

  // ========================================================================
  // Public API - matches the shape expected by tests and app.js
  // ========================================================================

  global.DaryaEngine = {
    isValidScript: U.isValidScript,
    scoreSentiment: U.scoreSentiment,
    normalizeForMatching: U.normalizeForMatching,
    ENTITY_DECAY_PER_TURN: U.ENTITY_DECAY_PER_TURN,
    ENTITY_CALLBACK_PROBABILITY: U.ENTITY_CALLBACK_PROBABILITY,
    CONSECUTIVE_QUESTION_LIMIT: U.CONSECUTIVE_QUESTION_LIMIT,
    QUESTION_BUDGET_WINDOW: U.QUESTION_BUDGET_WINDOW,
    QUESTION_BUDGET_LIMIT: U.QUESTION_BUDGET_LIMIT,
    ConversationMemory: U.ConversationMemory,
    DaryaResponseEngine,
  };
})(typeof window !== 'undefined' ? window : globalThis);
