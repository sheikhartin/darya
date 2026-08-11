/**
 * Darya - conversation phase, tone and knowledge-gate methods.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  const {
    CONSECUTIVE_QUESTION_LIMIT,
    QUESTION_BUDGET_WINDOW,
    QUESTION_BUDGET_LIMIT,
    SERIOUS_TURN_THRESHOLD,
    MODERATE_SERIOUSNESS_THRESHOLD,
    SERIOUSNESS_TOPIC_FLOOR,
    SERIOUSNESS_WEIGHT,
    HUMOR_CHANCE,
    WARMTH_MIN_SERIOUSNESS,
    WARMTH_MAX_SERIOUSNESS,
    WARMTH_MIN_TURN_GAP,
    WARMTH_CHANCE,
    SMALLTALK_MIN_LIGHT_STREAK,
    SMALLTALK_TURN_INTERVAL,
    SMALLTALK_CHANCE,
    HUMAN_TOUCH_INTERVAL,
    OPENING_RETURNING_PRIMARY,
    OPENING_RETURNING_SECONDARY,
    OPENING_NEW_PRIMARY,
    HUMOR_BLOCK_PATTERN,
    scoreSentiment
  } = global.DaryaUtils;

  const { LIVED_TOPICS } = global.DaryaResponderShared;

  Object.assign(global.DaryaResponseEngine.prototype, {
    _phaseForTurn(strategy, seriousness) {
      if (strategy === 'safety') {
        return 'safetySupport';
      }
      if (strategy === 'context-reference') {
        return 'contextualContinuation';
      }
      if (
        strategy === 'topic-question' ||
        strategy === 'question-acknowledgement'
      ) {
        return 'clarifying';
      }
      if (seriousness >= SERIOUS_TURN_THRESHOLD) {
        return 'reflecting';
      }
      return this.memory.turnCount <= 1 ? 'greeting' : 'listening';
    },

    _seriousnessForTurn(topics) {
      const values = (topics || []).map(
        (topic) =>
          this.lang.topicSeriousness?.[topic] ?? SERIOUSNESS_TOPIC_FLOOR
      );
      const current = values.length ? Math.max(...values) : SERIOUSNESS_WEIGHT;
      const recent = this.memory.seriousnessHistory.slice(-2);
      const average = recent.length
        ? recent.reduce((sum, v) => sum + v, 0) / recent.length
        : 0;
      return Math.max(current, average);
    },

    _blendKey(topics) {
      if (!topics || topics.length < 2) {
        return null;
      }
      const pairs = [
        ['sleep', 'anxiety'],
        ['work', 'anger'],
        ['family', 'sadness'],
        ['loneliness', 'sleep'],
        ['joy', 'gratitude'],
        ['anxiety', 'loneliness'],
        ['health', 'anxiety'],
        ['grief', 'anger']
      ];
      const found = pairs.find((pair) =>
        pair.every((topic) => topics.includes(topic))
      );
      return found ? `blend_${found.join('_')}` : null;
    },

    canHumorFire(normalized) {
      return (
        this.memory.turnCount >= 3 &&
        // A question turn gets an ANSWER (knowledge, factual, or a warm
        // reflection); swapping in a random humor line would replace
        // "Jupiter is the largest planet" with "that was a plot twist",
        // a real-transcript failure mode.
        this.currentTurnDialogueAct !== 'question' &&
        this.currentTurnSeriousness < SERIOUS_TURN_THRESHOLD &&
        !this.lastTurnNeedsCare &&
        // A negative-sentiment or aversive turn ("I don't even want to go
        // tomorrow", "my voice shakes when I present") is never joke
        // material, even when no single word raised the seriousness score
        // past the threshold. The text gate only applies when a normalized
        // text is provided; direct unit calls without one keep the
        // state-based behavior.
        (!normalized ||
          (scoreSentiment(normalized, this.lang.sentimentLexicon) >= 0 &&
            !HUMOR_BLOCK_PATTERN.test(normalized)))
      );
    },

    _canAskTopicQuestion(topic) {
      const pool = this.lang.topicSpecificQuestions?.[topic];
      if (!pool || !this.lang.questionTopics?.has(topic)) {
        return false;
      }
      if (
        this.currentTurnDialogueAct === 'question' ||
        this.currentTurnQuestionNeed < MODERATE_SERIOUSNESS_THRESHOLD
      ) {
        return false;
      }
      const recent = this.memory.askedQuestionTurns.filter(
        (turn) => this.memory.turnCount - turn < QUESTION_BUDGET_WINDOW
      );
      return (
        recent.length < QUESTION_BUDGET_LIMIT &&
        this.memory.consecutiveQuestions < CONSECUTIVE_QUESTION_LIMIT
      );
    },

    // ======================================================================
    // Human-tone coloring
    // ======================================================================

    _maybeHumanTone(reply, normalized) {
      if (this._lightPositiveFired) {
        // The reply already came from the smalltalk pool for a light,
        // positive casual statement. Further coloring (humor, warmth,
        // smalltalk replacement) would stack tones and read as robotic.
        return reply;
      }
      if (this.currentTurnDialogueAct === 'greeting') {
        // Greeting replies already carry the right warm tone in their own
        // pool. Humor or warmth coloring would overwrite the mirrored
        // greeting word ("Hello." -> "That made me smile."), so leave the
        // greeting reply exactly as the pool intended.
        return reply;
      }
      if (this.currentTurnDialogueAct === 'test_input') {
        // Testing turns get the warm testInputResponses pool. Replacing
        // them with random humor or a heavy warmth prefix would misread
        // a playful "I am testing you" as a topic to joke over.
        return reply;
      }
      // Light, already-warm rule topics (smalltalk pools, how-are-you,
      // gratitude, app feedback, joy) ship their own warm pool lines.
      // Prepending a generic warmth line ("You don't have to solve it all
      // at once") before a "I'm doing well, thank you" or a playful
      // smalltalk reply stacks tones and reads as noise.
      const alreadyWarmTopic = this.currentTurnTopics.some(
        (topic) =>
          topic.startsWith('smalltalk_') ||
          topic === 'gratitude' ||
          topic === 'app_feedback' ||
          topic === 'joy' ||
          // The meta-topic pools below ship their own warm lines, so humor
          // or warmth coloring would stack tones and read as robotic.
          topic === 'word_meaning' ||
          topic === 'ask_me_question' ||
          topic === 'self_improvement' ||
          topic === 'what_do_i_do' ||
          topic === 'opener_help' ||
          topic === 'unsure_topic' ||
          topic === 'apology' ||
          topic === 'meta_feedback' ||
          topic === 'about_eliza' ||
          topic === 'compliment_darya' ||
          topic === 'misread_correction' ||
          // The generalization pool gently challenges a blanket belief
          // with its own acknowledging opener; humor or a heavy warmth
          // prefix would undercut the challenge and read as flippant.
          topic === 'generalization' ||
          // App-command pool lines already carry the honest pointer to the
          // real UI control; humor or warmth coloring would replace the
          // "turn on ambient sound" reply with a tone line and re-break
          // the transcript scenario.
          topic === 'app_command'
      );
      if (alreadyWarmTopic) {
        return reply;
      }
      if (this.canHumorFire(normalized) && Math.random() < HUMOR_CHANCE) {
        return this._pickVaried(this.lang.humor || [reply]);
      }
      if (
        // Warmth lines are heavy statements ("این موضوع واقعاً سنگین
        // است") that only fit turns with an actual topic. Without this
        // guard a topic-less light turn ("چی رو؟!", ":)") could get a
        // misplaced "this feels heavy" prefix.
        this.currentTurnTopics.length > 0 &&
        this.currentTurnSeriousness >= WARMTH_MIN_SERIOUSNESS &&
        this.currentTurnSeriousness < WARMTH_MAX_SERIOUSNESS &&
        this.memory.turnCount - this.memory.lastWarmthTurn >=
          WARMTH_MIN_TURN_GAP &&
        Math.random() < WARMTH_CHANCE
      ) {
        this.memory.lastWarmthTurn = this.memory.turnCount;
        return `${this._pickVaried(this.lang.warmth || [])} ${reply}`.trim();
      }
      if (
        this.memory.lightStreak >= SMALLTALK_MIN_LIGHT_STREAK &&
        !this.lastTurnNeedsCare &&
        this.memory.turnCount % SMALLTALK_TURN_INTERVAL === 0 &&
        Math.random() < SMALLTALK_CHANCE &&
        normalized &&
        !this.lang.questionPattern.test(normalized) &&
        // The light smalltalk replacement is only for genuinely light,
        // non-negative turns: a nervous or reluctant disclosure on a
        // light streak ("my voice shakes when I present") must keep its
        // caring reply, never be swapped for a cheerful smalltalk line.
        this.currentTurnSeriousness < MODERATE_SERIOUSNESS_THRESHOLD &&
        scoreSentiment(normalized, this.lang.sentimentLexicon) >= 0 &&
        !HUMOR_BLOCK_PATTERN.test(normalized)
      ) {
        return this._pickVaried(this.lang.smalltalk || [reply]);
      }
      return reply;
    },

    _shouldAddHumanTouch() {
      return (
        this.memory.turnCount > 0 &&
        this.memory.turnCount % HUMAN_TOUCH_INTERVAL === 0 &&
        this.currentTurnSeriousness < SERIOUS_TURN_THRESHOLD &&
        this.memory
          .eligibleNamedEntities(this.entityCallbackThreshold)
          .some(
            (entity) =>
              entity.type !== 'time' &&
              entity.lastMentionTurn < this.memory.turnCount
          )
      );
    },

    _humanTouchLine() {
      const entity = this.memory
        .eligibleNamedEntities(this.entityCallbackThreshold)
        .find(
          (item) =>
            item.type !== 'time' && item.lastMentionTurn < this.memory.turnCount
        );
      const pool = this.lang.humanTouch || [];
      return entity && pool.length
        ? this._pickVaried(pool).replace(/\{surface\}/gu, entity.surface)
        : '';
    },

    // ======================================================================
    // Greeting selection and phase advancement
    //
    // Opening greetings are selected from four distinct pools based on
    // the current conversation phase and whether the user has returned
    // (has remembered entities):
    //   - greetingsPhase1: Warm, establishing presence ("I am Darya...")
    //   - greetingsPhase2: Gentle orientation, low-pressure binary choice
    //   - greetingsOpen: Neutral invitation to share (returning or new)
    //   - greetingsInviting: Warm invitation (higher engagement tone)
    //   - greetingsReturning: Acknowledging a return visit
    //
    // Phase advancement (_advanceConversationPhase) is called after every
    // turn. It transitions through new -> orienting -> engaging -> deepening
    // based on turn count and input substance.
    // ======================================================================

    _openingForNewConversation() {
      const returning = this.memory.namedEntities.size > 0;
      const roll = Math.random();
      let pool;
      if (returning) {
        pool =
          roll < OPENING_RETURNING_PRIMARY
            ? this.lang.greetingsReturning || this.lang.greentingsReturning
            : roll < OPENING_RETURNING_SECONDARY
              ? this.lang.greetingsInviting || this.lang.greentingsInviting
              : this.lang.greetingsOpen || this.lang.greentingsOpen;
      } else {
        pool =
          roll < OPENING_NEW_PRIMARY
            ? this.lang.greetingsInviting || this.lang.greentingsInviting
            : roll < OPENING_RETURNING_SECONDARY
              ? this.lang.greetingsOpen || this.lang.greentingsOpen
              : this.lang.greetingsReturning || this.lang.greentingsReturning;
      }
      return this._pickVaried(pool || this.lang.greetings, {
        trackQuestions: false
      });
    },

    _advanceConversationPhase(userInput) {
      const wordCount = String(userInput || '')
        .trim()
        .split(/\s+/u)
        .filter(Boolean).length;
      const turnCount = this.memory.turnCount;

      if (this.conversationPhase === 'new') {
        this.conversationPhase = 'orienting';
      } else if (this.conversationPhase === 'orienting' && turnCount >= 2) {
        if (wordCount >= 5 || this.currentTurnTopics.length > 0) {
          this.conversationPhase = 'engaging';
        } else if (turnCount >= 4) {
          this.conversationPhase = 'engaging';
        }
      } else if (this.conversationPhase === 'engaging' && turnCount >= 6) {
        this.conversationPhase = 'deepening';
      }
    },

    _phaseGreeting() {
      if (
        this.conversationPhase === 'new' &&
        this.lang.greetingsPhase1 &&
        this.lang.greetingsPhase1.length
      ) {
        return this._pickVaried(this.lang.greetingsPhase1, {
          trackQuestions: false
        });
      }
      if (
        this.conversationPhase === 'orienting' &&
        this.lang.greetingsPhase2 &&
        this.lang.greetingsPhase2.length
      ) {
        return this._pickVaried(this.lang.greetingsPhase2, {
          trackQuestions: false
        });
      }
      return this._openingForNewConversation();
    },

    // ======================================================================
    // Rule matching and response selection
    //
    // _matchRules: Iterates the priority-sorted rule list and returns all
    // matches with their capture groups. Rules are tried in descending
    // priority order; the first match has the highest priority, but all
    // matches are returned for topic blend detection.
    //
    // _respondWithRule: Given a matched rule and its capture string,
    // selects the appropriate response. Special-cases gratitude,
    // professional_boundary, recap, and knowledge rules. Falls back
    // gracefully when a capture is expected but missing.
    //
    // _fallbackResponse: The last-resort response generator when no rule
    // matches. Tries entity callback, session check-in, question fallback,
    // quoted callback (echoing user's own words), and pronoun reflection
    // before falling through to generic/strategy-shift fallback pools.
    // Alternates between genericFallbacks and strategyShiftFallbacks to
    // provide natural variety.
    // ======================================================================

    /**
     * Returns true when the input reads as an explicit knowledge request
     * ("درباره استرس توضیح بده", "Tell me about stress management")
     * rather than a personal disclosure. Used by _preferLivedRuleOverKnowledge
     * to keep genuine knowledge queries on the knowledge shelf.
     * @param {string} text - Normalized matching text
     * @returns {boolean}
     */
    _isKnowledgeRequest(text) {
      // "best X" for a buyable product is a guide request ("best camera to
      // buy"); bare "best" is too broad to include on its own, so only the
      // product-noun combination counts.
      // Follow-up and opinion framings were added for the 2026 persona
      // round: "how does a turbocharger actually work?", "who has the
      // most F1 titles?", "is Tesla really the future?", "do you think
      // it will replace computers?" and rec-follow-ups ("anything
      // similar but darker?") all need the knowledge lookup to engage.
      // Bare copulas (is/are/am) stay OUT: they are too common in
      // emotional disclosures ("my life is hard") and would let the
      // knowledge shelf hijack lived feelings. The lookup itself still
      // gates the answer, so these framings only open the door.
      const en =
        // eslint-disable-next-line max-len
        /\b(?:tell me|explain|how (?:can|do|should|to|long|much|many|does|did)|advice|tips|learn|what (?:is|are)|who (?:is|was|has|won)|teach me|guide me|ways? to|strategies? for|manage|practice|recommend|suggest|which|should i (?:buy|get)|buying guide|buying advice|best (?:camera|cameras|laptop|laptops|phone|phones|headphones?|earbuds?|vpn)|where (?:can|to|do|does|is|are|did|was|were) (?:i )?buy|where to buy|compare prices|which site|marketplace|app store|cafe bazaar|myket|download apps|price comparison|movies?|games?|series|career|major|profession|about|why|does it|did it|do you think|will (?:it|they|this|that|ai|we)|is it|is there|is .{0,18} really|really (?:the|a|an|real)|actually work|exactly|in simple terms|in simpler|simplify|make it simpler|like that|similar|another|one more|what about|so how|but how|how do we|how do they|best stack|best language|simply)\b/i;
      // Only genre words that commonly appear without a فیلم/سریال prefix
      // are listed here (انیمیشن, مستند). Thriller queries ("فیلم هیجانی",
      // "تریلر معرفی کن") already carry فیلم/پیشنهاد/معرفی, and standalone
      // "تریلر" is ambiguous with "trailer", so it stays out on purpose.
      // The buying-intent markers (بخرم, هندزفری, فیلترشکن) route a shopping
      // question ("کدوم هندزفری بخرم") to the buying facts instead of the
      // generic shopping boundary pool. Bare "کدوم/کدام" stays OUT on
      // purpose: it is too common in personal disclosures ("استرس دارم
      // کدوم مسیر رو برم") and would let the knowledge rule hijack lived
      // emotions.
      const fa =
        // eslint-disable-next-line max-len
        /(?:درباره|راجع به|توضیح|چطور|چگونه|چیست|چیه|چند|چقدر|کجاست|کجا|کی بود|کیه|کی هست|چیا هستن|چی هستن|چیاست|راهنمایی|یاد بگیرم|کنترل کنم|مدیریت کنم|برام بگو|نظرت|روش|آموزش|معرفی|پیشنهاد|فیلم|سریال|بازی|شغل|رشته|دانشگاه|انیمیشن|مستند|بخرم|بگیرم|هندزفری|فیلترشکن|وی پی ان|مقایسه|قیمت|کافه بازار|مایکت|اپ استور|دانلود اپ|نصب اپ|ساده بگو|ساده بگی|ساده‌تر بگو|ساده تر بگو|ساده‌تر بگی|ساده توضیح|واقعیه|یعنی چی|کدومه|کدام است)/u;
      return en.test(text) || fa.test(text);
    },

    /**
     * True when the question is a first-person process question
     * ("چطور میتونم مدیریت کنم", "how do I talk to her") that deictically
     * refers back to the active conversation subject. Such questions ask
     * for guidance on the topic the user JUST disclosed, so the subject
     * continuation serves them better than an honest-ignorance reply.
     * Genuine new questions ("دیروز چه اتفاقی افتاد؟", "what is the
     * capital of France?") never match these first-person process forms,
     * so they keep the honest question fallback and are never hijacked by
     * an old subject.
     * @param {string} text - Normalized matching text
     * @returns {boolean}
     */
    _isPersonalProcessQuestion(text) {
      const en =
        // eslint-disable-next-line max-len
        /\b(?:how (?:can|do|should|could|would) i\b|how to\b|what (?:should|can|do) i\b|what (?:should|can|do) we\b|can you help me\b|do you think i can\b|will i\b|can i\b)/iu;
      // Only first-person subjunctive forms count: «شه/بشه/شود» are
      // third-person and would let a genuine new question like «چطور
      // میشه؟» (how is that possible?) be hijacked by an old subject.
      // The «باید/میتونم» branch keeps short repair questions on the
      // active thread («فکر می‌کنی باید جواب بدم؟») without touching
      // «باید برم» (I have to go).
      const fa =
        // eslint-disable-next-line max-len
        /(?:چطور|چگونه|چجوری|چی جوری|چه جوری|چطوری)\s*.{0,40}?(?:کنم|بکنم|بزنم|برم|بیام|بگم|بگویم|بگیرم|بدم|بردارم|بذارم|بگذارم|بشوم|بشم|بخوام|بخواهم|ببینم|بفهمم)|(?:می‌خوام|میخوام|دلم می‌خواد|دلم میخواد).{0,20}(?:کنم|بکنم)|(?:باید|می‌تونم|میتونم|بتونم).{0,14}(?:بدم|بکنم|کنم|جبران کنم|درستش کنم)/u;
      return en.test(text) || fa.test(text);
    },

    /**
     * Reorders rule matches so a lived-experience rule (anxiety, stress,
     * sadness, anger, grief, loneliness, relationship, work) beats the broad
     * knowledge rule for emotional disclosures, while explicit knowledge
     * requests keep the knowledge routing. The knowledge regex deliberately
     * includes bare emotion words ("استرس", "overwhelmed") so it can answer
     * "How can I manage stress?", but those same words appear in personal
     * statements ("امروز احساس استرس دارم") where a lecture would feel
     * dismissive.
     * @param {Array} matches - Rule matches sorted by priority descending
     * @param {string} text - Normalized matching text
     * @returns {Array} Reordered matches
     */
    _preferLivedRuleOverKnowledge(matches, text) {
      // The learning_advice rule ("should i learn react or vue?", "how
      // do i start streaming?") outranks the knowledge shelf by
      // priority, but a first-person emotional disclosure that mentions
      // learning ("i feel anxious and i want to learn to cope") must
      // still reach the lived-experience rule: treat it like knowledge
      // so the same reorder applies.
      const first = matches[0]?.rule?.topic;
      if (first !== 'knowledge' && first !== 'learning_advice') {
        return matches;
      }
      if (this._isKnowledgeRequest(text)) {
        return matches;
      }
      const lived = matches.find((match) => LIVED_TOPICS.has(match.rule.topic));
      if (!lived) {
        return matches;
      }
      return [lived, ...matches.filter((match) => match !== lived)];
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
