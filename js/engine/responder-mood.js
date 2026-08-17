/**
 * Darya - session mood tracker (part file).
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 *
 * A lightweight, opt-in mood check-in: when the user asks to track their
 * mood ("mood check", "حالم رو ثبت کن"), Darya asks for a rating on the
 * 1..10 scale, records it in the session mood log, and reflects on it.
 * The user can also ask for a summary of how they have been feeling
 * ("how have I been feeling", "خلق و خویم چطور بوده") which reads back
 * the recent ratings and the overall direction.
 *
 * All data is session-only: the log lives on the engine and vanishes
 * with a new chat. Nothing is persisted or sent anywhere.
 *
 * Flow:
 *   1. Request turn: the user asks to check/log their mood. Darya asks
 *      for a rating on the scale and remembers the pending request.
 *   2. Rating turn: a bare number (1..10, in any supported digit script)
 *      records the mood and replies with a reflection appropriate to the
 *      band (low/moderate/high). Non-numeric or out-of-range answers
 *      release the pending request gracefully.
 *   3. Summary turn: "how have I been feeling" reads back the log.
 */
(function (global) {
  'use strict';

  const {
    MOOD_SCALE_MIN,
    MOOD_SCALE_MAX,
    MOOD_LOW_MAX,
    MOOD_HIGH_MIN,
    PERSIAN_DIGITS
  } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    /**
     * Returns true when the current turn asks to check or log the mood.
     * @param {string} matchingText - Normalized matching text
     * @returns {boolean}
     */
    _isMoodRequest(matchingText) {
      return (
        !!this.lang.moodRequestPattern &&
        this.lang.moodRequestPattern.test(matchingText)
      );
    },

    /**
     * Returns true when the current turn asks for a summary of past mood
     * ratings.
     * @param {string} matchingText - Normalized matching text
     * @returns {boolean}
     */
    _isMoodSummaryRequest(matchingText) {
      return (
        !!this.lang.moodSummaryPattern &&
        this.lang.moodSummaryPattern.test(matchingText)
      );
    },

    /**
     * Extracts a mood rating from the input: a bare number within the
     * scale, in Persian, Arabic-Indic, or ASCII digits. Returns an
     * integer, or null when the input is not a plain in-range rating
     * (so "I feel like a 9 today" is accepted while "I feel awful" is
     * not).
     * @param {string} matchingText - Normalized matching text
     * @returns {number|null}
     */
    _moodRatingFrom(matchingText) {
      const match = String(matchingText || '').match(
        /(?<![\p{L}۰-۹])[۰-۹0-9٠-٩]+(?![\p{L}۰-۹])/u
      );
      if (!match) {
        return null;
      }
      const normalized = match[0].replace(/[۰-۹٠-٩]/g, (digit) => {
        const idx = (PERSIAN_DIGITS + '٠١٢٣٤٥٦٧٨٩').indexOf(digit);
        return idx >= 0 ? String(idx % 10) : digit;
      });
      const value = Number(normalized);
      if (
        !Number.isInteger(value) ||
        value < MOOD_SCALE_MIN ||
        value > MOOD_SCALE_MAX
      ) {
        return null;
      }
      return value;
    },

    /**
     * Records a mood rating in the session log. The log keeps the last
     * few entries so a summary can read back the recent arc.
     * @param {number} value - Rating on the mood scale
     */
    _recordMood(value) {
      if (!Array.isArray(this.memory.moodLog)) {
        this.memory.moodLog = [];
      }
      this.memory.moodLog.push({ turn: this.memory.turnCount, value });
      if (this.memory.moodLog.length > this.lang.moodLogSize) {
        this.memory.moodLog.shift();
      }
    },

    /**
     * Picks the reflection pool for a rating band.
     * @param {number} value - Rating on the mood scale
     * @returns {string[]} The pool for the band, or an empty array
     */
    _moodReflectionPool(value) {
      const pools = this.lang.moodReflectionPools;
      if (!pools) {
        return [];
      }
      if (value <= MOOD_LOW_MAX) {
        return pools.low || [];
      }
      if (value >= MOOD_HIGH_MIN) {
        return pools.high || [];
      }
      return pools.moderate || [];
    },

    /**
     * Resolves the current mood-tracker turn. Returns the chosen reply,
     * or null when the turn is not a mood turn. Sets
     * `this.lastTurnQuickReplies` to the scale chips when a rating is
     * requested, so the UI can render tappable options.
     * @param {string} matchingText - Normalized matching text
     * @returns {string|null}
     */
    _handleMoodTurn(matchingText) {
      if (!this.lang.moodRequestPattern) {
        return null;
      }

      // Summary request: read back the recent mood arc.
      if (this._isMoodSummaryRequest(matchingText)) {
        this._pendingMoodRequest = null;
        const log = Array.isArray(this.memory.moodLog)
          ? this.memory.moodLog
          : [];
        const pool = this.lang.moodSummaryResponses;
        if (!pool || pool.length === 0) {
          return null;
        }
        const template = this._pickVaried(pool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        if (log.length === 0) {
          this.lastTurnQuickReplies = [];
          return this.lang.moodNoDataResponse || template;
        }
        const values = log.map((entry) => entry.value);
        const last = values[values.length - 1];
        const first = values[0];
        // A single check-in has no trend: saying "the direction is
        // fairly steady" about one sample reads as statistical
        // nonsense. Use the dedicated single-sample template instead.
        if (values.length === 1 && this.lang.moodSingleSummaryResponses) {
          this.lastTurnQuickReplies = [];
          const single = this._pickVaried(
            this.lang.moodSingleSummaryResponses,
            {
              ignoreQuestionBudget: true,
              trackQuestions: false
            }
          );
          return single.replace(/\{last\}/gu, String(last));
        }
        const direction =
          last > first
            ? this.lang.moodDirectionUp
            : last < first
              ? this.lang.moodDirectionDown
              : this.lang.moodDirectionSame;
        const average =
          Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) /
          10;
        return template
          .replace(/\{count\}/gu, String(log.length))
          .replace(/\{average\}/gu, String(average))
          .replace(/\{last\}/gu, String(last))
          .replace(/\{direction\}/gu, direction);
      }

      // A rating answer to a pending request records the mood.
      if (this._pendingMoodRequest) {
        this._pendingMoodRequest = null;
        this.lastTurnQuickReplies = [];
        const rating = this._moodRatingFrom(matchingText);
        if (rating === null) {
          const releasePool = this.lang.moodReleaseResponses;
          return releasePool && releasePool.length
            ? this._pickVaried(releasePool, {
                ignoreQuestionBudget: true,
                trackQuestions: false
              })
            : null;
        }
        this._recordMood(rating);
        const reflectionPool = this._moodReflectionPool(rating);
        if (reflectionPool.length === 0) {
          return null;
        }
        return this._pickVaried(reflectionPool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        }).replace(/\{rating\}/gu, String(rating));
      }

      // New request: ask for a rating on the scale.
      if (this._isMoodRequest(matchingText)) {
        this._pendingMoodRequest = { askedAtTurn: this.memory.turnCount };
        const pool = this.lang.moodAskResponses;
        if (!pool || pool.length === 0) {
          this._pendingMoodRequest = null;
          return null;
        }
        this.lastTurnQuickReplies = this.lang.moodScaleChips || [];
        return this._pickVaried(pool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }

      return null;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
