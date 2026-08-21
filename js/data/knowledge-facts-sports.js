/**
 * Darya - curated factual entries (sports beyond the core four).
 * Loaded before knowledge-base.js; registers a global part.
 *
 * Covers the breadth the companion needs for everyday sports talk:
 * tennis, chess, wrestling, cricket, American football (deliberately
 * separate from association football), boxing, swimming, athletics,
 * gymnastics, judo, taekwondo, cycling, skiing, esports, table tennis,
 * badminton, handball, rugby, golf, Formula One, plus the offside rule,
 * VAR, and Iranian specialties (wrestling, weightlifting, futsal).
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'tennis_history',
      keywords: [
        'تنیس چیه',
        'تاریخچه تنیس',
        'قوانین تنیس',
        'tennis',
        'what is tennis',
        'tennis rules',
        'tennis history'
      ],
      weak: ['تنیس', 'tennis'],
      weakSafe: true,
      hints: ['ورزش', 'راکت', 'اسلم', 'sport', 'racket', 'grand slam'],
      fa: 'تنیس با راکت و توپ در زمینی مستطیل با تور وسط بازی می‌شود؛ امتیازها به شکل ۱۵، ۳۰، ۴۰ و بازی شمرده می‌شوند و برای بردن ست باید شش گیم با دو اختلاف برد. ریشه‌هایش به فرانسه‌ی قرن دوازدهم برمی‌گردد و شکل مدرنش در انگلستان قرن نوزدهم شکل گرفت. چهار گرنداسلم (آزاد استرالیا، فرانسه، ویمبلدون، آمریکا) مهم‌ترین تورنمنت‌هایش هستند و بازیکن‌ها روی زمین‌های خاکی، چمن و هارد بازی می‌کنند.',
      en: 'Tennis is played with a racket and ball on a rectangular court split by a net; points run 15, 30, 40 and game, and a set needs six games with a two-game lead. Its roots go back to 12th-century France, and the modern game took shape in 19th-century England. The four Grand Slams (Australian Open, French Open, Wimbledon, US Open) are its biggest titles, played on clay, grass, and hard courts.'
    },
    {
      id: 'chess_history',
      keywords: [
        'شطرنج چیه',
        'تاریخچه شطرنج',
        'قوانین شطرنج',
        'chess',
        'what is chess',
        'chess rules',
        'chess history'
      ],
      weak: ['شطرنج', 'chess'],
      weakSafe: true,
      hints: ['مهره', 'کیش', 'بازی فکری', 'board', 'king', 'checkmate'],
      fa: 'شطرنج یک بازی فکری دو‌نفره با ۶۴ خانه است که ریشه در هند باستان (چاتورانگا) دارد و از طریق ایران و جهان اسلام به اروپا رفت. هر بازیکن شانزده مهره دارد: شاه، وزیر، دو رخ، دو فیل، دو اسب و هشت سرباز؛ هدف کیش‌ومات کردن شاه حریف است. مسابقات رسمی قوانین جهانی دارند و عناوینی مثل استادبزرگ بالاترین سطح آن است.',
      en: 'Chess is a two-player board game on 64 squares with roots in ancient India (chaturanga), carried to Europe through Persia and the Islamic world. Each player has sixteen pieces: a king, queen, two rooks, two bishops, two knights, and eight pawns; the goal is checkmate. Official play follows world rules, and grandmaster is its highest title.'
    },
    {
      id: 'wrestling_history',
      keywords: [
        'کشتی چیه',
        'تاریخچه کشتی',
        'کشتی آزاد',
        'کشتی فرنگی',
        'wrestling',
        'what is wrestling',
        'freestyle wrestling',
        'greco roman wrestling'
      ],
      weak: ['کشتی', 'wrestling'],
      weakSafe: true,
      hints: ['ورزش', 'المپیک', 'تشک', 'sport', 'olympic', 'mat'],
      fa: 'کشتی یکی از قدیمی‌ترین ورزش‌های جهان است و از نخستین دوره‌های المپیک باستان و مدرن حضور داشته. دو شاخه‌ی اصلی المپیکی دارد: آزاد (استفاده از پا برای گرفتن حریف آزاد است) و فرنگی (فقط بالاتنه). هدف، پشت زدن حریف یا جمع کردن امتیاز با تکنیک‌های فنی است. در ایران کشتی از محبوب‌ترین و مدال‌آورترین رشته‌هاست.',
      en: 'Wrestling is among the oldest sports in the world and has been in the Olympics since the ancient games. The two Olympic styles are freestyle (leg attacks allowed) and Greco-Roman (upper body only). The goal is pinning the opponent or scoring with technical moves. In Iran, wrestling is one of the most popular and most medal-winning sports.'
    },
    {
      id: 'wrestling_iran',
      keywords: [
        'کشتی ایران',
        'تیم ملی کشتی ایران',
        'تختی کیه',
        'کشتی گیران ایران',
        'iran wrestling',
        'iranian wrestlers'
      ],
      weak: ['کشتی ایران', 'تختی', 'یزدانی', 'iran wrestling'],
      weakSafe: true,
      hints: ['ایران', 'المپیک', 'مدال', 'iran', 'olympic', 'medal'],
      fa: 'کشتی ایران از دهه‌ی ۱۹۵۰ با غلامرضا تختی (قهرمان المپیک ۱۹۵۶ ملبورن و نماد جوانمردی) به سطح جهانی رسید. بعدها عبدالله موحد، حمید سوریان و حسن یزدانی (قهرمان المپیک ۲۰۱۶ ریو) این مسیر را ادامه دادند. ایران در کشتی آزاد و فرنگی از قدرت‌های ثابت جهان است و مدال‌های المپیکی زیادی گرفته.',
      en: 'Iranian wrestling reached the world stage in the 1950s with Gholamreza Takhti (1956 Melbourne Olympic champion and a symbol of sportsmanship). Later Abdollah Movahed, Hamid Sourian, and Hassan Yazdani (2016 Rio Olympic champion) carried the tradition. Iran is a constant world power in both freestyle and Greco-Roman wrestling.'
    },
    {
      id: 'cricket_history',
      keywords: [
        'کریکت چیه',
        'قوانین کریکت',
        'cricket',
        'what is cricket',
        'cricket rules'
      ],
      weak: ['کریکت', 'cricket'],
      weakSafe: true,
      hints: ['ورزش', 'توپ', 'ویکت', 'sport', 'ball', 'wicket'],
      fa: 'کریکت با چوب (بت) و توپ بین دو تیم یازده‌نفره بازی می‌شود؛ یک تیم توپ‌زنی می‌کند و تیم دیگر توپ‌اندازی و فیلدینگ. هدف زدن هرچه بیشتر ران (دور زدن بین دو ویکت) است. ریشه‌اش در انگلستان قرن شانزدهم است و امروز در هند، پاکستان، استرالیا، انگلستان و کشورهای کارائیب محبوبیت عظیمی دارد؛ مسابقات T20 کوتاه‌ترین و پرتماشاگرترین فرم آن است.',
      en: 'Cricket is a bat-and-ball game between two teams of eleven; one team bats while the other bowls and fields, and the goal is scoring as many runs as possible between two wickets. It originated in 16th-century England and is hugely popular in India, Pakistan, Australia, England, and the Caribbean; T20 is its shortest, most watched format.'
    },
    {
      id: 'american_football',
      keywords: [
        'فوتبال آمریکایی چیه',
        'فوتبال امریکایی چیه',
        'قوانین فوتبال آمریکایی',
        'american football',
        'what is american football',
        'american football rules',
        'super bowl'
      ],
      weak: [
        'فوتبال آمریکایی',
        'فوتبال امریکایی',
        'american football',
        'super bowl'
      ],
      weakSafe: true,
      hints: ['ورزش', 'توپ', 'nfl', 'sport', 'ball'],
      fa: 'فوتبال آمریکایی با فوتبال معمولی (ساکر) خیلی فرق دارد: دو تیم یازده‌نفره با توپ بیضی و کلاه و زره بازی می‌کنند و با جلو بردن توپ در زمین (داون‌ها) تلاش می‌کنند به انتهای زمین حریف برسند و تاچ‌داون (۶ امتیاز) بزنند. لیگ NFL در آمریکا محبوب‌ترین لیگ ورزشی کشور است و سوپر بول فینال آن، پرمخاطب‌ترین برنامه‌ی تلویزیونی آمریکاست.',
      en: 'American football is very different from soccer: two teams of eleven play with an oval ball while wearing helmets and pads, advancing the ball in downs to reach the opponent end zone for a touchdown (six points). The NFL is the most popular sports league in the United States, and the Super Bowl is its final, one of the most watched television events in America.'
    },
    {
      id: 'boxing_history',
      keywords: [
        'بوکس چیه',
        'تاریخچه بوکس',
        'قوانین بوکس',
        'boxing',
        'what is boxing',
        'boxing rules'
      ],
      weak: ['بوکس', 'boxing'],
      weakSafe: true,
      hints: ['ورزش', 'رینگ', 'مشت', 'sport', 'ring', 'punch'],
      fa: 'بوکس ورزش مبارزه‌ای است که در آن دو نفر با دستکش در رینگ و در راندهای کوتاه با هم مبارزه می‌کنند و امتیازها بر اساس ضربات دقیق و تمیز داده می‌شود. ریشه‌اش به مسابقات مشت‌زنی باستانی می‌رسد و در قرن نوزدهم انگلستان قوانین مدرن (قوانین مارکیز کویینزبری) شکل گرفت. محمدعلی کلی، جو فریزر و مایک تایسون از مشهورترین چهره‌های تاریخ آن هستند.',
      en: 'Boxing is a combat sport where two fighters wearing gloves battle in a ring over short rounds, scoring points for clean, accurate punches. Its roots go back to ancient fist-fighting, and modern rules (the Marquess of Queensberry rules) took shape in 19th-century England. Muhammad Ali, Joe Frazier, and Mike Tyson are among its most famous figures.'
    },
    {
      id: 'swimming_history',
      keywords: [
        'شنا چیه',
        'تاریخچه شنا',
        'انواع شنا',
        'swimming',
        'what is swimming',
        'swimming styles'
      ],
      weak: ['شنا', 'swimming'],
      weakSafe: true,
      hints: ['ورزش', 'آب', 'استخر', 'sport', 'water', 'pool'],
      fa: 'شنا یکی از کامل‌ترین ورزش‌های بدنی است و از ۱۸۹۶ در همه‌ی المپیک‌های مدرن حضور داشته. چهار شنای اصلی رقابتی عبارت‌اند از کرال سینه (آزاد)، کرال پشت، سینه و پروانه. مایکل فلپس آمریکایی با ۲۳ مدال طلای المپیک رکورددار تاریخ بازی‌هاست. شنا هم ورزش حرفه‌ای است و هم مهارت ضروری ایمنی.',
      en: 'Swimming is one of the most complete physical activities and has been in every modern Olympics since 1896. The four competitive strokes are freestyle (front crawl), backstroke, breaststroke, and butterfly. American Michael Phelps holds the Olympic record with 23 gold medals. Swimming is both a professional sport and an essential safety skill.'
    },
    {
      id: 'athletics_history',
      keywords: [
        'دو و میدانی چیه',
        'تاریخچه دو و میدانی',
        'دوی صد متر',
        'athletics',
        'track and field',
        'what is athletics',
        '100 meter sprint'
      ],
      weak: ['دو و میدانی', 'دوی', 'athletics', 'track and field'],
      weakSafe: true,
      hints: ['ورزش', 'المپیک', 'دویدن', 'sport', 'olympic', 'running'],
      fa: 'دو و میدانی شامل دویدن‌ها (از ۱۰۰ متر تا ماراتن)، پرش‌ها (طول، ارتفاع، سه‌گام، پرش با نیزه)، پرتاب‌ها (وزنه، دیسک، چکش، نیزه) و رشته‌های ترکیبی (ده‌گانه) است. قلب المپیک باستان و مدرن است. یوسین بولت جامائیکایی با رکورد ۹.۵۸ ثانیه در ۱۰۰ متر و ۱۹.۱۹ در ۲۰۰ متر، سریع‌ترین انسان تاریخ است.',
      en: 'Athletics (track and field) covers sprints and distance running (100 m to the marathon), jumps (long, high, triple, pole vault), throws (shot put, discus, hammer, javelin), and combined events like the decathlon. It is the heart of the ancient and modern Olympics. Usain Bolt of Jamaica, with 9.58 seconds in the 100 m and 19.19 in the 200 m, is the fastest human in history.'
    },
    {
      id: 'gymnastics_history',
      keywords: [
        'ژیمناستیک چیه',
        'تاریخچه ژیمناستیک',
        'gymnastics',
        'what is gymnastics'
      ],
      weak: ['ژیمناستیک', 'gymnastics'],
      weakSafe: true,
      hints: ['ورزش', 'المپیک', 'حرکات', 'sport', 'olympic', 'floor'],
      fa: 'ژیمناستیک ورزشی است با حرکات قدرتی، تعادلی و انعطافی روی وسایل مختلف: خرک حلقه، دارحلقه، پارالل، بارفیکس، حرکات زمینی برای مردان و چوب موازنه، پارالل ناهمسطح و حرکات زمینی برای زنان. سیمون بایلز آمریکایی با مدال‌ها و حرکات دشوارش آن را متحول کرد. ژیمناستیک هنری محبوب‌ترین شاخه‌ی المپیکی آن است.',
      en: 'Gymnastics is a sport of strength, balance, and flexibility on apparatus: pommel horse, rings, parallel bars, high bar, and floor for men; balance beam, uneven bars, and floor for women. American Simone Biles transformed it with her difficulty and medal haul. Artistic gymnastics is its most popular Olympic branch.'
    },
    {
      id: 'judo_history',
      keywords: ['جودو چیه', 'تاریخچه جودو', 'judo', 'what is judo'],
      weak: ['جودو', 'judo'],
      weakSafe: true,
      hints: ['ورزش', 'رزمی', 'المپیک', 'sport', 'martial', 'olympic'],
      fa: 'جودو یک هنر رزمی ژاپنی است که جیگورو کانو در ۱۸۸۲ پایه‌گذاری کرد؛ فلسفه‌اش استفاده از نیروی حریف به نفع خودت است. هدف، پرتاب حریف روی تشک (ایپون) یا مهار او با قفل و خفه‌کردن است. از ۱۹۶۴ در المپیک است و برخلاف بوکس و ام‌ام‌ای، ضربه زدن در آن ممنوع است.',
      en: 'Judo is a Japanese martial art founded by Jigoro Kano in 1882; its philosophy is using the opponent strength against them. The goal is throwing the opponent onto the mat (ippon) or subduing them with holds and chokes. It has been Olympic since 1964, and unlike boxing or MMA, striking is not allowed.'
    },
    {
      id: 'taekwondo_history',
      keywords: [
        'تکواندو چیه',
        'تاریخچه تکواندو',
        'taekwondo',
        'what is taekwondo'
      ],
      weak: ['تکواندو', 'taekwondo'],
      weakSafe: true,
      hints: ['ورزش', 'رزمی', 'کره', 'sport', 'martial', 'korea'],
      fa: 'تکواندو هنر رزمی کره‌ای با تأکید روی ضربات پا است؛ اسمش یعنی «راهِ مشت و پا». از ۲۰۰۰ در المپیک است و مسابقاتش با محافظ و امتیاز برای ضربات دقیق به تنه و سر برگزار می‌شود. تکواندو در ایران از پرطرفدارترین رشته‌های مدال‌آور المپیکی است.',
      en: 'Taekwondo is a Korean martial art emphasizing kicks; its name means "the way of fist and foot". It has been Olympic since 2000, with bouts fought in protective gear and points for precise kicks to the body and head. In Iran it is one of the most popular Olympic medal sports.'
    },
    {
      id: 'cycling_history',
      keywords: [
        'دوچرخه‌سواری چیه',
        'تور دو فرانس',
        'cycling',
        'what is cycling',
        'tour de france'
      ],
      weak: ['دوچرخه‌سواری', 'تور دو فرانس', 'cycling', 'tour de france'],
      weakSafe: true,
      hints: ['ورزش', 'دوچرخه', 'sport', 'bicycle', 'bike'],
      fa: 'دوچرخه‌سواری هم ورزش همگانی است هم رقابتی؛ شاخه‌های جاده، پیست، کوهستان و بی‌ام‌ایکس دارد. تور دو فرانس مشهورترین مسابقه‌ی جاده‌ای جهان است که هر تابستان حدود سه هفته در فرانسه برگزار می‌شود و رکابزنان باید پیراهن زرد (رهبر مسابقه) را هر روز به دست آورند. در ایران دوچرخه‌سواری جاده‌ای از دهه‌های اخیر رشد کرده است.',
      en: 'Cycling is both a mass activity and a competitive sport with road, track, mountain, and BMX branches. The Tour de France, held every summer for about three weeks in France, is the most famous road race in the world, and riders fight for the yellow jersey as the race leader. Road cycling has been growing in Iran in recent decades.'
    },
    {
      id: 'skiing_history',
      keywords: ['اسکی چیه', 'تاریخچه اسکی', 'skiing', 'what is skiing', 'ski'],
      weak: ['اسکی', 'skiing'],
      weakSafe: true,
      hints: ['ورزش', 'برف', 'زمستان', 'sport', 'snow', 'winter'],
      fa: 'اسکی ورزشی زمستانی است که با دو تیغه روی برف انجام می‌شود؛ شاخه‌های اصلی‌اش اسکی آلپاین (سراشیبی)، اسکی صحرانوردی و پرش با اسکی است. ریشه‌اش به اسکاندیناوی باستان می‌رسد و در المپیک زمستانی از ۱۹۲۴ حضور دارد. در ایران پیست‌هایی مثل دیزین و شمشک از دهه‌ی ۱۳۴۰ اسکی‌بازان را جذب کرده‌اند.',
      en: 'Skiing is a winter sport done on two boards over snow; its main branches are alpine (downhill), cross-country, and ski jumping. Its roots go back to ancient Scandinavia, and it has been in the Winter Olympics since 1924. In Iran, resorts like Dizin and Shemshak have drawn skiers since the 1960s.'
    },
    {
      id: 'esports_history',
      keywords: [
        'ورزش الکترونیک چیه',
        'ای‌اسپرت چیه',
        'esports',
        'what is esports',
        'esport'
      ],
      weak: ['ای‌اسپرت', 'ای اسپرت', 'esports', 'esport', 'ورزش الکترونیک'],
      weakSafe: true,
      hints: ['بازی', 'مسابقه', 'game', 'competitive'],
      fa: 'ورزش الکترونیک (ای‌اسپرت) مسابقه‌ی حرفه‌ای بازی‌های ویدیویی است؛ تیم‌ها و بازیکن‌ها در بازی‌هایی مثل لیگ افسانه‌ها، کانتر استرایک، دوتا ۲ و فیفا با هم رقابت می‌کنند و جوایز و تماشاگران میلیونی دارند. از دهه‌ی ۲۰۱۰ به صنعتی بزرگ با تیم‌ها، اسپانسرها و استادیوم‌ها تبدیل شده. منتقدان درباره‌ی «ورزش» بودنش بحث می‌کنند، اما مسابقه‌ای‌بودنش انکارشدنی نیست.',
      en: 'Esports is professional competitive video gaming; teams and players compete in games like League of Legends, Counter-Strike, Dota 2, and FIFA with million-dollar prizes and massive audiences. Since the 2010s it has become a big industry with teams, sponsors, and arenas. Critics debate whether it is a "sport", but its competitiveness is undeniable.'
    },
    {
      id: 'table_tennis_history',
      keywords: [
        'پینگ پونگ چیه',
        'تنیس روی میز چیه',
        'table tennis',
        'ping pong',
        'what is table tennis'
      ],
      weak: [
        'پینگ پونگ',
        'پینگ‌پونگ',
        'تنیس روی میز',
        'table tennis',
        'ping pong'
      ],
      weakSafe: true,
      hints: ['ورزش', 'راکت', 'توپ', 'sport', 'racket', 'ball'],
      fa: 'تنیس روی میز (پینگ‌پونگ) با راکت کوچک و توپ پلاستیکی روی میز با تور وسط بازی می‌شود؛ امتیازها تا ۱۱ و هر بازی بهترین از ۷ گیم است. در اواخر قرن نوزدهم در انگلستان به‌عنوان نسخه‌ی داخل سالن تنیس ساخته شد و از ۱۹۸۸ در المپیک است. چین قدرت بلامنازع آن است.',
      en: 'Table tennis (ping pong) is played with small paddles and a plastic ball on a table divided by a net; games go to 11 points, best of seven. It was created in late 19th-century England as an indoor version of tennis and became Olympic in 1988. China is its dominant power.'
    },
    {
      id: 'badminton_history',
      keywords: [
        'بدمینتون چیه',
        'تاریخچه بدمینتون',
        'badminton',
        'what is badminton'
      ],
      weak: ['بدمینتون', 'badminton'],
      weakSafe: true,
      hints: ['ورزش', 'راکت', 'پرنده', 'sport', 'racket', 'shuttle'],
      fa: 'بدمینتون با راکت سبک و توپِ پَر (شاتل‌کاک) در زمینی با تور وسط بازی می‌شود؛ هدف انداختن شاتل در زمین حریف است. ریشه‌اش به بازی‌های باستانی با پرنده و راکت می‌رسد و نامش از خانه‌ی بدمینتون در انگلستان قرن نوزدهم آمد. از ۱۹۹۲ در المپیک است و کشورهای آسیایی (چین، اندونزی، کره، مالزی) در آن می‌درخشند.',
      en: 'Badminton is played with light rackets and a feathered shuttlecock on a court divided by a net; the goal is landing the shuttle in the opponent side. Its roots go back to ancient battledore games, and its name comes from Badminton House in 19th-century England. Olympic since 1992, it is dominated by Asian nations such as China, Indonesia, Korea, and Malaysia.'
    },
    {
      id: 'handball_history',
      keywords: [
        'هندبال چیه',
        'قوانین هندبال',
        'handball',
        'what is handball',
        'handball rules'
      ],
      weak: ['هندبال', 'handball'],
      weakSafe: true,
      hints: ['ورزش', 'توپ', 'گل', 'sport', 'ball', 'goal'],
      fa: 'هندبال ورزش تیمی است که دو تیم هفت‌نفره (شش بازیکن و یک دروازه‌بان) با دست توپ را به دروازه‌ی حریف می‌اندازند. بازیکن بدون دریبل نمی‌تواند بیش از سه قدم با توپ بردارد. ریشه‌هایش در اروپای شمالی است و از ۱۹۷۲ در المپیک تابستانی حضور دارد؛ دانمارک، فرانسه و کشورهای اسکاندیناوی از قدرت‌هایش هستند.',
      en: 'Handball is a team sport where two teams of seven (six players and a goalkeeper) throw a ball with their hands into the opponent goal. A player may not take more than three steps with the ball without dribbling. It has roots in northern Europe, has been Olympic since 1972, and Denmark, France, and the Nordic countries are among its powers.'
    },
    {
      id: 'rugby_history',
      keywords: [
        'راگبی چیه',
        'قوانین راگبی',
        'rugby',
        'what is rugby',
        'rugby rules'
      ],
      weak: ['راگبی', 'rugby'],
      weakSafe: true,
      hints: ['ورزش', 'توپ', 'تیم', 'sport', 'ball', 'team'],
      fa: 'راگبی ورزش تیمی با توپ بیضی است که بازیکن‌ها با حمل توپ به پشت خط دروازه‌ی حریف (تری) گل می‌زنند؛ پاس رو به جلو با دست ممنوع است. طبق افسانه، در مدرسه‌ی راگبی انگلستان در ۱۸۲۳ یک دانش‌آموز توپ را برداشت و دوید و بازی از آنجا شکل گرفت. راگبی ۱۵ نفره (یونیون) و ۱۳ نفره (لیگ) دو شاخه‌ی اصلی‌اش هستند و جام جهانی راگبی مهم‌ترین تورنمنتش است.',
      en: 'Rugby is a team sport with an oval ball where players score tries by carrying the ball across the opponent goal line; passing the ball forward by hand is not allowed. Legend says a student at Rugby School in England picked up the ball and ran in 1823, and the game grew from there. Rugby union (15 players) and rugby league (13) are its main codes, and the Rugby World Cup is its biggest tournament.'
    },
    {
      id: 'golf_history',
      keywords: ['گلف چیه', 'قوانین گلف', 'golf', 'what is golf', 'golf rules'],
      weak: ['گلف', 'golf'],
      weakSafe: true,
      hints: ['ورزش', 'چوگان', 'توپ', 'sport', 'club', 'hole'],
      fa: 'گلف ورزشی است که در آن بازیکن با چوب‌های مختلف توپ را از نقطه‌ی شروع به سمت ۱۸ سوراخ زمین می‌زند و برنده کسی است که با کمترین ضربه تمام کند. ریشه‌اش به اسکاتلند قرن پانزدهم می‌رسد. تایگر وودز آمریکایی مشهورترین بازیکن مدرن آن است و مسابقات چهار گرنداسلم (مسترز، آزاد آمریکا، آزاد بریتانیا، پی‌جی‌ای) مهم‌ترین‌هایند.',
      en: 'Golf is a sport where players use various clubs to hit a ball from the tee toward 18 holes on a course, and the winner is the one who finishes with the fewest strokes. Its roots go back to 15th-century Scotland. Tiger Woods is its most famous modern player, and the four majors (Masters, US Open, Open Championship, PGA) are its biggest events.'
    },
    {
      id: 'formula_one_history',
      keywords: [
        'فرمول یک چیه',
        'مسابقات فرمول ۱',
        'formula one',
        'f1',
        'what is formula one'
      ],
      weak: ['فرمول یک', 'فرمول ۱', 'formula one', 'f1'],
      weakSafe: true,
      hints: ['ماشین', 'مسابقه', 'سرعت', 'car', 'race', 'speed'],
      fa: 'فرمول یک (F1) بالاترین کلاس مسابقات اتومبیل‌رانی جهان است؛ خودروهای تک‌نفره و فوق‌سریع در گرندپری‌های مختلف دور دنیا رقابت می‌کنند و امتیازها در پایان فصل قهرمان رانندگان و سازندگان را تعیین می‌کنند. اولین فصل‌اش ۱۹۵۰ بود. مایکل شوماخر و لوئیس همیلتون با هفت قهرمانی، رکوردداران تاریخ آن هستند و مکس ورشتپن نسل جدیدش را رهبری کرد.',
      en: 'Formula One (F1) is the highest class of world motor racing; single-seat, extremely fast cars compete in Grands Prix around the world, and season points decide the drivers and constructors champions. Its first season was 1950. Michael Schumacher and Lewis Hamilton share the record with seven titles each, and Max Verstappen led the new generation.'
    },
    {
      id: 'offside_rule',
      keywords: [
        'آفساید چیه',
        'قانون آفساید چیه',
        'آفساید یعنی چه',
        'offside rule',
        'what is offside',
        'offside in football',
        'offside explained simply'
      ],
      weak: ['آفساید', 'offside'],
      weakSafe: true,
      hints: ['فوتبال', 'گل', 'قانون', 'football', 'goal', 'rule'],
      fa: 'آفساید در فوتبال یعنی مهاجم هنگام دریافت پاس از هم‌تیمی، به بدنِ جلوتر از توپ و جلوتر از دو مدافع آخر حریف (یا آخرین مدافع) نزدیک‌تر به دروازه باشد. اگر در آن لحظه در بازی شرکت کند (لمس توپ یا دخالت)، خطا اعلام می‌شود. هم‌راستا بودن با مدافع آفساید نیست و آفساید فقط در نیمه‌ی زمین حریف حساب می‌شود.',
      en: 'In football, offside means an attacker is closer to the opponent goal than both the ball and the second-last defender when a teammate passes, and then takes part in play (touching the ball or interfering). Level with the defender is not offside, and offside only applies in the opponent half.'
    },
    {
      id: 'var_technology',
      keywords: [
        'وی ای آر چیه',
        'var چیه',
        'داور ویدیویی',
        'var technology',
        'what is var',
        'video assistant referee'
      ],
      weak: [
        'وی ای آر',
        'وی‌ای‌آر',
        'var',
        'داور ویدیویی',
        'video assistant referee'
      ],
      weakSafe: true,
      hints: ['فوتبال', 'داور', 'ویدیو', 'football', 'referee', 'video'],
      fa: 'وی‌ای‌آر (VAR) یعنی داور ویدیویی؛ تیمی از داوران پشت مانیتور به داور اصلی کمک می‌کنند تا در چهار نوع صحنه تصمیم درست بگیرد: گل، پنالتی، کارت قرمز مستقیم و اشتباه هویتی. فقط در این موارد می‌تواند داور را به بازبینی دعوت کند. از ۲۰۱۸ در جام جهانی فوتبال استفاده می‌شود و بحث‌های زیادی درباره‌ی توقف بازی و مرز دخالتش هست.',
      en: 'VAR (Video Assistant Referee) is a team of referees watching monitors who help the main referee get big decisions right in four situations: goals, penalties, direct red cards, and mistaken identity. They can only invite the referee to review those cases. It has been used at the World Cup since 2018 and remains debated over stoppages and its limits.'
    },
    {
      id: 'futsal_iran',
      keywords: [
        'فوتسال چیه',
        'فوتسال ایران',
        'تیم ملی فوتسال ایران',
        'futsal',
        'what is futsal',
        'iran futsal'
      ],
      weak: ['فوتسال', 'futsal'],
      weakSafe: true,
      hints: ['فوتبال', 'سالنی', 'ایران', 'football', 'indoor', 'iran'],
      fa: 'فوتسال نسخه‌ی سالنی فوتبال است: دو تیم پنج‌نفره (با دروازه‌بان) در زمین کوچک با توپ سنگین‌تر و کم‌بپر بازی می‌کنند و زمان تلف‌شده متوقف می‌شود. از اروگوئه و برزیل در دهه‌ی ۱۹۳۰ ریشه گرفته. تیم ملی فوتسال ایران از قدرت‌های ثابت آسیاست و بارها قهرمان جام ملت‌های آسیا شده و در جام جهانی به مراحل بالایی رسیده.',
      en: 'Futsal is the indoor version of football: two teams of five (including the goalkeeper) play on a small court with a heavier, low-bounce ball and stopped clock. It grew from Uruguay and Brazil in the 1930s. Iran national futsal team is a constant Asian power, has won the Asian Cup many times, and reached the later stages of the World Cup.'
    },
    {
      id: 'weightlifting_iran',
      keywords: [
        'وزنه برداری چیه',
        'وزنه‌برداری ایران',
        'تیم ملی وزنه‌برداری ایران',
        'weightlifting',
        'iran weightlifting',
        'what is weightlifting'
      ],
      weak: ['وزنه برداری', 'وزنه‌برداری', 'weightlifting'],
      weakSafe: true,
      hints: ['ورزش', 'المپیک', 'ایران', 'sport', 'olympic', 'iran'],
      fa: 'وزنه‌برداری ورزشی است که در آن دو حرکت اصلی یک‌ضرب و دوضرب انجام می‌شود و مجموع بهترین وزنه‌های دو حرکت برنده را مشخص می‌کند. از نخستین المپیک‌های مدرن حضور داشته. ایران در آن از قدرت‌های تاریخی جهان است: حسین رضازاده (رکورددار سنگین‌وزن در ۲۰۰۴)، بهداد سلیمی (قهرمان ۲۰۱۲) و کیانوش رستمی (قهرمان ۲۰۱۶) از نام‌های بزرگ آن‌اند.',
      en: 'Weightlifting consists of two lifts, the snatch and the clean and jerk, and the winner is decided by the total of best attempts. It has been in the Olympics since the early modern games. Iran is one of its historical powers: Hossein Rezazadeh (heavyweight record holder in 2004), Behdad Salimi (2012 champion), and Kianoush Rostami (2016 champion) are among its greats.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
