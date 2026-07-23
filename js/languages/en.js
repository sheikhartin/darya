/**
 * Darya — English language pack.
 *
 * Mirrors js/languages/fa.js in structure and capability so English and
 * Persian get identical engine features with no compromises on either
 * side. Content is written naturally for English rather than translated
 * literally from Persian.
 */

(function (global) {
  'use strict';

  const BOT_NAME = 'Darya';

  // Basic Latin plus the Latin-1/Extended-A accented range, which covers
  // the vast majority of everyday English (and common loanwords/names).
  const SCRIPT_RANGE = /[A-Za-z\u00C0-\u017F]/;

  /**
   * Normalizes raw English input: lowercase-insensitive matching is
   * handled by the rule patterns themselves (case-insensitive flag), so
   * normalization here is limited to trimming and whitespace collapsing.
   */
  /**
   * Normalizes raw English input: Unicode NFKC normalization folds
   * compatibility characters (full-width letters, certain ligatures) to
   * their standard form, smart/curly quotes are unified to plain ASCII
   * ones so contraction patterns like "i'm" still match text pasted from
   * word processors, and whitespace is trimmed and collapsed.
   */
  function normalize(text) {
    return String(text)
      .normalize('NFKC')
      .replace(/[\u2018\u2019\u02BC]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function rule(topic, priority, pattern, responses) {
    return { topic, priority, pattern, responses };
  }

  const rules = [
    rule('safety', 100, /\b(suicide|kill myself|self.?harm|hurt myself|end my life|don'?t want to live)\b/i, [
      "What you just shared matters a great deal, and I want you to know you're not alone. Is there someone nearby you could reach out to or be with right now?",
      "That sounds like a very heavy weight to carry, and it deserves real, immediate support. Please reach out to a crisis line or someone you trust right now. I'm here with you, but I'm not a substitute for urgent professional help.",
    ]),

    rule('family', 50, /\b(my (?:mom|mother|dad|father|parents|sister|brother|family))\b\s*(.*)/i, [
      'Tell me more about {captured}.',
      'How does your relationship with your family feel to you these days?',
      'What comes up for you when you think about {captured}?',
      'What made {captured} come to mind just now?',
    ]),

    rule('work', 50, /\b(my job|my work|my boss|my career|my coworker|got fired|got laid off)\b\s*(.*)/i, [
      'Work can weigh on you in ways that spill into everything else. How has {captured} been affecting you?',
      'Tell me more about your work situation. What feels hardest about it right now?',
      'If things at work were better, what would actually be different?',
    ]),

    rule('sleep', 50, /\b(can'?t sleep|insomnia|nightmares|sleeping badly|trouble sleeping)\b\s*(.*)/i, [
      "It sounds like your sleep hasn't been restful lately. When did that start?",
      "Trouble sleeping can be a sign that something's weighing on your mind. What's been occupying your thoughts lately?",
      'When you can\'t sleep, where does your mind usually go?',
    ]),

    rule('sadness', 40, /\b(sad|down|depressed|heartbroken|crying|low)\b/i, [
      "It sounds like you've been carrying a lot of sadness lately. Want to talk more about it?",
      "Sadness is hard to sit with. What brought this feeling on?",
      "Let's stay with this for a moment. How long have you been feeling this way?",
      'Where in your body do you feel this sadness most?',
    ]),

    rule('anxiety', 40, /\b(anxious|anxiety|stressed|stress|scared|afraid|worried|panicking)\b/i, [
      'Anxiety can be so exhausting. What exactly has been worrying you?',
      'When that stress hits, what does it feel like in your body?',
      'On a scale of 1 to 10, how intense is this worry right now?',
    ]),

    rule('anger', 40, /\b(angry|furious|pissed off|mad at|so annoyed)\b/i, [
      "It sounds like there's a lot of anger built up. What triggered it?",
      "That frustration makes sense. Do you want to walk me through exactly what happened?",
      'Where do you feel that anger most in your body?',
    ]),

    rule('joy', 35, /\b(happy|glad|excited|thrilled|great news|feeling good)\b/i, [
      "I'm glad you're feeling this way! What brought it on?",
      "That's good to hear. Want to tell me more about it?",
      'Where do you feel that good feeling in your body?',
    ]),

    rule('loneliness', 40, /\b(lonely|alone|no one to talk to|nobody understands|isolated)\b/i, [
      'Loneliness can feel really heavy. How long has this feeling been with you?',
      'When you say you feel alone, do you mean not having people to talk to, or something deeper?',
      "Who's the person you feel closest to these days, even if you don't see them often?",
    ]),

    rule('self_esteem', 40, /\b(worthless|not good enough|hate myself|no confidence|i'?m a failure)\b/i, [
      "Those are heavy things to feel about yourself. Where do you think that belief comes from?",
      'What usually brings on thoughts like that?',
      'If a friend said this about themselves, what would you tell them?',
    ]),

    rule('grief', 45, /\b(lost my|passed away|passed away|death of|grieving|my .* died)\b/i, [
      'Losing someone is one of the hardest things a person can go through. Do you want to talk about it a little?',
      'Whatever you\'re feeling about this loss is valid. How have you been coping with it lately?',
      "I'd like to hear about them, if you'd like to share.",
    ]),

    rule('smalltalk_howareyou', 60, /\b(how are you|how're you|how r u|how are u|how(?:'s| is) it going|how you doing)\b/i, [
      "I'm doing well, thank you for asking! I'm glad to be here with you. How are you doing today?",
      "I'm good, thanks for asking! I'd love to hear how you're doing.",
    ]),

    rule('smalltalk_identity', 60, /\b(who are you|what are you|are you (?:a )?(?:robot|bot|ai|real|human|person))\b/i, [
      "I'm Darya, a companion here to listen. I'm not a therapist or a real person, just a calm space to think out loud.",
      "I'm a simple chat companion, not a human. But I'm genuinely here to listen.",
    ]),

    rule('smalltalk_capability', 60, /\b(what can you do|how can you help|what do you do|how do you work)\b/i, [
      "I'm here to listen, ask questions, and sit with you when something's on your mind. I'm not a substitute for a professional, but I can be a patient ear.",
      "I can be a good companion for thinking out loud. I listen and ask open questions to help you get clearer on how you're feeling.",
    ]),

    rule('motivation', 35, /\b(no motivation|can'?t get started|procrastinating|unmotivated|no energy to)\b/i, [
      "When motivation is gone, even small things can feel heavy. When did this start?",
      "If you took one very small step, what might that look like?",
      'What usually helps you get moving again, even a little?',
    ]),

    rule('relationship', 40, /\b(my (?:boyfriend|girlfriend|husband|wife|partner|fianc[eé])|we broke up|our relationship)\b\s*(.*)/i, [
      "Relationships can hold both our deepest joys and our hardest moments. What's been happening?",
      'Right now, are you looking more to vent about this, or to think through what to do?',
      'What place does this relationship hold in your life?',
    ]),

    rule('health', 35, /\b(i'?m sick|i'?m ill|in pain|my health|went to the doctor)\b/i, [
      'Worrying about your health can take up a lot of mental space. What\'s concerning you most?',
      'Have you had a chance to talk to a doctor about it?',
      'How much has this been affecting your day-to-day lately?',
    ]),

    rule('gratitude', 25, /\b(thank you|thanks darya|i appreciate you|grateful for you)\b/i, [
      'That means a lot to hear, thank you for saying so.',
      "I'm glad this conversation has been helpful.",
      'Being here with you matters to me too.',
    ]),

    rule('school', 35, /\b(exam|exams|final(?:s)?|college|university|my grades|my professor)\b/i, [
      'Academic pressure can be genuinely exhausting. What exactly feels like the most pressure right now?',
      'How much time is left before this, and how do you feel about it?',
      'What might take a bit of that pressure off, even briefly?',
    ]),

    rule('money', 35, /\b(no money|financial (?:trouble|problems)|in debt|can'?t afford|bills)\b/i, [
      'Money worries have a way of casting a shadow over everything else. How long has this been weighing on you?',
      'When did this financial stress start?',
      'Is there anyone you can talk this through with?',
    ]),

    rule('feeling', 30, /\b(?:i feel|i think|i believe)\s+(.*)/i, [
      'Why do you think {captured}?',
      'How long have you felt that {captured}?',
      'Can you say more about why {captured}?',
      "If that feeling weren't there, what would take its place?",
    ]),

    rule('reasoning', 25, /\bbecause\s+(.*)/i, [
      'Is that the only reason?',
      'Do you think that reason tells the whole story?',
      'What other reasons might be part of this too?',
    ]),

    rule('need', 25, /\b(?:i need|i want|i wish i had)\s+(.*)/i, [
      'If you had {captured}, what would actually change in your life?',
      "What's standing between you and {captured}?",
      'What might a small first step toward {captured} look like?',
    ]),

    rule('affirmation', 15, /^(yes|yeah|yep)\.?$/i, [
      'I see. Can you tell me a bit more?',
      'Okay. What else comes to mind about this?',
    ]),

    rule('negation', 15, /^(no|nope|nah)\.?$/i, [
      "That's alright. So what's on your mind, then?",
      'Understood. Would you like to bring up something else?',
    ]),
  ];

  // Short auxiliary/filler fragments that are grammatically meaningless on
  // their own if left over from a capture group (mirrors the Persian
  // trivial-copula list, adapted to English's own filler words).
  const trivialCaptures = new Set([
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'it', 'that', 'this', 'so', 'really', 'just', 'very',
  ]);

  const genericFallbacks = [
    'Can you tell me more about that?',
    'Why does this matter to you?',
    'Please, go on, tell me a bit more.',
    'I see. And then what happened?',
    'What made you want to share this with me?',
  ];


  // Vocabulary for the language-neutral named-entity extractor. Terms are
  // intentionally conversational and are remembered only on an emotional
  // turn, never as a complete transcript or profile.
  const familyTerms = [
    'mother', 'mom', 'father', 'dad', 'grandmother', 'grandfather', 'sister',
    'brother', 'husband', 'wife', 'partner', 'fiancé', 'fiancee', 'boyfriend',
    'girlfriend', 'family', 'parents', 'child', 'daughter', 'son',
  ];
  const professionTerms = [
    'job', 'work', 'boss', 'career', 'coworker', 'school', 'college',
    'university', 'exam', 'professor', 'doctor', 'therapist', 'project',
    'meeting', 'office', 'student',
  ];
  const placeWords = [
    'home', 'house', 'room', 'school', 'college', 'university', 'office',
    'city', 'town', 'park', 'hospital', 'here', 'there', 'Tehran', 'London',
  ];

  const entityCallbackTemplates = {
    person: ['You mentioned {surface} earlier. Would you like to tell me more about them?'],
    place: ['You mentioned {surface}. Is that place still on your mind?'],
    time: ['You brought up {surface}. What does that time bring up for you?'],
    activity: ['You mentioned {surface}. Which part of it is taking up the most space right now?'],
    object: ['I remember you mentioned {surface}. Would you like to stay with that for a moment?'],
  };

  const strategyShiftFallbacks = [
    "Let's pause for a second. Right now, what's taking up the most space in your mind?",
    'If you were describing this feeling to a friend, what would you say?',
    'Would you like to talk about something else for a bit?',
    'What might make this moment feel a little lighter, right now?',
  ];

  const sessionCheckIns = [
    "We've touched on a few different things in this conversation. Which one feels most present for you right now?",
    "We've covered a fair amount so far. Would you like to sit with one of these a little longer?",
  ];

  // Matches question marks and common question-word sentence openers, so
  // the engine can tell an interrogative sentence apart from a statement
  // even when a specific rule doesn't cover what's being asked.
  const questionPattern = /\?|^\s*(what|why|how|who|when|where|which|do|does|did|is|are|am|can|could|will|would|should)\b/i;

  const questionFallbacks = [
    "That's a thoughtful question. I don't have a perfect answer, but I'm curious what's making you think about it right now.",
    "That's worth sitting with. What's your own take on it?",
  ];

  const topicCallbacks = {
    family: ["I'm still curious about your family, by the way. Want to keep going there?"],
    work: ['We were talking about your work earlier. Want to go back to that?'],
    sleep: ['How has your sleep been these days?'],
    sadness: ['Is that sadness still with you?'],
    anxiety: ['Is that worry you mentioned still there?'],
    anger: ['Is that anger still sitting with you?'],
    loneliness: ['Is that feeling of loneliness still around?'],
    self_esteem: ['Are those hard thoughts about yourself still showing up?'],
    grief: ['Would you like to talk more about that loss?'],
    motivation: ['Is finding motivation still difficult?'],
    relationship: ['How are things going with that relationship?'],
    health: ['How are you feeling physically these days?'],
    school: ['How are things going with school or exams?'],
    money: ['Is that financial worry you mentioned still on your mind?'],
  };

  // A safe, low-risk callback: quoting the person's own earlier words back
  // to them is a core reflective-listening technique and carries no
  // grammar risk, since their words are inserted verbatim.
  const quotedCallbackTemplates = [
    'A little earlier you mentioned: "{excerpt}". Would you like to explore that a bit more?',
    'I remember you said: "{excerpt}". Is that still on your mind?',
  ];

  // Gentle, optional coping offer shown when several consecutive messages
  // read as emotionally heavy. Not a diagnosis, not a substitute for
  // professional support -- just a caring pause and a well-known,
  // low-risk grounding technique (paced breathing).
  const distressNudges = [
    "It seems like the last few messages have felt pretty heavy. If you'd like, we could pause for a moment: breathe in for a count of four, hold for four, breathe out for four. And if these feelings continue or get more intense, talking with a professional or someone you trust could really help.",
    "I notice this part of our conversation has felt heavy for you. We don't have to solve it all right now; if you want, we can just sit with it for a moment. And if these feelings stick around, being with a professional or someone you trust can make a real difference.",
  ];

  const sentimentLexicon = {
    negative: [
      'sad', 'depressed', 'tired', 'anxious', 'stressed', 'lonely', 'scared',
      'afraid', 'angry', 'furious', 'hopeless', 'worried', 'crying', 'hurt',
      'exhausted', 'overwhelmed', 'worthless', 'awful', 'terrible', 'bad',
    ],
    positive: [
      'happy', 'glad', 'great', 'grateful', 'thankful', 'calm', 'hopeful',
      'relieved', 'good', 'excited', 'proud', 'love', 'better', 'okay',
    ],
  };

  // Simple, well-known ELIZA-style pronoun reflection. English's pronoun
  // morphology is simple enough (unlike Persian's verb-carried person
  // marking) that a careful word-swap stays grammatical for short,
  // straightforward sentences -- see the guard conditions in
  // darya-engine.js (word-count cap, "only if a swap actually happened").
  const pronounMap = {
    i: 'you',
    me: 'you',
    my: 'your',
    mine: 'yours',
    myself: 'yourself',
    "i'm": 'you are',
    "i've": 'you have',
    "i'll": 'you will',
    "i'd": 'you would',
    am: 'are',
  };

  const exitKeywords = ['bye', 'goodbye', 'i have to go', 'i need to go', 'exit', 'quit'];

  const greetings = [
    `Hi, I'm ${BOT_NAME}. I'm glad you're here with me today.`,
    `Hello, it's good to see you. I'm ${BOT_NAME}, and I'm listening.`,
    `Welcome. I'm ${BOT_NAME}, and whatever's on your mind, this is a safe place for it.`,
    "Hi there! I'm glad you're here. What's on your mind today?",
  ];

  const farewells = [
    "Take care of yourself. I'm here whenever you'd like to talk again.",
    "Goodbye for now. I hope you feel a little lighter today.",
    "Until next time. Be gentle with yourself.",
  ];

  const emptyInputReply = "I notice you've gone quiet. Whenever you're ready, I'm here.";

  function foreignLanguageRedirect() {
    return `I'm ${BOT_NAME}, and I can only have this conversation in English so I can support you well. Could you write your message in English so we can continue?`;
  }

  global.DaryaLang = global.DaryaLang || {};
  global.DaryaLang.en = {
    code: 'en',
    dir: 'ltr',
    botName: BOT_NAME,
    scriptRange: SCRIPT_RANGE,
    minScriptRatio: 0.85,
    normalize,
    rules,
    trivialCaptures,
    genericFallbacks,
    strategyShiftFallbacks,
    sessionCheckIns,
    checkInEvery: 8,
    questionPattern,
    questionFallbacks,
    topicCallbacks,
    quotedCallbackTemplates,
    distressNudges,
    sentimentLexicon,
    pronounMap,
    familyTerms,
    professionTerms,
    placeWords,
    entityCallbackTemplates,
    exitKeywords,
    greetings,
    farewells,
    emptyInputReply,
    foreignLanguageRedirect,
    ui: {
      appTitle: 'Darya · A Calm Conversation Companion',
      appDescription: 'Darya, an English-language conversation companion for listening and support.',
      placeholderDefault: "Write whatever's on your mind…",
      placeholderEnded: 'This conversation has ended. Choose "New chat" from the menu to start again.',
      ariaSendLabel: 'Send message',
      ariaMenuLabel: 'Options',
      ariaInputLabel: 'Your message to Darya',
      menuNewChat: 'New chat',
      menuExportMd: 'Download chat — Markdown',
      menuExportTxt: 'Download chat — plain text',
      themeOceanLabel: 'Ocean theme',
      themeBeachLabel: 'Beach theme',
      disclaimer: "Darya is a listening companion, not a substitute for professional help. In a crisis, please contact a professional or a crisis line.",
      foreignScriptHint: 'Please write in English so I can understand and support you.',
      exportTitle: `Conversation with ${BOT_NAME}`,
      exportYouLabel: 'You',
      exportDivider: '-----------------------------',
      dateLocale: 'en-US',
      connectionError: 'Something went wrong connecting. Please reload the page.',
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
