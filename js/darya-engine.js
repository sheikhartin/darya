/**
 * Darya - generic Rogerian conversation engine core.
 *
 * This file contains no language-specific content at all: every string,
 * pattern, and lexicon lives in a "language pack" (see js/languages/fa.js
 * and js/languages/en.js). `DaryaResponseEngine` is constructed with one
 * such pack and gets identical capabilities regardless of which language
 * it's driving, so Persian and English are full peers.
 *
 * Capabilities, beyond simple keyword -> response matching:
 *
 *   - Repetition-aware response selection (`_pickVaried`): every reply is
 *     chosen while avoiding lines used recently, so long conversations
 *     don't start to feel mechanical.
 *   - Topic-streak breaking: if the same rule fires too many turns in a
 *     row, the engine deliberately shifts to a callback or a different
 *     fallback strategy instead of repeating itself.
 *   - Lightweight sentiment tracking: a small keyword-based lexicon
 *     scores each message as leaning positive/negative/neutral. Three
 *     consecutive negative-leaning messages trigger one gentle, optional   *     grounding-technique offer (paced breathing) plus a nudge toward
   *     professional support if things continue. Distinct from, and
   *     lower-priority than, the hard-coded safety-keyword rule, which
 *     always takes precedence for any language of self-harm.
 *   - Quoted-memory callbacks: occasionally reflects the person's own   *     earlier words back to them verbatim ("Earlier you mentioned...").
   *     A core reflective-listening technique from person-centered therapy,
 *     safe in any language since nothing is grammatically transformed.
 *   - Session check-ins: every few turns without a clear topic match,
 *     Darya offers a light process check-in, mirroring how a real
 *     conversation naturally pauses to take stock.
 *   - Optional pronoun-swap reflection ("I feel..." -> "So you feel...")
 *     when the language pack provides a `pronounMap`. This is the
 *     classic ELIZA technique; it's only enabled for English in this
 *     project because English's simple pronoun morphology keeps it
 *     grammatical, whereas Persian carries person/number in the verb
 *     ending itself, where a naive word-swap would often break.
 *
 * None of this is genuine language understanding: it is a considerably richer,
 * carefully engineered rule-based/expert-system approach (in the lineage
 * of ELIZA and Rogerian-style companions), not a claim of genuine
 * language understanding.
 */

(function (global) {
  'use strict';

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
  const WORD_REPETITION_THRESHOLD = 4;
  const SPAM_MIN_LENGTH = 2;
  const SPAM_MAX_UNIQUE_RATIO = 0.3;
  const ACKNOWLEDGEMENT_THRESHOLD = 2;
  const TEST_INPUT_PATTERNS = /^(?:test|testing|hello bot|can you hear|are you there|ping|pong|123|abc)$/iu;
  const MIXED_SCRIPT_THRESHOLD = 0.35;
  const SUBSTANTIVE_ANSWER_MIN_WORDS = 3;
  const TEASING_MOCK_THRESHOLD = 2;
  const WELLBEING_CHECK_TURNS = 4;
  const BOREDOM_CHECK_INTERVAL = 5;   // Check for low-engagement every N turns
  const BOREDOM_MIN_TURNS = 6;        // Minimum turns before boredom signals are considered

  /* Conversation design notes: keep replies relevant and proportionate,
     alternate reflection with a small number of concrete questions, and
     treat humor as a context-sensitive option rather than a personality
     default. Structural inspiration from the reflective-inquiry discussion at
     https://arxiv.org/html/2312.06024v4 and the turn-taking/relevance chapter
     at https://web.stanford.edu/~jurafsky/slp3/old_jan25/15.pdf. Darya keeps
     those ideas deterministic and local: lexical topics, weighted memory,
     and explicit safety gates rather than a runtime service. */

  // ==========================================================================
  // Text helpers (language-agnostic, operate on whatever script range and
  // lexicon the active language pack supplies)
  // ==========================================================================

  /**
   * Computes the fraction of alphabetic characters that fall within a
   * language's expected script range.
   * @param {string} text
   * @param {RegExp} scriptRange - Regex matching a single in-script letter.
   * @returns {number|null} Ratio in [0, 1], or null if there are no
   *   alphabetic characters at all (nothing to judge).
   */
  function scriptRatio(text, scriptRange) {
    const letters = [...String(text)].filter((ch) => /\p{L}/u.test(ch));
    if (letters.length === 0) return null;
    const inScript = letters.filter((ch) => scriptRange.test(ch));
    return inScript.length / letters.length;
  }

  /**
   * Determines whether `text` is predominantly written in the script the
   * active language pack expects. Text with no alphabetic characters at
   * all (numbers, punctuation, emoji) is treated as acceptable.
   * @param {string} text
   * @param {object} lang - The active language pack.
   * @returns {boolean}
   */
  function isValidScript(text, lang) {
    const ratio = scriptRatio(text, lang.scriptRange);
    if (ratio === null) return true;
    return ratio >= lang.minScriptRatio;
  }

  /**
   * Truncates a long excerpt for use in a quoted callback, so we don't
   * echo an entire paragraph back at someone.
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  function truncateExcerpt(text, maxLength) {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  }

  /**
   * Canonicalizes punctuation used only for rule matching. The original
   * utterance remains intact for memory and display, while سلام, سلام! and
   * سلام. reach the same matcher path.
   *
   * Strips ALL punctuation marks (not just sentence-ending ones) so
   * that "قلم", "قلم!", "قلم؟" and "قلم،" are all treated as identical
   * tokens for repetition and intent detection.
   */
  /**
   * Canonicalizes the raw input for rule matching. The original text is
   * preserved unchanged in memory, while the return value is stripped of
   * punctuation, zero-width non-joiners (ZWNJ / half-spaces), and
   * excessive whitespace so that orthographic variants of the same word
   * reach the same rule path. "خوش‌بین", "خوشبین", and "خوش بین" all
   * become the same token.
   */
  function normalizeForMatching(rawText, lang) {
    const normalized = lang.normalize(rawText);
    return normalized
      // Strip all punctuation and symbols EXCEPT apostrophes and hyphens
      // that appear inside words (e.g. "can't", "half-space"). This keeps
      // contractions and compound-word rule patterns intact while still
      // making "قلم", "قلم!" and "قلم؟" reach the same matcher.
      .replace(/[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu, ' ')
      // Strip zero-width characters (half-spaces, joiners) so Persian
      // orthographic variants like "بیحال", "بی‌حال", "بی حال" all
      // normalize to the same token for matching.
      .replace(/[\u200c\u200d\u200b\ufeff]+/gu, '')
      .replace(/[ \t\r\n]+/gu, ' ')
      .trim();
  }

  /**
   * Scores a normalized message using a simple keyword lexicon: +1 for
   * each positive-lexicon word found (as a substring, to tolerate
   * attached Persian suffixes and simple English inflection alike), -1
   * for each negative-lexicon word found. This is a lightweight heuristic
   * consistent with the rest of the engine's keyword-driven design, not a
   * real sentiment model.
   * @param {string} normalizedText
   * @param {{positive: string[], negative: string[]}} lexicon
   * @returns {number}
   */
  function scoreSentiment(normalizedText, lexicon) {
    let score = 0;
    for (const word of lexicon.negative) {
      if (normalizedText.includes(word)) score -= 1;
    }
    for (const word of lexicon.positive) {
      if (normalizedText.includes(word)) score += 1;
    }
    return score;
  }

  /**
   * Attempts a careful ELIZA-style pronoun-swap reflection ("I feel tired"
   * -> "you feel tired"). Only used when the language pack provides a
   * `pronounMap`. Bounded by word-count guards and returns null (meaning
   * "don't use this") whenever the result might look grammatically
   * questionable, so a failed reflection silently falls through to a
   * normal fallback instead of ever being shown.
   * @param {string} text
   * @param {Record<string, string>} pronounMap
   * @returns {string|null}
   */
  function reflectPronouns(text, pronounMap) {
    const words = text.trim().split(/\s+/);
    if (words.length < PRONOUN_REFLECTION_MIN_WORDS || words.length > PRONOUN_REFLECTION_MAX_WORDS) {
      return null;
    }

    let swapped = false;
    const result = words.map((token) => {
      const match = token.match(/^([A-Za-z']+)([.,!?]*)$/);
      if (!match) return token;
      const [, word, punct] = match;
      const lower = word.toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(pronounMap, lower)) return token;

      swapped = true;
      let replacement = pronounMap[lower];
      if (word[0] === word[0].toUpperCase() && lower !== 'i') {
        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement + punct;
    });

    if (!swapped) return null;
    return result.join(' ');
  }

  // ==========================================================================
  // Memory
  // ==========================================================================

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
      // Entity values are intentionally small, ephemeral records. The map
      // key is stable for lookup, while surface preserves the person's own
      // spelling for a natural callback.
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
      // Enhanced tracking for smarter conversation management
      this.consecutiveAcknowledgements = 0;
    }

    rememberUtterance(utterance) {
      this.recentUtterances.push(utterance);
      if (this.recentUtterances.length > this.capacity) this.recentUtterances.shift();
    }

    rememberTopic(topic, weight = 1) {
      if (!topic) return;
      this.recentTopics.push(topic);
      if (this.recentTopics.length > this.capacity) this.recentTopics.shift();
      this.topicHistory.push({ topic, weight, turn: this.turnCount });
      if (this.topicHistory.length > 7) this.topicHistory.shift();
      this.topicWeights.set(topic, (this.topicWeights.get(topic) || 0) + weight);

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
      if (this.seriousnessHistory.length > 6) this.seriousnessHistory.shift();
      this.lightStreak = value < 0.5 ? this.lightStreak + 1 : 0;
    }

    updateSubject(topics, entities) {
      const topic = topics[0] || this.currentSubject.topic || null;
      if (topic !== this.currentSubject.topic) {
        this.currentSubject = { topic, entityRefs: [], since: this.turnCount };
      }
      const refs = (entities || []).map((entity) => `${entity.type}:${entity.surface}`);
      this.currentSubject.entityRefs = [...new Set([...this.currentSubject.entityRefs, ...refs])].slice(-8);
    }

    rememberStrategy(strategy) {
      this.responseStrategies.push({ strategy, turn: this.turnCount });
      if (this.responseStrategies.length > 8) this.responseStrategies.shift();
    }

    rememberTurnFrame(frame) {
      this.turnFrames.push(frame);
      if (this.turnFrames.length > 8) this.turnFrames.shift();
    }

    noteBotQuestion(question, topic) {
      this.pendingQuestions.push({ question, topic, askedAtTurn: this.turnCount, answered: false });
      if (this.pendingQuestions.length > 4) this.pendingQuestions.shift();
    }

    markLatestQuestionAnswered(answer, turn) {
      const pending = [...this.pendingQuestions].reverse().find((item) => !item.answered);
      if (!pending) return null;
      pending.answered = true;
      pending.answer = answer;
      pending.answeredAtTurn = turn;
      this.answeredQuestions.push(pending);
      if (this.answeredQuestions.length > 6) this.answeredQuestions.shift();
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

    /**
     * Age named entities at the start of a new user turn. A multiplicative
     * decay keeps recent memories available while making a long-abandoned
     * detail naturally fall below the callback threshold.
     */
    decayNamedEntities() {
      for (const [key, entity] of this.namedEntities) {
        const current = Number.isFinite(entity.activation) ? entity.activation : 0;
        entity.activation = Math.max(0, current * (1 - ENTITY_DECAY_PER_TURN));
        entity.age = Math.max(0, Number.isFinite(entity.age) ? entity.age + 1 : 1);
        // Remove a memory once its practical score is zero. This keeps the
        // map bounded and makes decay monotonic even if a malformed record
        // enters the map from an integration test or future adapter.
        if (entity.activation < 0.05) {
          entity.activation = 0;
          this.namedEntities.delete(key);
        }
      }
    }

    /**
     * Remember only the entities selected by the language pack extractor.
     * This method is called after response selection, which is important:
     * a brand-new entity cannot be used to fabricate an "earlier" callback
     * in the same turn.
     */
    rememberEntities(entities, turn = this.turnCount, context = {}) {
      const contextTopics = [...new Set(context.topics || [])];
      for (const item of entities || []) {
        if (!item || !item.type || !item.surface) continue;
        const key = item.key || `${item.type}:${item.surface.toLocaleLowerCase()}`;
        const old = this.namedEntities.get(key);
        if (old) {
          old.surface = item.surface;
          old.activation = Math.min(1, old.activation + 0.34 * item.confidence);
          old.confidence = Math.max(old.confidence, item.confidence);
          old.mentions += 1;
          old.lastMentionTurn = turn;
          old.age = 0;
          old.contextTopics = [...new Set([...(old.contextTopics || []), ...contextTopics])].slice(-5);
          old.contextConfidence = Math.max(old.contextConfidence || 0, item.confidence);
          old.contextSeriousness = context.seriousness ?? old.contextSeriousness ?? 0;
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
            contextSeriousness: context.seriousness ?? 0,
          });
        }
      }
    }

    correctEntity(oldSurface, replacement, context = {}) {
      const oldKey = String(oldSurface).trim().toLocaleLowerCase();
      for (const [key, entity] of this.namedEntities) {
        if (entity.surface.toLocaleLowerCase() === oldKey
          || oldKey.endsWith(entity.surface.toLocaleLowerCase())
          || key.endsWith(`:${oldKey}`)) {
          entity.corrected = true;
          entity.correctionTurn = this.turnCount;
          this.namedEntities.delete(key);
        }
      }
      if (replacement?.surface && replacement?.type) {
        this.rememberEntities([{
          type: replacement.type,
          surface: replacement.surface,
          confidence: Math.max(0.9, replacement.confidence || 0.9),
        }], this.turnCount, context);
      }
    }

    /**
     * Returns remembered entities strong enough for a callback. A threshold
     * is applied by the engine, not by extraction, so tests and future UI
     * diagnostics can inspect low-confidence lexical candidates safely.
     */
    eligibleNamedEntities(threshold = 0.6) {
      return [...this.namedEntities.values()]
        .filter((entity) => entity.activation >= threshold)
        .sort((a, b) => b.activation - a.activation);
    }

    /**
     * Returns the most frequently discussed recent topic, if any.
     * @param {string[]} [exclude]
     * @returns {string|null}
     */
    mostCommonTopic(exclude = []) {
      const counts = new Map();
      for (const topic of this.recentTopics) {
        if (exclude.includes(topic)) continue;
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
     * Returns a random earlier user utterance distinct from `exclude`,
     * for quoted-memory callbacks. Trivially short utterances (a bare
     * "hi", "ok", etc.) are excluded so callbacks only ever quote
     * something substantive.
     * @param {string} [exclude] - Typically the current message.
     * @returns {string|null}
     */
    randomRecentUtterance(exclude = '') {
      const candidates = this.recentUtterances.filter(
        (u) => u !== exclude && u.split(/\s+/).filter(Boolean).length >= 3
      );
      if (candidates.length === 0) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /**
   * True once the last DISTRESS_STREAK_LENGTH sentiment scores are all
   * negative. Used to trigger (at most once per streak) a gentle
   * grounding-technique offer.
     * @returns {boolean}
     */
    isInDistressStreak() {
      if (this.sentimentHistory.length < DISTRESS_STREAK_LENGTH) return false;
      const recent = this.sentimentHistory.slice(-DISTRESS_STREAK_LENGTH);
      return recent.every((score) => score < 0);
    }
  }

  // ==========================================================================
  // Response engine
  // ==========================================================================

  /**
   * Core Rogerian response engine for the Darya companion. Combines
   * normalization, rule matching, topic tracking, sentiment-aware
   * check-ins, quoted-memory callbacks, repetition-aware response
   * selection, and graceful fallbacks into a single `respond` entry
   * point, plus `greeting`/`farewell` helpers for the UI layer.
   */
  class DaryaResponseEngine {
    /** @param {object} lang - A language pack, e.g. window.DaryaLang.fa */
    constructor(lang) {
      this.lang = lang;
      this.rules = [...lang.rules].sort((a, b) => b.priority - a.priority);
      this.memory = new ConversationMemory();
      this._fallbackToggle = false;
      this.entityCallbackThreshold = 0.6;
      // Public for deterministic integration tests and future product tuning;
      // every value is clamped at the decision point before it is used.
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
      this.conversationPhase = 'new'; // 'new' -> 'orienting' -> 'engaging' -> 'deepening'
    }

    /**
     * Checks whether the (normalized) input signals the user wants to leave.
     * Short messages (<= 5 words) are treated as exit commands if they
     * contain any exit keyword. For longer messages, the exit keyword must
     * appear within the first or last 3 words of the message, preventing
     * a goodbye word in the middle of a story (e.g. "I told them goodbye
     * and then we left") from prematurely ending the conversation while
     * still catching long but genuine farewells (e.g. "خیلی ممنون بدرود").
     * @param {string} rawText
     * @returns {boolean}
     */
    isExitCommand(rawText) {
      const normalized = normalizeForMatching(rawText, this.lang).toLowerCase();
      const words = normalized.split(/\s+/u).filter(Boolean);
      // Short messages: any exit keyword match counts
      if (words.length <= 5) {
        return this.lang.exitKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
      }
      // Longer messages: only match if the exit keyword appears in the
      // first 3 or last 3 words (catches genuine farewells while
      // ignoring goodbye words embedded in a story).
      const prefix = words.slice(0, 3).join(' ');
      const suffix = words.slice(-3).join(' ');
      return this.lang.exitKeywords.some((keyword) =>
        prefix.includes(keyword.toLowerCase()) || suffix.includes(keyword.toLowerCase())
      );
    }

    /**
     * Detects whether the recent messages form a repeated greeting pattern
     * (e.g. the user types "سلام" multiple times without answering the
     * previous question). This lets Darya gently reset the conversation
     * rather than answering the same greeting with a different greeting.
     * @param {string} normalizedText - The current normalized message.
     * @returns {boolean}
     */
    _isRepeatedGreeting(normalizedText) {
      const recentUtterances = this.memory.recentUtterances;
      if (recentUtterances.length < REPEATED_GREETING_THRESHOLD) return false;
      // Check if the last N-1 messages are all greetings (by checking if they
      // match the same greeting rule as the current one).
      const greetingPatterns = this.lang.rules
        .filter((r) => r.topic === 'greeting')
        .map((r) => r.pattern);
      if (!greetingPatterns.length) return false;
      let greetingCount = 0;
      // Check if current message is a greeting
      const currentIsGreeting = greetingPatterns.some((p) => {
        p.lastIndex = 0;
        return p.test(normalizedText);
      });
      if (!currentIsGreeting) return false;
      // Count consecutive greetings from recent utterances (working backwards)
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

    /**
     * Detects spam or keyboard-smash input: very short messages with low
     * unique character ratio (e.g. "asdasd", "dddd", "۱۲۳۴") or very
     * repetitive patterns. These deserve a gentle, non-judgmental response
     * rather than being treated as meaningful input.
     * @param {string} normalizedText - The current normalized message.
     * @returns {boolean}
     */
    _isSpamOrNoise(normalizedText) {
      const text = normalizedText.trim();
      if (text.length < SPAM_MIN_LENGTH) return false;
      // Pure digits or very short strings with no letters
      if (/^\d+$/u.test(text) && text.length < 5) return true;
      // Keyboard smash: low unique character ratio
      const chars = [...text].filter((ch) => /\p{L}/u.test(ch));
      if (chars.length < 3) return false;
      const uniqueChars = new Set(chars.map((c) => c.toLowerCase()));
      const uniqueRatio = uniqueChars.size / chars.length;
      if (uniqueRatio < SPAM_MAX_UNIQUE_RATIO && text.length < 12) return true;
      // Highly repetitive (e.g. "aaaaaaaa", "۱۲۱۲۱۲۱۲")
      if (uniqueChars.size <= 2 && text.length > 4) return true;
      // Check against language-specific stop words: a message composed only
      // of short common function words is not spam.
      const words = text.split(/\s+/u).filter(Boolean);
      if (words.length <= 2 && this.lang.stopWords
        && words.every((w) => this.lang.stopWords.has(w.toLowerCase()))) {
        return false;
      }
      return false;
    }

    /**
     * Detects very short, ambiguous input that doesn't match any rule
     * and is too brief to infer intent (e.g. a single word like "خوب"
     * or "nice").
     * @param {string} normalizedText
     * @returns {boolean}
     */
    _isAmbiguousInput(normalizedText) {
      const wordCount = normalizedText.split(/\s+/u).filter(Boolean).length;
      return wordCount <= 2 && normalizedText.length < 10;
    }

    /**
     * Detects repeated words or short phrases across recent utterances.
     * When a specific word appears WORD_REPETITION_THRESHOLD (4+) times,
     * AND the current message still contains that word, returns the word
     * and its count so the engine can explicitly name it rather than
     * using a generic synonym. The "current message must also contain
     * the word" guard prevents a bug where greeting words accumulated
     * across earlier exchanges (e.g. "درود" said 4 times) then falsely
     * trigger on a completely new topic (e.g. "امروز احساس ترس دارم").
     * @param {string} normalizedText - The current normalized message.
     * @returns {{word: string, count: number}|null}
     */
    _detectWordRepetition(normalizedText) {
      const recent = [...this.memory.recentUtterances];
      // Use language-specific stop words from the active language pack.
      // Falls back to a minimal English set if none is provided.
      const stopWords = this.lang.stopWords
        || new Set([
          'is', 'are', 'am', 'be', 'the', 'a', 'an', 'in', 'on', 'at',
          'to', 'for', 'of', 'and', 'or', 'but', 'it', 'its', 'i', 'you',
          'he', 'she', 'they', 'we', 'my', 'your', 'his', 'her', 'its',
        ]);

      // Count words from previous utterances (not including current)
      const pastWordCounts = new Map();
      for (const utterance of recent) {
        const clean = String(utterance).replace(/[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu, ' ');
        const words = clean.toLowerCase().split(/\s+/u).filter(Boolean);
        for (const word of words) {
          if (word.length < 2 || stopWords.has(word)) continue;
          pastWordCounts.set(word, (pastWordCounts.get(word) || 0) + 1);
        }
      }

      // Get current message words separately - only used for the "current message contains" check
      const currentClean = String(normalizedText || '').replace(/[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu, ' ');
      const currentWords = currentClean.toLowerCase().split(/\s+/u).filter(Boolean);
      const currentWordSet = new Set(currentWords);

      let mostRepeated = null;
      let maxCount = 0;
      // Only check words from past utterances that also appear in the current message
      for (const [word, count] of pastWordCounts) {
        if (count > maxCount && count >= WORD_REPETITION_THRESHOLD && currentWordSet.has(word)) {
          mostRepeated = word;
          maxCount = count;
        }
      }
      return mostRepeated ? { word: mostRepeated, count: maxCount } : null;
    }

    /**
     * Detects frustration signals in the raw text: multiple consecutive
     * exclamation marks ("!!!"), multiple question marks ("???"), or
     * mixed punctuation ("!?"), all of which suggest heightened emotion.
     * @param {string} rawText - The original (non-normalized) text.
     * @returns {'exclamation'|'question'|null}
     */
    _detectFrustration(rawText) {
      // 3+ consecutive exclamation marks
      if (/!{3,}/.test(rawText)) return 'exclamation';
      // 2+ consecutive question marks (lower threshold, questions are more common)
      if (/\?{2,}/.test(rawText)) return 'question';
      // Mixed frustration markers
      if (/[!?]{3,}/.test(rawText)) return 'exclamation';
      return null;
    }

    /**
     * Detects teasing or mocking signals in the raw text. Sarcastic
     * compliments ("you're so smart!!!"), mock agreement ("sure, bot",
     * "whatever you say"), and eye-roll indicators suggest the person
     * is not engaging in good faith. Returns true when enough signals
     * accumulate, so the engine can respond with gentle understanding
     * instead of treating sarcasm as genuine praise or agreement.
     * @param {string} rawText - The original (non-normalized) text.
     * @param {string} matchingText - The rule-matching normalized text.
     * @returns {boolean}
     */
    _detectTeasingOrMocking(rawText, matchingText) {
      // English sarcastic compliment patterns (especially with excessive punctuation)
      const sarcasticPraise = /(?:you'?re\s+(?:so|very|really)\s+(?:smart|clever|funny|helpful|wise|useful|intelligent|brilliant|genius)|what a genius|wow\s+(?:you'?re|so)|such a genius|great advice|very helpful|thanks a lot)\b/i;
      // English mock agreement / dismissal
      const mockAgree = /\b(?:yeah right|sure (?:you are|you do|bot)|whatever you say|if you say so|right ok|ok sure|as if|oh please)\b/i;
      // Eye-roll or dismissive signals (language-agnostic)
      const dismissSignal = /[😒🙄😏🤨]/;
      // Persian sarcastic/mocking patterns
      const faSarcasm = /(?:چه (?:باهوش|خوب|عاقل|دانا|مهربان|صبور|باحال|بامزه|باحوصله|باهوشی|باهوشید)،|آفرین به (?:خودت|شما|خودتون)|به به|احسنت|مرسی که اینقدر (?:باهوشی|کمک کردی|به دردم خوردی)|به درک|هر چی تو بگی|چشم منتظر|خوب خوب تو راست میگی|باشه باشه تو بردی)/iu;
      // Check raw text for punctuation-exaggerated praise (sarcasm marker)
      const hasExcessivePunct = /!{3,}|\?{3,}|!\?|\?!|([.!?]){3,}/.test(rawText);
      const hasSarcasticPraise = sarcasticPraise.test(rawText) && hasExcessivePunct;
      const hasMockAgree = mockAgree.test(matchingText);
      const hasDismissSignal = dismissSignal.test(rawText);
      const hasFaSarcasm = faSarcasm.test(rawText);
      // Sarcastic praise without excessive punctuation but with context
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

    /**
     * Detects whether the user is checking on the bot's well-being,
     * especially after a serious or emotionally heavy conversation.
     * This uses context: if the user recently shared something
     * significant and then asks "how are you?", the bot responds
     * thoughtfully instead of with a generic greeting response.
     * Uses a language-specific pattern from the active language pack
     * so Persian expressions like "خوبی؟" work as well as English ones.
     * @param {string} matchingText - The rule-matching normalized text.
     * @returns {boolean}
     */
    _detectWellBeingCheck(matchingText) {
      // Use language-specific pattern from the active language pack.
      // Falls back to English pattern for safety if none is provided.
      const wellBeingPattern = this.lang.wellBeingPattern
        || /\b(?:how (?:are you|are you doing|you doing|have you been)|you (?:ok|alright|good)|what about you)\b/i;
      const isWellBeingQ = wellBeingPattern.test(matchingText);
      if (!isWellBeingQ) return false;
      // Check if the conversation has recently been serious or emotionally heavy
      if (this.memory.turnCount < WELLBEING_CHECK_TURNS) return false;
      const recentSeriousness = this.memory.seriousnessHistory.slice(-WELLBEING_CHECK_TURNS);
      const avgSeriousness = recentSeriousness.length
        ? recentSeriousness.reduce((a, b) => a + b, 0) / recentSeriousness.length
        : 0;
      return avgSeriousness >= 0.4 || this.lastTurnNeedsCare;
    }

    /**
     * Attempts to answer simple factual questions that the engine can
     * resolve directly (e.g. basic arithmetic). When recognized, it
     * returns a concise answer followed by a gentle conversational
     * redirect, so the person gets a real answer before being steered
     * back toward the emotional conversation.
     * @param {string} text - The normalized matching text.
     * @returns {string|null}
     */
    _handleFactualQuestion(text) {
      // Simple arithmetic in English: "what is X + Y?", "what's 5 * 3?", etc.
      const enMatch = text.match(/(?:what\s+is|what'?s)\s*(\d+)\s*([+\-*xX\/])\s*(\d+)/i);
      // Simple arithmetic in Persian: "۲+۳ چند می‌شود؟" or "۵ ضربدر ۳" or "۱۰ تقسیم بر ۲" etc.
      const faMatch = this.lang.code === 'fa'
        ? text.match(/([۰-۹0-9]+)\s*([+\-*xX\/\u00D7]|تقسیم\s+بر|ضربدر|بعلاوه|منهای)\s*([۰-۹0-9]+).*(?:چند|چقدر|چیست|چیه)/u)
        : null;
      const mathMatch = enMatch || faMatch;
      if (mathMatch) {
        // For English: groups are 1=num, 2=op, 3=num.
        // For Persian: groups are 1=num, 2=opWord, 3=num.
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
        // Normalize operators: both English (+, -, *, x, /) and Persian (بعلاوه, منهای, ضربدر, تقسیم بر, ×)
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

    /**
     * Produces Darya's reply to a single user utterance.
     * @param {string} rawText
     * @returns {string}
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

      // Detect repeated greetings, spam/noise, and ambiguous input
      // BEFORE rule matching so these special patterns always get handled
      // even if a normal rule would technically match.
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

      // Mark pending question as answered BEFORE reply selection so that
      // a question the bot asks in this same turn is not immediately marked
      // as answered. Only substantive answers count (spam, greetings,
      // pure acknowledgements, and test inputs are ignored). Cache the
      // result since _isSubstantiveAnswer is also checked in the routing.
      const _substantiveCache = this._isSubstantiveAnswer(matchingText);
      const isSubstantive = !isRepeatedGreeting && !isSpamNoise
        && this.currentTurnDialogueAct !== 'acknowledgement'
        && this.currentTurnDialogueAct !== 'test_input'
        && _substantiveCache;
      if (isSubstantive) {
        this.memory.markLatestQuestionAnswered(normalized, this.memory.turnCount);
      }

      let reply;
      // Route to specialized handlers. Repeated greetings and spam
      // always override rule matching. Ambiguous input only applies
      // as a last resort when no rule matches, so meaningful short
      // inputs like "sad" still reach the correct rule.

      // Mixed language detection (gentle, occasional)
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
        // Only use acknowledgement responses if there's a pending question
        // and the acknowledgement is not a substantive answer.
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
      let _overrideFired = false; // Set when an override replaces reply, so emotion calibration skips redundant prepending.

      // Factual question: answer simple math first (weakest override).
      // Never overrides safety responses.
      // Note: use `normalized` (not `matchingText`) because normalizeForMatching
      // strips math operators like +, -, *, / that the arithmetic regex needs.
      if (!_safetyTurn && !isRepeatedGreeting && !isSpamNoise && matchedRule?.topic !== 'knowledge') {
        const factualReply = this._handleFactualQuestion(normalized);
        if (factualReply) {
          reply = factualReply;
          _overrideFired = true;
        }
      }

      // Word repetition: if the user has repeated a specific word 4+
      // times, name it explicitly. Medium-strength override.
      // NEVER overrides safety responses.
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

      // Frustration signal: detect !!! or ???, insults/curses, and
      // respond with extra calmness. Strongest override (runs late so it
      // always wins over normal routing).
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

      // Teasing or mocking detection: if the user is being sarcastic or
      // dismissive, respond with gentle understanding. Only fires for
      // non-safety turns where the user has enough conversational history.
      if (!_safetyTurn && !isRepeatedGreeting && !isSpamNoise
        && this.memory.turnCount >= 3 && this.lang.teasingMockingResponses) {
        if (this._detectTeasingOrMocking(rawText, matchingText)) {
          reply = this._pickVaried(this.lang.teasingMockingResponses);
          _overrideFired = true;
        }
      }

      // Well-being check: when the user asks how the bot is doing after
      // a serious conversation, respond thoughtfully instead of with a
      // generic greeting reply. Runs after regular routing so it overrides
      // the normal smalltalk_howareyou rule.
      if (!_safetyTurn && !isRepeatedGreeting && !isSpamNoise
        && this.memory.turnCount >= WELLBEING_CHECK_TURNS
        && this.lang.wellBeingResponses) {
        if (this._detectWellBeingCheck(matchingText)) {
          reply = this._pickVaried(this.lang.wellBeingResponses);
          _overrideFired = true;
        }
      }

      // Emotion-aware calibration: adjust tone based on detected emotion.
      // Skip when an override already set the reply (frustration, teasing,
      // wellbeing, boredom, word-repetition -- they already carry their own
      // emotional framing, and prepending a calibration prefix would be
      // redundant). Also skip blend responses (already emotionally tuned),
      // safety turns, and greetings/meta-topic responses.
      const primaryEmotion = this._detectPrimaryEmotion(matchingText);
      if (!_overrideFired && primaryEmotion !== 'neutral'
        && this.currentTurnDialogueAct !== 'safety'
        && !blendKey && !isRepeatedGreeting && !isSpamNoise) {
        reply = this._calibrateEmotionalTone(reply, primaryEmotion);
      }

      // Periodic conversational color: boredom/meta signals when the
      // conversation has been low-engagement for several turns.
      if (!_safetyTurn && !isRepeatedGreeting && !isSpamNoise
        && this.memory.turnCount >= BOREDOM_MIN_TURNS
        && this.memory.turnCount % BOREDOM_CHECK_INTERVAL === 0
        && this.lang.boredomResponses
        && this.currentTurnSeriousness < 0.4) {
        // Only fire if the last few turns have been simple acknowledgements
        // or very short inputs with no emotional depth.
        const recentUtterances = this.memory.recentUtterances.slice(-3);
        const allBrief = recentUtterances.every((u) => u.split(/\s+/u).filter(Boolean).length <= 3);
        if (allBrief && Math.random() < 0.4) {
          reply = this._pickVaried(this.lang.boredomResponses);
          _overrideFired = true;
        }
      }

      // Track acknowledgement streaks for smarter handling
      if (this.currentTurnDialogueAct !== 'acknowledgement') {
        this.memory.consecutiveAcknowledgements = 0;
      }

      // Remember after choosing the reply. This ordering is the first-
      // mention guard: a fresh entity is never described as remembered.
      this.memory.rememberEntities(entities, this.memory.turnCount, { topics: this.currentTurnTopics, seriousness: this.currentTurnSeriousness });

      const isSafetyTurn = matchedRule && matchedRule.topic === 'safety';
      if (!isSafetyTurn && this.memory.isInDistressStreak() && !this.memory.distressNudgeGiven) {
        this.memory.distressNudgeGiven = true;
        reply = this._pickVaried(this.lang.distressNudges);
      } else if (!this.memory.isInDistressStreak()) {
        this.memory.distressNudgeGiven = false;
      }

      if (!isSafetyTurn) reply = this._maybeHumanTone(reply, normalized);
      if (!isSafetyTurn && this._shouldAddHumanTouch()) {
        const touchLine = this._humanTouchLine();
        if (touchLine) {
          reply = `${reply} ${touchLine}`.trim();
        }
      }

      // Advance conversation phase based on user engagement
      this._advanceConversationPhase(normalized);

      this.memory.rememberBotMessage(reply);
      return reply;
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

    /**
     * Resolves a small set of anaphoric phrases against the current subject.
     * It deliberately refuses to guess when the subject is absent or stale.
     * @param {string} normalizedText
     * @returns {{topic: string, entityRefs: string[], confidence: number}|null}
     */
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

    classifyDialogueAct(text, matchedRule = null) {
      // Test input detection (user testing the bot)
      if (TEST_INPUT_PATTERNS.test(text.trim())) return 'test_input';
      // Correction detection: check if the user is correcting a previous statement
      if (this._lastTurnCorrection) return 'correction';
      if (matchedRule?.topic === 'greeting') return 'greeting';
      if (matchedRule?.topic === 'gratitude') return 'gratitude';
      if (matchedRule?.topic === 'affirmation') return 'affirmation';
      if (matchedRule?.topic === 'negation') return 'negation';
      if (matchedRule?.topic === 'safety') return 'safety';
      // Acknowledgement detection (short, non-substantive responses)
      if (this._isAcknowledgement(text)) return 'acknowledgement';
      // Emotional statement detection (when no rule matches but emotion is present)
      if (this._isEmotionalStatement(text) && !matchedRule) return 'emotional_statement';
      // Question detection
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



    /**
     * Detects short acknowledgements (1 to 2 words) that do not add
     * new information.
     * @param {string} text
     * @returns {boolean}
     */
    _isAcknowledgement(text) {
      const words = text.trim().split(/\s+/u).filter(Boolean);
      if (words.length > ACKNOWLEDGEMENT_THRESHOLD) return false;
      const enAck = /^(?:ok|okay|k|sure|right|yeah|yep|i see|got it|understood|makes sense|noted|cool|fine|alright)$/iu;
      const faAck = /^(?:باشه|خب|خوب|متوجه|آره|اره|درست|چشم|بله|شه|اوه|آها|آحم)$/iu;
      return enAck.test(text.trim()) || faAck.test(text.trim());
    }

    /**
     * Detects emotional statements when no rule matches.
     * @param {string} text
     * @returns {boolean}
     */
    _isEmotionalStatement(text) {
      const score = scoreSentiment(text, this.lang.sentimentLexicon);
      return Math.abs(score) >= 2;
    }

    /**
     * Detects if the user's input mixes two scripts (bilingual).
     * @param {string} text
     * @returns {boolean}
     */
    _isMixedLanguage(text) {
      const ratio = scriptRatio(text, this.lang.scriptRange);
      if (ratio === null) return false;
      return ratio > MIXED_SCRIPT_THRESHOLD && ratio < (1 - MIXED_SCRIPT_THRESHOLD);
    }

    /**
     * Determines if a user turn substantively answers a pending question.
     * @param {string} text - normalized user text
     * @returns {boolean}
     */
    _isSubstantiveAnswer(text) {
      const words = text.trim().split(/\s+/u).filter(Boolean);
      if (words.length < SUBSTANTIVE_ANSWER_MIN_WORDS) return false;
      // Pure acknowledgements are not substantive
      if (this._isAcknowledgement(text)) return false;
      // Spam/noise is not substantive
      if (this._isSpamOrNoise(text)) return false;
      return true;
    }

    /**
     * Calibrates the emotional tone of a response based on detected emotion.
     * @param {string} reply - the draft reply
     * @param {string} detectedEmotion - primary emotion detected
     * @returns {string}
     */
    _calibrateEmotionalTone(reply, detectedEmotion) {
      const calibration = this.lang.emotionCalibration;
      if (!calibration || !calibration[detectedEmotion]) return reply;
      // Only apply calibration some of the time to avoid being heavy-handed
      if (Math.random() > 0.4) return reply;
      const prefix = calibration[detectedEmotion];
      return `${prefix} ${reply}`.trim();
    }

    /**
     * Detects the primary emotion in the user's text and stores it as a
     * public property so the UI layer can reference it without accessing
     * a private method.
     * @param {string} text
     * @returns {string}
     */
    _detectPrimaryEmotion(text) {
      this.lastDetectedEmotion = this._computePrimaryEmotion(text);
      return this.lastDetectedEmotion;
    }

    /**
     * Core emotion detection logic (extracted so the UI can reference
     * lastDetectedEmotion without calling a private method).
     * @param {string} text
     * @returns {string}
     */
    _computePrimaryEmotion(text) {
      const emotions = [
        // Physical / body sensation patterns (often indicate emotional distress
        // expressed somatically)
        { name: 'hurt', patterns: /(?:hurt|pain|broken|wounded|شکسته|آسیب|درد)/iu },
        { name: 'confused', patterns: /(?:confused|lost|don'?t understand|don'?t know|گیج|گم شدم|نمی‌فهمم|نمی‌دونم|سرگردان|نامشخص)/iu },
        { name: 'excited', patterns: /(?:excited|thrilled|amazing|awesome|great news|هیجان|عالی|فوق‌العاده|خارق‌العاده)/iu },
        { name: 'angry', patterns: /(?:angry|furious|pissed|hate|mad|annoyed|عصبانی|خشم|نفرت|کفری|عصبی)/iu },
        { name: 'grieving', patterns: /(?:grief|loss|died|passed away|gone|miss|mourn|فقدان|فوت|از دست دادن|داغ|سوگ)/iu },
        { name: 'fear', patterns: /(?:terrified|frightened|scared\s+(?:to\s+death|stiff|shitless|witless)|panic\s+(?:attack|mode)|phobia|horror|shook|لرزیدن|هراس|فوبیا|ترس\s+مرگ|شوکه|دلهره)/iu },
        { name: 'anxious', patterns: /(?:anxious|worry|panic|scared|afraid|nervous|نگران|اضطراب|ترس|دلشوره|وحشت)/iu },
        // Body sensation patterns that suggest stress or anxiety
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

    /**
     * Handles mixed-language input gracefully.
     * @param {string} text
     * @returns {string|null}
     */
    _handleMixedLanguage(text) {
      if (!this._isMixedLanguage(text)) return null;
      if (Math.random() > 0.6) return null; // Don't mention it every time
      const pool = Array.isArray(this.lang.mixedLanguageResponses)
        ? this.lang.mixedLanguageResponses : null;
      return pool && pool.length ? this._pickVaried(pool) : null;
    }

    questionNeedScore(dialogueAct, topics) {
      if (dialogueAct === 'question' || dialogueAct === 'gratitude' || dialogueAct === 'greeting') return 0;
      if (!topics.length) return 0.25;
      const seriousness = Math.max(...topics.map((topic) => this.lang.topicSeriousness?.[topic] ?? 0.45));
      return Math.min(0.9, 0.45 + seriousness * 0.35);
    }

    _phaseForTurn(strategy, seriousness) {
      if (strategy === 'safety') return 'safetySupport';
      if (strategy === 'context-reference') return 'contextualContinuation';
      if (strategy === 'topic-question' || strategy === 'question-acknowledgement') return 'clarifying';
      if (seriousness >= 0.5) return 'reflecting';
      return this.memory.turnCount <= 1 ? 'greeting' : 'listening';
    }

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

    _seriousnessForTurn(topics) {
      const values = (topics || []).map((topic) => this.lang.topicSeriousness?.[topic] ?? 0.45);
      const current = values.length ? Math.max(...values) : 0.35;
      const recent = this.memory.seriousnessHistory.slice(-2);
      const average = recent.length ? recent.reduce((sum, value) => sum + value, 0) / recent.length : 0;
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

    /**
     * Returns an opening from the explicit three-pool greeting policy. A
     * new conversation is inviting half the time (up from the old 30%);
     * both branches still ask the person to share rather than passively
     * asking how they are.
     */
    _openingForNewConversation() {
      const returning = this.memory.namedEntities.size > 0;
      const roll = Math.random();
      let pool;
      if (returning) {
        // Returning: 60% returning, 25% inviting, 15% open.
        pool = roll < 0.6
          ? (this.lang.greetingsReturning || this.lang.greentingsReturning)
          : roll < 0.85
            ? (this.lang.greetingsInviting || this.lang.greentingsInviting)
            : (this.lang.greetingsOpen || this.lang.greentingsOpen);
      } else {
        // New: 50% inviting, 35% open, 15% returning.
        pool = roll < 0.5
          ? (this.lang.greetingsInviting || this.lang.greentingsInviting)
          : roll < 0.85
            ? (this.lang.greetingsOpen || this.lang.greentingsOpen)
            : (this.lang.greetingsReturning || this.lang.greentingsReturning);
      }
      return this._pickVaried(pool || this.lang.greetings, { trackQuestions: false });
    }

    /**
     * Advances the conversation phase based on turn count and user engagement.
     * Phase flow: 'new' -> 'orienting' -> 'engaging' -> 'deepening'
     * - 'new': Just started, warm presence only
     * - 'orienting': First follow-up, gentle low-pressure choice
     * - 'engaging': User has engaged substantively, deeper questions ok
     * - 'deepening': Established conversation, full capabilities active
     */
    _advanceConversationPhase(userInput) {
      const wordCount = String(userInput || '').trim().split(/\s+/u).filter(Boolean).length;
      const turnCount = this.memory.turnCount;

      if (this.conversationPhase === 'new') {
        // After the first user reply, transition to orienting
        this.conversationPhase = 'orienting';
      } else if (this.conversationPhase === 'orienting' && turnCount >= 2) {
        // After 2+ user turns, check for substantive engagement
        if (wordCount >= 5 || this.currentTurnTopics.length > 0) {
          this.conversationPhase = 'engaging';
        } else if (turnCount >= 4) {
          // After several brief turns, still gently advance
          this.conversationPhase = 'engaging';
        }
      } else if (this.conversationPhase === 'engaging' && turnCount >= 6) {
        this.conversationPhase = 'deepening';
      }
    }

    /**
     * Returns a phase-appropriate greeting. Phase 1 ('new') uses a warm
     * presence-establishing greeting that doesn't ask for anything. Phase 2
     * ('orienting') shifts to the existing inviting/open pools for the
     * second turn. Phase 3+ uses the normal three-pool system.
     */
    _phaseGreeting() {
      // Phase 1: Always use the warm presence pool on the very first turn
      if (this.conversationPhase === 'new' && this.lang.greetingsPhase1 && this.lang.greetingsPhase1.length) {
        return this._pickVaried(this.lang.greetingsPhase1, { trackQuestions: false });
      }
      // Phase 2: On the second bot turn (first follow-up), use orienting pool
      if (this.conversationPhase === 'orienting' && this.lang.greetingsPhase2 && this.lang.greetingsPhase2.length) {
        return this._pickVaried(this.lang.greetingsPhase2, { trackQuestions: false });
      }
      // Phase 3+: Use the existing three-pool system
      return this._openingForNewConversation();
    }

    /**
     * Returns a varied opening greeting and records it in memory.
     * Uses phase-aware greeting pools (Phase 1 for very first message,
     * Phase 2 for first follow-up, returning pool if entities are
     * remembered, or open/inviting pools otherwise) so the conversation
     * starts with a contextually appropriate invitation.
     *
     * @returns {string}
     */
    greeting() {
      const text = this._phaseGreeting();
      this.memory.rememberBotMessage(text);
      return text;
    }

    /**
     * Returns a varied farewell and records it in memory.
     *
     * @returns {string}
     */
    farewell() {
      const text = this._pickVaried(this.lang.farewells);
      this.memory.rememberBotMessage(text);
      return text;
    }

    /**
     * Returns a neutral, open-ended confirmation message asking the user
     * if they really want to end the conversation. Called on the first
     * detection of an exit command, before the actual farewell. If the
     * user sends another exit-like message, the engine calls farewell()
     * instead.
     * @returns {string}
     */
    exitConfirmation() {
      const text = this._pickVaried(this.lang.exitConfirmMessages);
      this.memory.rememberBotMessage(text);
      return text;
    }

    // -- Internal helpers ----------------------------------------------------

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
          ? { thinkers: ['سقراط', 'رواقی', 'ارسطو', 'یونگ', 'نیچه', 'گاندی', 'ماندلا', 'چرچیل', 'زرتشت'], philosophy: ['فلسفه', 'فلسفی'], focus: ['تمرکز'], learning: ['یاد'], communication: ['ارتباط'], creativity: ['خلاق'] }
          : { thinkers: ['socrates', 'stoic', 'aristotle', 'jung', 'nietzsche', 'gandhi', 'mandela', 'churchill', 'zarathustra'], philosophy: ['philosophy'], focus: ['focus', 'concentrate'], learning: ['study', 'learn'], communication: ['communicate'], creativity: ['creative'] };
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

    /**
     * Produces a fallback reply when no rule matched (or to break a
     * repetition streak), choosing among several strategies in order of
     * how much conversational value they add:
     *   1. A callback to a different recently-discussed topic.
     *   2. A session check-in, at a periodic turn interval.
     *   3. If the message is a direct question, an acknowledgment that
     *      treats it as one, rather than reflecting it back unanswered.
     *   4. A quoted callback to something the person said earlier.
     *   5. (English only) a pronoun-swap reflection of what they just said.
     *   6. A generic or "strategy shift" fallback, alternated.
     * @param {string|null} preferTopic - A topic to avoid re-surfacing.
     * @param {string} normalizedUserText - The current message, for
     *   quoted-callback/reflection strategies. Empty when breaking a
     *   repetition streak rather than responding to fresh input.
     * @returns {string}
     */
    _fallbackResponse(preferTopic, normalizedUserText) {
      const entityCallback = this._respondToEntityReference();
      if (entityCallback) return entityCallback;

      // Session check-in (no topic referencing)
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

    /**
     * Occasionally callbacks to an emotionally salient entity from an
     * earlier turn. No current-entity list is needed: the map contains only
     * already-remembered turns, so the first mention can never hallucinate
     * an earlier reference. The probability is deliberately lower than
     * one, keeping callbacks conversational rather than mechanical.
     * @returns {string|null}
     */
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

    /**
     * Chooses a response from `pool`, actively avoiding lines used
     * recently so the conversation doesn't feel repetitive. Falls back
     * to "anything but the very last message" if every option has
     * recently been used, and only repeats outright if the pool has a
     * single entry.
     * @param {string[]} pool
     * @returns {string}
     */
    /** True when a bot line consumes one question from the small budget. */
    _isQuestionResponse(text) {
      if (/[?؟]/u.test(text)) return true;
      if (this.lang.questionPattern && this.lang.questionPattern.test(text)) return true;
      // Fallback templates can contain an embedded question clause without
      // ending in a question mark (for example, "I'm curious what's...").
      // Count those too, otherwise two question-shaped replies can bypass
      // the budget simply by using a period at the end.
      return /\b(?:what|why|how|who|when|where|which)\b/iu.test(text)
        || /(?<!\p{L})(?:چرا|چطور|چگونه|چیست|چیه|کجا|کیست|کیه|آیا)(?!\p{L})/u.test(text);
    }

    /**
     * Removes question-shaped options after the consecutive or rolling
     * budget is exhausted. This is intentionally pool-aware: if a pool has
     * a non-question alternative, the engine uses it instead of silently
     * asking a second question.
     */
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

    /** Records whether a selected response used a question turn. */
    _noteAskedQuestion(response) {
      if (this._isQuestionResponse(response)) {
        this.memory.consecutiveQuestions += 1;
        this.memory.askedQuestionTurns.push(this.memory.turnCount);
        this.memory.noteBotQuestion(response, this.currentTurnTopics[0] || this.memory.currentSubject.topic);
      } else {
        this.memory.consecutiveQuestions = 0;
      }
    }

    /** Whether a response pool contains a budget-safe non-question option. */
    _alternativeAvailable(pool) {
      return Array.isArray(pool) && pool.some((option) => !this._isQuestionResponse(option));
    }

    /** Returns a generic non-question alternative without consuming a budget. */
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
      // Last resort: pick any non-question response, or the first fallback
      const anyNonQuestion = this.lang.genericFallbacks.find((line) => !this._isQuestionResponse(line));
      return anyNonQuestion || this.lang.genericFallbacks[0] || '';
    }

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

  // ==========================================================================
  // Public API
  // ==========================================================================

  global.DaryaEngine = {
    isValidScript,
    scoreSentiment,
    normalizeForMatching,
    ENTITY_DECAY_PER_TURN,
    ENTITY_CALLBACK_PROBABILITY,
    CONSECUTIVE_QUESTION_LIMIT,
    QUESTION_BUDGET_WINDOW,
    QUESTION_BUDGET_LIMIT,
    ConversationMemory,
    DaryaResponseEngine,
  };
})(typeof window !== 'undefined' ? window : globalThis);
