/**
 * Darya - question recall and knowledge-expansion handlers.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 *
 * Two memory/meta overrides live here:
 *
 * 1. Question recall: the user asks Darya to remember their last question
 *    («یادته آخرین سوالی که ازت پرسیدم چی بود؟!», "do you remember what
 *    the last question I asked you was?"). Darya answers from the actual
 *    conversation memory: the most recent user utterance that reads as a
 *    question is quoted back (never an evasive "I do not have an answer"
 *    line). If no question has been asked yet, the honest none-pool says
 *    so plainly and invites one.
 *
 * 2. Knowledge expansion: a long request asking Darya to build a richer
 *    dataset (good questions, movies, games, books, anime, traditional
 *    medicine, study help, general knowledge, fun facts - the transcript
 *    dataset request). Darya acknowledges the request honestly: she is an
 *    offline build, her current shelf already covers those areas, and she
 *    invites a concrete topic. This beats the work rule, which previously
 *    hijacked the Persian message through the bare word «کار» inside
 *    «این کار رو» (the "کار فقط ساعتها نیست" misfire).
 */
(function (global) {
  'use strict';

  const { EXCERPT_MAX_LENGTH, truncateExcerpt } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    /**
     * Answers "what was the last question I asked you?" from the real
     * conversation memory. Scans the recorded user utterances backwards
     * (skipping the current turn's own text) for the most recent one that
     * reads as a question - it contains a question mark or matches the
     * language question pattern - and quotes it back through a pool
     * template. If the user has asked no question yet, falls back to
     * Darya's own last unanswered question, and if there is none either,
     * replies with the honest none-pool.
     * @param {string} matchingText - Normalized matching text.
     * @returns {string|null}
     */
    _handleQuestionRecallTurn(matchingText) {
      const pattern = this.lang.questionRecallPattern;
      if (!pattern || !pattern.test(matchingText)) {
        return null;
      }
      // The current turn's own text is always the last recorded utterance
      // (pushed at the top of respond()), and it is stored in the memory
      // form that keeps ؟/؟ punctuation, so it can never be matched by
      // comparing against the punctuation-stripped matching text. Skip the
      // last entry deterministically instead: the recall question itself
      // ends in ؟ and would otherwise be quoted back as its own answer.
      let recalled = null;
      for (let i = this.memory.recentUtterances.length - 2; i >= 0; i -= 1) {
        const utterance = this.memory.recentUtterances[i];
        if (!utterance) {
          continue;
        }
        if (
          /[?؟]/u.test(utterance) ||
          (this.lang.questionPattern &&
            this.lang.questionPattern.test(utterance))
        ) {
          recalled = utterance;
          break;
        }
      }
      const foundPool = this.lang.questionRecallFoundResponses;
      if (recalled && foundPool && foundPool.length) {
        const template = this._pickVaried(foundPool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        return template.replace(
          '{question}',
          truncateExcerpt(recalled, EXCERPT_MAX_LENGTH)
        );
      }
      // No question from the user yet: maybe they mean the question Darya
      // asked them last. The pending-question memory carries it.
      const pending =
        typeof this._latestUnansweredQuestion === 'function'
          ? this._latestUnansweredQuestion()
          : null;
      if (pending && pending.question && foundPool && foundPool.length) {
        const template = this._pickVaried(foundPool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        return template.replace(
          '{question}',
          truncateExcerpt(pending.question, EXCERPT_MAX_LENGTH)
        );
      }
      const nonePool = this.lang.questionRecallNoneResponses;
      if (nonePool && nonePool.length) {
        return this._pickVaried(nonePool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }
      return null;
    },

    /**
     * Acknowledges a request to build a richer knowledge/dataset store
     * (the transcript dataset request: good questions, movies, games,
     * books, anime, traditional medicine, study help, general knowledge,
     * fun facts). The reply is honest about being an offline build whose
     * shelf already covers those areas, and invites a concrete topic.
     * A strong signal (دیتاست/dataset) alone is enough; otherwise the
     * content words must co-occur with a build/learn/expand framing so a
     * plain movie or fact request is never hijacked.
     * @param {string} matchingText - Normalized matching text.
     * @returns {string|null}
     */
    _handleKnowledgeExpansionTurn(matchingText) {
      const signals = this.lang.knowledgeExpansionSignals;
      if (!signals) {
        return null;
      }
      const strongHit = signals.strong.test(matchingText);
      const contentHit = signals.content.test(matchingText);
      const framingHit = signals.framing.test(matchingText);
      if (!(strongHit || (contentHit && framingHit))) {
        return null;
      }
      const pool = this.lang.knowledgeExpansionResponses;
      if (!pool || pool.length === 0) {
        return null;
      }
      return this._pickVaried(pool, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
