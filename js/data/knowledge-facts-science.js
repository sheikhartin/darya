/**
 * Darya - curated factual entries (science domain).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'jupiter',
      keywords: [
        'سیاره مشتری',
        'سیارهی مشتری',
        'سیاره ی مشتری',
        'مشتری سیاره',
        'بزرگترین سیاره',
        'بزرگ‌ترین سیاره',
        'بزرگترین سیاره منظومه',
        'planet jupiter',
        'jupiter planet',
        'jupiter is the',
        'biggest planet',
        'largest planet',
        'jupiter'
      ],
      weak: ['مشتری'],
      weakSafe: false,
      hints: [
        'سیاره',
        'سیارات',
        'منظومه',
        'کیهان',
        'فضا',
        'نجوم',
        'planet',
        'solar',
        'space',
        'astronomy'
      ],
      fa: 'مشتری بزرگ‌ترین سیاره‌ی منظومه‌ی شمسی و یک غول گازی است؛ یعنی سطح جامدی ندارد و بیشتر از هیدروژن و هلیوم ساخته شده. جرمش از مجموع همه‌ی سیاره‌های دیگر بیشتر است و «لکه‌ی سرخ بزرگ» آن، طوفانی است که قرن‌هاست ادامه دارد. نزدیک به نود و پنج قمر دورش می‌چرخند که بزرگ‌ترینشان گانیمد است.',
      en: 'Jupiter is the largest planet in the solar system and a gas giant: it has no solid surface and is mostly hydrogen and helium. Its mass is greater than all the other planets combined, and its Great Red Spot is a storm that has raged for centuries. Nearly one hundred moons orbit it, the largest being Ganymede.'
    },
    {
      id: 'solar_system',
      keywords: [
        'منظومه شمسی',
        'منظومه ی شمسی',
        'سیارات منظومه',
        'چند سیاره داریم',
        'چند تا سیاره',
        'solar system',
        'planets in our solar system',
        'how many planets'
      ],
      weak: ['سیارات', 'سیاره ها', 'planets'],
      weakSafe: true,
      hints: ['منظومه', 'شمسی', 'solar'],
      fa: 'منظومه‌ی شمسی هشت سیاره دارد که به ترتیب فاصله از خورشید عبارت‌اند از: عطارد، زهره، زمین، مریخ، مشتری، زحل، اورانوس و نپتون. چهار سیاره‌ی داخلی سنگی‌اند و چهار سیاره‌ی بیرونی غول‌های گازی یا یخی. پلوتو از سال ۲۰۰۶ به عنوان سیاره‌ی کوتوله طبقه‌بندی می‌شود.',
      en: 'The solar system has eight planets, in order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. The four inner planets are rocky, while the four outer ones are gas or ice giants. Since 2006 Pluto is classified as a dwarf planet.'
    },
    {
      id: 'quantum',
      keywords: [
        'فیزیک کوانتوم',
        'فیزیک کوانتومی',
        'مکانیک کوانتومی',
        'quantum physics',
        'quantum mechanics',
        'quantum theory'
      ],
      weak: ['کوانتوم', 'quantum'],
      weakSafe: true,
      hints: ['فیزیک', 'ذره', 'اتم', 'physics', 'particle', 'atom'],
      fa: 'فیزیک کوانتوم رفتار ماده و انرژی در مقیاس اتم‌ها و ذره‌ها را توضیح می‌دهد، جایی که شهود روزمره کار نمی‌کند. دو ویژگی معروفش برهم‌نهی و درهم‌تنیدگی است: یک ذره می‌تواند تا لحظه‌ی اندازه‌گیری در چند حالت هم‌زمان باشد و دو ذره می‌توانند به شکلی به هم وابسته شوند که وضعیت یکی، وضعیت دیگری را تعیین کند. کامپیوترهای کوانتومی و فناوری‌هایی مثل لیزر و ترانزیستور از همین اصول زاده شده‌اند.',
      en: 'Quantum physics explains how matter and energy behave at the scale of atoms and particles, where everyday intuition breaks down. Its two famous features are superposition and entanglement: a particle can exist in several states at once until measured, and two particles can become linked so that the state of one determines the other. Quantum computers, lasers, and transistors all grow out of these principles.'
    },
    {
      id: 'black_hole',
      keywords: [
        'سیاهچاله',
        'سیاه چاله',
        'سیاه‌چاله',
        'black hole',
        'black holes'
      ],
      weak: ['سیاهچاله', 'سیاه چاله', 'blackhole'],
      weakSafe: true,
      hints: ['فضا', 'جاذبه', 'ستاره', 'space', 'gravity', 'star'],
      fa: 'سیاه‌چاله ناحیه‌ای در فضا است که جاذبه‌ی آن‌قدر شدید است که حتی نور هم نمی‌تواند از آن خارج شود. معمولاً از فروپاشی ستاره‌های پرجرم در پایان عمرشان به وجود می‌آید. مرز دورش «افق رویداد» نام دارد و هر چه داخلش بیفتد دیگر برنمی‌گردد؛ مرکز آن تکینگی نامیده می‌شود.',
      en: 'A black hole is a region of space where gravity is so strong that even light cannot escape it. Black holes usually form when very massive stars collapse at the end of their lives. The boundary around one is called the event horizon, and its center is known as a singularity.'
    },
    {
      id: 'james_webb',
      keywords: ['جیمز وب', 'تلسکوپ جیمز وب', 'james webb', 'jwst'],
      weak: [],
      weakSafe: true,
      hints: ['تلسکوپ', 'فضا', 'telescope', 'space'],
      fa: 'تلسکوپ فضایی جیمز وب که در سال ۲۰۲۱ پرتاب شد، بزرگ‌ترین و دقیق‌ترین تلسکوپ فضایی است و در مداری دور از زمین به فاصله‌ی حدود یک و نیم میلیون کیلومتری کار می‌کند. با دیدن نور فروسرخ، می‌تواند کهکشان‌ها و سیاره‌هایی را رصد کند که به زمان‌های بسیار نزدیک به آغاز جهان برمی‌گردند و در جو سیاره‌های دور نشانه‌های حیات را جست‌وجو می‌کند.',
      en: 'The James Webb Space Telescope, launched in 2021, is the largest and most precise space telescope ever built, operating about one and a half million kilometers from Earth. By observing infrared light it can see galaxies from near the beginning of the universe and search the atmospheres of distant planets for signs that could relate to life.'
    },
    {
      id: 'light_speed',
      keywords: ['سرعت نور', 'سرعت نور چقدره', 'speed of light'],
      weak: ['سرعت نور', 'speed of light'],
      weakSafe: true,
      hints: ['نور', 'light', 'فیزیک', 'physics'],
      fa: 'سرعت نور در خلأ حدود سیصد هزار کیلومتر بر ثانیه است (دقیقاً ۲۹۹٬۷۹۲ کیلومتر بر ثانیه). نور خورشید حدود هشت دقیقه و نیم طول می‌کشد تا به زمین برسد، و فاصله‌ی ستاره‌ها را معمولاً با واحد «سال نوری» اندازه می‌گیرند؛ یعنی مسافتی که نور در یک سال می‌پیماید.',
      en: 'The speed of light in a vacuum is about 300,000 kilometers per second (exactly 299,792 km/s). Sunlight takes about eight and a half minutes to reach Earth, and astronomers measure stellar distances in light-years: the distance light travels in one year.'
    },
    {
      id: 'gravity',
      keywords: [
        'جاذبه چیست',
        'گرانش چیست',
        'جاذبه چیه',
        'what is gravity',
        'gravity explained'
      ],
      weak: ['جاذبه', 'گرانش', 'gravity'],
      weakSafe: true,
      hints: ['نیوتن', 'زمین', 'فیزیک', 'newton', 'earth', 'physics'],
      fa: 'جاذبه یا گرانش نیرویی است که هر جسم با جرم، جسم دیگر را به سمت خود می‌کشد. نیوتن آن را با قانون گرانش عمومی توصیف کرد و اینشتین در نسبیت عام نشان داد که جاذبه در واقع خمیدگی فضا-زمان اطراف جرم است. جاذبه‌ی زمین است که ما را روی زمین نگه می‌دارد و مسیر ماه به دور زمین را می‌سازد.',
      en: 'Gravity is the force by which any object with mass attracts other objects. Newton described it with his law of universal gravitation, and Einstein showed in general relativity that gravity is really the curvature of spacetime around mass. Earth’s gravity keeps us on the ground and shapes the Moon’s orbit around us.'
    },
    {
      id: 'sky_blue',
      keywords: [
        'چرا آسمون آبیه',
        'چرا آسمان آبی است',
        'چرا آسمان آبیه',
        'why is the sky blue'
      ],
      weak: ['آسمان آبی', 'sky blue'],
      weakSafe: true,
      hints: [],
      fa: 'آسمان آبی است چون نور خورشید از ذره‌های کوچک جو عبور می‌کند و رنگ آبی بیشتر از بقیه‌ی رنگ‌ها پراکنده می‌شود؛ به این پدیده «پراکندگی ریلی» می‌گویند. به همین دلیل هم هنگام غروب، وقتی نور مسیر طولانی‌تری را در جو طی می‌کند، آبی‌ها حذف می‌شوند و آسمان نارنجی و قرمز دیده می‌شود.',
      en: 'The sky is blue because sunlight passes through tiny particles in the atmosphere and blue light scatters more than other colors, a phenomenon called Rayleigh scattering. That is also why sunsets look orange and red: the light travels a longer path through the air, and the blues get scattered away first.'
    },
    {
      id: 'earth_moon',
      keywords: [
        'ماه چیه',
        'قمر زمین',
        'چرا ماه می‌درخشد',
        'ماه نور داره',
        'what is the moon',
        'why does the moon shine'
      ],
      weak: ['ماه', 'moon'],
      weakSafe: false,
      hints: [
        'قمر',
        'زمین',
        'شب',
        'آسمان',
        'کره',
        'moonlight',
        'lunar',
        'orbit'
      ],
      fa: 'ماه قمر طبیعی زمین است و نور خودش را ندارد؛ نوری که از آن می‌بینیم بازتاب نور خورشید است. فاصله‌ی متوسطش از زمین حدود سیصد و هشتاد و چهار هزار کیلومتر است و همان طرفش همیشه رو به ماست، به همین دلیل فقط یک روی آن را می‌بینیم. کشش جاذبه‌ی ماه باعث جزر و مد اقیانوس‌ها می‌شود.',
      en: 'The Moon is Earth’s natural satellite and has no light of its own; the glow we see is reflected sunlight. It orbits about 384,000 kilometers away, and the same face always points toward us, which is why we only ever see one side. The Moon’s gravity drives the ocean tides.'
    },
    {
      id: 'human_body',
      keywords: [
        'بدن انسان',
        'سلول بدن',
        'چند تا سلول',
        'human body',
        'cells in the human body'
      ],
      weak: ['بدن انسان', 'سلول', 'human body', 'cells'],
      weakSafe: true,
      hints: ['انسان', 'جسم', 'biology', 'body'],
      fa: 'بدن انسان از تریلیون‌ها سلول ساخته شده است؛ تخمین‌ها معمولاً بین سی تا چهل تریلیون است. سلول‌ها به بافت‌ها و اندام‌ها سازمان می‌یابند و DNA داخل هسته‌ی هر سلول، نقشه‌ی ساختن و کار کردن بدن را حمل می‌کند. بدن هر روز میلیون‌ها سلول کهنه را جایگزین می‌کند.',
      en: 'The human body is made of trillions of cells, usually estimated between thirty and forty trillion. Cells organize into tissues and organs, and the DNA in each cell’s nucleus carries the blueprint for building and running the body. Every day the body replaces millions of old cells.'
    },
    {
      id: 'evolution',
      keywords: [
        'نظریه تکامل',
        'تکامل چیست',
        'داروین',
        'evolution theory',
        'darwin',
        'what is evolution'
      ],
      weak: ['تکامل', 'evolution', 'داروین', 'darwin'],
      weakSafe: true,
      hints: ['گونه', 'انسان', 'زیست', 'species', 'biology'],
      fa: 'نظریه‌ی تکامل می‌گوید همه‌ی موجودات زنده از نیاکان مشترکی به وجود آمده‌اند و در طول میلیون‌ها سال با انتخاب طبیعی تغییر کرده‌اند: موجوداتی که با محیط خود سازگارترند، بیشتر زنده می‌مانند و ویژگی‌هایشان را به نسل بعد منتقل می‌کنند. چارلز داروین این چارچوب را در قرن نوزدهم با شواهد فراوان تدوین کرد و امروز یکی از ستون‌های زیست‌شناسی است.',
      en: 'The theory of evolution holds that all living things descend from common ancestors and change over millions of years through natural selection: organisms better adapted to their environment survive more often and pass their traits to the next generation. Charles Darwin laid out this framework with extensive evidence in the nineteenth century, and it remains a foundation of biology.'
    },
    {
      id: 'sun',
      keywords: [
        'خورشید چیه',
        'خورشید چیست',
        'راجع به خورشید',
        'درباره خورشید',
        'ستاره خورشید',
        'the sun',
        'what is the sun',
        'about the sun',
        'sun star'
      ],
      weak: ['خورشید', 'sun'],
      weakSafe: true,
      hints: [
        'ستاره',
        'منظومه',
        'کیهان',
        'فضا',
        'نجوم',
        'star',
        'solar',
        'space',
        'astronomy'
      ],
      fa: 'خورشید یک ستاره است، نه یک سیاره؛ یک کره‌ی عظیم از گاز داغ که بیشترش هیدروژن و هلیوم است و در مرکز منظومه‌ی شمسی قرار دارد. گرانشش همه‌ی سیاره‌ها را در مدار نگه می‌دارد و انرژی‌اش از هم‌جوشی هسته‌ای در هسته‌اش می‌آید. حدود ۹۹٫۸ درصد از جرم کل منظومه‌ی شمسی در خورشید جمع شده و دمای سطحش حدود ۵۵۰۰ درجه‌ی سلسیوس است. بدون آن، حیات روی زمین ممکن نبود.',
      en: 'The Sun is a star, not a planet: a vast sphere of hot gas, mostly hydrogen and helium, sitting at the center of the solar system. Its gravity holds every planet in orbit, and its energy comes from nuclear fusion in its core. About 99.8 percent of the solar system mass is in the Sun, and its surface temperature is around 5500 degrees Celsius. Life on Earth would not exist without it.'
    },
    {
      id: 'mercury',
      keywords: [
        'سیاره عطارد',
        'عطارد سیاره',
        'عطارد چیه',
        'عطارد چیست',
        'راجع به عطارد',
        'درباره عطارد',
        'planet mercury',
        'mercury planet',
        'the planet mercury',
        'what is mercury',
        'tell me about mercury',
        'about mercury'
      ],
      weak: ['عطارد', 'mercury'],
      weakSafe: false,
      hints: [
        'سیاره',
        'منظومه',
        'خورشید',
        'فضا',
        'نجوم',
        'planet',
        'solar',
        'sun',
        'space',
        'astronomy'
      ],
      fa: 'عطارد کوچک‌ترین سیاره‌ی منظومه‌ی شمسی و نزدیک‌ترین سیاره به خورشید است. مدارش خیلی بیضی‌شکل است و به همین دلیل دمایش به‌شدت تغییر می‌کند: روزها تا حدود ۴۳۰ درجه و شب‌ها تا حدود منفی ۱۸۰ درجه. یک سال عطارد فقط ۸۸ روز زمینی طول می‌کشد، اما یک روز کامل آن (غروب تا غروب) تقریباً ۱۷۶ روز زمینی است. سطحش پر از دهانه است و جو تقریباً ندارد.',
      en: 'Mercury is the smallest planet in the solar system and the closest to the Sun. Its orbit is strongly elliptical, so its temperature swings wildly: roughly 430 degrees Celsius by day and about minus 180 at night. A Mercury year lasts only 88 Earth days, but one full day there (sunrise to sunrise) takes about 176 Earth days. Its surface is heavily cratered and it has almost no atmosphere.'
    },
    {
      id: 'venus',
      keywords: [
        'سیاره زهره',
        'زهره سیاره',
        'زهره چیه',
        'زهره چیست',
        'راجع به زهره',
        'درباره زهره',
        'planet venus',
        'venus planet',
        'the planet venus',
        'what is venus',
        'tell me about venus',
        'about venus'
      ],
      weak: ['زهره', 'venus'],
      weakSafe: false,
      hints: [
        'سیاره',
        'منظومه',
        'خورشید',
        'فضا',
        'نجوم',
        'planet',
        'solar',
        'sun',
        'space',
        'astronomy'
      ],
      fa: 'زهره بعد از عطارد دومین سیاره از خورشید است و به‌خاطر جو غلیظ دی‌اکسیدکربن، گرم‌ترین سیاره‌ی منظومه‌ی شمسی است؛ سطحش حدود ۴۶۵ درجه‌ی سلسیوس است، حتی داغ‌تر از عطارد. ابرهایش از اسید سولفوریک است و فشار سطحش حدود ۹۰ برابر زمین. نکته‌ی جالب: زهره برعکس بیشتر سیاره‌ها به‌دور محور خودش می‌چرخد، پس خورشید از غرب طلوع می‌کند. به‌خاطر درخشش‌اش به «ستاره‌ی صبح» یا «ستاره‌ی شام» هم معروف است.',
      en: 'Venus is the second planet from the Sun and, thanks to its thick carbon dioxide atmosphere, the hottest in the solar system: its surface is around 465 degrees Celsius, hotter even than Mercury. Its clouds are sulfuric acid and the surface pressure is about 90 times Earth. Oddly, Venus spins backward on its axis, so the Sun rises in the west. Because it shines so brightly it is often called the morning star or evening star.'
    },
    {
      id: 'mars',
      keywords: [
        'سیاره مریخ',
        'مریخ سیاره',
        'مریخ چیه',
        'مریخ چیست',
        'راجع به مریخ',
        'درباره مریخ',
        'مریخ چطور سیاره',
        'مریخ چه شکلیه',
        'مریخ چه جوریه',
        'planet mars',
        'mars planet',
        'the planet mars',
        'what is mars',
        'tell me about mars',
        'about mars'
      ],
      weak: ['مریخ', 'mars'],
      weakSafe: false,
      hints: [
        'سیاره',
        'منظومه',
        'خورشید',
        'فضا',
        'نجوم',
        'قرمز',
        'planet',
        'solar',
        'sun',
        'space',
        'astronomy',
        'red'
      ],
      fa: 'مریخ چهارمین سیاره از خورشید است و به‌خاطر اکسید آهن (زنگ‌زدگی) روی سطحش، «سیاره‌ی سرخ» نامیده می‌شود. بزرگ‌ترین آتشفشان منظومه‌ی شمسی یعنی المپوس مونس و بزرگ‌ترین دره‌اش یعنی والز مارینریس روی مریخ هستند. جو مریخ نازک و بیشترش دی‌اکسیدکربن است و میانگین دمایش حدود منفی ۶۰ درجه. مریخ دو قمر کوچک دارد به نام‌های فوبوس و دیموس، و یکی از اصلی‌ترین اهداف اکتشاف و احتمالاً سکونت آینده‌ی انسان است.',
      en: 'Mars is the fourth planet from the Sun, called the Red Planet because of iron oxide, essentially rust, on its surface. It hosts the solar system largest volcano, Olympus Mons, and its deepest canyon, Valles Marineris. Its atmosphere is thin and mostly carbon dioxide, with an average temperature around minus 60 degrees. Mars has two small moons, Phobos and Deimos, and is one of the main targets for exploration and possible future human settlement.'
    },
    {
      id: 'saturn',
      keywords: [
        'سیاره زحل',
        'زحل سیاره',
        'زحل چیه',
        'زحل چیست',
        'راجع به زحل',
        'درباره زحل',
        'حلقه های زحل',
        'حلقه‌های زحل',
        'planet saturn',
        'saturn planet',
        'the planet saturn',
        'what is saturn',
        'tell me about saturn',
        'about saturn'
      ],
      weak: ['زحل', 'saturn'],
      weakSafe: false,
      hints: [
        'سیاره',
        'حلقه',
        'منظومه',
        'فضا',
        'نجوم',
        'planet',
        'ring',
        'solar',
        'space',
        'astronomy'
      ],
      fa: 'زحل ششمین سیاره از خورشید و دومین سیاره‌ی بزرگ منظومه است؛ یک غول گازی که بیشترش هیدروژن و هلیوم است و چگالی‌اش آن‌قدر کم است که اگر آب‌بزرگی وجود داشت، شناور می‌ماند. حلقه‌های معروفش از میلیاردها تکه یخ و سنگ ساخته شده‌اند و پهنایشان صدها هزار کیلومتر است، اما ضخامتشان معمولاً فقط چند ده متر است. زحل ده‌ها قمر دارد که بزرگ‌ترینشان تیتان است؛ قمری با جو غلیظ و دریاچه‌های متان مایع.',
      en: 'Saturn is the sixth planet from the Sun and the second largest in the solar system: a gas giant made mostly of hydrogen and helium with such low density that it would float on a giant body of water. Its famous rings are made of billions of ice and rock fragments spanning hundreds of thousands of kilometers, yet usually only a few tens of meters thick. Saturn has dozens of moons, the largest being Titan, a moon with a thick atmosphere and lakes of liquid methane.'
    },
    {
      id: 'uranus',
      keywords: [
        'سیاره اورانوس',
        'اورانوس سیاره',
        'اورانوس چیه',
        'اورانوس چیست',
        'راجع به اورانوس',
        'درباره اورانوس',
        'planet uranus',
        'uranus planet',
        'the planet uranus',
        'what is uranus',
        'tell me about uranus',
        'about uranus'
      ],
      weak: ['اورانوس', 'uranus'],
      weakSafe: false,
      hints: [
        'سیاره',
        'منظومه',
        'فضا',
        'نجوم',
        'planet',
        'solar',
        'space',
        'astronomy'
      ],
      fa: 'اورانوس هفتمین سیاره از خورشید و یک غول یخی است؛ بیشترش از آب، متان و آمونیاک در حالت یخ‌زده ساخته شده و متان موجود در جو‌اش رنگ آبی-سبز به آن می‌دهد. عجیب‌ترین ویژگی‌اش این است که تقریباً روی پهلو می‌چرخد، یعنی محورش حدود ۹۸ درجه خمیده است؛ احتمالاً به‌خاطر یک برخورد عظیم در گذشته. اورانوس هم حلقه‌های کمرنگ و هم ده‌ها قمر دارد و تا سال ۱۹۸۱ هیچ فضاپیمایی از نزدیکی‌اش رد نشده بود.',
      en: 'Uranus is the seventh planet from the Sun and an ice giant: mostly water, methane, and ammonia in frozen form, with the methane in its atmosphere giving it a blue-green color. Its most unusual feature is that it rotates almost on its side, with its axis tilted about 98 degrees, probably from a massive collision long ago. Uranus has faint rings and dozens of moons, and no spacecraft had flown near it until 1986.'
    },
    {
      id: 'neptune',
      keywords: [
        'سیاره نپتون',
        'نپتون سیاره',
        'نپتون چیه',
        'نپتون چیست',
        'راجع به نپتون',
        'درباره نپتون',
        'planet neptune',
        'neptune planet',
        'the planet neptune',
        'what is neptune',
        'tell me about neptune',
        'about neptune'
      ],
      weak: ['نپتون', 'neptune'],
      weakSafe: false,
      hints: [
        'سیاره',
        'منظومه',
        'فضا',
        'نجوم',
        'planet',
        'solar',
        'space',
        'astronomy'
      ],
      fa: 'نپتون هشتمین و دورترین سیاره از خورشید است و یک غول یخی آبی رنگ با بادهای خیلی شدید؛ سریع‌ترین بادهای منظومه با سرعت بیش از ۲۰۰۰ کیلومتر بر ساعت در جو‌اش ثبت شده‌اند. جالب است که نپتون را ابتدا با محاسبات ریاضی و پیش از مشاهده‌ی مستقیم پیدا کردند؛ اوربن له‌وریه موقعیت‌ش را پیش‌بینی کرد و سال ۱۸۴۶ مشاهده شد. یک سال نپتون حدود ۱۶۵ سال زمینی طول می‌کشد و حداقل ۱۴ قمر دارد.',
      en: 'Neptune is the eighth and most distant planet from the Sun, a blue ice giant with extremely strong winds, the fastest in the solar system, exceeding 2000 kilometers per hour in its atmosphere. Remarkably, Neptune was discovered through mathematical calculation before it was seen directly: Urbain Le Verrier predicted its position, and it was observed in 1846. One Neptune year lasts about 165 Earth years, and it has at least 14 moons.'
    },
    {
      id: 'tardigrade',
      keywords: [
        'عجیب‌ترین حیوان',
        'عجیب ترین حیوان',
        'weirdest animal',
        'strangest animal'
      ],
      weak: ['خرس آبی', 'tardigrade'],
      weakSafe: true,
      hints: ['حیوان', 'حیوانات', 'جانور', 'animal', 'animals'],
      fa: 'اگر دنبال عجیب‌ترین جانور بگردی، خرس آبی (تاردیگرید) سزاوار مقام اول است: موجودی میکروسکوپی با هشت پا که می‌تواند در خلأ فضا، دمای نزدیک صفر مطلق و تشعشع شدید زنده بماند؛ دانشمندان آن را در حالت خشک‌شده بعد از دهه‌ها به زندگی برگردانده‌اند.',
      en: 'If you are looking for the strangest animal, the tardigrade (water bear) deserves first place: a microscopic eight-legged creature that can survive the vacuum of space, near-absolute-zero temperatures, and intense radiation; scientists have revived dried-out tardigrades after decades.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
