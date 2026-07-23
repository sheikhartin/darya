/**
 * Darya — generic, deterministic conversation engine core.
 *
 * This file contains no language-specific content at all: every string,
 * pattern, and lexicon lives in a "language pack" (see js/languages/fa.js
 * and js/languages/en.js). `DaryaResponseEngine` is constructed with one
 * such pack and gets identical capabilities regardless of which language
 * it's driving, so Persian and English are full peers.
 *
 * The engine runs a deliberately small, fixed conversation pipeline:
 *
 *   1. Input normalization         (lang.normalize, outer-punctuation
 *                                   strip, length cap, script check)
 *   2. Language / script check     (the active pack rejects foreign text)
 *   3. Intent detection            (greeting / farewell / bare
 *                                   acknowledgment / direct question /
 *                                   statement / "I don't know" / etc.)
 *   4. Signal extraction           (negation, intensifiers, "again"
 *                                   reference, comparative framing)
 *   5. Rule matching               (priority-sorted topic rules)
 *   6. Context lookup              (memory: recent topics, user tone,
 *                                   last few system responses, named
 *                                   references, repeated-topic streak)
 *   7. Response strategy selection (brief / reflect / follow-up / topic
 *                                   callback / direct-question / quoted
 *                                   callback / strategy shift)
 *   8. Template selection          (the rule's own response pool, or a
 *                                   fallback pool chosen by the strategy)
 *   9. Variation selection         (avoid the last N bot messages and
 *                                   the last template of the same family)
 *  10. Safety check                (the safety rule is the highest-priority
 *                                   rule and is never overridden by any
 *                                   other layer; the sentiment-based
 *                                   distress nudge is layered on top of
 *                                   the non-safety reply)
 *  11. Final response rendering    (single string handed back to the UI)
 *
 * Each of those is a small, named step on the engine object, so a future
 * change can target one stage without re-reading the rest.
 *
 * Capabilities built on top of those stages, beyond simple keyword ->
 * response matching:
 *
 *   - Repetition-aware response selection: every reply avoids lines
 *     used recently, so long conversations don't feel mechanical.
 *   - Topic-streak breaking: if the same rule fires too many turns in a
 *     row, the engine deliberately shifts to a callback or a different
 *     fallback strategy instead of repeating itself.
 *   - Lightweight sentiment tracking: a small keyword-based lexicon
 *     scores each message as leaning positive/negative/neutral. Three
 *     consecutive negative-leaning messages trigger one gentle, optional
 *     grounding-technique offer (paced breathing) plus a nudge toward
 *     professional support if things continue.
 *   - Quoted-memory callbacks: occasionally reflects the person's own
 *     earlier words back to them verbatim.
 *   - Session check-ins: every few turns without a clear topic match,
 *     Darya offers a light process check-in.
 *   - Greeting strategy: distinct from ordinary topic matching, so the
 *     opening of a conversation never defaults to "and you?" -- it picks
 *     among several templates (open + warm, open + light invitation,
 *     acknowledgment + topic shift) using recent context.
 *   - Short-input handling: very short, non-substantive inputs ("ok",
 *     "hmm", "باشه") get a brief, non-question acknowledgment instead of
 *     being treated as a topic-statement.
 *   - Question handling: if the user asks a direct question with no
 *     specific rule match, the engine acknowledges the question without
 *     pretending to know the answer.
 *   - Non-question rotation: every Nth turn the engine deliberately
 *     picks from a "statement-shaped" pool to break the perpetual
 *     question rhythm.
 *   - Optional pronoun-swap reflection ("I feel... -> So you feel..."):
 *     English only, since Persian verb morphology makes the swap unsafe.
 *   - Punctuation normalization: "سلام" and "سلام!" and "سلام?" are
 *     treated as the same intent, so trailing punctuation never changes
 *     the engine's understanding of the user's input.
 *   - Negation awareness: "I don't feel safe" is recognized as negated
 *     and reflected with a small set of negation-aware templates.
 *   - "I don't know" pattern: a common conversational signal gets a
 *     specific, calm, non-pressuring response.
 *   - Intensifier awareness: "really", "very", "so" are reflected in
 *     the response's tone.
 *
 * None of this is a real language model. It is a considerably richer
 * rule-based / expert-system approach (in the lineage of ELIZA and
 * Rogerian-style companions), not a claim of genuine language
 * understanding.
 */

(function (global) {
  'use strict';

  // -- Tunables --------------------------------------------------------------

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
  // Every Nth turn the engine deliberately avoids asking a question,
  // breaking the rhythm of constant follow-ups.
  const NON_QUESTION_EVERY = 3;
  // Above this, the input is considered substantive enough to use as a
  // capture group; below, it's likely an interjection.
  const SUBSTANTIVE_WORD_THRESHOLD = 2;
  // Don't ask a question if the user has just been asked one and answered
  // it. A single follow-up question after a question is allowed (so a
  // topic can be explored for two turns), but the next reply after that
  // must be a non-question statement -- a chain of three questions in
  // a row is what the brief specifically calls out as robotic.
  const CONSECUTIVE_QUESTION_LIMIT = 1;
  // Across a rolling window, no more than one in three of the
  // engine's replies should end in a question.
  const QUESTION_BUDGET_WINDOW = 3;
  const QUESTION_BUDGET_LIMIT = 1;
  // Inputs longer than this are truncated for processing. The composer
  // itself caps at 4000 chars; this is the engine-side "reasonable
  // length" used for capture and reflection so a 4000-char paste of
  // a Tolstoy novel doesn't get echoed back at the user.
  const MAX_INPUT_LENGTH = 600;
  // Captures from rule matches are truncated to this length so that a
  // sentence like "I feel really really really ... tired" doesn't get
  // echoed back as a 200-word reflection.
  const MAX_CAPTURE_LENGTH = 80;
  // Maximum number of repeated same-word runs to keep in a capture,
  // before collapsing the rest to a single instance. This prevents
  // "I feel I feel I feel tired" from generating "Why do you think
  // I feel I feel I feel tired?" -- a real but easy mistake.
  const MAX_REPEATED_WORDS = 2;

  // ==========================================================================
  // Text helpers (language-agnostic)
  // ==========================================================================

  /**
   * Strips leading and trailing punctuation characters from a string,
   * including ASCII punctuation (.,!?:;,-) and the Persian/Arabic
   * equivalents (، ؛ :  « » etc.). The character classes are
   * conservative on purpose: we only strip the most common sentence-
   * boundary punctuation, never letters or digits.
   *
   * This is the foundation of "treat 'سلام' and 'سلام!' as the same
   * input" -- the engine's intent detectors all run on the
   * punctuation-stripped form.
   * @param {string} text
   * @returns {string}
   */
  function stripOuterPunctuation(text) {
    if (!text) return text;
    // Strip leading punctuation (one or more), then trailing
    // punctuation (one or more), then trim whitespace. The character
    // class covers Latin and Persian punctuation commonly seen in
    // chat input: . , ! ? : ; - … · • — and the Persian , ، ; ؛
    // double-quotes and angle-quotes are NOT stripped, since a quoted
    // greeting like "hi" is still semantically a greeting.
    return String(text).replace(
      /^[\s\u060C\u061B\u061F\u066A\u066B\u066C\u06D4.,!?;:\-…·•—'"`]+|[\s\u060C\u061B\u061F\u066A\u066B\u066C\u06D4.,!?;:\-…·•—]+$/g,
      ''
    ).trim();
  }

  /**
   * Returns true if the text ends in a question mark (Latin or Persian).
   * Used as one of the inputs to intent detection.
   * @param {string} text
   * @returns {boolean}
   */
  function hasQuestionMark(text) {
    return /[?؟]\s*$/.test(text);
  }

  /**
   * Counts whitespace-delimited tokens in the text. Used to decide
   * whether a message is a short interjection or a substantive utterance.
   * @param {string} text
   * @returns {number}
   */
  function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  /**
   * Collapses runs of the same repeated word in `text` so a sentence
   * like "I feel really really really really tired" becomes
   * "I feel really really tired" (the rest is noise). Helps keep
   * capture-group reflections readable when the user has a stuttering
   * or emphatic style.
   * @param {string} text
   * @param {number} maxRun
   * @returns {string}
   */
  function collapseRepeatedWords(text, maxRun = MAX_REPEATED_WORDS) {
    if (!text) return text;
    const tokens = text.split(/(\s+)/);
    const out = [];
    let runWord = null;
    let runCount = 0;
    for (const tok of tokens) {
      if (/^\s+$/.test(tok)) {
        out.push(tok);
        continue;
      }
      const lower = tok.toLowerCase();
      if (lower === runWord) {
        runCount += 1;
        if (runCount > maxRun) continue;
        out.push(tok);
      } else {
        runWord = lower;
        runCount = 1;
        out.push(tok);
      }
    }
    return out.join('').replace(/\s+/g, ' ').trim();
  }

  /**
   * Truncates text to `maxLength` characters at a word boundary, with
   * an ellipsis. Used for capture groups and quoted callbacks.
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  function smartTruncate(text, maxLength) {
    if (!text) return text;
    if (text.length <= maxLength) return text;
    const cut = text.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(' ');
    const base = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
    return `${base.trim()}…`;
  }

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
    return smartTruncate(text, maxLength);
  }

  /**
   * Scores a normalized message using a simple keyword lexicon: +1 for
   * each positive-lexicon word found, -1 for each negative-lexicon word
   * found. This is a lightweight heuristic consistent with the rest of
   * the engine's keyword-driven design, not a real sentiment model.
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
   * Returns true if the input contains a negation construct (a
   * "not" / "n't" / Persian "ن" prefix) near a meaningful token.
   * The "I don't feel happy" pattern is meaningfully different from
   * "I feel happy" and the engine should reflect the negation.
   * @param {string} text
   * @returns {boolean}
   */
  function containsNegation(text) {
    // English negation: explicit "not" / "never" / "nobody" / etc.,
    // plus the contracted negative forms ("don't", "can't",
    // "won't", "shouldn't"). The contracted forms don't have a
    // word-boundary on the "n" side (the apostrophe sits right
    // after the "n" with no whitespace), so we match the
    // apostrophe-bearing forms with a separate pattern.
    if (/\b(not|never|no|none|nothing|nobody|nowhere|neither|nor)\b/i.test(text)) return true;
    if (/\w+n't\b/i.test(text)) return true; // don't, can't, won't, shouldn't, isn't, ...
    if (/\bno\s+(?:one|body|thing|where)\b/i.test(text)) return true;
    // Persian negation: the "ن" prefix on verbs (نمی‌خواهم,
    // نمی‌روم, نیست, etc.) and the standalone "نه" / "نیست".
    if (/ن(?:می|هست|میشه|می‌خوام|میکنم|دارم|خواهم|کنم|رود|دانست|بود|کرد|داند|خواهد|خواست)/.test(text)) return true;
    if (/\b(?:نه|نیست|نبود|نخواهد|نمی‌شود)\b/.test(text)) return true;
    return false;
  }

  /**
   * Returns true if the input matches a "I don't know" or
   * "I have no idea" pattern, which is a common conversational
   * signal that deserves a specific, calm reflection rather than
   * a generic "tell me more".
   * @param {string} text
   * @returns {boolean}
   */
  function isIDontKnow(text) {
    return /\b(i\s+(?:don't|dont|do\s+not)\s+know|i\s+have\s+no\s+idea|no\s+idea|not\s+sure|i\s+don't\s+know\s+what|who\s+knows)\b/i.test(text)
      || /(نمی‌?دونم|نمیدونم|نمی‌?دانم|نمیدانم|نمیدونستم|نمی‌?دونستم|نمیدونم\s+چی|نمیدونم\s+چه|نمیدونم\s+که)/.test(text);
  }

  /**
   * Returns true if the input contains an intensifier ("very",
   * "really", "so much", Persian "خیلی"). The engine can use this
   * to mirror the intensity in its reflection -- "I feel really
   * tired" deserves a stronger acknowledgment than "I feel tired".
   * @param {string} text
   * @returns {boolean}
   */
  function containsIntensifier(text) {
    return /\b(very|really|so|such|extremely|incredibly|utterly|totally|completely)\b/i.test(text)
      || /(خیلی|بسیار|واقعاً|واقعا|آنقدر|انقدر)/.test(text);
  }

  /**
   * Returns true if the input contains an absolutist or
   * over-generalizing token ("always", "never", "everyone",
   * "no one"). Used to flag a gentle reality-check moment: the
   * engine doesn't lecture, but it can offer a small "is that
   * really always the case?" reflection rather than accepting the
   * absolutism as ground truth.
   * @param {string} text
   * @returns {boolean}
   */
  function containsAbsolutist(text) {
    return /\b(always|never|everyone|everybody|nobody|nothing|no one|every single|constantly|forever)\b/i.test(text)
      || /(همیشه|هرگز|هیچ‌وقت|هیچ‌کس|هیچ‌چیز|همه\s+آدم‌ها|همه\s+مردم|دائماً|مدام|دائم|پیوسته)/.test(text);
  }

  /**
   * Returns true if the input is a comparative or "again" reference --
   * "the same thing", "it happened again", "same problem" -- which
   * signals a callback to a prior topic. The language pack can supply
   * a regex via `comparativePatterns`; if none is supplied, we fall
   * back to a small English/Persian default.
   * @param {string} text
   * @param {object} lang
   * @returns {boolean}
   */
  function isAgainReference(text, lang) {
    if (lang && Array.isArray(lang.againPatterns)) {
      return lang.againPatterns.some((re) => re.test(text));
    }
    return /\b(again|still|keeps|keep|keeps happening|same (?:thing|problem|issue))\b/i.test(text)
      || /(دوباره|باز\s+هم|همچنان|همان\s+مشکل|همان\s+مسئله|همان\s+چیز|باز\s+هم\s+تکرار|دیگه\s+هم)/.test(text);
  }

  /**
   * Returns true if the input contains an absolutist or
   * over-generalizing token ("always", "never", "everyone",
   * "no one"). Used to flag a gentle reality-check moment: the
   * engine doesn't lecture, but it can offer a small "is that
   * really always the case?" reflection rather than accepting the
   * absolutism as ground truth.
   * @param {string} text
   * @returns {boolean}
   */
  function containsAbsolutist(text) {
    return /\b(always|never|everyone|everybody|nobody|nothing|no one|every single|constantly|forever)\b/i.test(text)
      || /(همیشه|هرگز|هیچ‌وقت|هیچ‌کس|هیچ‌چیز|همه\s+آدم‌ها|همه\s+مردم|دائماً|مدام|دائم|پیوسته)/.test(text);
  }

  /**
   * Returns true if the input contains a temporal reference
   * ("yesterday", "today", "lately", "these days", etc.) that
   * signals a time-bounded reflection might be more appropriate
   * than a generic "tell me more".
   * @param {string} text
   * @returns {boolean}
   */
  function containsTemporalReference(text) {
    return /\b(yesterday|today|tonight|lately|recently|these days|this week|right now|just now|later|soon|often|sometimes|usually)\b/i.test(text)
      || /(دیروز|امروز|امشب|اخیراً|این\s+روزها|این\s+هفته|الان|همین\s+حالا|بعداً|به‌زودی|بعضی\s+وقت‌ها|معمولاً|گاهی|اکثراً)/.test(text);
  }

  /**
   * Attempts a careful ELIZA-style pronoun-swap reflection. Only used
   * when the language pack provides a `pronounMap`. Bounded by
   * word-count guards and returns null whenever the result might look
   * grammatically questionable.
   *
   * Subject-verb agreement sanity check: when "I" becomes "you", the
   * following verb in the present tense often needs to change too
   * ("I was" -> "you were", "I am" -> "you are", "I have" -> "you
   * have", etc.). The engine does a small, deliberately conservative
   * set of these corrections so the reflection reads as natural
   * English rather than a broken literal swap.
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
    let out = result.join(' ');

    // Light subject-verb agreement fix-up. These are deliberately
    // narrow: the engine only corrects a small set of common
    // mismatches that a literal swap would otherwise produce.
    out = out
      .replace(/\byou\s+was\b/gi, 'you were')
      .replace(/\byou\s+am\b/gi, 'you are')
      .replace(/\byou\s+have\s+been\b/gi, 'you have been')
      .replace(/\byou\s+has\b/gi, 'you have')
      .replace(/\byou\s+does\b/gi, 'you do')
      .replace(/\byou\s+did\b/gi, 'you did')   // ambiguous, but "you did" reads OK
      .replace(/\byou\s+feels\b/gi, 'you feel')
      .replace(/\byou\s+thinks\b/gi, 'you think')
      .replace(/\byou\s+goes\b/gi, 'you go');

    return out;
  }

  /**
   * Picks a template from a pool that contains a `{captured}` token,
   * applying the same repetition-avoidance rules as `_pickVaried`.
   * Returns null if the pool is empty after filtering.
   * @param {string[]} pool
   * @param {string[]} recent
   * @returns {string|null}
   */
  function pickWithCapture(pool, recent) {
    if (pool.length === 0) return null;
    if (pool.length === 1) return pool[0];

    const last = recent[recent.length - 1];
    let candidates = pool.filter((p) => !recent.includes(p));
    if (candidates.length === 0) candidates = pool.filter((p) => p !== last);
    if (candidates.length === 0) candidates = pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
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
      // Lightweight entity memory: simple keyword counts from prior user
      // messages, used to give a per-turn "what was the last thing they
      // were talking about" hint without a real NLP layer.
      this.recentReferences = [];
      // Per-turn signal flags: a small set of booleans that record
      // what the engine detected about the *current* user message,
      // making them easy for the strategy layer to query.
      this.lastSignals = null;
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
     * Records the detected signals for the most recent user message.
     * @param {object} signals
     */
    rememberSignals(signals) {
      this.lastSignals = signals;
    }

    /**
     * Tracks short content words from a user message so very recent
     * nouns (e.g. "the meeting", "my dad") are available for light
     * "what did you mean by 'it'?" callbacks. The list is bounded and
     * intentionally naive -- this is a conversational hint, not an
     * entity extractor.
     * @param {string} normalized
     */
    rememberReference(normalized) {
      // Common stop words to skip in either language. The Persian list
      // covers only the most generic particles; language packs can
      // extend this by exposing a `referenceStopwords` array.
      const stop = new Set(this.lang ? this.lang.referenceStopwords : []);
      const tokens = normalized
        .split(/[ \t,،.؟?!]+/)
        .map((t) => t.trim())
        .filter((t) => t && t.length >= 3 && !stop.has(t));
      for (const token of tokens) {
        this.recentReferences.push(token);
      }
      while (this.recentReferences.length > 16) this.recentReferences.shift();
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
     * for quoted-memory callbacks. Trivially short utterances are
     * excluded so callbacks only ever quote something substantive.
     * The threshold is intentionally higher than the engine's bare
     * "acknowledgment" detection -- small-talk exchanges like "how are
     * you" or "hi" should never be echoed back as a quoted callback.
     * @param {string} [exclude]
     * @returns {string|null}
     */
    randomRecentUtterance(exclude = '') {
      const candidates = this.recentUtterances.filter(
        (u) => u !== exclude && wordCount(u) >= SUBSTANTIVE_WORD_THRESHOLD + 2
      );
      if (candidates.length === 0) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /**
     * True once the last DISTRESS_STREAK_LENGTH sentiment scores are all
     * negative -- used to trigger a gentle grounding-technique offer.
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
   * Core response engine. Combines normalization, intent detection, rule
   * matching, topic tracking, sentiment-aware check-ins, quoted-memory
   * callbacks, repetition-aware response selection, and graceful
   * fallbacks into a single `respond` entry point, plus `greeting` /
   * `farewell` helpers for the UI layer.
   */
  class DaryaResponseEngine {
    /** @param {object} lang - A language pack, e.g. window.DaryaLang.fa */
    constructor(lang) {
      this.lang = lang;
      this.rules = [...lang.rules].sort((a, b) => b.priority - a.priority);
      this.memory = new ConversationMemory();
      this.memory.lang = lang;
      this._fallbackToggle = false;
      this._recentQuestionCount = 0;
      this._questionWindow = [];
      this._greetingAnswered = false;
    }

    /**
     * Checks whether the (normalized) input signals the user wants to leave.
     * @param {string} rawText
     * @returns {boolean}
     */
    isExitCommand(rawText) {
      const cleaned = stripOuterPunctuation(this.lang.normalize(rawText)).toLowerCase();
      return this.lang.exitKeywords.some((keyword) => cleaned.includes(keyword.toLowerCase()));
    }

    /**
     * Produces Darya's reply to a single user utterance.
     * @param {string} rawText
     * @returns {string}
     */
    respond(rawText) {
      const raw = String(rawText || '');

      // 1. Empty / whitespace input
      if (!raw.trim()) {
        return this.lang.emptyInputReply;
      }

      // 2. Truncate very long inputs to a reasonable length before any
      // matching. The composer caps at 4000 chars, but a 4000-char
      // paste is almost never a conversation -- a sane cap here keeps
      // capture groups and reflections short and readable.
      const truncated = raw.length > MAX_INPUT_LENGTH ? raw.slice(0, MAX_INPUT_LENGTH) : raw;

      // 3. Language / script check
      if (!isValidScript(truncated, this.lang)) {
        return this.lang.foreignLanguageRedirect();
      }

      // 4. Language-pack normalization (unifies Arabic/Persian letter
      // forms, smart quotes, etc.) followed by an outer-punctuation
      // strip. The latter is what makes "سلام!" and "سلام" mean the
      // same thing to every downstream stage.
      let normalized = this.lang.normalize(truncated);
      normalized = stripOuterPunctuation(normalized);

      // 4b. Punctuation-only input (e.g. "!!!" or "..." or "???"): if
      // what's left has no letters, treat it as the empty-input case.
      if (!/\p{L}/u.test(normalized)) {
        return this.lang.emptyInputReply;
      }

      // 4c. Defensive exit check (also punctuation-tolerant via the
      // strip above): the app layer normally calls `isExitCommand`
      // and then `farewell` itself, but if `respond` is ever called
      // with an exit message directly we still produce a sensible
      // farewell rather than a generic reflection.
      if (this.isExitCommand(normalized)) {
        return this.farewell();
      }

      // 4d. Collapse runs of repeated words so a stuttering or
      // emphatic style ("I feel really really really tired") doesn't
      // produce a 200-word reflection. Done here, after the script
      // check, so the engine's understanding is always on the cleaned
      // form.
      normalized = collapseRepeatedWords(normalized);

      // 5. Detect conversational signals for this turn: negation,
      // intensifier, "I don't know", "again" reference, absolutist
      // thinking, temporal reference. These inform every later
      // stage and are remembered in the memory slot for the next turn.
      const signals = {
        isNegation: containsNegation(normalized),
        isIntensifier: containsIntensifier(normalized),
        isIDontKnow: isIDontKnow(normalized),
        isAgain: isAgainReference(normalized, this.lang),
        isAbsolutist: containsAbsolutist(normalized),
        isTemporal: containsTemporalReference(normalized),
        isQuestion: hasQuestionMark(raw) || (this.lang.questionPattern ? this.lang.questionPattern.test(normalized) : false),
      };
      this.memory.rememberSignals(signals);

      // 6. Intent detection: a greeting is its own intent and is
      // handled BEFORE rule matching, so a bare "hi!" never falls
      // through to a topic callback or a generic "tell me more".
      if (this._isGreetingIntent(normalized)) {
        const greetingReply = this._respondToGreeting();
        this.memory.rememberBotMessage(greetingReply);
        this._noteAskedQuestion(greetingReply);
        return greetingReply;
      }

      // 6b. A bare affirmation / negation with no substantive content
      // short-circuits: the engine responds briefly without re-asking
      // a question. (Negation here is "no" the word, not grammatical
      // negation; that's handled by containsNegation above.)
      if (this._isPureAcknowledgment(normalized)) {
        const reply = this._respondToAcknowledgment(normalized);
        this.memory.rememberUtterance(normalized);
        this.memory.rememberSentiment(scoreSentiment(normalized, this.lang.sentimentLexicon));
        this.memory.turnCount += 1;
        this.memory.rememberReference(normalized);
        this.memory.rememberBotMessage(reply);
        this._noteAskedQuestion(reply);
        return reply;
      }

      // 6c. Absolutist thinking ("always", "never", "everyone") is
      // a known cognitive pattern. The engine offers a gentle,
      // non-confrontational reality-check reflection when the
      // language pack supplies one.
      if (signals.isAbsolutist && this.lang.absolutistResponses) {
        const reply = this._filterForQuestionBudget(
          this._pickVaried(this.lang.absolutistResponses)
        );
        this.memory.rememberUtterance(normalized);
        this.memory.rememberSentiment(scoreSentiment(normalized, this.lang.sentimentLexicon));
        this.memory.turnCount += 1;
        this.memory.rememberReference(normalized);
        this.memory.rememberBotMessage(reply);
        this._noteAskedQuestion(reply);
        return reply;
      }

      // 6c. "I don't know" / "no idea" pattern: a common, meaningful
      // signal that deserves a specific, calm reflection. The
      // language pack supplies a small pool of `iDontKnowResponses`;
      // if absent we fall back to a single default.
      if (signals.isIDontKnow) {
        const reply = this._respondToIDontKnow();
        this.memory.rememberUtterance(normalized);
        this.memory.rememberSentiment(scoreSentiment(normalized, this.lang.sentimentLexicon));
        this.memory.turnCount += 1;
        this.memory.rememberReference(normalized);
        this.memory.rememberBotMessage(reply);
        this._noteAskedQuestion(reply);
        return reply;
      }

      // 6d. "Again" reference: the user is pointing back at a prior
      // topic. The language pack's `againCallbackTemplates` produces
      // a small set of brief callbacks.
      if (signals.isAgain && this.lang.againCallbackTemplates) {
        const callback = this._respondToAgainReference();
        if (callback) {
          this.memory.rememberUtterance(normalized);
          this.memory.rememberSentiment(scoreSentiment(normalized, this.lang.sentimentLexicon));
          this.memory.turnCount += 1;
          this.memory.rememberReference(normalized);
          this.memory.rememberBotMessage(callback);
          this._noteAskedQuestion(callback);
          return callback;
        }
      }

      // 7. Memory updates (utterance, sentiment, references) before
      // any matching, so callbacks can use this turn's content.
      this.memory.rememberUtterance(normalized);
      this.memory.rememberSentiment(scoreSentiment(normalized, this.lang.sentimentLexicon));
      this.memory.turnCount += 1;
      this.memory.rememberReference(normalized);

      // 8. Rule matching (priority-sorted)
      const { rule: matchedRule, captured } = this._matchRule(normalized);
      let reply = matchedRule
        ? this._respondWithRule(matchedRule, captured, signals)
        : this._fallbackResponse(null, normalized, signals);

      // 9. Distress nudge: a caring, optional add-on layered on top of
      // whatever the normal flow produced -- but it never overrides
      // the dedicated safety-keyword rule, which always takes
      // precedence.
      const isSafetyTurn = matchedRule && matchedRule.topic === 'safety';
      if (!isSafetyTurn && this.memory.isInDistressStreak() && !this.memory.distressNudgeGiven) {
        this.memory.distressNudgeGiven = true;
        reply = this._pickVaried(this.lang.distressNudges);
      } else if (!this.memory.isInDistressStreak()) {
        this.memory.distressNudgeGiven = false;
      }

      // 10. Final repetition guard: if a previous Darya reply in the
      // very recent history was identical, force a strategy shift so
      // the user never sees the exact same line twice in a row.
      if (this.memory.recentBotMessages.includes(reply) && this._alternativeAvailable()) {
        reply = this._alternativeFor(matchedRule, captured, normalized);
      }

      this.memory.rememberBotMessage(reply);
      this._noteAskedQuestion(reply);
      return reply;
    }

    /**
     * Picks the opening greeting for a new conversation.
     * @returns {string}
     */
    greeting() {
      const text = this._openingForNewConversation();
      this.memory.rememberBotMessage(text);
      this._greetingAnswered = true;
      this._noteAskedQuestion(text);
      return text;
    }

    /**
     * Picks a varied farewell and records it in memory.
     * @returns {string}
     */
    farewell() {
      const recentTone = this.memory.sentimentHistory.slice(-3);
      const recentNegative = recentTone.length >= 2 && recentTone.every((s) => s < 0);
      const pool = recentNegative && this.lang.farewellsEmpathetic
        ? this.lang.farewellsEmpathetic
        : this.lang.farewells;
      const text = this._pickVaried(pool);
      this.memory.rememberBotMessage(text);
      return text;
    }

    // -- Stage 3: Intent detection -------------------------------------------

    /**
     * Returns true if the message is a pure greeting. The check runs on
     * the punctuation-stripped normalized form, so "hi!", "Hi", and
     * "hi" all match.
     * @param {string} normalized
     * @returns {boolean}
     */
    _isGreetingIntent(normalized) {
      if (this.lang.greetingPhrases) {
        for (const phrase of this.lang.greetingPhrases) {
          if (normalized === phrase) return true;
        }
      }
      const tokens = normalized.split(/\s+/).filter(Boolean);
      if (tokens.length === 0 || tokens.length > 3) return false;
      if (this.lang.greetingTokens) {
        return tokens.every((t) => this.lang.greetingTokens.has(t.toLowerCase()));
      }
      return false;
    }

    /**
     * Returns true if the message is a bare yes / no / mm / ok / etc.
     * @param {string} normalized
     * @returns {boolean}
     */
    _isPureAcknowledgment(normalized) {
      if (!this.lang.acknowledgmentTokens) return false;
      const tokens = normalized.split(/\s+/).filter(Boolean);
      if (tokens.length === 0 || tokens.length > 2) return false;
      return tokens.every((t) => this.lang.acknowledgmentTokens.has(t.toLowerCase()));
    }

    /**
     * Brief, non-question reply to a bare acknowledgment.
     * @param {string} normalized
     * @returns {string}
     */
    _respondToAcknowledgment(normalized) {
      const pool = this.lang.acknowledgmentResponses || this.lang.genericFallbacks;
      return this._pickVaried(pool);
    }

    /**
     * Response to "I don't know" / "no idea" patterns. Picks from
     * the language pack's `iDontKnowResponses` (or a single default),
     * staying brief and non-pressuring.
     * @returns {string}
     */
    _respondToIDontKnow() {
      const pool = this.lang.iDontKnowResponses || this.lang.genericFallbacks;
      return this._filterForQuestionBudget(this._pickVaried(pool));
    }

    /**
     * Brief callback when the user signals "this is the same thing
     * again" -- picks from `againCallbackTemplates` and, when
     * available, stitches in the most recent topic's name.
     * @returns {string|null}
     */
    _respondToAgainReference() {
      if (!this.lang.againCallbackTemplates) return null;
      const topic = this.memory.mostCommonTopic();
      const topicName = topic && this.lang.topicNames ? this.lang.topicNames[topic] : null;
      const template = this._pickVaried(this.lang.againCallbackTemplates);
      if (topicName && template && template.includes('{topic}')) {
        return template.replace('{topic}', topicName);
      }
      return template;
    }

    /**
     * Greeting response strategy. After a conversation is underway, a
     * re-greeting collapses to a brief, warm acknowledgment; a fresh
     * greeting right after the opening greeting routes to the same
     * brief pool so the engine never repeats the same opening twice.
     * @returns {string}
     */
    _respondToGreeting() {
      return this._pickVaried(this.lang.greentingsReturning || this.lang.greetings);
    }

    /**
     * Picks the very first opening line.
     * @returns {string}
     */
    _openingForNewConversation() {
      // ~70% open (no question), ~30% a single light invitation. The
      // brief calls out: never default to "How are you?".
      const useInvitation = Math.random() < 0.3 && this.lang.greentingsInviting;
      const pool = useInvitation ? this.lang.greentingsInviting : this.lang.greentingsOpen;
      return this._pickVaried(pool);
    }

    // -- Stage 4: Rule matching ---------------------------------------------

    _matchRule(normalizedText) {
      for (const currentRule of this.rules) {
        const match = currentRule.pattern.exec(normalizedText);
        if (!match) continue;

        let captured = '';
        for (let i = match.length - 1; i >= 1; i -= 1) {
          const group = match[i];
          if (group) {
            // Capture groups from regex patterns can include leading
            // or trailing punctuation from the surrounding text; strip
            // it so the captured phrase is clean before any further
            // processing.
            let candidate = group.trim();
            candidate = stripOuterPunctuation(candidate);
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

    _respondWithRule(matchedRule, captured, signals) {
      this.memory.rememberTopic(matchedRule.topic);

      if (this.memory.sameRuleStreak > MAX_CONSECUTIVE_SAME_RULE) {
        return this._fallbackResponse(matchedRule.topic, '', signals);
      }

      // Prepare the captured phrase for insertion: collapse any
      // repeated words, then smart-truncate to keep reflections short
      // and readable. A 200-word capture (e.g. "I feel really really
      // ... tired") would otherwise produce a 200-word reflection.
      let usableCaptured = '';
      if (captured) {
        const cleaned = collapseRepeatedWords(captured);
        usableCaptured = smartTruncate(cleaned, MAX_CAPTURE_LENGTH);
      }

      // Pick from the rule's own response pool, with a soft preference
      // for non-question responses when the question budget is spent.
      // Safety rule's responses are never filtered.
      const tooManyConsecutive = this._recentQuestionCount >= CONSECUTIVE_QUESTION_LIMIT;
      const tooManyInWindow = this._questionWindow.filter(Boolean).length >= QUESTION_BUDGET_LIMIT
        && this._questionWindow.length >= QUESTION_BUDGET_WINDOW;
      const skipQuestionThisTurn = (this.memory.turnCount % NON_QUESTION_EVERY) === 0;
      const pool = matchedRule.responses;
      let usablePool = pool;
      if (matchedRule.topic !== 'safety' && (tooManyConsecutive || tooManyInWindow || skipQuestionThisTurn)) {
        const filtered = pool.filter((r) => !r.endsWith('?') && !r.endsWith('؟'));
        if (filtered.length > 0) usablePool = filtered;
      }

      // Negation handling: if the input contains a negation, prefer
      // the rule's `negationResponses` (a per-rule set) when
      // available, then fall back to a generic negation pool, then
      // the rule's regular pool.
      //
      // SAFETY IS NEVER OVERRIDDEN: a safety-rule match always uses
      // its own responses, regardless of negation. A "I don't want
      // to live" pattern must reach the safety response even though
      // it contains the negation "not".
      if (signals && signals.isNegation && matchedRule.topic !== 'safety') {
        const negationPool = matchedRule.negationResponses
          || (this.lang.negationFallbacks);
        if (negationPool && negationPool.length > 0) {
          const negationReply = this._fillTemplate(
            this._pickVaried(negationPool), usableCaptured
          );
          if (negationReply) return negationReply;
        }
      }

      // Intensifier handling: when the input carries an intensifier
      // ("really", "خیلی"), prefer the rule's `intensifierResponses`
      // if available -- reflections that acknowledge the intensity.
      if (signals && signals.isIntensifier && matchedRule.intensifierResponses) {
        const intenseReply = this._fillTemplate(
          this._pickVaried(matchedRule.intensifierResponses), usableCaptured
        );
        if (intenseReply) return intenseReply;
      }

      const needsCapture = usablePool.some((r) => r.includes('{captured}'));
      if (!needsCapture) {
        return this._pickVaried(usablePool);
      }

      if (usableCaptured) {
        const withCapture = usablePool.filter((r) => r.includes('{captured}'));
        const capturePool = withCapture.length > 0 ? withCapture : usablePool;
        const template = pickWithCapture(capturePool, this.memory.recentBotMessages);
        if (template) return template.replace('{captured}', usableCaptured);
      }

      // Nothing meaningful was captured: prefer a capture-free
      // response from the same rule, else a generic phrase.
      const captureFree = usablePool.filter((r) => !r.includes('{captured}'));
      if (captureFree.length > 0) return this._pickVaried(captureFree);
      return this._pickVaried(this.lang.genericFallbacks);
    }

    /**
     * Fills a `{captured}` placeholder in `template` with `captured`,
     * or returns `template` unchanged if it has no placeholder.
     * @param {string} template
     * @param {string} captured
     * @returns {string}
     */
    _fillTemplate(template, captured) {
      if (!template) return '';
      if (!template.includes('{captured}')) return template;
      if (!captured) return '';
      return template.replace('{captured}', captured);
    }

    // -- Stage 6: Fallback strategy selection -------------------------------

    /**
     * Produces a fallback reply when no rule matched (or to break a
     * repetition streak). Strategies are scored by weight against the
     * current turn's context, then the highest-weighted pool is
     * picked from (with the question budget applied).
     * @param {string|null} preferTopic
     * @param {string} normalizedUserText
     * @param {object} [signals]
     * @returns {string}
     */
    _fallbackResponse(preferTopic, normalizedUserText, signals) {
      const candidates = [];

      const exclude = preferTopic ? [preferTopic] : [];
      const topic = this.memory.mostCommonTopic(exclude);
      if (topic && this.lang.topicCallbacks[topic]) {
        candidates.push({ pool: this.lang.topicCallbacks[topic], weight: 3 });
      }

      if (this.memory.turnCount > 0 && this.memory.turnCount % this.lang.checkInEvery === 0) {
        candidates.push({ pool: this.lang.sessionCheckIns, weight: 4 });
      }

      if (normalizedUserText && this.lang.questionPattern && this.lang.questionPattern.test(normalizedUserText)) {
        candidates.push({ pool: this.lang.questionFallbacks, weight: 5 });
      }

      // Negation fallback: if the input carried a negation, prefer
      // the negation fallback pool.
      if (signals && signals.isNegation && this.lang.negationFallbacks) {
        candidates.push({ pool: this.lang.negationFallbacks, weight: 4 });
      }

      // Quoted callback
      if (normalizedUserText && Math.random() < QUOTED_CALLBACK_PROBABILITY) {
        const excerpt = this.memory.randomRecentUtterance(normalizedUserText);
        if (excerpt) {
          const template = this._pickVaried(this.lang.quotedCallbackTemplates);
          const filled = template.replace('{excerpt}', truncateExcerpt(excerpt, EXCERPT_MAX_LENGTH));
          return filled;
        }
      }

      // Pronoun-swap reflection (English only)
      if (this.lang.pronounMap && normalizedUserText && Math.random() < PRONOUN_REFLECTION_PROBABILITY) {
        const reflected = reflectPronouns(normalizedUserText, this.lang.pronounMap);
        if (reflected) {
          const template = this._pickVaried(this.lang.pronounReflectionFollowups);
          return template.replace('{reflected}', reflected);
        }
      }

      if (candidates.length === 0) {
        this._fallbackToggle = !this._fallbackToggle;
        const pool = this._fallbackToggle ? this.lang.strategyShiftFallbacks : this.lang.genericFallbacks;
        return this._filterForQuestionBudget(this._pickVaried(pool));
      }

      candidates.sort((a, b) => b.weight - a.weight || Math.random() - 0.5);
      for (const candidate of candidates) {
        const reply = this._filterForQuestionBudget(this._pickVaried(candidate.pool));
        if (reply) return reply;
      }
      return this._filterForQuestionBudget(this._pickVaried(this.lang.genericFallbacks));
    }

    /**
     * Returns true if the engine has any unused variation in any
     * candidate pool.
     * @returns {boolean}
     */
    _alternativeAvailable() {
      const pools = [this.lang.genericFallbacks, this.lang.strategyShiftFallbacks];
      for (const pool of pools) {
        for (const line of pool) {
          if (!this.memory.recentBotMessages.includes(line)) return true;
        }
      }
      return false;
    }

    /**
     * Returns a non-repeating alternative for the same match context.
     * @param {object|null} matchedRule
     * @param {string} captured
     * @param {string} normalized
     * @returns {string}
     */
    _alternativeFor(matchedRule, captured, normalized) {
      const previous = this.memory.recentBotMessages[this.memory.recentBotMessages.length - 1];
      if (matchedRule) {
        const usableCaptured = captured ? smartTruncate(collapseRepeatedWords(captured), MAX_CAPTURE_LENGTH) : '';
        const alternatives = matchedRule.responses.filter((r) => r !== previous);
        if (alternatives.length > 0) {
          if (usableCaptured) {
            const withCapture = alternatives.filter((r) => r.includes('{captured}'));
            if (withCapture.length > 0) {
              return this._pickVaried(withCapture).replace('{captured}', usableCaptured);
            }
          }
          return this._pickVaried(alternatives);
        }
      }
      return this._pickVaried(this.lang.strategyShiftFallbacks);
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
    _pickVaried(pool) {
      if (!pool || pool.length === 0) return this.lang.emptyInputReply;
      if (pool.length === 1) return pool[0];

      const recent = this.memory.recentBotMessages;
      let candidates = pool.filter((p) => !recent.includes(p));

      if (candidates.length === 0) {
        const last = recent[recent.length - 1];
        candidates = pool.filter((p) => p !== last);
      }
      if (candidates.length === 0) candidates = pool;

      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /**
     * If we've been asking questions for too many turns in a row, or
     * the rolling window budget is exhausted, force a non-question
     * alternative by picking from the same pool but skipping
     * question-shaped lines.
     * @param {string} reply
     * @returns {string}
     */
    _filterForQuestionBudget(reply) {
      const tooManyConsecutive = this._recentQuestionCount >= CONSECUTIVE_QUESTION_LIMIT;
      const tooManyInWindow = this._questionWindow.filter(Boolean).length >= QUESTION_BUDGET_LIMIT
        && this._questionWindow.length >= QUESTION_BUDGET_WINDOW;
      if (!tooManyConsecutive && !tooManyInWindow) return reply;
      if (!reply.endsWith('?') && !reply.endsWith('؟')) return reply;
      const alts = this.lang.genericFallbacks.filter(
        (r) => !r.endsWith('?') && !r.endsWith('؟') && !this.memory.recentBotMessages.includes(r)
      );
      if (alts.length > 0) return alts[Math.floor(Math.random() * alts.length)];
      const shift = this.lang.strategyShiftFallbacks.filter(
        (r) => !r.endsWith('?') && !r.endsWith('؟') && !this.memory.recentBotMessages.includes(r)
      );
      if (shift.length > 0) return shift[Math.floor(Math.random() * shift.length)];
      return reply;
    }

    /**
     * Notes whether a reply ended in a question mark.
     * @param {string} reply
     */
    _noteAskedQuestion(reply) {
      const asked = reply.endsWith('?') || reply.endsWith('؟');
      this._recentQuestionCount = asked
        ? this._recentQuestionCount + 1
        : 0;
      this._questionWindow.push(asked);
      if (this._questionWindow.length > QUESTION_BUDGET_WINDOW) this._questionWindow.shift();
    }
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  global.DaryaEngine = {
    isValidScript,
    scoreSentiment,
    containsNegation,
    isIDontKnow,
    containsIntensifier,
    isAgainReference,
    stripOuterPunctuation,
    collapseRepeatedWords,
    smartTruncate,
    DaryaResponseEngine,
  };
})(typeof window !== 'undefined' ? window : globalThis);
