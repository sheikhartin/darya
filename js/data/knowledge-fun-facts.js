/**
 * Darya - curated fun-fact pool by category per language.
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  const FUN_FACTS = {
    fa: {
      science: [
        'آب می‌تواند همزمان بجوشد و یخ بزند: در «نقطه‌ی سه‌گانه»، دما و فشار به شکلی دقیق می‌شوند که هر سه حالت جامد، مایع و گاز هم‌زمان وجود دارند.',
        'عسل هرگز فاسد نمی‌شود؛ باستان‌شناسان عسل بیش از سه‌هزارساله را در مقبره‌های مصر پیدا کرده‌اند که هنوز خوراکی است.',
        'بادام‌زمینی در واقع آجیل نیست؛ یک حبوبات است و زیر خاک رشد می‌کند، نه روی درخت.',
        'نور از خورشید حدود هشت دقیقه و نیم طول می‌کشد تا به زمین برسد؛ یعنی خورشیدی که می‌بینی، هشت و نیم دقیقه پیش را نشان می‌دهد.',
        'استخوان انسان از بتن محکم‌تر است: یک تکه استخوان به اندازه‌ی قوطی کبریت می‌تواند حدود نه تن وزن را تحمل کند.',
        'شکلات سفید و تیره هر دو از یک دانه‌ی کاکائو می‌آیند؛ تفاوت در این است که سفید فقط کره‌ی کاکائو دارد و نه بخش تیره‌ی دانه.',
        'رعد و برق حدود پنج برابر داغ‌تر از سطح خورشید است: دمای آن می‌تواند به حدود سی هزار درجه‌ی سلسیوس برسد.',
        'ستاره‌های جهانِ قابل مشاهده از دانه‌های شن روی همه‌ی ساحل‌های زمین بیشترند.'
      ],
      space: [
        'روی زهره، یک روز از یک سال طولانی‌تر است: ۲۴۳ روز زمینی برای چرخش به دور خودش، ولی فقط ۲۲۵ روز برای گردش به دور خورشید.',
        'کهکشان راه شیری بوی تمشک و رام می‌دهد: اخترشناسان در ابر مولکولی نزدیک مرکز آن، ترکیبی پیدا کرده‌اند که همان بوی تمشک را دارد.',
        'زحل به‌قدری کم‌چگال است که اگر اقیانوسی به اندازه‌ی کافی بزرگ پیدا شود، روی آب شناور می‌ماند.',
        'یک قاشق چای‌خوری از ماده‌ی ستاره‌ی نوترونی حدود شش میلیارد تن وزن دارد؛ تقریباً وزن یک کوه.',
        'کامپیوتر آپولو ۱۱ که انسان را به ماه برد، قدرت پردازشی کمتری از یک ساعت دیجیتال امروزی داشت.',
        'خورشید حدود ۹۹٫۸ درصد از جرم کل منظومه‌ی شمسی را در خودش دارد.'
      ],
      animals: [
        'اختاپوس سه قلب و خون آبی دارد: دو قلب خون را به آبشش‌ها می‌فرستند و سومی به بقیه‌ی بدن.',
        'وامبت‌ها مدفوع مکعبی دارند؛ این شکل جلوی غلتیدن آن را می‌گیرد تا روی سنگ‌ها تثبیت شود.',
        'گاوها دوست صمیمی دارند: پژوهش‌ها نشان داده وقتی از دوستشان جدا می‌شوند، استرس می‌گیرند.',
        'تنبل‌ها می‌توانند تا چهل دقیقه نفس‌شان را حبس کنند، حتی بیشتر از دلفین‌ها.',
        'خرس‌های آبی (تاردیگرید) می‌توانند در خلأ فضا زنده بمانند و پرتوهای شدید را تحمل کنند.',
        'فیل‌ها تنها جانورانی هستند که نمی‌توانند بپرند.'
      ],
      history: [
        'کلئوپاترا به فرود انسان روی ماه نزدیک‌تر بود تا به ساخت اهرام: هرم بزرگ جیزه حدود ۲۵۶۰ پیش از میلاد ساخته شد و کلئوپاترا حدود ۳۰ پیش از میلاد می‌زیست.',
        'دانشگاه آکسفورد از امپراتوری آزتک قدیمی‌تر است: تدریس در آن از حدود ۱۰۹۶ میلادی آغاز شد.',
        'ماموت‌های پشمالو هنوز زنده بودند که اهرام ساخته شدند؛ جمعیت کوچکی از آن‌ها تا حدود ۱۶۵۰ پیش از میلاد در جزیره‌ای قطبی دوام آورد.',
        'رومی‌های باستان از ادرار به عنوان دهان‌شویه استفاده می‌کردند؛ آمونیاک آن دندان‌ها را سفید می‌کرد.',
        'کتابخانه‌ی باستانی اسکندریه یکی از بزرگ‌ترین گنجینه‌های دانش دنیای باستان بود.',
        'نخستین المپیک مدرن در ۱۸۹۶ در آتن برگزار شد و فقط چهارده کشور در آن شرکت کردند.',
        'برخلاف باور رایج، دیوار بزرگ چین با چشم غیرمسلح از فضا دیده نمی‌شود.',
        'ناپلئون یک بار در سال ۱۸۰۷ مورد حمله‌ی دسته‌ای از خرگوش‌ها قرار گرفت؛ یک شکار که اشتباه پیش رفت.'
      ],
      body: [
        'اثر زبان هر انسان، مثل اثر انگشت، یکتا است.',
        'معده‌ی انسان آن‌قدر اسید دارد که می‌تواند تیغ را در طول زمان حل کند؛ pH آن بین ۱٫۵ تا ۳٫۵ است.',
        'بدن انسان در طول زندگی به اندازه‌ی کافی بزاق تولید می‌کند که دو استخر شنای متوسط را پر کند.',
        'شبکیه و مغز در خواب، خاطرات روز را مرور و تثبیت می‌کنند.',
        'نوزادان با حدود سیصد استخوان به دنیا می‌آیند که برخی تا بزرگسالی به هم جوش می‌خورند و به ۲۰۶ می‌رسند.',
        'مغز انسان حدود بیست درصد از انرژی بدن را مصرف می‌کند، در حالی که فقط دو درصد وزن بدن است.'
      ],
      food: [
        'موز از نظر گیاه‌شناسی توت است، ولی توت‌فرنگی توت نیست.',
        'عسل هرگز فاسد نمی‌شود؛ نمونه‌های سه‌هزارساله‌ی خوراکی از مقبره‌های مصر کشف شده‌اند.',
        'بادام‌زمینی آجیل نیست؛ از خانواده‌ی حبوبات است.',
        'وانیل دومین ادویه‌ی گران‌قیمت دنیا بعد از زعفران است.',
        'بیشتر وازابی‌ای که در رستوران‌ها سرو می‌شود، وازابی واقعی نیست؛ ترکیبی از ترب و رنگ سبز است.',
        'پنیر قدیمی‌ترین غذای فرآوری‌شده‌ی شناخته‌شده است؛ ردپایش به بیش از هفت هزار سال پیش برمی‌گردد.'
      ],
      tech: [
        'اولین ماوس کامپیوتر در ۱۹۶۴ از چوب ساخته شد.',
        'صفحه‌کلید QWERTY طراحی شد تا تایپیست‌ها را کند کند و بازوهای ماشین تحریر قدیمی به هم گیر نکنند.',
        'ایمیل اسپم قبل از اینترنت مدرن، در سال ۱۹۷۸ ارسال شد و اسمش را از یک اسکچ مونتی پایتون گرفت.',
        'بزرگ‌ترین باتری جهان یک سد آبی در سوئیس است: آب را بالا می‌برد و موقع نیاز برق تولید می‌کند.',
        'اولین وب‌سایت جهان هنوز آنلاین است: یک صفحه‌ی ساده درباره‌ی وب جهانی که در ۱۹۹۱ ساخته شد.',
        'هر روز حدود ۳۳۰ میلیارد ایمیل در دنیا فرستاده می‌شود؛ یعنی حدود ۴۲ میلیون در هر ثانیه.'
      ],
      life: [
        'عادات کوچک و روزانه‌ی تکراری، مغز را بازسازی می‌کنند؛ یک قدم کوچک هر روز، از یک قدم بزرگ گاهی بهتر است.',
        'نوشتن دستی اطلاعات، حافظه را قوی‌تر از تایپ تقویت می‌کند؛ چون مغز را به پردازش عمیق‌تر وا می‌دارد.',
        'مغز در حالت استراحت هم فعال است؛ به همین دلیل بهترین ایده‌ها گاهی در حمام یا پیاده‌روی می‌آیند.',
        'محدودکردن انتخاب‌ها تصمیم‌گیری را آسان‌تر می‌کند؛ مغز با گزینه‌های زیاد خسته می‌شود.',
        'خواب کافی حافظه را تقویت می‌کند: آنچه قبل از خواب مرور می‌کنی، بهتر تثبیت می‌شود.',
        'گفتن «نمی‌دانم» یک مهارت است؛ دانستن محدودیت‌هایت، یادگیری واقعی را ممکن می‌کند.',
        'اثر «شروع تازه»: مردم در شروع یک هفته، ماه یا سال جدید انگیزه‌ی بیشتری برای شروع عادت‌ها دارند.',
        'انجام چند کار هم‌زمان معمولاً سریع‌تر نیست؛ جابه‌جایی توجه، هم زمان می‌گیرد هم دقت.'
      ],
      social: [
        'مردم معمولاً بعد از مکالمه، بیشتر از آنچه فکر می‌کنی از تو خوششان می‌آید؛ به این پدیده «شکاف علاقه» می‌گویند.',
        'گوش‌دادن واقعی - بدون فکرکردن به جواب بعدی - یکی از قوی‌ترین راه‌های صمیمی‌شدن است.',
        'پرسیدن سؤال‌های باز (که با «چطور» یا «چرا» شروع می‌شوند) گفتگو را گرم‌تر می‌کند.',
        'آدم‌ها بیشتر اشتباهات کوچکشان را می‌بخشند تا بی‌احترامی؛ مهربانی مهم‌تر از بی‌نقص‌بودن است.',
        'لبخند زدن، حتی وقتی حوصله نداری، حال خودت و طرف مقابل را بهتر می‌کند.',
        'راحتی در جمع یک استعداد ذاتی نیست؛ یک مهارت تمرینی است.',
        'حرف زدن با غریبه‌ها معمولاً مردم را شادتر از انتظارشان می‌کند.',
        'قدردانی کوچک و روزانه، حتی یک جمله‌ی کوتاه، رابطه‌ها را به مرور عمیق‌تر می‌کند.'
      ],
      relationship: [
        'جفت‌های راضی، به ازای هر تعارض، حدود پنج تعامل مثبت دارند.',
        'گوش‌دادن بدون قضاوت، سریع‌ترین راه برای نزدیک‌شدن به کسی است.',
        'مرزهای روشن، رابطه را سرد نمی‌کند؛ آن را امن‌تر و صمیمی‌تر می‌کند.',
        'بعد از دعوا، برگشتن به هم مهم‌تر از برنده‌شدن است.',
        'قدردانی کوچک و روزانه، قوی‌ترین پیش‌بینی‌کننده‌ی پایداری رابطه است.',
        'همه‌ی رابطه‌های سالم با رضایت شروع می‌شوند و رضایت همیشه قابل پس‌گرفتن است.'
      ],
      sports: [
        'مدال طلای المپیک از سال ۱۹۱۲ دیگر طلای خالص نیست؛ مدال‌های امروزی بیشتر نقره هستند با لایه‌ای نازک از طلا.',
        'بسکتبال در ابتدا با توپ فوتبال و دو سبد هلویی بازی می‌شد؛ سبدها کف نداشتند و توپ را با چوب از ته بیرون می‌آوردند.',
        'مسافت رسمی ماراتن، ۴۲٫۱۹۵ کیلومتر، در المپیک ۱۹۰۸ لندن تعیین شد تا مسابقه دقیقاً جلوی جایگاه سلطنتی تمام شود.',
        'شاتل‌کاک بدمینتون سریع‌ترین شیء در ورزش‌های راکتی است؛ سرعت آن در ضربه‌های حرفه‌ای به بیش از ۴۰۰ کیلومتر بر ساعت می‌رسد.',
        'در المپیک باستان، ورزشکاران برهنه رقابت می‌کردند و قهرمانان به جای مدال، تاجی از شاخه‌ی زیتون می‌گرفتند.',
        'توپ گلف بین ۳۰۰ تا ۵۰۰ گودی دارد؛ این فرورفتگی‌ها مقاومت هوا را کم می‌کنند و توپ را دورتر می‌برند.',
        'جیمز نایسمیت بسکتبال را در ۱۸۹۱ اختراع کرد تا دانشجویان در زمستان هم ورزش کنند؛ بازی اول فقط سیزده قانون داشت.'
      ],
      art: [
        'مونالیزای داوینچی ابرو ندارد؛ پژوهشگران می‌گویند یا هرگز کشیده نشده‌اند یا در طول قرن‌ها پاک شده‌اند.',
        'نقاشی‌های غار «لاسکو» در فرانسه حدود هفده‌هزار سال قدمت دارند و هنوز رنگ‌هایشان زنده است.',
        '«ونگوگ» در طول زندگی‌اش فقط یک نقاشی را فروخت؛ بقیه‌ی شهرتش بعد از مرگش آمد.',
        '«جیغ» مونک فقط یک نقاشی نیست؛ چهار نسخه‌ی جدا از آن وجود دارد که در موزه‌های مختلف نگهداری می‌شوند.',
        'رنگ آبی «اولترامارین» روزی از طلا گران‌تر بود؛ از سنگ کمیاب لاجورد ساخته می‌شد و فقط نقاشان ثروتمند از آن استفاده می‌کردند.',
        'پیکاسو از نوجوانی مثل یک نقاش حرفه‌ای طراحی می‌کرد؛ گفته می‌شود اولین کلمه‌ای که یاد گرفت «مداد» بود.'
      ],
      music: [
        'بتهوون بعد از ناشنوایی کامل هم به آهنگسازی ادامه داد؛ سمفونی نهمش را وقتی اجرا کرد که اصلاً نمی‌شنید.',
        'یک پیانوی بزرگ (گرند) بیش از دوازده‌هزار قطعه دارد و حدود دویست و پنجاه سیم.',
        'ویولن معمولاً از بیش از هفتاد قطعه‌ی چوبی جدا ساخته می‌شود که به هم چسبانده می‌شوند.',
        'کوتاه‌ترین آهنگ ضبط‌شده‌ی جهان فقط ۱٫۳۱۶ ثانیه است؛ اثری از گروه نپالم دث به نام «تو رنج می‌بری».',
        'آهنگ «تولدت مبارک» ابتدا به عنوان آهنگ «صبح بخیر» ساخته شد و بعدها شعر تولد گرفت.',
        'نت استاندارد «لا» (A4) که ارکسترها با آن کوک می‌شوند، در ۴۴۰ هرتز است.',
        'جان کیج قطعه‌ای به نام «۴۳۳» ساخت که تمام اجرایش چهار دقیقه و سی‌وسه ثانیه سکوت است؛ خودِ سکوت، موسیقی شد.'
      ],
      money: [
        'اسکناس‌های آمریکا از کاغذ ساخته نمی‌شوند؛ از ترکیبی از پنبه و کتان ساخته می‌شوند.',
        'کلمه‌ی انگلیسی «salary» (حقوق) از کلمه‌ی لاتین «salarium» آمده است؛ پولی که به سربازان رومی برای خرید نمک داده می‌شد.',
        'نخستین کارت اعتباری جهان، داینرز کلاب در ۱۹۵۰، از مقوا ساخته شده بود نه پلاستیک.',
        'یک اونس طلا را می‌توان آن‌قدر نازک کوبید که سطحی به اندازه‌ی یک زمین بسکتبال را بپوشاند.',
        'اسکناس یک‌دلاری به طور میانگین حدود ۶٫۶ سال در گردش می‌ماند؛ اسکناس صد دلاری حدود ۲۳ سال.',
        'به‌ره‌ی مرکب را «هشتمین شگفتی جهان» نامیده‌اند؛ جمله‌ای که اغلب به انیشتین نسبت داده می‌شود.',
        'بانک‌های اولیه در بین‌النهرین باستان غلات را نگهداری می‌کردند؛ اولین «سپرده‌های بانکی» گندم و جو بودند.'
      ]
    },
    en: {
      science: [
        'Water can boil and freeze at the same time: at the triple point, temperature and pressure align so all three states, solid, liquid, and gas, exist at once.',
        'Honey never spoils: archaeologists have found over 3,000-year-old honey in Egyptian tombs that is still edible.',
        'Peanuts are not nuts; they are legumes that grow underground, not on trees.',
        'Light from the Sun takes about eight and a half minutes to reach Earth, so you always see the Sun as it was eight minutes ago.',
        'Bone is stronger than concrete: a matchbox-sized piece of human bone can support about nine tons.',
        'White and dark chocolate both come from the same cacao bean; white chocolate just keeps the cocoa butter and drops the dark solids.',
        'Lightning is about five times hotter than the surface of the Sun, reaching around 30,000 degrees Celsius.',
        'There are more stars in the observable universe than grains of sand on all of Earth’s beaches.'
      ],
      space: [
        'On Venus, a day is longer than a year: 243 Earth days to spin once, but only 225 days to orbit the Sun.',
        'The Milky Way smells like raspberries and rum: astronomers found the compound behind that scent near its center.',
        'Saturn is so low in density that, given a big enough ocean, it would float on water.',
        'A teaspoon of neutron-star material weighs about six billion tons, roughly the weight of a mountain.',
        'The Apollo 11 computer that landed humans on the Moon had less processing power than a modern digital watch.',
        'The Sun holds about 99.8 percent of all the mass in the solar system.'
      ],
      animals: [
        'Octopuses have three hearts and blue blood: two pump blood to the gills, the third to the rest of the body.',
        'Wombats produce cube-shaped poop; the shape keeps it from rolling away so it stays put on rocks.',
        'Cows have best friends: research shows they get stressed when separated from their preferred companion.',
        'Sloths can hold their breath for up to forty minutes, longer than dolphins.',
        'Tardigrades (water bears) can survive the vacuum of space and intense radiation.',
        'Elephants are the only animals that cannot jump.'
      ],
      history: [
        'Cleopatra lived closer in time to the Moon landing than to the building of the pyramids: the Great Pyramid went up around 2560 BC, Cleopatra lived around 30 BC.',
        'Oxford University is older than the Aztec Empire: teaching there began around 1096 AD.',
        'Woolly mammoths were still alive when the pyramids were built; a small population survived on an Arctic island until about 1650 BC.',
        'Ancient Romans used urine as mouthwash; its ammonia whitened their teeth.',
        'The ancient Library of Alexandria was one of the greatest storehouses of knowledge in the ancient world.',
        'The first modern Olympics, held in Athens in 1896, had only fourteen countries taking part.',
        'Contrary to popular belief, the Great Wall of China is not visible from space with the naked eye.',
        'Napoleon was once attacked by a horde of rabbits, in 1807, during a hunt that went wrong.'
      ],
      body: [
        'Every human tongue print is unique, just like a fingerprint.',
        'Your stomach acid is strong enough to dissolve a razor blade over time; its pH is between 1.5 and 3.5.',
        'The human body produces enough saliva in a lifetime to fill two average swimming pools.',
        'Your brain reviews and consolidates the day’s memories while you sleep.',
        'Babies are born with about 300 bones; some fuse together by adulthood, leaving 206.',
        'The human brain uses about twenty percent of the body’s energy while being only two percent of its weight.'
      ],
      food: [
        'Botanically, bananas are berries, but strawberries are not.',
        'Honey never spoils; 3,000-year-old edible samples have been found in Egyptian tombs.',
        'Peanuts are legumes, not nuts.',
        'Vanilla is the second most expensive spice in the world after saffron.',
        'Most wasabi served in restaurants is not real wasabi; it is horseradish dyed green.',
        'Cheese is the oldest known processed food, with traces going back over 7,000 years.'
      ],
      tech: [
        'The first computer mouse, made in 1964, was built from wood.',
        'The QWERTY keyboard was designed to slow typists down so the arms of old typewriters would not jam.',
        'The first spam email was sent in 1978 and took its name from a Monty Python sketch.',
        'The largest battery in the world is a hydro plant in Switzerland that pumps water uphill and generates power when needed.',
        'The first website ever is still online: a simple page about the World Wide Web, created in 1991.',
        'Around 330 billion emails are sent every day, roughly 42 million per second.'
      ],
      life: [
        'Small daily habits rewire the brain; one small step every day often beats one huge step now and then.',
        'Writing by hand strengthens memory more than typing, because it forces deeper processing.',
        'Your brain stays active at rest, which is why great ideas sometimes arrive in the shower or on a walk.',
        'Fewer choices make decisions easier; the brain gets tired when options pile up.',
        'Good sleep strengthens memory: what you review before bed gets consolidated better.',
        'Saying "I do not know" is a skill; knowing your limits is what makes real learning possible.',
        'The fresh start effect: people feel more motivated to start habits at the start of a new week, month, or year.',
        'Multitasking is usually not faster; switching attention costs both time and accuracy.'
      ],
      social: [
        'People usually like you more after a conversation than you think they do; researchers call it the liking gap.',
        'Real listening, without planning your next reply, is one of the strongest ways to grow close to someone.',
        'Open questions that start with how or why make conversations warmer.',
        'People forgive small mistakes more easily than disrespect; kindness beats perfection.',
        'Smiling, even when you do not feel like it, brightens both your mood and theirs.',
        'Being at ease in a group is not a talent; it is a skill you practice.',
        'Talking to strangers usually makes people happier than they expect it to.',
        'Small daily gratitude, even a quick note, deepens relationships over time.'
      ],
      relationship: [
        'Satisfied couples have about five positive interactions for every conflict.',
        'Listening without judgment is the fastest way to feel close to someone.',
        'Clear boundaries do not cool a relationship; they make it safer and more intimate.',
        'After a fight, coming back together matters more than winning.',
        'Small daily appreciation is the strongest predictor of a lasting relationship.',
        'Every healthy relationship starts with consent, and consent can always be withdrawn.'
      ],
      sports: [
        'Olympic gold medals have not been solid gold since 1912; modern ones are mostly silver with a thin layer of gold.',
        'Basketball was first played with a soccer ball and two peach baskets; the baskets had no holes, so someone had to poke the ball out with a stick.',
        'The official marathon distance, 42.195 kilometers, was set at the 1908 London Olympics so the race could finish right in front of the royal box.',
        'A badminton shuttlecock is the fastest object in racket sports, reaching over 400 kilometers per hour on pro smashes.',
        'Ancient Olympic athletes competed naked, and winners received an olive wreath instead of a medal.',
        'A golf ball has between 300 and 500 dimples; those tiny pits reduce drag and make the ball fly farther.',
        'James Naismith invented basketball in 1891 so students had something to do indoors in winter; the first game had just thirteen rules.'
      ],
      art: [
        'The Mona Lisa has no eyebrows; researchers believe they were either never painted or have faded away over the centuries.',
        'The Lascaux cave paintings in France are about 17,000 years old, and their colors are still vivid.',
        'Van Gogh sold only one painting during his lifetime; the rest of his fame came after his death.',
        'The Scream is not one painting but four separate versions of the same image, held in different museums.',
        'The blue pigment ultramarine was once more expensive than gold; it was ground from the rare stone lapis lazuli, so only wealthy painters could afford it.',
        'Picasso was drawing like a professional by his early teens; some say his first word was "pencil".'
      ],
      music: [
        'Beethoven kept composing after going completely deaf; he conducted the premiere of his Ninth Symphony when he could not hear a note of it.',
        'A grand piano has more than 12,000 parts and around 250 strings.',
        'A violin is usually built from more than seventy separate pieces of wood, all glued together.',
        'The shortest recorded song in the world lasts just 1.316 seconds; it is called "You Suffer" by Napalm Death.',
        '"Happy Birthday" was originally written as a song called "Good Morning" and only got its birthday lyrics later.',
        'The tuning note A4, which orchestras tune to, vibrates at 440 hertz.',
        'John Cage wrote a piece called Four Thirty Three whose entire performance is four minutes and thirty-three seconds of silence; the silence itself became the music.'
      ],
      money: [
        'US dollar bills are not made of paper; they are a blend of cotton and linen.',
        'The English word "salary" comes from the Latin "salarium", the money paid to Roman soldiers to buy salt.',
        'The first credit card in the world, Diners Club in 1950, was made of cardboard, not plastic.',
        'An ounce of gold can be hammered thin enough to cover a basketball court.',
        'A one-dollar bill lasts about 6.6 years in circulation on average; a hundred-dollar bill lasts about 23 years.',
        'Compound interest has been called the eighth wonder of the world, a saying often credited to Einstein.',
        'The first banks in ancient Mesopotamia stored grain; the earliest bank deposits were wheat and barley.'
      ]
    }
  };
  global.DaryaFunFacts = FUN_FACTS;
})(typeof window !== 'undefined' ? window : globalThis);
