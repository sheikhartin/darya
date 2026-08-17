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
  EXIT_SCAN_WINDOW,
  PROMISE_EXPIRY_TURNS,
  isValidScript,
  normalizeForMatching,
  scoreSentiment,
  parseEchoShape,
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
  'work',
  'chronic_illness',
  'caregiver',
  'parenting',
  'perfectionism',
  'procrastination',
  // The 2026 persona round added three lived-experience topics whose
  // pools carry their own acknowledgment and which must beat both the
  // knowledge shelf and the bare profile acknowledgment when they fire
  // alongside an age/name disclosure: self-worth/guilt and social
  // comparison (self_esteem), divorce, tech frustration, and the
  // safety-critical harassment_threat rule.
  'self_esteem',
  'divorce',
  'tech_frustration',
  'harassment_threat',
  // Blanket generalizations get a gentle-challenge pool that already
  // acknowledges the speaker ("That is a strong claim..."), so the
  // generic empathy prefix must never stack on top.
  'generalization',
  // Learning/career-path advice pools carry their own warm reflective
  // framing, and a lived disclosure that also mentions learning must
  // beat the broad knowledge shelf ("i feel anxious, how do i learn to
  // cope" stays with anxiety).
  'learning_advice',
  // Fitness/gym anxiety ("from going to the gym I feel stressed since
  // I am new") is a lived disclosure whose pool already acknowledges
  // the feeling; without this entry the FA text above was reordered to
  // the work rule (also in the set) because the knowledge shelf outranks
  // fitness, producing a jarring work question.
  'fitness',
  // 2026 loneliness specializations (new city with no circle, digital/
  // online-only friendships) reuse the loneliness pool lines, which
  // already name the feeling, so the generic empathy prefix must never
  // stack on top of them either.
  'loneliness_new_city',
  'loneliness_online'
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
    // Media recommendations remember every title shown per category. This
    // makes "more" a real continuation and prevents repeats until that
    // category's offline catalog is exhausted.
    this._mediaRecommendationState = null;
    this._usedMediaTitles = new Map();
    this._usedFunFacts = new Set();
    // Tracks a minor-attraction disclosure that arrived without adult
    // context, awaiting the speaker's age in a follow-up turn (see
    // responder-safety.js). Null when no disclosure is pending.
    this._pendingMinorAttractionTurn = null;
    // Set to true for the current turn when the fallback routed a light,
    // positive casual statement to the smalltalk pool. Later stages
    // (emotional calibration, human-tone coloring) skip the turn so they
    // never stack an extra prefix onto an already-warm smalltalk reply.
    this._lightPositiveFired = false;
    // True when the current turn's reply is a promise circle-back, so
    // the boredom override in _finalizeReply never replaces it (see
    // responder-promise.js). Reset at the start of every turn.
    this._promiseCircleBackFired = false;
    // Session-only user profile: name, age, and location the user
    // discloses during the conversation, so "چند سالمه؟", "what is my
    // name?", and "where do I live?" can be answered honestly instead
    // of evasively. Purely in-memory: cleared with the engine on every
    // new chat, never persisted (see responder-profile.js
    // _handleUserProfileTurn).
    this._userProfile = { name: null, age: null, location: null };
    // Last math/factual follow-up sentence, so consecutive answers never
    // append the same redirect twice in a row (the full answer string is
    // what lands in recentBotMessages, so pool recency filtering alone
    // cannot dedupe the bare follow-up).
    this._lastFactualFollowup = null;
    // Guided therapeutic exercise state (see responder-exercises.js):
    // null when no exercise is active, otherwise { id, stepIndex,
    // startedAtTurn }. Session-only, reset with a new chat.
    this._activeExercise = null;
    // Pending mood check-in (see responder-mood.js): set when Darya
    // asked for a rating on the mood scale, cleared when the answer
    // lands (or the request is released). Session-only.
    this._pendingMoodRequest = null;
    // Quick-reply chips for the UI: a short list of tappable options
    // (exercise yes/no, mood scale) attached to the last reply. The app
    // reads it after delivering the reply and renders the chips; reset
    // at the start of every turn.
    this.lastTurnQuickReplies = [];
    this.entityCallbackThreshold = ENTITY_CONFIDENCE_THRESHOLD;
    this.entityCallbackProbability = ENTITY_CALLBACK_PROBABILITY;
    this.currentTurnTopics = [];
    this.currentTurnSeriousness = 0;
    this.lastTurnNeedsCare = false;
    this.currentTurnDialogueAct = 'statement';
    this.currentTurnIntent = 'unknown';
    this.currentTurnQuestionNeed = 0;
    this._lastTurnCorrection = false;
    // Emotional trajectory and conversation context (Phase 1 foundation):
    // track the user's emotional arc across turns so replies can
    // acknowledge change, and keep a lightweight statement/topic window
    // for continuity. Both are session-only and reset with a new chat.
    // Guarded so the engine still constructs if the new modules are not
    // loaded (e.g. a stale cached page mid-update).
    this.emotionTrajectory = global.DaryaEmotionAnalyzer
      ? new global.DaryaEmotionAnalyzer.EmotionTrajectory()
      : null;
    this.conversationContext = global.DaryaContextWindow
      ? new global.DaryaContextWindow.ConversationContext()
      : null;
    // Last turn's analyzed emotion (enriched with dimensions), kept so
    // the trajectory comparison works across turns.
    this._lastEmotionAnalysis = null;
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
    // Precompute the exit-keyword token sequences once, so isExitCommand
    // (checked for every user message) never re-normalizes the keyword
    // list per call. Tokens are matched as exact contiguous sequences
    // against the input word windows; see isExitCommand.
    this._exitKeywords = (lang.exitKeywords || []).map((keyword) =>
      normalizeForMatching(keyword, lang)
        .toLowerCase()
        .split(/\s+/u)
        .filter(Boolean)
    );
    this._exitLongestKeyword = Math.max(
      EXIT_SCAN_WINDOW,
      ...this._exitKeywords.map((tokens) => tokens.length)
    );
  }

  respond(rawText) {
    if (!String(rawText).trim()) {
      return this.lang.emptyInputReply;
    }
    if (!isValidScript(rawText, this.lang)) {
      return this.lang.foreignLanguageRedirect();
    }

    // Terse farewells («بای», "bye", "bye bye") route to the same
    // two-step as the app layer (app/conversation.js), which intercepts
    // exit commands before the engine is called; this path only matters
    // for standalone embeddings and the test harness, and it must match
    // the app so a replay never shows «بای» being answered with a
    // short-reply prompt. Step one asks for confirmation, step two (any
    // later farewell) says goodbye; a non-farewell message cancels the
    // pending state. isExitCommand applies the per-language
    // exitStoryPattern, so past-tense reports ("I said goodbye to my
    // friend") are never treated as exits, and a farewell wins over an
    // insult exactly as it does in the app's sendMessage flow.
    if (this.isExitCommand(rawText)) {
      if (this.memory.farewellPending) {
        this.memory.farewellPending = false;
        return this.farewell();
      }
      this.memory.farewellPending = true;
      return this.exitConfirmation();
    }
    this.memory.farewellPending = false;

    const normalized = this.lang.normalize(rawText);
    const matchingText = normalizeForMatching(rawText, this.lang);
    this._currentNormalizedInput = matchingText;
    this._lightPositiveFired = false;
    this._promiseCircleBackFired = false;
    // Quick-reply chips from the previous turn are stale now; only the
    // current turn may attach fresh ones.
    this.lastTurnQuickReplies = [];
    // A deferred-topic promise that waited far too long expires
    // silently: Darya never nags about a thread the person let go.
    if (
      this.memory.pendingPromise &&
      this.memory.turnCount - this.memory.pendingPromise.promisedAtTurn >
        PROMISE_EXPIRY_TURNS
    ) {
      this.memory.clearPromise();
    }
    const sentimentScore = scoreSentiment(
      normalized,
      this.lang.sentimentLexicon
    );
    this.memory.rememberUtterance(normalized);
    this.memory.rememberSentiment(sentimentScore);
    this.memory.turnCount += 1;
    this.memory.decayNamedEntities();

    // Phase 1 foundation: enrich the detected emotion with dimensional
    // analysis and record it in the trajectory so later turns can
    // acknowledge emotional change. Also feed the conversation context
    // window (statements + topics) for continuity. Both are guarded so
    // the engine degrades gracefully without the new modules.
    const primaryEmotion = this._detectPrimaryEmotion(matchingText);
    if (global.DaryaEmotionAnalyzer) {
      this._lastEmotionAnalysis = global.DaryaEmotionAnalyzer.analyzeTurn(
        primaryEmotion,
        sentimentScore
      );
      this.emotionTrajectory.push(primaryEmotion, this.memory.turnCount);
    }
    // NOTE: the conversation context utterance/topic recording happens
    // after dialogue-act classification below (it needs that state); the
    // trajectory push above only depends on the emotion, which is ready.

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
    // A deferred-topic promise that Darya already circled back on is
    // fulfilled (and retired) the moment the person engages with real
    // content again: any matched rule counts as engagement.
    if (
      this.memory.pendingPromise &&
      this.memory.pendingPromise.circledBack &&
      matchedRule
    ) {
      this.memory.clearPromise();
    }
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
    if (this.conversationContext) {
      this.conversationContext.rememberUtterance(normalized, this.memory.turnCount, {
        isAcknowledgement: this.currentTurnDialogueAct === 'acknowledgement',
        isGreeting: isRepeatedGreeting
      });
      this.conversationContext.rememberTopics(
        this.currentTurnTopics,
        this.memory.turnCount
      );
      this.conversationContext.setActiveSubject(
        this.currentTurnTopics[0] || null,
        this.memory.turnCount
      );
    }
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

    // A blend pool acknowledges two co-occurring GENERIC topics
    // (family+sadness, sleep+anxiety). It must never preempt a more
    // specific rule that also matched: a new mother's "I feel like a bad
    // mother" (parenting, 57) is not a generic family-sadness turn, so
    // only blends whose constituents include the matched rule's own
    // topic are eligible. Computed once here so the strategy, phase, and
    // reply all agree on the same (possibly suppressed) blend key.
    const blendKey = this._blendKey(this.currentTurnTopics);
    const eligibleBlendKey =
      blendKey &&
      (!matchedRule ||
        blendKey
          .replace(/^blend_/u, '')
          .split('_')
          .includes(matchedRule.topic))
        ? blendKey
        : null;
    const strategy = this.selectResponseStrategy({
      matchedRule,
      blendKey: eligibleBlendKey,
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
    // A question-echo input ("کدوم آدم؟! الیاس، خواهرزاده من") looks
    // substantive but is actually a structured answer to the pending
    // question. It must NOT pre-mark that question answered here: the
    // echo override (responder-entity.js) needs the question to still be
    // pending to read its content, and it marks it answered itself.
    // The echo shape (؟/؟! splitting a short question fragment from the
    // answer) only survives in the raw input; the normalizer strips the
    // punctuation. parseEchoShape bounds the fragment so a full-length
    // question of the user's own is never treated as an echo.
    const isEchoShaped = parseEchoShape(rawText) !== null;
    const isSubstantive =
      !isRepeatedGreeting &&
      !isSpamNoise &&
      this.currentTurnDialogueAct !== 'acknowledgement' &&
      this.currentTurnDialogueAct !== 'test_input' &&
      _substantiveCache &&
      !isEchoShaped;
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
    } else if (
      eligibleBlendKey &&
      this.lang.blendResponses?.[eligibleBlendKey]
    ) {
      reply = this._pickVaried(this.lang.blendResponses[eligibleBlendKey]);
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
      blendKey: eligibleBlendKey,
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
