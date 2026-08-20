/**
 * Darya - curated factual entries (social media and platforms).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'reddit',
      keywords: [
        'ردیت',
        'ردیت چیه',
        'ساب ردیت',
        'what is reddit',
        'reddit what is it'
      ],
      weak: ['ردیت', 'سابردیت', 'reddit', 'subreddit'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'شبکه', 'what', 'forum', 'انجمن'],
      fa: 'ردیت شبکه‌ای از انجمن‌های تخصصی به نام ساب‌ردیت است که هرکدام حول یک موضوع (علم، فیلم، برنامه‌نویسی، آشپزی) شکل گرفته‌اند. کاربران با رأی بالا و پایین محتوا را مرتب می‌کنند و بحث‌ها معمولاً عمیق‌تر از شبکه‌های تصویری است. از زمان راه‌اندازی در ۲۰۰۵ به یکی از بزرگ‌ترین منابع سؤال‌وجواب، میم و خبرهای اولیه تبدیل شده است.',
      en: 'Reddit is a network of topic communities called subreddits, each built around a subject like science, movies, programming, or cooking. Users rank content with up and down votes, and discussions tend to run deeper than on visual networks. Since launching in 2005 it became one of the largest sources of Q&A, memes, and early news.'
    },
    {
      id: 'facebook_meta',
      keywords: [
        'فیسبوک',
        'فیس بوک',
        'متا',
        'مارک زاکربرگ',
        'facebook',
        'meta platforms',
        'mark zuckerberg',
        'what is meta'
      ],
      weak: ['فیسبوک', 'فیس بوک', 'متا', 'facebook', 'meta'],
      weakSafe: true,
      hints: ['شبکه', 'کمپانی', 'social', 'company', 'what'],
      fa: 'فیسبوک در ۲۰۰۴ توسط مارک زاکربرگ و هم‌کلاسی‌هایش از دانشگاه هاروارد شروع شد و بزرگ‌ترین شبکه‌ی اجتماعی جهان شد. در ۲۰۲۱ شرکت مادر نامش را به «متا» تغییر داد تا تمرکز روی «متاورس» و واقعیت مجازی را نشان دهد و مالک اینستاگرام، واتس‌اپ و آکیولوس هم هست. با رشد نسل‌های جوان‌تر به سمت تیک‌تاک و اینستاگرام، پایگاه کاربری فیسبوک میانگین سنی بالاتری پیدا کرده است.',
      en: 'Facebook started in 2004 from Mark Zuckerberg’s Harvard dorm and became the world’s largest social network. In 2021 the parent company renamed itself Meta to signal a focus on the metaverse and virtual reality, and it also owns Instagram, WhatsApp, and Oculus. As younger users moved to TikTok and Instagram, Facebook’s user base grew older on average.'
    },
    {
      id: 'google_platform',
      keywords: [
        'گوگل',
        'کمپانی گوگل',
        'تاریخچه گوگل',
        'google',
        'google company',
        'what is google'
      ],
      weak: ['گوگل', 'google'],
      weakSafe: true,
      hints: ['کمپانی', 'جستجو', 'company', 'search', 'what', 'history'],
      fa: 'گوگل از یک موتور جستجوی دانشگاهی در ۱۹۹۸ شروع شد و به یکی از بزرگ‌ترین شرکت‌های فناوری جهان تبدیل شد. علاوه بر جستجو، مالک یوتیوب، اندروید، کروم، نقشه‌ی گوگل و جی‌میل است و در هوش مصنوعی و رایانش ابری سرمایه‌گذاری سنگینی کرده است. شرکت مادرش «آلفابت» است و درآمد اصلی‌اش هنوز از تبلیغات می‌آید.',
      en: 'Google began as a university search engine in 1998 and became one of the largest technology companies in the world. Besides search, it owns YouTube, Android, Chrome, Google Maps, and Gmail, and it has invested heavily in AI and cloud computing. Its parent company is Alphabet, and advertising is still its main revenue.'
    },
    {
      id: 'google_plus',
      keywords: [
        'گوگل پلاس',
        'گوگل پلاس چیه',
        'چرا گوگل پلاس بسته شد',
        'google plus',
        'google+',
        'why did google plus shut down'
      ],
      weak: ['گوگل پلاس', 'google plus', 'google+'],
      weakSafe: true,
      hints: ['شبکه', 'بسته', 'social', 'shut', 'what', 'چرا'],
      fa: 'گوگل پلاس تلاش گوگل در سال ۲۰۱۱ برای رقابت با فیسبوک بود که با مفهوم «حلقه‌ها» برای اشتراک‌گذاری گروهی معرفی شد. هیچ‌وقت نتوانست کاربر فعال پایدار جذب کند و پس از یک مشکل امنیتی در ۲۰۱۸ و افشای داده‌ها، در سال ۲۰۱۹ برای کاربران عادی بسته شد. نمونه‌ی معروفی از شبکه‌ی اجتماعی است که با وجود پشتوانه‌ی بزرگ شکست خورد.',
      en: 'Google+ was Google’s 2011 attempt to compete with Facebook, introduced with the concept of "Circles" for sharing with groups. It never gained a lasting active user base, and after a security flaw and data disclosure in 2018 it was shut down for consumers in 2019. It is a famous example of a social network that failed despite a huge company behind it.'
    },
    {
      id: 'whatsapp',
      keywords: [
        'واتس اپ',
        'واتساپ',
        'واتساپ چیه',
        'what is whatsapp',
        'whatsapp'
      ],
      weak: ['واتس اپ', 'واتساپ', 'whatsapp'],
      weakSafe: true,
      hints: ['پیام', 'پیام رسان', 'messaging', 'app', 'what', 'چیه'],
      fa: 'واتس‌اپ پیام‌رسان محبوبی است که در ۲۰۰۹ شروع شد و در ۲۰۱۴ توسط فیسبوک (حالا متا) خریده شد. پیام‌ها با رمزنگاری سرتاسری محافظت می‌شوند، یعنی فقط فرستنده و گیرنده می‌توانند بخوانند. تماس صوتی و تصویری و استوری دارد و در بسیاری از کشورها پیام‌رسان اصلی است.',
      en: 'WhatsApp is a popular messaging app that started in 2009 and was bought by Facebook (now Meta) in 2014. Messages are protected with end-to-end encryption, meaning only the sender and receiver can read them. It has voice and video calls and stories, and it is the main messenger in many countries.'
    },
    {
      id: 'signal_app',
      keywords: [
        'سیگنال',
        'اپ سیگنال',
        'سیگنال چیه',
        'signal app',
        'what is signal'
      ],
      weak: ['سیگنال', 'signal'],
      weakSafe: true,
      hints: ['پیام رسان', 'امن', 'messaging', 'secure', 'what', 'چیه'],
      fa: 'سیگنال پیام‌رسانی است که حریم خصوصی را مهم‌ترین ویژگی خودش می‌داند: رمزنگاری سرتاسری پیش‌فرض برای همه‌ی پیام‌ها و تماس‌ها، جمع‌آوری حداقلی داده و متن‌باز بودن کد. توسط بنیاد غیرانتفاعی سیگنال اداره می‌شود و به مدل کسب‌وکار تبلیغاتی وابسته نیست. بعد از به‌روزرسانی‌های بحث‌برانگیز واتس‌اپ، کاربران زیادی به آن کوچ کردند.',
      en: 'Signal is a messenger that makes privacy its main feature: end-to-end encryption by default for all messages and calls, minimal data collection, and open-source code. It is run by the nonprofit Signal Foundation and does not depend on an advertising business model. After controversial WhatsApp policy updates, many users moved to it.'
    },
    {
      id: 'x_twitter',
      keywords: [
        'توییتر چیه',
        'ایکس توییتر',
        'ایلان ماسک توییتر',
        'x formerly twitter',
        'what is twitter',
        'elon musk twitter'
      ],
      weak: ['توییتر', 'ایکس', 'twitter', 'x platform'],
      weakSafe: true,
      hints: ['شبکه', 'ماسک', 'social', 'musk', 'what', 'چیه'],
      fa: 'توییتر در ۲۰۰۶ شروع شد و با پیام‌های کوتاه (اول ۱۴۰ و بعداً ۲۸۰ نویسه) به میدان گفتگوی لحظه‌ای دنیا تبدیل شد؛ خبرنگاران، سیاستمداران و چهره‌های عمومی آن را دوست داشتند. در ۲۰۲۲ ایلان ماسک آن را خرید و نامش را به «ایکس» تغییر داد و تغییرات بحث‌برانگیزی مثل اشتراک پولی اعمال کرد. هنوز جای اصلی بحث‌های همگانی و اخبار فوری است.',
      en: 'Twitter launched in 2006 and, with short posts (first 140 then 280 characters), became the world’s real-time town square, loved by journalists, politicians, and public figures. In 2022 Elon Musk bought it, renamed it X, and made controversial changes such as paid subscriptions. It remains a main place for public debate and breaking news.'
    },
    {
      id: 'discord',
      keywords: [
        'دیسکورد',
        'دیسکورد چیه',
        'سرور دیسکورد',
        'what is discord',
        'discord server'
      ],
      weak: ['دیسکورد', 'discord'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'گیم', 'what', 'gaming', 'voice'],
      fa: 'دیسکورد پلتفرم چت صوتی و متنی است که اول برای گیمرها ساخته شد و بعد به جامعه‌های مختلف (درس، موسیقی، برنامه‌نویسی) گسترش یافت. هر «سرور» مجموعه‌ای از کانال‌هاست و تماس صوتی گروهی با تأخیر کم دارد. برای گروه‌های آنلاین و جوامع کوچک عملاً استاندارد شده است.',
      en: 'Discord is a voice and text chat platform built first for gamers and later spread to all kinds of communities, from study groups to music and programming. Each "server" is a collection of channels, with low-latency group voice calls. It has become the de facto standard for online groups and small communities.'
    },
    {
      id: 'linkedin',
      keywords: ['لینکدین', 'لینکدین چیه', 'what is linkedin', 'linkedin'],
      weak: ['لینکدین', 'linkedin'],
      weakSafe: true,
      hints: ['شبکه', 'کار', 'رزومه', 'professional', 'job', 'چیه', 'what'],
      fa: 'لینکدین شبکه‌ی اجتماعی حرفه‌ای است که در ۲۰۰۳ شروع شد و برای رزومه‌ی آنلاین، کاریابی و ارتباط‌های شغلی استفاده می‌شود. استخدام‌کننده‌ها آن را برای پیدا کردن نیرو می‌گردند و پروفایل قوی (عنوان روشن، تجربه‌ها، مهارت‌ها و توصیه‌ها) شانس دیده‌شدن را زیاد می‌کند. در ۲۰۱۶ توسط مایکروسافت خریده شد.',
      en: 'LinkedIn is the professional social network that started in 2003 and is used for online resumes, job hunting, and career connections. Recruiters search it to find candidates, and a strong profile (clear headline, experience, skills, and recommendations) raises your chances of being seen. Microsoft bought it in 2016.'
    },
    {
      id: 'snapchat',
      keywords: ['اسنپ چت', 'اسنپ چت چیه', 'snapchat', 'what is snapchat'],
      weak: ['اسنپ چت', 'snapchat'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'استوری', 'what', 'stories', 'filters'],
      fa: 'اسنپ‌چت در ۲۰۱۱ با ایده‌ی پیام‌های ناپدیدشونده شروع شد: عکس‌ها و ویدیوها بعد از دیده‌شدن پاک می‌شوند. مفهوم «استوری» (محتوای ۲۴ ساعته) و فیلترهای صورت را این اپ فراگیر کرد و بعداً اینستاگرام و بقیه از آن کپی کردند. بین نوجوانان و جوانان آمریکای شمالی محبوبیت زیادی دارد.',
      en: 'Snapchat started in 2011 with the idea of disappearing messages: photos and videos vanish after being viewed. It popularized the "stories" concept (24-hour content) and face filters, which Instagram and others later copied. It is very popular among teens and young adults in North America.'
    },
    {
      id: 'twitch',
      keywords: [
        'توییچ',
        'توییچ چیه',
        'استریم',
        'what is twitch',
        'twitch streaming'
      ],
      weak: ['توییچ', 'استریم', 'twitch', 'streaming'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'گیم', 'what', 'gaming', 'live'],
      fa: 'توییچ پلتفرم پخش زنده است که با استریم بازی‌های ویدیویی بزرگ شد و بعد به موسیقی، گفتگو و رویدادهای زنده گسترش یافت. استریمرها با اشتراک، دونیت و تبلیغات درآمد می‌گیرند و چت زنده بخش اصلی تجربه است. در ۲۰۱۴ توسط آمازون خریده شد.',
      en: 'Twitch is a live-streaming platform that grew up around video-game streams and later expanded into music, talk shows, and live events. Streamers earn from subscriptions, donations, and ads, and live chat is central to the experience. Amazon bought it in 2014.'
    },
    {
      id: 'youtube_platform',
      keywords: [
        'یوتیوب چیه',
        'تاریخچه یوتیوب',
        'what is youtube',
        'youtube history'
      ],
      weak: ['یوتیوب', 'youtube'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'ویدیو', 'what', 'video', 'history'],
      fa: 'یوتیوب در ۲۰۰۵ شروع شد و بزرگ‌ترین پلتفرم ویدیوی جهان شد؛ در ۲۰۰۶ گوگل آن را خرید. از ویدیوهای آموزشی و موزیک تا پخش زنده و ویدیوهای کوتاه (Shorts) همه‌چیز دارد و برای خیلی از سازندگان منبع درآمد از تبلیغات و اشتراک است. در ایران هم با وجود فیلترینگ، یکی از پرکاربردترین سرویس‌های ویدیویی است.',
      en: 'YouTube started in 2005 and became the world’s largest video platform; Google bought it in 2006. It spans educational and music videos, live streaming, and short-form Shorts, and it is an income source for many creators through ads and memberships. It is among the most used video services worldwide.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
