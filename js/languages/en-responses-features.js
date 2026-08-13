/**
 * Darya classic script - en response pools (features).
 * The guided-exercise library, the session mood tracker, question
 * recall, knowledge-expansion responses, and user profile memory
 * (age and name) pools.
 */
(function (global) {
  'use strict';

  const R = global.DaryaEnResponses;

  R.exerciseLibrary = {
    breathing: {
      requestKeywords:
        /\b(?:breathing|breathe with me|breathe|calm me down|relax(?:ation)? exercise|de-?stress(?:ing)?)\b/i,
      offer: [
        'Let me guide you through a short breathing exercise. It takes about a minute. Shall we start?',
        'We can do a quick breathing exercise together whenever you are ready. Want to try it now?'
      ],
      steps: [
        [
          'Sit or lie down comfortably, and let your shoulders drop. When you are ready, say ok to continue.'
        ],
        [
          'Breathe in slowly through your nose for a count of four. Say ok when you are ready for the next step.'
        ],
        [
          'Hold gently for a count of four. No need to force anything. Say ok when ready to continue.'
        ],
        [
          'Breathe out slowly through your mouth for a count of six, and let your jaw relax. Say ok when ready.'
        ],
        [
          'Repeat this rhythm a few more times at your own pace. When you feel settled, say ok to finish.'
        ]
      ],
      complete: [
        'You did it. Notice how your body feels now. That quiet moment is yours. You can come back to this breath any time.'
      ],
      stop: [
        'Of course, we can stop here. No pressure at all. Just say the word whenever you want to try again.'
      ]
    },
    grounding: {
      requestKeywords:
        /\b(?:ground(?:ing)? me|grounding exercise|5-4-3-2-1|present moment|feel more present)\b/i,
      offer: [
        'Let me guide you through a quick grounding exercise. It brings your attention back to the present. Shall we start?'
      ],
      steps: [
        [
          'Look around and name five things you can see. Say ok when you are ready for the next step.'
        ],
        [
          'Now notice four things you can touch or feel: the chair, your clothes, the floor. Say ok when ready.'
        ],
        [
          'Listen for three sounds around you, near or far. Say ok when you are ready to continue.'
        ],
        [
          'Find two things you can smell, or two smells you like. Say ok when ready for the last step.'
        ],
        [
          'Notice one thing you can taste. Then take one slow breath. Say ok to finish.'
        ]
      ],
      complete: [
        'You are back in this room, in this moment. That is it: you are grounded here, right now. Whenever the mind spins, you can use these five senses again.'
      ],
      stop: [
        'That is fine, we can stop here. Grounding is always there if you want it later.'
      ]
    },
    bodyscan: {
      requestKeywords: /\b(?:body scan|scan my body|scanning my body)\b/i,
      offer: [
        'Let me guide you through a short body scan. It helps tension leave quietly. Shall we start?'
      ],
      steps: [
        [
          'Close your eyes if that feels okay. Bring your attention to your feet, and just notice them. Say ok when ready.'
        ],
        [
          'Move your attention up to your legs and hips. Notice any tightness without trying to change it. Say ok when ready.'
        ],
        [
          'Now your belly and chest. Follow your breath there for a moment. Say ok when ready to continue.'
        ],
        [
          'Notice your shoulders, your neck, and your jaw. Soften them if you can. Say ok when ready.'
        ],
        [
          'Finally, your face and the top of your head. Take one deep breath. Say ok to finish.'
        ]
      ],
      complete: [
        'That is the whole scan. You made it through, and tension often loosens once it is simply noticed.'
      ],
      stop: [
        'We can stop the scan here. No problem at all. It is always available another time.'
      ]
    },
    thoughtrecord: {
      requestKeywords:
        // eslint-disable-next-line max-len
        /\b(?:thought record|write (?:down )?my thoughts|cbt exercise|cognitive (?:restructuring|reframing)|challenge (?:my |these )?thoughts)\b/i,
      offer: [
        'Let me walk you through a short thought record. It helps you look at a heavy thought with fresh eyes. Shall we start?'
      ],
      steps: [
        [
          'First, what is the situation? Just one sentence about what happened. Say ok when you have it in mind.'
        ],
        [
          'Now, what is the thought that came with it? The exact words in your head. Say ok when you are ready.'
        ],
        [
          'What emotion goes with that thought, and how strong is it from 1 to 10? Say ok when you are ready.'
        ],
        [
          'What is the evidence for the thought, and what is the evidence against it? Say ok when you have looked.'
        ],
        [
          'What is a fairer, more balanced thought that fits all the evidence? Say ok to finish.'
        ]
      ],
      complete: [
        'You did a full thought record. Notice how the weight of the thought shifted: you looked at it from every side instead of letting it run the show.'
      ],
      stop: [
        'We can leave the thought record here. It is okay to put it down for now.'
      ]
    }
  };
  // Fallbacks for an exercise that omits its own offer/complete/stop.
  R.exerciseLibrary.offer = ['I can guide you through this. Shall we start?'];
  R.exerciseLibrary.complete = [
    'That is it. You did the exercise, and the moment is yours.'
  ];
  R.exerciseLibrary.stop = [
    'No problem, we can stop here. Whenever you want to try again, just ask.'
  ];
  // Exercise request detection: any phrasing that names a guided
  // exercise. The specific exercise is chosen by requestKeywords.
  R.exerciseRequestPattern =
    // eslint-disable-next-line max-len
    /\b(?:breathing exercise|breathe with me|calm me down|de-?stress|relax(?:ation)? exercise|ground(?:ing)? (?:me|exercise)|5-4-3-2-1|body scan|scan my body|thought record|cbt exercise|cognitive (?:restructuring|reframing)|challenge my thoughts|write down my thoughts|exercise to (?:calm|relax|ground) me)\b/i;
  // Saying stop (or no) at any point releases the active exercise.
  R.exerciseStopPattern =
    /\b(?:stop(?: the exercise)?|that'?s (?:enough|all)|i'?m done|let'?s stop|we can stop|never mind)\b/i;
  // Tappable yes/no chips shown while an exercise step awaits an answer.
  R.exerciseYesNoChips = ['Ok', 'Stop'];

  // Session mood tracker (see responder-mood.js): the user asks to check
  // or log their mood, answers the 1..10 scale, or asks for a summary of
  // how they have been feeling. All data is session-only.
  R.moodRequestPattern =
    /\b(?:mood check|check my mood|log my mood|track my mood|mood tracker|rate my mood|how (?:is|was) my mood)\b/i;
  R.moodSummaryPattern =
    /\b(?:how have i been feeling|how (?:have|has) my mood been|my mood lately|mood summary|tell me about my moods)\b/i;
  R.moodAskResponses = [
    'I would love to know how you are doing right now. On a scale from 1 to 10, where is your mood?',
    'Let us check in on you. From 1 to 10, how are you feeling at this moment?'
  ];
  R.moodReflectionPools = {
    low: [
      'A {rating} out of 10 sounds heavy. Thank you for being honest with me. What is taking up the most space right now?',
      'That is a low number, and it matters. You do not have to carry it alone. What would help most right now?'
    ],
    moderate: [
      'A {rating} out of 10. Somewhere in the middle. What would nudge it even one point higher?',
      '{rating} out of 10 is okay, and okay counts. Is anything about today pushing it down?'
    ],
    high: [
      'A {rating} out of 10, that is good to hear. What is helping things feel this way?',
      '{rating} out of 10, lovely. I am glad something is going well. What would you like to keep doing?'
    ]
  };
  R.moodSummaryResponses = [
    'You have logged {count} mood check-in(s) this session, averaging {average} out of 10, with your latest at {last}. Overall the trend has been {direction}.',
    'Looking at your check-ins: {count} in total, averaging {average}, and the direction is {direction}. Your latest was a {last}.'
  ];
  R.moodNoDataResponse =
    'You have not logged a mood yet this session. Just say "mood check" whenever you want to start.';
  R.moodReleaseResponses = [
    'No worries, we can skip the rating. I am still here whenever you want to share.'
  ];
  R.moodScaleChips = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  R.moodDirectionUp = 'moving upward';
  R.moodDirectionDown = 'moving downward';
  R.moodDirectionSame = 'fairly steady';
  R.moodLogSize = 8;

  // Question recall (see responder-recall.js): the user asks Darya to
  // remember their last question ("do you remember what the last question
  // I asked you was?"). The {question} placeholder is replaced with the
  // recalled utterance from conversation memory, so the reply proves
  // real memory instead of an evasive "I do not have an answer" line.
  R.questionRecallFoundResponses = [
    'Yes, I remember: "{question}". Am I right?',
    'I remember: "{question}". That was exactly what you asked.',
    'Right: "{question}". That was your question.'
  ];
  // Honest reply when no question has been asked yet in this session.
  R.questionRecallNoneResponses = [
    'Honestly, you have not asked me a question yet in this conversation. Ask whenever you want and I will keep it here.',
    'You have not asked me anything yet. If there is something you want to know, ask and I will hold onto it.'
  ];
  // Knowledge-expansion request (see responder-recall.js): the long
  // transcript turn asking Darya to build a richer dataset (good
  // questions, movies, games, books, anime, traditional medicine, study
  // help, general knowledge, fun facts). The reply is honest about being
  // an offline build whose shelf already covers these areas, and invites
  // a concrete topic.
  R.knowledgeExpansionResponses = [
    'I hear you: you want me to carry a richer, more varied store of good questions, films, games, books, anime, traditional medicine, study help, general knowledge, and fun facts. This offline build already keeps shelves on all of those. Where would you like to start?',
    'That is a fair request. I am an offline build, so I cannot grow my dataset right here, but my current shelf already covers a lot of that ground. Name a topic and we will go from there.',
    'Noted: a richer dataset of good questions and broader topics. Until then, name any subject and I will answer from the offline shelf. Where should we begin?'
  ];

  R.userProfilePools = {
    ageStored: [
      'Got it: {age} years old. I will remember that for our conversation.',
      '{age} years old, noted. I will keep that in mind from now on.',
      'Okay, {age} years old. I would love to hear how life feels at this stage for you.'
    ],
    ageKnown: [
      'I remember: {age} years old. Good to know we are still here together.',
      'You are {age} years old, the age you told me earlier.'
    ],
    // Age-appropriate reply when the disclosed age reads as a child
    // (at or below YOUNG_USER_MAX_AGE, see responder-profile.js). Warm,
    // non-condescending, and it gently points to a trusted adult for
    // the heavy things instead of assuming adult self-reliance.
    ageStoredYoung: [
      'Got it, {age} years old. Thank you for telling me. If anything ever feels too heavy for you to carry, please talk to a trusted adult you feel safe with, a parent, a teacher, or someone at school. They are there to help.',
      'Okay, {age} years old, noted. I am glad you are here. Remember that grown-ups you trust, like your parents or a teacher, are always a good place to turn when something feels big.'
    ],
    bothStoredYoung: [
      'Nice to meet you, {name}! I will remember you are {age} years old. And if anything ever feels too much, a trusted adult, like a parent or a teacher, can really help you carry it.',
      'So glad you introduced yourself, {name}. I will keep the {age} years in mind, and remember: for the big things, a trusted adult is always a good place to turn.'
    ],
    ageUnknown: [
      'Honestly, you have not told me yet. If you share it, I will remember it.',
      'I do not know yet. How old are you? I will hold onto it.'
    ],
    nameStored: [
      'That is a lovely name, {name}. I will remember it from now on.',
      '{name}, noted. I am glad to know your name.',
      'Okay, {name}. From now on I will think of you by that name.'
    ],
    bothStored: [
      'Lovely to meet you, {name}! And yes, I will remember that you are {age} years old.',
      '{name}, {age} years old. Both noted; from now on I will think of you by that name.',
      'Glad you introduced yourself, {name}. I will keep the {age} years in mind too.'
    ],
    nameKnown: [
      'Your name is {name}. I remember it.',
      'You are {name}, the name you told me.'
    ],
    nameUnknown: [
      'Honestly, you have not told me your name yet. If you like, tell me and I will remember it.',
      'I do not know your name yet. What is it?'
    ],
    // Combined recall ("do you remember who I am and how old I am?"):
    // answer honestly from the stored profile. Never invents facts, and
    // plainly admits what was not disclosed.
    bothKnown: [
      'Yes, I remember: your name is {name} and you are {age} years old. You told me both in this conversation and I have kept them.',
      'I remember: {name}, {age} years old. Both were shared in this chat and I held onto them.'
    ],
    noneKnown: [
      'Anything you share in this conversation stays with me. You have not told me your name or age yet; whenever you like, tell me and I will remember.',
      'Honestly, you have not told me your name or age yet. If you do, I will keep them right here.'
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
