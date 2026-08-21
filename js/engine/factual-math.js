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

  // ======================================================================
  // Full expression evaluator (shunting-yard)
  //
  // The legacy two-operand matcher silently answered a FRAGMENT of a
  // longer expression: "2+2*3" matched the trailing "2*3" and replied
  // "2 * 3 = 6" as if that were the answer, a genuine correctness bug
  // (a homework user gets a confidently wrong result). The evaluator
  // below parses the whole expression with correct precedence and
  // parentheses; the two-operand paths remain for phrasings with
  // surrounding words ("what is 2 + 2?").
  // ======================================================================

  /** Binding power per operator; ^ binds tightest and is right-assoc. */
  const OP_PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
  /** Maximum expression length accepted by the evaluator. */
  const EXPRESSION_MAX_LENGTH = 120;

  /**
   * Tokenizes and evaluates a pure arithmetic expression supporting
   * + - * / ^ ( ) with ASCII/Persian digits, Persian decimal separator,
   * unary minus, and the x/×/÷ operator aliases. Returns the numeric
   * result, or null when the text is not a fully-valid expression (so
   * a fragment is never answered as if it were the whole input).
   * @param {string} raw - Candidate expression text.
   * @returns {number|null}
   */
  function evaluateExpression(raw) {
    const text = String(raw || '')
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/٫/g, '.')
      .replace(/[×xX]/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s+/g, '');
    if (
      !text ||
      text.length > EXPRESSION_MAX_LENGTH ||
      /[^0-9.+\-*/^()]/.test(text)
    ) {
      return null;
    }
    // Tokenize: numbers and single-char operators/parens.
    const tokens = text.match(/(?:\d+(?:\.\d+)?|\.\d+|[+\-*/^()])/g);
    if (!tokens || tokens.join('') !== text) {
      return null;
    }
    // Shunting-yard to RPN, treating a leading/post-operator '-' as
    // unary (encoded as 'n', binding tighter than ^).
    const output = [];
    const stack = [];
    let prev = null;
    for (const token of tokens) {
      if (/^(?:\d|\.)/.test(token)) {
        output.push(parseFloat(token));
      } else if (token === '(') {
        stack.push(token);
      } else if (token === ')') {
        while (stack.length && stack[stack.length - 1] !== '(') {
          output.push(stack.pop());
        }
        if (!stack.length) {
          return null;
        }
        stack.pop();
      } else {
        const isUnaryMinus =
          token === '-' &&
          (prev === null || (prev !== ')' && !/^(?:\d|\.)/.test(prev)));
        if (isUnaryMinus) {
          stack.push('n');
        } else {
          const prec = OP_PRECEDENCE[token];
          while (stack.length) {
            const top = stack[stack.length - 1];
            if (top === '(') {
              break;
            }
            const topPrec = top === 'n' ? 4 : OP_PRECEDENCE[top];
            // ^ is right-associative; everything else left-associative.
            if (topPrec > prec || (topPrec === prec && token !== '^')) {
              output.push(stack.pop());
            } else {
              break;
            }
          }
          stack.push(token);
        }
      }
      prev = token;
    }
    while (stack.length) {
      const op = stack.pop();
      if (op === '(') {
        return null;
      }
      output.push(op);
    }
    // Evaluate the RPN.
    const values = [];
    for (const item of output) {
      if (typeof item === 'number') {
        values.push(item);
      } else if (item === 'n') {
        if (!values.length) {
          return null;
        }
        values.push(-values.pop());
      } else {
        if (values.length < 2) {
          return null;
        }
        const b = values.pop();
        const a = values.pop();
        let value;
        switch (item) {
          case '+':
            value = a + b;
            break;
          case '-':
            value = a - b;
            break;
          case '*':
            value = a * b;
            break;
          case '/':
            value = b === 0 ? NaN : a / b;
            break;
          case '^':
            value = Math.pow(a, b);
            break;
          default:
            return null;
        }
        values.push(value);
      }
    }
    if (values.length !== 1 || !Number.isFinite(values[0])) {
      return null;
    }
    return values[0];
  }

  /**
   * Answers a multi-operator arithmetic expression when the message is
   * (or clearly frames) a complete expression with at least two
   * operators or parentheses, e.g. "2+2*3", "(2+3)*4", or "what is
   * 10-4/2?". Single-operator inputs keep the friendlier legacy paths.
   * Returns the formatted answer string or null.
   * @param {object} engine - Engine instance (for language and followup).
   * @param {string} text - Normalized user text.
   * @returns {string|null}
   */
  function handleCompoundExpression(engine, text) {
    // Pull the longest expression-looking span out of the message. A
    // leading unary minus is part of the expression (-(3+4)*2 = -14).
    const spanMatch = String(text).match(
      /-?\s*[0-9۰-۹(][0-9۰-۹.٫+\-*/^()×÷xX\s]*[0-9۰-۹)]/u
    );
    if (!spanMatch) {
      return null;
    }
    const span = spanMatch[0].trim();
    // Only take over when the span really is a compound expression:
    // two or more binary operators, or parentheses. This leaves plain
    // "2+2" to the legacy path (which words the answer with operator
    // names in Persian).
    const operatorCount = (span.match(/[+\-*/^×÷]/g) || []).length;
    const hasParens = /[()]/.test(span);
    if (operatorCount < 2 && !hasParens) {
      return null;
    }
    // The span must be the arithmetic core of the message: apart from
    // an optional question frame ("what is", «چند می‌شه»), no other
    // words may surround it, so "call me at 10+2pm-ish" never matches.
    const QUESTION_FRAME =
      // eslint-disable-next-line max-len
      /(?:what\s+is|what'?s|calculate|compute|solve|equals?|=|\?|چند\s*(?:می‌شه|میشه|می‌شود|است|میشود)?|چقدر\s*(?:می‌شه|میشه)?|مساوی|برابر|حساب کن|محاسبه کن|؟)/giu;
    const remainder = String(text)
      .replace(span, ' ')
      .replace(QUESTION_FRAME, ' ')
      .trim();
    if (/[\p{L}]/u.test(remainder)) {
      return null;
    }
    if (
      /\/\s*0(?![.٫0-9])/.test(
        span.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      )
    ) {
      return engine.lang.code === 'fa'
        ? 'تقسیم بر صفر تعریف‌نشده است.'
        : 'Dividing by zero is undefined.';
    }
    const value = evaluateExpression(span);
    if (value === null) {
      return null;
    }
    const rounded = Math.round(value * 100) / 100;
    if (engine.lang.code === 'fa') {
      const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
      const toPersian = (n) =>
        String(n)
          .replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
          .replace(/\./g, '٫');
      const spanFa = span.replace(/\s+/g, ' ');
      return `${spanFa} مساوی است با ${toPersian(rounded)}.`;
    }
    return `${span.replace(/\\s+/g, ' ')} = ${rounded}.`;
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
        `(?<![\\p{L}0-9])(${alt})(?!\\p{L})\\s*(${FA_WORD_OP})\\s*(?<![\\p{L}0-9])(${alt})(?!\\p{L})`,
        'u'
      )
    );
  }

  // The "plus" operator may be typed with a half-space (به‌علاوه), a
  // plain space (به علاوه), or nothing (بهعلاوه / بعلاوه). The regex
  // accepts an optional single half-space or space so every spelling
  // lands on the same math branch instead of the "don't know" fallback.
  const PERSIAN_HALFSPACE = '\u200c';
  const FA_PLUS_WORD = `به[ ${PERSIAN_HALFSPACE}]?علاوه|بعلاوه`;
  // «منها» is the common casual spelling of «منهای» (minus) in Persian
  // texting; both are accepted between two operands.
  const FA_WORD_OP = `${FA_PLUS_WORD}|منهای|منها|ضربدر|تقسیم\\s+بر|به توان`;
  // Anchored membership test for the "plus" spellings, compiled once:
  // بهعلاوه (no gap), به علاوه (space), به‌علاوه (half-space), بعلاوه.
  const FA_PLUS_OP_RE = new RegExp(`^(?:${FA_PLUS_WORD})$`, 'u');

  /**
   * True when the raw operator string is one of the "plus" spellings
   * (بهعلاوه / به علاوه / به‌علاوه / بعلاوه). FA_PLUS_WORD is a regex
   * pattern, so membership is tested by matching it anchored, not by
   * string equality against its alternation pieces.
   * @param {string} opRaw
   * @returns {boolean}
   */
  function isPlusWordOp(opRaw) {
    return FA_PLUS_OP_RE.test(opRaw);
  }

  // ======================================================================
  // Everyday word problems
  //
  // "If I have 5 apples and give away 2, how many are left?" and «اگه ۵
  // تا سیب داشته باشم و ۲ تا بدم، چند تا می‌مونه؟» are the math people
  // actually type in conversation. The expression evaluator cannot parse
  // them, and the old fallback answered with a source pointer, which is
  // absurd for 5-2. A small set of common templates covers subtraction
  // (giving away, losing, eating), addition (buying, receiving, adding),
  // division (sharing), and rate problems (a train at X km/h for Y
  // hours). Numbers may be ASCII or Persian digits, or common English
  // number words (one..twelve, tens). Only exact templates match; a
  // word problem outside the templates stays unanswered so the honest
  // fallback still applies.
  // ======================================================================

  /** English number words understood in word problems. */
  const EN_NUMBER_WORDS = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
    hundred: 100
  };

  /**
   * Parses a number from ASCII/Persian digits or a single English number
   * word (used only when the input is otherwise English).
   * @param {string} raw
   * @returns {number|null}
   */
  function parseWordProblemNumber(raw) {
    const ascii = String(raw)
      .trim()
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .toLowerCase();
    if (/^\d+(?:\.\d+)?$/.test(ascii)) {
      const value = parseFloat(ascii);
      return Number.isFinite(value) ? value : null;
    }
    const word = EN_NUMBER_WORDS[ascii];
    return typeof word === 'number' ? word : null;
  }

  /**
   * Attempts to answer an everyday word problem (apples given away,
   * train distance, sharing between people). Returns a reply string or
   * null when no template matches.
   * @param {object} engine - The engine (for the language pack)
   * @param {string} text - Normalized matching text
   * @returns {string|null}
   */
  function handleWordProblem(engine, text) {
    const isFa = engine.lang.code === 'fa';
    const num = '[۰-۹0-9]+|\\d+';
    const word = '[A-Za-z]+';
    const n = isFa ? num : `${num}|${word}`;
    let m;

    if (isFa) {
      // Subtraction: give away / lose / eat / take away.
      m = text.match(
        new RegExp(
          // eslint-disable-next-line max-len
          `اگه (${num}) تا (.{1,12}) داشته باشم و (${num}) تا(?:ش)? (?:بدم|ببخشم|از دست بدم|از دستم بره|بخورم|کم کنم|بردارم|بدهم|بدمش)(?:[.!؟،]|[,،]?\\s*(?:چند|چقدر|چه تعداد).{0,20}|$)`,
          'u'
        )
      );
      if (m) {
        const a = parseWordProblemNumber(m[1]);
        const b = parseWordProblemNumber(m[3]);
        if (a !== null && b !== null) {
          const result = a - b;
          return `${a} منهای ${b} می‌شود ${result}؛ یعنی ${result} تا ${m[2]} برایت می‌ماند.`;
        }
      }
      // Subtraction (past tense): had X, lost/gave Y.
      m = text.match(
        new RegExp(
          // eslint-disable-next-line max-len
          `(${num}) تا (.{1,12}) (?:داشتم|داشتمش|داشتیم) و (${num}) تا(?:ش)?(?:و|شو|شون)? (?:دادم|باختم|از دست دادم|خوردم|از دستم رفت)(?:[.!؟،]|[,،]?\\s*(?:چند|چقدر|چه تعداد).{0,20}|$)`,
          'u'
        )
      );
      if (m) {
        const a = parseWordProblemNumber(m[1]);
        const b = parseWordProblemNumber(m[3]);
        if (a !== null && b !== null) {
          const result = a - b;
          return `${a} منهای ${b} می‌شود ${result}؛ پس ${result} تا برایت می‌ماند.`;
        }
      }
      // Addition: buy / receive / add / get more.
      m = text.match(
        new RegExp(
          // eslint-disable-next-line max-len
          `اگه (${num}) تا (.{1,12}) داشته باشم و (${num}) تا (?:بخرم|بگیرم|اضافه کنم|به دست بیارم|به دست بیاورم|دیگه بگیرم)(?:[.!؟،]|[,،]?\\s*(?:چند|چقدر|چه تعداد).{0,20}|$)`,
          'u'
        )
      );
      if (m) {
        const a = parseWordProblemNumber(m[1]);
        const b = parseWordProblemNumber(m[3]);
        if (a !== null && b !== null) {
          const result = a + b;
          return `${a} به‌علاوه‌ی ${b} می‌شود ${result}؛ یعنی ${result} تا ${m[2]} خواهی داشت.`;
        }
      }
      // Division: share X between Y people.
      m = text.match(
        new RegExp(
          // eslint-disable-next-line max-len
          `(${num}) تا (.{1,12}) (?:رو|را) بین (${num}) (?:نفر|نفر نفر|تا نفر) تقسیم (?:کنم|کنیم|بکنم|بکنیم)(?:[.!؟]|$)`,
          'u'
        )
      );
      if (m) {
        const a = parseWordProblemNumber(m[1]);
        const b = parseWordProblemNumber(m[3]);
        if (a !== null && b !== null && b !== 0) {
          const result = a / b;
          const formatted = Number.isInteger(result)
            ? String(result)
            : result.toFixed(2).replace(/\.?0+$/, '');
          return `${a} تقسیم بر ${b} می‌شود ${formatted}؛ یعنی هر نفر ${formatted} تا ${m[2]}.`;
        }
      }
      return null;
    }

    // English word problems.
    // Subtraction: "if i have 5 apples and give away 2".
    m = text.match(
      new RegExp(
        // eslint-disable-next-line max-len
        `\\bif i (?:have|had) (${n}) (?:apples|oranges|bananas|cookies|candies|books|pens|things|items|stamps|marbles|eggs|chocolates?|dollars|pounds) (?:and|,) (?:i )?(?:give away|give|gives? away|lose|lost|eat|ate|sell|sold|take away) (${n})\\b`,
        'i'
      )
    );
    if (m) {
      const a = parseWordProblemNumber(m[1]);
      const b = parseWordProblemNumber(m[2]);
      if (a !== null && b !== null) {
        const result = a - b;
        return `${a} minus ${b} is ${result}, so you would have ${result} left.`;
      }
    }
    // Addition: "if i have 5 apples and buy 3 more".
    m = text.match(
      new RegExp(
        // eslint-disable-next-line max-len
        `\\bif i (?:have|had) (${n}) (?:apples|oranges|bananas|cookies|candies|books|pens|things|items|stamps|marbles|eggs|chocolates?|dollars|pounds) (?:and|,) (?:i )?(?:buy|bought|get|got|receive|received|add) (${n}) (?:more|extra|additional)?\\b`,
        'i'
      )
    );
    if (m) {
      const a = parseWordProblemNumber(m[1]);
      const b = parseWordProblemNumber(m[2]);
      if (a !== null && b !== null) {
        const result = a + b;
        return `${a} plus ${b} is ${result}, so you would have ${result} in total.`;
      }
    }
    // Rate: "if a train travels 60 km/h for 3 hours, how far?".
    m = text.match(
      new RegExp(
        // eslint-disable-next-line max-len
        `\\b(?:if )?a train travels? (${n}) (?:km|kilometers?|kilometres?|miles?) (?:per|an|a) hour.{0,30}? (?:for|in) (${n}) hours?\\b`,
        'i'
      )
    );
    if (m) {
      const speed = parseWordProblemNumber(m[1]);
      const hours = parseWordProblemNumber(m[2]);
      if (speed !== null && hours !== null) {
        const result = speed * hours;
        return `${speed} times ${hours} is ${result}; the train would cover ${result} units in that time.`;
      }
    }
    // Division: "if 10 cookies are shared between 5 people".
    m = text.match(
      new RegExp(
        // eslint-disable-next-line max-len
        `\\b(?:if )?(${n}) (?:cookies|candies|apples|books|things|items|dollars|pounds) (?:are|is|get|gets) shared between (${n}) (?:people|kids|friends|children)\\b`,
        'i'
      )
    );
    if (m) {
      const a = parseWordProblemNumber(m[1]);
      const b = parseWordProblemNumber(m[2]);
      if (a !== null && b !== null && b !== 0) {
        const result = a / b;
        const formatted = Number.isInteger(result)
          ? String(result)
          : result.toFixed(2).replace(/\.?0+$/, '');
        return `${a} divided by ${b} is ${formatted}, so each person gets ${formatted}.`;
      }
    }
    return null;
  }

  function handleFactualQuestion(engine, text) {
    // Everyday word problems first ("if I have 5 apples and give away
    // 2", «اگه ۵ تا سیب داشته باشم و ۲ تا بدم»): the expression
    // evaluator cannot parse them and the old fallback pointed to
    // Wikipedia for 5-2.
    const wordProblem = handleWordProblem(engine, text);
    if (wordProblem) {
      return wordProblem;
    }
    // Compound expressions first: "2+2*3", "(2+3)*4", "what is 10-4/2".
    // The legacy two-operand paths below would otherwise answer a
    // FRAGMENT of the expression (the "2*3" inside "2+2*3") and present
    // it as the whole answer.
    const compoundAnswer = handleCompoundExpression(engine, text);
    if (compoundAnswer) {
      return compoundAnswer;
    }
    // Operands support integers and decimals. Persian text may use the
    // Persian decimal separator "٫" (U+066B) or the ASCII dot. The
    // negative lookbehind prevents matching a *substring* of a longer
    // number: "5.5+3" must not silently answer "5 + 3 = 8" by matching
    // the trailing "5+3", and a match may not start mid-decimal.
    const FA_OPERAND = '[۰-۹0-9]+(?:[.٫][۰-۹0-9]+)?|[.٫][۰-۹0-9]+';
    const EN_OPERAND = '\\d+(?:\\.\\d+)?|\\.\\d+';
    const FA_OP = `[+\\-*xX/^÷\\u00D7]|${FA_WORD_OP}`;
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
      const hasPersianWordOp = new RegExp(FA_WORD_OP, 'u').test(
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
      } else if (opRaw === '+' || isPlusWordOp(opRaw)) {
        op = '+';
      } else if (opRaw === 'منهای' || opRaw === 'منها' || opRaw === '-') {
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

    // Square roots: "جذر ۱۶", "square root of 9", "sqrt(16)", "what is
    // the square root of 144?". Only answers when the expression is a
    // lone root, so "5 + sqrt(4)" is never double-handled here. The
    // optional "از" is the Persian genitive ("جذر ۱۶") while "of" is the
    // English equivalent ("square root of 144"); both are consumed so a
    // bare number, a Persian "از", or an English "of" all resolve.
    const sqrtMatch = text.match(
      /(?:جذر|ریشه دوم|square root|sqrt)\s*(?:(?:از|of)\s*)?\(?\s*(-?\s*[۰-۹0-9.٫]+)\s*\)?/iu
    );
    if (sqrtMatch && !/[+*xX/^÷]/.test(text.slice(0, sqrtMatch.index))) {
      const n = parseFaNumber(String(sqrtMatch[1]).replace(/\s+/g, ''));
      // A negative radicand has no real square root; say so honestly
      // instead of falling to the unknown pool with NaN.
      if (n < 0) {
        return engine.lang.code === 'fa'
          ? 'عدد منفی جذر حقیقی ندارد؛ جذر اعداد منفی به حوزه‌ی اعداد مختلط می‌رود.'
          : 'A negative number has no real square root; that territory belongs to complex numbers.';
      }
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
      const isWordPlus = isPlusWordOp(wordOpRaw);
      const op = isWordDiv
        ? '/'
        : isWordPow
          ? '^'
          : isWordPlus
            ? '+'
            : wordOpRaw;
      let result;
      switch (op) {
        case '+':
          result = a + b;
          break;
        case 'منهای':
        case 'منها':
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
   * generic therapeutic line instead of the intended follow-up pool). The
   * last follow-up used is remembered on the engine so consecutive answers
   * never repeat the same redirect: the full answer string is what lands
   * in recentBotMessages, so _pickVaried's pool recency filtering alone
   * cannot dedupe the bare follow-up sentence.
   * @param {DaryaResponseEngine} engine
   * @returns {string} Follow-up sentence with a leading space, or ''
   */
  function _pickFactualFollowup(engine) {
    if (
      engine.lang.factualQuestionFollowups &&
      engine.lang.factualQuestionFollowups.length
    ) {
      const pool = engine.lang.factualQuestionFollowups;
      const options =
        pool.length > 1 && engine._lastFactualFollowup
          ? pool.filter((line) => line !== engine._lastFactualFollowup)
          : pool;
      const picked = engine._pickVaried(options, {
        ignoreQuestionBudget: true
      });
      engine._lastFactualFollowup = picked;
      return ' ' + picked;
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
