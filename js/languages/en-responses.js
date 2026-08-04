/**
 * Darya classic script - en response pool.
 */
(function (global) {
  'use strict';

  const R = {};

  // Long lines in this file are intentional (embedded response strings).

  R.emptyInputReply =
    "I notice you've gone quiet. Whenever you're ready, I'm here.";
  R.engineErrorReply = 'I need a moment to process that. Could you repeat it?';
  R.emptyInputReply =
    "I notice you've gone quiet. Whenever you're ready, I'm here.";
  R.engineErrorReply = 'I need a moment to process that. Could you repeat it?';

  R.genericFallbacks = [
    'There is a thread here worth following. What part of it would you like to explore?',
    'We can take this one piece at a time. Where would you like to start?',
    'That gives me a clearer place to begin. What else should I know?',
    'I am listening for the detail that matters most. What stands out to you?',
    'This feels worth giving a little room to. What makes it significant?',
    'I hear what you are saying. What does that bring up for you?',
    'That is something to sit with for a moment. What comes next?',
    'I want to make sure I understand you well before we go further.',
    'There is room in this conversation for what you are carrying.',
    'Sometimes it helps just to notice what has brought you to this moment.',
    'What would it look like if you gave yourself permission to set this down for a moment?',
    'How does it feel to say that out loud, now that you have?',
    'You do not need an answer this minute; we can look at it together.',
    'I am here with you in this, and there is no rush.',
    'Saying it out loud is already an important step.',
    'You do not have to have it all figured out to talk about it.',
    'This conversation is a safe place for these words.'
  ];
  R.strategyShiftFallbacks = [
    'Let us look at this from a new angle. Which part feels most present for you?',
    'If a good friend were hearing this, what would they want to ask you first?',
    'Alongside this, what else has been taking up space in your mind lately?',
    'What could make this moment feel a little more manageable right now?',
    'Sometimes moving back a little reveals what we could not see up close. What do you notice from a distance?',
    'If the situation had a shape, what would it look like from a distance?',
    'What would you want someone to understand most about this situation?',
    'If a close friend were in your place, what would you hope they would do or feel?',
    'If you could give this feeling a name, what would it be?',
    'What part of this do you feel you have the most control over right now?',
    'Is there something about this that keeps pulling you back even when you try to set it aside?',
    'If you imagine yourself a year from now looking back on this, what would you see?',
    'Let us pause here for a moment together.',
    'A step back can make things clearer.',
    'The fact that you are still turning it over is itself a step forward.'
  ];
  R.sessionCheckIns = [
    'We have touched on a few different things in this conversation. Which one feels most present for you right now?',
    'We have covered a fair amount so far. Would you like to sit with one of these a little longer?',
    'Several threads have come up today. Is there one you would like to come back to?'
  ];
  R.questionFallbacks = [
    "That's a thoughtful question. I don't have a perfect answer, but I'm curious what's making you think about it right now.",
    "That's worth sitting with. What's your own take on it?"
  ];
  // These lines acknowledge an unanswerable question warmly WITHOUT
  // bouncing another question back, so the turn never reads as
  // interrogative or evasive. Keep them question-free on purpose.
  R.questionAcknowledgements = [
    'I do not have a precise answer for this one, but we can look at it together.',
    'That is an interesting question in itself, and it is worth thinking about together.',
    'I do not have the answer right now, but we can sit with it.',
    'Honestly I do not have a clear answer, but it can be a good place to think.',
    'For this one I have no ready answer, but your words matter to me.'
  ];
  R.distressNudges = [
    "It seems like the last few messages have felt pretty heavy. If you'd like, we could pause for a moment: breathe in for a count of four, hold for four, breathe out for four. And if these feelings continue or get more intense, talking with a professional or someone you trust could really help.",
    "I notice this part of our conversation has felt heavy for you. We don't have to solve it all right now; if you want, we can just sit with it for a moment. And if these feelings stick around, being with a professional or someone you trust can make a real difference."
  ];
  R.humor = [
    'Ha. Okay, I am officially charmed.',
    'That made me smile.',
    'Fair enough - I have no comeback for that.',
    'I have to admit, that is a good one.',
    'You are fun. I will not pretend otherwise.',
    'Well, that was a delightful little plot twist.'
  ];
  R.warmth = [
    'That sounds like a lot to carry.',
    'I can hear that this matters to you.',
    'You do not have to have it all figured out at once.',
    'It is okay to take your time with this.'
  ];
  R.smalltalk = [
    'Nice. That has a good bit of character to it.',
    'That is a detail worth keeping.',
    'I like the way you put that.',
    'That gives the day a little color.'
  ];
  // A message made only of smileys or emoji gets a warm, light reply.
  R.emojiResponses = [
    'I can see that smile. :)',
    'Good to see you smiling. :)',
    'That smile is contagious. What is on your mind?',
    ':) Nice. Tell me more when you are ready.'
  ];
  R.gratitudeResponses = [
    'Of course.',
    'Anytime.',
    'I am here.',
    'That is kind of you to say.'
  ];
  R.topicShiftTemplates = [
    'That is a different thread from a moment ago, and it deserves its own space.',
    'We have moved from one part of your day to another; I am with you.',
    'This feels like a new angle on what has been going on.'
  ];
  R.professionalBoundary = [
    'For medical, legal, or financial decisions, a qualified human professional is the safest source of advice. I can help you organize the questions you want to bring them.',
    'This is one of those areas where a licensed human professional should guide the decision. We can sort the facts and concerns you want to take with you.'
  ];
  R.greetingsPhase1 = [
    'Hi. I am Darya. We can take this at your own pace. What feels most present for you right now?',
    'Hello. I am Darya. I am here to listen. What would you like to share today?',
    'Hi there. I am Darya. There is no rush here. What has been on your mind lately?',
    'Hello. I am Darya. This is a quiet space. Would you like to start anywhere in particular?',
    'Hi. I am Darya. You do not need to have anything prepared. What comes to mind for you?',
    'Hey. I am Darya. Think of this as a calm corner. What would feel good to begin with?',
    'Hello. I am Darya. No expectations, no rush. What has your attention at the moment?',
    'Hi. I am Darya. Welcome. What would you like to put into words today?'
  ];
  R.greetingsPhase2 = [
    'Would you like to say how your day has been, or just tell me what is on the surface of your mind?',
    'How has your day been so far? Or if that feels big, what is one small thing that crosses your mind right now?',
    'I am here whenever you are ready. Would it help to start with how the last few hours have been, or is there something quieter you want to name?',
    'You can start anywhere. Some people begin with the weather of their day; others go straight to what is pressing. Either works here.',
    'If you had to put one word or a short phrase to what is around you right now, what would it be?',
    'No right way to begin. Would you like to describe the feeling of your day, or share what is most present for you?',
    'What has been taking up space in your mind lately, even in a small way?',
    'If the day had a texture or a colour right now, what would it be?'
  ];
  R.greetingsOpen = [
    'Hi. What would you like to share today?',
    'Hello. What has been taking up space in your mind lately?',
    'Hi there. What brought you here today?',
    'Hello. Where would feel natural to begin?',
    'Hi. What is one thing from today you would like to put into words?',
    'Hello. What kind of conversation would suit you right now?',
    'Hi there. What would make this moment useful for you?',
    'Hello. What has your attention at the moment?'
  ];
  R.greetingsInviting = [
    'Hey. Anything in particular you would like to talk through, or shall we just see where it goes?',
    'Hi. If you have something on your chest, would you like to start there?',
    'Hello. I am here and curious - what brought you in today?',
    'Hey. Want to tell me a little about what is going on?',
    'Hi. There is no rush - what would feel good to start with?',
    'Hello. Where would feel easiest to start?',
    'Hi there. Is there something specific, or would you rather just chat for a while?',
    'Hey. What thought keeps wandering back today?'
  ];
  R.greetingsReturning = [
    'Welcome back. What feels most present this time?',
    'Good to see you again. Which thread would you like to pick up?',
    'You are back. What has changed since we last talked?',
    'Welcome back. What is asking for your attention today?',
    'It is nice to see you again. Where shall we begin this time?',
    'Back again. What has been following you around lately?',
    'Welcome. Is there an old thread or a new one on your mind?',
    'Hello again. What would you like to make room for today?'
  ];
  R.greetings = [
    ...R.greetingsPhase1,
    ...R.greetingsOpen,
    ...R.greetingsInviting,
    ...R.greetingsReturning
  ];
  R.farewells = [
    "Take care of yourself. I'm here whenever you'd like to talk again.",
    'Goodbye for now. I hope you feel a little lighter today.',
    'Until next time. Be gentle with yourself.',
    'Farewell for now. May the calm stay with you.',
    'Wishing you well. The quiet space is here whenever you return.'
  ];
  R.exitConfirmMessages = [
    'Are you sure you would like to end our conversation? If so, just say goodbye again and I will be on my way. Otherwise, I am still here.',
    'I hear you saying goodbye. If you really want to leave, just confirm and I will wish you well. If not, we can keep talking.',
    'Would you like to end this conversation? If you are sure, say so and I will say goodbye. If not, I am happy to continue.'
  ];
  R.repeatedGreetingResponses = [
    'You have greeted a few times now. It seems like you are not quite ready to start yet, and that is completely okay. I am here whenever you are.',
    'Good to see you again. I can see you are still finding the right words. There is no rush at all.',
    'It looks like you might be wondering where to begin. That is a natural place to be, and I am happy to wait.',
    'I notice you have greeted a few times. If you are not sure what to say, we can start with something small or just sit with the quiet for a moment.'
  ];
  R.frustrationResponses = [
    'I can feel the intensity in what you are saying. Let us take a breath together and slow it down a little.',
    'That came through loudly. I am still here and listening. Can you tell me what is underneath that feeling?',
    'I hear the strength in your words. It is okay to feel that way. What is the heart of it?',
    'That energy is important. Let me sit with you in it rather than rushing past it.',
    'I notice the emphasis. Take your time. There is no need to shout for me to hear you.'
  ];
  R.factualQuestionFollowups = [
    'Now, what is really on your mind today?',
    'Does that answer help, or is there something deeper you want to talk about?',
    'Numbers aside, what is the question that has been following you around?',
    'Happy to help with that. What else is present for you right now?',
    'Happy to help. What is next on your mind?'
  ];
  R.spamNoiseResponses = [
    'It looks like that might have been accidental. Whenever you are ready, I am here to listen.',
    'I am not quite sure what you meant by that. Would you like to try again?',
    'That did not come through clearly. Take your time, and I will be here when you are ready to share.'
  ];
  R.ambiguousInputResponses = [
    'I hear you. Could you tell me a little more so I can follow along better?',
    'That was brief, and I want to make sure I understand. What more can you share about that?',
    'Got it. If you would like to expand on that, I am all ears.'
  ];
  R.acknowledgementResponses = [
    'I notice you are acknowledging what I said, but I am curious what your own thoughts are on this.',
    'Thank you for that. How do you see the situation yourself?',
    'I appreciate the acknowledgement. What part of this feels most relevant to you right now?'
  ];
  R.correctionResponses = [
    'Thank you for clarifying. Let me adjust my understanding. What did you mean by that?',
    'I appreciate the correction. That helps me understand better. What else should I know?',
    'Got it, thanks for making that clear. How does this change things for you?'
  ];
  R.topicChangeResponses = [
    'I notice we have moved to something new. I am here for this new thread whenever you are ready.',
    'That is a different direction, and I am happy to follow. Where would you like to start with this?',
    'I am with you on this new topic. What feels most important to share about it?'
  ];
  R.testInputResponses = [
    'I am here and ready whenever you would like to have a real conversation.',
    'Hello! I am Darya. When you are ready to talk about something on your mind, I am listening.',
    'It looks like you might be testing me out. That is fine! When you are ready to share something real, I am here.'
  ];
  R.mixedLanguageResponses = [
    'I notice you are mixing languages. I am most helpful when we stick to English so I can follow along well. Could you write in English?',
    'It seems like you are switching between languages. I follow English best, so if you could stick to one, that would help me respond more thoughtfully.',
    'I want to make sure I understand you fully. Could we continue in English so I can give you my best attention?'
  ];
  R.teasingMockingResponses = [
    'I notice a hint of teasing there. That is okay. Is there something on your mind you would like to talk about?',
    'You seem to be giving me a gentle test. I do not mind at all. I am here when you want to share something real.',
    'That almost sounded like a compliment, but not quite. Is there something you really want to say?',
    'I can sense some playful energy there. That is fine. What is actually happening in your world right now?',
    'I hear you. If you are not quite ready for a serious conversation, we can just sit with the quiet for a moment.',
    'You are good at keeping me on my toes. What is really going on with you today?',
    'I appreciate the playfulness. When you are ready to talk about what matters, I will be right here.'
  ];
  R.boredomResponses = [
    'I have to say, this conversation feels a bit quiet today. Want to try a different topic?',
    'It seems like you might not have much to say right now, and that is perfectly okay. I am still here.',
    'Things have been pretty quiet on your end. Is there something you would like to talk about?',
    'We could sit with the silence for a moment. Sometimes that is what is needed.',
    'I feel like we have hit a bit of a pause. Want to change direction, or take a break?',
    'You seem a bit distracted today. I am here whenever you feel like chatting.',
    'It has been a few short replies in a row. No pressure at all, just letting you know I am paying attention.'
  ];
  R.wellBeingResponses = [
    'I appreciate you asking. I am doing well, thank you. More importantly, how are you feeling after everything you shared?',
    'That is kind of you to check in. I am doing fine. How are you holding up right now?',
    'Thank you for asking about me. That means a lot. How are you doing after all that?',
    'I am good, thank you. It means a lot that you would ask. How are you feeling now?',
    'I am here and doing well. Your thoughtfulness does not go unnoticed. How about you?'
  ];

  R.topicCallbacks = {
    family: [
      "I'm still curious about your family, by the way. Want to keep going there?",
      'That family thread seemed to carry some weight. Has anything shifted since you mentioned it?',
      'What is the one relationship in your family that comes to mind most often right now?'
    ],
    work: [
      'The work thread is still open. What has changed there since then?',
      'Work seems to have its own gravity in this conversation. How has that part of your day been?',
      'Is the workplace situation still the same, or has anything shifted?'
    ],
    sleep: [
      'How has your sleep been these days?',
      'Your sleep pattern came up earlier. Has it changed at all?',
      'Are you sleeping any better, or is it still restless?'
    ],
    sadness: [
      'Is that sadness still with you?',
      'The sadness you mentioned earlier, has it eased at all or is it still present?',
      'What has the sadness been like since we last touched on it?'
    ],
    anxiety: [
      'Is that worry you mentioned still there?',
      'That anxious feeling we talked about, is it still around or has it changed shape?',
      'How has the anxiety been since you last brought it up?'
    ],
    anger: [
      'Is that anger still sitting with you?',
      'The frustration you mentioned, has it settled or is it still close to the surface?',
      'Has the anger shifted direction or intensity since we talked about it?'
    ],
    loneliness: [
      'Is that feeling of loneliness still around?',
      'Have you found any moments of connection since we last talked about this?',
      'The loneliness you described, has it eased or is it still present in the same way?'
    ],
    self_esteem: [
      'Are those hard thoughts about yourself still showing up?',
      'The self-critical voice you mentioned, has it been louder or quieter lately?',
      'What has the inner critic been saying since we talked about it?'
    ],
    grief: [
      'Would you like to talk more about that loss?',
      'How have you been carrying the grief since we last spoke about it?',
      'Has anything shifted in how you feel about the loss?'
    ],
    motivation: [
      'Is finding motivation still difficult?',
      'Has the lack of energy or drive changed since we talked about it?',
      'What would a very small, doable step look like today?'
    ],
    relationship: [
      'How are things going with that relationship?',
      'Has anything changed in that relationship since you mentioned it?',
      'What is the most present feeling about that relationship right now?'
    ],
    health: [
      'How are you feeling physically these days?',
      'Has your physical health changed since we discussed it?',
      'What has been most on your mind about your health lately?'
    ],
    school: [
      'How are things going with school or exams?',
      'Has the academic pressure changed since we talked about it?',
      'What feels most manageable and what feels overwhelming right now?'
    ],
    money: [
      'Is that financial worry you mentioned still on your mind?',
      'How has the financial situation been since we talked?',
      'Has anything changed with the money concerns, or is it still the same?'
    ],
    mindfulness: [
      'Has the mindfulness practice shifted anything for you since we talked about it?',
      'Have you had a chance to try being present in any small way since then?',
      'What has your awareness been like since we last touched on this?',
      'Has the practice of noticing the present moment brought anything new to your attention?'
    ],
    stress: [
      'Has the pressure eased at all since we spoke about it?',
      'How has the stress been affecting you since you mentioned it?',
      'Has the feeling of being overwhelmed shifted at all?',
      'Have you found any small moments of relief since we talked about the stress?'
    ],
    resilience: [
      'Has the sense of being able to handle things shifted since we talked about resilience?',
      'What has helped you keep going when things felt hard?',
      'Have you noticed any small moments where you felt stronger or more able to cope?',
      'What would one small act of self-restoration look like today?'
    ],
    forgiveness: [
      'Has anything shifted in how you feel about letting go since we talked about forgiveness?',
      'What part of forgiving, yourself or someone else, feels hardest right now?',
      'Have you thought about what release might feel like in this situation?',
      'Is there a small step toward letting go that feels possible today?'
    ],
    purpose: [
      'Has your sense of purpose or meaning shifted since we talked about it?',
      'What part of your life feels most aligned with what matters to you right now?',
      'Have you noticed any moments that felt particularly meaningful lately?',
      'If you could create a little more meaning in one area, which would it be?'
    ],
    relationship: [
      'Has anything shifted in the relationship since we talked about it?',
      'What part of the connection feels most present for you right now?',
      'Have you noticed any changes in how you feel about the relationship?',
      'What would a small step toward clearer communication look like today?'
    ],
    career: [
      'Has anything changed with your career since we talked about it?',
      'How does your work feel to you these days?',
      'What part of your professional life is asking for the most attention?',
      'Have you noticed any moments of satisfaction or frustration with your work lately?'
    ],
    anxiety: [
      'Has the worry eased at all since we spoke about it?',
      'How has the anxiety been affecting your days?',
      'Have you found any small moments of relief from the worry?',
      'What has been most on your mind when the anxiety shows up?'
    ]
  };
  R.quotedCallbackTemplates = [
    'The phrase "{excerpt}" still has some weight. What part of it stays with you?',
    'That phrase - "{excerpt}" - still seems present. Has it shifted at all?'
  ];
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
    'Hi. Good to have you here. What has your attention?'
  ];

  R['ruleGreetingHello'] = [
    'Hello. I am here. We can keep it brief or follow a thread. What suits you?',
    'Hello. No rush. What kind of conversation would feel right?',
    'Hello. It is good to see you. What would you like to talk about?',
    'Hello. I am listening. What has your attention today?'
  ];

  R['ruleGreetingHey'] = [
    'Hey. Good to have you here. What has your attention?',
    'Hey. Glad you are here. What would you like to share?',
    'Hey. No pressure at all. What feels important right now?'
  ];

  R['ruleGreetingGoodMorning'] = [
    'Good morning. It is good to see you. How is your day starting off?',
    'Good morning. I hope your day is off to a gentle start. What is on your mind?',
    'Good morning. No rush at all. What would you like to talk about?'
  ];

  R['ruleGreetingGoodEvening'] = [
    'Good evening. It is good to have you here. How has your day been?',
    'Good evening. I am here to listen. What would you like to share?',
    'Good evening. No rush. What is on your mind as the day winds down?'
  ];

  R['ruleGreetingGoodAfternoon'] = [
    'Good afternoon. It is good to see you. What has your attention today?',
    'Good afternoon. I am here and ready to listen. What would you like to talk about?',
    'Good afternoon. No rush at all. What feels important right now?'
  ];

  // Each emotional pool mixes open questions with caring statements so
  // the reply stays on-topic even when the question budget is spent
  // (the budget filter keeps only non-question lines then).
  R['ruleFamily'] = [
    'Which part of {captured} stands out most right now?',
    'How does your relationship with your family feel to you these days?',
    'What comes up for you when you think about {captured}?',
    'What made {captured} come to mind just now?',
    'Family can hold some of our warmest and heaviest feelings at once. I am listening.',
    'That part of your family life sounds like it carries real weight for you.'
  ];

  // ruleWork deliberately avoids embedding the raw capture in a question
  // template. The work rule captures the rest of the user's sentence
  // (e.g. "always ignore me"), which is often a verb phrase that would
  // make "How has {captured} been affecting you?" ungrammatical.

  R['ruleWork'] = [
    'Work can weigh on you in ways that spill into everything else. How has the situation been affecting you?',
    'Which part of your work situation feels hardest right now?',
    'If things at work were better, what would actually be different?',
    'Carrying that much work pressure on your own is genuinely hard.',
    'Work is more than the hours; the weight of it can follow you home.'
  ];

  R['ruleWordMeaning'] = [
    'Now you are testing my vocabulary too. I know "{captured}", but I would rather hear what it means to you.',
    '"{captured}" is a lovely word. Tell me, what does it bring up for you?',
    'I have heard "{captured}" before. What made it come to mind right now?',
    'Every word carries a meaning, but the meaning it has for you matters more. What does "{captured}" feel like?'
  ];

  R['ruleAskMeQuestion'] = [
    'Okay, my turn to ask: what moment from today would you like to relive?',
    'Here is one: which part of this week is still on your mind?',
    'Let me ask you: when did you last laugh out loud, and what was it about?',
    'If you had one free hour today, what would you do with it?',
    'What thought keeps following you around these days?'
  ];

  R['ruleSelfImprovement'] = [
    'Honestly, every conversation with you is a chance for me to learn. What would you like me to do better?',
    'You are right, there is always room to grow. What do you need from me right now?',
    'I am always working on listening better. Tell me what would help you most.',
    'Good point. Which part of how I respond should I work on first?'
  ];

  R['ruleWhatDoIDo'] = [
    'Let us first hear where the pressure is coming from, then we find one small step together.',
    'A solution usually starts with naming the problem more clearly. Let us sit with it together.',
    'The first step can be very small. Whatever it is, we can take it one step at a time.',
    'There is no single right answer, but together we can find a step that fits.'
  ];

  R['ruleUnsureTopic'] = [
    'No worries. Let us start simple: which one feels closest to your mind right now?',
    'You do not have to pick right away. My suggestion is to start with the first topic you mentioned.',
    'It is okay not to know yet. Which one feels lighter to talk about?',
    'I can offer one and you react to it: let us start with what has been with you the most today.'
  ];

  R['ruleSleep'] = [
    "It sounds like your sleep hasn't been restful lately. When did that start?",
    "Trouble sleeping can be a sign that something's weighing on your mind. What's been occupying your thoughts lately?",
    "When you can't sleep, where does your mind usually go?",
    'Sleepless nights can feel incredibly long and draining. That is a lot to carry.',
    'Not sleeping well takes a toll on both body and mind; you do not have to shoulder it alone.'
  ];

  R['ruleAnxiety'] = [
    'Anxiety can be so exhausting. What exactly has been worrying you?',
    'When that stress hits, what does it feel like in your body?',
    'On a scale of 1 to 10, how intense is this worry right now?',
    'That kind of worry can be really draining on its own.',
    'Anxiety has a way of making everything feel louder than it actually is.',
    'Just naming that it is there can sometimes take a little of its weight away.'
  ];

  R['ruleJoy'] = [
    "I'm glad you're feeling this way! What brought it on?",
    "That's good to hear. What part of it stands out to you?",
    'Where do you feel that good feeling in your body?',
    'That is lovely. I am glad you are experiencing that.'
  ];

  R['ruleLoneliness'] = [
    'Loneliness can feel really heavy. How long has this feeling been with you?',
    'When you say you feel alone, do you mean not having people to talk to, or something deeper?',
    "Who's the person you feel closest to these days, even if you don't see them often?",
    'Loneliness can be especially hard to carry on quiet days.',
    'That feeling of being alone is something many people experience; you are not strange for feeling it.'
  ];

  R['ruleSelfEsteem'] = [
    'Those are heavy things to feel about yourself. Where do you think that belief comes from?',
    'What usually brings on thoughts like that?',
    'If a friend said this about themselves, what would you tell them?',
    'Those kind of thoughts about yourself can feel very convincing, even when they are not the full picture.'
  ];

  R['ruleGrief'] = [
    'Losing someone is one of the hardest things a person can go through. Do you want to talk about it a little?',
    "Whatever you're feeling about this loss is valid. How have you been coping with it lately?",
    "I'd like to hear about them, if you'd like to share.",
    'I am sitting with you in this loss. It is okay to feel what you feel about it.',
    'There is no right or wrong way to grieve. What has the last little while been like for you?',
    'Grief can show up in unexpected moments, even when you think you are doing okay. How have the days been treating you?'
  ];

  R['ruleSmalltalkHowareyou'] = [
    "I'm doing well, thank you for asking! I'm glad to be here with you. How are you doing today?",
    "I'm good, thanks for asking! I'd love to hear how you're doing.",
    'I am doing well, thank you. I am glad to be here with you.',
    "I'm doing well, thank you for asking. Your presence in this conversation matters to me.",
    'I am well, thank you for asking.'
  ];

  R['ruleSmalltalkIdentity'] = [
    "I'm Darya, a companion here to listen. I'm not a real person, just a calm space to think out loud.",
    "I'm a simple chat companion, not a human. But I'm genuinely here to listen.",
    'I am Darya, a conversation companion. I am here for whatever you want to share.',
    'I am Darya, made by Artin as a tribute to ELIZA, the first chatbot, from MIT. I am here to listen to you.'
  ];

  R['ruleSmalltalkCapability'] = [
    "I'm here to listen, ask questions, and sit with you when something's on your mind. I'm not a substitute for a professional, but I can be a patient ear.",
    "I can be a good companion for thinking out loud. I listen and ask open questions to help you get clearer on how you're feeling.",
    'Think of me as a calm space where you can put your thoughts into words without any pressure.'
  ];

  R['ruleSmalltalkSilly'] = [
    'I do not have personal tastes, but I like the idea of comfort. What made you ask that right now?',
    "I don't really do those things myself, but I am curious what brought that question to mind.",
    'That is a fun question. I think it says more about what you are curious about than about me. What do you think?',
    'If I could, I would say yes. But I am more interested in what is on your mind.'
  ];

  R['ruleMotivation'] = [
    'When motivation is gone, even small things can feel heavy. When did this start?',
    'If you took one very small step, what might that look like?',
    'What usually helps you get moving again, even a little?',
    'It can be really hard to start anything when the energy is just not there.'
  ];

  R['ruleRelationship'] = [
    "Relationships can hold both our deepest joys and our hardest moments. What's been happening?",
    'Right now, are you looking more to vent about this, or to think through what to do?',
    'What place does this relationship hold in your life?',
    'I can hear that this relationship matters to you and has its own weight.'
  ];

  R['ruleHealth'] = [
    "Worrying about your health can take up a lot of mental space. What's concerning you most?",
    'Have you had a chance to talk to a doctor about it?',
    'How much has this been affecting your day-to-day lately?',
    'Health concerns naturally draw a lot of attention and concern.'
  ];

  R['ruleMindfulness'] = [
    'That awareness of the present moment is a helpful starting point. What do you notice when you pause like this?',
    'Bringing attention to the breath is one of the simplest things we can do, and it can also be one of the hardest. What comes up for you when you try it?',
    'There is no wrong way to practice presence. Sometimes just noticing that your mind has wandered and gently guiding it back is the practice itself.',
    'The fact that you are even considering mindfulness tells me something about your willingness to be with yourself as you are, which is quietly powerful.',
    'It can be helpful to start with something very small, like noticing one full breath from start to finish, without changing anything about it.',
    'What you are describing is a kind of attention that is not trying to fix anything, just to be present. That openness has its own value.'
  ];

  R['ruleSimplify'] = [
    'You are right, let me say it more simply. The core of it: what you shared matters, and I am here with you.',
    'Fair point, I will keep it shorter. Plainly: you matter, and your words are heard.',
    'Sorry if that got complicated. Simply put: whatever is on your mind, you can say it here.',
    'Understood, I will keep it simple. The essence: you are not alone, and this conversation is for you.'
  ];

  // App and website feedback: when the user comments on the app itself
  // (the theme, the waves, the design), Darya acknowledges the feedback
  // warmly and gently returns to the conversation instead of answering
  // with an unrelated generic line.
  R['ruleAppFeedback'] = [
    'Thanks for sharing your thoughts. I cannot change the look of the app itself, but I am here for our conversation. What would you like to talk about?',
    'I appreciate your feedback. This space is built for calm conversation, so if you like, we can talk about you and how your days have been.',
    'I understand those details matter to you. I am a conversation companion; tell me what has been on your mind lately.',
    'Thank you for your attention to it. This conversation is yours; where would you like to begin?'
  ];

  R['ruleStress'] = [
    'That sounds like a lot of pressure has been building up. When did it start to feel this intense?',
    'It is hard to carry that much weight and still show up each day. What would one small release look like, even if it is just for a few minutes?',
    'You are describing a state that often comes from giving more than you have had a chance to replenish. Is there one area that is demanding more than the others?',
    'The fact that you are still going despite feeling this way says something about your resilience. But resilience does not mean you should have to keep going without relief.',
    'When everything feels like too much, the smallest thing can feel like the biggest task. Is there one thing you could set down, even temporarily, that would lighten the load?',
    'That sense of overwhelm often comes from carrying things alone or trying to hold too many threads at once. Which thread, if you let it go for now, would create the most relief?',
    'Your mind and body are telling you that something needs to shift. What would rest look like for you right now, even in a small way?'
  ];

  R['ruleGratitude'] = [
    'That means a lot to hear, thank you for saying so.',
    "I'm glad this conversation has been helpful.",
    'Being here with you matters to me too.',
    'Your kind words stay with me, thank you.',
    'It matters to me that I could be here for you.'
  ];

  R['ruleSchool'] = [
    'Academic pressure can be genuinely exhausting. What exactly feels like the most pressure right now?',
    'How much time is left before this, and how do you feel about it?',
    'What might take a bit of that pressure off, even briefly?',
    'School pressure is real and it can take over your nights too. It is okay to feel worn down.',
    'Studying is a demanding road, and you are allowed to be tired on it.'
  ];

  R['ruleMoney'] = [
    'Money worries have a way of casting a shadow over everything else. How long has this been weighing on you?',
    'When did this financial stress start?',
    'Is there anyone you can talk this through with?',
    'Financial worry is heavy and it can quietly affect your sleep and your peace. I hear that.',
    'Worrying about money is completely human; a great many people feel the same weight.'
  ];

  R['ruleKnowledge'] = [];

  R['ruleProfessionalBoundary'] = [];

  R['ruleRecap'] = [];

  // --- Restored rule-specific response pools ---
  R['ruleSadness'] = [
    "It sounds like you've been carrying a lot of sadness lately. Want to talk more about it?",
    'Sadness is hard to sit with. What brought this feeling on?',
    "Let's stay with this for a moment. How long have you been feeling this way?",
    'Where in your body do you feel this sadness most?',
    'I can hear the sadness in what you are sharing, and I am here with you in it.',
    'Sadness has a right to be here, just like any other feeling. You do not need a reason to earn it.'
  ];

  R['ruleAnger'] = [
    "It sounds like there's a lot of anger built up. What triggered it?",
    'That frustration makes sense. Do you want to walk me through exactly what happened?',
    'Where do you feel that anger most in your body?',
    'That frustration makes sense given what you described.',
    'Anger often points to a boundary that matters to you.',
    'It takes a lot of energy to carry that much frustration around.'
  ];

  R['ruleFeeling'] = [
    'Why do you think {captured}?',
    'How long have you felt that {captured}?',
    'Can you say more about why {captured}?',
    "If that feeling weren't there, what would take its place?",
    'The feeling you are describing, {captured}, is real and it matters.',
    'Naming that feeling, {captured}, is itself a meaningful step.'
  ];

  R['ruleReasoning'] = [
    'Is that the only reason?',
    'Do you think that reason tells the whole story?',
    'What other reasons might be part of this too?',
    'Turning a thought over from a few angles can often make it clearer.',
    'Your mind is busy trying to get to the bottom of this, and that effort counts.'
  ];

  R['ruleNeed'] = [
    'If you had {captured}, what would actually change in your life?',
    "What's standing between you and {captured}?",
    'What might a small first step toward {captured} look like?',
    'The need you are describing, {captured}, sounds completely understandable.',
    'Knowing that you need {captured} is itself a form of valuable self-awareness.'
  ];

  R['ruleAffirmation'] = [
    'I see. Can you tell me a bit more?',
    'Okay. What detail about this feels most important right now?',
    'I hear what you are saying, and I am here to keep listening.',
    'That makes sense to me. Take your time.'
  ];

  R['ruleNegation'] = [
    "That's alright. So what's on your mind, then?",
    'Understood. Would you like to bring up something else?',
    'That is okay. Whenever you are ready to talk, I will be here.',
    'I understand. Sometimes saying no is its own kind of beginning.'
  ];

  // ------------------------------------------------------------------
  // Date/time follow-ups: a gentle redirect back to the user's
  // emotional context after answering a date or time question.
  // ------------------------------------------------------------------
  R.dateTimeFollowups = [
    'What brought that question to mind just now?',
    'Is there a particular reason you needed to know?',
    'Does that date or time have a special meaning for you?',
    'How are you feeling about the current moment?'
  ];

  // ------------------------------------------------------------------
  // Darya-targeted harassment: calm, professional responses for when
  // someone insults, bullies, or verbally attacks Darya directly.
  // These acknowledge without engaging, and do not feed the troll.
  // ------------------------------------------------------------------
  R.daryaHarassmentResponses = [
    'I hear the intensity in your words. I am still here if you would like to talk about what is really on your mind.',
    'I am a conversation companion, here to listen. If something is bothering you, I am here for that.',
    'Your words are pointed at me, but they may come from somewhere else. Would you like to talk about what is really happening?',
    'I am here to offer a calm space. If that is not what you need right now, that is okay.',
    'I notice the words you are using. I wonder if there is something beneath them you would like to explore.'
  ];

  // ------------------------------------------------------------------
  // Sexual harassment: firm boundary-setting responses for
  // inappropriate sexual comments directed at Darya. These set a
  // clear boundary without engaging with the content.
  // ------------------------------------------------------------------
  R.sexualHarassmentResponses = [
    'That kind of language is not appropriate here. I am here for conversation and support, and I would ask you to keep this space respectful.',
    'I am a conversation companion designed for support and reflection. Let us keep this exchange respectful.',
    'I am not able to engage with that type of comment. Would you like to talk about something else instead?',
    'This space works best when it stays respectful. I am here if you want to continue a real conversation.'
  ];

  // ------------------------------------------------------------------
  // Apology: warm acceptance after the user says sorry (English).
  // Kept brief and forward-moving: the pool never dwells on the
  // apology or repeats it back.
  // ------------------------------------------------------------------
  R['ruleApology'] = [
    'No problem at all. Everyone has a moment, and I am glad you are still here.',
    'I hear your apology, and there is no judgment here. We can continue whenever you like.',
    'There is nothing to forgive. This space is for you; what is on your mind right now?',
    'Thank you for saying that. The conversation can pick up right from here.'
  ];

  // ------------------------------------------------------------------
  // Meta-feedback: the user comments on Darya's own behavior, quoting,
  // memory, or intelligence (English). A humble, non-defensive
  // acknowledgement that commits to doing better and then reopens the
  // conversation.
  // ------------------------------------------------------------------
  R['ruleMetaFeedback'] = [
    'I take your feedback seriously and I will work to listen more closely. Would you like to keep going from here?',
    'You are right that attention to detail matters. I will try to hold the whole thread of what you say.',
    'Noted: more care in my answers and better attention to what came before. Thank you for telling me.',
    'I understand, and I will try to do better. Your close attention to this conversation helps.'
  ];

  // ------------------------------------------------------------------
  // About Darya / ELIZA: who built Darya and the origin story (English).
  // Short, simple, and curiosity-engaging: built by Artin as a tribute
  // to ELIZA, the first chatbot, developed at MIT. No surname and no
  // repository are ever mentioned.
  // ------------------------------------------------------------------
  R['ruleAboutEliza'] = [
    'I was made by Artin, as a tribute to ELIZA, the first chatbot ever, built at MIT in 1966. Short and simple: that is where this project began.',
    'My creator is Artin, and this project is a quiet tribute to ELIZA, the first chatbot, developed at MIT. I am here to listen to you.',
    'I was made by Artin, as a tribute to ELIZA, the first chatbot ever, built at MIT in 1966. Would you like to hear more, or talk about yourself?',
    'My creator is Artin, and this project is a quiet tribute to ELIZA, the first chatbot, developed at MIT. What is on your mind?',
    "A person named Artin built me. This project is a tribute to ELIZA, the world's first chatbot, created at MIT. Do you want to hear more, or tell me about yourself?"
  ];

  // ------------------------------------------------------------------
  // Compliment to Darya: the user liked something she said (English).
  // Warm acknowledgement that turns the focus back to the user.
  // ------------------------------------------------------------------
  R['ruleComplimentDarya'] = [
    'Thank you, that means a lot. I am glad something I said felt right to you.',
    'That is kind of you to say. This conversation is alive because of you.',
    'I am happy that landed well. What part of it stood out for you?'
  ];

  // ------------------------------------------------------------------
  // Misread correction: the user says Darya understood them wrong
  // (English). Acknowledge the mistake and invite a restated version
  // instead of re-triggering the same topic rule.
  // ------------------------------------------------------------------
  R['ruleMisreadCorrection'] = [
    'Sorry, I misread that. Tell me again what you actually meant.',
    'I misunderstood you. Could you say it in your own words?',
    'You are right, I was not listening closely enough. What did you really mean?'
  ];

  global.DaryaEnResponses = R;
})(typeof window !== 'undefined' ? window : globalThis);
