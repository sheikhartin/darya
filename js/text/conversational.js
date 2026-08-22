/**
 * Darya classic script - conversational register layer.
 *
 * Converts Darya's outgoing prose from written/formal register into the
 * everyday conversational register people actually use in 2026 chats:
 * Persian «کتاب‌هایش را گرفته است» becomes «کتاب‌هاش رو گرفته», and
 * English "I am here, do not worry" becomes "I'm here, don't worry".
 *
 * The layer runs on BOT OUTPUT ONLY (the engine wraps its public
 * methods with it); user input keeps its own separate normalization
 * pipeline, and rule matching is never affected. Text inside Persian
 * guillemets («...») or double quotes is left untouched, so quoted
 * poetry, titles, and idioms keep their original wording.
 *
 * Every rule here is deliberately conservative: a form is only
 * rewritten when the colloquial replacement is unambiguous. Anything
 * uncertain (rare verb stems, homographs like «کند» the adjective,
 * nouns that merely look like verb forms) is left alone - formal but
 * correct always beats colloquial but wrong.
 */
(function (global) {
  'use strict';

  const ZWNJ = '\u200c';
  /**
   * Persian/Arabic LETTERS only (U+0620-U+064A, U+066E-U+06D5).
   * Deliberately excludes the Arabic-block punctuation (؟ ، ؛) and
   * digits that live in U+0600-U+06FF, so «می‌رود؟» parses as the verb
   * «می‌رود» followed by punctuation, not as one opaque token.
   */
  const FA_LETTER = '\\u0620-\\u064A\\u066E-\\u06D5';
  /** Letters plus ZWNJ: what counts as "inside a word". */
  const FA_WORD = FA_LETTER + '\\u200c';
  /** Matches one protected segment: «...», "..." or “...”. */
  const PROTECTED_SEGMENT = /«[^»]*»|"[^"]*"|“[^”]*”/gu;

  // ======================================================================
  // Persian
  // ======================================================================

  /**
   * Perfect-participle stems (the «ـده/ـته» forms). Used twice:
   * «گرفته است» drops the copula entirely («گرفته»), and «گرفته‌ای» /
   * «گرفته‌اید» / «گرفته‌ام» collapse to the simple past («گرفتی»,
   * «گرفتید», «گرفتم»). A curated whitelist, NOT a suffix heuristic:
   * nouns and adjectives that merely end in ده/ته («ایده», «خانواده»,
   * «پیچیده», «ساده») must never be treated as participles.
   */
  const PARTICIPLES = new Set([
    'شده',
    'نشده',
    'کرده',
    'نکرده',
    'بوده',
    'نبوده',
    'داده',
    'نداده',
    'گرفته',
    'نگرفته',
    'رفته',
    'نرفته',
    'آمده',
    'اومده',
    'نیامده',
    'گفته',
    'نگفته',
    'دیده',
    'ندیده',
    'خورده',
    'نخورده',
    'رسیده',
    'نرسیده',
    'مانده',
    'مونده',
    'نمانده',
    'نوشته',
    'ننوشته',
    'ساخته',
    'نساخته',
    'گذاشته',
    'نگذاشته',
    'گذشته',
    'نگذشته',
    'توانسته',
    'تونسته',
    'نتوانسته',
    'خواسته',
    'نخواسته',
    'دانسته',
    'دونسته',
    'افتاده',
    'نیفتاده',
    'ایستاده',
    'شنیده',
    'نشنیده',
    'فهمیده',
    'نفهمیده',
    'برده',
    'نبرده',
    'آورده',
    'نیاورده',
    'یافته',
    'نیافته',
    'کشیده',
    'نکشیده',
    'زده',
    'نزده',
    'خریده',
    'نخریده',
    'خوابیده',
    'پرسیده',
    'نپرسیده',
    'شکسته',
    'بسته',
    'خوانده',
    'نخوانده'
  ]);

  /**
   * Multi-word or context-sensitive rewrites that must run before the
   * token map (longest match first). Each entry is [pattern, replacement].
   */
  const FA_PHRASES = [
    [/خوش آمدید/gu, 'خوش اومدین'],
    [/خوش آمدی/gu, 'خوش اومدی'],
    [/به نظر می‌رسد/gu, 'انگار'],
    [/وجود دارند/gu, 'هستن'],
    [/وجود دارد/gu, 'هست'],
    [/وجود ندارند/gu, 'نیستن'],
    [/وجود ندارد/gu, 'نیست'],
    [/چه چیزی/gu, 'چی'],
    [/چه کسی/gu, 'کی'],
    // The bookish question particle adds nothing in conversation:
    // «آیا چیزی هست که...» reads naturally as «چیزی هست که...».
    [new RegExp(`(?<![${FA_WORD}])آیا (?=[${FA_WORD}])`, 'gu'), ''],
    // «کند» alone is ambiguous (the adjective means "slow"), so the
    // light-verb construction is only rewritten after a whitelisted
    // object noun: «کمک کند» → «کمک کنه», while «اینترنت کند» stays.
    [
      new RegExp(
        '(کمک|کمکت|کمکش|فکر|کار|حل|پیدا|تغییر|رشد|درک|صحبت|تمرکز|عمل|' +
          `قضاوت|تجربه|ایجاد|شروع|تمام|ثبت|حفظ|دنبال|قبول|تحمل) کند(?![${FA_WORD}])`,
        'gu'
      ),
      '$1 کنه'
    ],
    // «بدهی» alone is ambiguous (the noun means "debt"), so the verb
    // reading is only rewritten after a whitelisted object: «توضیح
    // بدهی» → «توضیح بدی», while «بدهی‌های پرنرخ» stays untouched.
    [
      new RegExp(
        '(اجازه|نظر|ادامه|توضیح|جواب|پاسخ|گوش|انجام|انجامش|پس|تفت|' +
          `تغییر|گزارش|یاد|یادش|قرضش|نشان|نشون) بدهی(?![${FA_WORD}])`,
        'gu'
      ),
      '$1 بدی'
    ]
  ];

  /**
   * Whole-token map: formal word → conversational word. Tokens are
   * matched with Persian-aware boundaries (letters and ZWNJ), so
   * «را» never touches «راست» and «دیگر» never touches «یکدیگر».
   */
  const FA_TOKEN_MAP = {
    را: 'رو',
    آن: 'اون',
    آن‌ها: 'اون‌ها',
    آنها: 'اون‌ها',
    آنجا: 'اونجا',
    آن‌قدر: 'اون‌قدر',
    آنقدر: 'اونقدر',
    آنچه: 'چیزی که',
    همان: 'همون',
    همان‌جا: 'همون‌جا',
    همان‌طور: 'همون‌طور',
    همان‌قدر: 'همون‌قدر',
    او: 'اون',
    اگر: 'اگه',
    مگر: 'مگه',
    دیگر: 'دیگه',
    دیگری: 'دیگه\u200cای',
    یکدیگر: 'همدیگه',
    همدیگر: 'همدیگه',
    کدام: 'کدوم',
    هیچ‌کدام: 'هیچ‌کدوم',
    کدام‌یک: 'کدوم',
    چیست: 'چیه',
    کیست: 'کیه',
    اکنون: 'الان',
    هم‌اکنون: 'همین الان',
    بسیار: 'خیلی',
    چگونه: 'چطور',
    سپس: 'بعدش',
    زیرا: 'چون',
    نیز: 'هم',
    بنابراین: 'برای همین',
    برایم: 'برام',
    برایت: 'برات',
    برایش: 'براش',
    برایمان: 'برامون',
    برایتان: 'براتون',
    برایشان: 'براشون',
    خودمان: 'خودمون',
    خودتان: 'خودتون',
    خودشان: 'خودشون',
    ایشان: 'ایشون',
    بگویید: 'بگین',
    بگذار: 'بذار',
    بگذارم: 'بذارم',
    بگذاری: 'بذاری',
    بگذارد: 'بذاره',
    بگذاریم: 'بذاریم',
    بگذارید: 'بذارین',
    بگذارند: 'بذارن',
    بگویم: 'بگم',
    بگویی: 'بگی',
    بگوید: 'بگه',
    بگوییم: 'بگیم',
    بگویند: 'بگن',
    بکند: 'بکنه',
    بکشد: 'بکشه',
    بگیرد: 'بگیره',
    بیفتد: 'بیفته',
    بزند: 'بزنه',
    ببیند: 'ببینه',
    بپرسد: 'بپرسه',
    برسد: 'برسه',
    بنویسد: 'بنویسه',
    بخورد: 'بخوره',
    بسازد: 'بسازه',
    بفهمد: 'بفهمه',
    بپذیرد: 'بپذیره',
    بخوابد: 'بخوابه',
    بترسد: 'بترسه',
    ببرد: 'ببره',
    بیاورد: 'بیاره',
    بشناسد: 'بشناسه',
    بگردد: 'بگرده',
    برگردد: 'برگرده',
    بگذرد: 'بگذره',
    بشوم: 'بشم',
    بشوی: 'بشی',
    بشود: 'بشه',
    بشویم: 'بشیم',
    بشوند: 'بشن',
    نشوم: 'نشم',
    نشوی: 'نشی',
    نشود: 'نشه',
    نشوند: 'نشن',
    شود: 'بشه',
    شوند: 'بشن',
    بتوانم: 'بتونم',
    بتوانی: 'بتونی',
    بتواند: 'بتونه',
    بتوانیم: 'بتونیم',
    بتوانید: 'بتونین',
    بتوانند: 'بتونن',
    نتوانم: 'نتونم',
    نتوانی: 'نتونی',
    نتواند: 'نتونه',
    نتوانیم: 'نتونیم',
    نتوانند: 'نتونن',
    بخواهم: 'بخوام',
    بخواهی: 'بخوای',
    بخواهد: 'بخواد',
    بخواهیم: 'بخوایم',
    بخواهند: 'بخوان',
    نخواهم: 'نخوام',
    نخواهی: 'نخوای',
    نخواهد: 'نخواد',
    بدانم: 'بدونم',
    بدانی: 'بدونی',
    بداند: 'بدونه',
    بدانیم: 'بدونیم',
    بدانید: 'بدونین',
    بدانند: 'بدونن',
    ندانم: 'ندونم',
    ندانی: 'ندونی',
    نداند: 'ندونه',
    بمانم: 'بمونم',
    بمانی: 'بمونی',
    بماند: 'بمونه',
    بمانیم: 'بمونیم',
    بمانند: 'بمونن',
    نمانم: 'نمونم',
    نمانی: 'نمونی',
    نماند: 'نمونه',
    بروم: 'برم',
    بروی: 'بری',
    برود: 'بره',
    برویم: 'بریم',
    بروند: 'برن',
    نروم: 'نرم',
    نروی: 'نری',
    نرود: 'نره',
    بیایم: 'بیام',
    بیایی: 'بیای',
    بیاید: 'بیاد',
    بیایند: 'بیان',
    نیاید: 'نیاد',
    بدهد: 'بده',
    بدهم: 'بدم',
    بدهیم: 'بدیم',
    بدهید: 'بدین',
    بدهند: 'بدن',
    ندهد: 'نده',
    ندهم: 'ندم',
    دهد: 'بده',
    دهند: 'بدن',
    دارد: 'داره',
    ندارد: 'نداره',
    دارند: 'دارن',
    ندارند: 'ندارن',
    دارید: 'دارین',
    هستند: 'هستن',
    نیستند: 'نیستن',
    باشد: 'باشه',
    نباشد: 'نباشه',
    باشند: 'باشن',
    نباشند: 'نباشن',
    باشید: 'باشین',
    کنند: 'کنن',
    نکنند: 'نکنن',
    کنید: 'کنین',
    هستید: 'هستین',
    می‌توان: 'می‌شه',
    نمی‌توان: 'نمی‌شه'
  };

  /**
   * Colloquial present stems for the می‌/نمی‌ verb pass. Applied
   * to the exact stem inside the conjugated form: «می‌توانند» →
   * «می‌تونن», «نمی‌ماند» → «نمی‌مونه». Stems not listed here keep
   * their formal shape and only the person ending is adapted
   * («می‌پرسد» → «می‌پرسه»).
   */
  const FA_STEM_MAP = [
    ['گذار', 'ذار'],
    ['رسان', 'رسون'],
    ['نشان', 'نشون'],
    ['توان', 'تون'],
    ['خوان', 'خون'],
    ['دان', 'دون'],
    ['مان', 'مون'],
    ['آور', 'آر'],
    ['شو', 'ش'],
    ['رو', 'ر'],
    ['ده', 'د']
  ];

  /**
   * Person endings, formal → conversational, checked longest-first.
   * The 2nd-person plural «ید» becomes «ین» («می‌کنید» → «می‌کنین»),
   * the 3rd-person plural «ند» becomes «ن», and the 3rd-person
   * singular «د» becomes «ه».
   */
  const FA_ENDING_MAP = [
    ['یم', 'یم'],
    ['ید', 'ین'],
    ['ند', 'ن'],
    ['م', 'م'],
    ['ی', 'ی'],
    ['د', 'ه']
  ];

  /**
   * Simple-past and irregular present forms that must never enter the
   * generic stem+ending pass: «می‌شد» is past habitual, not a
   * present «ش + د». Checked against the part after می/نمی.
   */
  const FA_PAST_STEMS = [
    'شد',
    'کرد',
    'بود',
    'داد',
    'رفت',
    'گفت',
    'دید',
    'آمد',
    'اومد',
    'خورد',
    'گرفت',
    'گذشت',
    'ساخت',
    'یافت',
    'زد',
    'خواست',
    'توانست',
    'تونست',
    'دانست',
    'دونست',
    'نشست',
    'شناخت',
    'انداخت',
    'افتاد',
    'ایستاد',
    'شنید',
    'رسید',
    'پرسید',
    'کشید',
    'فهمید',
    'ترسید',
    'خرید',
    'خندید',
    'چرخید',
    'خوابید',
    'جنگید',
    'ارزید',
    'گنجید',
    'لرزید'
  ];
  const FA_PAST_FORMS = new RegExp(
    `^(?:${FA_PAST_STEMS.join('|')})(?:م|ی|یم|ید|ند|ن)?$`,
    'u'
  );

  /**
   * Irregular conjugations the stem+ending pass cannot produce.
   * «می‌خواهد» → «می‌خواد» (not «می‌خواه»), «می‌گوید» → «می‌گه»
   * (the گوی stem would otherwise misparse as a 2nd-person plural),
   * and the «می‌آید» family joins the prefix directly («میاد»).
   */
  const FA_IRREGULAR_VERBS = {
    خواهم: 'خوام',
    خواهی: 'خوای',
    خواهد: 'خواد',
    خواهیم: 'خوایم',
    خواهید: 'خواین',
    خواهند: 'خوان',
    گویم: 'گم',
    گویی: 'گی',
    گوید: 'گه',
    گوییم: 'گیم',
    گویید: 'گین',
    گویند: 'گن',
    آید: 'اد',
    آیم: 'ام',
    آیی: 'ای',
    آیند: 'ان'
  };

  /** «می‌آید» family joins the prefix directly: «میاد», «نمیاد». */
  const FA_JOIN_PREFIX_VERBS = new Set(['آید', 'آیم', 'آیی', 'آیند']);

  /**
   * Stems ending in «ن» whose 3rd-person singular («کن + د» = «کند»)
   * would otherwise misparse as a 3rd-person plural ending in «ند».
   * «می‌کند» must become «می‌کنه», never «می‌کن».
   */
  const FA_N_STEMS = new Set([
    'کن',
    'زن',
    'بین',
    'مان',
    'دان',
    'توان',
    'خوان',
    'نشان',
    'رسان',
    'چین',
    'شکن'
  ]);

  /**
   * Rewrites one می‌/نمی‌ conjugated verb into conversational form,
   * or returns null when the form is not safely convertible.
   * @param {string} prefix - «می» or «نمی»
   * @param {string} rest - The stem + person ending after the ZWNJ
   * @returns {string|null}
   */
  function colloquialVerb(prefix, rest) {
    if (FA_PAST_FORMS.test(rest)) {
      return null;
    }
    if (FA_IRREGULAR_VERBS[rest]) {
      if (FA_JOIN_PREFIX_VERBS.has(rest)) {
        return prefix + FA_IRREGULAR_VERBS[rest];
      }
      return prefix + ZWNJ + FA_IRREGULAR_VERBS[rest];
    }
    // Disambiguate «کند»-style forms first: a rest ending in a single
    // «ند» whose «stem + د» reading has a known ن-final stem is a
    // 3rd-person singular («می‌کند» → «می‌کنه»), not a plural.
    if (rest.endsWith('ند') && !rest.endsWith('نند')) {
      const singularStem = rest.slice(0, -1);
      if (FA_N_STEMS.has(singularStem)) {
        let stem = singularStem;
        for (const [formalStem, casualStem] of FA_STEM_MAP) {
          if (stem === formalStem) {
            stem = casualStem;
            break;
          }
        }
        return prefix + ZWNJ + stem + 'ه';
      }
    }
    for (const [formalEnding, casualEnding] of FA_ENDING_MAP) {
      if (!rest.endsWith(formalEnding)) {
        continue;
      }
      let stem = rest.slice(0, rest.length - formalEnding.length);
      if (!stem) {
        continue;
      }
      for (const [formalStem, casualStem] of FA_STEM_MAP) {
        if (stem === formalStem) {
          stem = casualStem;
          break;
        }
      }
      return prefix + ZWNJ + stem + casualEnding;
    }
    return null;
  }

  /** Words that keep «یک» formal: «شماره یک», «هر یک», «رتبه یک». */
  const FA_YEK_BLOCKERS = new Set(['هر', 'شماره', 'رتبه', 'عدد', 'نمره']);

  /**
   * Words whose copula must not merge: «کند است» would become «کنده»
   * (a different word) because «کند» the adjective is a homograph of
   * the verb stem.
   */
  const FA_COPULA_SKIP = new Set(['کند']);

  /**
   * Merges «X است» into the conversational copula: «مهم است» → «مهمه»,
   * «زیبا است» → «زیباست», «خانه است» → «خانه‌ست», and perfect forms
   * drop the copula entirely («گرفته است» → «گرفته»).
   * @param {string} text
   * @returns {string}
   */
  function mergeCopula(text) {
    return text.replace(
      new RegExp(`([${FA_WORD}]+) است(?=$|[\\s.,;:!?؟،؛…)»"'\u200c])`, 'gu'),
      (match, word) => {
        const last = word[word.length - 1];
        if (FA_COPULA_SKIP.has(word)) {
          return match;
        }
        if (PARTICIPLES.has(word)) {
          return word;
        }
        if (last === 'ه') {
          // «اه»/«وه» endings carry a PRONOUNCED h (راه، کوه، نگاه), so
          // the colloquial copula attaches directly: «روبه‌راهه». A
          // silent-e ه (خانه، ساده) takes the ZWNJ form: «خانه‌ست».
          if (/[او]ه$/u.test(word)) {
            return word + 'ه';
          }
          return word + ZWNJ + 'ست';
        }
        if (last === 'ا' || last === 'و') {
          return word + 'ست';
        }
        return word + 'ه';
      }
    );
  }

  /**
   * Collapses perfect person forms to the simple past for whitelisted
   * participles: «گرفته‌ای» → «گرفتی», «کرده‌اید» → «کردید»,
   * «شنیده‌ام» → «شنیدم». Nouns like «ایده‌ای» never match because
   * the whitelist only holds verb participles.
   * @param {string} text
   * @returns {string}
   */
  function collapsePerfect(text) {
    return text.replace(
      new RegExp(`([${FA_WORD}]+ه)${ZWNJ}(ام|ای|اید)(?![${FA_WORD}])`, 'gu'),
      (match, participle, ending) => {
        if (!PARTICIPLES.has(participle)) {
          return match;
        }
        const stem = participle.slice(0, -1);
        if (ending === 'ام') {
          return stem + 'م';
        }
        if (ending === 'ای') {
          return stem + 'ی';
        }
        return stem + 'ید';
      }
    );
  }

  /**
   * Applies the full Persian conversational pass to one unprotected
   * text segment.
   * @param {string} segment
   * @returns {string}
   */
  function persianSegment(segment) {
    let out = segment;
    // 1. Conjugated می‌/نمی‌ verbs (requires the ZWNJ, so «میدان» and
    //    other nouns starting with می never match).
    out = out.replace(
      new RegExp(
        `(?<![${FA_WORD}])(ن?می)${ZWNJ}([\\u0620-\\u064A\\u066E-\\u06D5]+)`,
        'gu'
      ),
      (match, prefix, rest) => colloquialVerb(prefix, rest) || match
    );
    // 2. Multi-word phrases (some consume verb output from step 1).
    for (const [pattern, replacement] of FA_PHRASES) {
      out = out.replace(pattern, replacement);
    }
    out = out.replace(
      new RegExp(`نشان (می${ZWNJ}ده|بده|داد|دادم|دادی|دادیم|دادند)`, 'gu'),
      'نشون $1'
    );
    // 3. Whole tokens.
    out = out.replace(
      new RegExp(
        `(?<![${FA_WORD}])([\\u0620-\\u064A\\u066E-\\u06D5\\u200c]+)(?![${FA_WORD}])`,
        'gu'
      ),
      (token) => FA_TOKEN_MAP[token] || token
    );
    // 4. «یک» → «یه» before an ordinary Persian word, guarded against
    //    «شماره یک»-style usages where the numeral is the point.
    out = out.replace(
      new RegExp(
        `(?<![${FA_WORD}])(?:([${FA_WORD}]+) )?یک (?=[\\u0620-\\u064A\\u066E-\\u06D5])`,
        'gu'
      ),
      (match, before) => {
        if (before && FA_YEK_BLOCKERS.has(before)) {
          return match;
        }
        return (before ? before + ' ' : '') + 'یه ';
      }
    );
    // 5. Attached possessives after plural «ها»: «کتاب‌هایش» →
    //    «کتاب‌هاش», and the vowel-attached form «پاهایش» → «پاهاش»
    //    (the [او] guard keeps words like «نهایت» and «رهایش» intact).
    out = out.replace(
      new RegExp(`${ZWNJ}های([متش])(?![${FA_WORD}])`, 'gu'),
      ZWNJ + 'ها$1'
    );
    out = out.replace(
      new RegExp(`(?<=[او])های([متش])(?![${FA_WORD}])`, 'gu'),
      'ها$1'
    );
    out = out.replace(
      new RegExp(`${ZWNJ}های(مان|تان|شان)(?![${FA_WORD}])`, 'gu'),
      (match, person) =>
        ZWNJ + 'ها' + { مان: 'مون', تان: 'تون', شان: 'شون' }[person]
    );
    // 6. Comparative plural copula: «عمیق‌ترند» → «عمیق‌ترن». At least
    //    one letter must precede «تر», so the loanword «ترند» (trend)
    //    never matches.
    out = out.replace(
      new RegExp(`([${FA_WORD}]تر)ند(?![${FA_WORD}])`, 'gu'),
      '$1ن'
    );
    // 7. Perfect person forms, then the copula merge last (it sees the
    //    final shape of every word).
    out = collapsePerfect(out);
    out = mergeCopula(out);
    return out;
  }

  // ======================================================================
  // English
  // ======================================================================

  /**
   * Contraction pairs. Subject+verb pairs require a following word so
   * sentence-final "that is what I heard." keeps "who I am." intact,
   * and free relatives ("who I am", "as it is") are excluded.
   */
  const EN_SUBJECT_CONTRACTIONS = [
    ['I am', "I'm"],
    ['I will', "I'll"],
    ['I would', "I'd"],
    ['you are', "you're"],
    ['you will', "you'll"],
    ['you would', "you'd"],
    ['we are', "we're"],
    ['we will', "we'll"],
    ['we would', "we'd"],
    ['they are', "they're"],
    ['they will', "they'll"],
    ['it is', "it's"],
    ['that is', "that's"],
    ['there is', "there's"],
    ['what is', "what's"],
    ['here is', "here's"],
    ['how is', "how's"]
  ];

  /** Negation contractions are safe anywhere, including sentence-final. */
  const EN_NEGATIONS = [
    ['is not', "isn't"],
    ['are not', "aren't"],
    ['was not', "wasn't"],
    ['were not', "weren't"],
    ['do not', "don't"],
    ['does not', "doesn't"],
    ['did not', "didn't"],
    ['cannot', "can't"],
    ['can not', "can't"],
    ['could not', "couldn't"],
    ['would not', "wouldn't"],
    ['should not', "shouldn't"],
    ['will not', "won't"],
    ['have not', "haven't"],
    ['has not', "hasn't"],
    ['had not', "hadn't"]
  ];

  /**
   * Builds one case-preserving contraction regex pass.
   * @param {string} formal
   * @param {string} casual
   * @param {boolean} needsFollowingWord
   * @returns {[RegExp, Function]}
   */
  function contractionRule(formal, casual, needsFollowingWord) {
    const body = formal.replace(/ /gu, '\\s+');
    const tail = needsFollowingWord ? '(?=\\s+[\\w“"\'])' : '\\b';
    const pattern = new RegExp(
      `(?<!\\b(?:who|as|way)\\s)\\b${body}${tail}`,
      'giu'
    );
    return [
      pattern,
      (match) =>
        match[0] === match[0].toUpperCase()
          ? casual[0].toUpperCase() + casual.slice(1)
          : casual
    ];
  }

  const EN_RULES = [
    // Negations first: "I will not share" must become "I won't share",
    // not the stilted "I'll not share" a subject-first pass would leave.
    ...EN_NEGATIONS.map(([a, b]) => contractionRule(a, b, false)),
    ...EN_SUBJECT_CONTRACTIONS.map(([a, b]) => contractionRule(a, b, true))
  ];

  /**
   * Applies the English conversational pass to one unprotected segment.
   * @param {string} segment
   * @returns {string}
   */
  function englishSegment(segment) {
    let out = segment;
    for (const [pattern, replace] of EN_RULES) {
      out = out.replace(pattern, replace);
    }
    return out;
  }

  // ======================================================================
  // Entry point
  // ======================================================================

  /**
   * Persian question-signalling suffixes. A bot sentence ending in a
   * period but carrying one of these (optionally with a trailing copula)
   * is a question that lost its mark; replace the trailing period with
   * «؟». Matched against the LAST word of the sentence so embedded
   * «چطور» in a statement ("this is how...") never triggers it.
   * The set is deliberately conservative: every entry is an unambiguous
   * interrogative when it sits at the end of a sentence.
   */
  const FA_QUESTION_TAILS = [
    'چطوره',
    'چطور',
    'چطوری',
    'چجوری',
    'چگونه',
    'کجایی',
    'کجایید',
    'کیستی',
    'چیه',
    'چیست',
    'کیه',
    'کیست',
    'چنده',
    'چقدره',
    'چقدر',
    'می‌خوای',
    'میخوای',
    'می‌خواهی',
    'میخواهی',
    'دوست داری',
    'موافقی',
    'موافقید',
    'می‌تونی',
    'میتونی',
    'می‌توانی',
    'داری',
    'نداری',
    'هستی',
    'هستید',
    'درسته',
    'درست است',
    'نکنم',
    'بزنیم',
    'بگم',
    'بگی',
    'بپرسم',
    'بریم',
    'بیام',
    'میای',
    'می‌آیی'
  ];

  /**
   * English question-signalling tails. Same contract as
   * FA_QUESTION_TAILS: only clear interrogative sentence-endings.
   */
  const EN_QUESTION_TAILS = [
    'are you',
    "aren't you",
    'do you',
    "don't you",
    'did you',
    "didn't you",
    'will you',
    "won't you",
    'can you',
    "can't you",
    'could you',
    'would you',
    'should you',
    'is it',
    "isn't it",
    'is that',
    'is this',
    'right now',
    'tell me',
    'want more',
    'another question'
  ];

  /**
   * Replaces the trailing period of a sentence that clearly ends in an
   * interrogative marker with the language-appropriate question mark.
   * Only the FINAL sentence of the outgoing reply is touched: a mid-
   * sentence clause that happens to end with «نامیده می‌شه.» followed
   * by more explanation must keep its period. Runs AFTER the
   * conversational rewrites, on the un-quoted output, so it sees the
   * colloquial forms that Darya actually sends (e.g. «می‌خوای»).
   * @param {string} text - Full outgoing bot text
   * @param {string} langCode - 'fa' or 'en'
   * @returns {string}
   */
  function enforceFinalQuestionMarks(text, langCode) {
    if (typeof text !== 'string' || !text) {
      return text;
    }
    const tails = langCode === 'fa' ? FA_QUESTION_TAILS : EN_QUESTION_TAILS;
    if (!tails || tails.length === 0) {
      return text;
    }
    const qMark = langCode === 'fa' ? '؟' : '?';
    // Locate the last sentence-ending punctuation in the reply and
    // only inspect what comes after the PREVIOUS sentence boundary.
    // This makes the pass a pure "is the whole final sentence a
    // question?" decision and prevents mid-reply periods from being
    // rewritten.
    const lastBoundary = text.search(/[.!?؟…][^.!?؟…]*$/u);
    if (lastBoundary === -1) {
      return text;
    }
    const punct = text[lastBoundary];
    if (punct !== '.' && punct !== '!') {
      return text; // already a question mark or ellipsis
    }
    // The sentence body runs from after the previous boundary (or the
    // start of text) up to (but not including) the final punctuation.
    const head = text.slice(0, lastBoundary);
    const body = head
      .slice(
        Math.max(
          head.lastIndexOf('.'),
          head.lastIndexOf('!'),
          head.lastIndexOf('?'),
          head.lastIndexOf('؟'),
          head.lastIndexOf('…')
        ) + 1
      )
      .trim();
    if (!body) {
      return text;
    }
    const tailText = body.toLowerCase();
    const matched = tails.some((tail) => tailText.endsWith(tail));
    if (!matched) {
      return text;
    }
    return text.slice(0, lastBoundary) + qMark + text.slice(lastBoundary + 1);
  }

  /**
   * Rewrites bot output into conversational register, leaving quoted
   * segments («...», "...") untouched so poetry and titles keep their
   * original wording.
   * @param {string} text - The outgoing bot message
   * @param {string} langCode - 'fa' or 'en'
   * @returns {string}
   */
  function toConversational(text, langCode) {
    if (typeof text !== 'string' || !text) {
      return text;
    }
    const transform = langCode === 'fa' ? persianSegment : englishSegment;
    let result = '';
    let cursor = 0;
    PROTECTED_SEGMENT.lastIndex = 0;
    let match = PROTECTED_SEGMENT.exec(text);
    while (match) {
      result += transform(text.slice(cursor, match.index)) + match[0];
      cursor = match.index + match[0].length;
      match = PROTECTED_SEGMENT.exec(text);
    }
    result += transform(text.slice(cursor));
    return enforceFinalQuestionMarks(result, langCode);
  }

  global.DaryaConversational = { toConversational, enforceFinalQuestionMarks };
})(typeof window !== 'undefined' ? window : globalThis);
