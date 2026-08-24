/**
 * Darya - curated factual entries (world domain).
 * Money, finance, and crypto basics; global institutions and economics;
 * and the famous dishes of Iranian cooking. The 2026 probe rounds showed
 * these topics falling to the unknown pool or the source pointer, so the
 * answers live on the offline shelf now. Loaded before knowledge-base.js;
 * registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'bitcoin',
      keywords: [
        'بیت‌کوین',
        'بیتکوین',
        'بیت کوین',
        'بیت‌کوین چیه',
        'بیتکوین چیه',
        'ارز دیجیتال چیه',
        'ارز دیجیتال چیست',
        'کریپتو',
        'bitcoin',
        'what is bitcoin',
        'what is cryptocurrency',
        'crypto',
        'cryptocurrency'
      ],
      weak: [
        'رمزارز',
        'رمز ارز',
        'بلاک‌چین',
        'بلاکچین',
        'blockchain',
        'digital money'
      ],
      weakSafe: true,
      hints: [
        'چیه',
        'چیست',
        'یعنی',
        'معنی',
        'بیت',
        'what',
        'meaning',
        'explain'
      ],
      fa: 'بیت‌کوین اولین ارز دیجیتال جهان است که در ۲۰۰۹ با یک مقاله‌ی ناشناس شروع شد و بر بستر بلاک‌چین کار می‌کند: یک دفتر کل غیرمتمرکز که بدون بانک مرکزی، تراکنش‌ها را ثبت می‌کند. ارزشش به شدت نوسان دارد؛ گاهی چند ده درصد در ماه بالا و پایین می‌شود. نکته‌ی مهم: پولی که می‌توانی از دست بدهی را سرمایه‌گذاری کن، هرگز قرض نکن، و هر «سود تضمینی» یا طرح پانزی را جدی نگیر.',
      en: 'Bitcoin is the first cryptocurrency in the world, born in 2009 from an anonymous paper, and it runs on a blockchain: a decentralized ledger that records transactions without any central bank. Its value is extremely volatile, sometimes moving tens of percent in a single month. The key rule: only invest money you can afford to lose, never borrow to trade, and treat any guaranteed-profit or ponzi scheme as a scam.'
    },
    {
      id: 'stock_market',
      keywords: [
        'بازار بورس',
        'بورس چطور کار می‌کنه',
        'بورس چیست',
        'سهام چیه',
        'سهام چیست',
        'خرید سهام',
        'stock market',
        'how does the stock market work',
        'what is the stock market',
        'what are stocks',
        'buying stocks'
      ],
      weak: ['بورس', 'سهام', 'سهم', 'stock', 'stocks', 'shares', 'exchange'],
      weakSafe: true,
      hints: [
        'چطور',
        'چگونه',
        'چیه',
        'چیست',
        'یعنی',
        'how',
        'what',
        'work',
        'explain'
      ],
      fa: 'بورس بازاری است که در آن سهام شرکت‌ها (سهمی از مالکیت یک شرکت) خرید و فروش می‌شود. وقتی سهم می‌خری، مالک بخشی از آن شرکت می‌شوی و از رشد آن یا سود تقسیمی (سود نقدی سالانه) بهره می‌بری. در بلندمدت (۱۰ تا ۲۰ سال) میانگین بازده بازارهای سهام حدود ۷ تا ۱۰ درصد در سال است، اما در کوتاه‌مدت نوسان دارد. قاعده‌ی طلایی: تنوع بده (چند سهم و چند صنعت)، مبلغ ثابت و منظم بخر (میانگین قیمت خرید پایین می‌آید) و هرگز پولی که به آن نیاز داری را داخل بازار نگذار.',
      en: 'The stock market is where company shares (a piece of ownership in a company) are bought and sold. When you buy a stock you become a part owner, benefiting from growth or annual dividends. Over the long run (10-20 years) stock markets average about 7-10% per year, but they swing in the short term. Golden rules: diversify across stocks and industries, invest a fixed amount regularly to smooth your average price, and never put money you will need soon into the market.'
    },
    {
      id: 'dca_investing',
      keywords: [
        'میانگین قیمت',
        'میانگین هزینه',
        'سرمایه‌گذاری منظم',
        'خرید پله‌ای',
        'dollar cost averaging',
        'what is dollar cost averaging',
        'dca investing',
        'invest regularly'
      ],
      weak: [
        'میانگین',
        'دلار',
        'سرمایه‌گذاری',
        'regular investing',
        'average cost'
      ],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'یعنی', 'چطور', 'چگونه', 'what', 'how', 'invest'],
      fa: 'میانگین‌گیری هزینه (Dollar Cost Averaging) یعنی هر ماه مبلغ ثابتی را بدون توجه به قیمت لحظه‌ای خرید کنی؛ مثلاً ماهی یک‌میلیون تومان سهام یا ارز دیجیتال. وقتی قیمت پایین است سهم بیشتری می‌خری و وقتی بالاست کمتر، پس میانگین قیمت خریدت هموار می‌شود. این روش استرس بازار را کم می‌کند، چون مجبور نیستی زمان دقیق خرید را پیش‌بینی کنی، و برای بلندمدت یکی از معتبرترین روش‌های سرمایه‌گذاری است.',
      en: 'Dollar cost averaging means investing a fixed amount every month regardless of the current price, for example buying one hundred dollars of stocks or crypto monthly. When the price is low you buy more units and when it is high fewer, so your average cost evens out. It removes the stress of timing the market and is one of the most respected long-term investing strategies.'
    },
    {
      id: 'crypto_advice',
      keywords: [
        'کریپتو بخرم',
        'ارز دیجیتال بخرم',
        'سرمایه‌گذاری در کریپتو',
        'بیت‌کوین بخرم',
        'بیتکوین بخرم',
        'کریپتو ارزش داره',
        'should i invest in crypto',
        'is crypto worth it',
        'buy bitcoin',
        'crypto investment advice',
        // 2026 phrasings: «کریپتو هنوز ارزش داره یا نه» (is crypto still
        // worth it) reads the «هنوز» (still) qualifier that the bare
        // «کریپتو ارزش داره» keyword missed.
        'کریپتو هنوز ارزش داره',
        'ارزش داره یا نه',
        'is crypto still worth',
        'crypto still worth'
      ],
      weak: [
        'کریپتو',
        'ارز دیجیتال',
        'بیت‌کوین',
        'رمزارز',
        'crypto',
        'bitcoin'
      ],
      weakSafe: false,
      hints: ['بخرم', 'سرمایه', 'خرید', 'buy', 'invest', 'worth', 'advice'],
      fa: 'ارز دیجیتال می‌تواند بخش کوچکی از یک سبد متنوع باشد، اما یک توصیه‌ی اصولی: فقط با پولی که توان از دست دادنش را داری وارد شو، حداکثر چند درصد از کل سرمایه‌ات، و هرگز با پول قرضی یا پولی که برای اجاره و خوراک لازم داری. نوسان کریپتو بسیار بالاست؛ برنامه‌ای بلندمدت (خرید منظم، نگهداشتن) به‌جای شرط‌بندی لحظه‌ای بهتر است. اگر احساس می‌کنی وسوسه‌ی «یک‌شبه پولدار شدن» داری، همین احساس خودش علامت خطر است.',
      en: 'Crypto can be a small part of a diversified portfolio, but the disciplined rule is: only use money you can afford to lose, cap it at a few percent of your total savings, and never trade with borrowed money or money you need for rent and food. Crypto volatility is extreme; a long-term plan of regular buying and holding beats moment-to-moment gambling. If you feel the pull of getting rich overnight, that feeling is itself the warning sign.'
    },
    {
      id: 'gold_iran',
      keywords: [
        'طلای آب‌شده',
        'طلای اب شده',
        'سکه بخرم',
        'طلا بخرم',
        'طلای ۱۸ عیار',
        'خرید طلا',
        'طلا بخریم یا دلار',
        'سرمایه‌گذاری در طلا',
        'buy gold',
        'gold or dollar',
        'gold investment'
      ],
      weak: ['طلا', 'سکه', 'دلار', 'طلای', 'gold', 'coin'],
      weakSafe: true,
      hints: ['بخرم', 'خرید', 'سرمایه', 'ارزش', 'buy', 'invest', 'worth'],
      fa: 'در ایران طلا سال‌هاست که سپر تورم است، ولی فرق مهم است: طلای آب‌شده کمترین اجرت را دارد (فقط وزن)، سکه‌ی بهار آزادی اجرت ضرب و بازار دارد، و طلای زینتی هم اجرت ساخت دارد که با فروش از بین می‌رود. برای حفظ ارزش، طلای آب‌شده یا سکه‌ی تمام‌بهار معمولاً منطقی‌تر از زینتی است، اما نقدشوندگی و نوسان قیمت روز را هم حساب کن. هرگز همه‌ی سرمایه‌ات را یک‌جا طلا نکن؛ تنوع (طلا، دلار، سهام) ریسک را کم می‌کند.',
      en: 'In Iran gold has long been the inflation shield, but the type matters: molten gold (tala-ye ab-shodeh) has the lowest premium, a Bahar Azadi coin carries minting and market premiums, and jewelry includes workmanship that is lost on resale. For preserving value, molten gold or a full Bahar coin is usually more rational than jewelry, but consider liquidity and daily price swings too. Never put all your savings into gold alone; diversification across gold, dollars, and stocks lowers risk.'
    },
    {
      id: 'opec',
      keywords: ['اوپک', 'اوپک چیه', 'سازمان اوپک', 'opec', 'what is opec'],
      weak: ['نفت', 'oil', 'اوپک'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'یعنی', 'what', 'explain', 'oil'],
      fa: 'اوپک (OPEC) سازمان کشورهای صادرکننده‌ی نفت است که از ۱۹۶۰ کار می‌کند و با هماهنگ‌کردن سهمیه‌ی تولید اعضا، روی قیمت جهانی نفت اثر می‌گذارد. ایران از اعضای مؤسس است. وقتی اعضا تولید را کم می‌کنند قیمت معمولاً بالا می‌رود و برعکس. در سال‌های اخیر اوپک با متحدانی مثل روسیه (اوپک‌پلاس) هماهنگ می‌شود تا بازار را بهتر مدیریت کند.',
      en: 'OPEC, the Organization of the Petroleum Exporting Countries, has operated since 1960 and influences global oil prices by coordinating members production quotas. Iran is a founding member. When members cut output, prices usually rise, and the reverse when they pump more. In recent years OPEC has coordinated with allies such as Russia (OPEC+) to manage the market more effectively.'
    },
    {
      id: 'imf',
      keywords: [
        'صندوق بین‌المللی پول',
        'صندوق بین المللی پول',
        'IMF',
        'what does the imf do',
        'what is the imf'
      ],
      weak: ['صندوق', 'پول', 'imf', 'fund', 'financial crisis'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'چه کاری', 'what', 'do', 'explain'],
      fa: 'صندوق بین‌المللی پول (IMF) نهادی جهانی است که به کشورهای دچار بحران مالی وام کوتاه‌مدت می‌دهد تا پرداخت‌های خارجی‌شان متوقف نشود، معمولاً با شرایطی مثل اصلاح بودجه. در مقابل، بانک جهانی (World Bank) روی پروژه‌های بلندمدت توسعه و زیرساخت سرمایه‌گذاری می‌کند. این دو را نباید اشتباه گرفت: یکی نجات اضطراری، دیگری توسعه‌ی بلندمدت.',
      en: 'The IMF is the global institution that lends short-term emergency money to countries in financial crisis so they do not default on external payments, usually with conditions like budget reform. The World Bank, by contrast, funds long-term development and infrastructure projects. The two are easy to confuse: one is emergency rescue, the other long-term development.'
    },
    {
      id: 'inflation',
      keywords: [
        'چرا تورم بالاست',
        'چرا گرونی',
        'چرا گرون شده',
        'چرا قیمتا گرون شده',
        'قیمتا چرا انقدر بالاست',
        'قیمت‌ها چرا انقدر بالاست',
        'قیمت ها چرا انقدر بالاست',
        'تورم چیه',
        'تورم چیست',
        'علت تورم',
        'why is inflation high',
        'what is inflation',
        'causes of inflation',
        'why are prices rising',
        'why are prices so high',
        'prices keep rising'
      ],
      weak: ['تورم', 'گرونی', 'قیمت‌ها', 'قیمتا', 'inflation', 'prices rising'],
      weakSafe: true,
      hints: ['چرا', 'چیه', 'چیست', 'علت', 'why', 'what', 'cause'],
      fa: 'تورم یعنی بالا رفتن مداوم قیمت‌ها، که ارزش پول را کم می‌کند. سه دلیل اصلی دارد: چاپ پول بیش از تولید واقعی، شوک عرضه (مثل گرانی انرژی یا قطع زنجیره‌ی واردات)، و انتظارات (وقتی همه باور کنند قیمت‌ها بالا می‌رود، زودتر می‌خرند و خودشان تورم را تشدید می‌کنند). در ایران، تحریم‌ها، رشد نقدینگی و افت ارزش پول ملی نقش اصلی را دارند. برای شخص تو: دارایی‌ات را متنوع نگه دار و پول نقد زیاد کنار نگذار.',
      en: 'Inflation is the steady rise of prices, which erodes the value of money. Three main causes: printing money faster than real production, supply shocks (expensive energy, broken import chains), and expectations (when everyone believes prices will rise, they buy sooner and fuel the rise themselves). In Iran, sanctions, money-supply growth, and currency depreciation play the main roles. For you personally: keep your assets diversified and do not hold too much idle cash.'
    },
    {
      id: 'fesenjan',
      keywords: [
        'فسنجون',
        'فسنجان',
        'خورش فسنجان',
        'طرز تهیه فسنجان',
        'fesenjan',
        'how to cook fesenjan',
        'pomegranate walnut stew'
      ],
      weak: ['خورش', 'انار', 'گردو', 'stew', 'pomegranate', 'walnut'],
      weakSafe: true,
      hints: ['طرز', 'پخت', 'درست', 'چطور', 'چگونه', 'how', 'cook', 'recipe'],
      fa: 'فسنجان خورش مجلسی ایرانی است: مرغ یا اردک در سسی غلیظ از گردوی آسیاب‌شده و رب انار می‌پزد و طعم شیرین‌و‌ترش عمیقی پیدا می‌کند. گردو را اول تفت بده تا بوی خامی برود، رب انار را کم‌کم اضافه کن و بگذار سس جا بیفتد؛ با برنج زعفرانی و سبزی خوردن عالی است. در شمال ایران با اردک و در مناطق دیگر با مرغ یا گوشت می‌پزند.',
      en: 'Fesenjan is a celebratory Persian stew: chicken or duck slow-cooked in a thick sauce of ground walnuts and pomegranate molasses, giving a deep sweet-and-sour taste. Toast the walnuts first to remove the raw flavor, add the pomegranate paste gradually, and let the sauce reduce; it shines with saffron rice and fresh herbs. In the north it is made with duck, elsewhere with chicken or meat.'
    },
    {
      id: 'jujeh_kabab',
      keywords: [
        'جوجه کباب',
        'طرز تهیه جوجه کباب',
        'جوجه کباب زعفرانی',
        'jujeh kabab',
        'joojeh kabab',
        'how to make jujeh kabab'
      ],
      weak: ['کباب', 'مرغ', 'زعفران', 'kebab', 'chicken', 'saffron'],
      weakSafe: true,
      hints: ['طرز', 'پخت', 'درست', 'چطور', 'چگونه', 'how', 'cook', 'recipe'],
      fa: 'جوجه کباب از محبوب‌ترین کباب‌های ایرانی است: تکه‌های مرغ (معمولاً ران) در ماست، زعفران، آبلیمو و پیاز رنده‌شده چند ساعت مزه‌دار می‌شود و بعد روی زغال یا گریل کباب می‌شود. نکته‌ی طلایی: شب قبل مزه‌دار کن تا زعفران و ماست به گوشت برسد؛ با برنج زعفرانی، گوجه‌ی کبابی و پیاز سرو کن.',
      en: 'Jujeh kabab is one of Iran most beloved kebabs: chicken pieces (usually thigh) marinated for hours in yogurt, saffron, lemon juice, and grated onion, then grilled over charcoal. The golden tip is to marinate overnight so the saffron and yogurt penetrate the meat; serve with saffron rice, grilled tomatoes, and raw onion.'
    },
    {
      id: 'tahdig_howto',
      keywords: [
        'طرز تهیه ته‌دیگ',
        'ته دیگ چطور درست میشه',
        'ته‌دیگ با ماست',
        'ته دیگ نانی',
        'how to make tahdig',
        'tahdig recipe',
        'crispy rice crust'
      ],
      weak: ['ته‌دیگ', 'ته دیگ', 'برنج', 'تاه‌دیگ', 'tahdig', 'rice'],
      weakSafe: true,
      hints: ['طرز', 'درست', 'چطور', 'چگونه', 'how', 'make', 'recipe'],
      fa: 'ته‌دیگ همان لایه‌ی برنج طلایی و ترد کف قابلمه است که در سفره‌ی ایرانی جایزه‌ی غذاست. ساده‌ترین روش: کف قابلمه روغن بریز، یک لایه برنج مخلوط با ماست و زعفران بگذار، بقیه برنج را رویش بریز و با حرارت متوسط و حوله زیر درب دم بگذار. نسخه‌ی نانی با یک لایه نان تازه خوشمزه‌تر هم هست. نکته: اول حرارت بالا تا ته‌دیگ طلایی شود، بعد کم کن که نسوزد.',
      en: 'Tahdig is the golden crispy rice crust at the bottom of the pot, the treasure of the Persian table. Simplest method: oil the pot bottom, spread a layer of rice mixed with yogurt and saffron, pile the rest of the rice on top, and steam on medium heat with a towel under the lid. A lavash-bread version is even tastier. Tip: high heat first to turn it golden, then lower so it does not burn.'
    },
    {
      id: 'ash_reshteh',
      keywords: [
        'آش رشته',
        'آش رشته چطور',
        'طرز تهیه آش رشته',
        'ash reshteh',
        'noodle soup',
        'how to make ash reshteh'
      ],
      weak: ['آش', 'رشته', 'نخود', 'ash', 'noodle', 'soup'],
      weakSafe: true,
      hints: ['طرز', 'پخت', 'درست', 'چطور', 'چگونه', 'how', 'cook', 'recipe'],
      fa: 'آش رشته یک آش غلیظ و دل‌چسب ایرانی است: رشته‌های پهن، نخود، لوبیا، عدس و سبزی آش (اسفناج، جعفری، تره) با هم می‌پزند و با پیاز داغ، نعناع داغ، کشک و سیر داغ سرو می‌شود. کشک در آخر اضافه می‌شود که ترش نشود. این آش در ماه رمضان و شب‌های سرد محبوب است.',
      en: 'Ash reshteh is a hearty Persian soup: thick noodles, chickpeas, beans, lentils, and soup herbs (spinach, parsley, leek) simmered together and topped with fried onions, mint oil, garlic, and kashk (whey). The kashk goes in at the end so it does not turn sour. It is a favorite in Ramadan and on cold nights.'
    },
    {
      id: 'mirza_ghasemi',
      keywords: [
        'میرزا قاسمی',
        'میرزاقاسمی',
        'طرز تهیه میرزا قاسمی',
        'mirza ghasemi',
        'smoked eggplant dip'
      ],
      weak: ['بادمجان', 'گیلان', 'eggplant', 'smoked'],
      weakSafe: true,
      hints: ['طرز', 'پخت', 'درست', 'چطور', 'چگونه', 'how', 'cook', 'recipe'],
      fa: 'میرزا قاسمی غذای شمالی (گیلان) است: بادمجان‌ها را روی آتش کباب می‌کنند تا پوستشان بسوزد و طعم دودی بگیرد، بعد با سیر، گوجه، رب و زردچوبه تفت می‌دهند و در آخر تخم‌مرغ اضافه می‌کنند. دودیشدن بادمجان راز اصلی طعمش است؛ با نان تازه سرو می‌شود.',
      en: 'Mirza Ghasemi is a Gilan (northern Iran) dish: eggplants are charred over fire so the flesh takes a smoky flavor, then sautéed with garlic, tomatoes, tomato paste, and turmeric, with eggs folded in at the end. The smoky char is the secret of its taste; it is served with fresh bread.'
    }
  ]);

  // Curated factual entries appended by the knowledge-expansion pass.
  global.DaryaFactChunks.push([
    {
      id: 'investing_basics',
      keywords: [
        'چطور سرمایه گذاری کنم',
        'سرمایه گذاری برای مبتدی',
        'اولین سرمایه گذاری',
        'شروع سرمایه گذاری',
        'how to start investing',
        'investing for beginners',
        'start investing',
        'beginner investing'
      ],
      weak: [
        'سرمایه گذاری',
        'سرمایه\u200cگذاری',
        'سرمایه',
        'invest',
        'investing',
        'investment'
      ],
      weakSafe: true,
      hints: [
        'شروع',
        'چطور',
        'چگونه',
        'مبتدی',
        'start',
        'how',
        'beginner',
        'money'
      ],
      fa: 'سرمایه‌گذاری برای مبتدی‌ها چند اصل ساده دارد: اول، اول صندوق اضطراری بساز (معادل چند ماه هزینه‌ی زندگی) در حساب جداگانه با نقدشوندگی بالا؛ دوم، قبل از هر سرمایه‌گذاری بدهی‌های پرنرخ را پرداخت کن؛ سوم، از مبلغ کوچک شروع کن که تحمل زیانش را داری؛ چهارم، تنوع بده (سرمایه را در چند دارایی پخش کن) تا ریسک کم شود؛ پنجم، بلندمدت فکر کن و از تصمیم‌گیری هیجانی موقع نوسان بازار بپرهیز. «میانگین‌گیری دوره‌ای» (خرید مبلغ ثابت در بازه‌های منظم) روش ساده‌ای برای شروع است. هیچ تضمینی در سرمایه‌گذاری وجود ندارد و ریسک همیشه هست؛ در ایران برای قوانین و مالیات با یک مشاور معتبر مشورت کن.',
      en: 'Investing for beginners follows a few simple principles: first, build an emergency fund (a few months of living costs) in a separate, highly liquid account; second, pay off high-interest debt before investing; third, start with a small amount you can afford to lose; fourth, diversify across assets to reduce risk; fifth, think long term and avoid emotional decisions during market swings. Dollar-cost averaging, buying a fixed amount on a regular schedule, is a simple way to begin. There is no guarantee in investing and risk always exists; for local rules and taxes, consult a qualified advisor.'
    }
  ]);

  // Curated factual entry appended by the teaching-topics pass.
  global.DaryaFactChunks.push([
    {
      id: 'trading_risks',
      keywords: [
        'چطور ترید کنم',
        'ترید برای مبتدی',
        'آموزش ترید',
        'ترید ارز دیجیتال',
        'فارکس چیه',
        'آموزش فارکس',
        'فارکس یاد بگیرم',
        'فارکس یاد',
        'بازار بورس ترید',
        'how to trade',
        'trading for beginners',
        'day trading',
        'what is forex',
        'learn to trade',
        'is trading profitable'
      ],
      weak: [
        'ترید',
        'معامله گر',
        'فارکس',
        'باینری',
        'trade',
        'trading',
        'forex',
        'leverage'
      ],
      weakSafe: true,
      hints: [
        'شروع',
        'چطور',
        'یاد',
        'مبتدی',
        'سود',
        'start',
        'learn',
        'beginner',
        'profit',
        'ریسک',
        'risk'
      ],
      fa: 'قبل از هر چیز یک هشدار جدی: ترید (معامله‌گری کوتاه‌مدت، فارکس با اهرم، و باینری) پرریسک‌ترین شکل بازارهای مالی است و اکثر افراد تازه‌کار در آن ضرر می‌کنند؛ تبلیغ «سود تضمینی» یا «درآمد آسان از ترید» تقریباً همیشه کلاهبرداری است. اگر باز هم می‌خواهی یاد بگیری، مسیر درست این است: اول مفاهیم پایه را از منابع معتبر و رایگان بیاموز، با حساب آزمایشی (دمو) تمرین کن، هرگز با پولی که نیاز داری یا قرضی وارد نشو، و هرگز به وعده‌ی سود سریع اعتماد نکن. بازار هیچ تضمینی ندارد و سرمایه می‌تواند کاملاً از بین برود. این متن توصیه‌ی مالی نیست؛ برای تصمیم مالی واقعی با یک مشاور معتبر و دارای مجوز مشورت کن.',
      en: 'Before anything, a serious warning: short-term trading, leveraged forex, and binary options are the riskiest corners of the financial markets, and most beginners lose money; any promise of "guaranteed profit" or "easy income from trading" is almost certainly a scam. If you still want to learn, the honest path is: learn the basics from free, reputable sources first, practice on a demo account, never trade with money you need or have borrowed, and never trust a promise of fast returns. The market offers no guarantees and your capital can be lost entirely. This is not financial advice; for a real decision, consult a qualified, licensed advisor.'
    },

    {
      id: 'budgeting_basics',
      keywords: [
        'بودجه بندی چیه',
        'چطور بودجه بندی کنم',
        'how to budget',
        'budgeting for beginners',
        'what is budgeting'
      ],
      weak: ['budget', 'budgeting', 'بودجه'],
      weakSafe: true,
      hints: ['money', 'finance', 'پول', 'مالی'],
      fa: 'بودجه‌بندی یعنی برنامه‌ای برای اینکه پولت کجا برود. یک روش ساده‌ی «۵۰/۳۰/۲۰» است: حدود ۵۰ درصد برای نیازها (مسکن، غذا)، ۳۰ درصد برای خواسته‌ها و ۲۰ درصد برای پس‌انداز و بدهی. قدم اول، پیگیری یک ماه خرج‌هاست تا بفهمی الگوی واقعی‌ات چیست. بودجه ابزار آگاهی است، نه تنبیه.',
      en: 'Budgeting is a plan for where your money goes. A simple 50/30/20 method allocates roughly 50 percent to needs (housing, food), 30 percent to wants, and 20 percent to saving and debt. The first step is tracking one month of spending to learn your real pattern. A budget is a tool for awareness, not punishment.'
    },
    {
      id: 'emergency_fund',
      keywords: [
        'صندوق اضطراری چیه',
        'چقدر پس انداز اضطراری',
        'what is an emergency fund',
        'how much emergency fund',
        'emergency fund basics'
      ],
      weak: ['emergency fund', 'صندوق اضطراری', 'پس انداز اضطراری'],
      weakSafe: true,
      hints: ['money', 'save', 'پول', 'پس انداز'],
      fa: 'صندوق اضطراری پولی است که فقط برای هزینه‌های غیرمنتظره (تعمیر، بیکاری، درمان) کنار می‌گذاری تا مجبور نشوی بدهی بگیری. پیشنهاد رایج سه تا شش ماه هزینه‌ی زندگی است، اما حتی یک ماه هم شروع خوبی است. آن را جدا و در دسترس ولی نه خیلی راحت نگه دار.',
      en: 'An emergency fund is money set aside only for unexpected costs such as repairs, job loss, or medical care, so you do not have to go into debt. The common guideline is three to six months of living expenses, but even one month is a good start. Keep it separate and accessible, but not too easy to spend.'
    },
    {
      id: 'sleep_hygiene',
      keywords: [
        'بهداشت خواب چیه',
        'چطور بهتر بخوابم',
        'what is sleep hygiene',
        'how to sleep better',
        'sleep hygiene tips'
      ],
      weak: ['sleep hygiene', 'بهداشت خواب'],
      weakSafe: true,
      hints: ['sleep', 'insomnia', 'خواب', 'بی خوابی'],
      fa: 'بهداشت خواب یعنی عادت‌هایی که خواب را بهتر می‌کنند: ساعت خواب و بیداری ثابت، اتاق تاریک و خنک، دوری از صفحه‌ی نمایش و کافئین نزدیک شب، و استفاده از رختخواب فقط برای خواب. اگر بی‌خوابی ادامه‌دار شد، یک پزشک می‌تواند علت‌های جسمی یا روانی را بررسی کند.',
      en: 'Sleep hygiene means habits that improve sleep: a consistent sleep and wake time, a dark cool room, avoiding screens and caffeine near bedtime, and using the bed only for sleep. If insomnia persists, a doctor can check for physical or psychological causes.'
    },
    {
      id: 'stress_physiology',
      keywords: [
        'استرس با بدن چه می کند',
        'کورتیزول چیه',
        'what does stress do to the body',
        'what is cortisol',
        'stress physiology'
      ],
      weak: ['cortisol', 'کورتیزول', 'stress response'],
      weakSafe: true,
      hints: ['stress', 'body', 'استرس', 'بدن'],
      fa: 'استرس پاسخ «جنگ یا گریز» بدن است: مغز هورمون‌هایی مثل کورتیزول و آدرنالین آزاد می‌کند تا برای خطر آماده شوی. این واکنش برای خطر کوتاه‌مدت مفید است، اما استرس مزمن می‌تواند خواب، گوارش، ایمنی و خلق را به هم بریزد. ورزش، تنفس آرام و خواب کافی به تنظیم دوباره‌ی بدن کمک می‌کنند.',
      en: 'Stress is the body fight-or-flight response: the brain releases hormones such as cortisol and adrenaline to prepare for danger. This is useful for short-term threat, but chronic stress can disturb sleep, digestion, immunity, and mood. Exercise, slow breathing, and enough sleep help the body regulate again.'
    }
  ]);

  // =====================================================================
  // World-basics coverage from the 2026-08 audit (12.19): the everyday
  // questions real users asked that fell to filler pools. Respectful,
  // neutral, snapshot-honest entries; long weak words only.
  // =====================================================================
  global.DaryaFactChunks.push([
    {
      id: 'mount_everest',
      keywords: [
        'ارتفاع اورست',
        'بلندترین کوه',
        'اورست چقدر',
        'mount everest',
        'how tall is everest',
        'tallest mountain'
      ],
      weak: ['اورست', 'everest'],
      weakSafe: true,
      hints: ['کوه', 'قله', 'ارتفاع', 'متر', 'mountain', 'tall', 'height'],
      fa: 'قله‌ی اورست در هیمالیا، مرز نپال و چین، با ارتفاع حدود ۸٬۸۴۹ متر (۲۹٬۰۳۲ پا) بلندترین کوه زمین است. ارتفاع رسمی ۸٬۸۴۸٫۸۶ متر در ۲۰۲۰ اعلام شد و به‌خاطر برخورد صفحه‌های زمین‌ساختی هر سال چند میلی‌متر بالاتر می‌رود. اولین فتح موفق در ۱۹۵۳ توسط تنسینگ و هیلاری انجام شد.',
      en: "Mount Everest, in the Himalayas on the Nepal-China border, is Earth's highest mountain at about 8,849 meters (29,032 feet). The official height of 8,848.86 m was announced in 2020, and tectonic uplift raises it a few millimeters each year. It was first summited in 1953 by Tenzing Norgay and Edmund Hillary."
    },
    {
      id: 'ocean_depth',
      keywords: [
        'عمق اقیانوس',
        'عمیق‌ترین نقطه',
        'how deep is the ocean',
        'deepest point',
        'mariana trench',
        'گودال ماریانا'
      ],
      weak: ['ماریانا', 'mariana', 'challenger deep', 'اقیانوس آرام'],
      weakSafe: true,
      hints: ['عمق', 'اقیانوس', 'متر', 'ocean', 'deep', 'depth'],
      fa: 'عمیق‌ترین نقطه‌ی اقیانوس‌ها «چالنجر دیپ» در گودال ماریانا، اقیانوس آرام است: حدود ۱۰٬۹۰۰ تا ۱۱٬۰۰۰ متر، یعنی عمیق‌تر از ارتفاع اورست اگر سراشیبی‌اش می‌گذاشتیم. میانگین عمق اقیانوس‌ها حدود ۳٬۷۰۰ متر است و فشار در ته چالنجر بیش از هزار برابر سطح زمین.',
      en: 'The deepest known point of the oceans is the Challenger Deep in the Mariana Trench, Pacific Ocean: roughly 10,900 to 11,000 meters, deeper than Everest is tall. The average ocean depth is about 3,700 meters, and the pressure at the bottom of the Challenger Deep is over a thousand times the surface pressure.'
    },
    {
      id: 'largest_country',
      keywords: [
        'بزرگترین کشور',
        'بزرگ‌ترین کشور',
        'بزرگترین کشور جهان',
        'بزرگ‌ترین کشور جهان',
        'biggest country',
        'largest country',
        'largest country in the world'
      ],
      weak: ['روسیه', 'russia'],
      weakSafe: true,
      hints: ['کشور', 'مساحت', 'country', 'size', 'area'],
      fa: 'بزرگ‌ترین کشور جهان روسیه با حدود ۱۷ میلیون کیلومترمربع است که یازده منطقه‌ی زمانی را پوشش می‌دهد؛ بعد از آن کانادا، چین/آمریکا و برزیل قرار دارند.',
      en: 'The largest country in the world is Russia at about 17 million square kilometers, spanning eleven time zones; Canada, China or the USA, and Brazil follow.'
    },
    {
      id: 'smallest_country',
      keywords: [
        'کوچکترین کشور',
        'کوچک‌ترین کشور',
        'کوچکترین کشور دنیا',
        'کوچک‌ترین کشور دنیا',
        'smallest country',
        'smallest country in the world'
      ],
      weak: ['واتیکان', 'vatican'],
      weakSafe: true,
      hints: ['کشور', 'مساحت', 'country', 'small'],
      fa: 'کوچک‌ترین کشور جهان واتیکان با حدود ۰٫۴۴ کیلومترمربع است؛ کمتر از یک پارک متوسط شهر و کمتر از تعداد زیادی از میدان‌های شهرها.',
      en: 'The smallest country in the world is Vatican City at about 0.44 square kilometers; smaller than many city parks and roughly the size of a few city blocks.'
    },
    {
      id: 'world_cup_recent',
      keywords: [
        'کی جام جهانی رو برد',
        'قهرمان جام جهانی',
        'برنده جام جهانی',
        'who won the world cup',
        'world cup winners',
        'last world cup winner'
      ],
      weak: ['قهرمان جام جهانی ۲۰۲۲', 'جام جهانی ۲۰۲۲', '2022 world cup'],
      weakSafe: true,
      hints: ['فوتبال', 'جام', 'football', 'soccer', 'world cup'],
      fa: 'قهرمانان دوره‌های اخیر جام جهانی فوتبال: ۲۰۱۸ فرانسه، ۲۰۲۲ آرژانتین (بعد از دراماتیک‌ترین فینال‌ها برابر فرانسه)، و دوره‌ی ۲۰۲۶ با ۴۸ تیم و میزبانی مشترک آمریکا، کانادا و مکزیک برگزار شد. قهرمان هر دوره‌ی تازه را از منبع زنده چک کن؛ چون دانش من عکس فیکس‌شده از یه تاریخ مشخصه.',
      en: 'Recent FIFA World Cup winners: 2018 France, 2022 Argentina (after one of the most dramatic finals ever against France), and the 2026 edition was hosted jointly by the USA, Canada, and Mexico with 48 teams. Check a live source for the newest champion: my knowledge is a snapshot fixed at one date.'
    },
    {
      id: 'us_president_current',
      keywords: [
        'رئیس جمهور آمریکا کیه',
        'رئیس‌جمهور فعلی آمریکا',
        'president of the usa',
        'who is the us president',
        'current us president'
      ],
      weak: ['رئیس جمهور فعلی آمریکا', 'us president'],
      weakSafe: true,
      hints: [
        'آمریکا',
        'ترامپ',
        'بایدن',
        'انتخابات',
        'america',
        'president',
        'election'
      ],
      fa: 'بر اساس عکس دانش من (اوت ۲۰۲۶): دونالد ترامپ در انتخابات نوامبر ۲۰۲۴ پیروز شد و از ژانویه ۲۰۲۵ رئیس‌جمهور آمریکا است؛ جو بایدن دوره‌ی ۲۰۲۱ تا ۲۰۲۵ را داشت و در جولای ۲۰۲۴ از رقابت کنار کشید. برای آخرین اخبار سیاسی، منبع روز چک کن.',
      en: 'As of my knowledge snapshot (August 2026): Donald Trump won the November 2024 election and has been president since January 2025; Joe Biden served 2021 to 2025 and withdrew from the race in July 2024. For anything newer, check a current source.'
    },
    {
      id: 'prophet_muhammad',
      keywords: [
        'پیامبر اسلام کی بود',
        'حضرت محمد کی بود',
        'محمد پیامبر',
        'who was prophet muhammad',
        'who is muhammad'
      ],
      weak: ['پیامبر اسلام', 'حضرت محمد', 'prophet muhammad'],
      weakSafe: true,
      hints: ['اسلام', 'قرآن', 'تاریخ', 'islam', 'prophet', 'history'],
      fa: 'محمد بن عبدالله (حدود ۵۷۰ تا ۶۳۲ میلادی) پیامبر اسلام و، به باور مسلمانان، آخرین پیامبر الهی است. در مکه به دنیا آمد، در ۴۰ سالگی رسالتش آغاز شد، هجرت به مدینه در ۶۲۲ آغاز تقویم هجری است و قرآن در دوره‌ی او نازل شد. مسلمانان او را الگوی اخلاق و عدالت می‌دانند و سنت زندگی‌اش سیره نامیده می‌شود.',
      en: 'Muhammad ibn Abdullah (c. 570-632 CE) is the prophet of Islam and, in Muslim belief, the final messenger of God. Born in Mecca, his mission began at forty; the migration to Medina in 622 marks the start of the Islamic calendar, and the Quran was revealed during his life. Muslims regard him as a model of ethics and justice, and his life tradition is called the Sunnah.'
    },
    {
      id: 'jesus_christ',
      keywords: [
        'عیسی کی بود',
        'حضرت عیسی',
        'who was jesus',
        'who is jesus',
        'jesus christ'
      ],
      weak: ['عیسی مسیح', 'مسیح'],
      weakSafe: true,
      hints: ['مسیحیت', 'دین', 'تاریخ', 'christianity', 'religion', 'bible'],
      fa: 'عیسی ناصری (حدود ۴ پیش از میلاد تا ۳۰/۳۳ میلادی) شخصیت محوری مسیحیت و یکی از پیامبران گرامی در اسلام است. در فلسطین زیست و تعالیمش درباره‌ی محبت، بخشش و پادشاهی خدا، پایه‌ی اخلاق مسیحی شد؛ مسیحیان او را پسر خدا و منجی می‌دانند و تصلیب و رستاخیزش مرکز ایمان مسیحی است.',
      en: 'Jesus of Nazareth (c. 4 BCE to 30/33 CE) is the central figure of Christianity and one of the revered prophets in Islam. He lived in Palestine; his teachings on love, forgiveness, and the kingdom of God became the foundation of Christian ethics. Christians regard him as the Son of God and Savior, and his crucifixion and resurrection are the center of Christian faith.'
    },
    {
      id: 'buddha_figure',
      keywords: [
        'بودا کی بود',
        'بودا کیه',
        'بودا کیست',
        'بودا چیست',
        'who was buddha',
        'who is buddha'
      ],
      weak: ['سیدارتا', 'siddhartha'],
      weakSafe: true,
      hints: ['بودیسم', 'بوداگرایی', 'آیین', 'buddhism', 'religion'],
      fa: 'بودا معمولاً یعنی سیدارتا گوتاما (حدود قرن پنجم یا ششم پیش از میلاد)، شاهزاده‌ای که در هند با دیدن رنج، در جست‌وجوی رهایی رفت و زیر درخت روشانی به «بیداری» رسید. آموزه‌هایش (چهار حقیقت نجیب و راه میانه) پایه‌ی بودیسم شد: رنج، ریشه‌ی رنج، پایان رنج و مسیر پایان آن.',
      en: 'The Buddha usually refers to Siddhartha Gautama (around the fifth or sixth century BCE), a prince in India who, after seeing suffering, sought liberation and attained awakening under the Bodhi tree. His teachings (the Four Noble Truths and the Middle Way) founded Buddhism: suffering, its cause, its end, and the path to that end.'
    },
    {
      id: 'quran_book',
      keywords: [
        'قرآن چیه',
        'قران چیه',
        'what is the quran',
        'about the quran'
      ],
      weak: ['قرآن', 'quran'],
      weakSafe: true,
      hints: ['اسلام', 'کتاب', 'وحی', 'islam', 'book', 'scripture'],
      fa: 'قرآن کتاب مقدس مسلمانان است؛ به باور آنان کلام وحیانی خدا که در حدود ۲۳ سال بر محمد نازل شده و در ۱۱۴ سوره گردآوری شده است. متن عربی آن برای مسلمانان نشانه‌ی ادبی بی‌همتاست و حفظ، تلاوت و تفسیرش در تمام سنت اسلامی محور است.',
      en: "The Quran is the holy scripture of Islam; Muslims believe it to be God's revealed word, delivered to Muhammad over about 23 years and compiled into 114 surahs. Its Arabic text is regarded by Muslims as a matchless literary sign, and its memorization, recitation, and interpretation are central to Islamic tradition."
    },
    {
      id: 'bible_book',
      keywords: [
        'انجیل چیه',
        'کتاب مقدس چیه',
        'what is the bible',
        'about the bible'
      ],
      weak: ['کتاب مقدس', 'bible', 'انجیل'],
      weakSafe: true,
      hints: ['مسیحیت', 'دین', 'عهد', 'christianity', 'scripture', 'testament'],
      fa: 'کتاب مقدس مسیحیان (بایبل) از دو بخش اصلی ساخته شده: عهد عتیق که با تنخ یهودی مشترک است و عهد جدید که چهار انجیل، اعمال رسولان، نامه‌ها و مکاشفه را در بر می‌گیرد. «انجیل» به‌طور خاص گزارش زندگی و تعالیم عیسی است و ترجمه‌های متعدد کتاب مقدس پرفروش‌ترین کتاب تاریخند.',
      en: 'The Christian Bible has two main parts: the Old Testament, shared with the Hebrew Bible, and the New Testament, containing the four Gospels, Acts, the letters, and Revelation. The \"Gospel\" specifically is the account of Jesus\'s life and teachings, and Bible translations are the best-selling books in history.'
    },
    {
      id: 'what_is_love',
      keywords: [
        'عشق چیه',
        'عشق چیست',
        'معنی عشق',
        'what is love',
        'meaning of love'
      ],
      weak: ['تعریف عشق'],
      weakSafe: true,
      hints: ['عشق', 'احساس', 'رابطه', 'love', 'feeling', 'relationship'],
      fa: 'عشق هم فیزیولوژی است، هم روان‌شناسی و هم انتخاب. زیست‌شناسی: پیوندها با اکسی‌توسین و دوپامین تقویت می‌شوند. روان‌شناسی: رابرت استرنبرگ عشق را ترکیب صمیمیت، شور و تعهد می‌داند. و در عمل، عشق چیزی است که روزمره ساخته می‌شود: توجه، حضور و ماندن در روزهای سخت. شاید بهترین تعریف این است که عشق فعلی است که حس، شروعش می‌کند.',
      en: 'Love is physiology, psychology, and a choice at once. Biologically, bonds are reinforced by oxytocin and dopamine. Psychologically, Robert Sternberg described love as intimacy, passion, and commitment. And in practice, love is built daily: attention, presence, and staying through the hard days. Perhaps the best definition is that love is a practice that a feeling starts.'
    },
    {
      id: 'how_planes_fly',
      keywords: [
        'هواپیما چطور پرواز می‌کند',
        'هواپیما چطور پرواز میکنه',
        'how do planes fly',
        'how does a plane fly'
      ],
      weak: ['بال هواپیما', 'برآر'],
      weakSafe: true,
      hints: ['هواپیما', 'بال', 'پرواز', 'plane', 'wing', 'fly', 'lift'],
      fa: 'هواپیما با بال‌های خمیده‌شده پرواز می‌کند: هوایی که از بال می‌گذرد بالا سوراخ را سریع‌تر طی می‌کند، فشار آن پایین می‌آید و فشار بیشتر زیر بال، هواپیما را بالا می‌راند (نیروی برآر). طبق قانون سوم نیوتن، بال هوا را به پایین هُل می‌دهد و هوا بال را به بالا. موتورها هم برای سرعت کافی می‌کشند، نه بالا رفتن مستقیم.',
      en: "Planes fly thanks to wing shape: air flowing over the curved top moves faster, its pressure drops, and the higher pressure under the wing pushes it up (lift). By Newton's third law, the wing deflects air downward and the air pushes the wing up. Engines provide the forward speed that makes all of this possible rather than lifting directly."
    },
    {
      id: 'how_magnets_work',
      keywords: [
        'آهنربا چطور کار می‌کند',
        'آهنربا چطور کار می‌کنه',
        'آهنربا چیه',
        'how do magnets work',
        'how do magnets stick'
      ],
      weak: ['میدان مغناطیسی', 'magnetic field'],
      weakSafe: true,
      hints: ['آهنربا', 'فلز', 'magnet', 'metal', 'iron'],
      fa: 'آهنربا به‌خاطر الکترون‌هایش کار می‌کند: هر الکترون مثل یک آهنربای خیلی کوچک می‌چرخد و در آهن، این چرخش‌ها در ناحیه‌هایی (دامنه‌ها) هم‌راستا می‌شوند. وقتی دامنه‌ها یک‌دست شوند، فلز یک میدان مغناطیسی کلی می‌سازد که آهن را می‌کشد و قطب‌های همنام را می‌راند. حرارت و ضربه می‌توانند این نظم را به‌هم بزنند.',
      en: 'Magnets work because of their electrons: each electron spins like a tiny magnet, and in iron these spins align in regions called domains. When the domains line up together, the metal produces an overall magnetic field that attracts iron and repels like poles. Heat or impact can knock that order out.'
    },
    {
      id: 'why_cats_purr',
      keywords: [
        'چرا گربه خرخر می‌کند',
        'چرا گربه خرخر میکنه',
        'why do cats purr'
      ],
      weak: ['خرخر گربه', 'cat purr'],
      weakSafe: true,
      hints: ['گربه', 'cat', 'purr'],
      fa: 'گربه‌ها با ارتعاش تارهای صوتی حدود ۲۵ تا ۱۵۰ هرتز خرخر می‌کنند و فقط برای رضایت نیست: خرخر در مواقع استرس، بیماری و زایمان هم دیده می‌شود. یکی از فرضیه‌های جالب این است که همین بسامد پایین به ترمیم استخوان و بافت کمک می‌کند؛ یعنی خرخر هم لذت است و هم خوددرمانی.',
      en: 'Cats purr by vibrating their vocal folds at roughly 25 to 150 hertz, and not only from contentment: purring appears during stress, illness, and labor too. One intriguing hypothesis is that those low frequencies help heal bones and tissue, so purring may be both pleasure and self-care.'
    },
    {
      id: 'what_is_time',
      keywords: [
        'زمان چیه',
        'زمان چیست',
        'what is time',
        'what is time in physics'
      ],
      weak: ['تعریف زمان'],
      weakSafe: true,
      hints: ['فیزیک', 'ساعت', 'نسبیت', 'physics', 'clock', 'relativity'],
      fa: 'فیزیک زمان را مثل ابزار اندازه‌گیری تغییر می‌بیند: بدون تغییر، زمانی برای سنجیدن نیست. در نسبیت اینشتین زمان مطلق نیست؛ با سرعت و گرانش کند یا تند می‌شود (ساعت‌های GPS هر روز این تصحیح را انجام می‌دهند) و فیزیک کوانتوم بحث «جریان» زمان را مبهم می‌گذارد. تجربه‌ی زیسته‌ی زمان هم شگفت است: شادی کوتاه، انتظار بلند.',
      en: 'Physics treats time as the measure of change: without change, there is nothing to measure. In Einstein\'s relativity time is not absolute; it slows with speed and gravity (GPS satellites correct for it daily), and quantum physics leaves the \"flow\" of time puzzling. Lived time is strange too: joy is short, waiting is long.'
    },
    {
      id: 'tehran_derby',
      keywords: [
        'استقلال یا پرسپولیس',
        'استقلال بهتره یا پرسپولیس',
        'پرسپولیس بهتره یا استقلال',
        'esteghlal or persepolis',
        'tehran derby',
        'داربی تهران'
      ],
      weak: ['استقلال و پرسپولیس', 'داربی'],
      weakSafe: true,
      hints: ['فوتبال', 'تیم', 'ایران', 'football', 'team', 'iran'],
      fa: 'داربی تهران، دیدار استقلال و پرسپولیس، یکی از پرشورترین شهرآورد‌های آسیاست؛ از دهه‌ی ۱۳۴۰ تا امروز ادامه داشته و استادیوم آزادی را پر می‌کند. اینجا داوری ممکن نیست: دو تا تاریخ، دو تا هویت و عده‌ی زیادی از دو طرف که هر کدام حق دارند تیمشون رو دوست داشته باشن. تو کدوم ستی؟',
      en: "The Tehran derby, Esteghlal vs Persepolis, is one of Asia's most passionate rivalries; it has run since the 1960s and fills Azadi Stadium. No referee call from me here: two histories, two identities, and millions on each side who each have the right to love their team. Which side are you on?"
    },
    {
      id: 'military_service_iran',
      keywords: [
        'خدمت سربازی چقدر طول میکشه',
        'خدمت سربازی چقدره',
        'سربازی چقدره',
        'سربازی چقدر طول میکشه',
        'مدت سربازی',
        'military service iran duration',
        'how long is military service in iran'
      ],
      weak: ['مدت خدمت سربازی', 'کسری سربازی'],
      weakSafe: true,
      hints: [
        'سربازی',
        'نظام',
        'کارت پایان خدمت',
        'military',
        'service',
        'conscription'
      ],
      fa: 'مدت خدمت سربازی ایران ثابت نیست و به محل خدمت، نوع یگان، وضعیت مشمول و قوانین روز بستگی دارد؛ به‌طور تاریخی حدود ۲۱ تا ۲۴ ماه است و برای مناطق محروم یا شرایط خاص کسری خدمت هم دیده شده. معافیت‌ها (تحصیلی، کفالت، خرید از رده محدود) هم پیوسته تغییر می‌کنند، پس برای تصمیم فردی حتماً آخرین آیین‌نامه رسمی و پاسخگوی سازمان نظام وظیفه را چک کن.',
      en: "The duration of Iran's military service is not fixed: it depends on posting location, unit type, personal status, and current rules; historically around 21 to 24 months, with reductions for deprived regions or special conditions. Exemptions (education, family care, the limited purchase scheme) also change continually, so check the latest official regulations with the conscription organization for a personal case."
    },
    {
      id: 'speed_of_light',
      keywords: [
        'سرعت نور چنده',
        'سرعت نور چقدره',
        'speed of light',
        'how fast is light'
      ],
      weak: ['سرعت نور'],
      weakSafe: true,
      hints: ['نور', 'فیزیک', 'light', 'physics', 'km'],
      fa: 'سرعت نور در خلا ۲۹۹٬۷۹۲٬۴۵۸ متر بر ثانیه است؛ تقریباً ۳۰۰ هزار کیلومتر بر ثانیه. هیچ چیز اطلاعاتی یا مادی نمی‌تواند از آن سریع‌تر باشد و همین عدد، متر را تعریف می‌کند. نور در یک ثانیه هفت بار و نیم دور زمین می‌چرخد.',
      en: 'The speed of light in vacuum is 299,792,458 meters per second, roughly 300,000 km per second. Nothing carrying information or matter can travel faster, and this exact number now defines the meter. Light circles the Earth about seven and a half times in one second.'
    },
    {
      id: 'eiffel_tower',
      keywords: [
        'برج ایفل چقدر بلنده',
        'برج ایفل کجاست',
        'how tall is the eiffel tower',
        'eiffel tower height'
      ],
      weak: ['برج ایفل', 'eiffel tower'],
      weakSafe: true,
      hints: ['پاریس', 'فرانسه', 'برج', 'paris', 'france', 'tower'],
      fa: 'برج ایفل در پاریس حدود ۳۳۰ متر بلند است (با آنتن) و در ۱۸۸۹ برای نمایشگاه جهانی، به مهندسی شرکت گوستاو ایفل ساخته شد؛ در زمان ساخت بلندترین سازه‌ی جهان بود و قرار بود موقت باشد! حالا نماد فرانسه و پربازدیدترین بنای پولی دنیاست.',
      en: "The Eiffel Tower in Paris is about 330 meters tall (with antennas) and was built in 1889 for the World's Fair by Gustave Eiffel's company; it was the tallest structure in the world at the time and was meant to be temporary. Today it is the symbol of France and the most visited paid monument on Earth."
    },
    {
      id: 'taj_mahal',
      keywords: [
        'تاج محل کجاست',
        'تاج محل رو کی ساخت',
        'who built the taj mahal',
        'where is the taj mahal'
      ],
      weak: ['تاج محل', 'taj mahal'],
      weakSafe: true,
      hints: ['هند', 'آگرا', 'india', 'agra', 'mausoleum'],
      fa: 'تاج محل در شهر آگرای هند است و شاه‌جهان، امپراتور گورکانی، بین حدود ۱۶۳۲ تا ۱۶۵۳ به یاد همسرش ممتاز محل ساخت؛ آرامگاه سفید مرمرینش ترکیبی از معماری ایرانی، هندی و اسلامی است و یکی از عجایب هفت‌گانه‌ی جدید دنیا شناخته می‌شود.',
      en: 'The Taj Mahal stands in Agra, India; the Mughal emperor Shah Jahan built it between about 1632 and 1653 in memory of his wife Mumtaz Mahal. Its white marble mausoleum blends Persian, Indian, and Islamic architecture and is counted among the new seven wonders of the world.'
    },
    {
      id: 'human_bones',
      keywords: [
        'بدن انسان چند استخوان داره',
        'انسان چند استخوان داره',
        'how many bones do humans have',
        'how many bones in the human body'
      ],
      weak: ['تعداد استخوان بدن'],
      weakSafe: true,
      hints: ['استخوان', 'بدن', 'bone', 'body', 'anatomy'],
      fa: 'بدن یک بزرگسال ۲۰۶ استخوان دارد، اما نوزاد با حدود ۲۷۰ عضو شروع می‌کند؛ بسیاری از آن‌ها در رشد به هم جوش می‌خورند. بلندترین استخوان، ران و کوچک‌ترینشان در گوش میانی است.',
      en: 'An adult human body has 206 bones, but a baby starts with around 270; many of them fuse during growth. The longest is the femur and the smallest ones sit in the middle ear.'
    },
    {
      id: 'why_grass_green',
      keywords: [
        'چرا علف سبزه',
        'چرا چمن سبزه',
        'why is grass green',
        'why are plants green'
      ],
      weak: ['کلروفیل', 'chlorophyll'],
      weakSafe: true,
      hints: ['علف', 'گیاه', 'رنگ', 'grass', 'plant', 'green', 'color'],
      fa: 'علف و برگ سبزند چون کلروفیل، رنگدانه‌ی فتوسنتز، نور آبی و قرمز را برای ساخت غذا جذب می‌کند و سبز را بازمی‌تاباند؛ چشم ما هم همان سبز بازتابیده را می‌بیند. پاییز وقتی کلروفیل تمام می‌شود، زرد و نارنجی پنهان زیرین پیدا می‌شود.',
      en: 'Grass and leaves are green because chlorophyll, the pigment of photosynthesis, absorbs blue and red light to make food and reflects green; our eyes see that reflected green. In autumn, when chlorophyll runs out, the hidden yellows and oranges underneath show.'
    },
    {
      id: 'why_we_dream',
      keywords: ['چرا خواب میبینیم', 'چرا خواب می‌بینیم', 'why do we dream'],
      weak: ['خواب دیدن', 'dreaming'],
      weakSafe: true,
      hints: ['خواب', 'رؤیا', 'مغز', 'sleep', 'dream', 'brain', 'rem'],
      fa: 'هیچ‌کس هنوز جواب قطعی ندارد اما فرضیه‌های اصلی این‌هاست: تثبیت حافظه (مغز خاطرات روز را مرتب می‌کند)، پردازش هیجان (خواب دیدن مثل شب‌مانور احساسات است) و تمرین شبیه‌سازی تهدیدها و موقعیت‌ها. خواب‌های پرجزئیات بیشتر در مرحله‌ی REM رخ می‌دهند، وقتی مغز پربازده‌تر از بدن فعال است.',
      en: "No one knows for certain, but the leading hypotheses are: memory consolidation (the brain files the day's experiences), emotional processing (dreaming as overnight drill for feelings), and simulation practice for threats and situations. Vivid dreams mostly happen in REM sleep, when the brain is more active than the body."
    },
    {
      id: 'how_vaccines_work',
      keywords: [
        'واکسن چطور کار می‌کند',
        'واکسن چطور کار می‌کنه',
        'واکسن چیه',
        'how do vaccines work',
        'how do vaccines'
      ],
      weak: ['عملکرد واکسن', 'vaccine'],
      weakSafe: true,
      hints: ['بیماری', 'ایمنی', 'ویروس', 'disease', 'immune', 'virus'],
      fa: 'واکسن سیستم ایمنی را تمرین می‌دهد: نسخه‌ی بی‌خطر یا بخشی از عامل بیماری (پروتئین، ضعیف‌شده یا پیام ساخت آن) به بدن معرفی می‌شود تا پادتن و حافظه‌ی ایمنی ساخته شود؛ بعد اگر ویروس واقعی بیاید، بدن از قبل مسلح است. واژگان «فلج کودکان» و «آبله‌مرغان» چقدر رایج شنیده می‌شد و حالا نه؟ کار واکسن است.',
      en: 'Vaccines train the immune system: a safe version or a piece of a pathogen (a protein, a weakened form, or the instructions to make one) is introduced so the body builds antibodies and immune memory; if the real virus arrives, the body is already armed. Terms like \"polio\" and \"smallpox\" fading from everyday speech is what vaccines did.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
