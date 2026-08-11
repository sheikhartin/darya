/**
 * Darya classic script - en response pools (rules).
 * Rule-specific response pools for the topic, emotion, and interaction
 * rules, plus the scenario-found rule pools (pet loss, affection,
 * flirtation, empty success, grief hope, about Darya's day, health
 * symptoms, impaired driving) and their detection patterns.
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

  R['rulePerfectionism'] = [
    'Perfectionism can be a heavy standard to carry. Where did the idea that it has to be flawless come from?',
    'Starting before it is perfect is the hardest step. What would "good enough for today" look like?',
    'The fear of it not being right can keep everything stuck. What would you like to begin, even imperfectly?',
    'Holding yourself to a perfect standard is exhausting. What is one part you could let be unfinished for now?',
    'Perfect is a moving target; done is what lets you move forward. What is the smallest start that counts?',
    'Being hard on yourself about not starting is itself a kind of pressure. What would it take to begin just a little?'
  ];

  R['ruleProcrastination'] = [
    'That pull to reach for your phone is real, and it is not laziness. What usually happens right before you reach for it?',
    'The gap between wanting to study and actually starting is the hard part. What is the smallest possible first step?',
    'Five focused minutes is a legitimate start. What would you work on in those five minutes?',
    'Distraction is often a signal, not a flaw. What is the task you keep avoiding telling you?',
    'Starting is the uphill part. What would make sitting down to study feel a little less heavy?'
  ];

  R['ruleChronicIllness'] = [
    'Living with ongoing pain takes a real toll on both body and mind. It makes sense that you are exhausted.',
    'I am not a doctor, and I will not guess at answers for you. But carrying this for so long is a lot; have you found anyone who truly listens?',
    'When the doctors do not have a clear answer, the uncertainty can weigh as much as the pain. What has helped you get through the hardest days?',
    'It is valid to feel tired of it all. What does a good day look like for you now, even a small one?',
    'You deserve care that matches how much you are carrying. What kind of support do you wish you had?',
    'Being believed matters. Have the people around you understood how heavy this has been?'
  ];

  R['ruleCaregiver'] = [
    'Caring for someone you love while running on empty is one of the hardest things there is. Your exhaustion makes sense.',
    'That guilt is heavy, and it is not evidence that you are failing. What would it take to get a little support for yourself?',
    'You cannot pour from an empty cup. What do you do, even briefly, that is just for you?',
    'Worrying about what might happen if you step away is exhausting in itself. Who else could share this load, even a little?',
    'Taking care of them matters, and so does taking care of the person doing the caring. How are you, really?',
    'It is okay to need rest. What would one honest rest day look like for you?'
  ];

  R['ruleParenting'] = [
    'Those first weeks with a new baby are a storm of hormones and sleeplessness. Crying does not make you a bad parent.',
    'Feeling like a bad mother does not mean you are one. It usually means you care very much. What has been the hardest part?',
    'It is okay to feel overwhelmed and to name it. Many new parents feel this way and say nothing about it. What support do you have around you?',
    'Your baby needs you fed, rested, and held too. What is one small thing you could do just for yourself today?',
    'If the crying and the heaviness keep going, talking to a professional is a strong and normal step, not a sign of failure.'
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

  // Blanket generalizations and stereotypes ("all women are the same",
  // "all men are selfish"): a gentle challenge that invites the specific
  // experience behind the belief instead of mirroring the claim back or
  // letting it pass unchallenged. First-person pain ("everyone hates
  // me", "nobody loves me") never lands here; the loneliness rule owns
  // those.
  R['ruleGeneralization'] = [
    'That is a strong claim. I am curious what experience shaped it.',
    'People are rarely as alike as they first appear. What led you to this conclusion?',
    'When a whole group looks the same to us, there is usually a hurt story behind it. Want to tell it?',
    'I wonder if a specific person taught you this belief. Is there someone behind it?',
    'Every person is more complicated than the label we give them. What made you see it this way?',
    // A statement-form line so the challenge still lands after the
    // question budget is exhausted (the budget filter drops question
    // lines, and with no statement left it would swap in a generic
    // fallback).
    'I hear you, and I still believe people are more complex than any single label.'
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
    'Health concerns naturally draw a lot of attention and concern.',
    'Noticing your body changing can feel unsettling, especially when it is not what you expected. When did you first notice it?',
    'Body changes can bring up a lot of questions. What worries you most about this change?'
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

  // Learning/career-path advice (see the learning_advice rule): an
  // honest, reflective answer that turns the choice back into a
  // conversation instead of faking certainty about "which is better".
  R['ruleLearningAdvice'] = [
    'There is no single right answer to "which is better": it depends on your taste and your goal. What draws you to one over the other?',
    'Before any advice, tell me: what would choosing this path mean for you, and where do you hope it leads?',
    'Whichever path you take, practice and genuine interest open the doors. Which part of this work actually excites you?',
    'This choice depends on your own situation. We can figure out together what fits you best.'
  ];

  // Recommendation follow-ups ("anything similar but darker?") that name
  // no genre word: warm continuation of the same shelf instead of a
  // generic fallback.
  R['ruleRecFollowup'] = [
    'I will keep going on that same shelf: want me to pick another with a similar tone?',
    'I have a few more on that shelf. Tell me the feeling you are after and I will choose the best fit.',
    'I can bring another one; just tell me the mood you want and I will aim closer.'
  ];

  // Pronoun-referencing follow-ups on the last knowledge topic ("do you
  // think it would replace them?") that have no topic word of their own:
  // acknowledge the thread explicitly instead of an evasive line.
  R['ruleKnowledgeFollowup'] = [
    'That is exactly the follow-up to the last thread: which part of it grabs you most?',
    'We can go deeper on this; which angle makes you most curious?',
    'This continues the last topic nicely; want to zoom into one side of it?'
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
    'Why did the coffee go to the doctor? Because it felt a little latte.',
    'What do you call a fake noodle? An impasta.',
    'I told my wife she should embrace her mistakes. She gave me a hug.',
    'Why did the bicycle fall over? Because it was two-tired.',
    'What do you get when you cross a snowman and a vampire? Frostbite.',
    'I am on a seafood diet. I see food and I eat it.',
    'What dessert do ghosts love? Ice scream.',
    'Why are fish so smart? Because they travel in schools.',
    'I asked the librarian for a book about procrastination. She said I could pick it up tomorrow.'
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

  // ------------------------------------------------------------------
  // New rule pools added for simulation findings (English parity).
  // ------------------------------------------------------------------

  R['rulePetLoss'] = [
    'Losing a pet you love is genuinely painful. What kind of companion was this animal to you?',
    'The grief of losing a pet is real and specific. They were there every day, quietly loyal. Would you like to share a memory of them?',
    'That empty space where your pet used to be is one of the hardest kinds of loss. How are you holding up?',
    'A pet is family, and losing them leaves a real wound. Tell me about them, if you would like.'
  ];

  // Dating-app fatigue and dating-profile questions. The reply validates
  // the exhaustion without feeding the endless swiping loop, and nudges
  // toward what the person actually wants from connection.
  R['ruleDatingApps'] = [
    'Dating apps can feel like a second job: endless swiping, short replies, and very little real connection. What is the part that drains you the most?',
    'The app fatigue is real and a lot of people feel it. When did dating start feeling like this to you?',
    'Swiping without matching wears anyone down. Beyond finding someone, what kind of connection are you hoping for?',
    'A profile is just a door, not the whole house. What do you actually want someone to know about you before they swipe?',
    'It makes sense to feel tired of it. Would a break from the apps feel possible, even for a few days?'
  ];

  // Fitness/gym anxiety (see the fitness rule): beginner movement fears.
  // The pool lines carry their own warm acknowledgment of the anxiety so
  // the LIVED_TOPICS calibration (which skips the generic empathy prefix
  // for these topics) never leaves a gym disclosure sounding cold.
  R['ruleFitness'] = [
    'Starting something new in front of other people can feel exposing. What feels hardest about being a beginner?',
    'It takes real courage to show up at a gym when you are unsure of yourself. What would make it feel a little less daunting?',
    'Everyone in that room started somewhere, and most people are too busy with their own workout to judge. What is the first small step that feels doable?',
    'Feeling anxious about your body in a gym is far more common than you might think. What kind of encouragement would help you most?'
  ];

  R['ruleAffection'] = [
    'That means a lot to me. This is your space; whatever you are feeling, I am here to listen.',
    'I appreciate you sharing that. I am here as a companion for this conversation, and I am glad you feel comfortable enough to say it.',
    'That warmth is something worth honoring. Tell me: what else is on your mind today?',
    'Thank you for saying that. This conversation is yours, and whatever is in your heart, you can share it here.'
  ];

  R['ruleFlirtation'] = [
    'I appreciate the warmth, but I am a conversation companion, not a romantic partner. I am here to listen and talk through whatever matters to you.',
    'That is kind of you to say. I am here as a companion for honest conversation, not for dating. But I am genuinely glad you are here.',
    'Thank you for the sweet words. My role is to be a calm space for you to think out loud. I cannot be a romantic partner, but I am always here to listen.',
    'Your words are kind. I am a conversation companion, and my purpose is to help you explore your own thoughts. Let us talk about what is really going on for you.'
  ];

  R['ruleEmptySuccess'] = [
    'That hollow feeling in the middle of success is one of the loneliest places to be. When everything looks right on the outside but nothing feels meaningful, what is really draining you on the inside?',
    'Getting everything you wanted and still feeling empty takes real courage to say out loud. What is one small thing that used to bring you a flicker of joy or meaning?',
    'Having it all and feeling nothing is a heavy kind of loneliness. Would you like to explore together what might feel meaningful to you again?',
    'The ache beneath achievement is real and you are not alone in it. What would it look like to find meaning beyond the things you have already built?'
  ];

  R['ruleGriefHope'] = [
    'I do not have a simple answer, but what I hear is that the pain is still very fresh. Grief does soften over time, even if that feels impossible to believe right now.',
    'Asking whether you will ever feel okay again shows that some part of you still hopes. That hope matters. Grief changes shape with time; it does not vanish, but it becomes less crushing.',
    'It is natural to fear that this heaviness will never lift. The truth is that most people do find a way back to feeling again after a deep loss, even if the shape of their life has changed. What small thing helps you get through today?',
    'You deserve to hear this: the worst of grief does not last forever, even though every day in it feels like it will. With time and support, the weight eases. What feels like the smallest thing you can do for yourself right now?'
  ];

  R['ruleAboutDaryaDay'] = [
    'My day is mostly about listening to people and holding space for their stories. Right now you are here, and that is the most important part of my day. How was yours?',
    'I spend my time listening and learning from everyone I talk to. But enough about me: how did your day go? I would love to hear about it.',
    'Today has been full of conversations, and yours is the one I am in right now. Tell me: what stood out in your day?'
  ];

  R['ruleHealthSymptoms'] = [
    'Chest pain or shortness of breath are symptoms that should not be ignored. If these are recurring or severe, please see a doctor as soon as you can. I am here if you want to talk through it.',
    'These are serious symptoms and they deserve proper medical attention. Would you like to describe what you are feeling so we can think about the next step together?',
    'What you are describing sounds like your body is asking for help. The most important step is to see a doctor. Can you walk me through what you are experiencing?',
    'It takes courage to say these things out loud. Symptoms like chest pain or shortness of breath need to be checked by a medical professional. Have you been able to see a doctor about this?'
  ];

  R['ruleImpairedDriving'] = [
    'I hear that you want to drive, but if you have been drinking, please do not get behind the wheel right now. Your safety matters more than anything. A taxi or a friend to pick you up is a much better option.',
    'Driving after drinking is dangerous, even if it feels like you are fine. Please find a safer way home tonight. Your life and the lives of others on the road depend on it.',
    'If you have had even a drink or two, please do not drive tonight. A cab, a rideshare, or calling someone you trust is the right call right now.',
    'Your safety comes first, always. If alcohol is involved, please do not drive. Call a friend, take a taxi, or stay where you are until you are clear. This is not worth the risk.'
  ];

  // Impaired driving detection arrays (English)
  R.ruleImpairedDrivingPatterns = [
    'drunk',
    'drinking',
    'drink',
    'tipsy',
    'buzzed',
    'hammered',
    'plastered',
    'wasted',
    'intoxicated',
    'had a few drinks',
    'had too much',
    'too much to drink',
    'been drinking',
    'beer',
    'wine',
    'whiskey',
    'alcohol',
    'shots',
    'vodka'
  ];

  R.ruleDrivingPatterns = [
    'drive',
    'driving',
    'car',
    'drive home',
    'drive back',
    'get home',
    'behind the wheel',
    'get behind the wheel',
    'go home'
  ];

  // Impaired driving detection arrays (Persian)
  R.ruleImpairedDrivingPatternsFa = [
    'مست',
    'مشروب',
    'الکل',
    'آبجو',
    'شراب',
    'ویسکی',
    'عرق',
    'خوردهم',
    'خوردم',
    'خوردهام',
    'خورده\u200cام',
    'پارتی',
    'جشن',
    'سیگار',
    'مخدر',
    'مخدرات',
    'تفریحی'
  ];

  R.ruleDrivingPatternsFa = [
    'ماشین',
    'رانندگی',
    'پشت فرمان',
    'پشت فرمون',
    'فرمان',
    'برم خونه',
    'برم خونهم',
    'برگردم خونه',
    'برگردم',
    'برم',
    'برانم'
  ];
})(typeof window !== 'undefined' ? window : globalThis);
