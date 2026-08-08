/**
 * Darya - en rule definitions.
 * Registers the compiled rule array on the global for the pack assembler
 * (en.js). Pools come from DaryaEnResponses.
 */
(function (global) {
  'use strict';

  var R = global.DaryaEnResponses;

  function rule(topic, priority, pattern, responses) {
    return { topic, priority, pattern, responses };
  }

  const rules = [
    rule(
      'safety',
      100,
      // eslint-disable-next-line max-len
      /\b(suicide|kill myself|self.?harm|hurt myself|end my life|(?:don'?t|do not) want to live(?! (?:in|here|there|with|near|at))|no reason to live|nothing to live for|no point in living|want to die|wish i were dead|better off dead|i want to disappear forever)\b/i,
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

    // Depression goes beyond the sadness rule: heavy, lasting low mood
    // (hopeless, worthless, empty, unable to get out of bed). Empathy
    // first, then a gentle, real nudge toward professional support.
    rule(
      'depression',
      56,
      // eslint-disable-next-line max-len
      /\b(depressed|depression|hopeless|worthless|empty inside|numb|can'?t (?:get out of bed|do anything)|no (?:point|purpose|reason) (?:in|for) (?:life|anything)|i give up|whats the point|what is the point|feel like nothing|i feel dead inside)\b/i,
      R['ruleDepression']
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
      // eslint-disable-next-line max-len
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
      // eslint-disable-next-line max-len
      /\b(what can you do|how can you help|what do you do|how do you work|what are you capable of|what's your purpose)\b/i,
      R['ruleSmalltalkCapability']
    ),

    // The user pushes back on Darya's question or probing ("none of your
    // business", "that's private"). The reply respects the boundary
    // gracefully and hands the direction back to the user, instead of a
    // reflective pool line that reads as dodging the pushback.
    rule(
      'privacy_boundary',
      70,
      // eslint-disable-next-line max-len
      /\b(none of your business|mind your own business|that'?s private|that'?s personal|why do you (?:ask|need to know|care)|stop asking|don'?t ask|dont ask|back off|leave me alone|i (?:don'?t|do not) want to (?:say|talk about it|answer|tell you))\b/i,
      R['rulePrivacyBoundary']
    ),

    // Off-topic playful questions ("Do you like pizza?", "What's the weather?")
    // Acknowledge playfully, then gently steer back to the user.
    rule(
      'smalltalk_silly',
      55,
      // eslint-disable-next-line max-len
      /\b(do you like|what do you think of|would you ever|have you ever|are you a|can you eat|do you eat|what\'s your favourite|what is your favorite|how old are you|where do you live|do you sleep)\b/i,
      R['ruleSmalltalkSilly']
    ),

    // The user asks for a joke or wants to laugh. Replies come from a
    // pool of clean, kind jokes; a request to be cheered up routes here
    // too so the reply is light and never at anyone's expense.
    rule(
      'smalltalk_joke',
      60,
      // eslint-disable-next-line max-len
      /\b(tell me (?:a |some |any )?jokes?|tell me (?:a |some |any )?funny jokes?|make me laugh|make me smile|say something funny|say a joke|any jokes|joke for me|know any jokes|crack me up|cheer me up|give me a laugh|give me a (?:funny )?joke)\b/i,
      R['ruleTellJoke']
    ),

    // The user asks Darya to buy something ("buy me a laptop", "where can
    // I buy X"). Darya cannot make purchases, so the reply is honest
    // about the limit and then helps think the purchase through.
    rule(
      'shopping',
      50,
      // eslint-disable-next-line max-len
      /\b(buy me|i want to buy|i need to buy|where can i (?:buy|get|find)|how much does it cost|should i buy|worth buying|buying a|buying guide|which .{1,24} (?:should|can) i (?:buy|get)|what .{1,24} (?:should|can) i (?:buy|get)|purchase)\b/i,
      R['ruleShoppingHelp']
    ),

    // A crush on someone much older (thirty years or more). Balanced,
    // non-judgmental guidance: life stage, power balance, and mutual
    // respect matter more than the number itself.
    rule(
      'age_gap',
      45,
      // eslint-disable-next-line max-len
      /\b(age gap|years older|years younger|much older|much younger|older than me|younger than me|thirty years older|thirty years younger)\b/i,
      R['ruleAgeGap']
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
      // eslint-disable-next-line max-len
      /\b(mindfulness|meditation|meditate|mindful|breathing (?:exercise|technique)|present moment|be present|grounding|ground myself|in the moment|calm my mind|quiet my mind|clear my head|body scan|just breathe|focus on my breath|watching my thoughts|notice my thoughts|noticing my thoughts|being aware)\b/i,
      R['ruleMindfulness']
    ),

    rule(
      'stress',
      40,
      // eslint-disable-next-line max-len
      /\b(overwhelmed|burnout|burned out|can'?t cope|too much to handle|stressed out|under (?:so much|a lot of) pressure|at my limit|stretched (?:too )?thin|breaking point|mentally exhausted|drained|can'?t keep up|maxed out|running on empty|about to snap|can'?t take (?:it|this) anymore)\b/i,
      R['ruleStress']
    ),

    // The user asks Darya to say something more simply or more briefly
    // ("make it simpler", "keep it short"). Acknowledge warmly and commit
    // to a plainer register instead of falling through to a generic line.
    rule(
      'simplify',
      45,
      // eslint-disable-next-line max-len
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
      // eslint-disable-next-line max-len
      /\b(website|web ?site|the app|this app|theme|design|interface|button|menu|font|icon|animation|waves?|beach|format)\b/i,
      R['ruleAppFeedback']
    ),

    rule(
      'gratitude',
      25,
      // eslint-disable-next-line max-len
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
      // eslint-disable-next-line max-len
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

    // The user does not know how to begin ("how do i start?", "i don't
    // know what to say"). Darya lowers the bar and offers easy openers
    // instead of mirroring the uncertainty back.
    rule(
      'opener_help',
      58,
      // eslint-disable-next-line max-len
      /\b(?:how do i (?:start|begin)|how (?:should|do) i (?:start|begin)|i (?:don'?t|do not) know (?:how to (?:start|begin)|what to say|where to (?:start|begin))|i have no idea what to say|what should i say|what do i say|i'?m (?:not sure|stuck|lost) (?:how|where) to (?:start|begin)|can'?t think of (?:anything|something) to say|help me (?:start|begin)|i (?:don'?t|do not) know how to talk)\b/i,
      R['ruleOpenerHelp']
    ),

    // The user tells Darya to improve herself ("make yourself better",
    // "become smarter"). Acknowledge humbly instead of deflecting with
    // humor or a generic line.
    rule(
      'self_improvement',
      55,
      // eslint-disable-next-line max-len
      /(?<![\p{L}])(?:make yourself (?:better|smarter|wiser)|become (?:smarter|better|wiser|more intelligent)|improve yourself|upgrade yourself|be (?:smarter|better|wiser)|learn more)(?![\p{L}])/iu,
      R['ruleSelfImprovement']
    ),

    // "What should I do?" answers the help-seeking intent directly
    // instead of being swallowed by a topic rule or an evasive fallback.
    rule(
      'what_do_i_do',
      52,
      // eslint-disable-next-line max-len
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
      // eslint-disable-next-line max-len
      /\b(?:socrates|stoic|stoicism|aristotle|jung|nietzsche|gandhi|mandela|churchill|zarathustra|philosophy|focus|concentrate|study better|learn better|communicate better|communication advice|creative block|be more creative|stress management|burnout|overwhelmed|calm down|self compassion|self-compassion|inner critic|be kind to myself|self care|conflict resolution|argument|disagreement|nonviolent communication|nvc|decision making|make a choice|choose between|important decision|resilience|resilient|bounce back|forgive|forgiveness|letting go|let it go|purpose|meaning of life|meaningful|existential|relationship advice|relationships|connection|relating to|career|career change|professional growth|job satisfaction|work life balance|anxiety|anxiety management|manage worry|overthinking|grief)\b/i,
      R['ruleKnowledge']
    ),

    rule(
      'professional_boundary',
      90,
      // eslint-disable-next-line max-len
      /\b(?:medical advice|diagnosis|medication|legal advice|lawyer|court|financial advice|investing|tax advice|loan advice)\b/i,
      R['ruleProfessionalBoundary']
    ),

    rule(
      'recap',
      80,
      // eslint-disable-next-line max-len
      /\b(?:what did i say earlier|what have i said|can you summarize|summarize this|give me a recap|what did we talk about|what have we talked about|what were we talking about|where were we|remind me what we said|what did we discuss)\b/i,
      R['ruleRecap']
    ),

    // The user asks to change the subject ("let's talk about something
    // else", "change the topic", "let's move on"). Darya follows the
    // lead with a light bridge instead of treating the request as a
    // topic disclosure or falling through to a fallback.
    rule(
      'topic_change',
      62,
      // eslint-disable-next-line max-len
      /\b(?:change (?:the |this )?(?:topic|subject|conversation)|switch (?:topics?|subjects?)|talk about (?:something|anything) else|another topic|different topic|move on to (?:something|another)|let'?s (?:talk|move) (?:about )?something else|something else entirely|new subject)\b/i,
      R['ruleTopicChange']
    ),

    // The user apologizes ("sorry", "i apologize"). Warm acceptance beats
    // the "could you elaborate" ambiguous-input fallback, so a bare
    // "sorry" is never answered with a request for more detail. The pool
    // stays brief and moves on.
    rule(
      'apology',
      64,
      /\b(?:sorry|i'?m sorry|i apologize|i apologise|apologize|apologise|my apologies|forgive me|my bad|pardon me)\b/i,
      R['ruleApology']
    ),

    // Feedback aimed at Darya herself: how she quotes words, whether she
    // understands the message chain, how "smart" she is, requests for a
    // swear-word dictionary, open-question style, and so on. These turns
    // deserve a humble acknowledgement even when worded harshly, so this
    // topic is also excluded from the frustration/harassment override in
    // the engine.
    rule(
      'meta_feedback',
      62,
      // eslint-disable-next-line max-len
      /\b(?:you should (?:understand|get|know|realize|learn|remember|pay attention|be smarter|be better|be wiser)|(?:my|your) (?:input|message|words|meaning)|feedback|dictionary|quoting|quoted|keep (?:quoting|repeating|echoing)|chain of (?:messages|conversation|context)|previous messages|past (?:turns|messages|conversation)|like (?:a |an )?(?:parrot|monkey)|parroting|mimicking|open questions|challenging questions|you (?:keep|always) (?:using|putting|saying)|you'?re misreading|you misread|misunderstand|are you listening|pay attention|you forgot|you don'?t (?:remember|understand)|the full meaning|understand the meaning|you are dodging|you dodged|dodging the question|you did not answer|you didn'?t answer|avoiding my question|not answering me|you are deflecting|you are not listening|you are ignoring me)\b/i,
      R['ruleMetaFeedback']
    ),

    // Who made Darya, her origin story, and the ELIZA tribute. Darya
    // answers with a short, curiosity-engaging intro: built by Artin as
    // a tribute to ELIZA, the first chatbot, from MIT. Priority sits just
    // above the how-are-you family so "who made you" never falls through
    // to smalltalk.
    rule(
      'about_eliza',
      66,
      // eslint-disable-next-line max-len
      /\b(?:who (?:made|built|created|designed|invented) (?:you|darya|this)|who is your (?:creator|maker|developer|inventor)|who created (?:you|darya)|the (?:creator|maker|developer) (?:of|behind) darya|your (?:creator|maker|developer)|eliza|elyza|weizenbaum|artin|(?:built|made|created) at mit|(?:from|at) mit|(?:aim|purpose|point) of (?:making|building|creating) (?:you|darya)|why did you (?:get|come) to be|original chatbot)\b/i,
      R['ruleAboutEliza']
    ),

    // The user compliments something Darya said ("well said", "i like
    // that", "nice answer"). Warm acknowledgement instead of a topic
    // fallback. Kept below about_eliza so a compliment about Darya's
    // self-introduction still routes to the origin story.
    rule(
      'compliment_darya',
      58,
      // eslint-disable-next-line max-len
      /\b(?:i like (?:what you said|that (?:line|reply|answer|phrase|way|response))|^i like that[.!]*$|that(?:'s| is) (?:a )?(?:nice|good|beautiful|great|lovely|sweet|kind|warm|helpful) (?:thing|reply|answer|response|way) (?:to say|of you|you said)|well said|good point|nice (?:answer|reply|response|comeback)|you(?:'re| are) (?:really )?(?:good|great|nice|warm|kind|helpful)|i love (?:that|this)|that made me smile|beautifully (?:put|said|done)|that(?:'s| is) (?:so )?(?:kind|thoughtful|sweet)|great question|good question|nice question|well done|good job|that was (?:a )?great|smart answer|you are smart|impressive|good answer|nice one)\b/i,
      R['ruleComplimentDarya']
    ),

    // The user corrects Darya's misreading ("i wasn't talking about
    // that", "that's not what i meant"). Acknowledge and invite a
    // restated version instead of re-triggering the same topic rule.
    rule(
      'misread_correction',
      56,
      // eslint-disable-next-line max-len
      /\b(?:i never (?:said|meant|talked about|mentioned)|that(?:'s| is) not what i (?:said|meant|talking about)|you (?:misread|misunderstood|misinterpreted|got that wrong)|i wasn'?t (?:talking about|saying|referring to)|you got the wrong idea|not what i meant)\b/i,
      R['ruleMisreadCorrection']
    ),

    rule('affirmation', 15, /^(yes|yeah|yep)\.?$/i, R['ruleAffirmation']),

    rule('negation', 15, /^(no|nope|nah)\.?$/i, R['ruleNegation'])
  ];

  // Short auxiliary/filler fragments that are grammatically meaningless on
  // their own if left over from a capture group (mirrors the Persian
  // trivial-copula list, adapted to English's own filler words).

  global.DaryaEnRules = rules;
})(typeof window !== 'undefined' ? window : globalThis);
