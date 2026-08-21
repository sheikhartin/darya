/**
 * Darya - extended math question handlers (factorial, GCD/LCM, average,
 * remainder, parity, divisibility, percent-of-relation, percent change,
 * cube roots, absolute value, and rounding), in both languages and both
 * digit systems. Part file of the factual math layer: factual-math.js
 * calls handleExtendedMath after the word-problem and full-expression
 * paths, so a compound expression is never re-answered as a fragment
 * here. Every reply is exact arithmetic, never an estimate, and honest
 * refusals cover the undefined cases (0/0 remainder, factorial of a
 * negative, oversized factorials).
 */
(function (global) {
  'use strict';

  const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  /** Factorials above this overflow double precision (21! > 2^64). */
  const MAX_FACTORIAL = 20;
  /** Averages accept at most this many listed numbers. */
  const MAX_AVERAGE_TERMS = 12;
  /** Rounded results keep at most two decimals, like the base layer. */
  const ROUND_SCALE = 100;

  /** Converts a Persian- or ASCII-digit token (or word zero) to a Number. */
  function toNumber(raw) {
    const cleaned = String(raw).trim();
    if (cleaned === 'صفر' || cleaned.toLowerCase() === 'zero') {
      return 0;
    }
    return Number(
      cleaned
        .replace(/[۰-۹]/gu, (d) => String(PERSIAN_DIGITS.indexOf(d)))
        .replace(/٫/gu, '.')
        .replace(/\s+/gu, '')
    );
  }

  /** Formats a number for the reply in the active language. */
  function formatNumber(engine, n) {
    const rounded = Math.round(n * ROUND_SCALE) / ROUND_SCALE;
    if (engine.lang.code !== 'fa') {
      return String(rounded);
    }
    return String(rounded)
      .replace(/[0-9]/gu, (d) => PERSIAN_DIGITS[Number(d)])
      .replace(/\./gu, '٫');
  }

  /** Greatest common divisor of two non-negative integers. */
  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      [x, y] = [y, x % y];
    }
    return x;
  }

  /** Number token: ASCII or Persian digits with an optional decimal,
   *  or the word zero (needed for «باقیمانده ۵ بر صفر»). */
  const NUM = '[-−]?\\s*[۰-۹0-9]+(?:[.٫][۰-۹0-9]+)?|صفر|zero';

  /**
   * Answers the extended math question shapes, or returns null so the
   * base layer continues. Called with the normalized user text.
   * @param {object} engine - The response engine (for language)
   * @param {string} text - Normalized user text
   * @returns {string|null}
   */
  function handleExtendedMath(engine, text) {
    const isFa = engine.lang.code === 'fa';
    const fmt = (n) => formatNumber(engine, n);

    // --- Factorial: «فاکتوریل ۵», "factorial of 5", "5!" -----------------
    const factorialMatch =
      text.match(
        new RegExp(
          `(?:فاکتوریل|factorial)\\s*(?:از|of)?\\s*((?:منفی|negative|minus)?\\s*(?:${NUM}))`,
          'iu'
        )
      ) ||
      text.match(new RegExp(`(?<![\\d.٫۰-۹])(${NUM})\\s*!(?![=\\w])`, 'u'));
    if (factorialMatch) {
      const n = toNumber(
        factorialMatch[1].replace(/منفی|negative|minus/giu, '-')
      );
      if (!Number.isInteger(n) || n < 0) {
        return isFa
          ? 'فاکتوریل فقط برای عددهای صحیح نامنفی تعریف می‌شود؛ برای اعشاری و منفی جواب سرراستی نیست.'
          : 'Factorials are only defined for whole non-negative numbers; decimals and negatives have no simple answer.';
      }
      if (n > MAX_FACTORIAL) {
        return isFa
          ? `فاکتوریل ${fmt(n)} عدد غول‌آسایی می‌شود که از دقت محاسبه‌ی من ` +
              `بیرون می‌زند؛ تا فاکتوریل ${fmt(MAX_FACTORIAL)} را دقیق حساب می‌کنم.`
          : `${fmt(n)} factorial is a monster that overflows my precision; ` +
              `I can compute exactly up to ${fmt(MAX_FACTORIAL)} factorial.`;
      }
      let result = 1;
      for (let i = 2; i <= n; i += 1) {
        result *= i;
      }
      return isFa
        ? `فاکتوریل ${fmt(n)} مساوی است با ${fmt(result)}.`
        : `${fmt(n)} factorial equals ${fmt(result)}.`;
    }

    // --- GCD / LCM: «ب.م.م ۱۲ و ۱۸», "gcd of 12 and 18" ------------------
    const gcdLcmMatch = text.match(
      new RegExp(
        '(ب\\s*[.٫]?\\s*م\\s*[.٫]?\\s*م|ک\\s*[.٫]?\\s*م\\s*[.٫]?\\s*م|' +
          'بزرگ[\\s\\u200c]*ترین مقسوم[ ‌]علیه مشترک|' +
          'کوچک[\\s\\u200c]*ترین مضرب مشترک|gcd|lcm|' +
          'greatest common divisor|least common multiple)' +
          `\\s*(?:از|of)?\\s*(${NUM})\\s*(?:و|and|,|،)\\s*(${NUM})`,
        'iu'
      )
    );
    if (gcdLcmMatch) {
      const kind = gcdLcmMatch[1].replace(/[\s.٫]/gu, '').toLowerCase();
      const a = toNumber(gcdLcmMatch[2]);
      const b = toNumber(gcdLcmMatch[3]);
      if (!Number.isInteger(a) || !Number.isInteger(b) || a === 0 || b === 0) {
        return isFa
          ? 'ب.م.م و ک.م.م برای عددهای صحیح غیرصفر معنی دارند؛ دو عدد صحیح بده تا حساب کنم.'
          : 'GCD and LCM make sense for non-zero whole numbers; give me two integers and I will work it out.';
      }
      const isLcm =
        kind.startsWith('کمم') ||
        kind === 'lcm' ||
        kind.startsWith('کوچک') ||
        kind.startsWith('least');
      const g = gcd(a, b);
      if (isLcm) {
        const lcm = Math.abs((a / g) * b);
        return isFa
          ? `ک.م.م ${fmt(a)} و ${fmt(b)} مساوی است با ${fmt(lcm)}.`
          : `The least common multiple of ${fmt(a)} and ${fmt(b)} is ${fmt(lcm)}.`;
      }
      return isFa
        ? `ب.م.م ${fmt(a)} و ${fmt(b)} مساوی است با ${fmt(g)}.`
        : `The greatest common divisor of ${fmt(a)} and ${fmt(b)} is ${fmt(g)}.`;
    }

    // --- Average: «میانگین ۳ و ۷ و ۸», "average of 4, 8, 15" -------------
    const averageMatch = text.match(
      new RegExp(
        '(?:میانگین|معدل|average|mean)\\s*(?:از|of)?\\s*' +
          `((?:${NUM})(?:\\s*(?:و|and|,|،)\\s*(?:${NUM}))+)`,
        'iu'
      )
    );
    if (averageMatch) {
      const numbers = (
        averageMatch[1].match(/[-−]?[۰-۹0-9]+(?:[.٫][۰-۹0-9]+)?/gu) || []
      )
        .map(toNumber)
        .filter((n) => Number.isFinite(n));
      if (numbers.length >= 2 && numbers.length <= MAX_AVERAGE_TERMS) {
        const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
        return isFa
          ? `میانگین این ${fmt(numbers.length)} عدد مساوی است با ${fmt(avg)}.`
          : `The average of those ${fmt(numbers.length)} numbers is ${fmt(avg)}.`;
      }
    }

    // --- Remainder / modulo: «باقیمانده ۱۷ بر ۵», "17 mod 5" -------------
    const modMatch =
      text.match(
        new RegExp(
          '(?:باقیمانده|باقی مانده|remainder)\\s*(?:ی|of)?\\s*(?:تقسیم\\s*)?' +
            `(${NUM})\\s*(?:بر|تقسیم بر|divided by|by|on)\\s*(${NUM})`,
          'iu'
        )
      ) ||
      text.match(
        new RegExp(
          `(${NUM})\\s*(?:mod|%)\\s*(${NUM})\\s*(?:چند|چقدر|چیه|میشه|می شه|=|\\?|؟)`,
          'iu'
        )
      );
    if (modMatch) {
      const a = toNumber(modMatch[1]);
      const b = toNumber(modMatch[2]);
      if (b === 0) {
        return isFa
          ? 'باقیمانده‌ی تقسیم بر صفر تعریف‌نشده است؛ صفر نمی‌تواند مقسوم‌علیه باشد.'
          : 'A remainder after dividing by zero is undefined; zero cannot be the divisor.';
      }
      const r = a % b;
      return isFa
        ? `باقیمانده‌ی ${fmt(a)} بر ${fmt(b)} مساوی است با ${fmt(r)}.`
        : `The remainder of ${fmt(a)} divided by ${fmt(b)} is ${fmt(r)}.`;
    }

    // --- Parity: «۴۲ زوجه یا فرد؟», "is 41 even or odd?" -----------------
    const parityMatch = text.match(
      new RegExp(
        `(${NUM})\\s*(?:زوجه|زوج است|زوجه یا فرد|زوج است یا فرد|فرده|فرد است|فرده یا زوج)|` +
          `is\\s*(${NUM})\\s*(?:an?\\s*)?(?:even|odd)`,
        'iu'
      )
    );
    if (parityMatch) {
      const n = toNumber(parityMatch[1] || parityMatch[2]);
      if (Number.isInteger(n)) {
        const even = n % 2 === 0;
        return isFa
          ? `${fmt(n)} عدد ${even ? 'زوج' : 'فرد'}ی است.`
          : `${fmt(n)} is an ${even ? 'even' : 'odd'} number.`;
      }
      return isFa
        ? 'زوج و فرد فقط برای عددهای صحیح معنی دارد؛ اعشاری‌ها نه زوج‌اند نه فرد.'
        : 'Even and odd only apply to whole numbers; decimals are neither.';
    }

    // --- Divisibility: «۵۱ بر ۳ بخش پذیره؟», "is 51 divisible by 3" ------
    const divisibleMatch = text.match(
      new RegExp(
        `(${NUM})\\s*بر\\s*(${NUM})\\s*بخش\\s*‌?پذیر|is\\s*(${NUM})\\s*divisible\\s*by\\s*(${NUM})`,
        'iu'
      )
    );
    if (divisibleMatch) {
      const a = toNumber(divisibleMatch[1] || divisibleMatch[3]);
      const b = toNumber(divisibleMatch[2] || divisibleMatch[4]);
      if (b === 0) {
        return isFa
          ? 'هیچ عددی بر صفر بخش‌پذیر نیست؛ تقسیم بر صفر تعریف‌نشده است.'
          : 'Nothing is divisible by zero; dividing by zero is undefined.';
      }
      const divisible = a % b === 0;
      if (isFa) {
        return divisible
          ? `بله، ${fmt(a)} بر ${fmt(b)} بخش‌پذیر است (${fmt(a)} ÷ ${fmt(b)} = ${fmt(a / b)}).`
          : `نه، ${fmt(a)} بر ${fmt(b)} بخش‌پذیر نیست؛ باقیمانده ${fmt(a % b)} می‌شود.`;
      }
      return divisible
        ? `Yes, ${fmt(a)} is divisible by ${fmt(b)} (${fmt(a)} ÷ ${fmt(b)} = ${fmt(a / b)}).`
        : `No, ${fmt(a)} is not divisible by ${fmt(b)}; the remainder is ${fmt(a % b)}.`;
    }

    // --- "X is what percent of Y": «۱۵ چند درصد ۶۰ است» ------------------
    const percentOfMatch =
      text.match(
        new RegExp(`(${NUM})\\s*چند\\s*درصد\\s*(?:از\\s*)?(${NUM})`, 'u')
      ) ||
      text.match(
        new RegExp(
          `(${NUM})\\s*is\\s*what\\s*percent(?:age)?\\s*of\\s*(${NUM})|` +
            `what\\s*percent(?:age)?\\s*of\\s*(${NUM})\\s*is\\s*(${NUM})`,
          'iu'
        )
      );
    if (percentOfMatch) {
      const part = toNumber(percentOfMatch[1] || percentOfMatch[4]);
      const whole = toNumber(percentOfMatch[2] || percentOfMatch[3]);
      if (whole !== 0 && Number.isFinite(part) && Number.isFinite(whole)) {
        const pct = (part / whole) * 100;
        return isFa
          ? `${fmt(part)} برابر است با ${fmt(pct)} درصد از ${fmt(whole)}.`
          : `${fmt(part)} is ${fmt(pct)} percent of ${fmt(whole)}.`;
      }
    }

    // --- Percent change: «از ۵۰ به ۶۵ چند درصد», "from 50 to 65" ---------
    const changeMatch = text.match(
      new RegExp(
        `از\\s*(${NUM})\\s*به\\s*(${NUM})\\s*چند\\s*درصد|` +
          `percent(?:age)?\\s*(?:change|increase|decrease)\\s*from\\s*(${NUM})\\s*to\\s*(${NUM})|` +
          `from\\s*(${NUM})\\s*to\\s*(${NUM})\\s*.{0,20}percent`,
        'iu'
      )
    );
    if (changeMatch) {
      const from = toNumber(changeMatch[1] || changeMatch[3] || changeMatch[5]);
      const to = toNumber(changeMatch[2] || changeMatch[4] || changeMatch[6]);
      if (from !== 0 && Number.isFinite(from) && Number.isFinite(to)) {
        const pct = ((to - from) / Math.abs(from)) * 100;
        const rising = pct >= 0;
        return isFa
          ? `از ${fmt(from)} به ${fmt(to)} یعنی ${fmt(Math.abs(pct))} درصد ${rising ? 'افزایش' : 'کاهش'}.`
          : `Going from ${fmt(from)} to ${fmt(to)} is a ${fmt(Math.abs(pct))} percent ${rising ? 'increase' : 'decrease'}.`;
      }
    }

    // --- Cube root: «ریشه سوم ۲۷», "cube root of 27" ---------------------
    const cubeMatch = text.match(
      new RegExp(
        `(?:ریشه سوم|ریشه‌ی سوم|کعب|cube root)\\s*(?:از|of)?\\s*(${NUM})`,
        'iu'
      )
    );
    if (cubeMatch) {
      const n = toNumber(cubeMatch[1]);
      const root = Math.cbrt(n);
      return isFa
        ? `ریشه سوم ${fmt(n)} مساوی است با ${fmt(root)}.`
        : `The cube root of ${fmt(n)} is ${fmt(root)}.`;
    }

    // --- Absolute value: «قدر مطلق منفی ۷», "absolute value of -7" -------
    const absMatch = text.match(
      new RegExp(
        `(?:قدر مطلق|absolute value)\\s*(?:از|of)?\\s*(?:منفی\\s*)?(${NUM})`,
        'iu'
      )
    );
    if (absMatch) {
      const raw = absMatch[0];
      let n = toNumber(absMatch[1]);
      if (/منفی/u.test(raw) && n > 0) {
        n = -n;
      }
      return isFa
        ? `قدر مطلق ${fmt(n)} مساوی است با ${fmt(Math.abs(n))}.`
        : `The absolute value of ${fmt(n)} is ${fmt(Math.abs(n))}.`;
    }

    // --- Rounding: «گرد کن ۳٫۷», "round 3.7" -----------------------------
    const roundMatch = text.match(
      new RegExp(
        `(?:گرد کن|رند کن|round)\\s*(?:عدد\\s*)?(${NUM})|(${NUM})\\s*(?:رو|را)\\s*(?:گرد|رند) کن`,
        'iu'
      )
    );
    if (roundMatch) {
      const n = toNumber(roundMatch[1] || roundMatch[2]);
      if (!Number.isInteger(n)) {
        return isFa
          ? `${fmt(n)} گرد می‌شود به ${fmt(Math.round(n))}.`
          : `${fmt(n)} rounds to ${fmt(Math.round(n))}.`;
      }
      return isFa
        ? `${fmt(n)} خودش عدد صحیح است؛ گردکردنی در کار نیست.`
        : `${fmt(n)} is already a whole number; nothing to round.`;
    }

    return null;
  }

  global.DaryaFactualMathExtras = { handleExtendedMath };
})(typeof window !== 'undefined' ? window : globalThis);
