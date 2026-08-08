/**
 * Darya - Rogerian conversation engine responder (classic script).
 */

(function (global) {
  'use strict';


var U = global.DaryaUtils;
var DaryaKnowledge = global.DaryaKnowledge;
var TimeFetcher = global.DaryaTimeUtils.TimeFetcher;
var handleFactualQuestion = global.DaryaFactual.handleFactualQuestion;
var handleDateTimeQuestion = global.DaryaFactual.handleDateTimeQuestion;
var handleFunFactsRequest = global.DaryaFactual.handleFunFactsRequest;
var buildRecap = global.DaryaRecap.buildRecap;

const {
  PRONOUN_REFLECTION_PROBABILITY,
  EXCERPT_MAX_LENGTH,
  ENTITY_CALLBACK_PROBABILITY,
  CONSECUTIVE_QUESTION_LIMIT,
  QUESTION_BUDGET_WINDOW,
  QUESTION_BUDGET_LIMIT,
  REPEATED_GREETING_THRESHOLD,
  EXIT_SCAN_WINDOW,
  EXIT_SCAN_TRIGGER_LENGTH,
  SERIOUS_TURN_THRESHOLD,
  MODERATE_SERIOUSNESS_THRESHOLD,
  SERIOUSNESS_TOPIC_FLOOR,
  SERIOUSNESS_WEIGHT,
  SERIOUSNESS_CAP,
  SERIOUSNESS_LIGHT_TOPIC,
  ENTITY_CONFIDENCE_THRESHOLD,
  BOREDOM_SKIP_CHANCE,
  EMOTION_PREFIX_CHANCE,
  HUMOR_CHANCE,
  WARMTH_MIN_SERIOUSNESS,
  WARMTH_MAX_SERIOUSNESS,
  WARMTH_MIN_TURN_GAP,
  WARMTH_CHANCE,
  SMALLTALK_MIN_LIGHT_STREAK,
  SMALLTALK_TURN_INTERVAL,
  SMALLTALK_CHANCE,
  HUMAN_TOUCH_INTERVAL,
  ENTITY_RECENT_TURNS,
  ENTITY_RECENT_CONFIDENCE,
  ENTITY_STALE_CONFIDENCE,
  OPENING_RETURNING_PRIMARY,
  OPENING_RETURNING_SECONDARY,
  OPENING_NEW_PRIMARY,
  ENTITY_CONFIDENCE_DECAY_RECENT_BASE,
  ENTITY_CONFIDENCE_DECAY_RECENT_RATE,
  ENTITY_CONFIDENCE_DECAY_STALE_BASE,
  ENTITY_CONFIDENCE_DECAY_STALE_RATE,
  MIXED_LANGUAGE_REDIRECT_CHANCE,
  TOPIC_RELEVANCE_RECENT_BONUS,
  TOPIC_RELEVANCE_STALE_BASE,
  ENTITY_CONTEXT_THRESHOLD,
  RECENT_BOT_MESSAGE_PENALTY,
  CONSECUTIVE_QUESTION_PENALTY,
  LONG_RESPONSE_THRESHOLD,
  LONG_RESPONSE_PENALTY,
  FILLER_RESPONSE_PENALTY,
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
  isValidScript,
  normalizeForMatching,
  scoreSentiment,
  reflectPronouns,
  truncateExcerpt,
  ConversationMemory,
  MAX_CONSECUTIVE_SAME_RULE,
  QUOTED_CALLBACK_PROBABILITY
} = U;

// Minimum confidence (0..1) for the factual-knowledge override to replace
// a rule reply with a direct encyclopedia-style answer. The knowledge
// lookup already applies its own minimum score and doubles the weight of
// hint-confirmed or framed weak words; 0.35 lets short topic words like
// "کنکور" or "مریخ" answer while still blocking fuzzy coincidences.
const KNOWLEDGE_OVERRIDE_CONFIDENCE = 0.35;
// Probability of answering an unanswered factual question with a
// reliable-source pointer instead of a plain acknowledgement, so the
// reply does not always read as a source lecture.
const SOURCE_SUGGESTION_CHANCE = 0.5;

// ========================================================================

// Emotional-disclosure topics whose rule pools already acknowledge the
// feeling directly (e.g. "I can hear the sadness in what you are sharing").
// Used in two places: _preferLivedRuleOverKnowledge reorders these ahead of
// the broad knowledge shelf for personal disclosures, and the emotional
// calibration skips prepending a generic empathy prefix when the matched
// rule pool already carries its own acknowledgment (avoids tone-stacking
// like "I hear the sadness. I can hear the sadness...").
const LIVED_TOPICS = new Set([
  'anxiety',
  'stress',
  'sadness',
  'anger',
  'grief',
  'loneliness',
  'relationship',
  'work'
]);

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
    // Last knowledge fact answered, for sequential refinement (e.g. a
    // movie request followed by "in horror genre please"). Reset when a
    // non-knowledge topic is matched.
    this._lastKnowledgeTopic = null;
    this._lastKnowledgeTurn = -Infinity;
    // Set to true for the current turn when the fallback routed a light,
    // positive casual statement to the smalltalk pool. Later stages
    // (emotional calibration, human-tone coloring) skip the turn so they
    // never stack an extra prefix onto an already-warm smalltalk reply.
    this._lightPositiveFired = false;
    this.entityCallbackThreshold = ENTITY_CONFIDENCE_THRESHOLD;
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
      referenceConfidence: 0
    };
    this.conversationPhase = 'new';
    // Create a local time fetcher. The app never calls out to the
    // network: it reads the device clock only, so it works fully
    // offline and from file:// with no CORS concerns.
    this._timeFetcher = new TimeFetcher();
    this._timeFetcher.prefetch();
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
    this._lightPositiveFired = false;
    const sentimentScore = scoreSentiment(
      normalized,
      this.lang.sentimentLexicon
    );
    this.memory.rememberUtterance(normalized);
    this.memory.rememberSentiment(sentimentScore);
    this.memory.turnCount += 1;
    this.memory.decayNamedEntities();

    const entities = global.DaryaEntityExtractor
      ? global.DaryaEntityExtractor.extract(normalized, this.lang, {
        emotionalWeight: sentimentScore !== 0
      })
      : [];
    this._turnEntities = entities;
    const correction = this.detectEntityCorrection(matchingText);
    this._lastTurnCorrection = !!correction;
    if (correction) {
      const oldEntity = [...this.memory.namedEntities.values()].find((entity) =>
        correction.oldSurface
          .toLocaleLowerCase()
          .includes(entity.surface.toLocaleLowerCase())
      );
      if (oldEntity) {
        this.memory.correctEntity(
          correction.oldSurface,
          {
            type: oldEntity.type,
            surface: correction.newSurface,
            confidence: 0.96
          },
          {
            topics: this.currentTurnTopics,
            seriousness: this.currentTurnSeriousness
          }
        );
      }
    }

    const isRepeatedGreeting = this._isRepeatedGreeting(matchingText);
    const isSpamNoise = this._isSpamOrNoise(matchingText);
    const isAmbiguous =
      !isRepeatedGreeting &&
      !isSpamNoise &&
      this._isAmbiguousInput(matchingText);
    const isPureEmoji = this._isPureEmoji(String(rawText));

    // Prefer the lived-experience rule over the broad knowledge shelf when
    // an emotional disclosure ("امروز احساس استرس دارم", "I'm feeling
    // completely overwhelmed") also matches a conversational rule: the
    // person needs to be heard, not handed a philosophy essay. Explicit
    // knowledge requests ("درباره X توضیح بده", "Tell me about X") still
    // route to knowledge.
    const matches = this._preferLivedRuleOverKnowledge(
      this._matchRules(matchingText),
      matchingText
    );
    const matchedRule = matches[0]?.rule || null;
    const captured = matches[0]?.captured || '';
    const matchedTopics = matches.map((match) => match.rule.topic);
    this.currentTurnTopics = [...new Set(matchedTopics)];
    this.currentReferenceContext = this.resolveReferenceContext(matchingText);
    if (this.currentTurnTopics.length === 0 && this.currentReferenceContext) {
      this.currentTurnTopics = [this.currentReferenceContext.topic];
    }
    this.currentTurnDialogueAct = this.classifyDialogueAct(
      matchingText,
      matchedRule,
      rawText
    );
    if (
      this.currentTurnTopics.length === 0 &&
      this.currentTurnDialogueAct === 'question' &&
      matchingText.split(/\s+/u).length <= 6 &&
      this.memory.currentSubject.topic &&
      this.memory.turnCount - this.memory.currentSubject.since <= 3
    ) {
      this.currentTurnTopics = [this.memory.currentSubject.topic];
      this.currentReferenceContext = {
        topic: this.memory.currentSubject.topic,
        entityRefs: [...this.memory.currentSubject.entityRefs],
        confidence: 0.64
      };
    }
    this.currentTurnIntent = this.classifyIntent(
      this.currentTurnDialogueAct,
      matchedRule,
      this.currentTurnTopics
    );
    this.currentTurnQuestionNeed = this.questionNeedScore(
      this.currentTurnDialogueAct,
      this.currentTurnTopics
    );
    this.currentTurnSeriousness = this._seriousnessForTurn(
      this.currentTurnTopics
    );
    this.lastTurnNeedsCare =
      this.currentTurnSeriousness >= SERIOUS_TURN_THRESHOLD ||
      /\b(?:help|advice|problem|crisis|difficult|hard|worried|angry|mad|frustrated|annoyed|pissed)\b/iu.test(
        normalized
      ) ||
      /(?<!\p{L})(?:کمک|مشورت|مشکل|سخت|نگران|بحران|عصبانی|خشمگین|کفری|عصبی|ناراحت|ناراحتم)(?!\p{L})/u.test(
        normalized
      );
    this.memory.rememberSeriousness(this.currentTurnSeriousness);
    this.memory.rememberTopics(this.currentTurnTopics);
    this.memory.updateSubject(this.currentTurnTopics, entities);

    const blendKey = this._blendKey(this.currentTurnTopics);
    const strategy = this.selectResponseStrategy({
      matchedRule,
      blendKey,
      matchingText
    });
    this.lastResponseStrategy = strategy;
    this.memory.rememberStrategy(strategy);
    this.conversationState = {
      phase: this._phaseForTurn(strategy, this.currentTurnSeriousness),
      dialogueAct: this.currentTurnDialogueAct,
      intent: this.currentTurnIntent,
      topics: [...this.currentTurnTopics],
      seriousness: this.currentTurnSeriousness,
      strategy,
      referenceConfidence: this.currentReferenceContext?.confidence || 0
    };
    this.memory.rememberTurnFrame({
      ...this.conversationState,
      turn: this.memory.turnCount
    });

    const _substantiveCache = this._isSubstantiveAnswer(matchingText);
    const isSubstantive =
      !isRepeatedGreeting &&
      !isSpamNoise &&
      this.currentTurnDialogueAct !== 'acknowledgement' &&
      this.currentTurnDialogueAct !== 'test_input' &&
      _substantiveCache;
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
    } else if (
      this.currentTurnDialogueAct === 'test_input' &&
      this.lang.testInputResponses
    ) {
      reply = this._pickVaried(this.lang.testInputResponses);
    } else if (
      this.currentTurnDialogueAct === 'acknowledgement' &&
      this.lang.acknowledgementResponses
    ) {
      const hasPendingQuestion = this.memory.pendingQuestions.some(
        (q) => !q.answered
      );
      if (!_substantiveCache && hasPendingQuestion) {
        this.memory.consecutiveAcknowledgements += 1;
        if (this.memory.consecutiveAcknowledgements >= 2) {
          reply = this._pickVaried(this.lang.acknowledgementResponses);
          this.memory.consecutiveAcknowledgements = 0;
        } else {
          reply = this._fallbackResponse(null, normalized);
        }
      } else {
        // No open question to answer: acknowledge the brief reply warmly
        // instead of falling through to a generic therapeutic line. This
        // closes the "acknowledgement dead zone" where a simple "ok",
        // "yeah exactly", or "آره دقیقا" used to get a stiff, robotic
        // fallback.
        reply = this._pickVaried(this.lang.acknowledgementResponses);
      }
    } else if (
      this.currentTurnDialogueAct === 'correction' &&
      this.lang.correctionResponses
    ) {
      reply = this._pickVaried(this.lang.correctionResponses);
    } else if (blendKey && this.lang.blendResponses?.[blendKey]) {
      reply = this._pickVaried(this.lang.blendResponses[blendKey]);
    } else if (matchedRule) {
      reply = this._respondWithRule(matchedRule, captured);
    } else if (isPureEmoji && this.lang.emojiResponses) {
      // A message made only of smileys gets a warm, light reply. Flag
      // the turn so emotional calibration and human-tone coloring do
      // not stack a heavy prefix on top of it.
      this._lightPositiveFired = true;
      reply = this._pickVaried(this.lang.emojiResponses);
    } else if (isAmbiguous && this.lang.ambiguousInputResponses) {
      reply = this._pickVaried(this.lang.ambiguousInputResponses);
    } else {
      reply = this._fallbackResponse(null, normalized);
    }

    // --- Smart overrides that run after normal routing ---------------
    const _safetyTurn = matchedRule && matchedRule.topic === 'safety';
    let _overrideFired = false;

    // Critical child-safety override: an adult disclosing sexual or
    // romantic attraction toward a minor always receives the calm,
    // non-shaming, help-seeking reply, regardless of which rule matched.
    // It runs before every other override and, once fired, suppresses
    // them all (factual, math, knowledge, distress nudge) so the
    // protective reply can never be replaced or tone-stacked. It is
    // gated on _safetyTurn so a compound disclosure that also contains
    // acute crisis language ("I want to kill myself because I am
    // attracted to a 15-year-old") still gets the crisis reply first:
    // the safety pool carries hotline content, the minor-attraction pool
    // does not. The protected reply is picked with the question budget
    // ignored, mirroring the distress nudge, so it can never be swapped
    // for a generic fallback even if a pool line ever reads as a
    // question.
    const _minorAttractionTurn =
      !_safetyTurn && this._detectMinorAttraction(matchingText);
    if (_minorAttractionTurn) {
      reply = this._pickVaried(this.lang.minorAttractionResponses, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      });
      _overrideFired = true;
    }

    if (
      !_safetyTurn &&
      !_minorAttractionTurn &&
      !isRepeatedGreeting &&
      !isSpamNoise &&
      matchedRule?.topic !== 'knowledge'
    ) {
      const factualReply = handleFactualQuestion(this, normalized);
      if (factualReply) {
        reply = factualReply;
        _overrideFired = true;
      }
    }

    if (
      !_safetyTurn &&
      !_minorAttractionTurn &&
      !isRepeatedGreeting &&
      !isSpamNoise
    ) {
      const dateTimeReply = handleDateTimeQuestion(this, normalized);
      if (dateTimeReply) {
        reply = dateTimeReply;
        _overrideFired = true;
      }
    }

    // Fun-fact requests ("tell me 3 facts", "give me a shocking fact",
    // "حقایق درباره حیوانات") draw from the curated FUN_FACTS pool. They
    // run BEFORE the factual-knowledge lookup: a request that explicitly
    // asks for facts is more specific than a general topic question, so
    // "give me 3 facts about sports" must not be hijacked by the sports
    // career/game facts and "حقایق درباره هنر" must not be answered
    // with the art-career entry. A plain topic question ("tell me about
    // Saturn") has no fact framing and still gets the encyclopedia
    // entry. Personal disclosures that merely contain the word "fact"
    // ("the fact that I am tired") never match because the request
    // framing is required.
    if (
      !_safetyTurn &&
      !_minorAttractionTurn &&
      !_overrideFired &&
      !isRepeatedGreeting &&
      !isSpamNoise &&
      DaryaKnowledge &&
      DaryaKnowledge.randomFacts
    ) {
      const factsReply = handleFunFactsRequest(this, matchingText);
      if (factsReply) {
        reply = factsReply;
        _overrideFired = true;
      }
    }

    // Factual-knowledge override: concrete questions about the world
    // ("tell me about Jupiter", "فیزیک کوانتوم چیه", "چطور پول دربیارم")
    // deserve a direct answer from the factual shelf even when they also
    // trip a conversational rule (e.g. the broad reflection rule). The
    // override is gated on question framing so an emotional disclosure
    // like "استرس دارم" is never answered with an encyclopedia entry;
    // the question/request patterns decide, not the topic words alone.
    const _knowledgeOverrideEligible =
      !_safetyTurn &&
      !isRepeatedGreeting &&
      !isSpamNoise &&
      !_overrideFired &&
      matchedRule?.topic !== 'knowledge' &&
      matchedRule?.topic !== 'professional_boundary' &&
      // Personal disclosures stay conversational even when they contain a
      // knowledge keyword: "من ایمپاستر دارم" is a feeling, not a request
      // for a definition.
      matchedRule?.topic !== 'anxiety' &&
      matchedRule?.topic !== 'stress' &&
      matchedRule?.topic !== 'grief' &&
      matchedRule?.topic !== 'self_compassion' &&
      matchedRule?.topic !== 'burnout' &&
      DaryaKnowledge &&
      DaryaKnowledge.lookup &&
      this._isKnowledgeRequest(matchingText);
    if (_knowledgeOverrideEligible) {
      const factual = DaryaKnowledge.lookup(matchingText, this.lang.code);
      if (factual && factual.confidence >= KNOWLEDGE_OVERRIDE_CONFIDENCE) {
        const followup =
          this.lang.code === 'fa'
            ? ' دوست داری بیشتر درباره‌اش بگویی یا سؤال دیگری داری؟'
            : ' Would you like to go deeper, or is there another question?';
        reply = factual.text + followup;
        this._lastKnowledgeTopic = factual.topic;
        this._lastKnowledgeTurn = this.memory.turnCount;
        _overrideFired = true;
      }
    }

    // Sequential knowledge refinement: after any knowledge answer ("tell
    // me about Jupiter", "چطور پول دربیارم"), a short follow-up that
    // only names a topic ("and Saturn?", "زحل چطور؟", "in horror genre
    // please", "بازی موبایل") has no framing of its own, so the regular
    // lookup finds nothing. The remembered knowledge context lets
    // lookupGenre (movie genres) and lookupFragment (other topics) map
    // the word to the matching fact and continue the conversation in
    // place instead of bouncing to a generic fallback.
    if (
      !_safetyTurn &&
      !_overrideFired &&
      !isRepeatedGreeting &&
      !isSpamNoise &&
      // A topic word used emotionally ("ترسناک" about a scary situation,
      // "horror" describing a feeling, "sad" after a loss) must stay with
      // the lived-experience rule, never be answered with a list or an
      // encyclopedia entry. Same exclusion set as the knowledge override
      // above, plus the knowledge and boundary rules, which already
      // handle their own fragments.
      matchedRule?.topic !== 'anxiety' &&
      matchedRule?.topic !== 'stress' &&
      matchedRule?.topic !== 'grief' &&
      matchedRule?.topic !== 'sadness' &&
      matchedRule?.topic !== 'anger' &&
      matchedRule?.topic !== 'loneliness' &&
      matchedRule?.topic !== 'relationship' &&
      matchedRule?.topic !== 'work' &&
      matchedRule?.topic !== 'knowledge' &&
      matchedRule?.topic !== 'professional_boundary' &&
      this._lastKnowledgeTopic &&
      this.memory.turnCount - this._lastKnowledgeTurn <= 3 &&
      DaryaKnowledge &&
      (DaryaKnowledge.lookupGenre || DaryaKnowledge.lookupFragment)
    ) {
      const wordCount = matchingText.split(/\s+/u).filter(Boolean).length;
      // A follow-up is a short request fragment ("in horror genre please",
      // "زحل چطور؟", "بازی موبایل"). Reject longer sentences and
      // first-person emotional phrasing ("this situation is absolute
      // horror for me", "i feel horror") so an emotional topic word never
      // gets answered with a list or encyclopedia entry.
      const isShortFragment =
        wordCount <= 6 &&
        !/\b(?:i\s+(?:feel|am)|i'?m|feel(?:ing|s)?\b|scared|afraid|terrified|frightened|this is|that is|makes me|for me|to me|my)\b/iu.test(
          matchingText
        ) &&
        !/(?<![\p{L}۰-۹])(?:من|دارم|احساس|می‌کنم|برام|واسه|ترسیده|می‌ترسم|شدم|شده|این|وضعیت)(?![\p{L}۰-۹])/u.test(
          matchingText
        );
      let refined = null;
      if (isShortFragment) {
        // A game request must beat the movie-genre lookup: "horror game"
        // names a game genre, not a film. When the fragment mentions a
        // game, only the topic lookup runs.
        const wantsGames = /بازی|گیم|game/iu.test(matchingText);
        if (!wantsGames) {
          refined =
            DaryaKnowledge.lookupGenre?.(matchingText, this.lang.code) ||
            null;
        }
        refined =
          refined ||
          DaryaKnowledge.lookupFragment?.(matchingText, this.lang.code) ||
          null;
      }
      if (refined) {
        const followup =
          this.lang.code === 'fa'
            ? ' دوست داری همین موضوع را بیشتر بگردیم یا سؤال دیگری داری؟'
            : ' Want to go deeper on this, or is there another question?';
        reply = refined.text + followup;
        this._lastKnowledgeTopic = refined.topic;
        this._lastKnowledgeTurn = this.memory.turnCount;
        _overrideFired = true;
      }
    }

    // Darya-targeted harassment: insults, bullying, or sexual comments
    // directed at Darya by name get a calm boundary response instead of
    // the general frustration de-escalation. This check runs BEFORE the
    // general insult/frustration override so the targeted response takes
    // priority.
    if (
      !_safetyTurn &&
      !_minorAttractionTurn &&
      !isRepeatedGreeting &&
      !isSpamNoise &&
      // A repeated word inside a question usually means the user is
      // re-asking or testing, not dwelling on a single word: re-asking
      // "who made you?" must never be met with "you keep saying made".
      this.currentTurnDialogueAct !== 'question' &&
      this.lang.wordRepetitionResponses
    ) {
      const repetition = this._detectWordRepetition(matchingText);
      if (repetition) {
        const pool = this.lang.wordRepetitionResponses;
        const template = this._pickVaried(pool);
        reply = template
          .replace(/\{word\}/gu, repetition.word)
          .replace(/\{count\}/gu, String(repetition.count));
        _overrideFired = true;
      }
    }

    if (
      !_safetyTurn &&
      !_minorAttractionTurn &&
      // Turns where the user is clearly testing Darya ("تستت می‌کنم",
      // "just testing you") get the warm testInputResponses pool instead
      // of frustration de-escalation or harassment boundary-setting, so
      // an innocent testing message can never be misread as an attack.
      this.currentTurnDialogueAct !== 'test_input' &&
      // Turns where the user is giving Darya feedback about her own
      // behavior ("you keep quoting words", "be smarter", "understand
      // my meaning") deserve a humble acknowledgement, not a frustration
      // de-escalation, even when the message is worded harshly. The same
      // applies to self-improvement requests.
      matchedRule?.topic !== 'meta_feedback' &&
      matchedRule?.topic !== 'self_improvement' &&
      this.lang.frustrationResponses
    ) {
      // Check Darya-targeted harassment FIRST (more specific, different
      // response tone: calm boundary-setting vs frustration de-escalation).
      // This runs before the general insult check so harassment takes
      // priority without needing a separate override guard.
      const harassmentType = this._detectDaryaHarassment(rawText, matchingText);
      if (harassmentType === 'sexual' && this.lang.sexualHarassmentResponses) {
        reply = this._pickVaried(this.lang.sexualHarassmentResponses);
        _overrideFired = true;
      } else if (harassmentType === 'abuse') {
        reply = this._pickVaried(this.lang.daryaHarassmentResponses);
        _overrideFired = true;
      } else {
        const frustrationType = this._detectFrustration(rawText);
        const hasInsult = this.lang.insultPattern
          ? this.lang.insultPattern.test(matchingText)
          : false;
        if (frustrationType || hasInsult) {
          reply = this._pickVaried(this.lang.frustrationResponses);
          _overrideFired = true;
        }
      }
    }

    if (
      !_safetyTurn &&
      !_minorAttractionTurn &&
      !isRepeatedGreeting &&
      !isSpamNoise &&
      this.memory.turnCount >= 3 &&
      this.lang.teasingMockingResponses
    ) {
      if (this._detectTeasingOrMocking(rawText, matchingText)) {
        reply = this._pickVaried(this.lang.teasingMockingResponses);
        _overrideFired = true;
      }
    }

    if (
      !_safetyTurn &&
      !_minorAttractionTurn &&
      !isRepeatedGreeting &&
      !isSpamNoise &&
      // A matched how-are-you rule already answered the user's check-in
      // with its own warm pool; let that response stand instead of
      // replacing it with the well-being override (which, when the
      // question budget is spent, would collapse to a generic fallback
      // and produce the "no advice" repetition the user complained about).
      matchedRule?.topic !== 'smalltalk_howareyou' &&
      this.memory.turnCount >= WELLBEING_CHECK_TURNS &&
      this.lang.wellBeingResponses
    ) {
      if (this._detectWellBeingCheck(matchingText)) {
        // The well-being check-in is a deliberate caring override: it
        // must always deliver, never be swapped for a generic fallback
        // when the question budget is exhausted.
        reply = this._pickVaried(this.lang.wellBeingResponses, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        _overrideFired = true;
      }
    }

    const primaryEmotion = this._detectPrimaryEmotion(matchingText);
    if (
      !_overrideFired &&
      !this._lightPositiveFired &&
      primaryEmotion !== 'neutral' &&
      this.currentTurnDialogueAct !== 'safety' &&
      // Gratitude turns are light and already warm: prepending an
      // empathy prefix (e.g. the hurt prefix on 'درد نکنه' inside
      // 'دستت درد نکنه') would misread a thank-you as distress.
      this.currentTurnDialogueAct !== 'gratitude' &&
      // Testing turns get the warm testInputResponses pool; a distress
      // prefix (e.g. on a message that denies being angry) would
      // contradict the user's own words.
      this.currentTurnDialogueAct !== 'test_input' &&
      // App/website feedback ("the theme looks broken", "the waves are
      // too small") is meta-talk about the app, not a personal emotional
      // disclosure: a hurt prefix would read as mock sympathy.
      matchedRule?.topic !== 'app_feedback' &&
      // Emotional-disclosure rules (anxiety, sadness, anger, grief, joy,
      // etc.) ship pool lines that already name the feeling ("I can hear
      // the sadness in what you are sharing", "خوشحالم که این حس خوب
      // را تجربه می‌کنید"). Prepending the generic empathy prefix on top
      // would double the acknowledgment and read as noise.
      !LIVED_TOPICS.has(matchedRule?.topic) &&
      matchedRule?.topic !== 'joy' &&
      !blendKey &&
      !isRepeatedGreeting &&
      !isSpamNoise
    ) {
      reply = this._calibrateEmotionalTone(reply, primaryEmotion);
    }

    if (
      !_safetyTurn &&
      !_minorAttractionTurn &&
      !isRepeatedGreeting &&
      !isSpamNoise &&
      this.memory.turnCount >= BOREDOM_MIN_TURNS &&
      this.memory.turnCount % BOREDOM_CHECK_INTERVAL === 0 &&
      this.lang.boredomResponses &&
      this.currentTurnSeriousness < MODERATE_SERIOUSNESS_THRESHOLD
    ) {
      const recentUtterances = this.memory.recentUtterances.slice(-3);
      const allBrief = recentUtterances.every(
        (u) => u.split(/\s+/u).filter(Boolean).length <= 3
      );
      if (allBrief && Math.random() < BOREDOM_SKIP_CHANCE) {
        reply = this._pickVaried(this.lang.boredomResponses);
        _overrideFired = true;
      }
    }

    if (this.currentTurnDialogueAct !== 'acknowledgement') {
      this.memory.consecutiveAcknowledgements = 0;
    }

    // Report entity memory with current topic and emotional context for
    // future callbacks. The line is long but remains readable as-is.

    this.memory.rememberEntities(entities, this.memory.turnCount, {
      topics: this.currentTurnTopics,
      seriousness: this.currentTurnSeriousness
    });

    const isSafetyTurn =
      (matchedRule && matchedRule.topic === 'safety') || _minorAttractionTurn;
    if (
      !isSafetyTurn &&
      this.memory.isInDistressStreak() &&
      !this.memory.distressNudgeGiven
    ) {
      this.memory.distressNudgeGiven = true;
      // The nudge is a caring statement, not a question, and must always
      // be delivered: pass the question budget so "چند" (a few) in the
      // line text is never misread as the question word "چند" (how many)
      // and the nudge silently swapped for a generic fallback.
      reply = this._pickVaried(this.lang.distressNudges, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      });
      _overrideFired = true;
    } else if (!this.memory.isInDistressStreak()) {
      this.memory.distressNudgeGiven = false;
    }

    if (!isSafetyTurn && _overrideFired) {
      // Smart override already set a precise reply. Skip human-tone coloring.
    } else if (!isSafetyTurn) {
      reply = this._maybeHumanTone(reply, normalized);
    }
    if (
      !isSafetyTurn &&
      !_overrideFired &&
      !this._lightPositiveFired &&
      this._shouldAddHumanTouch()
    ) {
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
      ...lang.exitKeywords.map((k) =>
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
      return matchedRule.topic === 'greeting' ? 'greeting' : 'topic-reflection';
    }
    if (matchingText && this.lang.questionPattern.test(matchingText)) {
      return 'question-acknowledgement';
    }
    if (this.canHumorFire()) {
      return 'light-warmth';
    }
    return 'contextual-fallback';
  }

  describeSelf() {
    return {
      name: this.lang.botName,
      approach: this.lang.selfAwareness.approach,
      boundaries: this.lang.selfAwareness.boundaries,
      memory: this.lang.selfAwareness.memory
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
  }

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
  }

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
        (topic) => this.lang.topicSeriousness?.[topic] ?? SERIOUSNESS_TOPIC_FLOOR
      )
    );
    return Math.min(
      SERIOUSNESS_CAP,
      SERIOUSNESS_TOPIC_FLOOR + seriousness * SERIOUSNESS_WEIGHT
    );
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
      ? ENTITY_CONFIDENCE_DECAY_RECENT_BASE - age * ENTITY_CONFIDENCE_DECAY_RECENT_RATE
      : ENTITY_CONFIDENCE_DECAY_STALE_BASE - age * ENTITY_CONFIDENCE_DECAY_STALE_RATE;
    if (confidence < ENTITY_CONFIDENCE_THRESHOLD) {
      return null;
    }
    return {
      topic: subject.topic,
      entityRefs: [...subject.entityRefs],
      confidence
    };
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
    if (recentUtterances.length < REPEATED_GREETING_THRESHOLD) {
      return false;
    }
    const greetingPatterns = this.lang.rules
      .filter((r) => r.topic === 'greeting')
      .map((r) => r.pattern);
    if (!greetingPatterns.length) {
      return false;
    }
    let greetingCount = 0;
    const currentIsGreeting = greetingPatterns.some((p) => {
      p.lastIndex = 0;
      return p.test(normalizedText);
    });
    if (!currentIsGreeting) {
      return false;
    }
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
    if (text.length < SPAM_MIN_LENGTH) {
      return false;
    }
    if (/^\p{N}+$/u.test(text) && text.length < 5) {
      return true;
    }
    const chars = [...text].filter((ch) => /\p{L}/u.test(ch));
    if (chars.length < 3) {
      return false;
    }
    const uniqueChars = new Set(chars.map((c) => c.toLowerCase()));
    const uniqueRatio = uniqueChars.size / chars.length;
    if (uniqueRatio < SPAM_MAX_UNIQUE_RATIO && text.length < 12) {
      return true;
    }
    if (uniqueChars.size <= 2 && text.length > 4) {
      return true;
    }
    const words = text.split(/\s+/u).filter(Boolean);
    if (
      words.length <= 2 &&
      this.lang.stopWords &&
      words.every((w) => this.lang.stopWords.has(w.toLowerCase()))
    ) {
      return false;
    }
    return false;
  }

  _isAmbiguousInput(normalizedText) {
    const wordCount = normalizedText.split(/\s+/u).filter(Boolean).length;
    return wordCount <= 2 && normalizedText.length < 10;
  }

  /**
   * Detects a message made only of smileys or emoji (":)", ":))))) ",
   * "🙂", "🔥"). These deserve a warm light reply, never the ambiguous
   * "explain more" line or a heavy therapeutic prefix.
   * @param {string} rawText - The raw user input (pre-normalization)
   * @returns {boolean}
   */
  _isPureEmoji(rawText) {
    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return false;
    }
    // ASCII smileys and text faces
    if (/^[:;=xX][\-]?[()DdpPoO*\^]{1,12}$/u.test(trimmed)) {
      return true;
    }
    // Unicode emoji-only input (emoji with optional ZWJ and variation
    // selectors, plus surrounding whitespace)
    return /^[\p{Emoji}\u200d\ufe0f\s]+$/u.test(trimmed);
  }

  _detectWordRepetition(normalizedText) {
    const recent = [...this.memory.recentUtterances];
    const stopWords =
      this.lang.stopWords ||
      new Set([
        'is',
        'are',
        'am',
        'be',
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
        'its'
      ]);
    const pastWordCounts = new Map();
    for (const utterance of recent) {
      const clean = String(utterance).replace(
        /[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu,
        ' '
      );
      const words = clean.toLowerCase().split(/\s+/u).filter(Boolean);
      for (const word of words) {
        if (word.length < 2 || stopWords.has(word)) {
          continue;
        }
        pastWordCounts.set(word, (pastWordCounts.get(word) || 0) + 1);
      }
    }
    const currentClean = String(normalizedText || '').replace(
      /[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu,
      ' '
    );
    const currentWords = currentClean
      .toLowerCase()
      .split(/\s+/u)
      .filter(Boolean);
    const currentWordSet = new Set(currentWords);
    let mostRepeated = null;
    let maxCount = 0;
    for (const [word, count] of pastWordCounts) {
      if (
        count > maxCount &&
        count >= WORD_REPETITION_THRESHOLD &&
        currentWordSet.has(word)
      ) {
        mostRepeated = word;
        maxCount = count;
      }
    }
    return mostRepeated ? { word: mostRepeated, count: maxCount } : null;
  }

  _detectFrustration(rawText) {
    if (/!{3,}/.test(rawText)) {
      return 'exclamation';
    }
    if (/\?{2,}/.test(rawText)) {
      return 'question';
    }
    if (/[!?]{3,}/.test(rawText)) {
      return 'exclamation';
    }
    return null;
  }

  _detectTeasingOrMocking(rawText, matchingText) {
    const sarcasticPraise =
    // eslint-disable-next-line max-len
      /(?:you'?re\s+(?:so|very|really)\s+(?:smart|clever|funny|helpful|wise|useful|intelligent|brilliant|genius)|what a genius|wow\s+(?:you'?re|so)|such a genius|great advice|very helpful|thanks a lot)\b/i;

    const mockAgree =
      /\b(?:yeah right|sure (?:you are|you do|bot)|whatever you say|if you say so|right ok|ok sure|as if|oh please)\b/i;
    const dismissSignal = /(?:pfft|meh|tch|pshaw|bah|hmph)/i;

    const faSarcasm =
    // eslint-disable-next-line max-len
      /(?:چه (?:باهوش|خوب|عاقل|دانا|مهربان|صبور|باحال|بامزه|باحوصله|باهوشی|باهوشید)،|آفرین به (?:خودت|شما|خودتون)|به به|احسنت|مرسی که اینقدر (?:باهوشی|کمک کردی|به دردم خوردی)|به درک|هر چی تو بگی|چشم منتظر|خوب خوب تو راست میگی|باشه باشه تو بردی)/iu;
    const hasExcessivePunct = /!{3,}|\?{3,}|!\?|\?!|([.!?]){3,}/.test(rawText);
    const hasSarcasticPraise =
      sarcasticPraise.test(rawText) && hasExcessivePunct;
    const hasMockAgree = mockAgree.test(matchingText);
    const hasDismissSignal = dismissSignal.test(rawText);
    const hasFaSarcasm = faSarcasm.test(rawText);
    const hasSarcasticPraiseBare =
      sarcasticPraise.test(matchingText) &&
      this.memory.turnCount >= 2 &&
      this.memory.recentTopics
        .slice(-2)
        .some(
          (topic) =>
            (this.lang.topicSeriousness?.[topic] || SERIOUSNESS_TOPIC_FLOOR) >=
            SERIOUS_TURN_THRESHOLD
        );
    let signals = 0;
    if (hasSarcasticPraise) {
      signals += 1;
    }
    if (hasMockAgree) {
      signals += 1;
    }
    if (hasDismissSignal) {
      signals += 1;
    }
    if (hasSarcasticPraiseBare) {
      signals += 1;
    }
    if (hasFaSarcasm) {
      signals += 2;
    }
    return signals >= TEASING_MOCK_THRESHOLD;
  }

  _detectWellBeingCheck(matchingText) {
    const wellBeingPattern =
      this.lang.wellBeingPattern ||
      /\b(?:how (?:are you|are you doing|you doing|have you been)|you (?:ok|alright|good)|what about you)\b/i;
    const isWellBeingQ = wellBeingPattern.test(matchingText);
    if (!isWellBeingQ) {
      return false;
    }
    if (this.memory.turnCount < WELLBEING_CHECK_TURNS) {
      return false;
    }
    const recentSeriousness = this.memory.seriousnessHistory.slice(
      -WELLBEING_CHECK_TURNS
    );
    const avgSeriousness = recentSeriousness.length
      ? recentSeriousness.reduce(function (a, b) {
        return a + b;
      }, 0) / recentSeriousness.length
      : 0;
    // Fire the well-being response when:
    //   1. The conversation has been serious (avgSeriousness >= 0.4), OR
    //   2. The last turn needed care (direct distress signal), OR
    //   3. This is a direct question ('how are you?', 'خوبی', etc.) in
    //      ANY conversation, not just serious ones. The user asking
    //      about Darya's state is meaningful regardless of the tone.
    const isDirectWellBeingQuestion =
    // eslint-disable-next-line max-len
      /(?:^|\s)(?:how are you|how are you doing|are you (?:ok|alright|good)|what about you|خوبی|چطوری|حالت چطور|حالت خوبه)(?:\s|$|[!?.؟])/iu.test(
        matchingText
      );
    return (
      avgSeriousness >= MODERATE_SERIOUSNESS_THRESHOLD ||
      this.lastTurnNeedsCare ||
      isDirectWellBeingQuestion
    );
  }

  _isAcknowledgement(text) {
    const words = text.trim().split(/\s+/u).filter(Boolean);
    if (words.length > ACKNOWLEDGEMENT_THRESHOLD) {
      return false;
    }
    // The core acknowledgement word may be followed by a few common
    // intensifiers/agreement tags ("yeah exactly", "آره دقیقا") so short
    // confirmations still count as acknowledgements rather than falling
    // into the ambiguous-input pool.
    const enAck =
    // eslint-disable-next-line max-len
      /^(?:ok|okay|k|sure|right|yeah|yep|i see|got it|understood|makes sense|noted|cool|fine|alright)(?:\s+(?:yeah|yep|sure|right|exactly|definitely|totally|really|absolutely)){0,2}$/iu;
    const faAck =
    // eslint-disable-next-line max-len
      /^(?:باشه|خب|خوب|متوجه|آره|اره|درست|چشم|بله|شه|اوه|آها|آحم|دقیقا|دقیقاً|واقعا|واقعاً|حتما|حتماً)(?:\s+(?:آره|اره|دقیقا|دقیقاً|واقعا|واقعاً|حتما|حتماً|بله|خب|باشه|درسته|درست)){0,2}$/iu;
    return enAck.test(text.trim()) || faAck.test(text.trim());
  }

  /**
   * Detects light, positive casual statements ("just had the best cup of
   * coffee", "امروز صبح یه قهوه عالی خوردم"). These unmatched statements
   * should get a light warm reply from the smalltalk pool instead of the
   * heavy therapeutic generic fallback, which reads as robotic after a
   * cheerful, low-stakes remark.
   * @param {string} text - Normalized user input
   * @returns {boolean}
   */
  _isLightPositiveCasual(text) {
    if (!text || this.lang.questionPattern?.test(text)) {
      return false;
    }
    if (this.currentTurnSeriousness >= MODERATE_SERIOUSNESS_THRESHOLD) {
      return false;
    }
    const words = text.split(/\s+/u).filter(Boolean);
    if (words.length > 12) {
      return false;
    }
    const score = scoreSentiment(text, this.lang.sentimentLexicon);
    if (score > 0) {
      return true;
    }
    const lightPositive =
      this.lang.code === 'fa'
        ? // eslint-disable-next-line max-len
          /(?<!\p{L})(?:عالی|قشنگ|خوشحال|خوب گذشت|خوش گذشت|لذت بردم|دوست داشتم|بهترین|خوشمزه|فوق\u200cالعاده|باحال|کیف کردم)(?!\p{L})/u
        : // eslint-disable-next-line max-len
          /\b(?:best|great|awesome|amazing|wonderful|lovely|delicious|enjoyed|fantastic|nice day|so good|fun|good day)\b/i;
    return lightPositive.test(text);
  }

  _isEmotionalStatement(text) {
    const score = scoreSentiment(text, this.lang.sentimentLexicon);
    return Math.abs(score) >= 2;
  }

  _isSubstantiveAnswer(text) {
    const words = text.trim().split(/\s+/u).filter(Boolean);
    if (words.length < SUBSTANTIVE_ANSWER_MIN_WORDS) {
      return false;
    }
    if (this._isAcknowledgement(text)) {
      return false;
    }
    if (this._isSpamOrNoise(text)) {
      return false;
    }
    return true;
  }

  _isMixedLanguage(text) {
    const letters = [...String(text)].filter((ch) => /\p{L}/u.test(ch));
    if (letters.length < 4) {
      return false;
    }
    const foreignLetters = letters.filter(
      (ch) => !this.lang.scriptRange.test(ch)
    );
    return (
      foreignLetters.length >= MIXED_SCRIPT_FOREIGN_MIN &&
      foreignLetters.length / letters.length >= MIXED_SCRIPT_FOREIGN_RATIO
    );
  }

  // ======================================================================
  // Darya-targeted harassment detection
  //
  // Detects insults, bullying, and inappropriate sexual comments that
  // are specifically directed at Darya (by name or as "you"). These are
  // distinct from general insults (which are handled by frustrationResponses)
  // because they target the companion herself and require a different
  // kind of response: calm boundary-setting rather than de-escalation.
  //
  // Two patterns are checked:
  //   1. daryaHarassmentPattern - name-calling, bullying, insults at Darya
  //   2. sexualHarassmentPattern - inappropriate/sexual comments directed at Darya
  //
  // When detected, the engine responds with a firm but calm boundary
  // response from the dedicated daryaHarassmentResponses pool, which
  // acknowledges the attack without engaging with it. Sexual harassment
  // responses set a firmer boundary and do not invite further discussion.
  // ======================================================================

  _detectDaryaHarassment(rawText, matchingText) {
    if (
      this.lang.daryaHarassmentPattern &&
      this.lang.daryaHarassmentPattern.test(matchingText)
    ) {
      return 'abuse';
    }
    if (
      this.lang.sexualHarassmentPattern &&
      this.lang.sexualHarassmentPattern.test(matchingText)
    ) {
      return 'sexual';
    }
    return null;
  }

  /**
   * Detects an adult disclosing sexual or romantic attraction toward a
   * minor (someone under 18). This is a critical child-safety case, so
   * the reply must be calm, non-shaming, and point to professional
   * help, and it must never be clobbered by a later override.
   *
   * The check requires three signals to align before it fires:
   *  1. Adult context: an explicit adult identity, a stated age of 18+
   *     (selfAge), or clearly sexual phrasing (strongSexual), which only
   *     makes sense from an adult perspective in this framing.
   *  2. Attraction vocabulary: crush, feelings for, attracted to, in love
   *     with, or a sexual phrasing (attraction / strongSexual).
   *  3. A minor-age marker: teen/teenager, minor, under 18, 13-17 years
   *     old (minor).
   *
   * The familial signal blocks the ambiguous attraction words when the
   * text is plainly about a relative ("I love my daughter", "دخترم را
   * دوست دارم"), so ordinary family affection never triggers it. A
   * teenager's own peer crush ("I'm 15 and I like a 17-year-old") also
   * stays quiet because the selfAge capture (15) fails the adult check.
   *
   * @param {string} text - The normalized matching text.
   * @returns {boolean} True when the protected reply must be delivered.
   */
  _detectMinorAttraction(text) {
    const signals = this.lang.minorAttractionSignals;
    if (!signals) {
      return false;
    }

    // Ambiguous attraction words about a relative are ordinary affection
    // ("I love my daughter"), never a disclosure. Only a clearly sexual
    // phrasing can bypass the familial block.
    if (signals.familial && signals.familial.test(text)) {
      if (!(signals.strongSexual && signals.strongSexual.test(text))) {
        return false;
      }
    }

    const hasAttraction =
      (signals.attraction && signals.attraction.test(text)) ||
      (signals.strongSexual && signals.strongSexual.test(text));
    if (!hasAttraction) {
      return false;
    }

    const hasMinor = signals.minor && signals.minor.test(text);
    if (!hasMinor) {
      return false;
    }

    // Adult context. A self-reported age under 18 (e.g. a 15-year-old
    // confessing a crush on a 17-year-old) fails the gate and stays a
    // normal peer conversation.
    if (signals.adultIdentity && signals.adultIdentity.test(text)) {
      return true;
    }
    const ageMatch = signals.selfAge && text.match(signals.selfAge);
    if (ageMatch) {
      const raw = (ageMatch[1] || ageMatch[2] || '').replace(/[۰-۹]/g, (d) =>
        String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      );
      if (Number(raw) >= 18) {
        return true;
      }
    }
    if (signals.strongSexual && signals.strongSexual.test(text)) {
      return true;
    }
    return false;
  }

  // ======================================================================
  // Emotion detection
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
      {
        name: 'hurt',
        patterns:
          /\b(?:hurt(?:s)?|pain(?:ful)?|broken|wounded)\b|(?:شکسته|آسیب|درد)/iu
      },
      {
        name: 'confused',
        patterns:
          /\b(?:confused|lost|don'?t understand|don'?t know)\b|(?:گیج|گم شدم|نمی‌فهمم|نمی‌دونم|سرگردان|نامشخص)/iu
      },
      {
        name: 'excited',
        patterns:
          /\b(?:excited|thrilled|amazing|awesome|great news)\b|(?:هیجان|عالی|فوق‌العاده|خارق‌العاده)/iu
      },
      {
        name: 'angry',
        patterns:
          /\b(?:angry|furious|pissed|hate|mad|annoyed)\b|(?:عصبانی|خشم|نفرت|کفری|عصبی)/iu
      },
      {
        name: 'grieving',
        patterns:
          /\b(?:grief|loss|died|passed away|gone|miss(?:ing)?|mourn)\b|(?:فقدان|فوت|از دست دادن|داغ|سوگ)/iu
      },
      {
        name: 'fear',
        patterns:
        // eslint-disable-next-line max-len
          /\b(?:terrified|frightened|scared\s+(?:to\s+death|stiff|shitless|witless)|panic\s+(?:attack|mode)|phobia|horror|shook)\b|(?:لرزیدن|هراس|فوبیا|ترس\s+مرگ|شوکه|دلهره)/iu
      },
      {
        name: 'anxious',
        patterns:
          /\b(?:anxious|worry|worried|panic|scared|afraid|nervous)\b|(?:نگران|اضطراب|ترس|دلشوره|وحشت)/iu
      },
      {
        name: 'anxious',
        patterns:
        // eslint-disable-next-line max-len
          /\b(?:heart\s+(?:racing|pounding|beating)|sweating|shaking|trembling|chest\s+(?:tight|heavy)|short\s+of\s+(?:breath|breathe)|palpitations|dizzy|nausea)\b/iu
      },
      {
        name: 'sad',
        patterns:
          /\b(?:sad|depressed|down|unhappy|miserable|empty|numb)\b|(?:غمگین|ناراحت|افسرده|بی‌حال)/iu
      },
      {
        name: 'hopeless',
        patterns:
          /\b(?:hopeless|despair|giving up|can'?t go on|no point)\b|(?:ناشاد|ناامید|بی‌امید)/iu
      },
      {
        name: 'overwhelmed',
        patterns:
          /\b(?:overwhelmed|drowning|can'?t cope|too much|suffocating)\b|(?:درمانده|غرق|طاقت فرسا)/iu
      },
      {
        name: 'ashamed',
        patterns:
          /\b(?:ashamed|embarrassed|guilty|humiliated)\b|(?:شرمنده|خجالت|گناهکار)/iu
      },
      {
        name: 'jealous',
        patterns: /\b(?:jealous|envious|resentful)\b|(?:حسود|حسرت)/iu
      },
      {
        name: 'hopeful',
        patterns: /\b(?:hopeful|optimistic|encouraged)\b|(?:امیدوار|خوشبین)/iu
      },
      {
        name: 'grateful',
        patterns:
          /\b(?:grateful|thankful|blessed|appreciative)\b|(?:سپاسگزار|قدردان|شکرگزار)/iu
      }
    ];
    for (const emotion of emotions) {
      if (emotion.patterns.test(text)) {
        return emotion.name;
      }
    }
    const score = scoreSentiment(text, this.lang.sentimentLexicon);
    if (score <= -2) {
      return 'sad';
    }
    if (score >= 2) {
      return 'happy';
    }
    return 'neutral';
  }

  _detectPrimaryEmotion(text) {
    this.lastDetectedEmotion = this._computePrimaryEmotion(text);
    return this.lastDetectedEmotion;
  }

  _calibrateEmotionalTone(reply, detectedEmotion) {
    const calibration = this.lang.emotionCalibration;
    if (!calibration || !calibration[detectedEmotion]) {
      return reply;
    }
    if (Math.random() > EMOTION_PREFIX_CHANCE) {
      return reply;
    }
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
    if (!this._isMixedLanguage(text)) {
      return null;
    }
    if (Math.random() > MIXED_LANGUAGE_REDIRECT_CHANCE) {
      return null;
    }
    const pool = Array.isArray(this.lang.mixedLanguageResponses)
      ? this.lang.mixedLanguageResponses
      : null;
    return pool && pool.length ? this._pickVaried(pool) : null;
  }

  _phaseForTurn(strategy, seriousness) {
    if (strategy === 'safety') {
      return 'safetySupport';
    }
    if (strategy === 'context-reference') {
      return 'contextualContinuation';
    }
    if (
      strategy === 'topic-question' ||
      strategy === 'question-acknowledgement'
    ) {
      return 'clarifying';
    }
    if (seriousness >= SERIOUS_TURN_THRESHOLD) {
      return 'reflecting';
    }
    return this.memory.turnCount <= 1 ? 'greeting' : 'listening';
  }

  _seriousnessForTurn(topics) {
    const values = (topics || []).map(
      (topic) => this.lang.topicSeriousness?.[topic] ?? SERIOUSNESS_TOPIC_FLOOR
    );
    const current = values.length ? Math.max(...values) : SERIOUSNESS_WEIGHT;
    const recent = this.memory.seriousnessHistory.slice(-2);
    const average = recent.length
      ? recent.reduce((sum, v) => sum + v, 0) / recent.length
      : 0;
    return Math.max(current, average);
  }

  _blendKey(topics) {
    if (!topics || topics.length < 2) {
      return null;
    }
    const pairs = [
      ['sleep', 'anxiety'],
      ['work', 'anger'],
      ['family', 'sadness'],
      ['loneliness', 'sleep'],
      ['joy', 'gratitude'],
      ['anxiety', 'loneliness'],
      ['health', 'anxiety'],
      ['grief', 'anger']
    ];
    const found = pairs.find((pair) =>
      pair.every((topic) => topics.includes(topic))
    );
    return found ? `blend_${found.join('_')}` : null;
  }

  canHumorFire() {
    return (
      this.memory.turnCount >= 3 &&
      this.currentTurnSeriousness < SERIOUS_TURN_THRESHOLD &&
      !this.lastTurnNeedsCare
    );
  }

  _canAskTopicQuestion(topic) {
    const pool = this.lang.topicSpecificQuestions?.[topic];
    if (!pool || !this.lang.questionTopics?.has(topic)) {
      return false;
    }
    if (
      this.currentTurnDialogueAct === 'question' ||
      this.currentTurnQuestionNeed < MODERATE_SERIOUSNESS_THRESHOLD
    ) {
      return false;
    }
    const recent = this.memory.askedQuestionTurns.filter(
      (turn) => this.memory.turnCount - turn < QUESTION_BUDGET_WINDOW
    );
    return (
      recent.length < QUESTION_BUDGET_LIMIT &&
      this.memory.consecutiveQuestions < CONSECUTIVE_QUESTION_LIMIT
    );
  }

  // ======================================================================
  // Human-tone coloring
  // ======================================================================

  _maybeHumanTone(reply, normalized) {
    if (this._lightPositiveFired) {
      // The reply already came from the smalltalk pool for a light,
      // positive casual statement. Further coloring (humor, warmth,
      // smalltalk replacement) would stack tones and read as robotic.
      return reply;
    }
    if (this.currentTurnDialogueAct === 'greeting') {
      // Greeting replies already carry the right warm tone in their own
      // pool. Humor or warmth coloring would overwrite the mirrored
      // greeting word ("Hello." -> "That made me smile."), so leave the
      // greeting reply exactly as the pool intended.
      return reply;
    }
    if (this.currentTurnDialogueAct === 'test_input') {
      // Testing turns get the warm testInputResponses pool. Replacing
      // them with random humor or a heavy warmth prefix would misread
      // a playful "I am testing you" as a topic to joke over.
      return reply;
    }
    // Light, already-warm rule topics (smalltalk pools, how-are-you,
    // gratitude, app feedback, joy) ship their own warm pool lines.
    // Prepending a generic warmth line ("You don't have to solve it all
    // at once") before a "I'm doing well, thank you" or a playful
    // smalltalk reply stacks tones and reads as noise.
    const alreadyWarmTopic = this.currentTurnTopics.some((topic) =>
      topic.startsWith('smalltalk_') ||
      topic === 'gratitude' ||
      topic === 'app_feedback' ||
      topic === 'joy' ||
      // The meta-topic pools below ship their own warm lines, so humor
      // or warmth coloring would stack tones and read as robotic.
      topic === 'word_meaning' ||
      topic === 'ask_me_question' ||
      topic === 'self_improvement' ||
      topic === 'what_do_i_do' ||
      topic === 'unsure_topic' ||
      topic === 'apology' ||
      topic === 'meta_feedback' ||
      topic === 'about_eliza' ||
      topic === 'compliment_darya' ||
      topic === 'misread_correction'
    );
    if (alreadyWarmTopic) {
      return reply;
    }
    if (this.canHumorFire() && Math.random() < HUMOR_CHANCE) {
      return this._pickVaried(this.lang.humor || [reply]);
    }
    if (
      // Warmth lines are heavy statements ("این موضوع واقعاً سنگین
      // است") that only fit turns with an actual topic. Without this
      // guard a topic-less light turn ("چی رو؟!", ":)") could get a
      // misplaced "this feels heavy" prefix.
      this.currentTurnTopics.length > 0 &&
      this.currentTurnSeriousness >= WARMTH_MIN_SERIOUSNESS &&
      this.currentTurnSeriousness < WARMTH_MAX_SERIOUSNESS &&
      this.memory.turnCount - this.memory.lastWarmthTurn >= WARMTH_MIN_TURN_GAP &&
      Math.random() < WARMTH_CHANCE
    ) {
      this.memory.lastWarmthTurn = this.memory.turnCount;
      return `${this._pickVaried(this.lang.warmth || [])} ${reply}`.trim();
    }
    if (
      this.memory.lightStreak >= SMALLTALK_MIN_LIGHT_STREAK &&
      !this.lastTurnNeedsCare &&
      this.memory.turnCount % SMALLTALK_TURN_INTERVAL === 0 &&
      Math.random() < SMALLTALK_CHANCE &&
      normalized &&
      !this.lang.questionPattern.test(normalized)
    ) {
      return this._pickVaried(this.lang.smalltalk || [reply]);
    }
    return reply;
  }

  _shouldAddHumanTouch() {
    return (
      this.memory.turnCount > 0 &&
      this.memory.turnCount % HUMAN_TOUCH_INTERVAL === 0 &&
      this.currentTurnSeriousness < SERIOUS_TURN_THRESHOLD &&
      this.memory
        .eligibleNamedEntities(this.entityCallbackThreshold)
        .some(
          (entity) =>
            entity.type !== 'time' &&
            entity.lastMentionTurn < this.memory.turnCount
        )
    );
  }

  _humanTouchLine() {
    const entity = this.memory
      .eligibleNamedEntities(this.entityCallbackThreshold)
      .find(
        (item) =>
          item.type !== 'time' &&
          item.lastMentionTurn < this.memory.turnCount
      );
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
      pool =
        roll < OPENING_RETURNING_PRIMARY
          ? this.lang.greetingsReturning || this.lang.greentingsReturning
          : roll < OPENING_RETURNING_SECONDARY
            ? this.lang.greetingsInviting || this.lang.greentingsInviting
            : this.lang.greetingsOpen || this.lang.greentingsOpen;
    } else {
      pool =
        roll < OPENING_NEW_PRIMARY
          ? this.lang.greetingsInviting || this.lang.greentingsInviting
          : roll < OPENING_RETURNING_SECONDARY
            ? this.lang.greetingsOpen || this.lang.greentingsOpen
            : this.lang.greetingsReturning || this.lang.greentingsReturning;
    }
    return this._pickVaried(pool || this.lang.greetings, {
      trackQuestions: false
    });
  }

  _advanceConversationPhase(userInput) {
    const wordCount = String(userInput || '')
      .trim()
      .split(/\s+/u)
      .filter(Boolean).length;
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
    if (
      this.conversationPhase === 'new' &&
      this.lang.greetingsPhase1 &&
      this.lang.greetingsPhase1.length
    ) {
      return this._pickVaried(this.lang.greetingsPhase1, {
        trackQuestions: false
      });
    }
    if (
      this.conversationPhase === 'orienting' &&
      this.lang.greetingsPhase2 &&
      this.lang.greetingsPhase2.length
    ) {
      return this._pickVaried(this.lang.greetingsPhase2, {
        trackQuestions: false
      });
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

  /**
   * Returns true when the input reads as an explicit knowledge request
   * ("درباره استرس توضیح بده", "Tell me about stress management")
   * rather than a personal disclosure. Used by _preferLivedRuleOverKnowledge
   * to keep genuine knowledge queries on the knowledge shelf.
   * @param {string} text - Normalized matching text
   * @returns {boolean}
   */
  _isKnowledgeRequest(text) {
    // eslint-disable-next-line max-len
    const en = /\b(?:tell me|explain|how (?:can|do|should|to|long|much|many)|advice|tips|learn|what (?:is|are)|who (?:is|was)|teach me|guide me|ways? to|strategies? for|manage|practice|recommend|suggest|movies?|games?|series|career|major|profession|about)\b/i;
    // Only genre words that commonly appear without a فیلم/سریال prefix
    // are listed here (انیمیشن, مستند). Thriller queries ("فیلم هیجانی",
    // "تریلر معرفی کن") already carry فیلم/پیشنهاد/معرفی, and standalone
    // "تریلر" is ambiguous with "trailer", so it stays out on purpose.
    // eslint-disable-next-line max-len
    const fa = /(?:درباره|راجع به|توضیح|چطور|چگونه|چیست|چیه|چند|چقدر|کجاست|کجا|کی بود|راهنمایی|یاد بگیرم|کنترل کنم|مدیریت کنم|برام بگو|نظرت|روش|آموزش|معرفی|پیشنهاد|فیلم|سریال|بازی|شغل|رشته|دانشگاه|انیمیشن|مستند)/u;
    return en.test(text) || fa.test(text);
  }

  /**
   * Reorders rule matches so a lived-experience rule (anxiety, stress,
   * sadness, anger, grief, loneliness, relationship, work) beats the broad
   * knowledge rule for emotional disclosures, while explicit knowledge
   * requests keep the knowledge routing. The knowledge regex deliberately
   * includes bare emotion words ("استرس", "overwhelmed") so it can answer
   * "How can I manage stress?", but those same words appear in personal
   * statements ("امروز احساس استرس دارم") where a lecture would feel
   * dismissive.
   * @param {Array} matches - Rule matches sorted by priority descending
   * @param {string} text - Normalized matching text
   * @returns {Array} Reordered matches
   */
  _preferLivedRuleOverKnowledge(matches, text) {
    if (matches[0]?.rule.topic !== 'knowledge') {
      return matches;
    }
    if (this._isKnowledgeRequest(text)) {
      return matches;
    }
    const lived = matches.find((match) => LIVED_TOPICS.has(match.rule.topic));
    if (!lived) {
      return matches;
    }
    return [lived, ...matches.filter((match) => match !== lived)];
  }

  _matchRules(normalizedText) {
    const matches = [];
    for (const currentRule of this.rules) {
      const match = currentRule.pattern.exec(normalizedText);
      if (!match) {
        continue;
      }

      let captured = '';
      for (let i = match.length - 1; i >= 1; i -= 1) {
        const group = match[i];
        if (group) {
          const candidate = group
            .trim()
            .replace(/^[.,،!؟\s]+|[.,،!؟\s]+$/g, '');
          if (
            candidate &&
            !this.lang.trivialCaptures.has(candidate.toLowerCase())
          ) {
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
    if (
      matchedRule.topic === 'professional_boundary' &&
      this.lang.professionalBoundary
    ) {
      return this._pickVaried(this.lang.professionalBoundary);
    }
    if (matchedRule.topic === 'recap') {
      return buildRecap(this);
    }
    if (matchedRule.topic === 'knowledge' && DaryaKnowledge) {
      const knowledgeText = this._currentNormalizedInput || captured || '';
      // The factual layer answers concrete questions ("tell me about
      // Jupiter", "فیزیک کوانتوم چیه") with a direct explanation. When
      // it has a confident match it wins over the reflective shelf, so
      // science and world-knowledge questions never bounce to a vague
      // "let us sit with it" line. The shelf below remains the fallback
      // for emotional and growth topics.
      const factual = DaryaKnowledge.lookup
        ? DaryaKnowledge.lookup(knowledgeText, this.lang.code)
        : null;
      if (factual && factual.confidence >= KNOWLEDGE_OVERRIDE_CONFIDENCE) {
        const factualReply = factual.text;
        const factualFollowup =
          this.lang.code === 'fa'
            ? ' دوست داری بیشتر درباره‌اش بگویی یا سؤال دیگری داری؟'
            : ' Would you like to go deeper, or is there another question?';
        this._lastKnowledgeTopic = factual.topic;
        this._lastKnowledgeTurn = this.memory.turnCount;
        return factualReply + factualFollowup;
      }
      const domainHints =
        this.lang.code === 'fa'
          ? {
            thinkers: [
              'سقراط',
              'رواقی',
              'ارسطو',
              'یونگ',
              'نیچه',
              'گاندی',
              'ماندلا',
              'چرچیل',
              'زرتشت'
            ],
            philosophy: ['فلسفه', 'فلسفی'],
            focus: ['تمرکز'],
            learning: ['یاد'],
            communication: ['ارتباط'],
            creativity: ['خلاق'],
            mindfulness: [
              'ذهن‌آگاهی',
              'مدیتیشن',
              'مراقبه',
              'حضور',
              'نفس',
              'آرامش'
            ],
            stress: ['استرس', 'فشار', 'فرسودگی', 'آرام‌شدن', 'مدیریت استرس'],
            self_compassion: [
              'خودشفقتی',
              'مهربانی با خود',
              'خودانتقادی',
              'منتقد درونی'
            ],
            conflict: [
              'تعارض',
              'حل اختلاف',
              'بحث',
              'ارتباط بدون خشونت',
              'صلح'
            ],
            decision_making: [
              'تصمیم',
              'تصمیم‌گیری',
              'انتخاب',
              'بین دو گزینه'
            ],
            grief: ['سوگ', 'فقدان', 'از دست دادن', 'داغ', 'مرگ', 'غم از دست']
          }
          : {
            thinkers: [
              'socrates',
              'stoic',
              'aristotle',
              'jung',
              'nietzsche',
              'gandhi',
              'mandela',
              'churchill',
              'zarathustra'
            ],
            philosophy: ['philosophy'],
            focus: ['focus', 'concentrate'],
            learning: ['study', 'learn'],
            communication: ['communicate'],
            creativity: ['creative'],
            mindfulness: [
              'mindfulness',
              'meditation',
              'mindful',
              'present moment',
              'breathing exercise',
              'calm mind'
            ],
            stress: [
              'stress',
              'burnout',
              'overwhelmed',
              'calm down',
              'stress management',
              'anxiety management'
            ],
            self_compassion: [
              'self compassion',
              'self-compassion',
              'self kindness',
              'inner critic',
              'be kind to myself',
              'self care'
            ],
            conflict: [
              'conflict resolution',
              'argument',
              'disagreement',
              'resolve conflict',
              'nonviolent communication',
              'nvc'
            ],
            decision_making: [
              'decision',
              'make a choice',
              'deciding',
              'choose between',
              'important decision',
              'decision making'
            ],
            grief: [
              'grief',
              'grieving',
              'loss',
              'cope with loss',
              'mourning',
              'grief support',
              'bereavement'
            ]
          };
      const domain =
        Object.entries(domainHints).find(([, hints]) =>
          hints.some((hint) => knowledgeText.toLocaleLowerCase().includes(hint))
        )?.[0] || 'philosophy';
      return this._pickVaried(DaryaKnowledge.answer(this.lang.code, domain));
    }

    if (matchedRule.topic === 'greeting') {
      // Greetings are exempt from the question budget: a warm opening
      // question never reads as interrogative, and the pool must never
      // degrade into a generic fallback mid-conversation.
      return this._pickVaried(matchedRule.responses, {
        ignoreQuestionBudget: true
      });
    }
    if (matchedRule.topic === 'ask_me_question') {
      // The user explicitly asked for a question, so the budget must not
      // swallow the pool.
      return this._pickVaried(matchedRule.responses, {
        ignoreQuestionBudget: true
      });
    }

    // The same-rule streak guard only exists to stop the SAME rule from
    // firing its pool too many turns in a row (e.g. a user who keeps
    // typing "ok" re-matching the how-are-you rule). It must only degrade
    // when the current matched rule is the one on the streak: a different
    // rule (e.g. a fresh anxiety disclosure right after smalltalk) deserves
    // its own pool even if the previous topic repeated. Greetings are also
    // exempt because _isRepeatedGreeting handles greeting spam with its
    // dedicated pool.
    if (
      matchedRule.topic !== 'greeting' &&
      this.memory.sameRuleStreak > MAX_CONSECUTIVE_SAME_RULE &&
      matchedRule.topic === this.memory.lastRuleTopic
    ) {
      return this._fallbackResponse(matchedRule.topic, '');
    }

    if (this._canAskTopicQuestion(matchedRule.topic)) {
      const question = this._pickVaried(
        this.lang.topicSpecificQuestions[matchedRule.topic]
      );
      if (
        this.lang.topicSpecificQuestions[matchedRule.topic].includes(question)
      ) {
        return question;
      }
    }

    const needsCapture = matchedRule.responses.some((r) =>
      r.includes('{captured}')
    );
    if (!needsCapture) {
      return this._pickVaried(matchedRule.responses);
    }

    if (captured) {
      const withCapture = matchedRule.responses.filter((r) =>
        r.includes('{captured}')
      );
      const template = this._pickVaried(withCapture);
      return template.replace('{captured}', captured);
    }

    const captureFree = matchedRule.responses.filter(
      (r) => !r.includes('{captured}')
    );
    if (captureFree.length > 0) {
      return this._pickVaried(captureFree);
    }
    return this._pickVaried(this.lang.genericFallbacks);
  }

  _fallbackResponse(preferTopic, normalizedUserText) {
    // Questions take priority over entity and quoted callbacks: a stale
    // entity reference or a random "you said X earlier" line must never
    // swallow a direct question ("tell me about Jupiter"). This is the
    // regression that made Darya answer a math/knowledge question with
    // a quote from an old message.
    const _isQuestionTurn =
      !!normalizedUserText &&
      this.lang.questionPattern.test(normalizedUserText);

    if (_isQuestionTurn) {
      // Before conceding "I do not have an answer", give the factual
      // knowledge layer a chance: concrete questions (science, tech,
      // culture, careers) deserve a direct answer, not an evasive
      // bounce-back. Only when the lookup finds nothing does the turn
      // fall through to the honest-unknown pools.
      const factual = DaryaKnowledge && DaryaKnowledge.lookup
        ? DaryaKnowledge.lookup(normalizedUserText, this.lang.code)
        : null;
      if (factual && factual.confidence >= KNOWLEDGE_OVERRIDE_CONFIDENCE) {
        const followup =
          this.lang.code === 'fa'
            ? ' دوست داری بیشتر درباره‌اش بگویی یا سؤال دیگری داری؟'
            : ' Would you like to go deeper, or is there another question?';
        this._lastKnowledgeTopic = factual.topic;
        this._lastKnowledgeTurn = this.memory.turnCount;
        return factual.text + followup;
      }
      if (this.currentTurnDialogueAct === 'question') {
        // For factual questions that fell through the knowledge layer,
        // honesty plus a reliable-source pointer (Wikipedia, reputable
        // YouTube channels, qualified experts) is more useful than a
        // generic acknowledgement. Fired on a coin flip so the reply
        // does not always read as a source lecture. Personal or meta
        // questions about Darya herself are never met with a source
        // pointer; they keep the warm acknowledgement.
        const isFactualQuestion = this._isKnowledgeRequest(normalizedUserText);
        if (
          isFactualQuestion &&
          this.lang.sourceSuggestions &&
          Math.random() < SOURCE_SUGGESTION_CHANCE
        ) {
          return this._pickVaried(this.lang.sourceSuggestions);
        }
        return this._pickVaried(
          this.lang.questionAcknowledgements || this.lang.genericFallbacks
        );
      }
      return this._pickVaried(this.lang.questionFallbacks);
    }

    const entityCallback = this._respondToEntityReference();
    if (entityCallback) {
      return entityCallback;
    }

    if (
      this.memory.turnCount > 0 &&
      this.memory.turnCount % this.lang.checkInEvery === 0
    ) {
      return this._pickVaried(this.lang.sessionCheckIns);
    }

    // Light positive casual statements ("just had the best cup of coffee")
    // get a warm smalltalk reply instead of the heavy therapeutic generic
    // fallback, which reads as robotic after a cheerful low-stakes remark.
    if (
      normalizedUserText &&
      this.lang.smalltalk &&
      this.lang.smalltalk.length &&
      this._isLightPositiveCasual(normalizedUserText)
    ) {
      // The smalltalk reply is already warm and light. Mark the turn so
      // emotional calibration and human-tone coloring skip it instead of
      // stacking a second prefix on top.
      this._lightPositiveFired = true;
      return this._pickVaried(this.lang.smalltalk);
    }

    if (normalizedUserText && Math.random() < QUOTED_CALLBACK_PROBABILITY) {
      const excerpt = this.memory.randomRecentUtterance(normalizedUserText);
      if (excerpt) {
        const template = this._pickVaried(this.lang.quotedCallbackTemplates);
        return template.replace(
          '{excerpt}',
          truncateExcerpt(excerpt, EXCERPT_MAX_LENGTH)
        );
      }
    }

    if (
      this.lang.pronounMap &&
      normalizedUserText &&
      Math.random() < PRONOUN_REFLECTION_PROBABILITY
    ) {
      const reflected = reflectPronouns(
        normalizedUserText,
        this.lang.pronounMap
      );
      if (reflected) {
        return `So ${reflected}. What's that like for you?`;
      }
    }

    this._fallbackToggle = !this._fallbackToggle;
    const pool = this._fallbackToggle
      ? this.lang.strategyShiftFallbacks
      : this.lang.genericFallbacks;
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
    const activeTopics = new Set(
      this.currentTurnTopics.length
        ? this.currentTurnTopics
        : [this.memory.currentSubject.topic].filter(Boolean)
    );
    const rememberedTopics = new Set(entity.contextTopics || []);
    if (activeTopics.size === 0 || rememberedTopics.size === 0) {
      return entity.age <= ENTITY_RECENT_TURNS ? ENTITY_RECENT_CONFIDENCE : ENTITY_STALE_CONFIDENCE;
    }
    const overlap = [...activeTopics].some((topic) =>
      rememberedTopics.has(topic)
    );
    if (overlap) {
      return 1;
    }
    const recentTopic = this.memory.topicHistory
      .slice(-4)
      .some((entry) => rememberedTopics.has(entry.topic));
    return recentTopic ? TOPIC_RELEVANCE_RECENT_BONUS : TOPIC_RELEVANCE_STALE_BASE;
  }

  _respondToEntityReference() {
    const threshold = Number.isFinite(this.entityCallbackThreshold)
      ? Math.max(0, Math.min(1, this.entityCallbackThreshold))
      : ENTITY_CONFIDENCE_THRESHOLD;
    const probability = Number.isFinite(this.entityCallbackProbability)
      ? Math.max(0, Math.min(1, this.entityCallbackProbability))
      : ENTITY_CALLBACK_PROBABILITY;
    // Ultra-short inputs ("بله", "خوبی", "🙂") are answers or
    // acknowledgements, not material for an entity callback; a callback
    // here would derail the user's thread with an off-topic reference.
    const currentInput = String(this._currentNormalizedInput || '');
    const currentWordCount = currentInput.split(/\s+/u).filter(Boolean).length;
    if (currentInput && currentWordCount <= 2) {
      return null;
    }
    const candidates = this.memory
      .eligibleNamedEntities(threshold)
      .filter((entity) => entity.lastMentionTurn < this.memory.turnCount)
      .map((entity) => ({
        entity,
        context: this._entityContextConfidence(entity)
      }))
      .filter((entry) => entry.context >= ENTITY_CONTEXT_THRESHOLD)
      // Time references ("امروز", "هر روز") are far too common and
      // generic to reference back: the callback would read as a
      // non-sequitur ("جزئیات زمانیِ امروز...") on routine answers.
      .filter((entry) => entry.entity.type !== 'time')
      .sort(
        (a, b) =>
          b.entity.activation * b.context - a.entity.activation * a.context
      );
    if (candidates.length === 0 || Math.random() >= probability) {
      return null;
    }

    const entity = candidates[0].entity;
    const templates = this.lang.entityCallbackTemplates || {};
    const pool = templates[entity.type] || templates.object || [];
    if (pool.length === 0) {
      return null;
    }
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
    if (/[?؟]/u.test(text)) {
      return true;
    }
    if (this.lang.questionPattern && this.lang.questionPattern.test(text)) {
      return true;
    }
    // Fallback question markers for responses that do not end in a
    // question mark. The English check is anchored to the start of the
    // response so that supportive statements containing an embedded
    // question word ("It is okay to feel what you feel about it.") are
    // not misread as questions and stripped under budget pressure.
    return (
      /^\s*(?:what|why|how|who|when|where|which|do|does|did|is|are|am|can|could|will|would|should)\b/iu.test(
        text
      ) ||
      /(?<!\p{L})(?:چرا|چطور|چگونه|چیست|چیه|کجا|کیست|کیه|آیا)(?!\p{L})/u.test(
        text
      )
    );
  }

  _filterForQuestionBudget(pool) {
    const options = Array.isArray(pool) ? pool : [];
    const now = this.memory.turnCount;
    this.memory.askedQuestionTurns = this.memory.askedQuestionTurns.filter(
      (turn) => now - turn < QUESTION_BUDGET_WINDOW
    );
    const budgetUsed =
      this.memory.askedQuestionTurns.length >= QUESTION_BUDGET_LIMIT;
    const consecutiveUsed =
      this.memory.consecutiveQuestions >= CONSECUTIVE_QUESTION_LIMIT;
    if (!budgetUsed && !consecutiveUsed) {
      return options;
    }
    const alternatives = options.filter(
      (option) => !this._isQuestionResponse(option)
    );
    return alternatives;
  }

  _noteAskedQuestion(response) {
    if (this._isQuestionResponse(response)) {
      this.memory.consecutiveQuestions += 1;
      this.memory.askedQuestionTurns.push(this.memory.turnCount);
      this.memory.noteBotQuestion(
        response,
        this.currentTurnTopics[0] || this.memory.currentSubject.topic
      );
    } else {
      this.memory.consecutiveQuestions = 0;
    }
  }

  _alternativeAvailable(pool) {
    return (
      Array.isArray(pool) &&
      pool.some((option) => !this._isQuestionResponse(option))
    );
  }

  _alternativeFor(response) {
    const topic = this.currentTurnTopics[0] || this.memory.currentSubject.topic;
    if (topic && this._canAskTopicQuestion(topic)) {
      const specific = this.lang.topicSpecificQuestions?.[topic] || [];
      if (specific.length) {
        return this._pickVaried(specific, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }
    }
    const pools = [
      this.lang.genericFallbacks,
      this.lang.strategyShiftFallbacks
    ];
    for (const pool of pools) {
      const candidates = pool.filter(
        (line) =>
          !this._isQuestionResponse(line) &&
          !this.memory.recentBotMessages.includes(line) &&
          line !== response
      );
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    const anyNonQuestion = this.lang.genericFallbacks.find(
      (line) => !this._isQuestionResponse(line)
    );
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
    if (this.memory.recentBotMessages.includes(candidate)) {
      score -= RECENT_BOT_MESSAGE_PENALTY;
    }
    if (this._isQuestionResponse(candidate)) {
      score -= this.memory.consecutiveQuestions * CONSECUTIVE_QUESTION_PENALTY;
    }
    if (candidate.length > LONG_RESPONSE_THRESHOLD) {
      score -= LONG_RESPONSE_PENALTY;
    }
    if (/^(?:I see|Okay|Understood|متوجه شدم|باشه)[.!،؟]?$/iu.test(candidate)) {
      score -= FILLER_RESPONSE_PENALTY;
    }
    return score;
  }

  _pickVaried(pool, options = {}) {
    const original = Array.isArray(pool) ? pool : [];
    if (original.length === 0) {
      return '';
    }
    let budgeted = options.ignoreQuestionBudget
      ? original
      : this._filterForQuestionBudget(original);
    if (budgeted.length === 0) {
      budgeted = [this._alternativeFor(original[0])];
    }
    if (budgeted.length === 1) {
      const only = budgeted[0];
      if (options.trackQuestions !== false) {
        this._noteAskedQuestion(only);
      }
      return only;
    }

    const recent = this.memory.recentBotMessages;
    let candidates = budgeted.filter((item) => !recent.includes(item));

    if (candidates.length === 0) {
      const last = recent[recent.length - 1];
      candidates = budgeted.filter((item) => item !== last);
    }
    if (candidates.length === 0) {
      candidates = budgeted;
    }

    const ranked = candidates.map((candidate) => ({
      candidate,
      score: this.scoreResponseCandidate(candidate)
    }));
    const bestScore = Math.max(...ranked.map((item) => item.score));
    const best = ranked
      .filter((item) => item.score >= bestScore - 0.12)
      .map((item) => item.candidate);
    const picked = best[Math.floor(Math.random() * best.length)];
    if (options.trackQuestions !== false) {
      this._noteAskedQuestion(picked);
    }
    return picked;
  }
}

global.DaryaResponseEngine = DaryaResponseEngine;

})(typeof window !== 'undefined' ? window : globalThis);
