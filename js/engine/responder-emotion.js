/**
 * Darya - emotion computation and tone calibration.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  const {
    EMOTION_PREFIX_CHANCE,
    MIXED_LANGUAGE_REDIRECT_CHANCE,
    scoreSentiment
  } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    // ======================================================================
    // Emotion detection
    //
    // Uses keyword pattern matching to identify the user's primary emotion
    // from their input. The emotion vocabulary covers 14 categories: hurt,
    // confused, excited, angry, grieving, fear, anxious (with physical
    // symptom sub-patterns), sad, hopeless, overwhelmed, ashamed, jealous,
    // hopeful, and grateful.
    //
    // When a clear emotion is detected and the reply is not overridden by
    // a safety or factual path, the engine prepends a calibrated prefix
    // (e.g., "That sounds painful." for hurt) at a 40% probability to
    // acknowledge the emotional tone before delivering the main response.
    // ======================================================================

    _computePrimaryEmotion(text) {
      const emotions = [
        {
          name: 'hurt',
          patterns:
            /\b(?:hurt(?:s)?|pain(?:ful)?|broken|wounded)\b|(?:شکسته|آسیب|درد)/iu
        },
        {
          name: 'confused',
          patterns:
            /\b(?:confused|lost|don'?t understand|don'?t know)\b|(?:گیج|گم شدم|نمی‌فهمم|نمی‌دونم|سرگردان|نامشخص)/iu
        },
        {
          name: 'excited',
          patterns:
            /\b(?:excited|thrilled|amazing|awesome|great news)\b|(?:هیجان|عالی|فوق‌العاده|خارق‌العاده)/iu
        },
        {
          name: 'angry',
          patterns:
            /\b(?:angry|furious|pissed|hate|mad|annoyed)\b|(?:عصبانی|خشم|نفرت|کفری|عصبی)/iu
        },
        {
          name: 'grieving',
          patterns:
            /\b(?:grief|loss|died|passed away|gone|miss(?:ing)?|mourn)\b|(?:فقدان|فوت|از دست دادن|داغ|سوگ)/iu
        },
        {
          name: 'fear',
          patterns:
            // eslint-disable-next-line max-len
            /\b(?:terrified|frightened|scared\s+(?:to\s+death|stiff|shitless|witless)|panic\s+(?:attack|mode)|phobia|horror|shook)\b|(?:لرزیدن|هراس|فوبیا|ترس\s+مرگ|شوکه|دلهره)/iu
        },
        {
          name: 'anxious',
          patterns:
            /\b(?:anxious|worry|worried|panic|scared|afraid|nervous)\b|(?:نگران|اضطراب|ترس|دلشوره|وحشت)/iu
        },
        {
          name: 'anxious',
          patterns:
            // eslint-disable-next-line max-len
            /\b(?:heart\s+(?:racing|pounding|beating)|sweating|shaking|trembling|chest\s+(?:tight|heavy)|short\s+of\s+(?:breath|breathe)|palpitations|dizzy|nausea)\b/iu
        },
        {
          name: 'sad',
          patterns:
            /\b(?:sad|depressed|down|unhappy|miserable|empty|numb)\b|(?:غمگین|ناراحت|افسرده|بی‌حال)/iu
        },
        {
          name: 'hopeless',
          patterns:
            /\b(?:hopeless|despair|giving up|can'?t go on|no point)\b|(?:ناشاد|ناامید|بی‌امید)/iu
        },
        {
          name: 'overwhelmed',
          patterns:
            /\b(?:overwhelmed|drowning|can'?t cope|too much|suffocating)\b|(?:درمانده|غرق|طاقت فرسا)/iu
        },
        {
          name: 'ashamed',
          patterns:
            /\b(?:ashamed|embarrassed|guilty|humiliated)\b|(?:شرمنده|خجالت|گناهکار)/iu
        },
        {
          name: 'jealous',
          patterns: /\b(?:jealous|envious|resentful)\b|(?:حسود|حسرت)/iu
        },
        {
          name: 'hopeful',
          patterns: /\b(?:hopeful|optimistic|encouraged)\b|(?:امیدوار|خوشبین)/iu
        },
        {
          name: 'grateful',
          patterns:
            /\b(?:grateful|thankful|blessed|appreciative)\b|(?:سپاسگزار|قدردان|شکرگزار)/iu
        }
      ];
      for (const emotion of emotions) {
        if (emotion.patterns.test(text)) {
          return emotion.name;
        }
      }
      const score = scoreSentiment(text, this.lang.sentimentLexicon);
      if (score <= -2) {
        return 'sad';
      }
      if (score >= 2) {
        return 'happy';
      }
      return 'neutral';
    },

    _detectPrimaryEmotion(text) {
      this.lastDetectedEmotion = this._computePrimaryEmotion(text);
      return this.lastDetectedEmotion;
    },

    _calibrateEmotionalTone(reply, detectedEmotion) {
      const calibration = this.lang.emotionCalibration;
      if (!calibration || !calibration[detectedEmotion]) {
        return reply;
      }
      if (Math.random() > EMOTION_PREFIX_CHANCE) {
        return reply;
      }
      const prefix = calibration[detectedEmotion];
      return `${prefix} ${reply}`.trim();
    },

    // ======================================================================
    // Mixed language detection and conversation phase management
    //
    // Mixed-language detection: checks whether the user's input contains
    // a meaningful proportion of characters outside the active language
    // pack's script range, which suggests bilingual input. When detected,
    // with 60% probability the engine returns a language-pool redirect
    // asking the user to stick to one language.
    //
    // Phase management: advances the conversation through four stages:
    //   - new: No interaction yet
    //   - orienting: First few turns, establishing presence
    //   - engaging: User has shared substantive content
    //   - deepening: Extended conversation with established topics
    // The phase determines which greeting pool is used for openings and
    // which response strategies are available.
    // ======================================================================

    _handleMixedLanguage(text) {
      if (!this._isMixedLanguage(text)) {
        return null;
      }
      if (Math.random() > MIXED_LANGUAGE_REDIRECT_CHANCE) {
        return null;
      }
      const pool = Array.isArray(this.lang.mixedLanguageResponses)
        ? this.lang.mixedLanguageResponses
        : null;
      return pool && pool.length ? this._pickVaried(pool) : null;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
