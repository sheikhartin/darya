/**
 * Darya - curated factual entries (notable people).
 * Iranian public figures people actually ask about in informal chat
 * («فلانی کیه»), plus a broader sports and culture set beyond football
 * and basketball. Neutral and factual; never ranks private lives.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'googoosh',
      keywords: [
        'گوگوش',
        'گوگوش کیه',
        'گوگوش کیست',
        'googoosh',
        'who is googoosh'
      ],
      weak: ['گوگوش', 'googoosh'],
      weakSafe: true,
      hints: ['خواننده', 'کیه', 'کیست', 'ایران', 'singer', 'who', 'iran'],
      fa: 'گوگوش (فائقه آتشین) خواننده و بازیگر ایرانی است که از دهه ۱۳۴۰ به یکی از شناخته‌شده‌ترین چهره‌های پاپ ایران تبدیل شد. پس از انقلاب مدتی از صحنه دور ماند و از سال ۲۰۰۰ دوباره در خارج از ایران روی صحنه رفت. ترانه‌هایش هنوز بخش ثابتی از حافظه‌ی جمعی ایرانی‌هاست.',
      en: 'Googoosh (Faegheh Atashin) is an Iranian singer and actress who became one of the most recognized faces of Iranian pop from the 1960s. After the 1979 revolution she left the stage for years, then returned to performing outside Iran from 2000. Her songs remain a fixed part of Iranian popular memory.'
    },
    {
      id: 'shajarian',
      keywords: [
        'شجریان',
        'محمدرضا شجریان',
        'شجریان کیه',
        'شجریان کیست',
        'shajarian',
        'who is shajarian'
      ],
      weak: ['شجریان', 'shajarian'],
      weakSafe: true,
      hints: ['موسیقی', 'کیه', 'کیست', 'آواز', 'singer', 'who', 'persian'],
      fa: 'محمدرضا شجریان استاد آواز کلاسیک ایرانی بود و بسیاری او را مهم‌ترین صدای موسیقی دستگاهی قرن اخیر می‌دانند. با سنتور، تار و گروه شهناز کار کرد و ردیف آوازی را به نسل بعد رساند. در سال ۱۳۹۹ درگذشت؛ پسرش همایون شجریان راه آواز را ادامه داده است.',
      en: 'Mohammad-Reza Shajarian was a master of Persian classical singing, and many consider him the defining voice of the radif tradition in the last century. He worked with santur and tar ensembles and taught the vocal repertoire to a later generation. He died in 2020; his son Homayoun Shajarian continues the vocal path.'
    },
    {
      id: 'ali_daei',
      keywords: [
        'علی دایی',
        'دایی کیه',
        'علی دایی کیه',
        'علی دایی کیست',
        'ali daei',
        'who is ali daei'
      ],
      weak: ['علی دایی', 'ali daei'],
      weakSafe: true,
      hints: ['فوتبال', 'کیه', 'کیست', 'ایران', 'football', 'who', 'iran'],
      fa: 'علی دایی مهاجم و کاپیتان پیشین تیم ملی فوتبال ایران است. سال‌ها رکورد گل‌های ملی جهان را با ۱۰۹ گل در اختیار داشت تا کریستیانو رونالدو از او عبور کرد. بعد از فوتبال به مربیگری و کارهای اجتماعی هم پرداخت و یکی از شناخته‌شده‌ترین ورزشکاران ایرانی است.',
      en: 'Ali Daei is a former Iran striker and national-team captain. For years he held the world record for international goals with 109, until Cristiano Ronaldo passed him. After playing he moved into coaching and public work, and he remains one of Iran’s most recognized athletes.'
    },
    {
      id: 'ali_karimi',
      keywords: [
        'علی کریمی',
        'کریمی کیه',
        'علی کریمی کیه',
        'علی کریمی کیست',
        'ali karimi',
        'who is ali karimi'
      ],
      weak: ['کریمی', 'ali karimi'],
      weakSafe: true,
      hints: ['فوتبال', 'کیه', 'کیست', 'بایرن', 'football', 'who', 'bayern'],
      fa: 'علی کریمی هافبک تهاجمی ایرانی است که به «جادوگر» معروف شد. در پرسپولیس درخشید و بعد به بایرن مونیخ رفت؛ یکی از معدود فوتبالیست‌های ایرانی که در یک باشگاه بزرگ اروپایی بازی کرد. سبک دریبل و خلاقیتش هنوز در بحث بهترین‌های فوتبال ایران تکرار می‌شود.',
      en: 'Ali Karimi is an Iranian attacking midfielder nicknamed the Magician. He starred at Persepolis and later played for Bayern Munich, one of the few Iranian footballers to appear for a major European club. His dribbling and creativity still come up in debates about Iran’s finest players.'
    },
    {
      id: 'mehdi_taremi',
      keywords: [
        'مهدی طارمی',
        'طارمی کیه',
        'طارمی کیست',
        'mehdi taremi',
        'who is mehdi taremi',
        'who is taremi'
      ],
      weak: ['طارمی', 'taremi'],
      weakSafe: true,
      hints: ['فوتبال', 'کیه', 'کیست', 'پورتو', 'football', 'who', 'porto'],
      fa: 'مهدی طارمی مهاجم تیم ملی ایران است که با گلزنی در پرتغال برای پورتو به یکی از شناخته‌شده‌ترین بازیکنان ایرانی نسل خودش تبدیل شد. بعدها به اینتر ایتالیا پیوست. تمام‌کنندگی و حرکت بدون توپ نقاط قوتش هستند.',
      en: 'Mehdi Taremi is an Iran striker who became one of the best-known Iranian players of his generation by scoring in Portugal for Porto. He later joined Inter Milan. Finishing and movement off the ball are his strengths.'
    },
    {
      id: 'hassan_reyvandi',
      keywords: [
        'حسن ریوندی',
        'ریوندی کیه',
        'ریوندی کیست',
        'hassan reyvandi',
        'who is hassan reyvandi',
        'who is reyvandi'
      ],
      weak: ['ریوندی', 'reyvandi'],
      weakSafe: true,
      hints: ['کمدین', 'کیه', 'کیست', 'استنداپ', 'comedian', 'who', 'stand'],
      fa: 'حسن ریوندی استندآپ کمدین ایرانی است و از پرمخاطب‌ترین چهره‌های اینستاگرام فارسی‌زبان است. شوخی‌هایش معمولاً درباره‌ی زندگی روزمره، خانواده و فشارهای اجتماعی است. مثل هر کمدین زنده‌ای، جزئیات تور و دنبال‌کننده‌اش عوض می‌شود و باید از صفحه رسمی‌اش چک شود.',
      en: 'Hassan Reyvandi is an Iranian stand-up comedian and one of the most-followed Persian-language Instagram figures. His jokes usually land on daily life, family, and social pressure. Like any living performer, tour dates and follower counts change and should be checked on his official page.'
    },
    {
      id: 'golshifteh_farahani',
      keywords: [
        'گلشیفته فراهانی',
        'گلشیفته کیه',
        'گلشیفته کیست',
        'golshifteh farahani',
        'who is golshifteh farahani'
      ],
      weak: ['گلشیفته', 'golshifteh'],
      weakSafe: true,
      hints: ['بازیگر', 'کیه', 'کیست', 'سینما', 'actor', 'who', 'cinema'],
      fa: 'گلشیفته فراهانی بازیگر ایرانی‌فرانسوی است که با فیلم‌هایی مثل «درباره‌ی الی» در سینمای ایران شناخته شد و بعد در آثار بین‌المللی هم بازی کرد. از چهره‌های شناخته‌شده‌ی سینمای ایران در خارج از کشور است.',
      en: 'Golshifteh Farahani is an Iranian-French actress who became known in Iranian cinema with films such as About Elly and later appeared in international work. She is one of the best-known Iranian screen actors outside the country.'
    },
    {
      id: 'navid_mohammadzadeh',
      keywords: [
        'نوید محمدزاده',
        'نوید محمدزاده کیه',
        'نوید محمدزاده کیست',
        'navid mohammadzadeh',
        'who is navid mohammadzadeh'
      ],
      weak: ['محمدزاده', 'navid mohammadzadeh'],
      weakSafe: true,
      hints: ['بازیگر', 'کیه', 'کیست', 'سینما', 'actor', 'who', 'iran'],
      fa: 'نوید محمدزاده بازیگر سینما و تئاتر ایران است و با نقش‌های سنگین در فیلم‌هایی مثل «بدون تاریخ بدون امضا» و «متری شیش و نیم» شناخته شد. بازی‌اش معمولاً فشرده و نزدیک به واقعیت اجتماعی است.',
      en: 'Navid Mohammadzadeh is an Iranian film and theatre actor, known for intense roles in films such as No Date, No Signature and Just 6.5. His performances are usually tightly wound and close to social realism.'
    },
    {
      id: 'reza_attaran',
      keywords: [
        'رضا عطاران',
        'عطاران کیه',
        'عطاران کیست',
        'reza attaran',
        'who is reza attaran'
      ],
      weak: ['عطاران', 'attaran'],
      weakSafe: true,
      hints: ['بازیگر', 'کیه', 'کیست', 'کمدی', 'actor', 'who', 'comedy'],
      fa: 'رضا عطاران بازیگر و کارگردان ایرانی است که با کمدی‌های سینما و تلویزیون به یکی از آشناترین چهره‌های سرگرمی ایران تبدیل شد. طنزش معمولاً از زندگی شهری و تیپ‌های آشنا می‌آید، نه از شوخی با گروه‌های آسیب‌پذیر.',
      en: 'Reza Attaran is an Iranian actor and director who became one of the most familiar faces in Iranian screen comedy. His humor usually comes from city life and recognizable types, not from punching down at vulnerable groups.'
    },
    {
      id: 'asghar_farhadi',
      keywords: [
        'اصغر فرهادی',
        'فرهادی کیه',
        'فرهادی کیست',
        'asghar farhadi',
        'who is asghar farhadi'
      ],
      weak: ['فرهادی', 'farhadi'],
      weakSafe: true,
      hints: ['کارگردان', 'کیه', 'کیست', 'اسکار', 'director', 'who', 'oscar'],
      fa: 'اصغر فرهادی کارگردان ایرانی است و با «جدایی نادر از سیمین» و «فروشنده» دو اسکار بهترین فیلم غیرانگلیسی‌زبان گرفت. فیلم‌هایش معمولاً اخلاق، طبقه و رازهای خانوادگی را بدون شعار جلو می‌برند.',
      en: 'Asghar Farhadi is an Iranian director who won two Oscars for Best International Feature with A Separation and The Salesman. His films usually push ethics, class, and family secrets forward without slogans.'
    },
    {
      id: 'hadi_choopan',
      keywords: [
        'هادی چوپان',
        'چوپان کیه',
        'گرگ پارسی',
        'hadi choopan',
        'who is hadi choopan',
        'wolf of persia'
      ],
      weak: ['هادی چوپان', 'hadi choopan'],
      weakSafe: true,
      hints: ['بدنسازی', 'کیه', 'کیست', 'المپیا', 'bodybuilding', 'who'],
      fa: 'هادی چوپان بدنساز ایرانی است که به «گرگ پارسی» معروف شد و در ۲۰۲۲ قهرمان مستر المپیا شد. یکی از شناخته‌شده‌ترین ورزشکاران ایرانی در شبکه‌های اجتماعی است. بدنسازی حرفه‌ای نیاز به مربی، رژیم و مراقبت پزشکی دارد و الگوی مسابقه‌ای جای برنامه مبتدی نیست.',
      en: 'Hadi Choopan is an Iranian bodybuilder nicknamed the Wolf of Persia who won Mr. Olympia in 2022. He is one of the best-known Iranian athletes on social media. Professional bodybuilding needs coaching, diet, and medical care, and a contest look is not a beginner plan.'
    },
    {
      id: 'mehran_modiri',
      keywords: [
        'مهران مدیری',
        'مدیری کیه',
        'مدیری کیست',
        'mehran modiri',
        'who is mehran modiri'
      ],
      weak: ['مدیری', 'modiri'],
      weakSafe: true,
      hints: ['کارگردان', 'کیه', 'کیست', 'سریال', 'director', 'who', 'tv'],
      fa: 'مهران مدیری کارگردان، بازیگر و مجری ایرانی است و با مجموعه‌هایی مثل «پاورچین» و «شب‌های برره» طنز تلویزیونی ایران را برای یک نسل شکل داد. طنز موقعیت و تیپ‌سازی از نشانه‌های کارش است.',
      en: 'Mehran Modiri is an Iranian director, actor, and presenter who shaped television comedy for a generation with series such as Pavarchin and Shabhaye Barareh. Situational humor and character types are trademarks of his work.'
    },
    {
      id: 'forough_farrokhzad',
      keywords: [
        'فروغ فرخزاد',
        'فروغ کیه',
        'فروغ کیست',
        'forough farrokhzad',
        'who is forough farrokhzad'
      ],
      weak: ['فروغ', 'farrokhzad'],
      weakSafe: true,
      hints: ['شاعر', 'کیه', 'کیست', 'شعر', 'poet', 'who', 'poetry'],
      fa: 'فروغ فرخزاد شاعر ایرانی سده‌ی چهاردهم خورشیدی بود. شعرش مستقیم، جسمانی و خلاف انتظار زمانه‌اش بود و مجموعه‌هایی مثل «تولدی دیگر» هنوز خوانده می‌شوند. در ۱۳۴۵ در یک تصادف درگذشت و جای ثابتی در ادبیات معاصر ایران دارد.',
      en: 'Forough Farrokhzad was a twentieth-century Iranian poet. Her work was direct, bodily, and unexpected for its time, and collections such as Another Birth are still read. She died in a car accident in 1967 and holds a fixed place in modern Iranian literature.'
    },
    {
      id: 'ferdowsii',
      keywords: [
        'فردوسی',
        'فردوسی کیه',
        'فردوسی کیست',
        'شاهنامه',
        'ferdowsi',
        'who is ferdowsi',
        'what is the shahnameh'
      ],
      weak: ['فردوسی', 'شاهنامه', 'ferdowsi', 'shahnameh'],
      weakSafe: true,
      hints: ['شاعر', 'کیه', 'کیست', 'حماسه', 'poet', 'who', 'epic'],
      fa: 'ابوالقاسم فردوسی شاعر حماسه‌سرای ایران است و «شاهنامه» را حدود هزار سال پیش سرود. شاهنامه تاریخ اساطیری و پهلوانی ایران را به شعر فارسی نگه داشت و از ستون‌های زبان فارسی است. آرامگاهش در توس است.',
      en: 'Abolqasem Ferdowsi is the epic poet of Iran and composed the Shahnameh about a thousand years ago. The Shahnameh kept Iran’s mythic and heroic history in Persian verse and is a pillar of the language. His tomb is in Tus.'
    },
    {
      id: 'rumi_molana',
      keywords: [
        'مولانا',
        'مولوی',
        'مولانا کیه',
        'مولانا کیست',
        'رومی',
        'rumi',
        'who is rumi',
        'who is jalaluddin rumi'
      ],
      weak: ['مولانا', 'مولوی', 'rumi'],
      weakSafe: true,
      hints: ['شاعر', 'کیه', 'کیست', 'عرفان', 'poet', 'who', 'sufi'],
      fa: 'جلال‌الدین محمد بلخی، معروف به مولانا یا مولوی، شاعر و عارف سده‌ی هفتم هجری است. «مثنوی معنوی» و غزل‌های «دیوان شمس» از آثار اصلی‌اش هستند. شعرش درباره‌ی عشق، خودشناسی و فراتر رفتن از ظاهر دین است و در جهان با نام Rumi هم خوانده می‌شود.',
      en: 'Jalal al-Din Muhammad Balkhi, known as Rumi or Molana, was a thirteenth-century poet and mystic. The Masnavi and the ghazals of the Divan of Shams are his major works. His poetry is about love, self-knowledge, and going past the surface of religion, and he is widely read in the world under the name Rumi.'
    },
    {
      id: 'serena_williams',
      keywords: [
        'سرنا ویلیامز',
        'سرنا کیه',
        'serena williams',
        'who is serena williams'
      ],
      weak: ['سرنا', 'serena williams'],
      weakSafe: true,
      hints: ['تنیس', 'کیه', 'کیست', 'قهرمان', 'tennis', 'who', 'grand'],
      fa: 'سرنا ویلیامز تنیس‌باز آمریکایی است و با ۲۳ عنوان گرند اسلم انفرادی یکی از پرافتخارترین ورزشکاران تاریخ تنیس است. قدرت سرویس و دوامش استاندارد نسل بعد را عوض کرد. خواهرش ونوس هم قهرمان گرند اسلم است.',
      en: 'Serena Williams is an American tennis player and, with 23 singles Grand Slam titles, one of the most decorated athletes in tennis history. Her serve and longevity reset the standard for the next generation. Her sister Venus is also a Grand Slam champion.'
    },
    {
      id: 'novak_djokovic',
      keywords: [
        'نواک جوکوویچ',
        'جوکوویچ کیه',
        'novak djokovic',
        'who is novak djokovic',
        'who is djokovic'
      ],
      weak: ['جوکوویچ', 'djokovic'],
      weakSafe: true,
      hints: ['تنیس', 'کیه', 'کیست', 'صربستان', 'tennis', 'who', 'serbia'],
      fa: 'نواک جوکوویچ تنیس‌باز صرب است و از نظر تعداد عنوان گرند اسلم انفرادی مردان در صدر تاریخ ایستاده است. بازگشت دفاعی و آمادگی جسمانی‌اش او را در بحث بهترین تاریخ تنیس مردان همیشه مطرح نگه می‌دارد.',
      en: 'Novak Djokovic is a Serbian tennis player who leads the men’s singles Grand Slam title count. His defensive return and physical conditioning keep him permanently in the men’s greatest-of-all-time conversation.'
    },
    {
      id: 'lewis_hamilton',
      keywords: [
        'لوئیس همیلتون',
        'همیلتون کیه',
        'lewis hamilton',
        'who is lewis hamilton'
      ],
      weak: ['همیلتون', 'hamilton'],
      weakSafe: true,
      hints: ['فرمول', 'کیه', 'کیست', 'مسابقه', 'formula', 'who', 'f1'],
      fa: 'لوئیس همیلتون راننده فرمول یک بریتانیایی است و با هفت قهرمانی جهان رکورد مشترک میشائیل شوماخر را دارد. علاوه بر رانندگی، درباره‌ی تنوع در ورزش موتور هم حرف زده است. جزئیات فصل جاری را باید از جدول رسمی فرمول یک چک کرد.',
      en: 'Lewis Hamilton is a British Formula 1 driver who shares the record of seven world titles with Michael Schumacher. Beyond driving, he has also spoken about diversity in motorsport. Current-season details should be checked on the official Formula 1 standings.'
    },
    {
      id: 'simone_biles',
      keywords: [
        'سیمون بایلز',
        'بایلز کیه',
        'simone biles',
        'who is simone biles'
      ],
      weak: ['بایلز', 'simone biles'],
      weakSafe: true,
      hints: ['ژیمناستیک', 'کیه', 'کیست', 'المپیک', 'gymnastics', 'who'],
      fa: 'سیمون بایلز ژیمناست آمریکایی است و پرافتخارترین ژیمناست تاریخ مسابقات جهان به‌حساب می‌آید. حرکات با درجه‌ی سختی بالا به نام او ثبت شده‌اند. در المپیک از سلامت روانش هم آشکارا حرف زد و بحث مراقبت از ورزشکار را جلو برد.',
      en: 'Simone Biles is an American gymnast and the most decorated gymnast in world-championship history. Skills with high difficulty ratings are named after her. At the Olympics she also spoke openly about mental health and pushed the athlete-care conversation forward.'
    },
    {
      id: 'usain_bolt',
      keywords: ['یوسین بولت', 'بولت کیه', 'usain bolt', 'who is usain bolt'],
      weak: ['بولت', 'usain bolt'],
      weakSafe: true,
      hints: ['دوومیدانی', 'کیه', 'کیست', 'سرعت', 'sprint', 'who', 'olympic'],
      fa: 'یوسین بولت دونده‌ی جامائیکایی است و رکوردهای جهان ۱۰۰ و ۲۰۰ متر را در اختیار دارد. در المپیک ۲۰۰۸، ۲۰۱۲ و ۲۰۱۶ در ماده‌های سرعت طلا گرفت و به نماد دو سرعت تبدیل شد.',
      en: 'Usain Bolt is a Jamaican sprinter who holds the world records in the 100 and 200 metres. He won Olympic sprint gold in 2008, 2012, and 2016 and became the face of modern sprinting.'
    },
    {
      id: 'michael_phelps',
      keywords: [
        'مایکل فلپس',
        'فلپس کیه',
        'michael phelps',
        'who is michael phelps'
      ],
      weak: ['فلپس', 'phelps'],
      weakSafe: true,
      hints: ['شنا', 'کیه', 'کیست', 'المپیک', 'swimming', 'who', 'olympic'],
      fa: 'مایکل فلپس شناگر آمریکایی است و با ۲۳ طلا پرافتخارترین ورزشکار تاریخ المپیک است. در ماده‌های پروانه، آزاد و مختلط در چند دوره مسلط بود. بعد از بازنشستگی درباره‌ی سلامت روان ورزشکاران هم صحبت کرده است.',
      en: 'Michael Phelps is an American swimmer and, with 23 gold medals, the most decorated Olympian in history. He dominated butterfly, freestyle, and medley events across several Games. After retiring he has also spoken about athlete mental health.'
    },
    {
      id: 'sachin_tendulkar',
      keywords: [
        'ساچین تندولکار',
        'تندولکار کیه',
        'sachin tendulkar',
        'who is sachin tendulkar'
      ],
      weak: ['تندولکار', 'tendulkar'],
      weakSafe: true,
      hints: ['کریکت', 'کیه', 'کیست', 'هند', 'cricket', 'who', 'india'],
      fa: 'ساچین تندولکار کریکت‌باز هندی است و یکی از پرافتخارترین ضربه‌زن‌های تاریخ این ورزش به‌حساب می‌آید. صد قرن در کریکت بین‌المللی زد و برای یک نسل در هند چهره‌ی ملی ورزش بود.',
      en: 'Sachin Tendulkar is an Indian cricketer and one of the most decorated batters in the history of the sport. He scored one hundred international centuries and was a national sporting face in India for a generation.'
    },
    {
      id: 'pele',
      keywords: ['پله', 'پله کیه', 'پله کیست', 'pele', 'who is pele'],
      weak: ['پله', 'pele'],
      weakSafe: true,
      hints: ['فوتبال', 'کیه', 'کیست', 'برزیل', 'football', 'who', 'brazil'],
      fa: 'پله مهاجم برزیلی بود و با سه قهرمانی جام جهانی (۱۹۵۸، ۱۹۶۲، ۱۹۷۰) یکی از نمادهای فوتبال جهان شد. برزیل با نسل او سبک زیبا و هجومی را جهانی کرد. در ۲۰۲۲ درگذشت.',
      en: 'Pelé was a Brazilian forward who, with three World Cup titles (1958, 1962, 1970), became one of football’s global symbols. Brazil’s generation around him made an attacking, beautiful style famous worldwide. He died in 2022.'
    },
    {
      id: 'maradona',
      keywords: [
        'مارادونا',
        'مارادونا کیه',
        'diego maradona',
        'who is maradona'
      ],
      weak: ['مارادونا', 'maradona'],
      weakSafe: true,
      hints: ['فوتبال', 'کیه', 'کیست', 'آرژانتین', 'football', 'who'],
      fa: 'دیه‌گو مارادونا هافبک آرژانتینی بود و با قهرمانی جام جهانی ۱۹۸۶ و بازی‌های ناپولی به اسطوره تبدیل شد. دست خدا و گل انفرادی‌اش مقابل انگلیس از معروف‌ترین صحنه‌های تاریخ فوتبال‌اند. در ۲۰۲۰ درگذشت.',
      en: 'Diego Maradona was an Argentine midfielder who became a legend through the 1986 World Cup and his years at Napoli. The Hand of God and his solo goal against England are among the most famous scenes in football history. He died in 2020.'
    },
    {
      id: 'shadmehr_aghili',
      keywords: [
        'شادمهر عقیلی',
        'شادمهر کیه',
        'شادمهر کیست',
        'shadmehr aghili',
        'who is shadmehr',
        'who is shadmehr aghili'
      ],
      weak: ['شادمهر', 'shadmehr'],
      weakSafe: true,
      hints: ['خواننده', 'کیه', 'کیست', 'پاپ', 'singer', 'who', 'pop'],
      fa: 'شادمهر عقیلی خواننده، آهنگساز و تنظیم‌کننده‌ی پاپ ایران است و از پرمخاطب‌ترین چهره‌های موسیقی فارسی در شبکه‌های اجتماعی است. ترانه‌هایش معمولاً ملودیک و احساسی‌اند و بعد از ترک ایران هم برای مخاطب فارسی‌زبان پخش می‌شوند. جزئیات تور و انتشار تازه را باید از صفحه‌ی رسمی‌اش چک کرد.',
      en: 'Shadmehr Aghili is an Iranian pop singer, composer, and arranger, and one of the most-followed Persian-language music figures on social media. His songs are usually melodic and emotional, and they still reach Persian-speaking listeners after he left Iran. Tour and release details should be checked on his official page.'
    },
    {
      id: 'bahram_afshari',
      keywords: [
        'بهرام افشاری',
        'بهرام افشاری کیه',
        'بهرام افشاری کیست',
        'bahram afshari',
        'who is bahram afshari'
      ],
      weak: ['بهرام افشاری', 'bahram afshari'],
      weakSafe: true,
      hints: ['بازیگر', 'کیه', 'کیست', 'کمدی', 'actor', 'who', 'comedy'],
      fa: 'بهرام افشاری بازیگر و کمدین ایرانی است و با نقش‌های کمدی سینما و حضور پررنگ در اینستاگرام به یکی از چهره‌های آشنای سرگرمی ایران تبدیل شد. طنزش معمولاً از تیپ‌های شهری و موقعیت‌های روزمره می‌آید. مثل هر بازیگر زنده‌ای، پروژه و دنبال‌کننده‌اش عوض می‌شود و باید از منابع رسمی چک شود.',
      en: 'Bahram Afshari is an Iranian actor and comedian who became one of the familiar faces of Iranian screen comedy through film roles and a large Instagram presence. His humor usually comes from city types and everyday situations. Like any living performer, projects and follower counts change and should be checked on official pages.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
