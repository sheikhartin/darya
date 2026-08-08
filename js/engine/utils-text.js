/**
 * Darya - shared text-processing helpers.
 * Registered on global.DaryaUtilsText; utils.js merges these into the
 * public DaryaUtils object so every existing consumer keeps working.
 * Split out of utils.js so each file stays under the line limit.
 */
(function (global) {
  'use strict';

  const { PRONOUN_REFLECTION_MAX_WORDS, PRONOUN_REFLECTION_MIN_WORDS } =
    global.DaryaUtilsConstants;

  /**
   * Ratio of alphabetic characters in `text` that fall inside
   * `scriptRange`. Returns null when the text has no letters at all.
   * @param {string} text
   * @param {RegExp} scriptRange
   * @returns {number|null}
   */
  function scriptRatio(text, scriptRange) {
    const letters = [...String(text)].filter((ch) => /\p{L}/u.test(ch));
    if (letters.length === 0) {
      return null;
    }
    const inScript = letters.filter((ch) => scriptRange.test(ch));
    return inScript.length / letters.length;
  }

  /**
   * Determines whether `text` is predominantly written in the script the
   * active language pack expects. Text with no alphabetic characters at
   * all (numbers, punctuation, emoji) is treated as acceptable.
   * @param {string} text
   * @param {object} lang - The active language pack.
   * @returns {boolean}
   */
  function isValidScript(text, lang) {
    const ratio = scriptRatio(text, lang.scriptRange);
    if (ratio === null) {
      return true;
    }
    return ratio >= lang.minScriptRatio;
  }

  /**
   * Truncates a long excerpt for use in a quoted callback, so we don't
   * echo an entire paragraph back at someone.
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  function truncateExcerpt(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength).trim()}...`;
  }

  /**
   * Canonicalizes the raw input for rule matching. The original text is
   * preserved unchanged in memory, while the return value is stripped of
   * punctuation, zero-width characters (ZWNJ, ZWJ, etc.), and
   * excessive whitespace. Persian progressive prefixes ("می"/"نمی")
   * are further unified by removing the space after them, so "می شود",
   * "می‌شود", and "میشود" all reach the same rule path. Other compound
   * spellings ("خوش‌بین" vs "خوش بین") remain distinct and each
   * needs a corresponding pattern alternative.
   *
   * Common Gen-Z and casual English abbreviations are also expanded here
   * (not in the language pack's normalize) so that the expanded form is
   * used only for rule/pattern matching and is never stored in the
   * conversation memory; Darya will never quote the expanded form
   * back to the user via the quoted-callback feature.
   * @param {string} rawText
   * @param {object} lang - The active language pack.
   * @returns {string}
   */
  function normalizeForMatching(rawText, lang) {
    let text = lang
      .normalize(rawText)
      .replace(/[^\p{L}\p{N}\p{M}'\u2019\u02BC\-\s]+/gu, ' ')
      .replace(/[\u200c\u200d\u200b\ufeff]+/gu, '')
      .replace(/[ \t\r\n]+/gu, ' ')
      .trim();
    // Persian progressive-prefix binding runs after the half-space has
    // become a regular space, so "می شود", "می‌شود", and "میشود" all
    // collapse to the same matching token. Other languages have no hook.
    if (lang.bindPrefixesForMatching) {
      text = lang.bindPrefixesForMatching(text);
    }
    return (
      text
        // Expand abbreviations for matching only (not stored in memory):
        .replace(/\bafaik\b/gi, 'as far as i know')
        .replace(/\bafk\b/gi, 'away from keyboard')
        .replace(/\bbrb\b/gi, 'be right back')
        .replace(/\bbtw\b/gi, 'by the way')
        .replace(/\bidk\b/gi, 'i do not know')
        .replace(/\bikr\b/gi, 'i know right')
        .replace(/\bimo\b/gi, 'in my opinion')
        .replace(/\bimho\b/gi, 'in my humble opinion')
        .replace(/\birl\b/gi, 'in real life')
        .replace(/\bjk\b/gi, 'just kidding')
        .replace(/\blmao\b/gi, 'laughing my ass off')
        .replace(/\blol\b/gi, 'laughing out loud')
        .replace(/\bngl\b/gi, 'not gonna lie')
        .replace(/\bnp\b/gi, 'no problem')
        .replace(/\bnvm\b/gi, 'never mind')
        .replace(/\bofc\b/gi, 'of course')
        .replace(/\bomg\b/gi, 'oh my god')
        .replace(/\bsmh\b/gi, 'shaking my head')
        .replace(/\btbf\b/gi, 'to be fair')
        .replace(/\btbh\b/gi, 'to be honest')
        .replace(/\bty\b/gi, 'thank you')
        .replace(/\btyvm\b/gi, 'thank you very much')
        .replace(/\bwth\b/gi, 'what the hell')
        .replace(/\bwtf\b/gi, 'what the fuck')
    );
  }

  /**
   * Scores a normalized message using a simple keyword lexicon: +1 for
   * each positive-lexicon word found, -1 for each negative-lexicon word
   * found. Words are matched per token as the LONGEST prefix of the
   * token, which tolerates attached Persian person suffixes ("ناراحتم"
   * matches "ناراحت") while avoiding substring false positives ("راحت"
   * inside "ناراحت", or "غم" inside "غمگین"). Negation words listed in
   * the lexicon's optional `negations` array flip the polarity of an
   * adjacent sentiment word ("خوب نیست" and "not happy" score
   * negative). This is a lightweight heuristic consistent with the rest
   * of the engine's keyword-driven design, not a real sentiment model.
   * @param {string} normalizedText
   * @param {{positive: string[], negative: string[], negations?: string[]}} lexicon
   * @returns {number}
   */
  function scoreSentiment(normalizedText, lexicon) {
    const tokens = normalizedText.split(/\s+/u).filter(Boolean);
    const negations = new Set(lexicon.negations || []);
    let score = 0;
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      let contribution = 0;
      let bestLength = 0;
      for (const word of lexicon.negative) {
        if (token.startsWith(word) && word.length > bestLength) {
          bestLength = word.length;
          contribution = -1;
        }
      }
      for (const word of lexicon.positive) {
        if (token.startsWith(word) && word.length > bestLength) {
          bestLength = word.length;
          contribution = 1;
        }
      }
      if (contribution === 0) {
        continue;
      }
      const negated =
        (i > 0 && negations.has(tokens[i - 1])) ||
        (i > 1 && negations.has(tokens[i - 2])) ||
        (i < tokens.length - 1 && negations.has(tokens[i + 1]));
      score += negated ? -contribution : contribution;
    }
    return score;
  }

  /**
   * Attempts a careful ELIZA-style pronoun-swap reflection ("I feel tired"
   * -> "you feel tired"). Only used when the language pack provides a
   * `pronounMap`. Bounded by word-count guards and returns null (meaning
   * "don't use this") whenever the result might look grammatically
   * questionable, so a failed reflection silently falls through to a
   * normal fallback instead of ever being shown.
   * @param {string} text
   * @param {Record<string, string>} pronounMap
   * @returns {string|null}
   */
  function reflectPronouns(text, pronounMap) {
    const words = text.trim().split(/\s+/);
    if (
      words.length < PRONOUN_REFLECTION_MIN_WORDS ||
      words.length > PRONOUN_REFLECTION_MAX_WORDS
    ) {
      return null;
    }

    let swapped = false;
    const result = words.map((token) => {
      const match = token.match(/^([A-Za-z']+)([.,!?]*)$/);
      if (!match) {
        return token;
      }
      const [, word, punct] = match;
      const lower = word.toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(pronounMap, lower)) {
        return token;
      }

      swapped = true;
      let replacement = pronounMap[lower];
      if (word[0] === word[0].toUpperCase() && lower !== 'i') {
        replacement =
          replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement + punct;
    });

    if (!swapped) {
      return null;
    }
    return result.join(' ');
  }

  global.DaryaUtilsText = {
    scriptRatio,
    isValidScript,
    truncateExcerpt,
    normalizeForMatching,
    scoreSentiment,
    reflectPronouns
  };
})(typeof window !== 'undefined' ? window : globalThis);
