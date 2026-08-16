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
    const lower = text.toLowerCase().replace(/\s+/gu, ' ').trim();
    if (!lower) {
      return null;
    }
    const framing = FRAMING[isFa ? 'fa' : 'en'] || [];
    const hasFraming = framing.some((word) => lower.includes(word));

    let best = null;
    for (const fact of FACTS) {
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
    const requested = parseListCount(lower, langCode);
    return {
      topic: best.fact.id,
      confidence: Math.min(1, best.score / 40),
      text: trimListToCount(
        isFa ? best.fact.fa : best.fact.en,
        requested,
        langCode
      )
    };
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
  function randomFacts(langCode, count, category) {
    const isFa = langCode === 'fa';
    const pool = FUN_FACTS[isFa ? 'fa' : 'en'] || {};
    const sources = category && pool[category] ? pool[category] : [];
    const all =
      sources.length > 0
        ? sources
        : Object.values(pool).reduce((acc, list) => acc.concat(list), []);
    const wanted = Math.max(1, Math.min(count || 3, all.length));
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, wanted);
  }

  // Age cutoff for "recent" titles in a recommendation mix. Anything at or
  // after this year counts as recent, anything before as a classic, so a
  // randomized recommendation blend spans the two eras instead of handing
  // back a single-era list.
  const RECENT_YEAR_CUTOFF = 2016;

  /**
   * Builds a randomized, bilingual recommendation list from the media pool.
   * Each call shuffles the category pool and blends recent and classic
   * titles, so Darya never returns the same static list twice. Titles
   * without a year (podcasts) are treated as timeless and mixed freely.
   * @param {string} category - A media-pool category key (movie, series,
   *   game, anime, music, podcast, book, documentary).
   * @param {string} langCode - 'fa' or 'en'.
   * @param {number} [count=5] - How many titles to recommend.
   * @returns {string} A formatted, newline-separated recommendation list.
   */
  function randomMediaRecommendations(category, langCode, count) {
    const pool = global.DaryaMediaPool?.categories?.[category];
    if (!pool || pool.length === 0) {
      return '';
    }
    const wanted = Math.max(2, Math.min(count || 5, pool.length));
    // Split into recent and classic so the mix spans eras.
    const recent = pool.filter((item) => (item.y || 0) >= RECENT_YEAR_CUTOFF);
    const classic = pool.filter((item) => (item.y || 0) < RECENT_YEAR_CUTOFF);
    const timeless = pool.filter((item) => !item.y);
    // Pick roughly half recent / half classic (with timeless filling in).
    const half = Math.ceil(wanted / 2);
    const pickShuffled = (arr, n) =>
      [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    const chosen = [
      ...pickShuffled(recent, half),
      ...pickShuffled(classic, wanted - half),
      ...pickShuffled(timeless, wanted)
    ].slice(0, wanted);
    // Shuffle the chosen mix so the eras are not always clustered.
    const mixed = [...chosen].sort(() => Math.random() - 0.5);
    const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
    return mixed
      .map((item, i) => {
        const year = item.y ? ` (${item.y})` : '';
        const reason = langCode === 'fa' ? item.fa : item.en;
        const numeral =
          langCode === 'fa'
            ? String(i + 1).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
            : `${i + 1}`;
        return `${numeral}. ${item.t}${year}: ${reason}`;
      })
      .join('\n');
  }

  // Recommendation fact IDs that should produce a randomized media-pool
  // reply instead of a static list: a general movie request, series, anime,
  // music, or books. Per-genre movie lists (movies_horror, etc.) and the
  // games facts (which carry era/platform/genre semantics) stay curated so
  // genre and platform filtering is preserved, but the broad "recommend X"
  // asks get a fresh, era-blending mix each time.
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

  // Series words in each language, used to split a "recommend X" request
  // that the broad movie/series fact matched into a series pick instead of
  // a movie pick. A Persian "یه سریال خوب معرفی کن" hits the general
  // movie fact (which lists series keywords too), but should recommend
  // series, not movies.
  const SERIES_WORDS =
    /(?:سریال|مینی‌سریال|مینی سریال|series|tv show|tv shows|drama series|کره‌ای)/iu;

  /**
   * Returns a randomized recommendation list for a matched fact, or null
   * when the fact is not a randomized recommendation (so the static fact
   * text is used). Lets the engine hand back a fresh, era-blending mix for
   * "recommend a movie/game/series/anime/music/book" instead of the same
   * list every time.
   * @param {string} factId - The matched fact's id.
   * @param {string} langCode - 'fa' or 'en'.
   * @param {number} [count=5] - How many titles to recommend.
   * @param {string} [text] - The matching input, so a series ask that the
   *   broad movie fact matched can still resolve to series.
   * @returns {string|null}
   */
  function randomizeRecommendation(factId, langCode, count, text) {
    let category = RECOMMENDATION_CATEGORIES[factId];
    if (!category) {
      return null;
    }
    // A movie/series fact that the request names series resolves to series.
    if (
      category === 'movie' &&
      RECOMMENDATION_CATEGORIES[factId] === 'movie' &&
      text &&
      SERIES_WORDS.test(text)
    ) {
      category = 'series';
    }
    const list = randomMediaRecommendations(category, langCode, count);
    return list || null;
  }

  const DaryaKnowledge = {
    domains,
    answer,
    lookup,
    lookupGenre,
    lookupFragment,
    randomFacts,
    randomMediaRecommendations,
    randomizeRecommendation,
    factsCount: FACTS.length
  };
  global.DaryaKnowledge = DaryaKnowledge;
})(typeof window !== 'undefined' ? window : globalThis);
