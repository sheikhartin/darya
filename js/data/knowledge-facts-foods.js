/**
 * Darya - curated factual entries (natural healthy foods).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'healthy_foods_overview',
      keywords: [
        'غذاهای طبیعی سالم',
        'غذای طبیعی',
        'خوراکی های سالم',
        'natural healthy foods',
        'whole foods',
        'natural foods'
      ],
      weak: ['طبیعی', 'کامل', 'whole food', 'natural food'],
      weakSafe: true,
      hints: ['سالم', 'غذا', 'تغذیه', 'healthy', 'food', 'nutrition'],
      fa: 'پایه‌ی تغذیه‌ی سالم، غذاهای طبیعی و کم‌فرآوری‌شده است: میوه و سبزی، غلات کامل، حبوبات، مغزها و دانه‌ها، ماهی و روغن‌های سالم. این خوراکی‌ها فیبر، ویتامین و مواد معدنی را بدون شکر و چربی اضافه می‌رسانند. قاعده‌ی ساده: هرچه به شکل طبیعی‌اش نزدیک‌تر باشد، معمولاً سالم‌تر است. تنوع بیشتر از حذف‌های سخت‌گیرانه اهمیت دارد.',
      en: 'The base of healthy eating is natural, minimally processed foods: fruits and vegetables, whole grains, legumes, nuts and seeds, fish, and healthy oils. These foods deliver fiber, vitamins, and minerals without added sugar and fat. A simple rule: the closer to its natural form, the healthier it usually is. Variety matters more than strict elimination.'
    },
    {
      id: 'fruits_vegetables',
      keywords: [
        'میوه و سبزیجات',
        'فواید سبزیجات',
        'فواید میوه',
        'fruits and vegetables',
        'benefits of vegetables',
        'benefits of fruit'
      ],
      weak: ['سبزیجات', 'میوه', 'vegetables', 'fruits'],
      weakSafe: true,
      hints: ['فواید', 'چرا', 'سالم', 'benefits', 'why', 'healthy'],
      fa: 'میوه‌ها و سبزیجات منبع اصلی ویتامین‌ها، مواد معدنی، فیبر و آنتی‌اکسیدان‌اند و مصرف منظم‌شان با کاهش خطر بیماری‌های قلبی، فشار خون و برخی سرطان‌ها همراه است. توصیه‌ی رایج: حداقل پنج وعده در روز و رنگ‌های متنوع (هر رنگ ماده‌ی مفید خودش را دارد). سبزی را در هر وعده بگنجان و میوه را به‌جای شیرینی انتخاب کن.',
      en: 'Fruits and vegetables are the main source of vitamins, minerals, fiber, and antioxidants, and regular intake is linked to lower risk of heart disease, high blood pressure, and some cancers. The common advice: at least five servings a day in varied colors, since each color carries its own nutrients. Add vegetables to every meal and pick fruit instead of sweets.'
    },
    {
      id: 'whole_grains',
      keywords: [
        'غلات کامل',
        'نان سبوس دار',
        'برنج قهوه ای',
        'whole grains',
        'whole grain bread',
        'brown rice'
      ],
      weak: ['غلات', 'سبوس دار', 'whole grain', 'brown rice'],
      weakSafe: true,
      hints: ['نان', 'برنج', 'سالم', 'bread', 'rice', 'healthy'],
      fa: 'غلات کامل (نان سبوس‌دار، برنج قهوه‌ای، جو دوسر، کینوا) برخلاف غلات تصفیه‌شده، سبوس و جوانه‌شان حفظ شده است، پس فیبر و ویتامین‌های گروه B بیشتری دارند. فیبرشان قند خون را آرام‌تر بالا می‌برد و سیری طولانی‌تری می‌دهد. جایگزینی نان سفید و برنج سفید با نسخه‌ی کامل، یکی از ساده‌ترین ارتقاهای تغذیه است.',
      en: 'Whole grains (whole-wheat bread, brown rice, oats, quinoa) keep their bran and germ, unlike refined grains, so they have more fiber and B vitamins. Their fiber raises blood sugar more slowly and keeps you full longer. Swapping white bread and white rice for whole versions is one of the easiest nutrition upgrades.'
    },
    {
      id: 'legumes',
      keywords: [
        'حبوبات',
        'عدس و لوبیا',
        'فواید حبوبات',
        'legumes',
        'beans and lentils',
        'benefits of legumes'
      ],
      weak: ['حبوبات', 'عدس', 'لوبیا', 'legumes', 'lentils', 'beans'],
      weakSafe: true,
      hints: ['فواید', 'پروتئین', 'سالم', 'benefits', 'protein', 'healthy'],
      fa: 'حبوبات (عدس، لوبیا، نخود) پروتئین گیاهی، فیبر و آهن دارند و ارزان‌ترین منبع پروتئین سالم‌اند. ترکیب حبوبات با غلات (مثل عدس‌پلو) پروتئین کامل می‌سازد. مصرف منظم‌شان به سلامت قلب و کنترل قند خون کمک می‌کند و جایگزین خوبی برای کاهش مصرف گوشت قرمز است.',
      en: 'Legumes (lentils, beans, chickpeas) provide plant protein, fiber, and iron, and they are the cheapest healthy protein source. Combining legumes with grains (like lentils with rice) makes a complete protein. Eating them regularly supports heart health and blood-sugar control, and they are a good swap for cutting down on red meat.'
    },
    {
      id: 'nuts_seeds',
      keywords: [
        'مغزها و دانه ها',
        'آجیل',
        'فواید گردو و بادام',
        'گردو و بادام',
        'تخمه',
        'nuts and seeds',
        'walnuts almonds',
        'benefits of nuts'
      ],
      weak: ['آجیل', 'گردو', 'بادام', 'تخمه', 'nuts', 'seeds', 'walnuts'],
      weakSafe: true,
      hints: ['فواید', 'سالم', 'چربی', 'benefits', 'healthy', 'fat'],
      fa: 'مغزها و دانه‌ها (گردو، بادام، تخمه‌ی کدو، چیا) چربی‌های مفید، پروتئین و مواد معدنی دارند و در حد یک مشت در روز مفیدند. گردو امگا-۳ گیاهی دارد و بادام ویتامین E. نکته‌ی مهم: کالری‌شان بالاست و نوع نمکی و بو داده با روغن زیاد، فایده‌اش را کم می‌کند؛ نوع خام یا کم‌نمک بهتر است.',
      en: 'Nuts and seeds (walnuts, almonds, pumpkin seeds, chia) carry healthy fats, protein, and minerals, and a handful a day is beneficial. Walnuts have plant omega-3 and almonds have vitamin E. The catch: they are calorie-dense, and salted or heavily oil-roasted versions reduce the benefit; raw or lightly salted is better.'
    },
    {
      id: 'fermented_foods',
      keywords: [
        'غذاهای تخمیری',
        'ماست و پروبیوتیک',
        'پروبیوتیک',
        'تخمیری',
        'ماست پروبیوتیک',
        'fermented foods',
        'probiotics',
        'yogurt benefits'
      ],
      weak: ['تخمیری', 'پروبیوتیک', 'کفیر', 'fermented', 'probiotic'],
      weakSafe: true,
      hints: ['ماست', 'روده', 'گوارش', 'yogurt', 'gut', 'digestion'],
      fa: 'غذاهای تخمیری (ماست، کفیر، کیمچی، ترشی طبیعی) باکتری‌های مفید (پروبیوتیک) دارند که به سلامت روده و گوارش کمک می‌کنند. ماست و کفیر ساده (بدون شکر زیاد) در دسترس‌ترین گزینه‌ها هستند. توجه: ترشی‌های صنعتی با سرکه‌ی زیاد و نمک بالا لزوماً پروبیوتیک ندارند؛ نوع طبیعی و کم‌نمک بهتر است.',
      en: 'Fermented foods (yogurt, kefir, kimchi, natural pickles) contain beneficial bacteria (probiotics) that support gut and digestive health. Plain yogurt and kefir without much added sugar are the most accessible options. Note: industrial pickles with lots of vinegar and salt do not necessarily contain probiotics; natural, lower-salt versions are better.'
    },
    {
      id: 'fish_omega3',
      keywords: [
        'ماهی و امگا ۳',
        'فواید ماهی',
        'ماهی سالمون',
        'fish omega 3',
        'benefits of fish',
        'salmon'
      ],
      weak: ['ماهی', 'امگا ۳', 'سالمون', 'fish', 'omega 3', 'salmon'],
      weakSafe: true,
      hints: ['فواید', 'سالم', 'قلب', 'benefits', 'healthy', 'heart'],
      fa: 'ماهی‌های چرب مثل سالمون، ساردین و قزل‌آلا سرشار از امگا-۳ هستند که برای قلب، مغز و کاهش التهاب مفید است. توصیه‌ی رایج، دو وعده ماهی در هفته است. ماهی‌های کوچک (ساردین) جیوه‌ی کمتری دارند. کنسرو ماهی تن در آب هم گزینه‌ی مناسبی است، ولی در مصرف روزانه‌ی تن زیاده‌روی نکن.',
      en: 'Oily fish like salmon, sardines, and trout are rich in omega-3, which benefits the heart, brain, and inflammation. The common advice is two servings of fish a week. Small fish (sardines) have less mercury. Canned tuna in water is also a fine option, but do not overdo tuna on a daily basis.'
    },
    {
      id: 'hydration',
      keywords: [
        'آب خوردن',
        'چقدر آب بخوریم',
        'آبرسانی بدن',
        'hydration',
        'how much water to drink',
        'staying hydrated'
      ],
      weak: ['آب', 'هیدراتاسیون', 'water', 'hydration'],
      weakSafe: true,
      hints: ['چقدر', 'چطور', 'روزانه', 'how', 'daily', 'drink'],
      fa: 'آب برای تنظیم دما، گوارش و کارکرد مغز حیاتی است و کم‌آبی خفیف باعث خستگی و سردرد می‌شود. مقدار دقیق به وزن، آب‌وهوا و فعالیت بستگی دارد، اما نشانه‌ی ساده‌ی خوبی: رنگ ادرار روشن و احساس تشنگی نکردن مداوم. یک لیوان آب اول صبح و همراه هر وعده، راه ساده‌ی شروع است.',
      en: 'Water is vital for temperature control, digestion, and brain function, and even mild dehydration causes tiredness and headaches. The exact amount depends on weight, climate, and activity, but a simple good sign is light-colored urine and not feeling constantly thirsty. A glass of water first thing in the morning and with each meal is an easy start.'
    },
    {
      id: 'superfoods_myth',
      keywords: [
        'سوپرفود',
        'ابرغذا',
        'سوپر فود چیه',
        'superfood',
        'superfoods myth'
      ],
      weak: ['سوپرفود', 'ابرغذا', 'سوپر فود', 'superfood'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'واقعا', 'what', 'myth', 'really'],
      fa: '«سوپرفود» اصطلاح بازاریابی است، نه علمی؛ هیچ غذایی به‌تنهایی معجزه نمی‌کند. خوراکی‌هایی مثل بلوبری، کینوا یا اسپیرولینا مفیدند، اما فایده‌شان از تنوع کل رژیم می‌آید، نه از مصرف زیاد یکی. رژیم رنگارنگ و متعادل از هر «ابرغذای» گران‌قیمتی مؤثرتر است.',
      en: '"Superfood" is a marketing term, not a scientific one; no single food works miracles. Foods like blueberries, quinoa, or spirulina are useful, but their benefit comes from the variety of the whole diet, not from eating a lot of one item. A colorful, balanced diet beats any expensive "superfood."'
    },
    {
      id: 'mediterranean_diet',
      keywords: [
        'رژیم مدیترانه ای',
        'رژیم مدیترانه‌ای',
        'mediterranean diet',
        'mediterranean diet benefits'
      ],
      weak: ['مدیترانه', 'mediterranean'],
      weakSafe: true,
      hints: ['رژیم', 'سالم', 'قلب', 'diet', 'healthy', 'heart'],
      fa: 'رژیم مدیترانه‌ای یکی از مطالعه‌شده‌ترین الگوهای تغذیه است: سبزی و میوه‌ی فراوان، روغن زیتون، ماهی و مرغ، غلات کامل، حبوبات و مغزها، با مصرف کم گوشت قرمز و شیرینی. پژوهش‌ها آن را با سلامت قلب، مغز و عمر طولانی‌تر مرتبط می‌دانند. نکته‌اش حذف سخت‌گیرانه نیست، بلکه الگوی کلی و لذت‌بردن از غذاست.',
      en: 'The Mediterranean diet is one of the most studied eating patterns: plenty of vegetables and fruit, olive oil, fish and poultry, whole grains, legumes, and nuts, with little red meat and sweets. Research links it to heart and brain health and longer life. The point is not strict elimination but the overall pattern and enjoying food.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
