/**
 * Persian half-space normalizer.
 *
 * This file is a small, browser-ready vendoring of the halfSpace helper from
 * @persian-tools/persian-tools 4.0.4.  The upstream helper is intentionally
 * kept dependency-free here: Darya is a static, offline application and must
 * not need a package loader in the browser.  The MIT notice for the original
 * package is in licenses/MIT-persian-tools.txt.
 *
 * A zero-width non-joiner (ZWNJ, U+200C) is called a نیم‌فاصله (half-space) in
 * Persian typography.  It keeps words such as می‌روم readable while keeping
 * the two morphological parts from becoming an ordinary, separate phrase.
 * The upstream implementation handles a useful set of adjacent words.  The
 * extra verb, prefix, comparative, and possessive rules below cover the
 * forms that are especially common in a conversation and were missing from
 * that implementation.
 */

(function (global) {
  'use strict';

  const ZWNJ = '\u200c';
  const PERSIAN_SCRIPT = /[\u0600-\u06ff\ufb50-\ufdff\ufe70-\ufeff]/u;
  const PERSIAN_LETTER = /\p{L}/u;
  const DIACRITICS = /[\u0610-\u061a\u064b-\u065f\u06d6-\u06ed\u0670]/gu;
  const ARABIC_DIGITS = {
    '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴',
    '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹',
  };

  // Arabic look-alikes commonly produced by keyboards.  These are the same
  // conservative substitutions used by Persian Tools' text normalizers.
  const CHAR_REPLACEMENTS = new Map([
    ['ي', 'ی'], ['ى', 'ی'], ['ﻱ', 'ی'], ['ﻲ', 'ی'],
    ['ك', 'ک'], ['ﻚ', 'ک'], ['ة', 'ه'], ['ﺔ', 'ه'], ['ۀ', 'ه'],
    ['ؤ', 'و'], ['ئ', 'ی'], ['ـ', ''],
  ]);

  // Words that are safe and useful after the progressive prefixes.  Keeping
  // this list explicit avoids corrupting roots such as میز (table), میدان
  // (square), میهن (homeland), and میان (between).
  const VERB_STEMS = new Set([
    'خواهم', 'خواهی', 'خواهد', 'خواهیم', 'خواهید', 'خواهند',
    'خواستن', 'خواستم', 'خواستی', 'خواست', 'خواستیم', 'خواستید', 'خواستند',
    'روم', 'روی', 'رود', 'رویم', 'روید', 'روند', 'رفتن', 'رفتم', 'رفتی',
    'رفت', 'رفتیم', 'رفتید', 'رفتند', 'رسد', 'رسیم', 'رسم',
    'باشم', 'باشی', 'باشد', 'باشیم', 'باشید', 'باشند', 'بودن', 'بودم',
    'بودی', 'بود', 'بودیم', 'بودید', 'بودند',
    'کنم', 'کنی', 'کند', 'کنیم', 'کنید', 'کنند', 'کردن', 'کردم', 'کردی',
    'کرد', 'کردیم', 'کردید', 'کردند',
    'شوم', 'شوی', 'شود', 'شویم', 'شوید', 'شوند', 'شدن', 'شدم', 'شدی',
    'شد', 'شدیم', 'شدید', 'شدند',
    'توانم', 'توانی', 'تواند', 'توانیم', 'توانید', 'توانند',
    'دانم', 'دانی', 'داند', 'دانیم', 'دانید', 'دانند',
    'بینم', 'بینی', 'بیند', 'بینیم', 'بینید', 'بینند',
    'گویم', 'گویی', 'گوید', 'گوییم', 'گویید', 'گویند',
    'خوانم', 'خوانی', 'خواند', 'خوانیم', 'خوانید', 'خوانند',
    'نویسم', 'نویسی', 'نویسد', 'نویسیم', 'نویسید', 'نویسند',
    'خوابم', 'خوابی', 'خوابد', 'خوابیم', 'خوابید', 'خوابند',
    'خندم', 'خندی', 'خندد', 'خندیم', 'خندید', 'خندند',
    'ترسم', 'ترسی', 'ترسد', 'ترسیم', 'ترسید', 'ترسند',
    'فهمم', 'فهمی', 'فهمد', 'فهمیم', 'فهمید', 'فهمند',
    'مانم', 'مانی', 'ماند', 'مانیم', 'مانید', 'مانند',
    'گذارم', 'گذاری', 'گذارد', 'گذاریم', 'گذارید', 'گذارند',
    'دارم', 'داری', 'دارد', 'داریم', 'دارید', 'دارند',
    'می‌خواهم', 'می‌خواهی', 'می‌خواهد', 'می‌خواهیم', 'می‌خواهید', 'می‌خواهند',
  ]);

  // Progressive forms may arrive already joined, so the stem is kept in a
  // second list without the prefix as well.  This list is deliberately
  // broad enough for ordinary chat, but never applies to arbitrary می...
  // words.
  const JOINED_PROGRESSIVE_STEMS = [
    'خواه', 'روم', 'روی', 'رود', 'رویم', 'روید', 'روند',
    'باشم', 'باشی', 'باشد', 'باشیم', 'باشید', 'باشند',
    'کنم', 'کنی', 'کند', 'کنیم', 'کنید', 'کنند',
    'شوم', 'شوی', 'شود', 'شویم', 'شوید', 'شوند',
    'توانم', 'توانی', 'تواند', 'توانیم', 'توانید', 'توانند',
    'دانم', 'دانی', 'داند', 'دانیم', 'دانید', 'دانند',
    'بینم', 'بینی', 'بیند', 'بینیم', 'بینید', 'بینند',
    'گویم', 'گویی', 'گوید', 'گوییم', 'گویید', 'گویند',
    'نویسم', 'نویسی', 'نویسد', 'نویسیم', 'نویسید', 'نویسند',
    'خوانم', 'خوانی', 'خواند', 'خوانیم', 'خوانید', 'خوانند',
    'خوابم', 'خوابی', 'خوابد', 'خوابیم', 'خوابید', 'خوابند',
    'دارم', 'داری', 'دارد', 'داریم', 'دارید', 'دارند',
  ].sort((a, b) => b.length - a.length);

  // بی is normally a bound privative prefix, but it is also a free word in
  // phrases such as بی تو (without you).  Only the common lexicalized
  // compounds are joined; this is the important distinction missing from a
  // naïve global replacement.
  const PRIVATIVE_WORDS = new Set([
    'ادب', 'احترام', 'اختیار', 'اعتماد', 'اهمیت', 'انتها', 'انرژی',
    'خبر', 'خود', 'خیال', 'دلیل', 'درد', 'دقت', 'ربط', 'رحم', 'رنگ',
    'سابقه', 'سواد', 'شمار', 'شک', 'صدا', 'طرف', 'فایده', 'فکر', 'قید',
    'قرار', 'قیمت', 'معنی', 'ملاحظه', 'نظیر', 'نظم', 'نیاز', 'هدف',
    'جهت', 'جهان', 'نهایت', 'مثال', 'مورد', 'باک', 'حوصله', 'خیال',
  ]);

  const NEGATIVE_PREFIX_WORDS = new Set([
    'امید', 'امیدی', 'نظم', 'امکان', 'آرام', 'آشنا', 'مناسب', 'معلوم',
    'خود', 'درمان', 'توان', 'بود', 'شد', 'کرد', 'خوان', 'بین', 'ساخت',
  ]);

  const COMPARATIVE_BASES = new Set([
    'بزرگ', 'کوچک', 'کم', 'خوب', 'بد', 'سریع', 'آسان', 'سخت', 'زیاد', 'بیش',
    'زود', 'دیر', 'بهتر', 'بدتر', 'قوی', 'ضعیف', 'روشن', 'تاریک', 'زیبا',
    'عمیق', 'بلند', 'کوتاه', 'گرم', 'سرد', 'نزدیک', 'دور', 'مهم', 'ساده',
  ]);

  const NON_PLURAL_HA_WORDS = new Set([
    'رها', 'بها', 'نها', 'تها', 'گاها', 'کجاها', 'چراها',
  ]);

  // Common pairs copied from the upstream halfSpace helper.  They are kept
  // as data rather than a single enormous regular expression so each rule
  // remains inspectable and the browser performs no surprising backtracking.
  const COMMON_COMPOUNDS = [
    ['هم', 'چنین'], ['هم', 'اکنون'], ['هم', 'زمان'], ['هم', 'راه'],
    ['هم', 'چنان'], ['همین', 'طور'], ['همان', 'طور'], ['همان', 'گونه'],
    ['هیچ', 'کس'], ['هیچ', 'گاه'], ['هیچ', 'گونه'], ['هیچ', 'جا'],
    ['هیچ', 'کدام'], ['هیچ', 'کس‌'], ['این', 'جا'], ['آن', 'جا'],
    ['این', 'که'], ['آن', 'که'], ['هر', 'کس'], ['هر', 'چه'], ['هر', 'جا'],
    ['هر', 'که'], ['چه', 'قدر'], ['چه', 'چیز'], ['چه', 'کار'], ['چه', 'طور'],
    ['چند', 'سال'], ['چند', 'ماه'], ['چند', 'روز'], ['چند', 'نفر'],
    ['چند', 'هزار'], ['چند', 'میلیون'], ['به', 'هرحال'], ['به', 'هرروی'],
    ['به', 'اضافه'], ['به', 'نسبت'], ['به', 'ندرت'], ['به', 'ویژه'],
    ['به', 'شدت'], ['به', 'سختی'], ['به', 'واقع'], ['به', 'احتمال'],
    ['به', 'جز'], ['به', 'غیر'], ['به', 'وسیله'], ['به', 'همراه'],
    ['به', 'وجود'], ['علاوه', 'بر'], ['تعداد', 'زیادی'], ['قبل', 'از'],
    ['بعد', 'از'], ['پیش', 'از'], ['پس', 'از'], ['پیش', 'رو'], ['دیر', 'هنگام'],
    ['زمانی', 'که'], ['وقتی', 'که'], ['هنگامی', 'که'], ['اکنون', 'که'],
    ['زمان', 'آن'], ['زمان', 'این'], ['وقت', 'آن'], ['وقت', 'این'],
    ['زمان', 'هایی'], ['وقت', 'هایی'], ['هنگام', 'هایی'],
  ];

  const PERSIAN_PUNCTUATION = /[،؛؟!,.:\[\]{}()«»"'،]/u;
  const WORD_OR_SEPARATOR = /\s+|[^\s]+/gu;
  const POSSESSIVE_SUFFIXES = [
    'مان', 'تان', 'شان', 'یم', 'یت', 'یش', 'یمان', 'یتان', 'یشان',
    'م', 'ت', 'ش', 'ام', 'ات', 'اش',
  ].sort((a, b) => b.length - a.length);

  function replaceArabicCharacters(text) {
    return [...text].map((char) => CHAR_REPLACEMENTS.get(char) || char).join('');
  }

  function normalizeDigits(text) {
    return text.replace(/[٠-٩]/gu, (digit) => ARABIC_DIGITS[digit]);
  }

  function isWord(value) {
    // Punctuation may be attached to a word (روم، / خانه!). It must not
    // prevent the lexical part from participating in a join.
    return Boolean(value) && !/^\s+$/u.test(value) && hasPersianLetter(value);
  }

  function hasPersianLetter(value) {
    return [...value].some((character) => PERSIAN_LETTER.test(character) && PERSIAN_SCRIPT.test(character));
  }

  function isPersianWord(value) {
    return isWord(value) && PERSIAN_SCRIPT.test(value);
  }

  function trimPunctuation(value) {
    return value.replace(/^[،؛؟!,.:\[\]{}()«»"']+|[،؛؟!,.:\[\]{}()«»"']+$/gu, '');
  }

  function preserveCasePunctuation(value, replacement) {
    const leading = value.match(/^[،؛؟!,.:\[\]{}()«»"']*/u)?.[0] || '';
    const trailing = value.match(/[،؛؟!,.:\[\]{}()«»"']*$/u)?.[0] || '';
    return `${leading}${replacement}${trailing}`;
  }

  function stripJoiner(value) {
    return value.replace(/[\u200b\u200c\u200d\ufeff]/gu, '');
  }

  function stemAfterPrefix(value, prefix) {
    const bare = stripJoiner(trimPunctuation(value));
    return bare.startsWith(prefix) ? bare.slice(prefix.length) : '';
  }

  function progressiveWord(value) {
    const bare = stripJoiner(trimPunctuation(value));
    for (const prefix of ['نمی', 'می']) {
      const stem = stemAfterPrefix(bare, prefix);
      if (stem && (VERB_STEMS.has(stem) || JOINED_PROGRESSIVE_STEMS.includes(stem))) {
        return `${prefix}${ZWNJ}${stem}`;
      }
    }
    return null;
  }

  function joinPrefix(left, right) {
    const leftWord = trimPunctuation(left);
    const rightWord = trimPunctuation(right);
    if (!isPersianWord(leftWord) || !isPersianWord(rightWord)) return null;

    if ((leftWord === 'می' || leftWord === 'نمی') && VERB_STEMS.has(rightWord)) {
      return `${leftWord}${ZWNJ}${rightWord}`;
    }
    if (leftWord === 'بی' && PRIVATIVE_WORDS.has(rightWord)) {
      return `${leftWord}${ZWNJ}${rightWord}`;
    }
    if (leftWord === 'نا' && NEGATIVE_PREFIX_WORDS.has(rightWord)) {
      return `${leftWord}${ZWNJ}${rightWord}`;
    }
    return null;
  }

  function joinSuffix(left, right) {
    const leftWord = trimPunctuation(left);
    const rightWord = trimPunctuation(right);
    if (!isPersianWord(leftWord) || !isPersianWord(rightWord)) return null;

    if (rightWord === 'ها' || rightWord === 'های' || /^(?:ها|های)(?:یم|یت|یش|مان|تان|شان|م|ت|ش)$/u.test(rightWord)) {
      if (leftWord.length > 1 && !leftWord.endsWith(ZWNJ)) {
        // The possessive belongs to the plural word: کتاب‌هایم, not
        // کتاب‌ها‌یم.  There is one joiner between the noun and ها/های.
        return `${leftWord}${ZWNJ}${rightWord}`;
      }
    }
    if (rightWord === 'تر' || rightWord === 'ترین') {
      if (leftWord.length > 1 && !leftWord.endsWith(ZWNJ)) {
        return `${leftWord}${ZWNJ}${rightWord}`;
      }
    }
    if (leftWord.endsWith('ها') || leftWord.endsWith('های')) {
      if (POSSESSIVE_SUFFIXES.includes(rightWord)) {
        return `${leftWord}${ZWNJ}${rightWord}`;
      }
    }
    return null;
  }

  function joinKnownCompound(left, right) {
    const leftWord = trimPunctuation(left);
    const rightWord = trimPunctuation(right);
    for (const [first, second] of COMMON_COMPOUNDS) {
      if (leftWord === first && rightWord === second) {
        return `${leftWord}${ZWNJ}${rightWord}`;
      }
    }
    return null;
  }

  function joinAdjacentWords(parts) {
    const output = [];
    let index = 0;
    while (index < parts.length) {
      const current = parts[index];
      const separator = parts[index + 1];
      const next = parts[index + 2];
      if (isWord(current)) {
        const progressive = progressiveWord(current);
        if (progressive) {
          parts[index] = preserveCasePunctuation(current, progressive);
        }
      }

      if (isWord(current) && /^\s+$/u.test(separator || '') && isWord(next)) {
        const replacement = joinPrefix(current, next)
          || joinSuffix(current, next)
          || joinKnownCompound(current, next);
        if (replacement) {
          const trailing = next.match(/[،؛؟!,.:\[\]{}()«»"']+$/u)?.[0] || '';
          output.push(preserveCasePunctuation(current, replacement) + trailing);
          index += 3;
          continue;
        }
      }
      output.push(parts[index]);
      index += 1;
    }
    return output;
  }

  function normalizeJoinedWord(word) {
    const punctuationFree = trimPunctuation(word);
    const progressive = progressiveWord(punctuationFree);
    if (progressive) return preserveCasePunctuation(word, progressive);

    // The upstream implementation purposefully did not guess on arbitrary
    // joined forms.  These are unambiguous conversational verb prefixes;
    // applying ZWNJ only when the remainder is a known stem avoids changing
    // words such as میز and میدان.
    for (const prefix of ['نمی', 'می']) {
      if (!punctuationFree.startsWith(prefix)) continue;
      const remainder = punctuationFree.slice(prefix.length);
      if (JOINED_PROGRESSIVE_STEMS.includes(remainder)) {
        return preserveCasePunctuation(word, `${prefix}${ZWNJ}${remainder}`);
      }
    }

    // Joined spellings are common in fast typing too: بیادب, ناامید,
    // کتابها, کتابهایشان, and بزرگتر. Only lexicalized prefix forms and
    // plausible suffix bases are rewritten; this keeps رها and بها intact.
    for (const [prefix, vocabulary] of [['بی', PRIVATIVE_WORDS], ['نا', NEGATIVE_PREFIX_WORDS]]) {
      if (punctuationFree.startsWith(prefix) && vocabulary.has(punctuationFree.slice(prefix.length))) {
        return preserveCasePunctuation(word, `${prefix}${ZWNJ}${punctuationFree.slice(prefix.length)}`);
      }
    }

    const pluralMatch = punctuationFree.match(/^(.+?)(های|ها)(مان|تان|شان|یم|یت|یش|م|ت|ش)?$/u);
    if (pluralMatch && pluralMatch[1].length > 2 && !NON_PLURAL_HA_WORDS.has(punctuationFree)) {
      const base = pluralMatch[1].replace(new RegExp(ZWNJ, 'gu'), '');
      return preserveCasePunctuation(word, `${base}${ZWNJ}${pluralMatch[2]}${pluralMatch[3] || ''}`);
    }

    const comparativeMatch = punctuationFree.match(/^(.+?)(ترین|تر)$/u);
    if (comparativeMatch && COMPARATIVE_BASES.has(comparativeMatch[1].replace(new RegExp(ZWNJ, 'gu'), ''))) {
      const base = comparativeMatch[1].replace(new RegExp(ZWNJ, 'gu'), '');
      return preserveCasePunctuation(word, `${base}${ZWNJ}${comparativeMatch[2]}`);
    }
    return word;
  }

  /**
   * Normalize a Persian string. The function is idempotent: calling it twice
   * cannot introduce a second ZWNJ or alter already-correct text.
   *
   * @param {string|number} input text to normalize
   * @returns {string} normalized text
   */
  function halfSpace(input) {
    if (input === null || input === undefined) return '';
    let text = String(input).normalize('NFKC');
    text = replaceArabicCharacters(text);
    text = text.replace(DIACRITICS, '');
    text = normalizeDigits(text);
    text = text.replace(/[\u200b\u200d\ufeff]/gu, '');
    text = text.replace(/[ \t\r\n\f\v]+/gu, ' ').trim();

    let parts = text.split(/(\s+)/u);
    parts = parts.map((part) => (isWord(part) ? normalizeJoinedWord(part) : part));
    // A few passes allow “خانه ها یم” to become “خانه‌هایم” without turning
    // normal spaces elsewhere into half-spaces.  Two passes are enough for
    // prefix + stem + possessive sequences; the bounded loop is defensive.
    for (let pass = 0; pass < 3; pass += 1) {
      const joined = joinAdjacentWords(parts);
      const next = joined.join('');
      if (next === parts.join('')) break;
      parts = joined;
    }
    text = parts.join('');
    text = text.replace(/[ \t\r\n\f\v]+/gu, ' ').trim();
    text = text.replace(/[ \t\n\r\f]+([،؛؟!,.])/gu, '$1');
    return text;
  }

  // The package's public function is available under its familiar name for
  // code that used the vendored helper directly.  Darya's language pack uses
  // the namespaced object so it never collides with another global library.
  global.halfSpace = halfSpace;
  global.DaryaHalfspace = {
    ZWNJ,
    normalize: halfSpace,
    halfSpace,
    isPersianWord,
  };
})(typeof window !== 'undefined' ? window : globalThis);
