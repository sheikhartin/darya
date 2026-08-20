/**
 * Darya - curated factual entries (markets, crypto, and tech companies).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'nasdaq',
      keywords: [
        'نزدک',
        'نزدک چیه',
        'بورس نزدک',
        'nasdaq',
        'what is nasdaq',
        'nasdaq index'
      ],
      weak: ['نزدک', 'nasdaq'],
      weakSafe: true,
      hints: [
        'بورس',
        'چیه',
        'چیست',
        'سهام',
        'stock',
        'what',
        'index',
        'market'
      ],
      fa: 'نزدک یک بورس الکترونیکی آمریکایی است که از ۱۹۷۱ فعالیت می‌کند و به‌خاطر تمرکز بر شرکت‌های فناوری معروف است؛ اپل، مایکروسافت، انویدیا و آمازون همه آنجا معامله می‌شوند. «شاخص نزدک» میانگین وزنی قیمت سهام شرکت‌های حاضر در آن است و معمولاً به‌عنوان دماسنج بخش فناوری دیده می‌شود. بورس نیویورک رقیب سنتی‌تر آن است.',
      en: 'Nasdaq is an American electronic stock exchange operating since 1971, famous for its focus on technology companies; Apple, Microsoft, NVIDIA, and Amazon all trade there. The Nasdaq index is a weighted average of its listed companies and is often seen as a thermometer for the tech sector. The New York Stock Exchange is its more traditional rival.'
    },
    {
      id: 'ethereum',
      keywords: [
        'اتریوم',
        'اتریوم چیه',
        'اتر چیه',
        'ethereum',
        'what is ethereum',
        'eth cryptocurrency'
      ],
      weak: ['اتریوم', 'ethereum', 'eth'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'ارز', 'what', 'crypto', 'smart contract'],
      fa: 'اتریوم دومین ارز دیجیتال بزرگ است که ویتالیک بوترین در ۲۰۱۵ راه انداخت؛ اما فرقش با بیت‌کوین این است که فقط پول نیست، بلکه بستری برای «قراردادهای هوشمند» و برنامه‌های غیرمتمرکز (dApps) است. بیشتر توکن‌ها و پروژه‌های دیفای و NFT روی اتریوم ساخته می‌شوند و واحد ارز آن «اتر» (ETH) نام دارد. مثل همه‌ی رمزارزها نوسان شدید دارد و پول ضروری را نباید واردش کرد.',
      en: 'Ethereum is the second-largest cryptocurrency, launched by Vitalik Buterin in 2015. Unlike Bitcoin it is not only money but a platform for smart contracts and decentralized apps (dApps). Most tokens, DeFi projects, and NFTs are built on Ethereum, and its currency unit is called ether (ETH). Like all crypto it is highly volatile, and essential money should never go into it.'
    },
    {
      id: 'dogecoin',
      keywords: [
        'دوج کوین',
        'دوج کوین چیه',
        'داژ کوین',
        'dogecoin',
        'what is dogecoin',
        'doge crypto'
      ],
      weak: ['دوج کوین', 'داژ', 'dogecoin', 'doge'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'ارز', 'what', 'crypto', 'meme'],
      fa: 'دوج‌کوین در ۲۰۱۳ به‌عنوان شوخی و با الهام از میم سگ شیبا اینو ساخته شد، اما به‌خاطر جامعه‌ی فعال و حمایت‌های ایلان ماسک به یکی از معروف‌ترین رمزارزها تبدیل شد. برخلاف بیت‌کوین، عرضه‌ی نامحدود دارد و هدف فنی جدی‌ای پشتش نبود. نمونه‌ی خوبی است که در بازار ارز دیجیتال شهرت و شوخی هم می‌تواند قیمت را جابه‌جا کند.',
      en: 'Dogecoin was created in 2013 as a joke, inspired by the Shiba Inu dog meme, but its active community and Elon Musk’s endorsements made it one of the most famous cryptocurrencies. Unlike Bitcoin it has an unlimited supply and no serious technical goal behind it. It is a good example of how fame and humor can move crypto prices.'
    },
    {
      id: 'nvidia',
      keywords: [
        'انویدیا',
        'انویدیا چیه',
        'کارت گرافیک انویدیا',
        'nvidia',
        'what is nvidia',
        'nvidia gpu'
      ],
      weak: ['انویدیا', 'nvidia', 'gpu'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'کارت گرافیک', 'what', 'chip', 'ai'],
      fa: 'انویدیا شرکت آمریکایی است که اول با کارت‌های گرافیک (GPU) برای بازی معروف شد، اما واحدهای پردازش گرافیکی‌اش برای آموزش هوش مصنوعی هم ضروری از آب درآمدند. با موج هوش مصنوعی مولد، تقاضای انفجاری برای تراشه‌هایش (مثل سری H100) ایجاد شد و ارزش شرکت چند برابر شد. امروز از بزرگ‌ترین شرکت‌های دنیاست.',
      en: 'NVIDIA is an American company first famous for graphics cards (GPUs) for gaming, but its chips also turned out to be essential for training AI. The generative-AI wave created explosive demand for its accelerators (like the H100 series) and multiplied the company’s value. Today it is one of the largest companies in the world.'
    },
    {
      id: 'microsoft',
      keywords: [
        'مایکروسافت',
        'مایکروسافت چیه',
        'بیل گیتس',
        'microsoft',
        'what is microsoft',
        'bill gates'
      ],
      weak: ['مایکروسافت', 'microsoft', 'ویندوز', 'windows'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'کمپانی', 'what', 'company', 'software'],
      fa: 'مایکروسافت را بیل گیتس و پل آلن در ۱۹۷۵ تأسیس کردند و با ویندوز و آفیس به غول نرم‌افزار جهان تبدیل شد. امروز علاوه بر آن‌ها، سرویس ابری Azure، کنسول ایکس‌باکس، لینکدین و سرمایه‌گذاری بزرگ در OpenAI را دارد. با ادغام هوش مصنوعی در محصولاتش (کوپایلت) دوباره در مرکز توجه فناوری قرار گرفته است.',
      en: 'Microsoft was founded by Bill Gates and Paul Allen in 1975 and became a software giant with Windows and Office. Today it also owns Azure cloud, the Xbox console, LinkedIn, and a major investment in OpenAI. By integrating AI into its products (Copilot), it has returned to the center of the technology industry.'
    },
    {
      id: 'spacex',
      keywords: [
        'اسپیس ایکس',
        'اسپیس ایکس چیه',
        'ایلان ماسک اسپیس ایکس',
        'spacex',
        'what is spacex',
        'elon musk spacex'
      ],
      weak: ['اسپیس ایکس', 'spacex', 'استارشیپ', 'starship'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'فضا', 'what', 'space', 'rocket'],
      fa: 'اسپیس‌ایکس شرکت فضایی ایلان ماسک است که در ۲۰۰۲ تأسیس شد و با موشک‌های قابل استفاده‌ی مجدد (فالکون ۹) هزینه‌ی پرتاب را به‌شدت پایین آورد. سفینه‌های دراگون فضانورد و بار به ایستگاه فضایی می‌برند و شبکه‌ی اینترنت ماهواره‌ای استارلینک هم از همین شرکت است. هدف بلندمدتش سکونت انسان روی مریخ با موشک استارشیپ است.',
      en: 'SpaceX is Elon Musk’s space company, founded in 2002, which sharply lowered launch costs with reusable Falcon 9 rockets. Its Dragon spacecraft carry astronauts and cargo to the space station, and the Starlink satellite-internet network is also part of the company. Its long-term goal is human settlement on Mars with the Starship rocket.'
    },
    {
      id: 'openai',
      keywords: [
        'اوپن ای آی',
        'اوپن ای آی چیه',
        'سازنده چت جی پی تی',
        'openai',
        'what is openai',
        'who made chatgpt'
      ],
      weak: ['اوپن ای آی', 'openai', 'چت جی پی تی', 'chatgpt'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'هوش مصنوعی', 'what', 'ai', 'company'],
      fa: 'اوپن‌ای‌آی شرکت پژوهش هوش مصنوعی است که چت‌جی‌پی‌تی را در اواخر ۲۰۲۲ منتشر کرد و موج هوش مصنوعی مولد را راه انداخت. مدل‌های زبانی بزرگش (سری GPT) متن، کد و تصویر تولید می‌کنند و با مایکروسافت همکاری نزدیکی دارد. هدف اعلام‌شده‌اش ساختن هوش مصنوعی عمومی (AGI) است که به نفع بشر باشد.',
      en: 'OpenAI is the AI research company that released ChatGPT in late 2022 and started the generative-AI wave. Its GPT models generate text, code, and images, and it works closely with Microsoft. Its stated goal is to build artificial general intelligence (AGI) that benefits humanity.'
    },
    {
      id: 'apple',
      keywords: [
        'اپل',
        'کمپانی اپل',
        'استیو جابز',
        'apple',
        'apple company',
        'steve jobs'
      ],
      weak: ['اپل', 'apple', 'آیفون', 'iphone'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'کمپانی', 'what', 'company', 'history'],
      fa: 'اپل را استیو جابز، استیو وزنیاک و رونالد وین در ۱۹۷۶ در یک گاراژ تأسیس کردند و با مکینتاش، آی‌پاد، آیفون و آی‌پد صنعت را چند بار دگرگون کرد. آیفون (۲۰۰۷) گوشی هوشمند را دوباره تعریف کرد و اکوسیستم بسته‌ی اپل (سخت‌افزار + نرم‌افزار + سرویس) وفاداری بی‌نظیری ساخته است. از نظر ارزش بازار معمولاً بین بزرگ‌ترین شرکت‌های دنیاست.',
      en: 'Apple was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in a garage in 1976 and transformed the industry several times with the Macintosh, iPod, iPhone, and iPad. The iPhone (2007) redefined the smartphone, and Apple’s closed ecosystem of hardware, software, and services built unmatched loyalty. By market value it is usually among the largest companies in the world.'
    },
    {
      id: 'amazon',
      keywords: [
        'آمازون',
        'آمازون چیه',
        'جف بزوس',
        'amazon',
        'what is amazon',
        'jeff bezos'
      ],
      weak: ['آمازون', 'amazon', 'بزوس', 'bezos'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'کمپانی', 'what', 'company', 'store'],
      fa: 'آمازون را جف بزوس در ۱۹۹۴ به‌عنوان کتاب‌فروشی آنلاین شروع کرد و به بزرگ‌ترین فروشگاه اینترنتی جهان تبدیل شد. سرویس ابری AWS آن بخش بزرگی از اینترنت را اجرا می‌کند و در لجستیک، استریم (پرایم ویدیو) و هوش مصنوعی هم فعال است. مدل «همه‌چیز فروشی» با تحویل سریع، تجارت الکترونیک را دگرگون کرد.',
      en: 'Amazon was started by Jeff Bezos in 1994 as an online bookstore and became the world’s largest online retailer. Its AWS cloud service runs a large part of the internet, and it is also active in logistics, streaming (Prime Video), and AI. Its sell-everything model with fast delivery transformed e-commerce.'
    },
    {
      id: 'tesla',
      keywords: [
        'تسلا',
        'تسلا چیه',
        'ایلان ماسک تسلا',
        'tesla',
        'what is tesla',
        'elon musk tesla'
      ],
      weak: ['تسلا', 'tesla', 'ماسک', 'musk'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'ماشین', 'what', 'car', 'electric'],
      fa: 'تسلا شرکت خودروهای برقی است که ایلان ماسک به آن پیوست و با مدل S و مدل ۳، خودروی برقی را از یک محصول خاص به یک صنعت بزرگ تبدیل کرد. علاوه بر خودرو، باتری‌ها و پنل‌های خورشیدی هم می‌سازد و روی خودرانی (اتوپایلوت) کار می‌کند. ارزش بازارش زمانی از مجموع خودروسازان سنتی هم بیشتر شد.',
      en: 'Tesla is the electric-car company that Elon Musk joined and, with the Model S and Model 3, turned the electric vehicle from a niche product into a major industry. Besides cars it makes batteries and solar panels and works on self-driving (Autopilot). Its market value once exceeded the traditional automakers combined.'
    },
    {
      id: 'netflix',
      keywords: [
        'نتفلیکس',
        'نتفلیکس چیه',
        'تاریخچه نتفلیکس',
        'netflix',
        'what is netflix'
      ],
      weak: ['نتفلیکس', 'netflix'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'سریال', 'what', 'streaming', 'series'],
      fa: 'نتفلیکس از اجاره‌ی دی‌وی‌دی پستی در ۱۹۹۷ شروع شد و بعد به پخش آنلاین (استریم) روی آورد و کل صنعت سرگرمی را تغییر داد. با تولید سریال‌های اختصاصی مثل «خانه‌ی پوشالی» و «چیزهای عجیب» وارد تولید محتوا شد و حالا ده‌ها میلیون مشترک دارد. رقبایش دیزنی‌پلاس، اچ‌بی‌او مکس و آمازون پرایم هستند.',
      en: 'Netflix began with DVD rentals by mail in 1997, then moved to online streaming and changed the entire entertainment industry. By producing original series like "House of Cards" and "Stranger Things" it entered content creation, and it now has hundreds of millions of subscribers. Its rivals include Disney+, HBO Max, and Amazon Prime.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
