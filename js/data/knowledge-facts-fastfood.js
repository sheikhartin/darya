/**
 * Darya - curated factual entries (foods and fast food).
 * Loaded before knowledge-base.js; registers a global part. Health notes
 * are general information, never personalized medical advice.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'fastfood_overview',
      keywords: [
        'فست فود',
        'فست فود چیه',
        'غذای سریع',
        'fast food',
        'what is fast food'
      ],
      weak: ['فست فود', 'غذای سریع', 'fast food'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'غذا', 'what', 'food', 'junk'],
      fa: 'فست‌فود یعنی غذایی که سریع آماده و سرو می‌شود و معمولاً در رستوران‌های زنجیره‌ای یا به‌صورت بیرون‌بر فروخته می‌شود. راحتی و قیمتش جذاب است، اما معمولاً کالری، نمک، چربی و شکر بالایی دارد. مصرف گه‌گاه مشکلی ایجاد نمی‌کند؛ مسئله وقتی است که پایه‌ی رژیم روزانه شود. نکته‌ی کلیدی تعادل است، نه ممنوعیت کامل.',
      en: 'Fast food means food prepared and served quickly, usually sold by chain restaurants or as takeaway. Its convenience and price are appealing, but it is usually high in calories, salt, fat, and sugar. Occasional consumption is fine; the issue is when it becomes the base of a daily diet. The key idea is balance, not total prohibition.'
    },
    {
      id: 'fastfood_history',
      keywords: [
        'تاریخچه فست فود',
        'اولین فست فود',
        'مک دونالد تاریخچه',
        'history of fast food',
        'first fast food',
        'mcdonalds history'
      ],
      weak: [
        'تاریخچه فست فود',
        'مک دونالد',
        'مک‌دونالد',
        'fast food history',
        'mcdonalds'
      ],
      weakSafe: true,
      hints: ['تاریخچه', 'اولین', 'کی', 'history', 'first', 'when'],
      fa: 'فست‌فود مدرن در آمریکای اوایل قرن بیستم با دکه‌های همبرگر و خط مونتاژ شکل گرفت. برادران مک‌دونالد در دهه‌ی ۱۹۴۰ سیستم «اسپیدی» را ساختند و ری کراک آن را به بزرگ‌ترین زنجیره‌ی جهان تبدیل کرد. استانداردسازی، سرعت و برندسازی، الگوی کل صنعت فست‌فود شد و بعدها به سراسر دنیا صادر شد.',
      en: 'Modern fast food took shape in early-20th-century America with hamburger stands and assembly-line service. The McDonald brothers built their Speedee system in the 1940s, and Ray Kroc turned it into the world’s largest chain. Standardization, speed, and branding became the model for the whole industry and later spread worldwide.'
    },
    {
      id: 'pizza_burger',
      keywords: [
        'پیتزا چیه',
        'همبرگر چیه',
        'تاریخچه پیتزا',
        'pizza',
        'burger',
        'history of pizza'
      ],
      weak: ['پیتزا', 'همبرگر', 'برگر', 'pizza', 'burger'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'تاریخچه', 'what', 'history', 'food'],
      fa: 'پیتزا ریشه در نان‌های سنتی ایتالیا دارد و پیتزای مدرن با گوجه و پنیر در ناپل شکل گرفت و مهاجران ایتالیایی آن را جهانی کردند. همبرگر از همبرگ آلمان الهام گرفته اما شکل امروزی‌اش (گوشت در نان با مخلفات) آمریکایی است. هر دو حالا از جهانی‌ترین غذاها هستند و در هر کشور نسخه‌ی محلی خودشان را پیدا کرده‌اند.',
      en: 'Pizza has roots in traditional Italian flatbreads; modern pizza with tomato and cheese formed in Naples and was spread worldwide by Italian migrants. The burger was inspired by Hamburg, Germany, but its modern form (meat in a bun with toppings) is American. Both are now among the most global foods, each with local versions in every country.'
    },
    {
      id: 'fastfood_health',
      keywords: [
        'فست فود ضرر داره',
        'آیا فست فود بد است',
        'فست فود سالم تر',
        'is fast food bad for you',
        'fast food health effects',
        'healthier fast food'
      ],
      weak: ['فست فود', 'ضرر', 'fast food', 'junk food'],
      weakSafe: true,
      hints: ['سلامت', 'ضرر', 'چرا', 'health', 'bad', 'why'],
      fa: 'فست‌فود به‌خاطر چگالی کالری بالا، نمک و چربی‌های صنعتی، اگر زیاد مصرف شود با اضافه‌وزن و مشکلات قلبی و قندی مرتبط است. می‌توانی انتخاب‌های سالم‌تر بکنی: سایز کوچک‌تر، سالاد کنار غذا، نوشیدنی بدون شکر، و سفارش کبابی به‌جای سرخ‌کردنی. کلید، دفعات مصرف و اندازه‌ی وعده است، نه اینکه هرگز فست‌فود نخوری.',
      en: 'Because of high calorie density, salt, and industrial fats, eating a lot of fast food is linked to weight gain and heart and blood-sugar problems. You can choose healthier options: a smaller size, a side salad, a sugar-free drink, and grilled instead of fried. The key is frequency and portion size, not never eating fast food at all.'
    },
    {
      id: 'fastfood_in_cities',
      keywords: [
        'بهترین فست فود تهران',
        'فست فود تهران',
        'فست فودهای تهران',
        'فست فود خوب تهران',
        'معروف ترین فست فود تهران',
        'بهترین فست فود اصفهان',
        'فست فود مشهد',
        'فست فود شیراز',
        'فست فود تبریز',
        'بهترین برگر تهران',
        'بهترین پیتزا تهران',
        'بهترین ساندویچ تهران',
        'best fast food tehran',
        'fast food in tehran'
      ],
      weak: [
        'فست فود',
        'برگر',
        'پیتزا',
        'ساندویچ',
        'همبرگر',
        'fast food',
        'burger',
        'pizza'
      ],
      weakSafe: true,
      hints: [
        'تهران',
        'اصفهان',
        'مشهد',
        'شیراز',
        'تبریز',
        'ایران',
        'شهر',
        'بهترین',
        'tehran',
        'isfahan',
        'mashhad',
        'iran'
      ],
      fa: 'برای «بهترین فست فود تهران» یک جواب قطعی وجود نداره چون به سلیقه و محله بستگی داره، ولی چند اسمی که زیاد بین مردم می‌چرخه: پیتزا و برگرهای زنجیره‌ای مثل عطاویچ و پیتزا پیتزا، برگرهای مستقل مثل بامبو و دال بامبو در مرکز و شرق تهران، ساندویچ‌های قدیمی مثل آبنوس و فریدو در خیابون‌های مرکزی، و فلافل و سمبوسه‌ی جنوب‌شهر. اگر گفتی کدوم محله‌ای یا دنبال چه نوعی (برگر، پیتزا، ساندویچ، گیاهی)، می‌تونم دقیق‌تر راهنمایی کنم.',
      en: 'There is no single "best" fast food in Tehran because it depends on your taste and the neighborhood, but the names that come up often are the chain burger/pizza spots like Atavich and Pizza Pizza, independent burger spots like Bamboo and Dal Bamboo in central and eastern Tehran, old-school sandwich places like Abnus and Fereydoon in central streets, plus the falafel and samoseh stands in the south of the city. Tell me your neighborhood and what style you are after (burger, pizza, sandwich, veggie) and I can narrow it down.'
    },
    {
      id: 'iranian_fastfood',
      keywords: [
        'فست فود ایرانی',
        'فالافل',
        'ساندویچ بندری',
        'iranian fast food',
        'falafel',
        'persian street food'
      ],
      weak: ['فالافل', 'بندری', 'ساندویچ', 'falafel', 'street food'],
      weakSafe: true,
      hints: ['ایرانی', 'غذا', 'خیابانی', 'iranian', 'food', 'street'],
      fa: 'فست‌فود ایرانی فقط پیتزا و برگر نیست: فالافل (نخود سرخ‌شده در نان با ترشی)، ساندویچ بندری، کباب کوبیده در نان، سمبوسه و کوکو خیابانی بخشی از فرهنگ غذای سریع ایران‌اند. این غذاها طعم و هویت محلی دارند و برخی گزینه‌های سبک‌تری نسبت به برگرهای صنعتی‌اند، هرچند سرخ‌کردنی‌ها را هم باید با تعادل خورد.',
      en: 'Iranian fast food is not only pizza and burgers: falafel (fried chickpea in bread with pickles), bandari sandwiches, koobideh kebab in bread, samosas, and street kuku are part of Iran’s quick-food culture. These foods carry local flavor and identity, and some are lighter than industrial burgers, though fried items should still be eaten in moderation.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
