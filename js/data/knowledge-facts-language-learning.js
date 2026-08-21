/**
 * Darya - curated factual entries (learning foreign languages).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'language_worth',
      keywords: [
        'چه زبانی یاد بگیرم',
        'کدام زبان یاد بگیرم',
        'بهترین زبان برای یادگیری',
        'which language should i learn',
        'best language to learn',
        'what language is worth learning'
      ],
      weak: [
        'چه زبانی',
        'کدوم زبان',
        'زبان یاد بگیرم',
        'which language',
        'learn a language'
      ],
      weakSafe: true,
      hints: ['یاد بگیرم', 'بهترین', 'کدوم', 'learn', 'best', 'worth'],
      fa: '«کدام زبان بهتر است» به هدف تو بستگی دارد، نه به یک رتبه‌ی ثابت: انگلیسی برای کار، سفر و محتوای جهان تقریباً ضروری است؛ اسپانیایی پرگویش‌ترین زبان بعد از چینی است؛ ماندارین برای بازار بزرگ چین؛ فرانسوی و آلمانی برای اروپا و مهاجرت؛ و عربی برای منطقه‌ی خاورمیانه. زبانی را انتخاب کن که واقعاً با آن کار داری، وگرنه انگیزه‌ات تمام می‌شود.',
      en: 'Which language is best depends on your goal, not a fixed ranking: English is nearly essential for work, travel, and global content; Spanish is the most spoken after Chinese; Mandarin opens the large Chinese market; French and German matter for Europe and migration; and Arabic for the Middle East. Pick a language you will genuinely use, or your motivation will fade.'
    },
    {
      id: 'english_worth',
      keywords: [
        'چرا انگلیسی مهم است',
        'اهمیت زبان انگلیسی',
        'آیا انگلیسی یاد بگیرم',
        'why learn english',
        'is english worth learning',
        'importance of english'
      ],
      weak: ['انگلیسی', 'english'],
      weakSafe: true,
      hints: ['چرا', 'اهمیت', 'مهم', 'why', 'important', 'worth'],
      fa: 'انگلیسی زبان مشترک علم، فناوری، تجارت و اینترنت است و بیشترین محتوای آموزشی دنیا به آن منتشر می‌شود. برای شغل‌های برنامه‌نویسی، مهاجرت و تحصیل تقریباً پیش‌نیاز است. لازم نیست کامل باشد؛ حتی سطح متوسط، درِ منابع، کار و ارتباطات جهانی را باز می‌کند. برای بیشتر مردم، بهترین بازگشت سرمایه را دارد.',
      en: 'English is the common language of science, technology, business, and the internet, and most of the world’s educational content is published in it. It is nearly a prerequisite for programming jobs, migration, and study. You do not need perfection; even an intermediate level opens up resources, work, and global connections. For most people it has the best return on investment.'
    },
    {
      id: 'language_difficulty',
      keywords: [
        'سخت ترین زبان',
        'زبان آسان برای یادگیری',
        'چقدر طول میکشد زبان یاد بگیریم',
        'hardest language to learn',
        'easiest language to learn',
        'how long to learn a language'
      ],
      weak: ['زبان سخت', 'زبان آسان', 'hardest language', 'easiest language'],
      weakSafe: true,
      hints: ['چقدر', 'سخت', 'آسان', 'how', 'hard', 'easy', 'long'],
      fa: 'سختی زبان نسبی است و به زبان مادری‌ات بستگی دارد. برای فارسی‌زبان‌ها، انگلیسی و اسپانیایی نسبتاً ساده‌ترند، چون ساختارشان با فارسی متفاوت اما قابل‌مدیریت است؛ چینی و ژاپنی به‌خاطر خط و آوا سخت‌ترند. رسیدن به مکالمه‌ی روان معمولاً صدها ساعت تمرین واقعی می‌خواهد. کلید، تمرین روزانه‌ی کم اما مداوم است، نه دوره‌های فشرده‌ی مقطعی.',
      en: 'Language difficulty is relative and depends on your mother tongue. For Persian speakers, English and Spanish are comparatively approachable, while Chinese and Japanese are harder because of their scripts and sounds. Reaching fluent conversation usually takes hundreds of hours of real practice. The key is small, daily, consistent practice, not occasional intensive courses.'
    },
    {
      id: 'language_method',
      keywords: [
        'بهترین روش یادگیری زبان',
        'چطور زبان یاد بگیرم',
        'روش یادگیری زبان',
        'best way to learn a language',
        'how to learn a language',
        'language learning method'
      ],
      weak: [
        'روش یادگیری زبان',
        'زبان یاد بگیرم',
        'learn a language',
        'language learning'
      ],
      weakSafe: true,
      hints: ['چطور', 'روش', 'بهترین', 'how', 'method', 'best'],
      fa: 'مؤثرترین روش یادگیری زبان، ترکیب ورودی و خروجی است: زیاد گوش کن و بخوان (ورودی قابل‌فهم)، و از روز اول صحبت کن و بنویس، حتی با خطا. فلش‌کارت‌های تکرار فاصله‌دار برای واژگان عالی‌اند، اما زبان فقط حفظ لغت نیست. هدف کوچک و کاربردی بگذار (مثلاً سفارش غذا یا معرفی خودت) و با محتوایی که دوست داری تمرین کن.',
      en: 'The most effective way to learn a language combines input and output: listen and read a lot (comprehensible input), and speak and write from day one, even with mistakes. Spaced-repetition flashcards are great for vocabulary, but a language is not just memorized words. Set a small practical goal (ordering food or introducing yourself) and practice with content you enjoy.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
