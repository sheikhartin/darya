/**
 * Darya — generic Rogerian conversation engine core.
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
 *     consecutive negative-leaning messages trigger one gentle, optional
 *     grounding-technique offer (paced breathing) plus a nudge toward
 *     professional support if things continue -- distinct from, and
 *     lower-priority than, the hard-coded safety-keyword rule, which
 *     always takes precedence for any language of self-harm.
 *   - Quoted-memory callbacks: occasionally reflects the person's own
 *     earlier words back to them verbatim ("Earlier you mentioned...") --
 *     a core reflective-listening technique from person-centered therapy,
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
    return `${text.slice(0, maxLength).trim()}…`;
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
   * avoidance. Purely in-memory (per browser tab) -- no persistence, no
   * server.
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
    }

    rememberUtterance(utterance) {
      this.recentUtterances.push(utterance);
      if (this.recentUtterances.length > this.capacity) this.recentUtterances.shift();
    }

    rememberTopic(topic) {
      this.recentTopics.push(topic);
      if (this.recentTopics.length > this.capacity) this.recentTopics.shift();

      if (topic === this.lastRuleTopic) {
        this.sameRuleStreak += 1;
      } else {
        this.sameRuleStreak = 1;
      }
      this.lastRuleTopic = topic;
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
    rememberEntities(entities, turn = this.turnCount) {
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
          });
        }
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
     * negative -- used to trigger (at most once per streak) a gentle
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
    }

    /**
     * Checks whether the (normalized) input signals the user wants to leave.
     * @param {string} rawText
     * @returns {boolean}
     */
    isExitCommand(rawText) {
      const normalized = this.lang.normalize(rawText).toLowerCase();
      return this.lang.exitKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
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
      const sentimentScore = scoreSentiment(normalized, this.lang.sentimentLexicon);
      this.memory.rememberUtterance(normalized);
      this.memory.rememberSentiment(sentimentScore);
      this.memory.turnCount += 1;
      this.memory.decayNamedEntities();

      // Entity extraction is gated on emotional weight. Neutral turns can
      // still be answered normally, but they do not create a personal-data
      // memory in the first place.
      const entities = global.DaryaEntityExtractor
        ? global.DaryaEntityExtractor.extract(normalized, this.lang, {
          emotionalWeight: sentimentScore !== 0,
        })
        : [];
      this._turnEntities = entities;

      const { rule: matchedRule, captured } = this._matchRule(normalized);
      let reply = matchedRule
        ? this._respondWithRule(matchedRule, captured)
        : this._fallbackResponse(null, normalized);
      // Remember after choosing the reply. This ordering is the first-
      // mention guard: a fresh entity is never described as remembered.
      this.memory.rememberEntities(entities);

      // The distress nudge is a caring, optional add-on layered on top of
      // whatever the normal flow produced -- but it never overrides the
      // dedicated safety-keyword rule, which already gives the more
      // serious crisis response.
      const isSafetyTurn = matchedRule && matchedRule.topic === 'safety';
      if (!isSafetyTurn && this.memory.isInDistressStreak() && !this.memory.distressNudgeGiven) {
        this.memory.distressNudgeGiven = true;
        reply = this._pickVaried(this.lang.distressNudges);
      } else if (!this.memory.isInDistressStreak()) {
        this.memory.distressNudgeGiven = false;
      }

      this.memory.rememberBotMessage(reply);
      return reply;
    }

    /**
     * Returns an opening from the explicit three-pool greeting policy. A
     * new conversation is inviting half the time (up from the old 30%);
     * both branches still ask the person to share rather than passively
     * asking how they are.
     */
    _openingForNewConversation() {
      const inviting = Math.random() < 0.5;
      const pool = inviting
        ? (this.lang.greetingsInviting || this.lang.greentingsInviting)
        : (this.lang.greetingsOpen || this.lang.greentingsOpen);
      return this._pickVaried(pool || this.lang.greetings, { trackQuestions: false });
    }

    /** Returns a varied opening greeting and records it in memory. */
    greeting() {
      const text = this._openingForNewConversation();
      this.memory.rememberBotMessage(text);
      return text;
    }

    /** Returns a varied farewell and records it in memory. */
    farewell() {
      const text = this._pickVaried(this.lang.farewells);
      this.memory.rememberBotMessage(text);
      return text;
    }

    // -- Internal helpers ----------------------------------------------------

    _matchRule(normalizedText) {
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
        return { rule: currentRule, captured };
      }
      return { rule: null, captured: '' };
    }

    _respondWithRule(matchedRule, captured) {
      this.memory.rememberTopic(matchedRule.topic);

      if (this.memory.sameRuleStreak > MAX_CONSECUTIVE_SAME_RULE) {
        return this._fallbackResponse(matchedRule.topic, '');
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

      // Nothing meaningful was captured -- avoid an awkward empty
      // reflection like "چرا فکر می‌کنید که ؟" by preferring a
      // capture-free response from the same rule, else a generic phrase.
      const captureFree = matchedRule.responses.filter((r) => !r.includes('{captured}'));
      if (captureFree.length > 0) return this._pickVaried(captureFree);
      return this._pickVaried(this.lang.genericFallbacks);
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

      const exclude = preferTopic ? [preferTopic] : [];
      const topic = this.memory.mostCommonTopic(exclude);
      if (topic && this.lang.topicCallbacks[topic]) {
        return this._pickVaried(this.lang.topicCallbacks[topic]);
      }

      if (this.memory.turnCount > 0 && this.memory.turnCount % this.lang.checkInEvery === 0) {
        return this._pickVaried(this.lang.sessionCheckIns);
      }

      if (normalizedUserText && this.lang.questionPattern.test(normalizedUserText)) {
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
    _respondToEntityReference() {
      const threshold = Number.isFinite(this.entityCallbackThreshold)
        ? Math.max(0, Math.min(1, this.entityCallbackThreshold))
        : 0.6;
      const probability = Number.isFinite(this.entityCallbackProbability)
        ? Math.max(0, Math.min(1, this.entityCallbackProbability))
        : ENTITY_CALLBACK_PROBABILITY;
      const candidates = this.memory.eligibleNamedEntities(threshold)
        .filter((entity) => entity.lastMentionTurn < this.memory.turnCount);
      if (candidates.length === 0 || Math.random() >= probability) return null;

      const entity = candidates[0];
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
      const pools = [this.lang.genericFallbacks, this.lang.strategyShiftFallbacks];
      for (const pool of pools) {
        const candidate = pool.find((line) => !this._isQuestionResponse(line) && line !== response);
        if (candidate) return candidate;
      }
      return this.lang.genericFallbacks[0] || '';
    }

    _pickVaried(pool, options = {}) {
      const original = Array.isArray(pool) ? pool : [];
      if (original.length === 0) return '';
      let budgeted = this._filterForQuestionBudget(original);
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

      const picked = candidates[Math.floor(Math.random() * candidates.length)];
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
    ENTITY_DECAY_PER_TURN,
    ENTITY_CALLBACK_PROBABILITY,
    CONSECUTIVE_QUESTION_LIMIT,
    QUESTION_BUDGET_WINDOW,
    QUESTION_BUDGET_LIMIT,
    ConversationMemory,
    DaryaResponseEngine,
  };
})(typeof window !== 'undefined' ? window : globalThis);
