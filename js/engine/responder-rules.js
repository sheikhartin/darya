/**
 * Darya - rule matching and response selection.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  var DaryaKnowledge = global.DaryaKnowledge;
  var buildRecap = global.DaryaRecap.buildRecap;

  const {
    MAX_CONSECUTIVE_SAME_RULE,
    QUOTED_CALLBACK_PROBABILITY,
    PRONOUN_REFLECTION_PROBABILITY,
    EXCERPT_MAX_LENGTH,
    SUBJECT_CONTINUATION_WINDOW,
    SUBJECT_CONTINUATION_MAX_REFRESHES,
    GENERIC_ADVICE_TOPICS,
    OPENER_SUBJECT_TOPICS,
    reflectPronouns,
    truncateExcerpt
  } = global.DaryaUtils;

  const { KNOWLEDGE_OVERRIDE_CONFIDENCE, SOURCE_SUGGESTION_CHANCE } =
    global.DaryaResponderShared;

  // Long rule captures are verb phrases, not noun subjects, and quoting
  // them back inside a follow-up template reads broken («خانوادم همش
  // مقایسه‌م می‌کنن» capturing «همش مقایسه‌م می‌کنن»).
  // Only captures up to this many words are safe to quote back; longer
  // ones fall through to the capture-free templates of the same pool.
  const CAPTURED_MAX_WORDS = 3;

  // Topics where a repeated disclosure is never a broken record and must
  // always be answered from the caring pool, never degraded to a fallback.
  // The same-rule streak guard exists to stop spam (repeated "ok" re-hitting
  // the how-are-you pool), but a person who keeps expressing despair, grief,
  // or pain across several turns is not spamming: they are stuck, and the
  // fallback reply ("let us return to the topic") is incoherent because they
  // never left the topic. Exempting these keeps the empathy present every
  // turn (health_pain is already exempted inline).
  const STREAK_EXEMPT_TOPICS = new Set([
    'depression',
    'safety',
    'grief',
    'grief_hope',
    'anxiety',
    'stress',
    'harassment_threat'
  ]);

  // Imperative request phrases ("tell me something interesting", «یه
  // چیزی جالب بگو», "name some youtubers", «چند تا یوتیوبر بگو»). These
  // are requests for content, not statements, so the pronoun reflection
  // must never echo them back ("So tell you something interesting" - the
  // EN transcript misfire). They still route to the fun-fact, knowledge,
  // or honest pools through their normal rules.
  const IMPERATIVE_REQUEST_PATTERN = new RegExp(
    '(?:tell me|show me|give me|name (?:some|a few|me)|share (?:something|some)|' +
      'recommend|suggest|explain (?:to me )?|describe (?:to me )?|list (?:some|a few)|' +
      'بگو|بگویید|بگید|به من بگو|بهم بگو|برام بگو|به‌م بگو|برام بنویس|یه.{0,4}(?:چیز|چیزی).{0,6}(?:بگو|جالب)|چیزی.{0,6}(?:بگو|جالب)|بگو.{0,10}(?:چیزی|چیز)|اسم.{0,8}(?:بگو|ببر)|پیشنهاد.{0,6}(?:بده|کن)|نام.{0,6}(?:ببر|بگو))',
    'iu'
  );

  /**
   * Copula (linking-verb) words that can wrap a captured subject phrase
   * when a rule's tail pattern (`\s*(.*)`) grabs the rest of the user's
   * sentence. «ولی بچه خواهرم هست» captures «هست خواهرزاده» (the copula
   * lands at the START of the fragment because it follows the matched
   * kinship word), and "my mom is the best" captures "is the best".
   * Echoing the copula back («درباره‌ی هست خواهرزاده») reads broken, so
   * leading and trailing copulas are stripped from the echoed subject.
   * Only the {captured} substitution is cleaned: knowledge lookups
   * consume the raw capture untouched.
   */
  const CAPTURED_COPULA_WORDS =
    'هست|هستم|هستی|هستیم|هستید|هستند|هستش|است|نیست|نیستم|' +
    'نیستی|نیستیم|نیستید|نیستند|is|are|was|were|am|be|been|being';
  // Leading and trailing alternatives share the same word list. The
  // \\s+ guards keep single-token captures safe: a bare capture like
  // «است» or "is" (already trimmed at the capture site) fails both
  // branches, so a user asking about the word itself is never erased.
  const CAPTURED_COPULA_RE = new RegExp(
    `^(?:${CAPTURED_COPULA_WORDS})\\s+|\\s+(?:${CAPTURED_COPULA_WORDS})$`,
    'iu'
  );

  /**
   * Removes leading and trailing copula words from a captured subject
   * phrase so an echoed fragment reads as a noun phrase, not as a verb
   * remnant. Loops because both ends can carry a copula (rare).
   * @param {string} value - The captured subject
   * @returns {string}
   */
  function trimCapturedCopulas(value) {
    let out = value;
    while (CAPTURED_COPULA_RE.test(out)) {
      out = out.replace(CAPTURED_COPULA_RE, ' ').trim();
    }
    return out;
  }

  Object.assign(global.DaryaResponseEngine.prototype, {
    _matchRules(normalizedText) {
      const matches = [];
      for (const currentRule of this.rules) {
        const match = currentRule.pattern.exec(normalizedText);
        if (!match) {
          continue;
        }

        let captured = '';
        for (let i = match.length - 1; i >= 1; i -= 1) {
          const group = match[i];
          if (group) {
            const candidate = group
              .trim()
              .replace(/^[.,،!؟\s]+|[.,،!؟\s]+$/g, '');
            if (
              candidate &&
              !this.lang.trivialCaptures.has(candidate.toLowerCase())
            ) {
              captured = candidate;
            }
            break;
          }
        }
        matches.push({ rule: currentRule, captured });
      }
      return matches;
    },

    _matchRule(normalizedText) {
      return (
        this._matchRules(normalizedText)[0] || { rule: null, captured: '' }
      );
    },

    _respondWithRule(matchedRule, captured) {
      // Generic advice rules (procrastination "چیکار کنم", what_do_i_do)
      // can hijack a FRESH, more specific thread: inside a dating-app
      // conversation, «هر شب یه ساعت اسکرول میکنم» is about the app, and
      // inside a pet thread, «چه کار کنم راحت‌تر بشه» is about the pet.
      // When such a generic rule fires while a recent subject with its
      // own follow-up questions is active, the subject continuation wins
      // so the thread never bounces to a generic line. With no active
      // subject the continuation returns null and the rule reply stands.
      // The friendship rule joins the guard: someone who just disclosed
      // new-city loneliness and then asks "How do adults make friends?"
      // is still inside the loneliness thread, so the subject
      // continuation keeps it there instead of switching topic labels.
      // updateSubject already kept the specific subject alive when this
      // generic rule fired (see ConversationMemory.updateSubject), so
      // the guard only needs to answer with the continuation and report
      // BOTH labels: the kept thread topic (the quality scenarios assert
      // loneliness continuity) and the matched rule topic (the passion
      // suites assert the friendship question itself routed).
      if (
        GENERIC_ADVICE_TOPICS.has(matchedRule.topic) &&
        this.memory.currentSubject &&
        this.memory.currentSubject.topic &&
        this.memory.currentSubject.topic !== matchedRule.topic &&
        this.memory.turnCount - this.memory.currentSubject.since <=
          SUBJECT_CONTINUATION_WINDOW
      ) {
        const continuation = this._subjectContinuationReply();
        if (continuation) {
          this.currentTurnTopics = [
            ...new Set([
              this.memory.currentSubject.topic,
              ...this.currentTurnTopics
            ])
          ];
          return continuation;
        }
      }
      if (matchedRule.topic === 'gratitude' && this.lang.gratitudeResponses) {
        return this._pickVaried(this.lang.gratitudeResponses);
      }
      // Fatigue phrasings («چرا همیشه خسته‌ام؟», the no-ZWNJ «چرا همیشه
      // خستهام» that normalizes to «خست هام», "why am i always tired",
      // "i am always exhausted") match the health_pain rule's fatigue
      // branch. They must be answered from the dedicated fatigue pool,
      // never the pain-only lines («دردت را می‌شنوم», "I hear your
      // pain"), so the reply names tiredness, not physical pain.
      const fatigueText = this._currentNormalizedInput || '';
      const isFatigueTurn =
        this.lang.code === 'fa'
          ? /(?:چرا|همیشه|همش).{0,12}(?:خسته|خست)/u.test(fatigueText)
          : // eslint-disable-next-line max-len
            /\b(?:always|so|really|constantly|this) (?:tired|exhausted)\b|(?:tired|exhausted) (?:all the time|these days|every day|always)\b/iu.test(
              fatigueText
            );
      if (
        matchedRule.topic === 'health_pain' &&
        this.lang.fatigueResponses &&
        isFatigueTurn
      ) {
        return this._pickVaried(this.lang.fatigueResponses);
      }
      if (
        matchedRule.topic === 'professional_boundary' &&
        this.lang.professionalBoundary
      ) {
        return this._pickVaried(this.lang.professionalBoundary);
      }
      if (matchedRule.topic === 'recap') {
        return buildRecap(this);
      }
      if (matchedRule.topic === 'knowledge' && DaryaKnowledge) {
        const knowledgeText = this._currentNormalizedInput || captured || '';
        // The factual layer answers concrete questions ("tell me about
        // Jupiter", "فیزیک کوانتوم چیه") with a direct explanation. When
        // it has a confident match it wins over the reflective shelf, so
        // science and world-knowledge questions never bounce to a vague
        // "let us sit with it" line. The shelf below remains the fallback
        // for emotional and growth topics.
        const factual = DaryaKnowledge.lookup
          ? DaryaKnowledge.lookup(knowledgeText, this.lang.code)
          : null;
        if (factual && factual.confidence >= KNOWLEDGE_OVERRIDE_CONFIDENCE) {
          const factualReply = factual.text;
          const factualFollowup =
            this.lang.code === 'fa'
              ? ' دوست داری بیشتر درباره‌اش بگویی یا سؤال دیگری داری؟'
              : ' Would you like to go deeper, or is there another question?';
          this._lastKnowledgeTopic = factual.topic;
          this._lastKnowledgeTurn = this.memory.turnCount;
          // A knowledge answer becomes the active subject so a following
          // short statement ("space is incredible", «واقعا جالبه»)
          // continues the same thread instead of bouncing to the
          // honest-unknown pool.
          this.memory.currentSubject = {
            topic: 'knowledge',
            entityRefs: [factual.topic],
            since: this.memory.turnCount
          };
          return factualReply + factualFollowup;
        }
        const domainHints =
          this.lang.code === 'fa'
            ? {
                thinkers: [
                  'سقراط',
                  'رواقی',
                  'ارسطو',
                  'یونگ',
                  'نیچه',
                  'گاندی',
                  'ماندلا',
                  'چرچیل',
                  'زرتشت'
                ],
                philosophy: ['فلسفه', 'فلسفی'],
                focus: ['تمرکز'],
                learning: ['یاد'],
                communication: ['ارتباط'],
                creativity: ['خلاق'],
                mindfulness: [
                  'ذهن‌آگاهی',
                  'مدیتیشن',
                  'مراقبه',
                  'حضور',
                  'نفس',
                  'آرامش'
                ],
                stress: [
                  'استرس',
                  'فشار',
                  'فرسودگی',
                  'آرام‌شدن',
                  'مدیریت استرس'
                ],
                self_compassion: [
                  'خودشفقتی',
                  'مهربانی با خود',
                  'خودانتقادی',
                  'منتقد درونی'
                ],
                conflict: [
                  'تعارض',
                  'حل اختلاف',
                  'بحث',
                  'ارتباط بدون خشونت',
                  'صلح'
                ],
                decision_making: [
                  'تصمیم',
                  'تصمیم‌گیری',
                  'انتخاب',
                  'بین دو گزینه'
                ],
                grief: [
                  'سوگ',
                  'فقدان',
                  'از دست دادن',
                  'داغ',
                  'مرگ',
                  'غم از دست'
                ]
              }
            : {
                thinkers: [
                  'socrates',
                  'stoic',
                  'aristotle',
                  'jung',
                  'nietzsche',
                  'gandhi',
                  'mandela',
                  'churchill',
                  'zarathustra'
                ],
                philosophy: ['philosophy'],
                focus: ['focus', 'concentrate'],
                learning: ['study', 'learn'],
                communication: ['communicate'],
                creativity: ['creative'],
                mindfulness: [
                  'mindfulness',
                  'meditation',
                  'mindful',
                  'present moment',
                  'breathing exercise',
                  'calm mind'
                ],
                stress: [
                  'stress',
                  'burnout',
                  'overwhelmed',
                  'calm down',
                  'stress management',
                  'anxiety management'
                ],
                self_compassion: [
                  'self compassion',
                  'self-compassion',
                  'self kindness',
                  'inner critic',
                  'be kind to myself',
                  'self care'
                ],
                conflict: [
                  'conflict resolution',
                  'argument',
                  'disagreement',
                  'resolve conflict',
                  'nonviolent communication',
                  'nvc'
                ],
                decision_making: [
                  'decision',
                  'make a choice',
                  'deciding',
                  'choose between',
                  'important decision',
                  'decision making'
                ],
                grief: [
                  'grief',
                  'grieving',
                  'loss',
                  'cope with loss',
                  'mourning',
                  'grief support',
                  'bereavement'
                ]
              };
        const domain =
          Object.entries(domainHints).find(([, hints]) =>
            hints.some((hint) =>
              knowledgeText.toLocaleLowerCase().includes(hint)
            )
          )?.[0] || 'philosophy';
        return this._pickVaried(DaryaKnowledge.answer(this.lang.code, domain));
      }

      if (matchedRule.topic === 'greeting') {
        // Greetings are exempt from the question budget: a warm opening
        // question never reads as interrogative, and the pool must never
        // degrade into a generic fallback mid-conversation.
        return this._pickVaried(matchedRule.responses, {
          ignoreQuestionBudget: true
        });
      }
      if (matchedRule.topic === 'joke_count' && this.lang.ruleTellJoke) {
        // «چندتا جک بلدی؟» deserves a real number, not another joke. The
        // {count} placeholder carries the actual joke-pool size so the
        // answer stays truthful when jokes are added or removed.
        return this._pickVaried(matchedRule.responses, {
          ignoreQuestionBudget: true
        }).replace(/\{count\}/gu, String(this.lang.ruleTellJoke.length));
      }
      if (matchedRule.topic === 'smalltalk_joke') {
        // Remember that the last entertainment reply was a joke so the
        // sequential follow-up ("another one", «یکی دیگه», «بازم») can
        // re-pick from the same pool instead of bouncing to a generic
        // fallback (see _applySmartOverrides).
        this._lastEntertainmentKind = 'joke';
        this._lastEntertainmentTurn = this.memory.turnCount;
        return this._pickVaried(this.lang.ruleTellJoke, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }
      if (matchedRule.topic === 'smalltalk_story') {
        // Short-story requests are answered from the genre pools. The
        // genre word in the request picks the pool (horror, comedy, or
        // the general pool when no genre is named), and the chosen genre
        // is remembered so the follow-up ("another one") stays in the
        // same vein. The knowledge shelf is blocked for this topic (see
        // KNOWLEDGE_BLOCKED_PERSONAL), so the pool reply always stands.
        const storyText = this._currentNormalizedInput || captured || '';
        const horror =
          /(?:ترسناک|وحشتناک|وحشت|scary|horror|creepy|spooky)/iu.test(
            storyText
          );
        const comedy =
          /(?:خنده‌دار|خنده دار|بامزه|طنز|funny|comedy|humorous)/iu.test(
            storyText
          );
        const pool = horror
          ? this.lang.ruleTellStoryHorror
          : comedy
            ? this.lang.ruleTellStoryComedy
            : this.lang.ruleTellStory;
        this._lastEntertainmentKind = 'story';
        this._lastStoryGenre = horror
          ? 'horror'
          : comedy
            ? 'comedy'
            : 'general';
        this._lastEntertainmentTurn = this.memory.turnCount;
        if (pool && pool.length > 0) {
          return this._pickVaried(pool, {
            ignoreQuestionBudget: true,
            trackQuestions: false
          });
        }
        return this._pickVaried(this.lang.ruleTellStory, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }
      if (matchedRule.topic === 'health_pain') {
        // Every new pain report deserves the caring pool, even right
        // after another question was asked: the pool lines end with a
        // gentle follow-up, and without the exemption the question budget
        // filtered them all and the pain complaint collapsed into a
        // generic "you do not have to solve it all at once" line (the
        // transcript's «دستم درد میکنه» failure). Same-rule streak is
        // also exempt: repeated pain reports are not a broken record,
        // they are the same ongoing complaint.
        return this._pickVaried(matchedRule.responses, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }
      if (matchedRule.topic === 'ask_me_question') {
        // The user explicitly asked for a question, so the budget must not
        // swallow the pool.
        return this._pickVaried(matchedRule.responses, {
          ignoreQuestionBudget: true
        });
      }
      if (matchedRule.topic === 'app_command') {
        // App-command pool lines close with an invitation ("دوست داری
        // درباره‌ی خودت صحبت کنیم؟") to steer the chat back on track. In
        // a long conversation the question budget is usually exhausted, so
        // without this exemption every line would be filtered and the
        // honest UI pointer would collapse into a generic fallback (the
        // "turn on ambient sound" transcript bug). The user gave a direct
        // command; the reply must always deliver.
        return this._pickVaried(matchedRule.responses, {
          ignoreQuestionBudget: true
        });
      }

      // The same-rule streak guard only exists to stop the SAME rule from
      // firing its pool too many turns in a row (e.g. a user who keeps
      // typing "ok" re-matching the how-are-you rule). It must only degrade
      // when the current matched rule is the one on the streak: a different
      // rule (e.g. a fresh anxiety disclosure right after smalltalk) deserves
      // its own pool even if the previous topic repeated. Greetings are also
      // exempt because _isRepeatedGreeting handles greeting spam with its
      // dedicated pool.
      if (
        matchedRule.topic !== 'greeting' &&
        matchedRule.topic !== 'health_pain' &&
        !STREAK_EXEMPT_TOPICS.has(matchedRule.topic) &&
        this.memory.sameRuleStreak > MAX_CONSECUTIVE_SAME_RULE &&
        matchedRule.topic === this.memory.lastRuleTopic
      ) {
        return this._fallbackResponse(matchedRule.topic, '');
      }

      if (this._canAskTopicQuestion(matchedRule.topic)) {
        const question = this._pickVaried(
          this.lang.topicSpecificQuestions[matchedRule.topic]
        );
        if (
          this.lang.topicSpecificQuestions[matchedRule.topic].includes(question)
        ) {
          return question;
        }
      }

      const needsCapture = matchedRule.responses.some((r) =>
        r.includes('{captured}')
      );
      if (!needsCapture) {
        // A matched rule is a conversational move, not a generic fallback
        // barrage, so its pool is exempt from the question budget: pools
        // whose lines all end in a follow-up question (pet care, gig
        // economy, fitness, comparison) must never be starved into the
        // generic fallback after a few turns. The budget still guards
        // the unknown-input fallbacks below.
        return this._pickVaried(matchedRule.responses, {
          ignoreQuestionBudget: true
        });
      }

      if (captured) {
        const withCapture = matchedRule.responses.filter((r) =>
          r.includes('{captured}')
        );
        // Long captures are verb phrases, not subjects: «خانوادم همش
        // مقایسه‌م می‌کنن» captures «همش مقایسه‌م می‌کنن», and echoing
        // it as «درباره‌ی همش مقایسه‌م می‌کنن بیشتر برایم بگویید» reads
        // broken. Only short noun-phrase captures (at most
        // CAPTURED_MAX_WORDS words) are safe to quote back; anything
        // longer falls through to the capture-free templates below.
        const capturedWords = String(captured)
          .split(/\s+/u)
          .filter(Boolean).length;
        if (capturedWords <= CAPTURED_MAX_WORDS) {
          const template = this._pickVaried(withCapture, {
            ignoreQuestionBudget: true
          });
          // The captured tail often carries a trailing or leading copula
          // («هست خواهرزاده», "is the best"); echoing it verbatim reads
          // broken, so the copula is trimmed before substitution.
          return template.replace('{captured}', trimCapturedCopulas(captured));
        }
      }

      const captureFree = matchedRule.responses.filter(
        (r) => !r.includes('{captured}')
      );
      if (captureFree.length > 0) {
        return this._pickVaried(captureFree, {
          ignoreQuestionBudget: true
        });
      }
      return this._pickVaried(this.lang.genericFallbacks);
    },

    _fallbackResponse(preferTopic, normalizedUserText) {
      // Questions take priority over entity and quoted callbacks: a stale
      // entity reference or a random "you said X earlier" line must never
      // swallow a direct question ("tell me about Jupiter"). This is the
      // regression that made Darya answer a math/knowledge question with
      // a quote from an old message.
      const _isQuestionTurn =
        !!normalizedUserText &&
        this.lang.questionPattern.test(normalizedUserText);

      if (_isQuestionTurn) {
        // Before conceding "I do not have an answer", give the factual
        // knowledge layer a chance: concrete questions (science, tech,
        // culture, careers) deserve a direct answer, not an evasive
        // bounce-back. Only when the lookup finds nothing does the turn
        // fall through to the honest-unknown pools.
        const factual =
          DaryaKnowledge && DaryaKnowledge.lookup
            ? DaryaKnowledge.lookup(normalizedUserText, this.lang.code)
            : null;
        if (factual && factual.confidence >= KNOWLEDGE_OVERRIDE_CONFIDENCE) {
          const randomized = DaryaKnowledge.randomizeRecommendation
            ? DaryaKnowledge.randomizeRecommendation(
                factual.topic,
                this.lang.code,
                5,
                normalizedUserText
              )
            : null;
          const answerText = randomized || factual.text;
          const followup = this._knowledgeFollowup(answerText);
          this._lastKnowledgeTopic = factual.topic;
          this._lastKnowledgeTurn = this.memory.turnCount;
          // Mirror the rule-path subject update (see the knowledge branch
          // of _respondWithRule) so a following short statement on the
          // same fact keeps the thread instead of bouncing to the
          // honest-unknown pool.
          this.memory.currentSubject = {
            topic: 'knowledge',
            entityRefs: [factual.topic],
            since: this.memory.turnCount
          };
          return answerText + followup;
        }
        if (this.currentTurnDialogueAct === 'question') {
          // A first-person process question ("چطور میتونم مدیریت کنم",
          // "how do I talk to her") right after a disclosure asks for
          // guidance on the SAME subject the user just shared, so the
          // subject continuation keeps the thread instead of conceding
          // ignorance. The _isPersonalProcessQuestion gate is what keeps
          // a genuine new question ("دیروز چه اتفاقی افتاد؟", "what is
          // the capital of France?") from being hijacked by an old
          // subject: those never match the first-person process forms.
          const continuation = this._isPersonalProcessQuestion(
            normalizedUserText
          )
            ? this._subjectContinuationReply()
            : null;
          if (continuation) {
            return continuation;
          }
          // For factual questions that fell through the knowledge layer,
          // honesty plus a reliable-source pointer (Wikipedia, reputable
          // YouTube channels, qualified experts) is more useful than a
          // generic acknowledgement. Fired on a coin flip so the reply
          // does not always read as a source lecture. Personal or meta
          // questions about Darya herself are never met with a source
          // pointer; they keep the warm acknowledgement.
          const isFactualQuestion =
            this._isKnowledgeRequest(normalizedUserText);
          if (
            isFactualQuestion &&
            this.lang.sourceSuggestions &&
            Math.random() < SOURCE_SUGGESTION_CHANCE
          ) {
            return this._pickVaried(this.lang.sourceSuggestions);
          }
          return this._pickVaried(
            this.lang.questionAcknowledgements || this.lang.genericFallbacks
          );
        }
        return this._pickVaried(this.lang.questionFallbacks);
      }

      if (
        this.memory.turnCount > 0 &&
        this.memory.turnCount % this.lang.checkInEvery === 0
      ) {
        return this._pickVaried(this.lang.sessionCheckIns);
      }

      // Light positive casual statements ("just had the best cup of coffee")
      // get a warm smalltalk reply instead of the heavy therapeutic generic
      // fallback, which reads as robotic after a cheerful low-stakes remark.
      if (
        normalizedUserText &&
        this.lang.smalltalk &&
        this.lang.smalltalk.length &&
        this._isLightPositiveCasual(normalizedUserText)
      ) {
        // The smalltalk reply is already warm and light. Mark the turn so
        // emotional calibration and human-tone coloring skip it instead of
        // stacking a second prefix on top.
        this._lightPositiveFired = true;
        return this._pickVaried(this.lang.smalltalk);
      }

      const entityCallback = this._respondToEntityReference();
      if (entityCallback) {
        return entityCallback;
      }

      // A statement that matches no rule but follows an active subject
      // (the user adding a detail to what they just disclosed, like
      // "سه ماه پیش از دنیا رفت" right after a grief disclosure) stays
      // in that thread: Darya asks the subject's follow-up question
      // instead of conceding the topic as unknown. This is the Rogerian
      // "stay with the thread" behavior that answers the real-transcript
      // complaint about Darya forgetting the conversation. Keyed on the
      // memory subject, so it only fires right after a subject was
      // established and only for subjects that have follow-up questions.
      // It runs after smalltalk (a genuinely light pivot still gets its
      // cheerful reply) and after the entity callback (a named-entity
      // memory reference is the stronger memory signal) but before the
      // quoted-callback and pronoun reflection, which would otherwise
      // steal an in-thread detail turn with a probabilistic line.
      // The quoted-callback now always targets the most recent
      // substantive utterance (see mostRecentUtterance), so it is
      // deterministic in WHICH thread it returns to; only its firing
      // gate (QUOTED_CALLBACK_PROBABILITY) stays probabilistic.
      const continuation = this._subjectContinuationReply();
      if (continuation) {
        return continuation;
      }

      if (normalizedUserText && Math.random() < QUOTED_CALLBACK_PROBABILITY) {
        // Circle back to the MOST RECENT topic the person raised, never a
        // random old phrase: a release or filler turn like «ولش کن» must
        // return to the same latest thread every time, so the reply is
        // deterministic across runs. mostRecentUtterance already skips the
        // current turn's own text and any sub-three-word filler, and
        // returns null when nothing qualifies, letting the turn fall
        // through to the honest unknown-topic pool.
        const excerpt = this.memory.mostRecentUtterance(normalizedUserText);
        if (excerpt) {
          const template = this._pickVaried(this.lang.quotedCallbackTemplates);
          return template.replace(
            '{excerpt}',
            truncateExcerpt(excerpt, EXCERPT_MAX_LENGTH)
          );
        }
      }

      if (
        this.lang.pronounMap &&
        normalizedUserText &&
        // Reflection is for STATEMENTS, never questions: reflecting a
        // question back («آیا پدر و مادر داری؟» -> "So I have parents") is
        // exactly the mangling the transcript complained about. Questions
        // keep the honest unknown-topic / question-acknowledgement pools.
        !_isQuestionTurn &&
        // Imperative requests ("tell me something interesting", «یه
        // چیزی جالب بگو», "name some youtubers") are not statements to
        // reflect either: "tell me X" must route to the fun-fact,
        // knowledge, or honest pools, never echo back as "So tell you X"
        // (the transcript's EN reflection misfire).
        !IMPERATIVE_REQUEST_PATTERN.test(normalizedUserText) &&
        Math.random() < PRONOUN_REFLECTION_PROBABILITY
      ) {
        const reflected = reflectPronouns(
          normalizedUserText,
          this.lang.pronounMap
        );
        if (reflected) {
          return `So ${reflected}. What's that like for you?`;
        }
      }

      // A genuinely unmatched statement (no rule, no entity callback, no
      // quoted-memory callback) gets the honest unknown-topic pool:
      // Darya admits the subject is outside what she knows and invites
      // the person to open it up, instead of a canned therapeutic line
      // that reads as evasive (the "you never understand me" complaint
      // from real transcripts). Only the no-rule path reaches here with
      // preferTopic null, and a bare "ok" answering a pending question
      // never reaches it either, so the pool can never mislabel a reply
      // as unknown. The invitation questions bypass the budget the same
      // way the distress nudge does: an honest "help me understand"
      // must always deliver.
      if (
        preferTopic === null &&
        this.currentTurnDialogueAct !== 'acknowledgement' &&
        this.lang.unknownTopicResponses &&
        this.lang.unknownTopicResponses.length > 0
      ) {
        return this._pickVaried(this.lang.unknownTopicResponses, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      }
      this._fallbackToggle = !this._fallbackToggle;
      const pool = this._fallbackToggle
        ? this.lang.strategyShiftFallbacks
        : this.lang.genericFallbacks;
      return this._pickVaried(pool);
    },

    /**
     * Continues the active conversation subject when a statement matches
     * no rule: the user is adding detail to what they already disclosed
     * ("سه ماه پیش از دنیا رفت" right after "مامانم فوت کرده"). Returns
     * the subject's follow-up question when the subject is recent and has
     * one, otherwise null so the caller falls through to the honest
     * unknown pool. The subject keeps its topic across unmatched turns
     * (see ConversationMemory.updateSubject), so this only fires while a
     * subject is genuinely current; a brand-new topic with no subject yet
     * still gets the unknown pool.
     * @returns {string|null}
     */
    _subjectContinuationReply() {
      const subject = this.memory.currentSubject;
      if (!subject || !subject.topic) {
        return null;
      }
      // The knowledge thread refreshes on every shelf answer (each new
      // genre or fact resets _lastKnowledgeTurn), but the memory subject
      // keeps its ORIGINAL since stamp because updateSubject only rewrites
      // it when the topic itself changes. Measuring from _lastKnowledgeTurn
      // keeps a long knowledge run (movie recs, fact after fact) alive
      // instead of expiring mid-thread and bouncing to the unknown pool.
      const since =
        subject.topic === 'knowledge' ? this._lastKnowledgeTurn : subject.since;
      if (
        !since ||
        this.memory.turnCount - since > SUBJECT_CONTINUATION_WINDOW
      ) {
        return null;
      }
      const specific = this.lang.topicSpecificQuestions?.[subject.topic];
      // A topic without its own follow-up questions (for example the
      // knowledge thread, which has no rule-topic entry) still deserves a
      // generic continuation instead of the honest-unknown pool: the
      // user just heard Darya explain something and said more about it.
      // topicRecoveryResponses carries the _default fallback that
      // topicSpecificQuestions lacks, so a subject with no specific
      // entry keeps a warm thread instead of dying on an undefined pool.
      // Conversational openers (greeting and smalltalk exchanges) are NOT
      // content threads: "I keep thinking about my old apartment" right
      // after a greeting is a fresh disclosure, so it must fall through
      // to the pronoun reflection / honest-unknown paths instead of
      // being pinned to a "let us return to the topic" line.
      const isOpenerSubject = OPENER_SUBJECT_TOPICS.has(subject.topic);
      const pool =
        specific && specific.length > 0
          ? specific
          : !isOpenerSubject
            ? this.lang.topicSpecificQuestions?.['_default'] ||
              this.lang.topicRecoveryResponses?._default
            : null;
      if (!pool || pool.length === 0) {
        return null;
      }
      // Bypass the question budget like the short-answer context path:
      // the follow-up replaces the answered turn one-for-one, so it is
      // not a new barrage. The picked question is recorded as pending so
      // a following short answer or question-echo can continue the same
      // thread.
      const reply = this._pickVaried(pool, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      });
      if (reply && this._isQuestionResponse(reply)) {
        this.memory.noteBotQuestion(reply, subject.topic);
      }
      // A served continuation keeps the thread alive: a long lived
      // thread (a pet worry spanning many turns, a comparison that
      // keeps getting follow-ups) must not expire mid-conversation just
      // because several unmatched statements passed. The since stamp
      // refreshes so the NEXT unmatched statement still continues the
      // same thread. The refresh is bounded (see
      // SUBJECT_CONTINUATION_MAX_REFRESHES): a chatty unmatched user
      // cannot keep a subject immortal forever, because after the cap
      // the stamp stops moving and the window check expires the thread
      // into the honest-unknown pool. A fresh subject (topic change)
      // starts with a fresh budget. Knowledge threads refresh
      // _lastKnowledgeTurn on every shelf answer instead, so their
      // stamp is left untouched here.
      if (reply && subject.topic !== 'knowledge') {
        const refreshes = subject.continuationRefreshes || 0;
        if (refreshes < SUBJECT_CONTINUATION_MAX_REFRESHES) {
          subject.since = this.memory.turnCount;
          subject.continuationRefreshes = refreshes + 1;
        }
      }
      return reply;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
