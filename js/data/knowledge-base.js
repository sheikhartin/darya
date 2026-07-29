/**
 * Darya offline knowledge shelf.
 *
 * This is intentionally curated, not encyclopedic. It gives the engine
 * useful, honest starting points for common thinking questions without
 * pretending to know current facts or reaching the web at runtime.
 *
 * Domains cover seven areas of practical wisdom: philosophy, thinkers,
 * focus, learning, communication, creativity, mindfulness, stress
 * management, self-compassion, conflict resolution, decision-making
 * frameworks, and grief coping. Each domain has 4 English and 4 Persian
 * entries, written in Darya's consistent voice: warm, grounded, and
 * never prescriptive.
 */
(function (global) {
  'use strict';
  const SHELF = {
    en: {
      // ------------------------------------------------------------------
      // Philosophy
      // ------------------------------------------------------------------
      philosophy: [
        'One useful philosophical move is to ask what you mean by the word at the center of the problem. A clearer question often changes the shape of the answer.',
        'A Stoic starting point is to separate what belongs to your actions from what belongs to the world outside your control. That distinction can make one next step easier to see.',
        'Aristotle often treated balance as a practiced skill rather than a perfect midpoint. The useful question is what a balanced response would look like here, today.',
        'A philosophical answer is rarely a command. It is usually a better question, a clearer distinction, or a view you can test against your own life.',
      ],

      // ------------------------------------------------------------------
      // Thinkers / historical figures
      // ------------------------------------------------------------------
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
        'Zarathustra is associated with a strong emphasis on truth, ethical choice, and the ongoing work of becoming. It is an invitation to examine what values guide a decision.',
      ],

      // ------------------------------------------------------------------
      // Focus and concentration
      // ------------------------------------------------------------------
      focus: [
        'Focus usually improves when the next action is small, visible, and specific. Open the document is easier to begin than fix everything.',
        'Name the one task that would make the next hour feel less scattered, then give it a short protected window.',
        'Attention is easier to protect when distractions have a place to go. Keep a small note for them instead of negotiating with each one.',
        'If the task feels vague, define its finish line before trying to increase your motivation.',
      ],

      // ------------------------------------------------------------------
      // Learning and study
      // ------------------------------------------------------------------
      learning: [
        'Learning becomes stronger when you retrieve an idea from memory instead of only rereading it. A short self-test can reveal what stayed.',
        'A good study loop is attempt, notice the gap, check the source, then try again later. The gap is information, not a verdict.',
        'Short sessions with spaced returns often beat one long anxious session. Consistency gives memory more than intensity alone.',
        'When a subject feels opaque, explain one small part in your own words. The places where the explanation breaks show you where to look next.',
      ],

      // ------------------------------------------------------------------
      // Communication (originally from Rosenberg NVC)
      // ------------------------------------------------------------------
      communication: [
        'A clear conversation often separates observation from interpretation, then names the need or request underneath it.',
        'Before replying, identify whether the other person wants understanding, a decision, practical help, or a little space.',
        'A specific request is easier to answer than a broad complaint. It gives the conversation somewhere kind and concrete to go.',
        'Repair is part of good communication. A simple statement that you may have missed the point can be more useful than defending the first interpretation.',
      ],

      // ------------------------------------------------------------------
      // Creativity
      // ------------------------------------------------------------------
      creativity: [
        'Creative work benefits from separating generation from judgment. Make a few imperfect options first, then decide what deserves refinement.',
        'A constraint can be a handle rather than a cage. Limiting time, materials, or format can give an idea enough shape to appear.',
        'When the blank page feels loud, borrow a structure from something you admire and change one important part of it.',
        'A small finished experiment teaches more than a large idea that never gets tried.',
      ],

      // ------------------------------------------------------------------
      // Mindfulness and meditation
      // ------------------------------------------------------------------
      mindfulness: [
        'Mindfulness begins with a single breath noticed fully. Not a long session, just one inhalation and exhalation where you are actually present for it.',
        'The five-senses exercise can gently anchor you: name one thing you see, one you hear, one you feel, one you smell, and one you taste. It is a way of returning to the present moment without needing to solve anything.',
        'Thoughts during meditation are not failures. They are what minds do. The practice is not having no thoughts but noticing when you have wandered and returning without judgment.',
        'A short pause before reacting can create enough space to choose a response instead of being pulled by the first impulse. That space is where mindfulness meets daily life.',
      ],

      // ------------------------------------------------------------------
      // Stress management and burnout prevention
      // ------------------------------------------------------------------
      stress: [
        'Stress is not a sign that you are failing. It is a sign that your nervous system is working the way it evolved to work. The useful step is to notice it early rather than push through until it sharpens.',
        'A micro-break of sixty seconds where you look away from the task and breathe can reset your focus more effectively than pushing through another hour of diminishing returns.',
        'Setting a boundary is not rejection. It is a statement about what you need to sustain your capacity. The people who matter will adjust; the ones who do not were not counting on your sustainability anyway.',
        'Burnout often comes not from working hard but from working without recovery. A deliberate pause is not a luxury. It is maintenance for the only system you have to do any of this.',
      ],

      // ------------------------------------------------------------------
      // Self-compassion (based on Dr. Kristin Neff framework)
      // ------------------------------------------------------------------
      self_compassion: [
        'Self-compassion has three parts: treating yourself with the same kindness you would offer a friend, remembering that struggle is part of shared human experience, and holding your pain with mindful awareness rather than over-identifying with it.',
        'The inner critic is often trying to protect you from failure or rejection. Thanking it for its effort without letting it drive can loosen its grip without a fight.',
        'You are not a problem to be fixed. You are a person in the middle of a life, and some parts of that life are hard. That does not mean you are broken.',
        'Comparing your inside with other people outside is a shortcut to suffering. You see their curated results, not their ongoing process.',
      ],

      // ------------------------------------------------------------------
      // Conflict resolution (Non-Violent Communication / NVC)
      // ------------------------------------------------------------------
      conflict: [
        'In a tense conversation, naming the shared need underneath both positions can change the direction. The need is often something simple: to be heard, to be respected, or to find a way forward together.',
        'Nonviolent Communication offers a clear sequence: observe without evaluating, name the feeling, identify the need, and make a specific request. Each step can be done in a single sentence.',
        'Listening for what the other person is feeling and needing, even when you disagree with their conclusion, can lower the temperature without requiring you to concede anything.',
        'Repair after a conflict is not about who was right. It is about restoring connection. A sincere attempt to understand the other perspective is often more effective than a perfectly argued defense of your own.',
      ],

      // ------------------------------------------------------------------
      // Decision-making frameworks
      // ------------------------------------------------------------------
      decision_making: [
        'A useful decision-making question is: if I chose this path, what would I want to have learned or become in a year? That shifts the frame from avoiding a wrong choice to growing toward something.',
        'The ten-ten-ten test can create perspective: how will this decision feel in ten minutes, ten months, and ten years? The short-term discomfort often fades while long-term alignment matters more.',
        'When a decision feels impossible, you may be looking for certainty that does not exist. A good enough choice made today can be adjusted tomorrow. Motion creates information.',
        'Values-based decision-making asks: which option is more aligned with the kind of person I want to be? Not which option is safer, but which is more truthful to who you are becoming.',
      ],

      // ------------------------------------------------------------------
      // Grief and loss coping
      // ------------------------------------------------------------------
      grief: [
        'Grief is not a linear process with neat stages. It is more like a landscape you move through, where some days are heavier and some are lighter, and both are part of the terrain.',
        'Honoring someone you lost can take many forms: telling a story about them, doing something they loved, or simply sitting with the fact that they mattered. There is no wrong way to remember.',
        'The weight of grief does not shrink over time, but your capacity to carry it can grow. What feels unbearable today may become something you can hold alongside joy later.',
        'It is okay to feel okay sometimes. Grief does not require constant sadness. Moments of lightness or laughter are not betrayals. They are signs that you are still alive and still connected to life.',
      ],
    },
    fa: {
      // ------------------------------------------------------------------
      // Philosophy / فلسفه
      // ------------------------------------------------------------------
      philosophy: [
        'یک حرکت فلسفی مفید این است که ببینیم واژه‌ی اصلی مسئله برایمان دقیقاً چه معنایی دارد. سؤال روشن‌تر گاهی شکل جواب را عوض می‌کند.',
        'یک شروع رواقی می‌تواند جداکردن چیزهایی باشد که به عمل ما مربوط‌اند از چیزهایی که بیرون از کنترل ما هستند. این فرق گاهی قدم بعدی را روشن‌تر می‌کند.',
        'ارسطو تعادل را بیشتر مهارتی تمرینی می‌دید تا نقطه‌ای بی‌نقص. سؤال مفید این است که امروز، در همین موقعیت، واکنش متعادل چه شکلی دارد.',
        'جواب فلسفی معمولاً دستور نیست؛ یک سؤال بهتر، یک تمایز روشن‌تر یا نگاهی است که می‌توانی با زندگی خودت بسنجی.',
      ],

      // ------------------------------------------------------------------
      // Thinkers / اندیشمندان
      // ------------------------------------------------------------------
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
        'زرتشت در سنت‌های فلسفی و دینی با حقیقت، انتخاب اخلاقی و کار مداوم برای شدن پیوند دارد؛ دعوتی برای دیدن ارزش‌هایی که راه تصمیم را می‌سازند.',
      ],

      // ------------------------------------------------------------------
      // Focus / تمرکز
      // ------------------------------------------------------------------
      focus: [
        'تمرکز وقتی آسان‌تر می‌شود که قدم بعدی کوچک، روشن و مشخص باشد. بازکردن فایل از درست‌کردن همه‌چیز شروع‌کردنی‌تر است.',
        'ببین کدام کار، اگر در ساعت بعد جلو برود، ذهنت را کمتر پراکنده می‌کند و برایش یک زمان کوتاه کنار بگذار.',
        'برای حواس‌پرتی‌ها یک جای کوچک در نظر بگیر و آن‌ها را یادداشت کن، به‌جای اینکه هر بار با آن‌ها مذاکره کنی.',
        'اگر کار مبهم است، اول پایانش را تعریف کن؛ بعد سراغ انگیزه برو.',
      ],

      // ------------------------------------------------------------------
      // Learning / یادگیری
      // ------------------------------------------------------------------
      learning: [
        'یادگیری وقتی محکم‌تر می‌شود که چیزی را از حافظه بیرون بکشی، نه فقط دوباره بخوانی. یک خودآزمایی کوتاه نشان می‌دهد چه چیزی مانده است.',
        'چرخه‌ی خوبی برای یادگیری این است: تلاش، دیدن شکاف، بررسی منبع و امتحان دوباره در زمانی دیگر. شکاف اطلاعات است، نه حکم درباره‌ی تو.',
        'جلسه‌های کوتاه و برگشتن‌های فاصله‌دار معمولاً از یک جلسه‌ی طولانی و مضطرب بهتر جواب می‌دهند.',
        'وقتی موضوعی مبهم است، یک بخش کوچک را با کلمات خودت توضیح بده. جایی که توضیح می‌شکند، مسیر بعدی را نشان می‌دهد.',
      ],

      // ------------------------------------------------------------------
      // Communication / ارتباط
      // ------------------------------------------------------------------
      communication: [
        'گفتگوی روشن معمولاً مشاهده را از برداشت جدا می‌کند و بعد نیاز یا درخواست پشت آن را نام می‌برد.',
        'قبل از جواب‌دادن ببین طرف مقابل دنبال فهمیده‌شدن است، تصمیم، کمک عملی یا کمی فضا.',
        'یک درخواست مشخص از یک گلایه‌ی کلی قابل‌پاسخ‌تر است و به گفتگو مسیر مهربانانه‌تری می‌دهد.',
        'ترمیم بخشی از ارتباط خوب است. یک جمله درباره‌ی اینکه شاید منظور طرف مقابل را درست نگرفته‌ای، گاهی از دفاع‌کردن مفیدتر است.',
      ],

      // ------------------------------------------------------------------
      // Creativity / خلاقیت
      // ------------------------------------------------------------------
      creativity: [
        'کار خلاقانه وقتی بهتر پیش می‌رود که تولید ایده را از قضاوت‌کردن جدا کنیم. اول چند گزینه‌ی ناقص بساز، بعد یکی را پرورش بده.',
        'محدودیت می‌تواند دستگیره باشد، نه قفس. محدودکردن زمان یا قالب گاهی به ایده شکل می‌دهد.',
        'وقتی صفحه‌ی خالی سنگین است، از ساختار چیزی که دوستش داری کمک بگیر و یک بخش مهمش را تغییر بده.',
        'یک آزمایش کوچک که تمام شود، بیشتر از ایده‌ی بزرگی که امتحان نشده چیزی یاد می‌دهد.',
      ],

      // ------------------------------------------------------------------
      // Mindfulness / ذهن‌آگاهی
      // ------------------------------------------------------------------
      mindfulness: [
        'ذهن‌آگاهی با یک نفس کامل شروع می‌شود. نه یک جلسه طولانی، فقط یک دم و بازدم که واقعاً در آن حضور داشته باشی.',
        'تمرین پنج حس می‌تواند به آرامش کمک کند: یک چیزی که می‌بینی، یکی که می‌شنوی، یکی که حس می‌کنی، یکی که بو می‌کنی و یکی که می‌چشی. این راهی است برای برگشتن به لحظه‌ی حال بدون نیاز به حل کردن چیزی.',
        'فکرکردن هنگام مدیتیشن شکست نیست. ذهن این کار را می‌کند. تمرین این نیست که فکر نکنی، بلکه این است که متوجه شوی پرت شده‌ای و بدون قضاوت برگردی.',
        'یک مکث کوتاه قبل از واکنش می‌تواند فضای کافی برای انتخاب پاسخ ایجاد کند، به‌جای اینکه توسط اولین هیجان هدایت شوی. این فضا همان جایی است که ذهن‌آگاهی با زندگی روزمره پیوند می‌خورد.',
      ],

      // ------------------------------------------------------------------
      // Stress management / مدیریت استرس
      // ------------------------------------------------------------------
      stress: [
        'استرس نشانه‌ی شکست تو نیست. نشانه‌ی این است که سیستم عصبی‌ات دارد همان کاری را می‌کند که برای آن تکامل یافته. قدم مفید این است که زودتر متوجه آن شوی، نه اینکه آنقدر ادامه دهی تا تیزتر شود.',
        'یک مکث شصت ثانیه‌ای که در آن از کار فاصله بگیری و نفس بکشی، می‌تواند تمرکزت را بهتر از یک ساعت ادامه‌دادن با بازدهی کم برگرداند.',
        'تعیین مرز، طردکردن نیست. بیانیه‌ای است درباره‌ی چیزی که برای حفظ توانت نیاز داری. آدم‌هایی که برایت مهم‌اند خود را تنظیم می‌کنند؛ آنهایی که اهمیت نمی‌دهند، به هر حال روی پایداری تو حساب نمی‌کردند.',
        'فرسودگی شغلی معمولاً از سخت‌کارکردن نمی‌آید، از کارکردن بدون بازیابی انرژی می‌آید. یک توقف عمدی تجمل نیست، نگهداری از تنها سیستمی است که برای انجام هر کاری داری.',
      ],

      // ------------------------------------------------------------------
      // Self-compassion / خودشفقتی
      // ------------------------------------------------------------------
      self_compassion: [
        'خودشفقتی سه بخش دارد: با خودت همان مهربانی را داشته باشی که با یک دوست داری، یادت باشد که رنج بخشی از تجربه‌ی مشترک انسانی است، و دردت را با آگاهی ذهن‌آگاهانه نگه داری بدون اینکه با آن یکی شوی.',
        'منتقد درونی اغلب می‌خواهد از تو در برابر شکست یا طردشدن محافظت کند. تشکر از تلاشش بدون اینکه بگذاری رانندگی کند، می‌تواند بدون جنگ grip او را شل کند.',
        'تو یک مشکل برای حل‌شدن نیستی. تو یک انسانی وسط زندگی هستی، و بعضی بخش‌های زندگی سخت‌اند. این به معنی این نیست که تو شکسته‌ای.',
        'مقایسه‌ی درون خودت با بیرون دیگران میان‌بری است به رنج. تو نتیجه‌ی تنظیم‌شده‌ی آنها را می‌بینی، نه روند همیشگی‌شان را.',
      ],

      // ------------------------------------------------------------------
      // Conflict resolution / حل تعارض
      // ------------------------------------------------------------------
      conflict: [
        'در یک گفتگوی پرتنش، نام‌بردن از نیاز مشترک پشت هر دو موضع می‌تواند مسیر را عوض کند. نیاز اغلب ساده است: شنیده‌شدن، احترام، یا پیدا کردن راهی مشترک به جلو.',
        'ارتباط بدون خشونت یک مسیر روشن پیشنهاد می‌کند: مشاهده بدون قضاوت، نام‌بردن از احساس، شناسایی نیاز، و یک درخواست مشخص. هر قدم را می‌توان در یک جمله انجام داد.',
        'گوش‌دادن به احساس و نیاز طرف مقابل، حتی وقتی با نتیجه‌گیری‌اش موافق نیستی، می‌تواند فضا را آرام‌تر کند بدون اینکه مجبور باشی چیزی را بپذیری.',
        'ترمیم بعد از تعارض درباره‌ی حق‌به‌جانب نیست. درباره‌ی برگشتن ارتباط است. یک تلاش صادقانه برای فهمیدن دیدگاه دیگران اغلب مؤثرتر از یک دفاع کاملاً استدلالی از دیدگاه خودت است.',
      ],

      // ------------------------------------------------------------------
      // Decision-making / تصمیم‌گیری
      // ------------------------------------------------------------------
      decision_making: [
        'یک سؤال مفید در تصمیم‌گیری این است: اگر این مسیر را انتخاب کنم، در یک سال چه چیزی یاد گرفته‌ام یا چه کسی شده‌ام؟ این قاب را از اجتناب از انتخاب اشتباه به رشد به سمت چیزی تغییر می‌دهد.',
        'آزمون ده-ده-ده می‌تواند دید بدهد: این تصمیم در ده دقیقه، ده ماه و ده سال آینده چه حسی دارد؟ ناراحتی کوتاه‌مدت اغلب کم‌رنگ می‌شود، در حالی که هماهنگی بلندمدت مهم‌تر است.',
        'وقتی تصمیم غیرممکن به نظر می‌رسد، ممکن است به دنبال یقینی باشی که وجود ندارد. یک انتخاب به‌اندازه‌ی کافی خوب که امروز گرفته شود می‌تواند فردا تنظیم شود. حرکت اطلاعات می‌سازد.',
        'تصمیم‌گیری بر اساس ارزش‌ها می‌پرسد: کدام گزینه با نوع انسانی که می‌خواهی باشی هماهنگ‌تر است؟ نه کدام امن‌تر است، بلکه کدام به آنچه داری می‌شوی صادق‌تر است.',
      ],

      // ------------------------------------------------------------------
      // Grief and loss / سوگ و فقدان
      // ------------------------------------------------------------------
      grief: [
        'سوگ یک روند خطی با مرحله‌های مرتب نیست. بیشتر شبیه یک منظره است که در آن حرکت می‌کنی، بعضی روزها سنگین‌ترند و بعضی سبک‌تر، و هر دو بخشی از این زمین هستند.',
        'گرامیداشت کسی که از دست داده‌ای می‌تواند شکل‌های مختلفی داشته باشد: گفتن داستانی درباره‌اش، انجام کاری که دوست داشت، یا فقط نشستن با این واقعیت که او مهم بود. هیچ راه اشتباهی برای یادآوری وجود ندارد.',
        'وزن سوگ با گذشت زمان کم‌تر نمی‌شود، اما ظرفیت تو برای حمل آن می‌تواند رشد کند. آنچه امروز غیرقابل‌تحمل به نظر می‌رسد ممکن است بعداً چیزی شود که بتوانی در کنار شادی نگهش داری.',
        'اشکالی ندارد که گاهی حال خوبی داشته باشی. سوگ به غم همیشگی نیاز ندارد. لحظه‌های سبکی یا خیانت نیستند. نشانه‌ی این‌اند که هنوز زنده‌ای و هنوز به زندگی متصل هستی.',
      ],
    },
  };
  function answer(language, domain) { return (SHELF[language]?.[domain] || []).slice(); }
  global.DaryaKnowledge = { domains: Object.keys(SHELF.en), answer };
})(typeof window !== 'window' ? window : globalThis);
