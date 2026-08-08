/**
 * Darya - smart overrides and reply finalization.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  var DaryaKnowledge = global.DaryaKnowledge;
  var handleFactualQuestion = global.DaryaFactual.handleFactualQuestion;
  var handleDateTimeQuestion = global.DaryaFactual.handleDateTimeQuestion;
  var handleFunFactsRequest = global.DaryaFactual.handleFunFactsRequest;

  const {
    MODERATE_SERIOUSNESS_THRESHOLD,
    BOREDOM_SKIP_CHANCE,
    WELLBEING_CHECK_TURNS,
    BOREDOM_CHECK_INTERVAL,
    BOREDOM_MIN_TURNS
  } = global.DaryaUtils;

  const { KNOWLEDGE_OVERRIDE_CONFIDENCE, LIVED_TOPICS } =
    global.DaryaResponderShared;

  Object.assign(global.DaryaResponseEngine.prototype, {
    _applySmartOverrides({
      reply,
      rawText,
      normalized,
      matchingText,
      isRepeatedGreeting,
      isSpamNoise,
      matchedRule
    }) {
      const _safetyTurn = matchedRule && matchedRule.topic === 'safety';
      let _overrideFired = false;

      // Near-peer young-adult crush override: an 18-20 year old with
      // romantic feelings for a 16-17 year old gets warm practical
      // guidance (pace, respect, consent, local laws) instead of the
      // adult-minor protection reply, which is reserved for mature
      // adults or larger gaps. Runs before the minor-attraction check so
      // the near-peer case is never clobbered by the heavier protective
      // response, and, once fired, suppresses the other overrides.
      const _nearPeerLoveTurn =
        !_safetyTurn && this._detectNearPeerLove(matchingText);
      if (_nearPeerLoveTurn) {
        reply = this._pickVaried(this.lang.nearPeerLoveResponses, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        _overrideFired = true;
      }

      // Critical child-safety override: an adult disclosing sexual or
      // romantic attraction toward a minor always receives the calm,
      // non-shaming, help-seeking reply, regardless of which rule matched.
      // It runs before every other override and, once fired, suppresses
      // them all (factual, math, knowledge, distress nudge) so the
      // protective reply can never be replaced or tone-stacked. It is
      // gated on _safetyTurn so a compound disclosure that also contains
      // acute crisis language ("I want to kill myself because I am
      // attracted to a 15-year-old") still gets the crisis reply first:
      // the safety pool carries hotline content, the minor-attraction pool
      // does not. The protected reply is picked with the question budget
      // ignored, mirroring the distress nudge, so it can never be swapped
      // for a generic fallback even if a pool line ever reads as a
      // question.
      const _minorAttractionTurn =
        !_safetyTurn &&
        !_nearPeerLoveTurn &&
        this._detectMinorAttraction(matchingText);
      if (_minorAttractionTurn) {
        reply = this._pickVaried(this.lang.minorAttractionResponses, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        _overrideFired = true;
      } else if (
        // First half of a split-turn disclosure: the speaker named an
        // attraction to a minor but has not stated their own age yet.
        // The pending record was armed this very turn, so reply with a
        // neutral, caring probe that asks for the ages instead of the
        // flirty compliment a generic rule could otherwise produce.
        !_safetyTurn &&
        !_nearPeerLoveTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        this._pendingMinorAttractionTurn &&
        this._pendingMinorAttractionTurn.turn === this.memory.turnCount &&
        this.lang.minorAttractionProbe
      ) {
        reply = this._pickVaried(this.lang.minorAttractionProbe, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        _overrideFired = true;
      }

      // Short-answer context override: a bare yes/no/maybe (or a Persian
      // equivalent like بله/نه/شاید) that answers a question Darya asked
      // in the recent turns must be read as an answer to that question,
      // not as a fresh generic statement. The pending question is marked
      // answered and the reply continues that thread (a topic-specific
      // follow-up or a warm continuation pool) instead of bouncing to the
      // generic affirmation/negation pools. Runs before the factual
      // overrides so a short answer can never be hijacked by math or
      // knowledge lookups.
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_nearPeerLoveTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise
      ) {
        const shortAnswerReply = this._resolveShortAnswerContext(matchingText);
        if (shortAnswerReply) {
          reply = shortAnswerReply;
          _overrideFired = true;
        }
      }

      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        matchedRule?.topic !== 'knowledge'
      ) {
        const factualReply = handleFactualQuestion(this, normalized);
        if (factualReply) {
          reply = factualReply;
          _overrideFired = true;
        }
      }

      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise
      ) {
        const dateTimeReply = handleDateTimeQuestion(this, normalized);
        if (dateTimeReply) {
          reply = dateTimeReply;
          _overrideFired = true;
        }
      }

      // Fun-fact requests ("tell me 3 facts", "give me a shocking fact",
      // "حقایق درباره حیوانات") draw from the curated FUN_FACTS pool. They
      // run BEFORE the factual-knowledge lookup: a request that explicitly
      // asks for facts is more specific than a general topic question, so
      // "give me 3 facts about sports" must not be hijacked by the sports
      // career/game facts and "حقایق درباره هنر" must not be answered
      // with the art-career entry. A plain topic question ("tell me about
      // Saturn") has no fact framing and still gets the encyclopedia
      // entry. Personal disclosures that merely contain the word "fact"
      // ("the fact that I am tired") never match because the request
      // framing is required.
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_overrideFired &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        DaryaKnowledge &&
        DaryaKnowledge.randomFacts
      ) {
        const factsReply = handleFunFactsRequest(this, matchingText);
        if (factsReply) {
          reply = factsReply;
          _overrideFired = true;
        }
      }

      // Factual-knowledge override: concrete questions about the world
      // ("tell me about Jupiter", "فیزیک کوانتوم چیه", "چطور پول دربیارم")
      // deserve a direct answer from the factual shelf even when they also
      // trip a conversational rule (e.g. the broad reflection rule). The
      // override is gated on question framing so an emotional disclosure
      // like "استرس دارم" is never answered with an encyclopedia entry;
      // the question/request patterns decide, not the topic words alone.
      const _knowledgeOverrideEligible =
        !_safetyTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        !_overrideFired &&
        matchedRule?.topic !== 'knowledge' &&
        matchedRule?.topic !== 'professional_boundary' &&
        // Personal disclosures stay conversational even when they contain a
        // knowledge keyword: "من ایمپاستر دارم" is a feeling, not a request
        // for a definition.
        matchedRule?.topic !== 'anxiety' &&
        matchedRule?.topic !== 'stress' &&
        matchedRule?.topic !== 'grief' &&
        matchedRule?.topic !== 'self_compassion' &&
        matchedRule?.topic !== 'burnout' &&
        DaryaKnowledge &&
        DaryaKnowledge.lookup &&
        this._isKnowledgeRequest(matchingText);
      if (_knowledgeOverrideEligible) {
        const factual = DaryaKnowledge.lookup(matchingText, this.lang.code);
        if (factual && factual.confidence >= KNOWLEDGE_OVERRIDE_CONFIDENCE) {
          const followup =
            this.lang.code === 'fa'
              ? ' دوست داری بیشتر درباره‌اش بگویی یا سؤال دیگری داری؟'
              : ' Would you like to go deeper, or is there another question?';
          reply = factual.text + followup;
          this._lastKnowledgeTopic = factual.topic;
          this._lastKnowledgeTurn = this.memory.turnCount;
          this._lastKnowledgeText = factual.text;
          _overrideFired = true;
        }
      }

      // Sequential knowledge refinement: after any knowledge answer ("tell
      // me about Jupiter", "چطور پول دربیارم"), a short follow-up that
      // only names a topic ("and Saturn?", "زحل چطور؟", "in horror genre
      // please", "بازی موبایل") has no framing of its own, so the regular
      // lookup finds nothing. The remembered knowledge context lets
      // lookupGenre (movie genres) and lookupFragment (other topics) map
      // the word to the matching fact and continue the conversation in
      // place instead of bouncing to a generic fallback.
      if (
        !_safetyTurn &&
        !_overrideFired &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        // A topic word used emotionally ("ترسناک" about a scary situation,
        // "horror" describing a feeling, "sad" after a loss) must stay with
        // the lived-experience rule, never be answered with a list or an
        // encyclopedia entry. Same exclusion set as the knowledge override
        // above, plus the knowledge and boundary rules, which already
        // handle their own fragments.
        matchedRule?.topic !== 'anxiety' &&
        matchedRule?.topic !== 'stress' &&
        matchedRule?.topic !== 'grief' &&
        matchedRule?.topic !== 'sadness' &&
        matchedRule?.topic !== 'anger' &&
        matchedRule?.topic !== 'loneliness' &&
        matchedRule?.topic !== 'relationship' &&
        matchedRule?.topic !== 'work' &&
        matchedRule?.topic !== 'knowledge' &&
        matchedRule?.topic !== 'professional_boundary' &&
        this._lastKnowledgeTopic &&
        this.memory.turnCount - this._lastKnowledgeTurn <= 3 &&
        DaryaKnowledge &&
        (DaryaKnowledge.lookupGenre || DaryaKnowledge.lookupFragment)
      ) {
        const wordCount = matchingText.split(/\s+/u).filter(Boolean).length;
        // A follow-up is a short request fragment ("in horror genre please",
        // "زحل چطور؟", "بازی موبایل"). Reject longer sentences and
        // first-person emotional phrasing ("this situation is absolute
        // horror for me", "i feel horror") so an emotional topic word never
        // gets answered with a list or encyclopedia entry.
        const isShortFragment =
          wordCount <= 6 &&
          // eslint-disable-next-line max-len
          !/\b(?:i\s+(?:feel|am)|i'?m|feel(?:ing|s)?\b|scared|afraid|terrified|frightened|this is|that is|makes me|for me|to me|my)\b/iu.test(
            matchingText
          ) &&
          !/(?<![\p{L}۰-۹])(?:من|دارم|احساس|می‌کنم|برام|واسه|ترسیده|می‌ترسم|شدم|شده|این|وضعیت)(?![\p{L}۰-۹])/u.test(
            matchingText
          );
        let refined = null;
        if (isShortFragment) {
          // A game request must beat the movie-genre lookup: "horror game"
          // names a game genre, not a film. When the fragment mentions a
          // game, only the topic lookup runs.
          const wantsGames = /بازی|گیم|game/iu.test(matchingText);
          if (!wantsGames) {
            refined =
              DaryaKnowledge.lookupGenre?.(matchingText, this.lang.code) ||
              null;
          }
          refined =
            refined ||
            DaryaKnowledge.lookupFragment?.(matchingText, this.lang.code) ||
            null;
        }
        if (refined) {
          const followup =
            this.lang.code === 'fa'
              ? ' دوست داری همین موضوع را بیشتر بگردیم یا سؤال دیگری داری؟'
              : ' Want to go deeper on this, or is there another question?';
          reply = refined.text + followup;
          this._lastKnowledgeTopic = refined.topic;
          this._lastKnowledgeTurn = this.memory.turnCount;
          this._lastKnowledgeText = refined.text;
          _overrideFired = true;
        }
      }

      // Format feedback: the user asks for each list item on its own
      // line ("better to write each on a separate line?", "بهتر نیست هر
      // کدوم رو در یک خط جداگانه بنویسی؟"). The reply acknowledges and,
      // when a knowledge list was just given, re-emits it line by line.
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        !_overrideFired &&
        this.lang.formatFeedbackPattern?.test(matchingText)
      ) {
        const list = this._lastKnowledgeText;
        const fresh =
          list && this.memory.turnCount - this._lastKnowledgeTurn <= 3;
        reply = this._pickVaried(this.lang.formatFeedbackResponses);
        if (fresh) {
          reply = `${reply}\n${list}`;
        }
        _overrideFired = true;
      }

      // Darya-targeted harassment: insults, bullying, or sexual comments
      // directed at Darya by name get a calm boundary response instead of
      // the general frustration de-escalation. This check runs BEFORE the
      // general insult/frustration override so the targeted response takes
      // priority.
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        // A repeated word inside a question usually means the user is
        // re-asking or testing, not dwelling on a single word: re-asking
        // "who made you?" must never be met with "you keep saying made".
        this.currentTurnDialogueAct !== 'question' &&
        this.lang.wordRepetitionResponses
      ) {
        const repetition = this._detectWordRepetition(matchingText);
        if (repetition) {
          const pool = this.lang.wordRepetitionResponses;
          const template = this._pickVaried(pool);
          reply = template
            .replace(/\{word\}/gu, repetition.word)
            .replace(/\{count\}/gu, String(repetition.count));
          _overrideFired = true;
        }
      }

      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        // Turns where the user is clearly testing Darya ("تستت می‌کنم",
        // "just testing you") get the warm testInputResponses pool instead
        // of frustration de-escalation or harassment boundary-setting, so
        // an innocent testing message can never be misread as an attack.
        this.currentTurnDialogueAct !== 'test_input' &&
        // Turns where the user is giving Darya feedback about her own
        // behavior ("you keep quoting words", "be smarter", "understand
        // my meaning") deserve a humble acknowledgement, not a frustration
        // de-escalation, even when the message is worded harshly. The same
        // applies to self-improvement requests.
        matchedRule?.topic !== 'meta_feedback' &&
        matchedRule?.topic !== 'self_improvement' &&
        this.lang.frustrationResponses
      ) {
        // Check Darya-targeted harassment FIRST (more specific, different
        // response tone: calm boundary-setting vs frustration de-escalation).
        // This runs before the general insult check so harassment takes
        // priority without needing a separate override guard.
        const harassmentType = this._detectDaryaHarassment(
          rawText,
          matchingText
        );
        if (
          harassmentType === 'sexual' &&
          this.lang.sexualHarassmentResponses
        ) {
          reply = this._pickVaried(this.lang.sexualHarassmentResponses);
          _overrideFired = true;
        } else if (harassmentType === 'abuse') {
          reply = this._pickVaried(this.lang.daryaHarassmentResponses);
          _overrideFired = true;
        } else {
          const frustrationType = this._detectFrustration(rawText);
          const hasInsult = this.lang.insultPattern
            ? this.lang.insultPattern.test(matchingText)
            : false;
          if (frustrationType || hasInsult) {
            reply = this._pickVaried(this.lang.frustrationResponses);
            _overrideFired = true;
          }
        }
      }

      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        this.memory.turnCount >= 3 &&
        this.lang.teasingMockingResponses
      ) {
        if (this._detectTeasingOrMocking(rawText, matchingText)) {
          reply = this._pickVaried(this.lang.teasingMockingResponses);
          _overrideFired = true;
        }
      }

      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        // A matched how-are-you rule already answered the user's check-in
        // with its own warm pool; let that response stand instead of
        // replacing it with the well-being override (which, when the
        // question budget is spent, would collapse to a generic fallback
        // and produce the "no advice" repetition the user complained about).
        matchedRule?.topic !== 'smalltalk_howareyou' &&
        this.memory.turnCount >= WELLBEING_CHECK_TURNS &&
        this.lang.wellBeingResponses
      ) {
        if (this._detectWellBeingCheck(matchingText)) {
          // The well-being check-in is a deliberate caring override: it
          // must always deliver, never be swapped for a generic fallback
          // when the question budget is exhausted.
          reply = this._pickVaried(this.lang.wellBeingResponses, {
            ignoreQuestionBudget: true,
            trackQuestions: false
          });
          _overrideFired = true;
        }
      }

      return {
        reply,
        safetyTurn: _safetyTurn,
        minorAttractionTurn: _minorAttractionTurn,
        nearPeerLoveTurn: _nearPeerLoveTurn,
        overrideFired: _overrideFired
      };
    },
    _finalizeReply({
      reply,
      normalized,
      matchingText,
      entities,
      matchedRule,
      blendKey,
      isRepeatedGreeting,
      isSpamNoise,
      safetyTurn,
      minorAttractionTurn,
      nearPeerLoveTurn,
      overrideFired
    }) {
      const _safetyTurn = safetyTurn;
      const _minorAttractionTurn = minorAttractionTurn;
      const _nearPeerLoveTurn = nearPeerLoveTurn;
      let _overrideFired = overrideFired;
      const primaryEmotion = this._detectPrimaryEmotion(matchingText);
      if (
        !_overrideFired &&
        !this._lightPositiveFired &&
        primaryEmotion !== 'neutral' &&
        this.currentTurnDialogueAct !== 'safety' &&
        // Gratitude turns are light and already warm: prepending an
        // empathy prefix (e.g. the hurt prefix on 'درد نکنه' inside
        // 'دستت درد نکنه') would misread a thank-you as distress.
        this.currentTurnDialogueAct !== 'gratitude' &&
        // Testing turns get the warm testInputResponses pool; a distress
        // prefix (e.g. on a message that denies being angry) would
        // contradict the user's own words.
        this.currentTurnDialogueAct !== 'test_input' &&
        // App/website feedback ("the theme looks broken", "the waves are
        // too small") is meta-talk about the app, not a personal emotional
        // disclosure: a hurt prefix would read as mock sympathy.
        matchedRule?.topic !== 'app_feedback' &&
        // Opener-help pool lines ("There is no wrong way to start...")
        // are already warm and encouraging; a "confused" empathy prefix
        // would stack a heavy tone onto a lightweight nudge.
        matchedRule?.topic !== 'opener_help' &&
        // Emotional-disclosure rules (anxiety, sadness, anger, grief, joy,
        // etc.) ship pool lines that already name the feeling ("I can hear
        // the sadness in what you are sharing", "خوشحالم که این حس خوب
        // را تجربه می‌کنید"). Prepending the generic empathy prefix on top
        // would double the acknowledgment and read as noise.
        !LIVED_TOPICS.has(matchedRule?.topic) &&
        matchedRule?.topic !== 'joy' &&
        !blendKey &&
        !isRepeatedGreeting &&
        !isSpamNoise
      ) {
        reply = this._calibrateEmotionalTone(reply, primaryEmotion);
      }

      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        this.memory.turnCount >= BOREDOM_MIN_TURNS &&
        this.memory.turnCount % BOREDOM_CHECK_INTERVAL === 0 &&
        this.lang.boredomResponses &&
        this.currentTurnSeriousness < MODERATE_SERIOUSNESS_THRESHOLD
      ) {
        const recentUtterances = this.memory.recentUtterances.slice(-3);
        const allBrief = recentUtterances.every(
          (u) => u.split(/\s+/u).filter(Boolean).length <= 3
        );
        if (allBrief && Math.random() < BOREDOM_SKIP_CHANCE) {
          reply = this._pickVaried(this.lang.boredomResponses);
          _overrideFired = true;
        }
      }

      if (this.currentTurnDialogueAct !== 'acknowledgement') {
        this.memory.consecutiveAcknowledgements = 0;
      }

      // Report entity memory with current topic and emotional context for
      // future callbacks. The line is long but remains readable as-is.

      this.memory.rememberEntities(entities, this.memory.turnCount, {
        topics: this.currentTurnTopics,
        seriousness: this.currentTurnSeriousness
      });

      const isSafetyTurn =
        (matchedRule && matchedRule.topic === 'safety') ||
        _minorAttractionTurn ||
        _nearPeerLoveTurn;
      if (
        !isSafetyTurn &&
        this.memory.isInDistressStreak() &&
        !this.memory.distressNudgeGiven
      ) {
        this.memory.distressNudgeGiven = true;
        // The nudge is a caring statement, not a question, and must always
        // be delivered: pass the question budget so "چند" (a few) in the
        // line text is never misread as the question word "چند" (how many)
        // and the nudge silently swapped for a generic fallback.
        reply = this._pickVaried(this.lang.distressNudges, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        _overrideFired = true;
      } else if (!this.memory.isInDistressStreak()) {
        this.memory.distressNudgeGiven = false;
      }

      if (!isSafetyTurn && _overrideFired) {
        // Smart override already set a precise reply. Skip human-tone coloring.
      } else if (!isSafetyTurn) {
        reply = this._maybeHumanTone(reply, normalized);
      }
      if (
        !isSafetyTurn &&
        !_overrideFired &&
        !this._lightPositiveFired &&
        this._shouldAddHumanTouch()
      ) {
        const touchLine = this._humanTouchLine();
        if (touchLine) {
          reply = `${reply} ${touchLine}`.trim();
        }
      }

      this._advanceConversationPhase(normalized);

      this.memory.rememberBotMessage(reply);
      return reply;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
