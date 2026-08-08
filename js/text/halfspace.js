/**
 * Persian half-space normalizer.
 * Classic script version.
 */

(function (global) {
  const {
    ZWNJ,
    PERSIAN_SCRIPT,
    PERSIAN_LETTER,
    DIACRITICS,
    ARABIC_DIGITS,
    CHAR_REPLACEMENTS,
    VERB_STEMS,
    JOINED_PROGRESSIVE_STEMS,
    PRIVATIVE_WORDS,
    NEGATIVE_PREFIX_WORDS,
    COMPARATIVE_BASES,
    NON_PLURAL_HA_WORDS,
    COMMON_COMPOUNDS,
    POSSESSIVE_SUFFIXES
  } = global.DaryaHalfspaceData;

  function replaceArabicCharacters(text) {
    return [...text]
      .map((char) => CHAR_REPLACEMENTS.get(char) || char)
      .join('');
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
    return [...value].some(
      (character) =>
        PERSIAN_LETTER.test(character) && PERSIAN_SCRIPT.test(character)
    );
  }

  function isPersianWord(value) {
    return isWord(value) && PERSIAN_SCRIPT.test(value);
  }

  function trimPunctuation(value) {
    return value.replace(
      /^[،؛؟!,.:\[\]{}()«»"']+|[،؛؟!,.:\[\]{}()«»"']+$/gu,
      ''
    );
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
      if (
        stem &&
        (VERB_STEMS.has(stem) || JOINED_PROGRESSIVE_STEMS.includes(stem))
      ) {
        return `${prefix}${ZWNJ}${stem}`;
      }
    }
    return null;
  }

  function joinPrefix(left, right) {
    const leftWord = trimPunctuation(left);
    const rightWord = trimPunctuation(right);
    if (!isPersianWord(leftWord) || !isPersianWord(rightWord)) {
      return null;
    }

    if (
      (leftWord === 'می' || leftWord === 'نمی') &&
      VERB_STEMS.has(rightWord)
    ) {
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
    if (!isPersianWord(leftWord) || !isPersianWord(rightWord)) {
      return null;
    }

    if (
      rightWord === 'ها' ||
      rightWord === 'های' ||
      /^(?:ها|های)(?:یم|یت|یش|مان|تان|شان|م|ت|ش)$/u.test(rightWord)
    ) {
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
        const replacement =
          joinPrefix(current, next) ||
          joinSuffix(current, next) ||
          joinKnownCompound(current, next);
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
    if (progressive) {
      return preserveCasePunctuation(word, progressive);
    }

    // The upstream implementation purposefully did not guess on arbitrary
    // joined forms.  These are unambiguous conversational verb prefixes;
    // applying ZWNJ only when the remainder is a known stem avoids changing
    // words such as میز and میدان.
    for (const prefix of ['نمی', 'می']) {
      if (!punctuationFree.startsWith(prefix)) {
        continue;
      }
      const remainder = punctuationFree.slice(prefix.length);
      if (JOINED_PROGRESSIVE_STEMS.includes(remainder)) {
        return preserveCasePunctuation(word, `${prefix}${ZWNJ}${remainder}`);
      }
    }

    // Joined spellings are common in fast typing too: بیادب, ناامید,
    // کتابها, کتابهایشان, and بزرگتر. Only lexicalized prefix forms and
    // plausible suffix bases are rewritten; this keeps رها and بها intact.
    for (const [prefix, vocabulary] of [
      ['بی', PRIVATIVE_WORDS],
      ['نا', NEGATIVE_PREFIX_WORDS]
    ]) {
      if (
        punctuationFree.startsWith(prefix) &&
        vocabulary.has(punctuationFree.slice(prefix.length))
      ) {
        return preserveCasePunctuation(
          word,
          `${prefix}${ZWNJ}${punctuationFree.slice(prefix.length)}`
        );
      }
    }

    const pluralMatch = punctuationFree.match(
      /^(.+?)(های|ها)(مان|تان|شان|یم|یت|یش|م|ت|ش)?$/u
    );
    if (
      pluralMatch &&
      pluralMatch[1].length > 2 &&
      !NON_PLURAL_HA_WORDS.has(punctuationFree)
    ) {
      const base = pluralMatch[1].replace(new RegExp(ZWNJ, 'gu'), '');
      return preserveCasePunctuation(
        word,
        `${base}${ZWNJ}${pluralMatch[2]}${pluralMatch[3] || ''}`
      );
    }

    const comparativeMatch = punctuationFree.match(/^(.+?)(ترین|تر)$/u);
    if (
      comparativeMatch &&
      COMPARATIVE_BASES.has(
        comparativeMatch[1].replace(new RegExp(ZWNJ, 'gu'), '')
      )
    ) {
      const base = comparativeMatch[1].replace(new RegExp(ZWNJ, 'gu'), '');
      return preserveCasePunctuation(
        word,
        `${base}${ZWNJ}${comparativeMatch[2]}`
      );
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
    if (input === null || input === undefined) {
      return '';
    }
    let text = String(input).normalize('NFKC');
    text = replaceArabicCharacters(text);
    text = text.replace(DIACRITICS, '');
    text = normalizeDigits(text);
    text = text.replace(/[\u200b\u200d\ufeff]/gu, '');
    text = text.replace(/[ \t\r\n\f\v]+/gu, ' ').trim();

    let parts = text.split(/(\s+)/u);
    parts = parts.map((part) =>
      isWord(part) ? normalizeJoinedWord(part) : part
    );
    // A few passes allow “خانه ها یم” to become “خانه‌هایم” without turning
    // normal spaces elsewhere into half-spaces.  Two passes are enough for
    // prefix + stem + possessive sequences; the bounded loop is defensive.
    for (let pass = 0; pass < 3; pass += 1) {
      const joined = joinAdjacentWords(parts);
      const next = joined.join('');
      if (next === parts.join('')) {
        break;
      }
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

  global.DaryaHalfspace = { ZWNJ, halfSpace, isPersianWord };
})(typeof window !== 'undefined' ? window : globalThis);
