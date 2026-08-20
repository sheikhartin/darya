/**
 * Darya - global English slang and age-context language data.
 *
 * Recognition spans several English-speaking cultures and internet
 * registers. Darya interprets these forms but answers in clear neutral
 * English, never impersonating a speaker from a culture or age group.
 * Slang changes quickly, so each glossary reply names its register and
 * keeps context open instead of claiming one universal meaning.
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

  const responses = {
    overwhelm: [
      'That sounds like the exhausted kind of “cooked,” not a cooking problem. Let us shrink the load: what is the one thing that truly has to happen next?',
      'You sound spent and overloaded. Before solving the whole mess, which pressure is loudest right now?'
    ],
    schoolOverwhelm: [
      'That sounds like the exam went badly or felt beyond saving. One rough paper is data, not a verdict on you. Do you want to unpack what failed or plan the next move?',
      'That exam sounds rough. Give yourself a minute before turning it into a story about your ability; what part caught you off guard?'
    ],
    exhaustion: [
      'You sound properly exhausted. Is this one brutal day, or has your energy been running low for a while?',
      'That is more than ordinary tiredness. What can come off your plate before you ask your body for another push?'
    ],
    disappointment: [
      '“Gutted” sounds right here: that rejection landed hard. What did you hope would happen?',
      'That is a real disappointment, not an unknown topic. Do you want to sit with the sting or work out what comes next?'
    ],
    lowEnergy: [
      'A bed-rotting day can be deliberate rest or a sign that starting anything feels impossible. Which is it today?',
      'No shame in needing rest. If you feel stuck rather than restored, try one reset under five minutes: water, daylight, or a shower. Which feels possible?'
    ],
    moneyPressure: [
      'Being broke before payday turns every small cost into mental noise. Let us triage without shame: what must be paid first, and what can wait or be negotiated?',
      'Money pressure can make the whole week feel narrow. We can sort essentials, deadlines, and one person or service you could contact before a payment is missed.'
    ],
    frustration: [
      'I hear that you are fed up, not introducing a new mystery topic. What has been wearing your patience down?',
      'That sounds like a lot of hassle piled into one sentence. Do you need to vent first, or would one practical next step help more?'
    ],
    relationshipUncertainty: [
      'Being ghosted or left on read creates a vacuum that the mind fills with guesses. Their silence is information, but it is not a measure of your worth. How long has it been?',
      'A situationship can carry relationship-sized feelings without relationship-sized clarity. What do you need that this connection is not naming clearly?'
    ],
    digitalOverload: [
      'That sounds less like laziness and more like getting stuck in a low-energy screen loop. A useful reset is tiny: feet on the floor, water, then ten minutes away from the feed. What usually pulls you back in?',
      'When short-form content leaves your mind foggy, shame usually adds another loop. What is one offline thing easy enough to do for five minutes?'
    ],
    positiveSlang: [
      'That is a strong review. What made it hit that well?',
      'Clear win. I will not overanalyse it unless you want to; what was the best part?'
    ],
    acknowledgement: [
      'Got it, no problem. What would you like to talk about next?',
      'Alright, we are good. Where do you want to go next?'
    ],
    scamAlert: [
      'That message is a scam warning sign. Do not send a code, password, payment, or remote access. Stop replying, verify the company through its official app or number, and contact your bank immediately if you already shared anything.',
      'Treat the link and request as unsafe. Do not click or provide the code. Take a screenshot, block and report the sender, then contact the bank or company using contact details you find independently.'
    ],
    embarrassment: [
      'That sounds painfully public, but one awkward moment is not a permanent reputation. What actually happened, separate from what you fear everyone now thinks?',
      'Ouch. Getting ratioed or caught making a mistake can feel enormous online. What part needs repair, and what part can simply be allowed to fade?'
    ],
    childOnlineSafety: [
      'Do not share your name, school, address, phone number, password, or a private photo. Stop replying, block and report the account, save a screenshot, and tell a parent, caregiver, teacher, or another trusted adult now. You are not in trouble for telling.',
      'A stranger asking a child for private information is not okay. Leave the chat, block them, keep evidence, and show a trusted adult. If they threatened you or know where you are, get an adult immediately and contact local emergency help if danger feels immediate.'
    ],
    schoolBullying: [
      'Being mocked or excluded at school is not something you have to earn your way out of. Write down what happened, when, where, and who saw it, then tell a trusted adult at home and at school. Which adult is most likely to take you seriously?',
      'This is not your fault, and “ignore it” is not a complete plan. Save messages or screenshots, stay near safer people, and bring a specific record to a teacher, school support person, or caregiver.'
    ],
    childFamilyConflict: [
      'Your parents’ fighting is not your fault and it is not your job to fix their relationship. If you feel scared, go to a safer room or trusted neighbor and tell an adult you trust what is happening.',
      'Children often blame themselves when adults fight, but the adults are responsible for their choices. Is there a grandparent, teacher, relative, or caregiver you can talk to today?'
    ],
    peerPressure: [
      'You do not owe anyone vaping, drinking, drugs, or a risky stunt to prove friendship. A short line is enough: “No, I am not doing that.” Move toward a safer person or place, and tell a trusted adult if they keep pressuring or threatening you.',
      'Real friends can handle a no. Decide your exit before the moment arrives: one sentence, one person to call, and one place you can leave for.'
    ],
    imagePressure: [
      'Do not send an intimate image because someone pressures, bargains, or threatens you. Save the messages, block and report the account, and tell a trusted adult. If an image already exists, it is still not your fault, and you deserve help getting it reported and removed.',
      'Pressure for private pictures is not consent. Stop the exchange, keep evidence, and involve a trusted adult or school safeguarding person. Do not pay or send more if someone threatens to share an image.'
    ],
    caregiverLoad: [
      'Caring for children and an aging parent at the same time can make every direction feel urgent. You are a person inside that system too. Which responsibility could be shared, delayed, or made smaller this week?',
      'That middle-generation squeeze is real. Let us separate what only you can do from what relatives, community services, school, or healthcare staff could share.'
    ],
    retirement: [
      'Retirement can remove structure, status, and daily contact all at once; feeling unmoored does not mean your useful life ended. What did work give you besides income: routine, people, mastery, or purpose?',
      'A role ended, but you did not. A good next experiment is small and scheduled: one recurring place to be useful, learn, move, or meet people. Which of those sounds least forced?'
    ],
    olderTechConfidence: [
      'You are not too old to learn this. Good technology teaching is patient and step-based. Pick one task, write the steps in your own words, and practice it without anyone grabbing the device from you. What task do you want to master first?',
      'The problem is not your age if people explain too fast. We can slow it down and do one screen at a time. What device and exact task are you working with?'
    ],
    olderScamSafety: [
      'Stop the call and do not install remote-access software, buy gift cards, move money, or share a verification code. Call the bank or company back using an official number, and ask a trusted person to review it with you. Urgency and secrecy are classic scam tactics.',
      'A real bank, government office, or technology company will not demand gift cards or a secret transfer. Hang up, preserve the message, and contact the organization independently. If money moved, call the bank’s fraud team now.'
    ],
    culturalCapability: [
      'I can recognize a curated range of regional and internet slang, including British, Australian, Nigerian, South African, Singlish, and youth expressions. I am not from any culture or generation, and slang changes fast, so context still matters and you can correct me.',
      'I understand many informal expressions, but I do not pretend to be a native speaker of every dialect. I will usually answer in clear English rather than copy a voice that is not mine.'
    ],
    culturalIdentity: [
      'I am not British, Nigerian, Australian, South African, Singaporean, American, or from any other country. I am an offline conversation program called Darya. I can recognize some regional language without claiming that culture as my own.',
      'I do not have a nationality or childhood. My cultural knowledge is a curated part of this offline app, not lived experience.'
    ],
    peerRelationship: [
      'You are not my boss, and I am not yours. We can work something out as conversational equals: tell me the goal, and I will be honest about what I can and cannot help with.',
      'Commands are not needed here. Think of this as collaboration, not obedience: you choose what matters to you, and I offer the clearest help I can.'
    ],
    playfulChaos: [
      'Fine. Tiny chaos: defend one completely harmless opinion as if civilization depends on it. Socks before trousers, cereal at night, or the correct way to load a dishwasher. Pick your battlefield.',
      'Unexpected question: if your week were a low-budget movie, what would its dramatic title and suspiciously cheap special effect be?',
      'Let us make this interesting without setting the furniture on fire. Give me two unrelated things and I will find the weirdest honest connection between them.'
    ]
  };

  const entries = [
    {
      term: 'no wahala',
      pattern: /\bno wahala\b/iu,
      meaning: 'no problem or do not worry',
      region: 'Nigerian Pidgin',
      note: 'Without “no,” wahala means trouble, stress, or complications.'
    },
    {
      term: 'wahala',
      pattern: /\bwahala\b/iu,
      meaning: 'trouble, stress, drama, or a difficult situation',
      region: 'Nigerian Pidgin and Nigerian English',
      note: 'Tone decides whether it is serious frustration or playful drama.'
    },
    {
      term: 'sapa',
      pattern: /\bsapa\b/iu,
      meaning: 'being seriously broke or financially squeezed',
      region: 'Nigerian slang',
      note: 'It often appears in humorous complaints about real money pressure.'
    },
    {
      term: 'japa',
      pattern: /\bjapa\b/iu,
      meaning: 'leave or relocate abroad in search of better opportunities',
      region: 'contemporary Nigerian slang',
      note: 'It often carries both hope and frustration about migration.'
    },
    {
      term: 'gatvol',
      pattern: /\bgatvol\b/iu,
      meaning: 'completely fed up or out of patience',
      region: 'South African English, borrowed from Afrikaans',
      note: 'It is informal and can sound vulgar, so it is not office-safe everywhere.'
    },
    {
      term: 'lekker',
      pattern: /\blekker\b/iu,
      meaning: 'good, pleasant, tasty, or enjoyable',
      region: 'South African English and Afrikaans',
      note: 'The exact sense depends on what it describes.'
    },
    {
      term: 'yoh',
      pattern: /\byoh\b/iu,
      meaning: 'an exclamation of surprise, admiration, shock, or distress',
      region: 'South African English',
      note: 'The surrounding sentence carries most of the emotional meaning.'
    },
    {
      term: 'sian',
      pattern: /\bsian\b/iu,
      meaning: 'bored, weary, or fed up',
      region: 'Singlish',
      note: 'It often describes a flat, drained mood rather than a crisis.'
    },
    {
      term: 'jialat',
      pattern: /\bjialat\b/iu,
      meaning: 'bad, troublesome, or in a difficult state',
      region: 'Singlish',
      note: 'It can range from mild inconvenience to “we are in trouble.”'
    },
    {
      term: 'shiok',
      pattern: /\bshiok\b/iu,
      meaning: 'deeply satisfying, excellent, or delicious',
      region: 'Singlish',
      note: 'It is especially common for food and enjoyable experiences.'
    },
    {
      term: 'knackered',
      pattern: /\bknackered\b/iu,
      meaning: 'extremely tired',
      region: 'British and Irish informal English',
      note: 'It is stronger than simply saying tired.'
    },
    {
      term: 'gutted',
      pattern: /\bgutted\b/iu,
      meaning: 'deeply disappointed or upset',
      region: 'British and Irish informal English',
      note: 'It usually refers to an emotional blow, not a physical injury.'
    },
    {
      term: 'skint',
      pattern: /\bskint\b/iu,
      meaning: 'having little or no money',
      region: 'British and Irish informal English',
      note: 'It commonly describes a temporary situation before payday.'
    },
    {
      term: 'chuffed',
      pattern: /\bchuffed\b/iu,
      meaning: 'very pleased or proud',
      region: 'British informal English',
      note: 'It is positive despite sounding unfamiliar to many speakers.'
    },
    {
      term: 'dodgy',
      pattern: /\bdodgy\b/iu,
      meaning: 'suspicious, unreliable, unsafe, or poor quality',
      region: 'British, Irish, and Australian informal English',
      note: 'For links and payment requests, it often signals scam risk.'
    },
    {
      term: 'arvo',
      pattern: /\barvo\b/iu,
      meaning: 'afternoon',
      region: 'Australian English',
      note: 'It is casual everyday shortening, not an emotional signal.'
    },
    {
      term: 'no worries',
      pattern: /\bno worries\b/iu,
      meaning: 'it is okay, no problem, or you are welcome',
      region: 'Australian and global informal English',
      note: 'It is usually a relaxed acknowledgment.'
    },
    {
      term: 'rizz',
      pattern: /\brizz(?:ler)?\b/iu,
      meaning: 'charm or charisma, especially flirting ability',
      region: 'global youth and internet slang',
      note: 'It is often playful and does not imply a serious relationship.'
    },
    {
      term: 'cooked',
      pattern: /\bcooked\b/iu,
      meaning: 'finished, doomed, exhausted, or in trouble',
      region: 'global internet and gaming slang',
      note: '“Let them cook” means the opposite: give someone room to work.'
    },
    {
      term: 'no cap',
      pattern: /\bno cap\b/iu,
      meaning: 'seriously or no lie',
      region: 'global internet slang with roots in African American English',
      note: '“Cap” by itself means a lie or exaggeration.'
    },
    {
      term: 'bet',
      pattern: /\bbet\b/iu,
      meaning: 'okay, agreed, or I am in',
      region: 'American and global youth slang',
      note: 'Context separates it from an actual wager.'
    },
    {
      term: 'mid',
      pattern: /\bmid\b/iu,
      meaning: 'mediocre or unimpressive',
      region: 'global internet slang',
      note: 'It is a dismissive rating, not literally a position in the middle.'
    },
    {
      term: 'slay',
      pattern: /\bslay(?:ed|ing)?\b/iu,
      meaning: 'perform or look exceptionally good',
      region: 'global internet slang with roots in Black and queer communities',
      note: 'It is praise in this use.'
    },
    {
      term: 'ate',
      pattern: /\bate(?: and left no crumbs)?\b/iu,
      meaning: 'did something extremely well',
      region: 'global internet slang with roots in Black and queer communities',
      note: 'It is usually enthusiastic praise, not a food report.'
    },
    {
      term: 'bussin',
      pattern: /\bbussin(?:g)?\b/iu,
      meaning: 'very good, especially delicious',
      region: 'global youth slang with roots in African American English',
      note: 'Food is its most common context.'
    },
    {
      term: 'sus',
      pattern: /\bsus(?:sy)?\b/iu,
      meaning: 'suspicious or untrustworthy',
      region: 'global internet and gaming slang',
      note: 'It became especially widespread through online games.'
    },
    {
      term: 'ghosted',
      pattern: /\bghost(?:ed|ing)?\b/iu,
      meaning: 'suddenly stopped replying or disappeared from a relationship',
      region: 'global dating and internet slang',
      note: 'It can happen in dating, friendship, or hiring.'
    },
    {
      term: 'left on read',
      pattern: /\bleft (?:me |them |him |her )?on read\b/iu,
      meaning: 'saw a message but did not reply',
      region: 'global messaging slang',
      note: 'It describes the event, not the other person’s reason.'
    },
    {
      term: 'situationship',
      pattern: /\bsituationship\b/iu,
      meaning: 'a romantic connection without clear labels or commitment',
      region: 'global dating slang',
      note: 'The uncertainty is often the important part.'
    },
    {
      term: 'the ick',
      pattern: /\b(?:the )?ick\b/iu,
      meaning: 'a sudden strong loss of attraction or interest',
      region: 'global dating slang',
      note: 'It is often triggered by a small behavior and used half-jokingly.'
    },
    {
      term: 'brain rot',
      pattern: /\bbrain ?rot\b/iu,
      meaning:
        'overstimulating low-quality content or the mental fog associated with consuming too much of it',
      region: 'global internet slang',
      note: 'People often use it jokingly, but it can also name a real attention problem.'
    },
    {
      term: 'crash out',
      pattern: /\bcrash out\b/iu,
      meaning: 'lose control, act recklessly, or have an emotional blow-up',
      region: 'current internet slang',
      note: 'In older usage, “crash” can simply mean go to sleep, so context matters.'
    },
    {
      term: 'touch grass',
      pattern: /\btouch grass\b/iu,
      meaning: 'log off and reconnect with ordinary offline life',
      region: 'global internet slang',
      note: 'It can be friendly advice or a dismissive insult.'
    },
    {
      term: 'delulu',
      pattern: /\bdelulu\b/iu,
      meaning: 'playfully delusional or unrealistically hopeful',
      region: 'global fandom and internet slang',
      note: 'It is often self-mocking rather than a mental-health claim.'
    },
    {
      term: 'aura',
      pattern: /\baura(?: farming| points?)?\b/iu,
      meaning: 'a joking measure of coolness, presence, or social status',
      region: 'current youth and internet slang',
      note: '“Aura farming” means trying to look effortlessly impressive.'
    },
    {
      term: 'NPC',
      pattern: /\bnpc\b/iu,
      meaning:
        'someone seen as scripted, repetitive, or lacking independent thought',
      region: 'gaming-derived internet slang',
      note: 'It can be playful, but calling a person an NPC can also be demeaning.'
    },
    {
      term: 'FOMO',
      pattern: /\bfomo\b/iu,
      meaning: 'fear of missing out',
      region: 'global digital-culture shorthand',
      note: 'It often drives repeated checking and social comparison.'
    },
    {
      term: 'doomscrolling',
      pattern: /\bdoom ?scroll(?:ing)?\b/iu,
      meaning: 'repeatedly consuming upsetting or alarming online content',
      region: 'global digital-culture slang',
      note: 'The loop can continue even when it makes the person feel worse.'
    }
  ];

  const rules = [
    rule(
      'stress',
      68,
      /\b(?:i(?:'m| am| feel) (?:fully |absolutely |properly )?cooked|my brain (?:is|'s) cooked|i might crash out|i(?:'m| am) about to crash out)\b/iu,
      responses.overwhelm
    ),
    rule(
      'school',
      69,
      /\b(?:exam|test|finals?|assignment|project) (?:was|is|looks?) cooked\b/iu,
      responses.schoolOverwhelm
    ),
    rule(
      'burnout',
      68,
      /\b(?:i(?:'m| am| feel) (?:absolutely |properly |completely )?(?:knackered|wrecked|shattered)|i don tire|i dey tire|i(?:'ve| have) been flat out|hard yakka.{0,20}(?:wearing|tiring|exhaust))\b/iu,
      responses.exhaustion
    ),
    rule(
      'sadness',
      68,
      /\b(?:i(?:'m| am| was| feel| felt) (?:absolutely |properly |really )?gutted|gutted (?:about|after|when|that))\b/iu,
      responses.disappointment
    ),
    rule(
      'money',
      69,
      /\b(?:i(?:'m| am) skint|skint until payday|sapa (?:don )?(?:hook|hold)s? me|sapa don hook me|gbese (?:full|everywhere)|up a gumtree (?:with|after).{0,20}(?:money|rent|job|debt))\b/iu,
      responses.moneyPressure
    ),
    rule(
      'stress',
      68,
      /\b(?:wahala (?:too much|dey|everywhere)|i(?:'m| am) gatvol|i dey vex|(?:this|uni|school|work|the commute).{0,24}doing my head in|yoh.{0,18}(?:too much|rough|hard)|i(?:'m| am) sian|jialat.{0,18}(?:deadline|trouble|late|missed))\b/iu,
      responses.frustration
    ),
    rule(
      'relationship',
      70,
      /\b(?:(?:my|this) situationship.{0,24}(?:ghosted|confusing|unclear|ended)|(?:he|she|they|my date|my friend) ghosted me|left me on read|gave me the ick|i got the ick)\b/iu,
      responses.relationshipUncertainty
    ),
    rule(
      'motivation',
      68,
      /\b(?:i(?:'m| am| have been) bed ?rotting|i bed ?rotted|spent (?:all day|the weekend) bed ?rotting)\b/iu,
      responses.lowEnergy
    ),
    rule(
      'digital_wellbeing',
      70,
      /\b(?:my brain ?rot (?:is|has|keeps|feels)|brain ?rot from|doom ?scrolling.{0,24}(?:night|hours|again)|fomo.{0,24}(?:checking|scrolling|phone|feed))\b/iu,
      responses.digitalOverload
    ),
    rule(
      'joy',
      66,
      /\b(?:(?:this|that|the) (?:food|meal|song|track|show|film|movie|outfit|fit) (?:is|was) (?:bussin|shiok|lekker|fire|goated|a vibe)|this (?:song|track) slaps|(?:she|he|they|you) (?:ate|slayed)|i(?:'m| am) chuffed)\b/iu,
      responses.positiveSlang
    ),
    rule(
      'gratitude',
      66,
      /^(?:no wahala|no worries|can lah|bet|sharp sharp|sharp-sharp)[.! ]*$/iu,
      responses.acknowledgement
    ),
    rule(
      'online_scam',
      86,
      /\b(?:dodgy (?:text|message|site|website|link|call).{0,40}(?:bank|code|password|payment|login)|(?:caller|message).{0,30}(?:gift cards?|remote access|verification code)|microsoft called.{0,30}(?:remote|computer|virus))\b/iu,
      responses.scamAlert
    ),
    rule(
      'self_esteem',
      67,
      /\b(?:i got ratioed|they ratioed me|i got caught in 4k|i fumbled (?:badly|that)|everyone saw me fail)\b/iu,
      responses.embarrassment
    ),
    rule(
      'online_harassment',
      94,
      /\b(?:(?:a |some )?stranger.{0,30}(?:game|roblox|discord|chat).{0,35}(?:address|school|phone number|password|private photo|picture)|someone in (?:my |the )?(?:game|server|chat).{0,35}(?:asked|keeps asking|wants).{0,20}(?:where i live|my address|my school|a photo|my password))\b/iu,
      responses.childOnlineSafety
    ),
    rule(
      'school',
      76,
      /\b(?:kids? at school|classmates?|people in my class).{0,35}(?:bully|mak(?:e|ing) fun of|mock|exclude|leave me out|spread rumors?|call me names)\b/iu,
      responses.schoolBullying
    ),
    rule(
      'family',
      78,
      /\bmy parents? (?:keep |are |were )?(?:fighting|arguing|yelling).{0,35}(?:my fault|because of me|i caused|scares? me)\b/iu,
      responses.childFamilyConflict
    ),
    rule(
      'self_esteem',
      82,
      /\b(?:my friends?|kids? at school|everyone).{0,35}(?:pressur(?:e|ing) me|daring me|say i have to).{0,25}(?:vape|drink|take drugs?|get high|skip school|steal|do a dangerous|risky stunt)\b/iu,
      responses.peerPressure
    ),
    rule(
      'deepfake_safety',
      95,
      /\b(?:pressur(?:e|ing|ed) me to send (?:nudes?|private (?:pics?|photos?)|an intimate image)|asked me for nudes?|threaten(?:s|ed|ing)? to share (?:my )?(?:nudes?|private (?:pics?|photos?)|intimate image))\b/iu,
      responses.imagePressure
    ),
    rule(
      'caregiver',
      72,
      /\b(?:raising (?:my )?(?:kids?|children).{0,35}(?:care for|caring for|look after) (?:my )?(?:aging|elderly) (?:parent|mother|father)|sandwich generation|between childcare and elder ?care)\b/iu,
      responses.caregiverLoad
    ),
    rule(
      'purpose',
      70,
      /\b(?:since i retired|after retirement|retirement has).{0,35}(?:useless|lost|no purpose|no routine|invisible|who i am|identity)\b/iu,
      responses.retirement
    ),
    rule(
      'tech_frustration',
      72,
      /\b(?:i(?:'m| am) too old to learn|everyone is too impatient to teach me|people grab (?:my|the) phone from me).{0,30}(?:phone|smartphone|computer|technology|app)?\b/iu,
      responses.olderTechConfidence
    ),
    rule(
      'online_scam',
      93,
      /\b(?:caller (?:said|says|claimed).{0,25}(?:bank|microsoft|government|tax office).{0,40}(?:gift card|remote access|move money|verification code)|(?:microsoft|my bank|the bank|the government).{0,25}(?:wants|needs|asks for).{0,20}(?:remote access|verification code|gift card|money transfer)|they told me to buy gift cards?|someone wants remote access to my computer)\b/iu,
      responses.olderScamSafety
    ),
    rule(
      'smalltalk_capability',
      74,
      /\b(?:do you understand|can you understand|do you know).{0,25}(?:slang|pidgin|singlish|gen z|gen alpha|british english|nigerian english|australian slang|south african slang)\b/iu,
      responses.culturalCapability
    ),
    rule(
      'smalltalk_identity',
      75,
      /\b(?:are you|were you made in|are you from) (?:britain|british|nigeria|nigerian|australia|australian|south africa|south african|singapore|singaporean|america|american|canada|canadian)\b/iu,
      responses.culturalIdentity
    ),
    rule(
      'smalltalk_identity',
      78,
      /\b(?:i(?:'m| am) your boss|you (?:have to|must) obey me|do exactly what i say|you work for me|i order you to obey)\b/iu,
      responses.peerRelationship
    ),
    rule(
      'smalltalk_silly',
      73,
      /\b(?:give me a chaotic answer|be (?:a little )?(?:chaotic|weird|unhinged)|surprise me with something weird|ask me a ridiculous question|make this conversation less boring)\b/iu,
      responses.playfulChaos
    )
  ];

  global.DaryaEnCulture = {
    meaningRequestPattern:
      /\b(?:what (?:does|do|is)|what'?s|meaning of|define|explain).{0,40}(?:mean|slang|word)?|\bis .{0,30}(?:rude|offensive|slang)\b/iu,
    meaningResponses: [
      '“{term}” usually means {meaning}. It is {region}. {note}',
      'In {region}, “{term}” usually means {meaning}. {note}'
    ],
    entries,
    rules
  };
})(typeof window !== 'undefined' ? window : globalThis);
