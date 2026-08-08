/**
 * Darya - entity callbacks, question budget and response picking.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  const {
    ENTITY_CALLBACK_PROBABILITY,
    CONSECUTIVE_QUESTION_LIMIT,
    QUESTION_BUDGET_WINDOW,
    QUESTION_BUDGET_LIMIT,
    ENTITY_CONFIDENCE_THRESHOLD,
    ENTITY_RECENT_TURNS,
    ENTITY_RECENT_CONFIDENCE,
    ENTITY_STALE_CONFIDENCE,
    TOPIC_RELEVANCE_RECENT_BONUS,
    TOPIC_RELEVANCE_STALE_BASE,
    ENTITY_CONTEXT_THRESHOLD,
    RECENT_BOT_MESSAGE_PENALTY,
    CONSECUTIVE_QUESTION_PENALTY,
    LONG_RESPONSE_THRESHOLD,
    LONG_RESPONSE_PENALTY,
    FILLER_RESPONSE_PENALTY,
    PENDING_ANSWER_WINDOW
  } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    // ======================================================================
    // Entity callback logic
    //
    // When the user has previously mentioned a person, place, object, or
    // activity on an emotionally-weighted turn, and that entity is still
    // active (activation above threshold) and contextually relevant
    // (current topics overlap with the entity's contextTopics), the
    // engine can produce a callback referencing the entity by name.
    //
    // Callbacks fire at ENTITY_CALLBACK_PROBABILITY (55%) per eligible
    // turn. The first-mention guard prevents a callback on the same turn
    // the entity was introduced. Context confidence is computed from the
    // overlap between the entity's stored contextTopics and the current
    // turn's detected topics, with a minimum threshold of 0.6.
    // ======================================================================

    _entityContextConfidence(entity) {
      const activeTopics = new Set(
        this.currentTurnTopics.length
          ? this.currentTurnTopics
          : [this.memory.currentSubject.topic].filter(Boolean)
      );
      const rememberedTopics = new Set(entity.contextTopics || []);
      if (activeTopics.size === 0 || rememberedTopics.size === 0) {
        return entity.age <= ENTITY_RECENT_TURNS
          ? ENTITY_RECENT_CONFIDENCE
          : ENTITY_STALE_CONFIDENCE;
      }
      const overlap = [...activeTopics].some((topic) =>
        rememberedTopics.has(topic)
      );
      if (overlap) {
        return 1;
      }
      const recentTopic = this.memory.topicHistory
        .slice(-4)
        .some((entry) => rememberedTopics.has(entry.topic));
      return recentTopic
        ? TOPIC_RELEVANCE_RECENT_BONUS
        : TOPIC_RELEVANCE_STALE_BASE;
    },

    _respondToEntityReference() {
      const threshold = Number.isFinite(this.entityCallbackThreshold)
        ? Math.max(0, Math.min(1, this.entityCallbackThreshold))
        : ENTITY_CONFIDENCE_THRESHOLD;
      const probability = Number.isFinite(this.entityCallbackProbability)
        ? Math.max(0, Math.min(1, this.entityCallbackProbability))
        : ENTITY_CALLBACK_PROBABILITY;
      // Ultra-short inputs ("بله", "خوبی", "🙂") are answers or
      // acknowledgements, not material for an entity callback; a callback
      // here would derail the user's thread with an off-topic reference.
      const currentInput = String(this._currentNormalizedInput || '');
      const currentWordCount = currentInput
        .split(/\s+/u)
        .filter(Boolean).length;
      if (currentInput && currentWordCount <= 2) {
        return null;
      }
      const candidates = this.memory
        .eligibleNamedEntities(threshold)
        .filter((entity) => entity.lastMentionTurn < this.memory.turnCount)
        .map((entity) => ({
          entity,
          context: this._entityContextConfidence(entity)
        }))
        .filter((entry) => entry.context >= ENTITY_CONTEXT_THRESHOLD)
        // Time references ("امروز", "هر روز") are far too common and
        // generic to reference back: the callback would read as a
        // non-sequitur ("جزئیات زمانیِ امروز...") on routine answers.
        .filter((entry) => entry.entity.type !== 'time')
        .sort(
          (a, b) =>
            b.entity.activation * b.context - a.entity.activation * a.context
        );
      if (candidates.length === 0 || Math.random() >= probability) {
        return null;
      }

      const entity = candidates[0].entity;
      const templates = this.lang.entityCallbackTemplates || {};
      const pool = templates[entity.type] || templates.object || [];
      if (pool.length === 0) {
        return null;
      }
      const template = this._pickVaried(pool);
      return template.replace(/\{surface\}/gu, entity.surface);
    },

    // ======================================================================
    // Question budget management
    //
    // Prevents the engine from asking too many questions in succession,
    // which would make the conversation feel interrogative rather than
    // supportive. Two complementary mechanisms:
    //
    // 1. Consecutive question limit (CONSECUTIVE_QUESTION_LIMIT = 1):
    //    After the engine asks one question, the next response cannot
    //    also be a question.
    //
    // 2. Rolling window budget (QUESTION_BUDGET_WINDOW = 3 turns,
    //    QUESTION_BUDGET_LIMIT = 1): Only one question response is
    //    allowed within any 3-turn window.
    //
    // When the budget is exhausted, _filterForQuestionBudget removes
    // question-type responses from the pool. _alternativeFor provides
    // a non-question fallback (topic-specific or generic).
    // ======================================================================

    _isQuestionResponse(text) {
      if (/[?؟]/u.test(text)) {
        return true;
      }
      if (this.lang.questionPattern && this.lang.questionPattern.test(text)) {
        return true;
      }
      // Fallback question markers for responses that do not end in a
      // question mark. The English check is anchored to the start of the
      // response so that supportive statements containing an embedded
      // question word ("It is okay to feel what you feel about it.") are
      // not misread as questions and stripped under budget pressure.
      return (
        /^\s*(?:what|why|how|who|when|where|which|do|does|did|is|are|am|can|could|will|would|should)\b/iu.test(
          text
        ) ||
        /(?<!\p{L})(?:چرا|چطور|چگونه|چیست|چیه|کجا|کیست|کیه|آیا)(?!\p{L})/u.test(
          text
        )
      );
    },

    _filterForQuestionBudget(pool) {
      const options = Array.isArray(pool) ? pool : [];
      const now = this.memory.turnCount;
      this.memory.askedQuestionTurns = this.memory.askedQuestionTurns.filter(
        (turn) => now - turn < QUESTION_BUDGET_WINDOW
      );
      const budgetUsed =
        this.memory.askedQuestionTurns.length >= QUESTION_BUDGET_LIMIT;
      const consecutiveUsed =
        this.memory.consecutiveQuestions >= CONSECUTIVE_QUESTION_LIMIT;
      if (!budgetUsed && !consecutiveUsed) {
        return options;
      }
      const alternatives = options.filter(
        (option) => !this._isQuestionResponse(option)
      );
      return alternatives;
    },

    _noteAskedQuestion(response) {
      if (this._isQuestionResponse(response)) {
        this.memory.consecutiveQuestions += 1;
        this.memory.askedQuestionTurns.push(this.memory.turnCount);
        this.memory.noteBotQuestion(
          response,
          this.currentTurnTopics[0] || this.memory.currentSubject.topic
        );
      } else {
        this.memory.consecutiveQuestions = 0;
      }
    },

    /**
     * Resolves a short answer (yes/no/maybe, or their Persian forms) as
     * the reply to the most recent unanswered question Darya asked within
     * PENDING_ANSWER_WINDOW turns. Marks that question answered and returns
     * a thread-continuation reply:
     *   - For an affirmative answer, a topic-specific follow-up question
     *     when the topic has one, else a warm continuation from the pool.
     *   - For a negative or uncertain answer, a graceful continuation that
     *     leaves the door open.
     * Returns null when the input is not a short answer or no fresh
     * unanswered question exists, so the caller falls through to the
     * regular rule reply (affirmation/negation pools).
     * @param {string} matchingText - Normalized matching text
     * @returns {string|null}
     */
    _resolveShortAnswerContext(matchingText) {
      const kind = this._shortAnswerKind(matchingText);
      if (!kind) {
        return null;
      }
      const pending = this._latestUnansweredQuestion();
      if (!pending) {
        return null;
      }
      if (this.memory.turnCount - pending.askedAtTurn > PENDING_ANSWER_WINDOW) {
        return null;
      }
      this.memory.markLatestQuestionAnswered(
        this._currentNormalizedInput || matchingText,
        this.memory.turnCount
      );
      const topic = pending.topic;
      let reply = null;
      if (kind === 'affirm' && topic && this.lang.questionTopics?.has(topic)) {
        const specific = this.lang.topicSpecificQuestions?.[topic] || [];
        if (specific.length) {
          reply = this._pickVaried(specific, {
            ignoreQuestionBudget: true,
            trackQuestions: false
          });
        }
      }
      if (reply === null) {
        const pool =
          kind === 'negate'
            ? this.lang.shortAnswerNegateContext
            : kind === 'maybe'
              ? this.lang.shortAnswerMaybeContext
              : this.lang.shortAnswerAffirmContext;
        if (pool && pool.length) {
          reply = this._pickVaried(pool, {
            ignoreQuestionBudget: true,
            trackQuestions: false
          });
        }
      }
      // Record the follow-up question as pending so a second consecutive
      // short answer can keep continuing the same thread. The budget
      // counters are left untouched on purpose: the follow-up replaces the
      // answered question one-for-one, so it is not a new barrage.
      if (reply !== null && this._isQuestionResponse(reply)) {
        this.memory.noteBotQuestion(reply, topic);
      }
      return reply;
    },

    _latestUnansweredQuestion() {
      const now = this.memory.turnCount;
      return (
        [...this.memory.pendingQuestions]
          .reverse()
          .find(
            (q) =>
              !q.answered &&
              q.askedAtTurn < now &&
              now - q.askedAtTurn <= PENDING_ANSWER_WINDOW
          ) || null
      );
    },

    _alternativeAvailable(pool) {
      return (
        Array.isArray(pool) &&
        pool.some((option) => !this._isQuestionResponse(option))
      );
    },

    _alternativeFor(response) {
      const topic =
        this.currentTurnTopics[0] || this.memory.currentSubject.topic;
      if (topic && this._canAskTopicQuestion(topic)) {
        const specific = this.lang.topicSpecificQuestions?.[topic] || [];
        if (specific.length) {
          return this._pickVaried(specific, {
            ignoreQuestionBudget: true,
            trackQuestions: false
          });
        }
      }
      const pools = [
        this.lang.genericFallbacks,
        this.lang.strategyShiftFallbacks
      ];
      for (const pool of pools) {
        const candidates = pool.filter(
          (line) =>
            !this._isQuestionResponse(line) &&
            !this.memory.recentBotMessages.includes(line) &&
            line !== response
        );
        if (candidates.length > 0) {
          return candidates[Math.floor(Math.random() * candidates.length)];
        }
      }
      const anyNonQuestion = this.lang.genericFallbacks.find(
        (line) => !this._isQuestionResponse(line)
      );
      return anyNonQuestion || this.lang.genericFallbacks[0] || '';
    },

    // ======================================================================
    // Response scoring and selection
    //
    // _pickVaried: The central response selection method. Filters the
    // pool through the question budget, removes recently-used responses
    // from consideration, scores remaining candidates with
    // scoreResponseCandidate, and randomly selects from among the
    // top-scoring options to provide natural variety.
    //
    // scoreResponseCandidate: Ranks a response candidate on a 0-1 scale,
    // penalizing:
    //   - Recently used responses (-0.9, strong avoidance of repetition)
    //   - Question-type responses when consecutiveQuestions is high (-0.25 * n)
    //   - Very long responses (-0.08 over 220 chars)
    //   - Generic filler like "I see" or "Okay" (-0.12)
    // ======================================================================

    scoreResponseCandidate(candidate) {
      let score = 1;
      if (this.memory.recentBotMessages.includes(candidate)) {
        score -= RECENT_BOT_MESSAGE_PENALTY;
      }
      if (this._isQuestionResponse(candidate)) {
        score -=
          this.memory.consecutiveQuestions * CONSECUTIVE_QUESTION_PENALTY;
      }
      if (candidate.length > LONG_RESPONSE_THRESHOLD) {
        score -= LONG_RESPONSE_PENALTY;
      }
      if (
        /^(?:I see|Okay|Understood|متوجه شدم|باشه)[.!،؟]?$/iu.test(candidate)
      ) {
        score -= FILLER_RESPONSE_PENALTY;
      }
      return score;
    },

    _pickVaried(pool, options = {}) {
      const original = Array.isArray(pool) ? pool : [];
      if (original.length === 0) {
        return '';
      }
      let budgeted = options.ignoreQuestionBudget
        ? original
        : this._filterForQuestionBudget(original);
      if (budgeted.length === 0) {
        budgeted = [this._alternativeFor(original[0])];
      }
      if (budgeted.length === 1) {
        const only = budgeted[0];
        if (options.trackQuestions !== false) {
          this._noteAskedQuestion(only);
        }
        return only;
      }

      const recent = this.memory.recentBotMessages;
      let candidates = budgeted.filter((item) => !recent.includes(item));

      if (candidates.length === 0) {
        const last = recent[recent.length - 1];
        candidates = budgeted.filter((item) => item !== last);
      }
      if (candidates.length === 0) {
        candidates = budgeted;
      }

      const ranked = candidates.map((candidate) => ({
        candidate,
        score: this.scoreResponseCandidate(candidate)
      }));
      const bestScore = Math.max(...ranked.map((item) => item.score));
      const best = ranked
        .filter((item) => item.score >= bestScore - 0.12)
        .map((item) => item.candidate);
      const picked = best[Math.floor(Math.random() * best.length)];
      if (options.trackQuestions !== false) {
        this._noteAskedQuestion(picked);
      }
      return picked;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
