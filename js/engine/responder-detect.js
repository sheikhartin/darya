/**
 * Darya - input signal detection methods.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  const {
    REPEATED_GREETING_THRESHOLD,
    SERIOUS_TURN_THRESHOLD,
    MODERATE_SERIOUSNESS_THRESHOLD,
    SERIOUSNESS_TOPIC_FLOOR,
    WORD_REPETITION_THRESHOLD,
    SPAM_MIN_LENGTH,
    SPAM_MAX_UNIQUE_RATIO,
    ACKNOWLEDGEMENT_THRESHOLD,
    SUBSTANTIVE_ANSWER_MIN_WORDS,
    TEASING_MOCK_THRESHOLD,
    WELLBEING_CHECK_TURNS,
    MIXED_SCRIPT_FOREIGN_MIN,
    MIXED_SCRIPT_FOREIGN_RATIO,
    HUMOR_BLOCK_PATTERN,
    scoreSentiment
  } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    // ======================================================================
    // Signal detection methods
    //
    // These private methods analyze the user's input for specific patterns
    // that require special handling: repeated greetings (user keeps saying
    // "hello" without substance), spam/keyboard-mash input, ambiguous short
    // inputs, word repetition (same word used 4+ times), frustration signals
    // (multiple exclamation marks), teasing or sarcasm, wellbeing checks
    // ("how are you?"), acknowledgements ("ok", "k", "باشه"), emotional
    // statements (strong sentiment), substantive content checks, and
    // mixed-language indicators.
    //
    // Each method returns a boolean or structured detection result that
    // the main `respond` pipeline uses to select the appropriate response
    // strategy and pool.
    // ======================================================================

    _isRepeatedGreeting(normalizedText) {
      const recentUtterances = this.memory.recentUtterances;
      if (recentUtterances.length < REPEATED_GREETING_THRESHOLD) {
        return false;
      }
      const greetingPatterns = this.lang.rules
        .filter((r) => r.topic === 'greeting')
        .map((r) => r.pattern);
      if (!greetingPatterns.length) {
        return false;
      }
      let greetingCount = 0;
      const currentIsGreeting = greetingPatterns.some((p) => {
        p.lastIndex = 0;
        return p.test(normalizedText);
      });
      if (!currentIsGreeting) {
        return false;
      }
      for (let i = recentUtterances.length - 1; i >= 0; i -= 1) {
        const isGreeting = greetingPatterns.some((p) => {
          p.lastIndex = 0;
          return p.test(recentUtterances[i]);
        });
        if (isGreeting) {
          greetingCount += 1;
        } else {
          break;
        }
      }
      return greetingCount >= REPEATED_GREETING_THRESHOLD;
    },

    _isSpamOrNoise(normalizedText) {
      const text = normalizedText.trim();
      if (text.length < SPAM_MIN_LENGTH) {
        return false;
      }
      if (/^\p{N}+$/u.test(text) && text.length < 5) {
        return true;
      }
      const chars = [...text].filter((ch) => /\p{L}/u.test(ch));
      if (chars.length < 3) {
        return false;
      }
      const uniqueChars = new Set(chars.map((c) => c.toLowerCase()));
      const uniqueRatio = uniqueChars.size / chars.length;
      if (uniqueRatio < SPAM_MAX_UNIQUE_RATIO && text.length < 12) {
        return true;
      }
      if (uniqueChars.size <= 2 && text.length > 4) {
        return true;
      }
      const words = text.split(/\s+/u).filter(Boolean);
      if (
        words.length <= 2 &&
        this.lang.stopWords &&
        words.every((w) => this.lang.stopWords.has(w.toLowerCase()))
      ) {
        return false;
      }
      return false;
    },

    _isAmbiguousInput(normalizedText) {
      const wordCount = normalizedText.split(/\s+/u).filter(Boolean).length;
      return wordCount <= 2 && normalizedText.length < 10;
    },

    /**
     * Detects a message made only of smileys or emoji (":)", ":))))) ",
     * "🙂", "🔥"). These deserve a warm light reply, never the ambiguous
     * "explain more" line or a heavy therapeutic prefix.
     * @param {string} rawText - The raw user input (pre-normalization)
     * @returns {boolean}
     */
    _isPureEmoji(rawText) {
      const trimmed = String(rawText || '').trim();
      if (!trimmed) {
        return false;
      }
      // ASCII smileys and text faces
      if (/^[:;=xX][\-]?[()DdpPoO*\^]{1,12}$/u.test(trimmed)) {
        return true;
      }
      // Unicode emoji-only input (emoji with optional ZWJ and variation
      // selectors, plus surrounding whitespace)
      return /^[\p{Emoji}\u200d\ufe0f\s]+$/u.test(trimmed);
    },

    // How many times a word is repeated WITHIN a single message (not
    // across turns). The word-repetition override uses this to decide
    // whether a pure in-message repetition («غمگین غمگین غمگین غمگین»)
    // should still name the word even when a broad rule like sadness
    // also matches, while a word merely echoed from an earlier turn
    // («دلم درد میکنه» after «دستم درد میکنه») keeps the rule's reply.
    _withinMessageRepetition(word, normalizedText) {
      const clean = String(normalizedText || '').replace(
        /[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu,
        ' '
      );
      const words = clean.toLowerCase().split(/\s+/u).filter(Boolean);
      return words.filter((w) => w === word).length;
    },

    _detectWordRepetition(normalizedText) {
      const recent = [...this.memory.recentUtterances];
      const stopWords =
        this.lang.stopWords ||
        new Set([
          'is',
          'are',
          'am',
          'be',
          'the',
          'a',
          'an',
          'in',
          'on',
          'at',
          'to',
          'for',
          'of',
          'and',
          'or',
          'but',
          'it',
          'its',
          'i',
          'you',
          'he',
          'she',
          'they',
          'we',
          'my',
          'your',
          'his',
          'her',
          'its'
        ]);
      const pastWordCounts = new Map();
      for (const utterance of recent) {
        const clean = String(utterance).replace(
          /[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu,
          ' '
        );
        const words = clean.toLowerCase().split(/\s+/u).filter(Boolean);
        for (const word of words) {
          if (word.length < 2 || stopWords.has(word)) {
            continue;
          }
          pastWordCounts.set(word, (pastWordCounts.get(word) || 0) + 1);
        }
      }
      const currentClean = String(normalizedText || '').replace(
        /[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu,
        ' '
      );
      const currentWords = currentClean
        .toLowerCase()
        .split(/\s+/u)
        .filter(Boolean);
      const currentWordSet = new Set(currentWords);
      let mostRepeated = null;
      let maxCount = 0;
      for (const [word, count] of pastWordCounts) {
        if (
          count > maxCount &&
          count >= WORD_REPETITION_THRESHOLD &&
          currentWordSet.has(word)
        ) {
          mostRepeated = word;
          maxCount = count;
        }
      }
      return mostRepeated ? { word: mostRepeated, count: maxCount } : null;
    },

    _detectFrustration(rawText) {
      if (/!{3,}/.test(rawText)) {
        return 'exclamation';
      }
      if (/\?{2,}/.test(rawText)) {
        return 'question';
      }
      if (/[!?]{3,}/.test(rawText)) {
        return 'exclamation';
      }
      return null;
    },

    _detectTeasingOrMocking(rawText, matchingText) {
      const sarcasticPraise =
        // eslint-disable-next-line max-len
        /(?:you'?re\s+(?:so|very|really)\s+(?:smart|clever|funny|helpful|wise|useful|intelligent|brilliant|genius)|what a genius|wow\s+(?:you'?re|so)|such a genius|great advice|very helpful|thanks a lot)\b/i;

      const mockAgree =
        // eslint-disable-next-line max-len
        /\b(?:yeah right|sure (?:you are|you do|bot)|whatever you say|if you say so|right ok|ok sure|as if|oh please)\b/i;
      const dismissSignal = /(?:pfft|meh|tch|pshaw|bah|hmph)/i;

      const faSarcasm =
        // eslint-disable-next-line max-len
        /(?:چه (?:باهوش|خوب|عاقل|دانا|مهربان|صبور|باحال|بامزه|باحوصله|باهوشی|باهوشید)،|آفرین به (?:خودت|شما|خودتون)|به به|احسنت|مرسی که اینقدر (?:باهوشی|کمک کردی|به دردم خوردی)|به درک|هر چی تو بگی|چشم منتظر|خوب خوب تو راست میگی|باشه باشه تو بردی)/iu;
      const hasExcessivePunct = /!{3,}|\?{3,}|!\?|\?!|([.!?]){3,}/.test(
        rawText
      );
      const hasSarcasticPraise =
        sarcasticPraise.test(rawText) && hasExcessivePunct;
      const hasMockAgree = mockAgree.test(matchingText);
      const hasDismissSignal = dismissSignal.test(rawText);
      const hasFaSarcasm = faSarcasm.test(rawText);
      const hasSarcasticPraiseBare =
        sarcasticPraise.test(matchingText) &&
        this.memory.turnCount >= 2 &&
        this.memory.recentTopics
          .slice(-2)
          .some(
            (topic) =>
              (this.lang.topicSeriousness?.[topic] ||
                SERIOUSNESS_TOPIC_FLOOR) >= SERIOUS_TURN_THRESHOLD
          );
      let signals = 0;
      if (hasSarcasticPraise) {
        signals += 1;
      }
      if (hasMockAgree) {
        signals += 1;
      }
      if (hasDismissSignal) {
        signals += 1;
      }
      if (hasSarcasticPraiseBare) {
        signals += 1;
      }
      if (hasFaSarcasm) {
        signals += 2;
      }
      return signals >= TEASING_MOCK_THRESHOLD;
    },

    _detectWellBeingCheck(matchingText) {
      const wellBeingPattern =
        this.lang.wellBeingPattern ||
        /\b(?:how (?:are you|are you doing|you doing|have you been)|you (?:ok|alright|good)|what about you)\b/i;
      const isWellBeingQ = wellBeingPattern.test(matchingText);
      if (!isWellBeingQ) {
        return false;
      }
      if (this.memory.turnCount < WELLBEING_CHECK_TURNS) {
        return false;
      }
      const recentSeriousness = this.memory.seriousnessHistory.slice(
        -WELLBEING_CHECK_TURNS
      );
      const avgSeriousness = recentSeriousness.length
        ? recentSeriousness.reduce(function (a, b) {
            return a + b;
          }, 0) / recentSeriousness.length
        : 0;
      // Fire the well-being response when:
      //   1. The conversation has been serious (avgSeriousness >= 0.4), OR
      //   2. The last turn needed care (direct distress signal), OR
      //   3. This is a direct question ('how are you?', 'خوبی', etc.) in
      //      ANY conversation, not just serious ones. The user asking
      //      about Darya's state is meaningful regardless of the tone.
      const isDirectWellBeingQuestion =
        // eslint-disable-next-line max-len
        /(?:^|\s)(?:how are you|how are you doing|are you (?:ok|alright|good)|what about you|خوبی|چطوری|حالت چطور|حالت خوبه|سلامتی|سلامت هستی)(?:\s|$|[!?.؟])/iu.test(
          matchingText
        );
      return (
        avgSeriousness >= MODERATE_SERIOUSNESS_THRESHOLD ||
        this.lastTurnNeedsCare ||
        isDirectWellBeingQuestion
      );
    },

    _isAcknowledgement(text) {
      const words = text.trim().split(/\s+/u).filter(Boolean);
      if (words.length > ACKNOWLEDGEMENT_THRESHOLD) {
        return false;
      }
      // The core acknowledgement word may be followed by a few common
      // intensifiers/agreement tags ("yeah exactly", "آره دقیقا") so short
      // confirmations still count as acknowledgements rather than falling
      // into the ambiguous-input pool.
      const enAck =
        // eslint-disable-next-line max-len
        /^(?:ok|okay|k|sure|right|yeah|yep|i see|got it|understood|makes sense|noted|cool|fine|alright)(?:\s+(?:yeah|yep|sure|right|exactly|definitely|totally|really|absolutely)){0,2}$/iu;
      const faAck =
        // eslint-disable-next-line max-len
        /^(?:باشه|خب|خوب|متوجه|آره|اره|درست|چشم|بله|شه|اوه|آها|آحم|دقیقا|دقیقاً|واقعا|واقعاً|حتما|حتماً)(?:\s+(?:آره|اره|دقیقا|دقیقاً|واقعا|واقعاً|حتما|حتماً|بله|خب|باشه|درسته|درست)){0,2}$/iu;
      return enAck.test(text.trim()) || faAck.test(text.trim());
    },

    /**
     * Detects light, positive casual statements ("just had the best cup of
     * coffee", "امروز صبح یه قهوه عالی خوردم"). These unmatched statements
     * should get a light warm reply from the smalltalk pool instead of the
     * heavy therapeutic generic fallback, which reads as robotic after a
     * cheerful, low-stakes remark.
     * @param {string} text - Normalized user input
     * @returns {boolean}
     */
    _isLightPositiveCasual(text) {
      if (!text || this.lang.questionPattern?.test(text)) {
        return false;
      }
      if (this.currentTurnSeriousness >= MODERATE_SERIOUSNESS_THRESHOLD) {
        return false;
      }
      const words = text.split(/\s+/u).filter(Boolean);
      if (words.length > 12) {
        return false;
      }
      const score = scoreSentiment(text, this.lang.sentimentLexicon);
      if (score > 0) {
        return true;
      }
      const lightPositive =
        this.lang.code === 'fa'
          ? // eslint-disable-next-line max-len
            /(?<!\p{L})(?:عالی|قشنگ|خوشحال|خوب گذشت|خوش گذشت|لذت بردم|دوست داشتم|بهترین|خوشمزه|فوق\u200cالعاده|باحال|کیف کردم)(?!\p{L})/u
          : // eslint-disable-next-line max-len
            /\b(?:best|great|awesome|amazing|wonderful|lovely|delicious|enjoyed|fantastic|nice day|so good|fun|good day)\b/i;
      // A nervous or reluctant disclosure ("my voice shakes", "I don't
      // feel like going") is never light positive, even if it happens to
      // contain a positive word.
      return !HUMOR_BLOCK_PATTERN.test(text) && lightPositive.test(text);
    },

    _isEmotionalStatement(text) {
      const score = scoreSentiment(text, this.lang.sentimentLexicon);
      return Math.abs(score) >= 2;
    },

    _isSubstantiveAnswer(text) {
      const words = text.trim().split(/\s+/u).filter(Boolean);
      if (words.length < SUBSTANTIVE_ANSWER_MIN_WORDS) {
        return false;
      }
      if (this._isAcknowledgement(text)) {
        return false;
      }
      if (this._isSpamOrNoise(text)) {
        return false;
      }
      return true;
    },

    /**
     * Classifies a short answer as 'affirm', 'negate', or 'maybe'.
     * Short answers are at most three words and must start with a known
     * answer token in the current language. Returns null for anything
     * longer or unrelated, so only genuine yes/no/maybe replies are
     * eligible for the pending-question context override.
     * @param {string} text - Normalized matching text
     * @returns {'affirm'|'negate'|'maybe'|null}
     */
    _shortAnswerKind(text) {
      const trimmed = String(text || '').trim();
      const words = trimmed.split(/\s+/u).filter(Boolean);
      if (!trimmed || words.length > 3) {
        return null;
      }
      const enAffirm =
        // eslint-disable-next-line max-len
        /^(?:yes|yeah|yep|yup|sure|ok|okay|alright|of course|absolutely|definitely|i agree|i do|i will|i would|i'?d like that|please do|go ahead|why not|sounds good)\b/iu;
      const enNegate =
        /^(?:no|nope|nah|not really|not now|i don'?t think so|never mind|no thanks|i'?d rather not)\b/iu;
      const enMaybe =
        // eslint-disable-next-line max-len
        /^(?:maybe|perhaps|not sure|i don'?t know|i'?m not sure|i am not sure|i guess|possibly|let me think|probably|we'?ll see)\b/iu;
      // The Persian ی form only: the normalizer maps the Arabic ي to ی,
      // so the Arabic spelling in a pattern would never match.
      const faAffirm =
        /^(?:بله|آره|اره|باشه|اوکی|حتما|حتماً|چشم|موافقم|بله حتما|بله حتماً)(?!\p{L})/u;
      const faNegate =
        // The ئ to ی normalizer turns «مطمئنم» into «مطمینم», so the
        // refusal must carry both spellings or it never matches.
        /^(?:نه|نخیر|نه نه|نه بابا|الان نه|دوست ندارم|نمیخوام|نمی خوام|مطمئنم نه|مطمینم نه)(?!\p{L})/u;
      const faMaybe =
        // Same dual-spelling rule for the uncertain branch.
        // eslint-disable-next-line max-len
        /^(?:شاید|مطمئن نیستم|مطمین نیستم|نمی دونم|نمیدونم|نمی‌دونم|نمیدونم|احتمالا|احتمالاً|فکر کنم|بذار فکر کنم)(?!\p{L})/u;
      if (this.lang.code === 'fa') {
        if (faAffirm.test(trimmed)) {
          return 'affirm';
        }
        if (faNegate.test(trimmed)) {
          return 'negate';
        }
        if (faMaybe.test(trimmed)) {
          return 'maybe';
        }
        return null;
      }
      if (enAffirm.test(trimmed)) {
        return 'affirm';
      }
      if (enNegate.test(trimmed)) {
        return 'negate';
      }
      if (enMaybe.test(trimmed)) {
        return 'maybe';
      }
      return null;
    },

    _isMixedLanguage(text) {
      const letters = [...String(text)].filter((ch) => /\p{L}/u.test(ch));
      if (letters.length < 4) {
        return false;
      }
      const foreignLetters = letters.filter(
        (ch) => !this.lang.scriptRange.test(ch)
      );
      if (
        foreignLetters.length < MIXED_SCRIPT_FOREIGN_MIN ||
        foreignLetters.length / letters.length < MIXED_SCRIPT_FOREIGN_RATIO
      ) {
        return false;
      }
      // A title-cased foreign run embedded in native text («انیمه Witch
      // Hat Atelier رو دیدی») is a proper-noun title, not a language
      // switch: anime/game/book titles and brand names are everyday
      // loanwords in both directions. When the message also contains
      // native letters and every foreign word starts uppercase, treat
      // the run as a title and skip the redirect. Real bilingual input
      // ("سلام سلام hello friend", "My manager خیلی باهاش مشکل دارم")
      // has lowercase foreign words and still redirects.
      const nativeLetters = letters.filter((ch) =>
        this.lang.scriptRange.test(ch)
      );
      if (nativeLetters.length > 0) {
        const foreignWords = [...String(text).matchAll(/[\p{L}]+/gu)].map(
          (m) => m[0]
        );
        const allForeignWords = foreignWords.filter((word) =>
          [...word].some((ch) => !this.lang.scriptRange.test(ch))
        );
        if (
          allForeignWords.length > 0 &&
          allForeignWords.every((word) => /^\p{Lu}/u.test(word))
        ) {
          return false;
        }
      }
      return true;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
