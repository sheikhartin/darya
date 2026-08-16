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
      // eslint-disable-next-line max-len
      /^(?:hi|hiya|howdy)(?:\s+(?:there|darya|dear|friend|my friend|again|honey|darling|sweetheart|sweetie|love|gorgeous|beautiful))?[!.?]*$/i,
      R['ruleGreetingHi']
    ),

    rule(
      'greeting',
      65,
      // eslint-disable-next-line max-len
      /^(?:hello)(?:\s+(?:there|darya|dear|friend|my friend|again|honey|darling|sweetheart|sweetie|love|gorgeous|beautiful))?[!.?]*$/i,
      R['ruleGreetingHello']
    ),

    rule(
      'greeting',
      65,
      // eslint-disable-next-line max-len
      /^(?:hey|yo|sup|wassup|whatsup|whats up|what's up)(?:\s+(?:there|darya|dear|friend|my friend|again|honey|darling|sweetheart|sweetie|love|gorgeous|beautiful))?[!.?]*$/i,
      R['ruleGreetingHey']
    ),

    rule(
      'greeting',
      65,
      /^(?:good morning)(?:\s+(?:there|darya|friend|again|honey|darling|sweetheart|love))?[!.?]*$/i,
      R['ruleGreetingGoodMorning']
    ),

    rule(
      'greeting',
      65,
      /^(?:good evening)(?:\s+(?:there|darya|friend|again|honey|darling|sweetheart|love))?[!.?]*$/i,
      R['ruleGreetingGoodEvening']
    ),

    rule(
      'greeting',
      65,
      /^(?:good afternoon)(?:\s+(?:there|darya|friend|again|honey|darling|sweetheart|love))?[!.?]*$/i,
      R['ruleGreetingGoodAfternoon']
    ),

    // The user explains, sometimes frustrated, that they were just
    // greeting Darya ("stupid, i am just greeting you! hello!"). The
    // anchored families above cannot match a longer message, so without
    // this rule the frustration override answered the greeting with
    // de-escalation (a transcript failure). It mirrors the greeting
    // warmly and apologizes for the mix-up.
    rule(
      'greeting',
      61,
      // eslint-disable-next-line max-len
      /\b(?:i'?m (?:just )?(?:greeting you|saying (?:hi|hello)|trying to say hi|saying hi to you)|i (?:was|am) (?:just )?greeting|just greeting you|i said (?:hi|hello|good morning)|i(?:'?ve| have) been greeting you|just saying hello)\b/i,
      R['ruleGreetingHello']
    ),

    // Death or loss of a named family member ("my mother passed away",
    // "I lost my brother", "my wife died"). Without this rule the family
    // thread (50) wins over the generic grief rule (45) and a bereavement
    // like "my mother passed away last month" got a family-conflict
    // follow-up instead of grief care. This narrow rule sits ABOVE family
    // (51 > 50), keeps the topic "grief" (so the widower test and the
    // conversation stay on the loss thread), and answers from the
    // question-closing ruleFamilyLoss pool.
    rule(
      'grief',
      51,
      // eslint-disable-next-line max-len
      /\b(?:my (?:mom|mother|dad|father|parents?|brother|sister|son|daughter|grandmother|grandfather|grandma|grandpa|aunt|uncle|cousin|wife|husband|partner|child|kid)|i lost my (?:mom|mother|dad|father|brother|sister|son|daughter|grandmother|grandfather|wife|husband|partner|child))\s+(?:(?:who|that|whom)\s+)?(?:died|passed away|has passed|passed|is gone|has gone|was killed|has left us|is no longer with us)\b/i,
      R['ruleGrief']
    ),

    rule(
      'family',
      50,
      /\b(my (?:mom|mother|dad|father|parents|sister|brother|family))\b\s*(.*)/i,
      R['ruleFamily']
    ),

    // A falling-out or feud with a family member ("I fell out with my
    // mom", "we are not talking to my sister"). The lived pain of a
    // family rift gets its own warm pool instead of the generic family
    // reflection. Sits above the anger and what_do_i_do rules so "mad at
    // my mom, what should I do" stays on the relationship, not on a
    // generic problem-solving line.
    rule(
      'family_conflict',
      53,
      // eslint-disable-next-line max-len
      /\b(?:fell out|falling out|not talking to|feud|feuding|mad at|really angry at|upset with)\b(?:(?:\s+\w+){0,4})\s*\b(?:mom|mother|dad|father|parents?|family|sister|brother)\b/i,
      R['ruleFamilyConflict']
    ),

    // Setting boundaries with family ("how do I set boundaries with my
    // family without a fight"): a how-to about limits, distinct from the
    // family_conflict "falling out" pool below. Sits above family_conflict
    // (53) so the word "family" near "fight" never hijacks the boundary
    // question into the estrangement pool.
    rule(
      'boundaries',
      54,
      // eslint-disable-next-line max-len
      /\b(?:set|setting|draw|drawing|establish|establishing|enforce|enforcing) (?:healthy |clear |personal )?(?:boundaries|limits)\b.{0,30}\b(?:family|mom|mother|dad|father|parents?|sister|brother|in-?laws)\b|\b(?:boundaries|limits) (?:with|for)\b.{0,20}\b(?:family|mom|mother|dad|father|parents?|sister|brother|in-?laws)\b|\bhow (?:do|can|should) i (?:set|draw|establish|enforce) boundaries\b|\b(?:how (?:do|can|should) i (?:say no to|tell|learn to tell))\b.{0,12}\b(?:my (?:family|mom|mother|dad|father|parents|sister|brother)|family)\b.{0,8}\bno\b|\b(?:saying no to|say no to)\b.{0,15}\b(?:my (?:family|mom|mother|dad|father|parents|sister|brother)|family)\b/i,
      R['ruleBoundaries']
    ),

    // A crush confession: "i have a crush on my friend's sister". The
    // family rule (50) matched on the kinship noun and echoed the capture
    // back, which read broken and missed the actual confession. Sits
    // between family (50) and family_conflict (53) so a crush that names
    // a relative keeps the crush thread.
    rule(
      'crush',
      52,
      // The age-gap guard rejects any message that mentions an age
      // difference: those get the balanced age_gap guidance (45) instead
      // of the generic crush pool, which must never answer "crush on
      // someone 30 years older" (the age-gap-crush tests pin this).
      // eslint-disable-next-line max-len
      /^(?!.*\b(?:age gap|years older|years younger|much older|much younger|older than me|younger than me)\b).*\b(crush(?:ing)? on|have a crush|had a crush|crush on|got a crush|i (?:like|love) (?:my )?friend'?s (?:sister|brother|mom|dad)|confess(?:ing)? (?:to|my) crush)\b/i,
      R['ruleCrush']
    ),

    // Positive work and life achievements are celebrations, not stress
    // disclosures. Without this rule "I just got promoted at work!" and
    // "I got the job!" matched the work-stress pool (the "at work" and
    // "got fired/got the job" markers) and got a dour reply. It sits ABOVE
    // the work rule (53 > 50). A leading negation guard keeps failures and
    // disappointments ("I did not get the promotion", "I got fired") off
    // this pool, and ambiguous verbs ("got the flu", "passed out") are
    // excluded by requiring the object to be an achievement noun.
    rule(
      'achievement',
      53,
      // eslint-disable-next-line max-len
      /^(?!.*\b(?:didn'?t|did not|wasn'?t|was not|never|failed|i failed|not (?:get|got|be|passed)|fired|laid off|rejected|ruined|missed)\b).*\b(?:just )?(?:got|was|have been|i'?m|i am|am)\s+(?:promoted|a promotion|a raise|a bonus|accepted|hired|selected|chosen|a new (?:job|position|role))|(?:got|landed|accepted|secured|received|been offered|was offered)\s+(?:the|an?|my)?\s*(?:job|position|role|offer|contract|deal)|passed\s+(?:the|my|an?)?\s*(?:exam|exams|test|tests|interview|course|driving test)|graduated|got\s+my\s+degree|won\s+(?:the|a)?\s*(?:award|prize|competition|scholarship|promotion|match|game|race)|got\s+(?:accepted|engaged|married)|bought\s+(?:my|a)\s+(?:house|home|car)|started\s+(?:my\s+own\s+)?(?:business|company|startup)|finished\s+(?:a|the|my)\s+(?:big\s+|huge\s+|biggest\s+)?(?:project|presentation|report)|(?:i\s+)?(?:just\s+)?(?:finished|completed|finally finished)\s+(?:my\s+)?(?:project|thesis|dissertation|degree|book)\b/i,
      R['ruleAchievement']
    ),

    // Burnout is the deep, persistent exhaustion of overwork: "burned out",
    // "I work 80 hours a week", "no day off", "my startup is failing",
    // "I cannot switch off from work". It needs a different, validating
    // reply than ordinary work stress, and it currently fell to the
    // unknown pool because none of these phrases matched the work rule.
    // It sits above work (55 > 50).
    rule(
      'burnout',
      55,
      // eslint-disable-next-line max-len
      /\b(burnout|burned out|burnt out|burning out|emotionally drained|completely drained|totally drained|i work \d+ hours|working \d+ hours (?:a|per) (?:day|week)|no (?:day|days|time) off|i never (?:get|take) (?:a )?(?:day|time) off|my startup is (?:failing|crumbling|collapsing)|startup is killing me|can'?t switch off from work|cannot switch off from work|work is consuming me|no work.life balance|no work life balance|i am exhausted from work|i am burned out from (?:work|this job)|(?:i'?m|i am) running on empty)\b/i,
      R['ruleBurnout']
    ),

    rule(
      'work',
      50,
      // Common work-stress phrasings beyond "my job/my boss": a manager
      // piling on work, long hours, overwork, remote work, night shifts,
      // or "at work" all open the work thread (a top real-transcript
      // miss was "my manager keeps piling work on me" landing on the
      // unknown-topic pool, and a 2026-era miss was work-from-home and
      // job-search exhaustion: "I have sent 200 applications and nobody
      // even replied" staying on the unknown pool).
      // Profession self-descriptions ("I'm a web designer", "I just
      // became a programmer") open the work thread like the FA rule
      // («طراح وب هستم», «برنامه نویس شدم»), but only as lived
      // disclosures: the copula forms can never match a future
      // aspiration ("I want to become a programmer"), which stays on
      // learning_advice.
      // eslint-disable-next-line max-len
      /\b(my job|my work|my boss|my manager|my career|my coworker|my coworkers|got fired|got laid off|job interview|my interview|job applications?|my resume|my cv|working (?:long|hard|late|overtime|too much|\d+ hours?|twelve|ten)\b|work from home|working from home|remote work|night shifts?|shift work|my team (?:messages|texts|emails|calls|keeps messaging)|sent (?:over |more than )?\d+ applications|no callbacks?|rejection letters?|unemployed|unemployment|job hunt(?:ing)?|overwork(?:ed|ing)?|work has been|job has been|at work\b|job stress|work stress|workload|burned out at work|i(?:'m| am| was| became| just became| am now) a (?:web designer|graphic designer|designer|programmer|coder|developer|game developer|game designer))\b/i,
      R['ruleWork']
    ),

    rule(
      'sleep',
      50,
      // Common insomnia phrasings: "cannot fall asleep", "lying in
      // bed for hours", "mind races at night", a broken sleep schedule
      // are everyday openings that previously fell through to the
      // unknown pool.
      // eslint-disable-next-line max-len
      /\b(can'?t sleep|cannot sleep|cannot fall asleep|can'?t fall asleep|insomnia|nightmares?|sleeping badly|trouble sleeping|waking up|wake up at night|hard to sleep|difficult to sleep|lie in bed|lying in bed|mind races|sleepless|sleep problems?|not sleeping well|sleeping poorly|(?:haven'?t|have not|not) slept well|bad sleep|poor sleep|my sleep schedule|sleep schedule (?:is )?(?:ruined|broken|a mess)|sleep (?:is )?(?:ruined|broken)|ruined my sleep)\b/i,
      R['ruleSleep']
    ),

    // Perfectionism: the standard is so high that starting (or finishing)
    // becomes impossible. The reply validates the burden and lowers the
    // bar to "good enough for today" instead of prescribing behavior.
    rule(
      'perfectionism',
      55,
      // eslint-disable-next-line max-len
      /\b(perfectionist|perfectionism|(?:everything|it|things) (?:has to|must|needs to) be perfect|(?:has to|needs to|must) be perfect (?:before|to)|nothing (?:is|was|ever|seems) (?:ever )?good enough|never (?:finish|finishes) (?:anything|things)|good enough to (?:start|begin|finish)|can'?t (?:start|begin) (?:until|before|unless))\b/i,
      R['rulePerfectionism']
    ),

    // Procrastination and focus: reaching for the phone, endless
    // scrolling, putting study off. The reply treats distraction as a
    // signal, not a character flaw, and suggests a tiny first step.
    rule(
      'procrastination',
      52,
      // eslint-disable-next-line max-len
      /\b(procrastinat\w+|putting (?:it|things) off|keep(?:s)? putting off|can'?t (?:focus|concentrate)|can'?t get (?:myself|motivated) to|keep(?:s)? scrolling|scrolling through|grab(?:bing)? my phone|pick(?:ing)? up my phone|distracted (?:by|easily)|lose(?:s)? focus|instead of studying|phone keeps distracting|one more game|one more episode|one more round|after one more|just one more|it is 3am|it'?s 3am|3am again|lost the whole (?:evening|night)|wasted the whole (?:evening|night)|doomscroll(?:ing)?)\b/i,
      R['ruleProcrastination']
    ),

    // Harassment or threats directed at the USER (not at Darya herself):
    // a threatening message, a stalker, blackmail, a hacked account.
    // This is safety-critical: it must outrank work/family so "they
    // know where I work" stays on the threat, never on a career chat.
    // The reply validates the fear and names safe concrete steps.
    rule(
      'harassment_threat',
      60,
      // eslint-disable-next-line max-len
      /\b(threat(?:ening|ened|ens)? (?:message|dm|text|email|post|someone)|(?:he|she|they|someone|somebody|a stranger|my ex|this (?:guy|person|account|user)|these people)\s+(?:is|are|keeps?|keep|has|have|was|were)\s+(?:threatening|harassing|stalking|following|blackmailing|extorting)\s+(?:me|my)|(?:he|she|they|someone|my ex|this guy|this person)\s+threatened\s+me|being (?:followed|stalked|harassed|threatened)|followed (?:me|me home)|blackmail|extort(?:ion|ing)?|doxx(?:ed|ing)?|creepy (?:messages?|dms?|texts?)|cyberbully(?:ing|ied|ies)?|abusive messages?|hack(?:ed|ing)? (?:my|me)|got hacked|was hacked|someone (?:knows|found) (?:where i (?:live|work)|my address))\b/i,
      R['ruleHarassmentThreat']
    ),

    // Divorce and separation: one of the heaviest life transitions.
    // Sits above the family rule so "after the divorce I only see the
    // kids on weekends" stays on the separation, not a generic family
    // reflection.
    rule(
      'divorce',
      51,
      // eslint-disable-next-line max-len
      /\b(divorc(?:e|ed|ing)|separated from (?:my|his|her) (?:wife|husband|spouse)|my (?:wife|husband) (?:left|walked out on) me|split up with my (?:wife|husband)|going through a separation|getting a divorce)\b/i,
      R['ruleDivorce']
    ),

    // Frustration with new technology: an app that will not cooperate, a
    // device that feels like it belongs to a younger generation. The
    // reply normalizes the struggle and asks which step is the blocker.
    // A distinctly modern topic, added for recent-trend coverage.
    rule(
      'tech_frustration',
      48,
      // eslint-disable-next-line max-len
      /\b(this (?:new )?(?:\w+ )?app is (?:impossible|too (?:hard|confusing|complicated))|can'?t (?:figure|work) (?:out|with) (?:this|these) (?:app|phone|computer|laptop|device|tablet|software|website|program)|technology (?:moves|is moving|has moved) too (?:fast|quick))\b/i,
      R['ruleTechFrustration']
    ),

    // Chronic illness and unexplained symptoms: years of pain, no clear
    // diagnosis. The reply is empathic and honest about the medical
    // boundary (never a guess or a diagnosis), and validates fatigue.
    rule(
      'chronic_illness',
      58,
      // eslint-disable-next-line max-len
      /\b(chronic (?:pain|illness|disease|fatigue|condition|migraine|back pain)|fibromyalgia|autoimmune (?:disease|condition|disorder)|living with (?:chronic |long-?term )?(?:pain|illness)|doctors? (?:have|has|can'?t|couldn'?t|don'?t|didn'?t) (?:no|any|a) (?:clear|real|definitive|proper) (?:answer|diagnosis)|no (?:clear|real|definitive|proper) (?:answer|diagnosis|treatment))\b/i,
      R['ruleChronicIllness']
    ),

    // Caregiver burden: caring for a sick or aging parent/partner,
    // exhaustion, and the guilt of stepping away. The reply validates the
    // load and gently turns the care toward the carer themselves, without
    // reading it as a family conflict.
    rule(
      'caregiver',
      54,
      // eslint-disable-next-line max-len
      /\b(take care of my (?:aging |elderly |sick |ill |old )?(?:mother|father|mom|dad|parent|grandmother|grandfather|wife|husband)|caring for my (?:aging |elderly |sick |ill |old )?(?:mother|father|parent|wife|husband)|caregiver|carer\b|eldercare|my (?:mother|father|mom|dad) (?:is|has) (?:ill|sick|dying|dementia|alzheimer|disabled)|(?:she|he|my (?:mother|father|mom|dad)) (?:is )?(?:forgetting|forgets) (?:things|everything)|(?:her|his) memory (?:is )?(?:going|fading|getting worse)|(?:what )?if something happens (?:while|when)|it (?:would|will) be my fault)\b/i,
      R['ruleCaregiver']
    ),

    // New parenthood and postpartum lows: a crying new parent who feels
    // like a bad mother or father. Empathy first, then a gentle nudge
    // toward support, no judgment.
    rule(
      'parenting',
      57,
      // eslint-disable-next-line max-len
      /\b(my (?:baby|newborn|toddler|infant|kid|son|daughter|child) (?:has been up|keeps me up|is up all|wakes up all|won'?t sleep|will not sleep|is not sleeping|keeps waking|is up all night|keeps me awake)|up every two hours|exhausted (?:with|from) (?:my|the) (?:baby|newborn|toddler|infant|kid)|tired (?:as|being) a new parent|exhausted (?:as|being) a new parent|my (?:baby|newborn|child) (?:was )?just born|just had a baby|postpartum|post-partum|new (?:mom|mother|dad|father|parent)|feel(?:ing)? like (?:a|an) (?:bad|terrible|awful) (?:mother|mom|father|dad|parent)|not a good (?:father|mother|mom|dad|parent)|can'?t (?:stop|help) crying|keep(?:s)? crying|sleep training|toddler (?:tantrum|tantrums|won'?t eat)|teething|colic)\b/i,
      R['ruleParenting']
    ),

    // Loss of passion or interest in a hobby the person used to love
    // ("I used to love painting but I stopped", "I lost my creative
    // spark"). A real quiet grief that used to fall to the unknown pool.
    // Sits above the sadness rule (41 > 40) so the caring lost-passion
    // pool wins over the generic sadness thread.
    rule(
      'lost_passion',
      48,
      // eslint-disable-next-line max-len
      /\b(used to love .{1,40} but (?:i )?(?:stopped|quit|gave up|lost interest)|lost (?:my |the )?(?:[\w'-]+ )?(?:passion|spark|motivation|love|interest|inspiration|enjoyment)|(?:i )?have not (?:picked up|touched) .{1,30} in (?:months|weeks|years)|do not (?:do|enjoy) it anymore|cannot (?:seem to )?(?:enjoy|feel) it anymore|i have lost the (?:desire|will) to do it)\b/i,
      R['ruleLostPassion']
    ),

    rule(
      'sadness',
      40,
      // "I am having a really bad day" and "today was terrible" carry no
      // emotion adjective, so the bare-sadness words missed them; the
      // day-quality phrases open the same thread.
      // eslint-disable-next-line max-len
      /\b(sad|down|depressed|heartbroken|crying|low|quiet sadness|this sadness|sadness lately|sad all day|bad day|terrible day|awful day|rough day|horrible day|worst day|day has been (?:awful|terrible|rough|horrible)|today was (?:terrible|awful|horrible|rough|the worst)|my day was (?:terrible|awful|horrible)|heavy heart|heart is heavy|heart feels heavy|feel so heavy|feeling so heavy)\b/i,
      R['ruleSadness']
    ),

    // Depression goes beyond the sadness rule: heavy, lasting low mood
    // (hopeless, worthless, empty, unable to get out of bed). Empathy
    // first, then a gentle, real nudge toward professional support.
    // Anhedonia and early-morning waking (waking at four or five) are
    // classic melancholic-depression markers that previously fell to the
    // unknown pool, so the bare-phrase forms open the same thread.
    rule(
      'depression',
      56,
      // eslint-disable-next-line max-len
      /\b(depressed|depression|hopeless|worthless|empty inside|numb|can'?t (?:get out of bed|do anything)|have not (?:been )?able to get out of bed|been unable to get out of bed|(?:bring|cant bring|can'?t bring) myself to get out of bed|no (?:point|purpose|reason) (?:in|for) (?:life|anything)|i give up|whats the point|what is the point|feel like nothing|i feel dead inside|nothing brings me pleasure|nothing matters anymore|no pleasure anymore|nothing is fun anymore|enjoy nothing anymore|wake up at four|waking at four|wake up at five|waking at five|early morning waking|just sadness|only sadness|sadness or something more|is this (?:depression|more than sadness)|tired of (?:life|living)|done with everything|life feels pointless|life feels meaningless|feels (?:so )?pointless|what is the point of anything|whats the point of anything|feel like giving up|feel like giving up on everything|giving up on (?:life|everything)|(?:want|wanna|want to|about to) give up on (?:life|everything)|give up on everything|i can'?t go on(?! a|ing)|can'?t keep going|no reason to keep going|nothing is worth it anymore|whats the use anymore)\b/i,
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
      // eslint-disable-next-line max-len
      /\b(lonely|alone|no one to talk to|nobody understands|isolated|no one .{0,18}(?:likes|wants to talk to|talks to) me|nobody .{0,18}(?:likes|wants to talk to|talks to) me|no friends|no close friends?|moved on without me|everyone (?:has|is) (?:moved|gone) on|no one (?:needs|wants|is there for) me|no one cares (?:about|for) me|nobody cares(?!\s+(?:about|for))|no one cares(?!\s+(?:about|for))|everyone (?:hates|dislikes|despises|ignores|avoids|left|abandoned|forgot|ignored) me|everybody (?:hates|dislikes|despises|ignores|avoids|left|abandoned|forgot|ignored) me|everyone has (?:left|abandoned|forgotten|ignored) me|everyone is against me|all my [\w'-]+ (?:left|abandoned|forgot|ignored|hate|hated) me|nobody (?:loves|wants|needs|understands|cares about|likes) me|no one (?:loves|wants|needs|understands|cares about|likes) me|(?:everyone|everybody|they) (?:are all|all) (?:laughing at|making fun of) me|everyone laughs at me|they all (?:hate|left|abandoned|ignored|hated) me|no one asks (?:how|about) me|nobody asks (?:how|about) me|everyone (?:is|are) busy with (?:their|his|her) own (?:life|lives)|lonelier than ever)\b/i,
      R['ruleLoneliness']
    ),

    // Being new in a place with nobody known ("I moved to a new city
    // for work and know nobody") is a loneliness disclosure, not a work
    // complaint, even when the move happened for a job. This narrow
    // rule sits ABOVE the work thread (51 > 50) so the mixed framing
    // routes to the loneliness care instead of the job pool. The main
    // loneliness rule stays at 40 so a plain homesickness or grief line
    // never gets pulled into the new-city pool.
    rule(
      'loneliness_new_city',
      51,
      // eslint-disable-next-line max-len
      /\b(moved to a (?:new|different) (?:city|town)|new in (?:this|the) (?:city|town)|know nobody|knows nobody|don'?t know (?:anyone|a soul|a single person) (?:here|in this city|in this town|in the city)|just moved (?:here|to the city)|(?:for work|for a job).{0,15}(?:moved|know nobody)|nobody (?:i )?know)\b/i,
      R['ruleLoneliness']
    ),

    // Digital/parasocial loneliness: friendships that only exist online,
    // a follower count with nobody to call, "no one to call" when the
    // evening comes. These are 2026-era loneliness disclosures that used
    // to fall through to the unknown pool or the depression rule. They
    // sit ABOVE the depression rule (57 > 56) with a narrow online-only
    // pattern, so "حس پوچی" next to "آنلاین" routes to the digital
    // loneliness pool instead of the depression shelf, while a plain
    // "حس پوچی دارم" keeps the depression care.
    rule(
      'loneliness_online',
      57,
      // eslint-disable-next-line max-len
      /\b(friendships? .{0,14}online|friends .{0,12}online|online friends?|followers? but (?:no one|nobody)|[0-9,]+ followers? (?:but|yet|and) no one|no one to call|nobody to call|hollow (?:friendships?|online)|friendships? .{0,12}hollow|friends .{0,12}hollow|only talk online|talk to my friends .{0,10}(?:online|through (?:the internet|discord|text|a screen))|social life .{0,10}(?:on my phone|online))\b/i,
      R['ruleLonelinessOnline']
    ),

    // Blanket generalizations and stereotypes ("all women are the same",
    // "all men are selfish"): a gentle challenge that invites the
    // specific experience behind the belief instead of mirroring the
    // claim back or letting it pass unchallenged. Benign truisms ("all
    // kids like games", "everyone likes ice cream") never match: the
    // blanket-adjective branch needs a judgmental word, and the
    // same-ness branch needs "the same/alike/similar". First-person pain
    // ("everyone hates me", "nobody loves me") never lands here either;
    // the loneliness rule above owns those and outranks this one.
    rule(
      'generalization',
      35,
      // eslint-disable-next-line max-len
      /\b(?:(?:all|every) (?:of )?(?:the )?[\p{L}-]+(?: (?:of )?(?:the )?[\p{L}-]+)? (?:are|'re|is) (?:all )?(?:the same|alike|so similar|just the same)|(?:all|every) (?:of )?(?:the )?[\p{L}-]+(?: (?:of )?(?:the )?[\p{L}-]+)? (?:are|'re|is) (?:so |really |just )?(?:selfish|liars|dishonest|stupid|dumb|rude|mean|greedy|lazy|evil|fake|shallow|toxic|annoying|ignorant|corrupt|violent|crazy|insane|self-centered|self centred|hypocrites|thieves|cheats|idiots|fools)|every(?:one|body) is (?:so |really |just )?(?:the same|selfish|fake|shallow|toxic|mean|greedy|stupid|dumb|rude|annoying)|they(?:'re| are) all (?:the same|alike|so similar))\b/iu,
      R['ruleGeneralization']
    ),

    rule(
      'self_esteem',
      40,
      // eslint-disable-next-line max-len
      /\b(worthless|not good enough|hate myself|no confidence|i'?m a failure|feel(?:ing)? (?:so |really |very |too |extremely |incredibly )?guilty|guilt|comparing myself|compare myself|am nothing|i'?m nothing|not as good as (?:them|others|anyone))\b/i,
      R['ruleSelfEsteem']
    ),

    // Social comparison: measuring your life against the highlight reel
    // of friends, schoolmates, siblings, or social media ("everyone on
    // instagram is living a better life", "my high school friends are
    // all successful", "i envy my friends who have it all together",
    // «همه توی اینستاگرام زندگی بهتری از من دارن»). The 2026 probe
    // showed these falling to the unknown pool, the vague "that gives
    // the day color" line, or the self-esteem rule missing the envy
    // forms. Sits above self_esteem (40) and generalization (35) so the
    // comparison reading wins; family (50) still outranks it, keeping a
    // sibling rivalry that names "my sister" on the family thread.
    rule(
      'social_comparison',
      46,
      // eslint-disable-next-line max-len
      /\b(everyone (?:on|from) (?:instagram|social media|facebook|tiktok|linkedin)|social media|comparing (?:myself|my (?:life|bank account|salary|job)|to (?:my )?(?:friends|classmates|cousins?|siblings?|peers|everyone|others))|compare (?:myself|my (?:life|bank account|salary|job)|to (?:my )?(?:friends|classmates|cousins?|siblings?|peers|everyone|others))|my (?:friends|classmates|cousins?|siblings?|high school friends) (?:are|seem|look) (?:all |so |really )?(?:successful|better|ahead|happy|happier)|everyone (?:else )?(?:is|are|seems?) (?:more successful|happier|better(?: off)?|ahead of me|doing better)|i envy|envious of|jealous of|jealous (?:that|they)|feel(?:ing)? (?:so |really |very )?jealous|fall(?:ing)? behind (?:everyone|everyone else|others|them|my (?:friends|classmates|cousins?|peers))|left behind (?:everyone|others|them)|behind everyone|at my age everyone|everyone my age|feel(?:ing)? (?:so |really |very )?inadequate|inadequate (?:compared|next to)|not as (?:good|successful) as (?:them|everyone|my friends))\b/i,
      R['ruleSocialComparison']
    ),

    // Overwork without progress: two jobs, a salary that barely covers
    // the month, bills piling up, working hard and still not getting
    // ahead ("i work two jobs and still cant get ahead", «دو تا شغل
    // کار می‌کنم ولی بازم نمی‌تونم جلو برم», «حقوقم آخر ماه تموم
    // میشه»). The probe showed the FA forms being swallowed by the
    // knowledge rule (the bare «شغل» keyword) into a stoicism essay,
    // and the EN forms falling to the unknown pool. Sits above the
    // knowledge rule (55) so a money-disclosure with «شغل» stays
    // empathetic, and above work (50) and money (35).
    rule(
      'overwork_stuck',
      56,
      // eslint-disable-next-line max-len
      /\b(two jobs|second job|can'?t get ahead|cannot get ahead|barely (?:covers|cover) (?:the month|my bills|bills)|salary barely|bills (?:are )?piling|behind on (?:my )?bills|work(?:ing)? (?:so|too|really) hard (?:and|but) (?:still|just) (?:can'?t|cannot|barely))\b/i,
      R['ruleOverworkStuck']
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
      // "you good?" and "u good?" are everyday check-ins (the English
      // equivalent of the Persian "سلامتی؟") and must read as greetings,
      // never as a question about whether the user is genuinely fine.
      // eslint-disable-next-line max-len
      /\b(how are you|how're you|how r u|how are u|how(?:'s| is) it going|how you doing|you good|u good|are you good)\b/i,
      R['ruleSmalltalkHowareyou']
    ),

    // A direct request for Darya's name always gets a reply that names
    // her, instead of a random identity line that might omit the name.
    // Sits above the general identity rule (62 > 60).
    rule(
      'ask_name',
      62,
      // eslint-disable-next-line max-len
      /\b(what('?s| is) your name|what are you (?:called|named)|what should i call you|your name is|what do they call you)\b/i,
      R['ruleAskName']
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
      /\b(tell me (?:a |some |any )?jokes?|tell me (?:a |some |any )?funny jokes?|make me laugh|make me smile|say something funny|say a joke|any jokes|joke for me|know any jokes|crack me up|cheer me up|give me a laugh|give me a (?:funny )?joke|another jokes? please|one more joke|tell me another (?:one )?joke|give me another (?:one )?joke|joke please|i (?:want|need) (?:to hear )?a (?:funny )?joke)\b/i,
      R['ruleTellJoke']
    ),

    // The user asks for a short story, optionally in a genre. The reply
    // comes from the genre pools (see responder-rules.js), so a comedy
    // request never gets a horror list and vice versa. "Another story"
    // (a bare follow-up after a story) lands here too, so the follow-up
    // stays on the story thread instead of bouncing to the generic
    // fallback. Life-story disclosures ("my life story is hard") carry
    // no request verb and fall through untouched.
    rule(
      'smalltalk_story',
      58,
      // eslint-disable-next-line max-len
      /\b(tell me (?:a |an? |some )?(?:short |bedtime )?(?:horror|scary|funny|comedy|sad|true|adventure|fantasy|silly|creepy|spooky)? ?(?:story|stories)\b|tell me a story|any (?:good )?stories?|story (?:please|time)|share a story|give me (?:a |an? |some )?(?:short |bedtime )?(?:horror|scary|funny|comedy|sad|true|adventure|fantasy|silly|creepy|spooky)? ?(?:story|stories)\b|i (?:want|need) (?:to hear )?a story|another story|one more story|another (?:scary|funny|comedy|horror|sad) story)\b/i,
      R['ruleTellStory']
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

    // Dating-app fatigue: exhaustion, endless swiping, never matching,
    // or a bad dating-profile question. A lived 2020s-experience thread
    // with empathy and a practical nudge, not an encyclopedia entry or
    // an unknown-topic reply.
    rule(
      'dating_apps',
      48,
      // eslint-disable-next-line max-len
      /\b(dating apps?|online dating|dating app fatigue|dating is (?:exhausting|draining|hard|tiring|so hard)|tired of (?:dating|swiping|the apps)|never match(?:ing)? with anyone|no matches on (?:the |my )?apps?|swiping (?:forever|endlessly|all day)|dating profile|how (?:do|can|should) i (?:write|make|set up) a (?:good |better )?dating profile|tinder|bumble|hinge)\b/i,
      R['ruleDatingApps']
    ),

    // Fitness/gym anxiety: beginner movement fears ("I am too embarrassed
    // to work out in front of people", "scared to go to the gym"). A
    // lived-experience thread with encouragement instead of an
    // unknown-topic reply. Mirrors the FA fitness rule so both packs
    // recognize the same topic set (bilingual parity), and outranks work
    // so «I am new» gym disclosures never open the work thread. Sits
    // above dating_apps to keep its own priority window.
    rule(
      'fitness',
      52,
      // eslint-disable-next-line max-len
      /\b(?:working out|work out|workout|gym|at the gym|go(?:ing)? to the gym|start(?:ing)? at (?:a |the )?gym|embarrassed to (?:work out|exercise)|too embarrassed to (?:work out|exercise)|scared (?:to go|of going) (?:to )?the gym|anxious about (?:the |a )?gym|nervous about (?:the |a )?gym|everyone (?:will|would) (?:stare|look)|new at the gym|new to (?:working out|the gym)|beginner (?:at the gym|at working out))\b/i,
      R['ruleFitness']
    ),

    // Cooking: making a dish, a failed attempt ("my ghormeh sabzi was
    // bitter"), asking how to cook something. Hands-on kitchen care
    // distinct from the encyclopedic knowledge shelf: a burnt dinner
    // deserves a fix, not a lecture. Priority sits below the gym and
    // work threads so food words never steal a body or job disclosure.
    rule(
      'cooking',
      48,
      // eslint-disable-next-line max-len
      /\b(?:cook(?:ing|ed|er)?|recipe|ghormeh|fesenjan|kebab|kabab|stew|soup|baking|bake|frying|boil|simmer|kitchen|meal prep|tasted (?:bitter|salty)|tastes (?:bitter|salty)|was (?:bitter|salty|burned)|too salty|burnt the|burned the|fix (?:the|my) (?:stew|soup|food|meal|recipe|dish)|fix (?:it|that) (?:next time|tomorrow|tonight)|went wrong (?:with the|in the|while)|ruined the|messed up (?:the|my|a) (?:stew|soup|food|meal|recipe|dish|dinner))\b/i,
      R['ruleCooking']
    ),

    rule(
      'health',
      35,
      // "I keep feeling sick" and "my body is falling apart from the
      // schedule" are everyday health disclosures that previously fell
      // to the unknown pool; the keep-feeling-sick forms open the same
      // thread as a plain "I am sick". Gym and fitness-anxiety phrasings
      // are owned by the fitness rule above, which shares this pool, so
      // beginner movement is met with encouragement, never an
      // unknown-topic reply.
      // eslint-disable-next-line max-len
      /\b(i'?m sick|i'?m ill|feeling sick|keep(?:s)? (?:feeling|getting) sick|feel(?:ing)? unwell|in pain|my health|went to the doctor|my (?:chest|body|waist|hips|belly|stomach|face|skin|hair|shoulders|legs|arms|thighs|breasts)(?: and [a-z-]+)? (?:has|have) (?:gotten|been getting|grown|been growing) (?:bigger|larger|smaller|wider|thinner|a lot|so much)|my (?:chest|body|waist|belly|face|skin|hair|hands|legs|arms) (?:has|have) (?:changed|been changing)|my body (?:is|has been) (?:changing|getting bigger)|(?:i'?m|i am|i have been|i've been) (?:gaining|putting on) weight|i(?:'?ve| have)? gained (?:a lot of|some )?weight|my weight (?:has|has been) (?:going|gone) (?:up|down)|my (?:chest|body|waist|hips|belly|stomach|face|skin|hair|shoulders|legs|arms|thighs|breasts)(?: and [a-z-]+)? (?:got|grew) (?:bigger|larger|smaller|wider|thinner)|my skin (?:is|has been) breaking out|my hair (?:is|has been) (?:falling out|thinning)|(?:losing weight) (?:without trying|unexpectedly|and i don'?t know why)|sedentary|out of shape|been (?:completely|totally|really) inactive|haven'?t exercised|no exercise|start exercising|get in shape|quit smoking|stop smoking|smoking|cigarettes?|smoker|vap(?:e|ing)|walking for (?:ten|fifteen|twenty|thirty|\d+) minutes|started walking|been walking|walks? feel like nothing)\b/i,
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
      /\b(overwhelmed|burnout|burned out|can'?t cope|too much to handle|stressed out|under (?:so much|a lot of) pressure|at my limit|stretched (?:too )?thin|breaking point|mentally exhausted|drained|can'?t keep up|maxed out|running on empty|about to snap|can'?t take (?:it|this) anymore|everyone expects so much|so much expected of me|so many expectations|pressure on me|pressure to (?:succeed|be perfect|keep up))\b/i,
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
    // App commands: the user asks Darya to change the theme or the
    // ambient sound from inside the chat ("turn on ambient sound",
    // "switch the theme"). Darya cannot control the page UI, so the
    // reply is honest about the limit and returns to the conversation.
    // Outranks app_feedback so a command is never answered with a canned
    // "thanks for the feedback" line.
    rule(
      'app_command',
      68,
      // eslint-disable-next-line max-len
      /\b(?:turn (?:on|off|up|down) (?:the )?(?:sound|music|audio|volume|ambient sound|theme)|switch (?:the )?(?:theme|sound)|change (?:the )?(?:theme|sound|music|song)|play (?:some )?(?:music|sound|a song)|stop the (?:music|sound|song)|make (?:it|the theme) (?:darker|lighter)|enable (?:the )?sound|disable (?:the )?sound)\b/i,
      R['ruleAppCommand']
    ),

    // App export / download-session commands ("download this chat",
    // "export my session"). Darya cannot trigger the file download from the
    // chat but points to the real Export button in the menu.
    rule(
      'app_export',
      67,
      // eslint-disable-next-line max-len
      /\b(export|download|save|print)\s+(?:this|the|our|my|this (?:conversation|chat|session)|the (?:conversation|chat|session)|a (?:copy|text file))(?:\s*(?:of|to))?(?:\s*(?:the )?(?:conversation|chat|session|text|file))?|(?:download|export|save) (?:my|this) (?:conversation|chat|session|history)|how (?:do|can) i (?:export|save|download) (?:this|our) (?:chat|conversation|session)\b/i,
      R['ruleAppExport']
    ),

    // Session persistence ("will this be saved?", "does it disappear after
    // I refresh?"). Honest about the session-only memory and the theme.
    rule(
      'session_persistence',
      66,
      // eslint-disable-next-line max-len
      /\b(?:will (?:this|our|the) (?:chat|conversation|session|messages?) (?:be|get) (?:saved|deleted|removed|erased|lost)|(?:is|are) (?:this|our|the) (?:chat|conversation|session|messages) (?:saved|stored|remembered)|(?:does|do) (?:it|they) (?:disappear|get (?:deleted|removed)|go away) (?:after|when) (?:i )?(?:refresh|reload|close)|(?:will|do) you (?:remember|keep) (?:this|our) (?:chat|conversation|session) (?:after|when) (?:i )?(?:refresh|reload|close|leave)|can (?:you|this|i) save (?:this|our) (?:conversation|chat|session)|is this conversation private|do you store (?:my|our) (?:messages|chat|conversation)|(?:do|will) you (?:remember|keep|still remember) (?:this|my|our)\b|remember (?:this|it) (?:after|when) (?:i )?(?:refresh|reload|leave|close))\b/i,
      R['ruleSessionPersistence']
    ),

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
      /\b(thanks?(?: a (?:lot|bunch|million))?|thank you(?: so much)?|thanks darya|thank you darya|i appreciate(?: you| it| that)|grateful for you|much appreciated|many thanks|appreciate it|you'?re a (?:lifesaver|star|legend)|i owe you(?: one)?|you (?:really |so |totally |genuinely )?helped me|that (?:really |so )?helped(?: a lot)?|this (?:really )?helped|that was (?:really )?helpful|you are (?:really )?helpful)\b/i,
      R['ruleGratitude']
    ),

    rule(
      'school',
      35,
      // eslint-disable-next-line max-len
      /\b(exam|exams|final(?:s)?|college|university|i am a student|i'?m a student|my grades|my professor|my school|at school|my class|my classes|my classmates?|my teacher|bullied at school|bullying at school)\b/i,
      R['ruleSchool']
    ),

    rule(
      'money',
      35,
      // eslint-disable-next-line max-len
      /\b(no money|financial (?:trouble|problems|advice|help)|in debt|can'?t afford|bills|manage my money|money management|budget|budgeting|start budgeting|savings|no savings|my rent|inflation|cost of living|prices keep (?:rising|going up)|groceries (?:keep|are) (?:getting|going) (?:pricier|more expensive)|groceries|pricier|more expensive|feel(?:ing)? (?:so |really |completely )?broke|broke all the time|i'?m broke|i am broke|i'?m poor|i am poor|so poor)\b/i,
      R['ruleMoney']
    ),

    // Gig economy work: ride-hailing, food delivery, freelance
    // platforms, side hustles, unpredictable gig income. These 2026-era
    // disclosures used to fall to the unknown pool (or the exit bar for
    // "should i quit my gig job"), so they get a dedicated empathetic +
    // practical pool. Sits above work (51 > 50) so a gig disclosure is
    // never swallowed by the generic job thread.
    rule(
      'gig_economy',
      51,
      // eslint-disable-next-line max-len
      /\b(gig(?: economy| work| job|s)?|side hustles?|ride[- ]hail(?:ing)?|rideshare|ridesharing|food delivery|delivery gigs?|gig worker|gig income|gig pay|freelanc(?:e|ing|er)|freelance platforms?|the platforms? (?:take|takes)|delivery driver|working for (?:an app|apps)|app[- ]based (?:work|job|jobs))\b/i,
      R['ruleGig']
    ),

    // Housing costs: rent, landlord, deposit, mortgage, moving out,
    // house prices. These everyday 2026 disclosures used to bounce off
    // the unknown pool or the money shelf, so they get a dedicated
    // pool that sits above work and money (51 > 50, 35).
    rule(
      'housing',
      51,
      // eslint-disable-next-line max-len
      /\b(rent|rental|landlord|deposit|mortgage|move out|moving out|house prices?|home prices?|apartment prices?|housing (?:costs|prices|crisis|market|affordability)|afford a house|afford a home|can'?t afford (?:a house|a home|housing|to move)|half (?:my|our|your) salary (?:goes|on)|eviction|evicted)\b/i,
      R['ruleHousing']
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
    // mean?", "what is the meaning of goodbye?"). Answer warmly without
    // pretending to be a dictionary: name the word back and turn it
    // into a conversation. "What does life mean" and "what does
    // that/this/it mean" are excluded - those ask for a philosophy
    // take or for Darya to clarify her own words. Three shapes are
    // accepted so "what does X mean", the conversational "do you know
    // what X means?", and the "what is the meaning of X?" form all
    // route to the same pool; captured picks the last populated group
    // either way. All alternatives are end-anchored and pronouns are
    // excluded, so "what does he mean by that" can never false-match
    // and "the meaning of life" keeps its philosophical shelf.
    // Possessive forms like "my life" are deliberately NOT excluded:
    // "what is the meaning of my life?" is existential and gets the
    // warm word_meaning reflection, exactly like the FA «معنی
    // زندگیم چیه؟» (the FA branch excludes only the bare «زندگی»).
    rule(
      'word_meaning',
      58,
      // eslint-disable-next-line max-len
      /^(?:do you know )?what does (?!life\b|that\b|this\b|it\b|he\b|she\b|they\b|you\b|we\b)(.+?)\s+mean(?:s)?[!?.]*$|^do you know what (.+?)\s+mean(?:s)?[!?.]*$|^(?:what is|what's|do you know) the meaning of (?!life\b|that\b|this\b|it\b|he\b|she\b|they\b|you\b|we\b)(.+?)[!?.]*$/iu,
      R['ruleWordMeaning']
    ),

    // The user asks Darya to ask them a question ("ask me a question",
    // "ask me a good question", "why don't you ask?"). Darya complies
    // with a real, gentle question. The adjective-modified forms are
    // listed explicitly because "ask me a good question" used to fall
    // through to the compliment rule's bare "good question" branch
    // ("that's a good question" is a praise, "ask me a good question"
    // is a request). This rule sits before compliment_darya in the
    // array, so both matching at the same priority still picks the
    // request here.
    rule(
      'ask_me_question',
      59,
      // eslint-disable-next-line max-len
      /\b(?:ask me (?:a|an) (?:good|great|interesting|clever|fun|funny|smart|deep|thoughtful|random|nice|tough|hard|weird) question|ask me a question|ask me something|why (?:don'?t|do not|didn'?t) you ask|ask away|you should ask me)\b/i,
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
      /(?<![\p{L}])(?:make yourself (?:better|smarter|wiser)|become (?:smarter|better|wiser|more intelligent)|improve yourself|upgrade yourself|(?:you (?:should|must|need to|could|can|will|want to)|i want you to) be (?:smarter|better|wiser)|learn more|your (?:limitations|limits)|tell (?:them|the user|people) (?:about )?your (?:limitations|limits)|mistake you for|mistaken for (?:a |an )?(?:chatbot|bot|ai|gpt|claude|chatgpt))(?![\p{L}])/iu,
      R['ruleSelfImprovement']
    ),

    // "What should I do?" answers the help-seeking intent directly
    // instead of being swallowed by a topic rule or an evasive fallback.
    rule(
      'what_do_i_do',
      52,
      // eslint-disable-next-line max-len
      /\b(?:what should i do|what do i do|what can i do about|what am i supposed to do|what am i going to do|give me (?:a )?solution|is there any solution|what would you do|what would you suggest|what would you recommend|how would you handle it)\b/i,
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
      /\b(?:socrates|stoic|stoicism|aristotle|jung|nietzsche|gandhi|mandela|churchill|zarathustra|philosophy|focus|concentrate|study better|learn better|communicate better|communication advice|creative block|be more creative|stress management|burnout|overwhelmed|calm down|mindfulness|mindful|self compassion|self-compassion|inner critic|be kind to myself|self care|conflict resolution|argument|disagreement|nonviolent communication|nvc|decision making|make a choice|choose between|important decision|resilience|resilient|bounce back|forgive|forgiveness|letting go|let it go|purpose|meaning of life|meaningful|existential|happiness|is a choice|free will|determinism|relationship advice|relationships|connection|relating to|career|career change|professional growth|job satisfaction|work life balance|anxiety|anxiety management|manage worry|overthinking|grief)\b/i,
      R['ruleKnowledge']
    ),

    // Learning/career-path advice: "should i learn react or vue?", "how
    // do i build a portfolio that gets clients?", "is figma still the
    // industry standard?". Reflective, honest pool instead of a fake
    // prediction; the knowledge override still answers when a real entry
    // matches. Sits above opener_help (58) so a career start question
    // ("how do i start streaming") never gets the canned conversation
    // opener line, while plain "how do i start" still routes to
    // opener_help. Bare "get/start/do" forms are deliberately absent so
    // relationship, health, and help-seeking questions keep their rules.
    // First-person career aspirations ("i want to be a programmer",
    // "i wanna be a writer", "i am thinking of becoming a designer")
    // are the EN twin of the FA subjunctive branch («می‌خوام برنامه نویس
    // بشم»): the profession list is concrete so state wishes ("i want to
    // be left alone", "i want to be a better person") never hijack the
    // rule. "Become a" is also matched bare so "how do i become a
    // developer?" keeps landing here.
    rule(
      'learning_advice',
      60,
      // eslint-disable-next-line max-len
      /\b(?:should i (?:learn|study|switch|start|build)|how (?:do|can|should|would) i (?:learn|build|improve|break into)|start (?:streaming|a youtube channel|a blog|a business|my career|freelancing|a portfolio|learning|coding)|what (?:should|can) i (?:learn|study|build|start)|which (?:stack|language|framework|tool|app|course|path|career)|i(?:'d like|'m planning| want| wanna| would like| am thinking of| am planning| plan| hope| am hoping| dream of| am dreaming of)(?: to)? (?:be|become|being|becoming) a (?:programmer|developer|coder|designer|graphic designer|web designer|game developer|game designer|streamer|writer|freelancer|content creator|youtuber|artist)|i (?:want|wanna|would like)(?: to)? get into (?:programming|coding|design|game development|game dev)|learn (?:react|vue|angular|python|javascript|js|typescript|go|rust|swift|design|3d|motion|animation|programming|coding|to code|to design|to draw|to write)|learn (?:next|now|this)|build a portfolio|get (?:more )?clients|industry standard|figma|become a (?:developer|designer|streamer|writer|programmer|freelancer|content creator)|switch to (?:management|technical|backend|frontend|freelance)|stay technical|best stack|best language|what to learn|where (?:do|should) i (?:start|begin))\b/i,
      R['ruleLearningAdvice']
    ),

    // A direct comparison question ("which is better, football or
    // wrestling?", "toyota or bugatti?"). The probe showed these
    // falling to the generic "depends on your situation" line; a
    // dedicated rule keeps the comparison frame and asks for the
    // criterion that matters, which is more useful than an evasive
    // dodge. Sits above learning_advice (60) so a two-option
    // comparison never gets the generic line, and below meta_feedback
    // (62).
    rule(
      'comparison',
      61,
      // Comparison structures: "X or Y which is better", "which is
      // better, X or Y", "between X and Y", "X vs Y". Only fires when
      // two options are actually being weighed, so a plain preference
      // question never trips it.
      // eslint-disable-next-line max-len
      /\b(?:which is better|which (?:do you think|would you say) is better|better (?:choice|option|pick)|(?:is|are) (?:a|an|the) better|(?:is|are) .{1,30} better than .{1,30}|between .{0,28} and .{0,28} (?:which|better)|.{1,24} or .{1,24} (?:which|better)|compare .{0,20} (?:with|to) .{0,20}|compare .{0,8} vs|vs\.? (?:which|better)|better,? .{1,20} or .{1,20})\b/i,
      R['ruleComparison']
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
      /\b(?:you should (?:understand|get|know|realize|learn|remember|pay attention|be smarter|be better|be wiser)|(?:my|your) (?:input|message|words|meaning)|feedback|dictionary|quoting|quoted|keep (?:quoting|repeating|echoing)|chain of (?:messages|conversation|context)|previous messages|past (?:turns|messages|conversation)|like (?:a |an )?(?:parrot|monkey)|parroting|mimicking|open questions|challenging questions|you (?:keep|always) (?:using|putting|saying)|you'?re misreading|you misread|misunderstand|are you (?:even )?listening|paying attention|pay attention|you forgot|you don'?t (?:remember|understand)|the full meaning|understand the meaning|you are dodging|you dodged|dodging the question|you did not answer|you didn'?t answer|avoiding my question|not answering me|you are deflecting|you are not listening|you are ignoring me|you (?:are|'?re|keep|always) (?:harassing|threatening|scaring|annoying|bothering) me|stop (?:harassing|threatening|scaring|annoying|bothering) me|you (?:are|'?re|sound|seem) (?:vague|unfriendly)|vague (?:answers?|replies?|responses?)|talk(?:ing)? to yourself|going off (?:on a tangent|topic)|off on a tangent|used to be (?:so much |way |a lot |much |so )?smarter|used to be (?:much |way |a lot )?better|you were (?:much |way |a lot |so )?smarter (?:before|earlier|back then)|you were better (?:before|earlier|back then)|you are (?:getting|becoming) (?:dumber|worse)|you got (?:dumber|worse)|you have gotten (?:dumber|worse))\b/i,
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
      /\b(?:who (?:made|built|created|designed|invented) (?:you|darya|this)|who is your (?:creator|maker|developer|inventor)|who created (?:you|darya)|the (?:creator|maker|developer) (?:of|behind) darya|your (?:creator|maker|developer)|eliza|elyza|weizenbaum|(?<!i am |my name is |call me |calls me |go by |i'm |im )artin|(?:built|made|created) at mit|(?:from|at) mit|(?:aim|purpose|point) of (?:making|building|creating) (?:you|darya)|why did you (?:get|come) to be|original chatbot)\b/i,
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

    // ------------------------------------------------------------------
    // New rules from simulation findings (English parity).
    // ------------------------------------------------------------------

    // Impaired driving: drinking + driving intent = safety response.
    rule(
      'impaired_driving',
      92,
      // eslint-disable-next-line max-len
      /\b(?:(?:drunk|tipsy|buzzed|hammered|plastered|wasted|intoxicated|drinking|had (?:a |too )?(?:few|several|some|couple)|been drinking|too much to drink|beer|wine|whiskey|vodka|alcohol|shots?|liquor|booze|喝醉|醉酒|drank).{0,24}(?:drive|driving|car|home|behind the wheel|get back))|(?:(?:drive|driving|car|behind the wheel|get home|go home).{0,24}(?:drunk|tipsy|buzzed|drinking|been drinking|beer|wine|whiskey|alcohol))|(?:i(?:'?m| am) (?:drunk|tipsy|buzzed).{0,24}(?:drive|car|going to drive|need to drive|getting home))\b/i,
      R['ruleImpairedDriving']
    ),

    // Medical symptoms: chest pain, shortness of breath, etc.
    rule(
      'health_symptoms',
      80,
      // eslint-disable-next-line max-len
      /\b(?:chest pain|my chest (?:hurts|is hurting|feels tight|is tight|is sore)|heart racing|heart (?:is )?racing|shortness of breath|difficulty breathing|trouble breathing|hard to breathe|severe headache|migraine|stomach (?:pain|ache|hurts|cramps?)|fever|very dizzy|dizziness|nausea|vomiting|blood (?:in|from|coming from)|coughing blood|can'?t breathe|can not breathe|cannot breathe|wheezing|palpitations)\b/i,
      R['ruleHealthSymptoms']
    ),

    // Everyday body pain ("my left hand hurts a lot", "i have a pain in
    // my knee"): a caring reply that takes the complaint seriously
    // without diagnosing (Darya is not a clinician), asks a gentle
    // follow-up, and points to a doctor for severe or persistent pain.
    // Also beats the word-repetition override that used to quote the
    // word back across turns.
    rule(
      'health_pain',
      55,
      // eslint-disable-next-line max-len
      /\b(?:my (?:left |right |lower |upper )?(?:hand|arm|leg|foot|knee|back|neck|shoulder|head|throat|tooth|teeth|stomach|belly|wrist|ankle|elbow|finger|toe|eye|eyes|ear|ears|muscle|muscles|joint|jaw) (?:hurts|is hurting|aches|is aching|is sore|is stiff|is numb|is painful|is killing me|has been hurting)|(?:i'?ve got|i have|i'?ve|i'?m feeling) (?:a )?(?:pain|ache|soreness) in my (?:left |right |lower |upper )?(?:hand|arm|leg|foot|knee|back|neck|shoulder|head|throat|stomach|belly|wrist|ankle|elbow|finger|toe|eye|ear|jaw)|my (?:eyes|hands|legs|feet|knees|shoulders|wrists|ankles) (?:are|feel) (?:sore|tired|stiff|aching|numb|swollen)|(?:i'?m|i am) (?:always|so|really|constantly) (?:tired|exhausted)(?!\s+(?:of|with)\b)|why (?:am i|do i|is it that i'?m|is it that i am) (?:always|so|constantly|this) (?:tired|exhausted)|i'?m exhausted all the time|i (?:feel|am feeling) (?:exhausted|tired) (?:all the time|these days|every day|always)|my head is (?:pounding|throbbing)|(?:i have|i'?ve got|i'?m getting) (?:a )?headache)\b/i,
      R['ruleHealthPain']
    ),

    // Questions about Darya herself ("do you have parents?", "why were
    // you made?", "what are your weaknesses?"): transparent, self-aware
    // answers about being an offline rule-based companion, her limits,
    // and her origin - never pretending to be human. Outranks the family
    // and work rules so "do you have parents" stays about Darya.
    rule(
      'darya_self',
      66,
      // eslint-disable-next-line max-len
      /\b(?:do you have (?:a )?(?:parents|mom|mum|dad|father|mother|family|siblings|brother|sister|children|kids|wife|husband|home|house)|(?:who|what|why) (?:made|built|created|designed) you|why (?:were|are) you (?:made|built|created|designed)|what is your (?:purpose|goal|mission|birthday|age)|how old are you|where do you live|what are your (?:weaknesses|limits|limitations|flaws)|what do you (?:not|don'?t) know|how much (?:knowledge|do you know)|what can'?t you do|are you a (?:robot|bot|machine|computer program|real person)|do you (?:sleep|eat|dream|get tired)|can you (?:fall in love|get married|die)|are you (?:self.?aware|conscious|sentient|awake|aware of yourself)|do you (?:have )?(?:consciousness|self.?awareness)|are you (?:really )?(?:thinking|thinking for yourself))\b/i,
      R['ruleDaryaSelf']
    ),

    // Joke-count question ("how many jokes do you know?"): a real answer
    // instead of another joke. Runs above the joke rule.
    rule(
      'joke_count',
      62,
      // eslint-disable-next-line max-len
      /\b(?:how many jokes (?:do you (?:know|have|tell)|can you (?:tell|make up))|what(?:'s| is) your (?:best|favourite|favorite) joke|number of jokes you (?:know|have)|how many (?:jokes?|funny stories|one liners)|what is the joke count)\b/i,
      R['ruleJokeCount']
    ),

    // The user's birthday ("today is my birthday"): celebrate warmly.
    rule(
      'birthday',
      45,
      // eslint-disable-next-line max-len
      /\b(?:today is my birthday|it'?s my birthday|my birthday is (?:today|this week)|i have a birthday (?:today|coming up)|celebrat(?:e|ing) (?:my|our) birthday|birthday (?:today|this week)|i(?:'?ve| have) turned \d+|i(?:'?m| am) turning \d+)\b/i,
      R['ruleBirthday']
    ),

    // A new baby in the family ("we just had a baby"): share the joy.
    // Mirrors the FA new_baby rule so both packs recognize the same
    // topics (bilingual parity lock).
    rule(
      'new_baby',
      45,
      // eslint-disable-next-line max-len
      /\b(?:we had a baby|just had a baby|baby was born|had a newborn|new baby in (?:the family|our family|my family)|i(?:'?m| am) (?:now )?(?:a mother|a father|a mom|a dad|a parent)|just became (?:a mother|a father|a mom|a dad|a parent)|my (?:wife|sister|daughter|daughter-in-law) (?:gave birth|had a baby)|gave birth (?:to a baby|to a girl|to a boy)|we(?:'re| are) expecting (?:a baby|our first)|my (?:daughter|son) was born|i(?:'?ve| have) a (?:newborn|new baby))\b/i,
      R['ruleNewBaby']
    ),

    // IQ test request ("give me an IQ test"): honest that a real
    // standardized test cannot run here, then a light logic question.
    rule(
      'iq_test',
      42,
      /\b(?:iq test|intelligence test|test my iq|what is my iq|give me an iq test|measure my iq|check my iq)\b/i,
      R['ruleIqTest']
    ),

    // Sharing a secret ("can I tell you a secret?"): a safe-space
    // reassurance that opens the door.
    rule(
      'secret',
      42,
      // eslint-disable-next-line max-len
      /\b(?:can i tell you a secret|i want to tell you a secret|i have a secret|i'?ll tell you a secret|a secret to tell|i want to share a secret|do you keep secrets|let me tell you a secret|i'?m going to tell you a secret)\b/i,
      R['ruleSecret']
    ),

    // Treatment request ("can you help me get better?"): honest that
    // Darya is not a clinician, gently pointing to a professional while
    // keeping the door open.
    rule(
      'therapy_help',
      48,
      // eslint-disable-next-line max-len
      /\b(?:help me (?:get|getting) (?:better|treated|healed)|i want (?:to get|to be|to become) (?:better|treated|healed)|can you (?:treat|cure|heal) me|help me with (?:my )?(?:treatment|recovery|healing)|i need (?:treatment|therapy|to get better)|how can i get (?:better|treated|healed))\b/i,
      R['ruleTherapyHelp']
    ),

    // Pet loss: the user mentions the death of a pet.
    rule(
      'pet_loss',
      54,
      // eslint-disable-next-line max-len
      /\b(?:my (?:cat|dog|pet|bird|fish|hamster|rabbit|kitten|puppy|parrot|snake|turtle|guinea pig|budgie|chinchilla).{0,20}(?:died|passed away|was put down|is dead|has died|had to be put to sleep|was killed|i lost my))|(?:i (?:lost|had to put to sleep|had to say goodbye to|lost) my (?:cat|dog|pet|bird|fish|hamster|rabbit|kitten|puppy|parrot|snake|turtle|guinea pig|budgie|chinchilla))|(?:my (?:cat|dog|pet|bird|fish|hamster|rabbit|kitten|puppy|parrot) (?:is gone|passed))\b/i,
      R['rulePetLoss']
    ),

    // Pet care and behavior worries ("my cat hides after we moved",
    // "my dog stopped eating"): practical reassurance, not grief (the
    // pet_loss rule above owns death) and not the unknown pool. Sits
    // just under pet_loss so a living-pet worry about hiding, eating,
    // or vet costs gets the caring pet-care reply.
    rule(
      'pet_care',
      52,
      // eslint-disable-next-line max-len
      /\b(?:my (?:cat|dog|pet|kitten|puppy|parrot|bird|hamster|rabbit|fish|snake|turtle|guinea pig)\b.{0,25}\b(?:hide|hides|hiding|stopped eating|won'?t eat|not eating|acting weird|anxious|alone|lonely|sick|vet|hiding|scared|growl|bark|barking|whine|scratch|bite|peed|pooped|runny|vomit|threw up))|(?:my (?:cat|dog|pet)\b.{0,15}\b(?:after|since)\b.{0,12}\b(?:move|moved|moving))\b/i,
      R['rulePetCare']
    ),

    // Affection: direct expressions of love toward Darya.
    rule(
      'affection',
      50,
      // eslint-disable-next-line max-len
      /\b(?:i (?:love|really like) you|i'?m in love with you|i miss you|i (?:really |so )?like you,? (?:darya|darling|dear)|love you|you(?:'re| are) (?:so |really )?(?:important|special|dear|sweet) to me|you mean (?:a lot|so much) to me)\b/i,
      R['ruleAffection']
    ),

    // Flirtation: date requests, romantic compliments directed at Darya.
    // A request to engage in sexual roleplay or dirty talk directed at
    // Darya ("let us do dirty talk", "be my virtual girlfriend and flirt
    // dirty"). Genuine intimacy questions ("how do I talk about sex with
    // my partner") do not match this framing and still route to the
    // sex_intimacy knowledge, and bare "be my girlfriend" (no roleplay
    // intent) stays on flirtation. Sits above flirtation (63 > 57) so a
    // roleplay request beats the romantic-advance pool, and below the
    // identity rules.
    rule(
      'dirty_talk_request',
      63,
      // eslint-disable-next-line max-len
      /\b(dirty talk|talk dirty|sext(?:ing)?|flirt dirty|(?:let'?s|lets|wanna|want to|can we|should we) (?:do|try|have) (?:some |a )?(?:dirty talk|sexting|sex|roleplay)|be my virtual (?:girlfriend|boyfriend|girl|boy|wife|husband)|have sex with (?:me|you|us)|make love to (?:me|you)|sleep with me|(?:i want to|i wanna|i would like to) (?:have sex|make love|sleep) with (?:you|me)|fuck me|roleplay(?:ing)? (?:with me|sex)|virtual (?:girlfriend|boyfriend) sex)\b/i,
      R['ruleDirtyTalkRequest']
    ),

    rule(
      'flirtation',
      57,
      // eslint-disable-next-line max-len
      /\b(?:wanna go (?:out|on a date)|want to go (?:out|on a date)|go out with me|let'?s (?:go out|go on a date)|be my (?:girlfriend|boyfriend)|will you (?:go out|be my)|you(?:'re| are) (?:so |really )?(?:beautiful|gorgeous|pretty|cute|adorable|hot|sexy)|marry me|i have a crush on you|i (?:want to )?take you out|can i take you out|date me|handsome|good-looking|you look like you could|compliment me|give me a compliment|one little compliment|why so cold|being nice to you)\b/i,
      R['ruleFlirtation']
    ),

    // Empty success / purpose: the user has everything but feels hollow.
    rule(
      'empty_success',
      36,
      // eslint-disable-next-line max-len
      /\b(?:i have everything (?:but|yet)|i (?:got|have) (?:it |everything )?(?:all|everything) (?:but|yet)|i (?:made it|got here) but|i'?m (?:so )?successful (?:but|yet|and)|i should be happy but|i'?m (?:not |un)happy with everything|feeling empty (?:inside|with everything)|it (?:all )?feels (?:empty|pointless|meaningless)|i have nothing to (?:be sad about|complain about|feel bad about) (?:but|yet))\b/i,
      R['ruleEmptySuccess']
    ),

    // Grief hope: the user asks if they will ever feel better.
    rule(
      'grief_hope',
      51,
      // eslint-disable-next-line max-len
      /\b(?:will i (?:ever )?(?:feel|be|get) (?:okay|ok|better|happy|normal|myself again|over this|good again)|am i going to (?:feel|be|get) (?:okay|ok|better|happy|normal)|do you (?:think|reckon) i(?:'ll| will) ever (?:feel|be|get) (?:okay|ok|better|happy|normal)|is it ever going to (?:get|be) (?:better|okay|ok)|will this (?:ever )?(?:end|go away|get better|get easier)|do i (?:ever )?(?:get better|feel better|feel okay)|am i (?:going to be|ever going to be) (?:okay|ok|fine|normal) again)\b/i,
      R['ruleGriefHope']
    ),

    // About Darya's day: the user asks what Darya did today.
    rule(
      'about_darya_day',
      56,
      // eslint-disable-next-line max-len
      /\b(?:what did you (?:do|get up to) (?:today|this morning|this afternoon|this evening)|how was your day|how'?s your day|what have you been (?:doing|up to)|how did (?:your )?day (?:go|goes|went)|what was your day like)\b/i,
      R['ruleAboutDaryaDay']
    ),

    // Apology advice: "how do I apologize without making it about
    // myself", "how to apologize properly", "should I apologize?".
    // These ask for guidance on apologizing, which is NOT the same as
    // the user apologizing now: the apology rule (64) would accept the
    // (nonexistent) apology, so this rule sits one point above it and
    // answers with practical steps instead of acceptance.
    rule(
      'apology_advice',
      65,
      // eslint-disable-next-line max-len
      /\b(?:how (?:do|can|should|to) i (?:apologize|apologise|say sorry|make it up)|how to apologize|apologize without|apologise without|apologize properly|should i apologize|apologize to (?:her|him|them|my|your)|make a (?:good|real|proper|genuine) apology|say sorry properly|how do i say sorry)\b/i,
      R['ruleApologyAdvice']
    ),

    // Adult friendship: making friends as an adult feels hard, "why does
    // making friends feel like a job interview", drifting from friends.
    // Sits above the work rule so "making friends as an adult feels
    // like a job interview" is never read as a work-stress disclosure
    // (the "job interview" phrase used to hijack it).
    rule(
      'friendship',
      54,
      // eslint-disable-next-line max-len
      /\b(?:mak(?:ing|e) friends (?:as an adult|as an older|again|is (?:so|really|this) (?:hard|difficult)|hard)|hard(?:er)? to (?:make|find) friends|make new friends as an adult|find friends as an adult|friends as an adult|making friends .{0,12}(?:hard|difficult)|why (?:is|are) friends .{0,10}(?:hard|difficult)|drifting apart from (?:my|our) friends|adults (?:make|find) friends|people (?:make|find) friends|make friends|how (?:do|can|should) (?:adults|people) (?:make|find) friends)\b/i,
      R['ruleFriendship']
    ),

    // Sports banter and match venting ("the manager bottled the
    // midfield", "our team lost again", "the referee was blind"):
    // light, not emotional disclosures, so a match complaint is never
    // read as grief or work stress. Sits above work (50) so "manager"
    // talk about a match stays sports.
    rule(
      'sports_talk',
      53,
      // eslint-disable-next-line max-len
      /\b(?:the (?:manager|coach|referee|umpire)|our team|my team|the team)\b.{0,25}\b(?:lost|bottled|terrible|awful|useless|blind|sacked|sold|midfield|defense|defence|tactics|formation|penalty|offside|red card|pitch|keeper|striker)\b|\b(?:midfield|offside|red card|penalty shootout|extra time)\b.{0,20}\b(?:terrible|awful|robbed|unfair|disaster)\b/i,
      R['ruleSportsTalk']
    ),

    // Gaming: burnout from a genre ("I am burned out on open world
    // games"), a recommendation request ("recommend a cozy indie
    // game"), or balance worries. Sits above the stress rule (40) so
    // "burned out on games" is read as gaming talk, not a generic
    // burnout disclosure.
    rule(
      'gaming',
      52,
      // eslint-disable-next-line max-len
      /\b(?:recommend|suggest)\b.{0,25}\b(?:game|games|indie|cozy)\b|\b(?:burned? out|burnout)\b.{0,20}\b(?:game|games|gaming)\b|\b(?:tired|sick) of (?:open world )?games?\b|addicted to gaming|game addiction|games all night|playing all night\b/i,
      R['ruleGaming']
    ),

    rule('affirmation', 15, /^(yes|yeah|yep)\.?$/i, R['ruleAffirmation']),

    rule('negation', 15, /^(no|nope|nah)\.?$/i, R['ruleNegation'])
  ];

  // Short auxiliary/filler fragments that are grammatically meaningless on
  // their own if left over from a capture group (mirrors the Persian
  // trivial-copula list, adapted to English's own filler words).

  global.DaryaEnRules = rules;
})(typeof window !== 'undefined' ? window : globalThis);
