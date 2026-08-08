/**
 * Darya - en lookup maps.
 * stopWords, questionTopics, topicSeriousness, selfAwareness. Registered
 * onto DaryaEnData so the pack assembler sees one object.
 */
(function (global) {
  'use strict';

  const BOT_NAME = 'Darya';

  const stopWords = new Set([
    // Articles and determiners
    'the',
    'a',
    'an',
    'this',
    'that',
    'these',
    'those',
    'some',
    'any',
    'no',
    // Primary auxiliary verbs
    'is',
    'are',
    'am',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'having',
    'do',
    'does',
    'did',
    'doing',
    // Modal auxiliaries
    'will',
    'would',
    'can',
    'could',
    'shall',
    'should',
    'may',
    'might',
    'must',
    'need',
    'dare',
    // Pronouns
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
    'my',
    'your',
    'his',
    'its',
    'our',
    'their',
    'mine',
    'yours',
    'hers',
    'ours',
    'theirs',
    'myself',
    'yourself',
    'himself',
    'herself',
    'itself',
    'ourselves',
    'yourselves',
    'themselves',
    // Prepositions
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'up',
    'down',
    'out',
    'off',
    'over',
    'under',
    'about',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'between',
    'among',
    'around',
    'behind',
    'beside',
    'beyond',
    // Conjunctions
    'and',
    'or',
    'but',
    'so',
    'if',
    'as',
    'than',
    'because',
    'while',
    'since',
    'unless',
    'although',
    'though',
    // Common adverbs (non-content-bearing)
    'not',
    'no',
    'nor',
    'never',
    'just',
    'only',
    'very',
    'too',
    'also',
    'even',
    'still',
    'yet',
    'already',
    'almost',
    'really',
    'quite',
    'rather',
    'here',
    'there',
    'now',
    'then',
    'always',
    'sometimes',
    // Question words (structural, not content-bearing: repeating "what"
    // in successive questions must not trigger the word-repetition detector)
    'what',
    'why',
    'how',
    'when',
    'where',
    'which',
    'who',
    'whom',
    'whose',
    'whoever',
    // Common filler words
    'well',
    'okay',
    'ok',
    'right',
    'sure',
    'fine',
    'yeah',
    'yes',
    'oh',
    'ah',
    'hmm',
    'um',
    'uh'
  ]);

  // Low-engagement / boredom meta-signals: when the conversation has been
  // idle or shallow for several turns (e.g. brief acknowledgements with no
  // emotional depth), Darya gently invites a more substantive direction.

  // Wellbeing check responses: when the user asks how Darya is doing
  // after a serious or emotionally heavy conversation, these responses
  // acknowledge the care behind the question before returning focus
  // to the user.

  /**
   * Fallback reply displayed when the engine encounters an unexpected
   * error during response generation (e.g. a reference error or logic
   * fault). Unlike emptyInputReply: R.emptyInputReply, this message acknowledges that the
   * user said something but Darya could not process it, making it
   * semantically correct for error scenarios rather than implying the
   * user went quiet.
   */

  function foreignLanguageRedirect() {
    // eslint-disable-next-line max-len
    return `I'm ${BOT_NAME}, and I can only have this conversation in English so I can support you well. Could you write your message in English so we can continue?`;
  }

  const questionTopics = new Set([
    'family',
    'work',
    'sleep',
    'anxiety',
    'stress',
    'sadness',
    'anger',
    'joy',
    'loneliness',
    'self_esteem',
    'grief',
    'motivation',
    'mindfulness',
    'resilience',
    'forgiveness',
    'purpose',
    'relationship',
    'health',
    'school',
    'money',
    'feeling',
    'reasoning',
    'need'
  ]);

  const topicSeriousness = {
    safety: 1,
    professional_boundary: 0.9,
    grief: 0.9,
    health: 0.85,
    anxiety: 0.8,
    stress: 0.8,
    sadness: 0.8,
    depression: 0.85,
    minor_attraction: 1,
    anger: 0.75,
    loneliness: 0.75,
    family: 0.7,
    relationship: 0.7,
    sleep: 0.65,
    work: 0.65,
    money: 0.7,
    school: 0.6,
    self_esteem: 0.8,
    motivation: 0.6,
    mindfulness: 0.4,
    resilience: 0.7,
    forgiveness: 0.7,
    purpose: 0.65,
    feeling: 0.65,
    reasoning: 0.55,
    need: 0.55,
    joy: 0.25,
    gratitude: 0.2,
    greeting: 0.15,
    smalltalk_howareyou: 0.2,
    smalltalk_identity: 0.25,
    smalltalk_capability: 0.25,
    app_feedback: 0.15,
    recap: 0.35,
    knowledge: 0.25,
    word_meaning: 0.2,
    ask_me_question: 0.2,
    self_improvement: 0.2,
    what_do_i_do: 0.45,
    smalltalk_joke: 0.2,
    shopping: 0.3,
    age_gap: 0.6,
    unsure_topic: 0.25,
    apology: 0.2,
    meta_feedback: 0.15,
    about_eliza: 0.25,
    compliment_darya: 0.15,
    misread_correction: 0.3
  };

  const selfAwareness = {
    approach:
      'I use conversation patterns, short-term context, and careful response selection.',
    boundaries:
      'I do not know current facts unless they are already in my offline knowledge shelf, and I do not make professional decisions for you.',
    memory:
      'I remember selected details only within this browser tab, and I can revise a detail when you correct me.'
  };

  // Assemble the language pack object from top-level variables.

  Object.assign(global.DaryaEnData, {
    stopWords,
    questionTopics,
    topicSeriousness,
    selfAwareness,
    foreignLanguageRedirect
  });
})(typeof window !== 'undefined' ? window : globalThis);
