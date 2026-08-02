/**
 * Darya classic script.
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
  function scriptRatio(text, scriptRange) {
    const letters = [...String(text)].filter((ch) => /\p{L}/u.test(ch));
    if (letters.length === 0) {
      return null;
    }
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
    if (ratio === null) {
      return true;
    }
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
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength).trim()}...`;
  }

  /**
   * Canonicalizes the raw input for rule matching. The original text is
   * preserved unchanged in memory, while the return value is stripped of
   * punctuation, zero-width non-joiners (ZWNJ / half-spaces), and
   * excessive whitespace so that orthographic variants of the same word
   * reach the same rule path. "خوشبین", "خوش‌بین", and "خوش بین" all
   * become the same token.
   *
   * Common Gen-Z and casual English abbreviations are also expanded here
   * (not in the language pack's normalize) so that the expanded form is
   * used only for rule/pattern matching and is never stored in the
   * conversation memory; Darya will never quote the expanded form
   * back to the user via the quoted-callback feature.
   */
  function normalizeForMatching(rawText, lang) {
    const normalized = lang.normalize(rawText);
    return (
      normalized
        .replace(/[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu, ' ')
        .replace(/[\u200c\u200d\u200b\ufeff]+/gu, '')
        .replace(/[ \t\r\n]+/gu, ' ')
        .trim()
        // Expand abbreviations for matching only (not stored in memory):
        .replace(/\bafaik\b/gi, 'as far as i know')
        .replace(/\bafk\b/gi, 'away from keyboard')
        .replace(/\bbrb\b/gi, 'be right back')
        .replace(/\bbtw\b/gi, 'by the way')
        .replace(/\bidk\b/gi, 'i do not know')
        .replace(/\bikr\b/gi, 'i know right')
        .replace(/\bimo\b/gi, 'in my opinion')
        .replace(/\bimho\b/gi, 'in my humble opinion')
        .replace(/\birl\b/gi, 'in real life')
        .replace(/\bjk\b/gi, 'just kidding')
        .replace(/\blmao\b/gi, 'laughing my ass off')
        .replace(/\blol\b/gi, 'laughing out loud')
        .replace(/\bngl\b/gi, 'not gonna lie')
        .replace(/\bnp\b/gi, 'no problem')
        .replace(/\bnvm\b/gi, 'never mind')
        .replace(/\bofc\b/gi, 'of course')
        .replace(/\bomg\b/gi, 'oh my god')
        .replace(/\bsmh\b/gi, 'shaking my head')
        .replace(/\btbf\b/gi, 'to be fair')
        .replace(/\btbh\b/gi, 'to be honest')
        .replace(/\bty\b/gi, 'thank you')
        .replace(/\btyvm\b/gi, 'thank you very much')
        .replace(/\bwth\b/gi, 'what the hell')
        .replace(/\bwtf\b/gi, 'what the fuck')
    );
  }

  /**
   * Scores a normalized message using a simple keyword lexicon: +1 for
   * each positive-lexicon word found, -1 for each negative-lexicon word
   * found. Words are matched per token as the LONGEST prefix of the
   * token, which tolerates attached Persian person suffixes ("ناراحتم"
   * matches "ناراحت") while avoiding substring false positives ("راحت"
   * inside "ناراحت", or "غم" inside "غمگین"). Negation words listed in
   * the lexicon's optional `negations` array flip the polarity of an
   * adjacent sentiment word ("خوب نیست" and "not happy" score
   * negative). This is a lightweight heuristic consistent with the rest
   * of the engine's keyword-driven design, not a real sentiment model.
   * @param {string} normalizedText
   * @param {{positive: string[], negative: string[], negations?: string[]}} lexicon
   * @returns {number}
   */
  function scoreSentiment(normalizedText, lexicon) {
    const tokens = normalizedText.split(/\s+/u).filter(Boolean);
    const negations = new Set(lexicon.negations || []);
    let score = 0;
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      let contribution = 0;
      let bestLength = 0;
      for (const word of lexicon.negative) {
        if (token.startsWith(word) && word.length > bestLength) {
          bestLength = word.length;
          contribution = -1;
        }
      }
      for (const word of lexicon.positive) {
        if (token.startsWith(word) && word.length > bestLength) {
          bestLength = word.length;
          contribution = 1;
        }
      }
      if (contribution === 0) {
        continue;
      }
      const negated =
        (i > 0 && negations.has(tokens[i - 1])) ||
        (i > 1 && negations.has(tokens[i - 2])) ||
        (i < tokens.length - 1 && negations.has(tokens[i + 1]));
      score += negated ? -contribution : contribution;
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
    if (
      words.length < PRONOUN_REFLECTION_MIN_WORDS ||
      words.length > PRONOUN_REFLECTION_MAX_WORDS
    ) {
      return null;
    }

    let swapped = false;
    const result = words.map((token) => {
      const match = token.match(/^([A-Za-z']+)([.,!?]*)$/);
      if (!match) {
        return token;
      }
      const [, word, punct] = match;
      const lower = word.toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(pronounMap, lower)) {
        return token;
      }

      swapped = true;
      let replacement = pronounMap[lower];
      if (word[0] === word[0].toUpperCase() && lower !== 'i') {
        replacement =
          replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement + punct;
    });

    if (!swapped) {
      return null;
    }
    return result.join(' ');
  }

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
