/**
 * Darya - guided therapeutic exercises (part file).
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 *
 * A small multi-turn state machine for structured exercises the user can
 * request in plain language ("breathing exercise", "تمرین تنفس", "ground
 * me", "ثبت فکر"). Darya offers the exercise, then walks the user through
 * it one step per turn, honoring yes/no answers to start, stop, or
 * advance. The exercise content (offers, steps, completion lines, stop
 * lines) lives in the language packs under `exerciseLibrary`, so the
 * engine stays language-agnostic. State is session-only: it lives on the
 * engine and vanishes with a new chat.
 *
 * Flow per exercise:
 *   1. Request turn: the user names an exercise. Darya replies with the
 *      offer line and remembers the pending exercise (with its steps).
 *   2. Accept turn: a yes/ok answer starts step 1. A no answer releases
 *      the exercise with the decline line.
 *   3. Step turns: each further yes/ok advances one step. Saying stop
 *      (or no) at any point releases the exercise with the stop line.
 *   4. Completion: after the last step, the completion line closes the
 *      exercise and the state is cleared.
 *
 * An in-progress exercise expires silently after EXERCISE_ACTIVE_WINDOW
 * turns of unrelated chat, so it never hangs over the conversation.
 */
(function (global) {
  'use strict';

  const { EXERCISE_ACTIVE_WINDOW } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    /**
     * Returns true when the current turn is an explicit request to start
     * a guided exercise ("breathing exercise", "تمرین تنفس", "ground
     * me", "ثبت فکر"). Uses the language pack's exercise request pattern.
     * @param {string} matchingText - Normalized matching text
     * @returns {boolean}
     */
    _isExerciseRequest(matchingText) {
      return (
        !!this.lang.exerciseRequestPattern &&
        this.lang.exerciseRequestPattern.test(matchingText)
      );
    },

    /**
     * Returns the exercise id whose request keyword is present in the
     * input, or null. The language pack maps each id to a small keyword
     * pattern so "ground me" selects the grounding exercise and "ثبت
     * فکر" selects the thought record. Falls back to the first library
     * entry when the request matched broadly (e.g. a bare "exercise").
     * @param {string} matchingText - Normalized matching text
     * @returns {string|null}
     */
    _exerciseIdFor(matchingText) {
      const library = this.lang.exerciseLibrary || {};
      const ids = Object.keys(library);
      for (const id of ids) {
        const keywords = library[id] && library[id].requestKeywords;
        if (keywords && keywords.test(matchingText)) {
          return id;
        }
      }
      return ids.length ? ids[0] : null;
    },

    /**
     * Resolves the current exercise turn. Returns the chosen reply, or
     * null when the turn is not part of an exercise flow (no request, no
     * active exercise, or a step answer that does not advance anything).
     * Sets `this.lastTurnQuickReplies` to the language's yes/no chips
     * whenever an answer is expected, so the UI can render tappable
     * options (see app wiring in conversation.js).
     * @param {string} matchingText - Normalized matching text
     * @returns {string|null}
     */
    _handleExerciseTurn(matchingText) {
      const library = this.lang.exerciseLibrary;
      if (!library) {
        return null;
      }
      const now = this.memory.turnCount;

      // New request: offer the exercise and remember its pending state.
      if (!this._activeExercise && this._isExerciseRequest(matchingText)) {
        const id = this._exerciseIdFor(matchingText);
        const entry = id ? library[id] : null;
        if (!entry || !entry.steps || entry.steps.length === 0) {
          return null;
        }
        this._activeExercise = {
          id,
          stepIndex: 0,
          startedAtTurn: now
        };
        // An exercise request can also trip a conversational rule (e.g.
        // "breathing exercise" matches the mindfulness topic) whose
        // topic-question reply was replaced by this offer. That stale
        // pending question must not later swallow the "ok" the user
        // meant for the exercise: drop unanswered pending questions so
        // the exercise owns the following affirmatives.
        this.memory.pendingQuestions = this.memory.pendingQuestions.filter(
          (q) => q.answered
        );
        this.lastTurnQuickReplies = this.lang.exerciseYesNoChips || [];
        return this._pickVaried(entry.offer || library.offer, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }

      const active = this._activeExercise;
      if (!active) {
        return null;
      }

      // An exercise that has waited too long expires silently; the next
      // explicit request starts fresh.
      if (now - active.startedAtTurn > EXERCISE_ACTIVE_WINDOW) {
        this._activeExercise = null;
        return null;
      }

      const entry = library[active.id];
      if (!entry) {
        this._activeExercise = null;
        return null;
      }

      const kind = this._shortAnswerKind(matchingText);
      const stopPattern = this.lang.exerciseStopPattern;
      const wantsStop =
        kind === 'negate' || (stopPattern && stopPattern.test(matchingText));

      // Stopping or declining at any point releases the exercise.
      if (wantsStop) {
        this._activeExercise = null;
        this.lastTurnQuickReplies = [];
        const stopPool = entry.stop || library.stop;
        return stopPool && stopPool.length
          ? this._pickVaried(stopPool, {
              ignoreQuestionBudget: true,
              trackQuestions: false
            })
          : null;
      }

      // Only an affirmative answer advances the exercise.
      if (kind !== 'affirm') {
        return null;
      }

      // Advance to the next step; after the final step, complete.
      if (active.stepIndex >= entry.steps.length) {
        this._activeExercise = null;
        this.lastTurnQuickReplies = [];
        const completePool = entry.complete || library.complete;
        return completePool && completePool.length
          ? this._pickVaried(completePool, {
              ignoreQuestionBudget: true,
              trackQuestions: false
            })
          : null;
      }

      const stepPool = entry.steps[active.stepIndex];
      active.stepIndex += 1;
      // Keep the yes/no chips visible between steps so the user can
      // continue with a tap; the last step still expects a final "ok"
      // that triggers completion.
      this.lastTurnQuickReplies = this.lang.exerciseYesNoChips || [];
      return this._pickVaried(stepPool, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
