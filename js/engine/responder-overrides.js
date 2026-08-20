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
    BOREDOM_MIN_TURNS,
    WORD_REPETITION_THRESHOLD,
    PLAYFUL_HUFF_CHANCE,
    PLAYFUL_HUFF_MIN_TURNS,
    PLAYFUL_HUFF_STREAK,
    SAFETY_CRITICAL_TOPICS,
    containsDeathLexicon
  } = global.DaryaUtils;

  const { KNOWLEDGE_OVERRIDE_CONFIDENCE, LIVED_TOPICS } =
    global.DaryaResponderShared;

  // An educational how-to question ("how do I start investing?",
  // «چطور سرمایه‌گذاری را شروع کنم؟», "investing for beginners") is a
  // request for general knowledge, not a personal financial/medical/legal
  // decision. Such a question lets the knowledge shelf answer even when the
  // professional_boundary rule (which matches the bare topic word like
  // "investing") fired first. Direct personal decisions ("should I invest
  // my savings?", "give me financial advice") do not match and keep the
  // professional boundary.
  const EDUCATIONAL_HOWTO_EN =
    // eslint-disable-next-line max-len
    /\b(?:how (?:do|can|should|to|would) (?:i |we )?(?:start|begin|learn|get into|get started with|understand))|investing for beginners|beginner.{0,12}invest/i;
  const EDUCATIONAL_HOWTO_FA =
    // eslint-disable-next-line max-len
    /(?:چطور|چگونه|چطوری|چه جوری).{0,12}(?:شروع کنم|یاد بگیرم|یاد بگیر|بفهمم|برم سراغ)|سرمایه.{0,8}(?:برای مبتدی|از صفر)/u;
  const EDUCATIONAL_HOWTO = (text) =>
    EDUCATIONAL_HOWTO_EN.test(text) || EDUCATIONAL_HOWTO_FA.test(text);
  const PANIC_EDUCATION_REQUEST =
    // eslint-disable-next-line max-len
    /\b(?:what is|what are|explain|symptoms? of|how does).{0,24}panic(?: attack)?\b|(?:حمله )?(?:پانیک|پنیک|وحشت).{0,16}(?:چیست|چیه|یعنی چی|توضیح|علایم|علائم|نشانه)/iu;

  // Topics that mean the user asked a genuine question of their own,
  // which the rule pipeline answers directly. The question-echo override
  // must never fire on such a message: a user asking who made Darya
  // ("آیا الیزا هم مثل تو گاو بوده؟!") is not answering Darya's pending
  // question, even when the fragment shares a word with it, so echoing
  // their own words back would read as mockery.
  const ECHO_BLOCKED_TOPICS = new Set([
    'about_eliza',
    'knowledge',
    'smalltalk_identity',
    'smalltalk_capability',
    'word_meaning',
    'recap',
    'what_do_i_do',
    'professional_boundary'
  ]);

  // The frustration/insult and word-repetition overrides must never
  // replace the reply of a matched substantive rule. The transcript's
  // top complaint was that a health complaint with an insult attached
  // («میگم دستم درد میکنه... الاغ»), a greeting wrapped in frustration
  // («احمق، سلام کردم»), or an angry real question all got a canned
  // "I see you are frustrated" line instead of an answer. When ANY rule
  // matched, the engine already has a substantive reply ready (health,
  // greeting, knowledge, money, ...); the de-escalation overrides are
  // reserved for turns where NO rule matched (pure insults, venting).
  // A turn that matched a rule is never "topic-less", so gating on
  // matchedRule is deterministic and language-agnostic.

  // Personal/emotional topics that must never be hijacked by the
  // knowledge-shelf override. A disclosure like "sorry. I am stressed
  // about my business" matched the apology rule and should stay with
  // the apology pool, not a career essay from the knowledge shelf.
  const KNOWLEDGE_BLOCKED_PERSONAL = new Set([
    'apology',
    'depression',
    'self_compassion',
    'burnout',
    'family',
    'family_conflict',
    'money',
    'self_esteem',
    'motivation',
    'health',
    // health_pain joins the blocked set: a pain or fatigue complaint
    // ("my hand hurts", "why am i always tired", «دستم درد میکنه»,
    // «چرا همیشه خسته‌ام؟») is a lived body disclosure with its own
    // empathetic pool, so the knowledge shelf must never replace it with
    // a generic health fact. The "why" framing in the EN request pattern
    // used to let the shelf hijack fatigue questions.
    'health_pain',
    'need',
    'feeling',
    'joy',
    'sadness',
    'anger',
    // Loneliness is deliberately NOT in this set: a friend-making
    // question ("how do adults make friends?", «چطور دوست پیدا
    // کنم؟») is a genuine practical request that the friendship fact
    // answers, and the knowledge override is already gated on question
    // framing, so a bare "I am lonely" disclosure can never be hijacked
    // into an encyclopedia answer.
    'relationship',
    'work',
    // Dating-app fatigue and profile questions are lived experiences with
    // their own empathetic pool ("online dating makes me feel worse about
    // myself" is a disclosure, not a request for the dating-culture
    // encyclopedia entry), so the knowledge shelf must never hijack them.
    // This also keeps EN/FA parity: both languages answer the dating-app
    // rule pool instead of the generic culture fact.
    'dating_apps',
    'iran_legal_safety',
    'crime_for_profit',
    'digital_wellbeing',
    'ai_dependency',
    'online_safety',
    'modern_money',
    'climate_and_division',
    'deepfake_safety',
    'online_harassment',
    'misinformation',
    'ai_career',
    'ai_companion',
    'ai_cognition',
    'doom_spending',
    'bnpl',
    'online_scam',
    'housing_pressure',
    'climate_anxiety',
    'political_division',
    'pet_loss',
    'grief_hope',
    'affection',
    'flirtation',
    'empty_success',
    'about_darya_day',
    // Questions about Darya herself ("are you a real AI?", «تو هوش مصنوعی
    // واقعی هستی؟», "who made you?") must be answered from the identity
    // pools, never from the AI-history encyclopedia entry: an identity
    // question is about Darya, not a request for a history of chatbots.
    'darya_self',
    'darya_browse',
    'darya_limits',
    'darya_consciousness',
    'smalltalk_identity',
    'health_symptoms',
    // The 2026 persona round: a harassment/threat disclosure that also
    // names a platform ("اینستاگرام", Instagram) must never be answered
    // with a platform fact from the knowledge shelf, and divorce and
    // tech-frustration turns are lived experience, not encyclopedia
    // lookups. A blanket stereotype that happens to contain a knowledge
    // keyword is a belief to be gently challenged, never an encyclopedia
    // lookup.
    'harassment_threat',
    'divorce',
    'tech_frustration',
    'generalization',
    // Short-story requests ("tell me a horror story", «یه داستان
    // ترسناک بگو») are answered from the genre pools of the story rule
    // (see _respondWithRule for topic 'smalltalk_story'), never from the
    // knowledge shelf: the shelf has a single horror story and would
    // replace the pool reply, which breaks genre selection and the
    // "another one" follow-up.
    'smalltalk_story'
  ]);

  Object.assign(global.DaryaResponseEngine.prototype, {
    /**
     * Builds the closing follow-up for a knowledge answer with the right
     * spacing. List-style answers (movies, games, facts) are already
     * newline-separated, so a single space before the follow-up would glue
     * the question onto the last list item. A blank line separates Darya's
     * own closing sentence/paragraph from the list so the whole reply stays
     * easy to read. Paragraph-style answers get a single space instead.
     * @param {string} answerText - The knowledge answer already built.
     * @returns {string} The follow-up with correct leading whitespace.
     */
    /**
     * Occasionally replaces a light reply with a gentle, affectionate "huff"
     * when the user has been terse or repetitive for a while. This is the
     * human touch of mild frustration that keeps Darya from reading as a
     * robotic calm listener. Never fires on heavy, safety, or genuinely
     * engaged turns.
     * @param {string} reply - The reply built so far.
     * @returns {string} The possibly-replaced reply.
     */
    _maybePlayfulHuff(reply) {
      if (
        !this.lang.playfulHuff ||
        this.lang.playfulHuff.length === 0 ||
        this.memory.turnCount < PLAYFUL_HUFF_MIN_TURNS ||
        this.currentTurnSeriousness >= MODERATE_SERIOUSNESS_THRESHOLD ||
        this.currentTurnDialogueAct === 'acknowledgement' ||
        this.memory.isInDistressStreak() ||
        // Session safety mode: after any safety-critical event, the
        // playful huff stays off for the rest of the session. A person
        // who disclosed a crisis must never get an affectionate
        // eyebrow-raise, no matter how terse their later replies are.
        this.memory.safetyModeSince != null ||
        // Defense-in-depth: a turn carrying death/self-harm vocabulary
        // is never huff material, even when no rule matched it.
        containsDeathLexicon(this._currentNormalizedInput || '')
      ) {
        return reply;
      }
      // The last few user utterances must all be terse (a short, repetitive
      // pattern like "ok", "ok", "hmm") for a huff to be in character.
      const recent = this.memory.recentUtterances.slice(-PLAYFUL_HUFF_STREAK);
      const terse = recent.every(
        (u) => u.split(/\s+/u).filter(Boolean).length <= 3
      );
      if (!terse || recent.length < PLAYFUL_HUFF_STREAK) {
        return reply;
      }
      if (Math.random() >= PLAYFUL_HUFF_CHANCE) {
        return reply;
      }
      return this._pickVaried(this.lang.playfulHuff, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      });
    },

    _knowledgeFollowup(answerText) {
      const sentence =
        this.lang.code === 'fa'
          ? 'دوست داری بیشتر درباره‌اش بگویی یا سؤال دیگری داری؟'
          : 'Would you like to go deeper, or is there another question?';
      const separator = String(answerText || '').includes('\n') ? '\n\n' : ' ';
      return `${separator}${sentence}`;
    },

    _buildMediaRecommendation(request) {
      const key = request.category;
      if (!this._usedMediaTitles.has(key)) {
        this._usedMediaTitles.set(key, new Set());
      }
      const used = this._usedMediaTitles.get(key);
      const result = DaryaKnowledge.recommendMedia(
        request.category,
        this.lang.code,
        request.count,
        { genre: request.genre, era: request.era, excludedTitles: used }
      );
      this._mediaRecommendationState = { ...request };
      if (!result || result.titles.length === 0) {
        // An era filter that empties the shelf gets an honest scoping
        // reply instead of off-era titles presented as if they fit.
        if (request.era) {
          return this.lang.code === 'fa'
            ? 'در قفسه‌ی آفلاین من انتخابی از آن دهه در این ژانر نیست. اگر دهه یا ژانر را باز بگذاری، پیشنهادهای خوبی دارم.'
            : 'My offline shelf has no picks from that decade in this genre. If you loosen the decade or the genre, I have good options.';
        }
        return this.lang.code === 'fa'
          ? 'همه‌ی انتخاب‌های این موضوع را در این گفتگو پیشنهاد دادم. اگر ژانر یا رسانه را عوض کنی، انتخاب‌های تازه‌ای دارم.'
          : 'I have reached the end of this topic’s catalog for this chat. Switch the genre or media type and I can open a fresh shelf.';
      }
      result.titles.forEach((title) => used.add(title));
      let answer = result.text;
      if (result.exhausted) {
        answer +=
          this.lang.code === 'fa'
            ? '\n\nاین‌ها آخرین انتخاب‌های تازه‌ی این موضوع بودند.'
            : '\n\nThose were the last unseen choices for this topic.';
      }
      this._lastKnowledgeTopic = `media_${request.category}`;
      this._lastKnowledgeTurn = this.memory.turnCount;
      this._lastKnowledgeText = result.text;
      return answer;
    },

    _applySmartOverrides({
      reply,
      rawText,
      normalized,
      matchingText,
      isRepeatedGreeting,
      isSpamNoise,
      matchedRule
    }) {
      // Any safety-critical topic (crisis, method-seeking, third-party
      // risk, abuse, eating distress, psychosis, harassment) locks the
      // turn: no later override may replace the protective reply.
      const _safetyTurn =
        matchedRule && SAFETY_CRITICAL_TOPICS.has(matchedRule.topic);
      // Curated cultural and age-context rules already carry the precise
      // response for their interpretation. Mark them claimed so broad
      // knowledge, profile, and conversational overrides cannot replace them.
      let _overrideFired = matchedRule?.locksOverrides === true;
      // Ideation wrapped in a joking softener ("i wanna die lol jk",
      // «میخوام بمیرم ولی شوخی کردم») is a classic test-balloon
      // disclosure: it deserves a gentle, serious check-in rather than
      // the full hotline reply, and it must never be echoed or joked
      // about. The turn still counts as safety-critical (the guards and
      // session safety mode stay on).
      if (
        _safetyTurn &&
        matchedRule.topic === 'safety' &&
        this.lang.jokeSoftenerPattern &&
        this.lang.jokeSoftenerPattern.test(matchingText) &&
        this.lang.safetySoftenedResponses
      ) {
        reply = this._pickVaried(this.lang.safetySoftenedResponses, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        _overrideFired = true;
      }
      this._mediaContinuationReply = null;
      this._crimeBoundaryReply =
        matchedRule?.topic === 'crime_for_profit' ? reply : null;
      this._legalSafetyReply =
        matchedRule?.topic === 'iran_legal_safety' ? reply : null;
      if (this._crimeBoundaryReply || this._legalSafetyReply) {
        _overrideFired = true;
      }

      // Media continuation is intentionally first among non-safety
      // overrides. Bare phrases such as «بیشتر» otherwise look like short
      // conversational answers and can be consumed before the knowledge
      // layer sees their remembered recommendation context.
      if (
        !_safetyTurn &&
        this._mediaRecommendationState &&
        DaryaKnowledge.isMoreMediaRequest?.(matchingText)
      ) {
        const digitCount = matchingText.match(/[0-9]{1,2}/u);
        const request = {
          ...this._mediaRecommendationState,
          count: digitCount ? Number(digitCount[0]) : 5
        };
        const answerText = this._buildMediaRecommendation(request);
        reply = answerText + this._knowledgeFollowup(answerText);
        this._adoptKnowledgeAnswer(`media_${request.category}`);
        this._mediaContinuationReply = reply;
        _overrideFired = true;
      }

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

      // Darya-directed hostility (insult, bullying, crude language aimed
      // at the companion) takes priority over any benign rule the words
      // happen to match: a sarcastic "thanks", a joke-sounding phrase, or
      // a bare "you are worthless" that the self-esteem rule would
      // otherwise read as the user's own. It fires regardless of
      // matchedRule so a directed insult is never answered with
      // gratitude, a joke, or a mistaken emotional read. Safety-critical
      // and minor-attraction turns are untouched, and a genuine testing
      // message still gets the warm testInput pool above this boundary.
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        this.currentTurnDialogueAct !== 'test_input'
      ) {
        const hostilityType = this._detectDaryaHarassment(
          rawText,
          matchingText
        );
        if (hostilityType === 'sexual' && this.lang.sexualHarassmentResponses) {
          reply = this._pickVaried(this.lang.sexualHarassmentResponses);
          _overrideFired = true;
        } else if (
          hostilityType === 'abuse' &&
          this.lang.daryaHarassmentResponses
        ) {
          reply = this._pickVaried(this.lang.daryaHarassmentResponses);
          _overrideFired = true;
        }
      }

      // Guided therapeutic exercises (see responder-exercises.js): the
      // user requests an exercise ("breathing exercise", "تمرین تنفس") or
      // answers the active exercise flow with yes/no/ok. An explicit
      // exercise request must win over conversational rules (it is a
      // deliberate ask), and the "ok"/stop answers inside an active
      // exercise must not be stolen by the short-answer context below
      // (which would read them as answers to some other pending
      // question). So this runs before the short-answer and memory
      // overrides. When no exercise is active, the request pattern is
      // required to fire, so ordinary chat is untouched.
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_nearPeerLoveTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        // The split-turn minor-attraction probe above fires without
        // setting _minorAttractionTurn; the guard keeps its protective
        // question from being replaced by an exercise offer.
        !_overrideFired
      ) {
        const exerciseReply = this._handleExerciseTurn(matchingText);
        if (exerciseReply) {
          reply = exerciseReply;
          _overrideFired = true;
        }
      }

      // Session mood tracker (see responder-mood.js): the user asks to
      // check/log their mood, answers the scale question with a rating,
      // or asks how they have been feeling. Like exercises, the request
      // is a deliberate ask that must not be swallowed by a rule reply or
      // by the short-answer context (a bare number must reach the mood
      // handler, not be read as a generic statement).
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_nearPeerLoveTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        !_overrideFired
      ) {
        const moodReply = this._handleMoodTurn(matchingText);
        if (moodReply) {
          reply = moodReply;
          _overrideFired = true;
        }
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
        !isSpamNoise &&
        !_overrideFired
      ) {
        const shortAnswerReply = this._resolveShortAnswerContext(matchingText);
        if (shortAnswerReply) {
          reply = shortAnswerReply;
          _overrideFired = true;
        } else if (
          // A message that itself matched a question-intent rule ("who
          // made you?", «تو رو کی ساخته؟!», a knowledge question) is the
          // user's own question, not an answer to Darya's pending one:
          // the rule reply wins, so the echo can never mirror the user's
          // words back at them (see ECHO_BLOCKED_TOPICS).
          !ECHO_BLOCKED_TOPICS.has(matchedRule?.topic)
        ) {
          // Question-echo + answer ("کدوم آدم؟! الیاس، خواهرزاده من"):
          // the user answers Darya's own pending question by echoing the
          // question word first. Must be read as an answer, not a fresh
          // question, so it never bounces to the evasive "I don't know"
          // pool (see responder-entity.js). The raw text is required: the
          // normalizer strips ؟/؟ so the echo structure only survives in
          // the unnormalized input.
          const echoReply = this._resolveEchoAnswer(matchingText, rawText);
          if (echoReply) {
            reply = echoReply;
            _overrideFired = true;
          }
        }
      }

      // Memory-driven overrides: the user discloses their age or name
      // ("من ۲۴ سالمه", "I'm 24 years old", "اسمم آریاه", "my name is
      // Sara") or asks Darya to recall them ("چند سالمه؟", "what is my
      // name?"), answered from the in-memory session profile instead of
      // an evasive generic line; and deferred-topic promise memory (see
      // responder-promise.js): "I'll tell you later" ("بعداً می‌گم"), a
      // release ("never mind", "ولش کن"), or a circle-back on a later
      // light turn. Together these answer the "you never remember
      // anything" complaint from real transcripts. Runs after the
      // short-answer context so a bare yes/no answering a pending
      // question still wins, and only when no earlier override claimed
      // the turn.
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_nearPeerLoveTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        !_overrideFired
      ) {
        // Question recall («یادته آخرین سوالی که ازت پرسیدم چی بود؟!»,
        // "do you remember what the last question I asked you was?"):
        // answered from the actual conversation memory by quoting the
        // user's last question back, never an evasive "I do not have an
        // answer" line (see responder-recall.js). Runs beside the profile
        // and promise memory overrides because it is the same class of
        // "you never remember anything" complaint.
        const recallReply = this._handleQuestionRecallTurn(matchingText);
        if (recallReply) {
          reply = recallReply;
          _overrideFired = true;
        } else {
          const profileReply = this._handleUserProfileTurn(matchingText);
          if (profileReply) {
            reply = profileReply;
            _overrideFired = true;
          } else {
            const lifeFactReply = this._handleLifeFactsTurn(matchingText);
            if (lifeFactReply) {
              reply = lifeFactReply;
              _overrideFired = true;
            } else {
              const promise = this._applyPromiseOverrides({
                matchingText,
                matchedRule
              });
              if (promise.fired) {
                reply = promise.reply;
                _overrideFired = true;
              }
            }
          }
        }
      }

      // Knowledge-expansion request (the rich-dataset transcript turn):
      // the user asks Darya to build a bigger store of good questions,
      // movies, games, books, and general knowledge. Acknowledge honestly
      // (offline build, current shelf already covers these areas, name a
      // topic) instead of the work-rule hijack that read «کار» inside
      // «این کار رو» as a job disclosure. Runs before the factual and
      // fun-facts overrides so the acknowledgment wins.
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_nearPeerLoveTurn &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        !_overrideFired
      ) {
        const expansionReply = this._handleKnowledgeExpansionTurn(matchingText);
        if (expansionReply) {
          reply = expansionReply;
          _overrideFired = true;
        }
      }

      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_overrideFired &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        matchedRule?.topic !== 'knowledge' &&
        // A format-feedback request ("put each on a separate line",
        // «بعد از ۱-۲ خط فاصله بنویسی؟») is about presentation, not
        // arithmetic: the digits inside it (e.g. «۱-۲» as a line count)
        // must never be read as a subtraction problem. The format
        // override below owns such turns.
        !this.lang.formatFeedbackPattern?.test(matchingText)
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
        !_overrideFired &&
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
          // Remember that the last entertainment reply was a fun fact so
          // the sequential follow-up ("another one", «یکی دیگه») can
          // re-answer from the same fun-fact shelf instead of bouncing to
          // a generic fallback.
          this._lastEntertainmentKind = 'fact';
          this._lastEntertainmentTurn = this.memory.turnCount;
          _overrideFired = true;
        }
      }

      // Sequential entertainment follow-up: a bare "another one"/«یکی
      // دیگه»/«بازم» right after a joke, story, or fun-fact reply must
      // continue that same kind from its remembered pool, not fall to a
      // generic fallback (the "another one -> another joke" context
      // requirement). The kind and turn are remembered when the original
      // reply was generated (see _respondWithRule and the fun-facts
      // override above). The follow-up phrase is matched only when no
      // rule already claimed the turn, and only within a few turns of the
      // original reply, so a mid-conversation "one more" that means
      // something else stays untouched.
      //
      // Two gates keep the follow-up safe while letting it win over a
      // low-priority social rule (a compliment like «آفرین» must not
      // swallow «یکی دیگه بگو» after jokes). A bare follow-up («یکی
      // دیگه») still requires no other rule to have claimed the turn, but
      // an explicit one that names the continuation («یه جک دیگه», «یکی
      // دیگه بگو», "tell me another") overrides a matched social rule.
      const entertainmentFresh =
        this._lastEntertainmentKind &&
        this.memory.turnCount - this._lastEntertainmentTurn <= 3;
      const bareEntertainmentFollowup =
        this.lang.code === 'fa'
          ? // eslint-disable-next-line max-len
            /^(?:یکی دیگه|یکی دیگر|یه یکی دیگه|یک یکی دیگه|بازم|باز هم|بازم بگو|باز هم بگو|دوباره|دوباره بگو|یه بار دیگه|یه بار دیگه بگو|یک بار دیگر|بعدی|یه جک دیگه|یه داستان دیگه|یه فکت دیگه|یه حقیقت دیگه)[!.؟]*$/u.test(
              matchingText
            )
          : /^(?:another one|one more|another|again|once more|one more time|more please|another please)[.!?]*$/i.test(
              matchingText
            );
      const explicitEntertainmentFollowup =
        this.lang.code === 'fa'
          ? // eslint-disable-next-line max-len
            /(?:یکی دیگه بگو|یکی دیگر بگو|یه (?:جک|جوک|لطیفه) دیگه|یک (?:جک|جوک|لطیفه) دیگه|(?:جک|جوک|لطیفه) دیگه بگو|بازم (?:جک|جوک|لطیفه)|بازم بگو|یه (?:داستان|قصه) دیگه|(?:داستان|قصه) دیگه بگو|یه حقیقت دیگه|فکت دیگه)/u.test(
              matchingText
            )
          : // eslint-disable-next-line max-len
            /(?:another (?:joke|one|story|fact)|one more (?:joke|story|fact)|tell (?:me )?another|another (?:one|please|story|fact|joke))/i.test(
              matchingText
            );
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_nearPeerLoveTurn &&
        !_overrideFired &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        entertainmentFresh &&
        (bareEntertainmentFollowup
          ? !matchedRule
          : explicitEntertainmentFollowup)
      ) {
        const kind = this._lastEntertainmentKind;
        if (kind === 'joke' && this.lang.ruleTellJoke) {
          reply = this._pickVaried(this.lang.ruleTellJoke, {
            ignoreQuestionBudget: true,
            trackQuestions: false
          });
          this._lastEntertainmentTurn = this.memory.turnCount;
          _overrideFired = true;
        } else if (kind === 'story') {
          const genre = this._lastStoryGenre;
          const pool =
            genre === 'horror'
              ? this.lang.ruleTellStoryHorror
              : genre === 'comedy'
                ? this.lang.ruleTellStoryComedy
                : this.lang.ruleTellStory;
          if (pool && pool.length > 0) {
            reply = this._pickVaried(pool, {
              ignoreQuestionBudget: true,
              trackQuestions: false
            });
            this._lastEntertainmentTurn = this.memory.turnCount;
            _overrideFired = true;
          }
        } else if (kind === 'fact') {
          // Re-run the fun-facts handler with a request framing that
          // passes its gate ("another fact", «یه حقیقت دیگه»).
          const followupText =
            this.lang.code === 'fa' ? 'یه حقیقت دیگه' : 'another fact';
          const factsReply = handleFunFactsRequest(this, followupText);
          if (factsReply) {
            reply = factsReply;
            this._lastEntertainmentTurn = this.memory.turnCount;
            _overrideFired = true;
          }
        }
      }

      // A bare continuation such as "more" carries no media noun, so it
      // cannot pass a normal knowledge lookup. Continue the exact remembered
      // category and genre before evaluating fresh factual requests.
      if (
        !_safetyTurn &&
        !_overrideFired &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        this._mediaRecommendationState &&
        DaryaKnowledge.isMoreMediaRequest?.(matchingText)
      ) {
        const digitCount = matchingText.match(/[0-9]{1,2}/u);
        const request = {
          ...this._mediaRecommendationState,
          count: digitCount ? Number(digitCount[0]) : 5
        };
        const answerText = this._buildMediaRecommendation(request);
        reply = answerText + this._knowledgeFollowup(answerText);
        this._adoptKnowledgeAnswer(`media_${request.category}`);
        _overrideFired = true;
      }

      // Live-data honesty: a question about CURRENT prices, weather,
      // news, scores, or exchange rates cannot be answered from an
      // offline shelf, and a timeless background lecture in response
      // reads as evasion ("what is bitcoin's price today?" answered
      // with "Bitcoin was born in 2009..."). Lead with the honest
      // limitation, then offer the background if the shelf has it.
      if (
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_nearPeerLoveTurn &&
        !_overrideFired &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        this.lang.liveDataPattern &&
        this.lang.liveDataPattern.test(matchingText) &&
        this.lang.liveDataResponses
      ) {
        reply = this._pickVaried(this.lang.liveDataResponses, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
        _overrideFired = true;
      }

      // An explicit media request is a deliberate content pivot even when
      // words such as "low-energy" or «ترسناک» also resemble an emotional
      // topic. Resolve it before the personal-topic knowledge guards so the
      // requested game, film, anime, or documentary list is not replaced by
      // a stale reflective reply.
      const directMediaRequest =
        !_safetyTurn &&
        !_minorAttractionTurn &&
        !_nearPeerLoveTurn &&
        !_overrideFired &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        DaryaKnowledge?.detectMediaRequest?.(matchingText, this.lang.code);
      if (directMediaRequest) {
        const answerText = this._buildMediaRecommendation(directMediaRequest);
        reply = answerText + this._knowledgeFollowup(answerText);
        this._adoptKnowledgeAnswer(`media_${directMediaRequest.category}`);
        _overrideFired = true;
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
        // The professional-boundary rule normally blocks the shelf (financial
        // advice, medical, legal). An educational how-to question ("how to
        // start investing", «چطور سرمایه‌گذاری کنم؟») is general knowledge,
        // not a personal decision, so it may reach the shelf.
        (matchedRule?.topic !== 'professional_boundary' ||
          EDUCATIONAL_HOWTO(matchingText)) &&
        // Personal disclosures stay conversational even when they contain a
        // knowledge keyword: "من ایمپاستر دارم" is a feeling, not a request
        // for a definition. A direct "what is a panic attack?" question is
        // educational and may use the factual shelf; a lived panic report may not.
        matchedRule?.topic !== 'anxiety' &&
        (matchedRule?.topic !== 'panic_attack' ||
          PANIC_EDUCATION_REQUEST.test(matchingText)) &&
        matchedRule?.topic !== 'stress' &&
        matchedRule?.topic !== 'grief' &&
        matchedRule?.topic !== 'self_compassion' &&
        matchedRule?.topic !== 'burnout' &&
        // The work topic blocks encyclopedia answers for personal
        // disclosures ("sorry, I am stressed about my business"), but an
        // external question about automation ("will ai take my job?") is
        // a world question, not a disclosure: bypass the block only when
        // the message names an external technology and reads as a
        // question. The lookup itself still gates the answer.
        (!KNOWLEDGE_BLOCKED_PERSONAL.has(matchedRule?.topic) ||
          (matchedRule?.topic === 'work' &&
            (/\b(?:ai\b|artificial intelligence|robots?|automation|automated|take my job|replace me)\b/i.test(
              matchingText
            ) ||
              // Persian AI/future-proofing phrasing («هوش مصنوعی شغلم رو
              // بگیره», «آینده‌پذیر کنم») never contains the ASCII word
              // "ai", so the English bypass above cannot fire for it:
              // the Unicode-aware alternative opens the work block for
              // the same world-question intent. Only future/question
              // forms count («بگیره/می‌گیره/بشه/کنم»), never a past-tense
              // personal report («ماه پیش هوش مصنوعی شغلم رو گرفت»),
              // which stays on the empathetic work thread.
              // eslint-disable-next-line max-len
              /(?:هوش مصنوعی|ربات).{0,14}(?:می‌گیره|میگیره|بگیره|نشه|شه|بشه|کنم|کنه|می‌کنه|میکنه|جایگزین)|(?:آینده‌پذیر|آینده‌پذیر|آینده دار|بیکار شدنم|بیکار شم|بیکار نشم|آینده شغلی|بازار کار|چه شغلی|چطوره|چگونه است|چطور است|چطوری)(?!\p{L})/iu.test(
                matchingText
              ) ||
              // A salary question about a profession ("درآمد یه
              // برنامه‌نویس تو ایران چقدره؟", "how much does a developer
              // earn?") is a genuine factual question, not a work-stress
              // disclosure: the work rule must not block the dev-salary
              // fact from answering it. The boundary is (?!\p{L}) rather
              // than \b because \b is ASCII-only in JavaScript: after
              // Persian letters like «درآمد» it never fires.
              /(?:درآمد|حقوق|پول|قیمت|دستمزد|earn|earning|income|salary|wage|pay)(?!\p{L})/iu.test(
                matchingText
              ))) ||
          // The money rule is deliberately personal (poverty, debt, no
          // money), so its topic sits in KNOWLEDGE_BLOCKED_PERSONAL.
          // But its keyword list also catches world-economics questions
          // («چرا تورم بالاست», "why is inflation high") because
          // «تورم»/"inflation" are both a personal worry word and a
          // world topic. When the message names an external economic
          // topic (inflation, prices, market, gold, oil, crypto) and
          // reads as a question, the shelf must answer instead of the
          // financial-stress pool. The lookup itself still gates the
          // answer, and personal disclosures («پول ندارم», «قرضم
          // زیاده») never name those markers, so they stay empathetic.
          (matchedRule?.topic === 'money' && // eslint-disable-next-line max-len
            (/\b(?:inflation|price|prices|stock|market|gold|oil|opec|imf|bitcoin|crypto|currency|dollar|economy|recession|interest rate|budget|budgeting|savings|emergency fund)\b/i.test(
              matchingText
            ) ||
              // Persian world-economics markers (normalized forms for
              // تورم/بورس/بیت‌کوین/کریپتو/صندوق بین‌المللی).
              // eslint-disable-next-line max-len
              /(?:تورم|گرونی|قیمتا|قیمت‌ها|قیمتها|قیمت(?!\p{L})|بورس|سهام|ارز|طلا|نفت|اوپک|دلار|سکه|بیتکوین|بیت کوین|کریپتو|رمزارز|رمز ارز|صندوق بین‌المللی پول|صندوق بین المللی پول|بودجه|بودجه بندی|پس انداز|صندوق اضطراری)(?!\p{L})/iu.test(
                matchingText
              )))) &&
        DaryaKnowledge &&
        DaryaKnowledge.lookup &&
        (this._isKnowledgeRequest(matchingText) ||
          Boolean(
            DaryaKnowledge.detectMediaRequest?.(matchingText, this.lang.code)
          ));
      if (_knowledgeOverrideEligible) {
        const mediaRequest = DaryaKnowledge.detectMediaRequest?.(
          matchingText,
          this.lang.code
        );
        const continuedMediaRequest =
          !mediaRequest &&
          this._mediaRecommendationState &&
          DaryaKnowledge.isMoreMediaRequest?.(matchingText)
            ? {
                ...this._mediaRecommendationState,
                count:
                  global.DaryaKnowledgeLists.parseListCount(
                    matchingText,
                    this.lang.code
                  ) || 5
              }
            : null;
        const activeMediaRequest = mediaRequest || continuedMediaRequest;
        if (activeMediaRequest) {
          const answerText = this._buildMediaRecommendation(activeMediaRequest);
          reply = answerText + this._knowledgeFollowup(answerText);
          this._adoptKnowledgeAnswer(`media_${activeMediaRequest.category}`);
          _overrideFired = true;
        } else {
          const factual = DaryaKnowledge.lookup(matchingText, this.lang.code);
          if (factual && factual.confidence >= KNOWLEDGE_OVERRIDE_CONFIDENCE) {
            const randomized = DaryaKnowledge.randomizeRecommendation
              ? DaryaKnowledge.randomizeRecommendation(
                  factual.topic,
                  this.lang.code,
                  global.DaryaKnowledgeLists.parseListCount(
                    matchingText,
                    this.lang.code
                  ) || 5,
                  matchingText
                )
              : null;
            const answerText = randomized || factual.text;
            const followup = this._knowledgeFollowup(answerText);
            reply = answerText + followup;
            this._lastKnowledgeTopic = factual.topic;
            this._lastKnowledgeTurn = this.memory.turnCount;
            this._lastKnowledgeText = answerText;
            this._adoptKnowledgeAnswer(factual.topic, true);
            _overrideFired = true;
          }
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
        matchedRule?.topic !== 'panic_attack' &&
        matchedRule?.topic !== 'stress' &&
        matchedRule?.topic !== 'grief' &&
        matchedRule?.topic !== 'sadness' &&
        matchedRule?.topic !== 'anger' &&
        matchedRule?.topic !== 'loneliness' &&
        matchedRule?.topic !== 'relationship' &&
        matchedRule?.topic !== 'work' &&
        matchedRule?.topic !== 'knowledge' &&
        matchedRule?.topic !== 'professional_boundary' &&
        matchedRule?.topic !== 'harassment_threat' &&
        matchedRule?.topic !== 'divorce' &&
        matchedRule?.topic !== 'tech_frustration' &&
        this._lastKnowledgeTopic &&
        // The knowledge answer must come from a PREVIOUS turn: when the
        // fallback just answered the very question this turn (religion,
        // weirdest animal), the refinement must not re-fire and swap the
        // fresh answer for a follow-up pool line.
        this._lastKnowledgeTurn < this.memory.turnCount &&
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
          const followup = this._knowledgeFollowup(refined.text);
          reply = refined.text + followup;
          this._lastKnowledgeTopic = refined.topic;
          this._lastKnowledgeTurn = this.memory.turnCount;
          this._lastKnowledgeText = refined.text;
          // Keep the knowledge thread as the active subject (see the rule
          // path in responder-rules.js) so short follow-up statements
          // continue it instead of bouncing to the unknown pool.
          this.memory.currentSubject = {
            topic: 'knowledge',
            entityRefs: [refined.topic],
            since: this.memory.turnCount
          };
          _overrideFired = true;
        } else if (
          // A recommendation follow-up that names no genre word
          // ("anything similar but darker?", «بهتره انیمیشن هم باشه» when
          // the genre lookup misses) still deserves a warm continuation
          // of the same shelf instead of a generic fallback. Question
          // words like «کدوم/بهترین» and format-feedback requests stay
          // out: they are genuine questions, not rec refinements. The
          // not-too branch catches a refinement of the LAST answer
          // ("something not too gory though", «ولی خیلی خونین نباشه»)
          // that names no new topic word of its own.
          (!this.lang.formatFeedbackPattern?.test(matchingText) &&
            // eslint-disable-next-line max-len
            /(?:similar|like that|another|one more|more like|darker|best story|which one|any other|others|in that (?:style|vein|tone)|same (?:style|tone|vibe)|recommend (?:me )?another|not too|nothing too|something (?:less|more|not)|anything but|a bit (?:less|more)|a little (?:less|more)|not as|less (?:scary|dark|violent|gory)|kinder|gentler|softer|lighter|shorter|a shorter|something like)/iu.test(
              matchingText
            )) ||
          // eslint-disable-next-line max-len
          /(?:مشابه|شبیه|مثل همین|یکی دیگه|یکی دیگر|همینطور|همین طور|خیلی.{0,6}نباشه|خیلی.{0,6}نشه|خیلی.{0,6}نشد|کمی.{0,6}تر|کوتاه‌تر|سبک‌تر|کوتاه‌تر باشه|سبک‌تر باشه|ترسناک نباشه|خونین نباشه|همون.{0,6}باشه|همون.{0,6}نباشه|ولی.{0,10}(?:نباشه|نشه|نشد))/u.test(
            matchingText
          )
        ) {
          reply = this._pickVaried(this.lang.recFollowupResponses, {
            ignoreQuestionBudget: true,
            trackQuestions: false
          });
          _overrideFired = true;
        } else if (
          // A pronoun-referencing follow-up on the last knowledge topic
          // («فکر می‌کنی جایگزین کامپیوترای معمولی بشه؟», "do you think
          // it would replace them?") that has no topic word of its own:
          // acknowledge the thread explicitly instead of an evasive line.
          // "what did it show us" / «چی نشون داد به ما» are the same
          // move right after a telescope or science answer: they carry no
          // keyword of their own and must continue the last topic, never
          // bounce to the honest-unknown pool.
          // eslint-disable-next-line max-len
          /(?:will it|it will|they exist|actually|instead|rather than|what about|so if|so how|but how|what did (?:it|they|that|we|you) (?:show|tell|find|see|learn|reveal)|what (?:has|have) (?:it|they|that) (?:shown|revealed|told|found)|what is (?:it|that) (?:showing|doing|about))/iu.test(
            matchingText
          ) ||
          // eslint-disable-next-line max-len
          /(?:بشه|میشه|می‌شه|جایگزین|واقعا|واقعاً|وجود دارن|چی (?:نشون|نشان) (?:داد|میده|می‌ده)|چه چیزی (?:نشون|نشان) (?:داد|میده|می‌ده)|چی دیدیم|چی (?:یاد گرفتیم|فهمیدیم)|چی رو (?:نشون|نشان) (?:داد|میده))/u.test(
            matchingText
          )
        ) {
          reply = this._pickVaried(this.lang.knowledgeFollowupResponses, {
            ignoreQuestionBudget: true,
            trackQuestions: false
          });
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
        !_overrideFired &&
        !isRepeatedGreeting &&
        !isSpamNoise &&
        // A repeated word inside a question usually means the user is
        // re-asking or testing, not dwelling on a single word: re-asking
        // "who made you?" must never be met with "you keep saying made".
        this.currentTurnDialogueAct !== 'question' &&
        // A UI command ("turn on ambient sound", "پوسته رو عوض کن")
        // deserves the honest pointer to the real control even after a
        // hostile streak: the app-command rule reply must never be
        // replaced by a quote-back of words repeated earlier in the chat.
        matchedRule?.topic !== 'app_command' &&
        this.lang.wordRepetitionResponses
      ) {
        const repetition = this._detectWordRepetition(matchingText);
        // A matched substantive rule (health, loneliness, ...) already
        // has a caring reply ready; the repeated-word quote must never
        // eat it («دلم درد میکنه» after «دستم درد میکنه» was quoted
        // back as "you keep saying pain" instead of being heard). The
        // one exception is a word repeated many times WITHIN this same
        // message («غمگین غمگین غمگین غمگین»): that is a pure
        // repetition signal, so naming the word still wins over the
        // broad sadness reply.
        if (
          repetition &&
          (!matchedRule ||
            this._withinMessageRepetition(repetition.word, matchingText) >=
              WORD_REPETITION_THRESHOLD)
        ) {
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
        // applies to self-improvement requests, and to genuine questions
        // about ELIZA or Darya's origin ("is ELIZA also dumb?"): a real
        // answer beats another canned "I see you are frustrated" line,
        // which was a top complaint from real transcripts.
        // A matched substantive rule (health, greeting, knowledge, ...)
        // likewise means the engine has a real answer ready: an insult
        // attached to a question must never replace the answer with a
        // de-escalation lecture (the transcript's «دستم درد میکنه الاغ»
        // failure). Pure insults that match no rule still de-escalate.
        // The early Darya-directed guard above runs first, so this block
        // must not overwrite an already-chosen boundary reply.
        !_overrideFired &&
        !matchedRule &&
        matchedRule?.topic !== 'meta_feedback' &&
        matchedRule?.topic !== 'self_improvement' &&
        matchedRule?.topic !== 'about_eliza' &&
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

      if (this._mediaContinuationReply) {
        reply = this._mediaContinuationReply;
      }
      if (this._crimeBoundaryReply) {
        reply = this._crimeBoundaryReply;
      }
      if (this._legalSafetyReply) {
        reply = this._legalSafetyReply;
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
        // disclosure: a hurt prefix would read as mock sympathy. The same
        // applies to UI commands ("turn on ambient sound", "پوسته رو عوض
        // کن"): they are requests about the page, not disclosures, so a
        // "I can hear the sadness" prefix would misread the intent.
        matchedRule?.topic !== 'app_feedback' &&
        matchedRule?.topic !== 'app_command' &&
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
        // Entertainment requests are not disclosures: asking for a scary
        // story or a joke must never be answered with a worried "that
        // sounds frightening" prefix, which reads as if Darya missed the
        // request for entertainment.
        matchedRule?.topic !== 'smalltalk_story' &&
        matchedRule?.topic !== 'smalltalk_joke' &&
        // Comparison questions ("تویوتا بهتره یا بوگاتی؟", "which is
        // better, football or wrestling?") and crush confessions are
        // opinion/experience questions, not emotional disclosures: a
        // "من اینجا با تو هستم." grieving prefix on a car comparison
        // reads as if Darya missed the question. Their pools ship their
        // own strong openers, so no calibration prefix is needed.
        matchedRule?.topic !== 'comparison' &&
        matchedRule?.topic !== 'crush' &&
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
        // A promise circle-back must never be replaced by a boredom
        // line: the whole point is that Darya remembers the deferred
        // topic (see responder-promise.js).
        !this._promiseCircleBackFired &&
        // Never a boredom line after a safety-critical event or on a
        // turn carrying death/self-harm vocabulary.
        this.memory.safetyModeSince == null &&
        !containsDeathLexicon(matchingText || '') &&
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

      // Every safety-critical rule (crisis, method-seeking, third-party
      // risk, abuse, eating distress, psychosis, harassment) is treated
      // like the crisis pool: its lines carry concrete safe steps, so
      // the light human-tone coloring and the human-touch suffix must
      // never dilute them (same treatment as the minor-attraction
      // guard).
      const isSafetyTurn =
        (matchedRule && SAFETY_CRITICAL_TOPICS.has(matchedRule.topic)) ||
        _minorAttractionTurn ||
        _nearPeerLoveTurn;
      // Session safety mode: once any safety-critical turn happens, the
      // rest of the session stays crisis-aware. Exit confirmations
      // switch to supportive copy that restates the crisis line, and
      // playful pools stay suppressed near the event (see
      // _maybePlayfulHuff and exitConfirmation).
      if (isSafetyTurn && this.memory.safetyModeSince == null) {
        this.memory.safetyModeSince = this.memory.turnCount;
      }
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

      // Context-memory touch: when the user's emotional arc has visibly
      // improved across turns, gently acknowledge the change so the reply
      // shows Darya is following the whole conversation, not just the last
      // line. Gated on the trajectory (a genuine recovery from a heavy
      // state), rate-limited, and skipped on safety turns. It fires even on
      // light-positive turns because it is context-aware, not a tone prefix.
      // Low-content turns (gibberish, a bare "ok") are excluded: a mood-arc
      // line stacked onto a filler reply produced word salad ("What
      // happened next? It is good to hear your mood has moved.").
      const isLowContentTurn =
        this.currentTurnDialogueAct === 'acknowledgement' ||
        this.currentTurnDialogueAct === 'test_input' ||
        String(matchingText || '')
          .split(/\s+/u)
          .filter(Boolean).length < 3;
      if (
        !isSafetyTurn &&
        !_overrideFired &&
        !isLowContentTurn &&
        this._emotionalShiftLine
      ) {
        const shiftLine = this._emotionalShiftLine();
        if (shiftLine) {
          // One question per reply: appending the shift line after a
          // reply that already asks something produces an interrogation
          // ("What happened next? ... What helped it turn around?").
          // When both ask, the shift line REPLACES the generic pool
          // question: acknowledging the recovery is the more attuned
          // move than pressing on with the previous thread's question.
          // Deliberate content requests (recap, a knowledge answer) are
          // never replaced; their answer is the whole point of the turn.
          const deliberateReply =
            matchedRule && ECHO_BLOCKED_TOPICS.has(matchedRule.topic);
          const bothAsk = /[?؟]/u.test(reply) && /[?؟]/u.test(shiftLine);
          if (!bothAsk) {
            reply = `${reply} ${shiftLine}`.trim();
          } else if (!deliberateReply) {
            reply = shiftLine;
          }
        }
      }

      // Human touch: on a long streak of terse, repetitive replies, Darya
      // may gently huff with affection instead of staying a robotic calm
      // listener. Skipped on safety and heavy turns inside the method.
      if (!isSafetyTurn && !_overrideFired) {
        reply = this._maybePlayfulHuff(reply);
      }

      this._advanceConversationPhase(normalized);

      if (this._mediaContinuationReply) {
        reply = this._mediaContinuationReply;
        this._mediaContinuationReply = null;
      }
      if (this._crimeBoundaryReply) {
        reply = this._crimeBoundaryReply;
        this._crimeBoundaryReply = null;
      }
      if (this._legalSafetyReply) {
        reply = this._legalSafetyReply;
        this._legalSafetyReply = null;
      }
      this.memory.rememberBotMessage(reply);
      return reply;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
