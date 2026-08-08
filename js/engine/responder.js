/**
 * Darya - Rogerian conversation engine responder (classic script).
 */
(function (global) {
  'use strict';


var U = global.DaryaUtils;
var TimeFetcher = global.DaryaTimeUtils.TimeFetcher;

const {
  ENTITY_CALLBACK_PROBABILITY,
  SERIOUS_TURN_THRESHOLD,
  ENTITY_CONFIDENCE_THRESHOLD,
  isValidScript,
  normalizeForMatching,
  scoreSentiment,
  ConversationMemory
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

  // Shared across the responder part files (see responder-*.js).
  global.DaryaResponderShared = { KNOWLEDGE_OVERRIDE_CONFIDENCE, SOURCE_SUGGESTION_CHANCE, LIVED_TOPICS };

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
    // Full text of the last knowledge answer, so a format-feedback turn
    // ("write each on a separate line") can re-emit the list line by line.
    this._lastKnowledgeText = null;
    // Tracks a minor-attraction disclosure that arrived without adult
    // context, awaiting the speaker's age in a follow-up turn (see
    // responder-safety.js). Null when no disclosure is pending.
    this._pendingMinorAttractionTurn = null;
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
    const overridden = this._applySmartOverrides({
      reply,
      rawText,
      normalized,
      matchingText,
      isRepeatedGreeting,
      isSpamNoise,
      matchedRule
    });
    return this._finalizeReply({
      reply: overridden.reply,
      normalized,
      matchingText,
      entities,
      matchedRule,
      blendKey,
      isRepeatedGreeting,
      isSpamNoise,
      safetyTurn: overridden.safetyTurn,
      minorAttractionTurn: overridden.minorAttractionTurn,
      nearPeerLoveTurn: overridden.nearPeerLoveTurn,
      overrideFired: overridden.overrideFired
    });
  }
}

global.DaryaResponseEngine = DaryaResponseEngine;
})(typeof window !== 'undefined' ? window : globalThis);
