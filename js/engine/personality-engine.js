/**
 * Darya - personality engine.
 *
 * Keeps Darya's voice consistent across turns while allowing context-aware
 * tone modulation. The core persona is stable (warm, attentive, honest,
 * non-judgmental, boundary-respecting); what varies is the energy level:
 * calm and slow for heavy topics, lighter and warmer for joyful ones.
 *
 * Provides:
 *   - tone classification from conversation state (heavy/neutral/light)
 *   - a check that a candidate reply is not tone-incoherent (e.g. a joke
 *     line for a grief disclosure)
 *   - a check that a reply reuses an opener already used recently
 *
 * Registered on global.DaryaPersonalityEngine. Pure helpers; no state
 * beyond the tone-classification inputs, so tests are deterministic.
 *
 * The tone gate in responder-entity.js consults classifyTone and
 * isToneIncoherent for every pool pick, and wasOpenerUsedRecently keeps
 * reply openers from repeating; the engine also guards against humor on
 * heavy turns through HUMOR_BLOCK_PATTERN on the input side (see
 * responder-detect.js), so the two layers complement each other.
 */
(function (global) {
  'use strict';

  // Turn seriousness at or above which Darya reads as 'heavy' regardless
  // of the emotion (matches SERIOUS_TURN_THRESHOLD semantics but tuned
  // for tone energy, so a moderate topic stays neutral unless the
  // emotion is intense).
  const HEAVY_TONE_SERIOUSNESS = 0.6;
  // Turn seriousness at or below which a genuinely positive emotion may
  // read as 'light'.
  const LIGHT_TONE_SERIOUSNESS = 0.3;

  /**
   * Classifies the energy level Darya should use for a turn based on
   * seriousness and the detected emotion.
   * @param {number} seriousness - 0..1 turn seriousness score.
   * @param {object} [emotionAnalysis] - { emotion, intense } from the
   *   emotion analyzer.
   * @returns {string} 'heavy' | 'neutral' | 'light'
   */
  function classifyTone(seriousness, emotionAnalysis) {
    const intense = emotionAnalysis && emotionAnalysis.intense;
    const emotion = emotionAnalysis && emotionAnalysis.emotion;
    if (intense || seriousness >= HEAVY_TONE_SERIOUSNESS) {
      return 'heavy';
    }
    if (
      seriousness <= LIGHT_TONE_SERIOUSNESS &&
      (emotion === 'happy' || emotion === 'excited' || emotion === 'grateful')
    ) {
      return 'light';
    }
    return 'neutral';
  }

  /**
   * True when a reply string carries light/humorous markers that would be
   * tone-incoherent for a heavy turn (grief, fear, hopelessness, crisis).
   * Uses the same humor-block idea as the engine's HUMOR_BLOCK_PATTERN but
   * applied to Darya's own reply so a joke pool line can never land on a
   * heavy disclosure.
   * @param {string} reply - Candidate reply text.
   * @returns {boolean}
   */
  function isToneIncoherent(reply) {
    const text = String(reply || '');
    // Riddle-style jokes ask a "why" question and answer with a
    // "because" punchline in both languages ("Why do programmers prefer
    // dark mode? Because light attracts bugs." / «چرا کتاب ریاضی غمگین
    // بود؟ چون مشکل زیادی داشت.»). That structure never belongs on a
    // heavy turn, so flag the whole reply when it appears. Requiring the
    // punchline keeps genuine clarifying questions like «چرا این موضوع
    // برایت مهم است؟» (no answer clause) from being blocked; the (?!غ)
    // lookahead stops چراغ (lamp) from matching چرا. The "what do you
    // call X?" form ("What do you call a bear with no teeth? A gummy
    // bear.") answers with a pun instead of a because-clause, so it is
    // matched by the second alternative on the bare question shape: that
    // phrasing only appears in riddles, never in Darya's caring pools.
    // The max-len rule ignores regex literals, so this long pattern
    // stays on one line without a disable directive.
    const riddleWithPunchline =
      /(?:why (?:did|do|does|is|are|was|were)|چرا(?!غ))[^؟?.\n]{0,40}[؟?][^.\n]{0,8}(?:because|چون|برای اینکه|زیرا)/iu;
    const punRiddle = /what (?:do|would) you call[^؟?.\n]{0,40}[؟?]/iu;
    if (riddleWithPunchline.test(text) || punRiddle.test(text)) {
      return true;
    }
    return false;
  }

  /**
   * Checks whether a reply would feel repetitive given the last few bot
   * messages, by exact-prefix overlap: if the reply's first sentence was
   * already used as an opener recently, prefer a different pool line.
   * @param {string} reply - Candidate reply.
   * @param {string[]} recentBotMessages - Recent bot replies.
   * @returns {boolean}
   */
  function wasOpenerUsedRecently(reply, recentBotMessages) {
    const opener = String(reply || '')
      .split(/[.?!؟]/u)[0]
      .trim();
    if (opener.length < 8) {
      return false;
    }
    return recentBotMessages.some((previous) =>
      String(previous || '').startsWith(opener)
    );
  }

  global.DaryaPersonalityEngine = {
    classifyTone,
    isToneIncoherent,
    wasOpenerUsedRecently
  };
})(typeof window !== 'undefined' ? window : globalThis);
