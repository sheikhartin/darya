/**
 * Darya - curated fun-fact requests.
 * Registered on a global consumed by the factual assembler (factual.js).
 */
(function (global) {
  'use strict';

  const FACT_REQUEST_EN =
    // eslint-disable-next-line max-len
    /\b(?:tell me|give me|share|any|some|more|another|a few|several)\s+(?:(?:at least|just|only|a single|single)\s+)?(?:\d+|one|two|three|four|five|a|an|a few|some|several|single)?(?:\s+(?:fun|interesting|shocking|surprising|weird|random|amazing|mind-blowing|single))*\s*facts?\b|\bfacts?\s+(?:about|on|regarding)\b/i;
  const FACT_REQUEST_FA =
    // eslint-disable-next-line max-len
    /(?:حداقل|فقط)?\s*(?:حقیقت|حقایق|واقعیت جالب|واقعیت‌های جالب)(?:\s*(?:درباره|راجع به|در مورد|از|برام|بگو|بگویید|بهم))?|(?:بگو|بگویید|برام|بهم)\s+(?:حداقل|فقط)?\s*(?:یک|یه|چند تا|چند|سه تا|دو تا|پنج تا|۴|۵|۳|۲)?\s*(?:حقیقت|واقعیت جالب)/u;
  const SHOCKING_EN =
    /\b(?:shocking|surprising|weird|random|amazing|mind-blowing)\b/i;
  const SHOCKING_FA =
    /(?:عجیب|شگفت‌انگیز|شگفت انگیز|حیرت‌انگیز|تصادفی|باورنکردنی|جالب)/u;
  const COUNT_EN =
    /\b(?:one|two|three|four|five|single|a few|some|several|\d+)\b/i;
  const AT_LEAST_EN = /\bat least\b/i;
  const AT_LEAST_FA = /(?:حداقل)/u;
  const COUNT_FA = /(?:یک|یه|دو|سه|چهار|پنج|چند)/u;
  const CATEGORY_EN = {
    science: /\b(?:science|physics|chemistry|biology|water)\b/i,
    space:
      /\b(?:space|planet|star|solar|universe|moon|venus|jupiter|saturn)\b/i,
    animals:
      /\b(?:animal|animals|octopus|cow|elephant|tardigrade|sloth|wombat)\b/i,
    history:
      /\b(?:history|ancient|empire|egypt|rome|pyramid|cleopatra|mammoth)\b/i,
    body: /\b(?:body|human body|bone|brain|stomach|tongue|saliva)\b/i,
    food: /\b(?:food|fruit|chocolate|vanilla|honey|peanut|wasabi|cheese)\b/i,
    tech: /\b(?:tech|technology|computer|internet|email|keyboard|mouse|website)\b/i,
    life: /\b(?:life|habit|sleep|memory|choice|decision|learning)\b/i,
    social:
      /\b(?:social|conversation|listening|talk|smile|friendship|people)\b/i,
    relationship:
      /\b(?:relationship|relationships|marriage|consent|love|partner|intimacy)\b/i,
    sports:
      /\b(?:sport|sports|football|soccer|basketball|olympic|marathon|badminton|golf|tennis|athlete|naismith)\b/i,
    // eslint-disable-next-line max-len
    art: /\b(?:art|arts|music|painting|drawing|sculpture|theater|piano|violin|beethoven|mona lisa|lascaux|song|musician|composer)\b/i,
    money:
      /\b(?:money|finance|financial|dollar|salary|credit card|gold|bank|banking|interest|economy|currency)\b/i
  };
  const CATEGORY_FA = {
    science: /(?:علم|فیزیک|شیمی|زیست|آب)/u,
    space: /(?:فضا|سیاره|ستاره|منظومه|کیهان|ماه|مشتری|زحل|زهره)/u,
    animals: /(?:حیوان|حیوانات|اختاپوس|گاو|فیل|خرس آبی|تنبل|وامبت)/u,
    history: /(?:تاریخ|باستان|امپراتوری|مصر|روم|هرم|کلئوپاترا|ماموت)/u,
    body: /(?:بدن|استخوان|مغز|معده|زبان|بزاق)/u,
    food: /(?:غذا|میوه|شکلات|وانیل|عسل|بادام|وازابی|پنیر)/u,
    tech: /(?:فناوری|تکنولوژی|کامپیوتر|اینترنت|ایمیل|کیبورد|ماوس|وب‌سایت)/u,
    life: /(?:زندگی|عادت|خواب|حافظه|انتخاب|تصمیم|یادگیری)/u,
    social: /(?:اجتماعی|گفتگو|گوش دادن|لبخند|دوستی|مردم)/u,
    relationship: /(?:رابطه|روابط|ازدواج|رضایت|عشق|شریک|صمیمیت)/u,
    sports:
      /(?:ورزش|فوتبال|بسکتبال|المپیک|ماراتن|بدمینتون|گلف|تنیس|ورزشکار|نایسمیت)/u,
    art: /(?:هنر|موسیقی|نقاشی|پیانو|ویولن|بتهوون|مونالیزا|لاسکو|آهنگ|خواننده|آهنگساز)/u,
    money:
      /(?:پول|مالی|دلار|حقوق|کارت اعتباری|طلا|بانک|بانکداری|بهره|اقتصاد|ارز)/u
  };

  /**
   * Parses a fun-fact request and returns a formatted reply, or null if
   * the text is not a fact request.
   * @param {Object} engine - The Darya engine instance
   * @param {string} text - Normalized matching text
   * @returns {string|null}
   */
  function handleFunFactsRequest(engine, text) {
    const isPersian = engine.lang.code === 'fa';
    if (!text || typeof text !== 'string') {
      return null;
    }
    const lower = text.toLowerCase();
    const isRequest = isPersian
      ? FACT_REQUEST_FA.test(text)
      : FACT_REQUEST_EN.test(lower);
    if (!isRequest) {
      return null;
    }

    let count = 3;
    const atLeast = isPersian
      ? AT_LEAST_FA.test(text)
      : AT_LEAST_EN.test(lower);
    const countMatch = lower.match(isPersian ? COUNT_FA : COUNT_EN);
    if (countMatch) {
      const word = countMatch[0].toLowerCase();
      if (/^\d+$/.test(word)) {
        count = Math.max(1, Math.min(5, parseInt(word, 10)));
      } else {
        const map = {
          one: 1,
          two: 2,
          three: 3,
          four: 4,
          five: 5,
          single: 1,
          'a few': 3,
          some: 3,
          several: 3,
          یک: 1,
          یه: 1,
          دو: 2,
          سه: 3,
          چهار: 4,
          پنج: 5,
          چند: 3
        };
        if (word in map) {
          count = map[word];
        }
      }
    } else if (
      !isPersian &&
      /\b(?:a|an)\s+(?:fun|interesting|shocking|surprising|weird|random|amazing|mind-blowing|single)?\s*facts?\b/i.test(
        lower
      )
    ) {
      // "a fun fact" / "an interesting fact" means exactly one.
      count = 1;
    }
    // "at least N facts" promises a minimum, never fewer. The floor of 3
    // is intentional: it matches the natural default of 3, so "at least
    // 1" or "at least 2" still satisfies the request while keeping the
    // reply substantial.
    if (atLeast) {
      count = Math.max(3, count);
    }

    let category = null;
    const catMap = isPersian ? CATEGORY_FA : CATEGORY_EN;
    for (const key of Object.keys(catMap)) {
      if (catMap[key].test(text)) {
        category = key;
        break;
      }
    }
    const shocking = isPersian
      ? SHOCKING_FA.test(text)
      : SHOCKING_EN.test(lower);
    // A shocking/surprising request without a topic draws from the whole
    // pool; when the user names a topic ("a shocking fact about space"),
    // the topic still filters the pick.
    const effectiveCategory = shocking && !category ? null : category;
    const facts = global.DaryaKnowledge.randomFacts(
      isPersian ? 'fa' : 'en',
      count,
      effectiveCategory
    );
    if (!facts || facts.length === 0) {
      return null;
    }

    const toFaDigits = (n) =>
      String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
    const lead =
      count === 1
        ? isPersian
          ? 'یک حقیقت جالب برایت دارم:'
          : 'Here is one interesting fact:'
        : isPersian
          ? `${toFaDigits(facts.length)} حقیقت جالب برایت دارم:`
          : `Here are ${facts.length} interesting facts:`;
    const numbered = facts
      .map(
        (fact, i) =>
          `${isPersian ? `${['۱', '۲', '۳', '۴', '۵'][i] ?? i + 1}.` : `${i + 1}.`} ${fact}`
      )
      .join('\n');
    const tail = isPersian
      ? '\nدوست داری درباره‌ی کدام موضوع بیشتر حرف بزنیم؟'
      : '\nWhich of these surprised you the most?';
    return `${lead}\n${numbered}${tail}`;
  }

  global.DaryaFactualFunFacts = { handleFunFactsRequest };
})(typeof window !== 'undefined' ? window : globalThis);
