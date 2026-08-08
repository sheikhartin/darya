/**
 * Darya - engine constants.
 * Registered on global.DaryaUtilsConstants; utils.js destructures them.
 */
(function (global) {
  'use strict';

  // ========================================================================
  // Constants
  // ========================================================================

  const MEMORY_SIZE = 8;
  const MAX_CONSECUTIVE_SAME_RULE = 2;
  const RECENT_BOT_MESSAGES_SIZE = 10;
  const SENTIMENT_HISTORY_SIZE = 6;
  const DISTRESS_STREAK_LENGTH = 3;
  const QUOTED_CALLBACK_PROBABILITY = 0.3;
  const PRONOUN_REFLECTION_PROBABILITY = 0.25;
  const PRONOUN_REFLECTION_MAX_WORDS = 14;
  const PRONOUN_REFLECTION_MIN_WORDS = 2;
  const EXCERPT_MAX_LENGTH = 60;
  const ENTITY_DECAY_PER_TURN = 0.18;
  const ENTITY_CALLBACK_PROBABILITY = 0.55;
  const CONSECUTIVE_QUESTION_LIMIT = 1;
  const QUESTION_BUDGET_WINDOW = 3;
  const QUESTION_BUDGET_LIMIT = 1;
  const REPEATED_GREETING_THRESHOLD = 2;
  const EXIT_SCAN_WINDOW = 5;
  const EXIT_SCAN_TRIGGER_LENGTH = 5;
  const SERIOUS_TURN_THRESHOLD = 0.5;
  const MODERATE_SERIOUSNESS_THRESHOLD = 0.4;
  const SERIOUSNESS_TOPIC_FLOOR = 0.45;
  const SERIOUSNESS_WEIGHT = 0.35;
  const SERIOUSNESS_CAP = 0.9;
  const SERIOUSNESS_LIGHT_TOPIC = 0.25;
  const ENTITY_CONFIDENCE_THRESHOLD = 0.6;
  const BOREDOM_SKIP_CHANCE = 0.4;
  const EMOTION_PREFIX_CHANCE = 0.4;
  const HUMOR_CHANCE = 0.2;
  const WARMTH_MIN_SERIOUSNESS = 0.3;
  const WARMTH_MAX_SERIOUSNESS = 0.6;
  const WARMTH_MIN_TURN_GAP = 3;
  const WARMTH_CHANCE = 0.3;
  const SMALLTALK_MIN_LIGHT_STREAK = 2;
  const SMALLTALK_TURN_INTERVAL = 3;
  const SMALLTALK_CHANCE = 0.35;
  const HUMAN_TOUCH_INTERVAL = 7;
  const ENTITY_RECENT_TURNS = 4;
  const ENTITY_RECENT_CONFIDENCE = 0.72;
  const ENTITY_STALE_CONFIDENCE = 0.45;
  const OPENING_RETURNING_PRIMARY = 0.6;
  const OPENING_RETURNING_SECONDARY = 0.85;
  const OPENING_NEW_PRIMARY = 0.5;
  const ENTITY_CONFIDENCE_DECAY_RECENT_BASE = 0.94;
  const ENTITY_CONFIDENCE_DECAY_RECENT_RATE = 0.06;
  const ENTITY_CONFIDENCE_DECAY_STALE_BASE = 0.76;
  const ENTITY_CONFIDENCE_DECAY_STALE_RATE = 0.04;
  const MIXED_LANGUAGE_REDIRECT_CHANCE = 0.6;
  const TOPIC_RELEVANCE_RECENT_BONUS = 0.64;
  const TOPIC_RELEVANCE_STALE_BASE = 0.22;
  const ENTITY_CONTEXT_THRESHOLD = 0.6;
  const RECENT_BOT_MESSAGE_PENALTY = 0.9;
  const CONSECUTIVE_QUESTION_PENALTY = 0.25;
  const LONG_RESPONSE_THRESHOLD = 220;
  const LONG_RESPONSE_PENALTY = 0.08;
  const FILLER_RESPONSE_PENALTY = 0.12;
  const WORD_REPETITION_THRESHOLD = 4;
  const SPAM_MIN_LENGTH = 2;
  const SPAM_MAX_UNIQUE_RATIO = 0.3;
  const ACKNOWLEDGEMENT_THRESHOLD = 2;
  const TEST_INPUT_PATTERNS =
    /^(?:test|testing|hello bot|can you hear|are you there|ping|pong|123|abc)$/iu;
  const MIXED_SCRIPT_THRESHOLD = 0.35;
  const SUBSTANTIVE_ANSWER_MIN_WORDS = 3;
  const TEASING_MOCK_THRESHOLD = 2;
  const WELLBEING_CHECK_TURNS = 2;
  const BOREDOM_CHECK_INTERVAL = 5;
  const BOREDOM_MIN_TURNS = 6;
  // How many turns a disclosed attraction toward a minor stays pending
  // before an adult age/identity stated in a later message still counts
  // as part of the same disclosure (cross-turn minor-attraction safety).
  const MINOR_ATTRACTION_PENDING_WINDOW = 3;
  // How many turns back a question Darya asked still counts as the
  // question a short answer (yes/no/maybe) is responding to. Keeps short
  // answers contextual without treating a stale question as current.
  const PENDING_ANSWER_WINDOW = 3;
  const MIXED_SCRIPT_FOREIGN_MIN = 3;
  const MIXED_SCRIPT_FOREIGN_RATIO = 0.05;

  // ========================================================================
  // Text helpers
  // ========================================================================

  /**
   * Computes the fraction of alphabetic characters that fall within a
   * language's expected script range.
   * @param {string} text
   * @param {RegExp} scriptRange - Regex matching a single in-script letter.
   * @returns {number|null} Ratio in [0, 1], or null if there are no
   *   alphabetic characters at all (nothing to judge).
   */

  global.DaryaUtilsConstants = {
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
  };
})(typeof window !== 'undefined' ? window : globalThis);
