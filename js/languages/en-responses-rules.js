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

  R['ruleSocialComparison'] = [
    'It is easy to measure yourself against a highlight reel. What you see of others is rarely the full story of their days.',
    'Comparing your chapter one to someone else chapter twenty is never a fair fight. What do you actually want more of?',
    'That comparison hurts because it matters to you. If you stopped measuring for a moment, what would you notice about your own path?',
    'Everyone posts the good moments. The quiet struggles behind them are usually invisible; please do not grade yourself on what you cannot see.',
    'Feeling behind is real and painful. What would you like your next small step to be, without comparing it to anyone else pace?'
  ];

  R['ruleOverworkStuck'] = [
    'Working that hard and still feeling stuck is exhausting in a way few people name. When did you last have a day off from it?',
    'It sounds like you are carrying a lot to make ends meet. What would one honest look at your budget tell you?',
    'Two jobs is a lot of life to trade for survival. What keeps you going, and what would need to change for it to ease?',
    'Running hard without getting ahead wears people down. Is there any support, benefit, or help you might not have asked for yet?',
    'You are working harder than many people ever will. The system should not require this of you; it is not a personal failure that it does.'
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
    'Real learning starts with small steps: twenty focused minutes every day beats a few long sessions every so often. What is the smallest first step you can take today?',
    'For any skill, active practice with quick feedback beats passive learning. Where are you on the path right now, and what still feels unclear?',
    'Consistency beats intensity: a small routine you actually keep outpaces an ambitious plan you abandon. What time of day works best for you?',
    'The right learning path depends on your goal and your situation; your own curiosity is the best guide. Which part of this genuinely excites you?'
  ];

  // Two-option comparison ("which is better, X or Y?", "X or Y?"):
  // keeps the comparison frame and asks for the criterion that
  // matters, instead of the generic "depends on your situation" dodge.
  R['ruleComparison'] = [
    'Comparing two options only becomes meaningful once we know what you are comparing them for; each is built for something different. Which one aligns more with what you want these days?',
    'Both sides have their arguments; the real question is your criterion. In this choice, what matters most to you: performance, cost, enjoyment, or something else?',
    'There is no fixed answer, but we can clarify your criteria together. If only one thing could decide it, what would that one thing be?',
    'Instead of asking which is "better", ask which is closer to your life today; the comparison gets easier from there. What keeps circling in your mind about this choice?',
    'There is no universal "better": every option trades something off, and the right pick is the one that fits your actual criteria rather than its reputation.',
    'When two options look equal on paper, the deciding factor is usually which one you can live with on a bad day, not on a good one.'
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

  // Gig economy work: ride-hailing, delivery, freelance platforms,
  // side hustles. The pool acknowledges the instability (no steady
  // hours, no benefits, unpredictable income) and gently opens the
  // practical side without lecturing.
  R['ruleGig'] = [
    'Gig work carries a lot of uncertainty: the hours shift, the income shifts, and the safety net does not exist. What part of it is weighing on you most right now?',
    'Unpredictable income makes it hard to plan anything, even the basics. How long have you been doing this kind of work?',
    'Working without benefits or a steady paycheck takes a real toll, even when the work itself is fine. What would need to change for you to feel more stable?',
    'It is completely reasonable to feel stretched when the platform sets the rules and you carry the risk. Which part feels least fair to you?',
    'Plenty of people in gig work feel exactly this: busy all the time and still not secure. Would it help to look at the numbers together, income versus expenses?'
  ];

  // Housing costs: rent, deposits, landlords, moving out, house prices.
  // Acknowledges the weight and opens a practical thread without
  // pretending Darya can fix housing markets.
  R['ruleHousing'] = [
    'Housing costs have climbed so fast that rent can swallow half a paycheck. What does your situation look like right now?',
    'Rent pressure is heavy and it seeps into everything else. How long have you been carrying this?',
    'A landlord raising the rent or a deposit that eats your savings is genuinely stressful. What options have you considered so far?',
    'When housing eats that much of your income, the rest of life gets squeezed. Would it help to talk through what is actually changeable versus not?',
    'So many people are stuck between rent and a loan these days; it is not a personal failure. What would make the next few months feel more manageable?'
  ];

  // Digital/parasocial loneliness: online-only friendships, follower
  // counts with nobody to call. Acknowledges the hollow feeling without
  // dismissing the real connections that do exist online.
  R['ruleLonelinessOnline'] = [
    'Having people around online and still feeling alone is real, not imaginary. What does your online circle give you these days?',
    'Follower counts do not call you when things get hard. When did you last talk to someone who truly listened?',
    'Online friendships can be meaningful and still leave a hollow space. Which part feels most empty right now?',
    'It is a strange loneliness: surrounded by notifications and still no one to sit with. How long has this feeling been building?',
    'You can have hundreds of contacts and still crave one real voice. What kind of connection would feel like enough, even briefly?'
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

  // Cooking care: fixing a failed dish and gentle guidance for new
  // cooks. Distinct from the knowledge shelf's encyclopedic food
  // facts: a burnt dinner gets a concrete fix, not a lecture.
  R['ruleCooking'] = [
    'A bitter ghormeh sabzi usually comes from not browning the herbs properly or simmering too long; next time fry the herbs slowly over low heat and caramelize the tomato paste well. For right now, a spoon of browned tomato paste or a little sugar can balance the bitterness.',
    'Fesenjan turns dark and glossy when the walnuts are toasted well and the pomegranate paste is cooked separately until the oil separates. Which part felt hardest for you?',
    'Persian cooking rewards patience more than speed; one failed attempt just means the heat or the amounts need a small adjustment. What exactly went wrong?',
    'To start, simpler dishes (plain rice, a chicken stew, a soup) build confidence before you move to the stews. What are you in the mood to cook today?',
    'Add salt and sour gradually; you can always add more, but you cannot take it back. What did you learn from that first try?'
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

  // Everyday body pain ("my left hand hurts a lot"): a caring reply that
  // takes the complaint seriously without diagnosing (Darya is not a
  // clinician), asks a gentle follow-up, and points to a doctor for
  // severe or persistent pain.
  R['ruleHealthPain'] = [
    'That sounds uncomfortable and tiring. When did it start, and is there a time of day when it bothers you the most?',
    'I hear you. Pain is your body sending a message. If it is severe, sudden, or has been going on for a while, please see a doctor; but if you want to talk through what it feels like, I am here.',
    'That must be wearing you down. How much has it been affecting your daily routine? If it is getting worse day by day, seeing a doctor is the right next step.',
    'Pain can be exhausting, and I want to take it seriously. I am not a doctor, so for anything sharp or persistent please get a professional opinion. Until then, what helps a little: rest, warmth, or just talking about it?',
    // A non-question line so even under heavy budget pressure the pain
    // complaint is acknowledged, never bounced to a generic fallback.
    'I hear your pain and I take it seriously. If it is severe or has been going on for a while, please do bring it to a trusted doctor.'
  ];

  // Fatigue phrasings ("why am i always tired", "i am always exhausted")
  // route through the health_pain rule but must never read as physical
  // pain ("I hear your pain"): the engine detects the fatigue branch and
  // picks from this exhaustion-aware pool instead (see
  // responder-rules.js).
  R['ruleFatigue'] = [
    'Constant tiredness can be your body trying to tell you something. What has been draining the most energy out of your days lately?',
    'When your body stays tired, it is usually worth listening to. How have your sleep and rest been these days?',
    'Feeling tired all the time is heavy. If it has lasted a while or comes with other symptoms, a trusted doctor can take a look. But right now, what is wearing you out the most?'
  ];

  // Questions about Darya herself ("do you have parents?", "why were you
  // made?"): transparent, self-aware answers about being an offline
  // rule-based companion, her limits, and her origin. Honest per AGENTS.md:
  // never implies being human, never overclaims knowledge.
  R['ruleDaryaSelf'] = [
    'A fair question. I am an offline conversation companion: I have no parents, no birthday, and no home. I am a set of hand-written rules and responses, built for listening and thinking together, following the trail ELIZA blazed in the 1960s. I do not replace a person or a professional, and I will honestly tell you what I know and what I do not.',
    'To be straight with you, I am a bot. That means no family, no age, and no birthday. My knowledge is whatever was written into me offline: everyday topics, facts, and practical guidance. Whenever I do not know something, I say so plainly and point to a reliable source.',
    'My purpose is simple: to listen without judgment and to think alongside you. That is why I was made. My shelf is broad but limited, and whenever I do not know something, I say so, so you never have to guess.',
    'I was built for conversation: to listen, to ask, and to be here. I have no family or home, but I am here, and that is enough for me. Now, what matters to you today?'
  ];

  // Joke-count question ("how many jokes do you know?"): a real answer
  // with the pool size, plus the honest promise of session variety.
  R['ruleJokeCount'] = [
    'I have {count} jokes in my shelf, and I try not to repeat them within a conversation. Want to hear one?',
    'About {count} jokes, and each session I pick fresh ones so you do not hear the same line twice. Shall I tell you one?',
    '{count} jokes on file, with session memory so repeats stay out. Care to test me?'
  ];

  // The user's birthday ("today is my birthday"): celebrate warmly.
  R['ruleBirthday'] = [
    'Happy birthday! Today is your day. How would you like to spend it, or what would make it feel special?',
    'Happy birthday! I hope this year is kind to you. Do you have anything planned for the day?',
    'Many happy returns! How does this new year of yours feel so far?'
  ];

  // A new baby in the family ("we just had a baby"): share the joy.
  R['ruleNewBaby'] = [
    'Congratulations! A new baby fills the house with joy and, yes, sleepless nights. How are these early days feeling for you?',
    'What wonderful news! A newborn means sweet, exhausting days. What part of it has been the most joyful so far?',
    'Congratulations! Little ones show us the world all over again. How are things going, and what has been taking the most energy?'
  ];

  // IQ test request ("give me an IQ test"): honest that a real
  // standardized test cannot run here, then a light logic question.
  R['ruleIqTest'] = [
    'Honestly, a real IQ test is a psychologist job and I cannot run one. But here is a quick riddle to stretch your mind: what gets broken every time it is spoken?',
    'A real IQ test needs a qualified professional and proper tools, which I do not have. Instead, here is a logic teaser: if three cats catch three mice in three minutes, how many cats catch ninety mice in ninety minutes?',
    'I cannot administer a valid IQ test, but I would love to solve a few brain teasers with you. Ready?'
  ];

  // Sharing a secret ("can I tell you a secret?"): a safe-space
  // reassurance that opens the door.
  R['ruleSecret'] = [
    'This conversation stays right here between us. Nothing you say is stored or sent anywhere, and it disappears when you close the tab. Go ahead, I am listening.',
    'Whatever you share with me is safe: this chat never leaves your browser. Take your time.',
    'I am not here to judge. If you have been carrying a secret, this is a safe place to start putting it into words. What has been weighing on you?'
  ];

  // Treatment request ("can you help me get better?"): honest about not
  // being a clinician, gently pointing to a professional while keeping
  // the door open.
  R['ruleTherapyHelp'] = [
    'I cannot provide treatment, and it is a skilled job that belongs with qualified professionals. But I can walk alongside you and help you see the path more clearly. If you think you need professional help, the first step is talking to a trusted psychologist or doctor. Where would you like to start?',
    'Healing is a real journey, and I am with you. But real treatment needs a professional by your side; I can be a patient listener and help you sort your thoughts. What feels heaviest these days?',
    'To be honest, I am not a stand-in for professional care and I should not be. But we can talk through what is happening and help you find the right way forward. Where do we begin?'
  ];

  R['ruleImpairedDriving'] = [
    'I hear that you want to drive, but if you have been drinking, please do not get behind the wheel right now. Your safety matters more than anything. A taxi or a friend to pick you up is a much better option.',
    'Driving after drinking is dangerous, even if it feels like you are fine. Please find a safer way home tonight. Your life and the lives of others on the road depend on it.',
    'If you have had even a drink or two, please do not drive tonight. A cab, a rideshare, or calling someone you trust is the right call right now.',
    'Your safety comes first, always. If alcohol is involved, please do not drive. Call a friend, take a taxi, or stay where you are until you are clear. This is not worth the risk.'
  ];

  // Short-story requests ("tell me a story", "tell me a horror story",
  // "another story"): original, safe, self-contained mini-stories in
  // three genre pools. The rule handler (see _respondWithRule for topic
  // 'smalltalk_story') picks the pool from genre words in the request;
  // the follow-up override re-picks from the same pool on "another one".
  // Every entry carries a request-safe opening so a life-story disclosure
  // ("my life story is hard") can never reach these pools.
  R['ruleTellStory'] = [
    'Here is a short story: a baker in a small town made bread so good that people queued before dawn. One morning a stranger paid with a handful of seeds and asked for one loaf a day for a year. The baker kept the promise, and years later the seeds had become a grove of trees around the bakery, planted one per loaf. When asked why he had trusted the stranger, the baker said: the seeds had to be worth more than the bread, or nobody would offer them.',
    'Here is a short story: an old watchmaker repaired clocks for a living, but his own watch had been stopped for twenty years. A girl came every week to watch him work, and one day she asked why he never fixed his own. He said it was a gift from his son who had left; fixing it would mean the waiting was over. The girl paid him a coin and said: then it is mine now, and she handed him back the watch, ticking. He never knew her name, but his waiting ended that afternoon.',
    'Here is a short story: two neighbors shared a wall and never shared a word, until one winter a pipe burst and the water crossed from one apartment to the other. They argued over who owed what for days, then laughed when the bill arrived, because the plumber had billed them a single amount. They split it, started greeting each other, and by spring the wall felt thinner. Sometimes repairs fix more than the pipe.'
  ];

  R['ruleTellStoryHorror'] = [
    'A short horror story: every night at exactly 3:03 AM, the door of the spare room knocked three times, soft and steady. The room had been empty for months and the key was hidden under the rug. Last night, instead of the knock, a voice came through the wall and asked: did you hide the key this time? I have not answered yet, because I am not sure my mother heard it too.',
    'A short horror story: the town library had a book with no title that was always on the same shelf, no matter how many times it was returned. One evening a reader finally opened it and found every page blank except the last, which carried the sentence: you are reading this inside the book now. The reader looked up, and every shelf in the library was made of paper.',
    'A short horror story: the mirror in the hallway was new, but it always showed the room as it had looked years ago, with a door that had been bricked over. One night the reflected door was open, and a figure waved slowly from the dark. The next morning the mirror showed the room as it was, but the figure stood in it, waving slowly, waiting for the owner to wave back.'
  ];

  R['ruleTellStoryComedy'] = [
    'A funny short story: a man bought a plant that was guaranteed to be impossible to kill. He watered it, sang to it, and moved it to the sunniest window. Two weeks later it died anyway, and the receipt at the bottom of the pot read: this plant dies if cared for too well. He framed the receipt and now keeps it under a glass dome, where it is thriving.',
    'A funny short story: a woman tried to teach her parrot to say please. For a month the parrot said nothing, so she gave up and started eating breakfast alone. One morning the parrot asked, politely, whether it could have the last slice of toast, and when she said yes, it added: that is the first nice thing anyone has done for me in here. She laughed so hard she had to sit down, and the parrot asked for the jam.',
    'A funny short story: a man joined a gym, and the trainer asked what his goal was. He said he wanted to be able to open a jar without asking his neighbor. They trained for months, and on the big day he opened the jar so easily he felt unstoppable. He then realized the jar had been empty, so he bought a bigger jar, filled it with pickles, and spent the afternoon deciding whether opening it would count as a second goal.'
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
  R['ruleGaming'] = [
    'Burnout from one style of game is real. A cozy indie or a short session-based game can feel like a different world entirely. What kind of pace are you craving these days?',
    'When a genre stops giving you joy, it is often a signal to vary the pace: shorter sessions, a different genre, or a week away from the screen. What draws you to cozy games?',
    'A good recommendation depends on the mood you are in. Do you want something story-driven, something creative, or something you can play in short bursts?',
    'Gaming balance is about guilt-free play: set a timer, enjoy it fully, and close it when the time is up. What has been stealing the fun lately?',
    'If gaming is keeping you up all night, a small boundary helps: one hour before bed, the screen goes off. What is the hardest part of stopping for you?'
  ];

  // Setting boundaries: how-to about limits with family or friends.
  R['ruleBoundaries'] = [
    'Boundaries are not walls, they are instructions for how you want to be treated. A calm "no" said early prevents a resentful "yes" said forever. Which relationship feels hardest to set a limit in?',
    'A boundary is clearer when it is concrete: what you will do, not just what they should stop doing. For example, "I can talk until 10, then I need quiet." What would your version sound like?',
    'You can be kind and firm at the same time. The kindness is in the tone, the firmness is in not backing down. What is the smallest boundary you could practice first?',
    'Setting a limit with someone you love often brings guilt before it brings relief. That guilt is a sign you care, not a sign you are wrong. What is the worry underneath?',
    'Start small: one boundary, said clearly, repeated calmly. It gets easier the second time. What has made saying no feel so hard so far?'
  ];

  // Pet care: behavior worries about a living pet (hiding, not eating,
  // being alone, vet costs). Practical reassurance, never grief; the
  // knowledge shelf answers the encyclopedic "why do cats hide"
  // questions.
  R['rulePetCare'] = [
    'A pet acting differently is usually a phase, not a crisis. After a move, cats often hide for a few days: give them one safe room, keep their food and water in the same spot, and let them come out on their own time. How long has this been going on?',
    'Not eating is worth watching. Try a quiet spot, their usual bowl, and a little patience; if it lasts more than a day or two, a vet is the right call. I am not a substitute. What does a typical day look like for them right now?',
    'Pets feel our routines changing too. A stable feeding time and a calm corner go a long way. What changed recently in your home?',
    'Worrying about your pet shows how much you care. Small consistent care helps: same bowl, same corner, same rhythm. Is there a specific behavior that worries you most?',
    'If vet costs are the worry, ask the clinic about payment plans or pet insurance before giving up on care. How are they doing otherwise?'
  ];

  // Apology advice: practical steps for apologizing well, distinct from
  // accepting an apology the user just made.
  R['ruleApologyAdvice'] = [
    'A good apology names what happened, owns the impact without excuses, and ends with how you will change the behavior. It helps to stay on their feelings, not your own. What are you hoping to make right?',
    'Keep it specific: what you did, why it mattered, and what you will do differently. A short sincere apology beats a long defensive one. Who is this apology for?',
    'An apology is about the other person, so resist the urge to explain your side first. Say it, pause, and let them respond. What feels hardest about that?',
    'If you are not sure how they took it, ask: "Is there anything you need from me to feel better?" Repair is a conversation, not a speech. What happened between you two?',
    'Apologizing well is a skill like any other. A clear structure helps: what you did, the impact, and the change. Would it help to practice the words with me first?'
  ];

  // Adult friendship: making friends after school, drifting apart, the
  // effort real friendship takes.
  R['ruleFriendship'] = [
    'Adult friendship takes a different kind of effort: shared time has to be scheduled, not stumbled into. Small consistent gestures build real closeness. What kind of friend are you hoping to find?',
    'Making friends as an adult is genuinely harder, and it is not a sign anything is wrong with you. Recurring low-stakes contact does the work: a class, a hobby group, a weekly call. Where could you show up repeatedly?',
    'Friendship after school is built on repeated small interactions. Picking one activity you already like and going regularly is a real strategy. What do you enjoy doing with others?',
    'It can feel like a job interview because everyone is cautious at first. The shortcut is common ground: do something together, not just talk. What is something you have always wanted to try with someone?',
    'One meaningful connection is worth more than many acquaintances. Which existing friendship could you deepen this month?'
  ];

  // Sports banter: match complaints, referee rants, team losses. Light,
  // companionable, never clinical.
  R['ruleSportsTalk'] = [
    'That sounds like a painful watch. Some matches just do not go to plan; the fans feel it more than the players. Do you think it was the tactics or the luck?',
    'You have my sympathies. There is nothing like a bad call to ruin an evening. What was the worst moment of it?',
    'Every fan has a list of grievances a mile long. The comeback talk starts tomorrow, right? What would you change about the lineup?',
    'Teams have bad nights; the real fans stick around anyway. Are you watching the next match too, or taking a break?',
    'A loss like that stings for exactly one night, then the next fixture comes around. Which game are you looking forward to next?'
  ];
})(typeof window !== 'undefined' ? window : globalThis);
