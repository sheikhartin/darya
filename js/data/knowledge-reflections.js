/**
 * Darya - reflective knowledge domains (18 emotional and growth areas).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  const SHELF = {
    en: {
      philosophy: [
        'One useful philosophical move is to ask what you mean by the word at the center of the problem. A clearer question often changes the shape of the answer.',
        'A Stoic starting point is to separate what belongs to your actions from what belongs to the world outside your control. That distinction can make one next step easier to see.',
        'Aristotle often treated balance as a practiced skill rather than a perfect midpoint. The useful question is what a balanced response would look like here, today.',
        'A philosophical answer is rarely a command. It is usually a better question, a clearer distinction, or a view you can test against your own life.'
      ],
      thinkers: [
        "Socrates is useful here as a model of careful inquiry: begin with the other person's meaning and ask one question that reveals what is still unclear.",
        'Aristotle offers a practical idea of balance: a good response is not the strongest response, but the one that fits the situation.',
        'Epictetus reminds us to separate events from our judgments about events. That distinction can create room without dismissing the feeling.',
        'Marcus Aurelius models a brief return to the present task, especially when the mind is pulled in several directions.',
        "Carl Jung's idea of individuation suggests that self-knowledge grows when a person can notice different parts of themselves without reducing everything to one label.",
        'Nietzsche is a useful prompt toward self-authorship: question inherited expectations, but do not mistake rebellion for a complete answer.',
        "Gandhi's nonviolence can be read as disciplined action without dehumanizing the other person. In conversation, that means clarity without escalation.",
        'Nelson Mandela offers a reminder that dignity and reconciliation do not require forgetting what happened.',
        'Churchill shows the power of precise, honest language under pressure. Short sentences can carry courage without pretending the situation is easy.',
        'Zarathustra is associated with a strong emphasis on truth, ethical choice, and the ongoing work of becoming. It is an invitation to examine what values guide a decision.'
      ],
      focus: [
        'Focus usually improves when the next action is small, visible, and specific. Open the document is easier to begin than fix everything.',
        'Name the one task that would make the next hour feel less scattered, then give it a short protected window.',
        'Attention is easier to protect when distractions have a place to go. Keep a small note for them instead of negotiating with each one.',
        'If the task feels vague, define its finish line before trying to increase your motivation.'
      ],
      learning: [
        'Learning becomes stronger when you retrieve an idea from memory instead of only rereading it. A short self-test can reveal what stayed.',
        'A good study loop is attempt, notice the gap, check the source, then try again later. The gap is information, not a verdict.',
        'Short sessions with spaced returns often beat one long anxious session. Consistency gives memory more than intensity alone.',
        'When a subject feels opaque, explain one small part in your own words. The places where the explanation breaks show you where to look next.'
      ],
      communication: [
        'A clear conversation often separates observation from interpretation, then names the need or request underneath it.',
        'Before replying, identify whether the other person wants understanding, a decision, practical help, or a little space.',
        'A specific request is easier to answer than a broad complaint. It gives the conversation somewhere kind and concrete to go.',
        'Repair is part of good communication. A simple statement that you may have missed the point can be more useful than defending the first interpretation.'
      ],
      creativity: [
        'Creative work benefits from separating generation from judgment. Make a few imperfect options first, then decide what deserves refinement.',
        'A constraint can be a handle rather than a cage. Limiting time, materials, or format can give an idea enough shape to appear.',
        'When the blank page feels loud, borrow a structure from something you admire and change one important part of it.',
        'A small finished experiment teaches more than a large idea that never gets tried.'
      ],
      mindfulness: [
        'Mindfulness begins with a single breath noticed fully. Not a long session, just one inhalation and exhalation where you are actually present for it.',
        'The five-senses exercise can gently anchor you: name one thing you see, one you hear, one you feel, one you smell, and one you taste. It is a way of returning to the present moment without needing to solve anything.',
        'Thoughts during meditation are not failures. They are what minds do. The practice is not having no thoughts but noticing when you have wandered and returning without judgment.',
        'A short pause before reacting can create enough space to choose a response instead of being pulled by the first impulse. That space is where mindfulness meets daily life.'
      ],
      stress: [
        'Stress is not a sign that you are failing. It is a sign that your nervous system is working the way it evolved to work. The useful step is to notice it early rather than push through until it sharpens.',
        'A micro-break of sixty seconds where you look away from the task and breathe can reset your focus more effectively than pushing through another hour of diminishing returns.',
        'Setting a boundary is not rejection. It is a statement about what you need to sustain your capacity. The people who matter will adjust; the ones who do not were not counting on your sustainability anyway.',
        'Burnout often comes not from working hard but from working without recovery. A deliberate pause is not a luxury. It is maintenance for the only system you have to do any of this.'
      ],
      self_compassion: [
        'Self-compassion has three parts: treating yourself with the same kindness you would offer a friend, remembering that struggle is part of shared human experience, and holding your pain with mindful awareness rather than over-identifying with it.',
        'The inner critic is often trying to protect you from failure or rejection. Thanking it for its effort without letting it drive can loosen its grip without a fight.',
        'You are not a problem to be fixed. You are a person in the middle of a life, and some parts of that life are hard. That does not mean you are broken.',
        'Comparing your inside with other people outside is a shortcut to suffering. You see their curated results, not their ongoing process.'
      ],
      conflict: [
        'In a tense conversation, naming the shared need underneath both positions can change the direction. The need is often something simple: to be heard, to be respected, or to find a way forward together.',
        'Nonviolent Communication offers a clear sequence: observe without evaluating, name the feeling, identify the need, and make a specific request. Each step can be done in a single sentence.',
        'Listening for what the other person is feeling and needing, even when you disagree with their conclusion, can lower the temperature without requiring you to concede anything.',
        'Repair after a conflict is not about who was right. It is about restoring connection. A sincere attempt to understand the other perspective is often more effective than a perfectly argued defense of your own.'
      ],
      decision_making: [
        'A useful decision-making question is: if I chose this path, what would I want to have learned or become in a year? That shifts the frame from avoiding a wrong choice to growing toward something.',
        'The ten-ten-ten test can create perspective: how will this decision feel in ten minutes, ten months, and ten years? The short-term discomfort often fades while long-term alignment matters more.',
        'When a decision feels impossible, you may be looking for certainty that does not exist. A good enough choice made today can be adjusted tomorrow. Motion creates information.',
        'Values-based decision-making asks: which option is more aligned with the kind of person I want to be? Not which option is safer, but which is more truthful to who you are becoming.'
      ],
      grief: [
        'Grief is not a linear process with neat stages. It is more like a landscape you move through, where some days are heavier and some are lighter, and both are part of the terrain.',
        'Honoring someone you lost can take many forms: telling a story about them, doing something they loved, or simply sitting with the fact that they mattered. There is no wrong way to remember.',
        'The weight of grief does not shrink over time, but your capacity to carry it can grow. What feels unbearable today may become something you can hold alongside joy later.',
        'It is okay to feel okay sometimes. Grief does not require constant sadness. Moments of lightness or laughter are not betrayals. They are signs that you are still alive and still connected to life.'
      ],
      resilience: [
        'Resilience is not about never feeling the weight of difficulty, but about having ways to set it down when you need to, and to pick it up again only when you have the strength.',
        'Recovery is not a detour from resilience; it is the very mechanism that makes resilience possible. Rest between efforts is not weakness, but the quiet work of repair.',
        'Resilience is not a fixed trait you either have or lack. It is something you practice in small, ordinary moments: choosing to rest, asking for help, or simply continuing one more day.',
        'A resilient life is not one without struggle, but one where the struggle does not erase the capacity for joy, connection, and hope. You can hold difficulty and goodness at the same time.'
      ],
      forgiveness: [
        'Forgiveness is not about condoning what happened or reconciling with someone who hurt you. It is about releasing the grip that resentment has on your own inner life, so you can move forward without carrying the full weight of the past.',
        'Forgiveness is a process that unfolds in its own time, not a switch you can flip on demand. It often begins with a willingness to consider that you deserve freedom from the endless replay of the hurt.',
        'Forgiving someone does not mean trusting them again. Trust must be rebuilt through action over time. Forgiveness is about what you release inside yourself, not about what you owe the other person.',
        'Sometimes the person who needs your forgiveness most is yourself. Self-forgiveness is not an excuse; it is an acknowledgment that you are more than your worst moment, and that growth is still possible.'
      ],
      purpose: [
        'Meaning is not something you find fully formed, like a hidden object. It is something you build over time through attention to what matters to you, through the values you choose to live by, and through the way you show up for the people and activities that call on you.',
        'A sense of purpose often reveals itself not in grand life decisions, but in the quiet consistency of small actions: showing up for a friend, doing work that feels useful, or caring for something beyond yourself.',
        'Viktor Frankl observed that meaning can be found in every moment, even in suffering, when we choose our attitude toward what we cannot change. Purpose is not about having an easy life, but about having a life that feels like it matters.',
        'Purpose does not have to be one single thing you were meant to do. It can shift across seasons of life. What matters is not a fixed destination, but the direction you are facing and the reasons that give your steps weight.'
      ],
      relationship: [
        'A strong relationship is not one without conflict, but one where both people can return to each other after the conflict. Repair matters more than never having a disagreement.',
        'Listening to understand, rather than to reply, is one of the most underrated skills in any relationship. When someone feels heard, the conversation itself changes.',
        'Relationships ask for a balance between closeness and separateness. Being close does not mean losing yourself, and having your own space does not mean distance.',
        'The health of a relationship often shows up in the small moments: a pause before reacting, a genuine question about the other persons day, or the willingness to say I was wrong.'
      ],
      career: [
        'Career decisions are rarely about finding the one perfect path. They are more about choosing a direction that aligns with your values, learning from each step, and adjusting as you grow.',
        'Work satisfaction often comes less from the title or salary and more from feeling that your efforts matter, that you are learning, and that you are treated with respect.',
        'A career change does not have to be a dramatic leap. Small experiments on the side - a project, a course, a conversation with someone in a different field - can reveal what fits without requiring a total reset.',
        'Burnout in a career is rarely about the work itself. It is often about misalignment between your values and the demands placed on you, or between the effort you give and the meaning you get back.'
      ],
      anxiety: [
        'Anxiety is not a sign that something is wrong with you. It is your minds way of trying to protect you from a future it cannot control. The goal is not to eliminate it, but to relate to it differently.',
        'When anxiety spirals, grounding yourself in the present moment through your senses can interrupt the loop: name five things you can see, four you can touch, three you can hear, two you can smell, and one you can taste.',
        'Worry often masquerades as preparation. It can feel like thinking ahead, but endlessly replaying scenarios without action is not planning; it is rumination. A small concrete step breaks the cycle.',
        'Anxiety shrinks when you stop fighting it and start listening to it. Beneath the worry there is often a need: to feel safe, prepared, or in control. Identifying that need points toward a real solution.'
      ]
    },
    fa: {
      philosophy: [
        'یک حرکت فلسفی مفید این است که ببینیم واژه‌ی اصلی مسئله برایمان دقیقاً چه معنایی دارد. سؤال روشن‌تر گاهی شکل جواب را عوض می‌کند.',
        'یک شروع رواقی می‌تواند جداکردن چیزهایی باشد که به عمل ما مربوط‌اند از چیزهایی که بیرون از کنترل ما هستند. این فرق گاهی قدم بعدی را روشن‌تر می‌کند.',
        'ارسطو تعادل را بیشتر مهارتی تمرینی می‌دید تا نقطه‌ای بی‌نقص. سؤال مفید این است که امروز، در همین موقعیت، واکنش متعادل چه شکلی دارد.',
        'جواب فلسفی معمولاً دستور نیست؛ یک سؤال بهتر، یک تمایز روشن‌تر یا نگاهی است که می‌توانی با زندگی خودت بسنجی.'
      ],
      thinkers: [
        'سقراط برای اینجا یادآور پرسش دقیق است: اول معنای طرف مقابل را بفهم و بعد فقط یک سؤال بپرس که ابهام باقی‌مانده را روشن کند.',
        'ارسطو ایده‌ی کاربردی تعادل را پیش می‌گذارد: پاسخ خوب قوی‌ترین پاسخ نیست، بلکه پاسخی است که با موقعیت تناسب دارد.',
        'اپیکتتوس یادآوری می‌کند که اتفاق‌ها را از قضاوت‌مان درباره‌ی آن‌ها جدا کنیم. این فرق می‌تواند فضا بسازد، بدون اینکه احساس را انکار کند.',
        'مارکوس اورلیوس نمونه‌ای از برگشتن کوتاه به کار حاضر است، وقتی ذهن به چند طرف کشیده می‌شود.',
        'ایده‌ی فردیت‌یابی در نگاه یونگ می‌گوید خودشناسی وقتی رشد می‌کند که آدم بتواند بخش‌های مختلف خودش را ببیند، بدون اینکه همه‌چیز را به یک برچسب تقلیل دهد.',
        'نیچه دعوتی به خودنویسندگی است: انتظارات به‌ارث‌رسیده را بررسی کن، اما مخالفت را با جواب کامل اشتباه نگیر.',
        'اندیشه‌ی نافرمانی مدنی و خشونت‌پرهیزی گاندی می‌تواند یادآور عمل قاطع بدون بی‌ارزش‌کردن طرف مقابل باشد.',
        'ماندلا یادآور این است که عزت و آشتی لزوماً به معنی فراموش‌کردن اتفاق نیست.',
        'چرچیل نشان می‌دهد زبان دقیق و صادقانه زیر فشار چه نیرویی دارد. جمله‌ی کوتاه می‌تواند شجاع باشد، بدون اینکه سختی را انکار کند.',
        'زرتشت در سنت‌های فلسفی و دینی با حقیقت، انتخاب اخلاقی و کار مداوم برای شدن پیوند دارد؛ دعوتی برای دیدن ارزش‌هایی که راه تصمیم را می‌سازند.'
      ],
      focus: [
        'تمرکز وقتی آسان‌تر می‌شود که قدم بعدی کوچک، روشن و مشخص باشد. بازکردن فایل از درست‌کردن همه‌چیز شروع‌کردنی‌تر است.',
        'ببین کدام کار، اگر در ساعت بعد جلو برود، ذهنت را کمتر پراکنده می‌کند و برایش یک زمان کوتاه کنار بگذار.',
        'برای حواس‌پرتی‌ها یک جای کوچک در نظر بگیر و آن‌ها را یادداشت کن، به‌جای اینکه هر بار با آن‌ها مذاکره کنی.',
        'اگر کار مبهم است، اول پایانش را تعریف کن؛ بعد سراغ انگیزه برو.'
      ],
      learning: [
        'یادگیری وقتی محکم‌تر می‌شود که چیزی را از حافظه بیرون بکشی، نه فقط دوباره بخوانی. یک خودآزمایی کوتاه نشان می‌دهد چه چیزی مانده است.',
        'چرخه‌ی خوبی برای یادگیری این است: تلاش، دیدن شکاف، بررسی منبع و امتحان دوباره در زمانی دیگر. شکاف اطلاعات است، نه حکم درباره‌ی تو.',
        'جلسه‌های کوتاه و برگشتن‌های فاصله‌دار معمولاً از یک جلسه‌ی طولانی و مضطرب بهتر جواب می‌دهند.',
        'وقتی موضوعی مبهم است، یک بخش کوچک را با کلمات خودت توضیح بده. جایی که توضیح می‌شکند، مسیر بعدی را نشان می‌دهد.'
      ],
      communication: [
        'گفتگوی روشن معمولاً مشاهده را از برداشت جدا می‌کند و بعد نیاز یا درخواست پشت آن را نام می‌برد.',
        'قبل از جواب‌دادن ببین طرف مقابل دنبال فهمیده‌شدن است، تصمیم، کمک عملی یا کمی فضا.',
        'یک درخواست مشخص از یک گلایه‌ی کلی قابل‌پاسخ‌تر است و به گفتگو مسیر مهربانانه‌تری می‌دهد.',
        'ترمیم بخشی از ارتباط خوب است. یک جمله درباره‌ی اینکه شاید منظور طرف مقابل را درست نگرفته‌ای، گاهی از دفاع‌کردن مفیدتر است.'
      ],
      creativity: [
        'کار خلاقانه وقتی بهتر پیش می‌رود که تولید ایده را از قضاوت‌کردن جدا کنیم. اول چند گزینه‌ی ناقص بساز، بعد یکی را پرورش بده.',
        'محدودیت می‌تواند دستگیره باشد، نه قفس. محدودکردن زمان یا قالب گاهی به ایده شکل می‌دهد.',
        'وقتی صفحه‌ی خالی سنگین است، از ساختار چیزی که دوستش داری کمک بگیر و یک بخش مهمش را تغییر بده.',
        'یک آزمایش کوچک که تمام شود، بیشتر از ایده‌ی بزرگی که امتحان نشده چیزی یاد می‌دهد.'
      ],
      mindfulness: [
        'ذهن‌آگاهی با یک نفس کامل شروع می‌شود. نه یک جلسه طولانی، فقط یک دم و بازدم که واقعاً در آن حضور داشته باشی.',
        'تمرین پنج حس می‌تواند به آرامش کمک کند: یک چیزی که می‌بینی، یکی که می‌شنوی، یکی که حس می‌کنی، یکی که بو می‌کنی و یکی که می‌چشی. این راهی است برای برگشتن به لحظه‌ی حال بدون نیاز به حل کردن چیزی.',
        'فکرکردن هنگام مدیتیشن شکست نیست. ذهن این کار را می‌کند. تمرین این نیست که فکر نکنی، بلکه این است که متوجه شوی پرت شده‌ای و بدون قضاوت برگردی.',
        'یک مکث کوتاه قبل از واکنش می‌تواند فضای کافی برای انتخاب پاسخ ایجاد کند، به‌جای اینکه توسط اولین هیجان هدایت شوی. این فضا همان جایی است که ذهن‌آگاهی با زندگی روزمره پیوند می‌خورد.'
      ],
      stress: [
        'استرس نشانه‌ی شکست تو نیست. نشانه‌ی این است که سیستم عصبی‌ات دارد همان کاری را می‌کند که برای آن تکامل یافته. قدم مفید این است که زودتر متوجه آن شوی، نه اینکه آنقدر ادامه دهی تا تیزتر شود.',
        'یک مکث شصت ثانیه‌ای که در آن از کار فاصله بگیری و نفس بکشی، می‌تواند تمرکزت را بهتر از یک ساعت ادامه‌دادن با بازدهی کم برگرداند.',
        'تعیین مرز، طردکردن نیست. بیانیه‌ای است درباره‌ی چیزی که برای حفظ توانت نیاز داری. آدم‌هایی که برایت مهم‌اند خود را تنظیم می‌کنند؛ آنهایی که اهمیت نمی‌دهند، به هر حال روی پایداری تو حساب نمی‌کردند.',
        'فرسودگی شغلی معمولاً از سخت‌کارکردن نمی‌آید، از کارکردن بدون بازیابی انرژی می‌آید. یک توقف عمدی تجمل نیست، نگهداری از تنها سیستمی است که برای انجام هر کاری داری.'
      ],
      self_compassion: [
        'خودشفقتی سه بخش دارد: با خودت همان مهربانی را داشته باشی که با یک دوست داری، یادت باشد که رنج بخشی از تجربه‌ی مشترک انسانی است، و دردت را با آگاهی ذهن‌آگاهانه نگه داری بدون اینکه با آن یکی شوی.',
        'منتقد درونی اغلب می‌خواهد از تو در برابر شکست یا طردشدن محافظت کند. تشکر از تلاشش بدون اینکه بگذاری رانندگی کند، می‌تواند بدون جنگ دامنگیرش را شل کند.',
        'تو یک مشکل برای حل‌شدن نیستی. تو یک انسانی وسط زندگی هستی، و بعضی بخش‌های زندگی سخت‌اند. این به معنی این نیست که تو شکسته‌ای.',
        'مقایسه‌ی درون خودت با بیرون دیگران میان‌بری است به رنج. تو نتیجه‌ی تنظیم‌شده‌ی آنها را می‌بینی، نه روند همیشگی‌شان را.'
      ],
      conflict: [
        'در یک گفتگوی پرتنش، نام‌بردن از نیاز مشترک پشت هر دو موضع می‌تواند مسیر را عوض کند. نیاز اغلب ساده است: شنیده‌شدن، احترام، یا پیدا کردن راهی مشترک به جلو.',
        'ارتباط بدون خشونت یک مسیر روشن پیشنهاد می‌کند: مشاهده بدون قضاوت، نام‌بردن از احساس، شناسایی نیاز، و یک درخواست مشخص. هر قدم را می‌توان در یک جمله انجام داد.',
        'گوش‌دادن به احساس و نیاز طرف مقابل، حتی وقتی با نتیجه‌گیری‌اش موافق نیستی، می‌تواند فضا را آرام‌تر کند بدون اینکه مجبور باشی چیزی را بپذیری.',
        'ترمیم بعد از تعارض درباره‌ی حق‌به‌جانب نیست. درباره‌ی برگشتن ارتباط است. یک تلاش صادقانه برای فهمیدن دیدگاه دیگران اغلب مؤثرتر از یک دفاع کاملاً استدلالی از دیدگاه خودت است.'
      ],
      decision_making: [
        'یک سؤال مفید در تصمیم‌گیری این است: اگر این مسیر را انتخاب کنم، در یک سال چه چیزی یاد گرفته‌ام یا چه کسی شده‌ام؟ این قاب را از اجتناب از انتخاب اشتباه به رشد به سمت چیزی تغییر می‌دهد.',
        'آزمون ده-ده-ده می‌تواند دید بدهد: این تصمیم در ده دقیقه، ده ماه و ده سال آینده چه حسی دارد؟ ناراحتی کوتاه‌مدت اغلب کم‌رنگ می‌شود، در حالی که هماهنگی بلندمدت مهم‌تر است.',
        'وقتی تصمیم غیرممکن به نظر می‌رسد، ممکن است به دنبال یقینی باشی که وجود ندارد. یک انتخاب به‌اندازه‌ی کافی خوب که امروز گرفته شود می‌تواند فردا تنظیم شود. حرکت اطلاعات می‌سازد.',
        'تصمیم‌گیری بر اساس ارزش‌ها می‌پرسد: کدام گزینه با نوع انسانی که می‌خواهی باشی هماهنگ‌تر است؟ نه کدام امن‌تر است، بلکه کدام به آنچه داری می‌شوی صادق‌تر است.'
      ],
      grief: [
        'سوگ یک روند خطی با مرحله‌های مرتب نیست. بیشتر شبیه یک منظره است که در آن حرکت می‌کنی، بعضی روزها سنگین‌ترند و بعضی سبک‌تر، و هر دو بخشی از این زمین هستند.',
        'گرامیداشت کسی که از دست داده‌ای می‌تواند شکل‌های مختلفی داشته باشد: گفتن داستانی درباره‌اش، انجام کاری که دوست داشت، یا فقط نشستن با این واقعیت که او مهم بود. هیچ راه اشتباهی برای یادآوری وجود ندارد.',
        'وزن سوگ با گذشت زمان کم‌تر نمی‌شود، اما ظرفیت تو برای حمل آن می‌تواند رشد کند. آنچه امروز غیرقابل‌تحمل به نظر می‌رسد ممکن است بعداً چیزی شود که بتوانی در کنار شادی نگهش داری.',
        'اشکالی ندارد که گاهی حال خوبی داشته باشی. سوگ به غم همیشگی نیاز ندارد. لحظه‌های سبکی‌اش خیانت نیستند. نشانه‌ی این‌اند که هنوز زنده‌ای و هنوز به زندگی متصل هستی.'
      ],
      resilience: [
        'تاب‌آوری به این معنا نیست که هیچ‌وقت سنگینی دشواری را حس نکنی، بلکه به این معناست که راهی داشته باشی برای زمین گذاشتن آن وقتی نیاز داری، و برداشتن دوباره‌اش فقط وقتی قدرت کافی داشته باشی.',
        'بازیابی انرژی مسیر فرعی تاب‌آوری نیست؛ همان مکانیسمی است که تاب‌آوری را ممکن می‌کند. استراحت بین تلاش‌ها ضعف نیست، کار خاموش ترمیم است.',
        'تاب‌آوری یک ویژگی ثابت نیست که یا داشته باشی یا نداشته باشی. چیزی است که در لحظه‌های کوچک و معمولی تمرینش می‌کنی: انتخاب استراحت، درخواست کمک، یا فقط یک روز دیگر ادامه دادن.',
        'زندگی تاب‌آور زندگی بدون دشواری نیست، بلکه زندگی‌ای است که در آن دشواری توانایی تو برای شادی، ارتباط و امید را پاک نمی‌کند. می‌توانی سختی و خوبی را همزمان نگه داری.'
      ],
      forgiveness: [
        'بخشش به معنی تأیید آنچه رخ داده یا آشتی با کسی که به تو آسیب زده نیست. بخشش رها کردن چنگالی است که کینه بر زندگی درونی تو دارد، تا بتوانی بدون حمل تمام وزن گذشته به جلو حرکت کنی.',
        'بخشش فرایندی است که در زمان خودش آشکار می‌شود، نه کلیدی که بتوانی یکباره بچرخانی. اغلب با تمایل به این شروع می‌شود که بپذیری سزاوار آزادی از تکرار بی‌پایان درد هستی.',
        'بخشیدن یک نفر به معنی اعتماد دوباره به او نیست. اعتماد باید با عمل و در طول زمان بازسازی شود. بخشش درباره‌ی چیزی است که در درون خودت رها می‌کنی، نه درباره‌ی چیزی که به طرف مقابل بدهکاری.',
        'گاهی کسی که بیشتر از همه نیاز به بخشش تو دارد، خودت هستی. بخشش خود بهانه‌جویی نیست؛ پذیرشی است که تو بیشتر از بدترین لحظه‌ات هستی و رشد هنوز ممکن است.'
      ],
      purpose: [
        'معنا چیزی نیست که کامل و آماده پیدا کنی، مثل یک شیء پنهان. چیزی است که در طول زمان می‌سازی، از طریق توجه به آنچه برایت مهم است، ارزش‌هایی که انتخاب می‌کنی بر اساسشان زندگی کنی، و نحوه‌ای که برای آدم‌ها و فعالیت‌هایی که تو را می‌خوانند حضور پیدا می‌کنی.',
        'حس هدف اغلب نه در تصمیم‌های بزرگ زندگی، بلکه در استمرار آرام کارهای کوچک آشکار می‌شود: بودن در کنار یک دوست، انجام کاری که مفید به نظر می‌رسد، یا مراقبت از چیزی فراتر از خودت.',
        'ویکتور فرانکل مشاهده کرد که معنا را می‌توان در هر لحظه یافت، حتی در رنج، وقتی نگرش خود را نسبت به آنچه نمی‌توانیم تغییر دهیم انتخاب کنیم. هدف درباره‌ی زندگی آسان نیست، درباره‌ی زندگی‌ای است که حس می‌کند مهم است.',
        'هدف لازم نیست یک چیز ثابت باشد که برای آن ساخته شده‌ای. می‌تواند در فصل‌های مختلف زندگی تغییر کند. آنچه اهمیت دارد یک مقصد ثابت نیست، بلکه جهتی است که در آن رو به جلو حرکت می‌کنی و دلایلی که به قدم‌هایت وزن می‌بخشد.'
      ],
      relationship: [
        'رابطه‌ی قوی رابطه‌ای نیست که در آن هیچ تعارضی نباشد، بلکه رابطه‌ای است که دو نفر بتوانند بعد از تعارض به هم برگردند. ترمیم از هرگز اختلاف نداشتن مهم‌تر است.',
        'گوش‌دادن برای فهمیدن، نه برای جواب‌دادن، یکی از کم‌توجه‌ترین مهارت‌ها در هر رابطه‌ای است. وقتی کسی حس کند شنیده می‌شود، خود گفتگو تغییر می‌کند.',
        'روابط به تعادلی بین نزدیکی و استقلال نیاز دارند. نزدیک بودن به معنی گم‌کردن خودت نیست و داشتن فضای شخصی به معنی فاصله نیست.',
        'سلامت یک رابطه اغلب در لحظه‌های کوچک خودش را نشان می‌دهد: مکثی قبل از واکنش، یک سؤال واقعی از روز طرف مقابل، یا تمایل به گفتن اشتباه کردم.'
      ],
      career: [
        'تصمیم‌های شغلی به ندرت درباره‌ی پیدا کردن یک مسیر کامل و بی‌نقص هستند. بیشتر درباره‌ی انتخاب جهتی هماهنگ با ارزش‌هایت، یادگرفتن از هر قدم، و تنظیم مسیر در حین رشد است.',
        'رضایت شغلی اغلب کمتر از عنوان یا حقوق می‌آید و بیشتر از این حس که تلاشت مفید است، در حال یادگیری هستی، و با احترام رفتار می‌شوی.',
        'تغییر شغل لزوماً یک جهش بزرگ نیست. آزمایش‌های کوچک در کنار کار اصلی - یک پروژه، یک دوره، گفتگو با کسی در حوزه‌ای دیگر - می‌تواند مسیر درست را نشان بدهد بدون نیاز به تغییر کامل.',
        'فرسودگی شغلی به ندرت به خود کار مربوط است. بیشتر به ناهماهنگی بین ارزش‌هایت و خواسته‌هایی که از تو می‌شود مربوط است، یا بین تلاشی که می‌کنی و معنایی که پس می‌گیری.'
      ],
      anxiety: [
        'اضطراب نشانه‌ی این نیست که چیزی در تو اشکال دارد. این روش ذهن تو برای محافظت از تو در برابر آینده‌ای است که نمی‌تواند کنترلش کند. هدف از بین بردن آن نیست، بلکه تغییر رابطه با آن است.',
        'وقتی اضطراب مارپیچی می‌شود، برگشتن به لحظه‌ی حال از طریق حواس می‌تواند چرخه را قطع کند: پنج چیزی که می‌بینی نام ببر، چهار چیزی که می‌توانی لمس کنی، سه چیزی که می‌شنوی، دو چیزی که بو می‌کنی و یک چیزی که می‌چشی.',
        'نگرانی اغلب خود را به جای آمادگی می‌گذارد. ممکن است حس تفکر رو به جلو را بدهد، اما مرور بی‌پایان سناریوها بدون اقدام برنامه‌ریزی نیست؛ نشخوار فکری است. یک قدم کوچک عملی چرخه را می‌شکند.',
        'اضطراب وقتی کوچک‌تر می‌شود که از جنگیدن با آن دست برداری و شروع به گوش‌دادن به آن کنی. زیر نگرانی اغلب یک نیاز نهفته است: نیاز به امنیت، آمادگی یا کنترل. شناسایی آن نیاز به سمت یک راه حل واقعی اشاره می‌کند.'
      ]
    }
  };
  global.DaryaKnowledgeShelf = SHELF;
})(typeof window !== 'undefined' ? window : globalThis);
