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
  // Minimum turns between emotional-shift acknowledgments ("you sound
  // lighter than earlier") so the context-aware touch never nags. Even a
  // string of improving turns only earns one acknowledgment per window.
  const EMOTION_SHIFT_INTERVAL = 5;
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
  // A question-echo answer ("کدوم آدم؟! الیاس، خواهرزاده من") must carry
  // a genuinely short echoed fragment: the user repeats just enough of
  // Darya's question to signal "I am answering that one", never a full
  // question of their own ("آیا الیزا هم مثل تو گاو بوده؟! من تحقیق
  // کردم..."). Both caps must hold; see parseEchoShape in utils.js.
  const ECHO_FRAGMENT_MAX_CHARS = 28;
  const ECHO_FRAGMENT_MAX_WORDS = 4;
  // The answer part of a question-echo (the words after the ؟ split) must
  // carry at least this many words to be read as a real answer rather than
  // a bare acknowledgement.
  const ECHO_ANSWER_MIN_WORDS = 2;
  // How many turns an active conversation subject stays "current" for the
  // fallback subject-continuation path: an unmatched statement that follows
  // a disclosed subject ("سه ماه پیش از دنیا رفت" after a grief disclosure)
  // keeps the thread alive instead of being treated as an unknown topic.
  const SUBJECT_CONTINUATION_WINDOW = 4;

  /**
   * How many times a single subject may be extended by served
   * continuations. Each extension refreshes the subject's since stamp,
   * keeping a long-lived thread alive across many turns of unmatched
   * statements. Without a cap, a chatty unmatched user could keep a
   * subject immortal by never letting the window age out; with a cap,
   * the thread lives for at most this many extensions plus the window
   * (roughly 10 turns of active engagement), then the window check
   * expires it and the engine falls back to the honest-unknown pool.
   * A fresh subject (topic change) starts with a fresh budget, so
   * legitimately long conversations are unaffected.
   */
  const SUBJECT_CONTINUATION_MAX_REFRESHES = 6;
  /**
   * Rule topics that are pure acknowledgments (yes/no/thanks/sorry) and
   * carry no conversational substance. They must never become the
   * conversation subject: after a real disclosure ("my girlfriend left
   * me"), a bare "yeah" continuing that thread would otherwise overwrite
   * the subject with 'affirmation' and every follow-up would lose the
   * thread.
   */
  const FILLER_TOPICS = new Set([
    'affirmation',
    'negation',
    'gratitude',
    'apology'
  ]);
  /**
   * Rule topics that are generic advice rules (procrastination
   * "what should I do", what_do_i_do, friendship "how do adults make
   * friends"). They can hijack a FRESH, more specific thread: inside
   * a dating-app conversation «هر شب یه ساعت اسکرول میکنم» is about the
   * app, and inside a pet thread «چه کار کنم راحت‌تر بشه» is about the
   * pet. updateSubject keeps the specific subject while such a generic
   * rule fires, and the subject-preference guard in responder-rules.js
   * answers with the thread continuation instead of the generic line.
   */
  const GENERIC_ADVICE_TOPICS = new Set([
    'procrastination',
    'what_do_i_do',
    'friendship'
  ]);
  /**
   * Conversational openers (greeting and smalltalk exchanges). They are
   * NOT content threads: "I keep thinking about my old apartment" right
   * after a greeting is a fresh disclosure, so it must never be pinned
   * to a "let us return to the topic" line. Shared by updateSubject and
   * the subject-continuation path in responder-rules.js.
   */
  const OPENER_SUBJECT_TOPICS = new Set([
    'greeting',
    'smalltalk_howareyou',
    'smalltalk_identity',
    'smalltalk_capability',
    'repeated_greeting'
  ]);
  const MIXED_SCRIPT_FOREIGN_MIN = 3;
  // A bilingual sentence must have a substantial foreign-script chunk
  // before it is treated as mixed: a single English loanword in an
  // otherwise Persian sentence ("امروز خیلی tired هستم") is everyday
  // Persian code-switching, not a language switch, and must never
  // trigger the mixed-language redirect. A genuinely bilingual sentence
  // ("من یک how are you دارم") crosses the threshold and does.
  //
  // The layering with minScriptRatio (0.6) is intentional: messages up
  // to 35 percent foreign letters are ordinary speech and flow through
  // the normal pipeline; the narrow band up to 40 percent triggers the
  // softer mixed-language redirect; anything more foreign is a language
  // switch and gets the direct "write in {language}" redirect first.
  const MIXED_SCRIPT_FOREIGN_RATIO = 0.35;
  // Persian (Eastern Arabic) digit characters, used to convert
  // Arabic-Indic digits typed on Arabic keyboards and to echo a stored
  // age back in the exact script the user typed.
  const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  // Turns that express aversion, reluctance, or physical nervousness are
  // never joke material ("I don't even want to go tomorrow", "my voice
  // shakes when I present"), even when no single word raises the
  // seriousness score past the threshold. Humor coloring and the light
  // smalltalk replacement both consult this pattern.
  const HUMOR_BLOCK_PATTERN =
    // eslint-disable-next-line max-len
    /(?:\b(?:don'?t|dont|cant|cannot|won'?t|wont|never|no longer|no more|hate|dread(?:ing)?|nervous|shakes?|shaking|trembling|panic|sick of|tired of|fed up|can'?t stand|cant stand|not in the mood|not looking forward|wish i didn'?t|wish i hadn'?t)\b)|(?<!\p{L})(?:دوست ندارم|حوصله ندارم|حالم بده|خسته شدم|دیگه طاقت|دلهره|می‌لرزه|عصبی‌ام|عصبیام|استرس دارم|بی‌حوصله|بی‌حال)(?!\p{L})/iu;
  // Session user-profile bounds (see responder-profile.js): an age
  // outside the plausible human range is not stored, and a captured name
  // shorter than two characters (a lone letter or a copula remnant) is
  // rejected as noise.
  const MAX_PROFILE_AGE_YEARS = 130;
  const MIN_PROFILE_NAME_LENGTH = 2;
  // Ages at or below this are read as children (the young-user age
  // guard in responder-profile.js): the stored-profile reply switches
  // to the age-appropriate pool, which warmly encourages talking to a
  // trusted adult rather than assuming adult self-reliance.
  const YOUNG_USER_MAX_AGE = 13;
  // Deferred-topic promise memory (see responder-promise.js): how many
  // turns after "I'll tell you later" Darya circles back, and how long a
  // promise stays pending before it expires silently (it is never
  // brought up again after that point).
  const PROMISE_CIRCLEBACK_DELAY_TURNS = 4;
  const PROMISE_EXPIRY_TURNS = 14;
  // Guided therapeutic exercises (see responder-exercises.js): how many
  // turns an in-progress exercise stays active before it expires
  // silently. The user may take their time between steps; after this
  // many turns of unrelated chat, the exercise is retired rather than
  // hanging over the conversation.
  const EXERCISE_ACTIVE_WINDOW = 10;
  // Mood check-in scale (see responder-mood.js): the user rates their
  // mood on a 1..10 scale; values at or below MOOD_LOW_MAX read as low
  // and values at or above MOOD_HIGH_MIN read as high, with the middle
  // band read as moderate.
  const MOOD_SCALE_MIN = 1;
  const MOOD_SCALE_MAX = 10;
  const MOOD_LOW_MAX = 4;
  const MOOD_HIGH_MIN = 8;

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
    SUBJECT_CONTINUATION_WINDOW,
    SUBJECT_CONTINUATION_MAX_REFRESHES,
    FILLER_TOPICS,
    GENERIC_ADVICE_TOPICS,
    OPENER_SUBJECT_TOPICS,
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
    MOOD_HIGH_MIN
  };
})(typeof window !== 'undefined' ? window : globalThis);
