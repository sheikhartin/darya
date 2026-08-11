/**
 * Darya - deferred-topic promise memory (part file).
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 * When the user defers a topic ("I'll tell you later", "بعداً می‌گم"),
 * Darya acknowledges warmly, holds the promise in memory, and circles
 * back to it a few turns later on a light turn instead of letting the
 * thread silently die. A pending promise can also be released by the
 * user ("never mind", "ولش کن") and expires on its own after many
 * turns, so Darya never nags about a topic the person clearly let go.
 */
(function (global) {
  'use strict';

  const { PROMISE_CIRCLEBACK_DELAY_TURNS } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    /**
     * Handles a deferred-topic promise turn: the user says they will
     * tell Darya later, or releases a pending promise. Returns the
     * chosen reply, or null when the turn is not a promise turn.
     * @param {string} matchingText - Normalized matching text
     * @returns {string|null}
     */
    _handlePromiseTurn(matchingText) {
      if (!this.lang.promiseLaterPattern) {
        return null;
      }
      if (this.lang.promiseLaterPattern.test(matchingText)) {
        this.memory.rememberPromise(this.memory.turnCount);
        return this._pickVaried(this.lang.promiseAcknowledgedResponses, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }
      if (
        this.memory.pendingPromise &&
        this.lang.promiseForgetPattern &&
        this.lang.promiseForgetPattern.test(matchingText)
      ) {
        this.memory.clearPromise();
        return this._pickVaried(this.lang.promiseReleasedResponses, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }
      return null;
    },

    /**
     * Circles back to a deferred topic once it has waited a few turns.
     * Fires on a light filler turn (no matched rule, not a question,
     * not a heavy turn) and only once per promise: after circling back,
     * the promise is fulfilled when the person engages with real
     * content again, or expires silently.
     * @param {object|null} matchedRule - The rule matched this turn.
     * @returns {string|null}
     */
    _promiseCircleBack(matchedRule = null) {
      const promise = this.memory.pendingPromise;
      if (
        !promise ||
        promise.circledBack ||
        // A turn that actually matched a rule deserves its own topical
        // reply: never interrupt a real answer (even a light one) with
        // a circle-back.
        matchedRule ||
        this.currentTurnDialogueAct === 'question' ||
        // The turn is genuinely heavy: the person needs the current
        // reply, not a reminder about an old promise.
        this.lastTurnNeedsCare ||
        this.memory.turnCount - promise.promisedAtTurn <
          PROMISE_CIRCLEBACK_DELAY_TURNS ||
        !this.lang.promiseCircleBackResponses
      ) {
        return null;
      }
      const reply = this._pickVaried(this.lang.promiseCircleBackResponses, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      });
      // Only commit the circle-back once a real line was picked: an
      // empty pool must never silently burn the promise.
      if (!reply) {
        return null;
      }
      promise.circledBack = true;
      this._promiseCircleBackFired = true;
      return reply;
    },

    /**
     * Applies the deferred-topic promise override for the current turn:
     * handles a make/release turn, or fires the circle-back when the
     * promise is due. Keeps the wiring (and this file) out of
     * responder-overrides.js.
     * @param {{matchingText: string, matchedRule: object|null}} args
     * @returns {{reply: string, fired: boolean}}
     */
    _applyPromiseOverrides({ matchingText, matchedRule }) {
      const promiseReply =
        this._handlePromiseTurn(matchingText) ||
        this._promiseCircleBack(matchedRule);
      return promiseReply
        ? { reply: promiseReply, fired: true }
        : { reply: '', fired: false };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
