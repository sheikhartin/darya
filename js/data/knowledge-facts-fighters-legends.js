/**
 * Darya - curated factual entries (MMA legends, the women's divisions,
 * and the wider martial arts). Companion part to
 * knowledge-facts-fighters.js; loaded before knowledge-base.js and
 * registered as a global part. Same field conventions: changeable
 * numbers live in `record` (with `final: true` for settled, retired
 * careers) and the optional `more` field carries the deeper paragraph
 * for tell-me-more follow-ups.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'anderson_silva',
      keywords: [
        'اندرسون سیلوا',
        'اندرسون سیلوا کیه',
        'anderson silva',
        'who is anderson silva',
        'the spider'
      ],
      weak: ['اندرسون', 'anderson'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'برزیل', 'ufc', 'mma', 'fighter'],
      fa: 'اندرسون سیلوا، «عنکبوت»، سال‌ها ترسناک‌ترین مرد UFC بود: طولانی‌ترین دوران قهرمانی تاریخ این سازمان (میان‌وزن، ۲۰۰۶ تا ۲۰۱۳) و ۱۶ برد متوالی. ضربه‌زدنش مثل ماتریکس بود؛ حریف‌ها رو با دست پایین و جاخالی‌های تحقیرکننده بازی می‌داد.',
      en: "Anderson Silva, The Spider, was the scariest man in the UFC for years: the longest title reign in the promotion's history (middleweight, 2006 to 2013) and a 16-fight win streak. His striking looked like the Matrix; he toyed with opponents, hands down, slipping punches at will.",
      record: {
        fa: 'دوران افتش طولانی بود و با رکوردی حدود ۳۴ برد و ۱۱ باخت از ام‌ام‌ای خداحافظی کرد و بعدش چند مسابقه‌ی بوکس نمایشی رفت. عدد ام‌ام‌ای‌اش دیگه ثابته.',
        en: 'His decline was long, and he left MMA at roughly 34 wins and 11 losses before a few exhibition boxing matches. The MMA number is settled.',
        final: true
      },
      more: {
        fa: 'ناک‌اوت جلوپای معروفش به ویتور بلفورت و ناک‌اوت آخرین‌ثانیه‌ای چیل سونن هنوز در هر لیست «بهترین لحظه‌های UFC» هست. افسانه‌اش با دو باخت عجیب به کریس وایدمن تموم شد؛ در دومی پاش روی ساق وایدمن شکست، یکی از دردناک‌ترین صحنه‌های تاریخ این ورزش.',
        en: "His front-kick knockout of Vitor Belfort and the last-second submission of Chael Sonnen still make every best-UFC-moments list. The legend ended with two strange losses to Chris Weidman; in the second, his leg snapped on Weidman's shin, one of the most painful scenes the sport has produced."
      }
    },
    {
      id: 'georges_st_pierre',
      keywords: [
        'ژرژ سن پیر',
        'جورج سن پیر',
        'سن پیر کیه',
        'georges st pierre',
        'george st pierre',
        'who is gsp',
        'gsp'
      ],
      weak: ['سن پیر', 'ژرژ', 'gsp'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'کانادا', 'ufc', 'mma', 'fighter'],
      fa: 'ژرژ سن پیر (جی‌اس‌پی) مبارز کانادایی و یکی از دو سه نامزد همیشگی بهترین مبارز تاریخه. سال‌ها قهرمان مطلق وزن ولتر بود، بعد از چهار سال دوری برگشت و در ۲۰۱۷ کمربند میان‌وزن رو هم گرفت و قهرمان دو وزن شد. حرفه‌ای‌گری و اخلاقش هم به‌اندازه‌ی مبارزه‌اش زبانزده.',
      en: 'Georges St-Pierre (GSP) is the Canadian who sits permanently in the top three of every greatest-of-all-time debate. He ruled welterweight for years, then returned after four years away and won the middleweight belt in 2017 to become a two-division champion. His professionalism and sportsmanship are as famous as his fighting.',
      record: {
        fa: 'جی‌اس‌پی با رکورد ۲۶ برد و ۲ باخت بازنشسته شد و تلافی هر دو باختش رو هم سر حریف‌ها درآورده بود. این عدد دیگه عوض نمی‌شه.',
        en: 'GSP retired at 26 wins and 2 losses, and he avenged both defeats. That number will not change.',
        final: true
      },
      more: {
        fa: 'جی‌اس‌پی نمونه‌ی مبارز کامل بود: کشتی‌ای که کشتی‌گیرها رو زمین می‌زد بدون اینکه خودش پیشینه‌ی کشتی داشته باشه، جب سرد و دقیق، و آمادگی بدنی افسانه‌ای. بعد از بازنشستگی مربی و چهره‌ی محبوب رسانه‌ای موند و همیشه درباره‌ی سلامت روان مبارزها صادقانه حرف زده.',
        en: "GSP was the prototype of the complete fighter: takedowns that outwrestled wrestlers despite no wrestling background, a cold precise jab, and legendary conditioning. Since retiring he has stayed a beloved coach and media figure, always honest about fighters' mental health."
      }
    },
    {
      id: 'fedor_emelianenko',
      keywords: [
        'فدور املیاننکو',
        'فدور کیه',
        'fedor emelianenko',
        'who is fedor',
        'the last emperor'
      ],
      weak: ['فدور', 'fedor', 'املیاننکو'],
      weakSafe: true,
      hints: ['ام ام ای', 'مبارز', 'روسیه', 'mma', 'pride', 'fighter'],
      fa: 'فدور املیاننکو، «آخرین امپراتور»، سنگین‌وزن روسی و اسطوره‌ی دوران Pride ژاپنه: نزدیک به ده سال بدون شکست موند و در اوج دوران، بهترین‌های دنیا رو با چهره‌ای کاملاً بی‌احساس شکست می‌داد. خیلی از قدیمی‌ها هنوز اون رو بهترین سنگین‌وزن تاریخ می‌دونن، با اینکه هیچ‌وقت در UFC مبارزه نکرد.',
      en: "Fedor Emelianenko, The Last Emperor, is the Russian heavyweight legend of Japan's Pride era: he went nearly a decade unbeaten, dismantling the world's best with a completely blank expression. Many old-school fans still call him the greatest heavyweight ever even though he never fought in the UFC.",
      record: {
        fa: 'فدور در ۲۰۲۳ با رکوردی حدود ۴۰ برد و ۷ باخت خداحافظی کرد؛ عددش دیگه ثابته.',
        en: 'Fedor said goodbye in 2023 at roughly 40 wins and 7 losses; the number is settled.',
        final: true
      }
    },
    {
      id: 'demetrious_johnson',
      keywords: [
        'دیمیتریوس جانسون',
        'دیمیتریوس جانسون کیه',
        'demetrious johnson',
        'who is demetrious johnson',
        'mighty mouse'
      ],
      weak: ['دیمیتریوس', 'demetrious', 'mighty mouse'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'دیمیتریوس جانسون، «مایتی ماوس»، کامل‌ترین مبارز فنی‌ای بود که خیلی‌ها به عمرشون دیدن: رکورد ۱۱ دفاع متوالی از کمربند مگس‌وزن UFC هنوز دست‌نخورده‌ست. بعداً به ONE Championship رفت و اونجا هم قهرمان شد؛ در ۲۰۲۴ بازنشسته شد.',
      en: 'Demetrious Johnson, Mighty Mouse, was the most technically complete fighter many fans have ever seen: his record of 11 consecutive UFC flyweight title defenses still stands. He later moved to ONE Championship, won gold there too, and retired in 2024.',
      record: {
        fa: 'با رکوردی حدود ۳۲ برد، ۴ باخت و ۱ مساوی کنار رفت؛ عددش دیگه ثابته.',
        en: 'He stepped away at roughly 32 wins, 4 losses and 1 draw; the number is settled.',
        final: true
      }
    },
    {
      id: 'royce_gracie',
      keywords: [
        'رویس گریسی',
        'هویس گریسی',
        'رویس گریسی کیه',
        'royce gracie',
        'who is royce gracie'
      ],
      weak: ['گریسی', 'gracie'],
      weakSafe: true,
      hints: ['یو اف سی', 'جوجیتسو', 'مبارز', 'ufc', 'jiu jitsu', 'mma'],
      fa: 'رویس گریسی مردیه که ام‌ام‌ای مدرن رو ساخت: در اولین مسابقات UFC در ۱۹۹۳، با جثه‌ای معمولی و لباس جودو، غول‌های وزن‌آزاد رو یکی‌یکی با جوجیتسوی برزیلی خانواده‌ی گریسی خفه کرد. همون شب دنیا فهمید هنر رزمی «واقعی» یعنی چی و جوجیتسو تبدیل به پایه‌ی اجباری هر مبارز شد.',
      en: "Royce Gracie is the man who built modern MMA: at the first UFC events in 1993, an ordinary-sized man in a gi choked out giants one by one with his family's Brazilian jiu-jitsu. That night the world learned what really works in a fight, and jiu-jitsu became mandatory for every fighter since.",
      record: {
        fa: 'دوران اصلی‌اش مال دهه‌ی نودئه و رکورد رسمی‌اش حدود ۱۵ برد، ۲ باخت و ۳ مساویه؛ عددش تاریخیه و ثابت.',
        en: 'His prime was the nineties, and his official record is about 15 wins, 2 losses and 3 draws; it is history now, and settled.',
        final: true
      }
    },
    {
      id: 'bj_penn',
      keywords: [
        'بی جی پن',
        'بی جی پن کیه',
        'bj penn',
        'who is bj penn',
        'the prodigy'
      ],
      weak: ['بی جی', 'penn'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'هاوایی', 'ufc', 'mma', 'fighter'],
      fa: 'بی‌جی پن، «اعجوبه»، مبارز هاوایی و یکی از اولین قهرمان‌های دو وزن UFC بود (سبک‌وزن و ولتر). با سرعتی بی‌سابقه کمربند سیاه جوجیتسو گرفت و اولین غیربرزیلی‌ای شد که قهرمانی جهانِ کمربندسیاه‌ها رو برد. استعداد خالص بود؛ حیف که سال‌های آخرش با باخت‌های زیاد تموم شد.',
      en: "BJ Penn, The Prodigy, is the Hawaiian who became one of the UFC's first two-division champions (lightweight and welterweight). He earned a jiu-jitsu black belt at record speed and was the first non-Brazilian to win the black-belt world championship. Pure talent, though his final years ended in a long slide of losses.",
      record: {
        fa: 'رکورد نهایی‌اش حدود ۱۶ برد، ۱۴ باخت و ۳ مساویه؛ اون عددهای آخر انعکاس ادامه‌دادنِ بیش از حده، نه سطح واقعی اوجش. دیگه ثابته.',
        en: 'His final record is about 16 wins, 14 losses and 3 draws; the tail reflects fighting too long, not his peak level. It is settled.',
        final: true
      }
    },
    {
      id: 'jose_aldo',
      keywords: [
        'ژوزه آلدو',
        'خوزه آلدو',
        'آلدو کیه',
        'jose aldo',
        'who is jose aldo'
      ],
      weak: ['آلدو', 'aldo'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'برزیل', 'ufc', 'mma', 'fighter'],
      fa: 'ژوزه آلدو پادشاه تاریخی پَروزنه: ده سال تمام (۲۰۰۵ تا ۲۰۱۵ بدون باخت) بهترین مرد وزنش بود و لگدهای رانش پای حریف‌ها رو از کار می‌انداخت. افسانه‌اش با ناک‌اوت ۱۳ ثانیه‌ای مک‌گرگور ترک خورد، ولی بعدش دوباره خودش رو بالا کشید و در وزن بانتام هم مدعی شد.',
      en: "Jose Aldo is featherweight's historical king: for a full decade (2005 to 2015 without a loss) he was the best in his division, his leg kicks shutting opponents' legs down. The legend cracked with McGregor's 13-second knockout, but he rebuilt himself and contended at bantamweight too.",
      record: {
        fa: 'دیتای من رکوردش رو حدود ۳۲ برد و ۱۰ باخت می‌گه و چند باری بین بازنشستگی و برگشت بوده؛ وضعیت فعلی‌اش رو چک کن.',
        en: 'My data has him around 32 wins and 10 losses, and he has bounced between retirement and comebacks; check his current status.'
      }
    },
    {
      id: 'chuck_liddell',
      keywords: [
        'چاک لیدل',
        'چاک لیدل کیه',
        'chuck liddell',
        'who is chuck liddell',
        'the iceman'
      ],
      weak: ['لیدل', 'liddell'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'چاک لیدل، «مرد یخی»، اولین ابرستاره‌ی آمریکایی UFC بود؛ با موهای موهاک و ناک‌اوت‌های سنگینش در دهه‌ی ۲۰۰۰ این ورزش رو در آمریکا سر زبون‌ها انداخت. سه‌گانه‌اش با رندی کوتور و دوئل‌هاش با تیتو اورتیز، UFC رو از ورشکستگی به تلویزیون رسوند.',
      en: "Chuck Liddell, The Iceman, was the UFC's first American superstar; the mohawk and heavy knockouts of the 2000s put the sport on the map in the US. His trilogy with Randy Couture and feud with Tito Ortiz carried the UFC from near-bankruptcy to television.",
      record: {
        fa: 'رکورد نهایی‌اش ۲۱ برد و ۹ باخته و مدت‌هاست بازنشسته؛ عددش ثابته.',
        en: 'His final record is 21 wins and 9 losses, and he has long been retired; the number is settled.',
        final: true
      }
    },
    {
      id: 'randy_couture',
      keywords: [
        'رندی کوتور',
        'رندی کوتور کیه',
        'randy couture',
        'who is randy couture',
        'the natural'
      ],
      weak: ['کوتور', 'couture'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'کشتی', 'ufc', 'mma', 'wrestling'],
      fa: 'رندی کوتور، «طبیعی»، نماد دیرشکفتن بود: در ۳۴ سالگی وارد UFC شد، پنج بار در دو وزن مختلف قهرمان شد و در ۴۳ سالگی با بردن کمربند سنگین‌وزن همه رو شوکه کرد. کشتی‌گیر ارتشی سابق بود و بعد از مبارزه به بازیگری هالیوود رفت.',
      en: 'Randy Couture, The Natural, was the great late bloomer: he entered the UFC at 34, won titles five times across two divisions, and shocked everyone by taking the heavyweight belt at 43. A former army wrestler, he moved on to Hollywood acting after fighting.',
      record: {
        fa: 'با رکورد ۱۹ برد و ۱۱ باخت بازنشسته شد؛ در دورانی مبارزه می‌کرد که فقط با بهترین‌ها می‌جنگید. عددش ثابته.',
        en: 'He retired at 19 wins and 11 losses, from an era when he only ever fought the best. The number is settled.',
        final: true
      }
    },
    {
      id: 'brock_lesnar',
      keywords: [
        'براک لزنر',
        'براک لزنر کیه',
        'brock lesnar',
        'who is brock lesnar'
      ],
      weak: ['لزنر', 'lesnar', 'براک'],
      weakSafe: true,
      hints: ['یو اف سی', 'کشتی کج', 'مبارز', 'ufc', 'wwe', 'mma'],
      fa: 'براک لزنر عجیب‌ترین پدیده‌ی فیزیکی UFC بود: ستاره‌ی کشتی‌کج WWE که با پیشینه‌ی کشتی واقعی دانشگاهی اومد و فقط در چهارمین مبارزه‌ی حرفه‌ایش کمربند سنگین‌وزن UFC رو گرفت (۲۰۰۸). فروش پی‌پرویوهاش رکورد می‌زد؛ بیماری دیورتیکولیت دورانش رو کوتاه کرد و به WWE برگشت.',
      en: "Brock Lesnar was the UFC's strangest physical phenomenon: the WWE star with a real collegiate wrestling pedigree who won the UFC heavyweight title in only his fourth pro fight (2008). His pay-per-views set sales records; diverticulitis cut the run short and he went back to the WWE.",
      record: {
        fa: 'رکورد ام‌ام‌ای‌اش کوتاهه: ۵ برد، ۳ باخت و ۱ بدون‌نتیجه. مدت‌هاست به کشتی‌کج برگشته و این عدد ثابته.',
        en: 'His MMA record is short: 5 wins, 3 losses and 1 no contest. He has long been back in pro wrestling, so it is settled.',
        final: true
      }
    },
    {
      id: 'wanderlei_silva',
      keywords: [
        'واندرلی سیلوا',
        'واندرلی سیلوا کیه',
        'wanderlei silva',
        'who is wanderlei silva',
        'the axe murderer'
      ],
      weak: ['واندرلی', 'wanderlei'],
      weakSafe: true,
      hints: ['ام ام ای', 'مبارز', 'برزیل', 'mma', 'pride', 'fighter'],
      fa: 'واندرلی سیلوا، «قاتل تبری»، ترسناک‌ترین چهره‌ی دوران Pride بود: نگاه خیره‌ی قبل از مبارزه، هجوم بی‌وقفه و زانوهای موی‌تای که اسطوره‌ی میان‌وزن اون دوران ساخت. رقابت خونینش با کوینتون «رمپیج» جکسون از کلاسیک‌های تاریخ ام‌ام‌ایه.',
      en: "Wanderlei Silva, The Axe Murderer, was the most terrifying face of the Pride era: the pre-fight stare, the relentless swarming and the Muay Thai knees that made him that generation's middleweight legend. His bloody rivalry with Quinton Rampage Jackson is an all-time MMA classic.",
      record: {
        fa: 'رکورد نهایی‌اش حدود ۳۵ برد، ۱۴ باخت و ۱ مساویه و سال‌هاست بازنشسته؛ عددش ثابته.',
        en: 'His final record is roughly 35 wins, 14 losses and a draw, and he has been retired for years; it is settled.',
        final: true
      }
    },
    {
      id: 'mirko_crocop',
      keywords: [
        'میرکو کروکاپ',
        'کروکاپ کیه',
        'mirko cro cop',
        'mirko crocop',
        'who is cro cop'
      ],
      weak: ['کروکاپ', 'میرکو', 'cro cop'],
      weakSafe: true,
      hints: ['ام ام ای', 'مبارز', 'کرواسی', 'mma', 'pride', 'kickboxing'],
      fa: 'میرکو کروکاپ، کیک‌بوکسور کروات و مأمور سابق پلیس ضدترور، صاحب معروف‌ترین جمله‌ی ام‌ام‌ای قدیمه: «لگد راست بیمارستان، لگد چپ قبرستان». در Pride با هدکیک‌های چپش اسطوره شد و در ۲۰۰۶ قهرمان گرندپری وزن آزاد شد.',
      en: "Mirko Cro Cop, the Croatian kickboxer and former anti-terror police officer, owns old MMA's most famous line: right leg hospital, left leg cemetery. His left head kicks made him a Pride legend, and he won the 2006 open-weight Grand Prix.",
      record: {
        fa: 'رکورد ام‌ام‌ای‌اش حدود ۳۸ برد، ۱۱ باخت و ۲ مساویه و بازنشسته شده؛ عددش ثابته.',
        en: 'His MMA record is about 38 wins, 11 losses and 2 draws, and he is retired; it is settled.',
        final: true
      }
    },
    {
      id: 'amanda_nunes',
      keywords: [
        'آماندا نونز',
        'آماندا نونز کیه',
        'amanda nunes',
        'who is amanda nunes',
        'the lioness'
      ],
      weak: ['نونز', 'nunes', 'آماندا'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'زنان', 'ufc', 'mma', 'women'],
      fa: 'آماندا نونز، «ماده‌شیر»، پرافتخارترین مبارز زن تاریخ ام‌ام‌ایه: اولین زنی که هم‌زمان قهرمان دو وزن UFC بود و تنها کسیه که هم روندا روزی رو ناک‌اوت کرد هم کریس سایبورگ رو. در ۲۰۲۳ در اوج بازنشسته شد.',
      en: 'Amanda Nunes, The Lioness, is the most decorated woman in MMA history: the first woman to hold two UFC belts at once, and the only fighter to knock out both Ronda Rousey and Cris Cyborg. She retired on top in 2023.',
      record: {
        fa: 'با رکوردی حدود ۲۳ برد و ۵ باخت کنار رفت؛ اگه برنگرده، این عدد ثابته.',
        en: 'She stepped away at roughly 23 wins and 5 losses; unless she returns, that is settled.',
        final: true
      }
    },
    {
      id: 'valentina_shevchenko',
      keywords: [
        'والنتینا شفچنکو',
        'شفچنکو کیه',
        'valentina shevchenko',
        'who is valentina shevchenko',
        'bullet shevchenko'
      ],
      weak: ['شفچنکو', 'والنتینا', 'shevchenko'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'زنان', 'ufc', 'mma', 'women'],
      fa: 'والنتینا شفچنکو، «گلوله»، ملکه‌ی وزن مگس‌وزن زنانه: قرقیزستانی-پرویی، چندبار قهرمان جهان موی‌تای و یکی از فنی‌ترین مبارزهای زن تاریخ. سال‌ها کمربند مگس‌وزن UFC رو با دفاع‌های پیاپی نگه داشته و فقط آماندا نونز واقعاً جلوش رو گرفته.',
      en: "Valentina Shevchenko, Bullet, is the queen of women's flyweight: Kyrgyzstani-Peruvian, a multiple-time Muay Thai world champion and one of the most technical women ever. She has held the UFC flyweight belt across long runs of defenses, with only Amanda Nunes truly stopping her.",
      record: {
        fa: 'دیتای من رکوردش رو حدود ۲۴ برد، ۴ باخت و ۱ مساوی نشون می‌ده؛ هنوز فعاله، پس چک کن.',
        en: 'My data shows her around 24 wins, 4 losses and a draw; she is still active, so check.'
      }
    },
    {
      id: 'ronda_rousey',
      keywords: [
        'روندا روزی',
        'روندا روزی کیه',
        'ronda rousey',
        'who is ronda rousey',
        'rowdy ronda'
      ],
      weak: ['روندا', 'روزی', 'rousey'],
      weakSafe: true,
      hints: ['یو اف سی', 'جودو', 'زنان', 'ufc', 'judo', 'mma'],
      fa: 'روندا روزی زنیه که در UFC رو برای زن‌ها باز کرد: مدال برنز جودوی المپیک داشت، اولین قهرمان زن تاریخ UFC شد و با آرم‌بارهای چندثانیه‌ای به پدیده‌ی جهانی تبدیل شد. دوران اوجش با هدکیک هالی هولم در ۲۰۱۵ تموم شد و بعد به WWE و هالیوود رفت.',
      en: "Ronda Rousey is the woman who opened the UFC's doors for women: an Olympic judo bronze medalist, she became the UFC's first female champion and a global phenomenon with armbars measured in seconds. Holly Holm's head kick in 2015 ended the peak, and she moved to the WWE and Hollywood.",
      record: {
        fa: 'رکورد ام‌ام‌ای‌اش ۱۲ برد و ۲ باخته و سال‌هاست بازنشسته؛ ثابته.',
        en: 'Her MMA record is 12 wins and 2 losses, and she has been retired for years; settled.',
        final: true
      }
    },
    {
      id: 'zhang_weili',
      keywords: [
        'ژانگ ویلی',
        'ژانگ ویلی کیه',
        'zhang weili',
        'who is zhang weili'
      ],
      weak: ['ژانگ', 'ویلی', 'weili', 'zhang'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'چین', 'ufc', 'mma', 'women'],
      fa: 'ژانگ ویلی اولین قهرمان چینی تاریخ UFC‌ه (وزن کاه، ۲۰۱۹) و مبارزه‌ی اولش با یوانا ینجیچیک رو خیلی‌ها بهترین مبارزه‌ی زنان تاریخ می‌دونن. قدرت بدنی استثنایی و گراپلینگ مدام بهترشونده‌اش اون رو سال‌ها در قله نگه داشته.',
      en: "Zhang Weili is the first Chinese champion in UFC history (strawweight, 2019), and her first fight with Joanna Jedrzejczyk is called by many the greatest women's fight ever. Exceptional physical strength and always-improving grappling have kept her at the top for years.",
      record: {
        fa: 'دیتای من می‌گه حدود ۲۶ برد و ۳ باخت داره؛ فعاله و ممکنه وزن یا کمربندش عوض شده باشه، چک کن.',
        en: 'My data says about 26 wins and 3 losses; she is active and may have changed division or status, so check.'
      }
    },
    {
      id: 'rose_namajunas',
      keywords: [
        'رز نامایوناس',
        'روز نامایوناس',
        'نامایوناس کیه',
        'rose namajunas',
        'who is rose namajunas',
        'thug rose'
      ],
      weak: ['نامایوناس', 'namajunas'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'زنان', 'ufc', 'mma', 'women'],
      fa: 'رز نامایوناس، «تاگ رز»، دوبار قهرمان وزن کاه UFC شده و بیشتر از هر چیز با جمله‌ی «من بهترینم» بعد از ناک‌اوت شوکه‌کننده‌ی یوانا در ۲۰۱۷ یادها مونده. درباره‌ی سلامت روان و فشار شهرت همیشه روراست بوده.',
      en: "Rose Namajunas, Thug Rose, is a two-time UFC strawweight champion, remembered above all for saying I'm the best after her shocking 2017 knockout of Joanna. She has always been open about mental health and the pressure of fame.",
      record: {
        fa: 'دیتای من رکوردش رو حدود ۱۴ برد و ۷ باخت می‌گه؛ فعاله، عدد به‌روز رو ببین.',
        en: 'My data puts her around 14 wins and 7 losses; she is active, so look up the current number.'
      }
    },
    {
      id: 'joanna_jedrzejczyk',
      keywords: [
        'یوانا ینجیچیک',
        'یوانا کیه',
        'joanna jedrzejczyk',
        'who is joanna jedrzejczyk',
        'joanna champion'
      ],
      weak: ['یوانا', 'joanna'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'لهستان', 'ufc', 'mma', 'women'],
      fa: 'یوانا ینجیچیک، مبارز لهستانی و چندباره قهرمان جهان موی‌تای، سال‌ها ملکه‌ی وزن کاه UFC بود و پنج دفاع موفق پشت سر هم داشت. مبارزه‌ی دومش با ژانگ ویلی در ۲۰۲۰، که پیشونی‌اش به‌خاطر ضربه‌ها بادکرد، از حماسی‌ترین مبارزه‌های زنان تاریخه. بعد از همون ریمچ بازنشسته شد.',
      en: "Joanna Jedrzejczyk, the Polish multiple-time Muay Thai world champion, ruled UFC strawweight for years with five straight title defenses. Her second fight with Zhang Weili in 2020, the one that left her forehead swollen from the war, is among the most epic women's fights ever. She retired after that rematch.",
      record: {
        fa: 'با رکورد ۱۶ برد و ۵ باخت بازنشسته شد؛ عددش ثابته.',
        en: 'She retired at 16 wins and 5 losses; the number is settled.',
        final: true
      }
    },
    {
      id: 'cris_cyborg',
      keywords: [
        'کریس سایبورگ',
        'سایبورگ کیه',
        'cris cyborg',
        'who is cris cyborg'
      ],
      weak: ['سایبورگ', 'cyborg'],
      weakSafe: true,
      hints: ['ام ام ای', 'مبارز', 'برزیل', 'mma', 'ufc', 'women'],
      fa: 'کریس سایبورگ برزیلیه و ترسناک‌ترین ضربه‌زن تاریخ ام‌ام‌ای زنان: بیشتر از یه دهه هیچ‌کس جلوش دووم نیاورد و در چهار سازمان بزرگ (UFC، Strikeforce، Invicta و Bellator) قهرمان شد؛ رکوردی که هیچ زن دیگه‌ای نداره. فقط آماندا نونز تونست ناک‌اوتش کنه.',
      en: "Cris Cyborg is the Brazilian and the most feared striker in women's MMA history: for over a decade nobody survived her, and she won titles in four major promotions (UFC, Strikeforce, Invicta and Bellator), a first for any woman. Only Amanda Nunes ever knocked her out.",
      record: {
        fa: 'دیتای من رکوردش رو حدود ۲۷ برد و ۲ باخت نشون می‌ده؛ هنوز فایت می‌کنه، پس عدد تازه رو چک کن.',
        en: 'My data shows roughly 27 wins and 2 losses; she still fights, so check the fresh number.'
      }
    },
    {
      id: 'holly_holm',
      keywords: [
        'هالی هولم',
        'هالی هولم کیه',
        'holly holm',
        'who is holly holm'
      ],
      weak: ['هولم', 'holm'],
      weakSafe: true,
      hints: ['یو اف سی', 'بوکس', 'زنان', 'ufc', 'boxing', 'mma'],
      fa: 'هالی هولم صاحب بزرگ‌ترین شگفتی تاریخ ام‌ام‌ایه: هدکیکی که در ۲۰۱۵ روندا روزیِ شکست‌ناپذیر رو خاموش کرد. قبل از ام‌ام‌ای، قهرمان چندباره‌ی بوکس جهان بود و در هر دو رشته به تالار مشاهیر راه پیدا کرده.',
      en: 'Holly Holm owns the biggest upset in MMA history: the 2015 head kick that switched off the unbeatable Ronda Rousey. Before MMA she was a multiple-time world boxing champion, and she has hall-of-fame credentials in both sports.',
      record: {
        fa: 'رکورد ام‌ام‌ای‌اش در دیتای من حدود ۱۵ برد و ۷ باخته و به بوکس برگشته؛ وضعیت فعلی‌اش رو چک کن.',
        en: 'Her MMA record in my data is about 15 wins and 7 losses, and she has returned to boxing; check her current status.'
      }
    },
    {
      id: 'kayla_harrison',
      keywords: [
        'کیلا هریسون',
        'کیلا هریسون کیه',
        'kayla harrison',
        'who is kayla harrison'
      ],
      weak: ['کیلا', 'هریسون', 'harrison'],
      weakSafe: true,
      hints: ['یو اف سی', 'جودو', 'زنان', 'ufc', 'judo', 'mma'],
      fa: 'کیلا هریسون تنها آمریکاییه که دو طلای المپیک جودو داره (۲۰۱۲ و ۲۰۱۶) و بعد در ام‌ام‌ای هم به قله رسید: دوبار قهرمان تورنمنت میلیون‌دلاری PFL شد و در ۲۰۲۵ کمربند بانتام‌وزن UFC رو گرفت.',
      en: 'Kayla Harrison is the only American with two Olympic judo golds (2012 and 2016), and she reached the top of MMA too: a two-time PFL million-dollar tournament champion who won the UFC bantamweight title in 2025.',
      record: {
        fa: 'دیتای من می‌گه فقط یه باخت در کل دوران حرفه‌ایش داره و حدود ۱۹ برده؛ فعاله و در اوجه، عدد دقیق رو چک کن.',
        en: 'My data says she has just one loss in her whole career, at around 19 wins; she is active and in her prime, so check the exact number.'
      }
    },
    {
      id: 'bruce_lee_fighter',
      keywords: ['بروس لی', 'بروس لی کیه', 'bruce lee', 'who is bruce lee'],
      weak: ['بروس', 'bruce'],
      weakSafe: true,
      hints: ['رزمی', 'کونگ فو', 'فیلم', 'martial', 'kung fu', 'fighter'],
      fa: 'بروس لی معروف‌ترین هنرمند رزمی تاریخه: بازیگر و فیلسوف هنگ‌کنگی-آمریکایی که با فیلم‌هایی مثل «اژدها وارد می‌شود» کونگ‌فو رو جهانی کرد و با سبک خودش، جیت کان دو، ایده‌ی «سبک بی‌سبک» رو ساخت؛ همون فلسفه‌ای که بعدها پایه‌ی فکری ام‌ام‌ای شد. در ۳۲ سالگی و در اوج، از دنیا رفت.',
      en: "Bruce Lee is the most famous martial artist in history: the Hong Kong-American actor and philosopher who made kung fu global with films like Enter the Dragon and created Jeet Kune Do, the style of no style, the philosophy that later became MMA's intellectual foundation. He died at 32, at his peak.",
      more: {
        fa: 'جمله‌ی معروفش هنوز ورد زبون مربی‌هاست: «از کسی که ده‌هزار ضربه رو یه بار تمرین کرده نمی‌ترسم؛ از کسی می‌ترسم که یه ضربه رو ده‌هزار بار تمرین کرده.» دنا وایت، رییس UFC، بارها گفته بروس لی «پدر ام‌ام‌ای» بوده، چون دهه‌ها قبل از UFC می‌گفت مبارز کامل باید از هر سبکی بهترینش رو بگیره.',
        en: 'His famous line is still coaching gospel: I fear not the man who has practiced ten thousand kicks once, but the man who has practiced one kick ten thousand times. UFC president Dana White has repeatedly called Bruce Lee the father of MMA, because decades before the UFC he argued a complete fighter should take the best from every style.'
      }
    },
    {
      id: 'mike_tyson_boxer',
      keywords: [
        'مایک تایسون',
        'مایک تایسون کیه',
        'mike tyson',
        'who is mike tyson',
        'iron mike'
      ],
      weak: ['تایسون', 'tyson'],
      weakSafe: true,
      hints: ['بوکس', 'مشت', 'سنگین وزن', 'boxing', 'heavyweight', 'knockout'],
      fa: 'مایک تایسون، «مایک آهنی»، جوون‌ترین قهرمان سنگین‌وزن تاریخ بوکسه: در ۲۰ سالگی (۱۹۸۶) کمربند رو گرفت و با ناک‌اوت‌های وحشیانه‌ی راندهای اول، ترسناک‌ترین ورزشکار دهه شد. زندگیش پر از فراز و نشیبه؛ از زندان و ورشکستگی تا برگشتن به‌عنوان چهره‌ی محبوب فرهنگ عامه.',
      en: 'Mike Tyson, Iron Mike, is the youngest heavyweight champion in boxing history: he took the belt at 20 (in 1986) and his savage first-round knockouts made him the most feared athlete of his decade. His life has been all peaks and valleys, from prison and bankruptcy back to beloved pop-culture figure.',
      record: {
        fa: 'رکورد حرفه‌ای بوکسش ۵۰ برد (۴۴ ناک‌اوت) و ۶ باخته؛ نمایشی‌های بعدی (مثل مبارزه با جیک پال در ۲۰۲۴) جزو رکورد رسمی حساب می‌شن یا نه، بستگی به منبع داره.',
        en: 'His pro boxing record is 50 wins (44 knockouts) and 6 losses; whether the later exhibitions (like the 2024 Jake Paul fight) count officially depends on the source.',
        final: true
      }
    },
    {
      id: 'buakaw',
      keywords: [
        'بوآکاو',
        'بواکاو',
        'بوآکاو کیه',
        'buakaw',
        'who is buakaw',
        'buakaw banchamek'
      ],
      weak: ['بوآکاو', 'بواکاو', 'buakaw'],
      weakSafe: true,
      hints: ['موی تای', 'کیک بوکس', 'تایلند', 'muay thai', 'kickboxing'],
      fa: 'بوآکاو بانچامک معروف‌ترین موی‌تای‌کار زنده‌ی دنیاست: تایلندیه، از هشت‌سالگی مبارزه کرده و با دوبار قهرمانی تورنمنت K-1 World MAX (۲۰۰۴ و ۲۰۰۶) موی‌تای رو به تماشاگر جهانی معرفی کرد. بالای ۲۴۰ برد حرفه‌ای داره.',
      en: 'Buakaw Banchamek is the most famous living Muay Thai fighter: Thai, fighting since age eight, he introduced Muay Thai to a global audience by winning the K-1 World MAX tournament twice (2004 and 2006). He has over 240 professional wins.',
      record: {
        fa: 'آمار دقیق مبارزهای موی‌تای همیشه بین منابع فرق داره، ولی رکوردش چیزی حدود ۲۴۰+ برد از حدود ۳۰۰ مبارزه‌ست؛ هنوز گاهی مبارزه‌های نمایشی می‌ره.',
        en: 'Muay Thai numbers always differ between sources, but his record is roughly 240+ wins out of about 300 fights; he still takes occasional exhibition bouts.'
      }
    },
    {
      id: 'kickboxing_vs_muaythai',
      keywords: [
        'فرق کیک بوکسینگ و موی تای',
        'فرق کیک‌بوکسینگ و موی‌تای',
        'کیک بوکسینگ با موی تای چه فرقی داره',
        'کیک‌بوکسینگ با موی‌تای چه فرقی داره',
        'موی تای چیه',
        'موی‌تای چیه',
        'کیک بوکسینگ چیه',
        'کیک‌بوکسینگ چیه',
        'kickboxing vs muay thai',
        'muay thai vs kickboxing',
        'difference between kickboxing and muay thai',
        'what is muay thai',
        'what is kickboxing'
      ],
      weak: [
        'کیک بوکسینگ',
        'کیک‌بوکسینگ',
        'موی تای',
        'موی‌تای',
        'kickboxing',
        'muay thai'
      ],
      weakSafe: true,
      hints: ['رزمی', 'مبارزه', 'فرق', 'martial', 'fight', 'difference'],
      fa: 'موی‌تای رو «هنر هشت عضو» صدا می‌زنن، چون علاوه بر مشت و لگد، آرنج و زانو هم آزاده و کلینچ (درگیری ایستاده) بخش بزرگی از بازیه. کیک‌بوکسینگ (مثل قوانین K-1) معمولاً آرنج و کلینچ طولانی رو حذف می‌کنه و روی ترکیب‌های سریع مشت و لگد سواره؛ برای همین ریتمش تندتره و موی‌تای سنگین‌تر و فرسایشی‌تر. امتیازدهی هم فرق داره: موی‌تای ضربه‌های محکم و کنترل کلینچ رو بیشتر می‌پسنده، کیک‌بوکسینگ حجم و تنوع ترکیب‌ها رو. هر دو از پایه‌های اصلی ضربه‌زنی در ام‌ام‌ای هستن.',
      en: 'Muay Thai is called the art of eight limbs: besides punches and kicks, elbows and knees are legal and the clinch is a huge part of the game. Kickboxing (K-1-style rules) usually removes elbows and extended clinching and runs on fast punch-kick combinations, so its rhythm is quicker while Muay Thai is heavier and more grinding. Scoring differs too: Muay Thai rewards hard single strikes and clinch control, kickboxing rewards volume and variety. Both are core striking bases for MMA.'
    },
    {
      id: 'boxing_goat',
      keywords: [
        'بهترین بوکسور تاریخ',
        'بهترین بوکسور',
        'بهترین بوکسور جهان',
        'محمد علی بهتره یا تایسون',
        'تایسون بهتره یا محمد علی',
        'best boxer of all time',
        'greatest boxer',
        'best boxer',
        'tyson or ali',
        'ali or tyson'
      ],
      weak: [],
      weakSafe: true,
      hints: ['بوکس', 'boxing', 'مشت', 'ring'],
      fa: 'بحث بهترین بوکسور تاریخ معمولاً با محمد علی کلی شروع می‌شه: سه بار قهرمان سنگین‌وزن، نماد شجاعت بیرون از رینگ و صاحب «غرش در جنگل». شوگر ری رابینسون رو خیلی از کارشناس‌ها فنی‌ترین بوکسور تاریخ می‌دونن، مایک تایسون ترسناک‌ترین ضربه‌زن بود و فلوید می‌ودر با ۵۰ برد بدون باخت رکورد بی‌نقصی داره. هر کدوم یه معیار متفاوت رو نمایندگی می‌کنن: تأثیر، تکنیک، قدرت یا رکورد.',
      en: 'The greatest-boxer debate usually starts with Muhammad Ali: three-time heavyweight champion, a symbol of courage outside the ring, and the man behind the Rumble in the Jungle. Many experts call Sugar Ray Robinson the most skilled boxer ever, Mike Tyson was the most feared puncher, and Floyd Mayweather retired a perfect 50-0. Each one stands for a different measuring stick: impact, technique, power, or the record.'
    },
    {
      id: 'rico_verhoeven',
      keywords: [
        'ریکو ورهوون',
        'ریکو ورهوفن',
        'ریکو کیه',
        'rico verhoeven',
        'who is rico verhoeven'
      ],
      weak: ['ریکو', 'ورهوون', 'verhoeven'],
      weakSafe: true,
      hints: ['کیک بوکس', 'هلند', 'سنگین وزن', 'kickboxing', 'glory'],
      fa: 'ریکو ورهوون، «پادشاه کیک‌بوکسینگ»، سنگین‌وزن هلندیه که از ۲۰۱۳ تا امروز کمربند سنگین‌وزن Glory رو نگه داشته؛ یکی از طولانی‌ترین سلطنت‌های تاریخ ورزش‌های رزمی. آرامش، هوش مبارزه و آمادگی بدنی‌اش زبانزده.',
      en: 'Rico Verhoeven, The King of Kickboxing, is the Dutch heavyweight who has held the Glory heavyweight belt since 2013, one of the longest reigns in combat-sports history. His calm, fight IQ and conditioning are legendary.',
      record: {
        fa: 'دیتای من رکورد کیک‌بوکسینگش رو حدود ۶۰ برد و ۱۰ باخت می‌گه؛ فعاله، عدد دقیق رو چک کن.',
        en: 'My data has his kickboxing record around 60 wins and 10 losses; he is active, so check the exact figure.'
      }
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
