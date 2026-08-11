/**
 * Darya - conversation context window.
 *
 * Maintains a lightweight summary of the conversation so later turns can
 * reference what was said without scanning the raw transcript. Tracks:
 *   - the active subject and how long it has been current
 *   - the last few topics and their recency
 *   - notable user statements worth circling back to
 *   - the emotional trajectory (delegated to the emotion analyzer)
 *
 * Session-only: everything lives in memory and disappears with a new
 * chat, matching the project's privacy-first design.
 *
 * Registered on global.DaryaContextWindow.
 */
(function (global) {
  'use strict';

  /** How many user statements are kept as "notable" for callbacks. */
  const NOTABLE_STATEMENTS_MAX = 6;
  /** Minimum word count for a statement to be considered notable. */
  const NOTABLE_MIN_WORDS = 4;
  /** How many recent topics are remembered for continuity. */
  const TOPIC_HISTORY_MAX = 8;

  /**
   * A small per-engine context holder. Created by the engine constructor
   * and updated on every turn.
   */
  class ConversationContext {
    constructor() {
      this.notableStatements = [];
      this.topicHistory = [];
      this.activeSubject = null;
      this.activeSubjectSinceTurn = 0;
      this.lastTopic = null;
    }

    /**
     * Records a user utterance as potentially notable if it is long
     * enough to carry real content and is not a pure acknowledgement.
     * @param {string} utterance - Normalized user text.
     * @param {number} turn - Turn count.
     * @param {object} [opts] - { topic, isAcknowledgement }
     */
    rememberUtterance(utterance, turn, opts = {}) {
      const wordCount = String(utterance || '')
        .split(/\s+/u)
        .filter(Boolean).length;
      if (
        wordCount >= NOTABLE_MIN_WORDS &&
        !opts.isAcknowledgement &&
        !opts.isGreeting
      ) {
        this.notableStatements.push({
          text: utterance,
          turn,
          topic: opts.topic || null
        });
        if (this.notableStatements.length > NOTABLE_STATEMENTS_MAX) {
          this.notableStatements.shift();
        }
      }
    }

    /**
     * Remembers the topics of a turn, keeping the most recent at the
     * front of the history for easy "recent thread" lookups.
     * @param {string[]} topics
     * @param {number} turn
     */
    rememberTopics(topics, turn) {
      const unique = [...new Set((topics || []).filter(Boolean))];
      if (!unique.length) {
        return;
      }
      for (const topic of unique) {
        this.topicHistory = this.topicHistory.filter((t) => t.topic !== topic);
        this.topicHistory.unshift({ topic, turn });
      }
      if (this.topicHistory.length > TOPIC_HISTORY_MAX) {
        this.topicHistory.length = TOPIC_HISTORY_MAX;
      }
      this.lastTopic = unique[0];
    }

    /**
     * Sets the active conversation subject (the topic currently being
     * discussed), resetting its "since" turn when it changes.
     * @param {string|null} topic
     * @param {number} turn
     */
    setActiveSubject(topic, turn) {
      if (topic && topic !== this.activeSubject) {
        this.activeSubject = topic;
        this.activeSubjectSinceTurn = turn;
      } else if (!topic) {
        this.activeSubject = null;
      }
    }

    /**
     * Returns the most recent notable statement, optionally filtered to a
     * topic. Excludes the given current-turn text so a release turn like
     * "never mind" never quotes itself.
     * @param {string} [excludeText] - Current turn text to skip.
     * @param {string|null} [topic] - Optional topic filter.
     * @returns {string|null}
     */
    mostRecentNotable(excludeText = '', topic = null) {
      for (let i = this.notableStatements.length - 1; i >= 0; i -= 1) {
        const entry = this.notableStatements[i];
        if (entry.text === excludeText) {
          continue;
        }
        if (topic && entry.topic !== topic) {
          continue;
        }
        return entry.text;
      }
      return null;
    }

    /**
     * The most recent topic discussed before the current one, or null.
     * @param {string} [currentTopic] - Topic to skip when looking back.
     * @returns {string|null}
     */
    previousTopic(currentTopic = '') {
      for (const entry of this.topicHistory) {
        if (entry.topic !== currentTopic) {
          return entry.topic;
        }
      }
      return null;
    }

    /**
     * True when a topic was discussed within `window` turns of `turn`.
     * @param {string} topic
     * @param {number} turn
     * @param {number} [window=4]
     * @returns {boolean}
     */
    wasTopicRecent(topic, turn, window = 4) {
      const entry = this.topicHistory.find((t) => t.topic === topic);
      return Boolean(entry && turn - entry.turn <= window);
    }

    /**
     * Clears all context (new chat).
     */
    reset() {
      this.notableStatements = [];
      this.topicHistory = [];
      this.activeSubject = null;
      this.activeSubjectSinceTurn = 0;
      this.lastTopic = null;
    }
  }

  global.DaryaContextWindow = {
    NOTABLE_STATEMENTS_MAX,
    NOTABLE_MIN_WORDS,
    TOPIC_HISTORY_MAX,
    ConversationContext
  };
})(typeof window !== 'undefined' ? window : globalThis);
