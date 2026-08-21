/**
 * Darya - factual knowledge layer (assembly + lookup).
 * Combines the shelf, fact chunks, and fun-fact pool registered by the
 * knowledge-* part files, then exposes the lookup, genre, fragment, and
 * fun-fact APIs. All content is offline; no network calls.
 */
(function (global) {
  'use strict';

  const SHELF = global.DaryaKnowledgeShelf;
  const FACTS = (global.DaryaFactChunks || []).reduce(
    (acc, chunk) => acc.concat(chunk),
    []
  );
  const FUN_FACTS = global.DaryaFunFacts;
  const { parseListCount, trimListToCount } = global.DaryaKnowledgeLists;

  const LOOKUP_MIN_SCORE = 6;

  // Persian weak-word guard: «چند وقته» (for a while), «چند ماهه», and
  // «چقدر ... دوست دارم» are duration/preference statements, not
  // questions. Without it the bare «چند»/«چقدر» framing would unlock
  // weak topic words and «چند وقته فوتبال بازی نکردم» would get the
  // football encyclopedia entry instead of empathy (the "knowledge:
  // psychology, sports, history" test pins exactly these statements).
  const FA_WEAK_STATEMENT =
    /(?:چند|چقدر)\s*(?:وقته|وقتیه|وقتی|مدته|مدتیه|روزه|ماهه|ساله|سالی)|چقدر\s*.{0,12}(?:دوست\s+دارم|علاقه\s+دارم)/u;

  // Where-to-buy phrases boost the marketplace fact so it beats any
  // item-specific buying guide ("where to buy a phone" wants stores).
  const WHERE_TO_BUY_MARKERS = {
    fa: /کجا بخرم|از کجا بخرم|کجا خرید کنم|کدوم سایت بخرم|کجا قیمت|مقایسه قیمت/u,
    en: /where (?:to|can|should|do) (?:i )?buy|which site should i buy from|compare prices|price comparison|best price/i
  };
  const MARKETPLACE_MARKER_BONUS = 25;

  // A clear framed question that names a single short topic word
  // ("what is rizz?", "cbt چیه", "what is cbt") deserves the fact even
  // when the topic is only a few letters. Without this flat bonus, the
  // confidence floor (score/40) is length-proportional, so a 3-letter
  // weak word like "cbt" scores 9 and falls below the 0.35 override
  // threshold, while "cognitive behavioral therapy" sails through. The
  // bonus is gated on the same framedWeakGuard + weakSafe path that
  // already proves the word is a question, not a stray match, so it
  // cannot unlock bare topic mentions.
  const FRAMED_TOPIC_BONUS = 10;

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /** Whole-word presence check that works for Persian and Latin text. */
  function wordInText(text, word) {
    const escaped = escapeRegExp(word);
    return new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'u').test(text);
  }

  // Framing words that mark a message as a knowledge question. Weak
  // keywords only count when such framing is present (or a hint appears),
  // so "مشتری" in "مشتری رو چطور جذب کنم" (a customer) never matches the
  // Jupiter entry while "مشتری چیه" does.
  const FRAMING = {
    fa: [
      'درباره',
      'راجع به',
      'توضیح',
      'چیست',
      'چیه',
      'چطور',
      'چگونه',
      'یعنی',
      'معنی',
      'بگو',
      'بگی',
      // «بهم» and «برام» are the everyday colloquial "to me":
      // «چندتا فیلم بهم معرفی کن» is a recommendation request, and the
      // request marker must open the knowledge door exactly like «برام».
      'بهم',
      'به من',
      'برام',
      'تعریف',
      'اسم',
      'یاد بده',
      'پیشنهاد',
      // «معرفی» (introduce/recommend) is the FA twin of "recommend";
      // without it, «فیلم سینمایی بهم معرفی کن» scores as a bare weak
      // hit and falls below the override confidence floor.
      'معرفی',
      'راه',
      'روش',
      'بهترین',
      'کدام',
      // «چندتا»/«چند» ("a few/some") mark list requests in Persian
      // («چندتا فیلم بگو»), the same job "some" does in English.
      'چندتا',
      'چند'
    ],
    en: [
      'tell',
      'explain',
      'meaning',
      'define',
      'describe',
      'what is',
      'what are',
      'what does',
      'about',
      'learn',
      'teach',
      'advice',
      'tips',
      'how to',
      'recommend',
      'suggest',
      // "name some X" is a common recommendation framing
      // ("name some good youtubers", "name some video games"); it must
      // count as framing so the weak topic words reach full weight.
      'name some',
      'name a few',
      'some',
      // "best"/"top"/"favorite" are the recommendation framings that
      // «بهترین»/«کدام» cover on the Persian side: "best movie of all
      // time", "top 10 games", "favorite books" used to fail the
      // framing gate and fall to the unknown pool.
      'best',
      'top',
      'favorite',
      // "is brain rot a real thing?", "is rizz really a thing?" phrase a
      // factual existence question without the usual what-is framing. The
      // topic word is weak, so without a framing word the lookup would not
      // engage; "a real thing"/"a thing" opens the door (the lookup still
      // gates the answer on a matching topic word).
      'a real thing',
      'really a thing',
      'actually a thing',
      'a thing'
    ]
  };

  /**
   * Scores the normalized user input against the factual layer and
   * returns the best confident match, or null when nothing qualifies.
   *
   * The caller (the engine) passes `matchingText`: already lowercased
   * for Latin, punctuation stripped, and ZWNJ collapsed to spaces.
   *
   * @param {string} text - Normalized matching text
   * @param {string} langCode - 'fa' or 'en'
   * @returns {{topic: string, confidence: number, text: string}|null}
   */
  function lookup(text, langCode) {
    if (!text || typeof text !== 'string') {
      return null;
    }
    const isFa = langCode === 'fa';
    const normalized = text.toLowerCase().replace(/\s+/gu, ' ').trim();
    const lower = normalized
      .replace(
        /^(?:switch|change)(?: the)? (?:topic|topics|subject)(?: to)?\s*/i,
        ''
      )
      .replace(/^(?:موضوع را|موضوع رو) عوض کن(?: به)?\s*/u, '')
      .trim();
    if (!lower) {
      return null;
    }
    const framing = FRAMING[isFa ? 'fa' : 'en'] || [];
    const hasFraming = framing.some((word) => lower.includes(word));

    let best = null;
    for (const fact of FACTS) {
      // “Switch topics” is a conversation command, not Nintendo Switch.
      // A platform fact may use the weak word “switch”, but only a real
      // game request is allowed to activate it in this phrasing.
      if (
        fact.id === 'games_by_platform' &&
        /\bswitch (?:the )?topics?\b/i.test(lower) &&
        !/\b(?:game|games|gaming|nintendo)\b/i.test(lower)
      ) {
        continue;
      }
      let score = 0;
      let exact = false;
      let matchedAny = false;

      for (const kw of fact.keywords || []) {
        const k = kw.toLowerCase();
        if (lower === k) {
          exact = true;
        }
        const hit = isFa
          ? lower.includes(k)
          : new RegExp(`\\b${escapeRegExp(k)}\\b`, 'iu').test(lower);
        if (hit) {
          score += k.length * 2;
          matchedAny = true;
        }
      }

      for (const kw of fact.weak || []) {
        const k = kw.toLowerCase();
        if (!wordInText(lower, k)) {
          continue;
        }
        matchedAny = true;
        if (lower === k) {
          exact = true;
          score += k.length * 2;
          continue;
        }
        const hintHit = (fact.hints || []).some((hint) =>
          lower.includes(hint.toLowerCase())
        );
        const framedWeakGuard = hasFraming && !FA_WEAK_STATEMENT.test(lower);
        if (framedWeakGuard && fact.weakSafe) {
          // A framed question ("چطور", "what is") with a topic word is a
          // solid signal even without a hint: "کنکور چطوریه" deserves the
          // konkur answer. Full keyword weight so short topic words like
          // "کنکور" or "مریخ" still clear the confidence floor.
          score += k.length * 2 + FRAMED_TOPIC_BONUS;
        } else if (hintHit) {
          // Hint-confirmed weak words ("مریخ" + "سیاره") carry the same
          // weight as a keyword: the hint proves the intended sense.
          score += k.length * 2;
        }
      }

      if (!matchedAny) {
        continue;
      }
      if (exact) {
        score += 12;
      }
      if (hasFraming) {
        score += 3;
      }
      for (const hint of fact.hints || []) {
        if (lower.includes(hint.toLowerCase())) {
          score += 3;
        }
      }
      if (
        fact.id === 'buying_marketplaces' &&
        WHERE_TO_BUY_MARKERS[isFa ? 'fa' : 'en'].test(lower)
      ) {
        score += MARKETPLACE_MARKER_BONUS;
      }
      if (score <= 0) {
        continue;
      }
      if (!best || score > best.score) {
        best = { fact, score };
      }
    }

    if (!best || best.score < LOOKUP_MIN_SCORE) {
      return null;
    }
    // Entity refinement: when the winning fact is the capitals list and
    // a specific country was named, answer with that single capital in
    // one sentence instead of dumping the whole shelf. The list stays
    // the fallback for a generic "name some capitals" ask.
    if (best.fact.id === 'world_capitals') {
      const singleCapitalAnswer = extractSingleCapital(lower, isFa);
      if (singleCapitalAnswer) {
        const requestedCount = parseListCount(lower, langCode);
        return {
          topic: best.fact.id,
          confidence: Math.min(1, best.score / 40),
          text: requestedCount
            ? best.fact[isFa ? 'fa' : 'en']
            : singleCapitalAnswer
        };
      }
    }
    const requested = parseListCount(lower, langCode);
    const rawText = trimListToCount(
      isFa ? best.fact.fa : best.fact.en,
      requested,
      langCode
    );
    // Facts that mention the shipped version use a {version} placeholder
    // so the offline shelf and scripts/bump-version.mjs never drift. The
    // constant is read at call time because utils-constants.js loads
    // after this file in the classic-script dependency order.
    const version =
      (global.DaryaUtilsConstants &&
        global.DaryaUtilsConstants.DARYA_VERSION) ||
      '';
    return {
      topic: best.fact.id,
      confidence: Math.min(1, best.score / 40),
      text: version ? rawText.replace(/\{version\}/gu, version) : rawText
    };
  }

  // Country-name aliases for the single-capital refinement, in both
  // languages. The capitals shelf text is the source of truth for the
  // city names; this map only locates which country was asked about.
  const CAPITAL_COUNTRY_ALIASES = [
    {
      fa: 'ایران',
      en: ['iran'],
      nameEn: 'Iran',
      cityFa: 'تهران',
      cityEn: 'Tehran'
    },
    {
      fa: 'فرانسه',
      en: ['france'],
      nameEn: 'France',
      cityFa: 'پاریس',
      cityEn: 'Paris'
    },
    {
      fa: 'ترکیه',
      en: ['turkey'],
      nameEn: 'Turkey',
      cityFa: 'آنکارا',
      cityEn: 'Ankara'
    },
    {
      fa: 'آلمان',
      en: ['germany'],
      nameEn: 'Germany',
      cityFa: 'برلین',
      cityEn: 'Berlin'
    },
    {
      fa: 'ایتالیا',
      en: ['italy'],
      nameEn: 'Italy',
      cityFa: 'رم',
      cityEn: 'Rome'
    },
    {
      fa: 'انگلیس',
      en: ['england', 'uk', 'britain', 'united kingdom'],
      nameEn: 'the UK',
      cityFa: 'لندن',
      cityEn: 'London'
    },
    {
      fa: 'بریتانیا',
      en: [],
      nameEn: 'the UK',
      cityFa: 'لندن',
      cityEn: 'London'
    },
    {
      fa: 'ژاپن',
      en: ['japan'],
      nameEn: 'Japan',
      cityFa: 'توکیو',
      cityEn: 'Tokyo'
    },
    {
      fa: 'چین',
      en: ['china'],
      nameEn: 'China',
      cityFa: 'پکن',
      cityEn: 'Beijing'
    },
    {
      fa: 'روسیه',
      en: ['russia'],
      nameEn: 'Russia',
      cityFa: 'مسکو',
      cityEn: 'Moscow'
    },
    {
      fa: 'مصر',
      en: ['egypt'],
      nameEn: 'Egypt',
      cityFa: 'قاهره',
      cityEn: 'Cairo'
    },
    {
      fa: 'کانادا',
      en: ['canada'],
      nameEn: 'Canada',
      cityFa: 'اتاوا',
      cityEn: 'Ottawa'
    },
    {
      fa: 'استرالیا',
      en: ['australia'],
      nameEn: 'Australia',
      cityFa: 'کانبرا',
      cityEn: 'Canberra'
    },
    {
      fa: 'اسپانیا',
      en: ['spain'],
      nameEn: 'Spain',
      cityFa: 'مادرید',
      cityEn: 'Madrid'
    },
    {
      fa: 'هند',
      en: ['india'],
      nameEn: 'India',
      cityFa: 'دهلی‌نو',
      cityEn: 'New Delhi'
    },
    {
      fa: 'برزیل',
      en: ['brazil'],
      nameEn: 'Brazil',
      cityFa: 'برازیلیا',
      cityEn: 'Brasilia'
    }
  ];

  /**
   * Returns a one-sentence answer for "capital of X" when exactly one
   * known country is named in the text, otherwise null (generic asks
   * keep the full list).
   * @param {string} lower - Lowercased user text.
   * @param {boolean} isFa - Whether the active language is Persian.
   * @returns {string|null}
   */
  function extractSingleCapital(lower, isFa) {
    const hits = CAPITAL_COUNTRY_ALIASES.filter((entry) =>
      isFa
        ? lower.includes(entry.fa)
        : entry.en.some((alias) =>
            new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'iu').test(lower)
          )
    );
    if (hits.length !== 1) {
      return null;
    }
    const hit = hits[0];
    return isFa
      ? `پایتخت ${hit.fa} ${hit.cityFa} است.`
      : `The capital of ${hit.nameEn} is ${hit.cityEn}.`;
  }

  // Genre words per language for refining a movie request ("in horror
  // genre please", "ترسناک"), mapped to the matching genre fact. Ordered
  // most-specific-first: "dark comedy" contains "comedy" and "کمدی سیاه"
  // contains "کمدی", so the specific list must be checked before the
  // general one; short_comedy likewise precedes short_series and comedy.
  const GENRE_WORDS = {
    fa: {
      dark_comedy: ['کمدی سیاه'],
      short_comedy: ['سریال کوتاه طنز', 'سریال طنز کوتاه', 'کمدی کوتاه'],
      horror: ['ترسناک', 'وحشت'],
      romantic: ['عاشقانه', 'رمانتیک'],
      comedy: ['کمدی', 'طنز'],
      fantasy: ['فانتزی'],
      short_series: ['سریال کوتاه', 'مینی‌سریال', 'مینی سریال'],
      true_story: ['بر اساس واقعیت', 'داستان واقعی'],
      thriller: ['هیجانی', 'دلهره‌آور', 'دلهرهآور', 'دلهره آور'],
      sci_fi: ['علمی تخیلی', 'علمی-تخیلی'],
      documentary: ['مستند'],
      animation: ['انیمیشن', 'انیمیشنی'],
      feel_good: [
        'حال خوب کن',
        'حال‌خوب‌کن',
        'حالخوب‌کن',
        'شاد و امیدبخش',
        'روحیه‌بخش'
      ]
    },
    en: {
      dark_comedy: ['dark comedy', 'black comedy'],
      short_comedy: ['short comedy', 'comedy mini series', 'comedy miniseries'],
      horror: ['horror', 'scary'],
      romantic: ['romantic', 'romance'],
      comedy: ['comedy', 'funny'],
      fantasy: ['fantasy'],
      short_series: [
        'short series',
        'mini series',
        'miniseries',
        'limited series'
      ],
      true_story: [
        'true story',
        'true events',
        'based on real',
        'based on a true'
      ],
      thriller: ['thriller', 'suspense'],
      sci_fi: ['sci fi', 'sci-fi', 'scifi', 'science fiction'],
      documentary: ['documentary', 'documentaries'],
      animation: ['animation', 'animated', 'cartoon'],
      feel_good: [
        'feel good',
        'feel-good',
        'uplifting',
        'heartwarming',
        'heart-warming',
        'cheerful'
      ]
    }
  };
  const GENRE_FACT_IDS = {
    horror: 'movies_horror',
    romantic: 'movies_romantic',
    comedy: 'movies_comedy',
    dark_comedy: 'movies_dark_comedy',
    short_comedy: 'movies_short_comedy_series',
    fantasy: 'movies_fantasy',
    short_series: 'movies_short_series',
    true_story: 'movies_true_story',
    thriller: 'movies_thriller',
    sci_fi: 'movies_sci_fi',
    documentary: 'movies_documentary',
    animation: 'movies_animation',
    feel_good: 'movies_feel_good'
  };

  /**
   * Detects a genre word in a follow-up message and returns the matching
   * genre fact, or null. Used for sequential refinement: "suggest me
   * three movies" then "in horror genre please".
   * @param {string} text - Normalized matching text
   * @param {string} langCode - 'fa' or 'en'
   * @returns {{topic: string, text: string}|null}
   */
  function lookupGenre(text, langCode) {
    if (!text) {
      return null;
    }
    const lower = text.toLowerCase();
    const words = GENRE_WORDS[langCode === 'fa' ? 'fa' : 'en'];
    for (const [genre, terms] of Object.entries(words)) {
      if (terms.some((term) => lower.includes(term))) {
        const fact = FACTS.find((f) => f.id === GENRE_FACT_IDS[genre]);
        if (fact) {
          const requested = parseListCount(lower, langCode);
          const text = trimListToCount(
            langCode === 'fa' ? fact.fa : fact.en,
            requested,
            langCode
          );
          return {
            topic: fact.id,
            text
          };
        }
      }
    }
    return null;
  }

  // Topic words for refining a knowledge follow-up in any domain: after
  // "tell me about Jupiter", a bare "and Saturn?" or "زحل چطور؟" has no
  // framing of its own, so lookupFragment maps the topic word to its fact.
  // The word lists use normalized (space-separated) Persian forms.
  const FRAGMENT_WORDS = {
    fa: {
      mercury: ['عطارد'],
      venus: ['زهره'],
      mars: ['مریخ'],
      jupiter: ['مشتری'],
      saturn: ['زحل'],
      uranus: ['اورانوس'],
      neptune: ['نپتون'],
      sun: ['خورشید'],
      solar_system: ['منظومه شمسی'],
      career_plan_tech: [
        'برنامه نویس',
        'توسعه دهنده',
        'علم داده',
        'دیتا ساینس',
        'طراح یوآی'
      ],
      career_plan_common: [
        'معلم',
        'بازاریابی',
        'کارآفرین',
        'استارتاپ',
        'بیزینس'
      ],
      games_classic: ['بازی کلاسیک', 'بازی قدیمی', 'بازی های قدیمی'],
      games_modern: ['بازی جدید', 'بازی های جدید'],
      games_mobile: ['بازی موبایل', 'بازی اندروید', 'بازی گوشی'],
      games_by_genre: [
        'بازی ترسناک',
        'بازی ورزشی',
        'بازی مسابقه',
        'بازی نقش آفرینی',
        'بازی معمایی',
        'بازی استراتژی',
        'بازی تیراندازی'
      ],
      cbt: ['سی بی تی', 'شناخت درمانی'],
      neuroplasticity: ['نوروپلاستیسیتی', 'انعطاف پذیری مغز'],
      sleep: ['خواب'],
      football: ['فوتبال'],
      olympics: ['المپیک'],
      marathon: ['ماراتن'],
      persian_empire: ['کوروش', 'هخامنشی'],
      pyramids: ['اهرام'],
      berlin_wall: ['برلین'],
      persian_food: [
        'غذای ایرانی',
        'چلو کباب',
        // Both spellings of the stew must resolve: «قرمه سبزی» (standard
        // spelling in the fact) and the colloquial «قورمه سبزی» that
        // users actually type. The normalizer keeps both, so both are
        // needed here for a bare follow-up like «قورمه» to reach the
        // food fact.
        'قرمه سبزی',
        'قورمه سبزی',
        'قورمه'
      ],
      saffron: ['زعفران'],
      tea: ['چای'],
      relationship_plan: ['رابطه سالم', 'رابطه خوب', 'برنامه رابطه', 'رابطه'],
      sex_education: ['آموزش جنسی', 'رابطه جنسی', 'سکس', 'رضایت جنسی'],
      world_religions: [
        'ادیان',
        'اسلام',
        'مسیحیت',
        'یهودیت',
        'بودیسم',
        'هندوئیسم'
      ],
      movies_masterpieces: ['شاهکار'],
      anime_by_genre: ['انیمه'],
      books_by_genre: ['کتاب'],
      games_by_platform: [
        'بازی پی سی',
        'بازی پلی استیشن',
        'بازی ایکس باکس',
        'بازی سوییچ'
      ],
      investing_basics: ['سرمایه گذاری', 'سرمایه‌گذاری'],
      health_nutrition: ['تغذیه'],
      sports_cardio: ['یوگا', 'دویدن', 'شنا']
    },
    en: {
      mercury: ['mercury'],
      venus: ['venus'],
      mars: ['mars'],
      jupiter: ['jupiter'],
      saturn: ['saturn'],
      uranus: ['uranus'],
      neptune: ['neptune'],
      sun: ['sun'],
      solar_system: ['solar system'],
      career_plan_tech: [
        'developer',
        'programmer',
        'data science',
        'data scientist',
        'ui design',
        'ui designer'
      ],
      career_plan_common: [
        'teacher',
        'marketing',
        'entrepreneur',
        'startup',
        'business'
      ],
      games_classic: ['classic games', 'retro games', 'old games'],
      games_modern: ['modern games', 'new games'],
      games_mobile: ['mobile games', 'android games', 'phone games'],
      games_by_genre: [
        'horror game',
        'horror games',
        'racing game',
        'racing games',
        'sports game',
        'sports games',
        'rpg game',
        'rpg games',
        'puzzle game',
        'puzzle games',
        'strategy game',
        'strategy games',
        'shooter game',
        'shooter games'
      ],
      cbt: ['cbt', 'cognitive therapy'],
      neuroplasticity: ['neuroplasticity', 'brain plasticity'],
      sleep: ['sleep'],
      football: ['football', 'soccer'],
      olympics: ['olympics', 'olympic games'],
      marathon: ['marathon'],
      persian_empire: ['cyrus', 'persia'],
      pyramids: ['pyramids', 'pyramid'],
      berlin_wall: ['berlin wall'],
      persian_food: ['persian food', 'persian cuisine'],
      saffron: ['saffron'],
      tea: ['tea'],
      relationship_plan: [
        'healthy relationship',
        'relationship plan',
        'relationship'
      ],
      sex_education: ['sex education', 'safe sex', 'consent', 'sexual health'],
      world_religions: [
        'islam',
        'christianity',
        'judaism',
        'buddhism',
        'hinduism'
      ],
      movies_masterpieces: ['masterpiece', 'masterpieces'],
      anime_by_genre: ['anime'],
      books_by_genre: ['books', 'novels'],
      games_by_platform: [
        'pc games',
        'playstation games',
        'xbox games',
        'switch games'
      ],
      investing_basics: ['investing', 'investments'],
      health_nutrition: ['nutrition', 'healthy eating'],
      sports_cardio: ['yoga', 'running', 'swimming', 'cardio']
    }
  };
  const FRAGMENT_FACT_IDS = {
    mercury: 'mercury',
    venus: 'venus',
    mars: 'mars',
    jupiter: 'jupiter',
    saturn: 'saturn',
    uranus: 'uranus',
    neptune: 'neptune',
    sun: 'sun',
    solar_system: 'solar_system',
    career_plan_tech: 'career_plan_tech',
    career_plan_common: 'career_plan_common',
    games_classic: 'games_classic',
    games_modern: 'games_modern',
    games_mobile: 'games_mobile',
    games_by_genre: 'games_by_genre',
    cbt: 'cbt',
    neuroplasticity: 'neuroplasticity',
    sleep: 'sleep',
    football: 'football',
    olympics: 'olympics',
    marathon: 'marathon',
    persian_empire: 'persian_empire',
    pyramids: 'pyramids',
    berlin_wall: 'berlin_wall',
    persian_food: 'persian_food',
    saffron: 'saffron',
    tea: 'tea',
    relationship_plan: 'relationship_plan',
    sex_education: 'sex_education',
    world_religions: 'world_religions',
    movies_masterpieces: 'movies_masterpieces',
    anime_by_genre: 'anime_by_genre',
    books_by_genre: 'books_by_genre',
    games_by_platform: 'games_by_platform',
    investing_basics: 'investing_basics',
    health_nutrition: 'health_nutrition',
    sports_cardio: 'sports_cardio'
  };
  // Connective words allowed inside a follow-up fragment. Anything left
  // over after removing the topic word and these connectives means the
  // message is not a pure follow-up: "مشتری جذب کنم" (attract customers)
  // must never be read as a request about the planet Jupiter.
  const FRAGMENT_CONNECTIVES = {
    fa: [
      'و',
      'چطور',
      'چطوره',
      'چطوریه',
      'چیه',
      'چی',
      'چه شکلیه',
      'چه شکلی',
      'چه جوره',
      'بگو',
      'بگی',
      'برام',
      'براش',
      'درباره',
      'راجع به',
      'در مورد',
      'بیش تر',
      'بیشتر',
      'توضیح بده',
      'سیاره',
      'رو',
      'یه',
      'یک',
      'هم',
      'لطفا',
      'لطفاً'
    ],
    en: [
      'and',
      'the',
      'what about',
      'how about',
      'about',
      'tell me about',
      'more about',
      'want to know about',
      'wanna know about',
      'can you tell me about',
      'could you tell me about',
      'what is',
      'whats',
      "what's",
      'like',
      'please'
    ]
  };

  /**
   * Detects a bare topic word in a short follow-up and returns the
   * matching knowledge fact, or null. Used for sequential refinement in
   * any domain: "tell me about Jupiter" then "and Saturn?", or "چطور
   * پول دربیارم" then "بیزینس". Only fires when the fragment is a pure
   * topic reference (topic word plus connectives, nothing else), so an
   * unrelated sentence containing a topic word is never hijacked.
   * @param {string} text - Normalized matching text
   * @param {string} langCode - 'fa' or 'en'
   * @returns {{topic: string, text: string}|null}
   */
  function lookupFragment(text, langCode) {
    if (!text) {
      return null;
    }
    const lower = text.toLowerCase();
    const words = FRAGMENT_WORDS[langCode === 'fa' ? 'fa' : 'en'];
    const connectives = FRAGMENT_CONNECTIVES[langCode === 'fa' ? 'fa' : 'en'];
    let best = null;
    for (const [key, terms] of Object.entries(words)) {
      for (const term of terms) {
        if (lower.includes(term) && (!best || term.length > best.term.length)) {
          const fact = FACTS.find((f) => f.id === FRAGMENT_FACT_IDS[key]);
          if (fact) {
            best = { term, fact };
          }
        }
      }
    }
    if (!best) {
      return null;
    }
    // The fragment must be ONLY the topic reference: after removing the
    // matched term and the connective words, nothing else may remain.
    // All pieces are stripped in a single longest-first pass, so a
    // connective letter embedded in another word (the Persian "و" inside
    // "چطور") can never corrupt the residual.
    const pieces = [best.term, ...connectives].sort(
      (a, b) => b.length - a.length
    );
    const residual = lower
      .replace(
        new RegExp(pieces.map((p) => escapeRegExp(p)).join('|'), 'gu'),
        ' '
      )
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
    if (residual) {
      return null;
    }
    const requested = parseListCount(lower, langCode);
    return {
      topic: best.fact.id,
      text: trimListToCount(
        langCode === 'fa' ? best.fact.fa : best.fact.en,
        requested,
        langCode
      )
    };
  }

  const domains = Object.keys(SHELF.en);
  function answer(language, domain) {
    return (SHELF[language]?.[domain] || []).slice();
  }
  /**
   * Returns a random selection of fun facts in the requested language,
   * optionally filtered to one category (science, space, animals, history,
   * body, food, tech, life, social, relationship, sports, art, money).
   * Used by the fact-request responder ("tell me 3 facts",
   * "یک حقیقت عجیب بگو").
   * @param {string} langCode - 'fa' or 'en'
   * @param {number} count - How many facts to return (clamped to the pool)
   * @param {string} [category] - Optional category filter
   * @returns {Array<string>} The selected fact lines
   */
  function randomFacts(langCode, count, category, excludedFacts = null) {
    const isFa = langCode === 'fa';
    const pool = FUN_FACTS[isFa ? 'fa' : 'en'] || {};
    const sources = category && pool[category] ? pool[category] : [];
    const all =
      sources.length > 0
        ? sources
        : Object.values(pool).reduce((acc, list) => acc.concat(list), []);
    const wanted = Math.max(1, Math.min(count || 3, all.length));
    let available = excludedFacts
      ? all.filter((fact) => !excludedFacts.has(fact))
      : [...all];
    // Repeats are allowed only after every fact on this shelf has appeared.
    // Remove this shelf's entries from the session set without disturbing
    // unseen facts remembered for other categories.
    if (available.length === 0 && excludedFacts) {
      all.forEach((fact) => excludedFacts.delete(fact));
      available = [...all];
    }
    const shuffled = [...available];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    return shuffled.slice(0, Math.min(wanted, shuffled.length));
  }

  const DEFAULT_MEDIA_COUNT = 5;
  const MAX_MEDIA_COUNT = 12;
  const RECENT_YEAR_CUTOFF = 2016;

  const MEDIA_WORDS = {
    movie: /(?:\bmovies?\b|\bfilms?\b|فیلم|سینما)/iu,
    series:
      // eslint-disable-next-line max-len
      /(?:\bseries\b|\btv shows?\b|\b(?:a|some|good|best|new|short) shows?\b|\b(?:recommend|suggest) shows?\b|سریال|مینی سریال)/iu,
    game: /(?:\bgames?\b|\bvideo games?\b|بازی|گیم)/iu,
    anime: /(?:\banime\b|انیمه)/iu,
    music: /(?:\bmusic\b|\bsongs?\b|\balbums?\b|موسیقی|آهنگ|البوم|آلبوم)/iu,
    podcast: /(?:\bpodcasts?\b|پادکست)/iu,
    book: /(?:\bbooks?\b|\bnovels?\b|کتاب|رمان)/iu,
    documentary: /(?:\bdocumentar(?:y|ies)\b|\bdocumentations?\b|مستند)/iu
  };
  const MEDIA_REQUEST =
    // eslint-disable-next-line max-len
    /(?:\brecommend\b|\bsuggest\b|\bgive me\b|\bshow me\b|\bname (?:me |some |a few )?\b|\bwhat should i (?:watch|read|play|listen to)\b|\bto (?:watch|read|play|listen to)\b|\bbest\b|\btop\b|پیشنهاد|معرفی|بگو|چی (?:ببینم|بخونم|گوش بدم|بازی کنم)|چه (?:ببینم|بخونم|گوش بدم|بازی کنم)|بهترین|بیشتر)/iu;
  const MORE_REQUEST =
    // eslint-disable-next-line max-len
    /^(?:please\s+)?(?:tell me\s+)?(?:suggest\s+)?(?:\d+\s+)?(?:more|another|others?|new ones?|different ones?)(?:\s+please)?$|^(?:بازم|بیشتر|بیش تر|چندتای? دیگه|یکی دیگه|موارد دیگه|پیشنهاد دیگه)(?: لطفا)?$/iu;

  const GENRE_ALIASES = {
    drama: /\bdrama\b|درام/iu,
    sci_fi: /\bsci[ -]?fi\b|\bscience fiction\b|علمی تخیلی/iu,
    thriller: /\bthriller\b|\bsuspense\b|تریلر|دلهره/iu,
    comedy: /\bcomedy\b|\bfunny\b|کمدی|خنده دار/iu,
    romance: /\bromance\b|\bromantic\b|عاشقانه/iu,
    horror: /\bhorror\b|\bscary\b|ترسناک|وحشت/iu,
    animation: /\banimat(?:ed|ion)\b|\bcartoon\b|انیمیشن/iu,
    crime: /\bcrime\b|\bcriminal\b|جنایی/iu,
    mystery: /\bmystery\b|\bmysterious\b|معمایی/iu,
    historical: /\bhistorical?\b|تاریخی/iu,
    fantasy: /\bfantasy\b|فانتزی/iu,
    rpg: /\brpg\b|\brole[ -]?playing\b|نقش افرینی/iu,
    strategy: /\bstrategy\b|استراتژی/iu,
    puzzle: /\bpuzzles?\b|معمایی/iu,
    adventure: /\badventure\b|ماجراجویی/iu,
    simulation: /\bsimulation\b|\bsim\b|شبیه سازی/iu,
    cozy: /\bcozy\b|\bcosy\b|دنج|کم فشار|آروم|آرام/iu,
    platformer: /\bplatformer\b|سکوبازی/iu,
    action: /\baction\b|اکشن/iu,
    slice_of_life: /\bslice of life\b|روزمره/iu,
    sports: /\bsports?\b|ورزشی/iu,
    rock: /\brock\b|راک/iu,
    jazz: /\bjazz\b|جاز/iu,
    classical: /\bclassical\b|کلاسیک/iu,
    electronic: /\belectronic\b|الکترونیک/iu,
    folk: /\bfolk\b|فولک/iu,
    hip_hop: /\bhip[ -]?hop\b|\brap\b|هیپ هاپ|رپ/iu,
    ambient: /\bambient\b|امبینت/iu,
    science: /\bscience\b|علمی/iu,
    history: /\bhistory\b|تاریخ/iu,
    technology: /\btechnology\b|\btech\b|فناوری|تکنولوژی/iu,
    culture: /\bculture\b|فرهنگ/iu,
    true_crime: /\btrue crime\b|جنایی واقعی/iu,
    business: /\bbusiness\b|کسب و کار/iu,
    storytelling: /\bstorytelling\b|\bstories\b|داستان/iu,
    literary: /\bliterary\b|ادبی/iu,
    philosophy: /\bphilosophy\b|فلسفه/iu,
    memoir: /\bmemoir\b|خاطرات/iu,
    nature: /\bnature\b|طبیعت/iu,
    society: /\bsociety\b|\bsocial\b|اجتماعی/iu,
    art: /\bart\b|هنر/iu
  };

  function detectMediaGenre(text, category) {
    const shelves = global.DaryaMediaPool?.genres?.[category] || {};
    return (
      Object.keys(shelves).find((genre) => GENRE_ALIASES[genre]?.test(text)) ||
      null
    );
  }

  // Iranian/Persian nationality request: routes movie asks to the
  // dedicated Iranian cinema shelf and music asks to the Persian music
  // shelf. Matched separately from GENRE_ALIASES because the same word
  // maps to a different shelf per category.
  const IRANIAN_REQUEST = /\b(?:iranian|persian)\b|ایرانی|ایران|فارسی/iu;

  /**
   * Detects a decade/era filter in a media request ("from the 80s",
   * "1990s movie", «دهه هشتاد میلادی»). Returns { from, to } Gregorian
   * year bounds or null. Only explicit decade phrasings match, so a
   * bare year inside a title never becomes a filter.
   * @param {string} text
   * @returns {{from: number, to: number}|null}
   */
  const ENGLISH_DECADE_WORDS = new Map([
    ['sixties', 1960],
    ['seventies', 1970],
    ['eighties', 1980],
    ['nineties', 1990],
    ['two thousands', 2000],
    ['twenty tens', 2010]
  ]);

  function detectMediaEra(text) {
    const t = String(text || '');
    const namedEra = t.match(
      /\b(?:the )?(sixties|seventies|eighties|nineties|two thousands|twenty tens)\b/iu
    );
    if (namedEra) {
      const base = ENGLISH_DECADE_WORDS.get(namedEra[1].toLowerCase());
      return { from: base, to: base + 9 };
    }
    const en = t.match(/\b(?:from |of |in )?the (\d\d)s\b|\b(19\d0|20\d0)s\b/i);
    if (en) {
      const raw = en[1] || en[2];
      const base =
        raw.length === 2
          ? (Number(raw) >= 30 ? 1900 : 2000) + Number(raw)
          : Number(raw);
      return { from: base, to: base + 9 };
    }
    const fa = t.match(/دهه[\u200c ]?(?:ی )?([۰-۹0-9]{2,4})\s*(میلادی)?/u);
    if (fa) {
      const ascii = fa[1].replace(/[۰-۹]/g, (d) =>
        String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      );
      let base = Number(ascii);
      if (base < 100) {
        // Two-digit Persian decades ("دهه ۸۰") default to the Gregorian
        // century only when explicitly marked میلادی; otherwise ambiguous
        // (Jalali decades), so no filter is applied.
        if (!fa[2]) {
          return null;
        }
        base = (base >= 30 ? 1900 : 2000) + base;
      }
      return { from: base, to: base + 9 };
    }
    return null;
  }

  /** Resolve a full media request without letting a stale topic influence it. */
  function detectMediaRequest(text, langCode) {
    if (!text || !MEDIA_REQUEST.test(text)) {
      return null;
    }
    const category = Object.keys(MEDIA_WORDS).find((key) =>
      MEDIA_WORDS[key].test(text)
    );
    if (!category) {
      return null;
    }
    // Nationality shelves: an Iranian movie or Persian music ask routes
    // to the dedicated shelf instead of the international genre pool.
    // In Persian, «آهنگ ایرانی» and «فیلم ایرانی» are among the most
    // common asks and previously returned international picks.
    if (IRANIAN_REQUEST.test(text)) {
      if (category === 'movie') {
        return {
          category,
          genre: 'iranian',
          era: detectMediaEra(text),
          count: parseListCount(text, langCode) || DEFAULT_MEDIA_COUNT
        };
      }
      if (category === 'music') {
        return {
          category,
          genre: 'persian',
          era: detectMediaEra(text),
          count: parseListCount(text, langCode) || DEFAULT_MEDIA_COUNT
        };
      }
    }
    const genre = detectMediaGenre(text, category);
    const era = detectMediaEra(text);
    // An explicit era ask ("horror movie from the 80s") must stay in
    // the filterable pool: the specialist knowledge shelves are static
    // text and cannot honor a decade filter (the "80s horror" ask used
    // to return 2014-2016 titles).
    if (era && genre) {
      return {
        category,
        genre,
        era,
        count: parseListCount(text, langCode) || DEFAULT_MEDIA_COUNT
      };
    }
    // Existing specialist shelves carry details such as platform, era,
    // duration, and true-story status that a broad genre tag cannot retain.
    if (
      category === 'movie' &&
      // eslint-disable-next-line max-len
      /horror|scary|romantic|romance|comedy|fantasy|thriller|sci[ -]?fi|science fiction|true (?:story|events)|animated|animation|ترسناک|وحشت|عاشقانه|کمدی|فانتزی|هیجانی|علمی تخیلی|واقعی|انیمیشن/iu.test(
        text
      )
    ) {
      return null;
    }
    if (
      category === 'game' &&
      genre !== 'cozy' &&
      // Existing game genres and platform or era requests retain their
      // detailed specialist shelves. Cozy is the one filterable exception,
      // because the broad modern-games fact contains high-pressure titles.
      (genre ||
        // eslint-disable-next-line max-len
        /\b(?:pc|ps[1-5]|playstation|xbox|switch|classic|retro|modern|new|mobile|android|online|multiplayer)\b|پی سی|پلی استیشن|ایکس باکس|سوییچ|قدیمی|جدید|موبایل|اندروید|آنلاین/iu.test(
          text
        ))
    ) {
      return null;
    }
    if (
      category === 'series' &&
      /\b(?:short|mini[ -]?series)\b|کوتاه|مینی سریال/iu.test(text)
    ) {
      return null;
    }
    return {
      category,
      genre,
      era,
      count: parseListCount(text, langCode) || DEFAULT_MEDIA_COUNT
    };
  }

  function isMoreMediaRequest(text) {
    return Boolean(text && MORE_REQUEST.test(text.trim()));
  }

  function shuffledCopy(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  /** Selects fresh titles, excluding every title already shown this session. */
  function recommendMedia(category, langCode, count, options = {}) {
    const all = options.genre
      ? global.DaryaMediaPool?.genres?.[category]?.[options.genre]
      : global.DaryaMediaPool?.categories?.[category];
    if (!all?.length) {
      return null;
    }
    const excluded = options.excludedTitles || new Set();
    let available = all.filter((item) => !excluded.has(item.t));
    // Era filter: honor an explicit decade request ("from the 80s").
    // When the filter empties the shelf, return null so the caller can
    // answer honestly instead of serving off-era titles as if they fit.
    if (options.era) {
      available = available.filter(
        (item) =>
          item.y && item.y >= options.era.from && item.y <= options.era.to
      );
      if (!available.length) {
        return null;
      }
    }
    const wanted = Math.max(
      1,
      Math.min(count || DEFAULT_MEDIA_COUNT, MAX_MEDIA_COUNT)
    );
    let recent = shuffledCopy(
      available.filter((item) => item.y >= RECENT_YEAR_CUTOFF)
    );
    let established = shuffledCopy(
      available.filter((item) => !item.y || item.y < RECENT_YEAR_CUTOFF)
    );
    const selected = [];
    // Keep broad series and game replies recognizable while the remaining
    // choices still vary. This avoids a shelf made entirely of obscure picks.
    if ((category === 'series' || category === 'game') && !options.genre) {
      const familiar = available.filter((item) =>
        category === 'series'
          ? /^(?:The Bear|Dark|Chernobyl|Arcane|Severance)$/u.test(item.t)
          : /^(?:Hades|Baldur’s Gate 3)$/u.test(item.t)
      );
      const anchor = shuffledCopy(familiar)[0];
      if (anchor) {
        selected.push(anchor);
        recent = recent.filter((item) => item.t !== anchor.t);
        established = established.filter((item) => item.t !== anchor.t);
      }
    }
    while (selected.length < wanted && (recent.length || established.length)) {
      const source =
        selected.length % 2 === 0 && recent.length
          ? recent
          : established.length
            ? established
            : recent;
      selected.push(source.pop());
    }
    const digits = '۰۱۲۳۴۵۶۷۸۹';
    const lines = selected
      .map((item, index) => {
        const number =
          langCode === 'fa'
            ? String(index + 1).replace(
                /[0-9]/g,
                (digit) => digits[Number(digit)]
              )
            : String(index + 1);
        const year = item.y ? ` (${item.y})` : '';
        return `${number}. ${item.t}${year}: ${langCode === 'fa' ? item.fa : item.en}`;
      })
      .join('\n');
    const labels = {
      en: { game: 'Game picks:', documentary: 'Documentary picks:' },
      fa: { game: 'پیشنهادهای بازی:', documentary: 'پیشنهادهای مستند:' }
    };
    const intro = labels[langCode]?.[category];
    const text = intro ? `${intro}\n${lines}` : lines;
    return {
      text,
      titles: selected.map((item) => item.t),
      exhausted: selected.length < wanted || available.length <= wanted,
      remaining: Math.max(0, available.length - selected.length)
    };
  }

  function randomMediaRecommendations(category, langCode, count) {
    return recommendMedia(category, langCode, count)?.text || '';
  }

  const RECOMMENDATION_CATEGORIES = {
    movies_recommendations: 'movie',
    movies_masterpieces: 'movie',
    movies_tv_series: 'series',
    movies_anime: 'anime',
    anime_by_genre: 'anime',
    song_recommendations: 'music',
    books_recommendations: 'book',
    books_by_genre: 'book'
  };

  function randomizeRecommendation(factId, langCode, count, text) {
    let category = RECOMMENDATION_CATEGORIES[factId];
    if (category === 'movie' && MEDIA_WORDS.series.test(text || '')) {
      category = 'series';
    }
    if (!category) {
      return null;
    }
    return (
      recommendMedia(category, langCode, count, {
        genre: detectMediaGenre(text || '', category)
      })?.text || null
    );
  }

  const DaryaKnowledge = {
    domains,
    answer,
    lookup,
    lookupGenre,
    lookupFragment,
    randomFacts,
    detectMediaRequest,
    detectMediaGenre,
    isMoreMediaRequest,
    recommendMedia,
    randomMediaRecommendations,
    randomizeRecommendation,
    factsCount: FACTS.length
  };
  global.DaryaKnowledge = DaryaKnowledge;
})(typeof window !== 'undefined' ? window : globalThis);
