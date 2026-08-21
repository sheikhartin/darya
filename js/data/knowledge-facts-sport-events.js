/**
 * Darya - curated factual entries (major sporting events and history).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'fifa_world_cup',
      keywords: [
        'جام جهانی فوتبال',
        'فیفا',
        'جام جهانی چیه',
        'fifa world cup',
        'what is the world cup'
      ],
      weak: ['جام جهانی', 'فیفا', 'world cup', 'fifa'],
      weakSafe: true,
      hints: ['فوتبال', 'چیه', 'چیست', 'football', 'what', 'soccer'],
      fa: 'جام جهانی فوتبال مهم‌ترین تورنمنت ملی فوتبال است که فیفا هر چهار سال برگزار می‌کند. اولین دوره در ۱۹۳۰ در اروگوئه برگزار شد و میزبان قهرمان شد. برزیل با پنج قهرمانی رکورددار است و بعد از آن آلمان و ایتالیا با چهار. این رویداد پربیننده‌ترین مسابقه‌ی ورزشی جهان است.',
      en: 'The FIFA World Cup is the most important national football tournament, held by FIFA every four years. The first edition was in 1930 in Uruguay, and the host won. Brazil holds the record with five titles, followed by Germany and Italy with four. It is the most-watched sporting event in the world.'
    },
    {
      id: 'world_cup_history',
      keywords: [
        'تاریخچه جام جهانی',
        'قهرمان های جام جهانی',
        'فینال ۲۰۲۲',
        'world cup winners',
        'world cup history',
        '2022 world cup final',
        'who has won the most world cups',
        'most world cups',
        'world cup champions',
        'قهرمانان جام جهانی'
      ],
      weak: [
        'قهرمان جام جهانی',
        'تاریخچه جام جهانی',
        'world cup history',
        'world cup winners',
        'world cups',
        'world cup'
      ],
      weakSafe: true,
      hints: ['فوتبال', 'قهرمان', 'آرژانتین', 'football', 'champion', 'final'],
      fa: 'نکته‌های تاریخ جام جهانی: اروگوئه ۱۹۳۰ نخستین قهرمان بود؛ برزیل با پنج قهرمانی (۱۹۵۸ تا ۲۰۰۲) رکورددار است؛ فینال ۲۰۲۲ قطر با قهرمانی آرژانتین و ستاره شدن لیونل مسی در ضربات پنالتی برابر فرانسه تمام شد؛ و دوره‌ی ۲۰۲۶ با ۴۸ تیم و میزبانی مشترک آمریکا، کانادا و مکزیک، بزرگ‌ترین جام جهانی تاریخ خواهد بود.',
      en: 'World Cup history notes: Uruguay was the first champion in 1930; Brazil leads with five titles (1958 to 2002); the 2022 final in Qatar ended with Argentina beating France on penalties and Lionel Messi completing his legacy; and the 2026 edition, with 48 teams co-hosted by the USA, Canada, and Mexico, will be the largest World Cup ever.'
    },
    {
      id: 'volleyball_history',
      keywords: [
        'تاریخچه والیبال',
        'والیبال چیه',
        'مخترع والیبال',
        'volleyball history',
        'who invented volleyball',
        'what is volleyball'
      ],
      weak: ['والیبال', 'volleyball'],
      weakSafe: true,
      hints: ['تاریخچه', 'چیه', 'اختراع', 'history', 'what', 'invented'],
      fa: 'والیبال را ویلیام جی. مورگان در ۱۸۹۵ در آمریکا اختراع کرد؛ اول اسمش «مینتونت» بود و به‌عنوان ورزشی کم‌برخورد برای داخل سالن طراحی شد. فدراسیون جهانی آن (FIVB) در ۱۹۴۷ شکل گرفت و از المپیک ۱۹۶۴ توکیو وارد بازی‌های المپیک شد. امروز برزیل، ایتالیا، لهستان و آمریکا از قدرت‌های کلاسیک آن هستند.',
      en: 'Volleyball was invented by William G. Morgan in 1895 in the United States; it was first called "mintonette" and designed as a low-contact indoor sport. Its world federation (FIVB) formed in 1947, and it entered the Olympics at Tokyo 1964. Today Brazil, Italy, Poland, and the USA are among its classic powers.'
    },
    {
      id: 'volleyball_iran',
      keywords: [
        'والیبال ایران',
        'تیم ملی والیبال ایران',
        'قهرمانی والیبال آسیا',
        'iran volleyball',
        'iran national volleyball team',
        'iran asian champions'
      ],
      weak: ['والیبال ایران', 'تیم ملی والیبال', 'iran volleyball'],
      weakSafe: true,
      hints: ['ایران', 'قهرمانی', 'آسیا', 'iran', 'champion', 'asia'],
      fa: 'تیم ملی والیبال ایران در سال‌های ۲۰۱۰ تا ۲۰۲۰ به یکی از قدرت‌های آسیا و جهان تبدیل شد و چندین بار قهرمان آسیا شد. نسل طلایی‌اش (سعید معروف، سید محمد موسوی و دیگران) در لیگ جهانی و المپیک هم درخشیدند. والیبال در ایران از محبوب‌ترین ورزش‌های تیمی بعد از فوتبال است.',
      en: 'Iran’s national volleyball team became one of Asia’s and the world’s powers between 2010 and 2020, winning the Asian championship several times. Its golden generation (Saeid Marouf, Seyed Mohammad Mousavi, and others) also shone in the World League and Olympics. In Iran, volleyball is among the most popular team sports after football.'
    },
    {
      id: 'olympics_overview',
      keywords: [
        'المپیک چیه',
        'تاریخچه المپیک',
        'المپیک تابستانی',
        'olympics',
        'history of the olympics',
        'what are the olympics'
      ],
      weak: ['المپیک', 'olympics', 'olympic'],
      weakSafe: true,
      hints: ['تاریخچه', 'چیه', 'ورزش', 'history', 'what', 'sport'],
      fa: 'بازی‌های المپیک ریشه در یونان باستان دارند و نسخه‌ی مدرنش در ۱۸۹۶ در آتن دوباره شروع شد. هر چهار سال یک بار بین شهرهای جهان جابه‌جا می‌شود و ورزشکاران در رشته‌های تابستانی و زمستانی رقابت می‌کنند. المپیک نماد رقابت مسالمت‌آمیز ملت‌هاست و مراسم افتتاحیه و مشعل آن شهرت جهانی دارد.',
      en: 'The Olympic Games have roots in ancient Greece, and the modern version restarted in Athens in 1896. They rotate between world cities every four years, with athletes competing in summer and winter sports. The Olympics symbolize peaceful competition among nations, and their opening ceremony and torch are globally famous.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
