/**
 * Darya - response quality scorer.
 *
 * Scores a candidate reply before it is finalized so weak lines can be
 * retried from a pool. The engine already filters pool picks by recency;
 * this adds a small set of objective quality signals that make a reply
 * feel generic or robotic regardless of recency:
 *   - excessive length (a wall of text for a short user message)
 *   - question-heavy replies that interrogate instead of acknowledge
 *   - missing acknowledgment on an emotionally heavy turn
 *   - opener repetition against the last few bot messages
 *
 * Pure functions; registered on global.DaryaResponseScorer.
 */
(function (global) {
  'use strict';

  /** Replies longer than this (chars) are penalized unless the user
   *  message was long too (knowledge answers are exempt in the engine). */
  const MAX_REPLY_LENGTH = 260;
  /** More than this many question marks makes a reply feel like an
   *  interrogation rather than active listening. */
  const MAX_QUESTION_MARKS = 2;
  /** Score deductions for each objective quality signal, and the
   *  threshold below which a reply is retried from its pool. */
  const LONG_REPLY_PENALTY = 0.25;
  const QUESTION_OVERLOAD_PENALTY = 0.2;
  const MISSING_ACK_PENALTY = 0.3;
  const OPENER_REPEAT_PENALTY = 0.3;
  const RETRY_THRESHOLD = 0.7;
  /** A user message at least this long (chars) justifies a long reply;
   *  anything shorter expects a shorter answer. */
  const LONG_INPUT_LENGTH = 120;
  /** Turn seriousness at which a reply must acknowledge before asking
   *  anything (matches HEAVY_TONE_SERIOUSNESS in personality-engine). */
  const HEAVY_ACK_SERIOUSNESS = 0.6;

  /**
   * Scores a reply from 0 (poor) to 1 (good). Returns a score plus the
   * list of signals that were triggered, so callers can log or adapt.
   * @param {string} reply - Candidate reply text.
   * @param {object} opts - { userLength, seriousness, recentBotMessages }
   * @returns {{ score: number, signals: string[] }}
   */
  function scoreReply(reply, opts = {}) {
    const text = String(reply || '');
    const signals = [];
    let score = 1;

    const userLength = opts.userLength || 0;
    const seriousness = opts.seriousness || 0;
    const recentBotMessages = Array.isArray(opts.recentBotMessages)
      ? opts.recentBotMessages
      : [];

    if (text.length > MAX_REPLY_LENGTH && userLength < LONG_INPUT_LENGTH) {
      score -= LONG_REPLY_PENALTY;
      signals.push('too_long_for_short_input');
    }

    const questionMarks = (text.match(/[?؟]/gu) || []).length;
    if (questionMarks > MAX_QUESTION_MARKS) {
      score -= QUESTION_OVERLOAD_PENALTY;
      signals.push('question_overload');
    }

    // A heavy turn deserves an acknowledgment before any question. If the
    // reply starts with a question, it reads as interrogating someone who
    // is hurting.
    if (
      seriousness >= HEAVY_ACK_SERIOUSNESS &&
      /^[?؟]|^\s*(?:do|are|is|can|would|what|why|how|چرا|آیا|کجا|چطور|چی)/iu.test(
        text
      )
    ) {
      score -= MISSING_ACK_PENALTY;
      signals.push('heavy_turn_missing_ack');
    }

    // Opener repetition: if the first sentence was already used recently,
    // the reply feels scripted.
    const opener = text.split(/[.?!؟]/u)[0].trim();
    if (
      opener.length >= 8 &&
      recentBotMessages.some((previous) =>
        String(previous || '').startsWith(opener)
      )
    ) {
      score -= OPENER_REPEAT_PENALTY;
      signals.push('opener_repeated');
    }

    return { score: Math.max(0, Math.round(score * 100) / 100), signals };
  }

  /**
   * True when a reply should be retried from its pool (score below the
   * threshold and signals worth acting on).
   * @param {object} result - Result of scoreReply.
   * @param {number} [threshold=0.7]
   * @returns {boolean}
   */
  function shouldRetry(result, threshold = RETRY_THRESHOLD) {
    return result.score < threshold && result.signals.length > 0;
  }

  global.DaryaResponseScorer = {
    MAX_REPLY_LENGTH,
    MAX_QUESTION_MARKS,
    scoreReply,
    shouldRetry
  };
})(typeof window !== 'undefined' ? window : globalThis);
