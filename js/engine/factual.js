/**
 * Darya - Factual question handling (arithmetic, date/time).
 *
 * Extracted from responder.js so the core engine stays focused on
 * conversation routing. Each function takes the engine instance as its
 * first argument, giving it access to the language pack, response-pool
 * selection (`_pickVaried`), and the time fetcher. Passing the engine
 * keeps `this` context semantics without relying on `.call()` or
 * `.bind()` at every call site.
 */

(function (global) {
  'use strict';

  // ======================================================================
  // Arithmetic (math) question handling
  //
  // Detects and answers simple arithmetic expressions in both Latin and
  // Persian numeral systems: addition (+ / بعلاوه), subtraction (- / منهای),
  // multiplication (* / x / ضربدر), and division (/ / تقسیم بر).
  //
  // Three input forms are handled:
  //   1. Full English question: "What is 5 + 3?"
  //   2. Full Persian question: "۲+۳ چند می‌شه؟"
  //   3. Bare expression: "5+3" or "۲+۵" (no question framing)
  //
  // Division by zero returns an explicit "undefined" message. Non-math
  // text passes through without triggering. After answering, a follow-up
  // question gently steers back to the user's emotional context.
  // ======================================================================

  function handleFactualQuestion(engine, text) {
    const enMatch = text.match(
      /(?:what\s+is|what'?s)\s*(\d+)\s*([+\-*xX\/])\s*(\d+)/i
    );
    const faMatch =
      engine.lang.code === 'fa'
        ? text.match(
            // eslint-disable-next-line max-len
            /([۰-۹0-9]+)\s*([+\-*xX\/\u00D7]|تقسیم\s+بر|ضربدر|بعلاوه|منهای)\s*([۰-۹0-9]+).*(?:چند|چقدر|چیست|چیه|می‌شه|میشه|می‌شود|مساوی)/u
          )
        : null;

    const bareMath = text.match(
      /([\d۰-۹]+)\s*([+\-*xX\/\u00D7]|بعلاوه|منهای|ضربدر|تقسیم\s+بر)\s*([\d۰-۹]+)(?:\s*[=:]?\s*)?$/u
    );
    let isBareExpression = false;
    if (bareMath) {
      const matchText = text.slice(0, bareMath.index + bareMath[0].length);
      const hasPersianWordOp = /(?:بعلاوه|منهای|ضربدر|تقسیم\s+بر)/u.test(
        String(bareMath[2] || '')
      );
      const hasNoSurroundingLetters = !/[\p{L}]/u.test(matchText);
      isBareExpression = hasNoSurroundingLetters || hasPersianWordOp;
    }
    const mathMatch =
      enMatch || faMatch || (isBareExpression ? bareMath : null);
    const isBareMatch = !!isBareExpression && !enMatch && !faMatch;
    if (mathMatch) {
      const a = parseInt(
        String(mathMatch[1]).replace(/[۰-۹]/g, (d) =>
          String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        ),
        10
      );
      const b = parseInt(
        String(mathMatch[3]).replace(/[۰-۹]/g, (d) =>
          String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        ),
        10
      );
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
        opRaw.toLowerCase() === '/'
      ) {
        op = '/';
      } else if (opRaw === 'بعلاوه' || opRaw === '+') {
        op = '+';
      } else if (opRaw === 'منهای' || opRaw === '-') {
        op = '-';
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
        case '/':
          result = b !== 0 ? a / b : null;
          break;
        default:
          result = null;
      }
      if (result !== null && Number.isFinite(result)) {
        const isPersian = engine.lang.code === 'fa';
        const answerOp = isPersian
          ? opRaw.replace(
              /[+\-*\/xX]/g,
              (m) =>
                ({
                  '+': ' به‌علاوه',
                  '-': ' منهای',
                  '*': ' ضربدر',
                  '/': ' تقسیم بر',
                  x: ' ضربدر',
                  X: ' ضربدر'
                })[m] || m
            )
          : opRaw;
        const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
        const toPersian = (n) =>
          String(n).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
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
    return null;
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

  function handleDateTimeQuestion(engine, text) {
    const timeMatch =
      engine.lang.dateTimeTimePattern &&
      engine.lang.dateTimeTimePattern.test(text);
    const dateMatch =
      engine.lang.dateTimeDatePattern &&
      engine.lang.dateTimeDatePattern.test(text);
    if (!timeMatch && !dateMatch) {
      return null;
    }

    try {
      const isPersian = engine.lang.code === 'fa';
      const timeInfo = engine._timeFetcher.getTime();
      const now = timeInfo.date;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      let answer;

      if (timeMatch) {
        // Format time in the user's timezone using Intl, which
        // automatically adjusts from the authoritative (API or local)
        // timestamp to the local timezone offset.
        const locale = isPersian ? 'fa-IR' : 'en-US';
        const timeFormat = new Intl.DateTimeFormat(locale, {
          timeStyle: 'short',
          hour12: !isPersian,
          timeZone: tz
        });
        answer = timeFormat.format(now);

        // If we have both API and local time and they differ, append a
        // note about the discrepancy.
        if (timeInfo.discrepancy) {
          const localFormatted = new Intl.DateTimeFormat(locale, {
            timeStyle: 'short',
            hour12: !isPersian,
            timeZone: tz
          }).format(timeInfo.localTime);
          if (isPersian) {
            answer +=
              ' \u0633\u0627\u0639\u062A \u062F\u0633\u062A\u06AF\u0627\u0647 \u0634\u0645\u0627 ' +
              localFormatted +
              ' \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F';
          } else {
            answer += ' (your device shows ' + localFormatted + ')';
          }
        }
      } else if (dateMatch) {
        if (isPersian) {
          // Show both Jalali and Gregorian dates for Persian users. The
          // pieces are assembled manually with formatToParts so the order
          // follows the Iranian convention (day month year), the weekday
          // appears exactly once (in the Jalali part), and no English
          // comma or repeating weekday creeps in from Intl's default
          // full-date rendering.
          const jalaliFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: tz
          });
          const gregorianFormat = new Intl.DateTimeFormat(
            'fa-IR-u-ca-gregory',
            {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: tz
            }
          );
          const jalaliParts = jalaliFormat.formatToParts(now);
          const gregorianParts = gregorianFormat.formatToParts(now);
          const partValue = (parts, type) =>
            (parts.find((part) => part.type === type) || {}).value || '';
          const jalali = [
            partValue(jalaliParts, 'weekday'),
            partValue(jalaliParts, 'day'),
            partValue(jalaliParts, 'month'),
            partValue(jalaliParts, 'year')
          ]
            .filter(Boolean)
            .join(' ');
          const gregorian = [
            partValue(gregorianParts, 'day'),
            partValue(gregorianParts, 'month'),
            partValue(gregorianParts, 'year')
          ]
            .filter(Boolean)
            .join(' ');
          answer = jalali + ' \u06CC\u0639\u0646\u06CC ' + gregorian;

          // If discrepancy, append a note about device vs real time.
          if (timeInfo.discrepancy) {
            const localFormatted = new Intl.DateTimeFormat(
              'fa-IR-u-ca-persian',
              {
                dateStyle: 'full',
                timeZone: tz
              }
            ).format(timeInfo.localTime);
            answer +=
              ' \u062F\u0633\u062A\u06AF\u0627\u0647 \u0634\u0645\u0627 ' +
              localFormatted +
              ' \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F';
          }
        } else {
          const dateFormat = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'full',
            timeZone: tz
          });
          answer = dateFormat.format(now);

          if (timeInfo.discrepancy) {
            const localFormatted = new Intl.DateTimeFormat('en-US', {
              dateStyle: 'full',
              timeZone: tz
            }).format(timeInfo.localTime);
            answer += ' (your device shows ' + localFormatted + ')';
          }
        }
      }

      // Add a gentle follow-up to redirect back to the user. Like the math
      // follow-up, this must bypass the question-budget filter so the date
      // or time answer never degrades into a generic therapeutic fallback.
      const followup =
        engine.lang.dateTimeFollowups && engine.lang.dateTimeFollowups.length
          ? ' ' +
            engine._pickVaried(engine.lang.dateTimeFollowups, {
              ignoreQuestionBudget: true
            })
          : '';
      // Normalize the very end: the answer is terminated as its own
      // sentence before the follow-up, and the whole reply ends with
      // exactly one sentence mark (a question mark for a question, a
      // period otherwise). This avoids double punctuation such as "?."
      // or ".." and missing separators between answer and follow-up.
      let fullReply = (answer || '').trim();
      if (followup) {
        const trimmedFollowup = followup.trim();
        if (!/[.!?؟]$/u.test(fullReply)) {
          fullReply += '.';
        }
        fullReply += ' ' + trimmedFollowup;
      }
      const endsWithQuestion = /[?؟]$/u.test(fullReply);
      fullReply = fullReply.replace(/[.!?؟]+$/u, '');
      return fullReply + (endsWithQuestion ? (isPersian ? '؟' : '?') : '.');
    } catch (_) {
      // If Intl fails (unlikely in modern browsers, but possible in
      // older environments), silently fall through to normal routing.
      return null;
    }
  }

  global.DaryaFactual = { handleFactualQuestion, handleDateTimeQuestion };
})(typeof window !== 'undefined' ? window : globalThis);
