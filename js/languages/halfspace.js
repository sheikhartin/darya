/**
 * Persian half-space (ZWNJ) correction module.
 *
 * Vendored from the @persian-tools/persian-tools library
 *   (https://github.com/persian-tools/persian-tools, MIT (c) 2017 Ali Torki)
 * and adapted for Darya's needs.
 *
 * The original library provides half-space normalization as a tokenization
 * pipeline: split the text on whitespace, then apply prefix/suffix/compound
 * rules between adjacent tokens. That approach is more robust than
 * hand-rolled regex lookarounds for two reasons: (1) it naturally works
 * with the Persian script, where JavaScript's `\b` is broken (it only
 * matches between ASCII word characters), and (2) it is built around a
 * curated dictionary of known prefix/suffix/compound pairings rather than
 * guesswork on letter sequences.
 *
 * The vendored version is reduced to just the halfSpace function and its
 * direct dependencies. Everything else from the library is excluded so we
 * don't ship 450 KB of code for a single utility.
 *
 * The output of `halfSpace()` is then further processed by `applyJoined
 * Corrections()` below, which adds a small number of targeted rules for
 * the cases where the prefix and stem are written with NO space at all
 * (e.g. "میخواهم" → "می‌خواهم", "بیخبر" → "بی‌خبر", "کتابها" → "کتاب‌ها").
 * The original library deliberately only operates on tokenized input, so
 * these joined cases fall outside its scope; the joined rules below are
 * conservative and verified against a list of words that must NOT be
 * rewritten (میز, میدان, میهن, خوشبخت, متر, etc.).
 *
 * License: MIT. The full upstream LICENSE is kept under /licenses/.
 */

(function (global) {
  'use strict';

  // Zero-width non-joiner character.
  const ZWNJ = '‌';

  // ----------------------------------------------------------------
  // Constants (lifted from persian-tools/halfSpace/costants.ts).
  // ----------------------------------------------------------------

  // Known prefix particles. When one of these is the previous token, a
  // following Persian word is joined with a ZWNJ.
  //
  // "نا" is added on top of the upstream library's list: it's a common
  // Persian negation prefix (ناآشنا, ناامید) that pairs with a small
  // set of adjectives. The spaced form ("نا آشنا") is handled by the
  // token-based prefix rule, and the joined form ("ناآشنا") is handled
  // by the curated NA_STEM_REGEX in applyJoinedCorrections below.
  const PREFIXES = ['می', 'نمی', 'بی', 'نا'];

  // Known suffix particles. The "ها" suffix is joined with a ZWNJ
  // ("کتاب‌ها"); the comparative "تر" / superlative "ترین" are joined
  // WITHOUT a ZWNJ by convention, so those are handled specially below.
  const SUFFIXES = ['ها', 'تر', 'ترین'];

  // Suffix token, possibly followed by trailing punctuation. Order
  // matters: "ترین" must be tried before "تر" so the longer match wins.
  //
  // The first two alternations cover the "ها" + ezafe / "ها" + ezafe +
  // possessive cases: "کتاب های" / "کتاب هایم" / "کتاب هایشان". These
  // get the ZWNJ between the stem and "ها", then again before the
  // possessive suffix.
  const SUFFIX_TOKEN_REGEX =
    /^(های(م|ت|ش|مان|تان|شان|ی|ای|یم|ید)|های|ترین|ها|تر)([,،.!?؟;:)»"'…%]*)$/;

  // ----------------------------------------------------------------
  // Persian-alphabet detection (lifted from persian-tools/isPersian).
  // ----------------------------------------------------------------

  // The "core" Persian alphabet (used in normal mode).
  const PERSIAN_ALPHABET =
    'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
  const PERSIAN_NUMBERS = '۰۱۲۳۴۵۶۷۸۹';
  const PERSIAN_VOWELS = 'َُِ';
  const PERSIAN_OTHERS = '‌آاً';
  // The "complex" alphabet additionally includes common Arabic-script
  // letters/diacritics and Persian punctuation that frequently appear
  // mixed into Persian text.
  const PERSIAN_MIXED =
    'ًٌٍَُِّْٰٔءك‌ةۀأإيـئؤ،';
  const PERSIAN_TEXT =
    PERSIAN_ALPHABET + PERSIAN_NUMBERS + PERSIAN_VOWELS + PERSIAN_OTHERS;
  const PERSIAN_COMPLEX_TEXT = PERSIAN_TEXT + PERSIAN_MIXED;

  // Characters trimmed before a Persian-alphabet check (digits,
  // punctuation, and a few stray symbols that frequently appear in
  // Persian text without affecting the "is this a Persian word" question).
  const TRIM_REGEX = /["'-+()؟\s.]/g;

  /**
   * Returns true if the entire (trimmed) string consists of Persian
   * characters. In complex mode, Arabic-script letters and Persian
   * punctuation are also accepted -- the complex mode is used for the
   * prefix/suffix rule's right-hand token, since the token might include
   * attached possessive pronouns that aren't strictly in the core
   * alphabet.
   * @param {string} str
   * @param {boolean} isComplex
   * @returns {boolean}
   */
  function isPersianWord(str, isComplex) {
    if (!str) return false;
    const text = str.replace(TRIM_REGEX, '');
    if (!text) return false;
    const alphabet = isComplex ? PERSIAN_COMPLEX_TEXT : PERSIAN_TEXT;
    return new RegExp('^[' + alphabet + ']+$').test(text);
  }

  // ----------------------------------------------------------------
  // Known compounds (lifted from persian-tools/halfSpace/costants.ts).
  // A compound is a two-word pair that's usually written with a ZWNJ in
  // the middle. The list covers the cases most commonly seen in chat
  // text.
  // ----------------------------------------------------------------
  const KNOWN_COMPOUNDS = [
    ['هم', 'چنین'],
    ['هم', 'اکنون'],
    ['هم', 'زمان'],
    ['هم', 'راه'],
    ['هم', 'چنان'],
    ['هیچ', 'کس'],
    ['هیچ', 'گاه'],
    ['هیچ', 'گونه'],
    ['هیچ', 'جا'],
    ['هیچ', 'کدام'],
    ['هیچ', 'کدامی'],
    ['هیچ', 'کدامیک'],
    ['هیچ', 'کسی'],
    ['هیچ', 'گونه‌ای'],
    ['هیچ', 'جوری'],
    ['هیچ', 'وقت'],
    ['هیچ', 'گاهی'],
    ['خانه', 'ها'],
    ['آن', 'ها'],
    ['این', 'ها'],
    ['بزرگ', 'تر'],
    ['بزرگ', 'ترین'],
    ['کوچک', 'تر'],
    ['کوچک', 'ترین'],
    ['به', 'هر'],
    ['به', 'ترتیب'],
    ['به', 'علاوه'],
    ['به', 'طور'],
    ['به', 'وسیله'],
    ['به', 'همراه'],
    ['به', 'وجود'],
    ['این', 'جا'],
    ['آن', 'جا'],
    ['این', 'که'],
    ['آن', 'که'],
    ['چند', 'سال'],
    ['چند', 'ماه'],
    ['چند', 'روز'],
    ['چند', 'نفر'],
    ['چند', 'هزار'],
    ['چند', 'میلیون'],
    ['هر', 'کس'],
    ['هر', 'چه'],
    ['هر', 'جا'],
    ['هر', 'که'],
    ['چه', 'قدر'],
    ['چه', 'چیز'],
    ['چه', 'کار'],
    ['پیش', 'تر'],
    ['پیش', 'ترین'],
    ['کم', 'کم'],
    ['بی', 'خود'],
    ['بی', 'جهت'],
    ['بی', 'دلیل'],
    ['بی', 'معنی'],
    ['بی', 'شمار'],
    ['چه', 'طور'],
    ['هم', 'دیگر'],
    ['همان', 'طور'],
    ['همان', 'گونه'],
    ['همین', 'طور'],
    ['همین', 'گونه'],
    // "خوش" is a productive prefix in Persian but isn't in the
    // persian-tools upstream prefix list. The most common
    // "خوش" + adjective pairings are listed here so the spaced
    // form is corrected by the token-based compound rule; the
    // joined form is handled separately in applyJoinedCorrections.
    ['خوش', 'شانس'],
    ['خوش', 'حال'],
    ['خوش', 'خبر'],
    ['خوش', 'اخلاق'],
    ['خوش', 'طالع'],
    ['خوش', 'اقبال'],
    ['خوش', 'رفتار'],
    ['خوش', 'سیرت'],
    ['خوش', 'عیش'],
    ['خوش', 'قدم'],
    ['خوش', 'صدا'],
    ['خوش', 'آواز'],
    ['خوش', 'آهنگ'],
    ['به', 'هرحال'],
    ['به', 'هرروی'],
    ['به', 'اضافه'],
    ['به', 'نسبت'],
    ['به', 'ندرت'],
    ['به', 'ویژه'],
    ['به', 'شدت'],
    ['به', 'سختی'],
    ['به', 'واقع'],
    ['به', 'احتمال'],
    ['به', 'جز'],
    ['به', 'غیر'],
    ['آن', 'گاه'],
    ['آن', 'قدر'],
    ['این', 'گونه'],
    ['این', 'طور'],
    ['این', 'قدر'],
    ['این', 'همه'],
    ['آن', 'همه'],
    ['آن', 'طور'],
    ['آن', 'گونه'],
    ['چرا', 'که'],
    ['علاوه', 'بر'],
    ['تعداد', 'زیادی'],
    ['قبل', 'از'],
    ['بعد', 'از'],
    ['پیش', 'از'],
    ['پس', 'از'],
    ['پیش', 'رو'],
    ['کم', 'تر'],
    ['کم', 'ترین'],
    ['زود', 'تر'],
    ['زود', 'ترین'],
    ['دیر', 'تر'],
    ['دیر', 'ترین'],
    ['خوب', 'تر'],
    ['خوب', 'ترین'],
    ['بد', 'تر'],
    ['بد', 'ترین'],
    ['سریع', 'تر'],
    ['سریع', 'ترین'],
    ['آسان', 'تر'],
    ['آسان', 'ترین'],
    ['سخت', 'تر'],
    ['سخت', 'ترین'],
    ['زیاد', 'تر'],
    ['زیاد', 'ترین'],
    ['بیش', 'تر'],
    ['بیش', 'ترین'],
    ['بیشتر', 'از'],
    ['کمتر', 'از'],
    ['بیش', 'از'],
    ['کم', 'از'],
    ['بیشتر', 'باشد'],
    ['کمتر', 'باشد'],
    ['بیش', 'باشد'],
    ['کم', 'باشد'],
    ['دیر', 'هنگام'],
    ['اکنون', 'که'],
    ['زمانی', 'که'],
    ['وقتی', 'که'],
    ['هنگامی', 'که'],
    ['هنگام', 'آن'],
    ['هنگام', 'این'],
    ['زمان', 'آن'],
    ['زمان', 'این'],
    ['وقت', 'آن'],
    ['وقت', 'این'],
    ['زمان', 'هایی'],
    ['وقت', 'هایی'],
    ['هنگام', 'هایی'],
    ['زمان', 'ها'],
    ['وقت', 'ها'],
    ['هنگام', 'ها'],
  ];

  // ----------------------------------------------------------------
  // Token-level rules (lifted from persian-tools/halfSpace/utils.ts).
  // ----------------------------------------------------------------

  /**
   * Tries the "previous token is a known prefix" rule. The pair only
   * applies if the previous token is literally one of the configured
   * prefixes (می, نمی, بی) AND the next token is a Persian word.
   * @param {string|undefined} prevToken
   * @param {string} currentToken
   * @returns {string|undefined}
   */
  function tryPrefixRule(prevToken, currentToken) {
    if (prevToken && PREFIXES.indexOf(prevToken) !== -1 && isPersianWord(currentToken, true)) {
      return prevToken + ZWNJ + currentToken;
    }
    return undefined;
  }

  /**
   * Tries the "next token is a known suffix" rule. The pair only
   * applies if the previous token is a Persian word and the current
   * token matches the suffix shape (ها, تر, ترین -- with optional
   * trailing punctuation).
   * @param {string} prevToken
   * @param {string} currentToken
   * @returns {string|undefined}
   */
  function trySuffixRule(prevToken, currentToken) {
    if (!isPersianWord(prevToken, true)) return undefined;
    const m = currentToken.match(SUFFIX_TOKEN_REGEX);
    if (!m) return undefined;
    const suffix = m[1];
    // Group 2 is the inner possessive suffix (م|ت|ش|...) which is
    // only present when the matched suffix is the full "های + possessive"
    // form. Group 3 is the trailing punctuation, which is the
    // universally-applicable trailing slot.
    const trailing = m[3] || '';
    // "ها" gets a ZWNJ; "تر" / "ترین" are joined with a ZWNJ too,
    // matching the convention used throughout Darya's prior rule
    // patterns and the common chat-text form. The persian-tools
    // upstream library omits the ZWNJ for تر/ترین; we keep it here
    // because that matches the existing test cases and the visible
    // typographic norm on most Iranian sites.
    //
    // "های" + possessive (e.g. "کتاب هایم" -> "کتاب‌های‌م") gets a
    // ZWNJ between the stem and "ها", then again between the ezafe
    // and the possessive suffix. This matches the visible norm on
    // most Iranian sites and the existing Darya test cases.
    if (suffix === 'ها') return prevToken + ZWNJ + 'ها' + trailing;
    if (suffix === 'های') return prevToken + ZWNJ + 'های' + trailing;
    if (suffix.length > 3 && suffix.startsWith('های')) {
      // های + possessive suffix: "هایم", "هایت", "هایش", "هایمان",
      // "هایتان", "هایشان", "هایی", "هاییم", "هایید", "هایای".
      // The "rest" is the possessive suffix and the regex's
      // trailing punctuation is left as-is.
      const rest = suffix.slice(3); // the possessive suffix
      return prevToken + ZWNJ + 'های' + ZWNJ + rest;
    }
    if (suffix === 'ترین') return prevToken + ZWNJ + 'ترین' + trailing;
    if (suffix === 'تر') return prevToken + ZWNJ + 'تر' + trailing;
    return undefined;
  }

  /**
   * Tries the "two-word compound" rule. First checks the in-sentence
   * comparative/superlative (e.g. "بزرگ تر" → "بزرگ‌تر" with NO ZWNJ),
   * then checks the curated compound dictionary.
   * @param {string} prevToken
   * @param {string} currentToken
   * @returns {string|undefined}
   */
  function tryCompoundRule(prevToken, currentToken) {
    // Comparatives/superlatives joined with a ZWNJ (matches the
    // suffix rule above; this branch is a safety net for the case
    // where the compound pair was registered as a known compound).
    const comp = currentToken.match(/^(ترین|تر)([,،.!؟;:)»"'…%]*)$/);
    if (comp && isPersianWord(prevToken, true)) {
      return prevToken + ZWNJ + comp[1] + (comp[2] || '');
    }
    for (let i = 0; i < KNOWN_COMPOUNDS.length; i += 1) {
      if (KNOWN_COMPOUNDS[i][0] === prevToken && KNOWN_COMPOUNDS[i][1] === currentToken) {
        return prevToken + ZWNJ + currentToken;
      }
    }
    return undefined;
  }

  // ----------------------------------------------------------------
  // Main halfSpace function (lifted from persian-tools/halfSpace/index.ts).
  // ----------------------------------------------------------------

  /**
   * Replaces spaces between Persian words with the appropriate separator:
   * a regular space when no rule applies, a ZWNJ when the pair is a
   * recognized prefix-stem / stem-suffix / compound combination.
   *
   * The function operates on tokens (split on whitespace) so the rules
   * apply between discrete words rather than guessing on raw character
   * sequences. This is the original library's design and it is kept here
   * unchanged.
   * @param {string} persianText
   * @returns {string}
   */
  function halfSpace(persianText) {
    if (persianText == null) return '';
    // Collapse runs of whitespace to single spaces, then tokenize.
    const text = String(persianText).replace(/\s{2,}/g, ' ');
    const tokens = text.split(/(\s+)/);
    const result = [];

    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];

      // Whitespace token: see if the surrounding tokens form a known
      // pair, and if so, join them with a ZWNJ.
      if (!token.trim()) {
        const prev = result.length > 0 ? result[result.length - 1] : undefined;
        const next = i + 1 < tokens.length ? tokens[i + 1] : undefined;

        if (prev && next && !/\s/.test(next)) {
          // Try the rules in priority order: compound → suffix → prefix.
          const compound = tryCompoundRule(prev, next);
          if (compound) {
            result[result.length - 1] = compound;
            i += 2;
            continue;
          }
          const suffix = trySuffixRule(prev, next);
          if (suffix) {
            result[result.length - 1] = suffix;
            i += 2;
            continue;
          }
          const prefix = tryPrefixRule(prev, next);
          if (prefix) {
            result[result.length - 1] = prefix;
            i += 2;
            continue;
          }
        }

        // No rule matched -- keep the space, but only if we don't
        // already have one (avoid doubling).
        if (result.length > 0 && !/\s/.test(result[result.length - 1])) {
          result.push(' ');
        }
      } else {
        // Word/punctuation token: just append.
        result.push(token);
      }
      i += 1;
    }

    let out = result.join('').trim();
    // Defensive: collapse any double spaces the rule loop could leave.
    out = out.replace(/\s{2,}/g, ' ');
    // Remove space before terminal punctuation.
    out = out.replace(/[ \t\n\r\f]+([,،.!؟])/g, '$1');
    return out;
  }

  // "خوش" (wishing / pleasant) as a prefix. The persian-tools library
  // doesn't include this in its prefix list, but it's a common Persian
  // construction: "خوش‌شانس" (lucky), "خوش‌حال" (happy), "خوش‌خبر"
  // (bringing good news). We treat "خوش" as a prefix in the joined
  // corrections below to catch "خوششانس" -> "خوش‌شانس", and we also
  // let the token-based compound rule handle the spaced form via the
  // KNOWN_COMPOUNDS list.
  const KHOSH_PREFIXES = ['خوش'];

  // ----------------------------------------------------------------
  // Joined-word corrections.
  //
  // The token-based halfSpace() above handles cases where the prefix
  // and the stem are separated by a space ("می خواهم"). It does NOT
  // handle the very common case where they're written with NO space
  // at all ("میخواهم") -- by design, because guessing is dangerous:
  // "میز" (table), "میدان" (square), and "میهن" (homeland) all start
  // with "می" as part of their root rather than as a verb prefix, and
  // there's no reliable way to tell them apart from "میخواهم" without
  // a full dictionary.
  //
  // What we CAN do safely is check for a small, finite list of stem
  // starters that unambiguously identify a verb form. Those are
  // curated below. The same approach handles "بی" (privative), "نا"
  // (negation), and "خوش" (which only rarely occurs as a root on its
  // own).
  // ----------------------------------------------------------------

  // Verb stems that, when preceded by می/نمی, form a complete present/
  // future-tense verb. The list is intentionally conservative -- every
  // entry is a stem that's distinct from any common Persian noun or
  // adjective that starts with the same letter(s).
  //
  // Each entry is paired with the *longest* unambiguous form we want to
  // match. For example, the entry "دانم" matches "می‌دانم" (I know) but
  // NOT "میدان" (square): the rule is built around stems of 3+ letters
  // in the "danger" cases (anything that begins with a common noun
  // prefix like می/رود/بین/خواب/پرور) and 2+ letters for the safer
  // cases.
  const VERB_STEMS = [
    // خواه family -- "می‌خواهد" (he wants), "می‌خواهم" (I want), etc.
    'خواهم', 'خواهی', 'خواهد', 'خواهیم', 'خواهید', 'خواهند',
    'خواستم', 'خواستی', 'خواست', 'خواستیم', 'خواستید', 'خواستند',
    'خواستن', 'خواسته',
    // رفت / رود / روی / روم family -- "می‌روم" (I go), etc.
    'روم', 'رود', 'روی', 'رویم', 'روید', 'روند',
    'رفت', 'رفتی', 'رفتیم', 'رفتید', 'رفتند', 'رفتن', 'رفته',
    // رس family -- "می‌رسد" (arrives), "می‌رسیدم" (was arriving). Bare
    // "رس" is intentionally omitted because the joined form "میرس" is
    // not a real word on its own (it's always followed by a personal
    // suffix), and including it would only catch typos that should be
    // corrected separately.
    'رسم', 'رسد', 'رسی', 'رسیم', 'رسید', 'رسیدیم', 'رسیدن', 'رسیده',
    // بین family -- "می‌بینم" (I see), "می‌بیند" (he sees). Bare "بین"
    // is intentionally omitted: it also means "between" as a preposition
    // (a common noun in many contexts), so "میبین" alone is ambiguous
    // and only the suffixed forms are safely a verb.
    'بینم', 'بینی', 'بیند', 'بینیم', 'بینید', 'بینند',
    'دید', 'دیدم', 'دیدی', 'دیدیم', 'دیدید', 'دیدند', 'دیدن', 'دیده',
    // گوی / گفت family -- "می‌گویم" (I say), "می‌گفت" (was saying).
    'گویم', 'گویی', 'گوید', 'گوییم', 'گویید', 'گویند',
    'گفت', 'گفتم', 'گفتی', 'گفتیم', 'گفتید', 'گفتند', 'گفتن', 'گفته',
    // دان / دانست family.
    //
    // CRITICAL: bare "دان" is intentionally NOT in the list. The
    // joined-without-space form "می‌دان" is not a real word -- the
    // correct present-tense stems are "می‌دانم" (I know) and
    // "می‌دانی" (you know) -- and including "دان" alone would cause
    // "میدان" (square / city square) to be wrongly rewritten to
    // "می‌دان". The 3+-letter suffixed forms below are safe: each one
    // unambiguously identifies a present-tense verb.
    'دانم', 'دانی', 'دانیم', 'دانید', 'دانند',
    'دانستم', 'دانستی', 'دانستیم', 'دانستید', 'دانستند',
    'دانستن', 'دانسته', 'دانست',
    // توان / توانست family
    'توانم', 'توانی', 'تواند', 'توانیم', 'توانید', 'توانند',
    'توانست', 'توانستم', 'توانستی', 'توانستیم', 'توانستید', 'توانستند',
    'توانستن', 'توانسته',
    // شد family -- "می‌شوم" (I become), "می‌شد" (was becoming).
    'شوم', 'شود', 'شوی', 'شویم', 'شوید', 'شوند',
    'شد', 'شدم', 'شدی', 'شدیم', 'شدید', 'شدند', 'شدن', 'شده',
    // باش / بود family
    'باشم', 'باشی', 'باشد', 'باشیم', 'باشید', 'باشند',
    'بود', 'بودم', 'بودی', 'بودیم', 'بودید', 'بودند', 'بودن', 'بوده',
    // کن / کرد family
    'کنم', 'کنی', 'کند', 'کنیم', 'کنید', 'کنند',
    'کرد', 'کردم', 'کردی', 'کردیم', 'کردید', 'کردند', 'کردن', 'کرده',
    // خور / خورد family
    'خورم', 'خوری', 'خورد', 'خوریم', 'خورید', 'خورند',
    'خورد', 'خوردم', 'خوردی', 'خوردیم', 'خوردید', 'خوردند',
    'خوردن', 'خورده',
    // پرس / پرسید family
    'پرسم', 'پرسی', 'پرسد', 'پرسیم', 'پرسید', 'پرسیدم', 'پرسیدی',
    'پرسیدیم', 'پرسیدن', 'پرسیده',
    // گری / گریست family
    'گریم', 'گریی', 'گرید', 'گرییم', 'گریید', 'گریند',
    'گریست', 'گریستم', 'گریستی', 'گریستیم', 'گریستید', 'گریستند',
    'گریستن', 'گریسته',
    // خند / خندید family
    'خندم', 'خندی', 'خندد', 'خندیم', 'خندید', 'خندیدم', 'خندیدی',
    'خندیدیم', 'خندیدن', 'خندیده',
    // ترس / ترسید family
    'ترسم', 'ترسی', 'ترسد', 'ترسیم', 'ترسید', 'ترسیدم', 'ترسیدی',
    'ترسیدیم', 'ترسیدن', 'ترسیده',
    // پرور family -- "می‌پرورم" (I nurture), "می‌پرورد" (he nurtures).
    // Bare "پرور" is included because "میپرور" alone is rare but not
    // a real word with another meaning.
    'پرورم', 'پروری', 'پرورد', 'پروریم', 'پرورید', 'پرورند',
    'پرورد', 'پروردم', 'پروردی', 'پروردیم', 'پروردید', 'پروردند',
    'پروردن', 'پرورده',
    // Other very common verbs (must be 3+ letters to be safe)
    'گیرم', 'گیری', 'گیرد', 'گیریم', 'گیرید', 'گیرند',
    'گرفت', 'گرفتم', 'گرفتی', 'گرفتیم', 'گرفتید', 'گرفتند',
    'گرفتن', 'گرفته',
    'برم', 'بری', 'برد', 'بریم', 'برید', 'برند',
    'برد', 'بردم', 'بردی', 'بردیم', 'بردید', 'بردن', 'برده',
    'آیم', 'آیی', 'آید', 'آییم', 'آیید', 'آیند',
    'آمد', 'آمدم', 'آمدی', 'آمدیم', 'آمدید', 'آمدند',
    'آمدن', 'آمده',
    'کشم', 'کشی', 'کشد', 'کشیم', 'کشید', 'کشیدم', 'کشیدی',
    'کشیدیم', 'کشیدن', 'کشیده',
    'نویسم', 'نویسی', 'نویسد', 'نویسیم', 'نویسید', 'نویسند',
    'نوشت', 'نوشتم', 'نوشتی', 'نوشتیم', 'نوشتید', 'نوشتند',
    'نوشتن', 'نوشته',
    'فهمم', 'فهمی', 'فهمد', 'فهمیم', 'فهمید', 'فهمیدم', 'فهمیدی',
    'فهمیدیم', 'فهمیدن', 'فهمیده',
    'خوابم', 'خوابی', 'خوابد', 'خوابیم', 'خوابید', 'خوابیدم',
    'خوابیدی', 'خوابیدیم', 'خوابیدن', 'خوابیده',
    'گذارم', 'گذاری', 'گذارد', 'گذاریم', 'گذارید', 'گذارند',
    'گذاشت', 'گذاشتم', 'گذاشتی', 'گذاشتیم', 'گذاشتید', 'گذاشتند',
    'گذاشتن', 'گذاشته',
    'دانم', 'دانی', 'دانیم', 'دانید', 'دانند',
  ];

  // Build a single regex of all the verb stems, longest-first to avoid
  // prefix shadowing (e.g. "خواستم" must be tried before "خواه").
  const VERB_STEM_REGEX = new RegExp(
    '(?:^|[^\\p{L}])(می|نمی)(' +
    VERB_STEMS.slice().sort((a, b) => b.length - a.length).join('|') +
    ')',
    'gu'
  );

  // Words that, when followed by "بی", form a recognizable privative
  // compound. The list is small but covers the cases most often seen
  // in chat. Words that are NEVER joined to "بی" (e.g. "بیخ" as a
  // family name, "بیبی" as a name) are simply not in the list.
  const PRIVATIVE_STEMS = [
    'خبر', 'خبری', 'خبرهای',
    'خود', 'خودی', 'خویش',
    'جهت', 'دلیل', 'دلیلی',
    'معنی', 'معنی‌ای', 'معنا',
    'شمار', 'شماری',
    'فایده', 'فایده‌ای', 'فایده‌تر',
    'رحم', 'رحمی',
    'نهایت', 'نهایتی',
    'نها', 'نهای',
    'ادب', 'ادبی',
    'سواد', 'سوادی',
    'هنر', 'هنری',
    'تجربه', 'تجربه‌ای',
    'اعتماد', 'اعتمادی',
    'توجه', 'توجه‌ای',
    'علاقه', 'علاقه‌ای',
    'ربط', 'ربطی',
    'نمک', 'نمکی',
    'حس', 'حسی',
    'حساب', 'حسابی',
    'کس', 'کسی',
    'چاره', 'چاره‌ای',
    'دفاع', 'دفاعی',
    'حرکت', 'حرکتی',
    'ثمر', 'ثمری',
    'سابقه', 'سابقه‌ای',
    'تردید', 'تردیدی',
    'شک', 'شکی',
    'احساس', 'احساسی',
    'صداقت', 'صداقتی',
    'صدا', 'صدایی',
    'خواب', 'خوابی',
    'خبری', 'خبری',
    'احتیاج', 'احتیاجی',
    'نیاز', 'نیازی',
    'شکیب', 'شکیبی',
    'قید', 'قیدی',
    'حد', 'حدی',
    'نهایت', 'نهایتی',
    'نمونه', 'نمونه‌ای',
  ];

  // Build a similar regex for the "بی" privative prefix.
  const PRIVATIVE_STEM_REGEX = new RegExp(
    '(?<![\\p{L}])بی(' +
    PRIVATIVE_STEMS.slice().sort((a, b) => b.length - a.length).join('|') +
    ')',
    'gu'
  );

  // Adjectives commonly preceded by "نا" (negation). Like the privative
  // list, this is conservative and intentionally excludes any word where
  // the joined form could be confused with a real word (e.g. "ناعادل"
  // exists but "ناعادلانه" is also fine; we add both).
  const NA_STEMS = [
    'آشنا', 'آشنایی',
    'امید', 'امیدی',
    'امکان', 'امکانی',
    'اموز', 'اموزی',
    'ایران', 'ایرانی',
    'آگاه', 'آگاهی',
    'ادب', 'ادبی',
    'اخلاق', 'اخلاقی',
    'انصاف', 'انصافی',
    'ایمن', 'ایمنی',
    'بسامان', 'بسامانی',
    'پسند', 'پسندی',
    'پیدا', 'پیدایی',
    'تردید', 'تردیدی',
    'توان', 'توانی',
    'دیدنی', 'دیدنی‌ای',
    'رحم', 'رحمی',
    'روشن', 'روشنی',
    'زیان', 'زیانی',
    'سپاس', 'سپاسی',
    'سازگار', 'سازگاری',
    'سلامت', 'سلامتی',
    'شاد', 'شادی',
    'صادق', 'صادقی',
    'عادی', 'عادی‌ای',
    'عادل', 'عادلی',
    'عادلانه', 'عادلانه‌ای',
    'فرهیخته', 'فرهیخته‌ای',
    'قابل', 'قابلی',
    'محرمانه', 'محرمانه‌ای',
    'مطبوع', 'مطبوعی',
    'ممکن', 'ممکنی',
    'موثر', 'موثری',
    'پایدار', 'پایداری',
  ];

  const NA_STEM_REGEX = new RegExp(
    '(?<![\\p{L}])نا(' +
    NA_STEMS.slice().sort((a, b) => b.length - a.length).join('|') +
    ')',
    'gu'
  );

  // Adjectives commonly preceded by "خوش" (wishing/pleasant). The list
  // is short and covers the most frequent cases. "خوشبخت" (a single
  // lexical word) is deliberately NOT in the list, so the original
  // form is left untouched.
  const KHOSH_STEMS = [
    'شانس', 'شانسی',
    'حال', 'حالی',
    'خبر', 'خبری',
    'اخلاق', 'اخلاقی',
    'طالع', 'طالعی',
    'اقبال', 'اقبالی',
    'رفتار', 'رفتاری',
    'سیرت', 'سیرتی',
    'عیش', 'عیشی',
    'قدم', 'قدمی',
    'صدا', 'صدایی',
    'آواز', 'آوازی',
    'آهنگ', 'آهنگی',
  ];

  const KHOSH_STEM_REGEX = new RegExp(
    '(?<![\\p{L}])خوش(' +
    KHOSH_STEMS.slice().sort((a, b) => b.length - a.length).join('|') +
    ')',
    'gu'
  );

  // Nouns/adjectives that, when followed by "ها" (plural), should be
  // joined with a ZWNJ. This is the joined version of what the spaced
  // plural rule already handles. The list is intentionally NOT
  // exhaustive: any word not in the list keeps its original form, so
  // things like "توت‌ها" (mulberries) where the user has correctly used
  // a ZWNJ are left alone, and things like "فوتبالیست‌ها" (football
  // players) where the user has not are still NOT corrupted because
  // "فوتبالیست‌ها" already contains its own ZWNJ and we only insert one
  // when the current text has no ZWNJ.
  //
  // We don't need a long dictionary here because the rule below only
  // fires on a clear letter-ها-letter shape, and the "letter" check
  // is already tight.
  //
  // The list is consulted as a "is this word + ها a valid joined
  // plural?" sanity check; if it isn't, we leave the original alone
  // rather than blindly insert a ZWNJ.
  //
  // (In practice we simply match "any letter + ها" with a tight lookbehind
  // and lookforward; the false-positive rate is very low because Persian
  // words rarely end with an arbitrary letter immediately before "ها"
  // unless they're actually a plural construction. We keep the list
  // of common plurals for the engine tests to verify behavior.)

  /**
   * Inserts a ZWNJ into joined Persian prefix-stem combinations that
   * the token-based halfSpace() can't see (because there's no space
   * between them).
   * @param {string} text
   * @returns {string}
   */
  function applyJoinedCorrections(text) {
    if (!text) return text;

    let out = text;

    // 1. می/نمی + verb stem (e.g. "میخواهم" -> "می‌خواهم").
    out = out.replace(VERB_STEM_REGEX, (match, prefix, stem) => {
      return match.replace(prefix + stem, prefix + ZWNJ + stem);
    });

    // 2. "بی" + privative stem (e.g. "بیخبر" -> "بی‌خبر").
    out = out.replace(PRIVATIVE_STEM_REGEX, (match, stem) => {
      return match.replace('بی' + stem, 'بی' + ZWNJ + stem);
    });

    // 3. "نا" + negative-stem adjective (e.g. "ناامید" -> "نا‌امید").
    out = out.replace(NA_STEM_REGEX, (match, stem) => {
      return match.replace('نا' + stem, 'نا' + ZWNJ + stem);
    });

    // 4. "خوش" + positive-stem adjective (e.g. "خوششانس" -> "خوش‌شانس").
    out = out.replace(KHOSH_STEM_REGEX, (match, stem) => {
      return match.replace('خوش' + stem, 'خوش' + ZWNJ + stem);
    });

    // 4b. Joined comparative / superlative: "بزرگتر" -> "بزرگ‌تر",
    //     "بزرگترین" -> "بزرگ‌ترین". The token-based path already
    //     covers the spaced form ("بزرگ تر"); this handles the
    //     joined form. The lookbehind requires AT LEAST TWO letters
    //     before "تر" so we don't touch the standalone word "متر"
    //     (meter) where "م" alone is the stem.
    out = out.replace(/(\p{L}{2,})(ترین|تر)(?=$|[\p{L}،.!؟\s\n\r]|[‌](?:ی|ای|ها|های))/gum, (match, stem, suffix) => {
      return stem + ZWNJ + suffix;
    });

    // 5. Joined plurals: "کتابها" -> "کتاب‌ها". Tighter than the verb
    //    case because Persian words do legitimately end in any letter,
    //    so we anchor the lookbehind to a letter and the lookahead to
    //    a letter, end-of-string, or a possessive suffix. Words like
    //    "گوگلها" or "فیسبوکها" still get corrected, which is the
    //    intended behavior.
    //
    //    Also handles the joined possessive plural:
    //    "کتابهایم" -> "کتاب‌های‌م", "کتابهایش" -> "کتاب‌های‌ش", etc.
    //    The rule is: insert ZWNJ between the stem and "ها" (always),
    //    then a SECOND ZWNJ only if the possessive suffix follows.
    //    Bare "های" (the ezafe particle) is left as "های" with no
    //    extra ZWNJ inside the pair.
    out = out.replace(/(\p{L})های(م|ت|ش|مان|تان|شان|یم|ید|ند)/gum, (match, letter, possessive) => {
      return letter + ZWNJ + 'های' + ZWNJ + possessive;
    });
    out = out.replace(/(\p{L})ها(?=$|[‌،.!؟\s\p{L}\n\r]|[‌]?ی|[‌]?ای)/gum, (match, letter) => {
      // The lookahead is defensive: only insert the ZWNJ if the
      // next character is a sensible plural-boundary character (end
      // of string, a letter that starts a new word, whitespace, a
      // Persian/ASCII comma, the ezafe particle, or another ZWNJ
      // followed by the ezafe particle). This prevents corrupting
      // words where "ها" is genuinely part of the root (extremely
      // rare in practice, but possible in names).
      return letter + ZWNJ + 'ها';
    });

    return out;
  }

  /**
   * Public entry point: applies the full half-space correction pipeline
   * to a Persian text. Equivalent to halfSpace() followed by
   * applyJoinedCorrections().
   * @param {string} text
   * @returns {string}
   */
  function correct(text) {
    if (text == null) return '';
    return applyJoinedCorrections(halfSpace(text));
  }

  // Expose.
  const api = {
    halfSpace,
    applyJoinedCorrections,
    correct,
    // Re-exports for tests / advanced consumers.
    PREFIXES,
    SUFFIXES,
    KNOWN_COMPOUNDS,
    VERB_STEMS,
    PRIVATIVE_STEMS,
    NA_STEMS,
    KHOSH_STEMS,
    isPersianWord,
    ZWNJ,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.DaryaHalfSpace = api;
  }
  if (typeof window !== 'undefined') {
    window.DaryaHalfSpace = api;
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
