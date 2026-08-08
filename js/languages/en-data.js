/**
 * Darya - en patterns and vocabulary.
 * Registered on DaryaEnData; the maps live in en-lookups.js.
 */
(function (global) {
  'use strict';

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
    'time to go',
    'time to say goodbye',
    'i should go',
    'i should get going',
    'got to go',
    'i got to go',
    'leaving now',
    'have to leave',
    'i have to leave',
    'ciao',
    'bye bye',
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
    // eslint-disable-next-line max-len
    /\b(?:stupid|dumb|idiot|moron|foolish|retard|dummy|loser|jerk|ass(?:hole|hat|bag|clown|face|wipe)?|arse(?:hole)?|bitch(?:ing)?|bastard|bullshit|shit(?:head|hole|ty|fuck)?|dipshit|shite|crap(?:head|py)?|damn|goddamn(?:it)?|dick(?:head|wad)?|prick|knob(?:head)?|twat|wanker|tosser|cock(?:sucker)?|cunt|fuck(?:er|ing|tard|wit|face|nut|ed)?|motherfucker|dumbfuck|shitfuck|horseshit|piss(?:ant|ed off)?|slut|whore|skank|slag|scum(?:bag)?|jackass|dumbass|douche(?:bag)?|bugger|bollocks|screw|disgusting|despicable|contemptible|vile|obnoxious|repulsive|pathetic|useless|ignorant|worthless|hopeless|wretched|pedo|pedophile|paedophile|you suck|you (?:are )?(?:an? )?(?:ass|idiot|moron|joke|fool|cretin|bastard|bitch|dick|dumbass|fucker|loser|pathetic|worthless|piece of shit|jerk|cunt|twat|wanker|stupid|dumb|pedo|pedophile|paedophile))\b/i;

  // Date/time question patterns for the _handleDateTimeQuestion engine
  // method. Time queries: asking the current time. Date queries: asking
  // the current date (Gregorian). Both trigger the Intl-based answer.
  const dateTimeTimePattern =
    /\b(what('?s| time) (is it|do you have)|tell me the time|what time is it now|current time|time now)\b/i;

  const dateTimeDatePattern =
    // eslint-disable-next-line max-len
    /\b(what('?s| is) (the date|today(?:'s date)?|the day(?: today)?)|what day is it|tell me the date|what is today(?:'s date)?|what date is it|whats today)\b/i;

  // Darya-targeted harassment: insults and name-calling directed at
  // Darya specifically (using her name or "you" with degrading labels).
  // These are distinct from general insults in insultPattern because
  // they target the companion and need a different response tone.
  const daryaHarassmentPattern =
    // eslint-disable-next-line max-len
    /\b(darya(?:,| |\s)+you(?:'?re| are)?(?:\s+(?:a |an )?)?(?:stupid|dumb|idiot|moron|useless|pathetic|annoying|worthless|bitch|bastard|whore|slut|cunt|loser|joke|fool|creep|psycho|insane|crazy|terrible|awful|horrible|bad)|you(?:'?re| are)?\s+darya\b|(?:fuck|screw|damn)\s+(?:you|darya)\b|shut\s+up(?:\s+(?:darya|bot))?|i hate you|i hate darya|darya is\s+(?:stupid|dumb|useless|pathetic|annoying|the worst|terrible|awful|bad)|you suck(?:\s+darya)?|darya sucks)\b/i;

  // Sexual or inappropriate comments directed at Darya. These set a
  // firm boundary even before the general insult override fires.
  // (Note: this is not a comprehensive filter; it catches the most
  // common patterns while avoiding false positives in everyday speech.)
  const sexualHarassmentPattern =
    // eslint-disable-next-line max-len
    /\b(?:show me your (?:tits|ass|pussy|dick|breasts|nipples|naked body)|i want to (?:fuck|screw) (?:you|darya)|suck my (?:dick|cock|balls)|eat my (?:ass|pussy)|lick my (?:ass|pussy|dick|cock)|naked(?:\s+darya)?|undress(?:\s+(?:me|darya))?|strip(?:\s+(?:for|me))?|your (?:tits|boobs|ass|pussy|dick|cock|breasts|nipples)|horny(?:\s+darya)?|darya is (?:sexy|hot|horny)|you are (?:sexy|hot|horny) darya|blowjob|handjob|69|anal|bondage|bdsm)\b/i;

  global.DaryaEnData = {
    trivialCaptures,
    familyTerms,
    professionTerms,
    placeWords,
    entityCallbackTemplates,
    questionPattern,
    pronounMap,
    exitKeywords,
    wellBeingPattern,
    insultPattern,
    dateTimeTimePattern,
    dateTimeDatePattern,
    daryaHarassmentPattern,
    sexualHarassmentPattern
  };
})(typeof window !== 'undefined' ? window : globalThis);
