/**
 * Darya's deliberately small named-entity extractor.
 *
 * This is not a general-purpose NER model. It is a transparent, offline
 * three-layer heuristic that turns emotionally meaningful words into a few
 * safe conversational memories. The three layers are:
 *
 *   1. vocabulary: language packs provide family, profession, and place
 *      terms, while this file supplies language-neutral shapes for time,
 *      activity, and possessive objects;
 *   2. phrase detection: a surface form is kept exactly as the person
 *      typed it (apart from the active language pack's normalization);
 *   3. confidence: only a high-confidence, emotionally weighted turn is
 *      allowed into ConversationMemory. The engine applies decay and a
 *      first-mention guard before any callback is shown.
 *
 * The module is dependency-free and safe to load as an ordinary script.
 */

(function (global) {
  'use strict';

  const ENTITY_TYPES = Object.freeze(['person', 'place', 'time', 'activity', 'object']);
  const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'for',
    'from', 'had', 'has', 'have', 'her', 'here', 'him', 'his', 'how', 'i',
    'if', 'in', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or', 'our', 'so',
    'that', 'the', 'their', 'them', 'there', 'they', 'this', 'to', 'was',
    'we', 'were', 'what', 'when', 'where', 'which', 'who', 'with', 'you',
    'your', 'ام', 'است', 'این', 'آن', 'به', 'با', 'برای', 'در', 'را', 'من',
    'ما', 'تو', 'شما', 'که', 'و', 'یا', 'از', 'یک', 'هم', 'همین', 'آنها',
  ]);

  const EN_TIME = [
    'today', 'tonight', 'tomorrow', 'yesterday', 'this morning', 'this afternoon',
    'this evening', 'last night', 'right now', 'these days', 'lately', 'soon',
    'later', 'every day', 'this week', 'last week', 'next week', 'recently',
  ];
  const FA_TIME = [
    'امروز', 'امشب', 'فردا', 'دیروز', 'صبح امروز', 'امروز صبح', 'امروز عصر',
    'دیشب', 'همین حالا', 'الان', 'این روزها', 'اخیراً', 'به‌زودی', 'بعداً',
    'هر روز', 'این هفته', 'هفته پیش', 'هفته بعد',
  ];

  const EN_ACTIVITY = [
    'work', 'working', 'study', 'studying', 'school', 'exercise', 'exercising',
    'walking', 'running', 'reading', 'writing', 'travel', 'traveling', 'travelling',
    'cooking', 'painting', 'therapy', 'meditation', 'sleep', 'sleeping',
    'job', 'career', 'exam', 'exams', 'meeting', 'meetings', 'project',
  ];
  const FA_ACTIVITY = [
    'کار', 'کار کردن', 'کارم', 'درس', 'درس خواندن', 'امتحان', 'دانشگاه',
    'ورزش', 'پیاده‌روی', 'دویدن', 'مطالعه', 'کتاب خواندن', 'سفر', 'آشپزی',
    'نقاشی', 'مدیتیشن', 'خواب', 'خوابیدن', 'شغل', 'پروژه', 'جلسه',
  ];

  const EN_OBJECT_HINTS = new Set([
    'home', 'house', 'apartment', 'room', 'phone', 'car', 'book', 'letter',
    'photo', 'picture', 'gift', 'bed', 'desk', 'project', 'message', 'email',
    'dog', 'cat', 'computer', 'laptop', 'medicine', 'music', 'song', 'dream',
  ]);
  const FA_OBJECT_HINTS = new Set([
    'خانه', 'اتاق', 'گوشی', 'ماشین', 'کتاب', 'نامه', 'عکس', 'هدیه', 'تخت',
    'میز', 'پروژه', 'پیام', 'رایانه', 'دارو', 'موسیقی', 'آهنگ', 'خواب',
  ]);

  const EMOTION_CONTEXT = {
    en: new Set([
      'sad', 'down', 'depressed', 'heartbroken', 'crying', 'anxious', 'anxiety',
      'stressed', 'scared', 'afraid', 'worried', 'angry', 'furious', 'lonely',
      'alone', 'worthless', 'hopeless', 'hurt', 'tired', 'overwhelmed', 'happy',
      'glad', 'excited', 'grateful', 'love', 'proud', 'relieved', 'better',
    ]),
    fa: new Set([
      'غمگین', 'ناراحت', 'افسرده', 'دلتنگ', 'نگران', 'اضطراب', 'استرس', 'ترس',
      'عصبانی', 'خشمگین', 'تنها', 'بی‌ارزش', 'ناامید', 'خسته', 'داغون', 'درد',
      'خوشحال', 'شاد', 'هیجان', 'ممنون', 'قدردان', 'عاشق', 'امیدوار', 'آرام',
    ]),
  };

  function asArray(value) {
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item) : [];
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  }

  function hasLetters(value) {
    return [...value].some((character) => /\p{L}/u.test(character));
  }

  function normalizeSurface(value, lang) {
    const normalized = lang && typeof lang.normalize === 'function' ? lang.normalize(value) : String(value).trim();
    return normalized.replace(/^[\s,،;؛:!?؟.]+|[\s,،;؛:!?؟.]+$/gu, '').trim();
  }

  function validSurface(value) {
    if (!value || !hasLetters(value)) return false;
    const lower = value.toLocaleLowerCase();
    if (STOP_WORDS.has(lower)) return false;
    return lower.split(/\s+/u).some((part) => !STOP_WORDS.has(part));
  }

  function makeEntity(type, surface, confidence, source) {
    const cleaned = surface.trim();
    if (!ENTITY_TYPES.includes(type) || !validSurface(cleaned)) return null;
    return {
      type,
      surface: cleaned,
      key: `${type}:${cleaned.toLocaleLowerCase()}`,
      confidence: Math.max(0, Math.min(1, confidence)),
      source,
    };
  }

  function addUnique(target, entity) {
    if (!entity) return;
    const current = target.find((item) => item.key === entity.key);
    if (!current) target.push(entity);
    else if (entity.confidence > current.confidence) Object.assign(current, entity);
  }

  function termsFromPack(lang, field) {
    return asArray(lang && lang[field]).sort((a, b) => b.length - a.length);
  }

  function findVocabularyEntities(text, lang, field, type, source, confidence) {
    const entities = [];
    const terms = termsFromPack(lang, field);
    for (const term of terms) {
      const escaped = escapeRegExp(term);
      const pattern = lang.code === 'fa'
        ? new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'giu')
        : new RegExp(`\\b${escaped}\\b`, 'giu');
      const matches = text.matchAll(pattern);
      for (const match of matches) addUnique(entities, makeEntity(type, match[0], confidence, source));
    }
    return entities;
  }

  function findPhraseEntities(text, terms, type, source, lang, confidence) {
    const entities = [];
    for (const term of [...terms].sort((a, b) => b.length - a.length)) {
      const escaped = escapeRegExp(term);
      const pattern = lang.code === 'fa'
        ? new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'giu')
        : new RegExp(`\\b${escaped}\\b`, 'giu');
      for (const match of text.matchAll(pattern)) {
        addUnique(entities, makeEntity(type, match[0], confidence, source));
      }
    }
    return entities;
  }

  function extractTimes(text, lang) {
    const terms = lang.code === 'fa' ? FA_TIME : EN_TIME;
    return findPhraseEntities(text, terms, 'time', 'time-vocabulary', lang, 0.9);
  }

  function extractActivities(text, lang) {
    const terms = lang.code === 'fa' ? FA_ACTIVITY : EN_ACTIVITY;
    return findPhraseEntities(text, terms, 'activity', 'activity-vocabulary', lang, 0.76);
  }

  function extractPossessiveObjects(text, lang) {
    const entities = [];
    if (lang.code === 'en') {
      const pattern = /\bmy\s+([a-z][a-z'-]*(?:\s+[a-z][a-z'-]*){0,2})/giu;
      for (const match of text.matchAll(pattern)) {
        const phrase = match[1].split(/\s+(?=(?:and|but|because|that|which|when|while|is|was|feels?|makes?)\b)/iu)[0];
        const words = phrase.split(/\s+/u).filter(Boolean);
        const candidate = words.slice(0, 3).join(' ');
        const first = words[0]?.toLocaleLowerCase();
        if (first && !STOP_WORDS.has(first) && !EMOTION_CONTEXT.en.has(first)) {
          const confidence = EN_OBJECT_HINTS.has(words.at(-1).toLocaleLowerCase()) ? 0.92 : 0.68;
          addUnique(entities, makeEntity('object', candidate, confidence, 'english-my-possessive'));
        }
      }
    } else {
      // Persian enclitic possession is often attached to the noun; the
      // vocabulary pass handles the most reliable lexical objects.
      const terms = [...FA_OBJECT_HINTS].sort((a, b) => b.length - a.length);
      for (const term of terms) {
        const pattern = new RegExp(`(?<!\\p{L})${escapeRegExp(term)}(?:م|ت|ش|مان|تان|شان)?(?!\\p{L})`, 'giu');
        for (const match of text.matchAll(pattern)) {
          addUnique(entities, makeEntity('object', match[0], 0.8, 'persian-object-vocabulary'));
        }
      }
    }
    return entities;
  }

  function extractProperNames(text, lang) {
    if (lang.code !== 'en') return [];
    const entities = [];
    // A capitalized token in the middle of an English utterance is a safe,
    // conservative person/place candidate. Do not treat the first word of a
    // sentence as a name merely because English capitalizes it.
    const pattern = /(?<!^)(?<![.!?]\s)(?<!\b(?:my|the|a)\s)\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)\b/gu;
    for (const match of text.matchAll(pattern)) {
      addUnique(entities, makeEntity('person', match[1], 0.72, 'capitalized-name'));
    }
    return entities;
  }

  function deduplicate(entities) {
    const byKey = new Map();
    for (const entity of entities) {
      if (!entity) continue;
      const old = byKey.get(entity.key);
      if (!old || entity.confidence > old.confidence) byKey.set(entity.key, entity);
    }
    return [...byKey.values()];
  }

  /**
   * Extract entities from one turn.
   *
   * `options.emotionalWeight` is intentionally explicit. The engine passes
   * true only when its sentiment score is non-neutral; callers can request
   * the lexical result with `gate: false` for diagnostics without changing
   * what gets remembered.
   *
   * @param {string} text normalized or raw text
   * @param {object} lang active Darya language pack
   * @param {{emotionalWeight?: boolean, gate?: boolean}} options
   * @returns {Array<{type:string,surface:string,key:string,confidence:number,source:string}>}
   */
  function extract(text, lang, options = {}) {
    if (!lang || !lang.code) return [];
    const normalized = normalizeSurface(text, lang);
    if (!normalized) return [];
    if (options.gate !== false && options.emotionalWeight === false) return [];

    const entities = [];
    entities.push(...findVocabularyEntities(normalized, lang, 'familyTerms', 'person', 'family-vocabulary', 0.94));
    entities.push(...findVocabularyEntities(normalized, lang, 'professionTerms', 'activity', 'profession-vocabulary', 0.82));
    entities.push(...findVocabularyEntities(normalized, lang, 'placeWords', 'place', 'place-vocabulary', 0.9));
    entities.push(...extractTimes(normalized, lang));
    entities.push(...extractActivities(normalized, lang));
    entities.push(...extractPossessiveObjects(normalized, lang));
    entities.push(...extractProperNames(normalized, lang));

    return deduplicate(entities).filter((entity) => entity.confidence >= 0.6);
  }

  function isEmotionallyWeighted(score, text, lang) {
    if (typeof score === 'number') return score !== 0;
    const vocabulary = EMOTION_CONTEXT[lang.code] || new Set();
    const lower = text.toLocaleLowerCase();
    return [...vocabulary].some((term) => lower.includes(term));
  }

  function entityKey(type, surface) {
    return `${type}:${String(surface).trim().toLocaleLowerCase()}`;
  }

  global.DaryaEntityExtractor = {
    ENTITY_TYPES,
    extract,
    entityKey,
    isEmotionallyWeighted,
    vocabulary: { EN_TIME, FA_TIME, EN_ACTIVITY, FA_ACTIVITY },
  };
})(typeof window !== 'undefined' ? window : globalThis);
