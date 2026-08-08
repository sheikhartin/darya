/**
 * Darya classic script - en response pool (part 2).
 */
(function (global) {
  'use strict';

  const R = global.DaryaEnResponses;

  R.sentimentLexicon = {
    negative: [
      'sad',
      'depressed',
      'tired',
      'anxious',
      'stressed',
      'lonely',
      'scared',
      'afraid',
      'angry',
      'furious',
      'hopeless',
      'worried',
      'crying',
      'hurt',
      'exhausted',
      'overwhelmed',
      'worthless',
      'awful',
      'terrible',
      'bad',
      'devastated',
      'heartbroken',
      'miserable',
      'frustrated',
      'discouraged',
      'disappointed',
      'guilty',
      'ashamed',
      'helpless',
      'confused',
      'insecure',
      'vulnerable',
      'numb',
      'empty',
      'lost',
      'broken',
      'trapped',
      'resentful'
    ],
    positive: [
      'happy',
      'glad',
      'great',
      'grateful',
      'thankful',
      'calm',
      'hopeful',
      'relieved',
      'good',
      'excited',
      'proud',
      'love',
      'better',
      'okay',
      'peaceful',
      'content',
      'joyful',
      'optimistic',
      'motivated',
      'inspired',
      'confident',
      'comfortable',
      'wonderful',
      'amazing',
      'fantastic',
      'blessed'
    ],
    // Words that flip the polarity of an adjacent sentiment word, so
    // "I am not happy" and "I do not feel good" score negative.
    negations: [
      'not',
      'never',
      'no',
      "don't",
      'dont',
      "isn't",
      'isnt',
      "aren't",
      'arent',
      "wasn't",
      'wasnt',
      "can't",
      'cant',
      'cannot',
      "won't",
      'wont',
      "wouldn't",
      'wouldnt',
      "couldn't",
      'couldnt',
      "shouldn't",
      'shouldnt',
      "didn't",
      'didnt',
      "doesn't",
      'doesnt',
      'neither',
      'nor'
    ]
  };
  R.topicSpecificQuestions = {
    safety: [
      'Are you in immediate danger right now?',
      'Is someone you trust nearby at this moment?',
      'What would make the next ten minutes safer?',
      'Can you contact a crisis service or trusted person now?'
    ],
    family: [
      'Which family relationship is taking up the most space today?',
      'When did this tension with them begin to feel different?',
      'What do you wish they understood about your side?',
      'Is there a small boundary that would make contact easier?'
    ],
    work: [
      'What part of the workday has been hardest lately?',
      'Did this pressure begin with a specific change at work?',
      'What would a slightly better workday look like?',
      'Which conversation at work keeps replaying in your head?'
    ],
    sleep: [
      'Has the tiredness been there for a while, or is it new?',
      'What usually happens in the hour before you try to sleep?',
      'Does your mind stay busy, or does your body feel restless?',
      'What has changed most in your sleep over the past few days?'
    ],
    anxiety: [
      'What is the worry predicting will happen?',
      'Where do you notice the anxiety first in your body?',
      'Does the worry come in waves or stay in the background?',
      'What would feel like a one-step reduction in its intensity?'
    ],
    sadness: [
      'When did this sadness start to feel this close?',
      'Does this sadness feel more like loss, disappointment, or exhaustion today?',
      'What part of the day gives the sadness the most room?',
      'Is there something that briefly softens this sadness, even a little?'
    ],
    anger: [
      'What boundary or expectation felt crossed?',
      'What happened just before the anger rose?',
      'Would being heard, having space, or seeing change matter most?',
      'Where could this anger usefully point your attention?'
    ],
    joy: [
      'What small detail made this moment especially good?',
      'Who would you most like to share this good news with?',
      'What do you want to remember about how this felt?',
      'Could you make a little more room for this feeling today?'
    ],
    loneliness: [
      'What kind of company would feel good right now?',
      'Is the loneliness strongest in a place or at a particular time?',
      'Who feels easiest to reach, even with a short message?',
      'Would you prefer quiet company or an actual conversation?'
    ],
    self_esteem: [
      'Whose standard are you measuring yourself against?',
      'When did this self-criticism become familiar?',
      'What evidence from today does that harsh verdict leave out?',
      'What would you say to someone you love in the same position?'
    ],
    grief: [
      'What part of the loss feels most present today?',
      'Is there a memory of them you find yourself returning to?',
      'What has been hardest about the days since it happened?',
      'Who can sit with you when the grief gets especially loud?'
    ],
    motivation: [
      'Which first step feels small enough to begin today?',
      'Is the obstacle energy, uncertainty, or the size of the task?',
      'What has helped you start something on a low-energy day before?',
      'Would a shorter form of the task feel possible?'
    ],
    relationship: [
      'What changed between you and them most recently?',
      'Are you looking for repair, clarity, or room to breathe?',
      'Which part of the relationship still feels good or steady?',
      'What do you need to be able to say plainly?'
    ],
    health: [
      'What symptom or change is worrying you most?',
      'Have you already spoken with a qualified clinician about it?',
      'How is this affecting ordinary parts of your day?',
      'What question would you want answered first by a professional?'
    ],
    school: [
      'Which part of the course or exam feels most demanding?',
      'How much time do you have before the next deadline?',
      'What study approach has worked even once before?',
      'Would breaking the material into one short session help?'
    ],
    money: [
      'Which financial pressure needs attention first?',
      'What deadline or bill is making this feel urgent?',
      'Who could offer practical advice you trust?',
      'What information would make the next decision clearer?'
    ],
    mindfulness: [
      'What drew you to mindfulness or meditation?',
      'When you try to be present, what pulls your attention away most often?',
      'Is there a particular time of day when being present feels more natural?',
      'What do you notice first when you pause and pay attention to your inner world?'
    ],
    stress: [
      'Which part of your life is contributing the most to the overwhelm right now?',
      'When did the pressure start to feel like it was more than you could hold?',
      'What would relief look like, even if it is something very small?',
      'Is the pressure coming from one area or from several at once?'
    ],
    resilience: [
      'What has helped you get through difficult times in the past?',
      'When you think of resilience, does it feel like strength or more like adaptation?',
      'What small thing today could count as a moment of recovery?',
      'Who or what has been a source of steadiness for you?'
    ],
    forgiveness: [
      'When you think about forgiveness, is it yourself or someone else that comes to mind first?',
      'What would letting go of this weight actually look like in your daily life?',
      'Is there a misunderstanding you wish could be untangled?',
      'What would need to be true for you to feel released from this?'
    ],
    purpose: [
      'What gives you a sense that life has meaning or direction?',
      'Have there been moments recently when you felt that what you are doing matters?',
      'If you could dedicate your energy to one thing, what would it be?',
      'What kind of legacy or impact would feel meaningful to you?'
    ],
    relationship: [
      'What part of the relationship feels most important to you right now?',
      'Are you looking for repair, clarity, or room to breathe in this connection?',
      'What would a healthier version of this relationship look like?',
      'What do you need to be able to say, even if it feels hard?'
    ],
    career: [
      'What part of your career is asking for the most attention right now?',
      'Does the challenge feel more about direction, satisfaction, or balance?',
      'What would a slightly better version of your work life look like?',
      'What small step could move you toward a more fulfilling professional path?'
    ],
    anxiety: [
      'When the worry arrives, what does it tend to predict?',
      'Where do you notice the anxiety first in your body?',
      'Does the worry feel constant or does it come in waves?',
      'What would feel like a small step toward easing its grip, even slightly?'
    ],
    gratitude: [
      'What part of this conversation has felt useful to you?',
      'What would you like to carry with you from this moment?',
      'What made you decide to say thanks just now?',
      'What would feel good to talk about next?'
    ],
    feeling: [
      'When did that feeling first become noticeable?',
      'What seems to strengthen it during the day?',
      'What part of the feeling is easiest to name?',
      'What would you like to be different about it?'
    ],
    reasoning: [
      'What other explanation feels possible beside that one?',
      'What evidence makes this reason stand out to you?',
      'Has this pattern appeared in another situation?',
      'What would change your mind, even slightly?'
    ],
    need: [
      'What would meeting that need make possible first?',
      'What is the main thing standing between you and it?',
      'Could you move toward it through one small experiment?',
      'Who or what could make that first step lighter?'
    ],
    smalltalk_howareyou: [
      'What has been the brightest part of your day so far?',
      'What kind of day is it turning into for you?',
      'What is one ordinary detail you noticed today?',
      'Would you rather talk about the day or switch to something fun?'
    ],
    smalltalk_identity: [
      'What would make this conversation feel useful to you?',
      'What kind of companion are you hoping to find here?',
      'What would you like me to pay attention to?',
      'Where would you like to begin?'
    ],
    smalltalk_capability: [
      'What sort of conversation would suit you right now?',
      'Would reflection, brainstorming, or simple company be most useful?',
      'What topic would you like to try first?',
      'What would make this feel natural rather than mechanical?'
    ],
    professional_boundary: [
      'Which questions would you like to take to a qualified professional?',
      'What facts would be useful to collect before that appointment?',
      'Is there a deadline that makes professional guidance especially important?',
      'Would organizing the situation into a short list help?'
    ],
    recap: [
      'Which of those threads feels most worth returning to?',
      'Has one of those topics become more important since you mentioned it?',
      'Which detail from the conversation feels clearest to you now?',
      'Where would you like the recap to lead next?'
    ]
  };
  R.blendResponses = {
    blend_sleep_anxiety: [
      'Your restless nights and the worry seem to be feeding each other a little; noticing which one arrives first may give you a useful opening.',
      'When sleep and worry travel together, the evening can feel much longer than it is. A gentler wind-down might be worth protecting.',
      'The tiredness may be making the worry louder, while the worry keeps sleep out of reach. That is a tiring loop, not a personal failure.',
      'There are two threads here - a body asking for rest and a mind staying on watch. We can look at either one first.'
    ],
    blend_work_anger: [
      'The anger seems tied to what work is asking of you, not floating free of the situation.',
      'When a work pressure keeps crossing a line, frustration can become its own daily workload.',
      'It sounds as if the workplace problem is also taking a piece of your patience home with you.',
      'There is a work problem and a boundary problem sitting close together here.'
    ],
    blend_family_sadness: [
      'The sadness has a relationship-shaped edge to it, which may be why it keeps returning.',
      'Family can make an ordinary disappointment feel unusually close to the heart.',
      'There is both the event itself and what it says about belonging; those are different things to hold.',
      'This sounds like a tender family thread rather than a passing bad mood.'
    ],
    blend_loneliness_sleep: [
      'Quiet nights can make loneliness louder, and loneliness can make the night feel longer.',
      'Your sleep and your sense of company seem to be touching the same quiet hours.',
      'When the day goes still, both tiredness and wanting someone nearby may arrive together.',
      'There may be a small evening ritual that gives those hours a little more warmth.'
    ],
    blend_joy_gratitude: [
      'There is a lovely little loop here: something went well, and you noticed its value.',
      'The good feeling seems to have made room for appreciation too.',
      'It is nice when a bright moment is not rushed past before it can land.',
      'This sounds like a moment worth letting stay bright for another minute.'
    ],
    blend_anxiety_loneliness: [
      'Worry and loneliness often visit together, each one making the other feel more at home.',
      'When your mind is busy with worry and the quiet feels empty at the same time, that is a hard place to be.',
      'The worried thoughts and the feeling of being alone may be strengthening each other right now.',
      'Both the anxiety and the sense of isolation seem present at the same time, and either one might be a place to start.'
    ],
    blend_health_anxiety: [
      'Worrying about your health and carrying general anxiety often walk the same road; noticing which one leads may help you find a starting point.',
      'The concern about your body and the sense of worry are probably talking to each other in ways that can feel hard to untangle.',
      'It makes sense that health concerns would stir up more general worry, or the other way around.',
      'These two threads, what your body is doing and what your mind is fearing, may be woven together more tightly than they first appear.'
    ],
    blend_grief_anger: [
      'Grief and anger often share the same space, especially when a loss leaves things unresolved between you.',
      'The loss and the anger may be connected: sometimes the pain has nowhere else to go.',
      'Beneath the anger about this loss there may be something that still needs to be said or grieved.',
      'Grief and anger are both present here, and that combination carries its own, particular kind of weight.'
    ],
    blend_anxiety_stress: [
      'Anxiety and stress often travel together, each one making the other feel more urgent. Untangling which one started first may offer a useful starting point.',
      'The worry and the pressure seem to be feeding each other. Noticing which one is more present at different moments can help you see the pattern.',
      'When the mind is both worried and under pressure, it can be hard to find a still point. A short pause to breathe might create a little space between them.',
      'Both the sense of threat and the feeling of overload are present here. Reducing either one even a little can make the other more manageable.'
    ],
    blend_stress_work: [
      'The pressure you are describing seems closely tied to what work is demanding of you, and that connection is worth paying attention to.',
      'Work stress has a way of following you home and settling into the quiet hours. Finding a transition ritual between work and rest might help.',
      'When the workload and the overwhelm are this closely linked, the boundary between them may be the first thing worth protecting.',
      'The work demands and the stress they create seem to be reinforcing each other. A small shift in either one could begin to loosen the loop.'
    ],
    blend_sleep_stress: [
      'When stress is high, sleep is often the first thing to suffer, and poor sleep makes the stress harder to carry. That is a weary cycle.',
      'The pressure you are under during the day may be spilling into your nights. A brief wind-down practice could help draw a line between them.',
      'Rest and stress do not share space well. If the mind is still running through demands at night, it may need more than a few minutes to settle.',
      'Your body is telling you it needs rest, but your mind is still holding the day. A small buffer between activity and sleep can make a real difference.'
    ],
    blend_grief_stress: [
      'Grief itself is a kind of weight that can make ordinary demands feel overwhelming. The loss may have reduced your capacity for handling additional pressure.',
      'Mourning takes emotional energy, and when the daily demands do not pause for grief, the exhaustion can compound in ways that are hard to name.',
      'It is hard to hold both loss and the ordinary pressure of life at the same time. One of them may need to be set down briefly so you can breathe.',
      'The grief may be making the stress heavier and the stress may be leaving less room for the grief. Neither one can be fully felt when both are competing for the same attention.'
    ]
  };
  R.recapTemplates = [
    'So far, {topics} have been part of the conversation, and {entities} stood out. Which thread feels most useful to pick up?',
    'The short summary is: {topics}. You also brought up {entities}. Where would you like to go from here?',
    'I have heard a few connected threads - {topics} - alongside {entities}. Which one is asking for your attention now?',
    'The conversation has touched {topics}; {entities} gives it a more personal shape. What feels most present?'
  ];
  R.humanTouch = [
    'That {surface} detail is still with me; does it feel different now?',
    'The {surface} thread has a little more to it than it first seemed.'
  ];
  R.wordRepetitionResponses = [
    'You keep saying "{word}". Are you testing me, or is there something about {word} on your mind?',
    'I notice you have mentioned "{word}" several times now. That seems significant.',
    '"{word}" keeps coming up in what you are saying. What is it about {word} that draws your attention?',
    'You have said "{word}" quite a few times. Is there something specific you want to explore about it?',
    'Alright, "{word}" it is. You have my attention. What is really going on with {word}?',
    '"{word}" again. I am starting to think this matters more than it first seemed.'
  ];
  R.topicRecoveryResponses = {
    _default: [
      'We touched on something important earlier. Would you like to come back to it, or is there something else on your mind?',
      'I noticed we moved away from something that seemed to matter. Do you want to return to it?'
    ],
    family: [
      'I am still curious about your family. Would you like to continue there?'
    ],
    work: ['The work thread is still open. What has changed there since then?'],
    sleep: ['How has your sleep been since we last talked about it?'],
    sadness: ['Is that sadness still with you?'],
    anxiety: ['Is that worry you mentioned still there?'],
    anger: ['Is that anger still sitting with you?'],
    loneliness: ['Is that feeling of loneliness still around?'],
    grief: ['Would you like to talk more about that loss?'],
    relationship: ['How are things going with that relationship?']
  };
  R.emotionCalibration = {
    hurt: 'That sounds painful.',
    confused: 'It is okay to feel uncertain about this.',
    excited: 'That is wonderful!',
    angry: 'I hear the frustration in your words.',
    grieving: 'I am here with you in this.',
    fear: 'That sounds frightening. I am here with you.',
    anxious: 'Take your time with this.',
    sad: 'I can hear the sadness in what you are saying.',
    hopeless: 'That sounds like a heavy weight to carry.',
    overwhelmed: 'That is a lot to hold.',
    ashamed: 'That sounds painful to sit with.',
    jealous: 'That is a tough feeling to hold.',
    hopeful: 'I can hear the hope in your voice.',
    grateful: 'That is a beautiful perspective.',
    happy: 'I am glad to hear that.'
  };

  R.greetings = [
    ...R.greetingsPhase1,
    ...R.greetingsOpen,
    ...R.greetingsInviting,
    ...R.greetingsReturning
  ];

  // Rule-specific response pools
  // Extracted from en.js rules[] array by refactoring script.

  // --- Rule-specific response pools (extracted from rules[] array) ---

  // --- Rule-specific response pools ---

  // --- Rule-specific response pools (extracted from rules[] array) ---

  // --- Rule-specific response pools (extracted from rules[] array) ---
  R['ruleSafety'] = [
    "What you just shared matters a great deal, and I want you to know you're not alone. Is there someone nearby you could reach out to or be with right now?",
    "That sounds like a very heavy weight to carry, and it deserves real, immediate support. Please reach out to a crisis line or someone you trust right now. I'm here with you, but I'm not a substitute for urgent professional help."
  ];

  R['ruleGreetingHi'] = [
    'Hi. It is good to see you. What would you like to share today?',
    'Hi. I am here and glad you stopped by. What is on your mind?',
    'Hi. No rush at all. What kind of conversation would feel right?',
    'Hi. Good to have you here. What has your attention?',
    'Hi. It is nice to meet you. How has today been treating you so far?',
    'Hi. I am glad you are here. What has been on your heart lately?'
  ];

  R['ruleGreetingHello'] = [
    'Hello. I am here. We can keep it brief or follow a thread. What suits you?',
    'Hello. No rush. What kind of conversation would feel right?',
    'Hello. It is good to see you. What would you like to talk about?',
    'Hello. I am listening. What has your attention today?',
    'Hello. It is good to see you. How has your day been?',
    'Hello. I am all ears. What would you like to get off your chest?'
  ];

  R['ruleGreetingHey'] = [
    'Hey. Good to have you here. What has your attention?',
    'Hey. Glad you are here. What would you like to share?',
    'Hey. No pressure at all. What feels important right now?',
    'Hey. Good to see you. What is on your mind today?',
    'Hey. What has been on your mind since we last talked?'
  ];

  R['ruleGreetingGoodMorning'] = [
    'Good morning. It is good to see you. How is your day starting off?',
    'Good morning. I hope your day is off to a gentle start. What is on your mind?',
    'Good morning. No rush at all. What would you like to talk about?',
    'Good morning. How did you sleep, and how are you feeling now?',
    'Good morning. What is one thing you hope today brings?'
  ];

  R['ruleGreetingGoodEvening'] = [
    'Good evening. It is good to have you here. How has your day been?',
    'Good evening. I am here to listen. What would you like to share?',
    'Good evening. No rush. What is on your mind as the day winds down?',
    'Good evening. How is the day leaving you feeling right now?',
    'Good evening. What part of today would you like to put into words?'
  ];

  R['ruleGreetingGoodAfternoon'] = [
    'Good afternoon. It is good to see you. What has your attention today?',
    'Good afternoon. I am here and ready to listen. What would you like to talk about?',
    'Good afternoon. No rush at all. What feels important right now?',
    'Good afternoon. How is the middle of your day treating you?',
    'Good afternoon. What is taking up space in your mind today?'
  ];

  // Each emotional pool mixes open questions with caring statements so
  // the reply stays on-topic even when the question budget is spent
  // (the budget filter keeps only non-question lines then).
})(typeof window !== 'undefined' ? window : globalThis);
