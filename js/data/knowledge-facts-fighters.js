/**
 * Darya - curated factual entries (MMA and combat-sports fighters,
 * modern era). Loaded before knowledge-base.js; registers a global
 * part. The sibling file knowledge-facts-fighters-legends.js carries
 * the earlier eras, the women's divisions, and the wider martial arts.
 *
 * Every entry carries well-established career facts only. Numbers that
 * change (win-loss records, titles held) live in the optional `record`
 * field, which the engine only serves together with an honesty note
 * that the offline snapshot may be out of date (`final: true` marks a
 * retired fighter whose record is settled). The optional `more` field
 * is a second, deeper paragraph for tell-me-more follow-ups.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'jon_jones',
      keywords: [
        'جان جونز',
        'جون جونز',
        'جان جونز کیه',
        'jon jones',
        'who is jon jones',
        'jonny bones'
      ],
      weak: ['جونز', 'jones'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'رزمی', 'ufc', 'mma', 'fighter'],
      fa: 'جان جونز رو خیلی‌ها بهترین مبارز تاریخ ام‌ام‌ای می‌دونن. جوون‌ترین قهرمان تاریخ UFC شد (۲۳ سالگی، سال ۲۰۱۱)، سال‌ها سلطان وزن نیمه‌سنگین بود و بعد در ۲۰۲۳ کمربند سنگین‌وزن رو هم گرفت. البته کارنامه‌اش پر از حاشیه هم هست: چند بار به‌خاطر دوپینگ و مشکلات خارج از قفس، کمربندش رو ازش گرفتن.',
      en: 'Jon Jones is who many people call the greatest MMA fighter ever. He became the youngest champion in UFC history (at 23, in 2011), ruled light heavyweight for years, then took the heavyweight belt too in 2023. His career also carries real controversy: he was stripped of titles more than once over doping cases and problems outside the cage.',
      record: {
        fa: 'رکورد جان جونز ۲۸ برد، ۱ باخت و یک مبارزه‌ی بدون نتیجه‌ست؛ اون تک‌باخت هم یه سلب امتیاز بحث‌برانگیز مقابل مت همیل بود، نه شکست واقعی داخل قفس. تابستون ۲۰۲۵ رسماً بازنشسته شد.',
        en: 'Jon Jones retired with a record of 28 wins, 1 loss and 1 no contest, and that single loss was a controversial disqualification against Matt Hamill, not a real defeat in the cage. He officially retired in the summer of 2025.',
        final: true
      },
      more: {
        fa: 'چیزی که جونز رو خاص می‌کرد ترکیب برد بلند بازوها، خلاقیت در ضربه‌ها (آرنج‌های چرخشی، لگد به زانو) و کشتی‌ای بود که حتی کشتی‌گیرهای المپیکی رو خنثی می‌کرد. دنیل کورمیه، الکساندر گوستافسون و استیپه میوچیچ از بزرگ‌ترین حریف‌هاش بودن. وقتی در ۲۰۲۵ کنار رفت، کمربند سنگین‌وزن به تام اسپینال رسید.',
        en: 'What made Jones special was the mix of enormous reach, creative striking (spinning elbows, oblique kicks) and wrestling that neutralized even Olympic-level wrestlers. Daniel Cormier, Alexander Gustafsson and Stipe Miocic were among his biggest rivals. When he stepped away in 2025, the heavyweight belt passed to Tom Aspinall.'
      }
    },
    {
      id: 'conor_mcgregor',
      keywords: [
        'کانر مک گرگور',
        'کانر مکگرگور',
        'مک گرگور کیه',
        'conor mcgregor',
        'who is conor mcgregor',
        'mcgregor'
      ],
      weak: ['مک گرگور', 'مکگرگور', 'کانر', 'conor'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ایرلند', 'ufc', 'mma', 'fighter'],
      fa: 'کانر مک‌گرگور ستاره‌ی ایرلندی UFC و احتمالاً معروف‌ترین چهره‌ی تاریخ این ورزشه. اولین کسی بود که هم‌زمان کمربند دو وزن مختلف UFC رو داشت (پَروزن و سبک‌وزن، سال ۲۰۱۶) و با حاضرجوابی و شومن‌بودنش ام‌ام‌ای رو وارد فرهنگ عامه کرد. مبارزه‌ی بوکسش با فلوید می‌ودر در ۲۰۱۷ یکی از پردرآمدترین رویدادهای تاریخ ورزش شد.',
      en: 'Conor McGregor is the Irish UFC superstar and probably the most famous face the sport has ever had. He was the first fighter to hold two UFC belts at the same time (featherweight and lightweight, in 2016), and his trash talk and showmanship pushed MMA into pop culture. His 2017 boxing match with Floyd Mayweather became one of the highest-grossing events in sports history.',
      record: {
        fa: 'تا جایی که دیتابیس آفلاین من می‌دونه، رکورد مک‌گرگور حدود ۲۲ برد و ۶ باخته و آخرین مبارزه‌اش سال ۲۰۲۱ مقابل داستین پوریر بود که پاش شکست.',
        en: 'As far as my offline snapshot knows, McGregor sits at about 22 wins and 6 losses, and his last fight was against Dustin Poirier in 2021, where he broke his leg.'
      },
      more: {
        fa: 'اوج مک‌گرگور ناک‌اوت ۱۳ ثانیه‌ای ژوزه آلدو در ۲۰۱۵ بود؛ رکوردی که هنوز برای مبارزه‌های قهرمانی UFC دست‌نخورده مونده. بعدش دوئل معروفش با خبیب در ۲۰۱۸ به یکی از پرتنش‌ترین شب‌های تاریخ این ورزش تبدیل شد و مغلوب شد. این سال‌ها بیشتر با حواشی، ثروت و برند ویسکی‌اش خبرساز بوده تا مبارزه.',
        en: "McGregor's peak was the 13-second knockout of Jose Aldo in 2015, still the fastest finish in a UFC title fight. His feud with Khabib in 2018 became one of the most heated nights in the sport's history, and he lost it. In recent years he has made more headlines with controversies, wealth and his whiskey brand than with fighting."
      }
    },
    {
      id: 'ilia_topuria',
      keywords: [
        'ایلیا توپوریا',
        'توپوریا کیه',
        'ilia topuria',
        'who is ilia topuria',
        'el matador'
      ],
      weak: ['توپوریا', 'topuria', 'ایلیا'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'ایلیا توپوریا، ملقب به «ال ماتادور»، مبارز گرجی-اسپانیایی و یکی از پدیده‌های نسل جدید UFC‌ه. در ۲۰۲۴ با ناک‌اوت‌کردن الکساندر ولکانوفسکی قهرمان پَروزن شد، بعد مکس هالووی رو هم ناک‌اوت کرد و در ۲۰۲۵ با بردن چارلز اولیویرا کمربند سبک‌وزن رو هم گرفت؛ بوکس دقیق و قدرت دستش زبانزده.',
      en: "Ilia Topuria, nicknamed El Matador, is the Georgian-Spanish fighter who became one of the breakout stars of the UFC's new generation. He knocked out Alexander Volkanovski in 2024 to win the featherweight title, knocked out Max Holloway next, then beat Charles Oliveira in 2025 to claim the lightweight belt as well; his crisp boxing and punching power are his trademark.",
      record: {
        fa: 'توپوریا مدت‌ها شکست‌ناپذیر بود؛ تا جایی که دیتای آفلاین من می‌گه رکوردش حدود ۱۷ برد و ۱ باخته (اولین باختش رو ژوئن ۲۰۲۶ مقابل جاستین گیجی تجربه کرد). چون هنوز فعاله، این عدد می‌تونه عوض شده باشه.',
        en: 'Topuria was unbeaten for a long time; as of my offline data he sits at about 17 wins and 1 loss (his first defeat came against Justin Gaethje in June 2026). He is still active, so that number may have moved.'
      },
      more: {
        fa: 'توپوریا در آلمان از پدر و مادر گرجی به دنیا اومد و در اسپانیا بزرگ شد؛ برای همین هم گرجستان و هم اسپانیا اون رو مال خودشون می‌دونن. پایه‌اش گراپلینگ و جوجیتسوئه ولی به‌خاطر ناک‌اوت‌های تمیزش معروف شد. بعد از بردن دو کمربند در دو وزن، خیلی‌ها اسمش رو در بحث بهترین‌های نسل جدید کنار ماخاچف می‌ذارن.',
        en: 'Topuria was born in Germany to Georgian parents and grew up in Spain, which is why both Georgia and Spain claim him. His base is grappling and jiu-jitsu, but the clean knockouts made him famous. After winning belts in two divisions, many people put his name next to Makhachev in the new-generation GOAT debate.'
      }
    },
    {
      id: 'islam_makhachev',
      keywords: [
        'اسلام ماخاچف',
        'ماخاچف کیه',
        'islam makhachev',
        'who is islam makhachev'
      ],
      weak: ['ماخاچف', 'makhachev'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'داغستان', 'ufc', 'mma', 'fighter'],
      fa: 'اسلام ماخاچف مبارز داغستانی و شاگرد و دوست نزدیک خبیب نورمحمدافه. سال ۲۰۲۲ قهرمان سبک‌وزن UFC شد، رکورد بیشترین دفاع موفق تاریخ این وزن رو زد و بعد در ۲۰۲۵ رفت وزن ولتر و اونجا هم کمربند گرفت. سال‌ها صدر رنکینگ پوند به پوند بود؛ کشتی خفه‌کننده و سابمیشن‌های تمیزش امضای اونه.',
      en: 'Islam Makhachev is the Dagestani fighter who trained alongside Khabib Nurmagomedov as his closest teammate. He won the UFC lightweight title in 2022, set the record for most successful defenses in that division, then moved up in 2025 and took the welterweight belt too. He spent years at the top of the pound-for-pound rankings; smothering wrestling and clean submissions are his signature.',
      record: {
        fa: 'تا آخرین آپدیت قفسه‌ی آفلاین من، رکورد ماخاچف حدود ۲۸ برد و فقط ۱ باخته (یه ناک‌اوت غافلگیرکننده در ۲۰۱۵). هنوز فعاله، پس حتماً عدد به‌روزش رو چک کن.',
        en: 'As of my last offline update, Makhachev sits at roughly 28 wins with just 1 loss (a surprise knockout back in 2015). He is still active, so do check the current number.'
      }
    },
    {
      id: 'alex_pereira',
      keywords: [
        'الکس پریرا',
        'پریرا کیه',
        'alex pereira',
        'who is alex pereira',
        'poatan'
      ],
      weak: ['پریرا', 'pereira', 'poatan'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'کیک بوکس', 'ufc', 'mma', 'kickboxing'],
      fa: 'الکس پریرا، ملقب به «پوآتان»، اسطوره‌ی کیک‌بوکسینگ برزیله که دیر وارد ام‌ام‌ای شد و با سرعتی باورنکردنی قهرمان دو وزن UFC شد: میان‌وزن در ۲۰۲۲ و نیمه‌سنگین در ۲۰۲۳. لگد چپ افسانه‌ای و خونسردی یخی‌اش معروفه؛ در کیک‌بوکسینگ هم تنها کسی بود که هم‌زمان قهرمان دو وزن Glory بود.',
      en: 'Alex Pereira, nicknamed Poatan, is the Brazilian kickboxing legend who came to MMA late and still became a two-division UFC champion at record speed: middleweight in 2022 and light heavyweight in 2023. His left hook and ice-cold calm are famous, and back in kickboxing he was the only simultaneous two-division Glory champion.',
      record: {
        fa: 'رکورد ام‌ام‌ای پریرا تا جایی که دیتای من می‌گه حدود ۱۲ برد و ۳ باخته، و در کیک‌بوکسینگ هم بالای ۳۰ برد داشت. فعاله و این عددها تازه‌ترین نسخه نیستن؛ چک‌شون کن.',
        en: 'As far as my data goes, Pereira sits around 12 wins and 3 losses in MMA, on top of 30-plus kickboxing wins. He is active, so treat those numbers as a snapshot and check the latest.'
      },
      more: {
        fa: 'داستان پریرا و ایزرائیل آدسانیا یکی از جذاب‌ترین رقابت‌های مدرنه: پریرا دو بار در کیک‌بوکسینگ آدسانیا رو برد (یه بار با ناک‌اوت)، در UFC هم ازش کمربند گرفت، و بعد آدسانیا در ریمچ ناک‌اوتش کرد. پریرا بعدش رفت وزن بالاتر و اونجا سلطان شد. ریشه‌ی بومی برزیلی داره و اسم «پوآتان» یعنی «دست سنگی».',
        en: "The Pereira-Adesanya saga is one of the best modern rivalries: Pereira beat Adesanya twice in kickboxing (once by knockout), took his UFC belt too, then Adesanya knocked him out in the rematch. Pereira simply moved up a division and became king there. He has Brazilian indigenous roots, and Poatan means 'stone hands'."
      }
    },
    {
      id: 'israel_adesanya',
      keywords: [
        'ایزرائیل آدسانیا',
        'ایزراییل آدسانیا',
        'آدسانیا کیه',
        'israel adesanya',
        'who is israel adesanya',
        'stylebender'
      ],
      weak: ['آدسانیا', 'adesanya', 'stylebender'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'ایزرائیل آدسانیا، ملقب به «استایل‌بندر»، مبارز نیجریه‌ای-نیوزیلندی و یکی از تکنیکی‌ترین ضربه‌زن‌های تاریخ میان‌وزن UFC‌ه. از کیک‌بوکسینگ حرفه‌ای اومد، سال‌ها قهرمان میان‌وزن بود و استایل نمایشی و شخصیت رنگارنگش (عاشق انیمه‌ست و از ناروتو الهام می‌گیره) اون رو ستاره کرد.',
      en: 'Israel Adesanya, The Last Stylebender, is the Nigerian-New Zealander who became one of the most technical strikers middleweight has ever seen. He came from professional kickboxing, held the UFC middleweight title for years, and his flashy style and colorful personality (he is a huge anime fan and draws inspiration from Naruto) made him a star.',
      record: {
        fa: 'دیتای آفلاین من رکوردش رو حدود ۲۴ برد و ۵ باخت نشون می‌ده، ولی چند سال اخیر پر از نوسان بوده و اگه هنوز مبارزه کنه این عدد قدیمیه.',
        en: 'My offline data shows him around 24 wins and 5 losses, but his recent years have been up and down, and if he is still fighting that number is dated.'
      }
    },
    {
      id: 'alexander_volkanovski',
      keywords: [
        'الکساندر ولکانوفسکی',
        'ولکانوفسکی کیه',
        'alexander volkanovski',
        'who is volkanovski'
      ],
      weak: ['ولکانوفسکی', 'volkanovski'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'الکساندر ولکانوفسکی استرالیاییه و یکی از بهترین پَروزن‌های تاریخ UFC. سه بار مکس هالووی رو برد، سال‌ها کمربند پَروزن رو نگه داشت و بعد از باخت به توپوریا، در ۲۰۲۵ دوباره قهرمان همون وزن شد. قبل از ام‌ام‌ای بازیکن راگبی بود و با قد نسبتاً کوتاهش همیشه دست‌کم گرفته می‌شد.',
      en: 'Alexander Volkanovski is the Australian who became one of the best featherweights in UFC history. He beat Max Holloway three times, held the featherweight belt for years, and after losing it to Topuria he won it back in 2025. He played rugby before MMA and was always underestimated for his short frame.',
      record: {
        fa: 'رکوردش در دیتای من حدود ۲۷ برد و ۴ باخته؛ هنوز فعاله پس عدد دقیق رو از یه منبع به‌روز بگیر.',
        en: 'My data has him around 27 wins and 4 losses; he is still active, so grab the exact number from a current source.'
      }
    },
    {
      id: 'max_holloway',
      keywords: [
        'مکس هالووی',
        'هالووی کیه',
        'max holloway',
        'who is max holloway',
        'blessed'
      ],
      weak: ['هالووی', 'holloway'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'مکس هالووی مبارز هاوایی و یکی از محبوب‌ترین چهره‌های UFC‌ه؛ قهرمان سابق پَروزن و پادشاه ضربه‌زدن حجمی: رکورد بیشترین ضربه‌ی فرودآمده در تاریخ UFC مال اونه. ناک‌اوت ثانیه‌ی آخرش مقابل جاستین گیجی در ۲۰۲۴، که کمربند BMF رو باهاش گرفت، یکی از دیوانه‌وارترین لحظه‌های تاریخ این ورزشه.',
      en: 'Max Holloway is the Hawaiian fan favorite, former featherweight champion and the king of volume striking: he holds the record for most significant strikes landed in UFC history. His last-second knockout of Justin Gaethje in 2024, which won him the BMF belt, is one of the wildest moments the sport has produced.',
      record: {
        fa: 'دیتای آفلاین من می‌گه حدود ۲۷ برد و ۸ باخت داره؛ فعاله و این عدد ممکنه جا مونده باشه.',
        en: 'My offline data says roughly 27 wins and 8 losses; he is active, so that may be behind.'
      }
    },
    {
      id: 'charles_oliveira',
      keywords: [
        'چارلز اولیویرا',
        'اولیویرا کیه',
        'charles oliveira',
        'who is charles oliveira',
        'do bronx'
      ],
      weak: ['اولیویرا', 'oliveira'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'برزیل', 'ufc', 'mma', 'fighter'],
      fa: 'چارلز اولیویرا، ملقب به «دو برانکس»، مبارز برزیلیه که از محله‌های فقیر سائوپائولو به کمربند سبک‌وزن UFC رسید (۲۰۲۱). رکورددار بیشترین سابمیشن و بیشترین فینیش تاریخ UFC‌ه؛ جوجیتسوی خطرناکش یعنی هر لحظه ممکنه مبارزه رو تموم کنه.',
      en: 'Charles Oliveira, Do Bronx, is the Brazilian who climbed from a poor Sao Paulo neighborhood to the UFC lightweight title (2021). He holds the all-time UFC records for submissions and finishes; his jiu-jitsu is so dangerous the fight can end any second.',
      record: {
        fa: 'رکوردش در دیتابیس من حدود ۳۵ برد و ۱۱ باخته؛ فعاله و عددش رو حتماً به‌روز چک کن.',
        en: 'My database has him around 35 wins and 11 losses; he is active, so check for the current figure.'
      }
    },
    {
      id: 'justin_gaethje',
      keywords: [
        'جاستین گیجی',
        'جاستین گیتجی',
        'گیجی کیه',
        'justin gaethje',
        'who is justin gaethje'
      ],
      weak: ['گیجی', 'گیتجی', 'gaethje'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'جاستین گیجی معروف‌ترین «جنگجوی تماشاگرپسند» UFC‌ه: کسی که تقریباً هیچ مبارزه‌ی خسته‌کننده‌ای نداشته. کشتی‌گیر دانشگاهی سابقه ولی عاشق تبادل ضربه‌ست؛ دوبار کمربند BMF رو گرفت و در ژوئن ۲۰۲۶ با بردن ایلیا توپوریا بالاخره به کمربند سبک‌وزن رسید.',
      en: "Justin Gaethje is the UFC's ultimate action fighter: the man who has almost never been in a boring fight. A former college wrestler who loves a firefight instead, he won the BMF belt twice and finally reached lightweight gold by beating Ilia Topuria in June 2026.",
      record: {
        fa: 'تا جایی که دیتای من می‌دونه رکوردش حدود ۲۷ برد و ۵ باخته؛ فعاله، پس این عدد رو قطعی نگیر.',
        en: 'As far as my data knows he is around 27 wins and 5 losses; he is active, so treat that as a snapshot.'
      }
    },
    {
      id: 'dustin_poirier',
      keywords: [
        'داستین پوریر',
        'پوریر کیه',
        'dustin poirier',
        'who is dustin poirier',
        'the diamond'
      ],
      weak: ['پوریر', 'poirier'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'داستین پوریر، ملقب به «الماس»، از محبوب‌ترین مبارزهای نسل خودش بود: دوبار کانر مک‌گرگور رو ناک‌اوت کرد، سه بار برای کمربند بدون مناقشه جنگید و در ۲۰۲۵ با یه مبارزه‌ی حماسی مقابل مکس هالووی خداحافظی کرد. بیرون از قفس هم با بنیاد خیریه‌اش شناخته می‌شه.',
      en: 'Dustin Poirier, The Diamond, was one of the most loved fighters of his generation: he knocked out Conor McGregor twice, fought three times for the undisputed belt, and retired in 2025 with an epic farewell against Max Holloway. Outside the cage he is known for his charity foundation.',
      record: {
        fa: 'پوریر با رکوردی حدود ۳۰ برد و ۱۰ باخت بازنشسته شد؛ چون دیگه فایت نمی‌کنه، این عدد تقریباً ثابته.',
        en: 'Poirier retired at roughly 30 wins and 10 losses; since he no longer fights, that number is settled.',
        final: true
      }
    },
    {
      id: 'kamaru_usman',
      keywords: [
        'کامارو عثمان',
        'کامارو اوسمان',
        'عثمان کیه',
        'kamaru usman',
        'who is kamaru usman'
      ],
      weak: ['کامارو', 'usman'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'نیجریه', 'ufc', 'mma', 'fighter'],
      fa: 'کامارو عثمان، «کابوس نیجریه‌ای»، سال‌ها قهرمان بلامنازع وزن ولتر UFC بود و با ۱۵ برد متوالی یکی از طولانی‌ترین رشته‌های بردِ تاریخ این وزن رو ساخت. کشتی سنگین و بوکس مدام بهترشونده‌اش اون رو تا صدر رنکینگ پوند به پوند برد.',
      en: 'Kamaru Usman, The Nigerian Nightmare, ruled UFC welterweight for years and put together a 15-fight win streak, one of the longest in the division. Heavy wrestling and ever-improving boxing carried him to the top of the pound-for-pound list.',
      record: {
        fa: 'دیتای من رکوردش رو حدود ۲۰ برد و ۴ باخت نشون می‌ده؛ اواخر دوران حرفه‌ایشه، پس عدد به‌روز رو چک کن.',
        en: 'My data shows about 20 wins and 4 losses; he is near the end of his career, so check the current figure.'
      }
    },
    {
      id: 'leon_edwards',
      keywords: [
        'لیون ادواردز',
        'ادواردز کیه',
        'leon edwards',
        'who is leon edwards',
        'rocky edwards'
      ],
      weak: ['ادواردز', 'edwards'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'انگلیس', 'ufc', 'mma', 'fighter'],
      fa: 'لیون ادواردز مبارز بریتانیایی-جامائیکاییه که یکی از سینمایی‌ترین لحظه‌های تاریخ UFC رو ساخت: وقتی در ۲۰۲۲ در حالی که داشت مسابقه رو می‌باخت، در دقیقه‌های آخر با یه هدکیک غافلگیرکننده کامارو عثمان رو ناک‌اوت کرد و قهرمان ولتر شد. داستان زندگیش، از کودکی سخت در جامائیکا و بیرمنگام تا کمربند طلا، الهام‌بخشه.',
      en: 'Leon Edwards is the British-Jamaican fighter behind one of the most cinematic moments in UFC history: losing on the scorecards in 2022, he knocked out Kamaru Usman with a last-minute head kick to become welterweight champion. His life story, from a hard childhood in Jamaica and Birmingham to the belt, is genuinely inspiring.',
      record: {
        fa: 'رکوردش در دیتای من حدود ۲۲ برد و ۵ باخته؛ فعاله و ممکنه عوض شده باشه.',
        en: 'My data has him around 22 wins and 5 losses; he is active, so it may have changed.'
      }
    },
    {
      id: 'sean_omalley',
      keywords: [
        'شان اومالی',
        'اومالی کیه',
        'sean omalley',
        "sean o'malley",
        'who is sean omalley',
        'suga sean'
      ],
      weak: ['اومالی', 'omalley'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'شان اومالی، ملقب به «شوگا»، ستاره‌ی رنگارنگ وزن بانتام UFC‌ه: موهای رنگی، استایل نمایشی و دقت ضربه‌ی بالا. در ۲۰۲۳ با ناک‌اوت آلجامین استرلینگ قهرمان شد و به یکی از پرطرفدارترین چهره‌های نسل اینترنتی این ورزش تبدیل شد.',
      en: "Sean O'Malley, Suga, is the colorful bantamweight star: dyed hair, flashy style and sniper-level accuracy. He knocked out Aljamain Sterling in 2023 to become champion and turned into one of the most-followed faces of the sport's internet generation.",
      record: {
        fa: 'دیتای من می‌گه حدود ۱۸ برد و ۳ باخت داره (دوتاش مقابل مراب دوالیشویلی)؛ فعاله، عدد تازه رو چک کن.',
        en: 'My data says about 18 wins and 3 losses (two of them against Merab Dvalishvili); he is active, so check the fresh number.'
      }
    },
    {
      id: 'merab_dvalishvili',
      keywords: [
        'مراب دوالیشویلی',
        'مراب کیه',
        'merab dvalishvili',
        'who is merab',
        'the machine'
      ],
      weak: ['مراب', 'دوالیشویلی', 'merab', 'dvalishvili'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'گرجستان', 'ufc', 'mma', 'fighter'],
      fa: 'مراب دوالیشویلی، ملقب به «ماشین»، مبارز گرجی وزن بانتامه که با کاردیوی غیرانسانی‌اش معروف شد: می‌تونه پنج راند تمام بدون خستگی تیک‌داون بگیره. در ۲۰۲۴ با بردن شان اومالی قهرمان شد و بعدش هم چند دفاع موفق پشت سر هم داشت.',
      en: "Merab Dvalishvili, The Machine, is the Georgian bantamweight famous for inhuman cardio: he can shoot takedowns for five full rounds without slowing down. He beat Sean O'Malley in 2024 to become champion and stacked up several defenses after that.",
      record: {
        fa: 'تا آخرین آپدیت من رکوردش حدود ۲۰ برد و ۴ باخته و در اوج دوران قهرمانیشه؛ عدد دقیق رو از منبع زنده بگیر.',
        en: 'As of my last update he sits around 20 wins and 4 losses, right in his title prime; get the exact figure from a live source.'
      }
    },
    {
      id: 'dricus_du_plessis',
      keywords: [
        'دریکوس دو پلسی',
        'دوپلسی کیه',
        'dricus du plessis',
        'who is dricus du plessis',
        'stillknocks'
      ],
      weak: ['دریکوس', 'دو پلسی', 'دوپلسی', 'plessis', 'dricus'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'آفریقای جنوبی', 'ufc', 'mma'],
      fa: 'دریکوس دو پلسی اولین قهرمان اهل آفریقای جنوبی در تاریخ UFC‌ه؛ در ۲۰۲۴ کمربند میان‌وزن رو گرفت و با استایل عجیب و به‌ظاهر شلخته ولی به‌شدت مؤثرش معروفه: همه‌چیزش غیرکلاسیکه ولی نتیجه می‌گیره. در ۲۰۲۵ کمربند رو به خمزات چیمائف باخت.',
      en: 'Dricus du Plessis is the first South African champion in UFC history; he took the middleweight belt in 2024 and is known for a strange, seemingly sloppy but brutally effective style: nothing looks textbook, everything works. He lost the belt to Khamzat Chimaev in 2025.',
      record: {
        fa: 'دیتای من رکوردش رو حدود ۲۳ برد و ۳ باخت می‌گه؛ فعاله و این فقط یه عکس فوری از گذشته‌ست.',
        en: 'My data puts him around 23 wins and 3 losses; he is active, so that is only a snapshot.'
      }
    },
    {
      id: 'khamzat_chimaev',
      keywords: [
        'خمزات چیمائف',
        'خمزات چیمایف',
        'چیمایف کیه',
        'khamzat chimaev',
        'who is khamzat chimaev',
        'borz'
      ],
      weak: ['خمزات', 'چیمایف', 'چیمائف', 'chimaev', 'khamzat'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'چچن', 'ufc', 'mma', 'fighter'],
      fa: 'خمزات چیمائف، ملقب به «بورز» (گرگ)، مبارز چچنی-اماراتیه که با تسلط وحشتناک کشتی‌اش حریف‌ها رو له می‌کنه. با شکست‌ناپذیری واردِ UFC شد، رکورد سریع‌ترین سه برد متوالی رو زد و در آگوست ۲۰۲۵ با بردن یک‌طرفه‌ی دریکوس دو پلسی قهرمان میان‌وزن شد.',
      en: 'Khamzat Chimaev, Borz (the wolf), is the Chechen-Emirati fighter who crushes opponents with terrifying wrestling control. He entered the UFC undefeated, set records for the fastest consecutive wins, and dominated Dricus du Plessis in August 2025 to become middleweight champion.',
      record: {
        fa: 'تا جایی که دیتابیس من می‌دونه هنوز شکست نخورده و رکوردش حدود ۱۵-۰ئه؛ ولی فعاله و باید عدد امروزش رو چک کنی.',
        en: "As far as my database knows he is still unbeaten at about 15-0; he is active though, so check today's number."
      }
    },
    {
      id: 'tom_aspinall',
      keywords: [
        'تام اسپینال',
        'اسپینال کیه',
        'tom aspinall',
        'who is tom aspinall'
      ],
      weak: ['اسپینال', 'aspinall'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'انگلیس', 'ufc', 'mma', 'سنگین وزن'],
      fa: 'تام اسپینال سنگین‌وزن انگلیسیه که برای وزنش سرعت و تکنیک باورنکردنی داره؛ میانگین زمان بردهاش از همه‌ی سنگین‌وزن‌های تاریخ UFC کوتاه‌تره. بعد از بازنشستگی جان جونز در ۲۰۲۵، از قهرمان موقت به قهرمان بلامنازع سنگین‌وزن ارتقا پیدا کرد.',
      en: 'Tom Aspinall is the English heavyweight with unbelievable speed and technique for his size; his average fight time is the shortest of any heavyweight in UFC history. After Jon Jones retired in 2025, he was promoted from interim to undisputed heavyweight champion.',
      record: {
        fa: 'دیتای من رکوردش رو حدود ۱۵ برد و ۳ باخت نشون می‌ده؛ فعاله و عددش ممکنه جلو رفته باشه.',
        en: 'My data shows roughly 15 wins and 3 losses; he is active and the number may have moved.'
      }
    },
    {
      id: 'ciryl_gane',
      keywords: [
        'سیریل گان',
        'سیریل گن',
        'ciryl gane',
        'who is ciryl gane',
        'bon gamin'
      ],
      weak: ['سیریل', 'gane'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'فرانسه', 'ufc', 'mma', 'سنگین وزن'],
      fa: 'سیریل گان سنگین‌وزن فرانسویه که مثل یه میان‌وزن حرکت می‌کنه: فوت‌ورک و ضربه‌های نرم و روون. از کیک‌بوکسینگ (موی‌تای) اومد، قهرمان موقت سنگین‌وزن شد و بزرگ‌ترین مبارزه‌هاش رو مقابل فرانسیس انگانو و جان جونز باخت؛ ولی همچنان از بهترین‌های وزنشه.',
      en: "Ciryl Gane is the French heavyweight who moves like a middleweight: smooth footwork and fluid striking. He came from Muay Thai kickboxing, became interim heavyweight champion, and lost his biggest fights to Francis Ngannou and Jon Jones, yet he remains one of the division's best.",
      record: {
        fa: 'دیتای من می‌گه حدود ۱۳ برد و ۲ باخت داره؛ فعاله، پس چک کن.',
        en: 'My data says about 13 wins and 2 losses; he is active, so double-check.'
      }
    },
    {
      id: 'francis_ngannou',
      keywords: [
        'فرانسیس انگانو',
        'انگانو کیه',
        'francis ngannou',
        'who is francis ngannou',
        'the predator'
      ],
      weak: ['انگانو', 'ngannou'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'کامرون', 'ufc', 'mma', 'سنگین وزن'],
      fa: 'فرانسیس انگانو داستان‌وارترین سنگین‌وزن مدرنه: از معدن شنی در کامرون و بی‌خانمانی در پاریس تا قهرمانی سنگین‌وزن UFC در ۲۰۲۱. قدرت مشتش رو «قوی‌ترین ضربه‌ی ثبت‌شده‌ی دنیا» توصیف کردن. بعد از اختلاف با UFC جدا شد، در PFL مبارزه کرد و با تایسون فیوری و آنتونی جاشوا بوکس رفت.',
      en: "Francis Ngannou is modern MMA's most storybook heavyweight: from a sand mine in Cameroon and homelessness in Paris to the UFC heavyweight title in 2021. His punch was measured as the hardest ever recorded. After a dispute with the UFC he left, fought in the PFL and boxed Tyson Fury and Anthony Joshua.",
      record: {
        fa: 'رکورد ام‌ام‌ای‌اش در دیتای من حدود ۱۸ برد و ۳ باخته؛ مسیر حرفه‌ایش این سال‌ها بین سازمان‌ها و بوکس در نوسانه، پس وضعیت فعلیش رو جدا چک کن.',
        en: 'His MMA record in my data is about 18 wins and 3 losses; his career has been moving between promotions and boxing, so check his current status separately.'
      }
    },
    {
      id: 'stipe_miocic',
      keywords: [
        'استیپه میوچیچ',
        'میوچیچ کیه',
        'stipe miocic',
        'who is stipe miocic'
      ],
      weak: ['استیپه', 'میوچیچ', 'miocic', 'stipe'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'سنگین وزن'],
      fa: 'استیپه میوچیچ رو خیلی‌ها بهترین سنگین‌وزن تاریخ UFC می‌دونن: رکورد بیشترین دفاع موفق از کمربند سنگین‌وزن مال اونه. جالب اینکه در کنار قهرمانی، سال‌ها به‌عنوان آتش‌نشان و امدادگر کار می‌کرد. در ۲۰۲۴ بعد از باخت به جان جونز بازنشسته شد.',
      en: 'Stipe Miocic is who many call the greatest UFC heavyweight ever: he holds the record for most consecutive heavyweight title defenses. Remarkably, he kept working as a firefighter-paramedic through his championship years. He retired in 2024 after losing to Jon Jones.',
      record: {
        fa: 'میوچیچ با رکوردی حدود ۲۰ برد و ۵ باخت بازنشسته شد؛ این عدد دیگه تغییری نمی‌کنه، مگه برگرده.',
        en: 'Miocic retired at about 20 wins and 5 losses; that number is settled unless he comes back.',
        final: true
      }
    },
    {
      id: 'daniel_cormier',
      keywords: [
        'دنیل کورمیه',
        'کورمیه کیه',
        'daniel cormier',
        'who is daniel cormier'
      ],
      weak: ['کورمیه', 'cormier'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'کشتی'],
      fa: 'دنیل کورمیه (دی‌سی) کشتی‌گیر المپیکی سابق آمریکاست که هم‌زمان قهرمان دو وزن سنگین و نیمه‌سنگین UFC شد؛ فقط جان جونز تونست جلوش رو بگیره و رقابت تلخ این دو از معروف‌ترین دشمنی‌های تاریخ این ورزشه. حالا یکی از محبوب‌ترین کامنتیتورهای UFC‌ه.',
      en: "Daniel Cormier (DC) is the former US Olympic wrestler who held the UFC heavyweight and light heavyweight titles at the same time; only Jon Jones could stop him, and their bitter rivalry is one of the sport's most famous feuds. He is now one of the UFC's most beloved commentators.",
      record: {
        fa: 'کورمیه با رکورد ۲۲ برد، ۳ باخت و یک بدون‌نتیجه بازنشسته شد؛ هر سه باختش در مبارزه‌های قهرمانی بود. عددش دیگه ثابته.',
        en: 'Cormier retired at 22 wins, 3 losses and 1 no contest, with all three losses coming in title fights. That number is settled.',
        final: true
      }
    },
    {
      id: 'tony_ferguson',
      keywords: [
        'تونی فرگوسن',
        'فرگوسن کیه',
        'tony ferguson',
        'who is tony ferguson',
        'el cucuy'
      ],
      weak: ['فرگوسن', 'ferguson'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'تونی فرگوسن، «ال کوکوی»، یکی از عجیب‌ترین و خطرناک‌ترین سبک‌وزن‌های تاریخ بود: ۱۲ برد متوالی، تمرین‌های نامتعارف و آرنج‌هایی که همه‌چیز رو می‌بریدن. مبارزه‌اش با خبیب پنج بار برنامه‌ریزی شد و هر پنج بار به هم خورد؛ یکی از بزرگ‌ترین «چی می‌شد اگه»های تاریخ ام‌ام‌ای. سال‌های آخر دوران حرفه‌ایش پر از باخت‌های متوالی بود.',
      en: "Tony Ferguson, El Cucuy, was one of the strangest and most dangerous lightweights ever: a 12-fight win streak, bizarre training methods and elbows that cut everything. His fight with Khabib was booked five times and fell through five times, MMA's greatest what-if. His final years brought a long losing skid.",
      record: {
        fa: 'دیتای من رکوردش رو حدود ۲۶ برد و ۱۱ باخت نشون می‌ده؛ اواخر مسیرشه و ممکنه از آخرین آپدیت من چیزی عوض شده باشه.',
        en: 'My data shows around 26 wins and 11 losses; he is at the tail of his career and things may have changed since my last update.'
      }
    },
    {
      id: 'nate_diaz',
      keywords: ['نیت دیاز', 'نیت دیاز کیه', 'nate diaz', 'who is nate diaz'],
      weak: ['دیاز', 'diaz'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'نیت دیاز نماد «اهل استاکتونِ» بی‌پرواست: بوکس حجمی، جوجیتسوی سطح بالا و شخصیتی که ذره‌ای اهل نمایش ساختگی نیست. بزرگ‌ترین لحظه‌اش خفه‌کردن کانر مک‌گرگور در ۲۰۱۶ بود؛ ریمچ‌شون هم یکی از پرفروش‌ترین رویدادهای تاریخ UFC شد. بعداً به بوکس حرفه‌ای هم رفت.',
      en: 'Nate Diaz is the face of Stockton defiance: volume boxing, high-level jiu-jitsu and zero manufactured showbiz. His biggest moment was choking out Conor McGregor in 2016, and their rematch became one of the best-selling UFC events ever. He later moved into pro boxing.',
      record: {
        fa: 'رکورد ام‌ام‌ای‌اش در دیتای من حدود ۲۲ برد و ۱۳ باخته؛ این روزها بیشتر سمت بوکسه، پس وضعیتش رو جدا چک کن.',
        en: 'His MMA record in my data is about 22 wins and 13 losses; these days he leans toward boxing, so check his current status.'
      }
    },
    {
      id: 'jorge_masvidal',
      keywords: [
        'خورخه ماسویدال',
        'ماسویدال کیه',
        'jorge masvidal',
        'who is jorge masvidal',
        'gamebred'
      ],
      weak: ['ماسویدال', 'masvidal'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ufc', 'mma', 'fighter'],
      fa: 'خورخه ماسویدال از مبارزه‌های خیابونی میامی به UFC رسید و صاحب سریع‌ترین ناک‌اوت تاریخ این سازمانه: زانوی پرشی پنج‌ثانیه‌ای به بن اسکرن در ۲۰۱۹. همون سال اولین کمربند نمادین BMF رو با بردن نیت دیاز گرفت.',
      en: "Jorge Masvidal went from Miami street fights to the UFC and owns the fastest knockout in the promotion's history: the five-second flying knee on Ben Askren in 2019. That same year he won the first symbolic BMF belt by beating Nate Diaz.",
      record: {
        fa: 'دیتای من رکوردش رو حدود ۳۵ برد و ۱۷ باخت می‌گه؛ چند سالیه کم‌کار شده و شاید برگشته باشه، پس چک کن.',
        en: 'My data has him around 35 wins and 17 losses; he has been in and out lately, so check whether he is back.'
      }
    },
    {
      id: 'henry_cejudo',
      keywords: [
        'هنری سهودو',
        'هنری سخودو',
        'سهودو کیه',
        'henry cejudo',
        'who is henry cejudo'
      ],
      weak: ['سهودو', 'سخودو', 'cejudo'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'المپیک', 'ufc', 'mma', 'کشتی'],
      fa: 'هنری سهودو تنها کسیه که هم طلای المپیک کشتی داره (۲۰۰۸) و هم قهرمان دو وزن UFC شده (مگس‌وزن و بانتام)؛ خودش به این ترکیب می‌گفت «سه‌گانه». هم دیمیتریوس جانسون رو برد و هم تی‌جی دیلاشاو رو.',
      en: 'Henry Cejudo is the only person with both an Olympic wrestling gold medal (2008) and two UFC division titles (flyweight and bantamweight); he called the combination the Triple C legacy. He beat both Demetrious Johnson and TJ Dillashaw.',
      record: {
        fa: 'دیتای من می‌گه حدود ۱۶ برد و ۵ باخت داره و بعد از برگشت ناموفقش دوباره بازنشسته شد؛ عددش تقریباً ثابته.',
        en: 'My data says about 16 wins and 5 losses, and after an unsuccessful comeback he retired again; the number is close to settled.',
        final: true
      }
    },
    {
      id: 'beneil_dariush',
      keywords: [
        'بنیل داریوش',
        'بنیل داریوش کیه',
        'beneil dariush',
        'who is beneil dariush'
      ],
      weak: ['بنیل', 'dariush'],
      weakSafe: true,
      hints: ['یو اف سی', 'مبارز', 'ایرانی', 'ufc', 'mma', 'iran'],
      fa: 'بنیل داریوش مبارز ایرانی‌تبار UFC‌ه که در ارومیه به دنیا اومد و از نوجوانی در آمریکا بزرگ شد. کمربند سیاه جوجیتسو داره، سال‌ها جزو ده نفر اول سبک‌وزن دنیا بود و یه رشته‌ی هشت‌بردی درخشان هم ساخت؛ برای خیلی از ایرانی‌ها آشناترین اسم ایرانی در UFC‌ه.',
      en: 'Beneil Dariush is the Iranian-born UFC fighter from Urmia who grew up in the US from his teens. A jiu-jitsu black belt, he spent years in the lightweight top ten and put together a brilliant eight-fight win streak; for many Iranians he is the most familiar Iranian name in the UFC.',
      record: {
        fa: 'دیتای آفلاین من رکوردش رو حدود ۲۲ برد و ۶ باخت نشون می‌ده؛ فعاله، پس عدد دقیق رو به‌روز چک کن.',
        en: 'My offline data shows him around 22 wins and 6 losses; he is active, so check the up-to-date number.'
      }
    },
    {
      id: 'amir_aliakbari',
      keywords: [
        'امیر علی اکبری',
        'علی اکبری کیه',
        'amir aliakbari',
        'who is amir aliakbari'
      ],
      weak: ['علی اکبری', 'aliakbari'],
      weakSafe: true,
      hints: ['ام ام ای', 'مبارز', 'ایرانی', 'mma', 'کشتی', 'iran'],
      fa: 'امیر علی‌اکبری سنگین‌وزن ایرانیه که از کشتی فرنگی به ام‌ام‌ای اومد و مشهورترین مبارز ایرانی این رشته‌ست. در سازمان‌های بزرگ آسیایی و بین‌المللی (مثل Rizin، ONE و PFL) مبارزه کرده و قدرت خام و پس‌زمینه‌ی کشتی‌اش نقطه‌ی قوتشه.',
      en: 'Amir Aliakbari is the Iranian heavyweight who came to MMA from Greco-Roman wrestling and is the best-known Iranian fighter in the sport. He has fought in major Asian and international promotions such as Rizin, ONE and the PFL, with raw power and a wrestling base as his strengths.',
      record: {
        fa: 'رکورد دقیقش رو از دیتای آفلاینم قطعی نمی‌گم چون در سازمان‌های مختلف مبارزه کرده و عددها جابه‌جا می‌شن؛ برای رکورد به‌روز، Tapology یا ویکی‌پدیا مطمئن‌تره.',
        en: 'I will not pin his exact record from my offline data because he has fought across different promotions and the numbers move around; Tapology or Wikipedia is safer for the current record.'
      }
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
