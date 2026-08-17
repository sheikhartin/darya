/**
 * Darya - curated factual entries (culture domain).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'genz_slang',
      keywords: [
        'ریز یعنی چی',
        'اورا یعنی چی',
        'slang یعنی چی',
        'نسل زد',
        'gen z slang',
        'what does rizz mean',
        'what does aura mean'
      ],
      weak: [
        'rizz',
        'aura',
        'delulu',
        'brain rot',
        'cooked',
        'cap',
        'gyat',
        'slay',
        'based',
        'sigma',
        'glazing',
        'goated'
      ],
      weakSafe: true,
      hints: ['slang', 'یعنی', 'نسل زد', 'gen z', 'اصطلاح'],
      fa: 'نسل زد (زاده‌های دهه‌ی ۱۹۹۰ تا اوایل ۲۰۱۰) فرهنگ لغت خاص خودش را دارد که از شبکه‌های اجتماعی مثل تیک‌تاک و ایکس می‌آید: «ریز» یعنی جذابیت و کاریزما، «اورا» یعنی هاله‌ی شخصیتی (مثلاً «اوراش بالا رفت»)، «دلولو» یعنی خوش‌خیالی افراطی، «کوکد» یعنی به‌هم‌ریخته یا تمام‌شده، و «گلود» یعنی درخشیدن. این واژه‌ها خیلی سریع عوض می‌شوند و بیشتر جنبه‌ی شوخی و خودمانی دارند.',
      en: 'Gen Z (born roughly in the 1990s to early 2010s) has its own evolving vocabulary born on TikTok and X: "rizz" means charm or charisma, "aura" means the vibe or presence someone gives off (as in "huge aura"), "delulu" means delightfully delusional, "cooked" means done for or exhausted, and "slay" means to perform brilliantly. These words shift fast and are mostly playful and informal.'
    },
    {
      id: 'digital_attention',
      keywords: [
        'is brain rot permanent',
        'short videos ruined my attention span',
        'short videos destroyed my attention span',
        'can i fix my attention span',
        'آیا برین رات همیشگیه',
        'ویدیوهای کوتاه تمرکزم رو خراب کردن'
      ],
      weak: ['attention span', 'brain rot', 'دامنه توجه', 'تمرکز'],
      weakSafe: true,
      hints: ['permanent', 'fix', 'short video', 'همیشگی', 'ویدیوی کوتاه'],
      fa: '«برین رات» تشخیص پزشکی نیست و افت تمرکز لزوماً دائمی نیست. مصرف زیاد محتوای کوتاه با توجه و یادآوری ضعیف‌تر ارتباط دارد، اما مغز تغییرپذیر است. به‌جای حذف ناگهانی همه‌چیز، اعلان‌ها را کم کن، زمان ویدیوی کوتاه را تدریجی پایین بیاور و هر روز یک فعالیت طولانی‌تر مثل خواندن، پیاده‌روی یا کار بدون جابه‌جایی انجام بده. اگر مشکل تمرکز در درس، کار یا زندگی ماندگار است، ارزیابی حرفه‌ای می‌تواند علت‌هایی مثل کم‌خوابی، اضطراب یا بیش‌فعالی را بررسی کند.',
      en: '“Brain rot” is not a medical diagnosis, and a shorter attention span is not automatically permanent. Heavy short-form media use is associated with poorer attention and recall, but attention can be retrained. Rather than deleting everything overnight, reduce notifications, lower short-video time gradually, and practice one sustained activity daily, such as reading, walking, or focused work without switching. If concentration problems keep disrupting school, work, or daily life, a professional evaluation can check factors such as sleep, anxiety, or ADHD.'
    },
    {
      id: 'tiktok_culture',
      keywords: [
        'تیک تاک',
        'فرهنگ تیک تاک',
        'تیک‌تاک چیه',
        'tiktok culture',
        'what is tiktok',
        'short form video'
      ],
      weak: ['تیک تاک', 'tiktok', 'تیک‌تاک', 'شورت', 'reels'],
      weakSafe: true,
      hints: ['ویدیو', 'شبکه اجتماعی', 'اینترنت', 'video', 'social'],
      fa: 'تیک‌تاک شبکه‌ی اجتماعی ویدیوهای کوتاه است که از حدود سال ۲۰۲۰ انفجاری رشد کرد و برای نسل زد به موتور جست‌وجو و منبع خبر و سرگرمی تبدیل شد. الگوریتمش بر اساس علاقه‌ی کاربر ویدیو نشان می‌دهد و ترندها و صداها را با سرعت عجیبی فراگیر می‌کند. تأثیرش روی موسیقی، مد، زبان و حتی اخبار آن‌قدر زیاد است که بقیه‌ی پلتفرم‌ها (اینستاگرام با Reels و یوتیوب با Shorts) از آن تقلید کرده‌اند.',
      en: 'TikTok is the short-form video platform that exploded around 2020 and became a search engine, news source, and entertainment hub for Gen Z. Its algorithm feeds videos based on your interests and spreads trends and sounds at remarkable speed. Its influence on music, fashion, language, and even news is so large that other platforms (Instagram with Reels, YouTube with Shorts) copied its format.'
    },
    {
      id: 'social_media_iran',
      keywords: [
        'اینستاگرام چیه',
        'تلگرام چیه',
        'ایکس چیه',
        'شبکه های اجتماعی',
        'what is instagram',
        'what is telegram',
        'what is x formerly twitter'
      ],
      weak: ['اینستاگرام', 'تلگرام', 'instagram', 'telegram', 'ایکس', 'tiktok'],
      weakSafe: true,
      hints: ['شبکه اجتماعی', 'ایران', 'social', 'messenger', 'اپ'],
      fa: 'هر پلتفرم کار خودش را دارد: اینستاگرام برای عکس و استوری و فروشگاه اینترنتی، تلگرام برای پیام‌رسانی و کانال‌های خبری، ایکس (توییتر سابق) برای گفتگوی سریع و لحظه‌ای درباره‌ی اتفاقات، و یوتیوب برای ویدیوی بلند. در ایران، تلگرام و اینستاگرام محبوب‌ترین‌اند و با وجود فیلترینگ، بیشتر کاربران با وی‌پی‌ان از آن‌ها استفاده می‌کنند.',
      en: 'Each platform has its role: Instagram for photos, stories, and small businesses; Telegram for messaging and news channels; X (formerly Twitter) for fast, real-time discussion; and YouTube for long-form video. In Iran, Telegram and Instagram are the most popular and, despite filtering, most users reach them through VPNs.'
    },
    {
      id: 'ghosting',
      keywords: [
        'گوستینگ یعنی چی',
        'گوست شدن',
        'غیب شدن توی رابطه',
        'what is ghosting',
        'why do people ghost'
      ],
      weak: ['گوستینگ', 'ghosting', 'گاست', 'ghosted'],
      weakSafe: true,
      hints: ['رابطه', 'دوستی', 'پیام', 'relationship', 'dating', 'text'],
      fa: 'گوستینگ یعنی ناپدید شدن بی‌توضیح: کسی که با او در ارتباطی (معمولاً عاطفی یا دوستی) بوده‌ای، بدون هیچ حرفی پاسخ دادن را قطع می‌کند. این رفتار در عصر اپ‌های دوستیابی و پیام‌رسان‌ها خیلی رایج شده و برای طرف مقابل گیج‌کننده و آزاردهنده است. اگر گوست شدی، بدان که بیشتر به رفتار طرف مقابل مربوط است تا به ارزش تو.',
      en: 'Ghosting means disappearing without explanation: someone you were in contact with, usually in a romantic or friendly context, simply stops replying. It became very common in the age of dating apps and messengers, and it leaves the other person confused and hurt. If you get ghosted, remember it says more about the other person’s behavior than about your worth.'
    },
    {
      id: 'dating_culture',
      keywords: [
        'اپ دوستیابی',
        'دوست یابی اینترنتی',
        'قرعه کشی عشق',
        // Profile-writing questions are owned by the dating_apps rule
        // pool ("how do I write a good dating profile?" gets a warm
        // reflective reply, not an encyclopedia entry), so the generic
        // culture fact keeps only the app-fatigue phrasings.
        'dating apps',
        'online dating',
        'why is dating so hard'
      ],
      weak: ['دوستیابی', 'دوست یابی', 'dating', 'تیندر', 'tinder'],
      weakSafe: true,
      hints: ['رابطه', 'عشق', 'ازدواج', 'relationship', 'love'],
      fa: 'دوستیابی و قرار گذاشتن در این دهه بیشتر به اپ‌ها منتقل شده، اما خیلی‌ها از آن خسته شده‌اند: چرخش بی‌پایان بین پروفایل‌ها، پیام‌های تکراری و ناپدید شدن ناگهانی. به همین دلیل نسل جوان به سمت ملاقات‌های واقعی، گروه‌های علاقه‌مندی و ارتباط‌های صمیمانه‌تر برگشته است. قانون ساده‌ی مفید: آهسته پیش برو، خود واقعی‌ات را نشان بده و شفاف باش.',
      en: 'Dating has largely moved onto apps this decade, but many people are tired of it: endless profile swiping, repetitive openers, and sudden disappearances. As a result, young people are drifting back toward real-life meetups, hobby groups, and more genuine connection. A simple useful rule: go slow, show your real self, and communicate clearly.'
    },
    {
      id: 'quiet_quitting',
      keywords: [
        'ترک خاموش',
        // Dual spelling: the normalizer maps «کوئیت» to «کوییت».
        'کوئیت کویتینگ',
        'کوییت کویتینگ',
        'quiet quitting',
        'lazy girl job'
      ],
      weak: ['ترک خاموش', 'quiet quitting', 'کویت'],
      weakSafe: true,
      hints: ['کار', 'شغل', 'کاری', 'work', 'job'],
      fa: '«ترک خاموش» یعنی کار را تمام و کامل انجام می‌دهی اما دیگر از مرز وظیفه‌ات فراتر نمی‌روی: نه اضافه‌کاری بی‌پایان، نه جواب دادن به پیام کاری شب و آخر هفته. این واژه از حدود ۲۰۲۲ رایج شد و واکنش نسل جوان به فرهنگ «همیشه در دسترس بودن» است. خیلی‌ها آن را سالم‌سازی مرزها می‌دانند، نه تنبلی.',
      en: '"Quiet quitting" means doing your job fully and well but no longer going beyond its boundaries: no endless overtime, no answering work messages at night or on weekends. The term became popular around 2022 as a reaction from younger workers to hustle culture and constant availability. Many see it as healthy boundary-setting rather than laziness.'
    },
    {
      id: 'hustle_culture',
      keywords: [
        'هاسل کالچر',
        'فرهنگ کار زیاد',
        'grindset',
        'hustle culture',
        'grind culture'
      ],
      weak: ['هاسل', 'hustle', 'grind', 'گرایند'],
      weakSafe: true,
      hints: ['کار', 'موفقیت', 'شب بیداری', 'work', 'success'],
      fa: 'فرهنگ «کار بی‌وقفه» (هاسل کالچر) می‌گوید موفقیت فقط با تلاش شبانه‌روزی و قربانی کردن خواب و تفریح به دست می‌آید. در اوایل دهه‌ی ۲۰۲۰ این نگاه خیلی تبلیغ می‌شد، اما حالا نسل جوان آن را نقد می‌کند: کار زیاد بدون استراحت، فرسودگی می‌آورد، نه موفقیت. تعادل، یعنی کار منظم به اضافه‌ی استراحت واقعی، پایدارتر از دویدن بی‌وقفه است.',
      en: 'Hustle culture claims success comes only from working around the clock and sacrificing sleep and fun. It was heavily marketed in the early 2020s, but younger generations now push back: overwork without rest produces burnout, not success. Balance, meaning regular work plus real rest, is more sustainable than nonstop grinding.'
    },
    {
      id: 'mental_health_terms',
      keywords: [
        'gaslighting یعنی چی',
        'burnout یعنی چی',
        'boundaries یعنی چی',
        'واژگان سلامت روان',
        'what is gaslighting',
        'what is burnout',
        'therapy speak'
      ],
      weak: ['gaslighting', 'burnout', 'boundaries', 'تراپی تاک', 'ghosting'],
      weakSafe: true,
      hints: ['سلامت روان', 'روان', 'mental health', 'روانشناسی', 'therapy'],
      fa: 'نسل زد درباره‌ی سلامت روان با دقت و واژگان حرفه‌ای‌تر صحبت می‌کند: «گس‌لایتینگ» یعنی زیر سؤال بردن واقعیت و ادراک طرف مقابل، «برن‌اوت» یعنی فرسودگی جسمی و روانی از فشار بلندمدت، «باندری» یعنی مرزی که برای حفظ سلامتی‌ات تعیین می‌کنی، و «تراما دامپینگ» یعنی ریختن سنگین تجربه‌های تلخ روی کسی بدون آمادگی او. خوب است این واژه‌ها را بشناسی، اما برچسب زدن سریع به هر رفتار، خودش می‌تواند رابطه‌ها را سخت کند.',
      en: 'Gen Z talks about mental health with real clinical vocabulary: "gaslighting" means undermining someone’s grip on reality, "burnout" is the physical and mental exhaustion from prolonged pressure, "boundaries" are the limits you set to protect your wellbeing, and "trauma dumping" means unloading heavy experiences on someone without their consent. Knowing these words helps, but labeling every behavior quickly can itself strain relationships.'
    },
    {
      id: 'internet_memes',
      keywords: [
        'میم یعنی چی',
        'میم چیه',
        'اینترنت میم',
        'what is a meme',
        'internet meme'
      ],
      weak: ['میم', 'meme', 'میمز', 'memes'],
      weakSafe: true,
      hints: [
        'اینترنت',
        'شوخی',
        'جوک',
        'شبکه اجتماعی',
        'internet',
        'joke',
        'funny'
      ],
      fa: 'میم یک تصویر، ویدیو یا متن طنز است که سریع بین مردم دست به دست می‌شود و معمولاً نسخه‌های مختلفی از آن ساخته می‌شود. میم‌ها در ایران هم خیلی محبوب‌اند: از شوخی با گرانی و تورم (مثل شوخی‌های «قِروون و تومن») تا ترکیب شعر کلاسیک با اصطلاحات اینترنتی. میم فقط سرگرمی نیست، برای خیلی‌ها راهی برای کنار آمدن با فشارهای زندگی روزمره است.',
      en: 'A meme is an image, video, or text joke that spreads quickly between people and usually gets remixed into many versions. Memes are hugely popular everywhere: in Iran they range from jokes about inflation and expensive prices to mashups of classical poetry with internet slang. A meme is not just entertainment; for many people it is a way of coping with daily pressures.'
    },
    {
      id: 'half_space',
      keywords: [
        'نیمفاصله',
        'نیم فاصله',
        'نیم‌فاصله',
        'half space persian',
        'what is the half space in persian'
      ],
      weak: ['نیمفاصله', 'نیم فاصله', 'زنجیر', 'zwnj', 'نیم‌فاصله'],
      weakSafe: true,
      hints: ['فارسی', 'نوشتن', 'املای', 'persian', 'writing'],
      fa: 'نیم‌فاصله (ZWNJ) یک کاراکتر نامرئی است که در فارسی دو جزء یک واژه را به هم می‌چسباند بی‌آنکه کاملاً جدا باشند؛ مثل «دست‌ها» و «می‌روم». هر سه شکل «دست‌ها»، «دست‌ها» با فاصله و «دست‌ها» بدون فاصله یک معنی دارند، اما شکل استاندارد و رسمی، نیم‌فاصله است. خیلی از مردم به خاطر تایپ راحت‌تر یا نداشتن حوصله از آن صرف‌نظر می‌کنند، و این کاملاً قابل درک است؛ فقط در متن‌های رسمی بهتر است رعایت شود.',
      en: 'The half-space (ZWNJ) is an invisible character that keeps two parts of a Persian word attached but visibly separated, as in "می‌روم" (I go). Writing "دست‌ها" with a half-space, with a full space, or fully joined all mean the same thing, but the half-space is the standard formal form. Many people skip it for speed or convenience, which is understandable; it matters most in formal writing.'
    },
    {
      id: 'ezafe_y',
      keywords: [
        'ی اضافه',
        'ی میانی',
        'کسره اضافه',
        'دروازه ی',
        'ezafe persian',
        'persian ezafe'
      ],
      weak: ['ی اضافه', 'ezafe', 'کسره', 'اضافه'],
      weakSafe: true,
      hints: ['فارسی', 'نوشتن', 'دستور', 'persian', 'grammar'],
      fa: '«ی» اضافه (کسره‌ی اضافه) در فارسی دو اسم را به هم وصل می‌کند: «دروازه‌ی جهنم» یعنی دروازه‌ی متعلق به جهنم. در نوشتار، گاهی این «ی» نوشته می‌شود (دروازه‌ی)، گاهی با فاصله (دروازه ی) و گاهی حذف می‌شود (دروازه جهنم)؛ هر سه درست فهمیده می‌شوند. قاعده‌ی ساده: اگر می‌خواهی بنویسی، «ی» چسبیده با نیم‌فاصله استاندارد است، و در گفتار همه‌جا هست.',
      en: 'The ezafe (kasra-ye ezafe) links two nouns in Persian: "دروازه‌ی جهنم" means the gate of hell. In writing, the linking "y" is sometimes written attached (دروازه‌ی), sometimes spaced (دروازه ی), and sometimes dropped (دروازه جهنم); all three are understood. The simple rule: in writing, the attached form with a half-space is standard, and in speech the sound is always there.'
    },
    {
      id: 'tanwin',
      keywords: [
        'تنوین',
        'تنوین عربی',
        'ً چیست',
        'tanwin persian',
        'arabic tanwin'
      ],
      weak: ['تنوین', 'tanwin', 'تنوین'],
      weakSafe: true,
      hints: [
        'فارسی',
        'عربی',
        'اعراب',
        'نوشتن',
        'persian',
        'arabic',
        'diacritic'
      ],
      fa: 'تنوین یک اعراب عربی است که به انتهای کلمه اضافه می‌شود و صدای «َن، ِن، ُن» می‌دهد؛ در فارسی فقط در کلمات قرضی مثل «مثلاً» و «حقیقتاً» دیده می‌شود. در نوشتار روزمره‌ی فارسی، خیلی‌ها آن را نمی‌نویسند و این عادی است؛ اما در متن رسمی، نوشتن «ً» در کلماتی مثل «مثلاً» پسندیده‌تر است. معنی کلمه بدون آن هم کاملاً روشن است.',
      en: 'Tanwin is an Arabic diacritic added to a word’s end that produces an "an, in, un" sound; in Persian it appears only in borrowed words such as "مثلاً" (for example). In everyday Persian writing, most people omit it, which is completely normal; in formal text, writing the tanwin in words like "مثلاً" is more polished. The meaning is perfectly clear without it.'
    },
    {
      id: 'persian_insults',
      keywords: [
        'فحش فارسی',
        'توهین های فارسی',
        'فرهنگ فحش',
        'persian swear words',
        'persian insults',
        'what does koskesh mean'
      ],
      weak: [
        'کصکش',
        'کسکش',
        'جنده',
        'قحبه',
        'فاحشه',
        'دیوث',
        'حرومزاده',
        'حرامزاده',
        'کیر',
        'کونی',
        'پدرسوخته',
        'بی‌غیرت',
        'بیغیرت',
        'فحش',
        'توهین'
      ],
      weakSafe: true,
      hints: ['فارسی', 'ایرانی', 'معنی', 'یعنی', 'persian', 'slang', 'swear'],
      fa: 'این کلمه‌ها جزو فحش‌های سنگین و رکیک زبان محاوره‌ای فارسی‌اند و ریشه‌شان به توهین به خانواده یا هویت طرف مقابل برمی‌گردد؛ مثل «کصکش» که از ترکیب دو واژه‌ی بسیار زشت ساخته شده و شدیدترین توهین‌ها محسوب می‌شود. من معنی‌شان را می‌دانم تا بتوانم درست واکنش نشان بدهم، اما هیچ‌وقت ازشان استفاده نمی‌کنم. اگر کسی این کلمه‌ها را می‌گوید، معمولاً از شدت خشم یا ناامیدی است، نه از روی دایره‌ی واژگان غنی؛ و تو هم اگر عصبانی‌ای، نیازی به این‌ها نداری.',
      en: 'These words are among the harshest vulgar insults in colloquial Persian, and their roots usually attack the other person’s family or identity; "کصکش" (koskesh) is built from two extremely crude words and counts as one of the worst. I know what they mean so I can respond properly, but I will never use them. When someone uses them, it is usually raw anger or despair speaking, not a rich vocabulary; and if you are angry, you do not need them either.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
