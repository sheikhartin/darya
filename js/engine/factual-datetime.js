/**
 * Darya - date/time question handling.
 * Registered on a global consumed by the factual assembler (factual.js).
 */
(function (global) {
  'use strict';

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

  // ======================================================================
  // Fun-fact requests ("tell me 3 facts", "give me a shocking fact",
  // "حقایق درباره حیوانات")
  //
  // Detects fact requests and answers from the curated FUN_FACTS pool:
  //   - a count ("3 facts", "one fact", "چند تا حقیقت") defaults to 3
  //   - a category ("facts about space", "حقایق درباره حیوانات") filters
  //     the pool
  //   - "shocking/surprising/عجیب/شگفت‌انگیز" picks a random fact without
  //     category filtering (any pool qualifies)
  // Returns null when the text is not a fact request, so normal routing
  // continues untouched.
  // ======================================================================

  global.DaryaFactualDateTime = { handleDateTimeQuestion };
})(typeof window !== 'undefined' ? window : globalThis);
