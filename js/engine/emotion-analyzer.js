/**
 * Darya - multi-dimensional emotion analyzer.
 *
 * Extends the basic keyword emotion detection with a richer model:
 * each detected emotion carries valence (pleasantness, -1..1), arousal
 * (activation, 0..1), and dominance (sense of control, 0..1) so the
 * engine can reason about emotional state instead of only naming it.
 * Also tracks the emotional trajectory across turns so responses can
 * acknowledge change ("you sound lighter than a moment ago") without
 * inventing feelings the user never expressed.
 *
 * Registered on global.DaryaEmotionAnalyzer. Pure functions plus a
 * small per-engine trajectory holder; no DOM, no network.
 */
(function (global) {
  'use strict';

  // Valence (V), arousal (A), dominance (D) for each emotion category.
  // Values are drawn from the standard circumplex model of affect
  // (Russell, 1980; Mehrabian, 1996) adapted to the engine's 14
  // categories. Dominance is the sense of being in control: fear and
  // shame score low, anger and gratitude score high.
  const EMOTION_DIMENSIONS = {
    hurt: { valence: -0.6, arousal: 0.4, dominance: 0.2 },
    confused: { valence: -0.3, arousal: 0.5, dominance: 0.3 },
    excited: { valence: 0.8, arousal: 0.9, dominance: 0.7 },
    angry: { valence: -0.7, arousal: 0.8, dominance: 0.6 },
    grieving: { valence: -0.8, arousal: 0.2, dominance: 0.1 },
    fear: { valence: -0.7, arousal: 0.8, dominance: 0.1 },
    anxious: { valence: -0.5, arousal: 0.7, dominance: 0.2 },
    sad: { valence: -0.6, arousal: 0.3, dominance: 0.2 },
    hopeless: { valence: -0.9, arousal: 0.1, dominance: 0.0 },
    overwhelmed: { valence: -0.6, arousal: 0.8, dominance: 0.1 },
    ashamed: { valence: -0.5, arousal: 0.4, dominance: 0.1 },
    jealous: { valence: -0.5, arousal: 0.6, dominance: 0.3 },
    hopeful: { valence: 0.6, arousal: 0.6, dominance: 0.6 },
    grateful: { valence: 0.7, arousal: 0.4, dominance: 0.5 },
    happy: { valence: 0.7, arousal: 0.6, dominance: 0.6 },
    neutral: { valence: 0.0, arousal: 0.4, dominance: 0.5 }
  };

  // Strong-emotion categories: when one of these is detected, Darya
  // should treat the turn as emotionally loaded even if the sentiment
  // lexicon scores it mildly. Used to prevent the emotional calibration
  // from being skipped on an intense turn.
  const INTENSE_EMOTIONS = new Set([
    'hurt',
    'angry',
    'grieving',
    'fear',
    'anxious',
    'hopeless',
    'overwhelmed',
    'ashamed'
  ]);

  /** How many past turns the trajectory remembers. */
  const TRAJECTORY_DEPTH = 5;

  /**
   * Holds the recent emotional trajectory for one engine instance.
   * Session-only: lives on the engine, never persisted.
   */
  class EmotionTrajectory {
    constructor(depth = TRAJECTORY_DEPTH) {
      this.depth = depth;
      this.samples = [];
    }

    /**
     * Records an emotion sample for a turn.
     * @param {string} emotion - Category name ('sad', 'angry', ...).
     * @param {number} turn - Turn count.
     */
    push(emotion, turn) {
      this.samples.push({ emotion, turn });
      if (this.samples.length > this.depth) {
        this.samples.shift();
      }
    }

    /**
     * The most recent recorded emotion, or null when nothing is recorded.
     * @returns {string|null}
     */
    last() {
      return this.samples.length
        ? this.samples[this.samples.length - 1].emotion
        : null;
    }

    /**
     * The emotion recorded two or more turns ago (the "previous" state),
     * or null when there is no history.
     * @returns {string|null}
     */
    previous() {
      return this.samples.length >= 2
        ? this.samples[this.samples.length - 2].emotion
        : null;
    }

    /**
     * True when the last sample was recorded within `window` turns of the
     * given turn (a recent emotional baseline exists).
     * @param {number} turn - Current turn count.
     * @param {number} [window=3] - Max turn gap to count as recent.
     * @returns {boolean}
     */
    isRecent(turn, window = 3) {
      if (!this.samples.length) {
        return false;
      }
      return turn - this.samples[this.samples.length - 1].turn <= window;
    }

    /**
     * Clears all recorded samples (new chat).
     */
    reset() {
      this.samples = [];
    }
  }

  /**
   * Merges the primary emotion with the sentiment score to produce a
   * richer analysis of a single turn.
   * @param {string} primaryEmotion - Category from the keyword matcher.
   * @param {number} sentimentScore - Lexicon sentiment score (can be 0).
   * @returns {object} { emotion, valence, arousal, dominance, intense }
   */
  function analyzeTurn(primaryEmotion, sentimentScore) {
    const dims =
      EMOTION_DIMENSIONS[primaryEmotion] || EMOTION_DIMENSIONS.neutral;
    // Blend the lexicon score into valence so a sentiment-scored message
    // that matched no keyword still gets a non-neutral reading.
    let valence = dims.valence;
    if (sentimentScore <= -2 && dims.valence > -0.4) {
      valence = Math.max(-0.6, valence - 0.3);
    } else if (sentimentScore >= 2 && dims.valence < 0.4) {
      valence = Math.min(0.7, valence + 0.3);
    }
    return {
      emotion: primaryEmotion,
      valence: clamp(valence, -1, 1),
      arousal: clamp(dims.arousal, 0, 1),
      dominance: clamp(dims.dominance, 0, 1),
      intense: INTENSE_EMOTIONS.has(primaryEmotion)
    };
  }

  /**
   * Detects a positive shift between two emotion categories: the current
   * turn reads meaningfully lighter than the previous one. Only returns
   * true when both are known and the valence gain is real, so Darya never
   * claims someone feels better without evidence.
   * @param {string} previous - Emotion of an earlier turn (or null).
   * @param {string} current - Emotion of the current turn.
   * @returns {boolean}
   */
  function isPositiveShift(previous, current) {
    if (!previous || !current) {
      return false;
    }
    const prev = EMOTION_DIMENSIONS[previous];
    const curr = EMOTION_DIMENSIONS[current];
    if (!prev || !curr) {
      return false;
    }
    return curr.valence - prev.valence >= 0.5;
  }

  /**
   * Detects a negative shift: the current turn reads meaningfully heavier
   * than the previous one. Used to soften responses when the user is
   * sliding down mid-conversation.
   * @param {string} previous - Emotion of an earlier turn (or null).
   * @param {string} current - Emotion of the current turn.
   * @returns {boolean}
   */
  function isNegativeShift(previous, current) {
    if (!previous || !current) {
      return false;
    }
    const prev = EMOTION_DIMENSIONS[previous];
    const curr = EMOTION_DIMENSIONS[current];
    if (!prev || !curr) {
      return false;
    }
    return prev.valence - curr.valence >= 0.5;
  }

  /**
   * Clamps a number into [min, max].
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  global.DaryaEmotionAnalyzer = {
    EMOTION_DIMENSIONS,
    INTENSE_EMOTIONS,
    TRAJECTORY_DEPTH,
    EmotionTrajectory,
    analyzeTurn,
    isPositiveShift,
    isNegativeShift,
    clamp
  };
})(typeof window !== 'undefined' ? window : globalThis);
