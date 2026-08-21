/**
 * Darya - curated factual entries (sports supplements).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'supplements_overview',
      keywords: [
        'مکمل بدنسازی',
        'مکمل ورزشی',
        'مکمل چی بخرم',
        'sports supplements',
        'workout supplements',
        'supplement basics'
      ],
      weak: ['مکمل', 'supplement'],
      weakSafe: true,
      hints: ['ورزش', 'بدنسازی', 'چیه', 'چی', 'sport', 'gym', 'what'],
      fa: 'مکمل یعنی «کامل‌کننده»، نه جایگزین: اول غذا، خواب و تمرین را مرتب کن، بعد اگر شکافی ماند، مکمل بیاور. مهم‌ترین قاعده‌ها: محصولی را بخر که تست شخص ثالث (مثل NSF یا Informed Sport) دارد، دوز توصیه‌شده را رد نکن و اگر بیماری یا داروی خاصی داری، اول با پزشک مشورت کن. هیچ مکملی جای تمرین و تغذیه‌ی درست را نمی‌گیرد.',
      en: 'A supplement is a completer, not a replacement: first fix food, sleep, and training, then add a supplement only if a gap remains. The key rules: buy products with third-party testing (like NSF or Informed Sport), stay within recommended doses, and talk to a doctor first if you have an illness or take medication. No supplement replaces proper training and nutrition.'
    },
    {
      id: 'whey_protein',
      keywords: [
        'پروتئین وی',
        'پروتیین وی',
        'وی پروتئین',
        'وی پروتیین',
        'پودر پروتئین',
        'پودر پروتیین',
        'whey protein',
        'whey powder',
        'protein powder'
      ],
      weak: ['وی', 'پروتئین', 'پروتیین', 'whey', 'protein powder'],
      weakSafe: true,
      hints: ['مکمل', 'عضله', 'چیه', 'supplement', 'muscle', 'what'],
      fa: 'وی پروتئین از آب پنیر گرفته می‌شود و پروتئین کامل با جذب سریع است؛ برای رساندن پروتئین کافی بعد از تمرین یا وقتی غذای کافی نمی‌خوری، راحت است. اگر رژیم‌ت پروتئین کافی دارد (گوشت، تخم‌مرغ، لبنیات، حبوبات)، لزوماً لازم نیست. مقدار رایج حدود ۲۰ تا ۳۰ گرم در هر وعده است، نه بیشتر.',
      en: 'Whey protein comes from milk whey and is a complete, fast-absorbing protein; it is convenient for hitting protein targets after training or when you do not eat enough. If your diet already has enough protein (meat, eggs, dairy, legumes), you may not need it. A common serving is about 20 to 30 grams, not more.'
    },
    {
      id: 'creatine',
      keywords: [
        'کراتین',
        'کراتین مونوهیدرات',
        'creatine',
        'creatine monohydrate'
      ],
      weak: ['کراتین', 'creatine'],
      weakSafe: true,
      hints: ['مکمل', 'قدرت', 'چیه', 'supplement', 'strength', 'what'],
      fa: 'کراتین مونوهیدرات از معدود مکمل‌هایی است که شواهد بسیار قوی دارد: قدرت و حجم عضله را در تمرینات قدرتی و انفجاری کمی بیشتر می‌کند. دوز معمول ۳ تا ۵ گرم در روز است و نیاز به بارگیری اجباری ندارد؛ مصرف مداوم مهم‌تر از زمان‌بندی دقیق است. در افراد سالم، در دوز استاندارد، ایمن شناخته می‌شود، ولی با مشکل کلیوی حتماً با پزشک مشورت کن.',
      en: 'Creatine monohydrate is one of the few supplements with very strong evidence: it modestly increases strength and muscle mass in power and explosive training. The usual dose is 3 to 5 grams a day, and a loading phase is not required; consistency matters more than exact timing. In healthy people at standard doses it is considered safe, but consult a doctor if you have kidney problems.'
    },
    {
      id: 'protein_powder_types',
      keywords: [
        'انواع پروتئین',
        'انواع پروتیین',
        'انواع پودر پروتیین',
        'پودر پروتیین',
        'وی یا کازئین',
        'وی یا کازیین',
        'پروتئین گیاهی',
        'پروتیین گیاهی',
        'types of protein powder',
        'whey vs casein',
        'plant protein'
      ],
      weak: [
        'کازئین',
        'کازیین',
        'پروتئین گیاهی',
        'پروتیین گیاهی',
        'casein',
        'plant protein'
      ],
      weakSafe: true,
      hints: ['انواع', 'فرق', 'پروتئین', 'types', 'vs', 'protein'],
      fa: 'سه نوع اصلی پودر پروتئین: وی (جذب سریع، بعد از تمرین)، کازئین (جذب آهسته، مناسب شب)، و گیاهی (نخود، برنج یا سویا؛ مناسب وگان و حساسیت به لبنیات). برای بیشتر افراد فرق عملی بین این‌ها کوچک است و مجموع پروتئین روزانه مهم‌تر از نوع آن است. پروتئین گیاهی مخلوط چند منبع، پروفایل کامل‌تری می‌دهد.',
      en: 'Three main types of protein powder: whey (fast-absorbing, good after training), casein (slow-absorbing, good at night), and plant (pea, rice, or soy; good for vegans and dairy sensitivities). For most people the practical difference is small, and total daily protein matters more than the type. A plant blend of several sources gives a more complete profile.'
    },
    {
      id: 'bcaa_eaa',
      keywords: [
        'بی سی ای ای',
        'آمینو اسید',
        'ای ای ای',
        'bcaa',
        'eaa amino acids'
      ],
      weak: ['آمینو', 'بی سی ای ای', 'bcaa', 'eaa', 'amino'],
      weakSafe: true,
      hints: ['مکمل', 'چیه', 'supplement', 'what', 'muscle'],
      fa: 'BCAA (سه آمینواسید شاخه‌دار) و EAA (همه‌ی آمینواسیدهای ضروری) مکمل‌های آمینواسیدی‌اند. اگر پروتئین کافی می‌خوری، شواهد برای BCAA ضعیف است و معمولاً لازم نیست؛ EAA کامل‌تر است و در رژیم‌های کم‌پروتئین مفیدتر. به‌طور خلاصه: پروتئین کامل (غذا یا پودر) از BCAA کاربردی‌تر و ارزان‌تر است.',
      en: 'BCAAs (three branched-chain amino acids) and EAAs (all essential amino acids) are amino-acid supplements. If you eat enough protein, the evidence for BCAAs is weak and they are usually unnecessary; EAAs are more complete and more useful on low-protein diets. In short: whole protein (food or powder) is more practical and cheaper than BCAAs.'
    },
    {
      id: 'pre_workout',
      keywords: [
        'پری ورک اوت',
        'مکمل قبل تمرین',
        'pre workout',
        'pre workout supplement'
      ],
      weak: ['پری ورک', 'قبل تمرین', 'pre workout'],
      weakSafe: true,
      hints: ['مکمل', 'چیه', 'انرژی', 'supplement', 'what', 'energy'],
      fa: 'پری‌ورک‌اوت مکملی است که قبل از تمرین مصرف می‌شود و معمولاً کافئین، بتا-آلانین و کراتین دارد تا انرژی و تمرکز را بالا ببرد. می‌تواند مفید باشد، اما کافئین بالا می‌تواند خواب، فشار خون و اضطراب را به‌هم بزند و تحمل (تولرانس) ایجاد می‌کند. اول با نصف دوز شروع کن، شب مصرف نکن و روی برچسب موادش را دقیق بخوان.',
      en: 'Pre-workout is a supplement taken before training that usually contains caffeine, beta-alanine, and creatine to boost energy and focus. It can help, but high caffeine can disrupt sleep, blood pressure, and anxiety, and it builds tolerance. Start with half a dose, avoid it at night, and read the ingredient label carefully.'
    },
    {
      id: 'electrolytes',
      keywords: [
        'الکترولیت',
        'نمک و پتاسیم',
        'نوشیدنی الکترولیت',
        'electrolytes',
        'electrolyte drink',
        'sodium potassium magnesium'
      ],
      weak: ['الکترولیت', 'پتاسیم', 'منیزیم', 'electrolyte'],
      weakSafe: true,
      hints: ['عرق', 'نوشیدنی', 'ورزش', 'sweat', 'drink', 'exercise'],
      fa: 'الکترولیت‌ها (سدیم، پتاسیم، منیزیم) برای تعادل مایعات، اعصاب و انقباض عضله حیاتی‌اند و با عرق از دست می‌روند. برای تمرین سبک، آب و غذای معمولی کافی است؛ برای تمرین طولانی و شدید یا هوای گرم، نوشیدنی الکترولیت کمک می‌کند. از انواع پرشکر روزانه دوری کن و در بیماری کلیوی یا فشار خون با پزشک مشورت کن.',
      en: 'Electrolytes (sodium, potassium, magnesium) are vital for fluid balance, nerves, and muscle contraction, and they are lost in sweat. For light training, water and normal food are enough; for long intense sessions or hot weather, an electrolyte drink helps. Avoid sugary everyday versions, and consult a doctor with kidney disease or high blood pressure.'
    },
    {
      id: 'caffeine_energy',
      keywords: [
        'کافئین',
        'کافیین',
        'انرژی زا',
        'نوشیدنی انرژی زا',
        'caffeine',
        'energy drinks',
        'energy drink effects'
      ],
      weak: ['کافئین', 'انرژی زا', 'caffeine', 'energy drink'],
      weakSafe: true,
      hints: ['قهوه', 'چیه', 'مضرات', 'coffee', 'what', 'risks'],
      fa: 'کافئین محرکی است که هوشیاری و تمرکز را موقتاً بالا می‌برد و در قهوه، چای و نوشیدنی‌های انرژی‌زا هست. دوز متعادل (حدود ۲۰۰ تا ۴۰۰ میلی‌گرم در روز برای بیشتر بزرگسالان) معمولاً بی‌خطر است، اما مصرف زیاد و دیرهنگام خواب را خراب می‌کند و اضطراب و تپش قلب می‌دهد. نوشیدنی‌های انرژی‌زا علاوه بر کافئین، شکر زیاد دارند و برای نوجوانان توصیه نمی‌شوند.',
      en: 'Caffeine is a stimulant that temporarily raises alertness and focus, found in coffee, tea, and energy drinks. A moderate dose (about 200 to 400 mg a day for most adults) is usually safe, but high late-day use ruins sleep and can cause anxiety and palpitations. Energy drinks also contain a lot of sugar and are not recommended for teenagers.'
    },
    {
      id: 'beta_alanine',
      keywords: ['بتا آلانین', 'بتا الانین', 'beta alanine', 'beta-alanine'],
      weak: ['بتا آلانین', 'بتا الانین', 'beta alanine'],
      weakSafe: true,
      hints: ['مکمل', 'چیه', 'سوزش', 'supplement', 'what', 'tingling'],
      fa: 'بتا-آلانین مکملی است که ظرفیت تمرینات شدید ۱ تا ۴ دقیقه‌ای را کمی بالا می‌برد و عارضه‌ی معروفش سوزن‌سوزن شدن بی‌خطر پوست است. دوز رایج روزانه حدود ۲ تا ۵ گرم در چند نوبت کوچک است. برای ورزش‌های قدرتی و سرعتی می‌تواند مفید باشد، اما اثرش از کراتین و کافئین کمتر مطالعه‌شده است.',
      en: 'Beta-alanine is a supplement that slightly improves capacity in intense efforts lasting one to four minutes, and its famous side effect is a harmless skin tingling. The usual daily dose is about 2 to 5 grams split into small doses. It can help in strength and sprint sports, but its effect is less studied than creatine and caffeine.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
