/**
 * Darya - emotion computation and tone calibration.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  const {
    EMOTION_PREFIX_CHANCE,
    MIXED_LANGUAGE_REDIRECT_CHANCE,
    EMOTION_SHIFT_INTERVAL,
    SAFETY_CRITICAL_TOPICS,
    scoreSentiment
  } = global.DaryaUtils;

  const BREATHING_EMOTIONS = new Set([
    'angry',
    'anxious',
    'fear',
    'overwhelmed'
  ]);

  const BREATHING_CONTEXT_TOPICS = new Set([
    'anger',
    'anxiety',
    'burnout',
    'climate_anxiety',
    'doom_spending',
    'overwork_stuck',
    'panic_attack',
    'sleep',
    'stress'
  ]);

  const BREATHING_BLOCKED_TOPICS = new Set([
    'abuse_disclosure',
    'eating_distress',
    'harassment_threat',
    'impaired_driving',
    'psychosis_risk',
    'self_injury'
  ]);

  const BREATHING_BLOCKED_DIALOGUE_ACTS = new Set([
    'acknowledgement',
    'gratitude',
    'greeting',
    'safety',
    'test_input'
  ]);

  // Neutral wording does not imply recovery when the actual subject remains
  // an active burden. Generic language labels such as feeling are omitted so
  // an explicit "I feel hopeful now" can still acknowledge a real shift.
  const EMOTIONAL_SHIFT_BLOCKING_TOPICS = new Set([
    'abuse_disclosure',
    'anger',
    'anxiety',
    'burnout',
    'caregiver',
    'chronic_illness',
    'depression',
    'divorce',
    'eating_distress',
    'grief',
    'harassment_threat',
    'health',
    'health_pain',
    'health_symptoms',
    'housing',
    'housing_pressure',
    'loneliness',
    'money',
    'online_harassment',
    'panic_attack',
    'parenting',
    'pet_loss',
    'psychosis_risk',
    'sadness',
    'safety',
    'safety_method',
    'school',
    'self_esteem',
    'stress',
    'third_party_risk',
    'work'
  ]);

  const BREATHING_PATTERNS = {
    en: {
      directRequest:
        // eslint-disable-next-line max-len
        /\b(?:breathing exercise|breathwork|4[ -]?7[ -]?8 breathing|box breathing|breathe with me|help me (?:to )?breathe|guide me (?:through )?(?:a )?breathing exercise|walk me through (?:a )?breathing exercise|(?:can|could|would) we (?:do|try|start) (?:a |some )?breathing exercise|i (?:want|need) (?:to do )?(?:a )?breathing exercise|calm me down)\b/iu,
      informational:
        // eslint-disable-next-line max-len
        /\b(?:(?:what (?:is|are)|explain|tell me about|benefits? of|science of|research on|how does|why does|symptoms? of|difference between)\b[^\n]*(?:breath(?:ing|work)?|anxiety|stress|panic)|(?:can|does) (?:anxiety|stress|panic)\b|how (?:should|do) i breathe (?:while|during|when)|breathing (?:for|while|during) (?:running|swimming|singing|lifting|exercise|yoga))\b/iu,
      urgentMedical:
        // eslint-disable-next-line max-len
        /\b(?:chest pain|cannot breathe|can'?t breathe|can not breathe|difficulty breathing|trouble breathing|shortness of breath|faint(?:ing|ed)?|blue lips|choking|wheezing)\b/iu,
      resolved:
        // eslint-disable-next-line max-len
        /\b(?:(?:panic|anxiety|stress) (?:is|has|has now)? ?(?:over|gone|passed)|i (?:feel|am) (?:calm|fine|okay|better) now|i(?:'m| am) no longer (?:anxious|stressed|panicking|overwhelmed)|used to (?:be|feel|get) (?:anxious|stressed|panic attacks?)[^\n]*\b(?:now|today)\b[^\n]*\b(?:calm|fine|okay|better))\b/iu,
      denial:
        // eslint-disable-next-line max-len
        /\b(?:i(?:'m| am) not|i do not feel|i don'?t feel|not feeling) (?:anxious|stressed|panicked|panicky|angry|overwhelmed)\b/iu,
      historical:
        // eslint-disable-next-line max-len
        /\b(?:last (?:night|week|month|year)|yesterday|years? ago|months? ago|weeks? ago|when i was (?:a child|younger))\b/iu,
      currentMarker:
        /\b(?:right now|still|again|at this moment|currently|today)\b/iu,
      thirdParty:
        // eslint-disable-next-line max-len
        /\b(?:(?:my|a|the) (?:friend|partner|spouse|mother|mom|father|dad|sister|brother|child|son|daughter|coworker|student|client)[^\n]*(?:anxious|stressed|panicking|overwhelmed|angry)|(?:he|she|they) (?:is|are|feels?|keeps? feeling) (?:anxious|stressed|panicky|overwhelmed|angry))\b/iu,
      selfDistress:
        // eslint-disable-next-line max-len
        /\b(?:i(?:'m| am| feel| keep feeling| get| have been| was) (?:so |very |really |extremely |completely )?(?:anxious|stressed|panicking|panicky|overwhelmed|on edge|furious|angry|terrified|shaking|spiraling)|i(?:'m| am| feel) (?:very|really|extremely) (?:scared|afraid|nervous)|i(?:'m| am) (?:having|about to have) (?:a )?panic attack|i (?:can'?t|cannot) (?:calm down|settle down|cope|stop (?:shaking|spiraling|panicking))|my (?:heart is racing|mind won'?t stop|thoughts are racing|hands are shaking|body is shaking|anxiety is|stress is)|(?:work|this|everything|the pressure|the deadline|this deadline) (?:is )?(?:overwhelming me|stressing me out|making me anxious))\b/iu,
      impliedDistress:
        // eslint-disable-next-line max-len
        /^(?:(?:so|very|really|extremely) )?(?:anxious|stressed|panicking|overwhelmed|spiraling|furious|on edge)(?: right now| again| today)?[.!?]*$|\b(?:it'?s|it is|this is) happening again\b/iu,
      eagerIdiom: /\banxious to (?:see|know|hear|find out|start|begin)\b/iu
    },
    fa: {
      directRequest:
        // eslint-disable-next-line max-len
        /(?:تمرین تنفس|تمرین نفس|تنفس ۴[ -]?۷[ -]?۸|تنفس 4[ -]?7[ -]?8|تنفس جعبه‌ای|تنفس جعبه ای|با من نفس بکش|کمکم کن نفس بکشم|تنفسم را راهنمایی کن|تنفسم رو راهنمایی کن|یک تمرین تنفس میخوام|یک تمرین تنفس می‌خوام|میخوام تمرین تنفس کنم|می‌خوام تمرین تنفس کنم|آرومم کن|آرامم کن)/u,
      informational:
        // eslint-disable-next-line max-len
        /(?:(?:چیست|چیه|یعنی چی|توضیح بده|درباره.{0,12}بگو|فواید|فایده|پژوهش|علم|علایم|علائم|نشانه‌های|نشانه های|فرق).{0,28}(?:تنفس|نفس|اضطراب|استرس|پانیک)|(?:اضطراب|استرس|پانیک).{0,12}(?:چیست|چیه|چه علایمی|چه علائمی|چه نشانه)|چطور (?:موقع|هنگام|حین) (?:دویدن|شنا|آواز|وزنه|ورزش|یوگا) نفس بکشم|تنفس (?:برای|موقع|هنگام|حین) (?:دویدن|شنا|آواز|وزنه|ورزش|یوگا))/u,
      urgentMedical:
        // eslint-disable-next-line max-len
        /(?:درد قفسه سینه|درد سینه|نمی ?تونم نفس بکشم|نمیتونم نفس بکشم|نمی‌توانم نفس بکشم|نفس نمیاد|نفس بالا نمیاد|تنگی نفس|مشکل تنفسی|غش کردم|دارم غش می‌کنم|لبهام کبود|لب‌هایم کبود|حس خفگی|خس ?خس)/u,
      resolved:
        // eslint-disable-next-line max-len
        /(?:(?:پانیک|پنیک|اضطراب|استرس|حمله).{0,10}(?:تموم شد|تمام شد|رد شد|گذشت)|الان (?:آرومم|آرامم|خوبم|بهترم)|دیگه (?:مضطرب|نگران|عصبانی|آشفته) نیستم|قبلا.{0,16}(?:اضطراب|استرس|پانیک).{0,20}(?:ولی|اما).{0,10}(?:الان|حالا).{0,8}(?:آرومم|آرامم|خوبم|بهترم))/u,
      denial:
        /(?:(?:من )?(?:مضطرب|نگران|عصبانی|آشفته|وحشت زده) نیستم|استرس ندارم|اضطراب ندارم|پانیک نکردم|پنیک نکردم)/u,
      historical:
        /(?:دیشب|دیروز|هفته پیش|ماه پیش|سال پیش|چند سال پیش|چند ماه پیش|وقتی بچه بودم|قبلا)/u,
      currentMarker: /(?:الان|همین حالا|هنوز|دوباره|باز|امروز)/u,
      thirdParty:
        // eslint-disable-next-line max-len
        /(?:(?:دوستم|رفیقم|همسرم|مادرم|مامانم|پدرم|بابام|خواهرم|برادرم|بچه‌ام|بچهم|پسرم|دخترم|همکارم|دانش‌آموزم).{0,24}(?:مضطرب|استرس|پانیک|پنیک|نگران|عصبانی|آشفته)|(?:اون|او|ایشون|آنها|اونا).{0,12}(?:مضطرب|استرس|پانیک|پنیک|نگران|عصبانی|آشفته))/u,
      selfDistress:
        // eslint-disable-next-line max-len
        /(?:من.{0,8}(?:خیلی |شدیدا |واقعاً |واقعا )?(?:مضطرب|عصبانی|آشفته|وحشت زده|وحشت‌زده|کفری)(?:م| هستم)?|من.{0,8}(?:خیلی|شدیدا|واقعاً|واقعا) نگران(?:م| هستم)?|(?:خیلی |شدیدا |واقعاً |واقعا )?(?:مضطربم|عصبانیم|آشفته‌ام|آشفته ام|وحشت‌زده‌ام|وحشت زده ام|کفریم)|(?:خیلی|شدیدا|واقعاً|واقعا) نگرانم|(?:خیلی|واقعاً|واقعا) می ?ترسم|(?:استرس|اضطراب|دلشوره) دارم|(?:استرس|اضطراب|دلشوره)(?:م| من)?.{0,30}(?:زیاده|شدیده|بالاست|داره خفه‌ام می‌کنه|داره خفه ام می‌کنه)|دارم (?:پانیک|پنیک) می ?کنم|حمله (?:پانیک|پنیک|وحشت) (?:دارم|گرفتم)|نمی ?تونم.{0,20}(?:آروم|آرام) (?:بشم|شم)|نمیتونم.{0,20}(?:آروم|آرام) (?:بشم|شم)|نمی ?تونم ادامه بدم|نمیتونم ادامه بدم|دیگه طاقت ندارم|دارم کم میارم|دارم می ?لرزم|دستام می ?لرزه|قلبم تند می ?زنه|ذهنم (?:ول نمی‌کنه|آروم نمی‌گیره)|فکرام (?:ولم نمی‌کنن|تند میرن)|همه چی داره منو مضطرب می‌کنه)/u,
      impliedDistress:
        // eslint-disable-next-line max-len
        /^(?:(?:خیلی|شدیدا|واقعاً|واقعا) )?(?:مضطربم|استرس دارم|پنیک کردم|پانیک کردم|آشفته‌ام|آشفته ام|عصبانیم|کفریم)[!.؟]*$|(?:دوباره|باز) (?:شروع شد|داره میاد|همونه)/u,
      eagerIdiom: /$^/u
    }
  };

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
            // The Persian side is wrapped in word-boundary lookarounds:
            // «فوت» (death) previously matched inside «فوتبال» (football)
            // and «فوتسال» (futsal), so a "which sport is better"
            // question was read as grief and got a "من اینجا با تو
            // هستم." prefix. The lookarounds keep only standalone words.
            // eslint-disable-next-line max-len
            /\b(?:grief|loss|died|passed away|gone|miss(?:ing)?|mourn)\b|(?<!\p{L})(?:فقدان|فوت|از دست دادن|داغ|سوگ)(?!\p{L})/iu
        },
        {
          name: 'fear',
          patterns:
            // «شوکه» (shocked) and «shook» are deliberately absent: both
            // usually mean surprise or being impressed in everyday speech
            // («شوکه شدم، آفرین!»), not terror. Counting them here made a
            // compliment plus a joke request read as a fear disclosure.
            // eslint-disable-next-line max-len
            /\b(?:terrified|frightened|scared\s+(?:to\s+death|stiff|shitless|witless)|panic\s+(?:attack|mode)|phobia|horror|petrified|dread)\b|(?:لرزیدن|هراس|فوبیا|ترس\s+مرگ|دلهره|وحشت\s+زده)/iu
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

    /**
     * Returns the enriched emotional analysis of the last turn
     * (emotion, valence, arousal, dominance, intense) from the
     * emotion analyzer, or null when the module is unavailable.
     * @returns {object|null}
     */
    _currentEmotionAnalysis() {
      return this._lastEmotionAnalysis || null;
    },

    /**
     * Decides whether the current turn should surface the optional breathing
     * control. This is intentionally narrower than `lastTurnNeedsCare`:
     * grief, illness, ordinary health talk, and other serious subjects need a
     * caring reply, but a breathing prompt can feel intrusive unless the user
     * requests it or describes present, first-person high-arousal distress.
     * Safety-critical and urgent physical-symptom turns never get a competing
     * control, and informational, third-person, negated, historical, and
     * resolved mentions are filtered out.
     * @param {string} matchingText - Normalized current user input
     * @returns {boolean}
     */
    _shouldOfferBreathing(matchingText) {
      const text = String(matchingText || '').trim();
      if (!text) {
        return false;
      }

      const patterns =
        this.lang && this.lang.code === 'fa'
          ? BREATHING_PATTERNS.fa
          : BREATHING_PATTERNS.en;
      const topics = new Set(this.currentTurnTopics || []);
      const hasBlockedTopic = [...topics].some(
        (topic) =>
          SAFETY_CRITICAL_TOPICS.has(topic) ||
          BREATHING_BLOCKED_TOPICS.has(topic)
      );

      // Urgent care and protective guidance must remain the only salient
      // next step. The breathing control is optional support, not triage.
      if (hasBlockedTopic || patterns.urgentMedical.test(text)) {
        return false;
      }

      // A mention of breathing or anxiety is not necessarily a request for
      // regulation. Education, sport technique, resolved states, and a plain
      // denial all stay ordinary conversation turns.
      if (
        patterns.informational.test(text) ||
        patterns.resolved.test(text) ||
        patterns.denial.test(text) ||
        patterns.eagerIdiom.test(text)
      ) {
        return false;
      }

      if (
        patterns.historical.test(text) &&
        !patterns.currentMarker.test(text)
      ) {
        return false;
      }

      // An unambiguous request wins over dialogue-act filtering. This keeps
      // polite forms such as "Thanks, can we try a breathing exercise?"
      // actionable while the safety and medical guards above still win.
      if (patterns.directRequest.test(text)) {
        return true;
      }

      if (BREATHING_BLOCKED_DIALOGUE_ACTS.has(this.currentTurnDialogueAct)) {
        return false;
      }

      const hasSelfDistress = patterns.selfDistress.test(text);
      if (patterns.thirdParty.test(text) && !hasSelfDistress) {
        return false;
      }

      const hasImpliedDistress = patterns.impliedDistress.test(text);
      if (!hasSelfDistress && !hasImpliedDistress) {
        return false;
      }

      const analysis = this._currentEmotionAnalysis();
      const hasHighArousalEmotion =
        !!analysis && BREATHING_EMOTIONS.has(analysis.emotion);
      const hasBreathingContext = [...topics].some((topic) =>
        BREATHING_CONTEXT_TOPICS.has(topic)
      );

      // A first-person distress pattern is already explicit enough to stand
      // alone. Short recurrence phrases such as "it is happening again"
      // require the engine's current topic or emotion context so an unrelated
      // "again" can never surface the control.
      return (
        hasSelfDistress ||
        (hasImpliedDistress && (hasBreathingContext || hasHighArousalEmotion))
      );
    },

    /**
     * True when the user's emotional arc moved meaningfully toward the
     * positive since the previous turn (e.g. from sad to hopeful).
     * Requires the emotion analyzer and at least two trajectory samples.
     * @returns {boolean}
     */
    _emotionShiftedPositive() {
      if (!global.DaryaEmotionAnalyzer || !this.emotionTrajectory) {
        return false;
      }
      return global.DaryaEmotionAnalyzer.isPositiveShift(
        this.emotionTrajectory.previous(),
        this.emotionTrajectory.last()
      );
    },

    /**
     * True when the user's emotional arc moved meaningfully toward the
     * negative since the previous turn. Used to soften the reply and
     * avoid humor on a turn where the user is sliding down.
     * @returns {boolean}
     */
    _emotionShiftedNegative() {
      if (!global.DaryaEmotionAnalyzer || !this.emotionTrajectory) {
        return false;
      }
      return global.DaryaEmotionAnalyzer.isNegativeShift(
        this.emotionTrajectory.previous(),
        this.emotionTrajectory.last()
      );
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

    /**
     * Returns a gentle acknowledgment line when the user's emotional state
     * has visibly improved across turns (trajectory shifted positive), or
     * null. This is the "memory that notices change" touch: it shows Darya
     * has been following the emotional arc, not just reacting to the last
     * line. It is rate-limited so it does not nag, never fires on heavy or
     * safety turns, and uses the language's emotionShiftLines pool.
     * @returns {string|null}
     */
    _emotionalShiftLine() {
      if (
        !this.lang.emotionShiftLines ||
        this.lang.emotionShiftLines.length === 0 ||
        this.currentTurnTopics.some((topic) =>
          EMOTIONAL_SHIFT_BLOCKING_TOPICS.has(topic)
        ) ||
        this.memory.turnCount - (this._lastEmotionShiftTurn || -Infinity) <
          EMOTION_SHIFT_INTERVAL
      ) {
        return null;
      }
      // Only acknowledge when the user is recovering from a genuinely heavy
      // state: the previous turn must have been negatively valenced, and
      // the current turn must be a clear positive shift. This prevents
      // "you sound lighter than before" firing off a neutral greeting into
      // an excited statement, where there was nothing heavy to recover from.
      if (
        !this._emotionShiftedPositive() ||
        !global.DaryaEmotionAnalyzer ||
        !this.emotionTrajectory
      ) {
        return null;
      }
      const prevEmotion = this.emotionTrajectory.previous();
      const prevDims =
        global.DaryaEmotionAnalyzer.EMOTION_DIMENSIONS?.[prevEmotion];
      if (!prevDims || prevDims.valence >= 0) {
        return null;
      }
      this._lastEmotionShiftTurn = this.memory.turnCount;
      // Bypass the question budget: this is a rare, context-aware human
      // touch, not a new question barrage, so it must always land instead
      // of being stripped and swapped for a generic fallback.
      return this._pickVaried(this.lang.emotionShiftLines, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      });
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
