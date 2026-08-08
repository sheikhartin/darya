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
    reflectPronouns,
    truncateExcerpt
  } = global.DaryaUtils;

  const { KNOWLEDGE_OVERRIDE_CONFIDENCE, SOURCE_SUGGESTION_CHANCE } =
    global.DaryaResponderShared;

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
      if (matchedRule.topic === 'gratitude' && this.lang.gratitudeResponses) {
        return this._pickVaried(this.lang.gratitudeResponses);
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
      if (matchedRule.topic === 'ask_me_question') {
        // The user explicitly asked for a question, so the budget must not
        // swallow the pool.
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
        return this._pickVaried(matchedRule.responses);
      }

      if (captured) {
        const withCapture = matchedRule.responses.filter((r) =>
          r.includes('{captured}')
        );
        const template = this._pickVaried(withCapture);
        return template.replace('{captured}', captured);
      }

      const captureFree = matchedRule.responses.filter(
        (r) => !r.includes('{captured}')
      );
      if (captureFree.length > 0) {
        return this._pickVaried(captureFree);
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
          const followup =
            this.lang.code === 'fa'
              ? ' دوست داری بیشتر درباره‌اش بگویی یا سؤال دیگری داری؟'
              : ' Would you like to go deeper, or is there another question?';
          this._lastKnowledgeTopic = factual.topic;
          this._lastKnowledgeTurn = this.memory.turnCount;
          return factual.text + followup;
        }
        if (this.currentTurnDialogueAct === 'question') {
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

      const entityCallback = this._respondToEntityReference();
      if (entityCallback) {
        return entityCallback;
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

      if (normalizedUserText && Math.random() < QUOTED_CALLBACK_PROBABILITY) {
        const excerpt = this.memory.randomRecentUtterance(normalizedUserText);
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

      this._fallbackToggle = !this._fallbackToggle;
      const pool = this._fallbackToggle
        ? this.lang.strategyShiftFallbacks
        : this.lang.genericFallbacks;
      return this._pickVaried(pool);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
