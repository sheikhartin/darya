/**
 * Darya - history of war and conflict, with emphasis on Iran and the
 * Middle East. Explanations distinguish causes, claimed reasons, triggers,
 * conduct, civilian impact, and outcome. Explaining a side's motive never
 * implies that every claim was true or every action lawful.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];

  const fact = (id, keywords, weak, fa, en, hints = []) => ({
    id,
    keywords,
    weak,
    weakSafe: true,
    hints,
    fa,
    en
  });

  global.DaryaFactChunks.push([
    fact(
      'war_history_framework',
      [
        'how should i study a war without bias',
        'how do historians explain both sides of a war',
        'neutral framework for understanding wars',
        'چطور یک جنگ را بی طرفانه بررسی کنم',
        'تاریخ نگارها دو طرف جنگ را چطور توضیح میدهند',
        'چارچوب بی طرفانه فهم جنگ'
      ],
      [
        'study war without bias',
        'both sides of war',
        'war history method',
        'بررسی بی طرفانه جنگ',
        'دو طرف جنگ',
        'روش تاریخ جنگ'
      ],
      'برای فهم جنگ شش چیز را جدا کن: زمینه‌ی بلندمدت، هدف هر بازیگر، ادعای عمومی، ماشه‌ی آغاز، رفتار در جنگ و پیامد. «هر طرف دلیلی داشت» به معنای درست‌بودن همه‌ی ادعاها یا برابربودن مسئولیت نیست. نام‌گذاری‌ها را هم ثبت کن؛ یک رویداد ممکن است در حافظه‌های مختلف نام دیگری داشته باشد. تاریخ، سند رسمی، نامه، خاطره، روزنامه و پژوهش بعدی را با زمان و جایگاه نویسنده مقایسه کن. آمار تلفات و انگیزه‌های پنهان اغلب محل اختلاف‌اند، پس بازه و عدم قطعیت را بگو. در پایان صدای غیرنظامیان، آوارگان و مخالفان جنگ را کنار فرماندهان ببین.',
      'Study a war in six separate layers: long-term conditions, each actor’s goals, public claims, the immediate trigger, conduct during war, and consequences. Saying every side had reasons does not make every claim true or responsibility equal. Record competing names because the same event can live differently in national memory. Compare official records, letters, testimony, contemporary reporting, and later scholarship while noting each source’s position and date. Casualty figures and hidden motives are often disputed, so preserve ranges and uncertainty. Include civilians, displaced people, and internal dissenters alongside leaders and armies.',
      ['source', 'cause', 'civilian', 'منبع', 'علت', 'غیرنظامی']
    ),
    fact(
      'war_ethics_law',
      [
        'is war always good or bad',
        'can a war ever be justified',
        'just war theory in simple terms',
        'آیا جنگ همیشه خوب یا بد است',
        'جنگ میتواند موجه باشد',
        'نظریه جنگ عادلانه ساده'
      ],
      [
        'war justified',
        'just war theory',
        'ethics of war',
        'توجیه جنگ',
        'جنگ عادلانه',
        'اخلاق جنگ'
      ],
      'درباره‌ی اخلاق جنگ سه دیدگاه اصلی وجود دارد: صلح‌گرایی به خشونت بدگمان یا مخالف آن است؛ واقع‌گرایی بر قدرت و بقا تمرکز می‌کند؛ نظریه‌ی جنگ عادلانه می‌پرسد آیا رفتن به جنگ علت موجه، مرجع مشروع، ضرورت و تناسب دارد و آیا در جنگ میان هدف نظامی و غیرنظامی فرق گذاشته می‌شود. دفاع از خود یکی از رایج‌ترین توجیه‌هاست، اما حتی جنگ دفاعی مجوز حمله‌ی عمدی به غیرنظامی، شکنجه یا رفتار نامحدود نیست. فهم علت‌های هر طرف برای تاریخ لازم است، اما مسئولیت‌ها را برابر نمی‌کند؛ ارزیابی سند، قانون و تناسب مرحله‌ای جداست. جنگ نه با یک شعار همیشه خوب می‌شود و نه رنج انسان‌ها با گفتن «هر دو طرف» محو می‌شود.',
      'Three broad traditions frame the ethics of war. Pacifism rejects or strongly presumes against violence; realism emphasizes power and survival; just-war theory asks whether resorting to war has a just cause, legitimate authority, necessity, and proportionality, and whether conduct distinguishes military targets from civilians. Self-defense is a common claimed justification, but even a defensive war does not license deliberate attacks on civilians, torture, or unlimited means. Understanding each side’s reasons is necessary history, but it does not make responsibility equal; evaluating evidence, law, necessity, and proportionality is a separate step. War is not made good by a slogan, and civilian suffering is not erased by saying both sides.',
      [
        'self defense',
        'proportionality',
        'civilian',
        'دفاع',
        'تناسب',
        'غیرنظامی'
      ]
    ),
    fact(
      'greco_persian_wars',
      [
        'what caused the greco persian wars',
        'greco persian wars both perspectives',
        'xerxes invasion of greece explained',
        'علت جنگ های ایران و یونان چه بود',
        'جنگ های هخامنشی و یونان از نگاه دو طرف',
        'حمله خشایارشا به یونان'
      ],
      [
        'greco persian wars',
        'persian wars greece',
        'xerxes greece',
        'جنگ ایران و یونان',
        'جنگ های هخامنشی',
        'خشایارشا یونان'
      ],
      'جنگ‌های ایران و یونان در اوایل سده‌ی پنجم پیش از میلاد از یک علت واحد نیامد. شورش شهرهای ایونی در قلمرو هخامنشی و پشتیبانی آتن از آن، برای شاهنشاهی مسئله‌ی کنترل مرز و تنبیه مداخله بود؛ برای بسیاری از دولت‌شهرهای یونانی، لشکرکشی‌های داریوش و خشایارشا تهدیدی علیه خودمختاری بود. یونانیان هم یکپارچه نبودند و بعضی دولت‌شهرها با ایران همکاری کردند. ماراتن، ترموپیل، سالامیس و پلاته مراحل متفاوت‌اند. بیشتر روایت‌های بازمانده یونانی‌اند، پس باید محدودیت منبع را دید. شکست لشکرکشی به سرزمین اصلی یونان پایان شاهنشاهی هخامنشی نبود؛ این امپراتوری مدت‌ها قدرت بزرگ منطقه ماند.',
      'The Greco-Persian Wars of the early fifth century BCE had no single cause. The Ionian Revolt and Athenian support made the conflict an imperial-border and intervention issue for the Achaemenids; many Greek city-states saw the later campaigns of Darius and Xerxes as threats to autonomy. The Greeks were not one united side, and some states cooperated with Persia. Marathon, Thermopylae, Salamis, and Plataea were different phases. Most surviving narratives are Greek, so source bias matters. Failure to conquer mainland Greece did not end the Achaemenid Empire, which remained a major power for generations.',
      ['achaemenid', 'greece', 'ionian', 'هخامنشی', 'یونان', 'ایونی']
    ),
    fact(
      'arab_conquest_iran',
      [
        'why did the sasanian empire fall to the arab conquest',
        'arab conquest of iran explained neutrally',
        'battle of qadisiyyah and nahavand',
        'چرا ساسانیان در فتح عرب شکست خوردند',
        'فتح ایران به دست اعراب بی طرفانه',
        'قادسیه و نهاوند چه بودند'
      ],
      [
        'arab conquest of iran',
        'fall of sasanians',
        'qadisiyyah',
        'فتح ایران',
        'سقوط ساسانیان',
        'قادسیه'
      ],
      'فتح ایران در سده‌ی هفتم میلادی هم نتیجه‌ی گسترش دولت نوپای خلافت بود و هم ضعف شدید ساسانیان. جنگ طولانی با بیزانس، بحران جانشینی پس از خسرو پرویز، رقابت اشراف، فشار مالی و فرسودگی نظامی توان دفاع را کم کرده بود. نیروهای خلافت انگیزه‌ی دینی، سیاسی و مادی داشتند و پس از پیروزی در عراق، منابع بیشتری به دست آوردند. قادسیه و نهاوند مهم بودند، اما تسلط بر سراسر فلات یک‌باره رخ نداد؛ بعضی مناطق جنگیدند، بعضی پیمان بستند و مقاومت و شورش ادامه یافت. فتح نظامی با عربی‌شدن کامل یکی نیست: زبان فارسی و سنت‌های اداری و فرهنگی ایران بعداً در جهان اسلامی اثر عمیق گذاشتند.',
      'The seventh-century conquest of Iran reflected both expansion by the new caliphal state and severe Sasanian weakness. The long Byzantine war, succession crisis after Khosrow II, elite rivalry, fiscal strain, and military exhaustion reduced defensive capacity. Caliphal forces had religious, political, and material motives and gained further resources after taking Iraq. Qadisiyyah and Nahavand mattered, but control of the plateau was not one instant event: some regions fought, some made treaties, and resistance continued. Military conquest was not complete cultural Arabization. Persian language, administration, and scholarship later profoundly shaped the Islamic world.',
      ['sasanian', 'caliphate', 'nahavand', 'ساسانی', 'خلافت', 'نهاوند']
    ),
    fact(
      'mongol_invasions_iran',
      [
        'why did the mongols invade iran',
        'mongol invasion of persia consequences',
        'khwarazmian mongol war explained',
        'چرا مغول ها به ایران حمله کردند',
        'پیامد حمله مغول به ایران',
        'جنگ خوارزمشاهیان و مغول'
      ],
      [
        'mongol invasion iran',
        'mongols persia',
        'khwarazmian war',
        'حمله مغول به ایران',
        'مغول و خوارزمشاه',
        'ایلخانان'
      ],
      'حمله‌ی مغول به قلمرو خوارزمشاهی در ۱۲۱۹ پس از تنش تجاری و قتل کاروان و فرستادگان چنگیزخان آغاز شد، اما در زمینه‌ی گسترش یک امپراتوری نظامی بسیار بزرگ رخ داد. واکنش خوارزمشاهیان پراکنده بود و شهرها جداگانه مقاومت کردند یا سقوط کردند. کشتار، ویرانی، جابه‌جایی و آسیب به شبکه‌های کشاورزی در بخش‌هایی از ایران و آسیای مرکزی فاجعه‌بار بود؛ عددهای منابع قرون وسطی همیشه قابل اعتماد نیستند. دوره‌ی بعد فقط ادامه‌ی ویرانی نبود: ایلخانان در ایران حکومت ساختند، اسلام پذیرفتند و در اداره، هنر و دانش سرمایه‌گذاری کردند. توضیح ماشه‌ی دیپلماتیک، خشونت گسترده‌ی فتح را توجیه نمی‌کند.',
      'The Mongol invasion of the Khwarazmian realm began in 1219 after a trade dispute and the killing of a caravan and Chinggis Khan’s envoys, within the wider expansion of a formidable empire. Khwarazmian response was fragmented, and cities resisted or fell separately. Mass killing, displacement, destruction, and damage to agricultural networks were catastrophic in parts of Iran and Central Asia, though medieval casualty numbers require caution. The later story was not only destruction: the Ilkhanate governed from Iran, converted to Islam, and supported administration, art, and scholarship. Explaining the diplomatic trigger does not excuse the scale of conquest violence.',
      ['khwarazm', 'chinggis', 'ilkhanate', 'خوارزم', 'چنگیز', 'ایلخان']
    ),
    fact(
      'ottoman_safavid_wars',
      [
        'why did the ottomans and safavids fight',
        'ottoman safavid wars explained',
        'battle of chaldiran causes',
        'چرا عثمانی و صفوی جنگیدند',
        'جنگ های صفوی عثمانی',
        'علت نبرد چالدران'
      ],
      [
        'ottoman safavid wars',
        'battle of chaldiran',
        'safavid ottoman rivalry',
        'جنگ صفوی عثمانی',
        'نبرد چالدران',
        'رقابت صفوی عثمانی'
      ],
      'رقابت صفوی و عثمانی از سده‌ی شانزدهم فقط دعوای شیعه و سنی نبود. کنترل آناتولی شرقی، عراق، قفقاز و راه‌های تجاری، امنیت مرز، شورش‌های قزلباش و مشروعیت دو امپراتوری در هم تنیده بود. دین زبان بسیج و هویت دولتی شد و شدت دشمنی را بالا برد. در چالدران ۱۵۱۴، توپخانه و سازمان نظامی عثمانی بر نیروی صفوی برتری یافت، اما جنگ‌ها دهه‌ها ادامه داشتند و مرزها چند بار تغییر کردند. پیمان زهاب در ۱۶۳۹ بخش مهمی از الگوی مرزی بعدی ایران و عثمانی را تثبیت کرد. جوامع مرزی، کردها، ارمنی‌ها، بازرگانان و روستاییان فقط تماشاگر نبودند و هزینه‌ی لشکرکشی‌ها را تحمل کردند.',
      'The Ottoman-Safavid rivalry from the sixteenth century was not simply Sunni versus Shia. Control of eastern Anatolia, Iraq, the Caucasus, and trade routes, border security, Qizilbash revolts, and competing imperial legitimacy were intertwined. Religion became a language of mobilization and state identity that intensified conflict. At Chaldiran in 1514, Ottoman artillery and organization prevailed, but wars continued for decades and borders moved repeatedly. The 1639 Treaty of Zuhab helped stabilize much of the later Iran-Ottoman frontier. Border communities, including Kurds, Armenians, merchants, and farmers, were actors as well as people who bore the costs of campaigns.',
      ['ottoman', 'safavid', 'border', 'عثمانی', 'صفوی', 'مرز']
    ),
    fact(
      'russo_persian_wars',
      [
        'what caused the russo persian wars',
        'russo persian wars both sides',
        'gulistan and turkmenchay treaties explained',
        'علت جنگ های ایران و روس چه بود',
        'جنگ قاجار و روس از نگاه دو طرف',
        'عهدنامه گلستان و ترکمانچای'
      ],
      [
        'russo persian wars',
        'gulistan treaty',
        'turkmenchay treaty',
        'جنگ ایران و روس',
        'عهدنامه گلستان',
        'عهدنامه ترکمانچای'
      ],
      'جنگ‌های روس و ایران در ۱۸۰۴ تا ۱۸۱۳ و ۱۸۲۶ تا ۱۸۲۸ بر سر قفقاز رخ دادند. امپراتوری روسیه به جنوب گسترش می‌یافت و امنیت، نفوذ و راه‌های قفقاز را دنبال می‌کرد؛ دولت قاجار آن مناطق را بخشی از حوزه‌ی تاریخی خود می‌دانست و در جنگ دوم می‌خواست زیان‌های قبلی را بازگرداند. الحاق گرجستان به روسیه و مناقشه بر سر خان‌نشین‌ها زمینه‌ی مستقیم ساخت. برتری سازمان و آتش روسیه، ضعف مالی و لجستیکی قاجار و ناکامی اتحادهای خارجی به شکست ایران کمک کرد. گلستان و ترکمانچای کنترل روسیه بر بخش بزرگی از قفقاز جنوبی را تثبیت و مرز ارس را مهم کردند. در حافظه‌ی ایرانی این پیمان‌ها نماد از دست‌رفتن سرزمین و نابرابری قدرت‌اند.',
      'The Russo-Persian Wars of 1804-1813 and 1826-1828 centered on the Caucasus. Imperial Russia expanded south in pursuit of security, influence, and routes; Qajar Iran regarded these lands as part of its historic sphere and in the second war sought to reverse earlier losses. Russia’s annexation of Georgia and disputes over the khanates formed the direct setting. Russian organization and firepower, Qajar financial and logistical weakness, and failed foreign alliances contributed to Iran’s defeat. The treaties of Gulistan and Turkmenchay consolidated Russian control across much of the South Caucasus and made the Aras a key border. In Iranian memory they symbolize territorial loss and unequal power.',
      ['qajar', 'russia', 'caucasus', 'قاجار', 'روسیه', 'قفقاز']
    ),
    fact(
      'iran_world_war_one',
      [
        'what happened to iran in world war one',
        'iran neutrality during world war i',
        'persia in the first world war',
        'ایران در جنگ جهانی اول چه شد',
        'بی طرفی ایران در جنگ جهانی اول',
        'قحطی ایران جنگ جهانی اول'
      ],
      [
        'iran world war one',
        'persia ww1',
        'iran neutrality 1914',
        'ایران جنگ جهانی اول',
        'ایران در جنگ اول',
        'بی طرفی قاجار'
      ],
      'ایران قاجاری در جنگ جهانی اول بی‌طرفی اعلام کرد، اما ضعف دولت مرکزی و موقعیت راهبردی باعث شد نیروهای روس، بریتانیا و عثمانی در بخش‌هایی از کشور عملیات کنند؛ آلمان نیز برای نفوذ سیاسی فعال بود. رقابت بر سر راه‌ها، مرزها و نفت، و جنگ عثمانی و روسیه در همسایگی، بی‌طرفی را بی‌اثر کرد. ناامنی، مصادره و اختلال تجارت همراه با خشکسالی و بیماری به قحطی و مرگ گسترده دامن زد. درباره‌ی شمار دقیق قربانیان اختلاف جدی وجود دارد و رقم‌های بسیار بزرگ را باید با منبع و روش سنجید. برای مردم ایران، این جنگ نمونه‌ای است از اینکه کشوری می‌تواند رسماً بی‌طرف باشد اما از رقابت قدرت‌های خارجی و ضعف داخلی آسیب ببیند.',
      'Qajar Iran declared neutrality in World War I, but weak central authority and strategic geography allowed Russian, British, and Ottoman forces to operate in parts of the country; Germany also pursued political influence. Competition over routes, frontiers, and oil, plus the neighboring Ottoman-Russian war, overwhelmed neutrality. Insecurity, requisition, and trade disruption combined with drought and disease to fuel famine and mass death. Exact mortality is heavily disputed, and very large figures should be evaluated by source and method. For Iranians, the war shows how a formally neutral country can still suffer from great-power rivalry and domestic state weakness.',
      ['qajar', 'neutral', 'famine', 'قاجار', 'بی طرف', 'قحطی']
    ),
    fact(
      'iran_world_war_two',
      [
        'why was iran invaded in world war two',
        'anglo soviet invasion of iran 1941',
        'persian corridor explained',
        'چرا ایران در جنگ جهانی دوم اشغال شد',
        'حمله انگلیس و شوروی به ایران ۱۳۲۰',
        'دالان پارسی چه بود'
      ],
      [
        'iran world war two',
        'anglo soviet invasion iran',
        'persian corridor',
        'ایران جنگ جهانی دوم',
        'اشغال ایران ۱۳۲۰',
        'دالان پارسی'
      ],
      'ایران در جنگ جهانی دوم نیز بی‌طرفی اعلام کرد، اما بریتانیا و شوروی در اوت ۱۹۴۱ حمله کردند. هدف‌های اعلام‌شده و عملی آنان شامل امن‌کردن نفت و مسیر تدارکات به شوروی، موسوم به دالان پارسی، و نگرانی از حضور اتباع و نفوذ آلمان بود. از نگاه متفقین این مسیر برای جنگ با آلمان نازی حیاتی بود؛ از نگاه ایران، حمله نقض حاکمیت و بی‌طرفی بود. ارتش ایران سریع شکست خورد، رضاشاه کناره‌گیری کرد و کشور تا پایان جنگ زیر حضور متفقین ماند. راه تدارکاتی به پیروزی متفقین کمک کرد، اما ایرانیان با تورم، کمبود، فشار بر حمل‌ونقل و بی‌ثباتی روبه‌رو شدند؛ ایران همچنین پناهگاه و مسیر عبور شمار زیادی از آوارگان لهستانی شد.',
      'Iran again declared neutrality in World War II, but Britain and the Soviet Union invaded in August 1941. Their stated and practical aims included securing oil and the supply route to the Soviet Union known as the Persian Corridor, alongside concern about German nationals and influence. For the Allies, the route was vital to fighting Nazi Germany; for Iran, invasion violated sovereignty and neutrality. Iranian forces were quickly defeated, Reza Shah abdicated, and Allied presence continued through the war. The corridor aided the Allied war effort, while Iranians faced inflation, shortages, transport pressure, and political instability. Iran also sheltered and transported many Polish refugees.',
      ['1941', 'britain', 'soviet', '۱۳۲۰', 'بریتانیا', 'شوروی']
    ),
    fact(
      'iran_iraq_war',
      [
        'what caused the iran iraq war',
        'iran iraq war explained without bias',
        'why did the iran iraq war continue after 1982',
        'علت جنگ ایران و عراق چه بود',
        'جنگ ایران و عراق بی طرفانه',
        'چرا جنگ بعد از ۱۳۶۱ ادامه پیدا کرد'
      ],
      [
        'iran iraq war',
        'iran imposed war',
        'sacred defense war',
        'جنگ ایران و عراق',
        'جنگ تحمیلی',
        'دفاع مقدس'
      ],
      'جنگ ایران و عراق با حمله‌ی گسترده‌ی عراق در سپتامبر ۱۹۸۰ آغاز شد. اختلاف مرزی بر اروندرود، رقابت برای قدرت در خلیج فارس، نگرانی حکومت بعث از انقلاب ایران، تصور ضعف ایران پس از انقلاب و هدف‌های ارضی و راهبردی عراق در تصمیم صدام نقش داشتند. ایران حمله را «جنگ تحمیلی» و دفاع خود را «دفاع مقدس» می‌نامد. ایران تا ۱۹۸۲ بیشتر سرزمین اشغال‌شده را پس گرفت؛ سپس تصمیم رهبری ایران برای ادامه‌ی جنگ در خاک عراق با هدف‌هایی مانند امنیت، غرامت و تغییر حکومت عراق، مرحله‌ی دیگری ساخت. عراق از سلاح شیمیایی استفاده کرد و شهرها، اسیران و غیرنظامیان دو کشور آسیب سنگین دیدند. حمایت خارجی از دو طرف نامتقارن بود و جنگ در ۱۹۸۸ با پذیرش آتش‌بس سازمان ملل پایان یافت. توضیح انگیزه‌ها، واقعیت آغاز جنگ با حمله‌ی عراق را تغییر نمی‌دهد.',
      'The Iran-Iraq War began with Iraq’s large-scale invasion in September 1980. The Shatt al-Arab boundary dispute, rivalry for Gulf power, Baathist fear of Iran’s revolution, perceptions of post-revolutionary Iranian weakness, and Iraqi territorial and strategic goals shaped Saddam Hussein’s decision. Iran calls it the Imposed War and its resistance the Sacred Defense. By 1982 Iran had recovered most occupied territory; Iranian leaders then continued into Iraq with goals including security, reparations, and changing the Iraqi government, creating a new phase. Iraq used chemical weapons, and cities, prisoners, and civilians in both countries suffered greatly. External support was uneven and complex. The war ended with a UN-backed ceasefire in 1988. Explaining motives does not change that Iraq initiated the full-scale war.',
      ['1980', '1988', 'shatt al arab', '۱۹۸۰', '۱۹۸۸', 'اروندرود']
    ),
    fact(
      'world_war_one_causes',
      [
        'what caused world war one',
        'why did the first world war start',
        'world war one causes both sides',
        'علت جنگ جهانی اول چه بود',
        'چرا جنگ جهانی اول شروع شد',
        'دلایل دو طرف جنگ جهانی اول'
      ],
      [
        'world war one causes',
        'first world war start',
        'july crisis',
        'علت جنگ جهانی اول',
        'شروع جنگ جهانی اول',
        'بحران ژوئیه'
      ],
      'ترور آرشیدوک فرانتس فردیناند در ۱۹۱۴ ماشه بود، نه تمام علت. رقابت امپراتوری‌ها، ملی‌گرایی، مسابقه‌ی تسلیحاتی، طرح‌های بسیج سریع، بحران‌های بالکان و اتحادها باعث شدند یک درگیری اتریش و صربستان زنجیره‌ای شود. اتریش-مجارستان می‌خواست تهدید ملی‌گرایی صرب را مهار کند؛ صربستان و روسیه خود را حامی منافع اسلاو می‌دیدند؛ آلمان از متحدش و موقعیت راهبردی خود نگران بود؛ فرانسه و بریتانیا محاسبات امنیتی و امپراتوری داشتند. این دلایل با هم مسئولیت تصمیم‌های مشخص را پاک نمی‌کنند. جنگ فرسایشی، فروپاشی امپراتوری‌ها و مرگ گسترده، نقشه‌ی اروپا و خاورمیانه را عوض کرد.',
      'The assassination of Archduke Franz Ferdinand in 1914 was the trigger, not the whole cause. Imperial competition, nationalism, arms races, rapid mobilization plans, Balkan crises, and alliances turned an Austria-Serbia conflict into a chain reaction. Austria-Hungary sought to contain Serbian nationalism; Serbia and Russia framed themselves as protecting Slavic interests; Germany feared for its ally and strategic position; France and Britain had security and imperial calculations. These motives do not erase responsibility for particular choices. Attrition, imperial collapse, and mass death reshaped Europe and the Middle East.',
      ['1914', 'alliances', 'balkans', '۱۹۱۴', 'اتحاد', 'بالکان']
    ),
    fact(
      'world_war_two_causes',
      [
        'what caused world war two',
        'why did the second world war start',
        'was versailles the only cause of world war two',
        'علت جنگ جهانی دوم چه بود',
        'چرا جنگ جهانی دوم شروع شد',
        'آیا ورسای تنها علت جنگ دوم بود'
      ],
      [
        'world war two causes',
        'second world war start',
        'versailles and hitler',
        'علت جنگ جهانی دوم',
        'شروع جنگ جهانی دوم',
        'ورسای و هیتلر'
      ],
      'جنگ جهانی دوم در اروپا با حمله‌ی آلمان نازی به لهستان در سپتامبر ۱۹۳۹ آغاز شد. نارضایتی از نظم ورسای، بحران اقتصادی، ضعف امنیت جمعی و سیاست مماشات زمینه ساختند، اما این‌ها تصمیم و ایدئولوژی توسعه‌طلب، نژادپرست و نسل‌کش نازی را اجتناب‌ناپذیر نمی‌کردند. آلمان به دنبال گسترش سرزمینی و سلطه بود؛ ایتالیا و ژاپن نیز پروژه‌های امپراتوری خود را داشتند. بریتانیا، فرانسه، شوروی و آمریکا در زمان‌ها و با محاسبات متفاوت وارد شدند. در آسیا جنگ ژاپن و چین پیش از ۱۹۳۹ جریان داشت، پس یک تاریخ شروع جهانی ساده نیست. توضیح زمینه با تقسیم مساوی مسئولیت فرق دارد.',
      'In Europe, World War II began with Nazi Germany’s invasion of Poland in September 1939. Resentment of the Versailles order, economic crisis, failed collective security, and appeasement formed conditions, but they did not make the Nazi regime’s expansionist, racist, and genocidal choices inevitable. Germany pursued territorial empire and domination; Italy and Japan had imperial projects of their own. Britain, France, the Soviet Union, and the United States entered at different times for different calculations. Japan’s war in China was already underway before 1939, so one global start date is imperfect. Explaining conditions is not the same as assigning equal responsibility.',
      ['1939', 'nazi', 'poland', '۱۹۳۹', 'نازی', 'لهستان']
    ),
    fact(
      'arab_israeli_wars',
      [
        'overview of the arab israeli wars',
        'arab israeli conflict history without taking sides',
        '1948 1967 1973 wars explained',
        'مرور جنگ های اعراب و اسرائیل',
        'مرور جنگ های اعراب و اسراییل',
        'تاریخ درگیری اعراب و اسرائیل بی طرفانه',
        'تاریخ درگیری اعراب و اسراییل بی طرفانه',
        'جنگ های ۱۹۴۸ و ۱۹۶۷ و ۱۹۷۳'
      ],
      [
        'arab israeli wars',
        'arab israel conflict history',
        '1948 war',
        'جنگ های اعراب و اسرائیل',
        'درگیری عرب اسرائیل',
        'جنگ ۱۹۴۸'
      ],
      'جنگ‌های عرب و اسرائیل را باید در پیوند با پایان قیمومت بریتانیا، جنبش صهیونیسم، ملی‌گرایی عرب، طرح تقسیم سازمان ملل و دو خواست ملی بر یک سرزمین دید. جنگ ۱۹۴۸ برای اسرائیلی‌ها جنگ استقلال و برای فلسطینیان با آوارگی گسترده «نکبت» است؛ نام‌ها دو تجربه‌ی واقعی متفاوت را نشان می‌دهند. بحران سوئز ۱۹۵۶ به ملی‌شدن کانال و مداخله‌ی اسرائیل، بریتانیا و فرانسه مربوط بود. در جنگ ۱۹۶۷ اسرائیل غزه، کرانه‌ی باختری، قدس شرقی، جولان و سینا را گرفت و اشغال و آوارگی به مسئله‌ای مرکزی تبدیل شد. مصر و سوریه در ۱۹۷۳ برای بازپس‌گیری سرزمین حمله کردند و جنگ بعداً به دیپلماسی مصر و اسرائیل کمک کرد. امنیت اسرائیلی‌ها، حق تعیین سرنوشت و آوارگی فلسطینیان و نقش دولت‌های عرب و قدرت‌های خارجی را باید هم‌زمان دید، بدون یکی‌کردن مسئولیت همه‌ی اقدامات.',
      'The Arab-Israeli wars grew from the end of the British Mandate, Zionism, Arab nationalism, the UN partition proposal, and two national movements claiming the same land. Israelis remember 1948 as the War of Independence; Palestinians remember mass displacement as the Nakba. The names preserve different lived histories. The 1956 Suez Crisis followed canal nationalization and intervention by Israel, Britain, and France. In 1967 Israel captured Gaza, the West Bank, East Jerusalem, the Golan Heights, and Sinai, making occupation and displacement central issues. Egypt and Syria attacked in 1973 seeking to recover territory, and the wterritory, and the war later helped open Egypt-Israel diplomacy. Israeli security, Palestinian self-determination and displacement, Arab-state choices, and outside powers all matter, without treating responsibility for every act as identical.',
      ['1948', '1967', '1973', '۱۹۴۸', '۱۹۶۷', '۱۹۷۳']
    ),
    fact(
      'suez_six_day_october_wars',
      [
        'difference between suez six day and yom kippur wars',
        'compare the 1956 1967 and 1973 middle east wars',
        'why did egypt and syria attack in 1973',
        'فرق جنگ سوئز شش روزه و اکتبر',
        'فرق جنگ سویز شش روزه و اکتبر',
        'مقایسه جنگ های ۱۹۵۶ ۱۹۶۷ و ۱۹۷۳',
        'چرا مصر و سوریه در ۱۹۷۳ حمله کردند'
      ],
      [
        'suez six day yom kippur',
        '1956 1967 1973 wars',
        'october war',
        'سوئز شش روزه اکتبر',
        'جنگ یوم کیپور',
        'جنگ رمضان'
      ],
      'این سه جنگ یکی نیستند. در ۱۹۵۶، ملی‌شدن کانال سوئز به حمله‌ی هماهنگ اسرائیل، بریتانیا و فرانسه به مصر انجامید و فشار آمریکا و شوروی به عقب‌نشینی کمک کرد. در ۱۹۶۷ تنش مرزی، بسیج نیروها، خروج نیروی سازمان ملل از سینا و بستن تنگه تیران در فضایی از ترس متقابل بالا گرفت؛ اسرائیل حمله‌ی پیش‌دستانه کرد و در شش روز سرزمین‌های بزرگی گرفت. در اکتبر ۱۹۷۳، مصر و سوریه برای شکستن بن‌بست و بازپس‌گیری سینا و جولان حمله کردند؛ اسرائیل پس از غافلگیری اولیه ضدحمله زد. نام‌های «یوم کیپور»، «اکتبر» و «رمضان» زاویه‌ی حافظه را نشان می‌دهند. نتیجه‌ی ۱۹۷۳ فقط نظامی نبود و مسیر مذاکره‌ی مصر و اسرائیل را تغییر داد.',
      'These were distinct wars. In 1956, Egypt’s nationalization of the Suez Canal led to coordinated intervention by Israel, Britain, and France; US and Soviet pressure helped force withdrawal. In 1967, border conflict, mobilization, removal of UN forces from Sinai, and closure of the Straits of Tiran escalated mutual fear; Israel launched a preemptive strike and captured large territories in six days. In October 1973, Egypt and Syria attacked to break the stalemate and recover Sinai and the Golan Heights; Israel counterattacked after initial surprise. The names Yom Kippur, October, and Ramadan War reflect different memories. The 1973 outcome was not only military and changed the path toward Egyptian-Israeli diplomacy.',
      ['suez', 'sinai', 'golan', 'سوئز', 'سینا', 'جولان']
    ),
    fact(
      'gulf_wars_iraq',
      [
        'difference between the gulf war and iraq war',
        'why did iraq invade kuwait in 1990',
        'why did the us invade iraq in 2003',
        'فرق جنگ خلیج فارس و جنگ عراق',
        'چرا عراق در ۱۹۹۰ به کویت حمله کرد',
        'چرا آمریکا در ۲۰۰۳ به عراق حمله کرد'
      ],
      [
        'gulf war iraq war',
        'iraq kuwait invasion',
        'iraq 2003 invasion',
        'جنگ خلیج فارس',
        'حمله عراق به کویت',
        'حمله ۲۰۰۳ عراق'
      ],
      'دو جنگ را نباید یکی گرفت. عراق در اوت ۱۹۹۰ پس از اختلاف بر سر بدهی، نفت، مرز و ادعاهای صدام درباره‌ی کویت به آن کشور حمله و آن را اشغال کرد. ائتلافی با مجوز شورای امنیت در ۱۹۹۱ نیروهای عراق را از کویت بیرون راند، اما حکومت صدام ماند و تحریم و درگیری‌های بعدی ادامه یافت. در ۲۰۰۳ آمریکا و متحدانش بدون همان نوع مجوز روشن جدید، عراق را با ادعاهای سلاح کشتارجمعی و پیوندهای امنیتی حمله کردند؛ ذخایر ادعاشده پیدا نشد. سقوط صدام با فروپاشی نهادها، شورش، خشونت فرقه‌ای و ظهور گروه‌های افراطی همراه شد. مخالفت با حکومت صدام و ارزیابی قانونی یا راهبردی حمله‌ی ۲۰۰۳ دو پرسش جدا هستند.',
      'The two wars should not be collapsed. Iraq invaded and occupied Kuwait in August 1990 after disputes over debt, oil, borders, and Saddam Hussein’s claims about Kuwait. A UN-authorized coalition expelled Iraqi forces in 1991, while Saddam’s government remained and sanctions and later confrontations continued. In 2003 the United States and allies invaded without the same kind of clear new Security Council authorization, citing weapons of mass destruction and security links; the alleged stockpiles were not found. Saddam’s fall was followed by institutional collapse, insurgency, sectarian violence, and the rise of extremist groups. Opposition to Saddam’s rule and the legal or strategic judgment of the 2003 invasion are separate questions.',
      ['1990', '1991', '2003', '۱۹۹۰', '۱۹۹۱', '۲۰۰۳']
    ),
    fact(
      'afghanistan_modern_wars',
      [
        'overview of the modern wars in afghanistan',
        'soviet and us wars in afghanistan compared',
        'why has afghanistan had decades of war',
        'مرور جنگ های معاصر افغانستان',
        'مقایسه جنگ شوروی و آمریکا در افغانستان',
        'چرا افغانستان دهه ها جنگ داشته'
      ],
      [
        'afghanistan wars',
        'soviet afghan war',
        'us war afghanistan',
        'جنگ های افغانستان',
        'جنگ شوروی افغانستان',
        'جنگ آمریکا افغانستان'
      ],
      'جنگ‌های معاصر افغانستان یک خط ساده نیستند. پس از کودتا و بحران حکومت کمونیستی، شوروی در ۱۹۷۹ مداخله کرد و با مجاهدینی جنگید که از پاکستان، آمریکا، عربستان و دیگران کمک می‌گرفتند. خروج شوروی در ۱۹۸۹ صلح نیاورد؛ فروپاشی دولت، جنگ داخلی و رقابت فرماندهان زمینه‌ی ظهور طالبان را ساخت. پس از حملات ۱۱ سپتامبر، آمریکا در ۲۰۰۱ با هدف القاعده و برکناری طالبان مداخله کرد و سپس پروژه‌ی دولت‌سازی طولانی شد. فساد، پناهگاه‌های برون‌مرزی، سیاست محلی، تلفات غیرنظامی و وابستگی دولت به حمایت خارجی بر نتیجه اثر گذاشتند. با خروج نیروهای آمریکا و متحدان در ۲۰۲۱، طالبان دوباره قدرت گرفت. مردم افغانستان بار چندین پروژه‌ی داخلی و خارجی را حمل کردند؛ هیچ توضیح تک‌علتی کافی نیست.',
      'Afghanistan’s modern wars are not one simple line. After a coup and crisis in the communist government, the Soviet Union intervened in 1979 and fought mujahideen supported by Pakistan, the United States, Saudi Arabia, and others. Soviet withdrawal in 1989 did not bring peace; state collapse, civil war, and commander rivalry helped produce the Taliban. After the September 11 attacks, the United States intervened in 2001 to target al-Qaeda and remove the Taliban, followed by a long state-building project. Corruption, cross-border sanctuaries, local politics, civilian harm, and dependence on external support shaped the outcome. The Taliban returned to power as US and allied forces left in 2021. Afghans bore the cost of multiple internal and external projects; no single-cause story is enough.',
      ['1979', '2001', '2021', '۱۹۷۹', '۲۰۰۱', '۲۰۲۱']
    ),
    fact(
      'lebanese_civil_war',
      [
        'what caused the lebanese civil war',
        'lebanon civil war explained without bias',
        'regional powers in the lebanese civil war',
        'علت جنگ داخلی لبنان چه بود',
        'جنگ داخلی لبنان بی طرفانه',
        'نقش قدرت های منطقه در جنگ لبنان'
      ],
      [
        'lebanese civil war',
        'lebanon war 1975',
        'جنگ داخلی لبنان',
        'جنگ لبنان ۱۹۷۵'
      ],
      'جنگ داخلی لبنان از ۱۹۷۵ تا ۱۹۹۰ نتیجه‌ی یک دشمنی مذهبی ساده نبود. نظام سیاسی فرقه‌ای، نابرابری، تغییر جمعیت، حضور مسلح فلسطینیان پس از اخراج از اردن، ضعف دولت و رقابت رهبران محلی روی هم افتادند. شبه‌نظامیان مسیحی، گروه‌های فلسطینی، احزاب و نیروهای مسلمان و دروزی ائتلاف‌های متغیر داشتند؛ سوریه و اسرائیل مداخله کردند و ایران، آمریکا و دیگران نیز نقش‌هایی داشتند. کشتار غیرنظامیان، ربایش و جابه‌جایی از چندین طرف رخ داد، اما هر رویداد باید جدا و مستند بررسی شود. توافق طائف به پایان رسمی جنگ کمک کرد، ولی تقسیم قدرت، سلاح گروه‌ها، مداخله خارجی و حافظه‌ی حل‌نشده باقی ماندند.',
      'The Lebanese Civil War of 1975-1990 was not a simple ancient religious feud. A sectarian political system, inequality, demographic change, armed Palestinian presence after expulsion from Jordan, state weakness, and rival local leaders overlapped. Christian militias, Palestinian organizations, and Muslim and Druze parties formed shifting alliances; Syria and Israel intervened, while Iran, the United States, and others also played roles. Civilian massacres, abductions, and displacement involved multiple actors, but each event needs specific evidence rather than a blanket both-sides phrase. The Taif Agreement helped formally end the war, while power sharing, armed groups, outside influence, and unresolved memory remained.',
      ['1975', '1990', 'taif', '۱۹۷۵', '۱۹۹۰', 'طائف']
    ),
    fact(
      'crusades_middle_east',
      [
        'what caused the crusades',
        'crusades from christian and muslim perspectives',
        'were the crusades only about religion',
        'علت جنگ های صلیبی چه بود',
        'جنگ های صلیبی از نگاه مسیحی و مسلمان',
        'آیا جنگ صلیبی فقط مذهبی بود'
      ],
      [
        'crusades causes',
        'christian muslim crusades',
        'جنگ های صلیبی',
        'علت جنگ صلیبی'
      ],
      'جنگ‌های صلیبی از اواخر سده‌ی یازدهم ترکیبی از دین، سیاست، زیارت، امنیت، زمین و رقابت نخبگان بودند. درخواست کمک بیزانس در برابر سلجوقیان و دعوت پاپ اوربان دوم زمینه‌ی لشکرکشی نخست شد؛ جنگجویان انگیزه‌های ایمانی، جایگاه، غنیمت و ماجراجویی متفاوت داشتند. جوامع مسلمان یک بلوک واحد نبودند و اختلاف دولت‌ها ابتدا پاسخ هماهنگ را دشوار کرد؛ بعدها رهبرانی مانند زنگی، نورالدین و صلاح‌الدین بسیج ضدصلیبی ساختند. فتح اورشلیم در ۱۰۹۹ با کشتار همراه بود و جنگ‌های بعدی نیز غیرنظامیان ادیان مختلف را آسیب زدند. همکاری و تجارت در کنار جنگ هم وجود داشت. تعبیر این دوره به دشمنی ابدی اسلام و مسیحیت، پیچیدگی و فاصله‌ی تاریخی را از بین می‌برد.',
      'The Crusades from the late eleventh century combined religion, politics, pilgrimage, security, land, and elite competition. A Byzantine request for help against the Seljuks and Pope Urban II’s call framed the First Crusade; participants mixed devotional, status, material, and adventurous motives. Muslim societies were not one bloc, and rivalry among states initially limited coordinated response; later leaders including Zengi, Nur al-Din, and Saladin built counter-crusading coalitions. The 1099 capture of Jerusalem involved massacre, and later wars also harmed civilians of different faiths. Cooperation and trade existed alongside war. Treating the era as timeless hostility between Islam and Christianity erases complexity and historical distance.',
      ['jerusalem', 'saladin', 'byzantine', 'اورشلیم', 'صلاح الدین', 'بیزانس']
    )
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
