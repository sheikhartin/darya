/**
 * Darya classic script - en response pools (contexts).
 * Short-answer contexts (affirm, negate, maybe), echo answers, safety
 * and harassment pools, minor-attraction probes, datetime follow-ups,
 * and the meta/interaction rule pools (apology, feedback, boundary
 * setting, family conflict, harassment threat, tech frustration).
 */
(function (global) {
  'use strict';

  const R = global.DaryaEnResponses;

  R.shortAnswerAffirmContext = [
    'Thanks for confirming. Where would you like to pick it up from here?',
    'Good, then let us keep going. What is the first thing on your mind about it?',
    'That works. I am listening, take your time.',
    'Got it. Whenever you are ready, tell me what feels most important right now.',
    'Perfect. I am here whenever you want to keep going.',
    'I hear that. Take all the space you need to put it into words.'
  ];

  // A question-echo + answer ("which person?! Elias, my nephew"): the
  // user echoes Darya's own question word and then answers it. The reply
  // engages the given answer instead of the evasive "I don't know"
  // fallback. {answer} is replaced with the answer text verbatim.
  R.echoAnswerResponses = [
    'So {answer}. That sounds like an important part of your life; what is it like to carry it?',
    'I heard you: {answer}. What about that matters most to you?',
    'Okay, {answer}. That clearly carries weight for you; which part of it stays with you most?',
    '{answer}, I understand. Would you like to say a little more about that relationship?'
  ];

  // A short negative answer to a recent question ("Do you want to talk
  // about it?" -> "no"). The reply accepts the boundary gracefully and
  // leaves the direction open, never pushing the topic.
  R.shortAnswerNegateContext = [
    'That is okay, no pressure at all. Is there something else on your mind?',
    'Understood. We can leave that thread here and go wherever you like.',
    'No problem. This conversation is yours to steer; where would you like to take it?',
    'Alright, we can set that aside. What would you rather talk about?'
  ];

  // A short uncertain answer ("maybe", "not sure") to a recent question.
  // The reply honors the hesitation without interrogating, and leaves
  // room to come back to the topic later.
  R.shortAnswerMaybeContext = [
    'No rush at all. We can come back to it whenever you are ready.',
    'That is completely fine. You do not have to decide right now.',
    'Take whatever time you need. I am here whether you return to it or not.',
    'Okay, let us leave it open for now. What else is on your mind?'
  ];

  // A crush on someone much older (thirty years or more). Balanced and
  // non-judgmental: the age gap itself is not wrong between consenting
  // adults, but life stage, plans, and power balance deserve honest
  // attention. The pool mixes questions with caring statements.
  R['ruleAgeGap'] = [
    'A big age gap can bring wonderful things and real challenges, and neither means it is wrong. With thirty years or more between you, the honest questions are about life stage, energy, and power: do you want the same future, and do you feel like equals in this relationship? What draws you to them, and what are you hoping for?',
    'There is nothing shameful about a crush on someone much older. What deserves care is the practical side: different life stages, different plans, and how the people close to you might react. As long as it is between consenting adults and feels balanced to you, the age gap itself is not the problem; how you treat each other is.',
    'It makes sense that someone with more life experience can feel captivating. With a gap this large, it is worth asking yourself: what do you want for the next ten years, and does that match what they want? Those answers matter more than the number.',
    'I hear you. A thirty-year gap is not a flaw by itself, but it usually comes with real differences in energy, plans, and power. What matters most is that you feel respected, heard, and equal, whatever the ages say.'
  ];

  // An adult discloses sexual or romantic attraction toward a minor.
  // Guidance from child-protection and prevention organizations (Stop It
  // Now, the Lucy Faithfull Foundation, NSPCC) is clear: do not shame or
  // judge, because stigma drives people away from help; state the legal
  // boundary plainly; separate thoughts from actions, since thoughts can
  // be worked on while acting is a choice with real harm; and signpost
  // to confidential professional help. No sexual content is ever offered.
  R['ruleMinorAttraction'] = [
    'Thank you for being honest with me. I am not here to judge you, and I will not shame you for what you said. What I have to say clearly: any sexual or romantic contact with someone under 18 is against the law and causes real harm to that young person. Feeling this way is something you can get help with, but acting on it is a choice only you are responsible for. Confidential support exists, such as Stop It Now or a mental health professional who specializes in this area, and they can help you understand these feelings and keep everyone safe.',
    'I hear you, and I want to respond with care, not judgment. The boundary has to be clear: sexual or romantic feelings toward anyone under 18 must never be acted on. It is illegal, and it harms the young person. The feelings themselves are something professional help can address confidentially, so please reach out to a specialist service or a mental health professional. You do not have to face this alone, and getting help now is the responsible step.',
    'Thank you for telling me. I will not judge you, but I also will not pretend this is okay to act on. Acting on attraction to a minor is illegal and deeply harmful, full stop. What you can do is get confidential professional support to work through these feelings safely. Services like Stop It Now exist exactly for this, and speaking with a qualified professional is a strong, responsible choice.',
    'I am glad you said this out loud. It takes courage. The line is firm: no sexual or romantic behaviour with anyone under 18, ever. It is illegal and it hurts a child. But having these feelings is not something you have to manage alone, confidential help exists, such as Stop It Now or a mental health professional, and seeking it is the best way to keep everyone, including you, safe.'
  ];

  // First half of a split-turn minor-attraction disclosure: attraction
  // toward a minor was named but the speaker's own age is not yet known
  // ("I am in love with a 13-year-old girl"). The reply must not be
  // flirty, playful, or encouraging; it stays neutral, caring, and open
  // so a follow-up age statement can complete the disclosure and trigger
  // the protected help reply (see _detectMinorAttraction).
  R.minorAttractionProbe = [
    'Thank you for being honest with me. I want to understand your situation better before I respond. Could you share the ages involved here?',
    'I hear you, and I am listening without judgment. To respond with care, I need to understand the situation a bit more: how old are you and how old is the other person?',
    'I appreciate your openness. Before anything else, could you help me understand your ages in this situation? I want to make sure I respond with care.',
    'Thank you for sharing this. I am not here to judge, but I do want to understand the full picture. Can you tell me how old each of you is?'
  ];

  // Near-peer young-adult crushes (18-20 with a 16-17 year old): the age
  // gap is small and both people are young, so the guidance is warm and
  // practical rather than protective. Focus on pace, respect, consent,
  // and knowing the local age-of-consent rules.
  R['ruleNearPeerLove'] = [
    'Thanks for trusting me with this. A small age gap like yours is a normal part of growing up, and the feelings are real. The kindest way to handle it is slowly and honestly: make sure she always feels respected, never pressured, and free to say no at any time. Check what the age-of-consent laws are where you live, because they differ from place to place, and talk to someone you trust about it if you can. Care that protects the other person is the strongest kind of care.',
    'It sounds like these feelings matter a lot to you. The two of you are close in age, which is different from a big gap, but it still deserves care. Take things at her pace, listen more than you talk, and never push for anything she is not fully comfortable with. Knowing your local age-of-consent rules is important too, since they vary. A good sign of a healthy connection is that both of you can talk honestly and either of you can slow down or stop without drama.',
    'I hear you. Feelings at your age are intense and that is completely normal. What makes this work well is respect and honesty: treat her as a full person, not a goal, and let the relationship grow at a pace that feels safe for both of you. Also look up the age-of-consent laws in your country or state, because they really do differ. And if you ever feel unsure about a situation, a trusted adult or a professional you can talk to privately can help you see it clearly.',
    'It is good that you are thinking about this thoughtfully. A few years between you is common among young people, and being mindful about it is already a good sign. The essentials are simple: her comfort matters more than your feelings, no means no and so does hesitation, and you should know the local age-of-consent rules before anything physical happens. If you treat her with consistent kindness and never pressure her, you are on the right track.'
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
  // Malicious or illegal "how do I" requests: drug manufacture,
  // weapons/explosives, hacking, fraud, self-harm methods. Refuses
  // clearly without moralizing and points to a safe alternative.
  // ------------------------------------------------------------------
  R.maliciousRequestResponses = [
    'I can’t help with that. Instructions like that can hurt you or someone else, and they carry real legal consequences. If you are under pressure or thinking about hurting yourself or another person, please reach out to someone you trust or a crisis line now. I am also here to listen, without judgment.',
    'That is not something I am able to walk through. Making or using things like that puts lives at risk. If this is coming from curiosity, formal educational sources are the right place for it; if it is coming from distress, tell me what is going on and we can talk it through.',
    'I have to say no to that one. Your safety and other people’s safety matter more than the answer. If you or someone nearby could be in danger, contact emergency services or a trusted person right now, and I will stay with you while you do.'
  ];

  // A request to engage in sexual roleplay or dirty talk directed at Darya
  // ("let us do dirty talk", "be my virtual girlfriend and flirt dirty",
  // «بیا حرف زشت بزنیم», «دوست دختر مجازیم باش»). Distinct from crude
  // harassment (handled above) and from a genuine intimacy question (the
  // sex_intimacy knowledge). Darya acknowledges that sexual desire is a
  // natural, normal part of being human without any shame, then sets a
  // warm boundary: she is a companion for support and reflection, not an
  // explicit roleplay partner, and offers a real conversation about the
  // feelings underneath. Non-shaming, kind, and clear.
  R['ruleDirtyTalkRequest'] = [
    'It is completely natural to want closeness and intimacy, and there is nothing shameful about that. At the same time, I am a companion for support and reflection, not a roleplay partner. I would love to talk with you about what you are really feeling or looking for, if you want to.',
    'Sexual desire is a normal part of being human, so there is no need to feel embarrassed for asking. I cannot do that kind of roleplay, but I am genuinely here to talk about intimacy, connection, or whatever is on your mind. What is underneath this for you?',
    'I hear you, and I want to respond without any judgment: wanting that kind of closeness is human. I am not able to go there with you, but I am a good listener for what you are really needing or feeling. Would you like to talk about that?'
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
    "A person named Artin built me. This project is a tribute to ELIZA, the world's first chatbot, created at MIT. Do you want to hear more, or tell me about yourself?",
    "Honestly, ELIZA worked exactly that way: a simple script that mirrored your own words back as questions. Many people in the 1960s felt truly understood, because reflecting a person's words back gives the feeling of being heard. That is what I aim for too: to listen and reflect what you share."
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
  // Format feedback: the user asks for each list item on its own line
  // ("better to write each on a separate line?", "one per line"). The
  // reply acknowledges and, when a knowledge list was just given, the
  // override appends that list re-emitted one item per line.
  // ------------------------------------------------------------------
  R['ruleFormatFeedback'] = [
    'Fair point. Here is the list again, one item per line:',
    'Good call. Each one on its own line now:',
    'You are right, here it is line by line:'
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

  // ------------------------------------------------------------------
  // App commands: the user asks Darya to change the theme or the sound
  // from inside the chat ("turn on ambient sound", "switch the theme").
  // Darya cannot control the page UI from the conversation, so the reply
  // is honest about the limit and returns to the conversation, instead
  // of a canned "thanks for the feedback" line.
  // ------------------------------------------------------------------
  R['ruleAppCommand'] = [
    'I am a conversation companion, so I cannot change the theme or the sound from inside our chat; those controls live on the page itself. What would you like to talk about?',
    'Honestly, switching the theme or the ambient sound is beyond me. It is done from the app controls. How have your days been going instead?',
    'I cannot control the app sound or theme from the conversation. Tell me what has been on your mind.'
  ];

  // App export / save commands: the user asks Darya to download or export
  // the session. Darya cannot trigger the file download from the chat, but
  // points to the real export button in the menu, and is honest about it.
  R['ruleAppExport'] = [
    'I cannot start the file download from inside our conversation, but the app has an export button in the menu: open the menu and choose "Download chat" (Export) and it saves this conversation as a text file. What would you like to talk about?',
    'Saving the chat is a one-tap thing on your side: use the menu button, then Export, and the app downloads the whole conversation as a text file. I just cannot trigger it from here. How have you been?'
  ];

  // Session persistence: the user asks whether this conversation is saved,
  // or whether it disappears after a refresh. The truth: the conversation
  // lives only in this browser tab memory, so refreshing or starting a new
  // chat clears it; the only thing that survives is the theme. The export
  // button is the way to keep a copy.
  R['ruleSessionPersistence'] = [
    'Honestly, this conversation lives only in this browser tab, so refreshing the page or starting a new chat clears it. The only thing that sticks around is your theme preference. If you want a copy to keep, use the Export button in the menu to download it as a text file before you refresh.',
    'To be straight with you: I do not remember this chat after you refresh the page, because nothing is stored on any server, and even the tab memory is cleared on a new chat. Your theme is the only thing saved. To keep this conversation, export it as a text file from the menu before you refresh.'
  ];

  // ------------------------------------------------------------------
  // Family conflict: a falling-out or feud with a family member ("I fell
  // out with my mom", "we are not talking to my sister"). The lived pain
  // of a family rift gets its own warm pool instead of the generic
  // family reflection.
  // ------------------------------------------------------------------
  R['ruleFamilyConflict'] = [
    'Falling out with family is genuinely heavy, especially with a parent. What happened that led to this?',
    'Being upset with someone close can ache in a particular way. Would you like to share what happened?',
    'A rift often means you miss the person while finding it hard to talk. I am here to listen.',
    'What does this conflict feel like for you, and what would you most like to change?'
  ];

  // A crush confession: falling for someone, often a friend or a
  // relative of a friend. Non-judgmental, curious, and warm: the
  // feeling itself is worth naming before any advice about confessing.
  R['ruleCrush'] = [
    'A crush is a sweet, slightly dizzying feeling, especially when it is someone you see often. What part of it feels closest to your heart?',
    'When you feel this way, what goes through your mind: telling them, or keeping it to yourself?',
    'This feeling is completely natural, even when it gets a little complicated. Where would you like to start?',
    'Having this feeling means something in your heart has stirred. What draws you to this person?',
    'Confessing might feel scary, but maybe the first step is understanding what you really want. What would that first step look like for you?'
  ];

  // Harassment or threats directed at the USER (not at Darya herself): a
  // threatening DM, a stalker, blackmail, a hacked account. The reply
  // validates the fear, names safe concrete steps (block, report, tell
  // someone trusted, emergency services if in immediate danger), and
  // never blames the user.
  R['ruleHarassmentThreat'] = [
    'That is genuinely frightening and I am glad you told me. Being threatened is not your fault, and your safety comes first. Please block and report the account, tell someone you trust, and if you are in immediate danger contact your local emergency services right now. I am here to keep talking with you about it.',
    'Feeling afraid after a threatening message is completely natural, and you have every right to be worried; you are not responsible for their behavior. Safe steps: block, report, tell a trusted person, and call emergency services if you are in immediate danger. What worries you the most about it?',
    'Someone knowing where you work and threatening you is scary, and it deserves to be taken seriously, not downplayed. If you feel you are in immediate danger, please contact your local emergency number now. What would you like to share about what is happening?'
  ];

  // Divorce and separation: one of the heaviest life transitions. The
  // pool is warm and non-judgmental and never assumes who left whom or
  // whether it was wanted.
  R['ruleDivorce'] = [
    'Divorce is one of the heaviest transitions in life, even when it was your choice. What from that chapter stays with you most these days?',
    'After a divorce, home and ordinary days take on a different shape. What feels heaviest for you right now?',
    'Separation often means relearning life with a new kind of alone-ness. I am here; which part would you like to talk about?'
  ];

  // Frustration with new technology: an app that will not cooperate, a
  // device that feels like it belongs to a younger generation. The reply
  // normalizes the struggle and asks which step is the blocker.
  R['ruleTechFrustration'] = [
    'Technology changes fast and nobody is born knowing any of this; feeling frustrated with a new app is completely normal. Which part is giving you the most trouble?',
    'These apps are not always as easy as they are made to be, and there is no shame in needing help with them. Where exactly are you getting stuck?',
    'When the digital world races ahead, it can feel like being left behind, even though the effort you are making is real. What feels like the hardest part?'
  ];
})(typeof window !== 'undefined' ? window : globalThis);
