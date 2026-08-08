/**
 * Darya - factual math handling.
 * Registered on a global consumed by the factual assembler (factual.js).
 */
(function (global) {
  'use strict';

  function parseFaNumber(raw) {
    const ascii = String(raw).replace(/[۰-۹]/g, (d) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    );
    return parseFloat(ascii.replace(/٫/g, '.'));
  }

  // Common Persian number words for word-form arithmetic ("پنج به علاوه
  // سه چند می‌شه؟"). Keys are sorted longest-first when building the
  // alternation so "پانزده" matches before "پنج".
  const FA_NUMBER_WORDS = {
    صفر: 0,
    یک: 1,
    یه: 1,
    دو: 2,
    سه: 3,
    چهار: 4,
    پنج: 5,
    شش: 6,
    شیش: 6,
    هفت: 7,
    هشت: 8,
    نه: 9,
    ده: 10,
    یازده: 11,
    دوازده: 12,
    سیزده: 13,
    چهارده: 14,
    پانزده: 15,
    شانزده: 16,
    هفده: 17,
    هجده: 18,
    نوزده: 19,
    بیست: 20,
    سی: 30,
    چهل: 40,
    پنجاه: 50,
    شصت: 60,
    هفتاد: 70,
    هشتاد: 80,
    نود: 90,
    صد: 100
  };

  /**
   * Detects word-form arithmetic in Persian text ("پنج به علاوه سه").
   * Returns the regex match or null. Both operands must be Persian number
   * words with letter boundaries, so "من پنج تا سیب دارم" never matches.
   * @param {string} text
   * @returns {RegExpMatchArray|null}
   */
  function faWordMathMatch(text) {
    const words = Object.keys(FA_NUMBER_WORDS).sort(
      (a, b) => b.length - a.length
    );
    const alt = words.join('|');
    return text.match(
      new RegExp(
        // eslint-disable-next-line max-len
        `(?<![\\p{L}0-9])(${alt})(?!\\p{L})\\s*(به علاوه|بعلاوه|منهای|ضربدر|تقسیم\\s+بر|به توان)\\s*(?<![\\p{L}0-9])(${alt})(?!\\p{L})`,
        'u'
      )
    );
  }

  function handleFactualQuestion(engine, text) {
    // Operands support integers and decimals. Persian text may use the
    // Persian decimal separator "٫" (U+066B) or the ASCII dot. The
    // negative lookbehind prevents matching a *substring* of a longer
    // number: "5.5+3" must not silently answer "5 + 3 = 8" by matching
    // the trailing "5+3", and a match may not start mid-decimal.
    const FA_OPERAND = '[۰-۹0-9]+(?:[.٫][۰-۹0-9]+)?|[.٫][۰-۹0-9]+';
    const EN_OPERAND = '\\d+(?:\\.\\d+)?|\\.\\d+';
    const FA_OP =
      '[+\\-*xX/^÷\\u00D7]|به علاوه|بعلاوه|منهای|ضربدر|تقسیم\\s+بر|به توان';
    const enMatch = text.match(
      new RegExp(
        `(?:what\\s+is|what'?s)\\s*(${EN_OPERAND})\\s*([+\\-*xX/^÷])\\s*(${EN_OPERAND})`,
        'i'
      )
    );
    const faMatch =
      engine.lang.code === 'fa'
        ? text.match(
            new RegExp(
              // eslint-disable-next-line max-len
              `(?<![\\d.٫۰-۹])\\s*(${FA_OPERAND})\\s*(${FA_OP})\\s*(${FA_OPERAND}).*(?:چند|چقدر|چیست|چیه|می‌شه|میشه|می‌شود|مساوی|برابر)`,
              'u'
            )
          )
        : null;

    const bareMath = text.match(
      new RegExp(
        `(?<![\\d.٫۰-۹])(${FA_OPERAND})\\s*(${FA_OP})\\s*(${FA_OPERAND})(?:\\s*[=:]?\\s*)?$`,
        'u'
      )
    );
    let isBareExpression = false;
    if (bareMath) {
      const matchText = text.slice(0, bareMath.index + bareMath[0].length);
      const hasPersianWordOp =
        /(?:بعلاوه|منهای|ضربدر|تقسیم\s+بر|به توان)/u.test(
          String(bareMath[2] || '')
        );
      // The operator character itself may be a letter (x / X for
      // multiplication), so it is excluded before the letter scan;
      // otherwise "5x3" would be rejected as text while "8*3" works.
      const opRaw = String(bareMath[2] || '');
      const lettersProbe = opRaw ? matchText.split(opRaw).join('') : matchText;
      const hasNoSurroundingLetters = !/[\p{L}]/u.test(lettersProbe);
      isBareExpression = hasNoSurroundingLetters || hasPersianWordOp;
    }
    const mathMatch =
      enMatch || faMatch || (isBareExpression ? bareMath : null);
    const isBareMatch = !!isBareExpression && !enMatch && !faMatch;
    if (mathMatch) {
      const a = parseFaNumber(mathMatch[1]);
      const b = parseFaNumber(mathMatch[3]);
      const opRaw = mathMatch[2];
      let result;
      let op;
      if (
        opRaw === 'x' ||
        opRaw === 'X' ||
        opRaw === '×' ||
        opRaw === 'ضربدر'
      ) {
        op = '*';
      } else if (
        opRaw === 'تقسیم' ||
        opRaw === 'تقسیم بر' ||
        opRaw === '÷' ||
        opRaw.toLowerCase() === '/'
      ) {
        op = '/';
      } else if (opRaw === 'بعلاوه' || opRaw === '+') {
        op = '+';
      } else if (opRaw === 'منهای' || opRaw === '-') {
        op = '-';
      } else if (opRaw === 'به توان' || opRaw === '^') {
        op = '^';
      } else {
        op = opRaw;
      }
      switch (op) {
        case '+':
          result = a + b;
          break;
        case '-':
          result = a - b;
          break;
        case '*':
          result = a * b;
          break;
        case '^':
          result = Math.pow(a, b);
          break;
        case '/':
          result = b !== 0 ? a / b : null;
          break;
        default:
          result = null;
      }
      if (result !== null && Number.isFinite(result)) {
        // Division can repeat forever (10 / 3 = 3.3333...) and binary
        // floating point can expose artifacts (2.9 + 0.1 = 3.0000000004,
        // 0.1 + 0.2 = 0.30000000000000004). Round to two decimals so the
        // reply reads cleanly, matching the percentage path.
        result = Math.round(result * 100) / 100;
      }
      if (result !== null && Number.isFinite(result)) {
        const isPersian = engine.lang.code === 'fa';
        const answerOp = isPersian
          ? opRaw.replace(
              /[+\-*\/xX^÷]/g,
              (m) =>
                ({
                  '+': ' به‌علاوه',
                  '-': ' منهای',
                  '*': ' ضربدر',
                  '/': ' تقسیم بر',
                  '^': ' به توان',
                  '÷': ' تقسیم بر',
                  x: ' ضربدر',
                  X: ' ضربدر'
                })[m] || m
            )
          : opRaw;
        const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
        const toPersian = (n) =>
          String(n)
            .replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
            .replace(/\./g, '٫');
        const answer = isPersian
          ? `${toPersian(a)} ${answerOp} ${toPersian(b)} مساوی است با ${toPersian(result)}.`
          : `${a} ${answerOp} ${b} = ${result}.`;
        if (isBareMatch) {
          return answer;
        }
        const followup = _pickFactualFollowup(engine);
        return answer + followup;
      }
      if (op === '/' && b === 0) {
        const answer =
          engine.lang.code === 'fa'
            ? 'تقسیم بر صفر تعریف‌نشده است.'
            : 'Dividing by zero is undefined.';
        const followup = _pickFactualFollowup(engine);
        return answer + followup;
      }
    }

    // Square roots: "جذر ۱۶", "square root of 9", "sqrt(16)". Only
    // answers when the expression is a lone root, so "5 + sqrt(4)" is
    // never double-handled here.
    const sqrtMatch = text.match(
      /(?:جذر|ریشه دوم|square root|sqrt)\s*(?:از\s*)?\(?\s*([۰-۹0-9.٫]+)\s*\)?/iu
    );
    if (sqrtMatch && !/[+\-*xX/^÷]/.test(text.slice(0, sqrtMatch.index))) {
      const n = parseFaNumber(sqrtMatch[1]);
      const result = Math.round(Math.sqrt(n) * 100) / 100;
      const isPersian = engine.lang.code === 'fa';
      const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
      const toPersian = (num) =>
        String(num).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
      const answer = isPersian
        ? `جذر ${toPersian(n)} مساوی است با ${toPersian(result)}.`
        : `The square root of ${n} is ${result}.`;
      return answer + _pickFactualFollowup(engine);
    }

    // Persian word-form arithmetic: "پنج به علاوه سه" (5 + 3). The
    // result is shown in Persian digits; the operands stay as words.
    // English word operators ("10 divided by 2", "5 plus 3", "2 times
    // 4") are normalized to their symbols so the shared math branch
    // below can compute them.
    const faWordMath = engine.lang.code === 'fa' ? faWordMathMatch(text) : null;
    const enWordMath = text.match(
      // eslint-disable-next-line max-len
      /(?:^|[^\p{L}0-9.])(\d+(?:\.\d+)?)\s*(divided\s+by|plus|minus|times|to\s+the\s+power\s+of)\s*(\d+(?:\.\d+)?)(?!\p{L})/iu
    );
    let wordA;
    let wordB;
    let wordOp;
    if (faWordMath) {
      wordA = FA_NUMBER_WORDS[faWordMath[1]];
      wordB = FA_NUMBER_WORDS[faWordMath[3]];
      wordOp = faWordMath[2];
    } else if (enWordMath) {
      wordA = parseFloat(enWordMath[1]);
      wordB = parseFloat(enWordMath[3]);
      const rawOp = enWordMath[2].toLowerCase();
      const EN_WORD_OPS = {
        'divided by': '/',
        plus: '+',
        minus: '-',
        times: '*',
        'to the power of': '^'
      };
      wordOp = EN_WORD_OPS[rawOp] || rawOp;
    }
    if (faWordMath || enWordMath) {
      const a = wordA;
      const b = wordB;
      const wordOpRaw = wordOp;
      const isWordDiv =
        wordOpRaw === 'تقسیم' || wordOpRaw === 'تقسیم بر' || wordOpRaw === '/';
      const isWordPow = wordOpRaw === 'به توان' || wordOpRaw === '^';
      const op = isWordDiv ? '/' : isWordPow ? '^' : wordOpRaw;
      let result;
      switch (op) {
        case 'بعلاوه':
        case 'به علاوه':
        case '+':
          result = a + b;
          break;
        case 'منهای':
        case '-':
          result = a - b;
          break;
        case 'ضربدر':
        case '*':
          result = a * b;
          break;
        case '^':
          result = Math.pow(a, b);
          break;
        case '/':
          result = b !== 0 ? a / b : null;
          break;
        default:
          result = null;
      }
      if (b === 0 && isWordDiv) {
        return engine.lang.code === 'fa'
          ? 'تقسیم بر صفر تعریف‌نشده است.'
          : 'Dividing by zero is undefined.';
      }
      if (result !== null && Number.isFinite(result)) {
        result = Math.round(result * 100) / 100;
        if (engine.lang.code === 'fa' && faWordMath) {
          const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
          const toPersian = (num) =>
            String(num).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
          const answerOp = isWordDiv
            ? ' تقسیم بر'
            : isWordPow
              ? ' به توان'
              : ` ${wordOpRaw}`;
          return (
            `${faWordMath[1]}${answerOp} ${faWordMath[3]} مساوی است با ` +
            `${toPersian(result)}.` +
            _pickFactualFollowup(engine)
          );
        }
        const symbolOp =
          wordOpRaw === '/'
            ? '/'
            : wordOpRaw === '+'
              ? '+'
              : wordOpRaw === '-'
                ? '-'
                : wordOpRaw === '*'
                  ? '*'
                  : wordOpRaw === '^'
                    ? '^'
                    : wordOpRaw;
        return (
          `${a} ${symbolOp} ${b} = ${result}.` + _pickFactualFollowup(engine)
        );
      }
    }

    // Percentage questions: "what is 15% of 200" or "۲۰ درصد از ۵۰".
    // The math operator path above only handles two-operand arithmetic,
    // so percentages are detected separately and answered directly.
    const percentMatch =
      engine.lang.code === 'fa'
        ? text.match(/([۰-۹0-9]+)\s*(?:٪|%|درصد)\s*از\s*([۰-۹0-9]+)/u)
        : text.match(
            /(?:what\s+(?:is|'?s)\s+)?(\d+(?:\.\d+)?)\s*(?:%|percent)\s*of\s*(\d+(?:\.\d+)?)/iu
          );
    if (percentMatch) {
      const pct = parseFloat(
        String(percentMatch[1]).replace(/[۰-۹]/g, (d) =>
          String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        )
      );
      const base = parseFloat(
        String(percentMatch[2]).replace(/[۰-۹]/g, (d) =>
          String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        )
      );
      const raw = (pct * base) / 100;
      const result = Math.round(raw * 100) / 100;
      const isPersian = engine.lang.code === 'fa';
      const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
      const toPersian = (n) =>
        String(n).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
      const answer = isPersian
        ? `${toPersian(pct)}٪ از ${toPersian(base)} مساوی است با ${toPersian(result)}.`
        : `${pct}% of ${base} = ${result}.`;
      return answer + _pickFactualFollowup(engine);
    }

    // Random number in a range: "pick a random number between 5 and 20",
    // "بین ۵ و ۲۰ یک عدد تصادفی بگو". Both bounds may appear in either
    // order; the answer is a uniformly chosen integer in [min, max].
    const randomMatch =
      engine.lang.code === 'fa'
        ? text.match(
            // eslint-disable-next-line max-len
            /(?:بین|از)\s*([۰-۹0-9]+)\s*(?:تا|و)\s*([۰-۹0-9]+).*(?:عدد|شماره)|(?:عدد|شماره).*(?:بین|از)\s*([۰-۹0-9]+)\s*(?:تا|و)\s*([۰-۹0-9]+)/u
          )
        : text.match(
            // eslint-disable-next-line max-len
            /(?:random|pick|choose|give me).{0,24}(?:number|integer).{0,12}(?:between|from)\s*(\d+)\s*(?:and|to|-)\s*(\d+)/iu
          );
    if (randomMatch) {
      const isPersian = engine.lang.code === 'fa';
      const a = parseFaNumber(randomMatch[1] || randomMatch[3]);
      const b = parseFaNumber(randomMatch[2] || randomMatch[4]);
      const min = Math.min(a, b);
      const max = Math.max(a, b);
      const lo = Math.ceil(min);
      const hi = Math.floor(max);
      const value =
        lo >= hi ? lo : lo + Math.floor(Math.random() * (hi - lo + 1));
      const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
      const toPersian = (n) =>
        String(n).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
      const answer = isPersian
        ? `یک عدد تصادفی بین ${toPersian(lo)} و ${toPersian(hi)}: ${toPersian(value)}.`
        : `A random number between ${lo} and ${hi}: ${value}.`;
      return answer + _pickFactualFollowup(engine);
    }

    // Primality check: "is 17 a prime number?", "آیا ۱۷ عدد اول است؟".
    // Answers with a yes/no plus, for composite numbers, one divisor so
    // the reply is verifiable, not a bare assertion.
    const primeMatch =
      engine.lang.code === 'fa'
        ? text.match(
            // eslint-disable-next-line max-len
            /(?:آیا|ایا)\s*([۰-۹0-9]+)\s*(?:عدد\s*)?اول\s*(?:است|هست|می‌شه|میشه|نیست|\?|؟)|([۰-۹0-9]+)\s*(?:عدد\s*)?اول\s*(?:است|هست|می‌شه|میشه|نیست)/u
          )
        : text.match(
            /(?:is|check\s+(?:if|whether))\s*(\d+)\s*(?:a\s+)?prime|(\d+)\s+(?:is|be)\s+(?:a\s+)?prime\b/iu
          );
    if (primeMatch) {
      const n = parseFaNumber(primeMatch[1] || primeMatch[2]);
      const isPersian = engine.lang.code === 'fa';
      const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
      const toPersian = (x) =>
        String(x).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
      const isPrime = isPrimeNumber(n);
      if (isPersian) {
        const verdict = isPrime
          ? `بله، ${toPersian(n)} یک عدد اول است.`
          : `خیر، ${toPersian(n)} عدد اول نیست.`;
        return verdict + _pickFactualFollowup(engine);
      }
      const verdict = isPrime
        ? `Yes, ${n} is a prime number.`
        : `No, ${n} is not a prime number.`;
      return verdict + _pickFactualFollowup(engine);
    }

    // Coin flip: "flip a coin", "heads or tails", "شیر یا خط". A uniform
    // 50/50 pick, answered without any fake physics: the coin is fair.
    const coinMatch =
      engine.lang.code === 'fa'
        ? /(?:شیر یا خط|شیر و خط|سکه بنداز|سکه بینداز|سکه بندازم|بنداز سکه|بینداز سکه)/u.test(
            text
          )
        : /(?:flip|toss|throw)\s+(?:(?:a|the)\s+)?coin|coin\s+(?:flip|toss)|heads\s+or\s+tails/iu.test(
            text
          );
    if (coinMatch) {
      const heads = Math.random() < 0.5;
      const answer =
        engine.lang.code === 'fa'
          ? heads
            ? 'شیر آمد.'
            : 'خط آمد.'
          : heads
            ? 'It came up heads.'
            : 'It came up tails.';
      return answer + _pickFactualFollowup(engine);
    }
    return null;
  }

  /**
   * Checks whether a non-negative integer is prime via trial division up
   * to its square root. 0 and 1 are not prime; 2 is the only even prime.
   * @param {number} n - Non-negative integer
   * @returns {boolean}
   */
  function isPrimeNumber(n) {
    if (!Number.isInteger(n) || n < 2) {
      return false;
    }
    if (n === 2) {
      return true;
    }
    if (n % 2 === 0) {
      return false;
    }
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Picks a follow-up redirect for a factual (math) answer. The follow-up
   * is a light meta-question, so it must bypass the question-budget filter
   * (otherwise, once the budget is spent, _pickVaried would fall back to a
   * generic therapeutic line instead of the intended follow-up pool).
   * @param {DaryaResponseEngine} engine
   * @returns {string} Follow-up sentence with a leading space, or ''
   */
  function _pickFactualFollowup(engine) {
    if (
      engine.lang.factualQuestionFollowups &&
      engine.lang.factualQuestionFollowups.length
    ) {
      return (
        ' ' +
        engine._pickVaried(engine.lang.factualQuestionFollowups, {
          ignoreQuestionBudget: true
        })
      );
    }
    return '';
  }

  // ======================================================================
  // Date/time question handling
  //
  // Detects and answers questions about the current date and time using
  // the browser's Intl API. Supports both Gregorian (default) and
  // Jalali/Persian calendar (via Intl calendar option 'persian'),
  // which provides the Iranian calendar without any external library.
  //
  // Two input forms are handled:
  //   1. Time queries: "what time is it", "ساعت چنده"
  //   2. Date queries: "what is today", "تاریخ امروز", "امروز چندمه"
  //
  // For Persian (fa) engines, the date is given in both the official
  // Jalali calendar AND the Gregorian equivalent so users get the full
  // picture. After answering, a gentle follow-up question redirects
  // back to the user's emotional context.
  // ======================================================================

  global.DaryaFactualMath = { handleFactualQuestion };
})(typeof window !== 'undefined' ? window : globalThis);
