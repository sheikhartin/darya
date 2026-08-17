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
    PENDING_ANSWER_WINDOW,
    parseEchoShape
  } = global.DaryaUtils;

  /**
   * Function words ignored when checking whether an echoed question
   * fragment shares meaningful content with Darya's pending question.
   * Built once at module load, not per call (the check runs on every
   * unmatched statement turn, so a per-call Set would churn the GC).
   */
  const ECHO_STOPWORDS = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'of',
    'to',
    'in',
    'on',
    'at',
    'for',
    'with',
    'is',
    'are',
    'am',
    'was',
    'were',
    'be',
    'been',
    'do',
    'does',
    'did',
    'you',
    'your',
    'yours',
    'it',
    'its',
    'what',
    'which',
    'why',
    'how',
    'when',
    'where',
    'who',
    'that',
    'this',
    'these',
    'those',
    'have',
    'has',
    'had',
    'not',
    'no',
    'so',
    'but',
    'as',
    'by',
    'from',
    'out',
    'about',
    'into',
    'over',
    'after',
    'before',
    'چی',
    'چه',
    'کی',
    'کجا',
    'چرا',
    'چطور',
    'چگونه',
    'چقدر',
    // «کدوم»/«کدام» are question words like the others above: a bare
    // «کدوم» shared with an unrelated pending question must never count
    // as an echo (the habit-question false positive). The fragment
    // «کدوم آدم» still matches the exact «کدوم آدم باعث می‌شه...»
    // question through «آدم». The joined enclitic/compound forms
    // («کدومش», «کدومیک», «کدومتون»...) stay single tokens after the
    // letter/number split, so they are stopped explicitly too. Accepted
    // trade-off: a bare «کدوم؟! X» answer to a «کدوم»-only pending
    // question is intentionally not consumed as an echo, since a single
    // question word is weak evidence the user is echoing THIS question;
    // the turn falls back gracefully instead.
    'کدوم',
    'کدام',
    'کدومش',
    'کدامش',
    'کدومیک',
    'کدامیک',
    'کدومتون',
    'کدامتون',
    'هست',
    'است',
    'هستم',
    'هستی',
    'هستید',
    'که',
    'از',
    'به',
    'با',
    'در',
    'را',
    'و',
    'یا',
    'این',
    'آن',
    'تو',
    'من',
    'ما',
    'شما',
    'او',
    'برای',
    'بعد',
    'قبل',
    'هم',
    'نیز',
    'آیا',
    'فقط',
    'حتی',
    'خیلی',
    'الان',
    'امروز',
    'دیروز',
    'میشه',
    'می‌شه'
  ]);

  /**
   * Question words that can open a short two-word echo fragment
   * («کدوم آدم», "which person"). The user answers Darya's pending
   * question by repeating its opening phrase and then giving the answer;
   * the echoed noun is the cue ("I am answering the which-X question").
   * This secondary acceptance only applies when the pending question
   * does NOT contain the fragment's question word: if it does, the
   * fragment could be echoing that pending question's own wording, and
   * a bare question-word overlap is exactly the habit-question false
   * positive the stopword list above blocks (see «کدوم»). A one-word
   * fragment («کدوم؟! X») stays rejected: one word is too weak to prove
   * the user is echoing this question.
   */
  const ECHO_QUESTION_WORDS = new Set([
    'کدوم',
    'کدام',
    'کجا',
    'کی',
    'کیه',
    'چی',
    'چیه',
    'چه',
    'چطور',
    'چرا',
    'چگونه',
    'چقدر',
    'چند',
    'چیست',
    'کجاست',
    'which',
    'what',
    'where',
    'who',
    'whom',
    'whose',
    'how',
    'why',
    'when'
  ]);

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
        if (this.memory.askedQuestionsEver) {
          this.memory.askedQuestionsEver.add(response);
        }
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
        // Only questions not yet asked this session qualify: once the
        // topic pool is exhausted, fall to the acknowledgement pools
        // below instead of recycling the same questions verbatim (the
        // "ok" streak broken-record failure).
        const specific = (
          this.lang.topicSpecificQuestions?.[topic] || []
        ).filter(
          (line) =>
            !this.memory.askedQuestionsEver ||
            !this.memory.askedQuestionsEver.has(line)
        );
        if (specific.length) {
          reply = this._pickVaried(specific, {
            ignoreQuestionBudget: true,
            trackQuestions: false
          });
        }
      }
      if (reply === null) {
        let pool =
          kind === 'negate'
            ? this.lang.shortAnswerNegateContext
            : kind === 'maybe'
              ? this.lang.shortAnswerMaybeContext
              : this.lang.shortAnswerAffirmContext;
        // On a long short-answer streak the context pool's questions
        // run out; once every question line has been asked verbatim,
        // switch to the non-question lines (or the acknowledgement
        // pool) instead of repeating a question word-for-word.
        if (pool && pool.length && this.memory.askedQuestionsEver) {
          const unspent = pool.filter(
            (line) =>
              !this._isQuestionResponse(line) ||
              !this.memory.askedQuestionsEver.has(line)
          );
          pool =
            unspent.length > 0
              ? unspent
              : (this.lang.acknowledgementResponses || []).filter(
                  (line) => !this._isQuestionResponse(line)
                );
        }
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

    /**
     * Resolves a question-echo answer: the user repeats Darya's own
     * question word and then gives the answer ("کدوم آدم؟! الیاس،
     * خواهرزاده من", "which person?! Elias, my nephew"). This is a
     * natural Persian and English answering pattern that must be read as
     * an answer to the pending question, not as a fresh question (which
     * used to produce the evasive "I don't know" fallback, a top
     * complaint from real transcripts). Marks the pending question
     * answered and returns a warm acknowledgment that engages the answer
     * content. Returns null when there is no pending question, no echo
     * (the ؟ is mid-sentence or absent), the echoed fragment is not
     * short (see parseEchoShape), or the tail is itself a fresh question.
     * @param {string} matchingText - Normalized matching text
     * @param {string} rawText - Raw (unnormalized) user input; the echo
     * structure (؟/؟! separating question from answer) only survives here
     * because the normalizer strips punctuation.
     * @returns {string|null}
     */
    _resolveEchoAnswer(matchingText, rawText) {
      const pending = this._latestUnansweredQuestion();
      if (!pending) {
        return null;
      }
      if (this.memory.turnCount - pending.askedAtTurn > PENDING_ANSWER_WINDOW) {
        return null;
      }
      // A genuinely short question fragment ending in ؟/؟! followed by an
      // answer of at least two words. parseEchoShape bounds the fragment
      // (chars and words) so a full-length question of the user's own
      // ("آیا الیزا هم مثل تو گاو بوده؟! من تحقیق کردم...") is never
      // consumed as an echo, even when it shares a word with the pending
      // question (the ELIZA follow-up misfire). The fragment must also
      // share meaningful words with the pending question (see below),
      // which keeps genuine new questions ("دیروز چه اتفاقی افتاد؟
      // خسته‌ام") from being misread as echoes. A short two-word
      // question-word fragment («کدوم آدم») whose question word the
      // pending question does not contain is accepted as well: the user
      // is answering a which-X question even when the ask-me pool picked
      // different wording (see _isShortQuestionEcho).
      const echo = parseEchoShape(rawText || matchingText);
      if (!echo) {
        return null;
      }
      if (
        !this._echoSharesPendingQuestion(echo.fragment, pending.question) &&
        !this._isShortQuestionEcho(echo.fragment, pending.question)
      ) {
        return null;
      }
      this.memory.markLatestQuestionAnswered(
        this._currentNormalizedInput || matchingText,
        this.memory.turnCount
      );
      const pool = this.lang.echoAnswerResponses;
      if (!pool || pool.length === 0) {
        return null;
      }
      const reply = this._pickVaried(pool, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      });
      return reply.replace(/\{answer\}/gu, echo.answerPart);
    },

    /**
     * True when the echoed question fragment shares at least one
     * meaningful word with the pending question Darya asked. Function
     * words (articles, pronouns, question particles) are ignored so a
     * bare "چی بود؟!" does not count as an echo of an unrelated
     * question. This is the guard that stops a genuine new question
     * followed by its own answer ("دیروز چه اتفاقی افتاد؟ خسته‌ام")
     * from being misread as an echo of a different pending question.
     * @param {string} fragment - The question fragment before ؟/?
     * @param {string} pendingQuestion - The recorded bot question
     * @returns {boolean}
     */
    _echoSharesPendingQuestion(fragment, pendingQuestion) {
      if (!fragment || !pendingQuestion) {
        return false;
      }
      const words = (text) =>
        text
          .toLowerCase()
          .split(/[^\p{L}\p{N}]+/u)
          .filter((w) => w.length >= 3 && !ECHO_STOPWORDS.has(w));
      const questionWords = new Set(words(pendingQuestion));
      return words(fragment).some((w) => questionWords.has(w));
    },

    /**
     * True when the echoed fragment is a short two-word question opener
     * (a question word plus one content word, e.g. «کدوم آدم», "which
     * person") and the pending question does not itself contain that
     * question word. The user answering Darya's open question echoes the
     * opening and then answers; when the ask-me pool picked different
     * wording, the word-share guard alone would reject the echo and the
     * turn fell to the generic non-answer. Requiring the question word
     * to be ABSENT from the pending question preserves the habit false
     * positive: there the pending question carries the same question
     * word («...کدوم رو انتخاب می‌کردی؟»), so the overlap is exactly
     * the bare-word case the stopword list blocks.
     * @param {string} fragment - The question fragment before ؟/؟
     * @param {string} pendingQuestion - The recorded bot question
     * @returns {boolean}
     */
    _isShortQuestionEcho(fragment, pendingQuestion) {
      if (!fragment || !pendingQuestion) {
        return false;
      }
      const tokens = (text) =>
        String(text || '')
          .toLowerCase()
          .split(/[^\p{L}\p{N}]+/u)
          .filter(Boolean);
      const fragmentWords = tokens(fragment);
      if (fragmentWords.length !== 2) {
        return false;
      }
      const fragmentQuestionWords = fragmentWords.filter((w) =>
        ECHO_QUESTION_WORDS.has(w)
      );
      if (fragmentQuestionWords.length === 0) {
        return false;
      }
      const pendingTokens = new Set(tokens(pendingQuestion));
      return !fragmentQuestionWords.some((w) => pendingTokens.has(w));
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
    // from consideration, applies the personality-engine quality gates
    // (no riddle jokes on heavy turns, no recently-used openers), scores
    // remaining candidates with scoreResponseCandidate, and randomly
    // selects from among the top-scoring options to provide natural
    // variety.
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

      // Hard no-repeat for questions: a question asked once this
      // session is never asked verbatim again while an unasked
      // alternative exists (the "ok" streak used to alternate the same
      // two pool questions forever). Statements stay recency-filtered
      // only, so small pools cannot starve.
      if (this.memory.askedQuestionsEver && candidates.length > 1) {
        const fresh = candidates.filter(
          (item) =>
            !this._isQuestionResponse(item) ||
            !this.memory.askedQuestionsEver.has(item)
        );
        if (fresh.length > 0) {
          candidates = fresh;
        }
      }

      if (candidates.length === 0) {
        const last = recent[recent.length - 1];
        candidates = budgeted.filter((item) => item !== last);
      }
      if (candidates.length === 0) {
        candidates = budgeted;
      }

      // Phase 2 quality gates (personality engine, see personality-
      // engine.js): a heavy turn must never receive a riddle-style joke
      // line from any pool, and no reply should re-open with an opener
      // already used in a recent bot message ("That sounds really hard."
      // twice in a row reads scripted). Each gate only prunes when a
      // non-empty set survives, so a tiny pool can never collapse to an
      // empty pick.
      const personality = global.DaryaPersonalityEngine;
      if (personality && candidates.length > 1) {
        const heavyTurn =
          this.lastTurnNeedsCare ||
          personality.classifyTone(
            this.currentTurnSeriousness,
            this._lastEmotionAnalysis || null
          ) === 'heavy';
        if (heavyTurn) {
          const coherent = candidates.filter(
            (item) => !personality.isToneIncoherent(item)
          );
          if (coherent.length > 0) {
            candidates = coherent;
          }
        }
        const freshOpeners = candidates.filter(
          (item) => !personality.wasOpenerUsedRecently(item, recent)
        );
        if (freshOpeners.length > 0) {
          candidates = freshOpeners;
        }
      }

      const ranked = candidates.map((candidate) => ({
        candidate,
        score: this.scoreResponseCandidate(candidate)
      }));
      const bestScore = Math.max(...ranked.map((item) => item.score));
      let best = ranked
        .filter((item) => item.score >= bestScore - 0.12)
        .map((item) => item.candidate);
      // Phase 2 quality retry (response scorer, see response-scorer.js):
      // among the top-ranked candidates, drop any that trip an objective
      // quality signal (question overload, missing acknowledgment on a
      // heavy turn) when a cleaner alternative remains. Recency and
      // opener repetition are already handled above, so the scorer only
      // adds signals the pool scoring does not see.
      const scorer = global.DaryaResponseScorer;
      if (scorer && best.length > 1) {
        const strong = best.filter((candidate) => {
          const result = scorer.scoreReply(candidate, {
            userLength: String(this._currentNormalizedInput || '').length,
            seriousness: this.currentTurnSeriousness,
            recentBotMessages: recent
          });
          return !scorer.shouldRetry(result);
        });
        if (strong.length > 0) {
          best = strong;
        }
      }
      const picked = best[Math.floor(Math.random() * best.length)];
      if (options.trackQuestions !== false) {
        this._noteAskedQuestion(picked);
      }
      return picked;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
