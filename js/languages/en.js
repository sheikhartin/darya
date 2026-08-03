/**
 * Darya classic script.
 */

(function (global) {
  'use strict';

  // Long lines in this file are intentional (embedded response pools,
  // regex patterns, and knowledge entries).
  /* eslint-disable max-len */

  // Load response pools from the data file.
  var R = global.DaryaEnResponses;

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
    rule(
      'safety',
      100,
      /\b(suicide|kill myself|self.?harm|hurt myself|end my life|don'?t want to live)\b/i,
      R['ruleSafety']
    ),

    // Greeting families mirror the user's greeting word back (hi -> Hi,
    // hello -> Hello, hey -> Hey). Each family also accepts a short tail
    // ("there", "darya", "friend", "my friend", "again") so "hi there"
    // and "hello Darya" get a warm greeting instead of a generic fallback,
    // and casual variants (hiya, howdy, yo, sup, whats up) route to the
    // nearest family pool. The tail is a fixed list, never free text, so
    // "hi how are you" still falls through to the how-are-you rule.
    rule(
      'greeting',
      65,
      /^(?:hi|hiya|howdy)(?:\s+(?:there|darya|dear|friend|my friend|again))?[!.?]*$/i,
      R['ruleGreetingHi']
    ),

    rule(
      'greeting',
      65,
      /^(?:hello)(?:\s+(?:there|darya|dear|friend|my friend|again))?[!.?]*$/i,
      R['ruleGreetingHello']
    ),

    rule(
      'greeting',
      65,
      /^(?:hey|yo|sup|wassup|whatsup|whats up|what's up)(?:\s+(?:there|darya|dear|friend|my friend|again))?[!.?]*$/i,
      R['ruleGreetingHey']
    ),

    rule(
      'greeting',
      65,
      /^(?:good morning)(?:\s+(?:there|darya|friend|again))?[!.?]*$/i,
      R['ruleGreetingGoodMorning']
    ),

    rule(
      'greeting',
      65,
      /^(?:good evening)(?:\s+(?:there|darya|friend|again))?[!.?]*$/i,
      R['ruleGreetingGoodEvening']
    ),

    rule(
      'greeting',
      65,
      /^(?:good afternoon)(?:\s+(?:there|darya|friend|again))?[!.?]*$/i,
      R['ruleGreetingGoodAfternoon']
    ),

    rule(
      'family',
      50,
      /\b(my (?:mom|mother|dad|father|parents|sister|brother|family))\b\s*(.*)/i,
      R['ruleFamily']
    ),

    rule(
      'work',
      50,
      /\b(my job|my work|my boss|my career|my coworker|got fired|got laid off)\b\s*(.*)/i,
      R['ruleWork']
    ),

    rule(
      'sleep',
      50,
      /\b(can'?t sleep|insomnia|nightmares|sleeping badly|trouble sleeping|waking up|wake up at night)\b\s*(.*)/i,
      R['ruleSleep']
    ),

    rule(
      'sadness',
      40,
      /\b(sad|down|depressed|heartbroken|crying|low)\b/i,
      R['ruleSadness']
    ),

    rule(
      'anxiety',
      40,
      /\b(anxious|anxiety|stressed|stress|scared|afraid|worried|panicking)\b/i,
      R['ruleAnxiety']
    ),

    rule(
      'anger',
      40,
      // "upset" needs an emotional context (i'?m upset, was upset,
      // upset with/about, feel(ing) upset, really/so upset) so physical
      // uses like "upset stomach" are not mistaken for anger.
      /\b(angry|furious|pissed off|mad at|so annoyed|irritated|frustrated|(?:i'?m|am|was|i'?ve been|feeling|feel|really|so|get|got)\s+upset|upset (?:with|about|by))\b/i,
      R['ruleAnger']
    ),

    rule(
      'joy',
      35,
      /\b(happy|glad|excited|thrilled|great news|feeling good)\b/i,
      R['ruleJoy']
    ),

    rule(
      'loneliness',
      40,
      /\b(lonely|alone|no one to talk to|nobody understands|isolated)\b/i,
      R['ruleLoneliness']
    ),

    rule(
      'self_esteem',
      40,
      /\b(worthless|not good enough|hate myself|no confidence|i'?m a failure)\b/i,
      R['ruleSelfEsteem']
    ),

    rule(
      'grief',
      45,
      /\b(lost my|passed away|passed away|death of|grieving|my .* died|bereavement|cope with\s+(?:\w+\s+)?loss)\b/i,
      R['ruleGrief']
    ),

    rule(
      'smalltalk_howareyou',
      60,
      /\b(how are you|how're you|how r u|how are u|how(?:'s| is) it going|how you doing)\b/i,
      R['ruleSmalltalkHowareyou']
    ),

    rule(
      'smalltalk_identity',
      60,
      /\b(who are you|what are you|are you (?:a )?(?:robot|bot|ai|real|human|person))\b/i,
      R['ruleSmalltalkIdentity']
    ),

    rule(
      'smalltalk_capability',
      60,
      /\b(what can you do|how can you help|what do you do|how do you work)\b/i,
      R['ruleSmalltalkCapability']
    ),

    // Off-topic playful questions ("Do you like pizza?", "What's the weather?")
    // Acknowledge playfully, then gently steer back to the user.
    rule(
      'smalltalk_silly',
      55,
      /\b(do you like|what do you think of|would you ever|have you ever|are you a|can you eat|do you eat|what\'s your favourite|what is your favorite|how old are you|where do you live|do you sleep)\b/i,
      R['ruleSmalltalkSilly']
    ),

    rule(
      'motivation',
      35,
      /\b(no motivation|can'?t get started|procrastinating|unmotivated|no energy to)\b/i,
      R['ruleMotivation']
    ),

    rule(
      'relationship',
      40,
      /\b(my (?:boyfriend|girlfriend|husband|wife|partner|fianc[eé])|we broke up|our relationship)\b\s*(.*)/i,
      R['ruleRelationship']
    ),

    rule(
      'health',
      35,
      /\b(i'?m sick|i'?m ill|in pain|my health|went to the doctor)\b/i,
      R['ruleHealth']
    ),

    rule(
      'mindfulness',
      40,
      /\b(mindfulness|meditation|meditate|mindful|breathing (?:exercise|technique)|present moment|be present|grounding|ground myself|in the moment|calm my mind|quiet my mind|clear my head|body scan|just breathe|focus on my breath|watching my thoughts|notice my thoughts|noticing my thoughts|being aware)\b/i,
      R['ruleMindfulness']
    ),

    rule(
      'stress',
      40,
      /\b(overwhelmed|burnout|burned out|can'?t cope|too much to handle|stressed out|under (?:so much|a lot of) pressure|at my limit|stretched (?:too )?thin|breaking point|mentally exhausted|drained|can'?t keep up|maxed out|running on empty|about to snap|can'?t take (?:it|this) anymore)\b/i,
      R['ruleStress']
    ),

    // The user asks Darya to say something more simply or more briefly
    // ("make it simpler", "keep it short"). Acknowledge warmly and commit
    // to a plainer register instead of falling through to a generic line.
    rule(
      'simplify',
      45,
      /\b(make it (?:simpler|simplest)|keep it (?:short|simple)|too (?:long|wordy|complicated)|more simply|say it (?:simply|shorter)|in simpler words|simpler and friendlier words|plain (?:english|words)|simplify it|less complicated)\b/i,
      R['ruleSimplify']
    ),

    // App and website feedback ("the beach theme looks broken", "the
    // waves are too small"): acknowledge warmly and steer back to the
    // conversation. The pattern is highly specific (UI/website words),
    // so it outranks the generic feeling/reasoning rules but stays below
    // knowledge so genuine emotional disclosures always win.
    rule(
      'app_feedback',
      32,
      /\b(website|web ?site|the app|this app|theme|design|interface|button|menu|font|icon|animation|waves?|beach|format)\b/i,
      R['ruleAppFeedback']
    ),

    rule(
      'gratitude',
      25,
      /\b(thanks?(?: a (?:lot|bunch|million))?|thank you(?: so much)?|thanks darya|thank you darya|i appreciate(?: you| it| that)|grateful for you|much appreciated|many thanks|appreciate it|you'?re a (?:lifesaver|star|legend)|i owe you(?: one)?)\b/i,
      R['ruleGratitude']
    ),

    rule(
      'school',
      35,
      /\b(exam|exams|final(?:s)?|college|university|my grades|my professor)\b/i,
      R['ruleSchool']
    ),

    rule(
      'money',
      35,
      /\b(no money|financial (?:trouble|problems)|in debt|can'?t afford|bills)\b/i,
      R['ruleMoney']
    ),

    rule(
      'feeling',
      30,
      /\b(?:i feel|i think|i believe)\s+(.*)/i,
      R['ruleFeeling']
    ),

    rule('reasoning', 25, /\bbecause\s+(.*)/i, R['ruleReasoning']),

    rule('need', 25, /\b(?:i need|i want|i wish i had)\s+(.*)/i, R['ruleNeed']),

    // The user asks what a word means ("what does 'bidding farewell'
    // mean?"). Answer warmly without pretending to be a dictionary: name
    // the word back and turn it into a conversation. "What does life
    // mean" and "what does that/this/it mean" are excluded - those ask
    // for a philosophy take or for Darya to clarify her own words.
    // Two shapes are accepted so both "what does X mean" and the more
    // conversational "do you know what X means?" route to the same pool;
    // captured picks the last populated group either way. Both
    // alternatives are end-anchored and pronouns are excluded, so
    // "what does he mean by that" can never false-match.
    rule(
      'word_meaning',
      58,
      /^(?:do you know )?what does (?!life\b|that\b|this\b|it\b|he\b|she\b|they\b|you\b|we\b)(.+?)\s+mean(?:s)?[!?.]*$|^do you know what (.+?)\s+mean(?:s)?[!?.]*$/iu,
      R['ruleWordMeaning']
    ),

    // The user asks Darya to ask them a question ("ask me a question",
    // "why don't you ask?"). Darya complies with a real, gentle question.
    rule(
      'ask_me_question',
      58,
      /\b(?:ask me a question|ask me something|why (?:don'?t|do not|didn'?t) you ask|ask away|you should ask me)\b/i,
      R['ruleAskMeQuestion']
    ),

    // The user tells Darya to improve herself ("make yourself better",
    // "become smarter"). Acknowledge humbly instead of deflecting with
    // humor or a generic line.
    rule(
      'self_improvement',
      55,
      /(?<![\p{L}])(?:make yourself (?:better|smarter|wiser)|become (?:smarter|better|wiser|more intelligent)|improve yourself|upgrade yourself|be (?:smarter|better|wiser)|learn more)(?![\p{L}])/iu,
      R['ruleSelfImprovement']
    ),

    // "What should I do?" answers the help-seeking intent directly
    // instead of being swallowed by a topic rule or an evasive fallback.
    rule(
      'what_do_i_do',
      52,
      /\b(?:what should i do|what do i do|what can i do about|what am i supposed to do|what am i going to do|give me (?:a )?solution|is there any solution)\b/i,
      R['ruleWhatDoIDo']
    ),

    // The user answers "yes but I do not know which one" after Darya
    // offered several topics. Gently help them pick.
    rule(
      'unsure_topic',
      52,
      /\b(?:not sure which|do not know which|don'?t know which|i (?:can'?t|can not) decide)\b/i,
      R['ruleUnsureTopic']
    ),

    rule(
      'knowledge',
      55,
      /\b(?:socrates|stoic|stoicism|aristotle|jung|nietzsche|gandhi|mandela|churchill|zarathustra|philosophy|focus|concentrate|study better|learn better|communicate better|communication advice|creative block|be more creative|stress management|burnout|overwhelmed|calm down|self compassion|self-compassion|inner critic|be kind to myself|self care|conflict resolution|argument|disagreement|nonviolent communication|nvc|decision making|make a choice|choose between|important decision|resilience|resilient|bounce back|forgive|forgiveness|letting go|let it go|purpose|meaning of life|meaningful|existential|relationship advice|relationships|connection|relating to|career|career change|professional growth|job satisfaction|work life balance|anxiety|anxiety management|manage worry|overthinking|grief)\b/i,
      R['ruleKnowledge']
    ),

    rule(
      'professional_boundary',
      90,
      /\b(?:medical advice|diagnosis|medication|legal advice|lawyer|court|financial advice|investing|tax advice|loan advice)\b/i,
      R['ruleProfessionalBoundary']
    ),

    rule(
      'recap',
      80,
      /\b(?:what did i say earlier|what have i said|can you summarize|summarize this|give me a recap)\b/i,
      R['ruleRecap']
    ),

    rule('affirmation', 15, /^(yes|yeah|yep)\.?$/i, R['ruleAffirmation']),

    rule('negation', 15, /^(no|nope|nah)\.?$/i, R['ruleNegation'])
  ];

  // Short auxiliary/filler fragments that are grammatically meaningless on
  // their own if left over from a capture group (mirrors the Persian
  // trivial-copula list, adapted to English's own filler words).
  const trivialCaptures = new Set([
    'am',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'it',
    'that',
    'this',
    'so',
    'really',
    'just',
    'very'
  ]);

  // Vocabulary for the language-neutral named-entity extractor. Terms are
  // intentionally conversational and are remembered only on an emotional
  // turn, never as a complete transcript or profile.
  const familyTerms = [
    'mother',
    'mom',
    'father',
    'dad',
    'grandmother',
    'grandfather',
    'sister',
    'brother',
    'husband',
    'wife',
    'partner',
    'fiancé',
    'fiancee',
    'boyfriend',
    'girlfriend',
    'family',
    'parents',
    'child',
    'daughter',
    'son'
  ];
  const professionTerms = [
    'job',
    'work',
    'boss',
    'career',
    'coworker',
    'school',
    'college',
    'university',
    'exam',
    'professor',
    'doctor',
    'project',
    'meeting',
    'office',
    'student'
  ];
  const placeWords = [
    'home',
    'house',
    'room',
    'school',
    'college',
    'university',
    'office',
    'city',
    'town',
    'park',
    'hospital',
    'here',
    'there',
    'Tehran',
    'London'
  ];

  const entityCallbackTemplates = {
    person: [
      'That {surface} thread is still with us. Its place in your day seems worth noticing.'
    ],
    place: [
      'The place you named, {surface}, still seems relevant to the shape of this story.'
    ],
    time: [
      'That {surface} timing detail gives this some shape and keeps the moment specific.'
    ],
    activity: [
      'The {surface} part of the story seems important and worth keeping in view.'
    ],
    object: [
      'That {surface} detail is still present and gives the story a particular texture.'
    ]
  };

  // Periodic conversational check-ins: after a few turns without a clear
  // topic match, Darya offers a light process check-in to take stock of
  // the conversation so far.

  // Matches question marks and common question-word sentence openers, so
  // the engine can tell an interrogative sentence apart from a statement
  // even when a specific rule doesn't cover what's being asked.
  const questionPattern =
    /\?|^\s*(what|why|how|who|when|where|which|do|does|did|is|are|am|can|could|will|would|should)\b/i;

  // A safe, low-risk callback: quoting the person's own earlier words back
  // to them is a core reflective-listening technique and carries no
  // grammar risk, since their words are inserted verbatim.

  // Gentle, optional coping offer shown when several consecutive messages
  // read as emotionally heavy. Not a diagnosis, not a substitute for
  // professional support, just a caring pause and a well-known,
  // low-risk grounding technique (paced breathing).

  // Simple, well-known ELIZA-style pronoun reflection. English's pronoun
  // morphology is simple enough (unlike Persian's verb-carried person
  // marking) that a careful word-swap stays grammatical for short,
  // straightforward sentences. See the guard conditions in
  // responder.js (word-count cap, "only if a swap actually happened").
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
    am: 'are'
  };

  const exitKeywords = [
    'bye',
    'goodbye',
    'see you later',
    'see ya',
    'talk to you later',
    'catch you later',
    'gotta go',
    'i have to go',
    'i need to go',
    'i must go',
    'take care',
    'bye for now',
    'exit',
    'quit'
  ];

  // Phase 1 (warm presence): the very first greeting should establish Darya
  // as a calm, non-judgmental presence with a gentle opening.

  // Phase 2 (gentle orientation): the first follow-up turn offers a
  // light, low-pressure binary choice without asking for deep emotions.

  // Repeated greeting reset: when the user types the same greeting multiple
  // times without answering the previous question, Darya gently breaks the
  // loop by acknowledging the pattern and inviting a fresh start.

  // Named-word repetition: when the user repeats a specific word 4+ times
  // across recent utterances, Darya explicitly names the repeated word
  // rather than using a generic synonym. {word} and {count} are replaced
  // by the engine at runtime.

  // Frustration signal responses: used when the user types multiple
  // consecutive exclamation marks ("!!!"), question marks ("???"),
  // or uses insulting language. Darya responds with extra calmness.

  // Spam / keyboard-smash responses: for very short, repetitive, or random
  // input (e.g. "asdasd", "dddd", pure digits), Darya replies with a gentle
  // non-judgmental response rather than treating it as meaningful input.

  // Ambiguous input responses: for very short inputs (1-2 words, <10 chars)
  // that don't match any rule and are too brief to infer intent (e.g. just
  // "خوب" or "nice"). These responses gently invite elaboration.

  // Short acknowledgement responses: when the user gives a brief
  // non-substantive reply (1-2 words like "ok", "yeah", "باشه") after being
  // asked a question, Darya gently repeats or rephrases instead of
  // treating it as a complete answer.

  // Teasing or mocking detection: when the user sends sarcastic praise
  // ("you're so smart!!!"), mock agreement ("sure, bot"), or dismissive
  // signals, Darya responds with gentle understanding instead of treating
  // sarcasm as genuine engagement.

  const wellBeingPattern =
    /\b(?:how (?:are you|are you doing|you doing|have you been)|you (?:ok|alright|good|doing okay)|what about you)\b/i;

  const insultPattern =
    /\b(?:stupid|dumb|idiot|moron|foolish|retard|dummy|loser|jerk|ass(?:hole|hat|bag|clown|face|wipe)?|arse(?:hole)?|bitch(?:ing)?|bastard|bullshit|shit(?:head|hole|ty|fuck)?|dipshit|shite|crap(?:head|py)?|damn|goddamn(?:it)?|dick(?:head|wad)?|prick|knob(?:head)?|twat|wanker|tosser|cock(?:sucker)?|cunt|fuck(?:er|ing|tard|wit|face|nut|ed)?|motherfucker|dumbfuck|shitfuck|horseshit|piss(?:ant|ed off)?|slut|whore|skank|slag|scum(?:bag)?|jackass|dumbass|douche(?:bag)?|bugger|bollocks|screw|disgusting|despicable|contemptible|vile|obnoxious|repulsive|pathetic|useless|ignorant|worthless|hopeless|wretched|you suck|you (?:are )?(?:an? )?(?:ass|idiot|moron|joke|fool|cretin|bastard|bitch|dick|dumbass|fucker|loser|pathetic|worthless|piece of shit|jerk|cunt|twat|wanker|stupid|dumb))\b/i;

  // Date/time question patterns for the _handleDateTimeQuestion engine
  // method. Time queries: asking the current time. Date queries: asking
  // the current date (Gregorian). Both trigger the Intl-based answer.
  const dateTimeTimePattern =
    /\b(what('?s| time) (is it|do you have)|tell me the time|what time is it now|current time|time now)\b/i;

  const dateTimeDatePattern =
    /\b(what('?s| is) (the date|today(?:'s date)?|the day(?: today)?)|what day is it|tell me the date|what is today(?:'s date)?|what date is it|whats today)\b/i;

  // Darya-targeted harassment: insults and name-calling directed at
  // Darya specifically (using her name or "you" with degrading labels).
  // These are distinct from general insults in insultPattern because
  // they target the companion and need a different response tone.
  const daryaHarassmentPattern =
    /\b(darya(?:,| |\s)+you(?:'?re| are)?(?:\s+(?:a |an )?)?(?:stupid|dumb|idiot|moron|useless|pathetic|annoying|worthless|bitch|bastard|whore|slut|cunt|loser|joke|fool|creep|psycho|insane|crazy|terrible|awful|horrible|bad)|you(?:'?re| are)?\s+darya\b|(?:fuck|screw|damn)\s+(?:you|darya)\b|shut\s+up(?:\s+(?:darya|bot))?|i hate you|i hate darya|darya is\s+(?:stupid|dumb|useless|pathetic|annoying|the worst|terrible|awful|bad)|you suck(?:\s+darya)?|darya sucks)\b/i;

  // Sexual or inappropriate comments directed at Darya. These set a
  // firm boundary even before the general insult override fires.
  // (Note: this is not a comprehensive filter; it catches the most
  // common patterns while avoiding false positives in everyday speech.)
  const sexualHarassmentPattern =
    /\b(?:show me your (?:tits|ass|pussy|dick|breasts|nipples|naked body)|i want to (?:fuck|screw) (?:you|darya)|suck my (?:dick|cock|balls)|eat my (?:ass|pussy)|lick my (?:ass|pussy|dick|cock)|naked(?:\s+darya)?|undress(?:\s+(?:me|darya))?|strip(?:\s+(?:for|me))?|your (?:tits|boobs|ass|pussy|dick|cock|breasts|nipples)|horny(?:\s+darya)?|darya is (?:sexy|hot|horny)|you are (?:sexy|hot|horny) darya|blowjob|handjob|69|anal|bondage|bdsm)\b/i;

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
    unsure_topic: 0.25
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

  const en = {
    code: 'en',
    dir: 'ltr',
    botName: BOT_NAME,
    scriptRange: SCRIPT_RANGE,
    minScriptRatio: 0.85,
    normalize,
    rules,
    trivialCaptures,
    genericFallbacks: R.genericFallbacks,
    strategyShiftFallbacks: R.strategyShiftFallbacks,
    sessionCheckIns: R.sessionCheckIns,
    checkInEvery: 8,
    questionPattern,
    questionFallbacks: R.questionFallbacks,
    questionAcknowledgements: R.questionAcknowledgements,
    topicCallbacks: R.topicCallbacks,
    quotedCallbackTemplates: R.quotedCallbackTemplates,
    distressNudges: R.distressNudges,
    sentimentLexicon: R.sentimentLexicon,
    pronounMap,
    familyTerms,
    professionTerms,
    placeWords,
    entityCallbackTemplates,
    topicSpecificQuestions: R.topicSpecificQuestions,
    questionTopics,
    blendResponses: R.blendResponses,
    topicSeriousness,
    humor: R.humor,
    warmth: R.warmth,
    smalltalk: R.smalltalk,
    emojiResponses: R.emojiResponses,
    gratitudeResponses: R.gratitudeResponses,
    topicShiftTemplates: R.topicShiftTemplates,
    recapTemplates: R.recapTemplates,
    humanTouch: R.humanTouch,
    professionalBoundary: R.professionalBoundary,
    selfAwareness,
    exitKeywords,
    exitConfirmMessages: R.exitConfirmMessages,
    greetings: R.greetings,
    greetingsPhase1: R.greetingsPhase1,
    greetingsPhase2: R.greetingsPhase2,
    greetingsOpen: R.greetingsOpen,
    greetingsInviting: R.greetingsInviting,
    greetingsReturning: R.greetingsReturning,
    // Compatibility aliases for the earlier misspelled pool names.
    greentingsOpen: R.greetingsOpen,
    greentingsInviting: R.greetingsInviting,
    greentingsReturning: R.greetingsReturning,
    farewells: R.farewells,
    emptyInputReply: R.emptyInputReply,
    engineErrorReply: R.engineErrorReply,
    foreignLanguageRedirect,
    repeatedGreetingResponses: R.repeatedGreetingResponses,
    wordRepetitionResponses: R.wordRepetitionResponses,
    frustrationResponses: R.frustrationResponses,
    factualQuestionFollowups: R.factualQuestionFollowups,
    spamNoiseResponses: R.spamNoiseResponses,
    ambiguousInputResponses: R.ambiguousInputResponses,
    acknowledgementResponses: R.acknowledgementResponses,
    correctionResponses: R.correctionResponses,
    topicChangeResponses: R.topicChangeResponses,
    teasingMockingResponses: R.teasingMockingResponses,
    stopWords,
    boredomResponses: R.boredomResponses,
    wellBeingPattern,
    insultPattern,
    wellBeingResponses: R.wellBeingResponses,
    testInputResponses: R.testInputResponses,
    mixedLanguageResponses: R.mixedLanguageResponses,
    topicRecoveryResponses: R.topicRecoveryResponses,
    dateTimeTimePattern,
    dateTimeDatePattern,
    daryaHarassmentPattern,
    sexualHarassmentPattern,
    // English test-input signals beyond the engine's built-in
    // TEST_INPUT_PATTERNS (which already covers "test", "hello bot",
    // "ping" etc.). Catches explicit "I am just testing you" phrasing.
    testInputPattern:
      /(?:i am just testing|i'?m just testing|just testing you|testing the bot|are you testing me)/iu,
    dateTimeFollowups: R.dateTimeFollowups,
    daryaHarassmentResponses: R.daryaHarassmentResponses,
    sexualHarassmentResponses: R.sexualHarassmentResponses,
    emotionCalibration: R.emotionCalibration,
    ui: {
      appTitle: 'Darya · A Calm Conversation Companion',
      appDescription:
        'Darya, an English-language conversation companion for listening and support.',
      placeholderDefault: "Write whatever's on your mind…",
      placeholderEnded:
        'This conversation has ended. Choose "New chat" from the menu to start again.',
      ariaInputLabel: 'Your message',
      // Canonical labels: aria-label === title === visible text
      pickerFaTitle: 'New Persian conversation',
      pickerEnTitle: 'New English conversation',
      themeOceanTitle: 'Ocean theme',
      themeBeachTitle: 'Beach theme',
      sendButtonTitle: 'Send',
      menuTriggerTitle: 'Menu',
      newChatTitle: 'New chat',
      themeGroupLabel: 'Choose a theme',
      typingLabel: 'Darya is thinking',
      menuNewChat: 'New chat',
      menuExportLabel: 'Download conversation',
      menuExportTitle: 'Download conversation',
      themeOceanLabel: 'Ocean theme',
      themeBeachLabel: 'Beach theme',
      disclaimer:
        'Darya is a listening companion, not a substitute for professional help. In a crisis, please contact a professional or a crisis line.',
      foreignScriptHint:
        'Please write in English so I can understand and support you.',
      exportTitle: `Conversation with ${BOT_NAME}`,
      exportYouLabel: 'You',
      exportDivider: '-----------------------------',
      dateLocale: 'en-US',
      breatheTitle: 'Breathing exercise',
      breatheIn: 'Breathe in',
      breatheHold: 'Hold',
      breatheOut: 'Breathe out',
      breatheDismiss: 'Close',
      exitConfirmBarLabel: 'Do you want to end this conversation?',
      exitConfirmBarYes: 'Yes, end it',
      exitConfirmBarNo: 'No, continue',
      newChatConfirmTitle: 'Are you sure?',
      newChatConfirmDesc:
        'Starting a new conversation will permanently delete the current one. It cannot be recovered.',
      newChatConfirmYes: 'Yes, start new',
      newChatConfirmNo: 'Cancel',
      soundOnTitle: 'Ambient sound: on',
      soundOffTitle: 'Ambient sound: off',
      soundAutoplayBlockedMsg:
        'Ambient sound could not start automatically. Tap the sound icon in the menu to enable it.',
      soundFallbackMsg:
        'Ambient sound files could not be loaded. Using a generated ambient instead.',
      engineErrorHint: 'A minor issue occurred. The conversation can continue.',
      notificationError: 'Error',
      notificationWarning: 'Warning',
      notificationInfo: 'Info',
      notificationDismiss: 'Dismiss notification'
    }
  };

  global.DaryaEn = en;
})(typeof window !== 'undefined' ? window : globalThis);
