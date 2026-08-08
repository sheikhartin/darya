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

  // Internal rule topic IDs are English slugs; a recap must not leak
  // "compliment_darya" or "topic_change" to the user. Each known topic
  // maps to a natural label in the active language, with a fallback that
  // keeps the slug if an unknown topic appears (defensive).
  const TOPIC_LABELS = {
    fa: {
      anxiety: 'اضطراب',
      stress: 'استرس',
      sadness: 'غم',
      anger: 'خشم',
      loneliness: 'تنهایی',
      grief: 'سوگ',
      family: 'خانواده',
      relationship: 'رابطه',
      work: 'کار',
      money: 'پول و درآمد',
      sleep: 'خواب',
      school: 'درس',
      mindfulness: 'ذهن‌آگاهی',
      self_esteem: 'اعتماد به نفس',
      motivation: 'انگیزه',
      career: 'شغل',
      knowledge: 'دانش و یادگیری',
      compliment_darya: 'تعریف از من',
      topic_change: 'تغییر موضوع',
      recap: 'مرور گفتگو',
      about_eliza: 'ساخته‌شدن من',
      gratitude: 'سپاس',
      feeling: 'احساسات',
      purpose: 'هدف در زندگی',
      smalltalk_howareyou: 'احوال‌پرسی',
      greeting: 'سلام و احوال',
      word_meaning: 'معنی واژه',
      self_improvement: 'بهتر شدن',
      app_feedback: 'بازخورد برنامه',
      apology: 'پوزش'
    },
    en: {
      anxiety: 'anxiety',
      stress: 'stress',
      sadness: 'sadness',
      anger: 'anger',
      loneliness: 'loneliness',
      grief: 'grief',
      family: 'family',
      relationship: 'relationships',
      work: 'work',
      money: 'money',
      sleep: 'sleep',
      school: 'school',
      mindfulness: 'mindfulness',
      self_esteem: 'self-esteem',
      motivation: 'motivation',
      career: 'career',
      knowledge: 'knowledge',
      compliment_darya: 'compliments',
      topic_change: 'changing topics',
      recap: 'recapping',
      about_eliza: 'how I was made',
      gratitude: 'gratitude',
      feeling: 'feelings',
      purpose: 'purpose',
      smalltalk_howareyou: 'how you are doing',
      greeting: 'greetings',
      word_meaning: 'word meanings',
      self_improvement: 'improvement',
      app_feedback: 'app feedback',
      apology: 'apologies'
    }
  };
  function buildRecap(engine) {
    const labels = TOPIC_LABELS[engine.lang.code] || TOPIC_LABELS.en;
    const genericLabel =
      engine.lang.code === 'fa' ? 'چند موضوع مختلف' : 'a few threads';
    const topics = [...new Set((engine.memory.recentTopics || []).slice(-7))]
      .slice(-4)
      .map((topic) => labels[topic] || genericLabel);
    const entities = (
      engine.memory.eligibleNamedEntities
        ? engine.memory.eligibleNamedEntities(0)
        : []
    )
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
    const template = engine._pickVaried(pool, {
      ignoreQuestionBudget: true,
      trackQuestions: false
    });
    if (!template) {
      // Defensive: if the language pack ships no recap templates, still
      // produce a useful recap instead of an empty reply.
      return (
        (engine.lang.code === 'fa'
          ? 'یادم است که درباره '
          : 'I remember you spoke about ') + topicText
      );
    }
    return template
      .replace(/\{topics\}/gu, topicText)
      .replace(/\{entities\}/gu, entityText);
  }

  global.DaryaRecap = { buildRecap };
})(typeof window !== 'undefined' ? window : globalThis);
