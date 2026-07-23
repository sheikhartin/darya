/**
 * Darya (دریا) — Persian language pack.
 *
 * Everything language-specific lives here: normalization rules, the
 * conversation rule set, fallback pools, a small sentiment lexicon, and
 * every piece of UI copy. `js/darya-engine.js` is entirely generic and
 * just consumes whichever pack is handed to it, so Persian and English
 * get identical engine capabilities with zero compromises on either side.
 *
 * The greeting system exposes three pools so the engine can pick the
 * shape that fits the moment:
 *   - greentingsOpen        : warm, no question
 *   - greentingsInviting    : a single, light invitation
 *   - greentingsReturning   : brief re-greeting later in the same conversation
 * The engine never defaults to "حال شما چطور است؟" -- it deliberately
 * varies the opening so a fresh conversation feels different every time.
 *
 * The half-space (ZWNJ) correction in `normalize()` is delegated to a
 * vendored copy of the `halfSpace` function from the @persian-tools
 * library (MIT-licensed, see `js/languages/halfspace.js`). The vendored
 * copy is self-contained (~10 KB) and adds an extra "joined-word"
 * correction step on top of the upstream library, so that inputs
 * written without any space at all (e.g. "میخواهم", "بیخبر",
 * "کتابهایم") are also normalized to their canonical ZWNJ form. The
 * upstream library is designed around whitespace-tokenized input and
 * deliberately does not handle the joined case; the joined-case rules
 * are conservative (curated stem lists, lookahead/lookbehind word
 * boundaries) and verified against a list of words that must NOT be
 * rewritten (میز, میدان, میهن, خوشبخت, متر, بیمه, بیبی, etc.).
 */

(function (global) {
  'use strict';

  const BOT_NAME = 'دریا';

  // The vendored halfSpace library is loaded as a sibling script tag
  // before this one, so `window.DaryaHalfSpace` is always defined by
  // the time `normalize()` runs. We capture it once at module load for
  // clarity (rather than reaching for `window` on every call).
  const HALF_SPACE_API = (global.DaryaHalfSpace || globalThis.DaryaHalfSpace);
  if (!HALF_SPACE_API || typeof HALF_SPACE_API.correct !== 'function') {
    // In a normal browser load this never fires -- the script tag
    // order in index.html guarantees the halfspace module is loaded
    // before this file. We throw a clear error rather than silently
    // degrading so a future script-order regression can't slip in.
    throw new Error('fa.js: halfspace.js must be loaded before fa.js (window.DaryaHalfSpace missing)');
  }

  // Persian/Arabic Unicode blocks, including presentation-form supplements
  // some fonts/keyboards produce.
  const SCRIPT_RANGE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

  const FALLBACK_SUBSTITUTIONS = [
    ['ي', 'ی'], // Arabic yeh -> Persian yeh
    ['ك', 'ک'], // Arabic kaf -> Persian kaf
    ['ة', 'ه'], // teh marbuta -> heh
    ['ۀ', 'ه'],
  ];

  /**
   * Normalizes raw Persian input for reliable pattern matching. This goes
   * a fair bit further than a plain character swap:
   *
   *   1. Unicode NFKC normalization: folds Arabic-script presentation
   *      forms and ligatures (the kind some keyboards/fonts produce for
   *      joined letter shapes) down to their standard, decomposed form,
   *      so a word typed with those glyphs still matches a rule written
   *      with ordinary letters.
   *   2. Character unification for known Arabic/Persian look-alikes
   *      (yeh, kaf, teh marbuta) that NFKC alone doesn't merge.
   *   3. Diacritic stripping, so vocalized text still matches plain text.
   *   4. Digit unification (Arabic-Indic -> Persian digits).
   *   5. Half-space (ZWNJ) correction for the most common cases where
   *      people type a full space, or no space at all, around the "می"
   *      and "نمی" verb prefixes -- e.g. "می خواهم" or "میخواهم" both
   *      become "می‌خواهم".
   *   6. Whitespace collapsing.
   *
   * This is a genuinely more capable normalizer than a single character
   * swap, but it is not a replacement for a real Persian NLP toolkit
   * like `hazm` (which the original Python version of this project
   * used): it doesn't stem, lemmatize, tokenize, or tag parts of speech.
   * Matching still relies on the curated suffix list in `SUFFIX` below
   * rather than true morphological analysis, since that's what's
   * achievable without a server or a large model running in the browser.
   */
  // Arabic diacritics (harakat/tashkil): fatha, damma, kasra, sukun,
  // shadda, tanwin, and the superscript alef. These are combining marks
  // that occasionally show up from certain keyboards or copy-pasted text
  // (e.g. Quranic-style input methods) and, left in place, would prevent
  // an otherwise-identical word from matching a rule's literal keyword.
  const DIACRITICS_PATTERN = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0670]/g;

  // Arabic-Indic and Extended Arabic-Indic digits, mapped to their
  // Persian (Eastern Arabic) equivalents, so "1" written with a different
  // regional digit set still reads consistently.
  const ARABIC_TO_PERSIAN_DIGITS = {
    '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴', '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹',
  };

  function normalize(text) {
    let normalized = String(text).normalize('NFKC').trim();

    for (const [src, dst] of FALLBACK_SUBSTITUTIONS) {
      normalized = normalized.split(src).join(dst);
    }

    normalized = normalized.replace(DIACRITICS_PATTERN, '');
    normalized = normalized.replace(/[٠-٩]/g, (digit) => ARABIC_TO_PERSIAN_DIGITS[digit]);

    // ----------------------------------------------------------------
    // Persian half-space (ZWNJ) normalization.
    // ----------------------------------------------------------------
    //
    // The Persian language uses a half-space (ZWNJ, U+200C) between
    // certain prefix-suffix combinations that are written as one
    // word but should not visually join (e.g. "کتاب" + "ها" ->
    // "کتاب‌ها", not "کتابها"). Many people skip the half-space in
    // chat input -- they type "کتابها" or "می خواهم" or "بیخبر"
    // -- and a normalizing engine should silently fix these.
    //
    // The half-space correction itself is delegated to the vendored
    // @persian-tools halfSpace module (see `js/languages/halfspace.js`
    // and the file header for the full rationale). That module
    // handles the comprehensive set of spaced cases (verb prefixes,
    // privative, negation, plurals, comparatives, known compounds)
    // using a tokenization approach, and additionally applies a
    // curated set of joined-case rules for inputs that lack the
    // separating space entirely ("میخواهم" -> "می‌خواهم",
    // "بیخبر" -> "بی‌خبر", "کتابهایم" -> "کتاب‌های‌م", etc.).
    //
    // We intentionally do not add any hand-rolled ZWNJ rules here
    // beyond what the vendored module provides: keeping a single
    // authoritative source for this behavior makes the resulting
    // text easier to reason about, easier to test, and easier to
    // update (a bug fix or rule addition in the upstream library
    // flows in with a single file update).
    normalized = HALF_SPACE_API.correct(normalized);

    // Whitespace collapsing.
    normalized = normalized.replace(/[ \t\r\n\f\v]+/g, ' ').trim();
    return normalized;
  }

  function rule(topic, priority, pattern, responses, options) {
    const r = { topic, priority, pattern, responses };
    if (options) Object.assign(r, options);
    return r;
  }

  // A curated set of common Persian pronominal/verb suffixes that attach
  // directly to a keyword with no space, e.g. "غمگین" -> "غمگینم" ("I am
  // sad"). Recognizing exactly these (rather than allowing *any* trailing
  // character) keeps matching accurate for real inflected forms while
  // still rejecting unrelated compounds -- e.g. it correctly stops "پدر"
  // ("father") from falsely matching inside "پدربزرگ" ("grandfather"),
  // since "بزرگ" isn't one of these suffixes.
  const SUFFIX = '(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?';

  /**
   * Builds a Persian-script-aware "whole word" pattern. `\b` doesn't work
   * for Persian text in JavaScript regex (it's defined in terms of ASCII
   * word characters), so this uses explicit lookaround instead: the
   * keyword (plus an optional common suffix) must not be directly
   * preceded or followed by another letter.
   *
   * The boundary check uses `\p{L}` (Unicode "is this a letter at all")
   * rather than a raw `[\u0600-\u06FF]` code-point range. That range
   * looks like it should mean "a Persian/Arabic letter", but the same
   * Unicode block also contains Arabic-script *punctuation* -- notably
   * "؟" (U+061F, the Persian question mark) -- so a raw range check
   * would treat "حالت چطور؟" as if "چطور" were followed by another
   * letter and incorrectly refuse to match. By the time this pattern
   * runs, the message has already passed the engine's overall
   * Persian-script check, so "any letter" is an accurate enough proxy
   * for "a Persian letter" here.
   * @param {string} alternatives
   * @param {string} [tail]
   * @returns {RegExp}
   */
  function pw(alternatives, tail) {
    return new RegExp(
      `(?<!\\p{L})(${alternatives})${SUFFIX}(?!\\p{L})${tail || ''}`,
      'iu'
    );
  }

  const rules = [
    rule('safety', 100, pw('خودکشی|خودزنی|آسیب زدن به خودم|دیگه نمیخوام زندگی کنم|دیگه نمی‌خوام زندگی کنم'), [
      'شنیدن این حرف از شما برایم بسیار مهم است و می‌خواهم بدانید که تنها نیستید. آیا در همین نزدیکی کسی هست که بتوانید همین حالا با او تماس بگیرید یا به او سر بزنید؟',
      'این احساس بسیار سنگینی است و شایسته‌ی توجه فوری است. لطفاً با یک خط بحران یا فرد قابل‌اعتمادی در همین لحظه تماس بگیرید؛ من در کنار شما هستم اما جای کمک تخصصی و فوری را نمی‌گیرم.',
    ]),

    rule('grief', 55, pw('فوت کرد|درگذشت|فقدان|از دست دادم|از دستش دادم'), [
      'از دست دادن، از سخت‌ترین تجربه‌های زندگی است. می‌خواهید کمی درباره‌اش بگویید؟',
      'برای این فقدان، هر حسی که دارید طبیعی است. این روزها چطور با آن کنار می‌آیید؟',
      'دوست دارید درباره‌اش برایم بگویید؟',
    ]),

    // Hopelessness: "همه چیز بی‌معنی است" / "هیچ چیز مهم نیست" / "چه
    // فایده‌ای". Not a safety pattern but a meaningful emotional
    // signal that deserves a real, calm response.
    rule('hopelessness', 45, pw('همه چیز بی‌معنی|هیچ‌چیز مهم نیست|هیچی مهم نیست|چه فایده|چه فایده‌ای|بی‌فایده|بیهوده|بی معنی|بی‌معنی'), [
      'وقتی همه‌چیز بی‌معنی به نظر می‌رسد، حتی کارهای کوچک هم سنگین می‌شوند. من با شما هستم.',
      'این یک‌دست بودن، خودش درد خاص خودش را دارد. از کِی این‌طور شده؟',
      'به نظر می‌رسد وزن زیادی با خودتان حمل می‌کنید. گوش می‌دهم.',
    ], {
      intensifierResponses: [
        'این وزن کوچک نیست. ممنون که نامش را گفتید.',
        'می‌شنوم. وقتی همه‌چیز این‌قدر بی‌حس است، کوچک‌ترین قدم هم ارزش دارد.',
      ],
    }),

    // "I want to disappear" / "می‌خواهم ناپدید شوم". Not a safety
    // pattern, but a related emotional signal.
    rule('dissociation', 40, pw('می‌خواهم ناپدید شوم|میخوام ناپدید شوم|دلم می‌خواد ناپدید شوم|کاش می‌شد ناپدید شوم'), [
      'می‌شنوم. وقتی می‌گویید «ناپدید شوم»، چه حسی در شما ایجاد می‌کند؟',
      'این فکر سنگینی است. من اینجا هستم. «ناپدید شدن» برایتان الان چه شکلی است؟',
    ]),

    // Comparative / temporal-shift: "قبلاً ... ولی حالا".
    rule('comparison', 30, pw('قبلاً|یه\s+زمانی|سابقا|در\s+گذشته'), [
      'به نظر می‌رسد یک جابه‌جایی مهم بین آن زمان و حالا هست. بزرگ‌ترین تفاوت چیست؟',
      'چیزی عوض شده. به نظرتان از کِی شروع شد؟',
    ]),

    // "حال شما چطور" is now answered with a varied, mostly non-question
    // response. The brief explicitly calls out "do not ask 'How are
    // you?' by default", so this rule is rephrased: only one of several
    // templates ever asks the user back, and even then with care.
    rule('smalltalk_howareyou', 60, pw('حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|چطوری|حالت خوبه|چه خبر|خوبی'), [
      'خوبم، ممنون. همین‌جا کنار شما هستم.',
      'خوبم، ممنون از لطف شما. هر وقت خواستید، اینجایم.',
      'روز خوبی داشته‌ام. اگر چیزی ذهن‌تان را درگیر کرده، با کمال میل گوش می‌دهم.',
      'ممنون که پرسیدید. من آماده‌ی گوش دادن به هر چیزی هستم که دلتان بخواهد بگویید.',
    ]),

    rule('smalltalk_identity', 60, pw('تو کی هستی|تو چی هستی|اسمت چیه|تو ربات هستی|هوش مصنوعی هستی|تو واقعی هستی|انسان هستی'), [
      'من دریا هستم، همراهی که اینجاست تا به حرف‌هایتان گوش بدهد. یک درمانگر یا انسان واقعی نیستم، فقط یک فضای آرام برای فکر کردن با صدای بلند.',
      'من یک همراه گفتگوی ساده‌ام، نه یک انسان واقعی؛ اما همین‌جا هستم تا با تمام وجود گوش بدهم.',
    ]),

    rule('smalltalk_capability', 60, pw('چیکار می‌تونی بکنی|چه کمکی می‌تونی بکنی|چیکار میکنی|چه کاری بلدی|چطور میتونی کمکم کنی|چیکار می‌کنی'), [
      'من اینجا هستم تا به حرف‌هایتان گوش بدهم، سؤال بپرسم، و کنارتان باشم وقتی چیزی ذهن‌تان را درگیر کرده. جای یک متخصص را نمی‌گیرم، اما یک شنونده‌ی صبور هستم.',
      'می‌توانم همراه خوبی برای فکر کردن با صدای بلند باشم؛ گوش می‌دهم و سؤال‌هایی می‌پرسم که کمک کند احساس‌تان برایتان روشن‌تر شود.',
    ]),

    rule('family', 50, pw('پدربزرگ|مادربزرگ|پدر|مادر|خانواده|والدین|خواهر|برادر', '\\s*(.*)'), [
      'درباره‌اش بیشتر برایم بگویید.',
      'موضوع خانواده همیشه جای سنگینی در دل دارد.',
      'رابطه‌ی شما با خانواده‌تان چه حسی در شما ایجاد می‌کند؟',
      'وقتی به آن فکر می‌کنید، چه احساسی سراغتان می‌آید؟',
      'چه چیزی باعث شد الآن یادش بیفتید؟',
    ]),

    rule('work', 50, pw('کار|شغل|رئیس|همکار|استخدام|اخراج', '\\s*(.*)'), [
      'کار و شغل گاهی بار سنگینی روی دوش‌مان می‌گذارد.',
      'درباره‌ی شرایط کاری‌تان بیشتر بگویید.',
      'کار و شغل گاهی بار سنگینی روی دوش‌مان می‌گذارد. این موضوع چطور بر شما اثر گذاشته؟',
      'درباره‌ی شرایط کاری‌تان بیشتر بگویید؛ چه چیزی بیش از همه آزارتان می‌دهد؟',
      'اگر شرایط کاری‌تان بهتر بود، چه چیزی فرق می‌کرد؟',
    ]),

    rule('sleep', 50, pw('خواب|بی‌خوابی|بیخوابی|کابوس'), [
      'به نظر می‌رسد خواب‌تان این روزها آرام نیست.',
      'بی‌خوابی می‌تواند نشانه‌ی نگرانی‌های پنهانی باشد.',
      'به نظر می‌رسد خواب‌تان این روزها آرام نیست. از کِی این‌طور شده؟',
      'بی‌خوابی می‌تواند نشانه‌ی نگرانی‌های پنهانی باشد. این روزها چه چیزی ذهن‌تان را مشغول کرده؟',
      'وقتی نمی‌توانید بخوابید، ذهن‌تان معمولاً کجا می‌رود؟',
    ]),

    rule('sadness', 40, pw('غمگین|ناراحت|افسرده|دلم گرفته|گریه'), [
      'می‌شنوم که این روزها غم زیادی همراه‌تان است.',
      'غمگین بودن سخت است.',
      'می‌شنوم که این روزها غم زیادی همراه‌تان است. دوست دارید بیشتر درباره‌اش صحبت کنیم؟',
      'غمگین بودن سخت است. چه چیزی این حس را در شما به وجود آورده؟',
      'اجازه بدهید کمی بیشتر در این احساس بمانیم؛ از کِی این‌طور احساس می‌کنید؟',
      'این غم را کجای بدن‌تان بیشتر حس می‌کنید؟',
    ], {
      intensifierResponses: [
        'این غم خیلی عمیق به نظر می‌رسد. من اینجا هستم.',
        'وقتی غم این‌قدر سنگین باشد، کل روز را پر می‌کند.',
        'نمی‌خواهم کوچکش کنم. این حس سنگینی است.',
      ],
    }),

    rule('anxiety', 40, pw('نگران|اضطراب|استرس|ترسیدم|می‌ترسم|میترسم'), [
      'اضطراب می‌تواند خیلی خسته‌کننده باشد.',
      'این نگرانی حقیقی است.',
      'اضطراب می‌تواند خیلی خسته‌کننده باشد. دقیقاً چه چیزی نگران‌تان کرده؟',
      'وقتی این استرس سراغتان می‌آید، در بدن‌تان چه احساسی دارید؟',
      'از ۱ تا ۱۰، الآن این نگرانی چقدر شدید است؟',
    ], {
      intensifierResponses: [
        'این سطح از نگرانی واقعاً خسته‌کننده است. من گوش می‌دهم.',
        'وقتی اضطراب این‌قدر شدید است، همه‌چیز فوری به نظر می‌رسد.',
        'این فقط یک نگرانی ساده نیست. این ترس واقعی است.',
      ],
    }),

    rule('anger', 40, pw('عصبانی|خشمگین|کفری|از دستش عصبانی'), [
      'به نظر می‌رسد خشم زیادی در شما جمع شده.',
      'عصبانیت شما قابل‌درک است.',
      'به نظر می‌رسد خشم زیادی در شما جمع شده. چه چیزی باعث این خشم شده؟',
      'عصبانیت شما قابل‌درک است. مایلید بگویید دقیقاً چه اتفاقی افتاد؟',
      'این خشم را در کدام قسمت از بدن‌تان بیشتر حس می‌کنید؟',
    ], {
      intensifierResponses: [
        'این خشم نگه‌داشتنش انرژی زیادی می‌گیرد.',
        'وقتی خشم این‌قدر شدید است، معمولاً نشانه‌ی چیز مهمی است.',
        'خشم عمیقی می‌شنوم. زیرش چه چیزی هست؟',
      ],
    }),

    rule('joy', 35, pw('خوشحال|شاد|هیجان‌زده|هیجان زده'), [
      'خوشحالم که این حس خوب را تجربه می‌کنید!',
      'شنیدن این خبر خوب است.',
      'خوشحالم که این حس خوب را تجربه می‌کنید! چه چیزی باعثش شده؟',
      'شنیدن این خبر خوب است. دوست دارید بیشتر درباره‌اش بگویید؟',
      'این حس خوب را در بدنتان کجا حس می‌کنید؟',
    ]),

    rule('loneliness', 40, pw('تنها|تنهایی|کسی رو ندارم|هیچ‌کس نیست'), [
      'تنهایی می‌تواند حس سنگینی باشد.',
      'این حس تنها بودن، قابل‌درک است.',
      'تنهایی می‌تواند حس سنگینی باشد. این حس از کِی همراه‌تان است؟',
      'وقتی می‌گویید تنها هستید، منظورتان بیشتر نبود کسی برای صحبت است یا حسی عمیق‌تر از جدا بودن؟',
      'در این روزها، چه کسی نزدیک‌ترین فرد به شماست، حتی اگر کم می‌بینیدش؟',
    ], {
      intensifierResponses: [
        'این عمق از تنهایی درد خاص خودش را دارد. من با شما هستم.',
        'وقتی تنهایی این‌قدر شدید است، حتی کارهای کوچک هم سخت‌تر می‌شوند.',
        'گوش می‌دهم. نمی‌خواهم در این گفتگو احساس تنهایی کنید.',
      ],
    }),

    rule('self_esteem', 40, pw('بی‌ارزش|بی ارزش|اعتماد به نفس ندارم|از خودم بدم میاد|به اندازه کافی خوب نیستم'), [
      'این حرف‌ها درباره‌ی خودتان سنگین‌اند.',
      'به نظر می‌رسد سخت با خودتان کنار می‌آیید.',
      'این حرف‌ها درباره‌ی خودتان سنگین‌اند. این باور از کجا شکل گرفته؟',
      'وقتی این فکرها می‌آیند، چه چیزی معمولاً باعثشان می‌شود؟',
      'اگر یک دوست همین حرف را درباره‌ی خودش می‌زد، به او چه می‌گفتید؟',
    ], {
      intensifierResponses: [
        'این صدا خیلی بلند است. من نه قرار است با آن بحث کنم، نه نادیده‌اش بگیرم.',
        'وقتی خودتان را بی‌ارزش می‌بینید، سخت است یادتان بماند احساسات واقعیت نیستند.',
        'درد واقعی در لحن‌تان هست. این مهم است.',
      ],
    }),

    rule('motivation', 35, pw('انگیزه ندارم|بی‌حوصله|بیحوصلگی|نمی‌تونم شروع کنم|تعلل می‌کنم'), [
      'وقتی انگیزه نیست، حتی کارهای کوچک هم سنگین می‌شوند.',
      'بی‌انگیزگی واقعی است و حق دارید که آن را حس کنید.',
      'وقتی انگیزه نیست، حتی کارهای کوچک هم سنگین می‌شوند. این حس از کِی شروع شده؟',
      'اگر یک قدم خیلی کوچک بردارید، چه چیزی می‌تواند باشد؟',
      'چه چیزی معمولاً کمک می‌کند دوباره شروع کنید، حتی کمی؟',
    ]),

    rule('relationship', 40, pw('دوست پسر|دوست دختر|همسر|نامزد|بهم زدیم|جدا شدیم|رابطه‌ام'), [
      'روابط می‌توانند هم عمیق‌ترین شادی‌ها و هم سخت‌ترین لحظات را بسازند.',
      'این موضوع مهم است.',
      'روابط می‌توانند هم عمیق‌ترین شادی‌ها و هم سخت‌ترین لحظات را بسازند. چه اتفاقی افتاده؟',
      'الآن بیشتر دنبال این هستید که با من درد دل کنید یا به راه‌حلی فکر کنید؟',
      'این رابطه چه جایگاهی در زندگی‌تان دارد؟',
    ]),

    rule('health', 35, pw('مریض|بیمار|درد دارم|سلامتی|دکتر رفتم'), [
      'نگرانی درباره‌ی سلامتی می‌تواند خیلی ذهن را درگیر کند.',
      'موضوع سلامت همیشه جای مهمی در ذهن دارد.',
      'نگرانی درباره‌ی سلامتی می‌تواند خیلی ذهن را درگیر کند. چه چیزی بیشتر نگران‌تان کرده؟',
      'آیا با پزشک درباره‌اش صحبت کرده‌اید؟',
      'این موضوع چقدر روی روزهای اخیرتان اثر گذاشته؟',
    ]),

    rule('gratitude', 25, pw('ممنون|سپاسگزار|قدردان|خوشحالم که هستی'), [
      'شنیدن این حرف برایم دلگرم‌کننده است، ممنون که گفتید.',
      'خوشحالم که این گفتگو براتون مفید بوده.',
      'حضور شما هم برای من ارزشمند است.',
    ]),

    rule('school', 35, pw('امتحان|کنکور|دانشگاه|نمره|استاد'), [
      'فشار درس و امتحان می‌تواند واقعاً خسته‌کننده باشد.',
      'موضوع درس و امتحان این روزها سنگینی می‌کند.',
      'فشار درس و امتحان می‌تواند واقعاً خسته‌کننده باشد. الآن دقیقاً چه چیزی فشار می‌آورد؟',
      'چقدر به این امتحان یا دوره مانده؟ و چه حسی نسبت بهش دارید؟',
      'چه چیزی می‌تواند کمی از این فشار کم کند؟',
    ]),

    rule('money', 35, pw('پول ندارم|مشکل مالی|بدهکار|قسط|هزینه‌ها'), [
      'نگرانی مالی می‌تواند روی خیلی چیزهای دیگر هم سایه بیندازد.',
      'موضوع مالی این روزها سنگینی می‌کند.',
      'نگرانی مالی می‌تواند روی خیلی چیزهای دیگر هم سایه بیندازد. چقدر این موضوع این روزها ذهن‌تان را درگیر کرده؟',
      'این نگرانی مالی از کِی شروع شده؟',
      'آیا کسی هست که بتوانید درباره‌ی این موضوع با او مشورت کنید؟',
    ]),

    rule('feeling', 30, /(?<!\p{L})(?:احساس می‌کنم|حس می‌کنم|فکر می‌کنم)(?!\p{L})\s*(.*)/iu, [
      'ممنون که این حس را با من در میان گذاشتید.',
      'این حس قابل‌درک است.',
      'چرا فکر می‌کنید که {captured}؟',
      'از کِی این‌طور احساس می‌کنید؟',
      'بیشتر توضیح می‌دهید که چرا {captured}؟',
      'اگر این احساس نبود، چه چیزی جایش را می‌گرفت؟',
    ]),

    rule('reasoning', 25, /(?<!\p{L})(?:چونکه|چون)(?!\p{L})\s*(.*)/iu, [
      'آیا این تنها دلیل آن است؟',
      'و آیا فکر می‌کنید این دلیل، همه‌ی ماجراست؟',
      'چه دلیل دیگری هم می‌تواند در کار باشد؟',
    ]),

    rule('need', 25, /(?<!\p{L})(?:نیاز دارم|می‌خواهم|میخوام|دلم می‌خواد)(?!\p{L})\s*(.*)/iu, [
      'اگر {captured} داشتید، چه چیزی در زندگی‌تان تغییر می‌کرد؟',
      'چه چیزی مانع رسیدن شما به {captured} شده؟',
      'اولین قدم کوچک چه می‌تواند باشد؟',
    ]),

    rule('affirmation', 15, /^(بله|آره|اره)\.?$/i, [
      'متوجه شدم. کمی بیشتر توضیح می‌دهید؟',
      'خب. چه چیز دیگری در این‌باره به ذهنتان می‌رسد؟',
    ]),

    rule('negation', 15, /^(نه|خیر)\.?$/i, [
      'باشه، اشکالی نداره. پس چه چیزی به ذهنتان می‌رسد؟',
      'متوجه‌ام. مایلید موضوع دیگری را مطرح کنید؟',
    ]),
  ];

  const trivialCaptures = new Set([
    'هستم', 'هستی', 'هست', 'هستیم', 'هستید', 'هستند', 'است', 'بود',
    'بودم', 'بودی', 'بودیم', 'بودید', 'بودند', 'شد', 'شدم', 'شدی', 'ام',
  ]);

  // Generic, non-question-leaning fallbacks. The engine mixes these
  // with question-shaped ones to break the perpetual question rhythm.
  const genericFallbacks = [
    'بیشتر برایم توضیح می‌دهید؟',
    'این موضوع برایتان چه اهمیتی دارد؟',
    'لطفاً کمی بیشتر درباره‌اش بگویید.',
    'متوجه شدم. و بعدش چه شد؟',
    'چه چیزی باعث شد این را با من در میان بگذارید؟',
  ];

  // Generic negation pool: used when a rule matched but it has no
  // dedicated `negationResponses`, or when the fallback path handles
  // a negated input. These lines acknowledge the "ن" without making
  // the user defend their position.
  const negationFallbacks = [
    'وقتی می‌گویید نیست، چه چیزی را از آن محافظت می‌کنید؟',
    'آن «ن» چه چیزی را به شما می‌گوید؟',
    'اگر آن حس نبود، به نظرتان چه چیزی جایش را می‌گرفت؟',
    'می‌شنوم که چیزی «نیست». چه چیزی به حقیقت نزدیک‌تر است؟',
  ];

  // Generic "I don't know" responses.
  const iDontKnowResponses = [
    'اشکالی ندارد. همین ندانستن، خودش یک جور صداقت است.',
    'لازم نیست همین الآن جواب داشته باشید.',
    'نشستن کنار «نمی‌دانم» می‌تواند خودش یک جور روشن‌شدن باشد.',
    'می‌شنوم. گاهی «نمی‌دانم» دقیق‌ترین چیزی است که می‌توان گفت.',
    'اشکالی ندارد که هنوز راه‌حل پیدا نشده. می‌توانیم فقط کنارش بنشینیم.',
  ];

  // Absolutist thinking responses.
  const absolutistResponses = [
    'وقتی می‌گویید «همیشه»، واقعاً همیشه است، یا بیشتر حس می‌کنید این‌طور است؟',
    '«هرگز» کلمه‌ی سنگینی است. حتی یک استثناء به ذهنتان می‌رسد؟',
    'برایم جالب است که «همه» می‌گویید؛ منظورتان همه‌ی آدم‌ها، یا کسانی که از همه به شما نزدیک‌ترند؟',
    'این «همیشه» بزرگی است. زندگی در دل آن چطور است؟',
  ];

  // "Again" / "same thing" reference templates.
  const againCallbackTemplates = [
    'به نظر می‌رسد این همان وزنی است که دوباره سراغ‌تان آمده.',
    'این حس برمی‌گردد، دقیقاً مثل همان موضوع قبلی.',
    'این هم {topic} است، در شکلی تازه.',
    'این الگوی آشنایی است با {topic}.',
  ];

  const againPatterns = [
    /(دوباره|باز\s+هم|همچنان|همان\s+مشکل|همان\s+مسئله|همان\s+چیز|دیگه\s+هم)/,
  ];

  const topicNames = {
    family: 'موضوع خانواده',
    work: 'موضوع کار',
    sleep: 'موضوع خواب',
    sadness: 'غم',
    anxiety: 'نگرانی',
    anger: 'خشم',
    loneliness: 'تنهایی',
    self_esteem: 'این فکرهای سخت درباره‌ی خودتان',
    grief: 'این فقدان',
    motivation: 'بی‌انگیزگی',
    relationship: 'آن رابطه',
    health: 'موضوع سلامت',
    school: 'موضوع درس',
    money: 'موضوع مالی',
  };

  // Deliberately non-question statements: picked on every Nth turn to
  // break the rhythm of constant follow-ups.
  const strategyShiftFallbacks = [
    'بیایید کمی مکث کنیم؛ همین الآن، بیشترین چیزی که ذهنتان را درگیر کرده چیست؟',
    'اگر بخواهید این حس را برای یک دوست توصیف کنید، چه می‌گفتید؟',
    'دوست دارید درباره‌ی موضوع دیگری هم صحبت کنیم؟',
    'چه چیزی الآن می‌تواند کمی این لحظه را برایتان سبک‌تر کند؟',
    'این حس، جای سنگینی دارد. من همین‌جا هستم، هر طور که بخواهید ادامه می‌دهیم.',
    'حق دارید که این‌طور احساس کنید.',
    'عجله‌ای نیست؛ هر وقت آماده بودید، ادامه می‌دهیم.',
  ];

  const sessionCheckIns = [
    'در این گفتگو درباره‌ی چند موضوع مختلف صحبت کردیم. می‌خواهم مطمئن باشم چیز مهمی از قلم نیفتاده.',
    'تا اینجا چیزهای زیادی گفتید.',
    'در این گفتگو درباره‌ی چند موضوع مختلف صحبت کردیم. کدام‌شان الآن بیشتر ذهن‌تان را درگیر کرده؟',
    'تا اینجا چیزهای زیادی گفتید. مایلید روی یکی‌شان بیشتر مکث کنیم؟',
  ];

  // Matches Persian question marks and the most common question words.
  const questionPattern = /[؟?]|(?<!\p{L})(چرا|چطور|چگونه|چیست|چیه|کجا|کیه|کیست|آیا|کدام|چقدر|چند)(?!\p{L})/u;

  const questionFallbacks = [
    'سؤال خوبی پرسیدید. من جواب دقیقی برایش ندارم.',
    'این سؤال ارزش فکر کردن دارد.',
    'سؤال خوبی پرسیدید. جواب دقیقی براش ندارم، اما کنجکاوم بدونم چی باعث شده این سؤال براتون پیش بیاد؟',
    'این سؤالی است که ارزش فکر کردن دارد. خودتان چه فکری درباره‌اش دارید؟',
  ];

  const topicCallbacks = {
    family: [
      'راستی، هنوز درباره‌ی خانواده‌تان کنجکاوم.',
      'پیش‌تر درباره‌ی خانواده‌تان صحبت می‌کردیم.',
      'راستی، هنوز درباره‌ی خانواده‌تان کنجکاوم؛ می‌خواهید ادامه دهیم؟',
    ],
    work: [
      'پیش‌تر درباره‌ی کارتان صحبت می‌کردیم.',
      'موضوع کار هنوز ذهن‌ مرا درگیر کرده.',
      'پیش‌تر درباره‌ی کارتان صحبت می‌کردیم؛ دوست دارید به آن برگردیم؟',
    ],
    sleep: [
      'پیش‌تر درباره‌ی خواب‌تان صحبت کردیم.',
      'موضوع خواب‌تان هنوز در ذهن من است.',
      'وضعیت خواب‌تان این روزها چطور است؟',
    ],
    sadness: [
      'آن حس غم که گفتید، هنوز در ذهن من است.',
      'پیش‌تر درباره‌ی غم‌تان صحبت کردیم.',
      'هنوز هم آن حس غم همراه‌تان است؟',
    ],
    anxiety: [
      'آن نگرانی که گفتید، هنوز در ذهن من است.',
      'پیش‌تر درباره‌ی نگرانی‌تان صحبت کردیم.',
      'آن نگرانی که گفته بودید، هنوز پابرجاست؟',
    ],
    anger: [
      'آن خشم که گفتید، هنوز در ذهن من است.',
      'پیش‌تر درباره‌ی خشم‌تان صحبت کردیم.',
      'آیا آن خشم هنوز در شماست؟',
    ],
    loneliness: [
      'آن حس تنهایی که گفتید، هنوز در ذهن من است.',
      'پیش‌تر درباره‌ی تنهایی‌تان صحبت کردیم.',
      'آن حس تنهایی که گفته بودید، هنوز همراه‌تان است؟',
    ],
    self_esteem: [
      'آن فکرهای سخت درباره‌ی خودتان، هنوز در ذهن من است.',
      'پیش‌تر درباره‌ی این موضوع صحبت کردیم.',
      'آن فکرهای سخت درباره‌ی خودتان، هنوز سراغتان می‌آیند؟',
    ],
    grief: [
      'آن فقدان که گفتید، هنوز در ذهن من است.',
      'پیش‌تر درباره‌ی آن فقدان صحبت کردیم.',
      'دوست دارید بازهم درباره‌ی آن فقدان صحبت کنیم؟',
    ],
    motivation: [
      'پیش‌تر درباره‌ی کم‌انگیزگی‌تان صحبت کردیم.',
      'موضوع انگیزه هنوز در ذهن من است.',
      'هنوز هم پیدا کردن انگیزه سخت است؟',
    ],
    relationship: [
      'پیش‌تر درباره‌ی آن رابطه صحبت می‌کردیم.',
      'آن رابطه که گفتید، هنوز در ذهن من است.',
      'وضعیت آن رابطه چطور پیش می‌رود؟',
    ],
    health: [
      'پیش‌تر درباره‌ی سلامت‌تان صحبت کردیم.',
      'موضوع سلامت‌تان هنوز در ذهن من است.',
      'حال‌تان از نظر جسمی چطور است؟',
    ],
    school: [
      'پیش‌تر درباره‌ی درس‌تان صحبت می‌کردیم.',
      'موضوع درس هنوز در ذهن من است.',
      'وضعیت درس و امتحان‌ها چطور پیش می‌رود؟',
    ],
    money: [
      'پیش‌تر درباره‌ی نگرانی مالی‌تان صحبت کردیم.',
      'موضوع مالی هنوز در ذهن من است.',
      'نگرانی مالی‌ای که گفته بودید، هنوز هست؟',
    ],
  };

  // A safe, language-agnostic-in-spirit callback: quoting the person's own
  // earlier words back to them is a core reflective-listening technique
  // and carries no grammar risk. Mix of statements and questions so
  // the engine can balance the question budget.
  const quotedCallbackTemplates = [
    'کمی قبل‌تر گفتید: «{excerpt}».',
    'یادم است گفتید: «{excerpt}».',
    'کمی قبل‌تر گفتید: «{excerpt}». دوست دارید بیشتر درباره‌اش بگوییم؟',
    'یادم است گفتید: «{excerpt}». هنوز ذهن‌تان درگیر آن است؟',
  ];

  // Gentle, optional coping offer shown when several consecutive messages
  // read as emotionally heavy.
  const distressNudges = [
    'به نظر می‌رسد چند پیام اخیرتان نسبتاً سنگین بوده‌اند. اگر دوست دارید، یک لحظه مکث کنیم: چهار شماره نفس بکشید، چهار شماره نگه دارید، چهار شماره بازدم بدهید. اگر این احساس‌ها ادامه داشت یا شدت گرفت، صحبت با یک متخصص یا فرد مورد اعتمادتان می‌تواند خیلی کمک‌کننده باشد.',
    'می‌بینم این بخش از گفتگو برایتان سنگین بوده. لازم نیست همین الآن حلش کنیم؛ اگر خواستید، می‌توانیم چند لحظه فقط مکث کنیم. و اگر این حس‌ها ادامه داشتند، صحبت با یک متخصص یا فردی که به او اعتماد دارید می‌تواند کمک بزرگی باشد.',
  ];

  const sentimentLexicon = {
    negative: [
      'غمگین', 'ناراحت', 'افسرده', 'خسته', 'نگران', 'اضطراب', 'استرس', 'تنها',
      'ترسیده', 'می‌ترسم', 'میترسم', 'عصبانی', 'خشمگین', 'ناامید', 'بی‌حوصله',
      'گریه', 'درد', 'دلتنگ', 'بی‌ارزش', 'داغون', 'وحشتناک', 'بد', 'سخت‌ترین',
    ],
    positive: [
      'خوشحال', 'شاد', 'عالی', 'ممنون', 'سپاسگزار', 'آرام', 'امیدوار', 'راحت',
      'خوب', 'عاشق', 'قدردان', 'سبک', 'خوشایند', 'دوست‌داشتنی', 'رضایت',
    ],
  };

  // Pronoun-swap reflection is intentionally NOT enabled for Persian.
  const pronounMap = null;
  const pronounReflectionFollowups = null;

  const exitKeywords = [
    'بدرود', 'خداحافظ', 'خدانگهدار', 'میخوام برم', 'می‌خوام برم', 'exit', 'quit',
  ];

  // Three greeting pools, picked by the engine based on context. The
  // OPEN pool never asks a question -- it just creates space. The
  // INVITING pool asks a single, light, non-generic invitation. The
  // RETURNING pool is for a re-greeting later in the same conversation.
  const greentingsOpen = [
    `درود! من ${BOT_NAME} هستم. خوشحالم که اینجا کنار شما هستم.`,
    `سلام. من ${BOT_NAME} هستم و با تمام وجود گوش می‌دهم.`,
    `به دریا خوش آمدید. هر چه در دل دارید، اینجا جایش امن است.`,
    `سلام. من ${BOT_NAME} هستم، همین‌جا کنار شما.`,
    `من ${BOT_NAME} هستم. هر وقت آماده بودید، شروع کنیم.`,
  ];

  const greentingsInviting = [
    'هر وقت آماده بودید، هر چه در دل دارید بنویسید.',
    'اگر دوست داشته باشید، می‌توانیم از هر جا که دلتان می‌خواهد شروع کنیم.',
    'امروز دوست دارید درباره‌ی چه چیزی فکر کنیم؟',
    'می‌توانیم از هر موضوعی که برایتان مهم است شروع کنیم.',
  ];

  const greentingsReturning = [
    'سلام دوباره.',
    'باز هم خوش آمدید.',
    'دوباره سلام -- هنوز اینجایم و گوش می‌دهم.',
    'خوشحالم که برگشتید.',
  ];

  // Bare-acknowledgment responses: a brief, non-question line for "باشه",
  // "آره", "اوکی", "هممم" and the like.
  const acknowledgmentTokens = new Set([
    'باشه', 'خب', 'خوب', 'آره', 'بله', 'بله', 'اره', 'اوکی', 'okay', 'ok',
    'نه', 'هیچ', 'هممم', 'هوم', 'هوممم', 'آها', 'اها', 'می‌دونم', 'میدونم',
    'درسته', 'دقیقا', 'دقیقاً', 'همینه', 'همینه', 'آفرین', 'ممنون',
  ]);

  const acknowledgmentResponses = [
    'متوجه‌ام.',
    'باشه.',
    'خُب.',
    'ممنون که گفتید.',
    'یادداشت کردم.',
  ];

  // Reference memory: short content words that are too generic to bother
  // remembering as the "thing the user just mentioned".
  const referenceStopwords = [
    'این', 'آن', 'یک', 'یه', 'هم', 'همه', 'هست', 'هستم', 'هستی', 'هستند',
    'بود', 'بودم', 'بودی', 'بودند', 'شده', 'شد', 'میشه', 'می‌شود',
    'داشت', 'داشتم', 'داشتی', 'داشتند', 'داره', 'دارم', 'داری',
    'بوده', 'بودیم', 'بودید', 'بودند', 'دیگه', 'دیگر', 'خیلی', 'کمی',
    'یکم', 'یکی', 'دوتا', 'چند', 'چندتا', 'همه', 'هیچ', 'هیچی',
    'بعضی', 'هر', 'هرچی', 'هرچه', 'وقتی', 'وقتیکه', 'الان', 'حالا',
    'بعد', 'بعدا', 'بعداً', 'قبل', 'قبلا', 'قبلاً', 'البته', 'ولی',
    'اما', 'پس', 'اگه', 'اگر', 'چون', 'چونکه', 'برای', 'تا',
    'روی', 'در', 'از', 'به', 'با', 'بدون', 'بین',
  ];

  const farewells = [
    'بدرود، مراقب خودتان باشید. هر وقت خواستید صحبت کنیم، اینجا هستم.',
    'بدرود عزیز. امیدوارم امروز کمی سبک‌تر شده باشید.',
    'به امید دیدار دوباره. بدرود و مراقب دل خودتان باشید.',
  ];

  // Empathetic farewells for when the last few messages leaned negative.
  const farewellsEmpathetic = [
    'بدرود. هر چه امروز با خودتان حمل می‌کنید، امیدوارم کمی جا برای نفس کشیدن پیدا کنید.',
    'بدرود عزیز. لطفاً مهربان با خودتان باشید و اگر دلتان خواست، برگردید.',
    'بدرود. خوشحالم که امروز حرف زدید، حتی درباره‌ی کارهای سخت.',
  ];

  const emptyInputReply = 'می‌شنوم که سکوت کرده‌اید. هر وقت آماده بودید، صحبت کنید.';

  function foreignLanguageRedirect() {
    return `من ${BOT_NAME} هستم و تنها به زبان فارسی گفت‌وگو می‌کنم، تا بتوانم بهترین همراهی را داشته باشم. لطفاً پیام‌تان را به فارسی بنویسید تا ادامه دهیم.`;
  }

  global.DaryaLang = global.DaryaLang || {};
  global.DaryaLang.fa = {
    code: 'fa',
    dir: 'rtl',
    botName: BOT_NAME,
    scriptRange: SCRIPT_RANGE,
    minScriptRatio: 0.85,
    normalize,
    rules,
    trivialCaptures,
    genericFallbacks,
    negationFallbacks,
    strategyShiftFallbacks,
    sessionCheckIns,
    checkInEvery: 8,
    questionPattern,
    questionFallbacks,
    iDontKnowResponses,
    absolutistResponses,
    againCallbackTemplates,
    againPatterns,
    topicNames,
    topicCallbacks,
    quotedCallbackTemplates,
    distressNudges,
    sentimentLexicon,
    pronounMap,
    pronounReflectionFollowups,
    exitKeywords,
    greetings: greentingsOpen, // Backwards-compatible alias.
    greentingsOpen,
    greentingsInviting,
    greentingsReturning,
    acknowledgmentTokens,
    acknowledgmentResponses,
    referenceStopwords,
    farewells,
    farewellsEmpathetic,
    emptyInputReply,
    foreignLanguageRedirect,
    // Greeting intent detection: words / phrases that, on their own,
    // signal a pure greeting intent. Note: "حالت چطور" and similar
    // how-are-you phrasings are deliberately NOT in this list -- they
    // route to the smalltalk_howareyou rule, which is the better fit for
    // that intent.
    greetingTokens: new Set([
      'سلام', 'درود', 'سلامی', 'سلامتی',
      'صبح', 'عصر', 'شب', 'روز',
    ]),
    greetingPhrases: [
      'سلام', 'درود', 'سلام علیکم', 'علیکم سلام',
      'صبح بخیر', 'صبح به خیر', 'روز بخیر', 'روز به خیر',
      'عصر بخیر', 'عصر به خیر', 'شب بخیر', 'شب به خیر',
      'وقت بخیر', 'درود بر شما', 'سلام گرم',
    ],
    ui: {
      appTitle: 'دریا · همراه گفتگوی آرام',
      appDescription: 'دریا، همراه گفتگوی فارسی‌زبان برای گوش دادن و همراهی.',
      placeholderDefault: 'هر چه در دل دارید بنویسید…',
      placeholderEnded: 'گفتگو پایان یافت. برای شروع دوباره، از منو «گفتگوی تازه» را بزنید',
      ariaSendLabel: 'ارسال پیام',
      ariaMenuLabel: 'گزینه‌ها',
      ariaInputLabel: 'پیام شما به دریا',
      menuNewChat: 'گفتگوی تازه',
      menuExportMd: 'دانلود گفتگو مارک‌داون',
      menuExportTxt: 'دانلود گفتگو متن ساده',
      themeOceanLabel: 'تم اقیانوس',
      themeBeachLabel: 'تم ساحل',
      disclaimer: 'دریا یک همراه شنونده است، نه جایگزین کمک تخصصی. در شرایط بحرانی، لطفاً با یک متخصص یا خط بحران تماس بگیرید.',
      foreignScriptHint: 'لطفاً فقط به زبان فارسی بنویسید تا بتوانم همراهی‌تان کنم.',
      exportTitle: `گفت‌وگو با ${BOT_NAME}`,
      exportYouLabel: 'شما',
      exportDivider: '-----------------------------',
      dateLocale: 'fa-IR',
      connectionError: 'در برقراری ارتباط مشکلی پیش آمد. لطفاً صفحه را دوباره بارگذاری کنید.',
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
