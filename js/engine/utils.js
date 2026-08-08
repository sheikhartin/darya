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
    MIXED_SCRIPT_THRESHOLD,
    SUBSTANTIVE_ANSWER_MIN_WORDS,
    TEASING_MOCK_THRESHOLD,
    WELLBEING_CHECK_TURNS,
    BOREDOM_CHECK_INTERVAL,
    BOREDOM_MIN_TURNS,
    MINOR_ATTRACTION_PENDING_WINDOW,
    PENDING_ANSWER_WINDOW,
    MIXED_SCRIPT_FOREIGN_MIN,
    MIXED_SCRIPT_FOREIGN_RATIO
  } = global.DaryaUtilsConstants;

  const {
    scriptRatio,
    isValidScript,
    truncateExcerpt,
    normalizeForMatching,
    scoreSentiment,
    reflectPronouns
  } = global.DaryaUtilsText;

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
      if (topic !== this.currentSubject.topic) {
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

    randomRecentUtterance(exclude = '') {
      const candidates = this.recentUtterances.filter(
        (u) => u !== exclude && u.split(/\s+/).filter(Boolean).length >= 3
      );
      if (candidates.length === 0) {
        return null;
      }
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    isInDistressStreak() {
      if (this.sentimentHistory.length < DISTRESS_STREAK_LENGTH) {
        return false;
      }
      const recent = this.sentimentHistory.slice(-DISTRESS_STREAK_LENGTH);
      return recent.every((score) => score < 0);
    }
  }

  global.DaryaUtils = {
    MEMORY_SIZE,
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
    scriptRatio,
    isValidScript,
    truncateExcerpt,
    normalizeForMatching,
    scoreSentiment,
    reflectPronouns,
    ConversationMemory
  };
})(typeof window !== 'undefined' ? window : globalThis);
