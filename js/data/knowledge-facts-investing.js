/**
 * Darya - curated factual entries (cryptocurrencies, stocks, investing).
 * Loaded before knowledge-base.js; registers a global part. No live
 * prices or return promises: values and ranks change and are stated as
 * general, non-time-sensitive facts only.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'solana',
      keywords: [
        'سولانا',
        'سولانا چیه',
        'ارز سولانا',
        'solana',
        'what is solana',
        'sol crypto'
      ],
      weak: ['سولانا', 'solana', 'sol'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'ارز', 'what', 'crypto', 'blockchain'],
      fa: 'سولانا بلاک‌چینی است که برای سرعت بالا و کارمزد پایین طراحی شد و با مکانیزم اثبات سهام کار می‌کند. به‌خاطر تراکنش‌های ارزان، میزبان پروژه‌های زیادی از دیفای و NFT و میم‌کوین شده است. رقیب اصلی اتریوم در سرعت و هزینه به شمار می‌رود، هرچند در طول سال‌ها چند قطعی شبکه را هم تجربه کرده است.',
      en: 'Solana is a blockchain designed for high speed and low fees, running on a proof-of-stake mechanism. Its cheap transactions made it home to many DeFi, NFT, and meme-coin projects. It is considered Ethereum’s main rival in speed and cost, though it has also experienced network outages over the years.'
    },
    {
      id: 'cardano',
      keywords: [
        'کاردانو',
        'کاردانو چیه',
        'ارز کاردانو',
        'cardano',
        'what is cardano',
        'ada crypto'
      ],
      weak: ['کاردانو', 'cardano', 'ada'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'ارز', 'what', 'crypto', 'blockchain'],
      fa: 'کاردانو بلاک‌چینی است که با رویکرد پژوهش‌محور و داوری علمی ساخته شد؛ هر به‌روزرسانی‌اش معمولاً با مقاله‌ی داوری‌شده همراه است. واحد ارز آن ADA است و بر قراردادهای هوشمند و اثبات سهام تمرکز دارد. طرفدارانش به روش علمی و توسعه‌ی مرحله‌ای‌اش افتخار می‌کنند، هرچند سرعت توسعه‌اش کندتر از رقباست.',
      en: 'Cardano is a blockchain built with a research-first, peer-reviewed approach; its upgrades are usually accompanied by reviewed papers. Its currency unit is ADA, focused on smart contracts and proof of stake. Fans value its scientific method and staged development, though its pace is slower than rivals.'
    },
    {
      id: 'stablecoins',
      keywords: [
        'استیبل کوین',
        'تتر',
        'یو اس دی سی',
        'استیبل کوین چیه',
        'stablecoin',
        'what is tether',
        'usdt usdc'
      ],
      weak: ['تتر', 'استیبل کوین', 'stablecoin', 'usdt', 'usdc', 'tether'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'ارز', 'what', 'crypto', 'stable'],
      fa: 'استیبل‌کوین‌ها ارزهای دیجیتالی‌اند که ارزششان به دارایی دیگری مثل دلار گره خورده تا نوسان کمتری داشته باشند. تتر (USDT) و یواس‌دی‌سی (USDC) معروف‌ترین‌هایشان‌اند و برای جابه‌جایی پول در دنیای کریپتو و حفظ ارزش در بازار پرنوسان استفاده می‌شوند. پشتوانه و شفافیت هرکدام متفاوت است و باید پیش از استفاده بررسی شود.',
      en: 'Stablecoins are cryptocurrencies whose value is pegged to another asset like the dollar so they swing less. Tether (USDT) and USDC are the best known, used to move money around crypto and hold value in a volatile market. Each has different backing and transparency, which should be checked before use.'
    },
    {
      id: 'other_coins',
      keywords: [
        'ریپل',
        'لایت کوین',
        'بایننس کوین',
        'ریپل چیه',
        'ripple xrp',
        'litecoin',
        'bnb'
      ],
      weak: ['ریپل', 'لایت کوین', 'بایننس', 'ripple', 'xrp', 'litecoin', 'bnb'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'ارز', 'what', 'crypto', 'coin'],
      fa: 'چند ارز دیجیتال شناخته‌شده: ریپل (XRP) برای انتقال بین‌بانکی سریع و ارزان طراحی شد و با نهادهای مالی همکاری می‌کند؛ لایت‌کوین از قدیمی‌ترین رمزارزهاست و نسخه‌ای سبک‌تر از بیت‌کوین خوانده می‌شود؛ و BNB ارز بومی صرافی بایننس است که برای کارمزد و اکوسیستم آن استفاده می‌شود. هرکدام کاربری متفاوتی دارند، نه صرفاً «پول دیجیتال».',
      en: 'A few well-known coins: Ripple (XRP) was designed for fast, cheap interbank transfers and works with financial institutions; Litecoin is among the oldest cryptocurrencies, often called a lighter Bitcoin; and BNB is the native coin of the Binance exchange, used for fees and its ecosystem. Each has a different use beyond just digital money.'
    },
    {
      id: 'stock_indices',
      keywords: [
        'اس اند پی ۵۰۰',
        'شاخص بورس',
        'داوجونز',
        's&p 500',
        'sp500',
        'what is the s&p 500',
        'dow jones'
      ],
      weak: [
        'اس اند پی',
        'داوجونز',
        'شاخص',
        's&p 500',
        'sp500',
        'dow jones',
        'index'
      ],
      weakSafe: true,
      hints: ['بورس', 'چیه', 'چیست', 'سهام', 'stock', 'what', 'market'],
      fa: 'شاخص‌های بورس میانگین عملکرد گروهی از سهام را نشان می‌دهند: اس‌اندپی ۵۰۰ میانگین ۵۰۰ شرکت بزرگ آمریکاست و نماینده‌ی کلی بازار به شمار می‌رود، داوجونز فقط ۳۰ شرکت صنعتی بزرگ را می‌سنجد، و نزدک بر شرکت‌های فناوری متمرکز است. سرمایه‌گذاری در صندوق شاخصی (که کل شاخص را می‌خرد) روش ساده و کم‌هزینه‌ی تنوع‌بخشی است.',
      en: 'Stock indices show the average performance of a group of shares: the S&P 500 averages the 500 largest US companies and represents the broad market, the Dow Jones measures only 30 large industrial companies, and the Nasdaq focuses on technology. Investing in an index fund (which buys the whole index) is a simple, low-cost way to diversify.'
    },
    {
      id: 'index_etf',
      keywords: [
        'صندوق شاخصی',
        'ای تی اف چیه',
        'صندوق سرمایه گذاری',
        'index fund',
        'what is an etf',
        'etf vs mutual fund'
      ],
      weak: ['صندوق', 'ای تی اف', 'etf', 'index fund'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'سرمایه', 'بورس', 'what', 'invest', 'stock'],
      fa: 'صندوق شاخصی (Index Fund) سبدی است که کل یک شاخص را با هزینه‌ی کم دنبال می‌کند، به‌جای اینکه بخواهد بازار را شکست دهد. ETF نوعی صندوق است که مثل سهام در بورس خرید و فروش می‌شود. برای بیشتر افراد، سرمایه‌گذاری منظم در صندوق شاخصی کم‌هزینه، ساده‌ترین راه مشارکت در رشد بلندمدت بازار است.',
      en: 'An index fund is a portfolio that tracks a whole index at low cost instead of trying to beat the market. An ETF is a fund that trades like a stock on an exchange. For most people, investing regularly in a low-cost index fund is the simplest way to participate in the market’s long-term growth.'
    },
    {
      id: 'bonds_dividends',
      keywords: [
        'اوراق قرضه',
        'سود تقسیمی',
        'باند چیه',
        'bonds',
        'dividends',
        'what is a bond'
      ],
      weak: ['اوراق', 'سود تقسیمی', 'bonds', 'dividend'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'سرمایه', 'what', 'invest', 'income'],
      fa: 'اوراق قرضه (Bond) وامی است که تو به دولت یا شرکت می‌دهی و در ازای آن سود ثابت دوره‌ای می‌گیری؛ ریسکش معمولاً از سهام کمتر اما بازدهش هم معمولاً کمتر است. سود تقسیمی (Dividend) بخشی از سود شرکت است که به سهامدارانش پرداخت می‌شود. ترکیب سهام و اوراق، تعادل ریسک و بازده سبد را تنظیم می‌کند.',
      en: 'A bond is a loan you make to a government or company in exchange for fixed periodic interest; it usually carries less risk than stocks but also lower returns. A dividend is a share of a company’s profit paid to its shareholders. Mixing stocks and bonds tunes the balance of risk and return in a portfolio.'
    },
    {
      id: 'investing_diversify',
      keywords: [
        'تنوع سبد سرمایه',
        'تنوع بخشی',
        'مدیریت ریسک سرمایه',
        'diversification',
        'how to diversify investments',
        'investment risk management'
      ],
      weak: ['تنوع', 'سبد', 'diversification', 'portfolio'],
      weakSafe: true,
      hints: ['سرمایه', 'ریسک', 'بورس', 'invest', 'risk', 'stock'],
      fa: 'تنوع‌بخشی یعنی پولت را روی چند دارایی و صنعت پخش کنی تا افت یکی، کل سبد را نزند. قاعده‌های پایه: فقط پولی را سرمایه‌گذاری کن که به آن نیاز فوری نداری، مبلغ ثابت و منظم بخر، هزینه‌های معاملات را پایین نگه دار و افق بلندمدت داشته باش. هیچ سرمایه‌گذاری بدون ریسک نیست و وعده‌ی «سود تضمینی» تقریباً همیشه کلاهبرداری است.',
      en: 'Diversification means spreading your money across several assets and industries so a drop in one does not sink the whole portfolio. Basic rules: invest only money you do not need soon, buy a fixed amount regularly, keep trading costs low, and keep a long-term horizon. No investment is risk-free, and a promised guaranteed profit is almost always a scam.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
