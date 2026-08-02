/**
 * Darya - Conversation recap builder.
 *
 * Extracted from responder.js so the core engine stays focused on
 * conversation routing. The recap summarizes the recent topics and
 * remembered entities so Darya can gently pull together the threads of
 * a long conversation. It takes the engine instance as its only
 * argument, giving it access to memory, the language pack, and
 * response-pool selection (`_pickVaried`).
 */

(function (global) {
  'use strict';

  // ======================================================================
  // Recap construction
  //
  // Builds a recap reply from the last few conversation topics and any
  // recently remembered named entities. Uses language-appropriate
  // separators and fallback wording for both English and Persian.
  // ======================================================================

  function buildRecap(engine) {
    const topics = [...new Set(engine.memory.recentTopics.slice(-7))].slice(-4);
    const entities = engine.memory
      .eligibleNamedEntities(0)
      .slice(0, 3)
      .map((entity) => entity.surface);
    const topicText = topics.length
      ? topics.join(engine.lang.code === 'fa' ? '، ' : ', ')
      : engine.lang.code === 'fa'
        ? 'چند موضوع مختلف'
        : 'a few threads';
    const entityText = entities.length
      ? entities.join(engine.lang.code === 'fa' ? '، ' : ', ')
      : engine.lang.code === 'fa'
        ? 'چند جزئیات شخصی'
        : 'a few personal details';
    const pool = engine.lang.recapTemplates || [];
    return engine
      ._pickVaried(pool, {
        ignoreQuestionBudget: true,
        trackQuestions: false
      })
      .replace(/\{topics\}/gu, topicText)
      .replace(/\{entities\}/gu, entityText);
  }

  global.DaryaRecap = { buildRecap };
})(typeof window !== 'undefined' ? window : globalThis);
