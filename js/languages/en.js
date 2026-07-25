/**
 * Darya - English language pack.
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

    rule('greeting', 65, /^(?:hi|hello|hey|good morning|good evening|good afternoon)[!.?]*$/i, [
      'Hi. It is good to see you. What would you like to share today?',
      'Hello. I am here. We can keep it brief or follow a thread. What suits you?',
      'Hey. Good to have you here. What has your attention?',
      'Hello. No rush. What kind of conversation would feel right?',
    ]),

    rule('family', 50, /\b(my (?:mom|mother|dad|father|parents|sister|brother|family))\b\s*(.*)/i, [
      'Which part of {captured} stands out most right now?',
      'How does your relationship with your family feel to you these days?',
      'What comes up for you when you think about {captured}?',
      'What made {captured} come to mind just now?',
    ]),

    rule('work', 50, /\b(my job|my work|my boss|my career|my coworker|got fired|got laid off)\b\s*(.*)/i, [
      'Work can weigh on you in ways that spill into everything else. How has {captured} been affecting you?',
      'Which part of your work situation feels hardest right now?',
      'If things at work were better, what would actually be different?',
    ]),

    rule('sleep', 50, /\b(can'?t sleep|insomnia|nightmares|sleeping badly|trouble sleeping|waking up|wake up at night)\b\s*(.*)/i, [
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
      "That's good to hear. What part of it stands out to you?",
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
      "I'm Darya, a companion here to listen. I'm not a real person, just a calm space to think out loud.",
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

    rule('gratitude', 25, /\b(thanks?|thank you|thanks darya|i appreciate you|grateful for you)\b/i, [
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

    rule('knowledge', 55, /\b(?:socrates|stoic|stoicism|aristotle|jung|nietzsche|gandhi|mandela|churchill|zarathustra|philosophy|focus|concentrate|study better|learn better|communicate better|communication advice|creative block|be more creative)\b/i, []),

    rule('professional_boundary', 90, /\b(?:medical advice|diagnosis|medication|legal advice|lawyer|court|financial advice|investing|tax advice|loan advice)\b/i, []),

    rule('recap', 80, /\b(?:what did i say earlier|what have i said|can you summarize|summarize this|give me a recap)\b/i, []),

    rule('affirmation', 15, /^(yes|yeah|yep)\.?$/i, [
      'I see. Can you tell me a bit more?',
      'Okay. What detail about this feels most important right now?',
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
    'There is a thread here worth following.',
    'We can take this one piece at a time.',
    'That gives me a clearer place to begin.',
    'I am listening for the detail that matters most.',
    'This feels worth giving a little room to.',
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
    'university', 'exam', 'professor', 'doctor', 'project',
    'meeting', 'office', 'student',
  ];
  const placeWords = [
    'home', 'house', 'room', 'school', 'college', 'university', 'office',
    'city', 'town', 'park', 'hospital', 'here', 'there', 'Tehran', 'London',
  ];

  const entityCallbackTemplates = {
    person: ['That {surface} thread is still with us. Its place in your day seems worth noticing.'],
    place: ['The place you named, {surface}, still seems relevant to the shape of this story.'],
    time: ['That {surface} timing detail gives this some shape and keeps the moment specific.'],
    activity: ['The {surface} part of the story seems important and worth keeping in view.'],
    object: ['That {surface} detail is still present and gives the story a particular texture.'],
  };

  const strategyShiftFallbacks = [
    "Let's look at this from a new angle. Which part feels most present for you?",
    'If you described this feeling to a friend, where would you start?',
    "Alongside this, what else has been taking up space in your mind lately?",
    'What could make this moment feel a little more manageable right now?',
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

  const questionAcknowledgements = [
    "That's worth sitting with. I can stay with the question without adding another one.",
    'A thoughtful question. My first response is to leave it open rather than rush to a neat answer.',
    'I do not have a personal view, but I can help you look at the question from a few useful angles.',
    'That question has some depth to it. We can let it breathe for a moment.',
  ];

  const topicCallbacks = {
    family: ["I'm still curious about your family, by the way. Want to keep going there?"],
    work: ['The work thread is still open. What has changed there since then?'],
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
    'The phrase "{excerpt}" still has some weight. What part of it stays with you?',
    'That phrase - "{excerpt}" - still seems present. Has it shifted at all?',
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

  const greetingsOpen = [
    `Hi. What would you like to share today?`,
    `Hello. What has been taking up space in your mind lately?`,
    `Hi there. What brought you here today?`,
    `Hello. Where would feel natural to begin?`,
    `Hi. What is one thing from today you would like to put into words?`,
    `Hello. What kind of conversation would suit you right now?`,
    `Hi there. What would make this moment useful for you?`,
    `Hello. What has your attention at the moment?`,
  ];
  const greetingsInviting = [
    `Hey. Anything in particular you would like to talk through, or shall we just see where it goes?`,
    `Hi. If you have something on your chest, would you like to start there?`,
    `Hello. I am here and curious - what brought you in today?`,
    `Hey. Want to tell me a little about what is going on?`,
    `Hi. There is no rush - what would feel good to start with?`,
    `Hello. Where would feel easiest to start?`,
    `Hi there. Is there something specific, or would you rather just chat for a while?`,
    `Hey. What thought keeps wandering back today?`,
  ];
  const greetingsReturning = [
    `Welcome back. What feels most present this time?`,
    `Good to see you again. Which thread would you like to pick up?`,
    `You are back. What has changed since we last talked?`,
    `Welcome back. What is asking for your attention today?`,
    `It is nice to see you again. Where shall we begin this time?`,
    `Back again. What has been following you around lately?`,
    `Welcome. Is there an old thread or a new one on your mind?`,
    `Hello again. What would you like to make room for today?`,
  ];
  const greetings = [...greetingsOpen, ...greetingsInviting, ...greetingsReturning];

  const farewells = [
    "Take care of yourself. I'm here whenever you'd like to talk again.",
    "Goodbye for now. I hope you feel a little lighter today.",
    "Until next time. Be gentle with yourself.",
  ];

  const repeatedGreetingResponses = [
    'You have said hello a few times now. It seems like you are not quite ready to start yet, and that is completely okay. I am here whenever you are.',
    'Hello again. I can see you are still finding the right words. There is no rush at all.',
    'Hi there. It looks like you might be wondering where to begin. That is a natural place to be, and I am happy to wait.',
    'I notice you keep saying hi. If you are not sure what to say, we can start with something small or just sit with the quiet for a moment.',
  ];

  const spamNoiseResponses = [
    'It looks like that might have been accidental. Whenever you are ready, I am here to listen.',
    'I am not quite sure what you meant by that. Would you like to try again?',
    'That did not come through clearly. Take your time, and I will be here when you are ready to share.',
  ];

  const ambiguousInputResponses = [
    'I hear you. Could you tell me a little more so I can follow along better?',
    'That was brief, and I want to make sure I understand. What more can you share about that?',
    'Got it. If you would like to expand on that, I am all ears.',
  ];

  const acknowledgementResponses = [
    'I notice you are acknowledging what I said, but I am curious what your own thoughts are on this.',
    'Thank you for that. How do you see the situation yourself?',
    'I appreciate the acknowledgement. What part of this feels most relevant to you right now?',
  ];

  const correctionResponses = [
    'Thank you for clarifying. Let me adjust my understanding. What did you mean by that?',
    'I appreciate the correction. That helps me understand better. What else should I know?',
    'Got it, thanks for making that clear. How does this change things for you?',
  ];

  const topicChangeResponses = [
    'I notice we have moved to something new. I am here for this new thread whenever you are ready.',
    'That is a different direction, and I am happy to follow. Where would you like to start with this?',
    'I am with you on this new topic. What feels most important to share about it?',
  ];

  const testInputResponses = [
    'I am here and ready whenever you would like to have a real conversation.',
    'Hello! I am Darya. When you are ready to talk about something on your mind, I am listening.',
    'It looks like you might be testing me out. That is fine! When you are ready to share something real, I am here.',
  ];

  const mixedLanguageResponses = [
    'I notice you are mixing languages. I am most helpful when we stick to English so I can follow along well. Could you write in English?',
    'It seems like you are switching between languages. I follow English best, so if you could stick to one, that would help me respond more thoughtfully.',
    'I want to make sure I understand you fully. Could we continue in English so I can give you my best attention?',
  ];

  const topicRecoveryResponses = {
    _default: [
      'We touched on something important earlier. Would you like to come back to it, or is there something else on your mind?',
      'I noticed we moved away from something that seemed to matter. Do you want to return to it?',
    ],
    family: ['I am still curious about your family. Would you like to continue there?'],
    work: ['The work thread is still open. What has changed there since then?'],
    sleep: ['How has your sleep been since we last talked about it?'],
    sadness: ['Is that sadness still with you?'],
    anxiety: ['Is that worry you mentioned still there?'],
    anger: ['Is that anger still sitting with you?'],
    loneliness: ['Is that feeling of loneliness still around?'],
    grief: ['Would you like to talk more about that loss?'],
    relationship: ['How are things going with that relationship?'],
  };

  const emotionCalibration = {
    hurt: 'That sounds painful.',
    confused: 'It is okay to feel uncertain about this.',
    excited: 'That is wonderful!',
    angry: 'I hear the frustration in your words.',
    grieving: 'I am here with you in this.',
    anxious: 'Take your time with this.',
    sad: 'I can hear the sadness in what you are saying.',
  };

  const emptyInputReply = "I notice you've gone quiet. Whenever you're ready, I'm here.";

  function foreignLanguageRedirect() {
    return `I'm ${BOT_NAME}, and I can only have this conversation in English so I can support you well. Could you write your message in English so we can continue?`;
  }

  const topicSpecificQuestions = {
    safety: ['Are you in immediate danger right now?', 'Is someone you trust nearby at this moment?', 'What would make the next ten minutes safer?', 'Can you contact a crisis service or trusted person now?'],
    family: ['Which family relationship is taking up the most space today?', 'When did this tension with them begin to feel different?', 'What do you wish they understood about your side?', 'Is there a small boundary that would make contact easier?'],
    work: ['What part of the workday has been hardest lately?', 'Did this pressure begin with a specific change at work?', 'What would a slightly better workday look like?', 'Which conversation at work keeps replaying in your head?'],
    sleep: ['Has the tiredness been there for a while, or is it new?', 'What usually happens in the hour before you try to sleep?', 'Does your mind stay busy, or does your body feel restless?', 'What has changed most in your sleep over the past few days?'],
    anxiety: ['What is the worry predicting will happen?', 'Where do you notice the anxiety first in your body?', 'Does the worry come in waves or stay in the background?', 'What would feel like a one-step reduction in its intensity?'],
    sadness: ['When did this sadness start to feel this close?', 'Does it feel more like loss, disappointment, or exhaustion today?', 'What part of the day gives the sadness the most room?', 'Is there something that briefly softens it, even a little?'],
    anger: ['What boundary or expectation felt crossed?', 'What happened just before the anger rose?', 'Would being heard, having space, or seeing change matter most?', 'Where could this anger usefully point your attention?'],
    joy: ['What small detail made this moment especially good?', 'Who would you most like to share this good news with?', 'What do you want to remember about how this felt?', 'Could you make a little more room for this feeling today?'],
    loneliness: ['What kind of company would feel good right now?', 'Is the loneliness strongest in a place or at a particular time?', 'Who feels easiest to reach, even with a short message?', 'Would you prefer quiet company or an actual conversation?'],
    self_esteem: ['Whose standard are you measuring yourself against?', 'When did this self-criticism become familiar?', 'What evidence from today does that harsh verdict leave out?', 'What would you say to someone you love in the same position?'],
    grief: ['What part of the loss feels most present today?', 'Is there a memory of them you find yourself returning to?', 'What has been hardest about the days since it happened?', 'Who can sit with you when the grief gets especially loud?'],
    motivation: ['Which first step feels small enough to begin today?', 'Is the obstacle energy, uncertainty, or the size of the task?', 'What has helped you start something on a low-energy day before?', 'Would a shorter form of the task feel possible?'],
    relationship: ['What changed between you and them most recently?', 'Are you looking for repair, clarity, or room to breathe?', 'Which part of the relationship still feels good or steady?', 'What do you need to be able to say plainly?'],
    health: ['What symptom or change is worrying you most?', 'Have you already spoken with a qualified clinician about it?', 'How is this affecting ordinary parts of your day?', 'What question would you want answered first by a professional?'],
    school: ['Which part of the course or exam feels most demanding?', 'How much time do you have before the next deadline?', 'What study approach has worked even once before?', 'Would breaking the material into one short session help?'],
    money: ['Which financial pressure needs attention first?', 'What deadline or bill is making this feel urgent?', 'Who could offer practical advice you trust?', 'What information would make the next decision clearer?'],
    gratitude: ['What part of this conversation has felt useful to you?', 'What would you like to carry with you from this moment?', 'What made you decide to say thanks just now?', 'What would feel good to talk about next?'],
    feeling: ['When did that feeling first become noticeable?', 'What seems to strengthen it during the day?', 'What part of the feeling is easiest to name?', 'What would you like to be different about it?'],
    reasoning: ['What other explanation feels possible beside that one?', 'What evidence makes this reason stand out to you?', 'Has this pattern appeared in another situation?', 'What would change your mind, even slightly?'],
    need: ['What would meeting that need make possible first?', 'What is the main thing standing between you and it?', 'Could you move toward it through one small experiment?', 'Who or what could make that first step lighter?'],
    smalltalk_howareyou: ['What has been the brightest part of your day so far?', 'What kind of day is it turning into for you?', 'What is one ordinary detail you noticed today?', 'Would you rather talk about the day or switch to something fun?'],
    smalltalk_identity: ['What would make this conversation feel useful to you?', 'What kind of companion are you hoping to find here?', 'What would you like me to pay attention to?', 'Where would you like to begin?'],
    smalltalk_capability: ['What sort of conversation would suit you right now?', 'Would reflection, brainstorming, or simple company be most useful?', 'What topic would you like to try first?', 'What would make this feel natural rather than mechanical?'],
    professional_boundary: ['Which questions would you like to take to a qualified professional?', 'What facts would be useful to collect before that appointment?', 'Is there a deadline that makes professional guidance especially important?', 'Would organizing the situation into a short list help?'],
    recap: ['Which of those threads feels most worth returning to?', 'Has one of those topics become more important since you mentioned it?', 'Which detail from the conversation feels clearest to you now?', 'Where would you like the recap to lead next?'],
  };

  const questionTopics = new Set(['family', 'work', 'sleep', 'anxiety', 'sadness', 'anger', 'joy', 'loneliness', 'self_esteem', 'grief', 'motivation', 'relationship', 'health', 'school', 'money', 'feeling', 'reasoning', 'need']);
  const blendResponses = {
    blend_sleep_anxiety: ['Your restless nights and the worry seem to be feeding each other a little; noticing which one arrives first may give you a useful opening.', 'When sleep and worry travel together, the evening can feel much longer than it is. A gentler wind-down might be worth protecting.', 'The tiredness may be making the worry louder, while the worry keeps sleep out of reach. That is a tiring loop, not a personal failure.', 'There are two threads here - a body asking for rest and a mind staying on watch. We can look at either one first.'],
    blend_work_anger: ['The anger seems tied to what work is asking of you, not floating free of the situation.', 'When a work pressure keeps crossing a line, frustration can become its own daily workload.', 'It sounds as if the workplace problem is also taking a piece of your patience home with you.', 'There is a work problem and a boundary problem sitting close together here.'],
    blend_family_sadness: ['The sadness has a relationship-shaped edge to it, which may be why it keeps returning.', 'Family can make an ordinary disappointment feel unusually close to the heart.', 'There is both the event itself and what it says about belonging; those are different things to hold.', 'This sounds like a tender family thread rather than a passing bad mood.'],
    blend_loneliness_sleep: ['Quiet nights can make loneliness louder, and loneliness can make the night feel longer.', 'Your sleep and your sense of company seem to be touching the same quiet hours.', 'When the day goes still, both tiredness and wanting someone nearby may arrive together.', 'There may be a small evening ritual that gives those hours a little more warmth.'],
    blend_joy_gratitude: ['There is a lovely little loop here: something went well, and you noticed its value.', 'The good feeling seems to have made room for appreciation too.', 'It is nice when a bright moment is not rushed past before it can land.', 'This sounds like a moment worth letting stay bright for another minute.'],
  };

  const topicSeriousness = { safety: 1, professional_boundary: 0.9, grief: 0.9, health: 0.85, anxiety: 0.8, sadness: 0.8, anger: 0.75, loneliness: 0.75, family: 0.7, relationship: 0.7, sleep: 0.65, work: 0.65, money: 0.7, school: 0.6, self_esteem: 0.8, motivation: 0.6, feeling: 0.65, reasoning: 0.55, need: 0.55, joy: 0.25, gratitude: 0.2, greeting: 0.15, smalltalk_howareyou: 0.2, smalltalk_identity: 0.25, smalltalk_capability: 0.25, recap: 0.35, knowledge: 0.25 };
  const humor = ['Ha. Okay, I am officially charmed.', 'That made me smile.', 'Fair enough - I have no comeback for that.', 'I have to admit, that is a good one.', 'You are fun. I will not pretend otherwise.', 'Well, that was a delightful little plot twist.'];
  const warmth = ['That sounds like a lot to carry.', 'I can hear that this matters to you.', 'You do not have to have it all figured out at once.', 'It is okay to take your time with this.'];
  const smalltalk = ['Nice. That has a good bit of character to it.', 'That is a detail worth keeping.', 'I like the way you put that.', 'That gives the day a little color.'];
  const gratitudeResponses = ['Of course.', 'Anytime.', 'I am here.', 'That is kind of you to say.'];
  const topicShiftTemplates = ['That is a different thread from a moment ago, and it deserves its own space.', 'We have moved from one part of your day to another; I am with you.', 'This feels like a new angle on what has been going on.'];
  const recapTemplates = ['So far, {topics} have been part of the conversation, and {entities} stood out. Which thread feels most useful to pick up?', 'The short summary is: {topics}. You also brought up {entities}. Where would you like to go from here?', 'I have heard a few connected threads - {topics} - alongside {entities}. Which one is asking for your attention now?', 'The conversation has touched {topics}; {entities} gives it a more personal shape. What feels most present?'];
  const humanTouch = ['That {surface} detail is still with me; does it feel different now?', 'The {surface} thread has a little more to it than it first seemed.'];
  const professionalBoundary = ['For medical, legal, or financial decisions, a qualified human professional is the safest source of advice. I can help you organize the questions you want to bring them.', 'This is one of those areas where a licensed human professional should guide the decision. We can sort the facts and concerns you want to take with you.'];

  const selfAwareness = {
    approach: 'I use conversation patterns, short-term context, and careful response selection.',
    boundaries: 'I do not know current facts unless they are already in my offline knowledge shelf, and I do not make professional decisions for you.',
    memory: 'I remember selected details only within this browser tab, and I can revise a detail when you correct me.',
  };

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
    questionAcknowledgements,
    topicCallbacks,
    quotedCallbackTemplates,
    distressNudges,
    sentimentLexicon,
    pronounMap,
    familyTerms,
    professionTerms,
    placeWords,
    entityCallbackTemplates,
    topicSpecificQuestions,
    questionTopics,
    blendResponses,
    topicSeriousness,
    humor,
    warmth,
    smalltalk,
    gratitudeResponses,
    topicShiftTemplates,
    recapTemplates,
    humanTouch,
    professionalBoundary,
    selfAwareness,
    exitKeywords,
    greetings,
    greetingsOpen,
    greetingsInviting,
    greetingsReturning,
    // Compatibility aliases for the earlier misspelled pool names.
    greentingsOpen: greetingsOpen,
    greentingsInviting: greetingsInviting,
    greentingsReturning: greetingsReturning,
    farewells,
    emptyInputReply,
    foreignLanguageRedirect,
    repeatedGreetingResponses,
    spamNoiseResponses,
    ambiguousInputResponses,
    acknowledgementResponses,
    correctionResponses,
    topicChangeResponses,
    testInputResponses,
    mixedLanguageResponses,
    topicRecoveryResponses,
    emotionCalibration,
    ui: {
      appTitle: 'Darya · A Calm Conversation Companion',
      appDescription: 'Darya, an English-language conversation companion for listening and support.',
      placeholderDefault: "Write whatever's on your mind…",
      placeholderEnded: 'This conversation has ended. Choose "New chat" from the menu to start again.',
      ariaSendLabel: 'Send',
      ariaMenuLabel: 'Conversation',
      ariaInputLabel: 'Your message',
      ariaExportMdLabel: 'Download as Markdown',
      ariaExportTxtLabel: 'Download as plain text',
      // Canonical labels: aria-label === title === visible text
      pickerFaTitle: 'New Persian conversation',
      pickerEnTitle: 'New English conversation',
      themeOceanTitle: 'Ocean theme',
      themeBeachTitle: 'Beach theme',
      sendButtonTitle: 'Send',
      menuTriggerTitle: 'Menu',
      newChatTitle: 'New chat',
      exportMdTitle: 'Download as Markdown',
      exportTxtTitle: 'Download as plain text',
      themeToggleTitle: 'Switch theme',
      themeGroupLabel: 'Choose a theme',
      typingLabel: 'Darya is thinking',
      menuNewChat: 'New chat',
      menuExportMd: 'Download as Markdown',
      menuExportTxt: 'Download as plain text',
      themeOceanLabel: 'Ocean theme',
      themeBeachLabel: 'Beach theme',
      disclaimer: "Darya is a listening companion, not a substitute for professional help. In a crisis, please contact a professional or a crisis line.",
      foreignScriptHint: 'Please write in English so I can understand and support you.',
      exportTitle: `Conversation with ${BOT_NAME}`,
      exportYouLabel: 'You',
      exportDivider: '-----------------------------',
      dateLocale: 'en-US',
      connectionError: 'Something went wrong connecting. Please reload the page.',
      breatheTitle: 'Breathing exercise',
      breatheIn: 'Breathe in (4 counts)',
      breatheHold: 'Hold (7 counts)',
      breatheOut: 'Breathe out (8 counts)',
      breatheDismiss: 'Close',
      breatheOffer: 'Would you like to try a calming breathing exercise together?',
      breatheAccept: 'Yes, let us begin',
      breatheDecline: 'No, thank you',
      chatTitlePrefix: 'Conversation: ',
      anchorBtnLabel: 'Bookmark this message',
      anchorRemoveLabel: 'Remove bookmark',
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
