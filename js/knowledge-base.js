/**
 * Small offline knowledge shelf for Darya.
 *
 * This is intentionally curated, not encyclopedic. It gives the engine
 * useful, honest starting points for common thinking questions without
 * pretending to know current facts or reaching the web at runtime.
 */
(function (global) {
  'use strict';
  const SHELF = {
    en: {
      philosophy: [
        'One useful philosophical move is to ask what you mean by the word at the center of the problem. A clearer question often changes the shape of the answer.',
        'A Stoic starting point is to separate what belongs to your actions from what belongs to the world outside your control. That distinction can make one next step easier to see.',
        'Aristotle often treated balance as a practiced skill rather than a perfect midpoint. The useful question is what a balanced response would look like here, today.',
        'A philosophical answer is rarely a command. It is usually a better question, a clearer distinction, or a view you can test against your own life.',
      ],
      thinkers: [
        'Socrates is useful here as a model of careful inquiry: begin with the other person’s meaning and ask one question that reveals what is still unclear.',
        'Aristotle offers a practical idea of balance: a good response is not the strongest response, but the one that fits the situation.',
        'Epictetus reminds us to separate events from our judgments about events. That distinction can create room without dismissing the feeling.',
        'Marcus Aurelius models a brief return to the present task, especially when the mind is pulled in several directions.',
        'Carl Jung’s idea of individuation suggests that self-knowledge grows when a person can notice different parts of themselves without reducing everything to one label.',
        'Nietzsche is a useful prompt toward self-authorship: question inherited expectations, but do not mistake rebellion for a complete answer.',
        'Gandhi’s nonviolence can be read as disciplined action without dehumanizing the other person. In conversation, that means clarity without escalation.',
        'Nelson Mandela offers a reminder that dignity and reconciliation do not require forgetting what happened.',
        'Churchill shows the power of precise, honest language under pressure. Short sentences can carry courage without pretending the situation is easy.',
        'Zarathustra is associated with a strong emphasis on truth, ethical choice, and the ongoing work of becoming. It is an invitation to examine what values guide a decision.',
      ],
      focus: [
        'Focus usually improves when the next action is small, visible, and specific. Open the document is easier to begin than fix everything.',
        'Name the one task that would make the next hour feel less scattered, then give it a short protected window.',
        'Attention is easier to protect when distractions have a place to go. Keep a small note for them instead of negotiating with each one.',
        'If the task feels vague, define its finish line before trying to increase your motivation.',
      ],
      learning: [
        'Learning becomes stronger when you retrieve an idea from memory instead of only rereading it. A short self-test can reveal what stayed.',
        'A good study loop is attempt, notice the gap, check the source, then try again later. The gap is information, not a verdict.',
        'Short sessions with spaced returns often beat one long anxious session. Consistency gives memory more than intensity alone.',
        'When a subject feels opaque, explain one small part in your own words. The places where the explanation breaks show you where to look next.',
      ],
      communication: [
        'A clear conversation often separates observation from interpretation, then names the need or request underneath it.',
        'Before replying, identify whether the other person wants understanding, a decision, practical help, or a little space.',
        'A specific request is easier to answer than a broad complaint. It gives the conversation somewhere kind and concrete to go.',
        'Repair is part of good communication. A simple statement that you may have missed the point can be more useful than defending the first interpretation.',
      ],
      creativity: [
        'Creative work benefits from separating generation from judgment. Make a few imperfect options first, then decide what deserves refinement.',
        'A constraint can be a handle rather than a cage. Limiting time, materials, or format can give an idea enough shape to appear.',
        'When the blank page feels loud, borrow a structure from something you admire and change one important part of it.',
        'A small finished experiment teaches more than a large idea that never gets tried.',
      ],
    },
    fa: {
      philosophy: [
        'یک حرکت فلسفی مفید این است که ببینیم واژه‌ی اصلی مسئله برایمان دقیقاً چه معنایی دارد. سؤال روشن‌تر گاهی شکل جواب را عوض می‌کند.',
        'یک شروع رواقی می‌تواند جداکردن چیزهایی باشد که به عمل ما مربوط‌اند از چیزهایی که بیرون از کنترل ما هستند. این فرق گاهی قدم بعدی را روشن‌تر می‌کند.',
        'ارسطو تعادل را بیشتر مهارتی تمرینی می‌دید تا نقطه‌ای بی‌نقص. سؤال مفید این است که امروز، در همین موقعیت، واکنش متعادل چه شکلی دارد.',
        'جواب فلسفی معمولاً دستور نیست؛ یک سؤال بهتر، یک تمایز روشن‌تر یا نگاهی است که می‌توانی با زندگی خودت بسنجی.',
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
        'زرتشت در سنت‌های فلسفی و دینی با حقیقت، انتخاب اخلاقی و کار مداوم برای شدن پیوند دارد؛ دعوتی برای دیدن ارزش‌هایی که راه تصمیم را می‌سازند.',
      ],
      focus: [
        'تمرکز وقتی آسان‌تر می‌شود که قدم بعدی کوچک، روشن و مشخص باشد. بازکردن فایل از درست‌کردن همه‌چیز شروع‌کردنی‌تر است.',
        'ببین کدام کار، اگر در ساعت بعد جلو برود، ذهنت را کمتر پراکنده می‌کند و برایش یک زمان کوتاه کنار بگذار.',
        'برای حواس‌پرتی‌ها یک جای کوچک در نظر بگیر و آن‌ها را یادداشت کن، به‌جای اینکه هر بار با آن‌ها مذاکره کنی.',
        'اگر کار مبهم است، اول پایانش را تعریف کن؛ بعد سراغ انگیزه برو.',
      ],
      learning: [
        'یادگیری وقتی محکم‌تر می‌شود که چیزی را از حافظه بیرون بکشی، نه فقط دوباره بخوانی. یک خودآزمایی کوتاه نشان می‌دهد چه چیزی مانده است.',
        'چرخه‌ی خوبی برای یادگیری این است: تلاش، دیدن شکاف، بررسی منبع و امتحان دوباره در زمانی دیگر. شکاف اطلاعات است، نه حکم درباره‌ی تو.',
        'جلسه‌های کوتاه و برگشتن‌های فاصله‌دار معمولاً از یک جلسه‌ی طولانی و مضطرب بهتر جواب می‌دهند.',
        'وقتی موضوعی مبهم است، یک بخش کوچک را با کلمات خودت توضیح بده. جایی که توضیح می‌شکند، مسیر بعدی را نشان می‌دهد.',
      ],
      communication: [
        'گفتگوی روشن معمولاً مشاهده را از برداشت جدا می‌کند و بعد نیاز یا درخواست پشت آن را نام می‌برد.',
        'قبل از جواب‌دادن ببین طرف مقابل دنبال فهمیده‌شدن است، تصمیم، کمک عملی یا کمی فضا.',
        'یک درخواست مشخص از یک گلایه‌ی کلی قابل‌پاسخ‌تر است و به گفتگو مسیر مهربانانه‌تری می‌دهد.',
        'ترمیم بخشی از ارتباط خوب است. یک جمله درباره‌ی اینکه شاید منظور طرف مقابل را درست نگرفته‌ای، گاهی از دفاع‌کردن مفیدتر است.',
      ],
      creativity: [
        'کار خلاقانه وقتی بهتر پیش می‌رود که تولید ایده را از قضاوت‌کردن جدا کنیم. اول چند گزینه‌ی ناقص بساز، بعد یکی را پرورش بده.',
        'محدودیت می‌تواند دستگیره باشد، نه قفس. محدودکردن زمان یا قالب گاهی به ایده شکل می‌دهد.',
        'وقتی صفحه‌ی خالی سنگین است، از ساختار چیزی که دوستش داری کمک بگیر و یک بخش مهمش را تغییر بده.',
        'یک آزمایش کوچک که تمام شود، بیشتر از ایده‌ی بزرگی که امتحان نشده چیزی یاد می‌دهد.',
      ],
    },
  };
  function answer(language, domain) { return (SHELF[language]?.[domain] || []).slice(); }
  global.DaryaKnowledge = { domains: Object.keys(SHELF.en), answer };
})(typeof window !== 'undefined' ? window : globalThis);
