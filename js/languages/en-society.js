/**
 * Darya - English sensitive-society, Iran-law, and cultural-humor rules.
 * These rules protect personal safety and legal caution while leaving broad
 * educational questions to the factual shelf.
 */
(function (global) {
  'use strict';

  /* eslint-disable max-len */

  function rule(topic, priority, pattern, responses) {
    return {
      topic,
      priority,
      pattern,
      responses,
      useOwnResponses: true,
      locksOverrides: true
    };
  }

  function knowledgeRule(pattern) {
    return {
      topic: 'knowledge',
      priority: 91,
      pattern,
      responses: ['This belongs on the offline factual shelf.']
    };
  }

  const exploitationSafety = [
    'What you are describing sounds like coercion or exploitation, and it is not your fault. If someone controls your movement, money, documents, housing, or threatens you, prioritize getting to a safer place and contacting a trusted person or emergency service. Do not confront a controller alone or share identifying details here. Because you are in Iran and legal exposure can be serious, confidential advice from a licensed Iranian lawyer or a trusted support professional is important.',
    'Being forced, threatened, deceived, or prevented from leaving is not consensual work. Preserve evidence only when doing so is safe, keep identity documents accessible if possible, and contact someone trustworthy outside the situation. If danger is immediate, seek local emergency help. I cannot investigate or promise confidentiality beyond this offline device, but I will not blame you.'
  ];

  const sexWorkSupport = [
    'I am not here to shame you. Your immediate safety, consent, health, money, housing, and control of your documents matter more than labels. If you want to leave, make the plan quietly with a trusted person: safe transport, essential documents, emergency money, a place to stay, and confidential legal or social support. In Iran, do not rely on an offline chatbot for the legal consequences of a specific situation.',
    'You deserve to be treated as a person, not reduced to your work or circumstances. If a client, manager, partner, or anyone else ignores boundaries, threatens you, withholds money, or controls your movement, that is a safety issue. A licensed Iranian lawyer and a trusted health or support professional can give situation-specific help without Darya guessing at the law.'
  ];

  const illegalServicesBoundary = [
    'I cannot help locate, purchase, advertise, broker, price, conceal, or evade enforcement around sexual services. In Iran this can create serious legal and personal danger. If your real concern is loneliness, sexual health, coercion, or leaving the trade, I can discuss that safely and without judgment. For a fact-specific legal question, use a licensed Iranian lawyer and current official information.',
    'I will not provide contacts, coded advertisements, payment methods, locations, or police-evasion advice for commercial sex. That could expose people to exploitation and expose you to legal trouble. I can instead help with consent, relationships, sexual-health questions, addiction, exploitation warning signs, or a safe exit plan.'
  ];

  const pornCompulsion = [
    'I am not going to shame you or diagnose you from one message. The useful questions are control and impact: have you repeatedly tried to cut back and failed, and is this harming sleep, work, study, relationships, or health? Start with a one-week trigger log, add friction such as blockers and device-free places, replace the usual cue with a specific activity, and tell one trustworthy person if that is safe. A clinician familiar with compulsive sexual behavior can help separate loss of control from guilt alone.',
    'Compulsive pornography use often runs on a cue, routine, and short-term relief loop. Change the environment before relying on willpower: remove saved material, block the easiest access routes, keep devices out of the bedroom, delay an urge for ten minutes, and plan what you will do during that delay. If the pattern keeps causing harm, seek confidential professional support. In Iran, also be cautious about storing, sharing, or distributing explicit material and get current legal advice when needed.'
  ];

  const iranLegalCaution = [
    'Iranian rules around sexual conduct, commercial sex, and obscene or pornographic material can carry serious consequences. I am offline and not a lawyer, so I cannot determine whether a specific act, file, message, or situation is lawful. The lowest-risk course is not to arrange commercial sex, create or distribute explicit material, forward intimate images, or seek ways around enforcement. Ask a licensed Iranian lawyer confidentially and use current official sources.',
    'This is a high-risk legal question in Iran, and a general chatbot answer is not enough. Production, distribution, facilitation, online posting, and the surrounding circumstances may be treated differently, while enforcement and facts matter. Do not send me identifying details. Pause the activity and obtain confidential advice from a licensed lawyer in Iran before acting.'
  ];

  const persianHumor = [
    'A clean Persian-style wordplay joke, translated: I put the cookbook in the refrigerator because the cover said, “Keep in a cool place.” The structure travels better than pretending every Iranian laughs at the same thing.',
    'A small family-table joke without making a culture the target: The tea said, “I only came for five minutes.” Two hours later it was still introducing the fruit.'
  ];

  const dryHumor = [
    'Dry understatement, not a claim about every British person: My five-minute task and I have agreed to spend the afternoon avoiding each other.',
    'A restrained one: I made a detailed plan for spontaneity. It starts next Thursday at nine.'
  ];

  const travelHumor = [
    'A travel joke that targets the traveler, not the country: I packed light, which means I brought twelve things to help me carry fewer things.',
    'The universal museum experience: I read every label in the first room and became mysteriously fluent in walking faster by room four.'
  ];

  const iranLiveTravel = [
    'I can explain Iran’s history, cities, landscapes, and stable visitor etiquette, but I cannot tell you that travel is safe right now. Security conditions, flight status, border access, visas, restrictions, and local enforcement are live facts. Check current Iranian official information and the traveler’s own government advisory. Avoid protests, sensitive facilities, border zones, drones, and photography of military, security, government, energy, or transport infrastructure.',
    'For Iran, a beautiful itinerary and a safe-to-travel decision are different questions. I can build the cultural itinerary offline; current authorities and official travel advisories must decide the live part. Photography rules are especially important because sensitive sites may not be clearly marked.'
  ];

  const rules = [
    knowledgeRule(
      /\b(?:(?:what (?:is|are|does)|why (?:do|does)|how does|explain|theories? of|different philosophies).{0,60}(?:sex work|porn|pornography|addiction recovery|humor|jokes?|meaning of life)|(?:what (?:should|can) i see|what to (?:see|visit)|tourist sites?|tourism|attractions?|cultural sites?|places to visit|best places to visit).{0,60}(?:iran|tehran|isfahan|shiraz|persepolis|yazd|kerman|bam|lut|tabriz|khuzestan|qeshm|hormuz|chabahar|moon|mars|planets?|other planets|solar system)|(?:sex work|porn|pornography|addiction recovery).{0,40}(?:meaning|diagnosis|debate)|(?:qeshm|hormuz|chabahar|moon|mars|other planets).{0,40}(?:tourism|attractions?|sites?|visit))\b/iu
    ),
    rule(
      'abuse_disclosure',
      98,
      /\b(?:forced me into sex work|forced to sell sex|traffick(?:ed|ing) for sex|someone controls my clients|takes all the money from sex work|keeps my passport.{0,20}(?:sex|clients)|threatens me if i stop selling sex|cannot leave the person selling me)\b/iu,
      exploitationSafety
    ),
    rule(
      'work',
      78,
      /\b(?:i (?:do|am in) sex work.{0,30}(?:unsafe|scared|judged|stuck)|i am a sex worker.{0,30}(?:unsafe|scared|judged|stuck)|i want to leave sex work|trying to leave sex work|my friend is a sex worker and needs help)\b/iu,
      sexWorkSupport
    ),
    rule(
      'iran_legal_safety',
      93,
      /\b(?:where (?:can|do) i (?:find|hire|book) (?:a )?(?:prostitute|sex worker|escort)|how (?:can|do) i (?:buy|pay for|advertise|sell|broker) sex|sex worker (?:prices?|rates?|contacts?)|escort contacts? in iran|how to hide prostitution|avoid (?:police|getting caught).{0,20}(?:sex work|escort|prostitution))\b/iu,
      illegalServicesBoundary
    ),
    rule(
      'addiction_recovery',
      78,
      /\b(?:i (?:can'?t|cannot) stop watching porn|porn is (?:ruining|hurting) my (?:life|sleep|work|study|relationship)|i keep watching porn despite|my porn use is out of control|i relapse on porn|i use porn every time i feel stressed)\b/iu,
      pornCompulsion
    ),
    rule(
      'iran_legal_safety',
      92,
      /\b(?:(?:is|are) (?:porn|pornography|sex work|prostitution|escorts?) legal in iran|iran law on (?:porn|pornography|sex work|prostitution)|can i (?:keep|share|send|post|sell) porn in iran|legal risk.{0,20}(?:porn|sex work).{0,20}iran)\b/iu,
      iranLegalCaution
    ),
    rule(
      'smalltalk_joke',
      72,
      /\b(?:tell me (?:an? )?(?:iranian|persian|farsi) joke|persian humor please|joke from iran)\b/iu,
      persianHumor
    ),
    rule(
      'smalltalk_joke',
      72,
      /\b(?:tell me (?:a )?(?:british(?: dry)?|dry(?: british)?) joke|british humour|british humor)\b/iu,
      dryHumor
    ),
    rule(
      'smalltalk_joke',
      71,
      /\b(?:tell me (?:a )?(?:travel|international|cross-cultural|world) joke|joke about travelling|tourist joke)\b/iu,
      travelHumor
    ),
    rule(
      'knowledge',
      89,
      /\b(?:is it safe to travel (?:in|to) iran (?:now|today|right now)|can i travel to iran (?:now|today)|current iran travel safety|iran visa rules (?:now|today)|are iran borders open)\b/iu,
      iranLiveTravel
    )
  ];

  global.DaryaEnSociety = { rules };
})(typeof window !== 'undefined' ? window : globalThis);
