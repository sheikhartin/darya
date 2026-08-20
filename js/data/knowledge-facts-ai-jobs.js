/**
 * Darya - curated factual entries (AI and the future of work).
 * Loaded before knowledge-base.js; registers a global part. Honest but
 * not alarmist: automation changes tasks, not whole people overnight.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'ai_job_impact',
      keywords: [
        'هوش مصنوعی شغل ها',
        'آیا هوش مصنوعی شغل مرا میگیرد',
        'مشاغل در خطر هوش مصنوعی',
        'will ai take my job',
        'jobs at risk from ai',
        'ai replacing jobs'
      ],
      weak: ['هوش مصنوعی', 'شغل', 'ربات', 'ai', 'automation', 'jobs'],
      weakSafe: true,
      hints: ['شغل', 'آینده', 'بگیره', 'job', 'future', 'replace'],
      fa: 'هوش مصنوعی بیشتر از اینکه کل شغل‌ها را یک‌شبه حذف کند، کارهای تکراری و قابل‌پیش‌بینی را خودکار می‌کند. مشاغلی که بخش زیادی از آن‌ها نوشتن استاندارد، محاسبه، طبقه‌بندی یا پشتیبانی ساده است، بیشتر تحت فشارند. اما همزمان شغل‌های جدیدی (مدیریت داده، ارزیابی مدل، امنیت هوش مصنوعی) ساخته می‌شود. راه امن، یادگیری استفاده از هوش مصنوعی است، نه رقابت با آن.',
      en: 'AI mostly automates repetitive, predictable tasks rather than deleting whole jobs overnight. Roles with a lot of standard writing, calculation, classification, or simple support are under the most pressure. At the same time new jobs appear (data stewardship, model evaluation, AI safety). The safe path is learning to use AI, not racing against it.'
    },
    {
      id: 'ai_programmer',
      keywords: [
        'هوش مصنوعی برنامه نویس',
        'آیا هوش مصنوعی جای برنامه نویس را میگیرد',
        'آیا هوش مصنوعی جای برنامه نویس رو میگیره',
        'جای برنامه نویس رو میگیره',
        'جای برنامه نویس را میگیرد',
        'هوش مصنوعی جای برنامه نویس',
        'آینده برنامه نویسی',
        'will ai replace programmers',
        'is programming dead',
        'ai coding future'
      ],
      weak: [
        'برنامه نویس',
        'برنامه‌نویس',
        'کدنویسی',
        'programmer',
        'coding',
        'programming'
      ],
      weakSafe: true,
      hints: ['هوش مصنوعی', 'آینده', 'بگیره', 'ai', 'future', 'replace'],
      fa: 'هوش مصنوعی نوشتن کدهای تکراری را سریع‌تر کرده، اما برنامه‌نویسی فقط تایپ کد نیست: فهمیدن مسئله، طراحی سیستم، رفع خطا و تصمیم‌های معماری هنوز کار انسان است. برنامه‌نویسی که از ابزارهای هوش مصنوعی خوب استفاده کند، سریع‌تر و قوی‌تر می‌شود. مهارت‌های پایه (ساختن، دیباگ، تست) هنوز ارزشمندند؛ فقط ابزارها عوض شده‌اند.',
      en: 'AI has sped up writing repetitive code, but programming is not just typing: understanding the problem, designing systems, debugging, and architectural decisions remain human work. A developer who uses AI tools well becomes faster and stronger. Core skills (building, debugging, testing) still matter; only the tools have changed.'
    },
    {
      id: 'ai_designers',
      keywords: [
        'هوش مصنوعی طراح',
        'آیا هوش مصنوعی جای گرافیست را میگیرد',
        'آینده طراحی گرافیک',
        'will ai replace designers',
        'will ai replace graphic designers',
        'ai replace graphic designers',
        'ai graphic design',
        'future of designers'
      ],
      weak: ['گرافیست', 'طراح', 'طراحی', 'designer', 'design', 'graphic'],
      weakSafe: true,
      hints: ['هوش مصنوعی', 'آینده', 'بگیره', 'ai', 'future', 'replace'],
      fa: 'ابزارهای هوش مصنوعی ساخت تصویر و لوگو، کارهای تکراری طراحی را سریع کرده‌اند، اما طراحی فقط خروجی گرفتن نیست: فهمیدن مخاطب، هویت برند و تصمیم‌های بصری هنوز کار طراح است. طراحانی که هوش مصنوعی را بلدند، ایده را سریع‌تر نمونه‌سازی و اصلاح می‌کنند. ارزش به سمت تفکر طراحی و کارگردانی هنری می‌رود، نه حذف کامل طراح.',
      en: 'AI image and logo tools have sped up repetitive design work, but design is not just generating output: understanding the audience, brand identity, and visual decisions remain human. Designers who know AI prototype and refine ideas faster. Value shifts toward design thinking and art direction, not the elimination of designers.'
    },
    {
      id: 'ai_jobs_adapt',
      keywords: [
        'چطور با هوش مصنوعی هماهنگ شویم',
        'مهارت برای آینده',
        'چطور از بیکار شدن نترسیم',
        'skills for the ai era',
        'how to future proof career',
        'adapt to automation'
      ],
      weak: ['آینده شغلی', 'مهارت آینده', 'future proof', 'ai skills'],
      weakSafe: true,
      hints: ['چطور', 'مهارت', 'آینده', 'how', 'skill', 'future'],
      fa: 'برای ماندگاری در دوران خودکارسازی، روی مهارت‌هایی تمرکز کن که هوش مصنوعی سخت‌تر کپی می‌کند: حل مسئله‌ی واقعی، خلاقیت، ارتباط انسانی، قضاوت و رهبری. سواد هوش مصنوعی (استفاده‌ی درست از ابزارها) را به مهارت پایه‌ی خودت اضافه کن. به‌جای ترس، خودت را در جای «کسی که هوش مصنوعی را هدایت می‌کند» بگذار، نه «کسی که با آن رقابت می‌کند».',
      en: 'To stay durable in the automation era, focus on skills AI copies less easily: real problem solving, creativity, human connection, judgment, and leadership. Add AI literacy (using the tools well) to your base skills. Instead of fear, position yourself as the person who directs AI, not the one racing it.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
