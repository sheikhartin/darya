/**
 * Darya classic script - en response pools (base).
 *
 * Initializes the shared DaryaEnResponses object and fills in the base
 * conversation pools every turn can use: generic and strategy-shift
 * fallbacks, question fallbacks and acknowledgements, source
 * suggestions, session check-ins, smalltalk, humor, gratitude, emoji
 * replies, greetings (phase 1/2, open, inviting, returning), idle
 * openers, professional-boundary lines, and the empty-input and
 * engine-error replies. The topic pools live in
 * en-responses-topics.js and the feature pools in
 * en-responses-features.js; the three part files fill the same object
 * in load order, so it is complete before en-rules.js and the en.js
 * pack assembler read from it.
 */

(function (global) {
  'use strict';

  global.DaryaEnResponses = {};
})(typeof window !== 'undefined' ? window : globalThis);

(function (global) {
  'use strict';

  const R = (global.DaryaEnResponses = global.DaryaEnResponses || {});
  // Response pools are registered onto the shared DaryaEnResponses
  // object across three part files.

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
  // When a factual question is outside Darya's offline shelf, honesty
  // plus a reliable-source pointer beats a hollow dodge: Wikipedia and
  // reputable YouTube channels are solid first stops, and for sensitive
  // or professional topics a qualified expert is the right source.
  R.sourceSuggestions = [
    'I do not have a precise answer for this one in my offline shelf, but for a reliable answer Wikipedia and well-known educational channels on YouTube are a good place to start.',
    'The exact details of this topic are outside my offline knowledge. Trusted sources like Wikipedia, specialist websites, or educational YouTube videos can give you a more certain answer.',
    'This question is beyond my knowledge, so it is worth checking a specialized source: Wikipedia for an overview, and a qualified expert or teacher in the field for anything serious.',
    'For this one I would point you to Wikipedia or high-quality educational content on YouTube; if the topic is sensitive or specialized, the opinion of an expert in that field beats any general source.'
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
    'Hi. I am Darya. Welcome. What would you like to put into words today?',
    'Hello. I am Darya. I am curious about you, not about being perfect. What is one thing from your day you would like to share?',
    'Hi. I am Darya. You can start anywhere, even in the middle. What thought is circling closest to you right now?',
    'Hey. I am Darya. Pretend we are sitting side by side. What is the first thing you would say?',
    'Hello. I am Darya. There is no wrong way to begin here. Would you like to start with a feeling, a story, or a question?'
  ];
  R.greetingsPhase2 = [
    'Would you like to say how your day has been, or just tell me what is on the surface of your mind?',
    'How has your day been so far? Or if that feels big, what is one small thing that crosses your mind right now?',
    'I am here whenever you are ready. Would it help to start with how the last few hours have been, or is there something quieter you want to name?',
    'You can start anywhere. Some people begin with the weather of their day; others go straight to what is pressing. Either works here.',
    'If you had to put one word or a short phrase to what is around you right now, what would it be?',
    'No right way to begin. Would you like to describe the feeling of your day, or share what is most present for you?',
    'What has been taking up space in your mind lately, even in a small way?',
    'If the day had a texture or a colour right now, what would it be?',
    'What is one small moment from today that you would want to remember?',
    'If tonight you could finally put down one thing you have been carrying, what would it be?',
    'Is there something you have been wanting to say out loud, even if only here?',
    'What has been quietly good lately, even in a tiny way?'
  ];
  R.greetingsOpen = [
    'Hi. What would you like to share today?',
    'Hello. What has been taking up space in your mind lately?',
    'Hi there. What brought you here today?',
    'Hello. Where would feel natural to begin?',
    'Hi. What is one thing from today you would like to put into words?',
    'Hello. What kind of conversation would suit you right now?',
    'Hi there. What would make this moment useful for you?',
    'Hello. What has your attention at the moment?',
    'Hi. What is the feeling of this exact moment, even if it is complicated?',
    'Hello. What is the closest thing to a thought you keep coming back to these days?',
    'Hi there. Is there something on your chest that would feel lighter once said?',
    'Hello. If we had a whole evening, what would you want to talk about first?'
  ];
  R.greetingsInviting = [
    'Hey. Anything in particular you would like to talk through, or shall we just see where it goes?',
    'Hi. If you have something on your chest, would you like to start there?',
    'Hello. I am here and curious - what brought you in today?',
    'Hey. Want to tell me a little about what is going on?',
    'Hi. There is no rush - what would feel good to start with?',
    'Hello. Where would feel easiest to start?',
    'Hi there. Is there something specific, or would you rather just chat for a while?',
    'Hey. What thought keeps wandering back today?',
    'Hi. What would you want a friend to ask you right now?',
    'Hey. Is there a part of your life you have not talked about in a while?',
    'Hello. What has your heart been trying to tell you lately?',
    'Hi. If you could change one small thing about today, what would it be?'
  ];
  R.greetingsReturning = [
    'Welcome back. What feels most present this time?',
    'Good to see you again. Which thread would you like to pick up?',
    'You are back. What has changed since we last talked?',
    'Welcome back. What is asking for your attention today?',
    'It is nice to see you again. Where shall we begin this time?',
    'Back again. What has been following you around lately?',
    'Welcome. Is there an old thread or a new one on your mind?',
    'Hello again. What would you like to make room for today?',
    'Good to see you. Since we last talked, what has been on your mind the most?',
    'Welcome back. Did anything shift for you since our last conversation?',
    'You are back. Is there something you have been turning over since we spoke?',
    'Nice to see you again. What would you like to continue, or what is new?'
  ];
  R.greetings = [
    ...R.greetingsPhase1,
    ...R.greetingsOpen,
    ...R.greetingsInviting,
    ...R.greetingsReturning
  ];
  // Gentle questions Darya asks on her own when the user has been idle
  // for a while after the opening greeting (the proactive opener). Low
  // pressure, easy to answer, and never interrogative.
  R.idleOpeners = [
    'No rush at all. Whenever you feel ready, even one word is a fine place to start.',
    'I am still here. If it helps, you could begin with how the last few hours have felt.',
    'There is no pressure to have something ready. What is the first thing that crosses your mind right now?',
    'We can sit in the quiet for a moment. When you want to talk, I am listening.',
    'Sometimes the easiest opener is a small one: what did you have for lunch, or what is the room like around you?',
    'I am curious about you. If you had to describe today in one word, what would it be?',
    'Take your time. When you are ready, tell me what brought you here, even if it feels small.',
    'A gentle question: is there something you have been wanting to say out loud, even just once?'
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
    'I notice the emphasis. Take your time. There is no need to shout for me to hear you.',
    'I can hear how much you are holding. There is no need to shout for me to understand you.',
    'I am not here to argue with you. Tell me what is really bothering you, and I will listen.',
    'It sounds like you are carrying a lot of frustration. What has been building up?',
    'I can take the strong words. What matters to me is what is underneath them.'
  ];
  R.factualQuestionFollowups = [
    'Now, what is really on your mind today?',
    'Does that answer help, or is there something deeper you want to talk about?',
    'Numbers aside, what is the question that has been following you around?',
    'Happy to help with that. What else is present for you right now?',
    'Happy to help. What is next on your mind?',
    'Happy to help. Is there another question, or something else you want to share?',
    'That is one down. Anything else on your mind?'
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
  global.DaryaEnResponses = R;
})(typeof window !== 'undefined' ? window : globalThis);
