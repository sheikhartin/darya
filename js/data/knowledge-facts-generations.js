/**
 * Darya - curated factual entries (generations, era trends, and learning).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'generations_overview',
      keywords: [
        'نسل ها',
        'نسل‌ها',
        'تفاوت نسل ها',
        'فرق نسل ها',
        'نسل ها چه فرقی',
        'نسل ایکس و زد',
        'generations',
        'generation differences',
        'baby boomers gen x millennials'
      ],
      weak: ['نسل', 'بومر', 'generation', 'boomers'],
      weakSafe: true,
      hints: ['تفاوت', 'چیه', 'مرور', 'differences', 'what', 'overview'],
      fa: 'نسل‌ها بر اساس سال تولد دسته‌بندی می‌شوند و هر کدام با فناوری و اقتصاد زمان خودش شکل گرفته است: نسل خاموش (تا حدود ۱۹۴۵)، بیبی‌بومرها (۱۹۴۶ تا ۱۹۶۴)، نسل ایکس (۱۹۶۵ تا ۱۹۸۰)، هزاره‌ها یا نسل وای (۱۹۸۱ تا ۱۹۹۶)، نسل زد (۱۹۹۷ تا ۲۰۱۲) و نسل آلفا (۲۰۱۳ به بعد). مرزها دقیق نیستند و تفاوت‌های فردی همیشه از برچسب نسل مهم‌تر است.',
      en: 'Generations are grouped by birth years, and each was shaped by the technology and economy of its time: the Silent Generation (to about 1945), Baby Boomers (1946 to 1964), Gen X (1965 to 1980), Millennials or Gen Y (1981 to 1996), Gen Z (1997 to 2012), and Gen Alpha (2013 onward). The borders are not exact, and individual differences always matter more than a generation label.'
    },
    {
      id: 'boomers',
      keywords: [
        'بیبی بومر',
        'نسل بومر',
        'بومرها',
        'بومر ها',
        'بومر',
        'baby boomers',
        'boomer generation'
      ],
      weak: ['بومر', 'boomers', 'boomer'],
      weakSafe: true,
      hints: ['نسل', 'چیه', 'generation', 'what', 'who'],
      fa: 'بیبی‌بومرها نسلی هستند که بعد از جنگ جهانی دوم (۱۹۴۶ تا ۱۹۶۴) در موج زادوولد متولد شدند. با رشد اقتصادی و رفاه نسبی بزرگ شدند و بسیاری‌شان خانه و شغل پایدار داشتند. حالا در آستانه‌ی بازنشستگی‌اند و جمعیت زیادشان اقتصاد، بهداشت و سیاست کشورها را تحت تأثیر قرار داده است.',
      en: 'Baby Boomers are the generation born in the post-war birth wave (1946 to 1964). They grew up with economic growth and relative prosperity, and many had stable jobs and home ownership. They are now near or in retirement, and their large numbers have shaped the economy, healthcare, and politics of their countries.'
    },
    {
      id: 'gen_x',
      keywords: ['نسل ایکس', 'نسل x', 'gen x', 'generation x'],
      weak: ['نسل ایکس', 'نسل x', 'gen x'],
      weakSafe: true,
      hints: ['نسل', 'چیه', 'generation', 'what', 'who'],
      fa: 'نسل ایکس (۱۹۶۵ تا ۱۹۸۰) کودکی‌اش را بدون اینترنت گذراند و بزرگسالی‌اش را با پیدایش کامپیوتر و موبایل. گاهی «نسل فراموش‌شده» خوانده می‌شود چون بین بومرهای پرجمعیت و هزاره‌های پرسروصدا قرار گرفته. به استقلال و تعادل کار و زندگی معروف است و حالا بخش بزرگی از مدیران و رهبران سازمان‌ها را تشکیل می‌دهد.',
      en: 'Gen X (1965 to 1980) spent childhood without the internet and adulthood with the rise of computers and mobile phones. It is sometimes called the "forgotten generation" because it sits between the large Boomers and the loud Millennials. It is known for independence and work-life balance, and it now makes up much of the leadership in organizations.'
    },
    {
      id: 'millennials',
      keywords: [
        'نسل وای',
        'نسل هزاره',
        'هزاره ها',
        'millennials',
        'gen y',
        'millennial generation'
      ],
      weak: ['هزاره', 'نسل وای', 'millennials', 'gen y'],
      weakSafe: true,
      hints: ['نسل', 'چیه', 'generation', 'what', 'who'],
      fa: 'هزاره‌ها یا نسل وای (۱۹۸۱ تا ۱۹۹۶) با رشد اینترنت، موبایل و شبکه‌های اجتماعی بزرگ شدند. دوران بزرگسالی‌شان با بحران مالی ۲۰۰۸، اجاره‌های گران و بازار کار رقابتی همراه بود و به همین دلیل بعضی‌شان خرید خانه و ازدواج را دیرتر شروع کردند. به معنای کار و ارزش‌ها اهمیت می‌دهند و اولین نسل واقعاً دیجیتال خوانده می‌شوند.',
      en: 'Millennials or Gen Y (1981 to 1996) grew up with the rise of the internet, mobile phones, and social media. Their adulthood coincided with the 2008 financial crisis, expensive rents, and a competitive job market, so many bought homes and married later. They care about work that has meaning and are called the first truly digital generation.'
    },
    {
      id: 'gen_z',
      keywords: ['نسل زد', 'نسل z', 'جن زد', 'gen z', 'generation z'],
      weak: ['نسل زد', 'نسل z', 'جن زد', 'gen z'],
      weakSafe: true,
      hints: ['نسل', 'چیه', 'generation', 'what', 'who'],
      fa: 'نسل زد (۱۹۹۷ تا ۲۰۱۲) اولین نسلی است که از ابتدا با اینترنت و گوشی هوشمند بزرگ شد. تیک‌تاک، یوتیوب و اینستاگرام رسانه‌ی اصلی‌اش است و برای خرید، خبر و یادگیری به شبکه‌های اجتماعی اعتماد می‌کند. به سلامت روان، اصالت و عدالت اجتماعی حساس است و زبانی پر از اسلنگ اینترنتی دارد.',
      en: 'Gen Z (1997 to 2012) is the first generation raised from the start with the internet and smartphones. TikTok, YouTube, and Instagram are its main media, and it trusts social networks for shopping, news, and learning. It is sensitive about mental health, authenticity, and social justice, and its language is full of internet slang.'
    },
    {
      id: 'gen_alpha',
      keywords: ['نسل آلفا', 'نسل الفا', 'gen alpha', 'generation alpha'],
      weak: ['نسل آلفا', 'نسل الفا', 'gen alpha'],
      weakSafe: true,
      hints: ['نسل', 'چیه', 'بچه', 'generation', 'what', 'kids'],
      fa: 'نسل آلفا (۲۰۱۳ به بعد) فرزندان هزاره‌هاست و اولین نسلی است که هوش مصنوعی، دستیار صوتی و واقعیت افزوده را از کودکی تجربه می‌کند. خیلی‌هایشان پیش از مدرسه با تبلت کار کرده‌اند و آموزش‌شان شخصی‌تر و دیجیتال‌تر است. چون هنوز در حال رشدند، ویژگی‌هایشان در حال شکل‌گیری است و پیش‌بینی قطعی درباره‌شان زود است.',
      en: 'Gen Alpha (2013 onward) are the children of Millennials and the first generation to experience AI, voice assistants, and augmented reality from childhood. Many used tablets before school, and their education is more personalized and digital. Because they are still growing up, their traits are still forming, and firm predictions about them are premature.'
    },
    {
      id: 'era_trends_90s',
      keywords: [
        'ترندهای دهه نود',
        'دهه ۹۰ میلادی',
        'فرهنگ دهه نود',
        '90s trends',
        '1990s culture',
        'nineties'
      ],
      weak: ['دهه نود', 'نود', '90s', 'nineties'],
      weakSafe: true,
      hints: ['ترند', 'فرهنگ', 'مد', 'trends', 'culture', 'fashion'],
      fa: 'دهه‌ی ۹۰ میلادی دوره‌ی جهانی‌شدن بود: اینترنت خانگی، موبایل اولیه و تلویزیون کابلی همه‌گیر شد و فرهنگ پاپ (موسیقی گرانج و پاپ، بازی‌های آرکید و کنسول‌های ۳۲ بیتی) جهانی شد. مد شلوارهای گشاد و رنگ‌های نئون، و اقتصاد با حباب دات‌کام به اوج و سقوط رسید. این دهه پل بین دنیای آنالوگ و دیجیتال است.',
      en: 'The 1990s were the decade of globalization: home internet, early mobile phones, and cable TV became common, and pop culture (grunge and pop music, arcade games, and 32-bit consoles) went global. Fashion had baggy pants and neon colors, and the economy peaked and crashed with the dot-com bubble. This decade is the bridge between the analog and digital worlds.'
    },
    {
      id: 'era_trends_2000s',
      keywords: [
        'ترندهای دهه ۲۰۰۰',
        'دهه هشتاد میلادی',
        'فرهنگ 2000s',
        '2000s trends',
        '2000s culture'
      ],
      weak: ['دهه ۲۰۰۰', '2000s', 'هزاره سوم'],
      weakSafe: true,
      hints: ['ترند', 'فرهنگ', 'مد', 'trends', 'culture', 'fashion'],
      fa: 'دهه‌ی ۲۰۰۰ با انفجار وب ۲.۰ شروع شد: وبلاگ‌ها، مای‌اسپیس و بعد فیسبوک و یوتیوب، و موبایل با بلک‌بری و بعد آیفون (۲۰۰۷) همه‌گیر شد. موسیقی دانلودی (آی‌پاد) جای سی‌دی را گرفت و بحران مالی ۲۰۰۸ اقتصاد جهان را لرزاند. این دهه شبکه‌های اجتماعی را به بخش اصلی زندگی تبدیل کرد.',
      en: 'The 2000s began with the Web 2.0 explosion: blogs, MySpace, then Facebook and YouTube, and mobile phones went mainstream with BlackBerry and then the iPhone (2007). Downloaded music (iPod) replaced CDs, and the 2008 financial crisis shook the world economy. This decade made social networks a central part of life.'
    },
    {
      id: 'era_trends_2010s',
      keywords: [
        'ترندهای دهه ۲۰۱۰',
        'دهه نود شمسی',
        'فرهنگ 2010s',
        '2010s trends',
        '2010s culture'
      ],
      weak: ['دهه ۲۰۱۰', '2010s', 'دهه نود شمسی'],
      weakSafe: true,
      hints: ['ترند', 'فرهنگ', 'مد', 'trends', 'culture', 'fashion'],
      fa: 'دهه‌ی ۲۰۱۰ عصر گوشی هوشمند و اپ‌ها بود: اینستاگرام، اسنپ‌چت و واتس‌اپ بخشی از روزمره شدند و استریم (نتفلیکس و اسپاتیفای) جای دانلود را گرفت. اقتصاد گیگ (اسنپ و اوبر) رشد کرد، ارز دیجیتال و بلاک‌چین سر زبان‌ها افتاد و هوش مصنوعی به‌تدریج وارد محصولات روزمره شد. استارتاپ‌های تک‌شاخ (unicorn) و دورکاری هم همین دهه رایج شدند.',
      en: 'The 2010s were the smartphone and app era: Instagram, Snapchat, and WhatsApp became daily life, and streaming (Netflix and Spotify) replaced downloads. The gig economy (Uber and similar) grew, cryptocurrency and blockchain entered the mainstream, and AI gradually moved into everyday products. Unicorn startups and remote work also became common in this decade.'
    },
    {
      id: 'era_trends_2020s',
      keywords: [
        'ترندهای دهه ۲۰۲۰',
        'ترند 2026',
        'فرهنگ 2020s',
        '2020s trends',
        'trends 2026'
      ],
      weak: ['دهه ۲۰۲۰', '2020s', 'ترند 2026'],
      weakSafe: true,
      hints: ['ترند', 'فرهنگ', 'هوش مصنوعی', 'trends', 'culture', 'ai'],
      fa: 'دهه‌ی ۲۰۲۰ با همه‌گیری کرونا و جهش دورکاری شروع شد و بعد از ۲۰۲۲ با موج هوش مصنوعی مولد (چت‌جی‌پی‌تی و ابزارهای ساخت تصویر و ویدیو) دگرگون شد. تیک‌تاک و ویدیوی کوتاه غالب شدند، کار ترکیبی عادی شد و بحث‌ها درباره‌ی اثر هوش مصنوعی بر شغل‌ها، محتوا و حقیقت همه‌گیر شد. مشخصه‌ی این دهه، ورود هوش مصنوعی به ابزار روزمره است.',
      en: 'The 2020s began with the pandemic and a leap toward remote work, then transformed after 2022 with the wave of generative AI (ChatGPT and image and video tools). TikTok and short video became dominant, hybrid work became normal, and debates about AI’s effect on jobs, content, and truth went mainstream. The decade’s defining trait is AI entering everyday tools.'
    },
    {
      id: 'lecture_guide',
      keywords: [
        'چطور تدریس کنم',
        'چطور سخنرانی کنم',
        'ارائه دادن',
        'ارایه دادن',
        'چطور کلاس بگذارم',
        'how to give a lecture',
        'how to teach',
        'how to present',
        'public speaking tips'
      ],
      weak: [
        'تدریس',
        'سخنرانی',
        'ارائه',
        'lecture',
        'teaching',
        'presentation'
      ],
      weakSafe: true,
      hints: ['چطور', 'چگونه', 'یاد بدهم', 'how', 'tips', 'speaking'],
      fa: 'یک تدریس یا سخنرانی خوب سه بخش دارد: اول بگو چه می‌خواهی بگویی (نقشه)، بعد بگو (بدنه با مثال و داستان)، آخر جمع‌بندی کن. مخاطب را درگیر کن (سؤال، مثال واقعی، مکث) و به‌جای اسلایدهای شلوغ، یک ایده در هر اسلاید. مهم‌تر از همه تمرین است: بلند تمرین کن و زمان بگیر؛ اعتماد از تمرین می‌آید، نه از حفظ کردن کلمه‌به‌کلمه.',
      en: 'A good lecture or talk has three parts: first say what you will say (the map), then say it (the body with examples and stories), and finally summarize. Engage the audience (questions, real examples, pauses) and keep one idea per slide instead of crowded slides. Most important is practice: rehearse out loud and time yourself; confidence comes from practice, not from memorizing word for word.'
    },
    {
      id: 'learning_methods',
      keywords: [
        'چطور یاد بگیرم',
        'روش یادگیری',
        'یادگیری عمیق',
        'چطور مهارت جدید یاد بگیرم',
        'how to learn a new skill',
        'learning methods',
        'how to learn faster'
      ],
      weak: ['یادگیری', 'مهارت', 'learning', 'skill'],
      weakSafe: true,
      hints: ['چطور', 'چگونه', 'روش', 'how', 'method', 'new'],
      fa: 'برای یادگیری هر مهارت جدید، این چرخه جواب می‌دهد: هدف کوچک و روشن بگذار، مطلب را فعال یاد بگیر (یادداشت و توضیح به خودت)، بلافاصله تمرین کن، بازخورد واقعی بگیر و اشتباه را اصلاح کن. یادگیری عمیق یعنی وصل کردن چیز جدید به چیزی که بلدی، و تکرار فاصله‌دار تا در حافظه بماند. بیست دقیقه‌ی روزانه بهتر از چند ساعت یک‌باره است.',
      en: 'To learn any new skill, this loop works: set a small clear goal, learn actively (notes and explaining to yourself), practice immediately, get real feedback, and correct the mistake. Deep learning means connecting the new thing to what you already know, with spaced repetition to keep it in memory. Twenty minutes daily beats several hours at once.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
