/**
 * Darya - count-aware knowledge list helpers.
 * Parses a requested list size out of a movie/game request (\"فقط ۶تا\",
 * \"exactly 6\", \"ده فیلم\") and trims a numbered knowledge list to that
 * many items while renumbering the kept lines. Loaded before
 * knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  // Persian number words usable as a list count (one through ten).
  const FA_NUM_WORDS = {
    یک: 1,
    دو: 2,
    سه: 3,
    چهار: 4,
    پنج: 5,
    شش: 6,
    هفت: 7,
    هشت: 8,
    نه: 9,
    ده: 10
  };
  // English number words usable as a list count (one through ten).
  const EN_NUM_WORDS = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10
  };

  // Media nouns that can follow a number word in a list request
  // (\"سه فیلم\", \"پنج سریال\", \"three movies\", \"six games\").
  const FA_COUNT_NOUN =
    '(?:تا|تایی|عدد|فیلم|سریال|بازی|بازی ویدئویی|بازی ویدیویی|مستند|انیمه|انیمیشن|پادکست|آهنگ|موسیقی|کتاب|پیشنهاد)';
  const EN_COUNT_NOUN =
    '(?:movies?|films?|series|shows?|games?|documentaries|documentary|documentations?|anime|podcasts?|albums?|songs?|music|books?|picks?|suggestions?)';

  /**
   * Extracts a requested list count from user text, or null when the text
   * does not request a specific size. Handles Persian and English digits,
   * number words, and qualifiers (\"فقط\", \"حداقل\", \"exactly\", \"at
   * least\", \"around\").
   * @param {string} text - Normalized matching text.
   * @param {string} langCode - 'fa' or 'en'.
   * @returns {number|null} The requested count, or null.
   */
  function parseListCount(text, langCode) {
    if (!text) {
      return null;
    }
    const isFa = langCode === 'fa';
    const lower = text.toLowerCase();

    // Persian: \"فقط ۶تا\", \"حداقل ۴\", \"۶ تا\", \"ده فیلم\".
    if (isFa) {
      const digitMatch = lower.match(
        /(?:\s|^)(?:فقط|حداقل|حداکثر|حدود|دقیقا|دقیقاً)?\s*([۰-۹0-9]{1,2})\s*تا/iu
      );
      if (digitMatch) {
        return clampCount(toArabicDigits(digitMatch[1]));
      }
      for (const [word, count] of Object.entries(FA_NUM_WORDS)) {
        if (new RegExp(`${FA_COUNT_NOUN}`, 'iu').test(lower)) {
          const wordMatch = lower.match(
            new RegExp(
              `(?:فقط|حداقل|حداکثر|حدود|دقیقا|دقیقاً)?\\s*${word}\\s*${FA_COUNT_NOUN}`,
              'iu'
            )
          );
          if (wordMatch) {
            return clampCount(count);
          }
        }
      }
      return null;
    }

    // English: \"exactly 6\", \"just three\", \"10 movies\", \"at least 4\".
    const qualifiedDigit = lower.match(
      /\b(?:exactly|just|only|at least|about|around)\s+(\d{1,2})\b/
    );
    if (qualifiedDigit) {
      return clampCount(Number(qualifiedDigit[1]));
    }
    const mediaDigit = lower.match(
      // eslint-disable-next-line max-len
      /\b(\d{1,2})\s*(?:movies?|films?|series|shows?|games?|documentaries|documentary|documentations?|anime|podcasts?|albums?|songs?|books?|picks?)\b/
    );
    if (mediaDigit) {
      return clampCount(Number(mediaDigit[1]));
    }
    for (const [word, count] of Object.entries(EN_NUM_WORDS)) {
      const wordMatch = lower.match(
        new RegExp(
          `\\b(?:exactly|just|only|at least|about|around)?\\s*${word}\\s*${EN_COUNT_NOUN}\\b`,
          'i'
        )
      );
      if (wordMatch) {
        return clampCount(count);
      }
    }
    return null;
  }

  /**
   * Clamps a parsed count to a sane range (1-12) so a typo like \"99تا\"
   * cannot request a list the knowledge layer does not have.
   * @param {number} count
   * @returns {number}
   */
  function clampCount(count) {
    const numeric = Number(count);
    if (!Number.isFinite(numeric)) {
      return 1;
    }
    return Math.max(1, Math.min(12, Math.round(numeric)));
  }

  /**
   * Converts Persian (and Arabic-Indic) digits to ASCII digits.
   * @param {string} value
   * @returns {string}
   */
  function toArabicDigits(value) {
    return String(value).replace(/[۰-۹]/g, (d) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    );
  }

  /**
   * Converts an ASCII integer to Persian digits.
   * @param {number} value
   * @returns {string}
   */
  function toFaDigits(value) {
    return String(value).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
  }

  /**
   * Trims a numbered knowledge list (each item on its own line, prefixed
   * with \"۱.\" / \"1.\") to at most the requested count, renumbering the
   * kept items so the list stays sequential. Lines before the first item
   * (intro text) are preserved. Returns the text unchanged when no items
   * are found or the list is already within the count.
   * @param {string} text - The full fact text.
   * @param {number} count - Maximum number of list items to keep.
   * @param {string} langCode - 'fa' or 'en' (decides digit style).
   * @returns {string}
   */
  function trimListToCount(text, count, langCode) {
    if (!text || !count || count < 1) {
      return text;
    }
    const isFa = langCode === 'fa';
    const itemRe = isFa ? /^\s*[۰-۹0-9]{1,2}[.)]\s/u : /^\s*\d{1,2}[.)]\s/;
    const lines = text.split('\n');
    const firstItem = lines.findIndex((line) => itemRe.test(line));
    if (firstItem === -1) {
      return text;
    }
    const itemLines = lines.slice(firstItem);
    const itemIndexes = [];
    itemLines.forEach((line, idx) => {
      if (itemRe.test(line)) {
        itemIndexes.push(idx);
      }
    });
    if (itemIndexes.length <= count) {
      return text;
    }
    const keptIndexes = itemIndexes.slice(0, count);
    const kept = keptIndexes.map((idx, i) => {
      const number = isFa ? toFaDigits(i + 1) : String(i + 1);
      return itemLines[idx].replace(itemRe, `${number}. `);
    });
    return [...lines.slice(0, firstItem), ...kept].join('\n');
  }

  global.DaryaKnowledgeLists = {
    parseListCount,
    trimListToCount,
    toArabicDigits
  };
})(typeof window !== 'undefined' ? window : globalThis);
