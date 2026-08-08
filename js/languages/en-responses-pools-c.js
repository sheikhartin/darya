/**
 * Darya classic script - en response pool (part 3).
 */
(function (global) {
  'use strict';

  const R = global.DaryaEnResponses;

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
    'What thought keeps following you around these days?',
    'What is one small thing you are quietly proud of, even if nobody knows?',
    'If your life had a theme song right now, what would it be?',
    'What would your younger self be surprised to know about you today?',
    'What has been the kindest thing someone did for you recently?',
    'If you could gently change one habit this month, which one would you choose?',
    'What do you enjoy doing that always makes time disappear?',
    'Who makes you feel most like yourself, and what is it about them?',
    'What is something you are looking forward to, even something small?',
    'If you could describe your current mood as a weather, what would it be?'
  ];

  R['ruleSelfImprovement'] = [
    'Honestly, every conversation with you is a chance for me to learn. What would you like me to do better?',
    'You are right, there is always room to grow. What do you need from me right now?',
    'I am always working on listening better. Tell me what would help you most.',
    'Good point. Which part of how I respond should I work on first?'
  ];

  // The user does not know how to begin a conversation ("how do i
  // start?", "i don't know what to say"). Darya lowers the bar: any
  // sentence, however small, is a fine opener.
  R['ruleOpenerHelp'] = [
    'There is no wrong way to start. Try a simple \"I have been feeling a bit off lately\", or tell me the first thing that came to mind when you opened this page.',
    'You can begin anywhere. \"How has your day been?\" is a perfectly fine opener, or just share the thought that is closest to the surface right now.',
    'If starting feels hard, try one of these: how your day went, what is on your mind, or something small you noticed today.',
    'You do not need a perfect first line. Type whatever you would say to a friend who just sat down next to you.',
    'A good opener is usually the most honest thing in your head. For example: \"I feel tired today\" or \"I have been thinking about work a lot lately\".',
    'Start small. One sentence is enough: \"I am stressed\" or \"Something good happened today\" both work perfectly.',
    'Here is a trick: write down the last thought you had before opening this page. That is already a good place to begin.',
    'You can start mid-thought. \"Earlier today...\" is all it takes, and I will pick up from there.'
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
    'I am Darya, made by Artin as a tribute to ELIZA, the first chatbot, from MIT. I am here to listen to you.',
    'I am Darya, an open-source companion. The project repository is at github.com/sheikhartin/darya.'
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

  // The user asks to change the subject ("let's talk about something
  // else"). Darya follows the lead lightly instead of treating it as a
  // topic disclosure or bouncing to a generic fallback.
  R['ruleTopicChange'] = [
    'Okay, let us switch things up. What would you like to talk about?',
    'Sure. You said another topic is on your mind; tell me which one.',
    'Sounds good. Where would you like to start?',
    'Whatever you choose. This conversation is yours; pick the new subject.',
    'Let us leave that thread. What is moving through your mind right now?'
  ];

  // --- Restored rule-specific response pools ---
  R['ruleSadness'] = [
    "It sounds like you've been carrying a lot of sadness lately. Want to talk more about it?",
    'Sadness is hard to sit with. What brought this feeling on?',
    "Let's stay with this for a moment. How long have you been feeling this way?",
    'Where in your body do you feel this sadness most?',
    'I can hear the sadness in what you are sharing, and I am here with you in it.',
    'Sadness has a right to be here, just like any other feeling. You do not need a reason to earn it.'
  ];

  // Depression goes beyond sadness: heavy, lasting low mood that makes
  // everyday things feel pointless. The reply holds empathy first and
  // gently names professional support as a real option, because a doctor
  // or a mental health professional is the right long-term source.
  R['ruleDepression'] = [
    'That sounds like a heavy weight that has been pressing on you for a while. Depression is not weakness, and you do not have to carry it alone. Have you been able to talk to a doctor or someone you trust about it?',
    'I hear how heavy this feels. When low mood hangs on for weeks or makes everyday things hard, professional support, like a doctor or a mental health professional, can make a real difference. What would a first step look like for you?',
    'It takes courage to say you are struggling. You are not broken, and this is not your fault. Many people feel relief through talking to a professional. Is that something you would consider?',
    'Depression can drain the colour out of everything, and that is real. You deserve support that matches how much this is affecting you. A qualified professional or a trusted person could help you carry it.'
  ];

  // A request for a joke or a laugh. The pool holds clean, kind jokes so
  // the reply is never at anyone's expense. Requests with no explicit
  // joke marker ("make me laugh") land here too.
  R['ruleTellJoke'] = [
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'I told my computer I needed a break, and now it will not stop sending me KitKat ads.',
    'Why did the scarecrow win an award? Because he was outstanding in his field.',
    'I would tell you a UDP joke, but you might not get it.',
    'Why do cows have hooves instead of feet? Because they lactose.',
    'What do you call a bear with no teeth? A gummy bear.',
    'I am reading a book on anti-gravity. It is impossible to put down.',
    'Why did the math book look sad? Because it had too many problems.',
    'Parallel lines have so much in common. It is a shame they will never meet.',
    'Why did the coffee go to the doctor? Because it felt a little latte.'
  ];

  // The user tells Darya to back off: a private matter ("none of your
  // business", "stop asking"). The reply accepts the boundary with
  // respect and hands the direction back to the user instead of pushing.
  R['rulePrivacyBoundary'] = [
    "Fair enough, that's your space and I respect it. We can leave that topic alone; I'm here whenever you want to talk about something else.",
    "Got it, that's private and that's completely okay. I won't push; the conversation is yours to steer.",
    "You don't owe me an explanation. Happy to drop it here and follow your lead.",
    "Understood, I'll leave that alone. If there's anything else on your mind, I'm here.",
    "That's your boundary and I respect it. No need to justify it; tell me what you'd like to talk about."
  ];

  // The user asks Darya to buy something. Darya cannot make purchases,
  // and honesty plus practical help beats a hollow "I cannot do that":
  // the reply names the limit and then helps think the purchase through.
  R['ruleShoppingHelp'] = [
    'I cannot buy things for you, but I can help you think the purchase through. What are you looking to get, and what matters most to you: price, quality, or something else?',
    'I am not able to make purchases, but I am happy to help you compare options and decide what to look for. What item do you have in mind?',
    'Buying is not something I can do for you, yet I can help you plan it: budget, where to compare, and what reviews say. Tell me about the item.',
    'I cannot order it for you, but we can look at what makes a good choice together. What will you use it for, and what is your budget?',
    'I cannot make purchases for you, but thinking the purchase through together is exactly what I am here for: needs first, then budget, then reviews.'
  ];

  // A short affirmative answer to a question Darya just asked ("Would you
  // like to talk about it?" -> "yes"). The reply keeps the thread going:
  // it accepts the answer warmly and invites the user to continue, or the
  // engine substitutes a topic-specific follow-up question when the
  // pending topic has one (see _resolveShortAnswerContext).
  R.shortAnswerAffirmContext = [
    'Thanks for confirming. Where would you like to pick it up from here?',
    'Good, then let us keep going. What is the first thing on your mind about it?',
    'That works. I am listening, take your time.',
    'Perfect. Tell me what feels most important about it right now.'
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
})(typeof window !== 'undefined' ? window : globalThis);
