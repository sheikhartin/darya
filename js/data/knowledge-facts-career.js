/**
 * Darya - curated factual entries (career domain).
 * Job-market guidance for 2026 and beyond: the skills-based hiring shift,
 * which fields are growing, and how to pivot careers later in life.
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'career_2026',
      keywords: [
        'شغل آینده',
        'بازار کار ۲۰۲۶',
        'شغل های آینده',
        'شغل‌های آینده',
        'مهارت های پرتقاضا',
        'مهارت‌های پرتقاضا',
        'آینده شغلی',
        'بازار کار سال ۲۰۲۶',
        'آینده دارترین شغل ها',
        'آینده‌دارترین شغل‌ها',
        'کدوم شغل ها آینده دارن',
        'jobs of the future',
        'career trends',
        'career trends 2026',
        'career trends for 2026',
        'career trends in 2026',
        'in demand skills 2026',
        'in-demand skills 2026',
        'in demand jobs',
        'what jobs will be in demand',
        'future of work',
        'skills based hiring',
        'skills for the future',
        'future job market',
        'jobs in 2026',
        'job market 2026',
        // The transcript probes asked about 2030 («تا سال ۲۰۳۰ چه حرفه‌ای
        // خوبه», "what careers will be good by 2030?"); the future is
        // the same horizon, so both decades route to the same shelf.
        'تا سال ۲۰۳۰',
        'سال ۲۰۳۰',
        'تا ۲۰۳۰',
        'by 2030',
        'in 2030',
        'careers by 2030',
        'careers in 2030',
        'jobs in 2030',
        'jobs by 2030',
        'good careers in 2030',
        'what careers will be good in 2030',
        '2028',
        'jobs in 2028'
      ],
      weak: ['آینده', 'بازار کار', 'مهارت', 'پرتقاضا', 'future', 'in demand'],
      weakSafe: true,
      hints: [
        '۲۰۲۶',
        '2026',
        'شغل',
        'کار',
        'فناوری',
        'هوش مصنوعی',
        'career',
        'job',
        'tech',
        'ai',
        'healthcare'
      ],
      fa: 'بازار کار ۲۰۲۶ حول چند واقعیت می‌چرخد: استخدام‌ها بیشتر مهارت‌محور شده‌اند تا مدرک‌محور، هوش مصنوعی شغل‌ها را حذف نمی‌کند بلکه شکلشان را عوض می‌کند، و ترکیب مهارت فنی با مهارت انسانی (ارتباط، تفکر نقادانه) بیشترین ارزش را دارد. حوزه‌های در حال رشد:\\n۱. فناوری: هوش مصنوعی و یادگیری ماشین، علم داده، امنیت سایبری، مهندسی ابر.\\n۲. سلامت: پرستاری، فیزیوتراپی، تجهیزات تشخیصی؛ جمعیت سالمند تقاضای زیادی می‌سازد.\\n۳. مهارت‌های فنی: برق‌کاری، تاسیسات، تعمیر و نگهداری؛ کمبود نیرو زیاد است و درآمد خوب.\\n۴. خلاقیت و دیجیتال: طراحی تجربه کاربری، بازاریابی دیجیتال، تولید محتوا با کمک هوش مصنوعی.\\nبرای هر مسیری: نمونه‌کار واقعی از مدرک مهم‌تر است، یادگیری مستمر را بپذیر و با ابزارهای جدید راحت کار کن.',
      en: 'The 2026 job market turns on a few facts: hiring has become more skills-based than degree-based, AI is reshaping jobs rather than erasing them, and combining technical skills with human ones (communication, critical thinking) carries the most value. Growing fields:\\n1. Technology: AI and machine learning, data science, cybersecurity, cloud engineering.\\n2. Healthcare: nursing, physiotherapy, diagnostic technology; an aging population creates huge demand.\\n3. Skilled trades: electrical work, HVAC, maintenance; labor shortages are real and pay is good.\\n4. Creative and digital: UX design, digital marketing, content production assisted by AI.\\nFor any path: real portfolio work beats credentials, embrace continuous learning, and get comfortable working with new tools.'
    },
    {
      id: 'career_switch',
      keywords: [
        'تغییر مسیر شغلی',
        'عوض کردن شغل',
        'شغل عوض کنم',
        'شغل عوض کردن',
        'تغییر حرفه',
        'بعد از سی سالگی شغل عوض کنم',
        'در سی سالگی شغل عوض کنم',
        'شروع دوباره شغلی',
        'career change',
        'switch careers',
        'change careers',
        'change career',
        'too late to change careers',
        'is it too late to change careers',
        'changing careers later in life',
        'start a new career at 30',
        'second career',
        'retraining for a new job'
      ],
      weak: ['تغییر', 'مسیر شغلی', 'شغل', 'career', 'switch', 'retrain'],
      weakSafe: true,
      hints: [
        'عوض',
        'جدید',
        'شروع',
        'آینده',
        'change',
        'new',
        'start',
        'later',
        'thirty'
      ],
      fa: 'تغییر مسیر شغلی در هر سنی ممکن است، نه فقط در بیست‌سالگی؛ خیلی از مهارت‌های تو (ارتباط، مدیریت، حل مسئله) قابل انتقال‌اند. قدم اول خودشناسی است: چه چیزی دوست داری، در چه چیزی خوبی و چه چیزهایی دیگر برایت قابل تحمل نیست. بعد تحقیق کن: با آدم‌های همان شغل صحبت کن، یک دوره‌ی کوتاه و کم‌هزینه بگذران و یک پروژه‌ی کوچک بساز تا واقعیت کار را ببینی. تغییر تدریجی امن‌تر است: در کنار شغل فعلی مهارت جدید بساز و وقتی آماده شدی، پرش کن. مقایسه با کسانی که ده سال زودتر شروع کرده‌اند بی‌فایده است؛ تو در مسیر خودت شروع می‌کنی.',
      en: 'Changing careers is possible at any age, not just in your twenties; many of your skills (communication, management, problem solving) transfer. Step one is self-knowledge: what you enjoy, what you are good at, and what you can no longer tolerate. Then research: talk to people in that field, take a short affordable course, and build one small project to see the real work. A gradual shift is safer: build the new skill alongside your current job, and jump when you are ready. Comparing yourself to people who started ten years earlier is pointless; you are starting on your own path.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
