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
      en: 'Bitcoin is the world first cryptocurrency, born in 2009 from an anonymous paper, and it runs on a blockchain: a decentralized ledger that records transactions without any central bank. Its value is extremely volatile, sometimes moving tens of percent in a single month. The key rule: only invest money you can afford to lose, never borrow to trade, and treat any guaranteed-profit or ponzi scheme as a scam.'
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
        'crypto investment advice'
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
})(typeof window !== 'undefined' ? window : globalThis);
