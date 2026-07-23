/**
 * Darya — English language pack.
 *
 * Mirrors js/languages/fa.js in structure and capability so English and
 * Persian get identical engine features with no compromises on either
 * side. Content is written naturally for English rather than translated
 * literally from Persian.
 *
 * The new greeting system exposes three pools so the engine can pick the
 * shape that fits the moment:
 *   - greentingsOpen        : warm, no question (e.g. "Hello, glad you're here.")
 *   - greentingsInviting    : a single, light invitation (e.g. "What would you like to talk about?")
 *   - greentingsReturning   : brief re-greeting later in the same conversation
 * The engine mixes these by intent: never defaulting to "How are you?",
 * sometimes inviting the user to lead, sometimes just opening the door.
 */

(function (global) {
  'use strict';

  const BOT_NAME = 'Darya';

  // Basic Latin plus the Latin-1/Extended-A accented range, which covers
  // the vast majority of everyday English (and common loanwords/names).
  const SCRIPT_RANGE = /[A-Za-z\u00C0-\u017F]/;

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

  function rule(topic, priority, pattern, responses, options) {
    const r = { topic, priority, pattern, responses };
    if (options) Object.assign(r, options);
    return r;
  }

  const rules = [
    rule('safety', 100, /\b(suicide|kill myself|self.?harm|hurt myself|end my life|don'?t want to live)\b/i, [
      "What you just shared matters a great deal, and I want you to know you're not alone. Is there someone nearby you could reach out to or be with right now?",
      "That sounds like a very heavy weight to carry, and it deserves real, immediate support. Please reach out to a crisis line or someone you trust right now. I'm here with you, but I'm not a substitute for urgent professional help.",
    ]),

    rule('family', 50, /\b(my (?:mom|mother|dad|father|parents|sister|brother|family))\b\s*(.*)/i, [
      'Tell me more about that.',
      'Family stuff has a way of sitting with us for a long time.',
      'How does your relationship with your family feel to you these days?',
      'What came up for you around that?',
      'What brought that to mind just now?',
    ]),

    rule('work', 50, /\b(my job|my work|my boss|my career|my coworker|got fired|got laid off)\b\s*(.*)/i, [
      'Work can weigh on you in ways that spill into everything else.',
      'Tell me more about your work situation.',
      'Work can weigh on you in ways that spill into everything else. How has that been affecting you?',
      'Tell me more about your work situation. What feels hardest about it right now?',
      'If things at work were better, what would actually be different?',
    ]),

    rule('sleep', 50, /\b(can'?t sleep|insomnia|nightmares|sleeping badly|trouble sleeping)\b\s*(.*)/i, [
      "It sounds like your sleep hasn't been restful lately.",
      "Trouble sleeping can be a sign that something's weighing on your mind.",
      "It sounds like your sleep hasn't been restful lately. When did that start?",
      "Trouble sleeping can be a sign that something's weighing on your mind. What's been occupying your thoughts lately?",
      "When you can't sleep, where does your mind usually go?",
    ], {
      intensifierResponses: [
        "When sleep is that broken, everything else gets harder too. That makes sense.",
        "Really bad sleep can wear a person down. I hear you.",
      ],
    }),

    rule('sadness', 40, /\b(sad|down|depressed|heartbroken|crying|low)\b/i, [
      "It sounds like you've been carrying a lot of sadness lately.",
      "Sadness is hard to sit with.",
      "It sounds like you've been carrying a lot of sadness lately. Want to talk more about it?",
      "Sadness is hard to sit with. What brought this feeling on?",
      "Let's stay with this for a moment. How long have you been feeling this way?",
      'Where in your body do you feel this sadness most?',
    ], {
      intensifierResponses: [
        "That sounds like a deep kind of sadness. I'm here.",
        "When sadness hits that hard, it really takes up the whole day.",
        "I'm not going to pretend that's small. That sounds heavy.",
      ],
    }),

    rule('anxiety', 40, /\b(anxious|anxiety|stressed|stress|scared|afraid|worried|panicking)\b/i, [
      'Anxiety can be so exhausting.',
      'Stress like that has a way of landing in the body.',
      'Anxiety can be so exhausting. What exactly has been worrying you?',
      'When that stress hits, what does it feel like in your body?',
      'On a scale of 1 to 10, how intense is this worry right now?',
    ], {
      intensifierResponses: [
        "That level of worry is exhausting. I'm listening.",
        "When anxiety gets that intense, it can feel like everything's urgent at once.",
        "That sounds like real fear, not just nervousness.",
      ],
    }),

    rule('anger', 40, /\b(angry|furious|pissed off|mad at|so annoyed)\b/i, [
      "It sounds like there's a lot of anger built up.",
      "That frustration makes sense.",
      "It sounds like there's a lot of anger built up. What triggered it?",
      "That frustration makes sense. Do you want to walk me through exactly what happened?",
      'Where do you feel that anger most in your body?',
    ], {
      intensifierResponses: [
        "That kind of anger takes a lot of energy to hold.",
        "When anger is that strong, it's usually pointing at something that matters.",
        "I'm hearing real fury. What's underneath it?",
      ],
    }),

    rule('joy', 35, /\b(happy|glad|excited|thrilled|great news|feeling good)\b/i, [
      "I'm glad you're feeling this way!",
      "That's good to hear.",
      "I'm glad you're feeling this way! What brought it on?",
      "That's good to hear. Want to tell me more about it?",
      'Where do you feel that good feeling in your body?',
    ], {
      intensifierResponses: [
        "That's a real kind of joy. I'm glad it's here.",
        "When the good feeling is that strong, it's worth sitting with for a moment.",
      ],
    }),

    rule('loneliness', 40, /\b(lonely|alone|no one to talk to|nobody understands|isolated)\b/i, [
      'Loneliness can feel really heavy.',
      'That sense of being alone is real.',
      'Loneliness can feel really heavy. How long has this feeling been with you?',
      'When you say you feel alone, do you mean not having people to talk to, or something deeper?',
      "Who's the person you feel closest to these days, even if you don't see them often?",
    ], {
      intensifierResponses: [
        "That depth of loneliness is its own kind of pain. I'm here with you in it.",
        "When loneliness is that strong, even small things can feel harder.",
        "I'm listening. I don't want you to feel alone in this conversation.",
      ],
    }),

    rule('self_esteem', 40, /\b(worthless|not good enough|hate myself|no confidence|i'?m a failure)\b/i, [
      "Those are heavy things to feel about yourself.",
      "It sounds like you've been hard on yourself.",
      "Those are heavy things to feel about yourself. Where do you think that belief comes from?",
      'What usually brings on thoughts like that?',
      'If a friend said this about themselves, what would you tell them?',
    ], {
      intensifierResponses: [
        "That voice sounds especially loud right now. I'm not going to argue with it -- I'm just here.",
        "When you feel worthless, it can be hard to remember that feelings aren't facts.",
        "I'm hearing real pain in how you talk about yourself. That matters.",
      ],
    }),

    rule('grief', 45, /\b(lost my|passed away|passed away|death of|grieving|my .* died)\b/i, [
      'Losing someone is one of the hardest things a person can go through.',
      "Whatever you're feeling about this loss is valid.",
      'Losing someone is one of the hardest things a person can go through. Do you want to talk about it a little?',
      'Whatever you\'re feeling about this loss is valid. How have you been coping with it lately?',
      "I'd like to hear about them, if you'd like to share.",
    ], {
      intensifierResponses: [
        "Grief that strong doesn't just fade. It finds new shapes.",
        "I'm so sorry. There's no right way to carry this.",
        "When loss hits that hard, time doesn't really heal -- we just grow around it.",
      ],
    }),

    // Hopelessness: "everything feels pointless", "nothing matters",
    // "what's the point". Not a safety pattern (the safety rule
    // covers explicit self-harm) but a meaningful emotional signal
    // that deserves a real, calm response.
    rule('hopelessness', 45, /\b(everything feels pointless|nothing matters|what'?s the point|what is the point|no point|why bother)\b/i, [
      "When everything feels pointless, even small things can feel heavy. I'm here with you in that.",
      "That kind of flatness is its own kind of pain. How long has it been feeling this way?",
      "Sounds like you're carrying a lot of weight. I'm listening.",
      "I hear that. If you want to say more about what feels pointless right now, I'm here.",
    ], {
      intensifierResponses: [
        "That kind of weight isn't small. Thank you for naming it.",
        "I hear you. When everything feels that flat, the smallest step counts.",
      ],
    }),

    // "I want to disappear" / "I want to not exist" -- a meaningful
    // signal that is NOT explicitly self-harm, but lives in a
    // related space. Routed to a calm, present reflection rather
    // than a clinical "call 988" response (which the safety rule
    // handles for explicit self-harm).
    rule('dissociation', 40, /\b(want to disappear|want to not exist|don'?t want to exist|wish i could disappear|wish i could vanish)\b/i, [
      "I hear that. When you say 'disappear', what does that feel like it would do?",
      "That's a heavy thought. I'm here. What does 'disappear' look like for you right now?",
      "Sitting with that is hard. I'm listening, and I want to understand better.",
    ]),

    // Comparative / temporal-shift pattern: "I used to X but now Y",
    // "before X I was Y", "things used to be different". A meaningful
    // conversational signal that the user is comparing then vs now.
    rule('comparison', 30, /\b(i used to|i never used to|before .* i was|once i (?:was|had)|things used to|back then)\b/i, [
      "There's a real shift between then and now. What's the biggest difference?",
      "Something changed. When do you think it started?",
      "It sounds like something important shifted for you. What is it about now that feels different?",
    ]),

    // "How are you?" is no longer answered with a hardcoded "and you?"
    // question. It's reframed as a small-talk acknowledgment that
    // sometimes follows up and sometimes doesn't.
    rule('smalltalk_howareyou', 60, /\b(how are you|how're you|how r u|how are u|how(?:'s| is) it going|how you doing|how have you been|how's everything)\b/i, [
      "I'm doing well, thank you for asking. I'm here and listening whenever you'd like to share something.",
      "I'm good, thanks. I've been here quietly, just keeping space open for whatever's on your mind.",
      "I'm here, doing alright. Take your time -- I'm not going anywhere.",
      "Doing well, thanks. Is there something specific on your mind today, or would you rather just start wherever feels natural?",
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
      "When motivation is gone, even small things can feel heavy.",
      "It sounds like you're stuck in the hard place of low energy.",
      "When motivation is gone, even small things can feel heavy. When did this start?",
      "If you took one very small step, what might that look like?",
      'What usually helps you get moving again, even a little?',
    ]),

    rule('relationship', 40, /\b(my (?:boyfriend|girlfriend|husband|wife|partner|fianc[eé])|we broke up|our relationship)\b\s*(.*)/i, [
      "Relationships can hold both our deepest joys and our hardest moments.",
      "I'm listening, whatever this is.",
      "Relationships can hold both our deepest joys and our hardest moments. What's been happening?",
      'Right now, are you looking more to vent about this, or to think through what to do?',
      'What place does this relationship hold in your life?',
    ]),

    rule('health', 35, /\b(i'?m sick|i'?m ill|in pain|my health|went to the doctor)\b/i, [
      "Worrying about your health can take up a lot of mental space.",
      "Health stuff has a way of crowding out everything else.",
      "Worrying about your health can take up a lot of mental space. What's concerning you most?",
      'Have you had a chance to talk to a doctor about it?',
      'How much has this been affecting your day-to-day lately?',
    ]),

    rule('gratitude', 25, /\b(thank you|thanks darya|i appreciate you|grateful for you)\b/i, [
      'That means a lot to hear, thank you for saying so.',
      "I'm glad this conversation has been helpful.",
      'Being here with you matters to me too.',
    ], {
      // Negation-aware: "I'm not grateful" / "I don't appreciate" -- a
      // very rare input but the engine should still recognize it as
      // about gratitude and reflect without the grateful framework.
      negationResponses: [
        "It sounds like gratitude feels hard to come by right now. That's worth sitting with.",
        "Not feeling grateful is okay too. What's making it feel that way?",
      ],
    }),

    rule('school', 35, /\b(exam|exams|final(?:s)?|college|university|my grades|my professor)\b/i, [
      'Academic pressure can be genuinely exhausting.',
      'It sounds like school is weighing on you right now.',
      'Academic pressure can be genuinely exhausting. What exactly feels like the most pressure right now?',
      'How much time is left before this, and how do you feel about it?',
      'What might take a bit of that pressure off, even briefly?',
    ]),

    rule('money', 35, /\b(no money|financial (?:trouble|problems)|in debt|can'?t afford|bills)\b/i, [
      'Money worries have a way of casting a shadow over everything else.',
      "It sounds like the financial side of things is heavy right now.",
      'Money worries have a way of casting a shadow over everything else. How long has this been weighing on you?',
      'When did this financial stress start?',
      'Is there anyone you can talk this through with?',
    ]),

    rule('feeling', 30, /\b(?:i feel|i think|i believe)\s+(.*)/i, [
      'Why do you think {captured}?',
      'How long have you felt that way?',
      'Can you tell me a bit more?',
      "If that feeling weren't there, what would take its place?",
      'What makes you feel {captured}?',
    ]),

    rule('reasoning', 25, /\bbecause\s+(.*)/i, [
      'Is that the only reason?',
      'Do you think that reason tells the whole story?',
      'What other reasons might be part of this too?',
    ]),

    rule('need', 25, /\b(?:i need|i want|i wish i had)\s+(.*)/i, [
      'If you had {captured}, what would actually change in your life?',
      "What's standing between you and {captured}?",
      'What might a small first step look like?',
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

  // Generic, non-question-leaning fallbacks. The engine mixes these
  // with question-shaped ones to break the perpetual question rhythm.
  const genericFallbacks = [
    'Can you tell me more about that?',
    'What does that feel like for you?',
    'Please, go on, tell me a bit more.',
    'I see. And then what happened?',
    'What made you want to share this with me?',
  ];

  // Generic negation pool: used when a rule matched but it has no
  // dedicated `negationResponses`, or when the fallback path handles
  // a negated input. These lines acknowledge the "not" without
  // making the user defend their position.
  const negationFallbacks = [
    "What's making that land as a 'not' for you?",
    "What's the 'not' protecting you from?",
    "When you say it's not there, what would be there instead?",
    "I hear the 'not'. What would feel closer to the truth?",
  ];

  // Generic "I don't know" / "no idea" responses: brief, calm, and
  // non-pressuring. The brief calls out that we should not sound like
  // a FAQ bot -- these are intentionally human-feeling.
  const iDontKnowResponses = [
    "That's okay. Not knowing is its own kind of honest.",
    "You don't have to have an answer right now.",
    "Sitting with not-knowing can be its own kind of clarity, eventually.",
    "I hear you. Sometimes 'I don't know' is the most accurate thing we can say.",
    "It's fine to not have it figured out. We can just sit with it for a moment.",
  ];

  // Absolutist thinking responses: when the user uses "always",
  // "never", "everyone", etc., the engine offers a gentle,
  // non-confrontational reality-check rather than accepting the
  // generalization as ground truth. These are deliberately phrased
  // as questions/curiosities, not corrections.
  const absolutistResponses = [
    "When you say 'always', is that really every time, or more of a feeling?",
    "'Never' is a strong word. Can you think of even one exception?",
    "I'm curious whether 'everyone' really means everyone, or the people who feel closest to you.",
    "That sounds like a big 'always'. What's it like to live inside that?",
  ];

  // "Again" / "same thing" reference templates: when the user points
  // back at a prior topic ("it's the same thing again"), the engine
  // picks one of these brief callbacks. {topic} is filled with the
  // most recent topic name when known.
  const againCallbackTemplates = [
    "It sounds like this is the same weight showing up again.",
    "It feels like the same thing coming back around.",
    "That sounds like the {topic} again, in a new shape.",
    "It sounds like a familiar pattern with {topic}.",
  ];

  // Pattern that triggers the "again" detection. The engine also
  // matches a built-in default, so this is for language-specific
  // extensions only.
  const againPatterns = [
    /\b(again|still|keeps happening|same (?:thing|problem|issue|pattern))\b/i,
  ];

  // Topic names for the {topic} placeholder in `againCallbackTemplates`.
  // Keys match the rule topic strings.
  const topicNames = {
    family: 'family',
    work: 'work',
    sleep: 'sleep',
    sadness: 'sadness',
    anxiety: 'anxiety',
    anger: 'anger',
    loneliness: 'loneliness',
    self_esteem: 'those hard thoughts about yourself',
    grief: 'your loss',
    motivation: 'the lack of motivation',
    relationship: 'that relationship',
    health: 'your health',
    school: 'school',
    money: 'money',
  };

  // Deliberately non-question statements: picked on every Nth turn to
  // break the rhythm of constant follow-ups.
  const strategyShiftFallbacks = [
    "Let's pause for a second. Right now, what's taking up the most space in your mind?",
    'If you were describing this feeling to a friend, what would you say?',
    'Would you like to talk about something else for a bit?',
    'What might make this moment feel a little lighter, right now?',
    "That sounds like a lot to hold. I'm here, take your time.",
    'It sounds like that landed somewhere real for you.',
    "There's no rush -- I'm just listening.",
  ];

  const sessionCheckIns = [
    "We've touched on a few different things in this conversation. I want to make sure I'm not losing track of what's most important to you.",
    "We've covered a fair amount so far.",
    "We've touched on a few different things in this conversation. Which one feels most present for you right now?",
    "We've covered a fair amount so far. Would you like to sit with one of these a little longer?",
  ];

  // Matches question marks and common question-word sentence openers, so
  // the engine can tell an interrogative sentence apart from a statement
  // even when a specific rule doesn't cover what's being asked.
  const questionPattern = /\?|^\s*(what|why|how|who|when|where|which|do|does|did|is|are|am|can|could|will|would|should)\b/i;

  const questionFallbacks = [
    "That's a thoughtful question. I'm not sure I have a perfect answer.",
    "That's worth sitting with.",
    "That's a thoughtful question. I don't have a perfect answer, but I'm curious what's making you think about it right now.",
    "That's worth sitting with. What's your own take on it?",
  ];

  const topicCallbacks = {
    family: [
      "I'm still curious about your family, by the way.",
      'Earlier you mentioned your family. I\'m still curious about that.',
      "I'm still curious about your family, by the way. Want to keep going there?",
    ],
    work: [
      'We were talking about your work earlier.',
      'Your work was on your mind a few minutes ago.',
      'We were talking about your work earlier. Want to go back to that?',
    ],
    sleep: [
      'Sleep was something you mentioned earlier.',
      'I was thinking about what you said about your sleep.',
      'How has your sleep been these days?',
    ],
    sadness: [
      'That sadness you mentioned earlier is still on my mind.',
      'I was sitting with the sadness you brought up earlier.',
      'Is that sadness still with you?',
    ],
    anxiety: [
      'That worry you mentioned earlier is still on my mind.',
      'I was sitting with what you said about feeling anxious.',
      'Is that worry you mentioned still there?',
    ],
    anger: [
      'That anger you mentioned earlier is still on my mind.',
      'I was sitting with what you said about feeling angry.',
      'Is that anger still sitting with you?',
    ],
    loneliness: [
      'That feeling of being alone you mentioned is still on my mind.',
      'I was sitting with what you said about feeling alone.',
      'Is that feeling of loneliness still around?',
    ],
    self_esteem: [
      'Those hard thoughts about yourself from earlier are still on my mind.',
      'I was sitting with what you said about yourself.',
      'Are those hard thoughts about yourself still showing up?',
    ],
    grief: [
      'That loss you mentioned is still on my mind.',
      'I was sitting with what you shared about your loss.',
      'Would you like to talk more about that loss?',
    ],
    motivation: [
      'I was sitting with what you said about motivation.',
      'The lack of motivation you mentioned is still on my mind.',
      'Is finding motivation still difficult?',
    ],
    relationship: [
      'I was sitting with what you shared about that relationship.',
      'That relationship you mentioned is still on my mind.',
      'How are things going with that relationship?',
    ],
    health: [
      'I was thinking about what you said about your health.',
      'Your health was on your mind earlier.',
      'How are you feeling physically these days?',
    ],
    school: [
      'School was on your mind a few minutes ago.',
      'I was sitting with what you shared about school.',
      'How are things going with school or exams?',
    ],
    money: [
      'That financial worry you mentioned is still on my mind.',
      'I was sitting with what you said about money.',
      'Is that financial worry you mentioned still on your mind?',
    ],
  };

  // A safe, low-risk callback: quoting the person's own earlier words back
  // to them is a core reflective-listening technique and carries no
  // grammar risk, since their words are inserted verbatim. Half of these
  // end in a question, half in a statement, so the engine can pick
  // between them based on the question budget.
  const quotedCallbackTemplates = [
    'A little earlier you mentioned: "{excerpt}".',
    'I remember you said: "{excerpt}".',
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

  // Pronoun reflection has a follow-up template so the engine can wrap
  // the swapped result in a complete, varied reply. Mix of statements
  // and questions so the engine can balance the question budget.
  const pronounReflectionFollowups = [
    'So {reflected}.',
    'So {reflected}. That\'s worth sitting with for a moment.',
    'I hear you: {reflected}.',
    'So {reflected}. What\'s that like for you?',
    "So {reflected}. How long has that been true?",
    "So {reflected}. Can you say a little more about that?",
  ];

  const exitKeywords = ['bye', 'goodbye', 'i have to go', 'i need to go', 'exit', 'quit'];

  // Three greeting pools, picked by the engine based on context. The
  // OPEN pool never asks a question -- it just creates space. The
  // INVITING pool asks a single, non-generic, non-"how are you" line.
  const greentingsOpen = [
    `Hi, I'm ${BOT_NAME}. I'm glad you're here.`,
    `Hello. I'm ${BOT_NAME}, and I'm listening.`,
    `Welcome. I'm ${BOT_NAME}. Whatever's on your mind, this is a safe place for it.`,
    "Hi there. I'm here, no agenda, just listening.",
    `I'm ${BOT_NAME}. Take your time getting started -- there's no rush.`,
  ];

  const greentingsInviting = [
    "Whenever you're ready, share whatever's on your mind.",
    "What's on your mind today?",
    "Is there something particular you'd like to talk through, or shall we just see where it goes?",
    "I'm here and I have time. What would feel most useful to talk about?",
  ];

  const greentingsReturning = [
    "Hello again.",
    "Hey, welcome back.",
    "Hi again -- still here, still listening.",
    "Glad you came back.",
  ];

  // Bare-acknowledgment responses: a brief, non-question line for "ok",
  // "yeah", "mm", etc.
  const acknowledgmentTokens = new Set([
    'ok', 'okay', 'k', 'kk', 'yes', 'yeah', 'yep', 'yup', 'no', 'nope', 'nah',
    'mm', 'hmm', 'hm', 'mhm', 'uh-huh', 'uhuh', 'right', 'sure', 'fine',
    'good', 'great', 'cool', 'nice', 'alright', 'aight', 'gotcha',
  ]);

  const acknowledgmentResponses = [
    "Got it.",
    "Alright.",
    "Okay.",
    "I hear you.",
    "Thanks for letting me know.",
    "Noted.",
  ];

  // Reference memory: short content words that are too generic to bother
  // remembering as the "thing the user just mentioned". Used by the
  // engine's light entity-tracking layer.
  const referenceStopwords = [
    'the', 'and', 'but', 'with', 'from', 'this', 'that', 'have', 'been',
    'just', 'really', 'very', 'about', 'what', 'when', 'where', 'your',
    'feel', 'felt', 'feeling', 'feelings', 'think', 'thought', 'thoughts',
    'know', 'like', 'want', 'need', 'have', 'had', 'has', 'some', 'more',
    'much', 'many', 'every', 'each', 'all', 'any', 'too', 'so', 'then',
    'than', 'because', 'since', 'though', 'although', 'still', 'again',
    'was', 'were', 'are', 'is', 'am', 'be', 'being', 'it', 'its', 'not',
    'yes', 'no', 'can', 'could', 'will', 'would', 'should', 'do', 'did',
    'does', 'doing', 'done', 'going', 'get', 'got', 'getting', 'go',
    'went', 'come', 'came', 'coming', 'take', 'took', 'taking', 'make',
    'made', 'making', 'see', 'saw', 'seen', 'seeing', 'say', 'said',
    'saying', 'tell', 'told', 'telling', 'now', 'then', 'here', 'there',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
    'nine', 'ten', 'thing', 'things', 'something', 'someone', 'somebody',
    'anything', 'anyone', 'anybody', 'nothing', 'no one', 'nobody',
  ];

  const farewells = [
    "Take care of yourself. I'm here whenever you'd like to talk again.",
    "Goodbye for now. I hope you feel a little lighter today.",
    "Until next time. Be gentle with yourself.",
  ];

  // Used when the last few turns leaned negative: warmer, more attentive
  // closing lines that don't pretend to "fix" anything.
  const farewellsEmpathetic = [
    "Take care. Whatever you're carrying right now, I hope you can be gentle with yourself tonight.",
    "Goodbye for now. Be kind to yourself -- and please come back if it would help.",
    "Until next time. I'm glad you talked today, even the hard parts.",
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
    negationFallbacks,
    strategyShiftFallbacks,
    sessionCheckIns,
    checkInEvery: 8,
    questionPattern,
    questionFallbacks,
    iDontKnowResponses,
    absolutistResponses,
    againCallbackTemplates,
    againPatterns,
    topicNames,
    topicCallbacks,
    quotedCallbackTemplates,
    distressNudges,
    sentimentLexicon,
    pronounMap,
    pronounReflectionFollowups,
    exitKeywords,
    greetings: greentingsOpen, // Backwards-compatible alias.
    greentingsOpen,
    greentingsInviting,
    greentingsReturning,
    acknowledgmentTokens,
    acknowledgmentResponses,
    referenceStopwords,
    farewells,
    farewellsEmpathetic,
    emptyInputReply,
    foreignLanguageRedirect,
    // Greeting intent detection: words / phrases that, on their own,
    // signal a pure greeting intent.
    greetingTokens: new Set([
      'hi', 'hello', 'hey', 'howdy', 'yo', 'hiya', 'heya', 'morning',
      'afternoon', 'evening', 'night',
    ]),
    greetingPhrases: [
      'hi', 'hello', 'hey', 'howdy', 'yo', 'hiya',
      'good morning', 'good afternoon', 'good evening', 'good night',
      'morning', 'afternoon', 'evening', 'hey there', 'hi there',
    ],
    ui: {
      appTitle: 'Darya · A Calm Conversation Companion',
      appDescription: 'Darya, an English-language conversation companion for listening and support.',
      placeholderDefault: "Write whatever's on your mind…",
      placeholderEnded: 'This conversation has ended. Choose "New chat" from the menu to start again.',
      ariaSendLabel: 'Send message',
      ariaMenuLabel: 'Options',
      ariaInputLabel: 'Your message to Darya',
      menuNewChat: 'New chat',
      menuExportMd: 'Download chat Markdown',
      menuExportTxt: 'Download chat plain text',
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
