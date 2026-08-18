/**
 * Darya - shared utilities (main file).
 * Holds the conversation memory plus the constants re-export, and merges
 * the text-processing helpers from utils-text.js into the public
 * DaryaUtils object so every consumer sees one unchanged API.
 */
(function (global) {
  'use strict';

  const {
    MEMORY_SIZE,
    SAFETY_CRITICAL_TOPICS,
    MAX_CONSECUTIVE_SAME_RULE,
    RECENT_BOT_MESSAGES_SIZE,
    SENTIMENT_HISTORY_SIZE,
    DISTRESS_STREAK_LENGTH,
    QUOTED_CALLBACK_PROBABILITY,
    PRONOUN_REFLECTION_PROBABILITY,
    PRONOUN_REFLECTION_MAX_WORDS,
    PRONOUN_REFLECTION_MIN_WORDS,
    EXCERPT_MAX_LENGTH,
    ENTITY_DECAY_PER_TURN,
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
    PLAYFUL_HUFF_CHANCE,
    PLAYFUL_HUFF_MIN_TURNS,
    PLAYFUL_HUFF_STREAK,
    WARMTH_MIN_SERIOUSNESS,
    WARMTH_MAX_SERIOUSNESS,
    WARMTH_MIN_TURN_GAP,
    WARMTH_CHANCE,
    SMALLTALK_MIN_LIGHT_STREAK,
    SMALLTALK_TURN_INTERVAL,
    SMALLTALK_CHANCE,
    HUMAN_TOUCH_INTERVAL,
    EMOTION_SHIFT_INTERVAL,
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
    MIXED_SCRIPT_THRESHOLD,
    SUBSTANTIVE_ANSWER_MIN_WORDS,
    TEASING_MOCK_THRESHOLD,
    WELLBEING_CHECK_TURNS,
    BOREDOM_CHECK_INTERVAL,
    BOREDOM_MIN_TURNS,
    MINOR_ATTRACTION_PENDING_WINDOW,
    PENDING_ANSWER_WINDOW,
    MIXED_SCRIPT_FOREIGN_MIN,
    MIXED_SCRIPT_FOREIGN_RATIO,
    PERSIAN_DIGITS,
    HUMOR_BLOCK_PATTERN,
    MAX_PROFILE_AGE_YEARS,
    MIN_PROFILE_NAME_LENGTH,
    YOUNG_USER_MAX_AGE,
    ECHO_FRAGMENT_MAX_CHARS,
    ECHO_FRAGMENT_MAX_WORDS,
    ECHO_ANSWER_MIN_WORDS,
    FILLER_TOPICS,
    GENERIC_ADVICE_TOPICS,
    ADVICE_BRIDGE_MIN_TOPIC_TURNS,
    OPENER_SUBJECT_TOPICS,
    SUBJECT_CONTINUATION_WINDOW,
    SUBJECT_CONTINUATION_MAX_REFRESHES,
    PROMISE_CIRCLEBACK_DELAY_TURNS,
    PROMISE_EXPIRY_TURNS,
    EXERCISE_ACTIVE_WINDOW,
    MOOD_SCALE_MIN,
    MOOD_SCALE_MAX,
    MOOD_LOW_MAX,
    MOOD_HIGH_MIN
  } = global.DaryaUtilsConstants;

  const {
    scriptRatio,
    isValidScript,
    truncateExcerpt,
    normalizeForMatching,
    scoreSentiment,
    reflectPronouns,
    containsDeathLexicon
  } = global.DaryaUtilsText;

  // Question-echo shape: a short question fragment ending in ؟/? followed
  // by an answer of at least two characters ("کدوم آدم؟! الیاس، خواهرزاده
  // من"). The fragment char cap is enforced here in the regex; the word
  // cap and the answer checks live in parseEchoShape below.
  const ECHO_SHAPE_RE = new RegExp(
    `^(.{0,${ECHO_FRAGMENT_MAX_CHARS}}?)[؟?][؟!]*\\s+(.{2,})$`,
    'u'
  );

  // ========================================================================
  // Memory
  // ========================================================================

  /**
   * Tracks recent user utterances, topics, sentiment, and Darya's own
   * recent replies, for conversational continuity and repetition
   * avoidance. Purely in-memory (per browser tab, no persistence, no
   * server).
   */
  class ConversationMemory {
    constructor(capacity = MEMORY_SIZE) {
      this.capacity = capacity;
      this.recentUtterances = [];
      this.recentTopics = [];
      this.recentBotMessages = [];
      this.sentimentHistory = [];
      this.lastRuleTopic = null;
      this.sameRuleStreak = 0;
      this.distressNudgeGiven = false;
      this.turnCount = 0;
      this.namedEntities = new Map();
      this.askedQuestionTurns = [];
      this.consecutiveQuestions = 0;
      this.topicHistory = [];
      this.topicWeights = new Map();
      this.seriousnessHistory = [];
      this.currentSubject = { topic: null, entityRefs: [], since: 0 };
      this.lightStreak = 0;
      this.lastWarmthTurn = -Infinity;
      this.smalltalkTurns = [];
      this.responseStrategies = [];
      this.turnFrames = [];
      this.pendingQuestions = [];
      this.answeredQuestions = [];
      this.consecutiveAcknowledgements = 0;
      // Deferred-topic promise (see responder-promise.js): set when the
      // user says "I'll tell you later" and cleared on release, expiry,
      // or when the promise is kept. Null when nothing is pending.
      this.pendingPromise = null;
      // Terse-farewell two-step state (see responder.js): true after the
      // first farewell turn asked for exit confirmation, so the next
      // farewell says goodbye instead of asking again. Any non-farewell
      // message clears it, mirroring the app layer's pendingExit flag.
      this.farewellPending = false;
      // Session mood log (see responder-mood.js): ratings the user chose
      // to record on the 1..10 scale, oldest first, capped at the
      // language's moodLogSize. Purely in-memory and session-only.
      this.moodLog = [];
      // Turn number of the first safety-critical event this session,
      // or null when none has happened. Once set it never clears: exit
      // confirmations switch to crisis-aware copy and playful pools
      // stay suppressed for the rest of the session (see
      // responder-overrides.js and responder-public.js).
      this.safetyModeSince = null;
      // Every question Darya has asked this session, verbatim. A
      // question asked once is never asked again word-for-word: on an
      // "ok" streak the old behavior alternated the same two pool
      // questions forever, which read as a broken record. Session-only.
      this.askedQuestionTexts = new Set();
    }

    /**
     * Remembers that the user deferred a topic at the given turn, so
     * Darya can circle back to it a few turns later. Only the most
     * recent promise is kept: a new one replaces the old.
     * @param {number} turn - The turn count when the promise was made.
     */
    rememberPromise(turn) {
      this.pendingPromise = { promisedAtTurn: turn, circledBack: false };
    }

    /**
     * Retires the pending promise (released by the user, expired, or
     * fulfilled).
     */
    clearPromise() {
      this.pendingPromise = null;
    }

    rememberUtterance(utterance) {
      this.recentUtterances.push(utterance);
      if (this.recentUtterances.length > this.capacity) {
        this.recentUtterances.shift();
      }
    }

    rememberTopic(topic, weight = 1) {
      if (!topic) {
        return;
      }
      this.recentTopics.push(topic);
      if (this.recentTopics.length > this.capacity) {
        this.recentTopics.shift();
      }
      this.topicHistory.push({ topic, weight, turn: this.turnCount });
      if (this.topicHistory.length > 7) {
        this.topicHistory.shift();
      }
      this.topicWeights.set(
        topic,
        (this.topicWeights.get(topic) || 0) + weight
      );

      if (topic === this.lastRuleTopic) {
        this.sameRuleStreak += 1;
      } else {
        this.sameRuleStreak = 1;
      }
      this.lastRuleTopic = topic;
    }

    rememberTopics(topics, weight = 1) {
      const unique = [...new Set((topics || []).filter(Boolean))];
      unique.forEach((topic) => this.rememberTopic(topic, weight));
    }

    rememberSeriousness(value) {
      this.seriousnessHistory.push(value);
      if (this.seriousnessHistory.length > 6) {
        this.seriousnessHistory.shift();
      }
      this.lightStreak = value < 0.5 ? this.lightStreak + 1 : 0;
    }

    updateSubject(topics, entities) {
      const topic = topics[0] || this.currentSubject.topic || null;
      // Pure acknowledgment topics (yes/no/thanks/sorry) carry no
      // conversational substance: letting them own the subject would wipe
      // a real disclosure ("my girlfriend left me" -> "yeah" -> subject
      // becomes 'affirmation'), so the next follow-up loses the thread.
      // They keep the current subject instead.
      const isFiller = topic !== null && FILLER_TOPICS.has(topic);
      // A generic advice topic (procrastination, what_do_i_do,
      // friendship) must not hijack a FRESH, more specific subject:
      // "How do adults make friends?" right after a new-city loneliness
      // disclosure is still the loneliness thread, and «چه کار کنم
      // راحت‌تر بشه» inside a pet thread is still about the pet. When
      // the incoming topic is such a generic rule and the current
      // subject is a real content thread within the continuation
      // window, keep the current subject so the subject-preference
      // guard in responder-rules.js can answer with the thread
      // continuation. Conversational openers are NOT content threads
      // and never block a generic topic from taking over.
      const isGenericAdvice =
        topic !== null && GENERIC_ADVICE_TOPICS.has(topic);
      // A generic advice subject (procrastination, what_do_i_do,
      // friendship) is NOT a content thread worth preserving: if the
      // current subject is itself generic and another generic advice
      // topic fires, the new one should take over so «چه کار کنم»
      // inside a generic thread answers generic advice instead of being
      // pinned to a stale friendship/procrastination label. Only a
      // specific content subject (pet_care, dating_apps, grief) blocks
      // a generic hijacker.
      const currentIsReal =
        this.currentSubject.topic &&
        !OPENER_SUBJECT_TOPICS.has(this.currentSubject.topic) &&
        !GENERIC_ADVICE_TOPICS.has(this.currentSubject.topic);
      const keepSpecificSubject =
        isGenericAdvice &&
        currentIsReal &&
        this.currentSubject.topic !== topic &&
        this.turnCount - this.currentSubject.since <=
          SUBJECT_CONTINUATION_WINDOW;
      if (
        topic !== this.currentSubject.topic &&
        !isFiller &&
        !keepSpecificSubject
      ) {
        this.currentSubject = { topic, entityRefs: [], since: this.turnCount };
      }
      const refs = (entities || []).map(
        (entity) => `${entity.type}:${entity.surface}`
      );
      this.currentSubject.entityRefs = [
        ...new Set([...this.currentSubject.entityRefs, ...refs])
      ].slice(-8);
    }

    rememberStrategy(strategy) {
      this.responseStrategies.push({ strategy, turn: this.turnCount });
      if (this.responseStrategies.length > 8) {
        this.responseStrategies.shift();
      }
    }

    rememberTurnFrame(frame) {
      this.turnFrames.push(frame);
      if (this.turnFrames.length > 8) {
        this.turnFrames.shift();
      }
    }

    noteBotQuestion(question, topic) {
      // Session-wide verbatim question log (see askedQuestionTexts):
      // every asked question is recorded here regardless of which path
      // served it, so the no-repeat filter in _pickVaried sees them all.
      if (this.askedQuestionTexts) {
        this.askedQuestionTexts.add(question);
      }
      this.pendingQuestions.push({
        question,
        topic,
        askedAtTurn: this.turnCount,
        answered: false
      });
      if (this.pendingQuestions.length > 4) {
        this.pendingQuestions.shift();
      }
    }

    markLatestQuestionAnswered(answer, turn) {
      const pending = [...this.pendingQuestions]
        .reverse()
        .find((item) => !item.answered);
      if (!pending) {
        return null;
      }
      pending.answered = true;
      pending.answer = answer;
      pending.answeredAtTurn = turn;
      this.answeredQuestions.push(pending);
      if (this.answeredQuestions.length > 6) {
        this.answeredQuestions.shift();
      }
      return pending;
    }

    rememberBotMessage(message) {
      this.recentBotMessages.push(message);
      if (this.recentBotMessages.length > RECENT_BOT_MESSAGES_SIZE) {
        this.recentBotMessages.shift();
      }
    }

    rememberSentiment(score) {
      this.sentimentHistory.push(score);
      if (this.sentimentHistory.length > SENTIMENT_HISTORY_SIZE) {
        this.sentimentHistory.shift();
      }
    }

    decayNamedEntities() {
      for (const [key, entity] of this.namedEntities) {
        const current = Number.isFinite(entity.activation)
          ? entity.activation
          : 0;
        entity.activation = Math.max(0, current * (1 - ENTITY_DECAY_PER_TURN));
        entity.age = Math.max(
          0,
          Number.isFinite(entity.age) ? entity.age + 1 : 1
        );
        if (entity.activation < 0.05) {
          entity.activation = 0;
          this.namedEntities.delete(key);
        }
      }
    }

    rememberEntities(entities, turn = this.turnCount, context = {}) {
      const contextTopics = [...new Set(context.topics || [])];
      for (const item of entities || []) {
        if (!item || !item.type || !item.surface) {
          continue;
        }
        const key =
          item.key || `${item.type}:${item.surface.toLocaleLowerCase()}`;
        const old = this.namedEntities.get(key);
        if (old) {
          old.surface = item.surface;
          old.activation = Math.min(1, old.activation + 0.34 * item.confidence);
          old.confidence = Math.max(old.confidence, item.confidence);
          old.mentions += 1;
          old.lastMentionTurn = turn;
          old.age = 0;
          old.contextTopics = [
            ...new Set([...(old.contextTopics || []), ...contextTopics])
          ].slice(-5);
          old.contextConfidence = Math.max(
            old.contextConfidence || 0,
            item.confidence
          );
          old.contextSeriousness =
            context.seriousness ?? old.contextSeriousness ?? 0;
        } else {
          this.namedEntities.set(key, {
            type: item.type,
            surface: item.surface,
            confidence: item.confidence,
            activation: item.confidence,
            mentions: 1,
            firstMentionTurn: turn,
            lastMentionTurn: turn,
            age: 0,
            contextTopics,
            contextConfidence: item.confidence,
            contextSeriousness: context.seriousness ?? 0
          });
        }
      }
    }

    correctEntity(oldSurface, replacement, context = {}) {
      const oldKey = String(oldSurface).trim().toLocaleLowerCase();
      for (const [key, entity] of this.namedEntities) {
        if (
          entity.surface.toLocaleLowerCase() === oldKey ||
          oldKey.endsWith(entity.surface.toLocaleLowerCase()) ||
          key.endsWith(`:${oldKey}`)
        ) {
          entity.corrected = true;
          entity.correctionTurn = this.turnCount;
          this.namedEntities.delete(key);
        }
      }
      if (replacement?.surface && replacement?.type) {
        this.rememberEntities(
          [
            {
              type: replacement.type,
              surface: replacement.surface,
              confidence: Math.max(0.9, replacement.confidence || 0.9)
            }
          ],
          this.turnCount,
          context
        );
      }
    }

    eligibleNamedEntities(threshold = 0.6) {
      return [...this.namedEntities.values()]
        .filter((entity) => entity.activation >= threshold)
        .sort((a, b) => b.activation - a.activation);
    }

    mostCommonTopic(exclude = []) {
      const counts = new Map();
      for (const topic of this.recentTopics) {
        if (exclude.includes(topic)) {
          continue;
        }
        counts.set(topic, (counts.get(topic) || 0) + 1);
      }
      let best = null;
      let bestCount = -1;
      for (const [topic, count] of counts) {
        if (count > bestCount) {
          best = topic;
          bestCount = count;
        }
      }
      return best;
    }

    /**
     * Returns the most recent substantive utterance to circle back to, or
     * null when none exists. Deterministic by design: the quoted callback
     * (see responder-rules.js) must always return to the LATEST topic the
     * person raised instead of a random one, so a release turn like
     * «ولش کن» / "never mind" never picks a different old phrase on every
     * run (the flaky 9-variant behavior from the transcript replay). The
     * current turn's own text is excluded, and utterances shorter than
     * three words are skipped so a bare "ok" or "خب" is never quoted.
     * @param {string} exclude - The current turn's text to skip.
     * @returns {string|null}
     */
    mostRecentUtterance(exclude = '') {
      for (let i = this.recentUtterances.length - 1; i >= 0; i -= 1) {
        const utterance = this.recentUtterances[i];
        const isCommandOrQuestion =
          // eslint-disable-next-line max-len
          /^(?:recommend|suggest|tell me|explain|what|why|when|where|who|how|name|give me|show me|پیشنهاد|معرفی|بگو|توضیح|چی|چرا|چطور|چگونه|کجا|کی|چه)(?:\s|$)/iu.test(
            utterance.trim()
          );
        if (
          utterance !== exclude &&
          !isCommandOrQuestion &&
          utterance.split(/\s+/).filter(Boolean).length >= 3
        ) {
          return utterance;
        }
      }
      return null;
    }

    isInDistressStreak() {
      if (this.sentimentHistory.length < DISTRESS_STREAK_LENGTH) {
        return false;
      }
      const recent = this.sentimentHistory.slice(-DISTRESS_STREAK_LENGTH);
      return recent.every((score) => score < 0);
    }
  }

  /**
   * Splits a question-echo input ("کدوم آدم؟! الیاس، خواهرزاده من") into
   * its echoed question fragment and answer part, or returns null when the
   * input is not echo-shaped. The echoed fragment must be genuinely short
   * (at most ECHO_FRAGMENT_MAX_CHARS characters and ECHO_FRAGMENT_MAX_WORDS
   * words): a full question of the user's own («آیا الیزا هم مثل تو گاو
   * بوده؟! من تحقیق کردم...») is not an echo of Darya's question, so it
   * must never be consumed as an answer. The answer part must carry at
   * least two words and no question mark. The shape only survives in the
   * raw input because the normalizer strips ؟/؟ punctuation.
   * @param {string} rawText - Raw (unnormalized) user input
   * @returns {{fragment: string, answerPart: string}|null}
   */
  function parseEchoShape(rawText) {
    const match = String(rawText || '').match(ECHO_SHAPE_RE);
    if (!match) {
      return null;
    }
    const fragment = match[1].trim();
    const answerPart = match[2].trim();
    if (
      fragment.split(/\s+/u).filter(Boolean).length > ECHO_FRAGMENT_MAX_WORDS ||
      answerPart.split(/\s+/u).filter(Boolean).length < ECHO_ANSWER_MIN_WORDS ||
      /[؟?]/u.test(answerPart)
    ) {
      return null;
    }
    return { fragment, answerPart };
  }

  global.DaryaUtils = {
    MEMORY_SIZE,
    SAFETY_CRITICAL_TOPICS,
    MAX_CONSECUTIVE_SAME_RULE,
    RECENT_BOT_MESSAGES_SIZE,
    SENTIMENT_HISTORY_SIZE,
    DISTRESS_STREAK_LENGTH,
    QUOTED_CALLBACK_PROBABILITY,
    PRONOUN_REFLECTION_PROBABILITY,
    PRONOUN_REFLECTION_MAX_WORDS,
    PRONOUN_REFLECTION_MIN_WORDS,
    EXCERPT_MAX_LENGTH,
    ENTITY_DECAY_PER_TURN,
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
    PLAYFUL_HUFF_CHANCE,
    PLAYFUL_HUFF_MIN_TURNS,
    PLAYFUL_HUFF_STREAK,
    WARMTH_MIN_SERIOUSNESS,
    WARMTH_MAX_SERIOUSNESS,
    WARMTH_MIN_TURN_GAP,
    WARMTH_CHANCE,
    SMALLTALK_MIN_LIGHT_STREAK,
    SMALLTALK_TURN_INTERVAL,
    SMALLTALK_CHANCE,
    HUMAN_TOUCH_INTERVAL,
    EMOTION_SHIFT_INTERVAL,
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
    MIXED_SCRIPT_THRESHOLD,
    SUBSTANTIVE_ANSWER_MIN_WORDS,
    TEASING_MOCK_THRESHOLD,
    WELLBEING_CHECK_TURNS,
    BOREDOM_CHECK_INTERVAL,
    BOREDOM_MIN_TURNS,
    MINOR_ATTRACTION_PENDING_WINDOW,
    PENDING_ANSWER_WINDOW,
    ECHO_FRAGMENT_MAX_CHARS,
    ECHO_FRAGMENT_MAX_WORDS,
    ECHO_ANSWER_MIN_WORDS,
    MIXED_SCRIPT_FOREIGN_MIN,
    MIXED_SCRIPT_FOREIGN_RATIO,
    PERSIAN_DIGITS,
    HUMOR_BLOCK_PATTERN,
    MAX_PROFILE_AGE_YEARS,
    MIN_PROFILE_NAME_LENGTH,
    YOUNG_USER_MAX_AGE,
    PROMISE_CIRCLEBACK_DELAY_TURNS,
    PROMISE_EXPIRY_TURNS,
    EXERCISE_ACTIVE_WINDOW,
    MOOD_SCALE_MIN,
    MOOD_SCALE_MAX,
    MOOD_LOW_MAX,
    MOOD_HIGH_MIN,
    SUBJECT_CONTINUATION_WINDOW,
    SUBJECT_CONTINUATION_MAX_REFRESHES,
    GENERIC_ADVICE_TOPICS,
    ADVICE_BRIDGE_MIN_TOPIC_TURNS,
    OPENER_SUBJECT_TOPICS,
    scriptRatio,
    isValidScript,
    truncateExcerpt,
    normalizeForMatching,
    scoreSentiment,
    reflectPronouns,
    containsDeathLexicon,
    parseEchoShape,
    ConversationMemory
  };
})(typeof window !== 'undefined' ? window : globalThis);
