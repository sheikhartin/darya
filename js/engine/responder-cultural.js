/**
 * Darya - cultural language interpretation.
 *
 * Resolves explicit questions about curated slang as virtual word-meaning
 * rules. Natural slang statements are handled by ordinary rules registered
 * in the active language pack, so topic memory, seriousness, safety, and
 * response variation keep using the standard conversation pipeline.
 */
(function (global) {
  'use strict';

  const CULTURAL_MEANING_PRIORITY = 85;

  /**
   * Replaces every glossary placeholder without treating replacement text
   * as a regular-expression replacement string.
   * @param {string} template - Localized response template
   * @param {object} entry - Glossary entry
   * @returns {string}
   */
  function fillMeaningTemplate(template, entry) {
    return template
      .replaceAll('{term}', entry.term)
      .replaceAll('{meaning}', entry.meaning)
      .replaceAll('{region}', entry.region)
      .replaceAll('{note}', entry.note);
  }

  Object.assign(global.DaryaResponseEngine.prototype, {
    /**
     * Returns a virtual word-meaning match for a known slang-definition
     * question. Unknown terms return null and continue through the ordinary
     * rules. Safety rules keep higher priorities and therefore always win.
     * @param {string} matchingText - Normalized current input
     * @returns {object|null} Standard { rule, captured } match shape
     */
    _matchCulturalLanguageRule(matchingText) {
      const culture = this.lang && this.lang.culture;
      if (
        !culture ||
        !culture.meaningRequestPattern ||
        !culture.meaningRequestPattern.test(matchingText)
      ) {
        return null;
      }

      const entry = (culture.entries || []).find((candidate) =>
        candidate.pattern.test(matchingText)
      );
      if (!entry || !culture.meaningResponses?.length) {
        return null;
      }

      const responses = culture.meaningResponses.map((template) =>
        fillMeaningTemplate(template, entry)
      );
      return {
        rule: {
          topic: 'word_meaning',
          priority: CULTURAL_MEANING_PRIORITY,
          responses,
          useOwnResponses: true,
          locksOverrides: true
        },
        captured: entry.term
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
