/**
 * Darya - worldviews, mindsets, and political/philosophical ideologies.
 *
 * Every entry is neutral, introductory, and explicitly non-endorsing: the
 * goal is to help a person understand a frame of mind, never to push one.
 * Entries about violent extremism and authoritarian movements name the
 * harm plainly and never assist or glorify them.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];

  const fact = (id, keywords, weak, fa, en, hints = []) => ({
    id,
    keywords,
    weak,
    weakSafe: true,
    hints,
    fa,
    en
  });

  global.DaryaFactChunks.push([
    fact(
      'stoicism',
      [
        'what is stoicism',
        'stoicism explained',
        'رواقی گری چیست',
        'فلسفه رواقی'
      ],
      ['stoicism', 'stoic', 'رواقی', 'رواقی گری'],
      'رواقی‌گری فقط «تحمل درد در سکوت» نیست؛ یعنی میان آنچه در کنترل ماست (قضاوت، انتخاب، واکنش) و آنچه نیست (نظر دیگران، نتیجه، گذشته) تمایز بگذاریم و انرژی را صرف اولی کنیم. فضیلت‌هایی مثل خرد، شجاعت، عدالت و خویشتن‌داری در مرکز آن‌اند. تمرین‌هایی مثل یادآوری گذرا بودن چیزها و نوشتنِ روزانه کمک می‌کنند به‌جای انکار هیجان، با آن بهتر کنار بیاییم.',
      'Stoicism is not just enduring pain in silence. It teaches a distinction between what is up to us (judgment, choice, response) and what is not (others opinions, outcomes, the past), and directs effort toward the first. Virtues such as wisdom, courage, justice, and self-control are central. Practices like remembering that things are temporary and daily written reflection help you relate to emotion better rather than suppress it.'
    ),
    fact(
      'epicureanism',
      [
        'what is epicureanism',
        'epicurus philosophy',
        'اپیکوریسم چیست',
        'فلسفه اپیکور'
      ],
      ['epicureanism', 'epicurus', 'اپیکور', 'اپیکوریسم'],
      'اپیکوریسم برخلاف تصور رایج، به معنای پرخوری و لذت افراطی نیست. اپیکور آرامش و نبودِ درد را هدف می‌دانست و دوستی، سادگی و قناعت را مهم‌ترین راه آن می‌شمرد. لذت پایدار از سادگی، آزادی از ترس و روابط صمیمانه می‌آید، نه از تجمل.',
      'Epicureanism is often misunderstood as overindulgence. Epicurus aimed at tranquility and freedom from pain, and saw friendship, simplicity, and moderation as the main path. Lasting pleasure comes from simplicity, freedom from fear, and close relationships, not luxury.'
    ),
    fact(
      'hedonism',
      [
        'what is hedonism',
        'hedonism philosophy',
        'هدونیسم چیست',
        'لذت گرایی یعنی چه'
      ],
      ['hedonism', 'hedonist', 'هدونیسم', 'لذت گرایی'],
      'هدونیسم می‌گوید لذت و دوری از درد ملاک اصلی خوب و بد است. نسخه‌های آن متفاوت‌اند: هدونیسم روان‌شناختی ادعا می‌کند انسان‌ها عملاً به‌دنبال لذت‌اند، اما هدونیسم اخلاقی می‌گوید باید چنین کنیم. نقد رایج این است که پیگیری مستقیم لذت گاهی نتیجه عکس می‌دهد و معنا، روابط و رشد را نادیده می‌گیرد.',
      'Hedonism holds that pleasure and the avoidance of pain are the main measure of good and bad. Versions differ: psychological hedonism claims people in fact pursue pleasure, while ethical hedonism says we ought to. A common criticism is that chasing pleasure directly can backfire and overlook meaning, relationships, and growth.'
    ),
    fact(
      'utilitarianism',
      [
        'what is utilitarianism',
        'utilitarianism explained',
        'فایده گرایی چیست',
        'سودگرایی یعنی چه'
      ],
      ['utilitarianism', 'utilitarian', 'فایده گرایی', 'سودگرایی'],
      'فایده‌گرایی نوعی نتیجه‌گرایی است که می‌گوید درست‌ترین کار آن است که بیشترین رفاه را برای بیشترین افراد تولید کند. بنتام و میل از بنیان‌گذاران آن بودند. نقد اصلی این است که محاسبه‌ی پیامدها دشوار است و می‌تواند حقوق اقلیت یا وظیفه‌های اخلاقی فردی را نادیده بگیرد.',
      'Utilitarianism is a consequentialist view: the right action is the one that produces the greatest well-being for the greatest number. Bentham and Mill are its classic proponents. The main criticism is that calculating consequences is hard and it can overlook minority rights or individual moral duties.'
    ),
    fact(
      'deontology',
      [
        'what is deontology',
        'kantian ethics explained',
        'وظیفه گرایی چیست',
        'اخلاق کانت'
      ],
      ['deontology', 'kantian', 'وظیفه گرایی', 'اخلاق کانت'],
      'وظیفه‌گرایی، به‌ویژه در شکل کانتی، می‌گوید برخی کارها مستقل از نتیجه درست یا نادرست‌اند و باید طبق اصولی عمل کنیم که بشود خواست همگانی شوند. احترام به انسان به‌عنوان هدف، نه وسیله، در مرکز آن است. نقد رایج این است که گاهی وظیفه‌ها با هم تعارض می‌کنند و سخت‌گیری آن از واقعیت فاصله می‌گیرد.',
      'Deontology, especially in its Kantian form, holds that some actions are right or wrong regardless of outcome, and that we should act on principles we could will as universal law. Respecting persons as ends, never mere means, is central. A common criticism is that duties can conflict and its strictness can drift from real life.'
    ),
    fact(
      'virtue_ethics',
      [
        'what is virtue ethics',
        'aristotle virtue ethics',
        'اخلاق فضیلت چیست',
        'فضیلت ارسطو'
      ],
      ['virtue ethics', 'virtue', 'فضیلت', 'اخلاق فضیلت'],
      'اخلاق فضیلت، با ریشه‌ی ارسطویی، به‌جای قواعد یا پیامد، بر شخصیت و پرورش فضیلت‌ها تمرکز دارد. فرد فضیلت‌مند در هر موقعیت «درست عمل می‌کند» و حد وسط میان افراط و تفریط را پیدا می‌کند. نقد رایج این است که کمتر راهنمای عملی مشخص می‌دهد.',
      'Virtue ethics, rooted in Aristotle, focuses on character and the cultivation of virtues rather than rules or consequences. A virtuous person finds the mean between excess and deficiency in each situation. A common criticism is that it offers less concrete practical guidance.'
    ),
    fact(
      'optimism_pessimism',
      [
        'optimism vs pessimism vs realism',
        'what is optimism',
        'what is the difference between optimism and pessimism',
        'خوش بینی یا بدبینی',
        'واقع گرایی چیست'
      ],
      ['optimism', 'pessimism', 'realism', 'خوش بینی', 'بدبینی', 'واقع گرایی'],
      'خوش‌بینی یعنی انتظار نتیجه‌ی خوب و دیدن فرصت‌ها، بدبینی یعنی انتظار نتیجه‌ی بد، و واقع‌گرایی یعنی ارزیابی سنجیده بدون بزرگ‌نمایی در هیچ سمت. خوش‌بینی سنجیده با تاب‌آوری و سلامت رابطه دارد، اما خوش‌بینی کور و بدبینی مداوم هر دو تحریف‌اند. هر سه می‌توانند در کنار هم باشند: امید، احتیاط و دقت.',
      'Optimism means expecting good outcomes and seeing opportunities; pessimism means expecting bad ones; realism means assessing soberly without exaggeration in either direction. Grounded optimism correlates with resilience and well-being, while blind optimism and chronic pessimism are both distortions. The three can coexist: hope, caution, and accuracy.'
    ),
    fact(
      'growth_mindset',
      [
        'growth mindset vs fixed mindset',
        'what is a growth mindset',
        'what is the difference between growth and fixed mindset',
        'ذهنیت رشد چیست',
        'ذهنیت ثابت یعنی چه'
      ],
      ['growth mindset', 'fixed mindset', 'ذهنیت رشد', 'ذهنیت ثابت'],
      'ذهنیت رشد یعنی باور به اینکه توانایی و هوش با تمرین، بازخورد و تلاش توسعه می‌یابد؛ ذهنیت ثابت یعنی باور به اینکه این‌ها ثابت و ذاتی‌اند. کارول دوک نشان داد ذهنیت رشد با پشتکار در برابر شکست همراه است، اما مهم این است که آن را به «فقط بیشتر تلاش کن» تقلیل ندهیم: ساختار، حمایت و تمرینِ درست هم لازم‌اند.',
      'A growth mindset is the belief that ability and intelligence develop through practice, feedback, and effort; a fixed mindset treats them as fixed and innate. Carol Dweck showed a growth mindset correlates with persistence through failure, but it should not be reduced to just trying harder: structure, support, and good practice matter too.'
    ),
    fact(
      'minimalism',
      [
        'what is minimalism',
        'minimalist lifestyle explained',
        'مینیمالیسم چیست',
        'زندگی مینیمال'
      ],
      ['minimalism', 'minimalist', 'مینیمالیسم', 'مینیمال'],
      'مینیمالیسم یعنی آگاهانه کم‌کردنِ چیزها و شلوغی برای بازکردن فضا برای آنچه اهمیت دارد. لازم نیست خانه‌ی خالی یا تعداد مشخصی وسیله داشته باشی؛ هدف روشنی ذهنی و تمرکز است، نه زهد اجباری. برای هرکس شکل متفاوتی دارد و هیچ قانون واحدی وجود ندارد.',
      'Minimalism is intentionally reducing possessions and clutter to make room for what matters. It does not require an empty home or a set number of items; the goal is clarity and focus, not forced austerity. It takes a different shape for everyone and has no single rule.'
    ),
    fact(
      'ikigai',
      [
        'what is ikigai',
        'how to find ikigai',
        'ایکیگای چیست',
        'چطور ایکیگای پیدا کنم'
      ],
      ['ikigai', 'ایکیگای'],
      'ایکیگای مفهوم ژاپنی «دلیل برخاستن صبح» است. نسخه‌ی رایج چهار دایره را روی هم می‌گذارد: چه چیزی را دوست داری، در چه کاری خوبی، دنیا به چه چیزی نیاز دارد و از چه کاری می‌شود درآمد داشت. در عمل، ایکیگای معمولاً ساده‌تر و فروتنانه‌تر از یک «هدف بزرگ» است و از کارهای کوچک روزانه می‌آید.',
      'Ikigai is the Japanese idea of a reason to get up in the morning. A popular version overlaps four circles: what you love, what you are good at, what the world needs, and what you can be paid for. In practice, ikigai is often smaller and humbler than one grand purpose, arising from small daily things.'
    ),
    fact(
      'wabi_sabi',
      [
        'what is wabi sabi',
        'wabi sabi meaning',
        'وابی سابی چیست',
        'زیبایی ناقص یعنی چه'
      ],
      ['wabi sabi', 'وابی سابی'],
      'وابی‌سابی زیبایی‌شناسی ژاپنی است که نقص، گذرا بودن و سادگی طبیعی را می‌ستاید. ترک یک فنجان، پژمردگی گل و پتینه‌ی چوب زیبا شمرده می‌شوند، چون نشان زندگی و زمان‌اند. نوعی پذیرشِ ناپایداری است و به آرامش با نقص کمک می‌کند.',
      'Wabi-sabi is a Japanese aesthetic that honors imperfection, impermanence, and natural simplicity. A crack in a cup, a fading flower, or the patina of wood is seen as beautiful because it shows life and time. It is a way of accepting impermanence and finding ease with flaws.'
    ),
    fact(
      'hygge_lagom',
      [
        'what is hygge',
        'hygge and lagom meaning',
        'هوگه چیست',
        'لاگوم یعنی چه'
      ],
      ['hygge', 'lagom', 'هوگه', 'لاگوم'],
      'هوگه حال‌وهوای دانمارکیِ گرما، آسودگی و بودنِ آرام با عزیزان است: نور ملایم، چای و گفتگوی بی‌شتاب. لاگوم واژه‌ی سوئدی یعنی «نه کم، نه زیاد؛ درست به اندازه». هر دو سبک‌هایی از رضایت و تعادل‌اند، نه فرمول اجباری برای شادمانی.',
      'Hygge is a Danish mood of warmth, ease, and unhurried togetherness: soft light, tea, and calm conversation. Lagom is the Swedish word for not too little and not too much, just right. Both are styles of contentment and balance, not forced formulas for happiness.'
    ),
    fact(
      'taoism_wuwei',
      [
        'what is taoism',
        'what is wu wei',
        'تائوئیسم چیست',
        'تایوییسم چیست',
        'وو وی یعنی چه'
      ],
      ['taoism', 'wu wei', 'تائوئیسم', 'تایوییسم', 'وو وی'],
      'تائوئیسم سنت فلسفی-دینی چینی است که بر هماهنگی با «تائو» (راه طبیعت) تأکید دارد. «وو وی» به معنای «اقدام بدون اجبار» است: حرکت با جریان به‌جای شناکردن خلاف آن. به سادگی، فروتنی و بی‌تقلا بودن نزدیک است، نه به بی‌عملی محض.',
      'Taoism is a Chinese philosophical-religious tradition centered on harmony with the Tao, the way of nature. Wu wei means action without force: moving with the flow rather than against it. It points to simplicity, humility, and effortlessness, not mere inaction.'
    ),
    fact(
      'zen_middle_way',
      [
        'what is zen buddhism',
        'what is the middle way',
        'ذن چیست',
        'راه میانه یعنی چه'
      ],
      ['zen', 'middle way', 'ذن', 'راه میانه'],
      'ذن شاخه‌ای از بودیسم مهایانه است که بر تجربه‌ی مستقیم، مراقبه و حضور تأکید دارد تا تحلیل صرف. «راه میانه» بودا یعنی پرهیز از افراط در لذت و ریاضت. هر دو به سادگی ذهن و دیدن واقعیت بی‌واسطه دعوت می‌کنند.',
      'Zen is a branch of Mahayana Buddhism that emphasizes direct experience, meditation, and presence over mere analysis. The Buddhist middle way means avoiding the extremes of indulgence and self-mortification. Both invite simplicity of mind and seeing reality directly.'
    ),
    fact(
      'skepticism',
      [
        'what is skepticism',
        'philosophical skepticism',
        'شک گرایی چیست',
        'شکاکیت یعنی چه'
      ],
      ['skepticism', 'skeptic', 'شک گرایی', 'شکاکیت'],
      'شک‌گرایی در معنای سالم، نگرشِ «ادعا را تا دیدن شواهد نپذیر» است، نه انکار همه‌چیز. شک‌گرایی فلسفی درباره‌ی امکان شناخت قطعی پرسش می‌کند. در زندگی روزمره، شک سالم یعنی پرسش محترمانه، بررسی منبع و آمادگی برای تغییر نظر با شواهد بهتر.',
      'Healthy skepticism is the attitude of not accepting a claim until you see evidence, not denying everything. Philosophical skepticism questions whether certain knowledge is possible. In daily life, healthy skepticism means respectful questioning, checking sources, and being ready to update your view with better evidence.'
    ),
    fact(
      'empiricism_rationalism',
      [
        'empiricism vs rationalism',
        'what is empiricism',
        'what is the difference between empiricism and rationalism',
        'تجربه گرایی یا عقل گرایی',
        'تجربه گرایی چیست'
      ],
      ['empiricism', 'rationalism', 'تجربه گرایی', 'عقل گرایی'],
      'تجربه‌گرایی می‌گوید دانش از تجربه‌ی حسی می‌آید و عقل‌گرایی می‌گوید بخش مهمی از شناخت از عقل و ساختار ذهن می‌آید. لاک و هیوم نمونه‌ی اول و دکارت نمونه‌ی دوم‌اند. امروز اغلب شناخت را ترکیبی از مشاهده، آزمون و استدلال می‌دانیم.',
      'Empiricism holds that knowledge comes from sensory experience, while rationalism holds that much of it comes from reason and the structure of the mind. Locke and Hume exemplify the first, Descartes the second. Today most accounts treat knowing as a mix of observation, testing, and reasoning.'
    ),
    fact(
      'pragmatism',
      [
        'what is pragmatism',
        'pragmatism philosophy',
        'پراگماتیسم چیست',
        'عمل گرایی یعنی چه'
      ],
      ['pragmatism', 'عمل گرایی', 'پراگماتیسم'],
      'پراگماتیسم می‌گوید ارزش یک ایده یا روش را باید در پیامدهای عملی و کارکردش سنجید، نه صرفاً در تطابق با یک اصل انتزاعی. ویلیام جیمز و جان دیویی از چهره‌های آن بودند. یعنی: اگر دو باور نتایج یکسان داشته باشند، بحث بر سر برچسبشان بی‌حاصل است.',
      'Pragmatism holds that an idea or method should be judged by its practical consequences and usefulness, not merely by matching an abstract principle. William James and John Dewey are key figures. If two beliefs lead to the same results, arguing over their label is unproductive.'
    ),
    fact(
      'humanism',
      [
        'what is humanism',
        'secular humanism explained',
        'اومانیسم چیست',
        'انسان گرایی یعنی چه'
      ],
      ['humanism', 'اومانیسم', 'انسان گرایی'],
      'اومانیسم جهان‌بینی‌ای است که بر ارزش، کرامت و عقل انسان تمرکز دارد و اخلاق و معنا را از تجربه‌ی انسانی می‌گیرد، نه الزاماً از یک مرجع دینی. اومانیسم سکولار بر دلسوزی، علم و حقوق بشر تأکید دارد. اومانیست‌ها می‌توانند مذهبی یا غیرمذهبی باشند.',
      'Humanism is a worldview centered on human value, dignity, and reason, drawing ethics and meaning from human experience rather than necessarily from a religious authority. Secular humanism emphasizes compassion, science, and human rights. Humanists may be religious or nonreligious.'
    ),
    fact(
      'transhumanism',
      [
        'what is transhumanism',
        'transhumanism explained',
        'ترنس‌هیومانیسم چیست',
        'ترنس هیومانیسم چیست',
        'فراانسان گرایی یعنی چه'
      ],
      ['transhumanism', 'ترنس‌هیومانیسم', 'ترنس هیومانیسم', 'فراانسان گرایی'],
      'ترنس‌هیومانیسم جنبشی فکری است که از فناوری برای ارتقای توانایی‌های جسمی و ذهنی انسان و افزایش طول عمر سالم حمایت می‌کند. موافقان آن را ادامه‌ی طبیعی پیشرفت می‌دانند؛ منتقدان به نابرابری دسترسی، پیامدهای پیش‌بینی‌نشده و معنای «انسان» بودن اشاره می‌کنند.',
      'Transhumanism is an intellectual movement that favors using technology to enhance human physical and mental abilities and extend healthy lifespan. Supporters see it as a natural continuation of progress; critics point to unequal access, unforeseen consequences, and the meaning of being human.'
    ),
    fact(
      'effective_altruism',
      [
        'what is effective altruism',
        'effective altruism explained',
        'نوع دوستی موثر چیست',
        'نیکوکاری موثر یعنی چه'
      ],
      ['effective altruism', 'نوع دوستی موثر', 'نیکوکاری موثر'],
      'نوع‌دوستی مؤثر یعنی استفاده از شواهد و محاسبه برای اینکه کمک‌های ما بیشترین اثر را داشته باشند، نه فقط احساس خوب. به پرسش‌هایی مثل «کدام مسئله مهم‌تر و نادیده‌تر است» و «کدام راه‌حل کار می‌کند» می‌پردازد. نقد آن این است که می‌تواند بیش از حد محاسبه‌گر شود و ارزش‌های محلی را کم‌بها دهد.',
      'Effective altruism means using evidence and reasoning so that our help does the most good, not just feel good. It asks which problems are most important and neglected and which solutions work. A criticism is that it can become overly calculating and undervalue local, relational forms of care.'
    ),
    fact(
      'determinism_free_will',
      [
        'determinism vs free will',
        'what is compatibilism',
        'what is the difference between determinism and free will',
        'جبر یا اختیار',
        'جبرگرایی چیست'
      ],
      [
        'determinism',
        'free will',
        'compatibilism',
        'جبر',
        'اختیار',
        'جبرگرایی'
      ],
      'جبرگرایی می‌گوید همه‌ی رویدادها از جمله تصمیم‌ها، از شرایط پیشین نتیجه می‌شوند. این با «اختیار» به معنای کامل نبودن علت، ناسازگار است؛ اما سازگارگرایان می‌گویند اختیار یعنی عمل بر اساس خواست و تصمیم خودت، و این با جبر سازگار است. بحث درباره‌ی مسئولیت اخلاقی هنوز باز است.',
      'Determinism holds that all events, including decisions, follow from prior conditions. That is incompatible with free will in the sense of being wholly uncaused; but compatibilists argue free will means acting on your own wants and choices, which is compatible with determinism. The debate over moral responsibility remains open.'
    ),
    fact(
      'longtermism',
      [
        'what is longtermism',
        'existential risk explained',
        'لانگ ترمیسم چیست',
        'ریسک وجودی یعنی چه'
      ],
      ['longtermism', 'existential risk', 'ریسک وجودی', 'لانگ ترمیسم'],
      'لانگ‌ترمیسم می‌گوید آینده‌ی دور انسان‌ها می‌تواند بسیار مهم باشد، پس باید به خطرهایی که تمدن یا بقای بشریت را تهدید می‌کنند (مانند جنگ هسته‌ای، بیماری همه‌گیر مهندسی‌شده، هوش مصنوعی ناهم‌سو) توجه کنیم. نقد آن این است که نباید رنجِ امروز را فدای احتمالات دور کرد.',
      'Longtermism argues that the far future of humanity could matter enormously, so we should attend to risks that threaten civilization or survival, such as nuclear war, engineered pandemics, or misaligned AI. A criticism is that present suffering must not be sacrificed to distant possibilities.'
    ),
    fact(
      'democracy',
      [
        'what is democracy',
        'how does democracy work',
        'دموکراسی چیست',
        'مردم سالاری یعنی چه'
      ],
      ['democracy', 'دموکراسی', 'مردم سالاری'],
      'دموکراسی یعنی حکومتی که قدرت از مردم می‌آید، معمولاً از راه انتخابات آزاد، حقوق برابر و حاکمیت قانون. اشکال آن از نمایندگی‌ای تا مستقیم متفاوت است. هیچ دموکراسی کامل نیست و آزادی بیان، مطبوعات و نهادهای مستقل برای سلامتش ضروری‌اند.',
      'Democracy is government in which power comes from the people, typically through free elections, equal rights, and the rule of law. Its forms range from representative to direct. No democracy is perfect, and free expression, a free press, and independent institutions are essential to its health.'
    ),
    fact(
      'liberalism',
      [
        'what is liberalism',
        'liberalism explained',
        'لیبرالیسم چیست',
        'لیبرال یعنی چه'
      ],
      ['liberalism', 'لیبرالیسم', 'لیبرال'],
      'لیبرالیسم بر آزادی فردی، برابری در برابر قانون، رضایتِ حکومت‌شوندگان و محدودیت قدرت دولت تأکید دارد. از اقتصاد آزاد تا آزادی‌های مدنی گستره دارد. در معنای روزمره در کشورهای مختلف بار معنایی متفاوتی دارد، اما هسته‌اش دفاع از حق‌ها و آزادی فرد است.',
      'Liberalism emphasizes individual liberty, equality before the law, the consent of the governed, and limits on state power. It spans from free markets to civil liberties. Its everyday meaning varies by country, but its core is defending rights and individual freedom.'
    ),
    fact(
      'conservatism',
      [
        'what is conservatism',
        'conservatism explained',
        'محافظه کاری چیست',
        'محافظه کار یعنی چه'
      ],
      ['conservatism', 'محافظه کاری', 'محافظه کار'],
      'محافظه‌کاری گرایشی است که برای نهادها، سنت‌ها و تغییر تدریجی ارزش قائل است و نسبت به تغییر سریعِ ساختارهای آزموده محتاط است. یک باور واحد نیست و از فرهنگی به فرهنگ دیگر تفاوت دارد. بر سنت، ثبات و احتیاط تأکید می‌کند، نه مقاومت در برابر هر تغییری.',
      'Conservatism is an outlook that values institutions, traditions, and gradual change, and is cautious about rapidly overhauling tested structures. It is not one creed and varies across cultures. It stresses tradition, stability, and prudence rather than resistance to every change.'
    ),
    fact(
      'socialism_capitalism',
      [
        'socialism vs capitalism',
        'what is socialism',
        'what is the difference between socialism and capitalism',
        'سرمایه داری یا سوسیالیسم',
        'سوسیالیسم چیست'
      ],
      ['socialism', 'capitalism', 'سوسیالیسم', 'سرمایه داری'],
      'سرمایه‌داری بر مالکیت خصوصی و بازار آزاد تکیه دارد؛ سوسیالیسم بر مالکیت اجتماعی یا جمعی منابع و کاهش نابرابری تأکید دارد. در واقعیت، بیشتر اقتصادها ترکیبی‌اند. هر دو طیف گسترده‌ای دارند و «سرمایه‌داری» یا «سوسیالیسم» یک الگوی واحد نیستند.',
      'Capitalism relies on private ownership and free markets; socialism emphasizes social or collective ownership of resources and reducing inequality. In reality most economies are mixed. Both span a wide spectrum, and neither capitalism nor socialism is a single model.'
    ),
    fact(
      'communism',
      [
        'what is communism',
        'communism explained',
        'کمونیسم چیست',
        'کمونیست یعنی چه'
      ],
      ['communism', 'کمونیسم'],
      'کمونیسم نظریه و جنبشی است که خواهان مالکیت مشترک وسایل تولید و جامعه‌ای بدون طبقه است، با الهام از مارکس و انگلس. در قرن بیستم، حکومت‌های خودخوانده‌ی کمونیست اغلب اقتدارگرا شدند و بسیاری نقد کرده‌اند که از آرمان برابری دور شدند. تمایز میان نظریه، جنبش و رژیم‌های تاریخی مهم است.',
      'Communism is a theory and movement seeking common ownership of the means of production and a classless society, inspired by Marx and Engels. In the twentieth century, self-described communist states often became authoritarian, and many critics argue they departed from the egalitarian ideal. Distinguishing theory, movement, and historical regimes matters.'
    ),
    fact(
      'anarchism',
      [
        'what is anarchism',
        'anarchism explained',
        'آنارشیسم چیست',
        'آنارشیست یعنی چه'
      ],
      ['anarchism', 'آنارشیسم'],
      'آنارشیسم جنبشی فکری است که خواهان جامعه‌ای بدون دولت و سلسله‌مراتبِ تحمیلی است و بر همکاری داوطلبانه و خودمختاری تأکید دارد. طیف آن از آنارکو-کمونیسم تا آنارکو-کاپیتالیسم گسترده است. برخلاف تصور، به معنای هرج‌ومرج نیست؛ بیشتر آنارشیست‌ها به سازماندهی از پایین باور دارند.',
      'Anarchism is a political movement seeking a society without a state and without imposed hierarchy, emphasizing voluntary cooperation and autonomy. Its spectrum runs from anarcho-communism to anarcho-capitalism. Contrary to stereotype, it does not mean chaos; most anarchists believe in organization from below.'
    ),
    fact(
      'libertarianism',
      [
        'what is libertarianism',
        'libertarianism explained',
        'لیبرتارینیسم چیست',
        'لیبرترین یعنی چه'
      ],
      ['libertarianism', 'لیبرتارینیسم', 'لیبرترین'],
      'لیبرتارینیسم بر آزادی فردی حداکثری، مالکیت خصوصی و کمینه‌کردن دخالت دولت تأکید دارد. برخی شاخه‌ها فقط بازار آزاد و برخی آزادی‌های مدنی و شخصی را برجسته می‌کنند. نقد رایج این است که حذف دولت می‌تواند حمایت از آسیب‌پذیران را تضعیف کند.',
      'Libertarianism emphasizes maximal individual liberty, private property, and minimizing state intervention. Some branches stress free markets, others civil and personal liberties. A common criticism is that shrinking the state can weaken protection for the vulnerable.'
    ),
    fact(
      'fascism',
      ['what is fascism', 'fascism explained', 'فاشیسم چیست', 'فاشیست یعنی چه'],
      ['fascism', 'فاشیسم'],
      'فاشیسم ایدئولوژی اقتدارگرای قرن بیستم است که ناسیونالیسم افراطی، رهبری مطلق، سرکوب مخالف و اسطوره‌سازی از «ملت» را با خشونت ترکیب کرد. نمونه‌های تاریخی آن (ایتالیای موسولینی و آلمان نازی) به جنگ، نسل‌کشی و سرکوب انجامیدند. این ایدئولوژی به‌طور گسترده به‌خاطر نفی دموکراسی و حقوق بشر محکوم است.',
      'Fascism is a twentieth-century authoritarian ideology combining extreme nationalism, absolute leadership, suppression of opposition, and myth-making about the nation with violence. Its historical instances (Mussolini s Italy and Nazi Germany) led to war, genocide, and repression. The ideology is widely condemned for denying democracy and human rights.'
    ),
    fact(
      'populism',
      [
        'what is populism',
        'populism explained',
        'پوپولیسم چیست',
        'عوام گرایی یعنی چه'
      ],
      ['populism', 'پوپولیسم', 'عوام گرایی'],
      'پوپولیسم سبکی سیاسی است که جامعه را به «مردم خالص» در برابر «نخبگان فاسد» تقسیم می‌کند و ادعای نمایندگی بی‌واسطه‌ی مردم را دارد. می‌تواند چپ یا راست باشد و هم می‌تواند صدای مطالبات نادیده‌گرفته‌شده باشد و هم دموکراسی و نهادها را تضعیف کند.',
      'Populism is a political style that divides society into the pure people versus a corrupt elite and claims to speak directly for the people. It can be left or right, and it can both voice ignored grievances and undermine democracy and institutions.'
    ),
    fact(
      'nationalism_globalism',
      [
        'nationalism vs globalism',
        'what is nationalism',
        'what is the difference between nationalism and globalism',
        'ناسیونالیسم یا جهانی گرایی',
        'ملی گرایی چیست'
      ],
      ['nationalism', 'globalism', 'ناسیونالیسم', 'ملی گرایی', 'جهانی گرایی'],
      'ملی‌گرایی بر منافع، هویت و حاکمیت ملت خودی تأکید دارد؛ جهانی‌گرایی بر پیوند و همکاری فراملی و مسائل مشترک (اقلیم، تجارت، مهاجرت) تمرکز دارد. هر دو می‌توانند سودمند یا افراطی شوند: ملی‌گراییِ سالم به همبستگی و جهانی‌گراییِ سالم به همکاری اشاره دارد؛ شکل‌های افراطی به بیگانه‌هراسی یا بی‌توجهی به جوامع محلی می‌انجامد.',
      'Nationalism stresses the interests, identity, and sovereignty of one s own nation; globalism focuses on transnational connection and shared problems such as climate, trade, and migration. Both can be healthy or extreme: healthy nationalism means solidarity, healthy globalism means cooperation; extreme forms slide into xenophobia or neglect of local communities.'
    ),
    fact(
      'progressivism',
      [
        'what is progressivism',
        'progressive politics explained',
        'ترقی خواهی چیست',
        'پیشرو یعنی چه'
      ],
      ['progressivism', 'ترقی خواهی', 'پیشرو'],
      'ترقی‌خواهی گرایشی است که از اصلاحات اجتماعی، برابری بیشتر و استفاده از دولت برای رفع نابرابری و حمایت از حقوق دفاع می‌کند. در دوره‌های مختلف معنای متفاوتی داشته است. نقد آن این است که گاهی تغییر را تندتر از ظرفیت نهادها پیش می‌برد.',
      'Progressivism is an outlook favoring social reform, greater equality, and using government to address inequality and protect rights. Its meaning has shifted across eras. A criticism is that it sometimes pushes change faster than institutions can absorb.'
    ),
    fact(
      'political_spectrum',
      [
        'left vs right in politics',
        'what does left and right mean',
        'what is the difference between left and right in politics',
        'چپ و راست سیاسی یعنی چه',
        'چپ و راست سیاسی چیه',
        'طیف سیاسی چیه'
      ],
      [
        'left wing',
        'right wing',
        'political spectrum',
        'چپ',
        'راست',
        'طیف سیاسی'
      ],
      'اصطلاح چپ و راست از جای‌نشینی نمایندگان در مجلس ملی فرانسه پس از انقلاب آمد. در معنای رایج، چپ بیشتر به برابری و مداخله‌ی دولت و راست بیشتر به آزادی فردی، سنت و بازار متمایل است. این یک طیف ساده است و افراد و احزاب واقعی اغلب ترکیبی‌اند.',
      'Left and right originally described seating in the French National Assembly after the revolution. Commonly, left leans toward equality and state intervention, right toward individual liberty, tradition, and markets. It is a simplification, and real people and parties are often mixed.'
    ),
    fact(
      'terrorism_extremism',
      [
        'what is terrorism',
        'what is radicalization',
        'تروریسم چیست',
        'افراطی گری یعنی چه'
      ],
      [
        'terrorism',
        'extremism',
        'radicalization',
        'تروریسم',
        'افراطی گری',
        'رادیکالیزاسیون'
      ],
      'تروریسم به‌کارگیری خشونت علیه غیرنظامیان برای ایجاد رعب و رسیدن به هدف سیاسی یا ایدئولوژیک است. افراطی‌گری یعنی باورهای مطلق و خشونت‌طلبانه که تحمل نکردن مخالف را توجیه می‌کنند. هدف قراردادن غیرنظامیان هرگز توجیه ندارد. اگر کسی به‌سمت خشونت یا افراط کشیده می‌شود، گفتگو با یک فرد امن یا متخصص می‌تواند کمک کند.',
      'Terrorism is the use of violence against civilians to spread fear and advance a political or ideological goal. Extremism means absolute, violence-endorsing beliefs that justify intolerance of opponents. Targeting civilians is never justified. If someone is being drawn toward violence or extremism, talking with a trusted person or a specialist can help.'
    ),
    fact(
      'intellectual_humility',
      [
        'what is intellectual humility',
        'how to be open minded',
        'تواضع فکری چیست',
        'ذهن باز یعنی چه'
      ],
      ['intellectual humility', 'open mindedness', 'تواضع فکری', 'ذهن باز'],
      'تواضع فکری یعنی شناخت محدودیتِ دانسته‌هایمان و آمادگی برای اینکه اشتباه کنیم. ذهن باز یعنی شنیدنِ واقعی دیدگاه‌های مخالف بدون از پیش محکوم‌کردنشان. هیچ‌کدام به معنای بی‌نظری نیست؛ می‌توانی نظری قوی داشته باشی و همچنان برای شواهد بهتر باز بمانی.',
      'Intellectual humility is recognizing the limits of what we know and being ready to be wrong. Open-mindedness means genuinely hearing opposing views without condemning them in advance. Neither means having no opinion; you can hold a strong view and still stay open to better evidence.'
    ),
    fact(
      'secularism',
      [
        'what is secularism',
        'secularism explained',
        'سکولاریسم چیست',
        'سکولار یعنی چه'
      ],
      ['secularism', 'سکولاریسم', 'سکولار'],
      'سکولاریسم یعنی جدایی نهادهای دولتی از نهادهای دینی و رفتار برابر دولت با همه‌ی باورها، به‌طوری که آزادی دین و آزادی از دین هر دو محفوظ بمانند. به معنای خصومت با دین نیست؛ در بسیاری از کشورها با آزادی مذهبی هم‌زیستی دارد.',
      'Secularism means separating state institutions from religious institutions and treating all beliefs equally, protecting both freedom of religion and freedom from religion. It does not mean hostility to religion; in many countries it coexists with religious freedom.'
    ),
    fact(
      'feminism',
      [
        'what is feminism',
        'feminism explained',
        'فمینیسم چیست',
        'فمینیست یعنی چه'
      ],
      ['feminism', 'فمینیسم'],
      'فمینیسم جنبشی برای برابری حقوق و فرصت‌های همه‌ی جنسیت‌هاست و در موج‌های گوناگون بر رأی، کار، آموزش، بدنی و بازنمایی تمرکز داشته است. یک دیدگاه واحد نیست و فمینیست‌ها درباره‌ی اولویت‌ها اختلاف دارند؛ هسته‌ی آن برابری و کرامت است.',
      'Feminism is a movement for equal rights and opportunities across genders, and its waves have focused on suffrage, work, education, the body, and representation. It is not one view, and feminists disagree on priorities; its core is equality and dignity.'
    ),
    fact(
      'environmentalism',
      [
        'what is environmentalism',
        'environmentalism explained',
        'محیط زیست گرایی چیست',
        'زیست محیطی یعنی چه'
      ],
      ['environmentalism', 'محیط زیست گرایی', 'زیست محیطی'],
      'محیط‌زیست‌گرایی جنبشی است که برای حفاظت از طبیعت، کاهش آلودگی و مقابله با تغییر اقلیم تلاش می‌کند. از سبک زندگی شخصی تا سیاست عمومی گسترده است. با عدالت اجتماعی پیوند دارد، چون آسیب‌های محیطی بیشتر بر جوامع کم‌برخوردار اثر می‌گذارد.',
      'Environmentalism is a movement to protect nature, reduce pollution, and address climate change, spanning personal lifestyle to public policy. It is linked to social justice, because environmental harms fall hardest on less privileged communities.'
    )
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
