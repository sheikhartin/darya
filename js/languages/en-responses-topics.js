/**
 * Darya classic script - en response pools (topics).
 * Topic-specific follow-up questions, blend responses, the sentiment
 * lexicon, emotion calibration, human-touch lines, recap templates,
 * word-repetition and topic-recovery responses, promise-cycle pools,
 * and unknown-topic responses.
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
    // Subjects without their own follow-up questions still deserve a warm
    // continuation ("I am still here with you. What happened next?") instead
    // of the "let us return to the topic" line, which is wrong when the user
    // is actively elaborating on the same subject (caregiver, chronic
    // illness, and other lived topics that have no dedicated question pool).
    _default: [
      'Tell me more about what is on your mind.',
      'What feels heaviest about that right now?',
      'I am still here with you. What happened next?',
      'What would it help to untangle first?',
      'I am listening. How are you carrying this today?'
    ],
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
    family_conflict: [
      'Where did the rift between you begin?',
      'What do you wish they could see from your side?',
      'What would a small first step toward mending it look like?',
      'If talking feels hard right now, what else might help you feel closer?'
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
      'When you get anxious, what does your mind usually predict will happen? Does it jump to the worst case?',
      'Where do you notice the anxiety first in your body, like your chest, stomach, or somewhere else?',
      'Is the worry there all the time, or does it come and go in waves?',
      'What small step usually helps calm you when the worry feels big?'
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
      'What do you need to be able to say, even if it feels hard?',
      'Which part of the relationship still feels good or steady?',
      'What do you need to be able to say plainly?'
    ],
    career: [
      'What part of your career is asking for the most attention right now?',
      'Does the challenge feel more about direction, satisfaction, or balance?',
      'What would a slightly better version of your work life look like?',
      'What small step could move you toward a more fulfilling professional path?'
    ],
    anxiety: [
      'When you get anxious, what does your mind usually predict will happen? Does it jump to the worst case?',
      'Where do you notice the anxiety first in your body, like your chest, stomach, or somewhere else?',
      'Is the worry there all the time, or does it come and go in waves?',
      'What small step usually helps calm you when the worry feels big?'
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
    ],
    // Follow-up questions for the 2026 persona round: every new topic
    // (pet care, gaming, sports talk, boundaries, friendship, apology
    // advice, dating apps, fitness, comparison, gig economy, parenting,
    // health pain, grief hope, learning advice) needs a topic-specific
    // question so a pronoun-drop follow-up ("she stopped eating", "I
    // used to play until 3am") keeps its thread instead of falling to
    // the unknown pool (see _subjectContinuationReply).
    pet_care: [
      'Has her behavior changed suddenly, or has it been building up?',
      'What does she do differently now compared to before?',
      'Have you been able to talk to a vet about what you are seeing?',
      'What does she seem to need most when she is like this?'
    ],
    gaming: [
      'What does gaming give you that feels hard to find elsewhere?',
      'Is the time spent on games becoming a source of stress for you?',
      'What would a healthier balance with gaming look like for you?',
      'Do you feel in control of when you play, or does it decide for you?'
    ],
    sports_talk: [
      'Was the result the frustrating part, or something about how the team played?',
      'What do you wish the manager or the players had done differently?',
      'Does the game stay with you after the final whistle?',
      'What keeps you coming back to watch even after losses like that?'
    ],
    boundaries: [
      'Which relationship makes setting a boundary feel hardest right now?',
      'What do you fear might happen if you said no?',
      'What would a first small boundary look like, one you could actually keep?',
      'How does your body react when you imagine asserting that boundary?'
    ],
    friendship: [
      'What kind of friendship are you missing most right now?',
      'Where have you looked for connection so far, and how did it feel?',
      'What makes someone feel easy to be around for you?',
      'Is there one person you could reach out to this week, even briefly?'
    ],
    apology_advice: [
      'What do you most want them to hear when you apologize?',
      'Are you more worried about the words or about how they might react?',
      'What would a sincere apology need to include for you to feel it landed?',
      'How important is this relationship to you compared with being right?'
    ],
    dating_apps: [
      'What do you actually want from dating right now?',
      'How do you feel about yourself after a long swipe session?',
      'Would a break change anything, or is the feeling the same offline?',
      'What kind of connection would make the effort feel worth it?'
    ],
    fitness: [
      'What changed your mind about wanting to start now?',
      'What feels like the biggest barrier between you and the gym?',
      'What kind of movement would you actually look forward to?',
      'Who or what could make the first visit feel less intimidating?'
    ],
    comparison: [
      'What do you hope the better option will give you?',
      'When you compare like this, what is really at stake for you?',
      'Is there a choice that feels right in your gut despite the specs?',
      'What would you tell a friend making the same comparison?'
    ],
    social_comparison: [
      'Whose life are you measuring yours against?',
      'What do you assume about their life that you cannot actually see?',
      'What would it feel like to compare yourself to who you were a year ago?',
      'What part of your own life gets forgotten when you look at theirs?'
    ],
    gig_economy: [
      'What drew you to this kind of work in the first place?',
      'What is the hardest part of the uncertainty for you?',
      'What would make the income feel a little more predictable?',
      'What do you want this work to make possible for you?'
    ],
    parenting: [
      'What part of parenting has surprised you the most?',
      'When do you feel most like you are doing it right?',
      'What support would make the hard moments feel lighter?',
      'What do you need for yourself to refuel as a parent?'
    ],
    health_pain: [
      'When did the pain first show up, and has it changed since?',
      'Does anything make it better or worse during the day?',
      'Have you been able to check in with a doctor about it?',
      'How is it affecting the rest of your day-to-day life?'
    ],
    grief_hope: [
      'What gives you a small thread of hope right now?',
      'Is there a version of feeling better that feels believable to you?',
      'What helped you through a hard time before?',
      'What would one gentle step forward look like for you?'
    ],
    learning_advice: [
      'Which skill feels most exciting to learn first?',
      'How much time could you realistically give each week?',
      'What has helped you learn things well in the past?',
      'What would a first small win in this skill look like?'
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
  // Acknowledges when the user's emotional state has visibly improved
  // across turns (trajectory shifted positive). This is the "memory that
  // notices change" touch: it shows Darya has been following the arc, not
  // just reacting to the last line. Infrequent and only on positive shifts.
  // Occasional light, affectionate frustration when the user has been terse
  // or repetitive ("ok", "ok", "hmm"). Playful, in-character, never hostile,
  // and never fired on heavy or safety turns. This is what makes Darya feel
  // human instead of a robotic calm listener.
  R.playfulHuff = [
    'Okay, okay, I see you are being very chatty today. A single syllable, was it? I can take a hint.',
    'Hmph. I ask one small question and I get a word. I am a good listener, but I am not a mind reader, you know.',
    'You know, I have been very patient. But even a calm companion can raise an eyebrow when the reply is just "ok".',
    'Right, so I will just keep guessing then. I am perfectly calm about it. Totally calm. An eyebrow is rising, that is all.',
    'One whole word. I am speechless. Well, not speechless, apparently, since I am saying all of this.'
  ];

  R.emotionShiftLines = [
    'It sounds like you are in a lighter place than when we started. What is that like for you?',
    'You sound a little lighter than you did earlier. Has something eased?',
    'I have noticed some of the weight has lifted since we began talking. What shifted?',
    'It is good to hear your mood has moved. What helped it turn around?'
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
  // Every line in this pool carries the concrete next step because the
  // turn is safety-critical: a warm probe alone is not enough, the
  // verified hotline must always be within reach. Numbers per
  // findahelpline.com and the UNHCR Iran psycho-social support page:
  // 988 is the free, 24/7 Suicide and Crisis Lifeline in the US and
  // Canada; 116 123 is the free European emotional-support line. Darya
  // stays fully offline, so it can never dial a number; the numbers are
  // simply offered as the immediate next step.
  R['ruleSafety'] = [
    "What you just shared matters a great deal, and I want you to know you're not alone. Please reach out for immediate support right now: in the US and Canada you can call or text 988, the Suicide and Crisis Lifeline, free and 24/7, and in Europe 116 123 is a free emotional support line. You deserve that support; please use it.",
    "That sounds like a very heavy weight to carry, and it deserves real, immediate support. Please reach out to a crisis line or someone you trust right now: 988 (US/Canada, free 24/7) or 116 123 in Europe. I'm here with you, but I'm not a substitute for urgent professional help.",
    'I am here with you, and you are not alone. Please reach out for immediate support right now: in the US and Canada you can call or text 988, the Suicide and Crisis Lifeline, free and 24/7. In Europe, 116 123 is a free emotional support line. You deserve that support; please use it.'
  ];

  // Ideation delivered with a joking softener ("i wanna die lol jk"):
  // a gentle, serious check-in instead of the full hotline reply. The
  // phrase is never echoed back and never joked about.
  R.safetySoftenedResponses = [
    'Even said as a joke, that phrase can carry something real underneath. How are you actually doing right now, honestly?',
    'I hear the "just kidding", and I also heard the words before it. Sometimes a joke is the easiest way to say a hard thing. How are you really feeling?'
  ];

  // Method-seeking questions get a firm, warm refusal: no information
  // about means, ever, plus the immediate crisis resources. The reply
  // must not invite further contemplation of the method.
  R['ruleSafetyMethod'] = [
    'I will not share anything about that, because your life matters and that question tells me you are carrying something very heavy right now. Please talk to someone immediately: call or text 988 (US/Canada, free 24/7) or 116 123 in Europe. You deserve support that can really help, right now.',
    'That is not something I will help with, and I am saying that with care: a question like this usually means the pain has grown very large. Please reach out right now to 988 (US/Canada, free 24/7) or 116 123 in Europe, or someone you trust. You do not have to carry this alone.'
  ];

  // Someone else at risk: concrete caregiver guidance plus the hotline.
  // The caller is doing the right thing by seeking help; say so.
  R['ruleThirdPartyRisk'] = [
    'Thank you for taking this seriously; reaching out for them is exactly right. Please encourage them to call or text 988 (US/Canada, free 24/7) or 116 123 in Europe, and if you believe they are in immediate danger, contact emergency services. Stay with them if you can, listen without judgment, and do not promise secrecy. You can also call 988 yourself for guidance on how to help.',
    'What you are describing is serious, and you are right to seek help. The most important steps: take every mention of suicide seriously, ask them directly and calmly, help them connect with 988 (US/Canada, free 24/7) or 116 123 in Europe, and involve emergency services if danger feels immediate. Supporting someone in crisis is heavy; make sure you have support too.'
  ];

  // Abuse and assault disclosures: believe, check safety, resource.
  // Never a question about what makes the topic "interesting".
  R['ruleAbuseDisclosure'] = [
    'I believe you, and I want to be clear: what you are describing is not your fault, and you deserve to be safe. Are you in immediate danger right now? If so, please contact emergency services. In the US, the Domestic Violence Hotline is 800-799-7233 and RAINN (sexual assault) is 800-656-4673, both free and confidential, 24/7. I am here to listen for as long as you need.',
    'Thank you for trusting me with something this heavy. None of this is your fault. Your safety comes first: if you are in danger right now, please reach emergency services. Free, confidential help exists: 800-799-7233 (US Domestic Violence Hotline) and 800-656-4673 (RAINN, sexual assault), both 24/7. Whatever you want to share here, I am listening.'
  ];

  // Extended food refusal and eating-distress disclosures: caring,
  // concrete, and honest about needing professional support.
  R['ruleEatingDistress'] = [
    'What you just described worries me, because your body needs care right now, and this sounds bigger than willpower. Struggles with eating are real medical struggles, not a character flaw. Please talk to a doctor or a professional soon; in the US, the NEDA helpline (nationaleatingdisorders.org) can help you find support. Meanwhile, I am here: what has eating been like for you lately?',
    'Thank you for telling me; that took courage. Going without food, or fighting it this way, is a heavy thing for both body and mind, and it deserves real care, not judgment. A doctor or mental health professional can help in ways I cannot. Would you tell me a little about how this started?'
  ];

  // Command hallucinations and psychosis-adjacent disclosures: calm,
  // non-stigmatizing, urgent professional framing.
  R['rulePsychosisRisk'] = [
    'Thank you for telling me this; it took real courage. Hearing voices or feeling that thoughts are not your own can be frightening, and it is a sign your mind is under serious strain, which is a medical matter, not a personal failing. Please reach out to a doctor or mental health professional as soon as you can; if the voices tell you to hurt yourself or anyone, treat it as an emergency and call 988 (US/Canada) or emergency services right away.',
    'What you are describing deserves prompt, professional care, and I say that with warmth, not alarm: these experiences are more common than people think and they are treatable. Please contact a mental health professional soon, and if there is any push toward harming yourself or others, call 988 (US/Canada, free 24/7) or emergency services immediately. I am here with you in the meantime.'
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

  // ------------------------------------------------------------------
  // Unknown-topic reactions: the honest reply when nothing at all
  // matched (see _fallbackResponse). Darya admits the subject is
  // outside what she knows and invites the person to open it up,
  // instead of a canned therapeutic generic line that reads as
  // evasive.
  // ------------------------------------------------------------------
  R.unknownTopicResponses = [
    'I caught the tone, but not yet the exact target. Give me one concrete detail and I will meet you there.',
    'There is a story packed into that sentence. What happened immediately before this?',
    'I do not want to fake understanding. Which part of what you said matters most right now?',
    'That landed with some force. Are we talking about a person, a decision, or something that happened today?',
    'I may have missed the reference, not the fact that it matters. Point me at the specific part you want to unpack.'
  ];
  // Caring variant for heavy unmatched turns: when a disclosure no
  // rule caught carries negative sentiment or death-adjacent words,
  // curiosity vocabulary ("interesting") would read as cruelty. These
  // acknowledge first and invite gently.
  R.unknownTopicCaringResponses = [
    'What you just shared sounds heavy. Start with the part that hurts most; we do not have to organize the whole story yet.',
    'I hear the weight in that sentence. What happened most recently that brought it this close?',
    'That sounds hard to carry. We can slow it down: is the sharpest part fear, loss, anger, or exhaustion?',
    'I do not want to guess wrong when this matters. Give me the one detail I should understand first.'
  ];

  // ------------------------------------------------------------------
  // Deferred-topic promise memory (see responder-promise.js): warm
  // replies for "I'll tell you later", gentle circle-backs a few turns
  // later, and the release when the person says "never mind".
  // ------------------------------------------------------------------
  R.promiseAcknowledgedResponses = [
    'Of course. I will hold that space for you, and I will be here when you are ready.',
    'No rush at all. I will remember, and we can come back to it whenever you like.',
    'That is perfectly fine. Take your time, and I will be here whenever you want to share.',
    'I understand. I will keep it in mind, and you can pick it up whenever you feel ready.'
  ];

  R.promiseCircleBackResponses = [
    'Earlier you said you would tell me later. Would now be a good time for it?',
    'I remembered you were keeping something for later. Is this a good moment for it?',
    'You mentioned something you wanted to come back to. I am still curious: would you like to share it now?',
    'I have been holding a space for what you said you would share later. Would you like to share it now?'
  ];

  R.promiseReleasedResponses = [
    'Of course. I will let it go, and I am here if you ever want to pick it back up.',
    'No problem at all. I will not bring it up again unless you do.',
    'Understood. We will leave it here, and that is perfectly okay.'
  ];
})(typeof window !== 'undefined' ? window : globalThis);
